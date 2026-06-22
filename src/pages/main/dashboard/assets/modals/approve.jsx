import React from "react";
import { Modal, ModalBody } from "reactstrap";
import { useApproveAsset } from "../../../../../api/assets";
import { Button, Col, Icon } from "../../../../../components/Component";

const ApproveModal = ({ modal, closeModal, editedId }) => {
  const { mutate: approve } = useApproveAsset(editedId);
  const [confirm, setConfirm] = React.useState(false);

  const submitForm = (e) => {
    approve();

    closeModal();
    setConfirm(false);
  };

  const close = () => {
    closeModal();
    setConfirm(false);
  };

  return (
    <>
      <Modal isOpen={modal || confirm} toggle={close} className="modal-dialog-centered" size="md">
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
                    <Button onClick={submitForm} color="primary" size="md" form="hook-form">
                      Proceed
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setConfirm(false);
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
