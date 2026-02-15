import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await apiRequest("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      login(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page login-page">
      <div className="login-shell">
        <div className="login-hero">
          <p className="eyebrow">WELCOME BACK</p>
          <h1>All your shopping in one place.</h1>
          <p>
            Sign in to track your orders, save your favorites, and check out faster.
          </p>
          <ul className="login-hero-list">
            <li>
              <span>1</span> Exclusive offers just for you
            </li>
            <li>
              <span>2</span> Faster checkout every time
            </li>
            <li>
              <span>3</span> Fast checkout with saved details
            </li>
          </ul>
        </div>

        <div className="login-card">
          <div>
            <h2>Welcome back</h2>
            <p>Please enter your credentials to continue.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? "Signing you in..." : "Login"}
            </button>
          </form>

          {error && <p className="error-text">{error}</p>}

          <div className="login-foot">
            <span>Need an account?</span>
            <Link className="secondary-link" to="/register">
              Create one
            </Link>
          </div>
          <div className="login-foot subtle">
            <span>Want to browse first?</span>
            <Link className="secondary-link" to="/">
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
