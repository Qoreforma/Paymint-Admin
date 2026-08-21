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
  useUpdateProduct,
  useBulkToggleProductStatus,
  useBulkToggleProductHot,
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
const SIZE_OPTIONS = [
  "500MB", "1GB", "1.5GB", "2GB", "2.5GB", "3GB", "4GB", "5GB",
  "6GB", "7GB", "8GB", "10GB", "15GB", "20GB", "25GB", "30GB",
  "40GB", "50GB", "75GB", "100GB",
];
const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt", order: "desc", icon: "calendar" },
  { label: "Oldest First", value: "createdAt", order: "asc", icon: "calendar" },
  { label: "Data Size (A-Z)", value: "dataSize", order: "asc", icon: "db" },
  { label: "Data Size (Z-A)", value: "dataSize", order: "desc", icon: "db" },
  { label: "Name (A-Z)", value: "name", order: "asc", icon: "sort-v" },
  { label: "Name (Z-A)", value: "name", order: "desc", icon: "sort-v" },
  { label: "Validity (A-Z)", value: "validity", order: "asc", icon: "clock" },
  { label: "Validity (Z-A)", value: "validity", order: "desc", icon: "clock" },
  { label: "Validity Period (Daily → Yearly)", value: "validityPeriod", order: "asc", icon: "calender-date" },
  { label: "Price (Lowest → Highest)", value: "amount", order: "asc", icon: "money" },
  { label: "Price (Highest → Lowest)", value: "amount", order: "desc", icon: "money" },
  { label: "Provider Cost (Lowest → Highest)", value: "providerAmount", order: "asc", icon: "coins" },
  { label: "🔥 Hot Products First", value: "isHot", order: "desc", icon: "fire" },
];

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon }) => (
  <div className="col-12 col-sm-6 col-xl-3">
    <div
      className="card h-100"
      style={{
        borderRadius: 16,
        border: "none",
        boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <div className="card-body d-flex align-items-center gap-3 p-4 p-xl-4" style={{ minHeight: 120 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 28,
          }}
        >
          {icon}
        </div>
        <div>
          <div className="fw-bold fs-3 lh-1 text-dark" style={{ letterSpacing: "-0.5px" }}>
            {value !== undefined && value !== null && value !== "—"
              ? typeof value === "number"
                ? value.toLocaleString()
                : value
              : "—"}
          </div>
          <div className="text-muted small mt-2 fw-medium">{label}</div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Filter Pill ────────────────────────────────────────────────────────────
const FilterPill = ({ label, onClear }) => (
  <span
    className="badge d-inline-flex align-items-center gap-2"
    style={{
      background: "#dbeafe",
      color: "#1e40af",
      borderRadius: 8,
      padding: "10px 16px",
      fontWeight: 600,
      fontSize: 13,
      border: "1px solid #bfdbfe",
      display: "inline-flex",
      alignItems: "center",
      whiteSpace: "nowrap",
    }}
  >
    {label}
    <span
      style={{
        cursor: "pointer",
        fontWeight: 800,
        fontSize: 16,
        lineHeight: 1,
        marginLeft: 4,
        opacity: 0.7,
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => (e.target.style.opacity = "1")}
      onMouseLeave={(e) => (e.target.style.opacity = "0.7")}
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
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: isLoading ? "wait" : "pointer" }}
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

// ─── Product Detail Modal ───────────────────────────────────────────────────
const ProductDetailModal = ({ isOpen, toggle, product, onEdit }) => {
  if (!product) return null;
  const service = product.serviceId;
  const serviceType = service?.serviceTypeId;
  const provider = product.providerId;
  const margin = (product.amount || 0) - (product.providerAmount || 0);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <div className="modal-header border-bottom py-3 px-4">
        <div className="d-flex align-items-center gap-3">
          <img
            src={product.logo || service?.logo || NoIcon}
            alt={product.name}
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain" }}
          />
          <div>
            <h5 className="modal-title mb-0 fw-bold">{product.name}</h5>
            <span className="text-muted small">{product.code}</span>
          </div>
        </div>
        <button type="button" className="btn-close" onClick={toggle} aria-label="Close"></button>
      </div>

      <ModalBody className="p-4">
        {/* Top Badges & Status */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
          <span className={`badge ${product.isActive ? "bg-success" : "bg-danger"}`}>
            {product.isActive ? "Active" : "Inactive"}
          </span>
          {product.isHot && (
            <span className="badge bg-warning text-dark">🔥 Hot Product</span>
          )}
          {service?.name && (
            <span className="badge bg-light text-dark border">
              Service: {service.name}
            </span>
          )}
          {serviceType?.name && (
            <span className="badge" style={{ background: "#ede9fe", color: "#7c3aed" }}>
              {serviceType.name}
            </span>
          )}
          {provider?.name && (
            <span className="badge bg-info text-white">
              Provider: {provider.name}
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small d-block">Customer Price</span>
              <span className="fs-5 fw-bold text-dark">
                {formatter("NGN").format(product.amount || 0)}
              </span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small d-block">Provider Cost</span>
              <span className="fs-5 fw-bold text-dark">
                {formatter("NGN").format(product.providerAmount || 0)}
              </span>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="p-3 rounded-3 border"
              style={{ background: margin > 0 ? "#ecfdf5" : "#f8fafc" }}
            >
              <span className="text-muted small d-block">Profit Margin</span>
              <span
                className="fs-5 fw-bold"
                style={{ color: margin > 0 ? "#059669" : "#64748b" }}
              >
                {margin > 0 ? "+" : ""}{formatter("NGN").format(margin)}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details Grid */}
        <h6 className="fw-bold mb-3">Product Attributes</h6>
        <div className="row g-3">
          {product.dataSizeDisplay && (
            <div className="col-sm-6">
              <div className="border-bottom pb-2">
                <span className="text-muted small d-block">Data Size</span>
                <span className="fw-medium text-dark">{product.dataSizeDisplay}</span>
              </div>
            </div>
          )}

          {(product.validity || product.attributes?.validityPeriod) && (
            <div className="col-sm-6">
              <div className="border-bottom pb-2">
                <span className="text-muted small d-block">Validity Duration</span>
                <span className="fw-medium text-dark">
                  {product.validity || product.attributes?.validityPeriod}
                </span>
              </div>
            </div>
          )}

          {product.attributes?.dataType && (
            <div className="col-sm-6">
              <div className="border-bottom pb-2">
                <span className="text-muted small d-block">Data Type</span>
                <span className="fw-medium text-dark">{product.attributes.dataType}</span>
              </div>
            </div>
          )}

          {product.productType && (
            <div className="col-sm-6">
              <div className="border-bottom pb-2">
                <span className="text-muted small d-block">Category / Product Type</span>
                <span className="fw-medium text-dark">{product.productType}</span>
              </div>
            </div>
          )}

          {product.description && (
            <div className="col-12">
              <div className="border-bottom pb-2">
                <span className="text-muted small d-block">Description</span>
                <span className="text-dark">{product.description}</span>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <div className="modal-footer border-top px-4 py-3">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={toggle}
        >
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            toggle();
            onEdit(product);
          }}
        >
          <Icon name="edit" className="me-1" /> Edit Product
        </button>
      </div>
    </Modal>
  );
};

// ─── Adaptive Product Edit Modal ────────────────────────────────────────────
const ProductEditModal = ({ isOpen, toggle, product }) => {
  const { mutate: updateProduct, isLoading } = useUpdateProduct(product?._id);

  const isDataProduct = useMemo(() => {
    if (!product) return false;
    const typeCode = product.serviceId?.serviceTypeId?.code?.toLowerCase();
    const serviceCode = product.serviceId?.code?.toLowerCase();
    const name = product.name?.toLowerCase();
    return (
      typeCode === "data" ||
      serviceCode?.includes("data") ||
      name?.includes("data") ||
      !!product.attributes?.dataType ||
      !!product.dataSizeDisplay
    );
  }, [product]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    amount: "",
    providerAmount: "",
    description: "",
    dataSizeDisplay: "",
    dataType: "",
    validity: "",
    isHot: false,
    isActive: true,
  });

  // Sync state when product opens
  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        code: product.code || "",
        amount: product.amount || "",
        providerAmount: product.providerAmount || "",
        description: product.description || "",
        dataSizeDisplay: product.dataSizeDisplay || "",
        dataType: product.attributes?.dataType || "",
        validity: product.validity || product.attributes?.validityPeriod || "",
        isHot: !!product.isHot,
        isActive: product.isActive !== false,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product) return;

    const payload = {
      name: formData.name,
      code: formData.code,
      amount: Number(formData.amount),
      providerAmount: Number(formData.providerAmount),
      description: formData.description,
      isHot: formData.isHot,
      isActive: formData.isActive,
    };

    if (isDataProduct) {
      payload.dataSizeDisplay = formData.dataSizeDisplay;
      payload.validity = formData.validity;
      payload.attributes = {
        ...product.attributes,
        dataType: formData.dataType,
        validityPeriod: formData.validity,
      };
    }

    updateProduct(payload, {
      onSuccess: () => {
        toggle();
      },
    });
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <form onSubmit={handleSubmit}>
        <div className="modal-header border-bottom py-3 px-4">
          <div>
            <h5 className="modal-title fw-bold mb-0">Edit Product</h5>
            <span className="text-muted small">
              {product.name} ({product.serviceId?.name || "VAS Product"})
            </span>
          </div>
          <button type="button" className="btn-close" onClick={toggle} aria-label="Close"></button>
        </div>

        <ModalBody className="p-4">
          <div className="row g-3">
            {/* Name */}
            <div className="col-md-6">
              <label className="form-label fw-bold small">Product Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Code */}
            <div className="col-md-6">
              <label className="form-label fw-bold small">Product Code *</label>
              <input
                type="text"
                name="code"
                className="form-control"
                value={formData.code}
                onChange={handleChange}
                required
                disabled
              />
            </div>

            {/* Selling Amount */}
            <div className="col-md-6">
              <label className="form-label fw-bold small">Selling Amount (₦) *</label>
              <input
                type="number"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="any"
              />
            </div>

            {/* Provider Amount */}
            <div className="col-md-6">
              <label className="form-label fw-bold small">Provider Amount / Cost (₦) *</label>
              <input
                type="number"
                name="providerAmount"
                className="form-control"
                value={formData.providerAmount}
                onChange={handleChange}
                required
                min="0"
                step="any"
                disabled
              />
            </div>

            {/* Data-Specific Fields */}
            {isDataProduct && (
              <>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">Data Size (e.g. 1GB, 2.5GB)</label>
                  <input
                    type="text"
                    name="dataSizeDisplay"
                    className="form-control"
                    placeholder="e.g. 1GB"
                    value={formData.dataSizeDisplay}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold small">Data Type</label>
                  <select
                    name="dataType"
                    className="form-select"
                    value={formData.dataType}
                    onChange={handleChange}
                  >
                    <option value="">Select Data Type</option>
                    {DATA_TYPES.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold small">Validity Duration</label>
                  <select
                    name="validity"
                    className="form-select"
                    value={formData.validity}
                    onChange={handleChange}
                  >
                    <option value="">Select Validity</option>
                    {VALIDITY_OPTIONS.map((v) => (
                      <option key={v.value} value={v.label}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Description */}
            <div className="col-12 mt-4">
              <label className="form-label fw-bold small">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description (optional)"
              />
            </div>

            {/* Switches: Hot & Active */}
            <div className="col-md-6">
              <div className="custom-control custom-switch mt-2">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="edit-is-hot"
                  name="isHot"
                  checked={formData.isHot}
                  onChange={handleChange}
                />
                <label className="custom-control-label fw-bold text-dark" htmlFor="edit-is-hot">
                  🔥 Mark as Hot Product
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="custom-control custom-switch mt-2">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="edit-is-active"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <label className="custom-control-label fw-bold text-dark" htmlFor="edit-is-active">
                  Product Active Status
                </label>
              </div>
            </div>
          </div>
        </ModalBody>

        <div className="modal-footer border-top px-4 py-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={toggle}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
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
    dataSize: "",
    isHot: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pendingSearch, setPendingSearch] = useState("");

  // ── Selection & Modals ──
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  // ── Bulk mutations ──
  const { mutate: bulkToggleStatus, isLoading: isBulkingStatus } = useBulkToggleProductStatus();
  const { mutate: bulkToggleHot, isLoading: isBulkingHot } = useBulkToggleProductHot();

  // ── Data fetching ──
  const { isLoading, data } = useGetAllProducts(page, limit, {
    search: filters.search,
    providerId: filters.providerId,
    serviceTypeId: filters.serviceTypeId,
    serviceId: filters.serviceId,
    dataType: filters.dataType,
    validity: filters.validity,
    dataSize: filters.dataSize,
    isHot: filters.isHot,
    status: filters.status,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const { data: providersData } = useGetProviders(1, 200);
  const { data: serviceTypesData } = useGetServiceTypes();
  const { data: servicesData } = useGetServices();

  const products = data?.data?.products ?? [];
  const pagination = data?.data?.pagination ?? {};
  const stats = data?.data?.stats;

  // ── Dropdown options ──
  const providerOptions = useMemo(() => {
    const all = providersData?.data ?? [];
    const syncProviders = all.filter((p) => p.hasSync === true);
    const list = syncProviders.length > 0 ? syncProviders : all;
    return list.map((p) => ({ label: p.name, value: p._id }));
  }, [providersData]);
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
    setSelectedIds([]);
    setSearchParams((sp) => { sp.set("page", 1); return sp; });
  };

  const handleSort = (sortBy, sortOrder) => {
    setFilters((prev) => {
      let nextOrder = sortOrder;
      if (!nextOrder) {
        if (prev.sortBy === sortBy) {
          nextOrder = prev.sortOrder === "asc" ? "desc" : "asc";
        } else {
          nextOrder = (sortBy === "dataSize" || sortBy === "name" || sortBy === "validity" || sortBy === "amount" || sortBy === "providerAmount") ? "asc" : "desc";
        }
      }
      return {
        ...prev,
        sortBy,
        sortOrder: nextOrder,
      };
    });
    setSelectedIds([]);
    setSearchParams((sp) => {
      sp.set("page", 1);
      return sp;
    });
  };

  const currentSortOption = useMemo(() => {
    return (
      SORT_OPTIONS.find(
        (opt) => opt.value === filters.sortBy && opt.order === filters.sortOrder
      ) ||
      SORT_OPTIONS.find((opt) => opt.value === filters.sortBy) ||
      SORT_OPTIONS[0]
    );
  }, [filters.sortBy, filters.sortOrder]);

  const clearFilter = (key) => {
    if (key === "sortBy") {
      handleSort("createdAt", "desc");
      return;
    }
    setFilter(key, key === "isHot" || key === "status" ? "all" : "");
  };

  const activeFilters = Object.entries(filters).filter(([k, v]) => {
    if (k === "sortBy" && v === "createdAt" && filters.sortOrder === "desc") return false;
    if (k === "sortOrder") return false;
    return v && v !== "all" && v !== "";
  });

  const handleSearch = () => setFilter("search", pendingSearch);

  // Filtered products from server
  const filteredProducts = products;

  // ── Selection Handlers ──
  const isAllSelected = products.length > 0 && products.every((p) => selectedIds.includes(p._id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCurrentIds = products.map((p) => p._id);
      setSelectedIds((prev) => [...new Set([...prev, ...allCurrentIds])]);
    } else {
      const currentIdsSet = new Set(products.map((p) => p._id));
      setSelectedIds((prev) => prev.filter((id) => !currentIdsSet.has(id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ── Bulk Actions ──
  const handleBulkStatus = (isActive) => {
    if (!selectedIds.length) return;
    bulkToggleStatus(
      { productIds: selectedIds, isActive },
      { onSuccess: () => setSelectedIds([]) }
    );
  };

  const handleBulkHot = (isHot) => {
    if (!selectedIds.length) return;
    bulkToggleHot(
      { productIds: selectedIds, isHot },
      { onSuccess: () => setSelectedIds([]) }
    );
  };

  // ── Stats ──
  const totalCount = stats?.total ?? pagination.total ?? products.length;
  const activeCount = stats?.active;
  const inactiveCount = stats?.inactive;
  const hotCount = stats?.hot;

  return (
    <React.Fragment>
      <Head title="Products Management" />
      <Content className="px-4 px-xl-5 py-4">
        <div className="container-fluid px-0">
          <BlockHead size="sm" className="mb-4">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle page>Products Management</BlockTitle>
                <p className="text-muted small mt-1">
                  Manage all VAS products — toggle hot status, activate/deactivate, and filter by any dimension.
                </p>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          {/* ── Stat Cards (Enhanced padding, larger icons, bigger gaps) ── */}
          <Block>
            <div className="row g-4 mb-4">
              <StatCard
                label="Total Products"
                value={totalCount}
                color="linear-gradient(135deg,#e0e7ff,#c7d2fe)"
                icon="📦"
              />
              <StatCard
                label="Active Products"
                value={activeCount}
                color="linear-gradient(135deg,#d1fae5,#a7f3d0)"
                icon="✅"
              />
              <StatCard
                label="Inactive Products"
                value={inactiveCount}
                color="linear-gradient(135deg,#fee2e2,#fecaca)"
                icon="⛔"
              />
              <StatCard
                label="Hot Products 🔥"
                value={hotCount}
                color="linear-gradient(135deg,#fff7ed,#fed7aa)"
                icon="🔥"
              />
            </div>

            {/* ── Filter Panel Card (Spacious internal padding, distinct chip rows) ── */}
            <Card
              className="filter-panel-card mb-4"
              style={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
                position: "relative",
                zIndex: 30,
                overflow: "visible",
              }}
            >
              <div className="card-body p-4 p-xl-5" style={{ overflow: "visible" }}>
                {/* Top Row: Search, Sort & Quick Selects */}
                <div className="row g-3 align-items-center mb-3">
                  <div className="col-12 col-md-5 col-lg-4">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, code, description…"
                        value={pendingSearch}
                        onChange={(e) => setPendingSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        id="products-search"
                        style={{ fontSize: 13, height: 44, paddingLeft: 16 }}
                      />
                      <button className="btn btn-primary px-3" onClick={handleSearch} id="products-search-btn">
                        <Icon name="search" />
                      </button>
                    </div>
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="col-12 col-sm-6 col-md-3 col-lg-3">
                    <UncontrolledDropdown className="w-100">
                      <DropdownToggle
                        tag="button"
                        className="btn btn-outline-light text-dark border w-100 d-flex align-items-center justify-content-between text-truncate"
                        id="sort-dropdown-toggle"
                        style={{ height: 44, fontSize: 13, borderRadius: 8, background: "#ffffff" }}
                      >
                        <div className="d-flex align-items-center text-truncate me-2">
                          <Icon name={currentSortOption.icon || "sort-v"} className="me-1 text-primary flex-shrink-0" />
                          <span className="text-truncate">
                            Sort: <strong>{currentSortOption.label}</strong>
                          </span>
                        </div>
                        <Icon name="chevron-down" className="flex-shrink-0 ms-1" />
                      </DropdownToggle>
                      <DropdownMenu container="body" style={{ maxHeight: 320, overflowY: "auto", minWidth: 260, zIndex: 1060 }}>
                        <div className="px-3 py-1 text-muted small fw-bold text-uppercase" style={{ fontSize: 10, letterSpacing: 0.5 }}>
                          Sort Options
                        </div>
                        <DropdownItem divider className="my-1" />
                        {SORT_OPTIONS.map((opt) => (
                          <DropdownItem
                            key={`${opt.value}-${opt.order}`}
                            onClick={() => handleSort(opt.value, opt.order)}
                            className={filters.sortBy === opt.value && filters.sortOrder === opt.order ? "fw-bold text-primary bg-light" : ""}
                            style={{ fontSize: 13, padding: "8px 16px" }}
                          >
                            <Icon name={opt.icon || "sort-v"} className="me-2 text-secondary" />
                            {opt.label}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </div>

                  <div className="col-6 col-sm-3 col-md-2 col-lg-2">
                    <select
                      className="form-select"
                      value={filters.isHot}
                      onChange={(e) => setFilter("isHot", e.target.value)}
                      id="filter-hot"
                      style={{ fontSize: 13, height: 44 }}
                    >
                      <option value="all">🔥 All (Hot & Regular)</option>
                      <option value="true">🔥 Hot Products Only</option>
                      <option value="false">Regular Products Only</option>
                    </select>
                  </div>

                  <div className="col-6 col-sm-3 col-md-2 col-lg-3 d-flex align-items-center gap-2">
                    <select
                      className="form-select flex-grow-1"
                      value={filters.status}
                      onChange={(e) => setFilter("status", e.target.value)}
                      id="filter-status"
                      style={{ fontSize: 13, height: 44 }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="true">Active Only</option>
                      <option value="false">Inactive Only</option>
                    </select>
                  </div>
                </div>

                {/* Second Row: Dimension Dropdown Chips & Reset Button */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-4 mt-2">
                  <div className="d-flex flex-wrap gap-2">
                    {/* Provider */}
                    <UncontrolledDropdown>
                      <DropdownToggle
                        tag="button"
                        className={`btn btn-sm ${filters.providerId ? "btn-primary" : "btn-outline-light text-dark border"}`}
                        id="filter-provider-toggle"
                        style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8 }}
                      >
                        <Icon name="rss" className="me-1" />
                        {filters.providerId
                          ? providerOptions.find((p) => p.value === filters.providerId)?.label ?? "Provider"
                          : "Provider"}
                        <Icon name="chevron-down" className="ms-1" />
                      </DropdownToggle>
                      <DropdownMenu container="body" style={{ maxHeight: 260, overflowY: "auto", minWidth: 200, zIndex: 1060 }}>
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
                        className={`btn btn-sm ${filters.serviceTypeId ? "btn-primary" : "btn-outline-light text-dark border"}`}
                        id="filter-service-type-toggle"
                        style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8 }}
                      >
                        <Icon name="shield-star-fill" className="me-1" />
                        {filters.serviceTypeId
                          ? serviceTypeOptions.find((st) => st.value === filters.serviceTypeId)?.label ?? "Service Type"
                          : "Service Type"}
                        <Icon name="chevron-down" className="ms-1" />
                      </DropdownToggle>
                      <DropdownMenu container="body" style={{ maxHeight: 260, overflowY: "auto", minWidth: 200, zIndex: 1060 }}>
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
                        className={`btn btn-sm ${filters.serviceId ? "btn-primary" : "btn-outline-light text-dark border"}`}
                        id="filter-service-toggle"
                        style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8 }}
                      >
                        <Icon name="network" className="me-1" />
                        {filters.serviceId
                          ? serviceOptions.find((s) => s.value === filters.serviceId)?.label ?? "Service"
                          : "Service"}
                        <Icon name="chevron-down" className="ms-1" />
                      </DropdownToggle>
                      <DropdownMenu container="body" style={{ maxHeight: 260, overflowY: "auto", minWidth: 200, zIndex: 1060 }}>
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
                        className={`btn btn-sm ${filters.dataType ? "btn-primary" : "btn-outline-light text-dark border"}`}
                        id="filter-datatype-toggle"
                        style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8 }}
                      >
                        <Icon name="signal" className="me-1" />
                        {filters.dataType || "Data Type"}
                        <Icon name="chevron-down" className="ms-1" />
                      </DropdownToggle>
                      <DropdownMenu container="body" style={{ zIndex: 1060 }}>
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
                        className={`btn btn-sm ${filters.validity ? "btn-primary" : "btn-outline-light text-dark border"}`}
                        id="filter-validity-toggle"
                        style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8 }}
                      >
                        <Icon name="clock" className="me-1" />
                        {filters.validity
                          ? VALIDITY_OPTIONS.find((v) => v.value === filters.validity)?.label ?? filters.validity
                          : "Validity"}
                        <Icon name="chevron-down" className="ms-1" />
                      </DropdownToggle>
                      <DropdownMenu container="body" style={{ zIndex: 1060 }}>
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

                    {/* Data Size */}
                    <UncontrolledDropdown>
                      <DropdownToggle
                        tag="button"
                        className={`btn btn-sm ${filters.dataSize ? "btn-primary" : "btn-outline-light text-dark border"}`}
                        id="filter-datasize-toggle"
                        style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8 }}
                      >
                        <Icon name="db" className="me-1" />
                        {filters.dataSize || "Data Size"}
                        <Icon name="chevron-down" className="ms-1" />
                      </DropdownToggle>
                      <DropdownMenu container="body" style={{ maxHeight: 260, overflowY: "auto", zIndex: 1060 }}>
                        <DropdownItem onClick={() => setFilter("dataSize", "")} className={!filters.dataSize ? "fw-bold" : ""}>
                          All Sizes
                        </DropdownItem>
                        <DropdownItem divider />
                        {SIZE_OPTIONS.map((s) => (
                          <DropdownItem key={s} onClick={() => setFilter("dataSize", s)} className={filters.dataSize === s ? "fw-bold text-primary" : ""}>
                            {s}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </div>
                </div>

                {/* Active Filter Pills – Spacious Display */}
                {activeFilters.length > 0 && (
                  <div className="mt-4 pt-4 border-top">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                      <span className="text-dark fw-bold" style={{ fontSize: 14 }}>
                        Active filters & sort:
                      </span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8, flexShrink: 0 }}
                        onClick={() => {
                          setFilters({ search: "", providerId: "", serviceTypeId: "", serviceId: "", dataType: "", validity: "", dataSize: "", isHot: "all", status: "all", sortBy: "createdAt", sortOrder: "desc" });
                          setPendingSearch("");
                          setSearchParams((sp) => { sp.set("page", 1); return sp; });
                        }}
                      >
                        <Icon name="cross" className="me-1" />
                        Reset All Filters & Sort
                      </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {activeFilters.map(([key, val]) => {
                        let label = `${key}: ${val}`;
                        if (key === "sortBy") label = `Sort: ${currentSortOption.label}`;
                        if (key === "providerId") label = `Provider: ${providerOptions.find((p) => p.value === val)?.label ?? val}`;
                        if (key === "serviceTypeId") label = `Type: ${serviceTypeOptions.find((st) => st.value === val)?.label ?? val}`;
                        if (key === "serviceId") label = `Service: ${serviceOptions.find((s) => s.value === val)?.label ?? val}`;
                        if (key === "dataType") label = `Data Type: ${val}`;
                        if (key === "dataSize") label = `Size: ${val}`;
                        if (key === "validity") label = `Validity: ${VALIDITY_OPTIONS.find((v) => v.value === val)?.label ?? val}`;
                        if (key === "isHot") label = val === "true" ? "🔥 Hot Only" : "Regular Only";
                        if (key === "status") label = val === "true" ? "✅ Active" : "⛔ Inactive";
                        if (key === "search") label = `Search: "${val}"`;
                        return <FilterPill key={key} label={label} onClear={() => clearFilter(key)} />;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* ── Bulk Actions Floating Toolbar (Generous padding, bold badge, distinct action groups) ── */}
            {selectedIds.length > 0 && (
              <div
                className="p-4 mb-4 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-lg"
                style={{
                  background: "#0f172a",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 16,
                  boxShadow: "0 12px 36px rgba(15, 23, 42, 0.45)",
                  minHeight: 72,
                }}
              >
                {/* Left: Bold Enclosed Counter Badge */}
                <div className="d-flex align-items-center gap-3">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      color: "#ffffff",
                      fontWeight: 900,
                      fontSize: 18,
                      minWidth: 46,
                      height: 46,
                      borderRadius: "50%",
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.75)",
                    }}
                  >
                    {selectedIds.length}
                  </span>
                  <span style={{ color: "#f8fafc", fontWeight: 800, fontSize: 16, letterSpacing: "-0.2px" }}>
                    {selectedIds.length === 1 ? "Product Selected" : "Products Selected"}
                  </span>
                </div>

                {/* Right: Grouped Action Buttons with 14px gaps and dividers */}
                <div className="d-flex flex-wrap align-items-center" style={{ gap: 16 }}>
                  {/* Group 1: Hot Actions */}
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <button
                      type="button"
                      className="btn d-inline-flex align-items-center justify-content-center gap-1"
                      style={{
                        background: "linear-gradient(135deg, #f97316, #ea580c)",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: 600,
                        padding: "9px 20px",
                        borderRadius: 9,
                        fontSize: 13,
                        boxShadow: "0 2px 10px rgba(249, 115, 22, 0.45)",
                        lineHeight: 1.4,
                      }}
                      onClick={() => handleBulkHot(true)}
                      disabled={isBulkingHot}
                    >
                      🔥 Mark as Hot
                    </button>

                    <button
                      type="button"
                      className="btn d-inline-flex align-items-center justify-content-center gap-1"
                      style={{
                        background: "transparent",
                        color: "#ffffff",
                        border: "1.5px solid #ffffff",
                        fontWeight: 600,
                        padding: "9px 20px",
                        borderRadius: 9,
                        fontSize: 13,
                        lineHeight: 1.4,
                      }}
                      onClick={() => handleBulkHot(false)}
                      disabled={isBulkingHot}
                    >
                      Remove from Hot
                    </button>
                  </div>

                  {/* Vertical Divider */}
                  <div
                    className="d-none d-lg-block"
                    style={{
                      width: 1.5,
                      height: 34,
                      background: "rgba(255, 255, 255, 0.25)",
                      margin: "0 4px",
                    }}
                  />

                  {/* Group 2: Status Actions */}
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <button
                      type="button"
                      className="btn d-inline-flex align-items-center justify-content-center gap-1"
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: 600,
                        padding: "9px 20px",
                        borderRadius: 9,
                        fontSize: 13,
                        boxShadow: "0 2px 10px rgba(16, 185, 129, 0.45)",
                        lineHeight: 1.4,
                      }}
                      onClick={() => handleBulkStatus(true)}
                      disabled={isBulkingStatus}
                    >
                      ✅ Activate
                    </button>

                    <button
                      type="button"
                      className="btn d-inline-flex align-items-center justify-content-center gap-1"
                      style={{
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: 600,
                        padding: "9px 20px",
                        borderRadius: 9,
                        fontSize: 13,
                        boxShadow: "0 2px 10px rgba(239, 68, 68, 0.45)",
                        lineHeight: 1.4,
                      }}
                      onClick={() => handleBulkStatus(false)}
                      disabled={isBulkingStatus}
                    >
                      ⛔ Deactivate
                    </button>
                  </div>

                  {/* Vertical Divider */}
                  <div
                    className="d-none d-lg-block"
                    style={{
                      width: 1.5,
                      height: 34,
                      background: "rgba(255, 255, 255, 0.25)",
                      margin: "0 4px",
                    }}
                  />

                  {/* Group 3: Deselect All (Prominent secondary button with X icon) */}
                  <button
                    type="button"
                    className="btn d-inline-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      border: "1.5px solid rgba(255, 255, 255, 0.35)",
                      fontWeight: 600,
                      padding: "9px 20px",
                      borderRadius: 9,
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                    onClick={() => setSelectedIds([])}
                  >
                    <span style={{ fontWeight: 800, fontSize: 14 }}>✕</span> Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* ── Products Table ── */}
            <Card
              className="products-table-card mb-4"
              style={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
                position: "relative",
                zIndex: 10,
              }}
            >
              <div className="card-inner border-bottom d-flex align-items-center justify-content-between py-4 px-4 px-xl-5">
                <h6 className="title mb-0 fs-5 fw-bold">
                  All Products
                  {totalCount > 0 && (
                    <Badge color="light" className="ms-2 text-primary fw-bold" style={{ fontSize: 12 }}>
                      {totalCount.toLocaleString()}
                    </Badge>
                  )}
                </h6>
              </div>

              <div className="card-inner p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : filteredProducts.length > 0 ? (
                  <>
                    <div className="nk-tb-scroll-wrap">
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        {/* Checkbox column with generous left edge padding */}
                        <DataTableRow style={{ width: 60 }}>
                          <div className="custom-control custom-control-sm custom-checkbox ps-2">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="select-all-products"
                              checked={isAllSelected}
                              onChange={handleSelectAll}
                            />
                            <label className="custom-control-label" htmlFor="select-all-products" />
                          </div>
                        </DataTableRow>

                        <DataTableRow>
                          <div
                            className="d-flex align-items-center gap-1 user-select-none"
                            onClick={() => handleSort("name")}
                            title="Sort by Name (Click to toggle A-Z / Z-A)"
                            style={{ cursor: "pointer" }}
                          >
                            <span className={filters.sortBy === "name" ? "text-primary fw-bold" : ""}>Product</span>
                            <Icon
                              name={filters.sortBy === "name" ? (filters.sortOrder === "asc" ? "arrow-up" : "arrow-down") : "sort-v"}
                              className={filters.sortBy === "name" ? "text-primary" : "text-muted opacity-50"}
                              style={{ fontSize: 11 }}
                            />
                          </div>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>Service / Type</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>Provider</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <div
                            className="d-flex align-items-center gap-1 user-select-none"
                            onClick={() => handleSort("dataSize")}
                            title="Sort by Data Size (Click to toggle Smallest / Largest)"
                            style={{ cursor: "pointer" }}
                          >
                            <span className={filters.sortBy === "dataSize" ? "text-primary fw-bold" : ""}>Size / Validity</span>
                            <Icon
                              name={filters.sortBy === "dataSize" ? (filters.sortOrder === "asc" ? "arrow-up" : "arrow-down") : "sort-v"}
                              className={filters.sortBy === "dataSize" ? "text-primary" : "text-muted opacity-50"}
                              style={{ fontSize: 11 }}
                            />
                          </div>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <div
                            className="d-flex align-items-center gap-1 user-select-none"
                            onClick={() => handleSort("amount")}
                            title="Sort by Price (Click to toggle Lowest / Highest)"
                            style={{ cursor: "pointer" }}
                          >
                            <span className={filters.sortBy === "amount" ? "text-primary fw-bold" : ""}>Amount</span>
                            <Icon
                              name={filters.sortBy === "amount" ? (filters.sortOrder === "asc" ? "arrow-up" : "arrow-down") : "sort-v"}
                              className={filters.sortBy === "amount" ? "text-primary" : "text-muted opacity-50"}
                              style={{ fontSize: 11 }}
                            />
                          </div>
                        </DataTableRow>
                        <DataTableRow className="text-center" style={{ width: 100 }}>
                          <div
                            className="d-flex align-items-center justify-content-center gap-1 user-select-none"
                            onClick={() => handleSort("isHot", filters.sortBy === "isHot" && filters.sortOrder === "desc" ? "asc" : "desc")}
                            title="Sort by Hot Products"
                            style={{ cursor: "pointer" }}
                          >
                            <span className={filters.sortBy === "isHot" ? "text-warning fw-bold" : ""}>🔥 Hot</span>
                            <Icon
                              name={filters.sortBy === "isHot" ? (filters.sortOrder === "desc" ? "arrow-down" : "arrow-up") : "sort-v"}
                              className={filters.sortBy === "isHot" ? "text-warning" : "text-muted opacity-50"}
                              style={{ fontSize: 11 }}
                            />
                          </div>
                        </DataTableRow>
                        <DataTableRow style={{ width: 110 }}>
                          <div
                            className="d-flex align-items-center gap-1 user-select-none"
                            onClick={() => handleSort("status", filters.sortBy === "status" && filters.sortOrder === "desc" ? "asc" : "desc")}
                            title="Sort by Status"
                            style={{ cursor: "pointer" }}
                          >
                            <span className={filters.sortBy === "status" ? "text-primary fw-bold" : ""}>Status</span>
                            <Icon
                              name={filters.sortBy === "status" ? (filters.sortOrder === "desc" ? "arrow-down" : "arrow-up") : "sort-v"}
                              className={filters.sortBy === "status" ? "text-primary" : "text-muted opacity-50"}
                              style={{ fontSize: 11 }}
                            />
                          </div>
                        </DataTableRow>
                        <DataTableRow className="nk-tb-col-tools">
                          <span></span>
                        </DataTableRow>
                      </DataTableHead>

                      {filteredProducts.map((item) => {
                        const service = item.serviceId;
                        const serviceType = service?.serviceTypeId;
                        const provider = item.providerId;
                        const margin = (item.amount || 0) - (item.providerAmount || 0);
                        const isSelected = selectedIds.includes(item._id);

                        return (
                          <DataTableItem
                            key={item._id}
                            className={`text-secondary ${isSelected ? "product-row-selected" : ""}`}
                          >
                            {/* Checkbox */}
                            <DataTableRow style={{ width: 60 }}>
                              <div className="custom-control custom-control-sm custom-checkbox ps-2">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={`select-prod-${item._id}`}
                                  checked={isSelected}
                                  onChange={() => handleSelectOne(item._id)}
                                />
                                <label className="custom-control-label" htmlFor={`select-prod-${item._id}`} />
                              </div>
                            </DataTableRow>

                            {/* Product info */}
                            <DataTableRow>
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={item.logo || service?.logo || NoIcon}
                                  alt={item.name}
                                  style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain", flexShrink: 0 }}
                                />
                                <div>
                                  <div
                                    className="fw-medium text-dark"
                                    style={{ fontSize: 13, lineHeight: 1.3, cursor: "pointer" }}
                                    onClick={() => setDetailProduct(item)}
                                  >
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
                              <div className="d-flex flex-wrap align-items-center gap-1">
                                {service?.name && (
                                  <span
                                    className="badge text-secondary border bg-light"
                                    style={{ fontSize: 11, fontWeight: 500 }}
                                  >
                                    {service.name}
                                  </span>
                                )}
                                {serviceType?.name && (
                                  <span
                                    className="badge"
                                    style={{
                                      background: "#ede9fe",
                                      color: "#7c3aed",
                                      fontSize: 10,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {serviceType.name}
                                  </span>
                                )}
                                {item.attributes?.dataType && (
                                  <span
                                    className="badge"
                                    style={{ background: "#ecfdf5", color: "#059669", fontSize: 10 }}
                                  >
                                    {item.attributes.dataType}
                                  </span>
                                )}
                              </div>
                            </DataTableRow>

                            {/* Provider */}
                            <DataTableRow size="sm">
                              {provider?.name ? (
                                <div className="d-flex align-items-center gap-1">
                                  <img
                                    src={provider?.logo || NoIcon}
                                    alt={provider.name}
                                    style={{ width: 24, height: 24, borderRadius: 4, objectFit: "contain" }}
                                  />
                                  <span style={{ fontSize: 12, fontWeight: 500 }}>{provider.name}</span>
                                </div>
                              ) : (
                                <span className="text-muted small">—</span>
                              )}
                            </DataTableRow>

                            {/* Size / Validity */}
                            <DataTableRow size="sm">
                              <div style={{ fontSize: 12 }}>
                                {item.dataSizeDisplay && (
                                  <div className="fw-medium text-dark">{item.dataSizeDisplay}</div>
                                )}
                                {(item.validity || item.attributes?.validityPeriod) && (
                                  <div className="text-muted small">
                                    {item.validity || item.attributes?.validityPeriod}
                                  </div>
                                )}
                              </div>
                            </DataTableRow>

                            {/* Amount */}
                            <DataTableRow size="sm">
                              <div>
                                <div className="fw-bold text-dark" style={{ fontSize: 13 }}>
                                  {formatter("NGN").format(item.amount)}
                                </div>
                                {margin > 0 && (
                                  <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 500 }}>
                                    +{formatter("NGN").format(margin)} margin
                                  </div>
                                )}
                              </div>
                            </DataTableRow>

                            {/* Hot Toggle */}
                            <DataTableRow className="text-center">
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
                                    <DropdownMenu end style={{ zIndex: 1060 }}>
                                      <ul className="link-list-opt no-bdr">
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#details"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setDetailProduct(item);
                                            }}
                                          >
                                            <Icon name="eye" />
                                            <span>View Details</span>
                                          </DropdownItem>
                                        </li>
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditProduct(item);
                                            }}
                                          >
                                            <Icon name="edit" />
                                            <span>Edit Product</span>
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
                    </div>

                    <div className="card-inner py-4 px-4 px-xl-5 d-flex flex-wrap align-items-center justify-content-between gap-3">
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
                      
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Show</span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "80px", cursor: "pointer" }}
                          value={limit}
                          onChange={(e) => {
                            setSearchParams((sp) => {
                              sp.set("limit", e.target.value);
                              sp.set("page", 1);
                              return sp;
                            });
                          }}
                        >
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                          <option value="200">200</option>
                        </select>
                        <span className="text-muted small">per page</span>
                      </div>

                      {filters.dataSize && filteredProducts?.length === 0 && (
                        <p className="text-muted small mt-2 mb-0 w-100">
                          No products match size <strong>{filters.dataSize}</strong> on this page. Try a different page or clear the size filter.
                        </p>
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
        </div>

        {/* Detail Modal */}
        <ProductDetailModal
          isOpen={!!detailProduct}
          toggle={() => setDetailProduct(null)}
          product={detailProduct}
          onEdit={(prod) => setEditProduct(prod)}
        />

        {/* Adaptive Edit Modal */}
        <ProductEditModal
          isOpen={!!editProduct}
          toggle={() => setEditProduct(null)}
          product={editProduct}
        />
      </Content>
    </React.Fragment>
  );
};

export default ProductList;
