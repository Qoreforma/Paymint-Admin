import React, { useEffect } from "react";
import { Modal, ModalBody, Form } from "reactstrap";
import { Icon, Col, Button, RSelect } from "../../../../components/Component";
import { useForm, Controller } from "react-hook-form";
import { TransactionType } from "./UserData";

const AddModal = ({ modal, closeModal, onSubmit }) => {
  const {
    reset,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
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
          <h5 className="title">Finance User</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <div className="form-control-wrap">
                    <Controller
                      control={control}
                      name="type"
                      render={({ field: { onChange, value } }) => (
                        <RSelect options={TransactionType} onChange={onChange} />
                      )}
                    />
                  </div>
                </div>
              </Col>
              <Col>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    className="form-control"
                    type="number"
                    {...register("amount", { required: "This field is required" })}
                    placeholder="Enter Amount"
                  />
                  {errors.amount && <span className="invalid">{errors.amount.message}</span>}
                </div>
              </Col>

              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Remark</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("remark", { required: "This field is required" })}
                    placeholder="Remark"
                  />
                  {errors.remark && <span className="invalid">{errors.remark.message}</span>}
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
  );
};
export default AddModal;
