import React from "react";
import { Card, Badge } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";

const ComparisonMetricPod = ({
  title,
  icon,
  iconBg,
  iconColor,
  todayVal,
  yesterdayVal,
  diff,
  change,
  isCurrency = false,
}) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  // Format today and yesterday
  const formattedToday = isCurrency ? formatter("NGN").format(todayVal || 0) : (todayVal || 0).toLocaleString();
  const formattedYesterday = isCurrency
    ? formatter("NGN").format(yesterdayVal || 0)
    : (yesterdayVal || 0).toLocaleString();

  // Calculate relative progress bar width: ratio between today and max(today, yesterday)
  const maxVal = Math.max(todayVal || 0, yesterdayVal || 0, 1);
  const todayProgress = Math.min(100, Math.max(8, Math.round(((todayVal || 0) / maxVal) * 100)));
  const yesterdayProgress = Math.min(100, Math.max(8, Math.round(((yesterdayVal || 0) / maxVal) * 100)));

  return (
    <div className="col">
      <div
        className="h-100 p-3 rounded-3 bg-white border shadow-sm transition-all d-flex flex-column justify-content-between"
        style={{
          border: "1px solid #e2e8f0",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        {/* Header row with Title, Icon & Trend Badge */}
        <div className="d-flex align-items-center justify-content-between gap-1.5 mb-2">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: iconBg,
                color: iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              <Icon name={icon}></Icon>
            </div>
            <span
              className="text-uppercase text-muted fw-bold text-truncate"
              style={{ fontSize: 10.5, letterSpacing: "0.3px" }}
              title={title}
            >
              {title}
            </span>
          </div>

          <span
            className="badge rounded-pill px-2 py-1 flex-shrink-0"
            style={{
              background: isPositive ? "#ecfdf5" : isNegative ? "#fef2f2" : "#f1f5f9",
              color: isPositive ? "#059669" : isNegative ? "#dc2626" : "#64748b",
              fontSize: 10.5,
              fontWeight: 700,
            }}
          >
            {isPositive && <Icon name="arrow-up-right" className="me-1"></Icon>}
            {isNegative && <Icon name="arrow-down-right" className="me-1"></Icon>}
            {isPositive ? `+${change}%` : isNegative ? `${change}%` : "0.0%"}
          </span>
        </div>

        {/* Today Main Value */}
        <div className="my-2">
          <div
            className="fw-bold text-dark"
            style={{ fontSize: 20, letterSpacing: "-0.4px", lineHeight: 1.2 }}
          >
            {formattedToday}
          </div>
          <div className="text-muted mt-1 d-flex align-items-center justify-content-between" style={{ fontSize: "11.5px" }}>
            <span>vs yesterday:</span>
            <span className="fw-semibold text-dark">{formattedYesterday}</span>
          </div>
        </div>

        {/* Visual Mini Progress Proportion */}
        <div className="pt-2 border-top border-light">
          <div className="d-flex align-items-center justify-content-between text-muted mb-1" style={{ fontSize: 10 }}>
            <span>Today</span>
            <span>Yesterday</span>
          </div>
          <div className="progress" style={{ height: 5, backgroundColor: "#f1f5f9", borderRadius: 3 }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${todayProgress}%`,
                backgroundColor: isPositive ? "#10b981" : isNegative ? "#ef4444" : "#3b82f6",
                borderRadius: 3,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const YesterdayVsTodayCard = ({ data, isLoading }) => {
  const today = data?.today || {
    volume: 0,
    profit: 0,
    newUsers: 0,
    successfulCount: 0,
    avgTransactionValue: 0,
  };

  const yesterday = data?.yesterday || {
    volume: 0,
    profit: 0,
    newUsers: 0,
    successfulCount: 0,
    avgTransactionValue: 0,
  };

  const diff = data?.diff || {
    volumeChange: 0,
    profitChange: 0,
    newUsersChange: 0,
    successfulCountChange: 0,
    avgTransactionValueChange: 0,
  };

  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="card border-0 shadow-sm p-4 bg-white rounded-3 text-center text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <span>Loading Yesterday vs Today comparison...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: 16 }}>
            <span>Daily Pulse: Yesterday vs Today</span>
          </h5>
          <span
            className="badge rounded-pill bg-primary-dim text-primary"
            style={{ fontSize: 10, fontWeight: 600 }}
          >
            Live Performance
          </span>
        </div>
        <div className="text-muted small">
          Snapshot comparison of 24-hour cycles
        </div>
      </div>

      {/* 5 Comparison Pods */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-3">
        {/* Pod 1: Total Transaction Volume */}
        <ComparisonMetricPod
          title="Transaction Volume"
          icon="swap-alt"
          iconBg="rgba(59, 130, 246, 0.12)"
          iconColor="#2563eb"
          todayVal={today.volume}
          yesterdayVal={yesterday.volume}
          change={diff.volumeChange}
          isCurrency={true}
        />

        {/* Pod 2: Profits Made */}
        <ComparisonMetricPod
          title="Profits Made"
          icon="sign-kobo"
          iconBg="rgba(16, 185, 129, 0.14)"
          iconColor="#059669"
          todayVal={today.profit}
          yesterdayVal={yesterday.profit}
          change={diff.profitChange}
          isCurrency={true}
        />

        {/* Pod 3: New Users Joined */}
        <ComparisonMetricPod
          title="New Users"
          icon="user-add"
          iconBg="rgba(249, 115, 22, 0.12)"
          iconColor="#ea580c"
          todayVal={today.newUsers}
          yesterdayVal={yesterday.newUsers}
          change={diff.newUsersChange}
          isCurrency={false}
        />

        {/* Pod 4: Successful Transactions */}
        <ComparisonMetricPod
          title="Successful Txns"
          icon="check-circle"
          iconBg="rgba(147, 51, 234, 0.12)"
          iconColor="#9333ea"
          todayVal={today.successfulCount}
          yesterdayVal={yesterday.successfulCount}
          change={diff.successfulCountChange}
          isCurrency={false}
        />

        {/* Pod 5: Avg Transaction Value */}
        <ComparisonMetricPod
          title="Avg Txn Value"
          icon="growth"
          iconBg="rgba(14, 165, 233, 0.12)"
          iconColor="#0284c7"
          todayVal={today.avgTransactionValue}
          yesterdayVal={yesterday.avgTransactionValue}
          change={diff.avgTransactionValueChange}
          isCurrency={true}
        />
      </div>
    </div>
  );
};

export default YesterdayVsTodayCard;
