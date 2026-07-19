import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useReverseTransaction } from "../../../../../api/transactions";
import { Button, Col, Icon } from "../../../../../components/Component";
import { useState } from "react";

const ReverseModal = ({ modal, closeModal, editedId }) => {
  const { mutate: reverse } = useReverseTransaction(editedId);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    reset();
  }, [reset]);

  //submit function
  const onSubmit = (submitData) => {
    reverse({ reason: submitData.reason });
    reset();
    closeModal();
  };

  return (
    <>
      <Modal
        isOpen={modal}
        toggle={() => {
          reset();
          closeModal();
        }}
        className="modal-dialog-centered"
        size="lg"
      >
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              closeModal();
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Reverse Transaction</h5>
            <div className="mt-4">
              <Form className="row gy-4" noValidate onSubmit={handleSubmit(onSubmit)}>
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label">Reversal Reason</label>
                    <textarea
                      className="form-control"
                      {...register("reason", { required: "This field is required" })}
                      placeholder="Give a reason for reversing this transaction"
                    />
                    {errors.reason && <span className="invalid">{errors.reason.message}</span>}
                  </div>
                </Col>

                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md" type="submit">
                        Proceed
                      </Button>
                    </li>
                    <li>
                      <a
                        href="#cancel"
                        onClick={(ev) => {
                          ev.preventDefault();
                          reset();
                          closeModal();
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

export default ReverseModal;
