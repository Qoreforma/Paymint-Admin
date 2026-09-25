import React, { useState, useMemo } from "react";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import "./campaigns.css";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Button,
  Icon,
  Row,
  Col,
} from "../../../../components/Component";
import {
  Card,
  CardBody,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import {
  useGetAudiences,
  useSyncSources,
  usePreviewAllocation,
  useCreateCampaign,
  useGetCampaigns,
  useGetDailyStats,
  useControlCampaign,
  useResetAudience,
  useDeleteAudience,
  usePruneRecipients,
  useGetEmailBanners,
  useUpdateCampaign,
  useTriggerNightlySweep,
} from "../../../../api/campaigns";
import { formatDateWithTime } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Verified official PayMint links
const OFFICIAL_LINKS = {
  website: "https://paymint.com.ng",
  playStore: "https://play.google.com/store/apps/details?id=com.paymint.app",
  appStore: "https://apps.apple.com/us/app/paymint/id6801909031",
};

// Ready-to-use bill payment & reward email templates
const EMAIL_TEMPLATES = {
  cashbackElectricityData: {
    id: "cashbackElectricityData",
    name: "⚡ 5% Cashback: Electricity & Data Weekend Blitz",
    category: "🔥 Cashback & Discounts",
    subject: "⚡ Enjoy 5% Instant Cashback on All Electricity & Data Recharges!",
    campaignName: "5% Electricity & Data Cashback Blitz",
    desc: "Targeted promo offering 5% instant cashback on prepaid meter tokens & SME data bundles.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0f3dac 0%, #1e40af 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">⚡ Limited Weekend Offer</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">5% Instant Cashback on All Bills</h1>
    <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Recharge electricity tokens or buy mobile data and get 5% right back into your wallet.</p>
  </div>

  <p>Hi <strong>{{firstName}}</strong>,</p>
  <p>Why pay more for essential utilities? For a limited time, PayMint is giving you <strong>5% instant cashback</strong> credited directly to your wallet every time you recharge your prepaid electricity meter or purchase data bundles.</p>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <h3 style="font-size: 15px; margin: 0 0 12px 0; color: #0f3dac; font-weight: 700;">What You Get This Weekend:</h3>
    <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #334155; line-height: 1.8;">
      <li><strong>💡 Electricity Meter Tokens:</strong> Instant 20-digit token generation for IKEDC, EKEDC, AEDC, IBEDC & all Discos.</li>
      <li><strong>📶 High-Speed Data:</strong> Instant delivery for MTN, Airtel, Glo & 9mobile from ₦220/GB.</li>
      <li><strong>💸 5% Instant Wallet Cashback:</strong> Automatically credited into your PayMint balance in under 5 seconds.</li>
      <li><strong>🛡️ Zero Hidden Fees:</strong> No convenience charges, no service markups.</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #0f3dac; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 61, 172, 0.25);">Claim 5% Cashback Now</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Manage all your bills conveniently on the PayMint Mobile App:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Best regards,<br/>The PayMint Team</p>
</div>
{{footerBanner}}`,
  },

  walletFundingBonus: {
    id: "walletFundingBonus",
    name: "🎁 Wallet Bonus: Fund ₦5,000+ & Claim ₦500 Free Credit",
    category: "🔥 Cashback & Discounts",
    subject: "🎁 Fund ₦5,000+ Today & Get ₦500 Free Wallet Bonus on PayMint!",
    campaignName: "₦500 Wallet Top-Up Bonus Promo",
    desc: "Stimulate account deposits by offering ₦500 bonus on virtual account bank transfers.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">🎁 Special Wallet Bonus</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">Claim Your Free ₦500 Wallet Bonus</h1>
    <p style="color: #d1fae5; font-size: 14px; margin: 0;">Top up your wallet today and enjoy free extra cash for your bill payments.</p>
  </div>

  <p>Hello <strong>{{firstName}}</strong>,</p>
  <p>Here is an exclusive bonus to help you save more! Simply transfer <strong>₦5,000 or more</strong> into your dedicated PayMint virtual bank account today, and we will instantly credit your wallet with a <strong>free ₦500 bonus</strong>.</p>

  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <h3 style="font-size: 15px; margin: 0 0 10px 0; color: #065f46; font-weight: 700;">How to Claim in 3 Simple Steps:</h3>
    <ol style="padding-left: 20px; margin: 0; font-size: 14px; color: #064e3b; line-height: 1.8;">
      <li>Log in to your PayMint account or open the app.</li>
      <li>Copy your dedicated virtual bank account number (instant reflection).</li>
      <li>Transfer ₦5,000 or more from any Nigerian bank — your ₦500 bonus is added automatically!</li>
    </ol>
  </div>

  <p style="font-size: 14px; color: #475569;">Use your bonus to buy cheap data bundles, recharge airtime, pay electricity tokens, or fund your betting wallet with zero charges.</p>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #059669; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">Fund Wallet & Get ₦500 Bonus</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Available on iOS and Android:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Happy saving,<br/>PayMint Customer Rewards</p>
</div>
{{footerBanner}}`,
  },

  zeroFeeCable: {
    id: "zeroFeeCable",
    name: "📺 Zero Convenience Fee: DSTV, GOtv & StarTimes",
    category: "💡 Utilities & Bills",
    subject: "📺 Stop Paying Extra: Renew DSTV, GOtv & StarTimes with ₦0 Fees on PayMint",
    campaignName: "Zero Fee Cable TV Subscriptions",
    desc: "Highlight ₦0 convenience charge and 60-second signal reconnect on cable bouquets.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">📺 Zero Convenience Fees</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">Never Pay Extra for Cable TV Again</h1>
    <p style="color: #94a3b8; font-size: 14px; margin: 0;">Renew DSTV, GOtv, StarTimes & Showmax at official provider rates.</p>
  </div>

  <p>Hi <strong>{{firstName}}</strong>,</p>
  <p>Did you know other platforms charge you an extra ₦100 to ₦200 convenience fee just to pay for your television subscription? On <strong>PayMint</strong>, you pay exactly what the bouquet costs — <strong>₦0 service charge, ₦0 hidden fees</strong>.</p>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <h3 style="font-size: 15px; margin: 0 0 12px 0; color: #0f3dac; font-weight: 700;">Why Switch Your TV Renewals to PayMint:</h3>
    <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #334155; line-height: 1.8;">
      <li><strong>⚡ Instant Viewing Reconnection:</strong> Your signal reconnects automatically within 60 seconds of payment.</li>
      <li><strong>📺 All Bouquets Supported:</strong> DSTV Premium, Compact Plus, Confam, Yanga; GOtv Supa+, Supa, Max, Jinja; and StarTimes.</li>
      <li><strong>💾 Saved IUC Numbers:</strong> Save your smartcard numbers for effortless 1-click renewals each month.</li>
      <li><strong>🧾 Official Receipts:</strong> Download and share transaction receipts instantly.</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #0f3dac; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 61, 172, 0.25);">Renew Cable TV Now</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Experience fast renewals on the PayMint app:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Warm regards,<br/>The PayMint Team</p>
</div>
{{footerBanner}}`,
  },

  cheapDataPromo: {
    id: "cheapDataPromo",
    name: "📶 Data Deals: High-Speed SME & Direct Data from ₦220/GB",
    category: "📶 Data & Airtime",
    subject: "📶 Data Running Low? Get High-Speed Data from ₦220/GB on PayMint",
    campaignName: "Unbeatable Cheap Data Flash Promo",
    desc: "Target heavy internet users with cheap MTN, Airtel, Glo, and 9mobile data plans.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">📶 Superfast Internet</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">High-Speed Data Starting at ₦220/GB</h1>
    <p style="color: #bfdbfe; font-size: 14px; margin: 0;">Stay connected on MTN, Airtel, Glo & 9mobile with instant 5-second delivery.</p>
  </div>

  <p>Hi <strong>{{firstName}}</strong>,</p>
  <p>Don't let your data run out during an important call or movie stream! PayMint gives you the fastest and most affordable internet data bundles in Nigeria with 30-day validity.</p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; text-align: center;">
      <div style="font-size: 13px; font-weight: 800; color: #b45309;">MTN SME & Direct</div>
      <div style="font-size: 18px; font-weight: 800; color: #78350f; margin: 4px 0;">From ₦240 / GB</div>
      <div style="font-size: 12px; color: #92400e;">Instant 30-day validity</div>
    </div>
    <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 14px; text-align: center;">
      <div style="font-size: 13px; font-weight: 800; color: #b91c1c;">AIRTEL Bundles</div>
      <div style="font-size: 18px; font-weight: 800; color: #7f1d1d; margin: 4px 0;">From ₦235 / GB</div>
      <div style="font-size: 12px; color: #991b1b;">High-speed 4G/5G browsing</div>
    </div>
    <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 14px; text-align: center;">
      <div style="font-size: 13px; font-weight: 800; color: #15803d;">GLO Mega Packs</div>
      <div style="font-size: 18px; font-weight: 800; color: #14532d; margin: 4px 0;">From ₦220 / GB</div>
      <div style="font-size: 12px; color: #166534;">Massive gigabytes deals</div>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center;">
      <div style="font-size: 13px; font-weight: 800; color: #0284c7;">9MOBILE Corporate</div>
      <div style="font-size: 18px; font-weight: 800; color: #0369a1; margin: 4px 0;">From ₦220 / GB</div>
      <div style="font-size: 12px; color: #075985;">Reliable uninterrupted speed</div>
    </div>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">Buy Cheap Data Now</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Top up on the go via the PayMint Mobile App:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Best regards,<br/>The PayMint Team</p>
</div>
{{footerBanner}}`,
  },

  airtimeSurgeDiscount: {
    id: "airtimeSurgeDiscount",
    name: "📞 Airtime Surge: Instant Up to 6% Discount on Recharge",
    category: "📶 Data & Airtime",
    subject: "📞 Airtime Discount Surge: Save Up to 6% on Every Network Recharge!",
    campaignName: "Airtime Recharge Discount Surge",
    desc: "Promote instant discount of up to 6% on VTU airtime across all Nigerian networks.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">📞 Airtime Discount Surge</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">Never Pay 100% for Airtime Again</h1>
    <p style="color: #fef3c7; font-size: 14px; margin: 0;">Enjoy up to 6% instant discounts on MTN, Airtel, Glo & 9mobile recharges.</p>
  </div>

  <p>Hello <strong>{{firstName}}</strong>,</p>
  <p>Why pay full price when you can keep more money in your pocket? With PayMint's Airtime Discount Surge, you receive an <strong>instant discount</strong> automatically deducted at checkout every time you recharge.</p>

  <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <h3 style="font-size: 15px; margin: 0 0 10px 0; color: #92400e; font-weight: 700;">How Your Discount Works:</h3>
    <p style="font-size: 14px; color: #78350f; margin: 0 0 12px 0;">Recharge ₦1,000 Airtime and pay only <strong>₦940</strong>. Recharge ₦5,000 and pay only <strong>₦4,700</strong>! The discount is applied instantly with zero coupon codes needed.</p>
    <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #78350f; line-height: 1.8;">
      <li>⚡ Instant 3-second network delivery</li>
      <li>👥 Send airtime to multiple phone numbers at once</li>
      <li>🏷️ Available 24/7 across all four Nigerian mobile carriers</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #d97706; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);">Recharge with Discount Now</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Recharge anytime on the PayMint app:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Warm regards,<br/>The PayMint Team</p>
</div>
{{footerBanner}}`,
  },

  electricityMeterRescue: {
    id: "electricityMeterRescue",
    name: "💡 Electricity Meter: Instant 20-Digit Token in 3 Seconds",
    category: "💡 Utilities & Bills",
    subject: "💡 Never Get Left in the Dark: Instant Prepaid Meter Tokens with Zero Hassle",
    campaignName: "Prepaid Electricity Instant Token Promo",
    desc: "Highlight 24/7 instant 20-digit token generation and automatic meter validation.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0f3dac 0%, #312e81 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">💡 24/7 Power Recharges</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">Never Get Left in the Dark</h1>
    <p style="color: #c7d2fe; font-size: 14px; margin: 0;">Get your 20-digit prepaid meter token in under 3 seconds, 24/7.</p>
  </div>

  <p>Hi <strong>{{firstName}}</strong>,</p>
  <p>Nothing is more stressful than your electricity meter beeping late at night while other bill apps take hours to send your token. On <strong>PayMint</strong>, electricity tokens are generated instantly and displayed immediately on your screen, plus sent via SMS and Email.</p>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <h3 style="font-size: 15px; margin: 0 0 12px 0; color: #0f3dac; font-weight: 700;">Supported Electricity Distribution Companies (Discos):</h3>
    <div style="font-size: 13.5px; color: #334155; line-height: 1.8;">
      ⚡ <strong>IKEDC</strong> (Ikeja Electric) &bull; ⚡ <strong>EKEDC</strong> (Eko Electric)<br/>
      ⚡ <strong>AEDC</strong> (Abuja Electricity) &bull; ⚡ <strong>IBEDC</strong> (Ibadan Electricity)<br/>
      ⚡ <strong>PHED</strong> (Port Harcourt) &bull; ⚡ <strong>KEDCO</strong> (Kano Electricity)<br/>
      ⚡ <strong>EEDC</strong> (Enugu Electricity) &bull; ⚡ <strong>JED</strong> (Jos Electricity) &bull; ⚡ <strong>KAEDCO</strong> (Kaduna)
    </div>
    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #166534; font-weight: 600;">
      ✓ Automatic meter name validation prevents wrong account top-ups.
    </div>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #0f3dac; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 61, 172, 0.25);">Recharge Meter Token Now</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Keep the lights on with the PayMint app:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Best regards,<br/>The PayMint Team</p>
</div>
{{footerBanner}}`,
  },

  bettingTopUpCashback: {
    id: "bettingTopUpCashback",
    name: "⚽ Betting Top-Up: Instant Wallet Funding + 2% Cashback",
    category: "⚽ Betting & Entertainment",
    subject: "⚽ Fund SportyBet, Bet9ja & 1xBet Instantly + Earn 2% Cashback!",
    campaignName: "Betting Wallet Funding + 2% Cashback",
    desc: "Target sports fans with 2% cashback and zero card payment failures on betting deposits.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">⚽ Zero Delays, Zero Glitches</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">Instant Betting Top-Up + 2% Cashback</h1>
    <p style="color: #dcfce7; font-size: 14px; margin: 0;">Fund SportyBet, Bet9ja, 1xBet & more directly from your PayMint wallet.</p>
  </div>

  <p>Hi <strong>{{firstName}}</strong>,</p>
  <p>Never let a failed debit card transaction make you miss out on high-odds game matches. Top up your betting account in seconds on PayMint and get <strong>2% cashback</strong> credited right back into your PayMint balance!</p>

  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <h3 style="font-size: 15px; margin: 0 0 12px 0; color: #166534; font-weight: 700;">Supported Betting Platforms:</h3>
    <p style="font-size: 14px; color: #14532d; margin: 0 0 10px 0;">⚽ <strong>SportyBet</strong> &bull; ⚽ <strong>Bet9ja</strong> &bull; ⚽ <strong>1xBet</strong> &bull; ⚽ <strong>BetKing</strong> &bull; ⚽ <strong>BangBet</strong> &bull; ⚽ <strong>MerryBet</strong></p>
    <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #14532d; line-height: 1.8;">
      <li>⚡ 100% instant fund reflection into your sportsbook account</li>
      <li>💰 2% cashback automatically refunded to your PayMint balance</li>
      <li>🛡️ Zero bank network downtime or pending debit headaches</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #15803d; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(21, 128, 61, 0.25);">Fund Betting Wallet & Earn 2%</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Fund seamlessly on the PayMint app:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Good luck,<br/>The PayMint Sports & Gaming Team</p>
</div>
{{footerBanner}}`,
  },

  referAndEarnCredits: {
    id: "referAndEarnCredits",
    name: "🤝 Refer & Earn: ₦1,000 Bill Credits for You & Friends",
    category: "🎁 Rewards & Announcements",
    subject: "🤝 Share PayMint with Friends: Earn ₦1,000 Free Bill Credit per Referral!",
    campaignName: "₦1,000 Refer & Earn Bill Credits",
    desc: "Drive organic viral referral loops offering ₦1,000 credits per friend invited.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">🤝 PayMint Referral Club</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">Earn ₦1,000 for Every Friend You Invite</h1>
    <p style="color: #ede9fe; font-size: 14px; margin: 0;">Help your friends save on airtime, data and electricity bills and earn free wallet credits.</p>
  </div>

  <p>Hi <strong>{{firstName}}</strong>,</p>
  <p>Love using PayMint to recharge bills and buy cheap data? Tell your friends and get paid for it! Every time a friend signs up with your referral link and pays their first bill of ₦1,000 or more, you both receive <strong>₦1,000 free wallet bonus</strong>.</p>

  <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <h3 style="font-size: 15px; margin: 0 0 10px 0; color: #5b21b6; font-weight: 700;">How to Start Earning:</h3>
    <ol style="padding-left: 20px; margin: 0; font-size: 14px; color: #4c1d95; line-height: 1.8;">
      <li>Open your PayMint dashboard and copy your unique referral link.</li>
      <li>Share with your friends and family on WhatsApp, Instagram, or X.</li>
      <li>As soon as they recharge, ₦1,000 is credited straight to your wallet!</li>
    </ol>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #7c3aed; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);">Get Your Referral Link</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Invite directly from your mobile contacts:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Warm regards,<br/>The PayMint Team</p>
</div>
{{footerBanner}}`,
  },

  monthlyLeaderboard: {
    id: "monthlyLeaderboard",
    name: "🏆 Bill-Pay Leaderboard: Win Up to ₦20,000 This Month",
    category: "🎁 Rewards & Announcements",
    subject: "🏆 Pay Your Monthly Bills on PayMint & Win Up to ₦20,000 Cash Prizes!",
    campaignName: "Monthly Bill-Pay Leaderboard Challenge",
    desc: "Gamified reward challenge with ₦500,000 prize pool for top utility bill payers.",
    content: `{{headerBanner}}
{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0f3dac 0%, #1e3a8a 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 10px;">🏆 ₦500,000 Monthly Prize Pool</span>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">Win Up to ₦20,000 for Paying Your Bills</h1>
    <p style="color: #bfdbfe; font-size: 14px; margin: 0;">Every utility bill and data recharge earns points on our monthly leaderboard.</p>
  </div>

  <p>Hi <strong>{{firstName}}</strong>,</p>
  <p>Paying monthly household bills shouldn't just be an expense — with PayMint, it enters you into our <strong>Monthly Bill-Pay Challenge</strong> with over ₦500,000 in cash prizes distributed to our top 50 users this month!</p>

  <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <h3 style="font-size: 15px; margin: 0 0 12px 0; color: #1d4ed8; font-weight: 700;">How to Earn Points:</h3>
    <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.8;">
      <li>⚡ <strong>Electricity Bill Recharge:</strong> 50 points per ₦1,000 recharged</li>
      <li>📺 <strong>Cable TV Subscription:</strong> 40 points per renewal</li>
      <li>📶 <strong>Data & Airtime Bundles:</strong> 30 points per ₦1,000 spent</li>
      <li>🥇 <strong>1st Place Prize:</strong> ₦20,000 cash straight into your bank account!</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{website}}" style="background: #0f3dac; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 61, 172, 0.25);">Pay Bills & Climb Leaderboard</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Track your points live on the PayMint app:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Best regards,<br/>The PayMint Team</p>
</div>
{{footerBanner}}`,
  },

  platformUpgradeAnnouncement: {
    id: "platformUpgradeAnnouncement",
    name: "🚀 Official Update: 99.9% Bill Success Rate & Auto-Pay",
    category: "🎁 Rewards & Announcements",
    subject: "🚀 What's New on PayMint: Faster Bill Processing, Auto-Pay & 24/7 Priority Support",
    campaignName: "PayMint System Upgrade Announcement",
    desc: "Professional announcement regarding 99.9% bill uptime, auto-pay, and enhanced live support.",
    content: `{{logo}}
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto;">
  <div style="border-bottom: 2px solid #0f3dac; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="font-size: 20px; font-weight: 800; color: #0f3dac; margin: 0 0 6px 0;">Official Product & Performance Update</h2>
    <span style="font-size: 12px; color: #64748b;">Delivered by PayMint Customer Success & Infrastructure</span>
  </div>

  <p>Dear <strong>{{firstName}}</strong>,</p>
  <p>We are continuously upgrading PayMint to deliver the fastest, most dependable utility bill payment and digital recharge experience in Nigeria. Here is a summary of major improvements rolled out to your account this month:</p>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
    <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #334155; line-height: 1.8;">
      <li><strong>⚡ 99.9% Instant Transaction Delivery:</strong> Direct API tunnels with Discos and telecom providers eliminate pending transactions and failed meter tokens.</li>
      <li><strong>🔄 Scheduled Auto-Recharge:</strong> Set your prepaid meter or monthly data bundle to renew automatically before you run out.</li>
      <li><strong>💳 Direct Virtual Account Funding:</strong> Zero processing delays on bank deposits into your unique PayMint virtual account.</li>
      <li><strong>💬 24/7 Priority In-App Live Chat:</strong> Instant access to human support agents whenever you need assistance.</li>
    </ul>
  </div>

  <p>Log in today to explore the updated features and enjoy fee-free utility payments.</p>

  <div style="text-align: center; margin: 26px 0;">
    <a href="{{website}}" style="background: #0f3dac; color: #ffffff; padding: 13px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14.5px; display: inline-block;">Go to PayMint Dashboard</a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin-bottom: 6px;">Available on all devices:</p>
    <div>
      📱 <a href="{{playStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600; margin-right: 12px;">Google Play Store</a>
      🍏 <a href="{{appStore}}" style="color: #0f3dac; text-decoration: none; font-weight: 600;">Apple App Store</a>
    </div>
  </div>

  <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; text-align: center;">Warm regards,<br/>PayMint Customer Success & Engineering</p>
</div>`,
  },
};

// Aliases for backwards compatibility
EMAIL_TEMPLATES.brandShowcase = EMAIL_TEMPLATES.cashbackElectricityData;
EMAIL_TEMPLATES.executiveLetter = EMAIL_TEMPLATES.platformUpgradeAnnouncement;
EMAIL_TEMPLATES.quickPromo = EMAIL_TEMPLATES.cheapDataPromo;

const CampaignsPage = () => {
  // Queries
  const {
    data: audiences = [],
    isLoading: loadingAudiences,
    refetch: refetchAudiences,
  } = useGetAudiences();

  const {
    data: campaigns = [],
    isLoading: loadingCampaigns,
    refetch: refetchCampaigns,
  } = useGetCampaigns();

  const { data: dailyStats, isLoading: loadingStats } = useGetDailyStats();
  const { data: banners } = useGetEmailBanners();

  // Mutations
  const { mutate: syncSources, isLoading: isSyncing } = useSyncSources();
  const { mutate: previewAlloc, isLoading: isPreviewing } = usePreviewAllocation();
  const { mutate: createCampaign, isLoading: isCreating } = useCreateCampaign();
  const { mutate: updateCampaign, isLoading: isUpdating } = useUpdateCampaign();
  const { mutate: controlCampaign } = useControlCampaign();
  const { mutate: resetAudience, isLoading: isResetting } = useResetAudience();
  const { mutate: deleteAudience, isLoading: isDeletingAud } = useDeleteAudience();
  const { mutate: pruneRecipients, isLoading: isPruning } = usePruneRecipients();
  const { mutate: triggerSweep, isLoading: isSweeping } = useTriggerNightlySweep();

  // UI States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [attributionModalOpen, setAttributionModalOpen] = useState(false);
  const [selectedCampaignForAttr, setSelectedCampaignForAttr] = useState(null);
  const [showCharts, setShowCharts] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editorTab, setEditorTab] = useState("edit"); // "edit" | "preview"
  const [editEditorTab, setEditEditorTab] = useState("edit");

  const [selectedTemplateKey, setSelectedTemplateKey] = useState("cashbackElectricityData");

  // Create Campaign Form State
  const [formData, setFormData] = useState({
    name: EMAIL_TEMPLATES.cashbackElectricityData.campaignName,
    subject: EMAIL_TEMPLATES.cashbackElectricityData.subject,
    senderName: "PayMint",
    senderEmail: "",
    sendingAccount: "dedicated", // "dedicated" (300/d) | "primary" (200/d)
    htmlContent: EMAIL_TEMPLATES.cashbackElectricityData.content,
    dailyLimit: 300,
    allocations: {},
  });

  // Edit Campaign Form State
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    subject: "",
    senderName: "PayMint",
    senderEmail: "",
    sendingAccount: "dedicated",
    htmlContent: "",
    dailyLimit: 300,
  });

  // Allocation Preview Result State
  const [previewResult, setPreviewResult] = useState(null);

  // Template switch handler
  const handleTemplateSelect = (key, isEdit = false) => {
    const tpl = EMAIL_TEMPLATES[key];
    if (!tpl) return;

    if (isEdit) {
      setEditFormData((prev) => ({
        ...prev,
        htmlContent: tpl.content || tpl,
        subject:
          !prev.subject || Object.values(EMAIL_TEMPLATES).some((t) => t.subject === prev.subject)
            ? tpl.subject
            : prev.subject,
      }));
    } else {
      setSelectedTemplateKey(key);
      setFormData((prev) => ({
        ...prev,
        htmlContent: tpl.content || tpl,
        subject:
          !prev.subject || Object.values(EMAIL_TEMPLATES).some((t) => t.subject === prev.subject)
            ? tpl.subject
            : prev.subject,
        name:
          !prev.name || Object.values(EMAIL_TEMPLATES).some((t) => t.campaignName === prev.name)
            ? tpl.campaignName
            : prev.name,
      }));
    }
  };

  // Initialize allocations when opening create modal
  const openCreateModal = () => {
    const initialAlloc = {};
    audiences.forEach((aud) => {
      initialAlloc[aud._id] = {
        count: Math.min(10, aud.uncontactedCount ?? aud.activeCount ?? 0),
        enabled: (aud.activeCount || 0) > 0,
      };
    });

    const defaultTpl = EMAIL_TEMPLATES.cashbackElectricityData;
    setSelectedTemplateKey("cashbackElectricityData");

    setFormData({
      name: defaultTpl.campaignName,
      subject: defaultTpl.subject,
      senderName: "PayMint",
      senderEmail: "",
      sendingAccount: "dedicated",
      htmlContent: defaultTpl.content,
      dailyLimit: 300,
      allocations: initialAlloc,
    });
    setPreviewResult(null);
    setEditorTab("edit");
    setCreateModalOpen(true);
  };

  const openEditModal = (camp) => {
    setEditFormData({
      id: camp._id,
      name: camp.name || "",
      subject: camp.subject || "",
      senderName: camp.senderName || "PayMint",
      senderEmail: camp.senderEmail || "",
      sendingAccount: camp.sendingAccount || "dedicated",
      htmlContent: camp.htmlContent || "",
      dailyLimit: camp.dailyLimit || (camp.sendingAccount === "primary" ? 200 : 300),
    });
    setEditEditorTab("edit");
    setEditModalOpen(true);
  };

  const handleToggleAudience = (audId) => {
    setFormData((prev) => ({
      ...prev,
      allocations: {
        ...prev.allocations,
        [audId]: {
          ...prev.allocations[audId],
          enabled: !prev.allocations[audId]?.enabled,
        },
      },
    }));
  };

  const handleCountChange = (audId, count) => {
    const num = Math.max(0, parseInt(count, 10) || 0);
    setFormData((prev) => ({
      ...prev,
      allocations: {
        ...prev.allocations,
        [audId]: {
          ...prev.allocations[audId],
          count: num,
        },
      },
    }));
  };

  // Helper to insert tags into the create editor
  const insertTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      htmlContent: (prev.htmlContent || "") + `\n${tag}\n`,
    }));
  };

  // Helper to insert tags into the edit editor
  const insertEditTag = (tag) => {
    setEditFormData((prev) => ({
      ...prev,
      htmlContent: (prev.htmlContent || "") + `\n${tag}\n`,
    }));
  };

  // Live HTML Preview Renderer
  const renderPreviewHtml = (rawHtml) => {
    if (!rawHtml) return "<p style='color:#94a3b8; text-align:center;'>No email content entered yet.</p>";

    const logoHtml = banners?.logoUrl
      ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${banners.logoUrl}" alt="PayMint Logo" style="max-height: 48px; max-width: 180px; display: inline-block;" /></div>`
      : `<div style="text-align: center; margin-bottom: 16px; font-weight: bold; font-size: 22px; color: #0f3dac;">PayMint</div>`;

    const headerBannerHtml = banners?.headerBannerUrl
      ? `<div style="text-align: center; margin-bottom: 24px;"><img src="${banners.headerBannerUrl}" alt="Header Banner" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto;" /></div>`
      : `<div style="border: 1px dashed #cbd5e1; padding: 12px; border-radius: 6px; text-align: center; color: #94a3b8; margin-bottom: 20px; font-size: 12px;">[Header Banner Slot]</div>`;

    const footerBannerHtml = banners?.footerBannerUrl
      ? `<div style="text-align: center; margin-top: 24px;"><img src="${banners.footerBannerUrl}" alt="Footer Banner" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto;" /></div>`
      : `<div style="border: 1px dashed #cbd5e1; padding: 12px; border-radius: 6px; text-align: center; color: #94a3b8; margin-top: 20px; font-size: 12px;">[Footer Banner Slot]</div>`;

    return rawHtml
      .replace(/\{\{\s*logo\s*\}\}/gi, logoHtml)
      .replace(/\{\{\s*logoUrl\s*\}\}/gi, banners?.logoUrl || "")
      .replace(/\{\{\s*headerBanner\s*\}\}/gi, headerBannerHtml)
      .replace(/\{\{\s*header_banner\s*\}\}/gi, headerBannerHtml)
      .replace(/\{\{\s*headerBannerUrl\s*\}\}/gi, banners?.headerBannerUrl || "")
      .replace(/\{\{\s*footerBanner\s*\}\}/gi, footerBannerHtml)
      .replace(/\{\{\s*footer_banner\s*\}\}/gi, footerBannerHtml)
      .replace(/\{\{\s*footerBannerUrl\s*\}\}/gi, banners?.footerBannerUrl || "")
      .replace(/\{\{\s*firstName\s*\}\}/gi, "John")
      .replace(/\{\{\s*first_name\s*\}\}/gi, "John")
      .replace(/\{\{\s*name\s*\}\}/gi, "John")
      .replace(/\{\{\s*lastName\s*\}\}/gi, "Doe")
      .replace(/\{\{\s*last_name\s*\}\}/gi, "Doe")
      .replace(/\{\{\s*email\s*\}\}/gi, "john.doe@example.com")
      .replace(/\{\{\s*website\s*\}\}/gi, OFFICIAL_LINKS.website)
      .replace(/\{\{\s*playStore\s*\}\}/gi, OFFICIAL_LINKS.playStore)
      .replace(/\{\{\s*appStore\s*\}\}/gi, OFFICIAL_LINKS.appStore);
  };

  const handleRunPreview = () => {
    const formattedAlloc = [];
    Object.entries(formData.allocations).forEach(([audId, conf]) => {
      if (conf.enabled && conf.count > 0) {
        formattedAlloc.push({
          audienceId: audId,
          requestedCount: conf.count,
        });
      }
    });

    if (formattedAlloc.length === 0) {
      alert("Please enable at least one dataset and specify a count > 0.");
      return;
    }

    previewAlloc(formattedAlloc, {
      onSuccess: (data) => {
        setPreviewResult(data);
      },
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim() || !formData.htmlContent.trim()) {
      alert("Please fill in Campaign Name, Subject, and Content.");
      return;
    }

    const formattedAlloc = [];
    Object.entries(formData.allocations).forEach(([audId, conf]) => {
      if (conf.enabled && conf.count > 0) {
        formattedAlloc.push({
          audienceId: audId,
          requestedCount: conf.count,
        });
      }
    });

    if (formattedAlloc.length === 0) {
      alert("Please select at least one database source with requested contacts.");
      return;
    }

    createCampaign(
      {
        name: formData.name,
        subject: formData.subject,
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        sendingAccount: formData.sendingAccount,
        htmlContent: formData.htmlContent,
        dailyLimit: formData.dailyLimit,
        allocations: formattedAlloc,
      },
      {
        onSuccess: () => {
          setCreateModalOpen(false);
          setPreviewResult(null);
        },
      }
    );
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.subject.trim() || !editFormData.htmlContent.trim()) {
      alert("Please fill in Campaign Name, Subject, and Content.");
      return;
    }

    updateCampaign(
      {
        id: editFormData.id,
        data: {
          name: editFormData.name,
          subject: editFormData.subject,
          senderName: editFormData.senderName,
          senderEmail: editFormData.senderEmail,
          sendingAccount: editFormData.sendingAccount,
          htmlContent: editFormData.htmlContent,
          dailyLimit: editFormData.dailyLimit,
        },
      },
      {
        onSuccess: () => {
          setEditModalOpen(false);
        },
      }
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "sending":
        return <Badge color="warning">Sending</Badge>;
      case "completed":
        return <Badge color="success">Completed</Badge>;
      case "paused":
        return <Badge color="secondary">Paused</Badge>;
      case "queued":
        return <Badge color="info">Queued</Badge>;
      case "cancelled":
        return <Badge color="danger">Cancelled</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  // Top stat aggregations
  const totalAudienceContacts = useMemo(() => {
    return audiences.reduce((sum, a) => sum + (a.totalContacts || 0), 0);
  }, [audiences]);

  const totalUncontacted = useMemo(() => {
    return audiences.reduce((sum, a) => sum + (a.uncontactedCount ?? a.activeCount ?? 0), 0);
  }, [audiences]);

  const totalConversions = useMemo(() => {
    let signups = 0;
    let txs = 0;
    let vol = 0;
    campaigns.forEach((c) => {
      signups += c.signupsCount || 0;
      txs += c.firstTransactionsCount || 0;
      vol += c.totalTransactionVolume || 0;
    });
    return { signups, txs, vol };
  }, [campaigns]);

  // Comparative Dataset Performance for Bar Chart
  const datasetComparisonChart = useMemo(() => {
    if (!audiences.length) return null;

    const labels = audiences.map((a) => a.name);
    const totalContactsData = audiences.map((a) => a.totalContacts || 0);

    const sentData = audiences.map((aud) => {
      let count = 0;
      campaigns.forEach((c) => {
        const metric = c.perSourceMetrics?.find(
          (m) => m.sourceName === aud.sourceFileName || m.sourceName === aud.name
        );
        if (metric) count += metric.sentCount || 0;
      });
      return count;
    });

    const openData = audiences.map((aud) => {
      let count = 0;
      campaigns.forEach((c) => {
        const metric = c.perSourceMetrics?.find(
          (m) => m.sourceName === aud.sourceFileName || m.sourceName === aud.name
        );
        if (metric) count += metric.openCount || 0;
      });
      return count;
    });

    const clickData = audiences.map((aud) => {
      let count = 0;
      campaigns.forEach((c) => {
        const metric = c.perSourceMetrics?.find(
          (m) => m.sourceName === aud.sourceFileName || m.sourceName === aud.name
        );
        if (metric) count += metric.clickCount || 0;
      });
      return count;
    });

    const conversionData = audiences.map((aud) => {
      let count = 0;
      campaigns.forEach((c) => {
        const metric = c.perSourceMetrics?.find(
          (m) => m.sourceName === aud.sourceFileName || m.sourceName === aud.name
        );
        if (metric) count += metric.firstTransactionsCount || 0;
      });
      return count;
    });

    return {
      labels,
      datasets: [
        {
          label: "Total Contacts",
          data: totalContactsData,
          backgroundColor: "rgba(148, 163, 184, 0.6)",
          borderColor: "#94a3b8",
          borderWidth: 1,
        },
        {
          label: "Emails Sent",
          data: sentData,
          backgroundColor: "rgba(15, 61, 172, 0.7)",
          borderColor: "#0f3dac",
          borderWidth: 1,
        },
        {
          label: "Opens",
          data: openData,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "#10b981",
          borderWidth: 1,
        },
        {
          label: "Clicks",
          data: clickData,
          backgroundColor: "rgba(245, 158, 11, 0.7)",
          borderColor: "#f59e0b",
          borderWidth: 1,
        },
        {
          label: "Trades Completed",
          data: conversionData,
          backgroundColor: "rgba(139, 92, 246, 0.8)",
          borderColor: "#8b5cf6",
          borderWidth: 1,
        },
      ],
    };
  }, [audiences, campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      const matchesStatus = statusFilter === "all" || camp.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        camp.name?.toLowerCase().includes(query) ||
        camp.subject?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [campaigns, statusFilter, searchQuery]);

  return (
    <>
      <Head title="Email Campaigns & Content Editor"></Head>
      <Content>
        {/* Modern Page Header */}
        <div className="campaign-page-header">
          <div className="campaign-header-title">
            <h2>Email Campaigns & Performance</h2>
            <p>
              Multi-database campaign engine. Slice quotas across JSON datasets, customize email copy with banners & dynamic tags, and monitor conversion ROI.
            </p>
          </div>
          <div className="campaign-header-actions">
            <button
              type="button"
              onClick={() => setShowCharts(!showCharts)}
              className="campaign-btn campaign-btn-outline"
            >
              <Icon name={showCharts ? "eye-off" : "bar-chart"} />
              <span>{showCharts ? "Hide Chart" : "Show Comparison Chart"}</span>
            </button>

            <UncontrolledDropdown>
              <DropdownToggle
                tag="button"
                className="campaign-btn campaign-btn-outline"
              >
                <Icon name="setting" />
                <span>Data Cleanup</span>
                <Icon name="chevron-down" className="ms-1" style={{ fontSize: "10px" }} />
              </DropdownToggle>
              <DropdownMenu end style={{ zIndex: 1060 }}>
                <DropdownItem
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to reset contact history for ALL datasets? All contacts will be marked uncontacted and available for new campaigns."
                      )
                    ) {
                      resetAudience("all");
                    }
                  }}
                >
                  <Icon name="reload" className="me-2 text-warning" />
                  <span>Reset All Contacted History</span>
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    if (
                      window.confirm(
                        "Purge recipient delivery logs for all completed & cancelled campaigns? This frees database storage while preserving your campaign summary metrics."
                      )
                    ) {
                      pruneRecipients("completed");
                    }
                  }}
                >
                  <Icon name="trash" className="me-2 text-danger" />
                  <span>Prune Completed Recipient Logs</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>

            <button
              type="button"
              onClick={() => syncSources()}
              disabled={isSyncing}
              className="campaign-btn campaign-btn-outline"
            >
              <Icon name="reload" className={isSyncing ? "spinner-border spinner-border-sm" : ""} />
              <span>{isSyncing ? "Syncing..." : "Sync JSON Databases"}</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="campaign-btn campaign-btn-primary"
            >
              <Icon name="plus" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>

        {/* Top Metric & Quota Section */}
        <div className="mb-4">
          {/* Nightly 11:30 PM Quota Sweep Banner */}
          <div className="campaign-sweep-card">
            <div className="d-flex align-items-center gap-3">
              <div className="campaign-sweep-icon">
                🌙
              </div>
              <div>
                <div className="campaign-sweep-title">
                  <span>Nightly 11:30 PM Quota Sweep</span>
                  <Badge color="success" className="px-2 py-1 fs-11px">Auto-Scheduled (23:30 WAT)</Badge>
                  <Badge color="light" className="border text-dark px-2 py-1 fs-11px">50 Safety Reserve Kept for OTPs</Badge>
                </div>
                <div className="campaign-sweep-desc">
                  🚀 Dedicated Brevo: <strong>{dailyStats?.dedicatedSentToday || 0} / {dailyStats?.dedicatedLimit || 300}</strong> (100% Campaign) &bull; 
                  🛡️ Primary Platform Brevo: <strong>{dailyStats?.totalBrevoSentToday || 0} / {dailyStats?.accountLimit || 300}</strong> (Tx OTPs: {dailyStats?.transactionalSentToday || 0}, Primary Campaign: {dailyStats?.primarySentToday || 0}) &bull; 
                  Unused Sweepable: <strong className="text-success">{dailyStats?.sweepEligibleQuota ?? 0} bonus emails</strong>
                </div>
              </div>
            </div>
            <div>
              <button
                type="button"
                className="campaign-btn campaign-btn-outline border-success text-success"
                onClick={() => {
                  if (
                    window.confirm(
                      `Trigger immediate Nightly Sweep for up to ${dailyStats?.sweepEligibleQuota || 0} bonus emails while preserving the 50-email OTP buffer?`
                    )
                  ) {
                    triggerSweep();
                  }
                }}
                disabled={isSweeping || (dailyStats?.sweepEligibleQuota || 0) <= 0}
              >
                <Icon name="play" className="me-1" />
                <span>{isSweeping ? "Sweeping..." : "Run Sweep Now"}</span>
              </button>
            </div>
          </div>

          <Row className="g-3">
            {/* Brevo Daily Quota Card */}
            <Col sm="6" lg="3">
              <div className="campaign-stat-box">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="campaign-stat-label">Daily Sending Capacity</span>
                    <Badge color="success" className="fs-10px">Dual Brevo (500/d)</Badge>
                  </div>
                  <div className="campaign-stat-number">
                    {dailyStats?.sentToday || 0}
                    <small>/ {dailyStats?.dailyLimit || 500} sent</small>
                  </div>
                  <div className="campaign-progress-bar">
                    <div
                      className="campaign-progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((dailyStats?.sentToday || 0) / (dailyStats?.dailyLimit || 500)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="campaign-stat-meta d-flex justify-content-between">
                  <span>🚀 Dedicated: {dailyStats?.dedicatedSentToday || 0}/300</span>
                  <span>🛡️ Primary: {dailyStats?.primarySentToday || 0}/200</span>
                </div>
              </div>
            </Col>

            {/* Total Databases / Contacts */}
            <Col sm="6" lg="3">
              <div className="campaign-stat-box">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="campaign-stat-label">Contact Databases</span>
                    <Badge color="info" className="fs-10px">{audiences.length} Sources</Badge>
                  </div>
                  <div className="campaign-stat-number">
                    {totalUncontacted}
                    <small>fresh / {totalAudienceContacts} total</small>
                  </div>
                </div>
                <div className="campaign-stat-meta">
                  Source: Backend <code className="bg-light text-dark px-1 py-0.5 rounded">src/data/*.json</code>
                </div>
              </div>
            </Col>

            {/* Campaigns Run */}
            <Col sm="6" lg="3">
              <div className="campaign-stat-box">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="campaign-stat-label">Total Campaigns</span>
                    <Badge color="primary" className="fs-10px">{campaigns.length} Total</Badge>
                  </div>
                  <div className="campaign-stat-number">
                    {campaigns.filter((c) => ["sending", "queued"].includes(c.status)).length}
                    <small>active / {campaigns.length} total</small>
                  </div>
                </div>
                <div className="campaign-stat-meta">
                  Micro-batch throttle via Brevo
                </div>
              </div>
            </Col>

            {/* Conversions & Volume */}
            <Col sm="6" lg="3">
              <div className="campaign-stat-box">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="campaign-stat-label">Attributed ROI & Volume</span>
                    <Badge color="success" className="fs-10px">Verified</Badge>
                  </div>
                  <div className="campaign-stat-number text-success">
                    {totalConversions.signups}{" "}
                    <small className="text-muted fw-normal">users ({totalConversions.txs} trades)</small>
                  </div>
                </div>
                <div className="campaign-stat-meta fw-medium text-dark">
                  ₦{totalConversions.vol.toLocaleString()} total trade volume
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Visual Comparison Bar Chart Card */}
        {showCharts && datasetComparisonChart && audiences.length > 0 && (
          <div className="card card-bordered mb-4">
            <CardBody className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-0 fw-bold">Cross-Database Performance Comparison</h6>
                  <small className="text-soft">
                    Compare contacts, sends, opens, clicks, and conversions across your JSON datasets
                  </small>
                </div>
                <Badge color="light" className="border">
                  {audiences.length} Datasets Tracked
                </Badge>
              </div>
              <div style={{ height: "260px" }}>
                <Bar
                  data={datasetComparisonChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: { mode: "index", intersect: false },
                    },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                    },
                  }}
                />
              </div>
            </CardBody>
          </div>
        )}

        {/* Audience Databases Grid */}
        <div className="mb-4">
          <div className="campaign-section-title">
            <h5>Email Databases & Cleanup ({audiences.length})</h5>
            <span className="text-soft fs-12px">
              Backend storage: <code className="bg-light text-dark px-1.5 py-0.5 rounded">src/data/*.json</code>
            </span>
          </div>

          {loadingAudiences ? (
            <div className="text-center py-4">
              <LoadingSpinner />
            </div>
          ) : audiences.length === 0 ? (
            <div className="card card-bordered p-4 text-center bg-white rounded-3">
              <div className="campaign-empty-icon-box mx-auto">
                <Icon name="folder" />
              </div>
              <div className="campaign-empty-title">No audience databases found</div>
              <p className="campaign-empty-text">
                Place your customer audience JSON files in <code>src/data/</code> on the backend and click sync to index contacts.
              </p>
              <div>
                <button
                  type="button"
                  className="campaign-btn campaign-btn-primary"
                  onClick={() => syncSources()}
                  disabled={isSyncing}
                >
                  <Icon name="reload" className={isSyncing ? "spinner-border spinner-border-sm me-1" : "me-1"} />
                  <span>{isSyncing ? "Syncing..." : "Sync Databases Now"}</span>
                </button>
              </div>
            </div>
          ) : (
            <Row className="g-3">
              {audiences.map((aud) => (
                <Col sm="6" md="4" lg="3" key={aud._id}>
                  <div className="campaign-audience-card">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0 text-truncate fw-bold text-dark" title={aud.name}>
                          {aud.name}
                        </h6>
                        <UncontrolledDropdown>
                          <DropdownToggle tag="button" className="btn btn-icon btn-trigger btn-sm">
                            <Icon name="more-h" />
                          </DropdownToggle>
                          <DropdownMenu end style={{ zIndex: 1060 }}>
                            <DropdownItem
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Reset contact history for "${aud.name}"? Contacts will be marked uncontacted and available for new campaigns.`
                                  )
                                ) {
                                  resetAudience(aud._id);
                                }
                              }}
                            >
                              <Icon name="reload" className="me-2 text-warning" />
                              <span>Reset Contacts to Uncontacted</span>
                            </DropdownItem>
                            <DropdownItem
                              className="text-danger"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete "${aud.name}" and its indexed contacts from database? (JSON file in src/data/ remains safe)`
                                  )
                                ) {
                                  deleteAudience(aud._id);
                                }
                              }}
                            >
                              <Icon name="trash" className="me-2" />
                              <span>Delete from DB</span>
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>

                      <div className="d-flex align-items-baseline gap-2 mb-2">
                        <span className="h4 mb-0 text-primary fw-bold">
                          {aud.uncontactedCount ?? aud.activeCount}
                        </span>
                        <span className="text-soft fs-12px">fresh / {aud.totalContacts} total</span>
                      </div>

                      <div className="d-flex justify-content-between text-soft fs-11px border-top pt-2">
                        <span>Bounced: {aud.bouncedCount || 0}</span>
                        <span>Unsub: {aud.unsubscribedCount || 0}</span>
                        <Badge color="light" className="text-lowercase fs-10px border">
                          {aud.filename}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-top text-soft fs-11px d-flex justify-content-between align-items-center">
                      <span>Synced: {formatDateWithTime(aud.lastSyncedAt)}</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Campaigns List Card with Unified Filter Toolbar (Eliminating Overlap & Misplaced Z-Index) */}
        <div className="campaign-table-card">
          <div className="campaign-table-header">
            <h5 className="campaign-table-header-title">Campaigns & Attribution Performance</h5>

            <div className="campaign-table-toolbar">
              {/* Search Bar */}
              <div className="campaign-search-input-wrap">
                <Icon name="search" className="search-icon" />
                <input
                  type="text"
                  className="campaign-search-input"
                  placeholder="Filter campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="campaign-filter-tabs">
                {["all", "sending", "completed", "paused", "cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`campaign-filter-tab ${statusFilter === st ? "active" : ""}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                className="campaign-btn campaign-btn-outline"
                onClick={() => refetchCampaigns()}
              >
                <Icon name="reload" className="me-1" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Card Body: Spinner, Empty State, or Data Table */}
          {loadingCampaigns ? (
            <div className="text-center py-5">
              <LoadingSpinner />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="campaign-empty-state">
              <div className="campaign-empty-icon-box">
                <Icon name="mail" />
              </div>
              <div className="campaign-empty-title">
                {campaigns.length === 0
                  ? "No email campaigns created yet"
                  : "No campaigns matching your filter"}
              </div>
              <p className="campaign-empty-text">
                {campaigns.length === 0
                  ? "Create multi-source recipient slices, customize email copy with banners & dynamic tags, and monitor trade conversion ROI."
                  : "Try adjusting your search keyword or switching between All, Sending, or Completed tabs."}
              </p>
              {campaigns.length === 0 && (
                <button
                  type="button"
                  className="campaign-btn campaign-btn-primary"
                  onClick={openCreateModal}
                >
                  <Icon name="plus" />
                  <span>Create First Campaign</span>
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="campaign-table">
                <thead>
                  <tr>
                    <th>Campaign & Subject</th>
                    <th>Sources Sliced</th>
                    <th>Progress / Sent</th>
                    <th>Status</th>
                    <th>Brevo Metrics</th>
                    <th>Conversions</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((camp) => {
                    const total = camp.totalRecipients || 0;
                    const sent = camp.sentCount || 0;
                    const progressPct = total > 0 ? Math.round((sent / total) * 100) : 0;
                    const openPct = sent > 0 ? Math.round(((camp.openedCount || 0) / sent) * 100) : 0;
                    const clickPct = sent > 0 ? Math.round(((camp.clickedCount || 0) / sent) * 100) : 0;

                    return (
                      <tr key={camp._id}>
                        <td>
                          <div className="d-flex align-items-center gap-1 flex-wrap">
                            <span className="fw-bold text-dark">{camp.name}</span>
                            {camp.sendingAccount === "primary" ? (
                              <Badge color="light" className="border text-primary fs-10px">
                                🛡️ Primary (200/d)
                              </Badge>
                            ) : (
                              <Badge color="light" className="border text-success fs-10px">
                                🚀 Dedicated (300/d)
                              </Badge>
                            )}
                          </div>
                          <div className="text-soft fs-12px text-truncate" style={{ maxWidth: "260px" }}>
                            {camp.subject}
                          </div>
                          <div className="text-soft fs-11px mt-1">
                            Created: {formatDateWithTime(camp.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1" style={{ maxWidth: "200px" }}>
                            {camp.allocations?.map((a, i) => (
                              <Badge key={i} color="light" className="text-dark fs-11px border">
                                {a.audienceName || "Source"}: {a.requestedCount}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td style={{ minWidth: "150px" }}>
                          <div className="d-flex justify-content-between fs-12px mb-1">
                            <span className="fw-medium">{sent} / {total}</span>
                            <span className="text-soft">{progressPct}%</span>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar ${
                                camp.status === "completed" ? "bg-success" : "bg-primary"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          {camp.failedCount > 0 && (
                            <div className="text-danger fs-11px mt-1">
                              {camp.failedCount} delivery errors
                            </div>
                          )}
                        </td>
                        <td>{getStatusBadge(camp.status)}</td>
                        <td>
                          <div className="fs-12px">
                            <span className="text-success fw-medium">
                              {camp.deliveredCount || 0}
                            </span>{" "}
                            delivered
                          </div>
                          <div className="text-soft fs-11px">
                            Opens: {camp.openedCount || 0} ({openPct}%)
                          </div>
                          <div className="text-soft fs-11px">
                            Clicks: {camp.clickedCount || 0} ({clickPct}%)
                          </div>
                        </td>
                        <td>
                          <div className="fs-12px fw-medium text-primary">
                            {camp.signupsCount || 0} signups
                          </div>
                          <div className="text-soft fs-11px">
                            {camp.firstTransactionsCount || 0} trades
                          </div>
                          {(camp.totalTransactionVolume || 0) > 0 && (
                            <div className="text-success fs-11px fw-medium">
                              ₦{camp.totalTransactionVolume.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="text-end">
                          <UncontrolledDropdown>
                            <DropdownToggle tag="button" className="btn btn-icon btn-trigger">
                              <Icon name="more-h" />
                            </DropdownToggle>
                            <DropdownMenu end style={{ zIndex: 1060 }}>
                              <DropdownItem onClick={() => openEditModal(camp)}>
                                <Icon name="edit" className="me-2 text-primary" />
                                <span>Edit Content & Settings</span>
                              </DropdownItem>

                              <DropdownItem
                                onClick={() => {
                                  setSelectedCampaignForAttr(camp);
                                  setAttributionModalOpen(true);
                                }}
                              >
                                <Icon name="reports-alt" className="me-2" />
                                <span>View Attribution & ROI</span>
                              </DropdownItem>

                              {["sending", "queued"].includes(camp.status) && (
                                <DropdownItem
                                  onClick={() =>
                                    controlCampaign({ id: camp._id, action: "pause" })
                                  }
                                >
                                  <Icon name="pause" className="me-2" />
                                  <span>Pause Delivery</span>
                                </DropdownItem>
                              )}

                              {camp.status === "paused" && (
                                <DropdownItem
                                  onClick={() =>
                                    controlCampaign({ id: camp._id, action: "resume" })
                                  }
                                >
                                  <Icon name="play" className="me-2" />
                                  <span>Resume Delivery</span>
                                </DropdownItem>
                              )}

                              {["sending", "queued", "paused"].includes(camp.status) && (
                                <DropdownItem
                                  className="text-danger"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to cancel this campaign? Remaining unsent recipients will not be sent."
                                      )
                                    ) {
                                      controlCampaign({ id: camp._id, action: "cancel" });
                                    }
                                  }}
                                >
                                  <Icon name="cross-circle" className="me-2" />
                                  <span>Cancel Campaign</span>
                                </DropdownItem>
                              )}

                              {["completed", "cancelled"].includes(camp.status) && (
                                <DropdownItem
                                  className="text-danger"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Purge detailed recipient delivery logs for this campaign? (Summary stats and attribution ROI are preserved)"
                                      )
                                    ) {
                                      pruneRecipients(camp._id);
                                    }
                                  }}
                                >
                                  <Icon name="trash" className="me-2" />
                                  <span>Purge Recipient Logs</span>
                                </DropdownItem>
                              )}
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </div>

        {/* Modal: Create Campaign & Multi-Source Slicer */}
        <Modal
          isOpen={createModalOpen}
          toggle={() => setCreateModalOpen(!createModalOpen)}
          size="xl"
          backdrop="static"
          className="campaign-create-modal"
        >
          <ModalHeader toggle={() => setCreateModalOpen(false)}>
            Create Campaign & Email Content
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleCreateSubmit}>
              {/* Campaign Details */}
              <div className="campaign-form-grid">
                <div className="campaign-form-field">
                  <label>Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 5% Electricity & Data Cashback Blitz"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="campaign-form-field">
                  <label>Sender Name</label>
                  <input
                    type="text"
                    placeholder="e.g. PayMint"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    required
                  />
                </div>
                <div className="campaign-form-field">
                  <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Sending Account / Brevo Channel
                    <Badge color={formData.sendingAccount === "dedicated" ? "success" : "primary"} style={{ fontSize: "10px" }}>
                      {formData.sendingAccount === "dedicated" ? "Dedicated (300/day)" : "Platform Shared (200/day)"}
                    </Badge>
                  </label>
                  <select
                    value={formData.sendingAccount}
                    onChange={(e) => {
                      const acc = e.target.value;
                      setFormData({ ...formData, sendingAccount: acc, dailyLimit: acc === "primary" ? 200 : 300 });
                    }}
                  >
                    <option value="dedicated">🚀 Dedicated Campaign Brevo (Account 2 - Full 300/day Isolated)</option>
                    <option value="primary">🛡️ Primary Platform Brevo (Account 1 - 200/day + Night Sweep)</option>
                  </select>
                  <div className="field-hint">
                    {formData.sendingAccount === "dedicated"
                      ? "Uses Account 2 credentials (100% reserved for campaigns, zero risk to transactional OTPs)."
                      : "Uses Primary Brevo account (200 daytime cap + 11:30 PM sweep, preserves 50 OTP reserve)."}
                  </div>
                </div>
                <div className="campaign-form-field">
                  <label>Daily Throttling Limit</label>
                  <input
                    type="number"
                    value={formData.dailyLimit}
                    min="1"
                    max="10000"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyLimit: parseInt(e.target.value, 10) || (formData.sendingAccount === "primary" ? 200 : 300),
                      })
                    }
                    required
                  />
                  <div className="field-hint">
                    {formData.sendingAccount === "dedicated" ? "Recommended limit: 300 / day" : "Recommended limit: 200 / day"}
                  </div>
                </div>
                <div className="campaign-form-field full-width">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <label style={{ margin: 0 }}>Email Subject</label>
                    {EMAIL_TEMPLATES[selectedTemplateKey]?.subject && formData.subject !== EMAIL_TEMPLATES[selectedTemplateKey].subject && (
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          color: "#0f3dac",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={() => setFormData({ ...formData, subject: EMAIL_TEMPLATES[selectedTemplateKey].subject })}
                      >
                        💡 Use Template Subject: "{EMAIL_TEMPLATES[selectedTemplateKey].subject.substring(0, 42)}..."
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. ⚡ Get 5% Instant Cashback on All Electricity & Data Recharges!"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Multi-Source Database Slicing Box */}
              <div className="campaign-db-section">
                <div className="campaign-db-section-header">
                  <p className="campaign-db-section-title">
                    <Icon name="layers" style={{ color: "#0f3dac" }} />
                    Select Recipient Slices from Databases
                  </p>
                  <Button
                    color="primary"
                    size="sm"
                    outline
                    type="button"
                    onClick={handleRunPreview}
                    disabled={isPreviewing}
                  >
                    <Icon name="eye" className="me-1" />
                    {isPreviewing ? "Calculating..." : "Preview Deduplication & Slices"}
                  </Button>
                </div>
                <p className="campaign-db-section-desc">
                  Specify how many contacts to slice from each database. Uncontacted contacts are prioritized. Duplicate emails across databases and unsubscribes are automatically filtered out.
                </p>

                {audiences.map((aud) => {
                  const conf = formData.allocations[aud._id] || { count: 0, enabled: false };
                  const freshCount = aud.uncontactedCount ?? aud.activeCount ?? 0;
                  return (
                    <div
                      key={aud._id}
                      className="campaign-slice-row"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          id={`aud_${aud._id}`}
                          checked={conf.enabled}
                          onChange={() => handleToggleAudience(aud._id)}
                        />
                        <label
                          htmlFor={`aud_${aud._id}`}
                          className="form-check-label fw-bold mb-0 cursor-pointer"
                        >
                          {aud.name}{" "}
                          <span className="text-soft fw-normal fs-12px">({aud.filename})</span>
                        </label>
                        <Badge color="light" className="text-success border ms-2">
                          Fresh / Uncontacted: {freshCount}
                        </Badge>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-12px text-soft">Slice Count:</span>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          style={{ width: "90px" }}
                          min="1"
                          max={aud.totalContacts || 100000}
                          value={conf.count}
                          disabled={!conf.enabled}
                          onChange={(e) => handleCountChange(aud._id, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Dry Run Preview Breakdown */}
                {previewResult && (
                  <div className="mt-3 p-3 bg-white rounded border border-info">
                    <h6 className="text-info fs-13px mb-2">
                      <Icon name="check-circle" className="me-1" />
                      Allocation & Deduplication Dry-Run Summary
                    </h6>
                    <div className="row g-2 text-center">
                      <div className="col-3">
                        <div className="fs-11px text-soft">Total Requested</div>
                        <div className="fw-bold fs-14px">{previewResult.totalRequested}</div>
                      </div>
                      <div className="col-3">
                        <div className="fs-11px text-warning">Cross-List Overlaps</div>
                        <div className="fw-bold fs-14px text-warning">
                          -{previewResult.overlapsResolved ?? previewResult.duplicatesExcluded ?? 0}
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="fs-11px text-danger">Suppressed / Bounced</div>
                        <div className="fw-bold fs-14px text-danger">
                          -{previewResult.suppressedSkipped ?? previewResult.suppressedExcluded ?? 0}
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="fs-11px text-success">Net Unique Recipients</div>
                        <div className="fw-bold fs-14px text-success">
                          {previewResult.totalUniqueAllocated ?? previewResult.finalUniqueRecipients}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Content Section with Banners & Live Preview */}
              <div className="campaign-email-section">
                <div className="campaign-email-section-header">
                  <p className="campaign-email-section-title">
                    <Icon name="mail" style={{ color: "#0f3dac" }} />
                    Email Message Content & Banners
                  </p>
                  {/* Template Quick Select */}
                  <div className="campaign-template-selector-box">
                    <span className="campaign-template-selector-label">
                      <Icon name="layout" className="me-1 text-primary" />
                      Choose Template Preset:
                    </span>
                    <select
                      className="campaign-template-select"
                      value={selectedTemplateKey}
                      onChange={(e) => handleTemplateSelect(e.target.value, false)}
                    >
                      <optgroup label="🔥 Cashback & Discounts">
                        <option value="cashbackElectricityData">⚡ 5% Cashback: Electricity & Data Weekend Blitz</option>
                        <option value="walletFundingBonus">🎁 Wallet Bonus: Fund ₦5,000+ & Claim ₦500 Free Credit</option>
                      </optgroup>
                      <optgroup label="💡 Utilities & Electricity Bills">
                        <option value="electricityMeterRescue">💡 Electricity Meter: Instant 20-Digit Token in 3s</option>
                        <option value="zeroFeeCable">📺 Zero Convenience Fee: DSTV, GOtv & StarTimes</option>
                      </optgroup>
                      <optgroup label="📶 Data & Airtime Deals">
                        <option value="cheapDataPromo">📶 Cheap Data: High-Speed SME & Direct from ₦220/GB</option>
                        <option value="airtimeSurgeDiscount">📞 Airtime Surge: Instant Up to 6% Discount on Recharge</option>
                      </optgroup>
                      <optgroup label="⚽ Betting & Entertainment">
                        <option value="bettingTopUpCashback">⚽ Betting Top-Up: Instant Wallet Funding + 2% Cashback</option>
                      </optgroup>
                      <optgroup label="🎁 Rewards & Announcements">
                        <option value="referAndEarnCredits">🤝 Refer & Earn: ₦1,000 Bill Credits for You & Friends</option>
                        <option value="monthlyLeaderboard">🏆 Bill-Pay Leaderboard: Win Up to ₦20,000 This Month</option>
                        <option value="platformUpgradeAnnouncement">🚀 Official Update: 99.9% Bill Success Rate & Auto-Pay</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {EMAIL_TEMPLATES[selectedTemplateKey]?.desc && (
                  <div className="mb-2">
                    <span className="campaign-template-desc-badge">
                      <Icon name="check-circle" />
                      {EMAIL_TEMPLATES[selectedTemplateKey].desc}
                    </span>
                  </div>
                )}

                {/* Banner Status Chips */}
                <div className="campaign-banner-status-bar">
                  <span style={{ fontWeight: 700, color: "#374151" }}>Active Banners:</span>
                  <Badge color={banners?.logoUrl ? "success" : "light"} className="border">
                    {banners?.logoUrl ? "✓ Logo Set" : "Logo Not Configured"}
                  </Badge>
                  <Badge color={banners?.headerBannerUrl ? "success" : "light"} className="border">
                    {banners?.headerBannerUrl ? "✓ Header Banner Set" : "Header Banner Not Set"}
                  </Badge>
                  <Badge color={banners?.footerBannerUrl ? "success" : "light"} className="border">
                    {banners?.footerBannerUrl ? "✓ Footer Banner Set" : "Footer Banner Not Set"}
                  </Badge>
                </div>

                {/* Tag insertion chips */}
                <div>
                  <div className="campaign-tag-chips-label">Click a tag to insert into your email copy:</div>
                  <div className="campaign-tag-chips-row">
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{logo}}")}
                      title="Inserts PayMint Logo Image"
                    >
                      + {"{{logo}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{headerBanner}}")}
                      title="Inserts Header Banner Image"
                    >
                      + {"{{headerBanner}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{footerBanner}}")}
                      title="Inserts Footer Banner Image"
                    >
                      + {"{{footerBanner}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{firstName}}")}
                    >
                      + {"{{firstName}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{lastName}}")}
                    >
                      + {"{{lastName}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{email}}")}
                    >
                      + {"{{email}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{website}}")}
                    >
                      + {"{{website}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{playStore}}")}
                    >
                      + {"{{playStore}}"}
                    </button>
                    <button
                      type="button"
                      className="campaign-tag-chip"
                      onClick={() => insertTag("{{appStore}}")}
                    >
                      + {"{{appStore}}"}
                    </button>
                  </div>
                </div>

                {/* Editor vs Live Preview Tabs */}
                <div className="campaign-editor-tabs">
                  <button
                    type="button"
                    className={`campaign-editor-tab${editorTab === "edit" ? " active" : ""}`}
                    onClick={() => setEditorTab("edit")}
                  >
                    <Icon name="code" />
                    Edit HTML / Content
                  </button>
                  <button
                    type="button"
                    className={`campaign-editor-tab${editorTab === "preview" ? " active" : ""}`}
                    onClick={() => setEditorTab("preview")}
                  >
                    <Icon name="eye" />
                    Live Email Preview
                  </button>
                </div>

                {editorTab === "edit" ? (
                  <div>
                    <textarea
                      className="campaign-html-editor"
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "16px",
                      maxHeight: "260px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "20px",
                        maxWidth: "560px",
                        margin: "0 auto",
                        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.08)",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: renderPreviewHtml(formData.htmlContent),
                      }}
                    />
                  </div>
                )}

                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "0.5rem" }}>
                  A compliant 1-click unsubscribe footer and conversion tracking tags (
                  <code>pm_cid</code>, <code>pm_src</code>) are automatically attached to all links.
                </div>
              </div>

              <div className="campaign-modal-footer">
                <Button color="light" type="button" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" disabled={isCreating}>
                  {isCreating ? "Queueing Campaign..." : "Launch & Queue Campaign"}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>

        {/* Modal: Edit Existing Campaign */}
        <Modal
          isOpen={editModalOpen}
          toggle={() => setEditModalOpen(!editModalOpen)}
          size="xl"
          backdrop="static"
          className="campaign-edit-modal"
        >
          <ModalHeader toggle={() => setEditModalOpen(false)}>
            Edit Campaign Content & Settings
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <div className="row g-3 mb-3">
                <Col md="6">
                  <label className="form-label fw-bold">Campaign Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold">Sender Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.senderName}
                    onChange={(e) => setEditFormData({ ...editFormData, senderName: e.target.value })}
                    required
                  />
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold d-flex align-items-center gap-1">
                    <span>Sending Account / Brevo Channel</span>
                    <Badge color={editFormData.sendingAccount === "dedicated" ? "success" : "primary"} className="fs-10px">
                      {editFormData.sendingAccount === "dedicated" ? "Dedicated (300/day)" : "Platform Shared (200/day)"}
                    </Badge>
                  </label>
                  <select
                    className="form-select"
                    value={editFormData.sendingAccount}
                    onChange={(e) => {
                      const acc = e.target.value;
                      setEditFormData({
                        ...editFormData,
                        sendingAccount: acc,
                        dailyLimit: acc === "primary" ? 200 : 300,
                      });
                    }}
                  >
                    <option value="dedicated">🚀 Dedicated Campaign Brevo (Account 2 - Full 300/day Isolated)</option>
                    <option value="primary">🛡️ Primary Platform Brevo (Account 1 - 200/day + Night Sweep)</option>
                  </select>
                  <small className="text-soft">
                    {editFormData.sendingAccount === "dedicated"
                      ? "Uses Account 2 credentials (100% reserved for campaigns, zero risk to transactional OTPs)."
                      : "Uses Primary Brevo account (200 daytime cap + 11:30 PM sweep, preserves 50 OTP reserve)."}
                  </small>
                </Col>
                <Col md="6">
                  <label className="form-label fw-bold">Daily Throttling Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editFormData.dailyLimit}
                    min="1"
                    max="10000"
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        dailyLimit: parseInt(e.target.value, 10) || (editFormData.sendingAccount === "primary" ? 200 : 300),
                      })
                    }
                    required
                  />
                  <small className="text-soft">
                    {editFormData.sendingAccount === "dedicated" ? "Recommended: 300 / day" : "Recommended: 200 / day"}
                  </small>
                </Col>
                <Col md="12">
                  <label className="form-label fw-bold">Email Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.subject}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    required
                  />
                </Col>
              </div>

              <div className="border-top pt-3 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <h6 className="title mb-0 fs-14px">
                    Email Message Content & Banners
                  </h6>
                  {/* Template Quick Select */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="fs-11px text-soft">Template:</span>
                    <select
                      className="form-select form-select-sm"
                      style={{ minWidth: "260px" }}
                      onChange={(e) => handleTemplateSelect(e.target.value, true)}
                      defaultValue=""
                    >
                      <option value="" disabled>Apply a Template Preset (10 Available)...</option>
                      <optgroup label="🔥 Cashback & Bonuses">
                        <option value="cashbackElectricityData">⚡ 5% Cashback: Electricity & Data Weekend Blitz</option>
                        <option value="walletFundingBonus">🎁 Wallet Bonus: Fund ₦5,000+ & Claim ₦500 Free Credit</option>
                      </optgroup>
                      <optgroup label="💡 Utilities & Electricity Bills">
                        <option value="electricityMeterRescue">💡 Electricity Meter: Instant 20-Digit Token in 3s</option>
                        <option value="zeroFeeCable">📺 Zero Convenience Fee: DSTV, GOtv & StarTimes</option>
                      </optgroup>
                      <optgroup label="📶 Data & Airtime Deals">
                        <option value="cheapDataPromo">📶 Cheap Data: High-Speed SME & Direct from ₦220/GB</option>
                        <option value="airtimeSurgeDiscount">📞 Airtime Surge: Instant Up to 6% Discount on Recharge</option>
                      </optgroup>
                      <optgroup label="⚽ Betting & Entertainment">
                        <option value="bettingTopUpCashback">⚽ Betting Top-Up: Instant Wallet Funding + 2% Cashback</option>
                      </optgroup>
                      <optgroup label="🎁 Rewards & Announcements">
                        <option value="referAndEarnCredits">🤝 Refer & Earn: ₦1,000 Bill Credits for You & Friends</option>
                        <option value="monthlyLeaderboard">🏆 Bill-Pay Leaderboard: Win Up to ₦20,000 This Month</option>
                        <option value="platformUpgradeAnnouncement">🚀 Official Update: 99.9% Bill Success Rate & Auto-Pay</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Banner Status Chips */}
                <div className="d-flex flex-wrap gap-2 align-items-center p-2 mb-2 bg-light rounded fs-12px">
                  <span className="fw-bold text-dark">Active Banners:</span>
                  <Badge color={banners?.logoUrl ? "success" : "light"} className="border">
                    {banners?.logoUrl ? "✓ Logo Set" : "Logo Not Configured"}
                  </Badge>
                  <Badge color={banners?.headerBannerUrl ? "success" : "light"} className="border">
                    {banners?.headerBannerUrl ? "✓ Header Banner Set" : "Header Banner Not Set"}
                  </Badge>
                  <Badge color={banners?.footerBannerUrl ? "success" : "light"} className="border">
                    {banners?.footerBannerUrl ? "✓ Footer Banner Set" : "Footer Banner Not Set"}
                  </Badge>
                </div>
              </div>

              {/* Tag insertion chips */}
              <div className="mb-2">
                <div className="fs-11px text-soft mb-1">Click a tag to insert into your email copy:</div>
                <div className="d-flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{logo}}")}
                  >
                    + {"{{logo}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{headerBanner}}")}
                  >
                    + {"{{headerBanner}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{footerBanner}}")}
                  >
                    + {"{{footerBanner}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{firstName}}")}
                  >
                    + {"{{firstName}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{lastName}}")}
                  >
                    + {"{{lastName}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{email}}")}
                  >
                    + {"{{email}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{website}}")}
                  >
                    + {"{{website}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{playStore}}")}
                  >
                    + {"{{playStore}}"}
                  </button>
                  <button
                    type="button"
                    className="campaign-tag-chip"
                    onClick={() => insertEditTag("{{appStore}}")}
                  >
                    + {"{{appStore}}"}
                  </button>
                </div>
              </div>

              {/* Edit Tabs */}
              <Nav tabs className="mb-2">
                <NavItem>
                  <NavLink
                    className={editEditorTab === "edit" ? "active" : ""}
                    onClick={() => setEditEditorTab("edit")}
                    style={{ cursor: "pointer", padding: "6px 14px", fontSize: "13px" }}
                  >
                    <Icon name="code" className="me-1" />
                    Edit HTML / Content
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={editEditorTab === "preview" ? "active" : ""}
                    onClick={() => setEditEditorTab("preview")}
                    style={{ cursor: "pointer", padding: "6px 14px", fontSize: "13px" }}
                  >
                    <Icon name="eye" className="me-1" />
                    Live Email Preview
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={editEditorTab}>
                <TabPane tabId="edit">
                  <textarea
                    className="form-control"
                    rows="9"
                    style={{ fontFamily: "monospace", fontSize: "13px" }}
                    value={editFormData.htmlContent}
                    onChange={(e) => setEditFormData({ ...editFormData, htmlContent: e.target.value })}
                    required
                  />
                </TabPane>
                <TabPane tabId="preview">
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "24px",
                      maxHeight: "380px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "30px",
                        maxWidth: "600px",
                        margin: "0 auto",
                        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: renderPreviewHtml(editFormData.htmlContent),
                      }}
                    />
                  </div>
                </TabPane>
              </TabContent>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button color="light" type="button" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>

        {/* Modal: Source Attribution & ROI Analytics */}
        <Modal
          isOpen={attributionModalOpen}
          toggle={() => setAttributionModalOpen(!attributionModalOpen)}
          size="lg"
        >
          <ModalHeader toggle={() => setAttributionModalOpen(false)}>
            Attribution & ROI Breakdown: {selectedCampaignForAttr?.name}
          </ModalHeader>
          <ModalBody>
            {selectedCampaignForAttr && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                  <div>
                    <div className="text-soft fs-12px">Total Sent</div>
                    <div className="h5 mb-0">{selectedCampaignForAttr.sentCount || 0}</div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Delivered</div>
                    <div className="h5 mb-0 text-success">
                      {selectedCampaignForAttr.deliveredCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Unique Opens</div>
                    <div className="h5 mb-0 text-primary">
                      {selectedCampaignForAttr.openedCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Unique Clicks</div>
                    <div className="h5 mb-0 text-info">
                      {selectedCampaignForAttr.clickedCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Signups</div>
                    <div className="h5 mb-0 text-dark">
                      {selectedCampaignForAttr.signupsCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-soft fs-12px">Transactions</div>
                    <div className="h5 mb-0 text-success">
                      {selectedCampaignForAttr.firstTransactionsCount || 0}
                    </div>
                  </div>
                </div>

                <h6 className="mb-2">Comparative Performance by Database Source</h6>
                <Table responsive className="table-bordered fs-12px mb-3">
                  <thead className="table-light">
                    <tr>
                      <th>Source Database</th>
                      <th>Sent</th>
                      <th>Delivered</th>
                      <th>Opens</th>
                      <th>Clicks</th>
                      <th>Signups</th>
                      <th>1st Bill Payments</th>
                      <th>Volume (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCampaignForAttr.perSourceMetrics &&
                    selectedCampaignForAttr.perSourceMetrics.length > 0 ? (
                      selectedCampaignForAttr.perSourceMetrics.map((sm, i) => (
                        <tr key={i}>
                          <td className="fw-bold">{sm.sourceName}</td>
                          <td>{sm.sentCount || 0}</td>
                          <td>{sm.deliveredCount || 0}</td>
                          <td>{sm.openedCount || 0}</td>
                          <td>{sm.clickedCount || 0}</td>
                          <td className="text-primary fw-medium">{sm.signupsCount || 0}</td>
                          <td className="text-success fw-medium">
                            {sm.firstTransactionsCount || 0}
                          </td>
                          <td className="fw-bold">
                            ₦{(sm.totalTransactionVolume || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-soft py-3">
                          No per-source metrics recorded yet. Metrics update in real-time as Brevo
                          webhooks and conversions arrive.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <div className="alert alert-light border fs-12px text-soft mb-0">
                  <Icon name="info" className="me-1 text-primary" />
                  <strong>How Attribution Works:</strong> Links in outgoing emails include signed tracking parameters (<code>pm_cid</code>, <code>pm_src</code>, <code>pm_rid</code>). When a recipient clicks through and signs up on PayMint or completes their first utility bill payment or data recharge, the attribution bridge links the transaction volume directly to their original source JSON database.
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="light" size="sm" onClick={() => setAttributionModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </Content>
    </>
  );
};

export default CampaignsPage;
