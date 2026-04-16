// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const API = "https://foodhelpervendor.onrender.com/api/vendor";

// export default function VendorAuth() {
//   const navigate = useNavigate();

//   const [isSignup, setIsSignup] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   const [signupForm, setSignupForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//   });

//   const [loginForm, setLoginForm] = useState({
//     email: "",
//     password: "",
//   });

//   /* ================= SIGNUP ================= */
//   const handleSignupChange = (e) => {
//     setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({});

//     try {
//       const res = await axios.post(`${API}/signup`, signupForm);
//       setMessage({
//         type: "success",
//         text: res.data.message || "Signup successful. Wait for admin approval",
//       });
//       setIsSignup(false);
//       setSignupForm({ name: "", email: "", password: "", phone: "" });
//     } catch (err) {
//       setMessage({
//         type: "error",
//         text: err.response?.data?.message || "Signup failed",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= LOGIN ================= */
//   const handleLoginChange = (e) => {
//     setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({});

//     try {
//       const res = await axios.post(`${API}/login`, loginForm);

//       localStorage.setItem("vendorToken", res.data.token);

//       setMessage({ type: "success", text: "Login successful" });

//       // 🔥 Redirect after login
//       setTimeout(() => {
//         navigate("/vendor/dashboard"); // future page
//       }, 800);
//     } catch (err) {
//       setMessage({
//         type: "error",
//         text:
//           err.response?.data?.message ||
//           "Login failed. Check credentials or approval",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <h2 style={styles.heading}>
//           {isSignup ? "Vendor Signup" : "Vendor Login"}
//         </h2>

//         {message.text && (
//           <p
//             style={{
//               ...styles.message,
//               color: message.type === "error" ? "#dc2626" : "#16a34a",
//             }}
//           >
//             {message.text}
//           </p>
//         )}

//         {isSignup ? (
//           <form onSubmit={handleSignup} style={styles.form}>
//             <input
//               name="name"
//               placeholder="Vendor Name"
//               value={signupForm.name}
//               onChange={handleSignupChange}
//               required
//             />

//             <input
//               name="email"
//               type="email"
//               placeholder="Email"
//               value={signupForm.email}
//               onChange={handleSignupChange}
//               required
//             />

//             <input
//               name="password"
//               type="password"
//               placeholder="Password"
//               value={signupForm.password}
//               onChange={handleSignupChange}
//               required
//             />

//             <input
//               name="phone"
//               placeholder="Phone (optional)"
//               value={signupForm.phone}
//               onChange={handleSignupChange}
//             />

//             <button disabled={loading}>
//               {loading ? "Signing up..." : "Signup"}
//             </button>

//             <p style={styles.switchText}>
//               Already have an account?{" "}
//               <span onClick={() => setIsSignup(false)}>Login</span>
//             </p>
//           </form>
//         ) : (
//           <form onSubmit={handleLogin} style={styles.form}>
//             <input
//               name="email"
//               type="email"
//               placeholder="Email"
//               value={loginForm.email}
//               onChange={handleLoginChange}
//               required
//             />

//             <input
//               name="password"
//               type="password"
//               placeholder="Password"
//               value={loginForm.password}
//               onChange={handleLoginChange}
//               required
//             />

//             <button disabled={loading}>
//               {loading ? "Logging in..." : "Login"}
//             </button>

//             <p style={styles.switchText}>
//               New vendor?{" "}
//               <span onClick={() => setIsSignup(true)}>Signup</span>
//             </p>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ================= STYLES ================= */
// const styles = {
//   container: {
//     minHeight: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     background: "#f1f5f9",
//   },
//   card: {
//     width: 360,
//     padding: 28,
//     borderRadius: 10,
//     background: "#fff",
//     boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
//   },
//   heading: {
//     textAlign: "center",
//     marginBottom: 16,
//   },
//   form: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 12,
//   },
//   switchText: {
//     marginTop: 12,
//     fontSize: 14,
//     textAlign: "center",
//     cursor: "pointer",
//   },
//   message: {
//     textAlign: "center",
//     marginBottom: 12,
//     fontSize: 14,
//     fontWeight: 500,
//   },
// };

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://foodhelpervendor.onrender.com/api/vendor";

