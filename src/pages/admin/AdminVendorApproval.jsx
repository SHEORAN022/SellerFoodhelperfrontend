import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://foodhelpervendor.onrender.com/api/admin";

export default function AdminVendorApproval() {
  const [vendors, setVendors] = useState([]);

  // 🔥 SAME TOKEN AS ADMIN LOGIN
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${API}/vendors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVendors(res.data);
    } catch (err) {
      alert("Failed to load vendors");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API}/vendor/${id}`,   // ✅ FIXED (removed /status)
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchVendors();
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vendor Approvals</h2>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {vendors.map((v) => (
            <tr key={v._id}>
              <td>{v.name}</td>
              <td>{v.email}</td>
              <td>{v.phone || "-"}</td>
              <td>
                <b
                  style={{
                    color:
                      v.status === "APPROVED"
                        ? "green"
                        : v.status === "REJECTED"
                        ? "red"
                        : "orange",
                  }}
                >
                  {v.status}
                </b>
              </td>
              <td>
                {v.status === "PENDING" && (
                  <>
                    <button onClick={() => updateStatus(v._id, "APPROVED")}>
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(v._id, "REJECTED")}
                      style={{ marginLeft: "10px" }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
