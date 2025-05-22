// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Home from "./components/home/Home";
import Seller from "./components/seller/Seller";
import Admin from "./components/admin/Admin";
import Category from "./components/admin/category/Category";
import SubCategory from "./components/admin/subcategory/SubCategory";
import Product from "./components/admin/product/Product";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/seller" element={<Seller />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/categories" element={<Category />} />
      <Route path="/admin/subcategories" element={<SubCategory />} />
      <Route path="/admin/products" element={<Product />} />
    </Routes>
  );
}

export default App;
