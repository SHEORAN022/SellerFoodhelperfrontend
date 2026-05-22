// import React from "react";
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

// /* ── Packing Sort ── */
// const getPackingKey = (packing) => {
//   const str = (packing || "").toString().trim();
//   if (str === "—" || str === "") return "\uffff";
//   const cleaned = str.replace(/^(\d+\s+)+/, "").trim();
//   return cleaned.toLowerCase();
// };

// const packingSort = (a, b) => {
//   const kA = getPackingKey(a.packing);
//   const kB = getPackingKey(b.packing);
//   return kA.localeCompare(kB, "en", { sensitivity: "base" });
// };

// export default function InvoicePage() {
//   const navigate = useNavigate();
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

//   /* ── Use invoiceNo exactly as passed from VendorOrders ── */
//   const invoiceNo = order.invoiceNo || "";

//   const calcItems = (order.items || []).map((it) => {
//     const unitPrice = Number(it.unitPrice || it.rate || 0);
//     const quantity  = Number(it.quantity  || 1);
//     const gstRate   = Number(it.gstRate   || 0);
//     const cessRate  = Number(it.cess      || 0);
//     const mrp       = Number(it.mrp       || unitPrice);
//     const lineTotal = unitPrice * quantity;
//     const divisor   = 1 + gstRate / 100 + cessRate / 100;
//     const taxable   = divisor > 0 ? lineTotal / divisor : lineTotal;
//     const gstAmt    = taxable * (gstRate  / 100);
//     const cessAmt   = taxable * (cessRate / 100);
//     const totalGst  = gstAmt + cessAmt;
//     return {
//       ...it,
//       packing:       it.packagingText || it.packing || "—",
//       packagingText: it.packagingText || it.packing || "—",
//       rate: unitPrice, mrp, gstRate, cessRate, taxable,
//       gst: gstAmt, cess: cessAmt, sgst: gstAmt / 2, cgst: gstAmt / 2,
//       totalGst, total: lineTotal,
//     };
//   }).sort(packingSort);

//   const totalItemCount = calcItems.length;

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

//   const grandTotal    = calcItems.reduce((s, i) => s + i.total,    0);
//   const totalTaxable  = calcItems.reduce((s, i) => s + i.taxable,  0);
//   const totalGST      = calcItems.reduce((s, i) => s + i.totalGst, 0);
//   const totalCess     = calcItems.reduce((s, i) => s + i.cess,     0);
//   const effectiveTotal = order.finalPrice ?? grandTotal;
//   const couponDiscount = order.couponDiscount || 0;

//   const statusMap = {
//     pending:   { bg: "#fff7ed", color: "#c2410c", dot: "#fb923c" },
//     confirmed: { bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
//     placed:    { bg: "#fff7ed", color: "#c2410c", dot: "#fb923c" },
//     delivered: { bg: "#eff6ff", color: "#1d4ed8", dot: "#60a5fa" },
//     cancelled: { bg: "#fff1f2", color: "#be123c", dot: "#fb7185" },
//     shipped:   { bg: "#f5f3ff", color: "#6d28d9", dot: "#8b5cf6" },
//     accepted:  { bg: "#f0fdf4", color: "#15803d", dot: "#4ade80" },
//   };
//   const sc = statusMap[order.status?.toLowerCase()] || statusMap.pending;

//   const addr = order.customer?.address || {};
//   const addrFull = [addr.name, addr.street, addr.city, addr.state, addr.pincode]
//     .filter(Boolean).join(", ");

//   const lbl      = { fontSize: 10, color: "#94a3b8", marginBottom: 2 };
//   const val      = { fontSize: 12, fontWeight: 500, color: "#0f172a", lineHeight: 1.5 };
//   const divider  = { border: "none", borderTop: "0.5px solid #e2e8f0", margin: "14px 0" };
//   const secLabel = {
//     fontSize: 9, fontWeight: 600, letterSpacing: "1.5px",
//     textTransform: "uppercase", color: "#64748b", marginBottom: 8,
//   };
//   const th = {
//     padding: "6px 5px", fontSize: 9, fontWeight: 600, letterSpacing: "0.8px",
//     textTransform: "uppercase", color: "#64748b",
//     borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc", whiteSpace: "nowrap",
//   };
//   const td = {
//     padding: "7px 5px", fontSize: 11, color: "#0f172a",
//     borderBottom: "0.5px solid #f1f5f9",
//     overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//   };
//   const tdR = { ...td,  textAlign: "right", fontFamily: "monospace", fontSize: 10.5 };
//   const thR = { ...th,  textAlign: "right" };

//   /* ══════════════════════════════════════════════════
//      PRINT: pure HTML string — invoiceNo used directly
//   ══════════════════════════════════════════════════ */
//   const handlePrint = () => {
//     /* ── rows ── */
//     const itemRows = calcItems.map((it, i) => `
//       <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"}">
//         <td style="padding:5px 4px;text-align:center;border-bottom:0.5px solid #f1f5f9">
//           <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;background:#f1f5f9;border:0.5px solid #e2e8f0;font-size:9pt;font-weight:700;color:#64748b;font-family:monospace">${totalItemCount - i}</span>
//         </td>
//         <td style="padding:5px;font-size:10pt;font-weight:500;color:#0f172a;border-bottom:0.5px solid #f1f5f9;word-break:break-word">${it.name || ""}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.mrp)}</td>
//         <td style="padding:5px;font-size:9pt;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${it.hsn || "N/A"}</td>
//         <td style="padding:5px;font-size:9pt;border-bottom:0.5px solid #f1f5f9">${it.gstRate}%</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${it.quantity}</td>
//         <td style="padding:5px;font-size:9pt;border-bottom:0.5px solid #f1f5f9">${it.unit || "pcs"}</td>
//         <td style="padding:5px;font-size:9pt;color:#64748b;border-bottom:0.5px solid #f1f5f9">${it.packagingText || it.packing || "—"}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.rate)}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.taxable, 3)}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.cgst, 3)}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.sgst, 3)}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;font-weight:600;border-bottom:0.5px solid #f1f5f9">${fN(it.total, 2)}</td>
//       </tr>`).join("");

