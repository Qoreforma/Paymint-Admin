import React from "react";
import { Card } from "reactstrap";
import { Icon } from "../../../../components/Component";

export const ServicesStatsCard = ({ tradeTypeStat, data }) => {
  // Determine the data source and structure
  const getStats = () => {
    // Structure 3: tradeTypeStat (single object with count fields)
    if (tradeTypeStat) {
      return {
        total: tradeTypeStat.count || 0,
        successful: tradeTypeStat.successCount || 0,
        pending: tradeTypeStat.pendingCount || 0,
        reversed: tradeTypeStat.reversedCount || 0,
        failed: tradeTypeStat.failedCount || 0,
        type: "tradeTypeStat",
      };
    }

    // Structure 1: Nested objects with count and amount
    if (data?.total?.count !== undefined) {
      return {
        total: data.total?.count || 0,
        successful: data.successful?.count || 0,
        pending: data.pending?.count || 0,
        reversed: data.reversed?.count || 0,
        failed: data.failed?.count || 0,
        type: "nested",
      };
    }

    // Structure 2: Direct properties with numbers
    if (data && typeof data.totalTransactions === "number") {
      return {
        total: data.totalTransactions || 0,
        successful: data.success || 0,
        pending: data.pending || 0,
        reversed: data.reversed || 0,
        failed: data.failed || 0,
        type: "direct",
      };
    }

    // Fallback: empty stats
    return {
      total: 0,
      successful: 0,
      pending: 0,
      reversed: 0,
      failed: 0,
      type: "none",
    };
  };

  const stats = getStats();

  const statConfigs = [
    { key: "total", icon: "sort-v", iconClass: "bg-primary-dim", title: "Total" },
    { key: "successful", icon: "check", iconClass: "bg-success-dim", title: "Successful" },
    { key: "pending", icon: "update", iconClass: "bg-warning-dim", title: "Pending" },
    { key: "reversed", icon: "undo", iconClass: "bg-secondary-dim", title: "Reversed" },
    { key: "failed", icon: "cross", iconClass: "bg-danger-dim", title: "Failed" },
  ];

  return (
    <Card className="h-100">
      <div className="card-inner h-100 d-flex flex-column justify-content-center" style={{ padding: "20px" }}>
        <ul className="nk-tranx-statistics my-auto w-100">
          {statConfigs.map((stat) => (
            <li key={stat.key} className="item">
              <Icon name={stat.icon} className={stat.iconClass}></Icon>
              <div className="info">
                <div className="title">{stat.title}</div>
                <div className="count">{stats[stat.key]}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
