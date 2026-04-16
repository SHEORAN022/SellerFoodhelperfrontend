import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Riders.css";

const API = "https://foodhelpervendor.onrender.com/api/riders";

export default function Riders() {
  const empty = {
    name: "",
    phone: "",
    baseLocation: "",
    vehicleType: "bike",
    status: "offline",
  };

  const [riders, setRiders] = useState([]);
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const res = await axios.get(API);
    setRiders(res.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.name || !form.phone) return alert("Required fields");

    if (editId) {
      await axios.put(`${API}/${editId}`, form);
    } else {
      await axios.post(API, form);
    }
    setShow(false);
    setEditId(null);
    setForm(empty);
    load();
  };

  const edit = (r) => {
    setForm(r);
    setEditId(r._id);
    setShow(true);
  };

  const del = async (id) => {
    if (!window.confirm("Delete rider?")) return;
    await axios.delete(`${API}/${id}`);
    load();
  };

  return (
    <div className="riders-page">
      <div className="header">
        <h2>🚚 Delivery Partners</h2>
        <button onClick={() => setShow(true)}>+ Add Rider</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Vehicle</th>
            <th>Deliveries</th>
            <th>Earnings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {riders.map((r) => (
            <tr key={r._id}>
              <td>{r.name}</td>
              <td>{r.phone}</td>
              <td>
                <span className={`badge ${r.status}`}>{r.status}</span>
              </td>
              <td>{r.vehicleType}</td>
              <td>{r.deliveries}</td>
              <td>₹{r.earnings}</td>
              <td>
                <button onClick={() => edit(r)}>✏️</button>
                <button onClick={() => del(r._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <div className="modal">
          <div className="card">
            <h3>{editId ? "Edit Rider" : "Add Rider"}</h3>

            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              placeholder="Base Location"
              value={form.baseLocation}
              onChange={(e) =>
                setForm({ ...form, baseLocation: e.target.value })
              }
            />

            <select
              value={form.vehicleType}
              onChange={(e) =>
                setForm({ ...form, vehicleType: e.target.value })
              }
            >
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
              <option value="cycle">Cycle</option>
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="on_delivery">On Delivery</option>
            </select>

            <div className="actions">
              <button onClick={save}>Save</button>
              <button onClick={() => setShow(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
