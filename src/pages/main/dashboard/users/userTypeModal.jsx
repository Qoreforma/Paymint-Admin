import React, { useEffect } from "react";
import { Modal, ModalBody, Form } from "reactstrap";
import { Icon, Col, Button, RSelect } from "../../../../components/Component";
import { useForm, Controller } from "react-hook-form";

const USER_TYPE_OPTIONS = [
  { label: "Regular", value: "regular" },
  { label: "Influencer", value: "influencer" },
  { label: "Micro-Influencer", value: "micro-influencer" },
];

const INFLUENCER_TYPES = ["influencer", "micro-influencer"];

/**
 * Rule configuration card rendered for each of the 4 influencer rule types.
 *
 * Props:
 *  - ruleKey:   key in influencerRules (e.g. "accountCompletion")
 *  - label:     human-readable label
 *  - register, errors, watch, setValue: react-hook-form helpers
 *  - hasTargetVolume: whether to show the extra targetVolume field (transactionVolume only)
 */
const RuleCard = ({ ruleKey, label, register, errors, watch, hasTargetVolume = false }) => {
  const isActive = watch(`influencerRules.${ruleKey}.isActive`);

  return (
    <div
      style={{
        border: "1px solid #e5e9f2",
        borderRadius: "6px",
        padding: "12px 16px",
        marginBottom: "12px",
        background: isActive ? "#f6f8ff" : "#fafafa",
      }}
    >
      {/* Row: checkbox + label */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <label className="form-label mb-0" style={{ fontWeight: 600, fontSize: "13px" }}>
          {label}
        </label>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id={`${ruleKey}-active`}
            {...register(`influencerRules.${ruleKey}.isActive`)}
          />
          <label className="form-check-label" htmlFor={`${ruleKey}-active`}>
            {isActive ? "Active" : "Inactive"}
          </label>
        </div>
      </div>

      {/* Reward Amount */}
      <div className="row g-2">
        <div className={hasTargetVolume ? "col-6" : "col-12"}>
          <label className="form-label" style={{ fontSize: "12px" }}>
            Reward Amount (₦)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className={`form-control form-control-sm ${
              errors?.influencerRules?.[ruleKey]?.rewardAmount ? "is-invalid" : ""
            }`}
            {...register(`influencerRules.${ruleKey}.rewardAmount`, {
              valueAsNumber: true,
              min: { value: 0, message: "Must be ≥ 0" },
            })}
          />
          {errors?.influencerRules?.[ruleKey]?.rewardAmount && (
            <span className="invalid-feedback">
              {errors.influencerRules[ruleKey].rewardAmount.message}
            </span>
          )}
        </div>

        {/* Target Volume (transactionVolume only) */}
        {hasTargetVolume && (
          <div className="col-6">
            <label className="form-label" style={{ fontSize: "12px" }}>
              Target Volume (₦)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`form-control form-control-sm ${
                errors?.influencerRules?.transactionVolume?.targetVolume ? "is-invalid" : ""
              }`}
              {...register(`influencerRules.transactionVolume.targetVolume`, {
                valueAsNumber: true,
                min: { value: 0, message: "Must be ≥ 0" },
              })}
            />
            {errors?.influencerRules?.transactionVolume?.targetVolume && (
              <span className="invalid-feedback">
                {errors.influencerRules.transactionVolume.targetVolume.message}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * UserTypeModal
 *
 * Allows an admin to change a user's type and — when the type is
 * "influencer" or "micro-influencer" — configure the four reward rules.
 *
 * Props:
 *  modal       - boolean: open/close
 *  closeModal  - fn: close handler
 *  onSubmit    - fn(data): called with { userType, influencerRules? }
 *  formData    - current initial values { userType, influencerRules }
 *  setFormData - setter (unused in form but kept for parent compatibility)
 */
const UserTypeModal = ({ modal, closeModal, onSubmit, formData, setFormData }) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userType: formData?.userType || "regular",
      influencerRules: {
        accountCompletion: {
          isActive: false,
          rewardAmount: 0,
        },
        firstBillPayment: {
          isActive: false,
          rewardAmount: 0,
        },
        transactionVolume: {
          isActive: false,
          rewardAmount: 0,
          targetVolume: 0,
        },
        kycCompletion: {
          isActive: false,
          rewardAmount: 0,
        },
      },
    },
  });

  const selectedType = watch("userType");
  const isInfluencerType = INFLUENCER_TYPES.includes(selectedType);

  // Sync form when formData changes (e.g. different user selected)
  useEffect(() => {
    if (formData) {
      reset({
        userType: formData.userType || "regular",
        influencerRules: {
          accountCompletion: {
            isActive: formData.influencerRules?.accountCompletion?.isActive ?? false,
            rewardAmount: formData.influencerRules?.accountCompletion?.rewardAmount ?? 0,
          },
          firstBillPayment: {
            isActive: formData.influencerRules?.firstBillPayment?.isActive ?? false,
            rewardAmount: formData.influencerRules?.firstBillPayment?.rewardAmount ?? 0,
          },
          transactionVolume: {
            isActive: formData.influencerRules?.transactionVolume?.isActive ?? false,
            rewardAmount: formData.influencerRules?.transactionVolume?.rewardAmount ?? 0,
            targetVolume: formData.influencerRules?.transactionVolume?.targetVolume ?? 0,
          },
          kycCompletion: {
            isActive: formData.influencerRules?.kycCompletion?.isActive ?? false,
            rewardAmount: formData.influencerRules?.kycCompletion?.rewardAmount ?? 0,
          },
        },
      });
    }
  }, [formData, reset]);

  const handleFormSubmit = (data) => {
    const payload = {
      userType: data.userType,
    };

    // Only include influencerRules when type warrants it
    if (INFLUENCER_TYPES.includes(data.userType)) {
      const rules = data.influencerRules || {};
      payload.influencerRules = {
        accountCompletion: {
          isActive: Boolean(rules.accountCompletion?.isActive),
          rewardAmount: Number.isNaN(Number(rules.accountCompletion?.rewardAmount))
            ? 0
            : Number(rules.accountCompletion?.rewardAmount),
        },
        firstBillPayment: {
          isActive: Boolean(rules.firstBillPayment?.isActive),
          rewardAmount: Number.isNaN(Number(rules.firstBillPayment?.rewardAmount))
            ? 0
            : Number(rules.firstBillPayment?.rewardAmount),
        },
        transactionVolume: {
          isActive: Boolean(rules.transactionVolume?.isActive),
          rewardAmount: Number.isNaN(Number(rules.transactionVolume?.rewardAmount))
            ? 0
            : Number(rules.transactionVolume?.rewardAmount),
          targetVolume: Number.isNaN(Number(rules.transactionVolume?.targetVolume))
            ? 0
            : Number(rules.transactionVolume?.targetVolume),
        },
        kycCompletion: {
          isActive: Boolean(rules.kycCompletion?.isActive),
          rewardAmount: Number.isNaN(Number(rules.kycCompletion?.rewardAmount))
            ? 0
            : Number(rules.kycCompletion?.rewardAmount),
        },
      };
    }

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={modal}
      toggle={() => closeModal()}
      className="modal-dialog-centered"
      size="lg"
    >
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>

        <div className="p-2">
          <h5 className="title">Update User Type</h5>
          <p className="text-soft" style={{ fontSize: "13px", marginBottom: "20px" }}>
            Select the user type. For influencer types, configure the reward rules below.
          </p>

          <Form className="row gy-4" onSubmit={handleSubmit(handleFormSubmit)}>
            {/* ── User Type Selector ── */}
            <Col md="12">
              <div className="form-group">
                <label className="form-label">User Type</label>
                <div className="form-control-wrap">
                  <Controller
                    name="userType"
                    control={control}
                    rules={{ required: "User type is required" }}
                    render={({ field }) => (
                      <RSelect
                        options={USER_TYPE_OPTIONS}
                        value={USER_TYPE_OPTIONS.find((o) => o.value === field.value) || null}
                        onChange={(selected) => field.onChange(selected?.value)}
                      />
                    )}
                  />
                  {errors.userType && (
                    <span className="invalid">{errors.userType.message}</span>
                  )}
                </div>
              </div>
            </Col>

            {/* ── Influencer Rules Section (conditional) ── */}
            {isInfluencerType && (
              <Col md="12">
                <div
                  style={{
                    background: "#f0f3ff",
                    borderRadius: "8px",
                    padding: "16px",
                    border: "1px solid #d0d9f7",
                  }}
                >
                  <h6
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      marginBottom: "14px",
                      color: "#364a63",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Influencer Reward Rules
                  </h6>

                  <RuleCard
                    ruleKey="accountCompletion"
                    label="Account Completion Bonus"
                    register={register}
                    errors={errors}
                    watch={watch}
                  />

                  <RuleCard
                    ruleKey="firstBillPayment"
                    label="First Bill Payment Bonus"
                    register={register}
                    errors={errors}
                    watch={watch}
                  />

                  <RuleCard
                    ruleKey="transactionVolume"
                    label="Transaction Volume Bonus"
                    register={register}
                    errors={errors}
                    watch={watch}
                    hasTargetVolume={true}
                  />

                  <RuleCard
                    ruleKey="kycCompletion"
                    label="KYC Completion Bonus"
                    register={register}
                    errors={errors}
                    watch={watch}
                  />
                </div>
              </Col>
            )}

            {/* ── Actions ── */}
            <Col size="12">
              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                <li>
                  <Button color="primary" size="md" type="submit">
                    Update User Type
                  </Button>
                </li>
                <li>
                  <a
                    href="#cancel"
                    onClick={(ev) => {
                      ev.preventDefault();
                      closeModal();
                    }}
                    className="link link-light"
                  >
                    Cancel
                  </a>
                </li>
              </ul>
            </Col>
          </Form>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default UserTypeModal;
