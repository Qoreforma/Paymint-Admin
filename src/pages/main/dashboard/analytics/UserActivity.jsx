import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import exportFromJSON from "export-from-json";
import Head from "../../../../layout/head/Head";
import Content from "../../../../layout/content/Content";
import { Icon } from "../../../../components/Component";
import { useGetUserActivity, exportUserActivityApi } from "../../../../api/analytics";
import LoadingSpinner from "../../../components/spinner";
import DateRangeFilter from "../tables/date-range-filter";
import { formatter } from "../../../../utils/Utils";
import "./user-activity.css";

const TRANSACTED_OPTIONS = [
  { label: "All Users", value: "all" },
  { label: "Transacted Only", value: "transacted" },
  { label: "Not Transacted", value: "not_transacted" },
];

const ACTIVITY_OPTIONS = [
  { label: "All Activity", value: "all" },
  { label: "Active in 7 Days", value: "active_7d" },
  { label: "Active in 30 Days", value: "active_30d" },
  { label: "Dormant (>30d / Never)", value: "dormant" },
];

const LIMIT_OPTIONS = [20, 50, 100];

const UserActivity = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query state
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const transacted = searchParams.get("transacted") || "all";
  const activityStatus = searchParams.get("activityStatus") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search") || "";

  // Local UI state
  const [searchInput, setSearchInput] = useState(search);
  const [isExporting, setIsExporting] = useState(false);

  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      if (key !== "page") {
        next.set("page", "1"); // Reset page on filter changes
      }
      return next;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter("search", searchInput.trim());
  };

  // Query hook
  const { data: response, isLoading, isFetching, refetch } = useGetUserActivity({
    startDate,
    endDate,
    transacted,
    activityStatus,
    search,
    page,
    limit,
  });

  const activityData = response?.data?.data || null;
  const records = activityData?.records || [];
  const summary = activityData?.summary || {
    totalUsers: 0,
    activeUsers7d: 0,
    activeUsers30d: 0,
    dormantUsers: 0,
    transactedUsers: 0,
    transactedRate: 0,
    dropoffAfterSignupDay: 0,
    medianDaysToFirstTxn: null,
    averageDaysToFirstTxn: null,
    averageSpendPerUser: 0,
    totalSpend: 0,
  };

  // Full CSV / Excel Export (up to 5,000 matching records with ZERO PII)
  const handleExport = async (exportFormat = "csv") => {
    setIsExporting(true);
    try {
      const exportRecords = await exportUserActivityApi({
        startDate,
        endDate,
        transacted,
        activityStatus,
        search,
      });

      if (!exportRecords || !exportRecords.length) return;

      const fileName = `paymint-user-activity-${new Date().toISOString().split("T")[0]}`;
      const exportRows = exportRecords.map((r) => ({
        "Anonymized User ID": r.anonymizedUserId,
        "Signup Date (WAT)": r.signupAt,
        "Last Login Date (WAT)": r.lastLoginAt || "Never",
        "Days Since Signup": r.daysSinceSignup,
        "Days Since Last Login": r.daysSinceLastLogin ?? "Never",
        "Has Transacted": r.hasTransacted ? "Yes" : "No",
        "First Transaction Date (WAT)": r.firstTransactionAt || "None",
        "Days to First Transaction": r.daysToFirstTransaction ?? "N/A",
        "Total Transactions": r.totalTransactions,
        "Total Spend (NGN)": r.totalSpend,
        "Status": r.status,
        "User Type": r.userType,
      }));

      const exportType = exportFormat === "xls" ? exportFromJSON.types.xls : exportFromJSON.types.csv;
      exportFromJSON({ data: exportRows, fileName, exportType });
    } catch (err) {
      console.error("User activity export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="uac-wrapper">
      <Head title="User Activity Analytics | Paymint Admin" />
      <Content>
        {/* Header Block */}
        <div className="uac-header-block">
          <div>
            <h2 className="uac-title">User Activity & Retention Behavior</h2>
            <p className="uac-subtitle">
              Anonymized user lifecycle cohorts, post-signup drop-off, time-to-first-transaction, and spending activity.
            </p>
          </div>
          <div className="uac-actions">
            <button
              type="button"
              className="uac-btn uac-btn-outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <span>{isFetching ? "Refreshing..." : "🔄 Refresh"}</span>
            </button>
            <button
              type="button"
              className="uac-btn uac-btn-export"
              onClick={() => handleExport("csv")}
              disabled={isExporting || isLoading || summary.totalUsers === 0}
              title="Download anonymized activity report as CSV (Zero PII)"
            >
              <Icon name="download-cloud" />
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
            </button>
            <button
              type="button"
              className="uac-btn uac-btn-export-excel"
              onClick={() => handleExport("xls")}
              disabled={isExporting || isLoading || summary.totalUsers === 0}
              title="Download anonymized activity report as Excel"
            >
              <Icon name="file-excel" />
              <span>{isExporting ? "Exporting..." : "Export Excel"}</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Cards Grid */}
        <div className="uac-kpi-grid">
          <div className="uac-kpi-card">
            <div className="uac-kpi-header">
              <span className="uac-kpi-label">Users in Scope</span>
              <div className="uac-kpi-icon-badge uac-kpi-icon-primary">👥</div>
            </div>
            <h3 className="uac-kpi-value">{summary.totalUsers.toLocaleString()}</h3>
            <span className="uac-kpi-subtext">Total matched users</span>
          </div>

          <div className="uac-kpi-card">
            <div className="uac-kpi-header">
              <span className="uac-kpi-label">Transacted Rate</span>
              <div className="uac-kpi-icon-badge uac-kpi-icon-success">💳</div>
            </div>
            <h3 className="uac-kpi-value" style={{ color: "#059669" }}>
              {summary.transactedRate}%
            </h3>
            <span className="uac-kpi-subtext">
              {summary.transactedUsers.toLocaleString()} transacting users
            </span>
          </div>

          <div className="uac-kpi-card">
            <div className="uac-kpi-header">
              <span className="uac-kpi-label">7-Day Active</span>
              <div className="uac-kpi-icon-badge uac-kpi-icon-info">⚡</div>
            </div>
            <h3 className="uac-kpi-value">{summary.activeUsers7d.toLocaleString()}</h3>
            <span className="uac-kpi-subtext">
              {summary.totalUsers > 0
                ? `${((summary.activeUsers7d / summary.totalUsers) * 100).toFixed(1)}% of scope`
                : "0%"}
            </span>
          </div>

          <div className="uac-kpi-card">
            <div className="uac-kpi-header">
              <span className="uac-kpi-label">Drop-off (Day 0)</span>
              <div className="uac-kpi-icon-badge uac-kpi-icon-danger">📉</div>
            </div>
            <h3 className="uac-kpi-value" style={{ color: summary.dropoffAfterSignupDay > 50 ? "#dc2626" : "#475569" }}>
              {summary.dropoffAfterSignupDay}%
            </h3>
            <span className="uac-kpi-subtext">Never logged in after Day 0</span>
          </div>

          <div className="uac-kpi-card">
            <div className="uac-kpi-header">
              <span className="uac-kpi-label">TimeTo 1st Txn</span>
              <div className="uac-kpi-icon-badge uac-kpi-icon-warning">⏱️</div>
            </div>
            <h3 className="uac-kpi-value">
              {summary.medianDaysToFirstTxn !== null ? `${summary.medianDaysToFirstTxn}d` : "—"}
            </h3>
            <span className="uac-kpi-subtext">
              {summary.averageDaysToFirstTxn !== null ? `Avg: ${summary.averageDaysToFirstTxn} days` : "No txns"}
            </span>
          </div>

          <div className="uac-kpi-card">
            <div className="uac-kpi-header">
              <span className="uac-kpi-label">Avg User Spend</span>
              <div className="uac-kpi-icon-badge uac-kpi-icon-success">💰</div>
            </div>
            <h3 className="uac-kpi-value">
              ₦{summary.averageSpendPerUser > 1000 ? `${(summary.averageSpendPerUser / 1000).toFixed(1)}k` : summary.averageSpendPerUser}
            </h3>
            <span className="uac-kpi-subtext">
              Total GMV: ₦{(summary.totalSpend / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Toolbar & Filter Card */}
        <div className="uac-toolbar-card">
          <div className="uac-control-group">
            {/* Transacted Toggle */}
            <div className="uac-segmented">
              {TRANSACTED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`uac-segmented-btn ${transacted === opt.value ? "active" : ""}`}
                  onClick={() => updateFilter("transacted", opt.value)}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Activity Dropdown */}
            <select
              className="uac-select"
              value={activityStatus}
              onChange={(e) => updateFilter("activityStatus", e.target.value)}
            >
              {ACTIVITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <DateRangeFilter />
          </div>

          <div className="uac-control-group">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "6px" }}>
              <input
                type="text"
                className="uac-search-input"
                placeholder="Search User ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="uac-btn uac-btn-outline" style={{ padding: "6px 10px" }}>
                <Icon name="search" />
              </button>
            </form>

            {/* Per-Page Selector */}
            <select
              className="uac-select"
              value={limit}
              onChange={(e) => updateFilter("limit", e.target.value)}
            >
              {LIMIT_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Activity Table Card */}
        <div className="uac-card">
          <div className="uac-card-header">
            <div>
              <h5 className="uac-card-title">Anonymized User Activity Roster</h5>
              <p className="uac-card-subtitle">
                Showing {records.length} of {activityData?.totalRecords?.toLocaleString() || 0} users (Africa/Lagos WAT timestamps).
              </p>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={() => handleExport("csv")}
                disabled={isExporting || isLoading || summary.totalUsers === 0}
              >
                <Icon name="download-cloud" />
                <span>Export Dataset</span>
              </button>
            </div>
          </div>

          <div className="uac-table-wrapper">
            <table className="uac-table">
              <thead>
                <tr>
                  <th>Anonymized ID</th>
                  <th>Joined (WAT)</th>
                  <th>Days Since Signup</th>
                  <th>Last Login (WAT)</th>
                  <th>Days Since Login</th>
                  <th>Transacted?</th>
                  <th>First Txn (WAT)</th>
                  <th>Days to 1st Txn</th>
                  <th>Total Txns</th>
                  <th>Total Spend</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: "50px" }}>
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      No user activity records found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.anonymizedUserId}>
                      <td>
                        <span className="uac-id-badge">{r.anonymizedUserId}</span>
                      </td>
                      <td>
                        <span>{r.signupAt}</span>
                      </td>
                      <td>
                        <span className="uac-badge-days">{r.daysSinceSignup}d ago</span>
                      </td>
                      <td>
                        {r.lastLoginAt ? (
                          <span>{r.lastLoginAt}</span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Never</span>
                        )}
                      </td>
                      <td>
                        {r.daysSinceLastLogin !== null ? (
                          <span style={{ color: r.daysSinceLastLogin > 30 ? "#dc2626" : "#334155" }}>
                            {r.daysSinceLastLogin}d ago
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td>
                        {r.hasTransacted ? (
                          <span className="uac-badge-yes">Yes</span>
                        ) : (
                          <span className="uac-badge-no">No</span>
                        )}
                      </td>
                      <td>
                        {r.firstTransactionAt ? (
                          <span>{r.firstTransactionAt}</span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td>
                        {r.daysToFirstTransaction !== null ? (
                          <span className="uac-badge-days">
                            {r.daysToFirstTransaction === 0 ? "Same day" : `${r.daysToFirstTransaction}d`}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td>
                        <b>{r.totalTransactions}</b>
                      </td>
                      <td>
                        <b>{formatter("NGN").format(r.totalSpend)}</b>
                      </td>
                      <td>
                        <span
                          className={`badge badge-dot badge-${
                            r.status === "active"
                              ? "success"
                              : r.status === "suspended"
                              ? "danger"
                              : "secondary"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {activityData && activityData.totalPages > 1 && (
            <div className="uac-pagination-bar">
              <div className="uac-page-info">
                Page <b>{activityData.page}</b> of <b>{activityData.totalPages}</b> (Total{" "}
                <b>{activityData.totalRecords.toLocaleString()}</b> users)
              </div>
              <div className="uac-page-buttons">
                <button
                  type="button"
                  className="uac-page-btn"
                  onClick={() => updateFilter("page", page - 1)}
                  disabled={page <= 1}
                >
                  &laquo; Prev
                </button>

                {Array.from({ length: Math.min(5, activityData.totalPages) }, (_, i) => {
                  let pageNum;
                  if (activityData.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= activityData.totalPages - 2) {
                    pageNum = activityData.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`uac-page-btn ${pageNum === page ? "active" : ""}`}
                      onClick={() => updateFilter("page", pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="uac-page-btn"
                  onClick={() => updateFilter("page", page + 1)}
                  disabled={page >= activityData.totalPages}
                >
                  Next &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </Content>
    </div>
  );
};

export default UserActivity;
