const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const isAdmin = require("../middleware/isAdmin");
const getBaseUrl = require("../utils/getBaseUrl");

// ➕ Add category (admin only)
router.post(
  "/add",
  verifyToken,
  isAdmin,
  upload.single("image"),
  (req, res) => {
    const { name } = req.body;

    if (!name || !req.file) {
      return res
        .status(400)
        .json({ message: "Category name and image are required" });
    }

    const image_url = `${getBaseUrl(req)}/uploads/${req.file.filename}`;

    const sql = `INSERT INTO categories (name, image_url) VALUES (?, ?)`;
    db.query(sql, [name, image_url], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      const getCategoryQuery = "SELECT * FROM categories WHERE id = ?";
      db.query(getCategoryQuery, [result.insertId], (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res
          .status(201)
          .json({ message: "Category created", category: results[0] });
      });
    });
  }
);

// 🌐 Get all categories
router.get("/", (req, res) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

// 🔄 Update category (admin only)
router.put("/:id", verifyToken, isAdmin, upload.single("image"), (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const image_url = req.file
    ? `${getBaseUrl(req)}/uploads/${req.file.filename}`
    : null;

  const updateQuery = `
    UPDATE categories 
    SET name = ?, image_url = COALESCE(?, image_url)
    WHERE id = ?
  `;

  db.query(updateQuery, [name, image_url, categoryId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    const getCategoryQuery = "SELECT * FROM categories WHERE id = ?";
    db.query(getCategoryQuery, [categoryId], (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res
        .status(200)
        .json({ message: "Category updated", category: results[0] });
    });
  });
});

// ❌ Delete category (admin only)
router.delete("/:id", verifyToken, isAdmin, (req, res) => {
  const categoryId = req.params.id;

  const sql = "DELETE FROM categories WHERE id = ?";
  db.query(sql, [categoryId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  });
});

// 🔍 Get single category by ID
router.get("/:id", (req, res) => {
  const categoryId = req.params.id;
  const sql = "SELECT * FROM categories WHERE id = ?";
  db.query(sql, [categoryId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(results[0]);
  });
});

module.exports = router;
