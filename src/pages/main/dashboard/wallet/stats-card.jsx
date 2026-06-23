import React from "react";
import { DashStatCard } from "../giftcards/stats-card";

export const WalletStatsCard = ({ data }) => (
  <div className="row g-3 h-100">
    {[
      { icon: "sort-v",  color: "primary",   label: "Total",      value: (data?.total?.count      || data?.totalTransactions || 0).toLocaleString() },
      { icon: "check",   color: "success",   label: "Successful", value: (data?.successful?.count  || data?.totalSuccess      || 0).toLocaleString() },
      { icon: "update",  color: "warning",   label: "Pending",    value: (data?.pending?.count     || data?.totalPending      || 0).toLocaleString() },
      { icon: "undo",    color: "secondary", label: "Reversed",   value: (data?.reversed?.count    || data?.totalReversed     || 0).toLocaleString() },
      { icon: "cross",   color: "danger",    label: "Failed",     value: (data?.failed?.count      || data?.totalFailed       || 0).toLocaleString() },
    ].map(({ icon, color, label, value }) => (
      <div className="col-6 col-md-4 col-xl-auto flex-xl-fill" key={label}>
        <DashStatCard icon={icon} color={color} label={label} value={value} />
      </div>
    ))}
  </div>
);
