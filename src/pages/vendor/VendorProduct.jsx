// import React, { useEffect, useState, useRef, useCallback } from "react";
// import axios from "axios";

// const API_URL = "https://foodhelpervendor.onrender.com/api/vendor/products";
// const CATEGORY_URL = "https://foodhelpervendor.onrender.com/api/vendor/categories";
// const HSN_API_URL = `${API_URL}/hsn-codes`;
// const BULK_API_URL = "https://foodhelpervendor.onrender.com/api/vendor/bulk-discounts";

// const TOKEN_KEY = "vendorToken";

// const axiosAuth = axios.create();
// axiosAuth.interceptors.request.use((config) => {
//   const token = localStorage.getItem(TOKEN_KEY);
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// const MAX_GALLERY = 4;

// const GST_BADGE = {
//   0: { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
//   5: { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
//   12: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
//   18: { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
//   28: { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
// };

// const EMPTY = {
//   name: "",
//   brand: "",
//   category: "",
//   subcategory: "",
//   subSubCategory: "",
//   description: "",
//   basePrice: "",
//   salePrice: "",
//   profit: "",
//   weightValue: "",
//   weightUnit: "kg",
//   status: "inactive",
//   gstPercent: "",
//   hsnCode: "",
//   taxType: "cgst_sgst",
//   validTill: "",
//   mainImageFile: null,
//   existingMainImage: "",
//   galleryFiles: [],
//   existingGalleryImages: [],
// };

// const EMPTY_HSN_FORM = { code: "", description: "", category: "", gst: "0" };
// const EMPTY_BULK = { minQty: "", maxQty: "", unitPrice: "" };

// /* ══════════════════════════════════════════════════════════════
//    BULK DISCOUNT MANAGER  —  FIXED
//    Fixes:
//    1. Duplicate range check — same minQty+maxQty dobara nahi add hogi
//    2. Range display — minQty===maxQty pe "10+" dikhega, "10-10" nahi
//    3. maxQty validation tight kiya
// ══════════════════════════════════════════════════════════════ */
// function BulkDiscountManager({
//   productId,
//   basePrice,
//   salePrice,
//   onTempChange,
// }) {
//   const [rules, setRules] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState(EMPTY_BULK);
//   const [ruleEditId, setRuleEditId] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [deleteConf, setDeleteConf] = useState(null);

//   const isTempMode = !productId || productId === "new";

//   const loadRules = useCallback(async () => {
//     if (!productId) return;
//     try {
//       setLoading(true);
//       const res = await axiosAuth.get(`${BULK_API_URL}/product/${productId}`);
//       setRules((res.data?.data || []).sort((a, b) => a.minQty - b.minQty));
//     } catch (err) {
//       console.error("Load Bulk Rules Error:", err);
//       setRules([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [productId]);

//   useEffect(() => {
//     if (!productId) return;
//     loadRules();
//   }, [productId, loadRules]);

//   const resetForm = () => {
//     setForm(EMPTY_BULK);
//     setRuleEditId(null);
//     setShowForm(false);
//     setError("");
//   };

//   const formatRange = (minQty, maxQty) => {
//     if (!maxQty || Number(maxQty) === Number(minQty)) return `${minQty}+`;
//     return `${minQty}–${maxQty}`;
//   };

//   const isDuplicate = (minQtyNum, maxQtyNum, excludeId = null) => {
//     return rules.some((r) => {
//       const rId = isTempMode ? r._tempId : r._id;
//       if (excludeId && rId === excludeId) return false;
//       const rMin = Number(r.minQty);
//       const rMax = r.maxQty != null ? Number(r.maxQty) : null;
//       return rMin === minQtyNum && rMax === maxQtyNum;
//     });
//   };

//   const handleEdit = (rule) => {
//     setRuleEditId(isTempMode ? rule._tempId : rule._id);
//     setForm({
//       minQty: rule.minQty,
//       maxQty: rule.maxQty ?? "",
//       unitPrice: rule.unitPrice,
//     });
//     setShowForm(true);
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault(); // ✅ safe

//     console.log("SUBMIT TRIGGERED", { ruleEditId, isTempMode });

//     if (!form.minQty || !form.unitPrice) {
//       setError("Min Qty aur Unit Price required hain");
//       return;
//     }

//     const minQtyNum = Number(form.minQty);
//     const maxQtyNum =
//       form.maxQty !== "" && form.maxQty != null ? Number(form.maxQty) : null;
//     const unitPriceNum = Number(form.unitPrice);

//     if (!Number.isInteger(minQtyNum) || minQtyNum < 1) {
//       setError("Min Qty pura number hona chahiye (>= 1)");
//       return;
//     }
//     if (maxQtyNum !== null) {
//       if (!Number.isInteger(maxQtyNum) || maxQtyNum < minQtyNum) {
//         setError("Max Qty, Min Qty se chhota nahi ho sakta");
//         return;
//       }
//     }
//     if (unitPriceNum <= 0) {
//       setError("Unit Price 0 se zyada hona chahiye");
//       return;
//     }

//     if (isDuplicate(minQtyNum, maxQtyNum, ruleEditId)) {
//       setError(
//         `Yeh range (${formatRange(minQtyNum, maxQtyNum)} units) pehle se exist karti hai.`,
//       );
//       return;
//     }

//     const payload = {
//       minQty: minQtyNum,
//       maxQty: maxQtyNum,
//       unitPrice: unitPriceNum,
//     };

//     if (isTempMode) {
//       let updated;
//       if (ruleEditId) {
//         updated = rules.map((r) =>
//           r._tempId === ruleEditId ? { ...r, ...payload } : r,
//         );
//       } else {
//         updated = [...rules, { ...payload, _tempId: `tmp_${Date.now()}` }];
//       }
//       setRules(updated);
//       if (onTempChange) onTempChange([...updated]);
//       resetForm();
//       return;
//     }

//     try {
//       setSaving(true);

//       if (ruleEditId) {
//         console.log("PUT CALL");
//         await axiosAuth.put(`${BULK_API_URL}/${ruleEditId}`, payload);
//       } else {
//         console.log("POST CALL");
//         await axiosAuth.post(`${BULK_API_URL}/add`, {
//           ...payload,
//           product: productId,
//         });
//       }

//       await loadRules();
//       resetForm();
//     } catch (err) {
//       console.log("API ERROR:", err);
//       setError(err.response?.data?.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (rule) => {
//     if (isTempMode) {
//       const updated = rules.filter((r) => r._tempId !== rule._tempId);
//       setRules([...updated]);
//       if (onTempChange) onTempChange([...updated]);
//       setDeleteConf(null);
//       return;
//     }
//     try {
//       await axiosAuth.delete(`${BULK_API_URL}/${rule._id}`);
//       await loadRules();
//     } catch {
//     } finally {
//       setDeleteConf(null);
//     }
//   };

//   const savingsPct = (unitPrice) => {
//     const base = Number(salePrice || basePrice) || 0;
//     if (!base || unitPrice >= base) return null;
//     return Math.round(((base - unitPrice) / base) * 100);
//   };

//   const getKey = (rule) => (isTempMode ? rule._tempId : rule._id);

//   return (
//     <div className="bd-wrap">
//       <div className="bd-header">
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <div className="bd-header-icon">📊</div>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 700 }}>
//               Bulk Discount Rules
//             </div>
//             <div
//               style={{ fontSize: 11, color: "var(--textMid)", marginTop: 1 }}
//             >
//               {isTempMode
//                 ? "Tiers will be saved when product is created"
//                 : `${rules.length} tier${rules.length !== 1 ? "s" : ""} — quantity-based pricing`}
//             </div>
//           </div>
//         </div>
//         {!showForm && (
//           <button
//             type="button"
//             className="bd-add-btn"
//             onClick={() => {
//               resetForm();
//               setShowForm(true);
//             }}
//           >
//             + Add Tier
//           </button>
//         )}
//       </div>

//       {isTempMode && rules.length === 0 && !showForm && (
//         <div
//           style={{
//             margin: "10px 12px",
//             padding: "10px 14px",
//             background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
//             border: "1.5px dashed #7dd3fc",
//             borderRadius: 9,
//             fontSize: 12,
//             color: "#0369a1",
//             display: "flex",
//             alignItems: "center",
//             gap: 10,
//           }}
//         >
//           <span style={{ fontSize: 18, opacity: 0.7 }}>💡</span>
//           <span>
//             Tiers abhi add karo — product save hone pe automatically link ho
//             jayenge.
//           </span>
//         </div>
//       )}

//       {/* ── Form ── */}
//       {showForm && (
//         <div className="bd-form-wrap">
//           <div className="bd-form-title">
//             {ruleEditId ? "✏️ Tier Edit Karo" : "➕ Naya Price Tier"}
//           </div>
//           <form>
//             <div className="bd-form-grid">
//               <div>
//                 <label className="bd-lbl">Min Qty *</label>
//                 <input
//                   className="bd-inp"
//                   type="number"
//                   placeholder="e.g. 10"
//                   value={form.minQty}
//                   onChange={(e) => {
//                     setForm((p) => ({ ...p, minQty: e.target.value }));
//                     setError("");
//                   }}
//                   min="1"
//                 />
//               </div>
//               <div>
//                 <label className="bd-lbl">
//                   Max Qty{" "}
//                   <span style={{ fontSize: 10, color: "var(--textDim)" }}>
//                     (optional — blank = no limit)
//                   </span>
//                 </label>
//                 <input
//                   className="bd-inp"
//                   type="number"
//                   placeholder="Blank = no limit"
//                   value={form.maxQty}
//                   onChange={(e) => {
//                     setForm((p) => ({ ...p, maxQty: e.target.value }));
//                     setError("");
//                   }}
//                   min="1"
//                 />
//               </div>
//               <div>
//                 <label className="bd-lbl">Unit Price (Rs.) *</label>
//                 <input
//                   className="bd-inp"
//                   type="number"
//                   placeholder="Price per unit"
//                   value={form.unitPrice}
//                   onChange={(e) => {
//                     setForm((p) => ({ ...p, unitPrice: e.target.value }));
//                     setError("");
//                   }}
//                   min="0"
//                   step="0.01"
//                 />
//               </div>
//             </div>

//             {/* Live preview */}
//             {form.minQty &&
//               form.unitPrice &&
//               (() => {
//                 const pct = savingsPct(Number(form.unitPrice));
//                 const base = Number(salePrice || basePrice) || 0;
//                 const rangeStr = formatRange(form.minQty, form.maxQty);
//                 return (
//                   <div className="bd-preview">
//                     <span>
//                       Buy <strong>{rangeStr}</strong> units &rarr;{" "}
//                       <strong style={{ color: "var(--blue)" }}>
//                         Rs.{form.unitPrice}/unit
//                       </strong>
//                       {pct > 0 && (
//                         <span className="bd-savings-chip">Save {pct}%</span>
//                       )}
//                       {pct !== null && pct < 0 && (
//                         <span
//                           style={{
//                             color: "var(--red)",
//                             fontSize: 11,
//                             marginLeft: 6,
//                           }}
//                         >
//                           ⚠ Sale price se zyada hai
//                         </span>
//                       )}
//                       {base > 0 && pct > 0 && (
//                         <span
//                           style={{
//                             color: "var(--textDim)",
//                             fontSize: 11,
//                             marginLeft: 6,
//                           }}
//                         >
//                           (was Rs.{base})
//                         </span>
//                       )}
//                     </span>
//                   </div>
//                 );
//               })()}

//             {error && <div className="bd-error">⚠ {error}</div>}

//             <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
//               <button
//                 type="button"
//                 className="bd-save-btn"
//                 onClick={handleSubmit}
//                 disabled={saving}
//               >
//                 {saving
//                   ? "Saving..."
//                   : ruleEditId
//                     ? "Update Tier"
//                     : "Save Tier"}
//               </button>
//               <button
//                 type="button"
//                 className="bd-cancel-btn"
//                 onClick={resetForm}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* ── Rules list ── */}
//       {loading ? (
//         <div className="bd-loading">
//           {[1, 2].map((i) => (
//             <div key={i} className="bd-skeleton" />
//           ))}
//         </div>
//       ) : rules.length === 0 ? (
//         !showForm && (
//           <div className="bd-empty">
//             <div className="bd-empty-icon">📊</div>
//             <div
//               style={{ fontSize: 12, color: "var(--textDim)", marginTop: 6 }}
//             >
//               {isTempMode
//                 ? "Koi tier nahi — upar Add Tier click karo"
//                 : "No bulk discount rules yet"}
//             </div>
//           </div>
//         )
//       ) : (
//         <div className="bd-rules-list">
//           {[...rules]
//             .sort((a, b) => a.minQty - b.minQty)
//             .map((rule, idx) => {
//               const pct = savingsPct(rule.unitPrice);
//               const base = Number(salePrice || basePrice) || 0;
//               const key = getKey(rule);
//               const rangeStr = formatRange(rule.minQty, rule.maxQty);
//               return (
//                 <div key={key || idx} className="bd-rule-card">
//                   {isTempMode && (
//                     <span
//                       style={{
//                         fontSize: 9,
//                         fontWeight: 800,
//                         background: "#fef3c7",
//                         color: "#92400e",
//                         padding: "2px 6px",
//                         borderRadius: 20,
//                         border: "1px solid #fde68a",
//                         flexShrink: 0,
//                       }}
//                     >
//                       PENDING
//                     </span>
//                   )}
//                   <div className="bd-rule-tier-badge">Tier {idx + 1}</div>
//                   <div className="bd-rule-main">
//                     <span className="bd-qty-label">{rangeStr} units</span>
//                     <span className="bd-rule-arrow">&rarr;</span>
//                     <span className="bd-unit-price">Rs.{rule.unitPrice}</span>
//                     <span className="bd-per-unit">/unit</span>
//                     {pct > 0 && (
//                       <>
//                         <span className="bd-savings-tag">-{pct}%</span>
//                         <span className="bd-savings-abs">
//                           Save Rs.{(base - rule.unitPrice).toFixed(2)}
//                         </span>
//                       </>
//                     )}
//                   </div>
//                   <div className="bd-rule-actions">
//                     <button
//                       type="button"
//                       className="bd-edit-btn"
//                       onClick={() => handleEdit(rule)}
//                       title="Edit"
//                     >
//                       ✏️
//                     </button>
//                     <button
//                       type="button"
//                       className="bd-del-btn"
//                       onClick={() => setDeleteConf(rule)}
//                       title="Delete"
//                     >
//                       🗑️
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}

//           {/* Price Ladder — 2+ tiers hone pe dikhao */}
//           {rules.length > 1 &&
//             (() => {
//               const sorted = [...rules].sort((a, b) => a.minQty - b.minQty);
//               const maxPrice = Math.max(...sorted.map((r) => r.unitPrice));
//               return (
//                 <div className="bd-ladder">
//                   <div className="bd-ladder-title">📉 Price Ladder</div>
//                   <div className="bd-ladder-bars">
//                     {sorted.map((rule, idx) => {
//                       const barWidth =
//                         maxPrice > 0
//                           ? Math.max(20, (rule.unitPrice / maxPrice) * 100)
//                           : 50;
//                       const pct = savingsPct(rule.unitPrice);
//                       const key = getKey(rule);
//                       return (
//                         <div key={key || idx} className="bd-ladder-row">
//                           <div className="bd-ladder-qty">
//                             {formatRange(rule.minQty, rule.maxQty)} u
//                           </div>
//                           <div className="bd-ladder-bar-wrap">
//                             <div
//                               className="bd-ladder-bar"
//                               style={{
//                                 width: `${barWidth}%`,
//                                 background:
//                                   idx === 0
//                                     ? "#dbeafe"
//                                     : idx === rules.length - 1
//                                       ? "#bbf7d0"
//                                       : `hsl(${210 - idx * 20},80%,85%)`,
//                               }}
//                             />
//                           </div>
//                           <div className="bd-ladder-price">
//                             Rs.{rule.unitPrice}
//                             {pct > 0 && (
//                               <span className="bd-ladder-pct">-{pct}%</span>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               );
//             })()}
//         </div>
//       )}

//       {/* Delete confirm */}
//       {deleteConf && (
//         <div className="bd-del-overlay" onClick={() => setDeleteConf(null)}>
//           <div className="bd-del-modal" onClick={(e) => e.stopPropagation()}>
//             <div style={{ fontSize: 24, marginBottom: 10 }}>🗑️</div>
//             <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
//               Delete this tier?
//             </div>
//             <div
//               style={{
//                 fontSize: 12,
//                 color: "var(--textMid)",
//                 marginBottom: 16,
//               }}
//             >
//               Yeh bulk discount rule delete ho jayega.
//             </div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button
//                 type="button"
//                 onClick={() => handleDelete(deleteConf)}
//                 style={{
//                   flex: 1,
//                   padding: "8px 0",
//                   background: "var(--red)",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: 8,
//                   fontWeight: 600,
//                   fontSize: 13,
//                   fontFamily: "inherit",
//                   cursor: "pointer",
//                 }}
//               >
//                 Delete
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setDeleteConf(null)}
//                 style={{
//                   flex: 1,
//                   padding: "8px 0",
//                   background: "var(--bg)",
//                   color: "var(--textMid)",
//                   border: "1px solid var(--border)",
//                   borderRadius: 8,
//                   fontWeight: 500,
//                   fontSize: 13,
//                   fontFamily: "inherit",
//                   cursor: "pointer",
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    BULK PRICE RANGE CELL
// ══════════════════════════════════════════════════════════════ */
// function BulkPriceRangeCell({ productId, basePrice, salePrice, allBulkRules }) {
//   const [expanded, setExpanded] = useState(false);

//   const rules = (allBulkRules || [])
//     .filter((d) => String(d.productId) === String(productId))
//     .sort((a, b) => a.minQty - b.minQty);

//   const formatRange = (minQty, maxQty) => {
//     if (!maxQty || Number(maxQty) === Number(minQty)) return `${minQty}+`;
//     return `${minQty}–${maxQty}`;
//   };

//   if (!rules.length) {
//     return (
//       <span
//         style={{ fontSize: 11.5, color: "var(--textDim)", fontStyle: "italic" }}
//       >
//         —
//       </span>
//     );
//   }

//   const base = Number(salePrice || basePrice) || 0;
//   const minPrice = Math.min(...rules.map((r) => r.unitPrice));
//   const maxSaving = base > 0 ? Math.round(((base - minPrice) / base) * 100) : 0;

//   return (
//     <div style={{ position: "relative" }}>
//       <button
//         type="button"
//         onClick={() => setExpanded((p) => !p)}
//         className="bpr-trigger"
//       >
//         <span className="bpr-icon">📊</span>
//         <span className="bpr-label">
//           {rules.length} tier{rules.length > 1 ? "s" : ""}
//         </span>
//         {maxSaving > 0 && (
//           <span className="bpr-saving">upto -{maxSaving}%</span>
//         )}
//         <span style={{ color: "var(--textDim)", fontSize: 10 }}>
//           {expanded ? "▲" : "▼"}
//         </span>
//       </button>

//       {expanded && (
//         <>
//           <div
//             style={{ position: "fixed", inset: 0, zIndex: 49 }}
//             onClick={() => setExpanded(false)}
//           />
//           <div className="bpr-popup">
//             <div className="bpr-popup-title">
//               📊 Bulk Price Tiers
//               <button
//                 type="button"
//                 onClick={() => setExpanded(false)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   color: "var(--textDim)",
//                   fontSize: 14,
//                   marginLeft: "auto",
//                 }}
//               >
//                 ✕
//               </button>
//             </div>
//             {rules.map((rule, idx) => {
//               const pct =
//                 base > 0 && rule.unitPrice < base
//                   ? Math.round(((base - rule.unitPrice) / base) * 100)
//                   : 0;
//               return (
//                 <div key={rule._id || idx} className="bpr-row">
//                   <div className="bpr-tier-num">T{idx + 1}</div>
//                   <div className="bpr-qty-range">
//                     {formatRange(rule.minQty, rule.maxQty)} units
//                   </div>
//                   <div className="bpr-arrow">&rarr;</div>
//                   <div className="bpr-price">
//                     Rs.{rule.unitPrice}
//                     <span style={{ fontSize: 10, color: "var(--textDim)" }}>
//                       /u
//                     </span>
//                   </div>
//                   {pct > 0 && <div className="bpr-pct">-{pct}%</div>}
//                 </div>
//               );
//             })}
//             {base > 0 && (
//               <div className="bpr-base-row">
//                 <span style={{ color: "var(--textDim)", fontSize: 10 }}>
//                   Sale Price
//                 </span>
//                 <span style={{ fontWeight: 600, color: "var(--textMid)" }}>
//                   Rs.{base}
//                 </span>
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    ADD HSN MODAL
// ══════════════════════════════════════════════════════════════ */
// function AddHsnModal({ onClose, onSaved, existingCategories }) {
//   const [form, setForm] = useState(EMPTY_HSN_FORM);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [newCat, setNewCat] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.code || !form.description || !form.category) {
//       setError("Please fill all required fields.");
//       return;
//     }
//     try {
//       setSaving(true);
//       const res = await axiosAuth.post(HSN_API_URL, {
//         code: form.code.trim(),
//         description: form.description.trim(),
//         category: form.category.trim(),
//         gst: Number(form.gst),
//       });
//       onSaved(res.data.data);
//       onClose();
//     } catch (err) {
//       setError(err.response?.data?.message || "HSN save failed.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="vp-modal-bg" onClick={onClose}>
//       <div
//         className="vp-modal"
//         style={{ width: 420 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: 18,
//           }}
//         >
//           <div>
//             <div style={{ fontSize: 16, fontWeight: 700 }}>New HSN Code</div>
//             <div
//               style={{ fontSize: 12, color: "var(--textMid)", marginTop: 2 }}
//             >
//               Add GST Tariff Code
//             </div>
//           </div>
//           <button className="vp-close" onClick={onClose}>
//             ×
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="vp-field">
//             <label className="vp-lbl">HSN Code *</label>
//             <input
//               className="vp-inp"
//               name="code"
//               placeholder="e.g. 0401"
//               value={form.code}
//               onChange={handleChange}
//               style={{
//                 fontFamily: "monospace",
//                 fontWeight: 700,
//                 letterSpacing: 1,
//               }}
//             />
//           </div>
//           <div className="vp-field">
//             <label className="vp-lbl">Category *</label>
//             {!newCat ? (
//               <div style={{ display: "flex", gap: 8 }}>
//                 <select
//                   className="vp-sel"
//                   name="category"
//                   value={form.category}
//                   onChange={handleChange}
//                   style={{ flex: 1 }}
//                 >
//                   <option value="">Select Category</option>
//                   {existingCategories.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setNewCat(true);
//                     setForm((p) => ({ ...p, category: "" }));
//                   }}
//                   style={{
//                     padding: "0 12px",
//                     border: "1px solid var(--blue)",
//                     borderRadius: 8,
//                     background: "var(--blueFade)",
//                     color: "var(--blue)",
//                     fontSize: 12,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   + New
//                 </button>
//               </div>
//             ) : (
//               <div style={{ display: "flex", gap: 8 }}>
//                 <input
//                   className="vp-inp"
//                   name="category"
//                   placeholder="New category name"
//                   value={form.category}
//                   onChange={handleChange}
//                   style={{ flex: 1 }}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setNewCat(false)}
//                   style={{
//                     padding: "0 12px",
//                     border: "1px solid var(--border)",
//                     borderRadius: 8,
//                     background: "var(--bg)",
//                     color: "var(--textMid)",
//                     fontSize: 12,
//                     cursor: "pointer",
//                   }}
//                 >
//                   List
//                 </button>
//               </div>
//             )}
//           </div>
//           <div className="vp-field">
//             <label className="vp-lbl">GST Rate *</label>
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(5,1fr)",
//                 gap: 8,
//               }}
//             >
//               {[0, 5, 12, 18, 28].map((rate) => {
//                 const b = GST_BADGE[rate];
//                 const sel = form.gst === String(rate);
//                 return (
//                   <button
//                     key={rate}
//                     type="button"
//                     onClick={() =>
//                       setForm((p) => ({ ...p, gst: String(rate) }))
//                     }
//                     style={{
//                       padding: "8px 4px",
//                       borderRadius: 8,
//                       border: `2px solid ${sel ? b.dot : "var(--border)"}`,
//                       background: sel ? b.bg : "var(--white)",
//                       color: sel ? b.text : "var(--textMid)",
//                       fontWeight: sel ? 700 : 500,
//                       fontSize: 13,
//                       cursor: "pointer",
//                       transition: "all .15s",
//                     }}
//                   >
//                     {rate}%
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//           <div className="vp-field">
//             <label className="vp-lbl">Description *</label>
//             <textarea
//               className="vp-ta"
//               name="description"
//               placeholder="e.g. Milk & Cream (not concentrated, no added sugar)"
//               value={form.description}
//               onChange={handleChange}
//               style={{ minHeight: 70 }}
//             />
//           </div>
//           {error && (
//             <div
//               style={{
//                 padding: "8px 12px",
//                 background: "var(--redFade)",
//                 border: "1px solid #fecaca",
//                 borderRadius: 8,
//                 color: "var(--red)",
//                 fontSize: 12,
//                 marginBottom: 12,
//               }}
//             >
//               {error}
//             </div>
//           )}
//           <div style={{ display: "flex", gap: 10 }}>
//             <button
//               type="submit"
//               className="btn-primary"
//               style={{ flex: 1, justifyContent: "center" }}
//               disabled={saving}
//             >
//               {saving ? "Saving..." : "Save HSN Code"}
//             </button>
//             <button type="button" className="btn-ghost" onClick={onClose}>
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    HSN PICKER
// ══════════════════════════════════════════════════════════════ */
// function HsnPicker({
//   value,
//   onSelect,
//   hsnCodes,
//   hsnCategories,
//   onAddNew,
//   css: c,
// }) {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const [catFilter, setCatFilter] = useState("");
//   const [highlighted, setHigh] = useState(0);
//   const wrapRef = useRef(null);
//   const inputRef = useRef(null);
//   const listRef = useRef(null);

//   const selected = hsnCodes.find((h) => h.code === value) ?? null;

//   const filtered = hsnCodes.filter((h) => {
//     const q = query.toLowerCase();
//     return (
//       (!q ||
//         h.code.toLowerCase().includes(q) ||
//         h.description.toLowerCase().includes(q) ||
//         h.category.toLowerCase().includes(q)) &&
//       (!catFilter || h.category === catFilter)
//     );
//   });

//   useEffect(() => {
//     const handler = (e) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target))
//         setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   useEffect(() => setHigh(0), [query, catFilter]);

//   useEffect(() => {
//     if (!open) return;
//     listRef.current
//       ?.querySelector(`[data-idx="${highlighted}"]`)
//       ?.scrollIntoView({ block: "nearest" });
//   }, [highlighted, open]);

//   const pick = (hsn) => {
//     onSelect(hsn);
//     setOpen(false);
//     setQuery("");
//   };
//   const clear = (e) => {
//     e.stopPropagation();
//     onSelect(null);
//     setQuery("");
//   };

//   const handleKeyDown = (e) => {
//     if (!open) {
//       if (e.key === "Enter" || e.key === " ") {
//         e.preventDefault();
//         setOpen(true);
//       }
//       return;
//     }
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHigh((p) => Math.min(p + 1, filtered.length - 1));
//     }
//     if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHigh((p) => Math.max(p - 1, 0));
//     }
//     if (e.key === "Enter") {
//       e.preventDefault();
//       if (filtered[highlighted]) pick(filtered[highlighted]);
//     }
//     if (e.key === "Escape") {
//       setOpen(false);
//     }
//   };

//   const badge = selected ? (GST_BADGE[selected.gst] ?? GST_BADGE[0]) : null;

//   return (
//     <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
//       <div style={{ display: "flex", gap: 6 }}>
//         <button
//           type="button"
//           onKeyDown={handleKeyDown}
//           onClick={() => {
//             setOpen((p) => !p);
//             setTimeout(() => inputRef.current?.focus(), 60);
//           }}
//           className={c.hsnBtn + (open ? " " + c.hsnBtnOpen : "")}
//           style={{ flex: 1 }}
//         >
//           🏷️
//           {selected ? (
//             <>
//               <span className={c.hsnCode}>{selected.code}</span>
//               <span className={c.hsnDesc}>{selected.description}</span>
//               <span
//                 className={c.gstBadge}
//                 style={{ background: badge.bg, color: badge.text }}
//               >
//                 <span
//                   style={{
//                     background: badge.dot,
//                     width: 6,
//                     height: 6,
//                     borderRadius: "50%",
//                     display: "inline-block",
//                     marginRight: 4,
//                   }}
//                 />
//                 GST {selected.gst}%
//               </span>
//               <span onClick={clear} className={c.hsnClear}>
//                 ✕
//               </span>
//             </>
//           ) : (
//             <>
//               <span className={c.hsnPlaceholder}>Search HSN code...</span>
//               <span
//                 style={{
//                   marginLeft: "auto",
//                   color: "var(--textDim)",
//                   fontSize: 12,
//                 }}
//               >
//                 ▾
//               </span>
//             </>
//           )}
//         </button>
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation();
//             setOpen(false);
//             onAddNew();
//           }}
//           title="Add new HSN code"
//           style={{
//             width: 38,
//             height: 38,
//             borderRadius: 8,
//             border: "1.5px dashed var(--blue)",
//             background: "var(--blueFade)",
//             color: "var(--blue)",
//             fontSize: 18,
//             fontWeight: 700,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             cursor: "pointer",
//             flexShrink: 0,
//             transition: "all .2s",
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = "var(--blue)";
//             e.currentTarget.style.color = "#fff";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = "var(--blueFade)";
//             e.currentTarget.style.color = "var(--blue)";
//           }}
//         >
//           +
//         </button>
//       </div>

