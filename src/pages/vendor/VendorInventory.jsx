
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

const INVENTORY_API = "https://foodhelpervendor.onrender.com/api/vendor/inventory";
const PRODUCT_API   = "https://foodhelpervendor.onrender.com/api/vendor/products";

const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── Helpers ─── */
const toNum = (v, fb = 0) => { const n = Number(v); return isNaN(n) ? fb : n; };
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null;
const daysLeft = (d) =>
  d ? Math.ceil((new Date(d) - Date.now()) / 86400000) : null;

const expiryLevel = (d) => {
  const days = daysLeft(d);
  if (days === null) return "none";
  if (days < 0)   return "expired";
  if (days <= 7)  return "critical";
  if (days <= 30) return "warning";
  return "ok";
};

const EXPIRY_COLORS = {
  expired:  { bg:"#FEF2F2", text:"#DC2626", border:"#FECACA" },
  critical: { bg:"#FFF7ED", text:"#C2410C", border:"#FED7AA" },
  warning:  { bg:"#FEFCE8", text:"#A16207", border:"#FEF08A" },
  ok:       { bg:"#F0FDF4", text:"#15803D", border:"#BBF7D0" },
  none:     { bg:"transparent", text:"#94A3B8", border:"transparent" },
};

/* ─── Tiny UI Components ─── */
const StatusBadge = ({ item }) => {
  if (item.outOfStock)
    return <Pill bg="#FEE2E2" color="#DC2626">Out of Stock</Pill>;
  if (item.availableStock <= item.minStock)
    return <Pill bg="#FEF3C7" color="#D97706">Low Stock</Pill>;
  return <Pill bg="#DCFCE7" color="#16A34A">In Stock</Pill>;
};

const ExpiryBadge = ({ date }) => {
  if (!date) return <span style={{ color:"#CBD5E1", fontSize:12 }}>—</span>;
  const days = daysLeft(date);
  const level = expiryLevel(date);
  const c = EXPIRY_COLORS[level];
  const label =
    days < 0  ? `Expired ${Math.abs(days)}d ago` :
    days === 0 ? "Expires today!" :
    days === 1 ? "Expires tomorrow" :
                 `${days}d left`;
  return (
    <div>
      <div style={{ fontSize:12, fontWeight:700, color: c.text }}>{fmtDate(date)}</div>
      <div style={{
        display:"inline-block", marginTop:3, padding:"2px 7px",
        borderRadius:20, fontSize:10, fontWeight:700,
        background: c.bg, color: c.text, border:`1px solid ${c.border}`,
      }}>{label}</div>
    </div>
  );
};

const Pill = ({ bg, color, children }) => (
  <span style={{
    display:"inline-block", padding:"3px 10px", borderRadius:20,
    fontSize:11, fontWeight:700, background:bg, color,
  }}>{children}</span>
);

const UrgencyTag = ({ item }) => {
  const level = expiryLevel(item.expiryDate);
  if (item.outOfStock) return <span style={urgTag("#FEE2E2","#DC2626")}>⚠ Out of Stock</span>;
  if (item.availableStock <= item.minStock) return <span style={urgTag("#FEF3C7","#D97706")}>↓ Low Stock</span>;
  if (level === "expired")  return <span style={urgTag("#FEE2E2","#DC2626")}>✕ Expired</span>;
  if (level === "critical") return <span style={urgTag("#FFF7ED","#C2410C")}>! Expiring Soon</span>;
  if (level === "warning")  return <span style={urgTag("#FEFCE8","#A16207")}>~ Exp. This Month</span>;
  return null;
};
const urgTag = (bg, color) => ({
  display:"inline-block", padding:"2px 8px", borderRadius:4,
  fontSize:10, fontWeight:700, background:bg, color,
});

const StatCard = ({ label, value, color, sub }) => (
  <div style={{
    flex:"0 0 auto", minWidth:130, background:"#fff",
    border:"1px solid #E5E7EB", borderRadius:12,
    padding:"14px 18px", borderTop:`3px solid ${color}`,
  }}>
    <div style={{ fontSize:22, fontWeight:800, color, fontVariantNumeric:"tabular-nums" }}>{value}</div>
    <div style={{ fontSize:11, color:"#6B7280", marginTop:3, fontWeight:600 }}>{label}</div>
    {sub && <div style={{ fontSize:10, color:color, marginTop:2 }}>{sub}</div>}
  </div>
);

const Toast = ({ msg, type }) => msg ? (
  <div style={{
    position:"fixed", top:20, right:20, zIndex:2000,
    background: type==="error" ? "#EF4444" : "#059669",
    color:"#fff", padding:"12px 20px", borderRadius:10,
    fontWeight:600, fontSize:13, boxShadow:"0 4px 20px rgba(0,0,0,.2)",
    animation:"slideIn .2s ease",
  }}>{msg}</div>
) : null;

