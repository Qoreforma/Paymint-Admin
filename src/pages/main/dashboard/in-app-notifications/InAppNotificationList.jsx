import React, { useState } from "react";
import {
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  Badge,
  Progress,
  Input,
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
  Row,
  RSelect,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDateWithTime, truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { usePermission } from "../../../../utils/usePermission";
import { useGetInAppNotificationGroups } from "../../../../api/inAppNotifications";

import ViewDetailsModal from "./ViewDetailsModal";
import EditGroupModal from "./EditGroupModal";
import SetExpiryModal from "./SetExpiryModal";
import DeleteGroupModal from "./DeleteGroupModal";
import ClearByTypeModal from "./ClearByTypeModal";
import CreateBroadcastModal from "./CreateBroadcastModal";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "deleted", label: "Deleted" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "announcement", label: "Announcement" },
  { value: "alert", label: "System Alert" },
  { value: "transaction", label: "Transaction" },
  { value: "referral", label: "Referral" },
  { value: "system", label: "System" },
];

const InAppNotificationList = () => {
  const { hasPermission } = usePermission();

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);
  const [selectedType, setSelectedType] = useState(TYPE_OPTIONS[0]);

  // Modals state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [expiryModal, setExpiryModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [clearTypeModal, setClearTypeModal] = useState(false);
  const [createBroadcastModal, setCreateBroadcastModal] = useState(false);

  const { data, isLoading, refetch } = useGetInAppNotificationGroups(
    page,
    limit,
    search,
    selectedType.value,
    selectedStatus.value
  );

  const groups = data?.data?.groups || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };
  const summary = data?.data?.summary || {
    totalGroups: 0,
    activeGroups: 0,
    expiredGroups: 0,
    totalRecipients: 0,
    totalRead: 0,
    averageReadRate: 0,
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setSelectedStatus(STATUS_OPTIONS[0]);
    setSelectedType(TYPE_OPTIONS[0]);
    setPage(1);
  };

  const getStatusBadge = (status, expiresAt) => {
    if (status === "deleted") {
      return <Badge color="danger">Deleted</Badge>;
    }
    if (status === "expired" || (expiresAt && new Date(expiresAt) <= new Date())) {
      return <Badge color="warning">Expired</Badge>;
    }
    return <Badge color="success">Active</Badge>;
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "announcement":
        return <Badge color="primary" className="badge-dim">Announcement</Badge>;
      case "alert":
        return <Badge color="info" className="badge-dim">System Alert</Badge>;
      case "transaction":
        return <Badge color="secondary" className="badge-dim">Transaction</Badge>;
      case "referral":
        return <Badge color="dark" className="badge-dim">Referral</Badge>;
      default:
        return <Badge color="light" className="text-dark">{type || "General"}</Badge>;
    }
  };

  const formatExpiryTime = (expiresAt) => {
    if (!expiresAt) return <span className="text-muted small">No Expiry (Permanent)</span>;

    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return (
        <span className="text-warning small" title={formatDateWithTime(expiresAt)}>
          <Icon name="clock" className="me-1" />
          Expired on {formatDateWithTime(expiresAt)}
        </span>
      );
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays >= 1) {
      return (
        <span className="text-success small" title={formatDateWithTime(expiresAt)}>
          <Icon name="clock" className="me-1" />
          Expires in {diffDays} {diffDays === 1 ? "day" : "days"}
        </span>
      );
    }

    return (
      <span className="text-info small" title={formatDateWithTime(expiresAt)}>
        <Icon name="clock" className="me-1" />
        Expires in {Math.max(1, diffHours)}h
      </span>
    );
  };

  return (
    <React.Fragment>
      <Head title="In-App Notifications - Paymint Admin" />
      <Content>
        {/* Page Header */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3">
                In-App Notifications
              </BlockTitle>
              <div className="nk-block-des text-soft">
                <p>
                  Manage broadcast in-app messages, control lifetime/TTL (e.g. 2 days), and edit or recall notifications across all recipient inboxes.
                </p>
              </div>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="d-flex gap-2">
                {hasPermission("alerts.delete") && (
                  <Button
                    color="outline-danger"
                    className="d-flex align-items-center"
                    onClick={() => setClearTypeModal(true)}
                  >
                    <Icon name="trash" className="me-1" />
                    <span>Clear by Type</span>
                  </Button>
                )}
                {hasPermission("alerts.create") && (
                  <Button
                    color="primary"
                    className="d-flex align-items-center"
                    onClick={() => setCreateBroadcastModal(true)}
                  >
                    <Icon name="plus" className="me-1" />
                    <span>Send In-App Broadcast</span>
                  </Button>
                )}
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* KPI Summary Cards */}
        <Block>
          <Row className="g-3">
            <Col sm="6" lg="3">
              <Card className="card-bordered p-3 shadow-sm bg-white">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle avatar-circle-md bg-primary-dim text-primary me-3" style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="bell-fill" className="fs-3" />
                  </div>
                  <div>
                    <span className="text-muted small fw-medium d-block">Broadcast Groups</span>
                    <h4 className="mb-0 fw-bold">{summary.totalGroups.toLocaleString()}</h4>
                  </div>
                </div>
              </Card>
            </Col>

            <Col sm="6" lg="3">
              <Card className="card-bordered p-3 shadow-sm bg-white">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle avatar-circle-md bg-success-dim text-success me-3" style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="check-circle" className="fs-3" />
                  </div>
                  <div>
                    <span className="text-muted small fw-medium d-block">Active Broadcasts</span>
                    <h4 className="mb-0 fw-bold text-success">{summary.activeGroups.toLocaleString()}</h4>
                  </div>
                </div>
              </Card>
            </Col>

            <Col sm="6" lg="3">
              <Card className="card-bordered p-3 shadow-sm bg-white">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle avatar-circle-md bg-warning-dim text-warning me-3" style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="clock" className="fs-3" />
                  </div>
                  <div>
                    <span className="text-muted small fw-medium d-block">Expired Messages</span>
                    <h4 className="mb-0 fw-bold text-warning">{summary.expiredGroups.toLocaleString()}</h4>
                  </div>
                </div>
              </Card>
            </Col>

            <Col sm="6" lg="3">
              <Card className="card-bordered p-3 shadow-sm bg-white">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle avatar-circle-md bg-info-dim text-info me-3" style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="users" className="fs-3" />
                  </div>
                  <div>
                    <span className="text-muted small fw-medium d-block">Total User Inboxes</span>
                    <h4 className="mb-0 fw-bold text-info">
                      {summary.totalRecipients.toLocaleString()}{" "}
                      <small className="text-muted fs-6 fw-normal">({summary.averageReadRate}% read)</small>
                    </h4>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Block>

        {/* Main Data Table Block */}
        <Block>
          <Card className="card-bordered">
            {/* Toolbar Filters */}
            <div className="card-inner border-bottom p-3">
              <Row className="g-3 align-items-center justify-content-between">
                <Col md="4">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="form-control-wrap">
                      <div className="form-icon form-icon-left">
                        <Icon name="search" />
                      </div>
                      <Input
                        type="text"
                        className="form-control"
                        placeholder="Search by title or message..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                  </form>
                </Col>

                <Col md="8">
                  <div className="d-flex flex-wrap justify-content-md-end gap-2 align-items-center">
                    <div style={{ minWidth: "150px" }}>
                      <RSelect
                        options={TYPE_OPTIONS}
                        value={selectedType}
                        onChange={(val) => {
                          setSelectedType(val);
                          setPage(1);
                        }}
                        isSearchable={false}
                      />
                    </div>
                    <div style={{ minWidth: "140px" }}>
                      <RSelect
                        options={STATUS_OPTIONS}
                        value={selectedStatus}
                        onChange={(val) => {
                          setSelectedStatus(val);
                          setPage(1);
                        }}
                        isSearchable={false}
                      />
                    </div>
                    {(search || selectedType.value || selectedStatus.value) && (
                      <Button color="light" size="sm" onClick={handleClearFilters}>
                        <Icon name="reload" className="me-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Table */}
            <div className="card-inner p-0">
              {isLoading ? (
                <div className="py-5 text-center">
                  <LoadingSpinner />
                </div>
              ) : groups.length > 0 ? (
                <>
                  <DataTableBody className="is-compact">
                    <DataTableHead className="bg-light fw-bold text-secondary">
                      <DataTableRow>
                        <span>Notification</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span>Category</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span>Audience</span>
                      </DataTableRow>
                      <DataTableRow size="lg">
                        <span>Read Rate</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span>Dispatched</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span>Expiry (TTL)</span>
                      </DataTableRow>
                      <DataTableRow className="text-end">
                        <span>Action</span>
                      </DataTableRow>
                    </DataTableHead>

                    {groups.map((group, idx) => {
                      const isExpired = group.status === "expired" || (group.expiresAt && new Date(group.expiresAt) <= new Date());
                      return (
                        <DataTableItem key={group.groupKey || idx} className="nk-tb-item">
                          <DataTableRow>
                            <div className="project-info">
                              <h6 className="title mb-1 text-dark">
                                {group.title || "Untitled Notification"}
                              </h6>
                              <span className="text-muted small">
                                {truncateText(group.message || "", 75)}
                              </span>
                            </div>
                          </DataTableRow>

                          <DataTableRow size="sm">
                            {getTypeBadge(group.type)}
                          </DataTableRow>

                          <DataTableRow size="md">
                            <span className="fw-medium text-dark">
                              {(group.recipientCount || 0).toLocaleString()} users
                            </span>
                          </DataTableRow>

                          <DataTableRow size="lg">
                            <div className="d-flex align-items-center gap-2" style={{ minWidth: "120px" }}>
                              <div className="flex-grow-1">
                                <Progress
                                  value={group.readRate || 0}
                                  color={group.readRate > 50 ? "success" : group.readRate > 20 ? "info" : "warning"}
                                  style={{ height: "6px" }}
                                />
                              </div>
                              <span className="small text-muted fw-bold">
                                {group.readRate || 0}%
                              </span>
                            </div>
                            <span className="text-muted small d-block">
                              {(group.readCount || 0).toLocaleString()} read
                            </span>
                          </DataTableRow>

                          <DataTableRow size="md">
                            <span className="small text-muted">
                              {group.createdAt ? formatDateWithTime(group.createdAt) : "—"}
                            </span>
                          </DataTableRow>

                          <DataTableRow size="sm">
                            <div>
                              <div className="mb-1">
                                {getStatusBadge(group.status, group.expiresAt)}
                              </div>
                              {formatExpiryTime(group.expiresAt)}
                            </div>
                          </DataTableRow>

                          <DataTableRow className="nk-tb-col-tools text-end">
                            <ul className="nk-tb-actions gx-1">
                              <li>
                                <UncontrolledDropdown>
                                  <DropdownToggle tag="a" className="btn btn-icon btn-trigger">
                                    <Icon name="more-h" />
                                  </DropdownToggle>
                                  <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#details"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setSelectedGroup(group);
                                            setViewDetailsModal(true);
                                          }}
                                        >
                                          <Icon name="eye" className="text-primary" />
                                          <span>View Details</span>
                                        </DropdownItem>
                                      </li>

                                      {hasPermission("alerts.update") && (
                                        <>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                setSelectedGroup(group);
                                                setEditModal(true);
                                              }}
                                            >
                                              <Icon name="edit" className="text-warning" />
                                              <span>Edit for All Users</span>
                                            </DropdownItem>
                                          </li>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#expiry"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                setSelectedGroup(group);
                                                setExpiryModal(true);
                                              }}
                                            >
                                              <Icon name="clock" className="text-info" />
                                              <span>Set Duration / Expiry</span>
                                            </DropdownItem>
                                          </li>
                                        </>
                                      )}

                                      {hasPermission("alerts.delete") && (
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#delete"
                                            className="text-danger"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setSelectedGroup(group);
                                              setDeleteModal(true);
                                            }}
                                          >
                                            <Icon name="trash" />
                                            <span>Delete for All Users</span>
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

                  <div className="card-inner border-top">
                    <PaginationComponent
                      itemPerPage={limit}
                      totalItems={pagination.total}
                      paginate={(pageNumber) => setPage(pageNumber)}
                      currentPage={page}
                    />
                  </div>
                </>
              ) : (
                <div className="p-5 text-center text-muted">
                  <div className="avatar-circle avatar-circle-lg bg-light text-muted mx-auto mb-3" style={{ width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="bell-off" className="fs-1" />
                  </div>
                  <h6 className="title">No In-App Notifications Found</h6>
                  <p className="small text-muted mb-3">
                    {search || selectedType.value || selectedStatus.value
                      ? "No notifications match your search or filter criteria."
                      : "No in-app notifications have been broadcasted yet."}
                  </p>
                  {(search || selectedType.value || selectedStatus.value) && (
                    <Button color="primary" size="sm" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </Block>

        {/* Modals */}
        {viewDetailsModal && (
          <ViewDetailsModal
            isOpen={viewDetailsModal}
            toggle={() => setViewDetailsModal(!viewDetailsModal)}
            group={selectedGroup}
          />
        )}

        {editModal && (
          <EditGroupModal
            isOpen={editModal}
            toggle={() => setEditModal(!editModal)}
            group={selectedGroup}
          />
        )}

        {expiryModal && (
          <SetExpiryModal
            isOpen={expiryModal}
            toggle={() => setExpiryModal(!expiryModal)}
            group={selectedGroup}
          />
        )}

        {deleteModal && (
          <DeleteGroupModal
            isOpen={deleteModal}
            toggle={() => setDeleteModal(!deleteModal)}
            group={selectedGroup}
          />
        )}

        {clearTypeModal && (
          <ClearByTypeModal
            isOpen={clearTypeModal}
            toggle={() => setClearTypeModal(!clearTypeModal)}
          />
        )}

        {createBroadcastModal && (
          <CreateBroadcastModal
            isOpen={createBroadcastModal}
            toggle={() => setCreateBroadcastModal(!createBroadcastModal)}
          />
        )}
      </Content>
    </React.Fragment>
  );
};

export default InAppNotificationList;
