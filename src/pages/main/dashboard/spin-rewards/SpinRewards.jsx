import React, { useState, useEffect } from "react";
import { Card, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
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
import UserProfileAside from "../settings/UserProfileAside";
import RewardTiers from "./RewardTiers";
import QualificationRules from "./QualificationRules";
import SpinAnalytics from "./SpinAnalytics";
import PayoutQueue from "./PayoutQueue";
import {
  useGetAppSettings,
  useToggleRewardSystem,
  useWipeAllSpinAndWinProgress,
} from "../../../../api/spinRewards";
import { usePermission } from "../../../../utils/usePermission";

const SpinRewardsPage = () => {
  const { hasPermission } = usePermission();
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");

  const { data: settingsData, isLoading: settingsLoading } = useGetAppSettings();
  const { mutate: toggleFlag, isLoading: isToggling } = useToggleRewardSystem();
  const { mutate: wipeProgress, isLoading: isWiping } = useWipeAllSpinAndWinProgress();

  const isRewardSystemEnabled = settingsData?.data?.isRewardSystem ?? false;

  const handleToggle = () => {
    toggleFlag(!isRewardSystemEnabled);
  };

  const handleWipeProgress = () => {
    if (window.confirm("WARNING: This will permanently delete ALL Spin & Win tickets, results, and payouts for ALL users. Reward Tiers and Wheels will NOT be deleted. Core User balances will NOT be affected. Are you absolutely sure you want to reset all test progress?")) {
      wipeProgress();
    }
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
      header.addEventListener("click", function () {
        updateSm(false);
      });
    }
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

  return (
    <React.Fragment>
      <Head title="Spin & Win Reward System"></Head>
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
                <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>
              )}

              {/* Page Header */}
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Spin & Win Rewards</BlockTitle>
                    <BlockDes>
                      <p>
                        Configure milestone-based reward tiers, odds-guaranteed spin wheels,
                        inspect win distributions, and monitor payout fulfillment.
                      </p>
                    </BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent>
                    <div className="toggle-wrap nk-block-tools-toggle">
                      <Button
                        className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                        onClick={() => updateSm(!sm)}
                      >
                        <Icon name="menu-alt-r"></Icon>
                      </Button>
                      <div className={`toggle-expand-content ${sm ? "expanded" : ""}`}>
                        <ul className="nk-block-tools g-3">
                          <li className="nk-block-tools-opt">
                            <Button 
                              color="danger" 
                              outline 
                              onClick={handleWipeProgress} 
                              disabled={isWiping}
                            >
                              <Icon name="trash" />
                              <span>{isWiping ? "Wiping..." : "Reset All Progress"}</span>
                            </Button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              {/* Global Feature Flag Card */}
              <Block className="mb-4">
                <div
                  className={`card card-bordered p-3 ${
                    isRewardSystemEnabled
                      ? "border-success bg-success-dim"
                      : "border-light bg-lighter"
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge ${
                            isRewardSystemEnabled ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {isRewardSystemEnabled ? "ACTIVE" : "INACTIVE"}
                        </span>
                        <h6 className="mb-0 fw-bold">Master Reward System Switch</h6>
                      </div>
                      <p className="text-muted fs-12px mt-1 mb-0">
                        {isRewardSystemEnabled
                          ? "The reward layer is currently live for qualifying users."
                          : "The reward layer is currently turned OFF. No user-facing tickets or notifications will be generated."}
                      </p>
                    </div>

                    {hasPermission("spin_rewards.toggle_flag") && (
                      <div className="custom-control custom-switch custom-control-lg">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="global-reward-toggle"
                          checked={isRewardSystemEnabled}
                          disabled={settingsLoading || isToggling}
                          onChange={handleToggle}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="global-reward-toggle"
                        >
                          {isToggling ? "Updating..." : isRewardSystemEnabled ? "Enabled" : "Disabled"}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </Block>

              {/* Navigation Tabs */}
              <Nav tabs className="mb-3">
                <NavItem>
                  <NavLink
                    className={activeTab === "analytics" ? "active" : ""}
                    onClick={() => setActiveTab("analytics")}
                    style={{ cursor: "pointer" }}
                  >
                    <Icon name="bar-chart" className="me-1"></Icon>
                    <span>Analytics</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "tiers" ? "active" : ""}
                    onClick={() => setActiveTab("tiers")}
                    style={{ cursor: "pointer" }}
                  >
                    <Icon name="target" className="me-1"></Icon>
                    <span>Reward Tiers & Wheels</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "rules" ? "active" : ""}
                    onClick={() => setActiveTab("rules")}
                    style={{ cursor: "pointer" }}
                  >
                    <Icon name="shield-check" className="me-1"></Icon>
                    <span>Qualification Rules</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "payouts" ? "active" : ""}
                    onClick={() => setActiveTab("payouts")}
                    style={{ cursor: "pointer" }}
                  >
                    <Icon name="money" className="me-1"></Icon>
                    <span>Payouts Queue</span>
                  </NavLink>
                </NavItem>
              </Nav>

              {/* Tab Content */}
              <TabContent activeTab={activeTab}>
                <TabPane tabId="analytics">
                  <SpinAnalytics />
                </TabPane>
                <TabPane tabId="tiers">
                  <RewardTiers />
                </TabPane>
                <TabPane tabId="rules">
                  <QualificationRules />
                </TabPane>
                <TabPane tabId="payouts">
                  <PayoutQueue />
                </TabPane>
              </TabContent>
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default SpinRewardsPage;
