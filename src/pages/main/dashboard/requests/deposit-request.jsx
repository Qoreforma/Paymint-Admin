import React from "react";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { useSearchParams } from "react-router-dom";
import { useGetDepositRequest, useUpdateDepositRequest } from "../../../../api/requests";
import DepositTable from "../wallet/deposit-table";

const DepositRequest = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const { isLoading, data } = useGetDepositRequest(currentPage, itemsPerPage, status, search);
  const { mutate } = useUpdateDepositRequest();

  return (
    <>
      <React.Fragment>
        <Head title="Deposit requests"></Head>
        <Content>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle>Deposit Requests</BlockTitle>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          <DepositTable data={data} type="deposit" isLoading={isLoading} updateFunc={mutate} />
        </Content>
      </React.Fragment>
    </>
  );
};

export default DepositRequest;
