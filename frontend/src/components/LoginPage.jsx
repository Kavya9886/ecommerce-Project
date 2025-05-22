// src/components/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthStyles.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:3000/api/login",
        formData
      );
      localStorage.setItem("token", res.data.token);
      const user = res.data.user;

      if (user.role === "customer") {
        navigate("/home");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("loginTime", Date.now().toString());
      } else if (user.role === "seller") {
        console.log("first");
        navigate("/seller");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        console.log("error on login");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <div className="links">
        <Link to="/register">Don't have an account? Register</Link>
        <br />
        <Link to="#">Forgot Password?</Link>
      </div>
    </div>
  );
};

export default LoginPage;
