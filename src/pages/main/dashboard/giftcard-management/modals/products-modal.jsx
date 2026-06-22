import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useGetCountries } from "../../../../../api/generics";
import {
  useCreateGiftcardProduct,
  useEditGiftcardProduct,
  useGetGiftcardCategories,
} from "../../../../../api/giftcard-category";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";

const commissionType = [
  { label: "Flat", value: "flat" },
  { label: "Percentage", value: "percentage" },
];

const GiftcardProductModal = ({ modal, closeModal, formData, setFormData }) => {
  const { mutate: createProduct, isSuccess: created } = useCreateGiftcardProduct();
  const { mutate: editProduct, isSuccess: edited } = useEditGiftcardProduct();
  const { isLoading, data: categories } = useGetGiftcardCategories(1, 300);

  const { isLoading: loadingCountries, data: countries } = useGetCountries(1, 250, "active");

  const {
    reset,
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();

  const submitForm = (e) => {
    const dataToSubmit = {
      categoryId: e?.category?.id,
      countryId: e?.country?.id,
      name: e?.name,
      sellRate: e?.sellRate,
      sellMinAmount: e?.sellMin,
      sellMaxAmount: e?.sellMax,
      commissionType: e.commission_type.value,
      commisionValue: e.commission,
    };

    if (!formData?.id) {
      createProduct(dataToSubmit);
    } else {
      editProduct({ editedId: formData.id, data: dataToSubmit });
    }
    close();
  };

  const category = watch("category");
  console.log({ category });

  const countriesOptions = useMemo(() => {
    if (!isLoading && categories && countries) {
      if (category?.id) {
        const catCountries = categories?.data?.find((item) => item?._id === category?.id)?.countries;
        console.log({ catCountries });
        return catCountries?.map((item) => ({
          id: item._id,
          label: item.name,
          value: item.name,
        }));
      } else {
        return countries?.map((item) => ({
          id: item._id,
          label: item.name,
          value: item.name,
        }));
      }
    }
  }, [isLoading, countries, category, categories]);

  const categoriesOptions = useMemo(() => {
    if (!isLoading && categories) {
      return categories?.data.map((item) => ({
        id: item._id,
        label: item.name,
        value: item.name,
      }));
    }
  }, [isLoading, categories]);

  const close = () => {
    reset({});
    closeModal();
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  useEffect(() => {
    if (created || edited) {
      close();
    }
  }, [created, edited]);

  //api function to upload images
  //   const { isLoading: isUploading, mutate: upload, isSuccess: uploaded } = useUploadImages(onImageUpload);

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
          <h5 className="title">{formData?.id ? "Edit" : "Add"} Giftcard Product</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(submitForm)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("name", { required: "This field is required" })}
                    placeholder="Enter name"
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </Col>
              <Col>
                <label className="form-label">Giftcard Category</label>

                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, value } }) => (
                    <RSelect
                      options={categoriesOptions}
                      value={value}
                      placeholder={"Select Category"}
                      onChange={onChange}
                    />
                  )}
                />

                {errors.category && <span className="invalid">{errors.category.message}</span>}
              </Col>

              <Col lg={12}>
                <label className="form-label">Select Countries</label>

                <Controller
                  control={control}
                  name="country"
                  render={({ field: { onChange, value } }) => (
                    <RSelect
                      options={countriesOptions}
                      placeholder={"Select Countries"}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.country && <span className="invalid">{errors.country.message}</span>}
              </Col>
              <Col lg="4">
                <div className="form-group">
                  <label className="form-label">Sell Rate (&#8358;)</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("sellRate", { required: "This field is required" })}
                    placeholder="Sell Rate"
                  />
                  {errors.sellRate && <span className="invalid">{errors.sellRate.message}</span>}
                </div>
              </Col>
              <Col lg="4">
                <div className="form-group">
                  <label className="form-label">Sell Min Amount (&#8358;)</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("sellMin", { required: "This field is required" })}
                    placeholder="Sell Min Amount"
                  />
                  {errors.sellMin && <span className="invalid">{errors.sellMin.message}</span>}
                </div>
              </Col>
              <Col lg="4">
                <div className="form-group">
                  <label className="form-label">Sell Max Amount (&#8358;)</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("sellMax", { required: "This field is required" })}
                    placeholder="Sell Max Amount"
                  />
                  {errors.nasellMaxme && <span className="invalid">{errors.sellMax.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Commission Type</label>
                  <div className="form-control-wrap">
                    <Controller
                      control={control}
                      name="commission_type"
                      render={({ field: { onChange, value } }) => (
                        <RSelect options={commissionType} value={value} onChange={onChange} />
                      )}
                    />
                  </div>
                </div>
              </Col>
              {errors.commission_type && <span className="invalid">{errors.commission_type.message}</span>}
              <Col lg="6">
                <div className="form-group">
                  <label className="form-label">Commission Value</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("commission", { required: "This field is required" })}
                    placeholder="commission"
                  />
                  {errors.commission && <span className="invalid">{errors.commission.message}</span>}
                </div>
              </Col>

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {formData?.id ? "Edit" : "Add"} Product
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

export default GiftcardProductModal;
