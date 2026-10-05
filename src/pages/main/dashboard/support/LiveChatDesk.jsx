import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Input, Badge, Spinner } from "reactstrap";
import { Button, Icon, UserAvatar } from "../../../../components/Component";
import {
  useGetSupportQueue,
  useGetSupportTicket,
  useGetTicketMessages,
  useSendTicketMessage,
  useClaimTicket,
} from "../../../../api/support";
import ReassignModal from "./ReassignModal";
import ResolveModal from "./ResolveModal";
import CloseModal from "./CloseModal";
import dayjs from "dayjs";
import "./support.css";

const CANNED_RESPONSES = [
  "👋 Hello! I am looking into your request right now.",
  "⏳ Please give me 2 minutes while I verify this transaction with our banking partner.",
  "💳 The transaction was re-queried and confirmed successful. Your wallet has been updated.",
  "🔄 Could you please refresh your mobile app to confirm the updated balance?",
  "✅ This issue has been fully resolved. Please let me know if you need anything else!",
];

const LiveChatDesk = ({ preselectedTicketId, onSelectTicket }) => {
  const [filterTab, setFilterTab] = useState("all"); // "all", "active", "queued"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(preselectedTicketId || null);
  const [inputMessage, setInputMessage] = useState("");
  const [mobileAsideVisible, setMobileAsideVisible] = useState(!preselectedTicketId);

  // Modals state
  const [reassignOpen, setReassignOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Queries
  const { data: queueData, isLoading: loadingQueue } = useGetSupportQueue({
    status: filterTab === "all" ? undefined : filterTab,
    search: searchQuery,
    page: 1,
    limit: 50,
  });

  const tickets = queueData?.data || [];

  // Direct fetch for selected ticket to ensure details are populated even if not in current page
  const { data: directTicketRes } = useGetSupportTicket(selectedTicketId);
  const selectedTicket =
    directTicketRes?.data ||
    tickets.find((t) => (t._id || t.id) === selectedTicketId) ||
    null;

  // Messages Query for selected ticket
  const { data: messagesData, isLoading: loadingMessages } = useGetTicketMessages(
    selectedTicketId,
    100
  );
  const messages = messagesData?.data?.messages || [];

  // Mutations
  const { mutate: sendMessage, isLoading: isSending } = useSendTicketMessage();
  const { mutate: claimTicket, isLoading: isClaiming } = useClaimTicket();

  // If preselectedTicketId changes, select it
  useEffect(() => {
    if (preselectedTicketId) {
      setSelectedTicketId(preselectedTicketId);
      setMobileAsideVisible(false);
    } else if (!selectedTicketId && tickets.length > 0) {
      setSelectedTicketId(tickets[0]._id || tickets[0].id);
    }
  }, [preselectedTicketId, tickets]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !selectedTicketId || isSending) return;

    sendMessage(
      {
        ticketId: selectedTicketId,
        text: inputMessage.trim(),
      },
      {
        onSuccess: () => {
          setInputMessage("");
        },
      }
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
  };

  const handleQuickReply = (text) => {
    setInputMessage((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div className="support-chat-container">
      {/* ── Left Column: Ticket Queue List ── */}
      <div className={`support-chat-aside ${!mobileAsideVisible ? "hide-mobile" : ""}`}>
        <div className="support-aside-head">
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="mb-0 font-weight-bold" style={{ fontSize: "0.95rem" }}>
              Active Queue
            </h6>
            <Badge color="light" pill className="text-primary font-weight-bold">
              {tickets.length} Tickets
            </Badge>
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
          ) : tickets.length === 0 ? (
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
            tickets.map((t) => {
              const ticketId = t._id || t.id;
              const isSelected = ticketId === selectedTicketId;
              const user = t.userId || {};
              const userName = user.firstName
                ? `${user.firstName} ${user.lastName || ""}`
                : "Customer";
              const priorityClass = `priority-${t.priority || "medium"}`;
              const statusClass = `status-badge-${t.status || "queued"}`;

              return (
                <div
                  key={ticketId}
                  className={`support-ticket-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectTicket(ticketId)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="font-weight-bold text-dark text-truncate" style={{ fontSize: "0.86rem", maxWidth: "180px" }}>
                      {userName}
                    </span>
                    <span className={`support-badge-priority ${priorityClass}`}>
                      {t.priority || "medium"}
                    </span>
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
                    className="text-muted text-truncate mt-1"
                    style={{ fontSize: "0.78rem", maxWidth: "100%" }}
                  >
                    {t.lastMessageSnippet || t.subject || "No message preview"}
                  </div>

                  <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top border-light">
                    <span className="text-soft" style={{ fontSize: "0.7rem" }}>
                      {dayjs(t.updatedAt || t.createdAt).format("hh:mm A")}
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

                <UserAvatar
                  text={
                    selectedTicket.userId?.firstName
                      ? selectedTicket.userId.firstName[0]
                      : "C"
                  }
                  theme="primary"
                />
                <div className="min-w-0">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <h6 className="mb-0 font-weight-bold text-truncate" style={{ fontSize: "0.95rem", maxWidth: "200px" }}>
                      {selectedTicket.userId?.firstName
                        ? `${selectedTicket.userId.firstName} ${selectedTicket.userId.lastName || ""}`
                        : "Customer"}
                    </h6>
                    <Badge color="outline-light" className="text-primary">
                      #{selectedTicket.ticketNumber || selectedTicket._id?.substring(0, 8)}
                    </Badge>
                    <span
                      className={`support-badge-priority priority-${selectedTicket.priority || "medium"}`}
                    >
                      {selectedTicket.priority || "medium"}
                    </span>
                  </div>
                  <div className="text-soft d-flex align-items-center gap-2 text-truncate" style={{ fontSize: "0.75rem" }}>
                    <span className="text-truncate">{selectedTicket.userId?.email || "No email"}</span>
                    <span>•</span>
                    <span>{selectedTicket.userId?.phone || "No phone"}</span>
                    {selectedTicket.userId?._id && (
                      <Link
                        to={`/user-details/${selectedTicket.userId._id}`}
                        className="text-primary ms-1"
                        target="_blank"
                      >
                        [Profile]
                      </Link>
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
                messages.map((msg, idx) => {
                  const isUser = msg.sender === "user";
                  const isAgent = msg.sender === "agent";
                  const isBot = msg.sender === "bot";
                  const isSystem = msg.sender === "system";

                  let containerType = "user";
                  if (isAgent) containerType = "agent";
                  else if (isBot) containerType = "bot";
                  else if (isSystem) containerType = "system";

                  return (
                    <div key={msg._id || idx} className={`chat-bubble-container ${containerType}`}>
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
                        {dayjs(msg.createdAt).format("hh:mm A")}
                      </div>
                    </div>
                  );
                })
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
