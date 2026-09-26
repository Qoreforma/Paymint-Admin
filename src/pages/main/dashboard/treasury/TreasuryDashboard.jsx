import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  Row,
  Icon,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { useGetTreasuryLedger, useGetPlatformFinances, useDeleteTreasuryEntry } from "../../../../api/treasury";
import { formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import DateRangeFilter from "../tables/date-range-filter";
import AddEntryModal from "./AddEntryModal";
import dayjs from "dayjs";
import PaginationComponent from "../../../../components/pagination/Pagination";
import toast from "react-hot-toast";

const TreasuryDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  const { mutate: deleteEntry, isLoading: isDeleting } = useDeleteTreasuryEntry();

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 20;
  const type = searchParams.get("type") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const { data: financeRes, isLoading: financesLoading } = useGetPlatformFinances();
  const { data: ledgerRes, isLoading: ledgerLoading } = useGetTreasuryLedger({ type, startDate, endDate }, page, limit);

  const finances = financeRes?.data?.data || {};
  const ledger = ledgerRes?.data?.data || [];
  const pagination = ledgerRes?.data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", newPage);
      return next;
    });
  };

  const handleTypeChange = (newType) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newType) {
        next.set("type", newType);
      } else {
        next.delete("type");
      }
      next.set("page", 1);
      return next;
    });
  };

  const handleEdit = (item) => {
    setSelectedEntry(item);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete this treasury entry (${item.description} - ${formatter(item.currency || "NGN").format(item.amount)})?`)) {
      deleteEntry(item._id, {
        onSuccess: () => {
          toast.success("Treasury entry deleted successfully");
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || err?.message || "Failed to delete entry");
        },
      });
    }
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setModalOpen(true);
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) setSelectedEntry(null);
  };

  if (financesLoading) return <LoadingSpinner />;

  const isSolvent = finances.platformLiquidity >= 0;

  return (
    <React.Fragment>
      <Head title="Treasury & Ledger" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Treasury & Financial Ledger</BlockTitle>
              <div className="text-soft">Manage capital injections, track expenses, and view real-time platform liquidity.</div>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="primary" onClick={handleNewEntry}>
                <Icon name="plus" />
                <span>Record Entry</span>
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* Big Picture Stats */}
        <Block>
          <Row className="g-gs">
            <Col sm="6" lg="3">
              <Card className="card-bordered h-100">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Capital Injected</h6>
                    </div>
                    <div className="card-tools">
                      <Icon name="coins" className="text-primary fs-3" />
                    </div>
                  </div>
                  <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
                    <div className="nk-sale-data">
                      <span className="amount">{formatter("NGN").format(finances.totalCapitalInjected)}</span>
                      <span className="sub-title">Total out-of-pocket funding</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col sm="6" lg="3">
              <Card className="card-bordered h-100">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Sunk Expenses</h6>
                    </div>
                    <div className="card-tools">
                      <Icon name="trend-down" className="text-danger fs-3" />
                    </div>
                  </div>
                  <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
                    <div className="nk-sale-data">
                      <span className="amount">{formatter("NGN").format(finances.totalExpenses)}</span>
                      <span className="sub-title">Ads, domains, salaries, etc.</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col sm="6" lg="3">
              <Card className="card-bordered h-100">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-2">
                    <div className="card-title">
                      <h6 className="title">Total Liabilities</h6>
                    </div>
                    <div className="card-tools">
                      <Icon name="users" className="text-warning fs-3" />
                    </div>
                  </div>
                  <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
                    <div className="nk-sale-data">
                      <span className="amount">{formatter("NGN").format(finances.totalLiabilities)}</span>
                      <span className="sub-title">User wallet balances owed</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col sm="6" lg="3">
              <Card className="card-bordered h-100">
                <div className="card-inner">
                  <div className="card-title-group align-start mb-2">
                    <div className="card-title">
                      <h6 className="title">True Net Profit</h6>
                    </div>
                    <div className="card-tools">
                      <Icon name="trend-up" className="text-success fs-3" />
                    </div>
                  </div>
                  <div className="align-end flex-sm-wrap g-4 flex-md-nowrap">
                    <div className="nk-sale-data">
                      <span className={`amount text-${finances.trueNetProfit >= 0 ? "success" : "danger"}`}>
                        {formatter("NGN").format(finances.trueNetProfit)}
                      </span>
                      <span className="sub-title">Gross Profits - Expenses</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Block>

        {/* Liquidity and Project Worth */}
        <Block>
          <Card className="card-bordered border-primary">
            <div className="card-inner">
              <Row className="g-gs align-items-center">
                <Col md="6">
                  <div className="text-center text-md-start">
                    <h5 className="title mb-1">Project Valuation & Liquidity</h5>
                    <p className="text-soft mb-0">Platform liquidity calculates if the cash you have can cover your liabilities.</p>
                  </div>
                </Col>
                <Col md="6">
                  <div className="d-flex justify-content-center justify-content-md-end align-items-center gap-4">
                    <div className="text-center">
                      <h6 className="text-soft mb-1">Total Sunk Capital</h6>
                      <h4 className="fw-bold m-0 text-warning">{formatter("NGN").format(finances.totalSunkCapital || 0)}</h4>
                    </div>
                    <div className="text-center">
                      <h6 className="text-soft mb-1">Platform Worth</h6>
                      <h4 className="fw-bold m-0">{formatter("NGN").format(finances.projectWorth)}</h4>
                    </div>
                    <div className="text-center">
                      <h6 className="text-soft mb-1">Liquidity Float</h6>
                      <h4 className={`fw-bold m-0 text-${isSolvent ? "success" : "danger"}`}>
                        {formatter("NGN").format(finances.platformLiquidity)}
                      </h4>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            {!isSolvent && (
              <div className="card-inner border-top bg-danger-dim">
                <p className="text-danger mb-0">
                  <Icon name="alert-circle" className="me-1" />
                  <strong>Warning:</strong> Platform is insolvent. User liabilities exceed available circulating cash. You need to inject capital.
                </p>
              </div>
            )}
          </Card>
        </Block>

        {/* What Each Entry Type Means & How It Affects Your Finances */}
        <Block>
          <Card className="card-bordered">
            <div className="card-inner py-3 border-bottom d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Icon name="info-fill" className="text-primary fs-4" />
                <div>
                  <h6 className="title mb-0">What Each Entry Type Means & How It Affects Your Finances</h6>
                  <span className="text-soft small">Accounting reference guide for treasury records and platform valuation.</span>
                </div>
              </div>
              <Button color="light" size="sm" className="btn-dim" onClick={() => setShowGuide(!showGuide)}>
                <Icon name={showGuide ? "chevron-up" : "chevron-down"} />
                <span>{showGuide ? "Hide Guide" : "Show Guide"}</span>
              </Button>
            </div>
            {showGuide && (
              <div className="table-responsive">
                <table className="table table-tranx is-compact mb-0">
                  <thead className="tb-tnx-head bg-light">
                    <tr>
                      <th style={{ width: "22%" }}>Entry Type</th>
                      <th style={{ width: "18%" }}>Short Tag</th>
                      <th style={{ width: "35%" }}>What It Means</th>
                      <th style={{ width: "25%" }}>Financial Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="fw-bold text-danger">Operational Expense</span>
                      </td>
                      <td>
                        <span className="badge badge-dim bg-danger">OPEX (Recurring)</span>
                      </td>
                      <td>
                        <span className="small text-soft">
                          Day-to-day business running costs (e.g., monthly hosting, server bills, team salaries, ad campaigns, tools).
                        </span>
                      </td>
                      <td>
                        <span className="small fw-semibold text-danger">
                          <Icon name="arrow-down-right" className="me-1" />
                          Deducts directly from Gross Profit to calculate <strong>True Net Profit</strong>.
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="fw-bold text-success">Capital Injection / Funding</span>
                      </td>
                      <td>
                        <span className="badge badge-dim bg-success">Working Capital (Liquid)</span>
                      </td>
                      <td>
                        <span className="small text-soft">
                          Actual liquid cash deposited to fund provider balances (e.g., ClubKonnect, SafeHaven, VTPass) or master bank accounts.
                        </span>
                      </td>
                      <td>
                        <span className="small fw-semibold text-success">
                          <Icon name="arrow-up-right" className="me-1" />
                          Directly increases <strong>Platform Liquidity</strong> & Available Float (it is active liquid money).
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="fw-bold text-warning">Out of Pocket Expense</span>
                      </td>
                      <td>
                        <span className="badge badge-dim bg-warning">Capex (Sunk Startup Cost)</span>
                      </td>
                      <td>
                        <span className="small text-soft">
                          Upfront capital spent out-of-pocket to bootstrap/build the platform (e.g., initial domain purchase, app setup, company registration).
                        </span>
                      </td>
                      <td>
                        <span className="small fw-semibold text-warning">
                          <Icon name="check-circle" className="me-1" />
                          Adds to <strong>Total Project Worth</strong> (sunk valuation) without reducing monthly net profit.
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Block>

        {/* Ledger Table */}
        <Block>
          <Card className="card-bordered">
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h6 className="title">Treasury Ledger</h6>
                </div>
                <div className="card-tools d-flex align-items-center gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    style={{ width: "150px" }}
                  >
                    <option value="">All Entries</option>
                    <option value="EXPENSE">Operational Expenses</option>
                    <option value="CAPITAL_INJECTION">Capital Injections</option>
                    <option value="CAPITAL_EXPENSE">Out of Pocket Expenses</option>
                  </select>
                  <DateRangeFilter
                    startDate={startDate}
                    endDate={endDate}
                    onFilter={(dates) => {
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set("startDate", dates.startDate);
                        next.set("endDate", dates.endDate);
                        next.set("page", 1);
                        return next;
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="card-inner p-0">
              <div className="table-responsive">
                <table className="table table-borderless table-striped">
                  <thead>
                    <tr className="tb-tnx-head bg-light">
                      <th>Date</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Recorded By</th>
                      <th className="text-end" style={{ width: "95px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4"><LoadingSpinner /></td>
                      </tr>
                    ) : ledger.length > 0 ? (
                      ledger.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <span className="fw-medium">{dayjs(item.date).format("MMM DD, YYYY")}</span>
                            <br />
                            <span className="fs-12px text-soft">{dayjs(item.date).format("hh:mm A")}</span>
                          </td>
                          <td>
                            <span className={`badge badge-sm badge-dim bg-${item.type === "EXPENSE" ? "danger" : item.type === "CAPITAL_EXPENSE" ? "warning" : "success"}`}>
                              {item.type.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td className="text-capitalize fw-bold">{item.category.replaceAll("_", " ")}</td>
                          <td>
                            <span className="d-block">{item.description}</span>
                            {item.provider && <span className="text-soft fs-12px">Provider: {item.provider}</span>}
                          </td>
                          <td>
                            <span className={`text-${item.type === "EXPENSE" ? "danger" : item.type === "CAPITAL_EXPENSE" ? "warning" : "success"} fw-bold`}>
                              {item.type === "EXPENSE" || item.type === "CAPITAL_EXPENSE" ? "-" : "+"}{formatter(item.currency || "NGN").format(item.amount)}
                            </span>
                          </td>
                          <td>{item.recordedBy?.firstName} {item.recordedBy?.lastName}</td>
                          <td className="text-end">
                            <div className="d-flex align-items-center justify-content-end gap-1">
                              <Button
                                size="xs"
                                color="light"
                                className="btn-icon btn-dim"
                                onClick={() => handleEdit(item)}
                                title="Edit Entry"
                              >
                                <Icon name="edit" />
                              </Button>
                              <Button
                                size="xs"
                                color="danger"
                                className="btn-icon btn-dim text-danger"
                                onClick={() => handleDelete(item)}
                                disabled={isDeleting}
                                title="Delete Entry"
                              >
                                <Icon name="trash" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-soft">No ledger entries found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-inner">
              {pagination.total > 0 && (
                <PaginationComponent
                  itemPerPage={pagination.limit}
                  totalItems={pagination.total}
                  paginate={handlePageChange}
                  currentPage={pagination.page}
                />
              )}
            </div>
          </Card>
        </Block>
      </Content>

      <AddEntryModal isOpen={modalOpen} toggle={toggleModal} entry={selectedEntry} />
    </React.Fragment>
  );
};

export default TreasuryDashboard;
