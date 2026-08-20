import React from "react";
import { Card, Row, Col, Spinner, Badge } from "reactstrap";
import { Table } from "antd";
import { useGetRewardAnalytics } from "../../../../api/spinRewards";
import { Icon } from "../../../../components/Component";

const SpinAnalytics = () => {
  const { data: analytics, isLoading } = useGetRewardAnalytics();

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="text-muted mt-2">Loading reward analytics...</p>
      </div>
    );
  }

  const {
    totalSpins = 0,
    totalPayoutValue = 0,
    totalBalanceDisbursed = 0,
    totalAirtimeDisbursed = 0,
    payoutsCountByStatus = { pending: 0, success: 0, failed: 0 },
    tierBreakdowns = [],
  } = analytics || {};

  return (
    <div className="py-2">
      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col sm="6" lg="3">
          <Card className="card-bordered text-center bg-light">
            <div className="card-inner">
              <span className="text-muted small text-uppercase fw-bold">
                Total Spins Claimed
              </span>
              <h3 className="text-primary mt-2 mb-0 fw-bold">
                {totalSpins.toLocaleString()}
              </h3>
              <span className="text-muted fs-12px">All-time across all tiers</span>
            </div>
          </Card>
        </Col>

        <Col sm="6" lg="3">
          <Card className="card-bordered text-center bg-light">
            <div className="card-inner">
              <span className="text-muted small text-uppercase fw-bold">
                Total Payout Value
              </span>
              <h3 className="text-success mt-2 mb-0 fw-bold">
                ₦{totalPayoutValue.toLocaleString()}
              </h3>
              <span className="text-muted fs-12px">Successfully fulfilled</span>
            </div>
          </Card>
        </Col>

        <Col sm="6" lg="3">
          <Card className="card-bordered text-center bg-light">
            <div className="card-inner">
              <span className="text-muted small text-uppercase fw-bold">
                Wallet Cash Disbursed
              </span>
              <h3 className="text-info mt-2 mb-0 fw-bold">
                ₦{totalBalanceDisbursed.toLocaleString()}
              </h3>
              <span className="text-muted fs-12px">Direct wallet credits</span>
            </div>
          </Card>
        </Col>

        <Col sm="6" lg="3">
          <Card className="card-bordered text-center bg-light">
            <div className="card-inner">
              <span className="text-muted small text-uppercase fw-bold">
                Airtime Recharged
              </span>
              <h3 className="text-warning mt-2 mb-0 fw-bold">
                ₦{totalAirtimeDisbursed.toLocaleString()}
              </h3>
              <span className="text-muted fs-12px">Airtime top-up value</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Payout Status Pills */}
      <Card className="card-bordered mb-4">
        <div className="card-inner">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h6 className="mb-0 fw-bold">Fulfillment Status Breakdown</h6>
              <span className="text-muted fs-12px">
                Real-time monitoring of reward payouts
              </span>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Badge color="success" className="px-3 py-2 fs-13px d-flex align-items-center">
                <Icon name="check-circle" className="me-1" />
                <span>Success: {payoutsCountByStatus.success || 0}</span>
              </Badge>
              <Badge color="warning" className="px-3 py-2 fs-13px d-flex align-items-center">
                <Icon name="clock" className="me-1" />
                <span>Pending: {payoutsCountByStatus.pending || 0}</span>
              </Badge>
              <Badge color="danger" className="px-3 py-2 fs-13px d-flex align-items-center">
                <Icon name="alert-circle" className="me-1" />
                <span>Failed: {payoutsCountByStatus.failed || 0}</span>
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Per-Tier Win Distribution Tables */}
      <h6 className="fw-bold mb-3">Tier Win Distribution Accuracy</h6>

      {tierBreakdowns.length === 0 ? (
        <Card className="card-bordered p-4 text-center text-muted">
          No tier analytics data recorded yet.
        </Card>
      ) : (
        tierBreakdowns.map((tier) => {
          const columns = [
            {
              title: "Segment Label",
              dataIndex: "label",
              key: "label",
              render: (label, row) => (
                <span className="fw-bold">
                  {label} (₦{row.rewardValue} {row.rewardType})
                </span>
              ),
            },
            {
              title: "Configured Tickets",
              dataIndex: "configuredTicketCount",
              key: "configuredTicketCount",
              render: (tickets) => (
                <span className="badge bg-outline-primary">{tickets || 0}</span>
              ),
            },
            {
              title: "Actual Wins",
              dataIndex: "actualWinCount",
              key: "actualWinCount",
              render: (wins) => <span className="fw-bold">{wins}</span>,
            },
            {
              title: "Actual Distribution %",
              dataIndex: "actualWinPercentage",
              key: "actualWinPercentage",
              render: (pct) => (
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="progress flex-grow-1"
                    style={{ height: "6px", width: "80px" }}
                  >
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="fs-12px fw-bold">{pct}%</span>
                </div>
              ),
            },
          ];

          return (
            <Card key={tier.tierId} className="card-bordered mb-4">
              <div className="card-inner border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <h6 className="mb-0 fw-bold text-primary">{tier.tierName}</h6>
                  <span className="text-muted fs-12px">
                    Threshold: {tier.threshold} referrals · Total Spins:{" "}
                    {tier.spinsCount}
                  </span>
                </div>

                <div className="text-end">
                  <span className="fs-12px text-muted d-block">
                    Total Disbursed: ₦{tier.totalDisbursed.toLocaleString()}
                  </span>
                  {tier.budgetCap && (
                    <span className="fs-11px text-muted">
                      Budget Cap: ₦{tier.budgetCap.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <Table
                dataSource={tier.actualDistribution}
                columns={columns}
                rowKey={(row) => `${row.label}_${row.rewardValue}`}
                pagination={false}
                size="middle"
              />
            </Card>
          );
        })
      )}
    </div>
  );
};

export default SpinAnalytics;
