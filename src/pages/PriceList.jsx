// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./PriceList.css"
// const API_URL = "https://grocerrybackend.onrender.com/api/prices";
// const CATEGORY_URL = "https://grocerrybackend.onrender.com/api/categories";

// export default function PriceList() {
//   const [items, setItems] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//     subcategory: "",
//     description: "",
//     basePrice: "",
//     profitLoss: "",
//     validTill: "",
//     file: null,
//     status: "inactive",
//   });

//   const [editId, setEditId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [activeMenu, setActiveMenu] = useState(null);

//   const [selectedItems, setSelectedItems] = useState([]);
//   const [bulkMode, setBulkMode] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 30;

//   const [filterCategory, setFilterCategory] = useState("");
//   const [filterSubcategory, setFilterSubcategory] = useState("");
//   const [filterSubs, setFilterSubs] = useState([]);

//   // Quick edit states for inline editing
//   const [quickBasePrices, setQuickBasePrices] = useState({});
//   const [quickProfitLoss, setQuickProfitLoss] = useState({});

//   // NEW: sort state
//   const [sortOrder, setSortOrder] = useState("");
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
// const [newCategoryName, setNewCategoryName] = useState("");
// const [categoryLoading, setCategoryLoading] = useState(false);
// const [alertBox, setAlertBox] = useState({
//   show: false,
//   message: "",
//   type: "success", // success | error | warning
// });


// useEffect(() => {
//   if (alertBox.show) {
//     const timer = setTimeout(() => {
//       setAlertBox((prev) => ({ ...prev, show: false }));
//     }, 2500);

//     return () => clearTimeout(timer);
//   }
// }, [alertBox.show]);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (categories.length > 0) fetchItems();
//   }, [categories]);

//   useEffect(() => {
//     if (!filterCategory) {
//       setFilterSubs([]);
//       setFilterSubcategory("");
//       return;
//     }
//     const cat = categories.find((c) => c._id === filterCategory);
//     setFilterSubs(cat?.subcategories || []);
//     setFilterSubcategory("");
//   }, [filterCategory, categories]);

//   useEffect(() => {
//     if (!form.category) {
//       setSubcategories([]);
//       setForm((prev) => ({ ...prev, subcategory: "" }));
//       return;
//     }
//     const cat = categories.find((c) => c._id === form.category);
//     setSubcategories(cat?.subcategories || []);
//   }, [form.category, categories]);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get(CATEGORY_URL);
//       if (res.data?.success) setCategories(res.data.categories || []);
//     } catch (err) {
//       console.error("Fetch categories error", err);
//       alert("Could not fetch categories");
//     }
//   }

// const fetchItems = async () => {
//   try {
//     setLoading(true);

//     const res = await axios.get(API_URL);

//     if (res.data?.success) {
//       const raw = res.data.data || [];   // 👈 backend ka grouped data

//       const flat = [];

//       // 🔥 Backend → Frontend flatten
//       raw.forEach((cat) => {
//         cat.subcategories.forEach((sub) => {
//           sub.products.forEach((p) => {
//             flat.push({
//               ...p,

//               category: {
//                 _id: cat.id,
//                 name: cat.name,
//                 image: cat.image,
//               },

//               subcategory: {
//                 _id: sub.id,
//                 name: sub.name,
//                 image: sub.image,
//               },
//             });
//           });
//         });
//       });

//       // newest first
//       flat.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//       setItems(flat);
//     }
//   } catch (err) {
//     console.error("Fetch items error", err);
//     alert("Could not fetch items");
//   } finally {
//     setLoading(false);
//   }
// };


//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (files?.length) {
//       setForm((p) => ({ ...p, file: files[0] }));
//     } else {
//       setForm((p) => ({ ...p, [name]: value }));
//     }
//   };


// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);

//   // 🛑 Duplicate product name check (PASTE HERE)
//   const nameExists = items.some(
//     (p) =>
//       p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
//       p._id !== editId
//   );

//   if (nameExists) {
//     // alert("❌ Product name already exists!");
//     setAlertBox({
//   show: true,
//   message: "❌ Product name already exists!",
//   type: "error",
// });

//     setLoading(false);
//     return;
//   }

//   try {
      

//       if (!form.name || !form.category || !form.basePrice) {
//         alert("Name, category & base price are required");
//         setLoading(false);
//         return;
//       }

//       const fd = new FormData();
//       fd.append("name", form.name.trim());
//       fd.append("category", form.category);

//       // if (form.subcategory) {
//       //   const sub = subcategories.find((s) => s._id === form.subcategory);
//       //   if (sub) {
//       //     fd.append("subcategory[id]", sub._id);
//       //     fd.append("subcategory[name]", sub.name);
//       //     fd.append("subcategory[image]", sub.image || "");
//       //   }
//       // }
// if (form.subcategory) {
//   const sub = subcategories.find((s) => s._id === form.subcategory);
//   if (sub) {
//     fd.append(
//       "subcategory",
//       JSON.stringify({
//         id: sub._id,
//         name: sub.name,
//         image: sub.image || ""
//       })
//     );
//   }
// } else {
//   fd.append("subcategory", JSON.stringify(null));
// }

//       fd.append("basePrice", form.basePrice);
//       fd.append("profitLoss", form.profitLoss || 0);
//       if (form.description) fd.append("description", form.description);
//       if (form.validTill) fd.append("validTill", form.validTill);
//       fd.append("status", form.status);
//       if (form.file) fd.append("file", form.file);

//       if (editId) {
//         await axios.put(`${API_URL}/${editId}`, fd);
//         // alert("Updated successfully");
//         setAlertBox({
//   show: true,
//   message: "✅ Product Update successfully",
//   type: "success",
// });

//       } else {
//         await axios.post(API_URL, fd);
//         // alert("Added successfully");
//         setAlertBox({
//   show: true,
//   message: "✅ Product added successfully",
//   type: "success",
// });

//       }

//       await fetchItems();
//       resetForm();
//     } catch (err) {
//       console.error("Save error", err);
//       if (err.response?.data?.message === "Product name already exists") {
//         alert("❌ Product name already exists!");
//       } else {
//         alert("Save failed!");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       name: "",
//       category: "",
//       subcategory: "",
//       description: "",
//       basePrice: "",
//       profitLoss: "",
//       validTill: "",
//       file: null,
//       status: "inactive",
//     });
//     setEditId(null);
//     setShowModal(false);
//     setShowForm(false);
//   };
// const handleAddCategory = async () => {
//   if (!newCategoryName.trim()) {
//     return alert("Category name is required");
//   }

//   try {
//     setCategoryLoading(true);

//     const res = await axios.post(CATEGORY_URL, {
//       name: newCategoryName.trim(),
//     });

//     if (res.data?.success) {
//       // alert("✅ Category added successfully");
//       setAlertBox({
//   show: true,
//   message: "✅ Category added successfully",
//   type: "success",
// });

//       setNewCategoryName("");
//       setShowCategoryModal(false);
//       await fetchCategories(); // ✅ dropdown auto refresh
//     } else {
//       alert("❌ Category add failed");

//     }
//   } catch (err) {
//     console.error("Add category error", err);
//     alert("❌ Error while adding category");
//   } finally {
//     setCategoryLoading(false);
//   }
// };

//   const handleEdit = (item) => {
//     setForm({
//       name: item.name || "",
//       category: item.category?._id?.toString() || "",
//       subcategory: item.subcategory?._id || "",
//       description: item.description || "",
//       basePrice: item.basePrice || "",
//       profitLoss: item.profitLoss || 0,
//       validTill: item.validTill ? item.validTill.split("T")[0] : "",
//       file: null,
//       status: item.status || "inactive",
//     });

//     const cat = categories.find((c) => c._id === item.category?._id);
//     setSubcategories(cat?.subcategories || []);

//     setEditId(item._id);
//     setShowModal(true);
//     setActiveMenu(null);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this item?")) return;
//     try {
//       await axios.delete(`${API_URL}/${id}`);
//       setItems((prev) => prev.filter((x) => x._id !== id));
//       setSelectedItems((prev) => prev.filter((x) => x !== id));
//       setActiveMenu(null);
//     } catch (err) {
//       console.error("Delete error", err);
//       // alert("Delete failed");
//       setAlertBox({
//   show: true,
//   message: "❌ Delete failed",
//   type: "error",
// });

//     }
//   };

//   const handleStatusToggle = async (item) => {
//     try {
//       const newStatus = item.status === "active" ? "inactive" : "active";
//       await axios.put(`${API_URL}/status/${item._id}`, { status: newStatus });
//       setItems((prev) => prev.map((x) => (x._id === item._id ? { ...x, status: newStatus } : x)));
//     } catch (err) {
//       console.error("Status toggle error", err);
//       alert("Status update failed");
//     }
//   };

//   const updateLocalItemField = (id, key, value) => {
//     setItems((prev) => prev.map((x) => (x._id === id ? { ...x, [key]: value } : x)));
//   };

//   const handleBulkSave = async () => {
//     if (!selectedItems.length) return alert("No items selected");

//     const updates = items
//       .filter((x) => selectedItems.includes(x._id))
//       .map((x) => ({
//         id: x._id,
//         basePrice: Number(x.basePrice),
//         profitLoss: Number(x.profitLoss),
//         status: x.status,
//       }));

//     try {
//       await axios.post(`${API_URL}/bulk-update`, { products: updates });
//       // alert("Bulk save successful");
//       setAlertBox({
//   show: true,
//   message: "✅ Bulk Save successfully",
//   type: "success",
// });

