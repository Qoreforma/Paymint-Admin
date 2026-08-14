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
        <BlockHead size="sm">
          <BlockBetween className="align-items-center flex-wrap gap-3">
            <BlockHeadContent>
              <BlockTitle page>Executive Dashboard</BlockTitle>
              <div className="text-muted small mt-1">
                Real-time platform metrics, revenue volumes, and profit breakdowns.
              </div>
            </BlockHeadContent>

            <BlockHeadContent>
              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Period quick filter buttons */}
                <div
                  className="btn-group bg-white p-1 rounded border shadow-sm"
                  role="group"
                  style={{ gap: 2 }}
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`btn btn-xs rounded ${
                        period === opt.value && !hasCustomDate
                          ? "btn-primary shadow-sm"
                          : "btn-outline-light text-dark border-0"
                      }`}
                      style={{ fontSize: 12, padding: "5px 12px", fontWeight: 500 }}
                      onClick={() => handlePeriodChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Date range picker for custom intervals */}
                <div className="bg-white rounded border shadow-sm">
                  <DateRangeFilter />
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* Highlight Gross Profit Banner */}
        <Block className="mb-4">
          <Card
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              color: "#fff",
              borderRadius: 14,
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            <div className="card-inner p-4">
              <Row className="align-items-center gy-3">
                <Col lg={4} md={6}>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        background: "rgba(16, 185, 129, 0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      💰
                    </div>
                    <div>
                      <div
                        className="text-uppercase small tracking-wider"
                        style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                      >
                        Total Gross Profit ({activePeriodLabel})
                      </div>
                      <div
                        className="fw-bold fs-2 lh-1 mt-1"
                        style={{ color: "#34d399", letterSpacing: "-0.5px" }}
                      >
                        {formatter("NGN").format(totalGrossProfit)}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col lg={4} md={6}>
                  <div className="d-flex align-items-center gap-3 border-start-lg border-secondary ps-lg-4">
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        background: "rgba(59, 130, 246, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        border: "1px solid rgba(59, 130, 246, 0.25)",
                      }}
                    >
                      📈
                    </div>
                    <div>
                      <div
                        className="text-uppercase small tracking-wider"
                        style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                      >
                        Services Volume
                      </div>
                      <div className="fw-bold fs-4 text-white mt-1">
                        {formatter("NGN").format(
                          data?.services_transaction?.all?.successful?.amount || 0
                        )}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col lg={4} md={12}>
                  <div className="d-flex align-items-center gap-3 border-start-lg border-secondary ps-lg-4">
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        background: "rgba(168, 85, 247, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        border: "1px solid rgba(168, 85, 247, 0.25)",
                      }}
                    >
                      ⚡
                    </div>
                    <div>
                      <div
                        className="text-uppercase small tracking-wider"
                        style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                      >
                        Successful Transactions
                      </div>
                      <div className="fw-bold fs-4 text-white mt-1">
                        {(
                          (data?.services_transaction?.all?.successful?.count || 0) +
                          (data?.crypto_transaction?.sell?.approved?.count || 0) +
                          (data?.giftcard_transaction?.sell?.approved?.count || 0)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Block>

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
