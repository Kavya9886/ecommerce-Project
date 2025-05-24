import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderHistory.css";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [addrData, setAddrData] = useState();
  const [addrId, setAddrId] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  
        data.forEach((order) => {
          setAddrId(order.address_id);
        });
        const addrData = await axios.get(
          `http://localhost:3000/api/address/${addrId}`,
          {
            headers: { Authorization: token },
          }
        );
        setAddrData(addrData.data.address);
        setOrders(data);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);
  console.log("addrData", addrData);
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
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span>Order #{order.id}</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>

                {/* Display order image here */}
                <div
                  className="order-image-container"
                  style={{ marginBottom: "10px" }}
                >
                  <img
                    src={
                      `http://localhost:3000${order.image_url}` ||
                      "/placeholder.png"
                    }
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
                  <p>
                    <strong>Total:</strong> ₹{order.total_price}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status || "Processing"}
                  </p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item">
                        <img
                          src={
                            `http://localhost:3000${item.image_url}` ||
                            "/placeholder.png"
                          }
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
        )}
      </div>
    </>
  );
};

export default OrderHistory;
