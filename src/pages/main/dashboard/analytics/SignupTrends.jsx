import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import exportFromJSON from "export-from-json";
import Head from "../../../../layout/head/Head";
import Content from "../../../../layout/content/Content";
import { Icon } from "../../../../components/Component";
import { useGetSignupTrends } from "../../../../api/analytics";
import LoadingSpinner from "../../../components/spinner";
import DateRangeFilter from "../tables/date-range-filter";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./signup-trends.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PRESET_OPTIONS = [
  { label: "Last 7 Days", value: "7d", days: 7 },
  { label: "Last 30 Days", value: "30d", days: 30 },
  { label: "Last 90 Days", value: "90d", days: 90 },
  { label: "This Year", value: "1y", days: 365 },
];

const GRANULARITY_OPTIONS = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
];

const SignupTrends = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from query params
  const granularity = searchParams.get("granularity") || "day";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const compare = searchParams.get("compare") === "true";

  // Local UI state
  const [chartType, setChartType] = useState("line"); // "line" | "bar"
  const [isExporting, setIsExporting] = useState(false);

  // Helper to format ISO date string to Lagos YYYY-MM-DD
  const formatLagosDate = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // Quick preset period change
  const handlePresetChange = (presetValue) => {
    const selected = PRESET_OPTIONS.find((p) => p.value === presetValue);
    if (!selected) return;

    const today = new Date();
    const endStr = formatLagosDate(today);

    const past = new Date();
    past.setDate(past.getDate() - (selected.days - 1));
    const startStr = formatLagosDate(past);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("startDate", startStr);
      next.set("endDate", endStr);
      next.set("preset", presetValue);
      return next;
    });
  };

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    });
  };

  // Fetch signup trends data
  const { data: response, isLoading, isFetching, refetch } = useGetSignupTrends({
    granularity,
    startDate,
    endDate,
    compare,
  });

  const trendsData = response?.data?.data || null;

  // Build Chart Data
  const chartConfig = useMemo(() => {
    if (!trendsData || !trendsData.series) {
      return { labels: [], datasets: [] };
    }

    const labels = trendsData.series.map((item) => item.label);
    const currentCounts = trendsData.series.map((item) => item.count);

    const datasets = [
      {
        label: compare ? "Current Period" : "New Signups",
        data: currentCounts,
        borderColor: "#007bff",
        backgroundColor: chartType === "bar" ? "#007bff" : "rgba(0, 123, 255, 0.12)",
        borderWidth: 2,
        tension: 0.35,
        fill: chartType === "line",
        pointBackgroundColor: "#007bff",
        pointRadius: trendsData.series.length > 45 ? 1 : 4,
        pointHoverRadius: 6,
      },
    ];

    if (compare && trendsData.comparison?.series) {
      const prevCounts = trendsData.comparison.series.map((item) => item.count);
      datasets.push({
        label: "Previous Period",
        data: prevCounts,
        borderColor: "#94a3b8",
        backgroundColor: chartType === "bar" ? "#cbd5e1" : "rgba(148, 163, 184, 0.1)",
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.35,
        fill: false,
        pointBackgroundColor: "#94a3b8",
        pointRadius: trendsData.comparison.series.length > 45 ? 1 : 3,
        pointHoverRadius: 5,
      });
    }

    return { labels, datasets };
  }, [trendsData, compare, chartType]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          boxWidth: 12,
          font: { size: 12, weight: "500" },
          color: "#475569",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#0f172a",
        titleFont: { size: 12, weight: "600" },
        bodyFont: { size: 12 },
        padding: 10,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y ?? 0;
            return ` ${label}: ${value.toLocaleString()} users`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: "#64748b",
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 14,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: {
          precision: 0,
          font: { size: 11 },
          color: "#64748b",
        },
      },
    },
  };

  // Export strictly anonymized aggregated signup data (Zero PII)
  const handleExport = (exportFormat = "csv") => {
    if (!trendsData || !trendsData.series?.length) return;
    setIsExporting(true);

    try {
      const fileName = `paymint-signup-trends-${granularity}-${trendsData.startDate}-to-${trendsData.endDate}`;
      const pairedList = trendsData.comparison?.paired || [];

      const exportRows = trendsData.series.map((item, idx) => {
        const row = {
          date: item.date,
          label: item.label,
          new_users: item.count,
          cumulative_users: item.cumulative,
        };

        if (compare && pairedList[idx]) {
          const pair = pairedList[idx];
          row.previous_period_date = pair.previous?.date || "—";
          row.previous_period_users = pair.previous?.count ?? 0;
          row.difference = pair.diff;
          row.percentage_growth = `${pair.percentageChange}%`;
        }

        return row;
      });

      const exportType = exportFormat === "xls" ? exportFromJSON.types.xls : exportFromJSON.types.csv;
      exportFromJSON({ data: exportRows, fileName, exportType });
    } catch (err) {
      console.error("Signup trends export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const summary = trendsData?.summary || {
    currentTotal: 0,
    dailyAverage: 0,
    peakCount: 0,
  };

  const currentPreset = searchParams.get("preset") || (!startDate && !endDate ? "30d" : "");

  return (
    <div className="sut-wrapper">
      <Head title="Signup Trends Analytics | Paymint Admin" />
      <Content>
        {/* Header Block */}
        <div className="sut-header-block">
          <div>
            <h2 className="sut-title">Signup Trends Analytics</h2>
            <p className="sut-subtitle">
              Acquisition metrics, period-over-period comparison, and zero-gap intake trends in Africa/Lagos (WAT, UTC+1).
            </p>
          </div>
          <div className="sut-actions">
            <button
              type="button"
              className="sut-btn sut-btn-outline"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh data"
            >
              <span>{isFetching ? "Refreshing..." : "🔄 Refresh"}</span>
            </button>
            <button
              type="button"
              className="sut-btn sut-btn-export"
              onClick={() => handleExport("csv")}
              disabled={isExporting || isLoading || !trendsData?.series?.length}
              title="Export Signup Intake Data as CSV (Zero PII)"
            >
              <Icon name="download-cloud" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              className="sut-btn sut-btn-export-excel"
              onClick={() => handleExport("xls")}
              disabled={isExporting || isLoading || !trendsData?.series?.length}
              title="Export Signup Intake Data as Excel"
            >
              <Icon name="file-excel" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="sut-kpi-grid">
          <div className="sut-kpi-card">
            <div className="sut-kpi-header">
              <span className="sut-kpi-label">Total New Users</span>
              <div className="sut-kpi-icon-badge sut-kpi-icon-primary">👥</div>
            </div>
            <h3 className="sut-kpi-value">{summary.currentTotal.toLocaleString()}</h3>
            <span className="sut-kpi-subtext">
              {compare && summary.growthRate !== undefined ? (
                <span className={summary.growthRate >= 0 ? "sut-badge-positive" : "sut-badge-negative"}>
                  {summary.growthRate >= 0 ? `+${summary.growthRate}%` : `${summary.growthRate}%`} vs prior period
                </span>
              ) : (
                `In selected ${granularity} timeframe`
              )}
            </span>
          </div>

          <div className="sut-kpi-card">
            <div className="sut-kpi-header">
              <span className="sut-kpi-label">Average Inflow</span>
              <div className="sut-kpi-icon-badge sut-kpi-icon-success">⚡</div>
            </div>
            <h3 className="sut-kpi-value">{summary.dailyAverage.toLocaleString()}</h3>
            <span className="sut-kpi-subtext">Avg signups per calendar day</span>
          </div>

          <div className="sut-kpi-card">
            <div className="sut-kpi-header">
              <span className="sut-kpi-label">Peak Acquisition Day</span>
              <div className="sut-kpi-icon-badge sut-kpi-icon-warning">🚀</div>
            </div>
            <h3 className="sut-kpi-value">{summary.peakCount.toLocaleString()}</h3>
            <span className="sut-kpi-subtext">
              {summary.peakDate ? `Highest on ${summary.peakDate}` : "No signups recorded"}
            </span>
          </div>

          <div className="sut-kpi-card">
            <div className="sut-kpi-header">
              <span className="sut-kpi-label">Timezone & Range</span>
              <div className="sut-kpi-icon-badge sut-kpi-icon-info">🕒</div>
            </div>
            <h3 className="sut-kpi-value" style={{ fontSize: "16px", paddingTop: "4px" }}>
              {trendsData ? `${trendsData.startDate} → ${trendsData.endDate}` : "Africa/Lagos"}
            </h3>
            <span className="sut-kpi-subtext">WAT (UTC+1) Day Boundaries</span>
          </div>
        </div>

        {/* Controls & Filter Toolbar */}
        <div className="sut-toolbar-card">
          {/* Left: Preset Buttons & Date Filter */}
          <div className="sut-control-group">
            <div className="sut-segmented">
              {PRESET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`sut-segmented-btn ${currentPreset === opt.value ? "active" : ""}`}
                  onClick={() => handlePresetChange(opt.value)}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <DateRangeFilter />
          </div>

          {/* Right: Granularity, Chart Type, Compare Toggle */}
          <div className="sut-control-group">
            {/* Granularity Switcher */}
            <div className="sut-segmented">
              {GRANULARITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`sut-segmented-btn ${granularity === opt.value ? "active" : ""}`}
                  onClick={() => updateParam("granularity", opt.value)}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Chart Type Toggle */}
            <div className="sut-segmented">
              <button
                type="button"
                className={`sut-segmented-btn ${chartType === "line" ? "active" : ""}`}
                onClick={() => setChartType("line")}
                title="Line Chart"
              >
                <span>📈 Line</span>
              </button>
              <button
                type="button"
                className={`sut-segmented-btn ${chartType === "bar" ? "active" : ""}`}
                onClick={() => setChartType("bar")}
                title="Bar Chart"
              >
                <span>📊 Bar</span>
              </button>
            </div>

            {/* Compare Previous Period Toggle */}
            <button
              type="button"
              className={`sut-toggle-compare ${compare ? "active" : ""}`}
              onClick={() => updateParam("compare", !compare)}
              title="Compare with prior period of equal length"
            >
              <span>{compare ? "☑ Comparing Prior Period" : "☐ Compare Prior Period"}</span>
            </button>
          </div>
        </div>

        {/* Main Chart Card */}
        <div className="sut-card">
          <div className="sut-card-header">
            <div>
              <h5 className="sut-card-title">New Users Intake Velocity</h5>
              <p className="sut-card-subtitle">
                {compare
                  ? `Blue: ${trendsData?.startDate} to ${trendsData?.endDate} | Gray dashed: ${trendsData?.comparison?.previousStartDate} to ${trendsData?.comparison?.previousEndDate}`
                  : `Zero-filled ${granularity} signups from ${trendsData?.startDate || "start"} to ${trendsData?.endDate || "end"}`}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge badge-dim badge-outline-primary">
                {trendsData?.series?.length || 0} {granularity} buckets
              </span>
            </div>
          </div>
          <div className="sut-chart-container">
            {isLoading ? (
              <div style={{ padding: "80px 0", textAlign: "center" }}>
                <LoadingSpinner />
                <p style={{ marginTop: "12px", color: "#64748b", fontSize: "13px" }}>
                  Calculating signup intake curves...
                </p>
              </div>
            ) : chartConfig.labels.length === 0 ? (
              <div style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
                <p>No user signups found for this date range.</p>
              </div>
            ) : chartType === "line" ? (
              <Line data={chartConfig} options={chartOptions} />
            ) : (
              <Bar data={chartConfig} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Detailed Breakdown Table Card */}
        <div className="sut-card">
          <div className="sut-card-header">
            <div>
              <h5 className="sut-card-title">Detailed Intake Breakdown Table</h5>
              <p className="sut-card-subtitle">
                Chronological breakdown of signups and cumulative growth across Lagos calendar intervals.
              </p>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={() => handleExport("csv")}
                disabled={!trendsData?.series?.length}
              >
                <Icon name="download-cloud" />
                <span>Export CSV Table</span>
              </button>
            </div>
          </div>
          <div className="sut-table-wrapper">
            <table className="sut-table">
              <thead>
                <tr>
                  <th>Interval / Date</th>
                  <th>New Users</th>
                  <th>Cumulative</th>
                  <th>% of Period</th>
                  {compare && (
                    <>
                      <th>Prior Period</th>
                      <th>Difference</th>
                      <th>Growth (%)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={compare ? 7 : 4} style={{ textAlign: "center", padding: "40px" }}>
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : !trendsData || trendsData.series.length === 0 ? (
                  <tr>
                    <td colSpan={compare ? 7 : 4} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      No data available for the selected interval.
                    </td>
                  </tr>
                ) : (
                  trendsData.series.map((item, idx) => {
                    const total = summary.currentTotal || 1;
                    const percentOfTotal = ((item.count / total) * 100).toFixed(1);
                    const pair = trendsData.comparison?.paired?.[idx];

                    return (
                      <tr key={item.date}>
                        <td>
                          <b>{item.label}</b>
                          <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>
                            {item.date}
                          </span>
                        </td>
                        <td>
                          <span className="sut-count-badge">{item.count.toLocaleString()}</span>
                        </td>
                        <td>
                          <div className="sut-cum-progress">
                            <span>{item.cumulative.toLocaleString()}</span>
                            <div className="sut-bar-bg">
                              <div
                                className="sut-bar-fill"
                                style={{ width: `${Math.min(100, (item.cumulative / total) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: "#64748b" }}>{percentOfTotal}%</span>
                        </td>
                        {compare && pair && (
                          <>
                            <td>
                              <span style={{ color: "#64748b" }}>
                                {pair.previous?.count?.toLocaleString() ?? 0}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: pair.diff > 0 ? "#059669" : pair.diff < 0 ? "#dc2626" : "#64748b",
                                }}
                              >
                                {pair.diff > 0 ? `+${pair.diff}` : pair.diff}
                              </span>
                            </td>
                            <td>
                              <span
                                className={
                                  pair.percentageChange > 0
                                    ? "sut-badge-positive"
                                    : pair.percentageChange < 0
                                    ? "sut-badge-negative"
                                    : ""
                                }
                              >
                                {pair.percentageChange > 0
                                  ? `+${pair.percentageChange}%`
                                  : `${pair.percentageChange}%`}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Content>
    </div>
  );
};

export default SignupTrends;