export default function VendorAuth() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [mounted, setMounted] = useState(false);

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignupChange = (e) =>
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});
    try {
      const res = await axios.post(`${API}/signup`, signupForm);
      setMessage({
        type: "success",
        text: res.data.message || "Signup successful. Awaiting admin approval.",
      });
      setIsSignup(false);
      setSignupForm({ name: "", email: "", password: "", phone: "" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Signup failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});
    try {
      const res = await axios.post(`${API}/login`, loginForm);
      localStorage.setItem("vendorToken", res.data.token);
      setMessage({ type: "success", text: "Welcome back! Redirecting..." });
      setTimeout(() => navigate("/vendor/dashboard"), 900);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Login failed. Check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMessage({});
    setIsSignup(!isSignup);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .va-root {
          font-family: 'DM Sans', sans-serif;
          background: #0c0c0e;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .va-root::before {
          content: '';
          position: fixed;
          top: -200px; left: 50%;
          transform: translateX(-50%);
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(214,170,98,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .va-root::after {
          content: '';
          position: fixed;
          bottom: -200px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(214,170,98,0.04) 0%, transparent 65%);
          pointer-events: none;
        }
        .va-card {
          width: 100%;
          max-width: 400px;
          padding: 40px 40px 36px;
          background: #111114;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(214,170,98,0.04);
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(24px) scale(0.98);
          transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1);
        }
        .va-card.mounted { opacity: 1; transform: translateY(0) scale(1); }

        .va-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .va-brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #d6aa62, #a87a3a);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .va-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600;
          color: #f0e8d5; letter-spacing: 0.4px;
        }
        .va-mode-tabs {
          display: flex;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding: 4px; margin-bottom: 32px;
        }
        .va-tab {
          flex: 1; padding: 10px; border-radius: 7px; font-size: 13px;
          font-weight: 500; cursor: pointer; text-align: center;
          transition: all 0.3s ease; color: rgba(240,232,213,0.35);
          border: none; background: transparent;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.3px;
        }
        .va-tab.active {
          background: linear-gradient(135deg, #d6aa62, #b8922f);
          color: #0c0c0e; font-weight: 600;
          box-shadow: 0 4px 16px rgba(214,170,98,0.22);
        }
        .va-form-body { animation: panelIn 0.3s ease; }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .va-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 400;
          color: #f0e8d5; margin-bottom: 4px; letter-spacing: 0.2px;
        }
        .va-form-subtitle {
          font-size: 13px; color: rgba(240,232,213,0.3);
          margin-bottom: 28px; font-weight: 300; line-height: 1.5;
        }
        .va-message {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 11px 13px; border-radius: 8px; font-size: 13px;
          margin-bottom: 18px; line-height: 1.5;
          animation: fadeSlideIn 0.3s ease;
        }
        .va-message.error  { background: rgba(220,38,38,0.08);  border: 1px solid rgba(220,38,38,0.18);  color: #f87171; }
        .va-message.success{ background: rgba(22,163,74,0.08);  border: 1px solid rgba(22,163,74,0.18);  color: #4ade80; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .va-group { margin-bottom: 14px; }
        .va-label {
          display: block; font-size: 11px; letter-spacing: 1.4px;
          text-transform: uppercase; color: rgba(240,232,213,0.35);
          margin-bottom: 7px; font-weight: 500;
        }
        .va-input-wrap { position: relative; }
        .va-input-icon {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%); font-size: 14px;
          color: rgba(214,170,98,0.45); pointer-events: none; line-height: 1;
        }
        .va-input {
          width: 100%; padding: 12px 14px 12px 38px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px; color: #f0e8d5; font-size: 14px;
          font-family: 'DM Sans', sans-serif; font-weight: 300; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .va-input::placeholder { color: rgba(240,232,213,0.18); }
        .va-input:focus {
          border-color: rgba(214,170,98,0.45);
          background: rgba(255,255,255,0.055);
          box-shadow: 0 0 0 3px rgba(214,170,98,0.07);
        }
        .va-btn {
          width: 100%; padding: 13px; margin-top: 6px;
          background: linear-gradient(135deg, #d6aa62, #a87a3a);
          border: none; border-radius: 9px; color: #0c0c0e;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.4px;
          cursor: pointer; transition: transform 0.25s, box-shadow 0.25s;
          position: relative; overflow: hidden;
        }
        .va-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .va-btn:hover::after { opacity: 1; }
        .va-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(214,170,98,0.3); }
        .va-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .va-spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(12,12,14,0.3); border-top-color: #0c0c0e;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .va-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0 6px; }
        .va-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .va-divider-text { font-size: 11px; color: rgba(240,232,213,0.2); letter-spacing: 1px; text-transform: uppercase; }
        .va-switch { text-align: center; font-size: 13px; color: rgba(240,232,213,0.3); font-weight: 300; }
        .va-switch-link { color: #d6aa62; cursor: pointer; font-weight: 500; transition: opacity 0.2s; }
        .va-switch-link:hover { opacity: 0.7; }
      `}</style>

      <div className="va-root">
        <div className={`va-card ${mounted ? "mounted" : ""}`}>
          {/* Brand */}
          <div className="va-brand">
            <div className="va-brand-icon">🏪</div>
            <span className="va-brand-name">Seller Panel</span>
          </div>

          {/* Tabs */}
          <div className="va-mode-tabs">
            <button
              className={`va-tab ${!isSignup ? "active" : ""}`}
              onClick={() => isSignup && switchMode()}
            >
              Login
            </button>
            <button
              className={`va-tab ${isSignup ? "active" : ""}`}
              onClick={() => !isSignup && switchMode()}
            >
              Sign Up
            </button>
          </div>

          <div className="va-form-body" key={isSignup ? "signup" : "login"}>
            <h2 className="va-form-title">
              {isSignup ? "Create account" : "Welcome back"}
            </h2>
            <p className="va-form-subtitle">
              {isSignup
                ? "Register as a vendor — approval within 24 hours"
                : "Sign in to access your vendor dashboard"}
            </p>

            {message.text && (
              <div className={`va-message ${message.type}`}>
                <span>{message.type === "error" ? "⚠" : "✓"}</span>
                <span>{message.text}</span>
              </div>
            )}

            {isSignup ? (
              <form onSubmit={handleSignup}>
                <div className="va-group">
                  <label className="va-label">Vendor Name</label>
                  <div className="va-input-wrap">
                    <span className="va-input-icon">🏷</span>
                    <input
                      className="va-input"
                      name="name"
                      placeholder="Your store name"
                      value={signupForm.name}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>
                <div className="va-group">
                  <label className="va-label">Email</label>
                  <div className="va-input-wrap">
                    <span className="va-input-icon">✉</span>
                    <input
                      className="va-input"
                      name="email"
                      type="email"
                      placeholder="vendor@email.com"
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>
                <div className="va-group">
                  <label className="va-label">Password</label>
                  <div className="va-input-wrap">
                    <span className="va-input-icon">🔒</span>
                    <input
                      className="va-input"
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>
                <div className="va-group">
                  <label className="va-label">
                    Phone{" "}
                    <span
                      style={{
                        color: "rgba(240,232,213,0.22)",
                        textTransform: "none",
                        letterSpacing: 0,
                        fontSize: 11,
                        fontWeight: 300,
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <div className="va-input-wrap">
                    <span className="va-input-icon">📞</span>
                    <input
                      className="va-input"
                      name="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={signupForm.phone}
                      onChange={handleSignupChange}
                    />
                  </div>
                </div>
                <button className="va-btn" disabled={loading}>
                  {loading && <span className="va-spinner" />}
                  {loading ? "Creating account..." : "Create Vendor Account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <div className="va-group">
                  <label className="va-label">Email</label>
                  <div className="va-input-wrap">
                    <span className="va-input-icon">✉</span>
                    <input
                      className="va-input"
                      name="email"
                      type="email"
                      placeholder="vendor@email.com"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                </div>
                <div className="va-group">
                  <label className="va-label">Password</label>
                  <div className="va-input-wrap">
                    <span className="va-input-icon">🔒</span>
                    <input
                      className="va-input"
                      name="password"
                      type="password"
                      placeholder="Your password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                </div>
                <button className="va-btn" disabled={loading}>
                  {loading && <span className="va-spinner" />}
                  {loading ? "Signing in..." : "Sign In to Dashboard"}
                </button>
              </form>
            )}

            <div className="va-divider">
              <div className="va-divider-line" />
              <span className="va-divider-text">or</span>
              <div className="va-divider-line" />
            </div>
            <p className="va-switch">
              {isSignup ? "Already have an account? " : "New vendor? "}
              <span className="va-switch-link" onClick={switchMode}>
                {isSignup ? "Sign in" : "Create account"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
