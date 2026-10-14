import React from "react";
import { Spinner } from "reactstrap";
import "./analytics-common.css";

/**
 * High-visibility top animated progress bar fixed to viewport top
 */
export const AnalyticsTopBar = ({ isFetching }) => {
  if (!isFetching) return null;
  return <div className="analytics-top-loader" aria-hidden="true" />;
};

/**
 * Animated pill badge for headers/toolbars showing active background fetch
 */
export const AnalyticsFetchingPill = ({ isFetching, label = "Updating live data..." }) => {
  if (!isFetching) return null;
  return (
    <div className="analytics-fetching-pill" role="status" aria-live="polite">
      <Spinner size="sm" color="primary" style={{ width: "0.85rem", height: "0.85rem", borderWidth: "2px" }} />
      <span>{label}</span>
    </div>
  );
};

/**
 * Non-destructive semi-transparent frosted overlay placed on cards/charts/tables while fetching
 */
export const AnalyticsCardOverlay = ({ isFetching, message = "Loading updated metrics..." }) => {
  if (!isFetching) return null;
  return (
    <div className="analytics-card-overlay" role="status" aria-live="polite">
      <div className="analytics-overlay-badge">
        <Spinner size="sm" color="primary" style={{ width: "0.95rem", height: "0.95rem", borderWidth: "2px" }} />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default {
  AnalyticsTopBar,
  AnalyticsFetchingPill,
  AnalyticsCardOverlay,
};
