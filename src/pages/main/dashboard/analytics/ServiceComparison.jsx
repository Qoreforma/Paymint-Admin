import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Col,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { useGetServiceComparison } from "../../../../api/analytics";
import { formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import DateRangeFilter from "../tables/date-range-filter";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const PERIOD_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "1m" },
  { label: "This Year", value: "1y" },
];

const COLORS = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6c757d", "#6f42c1", "#e83e8c", "#fd7e14"];

const ServiceComparison = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const period = searchParams.get("period") || "all";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const { data: response, isLoading } = useGetServiceComparison({ period, startDate, endDate });

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

  if (isLoading) return <LoadingSpinner />;

  const stats = response?.data?.data || { services: [], providers: [], providersPerService: [] };

  // Data for Service Comparison Pie Chart (By Volume)
  const servicePieData = {
    labels: stats.services.map((s) => s.name?.replaceAll("_", " ")),
    datasets: [
      {
        data: stats.services.map((s) => s.volume),
        backgroundColor: COLORS,
      },
    ],
  };

  // Data for Provider Comparison Bar Chart (By Volume)
  const providerBarData = {
    labels: stats.providers.map((p) => p.name),
    datasets: [
      {
        label: "Total Sales Volume (NGN)",
        data: stats.providers.map((p) => p.volume),
        backgroundColor: "#007bff",
      },
    ],
  };

  return (
    <React.Fragment>
      <Head title="Service Comparison Analytics" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Service & Provider Comparison</BlockTitle>
              <div className="text-soft">Identify top performing services and providers.</div>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <div className="toggle-expand-content">
                  <ul className="nk-block-tools g-3">
                    <li>
                      <div className="d-flex align-items-center gap-2">
                        {PERIOD_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            className={`btn btn-sm ${
                              (!hasCustomDate && period === opt.value)
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() => handlePeriodChange(opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </li>
                    <li>
                      <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        onFilter={(dates) => {
                          setSearchParams((prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete("period");
                            next.set("startDate", dates.startDate);
                            next.set("endDate", dates.endDate);
                            return next;
                          });
                        }}
                      />
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <Row className="g-gs">
            <Col md="6">
              <Card className="card-bordered h-100">
                <div className="card-inner">
                  <div className="card-title-group mb-4">
                    <div className="card-title">
                      <h6 className="title">Top Services (By Volume)</h6>
                    </div>
                  </div>
                  <div style={{ height: "300px", display: "flex", justifyContent: "center" }}>
                    <Pie data={servicePieData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </Card>
            </Col>

            <Col md="6">
              <Card className="card-bordered h-100">
                <div className="card-inner">
                  <div className="card-title-group mb-4">
                    <div className="card-title">
                      <h6 className="title">Top Providers (Overall Volume)</h6>
                    </div>
                  </div>
                  <div style={{ height: "300px" }}>
                    <Bar data={providerBarData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Block>

        <Block>
          <Card className="card-bordered">
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h6 className="title">Detailed Breakdown by Service & Provider</h6>
                </div>
              </div>
            </div>
            <div className="card-inner p-0">
              <div className="table-responsive">
                <table className="table table-borderless table-striped">
                  <thead>
                    <tr className="tb-tnx-head bg-light">
                      <th>Service</th>
                      <th>Provider</th>
                      <th>Txn Count</th>
                      <th>Total Volume (NGN)</th>
                      <th>Total Profit (NGN)</th>
                      <th>Profit Margin (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.providersPerService.map((serviceGroup, sIdx) => (
                      <React.Fragment key={sIdx}>
                        {serviceGroup.providers.map((provider, pIdx) => (
                          <tr key={`${sIdx}-${pIdx}`}>
                            <td className="text-capitalize fw-bold">
                              {pIdx === 0 ? serviceGroup.service.replaceAll("_", " ") : ""}
                            </td>
                            <td className="text-capitalize">{provider.name}</td>
                            <td>{provider.count}</td>
                            <td>{formatter("NGN").format(provider.volume)}</td>
                            <td>{formatter("NGN").format(provider.profit)}</td>
                            <td>
                              <span className={`text-${provider.profitMargin > 0 ? "success" : "danger"}`}>
                                {provider.profitMargin.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default ServiceComparison;
