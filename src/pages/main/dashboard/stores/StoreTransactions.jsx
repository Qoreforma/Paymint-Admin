import React from "react";

import { Block, BlockTitle, Col, Row } from "../../../../components/Component";

import { formatCurrency } from "../../../../utils/Utils";
import { TransactionTable } from "../tables/TransactionTable";

const StoreTransactionsPage = ({ data }) => {
  return (
    <>
      <Block>
        <BlockTitle tag="h4">Wallet</BlockTitle>
        <Row>
          {/* OLD STYLE */}
          <Col sm="6" lg="3" className="">
            <div className="nk-order-ovwg-data buy">
              <div className="amount">{formatCurrency(data?.wallet?.availableNGN)}</div>
              <div className="info">
                <strong>Settled </strong>
              </div>
              <div className="title">NGN Balance</div>
            </div>
          </Col>
          <Col sm="6" lg="3">
            <div className="nk-order-ovwg-data buy">
              <div className="amount">{formatCurrency(data?.wallet?.ledgerNGN)}</div>
              <div className="info">
                <strong>Ledger</strong>
              </div>
              <div className="title">NGN Balance</div>
            </div>
          </Col>
          <Col sm="6" lg="3">
            <div className="nk-order-ovwg-data sell">
              <div className="amount">{formatCurrency(data?.wallet?.availableUSD, "en-US", "USD")}</div>
              <div className="info">
                <strong>Settled </strong>
              </div>
              <div className="title">USD Balance</div>
            </div>
          </Col>

          <Col sm="6" lg="3">
            <div className="nk-order-ovwg-data sell">
              <div className="amount">{formatCurrency(data?.wallet?.ledgerUSD, "en-US", "USD")}</div>
              <div className="info">
                <strong>Ledger</strong>
              </div>
              <div className="title">USD Balance</div>
            </div>
          </Col>
        </Row>
      </Block>

      <Block>
        <BlockTitle tag="h5">Transaction History</BlockTitle>
        {/* <Card className="card-bordered card-stretch"> */}
        <section className="card-bordered card-stretch">
          <TransactionTable action={false} isCompact data={data ? data?.transactions : []} />
        </section>
        {/* </Card> */}
      </Block>
    </>
  );
};

export default StoreTransactionsPage;
