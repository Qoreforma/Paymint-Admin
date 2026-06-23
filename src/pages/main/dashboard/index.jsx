import React from "react";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
} from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import {
  AllServicesStats,
  ServicesStatsSection,
  WalletBalances,
  WalletStatsSection,
} from "./dashboard-stats";
import { useGetDashboardStats } from "../../../api/dashboard";

const SectionHead = ({ title }) => (
  <div className="dash-section-head">
    <h5>{title}</h5>
  </div>
);

const Dashboard = () => {
  const { data } = useGetDashboardStats();

  return (
    <React.Fragment>
      <Head title="Dashboard" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Dashboard</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <div className="row g-4">
            {/* Wallet Transactions */}
            <div className="col-12">
              <SectionHead title="Wallet Transactions" />
              <WalletStatsSection data={data?.wallet_transaction} />
            </div>

            {/* Services Transactions */}
            <div className="col-12">
              <SectionHead title="Services Transactions" />
              <ServicesStatsSection data={data?.services_transaction} />
            </div>

            {/* Wallet Statistics */}
            <div className="col-12">
              <SectionHead title="Wallet Statistics" />
              <WalletBalances data={data?.wallet_balance} />
            </div>

            {/* All Services */}
            <div className="col-12">
              <SectionHead title="All Services Statistics" />
              <AllServicesStats data={data?.services_transaction} />
            </div>
          </div>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default Dashboard;
