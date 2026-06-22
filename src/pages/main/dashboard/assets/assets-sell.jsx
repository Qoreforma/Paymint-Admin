import React from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAssetsTransactions } from "../../../../api/assets";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Col, Row } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { StatsCard, StatsDetailsCard } from "./stats-card";
import AssetsTable from "./table";

const AssetSellPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const type = "sell";

  const { isLoading, data, error } = useGetAssetsTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    startDate,
    endDate,
    "",
    "",
    type,
  );

  return (
    <React.Fragment>
      <Head title="Assets"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Assets</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        {/* <Row className="mb-5">
          <Col lg={5}>
            <StatsCard data={data?.stat?.sell} />
          </Col>
          <Col lg={7}>
            <StatsDetailsCard data={data?.stat?.sell} />
            <StatsCard title={"Stats 2"} value={2} />
          </Col>
        </Row> */}

        <AssetsTable data={data} tradeType="Sell" isLoading={isLoading} />
      </Content>
    </React.Fragment>
  );
};

export default AssetSellPage;
