import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useGetAllGeneralOrder } from "../../../../api/orders";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
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
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import SortToolTip from "../tables/SortTooltip";
import { filterProductType, filterStatus } from "./OrderData";
const Orders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;

  const { isLoading, data: allGeneralOrders } = useGetAllGeneralOrder(currentPage, itemsPerPage);

  const [onSearch, setonSearch] = useState(false);
  const [filters, setfilters] = useState({});

  const [onSearchText, setSearchText] = useState("");

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to filter data
  const filterData = useCallback(() => {
    return;
  }, []);

  // Change Page
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  // Status Colors
  const statusColor = useCallback((status) => {
    if (status === "pending" || status === "in Process" || status === "in Transit" || status === "unpaid") {
      return "warning";
    } else if (status === "confirmed" || status === "shipped") {
      return "info";
    } else if (status === "delivered" || status === "paid") {
      return "success";
    } else {
      return "danger";
    }
  }, []);

  return (
    <React.Fragment>
      <Head title="Orders"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Buyer Orders</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Orders</h5>
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
                            {/* <div className="dropdown">
                              <Button size="sm" className="btn-icon">
                                <Icon name="more-h"></Icon>
                              </Button>
                            </div> */}
                          </div>
                          <div className="dropdown-body dropdown-body-rg">
                            <Row className="gx-6 gy-4">
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Type</label>
                                  <RSelect
                                    options={filterProductType}
                                    placeholder="Product Type"
                                    // onChange={(e) => setfilters({ ...filters, status: e.value })}
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Status</label>
                                  <RSelect
                                    options={filterStatus}
                                    placeholder="Any Status"
                                    value={filters.status && { label: filters.status, value: filters.status }}
                                    isSearchable={false}
                                    onChange={(e) => setfilters({ ...filters, status: e.label })}
                                  />
                                </div>
                              </Col>

                              <Col size="12">
                                <div className="form-group">
                                  <Button type="button" onClick={filterData} className="btn btn-secondary ">
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
                      placeholder="Search by Buyer name"
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
            ) : allGeneralOrders?.totalDocuments > 0 ? (
              <>
                <DataTableBody bodyclass="nk-tb-tnx">
                  <DataTableHead className="nk-tb-item">
                    <DataTableRow className="nk-tb-col-check">
                      <span>S/N</span>
                    </DataTableRow>

                    {/* TABLE HEADING */}
                    <DataTableRow>
                      <span className="sub-text">Order</span>
                    </DataTableRow>
                    <DataTableRow size="md">
                      <span className="sub-text">Buyer name</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Phone</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="sub-text">Location</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Status</span>
                    </DataTableRow>
                    <DataTableRow size="md">
                      <span className="sub-text">Items</span>
                    </DataTableRow>

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

                  {allGeneralOrders?.data?.map((item, idx) => (
                    <DataTableItem key={item._id}>
                      <DataTableRow className="nk-tb-col-check">
                        <span>{idx + 1}</span>
                      </DataTableRow>
                      <DataTableRow>
                        <a href="#id" onClick={(ev) => ev.preventDefault()}>
                          #{idx + 1}
                        </a>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-sub">{item?.buyer?.buyerName}</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-sub">{item?.buyer?.hotline}</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-sub">
                          {`${item.buyer?.shippingAddress?.state}/ ${item.buyer?.shippingAddress?.country}`}
                        </span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className={`dot bg-${item.status === "paid" ? "success" : "warning"} d-sm-none`}></span>
                        <Badge
                          className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                          color={statusColor(item.status)}
                        >
                          {item.status}
                        </Badge>
                      </DataTableRow>

                      {/* {item.status === "unpaid" ? (
                        <DataTableRow size="md">
                          {item.products && item.products.length === 1 ? (
                            <span className="tb-sub text-primary">
                              {truncateText(item?.products[0]?.productName, 25)}
                            </span>
                          ) : (
                            <span className="tb-sub text-primary">{item?.products?.length} items</span>
                          )}
                        </DataTableRow>
                      ) : ( */}
                      <DataTableRow size="md">
                        {item?.orders && item.orders?.length === 1 ? (
                          <span className="tb-sub text-primary">
                            {truncateText(item?.orders[0]?.product.productName, 25)}
                          </span>
                        ) : (
                          <span className="tb-sub text-primary">{item?.orders?.length} items</span>
                        )}
                      </DataTableRow>
                      {/* )} */}

                      <DataTableRow className="nk-tb-col-tools">
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
                                      href="#orderdetails"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                        navigate(
                                          `${import.meta.env.PUBLIC_URL}/orders/order-details/${
                                            item._id
                                          }?type=order-summary`
                                        );
                                      }}
                                    >
                                      <Icon name="eye"></Icon>
                                      <span>Order Details</span>
                                    </DropdownItem>
                                  </li>
                                </ul>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </li>
                        </ul>
                      </DataTableRow>
                    </DataTableItem>
                  ))}
                </DataTableBody>

                <PreviewAltCard>
                  {allGeneralOrders?.totalDocuments > 0 && (
                    <PaginationComponent
                      itemPerPage={itemsPerPage}
                      totalItems={allGeneralOrders?.totalDocuments}
                      paginate={paginate}
                      currentPage={Number(currentPage)}
                    />
                  )}
                </PreviewAltCard>
              </>
            ) : (
              <div className="text-center" style={{ paddingBlock: "1rem" }}>
                <span className="text-silent">No orders found</span>
              </div>
            )}
          </DataTable>
        </Block>

        {/* MODAL DETAILS */}
      </Content>
    </React.Fragment>
  );
};

export default Orders;
