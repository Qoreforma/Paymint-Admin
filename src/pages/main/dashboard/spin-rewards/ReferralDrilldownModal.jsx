import React, { useState, useMemo } from "react";
import { Modal, ModalBody, Spinner, Row, Col } from "reactstrap";
import { useGetCampaignReferralsDrilldown } from "../../../../api/spinRewards";
import { Button, Icon, UserAvatar } from "../../../../components/Component";
import { formatDateWithHyphen, findUpper } from "../../../../utils/Utils";

const ReferralDrilldownModal = ({ isOpen, toggle, tierId, initialFilter = "all" }) => {
  const { data, isLoading } = useGetCampaignReferralsDrilldown(tierId);

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("highest");
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Toggle single referrer expansion
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all / Collapse all
  const toggleExpandAll = (allIds) => {
    if (expandedIds.size === allIds.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(allIds));
    }
  };

  const tier = data?.tier;
  const referrers = data?.referrers || [];
  const threshold = tier?.referralThreshold || 5;

  // Filter & Search logic
  const filteredReferrers = useMemo(() => {
    let result = [...referrers];

    // Filter by type
    if (activeFilter === "needsClose") {
      result = result.filter(
        (r) => !r.isMaxReached && r.neededForNextSpin > 0 && r.neededForNextSpin <= 2
      );
    } else if (activeFilter === "unlocked") {
      result = result.filter((r) => r.spinsEarned > 0 || r.isMaxReached);
    } else if (activeFilter === "inProgress") {
      result = result.filter(
        (r) => !r.isMaxReached && r.spinsEarned === 0 && r.totalReferrals > 0
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((r) => {
        const refObj = r.referrer || {};
        const name = `${refObj.firstname || ""} ${refObj.lastname || ""}`.toLowerCase();
        const email = (refObj.email || "").toLowerCase();
        const phone = (refObj.phone || "").toLowerCase();
        const username = (refObj.username || "").toLowerCase();

        // Check referrer
        if (name.includes(term) || email.includes(term) || phone.includes(term) || username.includes(term)) {
          return true;
        }

        // Check any of their invited referees
        return (r.referrals || []).some((item) => {
          const referee = item.referee || {};
          const refereeName = `${referee.firstname || ""} ${referee.lastname || ""}`.toLowerCase();
          const refereeEmail = (referee.email || "").toLowerCase();
          return refereeName.includes(term) || refereeEmail.includes(term);
        });
      });
    }

    // Sorting
    if (sortBy === "highest") {
      result.sort((a, b) => b.totalReferrals - a.totalReferrals);
    } else if (sortBy === "lowest") {
      result.sort((a, b) => a.totalReferrals - b.totalReferrals);
    } else if (sortBy === "closest") {
      // Prioritize who needs fewest referrals to next spin
      result.sort((a, b) => {
        if (a.isMaxReached && !b.isMaxReached) return 1;
        if (!a.isMaxReached && b.isMaxReached) return -1;
        return a.neededForNextSpin - b.neededForNextSpin || b.totalReferrals - a.totalReferrals;
      });
    } else if (sortBy === "mostSpins") {
      result.sort((a, b) => b.spinsEarned - a.spinsEarned || b.totalReferrals - a.totalReferrals);
    }

    return result;
  }, [referrers, activeFilter, searchTerm, sortBy]);

  // Aggregate stats
  const totalReferralsCount = tier?.totalCampaignReferrals ?? referrers.reduce((acc, curr) => acc + curr.totalReferrals, 0);
  const totalReferrersCount = referrers.length;
  const needsCloseCount = referrers.filter(
    (r) => !r.isMaxReached && r.neededForNextSpin > 0 && r.neededForNextSpin <= 2
  ).length;
  const unlockedCount = referrers.filter((r) => r.spinsEarned > 0 || r.isMaxReached).length;
  const inProgressCount = referrers.filter(
    (r) => !r.isMaxReached && r.spinsEarned === 0 && r.totalReferrals > 0
  ).length;

  const allFilteredIds = filteredReferrers.map((r) => r.referrer?._id || r.referrer?.id);

  const repeatModeLabel =
    tier?.repeatMode === "one-time"
      ? "One-Time (1 Spin Max)"
      : tier?.repeatMode === "max-N"
      ? `Max ${tier?.maxRepeatCount || 1} Spins`
      : "Repeatable";

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className="modal-dialog-centered spin-drilldown-modal"
      size="xl"
      style={{ maxWidth: "1050px" }}
    >
      <ModalBody className="p-0">
        {/* Header */}
        <div className="p-4 border-bottom bg-white d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <span className="badge bg-success-dim text-success px-2 py-1 fs-11px fw-bold">
                <Icon name="users" className="me-1" />
                CAMPAIGN DRILLDOWN
              </span>
              <h5 className="mb-0 fw-bold text-dark">
                {tier?.name || "Campaign"} Referral Network
              </h5>
              <span className="badge bg-light text-dark border fs-11px">
                Threshold: {threshold} referrals / spin
              </span>
              <span className="badge bg-white text-dark border fs-11px">
                Repeat Mode: <strong className="text-primary ms-1">{repeatModeLabel}</strong>
              </span>
              {tier?.perUserCap && (
                <span className="badge bg-light text-muted border fs-11px">
                  Per-User Cap: {tier.perUserCap} spins
                </span>
              )}
            </div>
            <p className="text-muted fs-12px mb-0">
              Inspect all referrers, their invited referees, and exact distance to next spin unlock.
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={toggle}
          />
        </div>

        {/* Modal Content */}
        <div className="p-4 bg-lighter">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="text-muted mt-2 fs-13px">Loading campaign referral drilldown...</p>
            </div>
          ) : (
            <>
              {/* Summary Stats Row */}
              <Row className="g-2 mb-4">
                <Col xs="6" sm="3">
                  <div className="bg-white p-3 rounded border text-center shadow-xs">
                    <span className="text-muted fs-11px text-uppercase fw-bold d-block">
                      Campaign Referrals
                    </span>
                    <h4 className="text-primary fw-bold my-1">
                      {totalReferralsCount.toLocaleString()}
                    </h4>
                    <span className="text-muted fs-11px">Referees invited</span>
                  </div>
                </Col>
                <Col xs="6" sm="3">
                  <div className="bg-white p-3 rounded border text-center shadow-xs">
                    <span className="text-muted fs-11px text-uppercase fw-bold d-block">
                      Active Referrers
                    </span>
                    <h4 className="text-info fw-bold my-1">
                      {totalReferrersCount.toLocaleString()}
                    </h4>
                    <span className="text-muted fs-11px">Users referring friends</span>
                  </div>
                </Col>
                <Col xs="6" sm="3">
                  <div
                    className={`bg-white p-3 rounded border text-center shadow-xs ${
                      activeFilter === "needsClose" ? "border-warning bg-warning-dim" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setActiveFilter(activeFilter === "needsClose" ? "all" : "needsClose")
                    }
                  >
                    <span className="text-muted fs-11px text-uppercase fw-bold d-block">
                      Needs 1–2 More 🎯
                    </span>
                    <h4 className="text-warning fw-bold my-1">
                      {needsCloseCount.toLocaleString()}
                    </h4>
                    <span className="text-muted fs-11px">Close to spin milestone</span>
                  </div>
                </Col>
                <Col xs="6" sm="3">
                  <div
                    className={`bg-white p-3 rounded border text-center shadow-xs ${
                      activeFilter === "unlocked" ? "border-success bg-success-dim" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setActiveFilter(activeFilter === "unlocked" ? "all" : "unlocked")
                    }
                  >
                    <span className="text-muted fs-11px text-uppercase fw-bold d-block">
                      Spins Unlocked / Completed 🏆
                    </span>
                    <h4 className="text-success fw-bold my-1">
                      {unlockedCount.toLocaleString()}
                    </h4>
                    <span className="text-muted fs-11px">Milestone achieved</span>
                  </div>
                </Col>
              </Row>

              {/* Controls Bar: Search, Filters, and Sort */}
              <div className="bg-white p-3 rounded border shadow-xs mb-3">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  {/* Filter Pills */}
                  <div className="d-flex flex-wrap align-items-center gap-1">
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        activeFilter === "all" ? "btn-primary" : "btn-light btn-dim"
                      }`}
                      onClick={() => setActiveFilter("all")}
                    >
                      All ({totalReferrersCount})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        activeFilter === "needsClose" ? "btn-warning" : "btn-light btn-dim"
                      }`}
                      onClick={() => setActiveFilter("needsClose")}
                    >
                      🎯 Needs 1–2 More ({needsCloseCount})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        activeFilter === "unlocked" ? "btn-success" : "btn-light btn-dim"
                      }`}
                      onClick={() => setActiveFilter("unlocked")}
                    >
                      🏆 Unlocked / Completed ({unlockedCount})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        activeFilter === "inProgress" ? "btn-secondary" : "btn-light btn-dim"
                      }`}
                      onClick={() => setActiveFilter("inProgress")}
                    >
                      ⏳ In Progress ({inProgressCount})
                    </button>
                  </div>

                  {/* Search and Sort */}
                  <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1 justify-content-sm-end">
                    <div className="form-control-wrap" style={{ minWidth: "220px", maxWidth: "300px" }}>
                      <div className="form-icon form-icon-left">
                        <Icon name="search" />
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search referrer or referee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      <span className="text-muted fs-12px text-nowrap">Sort:</span>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "auto" }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="highest">Highest Referrals</option>
                        <option value="closest">Closest to Next Spin 🎯</option>
                        <option value="mostSpins">Most Spins Unlocked 🏆</option>
                        <option value="lowest">Lowest Referrals</option>
                      </select>
                    </div>

                    {filteredReferrers.length > 0 && (
                      <Button
                        color="light"
                        size="sm"
                        className="btn-dim"
                        onClick={() => toggleExpandAll(allFilteredIds)}
                      >
                        <Icon
                          name={
                            expandedIds.size === filteredReferrers.length
                              ? "collapse"
                              : "expand"
                          }
                          className="me-1"
                        />
                        {expandedIds.size === filteredReferrers.length
                          ? "Collapse All"
                          : "Expand All"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Referrers List */}
              <div
                style={{
                  maxHeight: "56vh",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {filteredReferrers.length === 0 ? (
                  <div className="bg-white p-5 rounded border text-center text-muted">
                    <Icon name="user-cross" className="fs-1 text-light mb-2 d-block" />
                    <h6>No matching referrers found</h6>
                    <p className="fs-12px mb-2">
                      {searchTerm
                        ? `No referrers or referees match "${searchTerm}".`
                        : "No referrers fit the selected filter."}
                    </p>
                    {(searchTerm || activeFilter !== "all") && (
                      <Button
                        color="primary"
                        size="sm"
                        outline
                        onClick={() => {
                          setSearchTerm("");
                          setActiveFilter("all");
                        }}
                      >
                        Reset Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredReferrers.map((item) => {
                    const refUser = item.referrer || {};
                    const refId = refUser._id || refUser.id;
                    const isExpanded = expandedIds.has(refId);
                    const fullName = `${refUser.firstname || ""} ${refUser.lastname || ""}`.trim() || "Anonymous User";
                    const isCompleted = item.isMaxReached;
                    const progressPercent = isCompleted
                      ? 100
                      : Math.min(100, Math.round((item.currentProgress / threshold) * 100));

                    return (
                      <div
                        key={refId}
                        className="spin-referrer-card p-3 mb-2 shadow-xs bg-white"
                      >
                        {/* Top Referrer Summary Row */}
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                          {/* Referrer Identity */}
                          <div className="d-flex align-items-center gap-2">
                            <UserAvatar
                              theme="primary"
                              size="md"
                              text={findUpper(fullName)}
                              image={refUser.avatar || null}
                            />
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0 fw-bold fs-14px text-dark">
                                  {fullName}
                                </h6>
                                {refUser.username && (
                                  <span className="text-muted fs-11px">
                                    @{refUser.username}
                                  </span>
                                )}
                              </div>
                              <div className="text-muted fs-12px d-flex flex-wrap align-items-center gap-2">
                                <span>{refUser.email || "No email"}</span>
                                {refUser.phone && (
                                  <>
                                    <span>•</span>
                                    <span>{refUser.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progress & Milestone Badges */}
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className="badge bg-primary-dim text-primary fw-bold fs-12px px-2 py-1">
                              <Icon name="users" className="me-1" />
                              {item.totalReferrals} Referral{item.totalReferrals !== 1 ? "s" : ""}
                            </span>

                            <span className="badge bg-success-dim text-success fw-bold fs-12px px-2 py-1">
                              <Icon name="award" className="me-1" />
                              {item.spinsEarned} Spin{item.spinsEarned !== 1 ? "s" : ""} Earned
                            </span>

                            {isCompleted ? (
                              <span className="badge bg-success text-white fw-bold fs-12px px-2 py-1 shadow-xs">
                                <Icon name="check-circle" className="me-1" />
                                {tier?.repeatMode === "one-time"
                                  ? "Milestone Completed (1/1 Max Spin Awarded) 🏆"
                                  : `Tier Limit Reached (${item.spinsEarned}/${item.maxAllowedSpins} Spins) 🏆`}
                              </span>
                            ) : item.neededForNextSpin > 0 ? (
                              <span className="badge bg-warning text-dark fw-bold fs-12px px-2 py-1 shadow-xs">
                                <Icon name="target" className="me-1" />
                                Needs <strong>{item.neededForNextSpin}</strong> more for next spin!
                              </span>
                            ) : item.totalReferrals > 0 ? (
                              <span className="badge bg-success text-white fw-bold fs-12px px-2 py-1 shadow-xs">
                                <Icon name="check-circle" className="me-1" />
                                Milestone Ready! 🎉
                              </span>
                            ) : null}

                            <Button
                              color="light"
                              size="xs"
                              className="btn-dim"
                              onClick={() => toggleExpand(refId)}
                            >
                              <Icon
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                className="me-1"
                              />
                              {isExpanded
                                ? "Hide Referees"
                                : `View Referees (${item.referrals?.length || 0})`}
                            </Button>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="mt-2 pt-1">
                          <div className="d-flex justify-content-between align-items-center fs-11px text-muted mb-1">
                            <span>
                              {isCompleted ? (
                                <strong className="text-success">
                                  Goal Achieved: {item.totalReferrals} referrals recorded • Maximum {item.maxAllowedSpins || 1} spin awarded
                                </strong>
                              ) : tier?.repeatMode === "one-time" ? (
                                <>
                                  Progress: <strong>{item.currentProgress}</strong> of{" "}
                                  <strong>{threshold}</strong> referrals
                                </>
                              ) : (
                                <>
                                  Cycle Progress: <strong>{item.currentProgress}</strong> of{" "}
                                  <strong>{threshold}</strong> referrals
                                </>
                              )}
                            </span>
                            <span>
                              {isCompleted
                                ? "Tier milestone complete"
                                : item.neededForNextSpin > 0
                                ? `${item.neededForNextSpin} remaining until spin reward`
                                : "Spin milestone reached"}
                            </span>
                          </div>
                          <div className="spin-progress-container">
                            <div
                              className={`spin-progress-bar ${
                                isCompleted || progressPercent === 100 || item.currentProgress === 0
                                  ? "bg-success"
                                  : progressPercent >= 60
                                  ? "bg-primary"
                                  : "bg-warning"
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Expanded Referees Table */}
                        {isExpanded && (
                          <div className="mt-3 pt-2 border-top">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="fs-12px fw-bold text-dark">
                                Invited Referees During Campaign ({item.referrals?.length || 0})
                              </span>
                              <span className="fs-11px text-muted">
                                Sorted by registration date
                              </span>
                            </div>

                            {item.referrals && item.referrals.length > 0 ? (
                              <div className="table-responsive rounded border bg-lighter">
                                <table className="table table-sm table-tranx mb-0">
                                  <thead className="table-light">
                                    <tr className="tb-tnx-head fs-11px">
                                      <th>Referee</th>
                                      <th>Contact</th>
                                      <th>Joined Date</th>
                                      <th>Verification Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.referrals.map((rEntry, idx) => {
                                      const referee = rEntry.referee || {};
                                      const refereeName = `${referee.firstname || ""} ${referee.lastname || ""}`.trim() || "Anonymous";
                                      return (
                                        <tr key={idx} className="tb-tnx-item fs-12px">
                                          <td>
                                            <div className="d-flex align-items-center gap-2">
                                              <UserAvatar
                                                theme="primary-dim"
                                                size="sm"
                                                text={findUpper(refereeName)}
                                                image={referee.avatar || null}
                                              />
                                              <div>
                                                <span className="fw-bold d-block text-dark">
                                                  {refereeName}
                                                </span>
                                                {referee.username && (
                                                  <span className="text-muted fs-11px">
                                                    @{referee.username}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </td>
                                          <td>
                                            <div>
                                              <span className="d-block">{referee.email || "—"}</span>
                                              <span className="text-muted fs-11px">
                                                {referee.phone || ""}
                                              </span>
                                            </div>
                                          </td>
                                          <td>
                                            <span className="text-muted">
                                              {rEntry.createdAt
                                                ? formatDateWithHyphen(rEntry.createdAt)
                                                : "—"}
                                            </span>
                                          </td>
                                          <td>
                                            {referee.isFlaggedFraud ? (
                                              <span className="badge bg-danger-dim text-danger fs-11px">
                                                <Icon name="alert-circle" className="me-1" />
                                                {referee.flagReason || "Disqualified"}
                                              </span>
                                            ) : (
                                              <span
                                                className={`badge ${
                                                  referee.status === "active"
                                                    ? "bg-success-dim text-success"
                                                    : "bg-light text-muted border"
                                                } fs-11px`}
                                              >
                                                {referee.status || "Active"}
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-2 text-center text-muted fs-12px">
                                No referee records attached.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-top bg-white d-flex align-items-center justify-content-between">
          <span className="text-muted fs-12px">
            Showing <strong>{filteredReferrers.length}</strong> of{" "}
            <strong>{totalReferrersCount}</strong> active referrers
          </span>
          <Button color="primary" onClick={toggle}>
            Close Drilldown
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ReferralDrilldownModal;