//       setBulkMode(false);
//       setSelectedItems([]);
//       fetchItems();
//     } catch (err) {
//       console.error("Bulk save error", err);
//       // alert("Bulk save failed");
//       setAlertBox({
//   show: true,
//   message: "❌ Bulk Save failed",
//   type: "error",
// });

//     }
//   };

//   const handleBulkDelete = async () => {
//     if (!selectedItems.length) return alert("No items selected");
//     if (!window.confirm("Delete selected items?")) return;

//     try {
//       await Promise.all(selectedItems.map((id) => axios.delete(`${API_URL}/${id}`)));
//       setSelectedItems([]);
//       fetchItems();
//       setBulkMode(false);
//     } catch (err) {
//       console.error("Bulk delete error", err);
//       // alert("Bulk delete failed");
//       setAlertBox({
//   show: true,
//   message: "❌ Bulk Delete failed",
//   type: "error",
// });

//     }
//   };

//   // Update Base Price inline
//   const updateBasePrice = async (item) => {
//     const newBase = Number(quickBasePrices[item._id] ?? item.basePrice);
//     if (isNaN(newBase)) return alert("Invalid Base Price");

//     try {
//       setLoading(true);
//       const fd = new FormData();
//       fd.append("name", item.name);
//       fd.append("category", item.category?._id);
//       // if (item.subcategory?.id) fd.append("subcategory", item.subcategory.id);
//       if (item.subcategory) {
//   fd.append("subcategory", JSON.stringify(item.subcategory));
// }

//       fd.append("description", item.description || "");
//       fd.append("basePrice", newBase);
//       fd.append("profitLoss", item.profitLoss);
//       fd.append("status", item.status);

//       const res = await axios.put(`${API_URL}/${item._id}`, fd);
//       if (res.data.success) {
//         await fetchItems();
//         setQuickBasePrices((p) => ({ ...p, [item._id]: undefined }));
//         // alert("Base price updated");
//         setAlertBox({
//   show: true,
//   message: "✅ Baseprice updated successfully",
//   type: "success",
// });

//       }
//     } catch (err) {
//       console.error(err);
//       // alert("Update failed");
//       setAlertBox({
//   show: true,
//   message: "❌ Update failed",
//   type: "error",
// });

//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update Profit/Loss inline using updateDiff
//   const updateProfitLoss = async (item) => {
//     const diff = Number(quickProfitLoss[item._id] ?? 0);
//     if (isNaN(diff)) return alert("Invalid Profit/Loss");

//     try {
//       setLoading(true);
//       const res = await axios.put(`${API_URL}/updateDiff/${item._id}`, { diff });
//       if (res.data.success) {
//         await fetchItems();
//         setQuickProfitLoss((p) => ({ ...p, [item._id]: undefined }));
//         // alert("Profit/Loss updated");
//         setAlertBox({
//   show: true,
//   message: "✅ Pofit/Loss Updated",
//   type: "success",
// });

//       }
//     } catch (err) {
//       console.error(err);
//       // alert("Update failed");
//       setAlertBox({
//   show: true,
//   message: "❌ Update failed",
//   type: "error",
// });

//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filtering
//   const filteredItems = items.filter((item) => {
//     const t = search.toLowerCase();
//     const matchText =
//       (item.name || "").toLowerCase().includes(t) ||
//       (item.category?.name || "").toLowerCase().includes(t) ||
//       (item.subcategory?.name || "").toLowerCase().includes(t);

//     const matchCategory = !filterCategory || item.category?._id === filterCategory;
//     const matchSub = !filterSubcategory || item.subcategory?._id === filterSubcategory;

//     return matchText && matchCategory && matchSub;
//   });

//   // NEW: SORTING
//   let sortedItems = [...filteredItems];
//   if (sortOrder === "low") {
//     sortedItems.sort((a, b) => (Number(a.salePrice) || 0) - (Number(b.salePrice) || 0));
//   } else if (sortOrder === "high") {
//     sortedItems.sort((a, b) => (Number(b.salePrice) || 0) - (Number(a.salePrice) || 0));
//   }

//   const indexOfLast = currentPage * itemsPerPage;
//   const currentItems = sortedItems.slice(indexOfLast - itemsPerPage, indexOfLast);
//   const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));

//   return (
//     <div className="container" style={styles.container}>
//       <div style={styles.header}>
//         <h1 style={styles.title}>Product Management</h1>
//       </div>

//       {/* <div style={{ marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}  className="top-bar" > */}

// <div className="top-bar">

//         <input
//           type="text"
//           placeholder="Search product, category or subcategory..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//           style={styles.searchInput}
//         />

//         {/* <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//           <label style={styles.smallLabel}>Sort</label>
//           <select
//             value={sortOrder}
//             onChange={(e) => setSortOrder(e.target.value)}
//             style={styles.sortSelect}
//           >
//             <option value="">Default</option>
//             <option value="low">Price: Low → High</option>
//             <option value="high">Price: High → Low</option>
//           </select>
//         </div> */}

//         <button
//           style={styles.addButton}
//           onClick={() => {
//             setShowForm(!showForm);
//             setEditId(null);
//           }}
//         >
//           {showForm ? "✖ Close" : "➕ Add Product"}
//         </button>
//       </div>

//       <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
//         <button
//           style={styles.exportButton}
//           onClick={() => window.open(`${API_URL}/export`, "_blank")}
//         >
//            Export CSV
//         </button>

//         <label style={{ cursor: "pointer" }}>
//           <input
//             type="file"
//             accept=".csv"
//             style={{ display: "none" }}
//             onChange={async (e) => {
//               try {
//                 const fd = new FormData();
//                 fd.append("file", e.target.files[0]);
//                 await axios.post(`${API_URL}/import`, fd);
//                 // alert("Imported successfully");
//                 setAlertBox({
//   show: true,
//   message: "✅ Imported successfully",
//   type: "success",
// });

//                 fetchItems();
//               } catch (err) {
//                 // alert("Import failed");
//                 setAlertBox({
//   show: true,
//   message: "❌ Import failed",
//   type: "error",
// });

//               }
//             }}
//           />
//           <span style={styles.importButton}> Import CSV</span>
//         </label>
//       </div>

//       <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
//         <select
//           value={filterCategory}
//           onChange={(e) => setFilterCategory(e.target.value)}
//           style={styles.select}
//         >
//           <option value="">Filter by Category</option>
//           {categories.map((c) => (
//             <option key={c._id} value={c._id}>
//               {c.name}
//             </option>
//           ))}
//         </select>

//         <select
//           value={filterSubcategory}
//           onChange={(e) => setFilterSubcategory(e.target.value)}
//           disabled={!filterSubs.length}
//           style={styles.select}
//         >
//           <option value="">Filter by Subcategory</option>
//           {filterSubs.map((s) => (
//             <option key={s._id} value={s._id}>
//               {s.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedItems.length > 0 && (
//         <div style={styles.bulkBar}>
//           {!bulkMode ? (
//             <div style={{ display: "flex", gap: 8 }}>
//               <button style={styles.btnDelete} onClick={handleBulkDelete}>
//                 🗑 Bulk Delete
//               </button>
//               <button style={styles.btnPrimary} onClick={() => setBulkMode(true)}>
//                 ✏ Bulk Edit
//               </button>
//             </div>
//           ) : (
//             <div style={styles.bulkPanel}>
//               <h3 style={styles.bulkPanelTitle}>✏ Bulk Edit Selected Items</h3>

//               {items
//                 .filter((item) => selectedItems.includes(item._id))
//                 .map((item) => (
//                   <div key={item._id} style={styles.bulkItemBox}>
//                     <h4 style={styles.bulkItemTitle}>{item.name}</h4>

//                     <div style={styles.formGrid}>
//                       <div style={styles.formGroup}>
//                         <label style={styles.label}>Base Price</label>
//                         <input
//                           type="number"
//                           value={item.basePrice}
//                           onChange={(e) => updateLocalItemField(item._id, "basePrice", Number(e.target.value))}
//                           style={styles.input}
//                         />
//                       </div>

//                       <div style={styles.formGroup}>
//                         <label style={styles.label}>Profit/Loss</label>
//                         <input
//                           type="number"
//                           value={item.profitLoss}
//                           onChange={(e) => updateLocalItemField(item._id, "profitLoss", Number(e.target.value))}
//                           style={styles.input}
//                         />
//                       </div>

//                       <div style={styles.formGroup}>
//                         <label style={styles.label}>Status</label>
//                         <select
//                           value={item.status}
//                           onChange={(e) => updateLocalItemField(item._id, "status", e.target.value)}
//                           style={styles.select}
//                         >
//                           <option value="active">active</option>
//                           <option value="inactive">inactive</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 ))}

//               <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
//                 <button style={styles.btnPrimary} onClick={handleBulkSave}>
//                   ✔ Save All
//                 </button>

//                 <button
//                   style={styles.btnPrimary}
//                   onClick={async () => {
//                     if (!selectedItems.length) return alert("No items selected");

//                     for (let id of selectedItems) await axios.post(`${API_URL}/copy/${id}`);

//                     // alert("Selected copied");
//                     setAlertBox({
//   show: true,
//   message: "✅ Selected Copied successfully",
//   type: "success",
// });

//                     fetchItems();
//                   }}
//                 >
//                   📄 Copy Selected
//                 </button>

//                 <button
//                   style={styles.btnPrimary}
//                   onClick={async () => {
//                     if (!selectedItems.length) return alert("No items selected");

//                     const res = await axios.post(
//                       `${API_URL}/export-selected`,
//                       { ids: selectedItems },
//                       { responseType: "blob" }
//                     );

