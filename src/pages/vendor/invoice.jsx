// import React from "react";
// // import { useLocation } from "react-router-dom";
// import { useLocation, useNavigate } from "react-router-dom";

// const fD = (d) =>
//   new Date(d).toLocaleDateString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric",
//   });

// const fN = (n, d = 2) =>
//   Number(n || 0).toLocaleString("en-IN", {
//     minimumFractionDigits: d,
//     maximumFractionDigits: d,
//   });

// const fC = (n, d = 2) => "₹" + fN(n, d);


// export default function InvoicePage() {
// const navigate = useNavigate();
//   const { state } = useLocation();
//   const order = state?.order;

//   if (!order) {
//     return (
//       <div style={{
//         minHeight: "100vh", display: "flex",
//         justifyContent: "center", alignItems: "center", background: "#f1f5f9",
//       }}>
//         <div style={{
//           background: "#fff", border: "0.5px solid #e2e8f0",
//           borderRadius: 12, padding: "40px 48px", textAlign: "center",
//         }}>
//           <h2 style={{ fontSize: 18, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
//             No Order Found
//           </h2>
//           <p style={{ fontSize: 13, color: "#64748b" }}>
//             Please navigate from your orders page.
//           </p>
//         </div>
//       </div>
//     );
//   }

 
//   const calcItems = (order.items || []).map((it) => {
//     const lineTotal  = Number(it.price    || 0);               
//     const unitPrice  = Number(it.unitPrice || it.rate || 0);
//     const gstRate    = Number(it.gstRate  || 0);
//     const cessRate   = Number(it.cess     || 0);
//     const mrp        = Number(it.mrp      || unitPrice);
//     const quantity   = Number(it.quantity || 1);

//     const divisor      = 1 + gstRate / 100 + cessRate / 100;
//     const taxable      = lineTotal / divisor;                 
//     const gstAmt       = taxable * (gstRate / 100);
//     const cessAmt      = taxable * (cessRate / 100);
//     const totalGst     = gstAmt + cessAmt;

//    return {
//   ...it,

//   // ✅ PACKING FIX
//   packing: it.packagingText || it.packing || "—",
//   packagingText: it.packagingText || it.packing || "—",

//   rate:     unitPrice,
//   mrp,
//   gstRate,
//   cessRate,
//   taxable,
//   gst:      gstAmt,
//   cess:     cessAmt,
//   sgst:     gstAmt / 2,
//   cgst:     gstAmt / 2,
//   totalGst,
//   total:    lineTotal,
// };
//   });

//   /* ── HSN Summary ── */
//   const hsnMap = {};
//   calcItems.forEach((it) => {
//     const key = it.hsn || "N/A";
//     if (!hsnMap[key]) hsnMap[key] = { taxable: 0, sgst: 0, cgst: 0, cess: 0, total: 0 };
//     hsnMap[key].taxable += it.taxable;
//     hsnMap[key].sgst    += it.sgst;
//     hsnMap[key].cgst    += it.cgst;
//     hsnMap[key].cess    += it.cess;
//     hsnMap[key].total   += it.total;
//   });

//   const grandTotal   = calcItems.reduce((s, i) => s + i.total,   0); // sum of GST-inclusive prices
//   const totalTaxable = calcItems.reduce((s, i) => s + i.taxable, 0);
//   const totalGST     = calcItems.reduce((s, i) => s + i.totalGst, 0);
//   const totalCess    = calcItems.reduce((s, i) => s + i.cess,    0);

//   // If coupon applied, show finalPrice as grand total
//   const effectiveTotal = order.finalPrice ?? grandTotal;
//   const couponDiscount = order.couponDiscount || 0;

//   /* ── Status Color ── */
//   const statusMap = {
//     pending:   { bg: "#fff7ed", color: "#c2410c", dot: "#fb923c" },
//     confirmed: { bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
//     placed:    { bg: "#fff7ed", color: "#c2410c", dot: "#fb923c" },
//     delivered: { bg: "#eff6ff", color: "#1d4ed8", dot: "#60a5fa" },
//     cancelled: { bg: "#fff1f2", color: "#be123c", dot: "#fb7185" },
//   };
//   const sc = statusMap[order.status?.toLowerCase()] || statusMap.pending;

//   const addr = order.customer?.address || {};
//   const addrFull = [addr.street, addr.city, addr.state, addr.pincode]
//     .filter(Boolean).join(", ");

//   /* ── Shared Styles ── */
//   const lbl      = { fontSize: 10, color: "#94a3b8", marginBottom: 2 };
//   const val      = { fontSize: 12, fontWeight: 500, color: "#0f172a", lineHeight: 1.5 };
//   const divider  = { border: "none", borderTop: "0.5px solid #e2e8f0", margin: "14px 0" };
//   const secLabel = {
//     fontSize: 9, fontWeight: 600, letterSpacing: "1.5px",
//     textTransform: "uppercase", color: "#64748b", marginBottom: 8,
//   };

