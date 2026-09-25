import React, { useState } from "react";
import {
  Button,
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  UncontrolledDropdown,
} from "reactstrap";
import {
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  BlockDes,
} from "../../../../components/Component";

import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useFinanceUser,
  useGetSingleUser,
  useUpdateUserStatus,
  useMarkAsFraud,
  useBlacklistUser,
  useUpdateUserType,
} from "../../../../api/users/user";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import FaqTable from "../faq/faqTable";
import { TransactionTable } from "../transactions/table";
import WithdrawalTable from "../wallet/table";
import AddModal from "./AddModal";
import UserTypeModal from "./userTypeModal";
import Details from "./details/details";
import ReferralUserList from "./details/referral-table";
import { formatter } from "../../../../utils/Utils";
import GiftcardTable from "../giftcards/table";
import WalletTxnTable from "../wallet/wallet-txn-table";
import { useGetAllTransactions, useGetWalletTransactions } from "../../../../api/transactions";
import { ServiceTransactionTable } from "../transactions/service-txns-table";
import { useGetGiftcardTransactions } from "../../../../api/giftcard";
import { useGetAssetsTransactions } from "../../../../api/assets";
import AssetsTable from "../assets/table";
import { usePermission } from "../../../../utils/usePermission";
import SendAnnouncementModal from "./SendAnnouncement";
import { useCreateAnnouncement } from "../../../../api/announcement";

