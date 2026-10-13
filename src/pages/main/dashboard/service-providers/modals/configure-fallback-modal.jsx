import React, { useEffect, useState } from "react";
import { Badge, Modal, ModalBody, Spinner } from "reactstrap";
import {
  useGetProductFallbackCandidates,
  useUpdateProductFallbacks,
} from "../../../../../api/product/products";
import { Button, Icon } from "../../../../../components/Component";
import { formatter } from "../../../../../utils/Utils";

const ConfigureFallbackModalContent = ({ isOpen, toggle, product }) => {
  const productId = product?._id || product?.id;

  const { data: candidateData, isLoading: loadingCandidates } =
    useGetProductFallbackCandidates(productId);

  const { mutate: updateFallbacks, isLoading: isSaving } =
    useUpdateProductFallbacks(productId);

  // Local state for the fallback chain and fallback availability
  const [fallbackChain, setFallbackChain] = useState([]);
  const [isFallbackAvailable, setIsFallbackAvailable] = useState(true);

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

  // When candidates load, enrich items in the fallbackChain if they had missing details
  useEffect(() => {
    if (candidateData?.candidates && fallbackChain.length > 0) {
      setFallbackChain((prev) =>
        prev.map((item) => {
          const match = candidateData.candidates.find(
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
        toggle();
      },
    });
  };

  const candidatesList = candidateData?.candidates || [];
  const selectedIds = new Set(fallbackChain.map((item) => item._id));

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered modal-dialog-scrollable" size="lg">
      <ModalBody className="bg-white rounded p-4" style={{ maxHeight: "88vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
          <div>
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <span style={{ fontSize: "1.25rem" }}>🔄</span>
              Manage Provider Fallback Chain
            </h5>
            <span className="text-muted fs-12px">
              Configure automatic backup providers for <strong>{product?.name}</strong> if the primary provider fails.
            </span>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={toggle}
          ></button>
        </div>

        {/* Primary Product Card */}
        <div
          className="p-3 rounded mb-3"
          style={{
            background: "#f0f4ff",
            border: "1px solid #d0e0fd",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="d-flex align-items-center gap-2">
                <Badge color="primary" className="text-uppercase fw-bold">
                  Primary Product
                </Badge>
                <span className="fw-bold text-dark fs-14px">{product?.name}</span>
                <span className="text-muted fs-12px">({product?.code})</span>
              </div>
              <div className="text-muted fs-12px mt-1">
                Provider:{" "}
                <strong className="text-secondary">
                  {product?.providerId?.name || product?.providerId?.code || "Default"}
                </strong>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="text-end">
                <div className="text-muted fs-11px text-uppercase">Selling Price</div>
                <div className="fw-bold text-dark fs-15px">
                  {formatter("NGN").format(primaryAmount)}
                </div>
              </div>
              <div className="text-end">
                <div className="text-muted fs-11px text-uppercase">Cost Price</div>
                <div className="fw-bold text-secondary fs-15px">
                  {formatter("NGN").format(primaryCost)}
                </div>
              </div>
              <div className="text-end">
                <div className="text-muted fs-11px text-uppercase">Margin</div>
                <div
                  className="fw-bold fs-15px"
                  style={{ color: primaryProfit >= 0 ? "#059669" : "#dc2626" }}
                >
                  {primaryProfit >= 0 ? "+" : ""}
                  {formatter("NGN").format(primaryProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Fallback Availability Switch */}
        <div className="d-flex align-items-center justify-content-between p-3 rounded mb-3 bg-light border">
          <div>
            <div className="fw-bold text-dark fs-13px">
              Eligible as Fallback for other products
            </div>
            <div className="text-muted fs-12px">
              When disabled, other products will skip this product in their fallback chains.
            </div>
          </div>
          <div className="form-check form-switch m-0">
            <input
              type="checkbox"
              className="form-check-input"
              role="switch"
              id="switch-fallback-avail"
              style={{ width: "2.5rem", height: "1.25rem", cursor: "pointer" }}
              checked={isFallbackAvailable}
              onChange={(e) => setIsFallbackAvailable(e.target.checked)}
            />
          </div>
        </div>

        {/* Configured Chain Section */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="fw-bold text-dark mb-0 fs-13px text-uppercase">
              Active Fallback Chain ({fallbackChain.length})
            </h6>
            <span className="text-muted fs-11px">
              Cascades sequentially from Priority #1 onwards
            </span>
          </div>

          {fallbackChain.length === 0 ? (
            <div
              className="text-center p-3 rounded border border-dashed text-muted"
              style={{ background: "#fafafa" }}
            >
              <div className="fs-18px mb-1">🔗</div>
              <div className="fw-medium fs-13px">No fallbacks configured</div>
              <div className="fs-11px">
                Select an eligible candidate from the list below to add a backup provider.
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {fallbackChain.map((item, index) => {
                const itemCost = Number(item.providerAmount || 0);
                const itemMargin = primaryAmount - itemCost;
                const isLoss = itemCost > primaryAmount;

                return (
                  <div
                    key={item._id}
                    className="p-2 px-3 rounded border d-flex align-items-center justify-content-between bg-white shadow-sm"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Badge
                        color="secondary"
                        className="fw-bold rounded-pill px-2 py-1"
                        style={{ fontSize: 11 }}
                      >
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="fw-bold text-dark fs-13px">
                          {item.name}
                        </div>
                        <div className="text-muted fs-11px">
                          Provider:{" "}
                          <strong className="text-secondary">{item.providerName}</strong>{" "}
                          • Code: <code>{item.code}</code>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="text-end">
                        <div className="text-muted fs-11px text-uppercase">Cost Price</div>
                        <div className="fw-bold text-dark fs-13px">
                          {formatter("NGN").format(itemCost)}
                        </div>
                      </div>

                      <div className="text-end" style={{ minWidth: 90 }}>
                        <div className="text-muted fs-11px text-uppercase">Margin</div>
                        <div
                          className="fw-bold fs-13px"
                          style={{ color: isLoss ? "#dc2626" : "#059669" }}
                        >
                          {itemMargin >= 0 ? "+" : ""}
                          {formatter("NGN").format(itemMargin)}
                          {isLoss && (
                            <span
                              className="ms-1"
                              title="Cost exceeds selling price! Requires allowBelowCost on product."
                            >
                              ⚠️
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reorder & Remove Controls */}
                      <div className="d-flex align-items-center gap-1 border-start ps-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-light"
                          disabled={index === 0}
                          onClick={() => moveUp(index)}
                          title="Move priority up"
                          style={{ width: 28, height: 28 }}
                        >
                          <Icon name="arrow-up" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-light"
                          disabled={index === fallbackChain.length - 1}
                          onClick={() => moveDown(index)}
                          title="Move priority down"
                          style={{ width: 28, height: 28 }}
                        >
                          <Icon name="arrow-down" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-outline-danger ms-1"
                          onClick={() => removeCandidate(item._id)}
                          title="Remove from fallback chain"
                          style={{ width: 28, height: 28 }}
                        >
                          <Icon name="cross" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Eligible Candidates Section */}
        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="fw-bold text-dark mb-0 fs-13px text-uppercase">
              Eligible Backup Candidates (±1% Selling Price)
            </h6>
            <span className="text-muted fs-11px">
              Products for this service matching {formatter("NGN").format(primaryAmount)}
            </span>
          </div>

          {loadingCandidates ? (
            <div className="text-center py-4 text-muted">
              <Spinner size="sm" color="primary" className="me-2" />
              Loading eligible candidates...
            </div>
          ) : candidatesList.length === 0 ? (
            <div className="p-3 rounded border text-center text-muted fs-12px bg-light">
              No matching products found under this service with equivalent selling price (±1%).
            </div>
          ) : (
            <div
              className="border rounded p-2 d-flex flex-column gap-2"
              style={{ maxHeight: 220, overflowY: "auto", background: "#fbfcfd" }}
            >
              {candidatesList.map((cand) => {
                const candId = cand._id || cand.id;
                const isSelected = selectedIds.has(candId);
                const candCost = Number(cand.providerAmount || 0);
                const candMargin = primaryAmount - candCost;
                const priceDiff =
                  Math.abs(cand.amount - primaryAmount) / (primaryAmount || 1);

                return (
                  <div
                    key={candId}
                    className="p-2 px-3 rounded border d-flex align-items-center justify-content-between bg-white"
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark fs-13px">{cand.name}</span>
                        <Badge color="light" className="text-secondary fs-10px">
                          {cand.providerId?.name || cand.providerId?.code || "Provider"}
                        </Badge>
                        {priceDiff > 0 && (
                          <span className="text-muted fs-11px">
                            ({formatter("NGN").format(cand.amount)})
                          </span>
                        )}
                      </div>
                      <div className="text-muted fs-11px mt-1">
                        Cost: <strong>{formatter("NGN").format(candCost)}</strong> • Margin:{" "}
                        <strong
                          style={{ color: candMargin >= 0 ? "#059669" : "#dc2626" }}
                        >
                          {candMargin >= 0 ? "+" : ""}
                          {formatter("NGN").format(candMargin)}
                        </strong>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <Badge color="success" className="px-2 py-1 fs-11px">
                          ✓ In Chain
                        </Badge>
                      ) : (
                        <Button
                          color="primary"
                          size="sm"
                          outline
                          onClick={() => addCandidate(cand)}
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          <Icon name="plus" className="me-1" />
                          Add as Fallback
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="d-flex justify-content-end align-items-center gap-2 pt-3 border-top mt-4">
          <Button color="light" outline onClick={toggle} disabled={isSaving}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Fallback Configuration"
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
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
