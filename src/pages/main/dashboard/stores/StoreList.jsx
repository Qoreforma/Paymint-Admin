import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useGetAllStores } from "../../../../api/stores/store";
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
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatter } from "../../../../utils/Utils";

import { useRecoilValue } from "recoil";
import { nairaState } from "../../../../atoms/nariaState";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { filterStoreStatus } from "./StoreData";

const StoreListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const { data: stores, isLoading } = useGetAllStores(currentPage, itemsPerPage, search);

  const nairaValue = useRecoilValue(nairaState);

  const [filters, setfilters] = useState({});
  const [onSearch, setonSearch] = useState(false);

  // function to filter data
  const filterData = useCallback(() => {
    return;
  }, []);

  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  // COLOR
  const statusColor = useCallback(
    (status) => {
      if (stores) {
        if (status === "unblock" || status === "approved") {
          return "success";
        } else if (status === "pending") {
          return "warning";
        } else {
          return "danger";
        }
      }
    },
    [stores]
  );

  return (
    <React.Fragment>
      <Head title="Stores"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockHeadContent>
            <BlockTitle>Stores/Businesses</BlockTitle>
          </BlockHeadContent>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Stores</h5>
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
                                    options={filterStoreStatus}
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
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="store name" />
              </div>
            </div>
            {isLoading ? (
              <LoadingSpinner />
            ) : stores?.totalDocuments > 0 ? (
              <>
                <DataTableBody bodyclass="nk-tb-tnx">
                  <DataTableHead className="nk-tb-item">
                    <DataTableRow className="nk-tb-col-check">
                      <span>S/N</span>
                    </DataTableRow>

                    {/* TABLE HEADING */}
                    <DataTableRow>
                      <span className="sub-text">Store name</span>
                    </DataTableRow>
                    <DataTableRow size="md">
                      <span className="sub-text">Username</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Total Products</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Location</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Balance(NGN)</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Balance(USD)</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Status</span>
                    </DataTableRow>
                    <DataTableRow className="nk-tb-col-tools">
                      <ul className="nk-tb-actions gx-1 my-n1">
                        <li>
                          <UncontrolledDropdown>
                            <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
                              <Icon name="more-h"></Icon>
                            </DropdownToggle>
                          </UncontrolledDropdown>
                        </li>
                      </ul>
                    </DataTableRow>
                  </DataTableHead>

                  {stores?.data?.map((item, idx) => (
                    <DataTableItem key={item._id}>
                      <DataTableRow className="nk-tb-col-check">
                        <span>{idx + 1}</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-product">
                          <span
                            className="name"
                            onClick={() => navigate(`${import.meta.env.PUBLIC_URL}/store-details/${item._id}`)}
                          >
                            {item.name}
                          </span>
                        </span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-sub">{item.storeOwner}</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-sub">{item.totalProducts} items</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-sub">
                          {item.businessAddress.state}/{item.businessAddress.country}
                        </span>
                      </DataTableRow>
                      {item.currency === "NGN" ? (
                        <>
                          <DataTableRow size="md">
                            <span className="tb-sub">{formatter("NGN", 2).format(item.wallet.available)}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="tb-sub">
                              {formatter("USD", 2).format(item.wallet.available / nairaValue)}
                            </span>
                          </DataTableRow>
                        </>
                      ) : (
                        <>
                          <DataTableRow size="md">
                            <span className="tb-sub">
                              {formatter("NGN", 2).format(item.wallet.available * nairaValue)}
                            </span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="tb-sub">{formatter("USD", 2).format(item.wallet.available)}</span>
                          </DataTableRow>
                        </>
                      )}
                      <DataTableRow>
                        <span className={`dot bg-${item.status === "active" ? "success" : "warning"} d-sm-none`}></span>
                        <Badge
                          className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                          color={statusColor(item.adminAction)}
                        >
                          {item.adminAction === "blocked"
                            ? "Blocked"
                            : item.adminAction === "pending"
                            ? "Pending"
                            : item.adminAction === "disapproved"
                            ? "Disapproved"
                            : "Approved"}
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
                                        navigate(`${import.meta.env.PUBLIC_URL}/store-details/${item._id}`);
                                      }}
                                    >
                                      <Icon name="eye"></Icon>
                                      <span>View Store</span>
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
                  {stores?.totalDocuments > 0 && (
                    <PaginationComponent
                      itemPerPage={itemsPerPage}
                      totalItems={stores?.totalDocuments}
                      paginate={paginate}
                      currentPage={Number(currentPage)}
                    />
                  )}
                </PreviewAltCard>
              </>
            ) : (
              <div className="text-center" style={{ paddingBlock: "1rem" }}>
                <span className="text-silent">No records found</span>
              </div>
            )}
          </DataTable>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default StoreListPage;
