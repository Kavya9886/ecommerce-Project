import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  useEffect(() => {
    fetchUsers();
  }, []);

 async function fetchUsers() {
  setLoading(true);
  setError(null);
  try {
    const res = await axios.get("http://localhost:3000/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    setUsers(res.data);
  } catch (err) {
    console.log(err)
    setError(
      err.response?.data?.message || err.message || "Failed to fetch users"
    );
  } finally {
    setLoading(false);
  }
}

 async function handleDelete(userId) {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await axios.delete(`http://localhost:3000/api/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("User deleted successfully");
    setUsers(users.filter((user) => user.id !== userId));
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete user");
  }
}
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  return (
    <div style={{ padding: "20px" }}>
         <nav className="navbar">
        <div className="logo">Admin Panel</div>
        <div className="nav-actions">
          <button onClick={() => navigate("/admin")}>Home</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <h2>Manage Users</h2>
      <button onClick={() => navigate("/admin")}>Back to Dashboard</button>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(({ id, name, email, role }) => (
              <tr key={id}>
                <td>{name}</td>
                <td>{email}</td>
                <td>{role}</td>
                <td>
                  <button
                    onClick={() => handleDelete(id)}
                    style={{ backgroundColor: "red", color: "white" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
