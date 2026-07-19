import React from "react";
import { Block, BlockHead, BlockTitle } from "../../../../components/Component";
import { Badge } from "reactstrap";
import { formatDateWithTime } from "../../../../utils/Utils";
const StoreDetailsPage = ({ user }) => {
  // console.log(user.store);
  const { name, phone, email, storeOwner, isVerified, adminAction, status, createdAt } = user?.store ?? {};
  const { address, state, country, postalCode } = user?.store?.businessAddress ?? {};
  // const { name, phone, email, storeOwner, isVerified, adminAction, status, createdAt } = user ?? {};
  // const { address, state, country, postalCode } = user?.businessAddress ?? {};
  return (
    <>
      <Block>
        <BlockHead>
          <BlockTitle tag="h5">Store Information</BlockTitle>
          {/* <p>Basic info, like your name and address, that you use on Nio Platform.</p> */}
        </BlockHead>
        <div className="profile-ud-list">
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Store Name</span>
              <span className="profile-ud-value">{name}</span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Username</span>
              <span className="profile-ud-value">{storeOwner}</span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Address</span>
              {address ? (
                <span className="profile-ud-value">{address}</span>
              ) : (
                <span className="profile-ud-value">Not set</span>
              )}
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">State/Country</span>
              {state || country ? (
                <span className="profile-ud-value">
                  {state}/{country}
                </span>
              ) : (
                <span className="profile-ud-value"> Lagos/NG</span>
              )}
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Postal Code</span>
              {postalCode ? (
                <span className="profile-ud-value">{postalCode}</span>
              ) : (
                <span className="profile-ud-value">{user?.postalCode} 0048011</span>
              )}{" "}
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Mobile Number</span>
              <span className="profile-ud-value">{phone}</span>
            </div>
          </div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Email Address</span>
              <span className="profile-ud-value">{email}</span>
            </div>
          </div>
        </div>
      </Block>

      <Block>
        <BlockHead className="nk-block-head-line">
          <BlockTitle tag="h6" className="overline-title text-base">
            Account Information
          </BlockTitle>
        </BlockHead>
        <div className="profile-ud-list">
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Joining Date</span>
              <span className="profile-ud-value">{formatDateWithTime(createdAt)}</span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Email Verification</span>
              <span className="profile-ud-value ">
                <Badge
                  className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                  color={!isVerified ? "danger" : "success"}
                >
                  {isVerified ? "Verified" : "Not verified"}
                </Badge>
              </span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Account Status</span>
              <span className="profile-ud-value">
                <Badge
                  className="badge-sm badge-dot has-bg d-none d-sm-inline-flex text-capitalize"
                  color={status !== "active" ? "danger" : "success"}
                >
                  {status}
                </Badge>
              </span>
            </div>
          </div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Store Status</span>
              <span className="profile-ud-value">
                <Badge
                  className="badge-sm badge-dot has-bg d-none d-sm-inline-flex text-capitalize"
                  color={adminAction === "approved" ? "success" : adminAction === "pending" ? "warning" : "danger"}
                >
                  {adminAction}
                </Badge>
              </span>
            </div>
          </div>
        </div>
      </Block>

      <div className="nk-divider divider md"></div>
    </>
  );
};
export default StoreDetailsPage;
