import React, { useCallback } from "react";
import { Modal, ModalBody, Badge } from "reactstrap";
import { BlockTitle, Col, Icon, Row } from "../../../../../components/Component";
import ImageContainer from "../../../../../components/partials/gallery/GalleryImage";
import { useGetCategoryAdmin, useToggleAdminPermission } from "../../../../../api/giftcard-category";
import LoadingSpinner from "../../../../components/spinner";

export default function ViewGiftcardModal({ showModal, closeModal, formData }) {
  const { data, isLoading } = useGetCategoryAdmin(formData.id);
  const { mutate: togglePermission } = useToggleAdminPermission();

  return (
    <Modal isOpen={showModal} toggle={closeModal} className="modal-dialog-centered" size="lg">
      <ModalBody>
        <a href="#cancel" className="close">
          {" "}
          <Icon
            name="cross-sm"
            onClick={(ev) => {
              ev.preventDefault();
              closeModal();
            }}
          ></Icon>
        </a>
        <div className="nk-modal-head">
          <h4 className="nk-modal-title title">Giftcard Information</h4>
        </div>
        <div className="nk-tnx-details mt-sm-3">
          <Row className="gy-3">
            <Col>
              <span className="sub-text">Icon</span>
              <div style={{ width: "80px", height: "80px", overflow: "hidden" }}>
                <ImageContainer img={formData?.icon} />
              </div>
            </Col>
            <Col>
              <span className="sub-text">Giftcard name</span>
              <span className="caption-text">{formData?.name}</span>
            </Col>
            <Col>
              <span className="sub-text">Sales Terms</span>
              <span className="caption-text">{formData?.saleTerms ? formData.saleTerms : "N/A"}</span>
            </Col>
            <Col>
              <span className="sub-text">Purchase Terms</span>
              <span className="caption-text">{formData?.purchaseTerms ? formData?.purchaseTerms : "N/A"}</span>
            </Col>

            <Col>
              <span className="sub-text">Giftcard Countries</span>
              <div className="caption-text" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {formData?.countries?.map((item, index) => (
                  <Badge key={index} className="me-gs" pill color="light">
                    <span className=" caption-text text-capitalize">{item.value}</span>
                  </Badge>
                ))}
              </div>
            </Col>

            <Col lg={6}>
              <span className="sub-text">Sale Activated</span>
              <Badge
                className="badge-sm badge-dot has-bg d-inline-flex"
                color={formData?.saleActivated ? "success" : "danger"}
              >
                <span className="ccap">{formData?.saleActivated ? "Activated" : "Not Active"}</span>
              </Badge>
              {/* <span className="caption-text"> {.status}</span> */}
            </Col>

            <Col>
              <div
                style={{
                  padding: "10px 0",
                }}
              >
                <BlockTitle tag="h6">Admin Permission</BlockTitle>
              </div>
              {isLoading ? (
                <LoadingSpinner />
              ) : data?.length ? (
                <div>
                  <table className={`table table-tranx is-compact`}>
                    <thead>
                      <tr className="tb-tnx-head">
                        <th className="tb-tnx-id">
                          <span className="">#</span>
                        </th>
                        <th className="tb-tnx-info">
                          <span className="tb-tnx-desc d-none d-sm-inline-block">
                            <span>Name</span>
                          </span>
                        </th>
                        {/* <th className="tb-tnx-info">
                          <span className="tb-tnx-desc d-sm-inline-block d-none">
                            <span>Email</span>
                          </span>
                        </th> */}
                        <th className="tb-tnx-info">
                          <span className=" d-sm-inline-block d-none">
                            <span>Phone</span>
                          </span>
                        </th>
                        <th className="tb-tnx-amount is-alt">
                          <span className="">Sell</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data?.map((item, idx) => {
                        return (
                          <tr key={idx} className="tb-tnx-item">
                            <td className="tb-tnx-id">
                              <a
                                href="#id"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                }}
                              >
                                <span>{idx + 1}</span>
                              </a>
                            </td>
                            <td className="tb-tnx-info">
                              <div className="user-name">
                                <span className="tb-lead text-primary">
                                  <span className="title text-capitalize">
                                    {item?.admin?.firstName} {item?.admin?.lastName}
                                  </span>
                                </span>
                              </div>
                            </td>
                            {/* <td className="tb-tnx-info">
                              <div className="">
                                <span className="date">{item?.admin?.email}</span>
                              </div>
                            </td> */}
                            <td className="tb-tnx-info">
                              <div className="">
                                <span className="date">{item?.admin?.phone ?? "NOT SET"}</span>
                              </div>
                            </td>

                            <td className="tb-tnx-amount is-alt">
                              <div className="">
                                <div className="custom-control-sm custom-switch">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="Sell"
                                    checked={item?.sellEnabled}
                                    onClick={() => {
                                      togglePermission({
                                        data: {
                                          enabled: !item?.sellEnabled,
                                        },
                                        categoryId: formData.id,
                                        adminId: item?.admin?._id,
                                      });
                                    }}
                                    id={item?.admin?._id + "-sell"}
                                  />
                                  <label className="custom-control-label" htmlFor={item?.admin?._id + "-sell"}>
                                    <span className={`ccap fw-medium ${item?.sellEnabled ? "text-success" : ""}`}>
                                      {item?.sellEnabled ? "Enabled" : "Not Enabled"}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center" style={{ paddingBlock: "1rem" }}>
                  <span className="text-silent">No record found</span>
                </div>
              )}
            </Col>
          </Row>
        </div>
      </ModalBody>
    </Modal>
  );
}
