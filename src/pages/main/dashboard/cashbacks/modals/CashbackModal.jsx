import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useCreateCashback, useUpdateCashback, useGetServiceTypes } from "../../../../../api/service-providers";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";

const CashbackModal = ({ modal, closeModal, formData, isEdit }) => {
  const { mutate: createCashback, isLoading: isCreating } = useCreateCashback();
  const { mutate: updateCashback, isLoading: isUpdating } = useUpdateCashback();

  const { data: serviceTypes } = useGetServiceTypes(1, 200);

  const {
    reset,
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serviceTypeId: null,
      type: { label: "Flat", value: "flat" },
      value: "",
    },
  });

  useEffect(() => {
    if (isEdit && formData) {
      reset({
        serviceTypeId: formData.serviceTypeId
          ? {
              label: formData.serviceTypeId.name || formData.serviceTypeId,
              value: formData.serviceTypeId._id || formData.serviceTypeId,
            }
          : null,
        type: formData.type
          ? { label: formData.type === "percentage" ? "Percentage" : "Flat", value: formData.type }
          : { label: "Flat", value: "flat" },
        value: formData.value !== undefined && formData.value !== null ? formData.value : "",
      });
    } else {
      reset({
        serviceTypeId: null,
        type: { label: "Flat", value: "flat" },
        value: "",
      });
    }
  }, [formData, isEdit, modal, reset]);

  const serviceTypes_options = useMemo(() => {
    if (serviceTypes) {
      return serviceTypes.data?.map((item) => ({ label: item.name, value: item._id || item.id }));
    }
    return [];
  }, [serviceTypes]);

  const type_options = [
    { label: "Flat", value: "flat" },
    { label: "Percentage", value: "percentage" },
  ];

  const onSubmit = (data) => {
    const payload = {
      type: data.type.value,
      value: Number(data.value),
    };
    if (data.serviceTypeId?.value) payload.serviceTypeId = data.serviceTypeId.value;

    if (isEdit) {
      updateCashback(
        { id: formData._id, values: payload },
        {
          onSuccess: () => {
            closeModal();
            reset();
          },
        }
      );
    } else {
      createCashback(payload, {
        onSuccess: () => {
          closeModal();
          reset();
        },
      });
    }
  };

  return (
    <Modal isOpen={modal} toggle={closeModal} className="modal-dialog-centered" size="md">
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
          <h5 className="title">{isEdit ? "Edit Cashback Rule" : "Add Cashback Rule"}</h5>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>

              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <Controller
                    control={control}
                    name="serviceTypeId"
                    render={({ field: { onChange, value } }) => (
                      <RSelect
                        options={serviceTypes_options}
                        value={value}
                        onChange={onChange}
                        placeholder="Select Service Type..."
                        isClearable
                      />
                    )}
                  />
                </div>
              </Col>

              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <Controller
                    control={control}
                    name="type"
                    rules={{ required: "Type is required" }}
                    render={({ field: { onChange, value } }) => (
                      <RSelect
                        options={type_options}
                        value={value}
                        onChange={onChange}
                        placeholder="Select Type..."
                      />
                    )}
                  />
                  {errors.type && <span className="invalid">{errors.type.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Value</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="Enter value"
                    {...register("value", { required: "Value is required" })}
                  />
                  {errors.value && <span className="invalid">{errors.value.message}</span>}
                </div>
              </Col>
              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {isEdit ? "Update Rule" : "Add Rule"}
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

export default CashbackModal;
