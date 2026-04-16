// // import React, { useState } from 'react';
// // import axios from 'axios';
// // import { useNavigate, Link } from 'react-router-dom';

// // export default function Login() {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const navigate = useNavigate();

// //   const submit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const res = await axios.post('https://grocerrybackend.onrender.com/api/admin/login', { email, password });
// //       // backend returns { token, role, name } per the admin-only backend spec
// //       if (!res.data || !res.data.token) {
// //         alert('Login failed: Invalid response from server');
// //         return;
// //       }
// //       if (res.data.role !== 'admin') {
// //         alert('Access Denied — only admin can login here');
// //         return;
// //       }
// //       localStorage.setItem('token', res.data.token);
// //       localStorage.setItem('role', res.data.role);
// //       localStorage.setItem('name', res.data.name || 'Admin');
// //       // redirect to admin
// //       navigate('/admin', { replace: true });
// //     } catch (err) {
// //       console.error(err);
// //       alert(err.response?.data?.message || 'Login failed — check credentials & server');
// //     }
// //   };

// //   return (
// //     <div className="container py-5">
// //       <div className="row justify-content-center">
// //         <div className="col-md-5 col-lg-4">
// //           <div className="card p-4 shadow-sm">
// //             <h4 className="mb-3 text-center">Admin Login</h4>
// //             <form onSubmit={submit}>
// //               <input
// //                 type="email"
// //                 className="form-control mb-2"
// //                 placeholder="Email"
// //                 value={email}
// //                 onChange={(e) => setEmail(e.target.value)}
// //                 required
// //               />
// //               <input
// //                 type="password"
// //                 className="form-control mb-3"
// //                 placeholder="Password"
// //                 value={password}
// //                 onChange={(e) => setPassword(e.target.value)}
// //                 required
// //               />
// //               <button className="btn btn-primary w-100">Login</button>
// //             </form>
// //             <div className="text-center mt-3">
// //               <small>
// //                 Don't have an admin account? <Link to="/signup">Signup</Link>
// //               </small>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// import "./Login.css";
// import logo from "../assets/WhatsApp Image 2025-12-05 at 13.19.29_68ae0406.jpg";
// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("https://grocerrybackend.onrender.com/api/admin/login", {
//         email,
//         password,
//       });

//       if (!res.data || !res.data.token) {
//         alert("Login failed: Invalid response from server");
//         return;
//       }

//       if (res.data.role !== "admin") {
//         alert("Access Denied — only admin can login here");
//         return;
//       }

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("role", res.data.role);
//       localStorage.setItem("name", res.data.name || "Admin");

//       navigate("/admin/users", { replace: true });
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Login failed — check credentials & server");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <h2 className="login-title">Admin Login</h2>
//         <p className="login-subtitle">Welcome back! Please sign in to continue.</p>
//         <form onSubmit={submit} className="login-form">
//           <div className="input-group">
//             <input
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="input-group">
//             <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <button type="submit" className="login-btn">
//             Login
//           </button>
//         </form>

//         <div className="signup-link">
//           <p>
//             Don’t have an account?{" "}
//             <Link to="/signup" className="link">
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import loginImg from "../assets/WhatsApp Image 2025-12-05 at 13.19.29_68ae0406.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://grocerrybackend.onrender.com/api/admin/login", {
        email,
        password,
      });

      if (!res.data || !res.data.token) {
        alert("Login failed: Invalid response from server");
        return;
      }

      if (res.data.role !== "admin") {
        alert("Access Denied — only admin can login here");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name || "Admin");

      navigate("/admin/pricelist", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-wrapper">
      {/* LEFT IMAGE SECTION */}
      <div className="login-left">
        <img src={loginImg} alt="Login Visual" className="login-image" />
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="login-right">
        <div className="login-box">

          <h2 className="login-title">Welcome Back 👋</h2>
          <p className="login-subtitle">Admin Portal Access</p>

          <form onSubmit={submit} className="login-form">

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="login-btn">Login</button>
          </form>

          {/* <p className="signup-text">
             <Link to="/signup">Sign Up</Link>
          </p> */}

        </div>
      </div>
    </div>
  );
}
