import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, Alert, Form, FormGroup, Label, Input } from "reactstrap";
import { Button, Col, Icon, Row, RSelect } from "../../../../components/Component";
import { useClearInAppNotificationsByType } from "../../../../api/inAppNotifications";
import toast from "react-hot-toast";

const TYPE_OPTIONS = [
  { value: "announcement", label: "Announcements & Broadcasts" },
  { value: "alert", label: "System Alerts" },
  { value: "transaction", label: "Transaction Notifications" },
  { value: "referral", label: "Referral Notifications" },
  { value: "system", label: "System Notices" },
];

const AGE_OPTIONS = [
  { value: 0, label: "All notifications (Regardless of date)" },
  { value: 2, label: "Older than 2 days" },
  { value: 7, label: "Older than 7 days (1 week)" },
  { value: 14, label: "Older than 14 days (2 weeks)" },
  { value: 30, label: "Older than 30 days (1 month)" },
  { value: 60, label: "Older than 60 days (2 months)" },
];

const ClearByTypeModal = ({ isOpen, toggle }) => {
  const [selectedType, setSelectedType] = useState(TYPE_OPTIONS[0]);
  const [selectedAge, setSelectedAge] = useState(AGE_OPTIONS[0]);
  const [hardDelete, setHardDelete] = useState(false);

  const { mutate: clearByType, isLoading } = useClearInAppNotificationsByType();

  const handleClear = (e) => {
    e.preventDefault();
    if (!selectedType?.value) {
      toast.error("Please select a notification type");
      return;
    }

    clearByType(
      {
        type: selectedType.value,
        olderThanDays: selectedAge.value > 0 ? selectedAge.value : undefined,
        hardDelete,
      },
      {
        onSuccess: () => {
          toggle();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered">
      <ModalHeader toggle={toggle} className="border-bottom">
        <div className="d-flex align-items-center text-danger">
          <Icon name="trash" className="fs-4 me-2" />
          <span>Clear Notifications by Category / Type</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <Alert color="danger" className="small mb-4">
          <Icon name="alert-fill" className="me-2" />
          <strong>Bulk In-App Clearance: </strong>
          This action will clear all notifications matching the chosen category across all user accounts.
        </Alert>

        <Form onSubmit={handleClear}>
          <FormGroup className="mb-3">
            <Label className="form-label fw-bold">Notification Category / Type <span className="text-danger">*</span></Label>
            <RSelect
              options={TYPE_OPTIONS}
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              isSearchable={false}
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <Label className="form-label fw-bold">Age Filter</Label>
            <RSelect
              options={AGE_OPTIONS}
              value={selectedAge}
              onChange={(val) => setSelectedAge(val)}
              isSearchable={false}
            />
            <span className="text-muted small mt-1 d-block">
              Choose whether to clear all notifications or only older notifications.
            </span>
          </FormGroup>

          <div className="p-3 bg-light rounded border mb-4">
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="clearHardDelete"
                checked={hardDelete}
                onChange={(e) => setHardDelete(e.target.checked)}
              />
              <label className="custom-control-label fw-bold text-danger cursor-pointer" htmlFor="clearHardDelete">
                Permanent Hard Purge
              </label>
            </div>
            <span className="text-muted small ps-4 d-block mt-1">
              Unchecked (Recommended): Soft-deletes the records so they disappear from client devices immediately while maintaining audit integrity.
            </span>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button color="secondary" type="button" onClick={toggle} disabled={isLoading}>
              Cancel
            </Button>
            <Button color="danger" type="submit" disabled={isLoading}>
              {isLoading ? "Clearing..." : `Clear All ${selectedType.label}`}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default ClearByTypeModal;