//   const th = {
//     padding: "6px 5px",
//     fontSize: 9,
//     fontWeight: 600,
//     letterSpacing: "0.8px",
//     textTransform: "uppercase",
//     color: "#64748b",
//     borderBottom: "0.5px solid #e2e8f0",
//     background: "#f8fafc",
//     WebkitPrintColorAdjust: "exact",
//     printColorAdjust: "exact",
//     whiteSpace: "nowrap",
//   };
//   const td  = {
//     padding: "7px 5px",
//     fontSize: 11,
//     color: "#0f172a",
//     borderBottom: "0.5px solid #f1f5f9",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     whiteSpace: "nowrap",
//   };
//   const tdR = { ...td, textAlign: "right", fontFamily: "monospace", fontSize: 10.5 };
//   const thR = { ...th, textAlign: "right" };

//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         body { background: #f1f5f9; }

//         @page {
//           size: A4;
//           margin: 10mm 8mm;
//         }

//         @media print {
//           .no-print { display: none !important; }

//           html, body {
//             background: #fff !important;
//             margin: 0 !important;
//             padding: 0 !important;
//             width: 100% !important;
//           }

//           .invoice-wrapper {
//             padding: 0 !important;
//             background: #fff !important;
//             display: block !important;
//             width: 100% !important;
//           }

//           .invoice-card {
//             width: 100% !important;
//             max-width: 100% !important;
//             border: none !important;
//             border-radius: 0 !important;
//             box-shadow: none !important;
//             overflow: visible !important;
//           }

//           * {
//             -webkit-print-color-adjust: exact !important;
//             print-color-adjust: exact !important;
//             color-adjust: exact !important;
//           }

//           .item-table-wrap {
//             overflow: visible !important;
//             width: 100% !important;
//           }
//           .item-table-wrap table {
//             min-width: unset !important;
//             width: 100% !important;
//             table-layout: auto !important;
//             font-size: 7.5pt !important;
//           }
//           .item-table-wrap table th,
//           .item-table-wrap table td {
//             font-size: 7.5pt !important;
//             padding: 4px 3px !important;
//             white-space: normal !important;
//             word-break: break-word !important;
//           }

//           .hsn-table-wrap {
//             overflow: visible !important;
//             width: 100% !important;
//           }
//           .hsn-table-wrap table {
//             min-width: unset !important;
//             width: 100% !important;
//             table-layout: auto !important;
//             font-size: 7.5pt !important;
//           }
//           .hsn-table-wrap table th,
//           .hsn-table-wrap table td {
//             font-size: 7.5pt !important;
//             padding: 4px 3px !important;
//           }

//           .invoice-body {
//             padding: 12px 16px !important;
//           }

//           table { page-break-inside: avoid; }
//           tr    { page-break-inside: avoid; }
//         }
//       `}</style>
//                 <div
//   className="no-print"
//   style={{
//     display: "flex",
//     justifyContent: "center",
//     marginBottom: 14,
//   }}
// >
//   <div
//     style={{
//       width: "100%",
//       maxWidth: 900,
//       display: "flex",
//       justifyContent: "flex-start",
//     }}
//   >
//     <button
//       onClick={() => navigate(-1)}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 6,
//         padding: "8px 16px",
//         border: "0.5px solid #cbd5e1",
//         borderRadius: 8,
//         background: "#fff",
//         fontSize: 12,
//         fontWeight: 500,
//         color: "#0f172a",
//         cursor: "pointer",
//         boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//       }}
//       onMouseEnter={(e) => {
//         e.target.style.background = "#f8fafc";
//       }}
//       onMouseLeave={(e) => {
//         e.target.style.background = "#fff";
//       }}
//     >
//       ← Back
//     </button>
//   </div>
// </div>
//       <div
//         className="invoice-wrapper"
//         style={{
//           fontFamily: "'Inter', 'Segoe UI', sans-serif",
//           padding: "24px 12px",
//           minHeight: "100vh",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "flex-start",
//           background: "#f1f5f9",
//         }}
//       >
//         <div
//           className="invoice-card"
//           style={{
//             width: "100%",
//             maxWidth: 900,
//             background: "#fff",
//             border: "0.5px solid #e2e8f0",
//             borderRadius: 12,
//             overflow: "hidden",
//           }}
//         >

