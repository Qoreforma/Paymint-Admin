import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetGiftcardTransactions } from "../../../../api/giftcard";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Col, Row } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { AmountStatsCard, StatsDetailsCard } from "./stats-card";
import GiftcardTable from "./table";
import { useGetGiftcardTransactionsOverview } from "../../../../api/transactions";

const AllGiftCardListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const channel = searchParams.get("channel") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const { isLoading, data } = useGetGiftcardTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    channel,
    startDate,
    endDate,
  );

  return (
    <React.Fragment>
      <Head title="Giftcards"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Giftcard</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* {/* GIFTCARD TXNS TABLE HERE */}
        <GiftcardTable showStats data={data?.data} isLoading={isLoading} />
      </Content>
    </React.Fragment>
  );
};

export default AllGiftCardListPage;
