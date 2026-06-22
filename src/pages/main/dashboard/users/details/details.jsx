import React, { useCallback, useState } from "react";
import {
  UserAvatar,
  Block,
  BlockBetween,
  BlockHead,
  BlockTitle,
  Icon,
  Button,
} from "../../../../../components/Component";
import { findUpper, formatDateWithHyphen, formatDateWithTime, formatter } from "../../../../../utils/Utils";
import { useViewUserBVN } from "../../../../../api/users/user";
import { Modal, ModalBody, Row, Col, Badge } from "reactstrap";
import { useForm } from "react-hook-form";
import LoadingSpinner from "../../../../components/spinner";

const Details = ({ user, isLoading }) => {
  const [bvn, setbvn] = useState(null);
  const { mutate: viewBVN } = useViewUserBVN(user?.data?.user?.id, setbvn);
  const [showViewBVN, setShowViewBVN] = useState(false);
  const [passState, setPassState] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { password: "" } });

  const handleViewBVN = (data) => {
    console.log({ data });
    viewBVN(data);
  };

  const statusColor = useCallback((status) => {
    if (status === "No" || status === false || status === "inactive") {
      return "warning";
    } else if (status === true || status === "Yes" || status === "active") {
      return "success";
    } else {
      return "danger";
    }
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <React.Fragment>
      <Block>
        <BlockHead className="nk-block-head-line">
          <BlockBetween>
            <BlockTitle tag="h5">Profile Information</BlockTitle>
            <UserAvatar
              theme={user?.data?.user?.avatar}
              className="md"
              text={user && findUpper(`${user?.data?.user?.firstname} ${user?.data?.user?.lastname}`)}
              image={user?.data?.user?.avatar}
            ></UserAvatar>
            {/* </div> */}
          </BlockBetween>
        </BlockHead>
        <div className="profile-ud-list">
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Fullname</span>
              <span className="profile-ud-value">
                {user?.data?.user?.firstname} {user?.data?.user?.lastname}
              </span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Username</span>
              <span className="profile-ud-value">{user?.data?.user?.username ?? "Not set"}</span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Email</span>
              <span className="profile-ud-value">{user?.data?.user?.email}</span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Gender</span>
              <span className="profile-ud-value ccap">
                {user?.data?.user?.gender ? user?.data?.user?.gender : "Not Set"}
              </span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">State/Country</span>
              <span className="profile-ud-value">
                {user?.data?.user?.state && user?.data?.user?.country
                  ? `${user?.data?.user?.state} / ${user?.data?.user?.country}`
                  : "No Location set"}
              </span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Referral Code</span>
              <span className="profile-ud-value">
                {user?.data?.user?.refCode ? user?.data?.user?.refCode : "Not Set"}
              </span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Mobile Number</span>
              {user?.data?.user?.phone ? (
                <span className="profile-ud-value">
                  {user?.data?.user?.phoneCode} {user?.data?.user?.phone}
                </span>
              ) : (
                <span className="profile-ud-value">Not set</span>
              )}
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Date Joined</span>
              <span className="profile-ud-value">{formatDateWithHyphen(user?.data?.user?.createdAt)}</span>
            </div>
          </div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Last Login at:</span>
              <span className="profile-ud-value">
                {user?.data?.user?.lastLoginAt ? formatDateWithHyphen(user?.data?.user?.lastLoginAt) : "Nil"}
              </span>
            </div>
          </div>
          {/* <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Last IP address:</span>
              <span className="profile-ud-value">
                {user?.data?.user?.last_login_ip_address ? user?.data?.user?.last_login_ip_address : "Nil"}
              </span>
            </div>
          </div> */}
        </div>
      </Block>

      <div className="nk-divider divider md"></div>

      <Block>
        <BlockHead className="nk-block-head-line">
          <BlockTitle tag="h4" className="overline-title">
            Wallet Information
          </BlockTitle>
        </BlockHead>
        <div className="profile-ud-list">
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">User Type</span>
              <span className="profile-ud-value">{user?.data?.user?.userType}</span>
            </div>
          </div>
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Wallet Balance</span>
              <span className={`profile-ud-value text-capitalize`}>
                {formatter("NGN").format(user?.data?.wallet?.mainBalance)}
              </span>
            </div>
          </div>
        </div>
      </Block>

      <div className="nk-divider divider md"></div>

      <Block>
        <BlockHead className="nk-block-head-line">
          <BlockTitle tag="h4" className="overline-title">
            Account Information
          </BlockTitle>
        </BlockHead>
        <div className="profile-ud-list">
          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Email Verified</span>
              <span className="profile-ud-value ccap">
                <Badge
                  className="badge-sm badge-dot has-bg d-none d-sm-inline-flex "
                  color={statusColor(!!user?.data?.user?.emailVerifiedAt)}
                >
                  <span className="ccap ">{user?.data?.user?.emailVerifiedAt ? "Verified" : "Not verified"}</span>
                </Badge>
              </span>
            </div>
          </div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Account Status</span>
              <span className="profile-ud-value ccap">
                <Badge
                  className="badge-sm badge-dot has-bg d-none d-sm-inline-flex "
                  color={statusColor(user?.data?.user?.status)}
                >
                  <span className="ccap ">{user?.data?.user?.status}</span>
                </Badge>
              </span>
            </div>
          </div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Phone Number Status</span>

              <span className="profile-ud-value ccap">
                <Badge
                  className="badge-sm badge-dot has-bg d-none d-sm-inline-flex "
                  color={statusColor(!!user?.data?.user?.phoneVerifiedAt)}
                >
                  <span className="ccap ">{user?.data?.user?.phoneVerifiedAt ? "Verified" : "Not verified"}</span>
                </Badge>
              </span>
            </div>
          </div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">BVN Verified</span>

              <span className="profile-ud-value ccap">
                <Badge
                  className="badge-sm badge-dot has-bg d-none d-sm-inline-flex "
                  color={statusColor(user?.data?.user?.bvnVerified)}
                >
                  <span className="ccap ">{user?.data?.user?.bvnVerified ? "Yes" : "No"}</span>
                </Badge>
              </span>
            </div>
          </div>

          <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">BVN Validated</span>

              <span className="profile-ud-value ccap">
                <Badge
                  className="badge-sm badge-dot has-bg d-none d-sm-inline-flex "
                  color={statusColor(user?.data?.user?.bvnValidated)}
                >
                  <span className="ccap ">{user?.data?.user?.bvnValidated ? "Yes" : "No"}</span>
                </Badge>
              </span>
            </div>
          </div>

          {/* <div className="profile-ud-item">
            <div className="profile-ud wider">
              <span className="profile-ud-label">Blacklisted</span>
              <span
                className={`profile-ud-value ccap ${user?.data?.user?.is_blacklisted ? "text-success" : "text-danger"}`}
              >
                {user?.data?.user?.is_blacklisted ? "Yes" : "No"}
              </span>
            </div>
          </div> */}

          {user?.data?.user?.bvnVerified && (
            <div className="profile-ud-item">
              <div className="profile-ud wider">
                <span className="profile-ud-label">View User BVN</span>
                <span className="profile-ud-value ccap">
                  <Button
                    onClick={() => {
                      setShowViewBVN(true);
                    }}
                    size={"sm"}
                    color={"primary"}
                  >
                    View
                  </Button>
                </span>
              </div>
            </div>
          )}
        </div>
      </Block>

      {/* FORM EDIT */}
      <Modal isOpen={showViewBVN} toggle={() => setShowViewBVN(false)} className="modal-dialog-centered" size="sm">
        <ModalBody>
          <a href="#cancel" className="close">
            {" "}
            <Icon
              name="cross-sm"
              onClick={(ev) => {
                ev.preventDefault();
                setShowViewBVN(false);
              }}
            ></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">View User BVN</h5>
            {bvn ? (
              <div className="nk-tnx-details mt-sm-3">
                <Row className="gy-3">
                  <Col lg={6}>
                    <span className="sub-text">BVN</span>
                    <span className="caption-text">{bvn}</span>
                  </Col>
                </Row>
              </div>
            ) : (
              <div className="mt-4">
                <form onSubmit={handleSubmit(handleViewBVN)}>
                  <Row className="g-3">
                    <Col size="12">
                      <div className="form-group">
                        <div className="form-label-group">
                          <label className="form-label" htmlFor="password">
                            Passcode
                          </label>
                        </div>
                        <div className="form-control-wrap">
                          <a
                            href="#password"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setPassState(!passState);
                            }}
                            className={`form-icon lg form-icon-right passcode-switch ${
                              passState ? "is-hidden" : "is-shown"
                            }`}
                          >
                            <Icon name="eye" className="passcode-icon icon-show"></Icon>

                            <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                          </a>
                          <input
                            type={passState ? "text" : "password"}
                            id="password"
                            {...register("password", { required: "This field is required" })}
                            // defaultValue="password"
                            placeholder="Enter your passcode"
                            className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                          />
                          {errors.password && <span className="invalid">{errors.password.message}</span>}
                        </div>
                      </div>

                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>View User BVN</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            )}
          </div>
        </ModalBody>
      </Modal>

      {showViewBVN && <div className="toggle-overlay" onClick={() => setShowViewBVN(false)}></div>}
    </React.Fragment>
  );
};

export default Details;