//       {open && (
//         <div className={c.hsnDropdown}>
//           <div style={{ padding: "10px 10px 6px" }}>
//             <input
//               ref={inputRef}
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type code or item name..."
//               className={c.hsnSearch}
//             />
//           </div>
//           <div className={c.hsnCatBar}>
//             <button
//               className={
//                 c.hsnCatPill + (!catFilter ? " " + c.hsnCatPillActive : "")
//               }
//               onClick={() => setCatFilter("")}
//             >
//               All
//             </button>
//             {hsnCategories.map((cat) => (
//               <button
//                 key={cat}
//                 className={
//                   c.hsnCatPill +
//                   (catFilter === cat ? " " + c.hsnCatPillActive : "")
//                 }
//                 onClick={() => setCatFilter(catFilter === cat ? "" : cat)}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>
//           <div ref={listRef} className={c.hsnList}>
//             {hsnCodes.length === 0 ? (
//               <div className={c.hsnEmpty}>
//                 <div style={{ marginBottom: 8 }}>No HSN codes found</div>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setOpen(false);
//                     onAddNew();
//                   }}
//                   style={{
//                     padding: "6px 14px",
//                     borderRadius: 8,
//                     background: "var(--blue)",
//                     color: "white",
//                     border: "none",
//                     fontSize: 12,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                   }}
//                 >
//                   Add First HSN
//                 </button>
//               </div>
//             ) : filtered.length === 0 ? (
//               <div className={c.hsnEmpty}>
//                 No results —{" "}
//                 <button
//                   type="button"
//                   style={{
//                     color: "var(--blue)",
//                     background: "none",
//                     border: "none",
//                     cursor: "pointer",
//                     fontWeight: 600,
//                   }}
//                   onClick={() => {
//                     setOpen(false);
//                     onAddNew();
//                   }}
//                 >
//                   Add new?
//                 </button>
//               </div>
//             ) : (
//               filtered.map((hsn, idx) => {
//                 const b = GST_BADGE[hsn.gst] ?? GST_BADGE[0];
//                 return (
//                   <button
//                     key={hsn.code}
//                     data-idx={idx}
//                     type="button"
//                     onClick={() => pick(hsn)}
//                     onMouseEnter={() => setHigh(idx)}
//                     className={
//                       c.hsnItem +
//                       (value === hsn.code
//                         ? " " + c.hsnItemSelected
//                         : highlighted === idx
//                           ? " " + c.hsnItemHigh
//                           : "")
//                     }
//                   >
//                     <span
//                       className={
//                         c.hsnItemCode +
//                         (value === hsn.code ? " " + c.hsnItemCodeSel : "")
//                       }
//                     >
//                       {hsn.code}
//                     </span>
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <div className={c.hsnItemDesc}>{hsn.description}</div>
//                       <div className={c.hsnItemCat}>{hsn.category}</div>
//                     </div>
//                     <span
//                       className={c.gstBadge}
//                       style={{ background: b.bg, color: b.text }}
//                     >
//                       <span
//                         style={{
//                           background: b.dot,
//                           width: 6,
//                           height: 6,
//                           borderRadius: "50%",
//                           display: "inline-block",
//                           marginRight: 4,
//                         }}
//                       />
//                       {hsn.gst}%
//                     </span>
//                   </button>
//                 );
//               })
//             )}
//           </div>
//           <div className={c.hsnFooter}>
//             {filtered.length} result{filtered.length !== 1 ? "s" : ""} · Arrow
//             keys navigate · Enter select · Esc close
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    INLINE EDITABLE BASE PRICE CELL
// ══════════════════════════════════════════════════════════════ */
// function InlinePrice({ value, onSave }) {
//   const [editing, setEditing] = useState(false);
//   const [val, setVal] = useState(value);
//   const inputRef = useRef(null);

//   const commit = () => {
//     const n = Number(val);
//     if (!isNaN(n) && n >= 0) onSave(n);
//     setEditing(false);
//   };

//   useEffect(() => {
//     if (editing) inputRef.current?.select();
//   }, [editing]);
//   useEffect(() => setVal(value), [value]);

//   if (editing) {
//     return (
//       <input
//         ref={inputRef}
//         type="number"
//         value={val}
//         onChange={(e) => setVal(e.target.value)}
//         onBlur={commit}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") commit();
//           if (e.key === "Escape") setEditing(false);
//         }}
//         style={{
//           width: 80,
//           padding: "4px 8px",
//           border: "2px solid var(--blue)",
//           borderRadius: 7,
//           fontFamily: "inherit",
//           fontSize: 13,
//           fontWeight: 700,
//           color: "var(--text)",
//           outline: "none",
//           background: "#eff6ff",
//         }}
//       />
//     );
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 4,
//         cursor: "pointer",
//       }}
//       onClick={() => setEditing(true)}
//       title="Click to edit base price"
//     >
//       <span style={{ color: "var(--textMid)", fontWeight: 500 }}>
//         Rs.{value}
//       </span>
//       <span
//         style={{
//           fontSize: 10,
//           color: "var(--blue)",
//           background: "var(--blueFade)",
//           border: "1px solid #bfdbfe",
//           borderRadius: 4,
//           padding: "1px 5px",
//           fontWeight: 600,
//           opacity: 0.8,
//         }}
//       >
//         ✏
//       </span>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    MAIN IMAGE UPLOADER
// ══════════════════════════════════════════════════════════════ */
// function MainImageUploader({ file, existingUrl, onChange }) {
//   const [preview, setPreview] = useState(existingUrl || null);
//   const [lightbox, setLightbox] = useState(false);
//   const [dragOver, setDragOver] = useState(false);
//   const inputRef = useRef(null);

//   const handleFile = (f) => {
//     if (!f || !f.type.startsWith("image/")) return;
//     setPreview(URL.createObjectURL(f));
//     onChange({ file: f, existingUrl: "" });
//   };
//   const handleRemove = () => {
//     setPreview(null);
//     onChange({ file: null, existingUrl: "" });
//   };
//   const onDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     const f = e.dataTransfer.files?.[0];
//     if (f) handleFile(f);
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//       <div
//         onDragOver={(e) => {
//           e.preventDefault();
//           setDragOver(true);
//         }}
//         onDragLeave={() => setDragOver(false)}
//         onDrop={onDrop}
//         onClick={() => !preview && inputRef.current?.click()}
//         style={{
//           position: "relative",
//           width: "100%",
//           aspectRatio: "4/3",
//           borderRadius: 12,
//           overflow: "hidden",
//           border: `2px ${preview ? "solid" : "dashed"} ${dragOver ? "#2563eb" : preview ? "#bfdbfe" : "#d1d5db"}`,
//           background: dragOver ? "#eff6ff" : preview ? "#000" : "#f9fafb",
//           cursor: preview ? "default" : "pointer",
//           transition: "all .2s",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         {preview ? (
//           <>
//             <img
//               src={preview}
//               alt="Main"
//               style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             />
//             <span
//               style={{
//                 position: "absolute",
//                 top: 8,
//                 left: 8,
//                 background: "#2563eb",
//                 color: "#fff",
//                 fontSize: 10,
//                 fontWeight: 700,
//                 padding: "3px 8px",
//                 borderRadius: 6,
//               }}
//             >
//               MAIN IMAGE
//             </span>
//             <MainHoverOverlay
//               onView={() => setLightbox(true)}
//               onReplace={() => inputRef.current?.click()}
//               onRemove={handleRemove}
//             />
//           </>
//         ) : (
//           <div style={{ textAlign: "center", padding: 20 }}>
//             <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.25 }}>
//               🖼️
//             </div>
//             <div
//               style={{ fontSize: 13, fontWeight: 600, color: "var(--textMid)" }}
//             >
//               Click or drag image here
//             </div>
//             <div
//               style={{ fontSize: 11, color: "var(--textDim)", marginTop: 4 }}
//             >
//               JPEG, PNG, WebP
//             </div>
//           </div>
//         )}
//       </div>
//       {preview && (
//         <div style={{ display: "flex", gap: 8 }}>
//           <button
//             type="button"
//             onClick={() => inputRef.current?.click()}
//             style={{
//               flex: 1,
//               padding: "7px 0",
//               borderRadius: 8,
//               border: "1px solid #bfdbfe",
//               background: "#eff6ff",
//               color: "#2563eb",
//               fontSize: 12,
//               fontWeight: 600,
//               cursor: "pointer",
//             }}
//           >
//             Replace
//           </button>
//           <button
//             type="button"
//             onClick={handleRemove}
//             style={{
//               flex: 1,
//               padding: "7px 0",
//               borderRadius: 8,
//               border: "1px solid #fecaca",
//               background: "#fef2f2",
//               color: "#ef4444",
//               fontSize: 12,
//               fontWeight: 600,
//               cursor: "pointer",
//             }}
//           >
//             Remove
//           </button>
//         </div>
//       )}
//       <input
//         ref={inputRef}
//         type="file"
//         accept="image/*"
//         style={{ display: "none" }}
//         onChange={(e) => {
//           const f = e.target.files?.[0];
//           if (f) handleFile(f);
//           e.target.value = "";
//         }}
//       />
//       {lightbox && preview && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 999,
//             background: "rgba(0,0,0,.9)",
//             backdropFilter: "blur(6px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 20,
//           }}
//           onClick={() => setLightbox(false)}
//         >
//           <div
//             style={{ position: "relative", maxWidth: 560, width: "100%" }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <img
//               src={preview}
//               alt="Main"
//               style={{
//                 width: "100%",
//                 borderRadius: 14,
//                 objectFit: "contain",
//                 maxHeight: "80vh",
//               }}
//             />
//             <button
//               onClick={() => setLightbox(false)}
//               style={{
//                 position: "absolute",
//                 top: -14,
//                 right: -14,
//                 background: "white",
//                 borderRadius: "50%",
//                 border: "none",
//                 width: 30,
//                 height: 30,
//                 cursor: "pointer",
//                 fontWeight: 700,
//                 fontSize: 14,
//               }}
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function MainHoverOverlay({ onView, onReplace, onRemove }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <div
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{ position: "absolute", inset: 0 }}
//     >
//       {hov && (
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: "rgba(0,0,0,.4)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 8,
//           }}
//         >
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               onView();
//             }}
//             style={{
//               padding: "7px 12px",
//               borderRadius: 8,
//               background: "rgba(255,255,255,.9)",
//               border: "none",
//               cursor: "pointer",
//               fontSize: 13,
//               fontWeight: 600,
//               color: "#0f172a",
//             }}
//           >
//             View
//           </button>
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               onReplace();
//             }}
//             style={{
//               padding: "7px 12px",
//               borderRadius: 8,
//               background: "rgba(245,158,11,.9)",
//               border: "none",
//               cursor: "pointer",
//               fontSize: 13,
//               fontWeight: 600,
//               color: "white",
//             }}
//           >
//             Replace
//           </button>
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               onRemove();
//             }}
//             style={{
//               padding: "7px 12px",
//               borderRadius: 8,
//               background: "rgba(239,68,68,.9)",
//               border: "none",
//               cursor: "pointer",
//               fontSize: 13,
//               fontWeight: 600,
//               color: "white",
//             }}
//           >
//             Remove
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    GALLERY UPLOADER
// ══════════════════════════════════════════════════════════════ */
// function GalleryUploader({ galleryFiles, existingGalleryImages, onChange }) {
//   const idCounter = useRef(0);
//   const genId = () => `g_${++idCounter.current}`;

//   const initSlots = useCallback(() => {
//     const ex = (existingGalleryImages || []).map((url) => ({
//       id: genId(),
//       type: "existing",
//       url,
//       previewUrl: url,
//     }));
//     const nw = (galleryFiles || []).map((file) => ({
//       id: genId(),
//       type: "new",
//       file,
//       previewUrl: URL.createObjectURL(file),
//     }));
//     return [...ex, ...nw];
//     // eslint-disable-next-line
//   }, []);

//   const [slots, setSlots] = useState(initSlots);
//   const [lightbox, setLightbox] = useState(null);
//   const [lbIdx, setLbIdx] = useState(0);
//   const [dragOver, setDragOver] = useState(false);
//   const [draggingIdx, setDraggingIdx] = useState(null);
//   const [dragOverIdx, setDragOverIdx] = useState(null);
//   const replaceRefs = useRef({});
//   const addInputRef = useRef(null);

//   const propagate = useCallback(
//     (updated) => {
//       onChange(
//         updated.filter((s) => s.type === "new").map((s) => s.file),
//         updated.filter((s) => s.type === "existing").map((s) => s.url),
//       );
//     },
//     [onChange],
//   );

//   const totalCount = slots.length;
//   const remaining = MAX_GALLERY - totalCount;

//   const addFiles = (incoming) => {
//     const valid = Array.from(incoming)
//       .filter((f) => f.type.startsWith("image/"))
//       .slice(0, Math.max(0, remaining));
//     if (!valid.length) return;
//     const added = valid.map((file) => ({
//       id: genId(),
//       type: "new",
//       file,
//       previewUrl: URL.createObjectURL(file),
//     }));
//     const updated = [...slots, ...added];
//     setSlots(updated);
//     propagate(updated);
//   };

//   const removeSlot = (id) => {
//     const u = slots.filter((s) => s.id !== id);
//     setSlots(u);
//     propagate(u);
//   };
//   const replaceSlot = (id, file) => {
//     if (!file || !file.type.startsWith("image/")) return;
//     const u = slots.map((s) =>
//       s.id !== id
//         ? s
//         : {
//             id: s.id,
//             type: "new",
//             file,
//             previewUrl: URL.createObjectURL(file),
//           },
//     );
//     setSlots(u);
//     propagate(u);
//   };

//   const onDragStart = (e, idx) => {
//     setDraggingIdx(idx);
//     e.dataTransfer.effectAllowed = "move";
//   };
//   const onDragEnterSlot = (e, idx) => {
//     e.preventDefault();
//     setDragOverIdx(idx);
//   };
//   const onDragOverSlot = (e) => {
//     e.preventDefault();
//   };
//   const onDropSlot = (e, idx) => {
//     e.preventDefault();
//     if (draggingIdx === null || draggingIdx === idx) {
//       setDraggingIdx(null);
//       setDragOverIdx(null);
//       return;
//     }
//     const updated = [...slots];
//     const [moved] = updated.splice(draggingIdx, 1);
//     updated.splice(idx, 0, moved);
//     setSlots(updated);
//     propagate(updated);
//     setDraggingIdx(null);
//     setDragOverIdx(null);
//   };
//   const onDragEnd = () => {
//     setDraggingIdx(null);
//     setDragOverIdx(null);
//   };
//   const onDropZone = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     addFiles(e.dataTransfer.files);
//   };

//   const openLb = (idx) => {
//     setLbIdx(idx);
//     setLightbox(slots[idx]?.previewUrl);
//   };
//   const lbPrev = () => {
//     const i = (lbIdx - 1 + slots.length) % slots.length;
//     setLbIdx(i);
//     setLightbox(slots[i]?.previewUrl);
//   };
//   const lbNext = () => {
//     const i = (lbIdx + 1) % slots.length;
//     setLbIdx(i);
//     setLightbox(slots[i]?.previewUrl);
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(4, 1fr)",
//           gap: 10,
//         }}
//       >
//         {slots.map((slot, idx) => (
//           <div
//             key={slot.id}
//             draggable
//             onDragStart={(e) => onDragStart(e, idx)}
//             onDragEnter={(e) => onDragEnterSlot(e, idx)}
//             onDragOver={onDragOverSlot}
//             onDrop={(e) => onDropSlot(e, idx)}
//             onDragEnd={onDragEnd}
//             style={{
//               position: "relative",
//               aspectRatio: "1/1",
//               borderRadius: 10,
//               overflow: "visible",
//               border: `2px solid ${dragOverIdx === idx && draggingIdx !== idx ? "#2563eb" : slot.type === "existing" ? "#bfdbfe" : "#86efac"}`,
//               background: "#f9fafb",
//               opacity: draggingIdx === idx ? 0.35 : 1,
//               transform: draggingIdx === idx ? "scale(0.93)" : "scale(1)",
//               transition: "all .15s",
//             }}
//           >
//             <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 removeSlot(slot.id);
//               }}
//               style={{
//                 position: "absolute",
//                 top: -9,
//                 right: -9,
//                 zIndex: 30,
//                 width: 20,
//                 height: 20,
//                 borderRadius: "50%",
//                 background: "#ef4444",
//                 border: "2px solid white",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 cursor: "pointer",
//                 color: "white",
//                 fontSize: 10,
//                 fontWeight: 700,
//               }}
//             >
//               ✕
//             </button>
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 borderRadius: 8,
//                 overflow: "hidden",
//               }}
//             >
//               <img
//                 src={slot.previewUrl}
//                 alt={`gallery ${idx + 1}`}
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "cover",
//                   pointerEvents: "none",
//                 }}
//               />
//               <span
//                 style={{
//                   position: "absolute",
//                   bottom: 3,
//                   right: 4,
//                   fontSize: 8,
//                   fontWeight: 700,
//                   color: "white",
//                   background:
//                     slot.type === "existing"
//                       ? "rgba(0,0,0,.5)"
//                       : "rgba(22,163,74,.8)",
//                   padding: "1px 5px",
//                   borderRadius: 3,
//                   zIndex: 10,
//                 }}
//               >
//                 {slot.type === "existing" ? "Saved" : "New"}
//               </span>
//               <GalleryThumbOverlay
//                 onView={() => openLb(idx)}
//                 onReplace={() => replaceRefs.current[slot.id]?.click()}
//               />
//             </div>
//             <input
//               ref={(el) => {
//                 replaceRefs.current[slot.id] = el;
//               }}
//               type="file"
//               accept="image/*"
//               style={{ display: "none" }}
//               onChange={(e) => {
//                 const f = e.target.files?.[0];
//                 if (f) replaceSlot(slot.id, f);
//                 e.target.value = "";
//               }}
//             />
//           </div>
//         ))}
//         {Array.from({ length: Math.max(0, MAX_GALLERY - totalCount) }).map(
//           (_, idx) => (
//             <div
//               key={`empty-${idx}`}
//               onClick={() => remaining > 0 && addInputRef.current?.click()}
//               onDragOver={(e) => {
//                 e.preventDefault();
//                 setDragOver(true);
//               }}
//               onDragLeave={() => setDragOver(false)}
//               onDrop={onDropZone}
//               style={{
//                 aspectRatio: "1/1",
//                 borderRadius: 10,
//                 border: `2px dashed ${dragOver && idx === 0 ? "#2563eb" : "#d1d5db"}`,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 cursor: "pointer",
//                 background: dragOver && idx === 0 ? "#eff6ff" : "#f9fafb",
//                 transition: "all .2s",
//               }}
//             >
//               <div style={{ fontSize: 18, color: "#d1d5db" }}>+</div>
//             </div>
//           ),
//         )}
//       </div>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <button
//           type="button"
//           disabled={remaining === 0}
//           onClick={() => remaining > 0 && addInputRef.current?.click()}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 6,
//             padding: "7px 12px",
//             borderRadius: 8,
//             fontSize: 12,
//             fontWeight: 500,
//             border: `1px solid ${remaining === 0 ? "#e5e7eb" : "#bfdbfe"}`,
//             background: remaining === 0 ? "#f9fafb" : "#eff6ff",
//             color: remaining === 0 ? "#9ca3af" : "#2563eb",
//             cursor: remaining === 0 ? "not-allowed" : "pointer",
//           }}
//         >
//           {remaining === 0 ? "Max 4 reached" : `Add images (${remaining} left)`}
//         </button>
//         <span style={{ fontSize: 10, color: "#9ca3af" }}>
//           {totalCount}/{MAX_GALLERY} · Drag to reorder
//         </span>
//       </div>
//       <input
//         ref={addInputRef}
//         type="file"
//         accept="image/*"
//         multiple
//         style={{ display: "none" }}
//         onChange={(e) => {
//           addFiles(e.target.files);
//           e.target.value = "";
//         }}
//       />
//       {lightbox && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 999,
//             background: "rgba(0,0,0,.9)",
//             backdropFilter: "blur(6px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//           onClick={() => setLightbox(null)}
//         >
//           <div
//             style={{ position: "relative", maxWidth: 560, width: "100%" }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {slots.length > 1 && (
//               <div
//                 style={{
//                   display: "flex",
//                   gap: 6,
//                   justifyContent: "center",
//                   marginBottom: 10,
//                 }}
//               >
//                 {slots.map((s, i) => (
//                   <button
//                     key={s.id}
//                     onClick={() => {
//                       setLbIdx(i);
//                       setLightbox(s.previewUrl);
//                     }}
//                     style={{
//                       width: 44,
//                       height: 44,
//                       borderRadius: 8,
//                       overflow: "hidden",
//                       border: `2px solid ${lbIdx === i ? "white" : "rgba(255,255,255,.3)"}`,
//                       opacity: lbIdx === i ? 1 : 0.55,
//                       cursor: "pointer",
//                       padding: 0,
//                     }}
//                   >
//                     <img
//                       src={s.previewUrl}
//                       alt=""
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                       }}
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//             <img
//               src={lightbox}
//               alt="Gallery"
//               style={{
//                 width: "100%",
//                 borderRadius: 14,
//                 objectFit: "contain",
//                 maxHeight: "72vh",
//               }}
//             />
//             {slots.length > 1 && (
//               <>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     lbPrev();
//                   }}
//                   style={{
//                     position: "absolute",
//                     top: "55%",
//                     left: -44,
//                     transform: "translateY(-50%)",
//                     background: "rgba(255,255,255,.15)",
//                     border: "1px solid rgba(255,255,255,.3)",
//                     borderRadius: 8,
//                     width: 36,
//                     height: 36,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     cursor: "pointer",
//                     color: "white",
//                     fontSize: 18,
//                   }}
//                 >
//                   ‹
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     lbNext();
//                   }}
//                   style={{
//                     position: "absolute",
//                     top: "55%",
//                     right: -44,
//                     transform: "translateY(-50%)",
//                     background: "rgba(255,255,255,.15)",
//                     border: "1px solid rgba(255,255,255,.3)",
//                     borderRadius: 8,
//                     width: 36,
//                     height: 36,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     cursor: "pointer",
//                     color: "white",
//                     fontSize: 18,
//                   }}
//                 >
//                   ›
//                 </button>
//               </>
//             )}
//             <button
//               onClick={() => setLightbox(null)}
//               style={{
//                 position: "absolute",
//                 top: -14,
//                 right: -14,
//                 background: "white",
//                 borderRadius: "50%",
//                 border: "none",
//                 width: 30,
//                 height: 30,
//                 cursor: "pointer",
//                 fontWeight: 700,
//                 fontSize: 14,
//               }}
//             >
//               ✕
//             </button>
//             <div
//               style={{
//                 textAlign: "center",
//                 marginTop: 8,
//                 color: "rgba(255,255,255,.5)",
//                 fontSize: 12,
//               }}
//             >
//               {lbIdx + 1} / {slots.length}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function GalleryThumbOverlay({ onView, onReplace }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <div
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{ position: "absolute", inset: 0 }}
//     >
//       {hov && (
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: "rgba(0,0,0,.4)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 6,
//             zIndex: 20,
//           }}
//         >
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               onView();
//             }}
//             style={{
//               padding: 6,
//               borderRadius: 8,
//               background: "rgba(255,255,255,.85)",
//               border: "none",
//               cursor: "pointer",
//               fontSize: 12,
//             }}
//           >
//             🔍
//           </button>
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               onReplace();
//             }}
//             style={{
//               padding: 6,
//               borderRadius: 8,
//               background: "rgba(245,158,11,.85)",
//               border: "none",
//               cursor: "pointer",
//               fontSize: 12,
//             }}
//           >
//             🔄
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    TABLE IMAGE CELL
// ══════════════════════════════════════════════════════════════ */
// function ProductImageCell({ image, galleryImages, name }) {
//   const [lightbox, setLightbox] = useState(null);
//   const [lbIdx, setLbIdx] = useState(0);
//   const gallery = galleryImages || [];
//   const allImgs = [image, ...gallery].filter(Boolean);

//   const prev = () => {
//     const i = (lbIdx - 1 + allImgs.length) % allImgs.length;
//     setLbIdx(i);
//     setLightbox(allImgs[i]);
//   };
//   const next = () => {
//     const i = (lbIdx + 1) % allImgs.length;
//     setLbIdx(i);
//     setLightbox(allImgs[i]);
//   };

//   return (
//     <>
//       <div
//         style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
//       >
//         {image ? (
//           <button
//             type="button"
//             onClick={() => {
//               setLbIdx(0);
//               setLightbox(image);
//             }}
//             style={{
//               width: 44,
//               height: 44,
//               borderRadius: 8,
//               overflow: "hidden",
//               border: "2px solid #2563eb",
//               flexShrink: 0,
//               cursor: "pointer",
//               position: "relative",
//             }}
//           >
//             <img
//               src={image}
//               alt={name}
//               style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             />
//             <span
//               style={{
//                 position: "absolute",
//                 bottom: 0,
//                 left: 0,
//                 right: 0,
//                 background: "rgba(37,99,235,.75)",
//                 color: "white",
//                 fontSize: 7,
//                 fontWeight: 700,
//                 textAlign: "center",
//                 padding: "1px 0",
//               }}
//             >
//               MAIN
//             </span>
//           </button>
//         ) : (
//           <div
//             style={{
//               width: 44,
//               height: 44,
//               borderRadius: 8,
//               background: "#f3f4f6",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 18,
//               flexShrink: 0,
//             }}
//           >
//             🛒
//           </div>
//         )}
//         {gallery.slice(0, 3).map((url, idx) => (
//           <button
//             key={idx}
//             type="button"
//             onClick={() => {
//               setLbIdx(idx + 1);
//               setLightbox(url);
//             }}
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: 7,
//               overflow: "hidden",
//               border: "2px solid #86efac",
//               flexShrink: 0,
//               cursor: "pointer",
//               marginLeft: -4,
//               zIndex: 5 - idx,
//             }}
//           >
//             <img
//               src={url}
//               alt={`g${idx + 1}`}
//               style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             />
//           </button>
//         ))}
//         {gallery.length > 3 && (
//           <button
//             type="button"
//             onClick={() => {
//               setLbIdx(4);
//               setLightbox(gallery[3]);
//             }}
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: 7,
//               border: "2px solid #a3e635",
//               background: "#4ade80",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "white",
//               fontSize: 10,
//               fontWeight: 700,
//               marginLeft: -4,
//               cursor: "pointer",
//               flexShrink: 0,
//             }}
//           >
//             +{gallery.length - 3}
//           </button>
//         )}
//       </div>
//       {lightbox && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 999,
//             background: "rgba(0,0,0,.9)",
//             backdropFilter: "blur(6px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: 16,
//           }}
//           onClick={() => setLightbox(null)}
//         >
//           <div
//             style={{ position: "relative", maxWidth: 520, width: "100%" }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {allImgs.length > 1 && (
//               <div
//                 style={{
//                   display: "flex",
//                   gap: 6,
//                   justifyContent: "center",
//                   marginBottom: 10,
//                 }}
//               >
//                 {allImgs.map((url, i) => (
//                   <button
//                     key={i}
//                     onClick={() => {
//                       setLbIdx(i);
//                       setLightbox(url);
//                     }}
//                     style={{
//                       width: 40,
//                       height: 40,
//                       borderRadius: 7,
//                       overflow: "hidden",
//                       border: `2px solid ${lbIdx === i ? "white" : "rgba(255,255,255,.3)"}`,
//                       opacity: lbIdx === i ? 1 : 0.5,
//                       cursor: "pointer",
//                       padding: 0,
//                     }}
//                   >
//                     <img
//                       src={url}
//                       alt=""
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                       }}
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//             <img
//               src={lightbox}
//               alt="Preview"
//               style={{
//                 width: "100%",
//                 borderRadius: 14,
//                 objectFit: "contain",
//                 maxHeight: "70vh",
//               }}
//             />
//             {allImgs.length > 1 && (
//               <>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     prev();
//                   }}
//                   style={{
//                     position: "absolute",
//                     top: "55%",
//                     left: -44,
//                     transform: "translateY(-50%)",
//                     background: "rgba(255,255,255,.15)",
//                     border: "1px solid rgba(255,255,255,.3)",
//                     borderRadius: 8,
//                     width: 36,
//                     height: 36,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     cursor: "pointer",
//                     color: "white",
//                     fontSize: 18,
//                   }}
//                 >
//                   ‹
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     next();
//                   }}
//                   style={{
//                     position: "absolute",
//                     top: "55%",
//                     right: -44,
//                     transform: "translateY(-50%)",
//                     background: "rgba(255,255,255,.15)",
//                     border: "1px solid rgba(255,255,255,.3)",
//                     borderRadius: 8,
//                     width: 36,
//                     height: 36,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     cursor: "pointer",
//                     color: "white",
//                     fontSize: 18,
//                   }}
//                 >
//                   ›
//                 </button>
//               </>
//             )}
//             <button
//               onClick={() => setLightbox(null)}
//               style={{
//                 position: "absolute",
//                 top: -14,
//                 right: -14,
//                 background: "white",
//                 borderRadius: "50%",
//                 border: "none",
//                 width: 30,
//                 height: 30,
//                 cursor: "pointer",
//                 fontWeight: 700,
//                 fontSize: 14,
//               }}
//             >
//               ✕
//             </button>
//             <div
//               style={{
//                 textAlign: "center",
//                 marginTop: 8,
//                 color: "rgba(255,255,255,.5)",
//                 fontSize: 12,
//               }}
//             >
//               {lbIdx + 1} / {allImgs.length}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════════════════════ */
// export default function VendorProducts() {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [subSubCats, setSubSubCats] = useState([]);
//   const [hsnCodes, setHsnCodes] = useState([]);
//   const [hsnCategories, setHsnCategories] = useState([]);
//   const [allBulkRules, setAllBulkRules] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [form, setForm] = useState(EMPTY);
//   const [editId, setEditId] = useState(null);
//   console.log("editID:", editId);

