import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, UncontrolledDropdown } from "reactstrap";
import { useGetAllOrders, useUpdateOrders } from "../../../../api/orders";
import {
  Block,
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
  TooltipComponent,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatter, truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import SortToolTip from "../tables/SortTooltip";
import { filterProductType, filterStatus } from "./OrderData";
const SingleOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;

  const { isLoading, data: allOrders } = useGetAllOrders(currentPage, itemsPerPage);
  const { mutate } = useUpdateOrders();
  // console.log(allOrders);

  //orderId is missing, orderdate, location, status,
  const [onSearch, setonSearch] = useState(false);
  const [filters, setfilters] = useState({});
  const [formData, setFormData] = useState({
    id: null,
    orderId: "",
    date: new Date(),
    status: "Delivered",
    customer: "",
    purchased: "",
    location: "",
    total: "",
    check: false,
  });
  const [view, setView] = useState({
    add: false,
    details: false,
  });
  const [onSearchText, setSearchText] = useState("");

  // toggle function to view order details
  const toggle = (type) => {
    setView({
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
    });
  };

  // resets forms
  const resetForm = () => {
    setFormData({
      id: null,
      orderId: "",
      date: new Date(),
      status: "Delivered",
      customer: "",
      purchased: "",
      total: "",
      check: false,
    });
  };

  // function to load detail data
  const loadDetail = (id) => {
    let index = allOrders.data.findIndex((item) => item._id === id);
    setFormData(allOrders.data[index]);
  };

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to filter data
  const filterData = useCallback(() => {
    return;
  }, []);

  // function to close the form modal
  const onFormCancel = () => {
    setView({ add: false, details: false });
    resetForm();
  };

  // function to change to approve property for an item
  const markAsDelivered = (id) => {
    mutate({ orderId: id, state: "closed", status: "delivered" });
  };

  // function to change to approve property for an item
  const markAsShipped = (id) => {
    mutate({ orderId: id, state: "open", status: "shipped" });
  };

  // function to change to approve property for an item
  const markAsTransit = (id) => {
    mutate({ orderId: id, state: "open", status: "transit" });
  };

  // function to change to approve property for an item
  const markAsCancelled = (id) => {
    mutate({ orderId: id, state: "open", status: "cancelled" });
  };

  // function to change to approve property for an item
  const markAsRefunded = (id) => {
    mutate({ orderId: id, state: "closed", status: "refunded" });
  };
  // Get current list, pagination

  // Change Page
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  // Status Colors
  const statusColor = useCallback((status) => {
    if (status === "pending" || status === "refunded" || status === "in Transit") {
      return "warning";
    } else if (status === "confirmed" || status === "shipped" || status === "transit") {
      return "info";
    } else if (status === "delivered") {
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
          <BlockHeadContent>
            <BlockTitle page>Orders</BlockTitle>
          </BlockHeadContent>
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
                                // setData(orderData);
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
                      placeholder="Search by Order Id"
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
            ) : allOrders?.data?.length > 0 ? (
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
                    <DataTableRow>
                      <span className="sub-text">Order Date</span>
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

                  {allOrders?.data?.map((item, idx) => (
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
                        <span
                          className={`dot bg-${item.status === "Delivered" ? "success" : "warning"} d-sm-none`}
                        ></span>
                        <Badge
                          className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                          color={statusColor(item.status)}
                        >
                          {item.status}
                        </Badge>
                      </DataTableRow>

                      <DataTableRow size="md">
                        <span className="tb-sub text-primary">{truncateText(item.product.productName, 25)}</span>
                      </DataTableRow>

                      <DataTableRow size="md">
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("en-us", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </span>
                      </DataTableRow>
                      <DataTableRow className="nk-tb-col-tools">
                        <ul className="nk-tb-actions gx-1">
                          {item.status !== "delivered" && (
                            <li
                              className="nk-tb-action-hidden"
                              onClick={() => {
                                markAsDelivered(item._id);
                              }}
                            >
                              <TooltipComponent
                                tag="a"
                                containerClassName="btn btn-trigger btn-icon"
                                id={"delivery" + item.id}
                                icon="truck"
                                direction="top"
                                text="Mark as Delivered"
                              />
                            </li>
                          )}
                          <li
                            className="nk-tb-action-hidden"
                            onClick={() => {
                              loadDetail(item._id);
                              toggle("details");
                            }}
                          >
                            <TooltipComponent
                              tag="a"
                              containerClassName="btn btn-trigger btn-icon"
                              id={"view" + item._id}
                              icon="eye"
                              direction="top"
                              text="Quick View"
                            />
                          </li>
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
                                          }?type=single-order`
                                        );
                                      }}
                                    >
                                      <Icon name="eye"></Icon>
                                      <span>Order Details</span>
                                    </DropdownItem>
                                  </li>
                                  {item.status !== "delivered" &&
                                    item.status !== "pending" &&
                                    item.status !== "cancelled" &&
                                    item.status !== "refunded" &&
                                    item.status !== "transit" &&
                                    item.status !== "confirmed" && (
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdown"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            markAsDelivered(item._id);
                                          }}
                                        >
                                          <Icon name="done"></Icon>
                                          <span>Mark as Delivered</span>
                                        </DropdownItem>
                                      </li>
                                    )}
                                  {item.status !== "delivered" &&
                                    item.status !== "refunded" &&
                                    item.status !== "transit" &&
                                    item.status !== "pending" && (
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdown"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            markAsTransit(item._id);
                                          }}
                                        >
                                          <Icon name="swap-v"></Icon>
                                          <span>Mark as In Transit</span>
                                        </DropdownItem>
                                      </li>
                                    )}
                                  {item.status !== "delivered" &&
                                    item.status !== "refunded" &&
                                    item.status !== "shipped" &&
                                    item.status !== "pending" && (
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdown"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            markAsShipped(item._id);
                                          }}
                                        >
                                          <Icon name="truck"></Icon>
                                          <span>Mark as Shipped</span>
                                        </DropdownItem>
                                      </li>
                                    )}
                                  {item.status !== "delivered" &&
                                    item.status !== "refunded" &&
                                    item.status !== "cancelled" && (
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdown"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            markAsCancelled(item._id);
                                          }}
                                        >
                                          <Icon name="cross"></Icon>
                                          <span>Mark as Cancelled</span>
                                        </DropdownItem>
                                      </li>
                                    )}
                                  {item.status !== "delivered" &&
                                    item.status !== "refunded" &&
                                    item.status === "cancelled" &&
                                    item.status !== "pending" && (
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#dropdown"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            markAsRefunded(item._id);
                                          }}
                                        >
                                          <Icon name="invest"></Icon>
                                          <span>Mark as Refunded</span>
                                        </DropdownItem>
                                      </li>
                                    )}
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
                  {allOrders?.totalDocuments > 0 && (
                    <PaginationComponent
                      itemPerPage={itemsPerPage}
                      totalItems={allOrders?.totalDocuments}
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

        {/* VIEW DETAILS MODAL */}
        <Modal isOpen={view.details} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a href="#cancel" className="close">
              {" "}
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  onFormCancel();
                }}
              ></Icon>
            </a>
            <div className="nk-tnx-details mt-sm-3">
              <div className="nk-modal-head mb-3">
                <h5 className="title">Order Details</h5>
              </div>
              <Row className="gy-3">
                <Col lg={6}>
                  <span className="sub-text">Order Id</span>
                  <span className="caption-text">{formData._id}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Status</span>
                  <span
                    className={`dot bg-${formData.status === "delivered" ? "success" : "warning"} d-sm-none`}
                  ></span>
                  <Badge
                    className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                    color={statusColor(formData.status)}
                  >
                    {formData.status}
                  </Badge>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Customer</span>
                  <span className="caption-text">{formData.buyer?.buyerName}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Purchased Product</span>
                  <span className="caption-text">{formData.product?.productName}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Total Price</span>
                  <span className="caption-text">
                    {formatter(formData.product?.currency).format(formData.product?.purchaseAmount)}
                  </span>
                </Col>
              </Row>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default SingleOrders;
