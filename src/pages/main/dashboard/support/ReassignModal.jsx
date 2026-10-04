import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, FormGroup, Label, Input } from "reactstrap";
import { Button, Icon } from "../../../../components/Component";
import { useGetAdmins, useReassignTicket } from "../../../../api/support";

const ReassignModal = ({ isOpen, toggle, ticket }) => {
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const { data: adminsRes, isLoading: loadingAdmins } = useGetAdmins();
  const { mutate: reassignTicket, isLoading: isReassigning } = useReassignTicket();

  const admins = adminsRes?.data?.admins || adminsRes?.data || [];

  const handleReassign = () => {
    if (!selectedAdminId) return;
    const targetAdmin = admins.find(
      (a) => (a._id || a.id) === selectedAdminId
    );
    const newAdminName = targetAdmin?.fullName || targetAdmin?.name || "Support Agent";

    reassignTicket(
      {
        ticketId: ticket._id || ticket.id,
        newAdminId: selectedAdminId,
        newAdminName,
      },
      {
        onSuccess: () => {
          toggle();
          setSelectedAdminId("");
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered">
      <ModalHeader toggle={toggle}>
        <span>Reassign Ticket #{ticket?.ticketNumber || ticket?._id?.substring(0, 8)}</span>
      </ModalHeader>
      <ModalBody>
        <p className="text-soft mb-3" style={{ fontSize: "0.88rem" }}>
          Transfer this active support session to another agent. The new agent will receive full chat history and ticket context.
        </p>

        <FormGroup>
          <Label for="adminSelect" className="form-label font-weight-bold">
            Select Target Agent
          </Label>
          <Input
            type="select"
            id="adminSelect"
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            disabled={loadingAdmins}
          >
            <option value="">-- Choose an Agent --</option>
            {admins.map((admin) => (
              <option key={admin._id || admin.id} value={admin._id || admin.id}>
                {admin.fullName || admin.email} ({admin.adminLevel || "agent"})
              </option>
            ))}
          </Input>
        </FormGroup>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button color="light" size="sm" onClick={toggle}>
            Cancel
          </Button>
          <Button
            color="primary"
            size="sm"
            onClick={handleReassign}
            disabled={!selectedAdminId || isReassigning}
          >
            {isReassigning ? (
              <span>Transferring...</span>
            ) : (
              <>
                <Icon name="swap" className="me-1" />
                <span>Confirm Transfer</span>
              </>
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ReassignModal;
