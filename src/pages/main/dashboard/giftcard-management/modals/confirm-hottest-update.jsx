import { useEffect } from "react";
import { Modal, ModalBody, Row } from "reactstrap";
import { Button, Col, Icon } from "../../../../../components/Component";
import { useBulkUpdateHottest } from "../../../../../api/giftcard-category";

const ConfirmHottestUpdateModal = ({ modal, closeModal, selected, setShowHottestModal, categoryId }) => {
  const { mutate: bulkUpdateHottest, isSuccess: isHottestSuccess } = useBulkUpdateHottest(categoryId);

  const updateFunc = () => {
    bulkUpdateHottest({
      ids: selected,
      isHottest: modal.enable ? true : false,
    });
  };

  useEffect(() => {
    if (isHottestSuccess) {
      closeModal();
    }
  }, [isHottestSuccess]);

  const close = () => {
    setShowHottestModal({
      enable: false,
      disable: false,
    });
  };

  return (
    <>
      <Modal isOpen={modal.enable || modal.disable} toggle={close} className="modal-dialog-centered" size="md">
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

            <p>
              You are about to {modal.enable ? "enable" : modal.disable ? "disable" : ""} {selected.length} giftcard(s)
              as Hottest. Are you sure you want to proceed?
            </p>
            <div className="mt-4">
              <Row className="gy-3">
                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button onClick={updateFunc} color="primary" size="md">
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
              </Row>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ConfirmHottestUpdateModal;
