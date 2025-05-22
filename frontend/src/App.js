// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Home from "./components/home/Home";
import Seller from "./components/seller/Seller";
import Admin from "./components/admin/Admin";
import AdminCategory from "./components/admin/category/AdminCategory";
import AdminSubCategory from "./components/admin/subcategory/AdminSubCategory";
import AdminProduct from "./components/admin/product/AdminProduct";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/seller" element={<Seller />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/categories" element={<AdminCategory />} />
      <Route path="/admin/subcategories" element={<AdminSubCategory />} />
      <Route path="/admin/products" element={<AdminProduct />} />
    </Routes>
  );
}

export default App;
