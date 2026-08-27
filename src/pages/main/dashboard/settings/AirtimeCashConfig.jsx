import React, { useEffect, useState } from "react";
import { Card } from "reactstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Icon,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import UserProfileAside from "./UserProfileAside";
import { useGetAirtimeCashConfig, useUpdateAirtimeCashConfig } from "../../../../api/settings";
import { usePermission } from "../../../../utils/usePermission";

const AirtimeCashConfigPage = () => {
  const { hasPermission } = usePermission();
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [margin, setMargin] = useState(0);
  const [providerRate, setProviderRate] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const { data, isLoading } = useGetAirtimeCashConfig();
  const { mutate: updateConfig, isLoading: isUpdating } = useUpdateAirtimeCashConfig();

  useEffect(() => {
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      if (!activeTab) {
        setActiveTab(data.data[0].network);
      }
      const currentConfig = activeTab ? data.data.find((c) => c.network === activeTab) : data.data[0];
      if (currentConfig) {
        setNotes(currentConfig.notes ?? "");
        setIsActive(currentConfig.isActive ?? true);
        setMargin(currentConfig.margin ?? 0);
        setProviderRate(currentConfig.providerRate ?? 0);
        setIsDirty(false);
      }
    } else if (data?.data && !Array.isArray(data.data)) {
      setNotes(data.data.notes ?? "");
      setIsActive(data.data.isActive ?? true);
      setMargin(data.data.margin ?? 0);
      setProviderRate(data.data.providerRate ?? 0);
      setIsDirty(false);
    }
  }, [data, activeTab]);

  const handleNotesChange = (value) => {
    setNotes(value);
    setIsDirty(true);
  };

  const handleMarginChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    setMargin(val);
    setIsDirty(true);
  };

  const handleToggle = () => {
    setIsActive((prev) => !prev);
    setIsDirty(true);
  };

  const handleTabChange = (network) => {
    setActiveTab(network);
    const currentConfig = data?.data?.find((c) => c.network === network);
    if (currentConfig) {
      setNotes(currentConfig.notes ?? "");
      setIsActive(currentConfig.isActive ?? true);
      setMargin(currentConfig.margin ?? 0);
      setProviderRate(currentConfig.providerRate ?? 0);
      setIsDirty(false);
    }
  };

  const handleSave = () => {
    updateConfig({ network: activeTab, notes, isActive, margin }, {
      onSuccess: () => setIsDirty(false),
    });
  };

  const viewChange = () => {
    if (window.innerWidth < 990) {
      setMobileView(true);
    } else {
      setMobileView(false);
      updateSm(false);
    }
  };

  useEffect(() => {
    viewChange();
    window.addEventListener("load", viewChange);
    window.addEventListener("resize", viewChange);
    const header = document.getElementsByClassName("nk-header")[0];
    if (header) {
      header.addEventListener("click", () => updateSm(false));
    }
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

  const canEdit = hasPermission("configs.update") || hasPermission("all");

  return (
    <React.Fragment>
      <Head title="Airtime-to-Cash Config" />
      <Content>
        <Card>
          <div className="card-aside-wrap">
            <div
              className={`card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg ${
                sm ? "content-active" : ""
              }`}
            >
              <UserProfileAside updateSm={updateSm} sm={sm} />
            </div>

            <div className="card-inner card-inner-lg">
              {sm && mobileView && (
                <div className="toggle-overlay" onClick={() => updateSm(!sm)} />
              )}

              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Airtime-to-Cash Instructions</BlockTitle>
                    <BlockDes>
                      <p>
                        Configure the instructions shown to users on the Airtime-to-Cash screen.
                        These notes guide users on how to send airtime to the conversion number.
                      </p>
                    </BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent className="align-self-start d-lg-none">
                    <Button
                      className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="menu-alt-r" />
                    </Button>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              <Block>
                {isLoading ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="nk-data data-list">
                    {Array.isArray(data?.data) && data.data.length > 0 && (
                      <div className="d-flex mb-4 gap-2 px-3 pb-2" style={{ borderBottom: "1px solid #e5e9f2", overflowX: "auto" }}>
                        {data.data.map((config) => (
                          <button
                            key={config.network}
                            className={`btn btn-sm ${activeTab === config.network ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleTabChange(config.network)}
                            style={{ minWidth: "80px", borderRadius: "1.5rem" }}
                          >
                            {config.network.split('-')[0].toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Toggle active status */}
                    <div className="data-head">
                      <h6 className="overline-title mb-0">Visibility Settings {activeTab && `(${activeTab.split('-')[0].toUpperCase()})`}</h6>
                    </div>

                    <div className="data-item" style={{ cursor: canEdit ? "pointer" : "default" }}>
                      <div className="data-col">
                        <span className="data-label fw-bold">
                          Show Notes to Users
                          <br />
                          <span className="fw-normal" style={{ fontSize: "12px" }}>
                            When disabled, users will not see the instructions panel
                          </span>
                        </span>
                        <div className="data-value">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="notesActiveToggle"
                              checked={isActive}
                              onChange={handleToggle}
                              disabled={!canEdit}
                              style={{ cursor: canEdit ? "pointer" : "not-allowed", width: "2.5rem", height: "1.25rem" }}
                            />
                            <label
                              className="form-check-label ms-2 fw-medium"
                              htmlFor="notesActiveToggle"
                              style={{ color: isActive ? "#1a7a4a" : "#6c757d" }}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rate & Margin Settings */}
                    <div className="data-head mt-4">
                      <h6 className="overline-title mb-0">Rate & Margin Settings</h6>
                    </div>
                    
                    <div className="p-3 row gy-4">
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label className="form-label text-muted">
                            Provider Rate (%)
                            <span className="d-block fw-normal" style={{ fontSize: "12px" }}>Auto-synced from provider</span>
                          </label>
                          <div className="form-control-wrap">
                            <input
                              type="number"
                              className="form-control"
                              value={providerRate}
                              disabled
                              style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label className="form-label" htmlFor="adminMargin">
                            Profit Margin (%)
                            <span className="d-block fw-normal text-muted" style={{ fontSize: "12px" }}>Your cut per transaction</span>
                          </label>
                          <div className="form-control-wrap">
                            <input
                              type="number"
                              id="adminMargin"
                              className="form-control"
                              value={margin}
                              onChange={handleMarginChange}
                              disabled={!canEdit}
                              min={0}
                              max={100}
                              step={1}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-12 col-lg-4">
                        <div className="form-group">
                          <label className="form-label text-primary">
                            Effective User Rate (%)
                            <span className="d-block fw-normal text-muted" style={{ fontSize: "12px" }}>What users will receive</span>
                          </label>
                          <div className="form-control-wrap">
                            <input
                              type="text"
                              className="form-control border-primary text-primary fw-bold"
                              value={`${Math.max(0, providerRate - margin)}%`}
                              disabled
                              style={{ backgroundColor: "#eff6ff" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes textarea */}
                    <div className="data-head mt-4">
                      <h6 className="overline-title mb-0">Instruction Notes</h6>
                    </div>

                    <div className="p-3">
                      <div className="form-group">
                        <label className="form-label" htmlFor="airtimeCashNotes">
                          User-facing instructions / guide
                        </label>
                        <ReactQuill
                          theme="snow"
                          value={notes}
                          onChange={handleNotesChange}
                          readOnly={!canEdit}
                          placeholder={
                            "Example:\nTo convert your airtime to cash:\n1. Dial *XXX# on your phone\n2. Choose 'Share Airtime'\n3. Send the airtime to 0812 345 6789\n4. Enter your share PIN below"
                          }
                          style={{
                            backgroundColor: "white",
                            minHeight: "150px"
                          }}
                        />
                        <small className="form-text text-muted mt-2 d-block">
                          Rich text formatting is supported. These notes will appear inside an info banner on the Airtime-to-Cash screen.
                        </small>
                      </div>

                      {/* Preview */}
                      {notes && (
                        <div className="mt-3 p-3 rounded" style={{ background: "#fffbeb", border: "1px solid #fcd34d" }}>
                          <div className="d-flex gap-2 align-items-start">
                            <span style={{ fontSize: "1rem", marginTop: "1px" }}>ℹ️</span>
                            <div>
                              <p className="fw-semibold mb-1" style={{ fontSize: "0.8rem", color: "#92400e" }}>
                                How it works — Preview
                              </p>
                              <div 
                                className="mb-0" 
                                style={{ fontSize: "0.8rem", color: "#b45309", lineHeight: "1.6" }}
                                dangerouslySetInnerHTML={{ __html: notes }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {canEdit && (
                        <div className="mt-4">
                          <Button
                            color="primary"
                            size="md"
                            onClick={handleSave}
                            disabled={isUpdating || !isDirty}
                          >
                            {isUpdating ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Icon name="save" className="me-1" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          {isDirty && (
                            <span className="ms-3 text-warning" style={{ fontSize: "0.8rem" }}>
                              ⚠ You have unsaved changes
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Block>
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default AirtimeCashConfigPage;
