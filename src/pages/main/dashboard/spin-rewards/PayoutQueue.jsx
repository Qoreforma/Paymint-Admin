import React, { useState } from "react";
import {
  Card,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Spinner,
} from "reactstrap";
import { useGetRewardPayouts, useRetryRewardPayout } from "../../../../api/spinRewards";
import { Icon } from "../../../../components/Component";

const PayoutQueue = () => {
  const [statusFilter, setStatusFilter] = useState("failed");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [selectedPayout, setSelectedPayout] = useState(null);
  const [overridePhone, setOverridePhone] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useGetRewardPayouts(statusFilter, page, limit);
  const { mutate: retryPayout, isLoading: isRetrying } = useRetryRewardPayout();

  const payouts = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleOpenRetryModal = (payout) => {
    setSelectedPayout(payout);
    setOverridePhone(payout.recipientPhone || payout.userId?.phone || "");
    setIsModalOpen(true);
  };

  const handleExecuteRetry = () => {
    if (!selectedPayout) return;
    retryPayout(
      {
        id: selectedPayout._id,
        overrideRecipientPhone: overridePhone.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedPayout(null);
        },
      }
    );
  };

  return (
    <div className="py-2">
      <Card className="card-bordered overflow-hidden">
        {/* Header with Title and Filter Tabs */}
        <div className="card-inner border-bottom p-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 h-auto">
            <div>
              <h6 className="mb-0 fw-bold">Reward Payouts Queue</h6>
              <span className="text-muted fs-12px">
                Inspect and retry automated reward disbursements
              </span>
            </div>

            {/* Filter Pills */}
            <div className="spin-payout-tabs d-flex flex-wrap gap-1">
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === "failed"
                  ? "btn-danger fw-bold"
                  : "btn-outline-light text-dark"
                  }`}
                onClick={() => {
                  setStatusFilter("failed");
                  setPage(1);
                }}
              >
                <Icon name="alert-circle" className="me-1" />
                <span>Failed Payouts</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === "pending"
                  ? "btn-warning fw-bold text-dark"
                  : "btn-outline-light text-dark"
                  }`}
                onClick={() => {
                  setStatusFilter("pending");
                  setPage(1);
                }}
              >
                <Icon name="clock" className="me-1" />
                <span>Pending</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === "success"
                  ? "btn-success fw-bold"
                  : "btn-outline-light text-dark"
                  }`}
                onClick={() => {
                  setStatusFilter("success");
                  setPage(1);
                }}
              >
                <Icon name="check-circle" className="me-1" />
                <span>Success</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === ""
                  ? "btn-primary fw-bold"
                  : "btn-outline-light text-dark"
                  }`}
                onClick={() => {
                  setStatusFilter("");
                  setPage(1);
                }}
              >
                <span>All Payouts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clean Native Table */}
        <div className="table-responsive">
          <table className="table table-tranx mb-0">
            <thead className="table-light">
              <tr className="tb-tnx-head">
                <th>User</th>
                <th>Reward</th>
                <th>Recipient Phone</th>
                <th>Status</th>
                <th>Failure Reason</th>
                <th>Retries</th>
                <th>Last Attempt</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <Spinner size="sm" color="primary" className="me-2" />
                    <span>Loading payouts queue...</span>
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <Icon name="inbox" style={{ fontSize: "36px", opacity: 0.5 }} className="d-block mb-2" />
                    <span>No reward payouts found for this filter.</span>
                  </td>
                </tr>
              ) : (
                payouts.map((row) => (
                  <tr key={row._id} className="tb-tnx-item">
                    {/* User */}
                    <td>
                      <div>
                        <span className="fw-bold d-block text-dark">
                          {row.userId
                            ? `${row.userId.firstname || ""} ${row.userId.lastname || ""}`.trim() || "User"
                            : "Unknown User"}
                        </span>
                        <span className="text-muted fs-11px">{row.userId?.email || "No email"}</span>
                      </div>
                    </td>

                    {/* Reward */}
                    <td>
                      <div>
                        <span className="fw-bold text-success d-block">
                          ₦{Number(row.rewardValue || 0).toLocaleString()}
                        </span>
                        <Badge
                          color={row.rewardType === "balance" ? "info" : "warning"}
                          className="text-uppercase px-2 py-0.5 fs-10px mt-1"
                        >
                          {row.rewardType}
                        </Badge>
                      </div>
                    </td>

                    {/* Recipient Phone */}
                    <td>
                      <span className="fs-12px">{row.recipientPhone || row.userId?.phone || "—"}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`badge fs-11px px-2 py-1 ${row.status === "success"
                          ? "bg-success"
                          : row.status === "failed"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                          }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Failure Reason */}
                    <td>
                      <span
                        className="text-danger fs-12px text-truncate d-inline-block"
                        style={{ maxWidth: "200px" }}
                        title={row.failureReason}
                      >
                        {row.failureReason || "—"}
                      </span>
                    </td>

                    {/* Retries */}
                    <td>
                      <span className="badge bg-light text-dark fs-11px">{row.retryCount || 0}</span>
                    </td>

                    {/* Last Attempt */}
                    <td>
                      <span className="fs-11px text-muted">
                        {row.lastAttemptAt ? new Date(row.lastAttemptAt).toLocaleString() : "—"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="text-end">
                      {row.status !== "success" ? (
                        <Button
                          color="primary"
                          size="sm"
                          outline
                          onClick={() => handleOpenRetryModal(row)}
                        >
                          <Icon name="reload" className="me-1" />
                          Retry
                        </Button>
                      ) : (
                        <span className="text-success fs-12px fw-bold">
                          <Icon name="check-circle" className="me-1" />
                          Fulfilled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > limit && (
          <div className="card-inner py-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="text-muted fs-12px">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
            </span>
            <div className="d-flex gap-1">
              <Button
                color="light"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                color="light"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Retry Modal */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)}>
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          Retry Reward Fulfillment
        </ModalHeader>
        <ModalBody>
          {selectedPayout && (
            <div>
              <p className="text-muted fs-13px mb-3">
                You are retrying fulfillment for{" "}
                <strong>
                  ₦{selectedPayout.rewardValue?.toLocaleString()}{" "}
                  {selectedPayout.rewardType}
                </strong>{" "}
                awarded to{" "}
                <strong>{selectedPayout.userId?.email || "User"}</strong>.
              </p>

              {selectedPayout.failureReason && (
                <div className="alert alert-danger py-2 px-3 fs-12px mb-3">
                  <strong>Last Error:</strong> {selectedPayout.failureReason}
                </div>
              )}

              {selectedPayout.rewardType === "airtime" && (
                <FormGroup>
                  <Label className="form-label fs-13px">
                    Recipient Phone Number (Override if unverified/invalid):
                  </Label>
                  <Input
                    type="tel"
                    value={overridePhone}
                    onChange={(e) => setOverridePhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                  />
                </FormGroup>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            outline
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleExecuteRetry}
            disabled={isRetrying}
          >
            {isRetrying ? "Retrying..." : "Confirm & Retry Now"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PayoutQueue;
