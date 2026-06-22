import { Form, Modal, ModalBody } from "reactstrap";
import { Col, Icon, Row } from "../../../../components/Component";
import { useToggleProviderServiceType } from "../../../../api/service-providers";
import { useEffect, useState } from "react";

const EditProductTypes = ({ modal, closeModal, formData }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [serviceTypes, setServiceTypes] = useState([]);

  const { mutateAsync, isPending, isError, error } = useToggleProviderServiceType();

  const handleChange = async (serviceType) => {
    setErrorMessage("");
    try {
      await mutateAsync({
        providerId: formData.id,
        serviceTypeId: serviceType._id,
        data: {
          isActive: !serviceType.isActiveProvider,
        },
      });

      // Update UI
      setServiceTypes((prev) =>
        prev.map((item) =>
          item._id === serviceType._id ? { ...item, isActiveProvider: !item.isActiveProvider } : item,
        ),
      );
    } catch (err) {
      console.error("Error in mutation:", err);
      setErrorMessage(err.message);
    }
  };

  useEffect(() => {
    setServiceTypes(formData?.product_type || []);
  }, [formData]);

  useEffect(() => {
    if (isError) {
      setErrorMessage(error?.message);
    } else {
      setErrorMessage("");
    }
  }, [isError, error]);

  console.log({ serviceTypes });

  return (
    <Modal
      isOpen={modal}
      toggle={() => {
        closeModal();
        setErrorMessage("");
      }}
      className="modal-dialog-centered"
      size="lg"
    >
      <ModalBody>
        <a
          href="#cancel"
          disabled={isPending}
          onClick={(ev) => {
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Update {formData.name} Active Service Types</h5>
          <div className="mt-4">
            <Form className="row gy-4">
              <Col md="12" className="">
                <h2 className="text-primary fw-bold fs-16px">Service Types</h2>
                {errorMessage && <span className="text-danger">{errorMessage}</span>}
                <Row className="g-2 align-center mt-1">
                  {serviceTypes.length ? (
                    serviceTypes.map((item, idx) => (
                      <Col key={idx} size="4">
                        <div className="custom-control custom-control-sm custom-checkbox">
                          <input
                            disabled={isPending}
                            type="checkbox"
                            className="custom-control-input"
                            checked={item.isActiveProvider}
                            id={item._id}
                            onChange={() => handleChange(item)}
                          />
                          <label className="custom-control-label" htmlFor={item._id}>
                            <span className="text-secondary fs-14px text-capitalize">{item.name}</span>
                          </label>
                        </div>
                      </Col>
                    ))
                  ) : (
                    <p>No Services Available</p>
                  )}
                </Row>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default EditProductTypes;
