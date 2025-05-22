import React, { useState } from "react";
import "./category.css";
import { useNavigate } from "react-router-dom";

const initialCategories = [];

export default function Category() {
  const [categories, setCategories] = useState(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    name: "",
    image: "",
    quantity: "",
    price: "",
    description: "",
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...categories];
      updated[editIndex] = { ...form };
      setCategories(updated);
    } else {
      setCategories([...categories, { ...form }]);
    }
    setForm({ name: "", image: "", quantity: "", price: "", description: "" });
    setEditIndex(null);
    setShowModal(false);
  };

  const handleEdit = (index) => {
    setForm(categories[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = (index) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
  };

  return (
    <div className="category-page">
      <nav className="navbar">
        <div className="logo">Admin Panel</div>
        <div className="nav-actions">
          <button onClick={() => (window.location.href = "/admin")}>Home</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="content">
        <h2>Manage Categories</h2>
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>Welcome! No categories found. Please add a new category.</p>
            <button className="add-btn" onClick={() => setShowModal(true)}>
              + Add Category
            </button>
          </div>
        ) : (
          <>
            <button className="add-btn" onClick={() => setShowModal(true)}>
              + Add Category
            </button>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Image URL</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, index) => (
                    <tr key={index}>
                      <td>{cat.name}</td>
                      <td>{cat.image}</td>
                      <td>{cat.quantity}</td>
                      <td>{cat.price}</td>
                      <td>{cat.description}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(index)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(index)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editIndex !== null ? "Edit Category" : "Add Category"}</h3>
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
                placeholder="Image URL"
                value={form.image}
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
              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleInputChange}
                required
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
                  {editIndex !== null ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setForm({ name: "", image: "", quantity: "", price: "", description: "" });
                    setEditIndex(null);
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
