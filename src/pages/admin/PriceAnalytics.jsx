

// // // import React, { useEffect, useState } from "react";
// // // import axios from "axios";
// // // import {
// // //   Chart as ChartJS,
// // //   CategoryScale,
// // //   LinearScale,
// // //   PointElement,
// // //   LineElement,
// // //   Title,
// // //   Tooltip,
// // //   Legend,
// // // } from "chart.js";
// // // import { Line } from "react-chartjs-2";
// // // import "./PriceAnalytics.css";

// // // ChartJS.register(
// // //   CategoryScale,
// // //   LinearScale,
// // //   PointElement,
// // //   LineElement,
// // //   Title,
// // //   Tooltip,
// // //   Legend
// // // );

// // // const API_BASE = "https://grocerrybackend.onrender.com/api";

// // // const PriceAnalytics = () => {
// // //   const [loading, setLoading] = useState(true);
// // //   const [productList, setProductList] = useState([]);
// // //   const [categoryList, setCategoryList] = useState([]);
// // //   const [selectedProduct, setSelectedProduct] = useState("");
// // //   const [selectedCategory, setSelectedCategory] = useState("");
// // //   const [startDate, setStartDate] = useState("");
// // //   const [endDate, setEndDate] = useState("");
// // //   const [chartData, setChartData] = useState(null);

// // //   // 🔹 Fetch dropdowns
// // //   useEffect(() => {
// // //     const fetchDropdowns = async () => {
// // //       try {
// // //         const [products, categories] = await Promise.all([
// // //           axios.get(`${API_BASE}/prices`),
// // //           axios.get(`${API_BASE}/categories`),
// // //         ]);
// // //         setProductList(products.data.data || []);
// // //         setCategoryList(categories.data.categories || []);
// // //       } catch (err) {
// // //         console.error("Dropdown fetch error:", err);
// // //       }
// // //     };
// // //     fetchDropdowns();
// // //   }, []);

// // //   // 🔹 Fetch chart data with date filter
// // //   const fetchChart = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const res = await axios.get(`${API_BASE}/prices`);
// // //       const allPrices = res.data.data || [];

// // //       // ✅ Filter by Product / Category
// // //       let filtered = allPrices;
// // //       if (selectedProduct)
// // //         filtered = filtered.filter((p) => p.name === selectedProduct);
// // //       if (selectedCategory)
// // //         filtered = filtered.filter(
// // //           (p) => p.category?.name === selectedCategory
// // //         );

// // //       // ✅ Filter by Date Range
// // //       if (startDate && endDate) {
// // //         const start = new Date(startDate);
// // //         const end = new Date(endDate);

// // //         filtered = filtered.filter((item) => {
// // //           const date = new Date(item.validTill || item.createdAt);
// // //           return date >= start && date <= end;
// // //         });
// // //       }

// // //       // ✅ Group by Date
// // //       const groupedByDate = {};
// // //       filtered.forEach((item) => {
// // //         const dateKey = new Date(
// // //           item.validTill || item.createdAt
// // //         ).toLocaleDateString("en-IN");

// // //         if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
// // //         groupedByDate[dateKey].push(item);
// // //       });

// // //       const labels = Object.keys(groupedByDate);

// // //       const avgBasePrice = labels.map((d) => {
// // //         const dayData = groupedByDate[d];
// // //         return (
// // //           dayData.reduce((sum, i) => sum + Number(i.basePrice || 0), 0) /
// // //           dayData.length
// // //         );
// // //       });

// // //       const avgDiff = labels.map((d) => {
// // //         const dayData = groupedByDate[d];
// // //         return (
// // //           dayData.reduce((sum, i) => sum + Number(i.difference || 0), 0) /
// // //           dayData.length
// // //         );
// // //       });

// // //       const totalCount = labels.map((d) => groupedByDate[d].length);

