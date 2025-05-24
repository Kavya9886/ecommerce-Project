import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PlaceOrder.css";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    id: null,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const fetchCart = async () => {
    const { data } = await axios.get("http://localhost:3000/api/cart", {
      headers: { Authorization: token },
    });
    setCart(data);
  };

  const fetchAddresses = async () => {
    const { data } = await axios.get("http://localhost:3000/api/address", {
      headers: { Authorization: token },
    });
    setAddresses(data.addresses);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    const endpoint = form.id
      ? `http://localhost:3000/api/address/${form.id}`
      : "http://localhost:3000/api/address/add";
    const method = form.id ? "put" : "post";
    await axios[method](endpoint, form, { headers: { Authorization: token } });
    setForm({});
    setShowAddressForm(false);
    fetchAddresses();
  };

  const deleteAddress = async (id) => {
    await axios.delete(`http://localhost:3000/api/address/${id}`, {
      headers: { Authorization: token },
    });
    fetchAddresses();
  };

  const handleRemove = async () => {
    try {
      await axios.delete("http://localhost:3000/api/cart/clear", {
        headers: { Authorization: token },
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };
  const itm = cart.map((item, index) => (
    <>
      <div>{index}</div>
    </>
  ));
  {
    console.log(itm);
  }
  const items = cart.map(
    ({ product_id, quantity, price, name, image_url }) => ({
      product_id: product_id,
      quantity,
      price,
      name,
      image_url,
    })
  );
  console.log(items, "cart");
  const placeOrder = async () => {
    const total = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    try {
      const response = await axios.post(
        "http://localhost:3000/api/order-item/add",
        {
          items,
          total_price: total,
          address_id: selectedAddressId,
        },
        { headers: { Authorization: token } }
      );

      if (window.confirm("Are you sure you want to place the order?")) {
        const orderData = {
          id: response.data.order_id,
          items,
          total_price: total,
          image_url: "",
          address: addresses.find((a) => a.id === selectedAddressId),
          estimated_delivery: "5-7 business days",
        };

        navigate("/order-confirmation", { state: { order: orderData } });
        handleRemove();
      }
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Error placing order.");
    }
  };

  return (
    <div className="place-order">
      <h2>Place Your Order</h2>

      <div className="cart-summary">
        <h3>Cart Items</h3>
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <span>{item.name}</span>
            <span>Qty: {item.quantity}</span>
            <span>₹{item.price}</span>
          </div>
        ))}
        <h4>
          Total: ₹{cart.reduce((acc, i) => acc + i.price * i.quantity, 0)}
        </h4>
      </div>

      <div className="address-section">
        <h3>Select Address</h3>
        {addresses.length === 0 ? (
          <p>No address found</p>
        ) : (
          <div className="address-table-container">
            <table className="address-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Country</th>
                  <th>Postal Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((addr) => (
                  <tr key={addr.id}>
                    <td>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                    </td>
                    <td>{addr.full_name}</td>
                    <td>{addr.phone}</td>
                    <td>
                      {addr.address1}, {addr.address2}
                    </td>
                    <td>{addr.city}</td>
                    <td>{addr.state}</td>
                    <td>{addr.country}</td>
                    <td>{addr.postal_code}</td>
                    <td>
                      <button
                        onClick={() => {
                          setForm({ ...addr });
                          setShowAddressForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => deleteAddress(addr.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => {
            setForm({});
            setShowAddressForm(true);
          }}
        >
          Add Address
        </button>
      </div>

      {showAddressForm && (
        <div className="address-form">
          <h3>{form.id ? "Edit Address" : "Add Address"}</h3>
          {[
            "full_name",
            "phone",
            "address1",
            "address2",
            "city",
            "state",
            "postal_code",
            "country",
          ].map((field) => (
            <input
              key={field}
              name={field}
              value={form[field] || ""}
              onChange={handleFormChange}
              placeholder={field.replace("_", " ").toUpperCase()}
            />
          ))}
          <button onClick={saveAddress}>Save</button>
        </div>
      )}

      <button
        className="place-order-btn"
        onClick={placeOrder}
        disabled={!selectedAddressId}
      >
        Place Order
      </button>
    </div>
  );
};

export default PlaceOrder;
