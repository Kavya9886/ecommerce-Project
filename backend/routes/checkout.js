const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// 🛒 POST /checkout — Place an order
router.post("/", verifyToken, (req, res) => {
  const userId = req.user.id;

  const getCartQuery = `
    SELECT c.product_id, c.quantity, p.price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;

  db.query(getCartQuery, [userId], (err, cartItems) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Failed to retrieve cart", error: err.message });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const insertOrderQuery = `
      INSERT INTO orders (user_id, total, status) 
      VALUES (?, ?, 'pending')
    `;

    db.query(insertOrderQuery, [userId, totalAmount], (err, orderResult) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Failed to create order", error: err.message });

      const orderId = orderResult.insertId;

      const orderItemsData = cartItems.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);

      const insertOrderItemsQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ?
      `;

      db.query(insertOrderItemsQuery, [orderItemsData], (err) => {
        if (err)
          return res
            .status(500)
            .json({
              message: "Failed to insert order items",
              error: err.message,
            });

        const clearCartQuery = `DELETE FROM cart WHERE user_id = ?`;

        db.query(clearCartQuery, [userId], (err) => {
          if (err)
            return res
              .status(500)
              .json({
                message: "Order placed but failed to clear cart",
                error: err.message,
              });

          res.status(201).json({
            message: "Order placed successfully",
            orderId,
            totalAmount,
          });
        });
      });
    });
  });
});

module.exports = router;
