import React, { useState, useEffect, useCallback } from "react";
import Head from "../../../../layout/head/Head";
import Content from "../../../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockTitle,
  BlockBetween,
  BlockHeadContent,
  Icon,
  Row,
  Col,
  Button,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableItem,
  PaginationComponent,
} from "../../../../components/Component";
import DatePicker from "react-datepicker";
import { Card, DropdownItem, UncontrolledDropdown, DropdownMenu, DropdownToggle, Badge } from "reactstrap";
import { useForm } from "react-hook-form";
import { Modal, ModalBody } from "reactstrap";
import { RSelect } from "../../../../components/Component";
import { couponStatusOptions } from "./couponsdata";
import { formatDate, getDateStructured, getDateStructure } from "../../../../utils/Utils";
import { useCreateCoupon, useDeleteCoupon, useGetAllCoupons, useUpdateCoupons } from "../../../../api/coupons/coupons";
import LoadingSpinner from "../../../components/spinner";
import { useSearchParams } from "react-router-dom";
import SortToolTip from "../tables/SortTooltip";
import Search from "../tables/Search";

const CouponsPage = () => {
  const [editId, setEditedId] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const { data: coupons, isLoading } = useGetAllCoupons(currentPage, itemsPerPage, search);
  const { mutate: createCoupon } = useCreateCoupon();
  const { mutate: updateCoupon } = useUpdateCoupons();
  const { mutate: deleteCoupon } = useDeleteCoupon(editId);
  const [sm, updateSm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    startDate: new Date(),
    endDate: new Date(),
    targetCount: "",
    status: "",
  });
  const [view, setView] = useState({
    edit: false,
    add: false,
    details: false,
  });
  const [onSearch, setonSearch] = useState(false);
  const [filters, setfilters] = useState({});
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // function to close the form modal
  const onFormCancel = () => {
    setView({ edit: false, add: false, details: false });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discount: "",
      startDate: new Date(),
      endDate: new Date(),
      targetCount: "",
      status: "",
    });
    reset({});
  };

  const onFormSubmit = (form) => {
    let submittedData = {
      code: formData.code,
      discount: formData.discount,
      startDate: getDateStructure(formData.startDate),
      endDate: getDateStructure(formData.endDate),
      target: Number(formData.targetCount),
      status: formData.status.toLocaleLowerCase(),
    };
    createCoupon(submittedData);
    setView({ edit: false, add: false, details: false });
    resetForm();
  };

  const onEditSubmit = () => {
    let submittedData = {
      couponId: editId,
      code: formData.code,
      discount: formData.discount,
      startDate: getDateStructure(formData.startDate),
      endDate: getDateStructure(formData.endDate),
      target: Number(formData.targetCount),
      status: formData.status.toLocaleLowerCase(),
    };
    updateCoupon(submittedData);
    resetForm();
    setView({ edit: false, add: false, details: false });
  };

  // function that formats set date for datepicker
  const getDateFormat = (value) => {
    const date = new Date(value);
    return date;
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    coupons?.data?.forEach((item) => {
      if (item._id === id) {
        setFormData({
          code: item.code,
          discount: item.discount,
          startDate: getDateFormat(item.startDate),
          endDate: getDateFormat(item.endDate),
          targetCount: item.target,
          status: item.status,
        });
      }
    });
    setEditedId(id);
    setView({ add: false, edit: true });
  };

  // function to filter data
  const filterData = useCallback(() => {
    return;
  }, []);

  // toggle function to view product details
  const toggle = (type) => {
    setView({
      edit: type === "edit" ? true : false,
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
    });
  };

  // Change Page
  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "active") {
      return "success";
    } else if (status === "used") {
      return "info";
    } else {
      return "danger";
    }
  }, []);

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  //scroll off when sidebar shows
  useEffect(() => {
    view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  }, [view.add]);
  return (
    <React.Fragment>
      <Head title="Coupons"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Coupons</BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <a
                  href="#more"
                  className="btn btn-icon btn-trigger toggle-expand me-n1"
                  onClick={(ev) => {
                    ev.preventDefault();
                    updateSm(!sm);
                  }}
                >
                  <Icon name="more-v"></Icon>
                </a>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    <li className="nk-block-tools-opt">
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
                        className="toggle d-none d-md-inline-flex"
                        color="primary"
                        onClick={() => {
                          toggle("add");
                        }}
                      >
                        <Icon name="plus"></Icon>
                        <span>Create coupon</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Coupons</h5>
                </div>
                <div className="card-tools me-n1">
                  <ul className="btn-toolbar gx-1">
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
                                  <label className="overline-title overline-title-alt">Status</label>
                                  <RSelect
                                    options={couponStatusOptions}
                                    placeholder="Any Status"
                                    value={filters.status && { label: filters.status, value: filters.status }}
                                    isSearchable={false}
                                    onChange={(e) => setfilters({ ...filters, status: e.label })}
                                  />
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
                                setfilters({});
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
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="coupon name" />
              </div>
            </div>
            <div className="card-inner-group">
              <div className="card-inner p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : coupons?.totalDocuments > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Code</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Discount(%)</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Validity</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Target Count</span>
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
                      {coupons?.data?.map((item) => {
                        return (
                          <DataTableItem key={item._id} className="text-secondary">
                            <DataTableRow size="sm" className="text-primary fw-bold">
                              <span className="title">{item.code}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item.discount}</span>
                            </DataTableRow>
                            <DataTableRow size="md" className="tnx-desc">
                              <span>{formatDate(item.startDate)}</span> - <span>{formatDate(item.endDate)}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span> {item.target > 0 ? item.target.toLocaleString() : 0}</span>
                            </DataTableRow>
                            <DataTableRow size="sm">
                              <span className={`dot bg-${statusColor(item.status)} d-sm-none`}></span>
                              <Badge
                                className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                                color={statusColor(item.status)}
                              >
                                <span className="text-capitalize">{item.status}</span>
                              </Badge>
                            </DataTableRow>
                            <DataTableRow className="nk-tb-col-tools">
                              <ul className="nk-tb-actions gx-1 my-n1">
                                <li className="me-n1">
                                  <UncontrolledDropdown>
                                    <DropdownToggle
                                      tag="a"
                                      href="#more"
                                      onClick={(ev) => ev.preventDefault()}
                                      className="dropdown-toggle btn btn-icon btn-trigger"
                                    >
                                      <Icon name="more-h"></Icon>
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                      <ul className="link-list-opt no-bdr">
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              onEditClick(item._id);
                                              toggle("details");
                                            }}
                                          >
                                            <Icon name="eye"></Icon>
                                            <span>View</span>
                                          </DropdownItem>
                                        </li>
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#view"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              onEditClick(item._id);
                                              toggle("edit");
                                            }}
                                          >
                                            <Icon name="edit"></Icon>
                                            <span>Edit</span>
                                          </DropdownItem>
                                        </li>
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#remove"
                                            className="text-danger"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditedId(item._id);
                                              deleteCoupon();
                                            }}
                                          >
                                            <Icon name="cross"></Icon>
                                            <span>Delete</span>
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
                      {coupons?.totalDocuments > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={coupons?.totalDocuments}
                          paginate={paginate}
                          currentPage={Number(currentPage)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "1rem" }}>
                    <span className="text-silent">No coupon found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        {/* FROM DETAILS */}
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
            <div className="nk-modal-head">
              <h4 className="nk-modal-title title">
                Coupon code: <span className="text-primary">{formData.code}</span>
              </h4>
            </div>
            <div className="nk-tnx-details mt-sm-3">
              <Row className="gy-3">
                <Col lg={6}>
                  <span className="sub-text">Discount(%)</span>
                  <span className="caption-text">{formData.discount}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Target/User Count</span>
                  <span className="caption-text">{formData.targetCount.toLocaleString()}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">Start Date</span>
                  <span className="caption-text">{getDateStructured(formData.startDate)}</span>
                </Col>
                <Col lg={6}>
                  <span className="sub-text">End Date</span>
                  <span className="caption-text">{getDateStructured(formData.endDate)}</span>
                </Col>

                <Col lg={6}>
                  <span className="sub-text">Status</span>
                  <span className={`dot bg-${statusColor(formData.status)} d-sm-none`}></span>
                  <Badge
                    className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                    color={statusColor(formData.status)}
                  >
                    <span className=" caption-text text-capitalize">{formData.status}</span>
                  </Badge>
                  {/* <span className="caption-text"> {.status}</span> */}
                </Col>
              </Row>
            </div>
          </ModalBody>
        </Modal>

        {/* FORM EDIT */}
        <Modal isOpen={view.edit || view.add} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
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
              <h5 className="title">{view.edit ? "Edit" : "Create"} Coupon</h5>
              <div className="mt-4">
                <form onSubmit={view.edit ? handleSubmit(onEditSubmit) : handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="code">
                          Coupon code
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register("code", {
                              required: "This field is required",
                            })}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            value={formData.code}
                          />
                          {errors.code && <span className="invalid">{errors.code.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="targetCount">
                          Discount(%)
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            {...register("discount", { required: "This is required" })}
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          />
                          {errors.discount && <span className="invalid">{errors.discount.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="start date">
                          Start Date
                        </label>
                        <div className="form-control-wrap">
                          <DatePicker
                            selected={formData.startDate}
                            className="form-control"
                            onChange={(date) => setFormData({ ...formData, startDate: date })}
                          />
                          {errors.startDate && <span className="invalid">{errors.startDate.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="end date">
                          End Date
                        </label>
                        <div className="form-control-wrap">
                          <DatePicker
                            selected={formData.endDate}
                            minDate={formData.startDate}
                            className="form-control"
                            onChange={(date) => setFormData({ ...formData, endDate: date })}
                          />
                          {errors.endDate && <span className="invalid">{errors.endDate.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="targetCount">
                          Target Count
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            {...register("targetCount", { required: "This is required" })}
                            value={formData.targetCount}
                            onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                          />
                          {errors.targetCount && <span className="invalid">{errors.targetCount.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="status">
                          Status
                        </label>
                        <div className="form-control-wrap">
                          <RSelect
                            name="status"
                            options={couponStatusOptions}
                            onChange={(e) => setFormData({ ...formData, status: e.value })}
                            // value={
                            //   view.edit
                            //     ? { value: formData.status, label: formData.status }
                            //     : { value: "Pending", label: "Pending" }
                            // }
                            value={{ value: formData.status, label: formData.status }}
                          />
                        </div>
                      </div>
                    </Col>

                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>{view.edit ? "Update" : "Add"} Coupon</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* CREATE COUPON */}

        {view.add && <div className="toggle-overlay" onClick={toggle}></div>}
      </Content>
    </React.Fragment>
  );
};

export default CouponsPage;
