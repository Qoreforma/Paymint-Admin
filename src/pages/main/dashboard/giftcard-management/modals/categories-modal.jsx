import React, { useEffect, useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useGetCountries } from "../../../../../api/generics";
import { useCreateGiftcardCategory, useEditGiftcardCategory } from "../../../../../api/giftcard-category";
import { useGetAllAdmin } from "../../../../../api/users/admin";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";
import { isValidUrl } from "../../../../../utils/Utils";
import { useUploadImages, generateSignature } from "../../../../../api/uploadimage";

const GiftcardCategoryModal = ({ modal, closeModal, formData, setFormData }) => {
  const [iconImage, setIconImage] = useState([]);
  const [rejectedFiles, setRejectedFile] = useState([]);
  const [rejectedFeature, setRejectedFeature] = useState([]);
  const [updateCountries, setUpdateCountries] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");

  const { mutate: createCategory, isSuccess: created } = useCreateGiftcardCategory();
  const { mutate: editCategory, isSuccess: updated } = useEditGiftcardCategory();
  const { isLoading: loadingCountries, data: countries } = useGetCountries(1, 1000);

  const {
    reset,
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  // console.log(countries);

  const submitForm = (e) => {
    let dataToSubmit = {
      name: e.name,
      saleTerm: e.saleTerm,
      icon: e.icon,
      countries: e.countries ? e.countries.map((item) => item.id) : [],
    };

    console.log({ dataToSubmit });

    if (!formData?.id) {
      createCategory(dataToSubmit);
    } else {
      editCategory({ id: formData?.id, data: dataToSubmit });
    }
    // close();
  };

  // handles ondrop function of dropzone
  const handleDropChange = (acceptedFiles) => {
    // acceptedFiles.forEach((file) => {
    //   set([file]);
    //   // console.log(file);
    // });
    setIconImage(acceptedFiles);
    setValue("icon", acceptedFiles[0]);
    // setFormData({ ...formData, icon: acceptedFiles[0] });
    if (rejectedFiles || rejectedFeature) {
      setRejectedFeature([]);
      setRejectedFile([]);
    }
  };

  const handleOnReject = (rejectedFile, set) => {
    set(rejectedFile);
  };

  const countriesOptions = useMemo(() => {
    if (!loadingCountries && countries) {
      //   console.log(countries);
      return countries?.map((item) => ({
        id: item?._id,
        label: `${item.name}`,
        value: `${item.name}`,
      }));
    }
  }, [loadingCountries, countries]);
  // console.log(countriesOptions);

  // const adminOptions = useMemo(() => {
  //   if (!loadingAdmin && admin) {
  //     //   console.log(admin);
  //     return admin?.admins?.data.map((item) => ({
  //       id: item.id,
  //       label: `${item.firstname} ${item.lastname}`,
  //       value: `${item.firstname} ${item.lastname}`,
  //     }));
  //   }
  // }, [loadingAdmin, admin]);

  const close = () => {
    closeModal();
    setIconImage([]);
    setRejectedFile([]);
    reset();
  };

  // function handleCountry() {
  //   setUpdateCountries(!updateCountries);
  // }

  const onImageUpload = (data) => {
    const image = data?.url;
    console.log("Image uploaded");
    // console.log(image);
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

  const uploadImageToImageKit = async (type) => {
    if (imageSelected) {
      bulkImageUpload(imageSelected);
    }
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

  useEffect(() => {
    if (!imageSelected) {
      setPreviewUrl("");
      return;
    }

    if (imageSelected instanceof File) {
      const objectUrl = URL.createObjectURL(imageSelected);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    if (typeof imageSelected === "string" && isValidUrl(imageSelected)) {
      setPreviewUrl(imageSelected);
    } else {
      setPreviewUrl(""); // emoji or invalid string
    }
  }, [imageSelected]);

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
          <h5 className="title">{formData?.id ? "Edit" : "Add"} Giftcard Category</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(submitForm)}>
              <Col>
                <label className="form-label">Giftcard Icon</label>
                <Controller
                  control={control}
                  name="icon"
                  render={({ field: { onChange } }) => (
                    <Dropzone
                      onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)}
                      accept={[".jpg", ".png", ".jpeg"]}
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
                                <p>(Only *.jpg, *.png and *.jpeg will be accepted) </p>
                              </div>
                            )}
                            {imageSelected && (
                              <div className="dz-preview dz-processing dz-image-preview dz-error dz-complete">
                                <div className="dz-image">
                                  <img src={previewUrl} alt="preview" />
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
                              {isUploading ? "Uploading..." : "Upload Preview"}
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
                <label className="form-label">Select Countries</label>
                <Controller
                  control={control}
                  name="countries"
                  render={({ field: { onChange, value } }) => (
                    <RSelect
                      isMulti
                      options={countriesOptions}
                      value={value}
                      placeholder={"Select Countries"}
                      onChange={onChange}
                      isDisabled={!updateCountries}
                    />
                  )}
                />

                <button
                  onClick={() => setUpdateCountries(!updateCountries)}
                  type="button"
                  style={{ border: 0, backgroundColor: "transparent" }}
                >
                  <span style={{ textDecoration: "underline" }} className="text-primary">
                    Click to {updateCountries ? "disable" : "enable"} countries editing
                  </span>
                </button>
              </Col>

              {/* <Col>
                <label className="form-label">Select Admin</label>
                <RSelect
                  isMulti
                  options={adminOptions}
                  value={formData?.admins}
                  placeholder={"Select Users"}
                  onChange={(e) => setFormData({ ...formData, admins: e })}
                  isDisabled={!updateAdmin}
                />
                <button
                  onClick={() => setUpdateAdmins(!updateAdmin)}
                  type="button"
                  style={{ border: 0, backgroundColor: "transparent" }}
                >
                  <span style={{ textDecoration: "underline" }} className="text-primary">
                    Click to {updateAdmin ? "disable" : "enable"} Admins editing
                  </span>
                </button>
              </Col> */}
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

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button disabled={isUploading} color="primary" size="md" type="submit">
                      {formData?.id ? "Edit" : "Add"} Category
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        close();
                      }}
                      disabled={isUploading}
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

export default GiftcardCategoryModal;
