// import React, { useEffect, useState, useRef, useCallback } from "react";
// import axios from "axios";

// const API_URL      = "https://foodhelpervendor.onrender.com/api/vendor/products";
// const CATEGORY_URL = "https://grocerrybackend.onrender.com/api/categories";
// const BRAND_API    = "https://foodhelpervendor.onrender.com/api/brands";
// const HSN_API_URL  = `${API_URL}/hsn-codes`;
// const BULK_API_URL = "https://foodhelpervendor.onrender.com/api/vendor/bulk-discounts";
// const TOKEN_KEY    = "vendorToken";

// const axiosAuth = axios.create();
// axiosAuth.interceptors.request.use((config) => {
//   const token = localStorage.getItem(TOKEN_KEY);
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// const MAX_GALLERY = 4;
// const DOZEN_SIZE  = 12;
// const CARTON_SIZE = 100;

// const GST_BADGE = {
//   0:  { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
//   5:  { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
//   12: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
//   18: { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
//   28: { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
// };

// const EMPTY = {
//   name: "", brand: "", category: "", subcategory: "", subSubCategory: "",
//   description: "", basePrice: "", profit: "", salePrice: "",mrp: "",
//   weightValue: "", weightUnit: "kg", status: "inactive",
//   gstPercent: "", cessPercent: "0", hsnCode: "", taxType: "cgst_sgst",
//   validTill: "",
//   mainImageFile: null, existingMainImage: "",
//   galleryFiles: [], existingGalleryImages: [],
//   packaging: { box: 0, packetPerBox: 0, piecePerPacket: 0 },
//   unitConversions: [],
//   _manualSale: false,
// };

// const EMPTY_HSN_FORM = { code: "", description: "", category: "", gst: "0", cess: "0" };
// const EMPTY_BULK     = { minQty: "", maxQty: "", profit: "", unitPrice: "", _manualUnit: false };

// /* ══════════════════════════════════════════════════════════════
//    GST CALCULATOR  (base + profit = salePrice, GST inside)
// ══════════════════════════════════════════════════════════════ */
// function calcGstBreakdown(base, profit, gstPercent, cessPercent, taxType) {
//   const salePrice = (Number(base) || 0) + (Number(profit) || 0);
//   const gst  = Number(gstPercent)  || 0;
//   const cess = Number(cessPercent) || 0;
//   const gstAmount      = (salePrice * gst)  / (100 + gst);
//   const cessAmount     = (salePrice * cess) / (100 + cess);
//   const totalTaxAmount = gstAmount + cessAmount;
//   const priceExcludingGst = salePrice - totalTaxAmount;
//   const isIgst = taxType === "igst";
//   const r2 = (n) => Math.round(n * 100) / 100;
//   return {
//     salePrice: r2(salePrice),
//     priceExcludingGst: r2(priceExcludingGst),
//     gstAmount:      r2(gstAmount),
//     cessAmount:     r2(cessAmount),
//     totalTaxAmount: r2(totalTaxAmount),
//     cgstPercent:    r2(isIgst ? 0 : gst / 2),
//     sgstPercent:    r2(isIgst ? 0 : gst / 2),
//     igstPercent:    r2(isIgst ? gst : 0),
//     cgstAmount:     r2(isIgst ? 0 : gstAmount / 2),
//     sgstAmount:     r2(isIgst ? 0 : gstAmount / 2),
//     igstAmount:     r2(isIgst ? gstAmount : 0),
//   };
// }


// function pcsToDisplay(totalPcs, conversions) {
//   if (totalPcs == null || totalPcs === "") return "—";
//   const n = Number(totalPcs);
//   if (isNaN(n) || n <= 0) return `${n} pcs`;

//   // Use custom conversions if provided and non-empty
//   if (conversions && conversions.length > 0) {
//     // Sort by nPcs descending so largest unit comes first
//     const sorted = [...conversions].sort((a, b) => b.nPcs - a.nPcs);
//     let remaining = n;
//     const parts = [];
//     for (const conv of sorted) {
//       const nPcs = Number(conv.nPcs);
//       if (!nPcs || nPcs <= 0) continue;
//       const count = Math.floor(remaining / nPcs);
//       if (count > 0) {
//         parts.push(`${count} ${conv.unit}`);
//         remaining = remaining % nPcs;
//       }
//     }
//     if (remaining > 0) parts.push(`${remaining} pcs`);
//     return parts.length ? parts.join(" ") : `${n} pcs`;
//   }

//   // Fallback: default dozen / carton logic
//   const cartons = Math.floor(n / CARTON_SIZE);
//   const rem1    = n % CARTON_SIZE;
//   const dozens  = Math.floor(rem1 / DOZEN_SIZE);
//   const singles = rem1 % DOZEN_SIZE;
//   const parts   = [];
//   if (cartons > 0) parts.push(`${cartons} Carton${cartons > 1 ? "s" : ""}`);
//   if (dozens  > 0) parts.push(`${dozens} Dozen${dozens  > 1 ? "s" : ""}`);
//   if (singles > 0) parts.push(`${singles} pcs`);
//   return parts.length ? parts.join(" ") : `${n} pcs`;
// }

// function toPcs(qty, unit) {
//   const n = Number(qty) || 0;
//   if (unit === "dozen")  return n * DOZEN_SIZE;
//   if (unit === "carton") return n * CARTON_SIZE;
//   return n;
// }

// /* ══════════════════════════════════════════════════════════════
//    BRAND PICKER  — dropdown + inline Add Brand modal
// ══════════════════════════════════════════════════════════════ */
// function BrandPicker({ value, brands, onSelect, onBrandAdded }) {
//   const [open, setOpen]           = useState(false);
//   const [query, setQuery]         = useState("");
//   const [showAdd, setShowAdd]     = useState(false);
//   const [newName, setNewName]     = useState("");
//   const [newFile, setNewFile]     = useState(null);
//   const [newPreview, setNewPreview] = useState(null);
//   const [saving, setSaving]       = useState(false);
//   const [addError, setAddError]   = useState("");
//   const wrapRef  = useRef(null);
//   const inputRef = useRef(null);
//   const fileRef  = useRef(null);

//   const selected = brands.find((b) => b._id === value) || null;

//   const filtered = brands.filter((b) =>
//     !query || b.name.toLowerCase().includes(query.toLowerCase())
//   );

//   useEffect(() => {
//     const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   const pick = (b) => { onSelect(b._id); setOpen(false); setQuery(""); };
//   const clear = (e) => { e.stopPropagation(); onSelect(""); };

//   const handleFileChange = (f) => {
//     if (!f || !f.type.startsWith("image/")) return;
//     setNewFile(f);
//     setNewPreview(URL.createObjectURL(f));
//     setAddError("");
//   };

//   const handleAddBrand = async () => {
//     if (!newName.trim())  { setAddError("Brand name required"); return; }
//     if (!newFile)         { setAddError("Brand image required"); return; }
//     try {
//       setSaving(true);
//       const fd = new FormData();
//       fd.append("name",  newName.trim());
//       fd.append("image", newFile);
//       const res = await axiosAuth.post(BRAND_API, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (res.data?.success) {
//         onBrandAdded(res.data.data);
//         onSelect(res.data.data._id);
//         setShowAdd(false); setNewName(""); setNewFile(null); setNewPreview(null); setAddError("");
//         setOpen(false);
//       }
//     } catch (err) {
//       setAddError(err.response?.data?.message || "Brand save failed");
//     } finally { setSaving(false); }
//   };

//   return (
//     <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
//       <div style={{ display: "flex", gap: 6 }}>
//         <button type="button"
//           onClick={() => { setOpen((p) => !p); setTimeout(() => inputRef.current?.focus(), 60); }}
//           style={{
//             flex: 1, display: "flex", alignItems: "center", gap: 8,
//             border: `1px solid ${open ? "#2563eb" : "#e5e7eb"}`,
//             borderRadius: 8, padding: "9px 11px",
//             background: "white", cursor: "pointer", textAlign: "left",
//             boxShadow: open ? "0 0 0 3px rgba(37,99,235,.09)" : "none",
//             transition: "all .2s",
//           }}>
//           {selected ? (
//             <>
//               {selected.image?.url && (
//                 <img src={selected.image.url} alt={selected.name}
//                   style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
//               )}
//               <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{selected.name}</span>
//               <span onClick={clear} style={{ color: "#9ca3af", fontSize: 12, padding: "2px 4px", cursor: "pointer" }}>✕</span>
//             </>
//           ) : (
//             <>
//               <span style={{ fontSize: 16, opacity: .4 }}>🏷️</span>
//               <span style={{ flex: 1, color: "#94a3b8", fontSize: 13 }}>Select brand...</span>
//               <span style={{ color: "#94a3b8", fontSize: 11 }}>▾</span>
//             </>
//           )}
//         </button>

//         <button type="button"
//           onClick={(e) => { e.stopPropagation(); setOpen(false); setShowAdd(true); setAddError(""); }}
//           title="Add new brand"
//           style={{
//             width: 38, height: 38, borderRadius: 8,
//             border: "1.5px dashed #2563eb", background: "#eff6ff",
//             color: "#2563eb", fontSize: 20, fontWeight: 700,
//             display: "flex", alignItems: "center", justifyContent: "center",
//             cursor: "pointer", flexShrink: 0,
//           }}>+</button>
//       </div>

//       {open && (
//         <div style={{
//           position: "absolute", zIndex: 200, top: "calc(100% + 6px)", left: 0, right: 0,
//           minWidth: 280, background: "white", border: "1px solid #e5e7eb",
//           borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,.14)", overflow: "hidden",
//         }}>
//           <div style={{ padding: "8px 10px 6px" }}>
//             <input ref={inputRef} value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search brand..."
//               style={{
//                 width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb",
//                 borderRadius: 7, fontFamily: "inherit", fontSize: 13, outline: "none",
//               }}
//               onFocus={(e) => e.target.style.borderColor = "#2563eb"}
//               onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
//             />
//           </div>
//           <div style={{ maxHeight: 220, overflowY: "auto" }}>
//             {filtered.length === 0 ? (
//               <div style={{ padding: "16px 12px", textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
//                 No brands found —{" "}
//                 <button type="button"
//                   onClick={() => { setOpen(false); setShowAdd(true); }}
//                   style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
//                   Add new?
//                 </button>
//               </div>
//             ) : filtered.map((b) => (
//               <button key={b._id} type="button" onClick={() => pick(b)}
//                 style={{
//                   width: "100%", display: "flex", alignItems: "center", gap: 10,
//                   padding: "9px 12px", border: "none", background: value === b._id ? "#eff6ff" : "transparent",
//                   cursor: "pointer", textAlign: "left", fontFamily: "inherit",
//                   borderBottom: "1px solid #f3f4f6",
//                 }}>
//                 {b.image?.url && (
//                   <img src={b.image.url} alt={b.name}
//                     style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover", border: "1px solid #e5e7eb" }} />
//                 )}
//                 <span style={{ fontSize: 13, fontWeight: value === b._id ? 700 : 500, color: value === b._id ? "#2563eb" : "#0f172a" }}>
//                   {b.name}
//                 </span>
//                 {value === b._id && <span style={{ marginLeft: "auto", color: "#2563eb", fontSize: 13 }}>✓</span>}
//               </button>
//             ))}
//           </div>
//           <div style={{ borderTop: "1px solid #f3f4f6", padding: "8px 10px" }}>
//             <button type="button"
//               onClick={() => { setOpen(false); setShowAdd(true); setAddError(""); }}
//               style={{
//                 width: "100%", padding: "7px 10px", background: "#eff6ff",
//                 border: "1.5px dashed #2563eb", borderRadius: 8, color: "#2563eb",
//                 fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
//               }}>
//               + Add New Brand
//             </button>
//           </div>
//         </div>
//       )}

//       {showAdd && (
//         <div style={{
//           position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
//           backdropFilter: "blur(4px)", zIndex: 500,
//           display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
//         }} onClick={() => setShowAdd(false)}>
//           <div style={{
//             background: "white", borderRadius: 14, padding: 28, width: 380,
//             boxShadow: "0 24px 64px rgba(0,0,0,.18)",
//           }} onClick={(e) => e.stopPropagation()}>
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
//               <div>
//                 <div style={{ fontSize: 15, fontWeight: 700 }}>Add New Brand</div>
//                 <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Name + logo image</div>
//               </div>
//               <button onClick={() => setShowAdd(false)} style={{
//                 width: 30, height: 30, borderRadius: 7, border: "1px solid #e5e7eb",
//                 background: "#f9fafb", color: "#64748b", fontSize: 18, cursor: "pointer",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//               }}>×</button>
//             </div>

//             <div style={{ marginBottom: 14 }}>
//               <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Brand Name *</label>
//               <input value={newName} onChange={(e) => { setNewName(e.target.value); setAddError(""); }}
//                 placeholder="e.g. Amul, Tata, Nestle"
//                 style={{
//                   width: "100%", padding: "9px 11px", border: "1px solid #e5e7eb",
//                   borderRadius: 8, fontFamily: "inherit", fontSize: 13, outline: "none",
//                 }}
//                 onFocus={(e) => e.target.style.borderColor = "#2563eb"}
//                 onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
//               />
//             </div>

//             <div style={{ marginBottom: 16 }}>
//               <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Brand Logo / Image *</label>
//               <div
//                 onClick={() => fileRef.current?.click()}
//                 style={{
//                   border: `2px dashed ${newPreview ? "#86efac" : "#d1d5db"}`,
//                   borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer",
//                   background: newPreview ? "#f0fdf4" : "#f9fafb",
//                   position: "relative", overflow: "hidden",
//                 }}>
//                 {newPreview ? (
//                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                     <img src={newPreview} alt="preview"
//                       style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "2px solid #86efac" }} />
//                     <div style={{ textAlign: "left" }}>
//                       <div style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>Image selected</div>
//                       <div style={{ fontSize: 11, color: "#64748b" }}>{newFile?.name}</div>
//                       <button type="button" onClick={(e) => { e.stopPropagation(); setNewFile(null); setNewPreview(null); }}
//                         style={{ marginTop: 4, fontSize: 10, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div>
//                     <div style={{ fontSize: 28, opacity: .3, marginBottom: 6 }}>🖼️</div>
//                     <div style={{ fontSize: 12, color: "#64748b" }}>Click to upload logo</div>
//                     <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>PNG, JPG, WebP</div>
//                   </div>
//                 )}
//               </div>
//               <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
//                 onChange={(e) => { handleFileChange(e.target.files?.[0]); e.target.value = ""; }} />
//             </div>

//             {addError && (
//               <div style={{
//                 padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca",
//                 borderRadius: 8, color: "#ef4444", fontSize: 12, marginBottom: 12,
//               }}>{addError}</div>
//             )}

//             <div style={{ display: "flex", gap: 10 }}>
//               <button type="button" onClick={handleAddBrand} disabled={saving}
//                 style={{
//                   flex: 1, padding: "10px 0", background: saving ? "#93c5fd" : "#2563eb",
//                   border: "none", borderRadius: 8, color: "white", fontSize: 13,
//                   fontWeight: 600, fontFamily: "inherit", cursor: saving ? "not-allowed" : "pointer",
//                 }}>
//                 {saving ? "Saving..." : "Save Brand"}
//               </button>
//               <button type="button" onClick={() => setShowAdd(false)}
//                 style={{
//                   flex: 1, padding: "10px 0", background: "transparent",
//                   border: "1px solid #e5e7eb", borderRadius: 8, color: "#64748b",
//                   fontSize: 13, fontFamily: "inherit", cursor: "pointer",
//                 }}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// function UnitConversionManager({ conversions, onChange }) {
//   const [rows, setRows]       = useState(conversions || []);
//   const [unit, setUnit]       = useState("");
//   const [nPcs, setNPcs]       = useState("");
//   const [editIdx, setEditIdx] = useState(null);
//   const [error, setError]     = useState("");

//  const [previewPcs, setPreviewPcs] = useState("137");
//   useEffect(() => { onChange(rows); }, [rows]);

//   const reset = () => { setUnit(""); setNPcs(""); setEditIdx(null); setError(""); };

//   const handleAdd = () => {
//     if (!unit.trim())          { setError("Label required"); return; }
//     const n = Number(nPcs);
//     if (!nPcs || isNaN(n) || n <= 0) { setError("N PCS must be a positive number"); return; }

//     const entry = { unit: unit.trim(), nPcs: n };
//     let updated;

//     if (editIdx !== null) {
//       updated = rows.map((r, i) => i === editIdx ? entry : r);
//     } else {
//       if (rows.some((r) => r.unit.toLowerCase() === entry.unit.toLowerCase())) {
//         setError("This label already exists"); return;
//       }
//       updated = [...rows, entry];
//     }
//     setRows(updated);
//     reset();
//   };

//   const handleEdit = (idx) => {
//     setUnit(rows[idx].unit);
//     setNPcs(String(rows[idx].nPcs));
//     setEditIdx(idx);
//     setError("");
//   };

//   const handleDelete = (idx) => {
//     const updated = rows.filter((_, i) => i !== idx);
//     setRows(updated);
//     if (editIdx === idx) reset();
//   };

//   // Compute live breakdown string for the preview pcs value
//   const liveBreakdown = previewPcs !== "" && rows.length > 0
//     ? pcsToDisplay(Number(previewPcs), rows)
//     : "—";

//   return (
//     <div style={{
//       border: "1.5px solid #bae6fd", borderRadius: 12, overflow: "hidden",
//       background: "#f8fbff", marginTop: 10,
//     }}>
//       {/* Header */}
//       <div style={{
//         padding: "10px 14px", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
//         borderBottom: "1px solid #bae6fd",
//         display: "flex", alignItems: "center", gap: 8,
//       }}>
//         <span style={{ fontSize: 14 }}>📦</span>
//         <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: ".6px" }}>
//           Unit Conversions
//         </span>
//         {rows.length > 0 && (
//           <span style={{
//             marginLeft: "auto", fontSize: 10, background: "#0369a1", color: "white",
//             padding: "2px 8px", borderRadius: 20, fontWeight: 700,
//           }}>
//             {rows.length} unit{rows.length > 1 ? "s" : ""}
//           </span>
//         )}
//       </div>

//       {/* Column headers */}
//       {rows.length > 0 && (
//         <div style={{
//           display: "grid", gridTemplateColumns: "1fr 90px 60px",
//           padding: "6px 12px 2px", gap: 8,
//         }}>
//           <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px" }}>Label</span>
//           <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px" }}>= N PCS</span>
//           <span></span>
//         </div>
//       )}

//       {/* Existing rows */}
//       {rows.length > 0 && (
//         <div style={{ padding: "4px 12px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
//           {rows.map((row, idx) => (
//             <div key={idx} style={{
//               display: "grid", gridTemplateColumns: "1fr 90px 60px",
//               alignItems: "center", gap: 8,
//               padding: "8px 12px", background: "white", border: "1px solid #bae6fd",
//               borderRadius: 8,
//             }}>
//               {/* Label */}
//               <span style={{
//                 fontWeight: 700, fontSize: 13, color: "#0f172a",
//                 display: "flex", alignItems: "center", gap: 6,
//               }}>
//                 <span style={{
//                   fontFamily: "monospace", fontSize: 10, fontWeight: 800,
//                   background: "#0369a1", color: "white", padding: "1px 6px",
//                   borderRadius: 20, flexShrink: 0,
//                 }}>{row.unit}</span>
//               </span>

//               {/* nPcs */}
//               <span style={{
//                 fontFamily: "monospace", fontSize: 13, fontWeight: 700,
//                 color: "#0369a1",
//               }}>
//                 {row.nPcs}
//               </span>

//               {/* Actions */}
//               <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
//                 <button type="button" onClick={() => handleEdit(idx)}
//                   style={{
//                     width: 26, height: 26, borderRadius: 6, border: "1px solid #e5e7eb",
//                     background: "white", cursor: "pointer", fontSize: 11,
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                   }}>✏️</button>
//                 <button type="button" onClick={() => handleDelete(idx)}
//                   style={{
//                     width: 26, height: 26, borderRadius: 6, border: "1px solid #fecaca",
//                     background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 11,
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                   }}>🗑️</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Add / Edit form */}
//       <div style={{ padding: "10px 12px", borderTop: rows.length > 0 ? "1px solid #bae6fd" : "none" }}>
//         <div style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".4px" }}>
//           {editIdx !== null ? "✏️ Edit Unit" : "➕ Add Unit"}
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
//           {/* Label */}
//           <div>
//             <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
//               Label *
//             </label>
//             <input
//               value={unit}
//               onChange={(e) => { setUnit(e.target.value); setError(""); }}
//               placeholder="e.g. Pcs, Dozen, Carton, lad"
//               style={{
//                 width: "100%", padding: "7px 9px", border: "1px solid #bae6fd",
//                 borderRadius: 7, fontFamily: "inherit", fontSize: 12.5,
//                 outline: "none", background: "#f0f9ff",
//               }}
//               onFocus={(e) => e.target.style.borderColor = "#2563eb"}
//               onBlur={(e) => e.target.style.borderColor = "#bae6fd"}
//             />
//           </div>

//           {/* N PCS */}
//           <div>
//             <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
//               = N PCS *
//             </label>
//             <input
//               type="number"
//               min="1"
//               step="1"
//               value={nPcs}
//               onChange={(e) => { setNPcs(e.target.value); setError(""); }}
//               placeholder="e.g. 1, 12, 100, 13"
//               style={{
//                 width: "100%", padding: "7px 9px", border: "1px solid #bae6fd",
//                 borderRadius: 7, fontFamily: "inherit", fontSize: 12.5,
//                 outline: "none", background: "#f0f9ff",
//               }}
//               onFocus={(e) => e.target.style.borderColor = "#2563eb"}
//               onBlur={(e) => e.target.style.borderColor = "#bae6fd"}
//             />
//           </div>
//         </div>

//         {/* Live Preview row */}
//         {unit && nPcs && (
//           <div style={{
//             marginBottom: 8, padding: "6px 10px",
//             background: "white", border: "1px solid #bae6fd", borderRadius: 7,
//             display: "flex", alignItems: "center", gap: 8, fontSize: 12,
//           }}>
//             <span style={{ fontSize: 10, color: "#64748b" }}>Preview:</span>
//             <span style={{ fontFamily: "monospace", fontWeight: 700, background: "#0369a1", color: "white", padding: "1px 7px", borderRadius: 12 }}>{unit}</span>
//             <span style={{ color: "#94a3b8" }}>=</span>
//             <span style={{ color: "#0f172a", fontWeight: 500 }}>{nPcs} pcs</span>
//           </div>
//         )}

//         {error && (
//           <div style={{
//             padding: "6px 10px", background: "#fef2f2", border: "1px solid #fecaca",
//             borderRadius: 7, color: "#ef4444", fontSize: 11.5, marginBottom: 8,
//           }}>{error}</div>
//         )}

//         <div style={{ display: "flex", gap: 8 }}>
//           <button type="button" onClick={handleAdd}
//             style={{
//               padding: "6px 14px", background: "#2563eb", border: "none",
//               borderRadius: 7, color: "white", fontSize: 12, fontWeight: 600,
//               fontFamily: "inherit", cursor: "pointer",
//             }}>
//             {editIdx !== null ? "Update" : "Add"}
//           </button>
//           {editIdx !== null && (
//             <button type="button" onClick={reset}
//               style={{
//                 padding: "6px 12px", background: "transparent",
//                 border: "1px solid #e5e7eb", borderRadius: 7, color: "#64748b",
//                 fontSize: 12, fontFamily: "inherit", cursor: "pointer",
//               }}>Cancel</button>
//           )}
//         </div>
//       </div>

//       {/* Packing breakdown tester — shows how totalPcs breaks into these units */}
//       {rows.length > 0 && (
//         <div style={{
//           margin: "0 12px 12px", padding: "10px 12px",
//           background: "white", border: "1px solid #bae6fd", borderRadius: 8,
//         }}>
//           <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
//             🧪 Packing Preview — enter total pcs to see breakdown
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <input
//               type="number"
//               min="0"
//               value={previewPcs}
//               onChange={(e) => setPreviewPcs(e.target.value)}
//               placeholder="e.g. 137"
//               style={{
//                 width: 100, padding: "6px 9px", border: "1px solid #bae6fd",
//                 borderRadius: 7, fontFamily: "monospace", fontSize: 13,
//                 outline: "none", background: "#f0f9ff", fontWeight: 700,
//               }}
//               onFocus={(e) => e.target.style.borderColor = "#2563eb"}
//               onBlur={(e) => e.target.style.borderColor = "#bae6fd"}
//             />
//             <span style={{ color: "#94a3b8", fontSize: 13 }}>→</span>
//             <span style={{
//               fontSize: 13, fontWeight: 700, color: "#0369a1",
//               background: "#e0f2fe", padding: "4px 10px", borderRadius: 7,
//               border: "1px solid #bae6fd",
//             }}>
//               {liveBreakdown}
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    UNIT QTY INPUT (for bulk discount)
// ══════════════════════════════════════════════════════════════ */
// const UnitQtyInput = ({ rawValue, onChange, placeholder = "0" }) => {
//   const [unit,    setUnit]    = useState("pcs");
//   const [display, setDisplay] = useState("");

//   useEffect(() => {
//     if (rawValue === "" || rawValue == null) { setDisplay(""); return; }
//     const n = Number(rawValue);
//     if (isNaN(n)) { setDisplay(""); return; }
//     if (unit === "dozen")       setDisplay(String(n / DOZEN_SIZE));
//     else if (unit === "carton") setDisplay(String(n / CARTON_SIZE));
//     else                        setDisplay(String(n));
//   }, [rawValue, unit]);

//   const handleUnitChange = (newUnit) => {
//     setUnit(newUnit);
//     const raw = Number(rawValue) || 0;
//     if (newUnit === "dozen")       setDisplay(raw ? String(raw / DOZEN_SIZE)  : "");
//     else if (newUnit === "carton") setDisplay(raw ? String(raw / CARTON_SIZE) : "");
//     else                           setDisplay(raw ? String(raw)               : "");
//   };

//   const handleInput = (val) => {
//     setDisplay(val);
//     const n = Number(val);
//     if (!isNaN(n) && val !== "") onChange(toPcs(n, unit));
//     else if (val === "")         onChange("");
//   };

