import React, { useCallback, useEffect, useState } from "react";
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
import Search from "../tables/Search";
import AddProductModal from "./modals/add-product";

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

const ServiceProvidersProducts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { providerId, code, type } = useParams();
  const location = useLocation();
  const name = location?.state?.providerName || "";

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const [editId, setEditedId] = useState();
  const [onSearch, setonSearch] = useState(false);

  const { data: provider } = useGetProviderInfo(providerId);
  const { isLoading, data: products } = useGetServiceProducts(providerId, code, type);
  const { mutate: toggleProduct } = useToggleProvidersProducts(editId);

  const { mutate: updateProduct } = useUpdateProviderProduct(editId);
  const { mutate: deleteProduct } = useDeleteProviderProduct(editId);

  // console.log(accounts);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    provider_amount: "",
    dataSizeDisplay: "",
    validityPeriod: "",
    dataType: "",
  });

  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
    products: false,
  });

  // toggle function to view order detailse

  const toggle = (type) => {
    setView({
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
      edit: type === "edit" ? true : false,
      products: type === "products" ? true : false,
    });
  };

  // resets forms
  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      provider_amount: "",
      dataSizeDisplay: "",
      validityPeriod: "",
      dataType: "",
    });
  };

  // Submits form data
  const onFormSubmit = (form) => {
    console.log(form);
    updateProduct({
      amount: form.amount,
      name: form.name,
      providerAmount: form.provider_amount,
      dataSizeDisplay: form.dataSizeDisplay,
      attributes: { dataType: form.dataType, validityPeriod: form.validityPeriod },
    });

    setView({ add: false, details: false, edit: false, products: false });
    resetForm();
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    products?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          name: item?.name,
          amount: item?.amount,
          provider_amount: item?.providerAmount,
          dataSizeDisplay: item?.dataSizeDisplay,
          validityPeriod: item?.attributes?.validityPeriod,
          dataType: item?.attributes?.dataType,
        });
      }
    });
    setEditedId(id);
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  // function to close the form modal
  const onFormCancel = () => {
    setView({ add: false, details: false, edit: false });
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

  const {
    reset,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const total_amount = watch("amount");
  const difference = total_amount - (formData?.provider_amount || 0);

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
                <Button color="light" outline className="bg-white d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                  <Icon name="arrow-left"></Icon>
                  <span>Back to Services</span>
                </Button>
                <a
                  href="#back"
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(-1);
                  }}
                  className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                >
                  <Icon name="arrow-left"></Icon>
                </a>

                {/* <Button
                  className="toggle d-none d-md-inline-flex ms-2"
                  color="secondary"
                  onClick={() => {
                    toggle("products");
                  }}
                >
                  <Icon name="bag"></Icon>
                  <span>Add Product</span>
                </Button> */}
                {/* <Button
                  className="toggle btn-icon ms-2 d-md-none"
                  color="secondary"
                  onClick={() => {
                    toggle("products");
                  }}
                >
                  <Icon name="bag"></Icon>
                </Button> */}
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Products</h5>
                </div>
                <div className="card-tools me-n1">
                  <ul className="btn-toolbar gx-1">
                    {/* <li>
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
                    </li> */}
                    {/* <li className="btn-toolbar-sep"></li> */}
                    {/* <li>
                      <FilterOptions options={} />
                    </li> */}
                    {/* <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                          <Icon name="setting"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end className="dropdown-menu-xs">
                          <SortToolTip />
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li> */}
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
                ) : products?.data?.length > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Name</span>
                        </DataTableRow>

                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Size</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Validity</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Provider Amount</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Additional Amount</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Type</span>
                        </DataTableRow>

                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Status</span>
                        </DataTableRow>

                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">🔥 Hot</span>
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
                      {products?.data?.map((item, idx) => {
                        return (
                          <DataTableItem key={item?._id} className="text-secondary">
                            <DataTableRow>
                              <span>{idx + 1}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-product">
                                <img
                                  src={item.logo ? item.logo : NoIcon}
                                  alt={"provider logo for " + item.name}
                                  className="thumb-sm  d-lg-inline-flex"
                                />
                                <span className="title d-none d-md-inline">{item.name}</span>
                              </span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="">{item.dataSizeDisplay}</span>
                            </DataTableRow>
                            <DataTableRow size="sm">
                              <span className="">{item.validity}</span>
                            </DataTableRow>
                            <DataTableRow size="sm">
                              <span>{formatter("NGN").format(item.providerAmount)}</span>
                            </DataTableRow>{" "}
                            <DataTableRow size="sm">
                              <span>{formatter("NGN").format(item.additionalAmount ?? 0)}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{formatter("NGN").format(item.amount)}</span>
                            </DataTableRow>
                            <DataTableRow size="sm">
                              <span className="ccap">{item.serviceId.name}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <div className="custom-control-sm custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  checked={item?.isActive}
                                  name={item.name}
                                  onChange={() => {
                                    setEditedId(item._id);
                                    toggleProduct({ isActive: !item?.isActive });
                                  }}
                                  id={item?._id}
                                />
                                <label className="custom-control-label" htmlFor={item?._id}>
                                  <span
                                    className={`ccap fw-medium d-none d-md-inline ${item?.isActive ? "text-success" : ""}`}
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
                                    <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
                                      <Icon name="more-h"></Icon>
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                      <ul className="link-list-opt no-bdr">
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#"
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
                                        {/* <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              onEditClick(item?._id);
                                              deleteProduct();
                                            }}
                                            className="text-danger"
                                          >
                                            <Icon name={"trash"}></Icon>
                                            <span>Delete</span>
                                          </DropdownItem>
                                        </li> */}
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
                      {products?.data?.length > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={products?.data?.length}
                          paginate={paginate}
                          currentPage={Number(currentPage)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "1rem" }}>
                    <span className="text-silent">No Products found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        <AddProductModal modal={view.products} closeModal={() => onFormCancel()} />
        {/* ADD CATEGORIES */}
        <Modal isOpen={view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
          <ModalBody className="bg-white rounded">
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
              <h5 className="title">Edit Product</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="product_name">
                          Product Name
                        </label>
                        <div className="form-control-wrap">
                          <input
                            id="product_name"
                            type="text"
                            className="form-control"
                            {...register("name", {
                              required: "This field is required",
                            })}
                            defaultValue={formData.name}
                          />
                          {errors.name && <span className="invalid">{errors.name.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="data_size">
                          Data Size
                        </label>
                        <div className="form-control-wrap">
                          <input
                            id="data_size"
                            type="text"
                            className="form-control"
                            {...register("dataSizeDisplay", {
                              required: "This field is required",
                            })}
                            defaultValue={formData.dataSizeDisplay}
                          />
                          {errors.dataSizeDisplay && <span className="invalid">{errors.dataSizeDisplay.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="validity_period">
                          Validity Period
                        </label>
                        <div className="form-control-wrap">
                          <input
                            id="validity_period"
                            type="text"
                            className="form-control"
                            {...register("validityPeriod", {
                              required: "This field is required",
                            })}
                            defaultValue={formData.validityPeriod}
                          />
                          {errors.validityPeriod && <span className="invalid">{errors.validityPeriod.message}</span>}
                        </div>
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account_number">
                          New Amount
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register("amount", {
                              required: "This field is required",
                            })}
                            defaultValue={formData.amount}
                          />
                          {errors.amount && <span className="invalid">{errors.amount.message}</span>}
                        </div>
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account_number">
                          Provider Amount
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            {...register("provider_amount", {
                              required: "This field is required",
                            })}
                            disabled
                            defaultValue={formData.provider_amount}
                          />
                          {errors.provider_amount && <span className="invalid">{errors.provider_amount.message}</span>}
                        </div>
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account_number">
                          Difference
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            disabled
                            value={difference > 0 ? difference : 0}
                          />

                          {difference < 0 && <span className="invalid">New amount is less than provider amount</span>}
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

        {/* View */}
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
                        <span className="ccap pe-1" key={index}>
                          {item}
                        </span>
                      ))}
                    </span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Provider Status</span>
                    <span className={`caption-text ${formData.active ? "text-success" : "text-warning"}`}>
                      {formData.active ? "Active" : "Inactive"}
                    </span>
                  </Col>

                  <Col lg={6}>
                    <span className="sub-text">Date Created</span>
                    <span className="caption-text">{formatDateWithTime(formData.created_at)}</span>
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
