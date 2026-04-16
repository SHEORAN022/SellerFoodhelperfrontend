
// // import React, { useState, useEffect } from "react";
// // import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
// // import {
// //   Users,
// //   BarChart2,
// //   LogOut,
// //   Menu,
// //   Grid,
// //   Package,
// //   User,
// //   CreditCard, 
// //   Home, 
// //   Truck,
// //   FileText, 
// // } from "react-feather";

// // export default function AdminLayout() {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
// //   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
// //   const [hoveredLink, setHoveredLink] = useState(null);

// //   const logout = () => {
// //     localStorage.clear();
// //     navigate("/login", { replace: true });
// //   };

// //   /* ================= RESPONSIVE ================= */
// //   useEffect(() => {
// //     const handler = () => setIsMobile(window.innerWidth < 768);
// //     window.addEventListener("resize", handler);
// //     return () => window.removeEventListener("resize", handler);
// //   }, []);

// //   useEffect(() => {
// //     setIsSidebarOpen(!isMobile);
// //   }, [isMobile]);

// //   const hoverStyle = (isHover, active) => ({
// //     ...styles.link,
// //     background: active
// //       ? "linear-gradient(135deg, #983a30 0%, #c0392b 100%)"
// //       : isHover
// //       ? "rgba(255,255,255,0.15)"
// //       : "transparent",
// //     color: "#fff",
// //   });

// //   const sidebarItems = [
// //     { to: "/admin", label: "Dashboard", icon: <BarChart2 size={18} /> },
// //     { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
// //     { to: "/admin/stores", label: "Stores / Warehouse", icon: <Home size={18} /> },
// //     { to: "/admin/riders", label: "Delivery Partners", icon: <Truck size={18} /> },
// //     {
// //       to: "/admin/CategoryManager",
// //       label: "Add Category",
// //       icon: <Grid size={18} />,
// //     },
// //     {
// //       to: "/admin/priceanalytics",
// //       label: "Analytics",
// //       icon: <BarChart2 size={18} />,
// //     },
// //     {
// //       to: "/admin/pricelist",
// //       label: "Add Product",
// //       icon: <Package size={18} />,
// //     },
// //     {
// //   to: "/admin/orders",
// //   label: "Orders",
// //   icon: <Package size={18} />,
// // },

// // {
// //   to: "/admin/payments",
// //   label: "Payments",
// //   icon: <CreditCard size={18} />,
// // },
// //   { to: "/admin/gst", label: "GST & Discounts", icon: <CreditCard size={18} /> },
// //   {
// //   to: "/admin/inventory",
// //   label: "Inventory",
// //   icon: <Package size={18} />,
// // },
// // { to: "/admin/reports", label: "Reports", icon: <FileText size={18}/> },
// //   ];

// //   return (
// //     <div style={{ display: "flex", minHeight: "100vh", background: "#f6f9fc" }}>
// //       {/* ================= OVERLAY ================= */}
// //       {isMobile && isSidebarOpen && (
// //         <div
// //           onClick={() => setIsSidebarOpen(false)}
// //           style={{
// //             position: "fixed",
// //             inset: 0,
// //             background: "rgba(0,0,0,0.45)",
// //             zIndex: 90,
// //           }}
// //         />
// //       )}

// //       {/* ================= SIDEBAR ================= */}
// //       <aside
// //         style={{
// //           width: 250,
// //           background: "linear-gradient(180deg, #0f2e47 0%, #1a4d6f 100%)",
// //           color: "#fff",
// //           padding: "24px",
// //           position: "fixed",
// //           height: "100vh",
// //           zIndex: 100,
// //           transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
// //           transition: "0.35s",
// //         }}
// //       >
// //         <h3>AdminPanel</h3>

// //         <ul style={{ listStyle: "none", marginTop: 30, padding: 0 }}>
// //           {sidebarItems.map((item, i) => {
// //             const active = location.pathname === item.to;

// //             return (
// //               <li key={i} style={styles.navItem}>
// //                 <Link
// //                   to={item.to}
// //                   style={hoverStyle(hoveredLink === i, active)}
// //                   onMouseEnter={() => setHoveredLink(i)}
// //                   onMouseLeave={() => setHoveredLink(null)}
// //                   onClick={() => isMobile && setIsSidebarOpen(false)}
// //                 >
// //                   {item.icon} {item.label}
// //                 </Link>
// //               </li>
// //             );
// //           })}
// //         </ul>

// //         <button onClick={logout} style={styles.logout}>
// //           <LogOut size={18} /> Logout
// //         </button>
// //       </aside>

// //       {/* ================= MAIN ================= */}
// //       <main
// //         style={{
// //           flex: 1,
// //           marginLeft: !isMobile && isSidebarOpen ? 250 : 0,
// //           transition: "0.35s",
// //         }}
// //       >
// //         {/* ================= HEADER ================= */}
// //         <div
// //           style={{
// //             background: "#fff",
// //             padding: "12px 20px",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "space-between",
// //             position: "sticky",
// //             top: 0,
// //             zIndex: 50,
// //           }}
// //         >
// //           <button
// //             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
// //             style={{ background: "transparent", border: "none", cursor: "pointer" }}
// //           >
// //             <Menu size={26} />
// //           </button>

