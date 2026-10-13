import React, { useEffect, useState } from "react";
import { Badge, Modal, ModalBody, Spinner } from "reactstrap";
import {
  useGetServiceTypeProviderRouting,
  useUpdateServiceTypeProviderRouting,
} from "../../../../../api/service-providers";
import { Button, Icon } from "../../../../../components/Component";

const ConfigureRoutingModalContent = ({ isOpen, toggle, serviceType }) => {
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

  const handleDragOver = (e, index) => {
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
    // Edge check guard: if no providers are active, confirm with user or proceed
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
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered" size="lg">
      <ModalBody className="bg-white rounded p-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
          <div>
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <span style={{ fontSize: "1.25rem" }}>⚡</span>
              Provider Routing & Fallback Cascade
            </h5>
            <span className="text-muted fs-12px">
              Configure primary and fallback execution order for{" "}
              <strong>{serviceType?.name}</strong> (<code>{serviceType?.code?.toUpperCase()}</code>)
            </span>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={toggle}
          ></button>
        </div>

        {/* Informational Guidance Banner */}
        <div
          className="p-3 rounded mb-3"
          style={{
            background: "#f0f7ff",
            border: "1px solid #cce3fe",
          }}
        >
          <div className="d-flex align-items-start gap-2">
            <Icon name="info-fill" className="text-primary mt-1 fs-16px" />
            <div className="fs-12px text-secondary">
              <strong className="text-dark">How Cascade Fallback Works:</strong>
              <div className="mt-1">
                • <strong>🥇 Primary Vendor (#1):</strong> Receives and processes client requests first.
              </div>
              <div>
                • <strong>🥈 Fallback Vendors (#2, #3...):</strong> Automatically invoked in rank order if the primary vendor returns an explicit failure or out-of-stock.
              </div>
              <div className="text-muted mt-1">
                🛡️ <em>Timeouts and network-pending errors immediately halt the cascade to prevent double-vending.</em>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <div className="text-muted fs-12px mt-2">Loading provider routing...</div>
          </div>
        ) : (
          <div>
            {/* Active Routing Section */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold fs-13px text-dark">
                  Active Execution Cascade ({activeProviders.length})
                </span>
                {activeProviders.length === 0 && (
                  <span className="text-danger fs-11px fw-bold">
                    ⚠️ No active providers! Service will fail incoming requests.
                  </span>
                )}
              </div>

              {activeProviders.length === 0 ? (
                <div className="border border-dashed rounded p-3 text-center text-muted fs-12px">
                  No active providers configured. Activate at least one provider from the list below.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {activeProviders.map((provider, index) => {
                    const isPrimary = index === 0;
                    return (
                      <div
                        key={provider.providerId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className="d-flex align-items-center justify-content-between p-3 rounded border"
                        style={{
                          background: isPrimary ? "#f6ffed" : "#fbfbfb",
                          borderColor: isPrimary ? "#b7eb8f" : "#e5e9f2",
                          cursor: "grab",
                          transition: "box-shadow 0.15s ease",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {/* Drag handle */}
                          <div title="Drag to reorder priority" className="text-muted pe-1">
                            <Icon name="menu" className="fs-15px" />
                          </div>

                          {/* Priority Rank Badge */}
                          <Badge
                            color={isPrimary ? "success" : "info"}
                            className="badge-dim d-flex align-items-center gap-1"
                            style={{ fontSize: "12px", minWidth: "120px", padding: "6px 10px" }}
                          >
                            <span>{isPrimary ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                            <span>{isPrimary ? "Primary (#1)" : `Fallback #${index}`}</span>
                          </Badge>

                          {/* Provider Details */}
                          <div>
                            <div className="fw-bold text-dark fs-13px">
                              {provider.name}
                            </div>
                            <div className="text-muted fs-11px">
                              Code: <code>{provider.code}</code>
                              {!provider.isProviderActive && (
                                <Badge color="warning" className="badge-dim ms-2" style={{ fontSize: "10px" }}>
                                  Provider globally disabled
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Move Up, Move Down, Deactivate */}
                        <div className="d-flex align-items-center gap-1">
                          <Button
                            size="sm"
                            color="light"
                            className="btn-icon btn-white"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            title="Move Priority Up"
                          >
                            <Icon name="arrow-up" />
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            className="btn-icon btn-white"
                            onClick={() => moveDown(index)}
                            disabled={index === activeProviders.length - 1}
                            title="Move Priority Down"
                          >
                            <Icon name="arrow-down" />
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            outline
                            className="ms-2"
                            onClick={() => handleDeactivate(provider)}
                            title="Deactivate Provider"
                          >
                            <Icon name="cross" />
                            <span className="d-none d-sm-inline ms-1 fs-11px">Deactivate</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inactive Providers Section */}
            {inactiveProviders.length > 0 && (
              <div>
                <span className="fw-bold fs-13px text-muted d-block mb-2">
                  Available Inactive Providers ({inactiveProviders.length})
                </span>
                <div className="d-flex flex-column gap-2">
                  {inactiveProviders.map((provider) => (
                    <div
                      key={provider.providerId}
                      className="d-flex align-items-center justify-content-between p-2 px-3 rounded border bg-light text-muted"
                      style={{ opacity: 0.85 }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <Badge color="light" className="badge-dim text-secondary" style={{ fontSize: "11px" }}>
                          Inactive
                        </Badge>
                        <span className="fw-medium fs-13px text-dark">{provider.name}</span>
                        <code className="fs-11px">({provider.code})</code>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        outline
                        onClick={() => handleActivate(provider)}
                      >
                        <Icon name="plus" />
                        <span className="ms-1 fs-11px">Activate as Fallback</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-4">
          <Button color="light" onClick={toggle} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="d-flex align-items-center gap-2"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" />
                <span>Saving Routing...</span>
              </>
            ) : (
              <>
                <Icon name="check" />
                <span>Save Routing Configuration</span>
              </>
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export const ConfigureRoutingModal = (props) => {
  if (!props.isOpen || !props.serviceType) {
    return null;
  }
  return <ConfigureRoutingModalContent {...props} />;
};

export default ConfigureRoutingModal;
