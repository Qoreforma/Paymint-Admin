import { Card } from "reactstrap";
import { Col, Icon, Row } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";
import { WalletAmountStatsCard } from "../giftcards/stats-card";
import { ServicesStatsCard } from "../transactions/stats-card";
import { WalletStatsCard } from "../wallet/stats-card";

export function WalletStatsSection({ data }) {
  return (
    <Row className="g-gs">
      <Col lg={5}>
        <WalletAmountStatsCard data={data?.all?.total?.amount || 0} successful={data?.all?.successful?.amount || 0} />
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
        <WalletAmountStatsCard data={data?.all.total?.amount || 0} successful={data?.all?.successful?.amount || 0} />
      </Col>
      <Col lg={7}>
        <ServicesStatsCard data={data?.all ? data?.all : null} />
      </Col>
    </Row>
  );
}

export function AllServicesStats({ data, crypto, giftcard }) {
  // console.log(crypto);

  // CRYPTO STATS
  const cryptoBuyAmount = crypto?.buy?.approved?.payable_amount + crypto?.buy?.partially_approved?.payable_amount || 0;
  const cryptoBuyCount = crypto?.buy?.approved?.count + crypto?.buy?.partially_approved?.count || 0;
  const cryptoSellAmount =
    crypto?.sell?.approved?.payable_amount + crypto?.sell?.partially_approved?.payable_amount || 0;
  const cryptoSellCount = crypto?.sell?.approved?.count + crypto?.sell?.partially_approved?.count || 0;

  //GIFTCARD STATS
  // const giftcardBuyAmount =
  //   giftcard.buy?.approved?.payable_amount + giftcard?.buy?.partially_approved?.payable_amount || 0;
  // const giftcardBuyCount = giftcard?.buy?.approved?.count + giftcard?.buy?.partially_approved?.count || 0;
  const giftcardSellAmount =
    giftcard?.sell?.approved?.payable_amount + giftcard?.sell?.second_approval?.payable_amount || 0;
  const giftcardSellCount = giftcard?.sell?.approved?.count + giftcard?.sell?.second_approval?.count || 0;

  return (
    <Row className="g-gs">
      <Col lg={6}>
        <Card className="h-100">
          <div className="card-inner">
            <div className="card-title-group mb-2">
              <div className="card-title">
                <h6 className="title">All Services Statistics</h6>
              </div>
            </div>

            <ul className="nk-store-statistics">
              <li className="item">
                <div className="info">
                  <div className="title">Total Airtime Sold</div>
                  <div className="count">
                    {formatter("NGN").format(data?.airtime?.successful?.amount ?? 0)} (
                    <span className="text-soft">{data?.airtime?.successful?.count}</span>)
                  </div>
                </div>
                <Icon name="bag" className="bg-primary-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Total International Airtime Sold</div>
                  <div className="count">
                    {formatter("NGN").format(data?.["international-airtime"]?.successful?.amount ?? 0)} (
                    <span className="text-soft">{data?.["international-airtime"]?.successful?.count}</span>)
                  </div>
                </div>
                <Icon name="users" className="bg-info-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Total Data Sold </div>
                  <div className="count">
                    {formatter("NGN").format(data?.data?.successful?.amount ?? 0)} (
                    <span className="text-soft">{data?.data?.successful?.count}</span>)
                  </div>
                </div>
                <Icon name="box" className="bg-pink-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Total International Data Sold</div>
                  <div className="count">
                    {formatter("NGN").format(data?.["international-data"]?.successful?.amount ?? 0)} (
                    <span className="text-soft">{data?.["international-data"]?.successful?.count}</span>)
                  </div>
                </div>
                <Icon name="server" className="bg-purple-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Total Betting Topup</div>
                  <div className="count">
                    {formatter("NGN").format(data?.betting?.successful?.amount ?? 0)} (
                    <span className="text-soft">{data?.betting?.successful?.count}</span>)
                  </div>
                </div>
                <Icon name="server" className="bg-purple-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Cable tv Sold</div>
                  <div className="count">
                    {formatter("NGN").format(data?.tv?.successful?.amount ?? 0)} (
                    <span className="text-soft">{data?.tv?.successful?.count}</span>)
                  </div>
                </div>
                <Icon name="server" className="bg-purple-dim"></Icon>
              </li>
            </ul>
          </div>
        </Card>
      </Col>

      <Col lg={6}>
        <Card className="h-100">
          <div className="card-inner">
            <div className="card-title-group mb-2">
              <div className="card-title">
                <h6 className="title">All Services Statistics</h6>
              </div>
            </div>

            <ul className="nk-store-statistics">
              <li className="item">
                <div className="info">
                  <div className="title">Total Electricity Sold</div>
                  <div className="count">
                    {formatter("NGN").format(data?.electricity?.successful?.amount ?? 0)} (
                    <span className="text-soft">{data?.electricity?.successful?.count}</span>)
                  </div>
                </div>
                <Icon name="bag" className="bg-primary-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Total Education Sold</div>
                  <div className="count">
                    {formatter("NGN").format(data?.education?.successful?.amount ?? 0)} (
                    <span className="text-soft">{data?.education?.successful?.count}</span>)
                  </div>
                </div>
                <Icon name="users" className="bg-info-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Total Giftcards Sales </div>
                  <div className="count">
                    {formatter("NGN").format(giftcardSellAmount)} (
                    <span className="text-soft">{giftcardSellCount}</span>)
                  </div>
                </div>
                <Icon name="box" className="bg-pink-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Total Crypto Sold</div>
                  <div className="count">
                    {formatter("NGN").format(cryptoSellAmount)} (<span className="text-soft">{cryptoSellCount}</span>)
                  </div>
                </div>
                <Icon name="server" className="bg-purple-dim"></Icon>
              </li>
              <li className="item">
                <div className="info">
                  <div className="title">Total Crypto Purchases</div>
                  <div className="count">
                    {formatter("NGN").format(cryptoBuyAmount)} (<span className="text-soft">{cryptoBuyCount}</span>)
                  </div>
                </div>
                <Icon name="server" className="bg-purple-dim"></Icon>
              </li>
              {/* <li className="item">
                <div className="info">
                  <div className="title">Total Flights Sold</div>
                  <div className="count">
                    {formatter("NGN").format(0)} (<span className="text-soft">{0}</span>)
                  </div>
                </div>
                <Icon name="server" className="bg-purple-dim"></Icon>
              </li> */}
            </ul>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