//     const hsnRows = Object.entries(hsnMap).map(([hsn, v]) => `
//       <tr>
//         <td style="padding:5px;font-size:9pt;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${hsn}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(v.taxable, 2)}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(v.sgst, 3)}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(v.cgst, 3)}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(v.cess, 3)}</td>
//         <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;font-weight:600;border-bottom:0.5px solid #f1f5f9">${fN(v.total, 2)}</td>
//         <td style="padding:5px;font-size:9pt;color:#94a3b8;font-style:italic;border-bottom:0.5px solid #f1f5f9">All HSN ${hsn} cumulative</td>
//       </tr>`).join("");

//     const cessRow = totalCess > 0
//       ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>CESS</span><span style="font-family:monospace">${fC(totalCess, 2)}</span></div>`
//       : "";

//     const couponRow = couponDiscount > 0
//       ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>Coupon ${order.couponCode ? `(${order.couponCode})` : ""}</span><span style="font-family:monospace;color:#16a34a">− ${fC(couponDiscount, 2)}</span></div>`
//       : "";

//     const thStyle  = `padding:5px 4px;font-size:8pt;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;background:#f8fafc;white-space:nowrap`;
//     const thRStyle = `${thStyle};text-align:right`;

//     const html = `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8"/>
//   <title>Invoice - ${invoiceNo}</title>
//   <style>
//     *{box-sizing:border-box;margin:0;padding:0}
//     body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0f172a}
//     @page{size:A4;margin:8mm 8mm}
//     @media print{
//       *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
//       table{page-break-inside:avoid}
//       tr{page-break-inside:avoid}
//     }
//   </style>
// </head>
// <body>

// <!-- HEADER -->
// <div style="background:#0f172a;padding:16px 24px;display:flex;justify-content:space-between;align-items:flex-start;-webkit-print-color-adjust:exact;print-color-adjust:exact">
//   <div>
//     <div style="font-size:20pt;font-weight:500;color:#f8fafc;letter-spacing:2px">INVOICE</div>
//     <div style="font-size:9pt;color:#94a3b8;margin-top:3px;font-family:monospace">${invoiceNo} · ${fD(order.createdAt)}</div>
//   </div>
//   <div style="text-align:right">
//     <div style="font-size:13pt;font-weight:500;color:#f8fafc">${order.vendor?.name || ""}</div>
//     <div style="font-size:9pt;color:#94a3b8;margin-top:3px;line-height:1.6">
//       ${order.vendor?.email ? order.vendor.email + "<br/>" : ""}
//       ${order.vendor?.phone || ""}
//     </div>
//   </div>
// </div>

// <!-- AMBER STRIPE -->
// <div style="height:3px;background:#f59e0b;-webkit-print-color-adjust:exact;print-color-adjust:exact"></div>

// <!-- BODY -->
// <div style="padding:16px 24px">

//   <!-- Vendor Details -->
//   <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Vendor Details</div>
//   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Company</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.vendor?.name || "—"}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">GSTIN</div><div style="font-size:10pt;font-weight:500;color:#0f172a;font-family:monospace">${order.vendor?.gstin || "—"}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Contact</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.vendor?.phone || "—"}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Address</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.vendor?.address || "—"}</div></div>
//   </div>

//   <hr style="border:none;border-top:0.5px solid #e2e8f0;margin:12px 0"/>

//   <!-- Customer Details -->
//   <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Customer Details</div>
//   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Name</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.customer?.name || "—"}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">GSTIN</div><div style="font-size:10pt;font-weight:500;color:#0f172a;font-family:monospace">${order.customer?.gstin || "—"}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Phone</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.customer?.phone || "—"}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Shipping Address</div><div style="font-size:10pt;font-weight:500;color:#0f172a">${addrFull || "—"}</div></div>
//   </div>

//   <hr style="border:none;border-top:0.5px solid #e2e8f0;margin:12px 0"/>

//   <!-- Order & Invoice Details -->
//   <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Order & Invoice Details</div>
//   <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-bottom:12px">
//     <div>
//       <div style="font-size:9pt;color:#94a3b8;margin-bottom:4px">Sr. No.</div>
//       <div style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#0f172a;color:#f8fafc;font-size:13pt;font-weight:800;font-family:monospace;-webkit-print-color-adjust:exact;print-color-adjust:exact">${order.sno ?? "—"}</div>
//     </div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Invoice No.</div><div style="font-size:10pt;font-weight:500;color:#0f172a;font-family:monospace">${invoiceNo}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Invoice Date</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${fD(order.createdAt)}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Due Date</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.dueDate ? fD(order.dueDate) : "—"}</div></div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Payment Mode</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.paymentMode || "—"}</div></div>
//     <div>
//       <div style="font-size:9pt;color:#94a3b8;margin-bottom:4px">Status</div>
//       <div style="display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:999px;background:${sc.bg};color:${sc.color};font-size:10pt;font-weight:500;-webkit-print-color-adjust:exact;print-color-adjust:exact">
//         <span style="width:6px;height:6px;border-radius:50%;background:${sc.dot};display:inline-block;-webkit-print-color-adjust:exact;print-color-adjust:exact"></span>
//         ${(order.status || "").charAt(0).toUpperCase() + (order.status || "").slice(1)}
//       </div>
//     </div>
//     <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Total Items</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.items?.length || 0}</div></div>
//   </div>

