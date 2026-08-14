import React, { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  UncontrolledDropdown,
} from "reactstrap";
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
import { formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import {
  useGetAllProducts,
  useToggleProductHot,
  useToggleProductStatus,
} from "../../../../api/product/products";
import { useGetProviders, useGetServiceTypes } from "../../../../api/service-providers";
import { useGetServices } from "../../../../api/services";

// ─── Constants ─────────────────────────────────────────────────────────────
const DATA_TYPES = ["SME", "GIFTING", "DIRECT", "CORPORATE GIFTING", "AWOOF"];
const VALIDITY_OPTIONS = [
  { label: "1 Day", value: "1" },
  { label: "7 Days", value: "7" },
  { label: "14 Days", value: "14" },
  { label: "30 Days", value: "30" },
  { label: "60 Days", value: "60" },
  { label: "90 Days", value: "90" },
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Daily", value: "daily" },
  { label: "Yearly", value: "yearly" },
];

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon }) => (
  <div className="col-6 col-lg-3">
    <div
      className="card h-100"
      style={{
        borderRadius: "12px",
        border: "none",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div className="card-body d-flex align-items-center gap-3 p-3">
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        <div>
          <div className="fw-bold fs-4 lh-1">{value ?? "—"}</div>
          <div className="text-muted small mt-1">{label}</div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Filter Pill ────────────────────────────────────────────────────────────
const FilterPill = ({ label, onClear }) => (
  <span
    className="badge d-inline-flex align-items-center gap-1 me-1 mb-1"
    style={{
      background: "#eef2ff",
      color: "#4f46e5",
      borderRadius: 20,
      padding: "4px 10px",
      fontWeight: 500,
      fontSize: 12,
    }}
  >
    {label}
    <span
      style={{ cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1 }}
      onClick={onClear}
    >
      ×
    </span>
  </span>
);

// ─── Hot Toggle ─────────────────────────────────────────────────────────────
const HotToggle = ({ productId, isHot }) => {
  const { mutate: toggleHot, isLoading } = useToggleProductHot(productId);

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, cursor: isLoading ? "wait" : "pointer" }}
      onClick={() => !isLoading && toggleHot(!isHot)}
      title={isHot ? "Remove from Hot Products" : "Mark as Hot Product"}
    >
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: isHot ? "linear-gradient(135deg,#ff6b35,#f7c59f)" : "#e5e7eb",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
          boxShadow: isHot ? "0 0 6px 1px rgba(255,107,53,0.35)" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: isHot ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transition: "left 0.2s",
          }}
        />
      </div>
      {isHot && (
        <span style={{ fontSize: 14, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))" }}>🔥</span>
      )}
    </div>
  );
};

