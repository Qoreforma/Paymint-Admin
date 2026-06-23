import React from "react";
import { DashStatCard } from "../giftcards/stats-card";

export const ServicesStatsCard = ({ data }) => (
  <div className="row g-3 h-100">
    {[
      { icon: "sort-v", color: "primary",   label: "Total",      value: (data?.totalTransactions || data?.total?.count    || 0).toLocaleString() },
      { icon: "check",  color: "success",   label: "Successful", value: (typeof data?.success === "number" ? data?.success : data?.success?.count || 0).toLocaleString() },
      { icon: "update", color: "warning",   label: "Pending",    value: (typeof data?.pending === "number" ? data?.pending : data?.pending?.count || 0).toLocaleString() },
      { icon: "undo",   color: "secondary", label: "Reversed",   value: (typeof data?.reversed === "number" ? data?.reversed : data?.reversed?.count || 0).toLocaleString() },
      { icon: "cross",  color: "danger",    label: "Failed",     value: (typeof data?.failed === "number" ? data?.failed : data?.failed?.count || 0).toLocaleString() },
    ].map(({ icon, color, label, value }) => (
      <div className="col-6 col-md-4 col-xl-auto flex-xl-fill" key={label}>
        <DashStatCard icon={icon} color={color} label={label} value={value} />
      </div>
    ))}
  </div>
);
