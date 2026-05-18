import React, { useEffect, useState } from "react";
import axios from "axios";

const PRODUCT_API = "https://foodhelpervendor.onrender.com/api/vendor/products";
const ORDER_API   = "https://foodhelpervendor.onrender.com/api/vendor/orders";

const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const STATUS_CONFIG = {
  pending:    { label: "Pending",    bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  processing: { label: "Processing", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  shipped:    { label: "Shipped",    bg: "#f0f9ff", color: "#0284c7", border: "#bae6fd" },
  delivered:  { label: "Delivered",  bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  cancelled:  { label: "Cancelled",  bg: "#fef2f2", color: "#ef4444", border: "#fecaca" },
};

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [pRes, oRes] = await Promise.all([
        axiosAuth.get(PRODUCT_API),
        axiosAuth.get(ORDER_API),
      ]);
      setProducts(pRes.data?.data || []);
      setOrders(oRes.data?.data   || []);
    } catch (err) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts   = products.length;
  const totalOrders     = orders.length;
  const pendingOrders   = orders.filter(o => o.status === "pending").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
  // const totalEarnings   = orders
  //   .filter(o => o.status === "delivered")
  //   .reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
const totalEarnings = orders
  .filter((o) => o.status === "delivered")
  .reduce(
    (s, o) =>
      s +
      (
        Number(o.finalPrice) ||
        Number(o.totalPrice) ||
        0
      ),
    0
  );
  const latestOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    :root {
      --bg:       #f4f6fb;
      --white:    #ffffff;
      --border:   #e4e7ef;
      --text:     #0f172a;
      --textMid:  #64748b;
      --textDim:  #94a3b8;
      --blue:     #2563eb;
      --blueFade: #eff6ff;
      --blueHov:  #1d4ed8;
      --green:    #16a34a;
      --greenFade:#f0fdf4;
      --red:      #ef4444;
      --redFade:  #fef2f2;
      --amber:    #d97706;
      --shadow:   0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
      --shadowMd: 0 4px 20px rgba(0,0,0,0.09);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .vd {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      min-height: 100vh;
      color: var(--text);
    }

    /* ── Topbar ── */
    .vd-topbar {
      background: var(--white);
      border-bottom: 1px solid var(--border);
      height: 58px; padding: 0 28px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50;
    }
    .vd-brand { display: flex; align-items: center; gap: 9px; }
    .vd-brand-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg,#2563eb,#1d4ed8);
      display: flex; align-items: center; justify-content: center; font-size: 15px;
    }
    .vd-brand-name { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
    .vd-brand-sep  { width:1px; height:16px; background:var(--border); margin:0 10px; }
    .vd-brand-page { font-size: 13px; color: var(--textMid); }
    .vd-refresh {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 13px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--white); color: var(--textMid);
      font-size: 12.5px; font-weight: 500;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer; transition: all 0.2s;
    }
    .vd-refresh:hover { border-color: var(--blue); color: var(--blue); background: var(--blueFade); }
    .vd-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Body ── */
    .vd-body { padding: 24px 28px 64px; max-width: 1280px; }

    /* ── Page header ── */
    .vd-page-head { margin-bottom: 22px; }
    .vd-page-head h1 { font-size: 21px; font-weight: 700; letter-spacing: -0.4px; }
    .vd-page-head p  { font-size: 13px; color: var(--textMid); margin-top: 4px; font-weight: 400; }

    /* ── Stats grid ── */
    .vd-stats {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .vd-stat {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 16px;
      box-shadow: var(--shadow);
      transition: box-shadow 0.2s, transform 0.2s;
      position: relative; overflow: hidden;
    }
    .vd-stat:hover { box-shadow: var(--shadowMd); transform: translateY(-2px); }

    .vd-stat-top {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 12px;
    }
    .vd-stat-icon {
      width: 38px; height: 38px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 17px;
    }
    .vd-stat-val  {
      font-size: 26px; font-weight: 700;
      letter-spacing: -0.6px; line-height: 1;
    }
    .vd-stat-lbl  { font-size: 12px; color: var(--textMid); font-weight: 500; margin-top: 4px; }
    .vd-stat-glow {
      position: absolute; bottom: -10px; right: -10px;
      width: 60px; height: 60px; border-radius: 50%;
      opacity: 0.06;
    }

    /* ── Grid layout ── */
    .vd-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 16px;
    }

    /* ── Card ── */
    .vd-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .vd-card-head {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .vd-card-head h3 { font-size: 14px; font-weight: 700; letter-spacing: -0.2px; }
    .vd-card-head p  { font-size: 12px; color: var(--textMid); margin-top: 2px; }

    /* ── Table ── */
    .vd-table-wrap { overflow-x: auto; }
    .vd-table { width: 100%; border-collapse: collapse; min-width: 560px; }
    .vd-table thead tr { border-bottom: 1px solid var(--border); background: #f8f9fc; }
    .vd-table th {
      padding: 10px 16px; text-align: left; white-space: nowrap;
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
      text-transform: uppercase; color: var(--textMid);
    }
    .vd-table th.r { text-align: right; }
    .vd-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.12s; }
    .vd-table tbody tr:last-child { border-bottom: none; }
    .vd-table tbody tr:hover { background: #f8faff; }
    .vd-table td { padding: 13px 16px; font-size: 13px; vertical-align: middle; }
    .vd-table td.r { text-align: right; }

    /* ── Order ID ── */
    .vd-order-id {
      font-family: 'Courier New', monospace;
      font-size: 12px; font-weight: 600;
      color: var(--textMid);
      background: var(--bg);
      padding: 3px 7px; border-radius: 5px;
      border: 1px solid var(--border);
    }

    /* ── Status badge ── */
    .vd-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: 20px;
      font-size: 11.5px; font-weight: 600; white-space: nowrap;
    }
    .vd-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

    /* ── Amount ── */
    .vd-amount { font-weight: 700; font-size: 13.5px; }

    /* ── Empty ── */
    .vd-empty { padding: 52px 20px; text-align: center; }
    .vd-empty-icon  { font-size: 36px; opacity: 0.2; margin-bottom: 10px; }
    .vd-empty-title { font-size: 14px; font-weight: 600; }
    .vd-empty-sub   { font-size: 12.5px; color: var(--textMid); margin-top: 4px; }

    /* ── Shimmer ── */
    .sh-row td { height: 54px; padding: 0 16px; }
    .shimmer {
      border-radius: 6px; height: 13px;
      background: linear-gradient(90deg,#f0f2f7 25%,#e4e7ef 50%,#f0f2f7 75%);
      background-size: 300% 100%;
      animation: shim 1.5s ease infinite;
    }
    @keyframes shim { from{background-position:200% 0} to{background-position:-100% 0} }

    /* ── Summary card ── */
    .vd-summary { padding: 20px; }
    .vd-summary-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 13px 0;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }
    .vd-summary-row:last-child { border-bottom: none; }
    .vd-summary-lbl { color: var(--textMid); font-weight: 500; display: flex; align-items: center; gap: 8px; }
    .vd-summary-lbl span { font-size: 15px; }
    .vd-summary-val { font-weight: 700; font-size: 14px; }

    .vd-earnings-box {
      margin: 16px 20px 20px;
      background: linear-gradient(135deg, #1e40af, #2563eb);
      border-radius: 12px;
      padding: 20px;
      color: #fff;
    }
    .vd-earnings-lbl { font-size: 12px; font-weight: 500; opacity: 0.8; margin-bottom: 6px; }
    .vd-earnings-val {
      font-size: 28px; font-weight: 700;
      letter-spacing: -0.8px; line-height: 1;
    }
    .vd-earnings-sub { font-size: 11.5px; opacity: 0.7; margin-top: 6px; }

    /* ── Spin ── */
    .vd-spin {
      width: 13px; height: 13px;
      border: 2px solid rgba(37,99,235,0.2); border-top-color: var(--blue);
      border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .fade-up { animation: fadeUp 0.4s ease both; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

    @media(max-width: 1024px) {
      .vd-stats { grid-template-columns: repeat(3, 1fr); }
      .vd-grid  { grid-template-columns: 1fr; }
    }
    @media(max-width: 640px) {
      .vd-stats { grid-template-columns: repeat(2, 1fr); }
      .vd-body  { padding: 16px 14px 60px; }
    }
  `;

  const stats = [
    { icon: "📦", iconBg: "#eff6ff",  glowBg: "#2563eb", label: "Total Products",   val: totalProducts },
    { icon: "🧾", iconBg: "#f5f3ff",  glowBg: "#7c3aed", label: "Total Orders",     val: totalOrders },
    { icon: "⏳", iconBg: "#fffbeb",  glowBg: "#d97706", label: "Pending",          val: pendingOrders },
    { icon: "✅", iconBg: "#f0fdf4",  glowBg: "#16a34a", label: "Delivered",        val: deliveredOrders },
    { icon: "❌", iconBg: "#fef2f2",  glowBg: "#ef4444", label: "Cancelled",        val: cancelledOrders },
    { icon: "💰", iconBg: "#fdf4ff",  glowBg: "#9333ea", label: "Earnings",         val: `₹${totalEarnings.toLocaleString()}` },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="vd">

        {/* Topbar */}
        <div className="vd-topbar">
          <div className="vd-brand">
            <div className="vd-brand-icon">🏪</div>
            <span className="vd-brand-name">Seller Panel</span>
            <div className="vd-brand-sep" />
            <span className="vd-brand-page">Dashboard</span>
          </div>
          <button className="vd-refresh" onClick={fetchDashboard} disabled={loading}>
            {loading ? <span className="vd-spin" /> : "↻"} Refresh
          </button>
        </div>

        {/* Body */}
        <div className="vd-body">

          {/* Page header */}
          <div className="vd-page-head fade-up">
            <h1>Overview</h1>
            <p>Welcome back! Here's what's happening with your store.</p>
          </div>

          {/* Stats */}
          <div className="vd-stats fade-up" style={{ animationDelay: "0.05s" }}>
            {stats.map((s, i) => (
              <div className="vd-stat" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="vd-stat-top">
                  <div className="vd-stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
                </div>
                <div className="vd-stat-val">
                  {loading ? <div className="shimmer" style={{ width: 60, height: 28 }} /> : s.val}
                </div>
                <div className="vd-stat-lbl">{s.label}</div>
                <div className="vd-stat-glow" style={{ background: s.glowBg }} />
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="vd-grid fade-up" style={{ animationDelay: "0.1s" }}>

            {/* Latest Orders table */}
            <div className="vd-card">
              <div className="vd-card-head">
                <div>
                  <h3>Latest Orders</h3>
                  <p>Most recent {latestOrders.length} orders</p>
                </div>
              </div>
              <div className="vd-table-wrap">
                <table className="vd-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="r">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [1,2,3,4,5].map(i => (
                        <tr className="sh-row" key={i}>
                          <td><div className="shimmer" style={{ width: 80 }} /></td>
                          <td><div className="shimmer" style={{ width: 70 }} /></td>
                          <td><div className="shimmer" style={{ width: 80 }} /></td>
                          <td><div className="shimmer" style={{ width: 60, marginLeft: "auto" }} /></td>
                        </tr>
                      ))
                    ) : latestOrders.length === 0 ? (
                      <tr><td colSpan={4}>
                        <div className="vd-empty">
                          <div className="vd-empty-icon">🧾</div>
                          <div className="vd-empty-title">No orders yet</div>
                          <div className="vd-empty-sub">Orders will appear here once placed</div>
                        </div>
                      </td></tr>
                    ) : latestOrders.map((o) => {
                      const s = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                      return (
                        <tr key={o._id}>
                          <td>
                            <span className="vd-order-id">#{o._id.slice(-6).toUpperCase()}</span>
                          </td>
                          <td>
                            <span className="vd-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                              <span className="vd-badge-dot" style={{ background: s.color }} />
                              {s.label}
                            </span>
                          </td>
                          <td style={{ color: "var(--textMid)", fontSize: 12.5 }}>
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric"
                            })}
                          </td>
                          <td className="r">
                            <span className="vd-amount">₹{
  Number(
    o.finalPrice ||
    o.totalPrice ||
    0
  ).toLocaleString("en-IN")
}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Earnings box */}
              <div className="vd-card">
                <div className="vd-earnings-box">
                  <div className="vd-earnings-lbl">Total Earnings</div>
                  <div className="vd-earnings-val">
                    {loading
                      ? <div className="shimmer" style={{ width: 120, height: 32, background: "rgba(255,255,255,0.2)" }} />
                      : `₹${totalEarnings.toLocaleString()}`
                    }
                  </div>
                  <div className="vd-earnings-sub">From {deliveredOrders} delivered orders</div>
                </div>

                {/* Summary rows */}
                <div className="vd-summary">
                  {[
                    { icon: "🧾", label: "Total Orders",   val: totalOrders },
                    { icon: "⏳", label: "Pending",        val: pendingOrders,   color: "#d97706" },
                    { icon: "✅", label: "Delivered",      val: deliveredOrders, color: "#16a34a" },
                    { icon: "❌", label: "Cancelled",      val: cancelledOrders, color: "#ef4444" },
                    { icon: "📦", label: "Products Listed",val: totalProducts },
                  ].map((r, i) => (
                    <div className="vd-summary-row" key={i}>
                      <span className="vd-summary-lbl">
                        <span>{r.icon}</span> {r.label}
                      </span>
                      <span className="vd-summary-val" style={{ color: r.color || "var(--text)" }}>
                        {loading ? <div className="shimmer" style={{ width: 28 }} /> : r.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}