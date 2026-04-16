// import React, { useState } from "react";
// import axios from "axios";

// const API_URL = "https://foodhelpervendor.onrender.com/api/vendor/profile/change-password";

// const axiosAuth = axios.create();
// axiosAuth.interceptors.request.use((config) => {
//   const token = localStorage.getItem("vendorToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default function VendorProfile() {
//   const [form, setForm] = useState({
//     oldPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const [show, setShow]     = useState({ old: false, new: false, confirm: false });
//   const [loading, setLoading] = useState(false);
//   const [msg,     setMsg]     = useState(null); // { type: "success"|"error", text: "" }

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const toggleShow = (key) =>
//     setShow((s) => ({ ...s, [key]: !s[key] }));

//   const strength = (pw) => {
//     if (!pw) return 0;
//     let s = 0;
//     if (pw.length >= 8)           s++;
//     if (/[A-Z]/.test(pw))         s++;
//     if (/[0-9]/.test(pw))         s++;
//     if (/[^A-Za-z0-9]/.test(pw))  s++;
//     return s;
//   };

//   const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
//   const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#16a34a"];
//   const pwStrength    = strength(form.newPassword);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMsg(null);
//     if (form.newPassword !== form.confirmPassword) {
//       setMsg({ type: "error", text: "New passwords do not match." });
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await axiosAuth.put(API_URL, form);
//       if (res.data?.success) {
//         setMsg({ type: "success", text: res.data.message || "Password changed successfully!" });
//         setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
//       }
//     } catch (err) {
//       setMsg({ type: "error", text: err.response?.data?.message || "Something went wrong." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const css = `
//     @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

//     :root {
//       --bg:       #f4f6fb;
//       --white:    #ffffff;
//       --border:   #e4e7ef;
//       --text:     #0f172a;
//       --textMid:  #64748b;
//       --textDim:  #94a3b8;
//       --blue:     #2563eb;
//       --blueHov:  #1d4ed8;
//       --blueFade: #eff6ff;
//       --red:      #ef4444;
//       --redFade:  #fef2f2;
//       --green:    #16a34a;
//       --greenFade:#f0fdf4;
//     }

//     *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//     .cp-page {
//       font-family: 'Plus Jakarta Sans', sans-serif;
//       background: var(--bg);
//       min-height: 100vh;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       padding: 24px 16px;
//     }

//     .cp-card {
//       background: var(--white);
//       border: 1px solid var(--border);
//       border-radius: 16px;
//       box-shadow: 0 4px 24px rgba(0,0,0,0.07);
//       width: 100%;
//       max-width: 420px;
//       overflow: hidden;
//       animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1);
//     }
//     @keyframes cardIn {
//       from { opacity:0; transform:translateY(16px); }
//       to   { opacity:1; transform:translateY(0); }
//     }

//     /* ── Header ── */
//     .cp-header {
//       padding: 24px 28px 20px;
//       border-bottom: 1px solid var(--border);
//       display: flex;
//       align-items: center;
//       gap: 14px;
//     }
//     .cp-header-icon {
//       width: 44px; height: 44px;
//       border-radius: 12px;
//       background: var(--blueFade);
//       border: 1px solid #bfdbfe;
//       display: flex; align-items: center; justify-content: center;
//       font-size: 20px; flex-shrink: 0;
//     }
//     .cp-header h2 {
//       font-size: 16px; font-weight: 700;
//       color: var(--text); letter-spacing: -0.2px;
//     }
//     .cp-header p {
//       font-size: 12.5px; color: var(--textMid);
//       margin-top: 2px; font-weight: 400;
//     }

//     /* ── Body ── */
//     .cp-body { padding: 24px 28px; }

//     /* ── Alert ── */
//     .cp-alert {
//       display: flex; align-items: flex-start; gap: 10px;
//       padding: 11px 14px; border-radius: 9px;
//       font-size: 13px; font-weight: 500;
//       margin-bottom: 20px; line-height: 1.5;
//       animation: alertIn 0.25s ease;
//     }
//     @keyframes alertIn {
//       from { opacity:0; transform:translateY(-4px); }
//       to   { opacity:1; transform:translateY(0); }
//     }
//     .cp-alert.success {
//       background: var(--greenFade);
//       border: 1px solid #bbf7d0;
//       color: var(--green);
//     }
//     .cp-alert.error {
//       background: var(--redFade);
//       border: 1px solid #fecaca;
//       color: var(--red);
//     }
//     .cp-alert-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

