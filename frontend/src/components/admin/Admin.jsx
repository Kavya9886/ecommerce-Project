// AdminLanding.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

export default function AdminLanding() {
  const navigate = useNavigate();

  return (
    <div className="admin-wrapper">
      <nav className="admin-navbar">
        <div className="logo">Admin Dashboard</div>
        <div className="nav-buttons">
          <button onClick={() => navigate("/admin/categories")}>
            Manage Category
          </button>
          <button onClick={() => navigate("/admin/subcategories")}>
            Manage Subcategory
          </button>
          <button onClick={() => navigate("/admin/products")}>
            Manage Product
          </button>
        </div>
      </nav>

      <div className="admin-content">
        <h2>Welcome Admin 👋</h2>
        <p>Please choose an option from the navigation above to manage your platform data.</p>
      </div>
    </div>
  );
}
