import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api";

function formatCurrency(value) {
  const amount = typeof value === "number" ? value : Number(value) || 0;
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value) {
  if (!value) return "Unknown date";
  try {
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return value;
  }
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    apiRequest(`/orders/${id}`, { signal: controller.signal })
      .then(data => {
        setOrder(data);
        setError("");
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [id]);

  return (
    <div className="page order-details-page">
      <div className="orders-shell">
        <header className="products-header">
          <div>
            <p className="section-subtitle">Order details</p>
            <h1>Deep dive into every shipment touchpoint.</h1>
            <p className="subtitle">
              Status updates, shipping destination, and line items in one place.
            </p>
          </div>
          <Link className="ghost-link" to="/my-orders">
            Back to orders
          </Link>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        {isLoading ? (
          <div className="order-detail-grid">
            <div className="skeleton order-skeleton" />
            <div className="skeleton order-skeleton" />
          </div>
        ) : !order ? (
          <div className="state-card cart-empty">
            <h3>Order not found</h3>
            <p>The requested order could not be retrieved.</p>
            <Link className="primary-btn" to="/my-orders">
              Return to orders
            </Link>
          </div>
        ) : (
          <div className="order-detail-grid">
            <section className="order-info-card">
              <div className="order-card-header">
                <div>
                  <p className="order-meta">Order ID: {order._id}</p>
                  <h3>{formatDate(order.dateOrdered)}</h3>
                </div>
                <span className="order-status">{order.status || "pending"}</span>
              </div>
              <div className="order-info-body">
                <div>
                  <p className="order-meta">Shipping to</p>
                  <strong>{order.address}</strong>
                  <p className="order-meta">{order.city}</p>
                  <p className="order-meta">{order.phone}</p>
                </div>
                <div>
                  <p className="order-meta">Payment summary</p>
                  <strong>{formatCurrency(order.totalPrice)}</strong>
                  <p className="order-meta">
                    Items: {(order.Orderitem || []).reduce((sum, i) => sum + (i.quantity || 1), 0)}
                  </p>
                </div>
              </div>
            </section>

            <section className="order-line-items">
              <h3>Items in this order</h3>
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
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
