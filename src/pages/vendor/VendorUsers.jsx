// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Mail,
//   Loader2,
//   Search,
//   Clock,
//   UserCheck,
//   X,
//   Download,
//   Eye,
//   RefreshCw,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";

// const API = "https://foodhelpervendor.onrender.com/api/user/vendor/all";

// /* ─────────────────────────────────────────
//    Helpers
// ───────────────────────────────────────── */
// function exportToExcel(data) {
//   const headers = ["#", "Name", "Email", "Phone", "Role", "Status", "Joined"];
//   const rows = data.map((u, i) => [
//     i + 1,
//     u.name || "N/A",
//     u.email || "",
//     u.phone || "",
//     u.role || "",
//     u.isEmailVerified ? "Verified" : "Pending",
//     u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "",
//   ]);
//   const csv = [headers, ...rows]
//     .map((row) =>
//       row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
//     )
//     .join("\n");
//   const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `vendor-customers-${new Date().toISOString().slice(0, 10)}.csv`;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// function fmtDate(d) {
//   if (!d) return "—";
//   return new Date(d).toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// function initials(name) {
//   return (name || "U")
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();
// }

// const border = "0.5px solid #e2e8f0";

// /* ─────────────────────────────────────────
//    Customer Detail Modal
// ───────────────────────────────────────── */
// function CustomerModal({ user, onClose }) {
//   if (!user) return null;

//   const fields = [
//     { label: "Phone", value: user.phone || "Not provided" },
//     { label: "Role", value: user.role || "N/A" },
//     { label: "Joined", value: fmtDate(user.createdAt) },
//     { label: "Last login", value: user.lastLoginAt ? fmtDate(user.lastLoginAt) : "Never" },
//     { label: "Address", value: user.address || "Not provided" },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(0,0,0,0.35)" }}
//       onClick={onClose}
//     >
//       <div
//         style={{
//           background: "#fff",
//           borderRadius: "16px",
//           border,
//           width: "100%",
//           maxWidth: "340px",
//           padding: "20px",
//           position: "relative",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
//           <div
//             style={{
//               width: "44px", height: "44px", borderRadius: "50%",
//               background: "#E6F1FB", color: "#185FA5",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: "16px", fontWeight: 500, flexShrink: 0,
//             }}
//           >
//             {initials(user.name)}
//           </div>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <p style={{ fontSize: "15px", fontWeight: 500, color: "#1a202c", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//               {user.name || "Unknown"}
//             </p>
//             <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//               {user.email}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               width: "28px", height: "28px", border: "none", background: "transparent",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               borderRadius: "8px", cursor: "pointer", color: "#94a3b8",
//             }}
//           >
//             <X size={15} />
//           </button>
//         </div>

//         {/* Status */}
//         <div style={{ marginBottom: "16px" }}>
//           <span
//             style={{
//               display: "inline-flex", alignItems: "center", gap: "4px",
//               padding: "3px 10px", borderRadius: "99px",
//               fontSize: "11px", fontWeight: 600,
//               ...(user.isEmailVerified
//                 ? { background: "#EAF3DE", color: "#27500A" }
//                 : { background: "#FAEEDA", color: "#633806" }),
//             }}
//           >
//             {user.isEmailVerified ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
//             {user.isEmailVerified ? "Verified" : "Pending"}
//           </span>
//         </div>

//         {/* Fields */}
//         <div style={{ borderTop: border }}>
//           {fields.map((f) => (
//             <div
//               key={f.label}
//               style={{
//                 display: "flex", justifyContent: "space-between",
//                 alignItems: "center", padding: "8px 0",
//                 borderBottom: border,
//               }}
//             >
//               <span style={{ fontSize: "11px", color: "#94a3b8" }}>{f.label}</span>
//               <span style={{ fontSize: "12px", fontWeight: 500, color: "#1a202c", textAlign: "right", maxWidth: "60%" }}>
//                 {f.value}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* Close Btn */}
//         <button
//           onClick={onClose}
//           style={{
//             marginTop: "16px", width: "100%",
//             padding: "8px", borderRadius: "12px",
//             border: "none", background: "#f1f5f9",
//             fontSize: "13px", fontWeight: 500, color: "#475569",
//             cursor: "pointer", fontFamily: "inherit",
//           }}
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────
//    Main Component
// ───────────────────────────────────────── */
// export default function VendorUsers() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [selectedUser, setSelectedUser] = useState(null);

