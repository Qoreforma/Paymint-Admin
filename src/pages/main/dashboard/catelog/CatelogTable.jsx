import React, { useCallback, useState } from "react";
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import {
  Button,
  Col,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  PreviewAltCard,
  RSelect,
  Row,
} from "../../../../components/Component";
import LoadingSpinner from "../../../components/spinner";
import { filterCatelogStatus } from "./catelogData";
import SortToolTip from "../tables/SortTooltip";
import { useSearchParams } from "react-router-dom";
import Search from "../tables/Search";

const CatelogTable = ({
  catelogTitle,
  data,
  setData,
  headers,
  dataKeys,
  edit,
  defaultData,
  updateStatus,
  deleteItem,
  loading,
  itemsPerPage,
  currentPage,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [onSearch, setonSearch] = useState(false);

  const [filters, setfilters] = useState({});
  // console.log(defaultData);

  // Change Page
  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
    return searchParams;
  };

  // function to filter data
  const filterData = useCallback(() => {
    if (Object.keys(filters).length === 0) {
      return;
    }
    let newData = defaultData.filter((item) => {
      return Object.keys(filters).every((key) => {
        return filters[key] === item[key];
      });
    });
    setData([...newData]);
  }, [filters, defaultData, setData]);

  // COLOR
  const statusColor = useCallback((status) => {
    if (status === "inactive") {
      return "warning";
    } else {
      return "success";
    }
  }, []);

  return (
    <DataTable className="is-compact">
      <div className="card-inner">
        <div className="card-title-group">
          <div className="card-title">
            <h5 className="title">All {catelogTitle}</h5>
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
                <UncontrolledDropdown>
                  <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                    <div className="dot dot-primary"></div>
                    <Icon name="filter-alt"></Icon>
                  </DropdownToggle>
                  <DropdownMenu end className="filter-wg dropdown-menu-xl" style={{ overflow: "visible" }}>
                    <div className="dropdown-head">
                      <span className="sub-title dropdown-title">Advanced Filter</span>
                    </div>
                    <div className="dropdown-body dropdown-body-rg">
                      <Row className="gx-6 gy-4">
                        <Col size="12">
                          <div className="form-group">
                            <label className="overline-title overline-title-alt">Status</label>
                            <RSelect
                              options={filterCatelogStatus}
                              placeholder="Any Status"
                              value={filters.status && { label: filters.status, value: filters.status }}
                              isSearchable={false}
                              onChange={(e) => setfilters({ ...filters, status: e.value })}
                            />
                          </div>
                        </Col>

                        <Col size="12">
                          <div className="form-group">
                            <Button type="button" onClick={filterData} className="btn btn-secondary">
                              Filter
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    <div className="dropdown-foot between">
                      <a
                        href="#reset"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setData(defaultData);
                          setfilters({});
                        }}
                        className="clickable"
                      >
                        Reset Filter
                      </a>
                      <a
                        href="#save"
                        onClick={(ev) => {
                          ev.preventDefault();
                        }}
                      >
                        Save Filter
                      </a>
                    </div>
                  </DropdownMenu>
                </UncontrolledDropdown>
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
          {/* SEARCH COMPONENT */}
          <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="name" />
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : defaultData?.data?.length > 0 ? (
        <>
          <DataTableBody bodyclass="nk-tb-tnx">
            <DataTableHead className="nk-tb-item">
              <DataTableRow className="nk-tb-col-check">
                {/* <div className="custom-control custom-control-sm custom-checkbox notext">
              <input type="checkbox" className="custom-control-input" id="pid-all" onChange={(e) => selectorCheck(e)} />
              <label className="custom-control-label" htmlFor="pid-all"></label>
            </div> */}
                <span>S/N</span>
              </DataTableRow>
              {headers.map((header, idx) => (
                <DataTableRow key={idx}>
                  <span className="tb-tnx-head bg-white text-secondary">{header}</span>
                </DataTableRow>
              ))}

              <DataTableRow className="nk-tb-col-tools">
                <ul className="nk-tb-actions gx-1 my-n1">
                  <li>
                    <UncontrolledDropdown>
                      <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle disabled btn-icon me-n1">
                        <Icon name="more-h"></Icon>
                      </DropdownToggle>
                    </UncontrolledDropdown>
                  </li>
                </ul>
              </DataTableRow>
            </DataTableHead>

            {defaultData?.data?.map((item, idx) => (
              <DataTableItem key={idx}>
                <DataTableRow className="nk-tb-col-check">
                  <span>{idx + 1}</span>
                </DataTableRow>
                {dataKeys.map((key, idx) => {
                  if (key === "status")
                    return (
                      <DataTableRow key={idx}>
                        <span className={`dot bg-${statusColor(item.status)} d-sm-none`}></span>
                        <Badge
                          className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                          color={statusColor(item.status)}
                        >
                          {item.status}
                        </Badge>
                      </DataTableRow>
                    );

                  return (
                    <DataTableRow key={idx}>
                      <span>{item[key]}</span>
                    </DataTableRow>
                  );
                })}
                <DataTableRow className="nk-tb-col-tools">
                  {catelogTitle !== "product types" && (
                    <ul className="nk-tb-actions gx-1">
                      <li>
                        <UncontrolledDropdown>
                          <DropdownToggle tag="a" className="btn btn-icon dropdown-toggle btn-trigger">
                            <Icon name="more-h"></Icon>
                          </DropdownToggle>
                          <DropdownMenu end>
                            <ul className="link-list-opt no-bdr">
                              <li>
                                <DropdownItem
                                  tag="a"
                                  href="#dropdown"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    edit(item._id);
                                  }}
                                >
                                  <Icon name="edit"></Icon>
                                  <span>Edit</span>
                                </DropdownItem>
                              </li>
                              {item.status !== "Delivered" && catelogTitle !== "brands" && (
                                <li>
                                  <DropdownItem
                                    tag="a"
                                    href="#dropdown"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      if (updateStatus) {
                                        updateStatus(item._id);
                                      }
                                      // markAsDelivered(item.id, item.status);
                                    }}
                                  >
                                    <Icon name={item.status === "active" ? "na" : "check"}></Icon>
                                    <span>Make {item.status === "active" ? "inactive" : "active"}</span>
                                  </DropdownItem>
                                </li>
                              )}
                              {catelogTitle !== "brands" && (
                                <li>
                                  <DropdownItem
                                    tag="a"
                                    href="#dropdown"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      if (deleteItem) {
                                        deleteItem(item._id);
                                      }
                                      // deleteOrder(item.id);
                                    }}
                                  >
                                    <Icon name="trash"></Icon>
                                    <span>Delete</span>
                                  </DropdownItem>
                                </li>
                              )}
                            </ul>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </li>
                    </ul>
                  )}
                </DataTableRow>
              </DataTableItem>
            ))}
          </DataTableBody>
          <PreviewAltCard>
            {defaultData?.totalDocuments > 0 && (
              <PaginationComponent
                itemPerPage={itemsPerPage}
                totalItems={defaultData?.totalDocuments}
                paginate={paginate}
                currentPage={Number(currentPage)}
              />
            )}
          </PreviewAltCard>
        </>
      ) : (
        <div className="text-center" style={{ paddingBlock: "1rem" }}>
          <span className="text-silent">No {catelogTitle} found</span>
        </div>
      )}
    </DataTable>
  );
};

export default CatelogTable;
