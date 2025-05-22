const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");

// Multer Storage for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Role helpers
const isAdmin = (user) => user?.role === "admin";
const isSeller = (user) => user?.role === "seller";

// POST /api/products/add - Add a product by a seller
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const user = req.user;

    if (!isSeller(user)) {
      return res
        .status(403)
        .json({ message: "Only sellers can add products." });
    }

    const { name, subcategory_id, description, price, quantity } = req.body;

    if (
      !name ||
      !subcategory_id ||
      !description ||
      !price ||
      !quantity ||
      !req.file
    ) {
      return res.status(400).json({
        message:
          "All fields including valid numeric fields and image are required.",
      });
    }

    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseInt(quantity);

    if (isNaN(parsedPrice) || isNaN(parsedQuantity)) {
      return res
        .status(400)
        .json({ message: "Price and Quantity must be valid numbers." });
    }

    const sql = `
      INSERT INTO products (name, subcategory_id, description, price, quantity, image_url, seller_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const imageUrl = "/uploads/" + req.file.filename;

    const [result] = await db
      .promise()
      .query(sql, [
        name,
        subcategory_id,
        description,
        parsedPrice,
        parsedQuantity,
        imageUrl,
        user.id,
      ]);

    const newProduct = {
      id: result.insertId,
      name,
      subcategory_id,
      description,
      price: parsedPrice,
      quantity: parsedQuantity,
      image_url: imageUrl,
      seller_id: user.id,
    };

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/products/my-products - Get products created by the logged-in seller
router.get("/my-products", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    if (!isSeller(user)) {
      return res
        .status(403)
        .json({ message: "Only sellers can view their products." });
    }

    const sql = `
      SELECT p.id, p.name, p.description, p.price, p.quantity, p.image_url,
             sc.name AS subcategoryName,
             c.name AS categoryName
      FROM products p
      JOIN subcategories sc ON p.subcategory_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      WHERE p.seller_id = ?
      ORDER BY p.id DESC
    `;

    const [rows] = await db.promise().query(sql, [user.id]);

    res.json({ products: rows });
  } catch (err) {
    console.error("Get seller products error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
