import React from "react";
import { Link } from "react-router-dom";
import { Badge, Spinner } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { formatter, formatDateWithTime } from "../../../../utils/Utils";
import {
  useGetProviderBalances,
  useRefreshProviderBalances,
  useCheckProviderBalance,
} from "../../../../api/service-providers";
import NoIcon from "../../../../images/no-image-icon.png";
import "./ProviderWalletBalancesSection.css";

export default function ProviderWalletBalancesSection() {
  const { data: response, isLoading, isFetching } = useGetProviderBalances();
  const { mutate: refreshAll, isLoading: isRefreshing } = useRefreshProviderBalances();
  const { mutate: checkBalance, isLoading: isCheckingSingle } = useCheckProviderBalance();
  const [checkingCode, setCheckingCode] = React.useState(null);

  const providers = response?.data || [];

  // Summary Metrics
  const totalUpstreamFloat = providers.reduce(
    (sum, p) => sum + (Number(p.currentBalance) || 0),
    0
  );
  const criticalCount = providers.filter((p) => p.balanceStatus === "critical").length;
  const urgentCount = providers.filter((p) => p.balanceStatus === "urgent").length;
  const warningCount = providers.filter((p) => p.balanceStatus === "warning").length;
  const healthyCount = providers.filter((p) => p.balanceStatus === "healthy" || !p.balanceStatus).length;

  const handleCheckSingle = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCheckingCode(code);
    checkBalance(code, {
      onSettled: () => setCheckingCode(null),
    });
  };

  const formatShortTime = (dateStr) => {
    if (!dateStr) return "Awaiting update";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Awaiting update";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Updated";
    }
  };

  const renderStatusPill = (status) => {
    switch (status) {
      case "critical":
        return (
          <span className="provider-status-pill status-pill-critical" title="Critical: Balance below ₦2,000">
            <span className="status-dot"></span>
            <span>Crit (&lt;₦2k)</span>
          </span>
        );
      case "urgent":
        return (
          <span className="provider-status-pill status-pill-urgent" title="Urgent: Balance below ₦5,000">
            <span className="status-dot"></span>
            <span>Urg (&lt;₦5k)</span>
          </span>
        );
      case "warning":
        return (
          <span className="provider-status-pill status-pill-warning" title="Low: Balance below ₦10,000">
            <span className="status-dot"></span>
            <span>Low (&lt;₦10k)</span>
          </span>
        );
      default:
        return (
          <span className="provider-status-pill status-pill-healthy" title="Healthy Liquidity">
            <span className="status-dot"></span>
            <span>Healthy</span>
          </span>
        );
    }
  };

  return (
    <div className="provider-balances-wrapper">
      {/* Section Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-3">
        <div>
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">Upstream Provider Wallet Balances</span>
            {criticalCount > 0 ? (
              <Badge color="danger" pill className="px-2 py-1" style={{ fontSize: "11px", animation: "pulse 1.5s infinite" }}>
                {criticalCount} Critical
              </Badge>
            ) : urgentCount + warningCount > 0 ? (
              <Badge color="warning" pill className="px-2 py-1 text-dark" style={{ fontSize: "11px" }}>
                {urgentCount + warningCount} Attention Needed
              </Badge>
            ) : (
              <Badge color="success" pill className="px-2 py-1" style={{ fontSize: "11px" }}>
                All Healthy
              </Badge>
            )}
          </h5>
          <div className="text-muted small mt-0.5" style={{ fontSize: "12px" }}>
            Real-time balance tracking for CoolSub, Bilalsadasub, VTU.ng, Pairgate & upstream bill payment providers
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-white bg-white border shadow-sm d-inline-flex align-items-center gap-1.5"
            onClick={() => refreshAll()}
            disabled={isRefreshing || isFetching}
            style={{ height: "34px", fontSize: "12px", fontWeight: 500 }}
            title="Poll dedicated balance endpoints now"
          >
            {isRefreshing || isFetching ? (
              <Spinner size="sm" color="primary" />
            ) : (
              <Icon name="reload" className="text-primary" />
            )}
            <span>{isRefreshing ? "Polling..." : "Refresh Balances"}</span>
          </button>

          <Link
            to="/service-providers"
            className="btn btn-sm btn-outline-light text-dark bg-white border shadow-sm d-inline-flex align-items-center gap-1"
            style={{ height: "34px", fontSize: "12px", fontWeight: 500 }}
          >
            <span>All Providers</span>
            <Icon name="chevron-right" />
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="row g-2 g-xl-3 mb-3">
        <div className="col-6 col-lg-3">
          <div className="provider-kpi-card kpi-total">
            <div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                Total Upstream Float
              </div>
              <div className="fw-bold mt-1 text-dark" style={{ fontSize: "18px" }}>
                {formatter("NGN").format(totalUpstreamFloat)}
              </div>
            </div>
            <div className="provider-kpi-icon">
              <Icon name="coins" />
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="provider-kpi-card kpi-healthy">
            <div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                Healthy Liquidity
              </div>
              <div className="fw-bold mt-1 text-success" style={{ fontSize: "18px" }}>
                {healthyCount} <span className="text-muted fw-normal" style={{ fontSize: "12px" }}>/ {providers.length}</span>
              </div>
            </div>
            <div className="provider-kpi-icon">
              <Icon name="check-circle" />
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="provider-kpi-card kpi-warning">
            <div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                Low Balance (&lt;₦10k)
              </div>
              <div className="fw-bold mt-1 text-warning" style={{ fontSize: "18px" }}>
                {warningCount + urgentCount}
              </div>
            </div>
            <div className="provider-kpi-icon">
              <Icon name="alert-circle" />
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="provider-kpi-card kpi-critical">
            <div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                Critical Liquidity (&lt;₦2k)
              </div>
              <div className="fw-bold mt-1 text-danger" style={{ fontSize: "18px" }}>
                {criticalCount}
              </div>
            </div>
            <div className="provider-kpi-icon">
              <Icon name="cross-circle" />
            </div>
          </div>
        </div>
      </div>

      {/* 6-Columns Provider Cards Grid */}
      {isLoading ? (
        <div className="p-4 bg-white rounded-3 border text-center text-muted">
          <Spinner size="sm" color="primary" className="me-2" />
          Loading provider wallet balances...
        </div>
      ) : providers.length === 0 ? (
        <div className="p-4 bg-white rounded-3 border text-center text-muted">
          No active bill payment providers found.
        </div>
      ) : (
        <div className="provider-balance-grid">
          {providers.map((p) => {
            const isCritical = p.balanceStatus === "critical";
            const isUrgent = p.balanceStatus === "urgent";
            const isWarning = p.balanceStatus === "warning";
            const isCurrentlyChecking = checkingCode === p.code && isCheckingSingle;
            const isMuted = p.isBalanceAlertsPaused || p.isActive === false;

            const cardStatusClass = isCritical
              ? "card-status-critical"
              : isUrgent
              ? "card-status-urgent"
              : isWarning
              ? "card-status-warning"
              : "card-status-healthy";

            const valStatusClass = isCritical
              ? "val-critical"
              : isUrgent
              ? "val-urgent"
              : isWarning
              ? "val-warning"
              : "val-healthy";

            return (
              <div
                key={p._id || p.code}
                className={`provider-balance-card ${cardStatusClass}`}
              >
                {/* Header: Logo, Name & Status Pill */}
                <div className="card-header-row">
                  <div className="provider-identity" title={p.name}>
                    <img
                      src={p.logo || NoIcon}
                      alt={p.name}
                      className="provider-logo-img"
                    />
                    <div className="provider-name-text">
                      {p.name}
                    </div>
                  </div>

                  <div className="card-badges-group">
                    {isMuted && (
                      <span
                        className="muted-mini-badge"
                        title={p.isBalanceAlertsPaused ? "Alerts paused by admin" : "Provider is inactive"}
                      >
                        🔕
                      </span>
                    )}
                    {renderStatusPill(p.balanceStatus)}
                  </div>
                </div>

                {/* Body: Wallet Balance */}
                <div className="card-body-balance">
                  <div className="balance-title-label">Wallet Balance</div>
                  <div
                    className={`balance-amount-display ${valStatusClass}`}
                    title={formatter(p.balanceCurrency || "NGN").format(p.currentBalance || 0)}
                  >
                    {formatter(p.balanceCurrency || "NGN").format(p.currentBalance || 0)}
                  </div>
                </div>

                {/* Footer: Source, Time & Check Action */}
                <div className="card-footer-meta">
                  <div className="meta-source-group">
                    <span className={`source-tag ${p.balanceSource === "api_poll" ? "tag-api" : "tag-meta"}`}>
                      {p.balanceSource === "api_poll" ? "API" : "Txn"}
                    </span>
                    <span
                      className="meta-time-text"
                      title={p.lastBalanceCheckedAt ? formatDateWithTime(p.lastBalanceCheckedAt) : "Awaiting update"}
                    >
                      {p.lastBalanceCheckedAt ? `Upd ${formatShortTime(p.lastBalanceCheckedAt)}` : "Waiting"}
                    </span>
                  </div>

                  {p.canCheckBalanceDirectly ? (
                    <button
                      type="button"
                      onClick={(e) => handleCheckSingle(p.code, e)}
                      disabled={isCurrentlyChecking}
                      className="provider-check-action-btn"
                      title="Query live balance directly from provider API"
                    >
                      {isCurrentlyChecking ? (
                        <span className="btn-mini-spinner" />
                      ) : (
                        <svg
                          className="check-svg-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                      <span>{isCurrentlyChecking ? "..." : "Check"}</span>
                    </button>
                  ) : (
                    <span
                      className="auto-synced-pill"
                      title="Balance synced automatically from live transaction responses"
                    >
                      Auto
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
