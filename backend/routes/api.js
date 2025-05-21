// routes/api.js
const express = require("express");
const router = express.Router();

// Sample GET endpoint
router.get("/hello", (req, res) => {
  res.json({ message: "Hello from API!" });
});

// Sample POST endpoint
router.post("/echo", (req, res) => {
  res.json({ youSent: req.body });
});

module.exports = router;
