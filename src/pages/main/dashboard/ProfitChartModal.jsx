import React, { useMemo, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { Icon, Button } from "../../../components/Component";
import { BarChartExample } from "../../../components/charts/Chart";
import { useGetProfitChartData } from "../../../api/dashboard";
import { formatter } from "../../../utils/Utils";

const ProfitChartModal = ({ modal, closeModal, period, startDate, endDate }) => {
  const { isLoading, data } = useGetProfitChartData(period, startDate, endDate);
  const [viewType, setViewType] = useState("profit"); // "profit" | "volume" | "count"

  // Calculate summary metrics across the selected data
  const summary = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { totalProfit: 0, totalVolume: 0, totalCount: 0, avgDailyProfit: 0 };
    }

    const totalProfit = data.reduce((acc, item) => acc + (item.profit || 0), 0);
    const totalVolume = data.reduce((acc, item) => acc + (item.volume || 0), 0);
    const totalCount = data.reduce((acc, item) => acc + (item.count || 0), 0);
    const avgDailyProfit = data.length > 0 ? totalProfit / data.length : 0;

    return { totalProfit, totalVolume, totalCount, avgDailyProfit };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        labels: [],
        datasets: [{ label: "Profit (NGN)", data: [], backgroundColor: "#10b981" }],
      };
    }

    const labels = data.map((item) => item.date);
    let chartValues = [];
    let label = "Gross Profit (NGN)";
    let backgroundColor = "#10b981";

    if (viewType === "profit") {
      chartValues = data.map((item) => item.profit || 0);
      label = "Gross Profit (NGN)";
      backgroundColor = "#10b981";
    } else if (viewType === "volume") {
      chartValues = data.map((item) => item.volume || 0);
      label = "Transaction Volume (NGN)";
      backgroundColor = "#3b82f6";
    } else {
      chartValues = data.map((item) => item.count || 0);
      label = "Transaction Count";
      backgroundColor = "#8b5cf6";
    }

    return {
      labels,
      datasets: [
        {
          label,
          data: chartValues,
          backgroundColor,
          borderRadius: 4,
        },
      ],
    };
  }, [data, viewType]);

  const periodLabel = useMemo(() => {
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    switch (period) {
      case "today":
        return "Today (Hourly)";
      case "7d":
        return "Last 7 Days";
      case "1m":
        return "Last 30 Days";
      case "1y":
        return "This Year";
      default:
        return "All Time";
    }
  }, [period, startDate, endDate]);

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ModalBody className="p-4">
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            closeModal();
          }}
          className="close"
          style={{ position: "absolute", top: 16, right: 16 }}
        >
          <Icon name="cross-sm"></Icon>
        </a>

        {/* Header */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
          <div>
            <h5 className="title mb-0 d-flex align-items-center gap-2">
              <span>Platform Profit & Performance Chart</span>
            </h5>
            <div className="text-muted small mt-1">
              Showing breakdown for: <strong className="text-dark">{periodLabel}</strong>
            </div>
          </div>

          {/* View Type Toggle */}
          <div className="btn-group bg-light p-1 rounded-2" role="group">
            <Button
              color={viewType === "profit" ? "primary" : "transparent"}
              className={`btn-xs ${viewType === "profit" ? "shadow-sm fw-bold" : "text-dark"}`}
              onClick={() => setViewType("profit")}
              style={{ fontSize: 12, padding: "4px 12px" }}
            >
              💰 Profit
            </Button>
            <Button
              color={viewType === "volume" ? "primary" : "transparent"}
              className={`btn-xs ${viewType === "volume" ? "shadow-sm fw-bold" : "text-dark"}`}
              onClick={() => setViewType("volume")}
              style={{ fontSize: 12, padding: "4px 12px" }}
            >
              📈 Volume
            </Button>
            <Button
              color={viewType === "count" ? "primary" : "transparent"}
              className={`btn-xs ${viewType === "count" ? "shadow-sm fw-bold" : "text-dark"}`}
              onClick={() => setViewType("count")}
              style={{ fontSize: 12, padding: "4px 12px" }}
            >
              ⚡ Count
            </Button>
          </div>
        </div>

        {/* Top Summary Stat Pills */}
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-2 border bg-light text-center">
              <div className="text-muted text-uppercase" style={{ fontSize: 10, fontWeight: 700 }}>
                Total Profit
              </div>
              <div className="fw-bold mt-1 text-success" style={{ fontSize: 14 }}>
                {formatter("NGN").format(summary.totalProfit)}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-2 border bg-light text-center">
              <div className="text-muted text-uppercase" style={{ fontSize: 10, fontWeight: 700 }}>
                Total Volume
              </div>
              <div className="fw-bold mt-1 text-primary" style={{ fontSize: 14 }}>
                {formatter("NGN").format(summary.totalVolume)}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-2 border bg-light text-center">
              <div className="text-muted text-uppercase" style={{ fontSize: 10, fontWeight: 700 }}>
                Transactions
              </div>
              <div className="fw-bold mt-1 text-dark" style={{ fontSize: 14 }}>
                {summary.totalCount.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-2 border bg-light text-center">
              <div className="text-muted text-uppercase" style={{ fontSize: 10, fontWeight: 700 }}>
                Avg Daily Profit
              </div>
              <div className="fw-bold mt-1 text-info" style={{ fontSize: 14 }}>
                {formatter("NGN").format(summary.avgDailyProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="mt-2" style={{ height: "380px" }}>
          {isLoading ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
              <div className="spinner-border text-primary mb-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span>Loading profit analytics...</span>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
              <Icon name="bar-chart" style={{ fontSize: 36, opacity: 0.4 }}></Icon>
              <span className="mt-2">No transaction data recorded for this period</span>
            </div>
          ) : (
            <BarChartExample data={chartData} />
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ProfitChartModal;