//   /* Fetch */
//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem("vendorToken");
//       if (!token) { alert("Vendor login required"); return; }
//       setLoading(true);
//       const res = await axios.get(API, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUsers(res.data.data || []);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       alert("Failed to fetch users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchUsers(); }, []);

//   /* Filter */
//   const filteredUsers = users.filter((u) => {
//     const matchSearch =
//       u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       u.email?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchStatus =
//       filterStatus === "all" ? true
//       : filterStatus === "verified" ? u.isEmailVerified
//       : !u.isEmailVerified;
//     return matchSearch && matchStatus;
//   });

//   const verifiedCount = users.filter((u) => u.isEmailVerified).length;
//   const pendingCount = users.length - verifiedCount;

//   return (
//     <div
//       style={{
//         background: "#ffffff",
//         minHeight: "100vh",
//         padding: "24px",
//         fontFamily: "Inter, sans-serif",
//       }}
//     >
//       {/* Spinner keyframe */}
//       <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

//       {/* ── Top Bar ── */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
//         <span style={{ fontSize: "15px", fontWeight: 500, color: "#1a202c", letterSpacing: "0.02em" }}>
       
//         </span>
//         <div style={{ display: "flex", gap: "8px" }}>
//           <button
//             onClick={fetchUsers}
//             style={{
//               display: "inline-flex", alignItems: "center", gap: "5px",
//               padding: "6px 12px", border, borderRadius: "8px",
//               background: "#fff", fontSize: "12px", color: "#64748b",
//               cursor: "pointer", fontFamily: "inherit",
//             }}
//           >
//             <RefreshCw size={13} />
//             Refresh
//           </button>
//           <button
//             onClick={() => exportToExcel(filteredUsers)}
//             disabled={filteredUsers.length === 0}
//             style={{
//               display: "inline-flex", alignItems: "center", gap: "5px",
//               padding: "6px 12px", borderRadius: "8px",
//               border: "0.5px solid #97C459",
//               background: "#EAF3DE",
//               fontSize: "12px", color: "#27500A", fontWeight: 500,
//               cursor: filteredUsers.length === 0 ? "not-allowed" : "pointer",
//               opacity: filteredUsers.length === 0 ? 0.5 : 1,
//               fontFamily: "inherit",
//             }}
//           >
//             <Download size={13} />
//             Export Excel
//           </button>
//         </div>
//       </div>

//       {/* ── Stats Cards ── */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "12px", marginBottom: "20px" }}>
//         {[
//           { label: "Total customers", value: users.length, color: "#185FA5" },
//           { label: "Verified", value: verifiedCount, color: "#3B6D11" },
//           { label: "Pending", value: pendingCount, color: "#854F0B" },
//         ].map((s) => (
//           <div
//             key={s.label}
//             style={{ background: "#fff", border, borderRadius: "12px", padding: "14px 16px" }}
//           >
//             <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 6px" }}>
//               {s.label}
//             </p>
//             <p style={{ fontSize: "26px", fontWeight: 500, color: s.color, margin: 0 }}>
//               {s.value}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* ── Toolbar ── */}
//       <div
//         style={{
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//           flexWrap: "wrap", gap: "10px",
//           padding: "10px 14px", border, borderRadius: "12px",
//           background: "#fff", marginBottom: "14px",
//         }}
//       >
//         <div style={{ position: "relative", flex: 1, minWidth: "140px" }}>
//           <Search
//             size={13}
//             style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
//           />
//           <input
//             type="text"
//             placeholder="Search customer..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               width: "100%", padding: "6px 10px 6px 30px",
//               border, borderRadius: "8px",
//               fontSize: "12px", color: "#1a202c",
//               background: "#fff", outline: "none", fontFamily: "inherit",
//               boxSizing: "border-box",
//             }}
//           />
//         </div>
//         <select
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value)}
//           style={{
//             padding: "6px 10px", border, borderRadius: "8px",
//             fontSize: "12px", color: "#64748b",
//             background: "#fff", outline: "none",
//             cursor: "pointer", fontFamily: "inherit",
//           }}
//         >
//           <option value="all">All status</option>
//           <option value="verified">Verified</option>
//           <option value="pending">Pending</option>
//         </select>
//       </div>

