import React from "react";
import { Card } from "reactstrap";
import { Icon } from "../../Component";
import { useGetStoreStats } from "../../../api/dashboard";
import LoadingSpinner from "../../../pages/components/spinner";

const StoreStatistics = () => {
  const { isLoading, data: storeStats } = useGetStoreStats();
  // console.log(storeStats);
  return (
    <Card className="h-100">
      <div className="card-inner">
        <div className="card-title-group mb-2">
          <div className="card-title">
            <h6 className="title">Store Statistics</h6>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <ul className="nk-store-statistics">
            <li className="item">
              <div className="info">
                <div className="title">Orders</div>
                <div className="count">{storeStats?.totalOrders.toLocaleString()}</div>
              </div>
              <Icon name="bag" className="bg-primary-dim"></Icon>
            </li>
            <li className="item">
              <div className="info">
                <div className="title">Customers</div>
                <div className="count">{storeStats?.totalCustomer.toLocaleString()}</div>
              </div>
              <Icon name="users" className="bg-info-dim"></Icon>
            </li>
            <li className="item">
              <div className="info">
                <div className="title">Products</div>
                <div className="count">{storeStats?.totalProducts.toLocaleString()}</div>
              </div>
              <Icon name="box" className="bg-pink-dim"></Icon>
            </li>
            <li className="item">
              <div className="info">
                <div className="title">Categories</div>
                <div className="count">{storeStats?.totalCategories.toLocaleString()}</div>
              </div>
              <Icon name="server" className="bg-purple-dim"></Icon>
            </li>
          </ul>
        )}
      </div>
    </Card>
  );
};
export default StoreStatistics;
