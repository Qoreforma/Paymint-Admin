import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, Spinner, UncontrolledDropdown } from "reactstrap";
import {
  useDeleteProviders,
  useGetProviders,
  useSyncProviderProducts,
  useToggleProviders,
  useUpdateProviders,
  useToggleProviderServiceType,
  useDeleteProviderProducts,
  useCheckProviderBalance,
  useGetProviderBalanceLogs,
  useRefreshProviderBalances,
  useUpdateProviderBalanceSettings,
} from "../../../../api/service-providers";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  Row,
} from "../../../../components/Component";
import NoIcon from "../../../../images/no-image-icon.png";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDate, formatDateWithHyphen, formatDateWithTime, formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import EditProviderLogo from "./edit-logo";
import EditProductTypes from "./edit-product-types";
import ServiceProviderModal from "./form-modal";
import AddProductModal from "./modals/add-product";
import { usePermission } from "../../../../utils/usePermission";

function ProviderLiquidityDetailCard({ provider, onCheckBalance, isChecking, onUpdateProviderData }) {
  const code = (provider.code || provider.name || "").toLowerCase().trim();
  const { data: logsResponse, isLoading: isLoadingLogs } = useGetProviderBalanceLogs(code);
  const { mutate: updateSettings, isLoading: isSavingSettings } = useUpdateProviderBalanceSettings();
  const logs = logsResponse?.data || [];

  const [isAlertsPaused, setIsAlertsPaused] = useState(Boolean(provider.isBalanceAlertsPaused));
  const [showSettings, setShowSettings] = useState(false);
  const [warningVal, setWarningVal] = useState(provider.balanceThresholds?.warning ?? "");
  const [urgentVal, setUrgentVal] = useState(provider.balanceThresholds?.urgent ?? "");
  const [criticalVal, setCriticalVal] = useState(provider.balanceThresholds?.critical ?? "");

  useEffect(() => {
    setIsAlertsPaused(Boolean(provider.isBalanceAlertsPaused));
    setWarningVal(provider.balanceThresholds?.warning ?? "");
    setUrgentVal(provider.balanceThresholds?.urgent ?? "");
    setCriticalVal(provider.balanceThresholds?.critical ?? "");
  }, [provider.code, provider.isBalanceAlertsPaused, provider.balanceThresholds]);

  const directCheckProviders = ["vtung", "vtu.ng", "smeplug", "quicklysim", "pairgate", "bigisub", "coolsub"];
  const canCheckDirectly = directCheckProviders.includes(code);

  const isMuted = isAlertsPaused || !provider.active;

  const handleTogglePause = (e) => {
    const nextVal = e.target.checked;
    setIsAlertsPaused(nextVal);
    updateSettings(
      {
        code,
        payload: {
          isBalanceAlertsPaused: nextVal,
        },
      },
      {
        onSuccess: () => {
          if (onUpdateProviderData) {
            onUpdateProviderData({ isBalanceAlertsPaused: nextVal });
          }
        },
      }
    );
  };

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    const thresholdsPayload = {
      warning: warningVal !== "" && !isNaN(Number(warningVal)) ? Number(warningVal) : null,
      urgent: urgentVal !== "" && !isNaN(Number(urgentVal)) ? Number(urgentVal) : null,
      critical: criticalVal !== "" && !isNaN(Number(criticalVal)) ? Number(criticalVal) : null,
    };

    updateSettings(
      {
        code,
        payload: {
          isBalanceAlertsPaused,
          balanceThresholds: thresholdsPayload,
        },
      },
      {
        onSuccess: () => {
          if (onUpdateProviderData) {
            onUpdateProviderData({
              isBalanceAlertsPaused,
              balanceThresholds: {
                warning: thresholdsPayload.warning ?? undefined,
                urgent: thresholdsPayload.urgent ?? undefined,
                critical: thresholdsPayload.critical ?? undefined,
              },
            });
          }
          setShowSettings(false);
        },
      }
    );
  };

  const effectiveWarning = provider.balanceThresholds?.warning || 10000;
  const effectiveUrgent = provider.balanceThresholds?.urgent || 5000;
  const effectiveCritical = provider.balanceThresholds?.critical || 2000;
  const hasCustomThresholds = Boolean(
    provider.balanceThresholds?.warning ||
    provider.balanceThresholds?.urgent ||
    provider.balanceThresholds?.critical
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "critical":
        return <span className="badge badge-dim bg-danger">Critical (&lt;₦{Number(effectiveCritical).toLocaleString()})</span>;
      case "urgent":
        return <span className="badge badge-dim bg-warning">Urgent (&lt;₦{Number(effectiveUrgent).toLocaleString()})</span>;
      case "warning":
        return <span className="badge badge-dim bg-info">Low (&lt;₦{Number(effectiveWarning).toLocaleString()})</span>;
      default:
        return <span className="badge badge-dim bg-success">Healthy</span>;
    }
  };

  return (
    <div className="mt-4 p-3 rounded-3 border bg-light">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h6 className="mb-0 d-flex align-items-center gap-2 flex-wrap">
            <span>Upstream Wallet Liquidity</span>
            {getStatusBadge(provider.balanceStatus)}
            {isMuted && (
              <span className="badge badge-dim bg-secondary" title="Email and Slack low balance alerts muted">
                <Icon name="bell-off" className="me-1" />
                Alerts Muted
              </span>
            )}
          </h6>
          <span className="text-muted small" style={{ fontSize: "11px" }}>
            Tracked via {provider.balanceSource === "api_poll" ? "Dedicated Upstream Endpoint" : "Live Transaction Responses"}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-sm-end">
          <button
            type="button"
            className="btn btn-xs btn-white bg-white border d-inline-flex align-items-center gap-1 shadow-sm"
            onClick={() => setShowSettings(!showSettings)}
            style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", lineHeight: 1, whiteSpace: "nowrap" }}
            title="Configure custom alert thresholds"
          >
            <Icon name="setting" className="text-primary" style={{ fontSize: "12px", lineHeight: 1 }} />
            <span style={{ lineHeight: 1, whiteSpace: "nowrap" }}>{showSettings ? "Close Settings" : "Alert Settings"}</span>
          </button>

          {canCheckDirectly && (
            <button
              type="button"
              className="btn btn-xs btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={() => onCheckBalance(code)}
              disabled={isChecking}
              style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", lineHeight: 1, whiteSpace: "nowrap" }}
            >
              {isChecking ? (
                <Spinner size="sm" style={{ width: 11, height: 11 }} />
              ) : (
                <svg
                  style={{ width: 11, height: 11, flexShrink: 0 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              <span style={{ lineHeight: 1, whiteSpace: "nowrap" }}>{isChecking ? "Checking..." : "Check Balance Now"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Muted Notification Banner */}
      {isAlertsPaused && (
        <div className="alert alert-warning py-1.5 px-3 mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: "11px", borderRadius: "6px" }}>
          <div className="d-flex align-items-center gap-2">
            <Icon name="bell-off" className="fs-14px" />
            <span>
              <strong>Alerts are Paused:</strong> Email and Slack low balance notifications are currently silenced for this provider.
            </span>
          </div>
        </div>
      )}

      {/* Threshold & Settings Drawer */}
      {showSettings && (
        <div className="p-3 mb-3 bg-white rounded-2 border shadow-sm">
          <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
            <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
              <Icon name="setting-alt" className="me-1 text-primary" />
              Configure Alert Settings & Thresholds
            </div>
            {hasCustomThresholds && (
              <span className="badge badge-dim bg-info" style={{ fontSize: "10px" }}>
                Custom Active
              </span>
            )}
          </div>

          <form onSubmit={handleSaveThresholds}>
            <div className="d-flex align-items-center justify-content-between p-2 mb-3 bg-light rounded-2 border">
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: "12px" }}>
                  Pause Low-Balance Notifications
                </div>
                <div className="text-muted" style={{ fontSize: "11px" }}>
                  Temporarily silence email and Slack alerts if you are not currently using this provider.
                </div>
              </div>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={`pause-alerts-${code}`}
                  checked={isAlertsPaused}
                  onChange={handleTogglePause}
                  disabled={isSavingSettings}
                />
                <label className="custom-control-label" htmlFor={`pause-alerts-${code}`}>
                  <span className={`fw-medium ${isAlertsPaused ? "text-danger" : "text-success"}`} style={{ fontSize: "12px" }}>
                    {isAlertsPaused ? "Muted" : "Active"}
                  </span>
                </label>
              </div>
            </div>

            <div className="text-muted mb-2" style={{ fontSize: "11px" }}>
              Leave inputs blank to automatically use system global defaults (Warning: ₦10,000, Urgent: ₦5,000, Critical: ₦2,000).
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-4">
                <label className="form-label mb-1" style={{ fontSize: "11px" }}>
                  Warning Threshold (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-control form-control-sm"
                  placeholder="Default: 10,000"
                  value={warningVal}
                  onChange={(e) => setWarningVal(e.target.value)}
                  style={{ fontSize: "12px" }}
                />
              </div>

              <div className="col-12 col-sm-4">
                <label className="form-label mb-1" style={{ fontSize: "11px" }}>
                  Urgent Threshold (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-control form-control-sm"
                  placeholder="Default: 5,000"
                  value={urgentVal}
                  onChange={(e) => setUrgentVal(e.target.value)}
                  style={{ fontSize: "12px" }}
                />
              </div>

              <div className="col-12 col-sm-4">
                <label className="form-label mb-1" style={{ fontSize: "11px" }}>
                  Critical Threshold (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-control form-control-sm"
                  placeholder="Default: 2,000"
                  value={criticalVal}
                  onChange={(e) => setCriticalVal(e.target.value)}
                  style={{ fontSize: "12px" }}
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-xs btn-light"
                onClick={() => {
                  setWarningVal("");
                  setUrgentVal("");
                  setCriticalVal("");
                }}
                disabled={isSavingSettings}
                style={{ fontSize: "11px" }}
              >
                Reset to Defaults
              </button>
              <button
                type="submit"
                className="btn btn-xs btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                disabled={isSavingSettings}
                style={{ fontSize: "11px", fontWeight: 600, padding: "4px 12px", lineHeight: 1 }}
              >
                {isSavingSettings ? (
                  <Spinner size="sm" style={{ width: 11, height: 11 }} />
                ) : (
                  <Icon name="check" style={{ fontSize: "12px", lineHeight: 1 }} />
                )}
                <span style={{ lineHeight: 1 }}>{isSavingSettings ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2-column info cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <div className="p-3 bg-white rounded-2 border h-100">
            <span className="sub-text" style={{ fontSize: "11px" }}>Current Live Balance</span>
            <div
              className={`fw-bold mt-1 ${
                provider.balanceStatus === "critical"
                  ? "text-danger"
                  : provider.balanceStatus === "urgent"
                  ? "text-warning"
                  : "text-dark"
              }`}
              style={{ fontSize: "20px" }}
            >
              {formatter(provider.balanceCurrency || "NGN").format(provider.currentBalance || 0)}
            </div>
            <div className="text-muted mt-1" style={{ fontSize: "11px" }}>
              {provider.lastBalanceCheckedAt
                ? `Last updated: ${formatDateWithTime(provider.lastBalanceCheckedAt)}`
                : "Awaiting update"}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6">
          <div className="p-3 bg-white rounded-2 border h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="sub-text" style={{ fontSize: "11px" }}>Active Alert Levels</span>
              {hasCustomThresholds ? (
                <span className="badge badge-dim bg-info" style={{ fontSize: "9px" }}>Custom</span>
              ) : (
                <span className="badge badge-dim bg-light text-muted" style={{ fontSize: "9px" }}>Default</span>
              )}
            </div>
            <div className="mt-1" style={{ fontSize: "12px" }}>
              <div className="d-flex justify-content-between py-0.5 border-bottom">
                <span className="text-muted">Warning Alert:</span>
                <span className="fw-medium text-info">&lt; ₦{Number(effectiveWarning).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between py-0.5 border-bottom">
                <span className="text-muted">Urgent Alert:</span>
                <span className="fw-medium text-warning">&lt; ₦{Number(effectiveUrgent).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between py-0.5">
                <span className="text-muted">Critical (30m Esc):</span>
                <span className="fw-medium text-danger">&lt; ₦{Number(effectiveCritical).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Funding & Alert Activity Log */}
      <div className="mt-3">
        <div className="fw-bold text-dark mb-1" style={{ fontSize: "12px" }}>
          Recent Liquidity Events & Top-ups
        </div>
        {isLoadingLogs ? (
          <div className="text-center py-2 text-muted" style={{ fontSize: "12px" }}>
            <Spinner size="sm" color="primary" className="me-1" /> Loading liquidity events...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-2 bg-white rounded-2 border text-center text-muted" style={{ fontSize: "11px" }}>
            No threshold alerts or top-up logs recorded yet for this provider.
          </div>
        ) : (
          <div className="table-responsive bg-white rounded-2 border" style={{ maxHeight: "180px", overflowY: "auto" }}>
            <table className="table table-sm table-tranx mb-0" style={{ fontSize: "11px" }}>
              <thead>
                <tr className="bg-light">
                  <th className="py-1">Event</th>
                  <th className="py-1">Shift</th>
                  <th className="py-1">Amount</th>
                  <th className="py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isTopUp = log.eventType === "funded" || log.eventType === "top_up";
                  const isAlert = log.eventType === "threshold_alert";
                  const shiftAmount = log.difference || log.amountFunded || 0;
                  const alertLevel = log.level || log.thresholdLevel || "alert";

                  return (
                    <tr key={log._id}>
                      <td className="py-1">
                        {isTopUp ? (
                          <span className="badge badge-dim bg-success" style={{ fontSize: "9px" }}>
                            Top-Up
                          </span>
                        ) : isAlert ? (
                          <span
                            className={`badge badge-dim ${
                              alertLevel === "critical"
                                ? "bg-danger"
                                : alertLevel === "urgent"
                                ? "bg-warning"
                                : "bg-info"
                            }`}
                            style={{ fontSize: "9px" }}
                          >
                            Alert ({alertLevel})
                          </span>
                        ) : (
                          <span className="badge badge-dim bg-light text-dark" style={{ fontSize: "9px" }}>
                            Check
                          </span>
                        )}
                      </td>
                      <td className="py-1">
                        ₦{Number(log.previousBalance || 0).toLocaleString()} → ₦{Number(log.newBalance || 0).toLocaleString()}
                      </td>
                      <td className="py-1 fw-bold">
                        {shiftAmount > 0 ? `+₦${Number(shiftAmount).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-1 text-muted">
                        {formatDateWithTime(log.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const ServiceProviders = () => {
  const { hasPermission } = usePermission();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const [editId, setEditedId] = useState();
  const [onSearch, setonSearch] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const { isLoading, data: providers } = useGetProviders(currentPage, itemsPerPage);
  const { mutate: syncProviderProducts } = useSyncProviderProducts(editId);
  const { mutate: deleteProviderProducts } = useDeleteProviderProducts(editId);
  const { mutate: updateStatus } = useToggleProviders(editId);
  const { mutate: deleteProvider } = useDeleteProviders(editId);
  const { mutate: updateProvider } = useUpdateProviders(editId);
  const { mutateAsync: toggleServiceType, isPending } = useToggleProviderServiceType();
  const { mutate: checkBalance, isLoading: isCheckingBalance } = useCheckProviderBalance();
  const { mutate: refreshBalances, isLoading: isRefreshingBalances } = useRefreshProviderBalances();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    logo: "",
    active: false,
    product_type: [],
    created_at: "",
    currentBalance: 0,
    balanceCurrency: "NGN",
    balanceStatus: "healthy",
    balanceSource: "api_poll",
    lastBalanceCheckedAt: null,
    isBalanceAlertsPaused: false,
    balanceThresholds: {},
  });

  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
    logo: false,
    types: false,
    products: false,
  });

  // toggle function to view order details
  const toggle = (type) => {
    setView({
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
      edit: type === "edit" ? true : false,
      logo: type === "logo" ? true : false,
      types: type === "types" ? true : false,
      products: type === "products" ? true : false,
    });
  };

  // resets forms
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      code: "",
      logo: "",
      active: false,
      product_type: [],
      created_at: "",
      currentBalance: 0,
      balanceCurrency: "NGN",
      balanceStatus: "healthy",
      balanceSource: "api_poll",
      lastBalanceCheckedAt: null,
      isBalanceAlertsPaused: false,
      balanceThresholds: {},
    });
    setServiceTypes([]);
    setErrorMessage("");
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    providers?.data?.forEach((item) => {
      if (item._id === id) {
        setFormData({
          id: item?._id,
          name: item?.name,
          code: item?.code,
          logo: item?.logo,
          active: item?.isActive,
          product_type: item?.serviceType,
          created_at: item?.createdAt,
          currentBalance: item?.currentBalance || 0,
          balanceCurrency: item?.balanceCurrency || "NGN",
          balanceStatus: item?.balanceStatus || "healthy",
          balanceSource: item?.balanceSource || "api_poll",
          lastBalanceCheckedAt: item?.lastBalanceCheckedAt,
          isBalanceAlertsPaused: item?.isBalanceAlertsPaused || false,
          balanceThresholds: item?.balanceThresholds || {},
        });
        setServiceTypes(item?.serviceType || []);
      }
    });
    setEditedId(id);
  };

  // Handle row click to open view details modal
  const handleRowClick = (itemId, e) => {
    // Prevent opening modal if clicking on interactive elements
    const target = e.target;
    if (
      target.closest(".custom-switch") ||
      target.closest(".dropdown-toggle") ||
      target.closest(".btn") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("label")
    ) {
      return;
    }
    // Open the view details modal
    onEditClick(itemId);
    toggle("details");
  };

  // Handle service type toggle in view modal
  const handleServiceTypeToggle = async (serviceType) => {
    setErrorMessage("");
    try {
      await toggleServiceType({
        providerId: formData.id,
        serviceTypeId: serviceType._id,
        data: {
          isActive: !serviceType.isActiveProvider,
        },
      });

      // Update UI
      setServiceTypes((prev) =>
        prev.map((item) =>
          item._id === serviceType._id ? { ...item, isActiveProvider: !item.isActiveProvider } : item,
        ),
      );
    } catch (err) {
      console.error("Error in mutation:", err);
      setErrorMessage(err.message);
    }
  };

  // function to close the form modal
  const onFormCancel = () => {
    setView({ add: false, details: false, edit: false, logo: false, types: false });
    resetForm();
  };

  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  // function to filter data
  const filterData = useCallback(() => {
    return;
  }, []);

  return (
    <React.Fragment>
      <Head title="Service Providers"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Service Providers</BlockTitle>
            </BlockHeadContent>
            {/* <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className="toggle btn-icon d-md-none"
                  color="primary"
                  onClick={() => {
                    toggle("add");
                  }}
                >
                  <Icon name="plus"></Icon>
                </Button>
                <Button
                  className="toggle btn-icon ms-2 d-md-none"
                  color="secondary"
                  onClick={() => {
                    toggle("products");
                  }}
                >
                  <Icon name="bag"></Icon>
                </Button>
              </div>
            </BlockHeadContent> */}
          </BlockBetween>
        </BlockHead>

        <Block>
          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Service providers</h5>
                </div>
                <div className="card-tools me-n1">
                  <ul className="btn-toolbar gx-1">
                    <li>
                      <Button
                        color="light"
                        outline
                        className="btn-sm btn-white d-inline-flex align-items-center gap-1 shadow-sm"
                        onClick={() => refreshBalances()}
                        disabled={isRefreshingBalances}
                        title="Poll live balances for all supported upstream gateways"
                        style={{ height: "34px", fontSize: "12px" }}
                      >
                        {isRefreshingBalances ? <Spinner size="sm" /> : <Icon name="reload" className="text-primary" />}
                        <span className="d-none d-sm-inline">{isRefreshingBalances ? "Polling..." : "Refresh Balances"}</span>
                      </Button>
                    </li>
                    <li className="btn-toolbar-sep"></li>
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
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                          <div className="dot dot-primary"></div>
                          <Icon name="filter-alt"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end className="filter-wg dropdown-menu-xl" style={{ overflow: "visible" }}>
                          <div className="dropdown-head">
                            <span className="sub-title dropdown-title">Advanced Filter</span>
                          </div>
                          <div className="dropdown-body dropdown-body-rg">
                            <Row className="gx-6 gy-4">
                              <Col size="12">
                                <div className="form-group">
                                  <label className="overline-title overline-title-alt">Type</label>
                                  {/* <RSelect
                                    options={flightsFilterOptions}
                                    placeholder="Any flight type"
                                    value={filters.status && { label: filters.status, value: filters.status }}
                                    isSearchable={false}
                                    onChange={(e) => setfilters({ ...filters, status: e.label })}
                                  /> */}
                                </div>
                              </Col>
                              <Col size="12">
                                <div className="form-group">
                                  <Button type="button" onClick={filterData} className="btn btn-secondary ">
                                    Filter
                                  </Button>
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <div className="dropdown-foot between">
                            <a
                              href="#reset"
                              onClick={(ev) => {
                                ev.preventDefault();
                                // setData(couponsData);
                                // setfilters({});
                              }}
                              className="clickable"
                            >
                              Reset Filter
                            </a>
                            <a
                              href="#save"
                              onClick={(ev) => {
                                ev.preventDefault();
                              }}
                            >
                              Save Filter
                            </a>
                          </div>
                        </DropdownMenu>
                      </UncontrolledDropdown>
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
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="hotel name" />
              </div>
            </div>
            <div className="card-inner-group">
              <div className="card-inner p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : providers?.pagination?.total > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Provider Name</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Service Type</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Service Count</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Wallet Balance</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Date Added</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Last Synced</span>
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
                      {providers?.data?.map((item, idx) => {
                        return (
                          <DataTableItem
                            key={item._id}
                            className="text-secondary"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => handleRowClick(item._id, e)}
                          >
                            <DataTableRow>
                              <span className="tb-product">
                                <img
                                  src={item.logo ? item.logo : NoIcon}
                                  alt={"provider logo for " + item.name}
                                  className="thumb-sm d-inline-flex"
                                />
                                <span className="title">{item.name}</span>
                              </span>
                            </DataTableRow>

                            <DataTableRow size="md">
                              {item?.serviceType
                                ?.filter((type) => type?.isActiveProvider)
                                .map((type, index) => {
                                  if (index <= 1) {
                                    return (
                                      <span key={index} className="ccap pe-1">
                                        {type?.name},
                                      </span>
                                    );
                                  }
                                })}
                              {item?.serviceType?.filter((type) => type?.isActiveProvider)?.length > 2 && (
                                <span>
                                  & {item?.serviceType?.filter((type) => type?.isActiveProvider)?.length - 2} more.
                                </span>
                              )}
                              {item?.serviceType?.filter((type) => type?.isActiveProvider)?.length === 0 && (
                                <span className="text-silent">No active service</span>
                              )}
                            </DataTableRow>
                            <DataTableRow size="md">
                              <span className="text-capitalize"> {item?.serviceType.length}</span>
                            </DataTableRow>
                            <DataTableRow size="md">
                              <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "4px 0", minWidth: "120px" }}>
                                <div className="fw-bold text-dark" style={{ fontSize: "13px", lineHeight: "1.2", letterSpacing: "-0.2px" }}>
                                  {formatter(item?.balanceCurrency || "NGN").format(item?.currentBalance || 0)}
                                </div>
                                <div className="d-flex align-items-center gap-1 flex-wrap" style={{ lineHeight: "1" }}>
                                  {(item?.isBalanceAlertsPaused || item?.isActive === false) && (
                                    <span
                                      className="badge badge-dim bg-light text-muted border"
                                      style={{ fontSize: "9px", padding: "1px 5px", lineHeight: "1.2", whiteSpace: "nowrap" }}
                                      title={item?.isBalanceAlertsPaused ? "Alerts silenced for this provider" : "Provider is inactive"}
                                    >
                                      🔕 Muted
                                    </span>
                                  )}
                                  {item?.balanceStatus === "critical" ? (
                                    <span className="badge badge-dim bg-danger" style={{ fontSize: "10px", padding: "1px 6px", lineHeight: "1.2", whiteSpace: "nowrap" }}>
                                      Critical (&lt;₦2k)
                                    </span>
                                  ) : item?.balanceStatus === "urgent" ? (
                                    <span className="badge badge-dim bg-warning" style={{ fontSize: "10px", padding: "1px 6px", lineHeight: "1.2", whiteSpace: "nowrap" }}>
                                      Urgent (&lt;₦5k)
                                    </span>
                                  ) : item?.balanceStatus === "warning" ? (
                                    <span className="badge badge-dim bg-info" style={{ fontSize: "10px", padding: "1px 6px", lineHeight: "1.2", whiteSpace: "nowrap" }}>
                                      Low (&lt;₦10k)
                                    </span>
                                  ) : (
                                    <span className="badge badge-dim bg-success" style={{ fontSize: "10px", padding: "1px 6px", lineHeight: "1.2", whiteSpace: "nowrap" }}>
                                      Healthy
                                    </span>
                                  )}
                                  <span className="badge badge-dim bg-light text-muted" style={{ fontSize: "9px", padding: "1px 4px", lineHeight: "1.2", whiteSpace: "nowrap" }}>
                                    {item?.balanceSource === "transaction_meta" ? "Txn" : "API"}
                                  </span>
                                </div>
                              </div>
                            </DataTableRow>
                            <DataTableRow size="md">
                              <span>{formatDateWithHyphen(item.createdAt)}</span>
                            </DataTableRow>
                            <DataTableRow size="md">
                              <span>{item?.lastSyncedAt ? formatDateWithHyphen(item.lastSyncedAt) : "N/A"}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <div className="custom-control-sm custom-switch" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  name={item.name}
                                  checked={item?.isActive}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditClick(item._id);
                                    updateStatus({ isActive: !item?.isActive });
                                  }}
                                  id={item._id}
                                />
                                <label className="custom-control-label" htmlFor={item._id}>
                                  <span
                                    className={`ccap fw-medium d-none d-md-inline ${item?.isActive ? "text-success" : "text-muted"}`}
                                  >
                                    {item.isActive ? "active" : "inactive"}
                                  </span>
                                </label>
                              </div>
                            </DataTableRow>

                            <DataTableRow className="tb-odr-action">
                              <div className="tb-odr-btns d-md-inline">
                                {hasPermission("system.manage_services") && item?.supportsDataService && (
                                  <Button
                                    color="primary"
                                    className="btn-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/service-providers/${item._id}`);
                                    }}
                                    // disabled={!item?.active}
                                  >
                                    View services
                                  </Button>
                                )}

                                <UncontrolledDropdown>
                                  <DropdownToggle
                                    tag="a"
                                    href="#more"
                                    onClick={(ev) => ev.preventDefault()}
                                    className="text-soft dropdown-toggle btn btn-icon btn-trigger ms-1"
                                  >
                                    <Icon name="more-h"></Icon>
                                  </DropdownToggle>
                                  <DropdownMenu end>
                                    <ul className="link-list-plain">
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            ev.stopPropagation();
                                            setEditedId(item._id);
                                            onEditClick(item._id);
                                            toggle("details");
                                          }}
                                        >
                                          <Icon name="eye"></Icon>
                                          <span>View Details</span>
                                        </DropdownItem>
                                      </li>
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            ev.stopPropagation();
                                            setEditedId(item._id);
                                            onEditClick(item._id);
                                            toggle("logo");
                                          }}
                                        >
                                          <Icon name="edit"></Icon>
                                          <span>Edit logo</span>
                                        </DropdownItem>
                                      </li>
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            ev.stopPropagation();
                                            setEditedId(item._id);
                                            onEditClick(item._id);
                                            toggle("types");
                                          }}
                                        >
                                          <Icon name="unarchive"></Icon>
                                          <span>Update products</span>
                                        </DropdownItem>
                                      </li>


                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            ev.stopPropagation();
                                            navigate(`/service-providers/api-discounts/${item.name}`, {
                                              state: {
                                                providerId: item?._id,
                                              },
                                            });
                                          }}
                                        >
                                          <Icon name="percent"></Icon>
                                          <span>View API Discounts</span>
                                        </DropdownItem>
                                      </li>
                                      {item?.hasSync && hasPermission("system.sync_providers") && (
                                        <>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                ev.stopPropagation();
                                                setEditedId(item._id);
                                                syncProviderProducts({ forceUpdate: true });
                                              }}
                                            >
                                              <Icon name="update"></Icon>
                                              <span>Sync Products</span>
                                            </DropdownItem>
                                          </li>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                ev.stopPropagation();
                                                if (window.confirm("Are you sure you want to delete all products for this provider? This action cannot be undone and will empty all service types.")) {
                                                  setEditedId(item._id);
                                                  // Use setTimeout to ensure state is updated before mutation is called if needed, but following existing pattern
                                                  setTimeout(() => {
                                                    deleteProviderProducts();
                                                  }, 0);
                                                }
                                              }}
                                              className="text-danger"
                                            >
                                              <Icon name="trash"></Icon>
                                              <span>Clear All Products</span>
                                            </DropdownItem>
                                          </li>
                                        </>
                                      )}
                                    </ul>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </div>
                            </DataTableRow>
                          </DataTableItem>
                        );
                      })}
                    </DataTableBody>
                    <div className="card-inner">
                      {providers?.pagination?.total > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={providers?.pagination?.total}
                          paginate={paginate}
                          currentPage={Number(currentPage)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "1rem" }}>
                    <span className="text-silent">No Provider record found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        {/* ADD CATEGORIES */}
        <ServiceProviderModal
          modal={view.add || view.edit}
          isEdit={view.edit}
          closeModal={() => onFormCancel()}
          formData={formData}
        />

        <AddProductModal modal={view.products} closeModal={() => onFormCancel()} />

        <EditProductTypes modal={view.types} closeModal={() => onFormCancel()} formData={formData} />

        <EditProviderLogo
          modal={view.logo}
          closeModal={() => onFormCancel()}
          formData={formData}
          editFunction={updateProvider}
        />

        {/* View Details Modal with Checkboxes */}
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
            <div className="p-2">
              <div className="nk-modal-head">
                <h5 className="title">View Provider</h5>
                <div>
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="logo"
                      style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "contain" }}
                    />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Row className="gy-3">
                  <Col>
                    <span className="sub-text">Provider Name</span>
                    <span className="caption-text text-primary">{formData.name}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Service Count</span>
                    <span className="caption-text">{serviceTypes?.length || 0}</span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Provider Status</span>
                    <span className={`caption-text ${formData.active ? "text-success" : "text-warning"}`}>
                      {formData.active ? "Active" : "Inactive"}
                    </span>
                  </Col>

                  <Col lg={6}>
                    <span className="sub-text">Date Created</span>
                    <span className="caption-text">{formatDateWithHyphen(formData.created_at)}</span>
                  </Col>
                </Row>

                {/* Upstream Wallet Liquidity & Real-time Balance Card */}
                <ProviderLiquidityDetailCard
                  provider={formData}
                  onCheckBalance={(code) => checkBalance(code)}
                  isChecking={isCheckingBalance}
                  onUpdateProviderData={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                />

                <div className="mt-4">
                  <h2 className="text-primary fw-bold fs-16px">Service Types</h2>
                  {errorMessage && <span className="text-danger">{errorMessage}</span>}
                  <Row className="g-2 align-center mt-1">
                    {serviceTypes.length ? (
                      serviceTypes.map((item, idx) => (
                        <Col key={idx} size="4">
                          <div className="custom-control custom-control-sm custom-checkbox">
                            <input
                              disabled={isPending}
                              type="checkbox"
                              className="custom-control-input"
                              checked={item.isActiveProvider}
                              id={`view-${item._id}`}
                              onChange={() => handleServiceTypeToggle(item)}
                            />
                            <label className="custom-control-label" htmlFor={`view-${item._id}`}>
                              <span className="text-secondary fs-14px text-capitalize">{item.name}</span>
                            </label>
                          </div>
                        </Col>
                      ))
                    ) : (
                      <p>No Services Available</p>
                    )}
                  </Row>
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default ServiceProviders;
