// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   Search,
//   MoreHorizontal,
//   Edit,
//   Trash2,
//   ChevronDown,
//   ChevronUp,
//   Plus,
//   X,
//   Image as ImageIcon,
// } from "react-feather";

// const API_BASE = "https://foodhelpervendor.onrender.com/api/vendor/categories";

// const api = axios.create({ baseURL: API_BASE });
// api.interceptors.request.use((req) => {
//   const token = localStorage.getItem("vendorToken");
//   if (token) req.headers.Authorization = `Bearer ${token}`;
//   return req;
// });

// const emptyCategory = { name: "", image: null };
// const emptySub = { name: "", image: null };

// export default function VendorCategoryManager() {
//   const [categories, setCategories] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [expandedCat, setExpandedCat] = useState(null);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [catForm, setCatForm] = useState(emptyCategory);
//   const [subForm, setSubForm] = useState(emptySub);
//   const [inlineSub, setInlineSub] = useState({});
//   const [editInfo, setEditInfo] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [preview, setPreview] = useState(null);

//   const fetchCategories = async () => {
//     try {
//       const res = await api.get("/");
//       const safe = (res.data.categories || []).map((c) => ({
//         ...c,
//         subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
//       }));
//       setCategories(safe);
//     } catch {
//       toast.error("Failed to load categories");
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const filtered = categories.filter((c) => {
//     const q = searchText.toLowerCase();
//     return (
//       c.name.toLowerCase().includes(q) ||
//       c.subcategories.some((s) => s.name.toLowerCase().includes(q))
//     );
//   });

//   const createOrUpdateCategory = async (e) => {
//     e.preventDefault();
//     if (!catForm.name.trim()) return toast.warn("Enter category name");
//     const fd = new FormData();
//     fd.append("name", catForm.name);
//     if (catForm.image) fd.append("image", catForm.image);
//     try {
//       if (editInfo?.type === "category") {
//         await api.put(`/${editInfo.catId}`, fd);
//         toast.success("Category updated — sent for re-approval");
//       } else {
//         await api.post("/", fd);
//         toast.success("Category sent for admin approval ⏳");
//       }
//       closeModal();
//       fetchCategories();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Category save failed");
//     }
//   };

//   const deleteCategory = async (id) => {
//     if (!window.confirm("Delete this category?")) return;
//     try {
//       await api.delete(`/${id}`);
//       toast.success("Category deleted");
//       fetchCategories();
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   const createSubcategory = async (e, catId) => {
//     e.preventDefault();
//     const data = inlineSub[catId];
//     if (!data?.name?.trim()) return toast.warn("Enter subcategory name");
//     const fd = new FormData();
//     fd.append("name", data.name);
//     if (data.image) fd.append("image", data.image);
//     try {
//       await api.post(`/${catId}/sub`, fd);
//       toast.success("Subcategory added");
//       setInlineSub((p) => ({ ...p, [catId]: emptySub }));
//       fetchCategories();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Approval required");
//     }
//   };

//   const updateSubcategory = async (e) => {
//     e.preventDefault();
//     if (!subForm.name.trim()) return toast.warn("Enter subcategory name");
//     const fd = new FormData();
//     fd.append("name", subForm.name);
//     if (subForm.image) fd.append("image", subForm.image);
//     try {
//       await api.put(`/${editInfo.catId}/sub/${editInfo.subId}`, fd);
//       toast.success("Subcategory updated");
//       closeModal();
//       fetchCategories();
//     } catch {
//       toast.error("Update failed");
//     }
//   };

//   const deleteSubcategory = async (catId, subId) => {
//     if (!window.confirm("Delete subcategory?")) return;
//     try {
//       await api.delete(`/${catId}/sub/${subId}`);
//       toast.success("Subcategory deleted");
//       fetchCategories();
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   const openAddCategory = () => {
//     setEditInfo(null);
//     setCatForm(emptyCategory);
//     setPreview(null);
//     setModalOpen(true);
//   };

//   const openEditCategory = (cat) => {
//     setEditInfo({ type: "category", catId: cat._id });
//     setCatForm({ name: cat.name, image: null });
//     setPreview(cat.image);
//     setModalOpen(true);
//     setOpenMenuId(null);
//   };

//   const openEditSub = (catId, sub) => {
//     setEditInfo({ type: "sub", catId, subId: sub._id });
//     setSubForm({ name: sub.name, image: null });
//     setPreview(sub.image);
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setEditInfo(null);
//     setCatForm(emptyCategory);
//     setSubForm(emptySub);
//     setPreview(null);
//   };

//   const styles = {
//     wrapper: { padding: 24, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" },
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
//     btnAdd: { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
//     searchWrap: { display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", marginBottom: 16 },
//     searchInput: { border: "none", outline: "none", width: "100%", fontSize: 14 },
//     table: { width: "100%", borderCollapse: "collapse", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" },
//     th: { padding: "12px 16px", background: "#f9fafb", textAlign: "left", fontSize: 13, borderBottom: "1px solid #e5e7eb", fontWeight: 600 },
//     td: { padding: "12px 16px", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" },
//     catImg: { width: 40, height: 40, objectFit: "cover", borderRadius: 6, marginRight: 10 },
//     statusBadge: (status) => ({
//       fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
//       color: status === "approved" ? "#16a34a" : status === "rejected" ? "#dc2626" : "#d97706",
//       background: status === "approved" ? "#f0fdf4" : status === "rejected" ? "#fef2f2" : "#fffbeb",
//     }),
//     expandBtn: { display: "flex", alignItems: "center", gap: 4, background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 },
//     menuWrap: { position: "relative", display: "inline-block" },
//     dropdown: { position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 130, overflow: "hidden" },
//     dropBtn: (red) => ({ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", width: "100%", border: "none", background: "#fff", cursor: "pointer", fontSize: 13, color: red ? "#dc2626" : "#374151" }),
//     subRow: { background: "#f9fafb" },
//     subItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fff", border: "1px solid #f3f4f6", borderRadius: 8, marginBottom: 6 },
//     subInfo: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 },
//     subImg: { width: 32, height: 32, objectFit: "cover", borderRadius: 4 },
//     subActions: { display: "flex", gap: 8, color: "#6b7280", cursor: "pointer" },
//     addSubForm: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" },
//     addSubInput: { flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, minWidth: 120 },
//     addSubBtn: { padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
//     overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
//     modal: { background: "#fff", borderRadius: 12, padding: 24, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
//     modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
//     modalTitle: { margin: 0, fontSize: 18, fontWeight: 700 },
//     modalInput: { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: "border-box" },
//     previewImg: { width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginBottom: 12 },
//     saveBtn: { width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
//   };

//   return (
//     <div style={styles.wrapper}>
//       <ToastContainer position="top-right" />

//       <div style={styles.header}>
//         <h2 style={{ margin: 0 }}>Categories</h2>
//         <button style={styles.btnAdd} onClick={openAddCategory}>
//           <Plus size={14} /> Add Category
//         </button>
//       </div>

//       <div style={styles.searchWrap}>
//         <Search size={16} color="#9ca3af" />
//         <input
//           style={styles.searchInput}
//           placeholder="Search category or sub..."
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//         />
//       </div>

//       <table style={styles.table}>
//         <thead>
//           <tr>
//             <th style={styles.th}>#</th>
//             <th style={styles.th}>Category</th>
//             <th style={styles.th}>Subcategories</th>
//             <th style={styles.th}>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filtered.length === 0 && (
//             <tr>
//               <td colSpan={4} style={{ ...styles.td, textAlign: "center", color: "#9ca3af", padding: 40 }}>
//                 No categories found
//               </td>
//             </tr>
//           )}
//           {filtered.map((cat, i) => (
//             <React.Fragment key={cat._id}>
//               <tr>
//                 <td style={styles.td}>{i + 1}</td>
//                 <td style={styles.td}>
//                   <div style={{ display: "flex", alignItems: "center" }}>
//                     {cat.image
//                       ? <img src={cat.image} alt="" style={styles.catImg} />
//                       : <ImageIcon size={36} style={{ marginRight: 10, color: "#d1d5db" }} />
//                     }
//                     <div>
//                       <strong>{cat.name}</strong>
//                       <div>
//                         <span style={styles.statusBadge(cat.status)}>
//                           {cat.status === "pending" && "⏳ Pending Approval"}
//                           {cat.status === "approved" && "✅ Approved"}
//                           {cat.status === "rejected" && "❌ Rejected"}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </td>
//                 <td style={styles.td}>
//                   <button
//                     style={styles.expandBtn}
//                     onClick={() => setExpandedCat(expandedCat === cat._id ? null : cat._id)}
//                   >
//                     {cat.subcategories.length} subs
//                     {expandedCat === cat._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                   </button>
//                 </td>
//                 <td style={styles.td}>
//                   <div style={styles.menuWrap}>
//                     <MoreHorizontal
//                       style={{ cursor: "pointer", color: "#6b7280" }}
//                       onClick={() => setOpenMenuId(openMenuId === cat._id ? null : cat._id)}
//                     />
//                     {openMenuId === cat._id && (
//                       <div style={styles.dropdown}>
//                         <button style={styles.dropBtn(false)} onClick={() => openEditCategory(cat)}>
//                           <Edit size={13} /> Edit
//                         </button>
//                         <button style={styles.dropBtn(true)} onClick={() => deleteCategory(cat._id)}>
//                           <Trash2 size={13} /> Delete
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </td>
//               </tr>

//               {expandedCat === cat._id && (
//                 <tr style={styles.subRow}>
//                   <td colSpan={4} style={{ ...styles.td, paddingLeft: 32 }}>
//                     {cat.subcategories.length === 0 && (
//                       <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 8px" }}>No subcategories yet</p>
//                     )}
//                     {cat.subcategories.map((s) => (
//                       <div key={s._id} style={styles.subItem}>
//                         <div style={styles.subInfo}>
//                           {s.image
//                             ? <img src={s.image} alt="" style={styles.subImg} />
//                             : <ImageIcon size={24} color="#d1d5db" />
//                           }
//                           {s.name}
//                         </div>
//                         <div style={styles.subActions}>
//                           <Edit size={15} onClick={() => openEditSub(cat._id, s)} />
//                           <Trash2 size={15} onClick={() => deleteSubcategory(cat._id, s._id)} />
//                         </div>
//                       </div>
//                     ))}

//                     {cat.status !== "approved" ? (
//                       <p style={{ color: "#d97706", fontSize: 12, marginTop: 8 }}>
//                         ⚠️ Admin approval required to add subcategories
//                       </p>
//                     ) : (
//                       <form style={styles.addSubForm} onSubmit={(e) => createSubcategory(e, cat._id)}>
//                         <input
//                           style={styles.addSubInput}
//                           placeholder="New subcategory name..."
//                           value={inlineSub[cat._id]?.name || ""}
//                           onChange={(e) =>
//                             setInlineSub({ ...inlineSub, [cat._id]: { ...inlineSub[cat._id], name: e.target.value } })
//                           }
//                         />
//                         <input
//                           type="file"
//                           accept="image/*"
//                           style={{ fontSize: 12 }}
//                           onChange={(e) =>
//                             setInlineSub({ ...inlineSub, [cat._id]: { ...inlineSub[cat._id], image: e.target.files[0] } })
//                           }
//                         />
//                         <button style={styles.addSubBtn} type="submit">+ Add</button>
//                       </form>
//                     )}
//                   </td>
//                 </tr>
//               )}
//             </React.Fragment>
//           ))}
//         </tbody>
//       </table>

//       {modalOpen && (
//         <div style={styles.overlay} onClick={closeModal}>
//           <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <div style={styles.modalHeader}>
//               <h3 style={styles.modalTitle}>
//                 {editInfo?.type === "sub" ? "Edit Subcategory" : editInfo?.type === "category" ? "Edit Category" : "New Category"}
//               </h3>
//               <X size={20} style={{ cursor: "pointer", color: "#6b7280" }} onClick={closeModal} />
//             </div>

//             <form onSubmit={editInfo?.type === "sub" ? updateSubcategory : createOrUpdateCategory}>
//               <input
//                 style={styles.modalInput}
//                 placeholder="Name"
//                 value={editInfo?.type === "sub" ? subForm.name : catForm.name}
//                 onChange={(e) =>
//                   editInfo?.type === "sub"
//                     ? setSubForm({ ...subForm, name: e.target.value })
//                     : setCatForm({ ...catForm, name: e.target.value })
//                 }
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 style={{ ...styles.modalInput, padding: "6px" }}
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (!file) return;
//                   setPreview(URL.createObjectURL(file));
//                   editInfo?.type === "sub"
//                     ? setSubForm({ ...subForm, image: file })
//                     : setCatForm({ ...catForm, image: file });
//                 }}
//               />
//               {preview && <img src={preview} alt="preview" style={styles.previewImg} />}
//               <button type="submit" style={styles.saveBtn}>Save</button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search, MoreHorizontal, Edit, Trash2,
  ChevronDown, ChevronUp, Plus, X,
  Image as ImageIcon, Package, Tag,
  Layers, ShoppingBag, AlertCircle,
} from "react-feather";


const API_BASE = "https://foodhelpervendor.onrender.com/api/vendor/categories";
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("vendorToken");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});


function Thumb({ src, size = 36 }) {
  if (src)
    return (
      <img
        src={src}
        alt=""
        style={{ width: size, height: size, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", flexShrink: 0 }}
      />
    );
  return <ImageIcon size={size - 8} color="#cbd5e1" style={{ flexShrink: 0 }} />;
}

function Badge({ status }) {
  const cfg = {
    approved: { bg: "#f0fdf4", color: "#16a34a", text: "✅ Approved" },
    rejected: { bg: "#fef2f2", color: "#dc2626", text: "❌ Rejected" },
    pending:  { bg: "#fffbeb", color: "#d97706", text: "⏳ Pending" },
  };
  const s = cfg[status] || cfg.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {s.text}
    </span>
  );
}

/* ── Generic Modal ── */
function Modal({ title, open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 16, padding: 24, width: 430, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.22)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8" }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Generic form used in all modals ── */
const inp = { padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none", color: "#0f172a" };
const saveBtn = { width: "100%", padding: 11, background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 };

function ItemForm({ form, setForm, onSubmit, isProduct = false, preview, setPreview, label = "Save" }) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input required placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inp} />

      {isProduct && (
        <>
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            rows={2}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...inp, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input required type="number" placeholder="Price ₹ *" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ ...inp, flex: 1 }} />
            <input type="number" placeholder="Discount ₹" min="0" step="0.01" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} style={{ ...inp, flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" placeholder="Stock" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ ...inp, flex: 1 }} />
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={{ ...inp, flex: 1 }}>
              {["piece", "kg", "g", "liter", "ml", "dozen", "pack", "box"].map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </>
      )}

      <label style={{ ...inp, cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
        <ImageIcon size={14} /> {preview ? "Change Image" : "Upload Image (optional)"}
        <input type="file" accept="image/*" hidden onChange={(e) => {
          const f = e.target.files[0];
          if (!f) return;
          setPreview(URL.createObjectURL(f));
          setForm({ ...form, image: f });
        }} />
      </label>
      {preview && <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 10, border: "1px solid #e2e8f0" }} />}
      <button type="submit" style={saveBtn}>{label}</button>
    </form>
  );
}

/* ============================================================
   LEVEL 4 — PRODUCT CARD
   ============================================================ */
function ProductCard({ product, catId, subId, subsubId, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: product.name, description: product.description || "", price: product.price, discountPrice: product.discountPrice || "", stock: product.stock, unit: product.unit, image: null });
  const [preview, setPreview] = useState(product.image);

  const del = async () => {
    if (!window.confirm("Delete product?")) return;
    try { await api.delete(`/${catId}/sub/${subId}/subsub/${subsubId}/products/${product._id}`); toast.success("Product deleted"); onRefresh(); }
    catch { toast.error("Delete failed"); }
  };

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== "") fd.append(k, v); });
    try { await api.put(`/${catId}/sub/${subId}/subsub/${subsubId}/products/${product._id}`, fd); toast.success("Product updated"); setEditing(false); onRefresh(); }
    catch { toast.error("Update failed"); }
  };

  return (
    <>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow .2s" }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
      >
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: "100%", height: 110, objectFit: "cover" }} />
          : <div style={{ height: 70, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}><ShoppingBag size={26} color="#cbd5e1" /></div>
        }
        <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <strong style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.3 }}>{product.name}</strong>
          {product.description && <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>{product.description.slice(0, 50)}{product.description.length > 50 ? "…" : ""}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ fontWeight: 700, color: "#2563eb", fontSize: 13 }}>₹{product.price}</span>
            {product.discountPrice && <span style={{ fontSize: 11, textDecoration: "line-through", color: "#94a3b8" }}>₹{product.discountPrice}</span>}
          </div>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Stock: {product.stock} {product.unit}</span>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button onClick={() => setEditing(true)} style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "#374151" }}>
              <Edit size={11} /> Edit
            </button>
            <button onClick={del} style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "1px solid #fecaca", background: "#fff5f5", cursor: "pointer", fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Trash2 size={11} /> Del
            </button>
          </div>
        </div>
      </div>
      <Modal title="Edit Product" open={editing} onClose={() => setEditing(false)}>
        <ItemForm form={form} setForm={setForm} onSubmit={save} isProduct preview={preview} setPreview={setPreview} label="Update Product" />
      </Modal>
    </>
  );
}

