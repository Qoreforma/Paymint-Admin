import React, { useEffect } from "react";
import NoIcon from "../../../../../images/no-image-icon.png";
import { formatter } from "../../../../../utils/Utils";
import { useToggleProductFallbackAvailability } from "../../../../../api/product/products";
import "./product-view-modal.css";

const ProductViewModal = ({
  isOpen,
  toggle,
  product,
  onEdit,
  onConfigureFallback,
  onAddToFallback,
  isInFallbackChain = false,
}) => {
  const toggleFallback = useToggleProductFallbackAvailability(
    product?._id || product?.id
  );

  const [isFallbackAvailable, setIsFallbackAvailable] = useState(
    product?.isFallbackAvailable !== false
  );

  useEffect(() => {
    if (product) {
      setIsFallbackAvailable(product.isFallbackAvailable !== false);
    }
  }, [product]);

  const handleToggleFallback = (e) => {
    const nextVal = e.target.checked;
    setIsFallbackAvailable(nextVal);
    toggleFallback.mutate(nextVal, {
      onError: () => {
        setIsFallbackAvailable(!nextVal);
      },
    });
  };

  // Lock body scroll while open and restore cleanly on unmount / close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.removeProperty("overflow");
    }
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle]);

  if (!isOpen || !product) return null;

  const service = product.serviceId;
  const serviceType = service?.serviceTypeId || product.serviceType;
  const provider = product.providerId;

  const sellingPrice = Number(product.amount || 0);
  const costPrice = Number(product.providerAmount || 0);
  const margin = sellingPrice - costPrice;

  const serviceName = service?.name || (typeof service === "string" ? service : "");
  const serviceTypeName = serviceType?.name || serviceType?.code || "";
  const providerName = provider?.name || provider?.code || (typeof provider === "string" ? provider : "");

  const validityDisplay =
    product.validity ||
    product.attributes?.validityPeriod ||
    product.attributes?.validity ||
    "";

  const dataSizeDisplay =
    product.dataSizeDisplay ||
    (product.dataSize ? `${product.dataSize}MB` : "");

  const dataTypeDisplay =
    product.attributes?.dataType ||
    product.productType ||
    "";

  const categoryDisplay =
    product.category ||
    product.attributes?.category ||
    "";

  const fallbackCount = Array.isArray(product.fallbackProducts)
    ? product.fallbackProducts.length
    : 0;

  return (
    <div className="pvm-overlay" onClick={toggle}>
      <div className="pvm-card" onClick={(e) => e.stopPropagation()}>
        {/* Pinned Header */}
        <div className="pvm-header">
          <div className="pvm-header-left">
            <img
              src={product.logo || service?.logo || NoIcon}
              alt={product.name}
              className="pvm-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = NoIcon;
              }}
            />
            <div className="pvm-title-wrap">
              <h5 className="pvm-title">{product.name}</h5>
              <div className="pvm-subtitle">
                <span>Code:</span>
                <span className="pvm-code-badge">{product.code || "N/A"}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="pvm-close-btn"
            onClick={toggle}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="pvm-body">
          {/* Status & Identity Badges */}
          <div className="pvm-badges-row">
            <span
              className={`pvm-badge ${
                product.isActive ? "pvm-badge-active" : "pvm-badge-inactive"
              }`}
            >
              {product.isActive ? "● Active" : "○ Inactive"}
            </span>

            {product.isHot && (
              <span className="pvm-badge pvm-badge-hot">🔥 Hot Product</span>
            )}

            {serviceName && (
              <span className="pvm-badge pvm-badge-service">
                Service: {serviceName}
              </span>
            )}

            {serviceTypeName && (
              <span className="pvm-badge pvm-badge-type">
                {serviceTypeName}
              </span>
            )}

            {providerName && (
              <span className="pvm-badge pvm-badge-provider">
                Provider: {providerName}
              </span>
            )}

            <span
              className="pvm-badge"
              style={{
                backgroundColor: isFallbackAvailable ? "#f0fdf4" : "#fef2f2",
                color: isFallbackAvailable ? "#166534" : "#991b1b",
                border: `1px solid ${isFallbackAvailable ? "#bbf7d0" : "#fecaca"}`,
                fontWeight: 600,
              }}
            >
              {isFallbackAvailable ? "🔄 Fallback: Eligible" : "🚫 Fallback: Disabled"}
            </span>
          </div>

          {/* Pricing & Financials Grid */}
          <div className="pvm-financials-grid">
            <div className="pvm-fin-card">
              <span className="pvm-fin-label">Customer Price (SA)</span>
              <span className="pvm-fin-value">
                {formatter("NGN").format(sellingPrice)}
              </span>
            </div>

            <div className="pvm-fin-card">
              <span className="pvm-fin-label">Provider Cost</span>
              <span className="pvm-fin-value">
                {formatter("NGN").format(costPrice)}
              </span>
            </div>

            <div
              className={`pvm-fin-card ${
                margin >= 0 ? "pvm-fin-profit" : "pvm-fin-loss"
              }`}
            >
              <span className="pvm-fin-label">
                {margin < 0 ? "Discount (Below Cost)" : "Profit Margin"}
              </span>
              <span className="pvm-fin-value">
                {margin >= 0 ? "+" : ""}
                {formatter("NGN").format(margin)}
              </span>
            </div>
          </div>

          {/* Product Attributes Section */}
          <div>
            <h6 className="pvm-section-title">Product Attributes</h6>
            <div className="pvm-attrs-grid">
              {dataSizeDisplay && (
                <div className="pvm-attr-item">
                  <span className="pvm-attr-label">Data Size</span>
                  <span className="pvm-attr-value">{dataSizeDisplay}</span>
                </div>
              )}

              {validityDisplay && (
                <div className="pvm-attr-item">
                  <span className="pvm-attr-label">Validity Duration</span>
                  <span className="pvm-attr-value">{validityDisplay}</span>
                </div>
              )}

              {dataTypeDisplay && (
                <div className="pvm-attr-item">
                  <span className="pvm-attr-label">Data Type</span>
                  <span className="pvm-attr-value">{dataTypeDisplay}</span>
                </div>
              )}

              {categoryDisplay && (
                <div className="pvm-attr-item">
                  <span className="pvm-attr-label">Data Category</span>
                  <span
                    className="pvm-attr-value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {categoryDisplay}
                  </span>
                </div>
              )}

              {product.productType && (
                <div className="pvm-attr-item">
                  <span className="pvm-attr-label">Product Type</span>
                  <span className="pvm-attr-value">{product.productType}</span>
                </div>
              )}

              {product.description && (
                <div className="pvm-attr-item pvm-desc-item">
                  <span className="pvm-attr-label">Description</span>
                  <span className="pvm-attr-value" style={{ fontWeight: 400 }}>
                    {product.description}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Provider Fallback Chain Banner (Zero Overlap Guaranteed) */}
          <div className="pvm-fallback-banner">
            <div className="pvm-fb-top">
              <div className="pvm-fb-info">
                <span className="pvm-fb-title">
                  🔄 Provider Fallback Chain
                </span>
                <span className="pvm-fb-desc">
                  {fallbackCount > 0
                    ? `${fallbackCount} backup provider(s) configured in chain`
                    : "No backup fallback configured"}
                  {product.isFallbackAvailable === false
                    ? " • (Disabled as backup candidate)"
                    : ""}
                </span>
              </div>

              {onConfigureFallback && (
                <button
                  type="button"
                  className="pvm-fb-btn"
                  onClick={() => {
                    toggle();
                    onConfigureFallback(product);
                  }}
                  title="Configure provider fallback chain"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8"></polyline>
                    <line x1="4" y1="20" x2="21" y2="3"></line>
                    <polyline points="21 16 21 21 16 21"></polyline>
                    <line x1="15" y1="15" x2="21" y2="21"></line>
                    <line x1="4" y1="4" x2="9" y2="9"></line>
                  </svg>
                  <span>Configure Fallbacks</span>
                </button>
              )}

              {onAddToFallback && !isInFallbackChain && (
                <button
                  type="button"
                  className="pvm-fb-btn"
                  style={{
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    borderColor: "#059669",
                  }}
                  onClick={() => onAddToFallback(product)}
                >
                  + Add as Fallback
                </button>
              )}

              {isInFallbackChain && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    border: "1px solid #a7f3d0",
                  }}
                >
                  ✓ In Active Chain
                </span>
              )}
            </div>

            {/* Quick Toggle: Fallback Eligibility */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginTop: "12px",
              }}
            >
              <div style={{ flex: 1, paddingRight: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "2px" }}>
                  Eligible as Fallback for Other Products
                </span>
                <span style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.3, display: "block" }}>
                  {isFallbackAvailable
                    ? "Enabled: Other products can use this product as an automatic backup."
                    : "Disabled: Other products will skip this product in their fallback cascades."}
                </span>
              </div>
              <div className="custom-control custom-switch flex-shrink-0" style={{ margin: 0, paddingLeft: "2.75rem" }}>
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={`pvm-toggle-fallback-${product._id || product.id}`}
                  checked={isFallbackAvailable}
                  disabled={toggleFallback.isLoading}
                  onChange={handleToggleFallback}
                />
                <label
                  className="custom-control-label"
                  htmlFor={`pvm-toggle-fallback-${product._id || product.id}`}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>

            {fallbackCount > 0 && Array.isArray(product.fallbackProducts) && (
              <div className="pvm-fb-chain-chips">
                {product.fallbackProducts.map((fb, idx) => {
                  const p = fb.productId;
                  const name = p?.name || "Product";
                  const pName = p?.providerId?.name || p?.providerId?.code || "Provider";
                  return (
                    <div key={p?._id || idx} className="pvm-fb-chip">
                      <span className="pvm-fb-chip-priority">#{fb.priority || idx + 1}</span>
                      <span>{pName}</span>
                      <span style={{ color: "#94a3b8" }}>({name})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="pvm-footer">
          <button
            type="button"
            className="pvm-btn-close"
            onClick={toggle}
          >
            Close
          </button>

          {onAddToFallback && !isInFallbackChain && (
            <button
              type="button"
              className="pvm-btn-add"
              onClick={() => onAddToFallback(product)}
            >
              + Add as Fallback
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              className="pvm-btn-edit"
              onClick={() => {
                toggle();
                onEdit(product);
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span>Edit Product</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
