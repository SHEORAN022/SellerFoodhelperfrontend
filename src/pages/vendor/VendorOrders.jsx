// import React, { useEffect, useState } from "react";
// import axios from "axios";

// /* ================= API ================= */
// const API_URL = "https://foodhelpervendor.onrender.com/api/vendor/orders";

// /* ================= AXIOS WITH VENDOR TOKEN ================= */
// const axiosAuth = axios.create();
// axiosAuth.interceptors.request.use((config) => {
//   const token = localStorage.getItem("vendorToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default function VendorOrders() {
//   /* ================= STATE ================= */
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   /* ================= FETCH ORDERS ================= */
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosAuth.get(API_URL);
//       if (res.data?.success) {
//         setOrders(res.data.data || []);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UPDATE STATUS ================= */
//   const updateStatus = async (orderId, status) => {
//     try {
//       await axiosAuth.put(`${API_URL}/${orderId}/status`, { status });
//       fetchOrders();
//     } catch (err) {
//       alert("Failed to update order status");
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div style={{ padding: 20, background: "#f6f8fa", minHeight: "100vh" }}>
//       <h2 style={{ marginBottom: 20 }}>Orders</h2>

//       {loading && <p>Loading orders...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && orders.length === 0 && <p>No orders found.</p>}

//       {orders.map((order) => (
//         <div
//           key={order._id}
//           style={{
//             background: "#fff",
//             borderRadius: 8,
//             padding: 16,
//             marginBottom: 16,
//             boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//           }}
//         >
//           {/* ORDER HEADER */}
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <div>
//               <b>Order ID:</b> {order._id}
//               <br />
//               <b>User:</b> {order.user?.name || "N/A"}
//               <br />
//               <b>Phone:</b> {order.user?.phone || "-"}
//             </div>

//             <div>
//               <b>Status:</b>{" "}
//               <span style={{ textTransform: "capitalize" }}>
//                 {order.status}
//               </span>
//               <br />
//               <b>Total:</b> ₹{order.totalAmount}
//             </div>
//           </div>

//           <hr />

//           {/* ORDER ITEMS */}
//           <table width="100%" cellPadding="6">
//             <thead>
//               <tr>
//                 <th align="left">Product</th>
//                 <th>Price</th>
//                 <th>Qty</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {order.items.map((item, idx) => (
//                 <tr key={idx}>
//                   <td>
//                     <div style={{ display: "flex", alignItems: "center" }}>
//                       {item.image && (
//                         <img
//                           src={item.image}
//                           alt=""
//                           width={40}
//                           style={{ marginRight: 8 }}
//                         />
//                       )}
//                       {item.name}
//                     </div>
//                   </td>
//                   <td align="center">₹{item.price}</td>
//                   <td align="center">{item.quantity}</td>
//                   <td align="center">
//                     ₹{item.price * item.quantity}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <hr />

//           {/* STATUS UPDATE */}
//           <div style={{ display: "flex", gap: 10 }}>
//             <select
//               value={order.status}
//               onChange={(e) =>
//                 updateStatus(order._id, e.target.value)
//               }
//             >
//               <option value="pending">Pending</option>
//               <option value="accepted">Accepted</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//             </select>

//             <span>
//               <b>Payment:</b> {order.paymentMode}
//             </span>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_URL = "https://foodhelpervendor.onrender.com/api/vendor/orders";

const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Status config ── */
const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "#b45309", bg: "#fef3c7", border: "#fde68a", dot: "#f59e0b" },
  accepted:  { label: "Accepted",  color: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe", dot: "#3b82f6" },
  delivered: { label: "Delivered", color: "#065f46", bg: "#d1fae5", border: "#a7f3d0", dot: "#10b981" },
  cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", border: "#fecaca", dot: "#ef4444" },
};

const PAYMENT_CONFIG = {
  cod:    { label: "COD",    color: "#6d28d9", bg: "#ede9fe" },
  online: { label: "Online", color: "#0369a1", bg: "#e0f2fe" },
  upi:    { label: "UPI",    color: "#047857", bg: "#d1fae5" },
};

const ALL_STATUSES = ["pending", "accepted", "delivered", "cancelled"];