// // //       // 🔹 Multiple Line Datasets
// // //       setChartData({
// // //         labels,
// // //         datasets: [
// // //           {
// // //             label: "Average Base Price (₹)",
// // //             data: avgBasePrice,
// // //             borderColor: "#007bff",
// // //             backgroundColor: "rgba(0,123,255,0.3)",
// // //             tension: 0.3,
// // //             fill: false,
// // //           },
// // //           {
// // //             label: "Average Difference (₹)",
// // //             data: avgDiff,
// // //             borderColor: "#ffc107",
// // //             backgroundColor: "rgba(255,193,7,0.3)",
// // //             tension: 0.3,
// // //             fill: false,
// // //           },
// // //           {
// // //             label: "Total Products Count",
// // //             data: totalCount,
// // //             borderColor: "#28a745",
// // //             backgroundColor: "rgba(40,167,69,0.3)",
// // //             tension: 0.3,
// // //             fill: false,
// // //           },
// // //         ],
// // //       });
// // //     } catch (err) {
// // //       console.error("Chart fetch error:", err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchChart();
// // //   }, [selectedProduct, selectedCategory, startDate, endDate]);

// // //   return (
// // //     <div className="analytics-container">
// // //       <h2 className="analytics-title">📅 Price History & Analytics</h2>
// // //       <p className="analytics-subtitle">
// // //         Track your product & category price trends over time
// // //       </p>

// // //       {/* Filters */}
// // //       <div className="filter-section">
// // //         <div className="filter-group">
// // //           <label>🧃 Product:</label>
// // //           <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
// // //             <option value="">All Products</option>
// // //             {productList.map((p) => (
// // //               <option key={p._id} value={p.name}>{p.name}</option>
// // //             ))}
// // //           </select>
// // //         </div>

// // //         <div className="filter-group">
// // //           <label>🗂️ Category:</label>
// // //           <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
// // //             <option value="">All Categories</option>
// // //             {categoryList.map((c) => (
// // //               <option key={c._id} value={c.name}>{c.name}</option>
// // //             ))}
// // //           </select>
// // //         </div>

// // //         <div className="filter-group">
// // //           <label>📆 From:</label>
// // //           <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
// // //         </div>

// // //         <div className="filter-group">
// // //           <label>➡ To:</label>
// // //           <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
// // //         </div>

// // //         <button className="btn refresh" onClick={fetchChart}>🔄 Apply</button>
// // //       </div>

// // //       {/* Chart */}
// // //       <div className="chart-wrapper">
// // //         {loading ? (
// // //           <div className="loading">Loading chart...</div>
// // //         ) : chartData ? (
// // //           <Line
// // //             data={chartData}
// // //             options={{
// // //               responsive: true,
// // //               maintainAspectRatio: false,
// // //               plugins: {
// // //                 legend: { position: "bottom" },
// // //               },
// // //               scales: {
// // //                 y: { beginAtZero: true },
// // //               },
// // //             }}
// // //           />
// // //         ) : (
// // //           <div className="no-data">No data found.</div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default PriceAnalytics;
// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";
// // import ChartDataLabels from "chartjs-plugin-datalabels";
// // import { Line } from "react-chartjs-2";
// // import "./PriceAnalytics.css";

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// //   ChartDataLabels
// // );

// // const API_BASE = "https://grocerrybackend.onrender.com/api";

// // const PriceAnalytics = () => {
// //   const [loading, setLoading] = useState(true);
// //   const [productList, setProductList] = useState([]);
// //   const [categoryList, setCategoryList] = useState([]);
// //   const [selectedProduct, setSelectedProduct] = useState("");
// //   const [selectedCategory, setSelectedCategory] = useState("");
// //   const [chartData, setChartData] = useState(null);

// //   useEffect(() => {
// //     const fetchDropdowns = async () => {
// //       try {
// //         const [p, c] = await Promise.all([
// //           axios.get(`${API_BASE}/prices`),
// //           axios.get(`${API_BASE}/categories`),
// //         ]);

// //         setProductList(p.data.data || []);
// //         setCategoryList(c.data.categories || []);
// //       } catch (err) {
// //         console.error("Dropdown fetch error:", err);
// //       }
// //     };

// //     fetchDropdowns();
// //   }, []);

// //   const fetchChart = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await axios.get(`${API_BASE}/prices`);
// //       let all = res.data.data || [];

// //       // Filters
// //       if (selectedProduct)
// //         all = all.filter((p) => p.name === selectedProduct);

// //       if (selectedCategory)
// //         all = all.filter((p) => p.category?.name === selectedCategory);

// //       // Group by Date
// //       const grouped = {};
// //       all.forEach((item) => {
// //         const k = new Date(item.validTill || item.createdAt).toLocaleDateString("en-IN");
// //         if (!grouped[k]) grouped[k] = [];
// //         grouped[k].push(item);
// //       });

// //       const labels = Object.keys(grouped);

