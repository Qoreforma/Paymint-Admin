import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useRecoilValue } from "recoil";
import { userState } from "../../../../atoms/userState";
import { Icon, UserAvatar } from "../../../../components/Component";
import { findUpper } from "../../../../utils/Utils";

const UserProfileAside = ({ updateSm, sm }) => {
  const location = useLocation();
  const user = useRecoilValue(userState);

  const hasPermission = (permission) => {
    return user.permissions.some((perm) => perm === permission) || user.permissions.some((perm) => perm === "*");
  };

  useEffect(() => {
    sm ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  }, [sm]);

  return (
    <div className="card-inner-group">
      <div className="card-inner">
        <div className="user-card">
          <UserAvatar
            text={findUpper(user?.firstname ? `${user?.firstName} ${user?.lastName}` : "")}
            image={user?.profilePicture}
            theme="primary"
          />
          <div className="user-info">
            <span className="lead-text">{`${user?.firstName} ${user?.lastName}`}</span>
            <span className="sub-text">{user?.email}</span>
          </div>
          <div className="user-action">
            <UncontrolledDropdown>
              <DropdownToggle tag="a" className="btn btn-icon btn-trigger me-n2">
                <Icon name="more-v"></Icon>
              </DropdownToggle>
              <DropdownMenu end>
                <ul className="link-list-opt no-bdr">
                  <li>
                    <DropdownItem
                      tag="a"
                      href="#dropdownitem"
                      onClick={(ev) => {
                        ev.preventDefault();
                      }}
                    >
                      <Icon name="camera-fill"></Icon>
                      <span>Change Photo</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      tag="a"
                      href="#dropdownitem"
                      onClick={(ev) => {
                        ev.preventDefault();
                      }}
                    >
                      <Icon name="edit-fill"></Icon>
                      <span>Update Profile</span>
                    </DropdownItem>
                  </li>
                </ul>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </div>
      </div>
      <div className="card-inner">
        <div className="user-account-info py-0">
          <h6 className="overline-title-alt">Role</h6>
          <div className="user-balance">{user?.adminLevel.replace("_", " ").toUpperCase()}</div>
        </div>
      </div>
      <div className="card-inner p-0">
        <ul className="link-list-menu">
          <li onClick={() => updateSm(false)}>
            <Link to={`/settings`} className={location.pathname === `/settings` ? "active" : ""}>
              <Icon name="user-fill-c"></Icon>
              <span>Personal Information</span>
            </Link>
          </li>
          <li onClick={() => updateSm(false)}>
            <Link
              to="/settings/user-security"
              className={location.pathname === `/settings/user-security` ? "active" : ""}
            >
              <Icon name="lock-alt-fill"></Icon>
              <span>Security Settings</span>
            </Link>
          </li>
          {hasPermission("system_bank_accounts.view") && (
            <li onClick={() => updateSm(false)}>
              <Link
                to="/settings/system-bank-accounts"
                className={location.pathname === `/settings/system-bank-accounts` ? "active" : ""}
              >
                <Icon name="wallet"></Icon>
                <span>System bank account</span>
              </Link>
            </li>
          )}
          {hasPermission("service_charges.view") && (
            <li onClick={() => updateSm(false)}>
              <Link
                to="/settings/other-settings"
                className={location.pathname === `/settings/other-settings` ? "active" : ""}
              >
                <Icon name="sign-kobo-alt"></Icon>
                <span>Service charges</span>
              </Link>
            </li>
          )}
          {/* <li onClick={() => updateSm(false)}>
            <Link
              to="/settings/general-rates"
              className={location.pathname === `/settings/general-rates` ? "active" : ""}
            >
              <Icon name="percent"></Icon>
              <span>General Provider Rates</span>
            </Link>
          </li> */}
          <li onClick={() => updateSm(false)}>
            <Link
              to="/settings/phone-prefix"
              className={location.pathname === `/settings/phone-prefix` ? "active" : ""}
            >
              <Icon name="call"></Icon>
              <span>Phone number prefix</span>
            </Link>
          </li>
          {hasPermission("app_versions.view") && (
            <li onClick={() => updateSm(false)}>
              <Link to="/settings/app-update" className={location.pathname === `/settings/app-update` ? "active" : ""}>
                <Icon name="info"></Icon>
                <span>App update</span>
              </Link>
            </li>
          )}
          {hasPermission("referral.view") && (
            <li onClick={() => updateSm(false)}>
              <Link
                to="/settings/referral-bonus"
                className={location.pathname === `/settings/referral-bonus` ? "active" : ""}
              >
                <Icon name="user"></Icon>
                <span>Referral bonus</span>
              </Link>
            </li>
          )}
          {/* {hasPermission("manage_bonuses") && (
            <li onClick={() => updateSm(false)}>
              <Link
                to="/settings/trade-bonus"
                className={location.pathname === `/settings/trade-bonus` ? "active" : ""}
              >
                <Icon name="gift"></Icon>
                <span>Trade bonus</span>
              </Link>
            </li>
          )} */}
          {hasPermission("settings.update_contact_support") && (
            <li onClick={() => updateSm(false)}>
              <Link to="/settings/support" className={location.pathname === `/settings/support` ? "active" : ""}>
                <Icon name="help-fill"></Icon>
                <span>Support</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserProfileAside;
