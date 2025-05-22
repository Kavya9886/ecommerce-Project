import React, { useState } from "react";
import "./seller.css";

const initialProducts = []

export default function SellerHome() {
  const [products, setProducts] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    description: "",
    price: "",
    quantity: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      id: products.length + 1,
      ...form,
    };
    setProducts([...products, newProduct]);
    setForm({
      name: "",
      category: "",
      subcategory: "",
      description: "",
      price: "",
      quantity: "",
    });
    setShowModal(false);
  };

  return (
    <div className="seller-wrapper">
      <nav className="seller-navbar">
        <div className="logo">Seller Dashboard</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="seller-content">
        <div className="seller-header">
          <h2>Your Products</h2>
          <button className="add-product-btn" onClick={() => setShowModal(true)}>
            + Add Product
          </button>
        </div>
{products.length === 0 ? (
  <div className="no-products">
    <h3>Welcome Seller 👋</h3>
    <p>You haven't added any products yet. Click <strong>+ Add Product</strong> to get started!</p>
  </div>
) : (
<div className="product-grid">
          {products.map((prod) => (
            <div key={prod.id} className="product-card">
              <h3>{prod.name}</h3>
              <p><strong>Category:</strong> {prod.category}</p>
              <p><strong>Subcategory:</strong> {prod.subcategory}</p>
              <p>{prod.description}</p>
              <p><strong>Price:</strong> ${prod.price}</p>
              <p><strong>Quantity:</strong> {prod.quantity}</p>
            </div>
          ))}
        </div>
)}

        
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <input
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleInputChange}
                required
              />
              <input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleInputChange}
                required
              />
              <input
                name="subcategory"
                placeholder="Subcategory"
                value={form.subcategory}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleInputChange}
                required
              />
              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleInputChange}
                required
              />
              <input
                name="quantity"
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleInputChange}
                required
              />
              <div className="modal-actions">
                <button type="submit">Add Product</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
