import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, FormGroup, Label, Input } from "reactstrap";
import { Button, Icon } from "../../../../components/Component";
import { useResolveTicket } from "../../../../api/support";

const ResolveModal = ({ isOpen, toggle, ticket }) => {
  const [resolutionNote, setResolutionNote] = useState("");
  const { mutate: resolveTicket, isLoading: isResolving } = useResolveTicket();

  const handleResolve = () => {
    resolveTicket(
      {
        ticketId: ticket._id || ticket.id,
        note: resolutionNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          toggle();
          setResolutionNote("");
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered">
      <ModalHeader toggle={toggle}>
        <span>Resolve Ticket #{ticket?.ticketNumber || ticket?._id?.substring(0, 8)}</span>
      </ModalHeader>
      <ModalBody>
        <div className="alert alert-success d-flex align-items-center mb-3 py-2 px-3">
          <Icon name="check-circle" className="me-2 fs-4" />
          <div style={{ fontSize: "0.85rem" }}>
            Marking this ticket as <strong>Resolved</strong> notifies the customer and stops the SLA timer.
          </div>
        </div>

        <FormGroup>
          <Label for="resolutionNote" className="form-label">
            Internal Resolution Notes (Optional)
          </Label>
          <Input
            type="textarea"
            rows="3"
            id="resolutionNote"
            placeholder="e.g. Manually verified VTU provider logs, re-queried transaction ref #PMT-..., customer verified airtime delivered."
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
          />
        </FormGroup>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button color="light" size="sm" onClick={toggle}>
            Cancel
          </Button>
          <Button
            color="success"
            size="sm"
            onClick={handleResolve}
            disabled={isResolving}
          >
            {isResolving ? (
              <span>Resolving...</span>
            ) : (
              <>
                <Icon name="check" className="me-1" />
                <span>Mark Resolved</span>
              </>
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ResolveModal;
