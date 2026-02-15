import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import { addProductToCart } from "../utils/cart";

function formatCurrency(value) {
  const amount = typeof value === "number" ? value : Number(value) || 0;
  return amount.toLocaleString("ar-SA", {
    style: "currency",
    currency: "SAR"
  });
}

function resolveCategoryId(category) {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category._id || category.id || category.slug || category.name || "";
}

function getProductId(product) {
  return product?._id || product?.id || product?.productId || "";
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [showAllImages, setShowAllImages] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [relatedError, setRelatedError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError("");

    apiRequest(`/products/${id}`, { signal: controller.signal })
      .then(data => {
        setProduct(data);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [id]);

  const mainImage = useMemo(() => {
    if (!product) return "";
    return product.image || "";
  }, [product]);

  const additionalImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(img => img !== mainImage && img.trim());
    }
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery.filter(img => img !== mainImage && img.trim());
    }
    return [];
  }, [product, mainImage]);

  const allImages = useMemo(() => {
    const images = [];
    if (mainImage) images.push(mainImage);
    images.push(...additionalImages);
    return images;
  }, [mainImage, additionalImages]);

  useEffect(() => {
    if (mainImage) {
      setSelectedImage(mainImage);
    } else if (allImages.length > 0) {
      setSelectedImage(allImages[0]);
    } else {
      setSelectedImage("");
    }
  }, [mainImage, allImages]);

  useEffect(() => {
    if (!product) return;

    const controller = new AbortController();
    setIsLoadingRelated(true);
    setRelatedError("");

    const currentProductId = getProductId(product);
    const limit = 4; // Request exactly 4 products

    apiRequest(`/products/latest?limit=${limit}${currentProductId ? `&exclude=${currentProductId}` : ''}`, { 
      signal: controller.signal 
    })
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        // Backend already excludes the current product, but double-check as safety measure
        const filtered = list.filter(
          recommendation => getProductId(recommendation) !== currentProductId
        );
        setRecommendations(filtered);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setRelatedError(err.message);
      })
      .finally(() => setIsLoadingRelated(false));

    return () => controller.abort();
  }, [product]);

  useEffect(() => {
    if (!cartMessage) return;
    const timeout = setTimeout(() => setCartMessage(""), 2500);
    return () => clearTimeout(timeout);
  }, [cartMessage]);

  function handleAddToCart() {
    if (!product) return;
    addProductToCart(product);
    setCartMessage(`تمت إضافة ${product.name || "المنتج"} إلى السلة`);
  }

  const pageContent = (() => {
    if (isLoading) {
      return (
        <div className="product-details-grid">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div className="skeleton product-skeleton" key={idx} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-card">
          <h3>تعذر تحميل المنتج</h3>
          <p>{error}</p>
          <Link className="primary-btn" to="/">
            العودة للرئيسية
          </Link>
        </div>
      );
    }

    if (!product) {
      return (
        <div className="state-card">
          <h3>المنتج غير متاح</h3>
          <p>يرجى اختيار منتج مختلف من المتجر.</p>
          <Link className="primary-btn" to="/">
            الصفحة الرئيسية
          </Link>
        </div>
      );
    }

    const categoryLabel =
      typeof product.category === "string"
        ? product.category
        : product.category?.name;

    return (
      <>
        <div className="product-details-grid">
          <div className="product-gallery">
            <div className="product-main-image">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} loading="lazy" />
              ) : (
                <div className="image-placeholder">{product.name?.charAt(0) || "?"}</div>
              )}
            </div>

            {allImages.length > 1 && (
              <>
                {!showAllImages ? (
                  <div className="product-image-actions">
                    <button
                      type="button"
                      className="primary-btn view-more-images-btn"
                      onClick={() => setShowAllImages(true)}
                    >
                      عرض المزيد من الصور ({additionalImages.length})
                    </button>
                  </div>
                ) : (
                  <div className="product-thumbnails">
                    {allImages.map((src, idx) => (
                      <button
                        type="button"
                        key={`${src}-${idx}`}
                        className={`product-thumb ${src === selectedImage ? "is-active" : ""}`}
                        onClick={() => setSelectedImage(src)}
                      >
                        <img src={src} alt={`${product.name} ${idx + 1}`} loading="lazy" />
                      </button>
                    ))}
                    {additionalImages.length > 0 && (
                      <button
                        type="button"
                        className="product-thumb-collapse"
                        onClick={() => {
                          setShowAllImages(false);
                          setSelectedImage(mainImage);
                        }}
                        title="إخفاء الصور الإضافية"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <section className="product-info-card">
            <p className="section-subtitle">تفاصيل المنتج</p>
            <h1>{product.name}</h1>
            <p className="product-price-lg">{formatCurrency(product.price)}</p>
            <p className="product-description">
              {product.description || "منتج مختار بعناية ليمنحك تجربة مميزة."}
            </p>
            <div className="product-meta-grid">
              {categoryLabel && (
                <div>
                  <p className="product-meta">الفئة</p>
                  <strong>{categoryLabel}</strong>
                </div>
              )}
              {product.stock != null && (
                <div>
                  <p className="product-meta">المتوفر</p>
                  <strong>{product.stock}</strong>
                </div>
              )}
            </div>
            <button className="primary-btn" type="button" onClick={handleAddToCart}>
              أضف للسلة
            </button>
          </section>
        </div>

        <section className="home-section product-related-section">
          <div className="home-section-header">
            <h2>منتجات قد تعجبك</h2>
            <p>أحدث المنتجات المضافة للمتجر.</p>
          </div>

          {relatedError && <p className="products-feedback">{relatedError}</p>}

          {isLoadingRelated ? (
            <div className="home-product-grid">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div className="skeleton" key={idx} />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="state-card">
              <h3>لا توجد اقتراحات حالياً</h3>
              <p>استمر في التصفح وستظهر منتجات مشابهة هنا.</p>
            </div>
          ) : (
            <div className="home-product-grid related-grid">
              {recommendations.map(item => (
                <article className="home-product-card" key={getProductId(item)}>
                  <div className="home-product-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="image-placeholder">{item.name?.charAt(0) || "?"}</div>
                    )}
                  </div>
                  <div className="home-product-body">
                    <h3>{item.name}</h3>
                    <strong className="product-price">{formatCurrency(item.price)}</strong>
                  </div>
                  <div className="home-product-actions">
                    <Link className="ghost-btn" to={`/products/${getProductId(item)}`}>
                      عرض التفاصيل
                    </Link>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        addProductToCart(item);
                        setCartMessage(`تمت إضافة ${item.name || "المنتج"} إلى السلة`);
                      }}
                    >
                      أضف للسلة
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </>
    );
  })();

  return (
    <div className="page product-details-page" dir="rtl">
      <div className="product-details-shell">{pageContent}</div>
      {cartMessage && <div className="home-toast">{cartMessage}</div>}
    </div>
  );
}
