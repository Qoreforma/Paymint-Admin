import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, Badge } from "reactstrap";
import { Block, Button, Col, DataTableBody, DataTableHead, DataTableItem, DataTableRow, Icon, PaginationComponent, Row } from "../../../../components/Component";
import { formatDateWithTime } from "../../../../utils/Utils";
import { useGetInAppNotificationGroupDetails } from "../../../../api/inAppNotifications";
import LoadingSpinner from "../../../components/spinner";

const ViewDetailsModal = ({ isOpen, toggle, group }) => {
  const [recipientPage, setRecipientPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading } = useGetInAppNotificationGroupDetails(
    group?.groupKey,
    recipientPage,
    itemsPerPage
  );

  const groupDetails = data?.data?.group || group;
  const recipients = data?.data?.recipients || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };

  const getStatusBadge = (status, expiresAt) => {
    if (status === "deleted") {
      return <Badge color="danger">Deleted</Badge>;
    }
    if (status === "expired" || (expiresAt && new Date(expiresAt) <= new Date())) {
      return <Badge color="warning">Expired</Badge>;
    }
    return <Badge color="success">Active</Badge>;
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "announcement":
        return <Badge color="primary">Announcement</Badge>;
      case "alert":
        return <Badge color="info">System Alert</Badge>;
      case "transaction":
        return <Badge color="secondary">Transaction</Badge>;
      case "referral":
        return <Badge color="dark">Referral</Badge>;
      default:
        return <Badge color="light" className="text-dark">{type || "General"}</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered modal-lg" size="lg">
      <ModalHeader toggle={toggle} className="border-bottom">
        <div className="d-flex align-items-center">
          <Icon name="bell-fill" className="text-primary me-2 fs-4" />
          <span>In-App Notification Details</span>
        </div>
      </ModalHeader>
      <ModalBody>
        {isLoading && !data ? (
          <div className="py-5 text-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div>
            {/* Header info */}
            <div className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h5 className="title mb-0">{groupDetails?.title || "Untitled Notification"}</h5>
                  {getTypeBadge(groupDetails?.type)}
                  {getStatusBadge(groupDetails?.status, groupDetails?.expiresAt)}
                </div>
                <span className="text-muted small">
                  Group Key: <code className="text-primary">{groupDetails?.groupKey}</code>
                </span>
              </div>
            </div>

            {/* Notification message card */}
            <div className="mb-4">
              <label className="form-label fw-bold text-secondary text-uppercase small">Notification Message</label>
              <div
                className="p-3 bg-light rounded border text-break"
                style={{ whiteSpace: "pre-wrap", maxHeight: "180px", overflowY: "auto" }}
              >
                {groupDetails?.message}
              </div>
            </div>

            {/* Metrics & Dates Grid */}
            <Row className="g-3 mb-4">
              <Col sm="6" md="3">
                <div className="border rounded p-3 text-center bg-white shadow-sm">
                  <span className="text-muted small d-block mb-1">Total Recipients</span>
                  <h4 className="mb-0 text-primary fw-bold">
                    {(groupDetails?.recipientCount || 0).toLocaleString()}
                  </h4>
                </div>
              </Col>
              <Col sm="6" md="3">
                <div className="border rounded p-3 text-center bg-white shadow-sm">
                  <span className="text-muted small d-block mb-1">Read by Users</span>
                  <h4 className="mb-0 text-success fw-bold">
                    {(groupDetails?.readCount || 0).toLocaleString()}
                  </h4>
                </div>
              </Col>
              <Col sm="6" md="3">
                <div className="border rounded p-3 text-center bg-white shadow-sm">
                  <span className="text-muted small d-block mb-1">Read Rate</span>
                  <h4 className="mb-0 text-info fw-bold">
                    {groupDetails?.readRate || 0}%
                  </h4>
                </div>
              </Col>
              <Col sm="6" md="3">
                <div className="border rounded p-3 text-center bg-white shadow-sm">
                  <span className="text-muted small d-block mb-1">Unread Count</span>
                  <h4 className="mb-0 text-secondary fw-bold">
                    {Math.max(0, (groupDetails?.recipientCount || 0) - (groupDetails?.readCount || 0)).toLocaleString()}
                  </h4>
                </div>
              </Col>
            </Row>

            {/* Timestamps */}
            <div className="p-3 bg-lighter rounded mb-4">
              <Row className="g-2 text-muted small">
                <Col sm="6">
                  <strong>First Dispatched: </strong>
                  {groupDetails?.createdAt ? formatDateWithTime(groupDetails.createdAt) : "N/A"}
                </Col>
                <Col sm="6">
                  <strong>Expires At (TTL): </strong>
                  {groupDetails?.expiresAt ? (
                    <span className={new Date(groupDetails.expiresAt) <= new Date() ? "text-danger fw-bold" : "text-success fw-bold"}>
                      {formatDateWithTime(groupDetails.expiresAt)}
                    </span>
                  ) : (
                    <span className="text-secondary">No Expiry (Permanent)</span>
                  )}
                </Col>
              </Row>
            </div>

            {/* Sample Recipients Section */}
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="title mb-0">Delivered User Inboxes (Sample)</h6>
                <span className="text-muted small">Showing up to {itemsPerPage} per page</span>
              </div>

              {recipients && recipients.length > 0 ? (
                <div className="border rounded overflow-hidden">
                  <DataTableBody className="is-compact mb-0">
                    <DataTableHead className="bg-light fw-bold text-secondary">
                      <DataTableRow>
                        <span className="small fw-bold">User</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="small fw-bold">Status</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="small fw-bold">Read At</span>
                      </DataTableRow>
                    </DataTableHead>
                    {recipients.map((item, idx) => {
                      const user = item.notifiableUser;
                      const displayName = user
                        ? `${user.firstName || user.firstname || ""} ${user.lastName || user.lastname || ""}`.trim() || user.email
                        : `User ${String(item.notifiableId).slice(-6)}`;
                      return (
                        <DataTableItem key={item._id || idx} className="py-2">
                          <DataTableRow>
                            <div>
                              <span className="fw-medium text-dark d-block">{displayName}</span>
                              {user?.email && <span className="text-muted small">{user.email}</span>}
                            </div>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            {item.isRead ? (
                              <Badge color="success" className="badge-dim">Read</Badge>
                            ) : (
                              <Badge color="warning" className="badge-dim">Unread</Badge>
                            )}
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span className="text-muted small">
                              {item.readAt ? formatDateWithTime(item.readAt) : "—"}
                            </span>
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })}
                  </DataTableBody>

                  {pagination.total > itemsPerPage && (
                    <div className="p-2 border-top bg-light">
                      <PaginationComponent
                        itemPerPage={itemsPerPage}
                        totalItems={pagination.total}
                        paginate={(page) => setRecipientPage(page)}
                        currentPage={recipientPage}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center text-muted border rounded bg-light small">
                  No recipient samples found.
                </div>
              )}
            </div>

            <div className="text-end mt-4 pt-2 border-top">
              <Button color="secondary" onClick={toggle}>
                Close
              </Button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ViewDetailsModal;
