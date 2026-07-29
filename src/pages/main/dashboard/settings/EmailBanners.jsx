import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, Modal, ModalBody } from "reactstrap";
import Dropzone from "react-dropzone";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  Icon,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import UserProfileAside from "./UserProfileAside";
import LoadingSpinner from "../../../components/spinner";
import { useGetEmailBanners, useUpdateEmailBanners } from "../../../../api/email-banners";
import { useUploadImages } from "../../../../api/uploadimage";
import { generateSignature } from "../../../../api/uploadimage";
import { usePermission } from "../../../../utils/usePermission";
import toast from "react-hot-toast";

const EmailBannersPage = () => {
  const { hasPermission } = usePermission();
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [modal, setModal] = useState(false);
  const [editType, setEditType] = useState(""); // "header", "footer", "logo"

  // State for uploaded images
  const [headerImage, setHeaderImage] = useState([]);
  const [footerImage, setFooterImage] = useState([]);
  const [logoImage, setLogoImage] = useState([]);

  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [uploadedHeader, setUploadedHeader] = useState(null);
  const [uploadedFooter, setUploadedFooter] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);

  const [link, setLink] = useState("");

  const onImageUpload = (uploadData) => {
    if (editType === "header") {
      setUploadedHeader(uploadData.url);
      setHeaderImage([]);
    } else if (editType === "footer") {
      setUploadedFooter(uploadData.url);
      setFooterImage([]);
    } else if (editType === "logo") {
      setUploadedLogo(uploadData.url);
      setLogoImage([]);
    }
  };

  const { isLoading, data } = useGetEmailBanners();
  const { mutate: updateBanners, isPending: updating } = useUpdateEmailBanners();
  const { isLoading: isUploading, mutate: upload, isSuccess: uploaded } = useUploadImages(onImageUpload);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();

  // Set initial data from API
  useEffect(() => {
    if (data?.data) {
      setUploadedHeader(data.data.headerBannerUrl || null);
      setUploadedFooter(data.data.footerBannerUrl || null);
      setUploadedLogo(data.data.logoUrl || null);
    }
  }, [data]);

  const handleDropChange = (acceptedFiles, setState) => {
    acceptedFiles.forEach((file) => {
      setState([file]);
    });
    setRejectedFiles([]);
  };

  const handleOnReject = (rejectedFile) => {
    setRejectedFiles(rejectedFile);
  };

  const uploadImageToImageKit = async (type) => {
    const { token, expire, signature } = await generateSignature();

    let file = null;
    if (type === "header") file = headerImage[0];
    else if (type === "footer") file = footerImage[0];
    else if (type === "logo") file = logoImage[0];

    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("publicKey", import.meta.env.VITE_APP_IMAGEKIT_PUBLIC_KEY);
    formData.append("file", file);
    formData.append("fileName", file?.name);
    formData.append("useUniqueFileName", "true");
    formData.append("expire", expire);
    formData.append("token", token);
    formData.append("signature", signature);
    upload(formData);
  };

  const handleUpdateBanner = (type, url) => {
    const updateData = {};

    if (type === "header") {
      updateData.headerBannerUrl = url;
    } else if (type === "footer") {
      updateData.footerBannerUrl = url;
    } else if (type === "logo") {
      updateData.logoUrl = url;
    }

    updateBanners(updateData);
  };

  const clearBanner = (type) => {
    const updateData = {};

    if (type === "header") {
      updateData.headerBannerUrl = "";
      setUploadedHeader(null);
    } else if (type === "footer") {
      updateData.footerBannerUrl = "";
      setUploadedFooter(null);
    } else if (type === "logo") {
      updateData.logoUrl = "";
      setUploadedLogo(null);
    }

    updateBanners(updateData);
  };

  const openModal = (type) => {
    setEditType(type);
    setModal(true);
    // Reset image states based on type
    if (type === "header") setHeaderImage([]);
    else if (type === "footer") setFooterImage([]);
    else if (type === "logo") setLogoImage([]);
    setRejectedFiles([]);
  };

  const closeModal = () => {
    setModal(false);
    setHeaderImage([]);
    setFooterImage([]);
    setLogoImage([]);
    setRejectedFiles([]);
  };

  // function to change the design view under 990 px
  const viewChange = () => {
    if (window.innerWidth < 990) {
      setMobileView(true);
    } else {
      setMobileView(false);
      updateSm(false);
    }
  };

  useEffect(() => {
    viewChange();
    window.addEventListener("load", viewChange);
    window.addEventListener("resize", viewChange);
    document.getElementsByClassName("nk-header")[0]?.addEventListener("click", function () {
      updateSm(false);
    });
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

  return (
    <React.Fragment>
      <Head title="Email Banners Settings"></Head>
      <Content>
        <Card>
          <div className="card-aside-wrap">
            <div
              className={`card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg ${
                sm ? "content-active" : ""
              }`}
            >
              <UserProfileAside updateSm={updateSm} sm={sm} />
            </div>
            <div className="card-inner card-inner-lg">
              {sm && mobileView && <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>}
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Email Banners & Logo</BlockTitle>
                    <BlockDes>
                      <p>Manage header banner, footer banner, and logo for your emails.</p>
                    </BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent className="align-self-start d-lg-none">
                    <Button
                      className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="menu-alt-r"></Icon>
                    </Button>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <Block>
                  {/* Header Banner Section */}
                  <div className="nk-data data-list mb-4">
                    <div className="data-head">
                      <BlockBetween>
                        <h6 className="overline-title mb-0">Header Banner</h6>
                        {hasPermission("email_banners.update") && (
                          <div
                            style={{
                              display: "flex",
                              gap: ".5rem",
                            }}
                          >
                            {uploadedHeader && (
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => clearBanner("header")}
                                disabled={updating}
                              >
                                Clear
                              </Button>
                            )}
                            <Button color="primary" size="sm" onClick={() => openModal("header")} disabled={updating}>
                              {uploadedHeader ? "Update" : "Add"}
                            </Button>
                          </div>
                        )}
                      </BlockBetween>
                    </div>
                    <div className="data-item">
                      <div className="data-col">
                        <span className="data-label">Header Banner</span>
                        <span className="data-value">
                          {uploadedHeader ? (
                            <img
                              src={uploadedHeader}
                              alt="Header Banner"
                              style={{ maxWidth: "300px", maxHeight: "100px", objectFit: "contain" }}
                            />
                          ) : (
                            <span className="text-muted">No header banner set</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Banner Section */}
                  <div className="nk-data data-list mb-4">
                    <div className="data-head">
                      <BlockBetween>
                        <h6 className="overline-title mb-0">Footer Banner</h6>
                        {hasPermission("email_banners.update") && (
                          <div
                            style={{
                              display: "flex",
                              gap: ".5rem",
                            }}
                          >
                            {uploadedFooter && (
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => clearBanner("footer")}
                                disabled={updating}
                              >
                                Clear
                              </Button>
                            )}
                            <Button color="primary" size="sm" onClick={() => openModal("footer")} disabled={updating}>
                              {uploadedFooter ? "Update" : "Add"}
                            </Button>
                          </div>
                        )}
                      </BlockBetween>
                    </div>
                    <div className="data-item">
                      <div className="data-col">
                        <span className="data-label">Footer Banner</span>
                        <span className="data-value">
                          {uploadedFooter ? (
                            <img
                              src={uploadedFooter}
                              alt="Footer Banner"
                              style={{ maxWidth: "300px", maxHeight: "100px", objectFit: "contain" }}
                            />
                          ) : (
                            <span className="text-muted">No footer banner set</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Logo Section */}
                  <div className="nk-data data-list">
                    <div className="data-head">
                      <BlockBetween>
                        <h6 className="overline-title mb-0">Email Logo</h6>
                        {hasPermission("email_banners.update") && (
                          <div
                            style={{
                              display: "flex",
                              gap: ".5rem",
                            }}
                          >
                            {uploadedLogo && (
                              <Button color="danger" size="sm" onClick={() => clearBanner("logo")} disabled={updating}>
                                Clear
                              </Button>
                            )}
                            <Button color="primary" size="sm" onClick={() => openModal("logo")} disabled={updating}>
                              {uploadedLogo ? "Update" : "Add"}
                            </Button>
                          </div>
                        )}
                      </BlockBetween>
                    </div>
                    <div className="data-item">
                      <div className="data-col">
                        <span className="data-label">Logo</span>
                        <span className="data-value">
                          {uploadedLogo ? (
                            <img
                              src={uploadedLogo}
                              alt="Email Logo"
                              style={{ maxWidth: "200px", maxHeight: "80px", objectFit: "contain" }}
                            />
                          ) : (
                            <span className="text-muted">No logo set</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Last Updated Info */}
                  {data?.data?.updatedAt && (
                    <div className="mt-4 text-muted" style={{ fontSize: "14px" }}>
                      Last updated: {new Date(data.data.updatedAt).toLocaleString()}
                    </div>
                  )}
                </Block>
              )}

              {/* Upload Modal */}
              <Modal isOpen={modal} className="modal-dialog-centered" size="lg" toggle={closeModal}>
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
                <ModalBody>
                  <div className="p-2">
                    <h5 className="title">
                      {editType === "header" && "Update Header Banner"}
                      {editType === "footer" && "Update Footer Banner"}
                      {editType === "logo" && "Update Logo"}
                    </h5>
                    <div className="mt-4">
                      <form className="row gy-4" noValidate>
                        <Col>
                          <label className="form-label">
                            {editType === "header" && "Header Banner Image"}
                            {editType === "footer" && "Footer Banner Image"}
                            {editType === "logo" && "Logo Image"}
                          </label>
                          <Dropzone
                            onDrop={(acceptedFiles) => {
                              if (editType === "header") handleDropChange(acceptedFiles, setHeaderImage);
                              else if (editType === "footer") handleDropChange(acceptedFiles, setFooterImage);
                              else if (editType === "logo") handleDropChange(acceptedFiles, setLogoImage);
                            }}
                            accept={[".jpg", ".png", ".jpeg", ".svg", ".gif"]}
                            maxFiles={1}
                            onDropRejected={handleOnReject}
                          >
                            {({ getRootProps, getInputProps }) => (
                              <section>
                                <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                                  <input {...getInputProps()} />
                                  {(() => {
                                    const currentImage =
                                      editType === "header"
                                        ? headerImage
                                        : editType === "footer"
                                          ? footerImage
                                          : logoImage;
                                    const currentUploaded =
                                      editType === "header"
                                        ? uploadedHeader
                                        : editType === "footer"
                                          ? uploadedFooter
                                          : uploadedLogo;

                                    return currentImage.length > 0 ? (
                                      currentImage.map((file) => (
                                        <div key={file.name} className="dz-preview dz-processing dz-image-preview">
                                          <div className="dz-image">
                                            <img src={URL.createObjectURL(file)} alt="preview" />
                                          </div>
                                        </div>
                                      ))
                                    ) : currentUploaded ? (
                                      <div className="dz-preview dz-processing dz-image-preview dz-complete">
                                        <div className="dz-image">
                                          <img src={currentUploaded} alt="Current" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="dz-message">
                                        <span className="dz-message-text">Drag and drop file</span>
                                        <span className="dz-message-or">or</span>
                                        <Button type="button" color="primary">
                                          SELECT
                                        </Button>
                                        <p>(*.jpg, *.png, *.jpeg, *.svg, *.gif)</p>
                                      </div>
                                    );
                                  })()}
                                </div>
                                {(() => {
                                  const currentImage =
                                    editType === "header"
                                      ? headerImage
                                      : editType === "footer"
                                        ? footerImage
                                        : logoImage;
                                  return (
                                    currentImage.length > 0 && (
                                      <Button
                                        disabled={isUploading}
                                        color="primary"
                                        size="md"
                                        type="button"
                                        onClick={() => uploadImageToImageKit(editType)}
                                        className="mt-1"
                                      >
                                        {isUploading ? "Uploading..." : "Upload Image"}
                                      </Button>
                                    )
                                  );
                                })()}
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

                        <Col size="12">
                          <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                            <li>
                              <Button
                                color="primary"
                                size="md"
                                type="button"
                                onClick={() => {
                                  const currentUploaded =
                                    editType === "header"
                                      ? uploadedHeader
                                      : editType === "footer"
                                        ? uploadedFooter
                                        : uploadedLogo;
                                  if (currentUploaded) {
                                    handleUpdateBanner(editType, currentUploaded);
                                    closeModal();
                                  } else {
                                    toast.error("Please upload an image first");
                                  }
                                }}
                                disabled={
                                  !(() => {
                                    const currentUploaded =
                                      editType === "header"
                                        ? uploadedHeader
                                        : editType === "footer"
                                          ? uploadedFooter
                                          : uploadedLogo;
                                    return currentUploaded;
                                  })() || updating
                                }
                              >
                                {updating ? "Updating..." : "Update Banner"}
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
                      </form>
                    </div>
                  </div>
                </ModalBody>
              </Modal>
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default EmailBannersPage;
