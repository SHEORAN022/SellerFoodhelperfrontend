import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PriceHistoryPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get("https://grocerrybackend.onrender.com/api/history")
      .then(res => setRows(res.data.data));
  }, []);

  return (
    <div>
      <h1>Product History</h1>

      <table className="history-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Action</th>
            <th>Old Data</th>
            <th>New Data</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((h) => (
            <tr key={h._id}>
              <td>{h.productName}</td>
              <td>{h.action}</td>
              <td><pre>{JSON.stringify(h.oldData, null, 2)}</pre></td>
              <td><pre>{JSON.stringify(h.newData, null, 2)}</pre></td>
              <td>{new Date(h.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}