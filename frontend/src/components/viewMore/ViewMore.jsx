import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./viewmore.css";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default function ViewMore({ viewMor }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const id = viewMor.id;

  const handleAddToCart = () => {
    if (!quantity || quantity < 1) {
      alert("Please enter a valid quantity.");
      return;
    }

    const token = localStorage.getItem("token");

    axios
      .post(
        `${BASE_URL}/api/cart/add`,
        {
          product_id: id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then(() => {
        alert("Product added to cart!");
        navigate("/cart");
      })
      .catch((err) => {
        console.error("Error adding to cart:", err.response?.data || err.message);
        alert("Failed to add to cart. Please try again.");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate("/home")}>
          E-Cart
        </div>
        <div className="navbar-buttons">
          <button className="btn nav-btn" onClick={() => navigate("/home")}>
            Home
          </button>
          <button className="btn nav-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="viewmore-container">
        <div className="viewmore-card">
          <div className="viewmore-image">
            <img src={`http://localhost:3000${viewMor.image_url}`} alt={viewMor.name} />
          </div>
          <div className="viewmore-details">
            <h2>{viewMor.name}</h2>
            <p>
              <strong>Price:</strong> ₹{viewMor.price}
            </p>
            <p>
              <strong>Description:</strong> {viewMor.description}
            </p>
            <p>
              <strong>Available Quantity:</strong> {viewMor.quantity || "N/A"}
            </p>

            <div className="viewmore-quantity">
              <label>
                Quantity:
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                />
              </label>
            </div>

            <div className="viewmore-buttons">
              <button onClick={() => navigate("/home")} className="btn-secondary">
                Continue Shopping
              </button>
              <button onClick={handleAddToCart} className="btn-primary">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
