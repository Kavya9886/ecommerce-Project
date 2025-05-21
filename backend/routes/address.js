const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const { promisify } = require("util");

const query = promisify(db.query).bind(db);

// Helper: Validate required fields
function validateAddressFields(body) {
  const requiredFields = [
    "full_name",
    "phone",
    "address_line1",
    "city",
    "state",
    "postal_code",
    "country",
  ];
  return requiredFields.every((field) => body[field]);
}

// Helper: Format address for insert/update
function formatAddress(body) {
  return {
    full_name: body.full_name,
    phone: body.phone,
    address_line1: body.address_line1,
    address_line2: body.address_line2 || "",
    city: body.city,
    state: body.state,
    postal_code: body.postal_code,
    country: body.country,
  };
}

// 📌 ADD Address
router.post("/add", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customers can add addresses" });
    }

    if (!validateAddressFields(req.body)) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const address = formatAddress(req.body);
    const sql = `
      INSERT INTO address 
      (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      user.id,
      address.full_name,
      address.phone,
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ]);

    res.status(201).json({
      message: "Address added successfully",
      addressId: result.insertId,
      data: { user_id: user.id, ...address },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📋 GET All Addresses
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const results = await query("SELECT * FROM address WHERE user_id = ?", [
      user.id,
    ]);
    res.status(200).json({ addresses: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ UPDATE Address
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const addressId = req.params.id;

    if (!validateAddressFields(req.body)) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const address = formatAddress(req.body);
    const sql = `
      UPDATE address SET 
        full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?, 
        city = ?, state = ?, postal_code = ?, country = ?
      WHERE id = ? AND user_id = ?
    `;

    const result = await query(sql, [
      address.full_name,
      address.phone,
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
      addressId,
      user.id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    res.status(200).json({ message: "Address updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ DELETE Address
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const addressId = req.params.id;

    const result = await query(
      "DELETE FROM address WHERE id = ? AND user_id = ?",
      [addressId, user.id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
