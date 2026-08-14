import React from "react";
import { Card, Badge } from "reactstrap";
import { Col, Icon, Row } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";
import { WalletAmountStatsCard } from "../giftcards/stats-card";
import { ServicesStatsCard } from "../transactions/stats-card";
import { WalletStatsCard } from "../wallet/stats-card";

export function WalletStatsSection({ data }) {
  return (
    <Row className="g-gs">
      <Col lg={5}>
        <WalletAmountStatsCard
          data={data?.all?.total?.amount || 0}
          successful={data?.all?.successful?.amount || 0}
        />
      </Col>
      <Col lg={7}>
        <WalletStatsCard data={data?.all} />
      </Col>
    </Row>
  );
}

export function WalletBalances({ data }) {
  return (
    <Row className="g-gs">
      <Col lg={6}>
        <Card>
          <div className="card-inner">
            <ul className="nk-tranx-statistics">
              <li className="item">
                <Icon name="sign-kobo" className="bg-primary-dim"></Icon>
                <div className="info">
                  <div className="title">Wallet Balances</div>
                  <div className="count">{formatter("NGN").format(data?.amount || 0)}</div>
                </div>
              </li>
            </ul>
          </div>
        </Card>
      </Col>
      <Col lg={6}>
        <Card>
          <div className="card-inner">
            <ul className="nk-tranx-statistics">
              <li className="item">
                <Icon name="users" className="bg-primary-dim"></Icon>
                <div className="info">
                  <div className="title">Total Users</div>
                  <div className="count">{data?.users || 0}</div>
                </div>
              </li>
            </ul>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

export function ServicesStatsSection({ data }) {
  return (
    <Row className="g-gs">
      <Col lg={5}>
        <WalletAmountStatsCard
          data={data?.all?.total?.amount || 0}
          successful={data?.all?.successful?.amount || 0}
          profit={data?.all?.successful?.profit || data?.all?.total?.profit || 0}
        />
      </Col>
      <Col lg={7}>
        <ServicesStatsCard data={data?.all ? data?.all : null} />
      </Col>
    </Row>
  );
}

const ServiceStatRow = ({ title, amount, count, profit, icon, iconClass = "bg-primary-dim" }) => {
  const profitNum = profit || 0;
  return (
    <li className="item d-flex align-items-center justify-content-between py-2 border-bottom border-light">
      <div className="info d-flex flex-column">
        <div className="title fw-medium text-dark" style={{ fontSize: 13 }}>{title}</div>
        <div className="count mt-1" style={{ fontSize: 13 }}>
          <span className="fw-bold">{formatter("NGN").format(amount ?? 0)}</span>{" "}
          <span className="text-soft small">({count ?? 0})</span>
        </div>
        <div className="mt-1">
          <span
            className="badge rounded-pill px-2 py-1"
            style={{
              background: profitNum > 0 ? "#ecfdf5" : profitNum < 0 ? "#fef2f2" : "#f1f5f9",
              color: profitNum > 0 ? "#059669" : profitNum < 0 ? "#dc2626" : "#64748b",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Profit: {profitNum > 0 ? "+" : ""}{formatter("NGN").format(profitNum)}
          </span>
        </div>
      </div>
      <Icon name={icon} className={`${iconClass} p-2 rounded`} style={{ fontSize: 20 }}></Icon>
    </li>
  );
};

export function AllServicesStats({ data, crypto, giftcard }) {
  // CRYPTO STATS
  const cryptoBuyAmount = crypto?.buy?.approved?.payable_amount + crypto?.buy?.partially_approved?.payable_amount || 0;
  const cryptoBuyCount = crypto?.buy?.approved?.count + crypto?.buy?.partially_approved?.count || 0;
  const cryptoBuyProfit = crypto?.buy?.approved?.profit || 0;

  const cryptoSellAmount =
    crypto?.sell?.approved?.payable_amount + crypto?.sell?.partially_approved?.payable_amount || 0;
  const cryptoSellCount = crypto?.sell?.approved?.count + crypto?.sell?.partially_approved?.count || 0;
  const cryptoSellProfit = crypto?.sell?.approved?.profit || 0;

  // GIFTCARD STATS
  const giftcardSellAmount =
    giftcard?.sell?.approved?.payable_amount + giftcard?.sell?.second_approval?.payable_amount || 0;
  const giftcardSellCount = giftcard?.sell?.approved?.count + giftcard?.sell?.second_approval?.count || 0;
  const giftcardSellProfit =
    (giftcard?.sell?.approved?.profit || 0) + (giftcard?.sell?.second_approval?.profit || 0);

  return (
    <Row className="g-gs">
      <Col lg={6}>
        <Card className="h-100">
          <div className="card-inner">
            <div className="card-title-group mb-3">
              <div className="card-title">
                <h6 className="title">Telecom & Entertainment Services</h6>
              </div>
            </div>

            <ul className="nk-store-statistics list-unstyled mb-0">
              <ServiceStatRow
                title="Total Airtime Sold"
                amount={data?.airtime?.successful?.amount}
                count={data?.airtime?.successful?.count}
                profit={data?.airtime?.successful?.profit}
                icon="call"
                iconClass="bg-primary-dim"
              />
              <ServiceStatRow
                title="Total Data Sold"
                amount={data?.data?.successful?.amount}
                count={data?.data?.successful?.count}
                profit={data?.data?.successful?.profit}
                icon="signal"
                iconClass="bg-pink-dim"
              />
              <ServiceStatRow
                title="Total International Airtime Sold"
                amount={data?.["international-airtime"]?.successful?.amount}
                count={data?.["international-airtime"]?.successful?.count}
                profit={data?.["international-airtime"]?.successful?.profit}
                icon="globe"
                iconClass="bg-info-dim"
              />
              <ServiceStatRow
                title="Total International Data Sold"
                amount={data?.["international-data"]?.successful?.amount}
                count={data?.["international-data"]?.successful?.count}
                profit={data?.["international-data"]?.successful?.profit}
                icon="wifi"
                iconClass="bg-purple-dim"
              />
              <ServiceStatRow
                title="Total Betting Topup"
                amount={data?.betting?.successful?.amount}
                count={data?.betting?.successful?.count}
                profit={data?.betting?.successful?.profit}
                icon="activity"
                iconClass="bg-warning-dim"
              />
              <ServiceStatRow
                title="Total Cable TV Sold"
                amount={data?.tv?.successful?.amount}
                count={data?.tv?.successful?.count}
                profit={data?.tv?.successful?.profit}
                icon="monitor"
                iconClass="bg-secondary-dim"
              />
            </ul>
          </div>
        </Card>
      </Col>

      <Col lg={6}>
        <Card className="h-100">
          <div className="card-inner">
            <div className="card-title-group mb-3">
              <div className="card-title">
                <h6 className="title">Utilities, Digital Assets & Trade</h6>
              </div>
            </div>

            <ul className="nk-store-statistics list-unstyled mb-0">
              <ServiceStatRow
                title="Total Electricity Sold"
                amount={data?.electricity?.successful?.amount}
                count={data?.electricity?.successful?.count}
                profit={data?.electricity?.successful?.profit}
                icon="bulb"
                iconClass="bg-warning-dim"
              />
              <ServiceStatRow
                title="Total Education Sold"
                amount={data?.education?.successful?.amount}
                count={data?.education?.successful?.count}
                profit={data?.education?.successful?.profit}
                icon="book-read"
                iconClass="bg-info-dim"
              />
              <ServiceStatRow
                title="Total Giftcard Sales"
                amount={giftcardSellAmount}
                count={giftcardSellCount}
                profit={giftcardSellProfit}
                icon="gift"
                iconClass="bg-danger-dim"
              />
              <ServiceStatRow
                title="Total Crypto Sold"
                amount={cryptoSellAmount}
                count={cryptoSellCount}
                profit={cryptoSellProfit}
                icon="trend-down"
                iconClass="bg-purple-dim"
              />
              <ServiceStatRow
                title="Total Crypto Purchases"
                amount={cryptoBuyAmount}
                count={cryptoBuyCount}
                profit={cryptoBuyProfit}
                icon="trend-up"
                iconClass="bg-success-dim"
              />
            </ul>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
