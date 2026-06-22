import React, { useCallback, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useRecoilValue } from "recoil";
import { useDeleteProduct, useUpdateProductStatus } from "../../../../api/product/products";
import { nairaState } from "../../../../atoms/nariaState";
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
import NoImage from "../../../../images/no-image-icon.png";
import { formatter, objectToQueryString, truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { filterProductStatus, filterProductType } from "../order/OrderData";
import Search from "./Search";
import SortToolTip from "./SortTooltip";

const ProductTable = ({ title = "All Products", tableData, loading, itemsPerPage, currentPage }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [filters, setfilters] = useState({});
  const [productId, setProductId] = useState();
  const [searchParams, setSearchParams] = useSearchParams();

  const nairaValue = useRecoilValue(nairaState);
  // console.log(nairaValue);

  const { mutate } = useUpdateProductStatus(productId);
  const { mutate: deleteProduct } = useDeleteProduct(productId);

  const [onSearch, setonSearch] = useState(false);

  const deleteNew = (id) => {
    deleteProduct({ productId: id });
  };

  // function to filter data
  const filterData = () => {
    if (Object.keys(filters).length === 0) {
      return;
    }

    const filterQuries = objectToQueryString(filters);
    navigate(`${pathname}?${filterQuries}`, { replace: true });
  };

  const resetFilter = () => {
    let params = new URLSearchParams(searchParams);
    params.delete("type");
    params.delete("status");

    navigate(`${pathname}?${params}`, { replace: true });
    setfilters({});
  };

  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  const statusColor = useCallback((status) => {
    if (status === "approved") {
      return "success";
    } else {
      return "warning";
    }
  }, []);

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
                            resetFilter();
                          }}
                          className="clickable"
                        >
                          Reset Filter
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
            <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="product name" />
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
                <DataTableRow>
                  <span className="sub-text">Seller</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span className="sub-text">Category</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span className="sub-text">Brand</span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <span className="sub-text">Product type</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text">Price</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text">Status</span>
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

              {tableData?.data?.map((item, idx) => (
                <DataTableItem key={idx}>
                  <DataTableRow size="sm" className="nk-tb-col-check">
                    <p>{idx + 1}.</p>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="tb-product">
                      <img
                        src={
                          item?.productImages?.length > 0 && item?.productImages[0] !== undefined
                            ? item?.productImages[0]
                            : NoImage
                        }
                        alt="product"
                        width={40}
                        className="thumb d-none d-lg-block"
                      />
                      <span
                        className="text-capitalize name"
                        onClick={() => navigate(`/products/product-details/${item?._id}`)}
                      >
                        {item?.name ? truncateText(item?.name, 25) : ""}
                      </span>
                    </span>
                  </DataTableRow>
                  <DataTableRow>
                    <span className="tb-sub text-capitalize">{item?.storeName}</span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span className="tb-sub text-capitalize">{item?.category}</span>
                  </DataTableRow>
                  <DataTableRow size="md">
                    <span className="tb-sub text-capitalize">{item?.brand}</span>
                  </DataTableRow>
                  <DataTableRow size="sm">
                    <span className="tb-sub text-capitalize">{item?.type}</span>
                  </DataTableRow>
                  <DataTableRow>
                    {item?.currency === "USD" ? (
                      <span className="tb-sub text-capitalize">
                        {formatter("NGN").format(item?.price * nairaValue)}
                      </span>
                    ) : (
                      <span className="tb-sub text-capitalize">{formatter(item?.currency).format(item?.price)}</span>
                    )}
                  </DataTableRow>
                  <DataTableRow>
                    <span className={`dot bg-${statusColor(item?.adminAction)} d-sm-none`}></span>
                    <Badge
                      className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                      color={statusColor(item?.adminAction)}
                    >
                      {item?.adminAction}
                    </Badge>
                  </DataTableRow>

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
                                  href="#productdetail"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    navigate(`/products/product-details/${item._id}`);
                                    // loadDetail(item.id);
                                  }}
                                >
                                  <Icon name="eye"></Icon>
                                  <span>View Products</span>
                                </DropdownItem>
                              </li>
                              <li>
                                <DropdownItem
                                  tag="a"
                                  href="#dropdown"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    navigate(`/products/product-reviews/${item?._id}`);

                                    // deleteOrder(item.id);
                                  }}
                                >
                                  <Icon name="star"></Icon>
                                  <span>View Ratings</span>
                                </DropdownItem>
                              </li>
                              {item?.adminAction !== "approved" ? (
                                <li>
                                  <DropdownItem
                                    tag="a"
                                    href="#dropdown"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      setProductId(item?._id);
                                      mutate({ productId: item?._id, action: "approved" });
                                    }}
                                  >
                                    <Icon name="thumbs-up"></Icon>
                                    <span>Approve</span>
                                  </DropdownItem>
                                </li>
                              ) : (
                                <li>
                                  <DropdownItem
                                    tag="a"
                                    href="#dropdown"
                                    className="text-danger"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      setProductId(item?._id);
                                      mutate({ productId: item?._id, action: "unapproved" });
                                    }}
                                  >
                                    <Icon name="na"></Icon>
                                    <span className="text-capitalize">Unapprove</span>
                                  </DropdownItem>
                                </li>
                              )}

                              <li>
                                <DropdownItem
                                  tag="a"
                                  href="#dropdown"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    setProductId(item?._id);
                                    deleteNew(item._id);
                                  }}
                                >
                                  <Icon name="trash"></Icon>
                                  <span>Delete</span>
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
            <span className="text-silent">No products found</span>
          </div>
        )}
      </DataTable>
    </React.Fragment>
  );
};

export default ProductTable;
