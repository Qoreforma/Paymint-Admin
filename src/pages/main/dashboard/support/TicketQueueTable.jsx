import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Input, Table, Spinner } from "reactstrap";
import {
  Button,
  Icon,
  PaginationComponent,
  UserAvatar,
} from "../../../../components/Component";
import { useGetSupportQueue, useClaimTicket } from "../../../../api/support";
import dayjs from "dayjs";
import "./support.css";

const TicketQueueTable = ({ onOpenChat }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");

  const { data: queueData, isLoading } = useGetSupportQueue(
    { status, priority, search },
    page,
    limit
  );

  const { mutate: claimTicket, isLoading: isClaiming } = useClaimTicket();

  const tickets = queueData?.data || [];
  const total = queueData?.pagination?.total || tickets.length || 0;

  const handleClaim = (ticketId) => {
    claimTicket(ticketId, {
      onSuccess: () => {
        onOpenChat?.(ticketId);
      },
    });
  };

  return (
    <div>
      {/* ── Filters Bar ── */}
      <div className="card-inner p-3 bg-white border rounded mb-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <div className="form-control-wrap">
              <div className="form-icon form-icon-left">
                <Icon name="search" />
              </div>
              <Input
                type="text"
                placeholder="Search ticket #, customer, email, subject..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="col-md-3 col-6">
            <Input
              type="select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="queued">Queued (Waiting Agent)</option>
              <option value="active">Active (In Chat)</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Input>
          </div>

          <div className="col-md-3 col-6">
            <Input
              type="select"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Input>
          </div>

          <div className="col-md-2 d-flex justify-content-end">
            <span className="text-soft font-weight-bold" style={{ fontSize: "0.85rem" }}>
              Total: {total}
            </span>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card card-bordered">
        <div className="table-responsive">
          <Table className="table-tranx">
            <thead>
              <tr className="tb-tnx-head bg-light">
                <th className="tb-tnx-id" style={{ whiteSpace: "nowrap" }}>
                  <span className="overline-title">Ticket #</span>
                </th>
                <th className="tb-tnx-info" style={{ whiteSpace: "nowrap" }}>
                  <span className="overline-title">Customer</span>
                </th>
                <th style={{ whiteSpace: "nowrap" }}>
                  <span className="overline-title">Subject / Snippet</span>
                </th>
                <th style={{ whiteSpace: "nowrap" }}>
                  <span className="overline-title">Priority</span>
                </th>
                <th style={{ whiteSpace: "nowrap" }}>
                  <span className="overline-title">Status</span>
                </th>
                <th style={{ whiteSpace: "nowrap" }}>
                  <span className="overline-title">Assigned Agent</span>
                </th>
                <th style={{ whiteSpace: "nowrap" }}>
                  <span className="overline-title">Updated</span>
                </th>
                <th className="text-end" style={{ whiteSpace: "nowrap" }}>
                  <span className="overline-title">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <Spinner size="sm" color="primary" />
                    <div className="text-soft mt-2" style={{ fontSize: "0.85rem" }}>
                      Loading ticket queue...
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <Icon name="inbox" className="fs-1 text-soft mb-2" />
                    <div className="font-weight-bold text-dark">No Tickets Found</div>
                    <p className="text-soft" style={{ fontSize: "0.82rem" }}>
                      No support tickets matched the selected filters.
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.map((item) => {
                  const ticketId = item._id || item.id;
                  const user = item.userId || {};
                  const userName = user.firstName
                    ? `${user.firstName} ${user.lastName || ""}`
                    : "Customer";

                  return (
                    <tr key={ticketId} className="tb-tnx-item">
                      <td className="tb-tnx-id" style={{ whiteSpace: "nowrap" }}>
                        <span className="font-weight-bold text-primary">
                          #{item.ticketNumber || ticketId.substring(0, 8)}
                        </span>
                      </td>

                      <td className="tb-tnx-info" style={{ whiteSpace: "nowrap" }}>
                        <div className="user-card d-flex align-items-center">
                          <UserAvatar
                            text={userName[0]}
                            theme="primary"
                            size="sm"
                          />
                          <div className="user-info ms-2">
                            <span className="tb-lead font-weight-bold d-block">{userName}</span>
                            <span className="sub-text" style={{ fontSize: "0.75rem" }}>
                              {user.email || user.phone || "No contact info"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ maxWidth: "240px" }}>
                        <div className="text-truncate font-weight-medium text-dark" style={{ fontSize: "0.85rem" }}>
                          {item.subject || item.lastMessageSnippet || "Support Request"}
                        </div>
                        {item.category && (
                          <span className="badge bg-light text-muted" style={{ fontSize: "0.68rem" }}>
                            {item.category}
                          </span>
                        )}
                      </td>

                      <td style={{ whiteSpace: "nowrap" }}>
                        <span
                          className={`support-badge-priority priority-${item.priority || "medium"}`}
                        >
                          {item.priority || "medium"}
                        </span>
                      </td>

                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className={`status-badge-${item.status || "queued"}`}>
                          {item.status === "queued"
                            ? "Waiting Agent"
                            : item.status === "active"
                            ? "In Chat"
                            : item.status}
                        </span>
                      </td>

                      <td style={{ whiteSpace: "nowrap" }}>
                        {item.assignedAdminId ? (
                          <span className="font-weight-medium text-dark" style={{ fontSize: "0.82rem" }}>
                            {item.assignedAdminId.fullName || item.assignedAdminId.email || "Assigned"}
                          </span>
                        ) : (
                          <span className="badge bg-warning-dim text-warning font-weight-bold">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: "#64748b" }}>
                        {dayjs(item.updatedAt || item.createdAt).format("MMM DD, hh:mm A")}
                      </td>

                      <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          {item.status === "queued" ? (
                            <Button
                              color="primary"
                              size="xs"
                              onClick={() => handleClaim(ticketId)}
                              disabled={isClaiming}
                            >
                              <Icon name="hand" className="me-1" />
                              <span>Claim</span>
                            </Button>
                          ) : (
                            <Button
                              color="light"
                              size="xs"
                              outline
                              onClick={() => onOpenChat?.(ticketId)}
                            >
                              <Icon name="chat-fill" className="me-1 text-primary" />
                              <span>Chat</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {total > limit && (
          <div className="card-inner py-2 px-3 border-top d-flex justify-content-between align-items-center">
            <span className="text-soft" style={{ fontSize: "0.8rem" }}>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
            </span>
            <PaginationComponent
              itemPerPage={limit}
              totalItems={total}
              paginate={(p) => setPage(p)}
              currentPage={page}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketQueueTable;
