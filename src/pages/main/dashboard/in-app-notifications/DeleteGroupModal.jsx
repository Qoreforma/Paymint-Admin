import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, Alert, Form, FormGroup, Label, Input } from "reactstrap";
import { Button, Icon } from "../../../../components/Component";
import { useDeleteInAppNotificationGroup } from "../../../../api/inAppNotifications";

const DeleteGroupModal = ({ isOpen, toggle, group }) => {
  const [hardDelete, setHardDelete] = useState(false);
  const { mutate: deleteGroup, isLoading } = useDeleteInAppNotificationGroup();

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!group?.groupKey) return;

    deleteGroup(
      { groupKey: group.groupKey, hardDelete },
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
          <Icon name="trash-fill" className="fs-4 me-2" />
          <span>Remove Notification for All Users</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="text-center my-3">
          <div className="avatar-circle avatar-circle-lg bg-danger-dim text-danger mx-auto mb-3" style={{ width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="alert-circle" className="fs-1" />
          </div>
          <h5 className="title mb-1">Are you sure?</h5>
          <p className="text-muted">
            You are about to delete <strong>"{group?.title || "Notification"}"</strong> from all{" "}
            <strong className="text-dark">{(group?.recipientCount || 0).toLocaleString()} recipient inboxes</strong>.
          </p>
        </div>

        <Alert color="warning" className="small mb-3">
          <Icon name="info-fill" className="me-2" />
          Mobile apps and web users will immediately stop seeing this notification in their notifications center.
        </Alert>

        <Form onSubmit={handleConfirm}>
          <div className="p-3 bg-light rounded border mb-4">
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="hardDeleteOption"
                checked={hardDelete}
                onChange={(e) => setHardDelete(e.target.checked)}
              />
              <label className="custom-control-label fw-bold text-danger cursor-pointer" htmlFor="hardDeleteOption">
                Permanent Hard Delete (Purge from database)
              </label>
            </div>
            <span className="text-muted small ps-4 d-block mt-1">
              Unchecked (Recommended): Soft-deletes the records so they vanish from client apps while preserving audit history.
            </span>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button color="secondary" type="button" onClick={toggle} disabled={isLoading}>
              Cancel
            </Button>
            <Button color="danger" type="submit" disabled={isLoading}>
              {isLoading ? "Removing..." : `Delete for All ${(group?.recipientCount || 0).toLocaleString()} Users`}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default DeleteGroupModal;
