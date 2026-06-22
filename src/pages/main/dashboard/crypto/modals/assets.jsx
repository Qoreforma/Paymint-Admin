import React, { useEffect, useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useCreateCryptoAssets, useEditCryptoAsset, useGetCryptoNetworks } from "../../../../../api/crypto";
import { useGetAllAdmin } from "../../../../../api/users/admin";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";
import { isValidUrl } from "../../../../../utils/Utils";
import { useUploadImages, generateSignature } from "../../../../../api/uploadimage";

const AssetsModal = ({ modal, closeModal, formData, setFormData, editedId }) => {
  const { mutate: createAsset, isSuccess: created } = useCreateCryptoAssets();

  const { mutate: editAsset, isSuccess: updated } = useEditCryptoAsset(editedId);
  const [iconImage, setIconImage] = useState([]);
  const [rejectedFiles, setRejectedFile] = useState([]);
  const [rejectedFeature, setRejectedFeature] = useState([]);

  const { isLoading: loadingNetworks, data: networks } = useGetCryptoNetworks(1, 100);
  const {
    reset,
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

  const submitForm = (data) => {
    const dataToSubmit = {
      name: data.name,
      code: data.code,
      icon: data.icon,
      sellRate: data.sell_rate,
      buyRate: data.buy_rate,
      saleTerm: data.saleTerm,
      purchaseTerm: data.purchaseTerm,
      sellMinAmount: data.sell_min_amount,
      sellMaxAmount: data.sell_max_amount,
      buyMinAmount: data.buy_min_amount,
      buyMaxAmount: data.buy_max_amount,
      networks: data?.networks?.map((item) => item.id),
    };

    console.log({ dataToSubmit });
    if (!formData?.id) {
      createAsset(dataToSubmit);
    } else {
      editAsset(dataToSubmit);
    }
  };

  // handles ondrop function of dropzone
  const handleDropChange = (acceptedFiles) => {
    // acceptedFiles.forEach((file) => {
    //   set([file]);
    //   // console.log(file);
    // });
    setIconImage(acceptedFiles);
    setValue("icon", acceptedFiles[0]);
    if (rejectedFiles || rejectedFeature) {
      setRejectedFeature([]);
      setRejectedFile([]);
    }
  };

  const handleOnReject = (rejectedFile, set) => {
    set(rejectedFile);
  };

  const networkOptions = useMemo(() => {
    if (!loadingNetworks && networks) {
      // console.log(networks);
      return networks?.data?.map((item) => ({
        id: item?._id,
        label: `${item?.name}`,
        value: `${item?.name}`,
      }));
    }
  }, [loadingNetworks, networks]);

  const close = () => {
    closeModal();
    setIconImage([]);
    setRejectedFile([]);
    reset({});
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  const onImageUpload = (data) => {
    const image = data?.url;
    console.log("Image uploaded");
    setValue("icon", image);
  };

  //   console.log(uploadedFeature);

  const bulkImageUpload = async (image) => {
    const { token, expire, signature } = await generateSignature();

    const formData = new FormData();
    formData.append("publicKey", import.meta.env.VITE_APP_IMAGEKIT_PUBLIC_KEY);
    formData.append("file", image);
    formData.append("fileName", image?.name);
    formData.append("useUniqueFileName", "true");
    formData.append("expire", expire);
    formData.append("token", token);
    formData.append("signature", signature);
    upload(formData);
  };

  const imageSelected = getValues("icon");

  const uploadImageToImageKit = async () => {
    return bulkImageUpload(imageSelected);
  };

  //api function to upload images
  const { isLoading: isUploading, mutate: upload, isSuccess: uploaded } = useUploadImages(onImageUpload);

  useEffect(() => {
    if (modal) {
      reset(formData);
    }
  }, [formData, modal]);

  useEffect(() => {
    if (created || updated) {
      close();
    }
  }, [created, updated]);

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
          <h5 className="title">{formData?.id ? "Edit" : "Add"} Assets</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(submitForm)}>
              <Col>
                <label className="form-label">Asset Icon</label>
                <Controller
                  name="icon"
                  control={control}
                  render={({}) => (
                    <Dropzone
                      onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)}
                      accept={[".jpg", ".png", ".jpeg", ".svg"]}
                      maxFiles={1}
                      maxSize={2097152}
                      onDropRejected={(file) => handleOnReject(file, setRejectedFile)}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section>
                          <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                            <input {...getInputProps()} />
                            {!imageSelected && (
                              <div className="dz-message">
                                <span className="dz-message-text">Drag 'n' drop some files here</span>
                                <span className="dz-message-or">or</span>
                                <Button type="button" color="primary">
                                  SELECT
                                </Button>
                                <p>(Only *.jpg, *.png, *.svg and *.jpeg will be accepted) </p>
                              </div>
                            )}
                            {imageSelected && (
                              <div className="dz-preview dz-processing dz-image-preview dz-error dz-complete">
                                <div className="dz-image">
                                  <img
                                    src={`${
                                      isValidUrl(imageSelected) ? imageSelected : URL.createObjectURL(imageSelected)
                                    }`}
                                    alt="preview"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          {!isValidUrl(imageSelected) && iconImage?.length > 0 && (
                            <Button
                              disabled={isUploading}
                              color="primary"
                              size="md"
                              type="button"
                              onClick={() => {
                                uploadImageToImageKit("preview");
                              }}
                              className="mt-1"
                            >
                              {isUploading ? "Uploading" : "Upload Image"}
                            </Button>
                          )}
                        </section>
                      )}
                    </Dropzone>
                  )}
                />
                {rejectedFiles.map(({ file, errors }) => (
                  <div key={file.path}>
                    {errors.map((error) => (
                      <p key={error.code} className="text-danger">
                        {error.message}
                      </p>
                    ))}
                  </div>
                ))}
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("name", { required: "This field is required" })}
                    placeholder="Enter name"
                  />
                  {errors.name && <span className="invalid">{errors.name.message}</span>}
                </div>
              </Col>{" "}
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Asset Short Code</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("code", { required: "This field is required" })}
                    placeholder="Enter code"
                  />
                  {errors.code && <span className="invalid">{errors.code.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Buy Rate</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("buy_rate", { required: "This field is required" })}
                    placeholder="Enter Buy Rate"
                  />
                  {errors.buy_rate && <span className="invalid">{errors.buy_rate.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Sell Rate</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("sell_rate", { required: "This field is required" })}
                    placeholder="Enter Sell Rate"
                  />
                  {errors.sell_rate && <span className="invalid">{errors.sell_rate.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Buy Min Amount</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("buy_min_amount", { required: "This field is required" })}
                    placeholder="Enter buy min amount"
                  />
                  {errors.buy_min_amount && <span className="invalid">{errors.buy_min_amount.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Buy Max Amount</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("buy_max_amount", { required: "This field is required" })}
                    placeholder="Enter name"
                  />
                  {errors.buy_max_amount && <span className="invalid">{errors.buy_max_amount.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Sell Min Amount</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("sell_min_amount", { required: "This field is required" })}
                    placeholder="Enter Sell Min amount"
                  />
                  {errors.sell_min_amount && <span className="invalid">{errors.sell_min_amount.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Sell Max Amount</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("sell_max_amount", { required: "This field is required" })}
                    placeholder="Enter sell max amount"
                  />
                  {errors.sell_max_amount && <span className="invalid">{errors.sell_max_amount.message}</span>}
                </div>
              </Col>
              <Col>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-default-textarea">
                    Sale Term
                  </label>
                  <div className="form-control-wrap">
                    <textarea
                      className="form-control form-control-sm"
                      id="cf-default-textarea"
                      defaultValue={formData?.saleTerms}
                      {...register("saleTerm")}
                      placeholder="Write a sales description"
                    />
                  </div>
                </div>
              </Col>
              <Col>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-default-textarea">
                    Purchase Term
                  </label>
                  <div className="form-control-wrap">
                    <textarea
                      className="form-control form-control-sm"
                      id="cf-default-textarea"
                      defaultValue={formData?.purchaseTerm}
                      {...register("purchaseTerm")}
                      placeholder="Write a purchase description"
                    />
                  </div>
                </div>
              </Col>
              <Col>
                <label className="form-label">Select Network</label>
                <Controller
                  control={control}
                  name="networks"
                  render={({ field: { onChange, value } }) => (
                    <RSelect
                      isMulti
                      options={networkOptions}
                      value={value}
                      placeholder={"Select Network"}
                      onChange={onChange}
                    />
                  )}
                />
              </Col>
              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {formData?.id ? "Edit" : "Add"} Asset
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

export default AssetsModal;