//                     const url = window.URL.createObjectURL(new Blob([res.data]));
//                     const a = document.createElement("a");
//                     a.href = url;
//                     a.download = "selected.csv";
//                     a.click();
//                   }}
//                 >
//                    Export Selected
//                 </button>

//                 <button style={styles.btnCancel} onClick={() => setBulkMode(false)}>
//                   ✖ Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {showForm && (
//         <div style={styles.formCard}>
//           <h2 style={styles.formTitle}>➕ Add / Edit Product</h2>

//           <form onSubmit={handleSubmit}>
//             <div style={styles.formGrid}>
//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Product Name *</label>
//                 <input required name="name" value={form.name} onChange={handleChange} style={styles.input} />
//               </div>
// {/* 
//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Category *</label>
//                 <select required name="category" value={form.category} onChange={handleChange} style={styles.select}>
//                   <option value="">Select Category</option>
//                   {categories.map((c) => (
//                     <option value={c._id} key={c._id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </div> */}
// <div style={styles.formGroup}>
//   <label style={styles.label}>Category *</label>

//   <div style={{ display: "flex", gap: 8 }}>
//     <select
//       required
//       name="category"
//       value={form.category}
//       onChange={handleChange}
//       style={{ ...styles.select, flex: 1 }}
//     >
//       <option value="">Select Category</option>
//       {categories.map((c) => (
//         <option value={c._id} key={c._id}>
//           {c.name}
//         </option>
//       ))}
//     </select>

//     <button
//       type="button"
//       onClick={() => setShowCategoryModal(true)}
//       style={{
//         background: "#0b69ff",
//         color: "#fff",
//         border: "none",
//         borderRadius: 8,
//         padding: "8px 14px",
//         cursor: "pointer",
//         fontWeight: 700,
//         height: "40px",
//       }}
//     >
//       ➕
//     </button>
//   </div>
// </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Subcategory</label>
//                 <select
//                   name="subcategory"
//                   value={form.subcategory}
//                   onChange={handleChange}
//                   disabled={!subcategories.length}
//                   style={styles.select}
//                 >
//                   <option value="">Select Subcategory</option>
//                   {subcategories.map((s) => (
//                     <option value={s._id} key={s._id}>
//                       {s.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Base Price *</label>
//                 <input
//                   type="number"
//                   required
//                   name="basePrice"
//                   value={form.basePrice}
//                   onChange={handleChange}
//                   style={styles.input}
//                 />
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Profit/Loss</label>
//                 <input
//                   type="number"
//                   name="profitLoss"
//                   value={form.profitLoss}
//                   onChange={handleChange}
//                   style={styles.input}
//                 />
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Valid Till</label>
//                 <input type="date" name="validTill" value={form.validTill} onChange={handleChange} style={styles.input} />
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Image</label>
//                 <input type="file" accept="image/*" onChange={handleChange} style={styles.fileInput} />
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Status</label>
//                 <select name="status" value={form.status} onChange={handleChange} style={styles.select}>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>
//             </div>

//             <div style={styles.formGroup}>
//               <label style={styles.label}>Description</label>
//               <textarea name="description" value={form.description} onChange={handleChange} style={styles.textarea}></textarea>
//             </div>

//             <div style={styles.formActions}>
//               <button style={styles.btnPrimary} disabled={loading}>
//                 {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
//               </button>

//               <button type="button" style={styles.btnCancel} onClick={resetForm}>
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div style={styles.tableCard}>
//         <div style={styles.tableHeader}>
//           <h2 style={styles.tableTitle}>Items</h2>
//           <span style={styles.totalCount}>Total: {filteredItems.length}</span>
//         </div>

//         <div style={styles.tableWrapper}>
//           <table style={styles.table}>
//             <thead>
//               <tr>
//                 <th style={styles.th}>
//                   <input
//                     type="checkbox"
//                     checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
//                     onChange={() => {
//                       if (selectedItems.length === filteredItems.length) setSelectedItems([]);
//                       else setSelectedItems(filteredItems.map((x) => x._id));
//                     }}
//                   />
//                 </th>
//                 <th style={styles.th}>Sr</th>
//                 <th style={styles.th}>Image</th>
//                 <th style={styles.th}>Name</th>
//                 <th style={styles.th}>Category</th>
//                 <th style={styles.th}>Subcategory</th>
//                 <th style={styles.th}>Base Price</th>
//                 <th style={styles.th}>Profit/Loss</th>
//                 <th style={styles.th}>Sale Price</th>
//                 <th style={styles.th}>Price Lock</th>
//                 <th style={styles.th}>Teji/Maddi</th>
//                 <th style={styles.th}>Status</th>
//                 <th style={styles.th}>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {currentItems.map((item, i) => (
//                 <tr key={item._id} style={styles.tr}>
//                   <td style={styles.td}>
//                     <input
//                       type="checkbox"
//                       checked={selectedItems.includes(item._id)}
//                       onChange={() =>
//                         setSelectedItems((prev) =>
//                           prev.includes(item._id) ? prev.filter((x) => x !== item._id) : [...prev, item._id]
//                         )
//                       }
//                     />
//                   </td>

//                   <td style={styles.td}>{(currentPage - 1) * itemsPerPage + (i + 1)}</td>

//                   <td style={styles.td}>
//                     {item.image ? <img src={item.image} style={styles.tableImg} alt="" /> : "No Img"}
//                   </td>

//                   <td style={styles.td}>{item.name}</td>
//                   {/* <td style={styles.td}>{item.category?.name || "-"}</td>
//                   <td style={styles.td}>{item.subcategory?.name || "-"}</td> */}
//                   <td style={styles.td}>
//   {item.category ? (
//     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//       {item.category.image && (
//         <img
//           src={item.category.image}
//           alt="cat"
//           style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }}
//         />
//       )}
//       <span>{item.category.name}</span>
//     </div>
//   ) : "-"}
// </td>

// <td style={styles.td}>
//   {item.subcategory ? (
//     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//       {item.subcategory.image && (
//         <img
//           src={item.subcategory.image}
//           alt="subcat"
//           style={{ width: 26, height: 26, borderRadius: 4, objectFit: "cover" }}
//         />
//       )}
//       <span>{item.subcategory.name}</span>
//     </div>
//   ) : "-"}
// </td>


//                   {/* BASE PRICE - Editable */}
//                   <td style={styles.td}>
//                     <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                       <input
//                         type="number"
//                         value={quickBasePrices[item._id] !== undefined ? quickBasePrices[item._id] : item.basePrice}
//                         onChange={(e) => setQuickBasePrices((p) => ({ ...p, [item._id]: e.target.value }))}
//                         style={{ ...styles.input, padding: "6px 8px", width: 80 }}
//                       />
//                       <button style={styles.btnSmall} onClick={() => updateBasePrice(item)}>
//                         ✔
//                       </button>
//                     </div>
//                     <small style={{ color: "#28a745", display: "block", marginTop: 4 }}>Saved: ₹{item.basePrice}</small>
//                   </td>

//                   {/* PROFIT/LOSS - Editable */}
//                   <td style={styles.td}>
//                     <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                       <input
//                         type="number"
//                         placeholder="change"
//                         value={quickProfitLoss[item._id] ?? ""}
//                         onChange={(e) => setQuickProfitLoss((p) => ({ ...p, [item._id]: e.target.value }))}
//                         style={{ ...styles.input, padding: "6px 8px", width: 80 }}
//                       />
//                       <button style={styles.btnSmall} onClick={() => updateProfitLoss(item)}>
//                         ✔
//                       </button>
//                     </div>
//                     <small style={{ color: "#666", display: "block", marginTop: 4 }}>Current: {item.profitLoss}</small>
//                   </td>

//                   {/* SALE PRICE */}
//                   <td style={styles.td}>₹{item.salePrice}</td>

//                   {/* PRICE LOCK */}
//                   <td style={styles.td}>₹{item.lockedPrice}</td>

//                   {/* TEJI/MADDI */}
//                   <td style={styles.td}>
//                     {item.lockedPrice === 0 ? (
//                       <span style={{ color: "#6c757d", fontWeight: "600" }}>0</span>
//                     ) : (
//                       (() => {
//                         const teji = item.salePrice - item.lockedPrice;
//                         return (
//                           <span
//                             style={{
//                               color: teji >= 0 ? "#28a745" : "#dc3545",
//                               fontWeight: "600",
//                             }}
//                           >
//                             {teji >= 0 ? "▲" : "▼"} {Math.abs(teji)}
//                           </span>
//                         );
//                       })()
//                     )}
//                   </td>

//                   {/* STATUS */}
//                   <td style={styles.td}>
//                     <button
//                       style={item.status === "active" ? styles.statusActive : styles.statusInactive}
//                       onClick={() => handleStatusToggle(item)}
//                     >
//                       {item.status === "active" ? "Active" : "Inactive"}
//                     </button>
//                   </td>

//                   {/* ACTIONS */}
//                   <td style={styles.td}>
//                     <div style={{ position: "relative" }}>
//                       <button
//                         style={styles.menuButton}
//                         onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)}
//                       >
//                         ⋮
//                       </button>

//                       {activeMenu === item._id && (
//                         <div style={styles.dropdown}>
//                           <button style={styles.dropdownItem} onClick={() => handleEdit(item)}>
//                             ✏ Edit
//                           </button>

//                           <button
//                             style={styles.dropdownItem}
//                             onClick={async () => {
//                               await axios.post(`${API_URL}/copy/${item._id}`);
//                               // alert("Copied successfully");
//                               setAlertBox({
//   show: true,
//   message: "✅ Copied successfully",
//   type: "success",
// });

//                               fetchItems();
//                             }}
//                           >
//                             📄 Copy
//                           </button>

