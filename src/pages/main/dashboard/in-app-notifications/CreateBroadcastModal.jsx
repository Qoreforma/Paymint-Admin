import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, Alert, Form, FormGroup, Label, Input } from "reactstrap";
import { Button, Col, Icon, Row, RSelect, RASelect } from "../../../../components/Component";
import { useCreateInAppBroadcast } from "../../../../api/inAppNotifications";
import BACKEND_URLS from "../../../../api/urls";
import tokenStorage from "../../../../utils/tokenStorage";
import toast from "react-hot-toast";

const BROADCAST_TYPES = [
  { value: "announcement", label: "Announcement" },
  { value: "alert", label: "System Alert" },
  { value: "system", label: "System Notice" },
];

const TARGET_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "specific", label: "Specific Users" },
];

const EXPIRY_PRESETS = [
  { value: "2", label: "Stay for 2 Days (48 Hours) - Recommended" },
  { value: "3", label: "Stay for 3 Days" },
  { value: "7", label: "Stay for 7 Days (1 Week)" },
  { value: "custom", label: "Custom Date & Time" },
  { value: "never", label: "Never Expire (Permanent)" },
];

const CreateBroadcastModal = ({ isOpen, toggle }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState(BROADCAST_TYPES[0]);
  const [target, setTarget] = useState(TARGET_OPTIONS[0]);
  const [expiryPreset, setExpiryPreset] = useState(EXPIRY_PRESETS[0]);
  const [customDateTime, setCustomDateTime] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const access_token = tokenStorage.getAccessToken();
  const { mutate: createBroadcast, isLoading } = useCreateInAppBroadcast();

  const userOptions = async (value) => {
    const searchTerm = value ? `&search=${value}` : "";
    try {
      const res = await fetch(`${BACKEND_URLS.baseURL}${BACKEND_URLS.users}?page=1&per_page=10${searchTerm}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const json = await res.json();
      const data = json?.data;
      return Array.isArray(data)
        ? data.map((item) => ({
            id: item?._id || item?.id,
            value: item?._id || item?.id,
            label: `${item?.firstName || item?.firstname || ""} ${item?.lastName || item?.lastname || ""} (${item?.email || ""})`,
          }))
        : [];
    } catch {
      return [];
    }
  };

  const handleReset = () => {
    setTitle("");
    setMessage("");
    setType(BROADCAST_TYPES[0]);
    setTarget(TARGET_OPTIONS[0]);
    setExpiryPreset(EXPIRY_PRESETS[0]);
    setCustomDateTime("");
    setSelectedUsers([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a notification message");
      return;
    }

    let userIds = [];
    if (target.value === "specific") {
      if (!selectedUsers || selectedUsers.length === 0) {
        toast.error("Please select at least one recipient user");
        return;
      }
      userIds = selectedUsers.map((u) => u.id || u.value);
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      type: type.value,
      target: target.value,
      ...(userIds.length > 0 && { userIds }),
    };

    if (expiryPreset.value === "2" || expiryPreset.value === "3" || expiryPreset.value === "7") {
      payload.expiryDays = Number(expiryPreset.value);
    } else if (expiryPreset.value === "custom") {
      if (!customDateTime) {
        toast.error("Please choose a custom expiration date and time");
        return;
      }
      payload.expiresAt = new Date(customDateTime).toISOString();
    }

    createBroadcast(payload, {
      onSuccess: () => {
        handleReset();
        toggle();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered modal-lg" size="lg">
      <ModalHeader toggle={toggle} className="border-bottom">
        <div className="d-flex align-items-center">
          <Icon name="bell-fill" className="text-primary me-2 fs-4" />
          <span>New In-App Notification Broadcast</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <Alert color="primary" className="small mb-4">
          <Icon name="info-fill" className="me-2" />
          This sends a broadcast directly to user inboxes with automatic expiration (TTL). 1,000+ recipients will be cleanly grouped as one manageable broadcast row.
        </Alert>

        <Form onSubmit={handleSubmit}>
          <FormGroup className="mb-3">
            <Label className="form-label fw-bold">Notification Title <span className="text-danger">*</span></Label>
            <Input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Happy New Month! 🎉"
              required
            />
          </FormGroup>

          <Row className="g-3 mb-3">
            <Col sm="6">
              <FormGroup>
                <Label className="form-label fw-bold">Notification Type</Label>
                <RSelect
                  options={BROADCAST_TYPES}
                  value={type}
                  onChange={(val) => setType(val)}
                  isSearchable={false}
                />
              </FormGroup>
            </Col>
            <Col sm="6">
              <FormGroup>
                <Label className="form-label fw-bold">Target Audience</Label>
                <RSelect
                  options={TARGET_OPTIONS}
                  value={target}
                  onChange={(val) => setTarget(val)}
                  isSearchable={false}
                />
              </FormGroup>
            </Col>
          </Row>

          {target.value === "specific" && (
            <FormGroup className="mb-3">
              <Label className="form-label fw-bold">Select Specific Users <span className="text-danger">*</span></Label>
              <RASelect
                isMulti
                placeholder="Search user by name or email..."
                loadOptions={userOptions}
                onChange={(val) => setSelectedUsers(val)}
                value={selectedUsers}
              />
            </FormGroup>
          )}

          <FormGroup className="mb-3">
            <Label className="form-label fw-bold">Message Content <span className="text-danger">*</span></Label>
            <Input
              type="textarea"
              rows="4"
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the message that users will read in their notification inbox..."
              required
            />
          </FormGroup>

          {/* Duration / Expiry Section */}
          <div className="p-3 bg-light rounded border mb-4">
            <FormGroup className="mb-2">
              <Label className="form-label fw-bold">
                <Icon name="clock" className="me-1 text-primary" />
                Notification Lifetime / Duration (TTL)
              </Label>
              <RSelect
                options={EXPIRY_PRESETS}
                value={expiryPreset}
                onChange={(val) => setExpiryPreset(val)}
                isSearchable={false}
              />
            </FormGroup>

            {expiryPreset.value === "custom" && (
              <FormGroup className="mt-2 mb-1">
                <Label className="form-label small fw-medium">Pick Date & Time</Label>
                <Input
                  type="datetime-local"
                  className="form-control"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  required={expiryPreset.value === "custom"}
                />
              </FormGroup>
            )}

            <span className="text-muted small mt-2 d-block">
              {expiryPreset.value === "2" && "Notification will stay visible in client apps for 48 hours, then automatically disappear."}
              {expiryPreset.value === "3" && "Notification will stay visible in client apps for 72 hours, then automatically disappear."}
              {expiryPreset.value === "7" && "Notification will stay visible in client apps for 7 days, then automatically disappear."}
              {expiryPreset.value === "never" && "Notification will remain permanently visible until manually deleted."}
            </span>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button color="secondary" type="button" onClick={toggle} disabled={isLoading}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Broadcasting..." : "Send In-App Notification"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default CreateBroadcastModal;
