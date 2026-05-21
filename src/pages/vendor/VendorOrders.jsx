// import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const API_URL = "https://foodhelpervendor.onrender.com/api/vendor/orders";

// /* ── Axios with vendor token ── */
// const axiosAuth = axios.create();
// axiosAuth.interceptors.request.use((config) => {
//   const token = localStorage.getItem("vendorToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// /* ── Status Config ── */
// const STATUS_CONFIG = {
//   pending:   { label: "Pending",   color: "#92400e", bg: "#fef3c7", border: "#fde68a", dot: "#f59e0b" },
//   accepted:  { label: "Accepted",  color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe", dot: "#3b82f6" },
//   shipped:   { label: "Shipped",   color: "#5b21b6", bg: "#ede9fe", border: "#ddd6fe", dot: "#8b5cf6" },
//   delivered: { label: "Delivered", color: "#065f46", bg: "#d1fae5", border: "#a7f3d0", dot: "#10b981" },
//   cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", border: "#fecaca", dot: "#ef4444" },
// };

// const PAYMENT_CONFIG = {
//   cod:    { label: "COD",    color: "#5b21b6", bg: "#ede9fe" },
//   online: { label: "Online", color: "#0369a1", bg: "#e0f2fe" },
//   upi:    { label: "UPI",    color: "#047857", bg: "#d1fae5" },
//   cash:   { label: "Cash",   color: "#92400e", bg: "#fef3c7" },
// };

// const ALL_STATUSES = ["pending", "accepted", "shipped", "delivered", "cancelled"];

// /* ── Helpers ── */
// const fmt     = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
// const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
// const shortId = (id) => id ? `#${String(id).slice(-6).toUpperCase()}` : "—";
// const fN      = (n, d = 2) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
// const fC      = (n) => "₹" + fN(n, 2);

// const getPaymentStatus = (order) => {
//   if (order.status === "cancelled") return "cancelled";
//   return order.paymentStatus || "unpaid";
// };

// /* ── CSV Helpers ── */
// const escapeCSV = (val) => {
//   if (val === null || val === undefined) return "";
//   const str = String(val);
//   return str.includes(",") || str.includes('"') || str.includes("\n")
//     ? `"${str.replace(/"/g, '""')}"`
//     : str;
// };

// /* ── GST Invoice CSV Export ── */
// const buildGSTInvoiceCSV = (orders) => {
//   const headers = [
//     "Vch Ref", "Invoice No", "Voucher Date", "Invoice Date", "Voucher TYPE",
//     "Customer Code / Alias", "Customer Name", "Customer Mobile No",
//     "Delivery Name", "Delivery Street", "Delivery City", "Delivery State", "Delivery Pincode", "Delivery Phone",
//     "Full Delivery Address", "Under Group", "GST No",
//     "Product NO", "Product Description", "Stock Category",
//     "HSN", "STORE", "UOM", "Quantity", "Rate", "Amount", "GST %",
//     "SGST Amount", "CGST Amount", "IGST Amount", "Round off", "Line Total", "Remarks"
//   ];

//   const rows = [];
//   let vchRef = 1;

//   orders.forEach((order) => {
//     const invoiceNo      = `INV-${String(order._id).slice(-8).toUpperCase()}`;
//     const voucherDate    = order.createdAt
//       ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
//       : "";
//     const customerCode   = `CUST-${String(order.user?._id || order._id).slice(-6).toUpperCase()}`;
//     const customerName   = order.user?.name  || order.userName  || "Guest";
//     const customerMobile = order.user?.phone || order.address?.phone || "";
//     const addr            = order.address || {};
//     const deliveryName    = addr.name     || customerName;
//     const deliveryStreet  = addr.street   || addr.line1 || addr.address || "";
//     const deliveryCity    = addr.city     || addr.district || addr.town || "";
//     const deliveryState   = addr.state    || "Karnataka";
//     const deliveryPincode = addr.pincode  || addr.zip || addr.postalCode || "";
//     const deliveryPhone   = addr.phone    || addr.mobile || customerMobile;
//     const fullAddress     = [deliveryName, deliveryStreet, deliveryCity, deliveryState, deliveryPincode].filter(Boolean).join(", ");
//     const isInterState    = deliveryState.toLowerCase() !== "karnataka";

//     (order.items || []).forEach((item, itemIndex) => {
//       const productId     = item.product?._id || item.productId || `SKU${String(item._id || itemIndex).slice(-5)}`;
//       const productName   = item.name || "—";
//       const hsn           = item.hsn || item.product?.hsn || "123456";
//       const uom           = item.unit || "Nos";
//       const quantity      = item.quantity || 1;
//       const rate          = item.unitPrice || 0;
//       const amount        = rate * quantity;
//       const gstRate       = item.gstRate || item.product?.gstRate || 0;

//       let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;
//       if (gstRate > 0) {
//         if (isInterState) igstAmount = (amount * gstRate) / 100;
//         else { sgstAmount = (amount * gstRate) / 200; cgstAmount = (amount * gstRate) / 200; }
//       }

//       const rawTotal  = amount + sgstAmount + cgstAmount + igstAmount;
//       const lineTotal = Math.round(rawTotal);
//       const roundOff  = lineTotal - rawTotal;

//       rows.push([
//         vchRef, invoiceNo, voucherDate, voucherDate, "GST Sales",
//         customerCode, customerName, customerMobile,
//         deliveryName, deliveryStreet, deliveryCity, deliveryState, deliveryPincode, deliveryPhone, fullAddress,
//         "Sundry Debtors", order.user?.gstin || "",
//         productId, productName, "Fruits Vegetables Sprouts & Fresh Cut Vegetables/Vegetables",
//         hsn, "Main Location", uom,
//         quantity.toFixed(2), rate.toFixed(2), amount.toFixed(2), gstRate,
//         sgstAmount.toFixed(2), cgstAmount.toFixed(2), igstAmount.toFixed(2),
//         roundOff.toFixed(2), lineTotal.toFixed(2), order.paymentNote || ""
//       ]);
//     });
//     vchRef++;
//   });

//   return [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
// };

// const downloadCSV = (csv, filename) => {
//   const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
//   const url  = URL.createObjectURL(blob);
//   const a    = document.createElement("a");
//   a.href = url; a.download = filename;
//   document.body.appendChild(a); a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// };

// const GSTCSVExportButton = ({ orders, filterStatus }) => {
//   const [exp, setExp] = useState(false);
//   const handle = () => {
//     if (!orders.length) return;
//     setExp(true);
//     try {
//       const today = new Date().toISOString().slice(0, 10);
//       downloadCSV(buildGSTInvoiceCSV(orders), `gst_invoice_${filterStatus ? `${filterStatus}_` : ""}${today}.csv`);
//     } catch (e) { console.error(e); }
//     finally { setExp(false); }
//   };
//   return (
//     <button onClick={handle} disabled={exp || !orders.length}
//       style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: orders.length ? "#8b5cf6" : "#94a3b8", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: orders.length ? "pointer" : "not-allowed", whiteSpace: "nowrap", fontFamily: "inherit" }}>
//       {exp ? "⏳" : "📋"} {exp ? "Exporting..." : `GST Invoice (${orders.length})`}
//     </button>
//   );
// };

// /* ══════════════════════════════════════════════════
//    BUILD INVOICE ORDER HELPER
//    VendorOrders data → Invoice/Estimate page format
// ══════════════════════════════════════════════════ */
// const getVendorInfo = () => {
//   try {
//     const raw = localStorage.getItem("vendorInfo") || localStorage.getItem("vendor");
//     if (raw) return JSON.parse(raw);
//   } catch {}
//   return null;
// };

// const buildInvoiceOrder = (order) => {
//   const vendor = getVendorInfo();
//   const invoiceNo = `INV-${String(order._id).slice(-8).toUpperCase()}`;

//   return {
//     _id:        order._id,
//     invoiceNo,
//     createdAt:  order.createdAt,
//     status:     order.status,
//     paymentMode: order.paymentMode || "cash",
//     paymentNote: order.paymentNote || "",
//     totalPrice:  order.totalPrice  || 0,
//     paidAmount:  order.paidAmount  || 0,

//     vendor: {
//       name:    vendor?.name    || vendor?.shopName || "Your Store",
//       email:   vendor?.email   || "",
//       phone:   vendor?.phone   || "",
//       gstin:   vendor?.gstin   || vendor?.gstNumber || "",
//       address: [vendor?.address, vendor?.city, vendor?.state].filter(Boolean).join(", ") || "",
//     },

//     customer: {
//       name:  order.user?.name  || order.userName || "Guest",
//       phone: order.user?.phone || order.address?.phone || "",
//       email: order.user?.email || "",
//       gstin: order.user?.gstin || "",
//       address: {
//         name:    order.address?.name    || "",
//         street:  order.address?.street  || "",
//         city:    order.address?.city    || "",
//         state:   order.address?.state   || "",
//         pincode: order.address?.pincode || "",
//         phone:   order.address?.phone   || "",
//       },
//     },

//     items: (order.items || []).map((it) => ({
//       name:      it.name      || "—",
//       image:     it.image     || "",
//       unitPrice: it.unitPrice || 0,
//       rate:      it.unitPrice || 0,
//       mrp:       it.mrp       || it.unitPrice || 0,
//       quantity:  it.quantity  || 1,
//       unit:      it.unit      || "pcs",
//       packing:   it.packing   || "",
//       hsn:       it.hsn       || it.product?.hsn || "",
//       gstRate:   it.gstRate   || it.product?.gstRate || 0,
//       product:   it.product,
//     })),
//   };
// };

// /* ── Payment Summary Cards ── */
// const PaymentSummary = ({ orders }) => {
//   const stats = useMemo(() => {
//     let received = 0, pending = 0, totalActive = 0, rcvCount = 0, pendCount = 0;
//     orders.forEach((o) => {
//       if (o.status === "cancelled") return;
//       const tot  = o.totalPrice  || 0;
//       const paid = o.paidAmount  || 0;
//       received   += paid;
//       pending    += Math.max(0, tot - paid);
//       totalActive+= tot;
//       if (paid > 0)   rcvCount++;
//       if (paid < tot) pendCount++;
//     });
//     const pct = totalActive > 0 ? Math.round((received / totalActive) * 100) : 0;
//     return { received, pending, pct, rcvCount, pendCount };
//   }, [orders]);

//   const fmt2 = (n) =>
//     n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
//     : n >= 1000  ? `₹${(n / 1000).toFixed(1)}K`
//     : `₹${n.toFixed(0)}`;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
//       {[
//         { icon: "✅", border: "#a7f3d0", iconBg: "#d1fae5", lbl: "PAYMENT RECEIVED", lc: "#065f46", val: fmt2(stats.received), sub: `${stats.rcvCount} orders` },
//         { icon: "⏳", border: "#fde68a", iconBg: "#fef3c7", lbl: "PAYMENT PENDING",  lc: "#92400e", val: fmt2(stats.pending),  sub: `${stats.pendCount} orders` },
//       ].map((c) => (
//         <div key={c.lbl} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${c.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
//           <div style={{ width: 42, height: 42, borderRadius: 10, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{c.icon}</div>
//           <div>
//             <div style={{ fontSize: 9.5, fontWeight: 700, color: c.lc, letterSpacing: 1, textTransform: "uppercase" }}>{c.lbl}</div>
//             <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{c.val}</div>
//             <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{c.sub}</div>
//           </div>
//         </div>
//       ))}
//       <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #bfdbfe", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
//           <div style={{ width: 42, height: 42, borderRadius: 10, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>📈</div>
//           <div>
//             <div style={{ fontSize: 9.5, fontWeight: 700, color: "#1e40af", letterSpacing: 1, textTransform: "uppercase" }}>COLLECTION RATE</div>
//             <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{stats.pct}%</div>
//           </div>
//         </div>
//         <div style={{ height: 7, background: "#dbeafe", borderRadius: 999, overflow: "hidden" }}>
//           <div style={{ height: "100%", width: `${stats.pct}%`, background: "#3b82f6", borderRadius: 999, transition: "width .7s ease" }} />
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ── Payment Badge ── */
// const PaymentBadge = ({ order }) => {
//   const ps      = getPaymentStatus(order);
//   const paid    = order.paidAmount  || 0;
//   const total   = order.totalPrice  || 0;
//   const pending = Math.max(0, total - paid);

