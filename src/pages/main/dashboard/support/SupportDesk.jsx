import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Nav, NavItem, NavLink, TabContent, TabPane, Spinner } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Icon,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import LiveChatDesk from "./LiveChatDesk";
import TicketQueueTable from "./TicketQueueTable";
import OutagesManager from "./OutagesManager";
import { useGetSupportStats } from "../../../../api/support";
import "./support.css";

const SupportDesk = () => {
  const { tab, ticketId } = useParams();
  const navigate = useNavigate();

  // Active tab: "chat", "queue", "outages"
  const [activeTab, setActiveTab] = useState(tab || "chat");
  const [selectedTicketId, setSelectedTicketId] = useState(ticketId || null);

  // Queue & SLA Stats
  const { data: statsRes, isLoading: loadingStats, refetch: refetchStats } = useGetSupportStats();
  const stats = statsRes?.data || {
    queuedTickets: 0,
    activeTickets: 0,
    resolvedToday: 0,
    avgWaitTimeSeconds: 0,
  };

  useEffect(() => {
    if (tab && ["chat", "queue", "outages"].includes(tab)) {
      setActiveTab(tab);
    }
    if (ticketId) {
      setSelectedTicketId(ticketId);
      setActiveTab("chat");
    }
  }, [tab, ticketId]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    navigate(`/support-desk/${newTab}`);
  };

  const handleOpenChatFromQueue = (targetTicketId) => {
    setSelectedTicketId(targetTicketId);
    setActiveTab("chat");
    navigate(`/support-desk/chat`);
  };

  const formatWaitTime = (seconds) => {
    if (!seconds || seconds <= 0) return "< 1m";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  return (
    <React.Fragment>
      <Head title="Customer Support Desk" />
      <Content>
        {/* ── Page Header ── */}
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page tag="h3">
                Customer Support Operations
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>
                  Manage AI bot escalations, real-time customer conversations, SLA ticket queues, and upstream provider status.
                </p>
              </BlockDes>
            </BlockHeadContent>

            <BlockHeadContent>
              <div className="d-flex align-items-center gap-2">
                <Button
                  color="light"
                  outline
                  size="sm"
                  onClick={() => refetchStats()}
                  disabled={loadingStats}
                >
                  <Icon name="reload" className="me-1" />
                  <span>Refresh Queue</span>
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* ── Metric Summary Cards ── */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div className="card card-bordered p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-soft" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    WAITING IN QUEUE
                  </span>
                  <div className="font-weight-bold fs-4 text-warning mt-1">
                    {loadingStats ? <Spinner size="sm" /> : stats.queuedTickets ?? 0}
                  </div>
                </div>
                <div className="icon-circle bg-warning-dim text-warning">
                  <Icon name="clock" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="card card-bordered p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-soft" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    ACTIVE LIVE CHATS
                  </span>
                  <div className="font-weight-bold fs-4 text-primary mt-1">
                    {loadingStats ? <Spinner size="sm" /> : stats.activeTickets ?? 0}
                  </div>
                </div>
                <div className="icon-circle bg-primary-dim text-primary">
                  <Icon name="chat-fill" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="card card-bordered p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-soft" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    AVG SLA WAIT TIME
                  </span>
                  <div className="font-weight-bold fs-4 text-dark mt-1">
                    {loadingStats ? <Spinner size="sm" /> : formatWaitTime(stats.avgWaitTimeSeconds)}
                  </div>
                </div>
                <div className="icon-circle bg-info-dim text-info">
                  <Icon name="activity" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="card card-bordered p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-soft" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    RESOLVED TODAY
                  </span>
                  <div className="font-weight-bold fs-4 text-success mt-1">
                    {loadingStats ? <Spinner size="sm" /> : stats.resolvedToday ?? 0}
                  </div>
                </div>
                <div className="icon-circle bg-success-dim text-success">
                  <Icon name="check-circle" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Tabs ── */}
        <Nav tabs className="mb-3 border-bottom">
          <NavItem>
            <NavLink
              className={`font-weight-bold px-3 py-2 ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => handleTabChange("chat")}
              style={{ cursor: "pointer" }}
            >
              <Icon name="chat-circle" className="me-1" />
              <span>Live Support Desk</span>
              {stats.queuedTickets > 0 && (
                <span className="badge bg-warning ms-2">{stats.queuedTickets}</span>
              )}
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              className={`font-weight-bold px-3 py-2 ${activeTab === "queue" ? "active" : ""}`}
              onClick={() => handleTabChange("queue")}
              style={{ cursor: "pointer" }}
            >
              <Icon name="list-thumb" className="me-1" />
              <span>Ticket Queue</span>
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              className={`font-weight-bold px-3 py-2 ${activeTab === "outages" ? "active" : ""}`}
              onClick={() => handleTabChange("outages")}
              style={{ cursor: "pointer" }}
            >
              <Icon name="broadcast" className="me-1" />
              <span>Provider Outages</span>
            </NavLink>
          </NavItem>
        </Nav>

        {/* ── Tab Content Panes ── */}
        <TabContent activeTab={activeTab}>
          <TabPane tabId="chat">
            <LiveChatDesk
              preselectedTicketId={selectedTicketId}
              onSelectTicket={(id) => setSelectedTicketId(id)}
            />
          </TabPane>

          <TabPane tabId="queue">
            <TicketQueueTable onOpenChat={handleOpenChatFromQueue} />
          </TabPane>

          <TabPane tabId="outages">
            <OutagesManager />
          </TabPane>
        </TabContent>
      </Content>
    </React.Fragment>
  );
};

export default SupportDesk;
