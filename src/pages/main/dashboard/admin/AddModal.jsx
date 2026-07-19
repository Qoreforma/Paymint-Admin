import React, { useEffect, useMemo, useState } from "react";
import { Modal, ModalBody, Form } from "reactstrap";
import { Icon, Col, Button, RSelect } from "../../../../components/Component";
import { useForm } from "react-hook-form";
import { useGetRoles } from "../../../../api/users/admin";
import { capitalizeFirstLetter } from "../../../../utils/Utils";

const AddModal = ({ modal, closeModal, onSubmit, formData, setFormData, filterStatus }) => {
  const [selectedRole, setselectedRole] = useState("");

  const { data: roles, isLoading } = useGetRoles();

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //ROLE Options
  const rolesOptions = useMemo(() => {
    if (!isLoading) {
      return roles?.data?.data?.map((role) => {
        return {
          id: role._id,
          label: capitalizeFirstLetter(role.name.replace("_", " ")),
          value: role.name,
        };
      });
    }
  }, [roles, isLoading]);

  const selectRole = (e) => {
    setselectedRole(e.value);
    setFormData({ ...formData, role: e.value });
  };
  // console.log(rolesOptions);
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  return (
    <Modal
      isOpen={modal}
      toggle={() => {
        closeModal();
        setselectedRole("");
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
          <h5 className="title">Add Admin</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Firstname</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("firstname", { required: "This field is required" })}
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    placeholder="Enter firstname"
                  />
                  {errors.firstname && <span className="invalid">{errors.firstname.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Lastname</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("lastname", { required: "This field is required" })}
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    placeholder="Enter lastname"
                  />
                  {errors.lastname && <span className="invalid">{errors.lastname.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Email </label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("email", {
                      required: "This field is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "invalid email address",
                      },
                    })}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                  {errors.email && <span className="invalid">{errors.email.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Select Role</label>
                  <div className="form-control-wrap">
                    <RSelect
                      options={rolesOptions}
                      value={{
                        value: selectedRole,
                        label: capitalizeFirstLetter(selectedRole.replace("_", " ")),
                      }}
                      onChange={(e) => selectRole(e)}
                    />
                  </div>
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    type="number"
                    {...register("phone", { required: "This field is required" })}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />

                  {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                </div>
              </Col>
              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      Add admin
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        closeModal();
                        setselectedRole("");
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
