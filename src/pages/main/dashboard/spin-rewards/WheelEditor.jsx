import React, { useState, useEffect } from "react";
import { Modal, ModalBody } from "reactstrap";
import {
  Button,
  Col,
  Icon,
  RSelect,
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

const WheelEditor = ({ isOpen, toggle, tier }) => {
  const { data: wheelData, isLoading } = useGetWheelConfigByTier(tier?._id);
  const { mutate: createWheel, isLoading: isCreating } = useCreateWheelConfig();
  const { mutate: editWheel, isLoading: isEditing } = useEditWheelConfig(
    wheelData?.data?._id
  );

  const [poolSize, setPoolSize] = useState(20);
  const [airtimeRecipientMode, setAirtimeRecipientMode] = useState("user-choice");
  const [segments, setSegments] = useState([
    { label: "₦100 Cash", rewardType: "balance", rewardValue: 100, displayColor: "#6366F1", ticketCount: 10 },
    { label: "₦200 Airtime", rewardType: "airtime", rewardValue: 200, displayColor: "#10B981", ticketCount: 5 },
    { label: "₦500 Cash", rewardType: "balance", rewardValue: 500, displayColor: "#F59E0B", ticketCount: 4 },
    { label: "₦1,000 Jackpot", rewardType: "balance", rewardValue: 1000, displayColor: "#EF4444", ticketCount: 1 },
  ]);

  const isExisting = !!wheelData?.data?._id;

  useEffect(() => {
    if (wheelData?.data) {
      const data = wheelData.data;
      setPoolSize(data.poolSize || 20);
      setAirtimeRecipientMode(data.airtimeRecipientMode || "user-choice");
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
    }
  }, [wheelData]);

  // Derived calculations
  const totalAllocatedTickets = segments.reduce(
    (sum, s) => sum + (Number(s.ticketCount) || 0),
    0
  );
  const isSumValid = totalAllocatedTickets === Number(poolSize);

  const totalCostOfBatch = segments.reduce(
    (sum, s) => sum + (Number(s.rewardValue) || 0) * (Number(s.ticketCount) || 0),
    0
  );
  const expectedCostPer1000 =
    poolSize > 0 ? Math.round((totalCostOfBatch / poolSize) * 1000 * 100) / 100 : 0;

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
    <Modal isOpen={isOpen} className="modal-dialog-centered" size="xl" toggle={toggle}>
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
        <div className="p-2">
          <h5 className="title">
            Configure Wheel for <span className="text-primary">{tier?.name}</span>
          </h5>
          <p className="text-muted" style={{ fontSize: "13px" }}>
            Define wheel segments, reward values, and ticket allocation. Odds are mathematically guaranteed
            per batch cycle.
          </p>

          {isLoading ? (
            <div className="p-4 text-center">Loading wheel configuration...</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4">
              {/* Pool Size & Airtime Mode */}
              <Row className="gy-3 mb-4 p-3 bg-lighter rounded">
                <Col md="4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pool-size">
                      Pool Batch Size (Spins per Cycle) <span className="text-danger">*</span>
                    </label>
                    <input
                      id="pool-size"
                      className="form-control"
                      type="number"
                      min="1"
                      required
                      value={poolSize}
                      onChange={(e) => setPoolSize(Number(e.target.value) || 1)}
                    />
                    <span className="text-muted" style={{ fontSize: "11px" }}>
                      e.g. 20 means odds reset every 20 spins across all users.
                    </span>
                  </div>
                </Col>

                <Col md="4">
                  <div className="form-group">
                    <label className="form-label">
                      Airtime Recipient Mode <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-3 mt-2">
                      <div className="custom-control custom-radio">
                        <input
                          type="radio"
                          id="mode-user-choice"
                          name="airtimeMode"
                          className="custom-control-input"
                          checked={airtimeRecipientMode === "user-choice"}
                          onChange={() => setAirtimeRecipientMode("user-choice")}
                        />
                        <label className="custom-control-label" htmlFor="mode-user-choice">
                          Prompt Winner
                        </label>
                      </div>
                      <div className="custom-control custom-radio">
                        <input
                          type="radio"
                          id="mode-auto"
                          name="airtimeMode"
                          className="custom-control-input"
                          checked={airtimeRecipientMode === "auto"}
                          onChange={() => setAirtimeRecipientMode("auto")}
                        />
                        <label className="custom-control-label" htmlFor="mode-auto">
                          Auto-Detect
                        </label>
                      </div>
                    </div>
                    <span className="text-muted" style={{ fontSize: "11px" }}>
                      Auto verifies winner's phone at claim time; falls back to prompt if unverified.
                    </span>
                  </div>
                </Col>

                {/* Live Stats Card */}
                <Col md="4">
                  <div className="card card-bordered h-100 p-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        Ticket Allocation:
                      </span>
                      <span
                        className={`fw-bold ${
                          isSumValid ? "text-success" : "text-danger"
                        }`}
                        style={{ fontSize: "13px" }}
                      >
                        {totalAllocatedTickets} / {poolSize}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        Expected Cost / 1k Spins:
                      </span>
                      <span className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                        {formatter("NGN").format(expectedCostPer1000)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        Status:
                      </span>
                      <span
                        className={`badge ${
                          isSumValid ? "bg-success" : "bg-warning text-dark"
                        }`}
                        style={{ fontSize: "11px" }}
                      >
                        {isSumValid ? "Pool Balanced" : "Allocation Mismatch"}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Segments Table */}
              <div className="mb-2 d-flex justify-content-between align-items-center">
                <h6 className="overline-title mb-0">Wheel Segments ({segments.length})</h6>
                <Button color="outline-primary" size="sm" type="button" onClick={handleAddSegment}>
                  <Icon name="plus"></Icon>
                  <span>Add Segment</span>
                </Button>
              </div>

              <div className="table-responsive border rounded mb-4">
                <table className="table table-tranx mb-0">
                  <thead className="table-light">
                    <tr className="tb-tnx-head">
                      <th>Color</th>
                      <th>Label</th>
                      <th>Reward Type</th>
                      <th>Reward Value (₦)</th>
                      <th>Tickets in Pool</th>
                      <th>Exact Odds</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((seg, idx) => {
                      const oddsPct =
                        poolSize > 0
                          ? ((Number(seg.ticketCount) || 0) / poolSize) * 100
                          : 0;

                      return (
                        <tr key={idx} className="tb-tnx-item">
                          {/* Color */}
                          <td style={{ width: "80px" }}>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="color"
                                className="form-control form-control-color p-0 border-0"
                                style={{ width: "32px", height: "32px", cursor: "pointer" }}
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
                          <td style={{ width: "180px" }}>
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
                          <td style={{ width: "140px" }}>
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
                          <td style={{ width: "120px" }}>
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
                          <td style={{ width: "100px" }}>
                            <span className="badge bg-light text-dark" style={{ fontSize: "12px" }}>
                              {seg.ticketCount}/{poolSize} ({oddsPct.toFixed(1)}%)
                            </span>
                          </td>

                          {/* Remove */}
                          <td style={{ width: "60px" }}>
                            <button
                              type="button"
                              className="btn btn-icon btn-sm btn-outline-danger"
                              disabled={segments.length <= 1}
                              onClick={() => handleRemoveSegment(idx)}
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

              {/* Validation Alert */}
              {!isSumValid && (
                <div className="alert alert-warning py-2 px-3 mb-3 d-flex align-items-center gap-2">
                  <Icon name="alert-circle" style={{ fontSize: "18px" }}></Icon>
                  <span style={{ fontSize: "13px" }}>
                    The sum of segment tickets (<strong>{totalAllocatedTickets}</strong>) does not match
                    the pool size (<strong>{poolSize}</strong>). Difference:{" "}
                    <strong>{Math.abs(poolSize - totalAllocatedTickets)}</strong> tickets.
                  </span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="d-flex justify-content-between align-items-center pt-2">
                <div className="text-muted" style={{ fontSize: "12px" }}>
                  {isExisting ? "Changes apply immediately to future spins." : "A new wheel configuration will be initialized."}
                </div>
                <div className="d-flex gap-2">
                  <Button color="light" type="button" onClick={toggle}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={!isSumValid || isCreating || isEditing}
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
