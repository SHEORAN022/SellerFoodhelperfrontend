import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Stores.css";

const API = "https://foodhelpervendor.onrender.com/api/stores";

export default function Stores() {
  const emptyForm = {
    name: "",
    type: "hub",
    status: "active",
    address: "",
    openingTime: "06:00 AM",
    closingTime: "11:00 PM",
  };

  const [stores, setStores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const loadStores = async () => {
    try {
      const res = await axios.get(API);
      setStores(res.data.data || []);
    } catch {
      alert("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const submitStore = async () => {
    if (!form.name) return alert("Store name required");

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, form);
      } else {
        await axios.post(API, form);
      }

      setShowModal(false);
      setEditId(null);
      setForm(emptyForm);
      loadStores();
    } catch {
      alert("Save failed");
    }
  };

  const editStore = (store) => {
    setForm(store);
    setEditId(store._id);
    setShowModal(true);
  };

  const deleteStore = async (id) => {
    if (!window.confirm("Delete this store?")) return;
    await axios.delete(`${API}/${id}`);
    loadStores();
  };

  return (
    <div className="stores-page">
      <div className="stores-header">
        <h2>🏬 Stores & Warehouses</h2>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Add Store
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="stores-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Timing</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s, i) => (
              <tr key={s._id}>
                <td>{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.type}</td>
                <td>
                  <span className={`badge ${s.status}`}>{s.status}</span>
                </td>
                <td>{s.openingTime} - {s.closingTime}</td>
                <td>{s.address}</td>
                <td className="actions">
                  <button className="edit" onClick={() => editStore(s)}>Edit</button>
                  <button className="delete" onClick={() => deleteStore(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-bg">
          <div className="modal-card">
            <h3>{editId ? "Edit Store" : "Add Store"}</h3>

            <input
              placeholder="Store Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <div className="row">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="hub">Hub</option>
                <option value="warehouse">Warehouse</option>
                <option value="store">Store</option>
              </select>

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <div className="row">
              <input
                value={form.openingTime}
                onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
              />
              <input
                value={form.closingTime}
                onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="save" onClick={submitStore}>
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