/* ============================================================
   LEVEL 3 — SUB-SUBCATEGORY PANEL
   ============================================================ */
function SubSubPanel({ catId, subId, ss, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState(ss.products || []);
  const [addingProduct, setAddingProduct] = useState(false);
  const [pForm, setPForm] = useState({ name: "", description: "", price: "", discountPrice: "", stock: "", unit: "piece", image: null });
  const [pPreview, setPPreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [eForm, setEForm] = useState({ name: ss.name, image: null });
  const [ePreview, setEPreview] = useState(ss.image);

  const loadProducts = async () => {
    try { const r = await api.get(`/${catId}/sub/${subId}/subsub/${ss._id}/products`); setProducts(r.data.products || []); }
    catch { }
  };

  useEffect(() => { if (open) loadProducts(); }, [open]);

  const addProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(pForm).forEach(([k, v]) => { if (v !== null && v !== "") fd.append(k, v); });
    try {
      await api.post(`/${catId}/sub/${subId}/subsub/${ss._id}/products`, fd);
      toast.success("Product added!");
      setPForm({ name: "", description: "", price: "", discountPrice: "", stock: "", unit: "piece", image: null });
      setPPreview(null);
      setAddingProduct(false);
      loadProducts();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add product"); }
  };

  const delSS = async () => {
    if (!window.confirm("Delete this sub-subcategory and all products inside?")) return;
    try { await api.delete(`/${catId}/sub/${subId}/subsub/${ss._id}`); toast.success("Deleted"); onRefresh(); }
    catch { toast.error("Delete failed"); }
  };

  const updateSS = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", eForm.name);
    if (eForm.image) fd.append("image", eForm.image);
    try { await api.put(`/${catId}/sub/${subId}/subsub/${ss._id}`, fd); toast.success("Updated"); setEditing(false); onRefresh(); }
    catch { toast.error("Update failed"); }
  };

  return (
    <div style={{ border: "1px solid #dbeafe", borderRadius: 10, marginBottom: 8, background: open ? "#eff6ff" : "#f8fbff" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Package size={13} color="#3b82f6" />
          <Thumb src={ss.image} size={28} />
          <span style={{ fontWeight: 600, fontSize: 13, color: "#1e40af" }}>{ss.name}</span>
          <span style={{ fontSize: 11, background: "#dbeafe", color: "#1d4ed8", borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>{products.length} products</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }} onClick={e => e.stopPropagation()}>
          <Edit size={13} color="#64748b" style={{ cursor: "pointer" }} onClick={() => setEditing(true)} />
          <Trash2 size={13} color="#ef4444" style={{ cursor: "pointer" }} onClick={delSS} />
          <span style={{ color: "#94a3b8" }} onClick={() => setOpen(!open)}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: 10, marginBottom: 12 }}>
            {products.map(p => <ProductCard key={p._id} product={p} catId={catId} subId={subId} subsubId={ss._id} onRefresh={loadProducts} />)}
            {products.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13, gridColumn: "1/-1", margin: "4px 0 8px" }}>No products yet</p>}
          </div>
          <button onClick={() => setAddingProduct(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            <Plus size={12} /> Add Product
          </button>
        </div>
      )}

      <Modal title="Add Product" open={addingProduct} onClose={() => setAddingProduct(false)}>
        <ItemForm form={pForm} setForm={setPForm} onSubmit={addProduct} isProduct preview={pPreview} setPreview={setPPreview} label="Add Product" />
      </Modal>
      <Modal title="Edit Sub-Subcategory" open={editing} onClose={() => setEditing(false)}>
        <ItemForm form={eForm} setForm={setEForm} onSubmit={updateSS} preview={ePreview} setPreview={setEPreview} label="Update" />
      </Modal>
    </div>
  );
}

