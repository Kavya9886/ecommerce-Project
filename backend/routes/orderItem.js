// routes/orderItem.js
const express = require("express");
const router = express.Router();

// Dummy middleware for auth (replace with real one if needed)
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  // In real code, verify token and set req.user
  next();
};

router.post("/add", authenticate, async (req, res) => {
  try {
    const { items, total_price, address_id } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || !total_price || !address_id) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // TODO: Save to your DB here
    console.log("Order received:", { items, total_price, address_id });

    // Simulate success
    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
