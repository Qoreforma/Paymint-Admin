import React, { useCallback, useState } from "react";
// import ProductVideo from "../../../images/product/video-a.jpg";
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
// import { ProductContext } from "./ProductContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetAssetInfo } from "../../../../api/assets";
import ImageContainer from "../../../../components/partials/gallery/GalleryImage";
import { formatDateWithHyphen, formatDateWithTime, formatHash, formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import toast from "react-hot-toast";
import ApproveModal from "./modals/approve";
import PartialApprovalModal from "./modals/partial";
import DeclineModal from "./modals/decline";

const AssetDetails = ({ match }) => {
  const [editedId, setEditedId] = useState();

  const [showPartial, setShowPartial] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showApprove, setShowApprove] = useState(false);

  const navigate = useNavigate();
  let { assetId } = useParams();
  const { isLoading, data: asset } = useGetAssetInfo(assetId);

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  };

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "approved" || status === "s.approved") {
      return "success";
    } else if (status === "transferred") {
      return "info";
    } else {
      return "danger";
    }
  }, []);

  return (
    <React.Fragment>
      <Head title="Asset Detail"></Head>
      {!isLoading ? (
        <Content>
          <BlockHead size="sm">
            <BlockBetween className="g-3">
              <BlockHeadContent>
                <BlockTitle>Asset Details</BlockTitle>
                <BlockDes className="">
                  <p>
                    Asset Reference: <span className="fw-medium">{asset?.data?.reference}</span>{" "}
                  </p>
                </BlockDes>
              </BlockHeadContent>
              <BlockHeadContent>
                <BlockBetween className="g-3">
                  <Button
                    color="light"
                    outline
                    className="bg-white d-none d-sm-inline-flex d-flex flex-item-center"
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

                  {asset?.data?.status === "pending" && (
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
                                      setEditedId(asset?.data?._id);
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
                                      setEditedId(asset?.data?._id);
                                      setShowPartial(true);
                                      // onEditClick(asset?.data?._id);
                                    }}
                                  >
                                    <Icon name="check"></Icon>
                                    <span>Second Approve</span>
                                  </DropdownItem>
                                </li>
                                <li>
                                  <DropdownItem
                                    tag="a"
                                    href="#edit"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      setEditedId(asset?.data?._id);
                                      setShowDecline(true);
                                      // onEditClick(asset?.data?._id);
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
                  <BlockTitle tag="h5">Asset Transaction Information</BlockTitle>
                  <p>Transaction information with user information.</p>
                </BlockHead>
                <div className="profile-ud-list">
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Transaction Status</span>
                      <span className="profile-ud-value ccap">
                        <Badge
                          className="badge-sm badge-dot has-bg d-inline-flex"
                          color={statusColor(asset?.data?.status)}
                        >
                          <span className="ccap">
                            {asset?.data?.status === "s.approved" ? "Sec.approved" : asset?.data?.status}
                          </span>
                        </Badge>
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Transaction Type</span>
                      <span className="profile-ud-value ccap">{asset?.data?.tradeType}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">provider</span>
                      <span className="profile-ud-value ccap">{asset?.data?.meta?.processedBy}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Payable Amount</span>
                      <span className="profile-ud-value">
                        {asset?.data?.reviewAmount && (
                          <span>{formatter("NGN").format(asset?.data?.reviewAmount)} - </span>
                        )}
                        <span
                          className={asset?.data?.reviewAmount ? "text-danger" : ""}
                          style={{ textDecoration: asset?.data?.reviewAmount ? "line-through" : "none" }}
                        >
                          {asset?.data?.fiatAmount ? formatter("NGN").format(asset?.data.fiatAmount) : 0}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Asset Rate</span>
                      <span className="profile-ud-value">
                        {asset?.data?.exchangeRate ? formatter("NGN").format(asset.data.exchangeRate) : 0}
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Service Charge</span>
                      <span className="profile-ud-value">
                        {formatter("NGN").format(asset?.data?.meta?.serviceCharge ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Asset Value</span>
                      <span className="profile-ud-value">
                        ${asset?.data?.cryptoAmount} ({asset?.data?.meta?.cryptoCode})
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Transaction Date</span>
                      <span className="profile-ud-value">{formatDateWithHyphen(asset?.data?.createdAt)}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Customer Note</span>
                      <span className="profile-ud-value">{asset?.data?.comment ?? "N/A"}</span>
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
                        <Link to={`/user-details/${asset?.data?.userId?._id}`}>
                          <div className="user-name">
                            <span className="tb-lead text-primary text-capitalize">
                              {asset?.data?.userId?.firstname} {asset?.data?.userId?.lastname}
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Email</span>
                      <span className="profile-ud-value">{asset?.data?.userId?.email}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Phone Number</span>
                      <span className="profile-ud-value">{asset?.data?.userId?.phone}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Country</span>
                      <span className="profile-ud-value">{asset?.data?.userId?.country}</span>
                    </div>
                  </div>
                </div>
              </Block>

              <Block>
                <BlockHead className="nk-block-head-line">
                  <BlockTitle tag="h6" className="overline-title text-base">
                    Network
                  </BlockTitle>
                </BlockHead>
                <div className="profile-ud-list">
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Asset Name</span>
                      <span className="profile-ud-value">{asset?.data?.cryptoId?.name}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Network Name</span>
                      <span className="profile-ud-value">{asset?.data?.network?.name}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Wallet Address</span>
                      <div className="flex align-items-center gap-2">
                        <span className="profile-ud-value">{asset?.data?.walletAddress}</span>
                        <button
                          onClick={() => copyText(asset?.data?.walletAddress)}
                          className="btn btn-icon btn-trigger btn-tooltip"
                          title="Copy"
                        >
                          <Icon name="copy"></Icon>
                        </button>
                      </div>
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
                {asset?.data?.proof ? (
                  <div style={{ width: "100px", height: "100px", overflow: "hidden" }}>
                    <ImageContainer img={asset.data.proof} />
                  </div>
                ) : (
                  <span>No Image was uploaded</span>
                )}
              </Block>

              {asset?.data?.reviewedBy && (
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
                            {asset?.data?.reviewedBy?.firstName} {asset?.data?.reviewedBy?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Date</span>
                          <span className="profile-ud-value">{formatDateWithHyphen(asset?.data?.reviewedAt)}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Review comment</span>
                          <span className="profile-ud-value">{asset?.data?.reviewNote ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Review proof</span>
                          {asset?.data?.reviewProof ? (
                            <div style={{ width: "100px", height: "100px", overflow: "hidden" }}>
                              <ImageContainer img={asset?.data?.reviewProof} />
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

              {asset?.data?.declinedBy && (
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
                            {asset?.data?.declinedBy?.firstName} {asset?.data?.declinedBy?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Email</span>
                          <span className="profile-ud-value">{asset?.data?.declinedBy?.email}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Date</span>
                          <span className="profile-ud-value">{formatDateWithHyphen(asset?.data?.declinedAt)}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Review Note</span>
                          <span className="profile-ud-value">{asset?.data?.declineNote ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider">
                          <span className="profile-ud-label">Review Image</span>
                          {asset?.data?.declined?.reviewProof ? (
                            <div style={{ width: "100px", height: "100px", overflow: "hidden" }}>
                              <ImageContainer img={asset?.data?.reviewProof} />
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

export default AssetDetails;