// //       // Final Price
// //       const finalPrice = labels.map((d) => {
// //         const arr = grouped[d];
// //         return arr.reduce(
// //           (sum, x) => sum + (Number(x.basePrice || 0) + Number(x.difference || 0)),
// //           0
// //         ) / arr.length;
// //       });

// //       setChartData({
// //         labels,
// //         datasets: [
// //           {
// //             label: "Final Price (₹)",
// //             data: finalPrice,
// //             borderColor: "#007bff",
// //             backgroundColor: "rgba(0,123,255,0.3)",
// //             tension: 0.3,
// //           },
// //         ],
// //       });
// //     } catch (err) {
// //       console.error("Chart error:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchChart();
// //   }, [selectedProduct, selectedCategory]);

// //   return (
// //     <div className="analytics-container">
// //       <h2 className="analytics-title">📊 Final Price Analytics</h2>

// //       {/* Filters */}
// //       <div className="filter-section">
// //         <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
// //           <option value="">All Products</option>
// //           {productList.map((p) => (
// //             <option key={p._id} value={p.name}>{p.name}</option>
// //           ))}
// //         </select>

// //         <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
// //           <option value="">All Categories</option>
// //           {categoryList.map((c) => (
// //             <option key={c._id} value={c.name}>{c.name}</option>
// //           ))}
// //         </select>

// //         <button className="btn refresh" onClick={fetchChart}>Apply</button>
// //       </div>

// //       {/* Chart */}
// //       <div className="chart-wrapper">
// //         {loading ? (
// //           <div className="loading">Loading...</div>
// //         ) : (
// //           <Line
// //             data={chartData}
// //             options={{
// //               responsive: true,
// //               maintainAspectRatio: false,
// //               plugins: {
// //                 legend: { position: "bottom" },

// //                 // ⭐ ALWAYS SHOW LABEL ⭐
// //                 datalabels: {
// //                   color: "#000",
// //                   anchor: "end",
// //                   align: "top",
// //                   formatter: (value) => `₹${value}`,
// //                   font: {
// //                     weight: "bold",
// //                     size: 12,
// //                   },
// //                 },
// //               },
// //               scales: {
// //                 y: { beginAtZero: true },
// //               },
// //             }}
// //           />
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default PriceAnalytics;

// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";
// // import ChartDataLabels from "chartjs-plugin-datalabels";
// // import { Line } from "react-chartjs-2";
// // import "./PriceAnalytics.css";

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// //   ChartDataLabels
// // );

// // const API_BASE = "https://grocerrybackend.onrender.com/api";

// // const PriceAnalytics = () => {
// //   const [loading, setLoading] = useState(true);
// //   const [productList, setProductList] = useState([]);
// //   const [categoryList, setCategoryList] = useState([]);
// //   const [selectedProduct, setSelectedProduct] = useState("");
// //   const [selectedCategory, setSelectedCategory] = useState("");

// //   // NEW FILTER STATE
// //   const [chartType, setChartType] = useState("daily"); // daily, weekly, monthly, yearly, custom
// //   const [startDate, setStartDate] = useState("");
// //   const [endDate, setEndDate] = useState("");

// //   const [chartData, setChartData] = useState(null);

// //   useEffect(() => {
// //     const fetchDropdowns = async () => {
// //       try {
// //         const [p, c] = await Promise.all([
// //           axios.get(`${API_BASE}/prices`),
// //           axios.get(`${API_BASE}/categories`),
// //         ]);

// //         setProductList(p.data.data || []);
// //         setCategoryList(c.data.categories || []);
// //       } catch (err) {
// //         console.error("Dropdown fetch error:", err);
// //       }
// //     };

// //     fetchDropdowns();
// //   }, []);

// //   // 🔥 GROUPING HELPERS
// //   const groupByWeek = (date) => {
// //     const d = new Date(date);
// //     const onejan = new Date(d.getFullYear(), 0, 1);
// //     const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
// //     return `Week ${week} - ${d.getFullYear()}`;
// //   };

// //   const groupByMonth = (date) => {
// //     const d = new Date(date);
// //     return `${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
// //   };

// //   const groupByYear = (date) => {
// //     return new Date(date).getFullYear().toString();
// //   };

// //   const fetchChart = async () => {
// //     setLoading(true);

// //     try {
// //       const res = await axios.get(`${API_BASE}/prices`);
// //       let all = res.data.data || [];

