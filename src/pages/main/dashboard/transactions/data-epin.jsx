import React from "react";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { ServiceTransactionTable } from "./service-txns-table";
import { useSearchParams } from "react-router-dom";
import { useGetAllTransactions } from "../../../../api/transactions";

const DataEpinTransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const channel = searchParams.get("channel") ?? "";

  const { isLoading, data, error } = useGetAllTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    channel,
    startDate,
    endDate,
    "",
    "data_epin",
  );

  return (
    <React.Fragment>
      <Head title="Data Epin Transaction"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Data Epin Transactions</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <ServiceTransactionTable
          showStats
          type="data_epin"
          purpose={"Data Epin"}
          data={data?.data}
          isLoading={isLoading}
          showType
        />
      </Content>
    </React.Fragment>
  );
};

export default DataEpinTransactionsPage;
