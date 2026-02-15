import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, uploadImage } from "../../../api";
import AdminBackButton from "../../../components/AdminBackButton";

const initialFormState = {
  name: "",
  description: "",
  price: "",
  image: "",
  images: [],
  category: "",
  stock: ""
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingProduct, setIsFetchingProduct] = useState(isEditing);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingCategories(true);

    console.log('📋 Fetching categories from API...');
    apiRequest("/categories", { signal: controller.signal })
      .then(data => {
        console.log('✅ Categories received:', data);
        const categoriesArray = Array.isArray(data) ? data : [];
        console.log(`✅ Loaded ${categoriesArray.length} categories`);
        setCategories(categoriesArray);
        setError("");
        
        if (categoriesArray.length === 0) {
          console.warn('⚠️ No categories found in database');
        }
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        console.error('❌ Error fetching categories:', err);
        setError(`Failed to load categories: ${err.message}`);
      })
      .finally(() => setIsLoadingCategories(false));

    return () => controller.abort();
  }, []);

  function mapCategoryToId(value) {
    if (!value) return "";
    
    // If it's an object with _id or id, return the ID
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    
    // If it's a string, check if it's already an ID or find by name/ID
    const category = categories.find(cat => 
      cat._id === value || cat.id === value || cat.name === value
    );
    
    // Return the category ID if found, otherwise return the value (assuming it's an ID)
    return category ? (category._id || category.id) : value;
  }

  useEffect(() => {
    if (!isEditing) {
      setIsFetchingProduct(false);
      return;
    }

    const controller = new AbortController();
    setIsFetchingProduct(true);

    apiRequest(`/products/${id}`, { signal: controller.signal })
      .then(product => {
        // Extract category ID from product.category (could be object or ID string)
        let categoryId = "";
        if (product?.category) {
          if (typeof product.category === "object") {
            categoryId = product.category._id || product.category.id || "";
          } else {
            categoryId = product.category;
          }
        }
        
        setForm({
          name: product?.name || "",
          description: product?.description || "",
          price: product?.price != null ? String(product.price) : "",
          image: product?.image || "",
          images: Array.isArray(product?.images) ? product.images : [],
          category: categoryId,
          stock: product?.stock != null ? String(product.stock) : ""
        });
        setError("");
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setIsFetchingProduct(false));

    return () => controller.abort();
  }, [id, isEditing]);

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.name.trim() ||
      !form.price.toString().trim() ||
      !form.category.trim() ||
      !form.stock.toString().trim() ||
      isSubmitting
    );
  }, [form, isSubmitting]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleAddImage() {
    if (!newImageUrl.trim()) return;
    setForm(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl("");
  }

  function handleRemoveImage(index) {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }

  function handleSetMainImage(imageUrl) {
    setForm(prev => {
      const allImages = [prev.image, ...prev.images].filter(Boolean);
      const newMain = imageUrl;
      const newAdditional = allImages.filter(img => img !== newMain);
      
      return {
        ...prev,
        image: newMain,
        images: newAdditional
      };
    });
  }

  async function handleFileUpload(files, isMain = false) {
    const fileArray = Array.from(files);
    setUploadingImages(true);
    setError("");

    try {
      const uploadPromises = fileArray.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      setForm(prev => {
        if (isMain && uploadedUrls.length > 0) {
          // If uploading main image, set first as main and move current main to additional
          const currentMain = prev.image;
          return {
            ...prev,
            image: uploadedUrls[0],
            images: currentMain ? [currentMain, ...prev.images, ...uploadedUrls.slice(1)] : [...prev.images, ...uploadedUrls.slice(1)]
          };
        } else {
          // Add to additional images
          return {
            ...prev,
            images: [...prev.images, ...uploadedUrls]
          };
        }
      });
    } catch (err) {
      setError(err.message || "Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e, isMain = false) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files, isMain);
    }
  }

  function handleFileInputChange(e, isMain = false) {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files, isMain);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Ensure we're sending the category ID, not the name
    const categoryId = mapCategoryToId(form.category);
    
    if (!categoryId) {
      setError("Please select a valid category");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      image: form.image.trim(),
      images: form.images.filter(url => url.trim()),
      category: categoryId, // Send the category ID (ObjectId)
      stock: Number(form.stock) || 0
    };

    try {
      console.log('📤 Sending product data:', payload);
      
      if (isEditing) {
        await apiRequest(`/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        const response = await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        console.log('✅ Product created:', response);
      }

      navigate("/admin/products");
    } catch (err) {
      console.error('❌ Error creating/updating product:', err);
      // Show more detailed error message
      const errorMessage = err.message || err.details || 'Failed to save product';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page products-page">
      <div className="products-shell">
        <header className="products-header">
          <div>
            <p className="section-subtitle">Admin / Products</p>
            <h1>{isEditing ? "Edit product" : "Create product"}</h1>
            <p className="subtitle">
              {isEditing
                ? "Fine-tune the listing, pricing, and category in seconds."
                : "Launch a fresh product card with imagery, pricing, and inventory."}
            </p>
          </div>
          <div className="products-actions">
            <AdminBackButton />
            <Link className="ghost-link" to="/admin/products">
              Back to products
            </Link>
          </div>
        </header>

        {error && <p className="products-feedback">{error}</p>}

        <section className="checkout-card">
          {isFetchingProduct ? (
            <div className="state-card">
              <h3>Loading product details...</h3>
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
                  placeholder="Product name"
                  required
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  name="description"
                  className="input-field"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description"
                  rows={3}
                />
              </label>

              <label>
                <span>Price (USD)</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </label>

              <div>
                <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Main Image</span>
                <div
                  className={`image-upload-zone ${dragActive ? "drag-active" : ""} ${form.image ? "has-image" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, true)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileInputChange(e, true)}
                    multiple={false}
                  />
                  {form.image ? (
                    <div className="image-preview-container">
                      <img src={form.image} alt="Main product" className="image-preview-main" />
                      <div className="image-preview-overlay">
                        <button
                          type="button"
                          className="image-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          Change
                        </button>
                        <span className="main-image-badge">Main Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p>Drop image here or click to upload</p>
                      <span className="upload-hint">Main product image</span>
                    </div>
                  )}
                  {uploadingImages && <div className="upload-spinner">Uploading...</div>}
                </div>
              </div>

              <div>
                <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Additional Images</span>
                <div
                  className={`image-upload-zone additional-images ${dragActive ? "drag-active" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, false)}
                  onClick={() => additionalFileInputRef.current?.click()}
                >
                  <input
                    ref={additionalFileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileInputChange(e, false)}
                    multiple={true}
                  />
                  <div className="image-upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>Drop images here or click to upload</p>
                    <span className="upload-hint">Multiple images allowed</span>
                  </div>
                  {uploadingImages && <div className="upload-spinner">Uploading...</div>}
                </div>

                {form.images.length > 0 && (
                  <div className="additional-images-grid">
                    {form.images.map((imgUrl, idx) => (
                      <div key={idx} className="image-thumbnail-wrapper">
                        <img
                          src={imgUrl}
                          alt={`Additional ${idx + 1}`}
                          className="image-thumbnail"
                        />
                        <div className="image-thumbnail-overlay">
                          <button
                            type="button"
                            className="image-action-btn small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetMainImage(imgUrl);
                            }}
                            title="Set as main image"
                          >
                            Set Main
                          </button>
                          <button
                            type="button"
                            className="image-action-btn small remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            title="Remove image"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label>
                <span>Category</span>
                <select
                  name="category"
                  className="input-field"
                  value={form.category}
                  onChange={handleChange}
                  required
                  disabled={isLoadingCategories}
                >
                  <option value="">{isLoadingCategories ? "Loading categories..." : "Select a category"}</option>
                  {categories.map(cat => {
                    const categoryId = cat._id || cat.id;
                    return (
                      <option key={categoryId} value={categoryId}>
                        {cat.name}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label>
                <span>Stock</span>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Quantity available"
                  required
                />
              </label>

              <button className="primary-btn" disabled={isSubmitDisabled}>
                {isSubmitting ? "Saving..." : isEditing ? "Update product" : "Create product"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
