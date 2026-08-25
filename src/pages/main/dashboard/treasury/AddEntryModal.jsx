import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import { Button, Col, Row } from "../../../../components/Component";
import { useAddTreasuryEntry } from "../../../../api/treasury";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/spinner";

const AddEntryModal = ({ isOpen, toggle }) => {
  const [type, setType] = useState("EXPENSE");
  const [category, setCategory] = useState("HOSTING");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const { mutate, isLoading } = useAddTreasuryEntry();

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

    mutate(payload, {
      onSuccess: () => {
        toast.success("Treasury entry recorded successfully");
        setAmount("");
        setDescription("");
        setProvider("");
        toggle();
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to record entry");
      },
    });
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
      <ModalHeader toggle={toggle}>Record Treasury Entry</ModalHeader>
      <ModalBody>
        <form className="form-validate is-alter">
          <Row className="gy-4">
            <Col sm="12">
              <div className="form-group">
                <label className="form-label" htmlFor="type">
                  Entry Type
                </label>
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
                    <option value="EXPENSE">Operational Expense</option>
                    <option value="CAPITAL_INJECTION">Capital Injection / Funding</option>
                    <option value="CAPITAL_EXPENSE">Out of Pocket Expense (Sunk Capital)</option>
                  </select>
                </div>
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
        <Button color="light" onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : "Save Entry"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddEntryModal;