// //       // PRODUCT FILTER
// //       if (selectedProduct)
// //         all = all.filter((p) => p.name === selectedProduct);

// //       // CATEGORY FILTER
// //       if (selectedCategory)
// //         all = all.filter((p) => p.category?.name === selectedCategory);

// //       // RANGE FILTER
// //       if (chartType === "custom" && startDate && endDate) {
// //         const start = new Date(startDate);
// //         const end = new Date(endDate);
// //         all = all.filter((p) => {
// //           const d = new Date(p.validTill || p.createdAt);
// //           return d >= start && d <= end;
// //         });
// //       }

// //       // GROUP DATA
// //       const groups = {};

// //       all.forEach((item) => {
// //         const date = item.validTill || item.createdAt;

// //         let groupKey = "";

// //         switch (chartType) {
// //           case "weekly":
// //             groupKey = groupByWeek(date);
// //             break;
// //           case "monthly":
// //             groupKey = groupByMonth(date);
// //             break;
// //           case "yearly":
// //             groupKey = groupByYear(date);
// //             break;
// //           default:
// //             groupKey = new Date(date).toLocaleDateString("en-IN");
// //         }

// //         if (!groups[groupKey]) groups[groupKey] = [];
// //         groups[groupKey].push(item);
// //       });

// //       const labels = Object.keys(groups);

// //       const finalPriceAvg = labels.map((d) => {
// //         const arr = groups[d];
// //         return (
// //           arr.reduce(
// //             (sum, x) =>
// //               sum + (Number(x.basePrice || 0) + Number(x.difference || 0)),
// //             0
// //           ) / arr.length
// //         );
// //       });

// //       setChartData({
// //         labels,
// //         datasets: [
// //           {
// //             label: "Final Price (₹)",
// //             data: finalPriceAvg,
// //             borderColor: "#007bff",
// //             backgroundColor: "rgba(0,123,255,0.3)",
// //             tension: 0.3,
// //           },
// //         ],
// //       });
// //     } catch (err) {
// //       console.error("Chart Error:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchChart();
// //   }, [selectedProduct, selectedCategory, chartType, startDate, endDate]);

// //   return (
// //     <div className="analytics-container">
// //       <h2 className="analytics-title">Price Analytics</h2>

// //       <div className="filter-section">
        
// //         {/* PRODUCT */}
// //         <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
// //           <option value="">All Products</option>
// //           {productList.map((p) => (
// //             <option key={p._id} value={p.name}>{p.name}</option>
// //           ))}
// //         </select>

// //         {/* CATEGORY */}
// //         <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
// //           <option value="">All Categories</option>
// //           {categoryList.map((c) => (
// //             <option key={c._id} value={c.name}>{c.name}</option>
// //           ))}
// //         </select>

// //         {/* TYPE FILTER */}
// //         <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
// //           <option value="daily">Daily</option>
// //           <option value="weekly">Weekly</option>
// //           <option value="monthly">Monthly</option>
// //           <option value="yearly">Yearly</option>
// //           {/* <option value="custom">Custom Range</option> */}
// //         </select>

// //         {/* DATE RANGE ONLY IF CUSTOM */}
// //         {chartType === "custom" && (
// //           <>
// //             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
// //             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
// //           </>
// //         )}

// //         {/* <button className="btn refresh" onClick={fetchChart}>Apply</button> */}
// //       </div>

// //       <div className="chart-wrapper">
// //         {loading ? (
// //           <div className="loading">Loading chart...</div>
// //         ) : (
// //           <Line
// //             data={chartData}
// //             options={{
// //               responsive: true,
// //               maintainAspectRatio: false,
// //               plugins: {
// //                 legend: { position: "bottom" },
// //                 datalabels: {
// //                   color: "black",
// //                   anchor: "end",
// //                   align: "top",
// //                   formatter: (v) => `₹${v}`,
// //                   font: { size: 12, weight: "bold" },
// //                 },
// //               },
// //             }}
// //           />
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default PriceAnalytics;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import { Line } from "react-chartjs-2";
// import "./PriceAnalytics.css";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend,
//   ChartDataLabels
// );

// const API_BASE = "https://grocerrybackend.onrender.com/api";

// export default function PriceAnalytics() {
//   const [loading, setLoading] = useState(true);
//   const [productList, setProductList] = useState([]);
//   const [categoryList, setCategoryList] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [chartData, setChartData] = useState(null);