//   <hr style="border:none;border-top:0.5px solid #e2e8f0;margin:12px 0"/>

//   <!-- Item Table -->
//   <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Item Table</div>
//   <table style="width:100%;border-collapse:collapse;table-layout:auto;font-size:8pt">
//     <thead>
//       <tr>
//         <th style="${thStyle};text-align:center">#</th>
//         <th style="${thStyle}">Item Name</th>
//         <th style="${thRStyle}">MRP</th>
//         <th style="${thStyle}">HSN</th>
//         <th style="${thStyle}">GST%</th>
//         <th style="${thRStyle}">Qty</th>
//         <th style="${thStyle}">Unit</th>
//         <th style="${thStyle}">Packing</th>
//         <th style="${thRStyle}">Rate (Incl.)</th>
//         <th style="${thRStyle}">Taxable</th>
//         <th style="${thRStyle}">CGST</th>
//         <th style="${thRStyle}">SGST</th>
//         <th style="${thRStyle}">Total</th>
//       </tr>
//     </thead>
//     <tbody>${itemRows}</tbody>
//   </table>

//   <hr style="border:none;border-top:0.5px solid #e2e8f0;margin:12px 0"/>

//   <!-- HSN Summary -->
//   <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Cumulative HSN-Wise GST Summary</div>
//   <table style="width:100%;border-collapse:collapse;table-layout:auto;font-size:8pt">
//     <thead>
//       <tr>
//         <th style="${thStyle}">HSN</th>
//         <th style="${thRStyle}">Taxable Amt</th>
//         <th style="${thRStyle}">SGST</th>
//         <th style="${thRStyle}">CGST</th>
//         <th style="${thRStyle}">CESS</th>
//         <th style="${thRStyle}">Total Amt</th>
//         <th style="${thStyle}">Remark</th>
//       </tr>
//     </thead>
//     <tbody>${hsnRows}</tbody>
//   </table>

//   <!-- Totals -->
//   <div style="display:flex;justify-content:flex-end;margin-top:14px">
//     <div style="min-width:280px">
//       <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>Subtotal (Taxable)</span><span style="font-family:monospace;color:#0f172a">${fC(totalTaxable, 2)}</span></div>
//       <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>CGST</span><span style="font-family:monospace;color:#0f172a">${fC(totalGST / 2, 2)}</span></div>
//       <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>SGST</span><span style="font-family:monospace;color:#0f172a">${fC(totalGST / 2, 2)}</span></div>
//       ${cessRow}
//       <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>Total GST (Incl. in price)</span><span style="font-family:monospace;color:#0f172a">${fC(totalGST + totalCess, 2)}</span></div>
//       <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>Delivery</span><span style="color:#16a34a;font-weight:500">Free</span></div>
//       ${couponRow}
//       <div style="display:flex;justify-content:space-between;padding:8px 0 0;margin-top:5px;border-top:1.5px solid #0f172a;font-size:14pt;font-weight:700;color:#0f172a">
//         <span>Grand Total</span>
//         <span style="font-family:monospace;color:#b45309;font-size:15pt">${fC(effectiveTotal, 2)}</span>
//       </div>
//       <div style="font-size:8pt;color:#94a3b8;margin-top:5px;text-align:right;font-style:italic">* All prices are GST-inclusive</div>
//     </div>
//   </div>

// </div>

// <!-- FOOTER -->
// <div style="padding:10px 24px;border-top:0.5px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;background:#f8fafc;margin-top:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact">
//   <span style="font-size:10pt;color:#94a3b8">Thank you for your business · ${order.vendor?.name || ""} © ${new Date().getFullYear()}</span>
// </div>

// <script>
//   window.onload = function() {
//     window.print();
//     window.onafterprint = function() { window.close(); };
//     setTimeout(function() { window.close(); }, 3000);
//   };
// <\/script>
// </body>
// </html>`;

//     const newWin = window.open("", "_blank");
//     if (!newWin) {
//       alert("Popup blocked! Please allow popups for this site.");
//       return;
//     }
//     newWin.document.open();
//     newWin.document.write(html);
//     newWin.document.close();
//   };

//   /* ── Inline style helpers for the on-screen view ── */
//   const snoBadgeStyle = {
//     display: "inline-flex", alignItems: "center", justifyContent: "center",
//     width: 22, height: 22, borderRadius: 6, background: "#f1f5f9",
//     border: "0.5px solid #e2e8f0", fontSize: 10, fontWeight: 700,
//     color: "#64748b", fontFamily: "monospace",
//   };

//   return (
//     <>
//       <style>{`
//         *{box-sizing:border-box;margin:0;padding:0}
//         body{background:#f1f5f9}
//         .sno-cell{text-align:center}
//         @media print{.no-print{display:none!important}}
//       `}</style>

//       {/* Back Button */}
//       <div className="no-print" style={{ display: "flex", justifyContent: "center", padding: "16px 12px 0" }}>
//         <div style={{ width: "100%", maxWidth: 900, display: "flex", justifyContent: "flex-start" }}>
//           <button
//             onClick={() => navigate(-1)}
//             style={{
//               display: "flex", alignItems: "center", gap: 6,
//               padding: "8px 16px", border: "0.5px solid #cbd5e1", borderRadius: 8,
//               background: "#fff", fontSize: 12, fontWeight: 500, color: "#0f172a",
//               cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,.05)",
//             }}
//           >← Back</button>
//         </div>
//       </div>

