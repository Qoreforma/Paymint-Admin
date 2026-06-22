import React from "react";
import { Icon } from "../../../../components/Component";

const StatCard = ({ icon, iconClass, label, value }) => (
  <div className="col-sm-6 col-lg-4">
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

export const ServicesStatsCard = ({ data }) => (
  <div className="row g-3">
    <StatCard icon="sort-v"  iconClass="primary"   label="Total"
      value={(data?.totalTransactions || data?.total?.count || 0).toLocaleString()} />
    <StatCard icon="check"   iconClass="success"   label="Successful"
      value={(typeof data?.success === "number" ? data?.success : data?.success?.count || 0).toLocaleString()} />
    <StatCard icon="update"  iconClass="warning"   label="Pending"
      value={(typeof data?.pending === "number" ? data?.pending : data?.pending?.count || 0).toLocaleString()} />
    <StatCard icon="undo"    iconClass="secondary" label="Reversed"
      value={(typeof data?.reversed === "number" ? data?.reversed : data?.reversed?.count || 0).toLocaleString()} />
    <StatCard icon="cross"   iconClass="danger"    label="Failed"
      value={(typeof data?.failed === "number" ? data?.failed : data?.failed?.count || 0).toLocaleString()} />
  </div>
);
