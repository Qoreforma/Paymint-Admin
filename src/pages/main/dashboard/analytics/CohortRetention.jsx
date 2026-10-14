import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import exportFromJSON from "export-from-json";
import Head from "../../../../layout/head/Head";
import { useGetCohortAnalytics } from "../../../../api/analytics";
import LoadingSpinner from "../../../components/spinner";
import "./cohort-retention.css";

const WEEKS_OPTIONS = [
  { label: "8 Weeks", value: 8 },
  { label: "12 Weeks (Quarter)", value: 12 },
  { label: "24 Weeks (Half Year)", value: 24 },
  { label: "52 Weeks (Full Year)", value: 52 },
];

const PERIOD_OPTIONS = [
  { label: "Weekly Cohorts", value: "weekly" },
  { label: "Monthly Cohorts", value: "monthly" },
];

const METRIC_TABS = [
  { id: "percentage", label: "Retention Rate (%)" },
  { id: "users", label: "Active Users (Count)" },
  { id: "volume", label: "GMV Volume (₦)" },
  { id: "profit", label: "Net Profit (₦)" },
];

const CHANNEL_OPTIONS = [
  { label: "All Channels", value: "" },
  { label: "iOS App", value: "ios" },
  { label: "Android App", value: "android" },
  { label: "Web Portal", value: "web" },
];

