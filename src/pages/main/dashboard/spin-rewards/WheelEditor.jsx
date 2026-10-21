import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalBody } from "reactstrap";
import {
  Button,
  Col,
  Icon,
  Row,
} from "../../../../components/Component";
import {
  useGetWheelConfigByTier,
  useCreateWheelConfig,
  useEditWheelConfig,
} from "../../../../api/spinRewards";
import { formatter } from "../../../../utils/Utils";

const REWARD_TYPE_OPTIONS = [
  { value: "balance", label: "Wallet Balance (₦)" },
  { value: "airtime", label: "Airtime Top-up (₦)" },
];

const DEFAULT_COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#3B82F6", // Blue
];

const DEFAULT_SEGMENT = {
  label: "",
  rewardType: "balance",
  rewardValue: 100,
  displayColor: "#6366F1",
  ticketCount: 1,
};

const WheelEditor = ({ isOpen, toggle, tier, rules = [] }) => {
  const { data: wheelData, isLoading } = useGetWheelConfigByTier(tier?._id);
  const { mutate: createWheel, isLoading: isCreating } = useCreateWheelConfig();
  const { mutate: editWheel, isLoading: isEditing } = useEditWheelConfig();

  const [poolSize, setPoolSize] = useState(20);
  const [airtimeRecipientMode, setAirtimeRecipientMode] = useState("user-choice");
  const [autoRegeneratePool, setAutoRegeneratePool] = useState(true);
  const [segments, setSegments] = useState([
    { label: "₦100 Cash", rewardType: "balance", rewardValue: 100, displayColor: "#6366F1", ticketCount: 10 },
    { label: "₦200 Airtime", rewardType: "airtime", rewardValue: 200, displayColor: "#10B981", ticketCount: 5 },
    { label: "₦500 Cash", rewardType: "balance", rewardValue: 500, displayColor: "#F59E0B", ticketCount: 4 },
    { label: "₦1,000 Jackpot", rewardType: "balance", rewardValue: 1000, displayColor: "#EF4444", ticketCount: 1 },
  ]);

  const isExisting = !!wheelData?.data?._id;
  const loadedTierIdRef = useRef(null);

  // Initialize once per modal session to prevent background query refetches from overwriting user edits
  useEffect(() => {
    if (!isOpen) {
      loadedTierIdRef.current = null;
      return;
    }

    if (wheelData?.data && loadedTierIdRef.current !== tier?._id) {
      loadedTierIdRef.current = tier?._id;
      const data = wheelData.data;
      setPoolSize(data.poolSize || 20);
      setAirtimeRecipientMode(data.airtimeRecipientMode || "user-choice");
      setAutoRegeneratePool(data.autoRegeneratePool ?? tier?.autoRegeneratePool ?? true);
      if (data.segments && data.segments.length > 0) {
        setSegments(
          data.segments.map((seg) => ({
            label: seg.label,
            rewardType: seg.rewardType,
            rewardValue: seg.rewardValue,
            displayColor: seg.displayColor,
            ticketCount: seg.ticketCount,
          }))
        );
      }
    } else if (!isLoading && !wheelData?.data && loadedTierIdRef.current !== tier?._id) {
      loadedTierIdRef.current = tier?._id;
      setPoolSize(20);
      setAirtimeRecipientMode("user-choice");
      setAutoRegeneratePool(tier?.autoRegeneratePool ?? true);
      setSegments([
        { label: "₦100 Cash", rewardType: "balance", rewardValue: 100, displayColor: "#6366F1", ticketCount: 10 },
        { label: "₦200 Airtime", rewardType: "airtime", rewardValue: 200, displayColor: "#10B981", ticketCount: 5 },
        { label: "₦500 Cash", rewardType: "balance", rewardValue: 500, displayColor: "#F59E0B", ticketCount: 4 },
        { label: "₦1,000 Jackpot", rewardType: "balance", rewardValue: 1000, displayColor: "#EF4444", ticketCount: 1 },
      ]);
    }
  }, [isOpen, tier?._id, wheelData, isLoading]);

  // Handle typing inside poolSize gracefully
  const handlePoolSizeChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setPoolSize("");
    } else {
      const num = parseInt(val, 10);
      setPoolSize(isNaN(num) ? "" : Math.max(1, num));
    }
  };

  const handlePoolSizeBlur = () => {
    if (!poolSize || Number(poolSize) < 1) {
      setPoolSize(20);
    } else {
      setPoolSize(Number(poolSize));
    }
  };

  // Proportional auto-scale tickets (Hare-Niemeyer / Largest Remainder method)
  const handleAutoScaleTickets = (targetSize = poolSize) => {
    const target = Math.max(1, Number(targetSize) || 1);
    if (!segments.length) return;

    const currentTotal = segments.reduce((sum, s) => sum + (Number(s.ticketCount) || 0), 0);
    if (currentTotal <= 0) {
      const base = Math.floor(target / segments.length);
      const rem = target % segments.length;
      setSegments(
        segments.map((seg, i) => ({
          ...seg,
          ticketCount: base + (i < rem ? 1 : 0),
        }))
      );
      return;
    }

    const rawScaled = segments.map((seg) => {
      const fraction = ((Number(seg.ticketCount) || 0) / currentTotal) * target;
      const floor = Math.floor(fraction);
      const remainder = fraction - floor;
      return { floor, remainder };
    });

    const allocated = rawScaled.reduce((sum, item) => sum + item.floor, 0);
    const difference = target - allocated;

    const sortedIndices = segments
      .map((_, i) => i)
      .sort((a, b) => rawScaled[b].remainder - rawScaled[a].remainder);

    const finalCounts = rawScaled.map((item) => item.floor);
    for (let i = 0; i < difference; i++) {
      const idx = sortedIndices[i % sortedIndices.length];
      finalCounts[idx] += 1;
    }

    // Ensure every segment has at least 1 ticket if target >= segments.length
    if (target >= segments.length) {
      for (let i = 0; i < finalCounts.length; i++) {
        if (finalCounts[i] === 0) {
          let maxIdx = 0;
          for (let j = 1; j < finalCounts.length; j++) {
            if (finalCounts[j] > finalCounts[maxIdx]) {
              maxIdx = j;
            }
          }
          if (finalCounts[maxIdx] > 1) {
            finalCounts[maxIdx] -= 1;
            finalCounts[i] = 1;
          }
        }
      }
    }

    setSegments(
      segments.map((seg, i) => ({
        ...seg,
        ticketCount: finalCounts[i],
      }))
    );
  };

  // Derived calculations
  const currentPoolSize = Number(poolSize) || 0;
  const totalAllocatedTickets = segments.reduce(
    (sum, s) => sum + (Number(s.ticketCount) || 0),
    0
  );
  const isSumValid = currentPoolSize > 0 && totalAllocatedTickets === currentPoolSize;

  // Batch reward cost
  const totalCostOfBatch = segments.reduce(
    (sum, s) => sum + (Number(s.rewardValue) || 0) * (Number(s.ticketCount) || 0),
    0
  );

  // Unit economics
  const costPerSpin = currentPoolSize > 0 ? totalCostOfBatch / currentPoolSize : 0;
  const expectedCostPer1000 = Math.round(costPerSpin * 1000 * 100) / 100;

  // Rule & Tier Growth Projections
  const referralThreshold = Math.max(1, Number(tier?.referralThreshold) || 1);
  const ruleId =
    typeof tier?.qualificationRuleId === "object"
      ? tier?.qualificationRuleId?._id
      : tier?.qualificationRuleId;

  const activeRule =
    typeof tier?.qualificationRuleId === "object" && tier?.qualificationRuleId?.name
      ? tier.qualificationRuleId
      : rules.find((r) => r._id === ruleId);

  // Target referrals acquired per batch cycle
  const estReferrals = currentPoolSize * referralThreshold;
  const costPerReferral = estReferrals > 0 ? totalCostOfBatch / estReferrals : 0;

  // Unique Spinners projection
  const repeatMode = tier?.repeatMode || "one-time";
  let estSpinnersText = "";
  if (repeatMode === "one-time") {
    estSpinnersText = `${currentPoolSize.toLocaleString()} users (1 spin/user)`;
  } else if (repeatMode === "max-N") {
    const maxN = Math.max(1, Number(tier?.maxRepeatCount) || 1);
    const minUsers = Math.ceil(currentPoolSize / maxN);
    estSpinnersText = `${minUsers.toLocaleString()} – ${currentPoolSize.toLocaleString()} users (max ${maxN} spins)`;
  } else {
    estSpinnersText = `Up to ${currentPoolSize.toLocaleString()} users (unlimited repeat)`;
  }

  // Estimated platform volume (if rule has minimum transaction value)
  const minTxValue = Number(activeRule?.params?.minTransactionValue) || 0;
  const estVolumeGenerated = minTxValue > 0 ? estReferrals * minTxValue : 0;
  const costToVolumePct =
    estVolumeGenerated > 0
      ? ((totalCostOfBatch / estVolumeGenerated) * 100).toFixed(1)
      : null;

  const handleAddSegment = () => {
    const nextColor = DEFAULT_COLORS[segments.length % DEFAULT_COLORS.length];
    setSegments([
      ...segments,
      { ...DEFAULT_SEGMENT, displayColor: nextColor, label: `Reward ${segments.length + 1}` },
    ]);
  };

  const handleRemoveSegment = (index) => {
    if (segments.length <= 1) return;
    setSegments(segments.filter((_, i) => i !== index));
  };

  const handleSegmentChange = (index, field, value) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], [field]: value };
    setSegments(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSumValid) return;

    const payload = {
      tierId: tier._id,
      poolSize: Number(poolSize),
      airtimeRecipientMode,
      autoRegeneratePool: Boolean(autoRegeneratePool),
      segments: segments.map((s) => ({
        label: s.label.trim(),
        rewardType: s.rewardType,
        rewardValue: Number(s.rewardValue),
        displayColor: s.displayColor,
        ticketCount: Number(s.ticketCount),
      })),
    };

    if (isExisting) {
      editWheel(
        { id: wheelData.data._id, ...payload },
        { onSuccess: toggle }
      );
    } else {
      createWheel(payload, { onSuccess: toggle });
    }
  };

  return (
    <Modal isOpen={isOpen} className="modal-dialog-centered wheel-editor-modal" size="xl" toggle={toggle}>
      <a
        href="#close"
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="close"
      >
        <Icon name="cross-sm"></Icon>
      </a>
      <ModalBody>
        <div className="p-1 p-sm-2">
          <h5 className="title">
            Configure Wheel for <span className="text-primary">{tier?.name}</span>
          </h5>
          <p className="text-muted fs-13px">
            Define wheel segments, reward values, and ticket allocation. Odds are mathematically guaranteed
            per batch cycle.
          </p>

          {isLoading ? (
            <div className="p-4 text-center">Loading wheel configuration...</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4">
              {/* Pool Size, Airtime Mode & Allocation Card */}
              <Row className="g-3 mb-3 p-3 bg-lighter rounded align-items-stretch">
                <Col xs="12" md="6" lg="4">
                  <div className="form-group h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <label className="form-label mb-0" htmlFor="pool-size">
                          Pool Batch Size (Spins per Cycle) <span className="text-danger">*</span>
                        </label>
                        {!isSumValid && currentPoolSize > 0 && (
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-primary spin-autoscale-btn"
                            onClick={() => handleAutoScaleTickets()}
                            title="Auto-scale segment tickets to match this pool size"
                          >
                            <Icon name="spark" />
                            <span>Auto-scale Tickets</span>
                          </button>
                        )}
                      </div>
                      <input
                        id="pool-size"
                        className="form-control"
                        type="number"
                        min="1"
                        required
                        value={poolSize}
                        onChange={handlePoolSizeChange}
                        onBlur={handlePoolSizeBlur}
                      />
                      <div className="custom-control custom-switch mt-2">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="wheel-auto-regenerate"
                          checked={autoRegeneratePool}
                          onChange={(e) => setAutoRegeneratePool(e.target.checked)}
                        />
                        <label className="custom-control-label fs-12px fw-bold" htmlFor="wheel-auto-regenerate">
                          Auto-Reload Pool
                        </label>
                      </div>
                    </div>
                    <span className="text-muted fs-11px mt-1">
                      {autoRegeneratePool
                        ? "Cycles repeat: fresh batch generated every " + (poolSize || 0) + " spins."
                        : "Single round: stops and ends campaign once all " + (poolSize || 0) + " tickets are drawn (no reset)."}
                    </span>
                  </div>
                </Col>

                <Col xs="12" md="6" lg="4">
                  <div className="form-group h-100 d-flex flex-column justify-content-between">
                    <div>
                      <label className="form-label">
                        Airtime Recipient Mode <span className="text-danger">*</span>
                      </label>
                      <div className="spin-mode-selector mt-1">
                        <div
                          className={`spin-mode-chip ${airtimeRecipientMode === "user-choice" ? "active" : ""}`}
                          onClick={() => setAirtimeRecipientMode("user-choice")}
                          role="button"
                          tabIndex="0"
                        >
                          <div className="spin-mode-radio-dot" />
                          <div>
                            <div className="spin-mode-label">Prompt Winner</div>
                            <div className="spin-mode-sub">Winner enters phone</div>
                          </div>
                        </div>

                        <div
                          className={`spin-mode-chip ${airtimeRecipientMode === "auto" ? "active" : ""}`}
                          onClick={() => setAirtimeRecipientMode("auto")}
                          role="button"
                          tabIndex="0"
                        >
                          <div className="spin-mode-radio-dot" />
                          <div>
                            <div className="spin-mode-label">Auto-Detect</div>
                            <div className="spin-mode-sub">Uses verified phone</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-muted fs-11px mt-1">
                      Auto checks phone at claim time; falls back to prompt if unverified.
                    </span>
                  </div>
                </Col>

                {/* Live Allocation & Status Card */}
                <Col xs="12" lg="4">
                  <div className="spin-stats-card h-100">
                    <div className="spin-stat-row">
                      <span className="spin-stat-title">Ticket Allocation</span>
                      <span
                        className={`spin-stat-val px-2 py-0.5 rounded ${isSumValid ? "bg-success-dim text-success" : "bg-danger-dim text-danger"
                          }`}
                      >
                        {totalAllocatedTickets} / {currentPoolSize}
                      </span>
                    </div>
                    <div className="spin-stat-row">
                      <span className="spin-stat-title">Batch Reward Cost</span>
                      <span className="spin-stat-val text-dark">
                        {formatter("NGN").format(totalCostOfBatch)}
                      </span>
                    </div>
                    <div className="spin-stat-row pt-1 border-top">
                      <span className="spin-stat-title">Status</span>
                      <div className="d-flex align-items-center gap-1">
                        <span
                          className={`badge ${isSumValid ? "bg-success" : "bg-warning text-dark"
                            }`}
                          style={{ fontSize: "11px" }}
                        >
                          <Icon name={isSumValid ? "check-circle" : "alert-circle"} className="me-1" />
                          {isSumValid ? "Pool Balanced" : "Mismatch"}
                        </span>
                        {!isSumValid && currentPoolSize > 0 && (
                          <button
                            type="button"
                            className="btn btn-xs btn-primary spin-autoscale-btn"
                            onClick={() => handleAutoScaleTickets()}
                            title="Balance tickets now"
                          >
                            Auto-balance
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Campaign Growth & Economics Projections Card */}
              <div className="spin-projections-card">
                <div className="spin-projections-head">
                  <div className="spin-projections-title">
                    <Icon name="growth-fill" className="text-primary fs-16px" />
                    <span>Campaign Growth & Unit Economics (Per Cycle)</span>
                  </div>
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    {activeRule && (
                      <span className="badge bg-primary-dim text-primary fs-11px">
                        <Icon name="policy" className="me-1" />
                        Rule: {activeRule.name}
                      </span>
                    )}
                    <span className="badge bg-light text-dark fs-11px">
                      {referralThreshold} {referralThreshold === 1 ? "referral" : "referrals"} / spin
                    </span>
                  </div>
                </div>

                <div className="spin-projections-grid">
                  {/* Metric 1: Batch Reward Budget */}
                  <div className="spin-projection-item">
                    <div className="spin-proj-label">
                      <Icon name="coins" className="text-primary" />
                      <span>Batch Payout Cost</span>
                    </div>
                    <div className="spin-proj-value text-primary">
                      {formatter("NGN").format(totalCostOfBatch)}
                    </div>
                    <div className="spin-proj-sub">
                      <strong>{formatter("NGN").format(costPerSpin)}</strong> / spin
                      <span className="text-muted ms-1">({formatter("NGN").format(expectedCostPer1000)} / 1k spins)</span>
                    </div>
                  </div>

                  {/* Metric 2: Estimated Referrals Acquired */}
                  <div className="spin-projection-item">
                    <div className="spin-proj-label">
                      <Icon name="users" className="text-success" />
                      <span>Est. New Users / Referrals</span>
                    </div>
                    <div className="spin-proj-value text-success">
                      {estReferrals.toLocaleString()} <span className="fs-12px fw-normal text-muted">users</span>
                    </div>
                    <div className="spin-proj-sub">
                      Target referees driven by this {currentPoolSize.toLocaleString()}-spin batch
                    </div>
                  </div>

                  {/* Metric 3: Cost per Acquired Referral (CAC) */}
                  <div className="spin-projection-item">
                    <div className="spin-proj-label">
                      <Icon name="pie" className="text-info" />
                      <span>Acquisition Cost (CAC)</span>
                    </div>
                    <div className="spin-proj-value text-dark">
                      {formatter("NGN").format(costPerReferral)}
                    </div>
                    <div className="spin-proj-sub">
                      Reward payout cost per qualified referee acquired
                    </div>
                  </div>

                  {/* Metric 4: Spinners & Platform Volume */}
                  <div className="spin-projection-item">
                    <div className="spin-proj-label">
                      <Icon name="activity-round" className="text-warning" />
                      <span>{estVolumeGenerated > 0 ? "Est. Platform Volume" : "Spinners & Reach"}</span>
                    </div>
                    <div className="spin-proj-value text-dark">
                      {estVolumeGenerated > 0 ? (
                        <span>{formatter("NGN").format(estVolumeGenerated)}</span>
                      ) : (
                        <span className="fs-14px">{estSpinnersText}</span>
                      )}
                    </div>
                    <div className="spin-proj-sub">
                      {estVolumeGenerated > 0 ? (
                        <span>Deposit volume (Cost: <strong>{costToVolumePct}%</strong>)</span>
                      ) : (
                        <span>Spinners reach under <strong>{repeatMode}</strong> mode</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Segments Header */}
              <div className="mb-2 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <h6 className="overline-title mb-0">Wheel Segments ({segments.length})</h6>
                <Button color="primary" size="sm" type="button" className="spin-btn-add-segment text-white" onClick={handleAddSegment}>
                  <Icon name="plus"></Icon>
                  <span className="text-white">Add Segment</span>
                </Button>
              </div>

              {/* Desktop & Tablet Table (>= 768px) */}
              <div className="spin-table-wrap spin-desktop-table mb-4">
                <table className="table table-tranx mb-0">
                  <thead className="table-light">
                    <tr className="tb-tnx-head">
                      <th style={{ width: "65px" }}>Color</th>
                      <th>Label</th>
                      <th style={{ width: "170px" }}>Reward Type</th>
                      <th style={{ width: "130px" }}>Reward Value (₦)</th>
                      <th style={{ width: "120px" }}>Tickets</th>
                      <th style={{ width: "130px" }}>Odds</th>
                      <th style={{ width: "50px" }} className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((seg, idx) => {
                      const oddsPct =
                        currentPoolSize > 0
                          ? ((Number(seg.ticketCount) || 0) / currentPoolSize) * 100
                          : 0;

                      return (
                        <tr key={idx} className="tb-tnx-item">
                          {/* Color */}
                          <td>
                            <div
                              className="spin-color-picker-btn"
                              style={{ backgroundColor: seg.displayColor }}
                              title="Click to change color"
                            >
                              <input
                                type="color"
                                value={seg.displayColor}
                                onChange={(e) =>
                                  handleSegmentChange(idx, "displayColor", e.target.value)
                                }
                              />
                            </div>
                          </td>

                          {/* Label */}
                          <td>
                            <input
                              className="form-control form-control-sm"
                              type="text"
                              required
                              placeholder="e.g. ₦500 Airtime"
                              value={seg.label}
                              onChange={(e) =>
                                handleSegmentChange(idx, "label", e.target.value)
                              }
                            />
                          </td>

                          {/* Reward Type */}
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={seg.rewardType}
                              onChange={(e) =>
                                handleSegmentChange(idx, "rewardType", e.target.value)
                              }
                            >
                              <option value="balance">Wallet Balance</option>
                              <option value="airtime">Airtime</option>
                            </select>
                          </td>

                          {/* Reward Value */}
                          <td>
                            <input
                              className="form-control form-control-sm"
                              type="number"
                              min="0"
                              required
                              placeholder="Amount"
                              value={seg.rewardValue}
                              onChange={(e) =>
                                handleSegmentChange(
                                  idx,
                                  "rewardValue",
                                  Number(e.target.value) || 0
                                )
                              }
                            />
                          </td>

                          {/* Ticket Count */}
                          <td>
                            <input
                              className="form-control form-control-sm"
                              type="number"
                              min="1"
                              required
                              placeholder="Tickets"
                              value={seg.ticketCount}
                              onChange={(e) =>
                                handleSegmentChange(
                                  idx,
                                  "ticketCount",
                                  Number(e.target.value) || 0
                                )
                              }
                            />
                          </td>

                          {/* Odds */}
                          <td>
                            <span className="badge bg-light text-dark fs-12px">
                              {seg.ticketCount}/{currentPoolSize} ({oddsPct.toFixed(1)}%)
                            </span>
                          </td>

                          {/* Remove */}
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-icon btn-sm btn-dim text-danger"
                              disabled={segments.length <= 1}
                              onClick={() => handleRemoveSegment(idx)}
                              title="Delete Segment"
                            >
                              <Icon name="trash"></Icon>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View (< 768px) */}
              <div className="spin-mobile-segments mb-4">
                {segments.map((seg, idx) => {
                  const oddsPct =
                    currentPoolSize > 0
                      ? ((Number(seg.ticketCount) || 0) / currentPoolSize) * 100
                      : 0;

                  return (
                    <div key={idx} className="spin-segment-card">
                      <div className="spin-segment-card-head">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-dark fw-bold">#{idx + 1}</span>
                          <div
                            className="spin-color-picker-btn"
                            style={{ backgroundColor: seg.displayColor }}
                            title="Click to pick color"
                          >
                            <input
                              type="color"
                              value={seg.displayColor}
                              onChange={(e) =>
                                handleSegmentChange(idx, "displayColor", e.target.value)
                              }
                            />
                          </div>
                          <span className="fw-bold fs-13px text-truncate" style={{ maxWidth: "160px" }}>
                            {seg.label || `Segment ${idx + 1}`}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-primary fs-11px">
                            {seg.ticketCount}/{currentPoolSize} ({oddsPct.toFixed(1)}%)
                          </span>
                          <button
                            type="button"
                            className="btn btn-icon btn-sm btn-dim text-danger"
                            disabled={segments.length <= 1}
                            onClick={() => handleRemoveSegment(idx)}
                            title="Delete Segment"
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                      </div>

                      <div className="row g-2">
                        <div className="col-12">
                          <label className="form-label fs-11px text-muted mb-1">Segment Label</label>
                          <input
                            className="form-control form-control-sm"
                            type="text"
                            required
                            placeholder="e.g. ₦500 Airtime"
                            value={seg.label}
                            onChange={(e) =>
                              handleSegmentChange(idx, "label", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fs-11px text-muted mb-1">Reward Type</label>
                          <select
                            className="form-select form-select-sm"
                            value={seg.rewardType}
                            onChange={(e) =>
                              handleSegmentChange(idx, "rewardType", e.target.value)
                            }
                          >
                            <option value="balance">Wallet Balance</option>
                            <option value="airtime">Airtime</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="form-label fs-11px text-muted mb-1">Value (₦)</label>
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            min="0"
                            required
                            placeholder="Amount"
                            value={seg.rewardValue}
                            onChange={(e) =>
                              handleSegmentChange(
                                idx,
                                "rewardValue",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fs-11px text-muted mb-1">Tickets Allocated</label>
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            min="1"
                            required
                            placeholder="Tickets"
                            value={seg.ticketCount}
                            onChange={(e) =>
                              handleSegmentChange(
                                idx,
                                "ticketCount",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Validation Alert */}
              {!isSumValid && (
                <div className="alert alert-warning py-2 px-3 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="alert-circle" style={{ fontSize: "18px" }}></Icon>
                    <span style={{ fontSize: "13px" }}>
                      The sum of segment tickets (<strong>{totalAllocatedTickets}</strong>) does not match
                      the pool size (<strong>{currentPoolSize}</strong>). Difference:{" "}
                      <strong>{Math.abs(currentPoolSize - totalAllocatedTickets)}</strong> tickets.
                    </span>
                  </div>
                  {currentPoolSize > 0 && (
                    <Button
                      color="primary"
                      size="sm"
                      type="button"
                      className="spin-autoscale-btn"
                      onClick={() => handleAutoScaleTickets()}
                    >
                      <Icon name="spark" />
                      <span>Auto-scale Tickets to {currentPoolSize}</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="spin-modal-footer">
                <div className="text-muted fs-12px spin-modal-hint">
                  {isExisting ? "Changes apply immediately to future spins." : "A new wheel configuration will be initialized."}
                </div>
                <div className="spin-modal-btns d-flex gap-2">
                  <Button color="light" type="button" onClick={toggle}
                    className="spin-btn-submit text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={!isSumValid || isCreating || isEditing}
                    className="spin-btn-submit text-white"
                  >
                    {isCreating || isEditing
                      ? "Saving Wheel..."
                      : isExisting
                        ? "Update Wheel Configuration"
                        : "Save Wheel Configuration"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default WheelEditor;
