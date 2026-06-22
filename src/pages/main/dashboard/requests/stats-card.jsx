import React from "react";
import { Icon } from "../../../../components/Component";

const StatCard = ({ icon, iconClass, label, value }) => (
  <div className="col-sm-6 col-lg-3">
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

export const RequestsStatsCard = ({ data }) => (
  <div className="row g-3">
    <StatCard icon="sort-v" iconClass="primary"   label="Total"    value={(data?.total    || 0).toLocaleString()} />
    <StatCard icon="check"  iconClass="success"   label="Approved" value={(data?.approved || 0).toLocaleString()} />
    <StatCard icon="undo"   iconClass="warning"   label="Pending"  value={(data?.pending  || 0).toLocaleString()} />
    <StatCard icon="cross"  iconClass="danger"    label="Declined" value={(data?.declined || 0).toLocaleString()} />
  </div>
);
