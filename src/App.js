import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================= AUTH ================= */
import Login from "./pages/Login";
import Signup from "./pages/Signup";

/* ================= VENDOR ================= */
import VendorAuth from "./pages/vendor/VendorAuth";
import VendorLayout from "./pages/vendor/VendorLayout";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorCategoryManager from "./pages/vendor/VendorCategoryManager";
import VendorProduct from "./pages/vendor/VendorProduct";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorInventory from "./pages/vendor/VendorInventory";
import VendorBulkDiscount from "./pages/vendor/VendorBulkDiscount";
import VendorUsers from "./pages/vendor/VendorUsers";
import Invoice from "./pages/vendor/invoice";
import EstimateInvoice from "./pages/vendor/EstimateInvoice";
/* ================= ADMIN LAYOUT ================= */
import AdminLayout from "./pages/admin/AdminLayout";

/* ================= ADMIN PAGES ================= */
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Brokers from "./pages/admin/Brokers";
import Transactions from "./pages/admin/Transactions";
import Settings from "./pages/admin/Settings";
import PriceList from "./pages/PriceList";
import CategoryManager from "./pages/admin/CategoryManager";
import PriceAnalytics from "./pages/admin/PriceAnalytics";
import ProductList from "./pages/admin/ProductList";
import CategoryList from "./pages/admin/CategoryList";
import DescriptionManager from "./pages/admin/DescriptionManager";
import HistoryList from "./pages/admin/HistoryList";
import AdminUpdatePassword from "./pages/admin/AdminUpdatePassword";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminGST from "./pages/admin/AdminGST";
import AdminInventory from "./pages/admin/AdminInventory";
import Stores from "./pages/admin/Stores";
import Riders from "./pages/admin/Riders";
import Reports from "./pages/admin/Reports";
import Support from "./pages/admin/Support";

/* ================= ADMIN – VENDOR APPROVAL ================= */
import AdminVendorApproval from "./pages/admin/AdminVendorApproval";

/* ================= ADMIN PRIVATE ROUTE ================= */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token"); // admin token
  return token ? children : <Navigate to="/login" replace />;
}

/* ================= APP ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= ROOT ================= */}
        <Route path="/" element={<Navigate to="/vendor/login" replace />} />

        {/* ================= ADMIN AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ================= VENDOR AUTH ================= */}
        <Route path="/vendor/login" element={<VendorAuth />} />

        {/* ================= VENDOR PANEL ================= */}
        {/* 🔐 VendorLayout khud token check karega */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="categories" element={<VendorCategoryManager />} />
          <Route path="products" element={<VendorProduct />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="inventory" element={<VendorInventory />} />
          <Route path="bulk-discounts" element={<VendorBulkDiscount />} />
          <Route path="users" element={<VendorUsers />} />
            <Route path="invoice" element={<Invoice />} />
  <Route path="estimate" element={<EstimateInvoice />} />
        </Route>

        {/* ================= ADMIN PANEL ================= */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="stores" element={<Stores />} />
          <Route path="riders" element={<Riders />} />
          <Route path="brokers" element={<Brokers />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="CategoryManager" element={<CategoryManager />} />
          <Route path="pricelist" element={<PriceList />} />
          <Route path="productlist" element={<ProductList />} />
          <Route path="priceanalytics" element={<PriceAnalytics />} />
          <Route path="categorylist" element={<CategoryList />} />
          <Route path="descriptionmanager" element={<DescriptionManager />} />
          <Route path="historylist" element={<HistoryList />} />
          <Route path="update-password" element={<AdminUpdatePassword />} />
          <Route path="gst" element={<AdminGST />} />
          <Route path="inventory" element={<AdminInventory />} />


          <Route path="reports" element={<Reports />} />
          <Route path="support" element={<Support />} />

          {/* 🔥 Vendor Approval */}
          <Route path="vendor-approval" element={<AdminVendorApproval />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
