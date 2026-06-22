import React, { useMemo } from "react";
import { Col, Row } from "../../../../components/Component";
import { Icon } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";

const StatCard = ({ icon, iconClass, label, value, colSize = "col-sm-6" }) => (
  <div className={colSize}>
    <div className="nk-stats-card">
      <div className="d-flex align-items-start gap-3">
        <div className={`stat-icon ${iconClass}`}>
          <Icon name={icon} />
        </div>
        <div className="flex-fill min-w-0">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
        </div>
      </div>
    </div>
  </div>
);

export const AmountStatsCard = ({ data }) => {
  const totalApproved = useMemo(() => {
    if (data) {
      return (
        (data?.statusBreakdown?.find((s) => s?.status === "approved")?.totalPayableAmount || 0) +
        (data?.statusBreakdown?.find((s) => s?.status === "s.approved")?.totalPayableAmount || 0)
      );
    }
    return 0;
  }, [data]);

  const totalEarning = useMemo(() => (data ? data?.totals?.totalPayableAmount : 0), [data]);

  return (
    <div className="row g-3">
      <StatCard icon="sign-kobo" iconClass="primary" label="Total Amount" value={formatter("NGN").format(totalEarning)} />
      <StatCard icon="check-circle" iconClass="success" label="Total Approved" value={formatter("NGN").format(totalApproved)} />
    </div>
  );
};

export const StatsDetailsCard = ({ data }) => (
  <div className="row g-3">
    <StatCard icon="check" iconClass="success" label="Approved"
      value={data?.find((s) => s?.status === "approved")?.count?.toLocaleString() ?? 0} />
    <StatCard icon="swap" iconClass="info" label="S.Approved"
      value={data?.find((s) => s?.status === "s.approved")?.count?.toLocaleString() ?? 0} />
    <StatCard icon="update" iconClass="warning" label="Pending"
      value={data?.find((s) => s?.status === "pending")?.count?.toLocaleString() ?? 0} />
    <StatCard icon="coins" iconClass="secondary" label="Multiple"
      value={data?.find((s) => s?.status === "multiple")?.count?.toLocaleString() ?? 0} />
    <StatCard icon="cross" iconClass="danger" label="Declined"
      value={data?.find((s) => s?.status === "declined")?.count?.toLocaleString() ?? 0} />
  </div>
);

export const WalletAmountStatsCard = ({ data, successful }) => (
  <div className="row g-3">
    <StatCard icon="sign-kobo" iconClass="primary" label="Total Amount" value={formatter("NGN").format(data)} />
    <StatCard icon="check-circle" iconClass="success" label="Total Successful" value={formatter("NGN").format(successful || 0)} />
  </div>
);
