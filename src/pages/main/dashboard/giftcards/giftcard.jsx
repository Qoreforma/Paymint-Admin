import React from "react";
import { useSearchParams } from "react-router-dom";
import { useGetGiftcardTransactions } from "../../../../api/giftcard";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Col, Row } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import GiftcardTable from "./table";

const GiftCardListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const type = "buy";

  const { data, error, isLoading } = useGetGiftcardTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    startDate,
    endDate,
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
              <BlockTitle>Giftcard</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/*  TABLE HERE */}
        <GiftcardTable tradeType="Buy" data={data?.data} isLoading={isLoading} />
      </Content>
    </React.Fragment>
  );
};

export default GiftCardListPage;