/* ── Helpers ── */
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};
const shortId = (id) => id ? `#${String(id).slice(-6).toUpperCase()}` : "—";

export default function VendorOrders() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [sortBy,        setSortBy]        = useState("date_desc");
  const [page,          setPage]          = useState(1);
  const [expandedRow,   setExpandedRow]   = useState(null);
  const [updatingId,    setUpdatingId]    = useState(null);
  const [toast,         setToast]         = useState(null);
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [bulkStatus,    setBulkStatus]    = useState("");
  const ROWS_PER_PAGE = 15;

  useEffect(() => { fetchOrders(); }, []);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true); setError("");
      const res = await axiosAuth.get(API_URL);
      if (res.data?.success) setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      await axiosAuth.put(`${API_URL}/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      notify(`Order status updated to ${status}`);
    } catch {
      notify("Failed to update order status", "error");
    } finally { setUpdatingId(null); }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || !selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => axiosAuth.put(`${API_URL}/${id}/status`, { status: bulkStatus })));
      setOrders((prev) => prev.map((o) => selectedIds.includes(o._id) ? { ...o, status: bulkStatus } : o));
      notify(`${selectedIds.length} orders updated to ${bulkStatus}`);
      setSelectedIds([]); setBulkStatus("");
    } catch { notify("Bulk update failed", "error"); }
  };

  /* ── Filter + Sort ── */
  const filtered = orders.filter((o) => {
    const t = search.toLowerCase();
    const matchText =
      (o._id || "").toLowerCase().includes(t) ||
      (o.user?.name || "").toLowerCase().includes(t) ||
      (o.user?.phone || "").includes(t) ||
      (o.items || []).some((i) => (i.name || "").toLowerCase().includes(t));
    const matchStatus  = !filterStatus  || o.status === filterStatus;
    const matchPayment = !filterPayment || o.paymentMode === filterPayment;
    return matchText && matchStatus && matchPayment;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date_desc") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "date_asc")  return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "amount_desc") return (b.totalAmount || 0) - (a.totalAmount || 0);
    if (sortBy === "amount_asc")  return (a.totalAmount || 0) - (b.totalAmount || 0);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const paginated  = sorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const allSelected = paginated.length > 0 && paginated.every((o) => selectedIds.includes(o._id));
  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? selectedIds.filter((id) => !paginated.find((o) => o._id === id)) : [...new Set([...selectedIds, ...paginated.map((o) => o._id)])]);

  /* ── Stats ── */
  const stats = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue:   orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.totalAmount || 0), 0),
  };

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    :root{
      --bg:#f1f5f9;--white:#fff;--border:#e2e8f0;--border2:#cbd5e1;
      --text:#0f172a;--mid:#475569;--dim:#94a3b8;
      --blue:#2563eb;--blueFade:#eff6ff;
      --red:#ef4444;--redFade:#fef2f2;
      --green:#16a34a;--greenFade:#f0fdf4;
      --amber:#d97706;--amberFade:#fffbeb;
      --shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
      --shadowMd:0 4px 12px rgba(0,0,0,.08);
      --r:10px;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    .vo{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);min-height:100vh;color:var(--text)}

    /* topbar */
    .vo-bar{background:var(--white);border-bottom:1px solid var(--border);height:56px;padding:0 24px;
      display:flex;align-items:center;position:sticky;top:0;z-index:50;gap:10px}
    .vo-bar-icon{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#4f46e5);
      display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
    .vo-bar-name{font-size:14px;font-weight:700}
    .vo-bar-sep{width:1px;height:14px;background:var(--border);margin:0 6px}
    .vo-bar-page{font-size:13px;color:var(--mid)}

    /* body */
    .vo-body{padding:20px 24px 60px;max-width:1500px}

    /* page header */
    .vo-ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px}
    .vo-ph h1{font-size:20px;font-weight:800;letter-spacing:-.4px}
    .vo-ph p{font-size:12.5px;color:var(--mid);margin-top:3px}

    /* stats */
    .vo-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
    .vo-stat{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;
      box-shadow:var(--shadow);display:flex;align-items:center;gap:12px}
    .vo-stat-icon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
    .vo-stat-val{font-size:21px;font-weight:800;letter-spacing:-.5px;line-height:1}
    .vo-stat-lbl{font-size:11px;color:var(--mid);font-weight:500;margin-top:3px}

    /* card */
    .vo-card{background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}

    /* toolbar */
    .vo-toolbar{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .vo-toolbar-left{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap}
    .vo-search-wrap{position:relative}
    .vo-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--dim);pointer-events:none}
    .vo-search{padding:7px 10px 7px 30px;border:1px solid var(--border);border-radius:8px;
      font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:var(--text);background:var(--bg);
      outline:none;width:210px;transition:all .2s}
    .vo-search:focus{border-color:var(--blue);background:var(--white);box-shadow:0 0 0 3px rgba(37,99,235,.09)}
    .vo-sel{padding:7px 10px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;
      font-size:12.5px;color:var(--text);background:var(--bg);outline:none;cursor:pointer}
    .vo-sel:focus{border-color:var(--blue)}
    .vo-badge-count{padding:3px 8px;border-radius:20px;border:1px solid var(--border);font-size:11px;font-weight:600;color:var(--mid);background:var(--bg);white-space:nowrap}

    /* bulk bar */
    .vo-bulk{background:#eef2ff;border:1px solid #c7d2fe;border-radius:9px;padding:10px 14px;
      margin-bottom:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .vo-bulk-label{font-size:13px;font-weight:600;color:#4338ca}

    /* table */
    .vo-table-wrap{overflow-x:auto}
    .vo-table{width:100%;border-collapse:collapse;min-width:1020px}
    .vo-table thead tr{border-bottom:1px solid var(--border);background:#f8fafc}
    .vo-table th{padding:9px 12px;text-align:left;font-size:11px;font-weight:700;letter-spacing:.5px;
      text-transform:uppercase;color:var(--dim);white-space:nowrap;user-select:none}
    .vo-table th.sortable{cursor:pointer}
    .vo-table th.sortable:hover{color:var(--blue)}
    .vo-table tbody tr{border-bottom:1px solid var(--border);transition:background .1s}
    .vo-table tbody tr:last-child{border-bottom:none}
    .vo-table tbody tr:hover{background:#f8fafc}
    .vo-table tbody tr.expanded{background:#f0f7ff}
    .vo-table td{padding:10px 12px;font-size:13px;vertical-align:middle}

    /* status badge */
    .s-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
    .s-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

    /* payment badge */
    .p-badge{padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600}

    /* inline status select */
    .s-select{padding:5px 8px;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;
      border:1px solid var(--border2);background:var(--white);outline:none;cursor:pointer;transition:all .2s}
    .s-select:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.1)}

    /* expanded detail */
    .vo-detail{background:#f8fafc;border-top:1px solid var(--border)}
    .vo-detail-inner{padding:16px 20px 18px}
    .vo-detail-title{font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--dim);margin-bottom:10px}
    .vo-items-table{width:100%;border-collapse:collapse;font-size:12.5px}
    .vo-items-table th{padding:6px 10px;background:#f1f5f9;border:1px solid var(--border);font-size:11px;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.4px}
    .vo-items-table td{padding:8px 10px;border:1px solid var(--border);vertical-align:middle}
    .vo-item-img{width:36px;height:36px;object-fit:cover;border-radius:7px;border:1px solid var(--border);flex-shrink:0}
    .vo-item-placeholder{width:36px;height:36px;background:#f1f5f9;border-radius:7px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
    .vo-detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:14px}
    .vo-detail-box{background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 12px}
    .vo-detail-box-lbl{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--dim);margin-bottom:5px}
    .vo-detail-box-val{font-size:13px;font-weight:600;color:var(--text)}
    .vo-detail-box-sub{font-size:11.5px;color:var(--mid);margin-top:2px}

    /* order id cell */
    .vo-oid{font-family:monospace;font-size:12px;font-weight:700;color:var(--blue);background:var(--blueFade);padding:3px 7px;border-radius:5px;cursor:pointer;transition:background .15s}
    .vo-oid:hover{background:#dbeafe}

    /* avatar */
    .vo-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0}

    /* amount */
    .vo-amount{font-weight:700;font-size:13.5px}

    /* expand btn */
    .vo-expand-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--bg);
      display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;transition:all .15s;color:var(--mid)}
    .vo-expand-btn:hover{border-color:var(--blue);color:var(--blue);background:var(--blueFade)}

    /* buttons */
    .btn-sm{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;
      font-size:12px;font-weight:600;border:none;cursor:pointer;transition:all .2s}
    .btn-blue{background:var(--blue);color:white}
    .btn-blue:hover{background:#1d4ed8}
    .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--mid)}
    .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--bg)}
    .btn-ghost:disabled{opacity:.45;cursor:not-allowed}

    /* pagination */
    .vo-pager{padding:12px 16px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .vo-pager-info{font-size:12px;color:var(--mid)}
    .pg-btn{width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--white);
      color:var(--mid);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;
      display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif}
    .pg-btn:hover{border-color:var(--blue);color:var(--blue)}
    .pg-btn.active{background:var(--blue);border-color:var(--blue);color:white;font-weight:700}
    .pg-btn:disabled{opacity:.35;cursor:not-allowed}

    /* shimmer */
    .sh-row td{height:56px;padding:0 12px}
    .shimmer{border-radius:5px;height:13px;background:linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%);
      background-size:300% 100%;animation:shim 1.5s ease infinite}
    @keyframes shim{from{background-position:200% 0}to{background-position:-100% 0}}

    /* toast */
    .vo-toast{position:fixed;bottom:20px;right:20px;padding:10px 15px;border-radius:9px;font-size:12.5px;
      font-weight:500;display:flex;align-items:center;gap:8px;z-index:999;white-space:nowrap;
      animation:toastUp .25s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 24px rgba(0,0,0,.13)}
    @keyframes toastUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .vo-toast.success{background:#052e16;color:#86efac;border:1px solid #166534}
    .vo-toast.error{background:#450a0a;color:#fca5a5;border:1px solid #991b1b}
    .toast-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
    .vo-toast.success .toast-dot{background:#22c55e}
    .vo-toast.error .toast-dot{background:#ef4444}

    /* empty */
    .vo-empty{padding:56px 20px;text-align:center}
    .vo-empty-ico{font-size:36px;opacity:.2;margin-bottom:10px}
    .vo-empty-title{font-size:14px;font-weight:700;margin-bottom:4px}
    .vo-empty-sub{font-size:12.5px;color:var(--mid)}

    /* error */
    .vo-error{padding:16px;background:var(--redFade);border:1px solid #fecaca;border-radius:9px;color:#991b1b;
      font-size:13px;margin-bottom:14px;display:flex;align-items:center;gap:8px}

    input[type="checkbox"]{width:14px;height:14px;accent-color:var(--blue);cursor:pointer}

    @media(max-width:768px){
      .vo-stats{grid-template-columns:1fr 1fr}
      .vo-body{padding:14px 12px 56px}
      .vo-bar{padding:0 14px}
      .vo-search{width:160px}
      .vo-detail-grid{grid-template-columns:1fr}
    }
  `;

  /* ── Render ── */
  return (
    <>
      <style>{css}</style>
      <div className="vo">

        {/* Topbar */}
        <div className="vo-bar">
          <div className="vo-bar-icon">🛍️</div>
          <span className="vo-bar-name">Seller Panel</span>
          <div className="vo-bar-sep" />
          <span className="vo-bar-page">Orders</span>
        </div>

        <div className="vo-body">

          {/* Page header */}
          <div className="vo-ph">
            <div>
              <h1>Orders</h1>
              <p>{orders.length} total orders across all statuses</p>
            </div>
            <button className="btn-sm btn-ghost" onClick={fetchOrders} style={{ gap: 6 }}>
              ↺ Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="vo-stats">
            {[
              { icon: "📦", bg: "#eff6ff", val: stats.total,     lbl: "Total Orders" },
              { icon: "⏳", bg: "#fffbeb", val: stats.pending,   lbl: "Pending" },
              { icon: "✅", bg: "#f0fdf4", val: stats.delivered, lbl: "Delivered" },
              { icon: "💰", bg: "#faf5ff", val: `₹${stats.revenue.toLocaleString("en-IN")}`, lbl: "Revenue" },
            ].map((s, i) => (
              <div className="vo-stat" key={i}>
                <div className="vo-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="vo-stat-val">{s.val}</div>
                  <div className="vo-stat-lbl">{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="vo-error">⚠️ {error}</div>
          )}

          {/* Bulk bar */}
          {selectedIds.length > 0 && (
            <div className="vo-bulk">
              <span className="vo-bulk-label">{selectedIds.length} selected</span>
              <select className="vo-sel" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
                <option value="">— Change status —</option>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
              </select>
              <button className="btn-sm btn-blue" onClick={handleBulkStatusUpdate} disabled={!bulkStatus}>Apply</button>
              <button className="btn-sm btn-ghost" onClick={() => { setSelectedIds([]); setBulkStatus(""); }}>✖ Clear</button>
            </div>
          )}

          {/* Table card */}
          <div className="vo-card">

            {/* Toolbar */}
            <div className="vo-toolbar">
              <div className="vo-toolbar-left">
                <div className="vo-search-wrap">
                  <span className="vo-search-ico">⌕</span>
                  <input className="vo-search" placeholder="Search order, customer, item…"
                    value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>

                <select className="vo-sel" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
                </select>

                <select className="vo-sel" value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}>
                  <option value="">All Payments</option>
                  <option value="cod">COD</option>
                  <option value="online">Online</option>
                  <option value="upi">UPI</option>
                </select>

                <select className="vo-sel" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Amount ↓</option>
                  <option value="amount_asc">Amount ↑</option>
                </select>

                {(search || filterStatus || filterPayment) && (
                  <span className="vo-badge-count">{filtered.length} results</span>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="vo-table-wrap">
              <table className="vo-table">
                <thead>
                  <tr>
                    <th style={{ width: 34 }}>
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                    </th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Update Status</th>
                    <th style={{ width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr className="sh-row" key={i}>
                        {[34, 90, 90, 130, 80, 80, 80, 100, 130, 36].map((w, j) => (
                          <td key={j}><div className="shimmer" style={{ width: w }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={10}>
                      <div className="vo-empty">
                        <div className="vo-empty-ico">🛍️</div>
                        <div className="vo-empty-title">{search ? "No orders found" : "No orders yet"}</div>
                        <div className="vo-empty-sub">{search ? `No results for "${search}"` : "Orders will appear here once customers place them"}</div>
                      </div>
                    </td></tr>
                  ) : paginated.map((order) => {
                    const sc       = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const pc       = PAYMENT_CONFIG[order.paymentMode] || { label: order.paymentMode, color: "#64748b", bg: "#f1f5f9" };
                    const isExp    = expandedRow === order._id;
                    const isUpd    = updatingId === order._id;
                    const initials = (order.user?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

                    return (
                      <React.Fragment key={order._id}>
                        <tr className={isExp ? "expanded" : ""}>
                          <td>
                            <input type="checkbox"
                              checked={selectedIds.includes(order._id)}
                              onChange={() => setSelectedIds((prev) =>
                                prev.includes(order._id) ? prev.filter((x) => x !== order._id) : [...prev, order._id]
                              )}
                            />
                          </td>

                          {/* Order ID */}
                          <td>
                            <span className="vo-oid" onClick={() => setExpandedRow(isExp ? null : order._id)}>
                              {shortId(order._id)}
                            </span>
                          </td>

                          {/* Date */}
                          <td>
                            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{fmt(order.createdAt)}</div>
                            <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 1 }}>{fmtTime(order.createdAt)}</div>
                          </td>

                          {/* Customer */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="vo-avatar">{initials}</div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{order.user?.name || "Guest"}</div>
                                <div style={{ fontSize: 11, color: "var(--dim)" }}>{order.user?.phone || "—"}</div>
                              </div>
                            </div>
                          </td>

                          {/* Items count */}
                          <td>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{(order.items || []).length}</span>
                            <span style={{ fontSize: 11, color: "var(--dim)", marginLeft: 4 }}>item{order.items?.length !== 1 ? "s" : ""}</span>
                            {order.items?.[0]?.name && (
                              <div style={{ fontSize: 11, color: "var(--mid)", marginTop: 2, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                              </div>
                            )}
                          </td>

                          {/* Amount */}
                          <td>
                            <span className="vo-amount">₹{(order.totalAmount || 0).toLocaleString("en-IN")}</span>
                          </td>

                          {/* Payment */}
                          <td>
                            <span className="p-badge" style={{ background: pc.bg, color: pc.color }}>{pc.label}</span>
                          </td>

                          {/* Status badge */}
                          <td>
                            <span className="s-badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                              <span className="s-dot" style={{ background: sc.dot }} />
                              {sc.label}
                            </span>
                          </td>

                          {/* Inline status update */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <select
                                className="s-select"
                                value={order.status}
                                disabled={isUpd}
                                onChange={(e) => updateStatus(order._id, e.target.value)}
                              >
                                {ALL_STATUSES.map((s) => (
                                  <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                                ))}
                              </select>
                              {isUpd && <span style={{ fontSize: 11, color: "var(--dim)" }}>…</span>}
                            </div>
                          </td>

                          {/* Expand toggle */}
                          <td>
                            <button className="vo-expand-btn" onClick={() => setExpandedRow(isExp ? null : order._id)} title={isExp ? "Collapse" : "Expand"}>
                              {isExp ? "▲" : "▼"}
                            </button>
                          </td>
                        </tr>

                        {/* ── Expanded detail row ── */}
                        {isExp && (
                          <tr>
                            <td colSpan={10} style={{ padding: 0 }}>
                              <div className="vo-detail">
                                <div className="vo-detail-inner">
                                  <div className="vo-detail-title">Order Items</div>
                                  <table className="vo-items-table">
                                    <thead>
                                      <tr>
                                        <th style={{ width: 50 }}>Image</th>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(order.items || []).map((item, idx) => (
                                        <tr key={idx}>
                                          <td>
                                            {item.image ? (
                                              <img className="vo-item-img" src={item.image} alt={item.name} />
                                            ) : (
                                              <div className="vo-item-placeholder">🛒</div>
                                            )}
                                          </td>
                                          <td style={{ fontWeight: 600 }}>{item.name || "—"}</td>
                                          <td>₹{item.price}</td>
                                          <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                          <td style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                                        </tr>
                                      ))}
                                      <tr style={{ background: "#f8fafc" }}>
                                        <td colSpan={4} style={{ textAlign: "right", fontWeight: 700, paddingRight: 12, fontSize: 13 }}>Total</td>
                                        <td style={{ fontWeight: 800, fontSize: 14, color: "var(--blue)" }}>₹{(order.totalAmount || 0).toLocaleString("en-IN")}</td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  {/* Detail boxes */}
                                  <div className="vo-detail-grid">
                                    <div className="vo-detail-box">
                                      <div className="vo-detail-box-lbl">Customer</div>
                                      <div className="vo-detail-box-val">{order.user?.name || "Guest"}</div>
                                      <div className="vo-detail-box-sub">{order.user?.phone || "—"}</div>
                                      {order.user?.email && <div className="vo-detail-box-sub">{order.user.email}</div>}
                                    </div>
                                    <div className="vo-detail-box">
                                      <div className="vo-detail-box-lbl">Delivery Address</div>
                                      <div className="vo-detail-box-val" style={{ fontSize: 12 }}>
                                        {order.address
                                          ? [order.address.line1, order.address.line2, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(", ")
                                          : "—"}
                                      </div>
                                    </div>
                                    <div className="vo-detail-box">
                                      <div className="vo-detail-box-lbl">Order Info</div>
                                      <div className="vo-detail-box-val">Full ID: <span style={{ fontFamily: "monospace", fontSize: 11 }}>{order._id}</span></div>
                                      <div className="vo-detail-box-sub">Placed: {fmt(order.createdAt)} at {fmtTime(order.createdAt)}</div>
                                      <div className="vo-detail-box-sub">Payment: {order.paymentMode?.toUpperCase() || "—"}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="vo-pager">
                <span className="vo-pager-info">
                  Showing {Math.min((page - 1) * ROWS_PER_PAGE + 1, sorted.length)}–{Math.min(page * ROWS_PER_PAGE, sorted.length)} of {sorted.length}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="pg-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
                  <button className="pg-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const n = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                    return (
                      <button key={n} className={`pg-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                    );
                  })}
                  <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
                  <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`vo-toast ${toast.type}`}>
          <div className="toast-dot" />{toast.msg}
        </div>
      )}
    </>
  );
}