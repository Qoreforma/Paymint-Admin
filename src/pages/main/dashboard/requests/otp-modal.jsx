import React, { useState, useEffect } from "react";
import { Modal, ModalBody, Spinner, Badge } from "reactstrap";
import { Button, Col, Icon, Row } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";
import { toast } from "react-hot-toast";

export default function FinanceActionOtpModal({
  isOpen,
  onClose,
  action, // "approve" | "reject"
  type = "deposit", // "deposit" | "withdrawal"
  item,
  onSendOtp,
  onSubmit,
  isSendingOtp = false,
  isSubmitting = false,
}) {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const submitting = isSubmitting || isSubmittingLocal;

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtp("");
      setNote("");
      setReason("");
      setPaymentReference("");
      setCountdown(60);
      setCanResend(false);
    }
  }, [isOpen]);

  // Countdown timer in step 2
  useEffect(() => {
    let timer;
    if (isOpen && step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, step, countdown]);

  const handleClose = () => {
    setStep(1);
    setOtp("");
    setNote("");
    setReason("");
    setPaymentReference("");
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleRequestOtp = (e) => {
    if (e) e.preventDefault();
    if (action === "reject") {
      const cleanReason = reason.trim();
      if (!cleanReason) {
        toast.error("Please enter a reason for rejecting this request");
        return;
      }
      if (cleanReason.length < 5) {
        toast.error("Rejection reason must be at least 5 characters long");
        return;
      }
    }

    if (onSendOtp) {
      onSendOtp(
        { transactionID: item?._id, action },
        {
          onSuccess: () => {
            setStep(2);
            setCountdown(60);
            setCanResend(false);
          },
        }
      );
    } else {
      setStep(2);
    }
  };

  const handleResendOtp = (e) => {
    if (e) e.preventDefault();
    if (!canResend || isSendingOtp) return;
    if (onSendOtp) {
      onSendOtp(
        { transactionID: item?._id, action },
        {
          onSuccess: () => {
            setCountdown(60);
            setCanResend(false);
          },
        }
      );
    }
  };

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      toast.error("Please enter the 6-digit authorization OTP");
      return;
    }
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }

    const payloadData = {
      otp: cleanOtp,
    };

    if (action === "reject") {
      payloadData.reason = reason.trim();
    } else {
      if (note.trim()) payloadData.note = note.trim();
      if (paymentReference.trim()) payloadData.paymentReference = paymentReference.trim();
    }

    if (onSubmit) {
      setIsSubmittingLocal(true);
      onSubmit(
        {
          transactionID: item?._id,
          action,
          data: payloadData,
        },
        {
          onSuccess: () => {
            setIsSubmittingLocal(false);
            handleClose();
          },
          onError: () => {
            setIsSubmittingLocal(false);
          },
        }
      );
    }
  };

  const userFullName =
    item?.userId?.firstname || item?.userId?.lastname
      ? `${item?.userId?.firstname || ""} ${item?.userId?.lastname || ""}`.trim()
      : item?.user?.firstname || item?.user?.lastname
      ? `${item?.user?.firstname || ""} ${item?.user?.lastname || ""}`.trim()
      : item?.accountName || "N/A";

  const isReject = action === "reject";
  const typeLabel = type === "deposit" ? "Deposit" : "Withdrawal";

  return (
    <Modal isOpen={isOpen} toggle={handleClose} className="modal-dialog-centered" size="md">
      <ModalBody className="p-4">
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            handleClose();
          }}
          className="close"
        >
          <Icon name="cross-sm" />
        </a>

        {step === 1 ? (
          <div>
            <div className="nk-modal-head mb-3">
              <h5 className="title">
                {isReject ? `Reject ${typeLabel} Request` : `Approve ${typeLabel} Request`}
              </h5>
              <p className="text-soft">
                {isReject
                  ? `You are about to decline this ${typeLabel.toLowerCase()} request. Please specify a reason before requesting authorization.`
                  : `Review request details below and request an authorization OTP to approve this ${typeLabel.toLowerCase()}.`}
              </p>
            </div>

            {/* Request Summary Card */}
            <div className="bg-lighter p-3 rounded mb-3">
              <Row className="gy-2">
                <Col size="6">
                  <span className="sub-text">User</span>
                  <span className="caption-text fw-bold">{userFullName}</span>
                </Col>
                <Col size="6">
                  <span className="sub-text">Amount</span>
                  <span className="caption-text fw-bold text-primary">
                    {formatter("NGN").format(item?.amount || 0)}
                  </span>
                </Col>
                {type === "withdrawal" && item?.totalDeduction && (
                  <Col size="6">
                    <span className="sub-text">Total Deduction</span>
                    <span className="caption-text">
                      {formatter("NGN").format(item?.totalDeduction || 0)}
                    </span>
                  </Col>
                )}
                <Col size="6">
                  <span className="sub-text">Reference</span>
                  <span className="caption-text small text-break">{item?.reference || "N/A"}</span>
                </Col>
                {item?.bankName && (
                  <Col size="6">
                    <span className="sub-text">Bank</span>
                    <span className="caption-text">{item?.bankName}</span>
                  </Col>
                )}
                {item?.accountNumber && (
                  <Col size="6">
                    <span className="sub-text">Account Number</span>
                    <span className="caption-text">{item?.accountNumber}</span>
                  </Col>
                )}
              </Row>
            </div>

            {/* Inputs based on Action */}
            {isReject ? (
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="reject-reason">
                  Rejection Reason <span className="text-danger">*</span>
                </label>
                <div className="form-control-wrap">
                  <textarea
                    id="reject-reason"
                    className="form-control"
                    rows={3}
                    placeholder="Enter reason for declining this request (min 5 characters)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  {reason.trim().length > 0 && reason.trim().length < 5 && (
                    <span className="text-danger small mt-1 d-block">
                      Reason must be at least 5 characters (currently {reason.trim().length})
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="admin-note">
                    Admin Note <span className="text-muted small">(Optional)</span>
                  </label>
                  <div className="form-control-wrap">
                    <input
                      type="text"
                      id="admin-note"
                      className="form-control"
                      placeholder="Internal approval note or comment"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                {type === "withdrawal" && (
                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="payment-ref">
                      Payment / Transfer Reference <span className="text-muted small">(Optional)</span>
                    </label>
                    <div className="form-control-wrap">
                      <input
                        type="text"
                        id="payment-ref"
                        className="form-control"
                        placeholder="External bank transfer reference or session ID"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="alert alert-warning d-flex align-items-center mb-4 py-2">
              <Icon name="shield-alert" className="fs-3 me-2" />
              <span className="small">
                This finance operation requires 2-factor authorization. An OTP code will be dispatched to your administrator email.
              </span>
            </div>

            <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
              <li>
                <Button
                  color={isReject ? "danger" : "primary"}
                  size="md"
                  disabled={isSendingOtp || (isReject && reason.trim().length < 5)}
                  onClick={handleRequestOtp}
                >
                  {isSendingOtp ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="send" className="me-1" />
                      <span>Request Authorization OTP</span>
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
          </div>
        ) : (
          <div>
            <div className="nk-modal-head mb-3">
              <h5 className="title">Enter Authorization OTP</h5>
              <p className="text-soft">
                We sent a 6-digit verification code to your email to authorize{" "}
                <strong className={isReject ? "text-danger" : "text-success"}>
                  {isReject ? "REJECTING" : "APPROVING"}
                </strong>{" "}
                this {typeLabel.toLowerCase()} request for{" "}
                <strong>{formatter("NGN").format(item?.amount || 0)}</strong>.
              </p>
            </div>

            <form onSubmit={handleFinalSubmit}>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="action-otp">
                  6-Digit Security OTP
                </label>
                <div className="form-control-wrap">
                  <input
                    type="text"
                    id="action-otp"
                    className="form-control form-control-lg text-center fw-bold"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="text-soft small">
                  {canResend ? (
                    <span className="text-success">Didn't receive code?</span>
                  ) : (
                    <span>Resend code in {countdown}s</span>
                  )}
                </span>
                <Button
                  color="link"
                  size="sm"
                  className="p-0"
                  disabled={!canResend || isSendingOtp}
                  onClick={handleResendOtp}
                >
                  {isSendingOtp ? "Sending..." : "Resend OTP"}
                </Button>
              </div>

              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                <li>
                  <Button
                    color={isReject ? "danger" : "success"}
                    size="md"
                    type="submit"
                    disabled={submitting || otp.trim().length !== 6}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check-circle" className="me-1" />
                        <span>Confirm & {isReject ? "Reject" : "Approve"}</span>
                      </>
                    )}
                  </Button>
                </li>
                <li>
                  <Button
                    color="light"
                    size="md"
                    outline
                    onClick={() => setStep(1)}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                </li>
              </ul>
            </form>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
