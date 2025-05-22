const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const db = require("./db");
// Middleware

// ✅ Routes
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const subcategoryRoutes = require("./routes/subcategory");
const productRoutes = require("./routes/product");

// ✅ Use routes
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subcategoryRoutes);
app.use("/api/product", productRoutes);
app.use("/uploads", express.static("uploads"));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Node.js Backend!");
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