const UserDetailsPage = () => {
  const { hasPermission } = usePermission();

  const [selected, setSelected] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "details";

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const channel = searchParams.get("channel") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const { mutate: createAnnouncement } = useCreateAnnouncement();

  // Wallet Transactions
  const { isLoading: fetchingTransactions, data: userWalletTransactions } = useGetWalletTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    startDate,
    endDate,
    userId,
  );

  //  Service Transactions
  const { isLoading: fetchingServiceTxns, data: userServiceTransactions } = useGetAllTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    channel,
    startDate,
    endDate,
    userId,
  );

  const { isLoading: fetchingGiftcards, data: giftcards } = useGetGiftcardTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    channel,
    startDate,
    endDate,
    userId,
  );

  const { isLoading: fetchingAssets, data: assets } = useGetAssetsTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    channel,
    startDate,
    endDate,
    userId,
  );

  const { data: user, isLoading } = useGetSingleUser(userId);

  const { mutate: financeUser } = useFinanceUser(userId);
  const { mutate: updateUserStatus } = useUpdateUserStatus(userId);
  const { mutate: markAsFraud } = useMarkAsFraud(userId);
  const { mutate: toggleBlacklist } = useBlacklistUser(userId);
  const { mutate: updateUserType } = useUpdateUserType(userId);

  const copyAccountDetails = (id, data) => {
    let account = data?.find((item) => item?._id === id);
    if (account) {
      let text = `Account Name: ${account?.accountName}
                  Account Number: ${account?.accountNumber}
                  Bank Name: ${account.bankName}`;

      navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    }
  };

  const ActionOptions = ({ id }) => (
    <ul className="nk-tb-actions gx-1 my-n1">
      <li>
        <UncontrolledDropdown>
          <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
            <Icon name="more-h"></Icon>
          </DropdownToggle>
          <DropdownMenu end>
            <ul className="link-list-opt no-bdr">
              <li>
                <DropdownItem
                  tag="a"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    copyAccountDetails(id, user?.data?.bankAccounts);
                  }}
                >
                  <Icon name="copy"></Icon>
                  <span>Copy details</span>
                </DropdownItem>
              </li>
            </ul>
          </DropdownMenu>
        </UncontrolledDropdown>
      </li>
    </ul>
  );

  const StaticAccActionOptions = ({ id }) => (
    <ul className="nk-tb-actions gx-1 my-n1">
      <li>
        <UncontrolledDropdown>
          <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
            <Icon name="more-h"></Icon>
          </DropdownToggle>
          <DropdownMenu end>
            <ul className="link-list-opt no-bdr">
              <li>
                <DropdownItem
                  tag="a"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    copyAccountDetails(id, user?.data?.staticAccount);
                  }}
                >
                  <Icon name="copy"></Icon>
                  <span>Copy details</span>
                </DropdownItem>
              </li>
            </ul>
          </DropdownMenu>
        </UncontrolledDropdown>
      </li>
    </ul>
  );

  const VirtualAcActionOptions = ({ id }) => (
    <ul className="nk-tb-actions gx-1 my-n1">
      <li>
        <UncontrolledDropdown>
          <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
            <Icon name="more-h"></Icon>
          </DropdownToggle>
          <DropdownMenu end>
            <ul className="link-list-opt no-bdr">
              <li>
                <DropdownItem
                  tag="a"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    copyAccountDetails(id, user?.data?.virtualAccounts);
                  }}
                >
                  <Icon name="copy"></Icon>
                  <span>Copy details</span>
                </DropdownItem>
              </li>
            </ul>
          </DropdownMenu>
        </UncontrolledDropdown>
      </li>
    </ul>
  );

  const RestrictActionOptions = ({ id }) => (
    <ul className="nk-tb-actions gx-1 my-n1">
      <li>
        <UncontrolledDropdown>
          {(hasPermission("users.manage_wallet") ||
            hasPermission("users.suspend") ||
            hasPermission("users.update")) && (
            <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
              <Icon name="more-v"></Icon>
            </DropdownToggle>
          )}
          <DropdownMenu end>
            <ul className="link-list-opt no-bdr">
              {hasPermission("users.manage_wallet") && (
                <li>
                  <DropdownItem
                    tag="a"
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      toggleModal("finance");
                    }}
                  >
                    <Icon name="tranx-fill" /> <span>Finance User</span>
                  </DropdownItem>
                </li>
              )}
              {hasPermission("users.update") && (
                <li>
                  <DropdownItem
                    tag="a"
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      toggleModal("userType");
                    }}
                  >
                    <Icon name="user-check-fill" /> <span>Change User Type</span>
                  </DropdownItem>
                </li>
              )}
              {hasPermission("alerts.create") && (
                <li>
                  <DropdownItem
                    tag="a"
                    href="#view"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSelected([id]);
                      setShowAnnouncementModal(true);
                    }}
                  >
                    <Icon name="inbox-fill"></Icon>
                    <span>Send Announcement</span>
                  </DropdownItem>
                </li>
              )}
              {hasPermission("users.suspend") && (
                <li>
                  <DropdownItem
                    tag="a"
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      updateUserStatus({
                        status: user?.data?.user?.status === "active" ? "inactive" : "active",
                      });
                    }}
                  >
                    <Icon name="na" className={`${user?.data?.user?.status === "active" && "text-danger"}`}></Icon>
                    <span className={`${user?.data?.user?.status === "active" && "text-danger"}`}>
                      {user?.data?.user?.status === "active" ? "Restrict" : "Unrestrict"}
                    </span>
                  </DropdownItem>
                </li>
              )}
              {hasPermission("users.suspend") && (
                <li>
                  <DropdownItem
                    tag="a"
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      updateUserStatus({
                        status: user?.data?.user?.status === "shadow-banned" ? "active" : "shadow-banned",
                      });
                    }}
                  >
                    <Icon name="user-cross" className={`${user?.data?.user?.status !== "shadow-banned" && "text-warning"}`}></Icon>
                    <span className={`${user?.data?.user?.status !== "shadow-banned" && "text-warning"}`}>
                      {user?.data?.user?.status === "shadow-banned" ? "Unshadowban User" : "Shadowban User"}
                    </span>
                  </DropdownItem>
                </li>
              )}
              {user?.data?.user?.status !== "fraudulent" && hasPermission("users.suspend") && (
                <li
                  onClick={() => {
                    markAsFraud();
                    // updateUserStatus();
                  }}
                >
                  <DropdownItem
                    tag="a"
                    href="#suspend"
                    onClick={(ev) => {
                      ev.preventDefault();
                      updateUserStatus({ status: "fraudulent" });
                    }}
                  >
                    <Icon name="report"></Icon>
                    <span>Flag as Fraud.</span>
                  </DropdownItem>
                </li>
              )}
            </ul>
          </DropdownMenu>
        </UncontrolledDropdown>
      </li>
    </ul>
  );

  const onFormSubmit = () => {
    closeModal();
  };

  const [view, setView] = useState({
    finance: false,
    userType: false,
  });

  const toggleModal = (type) => {
    setView({
      finance: type === "finance",
      userType: type === "userType",
    });
  };

  const userTypeFormData = {
    userType: user?.data?.user?.userType || "regular",
    influencerRules: {
      accountCompletion: {
        isActive: user?.data?.user?.influencerRules?.accountCompletion?.isActive ?? false,
        rewardAmount: user?.data?.user?.influencerRules?.accountCompletion?.rewardAmount ?? 0,
      },
      firstBillPayment: {
        isActive: user?.data?.user?.influencerRules?.firstBillPayment?.isActive ?? false,
        rewardAmount: user?.data?.user?.influencerRules?.firstBillPayment?.rewardAmount ?? 0,
      },
      transactionVolume: {
        isActive: user?.data?.user?.influencerRules?.transactionVolume?.isActive ?? false,
        rewardAmount: user?.data?.user?.influencerRules?.transactionVolume?.rewardAmount ?? 0,
        targetVolume: user?.data?.user?.influencerRules?.transactionVolume?.targetVolume ?? 0,
      },
      kycCompletion: {
        isActive: user?.data?.user?.influencerRules?.kycCompletion?.isActive ?? false,
        rewardAmount: user?.data?.user?.influencerRules?.kycCompletion?.rewardAmount ?? 0,
      },
      refereeFirstTransaction: {
        isActive: user?.data?.user?.influencerRules?.refereeFirstTransaction?.isActive ?? false,
        discountPercentage: user?.data?.user?.influencerRules?.refereeFirstTransaction?.discountPercentage ?? 10,
        cap: user?.data?.user?.influencerRules?.refereeFirstTransaction?.cap ?? 200,
      },
    },
  };

  const onSubmitUserType = (data) => {
    const payload = {
      userType: data.userType,
    };
    if (data.userType === "influencer" || data.userType === "micro-influencer") {
      payload.influencerRules = data.influencerRules;
    }
    updateUserType(payload);
    closeModal();
  };

  // resets forms
  const resetForm = () => {
    // setFormData({
    //   name: "",
    //   status: "",
    // });
  };

  const closeModal = () => {
    setView({ finance: false, userType: false });
    resetForm();

    setShowAnnouncementModal(false);
    setSelected([]);
  };

  return (
    <>
      <Head title="User Details"></Head>

      <Content>
        <BlockHead size="sm">
          <BlockBetween className="align-items-start align-items-lg-center flex-wrap gap-3">
            <BlockHeadContent>
              <BlockDes className="text-soft">
                <p className="fs-12px text-uppercase fw-bold text-muted mb-1">User Details</p>
              </BlockDes>
              <div className="d-flex align-items-center gap-2">
                <BlockTitle page className="mb-0">
                  {user?.data?.user?.firstname} {user?.data?.user?.lastname}
                </BlockTitle>
                {user?.data?.user?.status && (
                  <span
                    className={`badge badge-sm badge-dim rounded-pill ${
                      user?.data?.user?.status === "active"
                        ? "bg-success-dim text-success"
                        : "bg-warning-dim text-warning"
                    }`}
                  >
                    {user?.data?.user?.status}
                  </span>
                )}
              </div>
            </BlockHeadContent>

            <div className="user-header-actions-wrap">
              <div className="user-header-balances">
                <div className="user-balance-card user-balance-card-main">
                  <div className="ubc-icon">
                    <Icon name="wallet" />
                  </div>
                  <div className="ubc-details">
                    <span className="ubc-label">Wallet Balance</span>
                    <span className="ubc-amount">
                      {formatter("NGN").format(user?.data?.wallet?.mainBalance ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="user-balance-card user-balance-card-bonus">
                  <div className="ubc-icon">
                    <Icon name="coins" />
                  </div>
                  <div className="ubc-details">
                    <div className="ubc-label">
                      <span>Bonus / Cashback</span>
                      <span className="ubc-badge">Cashback</span>
                    </div>
                    <span className="ubc-amount text-success">
                      {formatter("NGN").format(user?.data?.wallet?.bonusBalance ?? 0)}
                    </span>
                  </div>
                </div>

                {typeof user?.data?.wallet?.commissionBalance === "number" && user?.data?.wallet?.commissionBalance > 0 && (
                  <div className="user-balance-card user-balance-card-commission">
                    <div className="ubc-icon">
                      <Icon name="growth" />
                    </div>
                    <div className="ubc-details">
                      <span className="ubc-label">Commission Balance</span>
                      <span className="ubc-amount text-primary">
                        {formatter("NGN").format(user?.data?.wallet?.commissionBalance ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <BlockHeadContent>
                <Button color="light" outline className="bg-white d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                  <Icon name="arrow-left"></Icon>
                  <span>Back</span>
                </Button>
                <a
                  href="#back"
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(-1);
                  }}
                  className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                >
                  <Icon name="arrow-left"></Icon>
                </a>
              </BlockHeadContent>
            </div>
          </BlockBetween>
          {/* <p>Basic info, like your name and address, that you use on Nio Platform.</p> */}
        </BlockHead>
        {/* <Card>
          <div className="card-inner">
            <ul className="nk-tranx-statistics">
              <li className="item">
                <Icon name="sign-kobo" className="bg-primary-dim"></Icon>
                <div className="info">
                  <div className="title">Wallet Balance</div>
                  <div className="count"></div>
                </div>
              </li>
            </ul>
          </div>
        </Card> */}
        <Card>
          <div className="card-aside-wrap" id="user-detail-block">
            <div className="card-content">
              <Nav tabs className="nav nav-tabs nav-tabs-card">
                <NavItem>
                  <NavLink
                    tag="a"
                    href="#tab"
                    className={activeTab === "details" ? "active" : ""}
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSearchParams({ tab: "details" });
                    }}
                  >
                    Personal Information
                  </NavLink>
                </NavItem>
                {hasPermission("giftcards.view") && (
                  <NavItem>
                    <NavLink
                      tag="a"
                      href="#tab"
                      className={activeTab === "giftcard" ? "active" : ""}
                      onClick={(ev) => {
                        ev.preventDefault();
                        setSearchParams({ tab: "giftcard" });
                      }}
                    >
                      Giftcard Txns
                    </NavLink>
                  </NavItem>
                )}
                {hasPermission("crypto.view") && (
                  <NavItem>
                    <NavLink
                      tag="a"
                      href="#tab"
                      className={activeTab === "asset" ? "active" : ""}
                      onClick={(ev) => {
                        ev.preventDefault();
                        setSearchParams({ tab: "asset" });
                      }}
                    >
                      Asset Txns
                    </NavLink>
                  </NavItem>
                )}
                {hasPermission("transactions.view") && (
                  <NavItem>
                    <NavLink
                      tag="a"
                      href="#tab"
                      className={activeTab === "wallet" ? "active" : ""}
                      onClick={(ev) => {
                        ev.preventDefault();
                        setSearchParams({ tab: "wallet" });
                      }}
                    >
                      Wallet Txns
                    </NavLink>
                  </NavItem>
                )}
                {hasPermission("transactions.view") && (
                  <NavItem>
                    <NavLink
                      tag="a"
                      href="#tab"
                      className={activeTab === "services" ? "active" : ""}
                      onClick={(ev) => {
                        ev.preventDefault();
                        setSearchParams({ tab: "services" });
                      }}
                    >
                      Service Txns
                    </NavLink>
                  </NavItem>
                )}
                <NavItem>
                  <NavLink
                    tag="a"
                    href="#tab"
                    className={activeTab === "referral" ? "active" : ""}
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSearchParams({ tab: "referral" });
                    }}
                  >
                    Referrals
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    tag="a"
                    href="#tab"
                    className={activeTab === "accounts" ? "active" : ""}
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSearchParams({ tab: "accounts" });
                    }}
                  >
                    Bank Account
                  </NavLink>
                </NavItem>

                <NavItem className="nav-item nav-item-trigger">
                  <RestrictActionOptions id={user?.data?.user?.id} />
                </NavItem>
              </Nav>
              <div className="card-inner">
                {/* {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div> */}

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="details">
                    <Details user={user} isLoading={isLoading} />
                  </TabPane>
                  <TabPane tabId="giftcard">
                    <GiftcardTable data={giftcards?.data} isLoading={fetchingGiftcards} />
                  </TabPane>
                  <TabPane tabId="asset">
                    <AssetsTable data={assets} isLoading={fetchingAssets} />
                  </TabPane>
                  <TabPane tabId="wallet">
                    <WalletTxnTable
                      data={userWalletTransactions?.data}
                      showStats={false}
                      type={"all"}
                      isLoading={fetchingTransactions}
                    />
                  </TabPane>
                  <TabPane tabId="services">
                    <ServiceTransactionTable
                      showStats={false}
                      data={userServiceTransactions?.data}
                      isLoading={fetchingServiceTxns}
                    />
                  </TabPane>
                  <TabPane tabId="accounts">
                    <FaqTable
                      faqTitle={"Accounts"}
                      headers={["Account Name", "Account Number", "Bank Name"]}
                      dataKeys={["accountName", "accountNumber", "bankName"]}
                      defaultData={user?.data?.bankAccounts}
                      data={user?.data?.bankAccounts}
                      hidePagination={true}
                      hideFilters={true}
                      action={ActionOptions}
                    />
                    <div className="mt-5">
                      <FaqTable
                        faqTitle={"Virtual Account"}
                        headers={["Account Name", "Account Number", "Bank Name", "Type"]}
                        dataKeys={["accountName", "accountNumber", "bankName", "type"]}
                        defaultData={user?.data?.virtualAccounts}
                        data={user?.data?.virtualAccounts}
                        hidePagination={true}
                        hideFilters={true}
                        action={VirtualAcActionOptions}
                      />
                    </div>
                    <div className="mt-5">
                      <FaqTable
                        faqTitle={"Static Account"}
                        headers={["Account Name", "Account Number", "Bank Name", "Type"]}
                        dataKeys={["accountName", "accountNumber", "bankName", "type"]}
                        defaultData={user?.data?.staticAccount}
                        data={user?.data?.staticAccount}
                        hidePagination={true}
                        hideFilters={true}
                        action={StaticAccActionOptions}
                      />
                    </div>
                  </TabPane>
                  <TabPane tabId="referral">
                    <ReferralUserList list={user?.data?.referrals?.data} isLoading={isLoading} />
                  </TabPane>
                </TabContent>
              </div>
              {/* )} */}
              {/* </div> */}
            </div>
          </div>
        </Card>
        <AddModal modal={view.finance} closeModal={closeModal} userId={userId} onSubmit={onFormSubmit} />

        <UserTypeModal
          modal={view.userType}
          formData={userTypeFormData}
          closeModal={closeModal}
          onSubmit={onSubmitUserType}
        />

        <SendAnnouncementModal
          closeModal={closeModal}
          modal={showAnnouncementModal}
          createFunction={createAnnouncement}
          selectedUsers={selected}
        />
      </Content>
    </>
  );
};
export default UserDetailsPage;
