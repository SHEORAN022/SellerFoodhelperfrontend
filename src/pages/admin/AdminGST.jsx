// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./AdminGST.css";

// const API = "https://foodhelpervendor.onrender.com/api";

// export default function AdminGST() {
//   /* ================= STATE ================= */
//   const [products, setProducts] = useState([]);
//   const [productId, setProductId] = useState("");

//   const [gst, setGst] = useState("");
//   const [hsn, setHsn] = useState("");
//   const [taxType, setTaxType] = useState("cgst_sgst");

//   const [minQty, setMinQty] = useState("");
//   const [maxQty, setMaxQty] = useState("");
//   const [unitPrice, setUnitPrice] = useState("");

//   const [gstList, setGstList] = useState([]);
//   const [discountList, setDiscountList] = useState([]);

//   const [editId, setEditId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   /* ================= LOAD PRODUCTS ================= */
//   const loadProducts = async () => {
//     try {
//       const res = await axios.get(`${API}/prices`);
//       const list = [];

//       res.data?.data?.forEach(c =>
//         c.subcategories?.forEach(s =>
//           s.products?.forEach(p => list.push(p))
//         )
//       );

//       setProducts(list);
//     } catch (err) {
//       console.error("Product load error", err);
//       setProducts([]);
//     }
//   };

//   /* ================= LOAD GST ================= */
//   const loadGST = async () => {
//     try {
//       const res = await axios.get(`${API}/gst/all`);
//       setGstList(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("GST load error", err);
//       setGstList([]);
//     }
//   };

//   /* ================= LOAD DISCOUNTS (100% SAFE) ================= */
//   const loadDiscount = async () => {
//     try {
//       const res = await axios.get(`${API}/discount/all`);

//       let list = [];

//       if (Array.isArray(res.data)) {
//         list = res.data;
//       } else if (Array.isArray(res.data?.data)) {
//         list = res.data.data;
//       } else if (Array.isArray(res.data?.data?.data)) {
//         list = res.data.data.data;
//       }

//       setDiscountList(list);
//     } catch (err) {
//       console.error("Discount load error", err);
//       setDiscountList([]);
//     }
//   };

//   useEffect(() => {
//     loadProducts();
//     loadGST();
//     loadDiscount();
//   }, []);

