import React, { useEffect, useMemo, useState } from "react";
import { Badge, Card, Modal, ModalBody } from "reactstrap";
import toast from "react-hot-toast";
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
import { instance } from "../../../../api/httpConfig";
import { usePermission } from "../../../../utils/usePermission";
import LoadingSpinner from "../../../components/spinner";
import {
  useAddBlockedIP,
  useApproveRequest,
  useDenyRequest,
  useGetBlockedIPs,
  useGetPendingRequests,
  useGetTrustedDevices,
  useRemoveBlockedIP,
} from "../../../../api/settings";

const DeviceAndIpPage = () => {
  const { hasPermission } = usePermission();

  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [cidrInput, setCidrInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [denyModal, setDenyModal] = useState(null);
  const [denyRequestId, setDenyRequestId] = useState(null);
  const [trustedPage, setTrustedPage] = useState(1);

  // API hooks
  const { data: pendingData, isLoading: pendingLoading } = useGetPendingRequests();
  const { data: blockedData, isLoading: blockedLoading } = useGetBlockedIPs();
  const { data: trustedData, isLoading: trustedLoading } = useGetTrustedDevices(trustedPage);
  const approveMutation = useApproveRequest();
  const denyMutation = useDenyRequest();
  const addBlockMutation = useAddBlockedIP();
  const removeBlockMutation = useRemoveBlockedIP();

  const pendingRequests = pendingData?.data || [];
  const blockedIPs = blockedData?.data?.data || [];
  const trustedDevices = trustedData?.data || [];
  const trustedPagination = trustedData?.pagination || {};

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
    document.getElementsByClassName("nk-header")[0]?.addEventListener("click", function () {
      updateSm(false);
    });
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

  const handleApprove = (requestId) => {
    approveMutation.mutate(requestId);
  };

  const handleDeny = (requestId, blockIp = false, reason = "") => {
    denyMutation.mutate({
      requestId,
      data: {
        action: "deny",
        blockIp,
        reason: reason || "Denied by admin",
      },
    });
    setDenyModal(null);
    setDenyRequestId(null);
  };

  const handleAddBlock = (cidrValue = null) => {
    const cidrToBlock = cidrValue || cidrInput;

    if (!cidrToBlock) {
      toast.error("Please enter a valid CIDR");
      return;
    }
    addBlockMutation.mutate({
      cidr: cidrToBlock,
      reason: reasonInput || "Manually blocked by admin",
    });
    setCidrInput("");
    setReasonInput("");
    setShowAddBlock(false);
  };

  const handleRemoveBlock = (cidr) => {
    removeBlockMutation.mutate(cidr);
  };

  const truncId = (id) => {
    if (!id) return "";
    return id.slice(0, 8) + "…" + id.slice(-4);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000 / 60); // minutes
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getExpiresIn = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const future = new Date(dateString);
    const diff = Math.floor((future - now) / 1000 / 60); // minutes
    if (diff < 1) return "expired";
    if (diff < 60) return `in ${diff}m`;
    if (diff < 1440) return `in ${Math.floor(diff / 60)}h`;
    return `in ${Math.floor(diff / 1440)}d`;
  };

  const handleTrustedPageChange = (newPage) => {
    if (newPage > 0 && newPage <= (trustedPagination.totalPages || 1)) {
      setTrustedPage(newPage);
    }
  };

  return (
    <React.Fragment>
      <Head title="Device & IP Trust"></Head>
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
                    <BlockTitle tag="h4">Device & IP trust</BlockTitle>
                    <BlockDes>
                      <p>Review new devices and manage the networks admins can sign in from.</p>
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

              {/* ============ PENDING REQUESTS ============ */}
              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">
                        Pending requests
                        {!pendingLoading && pendingRequests.length > 0 && (
                          <Badge className="ms-2 bg-warning text-dark">{pendingRequests.length}</Badge>
                        )}
                      </h6>
                    </BlockBetween>
                  </div>

                  {pendingLoading ? (
                    <div className="text-center py-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <p className="mb-0">No pending requests. New device or network sign-ins will show up here.</p>
                    </div>
                  ) : (
                    pendingRequests.map((request) => (
                      <div className="data-item py-2" key={request._id}>
                        <div className="d-flex justify-content-between align-items-start flex-wrap w-100">
                          <div className="">
                            <span className="fw-bold">
                              {request.adminId?.firstName} {request.adminId?.lastName}
                            </span>
                            <span className="data-value text-muted small d-block">{request.adminId?.email}</span>
                            <div className="mt-1">
                              <code className="bg-light px-2 py-1 rounded small">{request.requestedIp}</code>
                              <span className="mx-2 text-muted">·</span>
                              <span className="text-muted small">{truncId(request.deviceId)}</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-muted small">{request.userAgent}</span>
                              <span className="mx-2 text-muted">·</span>
                              <span className="text-muted small">first seen {getTimeAgo(request.createdAt)}</span>
                              <span className="mx-2 text-muted">·</span>
                              <span className="text-muted small">expires {getExpiresIn(request.expiresAt)}</span>
                            </div>
                          </div>
                          <div className="d-flex gap-2 align-items-center mt-2 mt-sm-0">
                            <Badge color="warning">pending</Badge>
                            <Button
                              size="sm"
                              color="primary"
                              onClick={() => handleApprove(request._id)}
                              disabled={approveMutation.isLoading}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => {
                                setDenyRequestId(request._id);
                                setDenyModal(true);
                              }}
                              disabled={denyMutation.isLoading}
                            >
                              Deny
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Block>

              {/* ============ DENY MODAL ============ */}
              <Modal isOpen={denyModal} toggle={() => setDenyModal(false)} className="modal-dialog-centered">
                <div className="modal-header">
                  <h5 className="modal-title">Deny Device Request</h5>
                  <button style={{ marginLeft: "auto" }} className="close" onClick={() => setDenyModal(false)}>
                    <Icon name="cross-sm"></Icon>
                  </button>
                </div>
                <ModalBody>
                  <div className="p-2">
                    <p>Do you want to block this IP address globally?</p>
                    <div style={{ display: "flex", gap: "1rem" }} className=" mt-3">
                      <Button
                        color="danger"
                        onClick={() => {
                          handleDeny(denyRequestId, true, "Suspicious login attempt");
                        }}
                      >
                        Block IP
                      </Button>
                      <Button
                        color="secondary"
                        onClick={() => {
                          handleDeny(denyRequestId, false, "Denied by admin");
                        }}
                      >
                        Deny Only
                      </Button>
                      <Button color="light" onClick={() => setDenyModal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </ModalBody>
              </Modal>

              {/* ============ TRUSTED DEVICES & ALLOWED RANGES ============ */}
              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">Trusted devices & allowed IP ranges</h6>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                        }}
                      >
                        {trustedPagination.totalPages > 1 && (
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                            }}
                          >
                            <Button
                              size="sm"
                              color="secondary"
                              onClick={() => handleTrustedPageChange(trustedPage - 1)}
                              disabled={trustedPage <= 1 || trustedLoading}
                            >
                              <Icon name="chevron-left"></Icon>
                            </Button>
                            <span className="d-flex align-items-center px-2 small">
                              {trustedPage} / {trustedPagination.totalPages || 1}
                            </span>
                            <Button
                              size="sm"
                              color="secondary"
                              onClick={() => handleTrustedPageChange(trustedPage + 1)}
                              disabled={trustedPage >= (trustedPagination.totalPages || 1) || trustedLoading}
                            >
                              <Icon name="chevron-right"></Icon>
                            </Button>
                          </div>
                        )}
                      </div>
                    </BlockBetween>
                  </div>

                  {trustedLoading ? (
                    <div className="text-center py-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : trustedDevices.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <p className="mb-0">No trusted devices configured yet.</p>
                    </div>
                  ) : (
                    trustedDevices.map((admin, index) => (
                      <div className="data-item py-3 border-bottom" key={admin.adminId || index}>
                        <div className="d-flex flex-wrap">
                          <div className="col-12 col-lg-12 mb-2">
                            <span className="fw-semibold">{admin.adminName || "Unknown Admin"}</span>
                            <span className="text-muted small d-block">{admin.adminEmail}</span>
                          </div>

                          <div className="col-12 col-lg-6 pe-lg-3">
                            <span className="text-muted small overline-title">Trusted Devices</span>
                            {admin.trustedDevices?.length > 0 ? (
                              admin.trustedDevices.map((device, idx) => (
                                <div
                                  className={`d-flex justify-content-between align-items-center py-1 ${
                                    idx === admin.trustedDevices?.length - 1 ? "" : "border-bottom"
                                  }`}
                                  key={idx}
                                >
                                  <div>
                                    <div className="small">
                                      <code className="bg-light px-1 py-0 rounded">{device.deviceIdMasked}</code>
                                      {device.label && <span className="ms-2 text-muted small">{device.label}</span>}
                                    </div>
                                    <div className="text-muted small">{device.userAgent?.substring(0, 40)}...</div>
                                    <div className="text-muted small">Last used: {getTimeAgo(device.lastUsedAt)}</div>
                                  </div>
                                  {/* <Button
                                    size="sm"
                                    color="outline-danger"
                                    disabled
                                    title="Revoke functionality coming soon"
                                  >
                                    Revoke
                                  </Button> */}
                                </div>
                              ))
                            ) : (
                              <div className="text-muted small py-1">No trusted devices</div>
                            )}
                          </div>

                          <div className="col-12 col-lg-6 ps-lg-3 mt-3 mt-lg-0">
                            <span className="text-muted small overline-title">Allowed IP Ranges</span>
                            {admin.allowedIpRanges?.length > 0 ? (
                              admin.allowedIpRanges.map((range, idx) => (
                                <div
                                  className={`d-flex justify-content-between align-items-center py-1 ${idx === admin.allowedIpRanges?.length - 1 ? "" : "border-bottom"}`}
                                  key={idx}
                                >
                                  <div>
                                    <div className="small">
                                      <code className="bg-success bg-opacity-10 text-success px-1 py-0 rounded">
                                        {range.cidr}
                                      </code>
                                      {range.label && <span className="ms-2 text-muted small">{range.label}</span>}
                                    </div>
                                    <div className="text-muted small">Added: {formatDate(range.addedAt)}</div>
                                  </div>
                                  <Button
                                    size="sm"
                                    // color="danger"
                                    // outline={true}
                                    className="text-danger"
                                    onClick={() => {
                                      handleAddBlock(range?.cidr);
                                    }}
                                    disabled={addBlockMutation.isLoading}
                                  >
                                    Block
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-muted small py-1">No allowed IP ranges</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Block>

              {/* ============ BLOCKED IP RANGES ============ */}
              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">
                        Blocked IP ranges
                        {!blockedLoading && blockedIPs.length > 0 && (
                          <Badge className="ms-2 bg-danger">{blockedIPs.length}</Badge>
                        )}
                      </h6>
                      <Button size="sm" color="danger" onClick={() => setShowAddBlock(!showAddBlock)}>
                        Add range
                      </Button>
                    </BlockBetween>
                  </div>

                  {/* Add Block Form */}
                  {showAddBlock && (
                    <div className="p-3 bg-light rounded mb-3">
                      <div className="row g-2">
                        <div className="col-md-5">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="CIDR, e.g. 185.220.101.0/24"
                            value={cidrInput}
                            onChange={(e) => setCidrInput(e.target.value)}
                          />
                        </div>
                        <div className="col-md-5">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Reason"
                            value={reasonInput}
                            onChange={(e) => setReasonInput(e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <Button
                            size="sm"
                            color="danger"
                            className="w-100 h-100 center"
                            onClick={() => handleAddBlock()}
                            disabled={addBlockMutation.isLoading}
                          >
                            Block
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {blockedLoading ? (
                    <div className="text-center py-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : blockedIPs.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <p className="mb-0">No blocked ranges.</p>
                    </div>
                  ) : (
                    blockedIPs.map((block) => (
                      <div className="data-item py-2" key={block._id}>
                        <div className="d-flex justify-content-between align-items-center flex-wrap w-100">
                          <div className="data-col">
                            <span className="data-label">
                              <code className="bg-danger bg-opacity-10 text-danger px-2 py-1 rounded">
                                {block.cidr}
                              </code>
                              <span className="text-muted small d-block mt-1">{block.reason}</span>
                            </span>
                            <span className="text-muted small">
                              blocked by {block.blockedBy?.email || "Unknown"} · {getTimeAgo(block.createdAt)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            color="outline-danger"
                            onClick={() => handleRemoveBlock(block.cidr)}
                            disabled={removeBlockMutation.isLoading}
                          >
                            Unblock
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Block>

              {/* ============ EMERGENCY SELF-APPROVAL ============ */}
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default DeviceAndIpPage;