//     /* ── Field ── */
//     .cp-field { margin-bottom: 16px; }
//     .cp-lbl {
//       display: block;
//       font-size: 12px; font-weight: 600;
//       color: var(--text); margin-bottom: 6px;
//     }
//     .cp-input-wrap { position: relative; }
//     .cp-inp {
//       width: 100%;
//       padding: 10px 40px 10px 12px;
//       border: 1px solid var(--border); border-radius: 9px;
//       font-family: 'Plus Jakarta Sans', sans-serif;
//       font-size: 13.5px; color: var(--text);
//       background: var(--white); outline: none;
//       transition: border-color 0.2s, box-shadow 0.2s;
//     }
//     .cp-inp::placeholder { color: var(--textDim); font-weight: 400; }
//     .cp-inp:focus {
//       border-color: var(--blue);
//       box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
//     }
//     .cp-eye {
//       position: absolute; right: 11px; top: 50%;
//       transform: translateY(-50%);
//       background: none; border: none; cursor: pointer;
//       color: var(--textDim); font-size: 16px; padding: 2px;
//       display: flex; align-items: center;
//       transition: color 0.2s;
//     }
//     .cp-eye:hover { color: var(--textMid); }

//     /* ── Strength bar ── */
//     .cp-strength { margin-top: 8px; }
//     .cp-strength-bars {
//       display: flex; gap: 4px; margin-bottom: 5px;
//     }
//     .cp-bar {
//       height: 4px; flex: 1; border-radius: 99px;
//       background: var(--border);
//       transition: background 0.3s;
//     }
//     .cp-strength-lbl {
//       font-size: 11.5px; font-weight: 600;
//     }

//     /* ── Match hint ── */
//     .cp-match {
//       font-size: 11.5px; margin-top: 6px; font-weight: 500;
//     }
//     .cp-match.ok  { color: var(--green); }
//     .cp-match.err { color: var(--red); }

//     /* ── Divider ── */
//     .cp-divider {
//       height: 1px; background: var(--border);
//       margin: 20px 0;
//     }

//     /* ── Submit ── */
//     .cp-submit {
//       width: 100%; padding: 12px;
//       background: var(--blue); border: none; border-radius: 9px;
//       color: #fff; font-size: 14px; font-weight: 600;
//       font-family: 'Plus Jakarta Sans', sans-serif;
//       cursor: pointer; letter-spacing: 0.2px;
//       display: flex; align-items: center; justify-content: center; gap: 8px;
//       transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
//     }
//     .cp-submit:hover:not(:disabled) {
//       background: var(--blueHov);
//       box-shadow: 0 4px 16px rgba(37,99,235,0.3);
//       transform: translateY(-1px);
//     }
//     .cp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

//     .cp-spin {
//       width: 14px; height: 14px;
//       border: 2px solid rgba(255,255,255,0.3);
//       border-top-color: #fff;
//       border-radius: 50%;
//       animation: spin 0.7s linear infinite;
//       flex-shrink: 0;
//     }
//     @keyframes spin { to { transform: rotate(360deg); } }

//     /* ── Footer note ── */
//     .cp-note {
//       text-align: center; margin-top: 16px;
//       font-size: 12px; color: var(--textDim);
//       line-height: 1.6;
//     }
//   `;

//   const EyeIcon = ({ open }) => (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
//       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       {open ? (
//         <>
//           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//           <circle cx="12" cy="12" r="3"/>
//         </>
//       ) : (
//         <>
//           <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
//           <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
//           <line x1="1" y1="1" x2="23" y2="23"/>
//         </>
//       )}
//     </svg>
//   );

//   const newPwMatch =
//     form.confirmPassword.length > 0
//       ? form.newPassword === form.confirmPassword
//       : null;

//   return (
//     <>
//       <style>{css}</style>
//       <div className="cp-page">
//         <div className="cp-card">

//           {/* Header */}
//           <div className="cp-header">
//             <div className="cp-header-icon">🔐</div>
//             <div>
//               <h2>Change Password</h2>
//               <p>Update your account password securely</p>
//             </div>
//           </div>

//           {/* Body */}
//           <div className="cp-body">

//             {/* Alert */}
//             {msg && (
//               <div className={`cp-alert ${msg.type}`}>
//                 <span className="cp-alert-icon">
//                   {msg.type === "success" ? "✓" : "⚠"}
//                 </span>
//                 <span>{msg.text}</span>
//               </div>
//             )}

