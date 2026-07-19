import React, { useState } from "react";
import { Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useGetTopProductStats } from "../../../../api/dashboard";
import { useTimeFrame } from "../../../../hooks/timeframe";
import LoadingSpinner from "../../../../pages/components/spinner";
import { formatCurrency } from "../../../../utils/Utils";

const TopProducts = () => {
  const [data, setData] = useState("Weekly");
  const { startDate, endDate } = useTimeFrame(data);

  const { data: topProducts, isLoading } = useGetTopProductStats(startDate, endDate);

  return (
    <Card className="h-100">
      <div className="card-inner">
        <div className="card-title-group mb-2">
          <div className="card-title">
            <h6 className="title">Top products</h6>
          </div>
          <div className="card-tools">
            <UncontrolledDropdown>
              <DropdownToggle
                tag="a"
                href="#toggle"
                onClick={(ev) => ev.preventDefault()}
                className="link link-light link-sm dropdown-indicator"
              >
                {data}
              </DropdownToggle>
              <DropdownMenu end className="dropdown-menu-sm">
                <ul className="link-list-opt no-bdr">
                  <li className={data === "Daily" ? "active" : ""}>
                    <DropdownItem
                      tag="a"
                      href="#dropdown"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setData("Daily");
                      }}
                    >
                      <span>Daily</span>
                    </DropdownItem>
                  </li>
                  <li className={data === "Weekly" ? "active" : ""}>
                    <DropdownItem
                      tag="a"
                      href="#dropdown"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setData("Weekly");
                      }}
                    >
                      <span>Weekly</span>
                    </DropdownItem>
                  </li>
                  <li className={data === "Monthly" ? "active" : ""}>
                    <DropdownItem
                      tag="a"
                      href="#dropdown"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setData("Monthly");
                      }}
                    >
                      <span>Monthly</span>
                    </DropdownItem>
                  </li>
                </ul>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : topProducts?.length > 0 ? (
          <ul className="nk-top-products">
            {topProducts.map((item, idx) => (
              <li className="item" key={idx}>
                <div className="thumb">
                  <img src={item.productImage} alt={`for ${item.productName}`} />
                </div>
                <div className="info">
                  <div className="title">{item.productName}</div>
                  <div className="price">{formatCurrency(item.productPrice, undefined, undefined, 0)}</div>
                </div>
                <div className="total">
                  <div className="amount">{formatCurrency(item.purchaseSum, undefined, undefined, 0)}</div>
                  <div className="count">{item.totalQuantitySold} Sold</div>
                </div>
              </li>
            ))}
          </ul>
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
            <p>No statistics available</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TopProducts;
