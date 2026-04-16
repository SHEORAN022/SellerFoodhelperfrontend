import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reports.css";

const API = "https://foodhelpervendor.onrender.com/api/reports";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    fileType: "pdf",
  });

  const loadReports = async () => {
    const res = await axios.get(API);
    setReports(res.data.data || []);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const submit = async () => {
    if (!file || !form.title) return alert("Title & file required");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("fileType", form.fileType);
    fd.append("file", file);

    await axios.post(API, fd);
    setForm({ title: "", description: "", fileType: "pdf" });
    setFile(null);
    loadReports();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    await axios.delete(`${API}/${id}`);
    loadReports();
  };

  return (
    <div className="reports-page">
      <h2>📊 Reports</h2>

      <div className="report-form">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          value={form.fileType}
          onChange={(e) => setForm({ ...form, fileType: e.target.value })}
        >
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="text">Text</option>
        </select>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button className="upload-btn" onClick={submit}>
          Upload Report
        </button>
      </div>

      <div className="reports-list">
        {reports.map((r) => (
          <div key={r._id} className="report-card">
            <div className="report-info">
              <b>{r.title}</b>
              <span className="report-type">{r.fileType.toUpperCase()}</span>
            </div>

            <div className="report-actions">
              <a
                href={r.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="view-btn"
              >
                View
              </a>
              <button className="delete-btn" onClick={() => remove(r._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
