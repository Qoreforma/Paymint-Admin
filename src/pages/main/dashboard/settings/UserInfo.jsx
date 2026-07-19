import React, { useEffect, useState } from "react";
import { Card, Modal, ModalBody } from "reactstrap";
import { useRecoilValue } from "recoil";
import { userState } from "../../../../atoms/userState";
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
import { useUpdateProfile } from "../../../../api/settings";

const UserInfoPage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const user = useRecoilValue(userState);
  const { mutate: updateProfile } = useUpdateProfile();

  const [modalTab, setModalTab] = useState("1");
  const [formData, setFormData] = useState({
    firstname: user?.firstName,
    lastname: user?.lastName,
    email: user?.email,
    phone: user?.phone,
  });
  const [modal, setModal] = useState(false);

  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitForm = () => {
    let submitData = {
      firstName: formData.firstname,
      lastName: formData.lastname,
      // email: formData.email,
      phone: formData.phone,
    };
    console.log(submitData);
    updateProfile(submitData);
    setFormData({});
    setModal(false);
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
                    <BlockTitle tag="h4">Personal Information</BlockTitle>
                    <BlockDes>
                      <p>Basic information associated with your account.</p>
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
                      <h6 className="overline-title mb-0">Basics</h6>
                      <div onClick={() => setModal(true)}>
                        <a href="#edit" onClick={(e) => e.preventDefault()} className="text-primary">
                          Edit
                        </a>
                      </div>
                    </BlockBetween>
                  </div>
                  <div className="data-item" onClick={() => setModal(true)}>
                    <div className="data-col">
                      <span className="data-label">Full Name</span>
                      <span className="data-value">{`${user?.firstName} ${user?.lastName}`}</span>
                    </div>
                  </div>
                  <div className="data-item">
                    <div className="data-col">
                      <span className="data-label">Email</span>
                      <span className="data-value">{user?.email}</span>
                    </div>
                  </div>
                  <div className="data-item">
                    <div className="data-col">
                      <span className="data-label">Phone number</span>
                      <span className="data-value">{user?.phone ? user?.phone : "N/A"}</span>
                    </div>
                  </div>
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
                    <h5 className="title">Update Profile</h5>
                    <ul className="nk-nav nav nav-tabs">
                      <li className="nav-item">
                        <a
                          className={`nav-link ${modalTab === "1" && "active"}`}
                          onClick={(ev) => {
                            ev.preventDefault();
                            setModalTab("1");
                          }}
                          href="#personal"
                        >
                          Personal
                        </a>
                      </li>
                    </ul>
                    <div className="tab-content">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <Row className="gy-4">
                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="first-name">
                                First Name
                              </label>
                              <input
                                type="text"
                                id="first-name"
                                className="form-control"
                                name="firstname"
                                onChange={(e) => onInputChange(e)}
                                defaultValue={formData.firstname}
                                placeholder="Enter First name"
                              />
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="first-name">
                                Last Name
                              </label>
                              <input
                                type="text"
                                id="last-name"
                                className="form-control"
                                name="lastname"
                                onChange={(e) => onInputChange(e)}
                                defaultValue={formData.lastname}
                                placeholder="Enter Last name"
                              />
                            </div>
                          </Col>
                          {/* <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="display-name">
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                className="form-control"
                                name="email"
                                onChange={(e) => onInputChange(e)}
                                defaultValue={formData.email}
                                placeholder="Enter email"
                              />
                            </div>
                          </Col> */}
                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="phone-no">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                id="phone-no"
                                className="form-control"
                                name="phone"
                                onChange={(e) => onInputChange(e)}
                                defaultValue={formData.phone}
                                placeholder="Phone Number"
                              />
                            </div>
                          </Col>

                          <Col size="12">
                            <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                              <li>
                                <Button
                                  color="primary"
                                  size="lg"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    submitForm();
                                  }}
                                >
                                  Update Profile
                                </Button>
                              </li>
                              <li>
                                <a
                                  href="#dropdownitem"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    setModal(false);
                                  }}
                                  className="link link-light"
                                >
                                  Cancel
                                </a>
                              </li>
                            </ul>
                          </Col>
                        </Row>
                      </div>
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

export default UserInfoPage;