//       {/* ── Table ── */}
//       <div style={{ border, borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
//         {loading ? (
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px" }}>
//             <Loader2 size={26} style={{ color: "#378ADD", animation: "spin 1s linear infinite" }} />
//             <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px" }}>
//               Loading customers...
//             </span>
//           </div>
//         ) : filteredUsers.length === 0 ? (
//           <div style={{ padding: "48px", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>
//             No customers found
//           </div>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", tableLayout: "fixed" }}>
//               <thead>
//                 <tr style={{ background: "#f8fafc", borderBottom: border }}>
//                   {[
//                     { label: "#", w: "40px", align: "center" },
//                     { label: "Customer", w: "38%", align: "left" },
//                     { label: "Status", w: "110px", align: "center" },
//                     { label: "Role", w: "80px", align: "center" },
//                     { label: "Joined", w: "110px", align: "center" },
//                     { label: "Action", w: "80px", align: "center" },
//                   ].map((h) => (
//                     <th
//                       key={h.label}
//                       style={{
//                         width: h.w, padding: "10px 12px",
//                         textAlign: h.align, fontSize: "11px",
//                         fontWeight: 500, color: "#94a3b8",
//                         letterSpacing: "0.04em", textTransform: "uppercase",
//                       }}
//                     >
//                       {h.label}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map((u, i) => (
//                   <tr
//                     key={u._id}
//                     style={{ borderBottom: border, transition: "background 0.1s" }}
//                     onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
//                     onMouseLeave={(e) => (e.currentTarget.style.background = "")}
//                   >
//                     {/* # */}
//                     <td style={{ padding: "11px 12px", textAlign: "center", color: "#94a3b8", fontWeight: 500 }}>
//                       {i + 1}
//                     </td>

//                     {/* Customer */}
//                     <td style={{ padding: "11px 12px" }}>
//                       <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                         <div
//                           style={{
//                             width: "32px", height: "32px", borderRadius: "50%",
//                             background: "#E6F1FB", color: "#185FA5",
//                             display: "flex", alignItems: "center", justifyContent: "center",
//                             fontSize: "12px", fontWeight: 500, flexShrink: 0,
//                           }}
//                         >
//                           {initials(u.name)}
//                         </div>
//                         <div style={{ minWidth: 0 }}>
//                           <div style={{ fontWeight: 500, fontSize: "13px", color: "#1a202c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                             {u.name || "N/A"}
//                           </div>
//                           <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#94a3b8" }}>
//                             <Mail size={10} />
//                             <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                               {u.email}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Status */}
//                     <td style={{ padding: "11px 12px", textAlign: "center" }}>
//                       <span
//                         style={{
//                           display: "inline-flex", alignItems: "center", gap: "3px",
//                           padding: "3px 8px", borderRadius: "99px",
//                           fontSize: "10px", fontWeight: 600,
//                           ...(u.isEmailVerified
//                             ? { background: "#EAF3DE", color: "#27500A" }
//                             : { background: "#FAEEDA", color: "#633806" }),
//                         }}
//                       >
//                         {u.isEmailVerified ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
//                         {u.isEmailVerified ? "Verified" : "Pending"}
//                       </span>
//                     </td>

//                     {/* Role */}
//                     <td style={{ padding: "11px 12px", textAlign: "center" }}>
//                       <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "#64748b", textTransform: "capitalize" }}>
//                         <UserCheck size={11} />
//                         {u.role}
//                       </span>
//                     </td>

//                     {/* Joined */}
//                     <td style={{ padding: "11px 12px", textAlign: "center" }}>
//                       <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "#94a3b8" }}>
//                         <Clock size={10} />
//                         {fmtDate(u.createdAt)}
//                       </span>
//                     </td>

