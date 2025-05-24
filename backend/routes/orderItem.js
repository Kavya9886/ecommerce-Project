const express = require("express");
const router = express.Router();
const db = require("../db"); // Importing the connection

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/add", verifyToken, (req, res) => {
  const { items, total_price, address_id } = req.body;
  const user_id = req.user.id;

  if (!items || !Array.isArray(items) || !total_price || !address_id) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const image_url = items[0]?.image_url || null;

  const orderQuery =
    "INSERT INTO orders (user_id, total_price, address_id, image_url) VALUES (?, ?, ?, ?)";

  db.query(
    orderQuery,
    [user_id, total_price, address_id, image_url],
    (err, orderResult) => {
      if (err) {
        console.error("Error inserting order:", err);
        return res
          .status(500)
          .json({ message: "Database error inserting order" });
      }

      const order_id = orderResult.insertId;

      const itemQuery =
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";
      const itemValues = items.map((item) => [
        order_id,
        item.product_id,
        item.quantity,
        item.price,
      ]);

      db.query(itemQuery, [itemValues], (err, itemResult) => {
        if (err) {
          console.error("Error inserting order items:", err);
          return res
            .status(500)
            .json({ message: "Database error inserting order items" });
        }

        res
          .status(201)
          .json({ message: "Order placed successfully", order_id });
      });
    }
  );
});

module.exports = router;
