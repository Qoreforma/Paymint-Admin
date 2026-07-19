import React from "react";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Col, Row } from "../../../components/Component";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { AllServicesStats, ServicesStatsSection, WalletBalances, WalletStatsSection } from "./dashboard-stats";
import { useGetDashboardStats } from "../../../api/dashboard";

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStats();
  // console.log(data);
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
            <Col>
              <h5 className="mb-4">Total Wallet Transactions</h5>
              <WalletStatsSection data={data?.wallet_transaction} />
            </Col>
            <Col>
              <h5 className="mb-4">Total Services Transactions</h5>
              <ServicesStatsSection data={data?.services_transaction} />
            </Col>
            <Col>
              <h5 className="mb-4">Wallet Statistics</h5>
              <WalletBalances data={data?.wallet_balance} />
            </Col>

            <Col>
              <h5 className="mb-4">All Services Statistics</h5>
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
