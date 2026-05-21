
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

// const fC = (n) => "₹" + fN(n, 2);

// /* ── Packing Sort: skip leading numbers, sort by first meaningful word ── */
// /* e.g. "2 BOX 5 pcs" → "BOX", "1 OUTER 1 LADI 1 pcs" → "OUTER", "4 gm" → "gm", "11 pcs" → "pcs" */
// const getPackingKey = (packing) => {
//   const str = (packing || "").toString().trim();
//   if (str === "—" || str === "") return "\uffff"; // push to end
//   // Remove all leading number+space chunks, return first word
//   const cleaned = str.replace(/^(\d+\s+)+/, "").trim();
//   return cleaned.toLowerCase();
// };

// const packingSort = (a, b) => {
//   const kA = getPackingKey(a.packing);
//   const kB = getPackingKey(b.packing);
//   return kA.localeCompare(kB, "en", { sensitivity: "base" });
// };

// export default function EstimateInvoicePage() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
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
//           <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
//             No Order Found
//           </h2>
//           <p style={{ fontSize: 13, color: "#64748b" }}>
//             Please navigate from your orders page.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* ── Items (no GST calc — just rate × qty) ── */
//   const calcItems = (order.items || []).map((it) => {
//     const rate     = Number(it.rate || it.unitPrice || 0);
//     const mrp      = Number(it.mrp  || rate);
//     const quantity = Number(it.quantity || 1);
//     const total    = rate * quantity;
//     return { ...it, rate, mrp, quantity, total };
//   }).sort(packingSort);

//   const grandTotal = calcItems.reduce((s, i) => s + i.total, 0);

//   const addr = order.customer?.address || {};
//   const addrFull = [addr.street, addr.city, addr.state, addr.pincode]
//     .filter(Boolean).join(", ");

//   /* ── Shared Styles ── */
//   const secLabel = {
//     fontSize: 9, fontWeight: 700, letterSpacing: "1.5px",
//     textTransform: "uppercase", color: "#64748b", marginBottom: 6,
//   };
//   const lbl     = { fontSize: 10, color: "#94a3b8", marginBottom: 2 };
//   const val     = { fontSize: 12, fontWeight: 500, color: "#0f172a", lineHeight: 1.5 };
//   const divider = { border: "none", borderTop: "0.5px solid #e2e8f0", margin: "14px 0" };

//   const th = {
//     padding: "7px 6px", fontSize: 9, fontWeight: 700, letterSpacing: "0.8px",
//     textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #cbd5e1",
//     background: "#f8fafc", whiteSpace: "nowrap", textAlign: "left",
//     WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
//   };
//   const thR = { ...th, textAlign: "right" };
//   const td = {
//     padding: "8px 6px", fontSize: 11, color: "#0f172a",
//     borderBottom: "0.5px solid #f1f5f9", whiteSpace: "nowrap",
//   };
//   const tdR = { ...td, textAlign: "right", fontFamily: "monospace", fontSize: 10.5 };

//   /* ── PRINT HANDLER: opens clean blank window ── */
//   const handlePrint = () => {
//     const estimateEl = document.querySelector(".estimate-card");
//     if (!estimateEl) return;

//     const newWin = window.open("", "_blank", "width=1000,height=800");
//     newWin.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8" />
//           <title>Estimate - ${order._id?.slice(-6).toUpperCase()}</title>
//           <style>
//             * { box-sizing: border-box; margin: 0; padding: 0; }
//             body { background: #fff; font-family: 'Segoe UI', 'Inter', sans-serif; }
//             @page { size: A4; margin: 10mm 8mm; }
//             @media print {
//               * {
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//                 color-adjust: exact !important;
//               }
//               .item-table-wrap { overflow: visible !important; width: 100% !important; }
//               .item-table-wrap table {
//                 min-width: unset !important; width: 100% !important;
//                 table-layout: auto !important; font-size: 8pt !important;
//               }
//               .item-table-wrap table th,
//               .item-table-wrap table td {
//                 font-size: 8pt !important; padding: 5px 4px !important;
//                 white-space: normal !important; word-break: break-word !important;
//               }
//               table { page-break-inside: avoid; }
//               tr    { page-break-inside: avoid; }
//             }
//           </style>
//         </head>
//         <body>${estimateEl.outerHTML}</body>
//       </html>
//     `);
//     newWin.document.close();
//     newWin.focus();
//     setTimeout(() => {
//       newWin.print();
//       newWin.close();
//     }, 500);
//   };

