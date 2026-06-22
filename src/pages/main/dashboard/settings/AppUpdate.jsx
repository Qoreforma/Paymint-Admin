import React, { useEffect, useMemo, useState } from "react";
import { Card, Modal, ModalBody } from "reactstrap";
import { useCreateAppVersion, useEditAppVersion, useGetAppVersion } from "../../../../api/settings";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Icon,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import UserProfileAside from "./UserProfileAside";
import { IosForm } from "./forms/IosForm";
import { AndroidForm } from "./forms/andriodForm";
const AppUpdatePage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [editedId, setEditedId] = useState();

  const { data, isLoading } = useGetAppVersion();
  const { mutate: createAppVersion } = useCreateAppVersion();
  const { mutate: editAppVersion } = useEditAppVersion();

  const [modalTab, setModalTab] = useState("1");
  const [modal, setModal] = useState(false);

  const closeModal = () => {
    setModal(false);
    setModalTab("1");
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

  const android = useMemo(() => {
    if (data) {
      return data?.data?.find((item) => item.platform === "Android");
    } else {
      return null;
    }
  }, [data]);
  //   console.log(android);

  const ios = useMemo(() => {
    if (data) {
      return data?.data?.find((item) => item.platform === "iOS");
    } else {
      return null;
    }
  }, [data]);

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
                    <BlockTitle tag="h4">App Update</BlockTitle>
                    <BlockDes>
                      <p>Details associated with Qoreforma mobile app.</p>
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
                      <h6 className="overline-title mb-0">IOS version</h6>
                      <div
                        onClick={() => {
                          setModal(true);
                          setModalTab("1");
                          setEditedId(2);
                        }}
                      >
                        <a href="#edit" onClick={(e) => e.preventDefault()} className="text-primary">
                          {ios ? "Edit" : "Create"}
                        </a>
                      </div>
                    </BlockBetween>
                  </div>

                  {isLoading ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">iOS Version</span>
                          <span className="data-value">{ios?.version}</span>
                        </div>
                      </div>

                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Build Number</span>
                          <span className="data-value">{ios?.buildNumber}</span>
                        </div>
                      </div>

                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Store Link</span>
                          <span className="data-value">{ios?.storeLink}</span>
                        </div>
                      </div>

                      <div className="data-item">
                        <div className="between-center flex-wrap flex-md-nowrap g-3 w-100">
                          <div className="nk-block-text">
                            <span className="data-label">Force update</span>
                          </div>
                          <div className="nk-block-actions">
                            <div className="form-group">
                              <div className="form-control-wrap">
                                <div className="custom-control custom-switch">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    // name="forceUpdate"
                                    id="ios_isrequired"
                                    checked={ios?.isForceUpdate == 0 ? false : true}
                                    defaultChecked={ios?.isForceUpdate == 0 ? false : true}
                                    disabled
                                    // onChange={() => setForceUpdate((prev) => !prev)}
                                  />
                                  <label className="custom-control-label" htmlFor="ios_isrequired">
                                    {ios?.isForceUpdate == 0 ? "Off" : "On"}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* <div className="data-item">
                        <div className="between-center flex-wrap flex-md-nowrap g-3 w-100">
                          <div className="data-col">
                            <span className="data-label">Apple Sign-In</span>
                            <span className="data-value">
                              {appleSignInStatus?.data?.value == 1 ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="nk-block-actions">
                            <Button
                              color={"primary"}
                              onClick={() => {
                                updateStatus({ value: appleSignInStatus?.data?.value == 1 ? "0" : "1" });
                              }}
                            >
                              {appleSignInStatus?.data?.value == 1 ? "Shut Down" : "Restore"}
                            </Button>
                          </div>
                        </div>
                      </div> */}
                    </>
                  )}
                </div>

                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">Android version</h6>
                      <div
                        onClick={() => {
                          setModal(true);
                          setModalTab("2");
                          setEditedId(1);
                        }}
                      >
                        <a href="#edit" onClick={(e) => e.preventDefault()} className="text-primary">
                          {android ? "Edit" : "Create"}
                        </a>
                      </div>
                    </BlockBetween>
                  </div>

                  {isLoading ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Android Version</span>
                          <span className="data-value">{android?.version}</span>
                        </div>
                      </div>

                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Build Number</span>
                          <span className="data-value">{android?.buildNumber}</span>
                        </div>
                      </div>

                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label">Store Link</span>
                          <span className="data-value">{android?.storeLink}</span>
                        </div>
                      </div>

                      <div className="data-item">
                        <div className="between-center flex-wrap flex-md-nowrap g-3 w-100">
                          <div className="nk-block-text">
                            <span className="data-label">Force update</span>
                          </div>
                          <div className="nk-block-actions">
                            <div className="form-group">
                              <div className="form-control-wrap">
                                <div className="custom-control custom-switch">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="forceUpdate"
                                    id="force-update"
                                    checked={android?.isForceUpdate == 0 ? false : true}
                                    defaultChecked={android?.isForceUpdate == 0 ? false : true}
                                    disabled
                                    // onChange={() => setForceUpdate((prev) => !prev)}
                                  />
                                  <label className="custom-control-label" htmlFor="force-update">
                                    {android?.isForceUpdate == 0 ? "Off" : "On"}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
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
                    <h5 className="title">Update App version</h5>
                    <ul className="nk-nav nav nav-tabs">
                      <li className="nav-item">
                        <a
                          className={`nav-link ${modalTab === "1" && "active"}`}
                          onClick={(ev) => {
                            ev.preventDefault();
                            setModalTab("1");
                          }}
                          href="#ios"
                        >
                          Apple (IOS)
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={`nav-link ${modalTab === "2" && "active"}`}
                          onClick={(ev) => {
                            ev.preventDefault();
                            setModalTab("2");
                          }}
                          href="#android"
                        >
                          Android
                        </a>
                      </li>
                    </ul>
                    <div className="tab-content">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="ios">
                        <IosForm
                          platform={ios}
                          create={createAppVersion}
                          edit={editAppVersion}
                          closeModal={closeModal}
                        />
                      </div>
                      <div className={`tab-pane ${modalTab === "2" ? "active" : ""}`} id="android">
                        <AndroidForm
                          platform={android}
                          create={createAppVersion}
                          edit={editAppVersion}
                          closeModal={closeModal}
                        />
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

export default AppUpdatePage;
