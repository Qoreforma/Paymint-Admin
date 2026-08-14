import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useBulkUpdateCashback } from "../../../../../api/service-providers";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";
import toast from "react-hot-toast";

const statusOptions = [
  { label: "Keep Unchanged", value: "unchanged" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const typeOptions = [
  { label: "Keep Unchanged", value: "unchanged" },
  { label: "Flat", value: "flat" },
  { label: "Percentage", value: "percentage" },
];

const BulkCashbackModal = ({ modal, closeModal, selected, onComplete }) => {
  const { mutate: bulkUpdate, isLoading } = useBulkUpdateCashback();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: { label: "Keep Unchanged", value: "unchanged" },
      type: { label: "Keep Unchanged", value: "unchanged" },
      value: "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = (formData) => {
    const data = {};

    if (formData.status?.value === "active") {
      data.active = true;
    } else if (formData.status?.value === "inactive") {
      data.active = false;
    }

    if (formData.type?.value && formData.type.value !== "unchanged") {
      data.type = formData.type.value;
      if (formData.value === "" || formData.value === undefined || formData.value === null) {
        toast.error("Please provide a value when updating cashback type");
        return;
      }
      data.value = Number(formData.value);
    } else if (formData.value !== "" && formData.value !== undefined && formData.value !== null) {
      data.value = Number(formData.value);
    }

    if (Object.keys(data).length === 0) {
      toast.error("Please specify at least one field (status, type, or value) to update");
      return;
    }

    bulkUpdate(
      { ids: selected, data },
      {
        onSuccess: () => {
          closeModal();
          reset();
          if (onComplete) onComplete();
        },
      }
    );
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
          <h5 className="title">Bulk Update Cashback Rules</h5>
          <p className="text-muted">
            Updating <strong>{selected?.length || 0}</strong> selected cashback rule{selected?.length > 1 ? "s" : ""}.
          </p>
          <div className="mt-4">
            <Form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field: { onChange, value } }) => (
                      <RSelect options={statusOptions} value={value} onChange={onChange} />
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
                    render={({ field: { onChange, value } }) => (
                      <RSelect options={typeOptions} value={value} onChange={onChange} />
                    )}
                  />
                </div>
              </Col>

              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Value</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    className="form-control"
                    placeholder="Enter value"
                    disabled={selectedType?.value === "unchanged" && false}
                    {...register("value")}
                  />
                  <small className="text-muted">
                    {selectedType?.value === "percentage" ? "Enter % value" : "Enter flat amount (NGN)"}
                  </small>
                </div>
              </Col>

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Selected"}
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

export default BulkCashbackModal;
