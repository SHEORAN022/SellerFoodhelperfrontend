import React, { useEffect, useState } from "react";
import axios from "axios";

const DISCOUNT_API = "https://foodhelpervendor.onrender.com/api/vendor/bulk-discounts";
const PRODUCT_API = "https://foodhelpervendor.onrender.com/api/vendor/products";

const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const EMPTY = { product: "", minQty: "", maxQty: "", unitPrice: "" };

export default function VendorBulkDiscount() {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
    loadDiscounts();
  }, []);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadProducts = async () => {
    try {
      const res = await axiosAuth.get(PRODUCT_API);
      if (res.data?.success) setProducts(res.data.data || []);
    } catch {
      notify("Failed to load products", "error");
    }
  };

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get(`${DISCOUNT_API}/my`);
      // 🔥 Frontend mein bhi null product filter — double safety
      const valid = (res.data?.data || []).filter((d) => d.product !== null);
      setDiscounts(valid);
    } catch {
      notify("Failed to load discounts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      product: form.product,
      minQty: Number(form.minQty),
      maxQty: form.maxQty ? Number(form.maxQty) : null,
      unitPrice: Number(form.unitPrice),
    };
    try {
      if (editingId) {
        await axiosAuth.put(`${DISCOUNT_API}/${editingId}`, payload);
        notify("Bulk discount updated successfully!");
      } else {
        await axiosAuth.post(`${DISCOUNT_API}/add`, payload);
        notify("Bulk discount added successfully!");
      }
      resetForm();
      loadDiscounts();
    } catch (err) {
      notify(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (d) => {
    setEditingId(d._id);
    setForm({
      product: d.product?._id || "",
      minQty: d.minQty,
      maxQty: d.maxQty ?? "",
      unitPrice: d.unitPrice,
    });
    setModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosAuth.delete(`${DISCOUNT_API}/${deleteId}`);
      notify("Discount deleted.");
      loadDiscounts();
    } catch {
      notify("Delete failed.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = discounts.filter((d) =>
    d.product?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedProduct = products.find((p) => p._id === form.product);

  // ── Stats (from actual valid discounts) ──
  const totalRules = discounts.length;
  const productsCovered = [
    ...new Set(discounts.map((d) => d.product?._id).filter(Boolean)),
  ].length;
  const lowestPrice =
    discounts.length > 0
      ? `₹${Math.min(...discounts.map((d) => d.unitPrice))}`
      : "—";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    :root {
      --bg:#f4f6fb; --white:#fff; --border:#e4e7ef; --border2:#cdd1de;
      --text:#0f172a; --textMid:#64748b; --textDim:#94a3b8;
      --blue:#2563eb; --blueFade:#eff6ff; --blueHov:#1d4ed8;
      --red:#ef4444; --redFade:#fef2f2;
      --green:#16a34a; --greenFade:#f0fdf4;
      --amber:#d97706; --amberFade:#fffbeb;
      --purple:#7c3aed; --purpleFade:#f5f3ff;
      --shadow:0 1px 3px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.04);
      --shadowMd:0 4px 16px rgba(0,0,0,0.09);
      --shadowLg:0 16px 48px rgba(0,0,0,0.16);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    .vbd{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);min-height:100vh;color:var(--text);}
    .vbd-topbar{background:var(--white);border-bottom:1px solid var(--border);height:58px;padding:0 28px;display:flex;align-items:center;position:sticky;top:0;z-index:50;}
    .vbd-brand{display:flex;align-items:center;gap:9px;}
    .vbd-brand-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:15px;}
    .vbd-brand-name{font-size:15px;font-weight:700;letter-spacing:-0.3px;}
    .vbd-brand-sep{width:1px;height:16px;background:var(--border);margin:0 10px;}
    .vbd-brand-page{font-size:13px;color:var(--textMid);}
    .vbd-body{padding:24px 28px 64px;max-width:1100px;}
    .vbd-page-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;}
    .vbd-page-head h1{font-size:20px;font-weight:700;letter-spacing:-0.4px;}
    .vbd-page-head p{font-size:13px;color:var(--textMid);margin-top:4px;}
    .vbd-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
    .vbd-stat{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px 18px;box-shadow:var(--shadow);display:flex;align-items:center;gap:14px;transition:box-shadow 0.2s;}
    .vbd-stat:hover{box-shadow:var(--shadowMd);}
    .vbd-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
    .vbd-stat-val{font-size:22px;font-weight:700;letter-spacing:-0.5px;line-height:1;}
    .vbd-stat-lbl{font-size:11.5px;color:var(--textMid);font-weight:500;margin-top:3px;}
    .vbd-card{background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden;}
    .vbd-toolbar{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    .vbd-toolbar-left{display:flex;align-items:center;gap:10px;flex:1;}
    .vbd-search-wrap{position:relative;}
    .vbd-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--textDim);font-size:14px;pointer-events:none;}
    .vbd-search{padding:8px 12px 8px 32px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);background:var(--bg);outline:none;width:240px;transition:border-color 0.2s,box-shadow 0.2s;}
    .vbd-search::placeholder{color:var(--textDim);}
    .vbd-search:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,0.1);background:var(--white);}
    .btn-primary{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--blue);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;white-space:nowrap;transition:background 0.2s,box-shadow 0.2s,transform 0.15s;}
    .btn-primary:hover:not(:disabled){background:var(--blueHov);box-shadow:0 4px 14px rgba(37,99,235,0.35);transform:translateY(-1px);}
    .btn-primary:disabled{opacity:0.55;cursor:not-allowed;}
    .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--textMid);font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all 0.2s;}
    .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--bg);}
    .btn-icon{width:32px;height:32px;border-radius:7px;border:1px solid var(--border);background:var(--white);color:var(--textMid);font-size:13px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;flex-shrink:0;}
    .btn-edit:hover{border-color:var(--blue);color:var(--blue);background:var(--blueFade);}
    .btn-del:hover{border-color:var(--red);color:var(--red);background:var(--redFade);}
    .vbd-table-wrap{overflow-x:auto;}
    .vbd-table{width:100%;border-collapse:collapse;min-width:600px;}
    .vbd-table thead tr{border-bottom:1px solid var(--border);background:#f8f9fc;}
    .vbd-table th{padding:10px 16px;text-align:left;white-space:nowrap;font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:var(--textMid);}
    .vbd-table th.r{text-align:right;}
    .vbd-table tbody tr{border-bottom:1px solid var(--border);transition:background 0.12s;}
    .vbd-table tbody tr:last-child{border-bottom:none;}
    .vbd-table tbody tr:hover{background:#f8faff;}
    .vbd-table td{padding:13px 16px;font-size:13px;vertical-align:middle;}
    .vbd-table td.r{text-align:right;}
    .vbd-prod-cell{display:flex;align-items:center;gap:10px;}
    .vbd-prod-thumb{width:38px;height:38px;border-radius:8px;object-fit:cover;border:1px solid var(--border);flex-shrink:0;}
    .vbd-prod-ph{width:38px;height:38px;border-radius:8px;border:1px solid var(--border);background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
    .vbd-prod-name{font-weight:600;font-size:13px;}
    .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;}
    .badge-blue{background:var(--blueFade);color:var(--blue);border:1px solid #bfdbfe;}
    .badge-green{background:var(--greenFade);color:var(--green);border:1px solid #bbf7d0;}
    .badge-amber{background:var(--amberFade);color:var(--amber);border:1px solid #fde68a;}
    .vbd-price{font-weight:700;font-size:14px;}
    .vbd-empty{padding:64px 20px;text-align:center;}
    .vbd-empty-icon{font-size:40px;opacity:0.22;margin-bottom:12px;}
    .vbd-empty-title{font-size:15px;font-weight:700;margin-bottom:5px;}
    .vbd-empty-sub{font-size:13px;color:var(--textMid);}
    .sh-row td{height:62px;padding:0 16px;}
    .shimmer{border-radius:6px;height:13px;background:linear-gradient(90deg,#f0f2f7 25%,#e4e7ef 50%,#f0f2f7 75%);background-size:300% 100%;animation:shim 1.5s ease infinite;}
    @keyframes shim{from{background-position:200% 0}to{background-position:-100% 0}}
    .vbd-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeO 0.22s ease;}
    @keyframes fadeO{from{opacity:0}to{opacity:1}}
    .vbd-modal-form{background:var(--white);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadowLg);width:100%;max-width:500px;animation:modalIn 0.28s cubic-bezier(0.22,1,0.36,1);overflow:hidden;}
    @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
    .vbd-mhead{padding:20px 24px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
    .vbd-mhead-info h2{font-size:15px;font-weight:700;letter-spacing:-0.2px;}
    .vbd-mhead-info p{font-size:12px;color:var(--textMid);margin-top:2px;}
    .vbd-mhead-ico{width:36px;height:36px;border-radius:9px;background:var(--purpleFade);display:flex;align-items:center;justify-content:center;font-size:17px;}
    .vbd-close{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--textMid);font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;}
    .vbd-close:hover{background:var(--redFade);border-color:var(--red);color:var(--red);}
    .vbd-mbody{padding:22px 24px;}
    .vbd-mfoot{padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;background:#fafbfd;}
    .vbd-field{margin-bottom:15px;}
    .vbd-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .vbd-lbl{display:block;font-size:12px;font-weight:600;color:var(--text);margin-bottom:6px;}
    .vbd-lbl-sub{font-weight:400;color:var(--textDim);font-size:11px;margin-left:3px;}
    .vbd-inp,.vbd-sel{width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);background:var(--white);outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
    .vbd-inp::placeholder{color:var(--textDim);font-weight:400;}
    .vbd-inp:focus,.vbd-sel:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,0.09);}
    .vbd-preview{margin-top:14px;padding:12px 14px;background:var(--purpleFade);border:1px solid #ddd6fe;border-radius:9px;font-size:12.5px;color:var(--purple);font-weight:500;display:flex;align-items:center;gap:8px;}
    .vbd-del-bg{position:fixed;inset:0;background:rgba(15,23,42,0.52);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeO 0.2s ease;}
    .vbd-del-modal{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:28px;width:360px;box-shadow:var(--shadowLg);animation:popIn 0.22s cubic-bezier(0.22,1,0.36,1);}
    @keyframes popIn{from{opacity:0;transform:scale(0.93) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    .vbd-del-ico{width:44px;height:44px;background:var(--redFade);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px;}
    .vbd-del-modal h3{font-size:16px;font-weight:700;margin-bottom:8px;}
    .vbd-del-modal p{font-size:13px;color:var(--textMid);line-height:1.65;margin-bottom:22px;}
    .vbd-del-row{display:flex;gap:10px;}
    .btn-danger{flex:1;padding:10px;background:var(--red);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:opacity 0.2s;}
    .btn-danger:hover{opacity:0.86;}
    .vbd-toast{position:fixed;bottom:22px;right:22px;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:9px;z-index:999;white-space:nowrap;animation:toastUp 0.28s cubic-bezier(0.22,1,0.36,1);box-shadow:0 8px 28px rgba(0,0,0,0.14);}
    @keyframes toastUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .vbd-toast.success{background:#052e16;color:#86efac;border:1px solid #166534;}
    .vbd-toast.error{background:#450a0a;color:#fca5a5;border:1px solid #991b1b;}
    .toast-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
    .vbd-toast.success .toast-dot{background:#22c55e;}
    .vbd-toast.error .toast-dot{background:var(--red);}
    .fade-up{animation:fadeUp 0.4s ease both;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:768px){
      .vbd-stats{grid-template-columns:1fr 1fr;}
      .vbd-body{padding:16px 14px 60px;}
      .vbd-topbar{padding:0 14px;}
      .vbd-search{width:160px;}
      .vbd-row2{grid-template-columns:1fr;}
      .vbd-overlay{padding:12px;}
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="vbd">
        {/* Topbar */}
        <div className="vbd-topbar">
          <div className="vbd-brand">
            <div className="vbd-brand-icon">🏪</div>
            <span className="vbd-brand-name">Seller Panel</span>
            <div className="vbd-brand-sep" />
            <span className="vbd-brand-page">Bulk Discounts</span>
          </div>
        </div>

        <div className="vbd-body">
          {/* Page Header */}
          <div className="vbd-page-head fade-up">
            <div>
              <h1>Bulk Discounts</h1>
              <p>Set quantity-based pricing for your products</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                resetForm();
                setModal(true);
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 300 }}>＋</span> Add
              Discount
            </button>
          </div>

          {/* Stats — 🔥 actual valid discounts se */}
          <div
            className="vbd-stats fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            {[
              {
                icon: "🏷️",
                bg: "#f5f3ff",
                val: totalRules,
                lbl: "Total Rules",
              },
              {
                icon: "📦",
                bg: "#eff6ff",
                val: productsCovered,
                lbl: "Products Covered",
              },
              {
                icon: "💰",
                bg: "#f0fdf4",
                val: lowestPrice,
                lbl: "Lowest Unit Price",
              },
            ].map((s, i) => (
              <div className="vbd-stat" key={i}>
                <div className="vbd-stat-icon" style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <div>
                  <div className="vbd-stat-val">{s.val}</div>
                  <div className="vbd-stat-lbl">{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div className="vbd-card fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="vbd-toolbar">
              <div className="vbd-toolbar-left">
                <div className="vbd-search-wrap">
                  <span className="vbd-search-ico">⌕</span>
                  <input
                    className="vbd-search"
                    placeholder="Search by product…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {search && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--textMid)",
                      fontWeight: 500,
                    }}
                  >
                    {filtered.length} results
                  </span>
                )}
              </div>
            </div>

            <div className="vbd-table-wrap">
              <table className="vbd-table">
                <thead>
                  <tr>
                    <th style={{ width: 42 }}>#</th>
                    <th>Product</th>
                    <th>Min Qty</th>
                    <th>Max Qty</th>
                    <th>Unit Price</th>
                    <th className="r">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr className="sh-row" key={i}>
                        <td>
                          <div className="shimmer" style={{ width: 22 }} />
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                            }}
                          >
                            <div
                              className="shimmer"
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 8,
                                flexShrink: 0,
                              }}
                            />
                            <div className="shimmer" style={{ width: 120 }} />
                          </div>
                        </td>
                        <td>
                          <div className="shimmer" style={{ width: 50 }} />
                        </td>
                        <td>
                          <div className="shimmer" style={{ width: 50 }} />
                        </td>
                        <td>
                          <div className="shimmer" style={{ width: 60 }} />
                        </td>
                        <td>
                          <div
                            className="shimmer"
                            style={{ width: 64, marginLeft: "auto" }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="vbd-empty">
                          <div className="vbd-empty-icon">🏷️</div>
                          <div className="vbd-empty-title">
                            {search
                              ? "No discounts found"
                              : "No bulk discounts yet"}
                          </div>
                          <div className="vbd-empty-sub">
                            {search
                              ? `No results for "${search}"`
                              : "Click 'Add Discount' to create your first rule"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d, i) => (
                      <tr key={d._id}>
                        <td style={{ color: "var(--textDim)", fontSize: 12 }}>
                          {i + 1}
                        </td>
                        <td>
                          <div className="vbd-prod-cell">
                            {d.product?.image ? (
                              <img
                                className="vbd-prod-thumb"
                                src={d.product.image}
                                alt={d.product.name}
                              />
                            ) : (
                              <div className="vbd-prod-ph">📦</div>
                            )}
                            <span className="vbd-prod-name">
                              {d.product?.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-blue">
                            ≥ {d.minQty} units
                          </span>
                        </td>
                        <td>
                          {d.maxQty ? (
                            <span className="badge badge-amber">
                              ≤ {d.maxQty} units
                            </span>
                          ) : (
                            <span className="badge badge-green">No limit</span>
                          )}
                        </td>
                        <td>
                          <span className="vbd-price">₹{d.unitPrice}</span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--textDim)",
                              marginLeft: 4,
                            }}
                          >
                            / unit
                          </span>
                        </td>
                        <td className="r">
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              className="btn-icon btn-edit"
                              onClick={() => handleEdit(d)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon btn-del"
                              onClick={() => setDeleteId(d._id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      {modal && (
        <div className="vbd-overlay" onClick={resetForm}>
          <div className="vbd-modal-form" onClick={(e) => e.stopPropagation()}>
            <div className="vbd-mhead">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="vbd-mhead-ico">🏷️</div>
                <div className="vbd-mhead-info">
                  <h2>
                    {editingId ? "Edit Bulk Discount" : "Add Bulk Discount"}
                  </h2>
                  <p>
                    {editingId
                      ? "Update the discount rule"
                      : "Set quantity-based unit pricing"}
                  </p>
                </div>
              </div>
              <button className="vbd-close" onClick={resetForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="vbd-mbody">
                {/* Product */}
                <div className="vbd-field">
                  <label className="vbd-lbl">
                    Product <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <select
                    className="vbd-sel"
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    required
                    disabled={!!editingId} // edit mode mein product change nahi hoga
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min + Max Qty */}
                <div className="vbd-row2">
                  <div className="vbd-field">
                    <label className="vbd-lbl">
                      Min Quantity{" "}
                      <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      className="vbd-inp"
                      name="minQty"
                      type="number"
                      placeholder="e.g. 10"
                      value={form.minQty}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="vbd-field">
                    <label className="vbd-lbl">
                      Max Quantity{" "}
                      <span className="vbd-lbl-sub">(optional)</span>
                    </label>
                    <input
                      className="vbd-inp"
                      name="maxQty"
                      type="number"
                      placeholder="Leave blank = no limit"
                      value={form.maxQty}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                </div>

                {/* Unit Price */}
                <div className="vbd-field">
                  <label className="vbd-lbl">
                    Unit Price (₹){" "}
                    <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    className="vbd-inp"
                    name="unitPrice"
                    type="number"
                    placeholder="Price per unit at this quantity"
                    value={form.unitPrice}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                {/* Live Preview */}
                {form.product && form.minQty && form.unitPrice && (
                  <div className="vbd-preview">
                    <span>📊</span>
                    <span>
                      Buy{" "}
                      <strong>
                        {form.minQty}
                        {form.maxQty ? `–${form.maxQty}` : "+"}
                      </strong>{" "}
                      units of{" "}
                      <strong>
                        {selectedProduct?.name || "selected product"}
                      </strong>{" "}
                      @ <strong>₹{form.unitPrice}</strong> per unit
                    </span>
                  </div>
                )}
              </div>

              <div className="vbd-mfoot">
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update Discount"
                      : "Add Discount"}
                </button>
                <button type="button" className="btn-ghost" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="vbd-del-bg">
          <div className="vbd-del-modal">
            <div className="vbd-del-ico">🗑️</div>
            <h3>Delete this rule?</h3>
            <p>
              This bulk discount rule will be permanently removed. This action
              cannot be undone.
            </p>
            <div className="vbd-del-row">
              <button className="btn-danger" onClick={handleDelete}>
                Yes, Delete
              </button>
              <button
                className="btn-ghost"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`vbd-toast ${toast.type}`}>
          <div className="toast-dot" />
          {toast.msg}
        </div>
      )}
    </>
  );
}
