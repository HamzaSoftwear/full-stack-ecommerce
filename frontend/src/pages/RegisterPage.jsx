// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      // هذا يطابق backend:
      // POST /api/v1/users
      await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify({
          username: name, // ملاحظة: الـ backend يستخدم username
          email,
          password
        })
      });

      // بعد نجاح إنشاء الحساب نوجّه المستخدم لصفحة تسجيل الدخول
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page register-page">
      <div className="register-shell">
        <div className="register-hero">
          <p className="eyebrow">CREATE YOUR ACCOUNT</p>
          <h1>Sign up and never miss a good deal.</h1>
          <p>
          Create a free account to track your orders, save your favorite products, and check out in just a few clicks.
          </p>
          <ul className="register-hero-list">
            <li>
              <span>✓</span> Track all your orders in one place
            </li>
            <li>
              <span>✓</span> View your full order history anytime
            </li>
            <li>
              <span>✓</span> Secure checkout and saved addresses
            </li>
          </ul>
        </div>

        <div className="register-card">
          <div>
            <h2>Create your account</h2>
            <p>A few quick details and you’re ready to go.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full name"
              className="input-field"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Work email"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <div className="password-grid">
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirm password"
                className="input-field"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </form>

          {error && <p className="error-text">{error}</p>}

          <div className="register-foot">
            <span>Already have an account?</span>
            <Link className="secondary-link" to="/login">
              Sign in
            </Link>
          </div>
          <div className="register-foot subtle">
            <span>Want to look around first?</span>
            <Link className="secondary-link" to="/">
              Go to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
