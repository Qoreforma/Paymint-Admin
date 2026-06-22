import React, { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import {
  useFinanceUser,
  useGetAllUsers,
  useMarkAsFraud,
  useUpdateUserStatus,
  useUpdateUserType,
  useBlacklistUser,
  useRestrictUser,
} from "../../../../api/users/user";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  UserAvatar,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import {
  findUpper,
  formatDate,
  formatDateWithTime,
  formatter,
  truncateText,
  tableNumbers,
  formatDateWithHyphen,
  exportToCSV,
} from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { FilterOptions } from "../tables/filter-select";
import AddModal from "./AddModal";
import { filterStatus, userFilterOptions } from "./UserData";
import UserTypeModal from "./userTypeModal";

const UserList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userId, setUserId] = useState(null);
  const [sm, updateSm] = useState(false);

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const { isLoading, data: users } = useGetAllUsers(currentPage, itemsPerPage, search, status);
  const { mutate: financeUser } = useFinanceUser(userId);
  const { mutate: updateUserStatus } = useUpdateUserStatus(userId);

  const { mutate: updateUserType } = useUpdateUserType(userId);

  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(false);

  const [view, setView] = useState({
    finance: false,
    userType: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    status: "",
    type: "",
    referral_earning_rate: "",
  });

  // function that loads the want to editted data
  const onEditClick = (id) => {
    users?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          name: item?.name,
          status: item?.status,
          type: item?.type,
          referral_earning_rate: item?.referral_earning_rate,
        });
      }
    });
    setUserId(id);
  };

  // Finance user form submit
  const onFormSubmit = (data) => {
    let submittedData = {
      ...data,
      type: data.type.value,
    };
    financeUser(submittedData);
    closeModal();
  };

  const onSubmitUserType = (data) => {
    // console.log(data);
    let submittedData = {
      type: data.type,
      referral_earning_rate: data.referral_earning_rate,
    };
    updateUserType(submittedData);
    closeModal();
  };

  const toggleModal = (type) => {
    setView({
      finance: type === "finance" ? true : false,
      userType: type === "userType" ? true : false,
    });
  };

  // function to toggle the search option
  const toggle = () => setonSearch(!onSearch);

  // resets forms
  const resetForm = () => {
    setFormData({
      name: "",
      status: "",
    });
  };

  // function to close the form modal
  const closeModal = () => {
    setView({ finance: false, userType: false });
    resetForm();
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
    if (status === "inactive") {
      return "warning";
    } else if (status === "active") {
      return "success";
    } else {
      return "danger";
    }
  }, []);

  const bvnStatusColor = useCallback((isValidated, isVerified) => {
    if (isValidated && isVerified) {
      return "success";
    } else if (isValidated || isVerified) {
      return "warning";
    } else {
      return "danger";
    }
  });

  return (
    <React.Fragment>
      <Head title="User management"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Users Lists
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {users?.pagination?.total?.toLocaleString()} users.</p>
              </BlockDes>
            </BlockHeadContent>

            <BlockHeadContent>
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                  <div className="toggle-wrap nk-block-tools-toggle">
                    <Button
                      className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="download-cloud"></Icon>
                    </Button>
                    <Button color="primary">
                      <Icon name="download-cloud"></Icon>
                      <span>Export</span>
                    </Button>
                  </div>
                </DropdownToggle>
                <DropdownMenu end className="dropdown-menu-sm">
                  <ul className="link-list-opt no-bdr">
                    <li>
                      <DropdownItem
                        tag="a"
                        href="#view"
                        onClick={(ev) => {
                          ev.preventDefault();
                          exportToCSV(
                            users?.data?.map((user) => ({
                              Name: `${user?.firstname} ${user?.lastname}`,
                              Username: user?.username,
                              Email: user?.email,
                              Phone: user?.phone
                                ? `${user?.phoneCode ? user?.phoneCode : ""} ${user?.phone ?? ""}`
                                : null,
                              "User Type": user?.userType,
                              Gender: user?.gender,
                              State: user?.state,
                              Country: user?.country,
                              "Account Status": user?.status,
                              "BVN Verified": user?.bvnVerified ? "Yes" : "No",
                              "Date Joined": formatDateWithHyphen(user?.createdAt),
                            })) ?? [],
                            "user_data.csv",
                          );
                        }}
                      >
                        <span>Export All</span>
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        tag="a"
                        href="#view"
                        onClick={(ev) => {
                          ev.preventDefault();
                          exportToCSV(
                            users?.data?.map((user) => ({
                              Email: user?.email,
                            })) ?? [],
                            "user_emails.csv",
                          );
                        }}
                      >
                        <span>Export Emails</span>
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        tag="a"
                        href="#view"
                        onClick={(ev) => {
                          ev.preventDefault();
                          exportToCSV(
                            users?.data?.map((user) => ({
                              "Phone Number": user?.phone
                                ? `${user?.phoneCode ? user?.phoneCode : ""} ${user?.phone ?? ""}`
                                : null,
                            })) ?? [],
                            "user_phones_numbers.csv",
                          );
                        }}
                      >
                        <span>Export Phone No.s</span>
                      </DropdownItem>
                    </li>
                  </ul>
                </DropdownMenu>
              </UncontrolledDropdown>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <h5 className="title">All Users</h5>
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
                              <FilterOptions options={userFilterOptions} />
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
                {/* Search component */}
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="name" />
              </div>
            </div>
            {isLoading ? (
              <LoadingSpinner />
            ) : users?.pagination?.total > 0 ? (
              <>
                <DataTableBody compact>
                  <DataTableHead>
                    <DataTableRow size="sm">
                      <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="tb-tnx-head bg-white text-secondary ">User</span>
                    </DataTableRow>
                    <DataTableRow size="lg">
                      <span className="tb-tnx-head bg-white text-secondary">Username</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="tb-tnx-head bg-white text-secondary">Phone</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="tb-tnx-head bg-white text-secondary">Wallet</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="tb-tnx-head bg-white text-secondary">Date Joined</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="tb-tnx-head bg-white text-secondary">BVN</span>
                    </DataTableRow>
                    <DataTableRow size="md">
                      <span className="tb-tnx-head bg-white text-secondary">Status</span>
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
                  {users?.data?.map((item, idx) => {
                    return (
                      <DataTableItem className="text-secondary" key={idx}>
                        <DataTableRow size="sm">
                          <span className="text-capitalize">{tableNumbers(currentPage, itemsPerPage) + idx + 1}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <Link to={`/user-details/${item?._id}`}>
                            <div className="user-card">
                              <UserAvatar
                                theme={item?.avatar}
                                className="xs"
                                text={findUpper(`${item?.firstname} ${item?.lastname}`)}
                                image={item?.avatar}
                              />
                              <div className="user-name">
                                <span className="tb-lead ccap">
                                  {truncateText(`${item?.firstname} ${item?.lastname}`, 20)}{" "}
                                </span>
                                <p className="text-primary fw-normal ">{truncateText(item.email, 20)}</p>
                              </div>
                            </div>
                          </Link>
                        </DataTableRow>

                        <DataTableRow size="lg">
                          <span className="ccap ">{item?.username ? truncateText(item?.username, 15) : "Not set"}</span>
                        </DataTableRow>

                        <DataTableRow size="sm">
                          {item.phone ? (
                            <span className="">{`${item.phoneCode ? item.phoneCode : ""} ${item.phone ?? ""}`}</span>
                          ) : (
                            <span className="">Not set</span>
                          )}
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{formatter("NGN").format(item?.wallet?.balance ?? 0)}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="" style={{ whiteSpace: "nowrap" }}>
                            {formatDateWithHyphen(item.createdAt)}
                          </span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span
                            className={`dot bg-${bvnStatusColor(item?.bvnValidated, item?.bvnVerified)} d-sm-none`}
                          />
                          <Badge
                            className="badge-sm badge-dot has-bg d-none d-sm-inline-flex "
                            color={bvnStatusColor(item?.bvnValidated, item?.bvnVerified)}
                          >
                            <span className="ccap ">{item?.bvnVerified ? "Yes" : "No"}</span>
                          </Badge>
                        </DataTableRow>
                        <DataTableRow size={"md"}>
                          <span className={`dot bg-${statusColor(item.status)} d-sm-none`}></span>
                          <Badge
                            className="badge-sm badge-dot has-bg d-none d-sm-inline-flex "
                            color={statusColor(item.status)}
                          >
                            <span className="ccap ">{item.status}</span>
                          </Badge>
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
                                          navigate(`/user-details/${item?._id}`);
                                        }}
                                      >
                                        <Icon name="eye"></Icon>
                                        <span>View user</span>
                                      </DropdownItem>
                                    </li>
                                    <li>
                                      <DropdownItem
                                        tag="a"
                                        href="#view"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setUserId(item?._id);
                                          onEditClick(item?._id);
                                          toggleModal("finance");
                                        }}
                                      >
                                        <Icon name="tranx-fill"></Icon>
                                        <span>Finance User</span>
                                      </DropdownItem>
                                    </li>

                                    <li className="divider"></li>

                                    <li>
                                      <DropdownItem
                                        tag="a"
                                        href="#suspend"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setUserId(item?._id);
                                          updateUserStatus({
                                            status: item.status === "active" ? "inactive" : "active",
                                          });
                                        }}
                                      >
                                        <Icon name="na"></Icon>
                                        <span>{item.status === "active" ? "Restrict" : "Unrestrict"} User</span>
                                      </DropdownItem>
                                    </li>
                                    {item?.status !== "fraudulent" && (
                                      <li
                                        onClick={() => {
                                          setUserId(item?._id);
                                          updateUserStatus({ status: "fraudulent" });
                                        }}
                                      >
                                        <DropdownItem
                                          tag="a"
                                          href="#suspend"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                          }}
                                        >
                                          <Icon name="report"></Icon>
                                          <span>Flag as Fraud.</span>
                                        </DropdownItem>
                                      </li>
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
                  {users?.pagination?.total > 0 && (
                    <PaginationComponent
                      itemPerPage={itemsPerPage}
                      totalItems={users?.pagination?.total}
                      paginate={paginate}
                      currentPage={Number(currentPage)}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="text-center" style={{ paddingBlock: "1rem" }}>
                <span className="text-silent">No users record found</span>
              </div>
            )}
          </DataTable>
        </Block>
        <AddModal modal={view.finance} closeModal={closeModal} onSubmit={onFormSubmit} />

        <UserTypeModal
          modal={view.userType}
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onSubmitUserType}
          filterStatus={filterStatus}
        />
        {/* 
        
        <EditModal
          modal={modal.edit}
          formData={editFormData}
          setFormData={setEditFormData}
          closeModal={closeEditModal}
          onSubmit={onEditSubmit}
          filterStatus={filterStatus}
        /> */}
      </Content>
    </React.Fragment>
  );
};
export default UserList;