//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         body { background: #f1f5f9; }
//       `}</style>

//       {/* Back Button */}
//       <div style={{ display: "flex", justifyContent: "center", padding: "16px 12px 0" }}>
//         <div style={{ width: "100%", maxWidth: 860, display: "flex", justifyContent: "flex-start" }}>
//           <button
//             onClick={() => navigate(-1)}
//             style={{
//               display: "flex", alignItems: "center", gap: 6,
//               padding: "8px 16px", border: "0.5px solid #cbd5e1", borderRadius: 8,
//               background: "#fff", fontSize: 12, fontWeight: 600, color: "#0f172a",
//               cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//             }}
//           >
//             ← Back
//           </button>
//         </div>
//       </div>

//       <div
//         style={{
//           fontFamily: "'Segoe UI', 'Inter', sans-serif",
//           padding: "16px 12px 40px",
//           minHeight: "100vh",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "flex-start",
//           background: "#f1f5f9",
//         }}
//       >
//         {/* estimate-card: only this gets printed */}
//         <div
//           className="estimate-card"
//           style={{
//             width: "100%",
//             maxWidth: 860,
//             background: "#fff",
//             border: "0.5px solid #cbd5e1",
//             borderRadius: 10,
//             overflow: "hidden",
//             boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
//           }}
//         >

//           {/* ── Header ── */}
//           <div style={{
//             background: "#1e293b",
//             padding: "18px 28px",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: 10,
//             WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
//           }}>
//             <div>
//               <div style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc", letterSpacing: 3 }}>
//                 ESTIMATE
//               </div>
//               <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: "monospace" }}>
//                 Order #{order._id?.slice(-6).toUpperCase()} · {fD(order.createdAt)}
//               </div>
//             </div>
//             <div style={{
//               background: "#334155", borderRadius: 8, padding: "6px 14px",
//               WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
//             }}>
//               <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Payment</div>
//               <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", marginTop: 2 }}>
//                 {order.paymentMode || "Cash"}
//               </div>
//             </div>
//           </div>

//           {/* Accent stripe */}
//           <div style={{
//             height: 3,
//             background: "linear-gradient(90deg, #f59e0b, #ef4444)",
//             WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
//           }} />

//           {/* ── Body ── */}
//           <div style={{ padding: "20px 28px" }}>

//             {/* Customer Details */}
//             <div style={secLabel}>Customer Details</div>
//             <div style={{
//               display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 10,
//               padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "0.5px solid #e2e8f0",
//             }}>
//               <div>
//                 <div style={lbl}>Customer Name</div>
//                 <div style={{ ...val, fontWeight: 600 }}>{order.customer?.name || "—"}</div>
//               </div>
//               <div>
//                 <div style={lbl}>Phone</div>
//                 <div style={val}>{order.customer?.phone || "—"}</div>
//               </div>
//               <div>
//                 <div style={lbl}>Delivery Address</div>
//                 <div style={val}>{addrFull || "—"}</div>
//               </div>
//             </div>

//             <hr style={divider} />

//             {/* Order Details */}
//             <div style={secLabel}>Order Details</div>
//             <div style={{ display: "flex", gap: 24, marginBottom: 14, flexWrap: "wrap" }}>
//               <div>
//                 <div style={lbl}>Order Number</div>
//                 <div style={{ ...val, fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
//                   #{order._id?.slice(-6).toUpperCase()}
//                 </div>
//               </div>
//               <div>
//                 <div style={lbl}>Order Date</div>
//                 <div style={val}>{fD(order.createdAt)}</div>
//               </div>
//               <div>
//                 <div style={lbl}>Total Items</div>
//                 <div style={val}>{order.items?.length || 0}</div>
//               </div>
//               <div>
//                 <div style={lbl}>Total Qty</div>
//                 <div style={val}>{calcItems.reduce((s, it) => s + it.quantity, 0)}</div>
//               </div>
//             </div>

//             <hr style={divider} />

