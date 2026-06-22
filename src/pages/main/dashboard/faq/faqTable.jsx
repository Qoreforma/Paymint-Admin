import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Badge, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
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
import SortToolTip from "../tables/SortTooltip";
import { faqStatusType } from "./faqData";
import { formatDateWithHyphen, formatDateWithTime, truncateText } from "../../../../utils/Utils";
import { useGetFaqCategories } from "../../../../api/faqs";

const FaqTable = ({
  faqTitle,
  data,
  headers,
  dataKeys,
  isLoading,
  defaultData,
  action: Action,
  statusField: StatusField,
  hidePagination,
  hideFilters,
}) => {
  const [onSearch, setonSearch] = useState(false);
  const [onSearchText, setSearchText] = useState("");

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;
  const currentPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [filters, setfilters] = useState({});

  const { isLoading: fetchingCategories, data: faqCategories } = useGetFaqCategories();
  const catFilterOption = faqCategories
    ? faqCategories?.data.map((cat) => ({ label: cat.name, value: cat._id, id: cat._id }))
    : [];

  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };
  // function to filter catelog
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to filter data
  const filterData = useCallback(() => {
    const newParams = new URLSearchParams(location.search);
    Object.entries(filters).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    setSearchParams(newParams);
  }, [filters]);

  // function to clear filter
  const clearFilter = () => {
    setSearchParams({});
    setfilters(null);
  };

  // Debounce logic for searchbox
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams((searchParams) => {
        searchParams.set("search", onSearchText);
        return searchParams;
      });
    }, 1000); // 500ms debounce

    return () => {
      clearTimeout(handler); // cancel timeout if input changes before 500ms
    };
  }, [onSearchText]);

  return (
    <DataTable className="is-compact">
      <div className="card-inner">
        <div className="card-title-group">
          <div className="card-title">
            <h5 className="title">All {faqTitle}</h5>
          </div>
          {!hideFilters && (
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
                {(faqTitle === "Categories" || faqTitle === "faqs") && (
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
                            {faqTitle === "Categories" && (
                              <Col size="12">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Status</label>
                                  <RSelect
                                    options={faqStatusType}
                                    placeholder="Any Status"
                                    value={filters.status && { label: filters.status, value: filters.status }}
                                    isSearchable={false}
                                    onChange={(e) => setfilters({ ...filters, status: e.value.toLowerCase() })}
                                  />
                                </div>
                              </Col>
                            )}
                            {faqTitle === "faqs" && !fetchingCategories && (
                              <Col size="12">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Category</label>
                                  <RSelect
                                    options={catFilterOption}
                                    placeholder="Any Category"
                                    value={
                                      filters.category && {
                                        label: catFilterOption.find((cat) => cat.value === filters.category).label,
                                        value: filters.category,
                                      }
                                    }
                                    isSearchable={true}
                                    onChange={(e) => setfilters({ ...filters, category: e.value })}
                                  />
                                </div>
                              </Col>
                            )}

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
                              clearFilter();
                              setfilters({});
                            }}
                            className="clickable"
                          >
                            Reset Filter
                          </a>
                        </div>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </li>
                )}
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
          )}
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
                placeholder={`Search by name`}
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
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <DataTableBody bodyclass="nk-tb-tnx">
            <DataTableHead className="nk-tb-item">
              <DataTableRow className="nk-tb-col-check">
                <span>S/N</span>
              </DataTableRow>
              {headers?.map((header, idx) => (
                <DataTableRow
                  size={
                    header === "description" || header === "date" || header === "Answer" || header === "Date"
                      ? "md"
                      : ""
                  }
                  key={idx}
                >
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

            {data?.length > 0
              ? data.map((item, idx) => (
                  <DataTableItem key={idx}>
                    <DataTableRow className="nk-tb-col-check">
                      <span>{idx + 1}</span>
                    </DataTableRow>
                    {dataKeys?.map((key, idx) => {
                      if (key === "isActive")
                        return (
                          <DataTableRow key={idx}>
                            <StatusField id={item?._id} status={item?.isActive} />
                          </DataTableRow>
                        );

                      if (key === "createdAt")
                        return (
                          <DataTableRow size="md" key={idx}>
                            <span>{formatDateWithHyphen(item.createdAt)}</span>
                          </DataTableRow>
                        );

                      if (key === "answer")
                        return (
                          <DataTableRow size="md" key={idx}>
                            <span>{truncateText(item.answer, 50)}</span>
                          </DataTableRow>
                        );

                      if (key === "body")
                        return (
                          <DataTableRow size="md" key={idx}>
                            <span>{truncateText(item.body, 50)}</span>
                          </DataTableRow>
                        );

                      return (
                        <DataTableRow size={key === "description" ? "md" : ""} key={idx}>
                          <span>{item[key]}</span>
                        </DataTableRow>
                      );
                    })}
                    {Action && (
                      <DataTableRow className="nk-tb-col-tools">
                        <Action id={faqTitle === "faqs" ? item["_id"] : item["_id"]} status={item.isActive} />
                      </DataTableRow>
                    )}
                  </DataTableItem>
                ))
              : null}
          </DataTableBody>
          {!hidePagination && (
            <PreviewAltCard>
              {data?.length > 0 ? (
                <PaginationComponent
                  itemPerPage={itemsPerPage}
                  totalItems={data?.length}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              ) : (
                <div className="text-center">
                  <span className="text-silent">No {faqTitle} found</span>
                </div>
              )}
            </PreviewAltCard>
          )}
        </>
      )}
    </DataTable>
  );
};

export default FaqTable;
