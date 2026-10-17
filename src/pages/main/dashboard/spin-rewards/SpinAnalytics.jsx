import React from "react";
import { Card, Row, Col, Spinner } from "reactstrap";
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
      {/* Responsive KPI Grid (adapts cleanly whether aside is open or closed) */}
      <div className="spin-kpi-grid">
        <div className="spin-kpi-card">
          <span className="text-muted small text-uppercase fw-bold d-block">
            Total Spins Claimed
          </span>
          <h3 className="text-primary mt-2 mb-0 fw-bold">
            {totalSpins.toLocaleString()}
          </h3>
          <span className="text-muted fs-12px">All-time lifetime spins</span>
        </div>

        <div className="spin-kpi-card">
          <span className="text-muted small text-uppercase fw-bold d-block">
            Total Disbursed
          </span>
          <h3 className="text-success mt-2 mb-0 fw-bold">
            ₦{totalPayoutValue.toLocaleString()}
          </h3>
          <span className="text-muted fs-12px">Combined reward payouts</span>
        </div>

        <div className="spin-kpi-card">
          <span className="text-muted small text-uppercase fw-bold d-block">
            Wallet Rewards
          </span>
          <h3 className="text-info mt-2 mb-0 fw-bold">
            ₦{totalBalanceDisbursed.toLocaleString()}
          </h3>
          <span className="text-muted fs-12px">Credited to wallet balance</span>
        </div>

        <div className="spin-kpi-card">
          <span className="text-muted small text-uppercase fw-bold d-block">
            Airtime Rewards
          </span>
          <h3 className="text-warning mt-2 mb-0 fw-bold">
            ₦{totalAirtimeDisbursed.toLocaleString()}
          </h3>
          <span className="text-muted fs-12px">Airtime top-up value</span>
        </div>
      </div>

      {/* Payout Status Breakdown */}
      <Card className="card-bordered mb-4 spin-fulfillment-card">
        <div className="card-inner p-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 h-auto">
            <div>
              <h6 className="mb-0 fw-bold">Fulfillment Status Breakdown</h6>
              <span className="text-muted fs-12px">
                Real-time monitoring of automated reward payouts
              </span>
            </div>

            <div className="spin-status-pills d-flex flex-wrap gap-2">
              <div className="spin-status-pill success d-flex align-items-center gap-1 px-3 py-2 rounded">
                <Icon name="check-circle" className="text-success" />
                <span className="fs-12px fw-bold text-success">
                  Success: {payoutsCountByStatus.success || 0}
                </span>
              </div>
              <div className="spin-status-pill warning d-flex align-items-center gap-1 px-3 py-2 rounded">
                <Icon name="clock" className="text-warning" />
                <span className="fs-12px fw-bold text-warning">
                  Pending: {payoutsCountByStatus.pending || 0}
                </span>
              </div>
              <div className="spin-status-pill danger d-flex align-items-center gap-1 px-3 py-2 rounded">
                <Icon name="alert-circle" className="text-danger" />
                <span className="fs-12px fw-bold text-danger">
                  Failed: {payoutsCountByStatus.failed || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Per-Tier Win Distribution Tables */}
      <div className="mt-4 pt-1 mb-3">
        <h6 className="fw-bold mb-0">Tier Win Distribution Accuracy</h6>
      </div>

      {tierBreakdowns.length === 0 ? (
        <Card className="card-bordered p-4 text-center text-muted">
          No tier analytics data recorded yet.
        </Card>
      ) : (
        tierBreakdowns.map((tier) => (
          <Card key={tier.tierId} className="card-bordered mb-4 overflow-hidden">
            <div className="card-inner border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2 bg-lighter h-auto">
              <div>
                <h6 className="mb-0 fw-bold text-primary">{tier.tierName}</h6>
                <span className="text-muted fs-12px">
                  Threshold: {tier.threshold} referrals · Total Spins: {tier.spinsCount}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-white text-dark border fs-12px px-3 py-1 shadow-sm">
                  Total Disbursed: <strong className="text-primary ms-1">₦{tier.totalDisbursed.toLocaleString()}</strong>
                </span>
                {tier.budgetCap && (
                  <span className="badge bg-light text-muted border fs-11px">
                    Budget Cap: ₦{tier.budgetCap.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-tranx mb-0" style={{ minWidth: "520px" }}>
                <thead className="table-light">
                  <tr className="tb-tnx-head">
                    <th>Segment Label</th>
                    <th style={{ width: "170px" }}>Configured Tickets</th>
                    <th style={{ width: "130px" }}>Actual Wins</th>
                    <th style={{ width: "220px" }}>Actual Distribution %</th>
                  </tr>
                </thead>
                <tbody>
                  {tier.actualDistribution && tier.actualDistribution.length > 0 ? (
                    tier.actualDistribution.map((row, idx) => (
                      <tr key={idx} className="tb-tnx-item">
                        <td>
                          <span className="fw-bold">
                            {row.label} (₦{row.rewardValue} {row.rewardType})
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-outline-primary fs-12px">
                            {row.configuredTicketCount || 0}
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold fs-13px">{row.actualWinCount || 0}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="progress flex-grow-1"
                              style={{ height: "6px", width: "80px", backgroundColor: "#e2e8f0" }}
                            >
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${Math.min(row.actualWinPercentage || 0, 100)}%` }}
                              />
                            </div>
                            <span className="fs-12px fw-bold text-dark">{row.actualWinPercentage || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3 text-muted">
                        No win distribution records yet for this tier.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default SpinAnalytics;
