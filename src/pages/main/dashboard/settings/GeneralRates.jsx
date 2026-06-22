import React, { useEffect, useState } from "react";
import { Card, Modal, ModalBody } from "reactstrap";
import {
  useGetProviderRates,
  useGetServiceCharge,
  useUpdateProviderRates,
  useUpdateServiceCharge,
} from "../../../../api/users/admin";
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
import { formatter } from "../../../../utils/Utils";

const GeneralRatesPage = () => {
  const [sm, updateSm] = useState(false);
  const [editedId, setEditedId] = useState();
  const [mobileView, setMobileView] = useState(false);
  const [modalTab, setModalTab] = useState("1");
  const [modal, setModal] = useState(false);

  const { data, isLoading } = useGetProviderRates();
  const { mutate: updateRates } = useUpdateProviderRates(editedId);

  // console.log(data);

  const [formData, setFormData] = useState({
    name: "",
    sellRate: "",
    buyRate: "",
  });

  const submitForm = (e) => {
    e.preventDefault();

    let data = {
      sellRate: e.target.sellRate.value,
      buyRate: e.target.buyRate.value,
    };

    updateRates(data);
    setModal(false);
  };

  const onEditClick = (id) => {
    data?.data?.forEach((item) => {
      if (item?.providerId?._id === id) {
        setFormData({
          name: item?.providerId?.name,
          sellRate: item?.sellRate,
          buyRate: item?.buyRate,
        });
      }
    });
    setEditedId(id);
    setModal(true);
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
                    <BlockTitle tag="h4">General Rates</BlockTitle>
                    <BlockDes>
                      <p>General Sell and Buy rate for crypto assets providers</p>
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
                      <h6 className="overline-title mb-0">General Provider Rates</h6>
                    </BlockBetween>
                  </div>

                  {data?.data?.map((item, index) => (
                    <div key={index} className="data-item" onClick={() => onEditClick(item?.providerId?._id)}>
                      <div className="data-col">
                        <span className="data-label fw-bold">
                          {item?.providerId?.name}
                          <br />
                          <span className="fw-normal" style={{ fontSize: "14px" }}>
                            {item?.serviceType}
                          </span>
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: "40px",
                          }}
                        >
                          <div>
                            Sell Rate:
                            <br />{" "}
                            <span className="data-value fw-bold">{formatter("NGN").format(item?.sellRate ?? 0)}</span>
                          </div>

                          <div>
                            Buy Rate:
                            <br />{" "}
                            <span className="data-value fw-bold">{formatter("NGN").format(item?.buyRate ?? 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <h5 className="title">Update {formData?.name} General Rates</h5>
                    <div className="tab-content mt-4">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <form onSubmit={submitForm}>
                          <Row className="gy-4">
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="sellRate">
                                  Sell Rate
                                </label>
                                <input
                                  id="sellRate"
                                  className="form-control"
                                  name="sellRate"
                                  defaultValue={formData.sellRate}
                                  placeholder="Enter Sell Rate"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="buyRate">
                                  Buy Rate
                                </label>
                                <input
                                  id="buyRate"
                                  className="form-control"
                                  name="buyRate"
                                  defaultValue={formData.buyRate}
                                  placeholder="Enter Buy Rate"
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
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default GeneralRatesPage;
