import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://grocerrybackend.onrender.com/api/payments/admin";

export default function AdminPayments() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(API, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setData(res.data.data))
      .catch((err) => {
        console.error("Payments fetch error", err);
        alert("Failed to load payments");
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>💳 Payments</h2>

      {data.length === 0 && <p>No payments found</p>}

      {data.map((p) => (
        <div
          key={p._id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
            background: "#fff",
          }}
        >
          <b>{p.user?.name || "User"}</b>
          <p>Amount: ₹{p.amount}</p>
          <p>Status: {p.status}</p>
          <p>Payment ID: {p.razorpayPaymentId || "Pending"}</p>
          <p>Order ID: {p.order?._id}</p>
        </div>
      ))}
    </div>
  );
}
