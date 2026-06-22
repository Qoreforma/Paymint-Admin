import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, UncontrolledDropdown } from "reactstrap";
import {
  useDeleteProviders,
  useGetProviders,
  useSyncProviderProducts,
  useToggleProviders,
  useUpdateProviders,
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
import { formatDate, formatDateWithHyphen, formatDateWithTime } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import EditProviderLogo from "./edit-logo";
import EditProductTypes from "./edit-product-types";
import ServiceProviderModal from "./form-modal";
import AddProductModal from "./modals/add-product";

const ServiceProviders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const [editId, setEditedId] = useState();
  const [onSearch, setonSearch] = useState(false);

  const { isLoading, data: providers } = useGetProviders(currentPage, itemsPerPage);
  const { mutate: syncProviderProducts } = useSyncProviderProducts(editId);
  const { mutate: updateStatus } = useToggleProviders(editId);
  const { mutate: deleteProvider } = useDeleteProviders(editId);

  const { mutate: updateProvider } = useUpdateProviders(editId);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    logo: "",
    active: false,
    product_type: [],
    created_at: "",
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
      name: "",
      logo: "",
      product_type: [],
      created_at: "",
    });
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    providers?.data?.forEach((item) => {
      if (item._id === id) {
        setFormData({
          id: item?._id,
          name: item?.name,
          logo: item?.logo,
          active: item?.isActive,
          product_type: item?.serviceType,
          created_at: item?.createdAt,
        });
      }
    });
    setEditedId(id);
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
            <BlockHeadContent>
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
                {/* <Button
                  className="toggle d-none d-md-inline-flex"
                  color="primary"
                  onClick={() => {
                    toggle("add");
                  }}
                >
                  <Icon name="plus"></Icon>
                  <span>Add Provider</span>
                </Button>

                <Button
                  className="toggle d-none d-md-inline-flex ms-2"
                  color="secondary"
                  onClick={() => {
                    toggle("products");
                  }}
                >
                  <Icon name="bag"></Icon>
                  <span>Add Product</span>
                </Button> */}
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
            </BlockHeadContent>
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
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Service Type</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Service Count</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Date Added</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Last Synced</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
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
                          <DataTableItem key={item._id} className="text-secondary">
                            <DataTableRow>
                              <span className="tb-product">
                                <img
                                  src={item.logo ? item.logo : NoIcon}
                                  alt={"provider logo for " + item.name}
                                  className="thumb-sm d-none d-lg-inline-flex"
                                />
                                <span className="title">{item.name}</span>
                              </span>
                            </DataTableRow>

                            {/* <DataTableRow>
                              <span className="text-capitalize"> {item?.purpose}</span>
                            </DataTableRow> */}
                            <DataTableRow size="sm">
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
                            <DataTableRow size="sm">
                              <span className="text-capitalize"> {item?.serviceType.length}</span>
                            </DataTableRow>
                            <DataTableRow size="md">
                              <span>{formatDateWithHyphen(item.createdAt)}</span>
                            </DataTableRow>
                            <DataTableRow size="md">
                              <span>{item?.lastSyncedAt ? formatDateWithHyphen(item.lastSyncedAt) : "N/A"}</span>
                            </DataTableRow>
                            <DataTableRow size="sm">
                              <div className="custom-control-sm custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  name={item.name}
                                  checked={item?.isActive}
                                  onClick={() => {
                                    onEditClick(item._id);
                                    updateStatus({ isActive: !item?.isActive });
                                  }}
                                  id={item._id}
                                />
                                <label className="custom-control-label" htmlFor={item._id}>
                                  <span className={`ccap fw-medium ${item?.isActive ? "text-success" : "text-muted"}`}>
                                    {item.isActive ? "active" : "inactive"}
                                  </span>
                                </label>
                              </div>
                            </DataTableRow>

                            <DataTableRow className="tb-odr-action">
                              <div className="tb-odr-btns d-md-inline">
                                <Button
                                  color="primary"
                                  className="btn-sm"
                                  onClick={(ev) => {
                                    navigate(`/service-providers/${item._id}`);
                                  }}
                                  // disabled={!item?.active}
                                >
                                  View services
                                </Button>

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
                                      {/* <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setEditedId(item._id);
                                            onEditClick(item._id);
                                            toggle("edit");
                                          }}
                                        >
                                          <Icon name="edit"></Icon>
                                          <span>Edit Provider</span>
                                        </DropdownItem>
                                      </li> */}
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
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
                                            navigate(`/service-providers/discounts/${item.name}`, {
                                              state: {
                                                providerId: item?._id,
                                              },
                                            });
                                          }}
                                        >
                                          <Icon name="percent"></Icon>
                                          <span>View Discounts</span>
                                        </DropdownItem>
                                      </li>
                                      {item?.hasSync && (
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditedId(item._id);
                                              syncProviderProducts({ forceUpdate: true });
                                            }}
                                          >
                                            <Icon name="update"></Icon>
                                            <span>Sync Products</span>
                                          </DropdownItem>
                                        </li>
                                      )}
                                      {/* <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            onEditClick(item._id);
                                            deleteProvider();
                                          }}
                                          className="text-danger"
                                        >
                                          <Icon name={"cross"} className={"text-danger"}></Icon>
                                          <span>Delete Provider</span>
                                        </DropdownItem>
                                      </li> */}
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
                <div>
                  <img src={formData.logo} alt="logo" />
                </div>
              </div>
              <div className="mt-4">
                <Row className="gy-3">
                  <Col>
                    <span className="sub-text">Provider Name</span>
                    <span className="caption-text text-primary">{formData.name}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Service Type</span>
                    <span className="caption-text">
                      {formData.product_type?.map((item, index) => (
                        <span className="ccap pe-1" key={index}>
                          {item?.name},
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

export default ServiceProviders;
