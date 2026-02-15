import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../../api";
import AdminBackButton from "../../../components/AdminBackButton";

const initialFormState = {
  name: "",
  image: ""
};

export default function AdminCategoryFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    apiRequest(`/categories/${id}`, { signal: controller.signal })
      .then(category => {
        setForm({
          name: category?.name || "",
          image: category?.image || ""
        });
        setError("");
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [id, isEditing]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = {
      name: form.name.trim(),
      image: form.image.trim()
    };

    try {
      if (isEditing) {
        await apiRequest(`/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest("/categories", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      navigate("/admin/categories");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page products-page">
      <div className="products-shell">
        <header className="products-header">
          <div>
            <p className="section-subtitle">Admin / Categories</p>
            <h1>{isEditing ? "Edit category" : "Create category"}</h1>
            <p className="subtitle">
              {isEditing
                ? "Refresh this category name or artwork for a sharper taxonomy."
                : "Define a new collection your customers can explore."}
            </p>
          </div>
          <div className="products-actions">
            <AdminBackButton />
            <Link className="ghost-link" to="/admin/categories">
              Back to categories
            </Link>
          </div>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        <section className="checkout-card">
          {isLoading ? (
            <div className="state-card">
              <h3>Loading category...</h3>
            </div>
          ) : (
            <form className="checkout-form" onSubmit={handleSubmit}>
              <label>
                <span>Name</span>
                <input
                  name="name"
                  type="text"
                  className="input-field"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Summer Essentials"
                  required
                />
              </label>

              <label>
                <span>Image URL</span>
                <input
                  name="image"
                  type="url"
                  className="input-field"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.jpg"
                />
              </label>

              <button className="primary-btn" disabled={isSubmitting || !form.name.trim()}>
                {isSubmitting ? "Saving..." : isEditing ? "Update category" : "Create category"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
