import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Badge } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  Icon,
  Row,
} from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import {
  AllServicesStats,
  ServicesStatsSection,
  WalletBalances,
  WalletStatsSection,
} from "./dashboard-stats";
import { useGetDashboardStats } from "../../../api/dashboard";
import { formatter } from "../../../utils/Utils";
import LoadingSpinner from "../../components/spinner";
import DateRangeFilter from "./tables/date-range-filter";

const PERIOD_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "1m" },
  { label: "This Year", value: "1y" },
];

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const period = searchParams.get("period") || "all";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const { data, isLoading } = useGetDashboardStats(period, startDate, endDate);

  const handlePeriodChange = (newPeriod) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPeriod === "all") {
        next.delete("period");
      } else {
        next.set("period", newPeriod);
      }
      next.delete("startDate");
      next.delete("endDate");
      return next;
    });
  };

  const hasCustomDate = startDate && endDate;

  // Calculate gross profit across all sources
  const totalGrossProfit = useMemo(() => {
    if (data?.total_profit !== undefined) return data.total_profit;
    const servicesProfit = data?.services_transaction?.all?.successful?.profit || 0;
    const cryptoSellProfit = data?.crypto_transaction?.sell?.approved?.profit || 0;
    const cryptoBuyProfit = data?.crypto_transaction?.buy?.approved?.profit || 0;
    const giftcardProfit =
      (data?.giftcard_transaction?.sell?.approved?.profit || 0) +
      (data?.giftcard_transaction?.sell?.second_approval?.profit || 0);
    return servicesProfit + cryptoSellProfit + cryptoBuyProfit + giftcardProfit;
  }, [data]);

  const activePeriodLabel = useMemo(() => {
    if (hasCustomDate) return "Custom Range";
    const found = PERIOD_OPTIONS.find((p) => p.value === period);
    return found ? found.label : "All Time";
  }, [period, hasCustomDate]);

  return (
    <React.Fragment>
      <Head title="Dashboard" />
      <Content>
        {/* Header with Title and Period Filter Controls */}
        <div className="nk-block-head nk-block-head-sm mb-4">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div>
              <h3 className="nk-block-title page-title mb-1">Executive Dashboard</h3>
              <div className="text-muted small">
                Real-time platform metrics, revenue volumes, and profit breakdowns.
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              {/* Period quick filter buttons */}
              <div
                className="btn-group bg-white p-1 rounded-3 border shadow-sm"
                role="group"
                style={{ gap: 2 }}
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`btn btn-xs rounded-2 ${
                      period === opt.value && !hasCustomDate
                        ? "btn-primary shadow-sm"
                        : "btn-outline-light text-dark border-0"
                    }`}
                    style={{ fontSize: 12, padding: "6px 14px", fontWeight: 500 }}
                    onClick={() => handlePeriodChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Date range picker for custom intervals */}
              <div className="bg-white rounded-3 border shadow-sm">
                <DateRangeFilter />
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Gross Profit Banner */}
        <div className="mb-4">
          <div
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              color: "#fff",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 8px 30px rgba(15,23,42,0.18)",
              padding: "24px 28px",
            }}
          >
            <div className="row g-4 align-items-center">
              {/* Pod 1: Total Gross Profit */}
              <div className="col-12 col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "rgba(16, 185, 129, 0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      flexShrink: 0,
                    }}
                  >
                    💰
                  </div>
                  <div>
                    <div
                      className="text-uppercase"
                      style={{
                        color: "#94a3b8",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      Total Gross Profit ({activePeriodLabel})
                    </div>
                    <div
                      className="fw-bold mt-1"
                      style={{
                        color: "#34d399",
                        fontSize: 26,
                        lineHeight: 1.2,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {formatter("NGN").format(totalGrossProfit)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pod 2: Services Volume */}
              <div className="col-12 col-md-4 border-start-md" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="d-flex align-items-center gap-3 ps-md-3">
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "rgba(59, 130, 246, 0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      flexShrink: 0,
                    }}
                  >
                    📈
                  </div>
                  <div>
                    <div
                      className="text-uppercase"
                      style={{
                        color: "#94a3b8",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      Services Volume
                    </div>
                    <div
                      className="fw-bold text-white mt-1"
                      style={{ fontSize: 22, lineHeight: 1.2 }}
                    >
                      {formatter("NGN").format(
                        data?.services_transaction?.all?.successful?.amount || 0
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pod 3: Successful Transactions */}
              <div className="col-12 col-md-4 border-start-md" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="d-flex align-items-center gap-3 ps-md-3">
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "rgba(168, 85, 247, 0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      flexShrink: 0,
                    }}
                  >
                    ⚡
                  </div>
                  <div>
                    <div
                      className="text-uppercase"
                      style={{
                        color: "#94a3b8",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      Successful Transactions
                    </div>
                    <div
                      className="fw-bold text-white mt-1"
                      style={{ fontSize: 22, lineHeight: 1.2 }}
                    >
                      {(
                        (data?.services_transaction?.all?.successful?.count || 0) +
                        (data?.crypto_transaction?.sell?.approved?.count || 0) +
                        (data?.giftcard_transaction?.sell?.approved?.count || 0)
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Block>
          {isLoading ? (
            <div className="text-center py-5">
              <LoadingSpinner />
            </div>
          ) : (
            <Row className="g-gs">
              <Col lg={12}>
                <h5 className="mb-3 d-flex align-items-center gap-2">
                  <span>Total Wallet Transactions</span>
                  <Badge color="light" className="text-muted fw-normal" style={{ fontSize: 11 }}>
                    {activePeriodLabel}
                  </Badge>
                </h5>
                <WalletStatsSection data={data?.wallet_transaction} />
              </Col>

              <Col lg={12}>
                <h5 className="mb-3 d-flex align-items-center gap-2 mt-4">
                  <span>Total Services Transactions & Profits</span>
                  <Badge color="light" className="text-muted fw-normal" style={{ fontSize: 11 }}>
                    {activePeriodLabel}
                  </Badge>
                </h5>
                <ServicesStatsSection data={data?.services_transaction} />
              </Col>

              <Col lg={12}>
                <h5 className="mb-3 mt-4">Wallet Balances & User Base</h5>
                <WalletBalances data={data?.wallet_balance} />
              </Col>

              <Col lg={12}>
                <h5 className="mb-3 d-flex align-items-center gap-2 mt-4">
                  <span>Services Breakdown & Net Profit</span>
                  <Badge color="light" className="text-muted fw-normal" style={{ fontSize: 11 }}>
                    {activePeriodLabel}
                  </Badge>
                </h5>
                <AllServicesStats
                  data={data?.services_transaction}
                  crypto={data?.crypto_transaction}
                  giftcard={data?.giftcard_transaction}
                />
              </Col>
            </Row>
          )}
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default Dashboard;
