import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../utils/api";
import cameroonImage from '../assets/AiLogo.png'

export default function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "OL",
    level: "Form 5",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : {
            full_name: form.full_name,
            email: form.email,
            password: form.password,
            role: form.role,
            level: form.level,
          };

      const data = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem("ticha_token", data.token);
      localStorage.setItem("ticha_user", JSON.stringify(data.user));
      showToast(data.message || (isLogin ? "Logged in!" : "Account created!"), {
        type: "success",
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth error:", err);
      showToast(err.message || "Authentication failed", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    localStorage.removeItem("ticha_token");
    localStorage.removeItem("ticha_user");
    navigate("/dashboard");
  };

  return (
    <div className="signup-screen">
      <img src={cameroonImage} alt="image of the cameroon flag" style={{width:'30%', border:'2px solid #000', borderRadius:"100%", boxShadow:'5px 5px 0 #000'}} />
      <h1>{isLogin ? "LOG IN" : "Create your Free Account"}</h1>

        <p className="message">
          {/* You’re doing great. Create an account to save your streak, subjects,
          and study progress. */}
          Join TICHA and Ace you exams!🚀
        </p>
      <div className="card">
        
<div className="tooltip">{isLogin ? "Welcome Back" : "Save your Progress"}</div>
        {!isLogin && (
          <>
          <label htmlFor="full_name">Full Name</label>
          <input
            name="full_name"
            placeholder="e.g Kandi Doe"
            value={form.full_name}
            onChange={handleChange}
          />
          </>
        )}
<label htmlFor="email">Email Address</label>
        <input
          name="email"
          placeholder="student@itek.com"
          value={form.email}
          onChange={handleChange}
        />

<label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          placeholder="********"
          value={form.password}
          onChange={handleChange}
        />

        <button className="primary" onClick={handleSignup}>
          {isLogin ? "LOG IN" : "CREATE ACCOUNT"}
        </button>

        <button className="secondary" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Need an account? Sign Up"
            : "Already have an account? Log In"}
        </button>
      </div>
    </div>
  );
}
