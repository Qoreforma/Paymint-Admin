import React from "react";

import { Badge, Card } from "reactstrap";
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
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/spinner";
import { useGetCategoryDetails } from "../../../../api/giftcard-category";
import GiftcardAdminsTable from "./giftcard-admins-table";
import GiftCardCategoryProductsPage from "./giftcard-category-products";
import { userState } from "../../../../atoms/userState";
import { useRecoilState } from "recoil";

const CategoryDetails = () => {
  const navigate = useNavigate();
  let { categoryId } = useParams();

  const [user] = useRecoilState(userState);
  const hasPermission =
    user.permissions.some((perm) => perm === "admin.manage_giftcard_admins") ||
    user.permissions.some((perm) => perm === "*");

  const { data: details, isLoading: fetchingDetails } = useGetCategoryDetails(categoryId);

  return (
    <React.Fragment>
      <Head title="Giftcard Detail"></Head>
      {!fetchingDetails ? (
        <Content>
          <BlockHead size="sm">
            <BlockBetween className="g-3">
              <BlockHeadContent>
                <BlockTitle>Category Details</BlockTitle>
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
                  <BlockTitle tag="h5">Category Information</BlockTitle>
                  <p>Information associated with this giftcard category.</p>
                </BlockHead>
                <div className="profile-ud-list">
                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Category name</span>
                      <span className=" ccap">{details?.name}</span>
                    </div>
                  </div>

                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Giftcard Countries</span>
                      <span className="profile-ud-value">
                        {details?.countries?.map((country) => country.name).join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="profile-ud-item">
                    <div className="profile-ud wider">
                      <span className="profile-ud-label">Sale Activated</span>
                      <Badge
                        className="badge-sm badge-dot has-bg d-inline-flex"
                        color={details?.saleActivated ? "success" : "danger"}
                      >
                        <span className="ccap">{details?.saleActivated ? "Activated" : "Not Active"}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="">
                  <div className="profile-ud wider">
                    <span className="profile-ud-label">Sales Terms</span>
                    <span className="">{details?.saleTerm ? details.saleTerm : "N/A"}</span>
                  </div>
                </div>
              </Block>
            </div>
          </Card>

          <GiftCardCategoryProductsPage categoryId={categoryId} categoryName={details?.name} />
          {hasPermission && <GiftcardAdminsTable categoryId={categoryId} categoryName={details?.name} />}
        </Content>
      ) : (
        <LoadingSpinner />
      )}
    </React.Fragment>
  );
};

export default CategoryDetails;
