import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  useDeleteProviderProduct,
  useGetProviderInfo,
  useGetServiceProducts,
  useToggleProvidersProducts,
  useUpdateProviderProduct,
} from "../../../../api/service-providers";
import { useToggleProductHot } from "../../../../api/product/products";
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
import { formatDateWithTime, formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import AddProductModal from "./modals/add-product";

// ─── Constants ────────────────────────────────────────────────
const DATA_TYPES_PP = ["SME", "GIFTING", "DIRECT", "CORPORATE GIFTING", "AWOOF"];
const VALIDITY_OPTIONS_PP = [
  "1 day", "7 days", "14 days", "30 days", "1 month", "2 months",
  "3 months", "6 months", "1 year", "weekly", "monthly", "yearly",
];
const SIZE_OPTIONS_PP = [
  "500MB", "1GB", "1.5GB", "2GB", "2.5GB", "3GB", "4GB", "5GB",
  "6GB", "7GB", "8GB", "10GB", "15GB", "20GB", "25GB", "30GB",
  "40GB", "50GB", "75GB", "100GB",
];

// ─── Hot Toggle ───────────────────────────────────────────────
const HotToggleCell = ({ productId, isHot }) => {
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
      {isHot && <span style={{ fontSize: 14 }}>🔥</span>}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const ServiceProvidersProducts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { providerId, code, type } = useParams();
  const location = useLocation();
  const name = location?.state?.providerName || "";

  const itemsPerPage = Number(searchParams.get("limit") ?? 100);
  const currentPage  = Number(searchParams.get("page")  ?? 1);

  const [editId, setEditedId] = useState();

  const { data: provider } = useGetProviderInfo(providerId);
  const { isLoading, data: products } = useGetServiceProducts(providerId, code, type);
  const { mutate: toggleProduct } = useToggleProvidersProducts(editId);
  const { mutate: updateProduct  } = useUpdateProviderProduct(editId);
  const { mutate: deleteProduct  } = useDeleteProviderProduct(editId);

  // ── Client-side filter state ──────────────────────────────
  const [pendingSearch, setPendingSearch] = useState("");
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");   // all | active | inactive
  const [filterHot,     setFilterHot]     = useState("all");   // all | hot | regular
  const [filterType,    setFilterType]    = useState("");
  const [filterValidity,setFilterValidity]= useState("");
  const [filterSize,    setFilterSize]    = useState("");

  const resetFilters = () => {
    setPendingSearch(""); setSearch("");
    setFilterStatus("all"); setFilterHot("all");
    setFilterType(""); setFilterValidity(""); setFilterSize("");
    setSearchParams((sp) => { sp.set("page", 1); return sp; });
  };

  const hasActiveFilters =
    search || filterStatus !== "all" || filterHot !== "all" ||
    filterType || filterValidity || filterSize;

  const allProducts = useMemo(() => products?.data ?? [], [products]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !(item.name || "").toLowerCase().includes(q) &&
          !(item.code || "").toLowerCase().includes(q)
        ) return false;
      }
      if (filterStatus === "active"   && !item.isActive) return false;
      if (filterStatus === "inactive" &&  item.isActive) return false;
      if (filterHot === "hot"     && !item.isHot) return false;
      if (filterHot === "regular" &&  item.isHot) return false;
      if (filterType) {
        const dt = (item.attributes?.dataType || item.productType || "").toUpperCase();
        if (dt !== filterType.toUpperCase()) return false;
      }
      if (filterValidity) {
        const v = (item.validity || item.attributes?.validityPeriod || "").toLowerCase();
        if (!v.includes(filterValidity.toLowerCase())) return false;
      }
      if (filterSize) {
        const sz = (item.dataSizeDisplay || "").toLowerCase();
        if (sz !== filterSize.toLowerCase()) return false;
      }
      return true;
    });
  }, [allProducts, search, filterStatus, filterHot, filterType, filterValidity, filterSize]);

  // Paginate filtered list client-side
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // ── Form / Edit state ─────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "", amount: "", provider_amount: "",
    dataSizeDisplay: "", validityPeriod: "", validity: "", dataType: "",
  });

  const [view, setView] = useState({
    add: false, details: false, edit: false, products: false,
  });

  const toggle = (t) =>
    setView({ add: t==="add", details: t==="details", edit: t==="edit", products: t==="products" });

  const resetForm = () =>
    setFormData({ name:"", amount:"", provider_amount:"", dataSizeDisplay:"", validityPeriod:"", validity:"", dataType:"" });

  const onFormSubmit = (form) => {
    updateProduct({
      amount: form.amount,
      name: form.name,
      providerAmount: form.provider_amount,
      dataSizeDisplay: form.dataSizeDisplay,
      validity: form.validity,
      attributes: { dataType: form.dataType, validityPeriod: form.validityPeriod },
    });
    setView({ add: false, details: false, edit: false, products: false });
    resetForm();
  };

  const onEditClick = (id) => {
    allProducts.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          name: item?.name,
          amount: item?.amount,
          provider_amount: item?.providerAmount,
          dataSizeDisplay: item?.dataSizeDisplay,
          validity: item?.validity,
          validityPeriod: item?.attributes?.validityPeriod,
          dataType: item?.attributes?.dataType,
        });
      }
    });
    setEditedId(id);
  };

  const { reset, register, handleSubmit, watch, formState: { errors } } = useForm();

  useEffect(() => { reset(formData); }, [formData]);

  const onFormCancel = () => {
    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  const paginate = (pageNumber) =>
    setSearchParams((sp) => { sp.set("page", pageNumber); return sp; });

  const total_amount = watch("amount");
  const difference   = total_amount - (formData?.provider_amount || 0);

  return (
    <React.Fragment>
      <Head title={`${provider?.data?.name || ""} ${name} products`}></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>
                {provider?.data?.name} {name} products
              </BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  color="light" outline
                  className="bg-white d-none d-sm-inline-flex"
                  onClick={() => navigate(-1)}
                >
                  <Icon name="arrow-left"></Icon>
                  <span>Back to Services</span>
                </Button>
                <a
                  href="#back"
                  onClick={(ev) => { ev.preventDefault(); navigate(-1); }}
                  className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                >
                  <Icon name="arrow-left"></Icon>
                </a>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <Card>
            {/* ── Filter Bar ──────────────────────────────────── */}
            <div className="pp-filter-bar">
              {/* Search */}
              <div className="input-group" style={{ flex: "1 1 220px", minWidth: 0 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or code…"
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setSearch(pendingSearch)}
                  id="pp-search"
                />
                <button
                  className="btn btn-primary px-3"
                  onClick={() => setSearch(pendingSearch)}
                  id="pp-search-btn"
                >
                  <Icon name="search" />
                </button>
              </div>

              {/* Status */}
              <select
                className="form-select pp-select"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); paginate(1); }}
                id="pp-filter-status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {/* Hot */}
              <select
                className="form-select pp-select"
                value={filterHot}
                onChange={(e) => { setFilterHot(e.target.value); paginate(1); }}
                id="pp-filter-hot"
              >
                <option value="all">🔥 All Products</option>
                <option value="hot">🔥 Hot Only</option>
                <option value="regular">Regular Only</option>
              </select>

              {/* Data Type */}
              <UncontrolledDropdown>
                <DropdownToggle
                  tag="button"
                  className={`btn btn-sm ${filterType ? "btn-primary" : "btn-outline-light text-dark border"}`}
                  style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, borderRadius: 8, height: 40 }}
                  id="pp-filter-datatype"
                >
                  <Icon name="signal" className="me-1" />
                  {filterType || "Data Type"}
                  <Icon name="chevron-down" className="ms-1" />
                </DropdownToggle>
                <DropdownMenu style={{ zIndex: 1060 }}>
                  <DropdownItem
                    onClick={() => { setFilterType(""); paginate(1); }}
                    className={!filterType ? "fw-bold" : ""}
                  >
                    All Data Types
                  </DropdownItem>
                  <DropdownItem divider />
                  {DATA_TYPES_PP.map((dt) => (
                    <DropdownItem
                      key={dt}
                      onClick={() => { setFilterType(dt); paginate(1); }}
                      className={filterType === dt ? "fw-bold text-primary" : ""}
                    >
                      {dt}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* Validity */}
              <UncontrolledDropdown>
                <DropdownToggle
                  tag="button"
                  className={`btn btn-sm ${filterValidity ? "btn-primary" : "btn-outline-light text-dark border"}`}
                  style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, borderRadius: 8, height: 40 }}
                  id="pp-filter-validity"
                >
                  <Icon name="clock" className="me-1" />
                  {filterValidity || "Validity"}
                  <Icon name="chevron-down" className="ms-1" />
                </DropdownToggle>
                <DropdownMenu style={{ maxHeight: 260, overflowY: "auto", zIndex: 1060 }}>
                  <DropdownItem
                    onClick={() => { setFilterValidity(""); paginate(1); }}
                    className={!filterValidity ? "fw-bold" : ""}
                  >
                    All Durations
                  </DropdownItem>
                  <DropdownItem divider />
                  {VALIDITY_OPTIONS_PP.map((v) => (
                    <DropdownItem
                      key={v}
                      onClick={() => { setFilterValidity(v); paginate(1); }}
                      className={filterValidity === v ? "fw-bold text-primary" : ""}
                    >
                      {v}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* Data Size */}
              <UncontrolledDropdown>
                <DropdownToggle
                  tag="button"
                  className={`btn btn-sm ${filterSize ? "btn-primary" : "btn-outline-light text-dark border"}`}
                  style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, borderRadius: 8, height: 40 }}
                  id="pp-filter-size"
                >
                  <Icon name="db" className="me-1" />
                  {filterSize || "Data Size"}
                  <Icon name="chevron-down" className="ms-1" />
                </DropdownToggle>
                <DropdownMenu style={{ maxHeight: 260, overflowY: "auto", zIndex: 1060 }}>
                  <DropdownItem
                    onClick={() => { setFilterSize(""); paginate(1); }}
                    className={!filterSize ? "fw-bold" : ""}
                  >
                    All Sizes
                  </DropdownItem>
                  <DropdownItem divider />
                  {SIZE_OPTIONS_PP.map((s) => (
                    <DropdownItem
                      key={s}
                      onClick={() => { setFilterSize(s); paginate(1); }}
                      className={filterSize === s ? "fw-bold text-primary" : ""}
                    >
                      {s}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, borderRadius: 8, height: 40 }}
                  onClick={resetFilters}
                >
                  <Icon name="cross" className="me-1" />
                  Reset
                </button>
              )}
            </div>

            {/* ── Table Header ────────────────────────────────── */}
            <div className="card-inner border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <h5 className="title mb-0 fw-bold">
                All Products
                <Badge
                  color="light"
                  className="ms-2 fw-bold"
                  style={{ fontSize: 12, color: "#0f3dac" }}
                >
                  {filteredProducts.length}
                  {filteredProducts.length !== allProducts.length && (
                    <span className="text-muted fw-normal"> / {allProducts.length}</span>
                  )}
                </Badge>
              </h5>
            </div>

            {/* ── Table Body ──────────────────────────────────── */}
            <div className="card-inner-group">
              <div className="card-inner p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : filteredProducts.length > 0 ? (
                  <>
                    <div className="provider-products-table-wrap">
                      <DataTableBody className="is-compact">
                        <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                          <DataTableRow>
                            <span>S/N</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>Name</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>Size</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>Validity</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>Provider Amount</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>Additional Amount</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>Amount</span>
                          </DataTableRow>
                          <DataTableRow size="sm">
                            <span>Type</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>Status</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>🔥 Hot</span>
                          </DataTableRow>
                          <DataTableRow className="nk-tb-col-tools">
                            <span></span>
                          </DataTableRow>
                        </DataTableHead>

                        {paginatedProducts.map((item, idx) => {
                          const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                          return (
                            <DataTableItem key={item?._id} className="text-secondary">
                              <DataTableRow>
                                <span>{globalIdx}</span>
                              </DataTableRow>
                              <DataTableRow>
                                <span className="tb-product">
                                  <img
                                    src={item.logo ? item.logo : NoIcon}
                                    alt={"logo for " + item.name}
                                    className="thumb-sm d-lg-inline-flex"
                                  />
                                  <span className="title d-none d-md-inline">{item.name}</span>
                                </span>
                              </DataTableRow>
                              <DataTableRow>
                                <span>{item.dataSizeDisplay || "—"}</span>
                              </DataTableRow>
                              <DataTableRow size="sm">
                                <span>
                                  {item.validity || item.attributes?.validityPeriod || "—"}
                                </span>
                              </DataTableRow>
                              <DataTableRow size="sm">
                                <span>{formatter("NGN").format(item.providerAmount)}</span>
                              </DataTableRow>
                              <DataTableRow size="sm">
                                <span>{formatter("NGN").format(item.additionalAmount ?? 0)}</span>
                              </DataTableRow>
                              <DataTableRow>
                                <span>{formatter("NGN").format(item.amount)}</span>
                              </DataTableRow>
                              <DataTableRow size="sm">
                                <span className="ccap">{item.serviceId?.name || "—"}</span>
                              </DataTableRow>
                              <DataTableRow>
                                <div className="custom-control-sm custom-switch">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    checked={!!item?.isActive}
                                    name={item.name}
                                    onChange={() => {
                                      setEditedId(item._id);
                                      toggleProduct({ isActive: !item?.isActive });
                                    }}
                                    id={`pp-status-${item?._id}`}
                                  />
                                  <label
                                    className="custom-control-label"
                                    htmlFor={`pp-status-${item?._id}`}
                                  >
                                    <span
                                      className={`ccap fw-medium d-none d-md-inline ${
                                        item?.isActive ? "text-success" : ""
                                      }`}
                                    >
                                      {item.isActive ? "active" : "inactive"}
                                    </span>
                                  </label>
                                </div>
                              </DataTableRow>
                              <DataTableRow>
                                <HotToggleCell productId={item._id} isHot={!!item.isHot} />
                              </DataTableRow>
                              <DataTableRow className="nk-tb-col-tools">
                                <ul className="nk-tb-actions gx-1 my-n1">
                                  <li>
                                    <UncontrolledDropdown>
                                      <DropdownToggle
                                        tag="a"
                                        className="btn btn-trigger dropdown-toggle btn-icon me-n1"
                                      >
                                        <Icon name="more-h"></Icon>
                                      </DropdownToggle>
                                      <DropdownMenu end style={{ zIndex: 1060 }}>
                                        <ul className="link-list-opt no-bdr">
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                onEditClick(item?._id);
                                                setView({ add: false, edit: true, details: false });
                                              }}
                                            >
                                              <Icon name="edit"></Icon>
                                              <span>Edit</span>
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

                    <div className="card-inner">
                      {filteredProducts.length > itemsPerPage && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={filteredProducts.length}
                          paginate={paginate}
                          currentPage={currentPage}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "2.5rem" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
                    <span className="text-silent d-block">
                      {hasActiveFilters
                        ? "No products match the current filters."
                        : "No Products found"}
                    </span>
                    {hasActiveFilters && (
                      <button
                        className="btn btn-sm btn-outline-secondary mt-2"
                        onClick={resetFilters}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        <AddProductModal modal={view.products} closeModal={() => onFormCancel()} />

        {/* ── Edit Modal ────────────────────────────────────── */}
        <Modal
          isOpen={view.edit}
          toggle={() => onFormCancel()}
          className="modal-dialog-centered"
          size="md"
        >
          <ModalBody className="bg-white rounded">
            <a href="#cancel" className="close">
              {" "}
              <Icon
                name="cross-sm"
                onClick={(ev) => { ev.preventDefault(); onFormCancel(); }}
              ></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Edit Product</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="pp-product-name">
                          Product Name
                        </label>
                        <div className="form-control-wrap">
                          <input
                            id="pp-product-name"
                            type="text"
                            className="form-control"
                            {...register("name", { required: "This field is required" })}
                            defaultValue={formData.name}
                          />
                          {errors.name && (
                            <span className="invalid">{errors.name.message}</span>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="pp-data-size">
                          Data Size
                        </label>
                        <div className="form-control-wrap">
                          <input
                            id="pp-data-size"
                            type="text"
                            className="form-control"
                            {...register("dataSizeDisplay", { required: "This field is required" })}
                            defaultValue={formData.dataSizeDisplay}
                          />
                          {errors.dataSizeDisplay && (
                            <span className="invalid">{errors.dataSizeDisplay.message}</span>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="pp-validity-top">
                          Validity (Top-Level)
                        </label>
                        <div className="form-control-wrap">
                          <input
                            id="pp-validity-top"
                            type="text"
                            className="form-control"
                            {...register("validity")}
                            defaultValue={formData.validity}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="pp-validity">
                          Validity Period (Attributes)
                        </label>
                        <div className="form-control-wrap">
                          <input
                            id="pp-validity"
                            type="text"
                            className="form-control"
                            {...register("validityPeriod")}
                            defaultValue={formData.validityPeriod}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="pp-amount">
                          New Amount
                        </label>
                        <div className="form-control-wrap">
                          <input
                            id="pp-amount"
                            type="text"
                            className="form-control"
                            {...register("amount", { required: "This field is required" })}
                            defaultValue={formData.amount}
                          />
                          {errors.amount && (
                            <span className="invalid">{errors.amount.message}</span>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label">Provider Amount</label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            {...register("provider_amount", { required: "This field is required" })}
                            disabled
                            defaultValue={formData.provider_amount}
                          />
                          {errors.provider_amount && (
                            <span className="invalid">{errors.provider_amount.message}</span>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label">Difference</label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            disabled
                            value={difference > 0 ? difference : 0}
                          />
                          {difference < 0 && (
                            <span className="invalid">
                              New amount is less than provider amount
                            </span>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Proceed</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* ── View Modal ────────────────────────────────────── */}
        <Modal
          isOpen={view.details}
          toggle={() => onFormCancel()}
          className="modal-dialog-centered"
          size="lg"
        >
          <ModalBody>
            <a href="#cancel" className="close">
              {" "}
              <Icon
                name="cross-sm"
                onClick={(ev) => { ev.preventDefault(); onFormCancel(); }}
              ></Icon>
            </a>
            <div className="p-2">
              <div className="nk-modal-head">
                <h5 className="title">View Provider</h5>
                <img src={formData.logo} alt="logo" />
              </div>
              <div className="mt-4">
                <Row className="gy-3">
                  <Col>
                    <span className="sub-text">Provider Name</span>
                    <span className="caption-text text-primary">{formData.name}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Product Type</span>
                    <span className="caption-text">
                      {formData.product_type?.map((item, index) => (
                        <span className="ccap pe-1" key={index}>{item}</span>
                      ))}
                    </span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Provider Status</span>
                    <span
                      className={`caption-text ${
                        formData.active ? "text-success" : "text-warning"
                      }`}
                    >
                      {formData.active ? "Active" : "Inactive"}
                    </span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Date Created</span>
                    <span className="caption-text">
                      {formatDateWithTime(formData.created_at)}
                    </span>
                  </Col>
                </Row>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default ServiceProvidersProducts;
