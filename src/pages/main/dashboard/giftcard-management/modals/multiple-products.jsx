import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useBulkUpdateGiftcardProduct } from "../../../../../api/giftcard-category";
import { Button, Col, Icon } from "../../../../../components/Component";

const MultipleRateModal = ({ modal, closeModal, editedId, selected }) => {
  const { mutate: bulkUpdate, isSuccess } = useBulkUpdateGiftcardProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { sell_rate: "" } });

  const submitForm = (data) => {
    const dataToSend = {
      ids: selected,
      sellRate: data?.sell_rate,
    };

    bulkUpdate(dataToSend);

    closeModal();
    reset({});
  };

  useEffect(() => {
    if (isSuccess) {
      closeModal();
    }
  }, [isSuccess]);

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

            <p>You are about to update giftcard rate for multiple products. Are you sure you want to proceed?</p>
            <div className="mt-4">
              <Form className="row gy-4" noValidate onSubmit={handleSubmit(submitForm)}>
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label">New Rate</label>
                    <input
                      className="form-control"
                      type="text"
                      {...register("sell_rate", { required: "This field is required" })}
                      placeholder="Enter new rate"
                    />
                    {errors.name && <span className="invalid">{errors.name.message}</span>}
                  </div>
                </Col>
                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md">
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
              </Form>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default MultipleRateModal;
