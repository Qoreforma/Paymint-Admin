import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody } from "reactstrap";
import { Icon } from "../../../components/Component";
import { BarChartExample } from "../../../components/charts/Chart";
import { useGetProfitChartData } from "../../../api/dashboard";
import { formatter } from "../../../utils/Utils";
import toast from "react-hot-toast";
import "./executive-dashboard.css";

const ProfitChartModal = ({ modal, closeModal, period, startDate, endDate }) => {
  const navigate = useNavigate();
  const { isLoading, data } = useGetProfitChartData(period, startDate, endDate);
  const [viewType, setViewType] = useState("profit"); // "profit" | "volume" | "count"

  const handleBarClick = (dateStr) => {
    if (!dateStr) return;
    const cleanDate = dateStr.includes("T")
      ? dateStr.split("T")[0]
      : dateStr.includes(" ")
      ? dateStr.split(" ")[0]
      : dateStr;

    const parsedDate = new Date(`${cleanDate}T00:00:00`);
    const formattedDate = !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : cleanDate;

    closeModal();
    toast.success(`Navigating to transactions for ${formattedDate}`);
    navigate(`/transactions/all?startDate=${cleanDate}&endDate=${cleanDate}&period=custom&page=1`);
  };

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
    <Modal
      isOpen={modal}
      toggle={() => closeModal()}
      className="modal-dialog-centered profit-chart-modal"
      size="lg"
    >
      <ModalBody
        style={{
          padding: "28px 32px 28px",
          position: "relative",
        }}
      >
        {/* Unobstructed, dedicated Close Button */}
        <button
          type="button"
          onClick={() => closeModal()}
          className="profit-close-btn"
          aria-label="Close"
          title="Close modal"
        >
          <Icon name="cross-sm" style={{ fontSize: "18px" }}></Icon>
        </button>

        {/* Header */}
        <div className="profit-modal-header">
          <div>
            <h5
              className="title mb-0 d-flex align-items-center gap-2"
              style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a" }}
            >
              <span>Platform Profit & Performance Chart</span>
            </h5>
            <div className="text-muted small mt-1">
              Showing breakdown for: <strong className="text-dark">{periodLabel}</strong>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "11px", color: "#64748b" }}>
              💡 Click any bar to view that day&apos;s transactions
            </div>
          </div>

          {/* View Type Toggle */}
          <div
            className="btn-group bg-light p-1 rounded-2 border"
            role="group"
            style={{ gap: "3px" }}
          >
            <button
              type="button"
              className={`btn btn-xs rounded-2 ${
                viewType === "profit"
                  ? "btn-primary shadow-sm fw-bold"
                  : "btn-outline-light text-dark border-0"
              }`}
              onClick={() => setViewType("profit")}
              style={{
                fontSize: 12,
                padding: "5px 14px",
                fontWeight: 600,
                height: "32px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>💰</span> Profit
            </button>
            <button
              type="button"
              className={`btn btn-xs rounded-2 ${
                viewType === "volume"
                  ? "btn-primary shadow-sm fw-bold"
                  : "btn-outline-light text-dark border-0"
              }`}
              onClick={() => setViewType("volume")}
              style={{
                fontSize: 12,
                padding: "5px 14px",
                fontWeight: 600,
                height: "32px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>📈</span> Volume
            </button>
            <button
              type="button"
              className={`btn btn-xs rounded-2 ${
                viewType === "count"
                  ? "btn-primary shadow-sm fw-bold"
                  : "btn-outline-light text-dark border-0"
              }`}
              onClick={() => setViewType("count")}
              style={{
                fontSize: 12,
                padding: "5px 14px",
                fontWeight: 600,
                height: "32px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>⚡</span> Count
            </button>
          </div>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="row g-3" style={{ marginBottom: "20px" }}>
          <div className="col-6 col-md-3">
            <div className="profit-stat-card">
              <div
                className="text-muted text-uppercase"
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.5px" }}
              >
                Total Profit
              </div>
              <div className="fw-bold mt-1 text-success" style={{ fontSize: 15, lineHeight: 1.2 }}>
                {formatter("NGN").format(summary.totalProfit)}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="profit-stat-card">
              <div
                className="text-muted text-uppercase"
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.5px" }}
              >
                Total Volume
              </div>
              <div className="fw-bold mt-1 text-primary" style={{ fontSize: 15, lineHeight: 1.2 }}>
                {formatter("NGN").format(summary.totalVolume)}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="profit-stat-card">
              <div
                className="text-muted text-uppercase"
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.5px" }}
              >
                Transactions
              </div>
              <div className="fw-bold mt-1 text-dark" style={{ fontSize: 15, lineHeight: 1.2 }}>
                {summary.totalCount.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="profit-stat-card">
              <div
                className="text-muted text-uppercase"
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.5px" }}
              >
                Avg Daily Profit
              </div>
              <div className="fw-bold mt-1 text-info" style={{ fontSize: 15, lineHeight: 1.2 }}>
                {formatter("NGN").format(summary.avgDailyProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div style={{ height: "380px", marginTop: "10px" }}>
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
            <BarChartExample data={chartData} onBarClick={handleBarClick} />
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ProfitChartModal;
