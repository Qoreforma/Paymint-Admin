import React from "react";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { useGetWalletTransactions } from "../../../../api/transactions";
import { useSearchParams } from "react-router-dom";
import WalletTxnTable from "./wallet-txn-table";

const WalletWithdrawalListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const { isLoading, data } = useGetWalletTransactions(
    currentPage,
    itemsPerPage,
    status,
    search,
    startDate,
    endDate,
    "",
    "withdrawal",
  );

  return (
    <React.Fragment>
      <Head title="Withdrawal Transactions"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Withdrawal Transactions</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <WalletTxnTable showStats={false} type={"Withdrawal"} data={data?.data} isLoading={isLoading} />
      </Content>
    </React.Fragment>
  );
};

export default WalletWithdrawalListPage;
