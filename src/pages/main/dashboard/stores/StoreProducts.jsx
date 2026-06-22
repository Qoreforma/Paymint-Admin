import React, { useState, useEffect } from "react";
import Head from "../../../../layout/head/Head";
import Content from "../../../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockTitle,
  BlockBetween,
  BlockHeadContent,
  Icon,
  Button,
} from "../../../../components/Component";
import ProductTable from "../tables/ProductTable";
import { useGetStoreProducts } from "../../../../api/product/products";
import { useParams } from "react-router";

const StoreProductsPage = () => {
  // const navigate = useNavigate();
  let { storeId } = useParams();

  const { isLoading, data: storeProducts, error } = useGetStoreProducts();

  // console.log(storeProducts);

  // const [data, setData] = useState(productData);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <React.Fragment>
      <Head title="Store Products"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Stores / <strong className="text-primary small">StellarBites</strong>
              </BlockTitle>
              <BlockDes className="text-soft">
                <ul className="list-inline">
                  <li>
                    User ID: <span className="text-base">UD003054</span>
                  </li>
                  <li>
                    Last Login: <span className="text-base">29th May, 01:02 PM</span>
                  </li>
                </ul>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="light" outline className="bg-white d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
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
            <ul className="nav nav-tabs nav-tabs-card">
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#personal"
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(`${import.meta.env.PUBLIC_URL}/store-details/${storeId}`);
                  }}
                >
                  {/* <Icon name="list-index-fill"></Icon> */}
                  <span>Store</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link active"
                  href="#transactions"
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(`${import.meta.env.PUBLIC_URL}/store-products/${storeId}`);
                  }}
                >
                  {/* <Icon name="repeat"></Icon> */}
                  <span>Products</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#documents"
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(`${import.meta.env.PUBLIC_URL}/store-transactions/${storeId}`);
                  }}
                >
                  {/* <Icon name="file-text"></Icon> */}
                  <span>Transaction/Payouts</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link disabled"
                  href="#notifications"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  {/* <Icon name="bell"></Icon> */}
                  <span>Store Statistics</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link disabled"
                  href="#activities"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  {/* <Icon name="activity"></Icon> */}
                  <span>Orders</span>
                </a>
              </li>
            </ul>
            <div className="card-inner">
              <ProductTable title="Store Products" tableData={storeProducts} />
            </div>
          </Card>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default StoreProductsPage;
