import { useCallback, useEffect, useState } from "react";
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
import {
  useGetWalletTransactionsOverview,
  useUpdateWalletDepositAmount,
  useUpdateWithdrawalWalletStatus,
} from "../../../../api/transactions";
import {
  Block,
  Button,
  Col,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  Row,
  CodeBlock,
  UserAvatar,
} from "../../../../components/Component";
import ImageContainer from "../../../../components/partials/gallery/GalleryImage";
import {
  findUpper,
  formatDateWithHyphen,
  formatDateWithTime,
  formatter,
  tableNumbers,
  truncateText,
} from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { WalletAmountStatsCard } from "../giftcards/stats-card";
import EditModal from "../requests/edit-modal";
import { FilterOptions } from "../tables/filter-select";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { WalletFilterOptions } from "./data";
import { WalletStatsCard } from "./stats-card";
import UpdateStatusModal from "../transactions/modals/update-status";
import ReverseModal from "../transactions/modals/reverse-transaction";

const WalletTxnTable = ({ type, data, isLoading, showStats, hideFilter = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";

  const [editedId, setEditedId] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState();

  const [showStatus, setShowStatus] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [showReverse, setShowReverse] = useState(false);

  const { data: walletTxnsOverview, isLoading: fetchingOverview } = useGetWalletTransactionsOverview();

  const { mutate: updateAmount } = useUpdateWalletDepositAmount(editedId);
  const { mutate: updateStatus, isSuccess } = useUpdateWithdrawalWalletStatus(editedId, updatedStatus);

  const [formData, setFormData] = useState({});
  const [view, setView] = useState({
    edit: false,
    add: false,
    details: false,
    amount: false,
  });
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
    setView({ edit: false, add: false, details: false, amount: false });
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  const resetForm = () => {
    setFormData({});
    reset({});
  };
  // console.log(formData);
  // function that loads the want to editted data
  const onEditClick = (id) => {
    data?.transactions?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          reference: item?.reference,
          amount: item?.meta?.chargeInfo?.baseAmount || item?.amount,
          type: item?.type,
          provider: item?.provider,
          remark: item?.remark,
          status: item?.status,
          purpose: item?.purpose,
          direction: item?.direction,
          receiverName: `${item?.recipientId?.firstname} ${item?.recipientId?.lastname}`,
          receiverPhone: `${item?.recipientId?.phone}`,
          receiverEmail: item?.recipientId?.email,
          senderName: `${item?.sourceId?.firstname} ${item?.sourceId?.lastname}`,
          senderPhone: `${item?.sourceId?.phone}`,
          senderEmail: item?.sourceId?.email,
          balanceBefore: item?.balanceBefore,
          balanceAfter: item?.balanceAfter,
          depositVirtualAccount: item?.meta?.virtualAccount,
          date: item?.createdAt,
          bank: item?.meta?.bankName,
          accountName: item?.meta?.accountName,
          accountNumber: item?.meta?.accountNumber,
          fullName: `${item?.userId?.firstname} ${item?.userId?.lastname}`,
          email: item?.userId?.email,
          phone: `${item?.userId?.phone}`,
          meta: item?.meta,
          username: item?.userId?.username,

          fee: item?.fee,

          totalAmount: item?.total_amount,
          discount: item?.discount,
          proof: item?.proof,
          profit: item?.profit,
        });
      }
    });
    setEditedId(id);
    // setView({ add: false, edit: true });
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
      amount: type === "amount" ? true : false,
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

  // const start = (currentPage - 1) * itemsPerPage;
  // console.log(formData);

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  useEffect(() => {
    if (isSuccess) {
      onFormCancel();
    }
  }, [isSuccess]);

  // console.log(formData);

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
              data={walletTxnsOverview?.data?.overview?.totals?.totalAmount || 0}
              successful={walletTxnsOverview?.data?.overview?.totals?.successAmount}
            />
          </Col>
          <Col lg={7}>
            <WalletStatsCard data={walletTxnsOverview?.data?.overview?.totals} />
          </Col>
        </Row>
      )}
      <Block>
        <Card>
          {!hideFilter && (
            <Nav tabs className="nav nav-tabs nav-tabs-card">
              {WalletFilterOptions[0]?.options?.map((item, index) => (
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
                    <FilterOptions options={WalletFilterOptions} showDate />
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
              <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="reference number" />
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
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Reference Number</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Balance After</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Provider</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Type</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">P/L</span>
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

                          <DataTableRow size="sm">
                            <span className="text-capitalize"> {item?.reference}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{formatter("NGN").format(item?.amount)}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{item?.balanceAfter ? formatter("NGN").format(item?.balanceAfter) : "N/A"}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="text-capitalize"> {item?.provider}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="text-capitalize"> {item?.type?.replaceAll("_", " ")}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{formatter("NGN").format(item?.profit ?? 0)}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{formatDateWithHyphen(item.createdAt)}</span>
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
                formData?.meta?.chargeInfo?.totalDeduction ||
                  formData?.meta?.chargeInfo?.creditedAmount ||
                  formData.amount ||
                  0,
              )}
            </p>
          </div>
          <div className="nk-tnx-details mt-sm-3">
            <Row className="gy-2">
              <Col sm={4}>
                <span className="sub-text">Transaction Reference</span>
                <span className="caption-text">{formData.reference}</span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Status</span>
                <span className="caption-text">
                  <Badge className="badge-sm badge-dot has-bg d-inline-flex" color={statusColor(formData.status)}>
                    <span className="ccap">{formData.status}</span>
                  </Badge>
                </span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Type</span>
                <span className="caption-text">{formData.type?.replaceAll("_", " ")}</span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Amount</span>
                <span className="caption-text">{formatter("NGN").format(formData.amount ?? 0)}</span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Service Charge</span>
                <span className="caption-text">
                  {formatter("NGN").format(formData?.meta?.chargeInfo?.serviceCharge ?? 0)}
                </span>
              </Col>
              {/* <Col size={4}>
                <span className="sub-text">Discount</span>
                <span className="caption-text">{formatter("NGN").format(formData.discount ?? 0)}</span>
              </Col> */}
              <Col size={4}>
                <span className="sub-text">Total Amount</span>
                <span className="caption-text fw-bold">
                  {formatter("NGN").format(
                    formData?.meta?.chargeInfo?.totalDeduction ||
                      formData?.meta?.chargeInfo?.creditedAmount ||
                      formData.amount ||
                      0,
                  )}
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
                <span className="sub-text">Provider</span>
                <span className="caption-text ccap">{formData.provider}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Purpose</span>
                <span className="caption-text ccap">{formData.purpose}</span>
              </Col>
              <Col lg={4}>
                <span className="sub-text">Date & Time</span>
                <span className="caption-text ccap">{formatDateWithHyphen(formData.date)}</span>
              </Col>
              {formData.remark && (
                <Col>
                  <span className="sub-text">Remark</span>
                  <span className="caption-text ccap">{formData.remark}</span>
                </Col>
              )}

              {/* <Row className="mt-2">
                <h6>{type === "transfer" ? "Sender" : "User"}</h6>
                <Col sm={6} lg={4}>
                  <span className="sub-text">Fullname</span>
                  <span className="caption-text">{formData.fullName}</span>
                </Col>
                <Col sm={6} lg={4}>
                  <span className="sub-text">Phone</span>
                  <span className="caption-text">{formData.phone}</span>
                </Col>
                <Col sm={6}>
                  <span className="sub-text">Email</span>
                  <span className="caption-text">{formData.email}</span>
                </Col>
              </Row> */}

              {formData?.purpose === "wallet_to_wallet_transfer" && formData?.direction === "DEBIT" && (
                <Row className="mt-2">
                  <h6>Receiver</h6>
                  <Col sm={6} lg={4}>
                    <span className="sub-text">Fullname</span>
                    <span className="caption-text">{formData?.receiverName}</span>
                  </Col>

                  <Col sm={4} lg={4}>
                    <span className="sub-text">Phone</span>
                    <span className="caption-text">{formData.receiverPhone}</span>
                  </Col>
                  <Col sm={6}>
                    <span className="sub-text">Email</span>
                    <span className="caption-text">{formData?.receiverEmail}</span>
                  </Col>
                </Row>
              )}

              {formData?.purpose === "wallet_to_wallet_transfer" && formData?.direction === "CREDIT" && (
                <Row className="mt-2">
                  <h6>Sender</h6>
                  <Col sm={6} lg={4}>
                    <span className="sub-text">Fullname</span>
                    <span className="caption-text">{formData?.senderName}</span>
                  </Col>

                  <Col sm={4} lg={4}>
                    <span className="sub-text">Phone</span>
                    <span className="caption-text">{formData.senderPhone}</span>
                  </Col>
                  <Col sm={6}>
                    <span className="sub-text">Email</span>
                    <span className="caption-text">{formData?.senderEmail}</span>
                  </Col>
                </Row>
              )}

              {(formData.purpose === "withdrawal" || formData.purpose === "bank_transfer") && (
                <>
                  <h6>Bank</h6>
                  <Col sm={6} lg={4}>
                    <span className="sub-text">Account Name</span>
                    <span className="caption-text">{formData.accountName}</span>
                  </Col>
                  <Col sm={6} lg={4}>
                    <span className="sub-text">Account Number</span>
                    <span className="caption-text">{formData.accountNumber}</span>
                  </Col>
                  <Col sm={6} lg={4}>
                    <span className="sub-text">Bank</span>
                    <span className="caption-text"> {formData.bank}</span>
                  </Col>
                </>
              )}
              {/* {formData?.provider !== "qoreforma" && (
                <Row className="mt-2">
                  <h6>Transaction Meta</h6>
                  {formData?.meta?.event_type && (
                    <Col sm={6}>
                      <span className="sub-text">Event Type</span>
                      <span className="caption-text">{formData.meta?.event_type}</span>
                    </Col>
                  )}
                  {formData?.meta?.paid_on && (
                    <Col sm={6}>
                      <span className="sub-text">Paid On</span>
                      <span className="caption-text">{formatDateWithTime(formData.meta?.paid_on)}</span>
                    </Col>
                  )}
                  {formData?.meta?.payment_method && (
                    <Col sm={6}>
                      <span className="sub-text">Payment Method </span>
                      <span className="caption-text">{formData.meta?.payment_method}</span>
                    </Col>
                  )}
                  {formData?.meta?.settlement_amount && (
                    <Col sm={6}>
                      <span className="sub-text">Settlement Amount </span>
                      <span className="caption-text">{formatter("NGN").format(formData.meta?.settlement_amount)}</span>
                    </Col>
                  )}
                </Row>
              )} */}

              {formData.meta && (
                <Col lg={12}>
                  <CodeBlock title={"Transaction Meta"} language={"JSON"}>
                    {JSON.stringify(formData.meta, null, 2)}
                  </CodeBlock>
                </Col>
              )}

              {formData?.proof && (
                <Col>
                  <h6>Proof</h6>

                  <div style={{ width: "100px", height: "100px", overflow: "hidden" }}>
                    <ImageContainer img={formData.proof} />
                  </div>
                </Col>
              )}
              <Col size="12" className="mt-5">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  {formData.status === "processing" && formData.purpose === "withdrawal" ? (
                    <>
                      {/* <li>
                          <Button
                            color="success"
                            size="md"
                            onClick={() => {
                              setProvider("monnify");
                              initiateRequest();
                            }}
                          >
                            Initiate Transfer
                          </Button>
                        </li> */}

                      <li>
                        <Button
                          color="success"
                          size="md"
                          onClick={() => {
                            setUpdatedStatus("approved");
                            updateStatus();
                          }}
                        >
                          Approve via Bank Transfer
                        </Button>
                      </li>

                      <li>
                        <Button
                          color="danger"
                          size="md"
                          type="button"
                          onClick={() => {
                            setUpdatedStatus("declined");
                            updateStatus();
                          }}
                        >
                          Decline
                        </Button>
                      </li>

                      {/* <li>
                          <Button
                            color="primary"
                            size="md"
                            onClick={() => {
                              setUpdatedStatus("approved");
                              updateStatus();
                            }}
                          >
                            Approve via Bank Transfer
                          </Button>
                        </li> */}
                    </>
                  ) : null}
                  {/* <li>
                      <a
                        href="#cancel"
                        onClick={(ev) => {
                          ev.preventDefault();
                          close();
                        }}
                        className="link link-light"
                      >
                        Cancel
                      </a>
                    </li> */}
                </ul>
              </Col>
            </Row>
          </div>
        </ModalBody>
      </Modal>

      <EditModal view={view} formData={formData} onFormSubmit={updateAmount} onFormCancel={onFormCancel} />
      <UpdateStatusModal modal={showStatus} closeModal={setShowStatus} editedId={editedId} status={statusToUpdate} />
      <ReverseModal modal={showReverse} closeModal={setShowReverse} editedId={editedId} />
    </>
  );
};

export default WalletTxnTable;