//       <div style={{
//         fontFamily: "'Inter','Segoe UI',sans-serif",
//         padding: "16px 12px 40px", minHeight: "100vh",
//         display: "flex", justifyContent: "center", alignItems: "flex-start",
//         background: "#f1f5f9",
//       }}>
//         <div className="invoice-card" style={{
//           width: "100%", maxWidth: 900,
//           background: "#fff", border: "0.5px solid #e2e8f0",
//           borderRadius: 12, overflow: "hidden",
//         }}>

//           {/* Header */}
//           <div style={{
//             background: "#0f172a", padding: "20px 28px",
//             display: "flex", justifyContent: "space-between",
//             alignItems: "flex-start", flexWrap: "wrap", gap: 12,
//           }}>
//             <div>
//               <div style={{ fontSize: 22, fontWeight: 500, color: "#f8fafc", letterSpacing: 2 }}>INVOICE</div>
//               <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontFamily: "monospace" }}>
//                 {invoiceNo} · {fD(order.createdAt)}
//               </div>
//             </div>
//             <div style={{ textAlign: "right" }}>
//               <div style={{ fontSize: 14, fontWeight: 500, color: "#f8fafc" }}>{order.vendor?.name}</div>
//               <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, lineHeight: 1.6 }}>
//                 {order.vendor?.email && <>{order.vendor.email}<br /></>}
//                 {order.vendor?.phone}
//               </div>
//             </div>
//           </div>

//           {/* Amber stripe */}
//           <div style={{ height: 3, background: "#f59e0b" }} />

//           {/* Body */}
//           <div style={{ padding: "20px 28px" }}>

//             {/* Vendor Details */}
//             <div style={secLabel}>Vendor Details</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 10 }}>
//               <div><div style={lbl}>Company</div><div style={val}>{order.vendor?.name || "—"}</div></div>
//               <div><div style={lbl}>GSTIN</div><div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{order.vendor?.gstin || "—"}</div></div>
//               <div><div style={lbl}>Contact</div><div style={val}>{order.vendor?.phone || "—"}</div></div>
//               <div><div style={lbl}>Address</div><div style={val}>{order.vendor?.address || "—"}</div></div>
//             </div>

//             <hr style={divider} />

//             {/* Customer Details */}
//             <div style={secLabel}>Customer Details</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 10 }}>
//               <div><div style={lbl}>Name</div><div style={val}>{order.customer?.name || "—"}</div></div>
//               <div><div style={lbl}>GSTIN</div><div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{order.customer?.gstin || "—"}</div></div>
//               <div><div style={lbl}>Phone</div><div style={val}>{order.customer?.phone || "—"}</div></div>
//               <div><div style={lbl}>Shipping Address</div><div style={{ ...val, fontSize: 11 }}>{addrFull || "—"}</div></div>
//             </div>

//             <hr style={divider} />

//             {/* Order & Invoice Details */}
//             <div style={secLabel}>Order & Invoice Details</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 12, marginBottom: 14 }}>
//               <div>
//                 <div style={lbl}>Sr. No.</div>
//                 <div style={{
//                   display: "inline-flex", alignItems: "center", justifyContent: "center",
//                   width: 38, height: 38, borderRadius: 9, background: "#0f172a",
//                   color: "#f8fafc", fontSize: 14, fontWeight: 800, fontFamily: "monospace", marginTop: 2,
//                 }}>
//                   {order.sno ?? "—"}
//                 </div>
//               </div>
//               <div>
//                 <div style={lbl}>Invoice No.</div>
//                 {/* Shows the INV/FY/SNO format passed from VendorOrders */}
//                 <div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{invoiceNo}</div>
//               </div>
//               <div><div style={lbl}>Invoice Date</div><div style={val}>{fD(order.createdAt)}</div></div>
//               <div><div style={lbl}>Due Date</div><div style={val}>{order.dueDate ? fD(order.dueDate) : "—"}</div></div>
//               <div><div style={lbl}>Payment Mode</div><div style={val}>{order.paymentMode || "—"}</div></div>
//               <div>
//                 <div style={lbl}>Status</div>
//                 <div style={{
//                   display: "inline-flex", alignItems: "center", gap: 5,
//                   padding: "2px 9px", borderRadius: 999,
//                   background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 500,
//                 }}>
//                   <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
//                   {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
//                 </div>
//               </div>
//               <div><div style={lbl}>Total Items</div><div style={val}>{order.items?.length || 0}</div></div>
//             </div>

//             <hr style={divider} />

//             {/* Item Table */}
//             <div style={secLabel}>Item Table</div>
//             <div className="item-table-wrap" style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", minWidth: 840, borderCollapse: "collapse", tableLayout: "fixed" }}>
//                 <colgroup>
//                   <col style={{ width: 32 }} /><col style={{ width: "17%" }} />
//                   <col style={{ width: "7%" }} /><col style={{ width: "7%" }} />
//                   <col style={{ width: "5%" }} /><col style={{ width: "5%" }} />
//                   <col style={{ width: "5%" }} /><col style={{ width: "9%" }} />
//                   <col style={{ width: "8%" }} /><col style={{ width: "9%" }} />
//                   <col style={{ width: "7%" }} /><col style={{ width: "7%" }} />
//                   <col style={{ width: "8%" }} />
//                 </colgroup>
//                 <thead>
//                   <tr>
//                     <th style={{ ...th, textAlign: "center" }}>#</th>
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
//                     <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
//                       <td className="sno-cell" style={{ ...td, textAlign: "center", padding: "7px 4px" }}>
//                         <span style={snoBadgeStyle}>{totalItemCount - i}</span>
//                       </td>
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

