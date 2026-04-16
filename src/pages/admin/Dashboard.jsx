import React from "react";
import {
  Users,
  ShoppingCart,
  Package,
  Truck,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  Target,
} from "react-feather";

export default function Dashboard() {
  return (
    <div style={styles.wrapper}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Dashboard</h2>
          <p style={styles.subtitle}>Real-time control center · Last updated: Just now</p>
        </div>

        <div style={styles.headerRight}>
          <select style={styles.dropdown}>
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
          </select>
          <button style={styles.download}>Download Report</button>
        </div>
      </div>

      {/* METRICS */}
      <div style={styles.grid}>
        <Card
          title="Today's Revenue"
          value="₹128,100"
          sub="vs yesterday"
          percent="12.5%"
          icon={<DollarSign size={18} />}
          color="#e0f2fe"
        />
        <Card
          title="Total Orders"
          value="8"
          sub="vs yesterday"
          percent="8.2%"
          icon={<ShoppingCart size={18} />}
          color="#ecfdf5"
        />
        <Card
          title="Avg Delivery Time"
          value="14 min"
          sub="2 min faster"
          percent="-5.4%"
          icon={<Clock size={18} />}
          color="#fff7ed"
        />
        <Card
          title="Rider Utilization"
          value="60%"
          sub="optimal range"
          percent="3.1%"
          icon={<Truck size={18} />}
          color="#f0f9ff"
        />

        <Card
          title="Average Order Value"
          value="₹299"
          sub="vs last week"
          percent="4.2%"
          icon={<TrendingUp size={18} />}
          color="#f5f3ff"
        />
        <Card
          title="Active Customers"
          value="8"
          sub="online now"
          percent="15.8%"
          icon={<Users size={18} />}
          color="#ecfeff"
        />
        <Card
          title="Order Backlog"
          value="6"
          sub="pending"
          percent="-12%"
          icon={<AlertCircle size={18} />}
          color="#fef2f2"
        />
        <Card
          title="Low Stock Items"
          value="2"
          sub="needs restock"
          percent="-10%"
          icon={<Target size={18} />}
          color="#fefce8"
        />
      </div>

      {/* LIVE ORDERS */}
      <div style={styles.bottomRow}>
        <div style={styles.liveCard}>
          <div style={styles.liveHeader}>
            <h4>Live Orders</h4>
            <span style={styles.liveBadge}>Live</span>
          </div>

          <div style={styles.progressBar}>
            <div style={{ ...styles.bar, background: "#f59e0b", width: "20%" }} />
            <div style={{ ...styles.bar, background: "#3b82f6", width: "30%" }} />
            <div style={{ ...styles.bar, background: "#22c55e", width: "40%" }} />
            <div style={{ ...styles.bar, background: "#ef4444", width: "10%" }} />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={styles.quick}>
          <h4>Quick Actions</h4>
          <div style={styles.quickGrid}>
            <Quick title="Add Product" />
            <Quick title="Bulk Upload" />
            <Quick title="Create Offer" />
            <Quick title="View Orders" />
          </div>
        </div>
      </div>

    </div>
  );
}

/* ------------------- CARD -------------------- */
function Card({ title, value, sub, percent, icon, color }) {
  const positive = !percent.includes("-");
  return (
    <div style={{ ...styles.card, background: color }}>
      <div style={styles.cardTop}>
        <div style={styles.iconBox}>{icon}</div>
        <span
          style={{
            ...styles.percent,
            background: positive ? "#dcfce7" : "#fee2e2",
            color: positive ? "#16a34a" : "#dc2626",
          }}
        >
          {percent}
        </span>
      </div>

      <h3 style={styles.value}>{value}</h3>
      <p style={styles.label}>{title}</p>
      <span style={styles.sub}>{sub}</span>
    </div>
  );
}

function Quick({ title }) {
  return <div style={styles.quickBtn}>{title}</div>;
}

/* ------------------- STYLES -------------------- */

const styles = {
  wrapper: { padding: 25, display: "flex", flexDirection: "column", gap: 25 },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 26, fontWeight: 800, margin: 0 },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },

  headerRight: { display: "flex", gap: 12 },
  dropdown: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  download: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
  },

  card: {
    padding: 18,
    borderRadius: 16,
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  },

  cardTop: { display: "flex", justifyContent: "space-between" },

  iconBox: {
    background: "white",
    padding: 10,
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  percent: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 600,
  },

  value: { margin: "12px 0 4px", fontSize: 26, fontWeight: 800 },
  label: { fontSize: 14, color: "#334155", margin: 0 },
  sub: { fontSize: 12, color: "#64748b" },

  bottomRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
  },

  liveCard: {
    background: "white",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  liveHeader: { display: "flex", justifyContent: "space-between" },

  liveBadge: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  progressBar: {
    display: "flex",
    height: 8,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 18,
  },

  bar: { height: "100%" },

  quick: {
    background: "white",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 12,
    marginTop: 12,
  },

  quickBtn: {
    background: "#f1f5f9",
    padding: 14,
    borderRadius: 12,
    textAlign: "center",
    fontWeight: 600,
    cursor: "pointer",
  },
};
