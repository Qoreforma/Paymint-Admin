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
} from "../../../../api/users/user";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import FaqTable from "../faq/faqTable";
import { TransactionTable } from "../transactions/table";
import WithdrawalTable from "../wallet/table";
import AddModal from "./AddModal";
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

const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "details";

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

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
    startDate,
    endDate,
    userId,
  );

  const { isLoading: fetchingGiftcards, data: giftcards } = useGetGiftcardTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    startDate,
    endDate,
    userId,
  );

  const { isLoading: fetchingAssets, data: assets } = useGetAssetsTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    startDate,
    endDate,
    userId,
  );

  const { data: user, isLoading } = useGetSingleUser(userId);

  const { mutate: financeUser } = useFinanceUser(userId);
  const { mutate: updateUserStatus } = useUpdateUserStatus(userId);
  const { mutate: markAsFraud } = useMarkAsFraud(userId);
  const { mutate: toggleBlacklist } = useBlacklistUser(userId);

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
          <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
            <Icon name="more-v"></Icon>
          </DropdownToggle>
          <DropdownMenu end>
            <ul className="link-list-opt no-bdr">
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
              {user?.data?.user?.status !== "fraudulent" && (
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
              {/* <li
                onClick={() => {
                  toggleBlacklist();
                  // updateUserStatus();
                }}
              >
                <DropdownItem
                  tag="a"
                  href="#suspend"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  <Icon name="report" className={"text-danger"}></Icon>
                  <span className="text-danger">
                    {!user?.data?.is_blacklisted ? "Add to" : "Remove from"} Blacklist
                  </span>
                </DropdownItem>
              </li> */}
              {/* {user?.data?.status !== "shadow banned" && (
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
                    }}
                  >
                    <Icon name="report"></Icon>
                    <span>Shadow Ban User.</span>
                  </DropdownItem>
                </li>
              )} */}
            </ul>
          </DropdownMenu>
        </UncontrolledDropdown>
      </li>
    </ul>
  );

  const onFormSubmit = (data) => {
    let submittedData = {
      ...data,
      type: data.type.value,
    };
    financeUser(submittedData);
    closeModal();
  };

  const [view, setView] = useState({
    finance: false,
  });

  const toggleModal = (type) => {
    setView({
      finance: type === "finance" ? true : false,
    });
  };

  // resets forms
  const resetForm = () => {
    // setFormData({
    //   name: "",
    //   status: "",
    // });
  };

  const closeModal = () => {
    setView({ finance: false });
    resetForm();
  };

  return (
    <>
      <Head title="User Details"></Head>

      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockBetween className={"w-max-550px w-80"}>
              <BlockHeadContent>
                <BlockDes className="text-soft">
                  <p>User Details</p>
                </BlockDes>
                <BlockTitle page>
                  {user?.data?.user?.firstname} {user?.data?.user?.lastname}
                </BlockTitle>
              </BlockHeadContent>

              <BlockHeadContent className={""}>
                <BlockDes className="text-soft">
                  <p>Wallet Balance</p>
                </BlockDes>
                <BlockTitle>{formatter("NGN").format(user?.data?.wallet?.mainBalance ?? 0)}</BlockTitle>
              </BlockHeadContent>
            </BlockBetween>
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
                  <RestrictActionOptions />
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
                      hideFilter={true}
                      isLoading={fetchingTransactions}
                    />
                  </TabPane>
                  <TabPane tabId="services">
                    <ServiceTransactionTable
                      showStats={false}
                      data={userServiceTransactions?.data}
                      isLoading={fetchingServiceTxns}
                      hideFilter={true}
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
        <AddModal modal={view.finance} closeModal={closeModal} onSubmit={onFormSubmit} />
      </Content>
    </>
  );
};
export default UserDetailsPage;
