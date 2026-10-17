import React, { useState, useEffect } from "react";
import { Modal, ModalBody, Spinner } from "reactstrap";
import { useUpdateTransaction, useSendTransactionOtp } from "../../../../../api/transactions";
import { Button, Col, Icon, Row } from "../../../../../components/Component";
import { toast } from "react-hot-toast";

const UpdateStatusModal = ({ modal, closeModal, editedId, status }) => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [note, setNote] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { mutate: sendOtp, isLoading: isSendingOtp } = useSendTransactionOtp(editedId);
  const { mutate: updateTransaction, isLoading: isUpdating } = useUpdateTransaction(editedId, status);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (modal) {
      setStep(1);
      setOtp("");
      setNote("");
      setCountdown(60);
      setCanResend(false);
    }
  }, [modal]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (modal && step === 2 && countdown > 0) {
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
  }, [modal, step, countdown]);

  const handleClose = () => {
    setStep(1);
    setOtp("");
    setNote("");
    if (typeof closeModal === "function") {
      closeModal(false);
    }
  };

  const handleRequestOtp = (e) => {
    if (e) e.preventDefault();
    const actionLabel = status === "successful" ? "approve" : status === "reversed" ? "reverse" : "reject";
    sendOtp(
      { transactionID: editedId, action: actionLabel, status },
      {
        onSuccess: () => {
          setStep(2);
          setCountdown(60);
          setCanResend(false);
        },
      }
    );
  };

  const handleResendOtp = (e) => {
    if (e) e.preventDefault();
    if (!canResend || isSendingOtp) return;
    const actionLabel = status === "successful" ? "approve" : status === "reversed" ? "reverse" : "reject";
    sendOtp(
      { transactionID: editedId, action: actionLabel, status },
      {
        onSuccess: () => {
          setCountdown(60);
          setCanResend(false);
        },
      }
    );
  };

  const handleSubmit = (e) => {
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

    updateTransaction(
      { transactionID: editedId, status, otp: cleanOtp, note: note.trim() },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
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
          <Icon name="cross-sm" />
        </a>

        <div className="p-2">
          {step === 1 ? (
            <div>
              <div className="nk-modal-head mb-3">
                <h5 className="title">Confirm Status Update</h5>
                <p className="text-soft">
                  Are you sure you want to mark this transaction as{" "}
                  <span className={`fw-bold text-${status === "successful" ? "success" : "danger"} text-uppercase`}>
                    {status}
                  </span>
                  ?
                </p>
              </div>

              <div className="form-group mb-4">
                <label className="form-label" htmlFor="note">
                  Admin Note <span className="text-muted small">(Optional)</span>
                </label>
                <div className="form-control-wrap">
                  <input
                    type="text"
                    id="note"
                    className="form-control"
                    placeholder="Reason or note for this status update"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="alert alert-warning d-flex align-items-center mb-4">
                <Icon name="shield-alert" className="fs-3 me-2" />
                <span className="small">
                  This action requires 2-factor OTP verification. An authorization code will be sent to your admin email.
                </span>
              </div>

              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                <li>
                  <Button
                    color="primary"
                    size="md"
                    disabled={isSendingOtp}
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
                  We sent a 6-digit verification code to your email. Enter it below to authorize changing status to{" "}
                  <span className="fw-bold text-uppercase">{status}</span>.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="otp">
                    6-Digit OTP Code
                  </label>
                  <div className="form-control-wrap">
                    <input
                      type="text"
                      id="otp"
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
                      color={status === "successful" ? "success" : "primary"}
                      size="md"
                      type="submit"
                      disabled={isUpdating || otp.trim().length !== 6}
                    >
                      {isUpdating ? (
                        <>
                          <Spinner size="sm" className="me-1" />
                          <span>Authorizing...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="check-circle" className="me-1" />
                          <span>Authorize Status Update</span>
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
                      disabled={isUpdating}
                    >
                      Back
                    </Button>
                  </li>
                </ul>
              </form>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default UpdateStatusModal;
