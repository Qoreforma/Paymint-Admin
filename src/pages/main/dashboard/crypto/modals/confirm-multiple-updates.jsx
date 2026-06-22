import { useEffect } from "react";
import { Modal, ModalBody, Row } from "reactstrap";
import { Button, Col, Icon } from "../../../../../components/Component";
import { useBulkUpdatePurchaseActivation, useBulkUpdateSaleActivation } from "../../../../../api/crypto";

const ConfirmUpdateModal = ({ modal, closeModal, selected, statusType, updateType, setShowStatusModal }) => {
  const { mutate: bulkUpdatePurchase, isSuccess: isPurchaseSuccess } = useBulkUpdatePurchaseActivation();
  const { mutate: bulkUpdateSale, isSuccess: isSaleSuccess } = useBulkUpdateSaleActivation();

  const updateFunc = () => {
    console.log({ selected, statusType, updateType });

    if (statusType === "purchase") {
      bulkUpdatePurchase({
        ids: selected,
        purchaseActivated: updateType === "activate" ? true : false,
      });
    } else if (statusType === "sales") {
      bulkUpdateSale({
        ids: selected,
        saleActivated: updateType === "activate" ? true : false,
      });
    }
  };

  useEffect(() => {
    if (isPurchaseSuccess || isSaleSuccess) {
      closeModal();
    }
  }, [isPurchaseSuccess, isSaleSuccess]);

  const close = () => {
    setShowStatusModal(false);
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

            <p>
              You are about to {updateType === "activate" ? "activate" : "deactivate"}{" "}
              {statusType === "sales" ? "sales" : "purchase"} status for multiple assets. Are you sure you want to
              proceed?
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

export default ConfirmUpdateModal;