//           {/* ── Header ── */}
//           <div style={{
//             background: "#0f172a",
//             padding: "20px 28px",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             flexWrap: "wrap",
//             gap: 12,
//             WebkitPrintColorAdjust: "exact",
//             printColorAdjust: "exact",
//           }}>
//             <div>
//               <div style={{ fontSize: 22, fontWeight: 500, color: "#f8fafc", letterSpacing: 2 }}>
//                 INVOICE
//               </div>
//               <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontFamily: "monospace" }}>
//                 {order.invoiceNo} · {fD(order.createdAt)}
//               </div>
//             </div>
//             <div style={{ textAlign: "right" }}>
//               <div style={{ fontSize: 14, fontWeight: 500, color: "#f8fafc" }}>
//                 {order.vendor?.name}
//               </div>
//               <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, lineHeight: 1.6 }}>
//                 {order.vendor?.email}<br />{order.vendor?.phone}
//               </div>
//             </div>
//           </div>

//           {/* Amber stripe */}
//           <div style={{
//             height: 3,
//             background: "#f59e0b",
//             WebkitPrintColorAdjust: "exact",
//             printColorAdjust: "exact",
//           }} />

//           {/* ── Body ── */}
//           <div className="invoice-body" style={{ padding: "20px 28px" }}>

//             {/* Vendor Details */}
//             <div style={secLabel}>Vendor Details</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 10 }}>
//               <div><div style={lbl}>Company</div><div style={val}>{order.vendor?.name}</div></div>
//               <div><div style={lbl}>GSTIN</div><div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{order.vendor?.gstin}</div></div>
//               <div><div style={lbl}>Contact</div><div style={val}>{order.vendor?.phone}</div></div>
//               <div><div style={lbl}>Address</div><div style={val}>{order.vendor?.address}</div></div>
//             </div>

//             <hr style={divider} />

//             {/* Customer Details */}
//             <div style={secLabel}>Customer Details</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 10 }}>
//               <div><div style={lbl}>Name</div><div style={val}>{order.customer?.name}</div></div>
//               <div><div style={lbl}>GSTIN</div><div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{order.customer?.gstin || "—"}</div></div>
//               <div><div style={lbl}>Phone</div><div style={val}>{order.customer?.phone}</div></div>
//               <div><div style={lbl}>Shipping Address</div><div style={val}>{addrFull}</div></div>
//             </div>

//             <hr style={divider} />
    
//             {/* Order & Invoice Details */}
//             <div style={secLabel}>Order & Invoice Details</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 14 }}>
//               <div>
//                 <div style={lbl}>Invoice No.</div>
//                 <div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{order.invoiceNo}</div>
//               </div>
//               <div><div style={lbl}>Invoice Date</div><div style={val}>{fD(order.createdAt)}</div></div>
//               <div><div style={lbl}>Due Date</div><div style={val}>{order.dueDate ? fD(order.dueDate) : "—"}</div></div>
//               <div><div style={lbl}>Payment Mode</div><div style={val}>{order.paymentMode}</div></div>
//               <div>
//                 <div style={lbl}>Status</div>
//                 <div style={{
//                   display: "inline-flex", alignItems: "center", gap: 5,
//                   padding: "2px 9px", borderRadius: 999,
//                   background: sc.bg, color: sc.color,
//                   fontSize: 11, fontWeight: 500,
//                   WebkitPrintColorAdjust: "exact",
//                   printColorAdjust: "exact",
//                 }}>
//                   <span style={{
//                     width: 6, height: 6, borderRadius: "50%", background: sc.dot,
//                     WebkitPrintColorAdjust: "exact",
//                     printColorAdjust: "exact",
//                   }} />
//                   {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
//                 </div>
//               </div>
//               <div><div style={lbl}>Total Items</div><div style={val}>{order.items?.length || 0}</div></div>
//             </div>

//             <hr style={divider} />

