import React, { useEffect, useMemo } from "react";
import { Modal, ModalBody, Form } from "reactstrap";
import { Icon, Col, Button, RSelect } from "../../../../components/Component";
import { useForm } from "react-hook-form";
import { useGetUserType } from "../../../../api/users/user";

const UserTypeModal = ({ modal, closeModal, onSubmit, formData, setFormData, filterStatus }) => {
  const { isLoading, data } = useGetUserType();

  //   console.log(data);
  const options = useMemo(() => {
    if (data) {
      return data.data.map((item) => ({ label: item, value: item }));
    } else {
      return [];
    }
  }, [data]);
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    reset(formData);
  }, [formData]);
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
          <h5 className="title">Update User Type</h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">User Type</label>
                  <div className="form-control-wrap">
                    <RSelect
                      options={options}
                      value={{
                        value: formData.type,
                        label: formData.type,
                      }}
                      onChange={(e) => setFormData({ ...formData, type: e.value })}
                    />
                  </div>
                </div>
              </Col>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Referral Earning Rate</label>
                  <div className="form-control-wrap">
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={formData.referral_earning_rate}
                      {...register("referral_earning_rate", {
                        required: "This field is required",
                      })}
                    />
                    {errors.referral_earning_rate && (
                      <span className="invalid">{errors.referral_earning_rate.message}</span>
                    )}
                  </div>
                </div>
              </Col>
              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      Update User Type
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
export default UserTypeModal;
