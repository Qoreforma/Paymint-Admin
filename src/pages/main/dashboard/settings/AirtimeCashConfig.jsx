import React, { useEffect, useState } from "react";
import { Card } from "reactstrap";
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
  const [isDirty, setIsDirty] = useState(false);

  const { data, isLoading } = useGetAirtimeCashConfig();
  const { mutate: updateConfig, isLoading: isUpdating } = useUpdateAirtimeCashConfig();

  useEffect(() => {
    if (data?.data) {
      setNotes(data.data.notes ?? "");
      setIsActive(data.data.isActive ?? true);
      setIsDirty(false);
    }
  }, [data]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setIsDirty(true);
  };

  const handleToggle = () => {
    setIsActive((prev) => !prev);
    setIsDirty(true);
  };

  const handleSave = () => {
    updateConfig({ notes, isActive }, {
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
                    {/* Toggle active status */}
                    <div className="data-head">
                      <h6 className="overline-title mb-0">Visibility Settings</h6>
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

                    {/* Notes textarea */}
                    <div className="data-head mt-4">
                      <h6 className="overline-title mb-0">Instruction Notes</h6>
                    </div>

                    <div className="p-3">
                      <div className="form-group">
                        <label className="form-label" htmlFor="airtimeCashNotes">
                          User-facing instructions / guide
                        </label>
                        <textarea
                          id="airtimeCashNotes"
                          className="form-control"
                          rows={6}
                          value={notes}
                          onChange={handleNotesChange}
                          disabled={!canEdit}
                          placeholder={
                            "Example:\nTo convert your airtime to cash:\n1. Dial *XXX# on your phone\n2. Choose 'Share Airtime'\n3. Send the airtime to 0812 345 6789\n4. Enter your share PIN below"
                          }
                          style={{
                            resize: "vertical",
                            fontFamily: "inherit",
                            fontSize: "0.875rem",
                            lineHeight: "1.6",
                          }}
                        />
                        <small className="form-text text-muted mt-1 d-block">
                          Plain text or line breaks are supported. These notes will appear inside an info banner on the Airtime-to-Cash screen.
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
                              <p className="mb-0" style={{ fontSize: "0.8rem", color: "#b45309", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                                {notes}
                              </p>
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
