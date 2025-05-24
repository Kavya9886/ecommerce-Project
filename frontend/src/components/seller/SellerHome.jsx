import React, { useEffect, useState } from "react";
import axios from "axios";
import "./seller.css";
import Navbar from "./Navbar";

export default function SellerHome() {
  const PORT = 3000;
  const BASE_URL = `http://localhost:${PORT}`;
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    description: "",
    price: "",
    quantity: "",
    imageFile: null,
  });

  // Fetch user info
  useEffect(() => {
    if (token) {
      axios
        .get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user info:", err));
    }
  }, [token]);

  // Fetch categories and products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/category`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    const fetchMyProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/products/my-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch seller's products", err);
      }
    };

    fetchCategories();
    fetchMyProducts();
  }, [token, BASE_URL]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category change: fetch subcategories
  const handleCategoryChange = async (e) => {
    const selectedCategory = e.target.value;
    setForm((prev) => ({
      ...prev,
      category: selectedCategory,
      subcategory: "", // reset subcategory selection
    }));

    if (!selectedCategory) {
      setSubcategories([]);
      return;
    }

    try {
      const res = await axios.get(
        `${BASE_URL}/api/subcategory/category/${selectedCategory}`
      );
      console.log("Fetched subcategories:", res.data); // Debug
      setSubcategories(res.data);
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
      setSubcategories([]);
    }
  };

  // Handle file upload change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, imageFile: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Reset form and modal state
  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      subcategory: "",
      description: "",
      price: "",
      quantity: "",
      imageFile: null,
    });
    setSubcategories([]);
    setImagePreview(null);
    setEditProductId(null);
    setEditMode(false);
  };

  // Add or update product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.category ||
      !form.subcategory ||
      !form.description ||
      !form.price ||
      !form.quantity ||
      (!form.imageFile && !editMode)
    ) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      data.append("name", form.name);
      data.append("subcategory_id", parseInt(form.subcategory));
      data.append("description", form.description);
      data.append("price", parseFloat(form.price));
      data.append("quantity", parseInt(form.quantity, 10));
      if (form.imageFile) data.append("image", form.imageFile);

      if (editMode && editProductId) {
        // EDIT product
        const res = await axios.put(
          `${BASE_URL}/api/products/update/${editProductId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setProducts((prev) =>
          prev.map((prod) => (prod.id === editProductId ? res.data : prod))
        );
        alert("Product updated successfully!");
      } else {
        // ADD new product
        const res = await axios.post(`${BASE_URL}/api/products/add`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setProducts((prev) => [res.data, ...prev]);
        alert("Product added successfully!");
      }

      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving product", err);
      alert("Failed to save product. Please check your inputs and try again.");
    }
  };

  // Open edit modal with pre-filled form
  const openEditModal = async (product) => {
    setEditMode(true);
    setEditProductId(product.id);
    setForm({
      name: product.name,
      category: product.category_id || "", // assuming your product has category_id
      subcategory: product.subcategory_id || "",
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      imageFile: null,
    });

    if (product.category_id) {
      try {
        const resSubs = await axios.get(
          `${BASE_URL}/api/subcategory/category/${product.category_id}`
        );
        setSubcategories(resSubs.data);
      } catch (err) {
        console.error("Error fetching subcategories", err);
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }

    setImagePreview(product.image_url ? `${BASE_URL}${product.image_url}` : null);
    setShowModal(true);
  };

  // Delete product handler
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.put(
        `${BASE_URL}/api/products/soft-delete/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Delete failed", err);
      alert(err.response?.data?.error || "Failed to delete product.");
    }
  };

  return (
    <div className="seller-wrapper">
      <Navbar
        userName={user?.name || "Guest"}
        profilePicUrl={user?.image_url || "https://i.pravatar.cc/150?img=3"}
        onLogout={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        onSettings={() => {}}
      />

      <div className="seller-content">
        <div className="seller-header">
          <h2>Your Products</h2>
          <button
            className="add-product-btn"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="no-products">
            <h3>Welcome Seller 👋</h3>
            <p>
              You haven't added any products yet. Click{" "}
              <strong>+ Add Product</strong> to get started!
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((prod) => (
              <div key={prod.id} className="product-card">
                {prod.image_url && (
                  <img
                    src={`${BASE_URL}${prod.image_url}`}
                    alt={prod.name}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      marginBottom: 8,
                    }}
                  />
                )}
                <h3>{prod.name}</h3>
                <p>
                  <strong>Category:</strong> {prod.categoryName || "N/A"}
                </p>
                <p>
                  <strong>Subcategory:</strong> {prod.subcategoryName || "N/A"}
                </p>
                <p>{prod.description}</p>
                <p>
                  <strong>Price:</strong> ${parseFloat(prod.price).toFixed(2)}
                </p>
                <p>
                  <strong>Quantity:</strong> {prod.quantity}
                </p>
                <div className="product-actions">
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(prod)}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editMode ? "Edit Product" : "Add Product"}</h2>
              <form onSubmit={handleAddProduct}>
                <label>
                  Product Name:
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Category:
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Subcategory:
                  <select
                    name="subcategory"
                    value={form.subcategory}
                    onChange={handleInputChange}
                    required
                    disabled={subcategories.length === 0}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub.subcategory_id} value={sub.subcategory_id}>
                        {sub.subcategory_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Description:
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Price:
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </label>

                <label>
                  Quantity:
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </label>

                <label>
                  Product Image:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    // required only if not editing existing product
                    required={!editMode}
                  />
                </label>

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", marginBottom: 10 }}
                  />
                )}

                <div className="modal-actions">
                  <button type="submit">
                    {editMode ? "Update Product" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowModal(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
