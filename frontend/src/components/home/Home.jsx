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

export default function Home({ setViewMor }) {
  const [editMode, setEditMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image_url: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
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
  }, [navigate, token]);

  useEffect(() => {
    if (token) {
      axios
        .get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user info:", err));
    }
  }, [token]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/category`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/products`)
      .then((res) => {
        const allProducts = Array.isArray(res.data.products)
          ? res.data.products
          : [];
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

    setFilteredProducts(products);
  };

  const handleSubcategoryClick = (subcatId) => {
    setSelectedSubcategory(subcatId);
    setCurrentPage(1);

    axios
      .get(`${BASE_URL}/api/products/subcategory/${subcatId}`)
      .then((res) => {
        const productsForSubcat = Array.isArray(res.data.products)
          ? res.data.products
          : [];
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

  const openSettingsModal = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        image_url: user.image_url || "",
      });
    }
    setSettingsOpen(true);
  };

  return (
    <div className="home-wrapper">
      <Navbar
        userName={user?.name || "Guest"}
        profilePicUrl={user?.image_url || "https://i.pravatar.cc/150?img=3"}
        onLogout={handleLogout}
        onSettings={openSettingsModal}
      />

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
            />
          ))}
        </div>
      </header>

      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <img src={cat.image_url} alt={cat.name} />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {selectedCategory && subcategories[selectedCategory] && (
        <section className="subcategories-section">
          <h2>Subcategories</h2>
          <div className="categories-grid">
            {subcategories[selectedCategory].map((subcat) => (
              <div
                key={subcat.subcategory_id}
                className="category-card"
                onClick={() => handleSubcategoryClick(subcat.subcategory_id)}
              >
                <img src={subcat.image_url} alt={subcat.subcategory_name} />
                <h3>{subcat.subcategory_name}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="products-section">
        <h2>Products</h2>
        <div className="products-grid">
          {paginatedProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={`http://localhost:3000${product.image_url}`}
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
              <button
                onClick={() => {
                  setViewMor(product);
                  navigate("/viewmore");
                }}
              >
                View More
              </button>
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

      <section className="newsletter-section">
        <h2>Join Our Newsletter</h2>
        <p>Get exclusive offers and latest product updates</p>
        <form className="newsletter-form">
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Subscribe</button>
        </form>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} MyShop. All rights reserved.</p>
      </footer>

      {settingsOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>User Profile</h2>

            {!editMode ? (
              <div className="user-details">
                <img
                  src={user?.image_url || "https://i.pravatar.cc/150?img=3"}
                  alt="Profile"
                  width={"200px"}
                  className="profile-preview"
                />
                <p>
                  <strong>Name:</strong> {user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <div className="modal-actions">
                  <button onClick={() => setEditMode(true)}>Edit</button>
                  <button onClick={() => setSettingsOpen(false)}>Close</button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData();
                  data.append("name", formData.name);
                  data.append("email", formData.email);
                  if (formData.password)
                    data.append("password", formData.password);
                  if (formData.imageFile)
                    data.append("image", formData.imageFile);

                  axios
                    .put(`${BASE_URL}/api/users/update-profile`, data, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                      },
                    })
                    .then((res) => {
                      setUser((prev) => ({
                        ...prev,
                        name: formData.name,
                        email: formData.email,
                        image_url: res.data.image_url || prev.image_url,
                      }));
                      setSettingsOpen(false);
                      setEditMode(false);
                      alert("Profile updated successfully!");
                    })
                    .catch((err) => {
                      console.error("Update failed", err);
                      alert("Failed to update profile.");
                    });
                }}
              >
                <label>
                  Name:
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Password:
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </label>
                <label>
                  Upload Image:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, imageFile: e.target.files[0] })
                    }
                  />
                </label>
                <div className="modal-actions">
                  <button type="submit">Save</button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        password: "",
                        imageFile: null,
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
