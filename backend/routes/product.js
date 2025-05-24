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

// ================================
// SELLER: Add a product
// ================================
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
// ================================
// SELLER: Update a product
// ================================
router.put(
  "/update/:productId",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const user = req.user;
      const { productId } = req.params;

      if (!isSeller(user)) {
        return res
          .status(403)
          .json({ message: "Only sellers can update products." });
      }

      // Check if product belongs to seller
      const [[existingProduct]] = await db
        .promise()
        .query("SELECT * FROM products WHERE id = ? AND seller_id = ?", [
          productId,
          user.id,
        ]);

      if (!existingProduct) {
        return res
          .status(404)
          .json({ message: "Product not found or access denied." });
      }

      // Extract fields from body
      const { name, subcategory_id, description, price, quantity } = req.body;

      if (!name || !subcategory_id || !description || !price || !quantity) {
        return res
          .status(400)
          .json({ message: "All fields except image are required." });
      }

      const parsedPrice = parseFloat(price);
      const parsedQuantity = parseInt(quantity);

      if (isNaN(parsedPrice) || isNaN(parsedQuantity)) {
        return res
          .status(400)
          .json({ message: "Price and Quantity must be valid numbers." });
      }

      let imageUrl = existingProduct.image_url;

      if (req.file) {
        imageUrl = "/uploads/" + req.file.filename;
        // optionally delete old image from storage if you want
      }

      const sql = `
        UPDATE products
        SET name = ?, subcategory_id = ?, description = ?, price = ?, quantity = ?, image_url = ?
        WHERE id = ? AND seller_id = ?
      `;

      await db
        .promise()
        .query(sql, [
          name,
          subcategory_id,
          description,
          parsedPrice,
          parsedQuantity,
          imageUrl,
          productId,
          user.id,
        ]);

      res.json({
        id: parseInt(productId),
        name,
        subcategory_id,
        description,
        price: parsedPrice,
        quantity: parsedQuantity,
        image_url: imageUrl,
        seller_id: user.id,
      });
    } catch (err) {
      console.error("Update product error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ================================
// SELLER: Delete a product
// ================================
// DELETE /api/products/delete/:id
// SELLER: Delete a product (callback style)
// Soft delete product
router.put("/soft-delete/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const sellerId = req.user.id;

  const sql = `
    UPDATE products 
    SET is_active = 0 
    WHERE id = ? AND seller_id = ?
  `;

  db.query(sql, [id, sellerId], (err, result) => {
    if (err) {
      console.error("Soft delete error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Product not found or not owned by the current seller.",
      });
    }

    res.json({ message: "Product deactivated (soft deleted) successfully." });
  });
});

// ================================
// SELLER: Get products added by logged-in seller
// ================================
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
    WHERE p.seller_id = ? AND p.is_active = 1
    ORDER BY p.id DESC
  `;

    const [rows] = await db.promise().query(sql, [user.id]);

    res.json({ products: rows });
  } catch (err) {
    console.error("Get seller products error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================================
// CUSTOMER: Get all products (public)
// ================================
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT p.id, p.name, p.description, p.price, p.quantity, p.image_url,
             sc.name AS subcategoryName,
             c.name AS categoryName
      FROM products p
      JOIN subcategories sc ON p.subcategory_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      ORDER BY p.id DESC
    `;

    const [rows] = await db.promise().query(sql);
    res.json({ products: rows });
  } catch (err) {
    console.error("Get all products error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================================
// CUSTOMER: Get products by subcategory (public)
// ================================
router.get("/subcategory/:subcategoryId", async (req, res) => {
  const { subcategoryId } = req.params;
  try {
    const sql = `
      SELECT p.id, p.name, p.description, p.price, p.quantity, p.image_url,
             sc.name AS subcategoryName,
             c.name AS categoryName
      FROM products p
      JOIN subcategories sc ON p.subcategory_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      WHERE p.subcategory_id = ?
      ORDER BY p.id DESC
    `;

    const [rows] = await db.promise().query(sql, [subcategoryId]);
    res.json({ products: rows });
  } catch (err) {
    console.error("Get products by subcategory error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
