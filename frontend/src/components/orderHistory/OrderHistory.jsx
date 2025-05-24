import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderHistory.css";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleAddressIds, setVisibleAddressIds] = useState([]); // track which addresses are visible
  const [addresses, setAddresses] = useState({}); // cache addresses keyed by address_id
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          "http://localhost:3000/api/orderHistory",
          {
            headers: { Authorization: token },
          }
        );
        setOrders(data);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Function to toggle address display for an order
  const toggleAddress = async (addressId) => {
    if (visibleAddressIds.includes(addressId)) {
      // Hide address
      setVisibleAddressIds((prev) =>
        prev.filter((id) => id !== addressId)
      );
    } else {
      // Show address: fetch if not cached yet
      if (!addresses[addressId]) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/address/${addressId}`,
            { headers: { Authorization: token } }
          );
          setAddresses((prev) => ({
            ...prev,
            [addressId]: response.data.address,
          }));
        } catch (err) {
          console.error("Failed to fetch address", err);
        }
      }
      setVisibleAddressIds((prev) => [...prev, addressId]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const goHome = () => {
    navigate("/home");
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <button className="nav-btn" onClick={goHome}>
            Home
          </button>
          <button className="nav-btn logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="order-history-container">
        <h1>Order History</h1>
        {loading && <p>Loading orders...</p>}
        {error && <p className="error">{error}</p>}
        {orders.length === 0 && !loading && <p>No orders found.</p>}

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span>Order #{order.id}</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>

              <div className="order-image-container" style={{ marginBottom: "10px" }}>
                <img
                  src={`http://localhost:3000${order.image_url}` || "/placeholder.png"}
                  alt={`Order ${order.id} image`}
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div className="order-details">
                <p><strong>Total:</strong> ₹{order.total_price}</p>
                <p><strong>Status:</strong> {order.status || "Processing"}</p>
              </div>

              <button
                className="view-address-btn"
                onClick={() => toggleAddress(order.address_id)}
              >
                {visibleAddressIds.includes(order.address_id)
                  ? "Hide Address"
                  : "View Address"}
              </button>

              {/* Address details box */}
              {visibleAddressIds.includes(order.address_id) && addresses[order.address_id] && (
                <div className="address-box">
                  <p><strong>Full Name:</strong> {addresses[order.address_id].full_name}</p>
                  <p><strong>Address 1:</strong> {addresses[order.address_id].address1}</p>
                  <p><strong>Address 2:</strong> {addresses[order.address_id].address2}</p>
                  <p><strong>City:</strong> {addresses[order.address_id].city}</p>
                  <p><strong>State:</strong> {addresses[order.address_id].state}</p>
                  <p><strong>Country:</strong> {addresses[order.address_id].country}</p>
                  <p><strong>Postal Code:</strong> {addresses[order.address_id].postal_code}</p>
                  <p><strong>Phone:</strong> {addresses[order.address_id].phone}</p>
                </div>
              )}

              {order.items && order.items.length > 0 && (
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img
                        src={`http://localhost:3000${item.image_url}` || "/placeholder.png"}
                        alt={item.name}
                      />
                      <div>
                        <p>{item.name}</p>
                        <p>Qty: {item.quantity}</p>
                        <p>₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .view-address-btn {
          margin-top: 10px;
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        .view-address-btn:hover {
          background-color: #1976d2;
        }
        .address-box {
          margin-top: 15px;
          padding: 15px;
          background: #f0f4ff;
          border-radius: 8px;
          box-shadow: 0 0 8px #b0c4de;
          font-size: 0.95rem;
          color: #2b2d42;
          line-height: 1.5;
        }
      `}</style>
    </>
  );
};

export default OrderHistory;
