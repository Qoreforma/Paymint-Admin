import React, { useState, useMemo } from "react";
import { Icon } from "../../../Component";
import { Card, UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { AverageOrderChart } from "../../charts/e-commerce/EcomCharts";
import { useGetAverageOrderStats } from "../../../../api/dashboard";
import { useTimeFrame } from "../../../../hooks/timeframe";
import { formatCurrency, formatDate } from "../../../../utils/Utils";

const AverageOrder = () => {
  const [data, setData] = useState("Weekly");
  const { startDate, endDate } = useTimeFrame(data);

  const { data: averageOrder } = useGetAverageOrderStats(startDate, endDate);

  const labels = useMemo(() => {
    if (averageOrder) {
      return averageOrder.orderArrays.map((item) => {
        let date = new Date(item.day);
        return formatDate(date).split(",")[0];
      });
    } else {
      return [];
    }
  }, [averageOrder]);

  const chartData = useMemo(() => {
    if (averageOrder) {
      return averageOrder.orderArrays.map((item) => item.total);
    } else {
      return [];
    }
  }, [averageOrder]);
  let averageOrderData = {
    labels,
    dataUnit: "People",
    lineTension: 0.1,
    datasets: [
      {
        label: "Active Users",
        borderColor: "#b695ff",
        backgroundColor: "#b695ff",
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderWidth: 2,
        data: chartData,
      },
    ],
  };
  return (
    <Card className="h-100">
      <div className="nk-ecwg nk-ecwg2">
        <div className="card-inner">
          <div className="card-title-group mt-n1">
            <div className="card-title">
              <h6 className="title">Averarge order</h6>
            </div>
            <div className="card-tools me-n1">
              <UncontrolledDropdown>
                <DropdownToggle
                  tag="a"
                  href="#toggle"
                  onClick={(ev) => ev.preventDefault()}
                  className="dropdown-toggle btn btn-icon btn-trigger"
                >
                  <Icon name="more-h" />
                </DropdownToggle>
                <DropdownMenu end className="dropdown-menu-sm">
                  <ul className="link-list-opt no-bdr">
                    <li className={data === "7" ? "active" : ""}>
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
          <div className="data">
            <div className="data-group">
              <div className="amount">
                {averageOrder ? formatCurrency(averageOrder.averagePriceNGN) : formatCurrency(0)}
              </div>
              <div className="info text-end">
                <span className="change up text-danger">
                  <Icon name="arrow-long-up"></Icon>4.63%
                </span>
                <br />
                <span>vs. last week</span>
              </div>
            </div>
          </div>
          <h6 className="sub-title">Orders over time</h6>
        </div>
        <div className="nk-ecwg2-ck">
          <AverageOrderChart state={averageOrderData} />
        </div>
      </div>
    </Card>
  );
};
export default AverageOrder;