//                           <button style={styles.dropdownItemDelete} onClick={() => handleDelete(item._id)}>
//                             🗑 Delete
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div style={styles.pagination}>
//           <button style={styles.paginationBtn} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
//             Previous
//           </button>

//           {Array.from({ length: totalPages }, (_, i) => (
//             <button
//               key={i}
//               style={i + 1 === currentPage ? styles.paginationBtnActive : styles.paginationBtn}
//               onClick={() => setCurrentPage(i + 1)}
//             >
//               {i + 1}
//             </button>
//           ))}

//           <button
//             style={styles.paginationBtn}
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((p) => p + 1)}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {showModal && (
//         <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
//           <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <h2 style={styles.modalTitle}>✏ Edit Product</h2>

//             <form onSubmit={handleSubmit}>
//               <div style={styles.formGrid}>
//                 <div style={styles.formGroup}>
//                   <label style={styles.label}>Product Name *</label>
//                   <input required name="name" value={form.name} onChange={handleChange} style={styles.input} />
//                 </div>

//                 <div style={styles.formGroup}>
//                   <label style={styles.label}>Category *</label>
//                   <select required name="category" value={form.category} onChange={handleChange} style={styles.select}>
//                     <option value="">Select Category</option>
//                     {categories.map((c) => (
//                       <option value={c._id} key={c._id}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div style={styles.formGroup}>
//                   <label style={styles.label}>Subcategory</label>
//                   <select
//                     name="subcategory"
//                     value={form.subcategory}
//                     onChange={handleChange}
//                     disabled={!subcategories.length}
//                     style={styles.select}
//                   >
//                     <option value="">Select Subcategory</option>
//                     {subcategories.map((s) => (
//                       <option value={s._id} key={s._id}>
//                         {s.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div style={styles.formGroup}>
//                   <label style={styles.label}>Base Price *</label>
//                   <input
//                     type="number"
//                     required
//                     name="basePrice"
//                     value={form.basePrice}
//                     onChange={handleChange}
//                     style={styles.input}
//                   />
//                 </div>

//                 <div style={styles.formGroup}>
//                   <label style={styles.label}>Profit/Loss</label>
//                   <input
//                     type="number"
//                     name="profitLoss"
//                     value={form.profitLoss}
//                     onChange={handleChange}
//                     style={styles.input}
//                   />
//                 </div>

//                 <div style={styles.formGroup}>
//                   <label style={styles.label}>Valid Till</label>
//                   <input type="date" name="validTill" value={form.validTill} onChange={handleChange} style={styles.input} />
//                 </div>

//                 <div style={styles.formGroup}>
//                   <label style={styles.label}>Image</label>
//                   <input type="file" accept="image/*" onChange={handleChange} style={styles.fileInput} />
//                 </div>

//                 <div style={styles.formGroup}>
//                   <label style={styles.label}>Status</label>
//                   <select name="status" value={form.status} onChange={handleChange} style={styles.select}>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
//                 </div>
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Description</label>
//                 <textarea name="description" value={form.description} onChange={handleChange} style={styles.textarea}></textarea>
//               </div>

//               <div style={styles.formActions}>
//                 <button style={styles.btnPrimary} disabled={loading}>
//                   {loading ? "Saving..." : "Update"}
//                 </button>

//                 <button type="button" style={styles.btnCancel} onClick={resetForm}>
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
        
//       )}
//       {/* ✅ ADD CATEGORY POPUP MODAL */}
// {showCategoryModal && (
//   <div style={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
//     <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//       <h2 style={styles.modalTitle}>➕ Add New Category</h2>

//       <div style={styles.formGroup}>
//         <label style={styles.label}>Category Name *</label>
//         <input
//           type="text"
//           value={newCategoryName}
//           onChange={(e) => setNewCategoryName(e.target.value)}
//           style={styles.input}
//           placeholder="Enter category name"
//           autoFocus
//         />
//       </div>

//       <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
//         <button
//           onClick={handleAddCategory}
//           disabled={categoryLoading}
//           style={styles.btnPrimary}
//         >
//           {categoryLoading ? "Saving..." : "Save Category"}
//         </button>

//         <button
//           onClick={() => setShowCategoryModal(false)}
//           style={styles.btnCancel}
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// )}
// {/* ✅ PREMIUM CENTER ALERT */}
// {alertBox.show && (
//   <div className="custom-alert-overlay">
//     <div className={`custom-alert-box ${alertBox.type}`}>
//       <p>{alertBox.message}</p>
//       <button onClick={() => setAlertBox({ ...alertBox, show: false })}>
//         OK
//       </button>
//     </div>
//   </div>
// )}

//     </div>
//   );
// }

// const styles = {
//   container: {  fontFamily: "Inter, Arial, sans-serif", background: "#f6f8fa", minHeight: "100vh" },
//   header: { marginBottom: 8 },
//   title: {
//     fontSize: "22px",
//     fontWeight: 800,
//     color: "#dc3545",
//     marginBottom: "8px",
//   },



// searchInput: {
//   flex: "1",
//   padding: "12px 14px",
//   borderRadius: "12px",
//   border: "1px solid #e2e8f0",
//   background: "#fff",
//   fontSize: "14px",
//   outline: "none",
//   boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
// },

// searchInput: {
//   flex: "1",
//   padding: "12px 14px",
//   borderRadius: "12px",
//   border: "1px solid #e2e8f0",
//   background: "#fff",
//   fontSize: "14px",
//   outline: "none",
//   boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
// },

//   // searchInput: {
//   //   flex: "1",
//   //   minWidth: "260px",
//   //   padding: "12px 14px",
//   //   borderRadius: "12px",
//   //   border: "1px solid #e2e8f0",
//   //   background: "#fff",
//   //   fontSize: "14px",
//   //   outline: "none",
//   //   boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
//   // },
//   addButton: {
//     background: "#dc3545",
//     color: "#fff",
//     border: "none",
//     borderRadius: "10px",
//     padding: "10px 16px",
//     fontSize: "14px",
//     cursor: "pointer",
//     fontWeight: 700,
//     boxShadow: "0 6px 18px rgba(11,105,255,0.12)",
//   },
//   exportButton: {
//     background: "#fff",
//     color: "#0f1724",
//     border: "1px solid #e6eefc",
//     borderRadius: 10,
//     padding: "8px 12px",
//     cursor: "pointer",
//     fontWeight: 700,
//   },
//   importButton: {
//     background: "#fff",
//     color: "#0f1724",
//     border: "1px solid #e6eefc",
//     borderRadius: 10,
//     padding: "8px 12px",
//     cursor: "pointer",
//     fontWeight: 700,
//     marginLeft: 8,
    
//   },
//   select: {
//     padding: "10px 12px",
//     borderRadius: "10px",
//     border: "1px solid #e2e8f0",
//     background: "#fff",
//     fontSize: "13px",
//     minWidth: "160px",
//   },
//   sortSelect: {
//     padding: "10px 12px",
//     borderRadius: "10px",
//     border: "1px solid #dbeafe",
//     background: "#f8fbff",
//     fontSize: "13px",
//     minWidth: "170px",
//     fontWeight: 700,
//     color: "#0f1724",
//   },
//   smallLabel: {
//     fontSize: 12,
//     color: "#475569",
//     fontWeight: 700,
//     marginRight: 6,
//   },
//   bulkBar: {
//     background: "#eef2ff",
//     border: "1px solid #dbeafe",
//     borderRadius: "10px",
//     padding: "12px",
//     marginBottom: "12px",
//   },
//   bulkPanel: {
//     width: "100%",
//     background: "#fff",
//     border: "1px solid #eef2ff",
//     padding: "12px",
//     borderRadius: "10px",
//   },
//   bulkPanelTitle: {
//     textAlign: "center",
//     fontSize: "16px",
//     fontWeight: 700,
//     marginBottom: "10px",
//     color: "#0f1724",
//   },
//   bulkItemBox: {
//     background: "#ffffff",
//     border: "1px solid #eef2ff",
//     padding: "12px",
//     borderRadius: "8px",
//     marginBottom: "10px",
//   },
//   bulkItemTitle: {
//     fontSize: "14px",
//     fontWeight: 700,
//     marginBottom: "8px",
//     color: "#0f1724",
//   },
//   formCard: {
//     borderRadius: "12px",
//     padding: "18px",
//     marginBottom: "18px",
//     background: "#fff",
//     border: "1px solid #eef2ff",
//     boxShadow: "0 4px 16px rgba(2,6,23,0.04)",
//   },
//   formTitle: {
//     fontSize: "18px",
//     fontWeight: 800,
//     marginBottom: 16,
//     color: "#0f1724",
//   },
//   formGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//     gap: "12px",
//   },
//   formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
//   label: { fontWeight: 700, fontSize: "13px", color: "#0f1724" },
//   input: {
//     padding: "10px",
//     borderRadius: "8px",
//     border: "1px solid #e6eef8",
//     background: "#fff",
//     fontSize: "13px",
//     outline: "none",
//   },
//   textarea: {
//     padding: "10px",
//     borderRadius: "8px",
//     border: "1px solid #e6eef8",
//     background: "#fff",
//     minHeight: 80,
//     fontSize: "13px",
//     outline: "none",
//     resize: "vertical",
//   },
//   fileInput: { padding: "6px", fontSize: "13px" },
//   formActions: { marginTop: 16, display: "flex", gap: 10 },
//   btnPrimary: {
//     background: "#ff0b0bff",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     padding: "10px 20px",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: "14px",
//   },
//   btnSmall: {
//     background: "#b91010ff",
//     color: "#fff",
//     border: "none",
//     borderRadius: "6px",
//     padding: "6px 12px",
//     cursor: "pointer",
//     fontSize: "12px",
//     fontWeight: 700,
//   },
//   btnDelete: {
//     background: "#ef4444",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     padding: "8px 14px",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: "14px",
//   },
//   btnCancel: {
//     background: "#6b7280",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     padding: "10px 20px",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: "14px",
//   },
//   tableCard: {
//     marginTop: 16,





//   },
//   tableHeader: { display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" },
//   tableTitle: { fontSize: "18px", fontWeight: 800, color: "#0f1724" },
//   totalCount: { fontSize: "14px", color: "#64748b", fontWeight: 700 },
//   tableWrapper: { overflowX: "auto", border: "1px solid #eef2ff", borderRadius: "8px" },
//   table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
//   th: {
//     background: "#fbfdff",
//     // padding: "12px 10px",
//     fontWeight: 800,
//     color: "#0f1724",
//     textAlign: "left",
//     // borderBottom: "2px solid #eef2ff",
//     // whiteSpace: "nowrap",
//   },
//   tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" },
//   td: { verticalAlign: "middle" },
//   tableImg: { width: "50px", height: "50px", borderRadius: "6px", objectFit: "cover" },
//   statusActive: {
//     background: "#d1fae5",
//     padding: "6px 12px",
//     borderRadius: "6px",
//     color: "#065f46",
//     fontWeight: 700,
//     border: "1px solid #bbf7d0",
//     cursor: "pointer",
//     fontSize: "12px",
//   },
//   statusInactive: {
//     background: "#fee2e2",
//     padding: "6px 12px",
//     borderRadius: "6px",
//     color: "#991b1b",
//     fontWeight: 700,
//     border: "1px solid #fecaca",
//     cursor: "pointer",
//     fontSize: "12px",
//   },
//   menuButton: { background: "#fff", border: "1px solid #e6eef8", borderRadius: "6px", padding: "6px 10px", fontSize: "16px", cursor: "pointer", fontWeight: 700 },
//   dropdown: { position: "absolute", right: 0, top: 36, background: "#fff", border: "1px solid #e6eef8", borderRadius: 8, zIndex: 100, minWidth: 140, boxShadow: "0 8px 30px rgba(2,6,23,0.08)" },
//   dropdownItem: { display: "block", width: "100%", padding: "10px 14px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "background 0.12s" },
//   dropdownItemDelete: { display: "block", width: "100%", padding: "10px 14px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#ef4444", transition: "background 0.12s" },
//   pagination: { marginTop: 16, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" },
//   paginationBtn: { padding: "8px 12px", borderRadius: 8, background: "#fff", border: "1px solid #e6eef8", cursor: "pointer", fontSize: "13px", fontWeight: 700 },
//   paginationBtnActive: { padding: "8px 12px", borderRadius: 8, background: "#0b69ff", color: "white", border: "1px solid #0b69ff", cursor: "pointer", fontSize: "13px", fontWeight: 800 },
//   modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: 20 },
//   modal: { background: "#fff", borderRadius: 12, padding: 24, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 12px 48px rgba(2,6,23,0.12)" },
//   modalTitle: { fontSize: 20, fontWeight: 800, color: "#0f1724", marginBottom: 16, textAlign: "center" },
// };

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PriceList.css"
const API_URL = "https://grocerrybackend.onrender.com/api/prices";
const CATEGORY_URL = "https://grocerrybackend.onrender.com/api/categories";

export default function PriceList() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    description: "",
    basePrice: "",
    profitLoss: "",
     gstPercent: "",
  hsnCode: "",
  taxType: "cgst_sgst",
    weightValue: "",
  weightUnit: "kg",
    validTill: "",
    file: null,
    status: "inactive",
  });

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");
  const [filterSubs, setFilterSubs] = useState([]);

  // Quick edit states for inline editing
  const [quickBasePrices, setQuickBasePrices] = useState({});
  const [quickProfitLoss, setQuickProfitLoss] = useState({});

  // NEW: sort state
  const [sortOrder, setSortOrder] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
