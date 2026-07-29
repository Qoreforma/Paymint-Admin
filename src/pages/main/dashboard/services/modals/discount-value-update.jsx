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
    const updateData = {};

    // Determine which type of discount to update based on modal state
    if (modal.regular) {
      updateData.rows = selected.map((item) => ({
        ...item,
        typeValue: e.type.value,
        discountValue: e.discountValue,
      }));
    } else if (modal.api) {
      updateData.rows = selected.map((item) => ({
        ...item,
        partnerTypeValue: e.type.value,
        partnerDiscountValue: e.discountValue,
      }));
    }

    bulkUpdateDiscount(updateData);
  };

  useEffect(() => {
    if (isSuccess) {
      closeModal();
      reset();
    }
  }, [isSuccess]);

  const close = () => {
    setEditModal({ regular: false, api: false });
    reset();
  };

  const getModalTitle = () => {
    if (modal.regular) return "Update Multiple Regular Discounts";
    if (modal.api) return "Update Multiple API Discounts";
    return "Update Multiple Discounts";
  };

  const getButtonText = () => {
    if (modal.regular) return "Update Regular Discounts";
    if (modal.api) return "Update API Discounts";
    return "Update Discounts";
  };

  return (
    <>
      <Modal isOpen={modal.regular || modal.api} toggle={close} className="modal-dialog-centered" size="md">
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
            <h5 className="title">{getModalTitle()}</h5>

            <p>You are about to update {selected?.length || 0} discount(s)</p>
            <div className="mt-4">
              <Form className="row gy-4" noValidate onSubmit={handleSubmit(submitForm)}>
                <Col md="12">
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
                    {errors.type && <span className="invalid">{errors.type.message}</span>}
                  </div>
                </Col>
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label">Discount Value</label>
                    <input
                      className="form-control"
                      placeholder={modal.regular ? "Enter Regular Discount Value" : "Enter API Discount Value"}
                      pattern="[0-9]*[.,]?[0-9]*"
                      type="text"
                      name="discountValue"
                      inputmode="decimal"
                      {...register("discountValue", { required: "This field is required" })}
                    />
                    {errors.discountValue && <span className="invalid">{errors.discountValue.message}</span>}
                  </div>
                </Col>

                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md">
                        {getButtonText()}
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
