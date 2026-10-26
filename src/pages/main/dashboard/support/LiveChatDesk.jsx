import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input, Badge, Spinner } from "reactstrap";
import { Button, Icon, UserAvatar } from "../../../../components/Component";
import {
  useGetSupportQueue,
  useGetSupportTicket,
  useGetTicketMessages,
  useSendTicketMessage,
  useClaimTicket,
} from "../../../../api/support";
import { useQueryClient } from "@tanstack/react-query";
import ReassignModal from "./ReassignModal";
import ResolveModal from "./ResolveModal";
import CloseModal from "./CloseModal";
import useSupportSocket from "../../../../hooks/useSupportSocket";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import "./support.css";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const CANNED_RESPONSES = [
  "👋 Hello! I am looking into your request right now.",
  "⏳ Please give me 2 minutes while I verify this transaction with our banking partner.",
  "💳 The transaction was re-queried and confirmed successful. Your wallet has been updated.",
  "🔄 Could you please refresh your mobile app to confirm the updated balance?",
  "✅ This issue has been fully resolved. Please let me know if you need anything else!",
];

/**
 * Smart timestamp — shows time only if today, "Yesterday HH:MM" if yesterday,
 * full date otherwise. Used in ticket cards.
 */
const formatTicketTime = (ts) => {
  if (!ts) return "";
  const d = dayjs(ts);
  if (!d.isValid()) return "";
  if (d.isToday()) return d.format("hh:mm A");
  if (d.isYesterday()) return `Yesterday ${d.format("hh:mm A")}`;
  return d.format("MMM D, YYYY");
};

/**
 * Smart timestamp for chat messages.
 */
const formatMsgTime = (ts) => {
  if (!ts) return "";
  const d = dayjs(ts);
  if (!d.isValid()) return "";
  if (d.isToday()) return d.format("hh:mm A");
  if (d.isYesterday()) return `Yesterday ${d.format("hh:mm A")}`;
  return d.format("MMM D, YYYY hh:mm A");
};

/**
 * Returns the date label used for chat date dividers.
 */
const getMsgDateLabel = (ts) => {
  if (!ts) return "";
  const d = dayjs(ts);
  if (!d.isValid()) return "";
  if (d.isToday()) return "Today";
  if (d.isYesterday()) return "Yesterday";
  return d.format("MMMM D, YYYY");
};

/**
 * Robust user display name supporting both firstname/lastname and firstName/lastName
 */
const getUserDisplayName = (user) => {
  if (!user) return "Customer";
  if (typeof user === "string") return "Customer";
  const first = user.firstname || user.firstName || "";
  const last = user.lastname || user.lastName || "";
  const full = `${first} ${last}`.trim();
  return full || user.email || "Customer";
};

/**
 * Extract initial for avatar
 */
const getUserInitial = (user) => {
  const name = getUserDisplayName(user);
  return name && name !== "Customer" ? name[0].toUpperCase() : "C";
};

/**
 * Extract profile user ID safely
 */
const getUserProfileId = (ticket) => {
  if (!ticket) return null;
  if (ticket.userId && typeof ticket.userId === "object" && ticket.userId._id) {
    return ticket.userId._id;
  }
  if (typeof ticket.userId === "string") return ticket.userId;
  return null;
};

/**
 * Priority → sort weight (lower = higher in list).
 */
const PRIORITY_WEIGHT = { urgent: 0, high: 1, medium: 2, low: 3 };

/**
 * Sort tickets: unread first (by priority), then active (by priority), then rest.
 */
const sortTickets = (tickets, unreadCounts) => {
  return [...tickets].sort((a, b) => {
    const aId = a._id || a.id;
    const bId = b._id || b.id;
    const aUnread = (unreadCounts[aId] || 0) > 0;
    const bUnread = (unreadCounts[bId] || 0) > 0;
    const aPrio = PRIORITY_WEIGHT[a.priority] ?? 2;
    const bPrio = PRIORITY_WEIGHT[b.priority] ?? 2;

    // 1. Unread tickets first
    if (aUnread !== bUnread) return aUnread ? -1 : 1;
    // 2. By priority weight within same unread group
    if (aPrio !== bPrio) return aPrio - bPrio;
    // 3. Most recently updated
    return dayjs(b.updatedAt || b.createdAt).unix() - dayjs(a.updatedAt || a.createdAt).unix();
  });
};

