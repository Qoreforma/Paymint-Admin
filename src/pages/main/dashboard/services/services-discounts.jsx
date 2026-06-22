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
import { useGetDiscounts, useToggleDiscount, useUpdateDiscount } from "../../../../api/service-providers";
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
  RSelect,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDateWithTime } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";

const ServicesDiscounts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { serviceName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId } = location.state || {};

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const [editId, setEditedId] = useState();
  const [onSearch, setonSearch] = useState(false);

  const { isLoading, data } = useGetDiscounts({ currentPage, size: itemsPerPage, serviceId });
  const { mutate: updateDiscount } = useUpdateDiscount(editId);
  const { mutate: toggleDiscount } = useToggleDiscount(editId);

  //   console.log(data);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    provider_amount: "",
    value: "",
    type: "",
  });

  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
  });

  // toggle function to view order detailse

  const toggle = (type) => {
    setView({
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
      edit: type === "edit" ? true : false,
    });
  };

  // resets forms
  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      provider_amount: "",
      value: "",
      type: "",
    });
  };

  // Submits form data
  const onFormSubmit = (form) => {
    // console.log(form);
    let submittedData = {
      value: form.value,
      type: formData.type,
    };
    updateDiscount(submittedData);
    // updateProduct(form);
    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          name: item?.name,
          amount: item.amount,
          provider_amount: item.provider_amount,
          type: item.type,
          value: item.value,
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
    formState: { errors },
  } = useForm();

  return (
    <React.Fragment>
      <Head title={`${serviceName} Discounts`}></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>{serviceName} Discounts</BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="light" outline className="bg-white d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                <Icon name="arrow-left"></Icon>
                <span>Back to Providers</span>
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
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Services</h5>
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
                ) : data?.data?.length > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Name</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Type</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Value</span>
                        </DataTableRow>
                        {/* <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Type</span>
                        </DataTableRow> */}

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
                      {data?.data?.map((item, idx) => {
                        return (
                          <DataTableItem key={item?._id} className="text-secondary">
                            <DataTableRow>
                              <span>{idx + 1}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-product">
                                <span className="title">{item.name}</span>
                              </span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item.type}</span>
                            </DataTableRow>{" "}
                            <DataTableRow>
                              <span>{item.value}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <div className="custom-control-sm custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  name={item.name}
                                  checked={item?.active}
                                  onClick={() => {
                                    setEditedId(item?._id);
                                    toggleDiscount({ active: !item?.active });
                                  }}
                                  id={item?._id}
                                />
                                <label className="custom-control-label" htmlFor={item?._id}>
                                  <span className={`ccap fw-medium ${item?.active ? "text-success" : ""}`}>
                                    {item.active ? "Active" : "Not Active"}
                                  </span>
                                </label>
                              </div>
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
                                            <span>Edit Discount</span>
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
                      {data?.data?.length > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={data?.data?.length}
                          paginate={paginate}
                          currentPage={Number(currentPage)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "1rem" }}>
                    <span className="text-silent">No Services found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        {/* ADD CATEGORIES */}
        <Modal isOpen={view.add || view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
          {/* <ModalBody className="bg-white rounded">
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
              <h5 className="title">Edit Product Price</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="bank_code">
                          Product Name
                        </label>
                        <div className="form-control-wrap">
                          <input
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
                        <label className="form-label" htmlFor="account_number">
                          New Amount
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
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
                          {errors.provider_amout && <span className="invalid">{errors.amount.provider_amount}</span>}
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
          </ModalBody> */}
          <ModalBody>
            <div className="p-2">
              <h5 className="title">Update {formData?.name}</h5>
              <form onSubmit={handleSubmit(onFormSubmit)}>
                <Row className="gy-4">
                  <Col md="6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="value">
                        Value
                      </label>
                      <input
                        id="value"
                        className="form-control"
                        defaultValue={formData.value}
                        placeholder="Enter Service Value"
                        pattern="[0-9]*[.,]?[0-9]*"
                        type="text"
                        inputmode="decimal"
                        {...register("value", {
                          required: "This field is required",
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="full-name">
                        Type
                      </label>
                      <RSelect
                        options={[
                          { label: "Flat", value: "flat" },
                          { label: "Percentage", value: "percentage" },
                        ]}
                        value={{
                          label: formData?.type?.charAt(0).toUpperCase() + formData.type.slice(1),
                          value: formData.type,
                        }}
                        onChange={(e) => setFormData({ ...formData, type: e.value })}
                        placeholder="Select Type"
                        isSearchable={false}
                      />
                    </div>
                  </Col>

                  <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button type="submit" color="primary" size="lg">
                          Update
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#dropdownitem"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setModal(false);
                          }}
                          className="link link-light"
                        >
                          Cancel
                        </a>
                      </li>
                    </ul>
                  </Col>
                </Row>
              </form>
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

export default ServicesDiscounts;
