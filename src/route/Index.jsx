import React from "react";
import { Route } from "react-router-dom";

import EcomOrder from "../pages/main/dashboard/order/Orders";
import EcomProducts from "../pages/main/dashboard/product/ProductList";
// import EcomSettings from "../pages/main/dashboard/settings/Settings";
import EcomDashboard from "../pages/main/dashboard/index";
import ProductDetailPage from "../pages/main/dashboard/product/ProductDetail";
import EcomStores from "../pages/main/dashboard/stores/StoreList";

import Error404Classic from "../pages/error/404-classic";
import Error404Modern from "../pages/error/404-modern";
import Error504Classic from "../pages/error/504-classic";
import Error504Modern from "../pages/error/504-modern";

import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";

import Layout from "../layout/Index";
import LayoutNoSidebar from "../layout/Index-nosidebar";
import OrderDetails from "../pages/main/dashboard/order/OrderDetails";
import ProductReviewPage from "../pages/main/dashboard/product/ProductReview";

import AdminList from "../pages/main/dashboard/admin/adminList";
import BrandsPage from "../pages/main/dashboard/catelog/Brands";
import CategoriesPage from "../pages/main/dashboard/catelog/CategoriesPage";
import ColorsPage from "../pages/main/dashboard/catelog/Colors";
import ProductTypePage from "../pages/main/dashboard/catelog/ProductType";
import SubCategoriesPage from "../pages/main/dashboard/catelog/SubCategories";
import CouponsPage from "../pages/main/dashboard/coupons/CouponsPage";
import SingleOrders from "../pages/main/dashboard/order/SingleOrders";
import PayoutPage from "../pages/main/dashboard/payouts/PayoutPage";
import CreateRoles from "../pages/main/dashboard/roles/createRoles";
import EditRoles from "../pages/main/dashboard/roles/editRoles";
import RolesList from "../pages/main/dashboard/roles/rolesList";
import UserSecurityPage from "../pages/main/dashboard/settings/Security";
import UserInfoPage from "../pages/main/dashboard/settings/UserInfo";
import StoreDetailsPageTwo from "../pages/main/dashboard/stores";
import UserDetailsPage from "../pages/main/dashboard/users/UserDetails";
import UserList from "../pages/main/dashboard/users/UserList";
import ProtectedRoute from "./ProtectedRoute";

import { RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import ChangePassword from "../pages/auth/ChangePassword";
import AnnouncementPage from "../pages/main/dashboard/announcement/announcement";
import AssetListPage from "../pages/main/dashboard/assets/assetsPage";
import BannersPage from "../pages/main/dashboard/banners/banners";
import GiftCardListPage from "../pages/main/dashboard/giftcards/giftcard";
import ReferralsPage from "../pages/main/dashboard/referrals/ProductList";
import OtherSettingsPage from "../pages/main/dashboard/settings/OtherSettings";
import TransactionsPage from "../pages/main/dashboard/transactions/transactions";
// import FAQsPage from "../pages/main/dashboard/faqs/ProductList";
import AppVersionPage from "../pages/main/dashboard/app-version/ProductList";
import AllAssetPage from "../pages/main/dashboard/assets/all-assets";
import AssetSellPage from "../pages/main/dashboard/assets/assets-sell";
import AssetDetails from "../pages/main/dashboard/assets/details";
import CryptoAssetsPage from "../pages/main/dashboard/crypto/assets";
import CryptoCurrenciesPage from "../pages/main/dashboard/crypto/currencies";
import CryptoNetworkPage from "../pages/main/dashboard/crypto/networks";
import NetworkDetails from "../pages/main/dashboard/crypto/view-network";
import FaqCategoriesPage from "../pages/main/dashboard/faq/CategoriesPage";
import FAQsPage from "../pages/main/dashboard/faq/FaqList";
import GiftCardCategoriesPage from "../pages/main/dashboard/giftcard-management/categories";
import CategoryDetails from "../pages/main/dashboard/giftcard-management/view-categories";
import GiftCardProductsPage from "../pages/main/dashboard/giftcard-management/products";
import GiftcardDetails from "../pages/main/dashboard/giftcards/details";
import AllGiftCardListPage from "../pages/main/dashboard/giftcards/giftcard-all";
import GiftCardSellListPage from "../pages/main/dashboard/giftcards/giftcard-sell";
import ReferralTermsPage from "../pages/main/dashboard/referral-terms/referral-terms";
import DepositRequest from "../pages/main/dashboard/requests/deposit-request";
import WithdrawalRequest from "../pages/main/dashboard/requests/withdrawal-request";
import ServiceProvidersDiscounts from "../pages/main/dashboard/service-providers/provider-discouts";
import ServiceProvidersProducts from "../pages/main/dashboard/service-providers/provider-products";
import ProvidersServices from "../pages/main/dashboard/service-providers/provider-services";
import ServiceProviders from "../pages/main/dashboard/service-providers/service-provider";
import ServicesTypes from "../pages/main/dashboard/service-types/service-types";
import ServicesPage from "../pages/main/dashboard/services/services";
import ServicesDiscounts from "../pages/main/dashboard/services/services-discounts";
import AppUpdatePage from "../pages/main/dashboard/settings/AppUpdate";
import ReferralBonusPage from "../pages/main/dashboard/settings/ReferralBonus";
import SupportPage from "../pages/main/dashboard/settings/support";
import SystemAccountPage from "../pages/main/dashboard/settings/SystemAccount";
import SystemBankAccountPage from "../pages/main/dashboard/system-bank-account/bank-accounts";
import TradeSettings from "../pages/main/dashboard/trade-settings/ProductList";
import AirtimeTransactionsPage from "../pages/main/dashboard/transactions/airtime";
import BettingTransactionsPage from "../pages/main/dashboard/transactions/betting";
import CableTVTransactionsPage from "../pages/main/dashboard/transactions/cable-tv";
import DataTransactionsPage from "../pages/main/dashboard/transactions/data";
import EducationTransactionsPage from "../pages/main/dashboard/transactions/education";
import ElectricityTransactionsPage from "../pages/main/dashboard/transactions/electricity";
import InternationalAirtimeTransactionsPage from "../pages/main/dashboard/transactions/international-airtime";
import InternationalDataTransactionsPage from "../pages/main/dashboard/transactions/international-data";
import AllWalletTransactionListPage from "../pages/main/dashboard/wallet/all-wallet";
import WalletWithdrawalListPage from "../pages/main/dashboard/wallet/wallet-debit";
import WalletDepositListPage from "../pages/main/dashboard/wallet/wallet-deposit";
import WalletTransferListPage from "../pages/main/dashboard/wallet/wallet-transfer";
import VerifiyOTP from "../pages/auth/2fa";
import RestrictedEntityList from "../pages/main/dashboard/restricted-entities/restricted-list";
import RelatedGiftCardListPage from "../pages/main/dashboard/giftcards/multiple";
import ManualProductsPage from "../pages/main/dashboard/manual-products/products-page";
import TradeBonusPage from "../pages/main/dashboard/settings/trade-bonus";
import GeneralRatesPage from "../pages/main/dashboard/settings/GeneralRates";
import PhonePrefixPage from "../pages/main/dashboard/settings/PhonePrefix";

const routes = (
  <Route>
    <>
      {/*Panel */}
      <Route element={<ProtectedRoute />}>
        <Route path={`/`} element={<Layout />}>
          <Route index element={<EcomDashboard />}></Route>
          <Route path="orders">
            <Route path="general" element={<EcomOrder />} />
            <Route path="single" element={<SingleOrders />} />
            <Route path="order-details/:orderId" element={<OrderDetails />} />
          </Route>
          <Route path="products">
            <Route index element={<EcomProducts />} />
            <Route path="product-details/:productId" element={<ProductDetailPage />}></Route>
            <Route path="product-reviews/:productId" element={<ProductReviewPage />}></Route>
          </Route>
          <Route path="stores" element={<EcomStores />}></Route>
          <Route path="store-details/:storeId" element={<StoreDetailsPageTwo />}></Route>
          <Route>
            <Route path="categories" element={<CategoriesPage />}></Route>
            <Route path="subcategory" element={<SubCategoriesPage />}></Route>
            <Route path="brands" element={<BrandsPage />}></Route>
            <Route path="colors" element={<ColorsPage />}></Route>
            <Route path="product-type" element={<ProductTypePage />}></Route>
          </Route>
          <Route path="payouts" element={<PayoutPage />}></Route>
          <Route path="coupons" element={<CouponsPage />}></Route>

          <Route path="assets/all" element={<AllAssetPage />} />
          <Route path="assets/buy" element={<AssetListPage />} />
          <Route path="assets/sell" element={<AssetSellPage />} />
          <Route path="assets-details/:assetId" element={<AssetDetails />} />
          <Route path="giftcards/all" element={<AllGiftCardListPage />} />
          <Route path="giftcards/buy" element={<GiftCardListPage />} />
          <Route path="giftcards/sell" element={<GiftCardSellListPage />} />
          <Route path="giftcards-details/:giftcardId" element={<GiftcardDetails />} />
          <Route path="related-giftcards/:giftcardId" element={<RelatedGiftCardListPage />} />
          <Route path="wallet/deposit" element={<WalletDepositListPage />} />
          <Route path="wallet/withdrawal" element={<WalletWithdrawalListPage />} />
          <Route path="wallet/transfer" element={<WalletTransferListPage />} />
          <Route path="wallet/all" element={<AllWalletTransactionListPage />} />

          <Route path="transactions/all" element={<TransactionsPage />} />
          <Route path="transactions/bettings" element={<BettingTransactionsPage />} />
          <Route path="transactions/data" element={<DataTransactionsPage />} />
          <Route path="transactions/airtime" element={<AirtimeTransactionsPage />} />
          <Route path="transactions/electricity" element={<ElectricityTransactionsPage />} />
          <Route path="transactions/cable-tv" element={<CableTVTransactionsPage />} />
          <Route path="transactions/education" element={<EducationTransactionsPage />} />
          <Route path="transactions/international-airtime" element={<InternationalAirtimeTransactionsPage />} />
          <Route path="transactions/international-data" element={<InternationalDataTransactionsPage />} />
          <Route path="requests/deposit" element={<DepositRequest />} />
          <Route path="requests/withdrawal" element={<WithdrawalRequest />} />

          {/* <Route path="transactions/flights" element={<TransactionsPage />} /> */}
          {/* <Route path="transactions/giftcards" element={<TransactionsPage />} /> */}
          <Route path="announcement" element={<AnnouncementPage />} />
          <Route path="faqs" element={<FAQsPage />} />
          <Route path="faq-categories" element={<FaqCategoriesPage />}></Route>
          <Route path="banners" element={<BannersPage />} />
          <Route path="app-version" element={<AppVersionPage />} />
          <Route path="referral-terms" element={<ReferralTermsPage />} />
          <Route path="system-bank-account" element={<SystemBankAccountPage />} />
          <Route path="service-providers" element={<ServiceProviders />} />
          <Route path="service-providers/:providerId" element={<ProvidersServices />} />
          <Route path="service-products/:providerId/:code/:type" element={<ServiceProvidersProducts />} />
          <Route path="manual-products" element={<ManualProductsPage />} />

          <Route path="service-providers/discounts/:providerName" element={<ServiceProvidersDiscounts />} />

          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:serviceName" element={<ServicesDiscounts />} />

          <Route path="service-types" element={<ServicesTypes />} />
          <Route path="trades-info" element={<TradeSettings />} />
          <Route path="giftcard-categories" element={<GiftCardCategoriesPage />} />
          <Route path="giftcard-categories/:categoryId" element={<CategoryDetails />} />
          <Route path="giftcard-products" element={<GiftCardProductsPage />} />
          <Route path="crypto-networks" element={<CryptoNetworkPage />} />
          <Route path="network-details/:networkId" element={<NetworkDetails />} />
          <Route path="crypto-assets" element={<CryptoAssetsPage />} />
          <Route path="crypto-currencies" element={<CryptoCurrenciesPage />} />
          <Route path="restricted-entities" element={<RestrictedEntityList />} />

          <Route path="user-management" element={<UserList />}></Route>
          <Route path="user-details/:userId" element={<UserDetailsPage />}></Route>
          <Route path="admin-management" element={<AdminList />}></Route>
          <Route path="roles-management" element={<RolesList />}></Route>
          <Route path="create-roles" element={<CreateRoles />}></Route>
          <Route path="edit-roles/:roleId" element={<EditRoles />}></Route>
          <Route path="referral-management" element={<ReferralsPage />}></Route>

          <Route path="settings">
            <Route index element={<UserInfoPage />} />
            <Route path="user-security" element={<UserSecurityPage />} />
            <Route path="other-settings" element={<OtherSettingsPage />} />
            <Route path="general-rates" element={<GeneralRatesPage />} />
            <Route path="phone-prefix" element={<PhonePrefixPage />} />
            <Route path="app-update" element={<AppUpdatePage />} />
            <Route path="system-bank-accounts" element={<SystemAccountPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="referral-bonus" element={<ReferralBonusPage />} />
            <Route path="trade-bonus" element={<TradeBonusPage />} />
          </Route>
        </Route>
      </Route>

      <Route path={`/`} element={<LayoutNoSidebar />}>
        <Route path="auth-reset" element={<ForgotPassword />}></Route>
        <Route path="auth-login" element={<Login />}></Route>
        <Route path="auth-change-password" element={<ChangePassword />} />
        <Route path="auth-2fa" element={<VerifiyOTP />} />

        <Route path="errors">
          <Route path="404-modern" element={<Error404Modern />}></Route>
          <Route path="404-classic" element={<Error404Classic />}></Route>
          <Route path="504-modern" element={<Error504Modern />}></Route>
          <Route path="504-classic" element={<Error504Classic />}></Route>
        </Route>
        <Route path="*" element={<Error404Modern />}></Route>
      </Route>
    </>
  </Route>
);

const Router = () => {
  const routers = createBrowserRouter(createRoutesFromElements(routes));

  return <RouterProvider router={routers} />;
};
export default Router;