//   return (
//     <div style={{ display: "flex", gap: 4, width: "100%" }}>
//       <input type="number" min="0" step={unit === "pcs" ? "1" : "0.5"}
//         value={display} onChange={(e) => handleInput(e.target.value)}
//         placeholder={placeholder}
//         style={{
//           flex: 1, minWidth: 0, padding: "7px 8px",
//           border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12,
//           fontFamily: "inherit", textAlign: "center", outline: "none",
//         }}
//         onFocus={(e) => e.target.style.borderColor = "#2563eb"}
//         onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
//       />
//       <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0 }}>
//         {[{ key: "pcs", label: "pcs" }, { key: "dozen", label: "Dz" }, { key: "carton", label: "Ctn" }].map(({ key, label }) => (
//           <button key={key} type="button" onClick={() => handleUnitChange(key)}
//             style={{
//               padding: "4px 6px", fontSize: 10, fontWeight: 700, cursor: "pointer",
//               borderRight: key !== "carton" ? "1px solid #e5e7eb" : "none",
//               background: unit === key ? "#2563eb" : "white",
//               color: unit === key ? "white" : "#6b7280",
//               border: "none", fontFamily: "inherit", transition: "all .15s",
//             }}>{label}</button>
//         ))}
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════
//    LIVE GST BREAKDOWN PANEL
// ══════════════════════════════════════════════════════════════ */
// function GstBreakdownPanel({ basePrice, profit, gstPercent, cessPercent, taxType }) {
//   const base = Number(basePrice) || 0;
//   const pl   = Number(profit)    || 0;
//   const gst  = Number(gstPercent) || 0;
//   const cess = Number(cessPercent) || 0;
//   if (base === 0 && pl === 0) return null;

//   const bd     = calcGstBreakdown(base, pl, gst, cess, taxType || "cgst_sgst");
//   const isIgst = (taxType || "cgst_sgst") === "igst";

//   const Row = ({ label, val, bg, border, labelColor, valColor, badge, badgeBg, badgeColor, bold }) => (
//     <div style={{
//       display: "flex", alignItems: "center", justifyContent: "space-between",
//       padding: "7px 12px", background: bg, border: `1px solid ${border}`, borderRadius: 8,
//     }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//         {badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 5, background: badgeBg, color: badgeColor }}>{badge}</span>}
//         <span style={{ fontSize: 12, color: labelColor, fontWeight: bold ? 700 : 500 }}>{label}</span>
//       </div>
//       <span style={{ fontSize: 12, fontWeight: bold ? 800 : 700, color: valColor, fontFamily: "monospace" }}>{val}</span>
//     </div>
//   );

//   return (
//     <div style={{
//       marginTop: 12, borderRadius: 12, border: "1px solid #c7d2fe",
//       background: "linear-gradient(135deg,#eef2ff,#f0f9ff)", overflow: "hidden",
//     }}>
//       <div style={{
//         padding: "9px 14px", background: "rgba(99,102,241,.08)",
//         borderBottom: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 8,
//       }}>
//         <span style={{ fontSize: 13 }}>🧾</span>
//         <span style={{ fontSize: 11, fontWeight: 800, color: "#4338ca", textTransform: "uppercase", letterSpacing: ".6px" }}>Live Tax Breakdown</span>
//         <span style={{ marginLeft: "auto", fontSize: 10, color: "#6366f1", background: "white", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
//           {isIgst ? "IGST" : "CGST+SGST"}
//         </span>
//       </div>
//       <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
//         <Row label="Final Sale Price (Base + Profit, all taxes inside)" val={`₹${bd.salePrice.toFixed(2)}`} bg="#16a34a" border="#bbf7d0" labelColor="white" valColor="white" bold />
//         <Row label="Taxable Value (excl. tax)" val={`₹${bd.priceExcludingGst.toFixed(2)}`} bg="white" border="#e0e7ff" labelColor="#374151" valColor="#111827" />
//         {isIgst ? (
//           <Row label={`IGST ${bd.igstPercent}% (included inside)`} val={`₹${bd.igstAmount.toFixed(2)}`} bg="#fff7ed" border="#fed7aa" labelColor="#c2410c" valColor="#c2410c" badge="IGST" badgeBg="#ffedd5" badgeColor="#ea580c" />
//         ) : (
//           <>
//             <Row label={`CGST ${bd.cgstPercent}% (included inside)`} val={`₹${bd.cgstAmount.toFixed(2)}`} bg="#eff6ff" border="#bfdbfe" labelColor="#1d4ed8" valColor="#1d4ed8" badge="CGST" badgeBg="#dbeafe" badgeColor="#2563eb" />
//             <Row label={`SGST ${bd.sgstPercent}% (included inside)`} val={`₹${bd.sgstAmount.toFixed(2)}`} bg="#eff6ff" border="#bfdbfe" labelColor="#1d4ed8" valColor="#1d4ed8" badge="SGST" badgeBg="#dbeafe" badgeColor="#2563eb" />
//           </>
//         )}
//         {cess > 0 && (
//           <Row label={`CESS ${cess}% (included inside)`} val={`₹${bd.cessAmount.toFixed(2)}`} bg="#faf5ff" border="#ddd6fe" labelColor="#7c3aed" valColor="#7c3aed" badge="CESS" badgeBg="#ede9fe" badgeColor="#7c3aed" />
//         )}
//         <div style={{ borderTop: "1px solid #c7d2fe", marginTop: 2 }} />
//         <Row label="Total Tax (inside sale price)" val={`₹${bd.totalTaxAmount.toFixed(2)}`} bg="#fffbeb" border="#fde68a" labelColor="#92400e" valColor="#92400e" bold />
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    BULK DISCOUNT MANAGER
// ══════════════════════════════════════════════════════════════ */
// function BulkDiscountManager({ productId, basePrice, salePrice, onTempChange }) {
//   const [rules, setRules]         = useState([]);
//   const [loading, setLoading]     = useState(false);
//   const [form, setForm]           = useState(EMPTY_BULK);
//   const [ruleEditId, setEditId]   = useState(null);
//   const [saving, setSaving]       = useState(false);
//   const [error, setError]         = useState("");
//   const [showForm, setShowForm]   = useState(false);
//   const [deleteConf, setDeleteConf] = useState(null);

//   const isTempMode = !productId || productId === "new";
//   const baseNum    = Number(basePrice) || 0;

//   useEffect(() => {
//     if (!form._manualUnit && form.profit !== "" && baseNum > 0)
//       setForm((p) => ({ ...p, unitPrice: String(baseNum + (Number(p.profit) || 0)) }));
//   }, [form.profit, baseNum]);

//   const loadRules = useCallback(async () => {
//     if (!productId) return;
//     try { setLoading(true); const res = await axiosAuth.get(`${BULK_API_URL}/product/${productId}`); setRules((res.data?.data || []).sort((a, b) => a.minQty - b.minQty)); }
//     catch { setRules([]); } finally { setLoading(false); }
//   }, [productId]);

//   useEffect(() => { if (productId) loadRules(); }, [productId, loadRules]);

//   const resetForm = () => { setForm(EMPTY_BULK); setEditId(null); setShowForm(false); setError(""); };

//   const formatRange = (min, max) =>
//     (!max || Number(max) === Number(min)) ? pcsToDisplay(min) + "+" : `${pcsToDisplay(min)} – ${pcsToDisplay(max)}`;

//   const isDuplicate = (minQ, maxQ, excludeId = null) =>
//     rules.some((r) => {
//       const rId = isTempMode ? r._tempId : r._id;
//       if (excludeId && rId === excludeId) return false;
//       return Number(r.minQty) === minQ && (r.maxQty != null ? Number(r.maxQty) : null) === maxQ;
//     });

//   const handleEdit = (rule) => {
//     const profitVal = rule.profit != null ? String(rule.profit) : String(rule.unitPrice - baseNum);
//     setEditId(isTempMode ? rule._tempId : rule._id);
//     setForm({ minQty: rule.minQty, maxQty: rule.maxQty ?? "", profit: profitVal, unitPrice: String(rule.unitPrice), _manualUnit: false });
//     setShowForm(true); setError("");
//   };

//   const handleSubmit = async () => {
//     if (!form.minQty || !form.unitPrice) { setError("Min Qty and Unit Price required"); return; }
//     const minQ  = Number(form.minQty);
//     const maxQ  = form.maxQty !== "" && form.maxQty != null ? Number(form.maxQty) : null;
//     const unitP = Number(form.unitPrice);
//     const profitN = form.profit !== "" ? Number(form.profit) : unitP - baseNum;
//     if (minQ < 1) { setError("Min Qty >= 1"); return; }
//     if (maxQ !== null && maxQ < minQ) { setError("Max Qty < Min Qty"); return; }
//     if (unitP <= 0) { setError("Unit Price must be > 0"); return; }
//     if (isDuplicate(minQ, maxQ, ruleEditId)) { setError("This range already exists"); return; }

//     const payload = { minQty: minQ, maxQty: maxQ, unitPrice: unitP, profit: profitN };

//     if (isTempMode) {
//       const updated = ruleEditId
//         ? rules.map((r) => (r._tempId === ruleEditId ? { ...r, ...payload } : r))
//         : [...rules, { ...payload, _tempId: `tmp_${Date.now()}` }];
//       setRules(updated);
//       if (onTempChange) onTempChange([...updated]);
//       resetForm(); return;
//     }
//     try {
//       setSaving(true);
//       if (ruleEditId) await axiosAuth.put(`${BULK_API_URL}/${ruleEditId}`, payload);
//       else await axiosAuth.post(`${BULK_API_URL}/add`, { ...payload, product: productId });
//       await loadRules(); resetForm();
//     } catch (err) { setError(err.response?.data?.message || "Save failed"); }
//     finally { setSaving(false); }
//   };

//   return (
//     <div className="bd-wrap">
//       <div className="bd-header">
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <div className="bd-header-icon">📊</div>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 700 }}>Bulk Discount Rules</div>
//             <div style={{ fontSize: 11, color: "var(--textMid)", marginTop: 1 }}>
//               {isTempMode ? "Saved when product is created" : `${rules.length} tier(s)`}
//             </div>
//           </div>
//         </div>
//         {!showForm && <button type="button" className="bd-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>+ Add Tier</button>}
//       </div>

//       {showForm && (
//         <div className="bd-form-wrap">
//           <div className="bd-form-title">{ruleEditId ? "✏️ Edit Tier" : "➕ New Tier"}</div>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//             <div>
//               <label className="bd-lbl">Min Qty *</label>
//               <UnitQtyInput rawValue={form.minQty} onChange={(v) => { setForm((p) => ({ ...p, minQty: v === "" ? "" : String(v) })); setError(""); }} placeholder="1" />
//             </div>
//             <div>
//               <label className="bd-lbl">Max Qty <span style={{ fontSize: 9, color: "#6b7280" }}>(optional)</span></label>
//               <UnitQtyInput rawValue={form.maxQty} onChange={(v) => { setForm((p) => ({ ...p, maxQty: v === "" ? "" : String(v) })); setError(""); }} placeholder="∞" />
//             </div>
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns:
//   "1fr 28px 1fr 28px 1fr", gap: 6, alignItems: "end", marginBottom: 10 }}>
//             <div>
//               <label className="bd-lbl">Base Price</label>
//               <div style={{ padding: "8px 10px", background: "#e0f2fe", border: "1.5px solid #7dd3fc", borderRadius: 7, fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#0c4a6e" }}>
//                 ₹{baseNum || "—"}
//               </div>
//             </div>
//             <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#7dd3fc", paddingBottom: 6 }}>+</div>
//             <div>
//               <label className="bd-lbl">Profit (₹) *</label>
//               <input className="bd-inp" type="number" placeholder="e.g. 20" value={form.profit}
//                 onChange={(e) => { setForm((p) => ({ ...p, profit: e.target.value, _manualUnit: false, unitPrice: baseNum > 0 && e.target.value !== "" ? String(baseNum + (Number(e.target.value) || 0)) : p.unitPrice })); setError(""); }} min="0" step="0.01" />
//             </div>
//             <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#7dd3fc", paddingBottom: 6 }}>=</div>
//             <div>
//               <label className="bd-lbl">Unit Price (₹)</label>
//               <input className="bd-inp" type="number" placeholder="Final price" value={form.unitPrice}
//                 onChange={(e) => { const v = e.target.value; const pCalc = baseNum > 0 && !isNaN(Number(v)) ? String((Number(v) - baseNum).toFixed(2)) : ""; setForm((p) => ({ ...p, unitPrice: v, profit: pCalc, _manualUnit: true })); setError(""); }} min="0" step="0.01" style={{ fontWeight: 700, color: "#1d4ed8" }} />
//             </div>
//           </div>
//           {error && <div className="bd-error">⚠ {error}</div>}
//           <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
//             <button type="button" className="bd-save-btn" onClick={handleSubmit} disabled={saving}>
//               {saving ? "Saving..." : ruleEditId ? "Update" : "Save Tier"}
//             </button>
//             <button type="button" className="bd-cancel-btn" onClick={resetForm}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {loading ? (
//         <div style={{ padding: 12 }}><div className="bd-skeleton" /></div>
//       ) : rules.length === 0 ? (
//         !showForm && <div className="bd-empty"><div className="bd-empty-icon">📊</div><div style={{ fontSize: 12, color: "var(--textDim)", marginTop: 6 }}>No tiers yet</div></div>
//       ) : (
//         <div className="bd-rules-list">
//           {[...rules].sort((a, b) => a.minQty - b.minQty).map((rule, idx) => {
//             const base  = Number(salePrice || basePrice) || 0;
//             const pct   = base > 0 && rule.unitPrice < base ? Math.round(((base - rule.unitPrice) / base) * 100) : 0;
//             const key   = isTempMode ? rule._tempId : rule._id;
//             return (
//               <div key={key || idx} className="bd-rule-card">
//                 <div className="bd-rule-tier-badge">T{idx + 1}</div>
//                 <div className="bd-rule-main">
//                   <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{formatRange(rule.minQty, rule.maxQty)}</span>
//                   <span style={{ color: "#d1d5db" }}>→</span>
//                   <span className="bd-unit-price">₹{rule.unitPrice}</span>
//                   <span className="bd-per-unit">/unit</span>
//                   {pct > 0 && <span className="bd-savings-tag">-{pct}%</span>}
//                 </div>
//                 <div className="bd-rule-actions">
//                   <button type="button" className="bd-edit-btn" onClick={() => handleEdit(rule)}>✏️</button>
//                   <button type="button" className="bd-del-btn" onClick={() => setDeleteConf(rule)}>🗑️</button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {deleteConf && (
//         <div className="bd-del-overlay" onClick={() => setDeleteConf(null)}>
//           <div className="bd-del-modal" onClick={(e) => e.stopPropagation()}>
//             <div style={{ fontSize: 24, marginBottom: 10 }}>🗑️</div>
//             <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Delete this tier?</div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button type="button" onClick={async () => {
//                 if (isTempMode) { const u = rules.filter((r) => r._tempId !== deleteConf._tempId); setRules([...u]); if (onTempChange) onTempChange([...u]); }
//                 else { try { await axiosAuth.delete(`${BULK_API_URL}/${deleteConf._id}`); await loadRules(); } catch {} }
//                 setDeleteConf(null);
//               }} style={{ flex: 1, padding: "8px 0", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Delete</button>
//               <button type="button" onClick={() => setDeleteConf(null)} style={{ flex: 1, padding: "8px 0", background: "transparent", color: "#64748b", border: "1px solid #e5e7eb", borderRadius: 8, fontWeight: 500, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    HSN PICKER
// ══════════════════════════════════════════════════════════════ */
// function HsnPicker({ value, onSelect, hsnCodes, hsnCategories, onAddNew }) {
//   const [open, setOpen]           = useState(false);
//   const [query, setQuery]         = useState("");
//   const [catFilter, setCatFilter] = useState("");
//   const [highlighted, setHigh]    = useState(0);
//   const wrapRef  = useRef(null);
//   const inputRef = useRef(null);
//   const listRef  = useRef(null);

//   const selected = hsnCodes.find((h) => h.code === value) ?? null;
//   const filtered = hsnCodes.filter((h) => {
//     const q = query.toLowerCase();
//     return (!q || h.code.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) || h.category.toLowerCase().includes(q))
//       && (!catFilter || h.category === catFilter);
//   });

//   useEffect(() => {
//     const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
//   }, []);

//   useEffect(() => setHigh(0), [query, catFilter]);

//   const pick  = (hsn) => { onSelect(hsn); setOpen(false); setQuery(""); };
//   const clear = (e)   => { e.stopPropagation(); onSelect(null); setQuery(""); };

//   const handleKeyDown = (e) => {
//     if (!open) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } return; }
//     if (e.key === "ArrowDown") { e.preventDefault(); setHigh((p) => Math.min(p + 1, filtered.length - 1)); }
//     if (e.key === "ArrowUp")   { e.preventDefault(); setHigh((p) => Math.max(p - 1, 0)); }
//     if (e.key === "Enter")     { e.preventDefault(); if (filtered[highlighted]) pick(filtered[highlighted]); }
//     if (e.key === "Escape")    setOpen(false);
//   };

//   const badge = selected ? (GST_BADGE[selected.gst] ?? GST_BADGE[0]) : null;

//   return (
//     <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
//       <div style={{ display: "flex", gap: 6 }}>
//         <button type="button" onKeyDown={handleKeyDown}
//           onClick={() => { setOpen((p) => !p); setTimeout(() => inputRef.current?.focus(), 60); }}
//           className={`hsn-btn${open ? " hsn-btn-open" : ""}`} style={{ flex: 1 }}>
//           🏷️
//           {selected ? (
//             <>
//               <span className="hsn-code">{selected.code}</span>
//               <span className="hsn-desc">{selected.description}</span>
//               <span className="gst-badge" style={{ background: badge.bg, color: badge.text }}>
//                 <span style={{ background: badge.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />GST {selected.gst}%
//               </span>
//               {(selected.cess ?? 0) > 0 && (
//                 <span className="gst-badge" style={{ background: "#f5f3ff", color: "#7c3aed", marginLeft: 4 }}>
//                   <span style={{ background: "#7c3aed", width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />CESS {selected.cess}%
//                 </span>
//               )}
//               <span onClick={clear} className="hsn-clear">✕</span>
//             </>
//           ) : (
//             <><span className="hsn-placeholder">Search HSN code...</span><span style={{ marginLeft: "auto", color: "var(--textDim)", fontSize: 12 }}>▾</span></>
//           )}
//         </button>
//         <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); onAddNew(); }} title="Add new HSN"
//           style={{ width: 38, height: 38, borderRadius: 8, border: "1.5px dashed var(--blue)", background: "var(--blueFade)", color: "var(--blue)", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>+</button>
//       </div>

//       {open && (
//         <div className="hsn-dropdown">
//           <div style={{ padding: "10px 10px 6px" }}>
//             <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type code or name..." className="hsn-search" />
//           </div>
//           {hsnCategories.length > 0 && (
//             <div className="hsn-cat-bar">
//               <button className={`hsn-cat-pill${!catFilter ? " hsn-cat-pill-active" : ""}`} onClick={() => setCatFilter("")}>All</button>
//               {hsnCategories.map((cat) => (
//                 <button key={cat} className={`hsn-cat-pill${catFilter === cat ? " hsn-cat-pill-active" : ""}`} onClick={() => setCatFilter(catFilter === cat ? "" : cat)}>{cat}</button>
//               ))}
//             </div>
//           )}
//           <div ref={listRef} className="hsn-list">
//             {filtered.length === 0 ? (
//               <div className="hsn-empty">No results — <button type="button" style={{ color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => { setOpen(false); onAddNew(); }}>Add new?</button></div>
//             ) : filtered.map((hsn, idx) => {
//               const b = GST_BADGE[hsn.gst] ?? GST_BADGE[0];
//               return (
//                 <button key={hsn.code} data-idx={idx} type="button" onClick={() => pick(hsn)} onMouseEnter={() => setHigh(idx)}
//                   className={`hsn-item${value === hsn.code ? " hsn-item-selected" : highlighted === idx ? " hsn-item-high" : ""}`}>
//                   <span className={`hsn-item-code${value === hsn.code ? " hsn-item-code-sel" : ""}`}>{hsn.code}</span>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div className="hsn-item-desc">{hsn.description}</div>
//                     <div className="hsn-item-cat">{hsn.category}</div>
//                   </div>
//                   <span className="gst-badge" style={{ background: b.bg, color: b.text }}>
//                     <span style={{ background: b.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />{hsn.gst}%
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//           <div className="hsn-footer">{filtered.length} result{filtered.length !== 1 ? "s" : ""} · ↑↓ navigate · Enter select</div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    ADD HSN MODAL
// ══════════════════════════════════════════════════════════════ */
// function AddHsnModal({ onClose, onSaved, existingCategories }) {
//   const [form, setForm]   = useState(EMPTY_HSN_FORM);
//   const [saving, setSaving] = useState(false);
//   const [error, setError]   = useState("");
//   const [newCat, setNewCat] = useState(false);

//   const handleChange = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); setError(""); };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.code || !form.description || !form.category) { setError("Fill all required fields."); return; }
//     try {
//       setSaving(true);
//       const res = await axiosAuth.post(HSN_API_URL, { code: form.code.trim(), description: form.description.trim(), category: form.category.trim(), gst: Number(form.gst), cess: Number(form.cess) || 0 });
//       onSaved(res.data.data); onClose();
//     } catch (err) { setError(err.response?.data?.message || "HSN save failed."); }
//     finally { setSaving(false); }
//   };

//   return (
//     <div className="vp-modal-bg" onClick={onClose}>
//       <div className="vp-modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
//           <div><div style={{ fontSize: 16, fontWeight: 700 }}>New HSN Code</div><div style={{ fontSize: 12, color: "var(--textMid)", marginTop: 2 }}>GST Tariff Code</div></div>
//           <button className="vp-close" onClick={onClose}>×</button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="vp-field"><label className="vp-lbl">HSN Code *</label><input className="vp-inp" name="code" placeholder="e.g. 0401" value={form.code} onChange={handleChange} style={{ fontFamily: "monospace", fontWeight: 700 }} /></div>
//           <div className="vp-field">
//             <label className="vp-lbl">Category *</label>
//             {!newCat ? (
//               <div style={{ display: "flex", gap: 8 }}>
//                 <select className="vp-sel" name="category" value={form.category} onChange={handleChange} style={{ flex: 1 }}>
//                   <option value="">Select</option>
//                   {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
//                 </select>
//                 <button type="button" onClick={() => { setNewCat(true); setForm((p) => ({ ...p, category: "" })); }} style={{ padding: "0 12px", border: "1px solid var(--blue)", borderRadius: 8, background: "var(--blueFade)", color: "var(--blue)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ New</button>
//               </div>
//             ) : (
//               <div style={{ display: "flex", gap: 8 }}>
//                 <input className="vp-inp" name="category" placeholder="New category" value={form.category} onChange={handleChange} style={{ flex: 1 }} />
//                 <button type="button" onClick={() => setNewCat(false)} style={{ padding: "0 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--textMid)", fontSize: 12, cursor: "pointer" }}>List</button>
//               </div>
//             )}
//           </div>
//           <div className="vp-row2" style={{ marginBottom: 12 }}>
//             <div className="vp-field">
//               <label className="vp-lbl">GST Rate *</label>
//               <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
//                 {[0, 5, 12, 18, 28].map((rate) => {
//                   const b = GST_BADGE[rate]; const sel = form.gst === String(rate);
//                   return (
//                     <button key={rate} type="button" onClick={() => setForm((p) => ({ ...p, gst: String(rate) }))}
//                       style={{ padding: "7px 4px", borderRadius: 7, border: `2px solid ${sel ? b.dot : "var(--border)"}`, background: sel ? b.bg : "white", color: sel ? b.text : "var(--textMid)", fontWeight: sel ? 700 : 500, fontSize: 13, cursor: "pointer" }}>
//                       {rate}%
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//             <div className="vp-field">
//               <label className="vp-lbl">CESS %</label>
//               <input className="vp-inp" type="number" name="cess" placeholder="0" value={form.cess} onChange={handleChange} min="0" max="100" step="0.01" />
//             </div>
//           </div>
//           <div className="vp-field"><label className="vp-lbl">Description *</label><textarea className="vp-ta" name="description" placeholder="e.g. Milk & Cream…" value={form.description} onChange={handleChange} style={{ minHeight: 70 }} /></div>
//           {error && <div style={{ padding: "8px 12px", background: "var(--redFade)", border: "1px solid #fecaca", borderRadius: 8, color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{error}</div>}
//           <div style={{ display: "flex", gap: 10 }}>
//             <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving}>{saving ? "Saving..." : "Save HSN"}</button>
//             <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    INLINE PRICE EDITOR  (table cell)
// ══════════════════════════════════════════════════════════════ */
// function InlinePrice({ value, onSave }) {
//   const [editing, setEditing] = useState(false);
//   const [val, setVal]         = useState(value);
//   const inputRef              = useRef(null);
//   const commit = () => { const n = Number(val); if (!isNaN(n) && n >= 0) onSave(n); setEditing(false); };
//   useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
//   useEffect(() => setVal(value), [value]);
//   if (editing) return (
//     <input ref={inputRef} type="number" value={val}
//       onChange={(e) => setVal(e.target.value)}
//       onBlur={commit}
//       onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
//       style={{ width: 80, padding: "4px 8px", border: "2px solid var(--blue)", borderRadius: 7, fontFamily: "inherit", fontSize: 13, fontWeight: 700, outline: "none", background: "#eff6ff" }}
//     />
//   );
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} onClick={() => setEditing(true)} title="Click to edit">
//       <span style={{ color: "var(--textMid)", fontWeight: 500 }}>₹{value}</span>
//       <span style={{ fontSize: 10, color: "var(--blue)", background: "var(--blueFade)", border: "1px solid #bfdbfe", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>✏</span>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    IMAGE UPLOADERS (Main + Gallery)
// ══════════════════════════════════════════════════════════════ */
// function MainImageUploader({ file, existingUrl, onChange }) {
//   const [preview, setPreview] = useState(existingUrl || null);
//   const [dragOver, setDragOver] = useState(false);
//   const inputRef = useRef(null);
//   const handleFile = (f) => { if (!f || !f.type.startsWith("image/")) return; setPreview(URL.createObjectURL(f)); onChange({ file: f, existingUrl: "" }); };
//   const handleRemove = () => { setPreview(null); onChange({ file: null, existingUrl: "" }); };
//   const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); };
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//       <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
//         onClick={() => !preview && inputRef.current?.click()}
//         style={{
//           position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden",
//           border: `2px ${preview ? "solid" : "dashed"} ${dragOver ? "#2563eb" : preview ? "#bfdbfe" : "#d1d5db"}`,
//           background: preview ? "#000" : "#f9fafb", cursor: preview ? "default" : "pointer",
//           display: "flex", alignItems: "center", justifyContent: "center",
//         }}>
//         {preview ? (
//           <>
//             <img src={preview} alt="Main" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//             <span style={{ position: "absolute", top: 8, left: 8, background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>MAIN</span>
//             <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0, transition: "opacity .2s" }}
//               onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
//               <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(245,158,11,.9)", border: "none", cursor: "pointer", fontWeight: 600, color: "white" }}>Replace</button>
//               <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(); }} style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(239,68,68,.9)", border: "none", cursor: "pointer", fontWeight: 600, color: "white" }}>Remove</button>
//             </div>
//           </>
//         ) : (
//           <div style={{ textAlign: "center", padding: 20 }}>
//             <div style={{ fontSize: 32, marginBottom: 8, opacity: .25 }}>🖼️</div>
//             <div style={{ fontSize: 13, fontWeight: 600, color: "var(--textMid)" }}>Click or drag image here</div>
//             <div style={{ fontSize: 11, color: "var(--textDim)", marginTop: 4 }}>JPEG, PNG, WebP</div>
//           </div>
//         )}
//       </div>
//       <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
//     </div>
//   );
// }

