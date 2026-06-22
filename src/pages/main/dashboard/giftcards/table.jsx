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
import {
  findUpper,
  formatDateWithHyphen,
  formatDateWithTime,
  formatter,
  tableNumbers,
  truncateText,
} from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { FilterOptions } from "../tables/filter-select";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { giftcardFilterOptions } from "./data";
import ApproveModal from "./modals/approve";
import DeclineModal from "./modals/decline";
import PartialApprovalModal from "./modals/partial";
import { AmountStatsCard, StatsDetailsCard } from "./stats-card";

const GiftcardTable = ({ data, isLoading, showStats, hideFilter = false, tradeType }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";

  const navigate = useNavigate();

  const [editedId, setEditedId] = useState();

  const [onSearch, setonSearch] = useState(false);

  const [showPartial, setShowPartial] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showApprove, setShowApprove] = useState(false);

  // Change Page
  //paginate
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
    } else if (status === "s.approved") {
      return "info";
    } else if (status === "multiple") {
      return "secondary";
    } else {
      return "danger";
    }
  }, []);

  //scroll off when sidebar shows
  // useEffect(() => {
  //   view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  // }, [view.add]);

  return (
    <React.Fragment>
      {/* {(type || showStats) && (
        <Row className="mb-5">
          <Col lg={5}>
            <AmountStatsCard data={data?.stat?.sell} />
          </Col>
          <Col lg={7}>
            <StatsDetailsCard data={data?.stat?.sell} />
          </Col>
        </Row>
      )} */}
      <Block>
        <Card>
          {!hideFilter && (
            <Nav tabs className="nav nav-tabs nav-tabs-card">
              {giftcardFilterOptions[0]?.options?.map((item, index) => (
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
                    {item.label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          )}
          <div className="card-inner border-bottom">
            <div className="card-title-group">
              <div className="card-title">
                <h5 className="title">{tradeType ? tradeType : "All"} Giftcard Transactions</h5>
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
                    <FilterOptions options={giftcardFilterOptions} showDate />
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
              {/* Search component */}
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
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Fullname</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Reference No</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Category</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                      </DataTableRow>
                      {!tradeType && (
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Type</span>
                        </DataTableRow>
                      )}

                      <DataTableRow>
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
                    {data?.transactions?.map((item, index) => {
                      return (
                        <DataTableItem key={item?._id} className="text-secondary">
                          <DataTableRow>
                            <span> {tableNumbers(currentPage, itemsPerPage) + index + 1}</span>
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
                          <DataTableRow>
                            <span>{item.reference}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span className="ccap"> {item?.giftCardId?.categoryId?.name}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>
                              {item?.status === "secondApproved"
                                ? formatter("NGN").format(item?.reviewAmount)
                                : formatter("NGN").format(item.payableAmount)}
                            </span>
                          </DataTableRow>
                          {!tradeType && (
                            <DataTableRow>
                              <span className="capitalized">{item.tradeType}</span>
                            </DataTableRow>
                          )}

                          <DataTableRow>
                            <span>{formatDateWithHyphen(item.createdAt)}</span>
                          </DataTableRow>

                          <DataTableRow>
                            <span className={`dot bg-${statusColor(item.status)} d-sm-none`}></span>
                            <Badge
                              className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                              color={statusColor(item.status)}
                            >
                              <span className="ccap">
                                {item.status === "partially_approved" ? "Partial" : item?.status}
                              </span>{" "}
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
                                      {item?.status === "multiple" ? (
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              navigate(`/related-giftcards/${item?._id}`);
                                              // onEditClick(item?._id);
                                            }}
                                          >
                                            <Icon name="eye"></Icon>
                                            <span>View List</span>
                                          </DropdownItem>
                                        </li>
                                      ) : (
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              navigate(`/giftcards-details/${item?._id}`);
                                              // onEditClick(item?._id);
                                            }}
                                          >
                                            <Icon name="eye"></Icon>
                                            <span>View</span>
                                          </DropdownItem>
                                        </li>
                                      )}
                                      {item?.status === "pending" && (
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
                                              <span>Second Approval</span>
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
                                                // onEditClick(item?._id);
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
                  <span className="text-silent">No Transaction record found</span>
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

export default GiftcardTable;
