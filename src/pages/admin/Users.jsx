
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./Users.css";

// const API = "https://grocerrybackend.onrender.com/api/user";

// export default function Users() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     // password: "",
//     role: "user",
//   });

//   const [editId, setEditId] = useState(null);
//   const [openMenu, setOpenMenu] = useState(null); // 3 dots dropdown

//   const fetchUsers = () => {
//     setLoading(true);
//     axios
//       .get(API)
//       .then((res) => setUsers(res.data))
//       .catch((err) => console.error(err))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       if (editId) {
//         await axios.put(`${API}/${editId}`, form);
//         alert("User updated");
//       } else {
//         await axios.post(API, form);
//         alert("User created");
//       }

//       setForm({ name: "", email: "", password: "", role: "user" });
//       setEditId(null);
//       fetchUsers();
//     } catch (err) {
//       alert("Save failed");
//     }
//   };

//   const handleEdit = (usr) => {
//     setForm({
//       name: usr.name,
//       email: usr.email,
//       password: "",
//       role: usr.role,
//     });
//     setEditId(usr._id);
//     setOpenMenu(null);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete user?")) return;

//     try {
//       await axios.delete(`${API}/${id}`);
//       setOpenMenu(null);
//       fetchUsers();
//     } catch {
//       alert("Delete failed");
//     }
//   };

//   return (
//     <div className="users-container">
//       <div className="users-header">
//         <h2> User Management</h2>
        
        
//       </div>
// <br/>
// <br/>
//       {/* Form */}
//       {/* <form className="user-form" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Name"
//           value={form.name}
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />

//         <input
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//         />

//         <input
//           type="text"
//           placeholder="Password (encrypted)"
//           value={form.password}
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />

//         <select
//           value={form.role}
//           onChange={(e) => setForm({ ...form, role: e.target.value })}
//         >
//           <option value="user">User</option>
//           <option value="admin">Admin</option>
//         </select>

//         <button type="submit">{editId ? "Update User" : "Add User"}</button>

//         {editId && (
//           <button
//             type="button"
//             className="cancel-btn"
//             onClick={() => {
//               setEditId(null);
//               setForm({ name: "", email: "", password: "", role: "user" });
//             }}
//           >
//             Cancel
//           </button>
//         )}
//       </form> */}

//       {/* TABLE WITH SCROLL */}
//       {!loading && (
//         <div className="table-wrapper">
//           <table className="users-table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Name</th>
//                 <th>Email</th>
//                 {/* <th>Password</th> */}
//                 <th>Role</th>
//                 {/* <th>Actions</th> */}
//               </tr>
//             </thead>

//             <tbody>
//               {users.map((u, i) => (
//                 <tr key={u._id}>
//                   <td>{i + 1}</td>
//                   <td>{u.name}</td>
//                   <td>{u.email}</td>

//                   {/* <td className="password-col">{u.password}</td> */}

//                   <td>
//                     <span className={`role-badge ${u.role}`}>{u.role}</span>
//                   </td>

//                   {/* 3 DOTS MENU */}
//                   {/* <td className="action-cell">
//                     <div className="action-menu">
//                       <button
//                         className="dots-btn"
//                         onClick={() =>
//                           setOpenMenu(openMenu === u._id ? null : u._id)
//                         }
//                       >
//                         ⋮
//                       </button>

//                       {openMenu === u._id && (
//                         <div className="dropdown-menu">
//                           <button onClick={() => handleEdit(u)}>Edit</button>
//                           <button onClick={() => handleDelete(u._id)}>
//                             Delete
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </td> */}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {loading && <div className="loader">Loading users...</div>}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Users.css";

const API = "https://foodhelpervendor.onrender.com/api/user/all";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>👥 Users / Customers</h2>
      </div>

      {loading ? (
        <div className="loader">Loading users...</div>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Verified</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No users found
                  </td>
                </tr>
              )}

              {users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>{u.name || "-"}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.isEmailVerified ? "✅ Verified" : "⏳ Pending"}
                  </td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