//   const [copyMode, setCopyMode] = useState(false);
//   const [drawer, setDrawer] = useState(false);
//   const [uploaderKey, setUploaderKey] = useState("new");
//   const [toast, setToast] = useState(null);
//   const [deleteId, setDeleteId] = useState(null);
//   const [page, setPage] = useState(1);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [bulkMode, setBulkMode] = useState(false);
//   const [filterCategory, setFilterCategory] = useState("");
//   const [filterSubcategory, setFilterSubcategory] = useState("");
//   const [filterSubSubCat, setFilterSubSubCat] = useState("");
//   const [filterSubs, setFilterSubs] = useState([]);
//   const [filterSubSubs, setFilterSubSubs] = useState([]);
//   const [filterStatus, setFilterStatus] = useState("");
//   const [showAddHsn, setShowAddHsn] = useState(false);

//   const [tempBulkRules, setTempBulkRules] = useState([]);
//   const tempBulkRulesRef = useRef([]);

//   const limit = 25;

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//     fetchHsnCodes();
//     fetchAllBulkRules();
//   }, []);

//   useEffect(() => {
//     if (!form.category) {
//       setSubcategories([]);
//       setSubSubCats([]);
//       return;
//     }
//     const cat = categories.find((c) => c._id === form.category);
//     setSubcategories(cat?.subcategories || []);
//     setSubSubCats([]);
//     setForm((p) => ({ ...p, subcategory: "", subSubCategory: "" }));
//   }, [form.category]); // eslint-disable-line

//   useEffect(() => {
//     if (!form.subcategory) {
//       setSubSubCats([]);
//       return;
//     }
//     const cat = categories.find((c) => c._id === form.category);
//     const sub = cat?.subcategories?.find((s) => s._id === form.subcategory);
//     setSubSubCats(sub?.subSubCategories || []);
//     setForm((p) => ({ ...p, subSubCategory: "" }));
//   }, [form.subcategory]); // eslint-disable-line

//   useEffect(() => {
//     if (!filterCategory) {
//       setFilterSubs([]);
//       setFilterSubSubs([]);
//       setFilterSubcategory("");
//       setFilterSubSubCat("");
//       return;
//     }
//     const cat = categories.find((c) => c._id === filterCategory);
//     setFilterSubs(cat?.subcategories || []);
//     setFilterSubcategory("");
//     setFilterSubSubCat("");
//     setFilterSubSubs([]);
//   }, [filterCategory]); // eslint-disable-line

//   useEffect(() => {
//     if (!filterSubcategory) {
//       setFilterSubSubs([]);
//       setFilterSubSubCat("");
//       return;
//     }
//     const cat = categories.find((c) => c._id === filterCategory);
//     const sub = cat?.subcategories?.find((s) => s._id === filterSubcategory);
//     setFilterSubSubs(sub?.subSubCategories || []);
//     setFilterSubSubCat("");
//   }, [filterSubcategory]); // eslint-disable-line

//   useEffect(() => {
//     const base = Number(form.basePrice) || 0;
//     const profit = Number(form.profit) || 0;
//     if (base > 0 && !form._manualSale) {
//       setForm((p) => ({ ...p, salePrice: String(base + profit) }));
//     }
//   }, [form.basePrice, form.profit]); // eslint-disable-line

//   const notify = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3200);
//   };

//   const handleTempBulkChange = useCallback((rules) => {
//     setTempBulkRules(rules);
//     tempBulkRulesRef.current = rules;
//   }, []);

//   const fetchAllBulkRules = async () => {
//     try {
//       const res = await axiosAuth.get(`${BULK_API_URL}/my`);
//       setAllBulkRules(res.data?.data || []);
//     } catch (err) {
//       console.error("Bulk fetch error:", err);
//     }
//   };

//   const fetchHsnCodes = async () => {
//     try {
//       const res = await axiosAuth.get(HSN_API_URL);
//       if (res.data?.success) {
//         setHsnCodes(res.data.data || []);
//         setHsnCategories(res.data.categories || []);
//       }
//     } catch (err) {
//       console.error("fetchHsnCodes:", err);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const res = await axiosAuth.get(CATEGORY_URL);
//       if (res.data?.success) setCategories(res.data.categories || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosAuth.get(API_URL);
//       if (res.data?.success) setProducts(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({
//       ...p,
//       [name]: value,
//       ...(name === "salePrice" ? { _manualSale: true } : {}),
//     }));
//   };

//   const handleMainImageChange = useCallback(({ file, existingUrl }) => {
//     setForm((p) => ({
//       ...p,
//       mainImageFile: file,
//       existingMainImage: existingUrl,
//     }));
//   }, []);

//   const handleGalleryChange = useCallback((newFiles, existingUrls) => {
//     setForm((p) => ({
//       ...p,
//       galleryFiles: newFiles,
//       existingGalleryImages: existingUrls,
//     }));
//   }, []);

//   const handleHsnSelect = (hsnObj) => {
//     if (!hsnObj) setForm((p) => ({ ...p, hsnCode: "", gstPercent: "" }));
//     else
//       setForm((p) => ({
//         ...p,
//         hsnCode: hsnObj.code,
//         gstPercent: String(hsnObj.gst),
//       }));
//   };

//   const handleHsnAdded = (newHsn) => {
//     setHsnCodes((prev) => [...prev, newHsn]);
//     setHsnCategories((prev) =>
//       prev.includes(newHsn.category) ? prev : [...prev, newHsn.category],
//     );
//     handleHsnSelect(newHsn);
//     notify("HSN code added!");
//   };

//   const resetForm = () => {
//     setForm(EMPTY);
//     setEditId(null);
//     setCopyMode(false);
//     setDrawer(false);
//     setSubcategories([]);
//     setSubSubCats([]);
//     setUploaderKey(Date.now().toString());
//     setTempBulkRules([]);
//     tempBulkRulesRef.current = [];
//   };

//   const buildFD = () => {
//     const fd = new FormData();
//     fd.append("name", form.name.trim());
//     fd.append("brand", form.brand.trim());
//     fd.append("category", form.category);
//     fd.append("status", form.status);
//     fd.append("basePrice", form.basePrice);
//     fd.append("profit", form.profit || 0);
//     if (form.salePrice) fd.append("salePrice", form.salePrice);
//     fd.append(
//       "weight",
//       JSON.stringify({
//         value: Math.max(1, Number(form.weightValue) || 1),
//         unit: form.weightUnit || "kg",
//       }),
//     );
//     fd.append("gstPercent", form.gstPercent || 0);
//     fd.append("hsnCode", form.hsnCode || "");
//     fd.append("taxType", form.taxType || "cgst_sgst");
//     if (form.validTill) fd.append("validTill", form.validTill);
//     if (form.description) fd.append("description", form.description);

//     if (form.subcategory) {
//       const sub = subcategories.find((s) => s._id === form.subcategory);
//       if (sub)
//         fd.append(
//           "subcategory",
//           JSON.stringify({
//             id: sub._id,
//             name: sub.name,
//             image: sub.image || null,
//           }),
//         );
//     } else {
//       fd.append("subcategory", "");
//     }

//     if (form.subSubCategory) {
//       const ss = subSubCats.find((s) => s._id === form.subSubCategory);
//       if (ss)
//         fd.append(
//           "subSubCategory",
//           JSON.stringify({
//             id: ss._id,
//             name: ss.name,
//             image: ss.image || null,
//           }),
//         );
//     } else {
//       fd.append("subSubCategory", "");
//     }

//     if (form.mainImageFile) {
//       fd.append("mainImage", form.mainImageFile);
//     } else {
//       fd.append("existingMainImage", form.existingMainImage || "");
//     }

//     (form.galleryFiles || []).forEach((f) => fd.append("galleryImages", f));
//     fd.append(
//       "existingGalleryImages",
//       JSON.stringify(form.existingGalleryImages || []),
//     );

//     return fd;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.name || !form.category || !form.basePrice) {
//       notify("Name, category aur base price required hain", "error");
//       return;
//     }

//     const nameExists = products.some(
//       (p) =>
//         p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
//         p._id !== editId,
//     );

//     if (nameExists) {
//       notify("Yeh product name already exist karta hai!", "error");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const fd = buildFD();
//       let newProductId = null;

//       if (editId && !copyMode) {
//         await axiosAuth.put(`${API_URL}/${editId}`, fd);
//         newProductId = editId;
//         notify("Product updated!");
//       } else {
//         const res = await axiosAuth.post(API_URL, fd);
//         const createdProduct = res?.data?.data;
//         newProductId = createdProduct?._id;
//         if (!newProductId) {
//           notify("Product ID nahi mila", "error");
//           return;
//         }
//         notify(copyMode ? "Copy saved!" : "Product added!");
//       }

//       // Temp bulk rules save karo
//       const validRules = (tempBulkRulesRef.current || []).filter(
//         (r) => Number(r.minQty) > 0 && Number(r.unitPrice) > 0,
//       );

//       if (validRules.length > 0 && newProductId) {
//         try {
//           await Promise.all(
//             validRules.map((rule) =>
//               axiosAuth.post(`${BULK_API_URL}/add`, {
//                 product: newProductId,
//                 minQty: Number(rule.minQty),
//                 maxQty: rule.maxQty ? Number(rule.maxQty) : null,
//                 unitPrice: Number(rule.unitPrice),
//               }),
//             ),
//           );
//           notify(`Product + ${validRules.length} bulk tier(s) saved!`);
//         } catch (bulkErr) {
//           console.error(
//             "Bulk rules save failed:",
//             bulkErr?.response?.data || bulkErr.message,
//           );
//           notify(
//             "Product saved! Bulk tiers save nahi ho sake — edit se try karo.",
//             "error",
//           );
//         }
//       }

//       await fetchProducts();
//       await fetchAllBulkRules();
//       resetForm();
//     } catch (err) {
//       console.error("Submit Error:", err);
//       notify(err.response?.data?.message || "Kuch galat ho gaya", "error");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (p) => {
//     const catId = p.category?._id || p.category;
//     const cat = categories.find((c) => c._id === catId);
//     const subs = cat?.subcategories || [];
//     const sub = subs.find((s) => s._id === p.subcategory?.id);
//     setSubcategories(subs);
//     setSubSubCats(sub?.subSubCategories || []);
//     setForm({
//       name: p.name || "",
//       brand: p.brand || "",
//       category: catId || "",
//       subcategory: p.subcategory?.id || "",
//       subSubCategory: p.subSubCategory?.id || "",
//       description: p.description || "",
//       basePrice: p.basePrice || "",
//       salePrice: p.salePrice || "",
//       profit: p.profit || "",
//       weightValue: p.weight?.value || "",
//       weightUnit: p.weight?.unit || "kg",
//       status: p.status || "inactive",
//       gstPercent: p.gstPercent !== undefined ? String(p.gstPercent) : "",
//       hsnCode: p.hsnCode || "",
//       taxType: p.taxType || "cgst_sgst",
//       validTill: p.validTill ? p.validTill.split("T")[0] : "",
//       mainImageFile: null,
//       existingMainImage: p.image || "",
//       galleryFiles: [],
//       existingGalleryImages: p.galleryImages || [],
//       _manualSale: true,
//     });
//     setEditId(p._id);
//     setCopyMode(false);
//     setUploaderKey(p._id);
//     setTempBulkRules([]);
//     tempBulkRulesRef.current = [];
//     setDrawer(true);
//   };

//   const handleCopy = (p) => {
//     const catId = p.category?._id || p.category;
//     const cat = categories.find((c) => c._id === catId);
//     const subs = cat?.subcategories || [];
//     const sub = subs.find((s) => s._id === p.subcategory?.id);
//     setSubcategories(subs);
//     setSubSubCats(sub?.subSubCategories || []);
//     setForm({
//       name: `${p.name} (Copy)`,
//       brand: p.brand || "",
//       category: catId || "",
//       subcategory: p.subcategory?.id || "",
//       subSubCategory: p.subSubCategory?.id || "",
//       description: p.description || "",
//       basePrice: p.basePrice || "",
//       salePrice: p.salePrice || "",
//       profit: p.profit || "",
//       weightValue: p.weight?.value || "",
//       weightUnit: p.weight?.unit || "kg",
//       status: "inactive",
//       gstPercent: p.gstPercent !== undefined ? String(p.gstPercent) : "",
//       hsnCode: p.hsnCode || "",
//       taxType: p.taxType || "cgst_sgst",
//       validTill: p.validTill ? p.validTill.split("T")[0] : "",
//       mainImageFile: null,
//       existingMainImage: p.image || "",
//       galleryFiles: [],
//       existingGalleryImages: p.galleryImages || [],
//       _manualSale: true,
//     });
//     setEditId(null);
//     setCopyMode(true);
//     setUploaderKey(`copy-${p._id}-${Date.now()}`);
//     setTempBulkRules([]);
//     tempBulkRulesRef.current = [];
//     setDrawer(true);
//   };

//   const handleDelete = async () => {
//     try {
//       await axiosAuth.delete(`${API_URL}/${deleteId}`);
//       fetchProducts();
//       notify("Product deleted.");
//     } catch {
//       notify("Delete failed.", "error");
//     } finally {
//       setDeleteId(null);
//     }
//   };

//   const handleStatusToggle = async (item) => {
//     try {
//       const newStatus = item.status === "active" ? "inactive" : "active";
//       await axiosAuth.put(`${API_URL}/status/${item._id}`, {
//         status: newStatus,
//       });
//       setProducts((prev) =>
//         prev.map((x) => (x._id === item._id ? { ...x, status: newStatus } : x)),
//       );
//     } catch {
//       notify("Status update failed.", "error");
//     }
//   };

//   const handleInlineBasePrice = async (productId, newBase) => {
//     try {
//       const item = products.find((x) => x._id === productId);
//       if (!item) return;
//       const profit = Number(item.profit) || 0;
//       const salePrice = newBase + profit;
//       const discount = newBase > salePrice ? newBase - salePrice : 0;
//       await axiosAuth.post(`${API_URL}/bulk-update`, {
//         products: [
//           { id: productId, basePrice: newBase, salePrice, profit, discount },
//         ],
//       });
//       setProducts((prev) =>
//         prev.map((x) =>
//           x._id === productId
//             ? { ...x, basePrice: newBase, salePrice, discount }
//             : x,
//         ),
//       );
//       notify("Base price updated!");
//     } catch {
//       notify("Price update failed.", "error");
//     }
//   };

//   const updateLocal = (id, key, val) =>
//     setProducts((prev) =>
//       prev.map((x) => (x._id === id ? { ...x, [key]: val } : x)),
//     );

//   const handleBulkSave = async () => {
//     if (!selectedItems.length) return notify("Koi item select nahi", "error");
//     const updates = products
//       .filter((x) => selectedItems.includes(x._id))
//       .map((x) => ({
//         id: x._id,
//         basePrice: Number(x.basePrice),
//         salePrice: Number(x.salePrice),
//         profit: Number(x.profit || 0),
//         gstPercent: Number(x.gstPercent || 0),
//         hsnCode: x.hsnCode || "",
//         taxType: x.taxType || "cgst_sgst",
//         brand: x.brand || "",
//         status: x.status,
//       }));
//     try {
//       await axiosAuth.post(`${API_URL}/bulk-update`, { products: updates });
//       notify("Bulk save done!");
//       setBulkMode(false);
//       setSelectedItems([]);
//       fetchProducts();
//     } catch {
//       notify("Bulk save failed.", "error");
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (!selectedItems.length) return notify("Koi item select nahi", "error");
//     if (!window.confirm("Selected products delete karein?")) return;
//     try {
//       await axiosAuth.post(`${API_URL}/delete-selected`, {
//         ids: selectedItems,
//       });
//       setSelectedItems([]);
//       setBulkMode(false);
//       fetchProducts();
//       notify("Selected deleted.");
//     } catch {
//       notify("Bulk delete failed.", "error");
//     }
//   };

//   const handleBulkCopy = async () => {
//     for (const id of selectedItems)
//       await axiosAuth.post(`${API_URL}/copy/${id}`);
//     fetchProducts();
//     notify("Copied.");
//   };

//   const handleExportSelected = async () => {
//     if (!selectedItems.length) return notify("Koi item select nahi", "error");
//     try {
//       const res = await axiosAuth.post(
//         `${API_URL}/export-selected`,
//         { ids: selectedItems },
//         { responseType: "blob" },
//       );
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "selected_products.csv";
//       a.click();
//     } catch {
//       notify("Export failed.", "error");
//     }
//   };

//   const filtered = products.filter((p) => {
//     const t = search.toLowerCase();
//     const matchText =
//       (p.name || "").toLowerCase().includes(t) ||
//       (p.brand || "").toLowerCase().includes(t) ||
//       (p.category?.name || "").toLowerCase().includes(t) ||
//       (p.hsnCode || "").toLowerCase().includes(t);
//     const matchCat =
//       !filterCategory || (p.category?._id || p.category) === filterCategory;
//     const matchSub =
//       !filterSubcategory || p.subcategory?.id === filterSubcategory;
//     const matchSubSub =
//       !filterSubSubCat || p.subSubCategory?.id === filterSubSubCat;
//     const matchStatus = !filterStatus || p.status === filterStatus;
//     return matchText && matchCat && matchSub && matchSubSub && matchStatus;
//   });

//   const start = (page - 1) * limit;
//   const paginated = filtered.slice(start, start + limit);
//   const totalPages = Math.ceil(filtered.length / limit);

//   const discountPct = (p) =>
//     p.basePrice && p.salePrice < p.basePrice
//       ? Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100)
//       : 0;

//   const previewBase = Number(form.basePrice) || 0;
//   const previewProfit = Number(form.profit) || 0;
//   const previewSale = form._manualSale
//     ? Number(form.salePrice)
//     : previewBase + previewProfit;
//   const showDisc =
//     previewBase > 0 && previewSale > 0 && previewSale > previewBase;

//   const hsnCss = {
//     hsnBtn: "hsn-btn",
//     hsnBtnOpen: "hsn-btn-open",
//     hsnCode: "hsn-code",
//     hsnDesc: "hsn-desc",
//     hsnPlaceholder: "hsn-placeholder",
//     hsnClear: "hsn-clear",
//     gstBadge: "gst-badge",
//     hsnDropdown: "hsn-dropdown",
//     hsnSearch: "hsn-search",
//     hsnCatBar: "hsn-cat-bar",
//     hsnCatPill: "hsn-cat-pill",
//     hsnCatPillActive: "hsn-cat-pill-active",
//     hsnList: "hsn-list",
//     hsnEmpty: "hsn-empty",
//     hsnItem: "hsn-item",
//     hsnItemSelected: "hsn-item-selected",
//     hsnItemHigh: "hsn-item-high",
//     hsnItemCode: "hsn-item-code",
//     hsnItemCodeSel: "hsn-item-code-sel",
//     hsnItemDesc: "hsn-item-desc",
//     hsnItemCat: "hsn-item-cat",
//     hsnFooter: "hsn-footer",
//   };