// //           <h3 style={{ margin: 0 }}>Admin Dashboard</h3>

// //           {/* PROFILE */}
// //           <div
// //             onClick={() => navigate("/admin/update-password")}
// //             style={{
// //               width: 40,
// //               height: 40,
// //               borderRadius: "50%",
// //               background: "#f1f5f9",
// //               display: "flex",
// //               alignItems: "center",
// //               justifyContent: "center",
// //               cursor: "pointer",
// //               border: "1px solid #e5e7eb",
// //             }}
// //             title="Update Password"
// //           >
// //             <User size={20} />
// //           </div>
// //         </div>

// //         {/* ================= CONTENT ================= */}
// //         <div style={{ padding: 24 }}>
// //           <Outlet />
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }

// // /* ================= STYLES ================= */

// // const styles = {
// //   navItem: {
// //     padding: "10px 0",
// //   },
// //   link: {
// //     display: "flex",
// //     alignItems: "center",
// //     gap: 12,
// //     color: "#fff",
// //     textDecoration: "none",
// //     fontSize: 15,
// //     fontWeight: 500,
// //     padding: "10px 14px",
// //     borderRadius: 8,
// //     transition: "0.25s",
// //   },
// //   logout: {
// //     background: "linear-gradient(135deg, #983a30 0%, #c0392b 100%)",
// //     border: "none",
// //     padding: "12px",
// //     color: "#fff",
// //     borderRadius: 8,
// //     marginTop: 20,
// //     cursor: "pointer",
// //     width: "100%",
// //     fontWeight: 600,
// //     display: "flex",
// //     justifyContent: "center",
// //     gap: 8,
// //   },
// // };


// import React, { useState, useEffect } from "react";
// import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
// import {
//   Users,
//   BarChart2,
//   LogOut,
//   Menu,
//   Grid,
//   Package,
//   User,
//   CreditCard,
//   Home,
//   Truck,
//   FileText,
//   Headphones,
// } from "react-feather";

// export default function AdminLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [hoveredLink, setHoveredLink] = useState(null);

//   /* ================= RESPONSIVE ================= */
//   useEffect(() => {
//     const handler = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener("resize", handler);
//     return () => window.removeEventListener("resize", handler);
//   }, []);

//   useEffect(() => {
//     setIsSidebarOpen(!isMobile);
//   }, [isMobile]);

//   const logout = () => {
//     localStorage.clear();
//     navigate("/login", { replace: true });
//   };

//   const sidebarItems = [
//     { to: "/admin", label: "Dashboard", icon: <BarChart2 size={18} /> },
//     { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
//     { to: "/admin/stores", label: "Stores / Warehouse", icon: <Home size={18} /> },
//     { to: "/admin/riders", label: "Delivery Partners", icon: <Truck size={18} /> },
//     { to: "/admin/CategoryManager", label: "Add Category", icon: <Grid size={18} /> },
//     { to: "/admin/priceanalytics", label: "Analytics", icon: <BarChart2 size={18} /> },
//     { to: "/admin/pricelist", label: "Add Product", icon: <Package size={18} /> },
//     { to: "/admin/orders", label: "Orders", icon: <Package size={18} /> },
//     { to: "/admin/payments", label: "Payments", icon: <CreditCard size={18} /> },
//     { to: "/admin/gst", label: "GST & Discounts", icon: <CreditCard size={18} /> },
//     { to: "/admin/inventory", label: "Inventory", icon: <Package size={18} /> },
//     { to: "/admin/reports", label: "Reports", icon: <FileText size={18} /> },
//     { to: "/admin/support", label: "Support", icon: <Headphones size={18} /> },
//   ];

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       {/* ================= SIDEBAR ================= */}
//       <aside
//         style={{
//           width: 250,
//           background: "linear-gradient(180deg,#0f2e47,#1a4d6f)",
//           color: "#fff",
//           position: "fixed",
//           height: "100vh",
//           zIndex: 100,
//           transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
//           transition: "0.3s",
//           padding: 20,
//         }}
//       >
//         <h3>Admin Panel</h3>

//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {sidebarItems.map((item, i) => {
//             const active = location.pathname.startsWith(item.to);
//             return (
//               <li key={i} style={{ marginBottom: 6 }}>
//                 <Link
//                   to={item.to}
//                   onMouseEnter={() => setHoveredLink(i)}
//                   onMouseLeave={() => setHoveredLink(null)}
//                   onClick={() => isMobile && setIsSidebarOpen(false)}
//                   style={{
//                     display: "flex",
//                     gap: 10,
//                     padding: "10px 14px",
//                     color: "#fff",
//                     borderRadius: 8,
//                     textDecoration: "none",
//                     background: active
//                       ? "#c0392b"
//                       : hoveredLink === i
//                       ? "rgba(255,255,255,0.15)"
//                       : "transparent",
//                   }}
//                 >
//                   {item.icon} {item.label}
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>

