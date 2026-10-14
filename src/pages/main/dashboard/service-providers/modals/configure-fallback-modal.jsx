import React, { useEffect, useState } from "react";
import {
  useGetProductFallbackCandidates,
  useUpdateProductFallbacks,
} from "../../../../../api/product/products";
import { formatter } from "../../../../../utils/Utils";
import ProductViewModal from "../../product/modals/product-view-modal";
import "./configure-fallback-modal.css";

const ConfigureFallbackModalContent = ({ isOpen, toggle, product }) => {
  const productId = product?._id || product?.id;

  // Tolerance state (defaults to 10% ±)
  const [tolerance, setTolerance] = useState(0.10);
  // Preview product modal state
  const [previewProduct, setPreviewProduct] = useState(null);

  const { data: candidateData, isLoading: loadingCandidates } =
    useGetProductFallbackCandidates(productId, tolerance);

  const { mutate: updateFallbacks, isLoading: isSaving } =
    useUpdateProductFallbacks(productId);

  // Local state for the fallback chain and fallback availability
  const [fallbackChain, setFallbackChain] = useState([]);
  const [isFallbackAvailable, setIsFallbackAvailable] = useState(true);

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

  // Initialize state when product changes
  useEffect(() => {
    if (product) {
      setIsFallbackAvailable(product.isFallbackAvailable !== false);

      // If product already has fallbackProducts configured, populate them
      if (Array.isArray(product.fallbackProducts) && product.fallbackProducts.length > 0) {
        const sorted = [...product.fallbackProducts]
          .sort((a, b) => (a.priority || 1) - (b.priority || 1))
          .map((item) => {
            const p = item.productId;
            return {
              _id: p?._id || p?.id || p,
              name: p?.name || "Product",
              code: p?.code || "",
              amount: p?.amount || product.amount,
              providerAmount: p?.providerAmount || 0,
              providerName: p?.providerId?.name || p?.providerId?.code || "Provider",
              priority: item.priority || 1,
            };
          });
        setFallbackChain(sorted);
      } else {
        setFallbackChain([]);
      }
    }
  }, [product]);

  // Enrich items in fallbackChain when candidates load
  useEffect(() => {
    const candidatePool =
      candidateData?.candidates || candidateData?.data?.candidates;
    if (candidatePool && fallbackChain.length > 0) {
      setFallbackChain((prev) =>
        prev.map((item) => {
          const match = candidatePool.find(
            (c) => c._id === item._id || c.id === item._id
          );
          if (match) {
            return {
              ...item,
              name: match.name,
              code: match.code,
              amount: match.amount,
              providerAmount: match.providerAmount,
              providerName:
                match.providerId?.name || match.providerId?.code || item.providerName,
            };
          }
          return item;
        })
      );
    }
  }, [candidateData]);

  const primaryAmount = Number(product?.amount || 0);
  const primaryCost = Number(product?.providerAmount || 0);
  const primaryProfit = primaryAmount - primaryCost;
  const primaryValidity =
    product?.validity ||
    product?.attributes?.validityPeriod ||
    candidateData?.primaryProduct?.validity ||
    "";
  const primaryDataSize =
    product?.dataSizeDisplay ||
    candidateData?.primaryProduct?.dataSizeDisplay ||
    product?.attributes?.dataSizeDisplay ||
    "";

  // Add candidate to chain
  const addCandidate = (candidate) => {
    const candidateId = candidate._id || candidate.id;
    if (fallbackChain.some((item) => item._id === candidateId)) return;

    const newItem = {
      _id: candidateId,
      name: candidate.name,
      code: candidate.code,
      amount: candidate.amount,
      providerAmount: candidate.providerAmount,
      providerName:
        candidate.providerId?.name || candidate.providerId?.code || "Provider",
      priority: fallbackChain.length + 1,
    };

    setFallbackChain([...fallbackChain, newItem]);
  };

  // Remove candidate from chain
  const removeCandidate = (candidateId) => {
    const updated = fallbackChain
      .filter((item) => item._id !== candidateId)
      .map((item, idx) => ({ ...item, priority: idx + 1 }));
    setFallbackChain(updated);
  };

  // Move priority up
  const moveUp = (index) => {
    if (index === 0) return;
    const items = [...fallbackChain];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    const reordered = items.map((item, idx) => ({ ...item, priority: idx + 1 }));
    setFallbackChain(reordered);
  };

  // Move priority down
  const moveDown = (index) => {
    if (index === fallbackChain.length - 1) return;
    const items = [...fallbackChain];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    const reordered = items.map((item, idx) => ({ ...item, priority: idx + 1 }));
    setFallbackChain(reordered);
  };

  // Save configuration
  const handleSave = () => {
    const payload = {
      isFallbackAvailable,
      fallbackProducts: fallbackChain.map((item, idx) => ({
        productId: item._id,
        priority: idx + 1,
      })),
    };

    updateFallbacks(payload, {
      onSuccess: () => {
        document.body.style.removeProperty("overflow");
        toggle();
      },
    });
  };

  const candidatesList =
    candidateData?.candidates || candidateData?.data?.candidates || [];
  const selectedIds = new Set(fallbackChain.map((item) => item._id));

  return (
    <div className="pfm-overlay" onClick={toggle}>
      <div className="pfm-card" onClick={(e) => e.stopPropagation()}>
        {/* Pinned Header */}
        <div className="pfm-header">
          <div className="pfm-header-info">
            <h4 className="pfm-title">
              <span>🔄</span>
              Manage Provider Fallback Chain
            </h4>
            <div className="pfm-subtitle">
              Configure automatic backup providers for <strong>{product?.name}</strong> if the primary provider fails.
            </div>
          </div>
          <button
            type="button"
            className="pfm-close-btn"
            aria-label="Close"
            onClick={toggle}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="pfm-body">
          {/* Section 1: Primary Product Card */}
          <div className="pfm-primary-card">
            <div className="pfm-primary-top">
              <div className="pfm-primary-identity">
                <div className="pfm-primary-tags">
                  <span className="pfm-badge-primary">Primary Product</span>
                  <span className="pfm-primary-name">{product?.name}</span>
                  <span className="pfm-code-tag">({product?.code})</span>
                </div>
                <div className="pfm-primary-provider">
                  Provider:{" "}
                  <strong>
                    {product?.providerId?.name || product?.providerId?.code || "Default"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pfm-primary-financials">
              <div className="pfm-stat-box">
                <span className="pfm-stat-label">Selling Price</span>
                <span className="pfm-stat-value">
                  {formatter("NGN").format(primaryAmount)}
                </span>
              </div>
              <div className="pfm-stat-box">
                <span className="pfm-stat-label">Cost Price</span>
                <span className="pfm-stat-value">
                  {formatter("NGN").format(primaryCost)}
                </span>
              </div>
              <div className="pfm-stat-box">
                <span className="pfm-stat-label">Margin</span>
                <span
                  className={`pfm-stat-value ${
                    primaryProfit >= 0 ? "pfm-margin-positive" : "pfm-margin-negative"
                  }`}
                >
                  {primaryProfit >= 0 ? "+" : ""}
                  {formatter("NGN").format(primaryProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Global Fallback Availability Switch Card */}
          <div className="pfm-switch-card">
            <div className="pfm-switch-info">
              <span className="pfm-switch-title">
                Eligible as Fallback for other products
              </span>
              <span className="pfm-switch-desc">
                When disabled, other products will skip this product in their fallback chains.
              </span>
            </div>
            <label
              className="pfm-toggle"
              htmlFor="switch-fallback-avail"
              title="Toggle fallback eligibility"
            >
              <input
                type="checkbox"
                id="switch-fallback-avail"
                checked={isFallbackAvailable}
                onChange={(e) => setIsFallbackAvailable(e.target.checked)}
              />
              <span className="pfm-toggle-slider"></span>
            </label>
          </div>

          {/* Section 3: Active Fallback Chain */}
          <div className="pfm-section">
            <div className="pfm-section-header">
              <h6 className="pfm-section-title">
                Active Fallback Chain ({fallbackChain.length})
              </h6>
              <span className="pfm-section-hint">
                Cascades sequentially from Priority #1 onwards
              </span>
            </div>

            {fallbackChain.length === 0 ? (
              <div className="pfm-empty-box">
                <div className="pfm-empty-icon">🔗</div>
                <div className="pfm-empty-title">No fallbacks configured</div>
                <div className="pfm-empty-text">
                  Select an eligible candidate from the list below to add a backup provider.
                </div>
              </div>
            ) : (
              <div className="pfm-chain-list">
                {fallbackChain.map((item, index) => {
                  const itemCost = Number(item.providerAmount || 0);
                  const itemMargin = primaryAmount - itemCost;
                  const isLoss = itemCost > primaryAmount;

                  return (
                    <div key={item._id} className="pfm-chain-item">
                      <div className="pfm-item-left">
                        <span className="pfm-priority-badge">#{index + 1}</span>
                        <div className="pfm-item-details">
                          <span className="pfm-item-name">{item.name}</span>
                          <span className="pfm-item-meta">
                            Provider: <strong>{item.providerName}</strong> • Code: <code>{item.code}</code> • SA: <strong>{formatter("NGN").format(item.amount)}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="pfm-item-right">
                        <div className="pfm-item-pricing">
                          <div className="pfm-mini-stat">
                            <span className="pfm-mini-label">Cost Price</span>
                            <span className="pfm-mini-value">
                              {formatter("NGN").format(itemCost)}
                            </span>
                          </div>

                          <div className="pfm-mini-stat" style={{ minWidth: 80 }}>
                            <span className="pfm-mini-label">Margin</span>
                            <span
                              className={`pfm-mini-value ${
                                isLoss ? "pfm-margin-negative" : "pfm-margin-positive"
                              }`}
                            >
                              {itemMargin >= 0 ? "+" : ""}
                              {formatter("NGN").format(itemMargin)}
                              {isLoss && (
                                <span
                                  style={{ marginLeft: 3 }}
                                  title="Cost exceeds selling price!"
                                >
                                  ⚠️
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Priority, Preview & Delete Controls */}
                        <div className="pfm-actions-wrap">
                          <button
                            type="button"
                            className="pfm-icon-btn"
                            onClick={() => {
                              const full = candidatesList.find((c) => (c._id || c.id) === item._id) || item;
                              setPreviewProduct(full);
                            }}
                            title="View product details"
                            aria-label="View product details"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="pfm-icon-btn"
                            disabled={index === 0}
                            onClick={() => moveUp(index)}
                            title="Move priority up"
                            aria-label="Move priority up"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="19" x2="12" y2="5"></line>
                              <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="pfm-icon-btn"
                            disabled={index === fallbackChain.length - 1}
                            onClick={() => moveDown(index)}
                            title="Move priority down"
                            aria-label="Move priority down"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <polyline points="19 12 12 19 5 12"></polyline>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="pfm-icon-btn danger"
                            onClick={() => removeCandidate(item._id)}
                            title="Remove from fallback chain"
                            aria-label="Remove from fallback chain"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Eligible Backup Candidates */}
          <div className="pfm-section">
            <div className="pfm-section-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h6 className="pfm-section-title">
                    Eligible Backup Candidates ({candidatesList.length})
                  </h6>
                  <span className="pfm-section-hint">
                    Products matching {formatter("NGN").format(primaryAmount)} (±{Math.round(tolerance * 100)}%)
                    {primaryDataSize ? ` • Size: ${primaryDataSize}` : ""}
                    {primaryValidity ? ` • Duration: ${primaryValidity}` : ""}
                  </span>
                </div>

                <div className="pfm-tolerance-wrap">
                  <span className="pfm-tolerance-label">Tolerance:</span>
                  <div className="pfm-tolerance-pills">
                    {[
                      { label: "±1%", val: 0.01 },
                      { label: "±5%", val: 0.05 },
                      { label: "±10%", val: 0.10 },
                    ].map((pill) => (
                      <button
                        key={pill.val}
                        type="button"
                        className={`pfm-tolerance-pill ${tolerance === pill.val ? "active" : ""}`}
                        onClick={() => setTolerance(pill.val)}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {loadingCandidates ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div className="pfm-spinner-dark"></div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "8px" }}>
                  Loading eligible candidates...
                </div>
              </div>
            ) : candidatesList.length === 0 ? (
              <div className="pfm-empty-box" style={{ padding: "16px" }}>
                <div className="pfm-empty-text">
                  No matching products found under this service within ±{Math.round(tolerance * 100)}% price
                  {primaryDataSize ? ` with matching data size (${primaryDataSize})` : ""}
                  {primaryValidity ? ` and matching duration (${primaryValidity})` : ""}.
                </div>
              </div>
            ) : (
              <div className="pfm-candidates-scroll">
                {candidatesList.map((cand) => {
                  const candId = cand._id || cand.id;
                  const isSelected = selectedIds.has(candId);
                  const candCost = Number(cand.providerAmount || 0);
                  const candMargin = primaryAmount - candCost;
                  const priceDiff =
                    Math.abs(cand.amount - primaryAmount) / (primaryAmount || 1);
                  const candValidity =
                    cand.validity ||
                    cand.attributes?.validityPeriod ||
                    cand.attributes?.validity ||
                    "";

                  return (
                    <div key={candId} className="pfm-candidate-card">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span className="pfm-candidate-name">{cand.name}</span>
                          <span className="pfm-provider-tag">
                            {cand.providerId?.name || cand.providerId?.code || "Provider"}
                          </span>
                          {(cand.dataSizeDisplay || cand.attributes?.dataSizeDisplay) && (
                            <span
                              className="pfm-validity-tag"
                              style={{ background: "#e0e7ff", color: "#3730a3", fontWeight: 600 }}
                              title="Data size"
                            >
                              {cand.dataSizeDisplay || cand.attributes?.dataSizeDisplay}
                            </span>
                          )}
                          {candValidity && (
                            <span className="pfm-validity-tag" title="Validity duration">
                              {candValidity}
                            </span>
                          )}
                          {priceDiff > 0 && (
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              ({formatter("NGN").format(cand.amount)})
                            </span>
                          )}
                        </div>
                        <div className="pfm-candidate-meta">
                          Code: <code>{cand.code || "N/A"}</code> • SA:{" "}
                          <strong>{formatter("NGN").format(cand.amount)}</strong> • Cost:{" "}
                          <strong>{formatter("NGN").format(candCost)}</strong> • Margin:{" "}
                          <strong
                            style={{ color: candMargin >= 0 ? "#059669" : "#dc2626" }}
                          >
                            {candMargin >= 0 ? "+" : ""}
                            {formatter("NGN").format(candMargin)}
                          </strong>
                        </div>
                      </div>

                      <div className="pfm-candidate-actions">
                        <button
                          type="button"
                          className="pfm-view-btn"
                          onClick={() => setPreviewProduct(cand)}
                          title="View product details"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span>View Product</span>
                        </button>

                        {isSelected ? (
                          <span className="pfm-in-chain-badge">✓ In Chain</span>
                        ) : (
                          <button
                            type="button"
                            className="pfm-add-btn"
                            onClick={() => addCandidate(cand)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add as Fallback
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="pfm-footer">
          <button
            type="button"
            className="pfm-btn-cancel"
            onClick={toggle}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pfm-btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="pfm-spinner"></span>
                <span>Saving...</span>
              </>
            ) : (
              "Save Fallback Configuration"
            )}
          </button>
        </div>
      </div>

      {/* Product View Modal for Previewing Candidate Details */}
      <ProductViewModal
        isOpen={!!previewProduct}
        toggle={() => setPreviewProduct(null)}
        product={previewProduct}
        onAddToFallback={
          previewProduct && !selectedIds.has(previewProduct._id || previewProduct.id)
            ? () => {
                addCandidate(previewProduct);
                setPreviewProduct(null);
              }
            : undefined
        }
        isInFallbackChain={
          previewProduct
            ? selectedIds.has(previewProduct._id || previewProduct.id)
            : false
        }
      />
    </div>
  );
};

const ConfigureFallbackModal = ({ isOpen, toggle, product }) => {
  if (!isOpen || !product) {
    return null;
  }

  return (
    <ConfigureFallbackModalContent
      isOpen={isOpen}
      toggle={toggle}
      product={product}
    />
  );
};

export default ConfigureFallbackModal;
