import React, { useState, useEffect } from "react";
import { Modal, ModalBody, Form, Spinner, Badge } from "reactstrap";
import { Icon, Col, Button, RSelect } from "../../../../components/Component";
import { useForm, Controller } from "react-hook-form";
import { TransactionType } from "./UserData";
import { useSendWalletOtp, useFinanceUser } from "../../../../api/users/user";

const AddModal = ({ modal, closeModal, userId, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [pendingData, setPendingData] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  const {
    reset: resetStep1,
    register,
    control,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm({
    defaultValues: {
      type: TransactionType[0],
      amount: "",
      remark: "",
    },
  });

  const {
    reset: resetOtp,
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp },
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  const { mutate: sendWalletOtp, isLoading: isSendingOtp } = useSendWalletOtp(userId);
  const { mutate: financeUser, isLoading: isFinancing } = useFinanceUser(userId);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const handleClose = () => {
    setStep(1);
    setPendingData(null);
    setTimerActive(false);
    setCountdown(60);
    resetStep1();
    resetOtp();
    closeModal();
  };

  // Step 1: Request OTP
  const onProceedToOtp = (data) => {
    const typeVal = data.type?.value || data.type || "credit";
    const payload = {
      userId,
      type: typeVal,
      amount: Number(data.amount),
      remark: data.remark,
    };

    sendWalletOtp(
      { userId, type: payload.type, amount: payload.amount },
      {
        onSuccess: () => {
          setPendingData(payload);
          setStep(2);
          setCountdown(60);
          setTimerActive(true);
        },
      }
    );
  };

  // Resend OTP
  const handleResendOtp = (e) => {
    e?.preventDefault();
    if (countdown > 0 || !pendingData) return;
    sendWalletOtp(
      { userId, type: pendingData.type, amount: pendingData.amount },
      {
        onSuccess: () => {
          setCountdown(60);
          setTimerActive(true);
        },
      }
    );
  };

  // Step 2: Authorize with OTP
  const onAuthorizeSubmit = (data) => {
    if (!pendingData) return;
    const finalPayload = {
      userId,
      type: pendingData.type,
      amount: pendingData.amount,
      remark: pendingData.remark,
      otp: data.otp?.trim(),
    };

    financeUser(finalPayload, {
      onSuccess: () => {
        if (onSubmit) onSubmit(finalPayload);
        handleClose();
      },
    });
  };

  return (
    <Modal isOpen={modal} toggle={handleClose} className="modal-dialog-centered" size="md">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            handleClose();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>

        <div className="p-2">
          {step === 1 ? (
            <>
              <h5 className="title">Finance User</h5>
              <p className="text-muted fs-13px mt-1 mb-4">
                Credit or debit this user's wallet. An authorization OTP will be sent to your admin email address.
              </p>

              <Form className="row gy-4" noValidate onSubmit={handleSubmitStep1(onProceedToOtp)}>
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label font-weight-bold">Action Type</label>
                    <div className="form-control-wrap">
                      <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => (
                          <RSelect options={TransactionType} value={value} onChange={onChange} />
                        )}
                      />
                    </div>
                  </div>
                </Col>

                <Col md="12">
                  <div className="form-group">
                    <label className="form-label font-weight-bold">Amount (₦)</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      step="any"
                      {...register("amount", {
                        required: "Amount is required",
                        min: { value: 1, message: "Amount must be greater than zero" },
                      })}
                      placeholder="e.g. 5000"
                    />
                    {errorsStep1.amount && <span className="invalid">{errorsStep1.amount.message}</span>}
                  </div>
                </Col>

                <Col md="12">
                  <div className="form-group">
                    <label className="form-label font-weight-bold">Remark / Reason</label>
                    <input
                      className="form-control"
                      type="text"
                      {...register("remark", { required: "Remark is required for audit trail" })}
                      placeholder="e.g. Refund for failed bill payment"
                    />
                    {errorsStep1.remark && <span className="invalid">{errorsStep1.remark.message}</span>}
                  </div>
                </Col>

                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md" type="submit" disabled={isSendingOtp}>
                        {isSendingOtp ? (
                          <>
                            <Spinner size="sm" className="me-1" />
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Authorization OTP</span>
                            <Icon name="arrow-right" className="ms-1" />
                          </>
                        )}
                      </Button>
                    </li>
                    <li>
                      <a
                        href="#cancel"
                        onClick={(ev) => {
                          ev.preventDefault();
                          handleClose();
                        }}
                        className="link link-light"
                      >
                        Cancel
                      </a>
                    </li>
                  </ul>
                </Col>
              </Form>
            </>
          ) : (
            <>
              <h5 className="title">Authorize Financial Action</h5>
              <p className="text-muted fs-13px mt-1 mb-3">
                A 6-digit OTP code has been dispatched to your administrator email address.
              </p>

              {/* Transaction Summary Card */}
              <div className="bg-light p-3 rounded mb-3 border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fs-12px text-uppercase font-weight-bold">Action</span>
                  <Badge
                    color={pendingData?.type === "credit" ? "success" : "danger"}
                    className="badge-dim font-weight-bold"
                  >
                    {pendingData?.type === "credit" ? "CREDIT WALLET" : "DEBIT WALLET"}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fs-12px text-uppercase font-weight-bold">Amount</span>
                  <span className="fs-16px font-weight-bold text-dark">
                    ₦
                    {Number(pendingData?.amount || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted fs-12px text-uppercase font-weight-bold">Remark</span>
                  <span className="text-muted fs-13px text-end text-truncate" style={{ maxWidth: "250px" }}>
                    {pendingData?.remark}
                  </span>
                </div>
              </div>

              <Form className="row gy-3" noValidate onSubmit={handleSubmitOtp(onAuthorizeSubmit)}>
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label font-weight-bold">Enter 6-Digit OTP</label>
                    <input
                      className="form-control form-control-lg text-center font-weight-bold"
                      type="text"
                      maxLength={6}
                      placeholder="••••••"
                      style={{ letterSpacing: "8px", fontSize: "20px" }}
                      autoFocus
                      {...registerOtp("otp", {
                        required: "OTP is required",
                        minLength: { value: 6, message: "OTP must be exactly 6 digits" },
                        maxLength: { value: 6, message: "OTP must be exactly 6 digits" },
                      })}
                    />
                    {errorsOtp.otp && (
                      <span className="invalid text-danger small mt-1 d-block">
                        {errorsOtp.otp.message}
                      </span>
                    )}
                  </div>

                  {/* Countdown & Resend Option */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="text-muted fs-12px">
                      {timerActive && countdown > 0 ? (
                        <>
                          Resend available in <strong className="text-dark">{countdown}s</strong>
                        </>
                      ) : (
                        <span>Didn't receive the email?</span>
                      )}
                    </span>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-primary"
                      onClick={handleResendOtp}
                      disabled={(timerActive && countdown > 0) || isSendingOtp}
                    >
                      {isSendingOtp ? "Resending..." : "Resend OTP"}
                    </button>
                  </div>
                </Col>

                <Col size="12" className="mt-4">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-3 gy-2">
                    <li>
                      <Button color="primary" size="md" type="submit" disabled={isFinancing}>
                        {isFinancing ? (
                          <>
                            <Spinner size="sm" className="me-1" />
                            <span>Authorizing...</span>
                          </>
                        ) : (
                          <>
                            <Icon name="shield-check" className="me-1" />
                            <span>Confirm & Authorize</span>
                          </>
                        )}
                      </Button>
                    </li>
                    <li>
                      <Button
                        color="light"
                        size="md"
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={isFinancing}
                      >
                        <Icon name="arrow-left" className="me-1" />
                        <span>Back</span>
                      </Button>
                    </li>
                    <li>
                      <a
                        href="#cancel"
                        onClick={(ev) => {
                          ev.preventDefault();
                          handleClose();
                        }}
                        className="link link-light"
                      >
                        Cancel
                      </a>
                    </li>
                  </ul>
                </Col>
              </Form>
            </>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AddModal;