//             {/* HSN GST Summary */}
//             <div style={secLabel}>Cumulative HSN-Wise GST Summary</div>
//             <div className="hsn-table-wrap" style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", minWidth: 580, borderCollapse: "collapse", tableLayout: "fixed" }}>
//                 <colgroup>
//                   <col style={{ width: "10%" }} /><col style={{ width: "18%" }} />
//                   <col style={{ width: "14%" }} /><col style={{ width: "14%" }} />
//                   <col style={{ width: "10%" }} /><col style={{ width: "16%" }} />
//                   <col />
//                 </colgroup>
//                 <thead>
//                   <tr>
//                     <th style={th}>HSN</th><th style={thR}>Taxable Amt</th>
//                     <th style={thR}>SGST</th><th style={thR}>CGST</th>
//                     <th style={thR}>CESS</th><th style={thR}>Total Amt</th>
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

//             {/* Totals */}
//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
//               <div style={{ minWidth: 280 }}>
//                 {[
//                   { label: "Subtotal (Taxable)",         value: fC(totalTaxable, 2) },
//                   { label: "CGST",                       value: fC(totalGST / 2, 2) },
//                   { label: "SGST",                       value: fC(totalGST / 2, 2) },
//                   ...(totalCess > 0 ? [{ label: "CESS", value: fC(totalCess, 2) }] : []),
//                   { label: "Total GST (Incl. in price)", value: fC(totalGST + totalCess, 2) },
//                 ].map((row) => (
//                   <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#64748b" }}>
//                     <span>{row.label}</span>
//                     <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#0f172a" }}>{row.value}</span>
//                   </div>
//                 ))}
//                 <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#64748b" }}>
//                   <span>Delivery</span>
//                   <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 500 }}>Free</span>
//                 </div>
//                 {couponDiscount > 0 && (
//                   <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#64748b" }}>
//                     <span>Coupon {order.couponCode && <span style={{ marginLeft: 4, fontFamily: "monospace", fontSize: 10, background: "#f0fdf4", color: "#16a34a", padding: "1px 6px", borderRadius: 4 }}>{order.couponCode}</span>}</span>
//                     <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#16a34a" }}>− {fC(couponDiscount, 2)}</span>
//                   </div>
//                 )}
//                 <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 6, borderTop: "1.5px solid #0f172a", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
//                   <span>Grand Total</span>
//                   <span style={{ fontFamily: "monospace", color: "#b45309", fontSize: 16 }}>{fC(effectiveTotal, 2)}</span>
//                 </div>
//                 <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 6, textAlign: "right", fontStyle: "italic" }}>
//                   * All prices are GST-inclusive
//                 </div>
//               </div>
//             </div>

//           </div>{/* /body */}

//           {/* Footer */}
//           <div style={{
//             padding: "12px 28px", borderTop: "0.5px solid #e2e8f0",
//             display: "flex", justifyContent: "space-between", alignItems: "center",
//             background: "#f8fafc", flexWrap: "wrap", gap: 8,
//           }}>
//             <span style={{ fontSize: 11, color: "#94a3b8" }}>
//               Thank you for your business · {order.vendor?.name} © {new Date().getFullYear()}
//             </span>
//             <button
//               className="no-print"
//               onClick={handlePrint}
//               style={{
//                 padding: "6px 16px", border: "none", borderRadius: 8,
//                 background: "#0f172a", fontSize: 11, fontWeight: 600,
//                 color: "#fff", cursor: "pointer",
//               }}
//             >🖨️ Print Invoice</button>
//           </div>

//         </div>{/* /invoice-card */}
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

/* ── Packing Sort ── */
const getPackingKey = (packing) => {
  const str = (packing || "").toString().trim();
  if (str === "—" || str === "") return "\uffff";
  const cleaned = str.replace(/^(\d+\s+)+/, "").trim();
  return cleaned.toLowerCase();
};

const packingSort = (a, b) => {
  const kA = getPackingKey(a.packing);
  const kB = getPackingKey(b.packing);
  return kA.localeCompare(kB, "en", { sensitivity: "base" });
};

