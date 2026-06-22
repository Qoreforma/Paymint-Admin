import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import {
  useCreateAdmin,
  useDeleteAdmin,
  useGetAllAdmin,
  useGetRoles,
  useUpdateAdmin,
} from "../../../../api/users/admin";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  RSelect,
  Row,
  UserAvatar,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import {
  capitalizeFirstLetter,
  findUpper,
  formatDate,
  formatDateWithHyphen,
  formatDateWithTime,
} from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import SortToolTip from "../tables/SortTooltip";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import { filterStatus } from "./adminData";

const AdminList = () => {
  const [editId, setEditedId] = useState();
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "", //role id
    phone: "",
  });
  const [editFormData, setEditFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "", //role id
    phone: "",
  });

  const [updateRole, setUpdateRole] = useState(false);
  const [filters, setfilters] = useState({});

  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const roleSort = searchParams.get("role") ?? "";
  const searchFilter = searchParams.get("search") ?? "";

  const { data: roles } = useGetRoles();
  let roleOptions = roles
    ? roles.data?.data?.map((role) => ({ label: role.name.replaceAll("_", " "), value: role.name, id: role._id }))
    : null;

  const { data: admin, isLoading } = useGetAllAdmin(currentPage, itemsPerPage, roleSort, searchFilter);
  const { mutate: addAdmin } = useCreateAdmin();
  const { mutate: updateAdmin } = useUpdateAdmin();
  const { mutate: deleteAdmin } = useDeleteAdmin(editId);

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // Debounce logic for searchbox
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams((searchParams) => {
        searchParams.set("search", onSearchText);
        return searchParams;
      });
    }, 1000); // 500ms debounce

    return () => {
      clearTimeout(handler); // cancel timeout if input changes before 500ms
    };
  }, [onSearchText]);

  // function to reset the form
  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      role: "",
      phone: "",
    });
    setSelectedRole("");
    setEditFormData({
      firstname: "",
      lastname: "",
      email: "",
      role: "",
      phone: "",
    });
    setEditedId("");
    setTimeout(() => {
      setUpdateRole(false);
    }, 500);
  };

  const closeModal = () => {
    setModal({ add: false });
    resetForm();
  };

  const closeEditModal = () => {
    setModal({ edit: false });
    resetForm();
  };

  // submit function to add a new admin
  const onFormSubmit = (submitData) => {
    // console.log({ submitData });
    addAdmin({
      firstName: submitData.firstname,
      lastName: submitData.lastname,
      email: submitData.email,
      adminLevel: submitData.role,
      phone: submitData.phone,
    });
    resetForm();
    setModal({ edit: false }, { add: false });
  };

  // submit function to update a new item
  const onEditSubmit = (submitData) => {
    const { firstname, lastname, email, phone, role } = submitData;

    let submittedData = {
      firstName: firstname,
      lastName: lastname,
      email,
      phone,
      adminLevel: role,
    };
    updateAdmin({ adminId: editId, data: submittedData });
    setModal({ edit: false });
    resetForm();
  };

  const onEditClick = (id) => {
    admin?.data?.admins?.forEach((item) => {
      if (item._id === id) {
        setEditFormData({
          firstname: item.firstName,
          lastname: item.lastName,
          email: item.email,
          role: item.adminLevel,
          phone: item.phone,
        });
        setSelectedRole(item.adminLevel);
        setModal({ edit: true }, { add: false });
      }
    });
  };

  // function to toggle the search option
  const toggle = () => setonSearch(!onSearch);

  // Change Page
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  // function to filter data
  const filterData = useCallback(() => {
    setSearchParams((prev) => ({ ...prev, ...filters }));
    setIsFilterOpen(false);
  }, [filters, setSearchParams]);

  const clearsFilter = () => {
    setSearchParams({});
    // setfilters(null);
  };

  return (
    <React.Fragment>
      <Head title="Admin management"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Admin List
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
                      <Button color="primary" onClick={() => setModal({ add: true })}>
                        <Icon name="plus"></Icon>
                        <span>Create Admin</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <h5 className="title">All Admins</h5>
                <div className="card-tools me-n1">
                  <ul className="btn-toolbar gx-1">
                    <li>
                      <a
                        href="#search"
                        onClick={(ev) => {
                          ev.preventDefault();
                          toggle();
                        }}
                        className="btn btn-icon search-toggle toggle-search"
                      >
                        <Icon name="search"></Icon>
                      </a>
                    </li>
                    <li className="btn-toolbar-sep"></li>
                    <li>
                      <div className="toggle-wrap">
                        <Button
                          className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                          onClick={() => updateTableSm(true)}
                        >
                          <Icon name="menu-right"></Icon>
                        </Button>
                        <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                          <ul className="btn-toolbar gx-1">
                            <li className="toggle-close">
                              <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                <Icon name="arrow-left"></Icon>
                              </Button>
                            </li>
                            <li>
                              <UncontrolledDropdown isOpen={isFilterOpen}>
                                <DropdownToggle
                                  onClick={() => setIsFilterOpen(true)}
                                  tag="a"
                                  className="btn btn-trigger btn-icon dropdown-toggle"
                                >
                                  <div className="dot dot-primary"></div>
                                  <Icon name="filter-alt"></Icon>
                                </DropdownToggle>
                                <DropdownMenu
                                  end
                                  className="filter-wg dropdown-menu-xl"
                                  style={{ overflow: "visible" }}
                                >
                                  <div className="dropdown-head">
                                    <span className="sub-title dropdown-title">Filter Admins</span>
                                  </div>
                                  <div className="dropdown-body dropdown-body-rg">
                                    <Row className="gx-6 gy-3">
                                      <Col size="12">
                                        <div className="form-group">
                                          <label className="overline-title overline-title-alt">Role</label>
                                          <RSelect
                                            options={roleOptions}
                                            placeholder="Any Role"
                                            value={
                                              filters.role && {
                                                label: filters.role,
                                                value: filters.role,
                                              }
                                            }
                                            onChange={(e) => setfilters({ ...filters, role: e.value })}
                                            className="text-capitalize"
                                          />
                                        </div>
                                      </Col>
                                      <Col size="12">
                                        <div className="form-group" onClick={filterData}>
                                          <Button color="secondary">Filter</Button>
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>
                                  <div className="dropdown-foot between">
                                    <a
                                      href="#reset"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                        clearsFilter();
                                      }}
                                      className="clickable"
                                    >
                                      Reset Filter
                                    </a>
                                    <a
                                      href="#close"
                                      onClick={(ev) => {
                                        ev.preventDefault();
                                        setIsFilterOpen(false);
                                      }}
                                    >
                                      Close
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
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button
                      className="search-back btn-icon toggle-search active"
                      onClick={() => {
                        setSearchText("");
                        toggle();
                      }}
                    >
                      <Icon name="arrow-left"></Icon>
                    </Button>
                    <input
                      type="text"
                      className="border-transparent form-focus-none form-control"
                      placeholder="Search by user or email"
                      value={onSearchText}
                      onChange={(e) => onFilterChange(e)}
                    />
                    <Button className="search-submit btn-icon">
                      <Icon name="search"></Icon>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {isLoading ? (
              <LoadingSpinner />
            ) : admin?.data?.pagination?.total > 0 ? (
              <>
                <DataTableBody compact>
                  <DataTableHead>
                    <DataTableRow className="nk-tb-col-check">
                      <span>S/N</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text ">Name</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="sub-text">Email</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="sub-text">Date & Time Joined</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="sub-text">Role</span>
                    </DataTableRow>
                    <DataTableRow className="nk-tb-col-tools text-end">
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-xs btn-outline-light btn-icon dropdown-toggle">
                          <Icon name="plus"></Icon>
                        </DropdownToggle>
                      </UncontrolledDropdown>
                    </DataTableRow>
                  </DataTableHead>
                  {/*Head*/}
                  {admin?.data?.admins?.map((item, idx) => {
                    return (
                      <DataTableItem key={idx}>
                        <DataTableRow className="nk-tb-col-check">
                          <span>{idx + 1}</span>
                        </DataTableRow>
                        <DataTableRow>
                          {/* <Link to={`${import.meta.env.PUBLIC_URL}/user-details-regular/${item.id}`}> */}
                          <div className="user-card">
                            <UserAvatar
                              theme={item.avatar}
                              className="xs"
                              text={findUpper(
                                `${capitalizeFirstLetter(item.firstName)} ${capitalizeFirstLetter(item.lastName)}`,
                              )}
                              image={item.avatar}
                            ></UserAvatar>
                            <div className="user-name">
                              <span className="tb-lead text-capitalize">{`${item.firstName} ${item.lastName}`}</span>
                            </div>
                          </div>
                          {/* </Link> */}
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item.email}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{formatDateWithHyphen(item.createdAt)}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="text-capitalize">{item.adminLevel.replace("_", " ")}</span>
                        </DataTableRow>
                        <DataTableRow className="nk-tb-col-tools">
                          <ul className="nk-tb-actions gx-1">
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                  <Icon name="more-h"></Icon>
                                </DropdownToggle>
                                <DropdownMenu end>
                                  <ul className="link-list-opt no-bdr">
                                    <li>
                                      <DropdownItem
                                        tag="a"
                                        href="#view"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setUpdateRole(true);
                                          setEditedId(item?._id);
                                          onEditClick(item?._id);
                                        }}
                                      >
                                        <Icon name="exchange"></Icon>
                                        <span>Change role</span>
                                      </DropdownItem>
                                    </li>
                                    <li>
                                      <DropdownItem
                                        tag="a"
                                        href="#view"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setEditedId(item?._id);
                                          onEditClick(item?._id);

                                          //   navigate(`/user-details/${item.id}`);
                                        }}
                                      >
                                        <Icon name="edit"></Icon>
                                        <span>Edit admin</span>
                                      </DropdownItem>
                                    </li>
                                    {item.status !== "Suspend" && (
                                      <React.Fragment>
                                        <li className="divider"></li>
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#suspend"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditedId(item?._id);
                                              deleteAdmin(item?._id);
                                            }}
                                          >
                                            <Icon name="na"></Icon>
                                            <span>Delete Admin</span>
                                          </DropdownItem>
                                        </li>
                                      </React.Fragment>
                                    )}
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
                  {admin?.data?.pagination?.total > 0 && (
                    <PaginationComponent
                      itemPerPage={itemsPerPage}
                      totalItems={admin?.data?.pagination?.total}
                      paginate={paginate}
                      currentPage={Number(currentPage)}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="text-center" style={{ paddingBlock: "1rem" }}>
                <span className="text-silent">No records found</span>
              </div>
            )}
          </DataTable>
        </Block>

        <AddModal
          modal={modal.add}
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onFormSubmit}
          filterStatus={filterStatus}
        />
        <EditModal
          modal={modal.edit}
          formData={editFormData}
          role={updateRole}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
          filterStatus={filterStatus}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
        />
      </Content>
    </React.Fragment>
  );
};
export default AdminList;
