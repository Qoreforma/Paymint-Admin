import React, { useMemo } from "react";
import { Modal, ModalBody } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { BarChartExample } from "../../../../components/charts/Chart";
import { useGetUserChartData } from "../../../../api/users/user";

const UserChartModal = ({ modal, closeModal, period, startDate, endDate }) => {
  const { isLoading, data } = useGetUserChartData(period, startDate, endDate);

  const chartData = useMemo(() => {
    if (!data || !data.data) {
      return {
        labels: [],
        datasets: [{ label: "Users Joined", data: [], backgroundColor: "#007bff" }],
      };
    }
    const labels = data.data.map(item => item.date);
    const chartValues = data.data.map(item => item.count);

    return {
      labels,
      datasets: [
        {
          label: "Users Joined",
          data: chartValues,
          backgroundColor: "#007bff",
        },
      ],
    };
  }, [data]);

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
          <h5 className="title">User Registration Stats</h5>
          <div className="mt-4" style={{ height: "400px" }}>
            {isLoading ? (
              <div className="text-center">Loading chart data...</div>
            ) : (
              <BarChartExample data={chartData} />
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default UserChartModal;