//                     {/* Action */}
//                     <td style={{ padding: "11px 12px", textAlign: "center" }}>
//                       <button
//                         onClick={() => setSelectedUser(u)}
//                         style={{
//                           display: "inline-flex", alignItems: "center", gap: "4px",
//                           padding: "4px 10px", borderRadius: "8px",
//                           fontSize: "11px", fontWeight: 500,
//                           color: "#185FA5", background: "#E6F1FB",
//                           border: "0.5px solid #B5D4F4",
//                           cursor: "pointer", fontFamily: "inherit",
//                         }}
//                       >
//                         <Eye size={11} />
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Table Footer */}
//             <div
//               style={{
//                 padding: "10px 14px", borderTop: border,
//                 background: "#f8fafc",
//                 display: "flex", alignItems: "center", justifyContent: "space-between",
//               }}
//             >
//               <span style={{ fontSize: "11px", color: "#94a3b8" }}>
//                 Showing {filteredUsers.length} of {users.length} customers
//               </span>
//               <button
//                 onClick={() => exportToExcel(filteredUsers)}
//                 style={{
//                   display: "inline-flex", alignItems: "center", gap: "4px",
//                   fontSize: "11px", fontWeight: 500, color: "#3B6D11",
//                   background: "none", border: "none",
//                   cursor: "pointer", fontFamily: "inherit",
//                 }}
//               >
//                 <Download size={10} />
//                 Download visible as Excel
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Modal ── */}
//       <CustomerModal user={selectedUser} onClose={() => setSelectedUser(null)} />
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Mail,
  Loader2,
  Search,
  Clock,
  UserCheck,
  X,
  Download,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const API = "https://foodhelpervendor.onrender.com/api/user/vendor/all";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */

/**
 * CSV Export
 * FIX: month "2-digit" use kiya — Excel mein ###### problem solve hogi
 */
