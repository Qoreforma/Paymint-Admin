import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
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
  RSelect,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { useGetServiceTypes, useToggleServiceTypeStatus } from "../../../../api/service-providers";
import SortToolTip from "../tables/SortTooltip";
import Search from "../tables/Search";
import LoadingSpinner from "../../../components/spinner";

const ServicesTypes = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const [editId, setEditedId] = useState();
  const [onSearch, setonSearch] = useState(false);
  const [status, setStatus] = useState(false);

  const { isLoading, data: serviceTypes } = useGetServiceTypes();
  const { mutate: toggleStatus } = useToggleServiceTypeStatus(editId);

  const statuses = [
    { value: "active", label: "Active" },
    { value: "coming-soon", label: "Coming soon" },
    { value: "temporary-deactivated", label: "Temporary deactivated" },
    { value: "deactivated", label: "Deactivated" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    status: "",
  });

  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
  });

  // toggle function to view order details

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
      status: "",
    });
  };

  // Submits form data
  const onFormSubmit = () => {
    toggleStatus({ status });

    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    serviceTypes?.data?.forEach((item) => {
      if (item.id === id) {
        setFormData({
          name: item?.name,
          status: item?.status,
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

  const statusColor = useCallback((status) => {
    if (status === "coming-soon") {
      return "warning";
    } else if (status === "temporarily-deactivated") {
      return "info";
    } else if (status === "active") {
      return "success";
    } else {
      return "danger";
    }
  }, []);

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
              <BlockTitle page>Services Types</BlockTitle>
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
                  <h5 className="title">All Services Types</h5>
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
                ) : serviceTypes?.data?.length > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Name</span>
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
                      {serviceTypes?.data?.map((item, idx) => {
                        return (
                          <DataTableItem key={item.id} className="text-secondary">
                            <DataTableRow>
                              <span className="tb-product">
                                <span className="title ccap">{item.name}</span>
                              </span>
                            </DataTableRow>

                            <DataTableRow>
                              <span className={`dot bg-${statusColor(item.status)} d-sm-none`}></span>
                              <Badge
                                className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                                color={statusColor(item.status)}
                              >
                                <span className="ccap">{item.status}</span>
                              </Badge>
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
                                              onEditClick(item.id);
                                              toggle("edit");
                                            }}
                                          >
                                            <Icon name="edit"></Icon>
                                            <span>Edit Status</span>
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
                      {serviceTypes?.pagination?.total > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={serviceTypes?.pagination?.total}
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
        <Modal isOpen={view.add || view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
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
              <h5 className="title">{view.add ? "Add" : "Edit"} Status</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="status">
                          Select Status
                        </label>
                        <div className="form-control-wrap">
                          <RSelect
                            options={statuses}
                            defaultValue={{ label: formData.status, value: formData.status }}
                            onChange={(e) => setStatus(e.value)}
                          />
                        </div>
                      </div>
                    </Col>

                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Update Status</span>
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

export default ServicesTypes;
