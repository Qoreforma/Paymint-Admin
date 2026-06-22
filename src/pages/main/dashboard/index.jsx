import React from "react";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Col, Row } from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { AllServicesStats, ServicesStatsSection, WalletBalances, WalletStatsSection } from "./dashboard-stats";
import { useGetDashboardStats } from "../../../api/dashboard";

const SectionHeading = ({ title }) => (
  <div className="section-heading">
    <h5>{title}</h5>
    <div className="section-line"></div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStats();

  return (
    <React.Fragment>
      <Head title="Dashboard"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Dashboard</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <Row className="g-gs">
            <Col size="12">
              <SectionHeading title="Total Wallet Transactions" />
              <WalletStatsSection data={data?.wallet_transaction} />
            </Col>
            <Col size="12">
              <SectionHeading title="Total Services Transactions" />
              <ServicesStatsSection data={data?.services_transaction} />
            </Col>
            <Col size="12">
              <SectionHeading title="Wallet Statistics" />
              <WalletBalances data={data?.wallet_balance} />
            </Col>
            <Col size="12">
              <SectionHeading title="All Services Statistics" />
              <AllServicesStats
                data={data?.services_transaction}
                crypto={data?.crypto_transaction}
                giftcard={data?.giftcard_transaction}
              />
            </Col>
          </Row>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default Dashboard;
