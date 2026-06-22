import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, Modal, ModalBody } from "reactstrap";
import { useEditSupport, useGetSupport } from "../../../../api/settings";
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

const SupportPage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [modal, setModal] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: "",
    whatsappNumber: "",
    emailAddress: "",
  });

  const { data: supportData, isLoading } = useGetSupport();
  const { mutate: editSupport } = useEditSupport();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {},
  });

  const onEditClick = () => {
    setFormData({
      phoneNumber: supportData?.data.phoneNumber,
      whatsappNumber: supportData?.data.whatsappNumber,
      emailAddress: supportData?.data.emailAddress,
    });
  };

  const onFormSubmit = (data) => {
    console.log("Data received", data);
    editSupport(data);

    setModal(false);
    closeModal();
  };

  const closeModal = () => {
    setModal(false);
    reset({});
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
    document.getElementsByClassName("nk-header")[0].addEventListener("click", function () {
      updateSm(false);
    });
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

  return (
    <React.Fragment>
      <Head title="Settings"></Head>
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
                    <BlockTitle tag="h4">Support</BlockTitle>
                    <BlockDes>
                      <p>Details associated with Qoreforma Support.</p>
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

              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">Support</h6>
                    </BlockBetween>
                  </div>

                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <div
                        className="data-item"
                        onClick={() => {
                          onEditClick();
                          setModal(true);
                        }}
                      >
                        <div className="data-col">
                          <span className="data-label">Phone number</span>
                          <span className="data-value">{supportData?.data.phoneNumber}</span>
                        </div>
                      </div>
                      <div
                        className="data-item"
                        onClick={() => {
                          onEditClick();
                          setModal(true);
                        }}
                      >
                        <div className="data-col">
                          <span className="data-label">Whatsapp number</span>
                          <span className="data-value">{supportData?.data.whatsappNumber}</span>
                        </div>
                      </div>
                      <div
                        className="data-item"
                        onClick={() => {
                          onEditClick();
                          setModal(true);
                        }}
                      >
                        <div className="data-col">
                          <span className="data-label">Support Email</span>
                          <span className="data-value">{supportData?.data.emailAddress}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Block>

              <Modal isOpen={modal} className="modal-dialog-centered" size="lg" toggle={() => setModal(false)}>
                <a
                  href="#dropdownitem"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setModal(false);
                  }}
                  className="close"
                >
                  <Icon name="cross-sm"></Icon>
                </a>
                <ModalBody>
                  <div className="p-2">
                    <h5 className="title">Update Support Parameters</h5>
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                      <Row className="g-3">
                        <Col md="12">
                          <div className="form-group">
                            <label className="form-label" htmlFor="emailAddress">
                              Email address
                            </label>
                            <div className="form-control-wrap">
                              <input
                                type="text"
                                className="form-control"
                                defaultValue={formData.emailAddress}
                                {...register("emailAddress", {
                                  required: "This field is required",
                                })}
                              />
                              {errors.emailAddress && <span className="invalid">{errors.emailAddress.message}</span>}
                            </div>
                          </div>
                        </Col>
                        <Col md="12">
                          <div className="form-group">
                            <label className="form-label" htmlFor="phoneNumber">
                              Phone Number
                            </label>
                            <div className="form-control-wrap">
                              <input
                                type="text"
                                className="form-control"
                                defaultValue={formData.phoneNumber}
                                {...register("phoneNumber", {
                                  required: "This field is required",
                                })}
                              />
                              {errors.phoneNumber && <span className="invalid">{errors.phoneNumber.message}</span>}
                            </div>
                          </div>
                        </Col>
                        <Col md="12">
                          <div className="form-group">
                            <label className="form-label" htmlFor="phoneNumber">
                              Whatsapp Number
                            </label>
                            <div className="form-control-wrap">
                              <input
                                type="text"
                                className="form-control"
                                defaultValue={formData.whatsappNumber}
                                {...register("whatsappNumber", {
                                  required: "This field is required",
                                })}
                              />
                              {errors.whatsappNumber && (
                                <span className="invalid">{errors.whatsappNumber.message}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                        <Col size="12">
                          <Button color="primary" type="submit">
                            <Icon className="plus"></Icon>
                            <span>Update</span>
                          </Button>
                        </Col>
                      </Row>
                    </form>
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

export default SupportPage;
