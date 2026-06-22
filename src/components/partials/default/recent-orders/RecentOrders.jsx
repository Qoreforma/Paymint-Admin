import React, { useCallback } from "react";
import { Badge, Card } from "reactstrap";
import { useGetRecentOrdersStats } from "../../../../api/dashboard";
import LoadingSpinner from "../../../../pages/components/spinner";
import { formatCurrency, formatDate } from "../../../../utils/Utils";
import { DataTableHead, DataTableItem, DataTableRow } from "../../../Component";

const RecentOrders = () => {
  const { isLoading, data: orders } = useGetRecentOrdersStats("2023-11-05", "2023-12-05");

  const statusColor = useCallback((status) => {
    if (status === "pending" || status === "refunded" || status === "in Transit") {
      return "warning";
    } else if (status === "confirmed" || status === "shipped" || status === "transit") {
      return "info";
    } else if (status === "delivered") {
      return "success";
    } else {
      return "danger";
    }
  }, []);
  return (
    <Card className="card-full">
      <div className="card-inner">
        <div className="card-title-group">
          <div className="card-title">
            <h6 className="title">Recent Orders</h6>
          </div>
        </div>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : orders?.length > 0 ? (
        <div className="nk-tb-list mt-n2">
          <DataTableHead>
            <DataTableRow>
              <span>Order No.</span>
            </DataTableRow>
            <DataTableRow size="sm">
              <span>Customer</span>
            </DataTableRow>
            <DataTableRow size="md">
              <span>Product</span>
            </DataTableRow>
            <DataTableRow size="md">
              <span>Date</span>
            </DataTableRow>
            <DataTableRow>
              <span>Amount</span>
            </DataTableRow>
            <DataTableRow>
              <span className="d-none d-sm-inline">Status</span>
            </DataTableRow>
          </DataTableHead>
          {orders.map((item, idx) => (
            <DataTableItem key={idx}>
              <DataTableRow>
                <span className="tb-lead">{idx + 1}</span>
              </DataTableRow>
              <DataTableRow size="sm">
                <div className="user-card">
                  <div className="user-name">
                    <span className="tb-lead">{item.buyer.buyerName}</span>
                  </div>
                </div>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="tb-sub">{item.product.productName}</span>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="tb-sub">{formatDate(item.createdAt)}</span>
              </DataTableRow>
              <DataTableRow>
                <span className="tb-sub tb-amount">{formatCurrency(item.totalAmount, undefined, undefined, 0)}</span>
              </DataTableRow>
              <DataTableRow>
                <Badge className="badge-dot badge-dot-xs" color={statusColor(item.status)}>
                  {item.status}
                </Badge>
              </DataTableRow>
            </DataTableItem>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginTop: "3rem",
          }}
        >
          <p>No Recent Orders</p>
        </div>
      )}
    </Card>
  );
};
export default RecentOrders;
