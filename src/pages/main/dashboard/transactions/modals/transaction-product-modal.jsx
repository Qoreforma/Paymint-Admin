import React, { useEffect, useState } from "react";
import {
  useGetProductInfo,
  useGetAllProducts,
  useUpdateProduct,
} from "../../../../../api/product/products";
import { formatter } from "../../../../../utils/Utils";
import "../transaction-product-modal.css";

const DATA_TYPES = [
  "SME",
  "SME2",
  "GIFTING",
  "DIRECT",
  "AWOOF DATA",
  "CORPORATE GIFTING",
  "DIRECT COUPON",
  "SOCIAL",
  "NIGHT",
  "WEEKEND",
  "BROADBAND",
  "ALWAYSON",
  "SPECIAL",
];

const DATA_CATEGORIES = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "night",
  "social",
  "broadband",
  "alwayson",
  "weekend",
  "other",
];

const VALIDITY_OPTIONS = [
  "1 Day",
  "2 Days",
  "3 Days",
  "7 Days",
  "14 Days",
  "30 Days",
  "60 Days",
  "90 Days",
  "365 Days",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
];

const TransactionProductModal = ({ isOpen, toggle, productRef }) => {
  if (!isOpen || !productRef) return null;

  const rawProductId = productRef.productId;
  const productNameHint = productRef.productName || "";

  // 1. Fetch by direct product ID if available
  const { data: directProductData, isLoading: loadingDirect } =
    useGetProductInfo(rawProductId);

  // 2. Fallback search by product name if ID is missing or invalid
  const shouldSearchByName = !rawProductId && !!productNameHint;
  const { data: searchProductData, isLoading: loadingSearch } =
    useGetAllProducts(1, 10, { search: productNameHint }, {
      enabled: shouldSearchByName,
    });

  // Resolve resolved product
  const product =
    directProductData?.data ||
    directProductData ||
    (searchProductData?.data && searchProductData.data.length > 0
      ? searchProductData.data[0]
      : null);

  const resolvedId = product?._id || product?.id || rawProductId;
  const isLoading = rawProductId ? loadingDirect : loadingSearch;

  const { mutate: updateProduct, isLoading: isSaving } =
    useUpdateProduct(resolvedId);

  // Active view tab: 'overview' | 'edit'
  const [activeTab, setActiveTab] = useState("overview");

  // Edit form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    amount: "",
    providerAmount: "",
    description: "",
    dataSizeDisplay: "",
    dataType: "",
    category: "",
    validity: "",
    isActive: true,
    isHot: false,
    allowBelowCost: false,
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        code: product.code || "",
        amount: product.amount !== undefined ? product.amount : "",
        providerAmount:
          product.providerAmount !== undefined ? product.providerAmount : "",
        description: product.description || "",
        dataSizeDisplay: product.dataSizeDisplay || "",
        dataType: product.attributes?.dataType || product.productType || "",
        category: product.category || product.attributes?.category || "",
        validity: product.validity || "",
        isActive: product.isActive !== false,
        isHot: !!product.isHot,
        allowBelowCost: !!product.allowBelowCost,
      });
    }
  }, [product]);

  // Clean unmount (prevent scroll trap)
  useEffect(() => {
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Calculations
  const sellingPrice = Number(formData.amount || product?.amount || 0);
  const costPrice = Number(formData.providerAmount || product?.providerAmount || 0);
  const margin = sellingPrice - costPrice;
  const isLoss = costPrice > 0 && sellingPrice < costPrice;

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!resolvedId) return;

    if (isLoss && !formData.allowBelowCost) {
      alert(
        "Selling price is below provider cost. Please enable 'Allow Selling Below Cost' if this is an intentional wholesale discount."
      );
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      amount: Number(formData.amount),
      providerAmount: Number(formData.providerAmount),
      description: formData.description,
      dataSizeDisplay: formData.dataSizeDisplay,
      dataType: formData.dataType,
      category: formData.category,
      validity: formData.validity,
      isActive: formData.isActive,
      isHot: formData.isHot,
      allowBelowCost: formData.allowBelowCost,
    };

    updateProduct(payload, {
      onSuccess: () => {
        setActiveTab("overview");
      },
    });
  };

  const service = product?.serviceId;
  const provider = product?.providerId;

  return (
    <div className="tpm-overlay" onClick={toggle}>
      <div className="tpm-card" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="tpm-header">
          <div className="tpm-header-left">
            <div className="tpm-header-icon">📦</div>
            <div style={{ minWidth: 0 }}>
              <h4 className="tpm-title" title={product?.name || productNameHint}>
                {product?.name || productNameHint || "Catalog Product"}
              </h4>
              <div className="tpm-subtitle">
                {service?.name && (
                  <span className="tpm-pill tpm-pill-blue">
                    {service.name}
                  </span>
                )}
                {provider?.name && (
                  <span className="tpm-pill tpm-pill-orange">
                    {provider.name}
                  </span>
                )}
                <code>{product?.code || productRef.serviceCode}</code>
              </div>
            </div>
          </div>

          <div className="tpm-header-actions">
            {/* Tab Switcher */}
            <div className="tpm-tabs">
              <button
                type="button"
                className={`tpm-tab-btn ${
                  activeTab === "overview" ? "tpm-tab-btn-active" : ""
                }`}
                onClick={() => setActiveTab("overview")}
              >
                📋 Overview
              </button>
              <button
                type="button"
                className={`tpm-tab-btn ${
                  activeTab === "edit" ? "tpm-tab-btn-active" : ""
                }`}
                onClick={() => setActiveTab("edit")}
              >
                ✏️ Edit Product
              </button>
            </div>

            <button
              type="button"
              className="tpm-close-btn"
              onClick={toggle}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="tpm-body">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="tpm-spinner-dark"></div>
              <div style={{ color: "#64748b", fontSize: "13px", marginTop: "12px" }}>
                Loading product information...
              </div>
            </div>
          ) : !product ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
              <h5 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
                Product Not Found in Catalog
              </h5>
              <p style={{ fontSize: "12px", color: "#64748b", maxWidth: "420px", margin: "6px auto 16px" }}>
                Could not automatically resolve this product record from the transaction reference (
                <code>{productNameHint || rawProductId}</code>).
              </p>
              <a
                href={`/products?search=${encodeURIComponent(productNameHint)}`}
                target="_blank"
                rel="noreferrer"
                className="tpm-btn tpm-btn-primary"
                style={{ textDecoration: "none" }}
              >
                Search Full Products Catalog ↗
              </a>
            </div>
          ) : activeTab === "overview" ? (
            /* ── OVERVIEW TAB ─────────────────────────────────────────────── */
            <div>
              {/* Pricing & Margin Highlights */}
              <div className="tpm-price-strip">
                <div className="tpm-price-box">
                  <span className="tpm-price-label">Selling Price</span>
                  <span className="tpm-price-value">
                    {formatter("NGN").format(product.amount || 0)}
                  </span>
                </div>
                <div className="tpm-price-box">
                  <span className="tpm-price-label">Provider Cost</span>
                  <span className="tpm-price-value" style={{ color: "#475569" }}>
                    {formatter("NGN").format(product.providerAmount || 0)}
                  </span>
                </div>
                <div className="tpm-price-box">
                  <span className="tpm-price-label">Current Margin</span>
                  <span
                    className={`tpm-price-value ${
                      margin >= 0
                        ? "tpm-price-value-profit"
                        : "tpm-price-value-loss"
                    }`}
                  >
                    {margin >= 0 ? "+" : ""}
                    {formatter("NGN").format(margin)}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`tpm-banner ${
                  product.isActive ? "" : "tpm-banner-warning"
                }`}
              >
                <div>
                  <strong>Status:</strong>{" "}
                  {product.isActive ? (
                    <span>✅ Active in customer catalog</span>
                  ) : (
                    <span>⚠️ Deactivated — Hidden from customers</span>
                  )}
                  {product.isHot && (
                    <span style={{ marginLeft: "8px" }}>🔥 Hot Product</span>
                  )}
                </div>
                {Array.isArray(product.fallbackProducts) && (
                  <span style={{ fontSize: "11px", fontWeight: 600 }}>
                    🔗 {product.fallbackProducts.length} Fallback Backup(s)
                  </span>
                )}
              </div>

              {/* Detailed Attributes Grid */}
              <div className="tpm-grid">
                <div className="tpm-field">
                  <span className="tpm-field-label">Product Name</span>
                  <span className="tpm-field-value">{product.name}</span>
                </div>
                <div className="tpm-field">
                  <span className="tpm-field-label">Product Code</span>
                  <span className="tpm-field-value">
                    <code>{product.code}</code>
                  </span>
                </div>
                <div className="tpm-field">
                  <span className="tpm-field-label">Service / Network</span>
                  <span className="tpm-field-value">
                    {service?.name || "N/A"}
                  </span>
                </div>
                <div className="tpm-field">
                  <span className="tpm-field-label">Fulfillment Provider</span>
                  <span className="tpm-field-value">
                    {provider?.name || provider?.code || "Default"}
                  </span>
                </div>
                <div className="tpm-field">
                  <span className="tpm-field-label">Data Size</span>
                  <span className="tpm-field-value">
                    {product.dataSizeDisplay || product.dataSize || "N/A"}
                  </span>
                </div>
                <div className="tpm-field">
                  <span className="tpm-field-label">Data Plan Type</span>
                  <span className="tpm-field-value">
                    {product.attributes?.dataType || product.productType || "Standard"}
                  </span>
                </div>
                <div className="tpm-field">
                  <span className="tpm-field-label">Category / Frequency</span>
                  <span className="tpm-field-value">
                    {product.category || product.attributes?.category || "Regular"}
                  </span>
                </div>
                <div className="tpm-field">
                  <span className="tpm-field-label">Validity Period</span>
                  <span className="tpm-field-value">
                    {product.validity || product.attributes?.validityPeriod || "N/A"}
                  </span>
                </div>
              </div>

              {product.description && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    fontSize: "12px",
                    color: "#475569",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Description:</strong> {product.description}
                </div>
              )}
            </div>
          ) : (
            /* ── EDIT TAB ─────────────────────────────────────────────────── */
            <form onSubmit={handleSave}>
              {/* Live Margin Calculation Preview */}
              <div
                style={{
                  background: isLoss ? "#fef2f2" : "#f0fdf4",
                  border: `1px solid ${isLoss ? "#fecaca" : "#bbf7d0"}`,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <div>
                  <strong style={{ color: isLoss ? "#dc2626" : "#166534" }}>
                    Live Profit Margin:
                  </strong>{" "}
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "14px",
                      color: isLoss ? "#dc2626" : "#16a34a",
                      marginLeft: "4px",
                    }}
                  >
                    {margin >= 0 ? "+" : ""}
                    {formatter("NGN").format(margin)}
                  </span>
                </div>
                {isLoss && (
                  <span style={{ color: "#dc2626", fontWeight: 600, fontSize: "11px" }}>
                    ⚠️ Selling below provider cost!
                  </span>
                )}
              </div>

              <div className="tpm-form-grid">
                {/* Product Name */}
                <div className="tpm-form-group tpm-form-group-full">
                  <label className="tpm-form-label">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="tpm-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Selling Price */}
                <div className="tpm-form-group">
                  <label className="tpm-form-label">Selling Price (₦) *</label>
                  <input
                    type="number"
                    step="any"
                    name="amount"
                    className="tpm-input"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Provider Cost Price */}
                <div className="tpm-form-group">
                  <label className="tpm-form-label">Provider Cost (₦) *</label>
                  <input
                    type="number"
                    step="any"
                    name="providerAmount"
                    className="tpm-input"
                    value={formData.providerAmount}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Product Code */}
                <div className="tpm-form-group">
                  <label className="tpm-form-label">Product Code *</label>
                  <input
                    type="text"
                    name="code"
                    className="tpm-input"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Data Size Display */}
                <div className="tpm-form-group">
                  <label className="tpm-form-label">Data Size Display</label>
                  <input
                    type="text"
                    name="dataSizeDisplay"
                    className="tpm-input"
                    placeholder="e.g. 1GB, 500MB, 2.5GB"
                    value={formData.dataSizeDisplay}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Data Type */}
                <div className="tpm-form-group">
                  <label className="tpm-form-label">Data Type</label>
                  <select
                    name="dataType"
                    className="tpm-input"
                    value={formData.dataType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Data Type</option>
                    {DATA_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="tpm-form-group">
                  <label className="tpm-form-label">Category</label>
                  <select
                    name="category"
                    className="tpm-input"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {DATA_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validity */}
                <div className="tpm-form-group">
                  <label className="tpm-form-label">Validity Period</label>
                  <select
                    name="validity"
                    className="tpm-input"
                    value={formData.validity}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Validity</option>
                    {VALIDITY_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="tpm-form-group tpm-form-group-full">
                  <label className="tpm-form-label">Description / Remarks</label>
                  <textarea
                    name="description"
                    rows="2"
                    className="tpm-input"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional details or instructions..."
                  />
                </div>

                {/* Toggles */}
                <div className="tpm-form-group tpm-form-group-full">
                  {/* Active Status */}
                  <div className="tpm-switch-row">
                    <div className="tpm-switch-label-wrap">
                      <span className="tpm-switch-title">Product Active Status</span>
                      <span className="tpm-switch-desc">
                        When active, customers can purchase this product via mobile and web apps.
                      </span>
                    </div>
                    <label className="tpm-toggle-switch">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <span className="tpm-toggle-slider"></span>
                    </label>
                  </div>

                  {/* Hot Product */}
                  <div className="tpm-switch-row">
                    <div className="tpm-switch-label-wrap">
                      <span className="tpm-switch-title">🔥 Mark as Hot Product</span>
                      <span className="tpm-switch-desc">
                        Pins product to top recommendations and adds hot badge in mobile app.
                      </span>
                    </div>
                    <label className="tpm-toggle-switch">
                      <input
                        type="checkbox"
                        name="isHot"
                        checked={formData.isHot}
                        onChange={handleInputChange}
                      />
                      <span className="tpm-toggle-slider"></span>
                    </label>
                  </div>

                  {/* Allow Below Cost */}
                  <div className="tpm-switch-row" style={{ background: formData.allowBelowCost ? "#fffbeb" : "#f8fafc" }}>
                    <div className="tpm-switch-label-wrap">
                      <span className="tpm-switch-title">
                        Allow Selling Below Provider Cost (Wholesale)
                      </span>
                      <span className="tpm-switch-desc">
                        Enable only when you receive backend wholesale commission from provider.
                      </span>
                    </div>
                    <label className="tpm-toggle-switch">
                      <input
                        type="checkbox"
                        name="allowBelowCost"
                        checked={formData.allowBelowCost}
                        onChange={handleInputChange}
                      />
                      <span className="tpm-toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="tpm-footer">
          <div>
            {product && (
              <a
                href={`/products?search=${encodeURIComponent(product.name || "")}`}
                target="_blank"
                rel="noreferrer"
                className="tpm-btn-link"
              >
                Open in Full Products Catalog ↗
              </a>
            )}
          </div>

          <div className="tpm-footer-right" style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="tpm-btn tpm-btn-secondary"
              onClick={toggle}
              disabled={isSaving}
            >
              Close
            </button>

            {activeTab === "overview" ? (
              <button
                type="button"
                className="tpm-btn tpm-btn-primary"
                onClick={() => setActiveTab("edit")}
                disabled={!product}
              >
                ✏️ Edit This Product
              </button>
            ) : (
              <button
                type="button"
                className="tpm-btn tpm-btn-primary"
                onClick={handleSave}
                disabled={isSaving || !product}
              >
                {isSaving ? (
                  <>
                    <span className="tpm-spinner"></span>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>✓ Save Product Changes</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionProductModal;
