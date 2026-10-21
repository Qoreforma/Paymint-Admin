import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Badge } from "reactstrap";

import {
  Block,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  UserAvatar,
} from "../../../../../components/Component";
import {
  findUpper,
  capitalizeFirstLetter,
  truncateText,
  formatDateWithHyphen,
} from "../../../../../utils/Utils";
import LoadingSpinner from "../../../../components/spinner";

const ReferralUserList = ({ list, isLoading }) => {
  const statusColor = useCallback((status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "suspended":
      case "blocked":
        return "danger";
      default:
        return "secondary";
    }
  }, []);

  return (
    <React.Fragment>
      <>
        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <h5 className="title">All Referred Users</h5>
              </div>
            </div>
            {isLoading ? (
              <LoadingSpinner />
            ) : list?.length > 0 ? (
              <>
                <DataTableBody compact>
                  <DataTableHead>
                    <DataTableRow>
                      <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="tb-tnx-head bg-white text-secondary">User</span>
                    </DataTableRow>
                    <DataTableRow size="lg">
                      <span className="tb-tnx-head bg-white text-secondary">Username</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="tb-tnx-head bg-white text-secondary">Date Joined</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="tb-tnx-head bg-white text-secondary">App Version</span>
                    </DataTableRow>
                    <DataTableRow size="md">
                      <span className="tb-tnx-head bg-white text-secondary">Status</span>
                    </DataTableRow>
                  </DataTableHead>
                  {/*Head*/}
                  {list?.map((item, idx) => {
                    const referred = item?.referredId;
                    return (
                      <DataTableItem className="text-secondary" key={idx}>
                        <DataTableRow>
                          <span>{idx + 1}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <Link to={`/user-details/${referred?._id}`}>
                            <div className="user-card">
                              <UserAvatar
                                theme={referred?.avatar}
                                className="xs"
                                text={findUpper(
                                  `${capitalizeFirstLetter(referred?.firstname ?? "")} ${capitalizeFirstLetter(
                                    referred?.lastname ?? "",
                                  )}`,
                                )}
                                image={referred?.avatar}
                              />
                              <div className="user-name">
                                <span className="tb-lead ccap">
                                  {truncateText(`${referred?.firstname ?? ""} ${referred?.lastname ?? ""}`, 20)}{" "}
                                </span>
                                <p className="text-primary fw-normal">{truncateText(referred?.email ?? "", 20)}</p>
                              </div>
                            </div>
                          </Link>
                        </DataTableRow>

                        <DataTableRow size="lg">
                          <span className="ccap">
                            {referred?.username ? truncateText(referred.username, 15) : "Not set"}
                          </span>
                        </DataTableRow>

                        <DataTableRow size="sm">
                          <span style={{ whiteSpace: "nowrap" }}>
                            {referred?.createdAt ? formatDateWithHyphen(referred.createdAt) : "—"}
                          </span>
                        </DataTableRow>

                        <DataTableRow size="sm">
                          {referred?.appVersion ? (
                            <Badge className="badge-sm badge-dim" color="info">
                              v{referred.appVersion}
                            </Badge>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>
                              No Version
                            </span>
                          )}
                        </DataTableRow>

                        <DataTableRow size="md">
                          <span className={`dot bg-${statusColor(referred?.status)} d-sm-none`}></span>
                          <Badge
                            className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                            color={statusColor(referred?.status)}
                          >
                            <span className="ccap">{referred?.status ?? "—"}</span>
                          </Badge>
                        </DataTableRow>
                      </DataTableItem>
                    );
                  })}
                </DataTableBody>
              </>
            ) : (
              <div className="text-center" style={{ paddingBlock: "1rem" }}>
                <span className="text-silent">No referrals.</span>
              </div>
            )}
          </DataTable>
        </Block>
      </>
    </React.Fragment>
  );
};
export default ReferralUserList;
