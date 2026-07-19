import React from "react";
import { Modal, ModalBody } from "reactstrap";
import { useApproveGiftcard } from "../../../../../api/giftcard";
import { Button, Col, Icon } from "../../../../../components/Component";

const ApproveModal = ({ modal, closeModal, editedId }) => {
  const { mutate: approve } = useApproveGiftcard(editedId);

  const submitForm = () => {
    approve();

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

            <p>Are you sure you want to approve this transaction?</p>
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

export default ApproveModal;
