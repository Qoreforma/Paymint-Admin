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
import { useGetServiceTransactionsOverview } from "../../../../api/transactions";
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
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { FilterOptions } from "../tables/filter-select";
import { ServicesFilterOptions } from "./static-data";
import { ServicesStatsCard } from "./stats-card";
import { WalletAmountStatsCard } from "../giftcards/stats-card";
import UpdateStatusModal from "./modals/update-status";
import ReverseModal from "./modals/reverse-transaction";

export const ServiceTransactionTable = ({ purpose, data, isLoading, showStats, hideFilter = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";

  const { data: serviceTxnsOverview, isLoading: fetchingOverview } = useGetServiceTransactionsOverview();

  const [editedId, setEditedId] = useState(null);

  const [formData, setFormData] = useState({
    reference: "",
    amount: "",
    type: "",
    provider: "",
    remark: "",
    status: "",
    fullName: "",
    email: "",
    phone: "",
    date: "",
    balanceBefore: "",
    balanceAfter: "",
    meta: {},
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
      fullName: "",
      email: "",
      phone: "",
      date: "",
      balanceBefore: "",
      balanceAfter: "",
    });
    reset({});
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data?.transactions?.forEach((item) => {
      let customerDetails;
      if (item?._id === id) {
        if (item.type === "electricity") {
          customerDetails = {
            meterName: item?.meta?.serviceName,
            meterNumber: item?.meta?.meterNumber,
            meterType: item?.meta?.meterType,
            token: item?.meta?.token,
          };
        }
        if (item.type === "airtime") {
          customerDetails = {
            customerPhone: item?.meta?.phone,
            network: item?.meta?.serviceName,
          };
        }
        if (item.type === "data") {
          customerDetails = {
            customerPhone: item?.meta?.phone,
            network: item?.meta?.serviceName,
            bundle: item?.meta?.productName,
          };
        }
        if (item.type === "betting") {
          customerDetails = {
            bettingId: item?.meta?.customerId,
            bettingProvider: item?.meta?.serviceCode,
          };
        }
        if (item.type === "cable_tv") {
          customerDetails = {
            smartCardNumber: item?.meta?.smartCardNumber,
            productName: item?.meta?.productName,
            serviceName: item?.meta?.serviceName,
          };
        }
        if (item.type === "education") {
          customerDetails = {
            productName: item?.meta?.productName,
            serviceName: item?.meta?.serviceName,
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
          fullName: `${item?.userId?.firstname} ${item?.userId?.lastname}`,
          email: item?.userId?.email,
          phone: item?.userId?.phone,
          meta: item?.meta,
          date: item?.createdAt,
          balanceBefore: item?.balanceBefore,
          balanceAfter: item?.balanceAfter,
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
    } else if (status === "processing") {
      return "info";
    } else if (status === "success") {
      return "success";
    } else if (status === "reversed") {
      return "secondary";
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
      {showStats && (
        <Row className="mb-5">
          <Col lg={5}>
            <WalletAmountStatsCard
              data={serviceTxnsOverview?.data?.overview?.totals?.totalAmount || 0}
              successful={serviceTxnsOverview?.data?.overview?.totals?.successAmount}
            />
          </Col>
          <Col lg={7}>
            <ServicesStatsCard data={serviceTxnsOverview?.data?.overview?.totals} />
          </Col>
        </Row>
      )}

      <Block>
        <Card>
          {!hideFilter && (
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
          )}
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
                    <FilterOptions options={ServicesFilterOptions} showDate />
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
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Fullname</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Reference Number</span>
                      </DataTableRow>
                      {/* {(purpose === "data" || purpose === "international-data") && (
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Bundle</span>
                        </DataTableRow>
                      )} */}
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">P/L</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Balance After</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Provider</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">TYpe</span>
                      </DataTableRow>
                      {/* <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Purpose</span>
                      </DataTableRow> */}
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
                    {data?.transactions?.map((item, index) => {
                      return (
                        <DataTableItem key={item?._id} className="text-secondary">
                          <DataTableRow size="sm">
                            <span className="text-capitalize">
                              {tableNumbers(currentPage, itemsPerPage) + index + 1}
                            </span>
                          </DataTableRow>
                          <DataTableRow>
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
                          {/* {(purpose === "data" || purpose === "international-data") && (
                            <DataTableRow>
                              <span className="text-capitalize">{item?.meta?.product?.name}</span>
                            </DataTableRow>
                          )} */}
                          <DataTableRow>
                            <span>{item?.reference}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{formatter("NGN").format(item?.amount)}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{formatter("NGN").format(item?.profit ?? 0)}</span>
                          </DataTableRow>

                          <DataTableRow size="sm">
                            <span className="text-capitalize">{formatter("NGN").format(item?.balanceAfter)}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="text-capitalize"> {item?.provider}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="text-capitalize"> {item?.type}</span>
                          </DataTableRow>

                          <DataTableRow size="sm">
                            <span>{formatDateWithHyphen(item?.createdAt)}</span>
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
                                            onEditClick(item?._id);
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

                                                setEditedId(item?._id);
                                                setStatusToUpdate("success");
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

                                                setEditedId(item?._id);
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

                                      {item?.status === "failed" && (
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditedId(item?._id);
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
                  <span className="text-silent">No transaction record found</span>
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
          <div className="d-flex">
            <div className="nk-modal-head">
              <h4 className="nk-modal-title title">Transaction Details</h4>
            </div>
            <p
              style={{
                margin: "0 auto",
                fontSize: "24px",
              }}
              className="fw-bold text-primary"
            >
              Total:{" "}
              {formatter("NGN").format(
                formData?.meta?.chargeInfo?.totalAmount ||
                  formData.meta?.chargeInfo?.baseAmount ||
                  formData?.amount ||
                  0,
              )}
            </p>
          </div>
          <div className="nk-tnx-details mt-sm-3">
            <Row className="gy-2">
              <Col lg={4}>
                <span className="sub-text">Transaction Reference</span>
                <span className="caption-text">{formData.reference}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Amount</span>
                <span className="caption-text">
                  {formatter("NGN").format(formData.meta?.chargeInfo?.baseAmount || formData?.amount || 0)}
                </span>
              </Col>

              <Col size={4}>
                <span className="sub-text">Service Charge</span>
                <span className="caption-text">
                  {formatter("NGN").format(formData?.meta?.chargeInfo?.serviceCharge || 0)}
                </span>
              </Col>
              {formData?.meta?.discountCode && (
                <Col size={4}>
                  <span className="sub-text">Discount code</span>
                  <span className="caption-text">{formData?.meta?.discountCode}</span>
                </Col>
              )}
              <Col size={4}>
                <span className="sub-text">Discount</span>
                <span className="caption-text">{formatter("NGN").format(formData?.meta?.amountSaved ?? 0)}</span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Total Amount</span>
                <span className="caption-text fw-bold">
                  {formatter("NGN").format(formData?.meta?.chargeInfo?.totalAmount || formData?.amount || 0)}
                </span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Balance Before</span>
                <span className="caption-text">
                  {formData?.balanceBefore ? formatter("NGN").format(formData?.balanceBefore) : "N/A"}
                </span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Balance After</span>
                <span className="caption-text">
                  {formData?.balanceAfter ? formatter("NGN").format(formData?.balanceAfter) : "N/A"}
                </span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Profit/Loss</span>
                <span className="caption-text">{formatter("NGN").format(formData?.profit || 0)}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Type</span>
                <span className="caption-text ccap">{formData.type?.replaceAll("_", " ")}</span>
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

              {formData?.type === "airtime" && (
                <>
                  <Col lg={4}>
                    <span className="sub-text">Recharged Number</span>
                    <span className="caption-text">{formData.customerPhone}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Network</span>
                    <span className="caption-text">{formData.network?.replace("Airtime", "")}</span>
                  </Col>
                </>
              )}

              {formData?.type === "data" && (
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
                </>
              )}
              {formData?.type === "electricity" && (
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
                    <span className="sub-text">Meter Type</span>
                    <span className="caption-text">{formData.meterType}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Token</span>
                    <span className="caption-text ccap">{formData.token?.replace("Token : ", "")}</span>
                  </Col>
                </>
              )}
              {formData?.type === "betting" && (
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
              {formData?.type === "cable_tv" && (
                <>
                  <Col lg={4}>
                    <span className="sub-text">Smart Card Number</span>
                    <span className="caption-text">{formData.smartCardNumber}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Product Name</span>
                    <span className="caption-text">{formData.productName}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Service Name</span>
                    <span className="caption-text">{formData.serviceName}</span>
                  </Col>
                </>
              )}
              {formData?.type === "education" && (
                <>
                  <Col lg={4}>
                    <span className="sub-text">Product Name</span>
                    <span className="caption-text">{formData.productName}</span>
                  </Col>
                  <Col lg={4}>
                    <span className="sub-text">Service Name</span>
                    <span className="caption-text">{formData.serviceName}</span>
                  </Col>
                </>
              )}
              <Col>
                <span className="sub-text">Remark</span>
                <span className="caption-text ccap">{formData.remark}</span>
              </Col>
              <Col>
                <span className="sub-text">Date & Time</span>
                <span className="caption-text ccap">{formatDateWithHyphen(formData?.date)}</span>
              </Col>

              <h6>User</h6>
              <Col lg={4}>
                <span className="sub-text">Fullname</span>
                <span className="caption-text">{formData.fullName}</span>
              </Col>

              <Col lg={4}>
                <span className="sub-text">Phone</span>
                <span className="caption-text">{formData.phone ?? "N/A"}</span>
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
      <ReverseModal modal={showReverse} closeModal={setShowReverse} editedId={editedId} />
    </>
  );
};
