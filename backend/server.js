const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const db = require("./db");
// Middleware
app.use(express.json());

// ✅ Routes
const authRoutes = require("./routes/auth");
// const orderRoutes = require("./routes/order");
const checkoutRoutes = require("./routes/checkout");
// const orderConfirmationRoutes = require("./routes/orderConfirmation");

// ✅ Use routes
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes); // e.g., /api/auth/login
// app.use("/api/orders", orderRoutes); // e.g., /api/orders/add
app.use("/api/checkout", checkoutRoutes); // e.g., /api/checkout
// app.use("/api/order-confirmation", orderConfirmationRoutes); // e.g., /api/order-confirmation/:orderId

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Node.js Backend!");
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
