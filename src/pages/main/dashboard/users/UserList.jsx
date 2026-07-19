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
  useGetUserStat,
} from "../../../../api/users/user";
import {
  Block,
  BlockBetween,
  BlockDes,
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
  PreviewCard,
  Row,
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
import { usePermission } from "../../../../utils/usePermission";
import SendAnnouncementModal from "./SendAnnouncement";
import { useCreateAnnouncement } from "../../../../api/announcement";

const UserList = () => {
  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userId, setUserId] = useState(null);
  const [sm, updateSm] = useState(false);

  const [selected, setSelected] = useState([]);
  const [multiple, setMultiple] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const { isLoading, data: users } = useGetAllUsers(currentPage, itemsPerPage, search, status);
  const { isLoading: fetchingStat, data: userStat } = useGetUserStat();
  const { mutate: financeUser } = useFinanceUser(userId);
  const { mutate: updateUserStatus } = useUpdateUserStatus(userId);

  const { mutate: updateUserType } = useUpdateUserType(userId);

  const { mutate: createAnnouncement } = useCreateAnnouncement();

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

    setShowAnnouncementModal(false);
    setSelected([]);
    setMultiple(false);
  };

  // Change Page
  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  // function to change the selected property of an item
  const onSelectChange = (e, id) => {
    if (e.currentTarget.checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((a) => a !== id));
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
                <p>You have total of {users?.pagination?.total?.toLocaleString()} users.</p>
              </BlockDes>
            </BlockHeadContent>

            <BlockHeadContent>
              <UncontrolledDropdown>
                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                  <div className="toggle-wrap nk-block-tools-toggle">
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

        <Row className="mb-5">
          <Col lg={5}>
            <PreviewCard>
              <div className="card-inner">
                <ul className="nk-tranx-statistics">
                  <li className="item">
                    <Icon name="users" className="bg-primary-dim"></Icon>
                    <div className="info">
                      <div className="title">Total Wallet Balance</div>
                      <div className="count">
                        {formatter("NGN").format(userStat?.data?.walletBalances?.totalBalance || 0)}
                      </div>
                    </div>
                  </li>
                  <li className="item">
                    <Icon name="users" className="bg-info-dim"></Icon>
                    <div className="info">
                      <div className="title">Total Users</div>
                      <div className="count">{userStat?.data?.total?.toLocaleString() || 0}</div>
                    </div>
                  </li>
                </ul>
              </div>
            </PreviewCard>
          </Col>
          <Col lg={7}>
            <PreviewCard>
              <div className="card-inner">
                <ul className="nk-tranx-statistics">
                  <li className="item">
                    <Icon name="check-circle" className="bg-success-dim"></Icon>
                    <div className="info">
                      <div className="title">Active</div>
                      <div className="count">{userStat?.data?.byStatus?.active?.toLocaleString() || 0}</div>
                    </div>
                  </li>
                  <li className="item">
                    <Icon name="pause-circle" className="bg-warning-dim"></Icon>
                    <div className="info">
                      <div className="title">Inactive</div>
                      <div className="count">{userStat?.data?.byStatus?.inactive?.toLocaleString() || 0}</div>
                    </div>
                  </li>
                  <li className="item">
                    <Icon name="cross" className="bg-danger-dim"></Icon>
                    <div className="info">
                      <div className="title">Fraudulent</div>
                      <div className="count">{userStat?.data?.byStatus?.fraudulent?.toLocaleString() || 0}</div>
                    </div>
                  </li>
                  <li className="item">
                    <Icon name="shield-check" className="bg-info-dim"></Icon>
                    <div className="info">
                      <div className="title">BVN Verified</div>
                      <div className="count">{userStat?.data?.bvnVerifiedCount?.toLocaleString() || 0}</div>
                    </div>
                  </li>
                </ul>
              </div>
            </PreviewCard>
          </Col>
        </Row>

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
                  onClick={() => setShowAnnouncementModal(true)}
                  color={"primary"}
                  size={"sm"}
                >
                  Send Announcement
                </Button>
              </>
            )}
          </Block>

          {!!selected.length && (
            <div className="mb-2 mt-2 text-soft">
              {selected.length} user{selected.length > 1 ? "s" : ""} selected.
            </div>
          )}

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
                    <DataTableRow>
                      {multiple ? (
                        <div className="custom-control custom-control-sm custom-checkbox notext">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            checked={selected?.length === users?.data?.length}
                            id={"select-all"}
                            key={Math.random()}
                            onChange={(e) => {
                              const allIds = users?.data?.map((item) => item?._id);

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
                        <DataTableRow>
                          {multiple ? (
                            <div className="custom-control custom-control-sm custom-checkbox notext">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                checked={selected.includes(item?._id)}
                                id={item?._id + "uid1"}
                                key={Math.random()}
                                onChange={(e) => onSelectChange(e, item?._id)}
                              />
                              <label className="custom-control-label" htmlFor={item?._id + "uid1"}></label>
                            </div>
                          ) : (
                            <span> {tableNumbers(currentPage, itemsPerPage) + idx + 1}</span>
                          )}
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
                                    {hasPermission("alerts.create") && (
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#view"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setSelected([item?._id]);
                                            setShowAnnouncementModal(true);
                                          }}
                                        >
                                          <Icon name="inbox-fill"></Icon>
                                          <span>Send Announcement</span>
                                        </DropdownItem>
                                      </li>
                                    )}
                                    {hasPermission("users.manage_wallet") && (
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
                                    )}

                                    {hasPermission("users.suspend") && (
                                      <>
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
                                      </>
                                    )}
                                    {item?.status !== "fraudulent" && hasPermission("users.suspend") && (
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

        <SendAnnouncementModal
          closeModal={closeModal}
          modal={showAnnouncementModal}
          createFunction={createAnnouncement}
          selectedUsers={selected}
        />
      </Content>
    </React.Fragment>
  );
};
export default UserList;
