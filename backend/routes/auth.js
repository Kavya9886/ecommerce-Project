const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");

const query = promisify(db.query).bind(db);
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Helper: Get full image URL
function getFullUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

// Middleware to verify token and extract user
function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}
// 🔐 Signup
router.post("/signup", upload.single("image"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const imageUrl = req.file
      ? getFullUrl(req, req.file.filename)
      : "https://i.pravatar.cc/150?img=3";

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query(
      "INSERT INTO users (name, email, password, role, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, imageUrl]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: err.message });
  }
});

// 🔑 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const results = await query("SELECT * FROM users WHERE email = ?", [email]);

    if (results.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image_url: user.image_url,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get details of the logged-in user
router.get("/users/me", authMiddleware, async (req, res) => {
  try {
    // Fetch user details by id from token payload
    const results = await query(
      "SELECT id, name, email, role, image_url FROM users WHERE id = ?",
      [req.user.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📦 Update user profile (name, email, password, and image)
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const image = req.file ? getFullUrl(req, req.file.filename) : null;

      const updates = [];
      const values = [];

      if (name) {
        updates.push("name = ?");
        values.push(name);
      }
      if (email) {
        updates.push("email = ?");
        values.push(email);
      }
      if (password) {
        updates.push("password = ?");
        values.push(password); // Make sure to hash in production
      }
      if (image) {
        // Delete old image if it exists
        const [result] = await query(
          "SELECT image_url FROM users WHERE id = ?",
          [req.user.id]
        );
        const oldImage = result?.image_url;
        if (oldImage) {
          const filename = oldImage.split("/uploads/")[1];
          fs.unlink(path.join("uploads", filename), () => {});
        }

        updates.push("image_url = ?");
        values.push(image);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      values.push(req.user.id);
      await query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      res.json({ message: "Profile updated successfully", image_url: image });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// 🗑 Delete own image
router.delete("/delete-image", authMiddleware, async (req, res) => {
  try {
    const [result] = await query("SELECT image_url FROM users WHERE id = ?", [
      req.user.id,
    ]);
    const imageUrl = result?.image_url;
    if (imageUrl) {
      const filename = imageUrl.split("/uploads/")[1];
      fs.unlink(path.join("uploads", filename), () => {});
    }
    await query("UPDATE users SET image_url = NULL WHERE id = ?", [
      req.user.id,
    ]);
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👑 Admin: Get all users
router.get("/admin/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  try {
    const users = await query(
      "SELECT id, name, email, role, image_url FROM users"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👑 Admin: Delete user
router.delete("/admin/users/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  try {
    const [result] = await query("SELECT image_url FROM users WHERE id = ?", [
      req.params.id,
    ]);
    const imageUrl = result?.image_url;
    if (imageUrl) {
      const filename = imageUrl.split("/uploads/")[1];
      fs.unlink(path.join("uploads", filename), () => {});
    }

    await query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👑 Admin: Edit user
router.put(
  "/admin/users/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    try {
      const { name, email, role } = req.body;
      const image = req.file ? getFullUrl(req, req.file.filename) : null;

      const updates = [];
      const params = [];

      if (name) {
        updates.push("name = ?");
        params.push(name);
      }
      if (email) {
        updates.push("email = ?");
        params.push(email);
      }
      if (role) {
        updates.push("role = ?");
        params.push(role);
      }
      if (image) {
        updates.push("image_url = ?");
        params.push(image);
      }

      if (updates.length === 0)
        return res.status(400).json({ message: "No data to update" });

      params.push(req.params.id);
      await query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        params
      );

      res.json({ message: "User updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
