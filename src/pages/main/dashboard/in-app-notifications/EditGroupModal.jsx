import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Alert, Form, FormGroup, Label, Input } from "reactstrap";
import { Button, Col, Icon, Row } from "../../../../components/Component";
import { useUpdateInAppNotificationGroup } from "../../../../api/inAppNotifications";
import toast from "react-hot-toast";

const EditGroupModal = ({ isOpen, toggle, group }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [keepExpiry, setKeepExpiry] = useState(true);

  const { mutate: updateGroup, isLoading } = useUpdateInAppNotificationGroup(group?.groupKey);

  useEffect(() => {
    if (group) {
      setTitle(group.title || "");
      setMessage(group.message || "");
      if (group.expiresAt) {
        // Format to YYYY-MM-DDTHH:mm for datetime-local input
        const d = new Date(group.expiresAt);
        const pad = (n) => String(n).padStart(2, "0");
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setExpiresAt(formatted);
      } else {
        setExpiresAt("");
      }
      setKeepExpiry(true);
    }
  }, [group]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a title");
      return;
    }
    if (!message.trim()) {
      toast.error("Please provide a notification message");
      return;
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
    };

    if (!keepExpiry) {
      payload.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;
    }

    updateGroup(payload, {
      onSuccess: () => {
        toggle();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered" size="lg">
      <ModalHeader toggle={toggle} className="border-bottom">
        <div className="d-flex align-items-center">
          <Icon name="edit" className="text-warning me-2 fs-4" />
          <span>Edit In-App Notification for All Users</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <Alert color="info" className="d-flex align-items-center mb-4">
          <Icon name="info-fill" className="fs-3 me-3 text-info" />
          <div>
            <strong>Broadcast Edit: </strong>
            Saving these changes will immediately update the title and message across all{" "}
            <strong>{(group?.recipientCount || 0).toLocaleString()} recipient inboxes</strong> in both mobile and web apps.
          </div>
        </Alert>

        <Form onSubmit={handleSubmit}>
          <FormGroup className="mb-3">
            <Label className="form-label fw-bold">Notification Title <span className="text-danger">*</span></Label>
            <Input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled System Maintenance"
              required
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <Label className="form-label fw-bold">Notification Message <span className="text-danger">*</span></Label>
            <Input
              type="textarea"
              rows="5"
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the updated message text to show inside user apps..."
              required
            />
          </FormGroup>

          <div className="p-3 bg-light rounded border mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Label className="form-label fw-bold mb-0">Expiration Date & Time (TTL)</Label>
              <div className="custom-control custom-checkbox small">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="keepExpiryCheckbox"
                  checked={keepExpiry}
                  onChange={(e) => setKeepExpiry(e.target.checked)}
                />
                <label className="custom-control-label cursor-pointer" htmlFor="keepExpiryCheckbox">
                  Keep current expiration setting
                </label>
              </div>
            </div>

            {!keepExpiry ? (
              <div>
                <Input
                  type="datetime-local"
                  className="form-control"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <span className="text-muted small mt-1 d-block">
                  Leave blank to make this notification permanent (never expire), or pick a date/time when it should disappear from user inboxes.
                </span>
              </div>
            ) : (
              <span className="text-muted small">
                Current expiration:{" "}
                <strong>
                  {group?.expiresAt ? new Date(group.expiresAt).toLocaleString() : "Never (Permanent)"}
                </strong>
              </span>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button color="secondary" type="button" onClick={toggle} disabled={isLoading}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Updating All Inboxes..." : `Update Across ${(group?.recipientCount || 0).toLocaleString()} Users`}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default EditGroupModal;
