import React, { useMemo } from "react";
import { Icon } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";

/* Reusable single stat card */
export const DashStatCard = ({ icon, color, label, value }) => (
  <div className="dash-stat-card">
    <div className={`dsc-icon c-${color}`}>
      <Icon name={icon} />
    </div>
    <div className="dsc-body">
      <div className="dsc-label">{label}</div>
      <div className="dsc-value">{value}</div>
    </div>
  </div>
);

/* Giftcard / Asset: Total + Approved amounts */
export const AmountStatsCard = ({ data }) => {
  const totalApproved = useMemo(() => {
    if (!data) return 0;
    return (
      (data?.statusBreakdown?.find((s) => s?.status === "approved")?.totalPayableAmount || 0) +
      (data?.statusBreakdown?.find((s) => s?.status === "s.approved")?.totalPayableAmount || 0)
    );
  }, [data]);

  const totalEarning = useMemo(() => data?.totals?.totalPayableAmount ?? 0, [data]);

  return (
    <div className="row g-3 h-100">
      <div className="col-sm-6">
        <DashStatCard icon="sign-kobo" color="primary" label="Total Amount" value={formatter("NGN").format(totalEarning)} />
      </div>
      <div className="col-sm-6">
        <DashStatCard icon="check-circle-cut" color="success" label="Total Approved" value={formatter("NGN").format(totalApproved)} />
      </div>
    </div>
  );
};

/* Giftcard status breakdown */
export const StatsDetailsCard = ({ data }) => (
  <div className="row g-3">
    {[
      { icon: "check",  color: "success",   label: "Approved",  key: "approved" },
      { icon: "swap",   color: "info",      label: "S.Approved",key: "s.approved" },
      { icon: "update", color: "warning",   label: "Pending",   key: "pending" },
      { icon: "coins",  color: "secondary", label: "Multiple",  key: "multiple" },
      { icon: "cross",  color: "danger",    label: "Declined",  key: "declined" },
    ].map(({ icon, color, label, key }) => (
      <div className="col-sm-6 col-lg-4" key={key}>
        <DashStatCard icon={icon} color={color} label={label}
          value={data?.find((s) => s?.status === key)?.count?.toLocaleString() ?? "0"} />
      </div>
    ))}
  </div>
);

/* Wallet + Services amount summary (2 cards) */
export const WalletAmountStatsCard = ({ data, successful }) => (
  <div className="row g-3 h-100">
    <div className="col-sm-6">
      <DashStatCard icon="sign-kobo" color="primary" label="Total Amount" value={formatter("NGN").format(data)} />
    </div>
    <div className="col-sm-6">
      <DashStatCard icon="check-circle-cut" color="success" label="Total Successful" value={formatter("NGN").format(successful || 0)} />
    </div>
  </div>
);
