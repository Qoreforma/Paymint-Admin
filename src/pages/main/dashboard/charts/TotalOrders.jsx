import React from "react";
import { Card, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { OrderTrafficChart } from "../../../../components/partials/charts/e-commerce/EcomCharts";
const StoreOrdersCharts = ({ orderData }) => {
  // const [data, setData] = useState("7");
  const { totalOrders, openOrders, closedOrders } = orderData?.stats?.orders ?? {};

  const orderSources = {
    labels: ["Total Orders", "Completed", "Declined"],
    dataUnit: "Orders",
    legend: false,
    datasets: [
      {
        borderColor: "#fff",
        backgroundColor: ["#b695ff", "#96f1d9", "#ffa9ce"],
        data: [totalOrders, openOrders, closedOrders],
      },
    ],
  };
  return (
    <Card className="card-full overflow-hidden">
      <div className="nk-ecwg nk-ecwg4 h-100">
        <div className="card-inner flex-grow-1">
          <div className="card-title-group mb-4">
            <div className="card-title">
              <h6 className="title">Total Orders</h6>
            </div>
            <div className="card-tools">
              <UncontrolledDropdown>
                <DropdownToggle
                  tag="a"
                  href="#toggle"
                  onClick={(ev) => ev.preventDefault()}
                  className="dropdown-toggle btn btn-icon btn-trigger"
                >
                  <Icon name="more-h" />
                </DropdownToggle>
                {/* <DropdownMenu end className="dropdown-menu-sm">
                  <ul className="link-list-opt no-bdr">
                    <li className={data === "7" ? "active" : ""}>
                      <DropdownItem
                        tag="a"
                        href="#dropdown"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setData("7");
                        }}
                      >
                        <span>7 Days</span>
                      </DropdownItem>
                    </li>
                    <li className={data === "15" ? "active" : ""}>
                      <DropdownItem
                        tag="a"
                        href="#dropdown"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setData("15");
                        }}
                      >
                        <span>15 days</span>
                      </DropdownItem>
                    </li>
                    <li className={data === "30" ? "active" : ""}>
                      <DropdownItem
                        tag="a"
                        href="#dropdown"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setData("30");
                        }}
                      >
                        <span>30 days</span>
                      </DropdownItem>
                    </li>
                  </ul>
                </DropdownMenu> */}
              </UncontrolledDropdown>
            </div>
          </div>
          <div className="data-group">
            <div className="nk-ecwg4-ck">
              {totalOrders === 0 && openOrders === 0 && closedOrders === 0 ? (
                <p>No orders yet.</p>
              ) : (
                <OrderTrafficChart orderSources={orderSources} />
              )}
            </div>
            <ul className="nk-ecwg4-legends">
              <li>
                <div className="title">
                  <span className="dot dot-lg sq" style={{ background: "#9cabff" }}></span>
                  <span>Total Orders</span>
                </div>
                {/* <div className="amount amount-xs">{data === "7" ? "1341" : data === "15" ? "3505" : "4000"}</div> */}
                <div className="amount amount-xs">{totalOrders}</div>
              </li>
              <li>
                <div className="title">
                  <span className="dot dot-lg sq" style={{ background: "#96f1d9" }}></span>
                  <span>Completed</span>
                </div>
                <div className="amount amount-xs">{openOrders}</div>

                {/* <div className="amount amount-xs">{data === "7" ? "859" : data === "15" ? "1650" : "3250"}</div> */}
              </li>
              <li>
                <div className="title">
                  <span className="dot dot-lg sq" style={{ background: "#ffa9ce" }}></span>
                  <span>Declined</span>
                </div>
                <div className="amount amount-xs">{closedOrders}</div>

                {/* <div className="amount amount-xs">{data === "7" ? "482" : data === "15" ? "800" : "1250"}</div> */}
              </li>
            </ul>
          </div>
        </div>
        <div className="card-inner card-inner-md bg-light">
          <div className="card-note">
            <Icon className="info-fill"></Icon>
            <span>Orders Statistics for this business</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StoreOrdersCharts;
