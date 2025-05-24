import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";

const OrderConfirmation = ({CatImg}) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const order = state?.order;

  if (!order) {
    // Redirect back if order not available
    navigate("/products");
    return null;
  }

  return (
    <div className="order-container">
      <div className="order-card">
        <h1>🎉 Thank you for your purchase!</h1>
        <p>
          Your order <strong>#{order.id}</strong> has been placed and is being
          processed.
        </p>

        <div className="section">
          <h2>📦 Order Summary</h2>
          <ul className="product-list">
            {order.items.map((item, index) => (
              <li key={index} className="product-item">
               
                <img src={CatImg} alt={item.name} />
                <div>
                  <p>
                    <strong>{item.name}</strong>
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ₹{item.price}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h2>💰 Payment</h2>
          <p>
            <strong>Total Paid:</strong> ₹{order.total_price}
          </p>
        </div>

        <div className="section">
          <h2>📍 Shipping Address</h2>
          <p>
            {order.address.full_name}, {order.address.address1},{" "}
            {order.address.city}, {order.address.state},{" "}
            {order.address.postal_code}
          </p>
        </div>

        <div className="section">
          <h2>📆 Estimated Delivery</h2>
          <p>{order.estimated_delivery}</p>
        </div>

        <div className="actions">
          <button onClick={() => window.print()} className="btn">
            🧾 Download Invoice
          </button>
          <button onClick={() => navigate("/home")} className="btn outline">
            Continue Shopping
          </button>
          <button onClick={() => navigate("/order-history")} className="btn outline">
            Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
