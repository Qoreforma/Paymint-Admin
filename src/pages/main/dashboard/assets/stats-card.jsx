import React, { useMemo } from "react";
import { DashStatCard } from "../giftcards/stats-card";
import { formatter } from "../../../../utils/Utils";

export const StatsCard = ({ data }) => {
  const totalSuccessful = useMemo(() => {
    if (!data) return 0;
    return (
      (data?.statusBreakdown?.find((s) => s?._id === "approved")?.totalAmount || 0) +
      (data?.statusBreakdown?.find((s) => s?._id === "s.approved")?.totalAmount || 0)
    );
  }, [data]);

  return (
    <div className="row g-3 h-100">
      <div className="col-sm-6">
        <DashStatCard icon="sign-kobo" color="primary" label="Total Amount"
          value={formatter("NGN").format(data?.amounts?.totalFiatAmount || 0)} />
      </div>
      <div className="col-sm-6">
        <DashStatCard icon="check-circle-cut" color="success" label="Total Approved"
          value={formatter("NGN").format(totalSuccessful)} />
      </div>
    </div>
  );
};

export const StatsDetailsCard = ({ data }) => (
  <div className="row g-3">
    {[
      { icon: "check",  color: "success",   label: "Approved",   key: "approved" },
      { icon: "swap",   color: "info",      label: "S.Approved", key: "s.approved" },
      { icon: "update", color: "warning",   label: "Pending",    key: "pending" },
      { icon: "cross",  color: "danger",    label: "Declined",   key: "declined" },
    ].map(({ icon, color, label, key }) => (
      <div className="col-6 col-sm-3" key={key}>
        <DashStatCard icon={icon} color={color} label={label}
          value={data?.find((s) => s?._id === key)?.count?.toLocaleString() ?? "0"} />
      </div>
    ))}
  </div>
);