export default function InvoicePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;

  /* ── Guard 1: Order nahi mila ── */
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
          <div style={{ fontSize: 36, marginBottom: 12 }}>🛍️</div>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
            No Order Found
          </h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            Please navigate from your orders page.
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 16, padding: "8px 20px", border: "0.5px solid #cbd5e1",
              borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 500,
              color: "#0f172a", cursor: "pointer",
            }}
          >← Back to Orders</button>
        </div>
      </div>
    );
  }

  /* ── invoiceNo: VendorOrders se pass hota hai ── */
  const invoiceNo = order.invoiceNo || "";

  /* ── Guard 2: Order confirmed nahi hai — invoice nahi ban sakti ── */
  if (!invoiceNo) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        justifyContent: "center", alignItems: "center", background: "#f1f5f9",
      }}>
        <div style={{
          background: "#fff", border: "0.5px solid #e2e8f0",
          borderRadius: 12, padding: "40px 48px", textAlign: "center", maxWidth: 400,
        }}>
          <div style={{ fontSize: 42, marginBottom: 14 }}>🔒</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            Invoice Not Generated Yet
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            Invoice sirf tab generate hoti hai jab order ka status
            <strong style={{ color: "#1e40af" }}> Accepted</strong>,
            <strong style={{ color: "#5b21b6" }}> Shipped</strong>, ya
            <strong style={{ color: "#065f46" }}> Delivered</strong> ho jaye.
          </p>
          <div style={{
            marginTop: 16, padding: "10px 14px",
            background: "#fef3c7", border: "1px solid #fde68a",
            borderRadius: 8, fontSize: 12, color: "#92400e",
          }}>
            ⏳ Current Status: <strong>{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending"}</strong>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 18, padding: "8px 20px", border: "0.5px solid #cbd5e1",
              borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 500,
              color: "#0f172a", cursor: "pointer",
            }}
          >← Back to Orders</button>
        </div>
      </div>
    );
  }

  /* ── Items calculate karo ── */
  const calcItems = (order.items || []).map((it) => {
    const unitPrice = Number(it.unitPrice || it.rate || 0);
    const quantity  = Number(it.quantity  || 1);
    const gstRate   = Number(it.gstRate   || 0);
    const cessRate  = Number(it.cess      || 0);
    const mrp       = Number(it.mrp       || unitPrice);
    const lineTotal = unitPrice * quantity;
    const divisor   = 1 + gstRate / 100 + cessRate / 100;
    const taxable   = divisor > 0 ? lineTotal / divisor : lineTotal;
    const gstAmt    = taxable * (gstRate  / 100);
    const cessAmt   = taxable * (cessRate / 100);
    const totalGst  = gstAmt + cessAmt;
    return {
      ...it,
      packing:       it.packagingText || it.packing || "—",
      packagingText: it.packagingText || it.packing || "—",
      rate: unitPrice, mrp, gstRate, cessRate, taxable,
      gst: gstAmt, cess: cessAmt, sgst: gstAmt / 2, cgst: gstAmt / 2,
      totalGst, total: lineTotal,
    };
  }).sort(packingSort);

  const totalItemCount = calcItems.length;

  /* ── HSN Map ── */
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

  const grandTotal     = calcItems.reduce((s, i) => s + i.total,    0);
  const totalTaxable   = calcItems.reduce((s, i) => s + i.taxable,  0);
  const totalGST       = calcItems.reduce((s, i) => s + i.totalGst, 0);
  const totalCess      = calcItems.reduce((s, i) => s + i.cess,     0);
  const effectiveTotal = order.finalPrice ?? grandTotal;
  const couponDiscount = order.couponDiscount || 0;

  /* ── Status badge colors ── */
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

  /* ── Style shortcuts ── */
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
  };
  const td = {
    padding: "7px 5px", fontSize: 11, color: "#0f172a",
    borderBottom: "0.5px solid #f1f5f9",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  };
  const tdR = { ...td,  textAlign: "right", fontFamily: "monospace", fontSize: 10.5 };
  const thR = { ...th,  textAlign: "right" };

  /* ── Print Handler ── */
  const handlePrint = () => {
    const itemRows = calcItems.map((it, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"}">
        <td style="padding:5px 4px;text-align:center;border-bottom:0.5px solid #f1f5f9">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;background:#f1f5f9;border:0.5px solid #e2e8f0;font-size:9pt;font-weight:700;color:#64748b;font-family:monospace">${totalItemCount - i}</span>
        </td>
        <td style="padding:5px;font-size:10pt;font-weight:500;color:#0f172a;border-bottom:0.5px solid #f1f5f9;word-break:break-word">${it.name || ""}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.mrp)}</td>
        <td style="padding:5px;font-size:9pt;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${it.hsn || "N/A"}</td>
        <td style="padding:5px;font-size:9pt;border-bottom:0.5px solid #f1f5f9">${it.gstRate}%</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${it.quantity}</td>
        <td style="padding:5px;font-size:9pt;border-bottom:0.5px solid #f1f5f9">${it.unit || "pcs"}</td>
        <td style="padding:5px;font-size:9pt;color:#64748b;border-bottom:0.5px solid #f1f5f9">${it.packagingText || it.packing || "—"}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.rate)}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.taxable, 3)}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.cgst, 3)}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(it.sgst, 3)}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;font-weight:600;border-bottom:0.5px solid #f1f5f9">${fN(it.total, 2)}</td>
      </tr>`).join("");

    const hsnRows = Object.entries(hsnMap).map(([hsn, v]) => `
      <tr>
        <td style="padding:5px;font-size:9pt;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${hsn}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(v.taxable, 2)}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(v.sgst, 3)}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(v.cgst, 3)}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;border-bottom:0.5px solid #f1f5f9">${fN(v.cess, 3)}</td>
        <td style="padding:5px;font-size:9pt;text-align:right;font-family:monospace;font-weight:600;border-bottom:0.5px solid #f1f5f9">${fN(v.total, 2)}</td>
        <td style="padding:5px;font-size:9pt;color:#94a3b8;font-style:italic;border-bottom:0.5px solid #f1f5f9">All HSN ${hsn} cumulative</td>
      </tr>`).join("");

    const cessRow = totalCess > 0
      ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>CESS</span><span style="font-family:monospace">${fC(totalCess, 2)}</span></div>`
      : "";

    const couponRow = couponDiscount > 0
      ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>Coupon ${order.couponCode ? `(${order.couponCode})` : ""}</span><span style="font-family:monospace;color:#16a34a">− ${fC(couponDiscount, 2)}</span></div>`
      : "";

    const thStyle  = `padding:5px 4px;font-size:8pt;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;background:#f8fafc;white-space:nowrap`;
    const thRStyle = `${thStyle};text-align:right`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice - ${invoiceNo}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0f172a}
    @page{size:A4;margin:8mm 8mm}
    @media print{
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
      table{page-break-inside:avoid}
      tr{page-break-inside:avoid}
    }
  </style>
</head>
<body>

<!-- HEADER -->
<div style="background:#0f172a;padding:16px 24px;display:flex;justify-content:space-between;align-items:flex-start;-webkit-print-color-adjust:exact;print-color-adjust:exact">
  <div>
    <div style="font-size:20pt;font-weight:500;color:#f8fafc;letter-spacing:2px">INVOICE</div>
    <div style="font-size:9pt;color:#94a3b8;margin-top:3px;font-family:monospace">${invoiceNo} · ${fD(order.createdAt)}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:13pt;font-weight:500;color:#f8fafc">${order.vendor?.name || ""}</div>
    <div style="font-size:9pt;color:#94a3b8;margin-top:3px;line-height:1.6">
      ${order.vendor?.email ? order.vendor.email + "<br/>" : ""}
      ${order.vendor?.phone || ""}
    </div>
  </div>
