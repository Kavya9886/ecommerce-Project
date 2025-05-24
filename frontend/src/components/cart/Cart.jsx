import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = ({setCatImg}) => {
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

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/cart/update/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-wrapper">
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

      <div className="cart-container">
        <h2 className="cart-title">Your Cart</h2>
        {cartItems.length === 0 ? (
          <p className="empty-msg">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-grid">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={ `http://localhost:3000${item.image_url}`} className="cartimage" alt={item.name} />
                  {setCatImg(`http://localhost:3000${item.image_url}`)}
                  <div className="cart-info">
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    <label>
                      Qty:
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </label>
                    <button onClick={() => handleRemove(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h3>Total: ₹{getTotal()}</h3>
              <button
                onClick={() =>
                  navigate("/home", { state: { cartItems } })
                }
              >
                Continue Shop
              </button>
              <button
                onClick={() =>
                  navigate("/place-order", { state: { cartItems } })
                }
              >
                Place Order
              </button>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
