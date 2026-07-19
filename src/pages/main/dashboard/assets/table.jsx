import React, { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Badge,
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
} from "reactstrap";
import { useGetAssetsTransactions } from "../../../../api/assets";
import {
  Block,
  Button,
  Col,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  Row,
  UserAvatar,
} from "../../../../components/Component";
import { findUpper, formatDateWithHyphen, formatDateWithTime, formatter, truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { FilterOptions } from "../tables/filter-select";
import { assetFilterOptions } from "./data";
import ApproveModal from "./modals/approve";
import DeclineModal from "./modals/decline";
import PartialApprovalModal from "./modals/partial";
import { usePermission } from "../../../../utils/usePermission";
import { StatsCard, StatsDetailsCard } from "./stats-card";
import { useGetAssetTransactionsOverview } from "../../../../api/transactions";
import DateRangeFilter from "../tables/date-range-filter";

const AssetsTable = ({ data, showStats = false, isLoading, tradeType }) => {
  const { hasPermission } = usePermission();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [editedId, setEditedId] = useState();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const period = searchParams.get("period") ?? "custom";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const [view, setView] = useState({
    edit: false,
    add: false,
    details: false,
  });
  const [onSearch, setonSearch] = useState(false);
  const [showPartial, setShowPartial] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showApprove, setShowApprove] = useState(false);

  const { data: assetTxnsOverview, isLoading: fetchingOverview } = useGetAssetTransactionsOverview(
    period,
    startDate,
    endDate,
    tradeType,
  );

  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "approved") {
      return "success";
    } else if (status === "pending_deposit") {
      return "secondary";
    } else if (status === "s.approved") {
      return "info";
    } else {
      return "danger";
    }
  }, []);

  const hasDateFilter = startDate && endDate;

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const resetDateFilter = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("startDate");
      newParams.delete("endDate");
      newParams.delete("period");
      newParams.set("page", "1");
      return newParams;
    });
  };

  return (
    <React.Fragment>
      {/* Date Range Filter Section - Responsive filters with flex-wrap */}
      {showStats && (
        <div className="mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {hasDateFilter && (
              <Button onClick={resetDateFilter}>
                <Icon name="refresh" />
                Reset All Filters
              </Button>
            )}
            <div style={{ marginLeft: "auto" }} className="d-flex flex-wrap align-items-center gap-3 mb-4">
              {hasDateFilter && (
                <div className="d-flex align-items-center fw-medium px-3 py-2">
                  <Icon name="calendar" className="me-1" />
                  <span>
                    {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
                  </span>
                </div>
              )}
              <DateRangeFilter />
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Responsive stacking */}
      {showStats &&
        (fetchingOverview ? (
          <LoadingSpinner />
        ) : (
          <Row className="mb-5">
            <Col lg={5}>
              <StatsCard data={assetTxnsOverview?.data} />
            </Col>
            <Col lg={7}>
              <StatsDetailsCard data={assetTxnsOverview?.data?.statusBreakdown} />
            </Col>
          </Row>
        ))}

      <Block>
        <Card>
          <Nav tabs className="nav nav-tabs nav-tabs-card">
            {assetFilterOptions[0]?.options?.map((item, index) => (
              <NavItem key={index}>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={status === item?.value ? "active" : ""}
                  onClick={(ev) => {
                    ev.preventDefault();
                    setSearchParams((prev) => {
                      const newParams = new URLSearchParams(prev);
                      newParams.set("status", item?.value);
                      newParams.set("page", "1");
                      return newParams;
                    });
                  }}
                >
                  {item?.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          <div className="card-inner border-bottom">
            <div className="card-title-group">
              <div className="card-title">
                <h5 className="title ccap">{!tradeType ? "All" : tradeType} Assets Transactions</h5>
              </div>
              <div className="card-tools me-n1">
                <ul className="btn-toolbar gx-1">
                  <li>
                    <Button
                      href="#search"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setonSearch(true);
                      }}
                      className="btn-icon search-toggle toggle-search"
                    >
                      <Icon name="search"></Icon>
                    </Button>
                  </li>
                  <li className="btn-toolbar-sep"></li>
                  <li>
                    <FilterOptions options={assetFilterOptions} showDate />
                  </li>
                  <li>
                    <UncontrolledDropdown>
                      <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                        <Icon name="setting"></Icon>
                      </DropdownToggle>
                      <DropdownMenu end className="dropdown-menu-xs">
                        <SortToolTip />
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </li>
                </ul>
              </div>
              <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="reference" />
            </div>
          </div>
          <div className="card-inner-group">
            <div className="card-inner p-0">
              {isLoading ? (
                <LoadingSpinner />
              ) : data?.pagination?.total > 0 ? (
                <>
                  <DataTableBody className="is-compact">
                    <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Fullname</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Reference No</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Asset Name</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">P/L</span>
                      </DataTableRow>
                      {!tradeType && (
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Type</span>
                        </DataTableRow>
                      )}
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Provider</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Channel</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Date</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Status</span>
                      </DataTableRow>

                      <DataTableRow className="nk-tb-col-tools">
                        <ul className="nk-tb-actions gx-1 my-n1">
                          <li className="me-n1">
                            <UncontrolledDropdown>
                              <DropdownToggle
                                tag="a"
                                href="#toggle"
                                onClick={(ev) => ev.preventDefault()}
                                className="dropdown-toggle btn btn-icon btn-trigger disabled"
                              >
                                <Icon name="more-h"></Icon>
                              </DropdownToggle>
                            </UncontrolledDropdown>
                          </li>
                        </ul>
                      </DataTableRow>
                    </DataTableHead>
                    {data?.data?.map((item, index) => {
                      return (
                        <DataTableItem key={item?._id} className="text-secondary">
                          <DataTableRow size="sm">
                            <span>{index + 1}</span>
                          </DataTableRow>
                          <DataTableRow size="sm" className="text-primary fw-bold">
                            <Link to={`/user-details/${item?.userId?._id}`}>
                              <div className="user-card">
                                <div className="user-name">
                                  <span className="tb-lead text-primary text-capitalize fw-bold">
                                    {truncateText(`${item?.userId?.firstname} ${item?.userId?.lastname}`, 20)}{" "}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{item?.reference}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{item?.cryptoId?.name}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>
                              {item?.status === "s.approved"
                                ? formatter("NGN").format(item?.reviewAmount)
                                : formatter("NGN").format(item?.fiatAmount)}
                            </span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{formatter("NGN").format(item?.profit ?? 0)}</span>
                          </DataTableRow>
                          {!tradeType && (
                            <DataTableRow size="sm">
                              <span className="ccap"> {item?.tradeType}</span>
                            </DataTableRow>
                          )}
                          <DataTableRow size="sm">
                            <span className="ccap"> {item?.meta?.processedBy}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="ccap"> {item?.channel}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{formatDateWithHyphen(item?.createdAt)}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <Badge
                              className="badge-sm badge-dot has-bg d-sm-inline-flex"
                              color={statusColor(item?.status)}
                            >
                              <span className="ccap">
                                {item?.status === "s.approved" ? "S.approved" : item?.status?.replaceAll("_", " ")}
                              </span>
                            </Badge>
                          </DataTableRow>
                          <DataTableRow className="nk-tb-col-tools">
                            <ul className="nk-tb-actions gx-1 my-n1">
                              <li className="me-n1">
                                <UncontrolledDropdown>
                                  <DropdownToggle
                                    tag="a"
                                    href="#more"
                                    onClick={(ev) => ev.preventDefault()}
                                    className="dropdown-toggle btn btn-icon btn-trigger"
                                  >
                                    <Icon name="more-h"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            navigate(`/assets-details/${item?._id}`);
                                          }}
                                        >
                                          <Icon name="eye"></Icon>
                                          <span>View</span>
                                        </DropdownItem>
                                      </li>

                                      {item?.status === "pending" && hasPermission("crypto.update") && (
                                        <>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                setEditedId(item?._id);
                                                setShowApprove(true);
                                              }}
                                            >
                                              <Icon name="check"></Icon>
                                              <span>Approve</span>
                                            </DropdownItem>
                                          </li>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                setEditedId(item?._id);
                                                setShowPartial(true);
                                              }}
                                            >
                                              <Icon name="check"></Icon>
                                              <span>Second Approve</span>
                                            </DropdownItem>
                                          </li>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                setEditedId(item?._id);
                                                setShowDecline(true);
                                              }}
                                            >
                                              <Icon name="na"></Icon>
                                              <span>Decline</span>
                                            </DropdownItem>
                                          </li>
                                        </>
                                      )}
                                    </ul>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </li>
                            </ul>
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })}
                  </DataTableBody>
                  <div className="card-inner">
                    {data?.pagination?.total > 0 && (
                      <PaginationComponent
                        itemPerPage={itemsPerPage}
                        totalItems={data?.pagination?.total}
                        paginate={paginate}
                        currentPage={Number(currentPage)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center" style={{ paddingBlock: "1rem" }}>
                  <span className="text-silent">No Transaction found</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Block>
      <ApproveModal modal={showApprove} closeModal={setShowApprove} editedId={editedId} />
      <PartialApprovalModal modal={showPartial} closeModal={setShowPartial} editedId={editedId} />
      <DeclineModal modal={showDecline} closeModal={setShowDecline} editedId={editedId} />
    </React.Fragment>
  );
};

export default AssetsTable;
