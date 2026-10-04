import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, FormGroup, Label, Input } from "reactstrap";
import { Button, Icon } from "../../../../components/Component";
import { useCloseTicket } from "../../../../api/support";

const CloseModal = ({ isOpen, toggle, ticket }) => {
  const [reason, setReason] = useState("admin_closed");
  const { mutate: closeTicket, isLoading: isClosing } = useCloseTicket();

  const handleClose = () => {
    closeTicket(
      {
        ticketId: ticket._id || ticket.id,
        reason,
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
      <ModalHeader toggle={toggle}>
        <span>Close Ticket #{ticket?.ticketNumber || ticket?._id?.substring(0, 8)}</span>
      </ModalHeader>
      <ModalBody>
        <p className="text-soft mb-3" style={{ fontSize: "0.88rem" }}>
          Closing a ticket ends the conversation session. The customer will be prompted to open a new ticket if they have further questions.
        </p>

        <FormGroup>
          <Label for="closeReason" className="form-label font-weight-bold">
            Closure Reason
          </Label>
          <Input
            type="select"
            id="closeReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="resolved">Issue Fully Resolved</option>
            <option value="admin_closed">Admin Closed</option>
            <option value="customer_abandoned">Customer Unresponsive / Inactive</option>
            <option value="duplicate">Duplicate Request</option>
            <option value="spam">Spam / Inappropriate Inquiry</option>
          </Input>
        </FormGroup>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button color="light" size="sm" onClick={toggle}>
            Cancel
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={handleClose}
            disabled={isClosing}
          >
            {isClosing ? (
              <span>Closing...</span>
            ) : (
              <>
                <Icon name="cross-circle" className="me-1" />
                <span>Close Ticket</span>
              </>
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CloseModal;
