import React, { useEffect } from "react";
import { Modal, ModalBody, Form } from "reactstrap";
import { Icon, Col, Button } from "../../../../../components/Component";
import { useForm } from "react-hook-form";

const TwoFactorModal = ({ modal, closeModal, onSubmit, formData, setFormData }) => {
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="sm">
      <ModalBody className="bg-white rounded">
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
          <h5 className="title">Pin</h5>
          <div className="mt-4">
            <Form className="row gy-2" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label"> Enter Pin</label>
                  <input
                    className="form-control"
                    type="number"
                    {...register("pin", {
                      required: "This field is required",
                    })}
                    defaultValue={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="Enter Pin"
                    maxLength={6}
                  />
                  {errors.pin && <span className="invalid">{errors.pin.message}</span>}
                </div>
              </Col>

              <Col size="12">
                <ul className="align-center justify-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <Button color="primary" type="submit">
                    Proceed
                  </Button>
                  <li></li>
                </ul>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default TwoFactorModal;
