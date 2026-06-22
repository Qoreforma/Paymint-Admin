import React, { useEffect, useState } from "react";
import { Modal, ModalBody, Form } from "reactstrap";
import { Icon, Col, Button } from "../../../../../components/Component";
import { useForm } from "react-hook-form";

const PasswordModal = ({ modal, closeModal, onSubmit, formData, setFormData }) => {
  const [passState, setPassState] = useState(false);

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
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="md">
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
          <h5 className="title">Update Password</h5>
          <div className="mt-4">
            <Form className="row gy-2" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <label className="form-label">Old password</label>
                <div className="form-control-wrap">
                  <a
                    href="#password"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setPassState(!passState);
                    }}
                    className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                  >
                    <Icon name="eye" className="passcode-icon icon-show"></Icon>

                    <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                  </a>

                  <input
                    type={passState ? "text" : "password"}
                    {...register("oldPassword", { required: "This field is required" })}
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                    placeholder="Old password"
                    className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                  />
                  {errors.oldPassword && <span className="invalid">{errors.oldPassword.message}</span>}
                </div>
              </Col>
              <Col md="12">
                <label className="form-label">New password</label>
                <div className="form-control-wrap">
                  <a
                    href="#password"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setPassState(!passState);
                    }}
                    className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                  >
                    <Icon name="eye" className="passcode-icon icon-show"></Icon>

                    <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                  </a>

                  <input
                    type={passState ? "text" : "password"}
                    {...register("newPassword", { required: "This field is required" })}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="New password"
                    className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                  />
                  {errors.newPassword && <span className="invalid">{errors.newPassword.message}</span>}
                </div>
              </Col>

              <Col md="12">
                <label className="form-label">Confirm new password</label>
                <div className="form-control-wrap">
                  <a
                    href="#password"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setPassState(!passState);
                    }}
                    className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                  >
                    <Icon name="eye" className="passcode-icon icon-show"></Icon>

                    <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                  </a>

                  <input
                    type={passState ? "text" : "password"}
                    {...register("confirmNewPassword", { required: "This field is required" })}
                    value={formData.confirmNewPassword}
                    placeholder="Confirm new password"
                    onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                    className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                  />
                  {errors.confirmNewPassword && <span className="invalid">{errors.confirmNewPassword.message}</span>}
                </div>
              </Col>

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      Update Password
                    </Button>
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
export default PasswordModal;