// function GalleryUploader({ galleryFiles, existingGalleryImages, onChange }) {
//   const idCounter = useRef(0);
//   const genId = () => `g_${++idCounter.current}`;
//   const initSlots = useCallback(() => [
//     ...(existingGalleryImages || []).map((url) => ({ id: genId(), type: "existing", url, previewUrl: url })),
//     ...(galleryFiles || []).map((file) => ({ id: genId(), type: "new", file, previewUrl: URL.createObjectURL(file) })),
//   ], []);
//   const [slots, setSlots]         = useState(initSlots);
//   const [dragOver, setDragOver]   = useState(false);
//   const replaceRefs = useRef({});
//   const addInputRef = useRef(null);
//   const propagate = useCallback((updated) => {
//     onChange(updated.filter((s) => s.type === "new").map((s) => s.file), updated.filter((s) => s.type === "existing").map((s) => s.url));
//   }, [onChange]);
//   const remaining = MAX_GALLERY - slots.length;
//   const addFiles = (incoming) => {
//     const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, remaining));
//     if (!valid.length) return;
//     const updated = [...slots, ...valid.map((file) => ({ id: genId(), type: "new", file, previewUrl: URL.createObjectURL(file) }))];
//     setSlots(updated); propagate(updated);
//   };
//   const removeSlot  = (id) => { const u = slots.filter((s) => s.id !== id); setSlots(u); propagate(u); };
//   const replaceSlot = (id, file) => {
//     if (!file || !file.type.startsWith("image/")) return;
//     const u = slots.map((s) => s.id !== id ? s : { id: s.id, type: "new", file, previewUrl: URL.createObjectURL(file) });
//     setSlots(u); propagate(u);
//   };
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
//         {slots.map((slot, idx) => (
//           <div key={slot.id} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 10, border: `2px solid ${slot.type === "existing" ? "#bfdbfe" : "#86efac"}`, background: "#f9fafb", overflow: "visible" }}>
//             <button type="button" onClick={() => removeSlot(slot.id)} style={{ position: "absolute", top: -9, right: -9, zIndex: 30, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 10, fontWeight: 700 }}>✕</button>
//             <div style={{ position: "absolute", inset: 0, borderRadius: 8, overflow: "hidden" }}>
//               <img src={slot.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//               <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .2s" }}
//                 onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
//                 <button type="button" onClick={() => replaceRefs.current[slot.id]?.click()} style={{ padding: 6, borderRadius: 8, background: "rgba(245,158,11,.85)", border: "none", cursor: "pointer" }}>🔄</button>
//               </div>
//             </div>
//             <input ref={(el) => { replaceRefs.current[slot.id] = el; }} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { replaceSlot(slot.id, e.target.files?.[0]); e.target.value = ""; }} />
//           </div>
//         ))}
//         {Array.from({ length: Math.max(0, MAX_GALLERY - slots.length) }).map((_, idx) => (
//           <div key={`empty-${idx}`}
//             onClick={() => remaining > 0 && addInputRef.current?.click()}
//             onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
//             onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
//             style={{ aspectRatio: "1/1", borderRadius: 10, border: `2px dashed ${dragOver && idx === 0 ? "#2563eb" : "#d1d5db"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f9fafb" }}>
//             <div style={{ fontSize: 18, color: "#d1d5db" }}>+</div>
//           </div>
//         ))}
//       </div>
//       <button type="button" disabled={remaining === 0} onClick={() => remaining > 0 && addInputRef.current?.click()}
//         style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${remaining === 0 ? "#e5e7eb" : "#bfdbfe"}`, background: remaining === 0 ? "#f9fafb" : "#eff6ff", color: remaining === 0 ? "#9ca3af" : "#2563eb", cursor: remaining === 0 ? "not-allowed" : "pointer", width: "fit-content" }}>
//         {remaining === 0 ? "Max 4 reached" : `Add images (${remaining} left)`}
//       </button>
//       <input ref={addInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    PRODUCT IMAGE CELL
// ══════════════════════════════════════════════════════════════ */
// function ProductImageCell({ image, galleryImages, name }) {
//   const [lightbox, setLightbox] = useState(null);
//   const [lbIdx, setLbIdx]       = useState(0);
//   const gallery = galleryImages || [];
//   const allImgs = [image, ...gallery].filter(Boolean);
//   const prev = () => { const i = (lbIdx - 1 + allImgs.length) % allImgs.length; setLbIdx(i); setLightbox(allImgs[i]); };
//   const next = () => { const i = (lbIdx + 1) % allImgs.length; setLbIdx(i); setLightbox(allImgs[i]); };
//   return (
//     <>
//       <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
//         {image
//           ? <button type="button" onClick={() => { setLbIdx(0); setLightbox(image); }} style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", border: "2px solid #2563eb", cursor: "pointer", padding: 0 }}>
//               <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//             </button>
//           : <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛒</div>
//         }
//         {gallery.slice(0, 3).map((url, idx) => (
//           <button key={idx} type="button" onClick={() => { setLbIdx(idx + 1); setLightbox(url); }}
//             style={{ width: 36, height: 36, borderRadius: 7, overflow: "hidden", border: "2px solid #86efac", cursor: "pointer", marginLeft: -4, padding: 0 }}>
//             <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//           </button>
//         ))}
//       </div>
//       {lightbox && (
//         <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setLightbox(null)}>
//           <div style={{ position: "relative", maxWidth: 520, width: "100%" }} onClick={(e) => e.stopPropagation()}>
//             <img src={lightbox} alt="" style={{ width: "100%", borderRadius: 14, objectFit: "contain", maxHeight: "70vh" }} />
//             {allImgs.length > 1 && (
//               <>
//                 <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: "absolute", top: "50%", left: -44, transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", color: "white", fontSize: 18 }}>‹</button>
//                 <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: "absolute", top: "50%", right: -44, transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", color: "white", fontSize: 18 }}>›</button>
//               </>
//             )}
//             <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: -14, right: -14, background: "white", borderRadius: "50%", border: "none", width: 30, height: 30, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>✕</button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    BULK PRICE RANGE CELL
// ══════════════════════════════════════════════════════════════ */
// function BulkPriceRangeCell({ productId, basePrice, salePrice, allBulkRules }) {
//   const [expanded, setExpanded] = useState(false);
//   const rules = (allBulkRules || []).filter((d) => String(d.productId) === String(productId)).sort((a, b) => a.minQty - b.minQty);
//   if (!rules.length) return <span style={{ fontSize: 11.5, color: "var(--textDim)", fontStyle: "italic" }}>—</span>;
//   const base = Number(salePrice || basePrice) || 0;
//   const minPrice = Math.min(...rules.map((r) => r.unitPrice));
//   const maxSaving = base > 0 ? Math.round(((base - minPrice) / base) * 100) : 0;
//   return (
//     <div style={{ position: "relative" }}>
//       <button type="button" onClick={() => setExpanded((p) => !p)} className="bpr-trigger">
//         <span>📊</span><span className="bpr-label">{rules.length} tier{rules.length > 1 ? "s" : ""}</span>
//         {maxSaving > 0 && <span className="bpr-saving">-{maxSaving}%</span>}
//         <span style={{ color: "var(--textDim)", fontSize: 10 }}>{expanded ? "▲" : "▼"}</span>
//       </button>
//       {expanded && (
//         <>
//           <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setExpanded(false)} />
//           <div className="bpr-popup">
//             <div className="bpr-popup-title">📊 Bulk Tiers<button type="button" onClick={() => setExpanded(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--textDim)", fontSize: 14, marginLeft: "auto" }}>✕</button></div>
//             {rules.map((rule, idx) => (
//               <div key={rule._id || idx} className="bpr-row">
//                 <div className="bpr-tier-num">T{idx + 1}</div>
//                 <div className="bpr-qty-range">{(!rule.maxQty || Number(rule.maxQty) === Number(rule.minQty)) ? pcsToDisplay(rule.minQty) + "+" : `${pcsToDisplay(rule.minQty)} – ${pcsToDisplay(rule.maxQty)}`}</div>
//                 <div className="bpr-arrow">→</div>
//                 <div className="bpr-price">₹{rule.unitPrice}<span style={{ fontSize: 10, color: "var(--textDim)" }}>/u</span></div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════════════════════ */
// export default function VendorProducts() {
//   const [products,          setProducts]          = useState([]);
//   const [categories,        setCategories]        = useState([]);
//   const [brands,            setBrands]            = useState([]);
//   const [subcategories,     setsubcategories]     = useState([]);
//   const [subSubCats,        setSubSubCats]        = useState([]);
//   const [hsnCodes,          setHsnCodes]          = useState([]);
//   const [hsnCategories,     setHsnCategories]     = useState([]);
//   const [allBulkRules,      setAllBulkRules]      = useState([]);
//   const [search,            setSearch]            = useState("");
//   const [loading,           setLoading]           = useState(false);
//   const [submitting,        setSubmitting]        = useState(false);
//   const [form,              setForm]              = useState(EMPTY);
//   const [editId,            setEditId]            = useState(null);
//   const [copyMode,          setCopyMode]          = useState(false);
//   const [drawer,            setDrawer]            = useState(false);
//   const [uploaderKey,       setUploaderKey]       = useState("new");
//   const [toast,             setToast]             = useState(null);
//   const [deleteId,          setDeleteId]          = useState(null);
//   const [page,              setPage]              = useState(1);
//   const [selectedItems,     setSelectedItems]     = useState([]);
//   const [bulkMode,          setBulkMode]          = useState(false);
//   const [filterCategory,    setFilterCategory]    = useState("");
//   const [filterSubcategory, setFilterSubcategory] = useState("");
//   const [filterSubSubCat,   setFilterSubSubCat]   = useState("");
//   const [filterSubs,        setFilterSubs]        = useState([]);
//   const [filterSubSubs,     setFilterSubSubs]     = useState([]);
//   const [filterStatus,      setFilterStatus]      = useState("");
//   const [showAddHsn,        setShowAddHsn]        = useState(false);
//   const [tempBulkRules,     setTempBulkRules]     = useState([]);
//   const tempBulkRulesRef = useRef([]);
//   const limit = 25;

//   useEffect(() => { fetchCategories(); fetchProducts(); fetchHsnCodes(); fetchAllBulkRules(); fetchBrands(); }, []);

//   useEffect(() => {
//     if (!form.category) { setsubcategories([]); setSubSubCats([]); return; }
//     const cat = categories.find((c) => c._id === form.category);
//     setsubcategories(cat?.subcategories || []);
//     setSubSubCats([]);
//     setForm((p) => ({ ...p, subcategory: "", subSubCategory: "" }));
//   }, [form.category]);

//   useEffect(() => {
//     if (!form.subcategory) { setSubSubCats([]); return; }
//     const cat = categories.find((c) => c._id === form.category);
//     const sub = cat?.subcategories?.find((s) => s._id === form.subcategory);
//     setSubSubCats(sub?.subSubcategories || []);
//     setForm((p) => ({ ...p, subSubCategory: "" }));
//   }, [form.subcategory]);

//   useEffect(() => {
//     if (!filterCategory) { setFilterSubs([]); setFilterSubSubs([]); setFilterSubcategory(""); setFilterSubSubCat(""); return; }
//     const cat = categories.find((c) => c._id === filterCategory);
//     setFilterSubs(cat?.subcategories || []); setFilterSubcategory(""); setFilterSubSubCat(""); setFilterSubSubs([]);
//   }, [filterCategory]);

//   useEffect(() => {
//     if (!filterSubcategory) { setFilterSubSubs([]); setFilterSubSubCat(""); return; }
//     const cat = categories.find((c) => c._id === filterCategory);
//     const sub = cat?.subcategories?.find((s) => s._id === filterSubcategory);
//     setFilterSubSubs(sub?.subSubcategories || []); setFilterSubSubCat("");
//   }, [filterSubcategory]);

//   // Auto-calculate salePrice
//   useEffect(() => {
//     if (form._manualSale) return;
//     const bd = calcGstBreakdown(Number(form.basePrice) || 0, Number(form.profit) || 0, Number(form.gstPercent) || 0, Number(form.cessPercent) || 0, form.taxType || "cgst_sgst");
//     setForm((p) => ({ ...p, salePrice: String(bd.salePrice) }));
//   }, [form.basePrice, form.profit, form.gstPercent, form.cessPercent, form.taxType, form._manualSale]);

//   const notify = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };
//   const handleTempBulkChange = useCallback((rules) => { setTempBulkRules(rules); tempBulkRulesRef.current = rules; }, []);

//   const fetchBrands = async () => {
//     try { const res = await axiosAuth.get(BRAND_API); setBrands(res.data?.data || []); }
//     catch (err) { console.error("fetchBrands:", err); }
//   };

//   const fetchAllBulkRules = async () => {
//     try { const res = await axiosAuth.get(`${BULK_API_URL}/my`); setAllBulkRules(res.data?.data || []); }
//     catch {}
//   };

//   const fetchHsnCodes = async () => {
//     try {
//       const res = await axiosAuth.get(HSN_API_URL);
//       if (res.data?.success) { setHsnCodes(res.data.data || []); setHsnCategories(res.data.categories || []); }
//     } catch {}
//   };

//   const fetchCategories = async () => {
//     try { const res = await axiosAuth.get(CATEGORY_URL); if (res.data?.success) setCategories(res.data.categories || []); }
//     catch {}
//   };

//   const fetchProducts = async () => {
//     try { setLoading(true); const res = await axiosAuth.get(API_URL); if (res.data?.success) setProducts(res.data.data || []); }
//     catch {} finally { setLoading(false); }
//   };

//   // const handleChange = (e) => {
//   //   const { name, value } = e.target;
//   //   if (name === "salePrice") setForm((p) => ({ ...p, salePrice: value, _manualSale: true }));
//   //   else setForm((p) => ({ ...p, [name]: value }));
//   // };
//   const handleChange = (e) => {
//   const { name, value } = e.target;

//   // Prevent MRP less than sale price
//   if (
//     name === "mrp" &&
//     Number(value) <
//       Number(form.salePrice || 0)
//   ) {
//     return;
//   }

//   if (name === "salePrice") {
//     setForm((p) => ({
//       ...p,
//       salePrice: value,
//       _manualSale: true,
//     }));
//   } else {
//     setForm((p) => ({
//       ...p,
//       [name]: value,
//     }));
//   }
// };

//   const handleMainImageChange  = useCallback(({ file, existingUrl }) => setForm((p) => ({ ...p, mainImageFile: file, existingMainImage: existingUrl })), []);
//   const handleGalleryChange    = useCallback((newFiles, existingUrls) => setForm((p) => ({ ...p, galleryFiles: newFiles, existingGalleryImages: existingUrls })), []);
//   const handleUnitConvChange   = useCallback((convs) => setForm((p) => ({ ...p, unitConversions: convs })), []);

//   const handleHsnSelect = (hsnObj) => {
//     if (!hsnObj) setForm((p) => ({ ...p, hsnCode: "", gstPercent: "", cessPercent: "0", _manualSale: false }));
//     else setForm((p) => ({ ...p, hsnCode: hsnObj.code, gstPercent: String(hsnObj.gst ?? 0), cessPercent: String(hsnObj.cess ?? 0), _manualSale: false }));
//   };

//   const handleHsnAdded = (newHsn) => {
//     setHsnCodes((prev) => [...prev, newHsn]);
//     setHsnCategories((prev) => prev.includes(newHsn.category) ? prev : [...prev, newHsn.category]);
//     handleHsnSelect(newHsn); notify("HSN code added!");
//   };

//   const handleBrandAdded = (newBrand) => {
//     setBrands((prev) => [...prev, newBrand]);
//     notify(`Brand "${newBrand.name}" added!`);
//   };

//   const resetForm = () => {
//     setForm(EMPTY); setEditId(null); setCopyMode(false); setDrawer(false);
//     setsubcategories([]); setSubSubCats([]);
//     setUploaderKey(Date.now().toString());
//     setTempBulkRules([]); tempBulkRulesRef.current = [];
//   };

//   const buildFD = () => {
//     const fd = new FormData();
//     fd.append("name",        form.name.trim());
//     fd.append("brand",       form.brand);
//     fd.append("category",    form.category);
//     fd.append("status",      form.status);
//     fd.append("basePrice",   form.basePrice);
//     fd.append("profit",      form.profit || 0);
//     fd.append("mrp", form.mrp);
//     fd.append("packaging",   JSON.stringify(form.packaging));
//     // unitConversions sent as { unit, nPcs } array — matches model schema exactly
//     fd.append("unitConversions", JSON.stringify(form.unitConversions || []));
//     fd.append("gstPercent",  form.gstPercent  || 0);
//     fd.append("cessPercent", form.cessPercent || 0);
//     fd.append("hsnCode",     form.hsnCode     || "");
//     fd.append("taxType",     form.taxType     || "cgst_sgst");
//     if (form.validTill)   fd.append("validTill",   form.validTill);
//     if (form.description) fd.append("description", form.description);

//     if (form.weightValue && form.weightUnit) {
//       fd.append("weight", JSON.stringify({ value: Number(form.weightValue), unit: form.weightUnit }));
//     }

//     if (form.subcategory) {
//       const sub = subcategories.find((s) => s._id === form.subcategory);
//       if (sub) fd.append("subcategory", JSON.stringify({ id: sub._id, name: sub.name, image: sub.image || null }));
//     } else { fd.append("subcategory", ""); }

//     if (form.subSubCategory) {
//       const ss = subSubCats.find((s) => s._id === form.subSubCategory);
//       if (ss) fd.append("subSubCategory", JSON.stringify({ id: ss._id, name: ss.name, image: ss.image || null }));
//     } else { fd.append("subSubCategory", ""); }

//     if (form.mainImageFile) fd.append("mainImage", form.mainImageFile);
//     else fd.append("existingMainImage", form.existingMainImage || "");
//     (form.galleryFiles || []).forEach((f) => fd.append("galleryImages", f));
//     fd.append("existingGalleryImages", JSON.stringify(form.existingGalleryImages || []));
//     return fd;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name || !form.category || !form.basePrice) { notify("Name, category & base price required", "error"); return; }
//     if (!form.brand) { notify("Brand required", "error"); return; }
//     const nameExists = products.some((p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p._id !== editId);
//     if (nameExists) { notify("Product name already exists!", "error"); return; }

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
//         newProductId = res?.data?.data?._id;
//         if (!newProductId) { notify("Product ID missing", "error"); return; }
//         notify(copyMode ? "Copy saved!" : "Product added!");
//       }

//       const validRules = (tempBulkRulesRef.current || []).filter((r) => Number(r.minQty) > 0 && Number(r.unitPrice) > 0);
//       if (validRules.length > 0 && newProductId) {
//         try {
//           await Promise.all(validRules.map((rule) =>
//             axiosAuth.post(`${BULK_API_URL}/add`, { product: newProductId, minQty: Number(rule.minQty), maxQty: rule.maxQty ? Number(rule.maxQty) : null, unitPrice: Number(rule.unitPrice), profit: Number(rule.profit || 0) })
//           ));
//           notify(`Product + ${validRules.length} bulk tier(s) saved!`);
//         } catch { notify("Product saved! Bulk tiers failed — retry from edit.", "error"); }
//       }

//       await fetchProducts(); await fetchAllBulkRules(); resetForm();
//     } catch (err) {
//       notify(err.response?.data?.message || "Something went wrong", "error");
//     } finally { setSubmitting(false); }
//   };

//   const buildFormFromProduct = (p, overrides = {}) => {
//     const catId = p.category?._id || p.category;
//     const cat   = categories.find((c) => c._id === catId);
//     const subs  = cat?.subcategories || [];
//     const sub   = subs.find((s) => s._id === p.subcategory?.id);
//     setsubcategories(subs);
//     setSubSubCats(sub?.subSubcategories || []);
//     const brandId = p.brand?._id || p.brand || "";
//     return {
//       name: p.name || "", brand: brandId,
//       category: catId || "", subcategory: p.subcategory?.id || "", subSubCategory: p.subSubCategory?.id || "",
//       description: p.description || "",
//       basePrice: String(p.basePrice || ""), profit: String(p.profit || ""), salePrice: String(p.salePrice || ""),
//       weightValue: p.weight?.value != null ? String(p.weight.value) : "",
//       weightUnit:  p.weight?.unit  || "kg",
//       packaging:   p.packaging || { box: 0, packetPerBox: 0, piecePerPacket: 0 },
//       // unitConversions come from DB as [{ unit, nPcs }] — used as-is
//       unitConversions: p.unitConversions || [],
//       status: p.status || "inactive",
//       gstPercent:  p.gstPercent  !== undefined ? String(p.gstPercent)  : "",
//       cessPercent: p.cessPercent !== undefined ? String(p.cessPercent) : "0",
//       hsnCode: p.hsnCode || "", taxType: p.taxType || "cgst_sgst",
//       validTill: p.validTill ? p.validTill.split("T")[0] : "",
//       mainImageFile: null, existingMainImage: p.image || "",
//       galleryFiles: [], existingGalleryImages: p.galleryImages || [],
//       _manualSale: false, ...overrides,
//     };
//   };

//   const handleEdit = (p) => {
//     setForm(buildFormFromProduct(p)); setEditId(p._id); setCopyMode(false);
//     setUploaderKey(p._id); setTempBulkRules([]); tempBulkRulesRef.current = []; setDrawer(true);
//   };

//   const handleCopy = (p) => {
//     setForm(buildFormFromProduct(p, { name: `${p.name} (Copy)`, status: "inactive" }));
//     setEditId(null); setCopyMode(true);
//     setUploaderKey(`copy-${p._id}-${Date.now()}`); setTempBulkRules([]); tempBulkRulesRef.current = []; setDrawer(true);
//   };

//   const handleDelete = async () => {
//     try { await axiosAuth.delete(`${API_URL}/${deleteId}`); fetchProducts(); notify("Product deleted."); }
//     catch { notify("Delete failed.", "error"); }
//     finally { setDeleteId(null); }
//   };

//   const handleStatusToggle = async (item) => {
//     try {
//       const newStatus = item.status === "active" ? "inactive" : "active";
//       await axiosAuth.put(`${API_URL}/status/${item._id}`, { status: newStatus });
//       setProducts((prev) => prev.map((x) => x._id === item._id ? { ...x, status: newStatus } : x));
//     } catch { notify("Status update failed.", "error"); }
//   };

//   const handleInlineBasePrice = async (productId, newBase) => {
//     try {
//       const item = products.find((x) => x._id === productId);
//       if (!item) return;
//       await axiosAuth.post(`${API_URL}/bulk-update`, {
//         products: [{ id: productId, basePrice: newBase, profit: Number(item.profit) || 0, gstPercent: Number(item.gstPercent) || 0, cessPercent: Number(item.cessPercent) || 0, hsnCode: item.hsnCode || "", taxType: item.taxType || "cgst_sgst", brand: item.brand?._id || item.brand || "", status: item.status }],
//       });
//       await fetchProducts(); notify(`Base price updated!`);
//     } catch { notify("Price update failed.", "error"); }
//   };

//   const updateLocal = (id, key, val) => setProducts((prev) => prev.map((x) => x._id === id ? { ...x, [key]: val } : x));

//   const handleBulkSave = async () => {
//     if (!selectedItems.length) return notify("No items selected", "error");
//     const updates = products.filter((x) => selectedItems.includes(x._id)).map((x) => ({
//       id: x._id, basePrice: Number(x.basePrice), profit: Number(x.profit || 0),
//       gstPercent: Number(x.gstPercent || 0), cessPercent: Number(x.cessPercent || 0),
//       hsnCode: x.hsnCode || "", taxType: x.taxType || "cgst_sgst",
//       brand: x.brand?._id || x.brand || "", status: x.status,
//     }));
//     try {
//       await axiosAuth.post(`${API_URL}/bulk-update`, { products: updates });
//       notify("Bulk save done!"); setBulkMode(false); setSelectedItems([]); fetchProducts();
//     } catch { notify("Bulk save failed.", "error"); }
//   };

//   const handleBulkDelete = async () => {
//     if (!selectedItems.length) return notify("No items selected", "error");
//     if (!window.confirm("Delete selected products?")) return;
//     try { await axiosAuth.post(`${API_URL}/delete-selected`, { ids: selectedItems }); setSelectedItems([]); setBulkMode(false); fetchProducts(); notify("Selected deleted."); }
//     catch { notify("Bulk delete failed.", "error"); }
//   };

