const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Utility: Check if user is admin
const isAdmin = (user) => user?.role === "admin";

// Utility: Send error response
const handleError = (res, status, message) =>
  res.status(status).json({ message });

// ➕ Create Subcategory (Admin only)
router.post("/add", verifyToken, upload.single("image"), (req, res) => {
  const { user } = req;
  const { name, category_id } = req.body;
  const categoryId = parseInt(category_id);

  if (!isAdmin(user))
    return handleError(res, 403, "Only admin can add subcategories");
  if (!name || !categoryId || !req.file)
    return handleError(res, 400, "Name, category ID, and image are required");

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  const sql =
    "INSERT INTO subcategories (name, category_id, image_url) VALUES (?, ?, ?)";

  db.query(sql, [name, categoryId, imageUrl], (err, result) => {
    if (err) return handleError(res, 500, err.message);
    res.status(201).json({
      message: "Subcategory created successfully",
      subcategoryId: result.insertId,
    });
  });
});

// 📝 Update Subcategory (Admin only)
router.put("/:id", verifyToken, upload.single("image"), (req, res) => {
  const { user } = req;
  const { name, category_id } = req.body;
  const subcategoryId = req.params.id;
  const categoryId = parseInt(category_id);

  if (!isAdmin(user))
    return handleError(res, 403, "Only admin can update subcategories");
  if (!name || !categoryId)
    return handleError(res, 400, "Name and category ID are required");

  const imageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : null;
  const sql = `
    UPDATE subcategories 
    SET name = ?, category_id = ?, image_url = COALESCE(?, image_url)
    WHERE id = ?
  `;

  db.query(sql, [name, categoryId, imageUrl, subcategoryId], (err, result) => {
    if (err) return handleError(res, 500, err.message);
    if (result.affectedRows === 0)
      return handleError(res, 404, "Subcategory not found");

    res.status(200).json({ message: "Subcategory updated successfully" });
  });
});

// ❌ Delete Subcategory (Admin only)
router.delete("/:id", verifyToken, (req, res) => {
  const { user } = req;
  const subcategoryId = req.params.id;

  if (!isAdmin(user))
    return handleError(res, 403, "Only admin can delete subcategories");

  const sql = "DELETE FROM subcategories WHERE id = ?";
  db.query(sql, [subcategoryId], (err, result) => {
    if (err) return handleError(res, 500, err.message);
    if (result.affectedRows === 0)
      return handleError(res, 404, "Subcategory not found");

    res.status(200).json({ message: "Subcategory deleted successfully" });
  });
});

// 🌍 Get All Subcategories
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      sub.id AS subcategory_id,
      sub.name AS subcategory_name,
      sub.image_url,
      cat.id AS category_id,
      cat.name AS category_name
    FROM subcategories sub
    JOIN categories cat ON sub.category_id = cat.id
    ORDER BY sub.name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) return handleError(res, 500, err.message);
    res.status(200).json(results);
  });
});

// 📦 Get Subcategories by Category ID
router.get("/category/:category_id", (req, res) => {
  const categoryId = req.params.category_id;

  const sql = `
    SELECT 
      id AS subcategory_id, 
      name AS subcategory_name, 
      image_url,
      category_id
    FROM subcategories 
    WHERE category_id = ?
    ORDER BY name ASC
  `;

  db.query(sql, [categoryId], (err, results) => {
    if (err) return handleError(res, 500, err.message);
    res.status(200).json(results);
  });
});

// 📍 Get Subcategory by ID
router.get("/:id", (req, res) => {
  const subcategoryId = req.params.id;

  const sql = `
    SELECT 
      sub.id AS subcategory_id,
      sub.name AS subcategory_name,
      sub.image_url,
      cat.id AS category_id,
      cat.name AS category_name
    FROM subcategories sub
    JOIN categories cat ON sub.category_id = cat.id
    WHERE sub.id = ?
  `;

  db.query(sql, [subcategoryId], (err, results) => {
    if (err) return handleError(res, 500, err.message);
    if (results.length === 0)
      return handleError(res, 404, "Subcategory not found");

    res.status(200).json(results[0]);
  });
});

module.exports = router;
