// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Home from "./components/home/Home";
import Admin from "./components/admin/Admin";
import AdminCategory from "./components/admin/category/AdminCategory";
import AdminSubCategory from "./components/admin/subcategory/AdminSubCategory";
import AdminProduct from "./components/admin/product/AdminProduct";
import SellerHome from "./components/seller/SellerHome";
import ViewMore from "./components/viewMore/ViewMore";
import { useEffect, useState } from "react";
import Cart from "./components/cart/Cart";
import PlaceOrder from "./components/placeOrder/PlaceOrder";
import OrderConfirmation from "./components/orderConfirmation/OrderConfirmation";
import OrderHistory from "./components/orderHistory/OrderHistory";
import AdminManageUsers from "./components/admin/adminmanageuser/AdminManageUsers";
function App() {
  const [viewMor, setViewMor] = useState(null);
  const [CatImg, setCatImg] = useState();
  useEffect(() => {
    if (viewMor) {
      console.log("Product to view more:", viewMor);
    }
  }, [viewMor]);
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expiresAt");

    if (!token || !expiresAt) return false;

    const now = new Date().getTime();
    return now < parseInt(expiresAt);
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Home setViewMor={setViewMor} />} />
      <Route path="/cart" element={<Cart setCatImg={setCatImg} />} />
      <Route path="/place-order" element={<PlaceOrder />} />
      <Route
        path="/order-confirmation"
        element={<OrderConfirmation CatImg={CatImg} />}
      />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/viewmore" element={<ViewMore viewMor={viewMor} />} />
      <Route path="/seller" element={<SellerHome />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/categories" element={<AdminCategory />} />
      <Route path="/admin/subcategories" element={<AdminSubCategory />} />
      <Route path="/admin/products" element={<AdminProduct />} />
      <Route path="/admin/manageusers" element={<AdminManageUsers />} />
    </Routes>
  );
}

export default App;
