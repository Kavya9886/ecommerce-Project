import React, { useEffect, useState } from "react";
import "./category.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminCategory() {
  const [category, setcategory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    name: "",
    image: null,
  });

  const navigate = useNavigate();

  const fetchcategory = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/category");
      setcategory(res.data);
    } catch (error) {
      console.error("Error fetching category", error);
    }
  };

  useEffect(() => {
    fetchcategory();
  }, []);

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
    console.log("first")
    const formData = new FormData();
    formData.append("name", form.name);
    if (form.image) formData.append("image", form.image);

    try {
      if (editIndex !== null) {
        const categoryId = category[editIndex].id;
        await axios.put(
          `http://localhost:3000/api/category/${categoryId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post("http://localhost:3000/api/category/add", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      setForm({ name: "", image: null });
      setEditIndex(null);
      setShowModal(false);
      fetchcategory();
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  const handleEdit = (index) => {
    setForm({ name: category[index].name, image: null });
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    const token = localStorage.getItem("token");
    const categoryId = category[index].id;
    try {
      await axios.delete(`http://localhost:3000/api/category/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchcategory();
    } catch (error) {
      console.error("Error deleting category", error);
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
        <h2>Manage category</h2>
        {category.length === 0 ? (
          <div className="empty-state">
            <p>Welcome! No category found. Please add a new category.</p>
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
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {category.map((cat, index) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td><img className="adincatImg" src={cat.image_url}/></td>
                      <td>{new Date(cat.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(index)}
                        >
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
                    setForm({ name: "", image: null });
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