//   /* ================= SAVE GST ================= */
//   const saveGST = async () => {
//     if (!productId || !gst || !hsn) {
//       alert("Select product, GST & HSN");
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post(`${API}/gst/set`, {
//         productId,
//         gstPercent: Number(gst),
//         hsnCode: hsn,
//         taxType,
//       });
//       alert("GST Saved");
//       setGst("");
//       setHsn("");
//       loadGST();
//     } catch {
//       alert("GST save failed");
//     }
//     setLoading(false);
//   };

//   /* ================= CREATE / UPDATE DISCOUNT ================= */
//   const saveDiscount = async () => {
//     if (!productId || !minQty || !unitPrice) {
//       alert("Fill Product, Min Qty & Unit Price");
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         product: productId,
//         minQty: Number(minQty),
//         maxQty: maxQty ? Number(maxQty) : null,
//         unitPrice: Number(unitPrice),
//       };

//       if (editId) {
//         await axios.put(`${API}/discount/${editId}`, payload);
//         alert("Discount Updated");
//       } else {
//         await axios.post(`${API}/discount/add`, payload);
//         alert("Discount Added");
//       }

//       resetDiscountForm();
//       loadDiscount();
//     } catch {
//       alert("Discount operation failed");
//     }
//     setLoading(false);
//   };

//   /* ================= EDIT ================= */
//   const editDiscount = (d) => {
//     setEditId(d._id);
//     setProductId(d.product?._id || "");
//     setMinQty(d.minQty);
//     setMaxQty(d.maxQty || "");
//     setUnitPrice(d.unitPrice);
//   };

//   /* ================= DELETE ================= */
//   const deleteDiscount = async (id) => {
//     if (!window.confirm("Delete this discount rule?")) return;
//     await axios.delete(`${API}/discount/${id}`);
//     loadDiscount();
//   };

//   const resetDiscountForm = () => {
//     setEditId(null);
//     setMinQty("");
//     setMaxQty("");
//     setUnitPrice("");
//   };

//   return (
//     <div className="gst-container">
//       <h2 className="gst-title">GST & Price-based Discount Manager</h2>

//       {/* PRODUCT */}
//       <div className="section">
//         <label>Select Product</label>
//         <select value={productId} onChange={e => setProductId(e.target.value)}>
//           <option value="">Select Product</option>
//           {products.map(p => (
//             <option key={p._id} value={p._id}>{p.name}</option>
//           ))}
//         </select>
//       </div>

//       {/* GST */}
//       <div className="section">
//         <h3>GST Setup</h3>
//         <input placeholder="GST %" value={gst} onChange={e => setGst(e.target.value)} />
//         <input placeholder="HSN Code" value={hsn} onChange={e => setHsn(e.target.value)} />
//         <select value={taxType} onChange={e => setTaxType(e.target.value)}>
//           <option value="cgst_sgst">CGST + SGST</option>
//           <option value="igst">IGST</option>
//         </select>
//         <button onClick={saveGST} disabled={loading}>Save GST</button>
//       </div>

//       {/* DISCOUNT */}
//       <div className="section">
//         <h3>Quantity Discount (Unit Price)</h3>
//         <input placeholder="Min Qty" value={minQty} onChange={e => setMinQty(e.target.value)} />
//         <input placeholder="Max Qty (optional)" value={maxQty} onChange={e => setMaxQty(e.target.value)} />
//         <input placeholder="Unit Price ₹" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />

//         <button onClick={saveDiscount} disabled={loading}>
//           {editId ? "Update Discount" : "Add Discount"}
//         </button>

//         {editId && <button onClick={resetDiscountForm}>Cancel</button>}
//       </div>

//       {/* DISCOUNT TABLE */}
//       <div className="section">
//         <h3>Quantity Discounts</h3>
//         <table>
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Qty Range</th>
//               <th>Unit Price</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {discountList.length > 0 ? (
//               discountList.map(d => (
//                 <tr key={d._id}>
//                   <td>{d.product?.name}</td>
//                   <td>{d.minQty} – {d.maxQty ?? "∞"}</td>
//                   <td>₹{d.unitPrice}</td>
//                   <td>
//                     <button onClick={() => editDiscount(d)}>Edit</button>
//                     <button onClick={() => deleteDiscount(d._id)}>Delete</button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" style={{ textAlign: "center" }}>
//                   No discount rules found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, Percent, Hash, Layers, Save, Plus, Edit2, Trash2 } from "react-feather";
import "./AdminGST.css";

const API = "https://foodhelpervendor.onrender.com/api";

export default function AdminGST() {

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");

  const [gst, setGst] = useState("");
  const [hsn, setHsn] = useState("");
  const [taxType, setTaxType] = useState("cgst_sgst");

  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const [gstList, setGstList] = useState([]);
  const [discountList, setDiscountList] = useState([]);

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {
    const res = await axios.get(`${API}/prices`);
    const list = [];
    res.data.data.forEach(c =>
      c.subcategories.forEach(s =>
        s.products.forEach(p => list.push(p))
      )
    );
    setProducts(list);
  };

  /* ================= LOAD GST ================= */
  const loadGST = async () => {
    const res = await axios.get(`${API}/gst/all`);
    setGstList(Array.isArray(res.data) ? res.data : []);
  };

  /* ================= LOAD DISCOUNTS (FIXED) ================= */
  const loadDiscount = async () => {
    const res = await axios.get(`${API}/discount/all`);

    // ✅ backend sends { success, count, data: [] }
    setDiscountList(Array.isArray(res.data?.data) ? res.data.data : []);
  };

  useEffect(() => {
    loadProducts();
    loadGST();
    loadDiscount();
  }, []);

  /* ================= SAVE GST ================= */
  const saveGST = async () => {
    if (!productId || !gst || !hsn) return alert("Fill all GST fields");

    await axios.post(`${API}/gst/set`, {
      productId,
      gstPercent: Number(gst),
      hsnCode: hsn,
      taxType,
    });

    setGst(""); setHsn("");
    loadGST();
  };

  /* ================= CREATE / UPDATE DISCOUNT ================= */
  const saveDiscount = async () => {
    if (!productId || !minQty || !unitPrice)
      return alert("Fill Product, Min Qty & Unit Price");

    const payload = {
      product: productId,
      minQty: Number(minQty),
      maxQty: maxQty ? Number(maxQty) : null,
      unitPrice: Number(unitPrice),
    };

    if (editId) {
      await axios.put(`${API}/discount/${editId}`, payload);
    } else {
      await axios.post(`${API}/discount/add`, payload);
    }

    resetDiscount();
    loadDiscount();
  };

  /* ================= EDIT ================= */
  const editDiscount = d => {
    setEditId(d._id);
    setProductId(d.product?._id);
    setMinQty(d.minQty);
    setMaxQty(d.maxQty || "");
    setUnitPrice(d.unitPrice);
  };

  /* ================= DELETE ================= */
  const deleteDiscount = async id => {
    if (!window.confirm("Delete discount rule?")) return;
    await axios.delete(`${API}/discount/${id}`);
    loadDiscount();
  };

  const resetDiscount = () => {
    setEditId(null);
    setMinQty("");
    setMaxQty("");
    setUnitPrice("");
  };

  return (
    <div className="tm-gst-wrapper">
      <h2 className="tm-gst-title">GST & Bulk Price Manager</h2>

      {/* ================= DISCOUNT FORM ================= */}
      <div className="tm-gst-card">
        <h3>Bulk Price Rule</h3>

        <select value={productId} onChange={e => setProductId(e.target.value)}>
          <option value="">Select Product</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <input placeholder="Min Qty" type="number" value={minQty}
          onChange={e => setMinQty(e.target.value)} />

        <input placeholder="Max Qty (optional)" type="number" value={maxQty}
          onChange={e => setMaxQty(e.target.value)} />

        <input placeholder="Unit Price ₹" type="number" value={unitPrice}
          onChange={e => setUnitPrice(e.target.value)} />

        <button onClick={saveDiscount}>
          {editId ? "Update Rule" : "Add Rule"}
        </button>

        {editId && <button onClick={resetDiscount}>Cancel</button>}
      </div>

      {/* ================= DISCOUNT TABLE ================= */}
      <div className="tm-gst-card">
        <h3>Bulk Discount Rules</h3>

        <table className="tm-gst-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty Range</th>
              <th>Unit Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {discountList.length ? discountList.map(d => (
              <tr key={d._id}>
                <td>{d.product?.name}</td>
                <td>{d.minQty} – {d.maxQty ?? "∞"}</td>
                <td>₹{d.unitPrice}</td>
                <td>
                  <Edit2 onClick={() => editDiscount(d)} />
                  <Trash2 onClick={() => deleteDiscount(d._id)} />
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4">No rules found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
