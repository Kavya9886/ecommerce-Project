import React, { useEffect, useState } from "react";
import "../category/category.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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
                        <>
                        {console.log(`http://localhost:3000${prod.image_url}`)}
                        <img
                          src={`http://localhost:3000${prod.image_url}`}
                          alt={prod.name}
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                          />
                          </>
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>{prod.quantity}</td>
                    <td>{prod.price}</td>
                    <td>{prod.description}</td>
                    <td>
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
    </div>
  );
}
