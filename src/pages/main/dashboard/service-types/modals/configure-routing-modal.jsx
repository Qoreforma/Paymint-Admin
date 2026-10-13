import React, { useEffect, useState } from "react";
import {
  useGetServiceTypeProviderRouting,
  useUpdateServiceTypeProviderRouting,
} from "../../../../../api/service-providers";
import "../service-types.css";

const ConfigureRoutingModal = ({ isOpen, toggle, serviceType }) => {
  if (!isOpen || !serviceType) return null;

  const serviceTypeId = serviceType?._id || serviceType?.id;

  const { data: routingData, isLoading } =
    useGetServiceTypeProviderRouting(serviceTypeId);

  const { mutate: updateRouting, isLoading: isSaving } =
    useUpdateServiceTypeProviderRouting(serviceTypeId);

  const [activeProviders, setActiveProviders] = useState([]);
  const [inactiveProviders, setInactiveProviders] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    if (routingData?.data?.providers) {
      const providers = routingData.data.providers;
      const active = providers
        .filter((p) => p.isActive)
        .sort((a, b) => (a.priority || 1) - (b.priority || 1));
      const inactive = providers
        .filter((p) => !p.isActive)
        .sort((a, b) => a.name.localeCompare(b.name));

      setActiveProviders(active);
      setInactiveProviders(inactive);
    }
  }, [routingData]);

  // Ensure body scroll is never trapped
  useEffect(() => {
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, []);

  // Escape key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle]);

  const moveUp = (index) => {
    if (index === 0) return;
    const items = [...activeProviders];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    setActiveProviders(items);
  };

  const moveDown = (index) => {
    if (index === activeProviders.length - 1) return;
    const items = [...activeProviders];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    setActiveProviders(items);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const items = [...activeProviders];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);
    setActiveProviders(items);
    setDraggedIndex(null);
  };

  const handleDeactivate = (provider) => {
    setActiveProviders((prev) => prev.filter((p) => p.providerId !== provider.providerId));
    setInactiveProviders((prev) => [...prev, { ...provider, isActive: false }]);
  };

  const handleActivate = (provider) => {
    setInactiveProviders((prev) => prev.filter((p) => p.providerId !== provider.providerId));
    setActiveProviders((prev) => [...prev, { ...provider, isActive: true }]);
  };

  const handleSave = () => {
    if (activeProviders.length === 0) {
      const confirmSave = window.confirm(
        "Warning: You are saving with 0 active providers. Incoming transactions for this service will fail until at least one provider is activated. Do you want to proceed?"
      );
      if (!confirmSave) return;
    }

    const routingPayload = [
      ...activeProviders.map((p, idx) => ({
        providerId: p.providerId,
        priority: idx + 1,
        isActive: true,
      })),
      ...inactiveProviders.map((p, idx) => ({
        providerId: p.providerId,
        priority: activeProviders.length + idx + 1,
        isActive: false,
      })),
    ];

    updateRouting(
      { routing: routingPayload },
      {
        onSuccess: () => {
          toggle();
        },
      }
    );
  };

  return (
    <div className="pm-modal-overlay" onClick={toggle}>
      <div className="pm-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="pm-modal-header">
          <div>
            <h4 className="pm-modal-title">
              <span>⚡</span>
              Provider Routing & Fallback Cascade
            </h4>
            <div className="pm-modal-subtitle">
              Configure primary and fallback execution order for{" "}
              <strong style={{ color: "#111827" }}>{serviceType?.name}</strong>{" "}
              (<code>{serviceType?.code?.toUpperCase()}</code>)
            </div>
          </div>
          <button
            type="button"
            className="pm-modal-close-btn"
            onClick={toggle}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="pm-modal-body">
          {/* Info Box */}
          <div className="pm-modal-info-box">
            <strong style={{ display: "block", marginBottom: "4px" }}>
              ℹ️ How Cascade Fallback Works:
            </strong>
            <div>
              • <strong>🥇 Primary Vendor (#1):</strong> Receives and processes client requests first.
            </div>
            <div>
              • <strong>🥈 Fallback Vendors (#2, #3...):</strong> Automatically invoked in rank order if the primary vendor returns an explicit failure or out-of-stock.
            </div>
            <div style={{ marginTop: "4px", color: "#475569", fontSize: "11px" }}>
              🛡️ <em>Timeouts and network-pending errors halt the cascade to prevent double-vending.</em>
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="pm-spinner-dark"></div>
              <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "10px" }}>
                Loading provider routing...
              </div>
            </div>
          ) : (
            <div>
              {/* Section 1: Active Cascade */}
              <div className="pm-modal-section-title">
                <span>Active Execution Cascade ({activeProviders.length})</span>
                {activeProviders.length === 0 && (
                  <span style={{ color: "#dc2626", fontSize: "11px" }}>
                    ⚠️ No active providers! Service will fail incoming requests.
                  </span>
                )}
              </div>

              {activeProviders.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #d1d5db",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "12px",
                    marginBottom: "20px",
                  }}
                >
                  No active providers configured. Activate at least one provider from the list below.
                </div>
              ) : (
                <div className="pm-modal-list">
                  {activeProviders.map((provider, index) => {
                    const isPrimary = index === 0;
                    return (
                      <div
                        key={provider.providerId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`pm-provider-card-active ${isPrimary ? "pm-provider-card-primary" : ""}`}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {/* Drag grip */}
                          <div
                            className="pm-drag-handle"
                            title="Drag to reorder priority"
                          >
                            ⋮⋮
                          </div>

                          {/* Rank Tag */}
                          <div
                            className={`pm-rank-tag ${isPrimary ? "pm-rank-tag-primary" : "pm-rank-tag-fallback"}`}
                          >
                            <span>{isPrimary ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                            <span>{isPrimary ? "Primary (#1)" : `Fallback (#${index + 1})`}</span>
                          </div>

                          {/* Provider Info */}
                          <div className="pm-provider-info">
                            <span className="pm-provider-name">{provider.name}</span>
                            <span className="pm-provider-code">
                              Code: <code>{provider.code}</code>
                              {!provider.isProviderActive && (
                                <span
                                  style={{
                                    backgroundColor: "#fef3c7",
                                    color: "#92400e",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    fontSize: "10px",
                                    marginLeft: "6px",
                                  }}
                                >
                                  Globally disabled
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Card Buttons */}
                        <div className="pm-card-actions">
                          <button
                            type="button"
                            className="pm-btn-icon"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            title="Move Priority Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="pm-btn-icon"
                            onClick={() => moveDown(index)}
                            disabled={index === activeProviders.length - 1}
                            title="Move Priority Down"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            className="pm-btn-deactivate"
                            onClick={() => handleDeactivate(provider)}
                            style={{ marginLeft: "6px" }}
                          >
                            ✕ Deactivate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Section 2: Inactive Providers */}
              {inactiveProviders.length > 0 && (
                <div>
                  <div className="pm-modal-section-title" style={{ color: "#4b5563" }}>
                    <span>Available Inactive Providers ({inactiveProviders.length})</span>
                  </div>
                  <div className="pm-modal-list">
                    {inactiveProviders.map((provider) => (
                      <div
                        key={provider.providerId}
                        className="pm-provider-card-inactive"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="pm-rank-tag pm-rank-tag-inactive">
                            Inactive
                          </span>
                          <span style={{ fontWeight: 600, fontSize: "13px", color: "#1f2937" }}>
                            {provider.name}
                          </span>
                          <code style={{ fontSize: "11px", color: "#6b7280" }}>
                            ({provider.code})
                          </code>
                        </div>
                        <button
                          type="button"
                          className="pm-btn-activate"
                          onClick={() => handleActivate(provider)}
                        >
                          + Activate as Fallback
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="pm-modal-footer">
          <button
            type="button"
            className="pm-btn pm-btn-light"
            onClick={toggle}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pm-btn pm-btn-primary"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <span className="pm-spinner"></span>
                <span>Saving Routing...</span>
              </>
            ) : (
              <span>✓ Save Routing Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureRoutingModal;
