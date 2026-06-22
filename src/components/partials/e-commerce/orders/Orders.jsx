import React, { useMemo } from "react";
import { Card } from "reactstrap";
import { Icon } from "../../../Component";
import { TotalOrderChart } from "../../charts/e-commerce/EcomCharts";
import { useGetOrderStats } from "../../../../api/dashboard";
import { useTimeFrame } from "../../../../hooks/timeframe";
import { formatDate } from "../../../../utils/Utils";

const Orders = () => {
  const { startDate, endDate } = useTimeFrame("Monthly");
  const { data } = useGetOrderStats(startDate, endDate);
  // console.log(data);

  const labels = useMemo(() => {
    if (data) {
      return data.orders.map((item) => {
        let date = new Date(item.day);
        return formatDate(date).split(",")[0];
      });
    } else {
      return [];
    }
  }, [data]);

  const chartData = useMemo(() => {
    if (data) {
      return data.orders.map((item) => item.numberOfOrders);
    } else {
      return [];
    }
  }, [data]);

  // console.log(labels);

  let totalOrders = {
    labels,
    dataUnit: "Orders",
    lineTension: 0.3,
    datasets: [
      {
        label: "Orders",
        borderColor: "#7de1f8",
        backgroundColor: "rgba(125, 225, 248, 0.25)",
        borderWidth: 2,
        fill: true,
        pointBorderColor: "transparent",
        pointBackgroundColor: "transparent",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#7de1f8",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 2,
        pointRadius: 4,
        pointHitRadius: 4,
        data: chartData,
      },
    ],
  };

  return (
    <Card>
      <div className="nk-ecwg nk-ecwg3">
        <div className="card-inner pb-0">
          <div className="card-title-group">
            <div className="card-title">
              <h6 className="title">Orders</h6>
            </div>
          </div>
          <div className="data">
            <div className="data-group">
              <div className="amount">{data?.today?.numberOfOrders || 0}</div>
              <div className="info text-end">
                <span className="change up text-danger">
                  <Icon name="arrow-long-up"></Icon>
                  {data?.percentageDifference}%
                </span>
                <br />
                <span>vs. last week</span>
              </div>
            </div>
          </div>
        </div>
        <div className="nk-ecwg3-ck">
          <TotalOrderChart totalOrders={totalOrders} />
        </div>
      </div>
    </Card>
  );
};
export default Orders;
