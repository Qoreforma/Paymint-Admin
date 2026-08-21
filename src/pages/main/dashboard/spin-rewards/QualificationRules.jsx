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
  useGetQualificationRules,
  useCreateQualificationRule,
  useEditQualificationRule,
} from "../../../../api/spinRewards";
import { usePermission } from "../../../../utils/usePermission";

const RULE_TYPE_OPTIONS = [
  { value: "all-time-count", label: "All-Time Referral Count" },
  { value: "new-since-last-claim", label: "New Referrals Since Last Claim (Repeatable)" },
  { value: "referee-profile-complete", label: "Referee Completed Profile / KYC" },
  { value: "referee-min-transaction-value", label: "Referee Min Transaction Value" },
  { value: "referee-setup-account", label: "Referee Registered & Verified Email" },
];

const QualificationRules = () => {
  const { hasPermission } = usePermission();
  const { data: rulesData, isLoading } = useGetQualificationRules();
  const { mutate: createRule, isLoading: isCreating } = useCreateQualificationRule();
  const { mutate: editRule, isLoading: isEditing } = useEditQualificationRule();

  const [modal, setModal] = useState({ add: false, edit: false });
  const [editedId, setEditedId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "all-time-count",
    description: "",
    minTransactionValue: "",
    isActive: true,
  });

  const rules = rulesData?.data || [];

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      type: "all-time-count",
      description: "",
      minTransactionValue: "",
      isActive: true,
    });
    setModal({ add: true, edit: false });
  };

  const handleOpenEdit = (rule) => {
    setEditedId(rule._id);
    setFormData({
      name: rule.name || "",
      type: rule.type || "all-time-count",
      description: rule.description || "",
      minTransactionValue: rule.params?.minTransactionValue || "",
      isActive: rule.isActive ?? true,
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
      type: formData.type,
      description: formData.description.trim(),
      params:
        formData.type === "referee-min-transaction-value" && formData.minTransactionValue
          ? { minTransactionValue: Number(formData.minTransactionValue) }
          : {},
      ...(modal.edit ? { isActive: formData.isActive } : {}),
    };

    if (modal.add) {
      createRule(payload, { onSuccess: closeModal });
    } else {
      editRule(payload, { onSuccess: closeModal });
    }
  };

  return (
    <React.Fragment>
      <BlockHead size="sm">
        <BlockBetween>
          <BlockHeadContent>
            <BlockTitle tag="h5">Qualification Rules</BlockTitle>
            <BlockDes>
              <p>Define what criteria referees must meet to count towards reward milestones.</p>
            </BlockDes>
          </BlockHeadContent>
          <BlockHeadContent>
            {hasPermission("spin_rewards.manage_tiers") && (
              <Button color="primary" onClick={handleOpenAdd}>
                <Icon name="plus"></Icon>
                <span>Add Rule</span>
              </Button>
            )}
          </BlockHeadContent>
        </BlockBetween>
      </BlockHead>

      <Block>
        <div className="nk-data data-list">
          <div className="data-head">
            <BlockBetween>
              <h6 className="overline-title mb-0">Configured Rules ({rules.length})</h6>
            </BlockBetween>
          </div>

          {isLoading ? (
            <div className="p-4 text-center">Loading qualification rules...</div>
          ) : rules.length === 0 ? (
            <div className="p-4 text-center text-muted">
              No qualification rules created yet. Click "Add Rule" to create one.
            </div>
          ) : (
            rules.map((rule) => {
              const ruleTypeLabel =
                RULE_TYPE_OPTIONS.find((opt) => opt.value === rule.type)?.label || rule.type;

              return (
                <div
                  key={rule._id}
                  className="data-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOpenEdit(rule)}
                >
                  <div className="data-col">
                    <span className="data-label fw-bold">
                      {rule.name}
                      {!rule.isActive && (
                        <span className="badge bg-danger ms-2" style={{ fontSize: "10px" }}>
                          Inactive
                        </span>
                      )}
                      <br />
                      <span className="fw-normal text-muted" style={{ fontSize: "13px" }}>
                        Type: {ruleTypeLabel}
                        {rule.params?.minTransactionValue &&
                          ` (Min: ₦${Number(rule.params.minTransactionValue).toLocaleString()})`}
                      </span>
                    </span>
                    <span className="data-value text-muted" style={{ fontSize: "12px" }}>
                      {rule.description || "No description"}
                    </span>
                  </div>
                  <div className="data-col data-col-end">
                    <span className="data-more">
                      <Icon name="forward-ios"></Icon>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Block>

      {/* Add / Edit Modal */}
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
              {modal.add ? "Create Qualification Rule" : `Edit ${formData.name}`}
            </h5>
            <form onSubmit={handleSubmit} className="mt-4">
              <Row className="gy-4">
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rule-name">
                      Rule Name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="rule-name"
                      className="form-control"
                      type="text"
                      required
                      placeholder="e.g. Standard 5 Referrals"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </Col>

                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">
                      Rule Type <span className="text-danger">*</span>
                    </label>
                    <RSelect
                      options={RULE_TYPE_OPTIONS}
                      value={RULE_TYPE_OPTIONS.find((opt) => opt.value === formData.type)}
                      onChange={(selected) => setFormData({ ...formData, type: selected.value })}
                    />
                  </div>
                </Col>

                {formData.type === "referee-min-transaction-value" && (
                  <Col md="6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="min-tx-val">
                        Minimum Transaction Value (₦) <span className="text-danger">*</span>
                      </label>
                      <input
                        id="min-tx-val"
                        className="form-control"
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 5000"
                        value={formData.minTransactionValue}
                        onChange={(e) =>
                          setFormData({ ...formData, minTransactionValue: e.target.value })
                        }
                      />
                    </div>
                  </Col>
                )}

                <Col md="12">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rule-desc">
                      Description
                    </label>
                    <textarea
                      id="rule-desc"
                      className="form-control"
                      rows="2"
                      placeholder="Optional explanation of this rule"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </Col>

                {modal.edit && (
                  <Col md="6">
                    <div className="custom-control custom-switch mt-2">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="rule-active"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                      />
                      <label className="custom-control-label" htmlFor="rule-active">
                        Rule Active
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
                        ? "Create Rule"
                        : "Update Rule"}
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
    </React.Fragment>
  );
};

export default QualificationRules;
