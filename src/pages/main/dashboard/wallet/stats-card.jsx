import React from "react";
import { Card } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";

export const WalletStatsCard = ({ tradeTypeData, data }) => {
  // Helper function to get count from various data structures
  const getCount = (type) => {
    // Structure 3: tradeTypeData (single object with count fields)
    if (tradeTypeData) {
      const map = {
        total: tradeTypeData.count,
        successful: tradeTypeData.successCount,
        pending: tradeTypeData.pendingCount,
        reversed: tradeTypeData.reversedCount,
        failed: tradeTypeData.failedCount,
      };
      return map[type] || 0;
    }

    // Structure 1: Nested objects with count and amount
    if (data?.total?.count !== undefined) {
      const map = {
        total: data.total?.count || 0,
        successful: data.successful?.count || 0,
        pending: data.pending?.count || 0,
        reversed: data.reversed?.count || 0,
        failed: data.failed?.count || 0,
      };
      return map[type] || 0;
    }

    // Structure 2: Direct properties with numbers
    if (data && typeof data.totalTransactions === "number") {
      const map = {
        total: data.totalTransactions || 0,
        successful: data.totalSuccess || 0,
        pending: data.totalPending || 0,
        reversed: data.totalReversed || 0,
        failed: data.totalFailed || 0,
      };
      return map[type] || 0;
    }

    return 0;
  };

  return (
    <Card className="h-100">
      <div className="card-inner h-100 d-flex flex-column justify-content-center" style={{ padding: "20px" }}>
        <ul className="nk-tranx-statistics my-auto w-100">
          <li className="item">
            <Icon name="sort-v" className="bg-primary-dim"></Icon>
            <div className="info">
              <div className="title">Total</div>
              <div className="count">{getCount("total").toLocaleString()}</div>
            </div>
          </li>
          <li className="item">
            <Icon name="check" className="bg-success-dim"></Icon>
            <div className="info">
              <div className="title">Successful</div>
              <div className="count">{getCount("successful").toLocaleString()}</div>
            </div>
          </li>
          <li className="item">
            <Icon name="update" className="bg-warning-dim"></Icon>
            <div className="info">
              <div className="title">Pending</div>
              <div className="count">{getCount("pending").toLocaleString()}</div>
            </div>
          </li>
          <li className="item">
            <Icon name="undo" className="bg-secondary-dim"></Icon>
            <div className="info">
              <div className="title">Reversed</div>
              <div className="count">{getCount("reversed").toLocaleString()}</div>
            </div>
          </li>
          <li className="item">
            <Icon name="cross" className="bg-danger-dim"></Icon>
            <div className="info">
              <div className="title">Failed</div>
              <div className="count">{getCount("failed").toLocaleString()}</div>
            </div>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export const WalletAmountStatsCard = ({ data, successful, pending, profit }) => {
  return (
    <Card className="h-100">
      <div className="card-inner h-100 d-flex flex-column justify-content-center" style={{ padding: "20px" }}>
        <ul className="nk-tranx-statistics my-auto w-100">
          {data !== undefined && (
            <li className="item">
              <Icon name="sign-kobo" className="bg-primary-dim"></Icon>
              <div className="info">
                <div className="title">Total</div>
                <div className="count">{formatter("NGN").format(data || 0)}</div>
              </div>
            </li>
          )}

          <li className="item">
            <Icon name="sign-kobo" className="bg-success-dim"></Icon>
            <div className="info">
              <div className="title">Total Successful</div>
              <div className="count">{formatter("NGN").format(successful || 0)}</div>
            </div>
          </li>

          {pending !== undefined && (
            <li className="item">
              <Icon name="sign-kobo" className="bg-warning-dim"></Icon>
              <div className="info">
                <div className="title">Total Pending</div>
                <div className="count">{formatter("NGN").format(pending || 0)}</div>
              </div>
            </li>
          )}

          {profit !== undefined && (
            <li className="item">
              <Icon name="growth" className="bg-info-dim text-info"></Icon>
              <div className="info">
                <div className="title">Total Profit</div>
                <div
                  className="count fw-bold"
                  style={{ color: (profit || 0) >= 0 ? "#10b981" : "#ef4444" }}
                >
                  {(profit || 0) > 0 ? "+" : ""}
                  {formatter("NGN").format(profit || 0)}
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
};
