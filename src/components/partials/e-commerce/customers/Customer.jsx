import React from "react";
import { Card } from "reactstrap";
import { Icon } from "../../../Component";
import { TotalCustomerChart } from "../../charts/e-commerce/EcomCharts";
import { useGetCustomerStats } from "../../../../api/dashboard";
import { useTimeFrame } from "../../../../hooks/timeframe";
import { useMemo } from "react";
import { formatDate } from "../../../../utils/Utils";

const Customer = () => {
  const { startDate, endDate } = useTimeFrame("Monthly");
  const { data } = useGetCustomerStats(startDate, endDate);
  // console.log(data);

  const labels = useMemo(() => {
    if (data) {
      return data.customers.map((item) => {
        let date = new Date(item.day);
        return formatDate(date).split(",")[0];
      });
    } else {
      return [];
    }
  }, [data]);

  const chartData = useMemo(() => {
    if (data) {
      return data.customers.map((item) => item.numberOfBuyers);
    } else {
      return [];
    }
  }, [data]);

  let totalCustomers = {
    labels,
    dataUnit: "Customers",
    lineTension: 0.3,
    datasets: [
      {
        label: "Customers",
        borderColor: "#83bcff",
        backgroundColor: "rgba(131, 188, 255, 0.25)",
        borderWidth: 2,
        fill: true,
        pointBorderColor: "transparent",
        pointBackgroundColor: "transparent",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#83bcff",
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
              <h6 className="title">Customers</h6>
            </div>
          </div>
          <div className="data">
            <div className="data-group">
              <div className="amount">{data?.today?.numberOfBuyers || 0}</div>
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
          <TotalCustomerChart totalCustomers={totalCustomers} />
        </div>
      </div>
    </Card>
  );
};
export default Customer;