//   const handleFixAllPrices = async () => {
//     if (!window.confirm("Recalculate all sale prices?")) return;
//     try { const res = await axiosAuth.post(`${API_URL}/fix-prices`); notify(res.data?.message || "Prices fixed!"); fetchProducts(); }
//     catch { notify("Fix failed.", "error"); }
//   };

//   const filtered = products.filter((p) => {
//     const t = search.toLowerCase();
//     const brandName = p.brand?.name || "";
//     const matchText = (p.name || "").toLowerCase().includes(t) || brandName.toLowerCase().includes(t) || (p.category?.name || "").toLowerCase().includes(t) || (p.hsnCode || "").toLowerCase().includes(t);
//     return matchText
//       && (!filterCategory    || (p.category?._id || p.category) === filterCategory)
//       && (!filterSubcategory || p.subcategory?.id === filterSubcategory)
//       && (!filterSubSubCat   || p.subSubCategory?.id === filterSubSubCat)
//       && (!filterStatus      || p.status === filterStatus);
//   });

//   const start      = (page - 1) * limit;
//   const paginated  = filtered.slice(start, start + limit);
//   const totalPages = Math.ceil(filtered.length / limit);

//   /* ── CSS ── */
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
//       --shadow:0 1px 3px rgba(0,0,0,.07);--shadowMd:0 4px 16px rgba(0,0,0,.09);--shadowLg:0 16px 48px rgba(0,0,0,.14);
//       --r:10px;
//     }
//     *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
//     .vp{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);min-height:100vh;color:var(--text)}
//     .vp-topbar{background:var(--white);border-bottom:1px solid var(--border);height:58px;padding:0 28px;display:flex;align-items:center;position:sticky;top:0;z-index:50}
//     .vp-topbar-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:15px}
//     .vp-body{padding:24px 28px 64px;max-width:1400px}
//     .vp-page-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
//     .vp-page-header h1{font-size:20px;font-weight:700;letter-spacing:-.4px}
//     .vp-page-header p{font-size:13px;color:var(--textMid);margin-top:4px}
//     .vp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
//     .vp-stat{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;box-shadow:var(--shadow);display:flex;align-items:center;gap:14px}
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
//     .btn-primary:hover:not(:disabled){background:var(--blueHov);transform:translateY(-1px)}
//     .btn-primary:disabled{opacity:.55;cursor:not-allowed}
//     .btn-copy{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--orangeFade);border:1.5px solid #fed7aa;border-radius:8px;color:var(--orange);font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
//     .btn-copy:hover:not(:disabled){background:var(--orange);color:#fff}
//     .btn-copy:disabled{opacity:.55;cursor:not-allowed}
//     .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--textMid);font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
//     .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--bg)}
//     .btn-danger-sm{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;background:var(--redFade);border:1px solid #fecaca;border-radius:8px;color:var(--red);font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
//     .btn-danger-sm:hover{background:var(--red);color:#fff}
//     .btn-icon{width:32px;height:32px;border-radius:7px;border:1px solid var(--border);background:var(--white);color:var(--textMid);font-size:13px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;flex-shrink:0}
//     .btn-edit:hover{border-color:var(--blue);color:var(--blue);background:var(--blueFade)}
//     .btn-copy-icon:hover{border-color:var(--orange);color:var(--orange);background:var(--orangeFade)}
//     .btn-del:hover{border-color:var(--red);color:var(--red);background:var(--redFade)}
//     .vp-bulk-bar{background:#eef2ff;border:1px solid #dbeafe;border-radius:10px;padding:14px 18px;margin-bottom:14px}
//     .vp-table-wrap{overflow-x:auto}
//     .vp-table{width:100%;border-collapse:collapse;min-width:1280px}
//     .vp-table thead tr{border-bottom:1px solid var(--border);background:#f8f9fc}
//     .vp-table th{padding:10px 12px;text-align:left;white-space:nowrap;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--textMid)}
//     .vp-table tbody tr{border-bottom:1px solid var(--border);transition:background .12s}
//     .vp-table tbody tr:last-child{border-bottom:none}
//     .vp-table tbody tr:hover{background:#f8faff}
//     .vp-table td{padding:11px 12px;font-size:13px;vertical-align:middle}
//     .vp-prod-cell{display:flex;align-items:center;gap:11px}
//     .vp-prod-name{font-weight:600;font-size:13px;line-height:1.3}
//     .vp-prod-brand{font-size:11.5px;color:var(--blue);font-weight:500;margin-top:2px;display:flex;align-items:center;gap:4px}
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
//     .vp-empty{padding:64px 20px;text-align:center}
//     .vp-empty-icon{font-size:40px;margin-bottom:12px;opacity:.25}
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
//     .vp-drawer.copy-drawer{border-color:#fed7aa}
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
//     .price-calc-box{margin-bottom:12px;padding:12px 14px;background:linear-gradient(135deg,#f0f9ff,#eff6ff);border:1px solid #bfdbfe;border-radius:10px}
//     .price-calc-row{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;margin-bottom:4px}
//     .price-calc-row:last-child{margin-bottom:0;padding-top:8px;border-top:1px solid #bfdbfe;margin-top:8px}
//     .price-calc-label{color:var(--textMid);font-weight:500}
//     .price-calc-val{font-weight:700;color:var(--text)}
//     .price-calc-profit{color:#16a34a;font-weight:700}
//     .cess-field{border:1px solid #ddd6fe!important;background:#faf5ff!important}
//     .cess-field:focus{border-color:#7c3aed!important;box-shadow:0 0 0 3px rgba(124,58,237,.09)!important}
//     .hsn-info-box{margin-top:8px;padding:10px 12px;background:var(--blueFade);border:1px solid #bfdbfe;border-radius:8px;display:flex;gap:10px}
//     .hsn-info-code{font-family:monospace;font-size:11px;font-weight:700;color:var(--blue);background:#dbeafe;padding:3px 7px;border-radius:5px;flex-shrink:0;align-self:flex-start}
//     .hsn-info-desc{font-size:12px;color:#1e40af;line-height:1.4}
//     .img-section-box{padding:14px;border:1px solid var(--border);border-radius:10px;background:#fafbfd;margin-bottom:14px}
//     .img-section-label{font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--textDim);margin-bottom:10px;display:flex;align-items:center;gap:6px}
//     .bd-wrap{border:1.5px solid #e0f2fe;border-radius:12px;overflow:hidden;background:#f8fbff}
//     .bd-header{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-bottom:1px solid #bae6fd}
//     .bd-header-icon{width:32px;height:32px;background:white;border:1px solid #bae6fd;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
//     .bd-add-btn{padding:5px 12px;background:var(--blue);color:white;border:none;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
//     .bd-form-wrap{margin:12px;padding:14px;background:white;border:1px solid #bae6fd;border-radius:10px}
//     .bd-form-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:10px}
//     .bd-lbl{display:block;font-size:11px;font-weight:600;color:var(--textMid);margin-bottom:4px}
//     .bd-inp{width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:var(--text);outline:none;transition:border-color .2s}
//     .bd-inp:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.08)}
//     .bd-error{padding:7px 10px;background:var(--redFade);border:1px solid #fecaca;border-radius:7px;color:var(--red);font-size:11.5px;margin-bottom:8px}
//     .bd-save-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;background:var(--blue);color:white;border:none;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
//     .bd-save-btn:disabled{opacity:.6;cursor:not-allowed}
//     .bd-cancel-btn{padding:6px 12px;background:transparent;border:1px solid var(--border);border-radius:7px;color:var(--textMid);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;cursor:pointer}
//     .bd-skeleton{height:52px;background:linear-gradient(90deg,#f0f2f7 25%,#e4e7ef 50%,#f0f2f7 75%);background-size:300% 100%;animation:shim 1.5s ease infinite;border-radius:8px}
//     .bd-empty{padding:20px 16px;text-align:center}
//     .bd-empty-icon{font-size:28px;opacity:.2;margin-bottom:8px}
//     .bd-rules-list{padding:10px 12px;display:flex;flex-direction:column;gap:8px}
//     .bd-rule-card{background:white;border:1px solid #e0f2fe;border-radius:9px;padding:10px 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
//     .bd-rule-tier-badge{font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:#e0f2fe;padding:3px 7px;border-radius:20px;flex-shrink:0}
//     .bd-rule-main{display:flex;align-items:center;gap:8px;flex:1;min-width:0;flex-wrap:wrap}
//     .bd-unit-price{font-size:14px;font-weight:800;color:var(--blue)}
//     .bd-per-unit{font-size:10px;color:var(--textDim)}
//     .bd-savings-tag{font-size:10px;font-weight:700;color:#16a34a;background:#dcfce7;padding:2px 6px;border-radius:20px}
//     .bd-rule-actions{display:flex;gap:5px;flex-shrink:0}
//     .bd-edit-btn,.bd-del-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--white);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
//     .bd-edit-btn:hover{border-color:var(--blue);background:var(--blueFade)}
//     .bd-del-btn:hover{border-color:var(--red);background:var(--redFade)}
//     .bd-del-overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px}
//     .bd-del-modal{background:white;border-radius:12px;padding:22px;width:280px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:popIn .2s cubic-bezier(.22,1,.36,1)}
//     @keyframes popIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
//     .bpr-trigger{display:flex;align-items:center;gap:5px;padding:4px 9px;border:1px solid #bae6fd;border-radius:7px;background:#f0f9ff;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;color:#0369a1;white-space:nowrap}
//     .bpr-label{font-weight:600}
//     .bpr-saving{padding:2px 6px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:10px;font-weight:700}
//     .bpr-popup{position:absolute;top:calc(100% + 6px);left:0;z-index:200;background:white;border:1px solid #bae6fd;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.14);min-width:280px;overflow:hidden}
//     .bpr-popup-title{padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:#f0f9ff;border-bottom:1px solid #bae6fd;display:flex;align-items:center}
//     .bpr-row{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid #f0f9ff;font-size:12px;flex-wrap:wrap}
//     .bpr-tier-num{width:22px;height:22px;background:#0369a1;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0}
//     .bpr-qty-range{flex:1;font-weight:600;color:var(--text);min-width:80px}
//     .bpr-arrow{color:var(--textDim);font-size:11px}
//     .bpr-price{font-weight:800;color:var(--blue)}
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
//     .hsn-search{width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;outline:none}
//     .hsn-search:focus{border-color:var(--blue)}
//     .hsn-cat-bar{display:flex;gap:6px;padding:6px 10px;overflow-x:auto;border-bottom:1px solid var(--border);scrollbar-width:none}
//     .hsn-cat-pill{flex-shrink:0;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;border:none;background:#f3f4f6;color:var(--textMid);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif}
//     .hsn-cat-pill-active{background:var(--blue)!important;color:white!important}
//     .hsn-list{max-height:220px;overflow-y:auto;padding:6px}
//     .hsn-empty{padding:24px;text-align:center;color:var(--textDim);font-size:13px}
//     .hsn-item{width:100%;display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border:none;border-radius:8px;background:transparent;cursor:pointer;text-align:left;font-family:'Plus Jakarta Sans',sans-serif}
//     .hsn-item:hover,.hsn-item-high{background:#f8fafc}
//     .hsn-item-selected{background:var(--blueFade)!important}
//     .hsn-item-code{font-family:monospace;font-size:10px;font-weight:700;padding:3px 6px;border-radius:4px;background:#f3f4f6;color:var(--text);flex-shrink:0;margin-top:1px}
//     .hsn-item-code-sel{background:var(--blue)!important;color:white!important}
//     .hsn-item-desc{font-size:12px;color:var(--text);line-height:1.3}
//     .hsn-item-cat{font-size:10px;color:var(--textDim);margin-top:2px}
//     .hsn-footer{padding:7px 12px;border-top:1px solid var(--border);font-size:10px;color:var(--textDim);background:#f8f9fc}
//     .vp-modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.52);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeO .2s ease}
//     .vp-modal{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:28px;width:460px;box-shadow:var(--shadowLg);animation:popIn .22s cubic-bezier(.22,1,.36,1)}
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
//     @media(max-width:768px){.vp-stats{grid-template-columns:1fr 1fr}.vp-body{padding:16px 14px 60px}.vp-row2,.vp-row3{grid-template-columns:1fr}}
//   `;

//   return (
//     <>
//       <style>{css}</style>
//       <div className="vp">
//         <div className="vp-topbar">
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <div className="vp-topbar-icon">🏪</div>
//             <span style={{ fontSize: 15, fontWeight: 700, marginLeft: 9 }}>Seller Panel</span>
//             <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 10px" }} />
//             <span style={{ fontSize: 13, color: "var(--textMid)" }}>Products</span>
//           </div>
//         </div>

//         <div className="vp-body">
//           <div className="vp-page-header fade-up">
//             <div>
//               <h1>Products</h1>
//               <p>{products.length} products · {categories.length} categories · {brands.length} brands · {hsnCodes.length} HSN codes</p>
//             </div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button className="btn-ghost" onClick={handleFixAllPrices}>🔧 Fix Prices</button>
//               <button className="btn-primary" onClick={() => { resetForm(); setDrawer(true); }}>+ Add Product</button>
//             </div>
//           </div>

//           <div className="vp-stats fade-up">
//             {[
//               { icon: "📦", bg: "#eff6ff", val: products.length, lbl: "Total Products" },
//               { icon: "✅", bg: "#f0fdf4", val: products.filter((p) => p.status === "active").length, lbl: "Active" },
//               { icon: "🏷️", bg: "#fffbeb", val: brands.length, lbl: "Brands" },
//               { icon: "💰", bg: "#fdf4ff", val: `₹${products.reduce((s, p) => s + (Number(p.basePrice) || 0), 0).toLocaleString()}`, lbl: "Catalogue Value" },
//             ].map((s, i) => (
//               <div className="vp-stat" key={i}>
//                 <div className="vp-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
//                 <div><div className="vp-stat-val">{s.val}</div><div className="vp-stat-lbl">{s.lbl}</div></div>
//               </div>
//             ))}
//           </div>

//           {selectedItems.length > 0 && (
//             <div className="vp-bulk-bar fade-up">
//               <div className="action-row">
//                 <span style={{ fontSize: 13, fontWeight: 600, color: "#4338ca" }}>{selectedItems.length} selected</span>
//                 <button className="btn-primary" onClick={() => setBulkMode(true)}>Bulk Edit</button>
//                 <button className="btn-danger-sm" onClick={handleBulkDelete}>Delete</button>
//                 <button className="btn-ghost" onClick={() => setSelectedItems([])}>Clear</button>
//               </div>
//             </div>
//           )}

//           <div className="vp-card fade-up">
//             <div className="vp-toolbar">
//               <div className="vp-toolbar-left">
//                 <div className="vp-search-wrap">
//                   <span className="vp-search-ico">⌕</span>
//                   <input className="vp-search" placeholder="Search name, brand, HSN..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
//                 </div>
//                 <select className="vp-sel-filter" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
//                   <option value="">All Categories</option>
//                   {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
//                 </select>
//                 {filterSubs.length > 0 && (
//                   <select className="vp-sel-filter" value={filterSubcategory} onChange={(e) => { setFilterSubcategory(e.target.value); setPage(1); }}>
//                     <option value="">All Subs</option>
//                     {filterSubs.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
//                   </select>
//                 )}
//                 <select className="vp-sel-filter" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
//                   <option value="">All Status</option>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//                 {search && <span className="vp-results-badge">{filtered.length} results</span>}
//               </div>
//               <div className="action-row">
//                 <button className="btn-ghost" onClick={async () => {
//                   try {
//                     const res = await axiosAuth.get(`${API_URL}/export`, { responseType: "blob" });
//                     const url = window.URL.createObjectURL(new Blob([res.data])); const a = document.createElement("a"); a.href = url; a.download = "vendor_products.csv"; a.click();
//                   } catch { notify("Export failed.", "error"); }
//                 }}>Export CSV</button>
//                 <label style={{ cursor: "pointer" }}>
//                   <input type="file" accept=".csv" style={{ display: "none" }} onChange={async (e) => {
//                     try { const fd = new FormData(); fd.append("file", e.target.files[0]); const res = await axiosAuth.post(`${API_URL}/import`, fd); notify(`Imported ${res.data.imported} products.`); fetchProducts(); }
//                     catch { notify("Import failed.", "error"); } e.target.value = "";
//                   }} />
//                   <span className="btn-ghost">Import CSV</span>
//                 </label>
//               </div>
//             </div>

//             <div className="vp-table-wrap">
//               <table className="vp-table">
//                 <thead>
//                   <tr>
//                     <th style={{ width: 36 }}>
//                       <input type="checkbox" checked={selectedItems.length === filtered.length && filtered.length > 0}
//                         onChange={() => setSelectedItems(selectedItems.length === filtered.length ? [] : filtered.map((x) => x._id))} />
//                     </th>
//                     <th>#</th><th>Product</th><th>Category</th>
//                     <th>HSN / GST</th><th>Weight</th><th>Base</th><th>Profit</th>
//                     <th>Sale Price</th><th>Bulk</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     [1, 2, 3, 4].map((i) => (
//                       <tr className="sh-row" key={i}>
//                         {[36, 20, 220, 100, 160, 80, 80, 70, 100, 80, 80, 80].map((w, j) => (
//                           <td key={j}><div className="shimmer" style={{ width: w }} /></td>
//                         ))}
//                       </tr>
//                     ))
//                   ) : paginated.length === 0 ? (
//                     <tr><td colSpan={12}><div className="vp-empty"><div className="vp-empty-icon">📦</div><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>No products</div></div></td></tr>
//                   ) : paginated.map((p, i) => {
//                     const hsnInfo = hsnCodes.find((h) => h.code === p.hsnCode);
//                     const gstKey  = p.gstPercent ?? 0;
//                     const badge   = GST_BADGE[gstKey] ?? GST_BADGE[0];
//                     const brandObj = brands.find((b) => b._id === (p.brand?._id || p.brand)) || p.brand;
//                     // Compute packing display using this product's own unitConversions
//                     const prodConversions = p.unitConversions || [];
//                     return (
//                       <tr key={p._id}>
//                         <td><input type="checkbox" checked={selectedItems.includes(p._id)} onChange={() => setSelectedItems((prev) => prev.includes(p._id) ? prev.filter((x) => x !== p._id) : [...prev, p._id])} /></td>
//                         <td style={{ color: "var(--textDim)", fontSize: 12 }}>{start + i + 1}</td>
//                         <td>
//                           <div className="vp-prod-cell">
//                             <ProductImageCell image={p.image} galleryImages={p.galleryImages} name={p.name} />
//                             <div>
//                               <div className="vp-prod-name">{p.name}</div>
//                               {brandObj && (
//                                 <div className="vp-prod-brand">
//                                   {(brandObj?.image?.url || typeof brandObj === "object" && brandObj.image?.url) && (
//                                     <img src={brandObj?.image?.url} alt="" style={{ width: 14, height: 14, borderRadius: 3, objectFit: "cover" }} />
//                                   )}
//                                   {brandObj?.name || ""}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td>
//                           {p.category?.name ? <span className="badge badge-blue">{p.category.name}</span> : <span style={{ color: "var(--textDim)" }}>—</span>}
//                           {p.subcategory?.name    && <div style={{ marginTop: 3 }}><span className="badge badge-indigo">→ {p.subcategory.name}</span></div>}
//                           {p.subSubCategory?.name && <div style={{ marginTop: 3 }}><span className="badge badge-purple">→ {p.subSubCategory.name}</span></div>}
//                         </td>
//                         <td>
//                           {p.hsnCode ? (
//                             <div>
//                               <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
//                                 <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{p.hsnCode}</span>
//                                 <span className="gst-badge" style={{ background: badge.bg, color: badge.text }}>
//                                   <span style={{ background: badge.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />GST {p.gstPercent ?? 0}%
//                                 </span>
//                               </div>
//                               {hsnInfo && <div style={{ fontSize: 10, color: "var(--textDim)", marginTop: 3, maxWidth: 160 }}>{hsnInfo.description}</div>}
//                             </div>
//                           ) : <span style={{ fontSize: 12, color: "var(--textDim)", fontStyle: "italic" }}>Not set</span>}
//                         </td>
//                         {/* <td>
//                           {p.weight?.value
//                             ? <span className="badge badge-gray">{p.weight.value} {p.weight.unit}</span>
//                             : <span style={{ color: "var(--textDim)" }}>—</span>}
//                           {prodConversions.length > 0 && (
//                             <div style={{ marginTop: 4 }}>
//                               {prodConversions.map((uc, ui) => (
//                                 <div key={ui} style={{ fontSize: 9.5, color: "#0369a1", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 4, padding: "1px 5px", marginBottom: 2, display: "inline-block", marginRight: 3 }}>
//                                   <span style={{ fontWeight: 700 }}>{uc.unit}</span> = {uc.nPcs} pcs
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </td> */}
//       <td>
//   {prodConversions.length > 0 && p.weight?.value ? (
//     <span style={{
//       fontSize: 12, fontWeight: 700, color: "#0369a1",
//       background: "#f0f9ff", border: "1px solid #bae6fd",
//       borderRadius: 7, padding: "4px 8px", display: "inline-block",
//     }}>
//       {pcsToDisplay(p.weight.value, prodConversions)}
//     </span>
//   ) : p.weight?.value ? (
//     <span className="badge badge-gray">{p.weight.value} {p.weight.unit}</span>
//   ) : (
//     <span style={{ color: "var(--textDim)" }}>—</span>
//   )}
// </td>
//                         <td><InlinePrice value={p.basePrice} onSave={(v) => handleInlineBasePrice(p._id, v)} /></td>
//                         <td>{Number(p.profit) > 0 ? <span className="badge badge-green">+₹{p.profit}</span> : <span style={{ color: "var(--textDim)" }}>—</span>}</td>
//                         <td>
//                           <div className="vp-sale-price">₹{p.salePrice}</div>
//                           {p.totalTaxAmount > 0 && <div style={{ fontSize: 9, color: "var(--textDim)", marginTop: 2 }}>Tax ₹{(p.totalTaxAmount || 0).toFixed(2)} incl.</div>}
//                         </td>
//                         <td><BulkPriceRangeCell productId={p._id} basePrice={p.basePrice} salePrice={p.salePrice} allBulkRules={allBulkRules} /></td>
//                         <td>
//                           <button className={`status-btn ${p.status === "active" ? "status-active" : "status-inactive"}`} onClick={() => handleStatusToggle(p)}>
//                             {p.status === "active" ? "Active" : "Inactive"}
//                           </button>
//                         </td>
//                         <td style={{ textAlign: "right" }}>
//                           <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
//                             <button className="btn-icon btn-edit"      onClick={() => handleEdit(p)}>✏️</button>
//                             <button className="btn-icon btn-copy-icon" onClick={() => handleCopy(p)}>📄</button>
//                             <button className="btn-icon btn-del"       onClick={() => setDeleteId(p._id)}>🗑️</button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {totalPages > 1 && (
//               <div className="vp-pager">
//                 <span className="vp-pager-info">Showing {start + 1}–{Math.min(start + limit, filtered.length)} of {filtered.length}</span>
//                 <div className="vp-pager-btns">
//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <button key={i} className={`pg-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
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
//           <div className={`vp-drawer${copyMode ? " copy-drawer" : ""}`} onClick={(e) => e.stopPropagation()}>
//             <div className={`vp-drawer-head${copyMode ? " copy-head" : ""}`}>
//               <div>
//                 <h2>{copyMode ? "Copy Product" : editId ? "Edit Product" : "Add New Product"}</h2>
//               </div>
//               <button className="vp-close" onClick={resetForm}>×</button>
//             </div>

//             <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
//               <div className="vp-drawer-body">
//                 {copyMode && (
//                   <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1.5px solid #fed7aa", borderRadius: 10, marginBottom: 18 }}>
//                     <span style={{ padding: "3px 9px", background: "var(--orange)", color: "#fff", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>COPY MODE</span>
//                     <span style={{ fontSize: 12, color: "var(--orange)" }}>Don't forget to change the name!</span>
//                   </div>
//                 )}

//                 {/* ── BASIC INFO ── */}
//                 <div className="vp-sec-head">Basic Information</div>
//                 <div className="vp-row2">
//                   <div className="vp-field">
//                     <label className="vp-lbl">Product Name *</label>
//                     <input className="vp-inp" name="name" placeholder="e.g. Organic Almonds" value={form.name} onChange={handleChange} required />
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">Status</label>
//                     <select className="vp-sel" name="status" value={form.status} onChange={handleChange}>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* ── BRAND ── */}
//                 <div className="vp-field">
//                   <label className="vp-lbl">
//                     Brand *
//                     <span className="vp-lbl-sub"> — select existing or click + to add new</span>
//                   </label>
//                   <BrandPicker
//                     value={form.brand}
//                     brands={brands}
//                     onSelect={(id) => setForm((p) => ({ ...p, brand: id }))}
//                     onBrandAdded={handleBrandAdded}
//                   />
//                 </div>