//             {/* ── Item Table ── */}
//             <div style={secLabel}>Item Table</div>
//             <div className="item-table-wrap" style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", tableLayout: "fixed" }}>
//                 <colgroup>
//                   <col style={{ width: 24 }} />
//                   <col style={{ width: "16%" }} />
//                   <col style={{ width: "7%" }} />
//                   <col style={{ width: "7%" }} />
//                   <col style={{ width: "5%" }} />
//                   <col style={{ width: "5%" }} />
//                   <col style={{ width: "5%" }} />
//                   <col style={{ width: "9%" }} />
//                   <col style={{ width: "8%" }} />
//                   <col style={{ width: "9%" }} />
//                   <col style={{ width: "7%" }} />
//                   <col style={{ width: "7%" }} />
//                   <col style={{ width: "8%" }} />
//                 </colgroup>
//                 <thead>
//                   <tr>
//                     <th style={th}>#</th>
//                     <th style={th}>Item Name</th>
//                     <th style={thR}>MRP</th>
//                     <th style={th}>HSN</th>
//                     <th style={th}>GST%</th>
//                     <th style={thR}>Qty</th>
//                     <th style={th}>Unit</th>
//                     <th style={th}>Packing</th>
//                     <th style={thR}>Rate (Incl.)</th>
//                     <th style={thR}>Taxable</th>
//                     <th style={thR}>CGST</th>
//                     <th style={thR}>SGST</th>
//                     <th style={thR}>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {calcItems.map((it, i) => (
//                     <tr
//                       key={i}
//                       style={{
//                         background: i % 2 === 0 ? "#fff" : "#fafafa",
//                         WebkitPrintColorAdjust: "exact",
//                         printColorAdjust: "exact",
//                       }}
//                     >
//                       <td style={td}>{i + 1}</td>
//                       <td style={{ ...td, fontWeight: 500 }} title={it.name}>{it.name}</td>
//                       <td style={tdR}>{fN(it.mrp)}</td>
//                       <td style={{ ...td, fontFamily: "monospace", fontSize: 10.5 }}>{it.hsn || "N/A"}</td>
//                       <td style={td}>{it.gstRate}%</td>
//                       <td style={tdR}>{it.quantity}</td>
//                       <td style={td}>{it.unit || "pcs"}</td>
//                       <td style={{ ...td, fontSize: 10.5, color: "#64748b" }}>{it.packagingText || it.packing || "—"}</td>
//                       <td style={tdR}>{fN(it.rate)}</td>
//                       <td style={tdR}>{fN(it.taxable, 3)}</td>
//                       <td style={tdR}>{fN(it.cgst, 3)}</td>
//                       <td style={tdR}>{fN(it.sgst, 3)}</td>
//                       <td style={{ ...tdR, fontWeight: 600 }}>{fN(it.total, 2)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <hr style={divider} />

//             {/* ── HSN GST Summary ── */}
//             <div style={secLabel}>Cumulative HSN-Wise GST Summary</div>
//             <div className="hsn-table-wrap" style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", minWidth: 580, borderCollapse: "collapse", tableLayout: "fixed" }}>
//                 <colgroup>
//                   <col style={{ width: "10%" }} />
//                   <col style={{ width: "18%" }} />
//                   <col style={{ width: "14%" }} />
//                   <col style={{ width: "14%" }} />
//                   <col style={{ width: "10%" }} />
//                   <col style={{ width: "16%" }} />
//                   <col />
//                 </colgroup>
//                 <thead>
//                   <tr>
//                     <th style={th}>HSN</th>
//                     <th style={thR}>Taxable Amt</th>
//                     <th style={thR}>SGST</th>
//                     <th style={thR}>CGST</th>
//                     <th style={thR}>CESS</th>
//                     <th style={thR}>Total Amt</th>
//                     <th style={th}>Remark</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Object.entries(hsnMap).map(([hsn, v]) => (
//                     <tr key={hsn}>
//                       <td style={{ ...td, fontFamily: "monospace", fontSize: 10.5 }}>{hsn}</td>
//                       <td style={tdR}>{fN(v.taxable, 2)}</td>
//                       <td style={tdR}>{fN(v.sgst, 3)}</td>
//                       <td style={tdR}>{fN(v.cgst, 3)}</td>
//                       <td style={tdR}>{fN(v.cess, 3)}</td>
//                       <td style={{ ...tdR, fontWeight: 600 }}>{fN(v.total, 2)}</td>
//                       <td style={{ ...td, fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>
//                         All HSN {hsn} cumulative
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* ── Totals ── */}
//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
//               <div style={{ minWidth: 260 }}>

//                 {/* Subtotal */}
//                 <div style={{
//                   display: "flex", justifyContent: "space-between",
//                   padding: "4px 0", fontSize: 12, color: "#64748b",
//                 }}>
//                   <span>Subtotal (Taxable)</span>
//                   <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#0f172a" }}>
//                     {fC(totalTaxable, 2)}
//                   </span>
//                 </div>

//                 {/* CGST */}
//                 <div style={{
//                   display: "flex", justifyContent: "space-between",
//                   padding: "4px 0", fontSize: 12, color: "#64748b",
//                 }}>
//                   <span>CGST</span>
//                   <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#0f172a" }}>
//                     {fC(totalGST / 2, 2)}
//                   </span>
//                 </div>

//                 {/* SGST */}
//                 <div style={{
//                   display: "flex", justifyContent: "space-between",
//                   padding: "4px 0", fontSize: 12, color: "#64748b",
//                 }}>
//                   <span>SGST</span>
//                   <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#0f172a" }}>
//                     {fC(totalGST / 2, 2)}
//                   </span>
//                 </div>

