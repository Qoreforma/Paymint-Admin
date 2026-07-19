import React, { useMemo } from "react";
import { Card } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";

export const StatsCard = ({ data }) => {
  const totalSuccesful = useMemo(() => {
    if (data) {
      return (
        (data?.statusBreakdown?.find((status) => status?._id === "approved")?.totalAmount || 0) +
        (data?.statusBreakdown?.find((status) => status?._id === "s.approved")?.totalAmount || 0)
      );
    } else {
      return 0;
    }
  }, [data]);

  return (
    <Card>
      <div className="card-inner">
        <ul className="nk-tranx-statistics">
          {/* <li className="item">
            <Icon name="sign-kobo" className="bg-primary-dim"></Icon>
            <div className="info">
              <div className="title">Total </div>
              <div className="count">{formatter("NGN").format(data?.amounts?.totalFiatAmount || 0)}</div>
            </div>
          </li> */}
          <li className="item">
            <Icon name="sign-kobo" className="bg-success-dim"></Icon>
            <div className="info">
              <div className="title">Total Approved</div>
              <div className="count">{formatter("NGN").format(totalSuccesful)}</div>
            </div>
          </li>
          <li className="item">
            <Icon name="sign-kobo" className="bg-warning-dim"></Icon>
            <div className="info">
              <div className="title">Total Pending</div>
              <div className="count">
                {formatter("NGN").format(
                  data?.statusBreakdown?.find((status) => status?._id === "pending")?.totalAmount ?? 0,
                )}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export const StatsDetailsCard = ({ data }) => {
  return (
    <Card>
      <div className="card-inner">
        <ul className="nk-tranx-statistics">
          <li className="item">
            <Icon name="check" className="bg-success-dim"></Icon>
            <div className="info">
              <div className="title">Approved</div>
              <div className="count">
                {data?.find((status) => status?._id === "approved")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li>
          <li className="item">
            <Icon name="swap" className="bg-info-dim"></Icon>
            <div className="info">
              <div className="title">S.Approved</div>
              <div className="count">
                {data?.find((status) => status?._id === "s.approved")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li>
          <li className="item">
            <Icon name="update" className="bg-warning-dim"></Icon>
            <div className="info">
              <div className="title">Pending</div>
              <div className="count">
                {data?.find((status) => status?._id === "pending")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li>
          <li className="item">
            <Icon name="update" className="bg-secondary-dim"></Icon>
            <div className="info">
              <div className="title">Pending Deposit</div>
              <div className="count">
                {data?.find((status) => status?._id === "pending_deposit")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li>
          {/* <li className="item">
            <Icon name="cross" className="bg-danger-dim"></Icon>
            <div className="info">
              <div className="title">Declined</div>
              <div className="count">
                {data?.find((status) => status?._id === "declined")?.count?.toLocaleString() ?? 0}
              </div>
            </div>
          </li> */}
        </ul>
      </div>
    </Card>
  );
};
