import React from "react";

import { Card } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Icon,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../../components/spinner";
import { useViewCryptoNetworks } from "../../../../api/crypto";

import NetworkAssetsTable from "./network-assets-table";
import NetworkAdminsTable from "./network-admins-table";
import { userState } from "../../../../atoms/userState";
import { useRecoilState } from "recoil";

const NetworkDetails = ({ match }) => {
  const navigate = useNavigate();
  let { networkId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 20;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const { isLoading, data } = useViewCryptoNetworks(networkId, currentPage, itemsPerPage, search, status);
  const networkDetail = data?.network ?? {};

  const [user] = useRecoilState(userState);
  const hasPermission =
    user.permissions.some((perm) => perm === "admin.manage_crypto_admins") ||
    user.permissions.some((perm) => perm === "*");

  return (
    <React.Fragment>
      <Head title="Giftcard Detail"></Head>
      {!isLoading ? (
        <Content>
          <BlockHead size="sm">
            <BlockBetween className="g-3">
              <BlockHeadContent>
                <BlockTitle>Network Details</BlockTitle>
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

          <Card>
            <div className="card-inner">
              <Block>
                <BlockHead>
                  <BlockTitle tag="h5">Network Information</BlockTitle>
                  <p>Information associated with this network.</p>
                </BlockHead>
                <div className="profile-ud-list">
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Name</span>
                      <span className="profile-ud-value ccap">{networkDetail?.name}</span>
                    </div>
                  </div>

                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Wallet Address</span>
                      <span className="profile-ud-value">{networkDetail?.platformDepositAddress}</span>
                    </div>
                  </div>
                </div>
              </Block>
            </div>
          </Card>

          <NetworkAssetsTable network={networkDetail} data={data?.assets} isLoading={isLoading} />
          {hasPermission && <NetworkAdminsTable network={networkDetail} data={data?.admins} isLoading={isLoading} />}
        </Content>
      ) : (
        <LoadingSpinner />
      )}
    </React.Fragment>
  );
};

export default NetworkDetails;
