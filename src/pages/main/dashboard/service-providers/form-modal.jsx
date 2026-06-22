import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useGetProductTypes } from "../../../../api/generics";
import { useCreateProviders, useGetServiceTypes, useUpdateProviders } from "../../../../api/service-providers";
import { Button, Col, Icon, Row } from "../../../../components/Component";
import ImageKitDropZone from "../../../components/dropzone";

const ServiceProviderModal = ({ modal, closeModal, formData, isEdit }) => {
  const { mutate: addProvider, isSuccess: added } = useCreateProviders();
  const { mutate: updateProvider, isSuccess: edited } = useUpdateProviders(formData.id);
  const { isLoading, data: serviceTypes } = useGetServiceTypes();

  const {
    reset,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      logo: "",
      product_type: [],
    },
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const onSubmit = (data) => {
    console.log({ name: data.name, serviceTypes: data.product_type, logo: uploadedImages[0] });

    if (isEdit) {
      updateProvider({ name: data.name, serviceTypes: data.product_type, logo: uploadedImages[0] });
    } else {
      addProvider({ name: data.name, serviceTypes: data.product_type, logo: uploadedImages[0] });
    }
  };

  const product_types = watch("product_type");
  console.log({ product_types });

  const handleChange = (e) => {
    const { id, checked } = e.currentTarget;
    if (checked === true) {
      setValue("product_type", [...product_types, id]);
    } else {
      let newData = product_types.filter((item) => item !== id);
      setValue("product_type", newData);
    }
  };
  useEffect(() => {
    if (isEdit) {
      reset({
        name: formData.name,
        logo: formData.logo,
        product_type: formData.product_type.map((item) => item._id),
      });
      setUploadedImages([formData.logo]);
    }
  }, [formData, reset, isEdit]);

  useEffect(() => {
    if (added || edited) {
      closeModal();
      setUploadedImages([]);
      reset();
    }
  }, [added, edited]);

  return (
    <Modal
      isOpen={modal}
      toggle={() => {
        closeModal();
        setUploadedImages([]);
        reset();
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
          <h5 className="title">{isEdit ? "Edit" : "Add"} Service Provider</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Col>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    {...register("name", { required: "This field is required" })}
                    placeholder="Enter Provider name"
                    disabled={isEdit}
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </Col>

              <Col>
                <div>
                  <label className="form-label">Logo </label>
                  <ImageKitDropZone
                    value={uploadedImages}
                    setValues={setUploadedImages}
                    setLoading={setUploadingImages}
                    multiple={false}
                  />
                </div>
              </Col>
              <Col md="12" className="">
                <span className="text-primary fw-bold fs-16px">Service Types</span>
                <Row className="g-2 align-center mt-1">
                  {serviceTypes?.data?.map((item, idx) => (
                    <Col key={idx} size="4">
                      <div key={item?._id} className="custom-control custom-control-sm custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          checked={product_types && product_types.includes(item?._id)} //returns true if it's in the array
                          id={item?._id}
                          onChange={(e) => handleChange(e)}
                        />
                        <label className="custom-control-label" htmlFor={item?._id}>
                          <span className="text-secondary fs-14px text-capitalize">{item?.name}</span>
                        </label>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit" disabled={uploadingImages}>
                      {isEdit ? "Edit" : "Create"}
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        closeModal();
                        setUploadedImages([]);
                        reset();
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
export default ServiceProviderModal;