//             {/* ── Item Table ── */}
//             <div style={secLabel}>Item Table</div>
//             <div className="item-table-wrap" style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", tableLayout: "auto" }}>
//                 <thead>
//                   <tr>
//                     <th style={{ ...th, width: 28 }}>S.No</th>
//                     <th style={{ ...th, width: "25%" }}>Item Name</th>
//                     <th style={thR}>MRP</th>
//                     <th style={th}>HSN</th>
//                     <th style={thR}>Item Qty</th>
//                     <th style={th}>Unit</th>
//                     <th style={th}>Packing</th>
//                     <th style={thR}>Rate</th>
//                     <th style={{ ...thR, color: "#1e293b" }}>Total Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {calcItems.map((it, i) => (
//                     <tr
//                       key={i}
//                       style={{
//                         background: i % 2 === 0 ? "#fff" : "#f8fafc",
//                         WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
//                       }}
//                     >
//                       <td style={{ ...td, color: "#94a3b8", fontSize: 10 }}>{i + 1}</td>
//                       <td style={{ ...td, fontWeight: 600, color: "#1e293b", whiteSpace: "normal", maxWidth: 180 }}>
//                         {it.name}
//                       </td>
//                       <td style={tdR}>{fN(it.mrp)}</td>
//                       <td style={{ ...td, fontFamily: "monospace", fontSize: 10, color: "#64748b" }}>
//                         {it.hsn || "N/A"}
//                       </td>
//                       <td style={tdR}>{it.quantity}</td>
//                       <td style={{ ...td, color: "#64748b" }}>{it.unit || "pcs"}</td>
//                       <td style={{ ...td, fontSize: 10, color: "#64748b" }}>{it.packing || "—"}</td>
//                       <td style={tdR}>{fN(it.rate)}</td>
//                       <td style={{ ...tdR, fontWeight: 700, color: "#1e293b" }}>{fN(it.total)}</td>
//                     </tr>
//                   ))}
//                   {calcItems.length === 0 && (
//                     <tr>
//                       <td colSpan={9} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: "24px 0" }}>
//                         No items found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* ── Grand Total ── */}
//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
//               <div style={{ minWidth: 240, borderTop: "2px solid #1e293b", paddingTop: 10 }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Grand Total</span>
//                   <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: "#b45309" }}>
//                     {fC(grandTotal)}
//                   </span>
//                 </div>
//                 <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, textAlign: "right" }}>
//                   {calcItems.reduce((s, it) => s + it.quantity, 0)} qty ·{" "}
//                   {calcItems.length} item{calcItems.length !== 1 ? "s" : ""}
//                 </div>
//               </div>
//             </div>

//             {/* ── Note ── */}
//             <div style={{
//               marginTop: 20, padding: "10px 14px",
//               background: "#fefce8", border: "0.5px solid #fde68a", borderRadius: 8,
//               fontSize: 11, color: "#92400e",
//               WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
//             }}>
//               ⚠️ <strong>Note:</strong> Yeh ek estimate hai. Final invoice alag se issue ki jayegi. GST charges applicable hogi final bill mein.
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
//             WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
//           }}>
//             <span style={{ fontSize: 11, color: "#94a3b8" }}>
//               Estimate — This is not a final tax invoice · {new Date().getFullYear()}
//             </span>
//             <button
//               onClick={handlePrint}
//               style={{
//                 padding: "7px 18px", border: "0.5px solid #cbd5e1", borderRadius: 8,
//                 background: "#1e293b", fontSize: 11, fontWeight: 600,
//                 color: "#f8fafc", cursor: "pointer",
//               }}
//             >
//               🖨️ Print Estimate
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

const fC = (n) => "₹" + fN(n, 2);

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

