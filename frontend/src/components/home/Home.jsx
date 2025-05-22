import React, { useState, useEffect } from "react";
import "./home.css";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";

const offers = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    alt: "Big Summer Sale",
    text: "Up to 50% off on summer collection!",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
    alt: "New Tech Arrivals",
    text: "Latest gadgets just dropped!",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    alt: "Fashion Trends",
    text: "Explore trending styles and accessories",
  },
];

// Mock Data
const categories = [
  { id: 1, name: "Clothing" },
  { id: 2, name: "Electronics" },
];

const subcategories = {
  1: [
    { id: 101, name: "Men's Wear" },
    { id: 102, name: "Women's Wear" },
  ],
  2: [
    { id: 201, name: "Mobiles" },
    { id: 202, name: "Laptops" },
  ],
};

const products = {
  101: [
    {
      id: 1,
      name: "Casual Shirt",
      price: "$29.99",
      image:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      name: "Jeans",
      price: "$49.99",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      name: "Jacket",
      price: "$89.99",
      image:
        "https://images.unsplash.com/photo-1512499617640-c2f9990c967e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 4,
      name: "T-Shirt",
      price: "$19.99",
      image:
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 5,
      name: "Shoes",
      price: "$69.99",
      image:
        "https://images.unsplash.com/photo-1582407947304-9a8bda8d8b3a?auto=format&fit=crop&w=400&q=80",
    },
  ],
  201: [
    {
      id: 6,
      name: "iPhone 13",
      price: "$799",
      image:
        "https://images.unsplash.com/photo-1634829035788-cc6d40d4b7e9?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 7,
      name: "Samsung Galaxy S21",
      price: "$699",
      image:
        "https://images.unsplash.com/photo-1606813904441-239aa3f1b6e2?auto=format&fit=crop&w=400&q=80",
    },
  ],
};

const PRODUCTS_PER_PAGE = 4;

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setCurrentPage(1);
  };

  const handleSubcategoryClick = (subcatId) => {
    setSelectedSubcategory(subcatId);
    setCurrentPage(1);
  };

  const currentProducts = selectedSubcategory
    ? products[selectedSubcategory] || []
    : [];

  const paginatedProducts = currentProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const totalPages = Math.ceil(currentProducts.length / PRODUCTS_PER_PAGE);

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

      {/* Category Section */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <img
                src={`https://source.unsplash.com/400x300/?${cat.name}`}
                alt={cat.name}
              />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Subcategory Section */}
      {selectedCategory && subcategories[selectedCategory] && (
        <section className="subcategories-section">
          <h2>Subcategories</h2>
          <div className="categories-grid">
            {subcategories[selectedCategory].map((subcat) => (
              <div
                key={subcat.id}
                className="category-card"
                onClick={() => handleSubcategoryClick(subcat.id)}
              >
                <img
                  src={`https://source.unsplash.com/400x300/?${subcat.name}`}
                  alt={subcat.name}
                />
                <h3>{subcat.name}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      {selectedSubcategory && (
        <section className="products-section">
          <h2>Products</h2>
          <div className="products-grid">
            {paginatedProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-button ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

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
