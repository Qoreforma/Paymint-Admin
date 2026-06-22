import React from "react";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { ServiceTransactionTable } from "./service-txns-table";
import { useSearchParams } from "react-router-dom";
import { useGetAllTransactions } from "../../../../api/transactions";

const DataTransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const { isLoading, data, error } = useGetAllTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    startDate,
    endDate,
    "",
    "data",
  );

  return (
    <React.Fragment>
      <Head title="Data Transaction"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Data Transactions</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <ServiceTransactionTable purpose={"Data"} showStats={false} data={data?.data} isLoading={isLoading} />
      </Content>
    </React.Fragment>
  );
};

export default DataTransactionsPage;
