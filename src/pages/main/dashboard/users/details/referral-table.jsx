import React from "react";
import { Link } from "react-router-dom";

import {
  Block,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  UserAvatar,
} from "../../../../../components/Component";
import { findUpper, capitalizeFirstLetter } from "../../../../../utils/Utils";
import LoadingSpinner from "../../../../components/spinner";

const ReferralUserList = ({ list, isLoading }) => {
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
                    <DataTableRow className="nk-tb-col-check">
                      <div className="custom-control custom-control-sm custom-checkbox notext">S/N</div>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text ">User</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text ">Email</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="sub-text">Phone</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text ">Type</span>
                    </DataTableRow>
                  </DataTableHead>
                  {/*Head*/}
                  {list?.map((item, idx) => {
                    return (
                      <DataTableItem key={idx}>
                        <DataTableRow className="nk-tb-col-check">
                          <div className="custom-control custom-control-sm custom-checkbox notext">{idx + 1}</div>
                        </DataTableRow>
                        <DataTableRow>
                          <Link to={`/user-details/${item?._id}`}>
                            <div className="user-card">
                              <UserAvatar
                                theme={item?.referredId?.avatar}
                                className="xs"
                                text={findUpper(
                                  `${capitalizeFirstLetter(item?.referredId?.firstname)} ${capitalizeFirstLetter(
                                    item?.referredId?.lastname,
                                  )}`,
                                )}
                                image={item?.avatar}
                              />
                              <div className="user-name">
                                <span className="tb-lead text-primary">
                                  {item?.referredId?.firstname} {item?.referredId?.lastname}{" "}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </DataTableRow>

                        <DataTableRow size="lg">
                          <span className="fs-12px">{item?.referredId?.email || "Not set"}</span>
                        </DataTableRow>

                        <DataTableRow size="sm">
                          {item.referredId?.phone ? (
                            <span className="fs-12px">
                              ({item?.referredId?.phoneCode}){item?.referredId?.phone}
                            </span>
                          ) : (
                            <span className="fs-12px">Not set</span>
                          )}
                        </DataTableRow>
                        <DataTableRow>
                          <span className="ccap fs-12px">{item?.userType}</span>
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
