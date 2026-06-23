import React from "react";
import { DashStatCard } from "../giftcards/stats-card";

export const RequestsStatsCard = ({ data }) => (
  <div className="row g-3 h-100">
    {[
      { icon: "sort-v", color: "primary", label: "Total",    value: (data?.total    || 0).toLocaleString() },
      { icon: "check",  color: "success", label: "Approved", value: (data?.approved || 0).toLocaleString() },
      { icon: "update", color: "warning", label: "Pending",  value: (data?.pending  || 0).toLocaleString() },
      { icon: "cross",  color: "danger",  label: "Declined", value: (data?.declined || 0).toLocaleString() },
    ].map(({ icon, color, label, value }) => (
      <div className="col-6 col-md-3" key={label}>
        <DashStatCard icon={icon} color={color} label={label} value={value} />
      </div>
    ))}
  </div>
);