const CohortRetention = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view filters
  const period = searchParams.get("period") || "weekly";
  const mode = searchParams.get("mode") || "transactional";
  const weeks = parseInt(searchParams.get("weeks") || "12", 10);
  const channel = searchParams.get("channel") || "";
  const userType = searchParams.get("userType") || "";

  // UI state
  const [activeMetric, setActiveMetric] = useState("percentage");
  const [isExporting, setIsExporting] = useState(false);
  const [inspectedCell, setInspectedCell] = useState(null);

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetCohortAnalytics({
    period,
    metric: mode,
    weeks,
    channel,
    userType,
  });

  const cohortData = response?.data?.data || null;

  // Handle filter changes
  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
  };

  // Cell Background Heatmap Styling
  const getCellBgColor = (rate, isPending) => {
    if (isPending) return "#f8fafc";
    if (rate >= 35) return "#047857"; // Deep emerald
    if (rate >= 25) return "#059669"; // Emerald
    if (rate >= 18) return "#10b981"; // Medium emerald
    if (rate >= 12) return "#34d399"; // Soft emerald
    if (rate >= 7) return "#6ee7b7";  // Light emerald
    if (rate >= 3) return "#a7f3d0";  // Very light emerald
    if (rate > 0) return "#d1fae5";   // Subtle tint
    return "#f1f5f9"; // Neutral light gray for 0%
  };

  const getCellTextColor = (rate, isPending) => {
    if (isPending) return "#94a3b8";
    if (rate >= 18) return "#ffffff";
    if (rate >= 7) return "#065f46";
    if (rate > 0) return "#047857";
    return "#64748b";
  };

  // Format cell value depending on active metric tab
  const renderCellValue = (bucket) => {
    if (bucket.isPending) {
      return "—";
    }

    switch (activeMetric) {
      case "users":
        return bucket.activeUsers > 0 ? bucket.activeUsers.toLocaleString() : "0";
      case "volume":
        return bucket.volume > 0 ? `₦${(bucket.volume / 1000).toFixed(0)}k` : "₦0";
      case "profit":
        return bucket.profit > 0 ? `₦${(bucket.profit / 1000).toFixed(0)}k` : "₦0";
      case "percentage":
      default:
        return `${bucket.retentionRate}%`;
    }
  };

  // Export to CSV or Excel
  const handleExport = (exportFormat = "csv") => {
    if (!cohortData || !cohortData.cohorts) return;
    setIsExporting(true);

    try {
      const fileName = `paymint-cohort-retention-${mode}-${period}-${weeks}w-${new Date().toISOString().split("T")[0]}`;
      const maxBuckets = cohortData.maxBuckets || 12;

      // Map rows for clean spreadsheet consumption
      const exportRows = cohortData.cohorts.map((row) => {
        const rowObj = {
          "Cohort Week": row.label,
          "Start Date": row.startDate,
          "End Date": row.endDate,
          "Total Signups": row.totalSignups,
        };

        // Add columns for each relative week
        for (let b = 0; b < maxBuckets; b++) {
          const bucket = row.retention[b];
          const colHeader = period === "monthly" ? `Month ${b}` : `Week ${b}`;
          if (bucket.isPending) {
            rowObj[`${colHeader} (%)`] = "Pending";
            rowObj[`${colHeader} (Active Users)`] = "-";
            rowObj[`${colHeader} (Volume NGN)`] = "-";
            rowObj[`${colHeader} (Profit NGN)`] = "-";
          } else {
            rowObj[`${colHeader} (%)`] = `${bucket.retentionRate}%`;
            rowObj[`${colHeader} (Active Users)`] = bucket.activeUsers;
            rowObj[`${colHeader} (Volume NGN)`] = bucket.volume;
            rowObj[`${colHeader} (Profit NGN)`] = bucket.profit;
          }
        }

        return rowObj;
      });

      // Add Benchmark Summary Row at bottom
      const benchmarkRow = {
        "Cohort Week": "PLATFORM AVERAGE BENCHMARK",
        "Start Date": "-",
        "End Date": "-",
        "Total Signups": cohortData.totalSignups,
      };

      for (let b = 0; b < maxBuckets; b++) {
        const bm = cohortData.benchmarks[b];
        const colHeader = period === "monthly" ? `Month ${b}` : `Week ${b}`;
        benchmarkRow[`${colHeader} (%)`] = `${bm?.averageRate || 0}%`;
        benchmarkRow[`${colHeader} (Active Users)`] = bm?.totalActiveUsers || 0;
        benchmarkRow[`${colHeader} (Volume NGN)`] = "-";
        benchmarkRow[`${colHeader} (Profit NGN)`] = "-";
      }

      exportRows.push(benchmarkRow);

      const exportType =
        exportFormat === "xls" ? exportFromJSON.types.xls : exportFromJSON.types.csv;

      exportFromJSON({
        data: exportRows,
        fileName,
        exportType,
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="chr-wrapper">
      <Head title="Cohort Retention Analysis | Paymint Admin" />

      {/* Header Block */}
      <div className="chr-header-block">
        <div>
          <h2 className="chr-title">Cohort Retention Analysis</h2>
          <p className="chr-subtitle">
            Analyze repeat transactions, user lifetime activity, GMV, and platform profitability by weekly signup cohorts.
          </p>
        </div>
        <div className="chr-actions">
          <button
            type="button"
            className="chr-btn chr-btn-outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <span>{isFetching ? "Refreshing..." : "🔄 Refresh"}</span>
          </button>
          <button
            type="button"
            className="chr-btn chr-btn-export"
            onClick={() => handleExport("csv")}
            disabled={isExporting || isLoading || !cohortData}
          >
            <span>📥 Export CSV</span>
          </button>
          <button
            type="button"
            className="chr-btn chr-btn-export-excel"
            onClick={() => handleExport("xls")}
            disabled={isExporting || isLoading || !cohortData}
          >
            <span>📊 Export Excel</span>
          </button>
        </div>
      </div>

      {/* Top KPI Summary Cards */}
      {cohortData && (
        <div className="chr-kpi-grid">
          <div className="chr-kpi-card">
            <div className="chr-kpi-header">
              <span className="chr-kpi-label">Total Cohort Signups</span>
              <div className="chr-kpi-icon-badge chr-kpi-icon-primary">👥</div>
            </div>
            <h3 className="chr-kpi-value">{cohortData.totalSignups.toLocaleString()}</h3>
            <span className="chr-kpi-subtext">
              Across {cohortData.totalCohorts} {period} cohorts
            </span>
          </div>

          <div className="chr-kpi-card">
            <div className="chr-kpi-header">
              <span className="chr-kpi-label">Week 1 Retention (W1)</span>
              <div className="chr-kpi-icon-badge chr-kpi-icon-success">📈</div>
            </div>
            <h3 className="chr-kpi-value" style={{ color: "#059669" }}>
              {cohortData.summary?.w1AverageRate || 0}%
            </h3>
            <span className="chr-kpi-subtext">Platform 7-day repeat benchmark</span>
          </div>

          <div className="chr-kpi-card">
            <div className="chr-kpi-header">
              <span className="chr-kpi-label">Month 1 Retention (W4)</span>
              <div className="chr-kpi-icon-badge chr-kpi-icon-info">🎯</div>
            </div>
            <h3 className="chr-kpi-value" style={{ color: "#7c3aed" }}>
              {cohortData.summary?.w4AverageRate || 0}%
            </h3>
            <span className="chr-kpi-subtext">Platform 30-day repeat benchmark</span>
          </div>

          <div className="chr-kpi-card">
            <div className="chr-kpi-header">
              <span className="chr-kpi-label">Cohort Total GMV</span>
              <div className="chr-kpi-icon-badge chr-kpi-icon-warning">💰</div>
            </div>
            <h3 className="chr-kpi-value">
              ₦{cohortData.summary?.totalGmv?.toLocaleString() || 0}
            </h3>
            <span className="chr-kpi-subtext" style={{ color: "#059669", fontWeight: 600 }}>
              ₦{cohortData.summary?.totalProfit?.toLocaleString() || 0} platform net profit
            </span>
          </div>
        </div>
      )}

      {/* Toolbar & Filters Card */}
      <div className="chr-toolbar-card">
        {/* Left: Retention Mode & Metric Tabs */}
        <div className="chr-control-group">
          {/* Retention Mode Segmented Switcher */}
          <div className="chr-segmented">
            <button
              type="button"
              className={`chr-segmented-btn ${mode === "transactional" ? "active-dark" : ""}`}
              onClick={() => updateFilter("mode", "transactional")}
            >
              <span>💳 Transacting Retention</span>
            </button>
            <button
              type="button"
              className={`chr-segmented-btn ${mode === "engagement" ? "active-dark" : ""}`}
              onClick={() => updateFilter("mode", "engagement")}
            >
              <span>📱 App Logins / Activity</span>
            </button>
          </div>

          {/* Metric Tab Switcher */}
          <div className="chr-segmented">
            {METRIC_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`chr-segmented-btn ${activeMetric === tab.id ? "active" : ""}`}
                onClick={() => setActiveMetric(tab.id)}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Dropdown Filters */}
        <div className="chr-control-group">
          {/* Period (Weekly / Monthly) */}
          <select
            className="chr-select"
            value={period}
            onChange={(e) => updateFilter("period", e.target.value)}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Duration Weeks */}
          <select
            className="chr-select"
            value={weeks}
            onChange={(e) => updateFilter("weeks", e.target.value)}
          >
            {WEEKS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Channel */}
          <select
            className="chr-select"
            value={channel}
            onChange={(e) => updateFilter("channel", e.target.value)}
          >
            {CHANNEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Quick Export in Toolbar */}
          <div className="chr-toolbar-export-group">
            <button
              type="button"
              className="chr-btn chr-btn-export"
              onClick={() => handleExport("csv")}
              disabled={isExporting || isLoading || !cohortData}
              title="Download cohort matrix as CSV"
            >
              <span>📥 Export CSV</span>
            </button>
            <button
              type="button"
              className="chr-btn chr-btn-export-excel"
              onClick={() => handleExport("xls")}
              disabled={isExporting || isLoading || !cohortData}
              title="Download cohort matrix as Excel"
            >
              <span>📊 Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Inspector Banner (Shows Cell Details on Click/Hover) */}
      {inspectedCell && (
        <div className="chr-inspector-banner">
          <div className="chr-inspector-title">
            <span>🔍 Inspecting:</span>
            <b>{inspectedCell.cohortLabel}</b>
            <span style={{ color: "#64748b" }}>
              ({period === "monthly" ? "Month" : "Week"} {inspectedCell.bucketIndex})
            </span>
          </div>
          <div className="chr-inspector-metrics">
            <div className="chr-inspector-metric-item">
              <span>Active Users:</span>
              <b>
                {inspectedCell.activeUsers} / {inspectedCell.totalSignups} ({inspectedCell.retentionRate}%)
              </b>
            </div>
            {mode === "transactional" && (
              <>
                <div className="chr-inspector-metric-item">
                  <span>GMV:</span>
                  <b>₦{inspectedCell.volume.toLocaleString()}</b>
                </div>
                <div className="chr-inspector-metric-item">
                  <span>Net Profit:</span>
                  <b style={{ color: "#059669" }}>₦{inspectedCell.profit.toLocaleString()}</b>
                </div>
              </>
            )}
            <div className="chr-inspector-metric-item">
              <span>Transactions / Actions:</span>
              <b>{inspectedCell.txnCount.toLocaleString()}</b>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Table Outer Shell */}
      <div className="chr-table-outer">
        {isLoading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <LoadingSpinner />
            <p style={{ marginTop: "14px", color: "#64748b", fontSize: "13px" }}>
              Calculating cohort retention matrices...
            </p>
          </div>
        ) : !cohortData || cohortData.cohorts.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📊</div>
            <h5 style={{ color: "#0f172a" }}>No Cohort Data Found</h5>
            <p style={{ fontSize: "13px" }}>
              Try selecting a wider date range or clearing channel filters.
            </p>
          </div>
        ) : (
          <div className="chr-table-scroll">
            <table className="chr-table">
              <thead>
                <tr>
                  <th className="chr-col-cohort chr-th-top chr-th-cohort">
                    Cohort (Signup Window)
                  </th>
                  <th className="chr-col-users chr-th-top chr-th-users">
                    Signups
                  </th>
                  {Array.from({ length: cohortData.maxBuckets }).map((_, bIdx) => (
                    <th key={bIdx} className="chr-col-bucket chr-th-top">
                      {period === "monthly" ? `M${bIdx}` : `W${bIdx}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Cohort Rows */}
                {cohortData.cohorts.map((row, rIdx) => (
                  <tr key={row.cohortKey}>
                    {/* Sticky Column 1: Cohort Label */}
                    <td className="chr-col-cohort chr-td-cohort">
                      <span className="chr-cohort-name">{row.label}</span>
                      <span className="chr-cohort-dates">{row.startDate}</span>
                    </td>

                    {/* Sticky Column 2: Cohort Total Users */}
                    <td className="chr-col-users chr-td-users">
                      {row.totalSignups.toLocaleString()}
                    </td>

                    {/* Relative Week Tiles */}
                    {row.retention.map((bucket) => {
                      const rate = bucket.retentionRate;
                      const bgColor = getCellBgColor(rate, bucket.isPending);
                      const textColor = getCellTextColor(rate, bucket.isPending);
                      const isInspected =
                        inspectedCell?.cohortKey === row.cohortKey &&
                        inspectedCell?.bucketIndex === bucket.bucketIndex;

                      return (
                        <td
                          key={bucket.bucketIndex}
                          className={`chr-col-bucket chr-td-tile ${
                            !bucket.isPending ? "clickable" : ""
                          } ${isInspected ? "inspected" : ""}`}
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            fontWeight: rate >= 15 ? 700 : 500,
                          }}
                          onClick={() => {
                            if (!bucket.isPending) {
                              setInspectedCell({
                                cohortKey: row.cohortKey,
                                cohortLabel: row.label,
                                totalSignups: row.totalSignups,
                                bucketIndex: bucket.bucketIndex,
                                activeUsers: bucket.activeUsers,
                                retentionRate: bucket.retentionRate,
                                volume: bucket.volume,
                                profit: bucket.profit,
                                txnCount: bucket.txnCount,
                              });
                            }
                          }}
                          title={
                            !bucket.isPending
                              ? `${row.label} (${
                                  period === "monthly" ? "Month" : "Week"
                                } ${bucket.bucketIndex})\n` +
                                `Active Users: ${bucket.activeUsers} / ${row.totalSignups} (${bucket.retentionRate}%)\n` +
                                `GMV Volume: ₦${bucket.volume.toLocaleString()}\n` +
                                `Net Profit: ₦${bucket.profit.toLocaleString()}\n` +
                                `Transactions: ${bucket.txnCount}`
                              : "Pending (Future period)"
                          }
                        >
                          {renderCellValue(bucket)}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Benchmark Row (Sticky Bottom) */}
                <tr className="chr-tr-benchmark">
                  <td className="chr-col-cohort chr-td-benchmark-cohort">
                    ⭐ Platform Average
                  </td>
                  <td className="chr-col-users chr-td-benchmark-users">
                    {cohortData.totalSignups.toLocaleString()}
                  </td>
                  {cohortData.benchmarks.map((bm) => (
                    <td
                      key={bm.bucketIndex}
                      className="chr-col-bucket chr-td-benchmark-tile"
                      style={{
                        backgroundColor: bm.averageRate >= 20 ? "#d1fae5" : "#f1f5f9",
                        color: bm.averageRate >= 15 ? "#047857" : "#0f172a",
                      }}
                      title={`Average across all cohorts: ${bm.averageRate}%\nTotal Active Users: ${bm.totalActiveUsers.toLocaleString()}`}
                    >
                      {activeMetric === "percentage"
                        ? `${bm.averageRate}%`
                        : activeMetric === "users"
                        ? bm.totalActiveUsers.toLocaleString()
                        : `${bm.averageRate}%`}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Legend Footer */}
        <div className="chr-legend-footer">
          <div className="chr-legend-scale">
            <span style={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Retention Scale:
            </span>
            <span className="chr-legend-item" style={{ background: "#f1f5f9", color: "#64748b" }}>0%</span>
            <span className="chr-legend-item" style={{ background: "#d1fae5", color: "#047857" }}>1-6%</span>
            <span className="chr-legend-item" style={{ background: "#a7f3d0", color: "#047857" }}>7-11%</span>
            <span className="chr-legend-item" style={{ background: "#34d399", color: "#065f46" }}>12-17%</span>
            <span className="chr-legend-item" style={{ background: "#10b981", color: "#ffffff" }}>18-24%</span>
            <span className="chr-legend-item" style={{ background: "#059669", color: "#ffffff" }}>25-34%</span>
            <span className="chr-legend-item" style={{ background: "#047857", color: "#ffffff" }}>35%+</span>
          </div>
          <span style={{ color: "#94a3b8" }}>
            Click any cell to lock details in the top Inspector Banner. First two columns remain frozen on scroll.
          </span>
        </div>
      </div>
    </div>
  );
};

export default CohortRetention;
