import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Support.css";

const API_BASE = "https://foodhelpervendor.onrender.com/api";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  const [showCreate, setShowCreate] = useState(false);

  const [assignTicketId, setAssignTicketId] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");

  const [form, setForm] = useState({
    user: "",
    subject: "",
    description: "",
    priority: "medium",
  });

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    const [t, u] = await Promise.all([
      axios.get(`${API_BASE}/support`),
      axios.get(`${API_BASE}/user/all`),
    ]);
    setTickets(t.data.data || []);
    setUsers(u.data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= CREATE ================= */
  const createTicket = async () => {
    if (!form.user || !form.subject || !form.description) {
      return alert("All fields required");
    }

    await axios.post(`${API_BASE}/support`, form);

    setForm({ user: "", subject: "", description: "", priority: "medium" });
    setShowCreate(false);
    loadData();
  };

  /* ================= ASSIGN ================= */
  const assignTicket = async () => {
    if (!assignedTo) return alert("Select user");

    await axios.put(`${API_BASE}/support/assign/${assignTicketId}`, {
      assignedTo,
    });

    setAssignTicketId(null);
    setAssignedTo("");
    loadData();
  };

  /* ================= RESOLVE ================= */
  const resolveTicket = async (id) => {
    await axios.put(`${API_BASE}/support/resolve/${id}`);
    loadData();
  };

  return (
    <div className="support-wrapper">

      {/* ================= HEADER ================= */}
      {/* <div className="support-header">
        <div>
          <h2>Support & Ticketing</h2>
          <p>Manage customer support tickets</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? "✖ Close" : "+ Create Ticket"}
        </button>
      </div> */}

      {/* ================= CREATE FORM ================= */}
      {showCreate && (
        <div className="create-box">
          <h3>Create Ticket</h3>

          <select
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <select
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button className="primary-btn" onClick={createTicket}>
            Create Ticket
          </button>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>User</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t) => (
              <tr key={t._id}>
                <td>
                  <b>{t.ticketId}</b>
                  <div className="sub">{t.subject}</div>
                </td>

                <td>{t.user?.name}</td>

                <td>
                  <span className={`pill priority ${t.priority}`}>
                    {t.priority}
                  </span>
                </td>

                <td>
                  <span className={`pill status ${t.status}`}>
                    {t.status}
                  </span>
                </td>

                <td>{t.assignedTo || "-"}</td>

                <td>
                  {t.status === "open" && (
                    <>
                      <select
                        onChange={(e) => {
                          setAssignTicketId(t._id);
                          setAssignedTo(e.target.value);
                        }}
                      >
                        <option value="">Assign</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn-outline"
                        onClick={assignTicket}
                      >
                        ✔
                      </button>
                    </>
                  )}

                  {t.status === "in_progress" && (
                    <button
                      className="btn-outline green"
                      onClick={() => resolveTicket(t._id)}
                    >
                      Resolve
                    </button>
                  )}

                  {t.status === "resolved" && "✔"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
