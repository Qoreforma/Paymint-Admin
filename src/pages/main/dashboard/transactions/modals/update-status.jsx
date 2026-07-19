import React from "react";
import { Modal, ModalBody } from "reactstrap";
import { useUpdateTransaction } from "../../../../../api/transactions";
import { Button, Col, Icon } from "../../../../../components/Component";

const UpdateStatusModal = ({ modal, closeModal, editedId, status }) => {
  const { mutate: updateTransaction } = useUpdateTransaction(editedId, status);

  const submitForm = () => {
    updateTransaction();

    closeModal();
  };

  const close = () => {
    closeModal();
  };

  return (
    <>
      <Modal isOpen={modal} toggle={close} className="modal-dialog-centered" size="md">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              close();
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title"> Confirm</h5>

            <p>Are you sure you want to mark this transaction as {status}?</p>
            <div className="mt-4">
              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" onClick={() => submitForm()}>
                      Proceed
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        close();
                      }}
                      className="link link-light"
                    >
                      Cancel
                    </a>
                  </li>
                </ul>
              </Col>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default UpdateStatusModal;
