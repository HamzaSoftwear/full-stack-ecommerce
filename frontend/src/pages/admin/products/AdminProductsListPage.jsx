import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../../api";
import AdminBackButton from "../../../components/AdminBackButton";

function formatCurrency(value) {
  const amount = typeof value === "number" ? value : Number(value) || 0;
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export default function AdminProductsListPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    apiRequest("/products", { signal: controller.signal })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [refreshFlag]);

  async function handleDelete(productId) {
    const shouldDelete = window.confirm("Delete this product? This action cannot be undone.");
    if (!shouldDelete) return;

    try {
      setError("");
      await apiRequest(`/products/${productId}`, { method: "DELETE" });
      setRefreshFlag(flag => !flag);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page products-page">
      <div className="products-shell">
        <header className="products-header">
          <div>
            <p className="section-subtitle">Admin / Products</p>
            <h1>Oversee every product in one curated board.</h1>
            <p className="subtitle">Update listings, adjust inventory, and produce new drops.</p>
          </div>
          <div className="products-actions">
            <AdminBackButton />
            <Link className="pill-link" to="/admin/products/new">
              Add new product
            </Link>
          </div>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        {isLoading ? (
          <div className="order-grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div className="skeleton" key={idx} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="state-card">
            <h3>No products found</h3>
            <p>Add your first product to start populating the storefront.</p>
          </div>
        ) : (
          <div className="order-grid">
            {products.map(product => (
              <article className="order-card" key={product._id}>
                <div className="order-card-header">
                  <div>
                    <p className="order-meta">ID: {product._id}</p>
                    <h3>{product.name}</h3>
                  </div>
                  <span className="order-status">{product.stock ?? 0} in stock</span>
                </div>

                <p className="order-meta">{product.description || "No description provided."}</p>

                <div className="order-card-footer">
                  <div>
                    <p className="order-meta">Price</p>
                    <strong>{formatCurrency(product.price)}</strong>
                  </div>
                  <div className="products-actions">
                    <Link className="ghost-btn" to={`/admin/products/edit/${product._id}`}>
                      Edit
                    </Link>
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