//   const css = `
//     @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
//     :root{
//       --bg:#f4f6fb;--white:#fff;--border:#e4e7ef;--border2:#cdd1de;
//       --text:#0f172a;--textMid:#64748b;--textDim:#94a3b8;
//       --blue:#2563eb;--blueFade:#eff6ff;--blueHov:#1d4ed8;
//       --red:#ef4444;--redFade:#fef2f2;
//       --green:#16a34a;--greenFade:#f0fdf4;
//       --amber:#d97706;--amberFade:#fffbeb;
//       --purple:#7c3aed;--purpleFade:#f5f3ff;
//       --orange:#ea580c;--orangeFade:#fff7ed;
//       --teal:#0d9488;--tealFade:#f0fdfa;
//       --shadow:0 1px 3px rgba(0,0,0,.07);
//       --shadowMd:0 4px 16px rgba(0,0,0,.09);
//       --shadowLg:0 16px 48px rgba(0,0,0,.14);
//       --r:10px;
//     }
//     *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
//     .vp{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);min-height:100vh;color:var(--text)}
//     .vp-topbar{background:var(--white);border-bottom:1px solid var(--border);height:58px;padding:0 28px;display:flex;align-items:center;position:sticky;top:0;z-index:50}
//     .vp-topbar-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:15px}
//     .vp-topbar-name{font-size:15px;font-weight:700;letter-spacing:-.3px;margin-left:9px}
//     .vp-topbar-sep{width:1px;height:16px;background:var(--border);margin:0 10px}
//     .vp-topbar-page{font-size:13px;color:var(--textMid)}
//     .vp-body{padding:24px 28px 64px;max-width:1400px}
//     .vp-page-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
//     .vp-page-header h1{font-size:20px;font-weight:700;letter-spacing:-.4px}
//     .vp-page-header p{font-size:13px;color:var(--textMid);margin-top:4px}
//     .vp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
//     .vp-stat{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;box-shadow:var(--shadow);display:flex;align-items:center;gap:14px;transition:box-shadow .2s}
//     .vp-stat:hover{box-shadow:var(--shadowMd)}
//     .vp-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
//     .vp-stat-val{font-size:22px;font-weight:700;letter-spacing:-.5px;line-height:1}
//     .vp-stat-lbl{font-size:11.5px;color:var(--textMid);font-weight:500;margin-top:3px}
//     .vp-card{background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
//     .vp-toolbar{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
//     .vp-toolbar-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0;flex-wrap:wrap}
//     .vp-search-wrap{position:relative}
//     .vp-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--textDim);font-size:14px;pointer-events:none}
//     .vp-search{padding:8px 12px 8px 32px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);background:var(--bg);outline:none;width:200px;transition:border-color .2s,box-shadow .2s}
//     .vp-search:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1);background:var(--white)}
//     .vp-sel-filter{padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);background:var(--bg);outline:none}
//     .vp-results-badge{padding:3px 9px;border-radius:20px;border:1px solid var(--border);font-size:11.5px;font-weight:600;color:var(--textMid);background:var(--bg)}
//     .btn-primary{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--blue);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
//     .btn-primary:hover:not(:disabled){background:var(--blueHov);box-shadow:0 4px 14px rgba(37,99,235,.35);transform:translateY(-1px)}
//     .btn-primary:disabled{opacity:.55;cursor:not-allowed}
//     .btn-copy{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--orangeFade);border:1.5px solid #fed7aa;border-radius:8px;color:var(--orange);font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
//     .btn-copy:hover:not(:disabled){background:var(--orange);color:#fff;box-shadow:0 4px 14px rgba(234,88,12,.3);transform:translateY(-1px)}
//     .btn-copy:disabled{opacity:.55;cursor:not-allowed}
//     .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--textMid);font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
//     .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--bg)}
//     .btn-danger-sm{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;background:var(--redFade);border:1px solid #fecaca;border-radius:8px;color:var(--red);font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
//     .btn-danger-sm:hover{background:var(--red);color:#fff}
//     .btn-icon{width:32px;height:32px;border-radius:7px;border:1px solid var(--border);background:var(--white);color:var(--textMid);font-size:13px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;flex-shrink:0}
//     .btn-edit:hover{border-color:var(--blue);color:var(--blue);background:var(--blueFade)}
//     .btn-copy-icon:hover{border-color:var(--orange);color:var(--orange);background:var(--orangeFade)}
//     .btn-del:hover{border-color:var(--red);color:var(--red);background:var(--redFade)}
//     .copy-mode-banner{display:flex;align-items:center;gap:10px;padding:10px 14px;background:linear-gradient(135deg,#fff7ed,#ffedd5);border:1.5px solid #fed7aa;border-radius:10px;margin-bottom:16px}
//     .copy-mode-badge{padding:3px 9px;background:var(--orange);color:#fff;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.3px;flex-shrink:0}
//     .vp-bulk-bar{background:#eef2ff;border:1px solid #dbeafe;border-radius:10px;padding:14px 18px;margin-bottom:14px}
//     .vp-bulk-panel{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px}
//     .vp-bulk-title{font-size:15px;font-weight:700;margin-bottom:14px}
//     .vp-bulk-item{background:#f8faff;border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px}
//     .vp-bulk-item-name{font-size:13px;font-weight:700;margin-bottom:10px}
//     .vp-bulk-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
//     .vp-table-wrap{overflow-x:auto}
//     .vp-table{width:100%;border-collapse:collapse;min-width:1200px}
//     .vp-table thead tr{border-bottom:1px solid var(--border);background:#f8f9fc}
//     .vp-table th{padding:10px 12px;text-align:left;white-space:nowrap;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--textMid)}
//     .vp-table tbody tr{border-bottom:1px solid var(--border);transition:background .12s}
//     .vp-table tbody tr:last-child{border-bottom:none}
//     .vp-table tbody tr:hover{background:#f8faff}
//     .vp-table td{padding:11px 12px;font-size:13px;vertical-align:middle}
//     .vp-prod-cell{display:flex;align-items:center;gap:11px}
//     .vp-prod-name{font-weight:600;font-size:13px;line-height:1.3}
//     .vp-prod-brand{font-size:11.5px;color:var(--blue);font-weight:500;margin-top:2px}
//     .vp-prod-desc{font-size:11.5px;color:var(--textMid);margin-top:1px;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
//     .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.2px;white-space:nowrap}
//     .badge-blue{background:var(--blueFade);color:var(--blue);border:1px solid #bfdbfe}
//     .badge-indigo{background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe}
//     .badge-purple{background:var(--purpleFade);color:var(--purple);border:1px solid #ddd6fe}
//     .badge-green{background:var(--greenFade);color:var(--green);border:1px solid #bbf7d0}
//     .badge-amber{background:var(--amberFade);color:var(--amber);border:1px solid #fde68a}
//     .badge-gray{background:var(--bg);color:var(--textMid);border:1px solid var(--border)}
//     .status-btn{padding:5px 11px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;border:none;transition:all .2s}
//     .status-active{background:#d1fae5;color:#065f46;border:1px solid #bbf7d0}
//     .status-inactive{background:#fee2e2;color:#991b1b;border:1px solid #fecaca}
//     .vp-sale-price{font-weight:700;font-size:13.5px}
//     .vp-base-price{font-size:11.5px;color:var(--textDim);text-decoration:line-through;margin-top:1px}
//     .vp-empty{padding:64px 20px;text-align:center}
//     .vp-empty-icon{font-size:40px;margin-bottom:12px;opacity:.25}
//     .vp-empty-title{font-size:15px;font-weight:700;margin-bottom:5px}
//     .vp-empty-sub{font-size:13px;color:var(--textMid)}
//     .sh-row td{height:64px;padding:0 12px}
//     .shimmer{border-radius:6px;height:13px;background:linear-gradient(90deg,#f0f2f7 25%,#e4e7ef 50%,#f0f2f7 75%);background-size:300% 100%;animation:shim 1.5s ease infinite}
//     @keyframes shim{from{background-position:200% 0}to{background-position:-100% 0}}
//     .vp-pager{padding:13px 18px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
//     .vp-pager-info{font-size:12px;color:var(--textMid)}
//     .vp-pager-btns{display:flex;gap:4px}
//     .pg-btn{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:var(--white);color:var(--textMid);font-size:12px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center}
//     .pg-btn:hover{border-color:var(--blue);color:var(--blue)}
//     .pg-btn.active{background:var(--blue);border-color:var(--blue);color:#fff;font-weight:700}
//     .vp-overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeO .22s ease}
//     @keyframes fadeO{from{opacity:0}to{opacity:1}}
//     .vp-drawer{background:var(--white);border:1px solid var(--border);border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,.18);width:100%;max-width:720px;max-height:92vh;display:flex;flex-direction:column;animation:modalIn .28s cubic-bezier(.22,1,.36,1)}
//     .vp-drawer.copy-drawer{border-color:#fed7aa;box-shadow:0 24px 64px rgba(234,88,12,.15)}
//     @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
//     .vp-drawer-head{padding:20px 24px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
//     .vp-drawer-head.copy-head{background:linear-gradient(135deg,#fff7ed,#ffedd5);border-bottom-color:#fed7aa}
//     .vp-drawer-head h2{font-size:15px;font-weight:700;letter-spacing:-.2px}
//     .vp-drawer-head p{font-size:12px;color:var(--textMid);margin-top:2px}
//     .vp-close{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--textMid);font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
//     .vp-close:hover{background:var(--redFade);border-color:var(--red);color:var(--red)}
//     .vp-drawer-body{flex:1;overflow-y:auto;padding:22px 24px;scrollbar-width:thin}
//     .vp-drawer-foot{padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;flex-shrink:0;background:#fafbfd;border-radius:0 0 16px 16px}
//     .vp-drawer-foot.copy-foot{background:linear-gradient(135deg,#fff7ed,#fafbfd);border-top-color:#fed7aa}
//     .vp-sec-head{font-size:10.5px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;color:var(--textDim);padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:16px;margin-top:22px}
//     .vp-sec-head:first-child{margin-top:0}
//     .vp-field{margin-bottom:15px}
//     .vp-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
//     .vp-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
//     .vp-lbl{display:block;font-size:12px;font-weight:600;color:var(--text);margin-bottom:6px}
//     .vp-lbl-sub{font-weight:400;color:var(--textDim);font-size:11px;margin-left:3px}
//     .vp-inp,.vp-sel,.vp-ta{width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);background:var(--white);outline:none;transition:border-color .2s,box-shadow .2s}
//     .vp-inp::placeholder,.vp-ta::placeholder{color:var(--textDim);font-weight:400}
//     .vp-inp:focus,.vp-sel:focus,.vp-ta:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.09)}
//     .vp-inp:disabled,.vp-sel:disabled{background:var(--bg);color:var(--textDim);cursor:not-allowed}
//     .vp-ta{resize:vertical;min-height:80px;line-height:1.5}
//     .price-calc-box{margin-bottom:14px;padding:12px 14px;background:linear-gradient(135deg,#f0f9ff,#eff6ff);border:1px solid #bfdbfe;border-radius:10px}
//     .price-calc-row{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;margin-bottom:4px}
//     .price-calc-row:last-child{margin-bottom:0;padding-top:8px;border-top:1px solid #bfdbfe;margin-top:8px}
//     .price-calc-label{color:var(--textMid);font-weight:500}
//     .price-calc-val{font-weight:700;color:var(--text)}
//     .price-calc-profit{color:#16a34a;font-weight:700}
//     .disc-preview{margin:-4px 0 14px;padding:8px 12px;background:var(--greenFade);border:1px solid #bbf7d0;border-radius:7px;display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--green);font-weight:600}
//     .hsn-info-box{margin-top:8px;padding:10px 12px;background:var(--blueFade);border:1px solid #bfdbfe;border-radius:8px;display:flex;gap:10px}
//     .hsn-info-code{font-family:monospace;font-size:11px;font-weight:700;color:var(--blue);background:#dbeafe;padding:3px 7px;border-radius:5px;flex-shrink:0;align-self:flex-start}
//     .hsn-info-desc{font-size:12px;color:#1e40af;line-height:1.4}
//     .img-section-box{padding:14px;border:1px solid var(--border);border-radius:10px;background:#fafbfd}
//     .img-section-label{font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--textDim);margin-bottom:10px;display:flex;align-items:center;gap:6px}
//     .img-section-label span{padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
//     .img-label-main{background:#dbeafe;color:#1d4ed8}
//     .img-label-gallery{background:#dcfce7;color:#15803d}
//     .bd-wrap{border:1.5px solid #e0f2fe;border-radius:12px;overflow:hidden;background:#f8fbff}
//     .bd-header{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-bottom:1px solid #bae6fd}
//     .bd-header-icon{width:32px;height:32px;background:white;border:1px solid #bae6fd;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
//     .bd-add-btn{padding:5px 12px;background:var(--blue);color:white;border:none;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
//     .bd-add-btn:hover{background:var(--blueHov);transform:translateY(-1px)}
//     .bd-form-wrap{margin:12px;padding:14px;background:white;border:1px solid #bae6fd;border-radius:10px}
//     .bd-form-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:10px}
//     .bd-form-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px}
//     .bd-lbl{display:block;font-size:11px;font-weight:600;color:var(--textMid);margin-bottom:4px}
//     .bd-inp{width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:var(--text);outline:none;transition:border-color .2s}
//     .bd-inp:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.08)}
//     .bd-preview{padding:8px 12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:7px;display:flex;align-items:center;gap:8px;font-size:12px;color:#0369a1;margin-bottom:8px}
//     .bd-savings-chip{display:inline-flex;padding:2px 7px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:10px;font-weight:700;margin-left:6px}
//     .bd-error{padding:7px 10px;background:var(--redFade);border:1px solid #fecaca;border-radius:7px;color:var(--red);font-size:11.5px;margin-bottom:8px}
//     .bd-save-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;background:var(--blue);color:white;border:none;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
//     .bd-save-btn:disabled{opacity:.6;cursor:not-allowed}
//     .bd-cancel-btn{padding:6px 12px;background:transparent;border:1px solid var(--border);border-radius:7px;color:var(--textMid);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;cursor:pointer}
//     .bd-loading{padding:12px 16px;display:flex;flex-direction:column;gap:8px}
//     .bd-skeleton{height:52px;background:linear-gradient(90deg,#f0f2f7 25%,#e4e7ef 50%,#f0f2f7 75%);background-size:300% 100%;animation:shim 1.5s ease infinite;border-radius:8px}
//     .bd-empty{padding:20px 16px;text-align:center}
//     .bd-empty-icon{font-size:28px;opacity:.2;margin-bottom:8px}
//     .bd-rules-list{padding:10px 12px;display:flex;flex-direction:column;gap:8px}
//     .bd-rule-card{background:white;border:1px solid #e0f2fe;border-radius:9px;padding:10px 12px;display:flex;align-items:center;gap:10px;transition:box-shadow .15s;flex-wrap:wrap}
//     .bd-rule-card:hover{box-shadow:0 2px 10px rgba(37,99,235,.08)}
//     .bd-rule-tier-badge{font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:#e0f2fe;padding:3px 7px;border-radius:20px;flex-shrink:0}
//     .bd-rule-main{display:flex;align-items:center;gap:8px;flex:1;min-width:0;flex-wrap:wrap}
//     .bd-qty-label{font-size:12px;font-weight:700;color:var(--text)}
//     .bd-rule-arrow{color:var(--textDim);font-size:12px;flex-shrink:0}
//     .bd-unit-price{font-size:14px;font-weight:800;color:var(--blue)}
//     .bd-per-unit{font-size:10px;color:var(--textDim)}
//     .bd-savings-tag{font-size:10px;font-weight:700;color:#16a34a;background:#dcfce7;padding:2px 6px;border-radius:20px}
//     .bd-savings-abs{font-size:10px;color:var(--textDim)}
//     .bd-rule-actions{display:flex;gap:5px;flex-shrink:0}
//     .bd-edit-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--white);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
//     .bd-edit-btn:hover{border-color:var(--blue);background:var(--blueFade)}
//     .bd-del-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--white);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
//     .bd-del-btn:hover{border-color:var(--red);background:var(--redFade)}
//     .bd-ladder{margin:0 0 4px;padding:10px 12px;background:#f0f9ff;border:1px dashed #bae6fd;border-radius:8px}
//     .bd-ladder-title{font-size:10px;font-weight:700;color:#0369a1;margin-bottom:8px;letter-spacing:.4px;text-transform:uppercase}
//     .bd-ladder-bars{display:flex;flex-direction:column;gap:5px}
//     .bd-ladder-row{display:flex;align-items:center;gap:8px}
//     .bd-ladder-qty{font-size:10px;font-weight:600;color:var(--textMid);width:60px;flex-shrink:0;text-align:right}
//     .bd-ladder-bar-wrap{flex:1;height:10px;background:#e0f2fe;border-radius:20px;overflow:hidden}
//     .bd-ladder-bar{height:100%;border-radius:20px;transition:width .4s ease}
//     .bd-ladder-price{font-size:10px;font-weight:700;color:var(--blue);width:80px;flex-shrink:0;display:flex;align-items:center;gap:4px}
//     .bd-ladder-pct{font-size:9px;font-weight:700;color:#16a34a;background:#dcfce7;padding:1px 5px;border-radius:20px}
//     .bd-del-overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px}
//     .bd-del-modal{background:white;border-radius:12px;padding:22px;width:280px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:popIn .2s cubic-bezier(.22,1,.36,1)}
//     @keyframes popIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
//     .bpr-trigger{display:flex;align-items:center;gap:5px;padding:4px 9px;border:1px solid #bae6fd;border-radius:7px;background:#f0f9ff;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;color:#0369a1;transition:all .15s;white-space:nowrap}
//     .bpr-trigger:hover{background:#e0f2fe;border-color:#7dd3fc}
//     .bpr-icon{font-size:12px}
//     .bpr-label{font-weight:600}
//     .bpr-saving{padding:2px 6px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:10px;font-weight:700}
//     .bpr-popup{position:absolute;top:calc(100% + 6px);left:0;z-index:200;background:white;border:1px solid #bae6fd;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.14);min-width:260px;overflow:hidden}
//     .bpr-popup-title{padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:#f0f9ff;border-bottom:1px solid #bae6fd;display:flex;align-items:center}
//     .bpr-row{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid #f0f9ff;font-size:12px}
//     .bpr-tier-num{width:22px;height:22px;background:#0369a1;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0}
//     .bpr-qty-range{flex:1;font-weight:600;color:var(--text)}
//     .bpr-arrow{color:var(--textDim);font-size:11px}
//     .bpr-price{font-weight:800;color:var(--blue)}
//     .bpr-pct{padding:2px 6px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:10px;font-weight:700}
//     .bpr-base-row{display:flex;justify-content:space-between;padding:8px 12px;background:#f8fafc;border-top:1px solid var(--border)}
//     .hsn-btn{width:100%;display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:8px;padding:9px 11px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;background:var(--white);cursor:pointer;text-align:left;transition:all .2s;color:var(--text)}
//     .hsn-btn:hover{border-color:var(--border2)}
//     .hsn-btn-open{border-color:var(--blue)!important;box-shadow:0 0 0 3px rgba(37,99,235,.09)}
//     .hsn-code{font-family:monospace;font-size:11px;font-weight:700;background:#f3f4f6;color:var(--text);padding:2px 6px;border-radius:4px;flex-shrink:0}
//     .hsn-desc{font-size:12px;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
//     .hsn-placeholder{color:var(--textDim);font-size:13px;flex:1}
//     .hsn-clear{color:var(--textDim);font-size:12px;padding:2px 4px;cursor:pointer;flex-shrink:0}
//     .hsn-clear:hover{color:var(--red)}
//     .gst-badge{display:inline-flex;align-items:center;font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;flex-shrink:0;white-space:nowrap}
//     .hsn-dropdown{position:absolute;z-index:200;top:calc(100% + 6px);left:0;right:0;min-width:340px;background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.14);overflow:hidden}
//     .hsn-search{width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;outline:none;transition:border-color .2s}
//     .hsn-search:focus{border-color:var(--blue)}
//     .hsn-cat-bar{display:flex;gap:6px;padding:6px 10px;overflow-x:auto;border-bottom:1px solid var(--border);scrollbar-width:none}
//     .hsn-cat-pill{flex-shrink:0;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;border:none;background:#f3f4f6;color:var(--textMid);cursor:pointer;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
//     .hsn-cat-pill:hover{background:var(--border2)}
//     .hsn-cat-pill-active{background:var(--blue)!important;color:white!important}
//     .hsn-list{max-height:220px;overflow-y:auto;padding:6px}
//     .hsn-empty{padding:24px;text-align:center;color:var(--textDim);font-size:13px}
//     .hsn-item{width:100%;display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border:none;border-radius:8px;background:transparent;cursor:pointer;text-align:left;transition:background .12s;font-family:'Plus Jakarta Sans',sans-serif}
//     .hsn-item:hover,.hsn-item-high{background:#f8fafc}
//     .hsn-item-selected{background:var(--blueFade)!important}
//     .hsn-item-code{font-family:monospace;font-size:10px;font-weight:700;padding:3px 6px;border-radius:4px;background:#f3f4f6;color:var(--text);flex-shrink:0;margin-top:1px}
//     .hsn-item-code-sel{background:var(--blue)!important;color:white!important}
//     .hsn-item-desc{font-size:12px;color:var(--text);line-height:1.3}
//     .hsn-item-cat{font-size:10px;color:var(--textDim);margin-top:2px}
//     .hsn-footer{padding:7px 12px;border-top:1px solid var(--border);font-size:10px;color:var(--textDim);background:#f8f9fc}
//     .vp-modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.52);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeO .2s ease}
//     .vp-modal{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:28px;width:360px;box-shadow:var(--shadowLg);animation:popIn .22s cubic-bezier(.22,1,.36,1)}
//     .vp-modal-ico{width:44px;height:44px;background:var(--redFade);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
//     .vp-modal h3{font-size:16px;font-weight:700;margin-bottom:8px}
//     .vp-modal p{font-size:13px;color:var(--textMid);line-height:1.65;margin-bottom:22px}
//     .vp-modal-row{display:flex;gap:10px}
//     .btn-danger{flex:1;padding:10px;background:var(--red);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer}
//     .vp-toast{position:fixed;bottom:22px;right:22px;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:9px;z-index:999;white-space:nowrap;animation:toastUp .28s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 28px rgba(0,0,0,.14)}
//     @keyframes toastUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
//     .vp-toast.success{background:#052e16;color:#86efac;border:1px solid #166534}
//     .vp-toast.error{background:#450a0a;color:#fca5a5;border:1px solid #991b1b}
//     .toast-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
//     .vp-toast.success .toast-dot{background:#22c55e}
//     .vp-toast.error .toast-dot{background:var(--red)}
//     .fade-up{animation:fadeUp .4s ease both}
//     @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
//     input[type="checkbox"]{width:15px;height:15px;accent-color:var(--blue);cursor:pointer}
//     .action-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
//     @media(max-width:768px){
//       .vp-stats{grid-template-columns:1fr 1fr}
//       .vp-body{padding:16px 14px 60px}
//       .vp-topbar{padding:0 14px}
//       .vp-search{width:140px}
//       .vp-overlay{padding:12px}
//       .vp-drawer{max-height:95vh;border-radius:14px;max-width:100%}
//       .vp-row2,.vp-row3{grid-template-columns:1fr}
//       .bd-form-grid{grid-template-columns:1fr}
//     }
//   `;

//   return (
//     <>
//       <style>{css}</style>
//       <div className="vp">
//         <div className="vp-topbar">
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <div className="vp-topbar-icon">🏪</div>
//             <span className="vp-topbar-name">Seller Panel</span>
//             <div className="vp-topbar-sep" />
//             <span className="vp-topbar-page">Products</span>
//           </div>
//         </div>

//         <div className="vp-body">
//           <div className="vp-page-header fade-up">
//             <div>
//               <h1>Products</h1>
//               <p>
//                 {products.length} products &middot; {categories.length}{" "}
//                 categories &middot; {hsnCodes.length} HSN codes &middot;{" "}
//                 <span style={{ color: "var(--teal)", fontWeight: 600 }}>
//                   {allBulkRules.length} bulk rule
//                   {allBulkRules.length !== 1 ? "s" : ""}
//                 </span>
//               </p>
//             </div>
//             <button
//               className="btn-primary"
//               onClick={() => {
//                 resetForm();
//                 setDrawer(true);
//               }}
//             >
//               + Add Product
//             </button>
//           </div>

//           <div className="vp-stats fade-up" style={{ animationDelay: "0.05s" }}>
//             {[
//               {
//                 icon: "📦",
//                 bg: "#eff6ff",
//                 val: products.length,
//                 lbl: "Total Products",
//               },
//               {
//                 icon: "✅",
//                 bg: "#f0fdf4",
//                 val: products.filter((p) => p.status === "active").length,
//                 lbl: "Active",
//               },
//               {
//                 icon: "🏷️",
//                 bg: "#fffbeb",
//                 val: products.filter((p) => p.salePrice < p.basePrice).length,
//                 lbl: "On Sale",
//               },
//               {
//                 icon: "💰",
//                 bg: "#fdf4ff",
//                 val: `Rs.${products.reduce((s, p) => s + (Number(p.basePrice) || 0), 0).toLocaleString()}`,
//                 lbl: "Catalogue Value",
//               },
//             ].map((s, i) => (
//               <div className="vp-stat" key={i}>
//                 <div className="vp-stat-icon" style={{ background: s.bg }}>
//                   {s.icon}
//                 </div>
//                 <div>
//                   <div className="vp-stat-val">{s.val}</div>
//                   <div className="vp-stat-lbl">{s.lbl}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {selectedItems.length > 0 && (
//             <div className="vp-bulk-bar fade-up">
//               {!bulkMode ? (
//                 <div className="action-row">
//                   <span
//                     style={{ fontSize: 13, fontWeight: 600, color: "#4338ca" }}
//                   >
//                     {selectedItems.length} selected
//                   </span>
//                   <button
//                     className="btn-primary"
//                     onClick={() => setBulkMode(true)}
//                   >
//                     Bulk Edit
//                   </button>
//                   <button className="btn-danger-sm" onClick={handleBulkDelete}>
//                     Delete
//                   </button>
//                   <button className="btn-ghost" onClick={handleExportSelected}>
//                     Export
//                   </button>
//                   <button className="btn-ghost" onClick={handleBulkCopy}>
//                     Copy All
//                   </button>
//                   <button
//                     className="btn-ghost"
//                     style={{ color: "var(--textDim)" }}
//                     onClick={() => setSelectedItems([])}
//                   >
//                     Clear
//                   </button>
//                 </div>
//               ) : (
//                 <div className="vp-bulk-panel">
//                   <div className="vp-bulk-title">
//                     Bulk Edit — {selectedItems.length} Products
//                   </div>
//                   <div
//                     style={{
//                       maxHeight: 280,
//                       overflowY: "auto",
//                       paddingRight: 4,
//                     }}
//                   >
//                     {products
//                       .filter((x) => selectedItems.includes(x._id))
//                       .map((item) => (
//                         <div key={item._id} className="vp-bulk-item">
//                           <div className="vp-bulk-item-name">{item.name}</div>
//                           <div className="vp-bulk-grid">
//                             {[
//                               { label: "Brand", key: "brand", type: "text" },
//                               {
//                                 label: "Base Price",
//                                 key: "basePrice",
//                                 type: "number",
//                               },
//                               {
//                                 label: "Profit",
//                                 key: "profit",
//                                 type: "number",
//                               },
//                               {
//                                 label: "Sale Price",
//                                 key: "salePrice",
//                                 type: "number",
//                               },
//                               {
//                                 label: "GST %",
//                                 key: "gstPercent",
//                                 type: "number",
//                               },
//                               {
//                                 label: "HSN Code",
//                                 key: "hsnCode",
//                                 type: "text",
//                               },
//                             ].map(({ label, key, type }) => (
//                               <div key={key}>
//                                 <label
//                                   className="vp-lbl"
//                                   style={{ fontSize: 11 }}
//                                 >
//                                   {label}
//                                 </label>
//                                 <input
//                                   className="vp-inp"
//                                   type={type}
//                                   value={item[key] ?? ""}
//                                   onChange={(e) =>
//                                     updateLocal(
//                                       item._id,
//                                       key,
//                                       type === "number"
//                                         ? Number(e.target.value)
//                                         : e.target.value,
//                                     )
//                                   }
//                                 />
//                               </div>
//                             ))}
//                             <div>
//                               <label
//                                 className="vp-lbl"
//                                 style={{ fontSize: 11 }}
//                               >
//                                 Status
//                               </label>
//                               <select
//                                 className="vp-sel"
//                                 value={item.status}
//                                 onChange={(e) =>
//                                   updateLocal(
//                                     item._id,
//                                     "status",
//                                     e.target.value,
//                                   )
//                                 }
//                               >
//                                 <option value="active">Active</option>
//                                 <option value="inactive">Inactive</option>
//                               </select>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                   <div className="action-row" style={{ marginTop: 12 }}>
//                     <button className="btn-primary" onClick={handleBulkSave}>
//                       Save All
//                     </button>
//                     <button
//                       className="btn-ghost"
//                       onClick={() => setBulkMode(false)}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="vp-card fade-up" style={{ animationDelay: "0.1s" }}>
//             <div className="vp-toolbar">
//               <div className="vp-toolbar-left">
//                 <div className="vp-search-wrap">
//                   <span className="vp-search-ico">⌕</span>
//                   <input
//                     className="vp-search"
//                     placeholder="Search name, brand, HSN..."
//                     value={search}
//                     onChange={(e) => {
//                       setSearch(e.target.value);
//                       setPage(1);
//                     }}
//                   />
//                 </div>
//                 <select
//                   className="vp-sel-filter"
//                   value={filterCategory}
//                   onChange={(e) => {
//                     setFilterCategory(e.target.value);
//                     setPage(1);
//                   }}
//                 >
//                   <option value="">All Categories</option>
//                   {categories.map((c) => (
//                     <option key={c._id} value={c._id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//                 {filterSubs.length > 0 && (
//                   <select
//                     className="vp-sel-filter"
//                     value={filterSubcategory}
//                     onChange={(e) => {
//                       setFilterSubcategory(e.target.value);
//                       setPage(1);
//                     }}
//                   >
//                     <option value="">All Subcategories</option>
//                     {filterSubs.map((s) => (
//                       <option key={s._id} value={s._id}>
//                         {s.name}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//                 {filterSubSubs.length > 0 && (
//                   <select
//                     className="vp-sel-filter"
//                     value={filterSubSubCat}
//                     onChange={(e) => {
//                       setFilterSubSubCat(e.target.value);
//                       setPage(1);
//                     }}
//                   >
//                     <option value="">All Sub-Subs</option>
//                     {filterSubSubs.map((s) => (
//                       <option key={s._id} value={s._id}>
//                         {s.name}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//                 <select
//                   className="vp-sel-filter"
//                   value={filterStatus}
//                   onChange={(e) => {
//                     setFilterStatus(e.target.value);
//                     setPage(1);
//                   }}
//                 >
//                   <option value="">All Status</option>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//                 {search && (
//                   <span className="vp-results-badge">
//                     {filtered.length} results
//                   </span>
//                 )}
//               </div>
//               <div className="action-row">
//                 <button
//                   className="btn-ghost"
//                   onClick={async () => {
//                     try {
//                       const res = await axiosAuth.get(`${API_URL}/export`, {
//                         responseType: "blob",
//                       });
//                       const url = window.URL.createObjectURL(
//                         new Blob([res.data]),
//                       );
//                       const a = document.createElement("a");
//                       a.href = url;
//                       a.download = "vendor_products.csv";
//                       a.click();
//                       window.URL.revokeObjectURL(url);
//                     } catch {
//                       notify("Export failed.", "error");
//                     }
//                   }}
//                 >
//                   Export CSV
//                 </button>
//                 <label style={{ cursor: "pointer" }}>
//                   <input
//                     type="file"
//                     accept=".csv"
//                     style={{ display: "none" }}
//                     onChange={async (e) => {
//                       try {
//                         const fd = new FormData();
//                         fd.append("file", e.target.files[0]);
//                         const res = await axiosAuth.post(
//                           `${API_URL}/import`,
//                           fd,
//                         );
//                         notify(`Imported ${res.data.imported} products.`);
//                         fetchProducts();
//                       } catch {
//                         notify("Import failed.", "error");
//                       }
//                       e.target.value = "";
//                     }}
//                   />
//                   <span className="btn-ghost">Import CSV</span>
//                 </label>
//               </div>
//             </div>

