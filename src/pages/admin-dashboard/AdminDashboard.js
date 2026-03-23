import React from "react";
import Sidebar from "./Sidebar";
import "./admin-dashboard.css"; // import styles

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-main">

        {/* Top Bar */}
        <div className="top-bar">
          <h1 className="dashboard-title">Dashboard</h1>
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        {/* Cards */}
        <div className="cards-grid">
          <div className="card">
            <h2>Total Orders</h2>
            <p>120</p>
          </div>

          <div className="card">
            <h2>New Orders</h2>
            <p>30</p>
          </div>

          <div className="card">
            <h2>Delivered</h2>
            <p>80</p>
          </div>

          <div className="card">
            <h2>Cancelled</h2>
            <p>10</p>
          </div>

          <div className="card">
            <h2>Books</h2>
            <p>50</p>
          </div>

          <div className="card">
            <h2>Users</h2>
            <p>200</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;