//   if (ps === "cancelled")
//     return <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>— N/A</span>;
//   if (ps === "paid")
//     return (
//       <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//         <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}>✓ Paid</span>
//         <span style={{ fontSize: 9, color: "#94a3b8" }}>₹{paid.toFixed(0)} received</span>
//       </div>
//     );
//   if (ps === "partial")
//     return (
//       <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//         <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" }}>◑ Partial</span>
//         <span style={{ fontSize: 9, color: "#94a3b8" }}>₹{paid.toFixed(0)} / ₹{pending.toFixed(0)} left</span>
//       </div>
//     );
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//       <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>⏳ Unpaid</span>
//       <span style={{ fontSize: 9, color: "#94a3b8" }}>₹{total.toFixed(0)} pending</span>
//     </div>
//   );
// };

// /* ── Payment Update Modal ── */
// const PaymentUpdateModal = ({ order, onClose, onUpdated }) => {
//   const total = order.totalPrice || 0;
//   const [paid, setPaid]     = useState(order.paidAmount ?? 0);
//   const [note, setNote]     = useState(order.paymentNote || "");
//   const [saving, setSaving] = useState(false);
//   const [error,  setError]  = useState("");

//   const safePaid = Math.min(Math.max(0, Number(paid) || 0), total);
//   const pending  = Math.max(0, total - safePaid);
//   const pct      = total > 0 ? Math.round((safePaid / total) * 100) : 0;
//   const status   = safePaid <= 0 ? "unpaid" : safePaid >= total ? "paid" : "partial";

//   const statusStyle = {
//     unpaid:  { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
//     partial: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
//     paid:    { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
//   }[status];

//   const quickAmounts = [
//     { label: "Clear", value: 0 },
//     { label: "25%",   value: Math.round(total * 0.25) },
//     { label: "50%",   value: Math.round(total * 0.5) },
//     { label: "Full",  value: total },
//   ];

//   const handleSave = async () => {
//     setSaving(true); setError("");
//     try {
//       const res = await axiosAuth.put(`${API_URL}/${order._id}/payment`, { paidAmount: safePaid, paymentNote: note });
//       if (res.data.success) { onUpdated(order._id, res.data.data); onClose(); }
//       else setError(res.data.message || "Update fail hua");
//     } catch (err) {
//       setError(err?.response?.data?.message || "Payment update fail hua");
//     } finally { setSaving(false); }
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)", background: "rgba(15,23,42,.45)" }}>
//       <div style={{ background: "#fff", width: "100%", maxWidth: 420, borderRadius: 18, boxShadow: "0 30px 60px rgba(0,0,0,.22)", overflow: "hidden" }}>
//         <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Payment Update</div>
//             <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{shortId(order._id)} · {order.user?.name || "—"}</div>
//           </div>
//           <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", lineHeight: 1, padding: 4 }}>✕</button>
//         </div>
//         <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//             <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 12px" }}>
//               <div style={{ fontSize: 10, color: "#94a3b8" }}>Order Total</div>
//               <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{fC(total)}</div>
//             </div>
//             <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 12px" }}>
//               <div style={{ fontSize: 10, color: "#94a3b8" }}>Status</div>
//               <span style={{ marginTop: 5, display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
//                 {status.charAt(0).toUpperCase() + status.slice(1)}
//               </span>
//             </div>
//           </div>
//           <div>
//             <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Kitna payment mila? (₹)</label>
//             <div style={{ position: "relative" }}>
//               <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontWeight: 700 }}>₹</span>
//               <input type="number" min="0" max={total} step="0.01" value={paid}
//                 onChange={(e) => setPaid(Math.min(Math.max(0, Number(e.target.value) || 0), total))}
//                 style={{ width: "100%", paddingLeft: 28, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: "1px solid #d1d5db", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#0f172a", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
//             </div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
//               {quickAmounts.map((q) => (
//                 <button key={q.label} onClick={() => setPaid(q.value)}
//                   style={{ padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1px solid ${safePaid === q.value ? "#059669" : "#d1d5db"}`, background: safePaid === q.value ? "#059669" : "#f9fafb", color: safePaid === q.value ? "#fff" : "#374151", transition: "all .15s" }}>
//                   {q.label} {q.value > 0 ? `₹${q.value}` : ""}
//                 </button>
//               ))}
//             </div>
//           </div>
//           <div>
//             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, marginBottom: 6 }}>
//               <span style={{ color: "#059669" }}>Paid: {fC(safePaid)} ({pct}%)</span>
//               <span style={{ color: "#d97706" }}>Pending: {fC(pending)}</span>
//             </div>
//             <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden", border: "1px solid #e2e8f0" }}>
//               <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#16a34a" : pct > 0 ? "#2563eb" : "#d1d5db", borderRadius: 999, transition: "width .3s" }} />
//             </div>
//           </div>
//           <div>
//             <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
//               Payment Note <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span>
//             </label>
//             <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
//               placeholder="e.g. UPI ref, cash collected..."
//               style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 12, color: "#374151", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
//           </div>
//           {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#991b1b" }}>⚠️ {error}</div>}
//         </div>
//         <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10 }}>
//           <button onClick={onClose} style={{ flex: 1, padding: "10px 0", border: "1px solid #d1d5db", borderRadius: 10, background: "#fff", fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
//           <button onClick={handleSave} disabled={saving}
//             style={{ flex: 2, padding: "10px 0", border: "none", borderRadius: 10, background: saving ? "#059669" : "#16a34a", color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
//             {saving ? "Saving..." : `Save — ${fC(safePaid)} (${pct}%)`}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ── Edit Items Modal ── */
// const EditItemsModal = ({ order, onClose, onUpdated }) => {
//   const [items, setItems] = useState((order.items || []).map((it) => ({ ...it, _newQty: it.quantity })));
//   const [saving, setSaving] = useState(false);
//   const [error,  setError]  = useState("");

//   const setQty = (idx, val) => {
//     setItems((prev) => {
//       const next = [...prev];
//       next[idx] = { ...next[idx], _newQty: Math.max(1, Number(val) || 1) };
//       return next;
//     });
//   };

//   const newTotal = items.reduce((s, it) => s + (it.unitPrice || 0) * it._newQty, 0);

//   const handleSave = async () => {
//     setSaving(true); setError("");
//     try {
//       const payload = items.map((it) => ({ product: String(it.product?._id || it.product), quantity: it._newQty }));
//       const res = await axiosAuth.put(`${API_URL}/${order._id}/items`, { items: payload });
//       if (res.data.success) { onUpdated(order._id, res.data.data); onClose(); }
//       else setError(res.data.message || "Update fail hua");
//     } catch (err) {
//       setError(err?.response?.data?.message || "Items update fail hua");
//     } finally { setSaving(false); }
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)", background: "rgba(15,23,42,.45)" }}>
//       <div style={{ background: "#fff", width: "100%", maxWidth: 520, borderRadius: 18, boxShadow: "0 30px 60px rgba(0,0,0,.22)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
//         <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Edit Order Items</div>
//             <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{shortId(order._id)} · Sirf quantity edit ho sakti hai</div>
//           </div>
//           <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", lineHeight: 1, padding: 4 }}>✕</button>
//         </div>
//         <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ background: "#f8fafc" }}>
//                 {["Product", "Unit Price", "Qty", "Subtotal"].map((h) => (
//                   <th key={h} style={{ padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "#64748b", textAlign: h === "Product" ? "left" : "right", borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((it, idx) => (
//                 <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
//                   <td style={{ padding: "10px", fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>
//                     <div>{it.name || "—"}</div>
//                     {it.unit && <div style={{ fontSize: 10, color: "#94a3b8" }}>{it.unit}</div>}
//                   </td>
//                   <td style={{ padding: "10px", textAlign: "right", fontSize: 12, color: "#374151" }}>{fC(it.unitPrice || 0)}</td>
//                   <td style={{ padding: "10px", textAlign: "right" }}>
//                     <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
//                       <button onClick={() => setQty(idx, it._newQty - 1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
//                       <input type="number" min="1" value={it._newQty}
//                         onChange={(e) => setQty(idx, e.target.value)}
//                         style={{ width: 46, textAlign: "center", padding: "4px 6px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 13, fontWeight: 700, outline: "none", fontFamily: "inherit" }} />
//                       <button onClick={() => setQty(idx, it._newQty + 1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
//                     </div>
//                   </td>
//                   <td style={{ padding: "10px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#1e40af" }}>{fC((it.unitPrice || 0) * it._newQty)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div style={{ marginTop: 14, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>New Total</span>
//             <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{fC(newTotal)}</span>
//           </div>
//           {error && <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#991b1b" }}>⚠️ {error}</div>}
//         </div>
//         <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, flexShrink: 0 }}>
//           <button onClick={onClose} style={{ flex: 1, padding: "10px 0", border: "1px solid #d1d5db", borderRadius: 10, background: "#fff", fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
//           <button onClick={handleSave} disabled={saving}
//             style={{ flex: 2, padding: "10px 0", border: "none", borderRadius: 10, background: saving ? "#1e40af" : "#2563eb", color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
//             {saving ? "Saving..." : `Save Changes — ${fC(newTotal)}`}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════════ */
// export default function VendorOrders() {
//   const [orders,         setOrders]         = useState([]);
//   const [loading,        setLoading]        = useState(false);
//   const [error,          setError]          = useState("");
//   const [search,         setSearch]         = useState("");
//   const [filterStatus,   setFilterStatus]   = useState("");
//   const [filterPayment,  setFilterPayment]  = useState("");
//   const [sortBy,         setSortBy]         = useState("date_desc");
//   const [page,           setPage]           = useState(1);
//   const [expandedRow,    setExpandedRow]    = useState(null);
//   const [updatingId,     setUpdatingId]     = useState(null);
//   const [toast,          setToast]          = useState(null);
//   const [selectedIds,    setSelectedIds]    = useState([]);
//   const [bulkStatus,     setBulkStatus]     = useState("");
//   const [paymentModalId, setPaymentModalId] = useState(null);
//   const [editModalId,    setEditModalId]    = useState(null);

//   const navigate = useNavigate();
//   const ROWS     = 15;

//   const notify = useCallback((msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3200);
//   }, []);

//   const fetchOrders = useCallback(async () => {
//     setLoading(true); setError("");
//     try {
//       const res = await axiosAuth.get(API_URL);
//       if (res.data?.success) setOrders(res.data.data || []);
//       else setError("Orders load nahi hue");
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load orders");
//     } finally { setLoading(false); }
//   }, []);

//   useEffect(() => { fetchOrders(); }, [fetchOrders]);

//   const updateStatus = async (orderId, status) => {
//     setUpdatingId(orderId);
//     try {
//       await axiosAuth.put(`${API_URL}/${orderId}/status`, { status });
//       setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
//       notify(`Status updated → ${STATUS_CONFIG[status]?.label || status}`);
//     } catch { notify("Status update fail hua", "error"); }
//     finally { setUpdatingId(null); }
//   };

