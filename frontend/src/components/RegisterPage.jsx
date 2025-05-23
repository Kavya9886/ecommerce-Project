import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AuthStyles.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);

    if (image) {
      data.append("image", image);
    }

    try {
      const res = await axios.post("http://localhost:3000/api/signup", data);
      setMessage(res.data.message);

      // Wait 1 second and then navigate to login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <select name="role" onChange={handleChange}>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
        <button type="submit">Register</button>
      </form>

      <div className="links">
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
