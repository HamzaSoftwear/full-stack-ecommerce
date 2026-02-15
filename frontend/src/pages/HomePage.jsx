import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../AuthContext";
import { addProductToCart } from "../utils/cart";
import HeroSlider from "../components/HeroSlider";

const HERO_SLIDES = [
  {
    title: "أحدث صيحات الموسم",
    subtitle: "تسوق تشكيلتنا المختارة بعناية مع عروض حصرية وتوصيل سريع لكل مدن المملكة.",
    image:"/banner1.png",
      

    accent: "#f97316"
  },
  {
    title: "إطلالتك تبدأ من هنا",
    subtitle: "أزياء يومية، أحذية مريحة، وتقنيات مبتكرة تمنحك تجربة متكاملة.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    accent: "#2563eb"
  },
  {
    title: "ترقية رقمية لكل زاوية",
    subtitle: "اكتشف أحدث الأجهزة الإلكترونية مع ضمان الجودة وخيارات التقسيط الميسرة.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    accent: "#0ea5e9"
  }
];

const HOME_CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "clothes", label: "الملابس" },
  { id: "shoes", label: "الأحذية" },
  { id: "electronics", label: "الإلكترونيات" }
];

const FEATURE_CARDS = [
  {
    title: "تغطية الشحن",
    icon: "🚚",
    description: "نشحن داخل وخارج السعودية خلال 2-5 أيام عمل مع تتبع مباشر للحالة."
  },
  {
    title: "طرق الدفع",
    icon: "💳",
    description: "بطاقات محلية، مدى، Apple Pay، والدفع عند الاستلام بكل أمان."
  },
  {
    title: "خدمة العملاء",
    icon: "🎧",
    description: "فريق دعم متوفر عبر الهاتف والدردشة لمساعدتك في أي وقت."
  }
];

const TESTIMONIALS = [
  {
    name: "ليان خالد",
    city: "الرياض",
    rating: 5,
    text: "أحببت سرعة الشحن وتغليف المنتجات. تجربة تسوق راقية وسهلة."
  },
  {
    name: "طارق الحربي",
    city: "جدة",
    rating: 4,
    text: "البحث عن المنتجات واضح والتشكيلة متنوعة. خدمة العملاء تجاوبت بسرعة."
  },
  {
    name: "نورة الحسن",
    city: "الخبر",
    rating: 5,
    text: "الأسعار مميزة والجودة ممتازة. بالتأكيد سأكرر الطلب."
  },
  {
    name: "محمد الشهري",
    city: "أبها",
    rating: 4,
    text: "تم توصيل الطلب مبكراً والجهاز مطابق للوصف، شكراً لكم!"
  }
];