//   const handleBulkUpdate = async () => {
//     if (!bulkStatus || !selectedIds.length) return;
//     try {
//       await Promise.all(selectedIds.map((id) => axiosAuth.put(`${API_URL}/${id}/status`, { status: bulkStatus })));
//       setOrders((prev) => prev.map((o) => selectedIds.includes(o._id) ? { ...o, status: bulkStatus } : o));
//       notify(`${selectedIds.length} orders updated → ${STATUS_CONFIG[bulkStatus]?.label}`);
//       setSelectedIds([]); setBulkStatus("");
//     } catch { notify("Bulk update fail hua", "error"); }
//   };

//   const handlePaymentUpdated = useCallback((orderId, data) => {
//     setOrders((prev) => prev.map((o) => o._id === orderId
//       ? { ...o, paidAmount: data.paidAmount, paymentStatus: data.paymentStatus, paymentNote: data.paymentNote }
//       : o
//     ));
//     notify("Payment updated ✓");
//   }, [notify]);

//   const handleItemsUpdated = useCallback((orderId, data) => {
//     setOrders((prev) => prev.map((o) => o._id === orderId
//       ? { ...o, items: data.items, totalPrice: data.totalPrice, paidAmount: data.paidAmount, paymentStatus: data.paymentStatus }
//       : o
//     ));
//     notify("Items updated ✓");
//   }, [notify]);

//   /* ── Navigate to Invoice ── */
//   const openInvoice = useCallback((order) => {
//     const invoiceOrder = buildInvoiceOrder(order);
//     navigate("/vendor/invoice", { state: { order: invoiceOrder } });
//   }, [navigate]);

//   /* ── Navigate to Estimate ── */
//   const openEstimate = useCallback((order) => {
//     const invoiceOrder = buildInvoiceOrder(order);
//     navigate("/vendor/estimate", { state: { order: invoiceOrder } });
//   }, [navigate]);

//   /* ── Filter + Sort ── */
//   const filtered = orders.filter((o) => {
//     const t = search.toLowerCase();
//     const matchText = (o._id || "").toLowerCase().includes(t)
//       || (o.user?.name || "").toLowerCase().includes(t)
//       || (o.user?.phone || "").includes(t)
//       || (o.items || []).some((i) => (i.name || "").toLowerCase().includes(t));
//   //   return matchText
//   //     && (!filterStatus  || o.status      === filterStatus)
//   //     && (!filterPayment || o.paymentMode === filterPayment);
//   // });
//   return (
//   matchText &&
//   (
//     !filterStatus ||
//     o.status === filterStatus ||
//     (
//       filterStatus === "cancelled" &&
//       (
//         o.status === "canceled" ||
//         o.status === "cancelled"
//       )
//     )
//   ) &&
//   (
//     !filterPayment ||
//     o.paymentMode === filterPayment
//   )
// );
// });

//   const sorted = [...filtered].sort((a, b) => {
//     if (sortBy === "date_desc")   return new Date(b.createdAt) - new Date(a.createdAt);
//     if (sortBy === "date_asc")    return new Date(a.createdAt) - new Date(b.createdAt);
//     if (sortBy === "amount_desc") return (b.totalPrice || 0) - (a.totalPrice || 0);
//     if (sortBy === "amount_asc")  return (a.totalPrice || 0) - (b.totalPrice || 0);
//     return 0;
//   });

//   const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS));
//   const paginated  = sorted.slice((page - 1) * ROWS, page * ROWS);
//   const allSel     = paginated.length > 0 && paginated.every((o) => selectedIds.includes(o._id));

//   const toggleAll = () =>
//     setSelectedIds(allSel
//       ? selectedIds.filter((id) => !paginated.find((o) => o._id === id))
//       : [...new Set([...selectedIds, ...paginated.map((o) => o._id)])]);

//   const stats = {
//     total:     orders.length,
//     pending:   orders.filter((o) => o.status === "pending").length,
//     delivered: orders.filter((o) => o.status === "delivered").length,
//     revenue:   orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.totalPrice || 0), 0),
//   };

//   const paymentModalOrder = paymentModalId ? orders.find((o) => o._id === paymentModalId) : null;
//   const editModalOrder    = editModalId    ? orders.find((o) => o._id === editModalId)    : null;

//   /* ── CSS ── */
//   const css = `
//     @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
//     :root{
//       --bg:#f1f5f9;--white:#fff;--border:#e2e8f0;--border2:#cbd5e1;
//       --text:#0f172a;--mid:#475569;--dim:#94a3b8;
//       --blue:#2563eb;--blueFade:#eff6ff;
//       --red:#ef4444;--redFade:#fef2f2;
//       --green:#16a34a;--greenFade:#f0fdf4;
//       --amber:#d97706;--amberFade:#fffbeb;
//       --violet:#7c3aed;--violetFade:#f5f3ff;
//       --shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
//       --r:10px;
//     }
//     *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
//     .vo{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);min-height:100vh;color:var(--text)}
//     .vo-bar{background:var(--white);border-bottom:1px solid var(--border);height:56px;padding:0 24px;
//       display:flex;align-items:center;position:sticky;top:0;z-index:50;gap:10px}
//     .vo-bar-icon{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#2563eb,#4f46e5);
//       display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
//     .vo-bar-sep{width:1px;height:16px;background:var(--border);margin:0 4px}
//     .vo-body{padding:20px 24px 60px;max-width:1700px;margin:0 auto}
//     .vo-ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px}
//     .vo-ph h1{font-size:20px;font-weight:800;letter-spacing:-.3px}
//     .vo-ph p{font-size:12px;color:var(--mid);margin-top:2px}
//     .vo-ph-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
//     .vo-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
//     .vo-stat{background:var(--white);border:1px solid var(--border);border-radius:var(--r);
//       padding:14px 16px;box-shadow:var(--shadow);display:flex;align-items:center;gap:12px}
//     .vo-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;
//       justify-content:center;font-size:18px;flex-shrink:0}
//     .vo-stat-val{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
//     .vo-stat-lbl{font-size:11px;color:var(--mid);font-weight:500;margin-top:3px}
//     .vo-card{background:var(--white);border:1px solid var(--border);border-radius:12px;
//       box-shadow:var(--shadow);overflow:hidden}
//     .vo-toolbar{padding:12px 16px;border-bottom:1px solid var(--border);
//       display:flex;align-items:center;gap:10px;flex-wrap:wrap}
//     .vo-tbl-left{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap}
//     .vo-search{position:relative}
//     .vo-search input{padding:7px 10px 7px 30px;border:1px solid var(--border);border-radius:8px;
//       font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;outline:none;width:210px;
//       background:var(--bg);transition:all .2s;color:var(--text)}
//     .vo-search input:focus{border-color:var(--blue);background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.08)}
//     .vo-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--dim);pointer-events:none}
//     .vo-sel{padding:7px 10px;border:1px solid var(--border);border-radius:8px;
//       font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:var(--text);
//       background:var(--bg);outline:none;cursor:pointer}
//     .vo-sel:focus{border-color:var(--blue)}
//     .vo-bulk{background:#eef2ff;border:1px solid #c7d2fe;border-radius:9px;
//       padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
//     .vo-table-wrap{overflow-x:auto}
//     .vo-table{width:100%;border-collapse:collapse;min-width:1400px}
//     .vo-table thead tr{border-bottom:1px solid var(--border);background:#f8fafc}
//     .vo-table th{padding:9px 10px;text-align:left;font-size:10.5px;font-weight:700;
//       letter-spacing:.5px;text-transform:uppercase;color:var(--dim);white-space:nowrap}
//     .vo-table tbody tr{border-bottom:1px solid var(--border);transition:background .1s}
//     .vo-table tbody tr:last-child{border-bottom:none}
//     .vo-table tbody tr:hover{background:#fafafa}
//     .vo-table tbody tr.exp{background:#f0f7ff}
//     .vo-table td{padding:9px 10px;font-size:13px;vertical-align:middle}
//     .s-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:20px;
//       font-size:11px;font-weight:700;white-space:nowrap}
//     .s-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
//     .p-badge{padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600}
//     .s-sel{padding:5px 8px;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;
//       font-size:12px;font-weight:600;border:1px solid var(--border2);background:var(--white);
//       outline:none;cursor:pointer;transition:all .2s}
//     .s-sel:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.1)}
//     .vo-detail{background:#f8fafc;border-top:1px solid var(--border)}
//     .vo-detail-inner{padding:16px 20px 18px}
//     .vo-items-tbl{width:100%;border-collapse:collapse;font-size:12.5px}
//     .vo-items-tbl th{padding:6px 10px;background:#f1f5f9;border:1px solid var(--border);
//       font-size:10.5px;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.4px}
//     .vo-items-tbl td{padding:8px 10px;border:1px solid var(--border);vertical-align:middle}
//     .vo-item-img{width:36px;height:36px;object-fit:cover;border-radius:7px;border:1px solid var(--border)}
//     .vo-item-ph{width:36px;height:36px;background:#f1f5f9;border-radius:7px;border:1px solid var(--border);
//       display:flex;align-items:center;justify-content:center;font-size:15px}
//     .vo-detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:14px}
//     .vo-dbox{background:#fff;border:1px solid var(--border);border-radius:8px;padding:10px 12px}
//     .vo-dbox-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--dim);margin-bottom:5px}
//     .vo-dbox-val{font-size:13px;font-weight:600;color:var(--text)}
//     .vo-dbox-sub{font-size:11px;color:var(--mid);margin-top:2px}
//     .vo-oid{font-family:monospace;font-size:12px;font-weight:700;color:var(--blue);
//       background:var(--blueFade);padding:3px 7px;border-radius:5px;cursor:pointer}
//     .vo-oid:hover{background:#dbeafe}
//     .vo-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
//       display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff}
//     .vo-exp-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);
//       background:var(--bg);display:flex;align-items:center;justify-content:center;
//       cursor:pointer;font-size:12px;transition:all .15s;color:var(--mid)}
//     .vo-exp-btn:hover{border-color:var(--blue);color:var(--blue);background:var(--blueFade)}
//     .btn{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border-radius:7px;
//       font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;
//       border:none;cursor:pointer;transition:all .2s;white-space:nowrap}
//     .btn-blue{background:var(--blue);color:#fff}.btn-blue:hover{background:#1d4ed8}
//     .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--mid)}
//     .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--bg)}
//     .btn-amber{background:#fef3c7;color:#92400e;border:1px solid #fde68a}.btn-amber:hover{background:#fde68a}
//     .btn-emerald{background:#d1fae5;color:#065f46;border:1px solid #a7f3d0}.btn-emerald:hover{background:#a7f3d0}
//     .btn-violet{background:var(--violetFade);color:var(--violet);border:1px solid #ddd6fe}.btn-violet:hover{background:#ede9fe}
//     .btn-slate{background:#1e293b;color:#f8fafc;border:1px solid #334155}.btn-slate:hover{background:#0f172a}
//     .btn-orange{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}.btn-orange:hover{background:#ffedd5}
//     .vo-pager{padding:12px 16px;border-top:1px solid var(--border);
//       display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
//     .vo-pager-info{font-size:12px;color:var(--mid)}
//     .pg-btn{width:28px;height:28px;border-radius:6px;border:1px solid var(--border);
//       background:#fff;color:var(--mid);font-size:12px;cursor:pointer;transition:all .15s;
//       display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif}
//     .pg-btn:hover:not(:disabled){border-color:var(--blue);color:var(--blue)}
//     .pg-btn.active{background:var(--blue);border-color:var(--blue);color:#fff;font-weight:700}
//     .pg-btn:disabled{opacity:.35;cursor:not-allowed}
//     .sh-row td{height:52px;padding:0 11px}
//     .shimmer{border-radius:5px;height:12px;background:linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%);
//       background-size:300% 100%;animation:shim 1.4s ease infinite}
//     @keyframes shim{from{background-position:200% 0}to{background-position:-100% 0}}
//     .vo-toast{position:fixed;bottom:20px;right:20px;padding:10px 15px;border-radius:9px;
//       font-size:12.5px;font-weight:500;display:flex;align-items:center;gap:8px;z-index:9999;
//       white-space:nowrap;animation:toastUp .25s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 24px rgba(0,0,0,.13)}
//     @keyframes toastUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
//     .vo-toast.success{background:#052e16;color:#86efac;border:1px solid #166534}
//     .vo-toast.error{background:#450a0a;color:#fca5a5;border:1px solid #991b1b}
//     .toast-dot{width:6px;height:6px;border-radius:50%}
//     .vo-toast.success .toast-dot{background:#22c55e}
//     .vo-toast.error .toast-dot{background:#ef4444}
//     .vo-empty{padding:56px 20px;text-align:center}
//     .vo-error{padding:14px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:9px;
//       color:#991b1b;font-size:13px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
//     input[type=checkbox]{width:14px;height:14px;accent-color:var(--blue);cursor:pointer}
//     .inv-actions{display:flex;flex-direction:column;gap:4px}
//     @media(max-width:768px){
//       .vo-stats{grid-template-columns:1fr 1fr}
//       .vo-body{padding:14px 12px 56px}
//       .vo-bar{padding:0 14px}
//     }
//   `;

