import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, Alert, Form, FormGroup, Label, Input } from "reactstrap";
import { Button, Col, Icon, Row } from "../../../../components/Component";
import { useSetInAppNotificationGroupExpiry } from "../../../../api/inAppNotifications";
import toast from "react-hot-toast";

const SetExpiryModal = ({ isOpen, toggle, group }) => {
  const [expiryMode, setExpiryMode] = useState("2days"); // '2days' | '3days' | '7days' | 'now' | 'custom' | 'never'
  const [customDateTime, setCustomDateTime] = useState("");

  const { mutate: setExpiry, isLoading } = useSetInAppNotificationGroupExpiry();

  const handleApply = (e) => {
    e.preventDefault();

    if (!group?.groupKey) {
      toast.error("Invalid notification group");
      return;
    }

    let payload = { groupKey: group.groupKey };

    if (expiryMode === "2days") {
      payload.expiryDays = 2;
    } else if (expiryMode === "3days") {
      payload.expiryDays = 3;
    } else if (expiryMode === "7days") {
      payload.expiryDays = 7;
    } else if (expiryMode === "now") {
      // Expire immediately (1 minute ago)
      payload.expiresAt = new Date(Date.now() - 60000).toISOString();
    } else if (expiryMode === "never") {
      payload.expiresAt = null;
    } else if (expiryMode === "custom") {
      if (!customDateTime) {
        toast.error("Please pick a custom expiration date and time");
        return;
      }
      payload.expiresAt = new Date(customDateTime).toISOString();
    }

    setExpiry(payload, {
      onSuccess: () => {
        toggle();
      },
    });
  };

  const getTargetDatePreview = () => {
    const now = new Date();
    if (expiryMode === "2days") {
      const d = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      return `Will stay for 2 days and automatically vanish from all users on ${d.toLocaleString()}`;
    }
    if (expiryMode === "3days") {
      const d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return `Will stay for 3 days and vanish on ${d.toLocaleString()}`;
    }
    if (expiryMode === "7days") {
      const d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return `Will stay for 7 days and vanish on ${d.toLocaleString()}`;
    }
    if (expiryMode === "now") {
      return "Will expire IMMEDIATELY. Users will stop seeing this notification right away.";
    }
    if (expiryMode === "never") {
      return "Notification will remain permanently in user inboxes until manually cleared.";
    }
    if (expiryMode === "custom" && customDateTime) {
      return `Will vanish on ${new Date(customDateTime).toLocaleString()}`;
    }
    return "";
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered">
      <ModalHeader toggle={toggle} className="border-bottom">
        <div className="d-flex align-items-center">
          <Icon name="clock" className="text-info me-2 fs-4" />
          <span>Set Duration & Expiration (TTL)</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <h6 className="title mb-1">{group?.title || "Notification"}</h6>
          <span className="text-muted small">
            Affects <strong>{(group?.recipientCount || 0).toLocaleString()} recipient inboxes</strong>.
          </span>
        </div>

        <Alert color="primary" className="p-3 mb-4 small">
          <Icon name="info-fill" className="me-2" />
          Once expired, the mobile app and web clients automatically stop displaying this notification immediately, and our automated background job cleans it up.
        </Alert>

        <Form onSubmit={handleApply}>
          <FormGroup className="mb-3">
            <Label className="form-label fw-bold mb-2">Select Duration / Lifetime:</Label>

            <div className="d-flex flex-column gap-2">
              <div
                className={`p-3 border rounded cursor-pointer transition ${expiryMode === "2days" ? "border-primary bg-lighter" : "bg-white"}`}
                onClick={() => setExpiryMode("2days")}
              >
                <div className="custom-control custom-radio">
                  <input
                    type="radio"
                    id="expiry-2days"
                    name="expiryMode"
                    className="custom-control-input"
                    checked={expiryMode === "2days"}
                    onChange={() => setExpiryMode("2days")}
                  />
                  <label className="custom-control-label fw-bold cursor-pointer" htmlFor="expiry-2days">
                    Stay for 2 Days (48 Hours) <span className="badge bg-primary ms-1">Recommended</span>
                  </label>
                </div>
                <div className="text-muted small ps-4 mt-1">
                  Ideal for event announcements, weekend promotions, or new month greetings.
                </div>
              </div>

              <div
                className={`p-3 border rounded cursor-pointer transition ${expiryMode === "3days" ? "border-primary bg-lighter" : "bg-white"}`}
                onClick={() => setExpiryMode("3days")}
              >
                <div className="custom-control custom-radio">
                  <input
                    type="radio"
                    id="expiry-3days"
                    name="expiryMode"
                    className="custom-control-input"
                    checked={expiryMode === "3days"}
                    onChange={() => setExpiryMode("3days")}
                  />
                  <label className="custom-control-label fw-bold cursor-pointer" htmlFor="expiry-3days">
                    Stay for 3 Days (72 Hours)
                  </label>
                </div>
              </div>

              <div
                className={`p-3 border rounded cursor-pointer transition ${expiryMode === "7days" ? "border-primary bg-lighter" : "bg-white"}`}
                onClick={() => setExpiryMode("7days")}
              >
                <div className="custom-control custom-radio">
                  <input
                    type="radio"
                    id="expiry-7days"
                    name="expiryMode"
                    className="custom-control-input"
                    checked={expiryMode === "7days"}
                    onChange={() => setExpiryMode("7days")}
                  />
                  <label className="custom-control-label fw-bold cursor-pointer" htmlFor="expiry-7days">
                    Stay for 7 Days (1 Week)
                  </label>
                </div>
              </div>

              <div
                className={`p-3 border rounded cursor-pointer transition ${expiryMode === "custom" ? "border-primary bg-lighter" : "bg-white"}`}
                onClick={() => setExpiryMode("custom")}
              >
                <div className="custom-control custom-radio">
                  <input
                    type="radio"
                    id="expiry-custom"
                    name="expiryMode"
                    className="custom-control-input"
                    checked={expiryMode === "custom"}
                    onChange={() => setExpiryMode("custom")}
                  />
                  <label className="custom-control-label fw-bold cursor-pointer" htmlFor="expiry-custom">
                    Custom Date & Time
                  </label>
                </div>
                {expiryMode === "custom" && (
                  <div className="ps-4 mt-2">
                    <Input
                      type="datetime-local"
                      className="form-control"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      required={expiryMode === "custom"}
                    />
                  </div>
                )}
              </div>

              <div
                className={`p-3 border rounded cursor-pointer transition ${expiryMode === "now" ? "border-danger bg-lighter" : "bg-white"}`}
                onClick={() => setExpiryMode("now")}
              >
                <div className="custom-control custom-radio">
                  <input
                    type="radio"
                    id="expiry-now"
                    name="expiryMode"
                    className="custom-control-input"
                    checked={expiryMode === "now"}
                    onChange={() => setExpiryMode("now")}
                  />
                  <label className="custom-control-label fw-bold text-danger cursor-pointer" htmlFor="expiry-now">
                    Expire Immediately (Vanish from all user apps now)
                  </label>
                </div>
              </div>

              <div
                className={`p-3 border rounded cursor-pointer transition ${expiryMode === "never" ? "border-secondary bg-lighter" : "bg-white"}`}
                onClick={() => setExpiryMode("never")}
              >
                <div className="custom-control custom-radio">
                  <input
                    type="radio"
                    id="expiry-never"
                    name="expiryMode"
                    className="custom-control-input"
                    checked={expiryMode === "never"}
                    onChange={() => setExpiryMode("never")}
                  />
                  <label className="custom-control-label fw-bold cursor-pointer" htmlFor="expiry-never">
                    Never Expire (Keep Indefinitely)
                  </label>
                </div>
              </div>
            </div>
          </FormGroup>

          {/* Dynamic Preview */}
          <div className="p-3 bg-light rounded text-center small fw-medium text-dark mb-4 border">
            {getTargetDatePreview()}
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button color="secondary" type="button" onClick={toggle} disabled={isLoading}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Duration"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default SetExpiryModal;
