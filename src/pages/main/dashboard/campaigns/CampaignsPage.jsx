import React, { useState, useMemo } from "react";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import "./campaigns.css";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Button,
  Icon,
  Row,
  Col,
} from "../../../../components/Component";
import {
  Card,
  CardBody,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import {
  useGetAudiences,
  useSyncSources,
  usePreviewAllocation,
  useCreateCampaign,
  useGetCampaigns,
  useGetDailyStats,
  useControlCampaign,
  useResetAudience,
  useDeleteAudience,
  usePruneRecipients,
  useGetEmailBanners,
  useUpdateCampaign,
  useTriggerNightlySweep,
} from "../../../../api/campaigns";
import { formatDateWithTime } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Verified official PayMint links
const OFFICIAL_LINKS = {
  website: "https://paymint.com.ng",
  playStore: "https://play.google.com/store/apps/details?id=com.paymint.app",
  appStore: "https://apps.apple.com/us/app/paymint/id6801909031",
};

// Ready-to-use email templates
const EMAIL_TEMPLATES = {
  brandShowcase: `{{headerBanner}}
{{logo}}
<h2>Exclusive Offer for PayMint Traders</h2>
<p>Hi {{firstName}},</p>
<p>Seamlessly trade Bitcoin, USDT, sell gift cards at the best rates in Nigeria, and pay utility bills with zero hidden charges.</p>
<div style="margin: 24px 0;">
  <a href="${OFFICIAL_LINKS.website}" style="background:#0f3dac; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; display:inline-block; font-weight:bold;">Start Trading on PayMint</a>
</div>
<p style="font-size: 13px; color: #475569; margin-top: 15px;">
  Download the PayMint Mobile App:
  <br/>
  📱 <a href="${OFFICIAL_LINKS.playStore}" style="color: #0f3dac; font-weight: 500;">Google Play Store</a> &bull; 
  🍏 <a href="${OFFICIAL_LINKS.appStore}" style="color: #0f3dac; font-weight: 500;">Apple App Store</a>
</p>
<p>Best regards,<br/>The PayMint Team</p>
{{footerBanner}}`,

  executiveLetter: `{{logo}}
<h3>Important Update from PayMint</h3>
<p>Dear {{firstName}},</p>
<p>We are rolling out upgraded security features, faster bank payouts, and zero fees on select utility bill payments.</p>
<p>Log in to your account at <a href="${OFFICIAL_LINKS.website}" style="color:#0f3dac; font-weight:bold;">paymint.com.ng</a> to experience the new updates.</p>
<p>Warm regards,<br/>PayMint Customer Success Team</p>`,

  quickPromo: `{{headerBanner}}
<h2>Sell Your Gift Cards & Crypto at Top Rates</h2>
<p>Hi {{firstName}},</p>
<p>Don't let your digital assets sit idle. Exchange Steam, Apple, Razer, or Crypto on PayMint today with instant Naira settlement directly to your bank account.</p>
<div style="margin: 20px 0;">
  <a href="${OFFICIAL_LINKS.website}" style="background:#0f3dac; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Check Today's High Rates</a>
</div>
<p>Need support? We are available 24/7.</p>`,
};

const CampaignsPage = () => {
  // Queries
  const {
    data: audiences = [],
    isLoading: loadingAudiences,
    refetch: refetchAudiences,
  } = useGetAudiences();

  const {
    data: campaigns = [],
    isLoading: loadingCampaigns,
    refetch: refetchCampaigns,
  } = useGetCampaigns();

  const { data: dailyStats, isLoading: loadingStats } = useGetDailyStats();
  const { data: banners } = useGetEmailBanners();

  // Mutations
  const { mutate: syncSources, isLoading: isSyncing } = useSyncSources();
  const { mutate: previewAlloc, isLoading: isPreviewing } = usePreviewAllocation();
  const { mutate: createCampaign, isLoading: isCreating } = useCreateCampaign();
  const { mutate: updateCampaign, isLoading: isUpdating } = useUpdateCampaign();
  const { mutate: controlCampaign } = useControlCampaign();
  const { mutate: resetAudience, isLoading: isResetting } = useResetAudience();
  const { mutate: deleteAudience, isLoading: isDeletingAud } = useDeleteAudience();
  const { mutate: pruneRecipients, isLoading: isPruning } = usePruneRecipients();
  const { mutate: triggerSweep, isLoading: isSweeping } = useTriggerNightlySweep();

  // UI States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [attributionModalOpen, setAttributionModalOpen] = useState(false);
  const [selectedCampaignForAttr, setSelectedCampaignForAttr] = useState(null);
  const [showCharts, setShowCharts] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editorTab, setEditorTab] = useState("edit"); // "edit" | "preview"
  const [editEditorTab, setEditEditorTab] = useState("edit");

  // Create Campaign Form State
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    senderName: "PayMint",
    senderEmail: "",
    sendingAccount: "dedicated", // "dedicated" (300/d) | "primary" (200/d)
    htmlContent: EMAIL_TEMPLATES.brandShowcase,
    dailyLimit: 300,
    allocations: {},
  });

  // Edit Campaign Form State
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    subject: "",
    senderName: "PayMint",
    senderEmail: "",
    sendingAccount: "dedicated",
    htmlContent: "",
    dailyLimit: 300,
  });

  // Allocation Preview Result State
  const [previewResult, setPreviewResult] = useState(null);

  // Initialize allocations when opening create modal
  const openCreateModal = () => {
    const initialAlloc = {};
    audiences.forEach((aud) => {
      initialAlloc[aud._id] = {
        count: Math.min(10, aud.uncontactedCount ?? aud.activeCount ?? 0),
        enabled: (aud.activeCount || 0) > 0,
      };
    });

    setFormData({
      name: "",
      subject: "",
      senderName: "PayMint",
      senderEmail: "",
      sendingAccount: "dedicated",
      htmlContent: EMAIL_TEMPLATES.brandShowcase,
      dailyLimit: 300,
      allocations: initialAlloc,
    });
    setPreviewResult(null);
    setEditorTab("edit");
    setCreateModalOpen(true);
  };

  const openEditModal = (camp) => {
    setEditFormData({
      id: camp._id,
      name: camp.name || "",
      subject: camp.subject || "",
      senderName: camp.senderName || "PayMint",
      senderEmail: camp.senderEmail || "",
      sendingAccount: camp.sendingAccount || "dedicated",
      htmlContent: camp.htmlContent || "",
      dailyLimit: camp.dailyLimit || (camp.sendingAccount === "primary" ? 200 : 300),
    });
    setEditEditorTab("edit");
    setEditModalOpen(true);
  };

  const handleToggleAudience = (audId) => {
    setFormData((prev) => ({
      ...prev,
      allocations: {
        ...prev.allocations,
        [audId]: {
          ...prev.allocations[audId],
          enabled: !prev.allocations[audId]?.enabled,
        },
      },
    }));
  };

  const handleCountChange = (audId, count) => {
    const num = Math.max(0, parseInt(count, 10) || 0);
    setFormData((prev) => ({
      ...prev,
      allocations: {
        ...prev.allocations,
        [audId]: {
          ...prev.allocations[audId],
          count: num,
        },
      },
    }));
  };

  // Helper to insert tags into the create editor
  const insertTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      htmlContent: (prev.htmlContent || "") + `\n${tag}\n`,
    }));
  };

  // Helper to insert tags into the edit editor
  const insertEditTag = (tag) => {
    setEditFormData((prev) => ({
      ...prev,
      htmlContent: (prev.htmlContent || "") + `\n${tag}\n`,
    }));
  };

  // Live HTML Preview Renderer
  const renderPreviewHtml = (rawHtml) => {
    if (!rawHtml) return "<p style='color:#94a3b8; text-align:center;'>No email content entered yet.</p>";

    const logoHtml = banners?.logoUrl
      ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${banners.logoUrl}" alt="PayMint Logo" style="max-height: 48px; max-width: 180px; display: inline-block;" /></div>`
      : `<div style="text-align: center; margin-bottom: 16px; font-weight: bold; font-size: 22px; color: #0f3dac;">PayMint</div>`;

    const headerBannerHtml = banners?.headerBannerUrl
      ? `<div style="text-align: center; margin-bottom: 24px;"><img src="${banners.headerBannerUrl}" alt="Header Banner" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto;" /></div>`
      : `<div style="border: 1px dashed #cbd5e1; padding: 12px; border-radius: 6px; text-align: center; color: #94a3b8; margin-bottom: 20px; font-size: 12px;">[Header Banner Slot]</div>`;

    const footerBannerHtml = banners?.footerBannerUrl
      ? `<div style="text-align: center; margin-top: 24px;"><img src="${banners.footerBannerUrl}" alt="Footer Banner" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto;" /></div>`
      : `<div style="border: 1px dashed #cbd5e1; padding: 12px; border-radius: 6px; text-align: center; color: #94a3b8; margin-top: 20px; font-size: 12px;">[Footer Banner Slot]</div>`;

    return rawHtml
      .replace(/\{\{\s*logo\s*\}\}/gi, logoHtml)
      .replace(/\{\{\s*logoUrl\s*\}\}/gi, banners?.logoUrl || "")
      .replace(/\{\{\s*headerBanner\s*\}\}/gi, headerBannerHtml)
      .replace(/\{\{\s*header_banner\s*\}\}/gi, headerBannerHtml)
      .replace(/\{\{\s*headerBannerUrl\s*\}\}/gi, banners?.headerBannerUrl || "")
      .replace(/\{\{\s*footerBanner\s*\}\}/gi, footerBannerHtml)
      .replace(/\{\{\s*footer_banner\s*\}\}/gi, footerBannerHtml)
      .replace(/\{\{\s*footerBannerUrl\s*\}\}/gi, banners?.footerBannerUrl || "")
      .replace(/\{\{\s*firstName\s*\}\}/gi, "John")
      .replace(/\{\{\s*first_name\s*\}\}/gi, "John")
      .replace(/\{\{\s*name\s*\}\}/gi, "John")
      .replace(/\{\{\s*lastName\s*\}\}/gi, "Doe")
      .replace(/\{\{\s*last_name\s*\}\}/gi, "Doe")
      .replace(/\{\{\s*email\s*\}\}/gi, "john.doe@example.com")
      .replace(/\{\{\s*website\s*\}\}/gi, OFFICIAL_LINKS.website)
      .replace(/\{\{\s*playStore\s*\}\}/gi, OFFICIAL_LINKS.playStore)
      .replace(/\{\{\s*appStore\s*\}\}/gi, OFFICIAL_LINKS.appStore);
  };

  const handleRunPreview = () => {
    const formattedAlloc = [];
    Object.entries(formData.allocations).forEach(([audId, conf]) => {
      if (conf.enabled && conf.count > 0) {
        formattedAlloc.push({
          audienceId: audId,
          requestedCount: conf.count,
        });
      }
    });

    if (formattedAlloc.length === 0) {
      alert("Please enable at least one dataset and specify a count > 0.");
      return;
    }

    previewAlloc(formattedAlloc, {
      onSuccess: (data) => {
        setPreviewResult(data);
      },
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim() || !formData.htmlContent.trim()) {
      alert("Please fill in Campaign Name, Subject, and Content.");
      return;
    }

    const formattedAlloc = [];
    Object.entries(formData.allocations).forEach(([audId, conf]) => {
      if (conf.enabled && conf.count > 0) {
        formattedAlloc.push({
          audienceId: audId,
          requestedCount: conf.count,
        });
      }
    });

    if (formattedAlloc.length === 0) {
      alert("Please select at least one database source with requested contacts.");
      return;
    }

    createCampaign(
      {
        name: formData.name,
        subject: formData.subject,
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        sendingAccount: formData.sendingAccount,
        htmlContent: formData.htmlContent,
        dailyLimit: formData.dailyLimit,
        allocations: formattedAlloc,
      },
      {
        onSuccess: () => {
          setCreateModalOpen(false);
          setPreviewResult(null);
        },
      }
    );
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.subject.trim() || !editFormData.htmlContent.trim()) {
      alert("Please fill in Campaign Name, Subject, and Content.");
      return;
    }

    updateCampaign(
      {
        id: editFormData.id,
        data: {
          name: editFormData.name,
          subject: editFormData.subject,
          senderName: editFormData.senderName,
          senderEmail: editFormData.senderEmail,
          sendingAccount: editFormData.sendingAccount,
          htmlContent: editFormData.htmlContent,
          dailyLimit: editFormData.dailyLimit,
        },
      },
      {
        onSuccess: () => {
          setEditModalOpen(false);
        },
      }
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "sending":
        return <Badge color="warning">Sending</Badge>;
      case "completed":
        return <Badge color="success">Completed</Badge>;
      case "paused":
        return <Badge color="secondary">Paused</Badge>;
      case "queued":
        return <Badge color="info">Queued</Badge>;
      case "cancelled":
        return <Badge color="danger">Cancelled</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  // Top stat aggregations
  const totalAudienceContacts = useMemo(() => {
    return audiences.reduce((sum, a) => sum + (a.totalContacts || 0), 0);
  }, [audiences]);

  const totalUncontacted = useMemo(() => {
    return audiences.reduce((sum, a) => sum + (a.uncontactedCount ?? a.activeCount ?? 0), 0);
  }, [audiences]);

  const totalConversions = useMemo(() => {
    let signups = 0;
    let txs = 0;
    let vol = 0;
    campaigns.forEach((c) => {
      signups += c.signupsCount || 0;
      txs += c.firstTransactionsCount || 0;
      vol += c.totalTransactionVolume || 0;
    });
    return { signups, txs, vol };
  }, [campaigns]);

  // Comparative Dataset Performance for Bar Chart
  const datasetComparisonChart = useMemo(() => {
    if (!audiences.length) return null;

    const labels = audiences.map((a) => a.name);
    const totalContactsData = audiences.map((a) => a.totalContacts || 0);

    const sentData = audiences.map((aud) => {
      let count = 0;
      campaigns.forEach((c) => {
        const metric = c.perSourceMetrics?.find(
          (m) => m.sourceName === aud.sourceFileName || m.sourceName === aud.name
        );
        if (metric) count += metric.sentCount || 0;
      });
      return count;
    });

    const openData = audiences.map((aud) => {
      let count = 0;
      campaigns.forEach((c) => {
        const metric = c.perSourceMetrics?.find(
          (m) => m.sourceName === aud.sourceFileName || m.sourceName === aud.name
        );
        if (metric) count += metric.openCount || 0;
      });
      return count;
    });

    const clickData = audiences.map((aud) => {
      let count = 0;
      campaigns.forEach((c) => {
        const metric = c.perSourceMetrics?.find(
          (m) => m.sourceName === aud.sourceFileName || m.sourceName === aud.name
        );
        if (metric) count += metric.clickCount || 0;
      });
      return count;
    });

    const conversionData = audiences.map((aud) => {
      let count = 0;
      campaigns.forEach((c) => {
        const metric = c.perSourceMetrics?.find(
          (m) => m.sourceName === aud.sourceFileName || m.sourceName === aud.name
        );
        if (metric) count += metric.firstTransactionsCount || 0;
      });
      return count;
    });

    return {
      labels,
      datasets: [
        {
          label: "Total Contacts",
          data: totalContactsData,
          backgroundColor: "rgba(148, 163, 184, 0.6)",
          borderColor: "#94a3b8",
          borderWidth: 1,
        },
        {
          label: "Emails Sent",
          data: sentData,
          backgroundColor: "rgba(15, 61, 172, 0.7)",
          borderColor: "#0f3dac",
          borderWidth: 1,
        },
        {
          label: "Opens",
          data: openData,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "#10b981",
          borderWidth: 1,
        },
        {
          label: "Clicks",
          data: clickData,
          backgroundColor: "rgba(245, 158, 11, 0.7)",
          borderColor: "#f59e0b",
          borderWidth: 1,
        },
        {
          label: "Trades Completed",
          data: conversionData,
          backgroundColor: "rgba(139, 92, 246, 0.8)",
          borderColor: "#8b5cf6",
          borderWidth: 1,
        },
      ],
    };
  }, [audiences, campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      const matchesStatus = statusFilter === "all" || camp.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        camp.name?.toLowerCase().includes(query) ||
        camp.subject?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [campaigns, statusFilter, searchQuery]);

  return (
    <>
      <Head title="Email Campaigns & Content Editor"></Head>
      <Content>
        {/* Modern Page Header */}
        <div className="campaign-page-header">
          <div className="campaign-header-title">
            <h2>Email Campaigns & Performance</h2>
            <p>
              Multi-database campaign engine. Slice quotas across JSON datasets, customize email copy with banners & dynamic tags, and monitor conversion ROI.
            </p>
          </div>
          <div className="campaign-header-actions">
            <button
              type="button"
              onClick={() => setShowCharts(!showCharts)}
              className="campaign-btn campaign-btn-outline"
            >
              <Icon name={showCharts ? "eye-off" : "bar-chart"} />
              <span>{showCharts ? "Hide Chart" : "Show Comparison Chart"}</span>
            </button>

            <UncontrolledDropdown>
              <DropdownToggle
                tag="button"
                className="campaign-btn campaign-btn-outline"
              >
                <Icon name="setting" />
                <span>Data Cleanup</span>
                <Icon name="chevron-down" className="ms-1" style={{ fontSize: "10px" }} />
              </DropdownToggle>
              <DropdownMenu end style={{ zIndex: 1060 }}>
                <DropdownItem
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to reset contact history for ALL datasets? All contacts will be marked uncontacted and available for new campaigns."
                      )
                    ) {
                      resetAudience("all");
                    }
                  }}
                >
                  <Icon name="reload" className="me-2 text-warning" />
                  <span>Reset All Contacted History</span>
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    if (
                      window.confirm(
                        "Purge recipient delivery logs for all completed & cancelled campaigns? This frees database storage while preserving your campaign summary metrics."
                      )
                    ) {
                      pruneRecipients("completed");
                    }
                  }}
                >
                  <Icon name="trash" className="me-2 text-danger" />
                  <span>Prune Completed Recipient Logs</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>

            <button
              type="button"
              onClick={() => syncSources()}
              disabled={isSyncing}
              className="campaign-btn campaign-btn-outline"
            >
              <Icon name="reload" className={isSyncing ? "spinner-border spinner-border-sm" : ""} />
              <span>{isSyncing ? "Syncing..." : "Sync JSON Databases"}</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="campaign-btn campaign-btn-primary"
            >
              <Icon name="plus" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>

        {/* Top Metric & Quota Section */}
        <div className="mb-4">
          {/* Nightly 11:30 PM Quota Sweep Banner */}
          <div className="campaign-sweep-card">
            <div className="d-flex align-items-center gap-3">
              <div className="campaign-sweep-icon">
                🌙
              </div>
              <div>
                <div className="campaign-sweep-title">
                  <span>Nightly 11:30 PM Quota Sweep</span>
                  <Badge color="success" className="px-2 py-1 fs-11px">Auto-Scheduled (23:30 WAT)</Badge>
                  <Badge color="light" className="border text-dark px-2 py-1 fs-11px">50 Safety Reserve Kept for OTPs</Badge>
                </div>
                <div className="campaign-sweep-desc">
                  🚀 Dedicated Brevo: <strong>{dailyStats?.dedicatedSentToday || 0} / {dailyStats?.dedicatedLimit || 300}</strong> (100% Campaign) &bull; 
                  🛡️ Primary Platform Brevo: <strong>{dailyStats?.totalBrevoSentToday || 0} / {dailyStats?.accountLimit || 300}</strong> (Tx OTPs: {dailyStats?.transactionalSentToday || 0}, Primary Campaign: {dailyStats?.primarySentToday || 0}) &bull; 
                  Unused Sweepable: <strong className="text-success">{dailyStats?.sweepEligibleQuota ?? 0} bonus emails</strong>
                </div>
              </div>
            </div>
            <div>
              <button
                type="button"
                className="campaign-btn campaign-btn-outline border-success text-success"
                onClick={() => {
                  if (
                    window.confirm(
                      `Trigger immediate Nightly Sweep for up to ${dailyStats?.sweepEligibleQuota || 0} bonus emails while preserving the 50-email OTP buffer?`
                    )
                  ) {
                    triggerSweep();
                  }
                }}
                disabled={isSweeping || (dailyStats?.sweepEligibleQuota || 0) <= 0}
              >
                <Icon name="play" className="me-1" />
                <span>{isSweeping ? "Sweeping..." : "Run Sweep Now"}</span>
              </button>
            </div>
          </div>

          <Row className="g-3">
            {/* Brevo Daily Quota Card */}
            <Col sm="6" lg="3">
              <div className="campaign-stat-box">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="campaign-stat-label">Daily Sending Capacity</span>
                    <Badge color="success" className="fs-10px">Dual Brevo (500/d)</Badge>
                  </div>
                  <div className="campaign-stat-number">
                    {dailyStats?.sentToday || 0}
                    <small>/ {dailyStats?.dailyLimit || 500} sent</small>
                  </div>
                  <div className="campaign-progress-bar">
                    <div
                      className="campaign-progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((dailyStats?.sentToday || 0) / (dailyStats?.dailyLimit || 500)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="campaign-stat-meta d-flex justify-content-between">
                  <span>🚀 Dedicated: {dailyStats?.dedicatedSentToday || 0}/300</span>
                  <span>🛡️ Primary: {dailyStats?.primarySentToday || 0}/200</span>
                </div>
              </div>
            </Col>

            {/* Total Databases / Contacts */}
            <Col sm="6" lg="3">
              <div className="campaign-stat-box">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="campaign-stat-label">Contact Databases</span>
                    <Badge color="info" className="fs-10px">{audiences.length} Sources</Badge>
                  </div>
                  <div className="campaign-stat-number">
                    {totalUncontacted}
                    <small>fresh / {totalAudienceContacts} total</small>
                  </div>
                </div>
                <div className="campaign-stat-meta">
                  Source: Backend <code className="bg-light text-dark px-1 py-0.5 rounded">src/data/*.json</code>
                </div>
              </div>
            </Col>

            {/* Campaigns Run */}
            <Col sm="6" lg="3">
              <div className="campaign-stat-box">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="campaign-stat-label">Total Campaigns</span>
                    <Badge color="primary" className="fs-10px">{campaigns.length} Total</Badge>
                  </div>
                  <div className="campaign-stat-number">
                    {campaigns.filter((c) => ["sending", "queued"].includes(c.status)).length}
                    <small>active / {campaigns.length} total</small>
                  </div>
                </div>
                <div className="campaign-stat-meta">
                  Micro-batch throttle via Brevo
                </div>
              </div>
            </Col>

            {/* Conversions & Volume */}
            <Col sm="6" lg="3">
              <div className="campaign-stat-box">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="campaign-stat-label">Attributed ROI & Volume</span>
                    <Badge color="success" className="fs-10px">Verified</Badge>
                  </div>
                  <div className="campaign-stat-number text-success">
                    {totalConversions.signups}{" "}
                    <small className="text-muted fw-normal">users ({totalConversions.txs} trades)</small>
                  </div>
                </div>
                <div className="campaign-stat-meta fw-medium text-dark">
                  ₦{totalConversions.vol.toLocaleString()} total trade volume
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Visual Comparison Bar Chart Card */}
        {showCharts && datasetComparisonChart && audiences.length > 0 && (
          <div className="card card-bordered mb-4">
            <CardBody className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-0 fw-bold">Cross-Database Performance Comparison</h6>
                  <small className="text-soft">
                    Compare contacts, sends, opens, clicks, and conversions across your JSON datasets
                  </small>
                </div>
                <Badge color="light" className="border">
                  {audiences.length} Datasets Tracked
                </Badge>
              </div>
              <div style={{ height: "260px" }}>
                <Bar
                  data={datasetComparisonChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: { mode: "index", intersect: false },
                    },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                    },
                  }}
                />
              </div>
            </CardBody>
          </div>
        )}

        {/* Audience Databases Grid */}
        <div className="mb-4">
          <div className="campaign-section-title">
            <h5>Email Databases & Cleanup ({audiences.length})</h5>
            <span className="text-soft fs-12px">
              Backend storage: <code className="bg-light text-dark px-1.5 py-0.5 rounded">src/data/*.json</code>
            </span>
          </div>

          {loadingAudiences ? (
            <div className="text-center py-4">
              <LoadingSpinner />
            </div>
          ) : audiences.length === 0 ? (
            <div className="card card-bordered p-4 text-center bg-white rounded-3">
              <div className="campaign-empty-icon-box mx-auto">
                <Icon name="folder" />
              </div>
              <div className="campaign-empty-title">No audience databases found</div>
              <p className="campaign-empty-text">
                Place your customer audience JSON files in <code>src/data/</code> on the backend and click sync to index contacts.
              </p>
              <div>
                <button
                  type="button"
                  className="campaign-btn campaign-btn-primary"
                  onClick={() => syncSources()}
                  disabled={isSyncing}
                >
                  <Icon name="reload" className={isSyncing ? "spinner-border spinner-border-sm me-1" : "me-1"} />
                  <span>{isSyncing ? "Syncing..." : "Sync Databases Now"}</span>
                </button>
              </div>
            </div>
          ) : (
            <Row className="g-3">
              {audiences.map((aud) => (
                <Col sm="6" md="4" lg="3" key={aud._id}>
                  <div className="campaign-audience-card">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0 text-truncate fw-bold text-dark" title={aud.name}>
                          {aud.name}
                        </h6>
                        <UncontrolledDropdown>
                          <DropdownToggle tag="button" className="btn btn-icon btn-trigger btn-sm">
                            <Icon name="more-h" />
                          </DropdownToggle>
                          <DropdownMenu end style={{ zIndex: 1060 }}>
                            <DropdownItem
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Reset contact history for "${aud.name}"? Contacts will be marked uncontacted and available for new campaigns.`
                                  )
                                ) {
                                  resetAudience(aud._id);
                                }
                              }}
                            >
                              <Icon name="reload" className="me-2 text-warning" />
                              <span>Reset Contacts to Uncontacted</span>
                            </DropdownItem>
                            <DropdownItem
                              className="text-danger"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete "${aud.name}" and its indexed contacts from database? (JSON file in src/data/ remains safe)`
                                  )
                                ) {
                                  deleteAudience(aud._id);
                                }
                              }}
                            >
                              <Icon name="trash" className="me-2" />
                              <span>Delete from DB</span>
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>

                      <div className="d-flex align-items-baseline gap-2 mb-2">
                        <span className="h4 mb-0 text-primary fw-bold">
                          {aud.uncontactedCount ?? aud.activeCount}
                        </span>
                        <span className="text-soft fs-12px">fresh / {aud.totalContacts} total</span>
                      </div>

                      <div className="d-flex justify-content-between text-soft fs-11px border-top pt-2">
                        <span>Bounced: {aud.bouncedCount || 0}</span>
                        <span>Unsub: {aud.unsubscribedCount || 0}</span>
                        <Badge color="light" className="text-lowercase fs-10px border">
                          {aud.filename}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-top text-soft fs-11px d-flex justify-content-between align-items-center">
                      <span>Synced: {formatDateWithTime(aud.lastSyncedAt)}</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Campaigns List Card with Unified Filter Toolbar (Eliminating Overlap & Misplaced Z-Index) */}
        <div className="campaign-table-card">
          <div className="campaign-table-header">
            <h5 className="campaign-table-header-title">Campaigns & Attribution Performance</h5>

            <div className="campaign-table-toolbar">
              {/* Search Bar */}
              <div className="campaign-search-input-wrap">
                <Icon name="search" className="search-icon" />
                <input
                  type="text"
                  className="campaign-search-input"
                  placeholder="Filter campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="campaign-filter-tabs">
                {["all", "sending", "completed", "paused", "cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`campaign-filter-tab ${statusFilter === st ? "active" : ""}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                className="campaign-btn campaign-btn-outline"
                onClick={() => refetchCampaigns()}
              >
                <Icon name="reload" className="me-1" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Card Body: Spinner, Empty State, or Data Table */}
          {loadingCampaigns ? (
            <div className="text-center py-5">
              <LoadingSpinner />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="campaign-empty-state">
              <div className="campaign-empty-icon-box">
                <Icon name="mail" />
              </div>
              <div className="campaign-empty-title">
                {campaigns.length === 0
                  ? "No email campaigns created yet"
                  : "No campaigns matching your filter"}
              </div>
              <p className="campaign-empty-text">
                {campaigns.length === 0
                  ? "Create multi-source recipient slices, customize email copy with banners & dynamic tags, and monitor trade conversion ROI."
                  : "Try adjusting your search keyword or switching between All, Sending, or Completed tabs."}
              </p>
              {campaigns.length === 0 && (
                <button
                  type="button"
                  className="campaign-btn campaign-btn-primary"
                  onClick={openCreateModal}
                >
                  <Icon name="plus" />
                  <span>Create First Campaign</span>
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="campaign-table">
                <thead>
                  <tr>
                    <th>Campaign & Subject</th>
                    <th>Sources Sliced</th>
                    <th>Progress / Sent</th>
                    <th>Status</th>
                    <th>Brevo Metrics</th>
                    <th>Conversions</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((camp) => {
                    const total = camp.totalRecipients || 0;
                    const sent = camp.sentCount || 0;
                    const progressPct = total > 0 ? Math.round((sent / total) * 100) : 0;
                    const openPct = sent > 0 ? Math.round(((camp.openedCount || 0) / sent) * 100) : 0;
                    const clickPct = sent > 0 ? Math.round(((camp.clickedCount || 0) / sent) * 100) : 0;

                    return (
                      <tr key={camp._id}>
                        <td>
                          <div className="d-flex align-items-center gap-1 flex-wrap">
                            <span className="fw-bold text-dark">{camp.name}</span>
                            {camp.sendingAccount === "primary" ? (
                              <Badge color="light" className="border text-primary fs-10px">
                                🛡️ Primary (200/d)
                              </Badge>
                            ) : (
                              <Badge color="light" className="border text-success fs-10px">
                                🚀 Dedicated (300/d)
                              </Badge>
                            )}
                          </div>
                          <div className="text-soft fs-12px text-truncate" style={{ maxWidth: "260px" }}>
                            {camp.subject}
                          </div>
                          <div className="text-soft fs-11px mt-1">
                            Created: {formatDateWithTime(camp.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1" style={{ maxWidth: "200px" }}>
                            {camp.allocations?.map((a, i) => (
                              <Badge key={i} color="light" className="text-dark fs-11px border">
                                {a.audienceName || "Source"}: {a.requestedCount}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td style={{ minWidth: "150px" }}>
                          <div className="d-flex justify-content-between fs-12px mb-1">
                            <span className="fw-medium">{sent} / {total}</span>
                            <span className="text-soft">{progressPct}%</span>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar ${
                                camp.status === "completed" ? "bg-success" : "bg-primary"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          {camp.failedCount > 0 && (
                            <div className="text-danger fs-11px mt-1">
                              {camp.failedCount} delivery errors
                            </div>
                          )}
                        </td>
                        <td>{getStatusBadge(camp.status)}</td>
                        <td>
                          <div className="fs-12px">
                            <span className="text-success fw-medium">
                              {camp.deliveredCount || 0}
                            </span>{" "}
                            delivered
                          </div>
                          <div className="text-soft fs-11px">
                            Opens: {camp.openedCount || 0} ({openPct}%)
                          </div>
                          <div className="text-soft fs-11px">
                            Clicks: {camp.clickedCount || 0} ({clickPct}%)
                          </div>
                        </td>
                        <td>
                          <div className="fs-12px fw-medium text-primary">
                            {camp.signupsCount || 0} signups
                          </div>
                          <div className="text-soft fs-11px">
                            {camp.firstTransactionsCount || 0} trades
                          </div>
                          {(camp.totalTransactionVolume || 0) > 0 && (
                            <div className="text-success fs-11px fw-medium">
                              ₦{camp.totalTransactionVolume.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="text-end">
                          <UncontrolledDropdown>
                            <DropdownToggle tag="button" className="btn btn-icon btn-trigger">
                              <Icon name="more-h" />
                            </DropdownToggle>
                            <DropdownMenu end style={{ zIndex: 1060 }}>
                              <DropdownItem onClick={() => openEditModal(camp)}>
                                <Icon name="edit" className="me-2 text-primary" />
                                <span>Edit Content & Settings</span>
                              </DropdownItem>

                              <DropdownItem
                                onClick={() => {
                                  setSelectedCampaignForAttr(camp);
                                  setAttributionModalOpen(true);
                                }}
                              >
                                <Icon name="reports-alt" className="me-2" />
                                <span>View Attribution & ROI</span>
                              </DropdownItem>

                              {["sending", "queued"].includes(camp.status) && (
                                <DropdownItem
                                  onClick={() =>
                                    controlCampaign({ id: camp._id, action: "pause" })
                                  }
                                >
                                  <Icon name="pause" className="me-2" />
                                  <span>Pause Delivery</span>
                                </DropdownItem>
                              )}

                              {camp.status === "paused" && (
                                <DropdownItem
                                  onClick={() =>
                                    controlCampaign({ id: camp._id, action: "resume" })
                                  }
                                >
                                  <Icon name="play" className="me-2" />
                                  <span>Resume Delivery</span>
                                </DropdownItem>
                              )}

                              {["sending", "queued", "paused"].includes(camp.status) && (
                                <DropdownItem
                                  className="text-danger"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to cancel this campaign? Remaining unsent recipients will not be sent."
                                      )
                                    ) {
                                      controlCampaign({ id: camp._id, action: "cancel" });
                                    }
                                  }}
                                >
                                  <Icon name="cross-circle" className="me-2" />
                                  <span>Cancel Campaign</span>
                                </DropdownItem>
                              )}

                              {["completed", "cancelled"].includes(camp.status) && (
                                <DropdownItem
                                  className="text-danger"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Purge detailed recipient delivery logs for this campaign? (Summary stats and attribution ROI are preserved)"
                                      )
                                    ) {
                                      pruneRecipients(camp._id);
                                    }
                                  }}
                                >
                                  <Icon name="trash" className="me-2" />
                                  <span>Purge Recipient Logs</span>
                                </DropdownItem>
                              )}
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </div>

        {/* Modal: Create Campaign & Multi-Source Slicer */}
        <Modal
          isOpen={createModalOpen}
          toggle={() => setCreateModalOpen(!createModalOpen)}
          size="lg"
          backdrop="static"
        >
          <ModalHeader toggle={() => setCreateModalOpen(false)}>
            Create Campaign & Email Content
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleCreateSubmit}>
              {/* Campaign Details */}
              <div className="row g-3 mb-3">
                <Col md="6">
                  <label className="form-label fw-bold">Campaign Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Crypto & Giftcard Q4 Re-engagement"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold">Sender Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PayMint"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    required
                  />
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold d-flex align-items-center gap-1">
                    <span>Sending Account / Brevo Channel</span>
                    <Badge color={formData.sendingAccount === "dedicated" ? "success" : "primary"} className="fs-10px">
                      {formData.sendingAccount === "dedicated" ? "Dedicated (300/day)" : "Platform Shared (200/day)"}
                    </Badge>
                  </label>
                  <select
                    className="form-select"
                    value={formData.sendingAccount}
                    onChange={(e) => {
                      const acc = e.target.value;
                      setFormData({
                        ...formData,
                        sendingAccount: acc,
                        dailyLimit: acc === "primary" ? 200 : 300,
                      });
                    }}
                  >
                    <option value="dedicated">🚀 Dedicated Campaign Brevo (Account 2 - Full 300/day Isolated)</option>
                    <option value="primary">🛡️ Primary Platform Brevo (Account 1 - 200/day + Night Sweep)</option>
                  </select>
                  <small className="text-soft">
                    {formData.sendingAccount === "dedicated"
                      ? "Uses Account 2 credentials (100% reserved for campaigns, zero risk to transactional OTPs)."
                      : "Uses Primary Brevo account (200 daytime cap + 11:30 PM sweep, preserves 50 OTP reserve)."}
                  </small>
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold">Daily Throttling Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.dailyLimit}
                    min="1"
                    max="10000"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyLimit: parseInt(e.target.value, 10) || (formData.sendingAccount === "primary" ? 200 : 300),
                      })
                    }
                    required
                  />
                  <small className="text-soft">
                    {formData.sendingAccount === "dedicated" ? "Recommended limit: 300 / day" : "Recommended limit: 200 / day"}
                  </small>
                </Col>
                <Col md="12">
                  <label className="form-label fw-bold">Email Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Trade Crypto & Gift Cards on PayMint with Zero Fees"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </Col>
              </div>

              {/* Multi-Source Database Slicing Box */}
              <div className="card card-bordered p-3 mb-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">
                    <Icon name="layers" className="me-1 text-primary" />
                    Select Recipient Slices from Databases
                  </h6>
                  <Button
                    color="primary"
                    size="sm"
                    outline
                    type="button"
                    onClick={handleRunPreview}
                    disabled={isPreviewing}
                  >
                    <Icon name="eye" className="me-1" />
                    {isPreviewing ? "Calculating..." : "Preview Deduplication & Slices"}
                  </Button>
                </div>
                <p className="text-soft fs-12px mb-3">
                  Specify how many contacts to slice from each database. Uncontacted contacts are prioritized. Duplicate emails across databases and unsubscribes are automatically filtered out.
                </p>

                {audiences.map((aud) => {
                  const conf = formData.allocations[aud._id] || { count: 0, enabled: false };
                  const freshCount = aud.uncontactedCount ?? aud.activeCount ?? 0;
                  return (
                    <div
                      key={aud._id}
                      className="campaign-slice-row"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          id={`aud_${aud._id}`}
                          checked={conf.enabled}
                          onChange={() => handleToggleAudience(aud._id)}
                        />
                        <label
                          htmlFor={`aud_${aud._id}`}
                          className="form-check-label fw-bold mb-0 cursor-pointer"
                        >
                          {aud.name}{" "}
                          <span className="text-soft fw-normal fs-12px">({aud.filename})</span>
                        </label>
                        <Badge color="light" className="text-success border ms-2">
                          Fresh / Uncontacted: {freshCount}
                        </Badge>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-12px text-soft">Slice Count:</span>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          style={{ width: "90px" }}
                          min="1"
                          max={aud.totalContacts || 100000}
                          value={conf.count}
                          disabled={!conf.enabled}
                          onChange={(e) => handleCountChange(aud._id, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Dry Run Preview Breakdown */}
                {previewResult && (
                  <div className="mt-3 p-3 bg-white rounded border border-info">
                    <h6 className="text-info fs-13px mb-2">
                      <Icon name="check-circle" className="me-1" />
                      Allocation & Deduplication Dry-Run Summary
                    </h6>
                    <div className="row g-2 text-center">
                      <div className="col-3">
                        <div className="fs-11px text-soft">Total Requested</div>
                        <div className="fw-bold fs-14px">{previewResult.totalRequested}</div>
                      </div>
                      <div className="col-3">
                        <div className="fs-11px text-warning">Cross-List Overlaps</div>
                        <div className="fw-bold fs-14px text-warning">
                          -{previewResult.overlapsResolved ?? previewResult.duplicatesExcluded ?? 0}
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="fs-11px text-danger">Suppressed / Bounced</div>
                        <div className="fw-bold fs-14px text-danger">
                          -{previewResult.suppressedSkipped ?? previewResult.suppressedExcluded ?? 0}
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="fs-11px text-success">Net Unique Recipients</div>
                        <div className="fw-bold fs-14px text-success">
                          {previewResult.totalUniqueAllocated ?? previewResult.finalUniqueRecipients}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Content Section with Banners & Live Preview */}
              <div className="card card-bordered p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">
                    <Icon name="mail" className="me-1 text-primary" />
                    Email Message Content & Banners
                  </h6>
                  {/* Template Quick Select */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="fs-11px text-soft">Template:</span>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                      onChange={(e) => {
                        const tpl = EMAIL_TEMPLATES[e.target.value];
                        if (tpl) {
                          setFormData({ ...formData, htmlContent: tpl });
                        }
                      }}
                      defaultValue="brandShowcase"
                    >
                      <option value="brandShowcase">Brand Template (Header + Logo + Footer)</option>
                      <option value="executiveLetter">Executive Announcement Letter</option>
                      <option value="quickPromo">Quick Trade / Rates Promo</option>
                    </select>
                  </div>
                </div>

                {/* Banner Status Chips */}
                <div className="d-flex flex-wrap gap-2 align-items-center p-2 mb-2 bg-light rounded fs-12px">
                  <span className="fw-bold text-dark">Active Banners:</span>
                  <Badge color={banners?.logoUrl ? "success" : "light"} className="border">
                    {banners?.logoUrl ? "✓ Logo Set" : "Logo Not Configured"}
                  </Badge>
                  <Badge color={banners?.headerBannerUrl ? "success" : "light"} className="border">
                    {banners?.headerBannerUrl ? "✓ Header Banner Set" : "Header Banner Not Set"}
                  </Badge>
                  <Badge color={banners?.footerBannerUrl ? "success" : "light"} className="border">
                    {banners?.footerBannerUrl ? "✓ Footer Banner Set" : "Footer Banner Not Set"}
                  </Badge>
                </div>

                {/* Tag insertion chips */}
                <div className="mb-2">
                  <div className="fs-11px text-soft mb-1">Click a tag to insert into your email copy:</div>
                  <div className="d-flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{logo}}")}
                      title="Inserts PayMint Logo Image"
                    >
                      + {"{{logo}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{headerBanner}}")}
                      title="Inserts Header Banner Image"
                    >
                      + {"{{headerBanner}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{footerBanner}}")}
                      title="Inserts Footer Banner Image"
                    >
                      + {"{{footerBanner}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{firstName}}")}
                    >
                      + {"{{firstName}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{lastName}}")}
                    >
                      + {"{{lastName}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{email}}")}
                    >
                      + {"{{email}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{website}}")}
                    >
                      + {"{{website}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{playStore}}")}
                    >
                      + {"{{playStore}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{appStore}}")}
                    >
                      + {"{{appStore}}"}
                    </button>
                  </div>
                </div>

                {/* Editor vs Live Preview Tabs */}
                <Nav tabs className="mb-2">
                  <NavItem>
                    <NavLink
                      className={editorTab === "edit" ? "active" : ""}
                      onClick={() => setEditorTab("edit")}
                      style={{ cursor: "pointer", padding: "6px 14px", fontSize: "13px" }}
                    >
                      <Icon name="code" className="me-1" />
                      Edit HTML / Content
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={editorTab === "preview" ? "active" : ""}
                      onClick={() => setEditorTab("preview")}
                      style={{ cursor: "pointer", padding: "6px 14px", fontSize: "13px" }}
                    >
                      <Icon name="eye" className="me-1" />
                      Live Email Preview
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={editorTab}>
                  <TabPane tabId="edit">
                    <textarea
                      className="form-control"
                      rows="9"
                      style={{ fontFamily: "monospace", fontSize: "13px" }}
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                      required
                    />
                  </TabPane>
                  <TabPane tabId="preview">
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "24px",
                        maxHeight: "380px",
                        overflowY: "auto",
                      }}
                    >
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "30px",
                          maxWidth: "600px",
                          margin: "0 auto",
                          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: renderPreviewHtml(formData.htmlContent),
                        }}
                      />
                    </div>
                  </TabPane>
                </TabContent>

                <small className="text-soft mt-2 d-block fs-11px">
                  A compliant 1-click unsubscribe footer and conversion tracking tags (
                  <code>pm_cid</code>, <code>pm_src</code>) are automatically attached to all links.
                </small>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button color="light" type="button" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" disabled={isCreating}>
                  {isCreating ? "Queueing Campaign..." : "Launch & Queue Campaign"}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>

        {/* Modal: Edit Existing Campaign */}
        <Modal
          isOpen={editModalOpen}
          toggle={() => setEditModalOpen(!editModalOpen)}
          size="lg"
          backdrop="static"
        >
          <ModalHeader toggle={() => setEditModalOpen(false)}>
            Edit Campaign Content & Settings
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <div className="row g-3 mb-3">
                <Col md="6">
                  <label className="form-label fw-bold">Campaign Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold">Sender Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.senderName}
                    onChange={(e) => setEditFormData({ ...editFormData, senderName: e.target.value })}
                    required
                  />
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold d-flex align-items-center gap-1">
                    <span>Sending Account / Brevo Channel</span>
                    <Badge color={editFormData.sendingAccount === "dedicated" ? "success" : "primary"} className="fs-10px">
                      {editFormData.sendingAccount === "dedicated" ? "Dedicated (300/day)" : "Platform Shared (200/day)"}
                    </Badge>
                  </label>
                  <select
                    className="form-select"
                    value={editFormData.sendingAccount}
                    onChange={(e) => {
                      const acc = e.target.value;
                      setEditFormData({
                        ...editFormData,
                        sendingAccount: acc,
                        dailyLimit: acc === "primary" ? 200 : 300,
                      });
                    }}
                  >
                    <option value="dedicated">🚀 Dedicated Campaign Brevo (Account 2 - Full 300/day Isolated)</option>
                    <option value="primary">🛡️ Primary Platform Brevo (Account 1 - 200/day + Night Sweep)</option>
                  </select>
                  <small className="text-soft">
                    {editFormData.sendingAccount === "dedicated"
                      ? "Uses Account 2 credentials (100% reserved for campaigns, zero risk to transactional OTPs)."
                      : "Uses Primary Brevo account (200 daytime cap + 11:30 PM sweep, preserves 50 OTP reserve)."}
                  </small>
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold">Daily Throttling Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editFormData.dailyLimit}
                    min="1"
                    max="10000"
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        dailyLimit: parseInt(e.target.value, 10) || (editFormData.sendingAccount === "primary" ? 200 : 300),
                      })
                    }
                    required
                  />
                  <small className="text-soft">
                    {editFormData.sendingAccount === "dedicated" ? "Recommended: 300 / day" : "Recommended: 200 / day"}
                  </small>
                </Col>
                <Col md="12">
                  <label className="form-label fw-bold">Email Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.subject}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    required
                  />
                </Col>
              </div>

              <div className="border-top pt-3 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="title mb-0 fs-14px">
                    Email Message Content & Banners
                  </h6>
                  {/* Template Quick Select */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="fs-11px text-soft">Template:</span>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                      onChange={(e) => {
                        const tpl = EMAIL_TEMPLATES[e.target.value];
                        if (tpl) {
                          setEditFormData({ ...editFormData, htmlContent: tpl });
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Apply Template Preset...</option>
                      <option value="brandShowcase">Brand Template (Header + Logo + Footer)</option>
                      <option value="executiveLetter">Executive Announcement Letter</option>
                      <option value="quickPromo">Quick Trade / Rates Promo</option>
                    </select>
                  </div>
                </div>

                {/* Banner Status Chips */}
                <div className="d-flex flex-wrap gap-2 align-items-center p-2 mb-2 bg-light rounded fs-12px">
                  <span className="fw-bold text-dark">Active Banners:</span>
                  <Badge color={banners?.logoUrl ? "success" : "light"} className="border">
                    {banners?.logoUrl ? "✓ Logo Set" : "Logo Not Configured"}
                  </Badge>
                  <Badge color={banners?.headerBannerUrl ? "success" : "light"} className="border">
                    {banners?.headerBannerUrl ? "✓ Header Banner Set" : "Header Banner Not Set"}
                  </Badge>
                  <Badge color={banners?.footerBannerUrl ? "success" : "light"} className="border">
                    {banners?.footerBannerUrl ? "✓ Footer Banner Set" : "Footer Banner Not Set"}
                  </Badge>
                </div>
              </div>

              {/* Tag insertion chips */}
              <div className="mb-2">
                <div className="fs-11px text-soft mb-1">Click a tag to insert into your email copy:</div>
                <div className="d-flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{logo}}")}
                  >
                    + {"{{logo}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{headerBanner}}")}
                  >
                    + {"{{headerBanner}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{footerBanner}}")}
                  >
                    + {"{{footerBanner}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{firstName}}")}
                  >
                    + {"{{firstName}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{lastName}}")}
                  >
                    + {"{{lastName}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{email}}")}
                  >
                    + {"{{email}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{website}}")}
                  >
                    + {"{{website}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{playStore}}")}
                  >
                    + {"{{playStore}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{appStore}}")}
                  >
                    + {"{{appStore}}"}
                  </button>
                </div>
              </div>

              {/* Edit Tabs */}
              <Nav tabs className="mb-2">
                <NavItem>
                  <NavLink
                    className={editEditorTab === "edit" ? "active" : ""}
                    onClick={() => setEditEditorTab("edit")}
                    style={{ cursor: "pointer", padding: "6px 14px", fontSize: "13px" }}
                  >
                    <Icon name="code" className="me-1" />
                    Edit HTML / Content
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={editEditorTab === "preview" ? "active" : ""}
                    onClick={() => setEditEditorTab("preview")}
                    style={{ cursor: "pointer", padding: "6px 14px", fontSize: "13px" }}
                  >
                    <Icon name="eye" className="me-1" />
                    Live Email Preview
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={editEditorTab}>
                <TabPane tabId="edit">
                  <textarea
                    className="form-control"
                    rows="9"
                    style={{ fontFamily: "monospace", fontSize: "13px" }}
                    value={editFormData.htmlContent}
                    onChange={(e) => setEditFormData({ ...editFormData, htmlContent: e.target.value })}
                    required
                  />
                </TabPane>
                <TabPane tabId="preview">
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "24px",
                      maxHeight: "380px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "30px",
                        maxWidth: "600px",
                        margin: "0 auto",
                        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: renderPreviewHtml(editFormData.htmlContent),
                      }}
                    />
                  </div>
                </TabPane>
              </TabContent>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button color="light" type="button" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>

        {/* Modal: Source Attribution & ROI Analytics */}
        <Modal
          isOpen={attributionModalOpen}
          toggle={() => setAttributionModalOpen(!attributionModalOpen)}
          size="lg"
        >
          <ModalHeader toggle={() => setAttributionModalOpen(false)}>
            Attribution & ROI Breakdown: {selectedCampaignForAttr?.name}
          </ModalHeader>
          <ModalBody>
            {selectedCampaignForAttr && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                  <div>
                    <div className="text-soft fs-12px">Total Sent</div>
                    <div className="h5 mb-0">{selectedCampaignForAttr.sentCount || 0}</div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Delivered</div>
                    <div className="h5 mb-0 text-success">
                      {selectedCampaignForAttr.deliveredCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Unique Opens</div>
                    <div className="h5 mb-0 text-primary">
                      {selectedCampaignForAttr.openedCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Unique Clicks</div>
                    <div className="h5 mb-0 text-info">
                      {selectedCampaignForAttr.clickedCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Signups</div>
                    <div className="h5 mb-0 text-dark">
                      {selectedCampaignForAttr.signupsCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Transactions</div>
                    <div className="h5 mb-0 text-success">
                      {selectedCampaignForAttr.firstTransactionsCount || 0}
                    </div>
                  </div>
                </div>

                <h6 className="mb-2">Comparative Performance by Database Source</h6>
                <Table responsive className="table-bordered fs-12px mb-3">
                  <thead className="table-light">
                    <tr>
                      <th>Source Database</th>
                      <th>Sent</th>
                      <th>Delivered</th>
                      <th>Opens</th>
                      <th>Clicks</th>
                      <th>Signups</th>
                      <th>1st Trades</th>
                      <th>Volume (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCampaignForAttr.perSourceMetrics &&
                    selectedCampaignForAttr.perSourceMetrics.length > 0 ? (
                      selectedCampaignForAttr.perSourceMetrics.map((sm, i) => (
                        <tr key={i}>
                          <td className="fw-bold">{sm.sourceName}</td>
                          <td>{sm.sentCount || 0}</td>
                          <td>{sm.deliveredCount || 0}</td>
                          <td>{sm.openedCount || 0}</td>
                          <td>{sm.clickedCount || 0}</td>
                          <td className="text-primary fw-medium">{sm.signupsCount || 0}</td>
                          <td className="text-success fw-medium">
                            {sm.firstTransactionsCount || 0}
                          </td>
                          <td className="fw-bold">
                            ₦{(sm.totalTransactionVolume || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-soft py-3">
                          No per-source metrics recorded yet. Metrics update in real-time as Brevo
                          webhooks and conversions arrive.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <div className="alert alert-light border fs-12px text-soft mb-0">
                  <Icon name="info" className="me-1 text-primary" />
                  <strong>How Attribution Works:</strong> Links in outgoing emails include signed tracking parameters (<code>pm_cid</code>, <code>pm_src</code>, <code>pm_rid</code>). When a recipient clicks through and signs up on PayMint or completes their first crypto/giftcard trade, the attribution bridge links the transaction volume directly to their original source JSON database.
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="light" size="sm" onClick={() => setAttributionModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </Content>
    </>
  );
};

export default CampaignsPage;
