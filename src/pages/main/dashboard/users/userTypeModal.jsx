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
 * Rule configuration card for the invited user's first-transaction welcome cashback.
 */
const RefereeRuleCard = ({ register, errors, watch }) => {
  const isActive = watch("influencerRules.refereeFirstTransaction.isActive");

  return (
    <div
      style={{
        border: "1px solid #c7d2fe",
        borderRadius: "6px",
        padding: "12px 16px",
        marginBottom: "12px",
        background: isActive ? "#eff6ff" : "#fafafa",
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div>
          <label className="form-label mb-0" style={{ fontWeight: 600, fontSize: "13px", color: "#1e3a8a" }}>
            🎁 Referee First-Transaction Welcome Offer
          </label>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            Credited to the referred user's bonus balance upon completing their 1st transaction.
          </div>
        </div>
        <div className="form-check form-switch ms-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="refereeFirstTransaction-active"
            {...register("influencerRules.refereeFirstTransaction.isActive")}
          />
          <label className="form-check-label" htmlFor="refereeFirstTransaction-active">
            {isActive ? "Active" : "Inactive"}
          </label>
        </div>
      </div>

      <div className="row g-2 mt-1">
        <div className="col-6">
          <label className="form-label" style={{ fontSize: "12px" }}>
            Cashback Percentage (%)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            placeholder="10"
            className={`form-control form-control-sm ${
              errors?.influencerRules?.refereeFirstTransaction?.discountPercentage ? "is-invalid" : ""
            }`}
            {...register("influencerRules.refereeFirstTransaction.discountPercentage", {
              valueAsNumber: true,
              min: { value: 1, message: "Min 1%" },
              max: { value: 100, message: "Max 100%" },
            })}
          />
          {errors?.influencerRules?.refereeFirstTransaction?.discountPercentage && (
            <span className="invalid-feedback">
              {errors.influencerRules.refereeFirstTransaction.discountPercentage.message}
            </span>
          )}
        </div>

        <div className="col-6">
          <label className="form-label" style={{ fontSize: "12px" }}>
            Max Cap (₦)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="200"
            className={`form-control form-control-sm ${
              errors?.influencerRules?.refereeFirstTransaction?.cap ? "is-invalid" : ""
            }`}
            {...register("influencerRules.refereeFirstTransaction.cap", {
              valueAsNumber: true,
              min: { value: 0, message: "Must be ≥ 0" },
            })}
          />
          {errors?.influencerRules?.refereeFirstTransaction?.cap && (
            <span className="invalid-feedback">
              {errors.influencerRules.refereeFirstTransaction.cap.message}
            </span>
          )}
        </div>
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
        refereeFirstTransaction: {
          isActive: false,
          discountPercentage: 10,
          cap: 200,
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
          refereeFirstTransaction: {
            isActive: formData.influencerRules?.refereeFirstTransaction?.isActive ?? false,
            discountPercentage: formData.influencerRules?.refereeFirstTransaction?.discountPercentage ?? 10,
            cap: formData.influencerRules?.refereeFirstTransaction?.cap ?? 200,
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
        refereeFirstTransaction: {
          isActive: Boolean(rules.refereeFirstTransaction?.isActive),
          discountPercentage: Number.isNaN(Number(rules.refereeFirstTransaction?.discountPercentage))
            ? 10
            : Number(rules.refereeFirstTransaction?.discountPercentage),
          cap: Number.isNaN(Number(rules.refereeFirstTransaction?.cap))
            ? 200
            : Number(rules.refereeFirstTransaction?.cap),
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

                  <RefereeRuleCard
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