const [newCategoryName, setNewCategoryName] = useState("");
const [categoryLoading, setCategoryLoading] = useState(false);
const [alertBox, setAlertBox] = useState({
  show: false,
  message: "",
  type: "success", // success | error | warning
});


useEffect(() => {
  if (alertBox.show) {
    const timer = setTimeout(() => {
      setAlertBox((prev) => ({ ...prev, show: false }));
    }, 2500);

    return () => clearTimeout(timer);
  }
}, [alertBox.show]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) fetchItems();
  }, [categories]);

  useEffect(() => {
    if (!filterCategory) {
      setFilterSubs([]);
      setFilterSubcategory("");
      return;
    }
    const cat = categories.find((c) => c._id === filterCategory);
    setFilterSubs(cat?.subcategories || []);
    setFilterSubcategory("");
  }, [filterCategory, categories]);

  useEffect(() => {
    if (!form.category) {
      setSubcategories([]);
      setForm((prev) => ({ ...prev, subcategory: "" }));
      return;
    }
    const cat = categories.find((c) => c._id === form.category);
    setSubcategories(cat?.subcategories || []);
  }, [form.category, categories]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_URL);
      if (res.data?.success) setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Fetch categories error", err);
      alert("Could not fetch categories");
    }
  }

const fetchItems = async () => {
  try {
    setLoading(true);

    const res = await axios.get(API_URL);

    if (res.data?.success) {
      const raw = res.data.data || [];   // 👈 backend ka grouped data

      const flat = [];

      // 🔥 Backend → Frontend flatten
      raw.forEach((cat) => {
        cat.subcategories.forEach((sub) => {
          sub.products.forEach((p) => {
            flat.push({
              ...p,

              category: {
                _id: cat.id,
                name: cat.name,
                image: cat.image,
              },

              subcategory: {
                _id: sub.id,
                name: sub.name,
                image: sub.image,
              },
            });
          });
        });
      });

      // newest first
      flat.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setItems(flat);
    }
  } catch (err) {
    console.error("Fetch items error", err);
    alert("Could not fetch items");
  } finally {
    setLoading(false);
  }
};


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.length) {
      setForm((p) => ({ ...p, file: files[0] }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // 🛑 Duplicate product name check (PASTE HERE)
  const nameExists = items.some(
    (p) =>
      p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
      p._id !== editId
  );

  if (nameExists) {
    // alert("❌ Product name already exists!");
    setAlertBox({
  show: true,
  message: "❌ Product name already exists!",
  type: "error",
});

    setLoading(false);
    return;
  }

  try {
      

      if (!form.name || !form.category || !form.basePrice) {
        alert("Name, category & base price are required");
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("category", form.category);

      // if (form.subcategory) {
      //   const sub = subcategories.find((s) => s._id === form.subcategory);
      //   if (sub) {
      //     fd.append("subcategory[id]", sub._id);
      //     fd.append("subcategory[name]", sub.name);
      //     fd.append("subcategory[image]", sub.image || "");
      //   }
      // }
if (form.subcategory) {
  const sub = subcategories.find((s) => s._id === form.subcategory);
  if (sub) {
    fd.append(
      "subcategory",
      JSON.stringify({
        id: sub._id,
        name: sub.name,
        image: sub.image || ""
      })
    );
  }
} else {
  fd.append("subcategory", JSON.stringify(null));
}

      fd.append("basePrice", form.basePrice);
      fd.append("profitLoss", form.profitLoss || 0);
   const weightValue =
  form.weightValue && Number(form.weightValue) > 0
    ? Number(form.weightValue)
    : 1;

fd.append(
  "weight",
  JSON.stringify({
    value: weightValue,
    unit: form.weightUnit || "kg",
  })
);



      fd.append("gstPercent", form.gstPercent || 0);
fd.append("hsnCode", form.hsnCode || "");
fd.append("taxType", form.taxType);

      if (form.description) fd.append("description", form.description);
      if (form.validTill) fd.append("validTill", form.validTill);
      fd.append("status", form.status);
      if (form.file) fd.append("file", form.file);

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, fd);
        // alert("Updated successfully");
        setAlertBox({
  show: true,
  message: "✅ Product Update successfully",
  type: "success",
});

      } else {
        await axios.post(API_URL, fd);
        // alert("Added successfully");
        setAlertBox({
  show: true,
  message: "✅ Product added successfully",
  type: "success",
});

      }

      await fetchItems();
      resetForm();
    } catch (err) {
      console.error("Save error", err);
      if (err.response?.data?.message === "Product name already exists") {
        alert("❌ Product name already exists!");
      } else {
        alert("Save failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      subcategory: "",
      description: "",
      basePrice: "",
      profitLoss: "",
      validTill: "",
          weightValue: "",
    weightUnit: "kg",
      file: null,
      status: "inactive",
    });
    setEditId(null);
    setShowModal(false);
    setShowForm(false);
  };
const handleAddCategory = async () => {
  if (!newCategoryName.trim()) {
    return alert("Category name is required");
  }

  try {
    setCategoryLoading(true);

    const res = await axios.post(CATEGORY_URL, {
      name: newCategoryName.trim(),
    });

    if (res.data?.success) {
      // alert("✅ Category added successfully");
      setAlertBox({
  show: true,
  message: "✅ Category added successfully",
  type: "success",
});

      setNewCategoryName("");
      setShowCategoryModal(false);
      await fetchCategories(); // ✅ dropdown auto refresh
    } else {
      alert("❌ Category add failed");

    }
  } catch (err) {
    console.error("Add category error", err);
    alert("❌ Error while adding category");
  } finally {
    setCategoryLoading(false);
  }
};

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      category: item.category?._id?.toString() || "",
      subcategory: item.subcategory?._id || "",
      description: item.description || "",
      basePrice: item.basePrice || "",
      profitLoss: item.profitLoss || 0,
      weightValue: item.weight?.value || "",
weightUnit: item.weight?.unit || "kg",

      gstPercent: item.gstPercent || "",
hsnCode: item.hsnCode || "",
taxType: item.taxType || "cgst_sgst",

      validTill: item.validTill ? item.validTill.split("T")[0] : "",
      file: null,
      status: item.status || "inactive",
    });

    const cat = categories.find((c) => c._id === item.category?._id);
    setSubcategories(cat?.subcategories || []);

    setEditId(item._id);
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setItems((prev) => prev.filter((x) => x._id !== id));
      setSelectedItems((prev) => prev.filter((x) => x !== id));
      setActiveMenu(null);
    } catch (err) {
      console.error("Delete error", err);
      // alert("Delete failed");
      setAlertBox({
  show: true,
  message: "❌ Delete failed",
  type: "error",
});

    }
  };

  const handleStatusToggle = async (item) => {
    try {
      const newStatus = item.status === "active" ? "inactive" : "active";
      await axios.put(`${API_URL}/status/${item._id}`, { status: newStatus });
      setItems((prev) => prev.map((x) => (x._id === item._id ? { ...x, status: newStatus } : x)));
    } catch (err) {
      console.error("Status toggle error", err);
      alert("Status update failed");
    }
  };

  const updateLocalItemField = (id, key, value) => {
    setItems((prev) => prev.map((x) => (x._id === id ? { ...x, [key]: value } : x)));
  };

  const handleBulkSave = async () => {
    if (!selectedItems.length) return alert("No items selected");

    const updates = items
      .filter((x) => selectedItems.includes(x._id))
  //     .map((x) => ({
  //       id: x._id,
  //       basePrice: Number(x.basePrice),
  //       profitLoss: Number(x.profitLoss),
  //        hsnCode: x.hsnCode || "",
  // taxType: x.taxType || "cgst_sgst",
  // status: x.status,
  //       status: x.status,
  //     }));
  .map((x) => ({
  id: x._id,
  basePrice: Number(x.basePrice),
  profitLoss: Number(x.profitLoss),
  gstPercent: Number(x.gstPercent || 0),
  hsnCode: x.hsnCode || "",
  taxType: x.taxType || "cgst_sgst",
  status: x.status,
}));


    try {
      await axios.post(`${API_URL}/bulk-update`, { products: updates });
      // alert("Bulk save successful");
      setAlertBox({
  show: true,
  message: "✅ Bulk Save successfully",
  type: "success",
});

      setBulkMode(false);
      setSelectedItems([]);
      fetchItems();
    } catch (err) {
      console.error("Bulk save error", err);
      // alert("Bulk save failed");
      setAlertBox({
  show: true,
  message: "❌ Bulk Save failed",
  type: "error",
});

    }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return alert("No items selected");
    if (!window.confirm("Delete selected items?")) return;

    try {
      await Promise.all(selectedItems.map((id) => axios.delete(`${API_URL}/${id}`)));
      setSelectedItems([]);
      fetchItems();
      setBulkMode(false);
    } catch (err) {
      console.error("Bulk delete error", err);
      // alert("Bulk delete failed");
      setAlertBox({
  show: true,
  message: "❌ Bulk Delete failed",
  type: "error",
});

    }
  };

  // Update Base Price inline
  const updateBasePrice = async (item) => {
    const newBase = Number(quickBasePrices[item._id] ?? item.basePrice);
    if (isNaN(newBase)) return alert("Invalid Base Price");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", item.name);
      fd.append("category", item.category?._id);
      // if (item.subcategory?.id) fd.append("subcategory", item.subcategory.id);
      if (item.subcategory) {
  fd.append("subcategory", JSON.stringify(item.subcategory));
}

      fd.append("description", item.description || "");
      fd.append("basePrice", newBase);
      fd.append("profitLoss", item.profitLoss);
      fd.append("status", item.status);
      fd.append("gstPercent", item.gstPercent || 0);
fd.append("hsnCode", item.hsnCode || "");
fd.append("taxType", item.taxType || "cgst_sgst");
fd.append("weight", JSON.stringify(item.weight));

      const res = await axios.put(`${API_URL}/${item._id}`, fd);
      if (res.data.success) {
        await fetchItems();
        setQuickBasePrices((p) => ({ ...p, [item._id]: undefined }));
        // alert("Base price updated");
        setAlertBox({
  show: true,
  message: "✅ Baseprice updated successfully",
  type: "success",
});

      }
    } catch (err) {
      console.error(err);
      // alert("Update failed");
      setAlertBox({
  show: true,
  message: "❌ Update failed",
  type: "error",
});

    } finally {
      setLoading(false);
    }
  };

  // Update Profit/Loss inline using updateDiff
  const updateProfitLoss = async (item) => {
    const diff = Number(quickProfitLoss[item._id] ?? 0);
    if (isNaN(diff)) return alert("Invalid Profit/Loss");

    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/updateDiff/${item._id}`, { diff });
      if (res.data.success) {
        await fetchItems();
        setQuickProfitLoss((p) => ({ ...p, [item._id]: undefined }));
        // alert("Profit/Loss updated");
        setAlertBox({
  show: true,
  message: "✅ Pofit/Loss Updated",
  type: "success",
});

      }
    } catch (err) {
      console.error(err);
      // alert("Update failed");
      setAlertBox({
  show: true,
  message: "❌ Update failed",
  type: "error",
});

    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredItems = items.filter((item) => {
    const t = search.toLowerCase();
    const matchText =
      (item.name || "").toLowerCase().includes(t) ||
      (item.category?.name || "").toLowerCase().includes(t) ||
      (item.subcategory?.name || "").toLowerCase().includes(t);

    const matchCategory = !filterCategory || item.category?._id === filterCategory;
    const matchSub = !filterSubcategory || item.subcategory?._id === filterSubcategory;

    return matchText && matchCategory && matchSub;
  });

  // NEW: SORTING
  let sortedItems = [...filteredItems];
  if (sortOrder === "low") {
    sortedItems.sort((a, b) => (Number(a.salePrice) || 0) - (Number(b.salePrice) || 0));
  } else if (sortOrder === "high") {
    sortedItems.sort((a, b) => (Number(b.salePrice) || 0) - (Number(a.salePrice) || 0));
  }

  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = sortedItems.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));

  return (
    <div className="container" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Product Management</h1>
      </div>

      {/* <div style={{ marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}  className="top-bar" > */}

<div className="top-bar">

        <input
          type="text"
          placeholder="Search product, category or subcategory..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={styles.searchInput}
        />

        {/* <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={styles.smallLabel}>Sort</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={styles.sortSelect}
          >
            <option value="">Default</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
          </select>
        </div> */}

        <button
          style={styles.addButton}
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
          }}
        >
          {showForm ? "✖ Close" : "➕ Add Product"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          style={styles.exportButton}
          onClick={() => window.open(`${API_URL}/export`, "_blank")}
        >
           Export CSV
        </button>

        <label style={{ cursor: "pointer" }}>
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={async (e) => {
              try {
                const fd = new FormData();
                fd.append("file", e.target.files[0]);
                await axios.post(`${API_URL}/import`, fd);
                // alert("Imported successfully");
                setAlertBox({
  show: true,
  message: "✅ Imported successfully",
  type: "success",
});

                fetchItems();
              } catch (err) {
                // alert("Import failed");
                setAlertBox({
  show: true,
  message: "❌ Import failed",
  type: "error",
});

              }
            }}
          />
          <span style={styles.importButton}> Import CSV</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={styles.select}
        >
          <option value="">Filter by Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterSubcategory}
          onChange={(e) => setFilterSubcategory(e.target.value)}
          disabled={!filterSubs.length}
          style={styles.select}
        >
          <option value="">Filter by Subcategory</option>
          {filterSubs.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {selectedItems.length > 0 && (
        <div style={styles.bulkBar}>
          {!bulkMode ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.btnDelete} onClick={handleBulkDelete}>
                🗑 Bulk Delete
              </button>
              <button style={styles.btnPrimary} onClick={() => setBulkMode(true)}>
                ✏ Bulk Edit
              </button>
            </div>
          ) : (
            <div style={styles.bulkPanel}>
              <h3 style={styles.bulkPanelTitle}>✏ Bulk Edit Selected Items</h3>

              {items
                .filter((item) => selectedItems.includes(item._id))
                .map((item) => (
                  <div key={item._id} style={styles.bulkItemBox}>
                    <h4 style={styles.bulkItemTitle}>{item.name}</h4>

                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Base Price</label>
                        <input
                          type="number"
                          value={item.basePrice}
                          onChange={(e) => updateLocalItemField(item._id, "basePrice", Number(e.target.value))}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Profit/Loss</label>
                        <input
                          type="number"
                          value={item.profitLoss}
                          onChange={(e) => updateLocalItemField(item._id, "profitLoss", Number(e.target.value))}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.formGroup}>
  <label style={styles.label}>GST %</label>
  <input
    type="number"
    value={item.gstPercent || ""}
    onChange={(e) =>
      updateLocalItemField(item._id, "gstPercent", Number(e.target.value))
    }
    style={styles.input}
  />
</div>

<div style={styles.formGroup}>
  <label style={styles.label}>HSN Code</label>
  <input
    value={item.hsnCode || ""}
    onChange={(e) =>
      updateLocalItemField(item._id, "hsnCode", e.target.value)
    }
    style={styles.input}
  />
</div>

<div style={styles.formGroup}>
  <label style={styles.label}>Tax Type</label>
  <select
    value={item.taxType || "cgst_sgst"}
    onChange={(e) =>
      updateLocalItemField(item._id, "taxType", e.target.value)
    }
    style={styles.select}
  >
    <option value="cgst_sgst">CGST + SGST</option>
    <option value="igst">IGST</option>
  </select>
</div>



                      <div style={styles.formGroup}>
                        <label style={styles.label}>Status</label>
                        <select
                          value={item.status}
                          onChange={(e) => updateLocalItemField(item._id, "status", e.target.value)}
                          style={styles.select}
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <button style={styles.btnPrimary} onClick={handleBulkSave}>
                  ✔ Save All
                </button>

                <button
                  style={styles.btnPrimary}
                  onClick={async () => {
                    if (!selectedItems.length) return alert("No items selected");

                    for (let id of selectedItems) await axios.post(`${API_URL}/copy/${id}`);

                    // alert("Selected copied");
                    setAlertBox({
  show: true,
  message: "✅ Selected Copied successfully",
  type: "success",
});

                    fetchItems();
                  }}
                >
                  📄 Copy Selected
                </button>

                <button
                  style={styles.btnPrimary}
                  onClick={async () => {
                    if (!selectedItems.length) return alert("No items selected");

                    const res = await axios.post(
                      `${API_URL}/export-selected`,
                      { ids: selectedItems },
                      { responseType: "blob" }
                    );

                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "selected.csv";
                    a.click();
                  }}
                >
                   Export Selected
                </button>

                <button style={styles.btnCancel} onClick={() => setBulkMode(false)}>
                  ✖ Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>➕ Add / Edit Product</h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Name *</label>
                <input required name="name" value={form.name} onChange={handleChange} style={styles.input} />
              </div>
{/* 
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select required name="category" value={form.category} onChange={handleChange} style={styles.select}>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div> */}
<div style={styles.formGroup}>
  <label style={styles.label}>Category *</label>

  <div style={{ display: "flex", gap: 8 }}>
    <select
      required
      name="category"
      value={form.category}
      onChange={handleChange}
      style={{ ...styles.select, flex: 1 }}
    >
      <option value="">Select Category</option>
      {categories.map((c) => (
        <option value={c._id} key={c._id}>
          {c.name}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={() => setShowCategoryModal(true)}
      style={{
        background: "#0b69ff",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "8px 14px",
        cursor: "pointer",
        fontWeight: 700,
        height: "40px",
      }}
    >
      ➕
    </button>
  </div>
</div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Subcategory</label>
                <select
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  disabled={!subcategories.length}
                  style={styles.select}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((s) => (
                    <option value={s._id} key={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Base Price *</label>
                <input
                  type="number"
                  required
                  name="basePrice"
                  value={form.basePrice}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
                <div style={styles.formGroup}>
  <label style={styles.label}>Weight</label>

  <div style={{ display: "flex", gap: 8 }}>
    <input
      type="number"
      name="weightValue"
      value={form.weightValue}
      onChange={handleChange}
      placeholder="Value"
      style={{ ...styles.input, flex: 1 }}
    />

    <select
      name="weightUnit"
      value={form.weightUnit}
      onChange={handleChange}
      style={{ ...styles.select, width: 90 }}
    >
    <option value="kg">Kg</option>
<option value="gm">Gram</option>
<option value="ltr">Litre</option>
<option value="ml">ML</option>
<option value="pcs">Pcs</option>

    </select>
  </div>
</div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Profit/Loss</label>
                <input
                  type="number"
                  name="profitLoss"
                  value={form.profitLoss}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
  <label style={styles.label}>GST %</label>
  <input
    type="number"
    name="gstPercent"
    value={form.gstPercent}
    onChange={handleChange}
    style={styles.input}
    placeholder="e.g. 5, 12, 18"
  />
</div>

<div style={styles.formGroup}>
  <label style={styles.label}>HSN Code</label>
  <input
    name="hsnCode"
    value={form.hsnCode}
    onChange={handleChange}
    style={styles.input}
    placeholder="Enter HSN"
  />
</div>

<div style={styles.formGroup}>
  <label style={styles.label}>Tax Type</label>
  <select
    name="taxType"
    value={form.taxType}
    onChange={handleChange}
    style={styles.select}
  >
    <option value="cgst_sgst">CGST + SGST</option>
    <option value="igst">IGST</option>
  </select>
</div>


              <div style={styles.formGroup}>
                <label style={styles.label}>Valid Till</label>
                <input type="date" name="validTill" value={form.validTill} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Image</label>
                <input type="file" accept="image/*" onChange={handleChange} style={styles.fileInput} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} style={styles.select}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} style={styles.textarea}></textarea>
            </div>

            <div style={styles.formActions}>
              <button style={styles.btnPrimary} disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
              </button>

              <button type="button" style={styles.btnCancel} onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Items</h2>
          <span style={styles.totalCount}>Total: {filteredItems.length}</span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={() => {
                      if (selectedItems.length === filteredItems.length) setSelectedItems([]);
                      else setSelectedItems(filteredItems.map((x) => x._id));
                    }}
                  />
                </th>
                <th style={styles.th}>Sr</th>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Subcategory</th>
                <th style={styles.th}>Base Price</th>
                <th style={styles.th}>Weight</th>
                <th style={styles.th}>Profit/Loss</th>
                <th style={styles.th}>Sale Price</th>
                <th style={styles.th}>HSN</th>
<th style={styles.th}>GST</th>
                <th style={styles.th}>Price Lock</th>
                <th style={styles.th}>Teji/Maddi</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item, i) => (
                <tr key={item._id} style={styles.tr}>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() =>
                        setSelectedItems((prev) =>
                          prev.includes(item._id) ? prev.filter((x) => x !== item._id) : [...prev, item._id]
                        )
                      }
                    />
                  </td>

                  <td style={styles.td}>{(currentPage - 1) * itemsPerPage + (i + 1)}</td>

                  <td style={styles.td}>
                    {item.image ? <img src={item.image} style={styles.tableImg} alt="" /> : "No Img"}
                  </td>

                  <td style={styles.td}>{item.name}</td>
                  {/* <td style={styles.td}>{item.category?.name || "-"}</td>
                  <td style={styles.td}>{item.subcategory?.name || "-"}</td> */}
                  <td style={styles.td}>
  {item.category ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {item.category.image && (
        <img
          src={item.category.image}
          alt="cat"
          style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }}
        />
      )}
      <span>{item.category.name}</span>
    </div>
  ) : "-"}
</td>

<td style={styles.td}>
  {item.subcategory ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {item.subcategory.image && (
        <img
          src={item.subcategory.image}
          alt="subcat"
          style={{ width: 26, height: 26, borderRadius: 4, objectFit: "cover" }}
        />
      )}
      <span>{item.subcategory.name}</span>
    </div>
  ) : "-"}
</td>


                  {/* BASE PRICE - Editable */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="number"
                        value={quickBasePrices[item._id] !== undefined ? quickBasePrices[item._id] : item.basePrice}
                        onChange={(e) => setQuickBasePrices((p) => ({ ...p, [item._id]: e.target.value }))}
                        style={{ ...styles.input, padding: "6px 8px", width: 80 }}
                      />
                      <button style={styles.btnSmall} onClick={() => updateBasePrice(item)}>
                        ✔
                      </button>
                    </div>
                    <small style={{ color: "#28a745", display: "block", marginTop: 4 }}>Saved: ₹{item.basePrice}</small>
                  </td>
                     {/* WEIGHT */}
<td style={styles.td}>
  {item.weight
    ? `${item.weight.value} ${item.weight.unit}`
    : "1 kg"}
</td>

                  {/* PROFIT/LOSS - Editable */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="number"
                        placeholder="change"
                        value={quickProfitLoss[item._id] ?? ""}
                        onChange={(e) => setQuickProfitLoss((p) => ({ ...p, [item._id]: e.target.value }))}
                        style={{ ...styles.input, padding: "6px 8px", width: 80 }}
                      />
                      <button style={styles.btnSmall} onClick={() => updateProfitLoss(item)}>
                        ✔
                      </button>
                    </div>
                    <small style={{ color: "#666", display: "block", marginTop: 4 }}>Current: {item.profitLoss}</small>
                  </td>

                  {/* SALE PRICE */}
                  <td style={styles.td}>₹{item.salePrice}</td>
                   <td style={styles.td}>{item.hsnCode || "-"}</td>
<td style={styles.td}>{item.gstPercent ? item.gstPercent + "%" : "-"}</td>
                  {/* PRICE LOCK */}
                  <td style={styles.td}>₹{item.lockedPrice}</td>

                  {/* TEJI/MADDI */}
                  <td style={styles.td}>
                    {item.lockedPrice === 0 ? (
                      <span style={{ color: "#6c757d", fontWeight: "600" }}>0</span>
                    ) : (
                      (() => {
                        const teji = item.salePrice - item.lockedPrice;
                        return (
                          <span
                            style={{
                              color: teji >= 0 ? "#28a745" : "#dc3545",
                              fontWeight: "600",
                            }}
                          >
                            {teji >= 0 ? "▲" : "▼"} {Math.abs(teji)}
                          </span>
                        );
                      })()
                    )}
                  </td>

                  {/* STATUS */}
                  <td style={styles.td}>
                    <button
                      style={item.status === "active" ? styles.statusActive : styles.statusInactive}
                      onClick={() => handleStatusToggle(item)}
                    >
                      {item.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td style={styles.td}>
                    <div style={{ position: "relative" }}>
                      <button
                        style={styles.menuButton}
                        onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)}
                      >
                        ⋮
                      </button>

                      {activeMenu === item._id && (
                        <div style={styles.dropdown}>
                          <button style={styles.dropdownItem} onClick={() => handleEdit(item)}>
                            ✏ Edit
                          </button>

                          <button
                            style={styles.dropdownItem}
                            onClick={async () => {
                              await axios.post(`${API_URL}/copy/${item._id}`);
                              // alert("Copied successfully");
                              setAlertBox({
  show: true,
  message: "✅ Copied successfully",
  type: "success",
});

                              fetchItems();
                            }}
                          >
                            📄 Copy
                          </button>

                          <button style={styles.dropdownItemDelete} onClick={() => handleDelete(item._id)}>
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.pagination}>
          <button style={styles.paginationBtn} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              style={i + 1 === currentPage ? styles.paginationBtnActive : styles.paginationBtn}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            style={styles.paginationBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>✏ Edit Product</h2>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input required name="name" value={form.name} onChange={handleChange} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select required name="category" value={form.category} onChange={handleChange} style={styles.select}>
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option value={c._id} key={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Subcategory</label>
                  <select
                    name="subcategory"
                    value={form.subcategory}
                    onChange={handleChange}
                    disabled={!subcategories.length}
                    style={styles.select}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map((s) => (
                      <option value={s._id} key={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Base Price *</label>
                  <input
                    type="number"
                    required
                    name="basePrice"
                    value={form.basePrice}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Profit/Loss</label>
                  <input
                    type="number"
                    name="profitLoss"
                    value={form.profitLoss}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
<div style={styles.formGroup}>
  <label style={styles.label}>GST %</label>
  <input
    type="number"
    name="gstPercent"
    value={form.gstPercent}
    onChange={handleChange}
    style={styles.input}
  />
</div>

<div style={styles.formGroup}>
  <label style={styles.label}>HSN</label>
  <input
    name="hsnCode"
    value={form.hsnCode}
    onChange={handleChange}
    style={styles.input}
  />
</div>

<div style={styles.formGroup}>
  <label style={styles.label}>Tax Type</label>
  <select
    name="taxType"
    value={form.taxType}
    onChange={handleChange}
    style={styles.select}
  >
    <option value="cgst_sgst">CGST + SGST</option>
    <option value="igst">IGST</option>
  </select>
</div>
<div style={styles.formGroup}>
  <label style={styles.label}>Weight</label>

  <div style={{ display: "flex", gap: 8 }}>
    <input
      type="number"
      placeholder="Value"
      value={form.weightValue}
      onChange={(e) => setForm({ ...form, weightValue: e.target.value })}
      style={{ ...styles.input, flex: 1 }}
    />

    <select
      value={form.weightUnit}
      onChange={(e) => setForm({ ...form, weightUnit: e.target.value })}
      style={{ ...styles.select, width: 90 }}
    >
      <option value="kg">Kg</option>
<option value="gm">Gram</option>
<option value="ltr">Litre</option>
<option value="ml">ML</option>
<option value="pcs">Pcs</option>

    </select>
  </div>
</div>



                <div style={styles.formGroup}>
                  <label style={styles.label}>Valid Till</label>
                  <input type="date" name="validTill" value={form.validTill} onChange={handleChange} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Image</label>
                  <input type="file" accept="image/*" onChange={handleChange} style={styles.fileInput} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} style={styles.select}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} style={styles.textarea}></textarea>
              </div>

              <div style={styles.formActions}>
                <button style={styles.btnPrimary} disabled={loading}>
                  {loading ? "Saving..." : "Update"}
                </button>

                <button type="button" style={styles.btnCancel} onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        
      )}
      {/* ✅ ADD CATEGORY POPUP MODAL */}
{showCategoryModal && (
  <div style={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h2 style={styles.modalTitle}>➕ Add New Category</h2>

      <div style={styles.formGroup}>
        <label style={styles.label}>Category Name *</label>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          style={styles.input}
          placeholder="Enter category name"
          autoFocus
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          onClick={handleAddCategory}
          disabled={categoryLoading}
          style={styles.btnPrimary}
        >
          {categoryLoading ? "Saving..." : "Save Category"}
        </button>

        <button
          onClick={() => setShowCategoryModal(false)}
          style={styles.btnCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{/* ✅ PREMIUM CENTER ALERT */}
{alertBox.show && (
  <div className="custom-alert-overlay">
    <div className={`custom-alert-box ${alertBox.type}`}>
      <p>{alertBox.message}</p>
      <button onClick={() => setAlertBox({ ...alertBox, show: false })}>
        OK
      </button>
    </div>
  </div>
)}

    </div>
  );
}

const styles = {
  container: {  fontFamily: "Inter, Arial, sans-serif", background: "#f6f8fa", minHeight: "100vh" },
  header: { marginBottom: 8 },
  title: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#dc3545",
    marginBottom: "8px",
  },



searchInput: {
  flex: "1",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  background: "#fff",
  fontSize: "14px",
  outline: "none",
  boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
},

searchInput: {
  flex: "1",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  background: "#fff",
  fontSize: "14px",
  outline: "none",
  boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
},

  // searchInput: {
  //   flex: "1",
  //   minWidth: "260px",
  //   padding: "12px 14px",
  //   borderRadius: "12px",
  //   border: "1px solid #e2e8f0",
  //   background: "#fff",
  //   fontSize: "14px",
  //   outline: "none",
  //   boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
  // },
  addButton: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 6px 18px rgba(11,105,255,0.12)",
  },
  exportButton: {
    background: "#fff",
    color: "#0f1724",
    border: "1px solid #e6eefc",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  importButton: {
    background: "#fff",
    color: "#0f1724",
    border: "1px solid #e6eefc",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
    marginLeft: 8,
    
  },
  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: "13px",
    minWidth: "160px",
  },
  sortSelect: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    background: "#f8fbff",
    fontSize: "13px",
    minWidth: "170px",
    fontWeight: 700,
    color: "#0f1724",
  },
  smallLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: 700,
    marginRight: 6,
  },
  bulkBar: {
    background: "#eef2ff",
    border: "1px solid #dbeafe",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "12px",
  },
  bulkPanel: {
    width: "100%",
    background: "#fff",
    border: "1px solid #eef2ff",
    padding: "12px",
    borderRadius: "10px",
  },
  bulkPanelTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "10px",
    color: "#0f1724",
  },
  bulkItemBox: {
    background: "#ffffff",
    border: "1px solid #eef2ff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  bulkItemTitle: {
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#0f1724",
  },
  formCard: {
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "18px",
    background: "#fff",
    border: "1px solid #eef2ff",
    boxShadow: "0 4px 16px rgba(2,6,23,0.04)",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: 16,
    color: "#0f1724",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontWeight: 700, fontSize: "13px", color: "#0f1724" },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e6eef8",
    background: "#fff",
    fontSize: "13px",
    outline: "none",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e6eef8",
    background: "#fff",
    minHeight: 80,
    fontSize: "13px",
    outline: "none",
    resize: "vertical",
  },
  fileInput: { padding: "6px", fontSize: "13px" },
  formActions: { marginTop: 16, display: "flex", gap: 10 },
  btnPrimary: {
    background: "#ff0b0bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  btnSmall: {
    background: "#b91010ff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },
  btnDelete: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  btnCancel: {
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  tableCard: {
    marginTop: 16,





  },
  tableHeader: { display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" },
  tableTitle: { fontSize: "18px", fontWeight: 800, color: "#0f1724" },
  totalCount: { fontSize: "14px", color: "#64748b", fontWeight: 700 },
  tableWrapper: { overflowX: "auto", border: "1px solid #eef2ff", borderRadius: "8px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    background: "#fbfdff",
    // padding: "12px 10px",
    fontWeight: 800,
    color: "#0f1724",
    textAlign: "left",
    // borderBottom: "2px solid #eef2ff",
    // whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" },
  td: { verticalAlign: "middle" },
  tableImg: { width: "50px", height: "50px", borderRadius: "6px", objectFit: "cover" },
  statusActive: {
    background: "#d1fae5",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "#065f46",
    fontWeight: 700,
    border: "1px solid #bbf7d0",
    cursor: "pointer",
    fontSize: "12px",
  },
  statusInactive: {
    background: "#fee2e2",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "#991b1b",
    fontWeight: 700,
    border: "1px solid #fecaca",
    cursor: "pointer",
    fontSize: "12px",
  },
  menuButton: { background: "#fff", border: "1px solid #e6eef8", borderRadius: "6px", padding: "6px 10px", fontSize: "16px", cursor: "pointer", fontWeight: 700 },
  dropdown: { position: "absolute", right: 0, top: 36, background: "#fff", border: "1px solid #e6eef8", borderRadius: 8, zIndex: 100, minWidth: 140, boxShadow: "0 8px 30px rgba(2,6,23,0.08)" },
  dropdownItem: { display: "block", width: "100%", padding: "10px 14px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "background 0.12s" },
  dropdownItemDelete: { display: "block", width: "100%", padding: "10px 14px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#ef4444", transition: "background 0.12s" },
  pagination: { marginTop: 16, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" },
  paginationBtn: { padding: "8px 12px", borderRadius: 8, background: "#fff", border: "1px solid #e6eef8", cursor: "pointer", fontSize: "13px", fontWeight: 700 },
  paginationBtnActive: { padding: "8px 12px", borderRadius: 8, background: "#0b69ff", color: "white", border: "1px solid #0b69ff", cursor: "pointer", fontSize: "13px", fontWeight: 800 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: 20 },
  modal: { background: "#fff", borderRadius: 12, padding: 24, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 12px 48px rgba(2,6,23,0.12)" },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#0f1724", marginBottom: 16, textAlign: "center" },
};