// ─── Status Toggle ──────────────────────────────────────────────────────────
const StatusToggle = ({ productId, isActive }) => {
  const { mutate: toggleStatus, isLoading } = useToggleProductStatus(productId);

  return (
    <div className="custom-control-sm custom-switch">
      <input
        type="checkbox"
        className="custom-control-input"
        checked={!!isActive}
        onChange={() => !isLoading && toggleStatus(!isActive)}
        id={`status-${productId}`}
        disabled={isLoading}
      />
      <label className="custom-control-label" htmlFor={`status-${productId}`}>
        <span className={`ccap fw-medium d-none d-md-inline ${isActive ? "text-success" : "text-muted"}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </label>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);

  // ── Filter state ──
  const [filters, setFilters] = useState({
    search: "",
    providerId: "",
    serviceTypeId: "",
    serviceId: "",
    dataType: "",
    validity: "",
    isHot: "all",
    status: "all",
  });
  const [pendingSearch, setPendingSearch] = useState("");

  // ── Data fetching ──
  const { isLoading, data } = useGetAllProducts(page, limit, {
    search: filters.search,
    providerId: filters.providerId,
    serviceTypeId: filters.serviceTypeId,
    serviceId: filters.serviceId,
    dataType: filters.dataType,
    validity: filters.validity,
    isHot: filters.isHot,
    status: filters.status,
  });

  const { data: providersData } = useGetProviders(1, 200);
  const { data: serviceTypesData } = useGetServiceTypes();
  const { data: servicesData } = useGetServices();

  const products = data?.data?.products ?? [];
  const pagination = data?.data?.pagination ?? {};

  // ── Dropdown options ──
  const providerOptions = useMemo(
    () => providersData?.data?.map((p) => ({ label: p.name, value: p._id })) ?? [],
    [providersData]
  );
  const serviceTypeOptions = useMemo(
    () => serviceTypesData?.data?.map((st) => ({ label: st.name, value: st._id })) ?? [],
    [serviceTypesData]
  );
  const serviceOptions = useMemo(() => {
    const all = servicesData?.data ?? [];
    if (!filters.serviceTypeId) return all.map((s) => ({ label: s.name, value: s._id }));
    return all
      .filter((s) => s.serviceTypeId === filters.serviceTypeId || s.serviceTypeId?._id === filters.serviceTypeId)
      .map((s) => ({ label: s.name, value: s._id }));
  }, [servicesData, filters.serviceTypeId]);

  // ── Filter helpers ──
  const setFilter = (key, val) => {
    setFilters((f) => {
      const next = { ...f, [key]: val };
      if (key === "serviceTypeId") next.serviceId = "";
      return next;
    });
    setSearchParams((sp) => { sp.set("page", 1); return sp; });
  };

  const clearFilter = (key) => setFilter(key, key === "isHot" || key === "status" ? "all" : "");

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && v !== "all" && v !== "");

  const handleSearch = () => setFilter("search", pendingSearch);

  // ── Stats ──
  const totalCount = pagination.total ?? 0;

  return (
    <React.Fragment>
      <Head title="Products Management" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Products Management</BlockTitle>
              <p className="text-muted small mt-1">
                Manage all VAS products — toggle hot status, activate/deactivate, and filter by any dimension.
              </p>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* ── Stat Cards ── */}
        <Block>
          <div className="row g-3 mb-4">
            <StatCard
              label="Total Products"
              value={totalCount.toLocaleString()}
              color="linear-gradient(135deg,#e0e7ff,#c7d2fe)"
              icon="📦"
            />
            <StatCard
              label="Active Products"
              value="—"
              color="linear-gradient(135deg,#d1fae5,#a7f3d0)"
              icon="✅"
            />
            <StatCard
              label="Inactive Products"
              value="—"
              color="linear-gradient(135deg,#fee2e2,#fecaca)"
              icon="⛔"
            />
            <StatCard
              label="Hot Products 🔥"
              value="—"
              color="linear-gradient(135deg,#fff7ed,#fed7aa)"
              icon="🔥"
            />
          </div>

          {/* ── Filter Panel ── */}
          <Card style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16 }}>
            <div className="card-body p-3">
              {/* Search Row */}
              <div className="d-flex gap-2 flex-wrap mb-3">
                <div className="input-group" style={{ maxWidth: 340 }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search by name, code, description…"
                    value={pendingSearch}
                    onChange={(e) => setPendingSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    id="products-search"
                  />
                  <button className="btn btn-sm btn-primary" onClick={handleSearch} id="products-search-btn">
                    <Icon name="search" />
                  </button>
                </div>

                {/* Hot filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={filters.isHot}
                  onChange={(e) => setFilter("isHot", e.target.value)}
                  id="filter-hot"
                >
                  <option value="all">🔥 All Products</option>
                  <option value="true">🔥 Hot Only</option>
                  <option value="false">Regular Only</option>
                </select>

                {/* Status filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={filters.status}
                  onChange={(e) => setFilter("status", e.target.value)}
                  id="filter-status"
                >
                  <option value="all">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                {activeFilters.length > 0 && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setFilters({ search: "", providerId: "", serviceTypeId: "", serviceId: "", dataType: "", validity: "", isHot: "all", status: "all" });
                      setPendingSearch("");
                      setSearchParams((sp) => { sp.set("page", 1); return sp; });
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Grouped Filter Dropdowns */}
              <div className="d-flex flex-wrap gap-2 align-items-center">
                {/* Provider */}
                <UncontrolledDropdown>
                  <DropdownToggle
                    tag="button"
                    className={`btn btn-sm ${filters.providerId ? "btn-primary" : "btn-outline-secondary"}`}
                    id="filter-provider-toggle"
                  >
                    <Icon name="rss" className="me-1" />
                    {filters.providerId
                      ? providerOptions.find((p) => p.value === filters.providerId)?.label ?? "Provider"
                      : "Provider"}
                    <Icon name="chevron-down" className="ms-1" />
                  </DropdownToggle>
                  <DropdownMenu style={{ maxHeight: 260, overflowY: "auto", minWidth: 200 }}>
                    <DropdownItem onClick={() => setFilter("providerId", "")} className={!filters.providerId ? "fw-bold" : ""}>
                      All Providers
                    </DropdownItem>
                    <DropdownItem divider />
                    {providerOptions.map((p) => (
                      <DropdownItem key={p.value} onClick={() => setFilter("providerId", p.value)} className={filters.providerId === p.value ? "fw-bold text-primary" : ""}>
                        {p.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </UncontrolledDropdown>

                {/* Service Type */}
                <UncontrolledDropdown>
                  <DropdownToggle
                    tag="button"
                    className={`btn btn-sm ${filters.serviceTypeId ? "btn-primary" : "btn-outline-secondary"}`}
                    id="filter-service-type-toggle"
                  >
                    <Icon name="shield-star-fill" className="me-1" />
                    {filters.serviceTypeId
                      ? serviceTypeOptions.find((st) => st.value === filters.serviceTypeId)?.label ?? "Service Type"
                      : "Service Type"}
                    <Icon name="chevron-down" className="ms-1" />
                  </DropdownToggle>
                  <DropdownMenu style={{ maxHeight: 260, overflowY: "auto", minWidth: 200 }}>
                    <DropdownItem onClick={() => setFilter("serviceTypeId", "")} className={!filters.serviceTypeId ? "fw-bold" : ""}>
                      All Service Types
                    </DropdownItem>
                    <DropdownItem divider />
                    {serviceTypeOptions.map((st) => (
                      <DropdownItem key={st.value} onClick={() => setFilter("serviceTypeId", st.value)} className={filters.serviceTypeId === st.value ? "fw-bold text-primary" : ""}>
                        {st.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </UncontrolledDropdown>

                {/* Service */}
                <UncontrolledDropdown>
                  <DropdownToggle
                    tag="button"
                    className={`btn btn-sm ${filters.serviceId ? "btn-primary" : "btn-outline-secondary"}`}
                    id="filter-service-toggle"
                  >
                    <Icon name="network" className="me-1" />
                    {filters.serviceId
                      ? serviceOptions.find((s) => s.value === filters.serviceId)?.label ?? "Service"
                      : "Service"}
                    <Icon name="chevron-down" className="ms-1" />
                  </DropdownToggle>
                  <DropdownMenu style={{ maxHeight: 260, overflowY: "auto", minWidth: 200 }}>
                    <DropdownItem onClick={() => setFilter("serviceId", "")} className={!filters.serviceId ? "fw-bold" : ""}>
                      All Services
                    </DropdownItem>
                    <DropdownItem divider />
                    {serviceOptions.map((s) => (
                      <DropdownItem key={s.value} onClick={() => setFilter("serviceId", s.value)} className={filters.serviceId === s.value ? "fw-bold text-primary" : ""}>
                        {s.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </UncontrolledDropdown>

                {/* Data Type */}
                <UncontrolledDropdown>
                  <DropdownToggle
                    tag="button"
                    className={`btn btn-sm ${filters.dataType ? "btn-primary" : "btn-outline-secondary"}`}
                    id="filter-datatype-toggle"
                  >
                    <Icon name="signal" className="me-1" />
                    {filters.dataType || "Data Type"}
                    <Icon name="chevron-down" className="ms-1" />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => setFilter("dataType", "")} className={!filters.dataType ? "fw-bold" : ""}>
                      All Data Types
                    </DropdownItem>
                    <DropdownItem divider />
                    {DATA_TYPES.map((dt) => (
                      <DropdownItem key={dt} onClick={() => setFilter("dataType", dt)} className={filters.dataType === dt ? "fw-bold text-primary" : ""}>
                        {dt}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </UncontrolledDropdown>

                {/* Validity */}
                <UncontrolledDropdown>
                  <DropdownToggle
                    tag="button"
                    className={`btn btn-sm ${filters.validity ? "btn-primary" : "btn-outline-secondary"}`}
                    id="filter-validity-toggle"
                  >
                    <Icon name="clock" className="me-1" />
                    {filters.validity
                      ? VALIDITY_OPTIONS.find((v) => v.value === filters.validity)?.label ?? filters.validity
                      : "Validity"}
                    <Icon name="chevron-down" className="ms-1" />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => setFilter("validity", "")} className={!filters.validity ? "fw-bold" : ""}>
                      All Durations
                    </DropdownItem>
                    <DropdownItem divider />
                    {VALIDITY_OPTIONS.map((v) => (
                      <DropdownItem key={v.value} onClick={() => setFilter("validity", v.value)} className={filters.validity === v.value ? "fw-bold text-primary" : ""}>
                        {v.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>

              {/* Active Filter Pills */}
              {activeFilters.length > 0 && (
                <div className="mt-2 d-flex flex-wrap align-items-center">
                  <span className="text-muted small me-2">Active filters:</span>
                  {activeFilters.map(([key, val]) => {
                    let label = `${key}: ${val}`;
                    if (key === "providerId") label = `Provider: ${providerOptions.find((p) => p.value === val)?.label ?? val}`;
                    if (key === "serviceTypeId") label = `Type: ${serviceTypeOptions.find((st) => st.value === val)?.label ?? val}`;
                    if (key === "serviceId") label = `Service: ${serviceOptions.find((s) => s.value === val)?.label ?? val}`;
                    if (key === "dataType") label = `Data: ${val}`;
                    if (key === "validity") label = `Validity: ${VALIDITY_OPTIONS.find((v) => v.value === val)?.label ?? val}`;
                    if (key === "isHot") label = val === "true" ? "🔥 Hot Only" : "Regular Only";
                    if (key === "status") label = val === "true" ? "✅ Active" : "⛔ Inactive";
                    if (key === "search") label = `Search: "${val}"`;
                    return <FilterPill key={key} label={label} onClear={() => clearFilter(key)} />;
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* ── Products Table ── */}
          <Card style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="card-inner border-bottom d-flex align-items-center justify-content-between py-3">
              <h6 className="title mb-0">
                All Products
                {totalCount > 0 && (
                  <Badge color="light" className="ms-2 text-muted">
                    {totalCount.toLocaleString()}
                  </Badge>
                )}
              </h6>
            </div>

            <div className="card-inner p-0">
              {isLoading ? (
                <LoadingSpinner />
              ) : products.length > 0 ? (
                <>
                  <DataTableBody className="is-compact">
                    <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                      <DataTableRow>
                        <span>#</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span>Product</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span>Service / Type</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span>Provider</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span>Size / Validity</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span>Amount</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span>Provider Amt</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span>🔥 Hot</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span>Status</span>
                      </DataTableRow>
                      <DataTableRow className="nk-tb-col-tools">
                        <span></span>
                      </DataTableRow>
                    </DataTableHead>

                    {products.map((item, idx) => {
                      const service = item.serviceId;
                      const serviceType = service?.serviceTypeId;
                      const provider = item.providerId;
                      const margin = item.amount - item.providerAmount;

                      return (
                        <DataTableItem key={item._id} className="text-secondary">
                          {/* S/N */}
                          <DataTableRow>
                            <span className="text-muted small">
                              {(page - 1) * limit + idx + 1}
                            </span>
                          </DataTableRow>

                          {/* Product info */}
                          <DataTableRow>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={item.logo || service?.logo || NoIcon}
                                alt={item.name}
                                style={{ width: 32, height: 32, borderRadius: 8, objectFit: "contain", flexShrink: 0 }}
                              />
                              <div>
                                <div className="fw-medium" style={{ fontSize: 13, lineHeight: 1.3 }}>
                                  {item.name}
                                </div>
                                <div className="text-muted" style={{ fontSize: 11 }}>
                                  {item.code}
                                </div>
                              </div>
                            </div>
                          </DataTableRow>

                          {/* Service / Type */}
                          <DataTableRow size="sm">
                            <div>
                              {service?.name && (
                                <Badge
                                  color="light"
                                  className="text-secondary me-1 mb-1"
                                  style={{ fontSize: 11, fontWeight: 500 }}
                                >
                                  {service.name}
                                </Badge>
                              )}
                              {serviceType?.name && (
                                <Badge
                                  style={{
                                    background: "#ede9fe",
                                    color: "#7c3aed",
                                    fontSize: 10,
                                    fontWeight: 600,
                                  }}
                                >
                                  {serviceType.name}
                                </Badge>
                              )}
                              {item.attributes?.dataType && (
                                <div>
                                  <Badge
                                    style={{ background: "#ecfdf5", color: "#059669", fontSize: 10, marginTop: 2 }}
                                  >
                                    {item.attributes.dataType}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </DataTableRow>

                          {/* Provider */}
                          <DataTableRow size="sm">
                            {provider?.name && (
                              <div className="d-flex align-items-center gap-1">
                                <img
                                  src={provider?.logo || NoIcon}
                                  alt={provider.name}
                                  style={{ width: 20, height: 20, borderRadius: 4, objectFit: "contain" }}
                                />
                                <span style={{ fontSize: 12 }}>{provider.name}</span>
                              </div>
                            )}
                          </DataTableRow>

                          {/* Size / Validity */}
                          <DataTableRow size="sm">
                            <div style={{ fontSize: 12 }}>
                              {item.dataSizeDisplay && (
                                <div className="fw-medium">{item.dataSizeDisplay}</div>
                              )}
                              {(item.validity || item.attributes?.validityPeriod) && (
                                <div className="text-muted">
                                  {item.validity || item.attributes?.validityPeriod}
                                </div>
                              )}
                            </div>
                          </DataTableRow>

                          {/* Amount */}
                          <DataTableRow size="sm">
                            <div>
                              <div className="fw-medium" style={{ fontSize: 13 }}>
                                {formatter("NGN").format(item.amount)}
                              </div>
                              {margin > 0 && (
                                <div style={{ fontSize: 11, color: "#16a34a" }}>
                                  +{formatter("NGN").format(margin)}
                                </div>
                              )}
                            </div>
                          </DataTableRow>

                          {/* Provider Amount */}
                          <DataTableRow size="md">
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                              {formatter("NGN").format(item.providerAmount)}
                            </span>
                          </DataTableRow>

                          {/* Hot Toggle */}
                          <DataTableRow>
                            <HotToggle productId={item._id} isHot={!!item.isHot} />
                          </DataTableRow>

                          {/* Status Toggle */}
                          <DataTableRow>
                            <StatusToggle productId={item._id} isActive={!!item.isActive} />
                          </DataTableRow>

                          {/* Actions */}
                          <DataTableRow className="nk-tb-col-tools">
                            <ul className="nk-tb-actions gx-1 my-n1">
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle
                                    tag="a"
                                    className="btn btn-trigger dropdown-toggle btn-icon me-n1"
                                  >
                                    <Icon name="more-h" />
                                  </DropdownToggle>
                                  <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => ev.preventDefault()}
                                        >
                                          <Icon name="eye" />
                                          <span>View Details</span>
                                        </DropdownItem>
                                      </li>
                                    </ul>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </li>
                            </ul>
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })}
                  </DataTableBody>

                  <div className="card-inner">
                    {pagination.total > 0 && (
                      <PaginationComponent
                        itemPerPage={limit}
                        totalItems={pagination.total}
                        paginate={(p) =>
                          setSearchParams((sp) => {
                            sp.set("page", p);
                            return sp;
                          })
                        }
                        currentPage={page}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                  <p className="text-muted mb-1">No products found</p>
                  <small className="text-muted">Try adjusting your filters or search term</small>
                </div>
              )}
            </div>
          </Card>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default ProductList;