//                 {/* ── CATEGORY ── */}
//                 <div className="vp-sec-head">Category</div>
//                 <div className="vp-field">
//                   <label className="vp-lbl">Category *</label>
//                   <select className="vp-sel" name="category" value={form.category} onChange={handleChange} required>
//                     <option value="">Select category</option>
//                     {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
//                   </select>
//                 </div>
//                 <div className="vp-row2">
//                   <div className="vp-field">
//                     <label className="vp-lbl">Subcategory <span className="vp-lbl-sub">(optional)</span></label>
//                     <select className="vp-sel" name="subcategory" value={form.subcategory} onChange={handleChange} disabled={!subcategories.length}>
//                       <option value="">None</option>
//                       {subcategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
//                     </select>
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">Sub-Subcategory <span className="vp-lbl-sub">(optional)</span></label>
//                     <select className="vp-sel" name="subSubCategory" value={form.subSubCategory} onChange={handleChange} disabled={!subSubCats.length}>
//                       <option value="">None</option>
//                       {subSubCats.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 {/* ── PRICING ── */}
//                 <div className="vp-sec-head">Pricing &amp; Tax</div>
//                 <div style={{
//                   padding: "14px 16px", background: "linear-gradient(135deg,#f0f9ff,#eff6ff)",
//                   border: "1px solid #bfdbfe", borderRadius: 10, marginBottom: 14,
//                 }}>
//                   <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>
//                     💡 Price Formula: Base Price + Profit = Final Sale Price (GST &amp; CESS are included INSIDE the final price)
//                   </div>
//                   {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 28px 1fr", gap: 6, alignItems: "end" }}> */}
//                   <div
//   style={{
//     display: "grid",
//     gridTemplateColumns:
//       "1fr 28px 1fr 28px 1fr 28px 1fr",
//     gap: 6,
//     alignItems: "end",
//   }}
// >
//                     <div>
//                       <label className="vp-lbl" style={{ color: "#1d4ed8" }}>Base Price (₹) *</label>
//                       <input className="vp-inp" type="number" name="basePrice" placeholder="0.00" value={form.basePrice} onChange={handleChange} min="0" step="0.01" required
//                         style={{ borderColor: "#bfdbfe", background: "#eff6ff" }} />
//                     </div>
//                     <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "#93c5fd", paddingBottom: 4 }}>+</div>
//                     <div>
//                       <label className="vp-lbl" style={{ color: "#059669" }}>Profit (₹)</label>
//                       <input className="vp-inp" type="number" name="profit" placeholder="0.00" value={form.profit} onChange={handleChange} min="0" step="0.01"
//                         style={{ borderColor: "#6ee7b7", background: "#f0fdf4" }} />
//                     </div>
//                     <div>
                      
//   <label
//     className="vp-lbl"
//     style={{ color: "#dc2626" }}
//   >
//     MRP (₹)
//   </label>

//   <input
//     className="vp-inp"
//     type="number"
//     name="mrp"
//     placeholder="0.00"
//     value={form.mrp}
//     onChange={handleChange}
//     min="0"
//     step="0.01"
//     style={{
//       borderColor: "#fecaca",
//       background: "#fef2f2",
//     }}
//   />
// </div>
//                     <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "#93c5fd", paddingBottom: 4 }}>=</div>
//                     <div>
//                       <label className="vp-lbl" style={{ color: "#16a34a" }}>
//                         Final Sale Price
//                         <span style={{ marginLeft: 5, fontSize: 9, background: form._manualSale ? "#fef3c7" : "#dcfce7", color: form._manualSale ? "#92400e" : "#16a34a", padding: "1px 6px", borderRadius: 20, fontWeight: 700 }}>
//                           {form._manualSale ? "manual" : "auto"}
//                         </span>
//                       </label>
//                       <input className="vp-inp" type="number" name="salePrice" placeholder="Auto" value={form.salePrice} onChange={handleChange} min="0" step="0.01"
//                         style={{ borderColor: form._manualSale ? "#fde68a" : "#86efac", background: form._manualSale ? "#fffbeb" : "#f0fdf4", fontWeight: 700 }} />
//                     </div>
//                   </div>
//                   {form._manualSale && (
//                     <button type="button" onClick={() => setForm((p) => ({ ...p, _manualSale: false }))}
//                       style={{ marginTop: 8, fontSize: 11, padding: "3px 10px", borderRadius: 7, border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
//                       ↺ Reset to Auto
//                     </button>
//                   )}
//                 </div>

//                 <div className="vp-row3">
//                   <div className="vp-field">
//                     <label className="vp-lbl">GST %</label>
//                     <select className="vp-sel" name="gstPercent" value={form.gstPercent} onChange={handleChange}>
//                       <option value="">Select</option>
//                       <option value="0">0% (Exempt)</option>
//                       <option value="5">5%</option>
//                       <option value="12">12%</option>
//                       <option value="18">18%</option>
//                       <option value="28">28%</option>
//                     </select>
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">CESS % <span className="vp-lbl-sub">(Comp. Cess)</span></label>
//                     <input className="vp-inp cess-field" type="number" name="cessPercent" placeholder="0" value={form.cessPercent} onChange={handleChange} min="0" max="100" step="0.01" />
//                   </div>
//                   <div className="vp-field">
//                     <label className="vp-lbl">Tax Type</label>
//                     <select className="vp-sel" name="taxType" value={form.taxType} onChange={handleChange}>
//                       <option value="cgst_sgst">CGST + SGST</option>
//                       <option value="igst">IGST</option>
//                     </select>
//                   </div>
//                 </div>

//                 <GstBreakdownPanel basePrice={form.basePrice} profit={form.profit} gstPercent={form.gstPercent} cessPercent={form.cessPercent} taxType={form.taxType} />

//                 <div className="vp-field" style={{ marginTop: 12 }}>
//                   <label className="vp-lbl">HSN Code <span className="vp-lbl-sub">(auto-fills GST &amp; CESS)</span></label>
//                   <HsnPicker value={form.hsnCode} onSelect={handleHsnSelect} hsnCodes={hsnCodes} hsnCategories={hsnCategories} onAddNew={() => setShowAddHsn(true)} />
//                 </div>

//                 <div className="vp-field">
//                   <label className="vp-lbl">Valid Till</label>
//                   <input className="vp-inp" type="date" name="validTill" value={form.validTill} onChange={handleChange} />
//                 </div>

//                 {/* ── BULK DISCOUNT ── */}
//                 <div className="vp-sec-head">Bulk Discount Pricing</div>
//                 <BulkDiscountManager productId={editId} basePrice={form.basePrice} salePrice={form.salePrice} onTempChange={handleTempBulkChange} />

//                 {/* ── WEIGHT & UNIT CONVERSIONS ── */}
//                 <div className="vp-sec-head">Weight &amp; Unit Conversions</div>

//                 <div style={{
//                   padding: "14px 16px", border: "1px solid var(--border)",
//                   borderRadius: 10, background: "#fafbfd", marginBottom: 12,
//                 }}>
//                   <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--textMid)", marginBottom: 10 }}>
//                     📏 Weight / Quantity <span style={{ fontWeight: 400, color: "var(--textDim)" }}>(optional)</span>
//                   </div>
//                   <div className="vp-row2">
//                     <div className="vp-field" style={{ marginBottom: 0 }}>
//                       <label className="vp-lbl">Value</label>
//                       <input className="vp-inp" type="number" name="weightValue" placeholder="Leave empty if not applicable" value={form.weightValue} onChange={handleChange} min="0" />
//                     </div>
//                     <div className="vp-field" style={{ marginBottom: 0 }}>
//                       <label className="vp-lbl">Unit</label>
//                       <select className="vp-sel" name="weightUnit" value={form.weightUnit} onChange={handleChange}>
//                         <option value="kg">Kilogram (kg)</option>
//                         <option value="gm">Gram (gm)</option>
//                         <option value="ltr">Litre (ltr)</option>
//                         <option value="ml">Millilitre (ml)</option>
//                         <option value="pcs">Pieces (pcs)</option>
//                       </select>
//                     </div>
//                   </div>
//                   {form.weightValue && (
//                     <div style={{ marginTop: 8, fontSize: 11.5, color: "#16a34a", fontWeight: 600 }}>
//                       ✓ Weight set to: {form.weightValue} {form.weightUnit}
//                     </div>
//                   )}
//                 </div>

//                 {/* Unit Conversions — Label + N PCS, matching model schema */}
//                 <UnitConversionManager
//                   conversions={form.unitConversions}
//                   onChange={handleUnitConvChange}
//                 />

//                 {/* ── PACKAGING ── */}
//                 {/* <div className="vp-sec-head">Packaging Details</div>
//                 <div className="vp-row3">
//                   {[
//                     { label: "Box (per carton)", key: "box" },
//                     { label: "Packet per Box",   key: "packetPerBox" },
//                     { label: "Piece per Packet", key: "piecePerPacket" },
//                   ].map(({ label, key }) => (
//                     <div className="vp-field" key={key}>
//                       <label className="vp-lbl">{label}</label>
//                       <input className="vp-inp" type="number" placeholder="0"
//                         value={form.packaging?.[key] || 0}
//                         onChange={(e) => setForm((p) => ({ ...p, packaging: { ...p.packaging, [key]: Number(e.target.value) } }))} min="0" />
//                     </div>
//                   ))}
//                 </div> */}

//                 {/* ── IMAGES ── */}
//                 <div className="vp-sec-head">Images</div>
//                 <div className="img-section-box">
//                   <div className="img-section-label">
//                     <span style={{ padding: "2px 8px", background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Main Image</span>
//                   </div>
//                   <MainImageUploader key={`main-${uploaderKey}`} file={form.mainImageFile} existingUrl={form.existingMainImage} onChange={handleMainImageChange} />
//                 </div>
//                 <div className="img-section-box">
//                   <div className="img-section-label">
//                     <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Gallery Images</span>
//                     <span style={{ fontSize: 11, color: "var(--textDim)", fontWeight: 400 }}>Up to 4</span>
//                   </div>
//                   <GalleryUploader key={`gallery-${uploaderKey}`} galleryFiles={form.galleryFiles} existingGalleryImages={form.existingGalleryImages} onChange={handleGalleryChange} />
//                 </div>

//                 {/* ── DESCRIPTION ── */}
//                 <div className="vp-sec-head">Description</div>
//                 <div className="vp-field">
//                   <textarea className="vp-ta" name="description" placeholder="Brief product description (optional)..." value={form.description} onChange={handleChange} />
//                 </div>
//               </div>

//               <div className={`vp-drawer-foot${copyMode ? " copy-foot" : ""}`}>
//                 {copyMode
//                   ? <button type="submit" className="btn-copy" style={{ flex: 1, justifyContent: "center" }} disabled={submitting}>
//                       {submitting ? "Saving..." : "Save as New Product"}
//                     </button>
//                   : <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={submitting}>
//                       {submitting ? "Saving..." : editId ? "Update Product" : "Add Product"}
//                     </button>}
//                 <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showAddHsn && (
//         <AddHsnModal onClose={() => setShowAddHsn(false)} onSaved={handleHsnAdded} existingCategories={hsnCategories} />
//       )}

//       {deleteId && (
//         <div className="vp-modal-bg">
//           <div className="vp-modal">
//             <div className="vp-modal-ico">🗑️</div>
//             <h3>Delete this product?</h3>
//             <p>This action cannot be undone.</p>
//             <div className="vp-modal-row">
//               <button className="btn-danger" onClick={handleDelete}>Yes, Delete</button>
//               <button className="btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setDeleteId(null)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {toast && (
//         <div className={`vp-toast ${toast.type}`}>
//           <div className="toast-dot" />{toast.msg}
//         </div>
//       )}
//     </>
//   );
// }


import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const API_URL      = "https://foodhelpervendor.onrender.com/api/vendor/products";
const CATEGORY_URL = "https://grocerrybackend.onrender.com/api/categories";
const BRAND_API    = "https://foodhelpervendor.onrender.com/api/brands";
const HSN_API_URL  = `${API_URL}/hsn-codes`;
const BULK_API_URL = "https://foodhelpervendor.onrender.com/api/vendor/bulk-discounts";
const TOKEN_KEY    = "vendorToken";

const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const MAX_GALLERY = 4;
const DOZEN_SIZE  = 12;
const CARTON_SIZE = 100;

