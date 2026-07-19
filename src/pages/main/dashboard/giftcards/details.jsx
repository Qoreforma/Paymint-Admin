import React, { useCallback, useState } from "react";
import { Badge, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
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
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetGiftcardInfo } from "../../../../api/giftcard";
import ImageContainer from "../../../../components/partials/gallery/GalleryImage";
import { copyText, formatDateWithHyphen, formatDateWithTime, formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { ProductTable } from "./product-table";
import ApproveModal from "./modals/approve";
import PartialApprovalModal from "./modals/partial";
import DeclineModal from "./modals/decline";
import { usePermission } from "../../../../utils/usePermission";

const GiftcardDetails = () => {
  const { hasPermission } = usePermission();

  const [editedId, setEditedId] = useState();

  const [showPartial, setShowPartial] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showApprove, setShowApprove] = useState(false);

  const navigate = useNavigate();
  let { giftcardId } = useParams();

  const { isLoading, data } = useGetGiftcardInfo(giftcardId);
  const giftcard = data?.data;

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "approved") {
      return "success";
    } else if (status === "s.approved") {
      return "info";
    } else if (status === "multiple") {
      return "secondary";
    } else {
      return "danger";
    }
  }, []);

  return (
    <React.Fragment>
      <Head title="Giftcard Detail"></Head>
      {!isLoading ? (
        <Content>
          <BlockHead size="sm">
            <BlockBetween className="g-3 flex-wrap flex-sm-nowrap">
              <BlockHeadContent className="mb-2 mb-sm-0">
                <BlockTitle className="fs-5 fs-sm-4">Giftcard Details</BlockTitle>
                <BlockDes className="">
                  <p className="text-truncate" style={{ maxWidth: "280px" }}>
                    Giftcard Reference: <span className="fw-medium">{giftcard?.reference}</span>
                  </p>
                </BlockDes>
              </BlockHeadContent>
              <BlockHeadContent>
                <BlockBetween className="g-2 flex-wrap align-items-center">
                  <Button
                    color="light"
                    outline
                    className="bg-white d-none d-sm-inline-flex"
                    onClick={() => navigate(-1)}
                  >
                    <Icon name="arrow-left"></Icon>
                    <span>Back</span>
                  </Button>
                  <a
                    href="#back"
                    onClick={(ev) => {
                      ev.preventDefault();
                      navigate(-1);
                    }}
                    className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                  >
                    <Icon name="arrow-left"></Icon>
                  </a>

                  {giftcard?.status === "pending" && hasPermission("giftcards.update") && (
                    <UncontrolledDropdown>
                      <DropdownToggle
                        tag="a"
                        href="#more"
                        onClick={(ev) => ev.preventDefault()}
                        className="dropdown-toggle btn btn-primary"
                      >
                        <span className="d-sm-inline">Actions</span>
                      </DropdownToggle>
                      <DropdownMenu end>
                        <ul className="link-list-opt no-bdr">
                          <li>
                            <DropdownItem
                              tag="a"
                              href="#edit"
                              onClick={(ev) => {
                                ev.preventDefault();
                                setEditedId(giftcard?._id);
                                setShowApprove(true);
                              }}
                            >
                              <Icon name="check"></Icon>
                              <span>Approve</span>
                            </DropdownItem>
                          </li>
                          <li>
                            <DropdownItem
                              tag="a"
                              href="#edit"
                              onClick={(ev) => {
                                ev.preventDefault();
                                setEditedId(giftcard?._id);
                                setShowPartial(true);
                              }}
                            >
                              <Icon name="check"></Icon>
                              <span>Second Approval</span>
                            </DropdownItem>
                          </li>
                          <li>
                            <DropdownItem
                              tag="a"
                              href="#edit"
                              onClick={(ev) => {
                                ev.preventDefault();
                                setEditedId(giftcard?._id);
                                setShowDecline(true);
                              }}
                            >
                              <Icon name="na"></Icon>
                              <span>Decline</span>
                            </DropdownItem>
                          </li>
                        </ul>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  )}
                </BlockBetween>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          <Card>
            <div className="card-inner">
              <Block>
                <BlockHead>
                  <BlockTitle tag="h5" className="fs-6 fs-md-5">
                    Giftcard Transaction Information
                  </BlockTitle>
                  <p className="text-muted small">Transaction information with user information.</p>
                </BlockHead>
                <div className="profile-ud-list">
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Transaction Status</span>
                      <span className="profile-ud-value ccap">
                        <Badge
                          className="badge-sm badge-dot has-bg d-inline-flex"
                          color={statusColor(giftcard?.status)}
                        >
                          <span className="ccap text-truncate" style={{ maxWidth: "100px" }}>
                            {giftcard?.status === "s.approved" ? "Second approved" : giftcard?.status}
                          </span>
                        </Badge>
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Transaction Type</span>
                      <span className="profile-ud-value ccap">{giftcard?.tradeType}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Channel</span>
                      <span className="profile-ud-value ccap">{giftcard?.channel}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Payable Amount</span>
                      <span className="profile-ud-value">
                        {giftcard?.reviewedAmount && (
                          <span>{formatter("NGN").format(giftcard?.reviewedAmount)} - </span>
                        )}
                        <span
                          className={giftcard?.reviewedAmount ? "text-danger" : ""}
                          style={{ textDecoration: giftcard?.reviewedAmount ? "line-through" : "none" }}
                        >
                          {giftcard?.payableAmount ? formatter("NGN").format(giftcard.payableAmount) : 0}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Giftcard Rate</span>
                      <span className="profile-ud-value">
                        {giftcard?.rate ? formatter("NGN").format(giftcard?.rate) : 0}
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Service Charge</span>
                      <span className="profile-ud-value">{formatter("NGN").format(giftcard?.serviceCharge ?? 0)}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Profit/Loss</span>
                      <span className="profile-ud-value">{formatter("NGN").format(giftcard?.profit ?? 0)}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Giftcard Value</span>
                      <span className="profile-ud-value">
                        {giftcard?.amount} {giftcard?.giftCardId?.countryId?.currency}
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Transaction Date</span>
                      <span className="profile-ud-value">{formatDateWithHyphen(giftcard?.createdAt)}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Giftcard Type</span>
                      <span className="profile-ud-value ccap">{giftcard?.cardType}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Provider</span>
                      <span className="profile-ud-value ccap">{giftcard?.meta?.processedBy ?? "N/A"}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Customer note</span>
                      <span className="profile-ud-value text-break">{giftcard?.comment ?? "N/A"}</span>
                    </div>
                  </div>
                </div>
              </Block>

              <Block>
                <BlockHead className="nk-block-head-line">
                  <BlockTitle tag="h6" className="overline-title text-base">
                    User Information
                  </BlockTitle>
                </BlockHead>
                <div className="profile-ud-list">
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">FullName</span>
                      <div className="profile-ud-value">
                        <Link to={`/user-details/${giftcard?.userId?._id}`}>
                          <div className="user-name">
                            <span
                              className="tb-lead text-primary text-capitalize text-truncate d-block"
                              style={{ maxWidth: "200px" }}
                            >
                              {giftcard?.userId?.firstname} {giftcard?.userId?.lastname}
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Email</span>
                      <span className="profile-ud-value text-break">{giftcard?.userId?.email}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Phone Number</span>
                      <span className="profile-ud-value">{giftcard?.userId?.phone}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Country</span>
                      <span className="profile-ud-value">{giftcard?.userId?.country}</span>
                    </div>
                  </div>

                  {giftcard?.meta?.bankDetails && (
                    <>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Account Number</span>
                          <div className="profile-ud-value flex align-items-center gap-2 flex-wrap">
                            <span className="profile-ud-value">{giftcard?.meta?.bankDetails?.accountNumber}</span>
                            <button
                              onClick={() => copyText(giftcard?.meta?.bankDetails?.accountNumber)}
                              className="btn btn-icon btn-trigger btn-tooltip p-1"
                              title="Copy"
                              style={{ width: "30px", height: "30px" }}
                            >
                              <Icon name="copy" className="fs-6"></Icon>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Bank Name</span>
                          <span className="profile-ud-value">{giftcard?.meta?.bankDetails?.bankName}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Account Name</span>
                          <span className="profile-ud-value">{giftcard?.meta?.bankDetails?.accountName}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Block>

              <Block>
                <BlockHead className="nk-block-head-line">
                  <BlockTitle tag="h6" className="overline-title text-base">
                    Giftcard Information
                  </BlockTitle>
                </BlockHead>
                <div className="profile-ud-list">
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Giftcard Name</span>
                      <span className="profile-ud-value">{giftcard?.giftCardId?.name}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">
                        Giftcard {giftcard?.tradeType === "sell" ? "Sell" : "Buy"} Rate
                      </span>
                      {giftcard?.tradeType === "sell" ? (
                        <span className="profile-ud-value">
                          {formatter("NGN").format(giftcard?.giftCardId?.sellRate ?? 0)}
                        </span>
                      ) : (
                        <span className="profile-ud-value">
                          {giftcard?.gift_card?.ngn_price_list &&
                            formatter("NGN").format(giftcard?.giftCardId?.buyRate ?? 0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Giftcard Category</span>
                      <span className="profile-ud-value">{giftcard?.giftCardId?.categoryId?.name}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Giftcard Country</span>
                      <span className="profile-ud-value">{giftcard?.giftCardId?.countryId?.name}</span>
                    </div>
                  </div>
                </div>
              </Block>

              <div className="nk-divider divider md"></div>

              <Block>
                <BlockHead size="sm">
                  <BlockBetween>
                    <BlockTitle tag="h5" className="fs-6 fs-md-5">
                      Proof
                    </BlockTitle>
                  </BlockBetween>
                </BlockHead>
                {giftcard?.cards?.length ? (
                  giftcard?.cards?.map(
                    (img, idx) =>
                      img && (
                        <div
                          key={idx}
                          style={{
                            width: "100px",
                            height: "100px",
                            overflow: "hidden",
                            marginRight: "10px",
                            display: "inline",
                          }}
                        >
                          <ImageContainer img={img} />
                        </div>
                      ),
                  )
                ) : (
                  <span className="text-muted">No Image was uploaded</span>
                )}
              </Block>

              {giftcard?.reviewedBy && (
                <>
                  <div className="nk-divider divider md"></div>
                  <Block>
                    <BlockHead size="sm">
                      <BlockBetween>
                        <BlockTitle tag="h5" className="fs-6 fs-md-5">
                          Reviews
                        </BlockTitle>
                      </BlockBetween>
                    </BlockHead>
                    <div className="profile-ud-list">
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Reviewed by</span>
                          <span className="profile-ud-value">
                            {giftcard?.reviewedBy?.firstName} {giftcard?.reviewedBy?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Date</span>
                          <span className="profile-ud-value">{formatDateWithHyphen(giftcard?.reviewedAt)}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Review comment</span>
                          <span className="profile-ud-value text-break">{giftcard?.reviewNote ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Review proof</span>
                          {giftcard?.reviewProof ? (
                            <div style={{ width: "100px", height: "100px", maxWidth: "100%", overflow: "hidden" }}>
                              <ImageContainer img={giftcard?.reviewProof} />
                            </div>
                          ) : (
                            <span className="text-muted">No Image was uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Block>
                </>
              )}

              {giftcard?.declinedBy && (
                <>
                  <div className="nk-divider divider md"></div>
                  <Block>
                    <BlockHead size="sm">
                      <BlockBetween>
                        <BlockTitle tag="h5" className="fs-6 fs-md-5">
                          Declined Review
                        </BlockTitle>
                      </BlockBetween>
                    </BlockHead>
                    <div className="profile-ud-list">
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Admin</span>
                          <span className="profile-ud-value">
                            {giftcard?.declinedBy?.firstName} {giftcard?.declinedBy?.lastName}
                          </span>
                        </div>
                      </div>
                      {giftcard?.declinedBy?.email && (
                        <div className="profile-ud-item">
                          <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                            <span className="profile-ud-label flex-shrink-0">Email</span>
                            <span className="profile-ud-value text-break">{giftcard?.declinedBy?.email}</span>
                          </div>
                        </div>
                      )}
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Date</span>
                          <span className="profile-ud-value">{formatDateWithHyphen(giftcard?.declinedAt)}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Review Note</span>
                          <span className="profile-ud-value text-break">{giftcard?.declineNote ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Review Image</span>
                          {giftcard?.declineProof ? (
                            <div style={{ width: "100px", height: "100px", maxWidth: "100%", overflow: "hidden" }}>
                              <ImageContainer img={giftcard.declineProof} />
                            </div>
                          ) : (
                            <span className="text-muted">No Image was uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Block>
                </>
              )}
            </div>
          </Card>
        </Content>
      ) : (
        <LoadingSpinner />
      )}

      <ApproveModal modal={showApprove} closeModal={setShowApprove} editedId={editedId} />
      <PartialApprovalModal modal={showPartial} closeModal={setShowPartial} editedId={editedId} />
      <DeclineModal modal={showDecline} closeModal={setShowDecline} editedId={editedId} />
    </React.Fragment>
  );
};

export default GiftcardDetails;