function formatCurrency(value) {
  const amount = typeof value === "number" ? value : Number(value) || 0;
  return amount.toLocaleString("ar-SA", {
    style: "currency",
    currency: "SAR"
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState("");
  const [cartFeedback, setCartFeedback] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const storedEmail =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") : "";
  const userEmail = user?.email || storedEmail || "";

  function resolveBackendCategoryValue() {
    if (selectedCategory === "all") return "";
    return selectedCategory;
  }

  useEffect(() => {
    const controller = new AbortController();
    const queryValue = resolveBackendCategoryValue();
    const path = queryValue ? `/products?categories=${encodeURIComponent(queryValue)}` : "/products";

    setIsLoadingProducts(true);

    apiRequest(path, { signal: controller.signal })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setProducts([]);
      })
      .finally(() => setIsLoadingProducts(false));

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    if (!cartFeedback) return;
    const timeout = setTimeout(() => setCartFeedback(""), 2500);
    return () => clearTimeout(timeout);
  }, [cartFeedback]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  const filteredProducts = useMemo(() => products, [products]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate("/");
  }

  function handleAuthAction({ clearCart, destination }) {
    if (typeof window !== "undefined" && clearCart) {
      localStorage.removeItem("cart");
    }
    if (logout) {
      logout();
    }
    setIsDropdownOpen(false);
    navigate(destination);
  }

  function handleAddToCart(product) {
    addProductToCart(product);
    setCartFeedback(`تمت إضافة ${product.name || "المنتج"} إلى السلة`);
  }

  return (
    <div className="page home-page" dir="rtl">
      <div className="home-shell">
        <header className="home-header">
          <div className="home-logo" onClick={() => navigate("/")}>
            <span>Luxora</span>
          </div>

          <form className="home-search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="ابحث عن منتجك القادم"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            <button type="submit">بحث</button>
          </form>

          <button className="home-cart-btn ghost-btn" onClick={() => navigate("/cart")}>
            🛒
            <span>السلة</span>
          </button>

          <div className="home-auth">
            {user ? (
              <div className="home-user-menu" ref={dropdownRef}>
                {user.isAdmin && (
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => navigate("/admin")}
                    style={{ marginInlineEnd: "0.5rem" }}
                  >
                    لوحة التحكم
                  </button>
                )}
                <button
                  type="button"
                  className={`user-pill home-user-trigger ${isDropdownOpen ? "is-open" : ""}`}
                  onClick={() => setIsDropdownOpen(open => !open)}
                >
                  مرحباً، {userEmail || user.id}
                  {user.isAdmin && <span className="badge">Admin</span>}
                </button>
                {isDropdownOpen && (
                  <div className="home-dropdown">
                    <button
                      type="button"
                      onClick={() =>
                        handleAuthAction({ clearCart: true, destination: "/register" })
                      }
                    >
                      تسجيل الخروج
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAuthAction({ clearCart: false, destination: "/login" })
                      }
                    >
                      تبديل الحساب
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="primary-btn" type="button" onClick={() => navigate("/login")}>
                تسجيل الدخول
              </button>
            )}
          </div>
        </header>

        <HeroSlider slides={HERO_SLIDES} />

        <section className="home-products-section">
          <div className="home-category-bar">
            {HOME_CATEGORIES.map(category => (
              <button
                type="button"
                key={category.id}
                className={
                  selectedCategory === category.id
                    ? "home-category-btn is-active"
                    : "home-category-btn"
                }
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          {error && <p className="products-feedback">{error}</p>}

          {isLoadingProducts ? (
            <div className="home-product-grid">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div className="skeleton" key={idx} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="state-card">
              <h3>لا توجد منتجات لهذه الفئة حالياً</h3>
              <p>تابع الفئات الأخرى أو استكشف جميع المنتجات.</p>
            </div>
          ) : (
            <div className="home-product-grid">
              {filteredProducts.slice(0, 8).map(product => (
                <article className="home-product-card" key={product._id}>
                  <div className="home-product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} loading="lazy" />
                    ) : (
                      <div className="image-placeholder">{product.name?.charAt(0) || "?"}</div>
                    )}
                  </div>
                  <div className="home-product-body">
                    <h3>{product.name}</h3>
                    <p className="product-meta">
                      {product.description
                        ? product.description.slice(0, 80)
                        : "منتج مختار بعناية لمظهر عصري."}
                    </p>
                    <strong className="product-price">{formatCurrency(product.price)}</strong>
                  </div>
                  <div className="home-product-actions">
                    <Link className="ghost-btn" to={`/products/${product._id || product.id}`}>
                      عرض التفاصيل
                    </Link>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      أضف للسلة
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="home-section">
          <div className="home-section-header">
            <h2>تجربة متكاملة لكل عميل</h2>
            <p>نمنحك الراحة في الشحن والدفع وخدمة الدعم على مدار الساعة.</p>
          </div>
          <div className="home-features">
            {FEATURE_CARDS.map(card => (
              <article className="home-feature-card" key={card.title}>
                <div className="home-feature-icon" aria-hidden="true">
                  {card.icon}
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-header">
            <h2>آراء عملائنا</h2>
            <p>انطباعات حقيقية من العملاء الذين اختاروا منصتنا.</p>
          </div>
          <div className="home-testimonials">
            {TESTIMONIALS.map(testimonial => (
              <article className="home-testimonial-card" key={testimonial.name}>
                <div className="home-testimonial-top">
                  <div>
                    <strong>{testimonial.name}</strong>
                    <p className="product-meta">{testimonial.city}</p>
                  </div>
                  <span className="home-stars">
                    {"★".repeat(testimonial.rating)}
                    {"☆".repeat(5 - testimonial.rating)}
                  </span>
                </div>
                <p>{testimonial.text}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="home-footer">
          <div>
            <h3>Luxora</h3>
            <p>متجر إلكتروني حديث يقدم منتجات مختارة وتجربة تسوق متكاملة.</p>
          </div>
          <div className="home-footer-links">
            <Link to="/about">من نحن؟</Link>
            <Link to="/privacy">سياسة الخصوصية</Link>
            <Link to="/terms">الشروط والأحكام</Link>
          </div>
          <div className="home-footer-social">
            <a href="linkedin.com/in/hamza-naeem911083288
            "target="_blank" rel="noreferrer">
            LinkedIn
            </a>
            <a href="https://github.com/HamzaSoftwear" target="_blank" rel="noreferrer">
            GitHub
            </a>
            <a href="https://x.com/7amza66s" target="_blank" rel="noreferrer">
              X
            </a>
          </div>
        </footer>
      </div>

      {cartFeedback && <div className="home-toast">{cartFeedback}</div>}
    </div>
  );
}