const LiveChatDesk = ({ preselectedTicketId, onSelectTicket }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(preselectedTicketId || null);
  const [inputMessage, setInputMessage] = useState("");
  const [mobileAsideVisible, setMobileAsideVisible] = useState(!preselectedTicketId);

  // Unread count per ticket (tracked locally via socket events)
  const [unreadCounts, setUnreadCounts] = useState({});

  // Modals
  const [reassignOpen, setReassignOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const selectedTicketIdRef = useRef(selectedTicketId);
  useEffect(() => { selectedTicketIdRef.current = selectedTicketId; }, [selectedTicketId]);

  // ── Socket ──────────────────────────────────────────────────────────────
  const { getSocket, connected } = useSupportSocket(true);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: queueData, isLoading: loadingQueue } = useGetSupportQueue({
    status: filterTab === "all" ? undefined : filterTab,
    search: searchQuery,
    page: 1,
    limit: 50,
  });

  const tickets = queueData?.data || [];
  const sortedTickets = sortTickets(tickets, unreadCounts);

  const { data: directTicketRes } = useGetSupportTicket(selectedTicketId);
  const selectedTicket =
    directTicketRes?.data ||
    tickets.find((t) => (t._id || t.id) === selectedTicketId) ||
    null;

  const { data: messagesData, isLoading: loadingMessages } = useGetTicketMessages(
    selectedTicketId,
    100
  );
  const messages = messagesData?.data?.messages || [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: sendMessage, isLoading: isSending } = useSendTicketMessage();
  const { mutate: claimTicket, isLoading: isClaiming } = useClaimTicket();

  // ── Socket event wiring ──────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewTicket = (data) => {
      // Refresh queue so the new ticket appears
      queryClient.invalidateQueries(["support-queue"]);
      queryClient.invalidateQueries(["support-stats"]);
    };

    const handleMessage = (data) => {
      const { ticketId } = data;
      if (!ticketId) return;

      // Refresh messages for the active ticket
      queryClient.invalidateQueries(["support-ticket-messages", ticketId]);
      // Refresh queue to update lastMessageSnippet / updatedAt
      queryClient.invalidateQueries(["support-queue"]);

      // If this is NOT the currently visible ticket, increment unread badge
      if (ticketId !== selectedTicketIdRef.current) {
        setUnreadCounts((prev) => ({
          ...prev,
          [ticketId]: (prev[ticketId] || 0) + 1,
        }));
      }
    };

    const handleQueueChange = () => {
      queryClient.invalidateQueries(["support-queue"]);
      queryClient.invalidateQueries(["support-stats"]);
    };

    socket.on("support:new_ticket", handleNewTicket);
    socket.on("support:message", handleMessage);
    socket.on("support:ticket_claimed", handleQueueChange);
    socket.on("support:ticket_closed", handleQueueChange);
    socket.on("support:ticket_resolved", handleQueueChange);
    socket.on("support:ticket_escalated", handleQueueChange);
    socket.on("support:ticket_reassigned", handleQueueChange);

    return () => {
      socket.off("support:new_ticket", handleNewTicket);
      socket.off("support:message", handleMessage);
      socket.off("support:ticket_claimed", handleQueueChange);
      socket.off("support:ticket_closed", handleQueueChange);
      socket.off("support:ticket_resolved", handleQueueChange);
      socket.off("support:ticket_escalated", handleQueueChange);
      socket.off("support:ticket_reassigned", handleQueueChange);
    };
  }, [connected, queryClient, getSocket]);

  // When a ticket is selected, join its admin room via socket; leave on switch/unmount
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedTicketId) return;
    socket.emit("support:join_ticket", { ticketId: selectedTicketId });

    return () => {
      socket.emit("support:leave_ticket", { ticketId: selectedTicketId });
    };
  }, [selectedTicketId, connected, getSocket]);

  // Preselected ticket from parent / URL param
  useEffect(() => {
    if (preselectedTicketId) {
      setSelectedTicketId(preselectedTicketId);
      setMobileAsideVisible(false);
    } else if (!selectedTicketId && tickets.length > 0) {
      setSelectedTicketId(tickets[0]._id || tickets[0].id);
    }
  }, [preselectedTicketId, tickets]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !selectedTicketId || isSending) return;

    sendMessage(
      { ticketId: selectedTicketId, text: inputMessage.trim() },
      { onSuccess: () => setInputMessage("") }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClaim = () => {
    if (!selectedTicketId) return;
    claimTicket(selectedTicketId);
  };

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    setMobileAsideVisible(false);
    onSelectTicket?.(id);
    // Clear unread count for this ticket
    setUnreadCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleQuickReply = (text) => {
    setInputMessage((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleGoToProfile = (userId) => {
    navigate(`/user-details/${userId}`, {
      state: { from: location.pathname },
    });
  };

  // ── Chat date divider logic ───────────────────────────────────────────────
  const renderMessages = () => {
    let lastDateLabel = null;
    return messages.map((msg, idx) => {
      const isUser = msg.sender === "user";
      const isAgent = msg.sender === "agent";
      const isBot = msg.sender === "bot";
      const isSystem = msg.sender === "system";

      let containerType = "user";
      if (isAgent) containerType = "agent";
      else if (isBot) containerType = "bot";
      else if (isSystem) containerType = "system";

      const dateLabel = msg.createdAt ? getMsgDateLabel(msg.createdAt) : null;
      const showDivider = dateLabel && dateLabel !== lastDateLabel;
      if (showDivider) lastDateLabel = dateLabel;

      return (
        <React.Fragment key={msg._id || idx}>
          {showDivider && (
            <div className="chat-date-divider">
              <span>{dateLabel}</span>
            </div>
          )}
          <div className={`chat-bubble-container ${containerType}`}>
            {isBot && (
              <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: "0.72rem", color: "#64748b" }}>
                <span>🤖 Minty AI Bot (Automated Advice)</span>
              </div>
            )}
            {isAgent && (
              <div className="bubble-meta mb-1 font-weight-bold text-primary" style={{ fontSize: "0.7rem" }}>
                {msg.senderName || "Support Agent"}
              </div>
            )}
            <div
              className={
                isAgent
                  ? "bubble-agent"
                  : isBot
                  ? "bubble-bot"
                  : isSystem
                  ? "bubble-system"
                  : "bubble-user"
              }
            >
              {msg.text}
            </div>
            <div className="bubble-meta">
              {msg.createdAt ? formatMsgTime(msg.createdAt) : ""}
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="support-chat-container">
      {/* ── Left Column: Ticket Queue List ── */}
      <div className={`support-chat-aside ${!mobileAsideVisible ? "hide-mobile" : ""}`}>
        <div className="support-aside-head">
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="mb-0 font-weight-bold" style={{ fontSize: "0.95rem" }}>
              Active Queue
            </h6>
            <div className="d-flex align-items-center gap-2">
              {/* Socket connection dot */}
              <span
                title={connected ? "Live — socket connected" : "Reconnecting…"}
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: connected ? "#22c55e" : "#f59e0b",
                  boxShadow: connected ? "0 0 0 2px #bbf7d0" : "0 0 0 2px #fde68a",
                  flexShrink: 0,
                }}
              />
              <Badge color="light" pill className="text-primary font-weight-bold">
                {tickets.length} Tickets
              </Badge>
            </div>
          </div>

          <div className="support-aside-search">
            <div className="form-control-wrap">
              <div className="form-icon form-icon-left">
                <Icon name="search" />
              </div>
              <Input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search ticket # or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="support-aside-tabs">
            <button
              type="button"
              className={`support-tab-pill ${filterTab === "all" ? "active" : ""}`}
              onClick={() => setFilterTab("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`support-tab-pill ${filterTab === "queued" ? "active" : ""}`}
              onClick={() => setFilterTab("queued")}
            >
              Queued
            </button>
            <button
              type="button"
              className={`support-tab-pill ${filterTab === "active" ? "active" : ""}`}
              onClick={() => setFilterTab("active")}
            >
              Active
            </button>
          </div>
        </div>

        <div className="support-ticket-list">
          {loadingQueue && tickets.length === 0 ? (
            <div className="text-center py-4">
              <Spinner size="sm" color="primary" />
              <div className="text-soft mt-2" style={{ fontSize: "0.8rem" }}>
                Loading tickets...
              </div>
            </div>
          ) : sortedTickets.length === 0 ? (
            <div className="text-center py-5 px-3">
              <Icon name="inbox" className="fs-1 text-soft mb-2" />
              <div className="font-weight-bold text-dark" style={{ fontSize: "0.88rem" }}>
                Queue is Clear
              </div>
              <p className="text-soft mt-1" style={{ fontSize: "0.78rem" }}>
                No support tickets in this view. New escalations will appear here in real-time.
              </p>
            </div>
          ) : (
            sortedTickets.map((t) => {
              const ticketId = t._id || t.id;
              const isSelected = ticketId === selectedTicketId;
              const userName = getUserDisplayName(t.userId);
              const priorityClass = `priority-${t.priority || "medium"}`;
              const statusClass = `status-badge-${t.status || "queued"}`;
              const unread = unreadCounts[ticketId] || 0;

              return (
                <div
                  key={ticketId}
                  className={`support-ticket-card ${isSelected ? "selected" : ""} ${unread > 0 ? "has-unread" : ""}`}
                  onClick={() => handleSelectTicket(ticketId)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span
                      className="font-weight-bold text-dark text-truncate"
                      style={{ fontSize: "0.86rem", maxWidth: "160px" }}
                    >
                      {userName}
                    </span>
                    <div className="d-flex align-items-center gap-1">
                      {unread > 0 && (
                        <span className="support-unread-badge">{unread}</span>
                      )}
                      <span className={`support-badge-priority ${priorityClass}`}>
                        {t.priority || "medium"}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-soft" style={{ fontSize: "0.75rem" }}>
                      #{t.ticketNumber || ticketId.substring(0, 8)}
                    </span>
                    <span className={statusClass}>
                      {t.status === "queued" ? "Queued" : t.status === "active" ? "In Chat" : t.status}
                    </span>
                  </div>

                  <div
                    className={`text-truncate mt-1 ${unread > 0 ? "fw-semibold text-dark" : "text-muted"}`}
                    style={{ fontSize: "0.78rem", maxWidth: "100%" }}
                  >
                    {t.lastMessageSnippet || t.subject || "No message preview"}
                  </div>

                  <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top border-light">
                    <span className="text-soft" style={{ fontSize: "0.7rem" }}>
                      {formatTicketTime(t.updatedAt || t.createdAt)}
                    </span>
                    {t.assignedAdminId ? (
                      <span className="text-primary font-weight-bold" style={{ fontSize: "0.7rem" }}>
                        Agent Assigned
                      </span>
                    ) : (
                      <span className="text-warning font-weight-bold" style={{ fontSize: "0.7rem" }}>
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Center Column: Chat Conversation Stream ── */}
      <div className={`support-chat-body ${mobileAsideVisible ? "hide-mobile" : ""}`}>
        {selectedTicket ? (
          <>
            {/* Chat Head */}
            <div className="support-chat-head">
              <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  className="btn btn-icon btn-sm btn-light d-lg-none shrink-0"
                  onClick={() => setMobileAsideVisible(true)}
                  title="Back to Queue"
                >
                  <Icon name="arrow-left" />
                </button>

                {/* Clickable Avatar → profile */}
                <button
                  type="button"
                  className="btn p-0 border-0 bg-transparent shrink-0"
                  title="View customer profile"
                  onClick={() => {
                    const profileId = getUserProfileId(selectedTicket);
                    if (profileId) handleGoToProfile(profileId);
                  }}
                  style={{ cursor: getUserProfileId(selectedTicket) ? "pointer" : "default" }}
                >
                  <UserAvatar
                    text={getUserInitial(selectedTicket.userId)}
                    theme="primary"
                  />
                </button>

                <div
                  className="d-flex flex-column justify-content-center"
                  style={{ gap: "4px", minWidth: 0 }}
                >
                  <div
                    className="d-flex align-items-center gap-2 flex-wrap"
                    style={{ lineHeight: 1.3 }}
                  >
                    {/* Clickable name → profile */}
                    <button
                      type="button"
                      className="btn p-0 border-0 bg-transparent fw-bold text-dark text-truncate"
                      style={{ fontSize: "0.95rem", lineHeight: 1.3, maxWidth: "220px" }}
                      onClick={() => {
                        const profileId = getUserProfileId(selectedTicket);
                        if (profileId) handleGoToProfile(profileId);
                      }}
                      title="View customer profile"
                    >
                      {getUserDisplayName(selectedTicket.userId)}
                    </button>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        lineHeight: 1.2,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      #{selectedTicket.ticketNumber || selectedTicket._id?.substring(0, 8)}
                    </span>
                    <span
                      className={`support-badge-priority priority-${selectedTicket.priority || "medium"}`}
                      style={{ lineHeight: 1.2 }}
                    >
                      {selectedTicket.priority || "medium"}
                    </span>
                  </div>
                  <div
                    className="text-soft d-flex align-items-center gap-2 flex-wrap"
                    style={{ fontSize: "0.8rem", lineHeight: 1.3, color: "#64748b" }}
                  >
                    <span className="text-truncate">{selectedTicket.userId?.email || "No email"}</span>
                    <span>•</span>
                    <span>{selectedTicket.userId?.phone || "No phone"}</span>
                    {getUserProfileId(selectedTicket) && (
                      <button
                        type="button"
                        className="btn p-0 border-0 bg-transparent text-primary ms-1 fw-medium"
                        style={{ fontSize: "0.8rem" }}
                        onClick={() => handleGoToProfile(getUserProfileId(selectedTicket))}
                        title="View full profile"
                      >
                        [Profile]
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="d-flex align-items-center gap-1 gap-sm-2 flex-wrap justify-content-end shrink-0">
                {selectedTicket.status === "queued" ? (
                  <Button
                    color="primary"
                    size="sm"
                    onClick={handleClaim}
                    disabled={isClaiming}
                  >
                    <Icon name="hand" className="me-1" />
                    <span>Claim</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      color="light"
                      size="sm"
                      outline
                      onClick={() => setReassignOpen(true)}
                      title="Reassign to another agent"
                    >
                      <Icon name="swap" className="me-sm-1" />
                      <span className="d-none d-sm-inline">Reassign</span>
                    </Button>
                    <Button
                      color="success"
                      size="sm"
                      outline
                      onClick={() => setResolveOpen(true)}
                      title="Mark ticket resolved"
                    >
                      <Icon name="check" className="me-sm-1" />
                      <span className="d-none d-sm-inline">Resolve</span>
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      outline
                      onClick={() => setCloseOpen(true)}
                      title="Close ticket session"
                    >
                      <Icon name="cross" className="me-sm-1" />
                      <span className="d-none d-sm-inline">Close</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Context Notice / Escalation Banner */}
            {selectedTicket.escalationReason && (
              <div className="support-context-banner">
                <Icon name="alert-circle" className="fs-5 text-warning shrink-0" />
                <div className="text-truncate">
                  <strong>Escalated Issue:</strong> {selectedTicket.escalationReason}
                  {selectedTicket.category && (
                    <span className="ms-2 badge bg-warning text-dark">
                      {selectedTicket.category}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Chat Messages Stream */}
            <div className="support-messages-stream">
              {loadingMessages && messages.length === 0 ? (
                <div className="text-center py-4">
                  <Spinner size="sm" color="primary" />
                  <div className="text-soft mt-2" style={{ fontSize: "0.8rem" }}>
                    Loading conversation...
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-5 text-soft" style={{ fontSize: "0.85rem" }}>
                  No messages yet in this ticket. Send a greeting to start helping the customer.
                </div>
              ) : (
                renderMessages()
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Foot */}
            <div className="support-chat-foot">
              {/* Quick Canned Responses */}
              <div className="quick-replies-container">
                <span className="quick-replies-label">Quick:</span>
                <div className="quick-replies-bar">
                  {CANNED_RESPONSES.map((resp, i) => (
                    <button
                      key={i}
                      type="button"
                      className="quick-reply-chip"
                      onClick={() => handleQuickReply(resp)}
                      title={resp}
                    >
                      {resp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="support-chat-input-form">
                <div className="support-input-wrap">
                  <Input
                    type="textarea"
                    rows="2"
                    placeholder="Type your message to the customer... (Enter to send)"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={selectedTicket.status === "closed"}
                    style={{ resize: "none" }}
                  />
                </div>
                <Button
                  color="primary"
                  type="submit"
                  disabled={!inputMessage.trim() || isSending || selectedTicket.status === "closed"}
                  className="support-send-btn"
                >
                  {isSending ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Icon name="send-alt" className="me-1" />
                      <span>Send</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center px-4">
            <Icon name="chat-circle" className="text-soft mb-3" style={{ fontSize: "4rem" }} />
            <h5 className="font-weight-bold text-dark">No Ticket Selected</h5>
            <p className="text-soft" style={{ maxWidth: "400px", fontSize: "0.88rem" }}>
              Select an escalated ticket from the queue on the left to start live assisting the customer or pickup a waiting ticket.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTicket && (
        <>
          <ReassignModal
            isOpen={reassignOpen}
            toggle={() => setReassignOpen(!reassignOpen)}
            ticket={selectedTicket}
          />
          <ResolveModal
            isOpen={resolveOpen}
            toggle={() => setResolveOpen(!resolveOpen)}
            ticket={selectedTicket}
          />
          <CloseModal
            isOpen={closeOpen}
            toggle={() => setCloseOpen(!closeOpen)}
            ticket={selectedTicket}
          />
        </>
      )}
    </div>
  );
};

export default LiveChatDesk;
