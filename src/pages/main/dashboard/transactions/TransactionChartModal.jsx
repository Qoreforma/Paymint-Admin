import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Modal, ModalBody } from "reactstrap";
import { Icon, Button } from "../../../../components/Component";
import { BarChartExample } from "../../../../components/charts/Chart";
import { useGetTransactionChartData } from "../../../../api/transactions";
import toast from "react-hot-toast";

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
    if (!data || !data.data) {
      return {
        labels: [],
        datasets: [{ label: "Transactions", data: [], backgroundColor: "#007bff" }],
      };
    }
    const labels = data.data.map(item => item.date);
    let chartValues = [];
    let label = "Transaction Count";
    let backgroundColor = "#007bff";

    if (viewType === "count") {
      chartValues = data.data.map(item => item.count);
      label = "Transaction Count";
      backgroundColor = "#007bff";
    } else if (viewType === "volume") {
      chartValues = data.data.map(item => item.volume);
      label = "Transaction Volume (NGN)";
      backgroundColor = "#28a745";
    } else if (viewType === "profit") {
      chartValues = data.data.map(item => item.profit || 0);
      label = "Profit (NGN)";
      backgroundColor = "#10b981";
    }

    return {
      labels,
      datasets: [
        {
          label,
          data: chartValues,
          backgroundColor,
        },
      ],
    };
  }, [data, viewType]);

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="title mb-0">Transaction Stats</h5>
              <div className="text-muted small mt-1">
                💡 Click any bar to view transactions for that day
              </div>
            </div>
            <div className="btn-group">
              <Button
                color={viewType === "count" ? "primary" : "light"}
                onClick={() => setViewType("count")}
                size="sm"
              >
                Count
              </Button>
              <Button
                color={viewType === "volume" ? "primary" : "light"}
                onClick={() => setViewType("volume")}
                size="sm"
              >
                Volume
              </Button>
              <Button
                color={viewType === "profit" ? "primary" : "light"}
                onClick={() => setViewType("profit")}
                size="sm"
              >
                Profit
              </Button>
            </div>
          </div>
          <div className="mt-4" style={{ height: "400px" }}>
            {isLoading ? (
              <div className="text-center">Loading chart data...</div>
            ) : (
              <BarChartExample data={chartData} onBarClick={handleBarClick} />
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default TransactionChartModal;
