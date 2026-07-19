import React, { useMemo } from "react";
import { Card } from "reactstrap";
// import { Icon } from "../../../Component";
import { TotalSalesChart } from "../../charts/e-commerce/EcomCharts";
import { useGetTotalSaleStats } from "../../../../api/dashboard";
import { useTimeFrame } from "../../../../hooks/timeframe";
import { formatCurrency, formatDate } from "../../../../utils/Utils";

const TotalSales = () => {
  const { startDate, endDate } = useTimeFrame("Monthly");
  const { data } = useGetTotalSaleStats(startDate, endDate);

  const labels = useMemo(() => {
    if (data) {
      return data.orderArrays.map((item) => {
        let date = new Date(item.day);
        return formatDate(date).split(",")[0];
      });
    } else {
      return [];
    }
  }, [data]);

  const totals = useMemo(() => {
    if (data) {
      return data.orderArrays.map((item) => item.total);
    } else {
      return [];
    }
  }, [data]);

  // console.log(data);
  let totalSales = {
    labels,
    dataUnit: "Sales",
    lineTension: 0.3,
    datasets: [
      {
        label: "Sales",
        borderColor: "#9d72ff",
        backgroundColor: "rgba(157, 114, 255, 0.25)",
        borderWidth: 2,
        fill: true,
        pointBorderColor: "transparent",
        pointBackgroundColor: "transparent",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#9d72ff",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 2,
        pointRadius: 4,
        pointHitRadius: 4,
        data: totals,
      },
    ],
  };

  return (
    <Card className="is-dark h-100">
      <div className="nk-ecwg nk-ecwg1">
        <div className="card-inner">
          <div className="card-title-group">
            <div className="card-title">
              <h6 className="title">Total Sales</h6>
            </div>
          </div>
          <div className="data">
            <div className="amount">{data ? formatCurrency(data?.totalSales) : formatCurrency(0)}</div>
            {/* <div className="info">
              <strong>$7,395.37</strong> in last month
            </div> */}
          </div>
          {/* <div className="data">
            <h6 className="sub-title">This week so far</h6>
            <div className="data-group">
              <div className="amount">$1,338.72</div>
              <div className="info text-end">
                <span className="change up text-danger">
                  <Icon name="arrow-long-up"></Icon>4.63%
                </span>
                <br />
                <span>vs. last week</span>
              </div>
            </div>
          </div> */}
        </div>
        <div className="nk-ecwg1-ck">
          <TotalSalesChart totalSales={totalSales} />
        </div>
      </div>
    </Card>
  );
};

export default TotalSales;
