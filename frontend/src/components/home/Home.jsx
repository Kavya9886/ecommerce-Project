import React, { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";

const PORT = 3000; // Change to your backend port
const BASE_URL = `http://localhost:${PORT}`;
const PRODUCTS_PER_PAGE = 4;

const offers = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    alt: "Big Summer Sale",
    text: "Up to 50% off on summer collection!",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1503602642458-232111445657",
    alt: "New Tech Arrivals",
    text: "Latest gadgets just dropped!",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    alt: "Fashion Trends",
    text: "Explore trending styles and accessories",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [products, setProducts] = useState([]); // all products
  const [filteredProducts, setFilteredProducts] = useState([]); // products shown based on subcategory
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loginTime = localStorage.getItem("loginTime");

    if (!token || !loginTime) {
      navigate("/login");
      return;
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (now - parseInt(loginTime) > oneHour) {
      localStorage.removeItem("token");
      localStorage.removeItem("loginTime");
      alert("Session expired. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch categories on mount
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/category`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Fetch all products on mount for default listing
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/products`)
      .then((res) => {
        const allProducts = Array.isArray(res.data.products) ? res.data.products : [];
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setCurrentPage(1);

    axios
      .get(`${BASE_URL}/api/subcategory/${categoryId}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setSubcategories((prev) => ({
          ...prev,
          [categoryId]: data,
        }));
      })
      .catch((err) => console.error("Error fetching subcategories:", err));
    
    // Show all products when category is selected but no subcategory yet
    setFilteredProducts(products);
  };

  const handleSubcategoryClick = (subcatId) => {
    setSelectedSubcategory(subcatId);
    setCurrentPage(1);

    axios
      .get(`${BASE_URL}/api/products/subcategory/${subcatId}`)
      .then((res) => {
        const productsForSubcat = Array.isArray(res.data.products) ? res.data.products : [];
        setFilteredProducts(productsForSubcat);
      })
      .catch((err) => {
        console.error("Error fetching products for subcategory:", err);
        setFilteredProducts([]);
      });
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginTime");
    navigate("/login");
  };

  return (
    <div className="home-wrapper">
      <Navbar
        userName="Jane Smith"
        profilePicUrl="https://i.pravatar.cc/150?img=3"
        onLogout={handleLogout}
        onSettings={() => alert("Open settings")}
      />

      {/* Hero Slider */}
      <header className="hero-section slider">
        {offers.map((offer, index) => (
          <div
            key={offer.id}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${offer.img})` }}
            aria-label={offer.alt}
          >
            <div className="slide-text">{offer.text}</div>
          </div>
        ))}
        <div className="slider-dots">
          {offers.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </header>

      {/* Categories */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleCategoryClick(cat.id)}
              style={{ cursor: "pointer" }}
            >
              <img src={cat.image_url} alt={cat.name} />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Subcategories */}
      {selectedCategory && subcategories[selectedCategory] && (
        <section className="subcategories-section">
          <h2>Subcategories</h2>
          <div className="categories-grid">
            {subcategories[selectedCategory].map((subcat) => (
              <div
                key={subcat.subcategory_id}
                className="category-card"
                onClick={() => handleSubcategoryClick(subcat.subcategory_id)}
                style={{ cursor: "pointer" }}
              >
                <img src={subcat.image_url} alt={subcat.subcategory_name} />
                <h3>{subcat.subcategory_name}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="products-section">
        <h2>Products</h2>
        <div className="products-grid">
          {paginatedProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img src={product.image_url} alt={product.name} />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-button ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <h2>Join Our Newsletter</h2>
        <p>Get exclusive offers and latest product updates</p>
        <form className="newsletter-form">
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Subscribe</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 YourShop. All rights reserved.</p>
      </footer>
    </div>
  );
}
