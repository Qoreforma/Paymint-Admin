import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useGetProductDataTypes, useGetProductTypes } from "../../../../../api/generics";
import { useCreateProduct, useCreateProviders, useGetProviders } from "../../../../../api/service-providers";
import { useGetServices } from "../../../../../api/services";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";

const AddProductModal = ({ modal, closeModal, formData, isEdit }) => {
  const { mutate: addProduct, isSuccess: added } = useCreateProduct();
  const { data: productTypes } = useGetProductTypes();
  const { data: productDataTypes } = useGetProductDataTypes();
  const { data: providers } = useGetProviders(1, 200);
  const { data: services } = useGetServices();

  // console.log(providers);

  const {
    reset,
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      provider_id: { label: "", value: "" },
      service_id: { label: "", value: "" },
      name: "",
      amount: "",
      code: "",
      type: { label: "", value: "" },
      product_type: { label: "", value: "" },
    },
  });

  const provider_options = useMemo(() => {
    if (providers) {
      return providers?.data?.map((item) => ({ label: item.name, value: item.id }));
    } else {
      return [];
    }
  }, [providers]);

  const services_options = useMemo(() => {
    if (services) {
      return services.data?.map((item) => ({ label: item.name, value: item.id }));
    } else {
      return [];
    }
  }, [services]);

  const product_types_options = useMemo(() => {
    if (productTypes) {
      return productTypes?.data?.map((item) => ({ label: item, value: item }));
    } else {
      return [];
    }
  }, [productTypes]);

  const product_data_options = useMemo(() => {
    if (productDataTypes) {
      return productDataTypes?.data?.map((item) => ({ label: item, value: item }));
    } else {
      return [];
    }
  }, [productTypes]);

  const onSubmit = (data) => {
    const dataToSend = {
      name: data.name,
      amount: data.amount,
      code: data.code,
      provider_id: data.provider_id.value,
      service_id: data.service_id.value,
      type: data.type.value,
    };

    addProduct(dataToSend?.type === "data" ? dataToSend : { ...dataToSend, product_type: data.product_type.value });
  };

  const types = watch("type");

  useEffect(() => {
    if (added) {
      closeModal();
      reset();
    }
  }, [added]);

  return (
    <Modal
      isOpen={modal}
      toggle={() => {
        closeModal();
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
              <Col md="6" className="">
                <label className="form-label">Provider </label>
                <Controller
                  control={control}
                  name="provider_id"
                  render={({ field }) => (
                    <RSelect {...field} options={provider_options} placeholder={"Select provider"} />
                  )}
                />
              </Col>
              <Col md="6" className="">
                <label className="form-label">Service </label>
                <Controller
                  control={control}
                  name="service_id"
                  render={({ field }) => (
                    <RSelect {...field} options={services_options} placeholder={"Select provider"} />
                  )}
                />
              </Col>

              <Col md={types?.value === "data" ? "6" : "12"}>
                <label className="form-label">Type</label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => <RSelect {...field} options={product_types_options} />}
                />
              </Col>

              {types?.value === "data" && (
                <Col md="6" className="">
                  <label className="form-label">Product Data Type</label>
                  <Controller
                    control={control}
                    name="product_type"
                    render={({ field }) => <RSelect {...field} options={product_data_options} />}
                  />
                </Col>
              )}

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
                    <Button color="primary" size="md" type="submit">
                      {isEdit ? "Edit" : "Create"}
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        closeModal();
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