export default function EstimateInvoicePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  /* ── PRINT HANDLER: current window pe print karo ── */
  const handlePrint = () => {
    window.print();
  };

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
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
            No Order Found
          </h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            Please navigate from your orders page.
          </p>
        </div>
      </div>
    );
  }

  /* ── Items ── */
  const calcItems = (order.items || []).map((it) => {
    const rate     = Number(it.rate || it.unitPrice || 0);
    const mrp      = Number(it.mrp  || rate);
    const quantity = Number(it.quantity || 1);
    const total    = rate * quantity;
    return { ...it, rate, mrp, quantity, total };
  }).sort(packingSort);

  const grandTotal = calcItems.reduce((s, i) => s + i.total, 0);

  const addr = order.customer?.address || {};
  const addrFull = [addr.street, addr.city, addr.state, addr.pincode]
    .filter(Boolean).join(", ");

  /* ── Shared Styles ── */
  const secLabel = {
    fontSize: 9, fontWeight: 700, letterSpacing: "1.5px",
    textTransform: "uppercase", color: "#64748b", marginBottom: 6,
  };
  const lbl = { fontSize: 10, color: "#94a3b8", marginBottom: 2 };
  const val = { fontSize: 12, fontWeight: 500, color: "#0f172a", lineHeight: 1.5 };
  const divider = { border: "none", borderTop: "0.5px solid #e2e8f0", margin: "14px 0" };

  const th = {
    padding: "7px 6px", fontSize: 9, fontWeight: 700, letterSpacing: "0.8px",
    textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #cbd5e1",
    background: "#f8fafc", whiteSpace: "nowrap", textAlign: "left",
  };
  const thR = { ...th, textAlign: "right" };
  const td = {
    padding: "8px 6px", fontSize: 11, color: "#0f172a",
    borderBottom: "0.5px solid #f1f5f9", whiteSpace: "nowrap",
  };
  const tdR = { ...td, textAlign: "right", fontFamily: "monospace", fontSize: 10.5 };

  return (
    <>
      {/*
        ─────────────────────────────────────────────────────────
        PRINT CSS STRATEGY:
        - @media print mein .no-print hide karo
        - .estimate-card ko pure page pe show karo
        - background colors force karo
        ─────────────────────────────────────────────────────────
      */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f1f5f9; }

        @media print {
          /* Sab kuch hide karo by default */
          body * { visibility: hidden; }

          /* Sirf estimate-card aur uske andar ka sab visible karo */
          .estimate-card,
          .estimate-card * { visibility: visible; }

          /* Back button, Print button, aur wrapper hide karo */
          .no-print { display: none !important; }

          /* Card ko full page pe position karo */
          .estimate-card {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          /* Background colors force karo */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Table overflow fix */
          .item-table-wrap {
            overflow: visible !important;
            width: 100% !important;
          }
          .item-table-wrap table {
            min-width: unset !important;
            width: 100% !important;
            table-layout: auto !important;
          }
          .item-table-wrap table th,
          .item-table-wrap table td {
            font-size: 8pt !important;
            padding: 5px 4px !important;
            white-space: normal !important;
            word-break: break-word !important;
          }

          /* Page settings */
          @page {
            size: A4;
            margin: 8mm 8mm;
          }

          /* Table page break avoid */
          table { page-break-inside: avoid; }
          tr    { page-break-inside: avoid; }
        }
      `}</style>

      {/* Back Button — print mein hide hoga */}
      <div className="no-print" style={{ display: "flex", justifyContent: "center", padding: "16px 12px 0" }}>
        <div style={{ width: "100%", maxWidth: 860, display: "flex", justifyContent: "flex-start" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", border: "0.5px solid #cbd5e1", borderRadius: 8,
              background: "#fff", fontSize: 12, fontWeight: 600, color: "#0f172a",
              cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div
        style={{
          fontFamily: "'Segoe UI', 'Inter', sans-serif",
          padding: "16px 12px 40px",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#f1f5f9",
        }}
      >
        {/* estimate-card: yahi print hoga */}
        <div
          className="estimate-card"
          style={{
            width: "100%",
            maxWidth: 860,
            background: "#fff",
            border: "0.5px solid #cbd5e1",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: "#1e293b",
            padding: "18px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc", letterSpacing: 3 }}>
                ESTIMATE
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: "monospace" }}>
                Order #{order._id?.slice(-6).toUpperCase()} · {fD(order.createdAt)}
              </div>
            </div>
            <div style={{
              background: "#334155", borderRadius: 8, padding: "6px 14px",
              WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
            }}>
              <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Payment</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", marginTop: 2 }}>
                {order.paymentMode || "Cash"}
              </div>
            </div>
          </div>

          {/* Accent stripe */}
          <div style={{
            height: 3,
            background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
          }} />

          {/* ── Body ── */}
          <div style={{ padding: "20px 28px" }}>

            {/* Customer Details */}
            <div style={secLabel}>Customer Details</div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 10,
              padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "0.5px solid #e2e8f0",
              WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
            }}>
              <div>
                <div style={lbl}>Customer Name</div>
                <div style={{ ...val, fontWeight: 600 }}>{order.customer?.name || "—"}</div>
              </div>
              <div>
                <div style={lbl}>Phone</div>
                <div style={val}>{order.customer?.phone || "—"}</div>
              </div>
              <div>
                <div style={lbl}>Delivery Address</div>
                <div style={val}>{addrFull || "—"}</div>
              </div>
            </div>

            <hr style={divider} />

            {/* Order Details */}
            <div style={secLabel}>Order Details</div>
            <div style={{ display: "flex", gap: 24, marginBottom: 14, flexWrap: "wrap" }}>
              <div>
                <div style={lbl}>Order Number</div>
                <div style={{ ...val, fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                  #{order._id?.slice(-6).toUpperCase()}
                </div>
              </div>
              <div>
                <div style={lbl}>Order Date</div>
                <div style={val}>{fD(order.createdAt)}</div>
              </div>
              <div>
                <div style={lbl}>Total Items</div>
                <div style={val}>{order.items?.length || 0}</div>
              </div>
              <div>
                <div style={lbl}>Total Qty</div>
                <div style={val}>{calcItems.reduce((s, it) => s + it.quantity, 0)}</div>
              </div>
            </div>

            <hr style={divider} />

            {/* ── Item Table ── */}
            <div style={secLabel}>Item Table</div>
            <div className="item-table-wrap" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", tableLayout: "auto" }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 28 }}>S.No</th>
                    <th style={{ ...th, width: "25%" }}>Item Name</th>
                    <th style={thR}>MRP</th>
                    <th style={th}>HSN</th>
                    <th style={thR}>Item Qty</th>
                    <th style={th}>Unit</th>
                    <th style={th}>Packing</th>
                    <th style={thR}>Rate</th>
                    <th style={{ ...thR, color: "#1e293b" }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {calcItems.map((it, i) => (
                    <tr
                      key={i}
                      style={{
                        background: i % 2 === 0 ? "#fff" : "#f8fafc",
                        WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
                      }}
                    >
                      <td style={{ ...td, color: "#94a3b8", fontSize: 10 }}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: 600, color: "#1e293b", whiteSpace: "normal", maxWidth: 180 }}>
                        {it.name}
                      </td>
                      <td style={tdR}>{fN(it.mrp)}</td>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 10, color: "#64748b" }}>
                        {it.hsn || "N/A"}
                      </td>
                      <td style={tdR}>{it.quantity}</td>
                      <td style={{ ...td, color: "#64748b" }}>{it.unit || "pcs"}</td>
                      <td style={{ ...td, fontSize: 10, color: "#64748b" }}>{it.packing || "—"}</td>
                      <td style={tdR}>{fN(it.rate)}</td>
                      <td style={{ ...tdR, fontWeight: 700, color: "#1e293b" }}>{fN(it.total)}</td>
                    </tr>
                  ))}
                  {calcItems.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ ...td, textAlign: "center", color: "#94a3b8", padding: "24px 0" }}>
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Grand Total ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <div style={{ minWidth: 240, borderTop: "2px solid #1e293b", paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Grand Total</span>
                  <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: "#b45309" }}>
                    {fC(grandTotal)}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, textAlign: "right" }}>
                  {calcItems.reduce((s, it) => s + it.quantity, 0)} qty ·{" "}
                  {calcItems.length} item{calcItems.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* ── Note ── */}
            <div style={{
              marginTop: 20, padding: "10px 14px",
              background: "#fefce8", border: "0.5px solid #fde68a", borderRadius: 8,
              fontSize: 11, color: "#92400e",
              WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
            }}>
              ⚠️ <strong>Note:</strong> Yeh ek estimate hai. Final invoice alag se issue ki jayegi. GST charges applicable hogi final bill mein.
            </div>

          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "12px 28px",
            borderTop: "0.5px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
            flexWrap: "wrap",
            gap: 8,
            WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
          }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Estimate — This is not a final tax invoice · {new Date().getFullYear()}
            </span>
            {/* Print button — print mein hide hoga */}
            <button
              className="no-print"
              onClick={handlePrint}
              style={{
                padding: "7px 18px", border: "0.5px solid #cbd5e1", borderRadius: 8,
                background: "#1e293b", fontSize: 11, fontWeight: 600,
                color: "#f8fafc", cursor: "pointer",
              }}
            >
              🖨️ Print Estimate
            </button>
          </div>

        </div>
      </div>
    </>
  );
}