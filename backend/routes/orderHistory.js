const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// 🌍 View Order History (Customer, Seller, Admin)
router.get("/", verifyToken, (req, res) => {
  const user = req.user;

  let sql;
  let params;

  // Normalize role to lowercase for consistency
  const role = user.role?.toLowerCase();

  if (role === "customer") {
    sql = "SELECT * FROM orders WHERE user_id = ?";
    params = [user.id];
  } else if (role === "seller") {
    sql = `
      SELECT DISTINCT o.* 
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
    `;
    params = [user.id];
  } else if (role === "admin") {
    sql = "SELECT * FROM orders";
    params = [];
  } else {
    console.error("Unexpected user role:", role);
    return res.status(403).json({ message: "Unauthorized role" });
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Query error:", err.message);
      return res.status(500).json({ message: err.message });
    }
    return res.status(200).json(results);
  });
});

module.exports = router;
