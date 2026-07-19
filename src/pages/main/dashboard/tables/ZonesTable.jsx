import React, { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
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
import { filterProductStatus, filterProductType } from "../order/OrderData";
import SortToolTip from "./SortTooltip";

const ZonesTable = ({
  title = "All Zones",
  tableData,
  loading,
  itemsPerPage,
  currentPage,
  actions: Actions,
  isLocal,
}) => {
  const [filters, setfilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();

  const [onSearchText, setSearchText] = useState("");
  const [onSearch, setonSearch] = useState(false);

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to filter data
  const filterData = useCallback(() => {
    return;

    // setData([...newData]);
  }, []);

  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
    return searchParams;
  };

  return (
    <React.Fragment>
      <DataTable className="card-stretch is-compact">
        <div className="card-inner">
          <div className="card-title-group">
            <div className="card-title">
              <h5 className="title">{title}</h5>
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
                          <Col size="6">
                            <div className="form-group">
                              <label className="overline-title overline-title-alt">Type</label>
                              <RSelect
                                options={filterProductType}
                                value={filters.type && { label: filters.type, value: filters.type }}
                                placeholder="Product Type"
                                onChange={(e) => setfilters({ ...filters, type: e.value })}
                              />
                            </div>
                          </Col>
                          <Col size="6">
                            <div className="form-group">
                              <label className="overline-title overline-title-alt">Status</label>
                              <RSelect
                                options={filterProductStatus}
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
                            // setData(tableData);
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
            <div className={`card-search search-wrap ${onSearch && "active"}`}>
              <div className="search-content">
                <Button
                  onClick={() => {
                    setSearchText("");
                    setonSearch(false);
                  }}
                  className="search-back btn-icon toggle-search"
                >
                  <Icon name="arrow-left"></Icon>
                </Button>
                <input
                  type="text"
                  className="border-transparent form-focus-none form-control"
                  placeholder="Search by Product name"
                  value={onSearchText}
                  onChange={(e) => onFilterChange(e)}
                />
                <Button className="search-submit btn-icon">
                  <Icon name="search"></Icon>
                </Button>
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : tableData?.data?.length > 0 ? (
          <>
            <DataTableBody bodyclass="nk-tb-tnx">
              <DataTableHead className="nk-tb-item">
                <DataTableRow size="sm" className="nk-tb-col-check">
                  <p>No.</p>
                </DataTableRow>

                {/* TABLE HEADING */}
                <DataTableRow>
                  <span className="sub-text">Name</span>
                </DataTableRow>
                {/* <DataTableRow>
                  <span className="sub-text">Weight</span>
                </DataTableRow> */}
                <DataTableRow size="md">
                  <span className="sub-text">{isLocal ? "States" : "Countries"}</span>
                </DataTableRow>
                {/* <DataTableRow size="md">
                  <span className="sub-text">Amount</span>
                </DataTableRow> */}

                <DataTableRow className="nk-tb-col-tools">
                  <ul className="nk-tb-actions gx-1 my-n1">
                    <li style={{ pointerEvents: "none" }}>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
                          <Icon name="more-h"></Icon>
                        </DropdownToggle>
                      </UncontrolledDropdown>
                    </li>
                  </ul>
                </DataTableRow>
              </DataTableHead>

              {tableData?.data?.map((item, idx) => (
                <DataTableItem key={idx}>
                  <DataTableRow size="sm" className="nk-tb-col-check">
                    <p>{idx + 1}.</p>
                  </DataTableRow>

                  <DataTableRow>
                    <span className="tb-sub text-capitalize">{item?.name}</span>
                  </DataTableRow>
                  {/* <DataTableRow size="md">
                    <span className="tb-sub text-capitalize">{item?.weight}</span>
                  </DataTableRow> */}
                  <DataTableRow size="md">
                    {isLocal ? (
                      <span className="tb-sub text-capitalize">{item?.states?.toString().replaceAll(",", ", ")}</span>
                    ) : (
                      <span className="tb-sub text-capitalize">
                        {item?.countries?.toString().replaceAll(",", ", ")}
                      </span>
                    )}
                  </DataTableRow>
                  {/* <DataTableRow>
                    {formatter("NGN").format(item?.amount)}

                  </DataTableRow> */}

                  <DataTableRow className="nk-tb-col-tools">
                    <Actions id={item._id} name={item.name} />
                  </DataTableRow>
                </DataTableItem>
              ))}
            </DataTableBody>
            <PreviewAltCard>
              {tableData?.totalDocuments > 0 && (
                <PaginationComponent
                  itemPerPage={itemsPerPage}
                  totalItems={tableData?.totalDocuments}
                  paginate={paginate}
                  currentPage={Number(currentPage)}
                />
              )}
            </PreviewAltCard>
          </>
        ) : (
          <div className="text-center" style={{ paddingBlock: "1rem" }}>
            <span className="text-silent">No zone records.</span>
          </div>
        )}
      </DataTable>
    </React.Fragment>
  );
};

export default ZonesTable;
