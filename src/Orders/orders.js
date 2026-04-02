import React, { useEffect, useState } from "react";
import "./orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(() => {
        setOrders([
          { _id: "1", user: "Minh Chul", total: 50, status: "Delivered" },
          { _id: "2", user: "Sophea", total: 30, status: "Pending" },
        ]);
      });
  }, []);

  return (
    <div className="orders-container">
      <h2>Orders Management</h2>

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Total ($)</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>{o.user}</td>
              <td>{o.total}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;