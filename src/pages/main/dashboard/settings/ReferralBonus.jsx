import React, { useEffect, useState } from "react";
import { Card, Modal, ModalBody } from "reactstrap";
import { useGetServiceCharge, useUpdateServiceCharge } from "../../../../api/users/admin";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  Icon,
  RSelect,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import UserProfileAside from "./UserProfileAside";
import { formatter } from "../../../../utils/Utils";
import { useCreateReferralBonus, useEditReferralBonus, useGetReferralBonus, useGetReferralBonusRule, useUpsertReferralBonusRule } from "../../../../api/settings";
const ReferralBonusPage = () => {
  const [sm, updateSm] = useState(false);
  const [editedId, setEditedId] = useState();
  const [mobileView, setMobileView] = useState(false);
  const [modalTab, setModalTab] = useState("1");
  const [modal, setModal] = useState({
    add: false,
    edit: false,
  });

  const { data } = useGetReferralBonus();
  const { mutate: editBonus } = useEditReferralBonus(editedId);
  const { mutate: createBonus } = useCreateReferralBonus();

  // Bonus Rule (todo/reward card)
  const { data: bonusRuleData } = useGetReferralBonusRule();
  const { mutate: upsertRule } = useUpsertReferralBonusRule();
  const activeRule = bonusRuleData?.data;

  const defaultThreeItems = [
    {
      key: "one",
      title: "Complete First Trade",
      description: "Have your referral make their first deposit or trade to earn cash bonus.",
    },
    {
      key: "two",
      title: "Invite Friends & Family",
      description: "Share your exclusive referral link or code across social media and messaging apps.",
    },
    {
      key: "three",
      title: "Earn Instant Cash Rewards",
      description: "Receive your cash bonus credited directly into your Paymint wallet automatically.",
    },
  ];

  const [ruleForm, setRuleForm] = useState({
    amount: "",
    reward: "",
    items: defaultThreeItems,
  });
  const [ruleModal, setRuleModal] = useState(false);

  // Sync rule form when data loads
  useEffect(() => {
    if (activeRule) {
      const reserved = new Set([
        "_id",
        "amount",
        "reward",
        "isActive",
        "createdAt",
        "updatedAt",
        "createdBy",
        "__v",
      ]);
      const extractedItems = Object.entries(activeRule)
        .filter(
          ([k, v]) =>
            !reserved.has(k) &&
            v &&
            typeof v === "object" &&
            ("title" in v || "description" in v)
        )
        .map(([k, v]) => ({
          key: k,
          title: v.title || "",
          description: v.description || "",
        }));

      const items =
        extractedItems.length > 0 ? extractedItems : defaultThreeItems;

      setRuleForm({
        amount: activeRule.amount ?? "",
        reward: activeRule.reward ?? "",
        items,
      });
    }
  }, [activeRule]);

  const handleRuleItemChange = (index, field, value) => {
    setRuleForm((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const numberWords = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

  const handleAddRuleItem = () => {
    setRuleForm((prev) => {
      const nextKey =
        numberWords[prev.items.length] || `object${prev.items.length + 1}`;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            key: nextKey,
            title: "",
            description: "",
          },
        ],
      };
    });
  };

  const handleRemoveRuleItem = (index) => {
    setRuleForm((prev) => {
      if (prev.items.length <= 1) return prev;
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      };
    });
  };

  const [formData, setFormData] = useState({
    name: "",
    value: "",
    type: "",
    threshold: "",
  });

  const editRefBonus = (e) => {
    e.preventDefault();

    let data = {
      name: e.target.name.value,
      value: e.target.value.value,
      bonusType: formData.type,
      threshold: e.target.threshold.value,
    };

    editBonus(data);
    closeModal();
  };

  const createRefBonus = (e) => {
    e.preventDefault();

    let data = {
      name: e.target.name.value,
      value: e.target.value.value,
      bonusType: formData.type,
      threshold: e.target.threshold.value,
    };

    createBonus(data);
    closeModal();
  };

  const onEditClick = (id) => {
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          name: item.name,
          value: item.value,
          type: item.bonusType,
          threshold: item.threshold,
        });
      }
    });
    setEditedId(id);
    setModal({
      add: false,
      edit: true,
    });
  };

  const closeModal = () => {
    setModal({
      add: false,
      edit: false,
    });

    setFormData({
      name: "",
      value: "",
      type: "",
      threshold: "",
    });
  };

  const saveRuleForm = (e) => {
    e.preventDefault();
    const cleanItems = ruleForm.items.map((it, idx) => ({
      key: (it.key || "").trim() || (idx === 0 ? "todo" : `field${idx + 1}`),
      title: (it.title || "").trim(),
      description: (it.description || "").trim(),
    }));

    upsertRule({
      amount: Number(ruleForm.amount),
      reward: Number(ruleForm.reward),
      items: cleanItems,
    });
    setRuleModal(false);
  };

  // function to change the design view under 990 px
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
    document.getElementsByClassName("nk-header")[0].addEventListener("click", function () {
      updateSm(false);
    });
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

  return (
    <React.Fragment>
      <Head title="Settings"></Head>
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
              {sm && mobileView && <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>}
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Referral Bonus</BlockTitle>
                    <BlockDes>
                      <p>Details associated with paymint Referral Bonus.</p>
                    </BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent className="align-self-start d-lg-none">
                    <Button
                      className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="menu-alt-r"></Icon>
                    </Button>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">paymint Bonuses</h6>
                      <div onClick={() => setModal({ add: true, edit: false })}>
                        <a href="#edit" onClick={(e) => e.preventDefault()} className="text-primary">
                          Create
                        </a>
                      </div>
                    </BlockBetween>
                  </div>

                  {data?.data?.map((item, index) => (
                    <div key={index} className="data-item" onClick={() => onEditClick(item?._id)}>
                      <div className="data-col">
                        <span className="data-label fw-bold ccap">
                          {item?.name}
                          <br />
                          <span className="fw-normal" style={{ fontSize: "14px" }}>
                            Threshold: {item?.threshold?.toLocaleString()}
                          </span>
                        </span>
                        {item?.bonusType === "flat" ? (
                          <span className="data-value">{formatter("NGN").format(item?.value)}</span>
                        ) : (
                          <span className="data-value">{item?.value}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Block>

              {/* ── Referral Bonus Rule (Todo + Reward) ── */}
              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">Referral Bonus Rule</h6>
                      <a
                        href="#edit-rule"
                        onClick={(e) => {
                          e.preventDefault();
                          setRuleModal(true);
                        }}
                        className="text-primary"
                      >
                        {activeRule ? "Edit" : "Configure"}
                      </a>
                    </BlockBetween>
                  </div>

                  {activeRule ? (
                    <div>
                      <div className="data-item">
                        <div className="data-col">
                          <span className="data-label fw-bold">Bonus Parameters</span>
                        </div>
                        <div className="data-col data-col-end" style={{ gap: "24px", display: "flex", alignItems: "center" }}>
                          <span>
                            <span className="text-soft" style={{ fontSize: "12px" }}>Bonus Amount</span>
                            <br />
                            <strong>{formatter("NGN").format(activeRule.amount)}</strong>
                          </span>
                          <span>
                            <span className="text-soft" style={{ fontSize: "12px" }}>Reward Value</span>
                            <br />
                            <strong>{formatter("NGN").format(activeRule.reward)}</strong>
                          </span>
                        </div>
                      </div>

                      {Object.entries(activeRule)
                        .filter(
                          ([k, v]) =>
                            ![
                              "_id",
                              "amount",
                              "reward",
                              "isActive",
                              "createdAt",
                              "updatedAt",
                              "createdBy",
                              "__v",
                            ].includes(k) &&
                            v &&
                            typeof v === "object" &&
                            ("title" in v || "description" in v)
                        )
                        .map(([k, v], idx) => (
                          <div key={k || idx} className="data-item border-top">
                            <div className="data-col">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span
                                  className="badge badge-dim bg-primary font-monospace"
                                  style={{ textTransform: "none", fontSize: "11px" }}
                                >
                                  {k}
                                </span>
                                <span className="data-label fw-bold mb-0">
                                  {v.title || "—"}
                                </span>
                              </div>
                              <span
                                className="data-value text-muted"
                                style={{ fontSize: "13px", maxWidth: "80%" }}
                              >
                                {v.description || "—"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="data-item text-center py-3">
                      <span className="text-muted" style={{ fontSize: "13px" }}>No bonus rule configured yet.</span>
                    </div>
                  )}
                </div>
              </Block>

              {/* ── Bonus Rule Modal ── */}
              <Modal isOpen={ruleModal} className="modal-dialog-centered" size="lg" toggle={() => setRuleModal(false)}>
                <a
                  href="#dropdownitem"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setRuleModal(false);
                  }}
                  className="close"
                >
                  <Icon name="cross-sm"></Icon>
                </a>
                <ModalBody>
                  <div className="p-2">
                    <h5 className="title">Referral Bonus Rule</h5>
                    <p className="text-soft" style={{ fontSize: "13px" }}>
                      Configure the bonus amount, reward value, and dynamic objects (e.g. <code>todo</code>, <code>friend</code>, <code>fields</code>) returned to the client and displayed on the referral terms page.
                    </p>
                    <form onSubmit={saveRuleForm} className="mt-4">
                      <Row className="g-3">
                        <Col md="6">
                          <div className="form-group">
                            <label className="form-label" htmlFor="rule-amount">Bonus Amount (₦)</label>
                            <input
                              id="rule-amount"
                              className="form-control"
                              type="number"
                              min="0"
                              value={ruleForm.amount}
                              onChange={(e) => setRuleForm((f) => ({ ...f, amount: e.target.value }))}
                              placeholder="e.g. 1000"
                              required
                            />
                          </div>
                        </Col>
                        <Col md="6">
                          <div className="form-group">
                            <label className="form-label" htmlFor="rule-reward">Reward (₦)</label>
                            <input
                              id="rule-reward"
                              className="form-control"
                              type="number"
                              min="0"
                              value={ruleForm.reward}
                              onChange={(e) => setRuleForm((f) => ({ ...f, reward: e.target.value }))}
                              placeholder="e.g. 500"
                              required
                            />
                          </div>
                        </Col>

                        <Col md="12">
                          <div className="d-flex align-items-center justify-content-between mt-3 mb-2">
                            <div>
                              <h6 className="title mb-0" style={{ fontSize: "14px" }}>Rule Objects &amp; Fields</h6>
                              <span className="text-soft" style={{ fontSize: "12px" }}>
                                Add objects like <code>todo</code>, <code>friend</code>, <code>fields</code>, etc. Each object has a key name, title, and description.
                              </span>
                            </div>
                            <Button
                              type="button"
                              color="primary"
                              size="sm"
                              outline
                              onClick={handleAddRuleItem}
                            >
                              <Icon name="plus"></Icon>
                              <span>Add Object</span>
                            </Button>
                          </div>
                        </Col>

                        {ruleForm.items.map((item, index) => (
                          <Col md="12" key={index}>
                            <div className="p-3 border rounded bg-light">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="fw-bold text-primary" style={{ fontSize: "13px" }}>
                                  Object #{index + 1}
                                </span>
                                {ruleForm.items.length > 1 && (
                                  <Button
                                    type="button"
                                    color="danger"
                                    size="xs"
                                    outline
                                    onClick={() => handleRemoveRuleItem(index)}
                                  >
                                    <Icon name="trash"></Icon>
                                    <span>Remove</span>
                                  </Button>
                                )}
                              </div>
                              <Row className="g-2">
                                <Col md="4">
                                  <div className="form-group mb-2">
                                    <label className="form-label" style={{ fontSize: "12px" }}>
                                      Field / Key Name
                                    </label>
                                    <input
                                      className="form-control form-control-sm font-monospace"
                                      type="text"
                                      value={item.key}
                                      onChange={(e) => handleRuleItemChange(index, "key", e.target.value)}
                                      placeholder="e.g. todo, friend, fields"
                                      required
                                    />
                                    <span className="text-muted" style={{ fontSize: "10px" }}>
                                      API key: <code>data.{item.key || "..."}</code>
                                    </span>
                                  </div>
                                </Col>
                                <Col md="8">
                                  <div className="form-group mb-2">
                                    <label className="form-label" style={{ fontSize: "12px" }}>
                                      Title
                                    </label>
                                    <input
                                      className="form-control form-control-sm"
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => handleRuleItemChange(index, "title", e.target.value)}
                                      placeholder="e.g. Complete First Trade"
                                      required
                                    />
                                  </div>
                                </Col>
                                <Col md="12">
                                  <div className="form-group mb-0">
                                    <label className="form-label" style={{ fontSize: "12px" }}>
                                      Description
                                    </label>
                                    <textarea
                                      className="form-control form-control-sm"
                                      rows={2}
                                      value={item.description}
                                      onChange={(e) => handleRuleItemChange(index, "description", e.target.value)}
                                      placeholder="e.g. Have your referral make their first trade..."
                                      required
                                    />
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        ))}

                        <Col size="12">
                          <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2 mt-3">
                            <li>
                              <Button type="submit" color="primary" size="lg">Save Rule</Button>
                            </li>
                            <li>
                              <a
                                href="#dropdownitem"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  setRuleModal(false);
                                }}
                                className="link link-light"
                              >
                                Cancel
                              </a>
                            </li>
                          </ul>
                        </Col>
                      </Row>
                    </form>
                  </div>
                </ModalBody>
              </Modal>

              <Modal isOpen={modal.edit} className="modal-dialog-centered" size="lg" toggle={() => closeModal()}>
                <a
                  href="#dropdownitem"
                  onClick={(ev) => {
                    ev.preventDefault();
                    closeModal();
                  }}
                  className="close"
                >
                  <Icon name="cross-sm"></Icon>
                </a>
                <ModalBody>
                  <div className="p-2">
                    <h5 className="title">
                      Update <span className="ccap">{formData?.name} </span>Bonus
                    </h5>
                    <div className="tab-content mt-4">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <form onSubmit={editRefBonus}>
                          <Row className="gy-4">
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="name">
                                  Name
                                </label>
                                <input
                                  id="name"
                                  className="form-control"
                                  name="name"
                                  defaultValue={formData.name}
                                  placeholder="Enter Name"
                                  type="text"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="value">
                                  Value
                                </label>
                                <input
                                  id="value"
                                  className="form-control"
                                  name="value"
                                  defaultValue={formData.value}
                                  placeholder="Enter Bonus Value"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="full-name">
                                  Type
                                </label>
                                <RSelect
                                  options={[
                                    { label: "Flat", value: "flat" },
                                    { label: "Percentage", value: "percentage" },
                                  ]}
                                  value={{
                                    label: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
                                    value: formData.type,
                                  }}
                                  onChange={(e) => setFormData({ ...formData, type: e.value })}
                                  placeholder="Select Type"
                                  isSearchable={false}
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="threshold">
                                  Threshold
                                </label>
                                <input
                                  id="threshold"
                                  className="form-control"
                                  name="threshold"
                                  defaultValue={formData.threshold}
                                  placeholder="Enter Threshold Value"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>

                            <Col size="12">
                              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                                <li>
                                  <Button type="submit" color="primary" size="lg">
                                    Update
                                  </Button>
                                </li>
                                <li>
                                  <a
                                    href="#dropdownitem"
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
                          </Row>
                        </form>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </Modal>

              <Modal isOpen={modal.add} className="modal-dialog-centered" size="lg" toggle={() => closeModal()}>
                <a
                  href="#dropdownitem"
                  onClick={(ev) => {
                    ev.preventDefault();
                    closeModal();
                  }}
                  className="close"
                >
                  <Icon name="cross-sm"></Icon>
                </a>
                <ModalBody>
                  <div className="p-2">
                    <h5 className="title">Create Bonus</h5>
                    <div className="tab-content mt-4">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <form onSubmit={createRefBonus}>
                          <Row className="gy-4">
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="name">
                                  Name
                                </label>
                                <input
                                  id="name"
                                  className="form-control"
                                  name="name"
                                  placeholder="Enter Name"
                                  type="text"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="value">
                                  Value
                                </label>
                                <input
                                  id="value"
                                  className="form-control"
                                  name="value"
                                  placeholder="Enter Bonus Value"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="full-name">
                                  Type
                                </label>
                                <RSelect
                                  options={[
                                    { label: "Flat", value: "flat" },
                                    { label: "Percentage", value: "percentage" },
                                  ]}
                                  value={{
                                    label: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
                                    value: formData.type,
                                  }}
                                  onChange={(e) => setFormData({ ...formData, type: e.value })}
                                  placeholder="Select Type"
                                  isSearchable={false}
                                />
                              </div>
                            </Col>
                            <Col md="6">
                              <div className="form-group">
                                <label className="form-label" htmlFor="threshold">
                                  Threshold
                                </label>
                                <input
                                  id="threshold"
                                  className="form-control"
                                  name="threshold"
                                  placeholder="Enter Threshold Value"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  type="text"
                                  inputmode="decimal"
                                />
                              </div>
                            </Col>

                            <Col size="12">
                              <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                                <li>
                                  <Button type="submit" color="primary" size="lg">
                                    Create
                                  </Button>
                                </li>
                                <li>
                                  <a
                                    href="#dropdownitem"
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
                          </Row>
                        </form>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </Modal>
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default ReferralBonusPage;
