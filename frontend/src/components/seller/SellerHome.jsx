import React, { useEffect, useState } from "react";
import axios from "axios";
import "./seller.css";

export default function SellerHome() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    description: "",
    price: "",
    quantity: "",
    imageFile: null, // store file here
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, imageFile: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleCategoryChange = async (e) => {
    const selectedCategory = e.target.value;
    setForm((prev) => ({
      ...prev,
      category: selectedCategory,
      subcategory: "",
    }));

    if (!selectedCategory) {
      setSubcategories([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/api/subcategory/category/${selectedCategory}`
      );
      setSubcategories(res.data);
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
      setSubcategories([]);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !form.name ||
      !form.category ||
      !form.subcategory ||
      !form.description ||
      !form.price ||
      !form.quantity ||
      !form.imageFile
    ) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const numSubId=parseInt(form.subcategory)
      console.log(numSubId)
      console.log(typeof numSubId)
      const formData = new FormData();


      formData.append("name", form.name);
      formData.append("subcategory_id", numSubId);
      formData.append("description", form.description);
      formData.append("price", parseFloat(form.price));
      formData.append("quantity", parseInt(form.quantity, 10));
      formData.append("image", form.imageFile); // key name 'image', backend should expect this

      const res = await axios.post(
        "http://localhost:3000/api/products/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProducts((prev) => [...prev, res.data]);

      setForm({
        name: "",
        category: "",
        subcategory: "",
        description: "",
        price: "",
        quantity: "",
        imageFile: null,
      });
      setSubcategories([]);
      setImagePreview(null);
      setShowModal(false);
    } catch (err) {
      console.error("Error adding product", err);
      alert("Failed to add product. Please check your inputs and try again.");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/category");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    const fetchMyProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3000/api/products/my-products",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch seller's products", err);
      }
    };

    fetchCategories();
    fetchMyProducts();
  }, []);

  return (
    <div className="seller-wrapper">
      <nav className="seller-navbar">
        <div className="logo">Seller Dashboard</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="seller-content">
        <div className="seller-header">
          <h2>Your Products</h2>
          <button
            className="add-product-btn"
            onClick={() => setShowModal(true)}
          >
            + Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="no-products">
            <h3>Welcome Seller 👋</h3>
            <p>
              You haven't added any products yet. Click{" "}
              <strong>+ Add Product</strong> to get started!
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((prod) => (
              <div key={prod.id} className="product-card">
                {prod.image_url && (
                  <img
                  src={`http://localhost:3000${prod.image_url}`}
                  alt={prod.name}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    marginBottom: "8px",
                  }}
                  />
                )}
                <h3>{prod.name}</h3>
                <p>
                  <strong>Category:</strong>{" "}
                  {prod.categoryName || prod.category || "N/A"}
                </p>
                <p>
                  <strong>Subcategory:</strong>{" "}
                  {prod.subcategoryName || prod.subcategory || "N/A"}
                </p>
                <p>{prod.description}</p>
                <p>
                  <strong>Price:</strong> ${parseFloat(prod.price).toFixed(2)}
                </p>
                <p>
                  <strong>Quantity:</strong> {prod.quantity}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <input
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleInputChange}
                required
              />

              <select
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleInputChange}
                required
                disabled={!subcategories.length}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.subcategory_id} value={sub.subcategory_id}>
                  
                    {sub.subcategory_name || sub.subcategory_id}
                  </option>
                ))}
              </select>

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleInputChange}
                required
              />

              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={form.price}
                onChange={handleInputChange}
                required
              />

              <input
                name="quantity"
                type="number"
                min="0"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleInputChange}
                required
              />

              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "150px",
                    marginTop: "10px",
                    borderRadius: "4px",
                  }}
                />
              )}

              <div className="modal-actions" style={{ marginTop: "15px" }}>
                <button type="submit">Add Product</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
