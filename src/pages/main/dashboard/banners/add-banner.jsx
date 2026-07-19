import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { Form, Modal, ModalBody, Input } from "reactstrap";
import { Button, Col, Icon } from "../../../../components/Component";
import { useCreateBanners, useEditBanners } from "../../../../api/banners";
import { useUploadImages } from "../../../../api/uploadimage";
import { generateSignature } from "../../../../api/uploadimage";
import { isValidUrl } from "../../../../utils/Utils";
import toast from "react-hot-toast";

const AddBanner = ({ modal, closeModal, banner = null, isEdit = false }) => {
  const { mutate: create } = useCreateBanners();
  const { mutate: update } = useEditBanners(banner?._id);

  const [featuredImage, setFeaturedImage] = useState([]);
  const [rejectedFiles, setRejectedFile] = useState([]);
  const [rejectedFeature, setRejectedFeature] = useState([]);
  // const [isUploading, setIsUploading] = useState(false);
  const [uploadedFeature, setUploadedFeature] = useState(banner?.featuredImageUrl || null);
  const [type, setType] = useState("");
  const [link, setLink] = useState("");

  const submitForm = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const form = Object.fromEntries(formData);

    if (form.link && !isValidUrl(form.link)) {
      toast("Please enter a valid URL");
      return;
    }

    let data = {
      featuredImageUrl: uploadedFeature,
      previewImageUrl: uploadedFeature,
      link: form.link,
    };

    // console.log(data);

    if (isEdit) {
      update(data);
    } else {
      create(data);
    }

    closeModal();
    setFeaturedImage([]);
    setRejectedFile([]);
    setRejectedFeature([]);
    setUploadedFeature(null);
  };

  // handles ondrop function of dropzone
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
    setFeaturedImage([]);
    setRejectedFile([]);
    setRejectedFeature([]);
  };

  const onImageUpload = (data) => {
    setUploadedFeature(data.url);
    setFeaturedImage([]);
  };

  // console.log(uploadedFeature);

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

  const uploadImageToImageKit = async (type) => bulkImageUpload(featuredImage[0]);

  //api function to upload images
  const { isLoading: isUploading, mutate: upload, isSuccess: uploaded } = useUploadImages(onImageUpload);

  useEffect(() => {
    if (banner) {
      setUploadedFeature(banner.featuredImageUrl);
      setLink(banner?.link || "");
    } else {
      setUploadedFeature(null);
      setFeaturedImage([]);
      setLink("");
    }
  }, [banner]);

  return (
    <Modal isOpen={modal} toggle={close} className="modal-dialog-centered" size="lg">
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
          <h5 className="title">{isEdit ? "Edit Banner" : "Add Banner"}</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={submitForm}>
              <Col>
                <label className="form-label">Featured Image</label>
                <Dropzone
                  onDrop={(acceptedFiles) => handleDropChange(acceptedFiles, setFeaturedImage)}
                  accept={[".jpg", ".png", ".jpeg"]}
                  maxFiles={1}
                  onDropRejected={(file) => handleOnReject(file, setRejectedFeature)}
                >
                  {({ getRootProps, getInputProps }) => (
                    <section>
                      <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                        <input {...getInputProps()} />
                        {featuredImage.length > 0 ? (
                          featuredImage.map((file) => (
                            <div
                              key={file.name}
                              className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                            >
                              <div className="dz-image">
                                <img src={URL.createObjectURL(file)} alt="preview" />
                              </div>
                            </div>
                          ))
                        ) : uploadedFeature ? (
                          <div className="dz-preview dz-processing dz-image-preview dz-complete">
                            <div className="dz-image">
                              <img src={uploadedFeature} alt="Current banner" />
                            </div>
                          </div>
                        ) : (
                          <div className="dz-message">
                            <span className="dz-message-text">Drag and drop file</span>
                            <span className="dz-message-or">or</span>
                            <Button type="button" color="primary">
                              SELECT
                            </Button>
                            <p>(Only *.jpg, *.png and *.jpeg will be accepted)</p>
                          </div>
                        )}
                      </div>
                      {featuredImage.length > 0 && (
                        <Button
                          disabled={isUploading}
                          color="primary"
                          size="md"
                          type="button"
                          onClick={() => {
                            setType("feature");
                            uploadImageToImageKit("feature");
                          }}
                          className="mt-1"
                        >
                          {isUploading ? "Uploading..." : "Upload Image"}
                        </Button>
                      )}
                    </section>
                  )}
                </Dropzone>
                {rejectedFeature.map(({ file, errors }) => (
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
                  <label className="form-label" htmlFor="link">
                    Banner Link
                  </label>
                  <div className="form-control-wrap">
                    <input
                      id="link"
                      name="link"
                      type="url"
                      placeholder="https://example.com"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      pattern="https?://.+"
                      className="form-control"
                    />
                  </div>
                </div>
              </Col>

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit" disabled={!uploadedFeature}>
                      {isEdit ? "Update Banner" : "Create Banner"}
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

export default AddBanner;
