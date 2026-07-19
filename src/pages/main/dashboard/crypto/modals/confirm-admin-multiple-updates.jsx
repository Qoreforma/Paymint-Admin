import { useEffect } from "react";
import { Modal, ModalBody, Row } from "reactstrap";
import { Button, Col, Icon } from "../../../../../components/Component";
import {
  useBulkToggleBuyPermission,
  useBulkToggleSellPermission,
  useBulkUpdatePurchaseActivation,
  useBulkUpdateSaleActivation,
} from "../../../../../api/crypto";

const ConfirmAdminUpdateModal = ({
  modal,
  closeModal,
  selected,
  statusType,
  updateType,
  setShowStatusModal,
  networkId,
}) => {
  const { mutate: bulkToggleSell, isSuccess: isSellSuccess } = useBulkToggleSellPermission(networkId);
  const { mutate: bulkToggleBuy, isSuccess: isBuySuccess } = useBulkToggleBuyPermission(networkId);

  const updateFunc = () => {
    if (statusType === "buy") {
      bulkToggleBuy({
        adminIds: selected,
        enabled: updateType === "activate" ? true : false,
      });
    } else if (statusType === "sell") {
      bulkToggleSell({
        adminIds: selected,
        enabled: updateType === "activate" ? true : false,
      });
    }
  };

  useEffect(() => {
    if (isSellSuccess || isBuySuccess) {
      closeModal();
    }
  }, [isBuySuccess, isSellSuccess]);

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
              {statusType === "sell" ? "sell" : "buy"} permission for multiple admins. Are you sure you want to proceed?
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

export default ConfirmAdminUpdateModal;
