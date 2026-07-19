import React from "react";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle } from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import WithdrawalTable from "../wallet/table";
import { useGetWithdrawalRequest, useUpdateWithdrawalRequest } from "../../../../api/requests";
import { useSearchParams } from "react-router-dom";

const WithdrawalRequest = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const { isLoading, data } = useGetWithdrawalRequest(currentPage, itemsPerPage, status, search);
  const { mutate } = useUpdateWithdrawalRequest();

  return (
    <>
      <React.Fragment>
        <Head title="Withdrawal requests"></Head>
        <Content>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle>Withdrawal Requests</BlockTitle>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          <WithdrawalTable data={data} type="withdrawal" isLoading={isLoading} updateFunc={mutate} />
        </Content>
      </React.Fragment>
    </>
  );
};

export default WithdrawalRequest;