//   return (
//     <>
//       <style>{css}</style>
//       <div className="vo">
//         <div className="vo-bar">
//           <div className="vo-bar-icon">🛍️</div>
//           <span style={{ fontSize: 14, fontWeight: 700 }}>Seller Panel</span>
//           <div className="vo-bar-sep" />
//           <span style={{ fontSize: 13, color: "#475569" }}>Orders</span>
//         </div>

//         <div className="vo-body">
//           <div className="vo-ph">
//             <div>
//               <h1>Orders</h1>
//               <p>{orders.length} total orders across all statuses</p>
//             </div>
//             <div className="vo-ph-actions">
//               <GSTCSVExportButton orders={sorted} filterStatus={filterStatus} />
//               <button className="btn btn-ghost" onClick={fetchOrders} style={{ fontSize: 12 }}>↺ Refresh</button>
//             </div>
//           </div>

//           <div className="vo-stats">
//             {[
//               { icon: "📦", bg: "#eff6ff", val: stats.total,     lbl: "Total Orders" },
//               { icon: "⏳", bg: "#fffbeb", val: stats.pending,   lbl: "Pending" },
//               { icon: "✅", bg: "#f0fdf4", val: stats.delivered, lbl: "Delivered" },
//               { icon: "💰", bg: "#faf5ff", val: fC(stats.revenue), lbl: "Revenue" },
//             ].map((s, i) => (
//               <div className="vo-stat" key={i}>
//                 <div className="vo-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
//                 <div>
//                   <div className="vo-stat-val">{s.val}</div>
//                   <div className="vo-stat-lbl">{s.lbl}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <PaymentSummary orders={orders} />

//           {error && (
//             <div className="vo-error">
//               ⚠️ {error}
//               <button className="btn btn-ghost" onClick={fetchOrders} style={{ marginLeft: "auto", fontSize: 11 }}>Retry</button>
//             </div>
//           )}

//           {selectedIds.length > 0 && (
//             <div className="vo-bulk">
//               <span style={{ fontSize: 13, fontWeight: 600, color: "#4338ca" }}>{selectedIds.length} selected</span>
//               <select className="vo-sel" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
//                 <option value="">— Change status —</option>
//                 {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
//               </select>
//               <button className="btn btn-blue" onClick={handleBulkUpdate} disabled={!bulkStatus} style={{ fontSize: 12 }}>Apply</button>
//               <button className="btn btn-ghost" onClick={() => { setSelectedIds([]); setBulkStatus(""); }} style={{ fontSize: 12 }}>✖ Clear</button>
//             </div>
//           )}

//           <div className="vo-card">
//             <div className="vo-toolbar">
//               <div className="vo-tbl-left">
//                 <div className="vo-search">
//                   <span className="vo-search-ico">⌕</span>
//                   <input placeholder="Search order, customer, item…" value={search}
//                     onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
//                 </div>
//                 <select className="vo-sel" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
//                   <option value="">All Statuses</option>
//                   {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
//                 </select>
//                 <select className="vo-sel" value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}>
//                   <option value="">All Payments</option>
//                   {Object.entries(PAYMENT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
//                 </select>
//                 <select className="vo-sel" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
//                   <option value="date_desc">Newest First</option>
//                   <option value="date_asc">Oldest First</option>
//                   <option value="amount_desc">Amount ↓</option>
//                   <option value="amount_asc">Amount ↑</option>
//                 </select>
//                 {(search || filterStatus || filterPayment) && (
//                   <span style={{ padding: "3px 8px", borderRadius: 20, border: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, color: "#64748b" }}>{filtered.length} results</span>
//                 )}
//               </div>
//             </div>

//             <div className="vo-table-wrap">
//               <table className="vo-table">
//                 <thead>
//                   <tr>
//                     <th style={{ width: 34 }}><input type="checkbox" checked={allSel} onChange={toggleAll} /></th>
//                     <th>Order ID</th>
//                     <th>Date</th>
//                     <th>Customer</th>
//                     <th>Items</th>
//                     <th>Amount</th>
//                     <th>Payment</th>
//                     <th>Pay Status</th>
//                     <th>Status</th>
//                     <th>Update Status</th>
//                     <th>💳 Payment</th>
//                     <th>✏️ Items</th>
//                     <th>📄 Invoice</th>
//                     <th style={{ width: 36 }}></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     [1,2,3,4,5].map((i) => (
//                       <tr className="sh-row" key={i}>
//                         {Array(14).fill(0).map((_, j) => (
//                           <td key={j}><div className="shimmer" style={{ width: [34,90,90,130,70,80,70,90,100,130,80,80,100,36][j] }} /></td>
//                         ))}
//                       </tr>
//                     ))
//                   ) : paginated.length === 0 ? (
//                     <tr><td colSpan={14}>
//                       <div className="vo-empty">
//                         <div style={{ fontSize: 36, opacity: .2, marginBottom: 10 }}>🛍️</div>
//                         <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{search ? "No orders found" : "No orders yet"}</div>
//                         <div style={{ fontSize: 12, color: "#94a3b8" }}>
//                           {search ? `No results for "${search}"` : "Orders will appear here once customers place them"}
//                         </div>
//                       </div>
//                     </td></tr>
//                   ) : paginated.map((order) => {
//                     const sc    = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
//                     const pc    = PAYMENT_CONFIG[order.paymentMode] || { label: order.paymentMode || "—", color: "#64748b", bg: "#f1f5f9" };
//                     const isExp = expandedRow === order._id;
//                     const isUpd = updatingId  === order._id;
//                     const ps    = getPaymentStatus(order);
//                     const initials = (order.user?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

//                     return (
//                       <React.Fragment key={order._id}>
//                         <tr className={isExp ? "exp" : ""}>
//                           <td>
//                             <input type="checkbox"
//                               checked={selectedIds.includes(order._id)}
//                               onChange={() => setSelectedIds((p) => p.includes(order._id) ? p.filter((x) => x !== order._id) : [...p, order._id])} />
//                           </td>
//                           <td>
//                             <span className="vo-oid" onClick={() => setExpandedRow(isExp ? null : order._id)}>{shortId(order._id)}</span>
//                           </td>
//                           <td>
//                             <div style={{ fontSize: 12.5, fontWeight: 600 }}>{fmt(order.createdAt)}</div>
//                             <div style={{ fontSize: 11, color: "#94a3b8" }}>{fmtTime(order.createdAt)}</div>
//                           </td>
//                           <td>
//                             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                               <div className="vo-avatar">{initials}</div>
//                               <div>
//                                 <div style={{ fontWeight: 600, fontSize: 12.5 }}>{order.user?.name || "Guest"}</div>
//                                 <div style={{ fontSize: 11, color: "#94a3b8" }}>{order.user?.phone || "—"}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td>
//                             <span style={{ fontWeight: 700, fontSize: 13 }}>{(order.items || []).length}</span>
//                             <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>item{order.items?.length !== 1 ? "s" : ""}</span>
//                             {order.items?.[0]?.name && (
//                               <div style={{ fontSize: 10.5, color: "#475569", marginTop: 2, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                 {order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
//                               </div>
//                             )}
//                           </td>
//                           <td>
//                             <div style={{ fontWeight: 700, fontSize: 13.5 }}>{fC(order.totalPrice || 0)}</div>
//                             {(order.paidAmount > 0 && order.paidAmount < (order.totalPrice || 0)) && (
//                               <div style={{ fontSize: 9, color: "#d97706", marginTop: 1 }}>₹{Math.max(0, (order.totalPrice || 0) - order.paidAmount).toFixed(0)} left</div>
//                             )}
//                           </td>
//                           <td><span className="p-badge" style={{ background: pc.bg, color: pc.color }}>{pc.label}</span></td>
//                           <td><PaymentBadge order={order} /></td>
//                           <td>
//                             <span className="s-badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
//                               <span className="s-dot" style={{ background: sc.dot }} />
//                               {sc.label}
//                             </span>
//                           </td>
//                           <td>
//                             <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//                               <select className="s-sel" value={order.status} disabled={isUpd}
//                                 onChange={(e) => updateStatus(order._id, e.target.value)}>
//                                 {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
//                               </select>
//                               {isUpd && <span style={{ fontSize: 11, color: "#94a3b8" }}>…</span>}
//                             </div>
//                           </td>
//                           <td>
//                             <button className={`btn ${ps === "paid" ? "btn-emerald" : ps === "partial" ? "btn-blue" : "btn-amber"}`}
//                               onClick={() => setPaymentModalId(order._id)}>
//                               💳 {ps === "paid" ? "Paid" : ps === "partial" ? `₹${(order.paidAmount || 0).toFixed(0)}` : "Pay"}
//                             </button>
//                           </td>
//                           <td>
//                             <button className="btn btn-violet" onClick={() => setEditModalId(order._id)}>
//                               ✏️ Edit
//                             </button>
//                           </td>
//                           {/* ── Invoice / Estimate Buttons ── */}
//                           <td>
//                             <div className="inv-actions">
//                               <button className="btn btn-slate" onClick={() => openInvoice(order)}>
//                                 🧾 Invoice
//                               </button>
//                               <button className="btn btn-orange" onClick={() => openEstimate(order)}>
//                                 📋 Estimate
//                               </button>
//                             </div>
//                           </td>
//                           <td>
//                             <button className="vo-exp-btn" onClick={() => setExpandedRow(isExp ? null : order._id)}>
//                               {isExp ? "▲" : "▼"}
//                             </button>
//                           </td>
//                         </tr>

