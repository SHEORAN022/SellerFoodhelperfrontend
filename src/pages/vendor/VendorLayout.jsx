import React, { useState, useEffect } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  Menu,
  LogOut,
  Home,
  Package,
  ShoppingCart,
  User,
  Bell,
  Layers,
   Percent,
     Users,
} from "lucide-react";

export default function VendorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= AUTH CHECK (VERY IMPORTANT) ================= */
  const vendorToken = localStorage.getItem("vendorToken");

  if (!vendorToken) {
    return (
      <Navigate
        to="/vendor/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("vendorToken");
    navigate("/vendor/login");
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

  /* ================= SIDEBAR MENU ================= */
  const menuItems = [
    { to: "/vendor/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    // { to: "/vendor/categories", label: "Categories", icon: <Layers size={20} /> },
    { to: "/vendor/products", label: "Products", icon: <Package size={20} /> },
//       {
//  to: "/vendor/bulk-discounts",
//     label: "Bulk Discounts",
//     icon: <Percent size={20} />,
//   },
    { to: "/vendor/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { to: "/vendor/users", label: "Customers", icon: <Users size={20} /> },
    { to: "/vendor/profile", label: "Profile", icon: <User size={20} /> },
    { to: "/vendor/inventory", label: "Inventory", icon: <Package /> },

  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* ================= SIDEBAR OVERLAY (Mobile) ================= */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
          }}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          width: 260,
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          position: "fixed",
          height: "100vh",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3 style={{ margin: 0 }}>Seller Panel</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
            Manage your store
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: 12 }}>
          {menuItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                marginBottom: 6,
                borderRadius: 10,
                color: isActive ? "#fff" : "#cbd5e1",
                background: isActive
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                  : "transparent",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 500,
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: 12,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: 12,
              background: "#dc2626",
              border: "none",
              color: "#fff",
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontWeight: 600,
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main
        style={{
          flex: 1,
          marginLeft: !isMobile && isSidebarOpen ? 260 : 0,
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: "#fff",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: "#f1f5f9",
              border: "none",
              width: 40,
              height: 40,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <Menu size={20} />
          </button>

          <div style={{ display: "flex", gap: 12 }}>
            <Bell size={20} />
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#6366f1",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
              }}
            >
              V
            </div>
          </div>
        </header>

        {/* 🔥 ROUTED CONTENT */}
        <div style={{ flex: 1, padding: 24, background: "#f8fafc" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
