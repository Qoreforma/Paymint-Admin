import React, { useEffect, useState } from "react";
import { Card, Modal, ModalBody } from "reactstrap";
import {
  useCreateTradeBonus,
  useDeleteTradeBonus,
  useEditTradeBonus,
  useGetTradeBonus,
} from "../../../../api/settings";

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
import { formatter } from "../../../../utils/Utils";
import UserProfileAside from "./UserProfileAside";

const TradeBonusPage = () => {
  const [sm, updateSm] = useState(false);
  const [editedId, setEditedId] = useState();
  const [mobileView, setMobileView] = useState(false);
  const [modalTab, setModalTab] = useState("1");
  const [modal, setModal] = useState({
    add: false,
    edit: false,
  });

  const { data } = useGetTradeBonus();
  const { mutate: editBonus } = useEditTradeBonus(editedId);
  const { mutate: createBonus } = useCreateTradeBonus();
  const { mutate: deleteBonus } = useDeleteTradeBonus();

  const [formData, setFormData] = useState({
    name: "",
    value: "",
    type: "",
    threshold: "",
  });

  const editTradeBonus = (e) => {
    e.preventDefault();

    let data = {
      name: e.target.name.value,
      value: e.target.value.value,
      bonusType: formData.type,
      amountRequired: e.target.threshold.value,
    };
    editBonus(data);
    setModal({
      add: false,
      edit: false,
    });
  };

  const createTradeBonus = (e) => {
    e.preventDefault();

    let data = {
      name: e.target.name.value,
      value: e.target.value.value,
      bonusType: formData.type,
      amountRequired: e.target.threshold.value,
    };
    createBonus(data);
    setModal({
      add: false,
      edit: false,
    });
  };

  const onEditClick = (id) => {
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          name: item.name,
          value: item.value,
          type: item.bonusType,
          threshold: item.amountRequired,
        });
      }
    });
    setEditedId(id);
    setModal({
      add: false,
      edit: true,
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
                    <BlockTitle tag="h4">Trade Bonus</BlockTitle>
                    <BlockDes>
                      <p>Details associated with Qoreforma Trade Bonus.</p>
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
                      <h6 className="overline-title mb-0">Qoreforma Bonuses</h6>
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

                  {data?.data?.map((item, index) => (
                    <div key={index} className="data-item" onClick={() => onEditClick(item?._id)}>
                      <div className="data-col">
                        <span className="data-label fw-bold ccap">
                          {item?.name}
                          <br />
                          <span className="fw-normal" style={{ fontSize: "14px" }}>
                            Threshold: {item?.amountRequired?.toLocaleString()}
                          </span>
                        </span>
                        {item?.bonusType === "flat" ? (
                          <span className="data-value">{formatter("NGN").format(item?.value)}</span>
                        ) : (
                          <span className="data-value">{item?.value}%</span>
                        )}
                      </div>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBonus(item?._id);
                        }}
                      >
                        <span className="text-danger">Delete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Block>

              <Modal
                isOpen={modal.edit}
                className="modal-dialog-centered"
                size="lg"
                toggle={() =>
                  setModal({
                    add: false,
                    edit: false,
                  })
                }
              >
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
                    <h5 className="title">
                      Update <span className="ccap">{formData?.name} </span>Bonus
                    </h5>
                    <div className="tab-content mt-4">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <form onSubmit={editTradeBonus}>
                          <Row className="gy-4">
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="name">
                                  User Type
                                </label>
                                <input
                                  id="name"
                                  className="form-control"
                                  name="name"
                                  defaultValue={formData.name}
                                  placeholder="Enter User Type"
                                  type="text"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="value">
                                  Value
                                </label>
                                <input
                                  id="value"
                                  className="form-control"
                                  name="value"
                                  defaultValue={formData.value}
                                  placeholder="Enter Service Value"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="full-name">
                                  Type
                                </label>
                                <RSelect
                                  options={[
                                    { label: "Flat", value: "flat" },
                                    { label: "Percentage", value: "percentage" },
                                  ]}
                                  value={{
                                    label: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
                                    value: formData.type,
                                  }}
                                  onChange={(e) => setFormData({ ...formData, type: e.value })}
                                  placeholder="Select Type"
                                  isSearchable={false}
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="threshold">
                                  Threshold
                                </label>
                                <input
                                  id="threshold"
                                  className="form-control"
                                  name="threshold"
                                  defaultValue={formData.threshold}
                                  placeholder="Enter Threshold Value"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
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
                        </form>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </Modal>

              <Modal
                isOpen={modal.add}
                className="modal-dialog-centered"
                size="lg"
                toggle={() =>
                  setModal({
                    add: false,
                    edit: false,
                  })
                }
              >
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
                    <h5 className="title">Create Bonus</h5>
                    <div className="tab-content mt-4">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <form onSubmit={createTradeBonus}>
                          <Row className="gy-4">
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="name">
                                  User Type
                                </label>
                                <input
                                  id="name"
                                  className="form-control"
                                  name="name"
                                  placeholder="Enter User Type"
                                  type="text"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="value">
                                  Value
                                </label>
                                <input
                                  id="value"
                                  className="form-control"
                                  name="value"
                                  placeholder="Enter Service Value"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="full-name">
                                  Type
                                </label>
                                <RSelect
                                  options={[
                                    { label: "Flat", value: "flat" },
                                    { label: "Percentage", value: "percentage" },
                                  ]}
                                  value={{
                                    label: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
                                    value: formData.type,
                                  }}
                                  onChange={(e) => setFormData({ ...formData, type: e.value })}
                                  placeholder="Select Type"
                                  isSearchable={false}
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="threshold">
                                  Threshold
                                </label>
                                <input
                                  id="threshold"
                                  className="form-control"
                                  name="threshold"
                                  placeholder="Enter Threshold Value"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>

                            <Col size="12">
                              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                                <li>
                                  <Button type="submit" color="primary" size="lg">
                                    Create
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

export default TradeBonusPage;
