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
    <Row className="g-3">
      <Col sm={6}>
        <div className="nk-stats-card">
          <div className="d-flex align-items-start gap-3">
            <div className="stat-icon primary">
              <Icon name="sign-kobo" />
            </div>
            <div className="flex-fill">
              <div className="stat-label">Wallet Balances</div>
              <div className="stat-value">{formatter("NGN").format(data?.amount || 0)}</div>
            </div>
          </div>
        </div>
      </Col>
      <Col sm={6}>
        <div className="nk-stats-card">
          <div className="d-flex align-items-start gap-3">
            <div className="stat-icon info">
              <Icon name="users" />
            </div>
            <div className="flex-fill">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{(data?.users || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export function ServicesStatsSection({ data }) {
  return (
    <Row className="g-gs">
      <Col lg={5}>
        <WalletAmountStatsCard data={data?.all?.total?.amount || 0} successful={data?.all?.successful?.amount || 0} />
      </Col>
      <Col lg={7}>
        <ServicesStatsCard data={data?.all ? data?.all : null} />
      </Col>
    </Row>
  );
}

const ServiceRow = ({ icon, iconClass, label, amount, count }) => (
  <div className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: "1px solid #f0f3f9" }}>
    <div className={`stat-icon ${iconClass}`} style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} />
    </div>
    <div className="flex-fill">
      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#8094ae", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#364a63" }}>
        {formatter("NGN").format(amount ?? 0)}{" "}
        <span style={{ fontWeight: 500, color: "#8094ae", fontSize: "0.82rem" }}>({(count ?? 0).toLocaleString()})</span>
      </div>
    </div>
  </div>
);

export function AllServicesStats({ data, crypto, giftcard }) {
  return (
    <Row className="g-gs">
      <Col lg={6}>
        <div className="card h-100">
          <div className="card-inner">
            <div className="card-title-group mb-3">
              <div className="card-title">
                <h6 className="title">Services Overview — Part 1</h6>
              </div>
            </div>
            <ServiceRow icon="bag"    iconClass="primary"  label="Airtime Sold"    amount={data?.airtime?.successful?.amount}   count={data?.airtime?.successful?.count} />
            <ServiceRow icon="box"    iconClass="info"     label="Data Sold"       amount={data?.data?.successful?.amount}     count={data?.data?.successful?.count} />
            <ServiceRow icon="server" iconClass="secondary" label="Betting Topup"  amount={data?.betting?.successful?.amount}  count={data?.betting?.successful?.count} />
          </div>
        </div>
      </Col>

      <Col lg={6}>
        <div className="card h-100">
          <div className="card-inner">
            <div className="card-title-group mb-3">
              <div className="card-title">
                <h6 className="title">Services Overview — Part 2</h6>
              </div>
            </div>
            <ServiceRow icon="monitor"  iconClass="warning"  label="Cable TV Sold"       amount={data?.tv?.successful?.amount}          count={data?.tv?.successful?.count} />
            <ServiceRow icon="spark-fill" iconClass="danger"  label="Electricity Sold"   amount={data?.electricity?.successful?.amount} count={data?.electricity?.successful?.count} />
            <ServiceRow icon="book-read" iconClass="success" label="Education Sold"      amount={data?.education?.successful?.amount}   count={data?.education?.successful?.count} />
          </div>
        </div>
      </Col>
    </Row>
  );
}
