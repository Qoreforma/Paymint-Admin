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
import WheelEditor from "./WheelEditor";

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
      validFrom: tier.validFrom ? new Date(tier.validFrom).toISOString().slice(0, 16) : "",
      validUntil: tier.validUntil ? new Date(tier.validUntil).toISOString().slice(0, 16) : "",
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
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      referralThreshold: Number(formData.referralThreshold),
      qualificationRuleId: formData.qualificationRuleId,
      repeatMode: formData.repeatMode,
      ...(formData.repeatMode === "max-N" && formData.maxRepeatCount
        ? { maxRepeatCount: Number(formData.maxRepeatCount) }
        : {}),
      ...(formData.perUserCap ? { perUserCap: Number(formData.perUserCap) } : {}),
      ...(formData.globalBudgetCap
        ? { globalBudgetCap: Number(formData.globalBudgetCap) }
        : {}),
      ...(formData.timeWindowCapHours
        ? { timeWindowCapHours: Number(formData.timeWindowCapHours) }
        : {}),
      ...(formData.validFrom ? { validFrom: new Date(formData.validFrom).toISOString() } : {}),
      ...(formData.validUntil ? { validUntil: new Date(formData.validUntil).toISOString() } : {}),
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
              const ruleName =
                typeof tier.qualificationRuleId === "object"
                  ? tier.qualificationRuleId?.name
                  : "Rule " + tier.qualificationRuleId;

              return (
                <div key={tier._id} className="data-item">
                  <div className="data-col">
                    <span className="data-label fw-bold">
                      {tier.name}
                      {!tier.isActive && (
                        <span className="badge bg-danger ms-2" style={{ fontSize: "10px" }}>
                          Inactive
                        </span>
                      )}
                      {hasWheel ? (
                        <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>
                          Wheel Configured
                        </span>
                      ) : (
                        <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "10px" }}>
                          No Wheel
                        </span>
                      )}
                      <br />
                      <span className="fw-normal text-muted" style={{ fontSize: "13px" }}>
                        Threshold: <strong>{tier.referralThreshold} qualifying referrals</strong> | Rule:{" "}
                        {ruleName} | Mode: <strong>{tier.repeatMode}</strong>
                        {tier.repeatMode === "max-N" && ` (Max ${tier.maxRepeatCount}x)`}
                        {tier.perUserCap && ` | User Cap: ${tier.perUserCap}`}
                        {tier.globalBudgetCap && ` | Budget Cap: ${tier.globalBudgetCap}`}
                      </span>
                    </span>
                    <span className="data-value text-muted" style={{ fontSize: "12px" }}>
                      {tier.description || "No description"}
                    </span>
                  </div>

                  <div className="data-col data-col-end">
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        color={hasWheel ? "outline-primary" : "outline-warning"}
                        onClick={() => setWheelModal({ open: true, tier })}
                      >
                        <Icon name="curve-down-right"></Icon>
                        <span>{hasWheel ? "Edit Wheel" : "Set Up Wheel"}</span>
                      </Button>

                      {hasPermission("spin_rewards.manage_tiers") && (
                        <>
                          <Button
                            size="sm"
                            color="outline-secondary"
                            onClick={() => handleOpenEdit(tier)}
                          >
                            <Icon name="edit"></Icon>
                          </Button>
                          <Button
                            size="sm"
                            color="outline-danger"
                            onClick={() => handleDelete(tier._id, tier.name)}
                          >
                            <Icon name="trash"></Icon>
                          </Button>
                        </>
                      )}
                    </div>
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
          <div className="d-flex align-items-center gap-3 bg-light p-3 rounded">
            <input
              type="email"
              className="form-control w-25"
              placeholder="Target User Email"
              value={debugEmail}
              onChange={(e) => setDebugEmail(e.target.value)}
            />
            <input
              type="number"
              className="form-control"
              style={{ width: "100px" }}
              placeholder="Count"
              value={debugCount}
              onChange={(e) => setDebugCount(e.target.value)}
            />
            <Button
              color="primary"
              disabled={isSeeding || !debugEmail}
              onClick={() => seedReferrals({ email: debugEmail, count: debugCount })}
            >
              <Icon name="play" />
              <span>{isSeeding ? "Seeding..." : "Seed Referrals"}</span>
            </Button>

            <Button
              color="danger"
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
                <Col md="6">
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

                <Col md="6">
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

                <Col md="6">
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

                <Col md="6">
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
                  <Col md="6">
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

                <Col md="6">
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

                <Col md="6">
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

                <Col md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="valid-from">
                      Campaign Start (Optional)
                    </label>
                    <input
                      id="valid-from"
                      className="form-control"
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                    />
                    <div className="text-muted fs-12px mt-1">Ignore referrals before this date</div>
                  </div>
                </Col>

                <Col md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="valid-until">
                      Campaign End (Optional)
                    </label>
                    <input
                      id="valid-until"
                      className="form-control"
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                    />
                  </div>
                </Col>

                <Col md="12">
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
                  <Col md="6">
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

                <Col md="12">
                  <div className="form-group mt-2">
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
                      className="ms-2"
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
        />
      )}
    </React.Fragment>
  );
};

export default RewardTiers;
