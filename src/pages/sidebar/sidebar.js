import React from "react";
import "./admin-dashboard.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Admin</h2>
      <ul>
        <li>Dashboard</li>
        <li>Books</li>
        <li>Orders</li>
        <li>Reports</li>
        <li>Users</li>
      </ul>
    </div>
  );
};

export default Sidebar;