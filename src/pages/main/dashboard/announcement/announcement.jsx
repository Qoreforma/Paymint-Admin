import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  UncontrolledDropdown,
  Badge,
} from "reactstrap";
import {
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useDispatchAnnouncement,
  useEditAnnouncement,
  useGetAnnouncement,
  useRestoreAnnouncement,
} from "../../../../api/announcement";
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
  RSelect,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDateWithHyphen, formatDateWithTime, truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import AddModal from "./AddModal";

const FilterOptions = [
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
];

const AnnouncementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [editedId, setEditedId] = useState(null);

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const type = searchParams.get("type") ?? undefined;

  const { isLoading, data } = useGetAnnouncement(currentPage, itemsPerPage, status);
  const { mutate: createAnnouncement } = useCreateAnnouncement();
  const { mutate: editAnnouncement } = useEditAnnouncement(editedId);
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement(editedId);
  const { mutate: restoreAnnoucement } = useRestoreAnnouncement(editedId);
  const { mutate: dispatchAnnoucement } = useDispatchAnnouncement(editedId);

  // console.log(data);
  const [sm, updateSm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    target: "",
    userCount: "",
    channels: [],
    failedNote: "",
    dispatchDate: "",
    dateCreated: "",
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
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      body: "",
      target: "",
      userCount: "",
      channels: [],
      failedNote: "",
      dispatchDate: "",
      dateCreated: "",
      status: "",
    });
    // reset({});
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          title: item?.title,
          body: item?.body,
          status: item?.status,
          target: item?.target,
          userCount: item?.userCount,
          failedNote: item?.failedNote ? item?.failedNote : "No note",
          channels: item?.channels,
          dateCreated: item?.createdAt,
          dispatchDate: item?.dispatchTime,
        });
      }
    });
    setEditedId(id);
    setView({ add: false, edit: true });
  };

  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };
  // function to filter catelog
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to filter data
  const filterData = useCallback(() => {
    const newParams = new URLSearchParams(location.search);
    Object.entries(filters).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    setSearchParams(newParams);
  }, [filters]);

  // function to clear filter
  const clearFilter = () => {
    setSearchParams({});
    setfilters(null);
  };

  // toggle function to view product details
  const toggle = (type) => {
    setView({
      edit: type === "edit" ? true : false,
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
    });
  };

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "sent") {
      return "success";
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
      <Head title="Announcement"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Announcements{" "}
              </BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                  onClick={() => updateSm(!sm)}
                >
                  <Icon name="menu-alt-r"></Icon>
                </Button>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    <li className="nk-block-tools-opt">
                      <Button color="primary" onClick={() => toggle("add")}>
                        <Icon name="plus"></Icon>
                        <span>Create Announcement</span>
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
                  <h5 className="title">All Annoucements</h5>
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

                                  <RSelect
                                    options={FilterOptions}
                                    placeholder="Select status"
                                    value={filters.status && { label: filters.status, value: filters.status }}
                                    isSearchable={false}
                                    onChange={(e) => setfilters({ ...filters, status: e.value })}
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
                                clearFilter();
                                setfilters({});
                              }}
                              className="clickable"
                            >
                              Reset Filter
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
                ) : data?.pagination?.total > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Title</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Creator</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Channel</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Target</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Target Count</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Date Dispatch</span>
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
                      {data?.data?.map((item) => {
                        return (
                          <DataTableItem key={item?.id} className="text-secondary">
                            <DataTableRow size="sm" className="text-primary fw-bold">
                              <span className="title">{item?.title}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-lead ccap">
                                {truncateText(`${item?.creatorId?.firstName} ${item?.creatorId?.lastName}`, 20)}{" "}
                              </span>
                            </DataTableRow>

                            <DataTableRow size="md">
                              <span className="text-capitalize">{item?.channels?.join(", ")}</span>
                            </DataTableRow>
                            <DataTableRow size="sm">
                              <span className="text-capitalize"> {item?.target}</span>
                            </DataTableRow>
                            <DataTableRow size="md">
                              <span>{item?.userCount}</span>
                            </DataTableRow>
                            <DataTableRow size="sm">
                              <span className="text-capitalize"> {formatDateWithHyphen(item?.dispatchTime)}</span>
                            </DataTableRow>

                            <DataTableRow>
                              <span className={`dot bg-${statusColor(item?.status)} d-sm-none`}></span>
                              <Badge
                                className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                                color={statusColor(item?.status)}
                              >
                                <span className="ccap">{item?.status}</span>
                              </Badge>
                            </DataTableRow>
                            <DataTableRow className="tb-odr-action">
                              <div className="tb-odr-btns d-md-inline">
                                <Button
                                  color="primary"
                                  className="btn-sm"
                                  onClick={(ev) => {
                                    onEditClick(item?._id);
                                    toggle("details");
                                  }}
                                >
                                  View
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
                                      {/* {item?.status === "pending" && ( */}
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            onEditClick(item?._id);
                                            toggle("edit");
                                          }}
                                        >
                                          <Icon name="pen2"></Icon>
                                          <span>Edit</span>
                                        </DropdownItem>
                                      </li>
                                      {/* )} */}
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setEditedId(item?._id);
                                            dispatchAnnoucement();
                                          }}
                                        >
                                          <Icon name="send-alt"></Icon>
                                          <span>Dispatch</span>
                                        </DropdownItem>
                                      </li>{" "}
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setEditedId(item?._id);
                                            restoreAnnoucement();
                                          }}
                                        >
                                          <Icon name="reload-alt"></Icon>
                                          <span>Restore</span>
                                        </DropdownItem>
                                      </li>
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setEditedId(item?._id);
                                            deleteAnnouncement();
                                          }}
                                        >
                                          <Icon name="trash" className="text-danger"></Icon>
                                          <span className="text-danger">Delete</span>
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
                      {data?.pagination?.total > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={data?.pagination?.total}
                          paginate={paginate}
                          currentPage={Number(currentPage)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "1rem" }}>
                    <span className="text-silent">No data record found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

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
              <h4 className="nk-modal-title title">Details</h4>
            </div>
            <div className="nk-tnx-details mt-sm-3">
              <Row className="gy-2">
                <Col lg={4}>
                  <span className="sub-text">Title</span>
                  <span className="caption-text text-primary">{formData.title}</span>
                </Col>
                <Col>
                  <span className="sub-text">Body</span>
                  <span className="caption-text">{formData.body}</span>
                </Col>
                <Col lg={4}>
                  <span className="sub-text">Target</span>
                  <span className="caption-text ccap">{formData.target}</span>
                </Col>
                <Col lg={4}>
                  <span className="sub-text">Target Count</span>
                  <span className="caption-text">{formData.userCount}</span>
                </Col>
                <Col lg={4}>
                  <span className="sub-text">Status</span>
                  <span className="caption-text ccap">{formData.status}</span>
                </Col>
                <Col lg={4}>
                  <span className="sub-text">Channels</span>
                  <span className="caption-text">
                    {formData?.channels?.map((item, index) => (
                      <span key={item} className="text-capitalize">
                        {item}
                        {index !== 1 && ","}{" "}
                      </span>
                    ))}
                  </span>
                </Col>
                <Col lg={4}>
                  <span className="sub-text">Date created</span>
                  <span className="caption-text">{formatDateWithTime(formData.dateCreated)}</span>
                </Col>{" "}
                <Col lg={4}>
                  <span className="sub-text">Date dispatch</span>
                  <span className="caption-text">{formatDateWithTime(formData.dispatchDate)}</span>
                </Col>
              </Row>
            </div>
          </ModalBody>
        </Modal>

        <AddModal
          closeModal={onFormCancel}
          formData={formData}
          modal={view.add || view.edit}
          isEdit={view.edit}
          createFunction={createAnnouncement}
          editFunction={editAnnouncement}
        />
      </Content>
    </React.Fragment>
  );
};

export default AnnouncementPage;
