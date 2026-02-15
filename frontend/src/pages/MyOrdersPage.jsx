import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../AuthContext";

function formatDate(value) {
  if (!value) return "Unknown date";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return value;
  }
}

function formatCurrency(value) {
  const amount = typeof value === "number" ? value : Number(value) || 0;
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setOrders([]);
      return;
    }

    const controller = new AbortController();

    apiRequest(`/orders/myorder/${userId}`, { signal: controller.signal })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [userId]);

  if (!user) {
    return (
      <div className="page orders-page">
        <div className="state-card cart-empty">
          <h3>Sign in to see your orders</h3>
          <p>Your purchase history will appear here once you log in.</p>
          <div className="cart-empty-actions">
            <Link className="primary-btn" to="/login">
              Login
            </Link>
            <Link className="ghost-btn" to="/register">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page orders-page">
      <div className="orders-shell">
        <header className="products-header">
          <div>
            <p className="section-subtitle">My orders</p>
            <h1>Track every purchase and stay in the know.</h1>
            <p className="subtitle">
              Review order status, totals, and the products inside each package.
            </p>
          </div>
          <Link className="ghost-link" to="/">
            العودة للرئيسية
          </Link>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        {isLoading ? (
          <div className="order-grid">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div className="skeleton order-skeleton" key={idx} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="state-card cart-empty">
            <h3>No orders yet</h3>
            <p>Once you check out, your orders will be listed here.</p>
            <Link className="primary-btn" to="/">
              تصفح الصفحة الرئيسية
            </Link>
          </div>
        ) : (
          <div className="order-grid">
            {orders.map(order => (
              <article className="order-card" key={order._id}>
                <div className="order-card-header">
                  <div>
                    <p className="order-meta">Order ID: {order._id}</p>
                    <h3>{formatDate(order.dateOrdered)}</h3>
                  </div>
                  <span className="order-status">{order.status || "pending"}</span>
                </div>

                <div className="order-items">
                  {(order.Orderitem || []).map(item => (
                    <div className="order-item" key={item._id || item.product?._id}>
                      <div>
                        <strong>{item.product?.name || "Untitled product"}</strong>
                        <p className="order-meta">
                          {formatCurrency(item.product?.price)} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="order-meta">
                        {formatCurrency((item.product?.price || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div>
                    <p className="order-meta">Total Paid</p>
                    <strong>{formatCurrency(order.totalPrice)}</strong>
                  </div>
                  <Link className="ghost-btn order-view-btn" to={`/orders/${order._id}`}>
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
