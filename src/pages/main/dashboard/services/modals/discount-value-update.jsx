import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";

const commissionType = [
  { label: "Flat", value: "flat" },
  { label: "Percentage", value: "percentage" },
];

const MultipleDiscountValueModal = ({ modal, closeModal, selected, setEditModal, isSuccess, bulkUpdateDiscount }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const submitForm = (e) => {
    const dataToSend = {
      ids: selected,
      data: {
        type: e.type.value,
        value: e.value,
      },
    };

    bulkUpdateDiscount(dataToSend);
  };

  useEffect(() => {
    if (isSuccess) {
      closeModal();
      reset();
    }
  }, [isSuccess]);

  const close = () => {
    setEditModal(false);
    reset();
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

            <p>You are about to update multiple discount</p>
            <div className="mt-4">
              <Form className="row gy-4" noValidate onSubmit={handleSubmit(submitForm)}>
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <div className="form-control-wrap">
                      <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => (
                          <RSelect options={commissionType} value={value} onChange={onChange} />
                        )}
                      />
                    </div>
                  </div>
                </Col>
                {errors.type && <span className="invalid">{errors.type.message}</span>}
                <Col lg="6">
                  <div className="form-group">
                    <label className="form-label">Discount Value</label>
                    <input
                      className="form-control"
                      type="number"
                      {...register("value", { required: "This field is required" })}
                      placeholder="value"
                    />
                    {errors.value && <span className="invalid">{errors.value.message}</span>}
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

export default MultipleDiscountValueModal;
