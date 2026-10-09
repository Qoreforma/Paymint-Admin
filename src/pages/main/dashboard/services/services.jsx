import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoIcon from "../../../../images/no-image-icon.png";
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
  RSelect,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDateWithTime } from "../../../../utils/Utils";
import FaqTable from "../faq/faqTable";
import { useCreateProviders } from "../../../../api/service-providers";
import SortToolTip from "../tables/SortTooltip";
import Search from "../tables/Search";
import LoadingSpinner from "../../../components/spinner";
import {
  useDeleteServices,
  useGetServices,
  useToggleServices,
  useUpdateServiceLogo,
  useUpdateServices,
} from "../../../../api/services";
import EditServiceLogo from "./edit-logo";

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const [editId, setEditedId] = useState();
  const [onSearch, setonSearch] = useState(false);

  const { isLoading, data: services } = useGetServices(currentPage, itemsPerPage);
  const { mutate: updateServiceLogo } = useUpdateServiceLogo(editId);

  const { mutate: updateService } = useUpdateServices(editId);
  const { mutate: addProvider } = useCreateProviders();
  const { mutate: updateStatus } = useToggleServices(editId);
  const { mutate: deleteServices } = useDeleteServices(editId);
  // const { mutate: updateProvider } = useUpdateProviders(editId);
  // console.log(services);

  // console.log(accounts);

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    active: false,
    status: "active",
    statusMessage: "",
    product_type: "",
    created_at: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("active");
  const [statusMessage, setStatusMessage] = useState("");

  const statuses = [
    { value: "active", label: "Active" },
    { value: "temporary-deactivated", label: "Temporary Deactivated (Outage)" },
    { value: "coming-soon", label: "Coming Soon" },
    { value: "deactivated", label: "Deactivated" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "temporary-deactivated":
        return "warning";
      case "coming-soon":
        return "info";
      case "deactivated":
        return "danger";
      default:
        return "secondary";
    }
  };

  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
    types: false,
  });

  // toggle function to view order details

  const toggle = (type) => {
    setView({
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
      edit: type === "edit" ? true : false,
      types: type === "types" ? true : false,
    });
  };

  // resets forms
  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      active: false,
      product_type: "",
      created_at: "",
    });
  };

  // Submits form data
  const onFormSubmit = (form) => {
    // console.log(form);
    let submittedData = {
      question: form.question,
      answer: form.answer,
      faq_category_id: form.categoryId,
    };
    if (view.add) {
      addProvider(submittedData);
    } else {
      // updateProvider(submittedData);
    }

    setView({ add: false, details: false, edit: false, types: false });
    resetForm();
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    services?.data?.forEach((item) => {
      if (item._id === id) {
        const itemStatus = item?.status || (item?.isActive ? "active" : "deactivated");
        setFormData({
          name: item?.name,
          logo: item?.logo,
          active: item?.isActive,
          status: itemStatus,
          statusMessage: item?.statusMessage || "",
          product_type: item?.serviceTypeId?.name,
          created_at: item?.createdAt,
        });
        setSelectedStatus(itemStatus);
        setStatusMessage(item?.statusMessage || "");
      }
    });
    setEditedId(id);
  };

  const onStatusSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateStatus({
      status: selectedStatus,
      statusMessage: statusMessage?.trim() || null,
      isActive: selectedStatus === "active",
    });
    setView({ add: false, details: false, edit: false, types: false });
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  // function to close the form modal
  const onFormCancel = () => {
    setView({ add: false, details: false, edit: false, types: false });
    resetForm();
  };
  // console.log(services);

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
      <Head title="Services"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Services</BlockTitle>
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
                  className="toggle d-none d-md-inline-flex"
                  color="primary"
                  onClick={() => {
                    toggle("add");
                  }}
                >
                  <Icon name="plus"></Icon>
                  <span>Add Provider</span>
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
                  <h5 className="title">All Services</h5>
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
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="hotel name" />
              </div>
            </div>
            <div className="card-inner-group">
              <div className="card-inner p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : services.data.length > 1 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Provider Name</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Product Type</span>
                        </DataTableRow>
                        {/* <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Service Category</span>
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
                                  <Icon name="more-h" />
                                </DropdownToggle>
                              </UncontrolledDropdown>
                            </li>
                          </ul>
                        </DataTableRow>
                      </DataTableHead>
                      {services?.data?.map((item, idx) => {
                        return (
                          <DataTableItem key={item._id} className="text-secondary">
                            <DataTableRow className="w-max-100px">
                              <span className="tb-product">
                                <img
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                  }}
                                  src={item.logo ? item.logo : NoIcon}
                                  alt={"provider logo for " + item.name}
                                  className="thumb d-none d-lg-inline-flex"
                                />
                                <span className="title">{item.name}</span>
                              </span>
                            </DataTableRow>
                            <DataTableRow>{item?.serviceTypeId?.name}</DataTableRow>
                            <DataTableRow>
                              <div className="d-flex align-items-center gap-1">
                                <Badge
                                  color={getStatusColor(item?.status || (item?.isActive ? "active" : "deactivated"))}
                                  className="badge-dot has-bg d-inline-flex"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    onEditClick(item._id);
                                    setView({ add: false, edit: true, details: false, types: false });
                                  }}
                                >
                                  <span className="ccap fw-medium">
                                    {item?.status || (item?.isActive ? "active" : "deactivated")}
                                  </span>
                                </Badge>
                                <Button
                                  color="light"
                                  size="xs"
                                  className="btn-icon btn-trigger ms-1"
                                  title="Edit Status & Notice"
                                  onClick={() => {
                                    onEditClick(item._id);
                                    setView({ add: false, edit: true, details: false, types: false });
                                  }}
                                >
                                  <Icon name="edit" />
                                </Button>
                              </div>
                            </DataTableRow>
                            <DataTableRow className="tb-odr-action">
                              <div className="tb-odr-btns d-md-inline">
                                <Button
                                  color="secondary"
                                  className="btn-sm d-none d-md-inline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/services/api/${item.name}`, {
                                      state: {
                                        serviceId: item?._id,
                                      },
                                    });
                                  }}
                                  // disabled={!item?.active}
                                >
                                  View API Discounts
                                </Button>
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
                                            onEditClick(item._id);
                                            setView({ add: false, edit: false, details: true });
                                          }}
                                        >
                                          <Icon name="eye"></Icon>
                                          <span>View</span>
                                        </DropdownItem>
                                      </li>
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();

                                            navigate(`/services/api/${item.name}`, {
                                              state: {
                                                serviceId: item?._id,
                                              },
                                            });
                                          }}
                                        >
                                          <Icon name="percent"></Icon>
                                          <span>View API Discounts</span>
                                        </DropdownItem>
                                      </li>
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            onEditClick(item._id);
                                            toggle("types");
                                          }}
                                        >
                                          <Icon name="unarchive"></Icon>
                                          <span>Edit Logo</span>
                                        </DropdownItem>
                                      </li>

                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setEditedId(id);
                                            deleteServices();
                                          }}
                                        >
                                          <Icon name="trash"></Icon>
                                          <span>Delete</span>
                                        </DropdownItem>
                                      </li>
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
                      {services?.pagination?.total > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={services?.pagination?.total}
                          paginate={paginate}
                          currentPage={Number(currentPage)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "1rem" }}>
                    <span className="text-silent">No service record found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        {/* EDIT SERVICE STATUS MODAL */}
        <Modal isOpen={view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
          <ModalBody className="bg-white rounded">
            <a href="#cancel" className="close">
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  onFormCancel();
                }}
              ></Icon>
            </a>
            <div className="p-2">
              <div className="nk-modal-head mb-3">
                <h5 className="title">Update Service Status — {formData.name}</h5>
                <p className="text-soft">
                  Control operational status and dynamic outage notice displayed to mobile & web users.
                </p>
              </div>
              <form onSubmit={onStatusSubmit}>
                <Row className="g-3">
                  <Col md="12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="service-status">
                        Operational Status
                      </label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={statuses}
                          value={statuses.find((s) => s.value === selectedStatus)}
                          onChange={(e) => setSelectedStatus(e.value)}
                        />
                      </div>
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="service-status-message">
                        Custom Outage Notice / Status Message (Optional)
                      </label>
                      <div className="form-control-wrap">
                        <textarea
                          className="form-control"
                          id="service-status-message"
                          rows="3"
                          placeholder={
                            selectedStatus === "temporary-deactivated"
                              ? `${formData.name} is temporarily unavailable. We're monitoring the issue and will notify you once service is restored. 💙`
                              : selectedStatus === "coming-soon"
                              ? `${formData.name} will be available soon. Stay tuned!`
                              : selectedStatus === "deactivated"
                              ? `${formData.name} is currently unavailable.`
                              : "No notice needed when active."
                          }
                          value={statusMessage}
                          onChange={(e) => setStatusMessage(e.target.value)}
                          disabled={selectedStatus === "active"}
                        />
                        <span className="form-note text-muted mt-1">
                          {selectedStatus === "active"
                            ? "Service is operational. No notice is shown to users."
                            : "Leave empty to use the system default message, or type custom instructions (e.g. maintenance window, ETA) for users & app developers."}
                        </span>
                      </div>
                    </div>
                  </Col>

                  <Col size="12">
                    <Button color="primary" type="submit">
                      <Icon name="check-circle" className="me-1"></Icon>
                      <span>Update Service Status</span>
                    </Button>
                  </Col>
                </Row>
              </form>
            </div>
          </ModalBody>
        </Modal>

        {/* EDIT SERVICE TYPES */}

        <EditServiceLogo
          modal={view.types}
          closeModal={() => onFormCancel()}
          formData={formData}
          editFunction={updateServiceLogo}
        />

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
                <div style={{ width: "100px" }}>
                  <img src={formData.logo} alt="logo" />
                </div>
              </div>
              <div className="mt-4">
                <Row className="gy-3">
                  <Col lg={6}>
                    <span className="sub-text">Provider Name</span>
                    <span className="caption-text text-primary">{formData.name}</span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Product Type</span>
                    <span className="caption-text">{formData?.product_type}</span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Provider Status</span>
                    <span className={`caption-text ${formData.active ? "text-success" : "text-warning"}`}>
                      {formData.active ? "Active" : "Inactive"}
                    </span>
                  </Col>

                  {/* <Col lg={6}>
                    <span className="sub-text">Date Created</span>
                    <span className="caption-text">{formatDateWithTime(formData.created_at)}</span>
                  </Col> */}
                </Row>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default Services;
