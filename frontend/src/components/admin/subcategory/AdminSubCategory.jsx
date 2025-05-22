import React, { useEffect, useState } from "react";
import "../category/category.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminSubCategory() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    name: "",
    image: null,
    category_id: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/category");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/subcategory");
      setSubcategories(res.data);
    } catch (error) {
      console.error("Error fetching subcategories", error);
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
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category_id", form.category_id);
    if (form.image) formData.append("image", form.image);

    try {
      if (editIndex !== null) {
        await axios.put(
          `http://localhost:3000/api/subcategory/${editIndex}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/subcategory/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setForm({ name: "", image: null, category_id: "" });
      setEditIndex(null);
      setShowModal(false);
      fetchSubCategories();
    } catch (error) {
      console.error("Error submitting subcategory", error);
    }
  };

  const handleEdit = (subcat) => {
    setForm({
      name: subcat.subcategory_name,
      image: null,
      category_id: subcat.category_id,
    });
    setEditIndex(subcat.subcategory_id);
    setShowModal(true);
  };

  const handleDelete = async (subcatId) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?"))
      return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:3000/api/subcategory/${subcatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubCategories();
    } catch (error) {
      console.error("Error deleting subcategory", error);
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
        <h2>Manage Subcategories</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Subcategory
        </button>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((subcat) => (
                <tr key={subcat.subcategory_id}>
                  <td>{subcat.subcategory_name}</td>
                  <td>
                    <img
                      className="adincatImg"
                      src={subcat.image_url}
                      alt="subcat"
                    />
                  </td>
                  <td>
                    {categories.find((c) => c.id === subcat.category_id)
                      ?.name || "Unknown"}
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(subcat)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(subcat.subcategory_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {editIndex !== null ? "Edit Subcategory" : "Add Subcategory"}
            </h3>
            <form onSubmit={handleAddOrEdit}>
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleInputChange}
                required
              />

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="modal-actions">
                <button type="submit" className="add-btn">
                  {editIndex !== null ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setForm({ name: "", image: null, category_id: "" });
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