//                         {isExp && (
//                           <tr><td colSpan={14} style={{ padding: 0 }}>
//                             <div className="vo-detail">
//                               <div className="vo-detail-inner">
//                                 <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }}>Order Items</div>
//                                 <table className="vo-items-tbl">
//                                   <thead>
//                                     <tr>
//                                       <th style={{ width: 50 }}>Image</th>
//                                       <th>Product</th>
//                                       <th>Unit Price</th>
//                                       <th>Qty</th>
//                                       <th>Subtotal</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {(order.items || []).map((item, idx) => (
//                                       <tr key={idx}>
//                                         <td>{item.image ? <img className="vo-item-img" src={item.image} alt={item.name} /> : <div className="vo-item-ph">🛒</div>}</td>
//                                         <td style={{ fontWeight: 600 }}>{item.name || "—"}</td>
//                                         <td>{fC(item.unitPrice || 0)}</td>
//                                         <td style={{ textAlign: "center" }}>{item.quantity}</td>
//                                         <td style={{ fontWeight: 700 }}>{fC((item.unitPrice || 0) * item.quantity)}</td>
//                                       </tr>
//                                     ))}
//                                     <tr style={{ background: "#f8fafc" }}>
//                                       <td colSpan={4} style={{ textAlign: "right", fontWeight: 700, paddingRight: 12, fontSize: 12 }}>Total</td>
//                                       <td style={{ fontWeight: 800, fontSize: 14, color: "#2563eb" }}>{fC(order.totalPrice || 0)}</td>
//                                     </tr>
//                                   </tbody>
//                                 </table>
//                                 <div className="vo-detail-grid">
//                                   <div className="vo-dbox">
//                                     <div className="vo-dbox-lbl">Customer</div>
//                                     <div className="vo-dbox-val">{order.user?.name || "Guest"}</div>
//                                     <div className="vo-dbox-sub">{order.user?.phone || "—"}</div>
//                                     {order.user?.email && <div className="vo-dbox-sub">{order.user.email}</div>}
//                                   </div>
//                                   <div className="vo-dbox">
//                                     <div className="vo-dbox-lbl">Delivery Address</div>
//                                     <div className="vo-dbox-val" style={{ fontSize: 12 }}>
//                                       {order.address
//                                         ? [order.address.name, order.address.street, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(", ")
//                                         : "—"}
//                                     </div>
//                                     {order.address?.phone && <div className="vo-dbox-sub">📞 {order.address.phone}</div>}
//                                   </div>
//                                   <div className="vo-dbox">
//                                     <div className="vo-dbox-lbl">Payment Info</div>
//                                     <div className="vo-dbox-val">Paid: {fC(order.paidAmount || 0)}</div>
//                                     <div className="vo-dbox-sub">Pending: {fC(Math.max(0, (order.totalPrice || 0) - (order.paidAmount || 0)))}</div>
//                                     {order.paymentNote && <div className="vo-dbox-sub">Note: {order.paymentNote}</div>}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </td></tr>
//                         )}
//                       </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="vo-pager">
//               <span className="vo-pager-info">
//                 {totalPages > 1
//                   ? `Showing ${Math.min((page-1)*ROWS+1, sorted.length)}–${Math.min(page*ROWS, sorted.length)} of ${sorted.length}`
//                   : `${sorted.length} order${sorted.length !== 1 ? "s" : ""}`}
//               </span>
//               <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
//                 {sorted.length > 0 && <GSTCSVExportButton orders={sorted} filterStatus={filterStatus} />}
//                 {totalPages > 1 && (
//                   <div style={{ display: "flex", gap: 4 }}>
//                     <button className="pg-btn" disabled={page===1} onClick={() => setPage(1)}>«</button>
//                     <button className="pg-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
//                     {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
//                       const n = totalPages <= 7 ? i+1 : page <= 4 ? i+1 : page >= totalPages-3 ? totalPages-6+i : page-3+i;
//                       return <button key={n} className={`pg-btn ${page===n?"active":""}`} onClick={() => setPage(n)}>{n}</button>;
//                     })}
//                     <button className="pg-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>›</button>
//                     <button className="pg-btn" disabled={page===totalPages} onClick={() => setPage(totalPages)}>»</button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {paymentModalOrder && (
//         <PaymentUpdateModal order={paymentModalOrder} onClose={() => setPaymentModalId(null)} onUpdated={handlePaymentUpdated} />
//       )}
//       {editModalOrder && (
//         <EditItemsModal order={editModalOrder} onClose={() => setEditModalId(null)} onUpdated={handleItemsUpdated} />
//       )}

//       {toast && (
//         <div className={`vo-toast ${toast.type}`}>
//           <div className="toast-dot" />{toast.msg}
//         </div>
//       )}
//     </>
//   );
// }

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://foodhelpervendor.onrender.com/api/vendor/orders";

/* ── Axios with vendor token ── */
const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Status Config ── */
const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "#92400e", bg: "#fef3c7", border: "#fde68a", dot: "#f59e0b" },
  accepted:  { label: "Accepted",  color: "#1e40af", bg: "#dbeafe", border: "#bfdbfe", dot: "#3b82f6" },
  shipped:   { label: "Shipped",   color: "#5b21b6", bg: "#ede9fe", border: "#ddd6fe", dot: "#8b5cf6" },
  delivered: { label: "Delivered", color: "#065f46", bg: "#d1fae5", border: "#a7f3d0", dot: "#10b981" },
  cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", border: "#fecaca", dot: "#ef4444" },
};

const PAYMENT_CONFIG = {
  cod:    { label: "COD",    color: "#5b21b6", bg: "#ede9fe" },
  online: { label: "Online", color: "#0369a1", bg: "#e0f2fe" },
  upi:    { label: "UPI",    color: "#047857", bg: "#d1fae5" },
  cash:   { label: "Cash",   color: "#92400e", bg: "#fef3c7" },
};

const ALL_STATUSES = ["pending", "accepted", "shipped", "delivered", "cancelled"];

/* ── Helpers ── */
const fmt     = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
const shortId = (id) => id ? `#${String(id).slice(-6).toUpperCase()}` : "—";
const fN      = (n, d = 2) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
const fC      = (n) => "₹" + fN(n, 2);

const getPaymentStatus = (order) => {
  if (order.status === "cancelled") return "cancelled";
  return order.paymentStatus || "unpaid";
};

/* ── CSV Helpers ── */
const escapeCSV = (val) => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

/* ── GST Invoice CSV Export ── */
const buildGSTInvoiceCSV = (orders) => {
  const headers = [
    "Vch Ref", "Invoice No", "Voucher Date", "Invoice Date", "Voucher TYPE",
    "Customer Code / Alias", "Customer Name", "Customer Mobile No",
    "Delivery Name", "Delivery Street", "Delivery City", "Delivery State", "Delivery Pincode", "Delivery Phone",
    "Full Delivery Address", "Under Group", "GST No",
    "Product NO", "Product Description", "Stock Category",
    "HSN", "STORE", "UOM", "Quantity", "Rate", "Amount", "GST %",
    "SGST Amount", "CGST Amount", "IGST Amount", "Round off", "Line Total", "Remarks"
  ];

  const rows = [];
  let vchRef = 1;

  orders.forEach((order) => {
    const invoiceNo      = `INV-${String(order._id).slice(-8).toUpperCase()}`;
    const voucherDate    = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "";
    const customerCode   = `CUST-${String(order.user?._id || order._id).slice(-6).toUpperCase()}`;
    const customerName   = order.user?.name  || order.userName  || "Guest";
    const customerMobile = order.user?.phone || order.address?.phone || "";
    const addr            = order.address || {};
    const deliveryName    = addr.name     || customerName;
    const deliveryStreet  = addr.street   || addr.line1 || addr.address || "";
    const deliveryCity    = addr.city     || addr.district || addr.town || "";
    const deliveryState   = addr.state    || "Karnataka";
    const deliveryPincode = addr.pincode  || addr.zip || addr.postalCode || "";
    const deliveryPhone   = addr.phone    || addr.mobile || customerMobile;
    const fullAddress     = [deliveryName, deliveryStreet, deliveryCity, deliveryState, deliveryPincode].filter(Boolean).join(", ");
    const isInterState    = deliveryState.toLowerCase() !== "karnataka";

    (order.items || []).forEach((item, itemIndex) => {
      const productId     = item.product?._id || item.productId || `SKU${String(item._id || itemIndex).slice(-5)}`;
      const productName   = item.name || "—";
      const hsn           = item.hsn || item.product?.hsn || "123456";
      const uom           = item.unit || "Nos";
      const quantity      = item.quantity || 1;
      const rate          = item.unitPrice || 0;
      const amount        = rate * quantity;
      const gstRate       = item.gstRate || item.product?.gstRate || 0;

      let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;
      if (gstRate > 0) {
        if (isInterState) igstAmount = (amount * gstRate) / 100;
        else { sgstAmount = (amount * gstRate) / 200; cgstAmount = (amount * gstRate) / 200; }
      }

      const rawTotal  = amount + sgstAmount + cgstAmount + igstAmount;
      const lineTotal = Math.round(rawTotal);
      const roundOff  = lineTotal - rawTotal;

      rows.push([
        vchRef, invoiceNo, voucherDate, voucherDate, "GST Sales",
        customerCode, customerName, customerMobile,
        deliveryName, deliveryStreet, deliveryCity, deliveryState, deliveryPincode, deliveryPhone, fullAddress,
        "Sundry Debtors", order.user?.gstin || "",
        productId, productName, "Fruits Vegetables Sprouts & Fresh Cut Vegetables/Vegetables",
        hsn, "Main Location", uom,
        quantity.toFixed(2), rate.toFixed(2), amount.toFixed(2), gstRate,
        sgstAmount.toFixed(2), cgstAmount.toFixed(2), igstAmount.toFixed(2),
        roundOff.toFixed(2), lineTotal.toFixed(2), order.paymentNote || ""
      ]);
    });
    vchRef++;
  });

  return [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const GSTCSVExportButton = ({ orders, filterStatus }) => {
  const [exp, setExp] = useState(false);
  const handle = () => {
    if (!orders.length) return;
    setExp(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      downloadCSV(buildGSTInvoiceCSV(orders), `gst_invoice_${filterStatus ? `${filterStatus}_` : ""}${today}.csv`);
    } catch (e) { console.error(e); }
    finally { setExp(false); }
  };
  return (
    <button onClick={handle} disabled={exp || !orders.length}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: orders.length ? "#8b5cf6" : "#94a3b8", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: orders.length ? "pointer" : "not-allowed", whiteSpace: "nowrap", fontFamily: "inherit" }}>
      {exp ? "⏳" : "📋"} {exp ? "Exporting..." : `GST Invoice (${orders.length})`}
    </button>
  );
};

