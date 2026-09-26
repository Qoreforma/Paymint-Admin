import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Modal, ModalBody } from "reactstrap";
import { Icon, Button } from "../../../../components/Component";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useGetTransactionChartData } from "../../../../api/transactions";
import toast from "react-hot-toast";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TransactionChartModal = ({ modal, closeModal, period, startDate, endDate, type, onSelectDate }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading, data } = useGetTransactionChartData(period, startDate, endDate, type);
  const [viewType, setViewType] = useState("count"); // "count" | "volume" | "profit"

  const handleBarClick = (dateStr) => {
    if (!dateStr) return;
    const cleanDate = dateStr.includes("T")
      ? dateStr.split("T")[0]
      : dateStr.includes(" ")
      ? dateStr.split(" ")[0]
      : dateStr;

    if (onSelectDate) {
      onSelectDate(cleanDate);
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("startDate", cleanDate);
        next.set("endDate", cleanDate);
        next.set("period", "custom");
        next.set("page", "1");
        return next;
      });
      closeModal();
      const parsedDate = new Date(`${cleanDate}T00:00:00`);
      const formattedDate = !isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : cleanDate;
      toast.success(`Showing transactions for ${formattedDate}`);
    }
  };

  const chartData = useMemo(() => {
    if (!data || !data.data || !data.data.length) {
      return { labels: [], datasets: [] };
    }

    const labels = data.data.map((item) => item.date);

    if (viewType === "count") {
      // Grouped bars: Success / Failed / Pending+Processing / Reversed
      return {
        labels,
        datasets: [
          {
            label: "Success",
            data: data.data.map((item) => item.successCount ?? 0),
            backgroundColor: "rgba(16, 185, 129, 0.85)",   // green
            borderRadius: 3,
            barPercentage: 0.8,
          },
          {
            label: "Failed",
            data: data.data.map((item) => item.failedCount ?? 0),
            backgroundColor: "rgba(239, 68, 68, 0.85)",    // red
            borderRadius: 3,
            barPercentage: 0.8,
          },
          {
            label: "Pending / Processing",
            data: data.data.map((item) => (item.pendingCount ?? 0) + (item.processingCount ?? 0)),
            backgroundColor: "rgba(245, 158, 11, 0.85)",   // amber
            borderRadius: 3,
            barPercentage: 0.8,
          },
          {
            label: "Reversed",
            data: data.data.map((item) => item.reversedCount ?? 0),
            backgroundColor: "rgba(139, 92, 246, 0.85)",   // purple
            borderRadius: 3,
            barPercentage: 0.8,
          },
        ],
      };
    }

    if (viewType === "volume") {
      return {
        labels,
        datasets: [
          {
            label: "Successful Volume (NGN)",
            data: data.data.map((item) => item.successVolume ?? 0),
            backgroundColor: "rgba(16, 185, 129, 0.85)",
            borderRadius: 3,
          },
        ],
      };
    }

    // profit
    return {
      labels,
      datasets: [
        {
          label: "Profit from Successful Txns (NGN)",
          data: data.data.map((item) => item.successProfit ?? 0),
          backgroundColor: "rgba(59, 130, 246, 0.85)",
          borderRadius: 3,
        },
      ],
    };
  }, [data, viewType]);

  const chartOptions = useMemo(() => ({
    interaction: {
      mode: "index",
      intersect: false,
    },
    onHover: (event, elements) => {
      if (event?.native?.target) {
        event.native.target.style.cursor = elements && elements.length > 0 ? "pointer" : "default";
      }
    },
    onClick: (event, elements, chart) => {
      let targetElements = elements;
      if ((!targetElements || targetElements.length === 0) && chart && event?.native) {
        targetElements = chart.getElementsAtEventForMode(
          event.native,
          "index",
          { intersect: false },
          false
        );
      }
      if (targetElements && targetElements.length > 0) {
        const elementIndex = targetElements[0].index;
        const label = chart?.data?.labels?.[elementIndex] || chartData?.labels?.[elementIndex];
        if (label) handleBarClick(label);
      }
    },
    plugins: {
      legend: {
        display: viewType === "count",
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 16,
          color: "#64748b",
          font: { size: 12 },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1e293b",
        titleFont: { size: 13, weight: "bold" },
        titleColor: "#ffffff",
        titleMarginBottom: 6,
        bodyColor: "#cbd5e1",
        bodyFont: { size: 12 },
        bodySpacing: 4,
        padding: 12,
        footerMarginTop: 6,
        footerColor: "#38bdf8",
        footerFont: { size: 11, weight: "600" },
        callbacks: {
          footer: () => "👆 Click to filter by this day",
        },
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        display: true,
        beginAtZero: true,
        ticks: { color: "#9eaecf", font: { size: 12 }, padding: 5 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        display: true,
        ticks: { color: "#9eaecf", font: { size: 11 }, padding: 5, maxRotation: 45 },
        grid: { color: "transparent" },
      },
    },
  }), [viewType, chartData]);

  const viewLabels = {
    count: "Count",
    volume: "Volume",
    profit: "Profit",
  };

  const subtitles = {
    count: "Success, Failed, Pending & Reversed per day",
    volume: "Successful transactions only — reversed/failed excluded",
    profit: "Profit from successful transactions only",
  };

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="xl">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h5 className="title mb-1">Transaction Stats</h5>
              <div className="text-muted small">
                💡 {subtitles[viewType]} &nbsp;·&nbsp; Click any bar to filter by date
              </div>
            </div>
            <div className="btn-group">
              {["count", "volume", "profit"].map((v) => (
                <Button
                  key={v}
                  color={viewType === v ? "primary" : "light"}
                  onClick={() => setViewType(v)}
                  size="sm"
                >
                  {viewLabels[v]}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4" style={{ height: "420px" }}>
            {isLoading ? (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                Loading chart data...
              </div>
            ) : !chartData.labels?.length ? (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                No data for the selected period.
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>

          {/* Status legend summary at bottom for count view */}
          {viewType === "count" && !isLoading && !!data?.data?.length && (
            <div className="d-flex gap-3 flex-wrap mt-3 small text-muted">
              <span style={{ color: "rgba(16,185,129,1)" }}>■ Success</span>
              <span style={{ color: "rgba(239,68,68,1)" }}>■ Failed</span>
              <span style={{ color: "rgba(245,158,11,1)" }}>■ Pending / Processing</span>
              <span style={{ color: "rgba(139,92,246,1)" }}>■ Reversed</span>
            </div>
          )}

          {viewType !== "count" && (
            <div className="mt-2 small text-muted">
              ℹ️ Only <strong>successful</strong> transactions are counted here to reflect real {viewType === "volume" ? "money moved" : "earnings"}.
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default TransactionChartModal;
