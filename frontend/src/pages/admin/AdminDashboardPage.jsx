import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api";
import AdminBackButton from "../../components/AdminBackButton";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    categories: 0,
    users: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      setIsLoading(true);
      setError("");
      try {
        const [productsData, ordersData, categoriesData, usersData] = await Promise.all([
          // Use the same source as the manage products list to keep counts consistent
          apiRequest("/products", { signal: controller.signal }),
          apiRequest("/orders/count", { signal: controller.signal }),
          apiRequest("/categories", { signal: controller.signal }),
          apiRequest("/users/count", { signal: controller.signal }).catch(() => null)
        ]);

        setStats({
          products: Array.isArray(productsData) ? productsData.length : productsData?.count ?? 0,
          orders: ordersData?.count ?? 0,
          categories: Array.isArray(categoriesData)
            ? categoriesData.length
            : categoriesData?.count ?? 0,
          users:
            typeof usersData?.count === "number"
              ? usersData.count
              : Array.isArray(usersData)
                ? usersData.length
                : null
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
    return () => controller.abort();
  }, []);

  const statCards = useMemo(() => {
    const baseCards = [
      {
        label: "Products",
        value: stats.products,
        description: "Active listings currently available in the storefront."
      },
      {
        label: "Orders",
        value: stats.orders,
        description: "Total orders placed across every channel."
      },
      {
        label: "Categories",
        value: stats.categories,
        description: "Collections used to organize your catalog."
      }
    ];

    if (typeof stats.users === "number") {
      baseCards.push({
        label: "Customers",
        value: stats.users,
        description: "Registered shoppers engaging with your store."
      });
    }

    return baseCards;
  }, [stats]);

  return (
    <div className="page products-page">
      <div className="products-shell">
        <header className="products-header">
          <div>
            <p className="section-subtitle">Admin overview</p>
            <h1>Command the storefront with clarity.</h1>
            <p className="subtitle">
              Track performance at a glance and jump directly into the tools you need most.
            </p>
          </div>
          <div className="products-actions">
            <AdminBackButton />
            <Link className="pill-link" to="/admin/products">
              Manage products
            </Link>
            <Link className="ghost-btn" to="/admin/categories">
              Manage categories
            </Link>
            <Link className="ghost-link" to="/admin/orders">
              Manage orders
            </Link>
          </div>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        <div className="product-grid">
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => <div className="skeleton" key={idx} />)
            : statCards.map(card => (
                <article className="product-card" key={card.label}>
                  <p className="section-subtitle">{card.label}</p>
                  <strong style={{ fontSize: "2.5rem" }}>{card.value}</strong>
                  <p className="product-meta">{card.description}</p>
                </article>
              ))}
        </div>
      </div>
    </div>
  );
}
