import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useDeclineAsset } from "../../../../../api/assets";
import { Button, Col, Icon } from "../../../../../components/Component";
import { generateSignature, useUploadImages } from "../../../../../api/uploadimage";

const DeclineModal = ({ modal, closeModal, editedId }) => {
  const [iconImage, setIconImage] = useState([]);
  const { mutate: decline } = useDeclineAsset(editedId);
  const [confirm, setConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState([]);
  const [featuredImage, setFeaturedImage] = useState([]);
  const [rejectedFiles, setRejectedFile] = useState([]);
  const [rejectedFeature, setRejectedFeature] = useState([]);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [uploadedFeature, setUploadedFeature] = useState(null);
  const [type, setType] = useState("");
  // console.log(formData);

  // const [isUploading, setIsUploading] = useState(false);
  //   console.log(selectedAdmins);
  // console.log(formData);

  const {
    reset,
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  // console.log(networks);
  const submitForm = (e) => {
    // e.preventDefault();

    const formdata = {
      declineNote: e.review_note,
      declineProof: uploadedPreview,
    };

    decline(formdata);

    // console.log(data);
    // create(data);
    // closeModal();
    close();
    setConfirm(false);
  };

  // handles ondrop function of dropzone
  // const handleDropChange = (acceptedFiles) => {
  //   // acceptedFiles.forEach((file) => {
  //   //   set([file]);
  //   //   // console.log(file);
  //   // });
  //   setIconImage(acceptedFiles[0]);
  //   // setFormData({ ...formData, icon: acceptedFiles[0] });
  //   if (rejectedFiles || rejectedFeature) {
  //     setRejectedFeature([]);
  //     setRejectedFile([]);
  //   }
  // };
  const handleDropChange = (acceptedFiles, set) => {
    acceptedFiles.forEach((file) => {
      set([file]);
      // console.log(file);
    });
    if (rejectedFiles || rejectedFeature) {
      setRejectedFeature([]);
      setRejectedFile([]);
    }
  };

  const handleOnReject = (rejectedFile, set) => {
    set(rejectedFile);
  };

  const close = () => {
    closeModal();
    setIconImage([]);
    setRejectedFile([]);
    // setSelectedAdmins([]);
    // setSelectedCountries([]);
    reset({});
  };

  const onImageUpload = (data) => {
    const image = data?.url;
    console.log("Image uploaded");
    if (type === "preview") {
      setUploadedPreview(image);
    } else {
      setUploadedFeature(image);
    }
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

  const uploadImageToImageKit = async (type) => {
    if (type === "preview") {
      return bulkImageUpload(previewImage[0]);
    } else {
      return bulkImageUpload(featuredImage[0]);
    }
  };

  //api function to upload images
  const { isLoading: isUploading, mutate: upload, isSuccess: uploaded } = useUploadImages(onImageUpload);

  return (
    <>
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
            <h5 className="title">Decline Transaction </h5>
            <div className="mt-4">
              <Form className="row gy-4" id="hook-form" noValidate onSubmit={handleSubmit(submitForm)}>
                <Col>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cf-default-textarea">
                      Comment
                    </label>
                    <div className="form-control-wrap">
                      <textarea
                        className="form-control form-control-sm"
                        id="cf-default-textarea"
                        {...register("review_note")}
                        placeholder="Write a note"
                      />
                    </div>
                  </div>
                </Col>
                <Col>
                  <label className="form-label">Upload review proof</label>
                  <Dropzone
                    onDrop={(acceptedFiles) => handleDropChange(acceptedFiles, setPreviewImage)}
                    accept={[".jpg", ".png", ".jpeg"]}
                    maxFiles={1}
                    onDropRejected={(file) => handleOnReject(file, setRejectedFile)}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <section>
                        <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                          <input {...getInputProps()} />
                          {previewImage.length === 0 && (
                            <div className="dz-message">
                              <span className="dz-message-text">Drag 'n' drop some files here</span>
                              <span className="dz-message-or">or</span>
                              <Button type="button" color="primary">
                                SELECT
                              </Button>
                              <p>(Only *.jpg, *.png and *.jpeg will be accepted) </p>
                            </div>
                          )}
                          {previewImage.map((file) => (
                            <div
                              key={file.name}
                              className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                            >
                              <div className="dz-image">
                                <img src={`${URL.createObjectURL(file)}`} alt="preview" />
                              </div>
                            </div>
                          ))}
                        </div>
                        {!uploadedPreview && previewImage.length > 0 && (
                          <Button
                            disabled={isUploading}
                            color="primary"
                            size="md"
                            type="button"
                            onClick={() => {
                              setType("preview");
                              uploadImageToImageKit("preview");
                            }}
                            className="mt-1"
                          >
                            {isUploading ? "Uploading" : "Upload Preview"}
                          </Button>
                        )}
                      </section>
                    )}
                  </Dropzone>
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
                {/* <Col>
                  <label className="form-label">Asset Icon</label>
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
                          {!iconImage && (
                            <div className="dz-message">
                              <span className="dz-message-text">Drag 'n' drop some files here</span>
                              <span className="dz-message-or">or</span>
                              <Button type="button" color="primary">
                                SELECT
                              </Button>
                              <p>(Only *.jpg, *.png, *.svg and *.jpeg will be accepted) </p>
                            </div>
                          )}
                          {iconImage?.length !== 0 && (
                            <div
                              key={iconImage}
                              className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                            >
                              <div className="dz-image">
                                <img src={`${URL.createObjectURL(iconImage)}`} alt="preview" />
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    )}
                  </Dropzone>
                  {rejectedFiles.map(({ file, errors }) => (
                    <div key={file.path}>
                      {errors.map((error) => (
                        <p key={error.code} className="text-danger">
                          {error.message}
                        </p>
                      ))}
                    </div>
                  ))}
                </Col> */}
                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md" type="button" onClick={() => setConfirm(true)}>
                        Submit
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

      <Modal isOpen={confirm} toggle={close} className="modal-dialog-centered" size="md">
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
            <h5 className="title">Confirm</h5>

            <p>Are you sure you want to decline this transaction?</p>
            <div className="mt-4">
              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" form="hook-form">
                      Proceed
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setConfirm(false);
                      }}
                      className="link link-light"
                    >
                      Cancel
                    </a>
                  </li>
                </ul>
              </Col>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default DeclineModal;
