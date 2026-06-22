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
import { formatDateWithHyphen, formatDateWithTime, formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { ProductTable } from "./product-table";
import ApproveModal from "./modals/approve";
import PartialApprovalModal from "./modals/partial";
import DeclineModal from "./modals/decline";

const GiftcardDetails = () => {
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
            <BlockBetween className="g-3">
              <BlockHeadContent>
                <BlockTitle>Giftcard Details</BlockTitle>
                <BlockDes className="">
                  <p>
                    Giftcard Reference: <span className="fw-medium">{giftcard?.reference}</span>{" "}
                  </p>
                </BlockDes>
              </BlockHeadContent>
              <BlockHeadContent>
                <BlockBetween className="g-3">
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

                  {giftcard?.status === "pending" && (
                    <ul className="nk-tb-actions gx-1 my-n1">
                      <li className="me-n1">
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="a"
                            href="#more"
                            onClick={(ev) => ev.preventDefault()}
                            className="dropdown-toggle btn btn-icon"
                          >
                            <Button color="primary">
                              <span>Actions</span>
                            </Button>
                          </DropdownToggle>
                          <DropdownMenu end>
                            <ul className="link-list-opt no-bdr">
                              <>
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
                                      // onEditClick(item?._id);
                                    }}
                                  >
                                    <Icon name="na"></Icon>
                                    <span>Decline</span>
                                  </DropdownItem>
                                </li>
                              </>
                            </ul>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </li>
                    </ul>
                  )}
                </BlockBetween>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          <Card>
            <div className="card-inner">
              <Block>
                <BlockHead>
                  <BlockTitle tag="h5">Giftcard Transaction Information</BlockTitle>
                  <p>Transaction information with user information.</p>
                </BlockHead>
                <div className="profile-ud-list">
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Transaction Status</span>
                      <span className="profile-ud-value ccap">
                        <Badge
                          className="badge-sm badge-dot has-bg d-inline-flex"
                          color={statusColor(giftcard?.status)}
                        >
                          <span className="ccap">
                            {giftcard?.status === "s.approved" ? "Second approved" : giftcard?.status}
                          </span>
                        </Badge>
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Transaction Type</span>
                      <span className="profile-ud-value ccap">{giftcard?.tradeType}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Payable Amount</span>
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
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Giftcard Rate</span>
                      <span className="profile-ud-value">
                        {giftcard?.rate ? formatter("NGN").format(giftcard?.rate) : 0}
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Service Charge</span>
                      <span className="profile-ud-value">{formatter("NGN").format(giftcard?.serviceCharge ?? 0)}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Giftcard Value</span>
                      <span className="profile-ud-value">
                        {giftcard?.amount} {giftcard?.giftCardId?.countryId?.currency}
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Transaction Date</span>
                      <span className="profile-ud-value">{formatDateWithHyphen(giftcard?.createdAt)}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Giftcard Type</span>
                      <span className="profile-ud-value ccap">{giftcard?.cardType}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Provider</span>
                      <span className="profile-ud-value ccap">{giftcard?.meta?.processedBy ?? "N/A"}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Customer note</span>
                      <span className="profile-ud-value ccap">{giftcard?.comment ?? "N/A"}</span>
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
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">FullName</span>
                      <div className="profile-ud-value">
                        <Link to={`/user-details/${giftcard?.userId?._id}`}>
                          <div className="user-name">
                            <span className="tb-lead text-primary text-capitalize">
                              {giftcard?.userId?.firstname} {giftcard?.userId?.lastname}
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Email</span>
                      <span className="profile-ud-value">{giftcard?.userId?.email}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Phone Number</span>
                      <span className="profile-ud-value">{giftcard?.userId?.phone}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Country</span>
                      <span className="profile-ud-value">{giftcard?.userId?.country}</span>
                    </div>
                  </div>
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
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Giftcard Name</span>
                      <span className="profile-ud-value">{giftcard?.giftCardId?.name}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">
                        Giftcard {giftcard?.tradeType === "sell" ? "Sell" : "Buy"} Rate
                      </span>
                      {giftcard?.tradeType === "sell" ? (
                        <span className="profile-ud-value">
                          {formatter("NGN").format(giftcard?.giftCardId?.sellRate)}
                        </span>
                      ) : (
                        <span className="profile-ud-value">
                          {giftcard?.gift_card?.ngn_price_list &&
                            formatter("NGN").format(giftcard?.giftCardId?.buyRate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Giftcard Category</span>
                      <span className="profile-ud-value">{giftcard?.giftCardId?.categoryId?.name}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Giftcard Country</span>
                      <span className="profile-ud-value">{giftcard?.giftCardId?.countryId?.name}</span>
                    </div>
                  </div>
                </div>
              </Block>

              <div className="nk-divider divider md"></div>

              <Block>
                <BlockHead size="sm">
                  <BlockBetween>
                    <BlockTitle tag="h5">Proof</BlockTitle>
                  </BlockBetween>
                </BlockHead>
                {giftcard?.cards?.length ? (
                  giftcard?.cards?.map(
                    (img, idx) =>
                      img && (
                        <div
                          key={idx}
                          style={{ width: "100px", height: "100px", overflow: "hidden", marginRight: "10px" }}
                        >
                          <ImageContainer img={img} />
                        </div>
                      ),
                  )
                ) : (
                  <span>No Image was uploaded</span>
                )}
              </Block>

              {giftcard?.reviewedBy && (
                <>
                  <div className="nk-divider divider md"></div>
                  <Block>
                    <BlockHead size="sm">
                      <BlockBetween>
                        <BlockTitle tag="h5">Reviews</BlockTitle>
                      </BlockBetween>
                    </BlockHead>
                    <div className="profile-ud-list">
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Reviewed by</span>
                          <span className="profile-ud-value">
                            {giftcard?.reviewedBy?.firstName} {giftcard?.reviewedBy?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Date</span>
                          <span className="profile-ud-value">{formatDateWithHyphen(giftcard?.reviewedAt)}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Review comment</span>
                          <span className="profile-ud-value">{giftcard?.reviewNote ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Review proof</span>
                          {giftcard?.reviewProof ? (
                            <div style={{ width: "100px", height: "100px", overflow: "hidden" }}>
                              <ImageContainer img={giftcard?.reviewProof} />
                            </div>
                          ) : (
                            <span>No Image was uploaded</span>
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
                        <BlockTitle tag="h5">Declined Review</BlockTitle>
                      </BlockBetween>
                    </BlockHead>
                    <div className="profile-ud-list">
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Admin</span>
                          <span className="profile-ud-value">
                            {giftcard?.declinedBy?.firstName} {giftcard?.declinedBy?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Email</span>
                          <span className="profile-ud-value">{giftcard?.declinedBy?.email}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Date</span>
                          <span className="profile-ud-value">{formatDateWithHyphen(giftcard?.declinedAt)}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Review Note</span>
                          <span className="profile-ud-value">{giftcard?.declineNote ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Review Image</span>
                          {giftcard?.declined?.reviewProof ? (
                            <div style={{ width: "100px", height: "100px", overflow: "hidden" }}>
                              <ImageContainer img={giftcard?.reviewProof} />
                            </div>
                          ) : (
                            <span>No Image was uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Block>
                  {/* <div className="col-12 col-md-10 mt-3">
                                  <span className="profile-ud-label">Review Note</span>
                                  <span className={`profile-ud-value text-capitalize mt-2`}>{asset?.data?.declineNote ?? "N/A"}</span>
                                </div>{" "} */}
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
