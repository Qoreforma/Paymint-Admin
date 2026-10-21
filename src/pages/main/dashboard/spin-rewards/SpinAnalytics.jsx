import React, { useState } from "react";
import { Card, Row, Col, Spinner } from "reactstrap";
import { useGetRewardAnalytics } from "../../../../api/spinRewards";
import { Icon, Button } from "../../../../components/Component";
import { formatDateWithHyphen } from "../../../../utils/Utils";
import ReferralDrilldownModal from "./ReferralDrilldownModal";

const SpinAnalytics = () => {
  const { data: analytics, isLoading } = useGetRewardAnalytics();
  const [drilldownModal, setDrilldownModal] = useState({
    open: false,
    filter: "all",
    tierId: null,
  });

  const openDrilldown = (filter = "all", tierId = null) => {
    setDrilldownModal({
      open: true,
      filter,
      tierId: tierId || analytics?.activeCampaign?.tierId || null,
    });
  };

  const closeDrilldown = () => {
    setDrilldownModal((prev) => ({ ...prev, open: false }));
  };

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
    totalTicketsEarned = 0,
    totalPendingTickets = 0,
    activeCampaign = null,
    payoutsCountByStatus = { pending: 0, success: 0, failed: 0 },
    tierBreakdowns = [],
  } = analytics || {};

  return (
    <div className="py-2">
      {/* ── Active Campaign Spotlight Card ─────────────────────────── */}
      {activeCampaign?.hasActiveTier ? (
        <Card className="card-bordered mb-4 border-success bg-success-dim shadow-sm">
          <div className="card-inner p-3">
            {/* Header with proper vertical spacing and breathing room */}
            <div className="pb-3 border-bottom border-success border-opacity-25 mb-3">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="badge bg-success text-white px-2 py-1 fs-11px fw-bold shadow-xs">
                    <Icon name="activity" className="me-1" />
                    LIVE CAMPAIGN
                  </span>
                  <h5 className="mb-0 fw-bold text-dark">{activeCampaign.tierName}</h5>
                  <span className="badge bg-white text-dark border fs-11px">
                    Threshold: {activeCampaign.threshold} referrals / spin
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success bg-white d-inline-flex align-items-center gap-1 shadow-xs"
                  onClick={() => openDrilldown("all", activeCampaign.tierId)}
                >
                  <Icon name="users" />
                  <span>View Referral Drilldown</span>
                </button>
              </div>

              {/* Dedicated sub-row for Campaign Window with clean spacing below live campaign */}
              <div className="mt-2 pt-1 text-muted fs-12px d-flex align-items-center gap-1">
                <Icon name="calendar" className="text-success" />
                {activeCampaign.campaignStart || activeCampaign.campaignEnd ? (
                  <span>
                    Campaign Window:{" "}
                    <strong className="text-dark">
                      {activeCampaign.campaignStart ? formatDateWithHyphen(activeCampaign.campaignStart) : "Launch"}
                      {" – "}
                      {activeCampaign.campaignEnd ? formatDateWithHyphen(activeCampaign.campaignEnd) : "Ongoing"}
                    </strong>
                  </span>
                ) : (
                  <span><strong className="text-dark">Ongoing Campaign</strong> (No Expiry Date)</span>
                )}
              </div>
            </div>

            {/* 4 Interactive Spotlight Metric Cards */}
            <Row className="g-2">
              <Col xs="6" sm="3">
                <div
                  className="bg-white p-2 rounded border text-center shadow-xs spin-interactive-card"
                  onClick={() => openDrilldown("all", activeCampaign.tierId)}
                  title="Click to view all campaign referees and referrers"
                >
                  <span className="text-muted fs-11px text-uppercase fw-bold d-block">
                    Campaign Referrals
                  </span>
                  <h4 className="text-primary fw-bold my-1">
                    {(activeCampaign.totalCampaignReferrals || 0).toLocaleString()}
                  </h4>
                  <span className="text-muted fs-11px d-block">Referees joined in campaign</span>
                  <span className="spin-card-click-hint">Click to inspect ↗</span>
                </div>
              </Col>
              <Col xs="6" sm="3">
                <div
                  className="bg-white p-2 rounded border text-center shadow-xs spin-interactive-card"
                  onClick={() => openDrilldown("all", activeCampaign.tierId)}
                  title="Click to view all active referrers and progress"
                >
                  <span className="text-muted fs-11px text-uppercase fw-bold d-block">
                    Active Referrers
                  </span>
                  <h4 className="text-info fw-bold my-1">
                    {(activeCampaign.activeReferrersCount || 0).toLocaleString()}
                  </h4>
                  <span className="text-muted fs-11px d-block">Users actively referring</span>
                  <span className="spin-card-click-hint">Click to inspect ↗</span>
                </div>
              </Col>
              <Col xs="6" sm="3">
                <div
                  className="bg-white p-2 rounded border text-center shadow-xs spin-interactive-card"
                  onClick={() => openDrilldown("unlocked", activeCampaign.tierId)}
                  title="Click to view referrers with unlocked spins"
                >
                  <span className="text-muted fs-11px text-uppercase fw-bold d-block">
                    Spins Unlocked
                  </span>
                  <h4 className="text-success fw-bold my-1">
                    {(activeCampaign.ticketsEarned || 0).toLocaleString()}
                  </h4>
                  <span className="text-muted fs-11px d-block">Milestone tickets earned</span>
                  <span className="spin-card-click-hint text-success">Filter unlocked ↗</span>
                </div>
              </Col>
              <Col xs="6" sm="3">
                <div
                  className="bg-white p-2 rounded border text-center shadow-xs spin-interactive-card"
                  onClick={() => openDrilldown("needsClose", activeCampaign.tierId)}
                  title="Click to view referrers close to next spin"
                >
                  <span className="text-muted fs-11px text-uppercase fw-bold d-block">
                    Pending Spins
                  </span>
                  <h4 className="text-warning fw-bold my-1">
                    {(activeCampaign.pendingTickets || 0).toLocaleString()}
                  </h4>
                  <span className="text-muted fs-11px d-block">Waiting to be spun by users</span>
                  <span className="spin-card-click-hint text-warning">Inspect close ↗</span>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      ) : (
        <Card className="card-bordered mb-4 border-light bg-lighter">
          <div className="card-inner p-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-secondary text-white">NO ACTIVE CAMPAIGN</span>
              <span className="text-muted fs-13px">
                No reward tier is currently within an active campaign date window.
              </span>
            </div>
            <span className="text-muted fs-12px">Configure active dates in the Reward Tiers & Wheels tab</span>
          </div>
        </Card>
      )}

      {/* Responsive KPI Grid (adapts cleanly whether aside is open or closed) */}
      <div className="spin-kpi-grid">
        <div
          className="spin-kpi-card spin-interactive-card"
          onClick={() => openDrilldown("all")}
          title="Click to view campaign referrals drilldown"
        >
          <span className="text-muted small text-uppercase fw-bold d-block">
            Campaign Referrals
          </span>
          <h3 className="text-primary mt-2 mb-0 fw-bold">
            {(activeCampaign?.totalCampaignReferrals ?? 0).toLocaleString()}
          </h3>
          <span className="text-muted fs-12px d-block">
            {activeCampaign?.tierName ? `In ${activeCampaign.tierName}` : "Active campaign total"}
          </span>
          <span className="spin-card-click-hint">Click to inspect ↗</span>
        </div>

        <div className="spin-kpi-card">
          <span className="text-muted small text-uppercase fw-bold d-block">
            Unclaimed Spins
          </span>
          <h3 className="text-warning mt-2 mb-0 fw-bold">
            {totalPendingTickets.toLocaleString()}
          </h3>
          <span className="text-muted fs-12px">Tickets pending user spin</span>
        </div>

        <div className="spin-kpi-card">
          <span className="text-muted small text-uppercase fw-bold d-block">
            Total Spins Claimed
          </span>
          <h3 className="text-info mt-2 mb-0 fw-bold">
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
          <h3 className="text-primary mt-2 mb-0 fw-bold">
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
        <h6 className="fw-bold mb-0">Tier Win Distribution Accuracy & Referrals</h6>
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
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="mb-0 fw-bold text-primary">{tier.tierName}</h6>
                  {tier.isActive ? (
                    <span className="badge bg-success-dim text-success" style={{ fontSize: "10px" }}>
                      Active
                    </span>
                  ) : (
                    <span className="badge bg-light text-muted border" style={{ fontSize: "10px" }}>
                      Inactive
                    </span>
                  )}
                  {tier.validFrom || tier.validUntil ? (
                    <span className="text-muted fs-11px">
                      ({tier.validFrom ? formatDateWithHyphen(tier.validFrom) : "Launch"} – {tier.validUntil ? formatDateWithHyphen(tier.validUntil) : "Ongoing"})
                    </span>
                  ) : null}
                </div>
                <div className="text-muted fs-12px d-flex flex-wrap align-items-center gap-2">
                  <span>Threshold: <strong className="text-dark">{tier.threshold} refs / spin</strong></span>
                  <span>•</span>
                  <span>Total Referrals: <strong className="text-primary">{tier.totalReferrals?.toLocaleString() ?? 0}</strong></span>
                  <span>•</span>
                  <span>Active Referrers: <strong className="text-dark">{tier.activeReferrersCount?.toLocaleString() ?? 0}</strong></span>
                  <span>•</span>
                  <span>Spins Earned: <strong className="text-dark">{tier.ticketsEarned?.toLocaleString() ?? 0}</strong></span>
                  <span>•</span>
                  <span>Spins Claimed: <strong className="text-dark">{tier.spinsCount?.toLocaleString() ?? 0}</strong></span>
                  <span>•</span>
                  <span>Pending Spins: <strong className="text-warning">{tier.pendingTickets?.toLocaleString() ?? 0}</strong></span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Button
                  color="light"
                  size="xs"
                  className="btn-dim"
                  onClick={() => openDrilldown("all", tier.tierId)}
                >
                  <Icon name="users" className="me-1" />
                  View Referrals
                </Button>
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

      {/* Campaign Referrals & Referee Drilldown Modal */}
      {drilldownModal.open && (
        <ReferralDrilldownModal
          isOpen={drilldownModal.open}
          toggle={closeDrilldown}
          tierId={drilldownModal.tierId}
          initialFilter={drilldownModal.filter}
        />
      )}
    </div>
  );
};

export default SpinAnalytics;
