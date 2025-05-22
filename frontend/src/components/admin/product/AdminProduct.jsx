import React, { useEffect, useState } from "react";
import "../category/category.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    image: null,
    quantity: "",
    price: "",
    description: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/products/allProducts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Optionally handle unauthorized redirect or message
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleAddOrEdit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("quantity", form.quantity);
      formData.append("price", form.price);
      formData.append("description", form.description);
      if (form.image) {
        formData.append("image", form.image);
      }

      if (editProductId) {
        // Edit existing product
        await axios.put(
          `http://localhost:3000/api/products/${editProductId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Add new product
        await axios.post("http://localhost:3000/api/products/add", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Refresh product list
      fetchProducts();

      // Reset form and close modal
      setForm({
        name: "",
        image: null,
        quantity: "",
        price: "",
        description: "",
      });
      setEditProductId(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding/updating product:", error);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      image: null, // reset file input on edit
      quantity: product.quantity,
      price: product.price,
      description: product.description,
    });
    setEditProductId(product.id); // or product._id depending on API
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="category-page">
      <nav className="navbar">
        <div className="logo">Admin Panel</div>
        <div className="nav-actions">
          <button onClick={() => navigate("/admin")}>Home</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="content">
        <h2>Manage Products</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Product
        </button>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id || prod._id}>
                    <td>{prod.name}</td>
                    <td>
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>{prod.quantity}</td>
                    <td>{prod.price}</td>
                    <td>{prod.description}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(prod)}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(prod.id || prod._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editProductId ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleAddOrEdit}>
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleInputChange}
                required
              />
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <input
                name="quantity"
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleInputChange}
                required
                min="0"
              />
              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleInputChange}
                required
              ></textarea>
              <div className="modal-actions">
                <button type="submit" className="add-btn">
                  {editProductId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setForm({
                      name: "",
                      image: null,
                      quantity: "",
                      price: "",
                      description: "",
                    });
                    setEditProductId(null);
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
  );
}
