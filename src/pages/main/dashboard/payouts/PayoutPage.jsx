import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  UncontrolledDropdown,
} from "reactstrap";
import { useGetWithdrawals, useUpdateWithdrawalStatus } from "../../../../api/payouts";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  RSelect,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDateWithTime } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { filterCurrency, filterPayoutStatus } from "./PayoutData";

const PayoutPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const { data: payouts, isLoading } = useGetWithdrawals(currentPage, itemsPerPage, search);
  const { mutate: updatePayout } = useUpdateWithdrawalStatus();

  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bank: "",
    accountName: "",
  });
  const [view, setView] = useState({
    details: false,
  });
  const [onSearch, setonSearch] = useState(false);

  const [filters, setfilters] = useState({});

  // function to close the form modal
  const onFormCancel = () => {
    setView({ details: false });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      accountNumber: "",
      bank: "",
      accountName: "",
    });
    reset({});
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    payouts?.data?.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name: item.storeName,
          accountNumber: item.bankInfo.accountNumber,
          bank: item.bankInfo.name,
          accountName: item.bankInfo.accountName,
        });
      }
    });
  };

  // function to filter data
  const filterData = useCallback(() => {
    return;
  }, []);

  // toggle function to view product details
  const toggle = (type) => {
    setView({
      details: type === "details" ? true : false,
    });
  };

  // Change Page
  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  const { reset } = useForm();

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "approved") {
      return "success";
    } else {
      return "danger";
    }
  }, []);

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  return (
    <React.Fragment>
      <Head title="Payouts"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Payouts</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Payouts</h5>
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
                                    options={filterCurrency}
                                    placeholder="Currency"
                                    value={filters.currency && { label: filters.currency, value: filters.currency }}
                                    onChange={(e) => setfilters({ ...filters, currency: e.value })}
                                  />
                                </div>
                              </Col>
                              <Col size="6">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Status</label>
                                  <RSelect
                                    options={filterPayoutStatus}
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
                {/* SEARCH COMPONENT */}
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="store name" />
              </div>
            </div>

            <div className="card-inner-group">
              {/* <div className="card-inner p-0"> */}
              {isLoading ? (
                <LoadingSpinner />
              ) : payouts?.totalDocuments > 0 ? (
                <>
                  <DataTableBody className="is-compact" bodyclass="nk-tb-tnx">
                    <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Store name</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Username</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Date & Time</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Currency</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
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
                    {payouts?.data?.map((item, idx) => {
                      return (
                        <DataTableItem key={idx}>
                          <DataTableRow size="sm">
                            <span className="title">{item.storeName}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{item.username}</span>
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span>{formatDateWithTime(item.createdAt)}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span> {item.currency}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{item.amount.toLocaleString()}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className={`dot bg-${statusColor(item.state)} d-sm-none`}></span>
                            <Badge
                              className="badge-sm badge-dot has-bg d-none d-sm-inline-flex text-capitalize"
                              color={statusColor(item.state)}
                            >
                              {item.state}
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
                                            onEditClick(item._id);
                                            toggle("details");
                                          }}
                                        >
                                          <Icon name="eye"></Icon>
                                          <span>View bank info</span>
                                        </DropdownItem>
                                      </li>
                                      {item.state === "pending" && (
                                        <>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#view"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                updatePayout({ transactionId: item._id, state: "approved" });
                                              }}
                                            >
                                              <Icon name="check-circle-cut"></Icon>
                                              <span>Approve and Pay</span>
                                            </DropdownItem>
                                          </li>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#remove"
                                              className="text-danger"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                updatePayout({ transactionId: item._id, state: "declined" });
                                              }}
                                            >
                                              <Icon name="cross"></Icon>
                                              <span>Declined</span>
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
                    {payouts.totalDocuments > 0 && (
                      <PaginationComponent
                        itemPerPage={itemsPerPage}
                        totalItems={payouts?.totalDocuments}
                        paginate={paginate}
                        currentPage={Number(currentPage)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center" style={{ paddingBlock: "1rem" }}>
                  <span className="text-silent">No records found</span>
                </div>
              )}
              {/* </div> */}
            </div>
          </Card>
        </Block>

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
            <div className="nk-modal-head">
              <h4 className="nk-modal-title title">{formData.name}</h4>
            </div>
            <div className="nk-tnx-details mt-sm-3">
              <Row className="gy-3">
                <Col lg={6}>
                  <span className="sub-text">Account Name</span>
                  <span className="caption-text">{formData.accountName}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Account Number</span>
                  <span className="caption-text">{formData.accountNumber}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Bank</span>
                  <span className="caption-text"> {formData.bank}</span>
                </Col>
              </Row>
            </div>
          </ModalBody>
        </Modal>

        {view.add && <div className="toggle-overlay" onClick={toggle}></div>}
      </Content>
    </React.Fragment>
  );
};

export default PayoutPage;