const Confirm = ({ open, msg, onOk, onCancel }) => !open ? null : (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1500 }}>
    <div style={{ background:"#fff", borderRadius:14, padding:"28px 32px", maxWidth:380, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
      <div style={{ fontWeight:700, fontSize:15, color:"#111827", marginBottom:10 }}>Confirm Delete</div>
      <p style={{ color:"#4B5563", fontSize:13, marginBottom:20 }}>{msg}</p>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={secondaryBtn}>Cancel</button>
        <button onClick={onOk} style={{ ...primaryBtn, background:"#EF4444" }}>Yes, Delete</button>
      </div>
    </div>
  </div>
);

const RestockModal = ({ item, onClose, onSave }) => {
  const [qty, setQty] = useState("");
  const [loading, setLoading] = useState(false);
  if (!item) return null;
  const submit = async () => {
    const n = toNum(qty);
    if (!n || n <= 0) return alert("Valid positive quantity enter karo");
    setLoading(true);
    await onSave(n);
    setLoading(false);
    onClose();
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1500 }}>
      <div style={{ background:"#fff", borderRadius:14, padding:"28px 32px", maxWidth:360, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>+ Restock</div>
        <div style={{ fontSize:13, color:"#374151", fontWeight:600, marginBottom:4 }}>{item.product?.name}</div>
        <div style={{ fontSize:12, color:"#6B7280", marginBottom:18 }}>
          Current available: <b style={{ color:"#2563EB" }}>{item.availableStock}</b> units
        </div>
        <label style={labelStyle}>Add Quantity</label>
        <input
          type="number" min="1" value={qty}
          onChange={e => setQty(e.target.value)}
          placeholder="e.g. 50" style={{ ...inputStyle, marginBottom:16 }}
          autoFocus onKeyDown={e => e.key === "Enter" && submit()}
        />
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={secondaryBtn}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ ...primaryBtn, background:"#059669" }}>
            {loading ? "Saving…" : "+ Add Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Batch Detail Modal ─── */
const BatchDetailModal = ({ item, onClose }) => {
  if (!item) return null;
  const batches = item.batches || [];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1500 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"0", maxWidth:620, width:"95%", boxShadow:"0 24px 60px rgba(0,0,0,.25)", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#4338CA,#6D28D9)", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>📦 Batch Details</div>
            <div style={{ fontSize:12, color:"#C7D2FE", marginTop:2 }}>{item.product?.name} — {batches.length} batch{batches.length !== 1 ? "es" : ""}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.2)", border:"none", color:"#fff", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16, fontWeight:700 }}>✕</button>
        </div>

        {/* Table */}
        <div style={{ overflowX:"auto", maxHeight:400, overflowY:"auto" }}>
          {batches.length === 0 ? (
            <div style={{ padding:"40px", textAlign:"center", color:"#94A3B8", fontSize:13 }}>Koi batch record nahi</div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                <tr style={{ background:"#F5F3FF" }}>
                  <th style={{ ...th, color:"#6D28D9", fontSize:10 }}>#</th>
                  <th style={{ ...th, color:"#6D28D9", fontSize:10 }}>Batch No.</th>
                  <th style={{ ...th, color:"#6D28D9", fontSize:10 }}>Mfg. Date</th>
                  <th style={{ ...th, color:"#6D28D9", fontSize:10 }}>Expiry Date</th>
                  <th style={{ ...th, color:"#6D28D9", fontSize:10, textAlign:"right" }}>Qty</th>
                  <th style={{ ...th, color:"#6D28D9", fontSize:10 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b, i) => {
                  const level = expiryLevel(b.expiryDate);
                  const ec = EXPIRY_COLORS[level];
                  return (
                    <tr key={b._id || i}
                      style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFF" }}
                      onMouseEnter={e => e.currentTarget.style.background="#EEF2FF"}
                      onMouseLeave={e => e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFF"}
                    >
                      <td style={{ ...td, color:"#94A3B8", fontSize:12, textAlign:"center", width:36 }}>{i+1}</td>
                      <td style={{ ...td }}>
                        {b.batchNo ? (
                          <span style={{
                            display:"inline-block", padding:"3px 9px", borderRadius:6,
                            background:"#EEF2FF", color:"#4338CA",
                            fontSize:12, fontWeight:700, fontFamily:"monospace",
                            border:"1px solid #C7D2FE",
                          }}>{b.batchNo}</span>
                        ) : (
                          <span style={{ color:"#CBD5E1", fontSize:12 }}>—</span>
                        )}
                      </td>
                      <td style={{ ...td, fontSize:12, color:"#6B7280" }}>{fmtDate(b.mfgDate) || <span style={{ color:"#CBD5E1" }}>—</span>}</td>
                      <td style={{ ...td }}>
                        <ExpiryBadge date={b.expiryDate} />
                      </td>
                      <td style={{ ...td, textAlign:"right", fontWeight:800, fontSize:14, color:"#111827" }}>{b.qty}</td>
                      <td style={{ ...td }}>
                        {level !== "none" ? (
                          <span style={{
                            display:"inline-block", padding:"2px 8px", borderRadius:20,
                            fontSize:10, fontWeight:700,
                            background: ec.bg, color: ec.text, border:`1px solid ${ec.border}`,
                          }}>
                            {level === "expired" ? "Expired" : level === "critical" ? "Critical" : level === "warning" ? "Warning" : "OK"}
                          </span>
                        ) : <span style={{ color:"#CBD5E1", fontSize:12 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer summary */}
        <div style={{ padding:"12px 24px", background:"#F5F3FF", borderTop:"1px solid #C7D2FE", display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:"#6D28D9", fontWeight:700 }}>
            Total Qty: <span style={{ fontSize:14 }}>{batches.reduce((s,b)=>s+toNum(b.qty),0)}</span>
          </span>
          {batches.some(b=>b.batchNo) && (
            <span style={{ fontSize:12, color:"#6B7280" }}>
              {batches.filter(b=>b.batchNo).length} batch numbers assigned
            </span>
          )}
          <button onClick={onClose} style={{ ...secondaryBtn, marginLeft:"auto", fontSize:12, padding:"6px 16px" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Shared Styles ─── */
const primaryBtn = {
  padding:"9px 20px", background:"#2563EB", color:"#fff",
  border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13,
};
const secondaryBtn = {
  padding:"9px 18px", background:"#F1F5F9", border:"1px solid #D1D5DB",
  borderRadius:8, cursor:"pointer", fontSize:13, color:"#374151",
};
const inputStyle = {
  width:"100%", padding:"9px 12px", borderRadius:8,
  border:"1px solid #D1D5DB", fontSize:13, outline:"none",
  background:"#F9FAFB", boxSizing:"border-box", display:"block",
};
const labelStyle = {
  display:"block", fontSize:11, fontWeight:700,
  color:"#374151", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.04em",
};
const th = {
  padding:"10px 14px", textAlign:"left", fontSize:11,
  fontWeight:700, color:"#6B7280", borderBottom:"1px solid #E5E7EB",
  background:"#F9FAFB", textTransform:"uppercase", letterSpacing:"0.05em",
  whiteSpace:"nowrap",
};
const td = { padding:"11px 14px", fontSize:13, borderBottom:"1px solid #F3F4F6", color:"#374151" };

/* ══════════════════════════════════════
   BATCH ROWS EDITOR — used inside Add/Edit form
══════════════════════════════════════ */
const newBatchRow = () => ({
  id: Date.now() + Math.random(),
  batchNo: "",
  mfgDate: "",
  expiryDate: "",
  qty: "",
});

function BatchRowsEditor({ rows, onChange }) {
  const addRow = () => onChange([...rows, newBatchRow()]);
  const removeRow = (id) => onChange(rows.length > 1 ? rows.filter(r => r.id !== id) : rows);
  const updateRow = (id, key, val) =>
    onChange(rows.map(r => r.id === id ? { ...r, [key]: val } : r));

  const totalQty = rows.reduce((s, r) => s + toNum(r.qty), 0);

  return (
    <div style={{
      border:"1px solid #C7D2FE", borderRadius:10,
      overflow:"hidden", marginTop:4,
    }}>
      {/* Header */}
      <div style={{
        background:"#EEF2FF", padding:"10px 14px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        borderBottom:"1px solid #C7D2FE",
      }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#4338CA" }}>
          📦 Batch Details
          {totalQty > 0 && (
            <span style={{
              marginLeft:10, background:"#4338CA", color:"#fff",
              padding:"2px 8px", borderRadius:20, fontSize:11,
            }}>Total: {totalQty} units</span>
          )}
        </div>
        <button
          type="button"
          onClick={addRow}
          style={{
            padding:"5px 12px", background:"#4338CA", color:"#fff",
            border:"none", borderRadius:6, cursor:"pointer",
            fontSize:12, fontWeight:700,
          }}
        >+ Add Batch</button>
      </div>

      {/* Rows */}
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:560 }}>
          <thead>
            <tr style={{ background:"#F5F3FF" }}>
              <th style={{ ...th, background:"#F5F3FF", color:"#6D28D9", fontSize:10 }}>#</th>
              <th style={{ ...th, background:"#F5F3FF", color:"#6D28D9", fontSize:10 }}>Batch No.</th>
              <th style={{ ...th, background:"#F5F3FF", color:"#6D28D9", fontSize:10 }}>Mfg. Date</th>
              <th style={{ ...th, background:"#F5F3FF", color:"#6D28D9", fontSize:10 }}>Expiry Date</th>
              <th style={{ ...th, background:"#F5F3FF", color:"#6D28D9", fontSize:10 }}>Qty *</th>
              <th style={{ ...th, background:"#F5F3FF", width:36 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const level = expiryLevel(row.expiryDate);
              const eColor = EXPIRY_COLORS[level];
              return (
                <tr key={row.id}
                  onMouseEnter={e => e.currentTarget.style.background="#FAFAFA"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <td style={{ ...td, color:"#94A3B8", fontSize:12, width:28, textAlign:"center" }}>{idx + 1}</td>
                  <td style={td}>
                    <input
                      type="text"
                      placeholder="LOT-001"
                      value={row.batchNo}
                      onChange={e => updateRow(row.id, "batchNo", e.target.value)}
                      style={{ ...inputStyle, width:100, marginBottom:0 }}
                    />
                  </td>
                  <td style={td}>
                    <input
                      type="date"
                      value={row.mfgDate}
                      onChange={e => updateRow(row.id, "mfgDate", e.target.value)}
                      style={{ ...inputStyle, width:138, marginBottom:0 }}
                    />
                  </td>
                  <td style={td}>
                    <div>
                      <input
                        type="date"
                        value={row.expiryDate}
                        onChange={e => updateRow(row.id, "expiryDate", e.target.value)}
                        style={{
                          ...inputStyle, width:138, marginBottom:0,
                          borderColor: row.expiryDate ? eColor.border : "#D1D5DB",
                        }}
                      />
                      {row.expiryDate && (
                        <div style={{
                          marginTop:3, fontSize:10, fontWeight:700,
                          color: eColor.text,
                        }}>
                          {(() => {
                            const d = daysLeft(row.expiryDate);
                            return d < 0 ? `Expired ${Math.abs(d)}d ago` : `${d}d left`;
                          })()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={td}>
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={row.qty}
                      onChange={e => updateRow(row.id, "qty", e.target.value)}
                      style={{ ...inputStyle, width:80, marginBottom:0, fontWeight:700 }}
                    />
                  </td>
                  <td style={{ ...td, textAlign:"center" }}>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      style={{
                        background:"none", border:"none", cursor:"pointer",
                        color:"#EF4444", fontSize:16,
                        opacity: rows.length === 1 ? 0.3 : 1,
                      }}
                    >✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div style={{
        padding:"8px 14px", background:"#F5F3FF",
        borderTop:"1px solid #C7D2FE",
        fontSize:11, color:"#7C3AED",
      }}>
        💡 Batch No. optional hai. Qty required hai. Nearest expiry automatically set hogi.
      </div>
    </div>
  );
}

/* ─── Inline Batch Numbers Cell ─── */
function BatchNumbersCell({ item, onViewAll }) {
  const batches = item.batches || [];
  if (batches.length === 0) {
    return <span style={{ color:"#CBD5E1", fontSize:12 }}>—</span>;
  }

  // Show first 2 batch numbers inline, rest on click
  const withBatchNo = batches.filter(b => b.batchNo);
  const shown = withBatchNo.slice(0, 2);
  const remaining = withBatchNo.length - 2;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"flex-start" }}>
      {/* Batch count pill */}
      <button
        onClick={() => onViewAll(item)}
        style={{
          display:"inline-flex", alignItems:"center", gap:5,
          padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700,
          background:"#EEF2FF", color:"#4338CA",
          border:"1px solid #C7D2FE", cursor:"pointer",
          transition:"all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background="#4338CA"; e.currentTarget.style.color="#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background="#EEF2FF"; e.currentTarget.style.color="#4338CA"; }}
        title="Click to see all batches"
      >
        📦 {batches.length} batch{batches.length > 1 ? "es" : ""}
      </button>

      {/* Batch numbers preview */}
      {shown.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
          {shown.map((b, i) => (
            <span key={i} style={{
              display:"inline-block", padding:"1px 7px", borderRadius:4,
              fontSize:10, fontWeight:700, fontFamily:"monospace",
              background:"#F5F3FF", color:"#6D28D9",
              border:"1px solid #DDD6FE",
            }}>{b.batchNo}</span>
          ))}
          {remaining > 0 && (
            <span style={{
              display:"inline-block", padding:"1px 7px", borderRadius:4,
              fontSize:10, fontWeight:600, color:"#94A3B8",
              cursor:"pointer",
            }} onClick={() => onViewAll(item)}>+{remaining} more</span>
          )}
        </div>
      )}
      {shown.length === 0 && withBatchNo.length === 0 && (
        <span style={{ fontSize:10, color:"#94A3B8" }}>No batch nos.</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function VendorInventory() {
  const [tab, setTab]           = useState("inventory");
  const [items, setItems]       = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);

  const [toast, setToast]       = useState({ msg:"", type:"success" });
  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"success" }), 3500);
  };

  const [confirm, setConfirm]   = useState({ open:false, msg:"", cb:null });
  const askConfirm = (msg, cb) => setConfirm({ open:true, msg, cb });
  const closeConfirm = ()       => setConfirm({ open:false, msg:"", cb:null });

  const [restockItem, setRestockItem] = useState(null);
  const [batchDetailItem, setBatchDetailItem] = useState(null); // NEW

  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("ALL");

  /* form */
  const emptyForm = { productId:"", totalStock:"", minStock:"5", expiryDate:"" };
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);

  /* ── Stock mode: "simple" | "batch" ── */
  const [stockMode, setStockMode] = useState("simple");
  const [batchFormRows, setBatchFormRows] = useState([newBatchRow()]);

  /* batch tab */
  const newRow = () => ({ id: Date.now()+Math.random(), productId:"", totalStock:"", minStock:"5", expiryDate:"" });
  const [batchRows, setBatchRows] = useState([newRow()]);

  /* ── Fetch ── */
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get(INVENTORY_API);
      if (res.data?.success) {
        setItems(res.data.data.filter(x => x.product && x.product._id));
      }
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to fetch inventory", "error");
    } finally { setLoading(false); }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosAuth.get(PRODUCT_API);
      if (res.data?.success) setProducts(res.data.data);
    } catch { showToast("Failed to fetch products", "error"); }
  }, []);

  useEffect(() => { fetchInventory(); fetchProducts(); }, []);

  /* ── Smart sort ── */
  const sortItems = useCallback((list) => {
    const score = (x) => {
      let s = 0;
      if (x.outOfStock) s += 1000;
      else if (x.availableStock <= x.minStock) s += 500;
      const days = daysLeft(x.expiryDate);
      if (days !== null) {
        if (days <= 0)  s += 800;
        else if (days <= 7)  s += 400;
        else if (days <= 30) s += 200;
      }
      return s;
    };
    return [...list].sort((a, b) => {
      const d = score(b) - score(a);
      if (d !== 0) return d;
      const da = a.expiryDate ? new Date(a.expiryDate) : null;
      const db = b.expiryDate ? new Date(b.expiryDate) : null;
      if (da && db) return da - db;
      if (da) return -1;
      if (db) return 1;
      return 0;
    });
  }, []);

  /* ── Filtered ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const base = items.filter(x => {
      const nameOk = !q || x.product?.name?.toLowerCase().includes(q);
      const days   = daysLeft(x.expiryDate);
      const statOk =
        status === "ALL"      ? true :
        status === "OUT"      ? x.outOfStock :
        status === "LOW"      ? (!x.outOfStock && x.availableStock <= x.minStock) :
        status === "EXPIRING" ? (days !== null && days <= 30) :
        (!x.outOfStock && x.availableStock > x.minStock);
      return nameOk && statOk;
    });
    return sortItems(base);
  }, [items, search, status, sortItems]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:    items.length,
    ok:       items.filter(x => !x.outOfStock && x.availableStock > x.minStock).length,
    low:      items.filter(x => !x.outOfStock && x.availableStock <= x.minStock).length,
    out:      items.filter(x => x.outOfStock).length,
    expiring: items.filter(x => { const d = daysLeft(x.expiryDate); return d !== null && d <= 30 && !x.outOfStock; }).length,
  }), [items]);

  /* ── Reset form helper ── */
  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setStockMode("simple");
    setBatchFormRows([newBatchRow()]);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !form.productId) return showToast("Product select karo", "error");

    if (stockMode === "batch") {
      const validBatches = batchFormRows.filter(r => r.qty && toNum(r.qty) > 0);
      if (!validBatches.length) return showToast("Kam se kam ek batch mein qty daalo", "error");
    } else {
      if (form.totalStock === "") return showToast("Total stock required", "error");
    }

    setSaving(true);
    try {
      let body;
      if (stockMode === "batch") {
        const validBatches = batchFormRows
          .filter(r => r.qty && toNum(r.qty) > 0)
          .map(r => ({
            batchNo:    r.batchNo.trim(),
            mfgDate:    r.mfgDate    || null,
            expiryDate: r.expiryDate || null,
            qty:        toNum(r.qty),
          }));
        body = {
          minStock: toNum(form.minStock, 5),
          batches:  validBatches,
        };
      } else {
        body = {
          totalStock: toNum(form.totalStock),
          minStock:   toNum(form.minStock, 5),
          expiryDate: form.expiryDate || null,
        };
      }

      if (editId) {
        await axiosAuth.put(`${INVENTORY_API}/${editId}`, body);
        showToast("Inventory updated!");
      } else {
        await axiosAuth.post(INVENTORY_API, { ...body, productId: form.productId });
        showToast("Inventory added!");
      }
      resetForm();
      fetchInventory();
    } catch (e) {
      showToast(e?.response?.data?.message || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const handleEdit = (inv) => {
    const hasBatches = inv.batches && inv.batches.length > 0;
    setForm({
      productId:  inv.product?._id || "",
      totalStock: String(inv.totalStock),
      minStock:   String(inv.minStock),
      expiryDate: inv.expiryDate ? inv.expiryDate.slice(0, 10) : "",
    });
    setEditId(inv._id);
    if (hasBatches) {
      setStockMode("batch");
      setBatchFormRows(inv.batches.map(b => ({
        id:        b._id || (Date.now() + Math.random()),
        batchNo:   b.batchNo   || "",
        mfgDate:   b.mfgDate   ? b.mfgDate.slice(0,10)   : "",
        expiryDate:b.expiryDate ? b.expiryDate.slice(0,10) : "",
        qty:       String(b.qty || ""),
      })));
    } else {
      setStockMode("simple");
      setBatchFormRows([newBatchRow()]);
    }
    setTab("add");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const handleDelete = (inv) => {
    askConfirm(
      `"${inv.product?.name}" ka inventory record delete karein? Yeh undo nahi hoga.`,
      async () => {
        closeConfirm();
        try {
          await axiosAuth.delete(`${INVENTORY_API}/${inv._id}`);
          setItems(prev => prev.filter(x => x._id !== inv._id));
          if (editId === inv._id) resetForm();
          showToast("Deleted!");
        } catch (e) { showToast(e?.response?.data?.message || "Delete failed", "error"); }
      }
    );
  };

  const handleRestock = async (qty) => {
    try {
      await axiosAuth.patch(`${INVENTORY_API}/${restockItem._id}/restock`, { quantity: qty });
      showToast(`+${qty} stock added!`);
      fetchInventory();
    } catch (e) { showToast(e?.response?.data?.message || "Restock failed", "error"); }
  };

  /* ── Batch tab save ── */
  const saveBatch = async () => {
    const valid = batchRows.filter(r => r.productId && r.totalStock !== "");
    if (!valid.length) return showToast("Kam se kam ek valid row fill karo", "error");
    setSaving(true);
    try {
      const res = await axiosAuth.post(`${INVENTORY_API}/batch`, {
        items: valid.map(r => ({
          productId:  r.productId,
          totalStock: toNum(r.totalStock),
          minStock:   toNum(r.minStock, 5),
          expiryDate: r.expiryDate || null,
        })),
      });
      const d = res.data?.data;
      showToast(`${d?.created?.length||0} created, ${d?.updated?.length||0} updated!`);
      setBatchRows([newRow()]);
      fetchInventory();
    } catch (e) { showToast(e?.response?.data?.message || "Batch save failed", "error"); }
    finally { setSaving(false); }
  };

  const updateRow = (id, k, v) => setBatchRows(r => r.map(row => row.id === id ? { ...row, [k]: v } : row));

  /* ── Batch form total qty ── */
  const batchFormTotal = batchFormRows.reduce((s, r) => s + toNum(r.qty), 0);

  /* ── Render ── */
  const TABS = [
    { id:"inventory", label:"📦 Stock List" },
    { id:"add",       label:"✏️ Add / Edit" },
    { id:"batch",     label:"⚡ Batch Update" },
  ];

  return (
    <div style={{ fontFamily:"'Segoe UI', system-ui, sans-serif", padding:"20px 24px", maxWidth:1200, margin:"0 auto", color:"#111827", background:"#F8FAFC", minHeight:"100vh" }}>
      <Toast msg={toast.msg} type={toast.type} />
      <Confirm open={confirm.open} msg={confirm.msg} onOk={confirm.cb} onCancel={closeConfirm} />
      <RestockModal item={restockItem} onClose={() => setRestockItem(null)} onSave={handleRestock} />
      <BatchDetailModal item={batchDetailItem} onClose={() => setBatchDetailItem(null)} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:"#0F172A", letterSpacing:"-0.02em" }}>Inventory Management</div>
          <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>
            {loading ? "Loading…" : `${items.length} products tracked`}
          </div>
        </div>
        <button onClick={() => { fetchInventory(); fetchProducts(); }} style={secondaryBtn}>↻ Refresh</button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard label="Total Products" value={stats.total}    color="#2563EB" />
        <StatCard label="In Stock"       value={stats.ok}       color="#059669" />
        <StatCard label="Low Stock"      value={stats.low}      color="#D97706" />
        <StatCard label="Out of Stock"   value={stats.out}      color="#DC2626" />
        <StatCard label="Expiring Soon"  value={stats.expiring} color="#9333EA" sub="within 30 days" />
      </div>

      {/* Alert Banner */}
      {(stats.out > 0 || stats.expiring > 0) && (
        <div style={{
          background:"#FFF7ED", border:"1px solid #FED7AA",
          borderRadius:10, padding:"12px 16px", marginBottom:16,
          display:"flex", alignItems:"center", gap:12, flexWrap:"wrap",
        }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <div style={{ fontSize:13, color:"#92400E" }}>
            {stats.out > 0 && <span><b>{stats.out} product{stats.out>1?"s":""}</b> out of stock. </span>}
            {stats.expiring > 0 && <span><b>{stats.expiring} product{stats.expiring>1?"s":""}</b> expiring within 30 days. </span>}
            <button
              onClick={() => { setStatus("EXPIRING"); setTab("inventory"); }}
              style={{ color:"#C2410C", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontSize:13, textDecoration:"underline" }}
            >View expiring →</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", background:"#fff", border:"1px solid #E5E7EB", borderRadius:10, overflow:"hidden", marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:"11px 4px", border:"none", cursor:"pointer",
            fontSize:13, fontWeight:700, transition:"all .15s",
            background: tab===t.id ? "#2563EB" : "transparent",
            color: tab===t.id ? "#fff" : "#6B7280",
            borderRight:"1px solid #E5E7EB",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══ TAB: STOCK LIST ══ */}
      {tab === "inventory" && (
        <>
          <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
            <input
              type="text" placeholder="🔍 Search product…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth:240, flex:"1 1 180px" }}
            />
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {[
                { k:"ALL",      label:"All",           color:"#2563EB" },
                { k:"OK",       label:"✓ In Stock",    color:"#059669" },
                { k:"LOW",      label:"↓ Low",         color:"#D97706" },
                { k:"OUT",      label:"✕ Out",         color:"#DC2626" },
                { k:"EXPIRING", label:"⏰ Expiring",   color:"#9333EA" },
              ].map(({ k, label, color }) => (
                <button key={k} onClick={() => setStatus(k)} style={{
                  padding:"7px 13px", borderRadius:8, fontSize:12, fontWeight:700,
                  border:`1.5px solid ${status===k ? color : "#E5E7EB"}`,
                  background: status===k ? color : "#fff",
                  color: status===k ? "#fff" : "#6B7280",
                  cursor:"pointer", transition:"all .15s",
                }}>{label}</button>
              ))}
            </div>
            <button onClick={() => { resetForm(); setTab("add"); }}
              style={{ ...primaryBtn, marginLeft:"auto" }}>
              + Add Stock
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", color:"#94A3B8", padding:60, fontSize:14 }}>Loading inventory…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", color:"#CBD5E1", padding:60 }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
              <div style={{ fontSize:14 }}>No inventory records found.</div>
            </div>
          ) : (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #E5E7EB", overflow:"hidden" }}>
              <div style={{ padding:"11px 16px", borderBottom:"1px solid #F3F4F6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#6B7280" }}>
                  {filtered.length} of {items.length} products
                  {(stats.low + stats.out) > 0 && <span style={{ color:"#DC2626", marginLeft:8 }}>• {stats.low + stats.out} need attention</span>}
                </span>
                <span style={{ fontSize:11, color:"#94A3B8" }}>Sorted by: critical items first ↑</span>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>#</th>
                      <th style={th}>Product</th>
                      <th style={{ ...th, textAlign:"center" }}>Total</th>
                      <th style={{ ...th, textAlign:"center" }}>Available</th>
                      <th style={{ ...th, textAlign:"center" }}>Min Alert</th>
                      <th style={th}>Expiry Date</th>
                      {/* ─── NEW: Batch Numbers column ─── */}
                      <th style={{ ...th, minWidth:160 }}>Batch Info</th>
                      <th style={{ ...th, textAlign:"center" }}>Status</th>
                      <th style={{ ...th, textAlign:"center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((x, i) => {
                      const level = expiryLevel(x.expiryDate);
                      const rowBg =
                        x.outOfStock ? "#FFF5F5" :
                        level === "expired"  ? "#FFF5F5" :
                        level === "critical" ? "#FFFBF0" :
                        x.availableStock <= x.minStock ? "#FFFDF0" : "transparent";
                      return (
                        <tr key={x._id}
                          style={{ background: rowBg, transition:"background .1s" }}
                          onMouseEnter={e => e.currentTarget.style.filter="brightness(0.97)"}
                          onMouseLeave={e => e.currentTarget.style.filter="none"}
                        >
                          <td style={{ ...td, color:"#94A3B8", width:40, verticalAlign:"middle" }}>
                            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                              <span>{i+1}</span>
                              <UrgencyTag item={x} />
                            </div>
                          </td>
                          <td style={{ ...td, fontWeight:600, color:"#111827", verticalAlign:"middle" }}>
                            {x.product?.name || "—"}
                          </td>
                          <td style={{ ...td, textAlign:"center", verticalAlign:"middle" }}>{x.totalStock}</td>
                          <td style={{
                            ...td, textAlign:"center", verticalAlign:"middle",
                            fontWeight:800, fontSize:15,
                            color: x.outOfStock ? "#DC2626" : x.availableStock <= x.minStock ? "#D97706" : "#059669"
                          }}>{x.availableStock}</td>
                          <td style={{ ...td, textAlign:"center", color:"#94A3B8", verticalAlign:"middle" }}>{x.minStock}</td>
                          <td style={{ ...td, verticalAlign:"middle" }}>
                            <ExpiryBadge date={x.expiryDate} />
                          </td>
                          {/* ─── NEW: Batch Numbers cell ─── */}
                          <td style={{ ...td, verticalAlign:"middle" }}>
                            <BatchNumbersCell item={x} onViewAll={setBatchDetailItem} />
                          </td>
                          <td style={{ ...td, textAlign:"center", verticalAlign:"middle" }}>
                            <StatusBadge item={x} />
                          </td>
                          <td style={{ ...td, textAlign:"center", verticalAlign:"middle", whiteSpace:"nowrap" }}>
                            <div style={{ display:"inline-flex", gap:5 }}>
                              <ActionBtn color="#2563EB" bg="#EFF6FF" border="#BFDBFE" onClick={() => handleEdit(x)}>Edit</ActionBtn>
                              <ActionBtn color="#059669" bg="#ECFDF5" border="#A7F3D0" onClick={() => setRestockItem(x)}>+Stock</ActionBtn>
                              <ActionBtn color="#DC2626" bg="#FEF2F2" border="#FECACA" onClick={() => handleDelete(x)}>Delete</ActionBtn>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ TAB: ADD/EDIT ══ */}
      {tab === "add" && (
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #E5E7EB", padding:"24px 28px" }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#0F172A", marginBottom:20 }}>
            {editId ? "✏️ Update Stock" : "➕ Add New Stock"}
          </div>

          <form onSubmit={handleSubmit}>
            {/* ── Top fields: Product + Min Stock ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))", gap:18, marginBottom:20 }}>
              {/* Product */}
              <div>
                <label style={labelStyle}>Product *</label>
                {editId ? (
                  <div style={{ ...inputStyle, background:"#F1F5F9", color:"#6B7280", cursor:"not-allowed" }}>
                    {items.find(x => x._id === editId)?.product?.name || "—"}
                  </div>
                ) : (
                  <select
                    value={form.productId}
                    onChange={e => setForm(p => ({ ...p, productId: e.target.value }))}
                    required style={inputStyle}
                  >
                    <option value="">Select Product…</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Min Stock */}
              <div>
                <label style={labelStyle}>Min Stock Alert</label>
                <input
                  type="number" min="0" placeholder="e.g. 5"
                  value={form.minStock}
                  onChange={e => setForm(p => ({ ...p, minStock: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* ── Stock Mode Toggle ── */}
            <div style={{ marginBottom:16 }}>
              <label style={{ ...labelStyle, marginBottom:10 }}>Stock Entry Mode</label>
              <div style={{
                display:"inline-flex", background:"#F1F5F9",
                borderRadius:10, padding:4, gap:4,
              }}>
                <button
                  type="button"
                  onClick={() => setStockMode("simple")}
                  style={{
                    padding:"8px 18px", borderRadius:8, border:"none",
                    cursor:"pointer", fontSize:13, fontWeight:700, transition:"all .15s",
                    background: stockMode === "simple" ? "#fff" : "transparent",
                    color:      stockMode === "simple" ? "#2563EB" : "#6B7280",
                    boxShadow:  stockMode === "simple" ? "0 1px 4px rgba(0,0,0,.12)" : "none",
                  }}
                >📦 Simple</button>
                <button
                  type="button"
                  onClick={() => setStockMode("batch")}
                  style={{
                    padding:"8px 18px", borderRadius:8, border:"none",
                    cursor:"pointer", fontSize:13, fontWeight:700, transition:"all .15s",
                    background: stockMode === "batch" ? "#fff" : "transparent",
                    color:      stockMode === "batch" ? "#7C3AED" : "#6B7280",
                    boxShadow:  stockMode === "batch" ? "0 1px 4px rgba(0,0,0,.12)" : "none",
                  }}
                >🗂️ Batch / Lot-wise</button>
              </div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:6 }}>
                {stockMode === "simple"
                  ? "Single stock entry — ek expiry date ke saath"
                  : "Multiple batches — alag-alag lot number, mfg date, expiry date aur qty"}
              </div>
            </div>

            {/* ── SIMPLE MODE fields ── */}
            {stockMode === "simple" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))", gap:18, marginBottom:20 }}>
                <div>
                  <label style={labelStyle}>Total Stock *</label>
                  <input
                    type="number" min="0" placeholder="e.g. 100"
                    value={form.totalStock}
                    onChange={e => setForm(p => ({ ...p, totalStock: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Expiry Date
                    <span style={{ color:"#94A3B8", fontWeight:400, marginLeft:4 }}>(optional)</span>
                  </label>
                  <input
                    type="date" value={form.expiryDate}
                    onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))}
                    style={inputStyle}
                  />
                  {form.expiryDate && (
                    <div style={{ marginTop:6 }}>
                      <ExpiryBadge date={form.expiryDate} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── BATCH MODE fields ── */}
            {stockMode === "batch" && (
              <div style={{ marginBottom:20 }}>
                <BatchRowsEditor
                  rows={batchFormRows}
                  onChange={setBatchFormRows}
                />
                {batchFormTotal > 0 && (
                  <div style={{ marginTop:10, padding:"10px 14px", background:"#EEF2FF", borderRadius:8, fontSize:13, color:"#3730A3" }}>
                    <b>Total Stock:</b> {batchFormTotal} units &nbsp;·&nbsp;
                    <b>Batches:</b> {batchFormRows.filter(r => toNum(r.qty) > 0).length}
                    {batchFormRows.some(r => r.expiryDate) && (
                      <> &nbsp;·&nbsp; <b>Nearest Expiry:</b> {
                        fmtDate(
                          batchFormRows
                            .filter(r => r.expiryDate && toNum(r.qty) > 0)
                            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]?.expiryDate
                        ) || "—"
                      }</>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Edit warning ── */}
            {editId && (
              <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:8, padding:"10px 14px", marginBottom:18, fontSize:12, color:"#92400E" }}>
                ⚠️ Update karoge toh stock reset ho jayega. Sirf quantity add karne ke liye <b>"+Stock"</b> use karo inventory list mein.
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : editId ? "Update Stock" : "Add Stock"}
              </button>
              {editId && (
                <button type="button" onClick={resetForm} style={secondaryBtn}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* Quick list */}
          {!editId && items.length > 0 && (
            <div style={{ marginTop:30 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#6B7280", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                Quick Edit Existing
              </div>
              <div style={{ display:"grid", gap:7 }}>
                {sortItems(items).slice(0, 8).map(x => (
                  <div key={x._id} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 14px", background:"#F8FAFC", borderRadius:8,
                    border:"1px solid #E5E7EB", flexWrap:"wrap", gap:8,
                  }}>
                    <div>
                      <span style={{ fontWeight:600, fontSize:13 }}>{x.product?.name}</span>
                      <span style={{ color:"#94A3B8", fontSize:12, marginLeft:8 }}>
                        {x.availableStock}/{x.totalStock}
                      </span>
                      {x.batches?.length > 0 && (
                        <span style={{ marginLeft:8, fontSize:11, fontWeight:700, color:"#4338CA" }}>
                          · {x.batches.length} batch{x.batches.length > 1 ? "es" : ""}
                        </span>
                      )}
                      {!x.batches?.length && x.expiryDate && (
                        <span style={{
                          marginLeft:8, fontSize:11, fontWeight:700,
                          color: EXPIRY_COLORS[expiryLevel(x.expiryDate)].text,
                        }}>
                          · exp {fmtDate(x.expiryDate)}
                        </span>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <StatusBadge item={x} />
                      <button onClick={() => handleEdit(x)} style={{
                        padding:"4px 12px", background:"#EFF6FF", color:"#2563EB",
                        border:"1px solid #BFDBFE", borderRadius:6, cursor:"pointer",
                        fontSize:12, fontWeight:700,
                      }}>Edit</button>
                    </div>
                  </div>
                ))}
                {items.length > 8 && (
                  <div style={{ fontSize:12, color:"#94A3B8", textAlign:"center", padding:6 }}>
                    +{items.length - 8} more — Stock List tab mein dekho
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: BATCH ══ */}
      {tab === "batch" && (
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #E5E7EB", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #F3F4F6", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:"#0F172A" }}>⚡ Batch Stock Update</div>
              <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>
                Multiple products ek saath update/add karo. Existing = update, naya = create.
              </div>
            </div>
            <button onClick={() => setBatchRows(r => [...r, newRow()])} style={{ ...primaryBtn, padding:"8px 16px", fontSize:12 }}>
              + Row Add
            </button>
          </div>

          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
              <thead>
                <tr>
                  <th style={{ ...th, width:36 }}>#</th>
                  <th style={{ ...th, minWidth:180 }}>Product *</th>
                  <th style={{ ...th, minWidth:110 }}>Total Stock *</th>
                  <th style={{ ...th, minWidth:100 }}>Min Stock</th>
                  <th style={{ ...th, minWidth:150 }}>Expiry Date</th>
                  <th style={{ ...th, width:40 }}></th>
                </tr>
              </thead>
              <tbody>
                {batchRows.map((row, idx) => (
                  <tr key={row.id}
                    onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    style={{ transition:"background .1s" }}
                  >
                    <td style={{ ...td, color:"#94A3B8", fontFamily:"monospace", verticalAlign:"middle" }}>{idx+1}</td>
                    <td style={{ ...td, verticalAlign:"middle" }}>
                      <select
                        value={row.productId}
                        onChange={e => updateRow(row.id, "productId", e.target.value)}
                        style={{ ...inputStyle, marginBottom:0 }}
                      >
                        <option value="">Select product…</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ ...td, verticalAlign:"middle" }}>
                      <input
                        type="number" min="0" placeholder="0" value={row.totalStock}
                        onChange={e => updateRow(row.id, "totalStock", e.target.value)}
                        style={{ ...inputStyle, marginBottom:0, width:100 }}
                      />
                    </td>
                    <td style={{ ...td, verticalAlign:"middle" }}>
                      <input
                        type="number" min="0" placeholder="5" value={row.minStock}
                        onChange={e => updateRow(row.id, "minStock", e.target.value)}
                        style={{ ...inputStyle, marginBottom:0, width:90 }}
                      />
                    </td>
                    <td style={{ ...td, verticalAlign:"middle" }}>
                      <div>
                        <input
                          type="date" value={row.expiryDate}
                          onChange={e => updateRow(row.id, "expiryDate", e.target.value)}
                          style={{ ...inputStyle, marginBottom:0, width:145 }}
                        />
                        {row.expiryDate && (
                          <div style={{ marginTop:4, fontSize:10, fontWeight:700, color: EXPIRY_COLORS[expiryLevel(row.expiryDate)].text }}>
                            {(() => { const d = daysLeft(row.expiryDate); return d < 0 ? `Expired ${Math.abs(d)}d ago` : `${d}d left`; })()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ ...td, verticalAlign:"middle" }}>
                      <button
                        onClick={() => setBatchRows(r => r.length > 1 ? r.filter(x => x.id !== row.id) : r)}
                        disabled={batchRows.length === 1}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", fontSize:16, opacity: batchRows.length===1 ? 0.3 : 1 }}
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding:"14px 20px", borderTop:"1px solid #F3F4F6", background:"#FAFAFA", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#6B7280" }}>
              <b style={{ color:"#111827" }}>{batchRows.filter(r => r.productId && r.totalStock !== "").length}</b> valid /
              <b style={{ color:"#111827" }}> {batchRows.length}</b> rows
            </span>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setBatchRows([newRow()])} style={secondaryBtn}>Reset</button>
              <button
                onClick={saveBatch}
                disabled={saving || !batchRows.some(r => r.productId && r.totalStock !== "")}
                style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Saving…" : `Save ${batchRows.filter(r=>r.productId&&r.totalStock!=="").length} Items`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(20px); opacity:0; } to { transform:translateX(0); opacity:1; } }
        input:focus, select:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
      `}</style>
    </div>
  );
}

/* ─── Small action button ─── */
function ActionBtn({ color, bg, border, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:"5px 11px", background:bg, color, border:`1px solid ${border}`,
        borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:700, transition:"opacity .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.opacity="0.8"}
      onMouseLeave={e => e.currentTarget.style.opacity="1"}
    >{children}</button>
  );
}