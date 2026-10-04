import React, { useState } from "react";
import { FormGroup, Label, Input, Badge, Spinner } from "reactstrap";
import { Button, Icon } from "../../../../components/Component";
import { useGetOutage, useSetOutage, useDeleteOutage } from "../../../../api/support";
import "./support.css";

const COMMON_PROVIDERS = [
  { id: "mtn", name: "MTN Nigeria", category: "Telecom / VTU" },
  { id: "airtel", name: "Airtel Nigeria", category: "Telecom / VTU" },
  { id: "glo", name: "Glo Nigeria", category: "Telecom / VTU" },
  { id: "9mobile", name: "9mobile Nigeria", category: "Telecom / VTU" },
  { id: "vtpass", name: "VTPass Gateway", category: "Bill Payment Aggregator" },
  { id: "monnify", name: "Monnify Virtual Accounts", category: "Banking / Funding" },
  { id: "safehaven", name: "SafeHaven MFB", category: "Banking / Transfers" },
  { id: "flutterwave", name: "Flutterwave", category: "Payment Gateway" },
  { id: "reloadly", name: "Reloadly", category: "Gift Cards / International" },
  { id: "nowpayments", name: "NOWPayments", category: "Crypto Gateway" },
];

const ProviderOutageCard = ({ provider, onSelect }) => {
  const { data: outageRes, isLoading } = useGetOutage(provider.id);
  const { mutate: clearOutage, isLoading: isClearing } = useDeleteOutage();

  const isOutageActive = outageRes?.data?.active ?? false;
  const message = outageRes?.data?.message || "";

  return (
    <div className={`outage-provider-card ${isOutageActive ? "active-outage" : ""}`}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h6 className="mb-0 font-weight-bold" style={{ fontSize: "0.92rem" }}>
            {provider.name}
          </h6>
          <span className="text-soft" style={{ fontSize: "0.72rem" }}>
            {provider.category}
          </span>
        </div>
        {isLoading ? (
          <Spinner size="sm" />
        ) : isOutageActive ? (
          <Badge color="danger" pill>
            Outage Active
          </Badge>
        ) : (
          <Badge color="success" pill>
            Operational
          </Badge>
        )}
      </div>

      {isOutageActive && (
        <div className="alert alert-danger py-2 px-3 mb-2" style={{ fontSize: "0.78rem" }}>
          <div className="font-weight-bold mb-1">Customer Alert:</div>
          <div>{message}</div>
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
        {isOutageActive ? (
          <Button
            color="danger"
            size="xs"
            outline
            onClick={() => clearOutage(provider.id)}
            disabled={isClearing}
          >
            {isClearing ? <Spinner size="sm" /> : <span>Clear Outage</span>}
          </Button>
        ) : (
          <Button
            color="primary"
            size="xs"
            outline
            onClick={() => onSelect(provider)}
          >
            <Icon name="alert-circle" className="me-1" />
            <span>Report Outage</span>
          </Button>
        )}
      </div>
    </div>
  );
};

const OutagesManager = () => {
  const [selectedProviderId, setSelectedProviderId] = useState("mtn");
  const [customProvider, setCustomProvider] = useState("");
  const [outageMessage, setOutageMessage] = useState(
    "We are currently experiencing upstream service delays with this provider. Transactions may take longer to process."
  );
  const [ttlHours, setTtlHours] = useState("24");

  const { mutate: setOutage, isLoading: isSetting } = useSetOutage();

  const handleSetOutage = (e) => {
    e.preventDefault();
    const providerKey =
      selectedProviderId === "custom"
        ? customProvider.toLowerCase().trim()
        : selectedProviderId;

    if (!providerKey || !outageMessage.trim()) return;

    const ttlSeconds = parseInt(ttlHours, 10) * 3600;

    setOutage({
      provider: providerKey,
      message: outageMessage.trim(),
      ttlSeconds,
    });
  };

  const handleSelectFromCard = (provider) => {
    setSelectedProviderId(provider.id);
    setOutageMessage(
      `${provider.name} is currently experiencing upstream network instability. Airtime, data or payment services may be temporarily delayed.`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* ── Set Outage Notice Form ── */}
      <div className="card card-bordered mb-4">
        <div className="card-inner">
          <div className="card-title-group mb-3">
            <div className="card-title">
              <h5 className="title">Configure Upstream Provider Outage</h5>
              <p className="text-soft" style={{ fontSize: "0.85rem" }}>
                When an outage is declared, the Minty AI bot proactively notifies customers who ask about transactions with that provider, and frontend banners can warn users before purchase.
              </p>
            </div>
          </div>

          <form onSubmit={handleSetOutage}>
            <div className="row g-3">
              <div className="col-md-4">
                <FormGroup>
                  <Label for="providerSelect" className="form-label font-weight-bold">
                    Target Provider
                  </Label>
                  <Input
                    type="select"
                    id="providerSelect"
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                  >
                    {COMMON_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                    <option value="custom">+ Custom Provider Key</option>
                  </Input>
                </FormGroup>
              </div>

              {selectedProviderId === "custom" && (
                <div className="col-md-4">
                  <FormGroup>
                    <Label for="customProviderKey" className="form-label font-weight-bold">
                      Custom Provider Key
                    </Label>
                    <Input
                      type="text"
                      id="customProviderKey"
                      placeholder="e.g. xixapay, clubkonnect"
                      value={customProvider}
                      onChange={(e) => setCustomProvider(e.target.value)}
                      required
                    />
                  </FormGroup>
                </div>
              )}

              <div className="col-md-4">
                <FormGroup>
                  <Label for="ttlHoursSelect" className="form-label font-weight-bold">
                    Automatic Expiry (TTL)
                  </Label>
                  <Input
                    type="select"
                    id="ttlHoursSelect"
                    value={ttlHours}
                    onChange={(e) => setTtlHours(e.target.value)}
                  >
                    <option value="1">1 Hour</option>
                    <option value="4">4 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="48">48 Hours (2 Days)</option>
                    <option value="72">72 Hours (3 Days)</option>
                  </Input>
                </FormGroup>
              </div>

              <div className="col-12">
                <FormGroup>
                  <Label for="outageMessageInput" className="form-label font-weight-bold">
                    Public Outage Message (Seen by AI Bot & Users)
                  </Label>
                  <Input
                    type="textarea"
                    rows="3"
                    id="outageMessageInput"
                    value={outageMessage}
                    onChange={(e) => setOutageMessage(e.target.value)}
                    required
                  />
                </FormGroup>
              </div>

              <div className="col-12 d-flex justify-content-end">
                <Button color="danger" type="submit" disabled={isSetting}>
                  {isSetting ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Icon name="broadcast" className="me-1" />
                      <span>Publish Outage Notice</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Popular Providers Status Grid ── */}
      <h6 className="overline-title text-primary-alt mb-3">Service Providers Status</h6>
      <div className="outage-grid">
        {COMMON_PROVIDERS.map((provider) => (
          <ProviderOutageCard
            key={provider.id}
            provider={provider}
            onSelect={handleSelectFromCard}
          />
        ))}
      </div>
    </div>
  );
};

export default OutagesManager;