</div>

<!-- AMBER STRIPE -->
<div style="height:3px;background:#f59e0b;-webkit-print-color-adjust:exact;print-color-adjust:exact"></div>

<!-- BODY -->
<div style="padding:16px 24px">

  <!-- Vendor Details -->
  <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Vendor Details</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Company</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.vendor?.name || "—"}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">GSTIN</div><div style="font-size:10pt;font-weight:500;color:#0f172a;font-family:monospace">${order.vendor?.gstin || "—"}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Contact</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.vendor?.phone || "—"}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Address</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.vendor?.address || "—"}</div></div>
  </div>

  <hr style="border:none;border-top:0.5px solid #e2e8f0;margin:12px 0"/>

  <!-- Customer Details -->
  <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Customer Details</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px">
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Name</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.customer?.name || "—"}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">GSTIN</div><div style="font-size:10pt;font-weight:500;color:#0f172a;font-family:monospace">${order.customer?.gstin || "—"}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Phone</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.customer?.phone || "—"}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Shipping Address</div><div style="font-size:10pt;font-weight:500;color:#0f172a">${addrFull || "—"}</div></div>
  </div>

  <hr style="border:none;border-top:0.5px solid #e2e8f0;margin:12px 0"/>

  <!-- Order & Invoice Details -->
  <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Order & Invoice Details</div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-bottom:12px">
    <div>
      <div style="font-size:9pt;color:#94a3b8;margin-bottom:4px">Sr. No.</div>
      <div style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#0f172a;color:#f8fafc;font-size:13pt;font-weight:800;font-family:monospace;-webkit-print-color-adjust:exact;print-color-adjust:exact">${order.sno ?? "—"}</div>
    </div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Invoice No.</div><div style="font-size:10pt;font-weight:500;color:#0f172a;font-family:monospace">${invoiceNo}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Invoice Date</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${fD(order.createdAt)}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Due Date</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.dueDate ? fD(order.dueDate) : "—"}</div></div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Payment Mode</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.paymentMode || "—"}</div></div>
    <div>
      <div style="font-size:9pt;color:#94a3b8;margin-bottom:4px">Status</div>
      <div style="display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:999px;background:${sc.bg};color:${sc.color};font-size:10pt;font-weight:500;-webkit-print-color-adjust:exact;print-color-adjust:exact">
        <span style="width:6px;height:6px;border-radius:50%;background:${sc.dot};display:inline-block;-webkit-print-color-adjust:exact;print-color-adjust:exact"></span>
        ${(order.status || "").charAt(0).toUpperCase() + (order.status || "").slice(1)}
      </div>
    </div>
    <div><div style="font-size:9pt;color:#94a3b8;margin-bottom:2px">Total Items</div><div style="font-size:11pt;font-weight:500;color:#0f172a">${order.items?.length || 0}</div></div>
  </div>

  <hr style="border:none;border-top:0.5px solid #e2e8f0;margin:12px 0"/>

  <!-- Item Table -->
  <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Item Table</div>
  <table style="width:100%;border-collapse:collapse;table-layout:auto;font-size:8pt">
    <thead>
      <tr>
        <th style="${thStyle};text-align:center">#</th>
        <th style="${thStyle}">Item Name</th>
        <th style="${thRStyle}">MRP</th>
        <th style="${thStyle}">HSN</th>
        <th style="${thStyle}">GST%</th>
        <th style="${thRStyle}">Qty</th>
        <th style="${thStyle}">Unit</th>
        <th style="${thStyle}">Packing</th>
        <th style="${thRStyle}">Rate (Incl.)</th>
        <th style="${thRStyle}">Taxable</th>
        <th style="${thRStyle}">CGST</th>
        <th style="${thRStyle}">SGST</th>
        <th style="${thRStyle}">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <hr style="border:none;border-top:0.5px solid #e2e8f0;margin:12px 0"/>

  <!-- HSN Summary -->
  <div style="font-size:8pt;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;margin-bottom:7px">Cumulative HSN-Wise GST Summary</div>
  <table style="width:100%;border-collapse:collapse;table-layout:auto;font-size:8pt">
    <thead>
      <tr>
        <th style="${thStyle}">HSN</th>
        <th style="${thRStyle}">Taxable Amt</th>
        <th style="${thRStyle}">SGST</th>
        <th style="${thRStyle}">CGST</th>
        <th style="${thRStyle}">CESS</th>
        <th style="${thRStyle}">Total Amt</th>
        <th style="${thStyle}">Remark</th>
      </tr>
    </thead>
    <tbody>${hsnRows}</tbody>
  </table>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;margin-top:14px">
    <div style="min-width:280px">
      <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>Subtotal (Taxable)</span><span style="font-family:monospace;color:#0f172a">${fC(totalTaxable, 2)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>CGST</span><span style="font-family:monospace;color:#0f172a">${fC(totalGST / 2, 2)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>SGST</span><span style="font-family:monospace;color:#0f172a">${fC(totalGST / 2, 2)}</span></div>
      ${cessRow}
      <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>Total GST (Incl. in price)</span><span style="font-family:monospace;color:#0f172a">${fC(totalGST + totalCess, 2)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11pt;color:#64748b"><span>Delivery</span><span style="color:#16a34a;font-weight:500">Free</span></div>
      ${couponRow}
      <div style="display:flex;justify-content:space-between;padding:8px 0 0;margin-top:5px;border-top:1.5px solid #0f172a;font-size:14pt;font-weight:700;color:#0f172a">
        <span>Grand Total</span>
        <span style="font-family:monospace;color:#b45309;font-size:15pt">${fC(effectiveTotal, 2)}</span>
      </div>
      <div style="font-size:8pt;color:#94a3b8;margin-top:5px;text-align:right;font-style:italic">* All prices are GST-inclusive</div>
    </div>
  </div>

</div>

<!-- FOOTER -->
<div style="padding:10px 24px;border-top:0.5px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;background:#f8fafc;margin-top:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact">
  <span style="font-size:10pt;color:#94a3b8">Thank you for your business · ${order.vendor?.name || ""} © ${new Date().getFullYear()}</span>
</div>

<script>
  window.onload = function() {
    window.print();
    window.onafterprint = function() { window.close(); };
    setTimeout(function() { window.close(); }, 3000);
  };
<\/script>
</body>
</html>`;

    const newWin = window.open("", "_blank");
    if (!newWin) {
      alert("Popup blocked! Please allow popups for this site.");
      return;
    }
    newWin.document.open();
    newWin.document.write(html);
    newWin.document.close();
  };

  /* ── Inline badge style ── */
  const snoBadgeStyle = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 22, height: 22, borderRadius: 6, background: "#f1f5f9",
    border: "0.5px solid #e2e8f0", fontSize: 10, fontWeight: 700,
    color: "#64748b", fontFamily: "monospace",
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#f1f5f9}
        .sno-cell{text-align:center}
        @media print{.no-print{display:none!important}}
      `}</style>

      {/* Back Button */}
      <div className="no-print" style={{ display: "flex", justifyContent: "center", padding: "16px 12px 0" }}>
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
        <div className="invoice-card" style={{
          width: "100%", maxWidth: 900,
          background: "#fff", border: "0.5px solid #e2e8f0",
          borderRadius: 12, overflow: "hidden",
        }}>

          {/* ── Header ── */}
          <div style={{
            background: "#0f172a", padding: "20px 28px",
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 500, color: "#f8fafc", letterSpacing: 2 }}>INVOICE</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontFamily: "monospace" }}>
                {invoiceNo} · {fD(order.createdAt)}
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
          <div style={{ height: 3, background: "#f59e0b" }} />

          {/* ── Body ── */}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={lbl}>Sr. No.</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 38, height: 38, borderRadius: 9, background: "#0f172a",
                  color: "#f8fafc", fontSize: 14, fontWeight: 800, fontFamily: "monospace", marginTop: 2,
                }}>
                  {order.sno ?? "—"}
                </div>
              </div>
              <div>
                <div style={lbl}>Invoice No.</div>
                <div style={{ ...val, fontFamily: "monospace", fontSize: 11 }}>{invoiceNo}</div>
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
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </div>
              </div>
              <div><div style={lbl}>Total Items</div><div style={val}>{order.items?.length || 0}</div></div>
            </div>

            <hr style={divider} />

            {/* Item Table */}
            <div style={secLabel}>Item Table</div>
            <div className="item-table-wrap" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 840, borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 32 }} /><col style={{ width: "17%" }} />
                  <col style={{ width: "7%" }} /><col style={{ width: "7%" }} />
                  <col style={{ width: "5%" }} /><col style={{ width: "5%" }} />
                  <col style={{ width: "5%" }} /><col style={{ width: "9%" }} />
                  <col style={{ width: "8%" }} /><col style={{ width: "9%" }} />
                  <col style={{ width: "7%" }} /><col style={{ width: "7%" }} />
                  <col style={{ width: "8%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: "center" }}>#</th>
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
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td className="sno-cell" style={{ ...td, textAlign: "center", padding: "7px 4px" }}>
                        <span style={snoBadgeStyle}>{totalItemCount - i}</span>
                      </td>
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
                  <col style={{ width: "10%" }} /><col style={{ width: "18%" }} />
                  <col style={{ width: "14%" }} /><col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} /><col style={{ width: "16%" }} />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th style={th}>HSN</th><th style={thR}>Taxable Amt</th>
                    <th style={thR}>SGST</th><th style={thR}>CGST</th>
                    <th style={thR}>CESS</th><th style={thR}>Total Amt</th>
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
                  { label: "Subtotal (Taxable)",         value: fC(totalTaxable, 2) },
                  { label: "CGST",                       value: fC(totalGST / 2, 2) },
                  { label: "SGST",                       value: fC(totalGST / 2, 2) },
                  ...(totalCess > 0 ? [{ label: "CESS", value: fC(totalCess, 2) }] : []),
                  { label: "Total GST (Incl. in price)", value: fC(totalGST + totalCess, 2) },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "#64748b" }}>
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
                    <span>Coupon {order.couponCode && <span style={{ marginLeft: 4, fontFamily: "monospace", fontSize: 10, background: "#f0fdf4", color: "#16a34a", padding: "1px 6px", borderRadius: 4 }}>{order.couponCode}</span>}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#16a34a" }}>− {fC(couponDiscount, 2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 6, borderTop: "1.5px solid #0f172a", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  <span>Grand Total</span>
                  <span style={{ fontFamily: "monospace", color: "#b45309", fontSize: 16 }}>{fC(effectiveTotal, 2)}</span>
                </div>
                <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 6, textAlign: "right", fontStyle: "italic" }}>
                  * All prices are GST-inclusive
                </div>
              </div>
            </div>

          </div>{/* /body */}

          {/* ── Footer ── */}
          <div style={{
            padding: "12px 28px", borderTop: "0.5px solid #e2e8f0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#f8fafc", flexWrap: "wrap", gap: 8,
          }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Thank you for your business · {order.vendor?.name} © {new Date().getFullYear()}
            </span>
            <button
              className="no-print"
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