/* ============================================================
   LEVEL 2 — SUBCATEGORY ROW
   ============================================================ */
function SubRow({ catId, sub, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [addingSSub, setAddingSSub] = useState(false);
  const [ssForm, setSSForm] = useState({ name: "", image: null });
  const [ssPreview, setSSPreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [eForm, setEForm] = useState({ name: sub.name, image: null });
  const [ePreview, setEPreview] = useState(sub.image);

  const addSSub = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", ssForm.name);
    if (ssForm.image) fd.append("image", ssForm.image);
    try {
      await api.post(`/${catId}/sub/${sub._id}/subsub`, fd);
      toast.success("Sub-subcategory added!");
      setSSForm({ name: "", image: null }); setSSPreview(null); setAddingSSub(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const delSub = async () => {
    if (!window.confirm("Delete this subcategory?")) return;
    try { await api.delete(`/${catId}/sub/${sub._id}`); toast.success("Deleted"); onRefresh(); }
    catch { toast.error("Delete failed"); }
  };

  const updateSub = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", eForm.name);
    if (eForm.image) fd.append("image", eForm.image);
    try { await api.put(`/${catId}/sub/${sub._id}`, fd); toast.success("Updated"); setEditing(false); onRefresh(); }
    catch { toast.error("Update failed"); }
  };

  const subsubList = sub.subSubCategories || [];

  return (
    <div style={{ border: "1px solid #d1fae5", borderRadius: 10, marginBottom: 8, background: open ? "#f0fdf4" : "#f8fffe" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Layers size={13} color="#16a34a" />
          <Thumb src={sub.image} size={28} />
          <span style={{ fontWeight: 600, fontSize: 13, color: "#15803d" }}>{sub.name}</span>
          <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>{subsubList.length} sub-subs</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }} onClick={e => e.stopPropagation()}>
          <Edit size={13} color="#64748b" style={{ cursor: "pointer" }} onClick={() => setEditing(true)} />
          <Trash2 size={13} color="#ef4444" style={{ cursor: "pointer" }} onClick={delSub} />
          <span style={{ color: "#94a3b8" }} onClick={() => setOpen(!open)}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: "0 14px 14px", paddingLeft: 30 }}>
          {subsubList.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 8px" }}>No sub-subcategories yet</p>}
          {subsubList.map(ss => <SubSubPanel key={ss._id} catId={catId} subId={sub._id} ss={ss} onRefresh={onRefresh} />)}
          <button onClick={() => setAddingSSub(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
            <Plus size={12} /> Add Sub-Subcategory
          </button>
        </div>
      )}

      <Modal title="Add Sub-Subcategory" open={addingSSub} onClose={() => setAddingSSub(false)}>
        <ItemForm form={ssForm} setForm={setSSForm} onSubmit={addSSub} preview={ssPreview} setPreview={setSSPreview} label="Add" />
      </Modal>
      <Modal title="Edit Subcategory" open={editing} onClose={() => setEditing(false)}>
        <ItemForm form={eForm} setForm={setEForm} onSubmit={updateSub} preview={ePreview} setPreview={setEPreview} label="Update" />
      </Modal>
    </div>
  );
}

/* ============================================================
   LEVEL 1 — MAIN COMPONENT
   ============================================================ */
export default function VendorCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState(null);
  const [menuId, setMenuId] = useState(null);

  // Category modal
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", image: null });
  const [catPreview, setCatPreview] = useState(null);

  // Add subcategory modal
  const [subModal, setSubModal] = useState(null); // holds catId
  const [subForm, setSubForm] = useState({ name: "", image: null });
  const [subPreview, setSubPreview] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/");
      const safe = (res.data.categories || []).map((c) => ({
        ...c,
        subcategories: (c.subcategories || []).map(s => ({
          ...s,
          subSubCategories: s.subSubCategories || [],
        })),
      }));
      setCategories(safe);
    } catch { toast.error("Failed to load categories"); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.subcategories.some(s =>
        s.name.toLowerCase().includes(q) ||
        (s.subSubCategories || []).some(ss => ss.name.toLowerCase().includes(q))
      )
    );
  });

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return toast.warn("Enter category name");
    const fd = new FormData();
    fd.append("name", catForm.name);
    if (catForm.image) fd.append("image", catForm.image);
    try {
      if (editCat) { await api.put(`/${editCat._id}`, fd); toast.success("Category updated — sent for re-approval"); }
      else { await api.post("/", fd); toast.success("Category sent for admin approval ⏳"); }
      closeCatModal(); fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category and everything inside?")) return;
    try { await api.delete(`/${id}`); toast.success("Category deleted"); fetchCategories(); }
    catch { toast.error("Delete failed"); }
  };

  const addSubcategory = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim()) return toast.warn("Enter subcategory name");
    const fd = new FormData();
    fd.append("name", subForm.name);
    if (subForm.image) fd.append("image", subForm.image);
    try {
      await api.post(`/${subModal}/sub`, fd);
      toast.success("Subcategory added!");
      setSubModal(null); setSubForm({ name: "", image: null }); setSubPreview(null); fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const openEditCat = (cat) => {
    setEditCat(cat); setCatForm({ name: cat.name, image: null }); setCatPreview(cat.image); setCatModal(true); setMenuId(null);
  };

  const closeCatModal = () => {
    setCatModal(false); setEditCat(null); setCatForm({ name: "", image: null }); setCatPreview(null);
  };

  /* ---- STYLES ---- */
  const S = {
    wrap: { padding: 24, fontFamily: "'DM Sans',system-ui,sans-serif", maxWidth: 980, margin: "0 auto", background: "#f8fafc", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "16px 22px", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 18 },
    addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 14px rgba(59,130,246,0.35)", transition: "all .2s" },
    searchWrap: { display: "flex", alignItems: "center", gap: 10, background: "#fff", padding: "11px 16px", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 18 },
    searchInp: { border: "none", outline: "none", width: "100%", fontSize: 14, color: "#0f172a", background: "transparent" },
    legend: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 },
    legendItem: (bg, border) => ({ display: "flex", alignItems: "center", gap: 5, background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }),
    table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
    th: { padding: "13px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#475569", letterSpacing: "0.05em", background: "#f1f5f9" },
    td: { padding: "13px 14px", borderTop: "1px solid #f1f5f9", fontSize: 14, color: "#0f172a", verticalAlign: "middle" },
    expandBtn: (active) => ({ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, border: "1px solid #e2e8f0", background: active ? "#eff6ff" : "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 600, color: active ? "#2563eb" : "#475569" }),
    menuWrap: { position: "relative", display: "inline-block" },
    dropdown: { position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200, minWidth: 140, overflow: "hidden" },
    dropItem: (red) => ({ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", width: "100%", border: "none", background: "#fff", cursor: "pointer", fontSize: 13, color: red ? "#dc2626" : "#374151", textAlign: "left" }),
    subArea: { padding: "4px 14px 18px 36px", background: "#fafbfc" },
  };

  return (
    <div style={S.wrap}>
      <ToastContainer position="top-right" autoClose={2500} />

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Tag size={20} color="#2563eb" />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Category Manager</h2>
        </div>
        <button
          style={S.addBtn}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,130,246,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(59,130,246,0.35)"; }}
          onClick={() => setCatModal(true)}
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* ── SEARCH ── */}
      <div style={S.searchWrap}>
        <Search size={15} color="#94a3b8" />
        <input style={S.searchInp} placeholder="Search category, subcategory, sub-subcategory…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <X size={15} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
      </div>

      {/* ── LEGEND ── */}
      <div style={S.legend}>
        <span style={S.legendItem("#eff6ff", "#bfdbfe")}><Tag size={11} color="#2563eb" /> Category (L1)</span>
        <span style={S.legendItem("#f0fdf4", "#bbf7d0")}><Layers size={11} color="#16a34a" /> Subcategory (L2)</span>
        <span style={S.legendItem("#eff6ff", "#bfdbfe")}><Package size={11} color="#3b82f6" /> Sub-Subcategory (L3)</span>
        <span style={S.legendItem("#fff7ed", "#fed7aa")}><ShoppingBag size={11} color="#ea580c" /> Products (L4)</span>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <table style={S.table}>
          <thead>
            <tr>
              {["#", "Category", "Status", "Subcategories", "Actions"].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...S.td, textAlign: "center", padding: 52, color: "#94a3b8" }}>
                  <AlertCircle size={28} color="#e2e8f0" style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                  No categories found
                </td>
              </tr>
            )}

            {filtered.map((cat, i) => (
              <React.Fragment key={cat._id}>
                {/* ── L1 Row ── */}
                <tr style={{ background: expandedCat === cat._id ? "#fafeff" : "#fff" }}>
                  <td style={{ ...S.td, width: 40, color: "#94a3b8" }}>{i + 1}</td>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Thumb src={cat.image} size={40} />
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>{cat.name}</strong>
                    </div>
                  </td>
                  <td style={S.td}><Badge status={cat.status} /></td>
                  <td style={S.td}>
                    <button
                      style={S.expandBtn(expandedCat === cat._id)}
                      onClick={() => setExpandedCat(expandedCat === cat._id ? null : cat._id)}
                    >
                      <Layers size={12} />
                      {cat.subcategories.length} subs
                      {expandedCat === cat._id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </td>
                  <td style={S.td}>
                    <div style={S.menuWrap}>
                      <MoreHorizontal
                        style={{ cursor: "pointer", color: "#6b7280" }}
                        onClick={() => setMenuId(menuId === cat._id ? null : cat._id)}
                      />
                      {menuId === cat._id && (
                        <div style={S.dropdown}>
                          <button style={S.dropItem(false)} onClick={() => openEditCat(cat)}><Edit size={13} /> Edit</button>
                          <button style={S.dropItem(true)} onClick={() => deleteCategory(cat._id)}><Trash2 size={13} /> Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>

                {/* ── Expanded Area ── */}
                {expandedCat === cat._id && (
                  <tr>
                    <td colSpan={5} style={{ padding: 0, background: "#fafbfc" }}>
                      <div style={S.subArea}>
                        {cat.status !== "approved" ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#d97706", fontSize: 13, padding: "12px 0", fontWeight: 600 }}>
                            <AlertCircle size={15} /> Admin approval required to manage subcategories
                          </div>
                        ) : (
                          <>
                            {cat.subcategories.length === 0 && (
                              <p style={{ color: "#94a3b8", fontSize: 13, margin: "12px 0 8px" }}>No subcategories yet</p>
                            )}
                            {cat.subcategories.map(sub => (
                              <SubRow key={sub._id} catId={cat._id} sub={sub} onRefresh={fetchCategories} />
                            ))}
                            <button
                              onClick={() => { setSubModal(cat._id); setSubForm({ name: "", image: null }); setSubPreview(null); }}
                              style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                            >
                              <Plus size={12} /> Add Subcategory
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL: Add/Edit Category ── */}
      <Modal title={editCat ? "Edit Category" : "New Category"} open={catModal} onClose={closeCatModal}>
        <ItemForm form={catForm} setForm={setCatForm} onSubmit={saveCategory} preview={catPreview} setPreview={setCatPreview} label={editCat ? "Update Category" : "Create Category"} />
      </Modal>

      {/* ── MODAL: Add Subcategory ── */}
      <Modal title="Add Subcategory" open={!!subModal} onClose={() => setSubModal(null)}>
        <ItemForm form={subForm} setForm={setSubForm} onSubmit={addSubcategory} preview={subPreview} setPreview={setSubPreview} label="Add Subcategory" />
      </Modal>
    </div>
  );
}