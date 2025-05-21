const express = require("express");
const router = express.Router();
const db = require("../db");
const { promisify } = require("util");
const { verifyToken } = require("../middleware/authMiddleware");

const query = promisify(db.query).bind(db);

// 🔐 Middleware to check customer role
const requireCustomer = (req, res, next) => {
  if (req.user.role !== "customer") {
    return res
      .status(403)
      .json({ message: "Only customers can perform this action" });
  }
  next();
};

// ✅ Add product to cart
router.post("/add", verifyToken, requireCustomer, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;

    if (!product_id || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Valid product ID and quantity required" });
    }

    const existing = await query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      await query(
        "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
        [newQty, userId, product_id]
      );
      return res.status(200).json({ message: "Cart updated successfully" });
    }

    await query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, product_id, quantity]
    );
    res.status(201).json({ message: "Product added to cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📦 Get all cart items
router.get("/", verifyToken, requireCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await query(
      `
      SELECT c.id AS cart_id, p.*, c.quantity 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `,
      [userId]
    );
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update quantity of a product in cart
router.put(
  "/update/:product_id",
  verifyToken,
  requireCustomer,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }

      const result = await query(
        "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
        [quantity, userId, product_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      res.status(200).json({ message: "Cart item updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ❌ Clear all items in the cart
router.delete("/clear", verifyToken, requireCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    await query("DELETE FROM cart WHERE user_id = ?", [userId]);
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Remove single item from cart
router.delete(
  "/remove/:product_id",
  verifyToken,
  requireCustomer,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id } = req.params;

      const result = await query(
        "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
        [userId, product_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      res.status(200).json({ message: "Item removed from cart successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
