const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// ➕ Create Order (Only Customers)
router.post("/add", verifyToken, (req, res) => {
  const user = req.user;
  const { items, total_price, address_id } = req.body;

  // 🔐 Role check
  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can place orders" });
  }

  // ✅ Validate request body
  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !total_price ||
    !address_id
  ) {
    return res.status(400).json({ message: "Missing or invalid order fields" });
  }

  // 1️⃣ Check if address belongs to the user
  const checkAddressSql = "SELECT * FROM address WHERE id = ? AND user_id = ?";
  db.query(checkAddressSql, [address_id, user.id], (err, addressResults) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Database error", error: err.message });

    if (addressResults.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid address ID for this user" });
    }

    // 2️⃣ Insert order
    const insertOrderSql = `
      INSERT INTO orders (user_id, address_id, total, status)
      VALUES (?, ?, ?, 'pending')
    `;
    db.query(
      insertOrderSql,
      [user.id, address_id, total_price],
      (err, orderResult) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Failed to create order", error: err.message });

        const orderId = orderResult.insertId;

        // 3️⃣ Insert order items
        const orderItems = items.map((item) => [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
        ]);

        const insertItemsSql = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ?
      `;
        db.query(insertItemsSql, [orderItems], (err) => {
          if (err)
            return res
              .status(500)
              .json({
                message: "Failed to add order items",
                error: err.message,
              });

          // ✅ Final response
          res.status(201).json({
            message: "Order placed successfully",
            orderId,
            totalAmount: total_price,
          });
        });
      }
    );
  });
});

module.exports = router;
