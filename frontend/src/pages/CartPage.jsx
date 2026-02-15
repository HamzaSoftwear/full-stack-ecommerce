import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { readCartItems, writeCartItems } from "../utils/cart";

function extractName(item) {
  return item?.product?.name || item?.name || "Untitled item";
}

function extractPrice(item) {
  const price = item?.product?.price ?? item?.price ?? 0;
  return typeof price === "number" ? price : Number(price) || 0;
}

function extractImage(item) {
  return item?.product?.image || item?.image || "";
}

function formatPrice(price) {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cartItems = readCartItems();
    setItems(Array.isArray(cartItems) ? cartItems : []);
      setIsLoading(false);
  }, []);

  function handleQuantityChange(itemIndex, newQuantity) {
    if (newQuantity < 1) {
      handleRemoveItem(itemIndex);
      return;
    }
    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: newQuantity
    };
    setItems(updatedItems);
    writeCartItems(updatedItems);
  }

  function handleRemoveItem(itemIndex) {
    const updatedItems = items.filter((_, idx) => idx !== itemIndex);
    setItems(updatedItems);
    writeCartItems(updatedItems);
  }

  const subtotal = items.reduce(
    (sum, item) => sum + extractPrice(item) * (item.quantity || 1),
    0
  );

  const taxEstimate = subtotal * 0.08;
  const total = subtotal + taxEstimate;

  return (
    <div className="page cart-page">
      <div className="cart-shell">
        <header className="cart-header">
          <div>
            <p className="section-subtitle">Shopping cart</p>
            <h1>Everything you’ve curated, ready to review.</h1>
            <p className="subtitle">
              Adjust quantities, remove products, and continue to checkout when you’re
              satisfied with the mix.
            </p>
          </div>
          <Link className="ghost-btn" to="/">
            Continue shopping
          </Link>
        </header>

        {isLoading ? (
          <div className="cart-layout">
            <div className="cart-items">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div className="skeleton" key={idx} />
              ))}
            </div>
            <div className="cart-summary skeleton" />
          </div>
        ) : items.length === 0 ? (
          <div className="state-card cart-empty">
            <h3>Your cart is empty</h3>
            <p>Start adding products to see them appear here.</p>
            <Link className="primary-btn" to="/">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Cart Items</h2>
              {items.map((item, idx) => {
                const itemPrice = extractPrice(item);
                const itemQuantity = item.quantity || 1;
                const itemTotal = itemPrice * itemQuantity;
                const itemImage = extractImage(item);
                
                return (
                  <article className="cart-item" key={item.product?._id || item._id || idx}>
                  <div className="cart-item-info">
                      {itemImage ? (
                        <img 
                          src={itemImage} 
                          alt={extractName(item)}
                          className="cart-item-image"
                        />
                      ) : (
                    <div className="cart-avatar">
                      {extractName(item)
                        .split(" ")
                        .map(word => word[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                      )}
                      <div className="cart-item-details">
                      <h3>{extractName(item)}</h3>
                        <p className="cart-item-price-unit">
                          {formatPrice(itemPrice)} each
                      </p>
                      </div>
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-quantity-controls">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(idx, itemQuantity - 1)}
                        >
                          −
                        </button>
                        <span className="quantity-value">{itemQuantity}</span>
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(idx, itemQuantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-total">
                        <strong>{formatPrice(itemTotal)}</strong>
                  </div>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => handleRemoveItem(idx)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                  </div>
                </article>
                );
              })}
            </section>

            <aside className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-content">
              <div className="summary-row">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="summary-row">
                  <span>Tax estimate (8%)</span>
                <strong>{formatPrice(taxEstimate)}</strong>
              </div>
                <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
                </div>
              </div>
              <Link className="primary-btn summary-btn" to="/checkout">
                Proceed to checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
