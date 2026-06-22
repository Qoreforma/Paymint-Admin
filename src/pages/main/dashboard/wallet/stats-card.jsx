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

export const WalletStatsCard = ({ data }) => (
  <div className="row g-3">
    <StatCard icon="sort-v"  iconClass="primary"   label="Total"
      value={(data?.total?.count || data?.totalTransactions || 0).toLocaleString()} />
    <StatCard icon="check"   iconClass="success"   label="Successful"
      value={(data?.successful?.count || data?.totalSuccess || 0).toLocaleString()} />
    <StatCard icon="update"  iconClass="warning"   label="Pending"
      value={(data?.pending?.count || data?.totalPending || 0).toLocaleString()} />
    <StatCard icon="undo"    iconClass="secondary" label="Reversed"
      value={(data?.reversed?.count || data?.totalReversed || 0).toLocaleString()} />
    <StatCard icon="cross"   iconClass="danger"    label="Failed"
      value={(data?.failed?.count || data?.totalFailed || 0).toLocaleString()} />
  </div>
);
