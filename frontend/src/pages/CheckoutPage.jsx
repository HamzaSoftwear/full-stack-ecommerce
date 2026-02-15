import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../AuthContext";

function readCart() {
  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatCurrency(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(readCart());
  }, []);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item?.product?.price ?? item?.price ?? 0) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
    return {
      subtotal,
      tax: subtotal * 0.08,
      total: subtotal * 1.08
    };
  }, [cartItems]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please log in to place an order.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const Orderitem = cartItems
      .map(item => ({
        quantity: item.quantity || 1,
        product: item.product?._id || item.product
      }))
      .filter(item => item.product);

    if (Orderitem.length === 0) {
      setError("Unable to build order items. Please refresh your cart.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          Orderitem,
          address,
          city,
          phone
        })
      });

      // Generate a mock order ID if not provided
      const mockOrderId = response._id || response.id || `ORD-${Date.now()}`;
      setOrderId(mockOrderId);

      localStorage.removeItem("cart");
      setCartItems([]);
      
      // Show success animation
      setShowSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
      navigate("/my-orders");
      }, 3000);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  if (showSuccess) {
    return (
      <div className="page checkout-page">
        <div className="checkout-success-container">
          <div className="checkout-success-card">
            <div className="success-icon-wrapper">
              <div className="success-checkmark">
                <svg viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="25" fill="none" stroke="#10b981" strokeWidth="2"/>
                  <path fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-16"/>
                </svg>
              </div>
            </div>
            <h1 className="success-title">Payment Successful!</h1>
            <p className="success-message">
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </p>
            {orderId && (
              <div className="order-id-display">
                <span>Order ID:</span>
                <strong>{orderId}</strong>
              </div>
            )}
            <div className="success-actions">
              <Link className="primary-btn" to="/my-orders">
                View My Orders
              </Link>
              <Link className="ghost-btn" to="/">
                Continue Shopping
              </Link>
            </div>
            <p className="success-redirect">Redirecting to orders page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page checkout-page">
        <div className="state-card cart-empty">
          <h3>Sign in to checkout</h3>
          <p>Log in or create an account to place an order.</p>
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
    <div className="page checkout-page">
      <div className="checkout-shell">
        <header className="checkout-header">
          <div>
            <p className="section-subtitle">Secure checkout</p>
            <h1>Complete your order with confidence.</h1>
            <p className="subtitle">
              Provide your shipping details and review your cart before placing the order.
            </p>
          </div>
          <Link className="ghost-link" to="/cart">
            Return to cart
          </Link>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        <div className="checkout-grid">
          <section className="checkout-card">
            <h2>Shipping information</h2>
            <form className="checkout-form" onSubmit={handleSubmit}>
              <label>
                <span>Address</span>
                <input
                  type="text"
                  className="input-field"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </label>

              <label>
                <span>City</span>
                <input
                  type="text"
                  className="input-field"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Riyadh"
                  required
                />
              </label>

              <label>
                <span>Phone number</span>
                <input
                  type="tel"
                  className="input-field"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+9665xxxxxxx"
                  required
                />
              </label>

              <button className="primary-btn place-order-btn" disabled={isSubmitting}>
                {isSubmitting ? "Placing order..." : "Place Order"}
              </button>
            </form>
          </section>

          <aside className="checkout-summary">
            <h2>Cart summary</h2>
            {cartItems.length === 0 ? (
              <p className="cart-empty-text">
                Your cart is empty. Add items before checking out.
              </p>
            ) : (
              <>
                <div className="summary-items">
                  {cartItems.map((item, idx) => (
                    <div
                      className="summary-item"
                      key={item.product?._id || item.product || idx}
                    >
                      <div>
                        <strong>{item.product?.name || "Untitled product"}</strong>
                        <p className="product-meta">Qty: {item.quantity || 1}</p>
                      </div>
                      <span>
                        {formatCurrency(
                          (parseFloat(item.product?.price ?? item.price ?? 0) || 0) *
                            (item.quantity || 1)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="summary-totals">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatCurrency(totals.subtotal)}</strong>
                  </div>
                  <div>
                    <span>Tax estimate</span>
                    <strong>{formatCurrency(totals.tax)}</strong>
                  </div>
                  <div className="summary-grand">
                    <span>Total</span>
                    <strong>{formatCurrency(totals.total)}</strong>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