/* ══════════════════════════════════════════════════
   BUILD INVOICE ORDER HELPER
   FIX: sno is now passed in so InvoicePage can show Sr.No. correctly
══════════════════════════════════════════════════ */
const getVendorInfo = () => {
  try {
    const raw = localStorage.getItem("vendorInfo") || localStorage.getItem("vendor");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

/* sno param added — caller passes the descending serial number */
const buildInvoiceOrder = (order, sno) => {
  const vendor = getVendorInfo();
  const invoiceNo = `INV-${String(order._id).slice(-8).toUpperCase()}`;

  return {
    _id:        order._id,
    invoiceNo,
    createdAt:  order.createdAt,
    status:     order.status,
    paymentMode: order.paymentMode || "cash",
    paymentNote: order.paymentNote || "",
    totalPrice:  order.totalPrice  || 0,
    paidAmount:  order.paidAmount  || 0,
    /* ── Sr.No. fix: pass it through so InvoicePage can render it ── */
    sno: sno ?? "—",

    vendor: {
      name:    vendor?.name    || vendor?.shopName || "Your Store",
      email:   vendor?.email   || "",
      phone:   vendor?.phone   || "",
      gstin:   vendor?.gstin   || vendor?.gstNumber || "",
      address: [vendor?.address, vendor?.city, vendor?.state].filter(Boolean).join(", ") || "",
    },

    customer: {
      name:  order.user?.name  || order.userName || "Guest",
      phone: order.user?.phone || order.address?.phone || "",
      email: order.user?.email || "",
      gstin: order.user?.gstin || "",
      address: {
        name:    order.address?.name    || "",
        street:  order.address?.street  || "",
        city:    order.address?.city    || "",
        state:   order.address?.state   || "",
        pincode: order.address?.pincode || "",
        phone:   order.address?.phone   || "",
      },
    },

    items: (order.items || []).map((it) => ({
      name:         it.name         || "—",
      image:        it.image        || "",
      unitPrice:    it.unitPrice    || 0,
      rate:         it.unitPrice    || 0,
      mrp:          it.mrp          || it.unitPrice || 0,
      quantity:     it.quantity     || 1,
      unit:         it.unit         || "pcs",
      packing:      it.packing      || "",
      packagingText:it.packagingText|| it.packing || "",
      hsn:          it.hsn          || it.product?.hsn || "",
      gstRate:      it.gstRate      || it.product?.gstRate || 0,
      cess:         it.cess         || 0,
      product:      it.product,
    })),
  };
};

/* ── Payment Summary Cards ── */
const PaymentSummary = ({ orders }) => {
  const stats = useMemo(() => {
    let received = 0, pending = 0, totalActive = 0, rcvCount = 0, pendCount = 0;
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const tot  = o.totalPrice  || 0;
      const paid = o.paidAmount  || 0;
      received   += paid;
      pending    += Math.max(0, tot - paid);
      totalActive+= tot;
      if (paid > 0)   rcvCount++;
      if (paid < tot) pendCount++;
    });
    const pct = totalActive > 0 ? Math.round((received / totalActive) * 100) : 0;
    return { received, pending, pct, rcvCount, pendCount };
  }, [orders]);

  const fmt2 = (n) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000  ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n.toFixed(0)}`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
      {[
        { icon: "✅", border: "#a7f3d0", iconBg: "#d1fae5", lbl: "PAYMENT RECEIVED", lc: "#065f46", val: fmt2(stats.received), sub: `${stats.rcvCount} orders` },
        { icon: "⏳", border: "#fde68a", iconBg: "#fef3c7", lbl: "PAYMENT PENDING",  lc: "#92400e", val: fmt2(stats.pending),  sub: `${stats.pendCount} orders` },
      ].map((c) => (
        <div key={c.lbl} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${c.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{c.icon}</div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: c.lc, letterSpacing: 1, textTransform: "uppercase" }}>{c.lbl}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{c.val}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{c.sub}</div>
          </div>
        </div>
      ))}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #bfdbfe", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>📈</div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#1e40af", letterSpacing: 1, textTransform: "uppercase" }}>COLLECTION RATE</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{stats.pct}%</div>
          </div>
        </div>
        <div style={{ height: 7, background: "#dbeafe", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${stats.pct}%`, background: "#3b82f6", borderRadius: 999, transition: "width .7s ease" }} />
        </div>
      </div>
    </div>
  );
};

/* ── Payment Badge ── */
const PaymentBadge = ({ order }) => {
  const ps      = getPaymentStatus(order);
  const paid    = order.paidAmount  || 0;
  const total   = order.totalPrice  || 0;
  const pending = Math.max(0, total - paid);

  if (ps === "cancelled")
    return <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>— N/A</span>;
  if (ps === "paid")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}>✓ Paid</span>
        <span style={{ fontSize: 9, color: "#94a3b8" }}>₹{paid.toFixed(0)} received</span>
      </div>
    );
  if (ps === "partial")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" }}>◑ Partial</span>
        <span style={{ fontSize: 9, color: "#94a3b8" }}>₹{paid.toFixed(0)} / ₹{pending.toFixed(0)} left</span>
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>⏳ Unpaid</span>
      <span style={{ fontSize: 9, color: "#94a3b8" }}>₹{total.toFixed(0)} pending</span>
    </div>
  );
};