//         <button
//           onClick={logout}
//           style={{
//             marginTop: 20,
//             width: "100%",
//             padding: 10,
//             background: "#c0392b",
//             color: "#fff",
//             border: "none",
//             borderRadius: 8,
//             cursor: "pointer",
//           }}
//         >
//           <LogOut size={16} /> Logout
//         </button>
//       </aside>

//       {/* ================= MAIN ================= */}
//       <main
//         style={{
//           flex: 1,
//           marginLeft: !isMobile && isSidebarOpen ? 250 : 0,
//           transition: "0.3s",
//         }}
//       >
//         {/* HEADER */}
//         <div
//           style={{
//             background: "#fff",
//             padding: "12px 20px",
//             display: "flex",
//             justifyContent: "space-between",
//             position: "sticky",
//             top: 0,
//             zIndex: 50,
//           }}
//         >
//           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
//             <Menu />
//           </button>
//           <h3>Admin Dashboard</h3>
//           <User />
//         </div>

//         <div style={{ padding: 24 }}>
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  BarChart2,
  LogOut,
  Menu,
  Grid,
  Package,
  User,
  CreditCard,
  Home,
  Truck,
  FileText,
  Headphones,
    CheckSquare,
} from "react-feather";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredLink, setHoveredLink] = useState(null);

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  /* ================= SIDEBAR ITEMS ================= */
  const sidebarItems = [
    { to: "/admin", label: "Dashboard", icon: <BarChart2 size={18} /> },
    { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
    { to: "/admin/stores", label: "Stores / Warehouse", icon: <Home size={18} /> },
    { to: "/admin/riders", label: "Delivery Partners", icon: <Truck size={18} /> },
      {
      to: "/admin/vendor-approval",
      label: "Vendor Approval",
      icon: <CheckSquare size={18} />,
    },
    { to: "/admin/CategoryManager", label: "Add Category", icon: <Grid size={18} /> },
    { to: "/admin/priceanalytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    { to: "/admin/pricelist", label: "Add Product", icon: <Package size={18} /> },
    { to: "/admin/orders", label: "Orders", icon: <Package size={18} /> },
    { to: "/admin/payments", label: "Payments", icon: <CreditCard size={18} /> },
    { to: "/admin/gst", label: "GST & Discounts", icon: <CreditCard size={18} /> },
    { to: "/admin/inventory", label: "Inventory", icon: <Package size={18} /> },
    { to: "/admin/reports", label: "Reports", icon: <FileText size={18} /> },
    { to: "/admin/support", label: "Support", icon: <Headphones size={18} /> },
  ];

  /* ================= LINK STYLE ================= */
  const linkStyle = (hover, active) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
    background: active
      ? "linear-gradient(135deg, #983a30 0%, #c0392b 100%)"
      : hover
      ? "rgba(255,255,255,0.15)"
      : "transparent",
    transition: "0.25s",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6f9fc", position: "relative" }}>
      {/* ================= OVERLAY (MOBILE) ================= */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 99, // Lower than sidebar but still covers content
          }}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          width: 250,
          height: "100vh",
          background: "linear-gradient(180deg, #0f2e47 0%, #1a4d6f 100%)",
          color: "#fff",
          position: "fixed",
          zIndex: 100, // Keep this at 100
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "0.35s",
          display: "flex",
          flexDirection: "column",
          padding: 20,
        }}
      >
        <h3 style={{ marginBottom: 20 }}>Admin Panel</h3>

        {/* ===== Scrollable Menu (Scrollbar Hidden) ===== */}
        <ul
          className="sidebar-scroll"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            flex: 1,
            overflowY: "auto",
          }}
        >
          {sidebarItems.map((item, i) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <li key={i} style={{ marginBottom: 6 }}>
                <Link
                  to={item.to}
                  style={linkStyle(hoveredLink === i, active)}
                  onMouseEnter={() => setHoveredLink(i)}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  {item.icon} {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ===== Logout ===== */}
        <button
          onClick={logout}
          style={{
            background: "linear-gradient(135deg, #983a30 0%, #c0392b 100%)",
            border: "none",
            padding: 12,
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <main
        style={{
          flex: 1,
          marginLeft: !isMobile && isSidebarOpen ? 250 : 0,
          transition: "0.35s",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* ================= HEADER ================= */}
        <div
          style={{
            background: "#fff",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 49, // Lower than sidebar
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Menu size={26} />
          </button>

          <h3 style={{ margin: 0 }}>Admin Dashboard</h3>

          <div
            onClick={() => navigate("/admin/update-password")}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "1px solid #e5e7eb",
            }}
          >
            <User size={20} />
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div style={{ padding: 24, position: "relative" }}>
          <Outlet />
        </div>
      </main>

      {/* ===== Scrollbar Hide CSS ===== */}
      <style>
        {`
          .sidebar-scroll::-webkit-scrollbar {
            display: none;
          }
          .sidebar-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}
      </style>
    </div>
  );
}