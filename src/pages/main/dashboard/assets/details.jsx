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
import { usePermission } from "../../../../utils/usePermission";

const AssetDetails = ({ match }) => {
  const { hasPermission } = usePermission();
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
    } else if (status === "approved") {
      return "success";
    } else if (status === "pending_deposit") {
      return "secondary";
    } else if (status === "s.approved") {
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
            <BlockBetween className="g-3 flex-wrap flex-sm-nowrap">
              <BlockHeadContent className="mb-2 mb-sm-0">
                <BlockTitle className="fs-5 fs-sm-4">Asset Details</BlockTitle>
                <BlockDes className="">
                  <p className="text-truncate" style={{ maxWidth: "280px" }}>
                    Asset Reference: <span className="fw-medium">{asset?.data?.reference}</span>
                  </p>
                </BlockDes>
              </BlockHeadContent>
              <BlockHeadContent>
                <BlockBetween className="g-2 flex-wrap">
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

                  {asset?.data?.status === "pending" && hasPermission("crypto.update") && (
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
                  <BlockTitle tag="h5" className="fs-6 fs-md-5">
                    Asset Transaction Information
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
                          color={statusColor(asset?.data?.status)}
                        >
                          <span className="ccap text-truncate" style={{ maxWidth: "100px" }}>
                            {asset?.data?.status === "s.approved"
                              ? "Sec.approved"
                              : asset?.data?.status?.replaceAll("_", " ")}
                          </span>
                        </Badge>
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Transaction Type</span>
                      <span className="profile-ud-value ccap">{asset?.data?.tradeType}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Provider</span>
                      <span className="profile-ud-value ccap">{asset?.data?.meta?.processedBy}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Payable Amount</span>
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
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Asset Rate</span>
                      <span className="profile-ud-value">
                        {asset?.data?.exchangeRate ? formatter("NGN").format(asset.data.exchangeRate) : 0}
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Service Charge</span>
                      <span className="profile-ud-value">
                        {formatter("NGN").format(asset?.data?.meta?.serviceCharge ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Profit/Loss</span>
                      <span className="profile-ud-value">{formatter("NGN").format(asset?.data?.profit ?? 0)}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Asset Value</span>
                      <span className="profile-ud-value">
                        ${asset?.data?.cryptoAmount} ({asset?.data?.meta?.cryptoCode})
                      </span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Channel</span>
                      <span className="profile-ud-value">{asset?.data?.channel}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Transaction Date</span>
                      <span className="profile-ud-value">{formatDateWithHyphen(asset?.data?.createdAt)}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Customer Note</span>
                      <span className="profile-ud-value text-break">{asset?.data?.comment ?? "N/A"}</span>
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
                        <Link to={`/user-details/${asset?.data?.userId?._id}`}>
                          <div className="user-name">
                            <span className="tb-lead text-primary text-capitalize text-truncate d-block">
                              {asset?.data?.userId?.firstname} {asset?.data?.userId?.lastname}
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Email</span>
                      <span className="profile-ud-value text-break">{asset?.data?.userId?.email}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Phone Number</span>
                      <span className="profile-ud-value">{asset?.data?.userId?.phone}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Country</span>
                      <span className="profile-ud-value">{asset?.data?.userId?.country}</span>
                    </div>
                  </div>

                  {asset?.data?.meta?.bankDetails && (
                    <>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Account Number</span>
                          <div className="profile-ud-value flex align-items-center gap-2 flex-wrap">
                            <span className="profile-ud-value">{asset?.data?.meta?.bankDetails?.accountNumber}</span>
                            <button
                              onClick={() => copyText(asset?.data?.meta?.bankDetails?.accountNumber)}
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
                          <span className="profile-ud-value">{asset?.data?.meta?.bankDetails?.bankName}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Account Name</span>
                          <span className="profile-ud-value">{asset?.data?.meta?.bankDetails?.accountName}</span>
                        </div>
                      </div>
                    </>
                  )}
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
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Asset Name</span>
                      <span className="profile-ud-value">{asset?.data?.cryptoId?.name}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Network Name</span>
                      <span className="profile-ud-value">{asset?.data?.network?.name}</span>
                    </div>
                  </div>
                  <div className="profile-ud-item">
                    <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                      <span className="profile-ud-label flex-shrink-0">Wallet Address</span>
                      <div className="flex align-items-center gap-2 flex-wrap">
                        <span className="profile-ud-value text-break" style={{ wordBreak: "break-all" }}>
                          {asset?.data?.walletAddress}
                        </span>
                        <button
                          onClick={() => copyText(asset?.data?.walletAddress)}
                          className="btn btn-icon btn-trigger btn-tooltip p-1"
                          title="Copy"
                          style={{ width: "30px", height: "30px" }}
                        >
                          <Icon name="copy" className="fs-6"></Icon>
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
                    <BlockTitle tag="h5" className="fs-6 fs-md-5">
                      Proof
                    </BlockTitle>
                  </BlockBetween>
                </BlockHead>
                {asset?.data?.proof ? (
                  <div style={{ width: "100px", height: "100px", maxWidth: "100%", overflow: "hidden" }}>
                    <ImageContainer img={asset.data.proof} />
                  </div>
                ) : (
                  <span className="text-muted">No Image was uploaded</span>
                )}
              </Block>

              {asset?.data?.reviewedBy && (
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
                            {asset?.data?.reviewedBy?.firstName} {asset?.data?.reviewedBy?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Date</span>
                          <span className="profile-ud-value">{formatDateWithHyphen(asset?.data?.reviewedAt)}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Review comment</span>
                          <span className="profile-ud-value text-break">{asset?.data?.reviewNote ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Review proof</span>
                          {asset?.data?.reviewProof ? (
                            <div style={{ width: "100px", height: "100px", maxWidth: "100%", overflow: "hidden" }}>
                              <ImageContainer img={asset?.data?.reviewProof} />
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

              {asset?.data?.declinedBy && (
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
                            {asset?.data?.declinedBy?.firstName} {asset?.data?.declinedBy?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Email</span>
                          <span className="profile-ud-value text-break">{asset?.data?.declinedBy?.email}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Date</span>
                          <span className="profile-ud-value">{formatDateWithHyphen(asset?.data?.declinedAt)}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Review Note</span>
                          <span className="profile-ud-value text-break">{asset?.data?.declineNote ?? "N/A"}</span>
                        </div>
                      </div>
                      <div className="profile-ud-item">
                        <div className="profile-ud wider flex-wrap flex-sm-nowrap">
                          <span className="profile-ud-label flex-shrink-0">Review Image</span>
                          {asset?.data?.declineProof ? (
                            <div style={{ width: "100px", height: "100px", maxWidth: "100%", overflow: "hidden" }}>
                              <ImageContainer img={asset?.data?.declineProof} />
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

export default AssetDetails;