/* ── Payment Update Modal ── */
const PaymentUpdateModal = ({ order, onClose, onUpdated }) => {
  const total = order.totalPrice || 0;
  const [paid, setPaid]     = useState(order.paidAmount ?? 0);
  const [note, setNote]     = useState(order.paymentNote || "");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const safePaid = Math.min(Math.max(0, Number(paid) || 0), total);
  const pending  = Math.max(0, total - safePaid);
  const pct      = total > 0 ? Math.round((safePaid / total) * 100) : 0;
  const status   = safePaid <= 0 ? "unpaid" : safePaid >= total ? "paid" : "partial";

  const statusStyle = {
    unpaid:  { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
    partial: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
    paid:    { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
  }[status];

  const quickAmounts = [
    { label: "Clear", value: 0 },
    { label: "25%",   value: Math.round(total * 0.25) },
    { label: "50%",   value: Math.round(total * 0.5) },
    { label: "Full",  value: total },
  ];

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await axiosAuth.put(`${API_URL}/${order._id}/payment`, { paidAmount: safePaid, paymentNote: note });
      if (res.data.success) { onUpdated(order._id, res.data.data); onClose(); }
      else setError(res.data.message || "Update fail hua");
    } catch (err) {
      setError(err?.response?.data?.message || "Payment update fail hua");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)", background: "rgba(15,23,42,.45)" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 420, borderRadius: 18, boxShadow: "0 30px 60px rgba(0,0,0,.22)", overflow: "hidden" }}>
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Payment Update</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{shortId(order._id)} · {order.user?.name || "—"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>Order Total</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{fC(total)}</div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>Status</div>
              <span style={{ marginTop: 5, display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Kitna payment mila? (₹)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontWeight: 700 }}>₹</span>
              <input type="number" min="0" max={total} step="0.01" value={paid}
                onChange={(e) => setPaid(Math.min(Math.max(0, Number(e.target.value) || 0), total))}
                style={{ width: "100%", paddingLeft: 28, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: "1px solid #d1d5db", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#0f172a", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {quickAmounts.map((q) => (
                <button key={q.label} onClick={() => setPaid(q.value)}
                  style={{ padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1px solid ${safePaid === q.value ? "#059669" : "#d1d5db"}`, background: safePaid === q.value ? "#059669" : "#f9fafb", color: safePaid === q.value ? "#fff" : "#374151", transition: "all .15s" }}>
                  {q.label} {q.value > 0 ? `₹${q.value}` : ""}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, marginBottom: 6 }}>
              <span style={{ color: "#059669" }}>Paid: {fC(safePaid)} ({pct}%)</span>
              <span style={{ color: "#d97706" }}>Pending: {fC(pending)}</span>
            </div>
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#16a34a" : pct > 0 ? "#2563eb" : "#d1d5db", borderRadius: 999, transition: "width .3s" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              Payment Note <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span>
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="e.g. UPI ref, cash collected..."
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 12, color: "#374151", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#991b1b" }}>⚠️ {error}</div>}
        </div>
        <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", border: "1px solid #d1d5db", borderRadius: 10, background: "#fff", fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "10px 0", border: "none", borderRadius: 10, background: saving ? "#059669" : "#16a34a", color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving..." : `Save — ${fC(safePaid)} (${pct}%)`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Edit Items Modal ── */
const EditItemsModal = ({ order, onClose, onUpdated }) => {
  const [items, setItems] = useState((order.items || []).map((it) => ({ ...it, _newQty: it.quantity })));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const setQty = (idx, val) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], _newQty: Math.max(1, Number(val) || 1) };
      return next;
    });
  };

  const newTotal = items.reduce((s, it) => s + (it.unitPrice || 0) * it._newQty, 0);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const payload = items.map((it) => ({ product: String(it.product?._id || it.product), quantity: it._newQty }));
      const res = await axiosAuth.put(`${API_URL}/${order._id}/items`, { items: payload });
      if (res.data.success) { onUpdated(order._id, res.data.data); onClose(); }
      else setError(res.data.message || "Update fail hua");
    } catch (err) {
      setError(err?.response?.data?.message || "Items update fail hua");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)", background: "rgba(15,23,42,.45)" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 520, borderRadius: 18, boxShadow: "0 30px 60px rgba(0,0,0,.22)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Edit Order Items</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{shortId(order._id)} · Sirf quantity edit ho sakti hai</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["#", "Product", "Unit Price", "Qty", "Subtotal"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "#64748b", textAlign: h === "#" || h === "Product" ? "left" : "right", borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px", fontSize: 11, fontWeight: 700, color: "#94a3b8", width: 32 }}>
                    {items.length - idx}
                  </td>
                  <td style={{ padding: "10px", fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>
                    <div>{it.name || "—"}</div>
                    {it.unit && <div style={{ fontSize: 10, color: "#94a3b8" }}>{it.unit}</div>}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", fontSize: 12, color: "#374151" }}>{fC(it.unitPrice || 0)}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                      <button onClick={() => setQty(idx, it._newQty - 1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <input type="number" min="1" value={it._newQty}
                        onChange={(e) => setQty(idx, e.target.value)}
                        style={{ width: 46, textAlign: "center", padding: "4px 6px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 13, fontWeight: 700, outline: "none", fontFamily: "inherit" }} />
                      <button onClick={() => setQty(idx, it._newQty + 1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#1e40af" }}>{fC((it.unitPrice || 0) * it._newQty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>New Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{fC(newTotal)}</span>
          </div>
          {error && <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#991b1b" }}>⚠️ {error}</div>}
        </div>
        <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", border: "1px solid #d1d5db", borderRadius: 10, background: "#fff", fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "10px 0", border: "none", borderRadius: 10, background: saving ? "#1e40af" : "#2563eb", color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving..." : `Save Changes — ${fC(newTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function VendorOrders() {
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterPayment,  setFilterPayment]  = useState("");
  const [sortBy,         setSortBy]         = useState("date_desc");
  const [page,           setPage]           = useState(1);
  const [expandedRow,    setExpandedRow]    = useState(null);
  const [updatingId,     setUpdatingId]     = useState(null);
  const [toast,          setToast]          = useState(null);
  const [selectedIds,    setSelectedIds]    = useState([]);
  const [bulkStatus,     setBulkStatus]     = useState("");
  const [paymentModalId, setPaymentModalId] = useState(null);
  const [editModalId,    setEditModalId]    = useState(null);

  const navigate = useNavigate();
  const ROWS     = 15;

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await axiosAuth.get(API_URL);
      if (res.data?.success) setOrders(res.data.data || []);
      else setError("Orders load nahi hue");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await axiosAuth.put(`${API_URL}/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      notify(`Status updated → ${STATUS_CONFIG[status]?.label || status}`);
    } catch { notify("Status update fail hua", "error"); }
    finally { setUpdatingId(null); }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || !selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => axiosAuth.put(`${API_URL}/${id}/status`, { status: bulkStatus })));
      setOrders((prev) => prev.map((o) => selectedIds.includes(o._id) ? { ...o, status: bulkStatus } : o));
      notify(`${selectedIds.length} orders updated → ${STATUS_CONFIG[bulkStatus]?.label}`);
      setSelectedIds([]); setBulkStatus("");
    } catch { notify("Bulk update fail hua", "error"); }
  };

  const handlePaymentUpdated = useCallback((orderId, data) => {
    setOrders((prev) => prev.map((o) => o._id === orderId
      ? { ...o, paidAmount: data.paidAmount, paymentStatus: data.paymentStatus, paymentNote: data.paymentNote }
      : o
    ));
    notify("Payment updated ✓");
  }, [notify]);

  const handleItemsUpdated = useCallback((orderId, data) => {
    setOrders((prev) => prev.map((o) => o._id === orderId
      ? { ...o, items: data.items, totalPrice: data.totalPrice, paidAmount: data.paidAmount, paymentStatus: data.paymentStatus }
      : o
    ));
    notify("Items updated ✓");
  }, [notify]);

  /* ── Filter + Sort ── */
  const filtered = orders.filter((o) => {
    const t = search.toLowerCase();
    const matchText = (o._id || "").toLowerCase().includes(t)
      || (o.user?.name || "").toLowerCase().includes(t)
      || (o.user?.phone || "").includes(t)
      || (o.items || []).some((i) => (i.name || "").toLowerCase().includes(t));
    return (
      matchText &&
      (
        !filterStatus ||
        o.status === filterStatus ||
        (
          filterStatus === "cancelled" &&
          (o.status === "canceled" || o.status === "cancelled")
        )
      ) &&
      (!filterPayment || o.paymentMode === filterPayment)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date_desc")   return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "date_asc")    return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "amount_desc") return (b.totalPrice || 0) - (a.totalPrice || 0);
    if (sortBy === "amount_asc")  return (a.totalPrice || 0) - (b.totalPrice || 0);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS));
  const paginated  = sorted.slice((page - 1) * ROWS, page * ROWS);
  const allSel     = paginated.length > 0 && paginated.every((o) => selectedIds.includes(o._id));

  const totalSorted = sorted.length;
  const getGlobalIndex = (pageLocalIndex) => (page - 1) * ROWS + pageLocalIndex;

  const toggleAll = () =>
    setSelectedIds(allSel
      ? selectedIds.filter((id) => !paginated.find((o) => o._id === id))
      : [...new Set([...selectedIds, ...paginated.map((o) => o._id)])]);

  const stats = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue:   orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.totalPrice || 0), 0),
  };

  const paymentModalOrder = paymentModalId ? orders.find((o) => o._id === paymentModalId) : null;
  const editModalOrder    = editModalId    ? orders.find((o) => o._id === editModalId)    : null;

  /* ══════════════════════════════════════════════════
     FIX: Navigate to Invoice — sno passed to buildInvoiceOrder
  ══════════════════════════════════════════════════ */
  const openInvoice = useCallback((order, sno) => {
    const invoiceOrder = buildInvoiceOrder(order, sno);
    navigate("/vendor/invoice", { state: { order: invoiceOrder } });
  }, [navigate]);

  /* ── Navigate to Estimate ── */
  const openEstimate = useCallback((order, sno) => {
    const invoiceOrder = buildInvoiceOrder(order, sno);
    navigate("/vendor/estimate", { state: { order: invoiceOrder } });
  }, [navigate]);

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
      --violet:#7c3aed;--violetFade:#f5f3ff;
      --shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
      --r:10px;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    .vo{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);min-height:100vh;color:var(--text)}
    .vo-bar{background:var(--white);border-bottom:1px solid var(--border);height:56px;padding:0 24px;
      display:flex;align-items:center;position:sticky;top:0;z-index:50;gap:10px}
    .vo-bar-icon{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#2563eb,#4f46e5);
      display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
    .vo-bar-sep{width:1px;height:16px;background:var(--border);margin:0 4px}
    .vo-body{padding:20px 24px 60px;max-width:1700px;margin:0 auto}
    .vo-ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px}
    .vo-ph h1{font-size:20px;font-weight:800;letter-spacing:-.3px}
    .vo-ph p{font-size:12px;color:var(--mid);margin-top:2px}
    .vo-ph-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .vo-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
    .vo-stat{background:var(--white);border:1px solid var(--border);border-radius:var(--r);
      padding:14px 16px;box-shadow:var(--shadow);display:flex;align-items:center;gap:12px}
    .vo-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;
      justify-content:center;font-size:18px;flex-shrink:0}
    .vo-stat-val{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
    .vo-stat-lbl{font-size:11px;color:var(--mid);font-weight:500;margin-top:3px}
    .vo-card{background:var(--white);border:1px solid var(--border);border-radius:12px;
      box-shadow:var(--shadow);overflow:hidden}
    .vo-toolbar{padding:12px 16px;border-bottom:1px solid var(--border);
      display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .vo-tbl-left{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap}
    .vo-search{position:relative}
    .vo-search input{padding:7px 10px 7px 30px;border:1px solid var(--border);border-radius:8px;
      font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;outline:none;width:210px;
      background:var(--bg);transition:all .2s;color:var(--text)}
    .vo-search input:focus{border-color:var(--blue);background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.08)}
    .vo-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--dim);pointer-events:none}
    .vo-sel{padding:7px 10px;border:1px solid var(--border);border-radius:8px;
      font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:var(--text);
      background:var(--bg);outline:none;cursor:pointer}
    .vo-sel:focus{border-color:var(--blue)}
    .vo-bulk{background:#eef2ff;border:1px solid #c7d2fe;border-radius:9px;
      padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .vo-table-wrap{overflow-x:auto}
    .vo-table{width:100%;border-collapse:collapse;min-width:1450px}
    .vo-table thead tr{border-bottom:1px solid var(--border);background:#f8fafc}
    .vo-table th{padding:9px 10px;text-align:left;font-size:10.5px;font-weight:700;
      letter-spacing:.5px;text-transform:uppercase;color:var(--dim);white-space:nowrap}
    .vo-table tbody tr{border-bottom:1px solid var(--border);transition:background .1s}
    .vo-table tbody tr:last-child{border-bottom:none}
    .vo-table tbody tr:hover{background:#fafafa}
    .vo-table tbody tr.exp{background:#f0f7ff}
    .vo-table td{padding:9px 10px;font-size:13px;vertical-align:middle}
    .s-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:20px;
      font-size:11px;font-weight:700;white-space:nowrap}
    .s-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
    .p-badge{padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600}
    .s-sel{padding:5px 8px;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;
      font-size:12px;font-weight:600;border:1px solid var(--border2);background:var(--white);
      outline:none;cursor:pointer;transition:all .2s}
    .s-sel:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.1)}
    .vo-detail{background:#f8fafc;border-top:1px solid var(--border)}
    .vo-detail-inner{padding:16px 20px 18px}
    .vo-items-tbl{width:100%;border-collapse:collapse;font-size:12.5px}
    .vo-items-tbl th{padding:6px 10px;background:#f1f5f9;border:1px solid var(--border);
      font-size:10.5px;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.4px}
    .vo-items-tbl td{padding:8px 10px;border:1px solid var(--border);vertical-align:middle}
    .vo-item-img{width:36px;height:36px;object-fit:cover;border-radius:7px;border:1px solid var(--border)}
    .vo-item-ph{width:36px;height:36px;background:#f1f5f9;border-radius:7px;border:1px solid var(--border);
      display:flex;align-items:center;justify-content:center;font-size:15px}
    .vo-detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:14px}
    .vo-dbox{background:#fff;border:1px solid var(--border);border-radius:8px;padding:10px 12px}
    .vo-dbox-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--dim);margin-bottom:5px}
    .vo-dbox-val{font-size:13px;font-weight:600;color:var(--text)}
    .vo-dbox-sub{font-size:11px;color:var(--mid);margin-top:2px}
    .vo-oid{font-family:monospace;font-size:12px;font-weight:700;color:var(--blue);
      background:var(--blueFade);padding:3px 7px;border-radius:5px;cursor:pointer}
    .vo-oid:hover{background:#dbeafe}
    .vo-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
      display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff}
    .vo-exp-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);
      background:var(--bg);display:flex;align-items:center;justify-content:center;
      cursor:pointer;font-size:12px;transition:all .15s;color:var(--mid)}
    .vo-exp-btn:hover{border-color:var(--blue);color:var(--blue);background:var(--blueFade)}
    .btn{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border-radius:7px;
      font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;
      border:none;cursor:pointer;transition:all .2s;white-space:nowrap}
    .btn-blue{background:var(--blue);color:#fff}.btn-blue:hover{background:#1d4ed8}
    .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--mid)}
    .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--bg)}
    .btn-amber{background:#fef3c7;color:#92400e;border:1px solid #fde68a}.btn-amber:hover{background:#fde68a}
    .btn-emerald{background:#d1fae5;color:#065f46;border:1px solid #a7f3d0}.btn-emerald:hover{background:#a7f3d0}
    .btn-violet{background:var(--violetFade);color:var(--violet);border:1px solid #ddd6fe}.btn-violet:hover{background:#ede9fe}
    .btn-slate{background:#1e293b;color:#f8fafc;border:1px solid #334155}.btn-slate:hover{background:#0f172a}
    .btn-orange{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}.btn-orange:hover{background:#ffedd5}
    .vo-pager{padding:12px 16px;border-top:1px solid var(--border);
      display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .vo-pager-info{font-size:12px;color:var(--mid)}
    .pg-btn{width:28px;height:28px;border-radius:6px;border:1px solid var(--border);
      background:#fff;color:var(--mid);font-size:12px;cursor:pointer;transition:all .15s;
      display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif}
    .pg-btn:hover:not(:disabled){border-color:var(--blue);color:var(--blue)}
    .pg-btn.active{background:var(--blue);border-color:var(--blue);color:#fff;font-weight:700}
    .pg-btn:disabled{opacity:.35;cursor:not-allowed}
    .sh-row td{height:52px;padding:0 11px}
    .shimmer{border-radius:5px;height:12px;background:linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%);
      background-size:300% 100%;animation:shim 1.4s ease infinite}
    @keyframes shim{from{background-position:200% 0}to{background-position:-100% 0}}
    .vo-toast{position:fixed;bottom:20px;right:20px;padding:10px 15px;border-radius:9px;
      font-size:12.5px;font-weight:500;display:flex;align-items:center;gap:8px;z-index:9999;
      white-space:nowrap;animation:toastUp .25s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 24px rgba(0,0,0,.13)}
    @keyframes toastUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .vo-toast.success{background:#052e16;color:#86efac;border:1px solid #166534}
    .vo-toast.error{background:#450a0a;color:#fca5a5;border:1px solid #991b1b}
    .toast-dot{width:6px;height:6px;border-radius:50%}
    .vo-toast.success .toast-dot{background:#22c55e}
    .vo-toast.error .toast-dot{background:#ef4444}
    .vo-empty{padding:56px 20px;text-align:center}
    .vo-error{padding:14px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:9px;
      color:#991b1b;font-size:13px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
    input[type=checkbox]{width:14px;height:14px;accent-color:var(--blue);cursor:pointer}
    .inv-actions{display:flex;flex-direction:column;gap:4px}
    .sno-badge{
      display:inline-flex;align-items:center;justify-content:center;
      width:24px;height:24px;border-radius:6px;
      background:#f1f5f9;border:1px solid #e2e8f0;
      font-size:10.5px;font-weight:700;color:#64748b;font-family:monospace;
    }
    @media(max-width:768px){
      .vo-stats{grid-template-columns:1fr 1fr}
      .vo-body{padding:14px 12px 56px}
      .vo-bar{padding:0 14px}
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="vo">
        <div className="vo-bar">
          <div className="vo-bar-icon">🛍️</div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Seller Panel</span>
          <div className="vo-bar-sep" />
          <span style={{ fontSize: 13, color: "#475569" }}>Orders</span>
        </div>

        <div className="vo-body">
          <div className="vo-ph">
            <div>
              <h1>Orders</h1>
              <p>{orders.length} total orders across all statuses</p>
            </div>
            <div className="vo-ph-actions">
              <GSTCSVExportButton orders={sorted} filterStatus={filterStatus} />
              <button className="btn btn-ghost" onClick={fetchOrders} style={{ fontSize: 12 }}>↺ Refresh</button>
            </div>
          </div>

          <div className="vo-stats">
            {[
              { icon: "📦", bg: "#eff6ff", val: stats.total,     lbl: "Total Orders" },
              { icon: "⏳", bg: "#fffbeb", val: stats.pending,   lbl: "Pending" },
              { icon: "✅", bg: "#f0fdf4", val: stats.delivered, lbl: "Delivered" },
              { icon: "💰", bg: "#faf5ff", val: fC(stats.revenue), lbl: "Revenue" },
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

          <PaymentSummary orders={orders} />

          {error && (
            <div className="vo-error">
              ⚠️ {error}
              <button className="btn btn-ghost" onClick={fetchOrders} style={{ marginLeft: "auto", fontSize: 11 }}>Retry</button>
            </div>
          )}

          {selectedIds.length > 0 && (
            <div className="vo-bulk">
              <span style={{ fontSize: 13, fontWeight: 600, color: "#4338ca" }}>{selectedIds.length} selected</span>
              <select className="vo-sel" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
                <option value="">— Change status —</option>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
              </select>
              <button className="btn btn-blue" onClick={handleBulkUpdate} disabled={!bulkStatus} style={{ fontSize: 12 }}>Apply</button>
              <button className="btn btn-ghost" onClick={() => { setSelectedIds([]); setBulkStatus(""); }} style={{ fontSize: 12 }}>✖ Clear</button>
            </div>
          )}

          <div className="vo-card">
            <div className="vo-toolbar">
              <div className="vo-tbl-left">
                <div className="vo-search">
                  <span className="vo-search-ico">⌕</span>
                  <input placeholder="Search order, customer, item…" value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="vo-sel" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
                </select>
                <select className="vo-sel" value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}>
                  <option value="">All Payments</option>
                  {Object.entries(PAYMENT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select className="vo-sel" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Amount ↓</option>
                  <option value="amount_asc">Amount ↑</option>
                </select>
                {(search || filterStatus || filterPayment) && (
                  <span style={{ padding: "3px 8px", borderRadius: 20, border: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, color: "#64748b" }}>{filtered.length} results</span>
                )}
              </div>
            </div>

            <div className="vo-table-wrap">
              <table className="vo-table">
                <thead>
                  <tr>
                    <th style={{ width: 34 }}><input type="checkbox" checked={allSel} onChange={toggleAll} /></th>
                    <th style={{ width: 44, textAlign: "center" }}>S.No.</th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Pay Status</th>
                    <th>Status</th>
                    <th>Update Status</th>
                    <th>💳 Payment</th>
                    <th>✏️ Items</th>
                    <th>📄 Invoice</th>
                    <th style={{ width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1,2,3,4,5].map((i) => (
                      <tr className="sh-row" key={i}>
                        {Array(15).fill(0).map((_, j) => (
                          <td key={j}><div className="shimmer" style={{ width: [34,44,90,90,130,70,80,70,90,100,130,80,80,100,36][j] }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={15}>
                      <div className="vo-empty">
                        <div style={{ fontSize: 36, opacity: .2, marginBottom: 10 }}>🛍️</div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{search ? "No orders found" : "No orders yet"}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                          {search ? `No results for "${search}"` : "Orders will appear here once customers place them"}
                        </div>
                      </div>
                    </td></tr>
                  ) : paginated.map((order, pageLocalIdx) => {
                    const sc    = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const pc    = PAYMENT_CONFIG[order.paymentMode] || { label: order.paymentMode || "—", color: "#64748b", bg: "#f1f5f9" };
                    const isExp = expandedRow === order._id;
                    const isUpd = updatingId  === order._id;
                    const ps    = getPaymentStatus(order);
                    const initials = (order.user?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

                    /* ── Descending S.No. ── */
                    const sno = totalSorted - getGlobalIndex(pageLocalIdx);

                    return (
                      <React.Fragment key={order._id}>
                        <tr className={isExp ? "exp" : ""}>
                          <td>
                            <input type="checkbox"
                              checked={selectedIds.includes(order._id)}
                              onChange={() => setSelectedIds((p) => p.includes(order._id) ? p.filter((x) => x !== order._id) : [...p, order._id])} />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className="sno-badge">{sno}</span>
                          </td>
                          <td>
                            <span className="vo-oid" onClick={() => setExpandedRow(isExp ? null : order._id)}>{shortId(order._id)}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{fmt(order.createdAt)}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{fmtTime(order.createdAt)}</div>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="vo-avatar">{initials}</div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{order.user?.name || "Guest"}</div>
                                <div style={{ fontSize: 11, color: "#94a3b8" }}>{order.user?.phone || "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, fontSize: 13 }}>{(order.items || []).length}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>item{order.items?.length !== 1 ? "s" : ""}</span>
                            {order.items?.[0]?.name && (
                              <div style={{ fontSize: 10.5, color: "#475569", marginTop: 2, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{fC(order.totalPrice || 0)}</div>
                            {(order.paidAmount > 0 && order.paidAmount < (order.totalPrice || 0)) && (
                              <div style={{ fontSize: 9, color: "#d97706", marginTop: 1 }}>₹{Math.max(0, (order.totalPrice || 0) - order.paidAmount).toFixed(0)} left</div>
                            )}
                          </td>
                          <td><span className="p-badge" style={{ background: pc.bg, color: pc.color }}>{pc.label}</span></td>
                          <td><PaymentBadge order={order} /></td>
                          <td>
                            <span className="s-badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                              <span className="s-dot" style={{ background: sc.dot }} />
                              {sc.label}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <select className="s-sel" value={order.status} disabled={isUpd}
                                onChange={(e) => updateStatus(order._id, e.target.value)}>
                                {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
                              </select>
                              {isUpd && <span style={{ fontSize: 11, color: "#94a3b8" }}>…</span>}
                            </div>
                          </td>
                          <td>
                            <button className={`btn ${ps === "paid" ? "btn-emerald" : ps === "partial" ? "btn-blue" : "btn-amber"}`}
                              onClick={() => setPaymentModalId(order._id)}>
                              💳 {ps === "paid" ? "Paid" : ps === "partial" ? `₹${(order.paidAmount || 0).toFixed(0)}` : "Pay"}
                            </button>
                          </td>
                          <td>
                            <button className="btn btn-violet" onClick={() => setEditModalId(order._id)}>
                              ✏️ Edit
                            </button>
                          </td>
                          {/* ── FIX: sno passed to openInvoice and openEstimate ── */}
                          <td>
                            <div className="inv-actions">
                              <button className="btn btn-slate" onClick={() => openInvoice(order, sno)}>
                                🧾 Invoice
                              </button>
                              <button className="btn btn-orange" onClick={() => openEstimate(order, sno)}>
                                📋 Estimate
                              </button>
                            </div>
                          </td>
                          <td>
                            <button className="vo-exp-btn" onClick={() => setExpandedRow(isExp ? null : order._id)}>
                              {isExp ? "▲" : "▼"}
                            </button>
                          </td>
                        </tr>

                        {isExp && (
                          <tr><td colSpan={15} style={{ padding: 0 }}>
                            <div className="vo-detail">
                              <div className="vo-detail-inner">
                                <div style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  background: "#f1f5f9", border: "1px solid #e2e8f0",
                                  borderRadius: 7, padding: "4px 10px",
                                  fontSize: 11, fontWeight: 700, color: "#475569",
                                  marginBottom: 10,
                                }}>
                                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#2563eb" }}>#{sno}</span>
                                  <span style={{ width: 1, height: 12, background: "#e2e8f0", display: "inline-block" }} />
                                  <span>{shortId(order._id)}</span>
                                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>· {fmt(order.createdAt)}</span>
                                </div>

                                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }}>Order Items</div>
                                <table className="vo-items-tbl">
                                  <thead>
                                    <tr>
                                      <th style={{ width: 36, textAlign: "center" }}>#</th>
                                      <th style={{ width: 50 }}>Image</th>
                                      <th>Product</th>
                                      <th>Unit Price</th>
                                      <th>Qty</th>
                                      <th>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(order.items || []).map((item, idx) => (
                                      <tr key={idx}>
                                        <td style={{ textAlign: "center", fontWeight: 700, fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                                          {(order.items || []).length - idx}
                                        </td>
                                        <td>{item.image ? <img className="vo-item-img" src={item.image} alt={item.name} /> : <div className="vo-item-ph">🛒</div>}</td>
                                        <td style={{ fontWeight: 600 }}>{item.name || "—"}</td>
                                        <td>{fC(item.unitPrice || 0)}</td>
                                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                        <td style={{ fontWeight: 700 }}>{fC((item.unitPrice || 0) * item.quantity)}</td>
                                      </tr>
                                    ))}
                                    <tr style={{ background: "#f8fafc" }}>
                                      <td colSpan={5} style={{ textAlign: "right", fontWeight: 700, paddingRight: 12, fontSize: 12 }}>Total</td>
                                      <td style={{ fontWeight: 800, fontSize: 14, color: "#2563eb" }}>{fC(order.totalPrice || 0)}</td>
                                    </tr>
                                  </tbody>
                                </table>
                                <div className="vo-detail-grid">
                                  <div className="vo-dbox">
                                    <div className="vo-dbox-lbl">Customer</div>
                                    <div className="vo-dbox-val">{order.user?.name || "Guest"}</div>
                                    <div className="vo-dbox-sub">{order.user?.phone || "—"}</div>
                                    {order.user?.email && <div className="vo-dbox-sub">{order.user.email}</div>}
                                  </div>
                                  <div className="vo-dbox">
                                    <div className="vo-dbox-lbl">Delivery Address</div>
                                    <div className="vo-dbox-val" style={{ fontSize: 12 }}>
                                      {order.address
                                        ? [order.address.name, order.address.street, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(", ")
                                        : "—"}
                                    </div>
                                    {order.address?.phone && <div className="vo-dbox-sub">📞 {order.address.phone}</div>}
                                  </div>
                                  <div className="vo-dbox">
                                    <div className="vo-dbox-lbl">Payment Info</div>
                                    <div className="vo-dbox-val">Paid: {fC(order.paidAmount || 0)}</div>
                                    <div className="vo-dbox-sub">Pending: {fC(Math.max(0, (order.totalPrice || 0) - (order.paidAmount || 0)))}</div>
                                    {order.paymentNote && <div className="vo-dbox-sub">Note: {order.paymentNote}</div>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td></tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="vo-pager">
              <span className="vo-pager-info">
                {totalPages > 1
                  ? `Showing ${Math.min((page-1)*ROWS+1, sorted.length)}–${Math.min(page*ROWS, sorted.length)} of ${sorted.length}`
                  : `${sorted.length} order${sorted.length !== 1 ? "s" : ""}`}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {sorted.length > 0 && <GSTCSVExportButton orders={sorted} filterStatus={filterStatus} />}
                {totalPages > 1 && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="pg-btn" disabled={page===1} onClick={() => setPage(1)}>«</button>
                    <button className="pg-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const n = totalPages <= 7 ? i+1 : page <= 4 ? i+1 : page >= totalPages-3 ? totalPages-6+i : page-3+i;
                      return <button key={n} className={`pg-btn ${page===n?"active":""}`} onClick={() => setPage(n)}>{n}</button>;
                    })}
                    <button className="pg-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>›</button>
                    <button className="pg-btn" disabled={page===totalPages} onClick={() => setPage(totalPages)}>»</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {paymentModalOrder && (
        <PaymentUpdateModal order={paymentModalOrder} onClose={() => setPaymentModalId(null)} onUpdated={handlePaymentUpdated} />
      )}
      {editModalOrder && (
        <EditItemsModal order={editModalOrder} onClose={() => setEditModalId(null)} onUpdated={handleItemsUpdated} />
      )}

      {toast && (
        <div className={`vo-toast ${toast.type}`}>
          <div className="toast-dot" />{toast.msg}
        </div>
      )}
    </>
  );
}