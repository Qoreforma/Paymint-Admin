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
import { useGetTreasuryLedger, useGetPlatformFinances } from "../../../../api/treasury";
import { formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import DateRangeFilter from "../tables/date-range-filter";
import AddEntryModal from "./AddEntryModal";
import moment from "moment";
import PaginationComponent from "../../../../components/pagination/Pagination";

const TreasuryDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

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

  const toggleModal = () => setModalOpen(!modalOpen);

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
              <Button color="primary" onClick={toggleModal}>
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
                    <option value="EXPENSE">Expenses Only</option>
                    <option value="CAPITAL_INJECTION">Capital Only</option>
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
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4"><LoadingSpinner /></td>
                      </tr>
                    ) : ledger.length > 0 ? (
                      ledger.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <span className="fw-medium">{moment(item.date).format("MMM DD, YYYY")}</span>
                            <br />
                            <span className="fs-12px text-soft">{moment(item.date).format("hh:mm A")}</span>
                          </td>
                          <td>
                            <span className={`badge badge-sm badge-dim bg-${item.type === "EXPENSE" ? "danger" : "success"}`}>
                              {item.type.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td className="text-capitalize fw-bold">{item.category.replaceAll("_", " ")}</td>
                          <td>
                            <span className="d-block">{item.description}</span>
                            {item.provider && <span className="text-soft fs-12px">Provider: {item.provider}</span>}
                          </td>
                          <td>
                            <span className={`text-${item.type === "EXPENSE" ? "danger" : "success"} fw-bold`}>
                              {item.type === "EXPENSE" ? "-" : "+"}{formatter(item.currency || "NGN").format(item.amount)}
                            </span>
                          </td>
                          <td>{item.recordedBy?.firstName} {item.recordedBy?.lastName}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-soft">No ledger entries found.</td>
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

      <AddEntryModal isOpen={modalOpen} toggle={toggleModal} />
    </React.Fragment>
  );
};

export default TreasuryDashboard;
