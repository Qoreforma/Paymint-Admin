import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useGetProductDataTypes, useGetProductTypes } from "../../../../../api/generics";
import { useCreateProviders } from "../../../../../api/service-providers";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";
import { useParams } from "react-router";

const AddProductModal = ({ modal, closeModal, formData, isEdit }) => {
  const { mutate: addProvider, isSuccess: added } = useCreateProviders();
  const { data: productTypes } = useGetProductTypes();
  const { data: productDataTypes } = useGetProductDataTypes();

  const params = useParams();
  console.log(params);

  const {
    reset,
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      provider_id: "",
      service_id: "",
      name: "",
      amount: "",
      code: "",
      type: { label: "", value: "" },
      product_type: { label: "", value: "" },
    },
  });

  const product_types_options = useMemo(() => {
    if (productTypes) {
      return productTypes?.data?.map((item) => ({ label: item, value: item }));
    } else {
      return [];
    }
  }, [productTypes]);

  console.log(productTypes);

  const product_data_options = useMemo(() => {
    if (productDataTypes) {
      return productDataTypes?.data?.map((item) => ({ label: item, value: item }));
    } else {
      return [];
    }
  }, [productTypes]);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const onSubmit = (data) => {
    console.log({ ...data, logo: uploadedImages[0] });

    addProvider({ ...data, logo: uploadedImages[0] });
  };

  const product_types = watch("product_type");

  const handleChange = (e) => {
    // const data = selectedOptions;
    const { id, checked } = e.currentTarget;
    if (checked === true) {
      setValue("product_type", [...product_types, id]);
      setValue("supported_product_types", [...product_types, id]);
      // setSelectedOptions([...selectedOptions, id]);
    } else {
      let newData = product_types.filter((item) => item !== id);
      setValue("product_type", newData);
      setValue("supported_product_types", newData);
    }
  };
  useEffect(() => {
    if (isEdit) {
      reset({
        name: formData.name,
        logo: formData.logo,
        product_type: formData.product_type,
        supported_product_types: formData.product_type,
      });
      setUploadedImages([formData.logo]);
    }
  }, [formData, reset, isEdit]);

  useEffect(() => {
    if (added) {
      closeModal();
      setUploadedImages([]);
      reset();
    }
  }, [added]);

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
          <h5 className="title">Add Product</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Col>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    {...register("name", { required: "This field is required" })}
                    placeholder="Enter Provider name"
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </Col>

              <Col md="6" className="">
                <label className="form-label">Product Type</label>
                <Controller
                  control={control}
                  name="product_type"
                  render={({ field }) => <RSelect {...field} options={product_types_options} />}
                />
              </Col>
              <Col md="6" className="">
                <label className="form-label">Product Data Type</label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => <RSelect {...field} options={product_data_options} />}
                />
              </Col>
              <Col md={6}>
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input
                    className="form-control"
                    {...register("code", { required: "This field is required" })}
                    placeholder="Enter unique name"
                  />
                  {errors.code && <span className="invalid">{errors.code.message}</span>}
                </div>
              </Col>
              <Col md={6}>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    className="form-control"
                    {...register("amount", { required: "This field is required" })}
                    placeholder="Enter Amount"
                  />
                  {errors.amount && <span className="invalid">{errors.amount.message}</span>}
                </div>
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
export default AddProductModal;
