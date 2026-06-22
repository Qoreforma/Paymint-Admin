import React, { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Icon,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";

import ProductTable from "../tables/ProductTable";
import StoreDetailsPage from "./StoreDetail";
import StoreStatisticsPage from "./StoreStatistics";
import StoreTransactionsPage from "./StoreTransactions";

import { useGetStoreProducts } from "../../../../api/product/products";
import { useGetSingleStore, useVerifyStore } from "../../../../api/stores/store";
import { useGetStoreWalletStats } from "../../../../api/wallet";
import StoreOrdersPage from "./StoreOrders";
import { Suspense } from "react";
import LoadingSpinner from "../../../components/spinner";

const StoreDetailsPageTwo = () => {
  const navigate = useNavigate();
  let { storeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;
  const activeTab = searchParams.get("tab") ?? "store";

  const { data: storeDetail } = useGetSingleStore(storeId);
  const { data: storeProducts } = useGetStoreProducts(storeId, currentPage, itemsPerPage);
  const { data: storeWallet } = useGetStoreWalletStats(storeId);

  const { mutate: updateStatus } = useVerifyStore(storeId);

  const disApproveStore = useCallback(() => {
    let data = {
      store: storeId,
      action: "disapproved",
    };
    updateStatus(data);
  }, [storeId, updateStatus]);

  const blockStore = useCallback(() => {
    let data = {
      store: storeId,
      action: "",
    };
    if (storeDetail.store.adminAction === "approved") {
      updateStatus({ ...data, action: "blocked" });
    } else {
      updateStatus({ ...data, action: "approved" });
    }
  }, [storeDetail, storeId, updateStatus]);

  return (
    <>
      <Head title="Store Details"></Head>
      {storeDetail && (
        <Content>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page>
                  Stores / <strong className="text-primary small">{storeDetail?.store?.name}</strong>
                </BlockTitle>
                <BlockDes className="text-soft">
                  <ul className="list-inline">
                    <li>
                      User ID: <span className="text-base">UD003054</span>
                    </li>
                    <li>
                      Last Login: <span className="text-base">{storeDetail.lastLogin} 01:02 PM</span>
                    </li>
                  </ul>
                </BlockDes>
              </BlockHeadContent>
              <BlockHeadContent>
                <Button
                  color="light"
                  outline
                  className="bg-white d-none d-sm-inline-flex"
                  onClick={() => navigate("/stores")}
                >
                  <Icon name="arrow-left"></Icon>
                  <span>Back</span>
                </Button>
                <a
                  href="#back"
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(-1);
                  }}
                  className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                >
                  <Icon name="arrow-left"></Icon>
                </a>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>
          <Block>
            <Card>
              <div className="card-aside-wrap" id="user-detail-block">
                <div className="card-content">
                  <Nav tabs className="nav nav-tabs nav-tabs-card">
                    <NavItem>
                      <NavLink
                        tag="a"
                        href="#tab"
                        className={activeTab === "store" ? "active" : ""}
                        onClick={(ev) => {
                          ev.preventDefault();
                          setSearchParams({ tab: "store" });
                        }}
                      >
                        Store
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        tag="a"
                        href="#tab"
                        className={activeTab === "products" ? "active" : ""}
                        onClick={(ev) => {
                          ev.preventDefault();
                          setSearchParams({ tab: "products" });
                        }}
                      >
                        Products
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        tag="a"
                        href="#tab"
                        className={activeTab === "transactions" ? "active" : ""}
                        onClick={(ev) => {
                          ev.preventDefault();
                          setSearchParams({ tab: "transactions" });
                        }}
                      >
                        Transaction/Payouts
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        tag="a"
                        href="#tab"
                        className={activeTab === "statistics" ? "active" : ""}
                        onClick={(ev) => {
                          ev.preventDefault();
                          setSearchParams({ tab: "statistics" });
                        }}
                      >
                        Store Statistics
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        tag="a"
                        href="#tab"
                        className={activeTab === "orders" ? "active" : ""}
                        onClick={(ev) => {
                          ev.preventDefault();
                          setSearchParams({ tab: "orders" });
                        }}
                      >
                        Orders
                      </NavLink>
                    </NavItem>
                    {activeTab === "store" && (
                      <NavItem className="nav-item nav-item-trigger">
                        <Button
                          outline={storeDetail?.store?.adminAction !== "approved"}
                          onClick={blockStore}
                          className="me-2"
                          color={storeDetail?.store?.adminAction !== "approved" ? "primary" : "danger"}
                        >
                          <span>{storeDetail?.store?.adminAction !== "approved" ? "Approve" : "Block"}</span>
                        </Button>
                        {storeDetail?.store?.adminAction === "pending" && (
                          <Button onClick={disApproveStore} color="secondary">
                            <span>Disapprove</span>
                          </Button>
                        )}
                      </NavItem>
                    )}
                  </Nav>
                  <div className="card-inner">
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="store">
                        <StoreDetailsPage user={storeDetail} />
                      </TabPane>
                      <TabPane tabId="products">
                        <Suspense fallback={<LoadingSpinner />} key={storeId}>
                          <ProductTable
                            title="Store Products"
                            tableData={storeProducts ? storeProducts : []}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                          />
                        </Suspense>
                      </TabPane>
                      <TabPane tabId="transactions">
                        <StoreTransactionsPage data={storeWallet} />
                      </TabPane>
                      <TabPane tabId="statistics">
                        <StoreStatisticsPage data={storeDetail} />
                      </TabPane>
                      <TabPane tabId="orders">
                        <StoreOrdersPage />
                      </TabPane>
                    </TabContent>
                  </div>
                </div>
              </div>
            </Card>
          </Block>
        </Content>
      )}
    </>
  );
};

export default StoreDetailsPageTwo;
