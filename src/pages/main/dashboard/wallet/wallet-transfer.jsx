import React from "react";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import WithdrawalTable from "./table";

const WalletTransferListPage = () => {
  return (
    <React.Fragment>
      <Head title="Transfer Transactions"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle> Transfer Transactions</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        {/* PRODUCT TABLE HERE */}

        <WithdrawalTable type="transfer" />
      </Content>
    </React.Fragment>
  );
};

export default WalletTransferListPage;