//                 {/* CESS (only if exists) */}
//                 {totalCess > 0 && (
//                   <div style={{
//                     display: "flex", justifyContent: "space-between",
//                     padding: "4px 0", fontSize: 12, color: "#64748b",
//                   }}>
//                     <span>CESS</span>
//                     <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#0f172a" }}>
//                       {fC(totalCess, 2)}
//                     </span>
//                   </div>
//                 )}

//                 {/* Total GST */}
//                 <div style={{
//                   display: "flex", justifyContent: "space-between",
//                   padding: "4px 0", fontSize: 12, color: "#64748b",
//                 }}>
//                   <span>Total GST (Incl. in price)</span>
//                   <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#0f172a" }}>
//                     {fC(totalGST + totalCess, 2)}
//                   </span>
//                 </div>

//                 {/* Delivery */}
//                 <div style={{
//                   display: "flex", justifyContent: "space-between",
//                   padding: "4px 0", fontSize: 12, color: "#64748b",
//                 }}>
//                   <span>Delivery</span>
//                   <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 500 }}>Free</span>
//                 </div>

//                 {/* Coupon discount (only if applied) */}
//                 {couponDiscount > 0 && (
//                   <div style={{
//                     display: "flex", justifyContent: "space-between",
//                     padding: "4px 0", fontSize: 12, color: "#64748b",
//                   }}>
//                     <span>
//                       Coupon
//                       {order.couponCode
//                         ? <span style={{ marginLeft: 4, fontFamily: "monospace", fontSize: 10, background: "#f0fdf4", color: "#16a34a", padding: "1px 6px", borderRadius: 4 }}>
//                             {order.couponCode}
//                           </span>
//                         : null}
//                     </span>
//                     <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#16a34a" }}>
//                       − {fC(couponDiscount, 2)}
//                     </span>
//                   </div>
//                 )}

//                 {/* Grand Total */}
//                 <div style={{
//                   display: "flex", justifyContent: "space-between",
//                   padding: "10px 0 0", marginTop: 6,
//                   borderTop: "1.5px solid #0f172a",
//                   fontSize: 14, fontWeight: 600, color: "#0f172a",
//                 }}>
//                   <span>Grand Total</span>
//                   <span style={{ fontFamily: "monospace", color: "#b45309" }}>
//                     {fC(effectiveTotal, 2)}
//                   </span>
//                 </div>

//                 {/* GST note */}
//                 <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 6, textAlign: "right", fontStyle: "italic" }}>
//                   * All prices are GST-inclusive
//                 </div>

//               </div>
//             </div>

//           </div>

//           {/* ── Footer ── */}
//           <div style={{
//             padding: "12px 28px",
//             borderTop: "0.5px solid #e2e8f0",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             background: "#f8fafc",
//             flexWrap: "wrap",
//             gap: 8,
//             WebkitPrintColorAdjust: "exact",
//             printColorAdjust: "exact",
//           }}>
//             <span style={{ fontSize: 11, color: "#94a3b8" }}>
//               Thank you for your business · {order.vendor?.name} © {new Date().getFullYear()}
//             </span>
//             <button
//               className="no-print"
//               onClick={() => window.print()}
//               style={{
//                 padding: "6px 16px",
//                 border: "0.5px solid #cbd5e1",
//                 borderRadius: 8,
//                 background: "transparent",
//                 fontSize: 11,
//                 fontWeight: 500,
//                 color: "#0f172a",
//                 cursor: "pointer",
//               }}
//               onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
//               onMouseLeave={(e) => (e.target.style.background = "transparent")}
//             >
//               Print Invoice
//             </button>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const fD = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

const fN = (n, d = 2) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const fC = (n, d = 2) => "₹" + fN(n, d);