const GST_BADGE = {
  0:  { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  5:  { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  12: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
  18: { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
  28: { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
};

const EMPTY = {
  name: "", brand: "", category: "", subcategory: "", subSubCategory: "",
  description: "", basePrice: "", profit: "", salePrice: "", mrp: "",
  weightValue: "", weightUnit: "kg", status: "inactive",
  gstPercent: "", cessPercent: "0", hsnCode: "", taxType: "cgst_sgst",
  validTill: "",
  mainImageFile: null, existingMainImage: "",
  galleryFiles: [], existingGalleryImages: [],
  packaging: { box: 0, packetPerBox: 0, piecePerPacket: 0 },
  unitConversions: [],
  _manualSale: false,
};

const EMPTY_HSN_FORM = { code: "", description: "", category: "", gst: "0", cess: "0" };
const EMPTY_BULK     = { minQty: "", maxQty: "", profit: "", unitPrice: "", _manualUnit: false };

/* ══════════════════════════════════════════════════════════════
   GST CALCULATOR
══════════════════════════════════════════════════════════════ */
function calcGstBreakdown(base, profit, gstPercent, cessPercent, taxType) {
  const salePrice = (Number(base) || 0) + (Number(profit) || 0);
  const gst  = Number(gstPercent)  || 0;
  const cess = Number(cessPercent) || 0;
  const gstAmount      = (salePrice * gst)  / (100 + gst);
  const cessAmount     = (salePrice * cess) / (100 + cess);
  const totalTaxAmount = gstAmount + cessAmount;
  const priceExcludingGst = salePrice - totalTaxAmount;
  const isIgst = taxType === "igst";
  const r2 = (n) => Math.round(n * 100) / 100;
  return {
    salePrice: r2(salePrice),
    priceExcludingGst: r2(priceExcludingGst),
    gstAmount:      r2(gstAmount),
    cessAmount:     r2(cessAmount),
    totalTaxAmount: r2(totalTaxAmount),
    cgstPercent:    r2(isIgst ? 0 : gst / 2),
    sgstPercent:    r2(isIgst ? 0 : gst / 2),
    igstPercent:    r2(isIgst ? gst : 0),
    cgstAmount:     r2(isIgst ? 0 : gstAmount / 2),
    sgstAmount:     r2(isIgst ? 0 : gstAmount / 2),
    igstAmount:     r2(isIgst ? gstAmount : 0),
  };
}

function pcsToDisplay(totalPcs, conversions) {
  if (totalPcs == null || totalPcs === "") return "—";
  const n = Number(totalPcs);
  if (isNaN(n) || n <= 0) return `${n} pcs`;
  if (conversions && conversions.length > 0) {
    const sorted = [...conversions].sort((a, b) => b.nPcs - a.nPcs);
    let remaining = n;
    const parts = [];
    for (const conv of sorted) {
      const nPcs = Number(conv.nPcs);
      if (!nPcs || nPcs <= 0) continue;
      const count = Math.floor(remaining / nPcs);
      if (count > 0) { parts.push(`${count} ${conv.unit}`); remaining = remaining % nPcs; }
    }
    if (remaining > 0) parts.push(`${remaining} pcs`);
    return parts.length ? parts.join(" ") : `${n} pcs`;
  }
  const cartons = Math.floor(n / CARTON_SIZE);
  const rem1    = n % CARTON_SIZE;
  const dozens  = Math.floor(rem1 / DOZEN_SIZE);
  const singles = rem1 % DOZEN_SIZE;
  const parts   = [];
  if (cartons > 0) parts.push(`${cartons} Carton${cartons > 1 ? "s" : ""}`);
  if (dozens  > 0) parts.push(`${dozens} Dozen${dozens  > 1 ? "s" : ""}`);
  if (singles > 0) parts.push(`${singles} pcs`);
  return parts.length ? parts.join(" ") : `${n} pcs`;
}

function toPcs(qty, unit) {
  const n = Number(qty) || 0;
  if (unit === "dozen")  return n * DOZEN_SIZE;
  if (unit === "carton") return n * CARTON_SIZE;
  return n;
}

/* ══════════════════════════════════════════════════════════════
   BRAND PICKER
══════════════════════════════════════════════════════════════ */
function BrandPicker({ value, brands, onSelect, onBrandAdded }) {
  const [open, setOpen]             = useState(false);
  const [query, setQuery]           = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [newName, setNewName]       = useState("");
  const [newFile, setNewFile]       = useState(null);
  const [newPreview, setNewPreview] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [addError, setAddError]     = useState("");
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);
  const fileRef  = useRef(null);

  const selected = brands.find((b) => b._id === value) || null;
  const filtered = brands.filter((b) => !query || b.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pick  = (b) => { onSelect(b._id); setOpen(false); setQuery(""); };
  const clear = (e) => { e.stopPropagation(); onSelect(""); };

  const handleFileChange = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setNewFile(f); setNewPreview(URL.createObjectURL(f)); setAddError("");
  };

  const handleAddBrand = async () => {
    if (!newName.trim()) { setAddError("Brand name required"); return; }
    if (!newFile)        { setAddError("Brand image required"); return; }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name", newName.trim());
      fd.append("image", newFile);
      const res = await axiosAuth.post(BRAND_API, fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.success) {
        onBrandAdded(res.data.data);
        onSelect(res.data.data._id);
        setShowAdd(false); setNewName(""); setNewFile(null); setNewPreview(null); setAddError(""); setOpen(false);
      }
    } catch (err) {
      setAddError(err.response?.data?.message || "Brand save failed");
    } finally { setSaving(false); }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button"
          onClick={() => { setOpen((p) => !p); setTimeout(() => inputRef.current?.focus(), 60); }}
          style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            border: `1px solid ${open ? "#2563eb" : "#e5e7eb"}`,
            borderRadius: 8, padding: "9px 11px", background: "white", cursor: "pointer", textAlign: "left",
            boxShadow: open ? "0 0 0 3px rgba(37,99,235,.09)" : "none", transition: "all .2s",
          }}>
          {selected ? (
            <>
              {selected.image?.url && (
                <img src={selected.image.url} alt={selected.name} style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
              )}
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{selected.name}</span>
              <span onClick={clear} style={{ color: "#9ca3af", fontSize: 12, padding: "2px 4px", cursor: "pointer" }}>✕</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 16, opacity: .4 }}>🏷️</span>
              <span style={{ flex: 1, color: "#94a3b8", fontSize: 13 }}>Select brand...</span>
              <span style={{ color: "#94a3b8", fontSize: 11 }}>▾</span>
            </>
          )}
        </button>
        <button type="button"
          onClick={(e) => { e.stopPropagation(); setOpen(false); setShowAdd(true); setAddError(""); }}
          title="Add new brand"
          style={{
            width: 38, height: 38, borderRadius: 8, border: "1.5px dashed #2563eb",
            background: "#eff6ff", color: "#2563eb", fontSize: 20, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}>+</button>
      </div>

      {open && (
        <div style={{
          position: "absolute", zIndex: 200, top: "calc(100% + 6px)", left: 0, right: 0,
          minWidth: 280, background: "white", border: "1px solid #e5e7eb",
          borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,.14)", overflow: "hidden",
        }}>
          <div style={{ padding: "8px 10px 6px" }}>
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brand..."
              style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontFamily: "inherit", fontSize: 13, outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"} />
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "16px 12px", textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
                No brands found —{" "}
                <button type="button" onClick={() => { setOpen(false); setShowAdd(true); }}
                  style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Add new?</button>
              </div>
            ) : filtered.map((b) => (
              <button key={b._id} type="button" onClick={() => pick(b)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", border: "none", background: value === b._id ? "#eff6ff" : "transparent",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit", borderBottom: "1px solid #f3f4f6",
                }}>
                {b.image?.url && (
                  <img src={b.image.url} alt={b.name} style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover", border: "1px solid #e5e7eb" }} />
                )}
                <span style={{ fontSize: 13, fontWeight: value === b._id ? 700 : 500, color: value === b._id ? "#2563eb" : "#0f172a" }}>{b.name}</span>
                {value === b._id && <span style={{ marginLeft: "auto", color: "#2563eb", fontSize: 13 }}>✓</span>}
              </button>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6", padding: "8px 10px" }}>
            <button type="button" onClick={() => { setOpen(false); setShowAdd(true); setAddError(""); }}
              style={{
                width: "100%", padding: "7px 10px", background: "#eff6ff",
                border: "1.5px dashed #2563eb", borderRadius: 8, color: "#2563eb",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>+ Add New Brand</button>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
          backdropFilter: "blur(4px)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setShowAdd(false)}>
          <div style={{ background: "white", borderRadius: 14, padding: 28, width: 380, boxShadow: "0 24px 64px rgba(0,0,0,.18)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Add New Brand</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Name + logo image</div>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#64748b", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Brand Name *</label>
              <input value={newName} onChange={(e) => { setNewName(e.target.value); setAddError(""); }} placeholder="e.g. Amul, Tata, Nestle"
                style={{ width: "100%", padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "inherit", fontSize: 13, outline: "none" }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Brand Logo / Image *</label>
              <div onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${newPreview ? "#86efac" : "#d1d5db"}`, borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer", background: newPreview ? "#f0fdf4" : "#f9fafb" }}>
                {newPreview ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={newPreview} alt="preview" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "2px solid #86efac" }} />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>Image selected</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{newFile?.name}</div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setNewFile(null); setNewPreview(null); }}
                        style={{ marginTop: 4, fontSize: 10, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, opacity: .3, marginBottom: 6 }}>🖼️</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Click to upload logo</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>PNG, JPG, WebP</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { handleFileChange(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
            {addError && (
              <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#ef4444", fontSize: 12, marginBottom: 12 }}>{addError}</div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={handleAddBrand} disabled={saving}
                style={{ flex: 1, padding: "10px 0", background: saving ? "#93c5fd" : "#2563eb", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : "Save Brand"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)}
                style={{ flex: 1, padding: "10px 0", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 8, color: "#64748b", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   UNIT CONVERSION MANAGER
══════════════════════════════════════════════════════════════ */
function UnitConversionManager({ conversions, onChange }) {
  const [rows, setRows]       = useState(conversions || []);
  const [unit, setUnit]       = useState("");
  const [nPcs, setNPcs]       = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [error, setError]     = useState("");
  const [previewPcs, setPreviewPcs] = useState("137");

  useEffect(() => { onChange(rows); }, [rows]);

  const reset = () => { setUnit(""); setNPcs(""); setEditIdx(null); setError(""); };

  const handleAdd = () => {
    if (!unit.trim()) { setError("Label required"); return; }
    const n = Number(nPcs);
    if (!nPcs || isNaN(n) || n <= 0) { setError("N PCS must be a positive number"); return; }
    const entry = { unit: unit.trim(), nPcs: n };
    let updated;
    if (editIdx !== null) {
      updated = rows.map((r, i) => i === editIdx ? entry : r);
    } else {
      if (rows.some((r) => r.unit.toLowerCase() === entry.unit.toLowerCase())) { setError("This label already exists"); return; }
      updated = [...rows, entry];
    }
    setRows(updated); reset();
  };

  const handleEdit   = (idx) => { setUnit(rows[idx].unit); setNPcs(String(rows[idx].nPcs)); setEditIdx(idx); setError(""); };
  const handleDelete = (idx) => { const updated = rows.filter((_, i) => i !== idx); setRows(updated); if (editIdx === idx) reset(); };
  const liveBreakdown = previewPcs !== "" && rows.length > 0 ? pcsToDisplay(Number(previewPcs), rows) : "—";

  return (
    <div style={{ border: "1.5px solid #bae6fd", borderRadius: 12, overflow: "hidden", background: "#f8fbff", marginTop: 10 }}>
      <div style={{ padding: "10px 14px", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", borderBottom: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>📦</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: ".6px" }}>Unit Conversions</span>
        {rows.length > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 10, background: "#0369a1", color: "white", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>
            {rows.length} unit{rows.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 60px", padding: "6px 12px 2px", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px" }}>Label</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px" }}>= N PCS</span>
          <span></span>
        </div>
      )}
      {rows.length > 0 && (
        <div style={{ padding: "4px 12px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
          {rows.map((row, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 90px 60px", alignItems: "center", gap: 8, padding: "8px 12px", background: "white", border: "1px solid #bae6fd", borderRadius: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 800, background: "#0369a1", color: "white", padding: "1px 6px", borderRadius: 20, flexShrink: 0 }}>{row.unit}</span>
              </span>
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#0369a1" }}>{row.nPcs}</span>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button type="button" onClick={() => handleEdit(idx)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                <button type="button" onClick={() => handleDelete(idx)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: "10px 12px", borderTop: rows.length > 0 ? "1px solid #bae6fd" : "none" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".4px" }}>
          {editIdx !== null ? "✏️ Edit Unit" : "➕ Add Unit"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Label *</label>
            <input value={unit} onChange={(e) => { setUnit(e.target.value); setError(""); }} placeholder="e.g. Pcs, Dozen, Carton"
              style={{ width: "100%", padding: "7px 9px", border: "1px solid #bae6fd", borderRadius: 7, fontFamily: "inherit", fontSize: 12.5, outline: "none", background: "#f0f9ff" }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#bae6fd"} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>= N PCS *</label>
            <input type="number" min="1" step="1" value={nPcs} onChange={(e) => { setNPcs(e.target.value); setError(""); }} placeholder="e.g. 1, 12, 100"
              style={{ width: "100%", padding: "7px 9px", border: "1px solid #bae6fd", borderRadius: 7, fontFamily: "inherit", fontSize: 12.5, outline: "none", background: "#f0f9ff" }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#bae6fd"} />
          </div>
        </div>
        {unit && nPcs && (
          <div style={{ marginBottom: 8, padding: "6px 10px", background: "white", border: "1px solid #bae6fd", borderRadius: 7, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ fontSize: 10, color: "#64748b" }}>Preview:</span>
            <span style={{ fontFamily: "monospace", fontWeight: 700, background: "#0369a1", color: "white", padding: "1px 7px", borderRadius: 12 }}>{unit}</span>
            <span style={{ color: "#94a3b8" }}>=</span>
            <span style={{ color: "#0f172a", fontWeight: 500 }}>{nPcs} pcs</span>
          </div>
        )}
        {error && (
          <div style={{ padding: "6px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, color: "#ef4444", fontSize: 11.5, marginBottom: 8 }}>{error}</div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={handleAdd}
            style={{ padding: "6px 14px", background: "#2563eb", border: "none", borderRadius: 7, color: "white", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            {editIdx !== null ? "Update" : "Add"}
          </button>
          {editIdx !== null && (
            <button type="button" onClick={reset}
              style={{ padding: "6px 12px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 7, color: "#64748b", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
          )}
        </div>
      </div>
      {rows.length > 0 && (
        <div style={{ margin: "0 12px 12px", padding: "10px 12px", background: "white", border: "1px solid #bae6fd", borderRadius: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
            🧪 Packing Preview
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="number" min="0" value={previewPcs} onChange={(e) => setPreviewPcs(e.target.value)} placeholder="e.g. 137"
              style={{ width: 100, padding: "6px 9px", border: "1px solid #bae6fd", borderRadius: 7, fontFamily: "monospace", fontSize: 13, outline: "none", background: "#f0f9ff", fontWeight: 700 }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#bae6fd"} />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>→</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0369a1", background: "#e0f2fe", padding: "4px 10px", borderRadius: 7, border: "1px solid #bae6fd" }}>{liveBreakdown}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   UNIT QTY INPUT
══════════════════════════════════════════════════════════════ */
const UnitQtyInput = ({ rawValue, onChange, placeholder = "0" }) => {
  const [unit, setUnit]       = useState("pcs");
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (rawValue === "" || rawValue == null) { setDisplay(""); return; }
    const n = Number(rawValue);
    if (isNaN(n)) { setDisplay(""); return; }
    if (unit === "dozen")       setDisplay(String(n / DOZEN_SIZE));
    else if (unit === "carton") setDisplay(String(n / CARTON_SIZE));
    else                        setDisplay(String(n));
  }, [rawValue, unit]);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    const raw = Number(rawValue) || 0;
    if (newUnit === "dozen")       setDisplay(raw ? String(raw / DOZEN_SIZE)  : "");
    else if (newUnit === "carton") setDisplay(raw ? String(raw / CARTON_SIZE) : "");
    else                           setDisplay(raw ? String(raw)               : "");
  };

  const handleInput = (val) => {
    setDisplay(val);
    const n = Number(val);
    if (!isNaN(n) && val !== "") onChange(toPcs(n, unit));
    else if (val === "")         onChange("");
  };

  return (
    <div style={{ display: "flex", gap: 4, width: "100%" }}>
      <input type="number" min="0" step={unit === "pcs" ? "1" : "0.5"} value={display} onChange={(e) => handleInput(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, padding: "7px 8px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, fontFamily: "inherit", textAlign: "center", outline: "none" }}
        onFocus={(e) => e.target.style.borderColor = "#2563eb"}
        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"} />
      <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0 }}>
        {[{ key: "pcs", label: "pcs" }, { key: "dozen", label: "Dz" }, { key: "carton", label: "Ctn" }].map(({ key, label }) => (
          <button key={key} type="button" onClick={() => handleUnitChange(key)}
            style={{ padding: "4px 6px", fontSize: 10, fontWeight: 700, cursor: "pointer", borderRight: key !== "carton" ? "1px solid #e5e7eb" : "none", background: unit === key ? "#2563eb" : "white", color: unit === key ? "white" : "#6b7280", border: "none", fontFamily: "inherit", transition: "all .15s" }}>{label}</button>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   LIVE GST BREAKDOWN PANEL
══════════════════════════════════════════════════════════════ */
function GstBreakdownPanel({ basePrice, profit, gstPercent, cessPercent, taxType }) {
  const base = Number(basePrice) || 0;
  const pl   = Number(profit)    || 0;
  const gst  = Number(gstPercent) || 0;
  const cess = Number(cessPercent) || 0;
  if (base === 0 && pl === 0) return null;

  const bd     = calcGstBreakdown(base, pl, gst, cess, taxType || "cgst_sgst");
  const isIgst = (taxType || "cgst_sgst") === "igst";

  const Row = ({ label, val, bg, border, labelColor, valColor, badge, badgeBg, badgeColor, bold }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: bg, border: `1px solid ${border}`, borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 5, background: badgeBg, color: badgeColor }}>{badge}</span>}
        <span style={{ fontSize: 12, color: labelColor, fontWeight: bold ? 700 : 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: bold ? 800 : 700, color: valColor, fontFamily: "monospace" }}>{val}</span>
    </div>
  );

  return (
    <div style={{ marginTop: 12, borderRadius: 12, border: "1px solid #c7d2fe", background: "linear-gradient(135deg,#eef2ff,#f0f9ff)", overflow: "hidden" }}>
      <div style={{ padding: "9px 14px", background: "rgba(99,102,241,.08)", borderBottom: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13 }}>🧾</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#4338ca", textTransform: "uppercase", letterSpacing: ".6px" }}>Live Tax Breakdown</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#6366f1", background: "white", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{isIgst ? "IGST" : "CGST+SGST"}</span>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <Row label="Final Sale Price (Base + Profit, all taxes inside)" val={`₹${bd.salePrice.toFixed(2)}`} bg="#16a34a" border="#bbf7d0" labelColor="white" valColor="white" bold />
        <Row label="Taxable Value (excl. tax)" val={`₹${bd.priceExcludingGst.toFixed(2)}`} bg="white" border="#e0e7ff" labelColor="#374151" valColor="#111827" />
        {isIgst ? (
          <Row label={`IGST ${bd.igstPercent}% (included inside)`} val={`₹${bd.igstAmount.toFixed(2)}`} bg="#fff7ed" border="#fed7aa" labelColor="#c2410c" valColor="#c2410c" badge="IGST" badgeBg="#ffedd5" badgeColor="#ea580c" />
        ) : (
          <>
            <Row label={`CGST ${bd.cgstPercent}% (included inside)`} val={`₹${bd.cgstAmount.toFixed(2)}`} bg="#eff6ff" border="#bfdbfe" labelColor="#1d4ed8" valColor="#1d4ed8" badge="CGST" badgeBg="#dbeafe" badgeColor="#2563eb" />
            <Row label={`SGST ${bd.sgstPercent}% (included inside)`} val={`₹${bd.sgstAmount.toFixed(2)}`} bg="#eff6ff" border="#bfdbfe" labelColor="#1d4ed8" valColor="#1d4ed8" badge="SGST" badgeBg="#dbeafe" badgeColor="#2563eb" />
          </>
        )}
        {cess > 0 && (
          <Row label={`CESS ${cess}% (included inside)`} val={`₹${bd.cessAmount.toFixed(2)}`} bg="#faf5ff" border="#ddd6fe" labelColor="#7c3aed" valColor="#7c3aed" badge="CESS" badgeBg="#ede9fe" badgeColor="#7c3aed" />
        )}
        <div style={{ borderTop: "1px solid #c7d2fe", marginTop: 2 }} />
        <Row label="Total Tax (inside sale price)" val={`₹${bd.totalTaxAmount.toFixed(2)}`} bg="#fffbeb" border="#fde68a" labelColor="#92400e" valColor="#92400e" bold />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BULK DISCOUNT MANAGER
══════════════════════════════════════════════════════════════ */
function BulkDiscountManager({ productId, basePrice, salePrice, onTempChange }) {
  const [rules, setRules]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [form, setForm]             = useState(EMPTY_BULK);
  const [ruleEditId, setEditId]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [deleteConf, setDeleteConf] = useState(null);

  const isTempMode = !productId || productId === "new";
  const baseNum    = Number(basePrice) || 0;

  useEffect(() => {
    if (!form._manualUnit && form.profit !== "" && baseNum > 0)
      setForm((p) => ({ ...p, unitPrice: String(baseNum + (Number(p.profit) || 0)) }));
  }, [form.profit, baseNum]);

  const loadRules = useCallback(async () => {
    if (!productId) return;
    try { setLoading(true); const res = await axiosAuth.get(`${BULK_API_URL}/product/${productId}`); setRules((res.data?.data || []).sort((a, b) => a.minQty - b.minQty)); }
    catch { setRules([]); } finally { setLoading(false); }
  }, [productId]);

  useEffect(() => { if (productId) loadRules(); }, [productId, loadRules]);

  const resetForm = () => { setForm(EMPTY_BULK); setEditId(null); setShowForm(false); setError(""); };

  const formatRange = (min, max) =>
    (!max || Number(max) === Number(min)) ? pcsToDisplay(min) + "+" : `${pcsToDisplay(min)} – ${pcsToDisplay(max)}`;

  const isDuplicate = (minQ, maxQ, excludeId = null) =>
    rules.some((r) => {
      const rId = isTempMode ? r._tempId : r._id;
      if (excludeId && rId === excludeId) return false;
      return Number(r.minQty) === minQ && (r.maxQty != null ? Number(r.maxQty) : null) === maxQ;
    });

  const handleEdit = (rule) => {
    const profitVal = rule.profit != null ? String(rule.profit) : String(rule.unitPrice - baseNum);
    setEditId(isTempMode ? rule._tempId : rule._id);
    setForm({ minQty: rule.minQty, maxQty: rule.maxQty ?? "", profit: profitVal, unitPrice: String(rule.unitPrice), _manualUnit: false });
    setShowForm(true); setError("");
  };

  const handleSubmit = async () => {
    if (!form.minQty || !form.unitPrice) { setError("Min Qty and Unit Price required"); return; }
    const minQ    = Number(form.minQty);
    const maxQ    = form.maxQty !== "" && form.maxQty != null ? Number(form.maxQty) : null;
    const unitP   = Number(form.unitPrice);
    const profitN = form.profit !== "" ? Number(form.profit) : unitP - baseNum;
    if (minQ < 1)                          { setError("Min Qty >= 1"); return; }
    if (maxQ !== null && maxQ < minQ)      { setError("Max Qty < Min Qty"); return; }
    if (unitP <= 0)                        { setError("Unit Price must be > 0"); return; }
    if (isDuplicate(minQ, maxQ, ruleEditId)) { setError("This range already exists"); return; }
    const payload = { minQty: minQ, maxQty: maxQ, unitPrice: unitP, profit: profitN };
    if (isTempMode) {
      const updated = ruleEditId
        ? rules.map((r) => (r._tempId === ruleEditId ? { ...r, ...payload } : r))
        : [...rules, { ...payload, _tempId: `tmp_${Date.now()}` }];
      setRules(updated);
      if (onTempChange) onTempChange([...updated]);
      resetForm(); return;
    }
    try {
      setSaving(true);
      if (ruleEditId) await axiosAuth.put(`${BULK_API_URL}/${ruleEditId}`, payload);
      else await axiosAuth.post(`${BULK_API_URL}/add`, { ...payload, product: productId });
      await loadRules(); resetForm();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="bd-wrap">
      <div className="bd-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="bd-header-icon">📊</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Bulk Discount Rules</div>
            <div style={{ fontSize: 11, color: "var(--textMid)", marginTop: 1 }}>{isTempMode ? "Saved when product is created" : `${rules.length} tier(s)`}</div>
          </div>
        </div>
        {!showForm && <button type="button" className="bd-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>+ Add Tier</button>}
      </div>
      {showForm && (
        <div className="bd-form-wrap">
          <div className="bd-form-title">{ruleEditId ? "✏️ Edit Tier" : "➕ New Tier"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label className="bd-lbl">Min Qty *</label>
              <UnitQtyInput rawValue={form.minQty} onChange={(v) => { setForm((p) => ({ ...p, minQty: v === "" ? "" : String(v) })); setError(""); }} placeholder="1" />
            </div>
            <div>
              <label className="bd-lbl">Max Qty <span style={{ fontSize: 9, color: "#6b7280" }}>(optional)</span></label>
              <UnitQtyInput rawValue={form.maxQty} onChange={(v) => { setForm((p) => ({ ...p, maxQty: v === "" ? "" : String(v) })); setError(""); }} placeholder="∞" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 28px 1fr", gap: 6, alignItems: "end", marginBottom: 10 }}>
            <div>
              <label className="bd-lbl">Base Price</label>
              <div style={{ padding: "8px 10px", background: "#e0f2fe", border: "1.5px solid #7dd3fc", borderRadius: 7, fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#0c4a6e" }}>₹{baseNum || "—"}</div>
            </div>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#7dd3fc", paddingBottom: 6 }}>+</div>
            <div>
              <label className="bd-lbl">Profit (₹) *</label>
              <input className="bd-inp" type="number" placeholder="e.g. 20" value={form.profit}
                onChange={(e) => { setForm((p) => ({ ...p, profit: e.target.value, _manualUnit: false, unitPrice: baseNum > 0 && e.target.value !== "" ? String(baseNum + (Number(e.target.value) || 0)) : p.unitPrice })); setError(""); }} min="0" step="0.01" />
            </div>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#7dd3fc", paddingBottom: 6 }}>=</div>
            <div>
              <label className="bd-lbl">Unit Price (₹)</label>
              <input className="bd-inp" type="number" placeholder="Final price" value={form.unitPrice}
                onChange={(e) => { const v = e.target.value; const pCalc = baseNum > 0 && !isNaN(Number(v)) ? String((Number(v) - baseNum).toFixed(2)) : ""; setForm((p) => ({ ...p, unitPrice: v, profit: pCalc, _manualUnit: true })); setError(""); }} min="0" step="0.01" style={{ fontWeight: 700, color: "#1d4ed8" }} />
            </div>
          </div>
          {error && <div className="bd-error">⚠ {error}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="button" className="bd-save-btn" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : ruleEditId ? "Update" : "Save Tier"}</button>
            <button type="button" className="bd-cancel-btn" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}
      {loading ? (
        <div style={{ padding: 12 }}><div className="bd-skeleton" /></div>
      ) : rules.length === 0 ? (
        !showForm && <div className="bd-empty"><div className="bd-empty-icon">📊</div><div style={{ fontSize: 12, color: "var(--textDim)", marginTop: 6 }}>No tiers yet</div></div>
      ) : (
        <div className="bd-rules-list">
          {[...rules].sort((a, b) => a.minQty - b.minQty).map((rule, idx) => {
            const base  = Number(salePrice || basePrice) || 0;
            const pct   = base > 0 && rule.unitPrice < base ? Math.round(((base - rule.unitPrice) / base) * 100) : 0;
            const key   = isTempMode ? rule._tempId : rule._id;
            return (
              <div key={key || idx} className="bd-rule-card">
                <div className="bd-rule-tier-badge">T{idx + 1}</div>
                <div className="bd-rule-main">
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{formatRange(rule.minQty, rule.maxQty)}</span>
                  <span style={{ color: "#d1d5db" }}>→</span>
                  <span className="bd-unit-price">₹{rule.unitPrice}</span>
                  <span className="bd-per-unit">/unit</span>
                  {pct > 0 && <span className="bd-savings-tag">-{pct}%</span>}
                </div>
                <div className="bd-rule-actions">
                  <button type="button" className="bd-edit-btn" onClick={() => handleEdit(rule)}>✏️</button>
                  <button type="button" className="bd-del-btn" onClick={() => setDeleteConf(rule)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {deleteConf && (
        <div className="bd-del-overlay" onClick={() => setDeleteConf(null)}>
          <div className="bd-del-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Delete this tier?</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={async () => {
                if (isTempMode) { const u = rules.filter((r) => r._tempId !== deleteConf._tempId); setRules([...u]); if (onTempChange) onTempChange([...u]); }
                else { try { await axiosAuth.delete(`${BULK_API_URL}/${deleteConf._id}`); await loadRules(); } catch {} }
                setDeleteConf(null);
              }} style={{ flex: 1, padding: "8px 0", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Delete</button>
              <button type="button" onClick={() => setDeleteConf(null)} style={{ flex: 1, padding: "8px 0", background: "transparent", color: "#64748b", border: "1px solid #e5e7eb", borderRadius: 8, fontWeight: 500, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HSN PICKER
══════════════════════════════════════════════════════════════ */
function HsnPicker({ value, onSelect, hsnCodes, hsnCategories, onAddNew }) {
  const [open, setOpen]           = useState(false);
  const [query, setQuery]         = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [highlighted, setHigh]    = useState(0);
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const selected = hsnCodes.find((h) => h.code === value) ?? null;
  const filtered = hsnCodes.filter((h) => {
    const q = query.toLowerCase();
    return (!q || h.code.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) || h.category.toLowerCase().includes(q))
      && (!catFilter || h.category === catFilter);
  });

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => setHigh(0), [query, catFilter]);

  const pick  = (hsn) => { onSelect(hsn); setOpen(false); setQuery(""); };
  const clear = (e)   => { e.stopPropagation(); onSelect(null); setQuery(""); };

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHigh((p) => Math.min(p + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHigh((p) => Math.max(p - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); if (filtered[highlighted]) pick(filtered[highlighted]); }
    if (e.key === "Escape")    setOpen(false);
  };

  const badge = selected ? (GST_BADGE[selected.gst] ?? GST_BADGE[0]) : null;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" onKeyDown={handleKeyDown}
          onClick={() => { setOpen((p) => !p); setTimeout(() => inputRef.current?.focus(), 60); }}
          className={`hsn-btn${open ? " hsn-btn-open" : ""}`} style={{ flex: 1 }}>
          🏷️
          {selected ? (
            <>
              <span className="hsn-code">{selected.code}</span>
              <span className="hsn-desc">{selected.description}</span>
              <span className="gst-badge" style={{ background: badge.bg, color: badge.text }}>
                <span style={{ background: badge.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />GST {selected.gst}%
              </span>
              {(selected.cess ?? 0) > 0 && (
                <span className="gst-badge" style={{ background: "#f5f3ff", color: "#7c3aed", marginLeft: 4 }}>
                  <span style={{ background: "#7c3aed", width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />CESS {selected.cess}%
                </span>
              )}
              <span onClick={clear} className="hsn-clear">✕</span>
            </>
          ) : (
            <><span className="hsn-placeholder">Search HSN code...</span><span style={{ marginLeft: "auto", color: "var(--textDim)", fontSize: 12 }}>▾</span></>
          )}
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); onAddNew(); }} title="Add new HSN"
          style={{ width: 38, height: 38, borderRadius: 8, border: "1.5px dashed var(--blue)", background: "var(--blueFade)", color: "var(--blue)", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>+</button>
      </div>
      {open && (
        <div className="hsn-dropdown">
          <div style={{ padding: "10px 10px 6px" }}>
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type code or name..." className="hsn-search" />
          </div>
          {hsnCategories.length > 0 && (
            <div className="hsn-cat-bar">
              <button className={`hsn-cat-pill${!catFilter ? " hsn-cat-pill-active" : ""}`} onClick={() => setCatFilter("")}>All</button>
              {hsnCategories.map((cat) => (
                <button key={cat} className={`hsn-cat-pill${catFilter === cat ? " hsn-cat-pill-active" : ""}`} onClick={() => setCatFilter(catFilter === cat ? "" : cat)}>{cat}</button>
              ))}
            </div>
          )}
          <div ref={listRef} className="hsn-list">
            {filtered.length === 0 ? (
              <div className="hsn-empty">No results — <button type="button" style={{ color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => { setOpen(false); onAddNew(); }}>Add new?</button></div>
            ) : filtered.map((hsn, idx) => {
              const b = GST_BADGE[hsn.gst] ?? GST_BADGE[0];
              return (
                <button key={hsn.code} data-idx={idx} type="button" onClick={() => pick(hsn)} onMouseEnter={() => setHigh(idx)}
                  className={`hsn-item${value === hsn.code ? " hsn-item-selected" : highlighted === idx ? " hsn-item-high" : ""}`}>
                  <span className={`hsn-item-code${value === hsn.code ? " hsn-item-code-sel" : ""}`}>{hsn.code}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="hsn-item-desc">{hsn.description}</div>
                    <div className="hsn-item-cat">{hsn.category}</div>
                  </div>
                  <span className="gst-badge" style={{ background: b.bg, color: b.text }}>
                    <span style={{ background: b.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />{hsn.gst}%
                  </span>
                </button>
              );
            })}
          </div>
          <div className="hsn-footer">{filtered.length} result{filtered.length !== 1 ? "s" : ""} · ↑↓ navigate · Enter select</div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADD HSN MODAL
══════════════════════════════════════════════════════════════ */
function AddHsnModal({ onClose, onSaved, existingCategories }) {
  const [form, setForm]     = useState(EMPTY_HSN_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [newCat, setNewCat] = useState(false);

  const handleChange = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.description || !form.category) { setError("Fill all required fields."); return; }
    try {
      setSaving(true);
      const res = await axiosAuth.post(HSN_API_URL, { code: form.code.trim(), description: form.description.trim(), category: form.category.trim(), gst: Number(form.gst), cess: Number(form.cess) || 0 });
      onSaved(res.data.data); onClose();
    } catch (err) { setError(err.response?.data?.message || "HSN save failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="vp-modal-bg" onClick={onClose}>
      <div className="vp-modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div><div style={{ fontSize: 16, fontWeight: 700 }}>New HSN Code</div><div style={{ fontSize: 12, color: "var(--textMid)", marginTop: 2 }}>GST Tariff Code</div></div>
          <button className="vp-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="vp-field"><label className="vp-lbl">HSN Code *</label><input className="vp-inp" name="code" placeholder="e.g. 0401" value={form.code} onChange={handleChange} style={{ fontFamily: "monospace", fontWeight: 700 }} /></div>
          <div className="vp-field">
            <label className="vp-lbl">Category *</label>
            {!newCat ? (
              <div style={{ display: "flex", gap: 8 }}>
                <select className="vp-sel" name="category" value={form.category} onChange={handleChange} style={{ flex: 1 }}>
                  <option value="">Select</option>
                  {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => { setNewCat(true); setForm((p) => ({ ...p, category: "" })); }} style={{ padding: "0 12px", border: "1px solid var(--blue)", borderRadius: 8, background: "var(--blueFade)", color: "var(--blue)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ New</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input className="vp-inp" name="category" placeholder="New category" value={form.category} onChange={handleChange} style={{ flex: 1 }} />
                <button type="button" onClick={() => setNewCat(false)} style={{ padding: "0 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--textMid)", fontSize: 12, cursor: "pointer" }}>List</button>
              </div>
            )}
          </div>
          <div className="vp-row2" style={{ marginBottom: 12 }}>
            <div className="vp-field">
              <label className="vp-lbl">GST Rate *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                {[0, 5, 12, 18, 28].map((rate) => {
                  const b = GST_BADGE[rate]; const sel = form.gst === String(rate);
                  return (
                    <button key={rate} type="button" onClick={() => setForm((p) => ({ ...p, gst: String(rate) }))}
                      style={{ padding: "7px 4px", borderRadius: 7, border: `2px solid ${sel ? b.dot : "var(--border)"}`, background: sel ? b.bg : "white", color: sel ? b.text : "var(--textMid)", fontWeight: sel ? 700 : 500, fontSize: 13, cursor: "pointer" }}>
                      {rate}%
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="vp-field">
              <label className="vp-lbl">CESS %</label>
              <input className="vp-inp" type="number" name="cess" placeholder="0" value={form.cess} onChange={handleChange} min="0" max="100" step="0.01" />
            </div>
          </div>
          <div className="vp-field"><label className="vp-lbl">Description *</label><textarea className="vp-ta" name="description" placeholder="e.g. Milk & Cream…" value={form.description} onChange={handleChange} style={{ minHeight: 70 }} /></div>
          {error && <div style={{ padding: "8px 12px", background: "var(--redFade)", border: "1px solid #fecaca", borderRadius: 8, color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving}>{saving ? "Saving..." : "Save HSN"}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   INLINE PRICE EDITOR
══════════════════════════════════════════════════════════════ */
function InlinePrice({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);
  const inputRef              = useRef(null);
  const commit = () => { const n = Number(val); if (!isNaN(n) && n >= 0) onSave(n); setEditing(false); };
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
  useEffect(() => setVal(value), [value]);
  if (editing) return (
    <input ref={inputRef} type="number" value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      style={{ width: 80, padding: "4px 8px", border: "2px solid var(--blue)", borderRadius: 7, fontFamily: "inherit", fontSize: 13, fontWeight: 700, outline: "none", background: "#eff6ff" }} />
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} onClick={() => setEditing(true)} title="Click to edit">
      <span style={{ color: "var(--textMid)", fontWeight: 500 }}>₹{value}</span>
      <span style={{ fontSize: 10, color: "var(--blue)", background: "var(--blueFade)", border: "1px solid #bfdbfe", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>✏</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   IMAGE UPLOADERS
══════════════════════════════════════════════════════════════ */
function MainImageUploader({ file, existingUrl, onChange }) {
  const [preview, setPreview]   = useState(existingUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const handleFile   = (f) => { if (!f || !f.type.startsWith("image/")) return; setPreview(URL.createObjectURL(f)); onChange({ file: f, existingUrl: "" }); };
  const handleRemove = () => { setPreview(null); onChange({ file: null, existingUrl: "" }); };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
        onClick={() => !preview && inputRef.current?.click()}
        style={{
          position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden",
          border: `2px ${preview ? "solid" : "dashed"} ${dragOver ? "#2563eb" : preview ? "#bfdbfe" : "#d1d5db"}`,
          background: preview ? "#000" : "#f9fafb", cursor: preview ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        {preview ? (
          <>
            <img src={preview} alt="Main" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <span style={{ position: "absolute", top: 8, left: 8, background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>MAIN</span>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0, transition: "opacity .2s" }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(245,158,11,.9)", border: "none", cursor: "pointer", fontWeight: 600, color: "white" }}>Replace</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(); }} style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(239,68,68,.9)", border: "none", cursor: "pointer", fontWeight: 600, color: "white" }}>Remove</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: .25 }}>🖼️</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--textMid)" }}>Click or drag image here</div>
            <div style={{ fontSize: 11, color: "var(--textDim)", marginTop: 4 }}>JPEG, PNG, WebP</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

function GalleryUploader({ galleryFiles, existingGalleryImages, onChange }) {
  const idCounter = useRef(0);
  const genId = () => `g_${++idCounter.current}`;
  const initSlots = useCallback(() => [
    ...(existingGalleryImages || []).map((url) => ({ id: genId(), type: "existing", url, previewUrl: url })),
    ...(galleryFiles || []).map((file) => ({ id: genId(), type: "new", file, previewUrl: URL.createObjectURL(file) })),
  ], []);
  const [slots, setSlots]       = useState(initSlots);
  const [dragOver, setDragOver] = useState(false);
  const replaceRefs = useRef({});
  const addInputRef = useRef(null);
  const propagate = useCallback((updated) => {
    onChange(updated.filter((s) => s.type === "new").map((s) => s.file), updated.filter((s) => s.type === "existing").map((s) => s.url));
  }, [onChange]);
  const remaining = MAX_GALLERY - slots.length;
  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, remaining));
    if (!valid.length) return;
    const updated = [...slots, ...valid.map((file) => ({ id: genId(), type: "new", file, previewUrl: URL.createObjectURL(file) }))];
    setSlots(updated); propagate(updated);
  };
  const removeSlot  = (id) => { const u = slots.filter((s) => s.id !== id); setSlots(u); propagate(u); };
  const replaceSlot = (id, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const u = slots.map((s) => s.id !== id ? s : { id: s.id, type: "new", file, previewUrl: URL.createObjectURL(file) });
    setSlots(u); propagate(u);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {slots.map((slot) => (
          <div key={slot.id} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 10, border: `2px solid ${slot.type === "existing" ? "#bfdbfe" : "#86efac"}`, background: "#f9fafb", overflow: "visible" }}>
            <button type="button" onClick={() => removeSlot(slot.id)} style={{ position: "absolute", top: -9, right: -9, zIndex: 30, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 10, fontWeight: 700 }}>✕</button>
            <div style={{ position: "absolute", inset: 0, borderRadius: 8, overflow: "hidden" }}>
              <img src={slot.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .2s" }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                <button type="button" onClick={() => replaceRefs.current[slot.id]?.click()} style={{ padding: 6, borderRadius: 8, background: "rgba(245,158,11,.85)", border: "none", cursor: "pointer" }}>🔄</button>
              </div>
            </div>
            <input ref={(el) => { replaceRefs.current[slot.id] = el; }} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { replaceSlot(slot.id, e.target.files?.[0]); e.target.value = ""; }} />
          </div>
        ))}
        {Array.from({ length: Math.max(0, MAX_GALLERY - slots.length) }).map((_, idx) => (
          <div key={`empty-${idx}`}
            onClick={() => remaining > 0 && addInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            style={{ aspectRatio: "1/1", borderRadius: 10, border: `2px dashed ${dragOver && idx === 0 ? "#2563eb" : "#d1d5db"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f9fafb" }}>
            <div style={{ fontSize: 18, color: "#d1d5db" }}>+</div>
          </div>
        ))}
      </div>
      <button type="button" disabled={remaining === 0} onClick={() => remaining > 0 && addInputRef.current?.click()}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${remaining === 0 ? "#e5e7eb" : "#bfdbfe"}`, background: remaining === 0 ? "#f9fafb" : "#eff6ff", color: remaining === 0 ? "#9ca3af" : "#2563eb", cursor: remaining === 0 ? "not-allowed" : "pointer", width: "fit-content" }}>
        {remaining === 0 ? "Max 4 reached" : `Add images (${remaining} left)`}
      </button>
      <input ref={addInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT IMAGE CELL
══════════════════════════════════════════════════════════════ */
function ProductImageCell({ image, galleryImages, name }) {
  const [lightbox, setLightbox] = useState(null);
  const [lbIdx, setLbIdx]       = useState(0);
  const gallery = galleryImages || [];
  const allImgs = [image, ...gallery].filter(Boolean);
  const prev = () => { const i = (lbIdx - 1 + allImgs.length) % allImgs.length; setLbIdx(i); setLightbox(allImgs[i]); };
  const next = () => { const i = (lbIdx + 1) % allImgs.length; setLbIdx(i); setLightbox(allImgs[i]); };
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {image
          ? <button type="button" onClick={() => { setLbIdx(0); setLightbox(image); }} style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", border: "2px solid #2563eb", cursor: "pointer", padding: 0 }}>
              <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          : <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛒</div>
        }
        {gallery.slice(0, 3).map((url, idx) => (
          <button key={idx} type="button" onClick={() => { setLbIdx(idx + 1); setLightbox(url); }}
            style={{ width: 36, height: 36, borderRadius: 7, overflow: "hidden", border: "2px solid #86efac", cursor: "pointer", marginLeft: -4, padding: 0 }}>
            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
      </div>
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setLightbox(null)}>
          <div style={{ position: "relative", maxWidth: 520, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <img src={lightbox} alt="" style={{ width: "100%", borderRadius: 14, objectFit: "contain", maxHeight: "70vh" }} />
            {allImgs.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: "absolute", top: "50%", left: -44, transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", color: "white", fontSize: 18 }}>‹</button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: "absolute", top: "50%", right: -44, transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", color: "white", fontSize: 18 }}>›</button>
              </>
            )}
            <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: -14, right: -14, background: "white", borderRadius: "50%", border: "none", width: 30, height: 30, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   BULK PRICE RANGE CELL
══════════════════════════════════════════════════════════════ */
function BulkPriceRangeCell({ productId, basePrice, salePrice, allBulkRules }) {
  const [expanded, setExpanded] = useState(false);
  const rules = (allBulkRules || []).filter((d) => String(d.productId) === String(productId)).sort((a, b) => a.minQty - b.minQty);
  if (!rules.length) return <span style={{ fontSize: 11.5, color: "var(--textDim)", fontStyle: "italic" }}>—</span>;
  const base     = Number(salePrice || basePrice) || 0;
  const minPrice = Math.min(...rules.map((r) => r.unitPrice));
  const maxSaving = base > 0 ? Math.round(((base - minPrice) / base) * 100) : 0;
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setExpanded((p) => !p)} className="bpr-trigger">
        <span>📊</span><span className="bpr-label">{rules.length} tier{rules.length > 1 ? "s" : ""}</span>
        {maxSaving > 0 && <span className="bpr-saving">-{maxSaving}%</span>}
        <span style={{ color: "var(--textDim)", fontSize: 10 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setExpanded(false)} />
          <div className="bpr-popup">
            <div className="bpr-popup-title">📊 Bulk Tiers<button type="button" onClick={() => setExpanded(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--textDim)", fontSize: 14, marginLeft: "auto" }}>✕</button></div>
            {rules.map((rule, idx) => (
              <div key={rule._id || idx} className="bpr-row">
                <div className="bpr-tier-num">T{idx + 1}</div>
                <div className="bpr-qty-range">{(!rule.maxQty || Number(rule.maxQty) === Number(rule.minQty)) ? pcsToDisplay(rule.minQty) + "+" : `${pcsToDisplay(rule.minQty)} – ${pcsToDisplay(rule.maxQty)}`}</div>
                <div className="bpr-arrow">→</div>
                <div className="bpr-price">₹{rule.unitPrice}<span style={{ fontSize: 10, color: "var(--textDim)" }}>/u</span></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function VendorProducts() {
  const [products,          setProducts]          = useState([]);
  const [categories,        setCategories]        = useState([]);
  const [brands,            setBrands]            = useState([]);
  const [subcategories,     setsubcategories]     = useState([]);
  const [subSubCats,        setSubSubCats]        = useState([]);
  const [hsnCodes,          setHsnCodes]          = useState([]);
  const [hsnCategories,     setHsnCategories]     = useState([]);
  const [allBulkRules,      setAllBulkRules]      = useState([]);
  const [search,            setSearch]            = useState("");
  const [loading,           setLoading]           = useState(false);
  const [submitting,        setSubmitting]        = useState(false);
  const [form,              setForm]              = useState(EMPTY);
  const [editId,            setEditId]            = useState(null);
  const [copyMode,          setCopyMode]          = useState(false);
  const [drawer,            setDrawer]            = useState(false);
  const [uploaderKey,       setUploaderKey]       = useState("new");
  const [toast,             setToast]             = useState(null);
  const [deleteId,          setDeleteId]          = useState(null);
  const [page,              setPage]              = useState(1);
  const [selectedItems,     setSelectedItems]     = useState([]);
  const [bulkMode,          setBulkMode]          = useState(false);
  const [filterCategory,    setFilterCategory]    = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");
  const [filterSubSubCat,   setFilterSubSubCat]   = useState("");
  const [filterSubs,        setFilterSubs]        = useState([]);
  const [filterSubSubs,     setFilterSubSubs]     = useState([]);
  const [filterStatus,      setFilterStatus]      = useState("");
  const [showAddHsn,        setShowAddHsn]        = useState(false);
  const [tempBulkRules,     setTempBulkRules]     = useState([]);
  const tempBulkRulesRef = useRef([]);
  const limit = 25;

  useEffect(() => { fetchCategories(); fetchProducts(); fetchHsnCodes(); fetchAllBulkRules(); fetchBrands(); }, []);

  useEffect(() => {
    if (!form.category) { setsubcategories([]); setSubSubCats([]); return; }
    const cat = categories.find((c) => c._id === form.category);
    setsubcategories(cat?.subcategories || []);
    setSubSubCats([]);
    setForm((p) => ({ ...p, subcategory: "", subSubCategory: "" }));
  }, [form.category]);

  useEffect(() => {
    if (!form.subcategory) { setSubSubCats([]); return; }
    const cat = categories.find((c) => c._id === form.category);
    const sub = cat?.subcategories?.find((s) => s._id === form.subcategory);
    setSubSubCats(sub?.subSubcategories || []);
    setForm((p) => ({ ...p, subSubCategory: "" }));
  }, [form.subcategory]);

  useEffect(() => {
    if (!filterCategory) { setFilterSubs([]); setFilterSubSubs([]); setFilterSubcategory(""); setFilterSubSubCat(""); return; }
    const cat = categories.find((c) => c._id === filterCategory);
    setFilterSubs(cat?.subcategories || []); setFilterSubcategory(""); setFilterSubSubCat(""); setFilterSubSubs([]);
  }, [filterCategory]);

  useEffect(() => {
    if (!filterSubcategory) { setFilterSubSubs([]); setFilterSubSubCat(""); return; }
    const cat = categories.find((c) => c._id === filterCategory);
    const sub = cat?.subcategories?.find((s) => s._id === filterSubcategory);
    setFilterSubSubs(sub?.subSubcategories || []); setFilterSubSubCat("");
  }, [filterSubcategory]);

  // Auto-calculate salePrice
  useEffect(() => {
    if (form._manualSale) return;
    const bd = calcGstBreakdown(Number(form.basePrice) || 0, Number(form.profit) || 0, Number(form.gstPercent) || 0, Number(form.cessPercent) || 0, form.taxType || "cgst_sgst");
    setForm((p) => ({ ...p, salePrice: String(bd.salePrice) }));
  }, [form.basePrice, form.profit, form.gstPercent, form.cessPercent, form.taxType, form._manualSale]);

  const notify = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };
  const handleTempBulkChange = useCallback((rules) => { setTempBulkRules(rules); tempBulkRulesRef.current = rules; }, []);

  const fetchBrands      = async () => { try { const res = await axiosAuth.get(BRAND_API); setBrands(res.data?.data || []); } catch (err) { console.error("fetchBrands:", err); } };
  const fetchAllBulkRules = async () => { try { const res = await axiosAuth.get(`${BULK_API_URL}/my`); setAllBulkRules(res.data?.data || []); } catch {} };
  const fetchHsnCodes    = async () => { try { const res = await axiosAuth.get(HSN_API_URL); if (res.data?.success) { setHsnCodes(res.data.data || []); setHsnCategories(res.data.categories || []); } } catch {} };
  const fetchCategories  = async () => { try { const res = await axiosAuth.get(CATEGORY_URL); if (res.data?.success) setCategories(res.data.categories || []); } catch {} };
  const fetchProducts    = async () => { try { setLoading(true); const res = await axiosAuth.get(API_URL); if (res.data?.success) setProducts(res.data.data || []); } catch {} finally { setLoading(false); } };

  /* ── handleChange — MRP allowed to type freely, validation on submit ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "salePrice") {
      setForm((p) => ({ ...p, salePrice: value, _manualSale: true }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleMainImageChange = useCallback(({ file, existingUrl }) => setForm((p) => ({ ...p, mainImageFile: file, existingMainImage: existingUrl })), []);
  const handleGalleryChange   = useCallback((newFiles, existingUrls) => setForm((p) => ({ ...p, galleryFiles: newFiles, existingGalleryImages: existingUrls })), []);
  const handleUnitConvChange  = useCallback((convs) => setForm((p) => ({ ...p, unitConversions: convs })), []);

  const handleHsnSelect = (hsnObj) => {
    if (!hsnObj) setForm((p) => ({ ...p, hsnCode: "", gstPercent: "", cessPercent: "0", _manualSale: false }));
    else setForm((p) => ({ ...p, hsnCode: hsnObj.code, gstPercent: String(hsnObj.gst ?? 0), cessPercent: String(hsnObj.cess ?? 0), _manualSale: false }));
  };

  const handleHsnAdded = (newHsn) => {
    setHsnCodes((prev) => [...prev, newHsn]);
    setHsnCategories((prev) => prev.includes(newHsn.category) ? prev : [...prev, newHsn.category]);
    handleHsnSelect(newHsn); notify("HSN code added!");
  };

  const handleBrandAdded = (newBrand) => { setBrands((prev) => [...prev, newBrand]); notify(`Brand "${newBrand.name}" added!`); };

  const resetForm = () => {
    setForm(EMPTY); setEditId(null); setCopyMode(false); setDrawer(false);
    setsubcategories([]); setSubSubCats([]);
    setUploaderKey(Date.now().toString());
    setTempBulkRules([]); tempBulkRulesRef.current = [];
  };

  const buildFD = () => {
    const fd = new FormData();
    fd.append("name",        form.name.trim());
    fd.append("brand",       form.brand);
    fd.append("category",    form.category);
    fd.append("status",      form.status);
    fd.append("basePrice",   form.basePrice);
    fd.append("profit",      form.profit || 0);
    fd.append("mrp",         form.mrp || "");
    fd.append("packaging",   JSON.stringify(form.packaging));
    fd.append("unitConversions", JSON.stringify(form.unitConversions || []));
    fd.append("gstPercent",  form.gstPercent  || 0);
    fd.append("cessPercent", form.cessPercent || 0);
    fd.append("hsnCode",     form.hsnCode     || "");
    fd.append("taxType",     form.taxType     || "cgst_sgst");
    if (form.validTill)   fd.append("validTill",   form.validTill);
    if (form.description) fd.append("description", form.description);
    if (form.weightValue && form.weightUnit) {
      fd.append("weight", JSON.stringify({ value: Number(form.weightValue), unit: form.weightUnit }));
    }
    if (form.subcategory) {
      const sub = subcategories.find((s) => s._id === form.subcategory);
      if (sub) fd.append("subcategory", JSON.stringify({ id: sub._id, name: sub.name, image: sub.image || null }));
    } else { fd.append("subcategory", ""); }
    if (form.subSubCategory) {
      const ss = subSubCats.find((s) => s._id === form.subSubCategory);
      if (ss) fd.append("subSubCategory", JSON.stringify({ id: ss._id, name: ss.name, image: ss.image || null }));
    } else { fd.append("subSubCategory", ""); }
    if (form.mainImageFile) fd.append("mainImage", form.mainImageFile);
    else fd.append("existingMainImage", form.existingMainImage || "");
    (form.galleryFiles || []).forEach((f) => fd.append("galleryImages", f));
    fd.append("existingGalleryImages", JSON.stringify(form.existingGalleryImages || []));
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.basePrice) { notify("Name, category & base price required", "error"); return; }
    if (!form.brand) { notify("Brand required", "error"); return; }

    // MRP validation
    if (form.mrp && Number(form.mrp) < Number(form.salePrice || 0)) {
      notify("MRP sale price se kam nahi ho sakta!", "error"); return;
    }

    const nameExists = products.some((p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p._id !== editId);
    if (nameExists) { notify("Product name already exists!", "error"); return; }

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
        newProductId = res?.data?.data?._id;
        if (!newProductId) { notify("Product ID missing", "error"); return; }
        notify(copyMode ? "Copy saved!" : "Product added!");
      }
      const validRules = (tempBulkRulesRef.current || []).filter((r) => Number(r.minQty) > 0 && Number(r.unitPrice) > 0);
      if (validRules.length > 0 && newProductId) {
        try {
          await Promise.all(validRules.map((rule) =>
            axiosAuth.post(`${BULK_API_URL}/add`, { product: newProductId, minQty: Number(rule.minQty), maxQty: rule.maxQty ? Number(rule.maxQty) : null, unitPrice: Number(rule.unitPrice), profit: Number(rule.profit || 0) })
          ));
          notify(`Product + ${validRules.length} bulk tier(s) saved!`);
        } catch { notify("Product saved! Bulk tiers failed — retry from edit.", "error"); }
      }
      await fetchProducts(); await fetchAllBulkRules(); resetForm();
    } catch (err) {
      notify(err.response?.data?.message || "Something went wrong", "error");
    } finally { setSubmitting(false); }
  };

  const buildFormFromProduct = (p, overrides = {}) => {
    const catId = p.category?._id || p.category;
    const cat   = categories.find((c) => c._id === catId);
    const subs  = cat?.subcategories || [];
    const sub   = subs.find((s) => s._id === p.subcategory?.id);
    setsubcategories(subs);
    setSubSubCats(sub?.subSubcategories || []);
    const brandId = p.brand?._id || p.brand || "";
    return {
      name: p.name || "", brand: brandId,
      category: catId || "", subcategory: p.subcategory?.id || "", subSubCategory: p.subSubCategory?.id || "",
      description: p.description || "",
      basePrice: String(p.basePrice || ""), profit: String(p.profit || ""), salePrice: String(p.salePrice || ""),
      mrp: String(p.mrp || ""),
      weightValue: p.weight?.value != null ? String(p.weight.value) : "",
      weightUnit:  p.weight?.unit  || "kg",
      packaging:   p.packaging || { box: 0, packetPerBox: 0, piecePerPacket: 0 },
      unitConversions: p.unitConversions || [],
      status: p.status || "inactive",
      gstPercent:  p.gstPercent  !== undefined ? String(p.gstPercent)  : "",
      cessPercent: p.cessPercent !== undefined ? String(p.cessPercent) : "0",
      hsnCode: p.hsnCode || "", taxType: p.taxType || "cgst_sgst",
      validTill: p.validTill ? p.validTill.split("T")[0] : "",
      mainImageFile: null, existingMainImage: p.image || "",
      galleryFiles: [], existingGalleryImages: p.galleryImages || [],
      _manualSale: false, ...overrides,
    };
  };

  const handleEdit = (p) => {
    setForm(buildFormFromProduct(p)); setEditId(p._id); setCopyMode(false);
    setUploaderKey(p._id); setTempBulkRules([]); tempBulkRulesRef.current = []; setDrawer(true);
  };

  const handleCopy = (p) => {
    setForm(buildFormFromProduct(p, { name: `${p.name} (Copy)`, status: "inactive" }));
    setEditId(null); setCopyMode(true);
    setUploaderKey(`copy-${p._id}-${Date.now()}`); setTempBulkRules([]); tempBulkRulesRef.current = []; setDrawer(true);
  };

  const handleDelete = async () => {
    try { await axiosAuth.delete(`${API_URL}/${deleteId}`); fetchProducts(); notify("Product deleted."); }
    catch { notify("Delete failed.", "error"); }
    finally { setDeleteId(null); }
  };

  const handleStatusToggle = async (item) => {
    try {
      const newStatus = item.status === "active" ? "inactive" : "active";
      await axiosAuth.put(`${API_URL}/status/${item._id}`, { status: newStatus });
      setProducts((prev) => prev.map((x) => x._id === item._id ? { ...x, status: newStatus } : x));
    } catch { notify("Status update failed.", "error"); }
  };

  const handleInlineBasePrice = async (productId, newBase) => {
    try {
      const item = products.find((x) => x._id === productId);
      if (!item) return;
      await axiosAuth.post(`${API_URL}/bulk-update`, {
        products: [{ id: productId, basePrice: newBase, profit: Number(item.profit) || 0, gstPercent: Number(item.gstPercent) || 0, cessPercent: Number(item.cessPercent) || 0, hsnCode: item.hsnCode || "", taxType: item.taxType || "cgst_sgst", brand: item.brand?._id || item.brand || "", status: item.status }],
      });
      await fetchProducts(); notify(`Base price updated!`);
    } catch { notify("Price update failed.", "error"); }
  };

  const handleBulkSave = async () => {
    if (!selectedItems.length) return notify("No items selected", "error");
    const updates = products.filter((x) => selectedItems.includes(x._id)).map((x) => ({
      id: x._id, basePrice: Number(x.basePrice), profit: Number(x.profit || 0),
      gstPercent: Number(x.gstPercent || 0), cessPercent: Number(x.cessPercent || 0),
      hsnCode: x.hsnCode || "", taxType: x.taxType || "cgst_sgst",
      brand: x.brand?._id || x.brand || "", status: x.status,
    }));
    try {
      await axiosAuth.post(`${API_URL}/bulk-update`, { products: updates });
      notify("Bulk save done!"); setBulkMode(false); setSelectedItems([]); fetchProducts();
    } catch { notify("Bulk save failed.", "error"); }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return notify("No items selected", "error");
    if (!window.confirm("Delete selected products?")) return;
    try { await axiosAuth.post(`${API_URL}/delete-selected`, { ids: selectedItems }); setSelectedItems([]); setBulkMode(false); fetchProducts(); notify("Selected deleted."); }
    catch { notify("Bulk delete failed.", "error"); }
  };

  const handleFixAllPrices = async () => {
    if (!window.confirm("Recalculate all sale prices?")) return;
    try { const res = await axiosAuth.post(`${API_URL}/fix-prices`); notify(res.data?.message || "Prices fixed!"); fetchProducts(); }
    catch { notify("Fix failed.", "error"); }
  };

  const filtered = products.filter((p) => {
    const t = search.toLowerCase();
    const brandName = p.brand?.name || "";
    const matchText = (p.name || "").toLowerCase().includes(t) || brandName.toLowerCase().includes(t) || (p.category?.name || "").toLowerCase().includes(t) || (p.hsnCode || "").toLowerCase().includes(t);
    return matchText
      && (!filterCategory    || (p.category?._id || p.category) === filterCategory)
      && (!filterSubcategory || p.subcategory?.id === filterSubcategory)
      && (!filterSubSubCat   || p.subSubCategory?.id === filterSubSubCat)
      && (!filterStatus      || p.status === filterStatus);
  });

  const start      = (page - 1) * limit;
  const paginated  = filtered.slice(start, start + limit);
  const totalPages = Math.ceil(filtered.length / limit);

  /* ── MRP validation helper for live badge ── */
  const mrpNum   = Number(form.mrp) || 0;
  const saleNum  = Number(form.salePrice) || 0;
  const mrpValid = !form.mrp || mrpNum >= saleNum;
  const mrpDiscount = form.mrp && mrpNum >= saleNum && saleNum > 0 ? (mrpNum - saleNum).toFixed(2) : null;

  /* ── CSS ── */
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
      --shadow:0 1px 3px rgba(0,0,0,.07);--shadowMd:0 4px 16px rgba(0,0,0,.09);--shadowLg:0 16px 48px rgba(0,0,0,.14);
      --r:10px;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    .vp{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);min-height:100vh;color:var(--text)}
    .vp-topbar{background:var(--white);border-bottom:1px solid var(--border);height:58px;padding:0 28px;display:flex;align-items:center;position:sticky;top:0;z-index:50}
    .vp-topbar-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:15px}
    .vp-body{padding:24px 28px 64px;max-width:1400px}
    .vp-page-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
    .vp-page-header h1{font-size:20px;font-weight:700;letter-spacing:-.4px}
    .vp-page-header p{font-size:13px;color:var(--textMid);margin-top:4px}
    .vp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
    .vp-stat{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;box-shadow:var(--shadow);display:flex;align-items:center;gap:14px}
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
    .btn-primary:hover:not(:disabled){background:var(--blueHov);transform:translateY(-1px)}
    .btn-primary:disabled{opacity:.55;cursor:not-allowed}
    .btn-copy{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--orangeFade);border:1.5px solid #fed7aa;border-radius:8px;color:var(--orange);font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
    .btn-copy:hover:not(:disabled){background:var(--orange);color:#fff}
    .btn-copy:disabled{opacity:.55;cursor:not-allowed}
    .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--textMid);font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
    .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--bg)}
    .btn-danger-sm{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;background:var(--redFade);border:1px solid #fecaca;border-radius:8px;color:var(--red);font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
    .btn-danger-sm:hover{background:var(--red);color:#fff}
    .btn-icon{width:32px;height:32px;border-radius:7px;border:1px solid var(--border);background:var(--white);color:var(--textMid);font-size:13px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;flex-shrink:0}
    .btn-edit:hover{border-color:var(--blue);color:var(--blue);background:var(--blueFade)}
    .btn-copy-icon:hover{border-color:var(--orange);color:var(--orange);background:var(--orangeFade)}
    .btn-del:hover{border-color:var(--red);color:var(--red);background:var(--redFade)}
    .vp-bulk-bar{background:#eef2ff;border:1px solid #dbeafe;border-radius:10px;padding:14px 18px;margin-bottom:14px}
    .vp-table-wrap{overflow-x:auto}
    .vp-table{width:100%;border-collapse:collapse;min-width:1280px}
    .vp-table thead tr{border-bottom:1px solid var(--border);background:#f8f9fc}
    .vp-table th{padding:10px 12px;text-align:left;white-space:nowrap;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--textMid)}
    .vp-table tbody tr{border-bottom:1px solid var(--border);transition:background .12s}
    .vp-table tbody tr:last-child{border-bottom:none}
    .vp-table tbody tr:hover{background:#f8faff}
    .vp-table td{padding:11px 12px;font-size:13px;vertical-align:middle}
    .vp-prod-cell{display:flex;align-items:center;gap:11px}
    .vp-prod-name{font-weight:600;font-size:13px;line-height:1.3}
    .vp-prod-brand{font-size:11.5px;color:var(--blue);font-weight:500;margin-top:2px;display:flex;align-items:center;gap:4px}
    .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.2px;white-space:nowrap}
    .badge-blue{background:var(--blueFade);color:var(--blue);border:1px solid #bfdbfe}
    .badge-indigo{background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe}
    .badge-purple{background:var(--purpleFade);color:var(--purple);border:1px solid #ddd6fe}
    .badge-green{background:var(--greenFade);color:var(--green);border:1px solid #bbf7d0}
    .badge-amber{background:var(--amberFade);color:var(--amber);border:1px solid #fde68a}
    .badge-gray{background:var(--bg);color:var(--textMid);border:1px solid var(--border)}
    .badge-red{background:var(--redFade);color:var(--red);border:1px solid #fecaca}
    .status-btn{padding:5px 11px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;border:none;transition:all .2s}
    .status-active{background:#d1fae5;color:#065f46;border:1px solid #bbf7d0}
    .status-inactive{background:#fee2e2;color:#991b1b;border:1px solid #fecaca}
    .vp-sale-price{font-weight:700;font-size:13.5px}
    .vp-empty{padding:64px 20px;text-align:center}
    .vp-empty-icon{font-size:40px;margin-bottom:12px;opacity:.25}
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
    .vp-drawer.copy-drawer{border-color:#fed7aa}
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
    .cess-field{border:1px solid #ddd6fe!important;background:#faf5ff!important}
    .cess-field:focus{border-color:#7c3aed!important;box-shadow:0 0 0 3px rgba(124,58,237,.09)!important}
    .mrp-field{border:1.5px solid #fecaca!important;background:#fef2f2!important}
    .mrp-field:focus{border-color:#dc2626!important;box-shadow:0 0 0 3px rgba(220,38,38,.09)!important}
    .mrp-field-error{border:1.5px solid #dc2626!important;background:#fef2f2!important;box-shadow:0 0 0 3px rgba(220,38,38,.12)!important}
    .img-section-box{padding:14px;border:1px solid var(--border);border-radius:10px;background:#fafbfd;margin-bottom:14px}
    .img-section-label{font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--textDim);margin-bottom:10px;display:flex;align-items:center;gap:6px}
    .bd-wrap{border:1.5px solid #e0f2fe;border-radius:12px;overflow:hidden;background:#f8fbff}
    .bd-header{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-bottom:1px solid #bae6fd}
    .bd-header-icon{width:32px;height:32px;background:white;border:1px solid #bae6fd;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
    .bd-add-btn{padding:5px 12px;background:var(--blue);color:white;border:none;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
    .bd-form-wrap{margin:12px;padding:14px;background:white;border:1px solid #bae6fd;border-radius:10px}
    .bd-form-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:10px}
    .bd-lbl{display:block;font-size:11px;font-weight:600;color:var(--textMid);margin-bottom:4px}
    .bd-inp{width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;color:var(--text);outline:none;transition:border-color .2s}
    .bd-inp:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.08)}
    .bd-error{padding:7px 10px;background:var(--redFade);border:1px solid #fecaca;border-radius:7px;color:var(--red);font-size:11.5px;margin-bottom:8px}
    .bd-save-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;background:var(--blue);color:white;border:none;border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
    .bd-save-btn:disabled{opacity:.6;cursor:not-allowed}
    .bd-cancel-btn{padding:6px 12px;background:transparent;border:1px solid var(--border);border-radius:7px;color:var(--textMid);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;cursor:pointer}
    .bd-skeleton{height:52px;background:linear-gradient(90deg,#f0f2f7 25%,#e4e7ef 50%,#f0f2f7 75%);background-size:300% 100%;animation:shim 1.5s ease infinite;border-radius:8px}
    .bd-empty{padding:20px 16px;text-align:center}
    .bd-empty-icon{font-size:28px;opacity:.2;margin-bottom:8px}
    .bd-rules-list{padding:10px 12px;display:flex;flex-direction:column;gap:8px}
    .bd-rule-card{background:white;border:1px solid #e0f2fe;border-radius:9px;padding:10px 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .bd-rule-tier-badge{font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:#e0f2fe;padding:3px 7px;border-radius:20px;flex-shrink:0}
    .bd-rule-main{display:flex;align-items:center;gap:8px;flex:1;min-width:0;flex-wrap:wrap}
    .bd-unit-price{font-size:14px;font-weight:800;color:var(--blue)}
    .bd-per-unit{font-size:10px;color:var(--textDim)}
    .bd-savings-tag{font-size:10px;font-weight:700;color:#16a34a;background:#dcfce7;padding:2px 6px;border-radius:20px}
    .bd-rule-actions{display:flex;gap:5px;flex-shrink:0}
    .bd-edit-btn,.bd-del-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--white);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
    .bd-edit-btn:hover{border-color:var(--blue);background:var(--blueFade)}
    .bd-del-btn:hover{border-color:var(--red);background:var(--redFade)}
    .bd-del-overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px}
    .bd-del-modal{background:white;border-radius:12px;padding:22px;width:280px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:popIn .2s cubic-bezier(.22,1,.36,1)}
    @keyframes popIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    .bpr-trigger{display:flex;align-items:center;gap:5px;padding:4px 9px;border:1px solid #bae6fd;border-radius:7px;background:#f0f9ff;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;color:#0369a1;white-space:nowrap}
    .bpr-label{font-weight:600}
    .bpr-saving{padding:2px 6px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:10px;font-weight:700}
    .bpr-popup{position:absolute;top:calc(100% + 6px);left:0;z-index:200;background:white;border:1px solid #bae6fd;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.14);min-width:280px;overflow:hidden}
    .bpr-popup-title{padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:#f0f9ff;border-bottom:1px solid #bae6fd;display:flex;align-items:center}
    .bpr-row{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid #f0f9ff;font-size:12px;flex-wrap:wrap}
    .bpr-tier-num{width:22px;height:22px;background:#0369a1;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0}
    .bpr-qty-range{flex:1;font-weight:600;color:var(--text);min-width:80px}
    .bpr-arrow{color:var(--textDim);font-size:11px}
    .bpr-price{font-weight:800;color:var(--blue)}
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
    .hsn-search{width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;outline:none}
    .hsn-search:focus{border-color:var(--blue)}
    .hsn-cat-bar{display:flex;gap:6px;padding:6px 10px;overflow-x:auto;border-bottom:1px solid var(--border);scrollbar-width:none}
    .hsn-cat-pill{flex-shrink:0;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;border:none;background:#f3f4f6;color:var(--textMid);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif}
    .hsn-cat-pill-active{background:var(--blue)!important;color:white!important}
    .hsn-list{max-height:220px;overflow-y:auto;padding:6px}
    .hsn-empty{padding:24px;text-align:center;color:var(--textDim);font-size:13px}
    .hsn-item{width:100%;display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border:none;border-radius:8px;background:transparent;cursor:pointer;text-align:left;font-family:'Plus Jakarta Sans',sans-serif}
    .hsn-item:hover,.hsn-item-high{background:#f8fafc}
    .hsn-item-selected{background:var(--blueFade)!important}
    .hsn-item-code{font-family:monospace;font-size:10px;font-weight:700;padding:3px 6px;border-radius:4px;background:#f3f4f6;color:var(--text);flex-shrink:0;margin-top:1px}
    .hsn-item-code-sel{background:var(--blue)!important;color:white!important}
    .hsn-item-desc{font-size:12px;color:var(--text);line-height:1.3}
    .hsn-item-cat{font-size:10px;color:var(--textDim);margin-top:2px}
    .hsn-footer{padding:7px 12px;border-top:1px solid var(--border);font-size:10px;color:var(--textDim);background:#f8f9fc}
    .vp-modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.52);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeO .2s ease}
    .vp-modal{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:28px;width:460px;box-shadow:var(--shadowLg);animation:popIn .22s cubic-bezier(.22,1,.36,1)}
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
    @media(max-width:768px){.vp-stats{grid-template-columns:1fr 1fr}.vp-body{padding:16px 14px 60px}.vp-row2,.vp-row3{grid-template-columns:1fr}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="vp">
        {/* ── TOPBAR ── */}
        <div className="vp-topbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="vp-topbar-icon">🏪</div>
            <span style={{ fontSize: 15, fontWeight: 700, marginLeft: 9 }}>Seller Panel</span>
            <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 10px" }} />
            <span style={{ fontSize: 13, color: "var(--textMid)" }}>Products</span>
          </div>
        </div>

        <div className="vp-body">
          {/* ── PAGE HEADER ── */}
          <div className="vp-page-header fade-up">
            <div>
              <h1>Products</h1>
              <p>{products.length} products · {categories.length} categories · {brands.length} brands · {hsnCodes.length} HSN codes</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={handleFixAllPrices}>🔧 Fix Prices</button>
              <button className="btn-primary" onClick={() => { resetForm(); setDrawer(true); }}>+ Add Product</button>
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="vp-stats fade-up">
            {[
              { icon: "📦", bg: "#eff6ff", val: products.length, lbl: "Total Products" },
              { icon: "✅", bg: "#f0fdf4", val: products.filter((p) => p.status === "active").length, lbl: "Active" },
              { icon: "🏷️", bg: "#fffbeb", val: brands.length, lbl: "Brands" },
              { icon: "💰", bg: "#fdf4ff", val: `₹${products.reduce((s, p) => s + (Number(p.basePrice) || 0), 0).toLocaleString()}`, lbl: "Catalogue Value" },
            ].map((s, i) => (
              <div className="vp-stat" key={i}>
                <div className="vp-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div><div className="vp-stat-val">{s.val}</div><div className="vp-stat-lbl">{s.lbl}</div></div>
              </div>
            ))}
          </div>

          {/* ── BULK BAR ── */}
          {selectedItems.length > 0 && (
            <div className="vp-bulk-bar fade-up">
              <div className="action-row">
                <span style={{ fontSize: 13, fontWeight: 600, color: "#4338ca" }}>{selectedItems.length} selected</span>
                <button className="btn-primary" onClick={() => setBulkMode(true)}>Bulk Edit</button>
                <button className="btn-danger-sm" onClick={handleBulkDelete}>Delete</button>
                <button className="btn-ghost" onClick={() => setSelectedItems([])}>Clear</button>
              </div>
            </div>
          )}

          {/* ── TABLE CARD ── */}
          <div className="vp-card fade-up">
            <div className="vp-toolbar">
              <div className="vp-toolbar-left">
                <div className="vp-search-wrap">
                  <span className="vp-search-ico">⌕</span>
                  <input className="vp-search" placeholder="Search name, brand, HSN..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="vp-sel-filter" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {filterSubs.length > 0 && (
                  <select className="vp-sel-filter" value={filterSubcategory} onChange={(e) => { setFilterSubcategory(e.target.value); setPage(1); }}>
                    <option value="">All Subs</option>
                    {filterSubs.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
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
                    const url = window.URL.createObjectURL(new Blob([res.data])); const a = document.createElement("a"); a.href = url; a.download = "vendor_products.csv"; a.click();
                  } catch { notify("Export failed.", "error"); }
                }}>Export CSV</button>
                <label style={{ cursor: "pointer" }}>
                  <input type="file" accept=".csv" style={{ display: "none" }} onChange={async (e) => {
                    try { const fd = new FormData(); fd.append("file", e.target.files[0]); const res = await axiosAuth.post(`${API_URL}/import`, fd); notify(`Imported ${res.data.imported} products.`); fetchProducts(); }
                    catch { notify("Import failed.", "error"); } e.target.value = "";
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
                      <input type="checkbox" checked={selectedItems.length === filtered.length && filtered.length > 0}
                        onChange={() => setSelectedItems(selectedItems.length === filtered.length ? [] : filtered.map((x) => x._id))} />
                    </th>
                    <th>#</th><th>Product</th><th>Category</th>
                    <th>HSN / GST</th><th>Weight</th><th>Base</th><th>Profit</th>
                    <th>Sale Price</th><th>MRP</th><th>Bulk</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr className="sh-row" key={i}>
                        {[36, 20, 220, 100, 160, 80, 80, 70, 100, 80, 80, 80, 80].map((w, j) => (
                          <td key={j}><div className="shimmer" style={{ width: w }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={13}><div className="vp-empty"><div className="vp-empty-icon">📦</div><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>No products</div></div></td></tr>
                  ) : paginated.map((p, i) => {
                    const hsnInfo      = hsnCodes.find((h) => h.code === p.hsnCode);
                    const gstKey       = p.gstPercent ?? 0;
                    const badge        = GST_BADGE[gstKey] ?? GST_BADGE[0];
                    const brandObj     = brands.find((b) => b._id === (p.brand?._id || p.brand)) || p.brand;
                    const prodConvs    = p.unitConversions || [];
                    const mrpVal       = Number(p.mrp) || 0;
                    const saleVal      = Number(p.salePrice) || 0;
                    const mrpDisc      = mrpVal > saleVal ? mrpVal - saleVal : 0;
                    return (
                      <tr key={p._id}>
                        <td><input type="checkbox" checked={selectedItems.includes(p._id)} onChange={() => setSelectedItems((prev) => prev.includes(p._id) ? prev.filter((x) => x !== p._id) : [...prev, p._id])} /></td>
                        <td style={{ color: "var(--textDim)", fontSize: 12 }}>{start + i + 1}</td>
                        <td>
                          <div className="vp-prod-cell">
                            <ProductImageCell image={p.image} galleryImages={p.galleryImages} name={p.name} />
                            <div>
                              <div className="vp-prod-name">{p.name}</div>
                              {brandObj && (
                                <div className="vp-prod-brand">
                                  {brandObj?.image?.url && <img src={brandObj.image.url} alt="" style={{ width: 14, height: 14, borderRadius: 3, objectFit: "cover" }} />}
                                  {brandObj?.name || ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {p.category?.name ? <span className="badge badge-blue">{p.category.name}</span> : <span style={{ color: "var(--textDim)" }}>—</span>}
                          {p.subcategory?.name    && <div style={{ marginTop: 3 }}><span className="badge badge-indigo">→ {p.subcategory.name}</span></div>}
                          {p.subSubCategory?.name && <div style={{ marginTop: 3 }}><span className="badge badge-purple">→ {p.subSubCategory.name}</span></div>}
                        </td>
                        <td>
                          {p.hsnCode ? (
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{p.hsnCode}</span>
                                <span className="gst-badge" style={{ background: badge.bg, color: badge.text }}>
                                  <span style={{ background: badge.dot, width: 6, height: 6, borderRadius: "50%", display: "inline-block", marginRight: 4 }} />GST {p.gstPercent ?? 0}%
                                </span>
                              </div>
                              {hsnInfo && <div style={{ fontSize: 10, color: "var(--textDim)", marginTop: 3, maxWidth: 160 }}>{hsnInfo.description}</div>}
                            </div>
                          ) : <span style={{ fontSize: 12, color: "var(--textDim)", fontStyle: "italic" }}>Not set</span>}
                        </td>
                        <td>
                          {prodConvs.length > 0 && p.weight?.value ? (
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 7, padding: "4px 8px", display: "inline-block" }}>
                              {pcsToDisplay(p.weight.value, prodConvs)}
                            </span>
                          ) : p.weight?.value ? (
                            <span className="badge badge-gray">{p.weight.value} {p.weight.unit}</span>
                          ) : (
                            <span style={{ color: "var(--textDim)" }}>—</span>
                          )}
                        </td>
                        <td><InlinePrice value={p.basePrice} onSave={(v) => handleInlineBasePrice(p._id, v)} /></td>
                        <td>{Number(p.profit) > 0 ? <span className="badge badge-green">+₹{p.profit}</span> : <span style={{ color: "var(--textDim)" }}>—</span>}</td>
                        <td>
                          <div className="vp-sale-price">₹{p.salePrice}</div>
                          {p.totalTaxAmount > 0 && <div style={{ fontSize: 9, color: "var(--textDim)", marginTop: 2 }}>Tax ₹{(p.totalTaxAmount || 0).toFixed(2)} incl.</div>}
                        </td>
                        <td>
                          {mrpVal > 0 ? (
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: "#dc2626" }}>₹{mrpVal}</div>
                              {mrpDisc > 0 && <div style={{ fontSize: 10, color: "#16a34a", marginTop: 2 }}>↓ ₹{mrpDisc.toFixed(2)} off</div>}
                            </div>
                          ) : <span style={{ color: "var(--textDim)", fontSize: 12 }}>—</span>}
                        </td>
                        <td><BulkPriceRangeCell productId={p._id} basePrice={p.basePrice} salePrice={p.salePrice} allBulkRules={allBulkRules} /></td>
                        <td>
                          <button className={`status-btn ${p.status === "active" ? "status-active" : "status-inactive"}`} onClick={() => handleStatusToggle(p)}>
                            {p.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button className="btn-icon btn-edit"      onClick={() => handleEdit(p)}>✏️</button>
                            <button className="btn-icon btn-copy-icon" onClick={() => handleCopy(p)}>📄</button>
                            <button className="btn-icon btn-del"       onClick={() => setDeleteId(p._id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* ══════════════════════════════════════════════════════════════
          DRAWER
      ══════════════════════════════════════════════════════════════ */}
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

                {/* COPY MODE BANNER */}
                {copyMode && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1.5px solid #fed7aa", borderRadius: 10, marginBottom: 18 }}>
                    <span style={{ padding: "3px 9px", background: "var(--orange)", color: "#fff", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>COPY MODE</span>
                    <span style={{ fontSize: 12, color: "var(--orange)" }}>Don't forget to change the name!</span>
                  </div>
                )}

                {/* ── BASIC INFO ── */}
                <div className="vp-sec-head">Basic Information</div>
                <div className="vp-row2">
                  <div className="vp-field">
                    <label className="vp-lbl">Product Name *</label>
                    <input className="vp-inp" name="name" placeholder="e.g. Organic Almonds" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="vp-field">
                    <label className="vp-lbl">Status</label>
                    <select className="vp-sel" name="status" value={form.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* ── BRAND ── */}
                <div className="vp-field">
                  <label className="vp-lbl">Brand * <span className="vp-lbl-sub">— select existing or click + to add new</span></label>
                  <BrandPicker value={form.brand} brands={brands} onSelect={(id) => setForm((p) => ({ ...p, brand: id }))} onBrandAdded={handleBrandAdded} />
                </div>

                {/* ── CATEGORY ── */}
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

                {/* ── PRICING ── */}
                <div className="vp-sec-head">Pricing &amp; Tax</div>

                {/* Price Formula Box */}
                <div style={{ padding: "14px 16px", background: "linear-gradient(135deg,#f0f9ff,#eff6ff)", border: "1px solid #bfdbfe", borderRadius: 10, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>
                    💡 Price Formula: Base Price + Profit = Final Sale Price (GST &amp; CESS inside)
                  </div>

                  {/* Row 1: Base + Profit = Sale Price */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 28px 1fr", gap: 6, alignItems: "end" }}>
                    <div>
                      <label className="vp-lbl" style={{ color: "#1d4ed8" }}>Base Price (₹) *</label>
                      <input className="vp-inp" type="number" name="basePrice" placeholder="0.00" value={form.basePrice} onChange={handleChange} min="0" step="0.01" required
                        style={{ borderColor: "#bfdbfe", background: "#eff6ff" }} />
                    </div>
                    <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "#93c5fd", paddingBottom: 4 }}>+</div>
                    <div>
                      <label className="vp-lbl" style={{ color: "#059669" }}>Profit (₹)</label>
                      <input className="vp-inp" type="number" name="profit" placeholder="0.00" value={form.profit} onChange={handleChange} min="0" step="0.01"
                        style={{ borderColor: "#6ee7b7", background: "#f0fdf4" }} />
                    </div>
                    <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "#93c5fd", paddingBottom: 4 }}>=</div>
                    <div>
                      <label className="vp-lbl" style={{ color: "#16a34a" }}>
                        Final Sale Price
                        <span style={{ marginLeft: 5, fontSize: 9, background: form._manualSale ? "#fef3c7" : "#dcfce7", color: form._manualSale ? "#92400e" : "#16a34a", padding: "1px 6px", borderRadius: 20, fontWeight: 700 }}>
                          {form._manualSale ? "manual" : "auto"}
                        </span>
                      </label>
                      <input className="vp-inp" type="number" name="salePrice" placeholder="Auto" value={form.salePrice} onChange={handleChange} min="0" step="0.01"
                        style={{ borderColor: form._manualSale ? "#fde68a" : "#86efac", background: form._manualSale ? "#fffbeb" : "#f0fdf4", fontWeight: 700 }} />
                    </div>
                  </div>

                  {/* Reset to Auto */}
                  {form._manualSale && (
                    <button type="button" onClick={() => setForm((p) => ({ ...p, _manualSale: false }))}
                      style={{ marginTop: 8, fontSize: 11, padding: "3px 10px", borderRadius: 7, border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                      ↺ Reset to Auto
                    </button>
                  )}

                  {/* Row 2: MRP — dedicated full-width row */}
                  <div style={{ marginTop: 12, padding: "12px 14px", background: "#fff5f5", border: `1.5px solid ${!mrpValid ? "#dc2626" : "#fecaca"}`, borderRadius: 9 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>
                          🏷️ MRP — Maximum Retail Price (₹)
                          <span style={{ marginLeft: 6, fontSize: 10, color: "#9ca3af", fontWeight: 400 }}>must be ≥ sale price</span>
                        </label>
                        <input
                          className={`vp-inp ${!mrpValid ? "mrp-field-error" : "mrp-field"}`}
                          type="number"
                          name="mrp"
                          placeholder="Enter MRP (e.g. 150)"
                          value={form.mrp}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Live badge */}
                      {form.mrp && form.salePrice && (
                        <div style={{ paddingBottom: 2 }}>
                          {mrpValid ? (
                            mrpDiscount ? (
                              <div style={{ padding: "6px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#16a34a", whiteSpace: "nowrap" }}>
                                ✓ Customer saves ₹{mrpDiscount}
                              </div>
                            ) : (
                              <div style={{ padding: "6px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#16a34a", whiteSpace: "nowrap" }}>
                                ✓ MRP = Sale Price
                              </div>
                            )
                          ) : (
                            <div style={{ padding: "6px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#dc2626", whiteSpace: "nowrap" }}>
                              ⚠ MRP &lt; Sale Price (₹{saleNum})
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* GST / CESS / TAX TYPE */}
                <div className="vp-row3">
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
                  <div className="vp-field">
                    <label className="vp-lbl">CESS % <span className="vp-lbl-sub">(Comp. Cess)</span></label>
                    <input className="vp-inp cess-field" type="number" name="cessPercent" placeholder="0" value={form.cessPercent} onChange={handleChange} min="0" max="100" step="0.01" />
                  </div>
                  <div className="vp-field">
                    <label className="vp-lbl">Tax Type</label>
                    <select className="vp-sel" name="taxType" value={form.taxType} onChange={handleChange}>
                      <option value="cgst_sgst">CGST + SGST</option>
                      <option value="igst">IGST</option>
                    </select>
                  </div>
                </div>

                {/* Live GST Breakdown */}
                <GstBreakdownPanel basePrice={form.basePrice} profit={form.profit} gstPercent={form.gstPercent} cessPercent={form.cessPercent} taxType={form.taxType} />

                {/* HSN CODE */}
                <div className="vp-field" style={{ marginTop: 12 }}>
                  <label className="vp-lbl">HSN Code <span className="vp-lbl-sub">(auto-fills GST &amp; CESS)</span></label>
                  <HsnPicker value={form.hsnCode} onSelect={handleHsnSelect} hsnCodes={hsnCodes} hsnCategories={hsnCategories} onAddNew={() => setShowAddHsn(true)} />
                </div>

                {/* VALID TILL */}
                <div className="vp-field">
                  <label className="vp-lbl">Valid Till</label>
                  <input className="vp-inp" type="date" name="validTill" value={form.validTill} onChange={handleChange} />
                </div>

                {/* ── BULK DISCOUNT ── */}
                <div className="vp-sec-head">Bulk Discount Pricing</div>
                <BulkDiscountManager productId={editId} basePrice={form.basePrice} salePrice={form.salePrice} onTempChange={handleTempBulkChange} />

                {/* ── WEIGHT & UNIT CONVERSIONS ── */}
                <div className="vp-sec-head">Weight &amp; Unit Conversions</div>
                <div style={{ padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 10, background: "#fafbfd", marginBottom: 12 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--textMid)", marginBottom: 10 }}>
                    📏 Weight / Quantity <span style={{ fontWeight: 400, color: "var(--textDim)" }}>(optional)</span>
                  </div>
                  <div className="vp-row2">
                    <div className="vp-field" style={{ marginBottom: 0 }}>
                      <label className="vp-lbl">Value</label>
                      <input className="vp-inp" type="number" name="weightValue" placeholder="Leave empty if not applicable" value={form.weightValue} onChange={handleChange} min="0" />
                    </div>
                    <div className="vp-field" style={{ marginBottom: 0 }}>
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
                  {form.weightValue && (
                    <div style={{ marginTop: 8, fontSize: 11.5, color: "#16a34a", fontWeight: 600 }}>
                      ✓ Weight set to: {form.weightValue} {form.weightUnit}
                    </div>
                  )}
                </div>
                <UnitConversionManager conversions={form.unitConversions} onChange={handleUnitConvChange} />

                {/* ── IMAGES ── */}
                <div className="vp-sec-head">Images</div>
                <div className="img-section-box">
                  <div className="img-section-label">
                    <span style={{ padding: "2px 8px", background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Main Image</span>
                  </div>
                  <MainImageUploader key={`main-${uploaderKey}`} file={form.mainImageFile} existingUrl={form.existingMainImage} onChange={handleMainImageChange} />
                </div>
                <div className="img-section-box">
                  <div className="img-section-label">
                    <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Gallery Images</span>
                    <span style={{ fontSize: 11, color: "var(--textDim)", fontWeight: 400 }}>Up to 4</span>
                  </div>
                  <GalleryUploader key={`gallery-${uploaderKey}`} galleryFiles={form.galleryFiles} existingGalleryImages={form.existingGalleryImages} onChange={handleGalleryChange} />
                </div>

                {/* ── DESCRIPTION ── */}
                <div className="vp-sec-head">Description</div>
                <div className="vp-field">
                  <textarea className="vp-ta" name="description" placeholder="Brief product description (optional)..." value={form.description} onChange={handleChange} />
                </div>
              </div>

              {/* DRAWER FOOTER */}
              <div className={`vp-drawer-foot${copyMode ? " copy-foot" : ""}`}>
                {copyMode
                  ? <button type="submit" className="btn-copy" style={{ flex: 1, justifyContent: "center" }} disabled={submitting}>{submitting ? "Saving..." : "Save as New Product"}</button>
                  : <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={submitting}>{submitting ? "Saving..." : editId ? "Update Product" : "Add Product"}</button>}
                <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD HSN MODAL ── */}
      {showAddHsn && (
        <AddHsnModal onClose={() => setShowAddHsn(false)} onSaved={handleHsnAdded} existingCategories={hsnCategories} />
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div className="vp-modal-bg">
          <div className="vp-modal">
            <div className="vp-modal-ico">🗑️</div>
            <h3>Delete this product?</h3>
            <p>This action cannot be undone.</p>
            <div className="vp-modal-row">
              <button className="btn-danger" onClick={handleDelete}>Yes, Delete</button>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`vp-toast ${toast.type}`}>
          <div className="toast-dot" />{toast.msg}
        </div>
      )}
    </>
  );
}