//             <div className="vp-table-wrap">
//               <table className="vp-table">
//                 <thead>
//                   <tr>
//                     <th style={{ width: 36 }}>
//                       <input
//                         type="checkbox"
//                         checked={
//                           selectedItems.length === filtered.length &&
//                           filtered.length > 0
//                         }
//                         onChange={() =>
//                           setSelectedItems(
//                             selectedItems.length === filtered.length
//                               ? []
//                               : filtered.map((x) => x._id),
//                           )
//                         }
//                       />
//                     </th>
//                     <th>#</th>
//                     <th>Product</th>
//                     <th>Category</th>
//                     <th>HSN / GST</th>
//                     <th>Weight</th>
//                     <th>Base Price</th>
//                     <th>Profit</th>
//                     <th>Sale Price</th>
//                     <th>Bulk Tiers</th>
//                     <th>Disc.</th>
//                     <th>Status</th>
//                     <th style={{ textAlign: "right" }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     [1, 2, 3, 4, 5].map((i) => (
//                       <tr className="sh-row" key={i}>
//                         {[
//                           36, 20, 220, 100, 160, 80, 80, 70, 80, 100, 70, 80,
//                           80,
//                         ].map((w, j) => (
//                           <td key={j}>
//                             <div className="shimmer" style={{ width: w }} />
//                           </td>
//                         ))}
//                       </tr>
//                     ))
//                   ) : paginated.length === 0 ? (
//                     <tr>
//                       <td colSpan={13}>
//                         <div className="vp-empty">
//                           <div className="vp-empty-icon">📦</div>
//                           <div className="vp-empty-title">
//                             {search ? "No products found" : "No products yet"}
//                           </div>
//                           <div className="vp-empty-sub">
//                             {search
//                               ? `No results for "${search}"`
//                               : "Click 'Add Product' to get started"}
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     paginated.map((p, i) => {
//                       const pct = discountPct(p);
//                       const dAmt =
//                         (Number(p.basePrice) || 0) - (Number(p.salePrice) || 0);
//                       const hsnInfo = hsnCodes.find(
//                         (h) => h.code === p.hsnCode,
//                       );
//                       const gstKey = hsnInfo?.gst ?? p.gstPercent ?? 0;
//                       const badge = GST_BADGE[gstKey] ?? GST_BADGE[0];

//                       return (
//                         <tr key={p._id}>
//                           <td>
//                             <input
//                               type="checkbox"
//                               checked={selectedItems.includes(p._id)}
//                               onChange={() =>
//                                 setSelectedItems((prev) =>
//                                   prev.includes(p._id)
//                                     ? prev.filter((x) => x !== p._id)
//                                     : [...prev, p._id],
//                                 )
//                               }
//                             />
//                           </td>
//                           <td style={{ color: "var(--textDim)", fontSize: 12 }}>
//                             {start + i + 1}
//                           </td>
//                           <td>
//                             <div className="vp-prod-cell">
//                               <ProductImageCell
//                                 image={p.image}
//                                 galleryImages={p.galleryImages}
//                                 name={p.name}
//                               />
//                               <div>
//                                 <div className="vp-prod-name">{p.name}</div>
//                                 {p.brand && (
//                                   <div className="vp-prod-brand">{p.brand}</div>
//                                 )}
//                                 {p.description && (
//                                   <div className="vp-prod-desc">
//                                     {p.description}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </td>
//                           <td>
//                             {p.category?.name ? (
//                               <span className="badge badge-blue">
//                                 {p.category.name}
//                               </span>
//                             ) : (
//                               <span style={{ color: "var(--textDim)" }}>—</span>
//                             )}
//                             {p.subcategory?.name && (
//                               <div style={{ marginTop: 3 }}>
//                                 <span className="badge badge-indigo">
//                                   &rarr; {p.subcategory.name}
//                                 </span>
//                               </div>
//                             )}
//                             {p.subSubCategory?.name && (
//                               <div style={{ marginTop: 3 }}>
//                                 <span className="badge badge-purple">
//                                   &rarr; {p.subSubCategory.name}
//                                 </span>
//                               </div>
//                             )}
//                           </td>
//                           <td style={{ minWidth: 160 }}>
//                             {p.hsnCode ? (
//                               <div>
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: 6,
//                                     flexWrap: "wrap",
//                                   }}
//                                 >
//                                   <span
//                                     style={{
//                                       fontFamily: "monospace",
//                                       fontSize: 11,
//                                       fontWeight: 700,
//                                       background: "#f3f4f6",
//                                       padding: "2px 6px",
//                                       borderRadius: 4,
//                                     }}
//                                   >
//                                     {p.hsnCode}
//                                   </span>
//                                   <span
//                                     className="gst-badge"
//                                     style={{
//                                       background: badge.bg,
//                                       color: badge.text,
//                                     }}
//                                   >
//                                     <span
//                                       style={{
//                                         background: badge.dot,
//                                         width: 6,
//                                         height: 6,
//                                         borderRadius: "50%",
//                                         display: "inline-block",
//                                         marginRight: 4,
//                                       }}
//                                     />
//                                     GST {p.gstPercent ?? 0}%
//                                   </span>
//                                 </div>
//                                 {hsnInfo && (
//                                   <div
//                                     style={{
//                                       fontSize: 10,
//                                       color: "var(--textDim)",
//                                       marginTop: 3,
//                                       maxWidth: 180,
//                                     }}
//                                   >
//                                     {hsnInfo.description}
//                                   </div>
//                                 )}
//                                 <div
//                                   style={{
//                                     fontSize: 10,
//                                     color: "var(--textDim)",
//                                     marginTop: 2,
//                                     textTransform: "uppercase",
//                                   }}
//                                 >
//                                   {p.taxType === "igst" ? "IGST" : "CGST+SGST"}
//                                 </div>
//                               </div>
//                             ) : (
//                               <span
//                                 style={{
//                                   fontSize: 12,
//                                   color: "var(--textDim)",
//                                   fontStyle: "italic",
//                                 }}
//                               >
//                                 Not set
//                               </span>
//                             )}
//                           </td>
//                           <td>
//                             {p.weight?.value ? (
//                               <span className="badge badge-gray">
//                                 {p.weight.value} {p.weight.unit}
//                               </span>
//                             ) : (
//                               <span style={{ color: "var(--textDim)" }}>—</span>
//                             )}
//                           </td>
//                           <td>
//                             <InlinePrice
//                               value={p.basePrice}
//                               onSave={(v) => handleInlineBasePrice(p._id, v)}
//                             />
//                           </td>
//                           <td>
//                             {p.profit > 0 ? (
//                               <span className="badge badge-green">
//                                 +Rs.{p.profit}
//                               </span>
//                             ) : (
//                               <span style={{ color: "var(--textDim)" }}>—</span>
//                             )}
//                           </td>
//                           <td>
//                             <div className="vp-sale-price">
//                               Rs.{p.salePrice}
//                             </div>
//                             {dAmt > 0 && (
//                               <div className="vp-base-price">
//                                 Rs.{p.basePrice}
//                               </div>
//                             )}
//                           </td>
//                           <td style={{ minWidth: 130 }}>
//                             <BulkPriceRangeCell
//                               productId={p._id}
//                               basePrice={p.basePrice}
//                               salePrice={p.salePrice}
//                               allBulkRules={allBulkRules}
//                             />
//                           </td>
//                           <td>
//                             {dAmt > 0 ? (
//                               <span className="badge badge-green">
//                                 {pct}% off
//                               </span>
//                             ) : (
//                               <span style={{ color: "var(--textDim)" }}>—</span>
//                             )}
//                           </td>
//                           <td>
//                             <button
//                               className={`status-btn ${p.status === "active" ? "status-active" : "status-inactive"}`}
//                               onClick={() => handleStatusToggle(p)}
//                             >
//                               {p.status === "active" ? "Active" : "Inactive"}
//                             </button>
//                           </td>
//                           <td style={{ textAlign: "right" }}>
//                             <div
//                               style={{
//                                 display: "flex",
//                                 gap: 6,
//                                 justifyContent: "flex-end",
//                               }}
//                             >
//                               <button
//                                 className="btn-icon btn-edit"
//                                 onClick={() => handleEdit(p)}
//                                 title="Edit"
//                               >
//                                 ✏️
//                               </button>
//                               <button
//                                 className="btn-icon btn-copy-icon"
//                                 onClick={() => handleCopy(p)}
//                                 title="Copy"
//                               >
//                                 📄
//                               </button>
//                               <button
//                                 className="btn-icon btn-del"
//                                 onClick={() => setDeleteId(p._id)}
//                                 title="Delete"
//                               >
//                                 🗑️
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {totalPages > 1 && (
//               <div className="vp-pager">
//                 <span className="vp-pager-info">
//                   Showing {start + 1}–{Math.min(start + limit, filtered.length)}{" "}
//                   of {filtered.length}
//                 </span>
//                 <div className="vp-pager-btns">
//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <button
//                       key={i}
//                       className={`pg-btn ${page === i + 1 ? "active" : ""}`}
//                       onClick={() => setPage(i + 1)}
//                     >
//                       {i + 1}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ── DRAWER ── */}
//       {drawer && (
//         <div className="vp-overlay" onClick={resetForm}>
//           <div
//             className={`vp-drawer${copyMode ? " copy-drawer" : ""}`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className={`vp-drawer-head${copyMode ? " copy-head" : ""}`}>
//               <div>
//                 <h2>
//                   {copyMode
//                     ? "Copy Product"
//                     : editId
//                       ? "Edit Product"
//                       : "Add New Product"}
//                 </h2>
//               </div>
//               <button className="vp-close" onClick={resetForm}>
//                 ×
//               </button>
//             </div>

//             <form
//               onSubmit={handleSubmit}
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 flex: 1,
//                 overflow: "hidden",
//               }}
//             >
//               <div className="vp-drawer-body">
//                 {copyMode && (
//                   <div
//                     className="copy-mode-banner"
//                     style={{ marginBottom: 18 }}
//                   >
//                     <span className="copy-mode-badge">COPY MODE</span>
//                     <span style={{ fontSize: 12, color: "var(--orange)" }}>
//                       Yeh product copy hoga — naam change karna mat bhoolein
//                     </span>
//                   </div>
//                 )}

//                 {/* Basic Info */}
//                 <div className="vp-sec-head">Basic Information</div>
//                 <div className="vp-row2">
//                   <div className="vp-field">
//                     <label className="vp-lbl">Product Name *</label>
//                     <input
//                       className="vp-inp"
//                       name="name"
//                       placeholder="e.g. Organic Almonds"
//                       value={form.name}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">
//                       Brand <span className="vp-lbl-sub">(optional)</span>
//                     </label>
//                     <input
//                       className="vp-inp"
//                       name="brand"
//                       placeholder="e.g. Amul, Tata"
//                       value={form.brand}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="vp-field">
//                   <label className="vp-lbl">Status</label>
//                   <select
//                     className="vp-sel"
//                     name="status"
//                     value={form.status}
//                     onChange={handleChange}
//                   >
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
//                 </div>

//                 {/* Category */}
//                 <div className="vp-sec-head">Category</div>
//                 <div className="vp-field">
//                   <label className="vp-lbl">Category *</label>
//                   <select
//                     className="vp-sel"
//                     name="category"
//                     value={form.category}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select category</option>
//                     {categories.map((c) => (
//                       <option key={c._id} value={c._id}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="vp-row2">
//                   <div className="vp-field">
//                     <label className="vp-lbl">
//                       Subcategory <span className="vp-lbl-sub">(optional)</span>
//                     </label>
//                     <select
//                       className="vp-sel"
//                       name="subcategory"
//                       value={form.subcategory}
//                       onChange={handleChange}
//                       disabled={!subcategories.length}
//                     >
//                       <option value="">None</option>
//                       {subcategories.map((s) => (
//                         <option key={s._id} value={s._id}>
//                           {s.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">
//                       Sub-Subcategory{" "}
//                       <span className="vp-lbl-sub">(optional)</span>
//                     </label>
//                     <select
//                       className="vp-sel"
//                       name="subSubCategory"
//                       value={form.subSubCategory}
//                       onChange={handleChange}
//                       disabled={!subSubCats.length}
//                     >
//                       <option value="">None</option>
//                       {subSubCats.map((s) => (
//                         <option key={s._id} value={s._id}>
//                           {s.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {/* Pricing */}
//                 <div className="vp-sec-head">Pricing & Tax</div>
//                 <div className="vp-row2" style={{ marginBottom: 0 }}>
//                   <div className="vp-field">
//                     <label className="vp-lbl">
//                       Base Price (Rs.) *{" "}
//                       <span className="vp-lbl-sub">cost price</span>
//                     </label>
//                     <input
//                       className="vp-inp"
//                       type="number"
//                       name="basePrice"
//                       placeholder="0.00"
//                       value={form.basePrice}
//                       onChange={handleChange}
//                       min="0"
//                       step="0.01"
//                       required
//                     />
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">Profit (Rs.)</label>
//                     <input
//                       className="vp-inp"
//                       type="number"
//                       name="profit"
//                       placeholder="0.00"
//                       value={form.profit}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           profit: e.target.value,
//                           _manualSale: false,
//                         }))
//                       }
//                       min="0"
//                       step="0.01"
//                     />
//                   </div>
//                 </div>

//                 {previewBase > 0 && (
//                   <div className="price-calc-box">
//                     <div className="price-calc-row">
//                       <span className="price-calc-label">Base Price</span>
//                       <span className="price-calc-val">
//                         Rs.{previewBase.toFixed(2)}
//                       </span>
//                     </div>
//                     <div className="price-calc-row">
//                       <span className="price-calc-label">+ Profit</span>
//                       <span className="price-calc-profit">
//                         +Rs.{previewProfit.toFixed(2)}
//                       </span>
//                     </div>
//                     <div className="price-calc-row">
//                       <span
//                         className="price-calc-label"
//                         style={{ fontWeight: 700, color: "var(--text)" }}
//                       >
//                         = Sale Price
//                       </span>
//                       <span
//                         className="price-calc-val"
//                         style={{ fontSize: 15, color: "var(--blue)" }}
//                       >
//                         Rs.{previewSale.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 <div className="vp-row2">
//                   <div className="vp-field">
//                     <label className="vp-lbl">
//                       Sale Price (Rs.){" "}
//                       <span className="vp-lbl-sub">override</span>
//                     </label>
//                     <input
//                       className="vp-inp"
//                       type="number"
//                       name="salePrice"
//                       placeholder="Auto-calculated"
//                       value={form.salePrice}
//                       onChange={handleChange}
//                       min="0"
//                       step="0.01"
//                     />
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">GST %</label>
//                     <select
//                       className="vp-sel"
//                       name="gstPercent"
//                       value={form.gstPercent}
//                       onChange={handleChange}
//                     >
//                       <option value="">Select</option>
//                       <option value="0">0% (Exempt)</option>
//                       <option value="5">5%</option>
//                       <option value="12">12%</option>
//                       <option value="18">18%</option>
//                       <option value="28">28%</option>
//                     </select>
//                   </div>
//                 </div>

//                 {showDisc && (
//                   <div className="disc-preview">
//                     Markup{" "}
//                     {Math.round(
//                       ((previewSale - previewBase) / previewBase) * 100,
//                     )}
//                     % &middot; Rs.{(previewSale - previewBase).toFixed(2)}{" "}
//                     profit per unit
//                   </div>
//                 )}

//                 <div className="vp-field" style={{ marginTop: 4 }}>
//                   <label className="vp-lbl">
//                     HSN Code <span className="vp-lbl-sub">(optional)</span>
//                   </label>
//                   <HsnPicker
//                     value={form.hsnCode}
//                     onSelect={handleHsnSelect}
//                     hsnCodes={hsnCodes}
//                     hsnCategories={hsnCategories}
//                     onAddNew={() => setShowAddHsn(true)}
//                     css={hsnCss}
//                   />
//                   {form.hsnCode &&
//                     (() => {
//                       const hsn = hsnCodes.find((h) => h.code === form.hsnCode);
//                       if (!hsn) return null;
//                       const b = GST_BADGE[hsn.gst] ?? GST_BADGE[0];
//                       return (
//                         <div className="hsn-info-box">
//                           <span className="hsn-info-code">{hsn.code}</span>
//                           <div style={{ flex: 1 }}>
//                             <div
//                               style={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 8,
//                                 flexWrap: "wrap",
//                               }}
//                             >
//                               <span
//                                 className="gst-badge"
//                                 style={{ background: b.bg, color: b.text }}
//                               >
//                                 <span
//                                   style={{
//                                     background: b.dot,
//                                     width: 6,
//                                     height: 6,
//                                     borderRadius: "50%",
//                                     display: "inline-block",
//                                     marginRight: 4,
//                                   }}
//                                 />
//                                 GST {hsn.gst}%
//                               </span>
//                               <span
//                                 style={{
//                                   fontSize: 10,
//                                   color: "var(--textDim)",
//                                 }}
//                               >
//                                 {hsn.category}
//                               </span>
//                             </div>
//                             <div className="hsn-info-desc">
//                               {hsn.description}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })()}
//                 </div>

//                 <div className="vp-row2">
//                   <div className="vp-field">
//                     <label className="vp-lbl">Tax Type</label>
//                     <select
//                       className="vp-sel"
//                       name="taxType"
//                       value={form.taxType}
//                       onChange={handleChange}
//                     >
//                       <option value="cgst_sgst">
//                         CGST + SGST (Intra-state)
//                       </option>
//                       <option value="igst">IGST (Inter-state)</option>
//                     </select>
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">Valid Till</label>
//                     <input
//                       className="vp-inp"
//                       type="date"
//                       name="validTill"
//                       value={form.validTill}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>

//                 {/* ── BULK DISCOUNT ── */}
//                 <div
//                   className="vp-sec-head"
//                   style={{
//                     marginTop: 24,
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 8,
//                   }}
//                 >
//                   <span>Bulk Discount Pricing</span>
//                   {!editId && tempBulkRules.length > 0 && (
//                     <span
//                       style={{
//                         fontSize: 10,
//                         fontWeight: 700,
//                         background: "#fef3c7",
//                         color: "#92400e",
//                         padding: "2px 8px",
//                         borderRadius: 20,
//                         border: "1px solid #fde68a",
//                         textTransform: "none",
//                         letterSpacing: 0,
//                       }}
//                     >
//                       {tempBulkRules.length} pending tier
//                       {tempBulkRules.length > 1 ? "s" : ""} — product save hone
//                       pe link honge
//                     </span>
//                   )}
//                 </div>

//                 <BulkDiscountManager
//                   productId={editId}
//                   basePrice={form.basePrice}
//                   salePrice={form.salePrice}
//                   onTempChange={handleTempBulkChange}
//                 />

//                 {/* Weight */}
//                 <div className="vp-sec-head">Weight & Quantity</div>
//                 <div className="vp-row2">
//                   <div className="vp-field">
//                     <label className="vp-lbl">Weight / Quantity</label>
//                     <input
//                       className="vp-inp"
//                       type="number"
//                       name="weightValue"
//                       placeholder="e.g. 500"
//                       value={form.weightValue}
//                       onChange={handleChange}
//                       min="0"
//                     />
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">Unit</label>
//                     <select
//                       className="vp-sel"
//                       name="weightUnit"
//                       value={form.weightUnit}
//                       onChange={handleChange}
//                     >
//                       <option value="kg">Kilogram (kg)</option>
//                       <option value="gm">Gram (gm)</option>
//                       <option value="ltr">Litre (ltr)</option>
//                       <option value="ml">Millilitre (ml)</option>
//                       <option value="pcs">Pieces (pcs)</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Images */}
//                 <div className="vp-sec-head">Images</div>
//                 <div className="img-section-box" style={{ marginBottom: 14 }}>
//                   <div className="img-section-label">
//                     <span className="img-label-main">Main Image</span>
//                     <span
//                       style={{
//                         fontSize: 11,
//                         color: "var(--textDim)",
//                         fontWeight: 400,
//                       }}
//                     >
//                       Cover / listing image
//                     </span>
//                   </div>
//                   <MainImageUploader
//                     key={`main-${uploaderKey}`}
//                     file={form.mainImageFile}
//                     existingUrl={form.existingMainImage}
//                     onChange={handleMainImageChange}
//                   />
//                 </div>
//                 <div className="img-section-box">
//                   <div className="img-section-label">
//                     <span className="img-label-gallery">Gallery Images</span>
//                     <span
//                       style={{
//                         fontSize: 11,
//                         color: "var(--textDim)",
//                         fontWeight: 400,
//                       }}
//                     >
//                       Up to 4 images · drag to reorder
//                     </span>
//                   </div>
//                   <GalleryUploader
//                     key={`gallery-${uploaderKey}`}
//                     galleryFiles={form.galleryFiles}
//                     existingGalleryImages={form.existingGalleryImages}
//                     onChange={handleGalleryChange}
//                   />
//                 </div>

//                 {/* Description */}
//                 <div className="vp-sec-head" style={{ marginTop: 20 }}>
//                   Description
//                 </div>
//                 <div className="vp-field">
//                   <textarea
//                     className="vp-ta"
//                     name="description"
//                     placeholder="Brief product description (optional)..."
//                     value={form.description}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>

//               <div className={`vp-drawer-foot${copyMode ? " copy-foot" : ""}`}>
//                 {copyMode ? (
//                   <button
//                     type="submit"
//                     className="btn-copy"
//                     style={{ flex: 1, justifyContent: "center" }}
//                     disabled={submitting}
//                   >
//                     {submitting
//                       ? "Saving..."
//                       : `Save as New Product${tempBulkRules.length ? ` + ${tempBulkRules.length} tier(s)` : ""}`}
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     className="btn-primary"
//                     style={{ flex: 1, justifyContent: "center" }}
//                     disabled={submitting}
//                   >
//                     {submitting
//                       ? "Saving..."
//                       : editId
//                         ? "Update Product"
//                         : `Add Product${tempBulkRules.length ? ` + ${tempBulkRules.length} tier(s)` : ""}`}
//                   </button>
//                 )}
//                 <button type="button" className="btn-ghost" onClick={resetForm}>
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showAddHsn && (
//         <AddHsnModal
//           onClose={() => setShowAddHsn(false)}
//           onSaved={handleHsnAdded}
//           existingCategories={hsnCategories}
//         />
//       )}

//       {deleteId && (
//         <div className="vp-modal-bg">
//           <div className="vp-modal">
//             <div className="vp-modal-ico">🗑️</div>
//             <h3>Delete this product?</h3>
//             <p>Yeh action undo nahi ho sakta.</p>
//             <div className="vp-modal-row">
//               <button className="btn-danger" onClick={handleDelete}>
//                 Yes, Delete
//               </button>
//               <button
//                 className="btn-ghost"
//                 style={{ flex: 1, justifyContent: "center" }}
//                 onClick={() => setDeleteId(null)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {toast && (
//         <div className={`vp-toast ${toast.type}`}>
//           <div className="toast-dot" />
//           {toast.msg}
//         </div>
//       )}
//     </>
//   );
// }


import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const API_URL = "https://foodhelpervendor.onrender.com/api/vendor/products";
const CATEGORY_URL = "https://foodhelpervendor.onrender.com/api/vendor/categories";
const HSN_API_URL = `${API_URL}/hsn-codes`;
const BULK_API_URL = "https://foodhelpervendor.onrender.com/api/vendor/bulk-discounts";

const TOKEN_KEY = "vendorToken";

const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const MAX_GALLERY = 4;

const GST_BADGE = {
  0:  { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  5:  { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  12: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
  18: { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
  28: { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
};

// ✅ profit field added in EMPTY
const EMPTY = {
  name: "",
  brand: "",
  category: "",
  subcategory: "",
  subSubCategory: "",
  description: "",
  basePrice: "",
  salePrice: "",
  profit: "",
  weightValue: "",
  weightUnit: "kg",
  status: "inactive",
  gstPercent: "",
  hsnCode: "",
  taxType: "cgst_sgst",
  validTill: "",
  mainImageFile: null,
  existingMainImage: "",
  galleryFiles: [],
  existingGalleryImages: [],
  _manualSale: false,
};

const EMPTY_HSN_FORM = { code: "", description: "", category: "", gst: "0" };
const EMPTY_BULK = { minQty: "", maxQty: "", unitPrice: "" };

/* ══════════════════════════════════════════════════════════════
   BULK DISCOUNT MANAGER
══════════════════════════════════════════════════════════════ */
function BulkDiscountManager({ productId, basePrice, salePrice, onTempChange }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_BULK);
  const [ruleEditId, setRuleEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteConf, setDeleteConf] = useState(null);

  const isTempMode = !productId || productId === "new";

  const loadRules = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await axiosAuth.get(`${BULK_API_URL}/product/${productId}`);
      setRules((res.data?.data || []).sort((a, b) => a.minQty - b.minQty));
    } catch (err) {
      console.error("Load Bulk Rules Error:", err);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    loadRules();
  }, [productId, loadRules]);

  const resetForm = () => {
    setForm(EMPTY_BULK);
    setRuleEditId(null);
    setShowForm(false);
    setError("");
  };

  const formatRange = (minQty, maxQty) => {
    if (!maxQty || Number(maxQty) === Number(minQty)) return `${minQty}+`;
    return `${minQty}–${maxQty}`;
  };

  const isDuplicate = (minQtyNum, maxQtyNum, excludeId = null) => {
    return rules.some((r) => {
      const rId = isTempMode ? r._tempId : r._id;
      if (excludeId && rId === excludeId) return false;
      const rMin = Number(r.minQty);
      const rMax = r.maxQty != null ? Number(r.maxQty) : null;
      return rMin === minQtyNum && rMax === maxQtyNum;
    });
  };

  const handleEdit = (rule) => {
    setRuleEditId(isTempMode ? rule._tempId : rule._id);
    setForm({ minQty: rule.minQty, maxQty: rule.maxQty ?? "", unitPrice: rule.unitPrice });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.minQty || !form.unitPrice) {
      setError("Min Qty aur Unit Price required hain");
      return;
    }
    const minQtyNum = Number(form.minQty);
    const maxQtyNum = form.maxQty !== "" && form.maxQty != null ? Number(form.maxQty) : null;
    const unitPriceNum = Number(form.unitPrice);

    if (!Number.isInteger(minQtyNum) || minQtyNum < 1) {
      setError("Min Qty pura number hona chahiye (>= 1)");
      return;
    }
    if (maxQtyNum !== null) {
      if (!Number.isInteger(maxQtyNum) || maxQtyNum < minQtyNum) {
        setError("Max Qty, Min Qty se chhota nahi ho sakta");
        return;
      }
    }
    if (unitPriceNum <= 0) {
      setError("Unit Price 0 se zyada hona chahiye");
      return;
    }
    if (isDuplicate(minQtyNum, maxQtyNum, ruleEditId)) {
      setError(`Yeh range (${formatRange(minQtyNum, maxQtyNum)} units) pehle se exist karti hai.`);
      return;
    }

    const payload = { minQty: minQtyNum, maxQty: maxQtyNum, unitPrice: unitPriceNum };

    if (isTempMode) {
      let updated;
      if (ruleEditId) {
        updated = rules.map((r) => (r._tempId === ruleEditId ? { ...r, ...payload } : r));
      } else {
        updated = [...rules, { ...payload, _tempId: `tmp_${Date.now()}` }];
      }
      setRules(updated);
      if (onTempChange) onTempChange([...updated]);
      resetForm();
      return;
    }

    try {
      setSaving(true);
      if (ruleEditId) {
        await axiosAuth.put(`${BULK_API_URL}/${ruleEditId}`, payload);
      } else {
        await axiosAuth.post(`${BULK_API_URL}/add`, { ...payload, product: productId });
      }
      await loadRules();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rule) => {
    if (isTempMode) {
      const updated = rules.filter((r) => r._tempId !== rule._tempId);
      setRules([...updated]);
      if (onTempChange) onTempChange([...updated]);
      setDeleteConf(null);
      return;
    }
    try {
      await axiosAuth.delete(`${BULK_API_URL}/${rule._id}`);
      await loadRules();
    } catch {}
    finally { setDeleteConf(null); }
  };

  const savingsPct = (unitPrice) => {
    const base = Number(salePrice || basePrice) || 0;
    if (!base || unitPrice >= base) return null;
    return Math.round(((base - unitPrice) / base) * 100);
  };

  const getKey = (rule) => (isTempMode ? rule._tempId : rule._id);

  return (
    <div className="bd-wrap">
      <div className="bd-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="bd-header-icon">📊</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Bulk Discount Rules</div>
            <div style={{ fontSize: 11, color: "var(--textMid)", marginTop: 1 }}>
              {isTempMode
                ? "Tiers will be saved when product is created"
                : `${rules.length} tier${rules.length !== 1 ? "s" : ""} — quantity-based pricing`}
            </div>
          </div>
        </div>
        {!showForm && (
          <button type="button" className="bd-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Tier
          </button>
        )}
      </div>

      {isTempMode && rules.length === 0 && !showForm && (
        <div style={{ margin: "10px 12px", padding: "10px 14px", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", border: "1.5px dashed #7dd3fc", borderRadius: 9, fontSize: 12, color: "#0369a1", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, opacity: 0.7 }}>💡</span>
          <span>Tiers abhi add karo — product save hone pe automatically link ho jayenge.</span>
        </div>
      )}

      {showForm && (
        <div className="bd-form-wrap">
          <div className="bd-form-title">{ruleEditId ? "✏️ Tier Edit Karo" : "➕ Naya Price Tier"}</div>
          <form>
            <div className="bd-form-grid">
              <div>
                <label className="bd-lbl">Min Qty *</label>
                <input className="bd-inp" type="number" placeholder="e.g. 10" value={form.minQty}
                  onChange={(e) => { setForm((p) => ({ ...p, minQty: e.target.value })); setError(""); }} min="1" />
              </div>
              <div>
                <label className="bd-lbl">Max Qty <span style={{ fontSize: 10, color: "var(--textDim)" }}>(optional)</span></label>
                <input className="bd-inp" type="number" placeholder="Blank = no limit" value={form.maxQty}
                  onChange={(e) => { setForm((p) => ({ ...p, maxQty: e.target.value })); setError(""); }} min="1" />
              </div>
              <div>
                <label className="bd-lbl">Unit Price (Rs.) *</label>
                <input className="bd-inp" type="number" placeholder="Price per unit" value={form.unitPrice}
                  onChange={(e) => { setForm((p) => ({ ...p, unitPrice: e.target.value })); setError(""); }} min="0" step="0.01" />
              </div>
            </div>
            {form.minQty && form.unitPrice && (() => {
              const pct = savingsPct(Number(form.unitPrice));
              const base = Number(salePrice || basePrice) || 0;
              const rangeStr = formatRange(form.minQty, form.maxQty);
              return (
                <div className="bd-preview">
                  <span>Buy <strong>{rangeStr}</strong> units &rarr; <strong style={{ color: "var(--blue)" }}>Rs.{form.unitPrice}/unit</strong>
                    {pct > 0 && <span className="bd-savings-chip">Save {pct}%</span>}
                    {pct !== null && pct < 0 && <span style={{ color: "var(--red)", fontSize: 11, marginLeft: 6 }}>⚠ Sale price se zyada hai</span>}
                    {base > 0 && pct > 0 && <span style={{ color: "var(--textDim)", fontSize: 11, marginLeft: 6 }}>(was Rs.{base})</span>}
                  </span>
                </div>
              );
            })()}
            {error && <div className="bd-error">⚠ {error}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="button" className="bd-save-btn" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : ruleEditId ? "Update Tier" : "Save Tier"}
              </button>
              <button type="button" className="bd-cancel-btn" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bd-loading">{[1, 2].map((i) => <div key={i} className="bd-skeleton" />)}</div>
      ) : rules.length === 0 ? (
        !showForm && (
          <div className="bd-empty">
            <div className="bd-empty-icon">📊</div>
            <div style={{ fontSize: 12, color: "var(--textDim)", marginTop: 6 }}>
              {isTempMode ? "Koi tier nahi — upar Add Tier click karo" : "No bulk discount rules yet"}
            </div>
          </div>
        )
      ) : (
        <div className="bd-rules-list">
          {[...rules].sort((a, b) => a.minQty - b.minQty).map((rule, idx) => {
            const pct = savingsPct(rule.unitPrice);
            const base = Number(salePrice || basePrice) || 0;
            const key = getKey(rule);
            const rangeStr = formatRange(rule.minQty, rule.maxQty);
            return (
              <div key={key || idx} className="bd-rule-card">
                {isTempMode && (
                  <span style={{ fontSize: 9, fontWeight: 800, background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: 20, border: "1px solid #fde68a", flexShrink: 0 }}>
                    PENDING
                  </span>
                )}
                <div className="bd-rule-tier-badge">Tier {idx + 1}</div>
                <div className="bd-rule-main">
                  <span className="bd-qty-label">{rangeStr} units</span>
                  <span className="bd-rule-arrow">&rarr;</span>
                  <span className="bd-unit-price">Rs.{rule.unitPrice}</span>
                  <span className="bd-per-unit">/unit</span>
                  {pct > 0 && (
                    <>
                      <span className="bd-savings-tag">-{pct}%</span>
                      <span className="bd-savings-abs">Save Rs.{(base - rule.unitPrice).toFixed(2)}</span>
                    </>
                  )}
                </div>
                <div className="bd-rule-actions">
                  <button type="button" className="bd-edit-btn" onClick={() => handleEdit(rule)} title="Edit">✏️</button>
                  <button type="button" className="bd-del-btn" onClick={() => setDeleteConf(rule)} title="Delete">🗑️</button>
                </div>
              </div>
            );
          })}

          {rules.length > 1 && (() => {
            const sorted = [...rules].sort((a, b) => a.minQty - b.minQty);
            const maxPrice = Math.max(...sorted.map((r) => r.unitPrice));
            return (
              <div className="bd-ladder">
                <div className="bd-ladder-title">📉 Price Ladder</div>
                <div className="bd-ladder-bars">
                  {sorted.map((rule, idx) => {
                    const barWidth = maxPrice > 0 ? Math.max(20, (rule.unitPrice / maxPrice) * 100) : 50;
                    const pct = savingsPct(rule.unitPrice);
                    const key = getKey(rule);
                    return (
                      <div key={key || idx} className="bd-ladder-row">
                        <div className="bd-ladder-qty">{formatRange(rule.minQty, rule.maxQty)} u</div>
                        <div className="bd-ladder-bar-wrap">
                          <div className="bd-ladder-bar" style={{ width: `${barWidth}%`, background: idx === 0 ? "#dbeafe" : idx === rules.length - 1 ? "#bbf7d0" : `hsl(${210 - idx * 20},80%,85%)` }} />
                        </div>
                        <div className="bd-ladder-price">
                          Rs.{rule.unitPrice}
                          {pct > 0 && <span className="bd-ladder-pct">-{pct}%</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {deleteConf && (
        <div className="bd-del-overlay" onClick={() => setDeleteConf(null)}>
          <div className="bd-del-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Delete this tier?</div>
            <div style={{ fontSize: 12, color: "var(--textMid)", marginBottom: 16 }}>Yeh bulk discount rule delete ho jayega.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => handleDelete(deleteConf)}
                style={{ flex: 1, padding: "8px 0", background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
                Delete
              </button>
              <button type="button" onClick={() => setDeleteConf(null)}
                style={{ flex: 1, padding: "8px 0", background: "var(--bg)", color: "var(--textMid)", border: "1px solid var(--border)", borderRadius: 8, fontWeight: 500, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BULK PRICE RANGE CELL
══════════════════════════════════════════════════════════════ */
function BulkPriceRangeCell({ productId, basePrice, salePrice, allBulkRules }) {
  const [expanded, setExpanded] = useState(false);
  const rules = (allBulkRules || [])
    .filter((d) => String(d.productId) === String(productId))
    .sort((a, b) => a.minQty - b.minQty);

  const formatRange = (minQty, maxQty) => {
    if (!maxQty || Number(maxQty) === Number(minQty)) return `${minQty}+`;
    return `${minQty}–${maxQty}`;
  };

  if (!rules.length) {
    return <span style={{ fontSize: 11.5, color: "var(--textDim)", fontStyle: "italic" }}>—</span>;
  }

  const base = Number(salePrice || basePrice) || 0;
  const minPrice = Math.min(...rules.map((r) => r.unitPrice));
  const maxSaving = base > 0 ? Math.round(((base - minPrice) / base) * 100) : 0;

  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setExpanded((p) => !p)} className="bpr-trigger">
        <span className="bpr-icon">📊</span>
        <span className="bpr-label">{rules.length} tier{rules.length > 1 ? "s" : ""}</span>
        {maxSaving > 0 && <span className="bpr-saving">upto -{maxSaving}%</span>}
        <span style={{ color: "var(--textDim)", fontSize: 10 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setExpanded(false)} />
          <div className="bpr-popup">
            <div className="bpr-popup-title">
              📊 Bulk Price Tiers
              <button type="button" onClick={() => setExpanded(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--textDim)", fontSize: 14, marginLeft: "auto" }}>
                ✕
              </button>
            </div>
            {rules.map((rule, idx) => {
              const pct = base > 0 && rule.unitPrice < base ? Math.round(((base - rule.unitPrice) / base) * 100) : 0;
              return (
                <div key={rule._id || idx} className="bpr-row">
                  <div className="bpr-tier-num">T{idx + 1}</div>
                  <div className="bpr-qty-range">{formatRange(rule.minQty, rule.maxQty)} units</div>
                  <div className="bpr-arrow">&rarr;</div>
                  <div className="bpr-price">Rs.{rule.unitPrice}<span style={{ fontSize: 10, color: "var(--textDim)" }}>/u</span></div>
                  {pct > 0 && <div className="bpr-pct">-{pct}%</div>}
                </div>
              );
            })}
            {base > 0 && (
              <div className="bpr-base-row">
                <span style={{ color: "var(--textDim)", fontSize: 10 }}>Sale Price</span>
                <span style={{ fontWeight: 600, color: "var(--textMid)" }}>Rs.{base}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADD HSN MODAL
══════════════════════════════════════════════════════════════ */
function AddHsnModal({ onClose, onSaved, existingCategories }) {
  const [form, setForm] = useState(EMPTY_HSN_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.description || !form.category) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      setSaving(true);
      const res = await axiosAuth.post(HSN_API_URL, {
        code: form.code.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        gst: Number(form.gst),
      });
      onSaved(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "HSN save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vp-modal-bg" onClick={onClose}>
      <div className="vp-modal" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>New HSN Code</div>
            <div style={{ fontSize: 12, color: "var(--textMid)", marginTop: 2 }}>Add GST Tariff Code</div>
          </div>
          <button className="vp-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="vp-field">
            <label className="vp-lbl">HSN Code *</label>
            <input className="vp-inp" name="code" placeholder="e.g. 0401" value={form.code} onChange={handleChange}
              style={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: 1 }} />
          </div>
          <div className="vp-field">
            <label className="vp-lbl">Category *</label>
            {!newCat ? (
              <div style={{ display: "flex", gap: 8 }}>
                <select className="vp-sel" name="category" value={form.category} onChange={handleChange} style={{ flex: 1 }}>
                  <option value="">Select Category</option>
                  {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => { setNewCat(true); setForm((p) => ({ ...p, category: "" })); }}
                  style={{ padding: "0 12px", border: "1px solid var(--blue)", borderRadius: 8, background: "var(--blueFade)", color: "var(--blue)", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                  + New
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input className="vp-inp" name="category" placeholder="New category name" value={form.category} onChange={handleChange} style={{ flex: 1 }} />
                <button type="button" onClick={() => setNewCat(false)}
                  style={{ padding: "0 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--textMid)", fontSize: 12, cursor: "pointer" }}>
                  List
                </button>
              </div>
            )}
          </div>
          <div className="vp-field">
            <label className="vp-lbl">GST Rate *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {[0, 5, 12, 18, 28].map((rate) => {
                const b = GST_BADGE[rate];
                const sel = form.gst === String(rate);
                return (
                  <button key={rate} type="button" onClick={() => setForm((p) => ({ ...p, gst: String(rate) }))}
                    style={{ padding: "8px 4px", borderRadius: 8, border: `2px solid ${sel ? b.dot : "var(--border)"}`, background: sel ? b.bg : "var(--white)", color: sel ? b.text : "var(--textMid)", fontWeight: sel ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
                    {rate}%
                  </button>
                );
              })}
            </div>
          </div>
          <div className="vp-field">
            <label className="vp-lbl">Description *</label>
            <textarea className="vp-ta" name="description" placeholder="e.g. Milk & Cream (not concentrated, no added sugar)"
              value={form.description} onChange={handleChange} style={{ minHeight: 70 }} />
          </div>
          {error && (
            <div style={{ padding: "8px 12px", background: "var(--redFade)", border: "1px solid #fecaca", borderRadius: 8, color: "var(--red)", fontSize: 12, marginBottom: 12 }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving}>
              {saving ? "Saving..." : "Save HSN Code"}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HSN PICKER
══════════════════════════════════════════════════════════════ */
function HsnPicker({ value, onSelect, hsnCodes, hsnCategories, onAddNew, css: c }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [highlighted, setHigh] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = hsnCodes.find((h) => h.code === value) ?? null;
  const filtered = hsnCodes.filter((h) => {
    const q = query.toLowerCase();
    return (
      (!q || h.code.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) || h.category.toLowerCase().includes(q)) &&
      (!catFilter || h.category === catFilter)
    );
  });

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setHigh(0), [query, catFilter]);
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-idx="${highlighted}"]`)?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  const pick = (hsn) => { onSelect(hsn); setOpen(false); setQuery(""); };
  const clear = (e) => { e.stopPropagation(); onSelect(null); setQuery(""); };

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHigh((p) => Math.min(p + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHigh((p) => Math.max(p - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) pick(filtered[highlighted]); }
    if (e.key === "Escape") setOpen(false);
  };

  const badge = selected ? (GST_BADGE[selected.gst] ?? GST_BADGE[0]) : null;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" onKeyDown={handleKeyDown} onClick={() => { setOpen((p) => !p); setTimeout(() => inputRef.current?.focus(), 60); }}
          className={c.hsnBtn + (open ? " " + c.hsnBtnOpen : "")} style={{ flex: 1 }}>
          🏷️
          {selected ? (
            <>
              <span className={c.hsnCode}>{selected.code}</span>
              <span className={c.hsnDesc}>{selected.description}</span>
              <span className={c.gstBadge} style={{ background: badge.bg, color: badge.text }}>
                <span style={{ background: badge.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />
                GST {selected.gst}%
              </span>
              <span onClick={clear} className={c.hsnClear}>✕</span>
            </>
          ) : (
            <>
              <span className={c.hsnPlaceholder}>Search HSN code...</span>
              <span style={{ marginLeft: "auto", color: "var(--textDim)", fontSize: 12 }}>▾</span>
            </>
          )}
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); onAddNew(); }} title="Add new HSN code"
          style={{ width: 38, height: 38, borderRadius: 8, border: "1.5px dashed var(--blue)", background: "var(--blueFade)", color: "var(--blue)", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--blue)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--blueFade)"; e.currentTarget.style.color = "var(--blue)"; }}>
          +
        </button>
      </div>
      {open && (
        <div className={c.hsnDropdown}>
          <div style={{ padding: "10px 10px 6px" }}>
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="Type code or item name..." className={c.hsnSearch} />
          </div>
          <div className={c.hsnCatBar}>
            <button className={c.hsnCatPill + (!catFilter ? " " + c.hsnCatPillActive : "")} onClick={() => setCatFilter("")}>All</button>
            {hsnCategories.map((cat) => (
              <button key={cat} className={c.hsnCatPill + (catFilter === cat ? " " + c.hsnCatPillActive : "")}
                onClick={() => setCatFilter(catFilter === cat ? "" : cat)}>{cat}</button>
            ))}
          </div>
          <div ref={listRef} className={c.hsnList}>
            {hsnCodes.length === 0 ? (
              <div className={c.hsnEmpty}>
                <div style={{ marginBottom: 8 }}>No HSN codes found</div>
                <button type="button" onClick={() => { setOpen(false); onAddNew(); }}
                  style={{ padding: "6px 14px", borderRadius: 8, background: "var(--blue)", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Add First HSN
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className={c.hsnEmpty}>
                No results — <button type="button" style={{ color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => { setOpen(false); onAddNew(); }}>Add new?</button>
              </div>
            ) : (
              filtered.map((hsn, idx) => {
                const b = GST_BADGE[hsn.gst] ?? GST_BADGE[0];
                return (
                  <button key={hsn.code} data-idx={idx} type="button" onClick={() => pick(hsn)} onMouseEnter={() => setHigh(idx)}
                    className={c.hsnItem + (value === hsn.code ? " " + c.hsnItemSelected : highlighted === idx ? " " + c.hsnItemHigh : "")}>
                    <span className={c.hsnItemCode + (value === hsn.code ? " " + c.hsnItemCodeSel : "")}>{hsn.code}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={c.hsnItemDesc}>{hsn.description}</div>
                      <div className={c.hsnItemCat}>{hsn.category}</div>
                    </div>
                    <span className={c.gstBadge} style={{ background: b.bg, color: b.text }}>
                      <span style={{ background: b.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />
                      {hsn.gst}%
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className={c.hsnFooter}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} · Arrow keys navigate · Enter select · Esc close</div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   INLINE EDITABLE BASE PRICE CELL
══════════════════════════════════════════════════════════════ */
function InlinePrice({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const inputRef = useRef(null);

  const commit = () => {
    const n = Number(val);
    if (!isNaN(n) && n >= 0) onSave(n);
    setEditing(false);
  };

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
  useEffect(() => setVal(value), [value]);

  if (editing) {
    return (
      <input ref={inputRef} type="number" value={val} onChange={(e) => setVal(e.target.value)}
        onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        style={{ width: 80, padding: "4px 8px", border: "2px solid var(--blue)", borderRadius: 7, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--text)", outline: "none", background: "#eff6ff" }} />
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} onClick={() => setEditing(true)} title="Click to edit base price">
      <span style={{ color: "var(--textMid)", fontWeight: 500 }}>Rs.{value}</span>
      <span style={{ fontSize: 10, color: "var(--blue)", background: "var(--blueFade)", border: "1px solid #bfdbfe", borderRadius: 4, padding: "1px 5px", fontWeight: 600, opacity: 0.8 }}>✏</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN IMAGE UPLOADER
══════════════════════════════════════════════════════════════ */
function MainImageUploader({ file, existingUrl, onChange }) {
  const [preview, setPreview] = useState(existingUrl || null);
  const [lightbox, setLightbox] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(f));
    onChange({ file: f, existingUrl: "" });
  };
  const handleRemove = () => { setPreview(null); onChange({ file: null, existingUrl: "" }); };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
        onClick={() => !preview && inputRef.current?.click()}
        style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", border: `2px ${preview ? "solid" : "dashed"} ${dragOver ? "#2563eb" : preview ? "#bfdbfe" : "#d1d5db"}`, background: dragOver ? "#eff6ff" : preview ? "#000" : "#f9fafb", cursor: preview ? "default" : "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {preview ? (
          <>
            <img src={preview} alt="Main" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <span style={{ position: "absolute", top: 8, left: 8, background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>MAIN IMAGE</span>
            <MainHoverOverlay onView={() => setLightbox(true)} onReplace={() => inputRef.current?.click()} onRemove={handleRemove} />
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.25 }}>🖼️</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--textMid)" }}>Click or drag image here</div>
            <div style={{ fontSize: 11, color: "var(--textDim)", marginTop: 4 }}>JPEG, PNG, WebP</div>
          </div>
        )}
      </div>
      {preview && (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => inputRef.current?.click()}
            style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Replace
          </button>
          <button type="button" onClick={handleRemove}
            style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Remove
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      {lightbox && preview && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.9)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setLightbox(false)}>
          <div style={{ position: "relative", maxWidth: 560, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <img src={preview} alt="Main" style={{ width: "100%", borderRadius: 14, objectFit: "contain", maxHeight: "80vh" }} />
            <button onClick={() => setLightbox(false)} style={{ position: "absolute", top: -14, right: -14, background: "white", borderRadius: "50%", border: "none", width: 30, height: 30, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MainHoverOverlay({ onView, onReplace, onRemove }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ position: "absolute", inset: 0 }}>
      {hov && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {[
            { label: "View", onClick: onView, bg: "rgba(255,255,255,.9)", color: "#0f172a" },
            { label: "Replace", onClick: onReplace, bg: "rgba(245,158,11,.9)", color: "white" },
            { label: "Remove", onClick: onRemove, bg: "rgba(239,68,68,.9)", color: "white" },
          ].map(({ label, onClick, bg, color }) => (
            <button key={label} type="button" onClick={(e) => { e.stopPropagation(); onClick(); }}
              style={{ padding: "7px 12px", borderRadius: 8, background: bg, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GALLERY UPLOADER
══════════════════════════════════════════════════════════════ */
function GalleryUploader({ galleryFiles, existingGalleryImages, onChange }) {
  const idCounter = useRef(0);
  const genId = () => `g_${++idCounter.current}`;

  const initSlots = useCallback(() => {
    const ex = (existingGalleryImages || []).map((url) => ({ id: genId(), type: "existing", url, previewUrl: url }));
    const nw = (galleryFiles || []).map((file) => ({ id: genId(), type: "new", file, previewUrl: URL.createObjectURL(file) }));
    return [...ex, ...nw];
    // eslint-disable-next-line
  }, []);

  const [slots, setSlots] = useState(initSlots);
  const [lightbox, setLightbox] = useState(null);
  const [lbIdx, setLbIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const replaceRefs = useRef({});
  const addInputRef = useRef(null);

  const propagate = useCallback((updated) => {
    onChange(updated.filter((s) => s.type === "new").map((s) => s.file), updated.filter((s) => s.type === "existing").map((s) => s.url));
  }, [onChange]);

  const totalCount = slots.length;
  const remaining = MAX_GALLERY - totalCount;

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, remaining));
    if (!valid.length) return;
    const added = valid.map((file) => ({ id: genId(), type: "new", file, previewUrl: URL.createObjectURL(file) }));
    const updated = [...slots, ...added];
    setSlots(updated);
    propagate(updated);
  };

  const removeSlot = (id) => { const u = slots.filter((s) => s.id !== id); setSlots(u); propagate(u); };
  const replaceSlot = (id, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const u = slots.map((s) => s.id !== id ? s : { id: s.id, type: "new", file, previewUrl: URL.createObjectURL(file) });
    setSlots(u);
    propagate(u);
  };

  const onDragStart = (e, idx) => { setDraggingIdx(idx); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnterSlot = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const onDragOverSlot = (e) => e.preventDefault();
  const onDropSlot = (e, idx) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) { setDraggingIdx(null); setDragOverIdx(null); return; }
    const updated = [...slots];
    const [moved] = updated.splice(draggingIdx, 1);
    updated.splice(idx, 0, moved);
    setSlots(updated);
    propagate(updated);
    setDraggingIdx(null);
    setDragOverIdx(null);
  };
  const onDragEnd = () => { setDraggingIdx(null); setDragOverIdx(null); };
  const onDropZone = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };

  const openLb = (idx) => { setLbIdx(idx); setLightbox(slots[idx]?.previewUrl); };
  const lbPrev = () => { const i = (lbIdx - 1 + slots.length) % slots.length; setLbIdx(i); setLightbox(slots[i]?.previewUrl); };
  const lbNext = () => { const i = (lbIdx + 1) % slots.length; setLbIdx(i); setLightbox(slots[i]?.previewUrl); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {slots.map((slot, idx) => (
          <div key={slot.id} draggable onDragStart={(e) => onDragStart(e, idx)} onDragEnter={(e) => onDragEnterSlot(e, idx)}
            onDragOver={onDragOverSlot} onDrop={(e) => onDropSlot(e, idx)} onDragEnd={onDragEnd}
            style={{ position: "relative", aspectRatio: "1/1", borderRadius: 10, overflow: "visible", border: `2px solid ${dragOverIdx === idx && draggingIdx !== idx ? "#2563eb" : slot.type === "existing" ? "#bfdbfe" : "#86efac"}`, background: "#f9fafb", opacity: draggingIdx === idx ? 0.35 : 1, transform: draggingIdx === idx ? "scale(0.93)" : "scale(1)", transition: "all .15s" }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
              style={{ position: "absolute", top: -9, right: -9, zIndex: 30, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 10, fontWeight: 700 }}>
              ✕
            </button>
            <div style={{ position: "absolute", inset: 0, borderRadius: 8, overflow: "hidden" }}>
              <img src={slot.previewUrl} alt={`gallery ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
              <span style={{ position: "absolute", bottom: 3, right: 4, fontSize: 8, fontWeight: 700, color: "white", background: slot.type === "existing" ? "rgba(0,0,0,.5)" : "rgba(22,163,74,.8)", padding: "1px 5px", borderRadius: 3, zIndex: 10 }}>
                {slot.type === "existing" ? "Saved" : "New"}
              </span>
              <GalleryThumbOverlay onView={() => openLb(idx)} onReplace={() => replaceRefs.current[slot.id]?.click()} />
            </div>
            <input ref={(el) => { replaceRefs.current[slot.id] = el; }} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) replaceSlot(slot.id, f); e.target.value = ""; }} />
          </div>
        ))}
        {Array.from({ length: Math.max(0, MAX_GALLERY - totalCount) }).map((_, idx) => (
          <div key={`empty-${idx}`} onClick={() => remaining > 0 && addInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDropZone}
            style={{ aspectRatio: "1/1", borderRadius: 10, border: `2px dashed ${dragOver && idx === 0 ? "#2563eb" : "#d1d5db"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: dragOver && idx === 0 ? "#eff6ff" : "#f9fafb", transition: "all .2s" }}>
            <div style={{ fontSize: 18, color: "#d1d5db" }}>+</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button type="button" disabled={remaining === 0} onClick={() => remaining > 0 && addInputRef.current?.click()}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${remaining === 0 ? "#e5e7eb" : "#bfdbfe"}`, background: remaining === 0 ? "#f9fafb" : "#eff6ff", color: remaining === 0 ? "#9ca3af" : "#2563eb", cursor: remaining === 0 ? "not-allowed" : "pointer" }}>
          {remaining === 0 ? "Max 4 reached" : `Add images (${remaining} left)`}
        </button>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{totalCount}/{MAX_GALLERY} · Drag to reorder</span>
      </div>
      <input ref={addInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.9)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setLightbox(null)}>
          <div style={{ position: "relative", maxWidth: 560, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            {slots.length > 1 && (
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
                {slots.map((s, i) => (
                  <button key={s.id} onClick={() => { setLbIdx(i); setLightbox(s.previewUrl); }}
                    style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", border: `2px solid ${lbIdx === i ? "white" : "rgba(255,255,255,.3)"}`, opacity: lbIdx === i ? 1 : 0.55, cursor: "pointer", padding: 0 }}>
                    <img src={s.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
            <img src={lightbox} alt="Gallery" style={{ width: "100%", borderRadius: 14, objectFit: "contain", maxHeight: "72vh" }} />
            {slots.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); lbPrev(); }}
                  style={{ position: "absolute", top: "55%", left: -44, transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 18 }}>‹</button>
                <button onClick={(e) => { e.stopPropagation(); lbNext(); }}
                  style={{ position: "absolute", top: "55%", right: -44, transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 18 }}>›</button>
              </>
            )}
            <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: -14, right: -14, background: "white", borderRadius: "50%", border: "none", width: 30, height: 30, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>✕</button>
            <div style={{ textAlign: "center", marginTop: 8, color: "rgba(255,255,255,.5)", fontSize: 12 }}>{lbIdx + 1} / {slots.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryThumbOverlay({ onView, onReplace }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ position: "absolute", inset: 0 }}>
      {hov && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, zIndex: 20 }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); onView(); }}
            style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,.85)", border: "none", cursor: "pointer", fontSize: 12 }}>🔍</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onReplace(); }}
            style={{ padding: 6, borderRadius: 8, background: "rgba(245,158,11,.85)", border: "none", cursor: "pointer", fontSize: 12 }}>🔄</button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TABLE IMAGE CELL
══════════════════════════════════════════════════════════════ */
function ProductImageCell({ image, galleryImages, name }) {
  const [lightbox, setLightbox] = useState(null);
  const [lbIdx, setLbIdx] = useState(0);
  const gallery = galleryImages || [];
  const allImgs = [image, ...gallery].filter(Boolean);

  const prev = () => { const i = (lbIdx - 1 + allImgs.length) % allImgs.length; setLbIdx(i); setLightbox(allImgs[i]); };
  const next = () => { const i = (lbIdx + 1) % allImgs.length; setLbIdx(i); setLightbox(allImgs[i]); };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {image ? (
          <button type="button" onClick={() => { setLbIdx(0); setLightbox(image); }}
            style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", border: "2px solid #2563eb", flexShrink: 0, cursor: "pointer", position: "relative" }}>
            <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(37,99,235,.75)", color: "white", fontSize: 7, fontWeight: 700, textAlign: "center", padding: "1px 0" }}>MAIN</span>
          </button>
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🛒</div>
        )}
        {gallery.slice(0, 3).map((url, idx) => (
          <button key={idx} type="button" onClick={() => { setLbIdx(idx + 1); setLightbox(url); }}
            style={{ width: 36, height: 36, borderRadius: 7, overflow: "hidden", border: "2px solid #86efac", flexShrink: 0, cursor: "pointer", marginLeft: -4, zIndex: 5 - idx }}>
            <img src={url} alt={`g${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
        {gallery.length > 3 && (
          <button type="button" onClick={() => { setLbIdx(4); setLightbox(gallery[3]); }}
            style={{ width: 36, height: 36, borderRadius: 7, border: "2px solid #a3e635", background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700, marginLeft: -4, cursor: "pointer", flexShrink: 0 }}>
            +{gallery.length - 3}
          </button>
        )}
      </div>
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.9)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setLightbox(null)}>
          <div style={{ position: "relative", maxWidth: 520, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            {allImgs.length > 1 && (
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
                {allImgs.map((url, i) => (
                  <button key={i} onClick={() => { setLbIdx(i); setLightbox(url); }}
                    style={{ width: 40, height: 40, borderRadius: 7, overflow: "hidden", border: `2px solid ${lbIdx === i ? "white" : "rgba(255,255,255,.3)"}`, opacity: lbIdx === i ? 1 : 0.5, cursor: "pointer", padding: 0 }}>
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
            <img src={lightbox} alt="Preview" style={{ width: "100%", borderRadius: 14, objectFit: "contain", maxHeight: "70vh" }} />
            {allImgs.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }}
                  style={{ position: "absolute", top: "55%", left: -44, transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 18 }}>‹</button>
                <button onClick={(e) => { e.stopPropagation(); next(); }}
                  style={{ position: "absolute", top: "55%", right: -44, transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 18 }}>›</button>
              </>
            )}
            <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: -14, right: -14, background: "white", borderRadius: "50%", border: "none", width: 30, height: 30, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>✕</button>
            <div style={{ textAlign: "center", marginTop: 8, color: "rgba(255,255,255,.5)", fontSize: 12 }}>{lbIdx + 1} / {allImgs.length}</div>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subSubCats, setSubSubCats] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [hsnCategories, setHsnCategories] = useState([]);
  const [allBulkRules, setAllBulkRules] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [copyMode, setCopyMode] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [uploaderKey, setUploaderKey] = useState("new");
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");
  const [filterSubSubCat, setFilterSubSubCat] = useState("");
  const [filterSubs, setFilterSubs] = useState([]);
  const [filterSubSubs, setFilterSubSubs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddHsn, setShowAddHsn] = useState(false);
  const [tempBulkRules, setTempBulkRules] = useState([]);
  const tempBulkRulesRef = useRef([]);

  const limit = 25;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchHsnCodes();
    fetchAllBulkRules();
  }, []);

  // Category → subcategory chain
  useEffect(() => {
    if (!form.category) { setSubcategories([]); setSubSubCats([]); return; }
    const cat = categories.find((c) => c._id === form.category);
    setSubcategories(cat?.subcategories || []);
    setSubSubCats([]);
    setForm((p) => ({ ...p, subcategory: "", subSubCategory: "" }));
  }, [form.category]); // eslint-disable-line

  useEffect(() => {
    if (!form.subcategory) { setSubSubCats([]); return; }
    const cat = categories.find((c) => c._id === form.category);
    const sub = cat?.subcategories?.find((s) => s._id === form.subcategory);
    setSubSubCats(sub?.subSubCategories || []);
    setForm((p) => ({ ...p, subSubCategory: "" }));
  }, [form.subcategory]); // eslint-disable-line

  // Filter chain
  useEffect(() => {
    if (!filterCategory) { setFilterSubs([]); setFilterSubSubs([]); setFilterSubcategory(""); setFilterSubSubCat(""); return; }
    const cat = categories.find((c) => c._id === filterCategory);
    setFilterSubs(cat?.subcategories || []);
    setFilterSubcategory("");
    setFilterSubSubCat("");
    setFilterSubSubs([]);
  }, [filterCategory]); // eslint-disable-line

  useEffect(() => {
    if (!filterSubcategory) { setFilterSubSubs([]); setFilterSubSubCat(""); return; }
    const cat = categories.find((c) => c._id === filterCategory);
    const sub = cat?.subcategories?.find((s) => s._id === filterSubcategory);
    setFilterSubSubs(sub?.subSubCategories || []);
    setFilterSubSubCat("");
  }, [filterSubcategory]); // eslint-disable-line

  // ✅ Auto sale price = base + profit (jab manual override nahi)
  useEffect(() => {
    if (!form._manualSale) {
      const base = Number(form.basePrice) || 0;
      const profit = Number(form.profit) || 0;
      if (base > 0) {
        setForm((p) => ({ ...p, salePrice: String(base + profit) }));
      }
    }
  }, [form.basePrice, form.profit]); // eslint-disable-line

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleTempBulkChange = useCallback((rules) => {
    setTempBulkRules(rules);
    tempBulkRulesRef.current = rules;
  }, []);

  const fetchAllBulkRules = async () => {
    try {
      const res = await axiosAuth.get(`${BULK_API_URL}/my`);
      setAllBulkRules(res.data?.data || []);
    } catch (err) {
      console.error("Bulk fetch error:", err);
    }
  };

  const fetchHsnCodes = async () => {
    try {
      const res = await axiosAuth.get(HSN_API_URL);
      if (res.data?.success) {
        setHsnCodes(res.data.data || []);
        setHsnCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error("fetchHsnCodes:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosAuth.get(CATEGORY_URL);
      if (res.data?.success) setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get(API_URL);
      if (res.data?.success) setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value, ...(name === "salePrice" ? { _manualSale: true } : {}) }));
  };

  const handleMainImageChange = useCallback(({ file, existingUrl }) => {
    setForm((p) => ({ ...p, mainImageFile: file, existingMainImage: existingUrl }));
  }, []);

  const handleGalleryChange = useCallback((newFiles, existingUrls) => {
    setForm((p) => ({ ...p, galleryFiles: newFiles, existingGalleryImages: existingUrls }));
  }, []);

  const handleHsnSelect = (hsnObj) => {
    if (!hsnObj) setForm((p) => ({ ...p, hsnCode: "", gstPercent: "" }));
    else setForm((p) => ({ ...p, hsnCode: hsnObj.code, gstPercent: String(hsnObj.gst) }));
  };

  const handleHsnAdded = (newHsn) => {
    setHsnCodes((prev) => [...prev, newHsn]);
    setHsnCategories((prev) => prev.includes(newHsn.category) ? prev : [...prev, newHsn.category]);
    handleHsnSelect(newHsn);
    notify("HSN code added!");
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditId(null);
    setCopyMode(false);
    setDrawer(false);
    setSubcategories([]);
    setSubSubCats([]);
    setUploaderKey(Date.now().toString());
    setTempBulkRules([]);
    tempBulkRulesRef.current = [];
  };

  const buildFD = () => {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("brand", form.brand.trim());
    fd.append("category", form.category);
    fd.append("status", form.status);
    fd.append("basePrice", form.basePrice);
    fd.append("profit", form.profit || 0);   // ✅ profit always sent
    if (form.salePrice) fd.append("salePrice", form.salePrice);
    fd.append("weight", JSON.stringify({ value: Math.max(1, Number(form.weightValue) || 1), unit: form.weightUnit || "kg" }));
    fd.append("gstPercent", form.gstPercent || 0);
    fd.append("hsnCode", form.hsnCode || "");
    fd.append("taxType", form.taxType || "cgst_sgst");
    if (form.validTill) fd.append("validTill", form.validTill);
    if (form.description) fd.append("description", form.description);

    if (form.subcategory) {
      const sub = subcategories.find((s) => s._id === form.subcategory);
      if (sub) fd.append("subcategory", JSON.stringify({ id: sub._id, name: sub.name, image: sub.image || null }));
    } else {
      fd.append("subcategory", "");
    }

    if (form.subSubCategory) {
      const ss = subSubCats.find((s) => s._id === form.subSubCategory);
      if (ss) fd.append("subSubCategory", JSON.stringify({ id: ss._id, name: ss.name, image: ss.image || null }));
    } else {
      fd.append("subSubCategory", "");
    }

    if (form.mainImageFile) {
      fd.append("mainImage", form.mainImageFile);
    } else {
      fd.append("existingMainImage", form.existingMainImage || "");
    }

    (form.galleryFiles || []).forEach((f) => fd.append("galleryImages", f));
    fd.append("existingGalleryImages", JSON.stringify(form.existingGalleryImages || []));

    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.basePrice) {
      notify("Name, category aur base price required hain", "error");
      return;
    }
    const nameExists = products.some(
      (p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p._id !== editId
    );
    if (nameExists) {
      notify("Yeh product name already exist karta hai!", "error");
      return;
    }

    try {
      setSubmitting(true);
      const fd = buildFD();
      let newProductId = null;

      if (editId && !copyMode) {
        await axiosAuth.put(`${API_URL}/${editId}`, fd);
        newProductId = editId;
        notify("Product updated!");
      } else {
        const res = await axiosAuth.post(API_URL, fd);
        const createdProduct = res?.data?.data;
        newProductId = createdProduct?._id;
        if (!newProductId) { notify("Product ID nahi mila", "error"); return; }
        notify(copyMode ? "Copy saved!" : "Product added!");
      }

      // Temp bulk rules save
      const validRules = (tempBulkRulesRef.current || []).filter(
        (r) => Number(r.minQty) > 0 && Number(r.unitPrice) > 0
      );
      if (validRules.length > 0 && newProductId) {
        try {
          await Promise.all(validRules.map((rule) =>
            axiosAuth.post(`${BULK_API_URL}/add`, {
              product: newProductId,
              minQty: Number(rule.minQty),
              maxQty: rule.maxQty ? Number(rule.maxQty) : null,
              unitPrice: Number(rule.unitPrice),
            })
          ));
          notify(`Product + ${validRules.length} bulk tier(s) saved!`);
        } catch (bulkErr) {
          console.error("Bulk rules save failed:", bulkErr?.response?.data || bulkErr.message);
          notify("Product saved! Bulk tiers save nahi ho sake — edit se try karo.", "error");
        }
      }

      await fetchProducts();
      await fetchAllBulkRules();
      resetForm();
    } catch (err) {
      console.error("Submit Error:", err);
      notify(err.response?.data?.message || "Kuch galat ho gaya", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ handleEdit — profit properly load hota hai
  const handleEdit = (p) => {
    const catId = p.category?._id || p.category;
    const cat = categories.find((c) => c._id === catId);
    const subs = cat?.subcategories || [];
    const sub = subs.find((s) => s._id === p.subcategory?.id);
    setSubcategories(subs);
    setSubSubCats(sub?.subSubCategories || []);
    setForm({
      name: p.name || "",
      brand: p.brand || "",
      category: catId || "",
      subcategory: p.subcategory?.id || "",
      subSubCategory: p.subSubCategory?.id || "",
      description: p.description || "",
      basePrice: String(p.basePrice || ""),
      salePrice: String(p.salePrice || ""),
      profit: String(p.profit || ""),          // ✅ profit load hoga
      weightValue: p.weight?.value || "",
      weightUnit: p.weight?.unit || "kg",
      status: p.status || "inactive",
      gstPercent: p.gstPercent !== undefined ? String(p.gstPercent) : "",
      hsnCode: p.hsnCode || "",
      taxType: p.taxType || "cgst_sgst",
      validTill: p.validTill ? p.validTill.split("T")[0] : "",
      mainImageFile: null,
      existingMainImage: p.image || "",
      galleryFiles: [],
      existingGalleryImages: p.galleryImages || [],
      _manualSale: true,                        // manual — taaki auto-calc override na kare
    });
    setEditId(p._id);
    setCopyMode(false);
    setUploaderKey(p._id);
    setTempBulkRules([]);
    tempBulkRulesRef.current = [];
    setDrawer(true);
  };

  // ✅ handleCopy — profit properly copy hota hai
  const handleCopy = (p) => {
    const catId = p.category?._id || p.category;
    const cat = categories.find((c) => c._id === catId);
    const subs = cat?.subcategories || [];
    const sub = subs.find((s) => s._id === p.subcategory?.id);
    setSubcategories(subs);
    setSubSubCats(sub?.subSubCategories || []);
    setForm({
      name: `${p.name} (Copy)`,
      brand: p.brand || "",
      category: catId || "",
      subcategory: p.subcategory?.id || "",
      subSubCategory: p.subSubCategory?.id || "",
      description: p.description || "",
      basePrice: String(p.basePrice || ""),
      salePrice: String(p.salePrice || ""),
      profit: String(p.profit || ""),          // ✅ profit copy hoga
      weightValue: p.weight?.value || "",
      weightUnit: p.weight?.unit || "kg",
      status: "inactive",
      gstPercent: p.gstPercent !== undefined ? String(p.gstPercent) : "",
      hsnCode: p.hsnCode || "",
      taxType: p.taxType || "cgst_sgst",
      validTill: p.validTill ? p.validTill.split("T")[0] : "",
      mainImageFile: null,
      existingMainImage: p.image || "",
      galleryFiles: [],
      existingGalleryImages: p.galleryImages || [],
      _manualSale: true,
    });
    setEditId(null);
    setCopyMode(true);
    setUploaderKey(`copy-${p._id}-${Date.now()}`);
    setTempBulkRules([]);
    tempBulkRulesRef.current = [];
    setDrawer(true);
  };

  const handleDelete = async () => {
    try {
      await axiosAuth.delete(`${API_URL}/${deleteId}`);
      fetchProducts();
      notify("Product deleted.");
    } catch {
      notify("Delete failed.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      const newStatus = item.status === "active" ? "inactive" : "active";
      await axiosAuth.put(`${API_URL}/status/${item._id}`, { status: newStatus });
      setProducts((prev) => prev.map((x) => x._id === item._id ? { ...x, status: newStatus } : x));
    } catch {
      notify("Status update failed.", "error");
    }
  };

  const handleInlineBasePrice = async (productId, newBase) => {
    try {
      const item = products.find((x) => x._id === productId);
      if (!item) return;
      const profit = Number(item.profit) || 0;
      const salePrice = newBase + profit;
      const discount = newBase > salePrice ? newBase - salePrice : 0;
      await axiosAuth.post(`${API_URL}/bulk-update`, {
        products: [{ id: productId, basePrice: newBase, salePrice, profit, discount }],
      });
      setProducts((prev) => prev.map((x) => x._id === productId ? { ...x, basePrice: newBase, salePrice, discount } : x));
      notify("Base price updated!");
    } catch {
      notify("Price update failed.", "error");
    }
  };

  const updateLocal = (id, key, val) =>
    setProducts((prev) => prev.map((x) => x._id === id ? { ...x, [key]: val } : x));

  const handleBulkSave = async () => {
    if (!selectedItems.length) return notify("Koi item select nahi", "error");
    const updates = products.filter((x) => selectedItems.includes(x._id)).map((x) => ({
      id: x._id, basePrice: Number(x.basePrice), salePrice: Number(x.salePrice),
      profit: Number(x.profit || 0), gstPercent: Number(x.gstPercent || 0),
      hsnCode: x.hsnCode || "", taxType: x.taxType || "cgst_sgst", brand: x.brand || "", status: x.status,
    }));
    try {
      await axiosAuth.post(`${API_URL}/bulk-update`, { products: updates });
      notify("Bulk save done!");
      setBulkMode(false);
      setSelectedItems([]);
      fetchProducts();
    } catch {
      notify("Bulk save failed.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return notify("Koi item select nahi", "error");
    if (!window.confirm("Selected products delete karein?")) return;
    try {
      await axiosAuth.post(`${API_URL}/delete-selected`, { ids: selectedItems });
      setSelectedItems([]);
      setBulkMode(false);
      fetchProducts();
      notify("Selected deleted.");
    } catch {
      notify("Bulk delete failed.", "error");
    }
  };

  const handleBulkCopy = async () => {
    for (const id of selectedItems) await axiosAuth.post(`${API_URL}/copy/${id}`);
    fetchProducts();
    notify("Copied.");
  };

  const handleExportSelected = async () => {
    if (!selectedItems.length) return notify("Koi item select nahi", "error");
    try {
      const res = await axiosAuth.post(`${API_URL}/export-selected`, { ids: selectedItems }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "selected_products.csv";
      a.click();
    } catch {
      notify("Export failed.", "error");
    }
  };

  const filtered = products.filter((p) => {
    const t = search.toLowerCase();
    const matchText =
      (p.name || "").toLowerCase().includes(t) ||
      (p.brand || "").toLowerCase().includes(t) ||
      (p.category?.name || "").toLowerCase().includes(t) ||
      (p.hsnCode || "").toLowerCase().includes(t);
    const matchCat = !filterCategory || (p.category?._id || p.category) === filterCategory;
    const matchSub = !filterSubcategory || p.subcategory?.id === filterSubcategory;
    const matchSubSub = !filterSubSubCat || p.subSubCategory?.id === filterSubSubCat;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchText && matchCat && matchSub && matchSubSub && matchStatus;
  });

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const discountPct = (p) =>
    p.basePrice && p.salePrice < p.basePrice ? Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100) : 0;

  // Price preview in drawer
  const previewBase = Number(form.basePrice) || 0;
  const previewProfit = Number(form.profit) || 0;
  const previewSale = form._manualSale ? Number(form.salePrice) : previewBase + previewProfit;
  const showDisc = previewBase > 0 && previewSale > 0 && previewSale > previewBase;

  const hsnCss = {
    hsnBtn: "hsn-btn", hsnBtnOpen: "hsn-btn-open", hsnCode: "hsn-code",
    hsnDesc: "hsn-desc", hsnPlaceholder: "hsn-placeholder", hsnClear: "hsn-clear",
    gstBadge: "gst-badge", hsnDropdown: "hsn-dropdown", hsnSearch: "hsn-search",
    hsnCatBar: "hsn-cat-bar", hsnCatPill: "hsn-cat-pill", hsnCatPillActive: "hsn-cat-pill-active",
    hsnList: "hsn-list", hsnEmpty: "hsn-empty", hsnItem: "hsn-item",
    hsnItemSelected: "hsn-item-selected", hsnItemHigh: "hsn-item-high",
    hsnItemCode: "hsn-item-code", hsnItemCodeSel: "hsn-item-code-sel",
    hsnItemDesc: "hsn-item-desc", hsnItemCat: "hsn-item-cat", hsnFooter: "hsn-footer",
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    :root{
      --bg:#f4f6fb;--white:#fff;--border:#e4e7ef;--border2:#cdd1de;
      --text:#0f172a;--textMid:#64748b;--textDim:#94a3b8;
      --blue:#2563eb;--blueFade:#eff6ff;--blueHov:#1d4ed8;
      --red:#ef4444;--redFade:#fef2f2;
      --green:#16a34a;--greenFade:#f0fdf4;
      --amber:#d97706;--amberFade:#fffbeb;
      --purple:#7c3aed;--purpleFade:#f5f3ff;
      --orange:#ea580c;--orangeFade:#fff7ed;
      --teal:#0d9488;--tealFade:#f0fdfa;
      --shadow:0 1px 3px rgba(0,0,0,.07);
      --shadowMd:0 4px 16px rgba(0,0,0,.09);
      --shadowLg:0 16px 48px rgba(0,0,0,.14);
      --r:10px;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    .vp{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);min-height:100vh;color:var(--text)}
    .vp-topbar{background:var(--white);border-bottom:1px solid var(--border);height:58px;padding:0 28px;display:flex;align-items:center;position:sticky;top:0;z-index:50}
    .vp-topbar-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:15px}
    .vp-topbar-name{font-size:15px;font-weight:700;letter-spacing:-.3px;margin-left:9px}
    .vp-topbar-sep{width:1px;height:16px;background:var(--border);margin:0 10px}
    .vp-topbar-page{font-size:13px;color:var(--textMid)}
    .vp-body{padding:24px 28px 64px;max-width:1400px}
    .vp-page-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
    .vp-page-header h1{font-size:20px;font-weight:700;letter-spacing:-.4px}
    .vp-page-header p{font-size:13px;color:var(--textMid);margin-top:4px}
    .vp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
    .vp-stat{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;box-shadow:var(--shadow);display:flex;align-items:center;gap:14px;transition:box-shadow .2s}
    .vp-stat:hover{box-shadow:var(--shadowMd)}
    .vp-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
    .vp-stat-val{font-size:22px;font-weight:700;letter-spacing:-.5px;line-height:1}
    .vp-stat-lbl{font-size:11.5px;color:var(--textMid);font-weight:500;margin-top:3px}
    .vp-card{background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
    .vp-toolbar{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .vp-toolbar-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0;flex-wrap:wrap}
    .vp-search-wrap{position:relative}
    .vp-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--textDim);font-size:14px;pointer-events:none}
    .vp-search{padding:8px 12px 8px 32px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);background:var(--bg);outline:none;width:200px;transition:border-color .2s,box-shadow .2s}
    .vp-search:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1);background:var(--white)}
    .vp-sel-filter{padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);background:var(--bg);outline:none}
    .vp-results-badge{padding:3px 9px;border-radius:20px;border:1px solid var(--border);font-size:11.5px;font-weight:600;color:var(--textMid);background:var(--bg)}
    .btn-primary{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--blue);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
    .btn-primary:hover:not(:disabled){background:var(--blueHov);box-shadow:0 4px 14px rgba(37,99,235,.35);transform:translateY(-1px)}
    .btn-primary:disabled{opacity:.55;cursor:not-allowed}
    .btn-copy{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--orangeFade);border:1.5px solid #fed7aa;border-radius:8px;color:var(--orange);font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
    .btn-copy:hover:not(:disabled){background:var(--orange);color:#fff;box-shadow:0 4px 14px rgba(234,88,12,.3);transform:translateY(-1px)}
    .btn-copy:disabled{opacity:.55;cursor:not-allowed}
    .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--textMid);font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
    .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--bg)}
    .btn-danger-sm{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;background:var(--redFade);border:1px solid #fecaca;border-radius:8px;color:var(--red);font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
    .btn-danger-sm:hover{background:var(--red);color:#fff}
    .btn-icon{width:32px;height:32px;border-radius:7px;border:1px solid var(--border);background:var(--white);color:var(--textMid);font-size:13px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;flex-shrink:0}
    .btn-edit:hover{border-color:var(--blue);color:var(--blue);background:var(--blueFade)}
    .btn-copy-icon:hover{border-color:var(--orange);color:var(--orange);background:var(--orangeFade)}
    .btn-del:hover{border-color:var(--red);color:var(--red);background:var(--redFade)}
    .copy-mode-banner{display:flex;align-items:center;gap:10px;padding:10px 14px;background:linear-gradient(135deg,#fff7ed,#ffedd5);border:1.5px solid #fed7aa;border-radius:10px;margin-bottom:16px}
    .copy-mode-badge{padding:3px 9px;background:var(--orange);color:#fff;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.3px;flex-shrink:0}
    .vp-bulk-bar{background:#eef2ff;border:1px solid #dbeafe;border-radius:10px;padding:14px 18px;margin-bottom:14px}
    .vp-bulk-panel{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px}
    .vp-bulk-title{font-size:15px;font-weight:700;margin-bottom:14px}
    .vp-bulk-item{background:#f8faff;border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px}
    .vp-bulk-item-name{font-size:13px;font-weight:700;margin-bottom:10px}
    .vp-bulk-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
    .vp-table-wrap{overflow-x:auto}
    .vp-table{width:100%;border-collapse:collapse;min-width:1200px}
    .vp-table thead tr{border-bottom:1px solid var(--border);background:#f8f9fc}
    .vp-table th{padding:10px 12px;text-align:left;white-space:nowrap;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--textMid)}
    .vp-table tbody tr{border-bottom:1px solid var(--border);transition:background .12s}
    .vp-table tbody tr:last-child{border-bottom:none}
    .vp-table tbody tr:hover{background:#f8faff}
    .vp-table td{padding:11px 12px;font-size:13px;vertical-align:middle}
    .vp-prod-cell{display:flex;align-items:center;gap:11px}
    .vp-prod-name{font-weight:600;font-size:13px;line-height:1.3}
    .vp-prod-brand{font-size:11.5px;color:var(--blue);font-weight:500;margin-top:2px}
    .vp-prod-desc{font-size:11.5px;color:var(--textMid);margin-top:1px;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.2px;white-space:nowrap}
    .badge-blue{background:var(--blueFade);color:var(--blue);border:1px solid #bfdbfe}
    .badge-indigo{background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe}
    .badge-purple{background:var(--purpleFade);color:var(--purple);border:1px solid #ddd6fe}
    .badge-green{background:var(--greenFade);color:var(--green);border:1px solid #bbf7d0}
    .badge-amber{background:var(--amberFade);color:var(--amber);border:1px solid #fde68a}
    .badge-gray{background:var(--bg);color:var(--textMid);border:1px solid var(--border)}
    .status-btn{padding:5px 11px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;border:none;transition:all .2s}
    .status-active{background:#d1fae5;color:#065f46;border:1px solid #bbf7d0}
    .status-inactive{background:#fee2e2;color:#991b1b;border:1px solid #fecaca}
    .vp-sale-price{font-weight:700;font-size:13.5px}
    .vp-base-price{font-size:11.5px;color:var(--textDim);text-decoration:line-through;margin-top:1px}
    .vp-empty{padding:64px 20px;text-align:center}
    .vp-empty-icon{font-size:40px;margin-bottom:12px;opacity:.25}
    .vp-empty-title{font-size:15px;font-weight:700;margin-bottom:5px}
    .vp-empty-sub{font-size:13px;color:var(--textMid)}
    .sh-row td{height:64px;padding:0 12px}
    .shimmer{border-radius:6px;height:13px;background:linear-gradient(90deg,#f0f2f7 25%,#e4e7ef 50%,#f0f2f7 75%);background-size:300% 100%;animation:shim 1.5s ease infinite}
    @keyframes shim{from{background-position:200% 0}to{background-position:-100% 0}}
    .vp-pager{padding:13px 18px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .vp-pager-info{font-size:12px;color:var(--textMid)}
    .vp-pager-btns{display:flex;gap:4px}
    .pg-btn{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:var(--white);color:var(--textMid);font-size:12px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center}
    .pg-btn:hover{border-color:var(--blue);color:var(--blue)}
    .pg-btn.active{background:var(--blue);border-color:var(--blue);color:#fff;font-weight:700}
    .vp-overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeO .22s ease}
    @keyframes fadeO{from{opacity:0}to{opacity:1}}
    .vp-drawer{background:var(--white);border:1px solid var(--border);border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,.18);width:100%;max-width:720px;max-height:92vh;display:flex;flex-direction:column;animation:modalIn .28s cubic-bezier(.22,1,.36,1)}
    .vp-drawer.copy-drawer{border-color:#fed7aa;box-shadow:0 24px 64px rgba(234,88,12,.15)}
    @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
    .vp-drawer-head{padding:20px 24px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
    .vp-drawer-head.copy-head{background:linear-gradient(135deg,#fff7ed,#ffedd5);border-bottom-color:#fed7aa}
    .vp-drawer-head h2{font-size:15px;font-weight:700;letter-spacing:-.2px}
    .vp-drawer-head p{font-size:12px;color:var(--textMid);margin-top:2px}
    .vp-close{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--textMid);font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
    .vp-close:hover{background:var(--redFade);border-color:var(--red);color:var(--red)}
    .vp-drawer-body{flex:1;overflow-y:auto;padding:22px 24px;scrollbar-width:thin}
    .vp-drawer-foot{padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;flex-shrink:0;background:#fafbfd;border-radius:0 0 16px 16px}
    .vp-drawer-foot.copy-foot{background:linear-gradient(135deg,#fff7ed,#fafbfd);border-top-color:#fed7aa}
    .vp-sec-head{font-size:10.5px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;color:var(--textDim);padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:16px;margin-top:22px}
    .vp-sec-head:first-child{margin-top:0}
    .vp-field{margin-bottom:15px}
    .vp-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .vp-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
    .vp-lbl{display:block;font-size:12px;font-weight:600;color:var(--text);margin-bottom:6px}
    .vp-lbl-sub{font-weight:400;color:var(--textDim);font-size:11px;margin-left:3px}
    .vp-inp,.vp-sel,.vp-ta{width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);background:var(--white);outline:none;transition:border-color .2s,box-shadow .2s}
    .vp-inp::placeholder,.vp-ta::placeholder{color:var(--textDim);font-weight:400}
    .vp-inp:focus,.vp-sel:focus,.vp-ta:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.09)}
    .vp-inp:disabled,.vp-sel:disabled{background:var(--bg);color:var(--textDim);cursor:not-allowed}
    .vp-ta{resize:vertical;min-height:80px;line-height:1.5}
    .price-calc-box{margin-bottom:14px;padding:12px 14px;background:linear-gradient(135deg,#f0f9ff,#eff6ff);border:1px solid #bfdbfe;border-radius:10px}
    .price-calc-row{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;margin-bottom:4px}
    .price-calc-row:last-child{margin-bottom:0;padding-top:8px;border-top:1px solid #bfdbfe;margin-top:8px}
    .price-calc-label{color:var(--textMid);font-weight:500}
    .price-calc-val{font-weight:700;color:var(--text)}
    .price-calc-profit{color:#16a34a;font-weight:700}
    .disc-preview{margin:-4px 0 14px;padding:8px 12px;background:var(--greenFade);border:1px solid #bbf7d0;border-radius:7px;display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--green);font-weight:600}
    .hsn-info-box{margin-top:8px;padding:10px 12px;background:var(--blueFade);border:1px solid #bfdbfe;border-radius:8px;display:flex;gap:10px}
    .hsn-info-code{font-family:monospace;font-size:11px;font-weight:700;color:var(--blue);background:#dbeafe;padding:3px 7px;border-radius:5px;flex-shrink:0;align-self:flex-start}
    .hsn-info-desc{font-size:12px;color:#1e40af;line-height:1.4}
    .img-section-box{padding:14px;border:1px solid var(--border);border-radius:10px;background:#fafbfd}
    .img-section-label{font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--textDim);margin-bottom:10px;display:flex;align-items:center;gap:6px}
    .img-section-label span{padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
    .img-label-main{background:#dbeafe;color:#1d4ed8}
    .img-label-gallery{background:#dcfce7;color:#15803d}
    .bd-wrap{border:1.5px solid #e0f2fe;border-radius:12px;overflow:hidden;background:#f8fbff}
    .bd-header{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-bottom:1px solid #bae6fd}
    .bd-header-icon{width:32px;height:32px;background:white;border:1px solid #bae6fd;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
    .bd-add-btn{padding:5px 12px;background:var(--blue);color:white;border:none;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
    .bd-add-btn:hover{background:var(--blueHov);transform:translateY(-1px)}
    .bd-form-wrap{margin:12px;padding:14px;background:white;border:1px solid #bae6fd;border-radius:10px}
    .bd-form-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:10px}
    .bd-form-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px}
    .bd-lbl{display:block;font-size:11px;font-weight:600;color:var(--textMid);margin-bottom:4px}
    .bd-inp{width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:var(--text);outline:none;transition:border-color .2s}
    .bd-inp:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.08)}
    .bd-preview{padding:8px 12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:7px;display:flex;align-items:center;gap:8px;font-size:12px;color:#0369a1;margin-bottom:8px}
    .bd-savings-chip{display:inline-flex;padding:2px 7px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:10px;font-weight:700;margin-left:6px}
    .bd-error{padding:7px 10px;background:var(--redFade);border:1px solid #fecaca;border-radius:7px;color:var(--red);font-size:11.5px;margin-bottom:8px}
    .bd-save-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;background:var(--blue);color:white;border:none;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
    .bd-save-btn:disabled{opacity:.6;cursor:not-allowed}
    .bd-cancel-btn{padding:6px 12px;background:transparent;border:1px solid var(--border);border-radius:7px;color:var(--textMid);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;cursor:pointer}
    .bd-loading{padding:12px 16px;display:flex;flex-direction:column;gap:8px}
    .bd-skeleton{height:52px;background:linear-gradient(90deg,#f0f2f7 25%,#e4e7ef 50%,#f0f2f7 75%);background-size:300% 100%;animation:shim 1.5s ease infinite;border-radius:8px}
    .bd-empty{padding:20px 16px;text-align:center}
    .bd-empty-icon{font-size:28px;opacity:.2;margin-bottom:8px}
    .bd-rules-list{padding:10px 12px;display:flex;flex-direction:column;gap:8px}
    .bd-rule-card{background:white;border:1px solid #e0f2fe;border-radius:9px;padding:10px 12px;display:flex;align-items:center;gap:10px;transition:box-shadow .15s;flex-wrap:wrap}
    .bd-rule-card:hover{box-shadow:0 2px 10px rgba(37,99,235,.08)}
    .bd-rule-tier-badge{font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:#e0f2fe;padding:3px 7px;border-radius:20px;flex-shrink:0}
    .bd-rule-main{display:flex;align-items:center;gap:8px;flex:1;min-width:0;flex-wrap:wrap}
    .bd-qty-label{font-size:12px;font-weight:700;color:var(--text)}
    .bd-rule-arrow{color:var(--textDim);font-size:12px;flex-shrink:0}
    .bd-unit-price{font-size:14px;font-weight:800;color:var(--blue)}
    .bd-per-unit{font-size:10px;color:var(--textDim)}
    .bd-savings-tag{font-size:10px;font-weight:700;color:#16a34a;background:#dcfce7;padding:2px 6px;border-radius:20px}
    .bd-savings-abs{font-size:10px;color:var(--textDim)}
    .bd-rule-actions{display:flex;gap:5px;flex-shrink:0}
    .bd-edit-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--white);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
    .bd-edit-btn:hover{border-color:var(--blue);background:var(--blueFade)}
    .bd-del-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--white);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
    .bd-del-btn:hover{border-color:var(--red);background:var(--redFade)}
    .bd-ladder{margin:0 0 4px;padding:10px 12px;background:#f0f9ff;border:1px dashed #bae6fd;border-radius:8px}
    .bd-ladder-title{font-size:10px;font-weight:700;color:#0369a1;margin-bottom:8px;letter-spacing:.4px;text-transform:uppercase}
    .bd-ladder-bars{display:flex;flex-direction:column;gap:5px}
    .bd-ladder-row{display:flex;align-items:center;gap:8px}
    .bd-ladder-qty{font-size:10px;font-weight:600;color:var(--textMid);width:60px;flex-shrink:0;text-align:right}
    .bd-ladder-bar-wrap{flex:1;height:10px;background:#e0f2fe;border-radius:20px;overflow:hidden}
    .bd-ladder-bar{height:100%;border-radius:20px;transition:width .4s ease}
    .bd-ladder-price{font-size:10px;font-weight:700;color:var(--blue);width:80px;flex-shrink:0;display:flex;align-items:center;gap:4px}
    .bd-ladder-pct{font-size:9px;font-weight:700;color:#16a34a;background:#dcfce7;padding:1px 5px;border-radius:20px}
    .bd-del-overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px}
    .bd-del-modal{background:white;border-radius:12px;padding:22px;width:280px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:popIn .2s cubic-bezier(.22,1,.36,1)}
    @keyframes popIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    .bpr-trigger{display:flex;align-items:center;gap:5px;padding:4px 9px;border:1px solid #bae6fd;border-radius:7px;background:#f0f9ff;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;color:#0369a1;transition:all .15s;white-space:nowrap}
    .bpr-trigger:hover{background:#e0f2fe;border-color:#7dd3fc}
    .bpr-icon{font-size:12px}
    .bpr-label{font-weight:600}
    .bpr-saving{padding:2px 6px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:10px;font-weight:700}
    .bpr-popup{position:absolute;top:calc(100% + 6px);left:0;z-index:200;background:white;border:1px solid #bae6fd;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.14);min-width:260px;overflow:hidden}
    .bpr-popup-title{padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:#f0f9ff;border-bottom:1px solid #bae6fd;display:flex;align-items:center}
    .bpr-row{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid #f0f9ff;font-size:12px}
    .bpr-tier-num{width:22px;height:22px;background:#0369a1;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0}
    .bpr-qty-range{flex:1;font-weight:600;color:var(--text)}
    .bpr-arrow{color:var(--textDim);font-size:11px}
    .bpr-price{font-weight:800;color:var(--blue)}
    .bpr-pct{padding:2px 6px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:10px;font-weight:700}
    .bpr-base-row{display:flex;justify-content:space-between;padding:8px 12px;background:#f8fafc;border-top:1px solid var(--border)}
    .hsn-btn{width:100%;display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:8px;padding:9px 11px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;background:var(--white);cursor:pointer;text-align:left;transition:all .2s;color:var(--text)}
    .hsn-btn:hover{border-color:var(--border2)}
    .hsn-btn-open{border-color:var(--blue)!important;box-shadow:0 0 0 3px rgba(37,99,235,.09)}
    .hsn-code{font-family:monospace;font-size:11px;font-weight:700;background:#f3f4f6;color:var(--text);padding:2px 6px;border-radius:4px;flex-shrink:0}
    .hsn-desc{font-size:12px;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hsn-placeholder{color:var(--textDim);font-size:13px;flex:1}
    .hsn-clear{color:var(--textDim);font-size:12px;padding:2px 4px;cursor:pointer;flex-shrink:0}
    .hsn-clear:hover{color:var(--red)}
    .gst-badge{display:inline-flex;align-items:center;font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;flex-shrink:0;white-space:nowrap}
    .hsn-dropdown{position:absolute;z-index:200;top:calc(100% + 6px);left:0;right:0;min-width:340px;background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.14);overflow:hidden}
    .hsn-search{width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;outline:none;transition:border-color .2s}
    .hsn-search:focus{border-color:var(--blue)}
    .hsn-cat-bar{display:flex;gap:6px;padding:6px 10px;overflow-x:auto;border-bottom:1px solid var(--border);scrollbar-width:none}
    .hsn-cat-pill{flex-shrink:0;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;border:none;background:#f3f4f6;color:var(--textMid);cursor:pointer;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
    .hsn-cat-pill:hover{background:var(--border2)}
    .hsn-cat-pill-active{background:var(--blue)!important;color:white!important}
    .hsn-list{max-height:220px;overflow-y:auto;padding:6px}
    .hsn-empty{padding:24px;text-align:center;color:var(--textDim);font-size:13px}
    .hsn-item{width:100%;display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border:none;border-radius:8px;background:transparent;cursor:pointer;text-align:left;transition:background .12s;font-family:'Plus Jakarta Sans',sans-serif}
    .hsn-item:hover,.hsn-item-high{background:#f8fafc}
    .hsn-item-selected{background:var(--blueFade)!important}
    .hsn-item-code{font-family:monospace;font-size:10px;font-weight:700;padding:3px 6px;border-radius:4px;background:#f3f4f6;color:var(--text);flex-shrink:0;margin-top:1px}
    .hsn-item-code-sel{background:var(--blue)!important;color:white!important}
    .hsn-item-desc{font-size:12px;color:var(--text);line-height:1.3}
    .hsn-item-cat{font-size:10px;color:var(--textDim);margin-top:2px}
    .hsn-footer{padding:7px 12px;border-top:1px solid var(--border);font-size:10px;color:var(--textDim);background:#f8f9fc}
    .vp-modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.52);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeO .2s ease}
    .vp-modal{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:28px;width:360px;box-shadow:var(--shadowLg);animation:popIn .22s cubic-bezier(.22,1,.36,1)}
    .vp-modal-ico{width:44px;height:44px;background:var(--redFade);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
    .vp-modal h3{font-size:16px;font-weight:700;margin-bottom:8px}
    .vp-modal p{font-size:13px;color:var(--textMid);line-height:1.65;margin-bottom:22px}
    .vp-modal-row{display:flex;gap:10px}
    .btn-danger{flex:1;padding:10px;background:var(--red);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer}
    .vp-toast{position:fixed;bottom:22px;right:22px;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:9px;z-index:999;white-space:nowrap;animation:toastUp .28s cubic-bezier(.22,1,.36,1);box-shadow:0 8px 28px rgba(0,0,0,.14)}
    @keyframes toastUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .vp-toast.success{background:#052e16;color:#86efac;border:1px solid #166534}
    .vp-toast.error{background:#450a0a;color:#fca5a5;border:1px solid #991b1b}
    .toast-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
    .vp-toast.success .toast-dot{background:#22c55e}
    .vp-toast.error .toast-dot{background:var(--red)}
    .fade-up{animation:fadeUp .4s ease both}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    input[type="checkbox"]{width:15px;height:15px;accent-color:var(--blue);cursor:pointer}
    .action-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    @media(max-width:768px){
      .vp-stats{grid-template-columns:1fr 1fr}
      .vp-body{padding:16px 14px 60px}
      .vp-topbar{padding:0 14px}
      .vp-search{width:140px}
      .vp-overlay{padding:12px}
      .vp-drawer{max-height:95vh;border-radius:14px;max-width:100%}
      .vp-row2,.vp-row3{grid-template-columns:1fr}
      .bd-form-grid{grid-template-columns:1fr}
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="vp">
        {/* Topbar */}
        <div className="vp-topbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="vp-topbar-icon">🏪</div>
            <span className="vp-topbar-name">Seller Panel</span>
            <div className="vp-topbar-sep" />
            <span className="vp-topbar-page">Products</span>
          </div>
        </div>

        <div className="vp-body">
          {/* Page header */}
          <div className="vp-page-header fade-up">
            <div>
              <h1>Products</h1>
              <p>{products.length} products &middot; {categories.length} categories &middot; {hsnCodes.length} HSN codes &middot;{" "}
                <span style={{ color: "var(--teal)", fontWeight: 600 }}>{allBulkRules.length} bulk rule{allBulkRules.length !== 1 ? "s" : ""}</span>
              </p>
            </div>
            <button className="btn-primary" onClick={() => { resetForm(); setDrawer(true); }}>+ Add Product</button>
          </div>

          {/* Stats */}
          <div className="vp-stats fade-up" style={{ animationDelay: "0.05s" }}>
            {[
              { icon: "📦", bg: "#eff6ff", val: products.length, lbl: "Total Products" },
              { icon: "✅", bg: "#f0fdf4", val: products.filter((p) => p.status === "active").length, lbl: "Active" },
              { icon: "🏷️", bg: "#fffbeb", val: products.filter((p) => p.salePrice < p.basePrice).length, lbl: "On Sale" },
              { icon: "💰", bg: "#fdf4ff", val: `Rs.${products.reduce((s, p) => s + (Number(p.basePrice) || 0), 0).toLocaleString()}`, lbl: "Catalogue Value" },
            ].map((s, i) => (
              <div className="vp-stat" key={i}>
                <div className="vp-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="vp-stat-val">{s.val}</div>
                  <div className="vp-stat-lbl">{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk action bar */}
          {selectedItems.length > 0 && (
            <div className="vp-bulk-bar fade-up">
              {!bulkMode ? (
                <div className="action-row">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4338ca" }}>{selectedItems.length} selected</span>
                  <button className="btn-primary" onClick={() => setBulkMode(true)}>Bulk Edit</button>
                  <button className="btn-danger-sm" onClick={handleBulkDelete}>Delete</button>
                  <button className="btn-ghost" onClick={handleExportSelected}>Export</button>
                  <button className="btn-ghost" onClick={handleBulkCopy}>Copy All</button>
                  <button className="btn-ghost" style={{ color: "var(--textDim)" }} onClick={() => setSelectedItems([])}>Clear</button>
                </div>
              ) : (
                <div className="vp-bulk-panel">
                  <div className="vp-bulk-title">Bulk Edit — {selectedItems.length} Products</div>
                  <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
                    {products.filter((x) => selectedItems.includes(x._id)).map((item) => (
                      <div key={item._id} className="vp-bulk-item">
                        <div className="vp-bulk-item-name">{item.name}</div>
                        <div className="vp-bulk-grid">
                          {[
                            { label: "Brand", key: "brand", type: "text" },
                            { label: "Base Price", key: "basePrice", type: "number" },
                            { label: "Profit", key: "profit", type: "number" },
                            { label: "Sale Price", key: "salePrice", type: "number" },
                            { label: "GST %", key: "gstPercent", type: "number" },
                            { label: "HSN Code", key: "hsnCode", type: "text" },
                          ].map(({ label, key, type }) => (
                            <div key={key}>
                              <label className="vp-lbl" style={{ fontSize: 11 }}>{label}</label>
                              <input className="vp-inp" type={type} value={item[key] ?? ""}
                                onChange={(e) => updateLocal(item._id, key, type === "number" ? Number(e.target.value) : e.target.value)} />
                            </div>
                          ))}
                          <div>
                            <label className="vp-lbl" style={{ fontSize: 11 }}>Status</label>
                            <select className="vp-sel" value={item.status} onChange={(e) => updateLocal(item._id, "status", e.target.value)}>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="action-row" style={{ marginTop: 12 }}>
                    <button className="btn-primary" onClick={handleBulkSave}>Save All</button>
                    <button className="btn-ghost" onClick={() => setBulkMode(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main table card */}
          <div className="vp-card fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="vp-toolbar">
              <div className="vp-toolbar-left">
                <div className="vp-search-wrap">
                  <span className="vp-search-ico">⌕</span>
                  <input className="vp-search" placeholder="Search name, brand, HSN..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="vp-sel-filter" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {filterSubs.length > 0 && (
                  <select className="vp-sel-filter" value={filterSubcategory} onChange={(e) => { setFilterSubcategory(e.target.value); setPage(1); }}>
                    <option value="">All Subcategories</option>
                    {filterSubs.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                )}
                {filterSubSubs.length > 0 && (
                  <select className="vp-sel-filter" value={filterSubSubCat} onChange={(e) => { setFilterSubSubCat(e.target.value); setPage(1); }}>
                    <option value="">All Sub-Subs</option>
                    {filterSubSubs.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                )}
                <select className="vp-sel-filter" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {search && <span className="vp-results-badge">{filtered.length} results</span>}
              </div>
              <div className="action-row">
                <button className="btn-ghost" onClick={async () => {
                  try {
                    const res = await axiosAuth.get(`${API_URL}/export`, { responseType: "blob" });
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const a = document.createElement("a"); a.href = url; a.download = "vendor_products.csv"; a.click();
                    window.URL.revokeObjectURL(url);
                  } catch { notify("Export failed.", "error"); }
                }}>Export CSV</button>
                <label style={{ cursor: "pointer" }}>
                  <input type="file" accept=".csv" style={{ display: "none" }} onChange={async (e) => {
                    try {
                      const fd = new FormData(); fd.append("file", e.target.files[0]);
                      const res = await axiosAuth.post(`${API_URL}/import`, fd);
                      notify(`Imported ${res.data.imported} products.`);
                      fetchProducts();
                    } catch { notify("Import failed.", "error"); }
                    e.target.value = "";
                  }} />
                  <span className="btn-ghost">Import CSV</span>
                </label>
              </div>
            </div>

            <div className="vp-table-wrap">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox"
                        checked={selectedItems.length === filtered.length && filtered.length > 0}
                        onChange={() => setSelectedItems(selectedItems.length === filtered.length ? [] : filtered.map((x) => x._id))} />
                    </th>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>HSN / GST</th>
                    <th>Weight</th>
                    <th>Base Price</th>
                    <th>Profit</th>
                    <th>Sale Price</th>
                    <th>Bulk Tiers</th>
                    <th>Disc.</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr className="sh-row" key={i}>
                        {[36, 20, 220, 100, 160, 80, 80, 70, 80, 100, 70, 80, 80].map((w, j) => (
                          <td key={j}><div className="shimmer" style={{ width: w }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={13}>
                        <div className="vp-empty">
                          <div className="vp-empty-icon">📦</div>
                          <div className="vp-empty-title">{search ? "No products found" : "No products yet"}</div>
                          <div className="vp-empty-sub">{search ? `No results for "${search}"` : "Click 'Add Product' to get started"}</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p, i) => {
                      const pct = discountPct(p);
                      const dAmt = (Number(p.basePrice) || 0) - (Number(p.salePrice) || 0);
                      const hsnInfo = hsnCodes.find((h) => h.code === p.hsnCode);
                      const gstKey = hsnInfo?.gst ?? p.gstPercent ?? 0;
                      const badge = GST_BADGE[gstKey] ?? GST_BADGE[0];

                      return (
                        <tr key={p._id}>
                          <td>
                            <input type="checkbox" checked={selectedItems.includes(p._id)}
                              onChange={() => setSelectedItems((prev) => prev.includes(p._id) ? prev.filter((x) => x !== p._id) : [...prev, p._id])} />
                          </td>
                          <td style={{ color: "var(--textDim)", fontSize: 12 }}>{start + i + 1}</td>
                          <td>
                            <div className="vp-prod-cell">
                              <ProductImageCell image={p.image} galleryImages={p.galleryImages} name={p.name} />
                              <div>
                                <div className="vp-prod-name">{p.name}</div>
                                {p.brand && <div className="vp-prod-brand">{p.brand}</div>}
                                {p.description && <div className="vp-prod-desc">{p.description}</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            {p.category?.name ? (
                              <span className="badge badge-blue">{p.category.name}</span>
                            ) : (
                              <span style={{ color: "var(--textDim)" }}>—</span>
                            )}
                            {p.subcategory?.name && <div style={{ marginTop: 3 }}><span className="badge badge-indigo">&rarr; {p.subcategory.name}</span></div>}
                            {p.subSubCategory?.name && <div style={{ marginTop: 3 }}><span className="badge badge-purple">&rarr; {p.subSubCategory.name}</span></div>}
                          </td>
                          <td style={{ minWidth: 160 }}>
                            {p.hsnCode ? (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{p.hsnCode}</span>
                                  <span className="gst-badge" style={{ background: badge.bg, color: badge.text }}>
                                    <span style={{ background: badge.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />
                                    GST {p.gstPercent ?? 0}%
                                  </span>
                                </div>
                                {hsnInfo && <div style={{ fontSize: 10, color: "var(--textDim)", marginTop: 3, maxWidth: 180 }}>{hsnInfo.description}</div>}
                                <div style={{ fontSize: 10, color: "var(--textDim)", marginTop: 2, textTransform: "uppercase" }}>{p.taxType === "igst" ? "IGST" : "CGST+SGST"}</div>
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: "var(--textDim)", fontStyle: "italic" }}>Not set</span>
                            )}
                          </td>
                          <td>
                            {p.weight?.value ? (
                              <span className="badge badge-gray">{p.weight.value} {p.weight.unit}</span>
                            ) : <span style={{ color: "var(--textDim)" }}>—</span>}
                          </td>
                          <td>
                            <InlinePrice value={p.basePrice} onSave={(v) => handleInlineBasePrice(p._id, v)} />
                          </td>
                          {/* ✅ Profit column — properly show hoga */}
                          <td>
                            {Number(p.profit) > 0 ? (
                              <span className="badge badge-green">+Rs.{p.profit}</span>
                            ) : (
                              <span style={{ color: "var(--textDim)" }}>—</span>
                            )}
                          </td>
                          <td>
                            <div className="vp-sale-price">Rs.{p.salePrice}</div>
                            {dAmt > 0 && <div className="vp-base-price">Rs.{p.basePrice}</div>}
                          </td>
                          <td style={{ minWidth: 130 }}>
                            <BulkPriceRangeCell productId={p._id} basePrice={p.basePrice} salePrice={p.salePrice} allBulkRules={allBulkRules} />
                          </td>
                          <td>
                            {dAmt > 0 ? <span className="badge badge-green">{pct}% off</span> : <span style={{ color: "var(--textDim)" }}>—</span>}
                          </td>
                          <td>
                            <button className={`status-btn ${p.status === "active" ? "status-active" : "status-inactive"}`} onClick={() => handleStatusToggle(p)}>
                              {p.status === "active" ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button className="btn-icon btn-edit" onClick={() => handleEdit(p)} title="Edit">✏️</button>
                              <button className="btn-icon btn-copy-icon" onClick={() => handleCopy(p)} title="Copy">📄</button>
                              <button className="btn-icon btn-del" onClick={() => setDeleteId(p._id)} title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="vp-pager">
                <span className="vp-pager-info">Showing {start + 1}–{Math.min(start + limit, filtered.length)} of {filtered.length}</span>
                <div className="vp-pager-btns">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} className={`pg-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DRAWER ── */}
      {drawer && (
        <div className="vp-overlay" onClick={resetForm}>
          <div className={`vp-drawer${copyMode ? " copy-drawer" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={`vp-drawer-head${copyMode ? " copy-head" : ""}`}>
              <div>
                <h2>{copyMode ? "Copy Product" : editId ? "Edit Product" : "Add New Product"}</h2>
              </div>
              <button className="vp-close" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="vp-drawer-body">
                {copyMode && (
                  <div className="copy-mode-banner" style={{ marginBottom: 18 }}>
                    <span className="copy-mode-badge">COPY MODE</span>
                    <span style={{ fontSize: 12, color: "var(--orange)" }}>Yeh product copy hoga — naam change karna mat bhoolein</span>
                  </div>
                )}

                {/* Basic Info */}
                <div className="vp-sec-head">Basic Information</div>
                <div className="vp-row2">
                  <div className="vp-field">
                    <label className="vp-lbl">Product Name *</label>
                    <input className="vp-inp" name="name" placeholder="e.g. Organic Almonds" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="vp-field">
                    <label className="vp-lbl">Brand <span className="vp-lbl-sub">(optional)</span></label>
                    <input className="vp-inp" name="brand" placeholder="e.g. Amul, Tata" value={form.brand} onChange={handleChange} />
                  </div>
                </div>
                <div className="vp-field">
                  <label className="vp-lbl">Status</label>
                  <select className="vp-sel" name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Category */}
                <div className="vp-sec-head">Category</div>
                <div className="vp-field">
                  <label className="vp-lbl">Category *</label>
                  <select className="vp-sel" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="vp-row2">
                  <div className="vp-field">
                    <label className="vp-lbl">Subcategory <span className="vp-lbl-sub">(optional)</span></label>
                    <select className="vp-sel" name="subcategory" value={form.subcategory} onChange={handleChange} disabled={!subcategories.length}>
                      <option value="">None</option>
                      {subcategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="vp-field">
                    <label className="vp-lbl">Sub-Subcategory <span className="vp-lbl-sub">(optional)</span></label>
                    <select className="vp-sel" name="subSubCategory" value={form.subSubCategory} onChange={handleChange} disabled={!subSubCats.length}>
                      <option value="">None</option>
                      {subSubCats.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="vp-sec-head">Pricing & Tax</div>
                <div className="vp-row2" style={{ marginBottom: 0 }}>
                  <div className="vp-field">
                    <label className="vp-lbl">Base Price (Rs.) * <span className="vp-lbl-sub">cost price</span></label>
                    <input className="vp-inp" type="number" name="basePrice" placeholder="0.00" value={form.basePrice} onChange={handleChange} min="0" step="0.01" required />
                  </div>
                  <div className="vp-field">
                    <label className="vp-lbl">Profit (Rs.)</label>
                    <input className="vp-inp" type="number" name="profit" placeholder="0.00" value={form.profit}
                      onChange={(e) => setForm((p) => ({ ...p, profit: e.target.value, _manualSale: false }))}
                      min="0" step="0.01" />
                  </div>
                </div>

                {/* Price calc preview */}
                {previewBase > 0 && (
                  <div className="price-calc-box">
                    <div className="price-calc-row">
                      <span className="price-calc-label">Base Price</span>
                      <span className="price-calc-val">Rs.{previewBase.toFixed(2)}</span>
                    </div>
                    <div className="price-calc-row">
                      <span className="price-calc-label">+ Profit</span>
                      <span className="price-calc-profit">+Rs.{previewProfit.toFixed(2)}</span>
                    </div>
                    <div className="price-calc-row">
                      <span className="price-calc-label" style={{ fontWeight: 700, color: "var(--text)" }}>= Sale Price</span>
                      <span className="price-calc-val" style={{ fontSize: 15, color: "var(--blue)" }}>Rs.{previewSale.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="vp-row2">
                  <div className="vp-field">
                    <label className="vp-lbl">Sale Price (Rs.) <span className="vp-lbl-sub">override</span></label>
                    <input className="vp-inp" type="number" name="salePrice" placeholder="Auto-calculated" value={form.salePrice} onChange={handleChange} min="0" step="0.01" />
                  </div>
                  <div className="vp-field">
                    <label className="vp-lbl">GST %</label>
                    <select className="vp-sel" name="gstPercent" value={form.gstPercent} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="0">0% (Exempt)</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                </div>

                {showDisc && (
                  <div className="disc-preview">
                    Markup {Math.round(((previewSale - previewBase) / previewBase) * 100)}% &middot; Rs.{(previewSale - previewBase).toFixed(2)} profit per unit
                  </div>
                )}

                <div className="vp-field" style={{ marginTop: 4 }}>
                  <label className="vp-lbl">HSN Code <span className="vp-lbl-sub">(optional)</span></label>
                  <HsnPicker value={form.hsnCode} onSelect={handleHsnSelect} hsnCodes={hsnCodes} hsnCategories={hsnCategories} onAddNew={() => setShowAddHsn(true)} css={hsnCss} />
                  {form.hsnCode && (() => {
                    const hsn = hsnCodes.find((h) => h.code === form.hsnCode);
                    if (!hsn) return null;
                    const b = GST_BADGE[hsn.gst] ?? GST_BADGE[0];
                    return (
                      <div className="hsn-info-box">
                        <span className="hsn-info-code">{hsn.code}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span className="gst-badge" style={{ background: b.bg, color: b.text }}>
                              <span style={{ background: b.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />
                              GST {hsn.gst}%
                            </span>
                            <span style={{ fontSize: 10, color: "var(--textDim)" }}>{hsn.category}</span>
                          </div>
                          <div className="hsn-info-desc">{hsn.description}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="vp-row2">
                  <div className="vp-field">
                    <label className="vp-lbl">Tax Type</label>
                    <select className="vp-sel" name="taxType" value={form.taxType} onChange={handleChange}>
                      <option value="cgst_sgst">CGST + SGST (Intra-state)</option>
                      <option value="igst">IGST (Inter-state)</option>
                    </select>
                  </div>
                  <div className="vp-field">
                    <label className="vp-lbl">Valid Till</label>
                    <input className="vp-inp" type="date" name="validTill" value={form.validTill} onChange={handleChange} />
                  </div>
                </div>

                {/* Bulk Discount */}
                <div className="vp-sec-head" style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Bulk Discount Pricing</span>
                  {!editId && tempBulkRules.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 20, border: "1px solid #fde68a", textTransform: "none", letterSpacing: 0 }}>
                      {tempBulkRules.length} pending tier{tempBulkRules.length > 1 ? "s" : ""} — product save hone pe link honge
                    </span>
                  )}
                </div>
                <BulkDiscountManager productId={editId} basePrice={form.basePrice} salePrice={form.salePrice} onTempChange={handleTempBulkChange} />

                {/* Weight */}
                <div className="vp-sec-head">Weight & Quantity</div>
                <div className="vp-row2">
                  <div className="vp-field">
                    <label className="vp-lbl">Weight / Quantity</label>
                    <input className="vp-inp" type="number" name="weightValue" placeholder="e.g. 500" value={form.weightValue} onChange={handleChange} min="0" />
                  </div>
                  <div className="vp-field">
                    <label className="vp-lbl">Unit</label>
                    <select className="vp-sel" name="weightUnit" value={form.weightUnit} onChange={handleChange}>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gm">Gram (gm)</option>
                      <option value="ltr">Litre (ltr)</option>
                      <option value="ml">Millilitre (ml)</option>
                      <option value="pcs">Pieces (pcs)</option>
                    </select>
                  </div>
                </div>

                {/* Images */}
                <div className="vp-sec-head">Images</div>
                <div className="img-section-box" style={{ marginBottom: 14 }}>
                  <div className="img-section-label">
                    <span className="img-label-main">Main Image</span>
                    <span style={{ fontSize: 11, color: "var(--textDim)", fontWeight: 400 }}>Cover / listing image</span>
                  </div>
                  <MainImageUploader key={`main-${uploaderKey}`} file={form.mainImageFile} existingUrl={form.existingMainImage} onChange={handleMainImageChange} />
                </div>
                <div className="img-section-box">
                  <div className="img-section-label">
                    <span className="img-label-gallery">Gallery Images</span>
                    <span style={{ fontSize: 11, color: "var(--textDim)", fontWeight: 400 }}>Up to 4 images · drag to reorder</span>
                  </div>
                  <GalleryUploader key={`gallery-${uploaderKey}`} galleryFiles={form.galleryFiles} existingGalleryImages={form.existingGalleryImages} onChange={handleGalleryChange} />
                </div>

                {/* Description */}
                <div className="vp-sec-head" style={{ marginTop: 20 }}>Description</div>
                <div className="vp-field">
                  <textarea className="vp-ta" name="description" placeholder="Brief product description (optional)..." value={form.description} onChange={handleChange} />
                </div>
              </div>

              <div className={`vp-drawer-foot${copyMode ? " copy-foot" : ""}`}>
                {copyMode ? (
                  <button type="submit" className="btn-copy" style={{ flex: 1, justifyContent: "center" }} disabled={submitting}>
                    {submitting ? "Saving..." : `Save as New Product${tempBulkRules.length ? ` + ${tempBulkRules.length} tier(s)` : ""}`}
                  </button>
                ) : (
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={submitting}>
                    {submitting ? "Saving..." : editId ? "Update Product" : `Add Product${tempBulkRules.length ? ` + ${tempBulkRules.length} tier(s)` : ""}`}
                  </button>
                )}
                <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddHsn && <AddHsnModal onClose={() => setShowAddHsn(false)} onSaved={handleHsnAdded} existingCategories={hsnCategories} />}

      {deleteId && (
        <div className="vp-modal-bg">
          <div className="vp-modal">
            <div className="vp-modal-ico">🗑️</div>
            <h3>Delete this product?</h3>
            <p>Yeh action undo nahi ho sakta.</p>
            <div className="vp-modal-row">
              <button className="btn-danger" onClick={handleDelete}>Yes, Delete</button>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`vp-toast ${toast.type}`}>
          <div className="toast-dot" />
          {toast.msg}
        </div>
      )}
    </>
  );
}
