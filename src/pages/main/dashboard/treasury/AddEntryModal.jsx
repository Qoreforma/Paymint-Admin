import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter, Spinner } from "reactstrap";
import { Button, Col, Row, Icon } from "../../../../components/Component";
import { useAddTreasuryEntry, useUpdateTreasuryEntry } from "../../../../api/treasury";
import toast from "react-hot-toast";

const ENTRY_TYPE_INFO = {
  EXPENSE: {
    title: "Operational Expense",
    desc: "Day-to-day business running costs (hosting, salaries, marketing, ads). Deducted directly from transaction gross profit to calculate True Net Profit.",
    impactBadge: "Deducts from Net Profit",
    badgeClass: "badge-danger",
    alertClass: "alert-danger",
    icon: "trend-down",
  },
  CAPITAL_INJECTION: {
    title: "Capital Injection / Funding",
    desc: "Actual liquid funds deposited to fund provider balances (e.g. ClubKonnect, SafeHaven, VTPass) or bank accounts. Directly increases Platform Liquidity & Available Cash.",
    impactBadge: "Increases Liquid Cash",
    badgeClass: "badge-success",
    alertClass: "alert-success",
    icon: "coins",
  },
  CAPITAL_EXPENSE: {
    title: "Out-of-Pocket Expense (Sunk Capital)",
    desc: "Upfront capital spent out-of-pocket to bootstrap/build the platform (domain purchase, app setup, company incorporation). Adds to Total Project Worth without reducing monthly operational profit.",
    impactBadge: "Adds to Project Valuation",
    badgeClass: "badge-warning",
    alertClass: "alert-warning",
    icon: "property-add",
  },
};

const AddEntryModal = ({ isOpen, toggle, entry = null }) => {
  const [type, setType] = useState("EXPENSE");
  const [category, setCategory] = useState("HOSTING");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const isEditMode = Boolean(entry && (entry._id || entry.id));
  const { mutate: addEntry, isLoading: isAdding } = useAddTreasuryEntry();
  const { mutate: updateEntry, isLoading: isUpdating } = useUpdateTreasuryEntry();
  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (entry && isOpen) {
      setType(entry.type || "EXPENSE");
      setCategory(entry.category || "HOSTING");
      setProvider(entry.provider || "");
      setAmount(entry.amount ? String(entry.amount) : "");
      setDescription(entry.description || "");
    } else if (!entry && isOpen) {
      setType("EXPENSE");
      setCategory("HOSTING");
      setProvider("");
      setAmount("");
      setDescription("");
    }
  }, [entry, isOpen]);

  const handleSave = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    const payload = {
      type,
      category,
      provider,
      amount: Number(amount),
      description,
    };

    if (isEditMode) {
      const id = entry._id || entry.id;
      updateEntry(
        { id, ...payload },
        {
          onSuccess: () => {
            toast.success("Treasury entry updated successfully");
            toggle();
          },
          onError: (err) => {
            toast.error(err?.response?.data?.message || err?.message || "Failed to update entry");
          },
        }
      );
    } else {
      addEntry(payload, {
        onSuccess: () => {
          toast.success("Treasury entry recorded successfully");
          setAmount("");
          setDescription("");
          setProvider("");
          toggle();
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || err?.message || "Failed to record entry");
        },
      });
    }
  };

  const getCategories = () => {
    if (type === "EXPENSE") {
      return ["HOSTING", "DOMAIN", "ADS", "SALARIES", "MARKETING", "OTHER"];
    } else if (type === "CAPITAL_EXPENSE") {
      return ["HOSTING", "DOMAIN", "ADS", "MARKETING", "OTHER"];
    } else {
      return ["PROVIDER_FUNDING", "OTHER"];
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered" size="md">
      <ModalHeader toggle={toggle}>
        {isEditMode ? "Edit Treasury Entry" : "Record Treasury Entry"}
      </ModalHeader>
      <ModalBody>
        <form className="form-validate is-alter">
          <Row className="gy-4">
            <Col sm="12">
              <div className="form-group">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label mb-0" htmlFor="type">
                    Entry Type
                  </label>
                  <span className="text-muted small">
                    {type === "EXPENSE"
                      ? "OPEX (Recurring)"
                      : type === "CAPITAL_INJECTION"
                      ? "Working Capital (Liquid)"
                      : "Capex (Sunk Startup Cost)"}
                  </span>
                </div>
                <div className="form-control-wrap">
                  <select
                    className="form-control"
                    id="type"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setCategory(e.target.value === "EXPENSE" ? "HOSTING" : e.target.value === "CAPITAL_EXPENSE" ? "DOMAIN" : "PROVIDER_FUNDING");
                    }}
                  >
                    <option value="EXPENSE">Operational Expense (OPEX)</option>
                    <option value="CAPITAL_INJECTION">Capital Injection / Funding (Liquid Cash)</option>
                    <option value="CAPITAL_EXPENSE">Out of Pocket Expense (Sunk Capital)</option>
                  </select>
                </div>

                {ENTRY_TYPE_INFO[type] && (
                  <div className={`alert ${ENTRY_TYPE_INFO[type].alertClass} alert-dim mt-2 py-2 px-3`}>
                    <div className="d-flex align-items-start gap-2">
                      <Icon name={ENTRY_TYPE_INFO[type].icon} className="fs-5 mt-1" />
                      <div className="small w-100">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <strong className="text-dark">{ENTRY_TYPE_INFO[type].title}</strong>
                          <span className={`badge badge-sm ${ENTRY_TYPE_INFO[type].badgeClass} badge-dim`}>
                            {ENTRY_TYPE_INFO[type].impactBadge}
                          </span>
                        </div>
                        <div className="text-soft">{ENTRY_TYPE_INFO[type].desc}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Col>

            <Col sm="12">
              <div className="form-group">
                <label className="form-label" htmlFor="category">
                  Category
                </label>
                <div className="form-control-wrap">
                  <select
                    className="form-control"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {getCategories().map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Col>

            {category === "PROVIDER_FUNDING" && (
              <Col sm="12">
                <div className="form-group">
                  <label className="form-label" htmlFor="provider">
                    Provider Name (e.g. Clubkonnect)
                  </label>
                  <div className="form-control-wrap">
                    <input
                      type="text"
                      className="form-control"
                      id="provider"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      placeholder="Enter provider name"
                    />
                  </div>
                </div>
              </Col>
            )}

            <Col sm="12">
              <div className="form-group">
                <label className="form-label" htmlFor="amount">
                  Amount (NGN)
                </label>
                <div className="form-control-wrap">
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
            </Col>

            <Col sm="12">
              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Description / Note
                </label>
                <div className="form-control-wrap">
                  <textarea
                    className="form-control"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of this entry"
                    rows={2}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </form>
      </ModalBody>
      <ModalFooter className="bg-light">
        <Button color="light" onClick={toggle} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSave}
          disabled={isLoading}
          style={{
            minWidth: "115px",
            height: "38px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" color="light" className="me-1" />
              <span>{isEditMode ? "Updating..." : "Saving..."}</span>
            </>
          ) : isEditMode ? (
            "Update Entry"
          ) : (
            "Save Entry"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddEntryModal;
