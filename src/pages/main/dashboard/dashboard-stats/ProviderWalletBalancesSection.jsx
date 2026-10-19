import React from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Spinner } from "reactstrap";
import { Col, Icon, Row } from "../../../../components/Component";
import { formatter, formatDateWithTime } from "../../../../utils/Utils";
import {
  useGetProviderBalances,
  useRefreshProviderBalances,
  useCheckProviderBalance,
} from "../../../../api/service-providers";
import NoIcon from "../../../../images/no-image-icon.png";

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "critical":
        return (
          <span className="badge badge-dim bg-danger" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Icon name="alert-circle" className="me-1" />
            Critical (&lt;₦2k)
          </span>
        );
      case "urgent":
        return (
          <span className="badge badge-dim bg-warning" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Icon name="alert-circle" className="me-1" />
            Urgent (&lt;₦5k)
          </span>
        );
      case "warning":
        return (
          <span className="badge badge-dim bg-info" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Icon name="info-fill" className="me-1" />
            Low (&lt;₦10k)
          </span>
        );
      default:
        return (
          <span className="badge badge-dim bg-success" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Icon name="check-circle" className="me-1" />
            Healthy
          </span>
        );
    }
  };

  return (
    <div className="mb-2">
      {/* Section Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-3">
        <div>
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <span>Upstream Provider Wallet Balances</span>
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
      <Row className="g-3 mb-3">
        <Col sm={6} lg={3}>
          <div
            className="p-3 bg-white rounded-3 border shadow-sm h-100 d-flex align-items-center justify-content-between"
            style={{ borderLeft: "4px solid #3b82f6" }}
          >
            <div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                Total Upstream Float
              </div>
              <div className="fw-bold mt-1 text-dark" style={{ fontSize: "18px" }}>
                {formatter("NGN").format(totalUpstreamFloat)}
              </div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.12)",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="coins" />
            </div>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div
            className="p-3 bg-white rounded-3 border shadow-sm h-100 d-flex align-items-center justify-content-between"
            style={{ borderLeft: "4px solid #10b981" }}
          >
            <div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                Healthy Liquidity
              </div>
              <div className="fw-bold mt-1 text-success" style={{ fontSize: "18px" }}>
                {healthyCount} <span className="text-muted fw-normal" style={{ fontSize: "12px" }}>/ {providers.length}</span>
              </div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="check-circle" />
            </div>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div
            className="p-3 bg-white rounded-3 border shadow-sm h-100 d-flex align-items-center justify-content-between"
            style={{ borderLeft: "4px solid #f59e0b" }}
          >
            <div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                Low Balance (&lt;₦10k)
              </div>
              <div className="fw-bold mt-1 text-warning" style={{ fontSize: "18px" }}>
                {warningCount + urgentCount}
              </div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="alert-circle" />
            </div>
          </div>
        </Col>

        <Col sm={6} lg={3}>
          <div
            className="p-3 bg-white rounded-3 border shadow-sm h-100 d-flex align-items-center justify-content-between"
            style={{ borderLeft: "4px solid #ef4444" }}
          >
            <div>
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                Critical Liquidity (&lt;₦2k)
              </div>
              <div className="fw-bold mt-1 text-danger" style={{ fontSize: "18px" }}>
                {criticalCount}
              </div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="cross-circle" />
            </div>
          </div>
        </Col>
      </Row>

      {/* Provider Cards Grid */}
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
        <Row className="g-3">
          {providers.map((p) => {
            const isCritical = p.balanceStatus === "critical";
            const isUrgent = p.balanceStatus === "urgent";
            const isWarning = p.balanceStatus === "warning";
            const isCurrentlyChecking = checkingCode === p.code && isCheckingSingle;

            return (
              <Col key={p._id || p.code} sm={6} lg={4} xl={3}>
                <div
                  className="bg-white rounded-3 border shadow-sm p-3 h-100 d-flex flex-column justify-content-between"
                  style={{
                    borderTop: isCritical
                      ? "3px solid #ef4444"
                      : isUrgent
                      ? "3px solid #f97316"
                      : isWarning
                      ? "3px solid #f59e0b"
                      : "3px solid #10b981",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  {/* Provider Header */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={p.logo || NoIcon}
                          alt={p.name}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            objectFit: "contain",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: "13px", maxWidth: "120px" }} title={p.name}>
                          {p.name}
                        </div>
                      </div>
                      {getStatusBadge(p.balanceStatus)}
                    </div>

                    {/* Balance Display */}
                    <div className="mt-2 mb-2">
                      <div className="text-muted" style={{ fontSize: "11px", fontWeight: 500 }}>
                        Current Balance
                      </div>
                      <div
                        className={`fw-bold mt-0.5 ${
                          isCritical ? "text-danger" : isUrgent ? "text-warning" : "text-dark"
                        }`}
                        style={{ fontSize: "19px", letterSpacing: "-0.3px", lineHeight: 1.2 }}
                      >
                        {formatter(p.balanceCurrency || "NGN").format(p.currentBalance || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Provider Footer Meta */}
                  <div className="pt-2 border-top mt-2 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-1">
                        <span
                          className="badge rounded-pill"
                          style={{
                            fontSize: "9px",
                            padding: "2px 6px",
                            background: p.balanceSource === "api_poll" ? "#e0e7ff" : "#f1f5f9",
                            color: p.balanceSource === "api_poll" ? "#3730a3" : "#475569",
                          }}
                        >
                          {p.balanceSource === "api_poll" ? "Direct API" : "Txn Meta"}
                        </span>
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: "10px" }}>
                        {p.lastBalanceCheckedAt
                          ? `Updated ${formatDateWithTime(p.lastBalanceCheckedAt)}`
                          : "Awaiting update"}
                      </div>
                    </div>

                    {p.canCheckBalanceDirectly && (
                      <button
                        type="button"
                        onClick={(e) => handleCheckSingle(p.code, e)}
                        disabled={isCurrentlyChecking}
                        className="btn btn-xs btn-outline-primary d-inline-flex align-items-center gap-1"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        title="Query live balance from provider API"
                      >
                        {isCurrentlyChecking ? (
                          <Spinner size="sm" />
                        ) : (
                          <Icon name="reload" />
                        )}
                        <span>{isCurrentlyChecking ? "..." : "Check"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
