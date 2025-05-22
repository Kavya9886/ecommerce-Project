import React, { useState } from "react";
import "./navbar.css";

const Navbar = ({ userName = "John Doe", profilePicUrl, onLogout, onSettings }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="logo">YourShop</h1>
      </div>

      {/* Hamburger toggle for mobile */}
      <button
        className="hamburger"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
      </button>

      <div className={`navbar-right ${isOpen ? "open" : ""}`}>
        <img
          className="profile-pic"
          src={profilePicUrl || "https://i.pravatar.cc/40"}
          alt="Profile"
          title={userName}
        />
        <span className="user-name">{userName}</span>
        <button
          className="icon-btn"
          aria-label="Settings"
          title="Settings"
          onClick={onSettings}
        >
          ⚙️
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