//   /* ================= DROPDOWNS ================= */
//   useEffect(() => {
//     Promise.all([
//       axios.get(`${API_BASE}/prices`),
//       axios.get(`${API_BASE}/categories`),
//     ]).then(([p, c]) => {
//       setProductList(p.data.data || []);
//       setCategoryList(c.data.categories || []);
//     });
//   }, []);

//   /* ================= ZIG-ZAG CHART ================= */
//   const fetchChart = async () => {
//     setLoading(true);

//     try {
//       const res = await axios.get(`${API_BASE}/prices`);
//       let data = res.data.data || [];

//       // FILTERS
//       if (selectedProduct)
//         data = data.filter((p) => p.name === selectedProduct);

//       if (selectedCategory)
//         data = data.filter((p) => p.category?.name === selectedCategory);

//       // SORT BY TIME (VERY IMPORTANT)
//       data.sort(
//         (a, b) =>
//           new Date(a.createdAt || a.validTill) -
//           new Date(b.createdAt || b.validTill)
//       );

//       const labels = data.map((item) =>
//         new Date(item.createdAt || item.validTill).toLocaleString("en-IN")
//       );

//       const prices = data.map((item) => {
//         const base = Number(item.basePrice) || 0;
//         const diff = Number(item.difference) || 0;
//         return base + diff;
//       });

//       // SINGLE POINT FIX
//       if (labels.length === 1) {
//         labels.unshift("Earlier");
//         prices.unshift(prices[0]);
//       }

//       setChartData({
//         labels,
//         datasets: [
//           {
//             label: "Final Price (₹)",
//             data: prices,
//             borderColor: "#dc3545",
//             backgroundColor: "rgba(220,53,69,0.15)",
//             tension: 0,           // 🔥 NO SMOOTH → SHARP ZIG ZAG
//             fill: true,
//             pointRadius: 5,
//             pointHoverRadius: 7,
//           },
//         ],
//       });
//     } catch (err) {
//       console.error("Chart error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChart();
//   }, [selectedProduct, selectedCategory]);

//   return (
//     <div className="analytics-container">
//       <h2 className="analytics-title">Price Analytics (Zig-Zag)</h2>

//       <div className="filter-section">
//         <select onChange={(e) => setSelectedProduct(e.target.value)}>
//           <option value="">All Products</option>
//           {productList.map((p) => (
//             <option key={p._id} value={p.name}>{p.name}</option>
//           ))}
//         </select>

//         <select onChange={(e) => setSelectedCategory(e.target.value)}>
//           <option value="">All Categories</option>
//           {categoryList.map((c) => (
//             <option key={c._id} value={c.name}>{c.name}</option>
//           ))}
//         </select>
//       </div>

//       <div className="chart-wrapper">
//         {loading ? (
//           <div className="loading">Loading...</div>
//         ) : chartData ? (
//           <Line
//             data={chartData}
//             options={{
//               responsive: true,
//               maintainAspectRatio: false,
//               scales: {
//                 y: { beginAtZero: false },
//               },
//               plugins: {
//                 legend: { position: "bottom" },
//                 datalabels: {
//                   display: true,
//                   align: "top",
//                   formatter: (v) => `₹${v}`,
//                   font: { weight: "bold" },
//                 },
//               },
//             }}
//           />
//         ) : (
//           <div className="no-data">No data available</div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";
import "./PriceAnalytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const API_BASE = "https://grocerrybackend.onrender.com/api";

