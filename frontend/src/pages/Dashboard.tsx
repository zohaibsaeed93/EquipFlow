import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Scheduling System</h2>
        </div>
        <div className="nav-user">
          <span className="user-info">
            Welcome, <strong>{user?.name}</strong> (@{user?.username})
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h1>Dashboard</h1>
          <p>You are successfully logged in!</p>

          <div className="user-details">
            <h3>Your Profile</h3>
            <div className="detail-row">
              <span className="label">User ID:</span>
              <span className="value">{user?.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Username:</span>
              <span className="value">{user?.username}</span>
            </div>
            <div className="detail-row">
              <span className="label">Name:</span>
              <span className="value">{user?.name}</span>
            </div>
            {user?.email && (
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value">
                <span
                  className={`status-badge ${user?.isActive ? "active" : "inactive"}`}
                >
                  {user?.isActive ? "Active" : "Inactive"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
