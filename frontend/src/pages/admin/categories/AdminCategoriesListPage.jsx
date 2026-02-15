import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../../api";
import AdminBackButton from "../../../components/AdminBackButton";

export default function AdminCategoriesListPage() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    apiRequest("/categories", { signal: controller.signal })
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [refreshFlag]);

  async function handleDelete(categoryId) {
    const shouldDelete = window.confirm("Delete this category? This will affect linked products.");
    if (!shouldDelete) return;

    try {
      setError("");
      await apiRequest(`/categories/${categoryId}`, { method: "DELETE" });
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
            <p className="section-subtitle">Admin / Categories</p>
            <h1>Group products with intention.</h1>
            <p className="subtitle">
              Keep your catalog structured with curated categories and visuals.
            </p>
          </div>
          <div className="products-actions">
            <AdminBackButton />
            <Link className="pill-link" to="/admin/categories/new">
              Add new category
            </Link>
          </div>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        {isLoading ? (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div className="skeleton" key={idx} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="state-card">
            <h3>No categories found</h3>
            <p>Create categories to simplify browsing for your customers.</p>
          </div>
        ) : (
          <div className="product-grid">
            {categories.map(category => {
              const id = category._id || category.id || category.name;
              return (
                <article className="product-card" key={id}>
                  <p className="section-subtitle">Category</p>
                  <strong>{category.name}</strong>
                  {category.image && (
                    <p className="product-meta">
                      Image: <span>{category.image}</span>
                    </p>
                  )}
                  <p className="product-meta">ID: {id}</p>
                  <div className="products-actions">
                    <Link className="ghost-btn" to={`/admin/categories/edit/${id}`}>
                      Edit
                    </Link>
                    <button className="ghost-btn" type="button" onClick={() => handleDelete(id)}>
                      Delete
                    </button>
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