export default function PriceAnalytics() {
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [chartData, setChartData] = useState(null);

  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/prices`),
      axios.get(`${API_BASE}/categories`),
    ]).then(([priceRes, catRes]) => {
      // 🔥 Extract ONLY PRODUCTS from nested structure
      const products = [];

      // priceRes.data.data.forEach(category => {
      //   category.subcategories.forEach(sub => {
      //     sub.products.forEach(prod => {
      //       products.push(prod);
      //     });
      //   });
      // });
     priceRes.data.data.forEach(category => {
  category.subcategories.forEach(sub => {
    sub.products.forEach(prod => {
      products.push({
        ...prod,
        categoryName: category.name   // 🔥 attach category
      });
    });
  });
});
      setProductList(products);
      setCategoryList(catRes.data.categories || []);
    });
  }, []);

  /* ================= FETCH CHART ================= */
//   const fetchChart = async () => {
//     setLoading(true);

//     try {
//       const res = await axios.get(`${API_BASE}/prices`);

//       let data = [];

//       // 🔥 Flatten Category → Sub → Products
//       // res.data.data.forEach(category => {
//       //   category.subcategories.forEach(sub => {
//       //     sub.products.forEach(prod => {
//       //       data.push(prod);
//       //     });
//       //   });
//       // });

//       priceRes.data.data.forEach(category => {
//   category.subcategories.forEach(sub => {
//     sub.products.forEach(prod => {
//       products.push({
//         ...prod,
//         categoryName: category.name   // 🔥 attach category
//       });
//     });
//   });
// });

//       // 🔥 Filters
//       if (selectedProduct) {
//         data = data.filter(p => p.name === selectedProduct);
//       }

//       // if (selectedCategory) {
//       //   data = data.filter(p => p.category?.name === selectedCategory);
//       // }

      

//       // 🔥 Sort by time
//       data.sort(
//         (a, b) =>
//           new Date(a.createdAt || a.validTill) -
//           new Date(b.createdAt || b.validTill)
//       );

//       const labels = data.map(item =>
//         new Date(item.createdAt || item.validTill).toLocaleString("en-IN")
//       );

//       const prices = data.map(item => {
//         const base = Number(item.basePrice) || 0;
//         const diff = Number(item.difference) || 0;
//         return base + diff;
//       });

//       // Single point fix
//       if (labels.length === 1) {
//         labels.unshift("Earlier");
//         prices.unshift(prices[0]);
//       }

//       setChartData({
//         labels,
//         datasets: [
//           {
//             label: "Final Price (₹)",
//             data: prices,
//             borderColor: "#dc3545",
//             backgroundColor: "rgba(220,53,69,0.15)",
//             tension: 0,
//             fill: true,
//             pointRadius: 5,
//             pointHoverRadius: 7,
//           },
//         ],
//       });

//     } catch (err) {
//       console.error("Chart error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };
const fetchChart = async () => {
  setLoading(true);

  try {
    const res = await axios.get(`${API_BASE}/prices`);

    let data = [];

    // ✅ Proper flatten with category name
    res.data.data.forEach(category => {
      category.subcategories.forEach(sub => {
        sub.products.forEach(prod => {
          data.push({
            ...prod,
            categoryName: category.name   // 🔥 important
          });
        });
      });
    });

    // ✅ Product filter
    if (selectedProduct) {
      data = data.filter(p => p.name === selectedProduct);
    }

    // ✅ Category filter
    if (selectedCategory) {
      data = data.filter(p => p.categoryName === selectedCategory);
    }

    // ❗ If nothing found, clear chart
    if (data.length === 0) {
      setChartData(null);
      setLoading(false);
      return;
    }

    // ✅ Sort by time
    data.sort(
      (a, b) =>
        new Date(a.createdAt || a.validTill) -
        new Date(b.createdAt || b.validTill)
    );

    const labels = data.map(item =>
      new Date(item.createdAt || item.validTill).toLocaleString("en-IN")
    );

    const prices = data.map(item => {
      const base = Number(item.basePrice) || 0;
      const diff = Number(item.difference) || 0;
      return base + diff;
    });

    // Single point zigzag fix
    if (labels.length === 1) {
      labels.unshift("Earlier");
      prices.unshift(prices[0]);
    }

    setChartData({
      labels,
      datasets: [
        {
          label: "Final Price (₹)",
          data: prices,
          borderColor: "#dc3545",
          backgroundColor: "rgba(220,53,69,0.15)",
          tension: 0,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    });

  } catch (err) {
    console.error("Chart error:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchChart();
  }, [selectedProduct, selectedCategory]);

  /* ================= UI ================= */
  return (
    <div className="analytics-container">
      <h2 className="analytics-title">Price Analytics (Zig-Zag)</h2>

      <div className="filter-section">
        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
          <option value="">All Products</option>
          {productList.map(p => (
            <option key={p._id} value={p.name}>{p.name}</option>
          ))}
        </select>

        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categoryList.map(c => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="chart-wrapper">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: false },
              },
              plugins: {
                legend: { position: "bottom" },
                datalabels: {
                  display: true,
                  align: "top",
                  formatter: v => `₹${v}`,
                  font: { weight: "bold" },
                },
              },
            }}
          />
        ) : (
          <div className="no-data">No data available</div>
        )}
      </div>
    </div>
  );
}
