import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await fetch(`http://localhost:3000/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCartItems(cartItems.filter((item) => item.id !== productId));
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="empty-msg">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-grid">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="cart-img"
                />
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p>Price: ₹{item.price}</p>
                  <p>Qty: {item.quantity}</p>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total: ₹{getTotal()}</h3>
            {cartItems.length > 0 && (
              <button
                className="place-order-btn"
                onClick={() =>
                  navigate("/place-order", { state: { cartItems } })
                }
              >
                Place Order
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