//             <form onSubmit={handleSubmit}>

//               {/* Old Password */}
//               <div className="cp-field">
//                 <label className="cp-lbl">Current Password</label>
//                 <div className="cp-input-wrap">
//                   <input
//                     className="cp-inp"
//                     type={show.old ? "text" : "password"}
//                     name="oldPassword"
//                     placeholder="Enter current password"
//                     value={form.oldPassword}
//                     onChange={handleChange}
//                     required
//                   />
//                   <button type="button" className="cp-eye" onClick={() => toggleShow("old")}>
//                     <EyeIcon open={show.old} />
//                   </button>
//                 </div>
//               </div>

//               <div className="cp-divider" />

//               {/* New Password */}
//               <div className="cp-field">
//                 <label className="cp-lbl">New Password</label>
//                 <div className="cp-input-wrap">
//                   <input
//                     className="cp-inp"
//                     type={show.new ? "text" : "password"}
//                     name="newPassword"
//                     placeholder="Enter new password"
//                     value={form.newPassword}
//                     onChange={handleChange}
//                     required
//                   />
//                   <button type="button" className="cp-eye" onClick={() => toggleShow("new")}>
//                     <EyeIcon open={show.new} />
//                   </button>
//                 </div>

//                 {/* Strength meter */}
//                 {form.newPassword.length > 0 && (
//                   <div className="cp-strength">
//                     <div className="cp-strength-bars">
//                       {[1, 2, 3, 4].map((i) => (
//                         <div
//                           key={i}
//                           className="cp-bar"
//                           style={{
//                             background: i <= pwStrength ? strengthColor[pwStrength] : undefined,
//                           }}
//                         />
//                       ))}
//                     </div>
//                     <span
//                       className="cp-strength-lbl"
//                       style={{ color: strengthColor[pwStrength] }}
//                     >
//                       {strengthLabel[pwStrength]}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Confirm Password */}
//               <div className="cp-field">
//                 <label className="cp-lbl">Confirm New Password</label>
//                 <div className="cp-input-wrap">
//                   <input
//                     className="cp-inp"
//                     type={show.confirm ? "text" : "password"}
//                     name="confirmPassword"
//                     placeholder="Re-enter new password"
//                     value={form.confirmPassword}
//                     onChange={handleChange}
//                     required
//                     style={{
//                       borderColor:
//                         newPwMatch === true  ? "#86efac" :
//                         newPwMatch === false ? "#fca5a5" :
//                         undefined,
//                     }}
//                   />
//                   <button type="button" className="cp-eye" onClick={() => toggleShow("confirm")}>
//                     <EyeIcon open={show.confirm} />
//                   </button>
//                 </div>
//                 {newPwMatch === true  && <p className="cp-match ok">✓ Passwords match</p>}
//                 {newPwMatch === false && <p className="cp-match err">✗ Passwords do not match</p>}
//               </div>

//               {/* Submit */}
//               <button className="cp-submit" type="submit" disabled={loading}>
//                 {loading ? (
//                   <><span className="cp-spin" /> Updating…</>
//                 ) : (
//                   "Update Password"
//                 )}
//               </button>

//             </form>

//             <p className="cp-note">
//               Use at least 8 characters with uppercase,<br/>numbers &amp; special characters for a strong password.
//             </p>

//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";

const PROFILE_API  = "https://foodhelpervendor.onrender.com/api/vendor/profile";
const PASSWORD_API = "https://foodhelpervendor.onrender.com/api/vendor/profile/change-password";

const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

