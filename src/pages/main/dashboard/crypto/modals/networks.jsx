import { useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useCreateCryptoNetwork, useEditCryptoNetwork } from "../../../../../api/crypto";
import { Button, Col, Icon } from "../../../../../components/Component";
import { useEffect } from "react";

const NetworkModal = ({ modal, closeModal, formData, setFormData }) => {
  const { mutate: createNetwork, isSuccess: created } = useCreateCryptoNetwork();
  const { mutate: editNetwork, isSuccess } = useEditCryptoNetwork(formData.id);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitForm = (e) => {
    const dataToSubmit = {
      name: formData?.name,
      platformDepositAddress: formData?.walletAddress,
      code: formData?.code,
    };

    console.log({ dataToSubmit });
    if (!formData?.id) {
      createNetwork(dataToSubmit);
    } else {
      editNetwork(dataToSubmit);
    }
  };

  const close = () => {
    closeModal();
    setIconImage([]);
    setRejectedFile([]);
  };

  useEffect(() => {
    if (isSuccess || created) {
      closeModal();
    }
  }, [isSuccess, created]);

  return (
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
          <h5 className="title">{formData?.id ? "Edit" : "Add"} Network</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(submitForm)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    type="text"
                    value={formData?.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </Col>

              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input
                    className="form-control"
                    type="text"
                    value={formData?.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Enter code"
                  />
                  {errors.code && <span className="invalid">{errors.code.message}</span>}
                </div>
              </Col>

              <Col>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-default-textarea">
                    Wallet Address
                  </label>
                  <div className="form-control-wrap">
                    <textarea
                      className="form-control form-control-sm"
                      id="cf-default-textarea"
                      value={formData?.walletAddress}
                      onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                      placeholder="Enter Wallet Address"
                    />
                  </div>
                </div>
              </Col>

              {/* <Col>
                <label className="form-label">Select Admin</label>
                <RSelect
                  isMulti
                  options={adminOptions}
                  value={formData?.admins}
                  placeholder={"Select Users"}
                  onChange={(e) => setFormData({ ...formData, admins: e })}
                />
              </Col>

              <Col>
                <label className="form-label">Select Trade Type</label>
                <RSelect
                  options={typeOptions}
                  value={formData?.type}
                  placeholder={"Select Type"}
                  onChange={(e) => setFormData({ ...formData, type: e })}
                />
              </Col> */}

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {formData?.id ? "Edit" : "Add"} Network
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
  );
};

export default NetworkModal;
