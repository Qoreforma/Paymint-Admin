import React, { useEffect, useState } from "react";
import { Card, Modal, ModalBody } from "reactstrap";

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
  RSelect,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import UserProfileAside from "./UserProfileAside";
import {
  useAddPhonePrefix,
  useDeletePhonePrefix,
  useGetPhonePrefix,
  useUpdatePhonePrefix,
} from "../../../../api/users/admin";

const PhonePrefixPage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [modalTab, setModalTab] = useState("1");
  const [modal, setModal] = useState({
    add: false,
    edit: false,
  });

  const { data } = useGetPhonePrefix();
  const { mutate: editPrefixNetwork } = useUpdatePhonePrefix();
  const { mutate: createPrefix } = useAddPhonePrefix();
  const { mutate: deletePrefix } = useDeletePhonePrefix();

  const [formData, setFormData] = useState({
    prefix: "",
    network: "",
  });

  const editNetwork = (e) => {
    e.preventDefault();

    let data = {
      network: formData.network,
    };
    editPrefixNetwork({ prefix: e.target.prefix.value, data });
    closeModal();
  };

  const createPhonePrefix = (e) => {
    e.preventDefault();

    let data = {
      prefix: e.target.prefix.value,
      network: formData.network,
    };

    createPrefix(data);
    closeModal();
  };

  const onEditClick = (prefix) => {
    data?.data?.prefixes?.forEach((item) => {
      if (item?.prefix === prefix) {
        setFormData({
          prefix: item.prefix,
          network: item.network,
        });
      }
    });

    setModal({
      add: false,
      edit: true,
    });
  };

  const closeModal = () => {
    setModal({
      add: false,
      edit: false,
    });

    setFormData({
      prefix: "",
      network: "",
    });
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
                    <BlockTitle tag="h4">Phone Number Prefixes</BlockTitle>
                    <BlockDes>
                      <p>Details associated with Qoreforma Phone Number Prefixes.</p>
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
                      <h6 className="overline-title mb-0">Manage Prefixes</h6>
                      <div
                        onClick={() =>
                          setModal({
                            add: true,
                            edit: false,
                          })
                        }
                      >
                        <a href="#edit" onClick={(e) => e.preventDefault()} className="text-primary">
                          Create
                        </a>
                      </div>
                    </BlockBetween>
                  </div>

                  {data?.data?.prefixes?.map((item, index) => (
                    <div key={index} className="data-item" onClick={() => onEditClick(item?.prefix)}>
                      <div className="data-col">
                        <span className="data-label fw-bold ccap">
                          {item?.prefix}
                          <br />
                          <span className="fw-normal" style={{ fontSize: "14px" }}>
                            {item?.network}
                          </span>
                        </span>
                      </div>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePrefix(item?.prefix);
                        }}
                      >
                        <span className="text-danger">Delete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Block>

              <Modal isOpen={modal.edit} className="modal-dialog-centered" size="lg" toggle={() => closeModal()}>
                <a
                  href="#dropdownitem"
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
                    <h5 className="title">Update Network</h5>
                    <div className="tab-content mt-4">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <form onSubmit={editNetwork}>
                          <Row className="gy-4">
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="prefix">
                                  Prefix
                                </label>
                                <input
                                  disabled
                                  id="prefix"
                                  className="form-control"
                                  name="prefix"
                                  defaultValue={formData.prefix}
                                  placeholder="Enter Prefix"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="network">
                                  Network
                                </label>
                                <RSelect
                                  options={[
                                    { label: "MTN", value: "MTN" },
                                    { label: "GLO", value: "GLO" },
                                    { label: "AIRTEL", value: "AIRTEL" },
                                    { label: "9MOBILE", value: "9MOBILE" },
                                  ]}
                                  value={{
                                    label: formData.network,
                                    value: formData.network,
                                  }}
                                  onChange={(e) => setFormData({ ...formData, network: e.value })}
                                  placeholder="Select Network"
                                  isSearchable={false}
                                />
                              </div>
                            </Col>

                            <Col size="12">
                              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                                <li>
                                  <Button type="submit" color="primary" size="lg">
                                    Update
                                  </Button>
                                </li>
                                <li>
                                  <a
                                    href="#dropdownitem"
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
                          </Row>
                        </form>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </Modal>

              <Modal isOpen={modal.add} className="modal-dialog-centered" size="lg" toggle={() => closeModal()}>
                <a
                  href="#dropdownitem"
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
                    <h5 className="title">Create Phone Prefix</h5>
                    <div className="tab-content mt-4">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <form onSubmit={createPhonePrefix}>
                          <Row className="gy-4">
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="prefix">
                                  Prefix
                                </label>
                                <input
                                  id="prefix"
                                  className="form-control"
                                  name="prefix"
                                  defaultValue={formData.prefix}
                                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                  placeholder="Enter Prefix"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="network">
                                  Network
                                </label>
                                <RSelect
                                  options={[
                                    { label: "MTN", value: "MTN" },
                                    { label: "GLO", value: "GLO" },
                                    { label: "AIRTEL", value: "AIRTEL" },
                                    { label: "9MOBILE", value: "9MOBILE" },
                                  ]}
                                  value={{
                                    label: formData.network,
                                    value: formData.network,
                                  }}
                                  onChange={(e) => setFormData({ ...formData, network: e.value })}
                                  placeholder="Select Network"
                                  isSearchable={false}
                                />
                              </div>
                            </Col>

                            <Col size="12">
                              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                                <li>
                                  <Button
                                    disabled={formData.prefix.length < 4 || !formData.network}
                                    type="submit"
                                    color="primary"
                                    size="lg"
                                  >
                                    Create
                                  </Button>
                                </li>
                                <li>
                                  <a
                                    href="#dropdownitem"
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
                          </Row>
                        </form>
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

export default PhonePrefixPage;
