import React, { useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  Icon,
  RSelect,
  Row,
} from "../../../../components/Component";
import {
  useGetRewardTiers,
  useGetQualificationRules,
  useCreateRewardTier,
  useEditRewardTier,
  useDeleteRewardTier,
  useGetWheelConfigs,
  useSeedReferrals,
  useCleanupDummyData,
} from "../../../../api/spinRewards";
import { usePermission } from "../../../../utils/usePermission";
import { formatDateWithTime } from "../../../../utils/Utils";
import WheelEditor from "./WheelEditor";

const formatForDateTimeLocal = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const REPEAT_MODE_OPTIONS = [
  { value: "one-time", label: "One-Time (Default)" },
  { value: "repeatable", label: "Repeatable (Unlimited)" },
  { value: "max-N", label: "Max N Times per User" },
];

const RewardTiers = () => {
  const { hasPermission } = usePermission();
  const { data: tiersData, isLoading: tiersLoading } = useGetRewardTiers();
  const { data: rulesData } = useGetQualificationRules();
  const { data: wheelsData } = useGetWheelConfigs();
  const { mutate: createTier, isLoading: isCreating } = useCreateRewardTier();
  const { mutate: editTier, isLoading: isEditing } = useEditRewardTier();
  const { mutate: deleteTier } = useDeleteRewardTier();

  const { mutate: seedReferrals, isLoading: isSeeding } = useSeedReferrals();
  const { mutate: cleanupDummyData, isLoading: isCleaning } = useCleanupDummyData();

  const [modal, setModal] = useState({ add: false, edit: false });
  const [editedId, setEditedId] = useState(null);
  const [wheelModal, setWheelModal] = useState({ open: false, tier: null });
  
  const [debugEmail, setDebugEmail] = useState("");
  const [debugCount, setDebugCount] = useState(5);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    referralThreshold: 5,
    qualificationRuleId: "",
    repeatMode: "one-time",
    maxRepeatCount: 3,
    perUserCap: "",
    globalBudgetCap: "",
    timeWindowCapHours: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  const tiers = tiersData?.data || [];
  const rules = rulesData?.data || [];
  const wheels = wheelsData?.data || [];

  const ruleOptions = rules.map((r) => ({
    value: r._id,
    label: `${r.name} (${r.type})`,
  }));

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      description: "",
      referralThreshold: 5,
      qualificationRuleId: rules[0]?._id || "",
      repeatMode: "one-time",
      maxRepeatCount: 3,
      perUserCap: "",
      globalBudgetCap: "",
      timeWindowCapHours: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
    });
    setModal({ add: true, edit: false });
  };

  const handleOpenEdit = (tier) => {
    setEditedId(tier._id);
    setFormData({
      name: tier.name || "",
      description: tier.description || "",
      referralThreshold: tier.referralThreshold || 1,
      qualificationRuleId:
        typeof tier.qualificationRuleId === "object"
          ? tier.qualificationRuleId?._id
          : tier.qualificationRuleId || "",
      repeatMode: tier.repeatMode || "one-time",
      maxRepeatCount: tier.maxRepeatCount || 3,
      perUserCap: tier.perUserCap || "",
      globalBudgetCap: tier.globalBudgetCap || "",
      timeWindowCapHours: tier.timeWindowCapHours || "",
      validFrom: formatForDateTimeLocal(tier.validFrom),
      validUntil: formatForDateTimeLocal(tier.validUntil),
      isActive: tier.isActive ?? true,
    });
    setModal({ add: false, edit: true });
  };

  const closeModal = () => {
    setModal({ add: false, edit: false });
    setEditedId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.validFrom && formData.validUntil) {
      if (new Date(formData.validUntil) <= new Date(formData.validFrom)) {
        alert("Campaign End date must be after Campaign Start date");
        return;
      }
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      referralThreshold: Number(formData.referralThreshold),
      qualificationRuleId: formData.qualificationRuleId,
      repeatMode: formData.repeatMode,
      ...(formData.repeatMode === "max-N" && formData.maxRepeatCount
        ? { maxRepeatCount: Number(formData.maxRepeatCount) }
        : {}),
      ...(formData.perUserCap
        ? { perUserCap: Number(formData.perUserCap) }
        : (modal.edit ? { perUserCap: null } : {})),
      ...(formData.globalBudgetCap
        ? { globalBudgetCap: Number(formData.globalBudgetCap) }
        : (modal.edit ? { globalBudgetCap: null } : {})),
      ...(formData.timeWindowCapHours
        ? { timeWindowCapHours: Number(formData.timeWindowCapHours) }
        : (modal.edit ? { timeWindowCapHours: null } : {})),
      ...(formData.validFrom
        ? { validFrom: new Date(formData.validFrom).toISOString() }
        : (modal.edit ? { validFrom: null } : {})),
      ...(formData.validUntil
        ? { validUntil: new Date(formData.validUntil).toISOString() }
        : (modal.edit ? { validUntil: null } : {})),
      ...(modal.edit ? { isActive: formData.isActive } : {}),
    };

    if (modal.add) {
      createTier(payload, { onSuccess: closeModal });
    } else {
      editTier(
        { id: editedId, ...payload },
        { onSuccess: closeModal }
      );
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete reward tier "${name}"?`)) {
      deleteTier(id);
    }
  };

  return (
    <React.Fragment>
      <BlockHead size="sm">
        <BlockBetween>
          <BlockHeadContent>
            <BlockTitle tag="h5">Reward Tiers & Wheels</BlockTitle>
            <BlockDes>
              <p>Configure referral milestones and attach customized spin wheels to each tier.</p>
            </BlockDes>
          </BlockHeadContent>
          <BlockHeadContent>
            {hasPermission("spin_rewards.manage_tiers") && (
              <Button color="primary" onClick={handleOpenAdd}>
                <Icon name="plus"></Icon>
                <span>Add Tier</span>
              </Button>
            )}
          </BlockHeadContent>
        </BlockBetween>
      </BlockHead>

      <Block>
        <div className="nk-data data-list">
          <div className="data-head">
            <BlockBetween>
              <h6 className="overline-title mb-0">Active & Configured Tiers ({tiers.length})</h6>
            </BlockBetween>
          </div>

          {tiersLoading ? (
            <div className="p-4 text-center">Loading reward tiers...</div>
          ) : tiers.length === 0 ? (
            <div className="p-4 text-center text-muted">
              No reward tiers configured yet. Click "Add Tier" to create your first milestone.
            </div>
          ) : (
              tiers.map((tier) => {
                const hasWheel = wheels.some(
                  (w) =>
                    w.tierId === tier._id ||
                    (typeof w.tierId === "object" && w.tierId?._id === tier._id)
                );
                const targetRuleId =
                  typeof tier.qualificationRuleId === "object"
                    ? tier.qualificationRuleId?._id
                    : tier.qualificationRuleId;
                const matchedRule = rules.find((r) => r._id === targetRuleId);
                const ruleName =
                  matchedRule?.name ||
                  (typeof tier.qualificationRuleId === "object"
                    ? tier.qualificationRuleId?.name
                    : "Milestone Rule");

                return (
                  <div key={tier._id} className="spin-tier-item">
                    <div className="spin-tier-info">
                      <div className="spin-tier-header">
                        <span className="spin-tier-title">{tier.name}</span>
                        {!tier.isActive ? (
                          <span className="badge bg-danger-dim text-danger" style={{ fontSize: "10px" }}>
                            Inactive
                          </span>
                        ) : (
                          <span className="badge bg-success-dim text-success" style={{ fontSize: "10px" }}>
                            Active
                          </span>
                        )}
                        {tier.validUntil && new Date(tier.validUntil) < new Date() ? (
                          <span className="badge bg-danger-dim text-danger" style={{ fontSize: "10px" }}>
                            <Icon name="clock" className="me-1" />
                            Campaign Ended
                          </span>
                        ) : tier.validFrom && new Date(tier.validFrom) > new Date() ? (
                          <span className="badge bg-info-dim text-info" style={{ fontSize: "10px" }}>
                            <Icon name="clock" className="me-1" />
                            Upcoming
                          </span>
                        ) : (tier.validFrom || tier.validUntil) ? (
                          <span className="badge bg-success-dim text-success" style={{ fontSize: "10px" }}>
                            <Icon name="calendar" className="me-1" />
                            Campaign Active
                          </span>
                        ) : null}
                        {hasWheel ? (
                          <span className="badge bg-primary-dim text-primary" style={{ fontSize: "10px" }}>
                            <Icon name="check-circle" className="me-1" />
                            Wheel Configured
                          </span>
                        ) : (
                          <span className="badge bg-warning-dim text-warning" style={{ fontSize: "10px" }}>
                            <Icon name="alert-circle" className="me-1" />
                            No Wheel
                          </span>
                        )}
                      </div>
                      <div className="spin-tier-meta">
                        Threshold: <strong className="text-dark">{tier.referralThreshold} qualifying referrals</strong>
                        {" • "}
                        Rule: <strong className="text-dark">{ruleName}</strong>
                        {" • "}
                        Mode: <strong className="text-dark">{tier.repeatMode}</strong>
                        {tier.repeatMode === "max-N" && ` (Max ${tier.maxRepeatCount}x)`}
                        {tier.perUserCap ? ` • User Cap: ${tier.perUserCap}` : ""}
                        {tier.globalBudgetCap ? ` • Budget Cap: ${tier.globalBudgetCap}` : ""}
                        {tier.validFrom && (
                          <>
                            {" • "}
                            Campaign Start: <strong className="text-dark">{formatDateWithTime(tier.validFrom)}</strong>
                          </>
                        )}
                        {tier.validUntil && (
                          <>
                            {" • "}
                            Campaign End: <strong className="text-dark">{formatDateWithTime(tier.validUntil)}</strong>
                          </>
                        )}
                      </div>
                      {tier.description && (
                        <div className="spin-tier-desc">{tier.description}</div>
                      )}
                    </div>

                    <div className="spin-tier-actions">
                      <Button
                        size="sm"
                        color={hasWheel ? "primary" : "warning"}
                        className={`spin-btn-wheel ${hasWheel ? "spin-btn-wheel-active" : "spin-btn-wheel-setup"}`}
                        onClick={() => setWheelModal({ open: true, tier })}
                        title={hasWheel ? "Configure Spin Wheel Segments" : "Set Up Spin Wheel"}
                      >
                        <Icon name={hasWheel ? "setting-alt" : "curve-down-right"} />
                        <span>{hasWheel ? "Edit Wheel" : "Set Up Wheel"}</span>
                      </Button>

                      {hasPermission("spin_rewards.manage_tiers") && (
                        <>
                          <Button
                            size="sm"
                            color="light"
                            className="btn-icon btn-dim spin-btn-icon-sq"
                            onClick={() => handleOpenEdit(tier)}
                            title="Edit Tier Settings"
                          >
                            <Icon name="edit" />
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            className="btn-icon btn-dim text-danger spin-btn-icon-sq"
                            onClick={() => handleDelete(tier._id, tier.name)}
                            title="Delete Tier"
                          >
                            <Icon name="trash" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Block>

        {hasPermission("spin_rewards.manage_tiers") && (
          <Block>
            <BlockHead>
              <BlockTitle tag="h6">Debug Tools</BlockTitle>
              <BlockDes>
                <p>Quickly seed referrals to test spin evaluation socket notifications, or clean up dummy data.</p>
              </BlockDes>
            </BlockHead>
            <div className="spin-debug-tools">
              <input
                type="email"
                className="form-control spin-debug-email"
                placeholder="Target User Email"
                value={debugEmail}
                onChange={(e) => setDebugEmail(e.target.value)}
              />
              <input
                type="number"
                className="form-control spin-debug-count"
                placeholder="Count"
                min="1"
                max="50"
                value={debugCount}
                onChange={(e) => setDebugCount(e.target.value)}
              />
              <Button
                color="primary"
                size="sm"
                className="spin-btn-seed"
                disabled={isSeeding || !debugEmail}
                onClick={() => seedReferrals({ email: debugEmail, count: debugCount })}
              >
                <Icon name="play" />
                <span>{isSeeding ? "Seeding..." : "Seed Referrals"}</span>
              </Button>

              <Button
                color="danger"
                size="sm"
                outline
                disabled={isCleaning}
                onClick={() => cleanupDummyData()}
              >
                <Icon name="trash" />
                <span>{isCleaning ? "Cleaning..." : "Cleanup Dummy Data"}</span>
              </Button>
            </div>
          </Block>
        )}

      {/* Add / Edit Tier Modal */}
      <Modal
        isOpen={modal.add || modal.edit}
        className="modal-dialog-centered"
        size="lg"
        toggle={closeModal}
      >
        <a
          href="#close"
          onClick={(e) => {
            e.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <ModalBody>
          <div className="p-2">
            <h5 className="title">
              {modal.add ? "Create Reward Tier" : `Edit ${formData.name}`}
            </h5>
            <form onSubmit={handleSubmit} className="mt-4">
              <Row className="gy-3">
                <Col xs="12" md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="tier-name">
                      Tier Name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="tier-name"
                      className="form-control"
                      type="text"
                      required
                      placeholder="e.g. Bronze Milestone (5 Referrals)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </Col>

                <Col xs="12" md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="tier-threshold">
                      Referral Threshold <span className="text-danger">*</span>
                    </label>
                    <input
                      id="tier-threshold"
                      className="form-control"
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 5"
                      value={formData.referralThreshold}
                      onChange={(e) =>
                        setFormData({ ...formData, referralThreshold: e.target.value })
                      }
                    />
                  </div>
                </Col>

                <Col xs="12" md="6">
                  <div className="form-group">
                    <label className="form-label">
                      Qualification Rule <span className="text-danger">*</span>
                    </label>
                    <RSelect
                      options={ruleOptions}
                      value={ruleOptions.find(
                        (opt) => opt.value === formData.qualificationRuleId
                      )}
                      onChange={(selected) =>
                        setFormData({ ...formData, qualificationRuleId: selected.value })
                      }
                    />
                  </div>
                </Col>

                <Col xs="12" md="6">
                  <div className="form-group">
                    <label className="form-label">
                      Repeat Mode <span className="text-danger">*</span>
                    </label>
                    <RSelect
                      options={REPEAT_MODE_OPTIONS}
                      value={REPEAT_MODE_OPTIONS.find(
                        (opt) => opt.value === formData.repeatMode
                      )}
                      onChange={(selected) =>
                        setFormData({ ...formData, repeatMode: selected.value })
                      }
                    />
                  </div>
                </Col>

                {formData.repeatMode === "max-N" && (
                  <Col xs="12" md="6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="max-repeat">
                        Max Spins per User <span className="text-danger">*</span>
                      </label>
                      <input
                        id="max-repeat"
                        className="form-control"
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 3"
                        value={formData.maxRepeatCount}
                        onChange={(e) =>
                          setFormData({ ...formData, maxRepeatCount: e.target.value })
                        }
                      />
                    </div>
                  </Col>
                )}

                <Col xs="12" md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="per-user-cap">
                      Per-User Cap (Optional)
                    </label>
                    <input
                      id="per-user-cap"
                      className="form-control"
                      type="number"
                      min="1"
                      placeholder="Lifetime spin cap for user"
                      value={formData.perUserCap}
                      onChange={(e) =>
                        setFormData({ ...formData, perUserCap: e.target.value })
                      }
                    />
                  </div>
                </Col>

                <Col xs="12" md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="budget-cap">
                      Global Budget Cap (Optional)
                    </label>
                    <input
                      id="budget-cap"
                      className="form-control"
                      type="number"
                      min="1"
                      placeholder="Max total spins across all users"
                      value={formData.globalBudgetCap}
                      onChange={(e) =>
                        setFormData({ ...formData, globalBudgetCap: e.target.value })
                      }
                    />
                  </div>
                </Col>

                <Col xs="12" md="6">
                  <div className="form-group">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label mb-0" htmlFor="valid-from">
                        Campaign Start (Optional)
                      </label>
                      {formData.validFrom && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-danger"
                          style={{ fontSize: "11px", textDecoration: "none" }}
                          onClick={() => setFormData({ ...formData, validFrom: "" })}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      id="valid-from"
                      className="form-control mt-1"
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                    />
                    <div className="text-muted fs-12px mt-1">Ignore referrals before this date</div>
                  </div>
                </Col>

                <Col xs="12" md="6">
                  <div className="form-group">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label mb-0" htmlFor="valid-until">
                        Campaign End (Optional)
                      </label>
                      {formData.validUntil && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-danger"
                          style={{ fontSize: "11px", textDecoration: "none" }}
                          onClick={() => setFormData({ ...formData, validUntil: "" })}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      id="valid-until"
                      className="form-control mt-1"
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                    />
                  </div>
                </Col>

                <Col xs="12">
                  <div className="form-group">
                    <label className="form-label" htmlFor="tier-desc">
                      Description
                    </label>
                    <textarea
                      id="tier-desc"
                      className="form-control"
                      rows="2"
                      placeholder="Optional details about this tier"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </Col>

                {modal.edit && (
                  <Col xs="12" md="6">
                    <div className="custom-control custom-switch mt-2">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="tier-active"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                      />
                      <label className="custom-control-label" htmlFor="tier-active">
                        Tier Active
                      </label>
                    </div>
                  </Col>
                )}

                <Col xs="12">
                  <div className="form-group mt-2 d-flex flex-wrap gap-2">
                    <Button color="primary" type="submit" disabled={isCreating || isEditing}>
                      {isCreating || isEditing
                        ? "Saving..."
                        : modal.add
                        ? "Create Tier"
                        : "Update Tier"}
                    </Button>
                    <Button
                      color="light"
                      type="button"
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </form>
          </div>
        </ModalBody>
      </Modal>

      {/* Wheel Editor Modal */}
      {wheelModal.open && (
        <WheelEditor
          isOpen={wheelModal.open}
          toggle={() => setWheelModal({ open: false, tier: null })}
          tier={wheelModal.tier}
          rules={rules}
        />
      )}
    </React.Fragment>
  );
};

export default RewardTiers;
