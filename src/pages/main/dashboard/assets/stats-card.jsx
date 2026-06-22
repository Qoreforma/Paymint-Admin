import React, { useMemo } from "react";
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

export const StatsCard = ({ data }) => {
  const totalSuccesful = useMemo(() => {
    if (data) {
      return (
        (data?.statusBreakdown?.find((s) => s?._id === "approved")?.totalAmount || 0) +
        (data?.statusBreakdown?.find((s) => s?._id === "s.approved")?.totalAmount || 0)
      );
    }
    return 0;
  }, [data]);

  return (
    <div className="row g-3">
      <StatCard icon="sign-kobo" iconClass="primary" label="Total Amount"
        value={formatter("NGN").format(data?.amounts?.totalFiatAmount || 0)} />
      <StatCard icon="check-circle" iconClass="success" label="Total Approved"
        value={formatter("NGN").format(totalSuccesful)} />
    </div>
  );
};

export const StatsDetailsCard = ({ data }) => (
  <div className="row g-3">
    <StatCard icon="check"  iconClass="success"   label="Approved"
      value={data?.find((s) => s?._id === "approved")?.count?.toLocaleString() ?? 0} />
    <StatCard icon="swap"   iconClass="info"      label="S.Approved"
      value={data?.find((s) => s?._id === "s.approved")?.count?.toLocaleString() ?? 0} />
    <StatCard icon="update" iconClass="warning"   label="Pending"
      value={data?.find((s) => s?._id === "pending")?.count?.toLocaleString() ?? 0} />
    <StatCard icon="cross"  iconClass="danger"    label="Declined"
      value={data?.find((s) => s?._id === "declined")?.count?.toLocaleString() ?? 0} />
  </div>
);
