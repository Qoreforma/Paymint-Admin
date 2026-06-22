import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Badge,
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  UncontrolledDropdown,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { useGetAllTransactions } from "../../../../api/transactions";
import {
  Block,
  Button,
  CodeBlock,
  Col,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  Row,
} from "../../../../components/Component";
import { formatDateWithTime, formatter, tableNumbers, truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { FilterOptions } from "../tables/filter-select";
import { ServicesFilterOptions } from "./static-data";
import { ServicesStatsCard } from "./stats-card";
import { WalletAmountStatsCard } from "../giftcards/stats-card";
import UpdateStatusModal from "./modals/update-status";
import ReverseModal from "./modals/reverse-transaction";

export const TransactionTable = ({ purpose, userId, showStats }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [editedId, setEditedId] = useState(null);

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  // const { isLoading, data, error } = useGetAllProducts(currentPage, itemsPerPage, search, type);
  const { isLoading, data, error } = useGetAllTransactions(
    currentPage,
    itemsPerPage,
    purpose === "all" ? "" : purpose,
    status,
    search,
    userId
  );

  // console.log(data);

  const [formData, setFormData] = useState({
    reference: "",
    amount: "",
    type: "",
    provider: "",
    remark: "",
    status: "",
    fee: "",
    accountName: "",
    accountNumber: "",
    bank: "",
    fullName: "",
    email: "",
    phone: "",
    discount: "",
    date: "",
    profit: "",
  });
  const [view, setView] = useState({
    edit: false,
    add: false,
    details: false,
  });
  const [showStatus, setShowStatus] = useState(false);
  const [showReverse, setShowReverse] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [onSearch, setonSearch] = useState(false);
  const [filters, setfilters] = useState({});
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // function to close the form modal
  const onFormCancel = () => {
    setView({ edit: false, add: false, details: false });
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      reference: "",
      amount: "",
      type: "",
      provider: "",
      remark: "",
      status: "",
      fee: "",
      accountName: "",
      accountNumber: "",
      bank: "",
      fullName: "",
      email: "",
      phone: "",
      discount: "",
      date: "",
      profit: "",
    });
    reset({});
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data?.data?.forEach((item) => {
      let customerDetails;
      if (item.id === id) {
        // console.log(item);
        if (item.purpose === "electricity") {
          customerDetails = {
            meterName: item?.meta?.customer?.meter_name,
            meterNumber: item?.meta?.customer?.meter_number,
            meterAddress: item?.meta?.customer?.meter_address,
            provider: item?.meta?.provider?.name,
          };
        }
        if (item.purpose === "airtime") {
          customerDetails = {
            customerPhone: item?.meta?.customer?.phone,
            network: item?.meta?.provider?.name,
          };
        }
        if (item.purpose === "data") {
          customerDetails = {
            customerPhone: item?.meta?.customer?.phone,
            network: item?.meta?.provider?.name,
            bundle: item?.meta?.product?.name,
            dataType: item?.meta?.product?.type,
          };
        }
        if (item.purpose === "betting") {
          customerDetails = {
            bettingId: item?.meta?.customer?.customer_id,
            bettingProvider: item?.meta?.provider?.name,
          };
        }

        setFormData({
          reference: item?.reference,
          amount: item?.amount,
          type: item?.type,
          purpose: item?.purpose,
          provider: item?.provider,
          remark: item?.remark,
          status: item?.status,
          fee: item?.fee,
          accountName: item?.meta?.account_name,
          accountNumber: item?.meta?.account_number,
          bank: item?.meta?.bank_name,
          fullName: `${item?.user?.firstname} ${item?.user?.lastname}`,
          email: item?.user?.email,
          phone: `${item?.user?.phone_code}${item?.user?.phone}`,
          discount: item?.discount,
          meta: item?.meta,
          date: item?.created_at,
          profit: item?.profit,
          ...customerDetails,
        });
      }
    });
    setEditedId(id);
    setView({ add: false, edit: true });
  };

  // function to filter data
  const filterData = useCallback(() => {
    return;
  }, []);

  // toggle function to view product details
  const toggle = (type) => {
    setView({
      edit: type === "edit" ? true : false,
      add: type === "add" ? true : false,
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

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "successful") {
      return "success";
    } else if (status === "reversed") {
      return "info";
    } else {
      return "danger";
    }
  }, []);

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  //scroll off when sidebar shows
  useEffect(() => {
    view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  }, [view.add]);

  return (
    <>
      {(purpose || showStats) && (
        <Row className="mb-5">
          <Col lg={5}>
            <WalletAmountStatsCard
              data={data?.stat[purpose]?.total?.amount || 0}
              successful={data?.stat[purpose]?.successful?.amount}
            />
          </Col>
          <Col lg={7}>
            <ServicesStatsCard data={data?.stat ? data?.stat[purpose] : null} />
          </Col>
        </Row>
      )}

      <Block>
        <Card>
          <Nav tabs className="nav nav-tabs nav-tabs-card">
            {ServicesFilterOptions[0]?.options?.map((item, index) => (
              <NavItem key={index}>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={status === item?.value ? "active" : ""}
                  onClick={(ev) => {
                    ev.preventDefault();
                    setSearchParams({ status: item?.value });
                  }}
                >
                  {item.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          <div className="card-inner border-bottom">
            <div className="card-title-group">
              <div className="card-title">
                <h5 className="title">Transactions</h5>
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
                    <FilterOptions options={ServicesFilterOptions} />
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
              <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="hotel name" />
            </div>
          </div>
          <div className="card-inner-group">
            <div className="card-inner p-0">
              {isLoading ? (
                <LoadingSpinner />
              ) : data?.meta?.total > 0 ? (
                <>
                  <DataTableBody className="is-compact">
                    <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Fullname</span>
                      </DataTableRow>
                      {(purpose === "data" || purpose === "international-data") && (
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Bundle</span>
                        </DataTableRow>
                      )}
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">P/L</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Purpose</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Provider</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Network</span>
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
                        <DataTableItem key={item.id} className="text-secondary">
                          <DataTableRow size="sm">
                            <span className="text-capitalize">
                              {tableNumbers(currentPage, itemsPerPage) + index + 1}
                            </span>
                          </DataTableRow>
                          <DataTableRow className="text-primary fw-bold">
                            <Link to={`/user-details/${item?.user?.id}`} className="title">
                              {truncateText(`${item?.user?.firstname} ${item?.user?.lastname}`, 20)}
                            </Link>
                          </DataTableRow>
                          {(purpose === "data" || purpose === "international-data") && (
                            <DataTableRow>
                              <span className="text-capitalize">{item?.meta?.product?.name}</span>
                            </DataTableRow>
                          )}
                          <DataTableRow>
                            <span>{formatter("NGN").format(item?.amount)}</span>
                          </DataTableRow>

                          <DataTableRow>
                            <span>{formatter("NGN").format(item?.profit)}</span>
                          </DataTableRow>

                          <DataTableRow size="sm">
                            <span className="text-capitalize">
                              {item?.purpose == "international-airtime" ? "INR-Airtime" : item.purpose}
                            </span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="text-capitalize"> {item?.provider}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="text-capitalize"> {item?.meta?.provider?.name}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{formatDateWithTime(item.created_at)}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span className={`dot bg-${statusColor(item.status)} d-sm-none`}></span>
                            <Badge
                              className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                              color={statusColor(item.status)}
                            >
                              <span className="ccap">{item.status}</span>
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
                                            // navigate(`/giftcards-details/${item.id}`);
                                            onEditClick(item.id);
                                            toggle("details");
                                          }}
                                        >
                                          <Icon name="eye"></Icon>
                                          <span>View</span>
                                        </DropdownItem>
                                      </li>
                                      {item?.status === "pending" && (
                                        <>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                // navigate(`/giftcards-details/${item.id}`);
                                                onEditClick(item.id);
                                                setStatusToUpdate("successful");
                                                setShowStatus(true);
                                              }}
                                            >
                                              <Icon name="check"></Icon>
                                              <span>Mark as successful</span>
                                            </DropdownItem>
                                          </li>

                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                // navigate(`/giftcards-details/${item.id}`);
                                                onEditClick(item.id);
                                                setStatusToUpdate("failed");
                                                setShowStatus(true);
                                              }}
                                            >
                                              <Icon name="cross"></Icon>
                                              <span>Mark as Failed</span>
                                            </DropdownItem>
                                          </li>
                                        </>
                                      )}

                                      {(item?.status === "successful" || item?.status === "failed") && (
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              onEditClick(item.id);
                                              setShowReverse(true);
                                            }}
                                          >
                                            <Icon name="curve-up-left"></Icon>
                                            <span>Reverse</span>
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
                      );
                    })}
                  </DataTableBody>
                  <div className="card-inner">
                    {data?.meta?.total > 0 && (
                      <PaginationComponent
                        itemPerPage={itemsPerPage}
                        totalItems={data?.meta?.total}
                        paginate={paginate}
                        currentPage={Number(currentPage)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center" style={{ paddingBlock: "1rem" }}>
                  <span className="text-silent">No tranaction record found</span>
                </div>
              )}
            </div>
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
            <h4 className="nk-modal-title title">Transaction Details</h4>
          </div>
          <div className="nk-tnx-details mt-sm-3">
            <Row className="gy-2">
              <Col lg={4}>
                <span className="sub-text">Transaction Reference</span>
                <span className="caption-text">{formData.reference}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Amount</span>
                <span className="caption-text">{formatter("NGN").format(formData.amount)}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Type</span>
                <span className="caption-text ccap">{formData.type}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Provider</span>
                <span className="caption-text ccap">{formData.provider}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Status</span>
                <span className="caption-text">
                  <Badge className="badge-sm badge-dot has-bg d-inline-flex" color={statusColor(formData.status)}>
                    <span className="ccap">{formData.status}</span>
                  </Badge>
                </span>
              </Col>

              <Col lg={4}>
                <span className="sub-text">Fee</span>
                <span className="caption-text">{formatter("NGN").format(formData.fee)}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Discount</span>
                <span className="caption-text">{formatter("NGN").format(formData.discount)}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Profit/Loss</span>
                <span className="caption-text ccap">{formatter("NGN").format(formData.profit)}</span>
              </Col>

              {formData?.purpose === "airtime" && (
                <>
                  <Col lg={4}>
                    <span className="sub-text">Recharged Number</span>
                    <span className="caption-text">{formData.customerPhone}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Network</span>
                    <span className="caption-text">{formData.network}</span>
                  </Col>
                </>
              )}

              {formData?.purpose === "data" && (
                <>
                  <Col lg={4}>
                    <span className="sub-text">Recharged Number</span>
                    <span className="caption-text">{formData.customerPhone}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Network</span>
                    <span className="caption-text">{formData.network}</span>
                  </Col>
                  <Col lg={8}>
                    <span className="sub-text">Data Bundle</span>
                    <span className="caption-text">{formData.bundle}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Data Type</span>
                    <span className="caption-text">{formData.dataType}</span>
                  </Col>
                </>
              )}
              {formData?.purpose === "electricity" && (
                <>
                  <Col lg={4}>
                    <span className="sub-text">Meter Number</span>
                    <span className="caption-text">{formData.meterNumber}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Meter Name</span>
                    <span className="caption-text">{formData.meterName}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Meter address</span>
                    <span className="caption-text">{formData.meterAddress}</span>
                  </Col>
                </>
              )}
              {formData?.purpose === "betting" && (
                <>
                  <Col lg={4}>
                    <span className="sub-text">Betting ID</span>
                    <span className="caption-text">{formData.bettingId}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Betting Provider</span>
                    <span className="caption-text">{formData.bettingProvider}</span>
                  </Col>
                </>
              )}
              <Col>
                <span className="sub-text">Remark</span>
                <span className="caption-text ccap">{formData.remark}</span>
              </Col>
              <Col>
                <span className="sub-text">Date & Time</span>
                <span className="caption-text ccap">{formatDateWithTime(formData?.date)}</span>
              </Col>

              <h6>User</h6>
              <Col lg={4}>
                <span className="sub-text">Fullname</span>
                <span className="caption-text">{formData.fullName}</span>
              </Col>

              <Col lg={4}>
                <span className="sub-text">Phone</span>
                <span className="caption-text">{formData.phone}</span>
              </Col>
              <Col lg={6}>
                <span className="sub-text">Email</span>
                <span className="caption-text">{formData.email}</span>
              </Col>
              <Col lg={12}>
                <CodeBlock title={"Transaction Meta"} language={"JSON"}>
                  {JSON.stringify(formData.meta, null, 2)}
                </CodeBlock>
              </Col>
            </Row>
          </div>
        </ModalBody>
      </Modal>

      <UpdateStatusModal modal={showStatus} closeModal={setShowStatus} editedId={editedId} status={statusToUpdate} />
      <ReverseModal modal={showReverse} closeModal={setShowReverse} editedId={editedId} formData={formData} />
    </>
  );
};
