import { useEffect, useState } from "react";
import { apiRequest } from "../../../api";
import AdminBackButton from "../../../components/AdminBackButton";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

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
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return value;
  }
}

export default function AdminOrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [deletingOrderId, setDeletingOrderId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    apiRequest("/orders", { signal: controller.signal })
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setOrders(list);
        setStatusDrafts(
          list.reduce((acc, order) => {
            acc[order._id] = order.status || "pending";
            return acc;
          }, {})
        );
        setError("");
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [refreshFlag]);

  function handleStatusDraftChange(orderId, value) {
    setStatusDrafts(prev => ({
      ...prev,
      [orderId]: value
    }));
  }

  async function handleStatusUpdate(orderId) {
    const status = statusDrafts[orderId];
    if (!status) return;

    try {
      setError("");
      setUpdatingOrderId(orderId);
      await apiRequest(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      setRefreshFlag(flag => !flag);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingOrderId("");
    }
  }

  async function handleDelete(orderId) {
    const shouldDelete = window.confirm("Delete this order? This cannot be undone.");
    if (!shouldDelete) return;

    try {
      setError("");
      setDeletingOrderId(orderId);
      await apiRequest(`/orders/${orderId}`, { method: "DELETE" });
      setRefreshFlag(flag => !flag);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingOrderId("");
    }
  }

  return (
    <div className="page orders-page">
      <div className="orders-shell">
        <header className="products-header">
          <div>
            <p className="section-subtitle">Admin / Orders</p>
            <h1>Monitor every purchase lifecycle.</h1>
            <p className="subtitle">
              Update statuses, review totals, and keep fulfillment perfectly aligned.
            </p>
          </div>
          <div className="products-actions">
            <AdminBackButton />
          </div>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        {isLoading ? (
          <div className="order-grid">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div className="skeleton order-skeleton" key={idx} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="state-card">
            <h3>No orders yet</h3>
            <p>The moment customers check out, orders will populate here.</p>
          </div>
        ) : (
          <div className="order-grid">
            {orders.map(order => {
              const draftStatus = statusDrafts[order._id] || order.status || "pending";
              const statusOptions = ORDER_STATUSES.includes(draftStatus)
                ? ORDER_STATUSES
                : [...ORDER_STATUSES, draftStatus];
              return (
                <article className="order-card" key={order._id}>
                  <div className="order-card-header">
                    <div>
                      <p className="order-meta">Order ID: {order._id}</p>
                      <h3>{formatDate(order.dateOrdered)}</h3>
                    </div>
                    <div style={{ minWidth: "170px" }}>
                      <select
                        className="input-field"
                        value={draftStatus}
                        onChange={e => handleStatusDraftChange(order._id, e.target.value)}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="order-info-body">
                    <div>
                      <p className="order-meta">Customer</p>
                      <strong>{order.user?.name || order.user?.email || "Unknown user"}</strong>
                      {order.user?.email && <p className="order-meta">{order.user.email}</p>}
                    </div>
                    <div>
                      <p className="order-meta">Total</p>
                      <strong>{formatCurrency(order.totalPrice)}</strong>
                    </div>
                    <div>
                      <p className="order-meta">Status</p>
                      <span className="order-status">{order.status || "pending"}</span>
                    </div>
                  </div>

                  {Array.isArray(order.Orderitem) && order.Orderitem.length > 0 && (
                    <div className="order-items">
                      {order.Orderitem.map(item => (
                        <div className="order-item" key={item._id || item.product?._id}>
                          <div>
                            <strong>{item.product?.name || "Untitled product"}</strong>
                            <p className="order-meta">Qty: {item.quantity || 1}</p>
                          </div>
                          <span className="order-meta">
                            {formatCurrency(
                              (item.product?.price || 0) * (item.quantity || 1)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="order-card-footer">
                    <div className="products-actions">
                      <button
                        className="ghost-btn"
                        type="button"
                        onClick={() => handleStatusUpdate(order._id)}
                        disabled={updatingOrderId === order._id}
                      >
                        {updatingOrderId === order._id ? "Updating..." : "Update status"}
                      </button>
                      <button
                        className="ghost-btn"
                        type="button"
                        onClick={() => handleDelete(order._id)}
                        disabled={deletingOrderId === order._id}
                      >
                        {deletingOrderId === order._id ? "Deleting..." : "Delete order"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
