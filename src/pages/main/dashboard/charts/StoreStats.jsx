import React from "react";
import { Card } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { formatCurrency } from "../../../../utils/Utils";

const StoreStats = ({ data }) => {
  // console.log(data);
  const { transactions, totalProducts, totalReview } = data.stats ?? {};
  return (
    <Card className="h-100">
      <div className="card-inner">
        <div className="card-title-group mb-2">
          <div className="card-title">
            <h6 className="title">Store Statistics</h6>
          </div>
        </div>
        <ul className="nk-store-statistics">
          <li className="item">
            <div className="info">
              <div className="title">Total Products</div>
              <div className="count">{totalProducts}</div>
            </div>
            <Icon name="package-fill" className="bg-primary-dim"></Icon>
          </li>
          <li className="item">
            <div className="info">
              <div className="title">Total Transactions</div>
              <div className="count">{formatCurrency(transactions)}</div>
            </div>
            <Icon name="sign-kobo" className="bg-info-dim"></Icon>
          </li>
          <li className="item">
            <div className="info">
              <div className="title">Total Ratings</div>
              <div className="count">{totalReview}</div>
            </div>
            <Icon name="star" className="bg-warning-dim"></Icon>
          </li>
        </ul>
      </div>
      <div className="card-inner card-inner-md bg-light">
        <div className="card-note">
          <Icon className="info-fill"></Icon>
          <span>General Statistics for this business</span>
        </div>
      </div>
    </Card>
  );
};
export default StoreStats;
