import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://grocerrybackend.onrender.com/api/orders";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API}/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const filtered = orders.filter(
    (o) => filter === "all" || o.status === filter
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 Orders </h1>

      {/* FILTER */}
      <div style={styles.filterRow}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Orders</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.grid}>
          {filtered.map((o) => (
            <div key={o._id} style={styles.card}>
              <div style={styles.row}>
                <strong>👤 {o.user?.name || o.userName}</strong>
                <span style={styles.status(o.status)}>{o.status}</span>
              </div>

              <p>📦 {o.product?.name || o.productName}</p>
              <p>💰 ₹{o.price} × {o.quantity}</p>

              <div style={styles.address}>
                <b>Address:</b><br />
                {o.address?.name}<br />
                {o.address?.phone}<br />
                {o.address?.street}, {o.address?.city}<br />
                {o.address?.state} - {o.address?.pincode}
              </div>

              <select
                value={o.status}
                onChange={(e) => updateStatus(o._id, e.target.value)}
                style={styles.statusSelect}
              >
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    background: "#f6f8fa",
    minHeight: "100vh",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 20,
    color: "#0f172a",
  },
  filterRow: {
    marginBottom: 20,
  },
  select: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  address: {
    fontSize: 13,
    marginTop: 10,
    color: "#334155",
  },
  statusSelect: {
    marginTop: 12,
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontWeight: 700,
  },
  status: (s) => ({
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    background:
      s === "placed"
        ? "#64748b"
        : s === "confirmed"
        ? "#0ea5e9"
        : s === "shipped"
        ? "#f59e0b"
        : s === "delivered"
        ? "#22c55e"
        : "#ef4444",
  }),
};
