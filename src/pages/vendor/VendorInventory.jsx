
import React, { useEffect, useState } from "react";
import axios from "axios";

const INVENTORY_API = "https://foodhelpervendor.onrender.com/api/vendor/inventory";
const PRODUCT_API = "https://foodhelpervendor.onrender.com/api/vendor/products";

const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const INITIAL_FORM = { productId: "", totalStock: "", minStock: 5 };

export default function VendorInventory() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* ─────────────── FETCH ─────────────── */
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get(INVENTORY_API);
      if (res.data?.success) {
        // ✅ FIX: null/undefined product wale items filter karo
        const validItems = res.data.data.filter((x) => x.product && x.product._id);
        setItems(validItems);
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosAuth.get(PRODUCT_API);
      if (res.data?.success) setProducts(res.data.data);
    } catch {
      showError("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  /* ─────────────── HELPERS ─────────────── */
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditId(null);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ─────────────── CREATE ─────────────── */
  const handleCreate = async () => {
    if (!form.productId || form.totalStock === "") {
      showError("Product and Total Stock are required.");
      return;
    }
    try {
      setSubmitLoading(true);
      const res = await axiosAuth.post(INVENTORY_API, {
        productId: form.productId,
        totalStock: Number(form.totalStock),
        minStock: Number(form.minStock),
      });
      if (res.data?.success) {
        showSuccess("Inventory added successfully!");
        fetchInventory();
        resetForm();
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to add inventory");
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ─────────────── UPDATE ─────────────── */
  const handleUpdate = async () => {
    if (form.totalStock === "") {
      showError("Total Stock is required.");
      return;
    }
    try {
      setSubmitLoading(true);
      const res = await axiosAuth.put(`${INVENTORY_API}/${editId}`, {
        totalStock: Number(form.totalStock),
        minStock: Number(form.minStock),
      });
      if (res.data?.success) {
        showSuccess("Inventory updated successfully!");
        fetchInventory();
        resetForm();
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to update inventory");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) handleUpdate();
    else handleCreate();
  };

  /* ─────────────── SET EDIT ─────────────── */
  const handleEdit = (inv) => {
    setForm({
      productId: inv.product?._id || "",
      totalStock: inv.totalStock,
      minStock: inv.minStock,
    });
    setEditId(inv._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─────────────── DELETE ─────────────── */
  const handleDeleteConfirm = (id) => setConfirmDelete(id);

  const handleDelete = async () => {
    const id = confirmDelete;
    setConfirmDelete(null);
    try {
      setDeleteLoading(id);
      const res = await axiosAuth.delete(`${INVENTORY_API}/${id}`);
      if (res.data?.success) {
        showSuccess("Inventory deleted.");
        setItems((prev) => prev.filter((x) => x._id !== id));
        if (editId === id) resetForm();
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ─────────────── RESTOCK ─────────────── */
  const handleRestock = async (inv) => {
    const qty = prompt(
      `Add stock for "${inv.product?.name}":\nCurrent: ${inv.availableStock}`
    );
    if (qty === null || qty === "") return;
    const num = Number(qty);
    if (isNaN(num) || num <= 0) {
      showError("Enter a valid positive number.");
      return;
    }
    try {
      setDeleteLoading(inv._id);
      const res = await axiosAuth.patch(`${INVENTORY_API}/${inv._id}/restock`, {
        quantity: num,
      });
      if (res.data?.success) {
        showSuccess(`+${num} stock added to "${inv.product?.name}"`);
        fetchInventory();
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Restock failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ─────────────── FILTER ─────────────── */
  // ✅ FIX: items already valid hain (fetchInventory mein filter ho chuke), search bhi safe
  const filtered = items.filter((x) =>
    x.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ FIX: stats ab valid items pe based hain
  const lowStockCount = items.filter(
    (x) => !x.outOfStock && x.availableStock <= x.minStock
  ).length;
  const outOfStockCount = items.filter((x) => x.outOfStock).length;

  /* ─────────────── RENDER ─────────────── */
  return (
    <div style={styles.page}>
      {/* ── TOAST ── */}
      {error && <div style={styles.toastError}>{error}</div>}
      {success && <div style={styles.toastSuccess}>{success}</div>}

      {/* ── DELETE CONFIRM MODAL ── */}
      {confirmDelete && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p>
              Are you sure you want to delete this inventory record? This action
              cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                style={styles.btnSecondary}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button style={styles.btnDanger} onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.heading}>Inventory Management</div>

      {/* ── STAT CARDS ── */}
      <div style={styles.statsRow}>
        {/* ✅ FIX: items.length ab sirf valid items count karta hai */}
        <StatCard label="Total Products" value={items.length} color="#2563eb" />
        <StatCard label="Low Stock" value={lowStockCount} color="#f59e0b" />
        <StatCard label="Out of Stock" value={outOfStockCount} color="#ef4444" />
      </div>

      {/* ── FORM ── */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div
          style={{
            marginTop: 0,
            marginBottom: 16,
            color: "#1e293b",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {editId ? "Update Stock" : "Add Stock"}
        </div>

        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Product *</label>
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              disabled={!!editId}
              required
              style={styles.inp}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Total Stock *</label>
            <input
              type="number"
              name="totalStock"
              placeholder="e.g. 100"
              value={form.totalStock}
              onChange={handleChange}
              min="0"
              required
              style={styles.inp}
            />
          </div>

          <div>
            <label style={styles.label}>Min Stock Alert</label>
            <input
              type="number"
              name="minStock"
              placeholder="e.g. 5"
              value={form.minStock}
              onChange={handleChange}
              min="0"
              style={styles.inp}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button type="submit" style={styles.btn} disabled={submitLoading}>
            {submitLoading ? "Saving..." : editId ? "Update Stock" : "Add Stock"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} style={styles.btnSecondary}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ── SEARCH ── */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Search by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...styles.inp, maxWidth: 320 }}
        />
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading inventory...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No inventory records found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Available</th>
                <th style={styles.th}>Min Alert</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x, i) => (
                <tr key={x._id} style={styles.tr}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 500 }}>
                    {x.product?.name}
                  </td>
                  <td style={styles.td}>{x.totalStock}</td>
                  <td style={styles.td}>{x.availableStock}</td>
                  <td style={styles.td}>{x.minStock}</td>
                  <td style={styles.td}>
                    <StatusBadge item={x} />
                  </td>
                  <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => handleEdit(x)}
                      style={styles.btnEdit}
                      disabled={deleteLoading === x._id}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRestock(x)}
                      style={styles.btnRestock}
                      disabled={deleteLoading === x._id}
                    >
                      +Stock
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(x._id)}
                      style={styles.btnDelete}
                      disabled={deleteLoading === x._id}
                    >
                      {deleteLoading === x._id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────── SUB COMPONENTS ─────────────── */
function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 24, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{label}</div>
    </div>
  );
}

function StatusBadge({ item }) {
  if (item.outOfStock)
    return (
      <span style={{ ...styles.badge, background: "#fee2e2", color: "#dc2626" }}>
        Out of Stock
      </span>
    );
  if (item.availableStock <= item.minStock)
    return (
      <span style={{ ...styles.badge, background: "#fef3c7", color: "#d97706" }}>
        Low Stock
      </span>
    );
  return (
    <span style={{ ...styles.badge, background: "#dcfce7", color: "#16a34a" }}>
      In Stock
    </span>
  );
}

/* ─────────────── STYLES ─────────────── */
const styles = {
  page: {
    fontFamily: "'Segoe UI', sans-serif",
    padding: "24px",
    maxWidth: 1000,
    margin: "0 auto",
    color: "#1e293b",
    background: "#ffffff",
    minHeight: "100vh",
  },
  heading: { fontSize: 20, fontWeight: 600, marginBottom: 20, color: "#1e293b" },
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statCard: {
    flex: "0 0 auto",
    width: 170,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "14px 18px",
    boxShadow: "none",
  },
  form: {
    background: "#fff",
    padding: "20px 24px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    marginBottom: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: "#374151",
  },
  inp: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
  },
  btn: {
    padding: "10px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  btnSecondary: {
    padding: "10px 20px",
    background: "#f1f5f9",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  btnEdit: {
    padding: "5px 10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    marginRight: 6,
  },
  btnRestock: {
    padding: "5px 10px",
    background: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    marginRight: 6,
  },
  btnDelete: {
    padding: "5px 10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  btnDanger: {
    padding: "9px 20px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  thead: { background: "#ffffff" },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: { transition: "background 0.15s" },
  td: {
    padding: "12px 14px",
    fontSize: 14,
    borderBottom: "1px solid #f1f5f9",
    color: "#374151",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    padding: "28px 32px",
    maxWidth: 420,
    width: "90%",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },
  toastError: {
    position: "fixed",
    top: 20,
    right: 20,
    background: "#ef4444",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 8,
    zIndex: 1000,
    fontWeight: 500,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  toastSuccess: {
    position: "fixed",
    top: 20,
    right: 20,
    background: "#16a34a",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 8,
    zIndex: 1000,
    fontWeight: 500,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
};