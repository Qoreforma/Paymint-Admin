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
  useBulkUpdatePricingRule,
  useGetPricingRule,
  useTogglePricingRule,
  useUpdatePricingRule,
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
  RSelect,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDateWithTime, formatter, tableNumbers } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import ConfirmStatusUpdateModal from "../services/modals/confirm-status-update";
import MultipleDiscountValueModal from "../services/modals/discount-value-update";

const ServiceProvidersDiscounts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { providerName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { providerId } = location.state || {};

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const [editId, setEditedId] = useState();
  const [onSearch, setonSearch] = useState(false);
  const [selected, setSelected] = useState([]);
  const [multiple, setMultiple] = useState(false);
  const [statusModal, setStatusModal] = useState({ disable: false, enable: false });
  const [editModal, setEditModal] = useState({ regular: false, api: false });

  const { isLoading, data } = useGetPricingRule({ currentPage, size: itemsPerPage, providerId });
  const { mutate: updatePricing } = useUpdatePricingRule();
  const { mutate: togglePricing } = useTogglePricingRule();
  const { mutate: bulkUpdatePricingRule, isSuccess } = useBulkUpdatePricingRule();

  const [formData, setFormData] = useState({
    name: "",
    discountValue: "",
    partnerDiscountValue: "",
    typeValue: "",
    partnerTypeValue: "",
    active: "",
    providerId: "",
    serviceId: "",
  });

  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
    editRegular: false,
    editApi: false,
  });

  // function to change the selected property of an item
  const onSelectChange = (e, item) => {
    if (e.currentTarget.checked) {
      setSelected([...selected, item]);
    } else {
      setSelected(selected.filter((a) => a !== item));
    }
  };

  const handleSelectMultiple = () => {
    if (!multiple) {
      setMultiple(true);
    } else {
      setSelected([]);
      setMultiple(false);
    }
  };

  const toggle = (type) => {
    setView({
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
      edit: type === "edit" ? true : false,
      editRegular: type === "editRegular" ? true : false,
      editApi: type === "editApi" ? true : false,
    });
  };

  // resets forms
  const resetForm = () => {
    setFormData({
      name: "",
      discountValue: "",
      partnerDiscountValue: "",
      typeValue: "",
      partnerTypeValue: "",
      active: "",
      providerId: "",
      serviceId: "",
    });
  };

  // Submits form data for regular discount
  const onRegularFormSubmit = (form) => {
    let submittedData = {
      discountValue: form.discountValue,
      typeValue: formData.typeValue,
      active: formData.active,
      name: formData.name,
      providerId: formData.providerId,
      serviceId: formData.serviceId,
    };
    updatePricing({ providerId: formData.providerId, serviceId: formData.serviceId, data: submittedData });
    setView({ add: false, details: false, edit: false, editRegular: false, editApi: false });
    resetForm();
  };

  // Submits form data for API discount
  const onApiFormSubmit = (form) => {
    let submittedData = {
      partnerDiscountValue: form.partnerDiscountValue,
      partnerTypeValue: formData.partnerTypeValue,
      active: formData.active,
      name: formData.name,
      providerId: formData.providerId,
      serviceId: formData.serviceId,
    };
    updatePricing({ providerId: formData.providerId, serviceId: formData.serviceId, data: submittedData });
    setView({ add: false, details: false, edit: false, editRegular: false, editApi: false });
    resetForm();
  };

  // function that loads the data for editing
  const onEditClick = (name, type) => {
    data?.data?.forEach((item) => {
      if (item?.name === name) {
        setFormData({
          name: item?.name,
          active: item?.active,
          discountValue: item.discountValue,
          partnerDiscountValue: item.partnerDiscountValue,
          typeValue: item.typeValue,
          partnerTypeValue: item.partnerTypeValue,
          providerId: item.providerId,
          serviceId: item.serviceId,
        });

        if (type === "regular") {
          setView({ add: false, details: false, edit: false, editRegular: true, editApi: false });
        } else if (type === "api") {
          setView({ add: false, details: false, edit: false, editRegular: false, editApi: true });
        }
      }
    });
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  // function to close the form modal
  const onFormCancel = () => {
    setView({ add: false, details: false, edit: false, editRegular: false, editApi: false });
    resetForm();
    setSelected([]);
    setMultiple(false);
    setStatusModal({ disable: false, enable: false });
    setEditModal({ regular: false, api: false });
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
      <Head title={`${providerName} Discounts`}></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>{providerName} Discounts</BlockTitle>
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
          <Block className={"mb-2"}>
            <Button
              onClick={handleSelectMultiple}
              color={!multiple ? "primary" : "light"}
              size={"sm"}
              outline={multiple}
              className={`${!multiple ? "" : "bg-white"} btn-round`}
            >
              {multiple ? "Cancel" : "Select Multiple"}
            </Button>

            {selected?.length > 0 && (
              <>
                <Button
                  className={"btn-round ms-2"}
                  onClick={() => setEditModal({ regular: true, api: false })}
                  color={"primary"}
                  size={"sm"}
                >
                  Edit Regular Discount
                </Button>

                <Button
                  className={"btn-round ms-2"}
                  onClick={() => setEditModal({ regular: false, api: true })}
                  color={"primary"}
                  size={"sm"}
                >
                  Edit API Discount
                </Button>

                <Button
                  className={"btn-round ms-2"}
                  onClick={() => setStatusModal({ disable: false, enable: true })}
                  color={"primary"}
                  size={"sm"}
                >
                  Activate
                </Button>
                <Button
                  className={"btn-round bg-white ms-2"}
                  onClick={() => setStatusModal({ enable: false, disable: true })}
                  color={"light"}
                  size={"sm"}
                  outline={true}
                >
                  Deactivate
                </Button>
              </>
            )}
          </Block>

          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Services</h5>
                </div>
                <div className="card-tools me-n1">
                  <ul className="btn-toolbar gx-1">
                    {/* Search component */}
                    <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="hotel name" />
                  </ul>
                </div>
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
                          {multiple ? (
                            <div className="custom-control custom-control-sm custom-checkbox notext">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                checked={selected?.length === data?.data?.length}
                                id={"select-all"}
                                key={Math.random()}
                                onChange={(e) => {
                                  const allIds = data?.data?.map((item) => item);
                                  setSelected(allIds.length === selected.length ? [] : allIds);
                                }}
                              />
                              <label className="custom-control-label" htmlFor={"select-all"}></label>
                            </div>
                          ) : (
                            <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                          )}
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Name</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Regular</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">API</span>
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
                      {data?.data?.map((item, idx) => {
                        return (
                          <DataTableItem key={idx} className="text-secondary">
                            <DataTableRow>
                              {multiple ? (
                                <div className="custom-control custom-control-sm custom-checkbox notext">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    checked={selected.includes(item)}
                                    id={item?.name + "uid1"}
                                    key={Math.random()}
                                    onChange={(e) => onSelectChange(e, item)}
                                  />
                                  <label className="custom-control-label" htmlFor={item?.name + "uid1"}></label>
                                </div>
                              ) : (
                                <span> {tableNumbers(currentPage, itemsPerPage) + idx + 1}</span>
                              )}
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-product">
                                <span className="title">{item.name}</span>
                              </span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>
                                {item?.typeValue === "percentage"
                                  ? item.discountValue + "%"
                                  : item?.typeValue === "flat"
                                    ? formatter("NGN").format(item?.discountValue)
                                    : ""}
                              </span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>
                                {item?.partnerTypeValue === "percentage"
                                  ? item.partnerDiscountValue + "%"
                                  : item?.partnerTypeValue === "flat"
                                    ? formatter("NGN").format(item?.partnerDiscountValue)
                                    : ""}
                              </span>
                            </DataTableRow>
                            <DataTableRow>
                              <div className="custom-control-sm custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  name={item.name}
                                  checked={item?.active}
                                  onClick={() => {
                                    togglePricing({
                                      providerId: item?.providerId,
                                      serviceId: item?.serviceId,
                                      data: { active: !item?.active },
                                    });
                                  }}
                                  id={item?.name}
                                />
                                <label className="custom-control-label" htmlFor={item?.name}>
                                  <span
                                    className={`ccap fw-medium d-none d-md-inline ${item?.active ? "text-success" : ""}`}
                                  >
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
                                              onEditClick(item?.name, "regular");
                                            }}
                                          >
                                            <Icon name="edit"></Icon>
                                            <span>Edit Regular Discount</span>
                                          </DropdownItem>
                                        </li>
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              onEditClick(item?.name, "api");
                                            }}
                                          >
                                            <Icon name="edit"></Icon>
                                            <span>Edit API Discount</span>
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

        {/* EDIT REGULAR DISCOUNT MODAL */}
        <Modal isOpen={view.editRegular} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
          <ModalBody>
            <div className="p-2">
              <h5 className="title">Update Regular Discount for {formData?.name}</h5>
              <form onSubmit={handleSubmit(onRegularFormSubmit)}>
                <Row className="gy-4">
                  <Col md="12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="typeValue">
                        Type
                      </label>
                      <RSelect
                        options={[
                          { label: "Flat", value: "flat" },
                          { label: "Percentage", value: "percentage" },
                        ]}
                        value={{
                          label: formData?.typeValue?.charAt(0).toUpperCase() + formData.typeValue?.slice(1) || "",
                          value: formData.typeValue,
                        }}
                        onChange={(e) => setFormData({ ...formData, typeValue: e.value })}
                        placeholder="Select Type"
                        isSearchable={false}
                      />
                    </div>
                  </Col>
                  <Col md="12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="discountValue">
                        Regular Value
                      </label>
                      <input
                        id="discountValue"
                        className="form-control"
                        defaultValue={formData.discountValue}
                        placeholder="Enter Regular Discount Value"
                        pattern="[0-9]*[.,]?[0-9]*"
                        type="text"
                        inputmode="decimal"
                        {...register("discountValue", {
                          required: "This field is required",
                        })}
                      />
                    </div>
                  </Col>

                  <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button type="submit" color="primary" size="lg">
                          Update Regular Discount
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#dropdownitem"
                          onClick={(ev) => {
                            ev.preventDefault();
                            onFormCancel();
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

        {/* EDIT API DISCOUNT MODAL */}
        <Modal isOpen={view.editApi} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
          <ModalBody>
            <div className="p-2">
              <h5 className="title">Update API Discount for {formData?.name}</h5>
              <form onSubmit={handleSubmit(onApiFormSubmit)}>
                <Row className="gy-4">
                  <Col md="12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="partnerTypeValue">
                        Type
                      </label>
                      <RSelect
                        options={[
                          { label: "Flat", value: "flat" },
                          { label: "Percentage", value: "percentage" },
                        ]}
                        value={{
                          label:
                            formData?.partnerTypeValue?.charAt(0).toUpperCase() + formData.partnerTypeValue?.slice(1) ||
                            "",
                          value: formData.partnerTypeValue,
                        }}
                        onChange={(e) => setFormData({ ...formData, partnerTypeValue: e.value })}
                        placeholder="Select Type"
                        isSearchable={false}
                      />
                    </div>
                  </Col>
                  <Col md="12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="partnerDiscountValue">
                        API Value
                      </label>
                      <input
                        id="partnerDiscountValue"
                        className="form-control"
                        defaultValue={formData.partnerDiscountValue}
                        placeholder="Enter API Discount Value"
                        pattern="[0-9]*[.,]?[0-9]*"
                        type="text"
                        inputmode="decimal"
                        {...register("partnerDiscountValue", {
                          required: "This field is required",
                        })}
                      />
                    </div>
                  </Col>

                  <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button type="submit" color="primary" size="lg">
                          Update API Discount
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#dropdownitem"
                          onClick={(ev) => {
                            ev.preventDefault();
                            onFormCancel();
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

        <ConfirmStatusUpdateModal
          isDiscountSuccess={isSuccess}
          bulkUpdateDiscount={bulkUpdatePricingRule}
          modal={statusModal}
          closeModal={onFormCancel}
          setStatusModal={setStatusModal}
          selected={selected}
        />

        <MultipleDiscountValueModal
          isSuccess={isSuccess}
          bulkUpdateDiscount={bulkUpdatePricingRule}
          modal={editModal}
          closeModal={onFormCancel}
          selected={selected}
          setEditModal={setEditModal}
        />
      </Content>
    </React.Fragment>
  );
};

export default ServiceProvidersDiscounts;