export default function VendorProfile() {
  const [profile,  setProfile]  = useState({ name: "", email: "", phone: "" });
  const [form,     setForm]     = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [show,     setShow]     = useState({ old: false, new: false, confirm: false });
  const [loading,  setLoading]  = useState(false);
  const [profLoad, setProfLoad] = useState(false);
  const [msg,      setMsg]      = useState(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await axiosAuth.get(PROFILE_API);
      if (res.data?.success) setProfile(res.data.data);
    } catch (err) { console.error(err); }
  };

  const notify = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfLoad(true);
      const res = await axiosAuth.put(PROFILE_API, { name: profile.name, phone: profile.phone });
      notify("success", res.data?.message || "Profile updated successfully!");
    } catch (err) {
      notify("error", err.response?.data?.message || "Profile update failed.");
    } finally { setProfLoad(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleShow   = (key) => setShow(s => ({ ...s, [key]: !s[key] }));

  const pwStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)           s++;
    if (/[A-Z]/.test(pw))         s++;
    if (/[0-9]/.test(pw))         s++;
    if (/[^A-Za-z0-9]/.test(pw))  s++;
    return s;
  };
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#16a34a"];
  const pwStr = pwStrength(form.newPassword);
  const pwMatch = form.confirmPassword.length > 0
    ? form.newPassword === form.confirmPassword
    : null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      notify("error", "New passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const res = await axiosAuth.put(PASSWORD_API, form);
      notify("success", res.data?.message || "Password changed successfully!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      notify("error", err.response?.data?.message || "Password change failed.");
    } finally { setLoading(false); }
  };

  const initials = profile.name
    ? profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "V";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    :root {
      --bg:       #f4f6fb;
      --white:    #ffffff;
      --border:   #e4e7ef;
      --text:     #0f172a;
      --textMid:  #64748b;
      --textDim:  #94a3b8;
      --blue:     #2563eb;
      --blueHov:  #1d4ed8;
      --blueFade: #eff6ff;
      --red:      #ef4444;
      --redFade:  #fef2f2;
      --green:    #16a34a;
      --greenFade:#f0fdf4;
      --shadow:   0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
      --shadowMd: 0 4px 20px rgba(0,0,0,0.09);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .vpr {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      min-height: 100vh;
      color: var(--text);
    }

    /* ── Topbar ── */
    .vpr-topbar {
      background: var(--white);
      border-bottom: 1px solid var(--border);
      height: 58px; padding: 0 28px;
      display: flex; align-items: center;
      position: sticky; top: 0; z-index: 50;
    }
    .vpr-brand { display: flex; align-items: center; gap: 9px; }
    .vpr-brand-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg,#2563eb,#1d4ed8);
      display: flex; align-items: center; justify-content: center; font-size: 15px;
    }
    .vpr-brand-name { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
    .vpr-brand-sep  { width:1px; height:16px; background:var(--border); margin:0 10px; }
    .vpr-brand-page { font-size: 13px; color: var(--textMid); }

    /* ── Body ── */
    .vpr-body {
      padding: 28px 24px 64px;
      max-width: 860px;
      margin: 0 auto;
    }

    /* ── Alert ── */
    .vpr-alert {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 10px;
      font-size: 13px; font-weight: 500;
      margin-bottom: 22px; line-height: 1.5;
      position: sticky; top: 70px; z-index: 40;
      animation: alertIn 0.25s ease;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }
    @keyframes alertIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    .vpr-alert.success { background: var(--greenFade); border:1px solid #bbf7d0; color: var(--green); }
    .vpr-alert.error   { background: var(--redFade);   border:1px solid #fecaca; color: var(--red); }
    .vpr-alert-ico { font-size: 16px; flex-shrink: 0; }

    /* ── Layout ── */
    .vpr-grid {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 20px;
      align-items: start;
    }

    /* ── Card ── */
    .vpr-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: var(--shadow);
      overflow: hidden;
      animation: fadeUp 0.4s ease both;
    }
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

    .vpr-card-head {
      padding: 18px 22px 16px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 12px;
    }
    .vpr-card-head-ico {
      width: 36px; height: 36px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; flex-shrink: 0;
    }
    .vpr-card-head h3 { font-size: 14px; font-weight: 700; letter-spacing: -0.2px; }
    .vpr-card-head p  { font-size: 12px; color: var(--textMid); margin-top: 2px; }
    .vpr-card-body { padding: 22px; }

    /* ── Avatar card ── */
    .vpr-avatar-card { text-align: center; padding: 28px 22px 22px; }
    .vpr-avatar {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg,#2563eb,#7c3aed);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 700; color: #fff;
      margin: 0 auto 14px; letter-spacing: 1px;
      box-shadow: 0 4px 16px rgba(37,99,235,0.25);
    }
    .vpr-avatar-name  { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .vpr-avatar-email { font-size: 12.5px; color: var(--textMid); font-weight: 400; }
    .vpr-avatar-divider { height:1px; background:var(--border); margin: 18px 0; }
    .vpr-info-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 0; border-bottom: 1px solid var(--border);
      font-size: 13px;
    }
    .vpr-info-row:last-child { border-bottom: none; }
    .vpr-info-ico  { font-size: 15px; flex-shrink: 0; }
    .vpr-info-lbl  { font-size: 11px; color: var(--textDim); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .vpr-info-val  { font-weight: 500; font-size: 13px; margin-top: 1px; }

    /* ── Form fields ── */
    .vpr-field  { margin-bottom: 16px; }
    .vpr-lbl {
      display: block; font-size: 12px; font-weight: 600;
      color: var(--text); margin-bottom: 6px;
    }
    .vpr-lbl-opt { font-weight: 400; color: var(--textDim); font-size: 11px; margin-left: 3px; }
    .vpr-input-wrap { position: relative; }
    .vpr-inp {
      width: 100%; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 9px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13.5px; color: var(--text);
      background: var(--white); outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .vpr-inp::placeholder { color: var(--textDim); font-weight: 400; }
    .vpr-inp:focus  {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .vpr-inp:disabled {
      background: #f8f9fc; color: var(--textDim);
      cursor: not-allowed;
    }
    .vpr-inp-eye { padding-right: 40px; }
    .vpr-eye {
      position: absolute; right: 11px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: var(--textDim); display: flex; align-items: center;
      padding: 2px; transition: color 0.2s;
    }
    .vpr-eye:hover { color: var(--textMid); }

    /* ── Disabled badge ── */
    .vpr-disabled-badge {
      position: absolute; right: 10px; top: 50%;
      transform: translateY(-50%);
      font-size: 10.5px; font-weight: 600;
      background: var(--bg); border: 1px solid var(--border);
      color: var(--textDim); padding: 2px 7px; border-radius: 20px;
    }

    /* ── Strength ── */
    .vpr-strength { margin-top: 7px; }
    .vpr-bars { display: flex; gap: 4px; margin-bottom: 5px; }
    .vpr-bar {
      height: 4px; flex: 1; border-radius: 99px;
      background: var(--border); transition: background 0.3s;
    }
    .vpr-str-lbl { font-size: 11.5px; font-weight: 600; }

    /* ── Match hint ── */
    .vpr-match { font-size: 11.5px; margin-top: 5px; font-weight: 500; }
    .vpr-match.ok  { color: var(--green); }
    .vpr-match.err { color: var(--red); }

    /* ── Divider ── */
    .vpr-sep { height:1px; background:var(--border); margin: 18px 0; }

    /* ── Buttons ── */
    .btn-primary {
      width: 100%; padding: 11px;
      background: var(--blue); border: none; border-radius: 9px;
      color: #fff; font-size: 13.5px; font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer; letter-spacing: 0.1px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--blueHov);
      box-shadow: 0 4px 16px rgba(37,99,235,0.3);
      transform: translateY(-1px);
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .vpr-spin {
      width: 13px; height: 13px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media(max-width: 720px) {
      .vpr-grid { grid-template-columns: 1fr; }
      .vpr-body { padding: 20px 14px 60px; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="vpr">

        {/* Topbar */}
        <div className="vpr-topbar">
          <div className="vpr-brand">
            <div className="vpr-brand-icon">🏪</div>
            <span className="vpr-brand-name">Seller Panel</span>
            <div className="vpr-brand-sep" />
            <span className="vpr-brand-page">My Profile</span>
          </div>
        </div>

        <div className="vpr-body">

          {/* Alert */}
          {msg && (
            <div className={`vpr-alert ${msg.type}`}>
              <span className="vpr-alert-ico">{msg.type === "success" ? "✓" : "⚠"}</span>
              <span>{msg.text}</span>
            </div>
          )}

          <div className="vpr-grid">

            {/* ── Left: Avatar / Info card ── */}
            <div className="vpr-card" style={{ animationDelay: "0s" }}>
              <div className="vpr-avatar-card">
                <div className="vpr-avatar">{initials}</div>
                <div className="vpr-avatar-name">{profile.name || "Vendor"}</div>
                <div className="vpr-avatar-email">{profile.email || "—"}</div>

                <div className="vpr-avatar-divider" />

                <div>
                  {[
                    { ico: "👤", lbl: "Full Name",  val: profile.name  || "—" },
                    { ico: "📧", lbl: "Email",       val: profile.email || "—" },
                    { ico: "📱", lbl: "Phone",       val: profile.phone || "Not set" },
                  ].map((r, i) => (
                    <div className="vpr-info-row" key={i}>
                      <span className="vpr-info-ico">{r.ico}</span>
                      <div>
                        <div className="vpr-info-lbl">{r.lbl}</div>
                        <div className="vpr-info-val">{r.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Edit + Password ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Edit Profile */}
              <div className="vpr-card" style={{ animationDelay: "0.05s" }}>
                <div className="vpr-card-head">
                  <div className="vpr-card-head-ico" style={{ background: "#eff6ff" }}>✏️</div>
                  <div>
                    <h3>Edit Profile</h3>
                    <p>Update your name and phone number</p>
                  </div>
                </div>
                <div className="vpr-card-body">
                  <form onSubmit={updateProfile}>

                    <div className="vpr-field">
                      <label className="vpr-lbl">Full Name</label>
                      <input
                        className="vpr-inp"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div className="vpr-field">
                      <label className="vpr-lbl">Email Address <span className="vpr-lbl-opt">(cannot edit)</span></label>
                      <div className="vpr-input-wrap">
                        <input
                          className="vpr-inp"
                          value={profile.email}
                          disabled
                        />
                        <span className="vpr-disabled-badge">Locked</span>
                      </div>
                    </div>

                    <div className="vpr-field">
                      <label className="vpr-lbl">Phone Number <span className="vpr-lbl-opt">(optional)</span></label>
                      <input
                        className="vpr-inp"
                        value={profile.phone || ""}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <button className="btn-primary" type="submit" disabled={profLoad}>
                      {profLoad ? <><span className="vpr-spin" /> Saving…</> : "Save Changes"}
                    </button>

                  </form>
                </div>
              </div>

              {/* Change Password */}
              <div className="vpr-card" style={{ animationDelay: "0.1s" }}>
                <div className="vpr-card-head">
                  <div className="vpr-card-head-ico" style={{ background: "#fdf4ff" }}>🔐</div>
                  <div>
                    <h3>Change Password</h3>
                    <p>Update your account password securely</p>
                  </div>
                </div>
                <div className="vpr-card-body">
                  <form onSubmit={handlePasswordSubmit}>

                    {/* Current Password */}
                    <div className="vpr-field">
                      <label className="vpr-lbl">Current Password</label>
                      <div className="vpr-input-wrap">
                        <input
                          className="vpr-inp vpr-inp-eye"
                          type={show.old ? "text" : "password"}
                          name="oldPassword"
                          placeholder="Enter current password"
                          value={form.oldPassword}
                          onChange={handleChange}
                          required
                        />
                        <button type="button" className="vpr-eye" onClick={() => toggleShow("old")}>
                          <EyeIcon open={show.old} />
                        </button>
                      </div>
                    </div>

                    <div className="vpr-sep" />

                    {/* New Password */}
                    <div className="vpr-field">
                      <label className="vpr-lbl">New Password</label>
                      <div className="vpr-input-wrap">
                        <input
                          className="vpr-inp vpr-inp-eye"
                          type={show.new ? "text" : "password"}
                          name="newPassword"
                          placeholder="Enter new password"
                          value={form.newPassword}
                          onChange={handleChange}
                          required
                        />
                        <button type="button" className="vpr-eye" onClick={() => toggleShow("new")}>
                          <EyeIcon open={show.new} />
                        </button>
                      </div>
                      {form.newPassword.length > 0 && (
                        <div className="vpr-strength">
                          <div className="vpr-bars">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="vpr-bar"
                                style={{ background: i <= pwStr ? strengthColor[pwStr] : undefined }}
                              />
                            ))}
                          </div>
                          <span className="vpr-str-lbl" style={{ color: strengthColor[pwStr] }}>
                            {strengthLabel[pwStr]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="vpr-field">
                      <label className="vpr-lbl">Confirm New Password</label>
                      <div className="vpr-input-wrap">
                        <input
                          className="vpr-inp vpr-inp-eye"
                          type={show.confirm ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Re-enter new password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                          style={{
                            borderColor:
                              pwMatch === true  ? "#86efac" :
                              pwMatch === false ? "#fca5a5" : undefined
                          }}
                        />
                        <button type="button" className="vpr-eye" onClick={() => toggleShow("confirm")}>
                          <EyeIcon open={show.confirm} />
                        </button>
                      </div>
                      {pwMatch === true  && <p className="vpr-match ok">✓ Passwords match</p>}
                      {pwMatch === false && <p className="vpr-match err">✗ Passwords do not match</p>}
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading}>
                      {loading ? <><span className="vpr-spin" /> Updating…</> : "Update Password"}
                    </button>

                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}