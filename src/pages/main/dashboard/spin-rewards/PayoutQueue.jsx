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
  ButtonGroup,
} from "reactstrap";
import { Table } from "antd";
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

  const columns = [
    {
      title: "User",
      dataIndex: "userId",
      key: "user",
      render: (user) => (
        <div>
          <span className="fw-bold d-block text-dark">
            {user ? `${user.firstname || ""} ${user.lastname || ""}` : "Unknown User"}
          </span>
          <span className="text-muted fs-12px">{user?.email || "No email"}</span>
        </div>
      ),
    },
    {
      title: "Reward",
      key: "reward",
      render: (_, row) => (
        <div>
          <span className="fw-bold text-success d-block">
            ₦{row.rewardValue?.toLocaleString()}
          </span>
          <Badge
            color={row.rewardType === "balance" ? "info" : "warning"}
            className="text-uppercase px-2 py-1 fs-10px mt-1"
          >
            {row.rewardType}
          </Badge>
        </div>
      ),
    },
    {
      title: "Recipient Phone",
      dataIndex: "recipientPhone",
      key: "recipientPhone",
      render: (phone, row) => (
        <span className="fs-12px">
          {phone || row.userId?.phone || "—"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          color={
            status === "success"
              ? "success"
              : status === "failed"
              ? "danger"
              : "warning"
          }
          className="text-capitalize px-2 py-1 fs-12px"
        >
          {status}
        </Badge>
      ),
    },
    {
      title: "Failure Reason",
      dataIndex: "failureReason",
      key: "failureReason",
      render: (reason) => (
        <span
          className="text-danger fs-12px text-truncate d-inline-block"
          style={{ maxWidth: "220px" }}
          title={reason}
        >
          {reason || "—"}
        </span>
      ),
    },
    {
      title: "Retries",
      dataIndex: "retryCount",
      key: "retryCount",
      render: (count) => <span className="fs-12px">{count || 0}</span>,
    },
    {
      title: "Last Attempt",
      dataIndex: "lastAttemptAt",
      key: "lastAttemptAt",
      render: (date) => (
        <span className="fs-12px text-muted">
          {date ? new Date(date).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <div>
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
            <span className="text-success fs-12px">
              <Icon name="check" /> Fulfilled
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="py-2">
      <Card className="card-bordered">
        <div className="card-inner border-bottom p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="mb-0 fw-bold">Reward Payouts Queue</h6>
            <span className="text-muted fs-12px">
              Inspect and retry automated reward disbursements
            </span>
          </div>

          {/* Status Filter Buttons */}
          <ButtonGroup size="sm">
            <Button
              color={statusFilter === "failed" ? "danger" : "light"}
              onClick={() => {
                setStatusFilter("failed");
                setPage(1);
              }}
            >
              Failed Payouts
            </Button>
            <Button
              color={statusFilter === "pending" ? "warning" : "light"}
              onClick={() => {
                setStatusFilter("pending");
                setPage(1);
              }}
            >
              Pending
            </Button>
            <Button
              color={statusFilter === "success" ? "success" : "light"}
              onClick={() => {
                setStatusFilter("success");
                setPage(1);
              }}
            >
              Success
            </Button>
            <Button
              color={statusFilter === "" ? "primary" : "light"}
              onClick={() => {
                setStatusFilter("");
                setPage(1);
              }}
            >
              All
            </Button>
          </ButtonGroup>
        </div>

        <Table
          loading={isLoading}
          dataSource={payouts}
          columns={columns}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (p) => setPage(p),
          }}
        />
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
