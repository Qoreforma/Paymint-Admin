import React from "react";
import { Icon } from "../../../../components/Component";
import { formatter } from "../../../../utils/Utils";
import { DashStatCard, WalletAmountStatsCard } from "../giftcards/stats-card";
import { ServicesStatsCard } from "../transactions/stats-card";
import { WalletStatsCard } from "../wallet/stats-card";

/* ── Wallet Transaction Section ─────────────────────────── */
export function WalletStatsSection({ data }) {
  return (
    <div className="row g-3 align-items-stretch">
      {/* Amount cards */}
      <div className="col-12 col-lg-5">
        <WalletAmountStatsCard
          data={data?.all?.total?.amount || 0}
          successful={data?.all?.successful?.amount || 0}
        />
      </div>
      {/* Count cards */}
      <div className="col-12 col-lg-7">
        <WalletStatsCard data={data?.all} />
      </div>
    </div>
  );
}

/* ── Services Transaction Section ───────────────────────── */
export function ServicesStatsSection({ data }) {
  return (
    <div className="row g-3 align-items-stretch">
      <div className="col-12 col-lg-5">
        <WalletAmountStatsCard
          data={data?.all?.total?.amount || 0}
          successful={data?.all?.successful?.amount || 0}
        />
      </div>
      <div className="col-12 col-lg-7">
        <ServicesStatsCard data={data?.all ?? null} />
      </div>
    </div>
  );
}

/* ── Wallet Balances ─────────────────────────────────────── */
export function WalletBalances({ data }) {
  return (
    <div className="row g-3">
      <div className="col-12 col-sm-6">
        <DashStatCard icon="sign-kobo" color="primary"
          label="Wallet Balances"
          value={formatter("NGN").format(data?.amount || 0)} />
      </div>
      <div className="col-12 col-sm-6">
        <DashStatCard icon="users" color="info"
          label="Total Users"
          value={(data?.users || 0).toLocaleString()} />
      </div>
    </div>
  );
}

/* ── All Services Statistics ────────────────────────────── */
const SVC_LIST_1 = [
  { icon: "mobile",      color: "c-primary",   label: "Airtime Sold",    key: "airtime" },
  { icon: "wifi",        color: "c-info",      label: "Data Sold",       key: "data" },
  { icon: "opt-dot",    color: "c-secondary", label: "Betting Top-up",  key: "betting" },
];
const SVC_LIST_2 = [
  { icon: "monitor",    color: "c-warning",  label: "Cable TV Sold",    key: "tv" },
  { icon: "spark-fill", color: "c-danger",   label: "Electricity Sold", key: "electricity" },
  { icon: "book-read",  color: "c-success",  label: "Education Sold",   key: "education" },
];

const SvcRow = ({ icon, color, label, amount, count }) => (
  <div className="svc-stat-row">
    <div className={`svc-icon ${color}`} style={{
      background: color === "c-primary" ? "rgba(15,61,172,0.10)" :
                  color === "c-info"    ? "rgba(9,194,222,0.11)" :
                  color === "c-secondary" ? "rgba(80,110,180,0.10)" :
                  color === "c-warning" ? "rgba(244,189,14,0.13)" :
                  color === "c-danger"  ? "rgba(232,83,71,0.11)" :
                                          "rgba(30,224,172,0.12)",
      color: color === "c-primary" ? "#0f3dac" :
             color === "c-info"    ? "#07a5bc" :
             color === "c-secondary" ? "#4a5e9e" :
             color === "c-warning" ? "#b08a00" :
             color === "c-danger"  ? "#d63d32" :
                                     "#17b38a",
    }}>
      <Icon name={icon} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="svc-label">{label}</div>
      <div className="svc-value">
        {formatter("NGN").format(amount ?? 0)}
        <span className="svc-count ms-1">({(count ?? 0).toLocaleString()})</span>
      </div>
    </div>
  </div>
);

export function AllServicesStats({ data }) {
  return (
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <div className="card h-100">
          <div className="card-inner">
            <h6 style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8094ae", marginBottom: "0.75rem" }}>
              Services — Group 1
            </h6>
            {SVC_LIST_1.map(({ icon, color, label, key }) => (
              <SvcRow key={key} icon={icon} color={color} label={label}
                amount={data?.[key]?.successful?.amount}
                count={data?.[key]?.successful?.count} />
            ))}
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-6">
        <div className="card h-100">
          <div className="card-inner">
            <h6 style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8094ae", marginBottom: "0.75rem" }}>
              Services — Group 2
            </h6>
            {SVC_LIST_2.map(({ icon, color, label, key }) => (
              <SvcRow key={key} icon={icon} color={color} label={label}
                amount={data?.[key]?.successful?.amount}
                count={data?.[key]?.successful?.count} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
