import React, { useState } from "react";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import CatelogTable from "./CatelogTable";
import { useGetProductTypes } from "../../../../api/product/products";

const ProductTypePage = () => {
  const { isLoading, data: productTypes } = useGetProductTypes();
  const [data, setData] = useState(productTypes);
  let defaultData = {
    data: productTypes,
  };

  return (
    <React.Fragment>
      <Head title="Product Types"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>
                Catelog / <strong className="text-primary small">Product Types</strong>
              </BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <CatelogTable
            catelogTitle="product types"
            defaultData={defaultData}
            data={data ? data : []}
            setData={setData}
            headers={["type name", "product count"]}
            dataKeys={["type", "productCount"]}
            loading={isLoading}
          />
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default ProductTypePage;
