import React, { useMemo } from "react";
import { Card } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";

export const AmountStatsCard = ({ data }) => {
  const totalApproved = useMemo(() => {
    if (data) {
      return (
        (data?.statusBreakdown?.find((status) => status?.status === "approved")?.totalPayableAmount || 0) +
        (data?.statusBreakdown?.find((status) => status?.status === "s.approved")?.totalPayableAmount || 0)
      );
    } else {
      return 0;
    }
  }, [data]);

  const totalPending = useMemo(() => {
    if (data) {
      return data?.statusBreakdown?.find((status) => status?.status === "pending")?.totalPayableAmount || 0;
    } else {
      return 0;
    }
  }, [data]);

  return (
    <Card>
      <div className="card-inner">
        <ul className="nk-tranx-statistics">
          <li className="item">
            <Icon name="sign-kobo" className="bg-success-dim"></Icon>
            <div className="info">
              <div className="title">Total Approved</div>
              <div className="count">{formatter("NGN").format(totalApproved)}</div>
            </div>
          </li>
          <li className="item">
            <Icon name="sign-kobo" className="bg-warning-dim"></Icon>
            <div className="info">
              <div className="title">Total Pending</div>
              <div className="count">{formatter("NGN").format(totalPending)}</div>
            </div>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export const StatsDetailsCard = ({ data }) => {
  // console.log(data);
  return (
    <Card>
      <div className="card-inner">
        <ul className="nk-tranx-statistics">
          <li className="item">
            <Icon name="check" className="bg-success-dim"></Icon>
            <div className="info">
              <div className="title">Approved</div>
              <div className="count">
                {data?.find((status) => status?.status === "approved")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li>
          <li className="item">
            <Icon name="swap" className="bg-info-dim"></Icon>
            <div className="info">
              <div className="title">S.Approved</div>
              <div className="count">
                {data?.find((status) => status?.status === "s.approved")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li>
          <li className="item">
            <Icon name="update" className="bg-warning-dim"></Icon>
            <div className="info">
              <div className="title">Pending</div>
              <div className="count">
                {data?.find((status) => status?.status === "pending")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li>
          <li className="item">
            <Icon name="coins" className="bg-secondary-dim"></Icon>
            <div className="info">
              <div className="title">Multiple</div>
              <div className="count">
                {data?.find((status) => status?.status === "multiple")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li>
          {/* <li className="item">
            <Icon name="cross" className="bg-danger-dim"></Icon>
            <div className="info">
              <div className="title">Declined</div>
              <div className="count">
                {data?.find((status) => status?.status === "declined")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li> */}
        </ul>
      </div>
    </Card>
  );
};

export const WalletAmountStatsCard = ({ data, successful, profit }) => {
  return (
    <Card className="h-100">
      <div className="card-inner h-100 d-flex flex-column justify-content-center py-3">
        <ul className="nk-tranx-statistics my-auto w-100">
          <li className="item">
            <Icon name="sign-kobo" className="bg-primary-dim"></Icon>
            <div className="info">
              <div className="title">Total</div>
              <div className="count">{formatter("NGN").format(data || 0)}</div>
            </div>
          </li>

          <li className="item">
            <Icon name="sign-kobo" className="bg-success-dim"></Icon>
            <div className="info">
              <div className="title">Total Successful</div>
              <div className="count">{formatter("NGN").format(successful || 0)}</div>
            </div>
          </li>

          {profit !== undefined && (
            <li className="item">
              <Icon name="growth" className="bg-info-dim text-info"></Icon>
              <div className="info">
                <div className="title">Total Profit</div>
                <div
                  className="count fw-bold"
                  style={{ color: (profit || 0) >= 0 ? "#10b981" : "#ef4444" }}
                >
                  {(profit || 0) > 0 ? "+" : ""}
                  {formatter("NGN").format(profit || 0)}
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
};
