import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Inventory.css";

const API = "https://grocerrybackend.onrender.com/api";

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    product: "",
    sku: "",
    hsnCode: "",
    stock: "",
    minStock: "",
    costPrice: "",
    sellingPrice: "",
    gstPercent: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    loadProducts();
    loadInventory();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(API + "/prices");
      const list = [];

      res.data.data.forEach(c =>
        c.subcategories.forEach(s =>
          s.products.forEach(p => list.push(p))
        )
      );

      setProducts(list);
    } catch (err) {
      console.log("Product load error", err);
    }
  };

  const loadInventory = async () => {
    try {
      const res = await axios.get(API + "/inventory/all");
      setInventory(res.data.data || []);
    } catch (err) {
      console.log("Inventory load error", err);
      setInventory([]);
    }
  };

  /* ================= SAVE ================= */

  const save = async () => {
    if (!form.product || !form.stock || !form.sellingPrice) {
      alert("Product, Stock & Selling Price required");
      return;
    }

    setLoading(true);

    try {
      await axios.post(API + "/inventory/set", {
        product: form.product,
        sku: form.sku,
        hsnCode: form.hsnCode,
        stock: Number(form.stock),
        minStock: Number(form.minStock || 0),
        costPrice: Number(form.costPrice || 0),
        sellingPrice: Number(form.sellingPrice),
        gstPercent: Number(form.gstPercent || 0),
      });

      alert("Inventory saved");

      setForm({
        product: "",
        sku: "",
        hsnCode: "",
        stock: "",
        minStock: "",
        costPrice: "",
        sellingPrice: "",
        gstPercent: "",
      });

      setShowForm(false);
      loadInventory();
    } catch (err) {
      alert("Save failed");
    }

    setLoading(false);
  };

  /* ================= UI ================= */

  return (
    <div className="inv-container">
      <div className="inv-header">
        <h2>Inventory Manager</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Inventory"}
        </button>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="inv-form">
          <select
            value={form.product}
            onChange={e => setForm({ ...form, product: e.target.value })}
          >
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <input placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          <input placeholder="HSN" value={form.hsnCode} onChange={e => setForm({ ...form, hsnCode: e.target.value })} />
          <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          <input type="number" placeholder="Min Stock" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
          <input type="number" placeholder="Cost Price" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
          <input type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} />
          <input type="number" placeholder="GST %" value={form.gstPercent} onChange={e => setForm({ ...form, gstPercent: e.target.value })} />

          <button onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save Inventory"}
          </button>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
            <th>Min</th>
            <th>Selling</th>
            <th>GST</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: "center" }}>No Inventory</td></tr>
          )}

          {inventory.map(i => (
            <tr key={i._id}>
              <td>{i.product?.name}</td>
              <td>{i.stock}</td>
              <td>{i.minStock}</td>
              <td>₹{i.sellingPrice}</td>
              <td>{i.gstPercent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
