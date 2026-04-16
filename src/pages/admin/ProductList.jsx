

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductList.css";

const API_URL = "https://grocerrybackend.onrender.com/api/prices";
const CATEGORY_URL = "https://grocerrybackend.onrender.com/api/categories";

function ProductList() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchItems();
    fetchCategories();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --------------------- FETCH ITEMS ---------------------
  const fetchItems = async () => {
    try {
      const res = await axios.get(API_URL);

      if (res.data.success) {
        const data = res.data.data.map((item) => ({
          ...item,

          // ⭐ Normalized fields
          todayDiff: item.todayDiff ?? item.difference ?? 0,

          lastFinalPrice:
            item.lastFinalPrice && item.lastFinalPrice > 0
              ? item.lastFinalPrice
              : item.basePrice,

          currentFinalPrice:
            item.currentFinalPrice && item.currentFinalPrice > 0
              ? item.currentFinalPrice
              : (item.basePrice + (item.todayDiff ?? 0)),
        }));

        setItems(data);
      }
    } catch (err) {
      console.log("Items fetch failed", err);
    }
  };

  // ---------------- FETCH CATEGORIES ----------------
  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_URL);
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.log("Category fetch failed", err);
    }
  };

  // ---------------- FILTER SUBCATEGORIES ----------------
  useEffect(() => {
    if (!filterCategory) {
      setSubcategories([]);
      setFilterSubcategory("");
      return;
    }

    const cat = categories.find((c) => c._id === filterCategory);
    setSubcategories(cat?.subcategories || []);
    setFilterSubcategory("");
  }, [filterCategory, categories]);

  // ---------------- FILTERING ----------------
  const filteredItems = items.filter((item) => {
    const t = searchText.toLowerCase();

    const matchSearch =
      item.name?.toLowerCase().includes(t) ||
      item.category?.name?.toLowerCase().includes(t) ||
      item.subcategory?.name?.toLowerCase().includes(t);

    const matchCategory =
      !filterCategory || item.category?._id === filterCategory;

    const matchSubcategory =
      !filterSubcategory || item.subcategory?._id === filterSubcategory;

    return matchSearch && matchCategory && matchSubcategory;
  });

  // ---------------- PAGINATION ----------------
  const indexOfLast = currentPage * itemsPerPage;
  const renderedItems = filteredItems.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="price-container">
      <div className="header-section">
        <h1>Product List</h1>
      </div>

      {/* ---------------- FILTER BAR ---------------- */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search product, category or subcategory..."
          value={searchText}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchText(e.target.value);
          }}
        />

        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* <select
          value={filterSubcategory}
          disabled={!subcategories.length}
          onChange={(e) => {
            setFilterSubcategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Subcategories</option>
          {subcategories.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select> */}
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="table-card">
        <div className="table-header">
          <h2>Items</h2>
          <span>Total: {filteredItems.length}</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Sr</th>
                <th>Image</th>
                <th>Name</th>
                <th>Base</th>
                <th>Yesterday Final</th>
                <th>Today Diff</th>
                <th>Final</th>
              </tr>
            </thead>

            <tbody>
              {renderedItems.map((item, i) => (
                <tr key={item._id}>
                  <td>{(currentPage - 1) * itemsPerPage + (i + 1)}</td>

                  <td>
                    {item.image ? (
                      <img src={item.image} alt="img" />
                    ) : (
                      "No Img"
                    )}
                  </td>

                  <td>{item.name}</td>

                  <td>₹{item.basePrice}</td>

                  <td>₹{item.lastFinalPrice}</td>

                  <td>{item.todayDiff}</td>

                  <td style={{ fontWeight: "700" }}>
                    ₹{item.currentFinalPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------------- PAGINATION ---------------- */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active-page" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