function exportToExcel(data) {
  const headers = ["#", "Name", "Email", "Phone", "Role", "Status", "Joined"];

  const rows = data.map((u, i) => [
    i + 1,
    u.name || "N/A",
    u.email || "",
    u.phone || "",
    u.role || "",
    u.isEmailVerified ? "Verified" : "Pending",
    u.createdAt
      ? (() => {
          const d = new Date(u.createdAt);
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const yyyy = d.getFullYear();
          return `${dd}/${mm}/${yyyy}`; // plain text string — Excel kabhi ###### nahi karega
        })()
      : "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vendor-customers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** UI mein date display ke liye — "14 Jan 2026" format */
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Avatar ke liye initials */
function initials(name) {
  if (!name || name.trim() === "") return "U";
  return name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const border = "0.5px solid #e2e8f0";

/* ─────────────────────────────────────────
   Table Header Config
───────────────────────────────────────── */
const TABLE_HEADERS = [
  { label: "#",        width: "40px",  align: "center" },
  { label: "Customer", width: "38%",   align: "left"   },
  { label: "Status",   width: "110px", align: "center" },
  { label: "Role",     width: "80px",  align: "center" },
  { label: "Joined",   width: "110px", align: "center" },
  { label: "Action",   width: "80px",  align: "center" },
];

/* ─────────────────────────────────────────
   Customer Detail Modal
───────────────────────────────────────── */
function CustomerModal({ user, onClose }) {
  if (!user) return null;

  const fields = [
    { label: "Phone",      value: user.phone      || "Not provided"                        },
    { label: "Role",       value: user.role        || "N/A"                                 },
    { label: "Joined",     value: fmtDate(user.createdAt)                                   },
    { label: "Last login", value: user.lastLoginAt ? fmtDate(user.lastLoginAt) : "Never"   },
    { label: "Address",    value: user.address     || "Not provided"                        },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.35)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border,
          width: "100%",
          maxWidth: "340px",
          padding: "20px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#E6F1FB",
              color: "#185FA5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {initials(user.name)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 500,
                color: "#1a202c",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name || "Unknown"}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Verification Badge */}
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 10px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: 600,
              ...(user.isEmailVerified
                ? { background: "#EAF3DE", color: "#27500A" }
                : { background: "#FAEEDA", color: "#633806" }),
            }}
          >
            {user.isEmailVerified ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            {user.isEmailVerified ? "Verified" : "Pending"}
          </span>
        </div>

        {/* Detail Fields */}
        <div style={{ borderTop: border }}>
          {fields.map((f) => (
            <div
              key={f.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: border,
              }}
            >
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                {f.label}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#1a202c",
                  textAlign: "right",
                  maxWidth: "60%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "8px",
            borderRadius: "12px",
            border: "none",
            background: "#f1f5f9",
            fontSize: "13px",
            fontWeight: 500,
            color: "#475569",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function VendorUsers() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  /* ── Fetch Users ── */
  const fetchUsers = async () => {
    const token = localStorage.getItem("vendorToken");
    if (!token) {
      alert("Vendor login required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ── Filter Logic ── */
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);

    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "verified"
        ? u.isEmailVerified === true
        : !u.isEmailVerified;

    return matchSearch && matchStatus;
  });

  const verifiedCount = users.filter((u) => u.isEmailVerified).length;
  const stats = [
    { label: "Total customers", value: users.length,               color: "#185FA5" },
    { label: "Verified",        value: verifiedCount,               color: "#3B6D11" },
    { label: "Pending",         value: users.length - verifiedCount, color: "#854F0B" },
  ];

  /* ── Render ── */
  return (
    <div
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginBottom: "20px",
          gap: "8px",
        }}
      >
        <button
          onClick={fetchUsers}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            border,
            borderRadius: "8px",
            background: "#fff",
            fontSize: "12px",
            color: "#64748b",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>

        <button
          onClick={() => exportToExcel(filteredUsers)}
          disabled={filteredUsers.length === 0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "0.5px solid #97C459",
            background: "#EAF3DE",
            fontSize: "12px",
            color: "#27500A",
            fontWeight: 500,
            cursor: filteredUsers.length === 0 ? "not-allowed" : "pointer",
            opacity: filteredUsers.length === 0 ? 0.5 : 1,
            fontFamily: "inherit",
          }}
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border,
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                margin: "0 0 6px",
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontSize: "26px",
                fontWeight: 500,
                color: s.color,
                margin: 0,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          padding: "10px 14px",
          border,
          borderRadius: "12px",
          background: "#fff",
          marginBottom: "14px",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "140px" }}>
          <Search
            size={13}
            style={{
              position: "absolute",
              left: "9px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 10px 6px 30px",
              border,
              borderRadius: "8px",
              fontSize: "12px",
              color: "#1a202c",
              background: "#fff",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "6px 10px",
            border,
            borderRadius: "8px",
            fontSize: "12px",
            color: "#64748b",
            background: "#fff",
            outline: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <option value="all">All status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          border,
          borderRadius: "12px",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "48px",
            }}
          >
            <Loader2
              size={26}
              style={{ color: "#378ADD", animation: "spin 1s linear infinite" }}
            />
            <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px" }}>
              Loading customers...
            </span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              fontSize: "13px",
              color: "#94a3b8",
            }}
          >
            No customers found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: border }}>
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h.label}
                      style={{
                        width: h.width,
                        padding: "10px 12px",
                        textAlign: h.align,
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#94a3b8",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr
                    key={u._id}
                    style={{ borderBottom: border, transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    {/* Serial # */}
                    <td
                      style={{
                        padding: "11px 12px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      {i + 1}
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "11px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#E6F1FB",
                            color: "#185FA5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 500,
                            flexShrink: 0,
                          }}
                        >
                          {initials(u.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: "13px",
                              color: "#1a202c",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {u.name || "N/A"}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11px",
                              color: "#94a3b8",
                            }}
                          >
                            <Mail size={10} />
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "11px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "3px 8px",
                          borderRadius: "99px",
                          fontSize: "10px",
                          fontWeight: 600,
                          ...(u.isEmailVerified
                            ? { background: "#EAF3DE", color: "#27500A" }
                            : { background: "#FAEEDA", color: "#633806" }),
                        }}
                      >
                        {u.isEmailVerified ? (
                          <CheckCircle2 size={9} />
                        ) : (
                          <XCircle size={9} />
                        )}
                        {u.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>

                    {/* Role */}
                    <td style={{ padding: "11px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          fontSize: "11px",
                          color: "#64748b",
                          textTransform: "capitalize",
                        }}
                      >
                        <UserCheck size={11} />
                        {u.role || "—"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td style={{ padding: "11px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          fontSize: "11px",
                          color: "#94a3b8",
                        }}
                      >
                        <Clock size={10} />
                        {fmtDate(u.createdAt)}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "11px 12px", textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "#185FA5",
                          background: "#E6F1FB",
                          border: "0.5px solid #B5D4F4",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Eye size={11} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div
              style={{
                padding: "10px 14px",
                borderTop: border,
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                Showing {filteredUsers.length} of {users.length} customers
              </span>
              <button
                onClick={() => exportToExcel(filteredUsers)}
                disabled={filteredUsers.length === 0}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#3B6D11",
                  background: "none",
                  border: "none",
                  cursor: filteredUsers.length === 0 ? "not-allowed" : "pointer",
                  opacity: filteredUsers.length === 0 ? 0.5 : 1,
                  fontFamily: "inherit",
                }}
              >
                <Download size={10} />
                Download visible as CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <CustomerModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}