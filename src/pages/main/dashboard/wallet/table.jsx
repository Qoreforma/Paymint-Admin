import { useCallback, useEffect, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";
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
} from "../../../../components/Component";

import { formatDateWithHyphen, formatter, tableNumbers, truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";

import { FilterOptions } from "../tables/filter-select";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { WalletFilterOptions } from "./data";

const WithdrawalTable = ({ data, type, hideFilter = false, isLoading, updateFunc }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";

  const [formData, setFormData] = useState({
    id: "",
    reference: "",
    amount: "",
    provider: "",
    status: "",
    fee: "",
    bank: "",
    accountName: "",
    accountNumber: "",
    totalAmount: "",
    meta: "",
    profit: "",
    date: "",
  });
  const [view, setView] = useState({
    edit: false,
    add: false,
    details: false,
    amount: false,
  });
  const [onSearch, setonSearch] = useState(false);
  const [filters, setfilters] = useState({});

  // function to close the form modal
  const onFormCancel = () => {
    setView({ edit: false, add: false, details: false, amount: false });
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      reference: "",
      amount: "",
      provider: "",
      status: "",
      fee: "",
      bank: "",
      accountName: "",
      accountNumber: "",
      totalAmount: "",
      meta: "",
      profit: "",
      date: "",
    });
  };
  // console.log(formData);
  // function that loads the want to editted data
  const onEditClick = (id) => {
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          id: item?._id,
          reference: item?.reference,
          amount: item?.amount,
          provider: item?.provider,
          status: item?.status,
          fee: item?.chargeAmount,
          bank: item?.bankName,
          accountName: item?.accountName,
          accountNumber: item?.accountNumber,
          totalAmount: item?.totalDeduction,
          meta: item?.meta,
          profit: item?.profit,
          date: item?.createdAt,
        });
      }
    });
  };

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
    } else if (status === "approved") {
      return "success";
    } else {
      return "danger";
    }
  }, []);

  // console.log(formData);

  //scroll off when sidebar shows
  useEffect(() => {
    view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  }, [view.add]);
  return (
    <>
      {/* {(type || showStats) && (
        <Row className="mb-5">
          <Col lg={5}>
            <WalletAmountStatsCard data={data?.stat[type]?.total?.amount || 0} />
          </Col>
          <Col lg={7}>
            <WalletStatsCard data={data?.stat[type]} />
          </Col>
        </Row>
      )} */}
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
                    {item?.label}
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
                    <FilterOptions options={WalletFilterOptions} />
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
              ) : data?.total > 0 ? (
                <>
                  <DataTableBody className="is-compact">
                    <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">
                          {type === "transfer" ? "Sender" : "Fullname"}
                        </span>
                      </DataTableRow>
                      {type === "transfer" && (
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Receiver</span>
                        </DataTableRow>
                      )}
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Provider</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Total</span>
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
                        <DataTableItem key={item?._id} className="text-secondary">
                          <DataTableRow size="sm">
                            <span className="text-capitalize">
                              {tableNumbers(currentPage, itemsPerPage) + index + 1}
                            </span>
                          </DataTableRow>
                          <DataTableRow className="text-primary fw-bold ccap">
                            <Link to={`/user-details/${item?.userId?.id}`} className="title">
                              {truncateText(`${item?.userId?.firstname} ${item?.userId?.lastname}`, 10)}
                            </Link>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span className="text-capitalize"> {item?.provider}</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>{formatter("NGN").format(item?.amount ?? 0)}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{formatter("NGN").format(item?.totalDeduction ?? 0)}</span>
                          </DataTableRow>

                          <DataTableRow size="sm">
                            <span>{formatDateWithHyphen(item?.createdAt)}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span className={`dot bg-${statusColor(item?.status)} d-sm-none`}></span>
                            <Badge
                              className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                              color={statusColor(item?.status)}
                            >
                              <span className="ccap">{item?.status}</span>
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
                                      {item?.status === "pending" ? (
                                        <>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                updateFunc({ transactionID: item?._id, action: "approve" });
                                              }}
                                            >
                                              <Icon name="check"></Icon>
                                              <span>Approve</span>
                                            </DropdownItem>
                                          </li>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                updateFunc({ transactionID: item?._id, action: "reject" });
                                              }}
                                            >
                                              <Icon name="cross"></Icon>
                                              <span>Reject</span>
                                            </DropdownItem>
                                          </li>
                                        </>
                                      ) : null}
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
                    {data?.total > 0 && (
                      <PaginationComponent
                        itemPerPage={itemsPerPage}
                        totalItems={data?.total}
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
          <div className="nk-modal-head">
            <h4 className="nk-modal-title title">Transaction Details</h4>
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
              <Col lg={4}>
                <span className="sub-text">Provider</span>
                <span className="caption-text ccap">{formData.provider}</span>
              </Col>

              <Col size={4}>
                <span className="sub-text">Amount</span>
                <span className="caption-text">{formatter("NGN").format(formData.amount)}</span>
              </Col>

              <Col size={4}>
                <span className="sub-text">Service charge</span>
                <span className="caption-text">{formatter("NGN").format(formData.fee)}</span>
              </Col>
              <Col size={4}>
                <span className="sub-text">Total Amount</span>
                <span className="caption-text fw-bold">{formatter("NGN").format(formData.totalAmount)}</span>
              </Col>

              <Col lg={4}>
                <span className="sub-text">Date</span>
                <span className="caption-text ccap">{formatDateWithHyphen(formData.date)}</span>
              </Col>

              {type === "withdrawal" && (
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

              <Col lg={12}>
                <CodeBlock title={"Transaction Meta"} language={"JSON"}>
                  {JSON.stringify(formData.meta, null, 2)}
                </CodeBlock>
              </Col>

              <Col size="12" className="mt-5">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  {formData.status === "pending" ? (
                    <>
                      <li>
                        <Button
                          color="success"
                          size="md"
                          onClick={() => {
                            updateFunc({ transactionID: formData.id, action: "approve" });
                            setView({ details: false });
                          }}
                        >
                          Approve
                        </Button>
                      </li>

                      <li>
                        <Button
                          color="danger"
                          size="md"
                          type="button"
                          onClick={() => {
                            updateFunc({ transactionID: formData.id, action: "reject" });
                            setView({ details: false });
                          }}
                        >
                          Reject
                        </Button>
                      </li>
                    </>
                  ) : null}
                </ul>
              </Col>
            </Row>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default WithdrawalTable;