export default function InvoicePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        justifyContent: "center", alignItems: "center", background: "#f1f5f9",
      }}>
        <div style={{
          background: "#fff", border: "0.5px solid #e2e8f0",
          borderRadius: 12, padding: "40px 48px", textAlign: "center",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
            No Order Found
          </h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            Please navigate from your orders page.
          </p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     FIX: lineTotal = unitPrice × quantity
     Old code used "it.price" which was always undefined → ₹0
  ───────────────────────────────────────────────────────── */
  const calcItems = (order.items || []).map((it) => {
    const unitPrice = Number(it.unitPrice || it.rate || 0);
    const quantity  = Number(it.quantity  || 1);
    const gstRate   = Number(it.gstRate   || 0);
    const cessRate  = Number(it.cess      || 0);
    const mrp       = Number(it.mrp       || unitPrice);

    // GST-inclusive line total
    const lineTotal = unitPrice * quantity;

    // Back-calculate taxable from GST-inclusive price
    const divisor  = 1 + gstRate / 100 + cessRate / 100;
    const taxable  = divisor > 0 ? lineTotal / divisor : lineTotal;
    const gstAmt   = taxable * (gstRate  / 100);
    const cessAmt  = taxable * (cessRate / 100);
    const totalGst = gstAmt + cessAmt;

    return {
      ...it,
      packing:       it.packagingText || it.packing || "—",
      packagingText: it.packagingText || it.packing || "—",
      rate:     unitPrice,
      mrp,
      gstRate,
      cessRate,
      taxable,
      gst:      gstAmt,
      cess:     cessAmt,
      sgst:     gstAmt / 2,
      cgst:     gstAmt / 2,
      totalGst,
      total:    lineTotal,
    };
  });

  /* ── HSN Summary ── */
  const hsnMap = {};
  calcItems.forEach((it) => {
    const key = it.hsn || "N/A";
    if (!hsnMap[key]) hsnMap[key] = { taxable: 0, sgst: 0, cgst: 0, cess: 0, total: 0 };
    hsnMap[key].taxable += it.taxable;
    hsnMap[key].sgst    += it.sgst;
    hsnMap[key].cgst    += it.cgst;
    hsnMap[key].cess    += it.cess;
    hsnMap[key].total   += it.total;
  });

  const grandTotal   = calcItems.reduce((s, i) => s + i.total,    0);
  const totalTaxable = calcItems.reduce((s, i) => s + i.taxable,  0);
  const totalGST     = calcItems.reduce((s, i) => s + i.totalGst, 0);
  const totalCess    = calcItems.reduce((s, i) => s + i.cess,     0);

  const effectiveTotal = order.finalPrice ?? grandTotal;
  const couponDiscount = order.couponDiscount || 0;

  const statusMap = {
    pending:   { bg: "#fff7ed", color: "#c2410c", dot: "#fb923c" },
    confirmed: { bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
    placed:    { bg: "#fff7ed", color: "#c2410c", dot: "#fb923c" },
    delivered: { bg: "#eff6ff", color: "#1d4ed8", dot: "#60a5fa" },
    cancelled: { bg: "#fff1f2", color: "#be123c", dot: "#fb7185" },
    shipped:   { bg: "#f5f3ff", color: "#6d28d9", dot: "#8b5cf6" },
    accepted:  { bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
  };
  const sc = statusMap[order.status?.toLowerCase()] || statusMap.pending;

  const addr = order.customer?.address || {};
  const addrFull = [addr.name, addr.street, addr.city, addr.state, addr.pincode]
    .filter(Boolean).join(", ");

  /* ── Shared Styles ── */
  const lbl      = { fontSize: 10, color: "#94a3b8", marginBottom: 2 };
  const val      = { fontSize: 12, fontWeight: 500, color: "#0f172a", lineHeight: 1.5 };
  const divider  = { border: "none", borderTop: "0.5px solid #e2e8f0", margin: "14px 0" };
  const secLabel = {
    fontSize: 9, fontWeight: 600, letterSpacing: "1.5px",
    textTransform: "uppercase", color: "#64748b", marginBottom: 8,
  };
  const th = {
    padding: "6px 5px", fontSize: 9, fontWeight: 600, letterSpacing: "0.8px",
    textTransform: "uppercase", color: "#64748b",
    borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc", whiteSpace: "nowrap",
    WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
  };
  const td = {
    padding: "7px 5px", fontSize: 11, color: "#0f172a",
    borderBottom: "0.5px solid #f1f5f9",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  };
  const tdR = { ...td,  textAlign: "right", fontFamily: "monospace", fontSize: 10.5 };
  const thR = { ...th,  textAlign: "right" };

  /* ── PRINT: opens clean blank window (no sidebar) ── */
  const handlePrint = () => {
    const invoiceEl = document.querySelector(".invoice-card");
    if (!invoiceEl) return;
    const newWin = window.open("", "_blank", "width=1000,height=800");
    newWin.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <title>Invoice - ${order.invoiceNo}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#fff;font-family:'Segoe UI','Inter',sans-serif}
      @page{size:A4;margin:10mm 8mm}
      @media print{
        *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
        .item-table-wrap{overflow:visible!important;width:100%!important}
        .item-table-wrap table{min-width:unset!important;width:100%!important;table-layout:auto!important;font-size:7.5pt!important}
        .item-table-wrap table th,.item-table-wrap table td{font-size:7.5pt!important;padding:4px 3px!important;white-space:normal!important;word-break:break-word!important}
        .hsn-table-wrap{overflow:visible!important;width:100%!important}
        .hsn-table-wrap table{min-width:unset!important;width:100%!important;table-layout:auto!important;font-size:7.5pt!important}
        .hsn-table-wrap table th,.hsn-table-wrap table td{font-size:7.5pt!important;padding:4px 3px!important}
        table{page-break-inside:avoid}tr{page-break-inside:avoid}
      }
    </style>
  </head>
  <body>${invoiceEl.outerHTML}</body>
</html>`);
    newWin.document.close();
    newWin.focus();
    setTimeout(() => { newWin.print(); newWin.close(); }, 500);
  };

  return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#f1f5f9}`}</style>

      {/* Back Button */}
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 12px 0" }}>
        <div style={{ width: "100%", maxWidth: 900, display: "flex", justifyContent: "flex-start" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", border: "0.5px solid #cbd5e1", borderRadius: 8,
              background: "#fff", fontSize: 12, fontWeight: 500, color: "#0f172a",
              cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,.05)",
            }}
          >← Back</button>
        </div>
      </div>

      <div style={{
        fontFamily: "'Inter','Segoe UI',sans-serif",
        padding: "16px 12px 40px", minHeight: "100vh",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        background: "#f1f5f9",
      }}>

        {/* ══ INVOICE CARD — only this element gets sent to print ══ */}
        <div className="invoice-card" style={{
          width: "100%", maxWidth: 900,
          background: "#fff", border: "0.5px solid #e2e8f0",
          borderRadius: 12, overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            background: "#0f172a", padding: "20px 28px",
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", flexWrap: "wrap", gap: 12,
            WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 500, color: "#f8fafc", letterSpacing: 2 }}>INVOICE</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontFamily: "monospace" }}>
                {order.invoiceNo} · {fD(order.createdAt)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#f8fafc" }}>{order.vendor?.name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, lineHeight: 1.6 }}>
                {order.vendor?.email && <>{order.vendor.email}<br /></>}
                {order.vendor?.phone}
              </div>
            </div>
          </div>

          {/* Amber stripe */}
          <div style={{ height: 3, background: "#f59e0b", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />

          {/* Body */}
          <div style={{ padding: "20px 28px" }}>

            {/* Vendor Details */}
            <div style={secLabel}>Vendor Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 10 }}>
              <div><div style={lbl}>Company</div><div style={val}>{order.vendor?.name || "—"}</div></div>
              <div><div style={lbl}>GSTIN</div><div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{order.vendor?.gstin || "—"}</div></div>
              <div><div style={lbl}>Contact</div><div style={val}>{order.vendor?.phone || "—"}</div></div>
              <div><div style={lbl}>Address</div><div style={val}>{order.vendor?.address || "—"}</div></div>
            </div>

            <hr style={divider} />

            {/* Customer Details */}
            <div style={secLabel}>Customer Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 10 }}>
              <div><div style={lbl}>Name</div><div style={val}>{order.customer?.name || "—"}</div></div>
              <div><div style={lbl}>GSTIN</div><div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{order.customer?.gstin || "—"}</div></div>
              <div><div style={lbl}>Phone</div><div style={val}>{order.customer?.phone || "—"}</div></div>
              <div><div style={lbl}>Shipping Address</div><div style={{ ...val, fontSize: 11 }}>{addrFull || "—"}</div></div>
            </div>

            <hr style={divider} />

            {/* Order & Invoice Details */}
            <div style={secLabel}>Order & Invoice Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={lbl}>Invoice No.</div>
                <div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{order.invoiceNo}</div>
              </div>
              <div><div style={lbl}>Invoice Date</div><div style={val}>{fD(order.createdAt)}</div></div>
              <div><div style={lbl}>Due Date</div><div style={val}>{order.dueDate ? fD(order.dueDate) : "—"}</div></div>
              <div><div style={lbl}>Payment Mode</div><div style={val}>{order.paymentMode || "—"}</div></div>
              <div>
                <div style={lbl}>Status</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "2px 9px", borderRadius: 999,
                  background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 500,
                  WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </div>
              </div>
              <div><div style={lbl}>Total Items</div><div style={val}>{order.items?.length || 0}</div></div>
            </div>

            <hr style={divider} />

            {/* Item Table */}
            <div style={secLabel}>Item Table</div>
            <div className="item-table-wrap" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 820, borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 24 }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "8%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={th}>#</th>
                    <th style={th}>Item Name</th>
                    <th style={thR}>MRP</th>
                    <th style={th}>HSN</th>
                    <th style={th}>GST%</th>
                    <th style={thR}>Qty</th>
                    <th style={th}>Unit</th>
                    <th style={th}>Packing</th>
                    <th style={thR}>Rate (Incl.)</th>
                    <th style={thR}>Taxable</th>
                    <th style={thR}>CGST</th>
                    <th style={thR}>SGST</th>
                    <th style={thR}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {calcItems.map((it, i) => (
                    <tr key={i} style={{
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                      WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
                    }}>
                      <td style={td}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: 500 }} title={it.name}>{it.name}</td>
                      <td style={tdR}>{fN(it.mrp)}</td>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 10.5 }}>{it.hsn || "N/A"}</td>
                      <td style={td}>{it.gstRate}%</td>
                      <td style={tdR}>{it.quantity}</td>
                      <td style={td}>{it.unit || "pcs"}</td>
                      <td style={{ ...td, fontSize: 10.5, color: "#64748b" }}>{it.packagingText || it.packing || "—"}</td>
                      <td style={tdR}>{fN(it.rate)}</td>
                      <td style={tdR}>{fN(it.taxable, 3)}</td>
                      <td style={tdR}>{fN(it.cgst, 3)}</td>
                      <td style={tdR}>{fN(it.sgst, 3)}</td>
                      <td style={{ ...tdR, fontWeight: 600 }}>{fN(it.total, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr style={divider} />

            {/* HSN GST Summary */}
            <div style={secLabel}>Cumulative HSN-Wise GST Summary</div>
            <div className="hsn-table-wrap" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 580, borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th style={th}>HSN</th>
                    <th style={thR}>Taxable Amt</th>
                    <th style={thR}>SGST</th>
                    <th style={thR}>CGST</th>
                    <th style={thR}>CESS</th>
                    <th style={thR}>Total Amt</th>
                    <th style={th}>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(hsnMap).map(([hsn, v]) => (
                    <tr key={hsn}>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 10.5 }}>{hsn}</td>
                      <td style={tdR}>{fN(v.taxable, 2)}</td>
                      <td style={tdR}>{fN(v.sgst, 3)}</td>
                      <td style={tdR}>{fN(v.cgst, 3)}</td>
                      <td style={tdR}>{fN(v.cess, 3)}</td>
                      <td style={{ ...tdR, fontWeight: 600 }}>{fN(v.total, 2)}</td>
                      <td style={{ ...td, fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>
                        All HSN {hsn} cumulative
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <div style={{ minWidth: 280 }}>

                {[
                  { label: "Subtotal (Taxable)",        value: fC(totalTaxable, 2) },
                  { label: "CGST",                      value: fC(totalGST / 2, 2) },
                  { label: "SGST",                      value: fC(totalGST / 2, 2) },
                  ...(totalCess > 0 ? [{ label: "CESS", value: fC(totalCess, 2) }] : []),
                  { label: "Total GST (Incl. in price)", value: fC(totalGST + totalCess, 2) },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "4px 0", fontSize: 12, color: "#64748b",
                  }}>
                    <span>{row.label}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#0f172a" }}>{row.value}</span>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#64748b" }}>
                  <span>Delivery</span>
                  <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 500 }}>Free</span>
                </div>

                {couponDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#64748b" }}>
                    <span>
                      Coupon
                      {order.couponCode && (
                        <span style={{ marginLeft: 4, fontFamily: "monospace", fontSize: 10, background: "#f0fdf4", color: "#16a34a", padding: "1px 6px", borderRadius: 4 }}>
                          {order.couponCode}
                        </span>
                      )}
                    </span>
                    <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#16a34a" }}>− {fC(couponDiscount, 2)}</span>
                  </div>
                )}

                {/* Grand Total */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0 0", marginTop: 6,
                  borderTop: "1.5px solid #0f172a",
                  fontSize: 15, fontWeight: 700, color: "#0f172a",
                }}>
                  <span>Grand Total</span>
                  <span style={{ fontFamily: "monospace", color: "#b45309", fontSize: 16 }}>{fC(effectiveTotal, 2)}</span>
                </div>

                <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 6, textAlign: "right", fontStyle: "italic" }}>
                  * All prices are GST-inclusive
                </div>
              </div>
            </div>

          </div>{/* /body */}

          {/* Footer */}
          <div style={{
            padding: "12px 28px", borderTop: "0.5px solid #e2e8f0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#f8fafc", flexWrap: "wrap", gap: 8,
            WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
          }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Thank you for your business · {order.vendor?.name} © {new Date().getFullYear()}
            </span>
            <button
              onClick={handlePrint}
              style={{
                padding: "6px 16px", border: "none", borderRadius: 8,
                background: "#0f172a", fontSize: 11, fontWeight: 600,
                color: "#fff", cursor: "pointer",
              }}
            >🖨️ Print Invoice</button>
          </div>

        </div>{/* /invoice-card */}
      </div>
    </>
  );
}