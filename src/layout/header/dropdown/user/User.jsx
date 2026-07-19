import React, { useState } from "react";
import { Dropdown, DropdownMenu, DropdownToggle, Spinner } from "reactstrap";
import { useRecoilState } from "recoil";
import { useLogout } from "../../../../api/authentication";
import { userState } from "../../../../atoms/userState";
import { Icon } from "../../../../components/Component";
import { LinkItem, LinkList } from "../../../../components/links/Links";
import UserAvatar from "../../../../components/user/UserAvatar";
import { findUpper } from "../../../../utils/Utils";

const User = () => {
  const [open, setOpen] = useState(false);
  const [user] = useRecoilState(userState);

  const { mutate, isLoading } = useLogout();
  const toggle = () => setOpen((prevState) => !prevState);

  const handleSignout = () => {
    mutate();
  };

  return (
    <Dropdown isOpen={open} className="user-dropdown" toggle={toggle}>
      <DropdownToggle
        tag="a"
        href="#toggle"
        className="dropdown-toggle"
        onClick={(ev) => {
          ev.preventDefault();
        }}
      >
        <div className="user-toggle">
          <UserAvatar
            className="sm"
            text={user?.firstName && findUpper(`${user?.firstName} ${user?.lastName}`)}
            image={user?.avatar}
          />
          <div className="user-info d-none d-md-block">
            <div className="user-status">Administrator</div>
            <div className="user-name dropdown-indicator">
              {user?.firstName} {user?.lastName}
            </div>
          </div>
        </div>
      </DropdownToggle>
      <DropdownMenu end className="dropdown-menu-md dropdown-menu-s1">
        <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
          <div className="user-card sm">
            <div className="user-avatar">
              {user?.profilePicture ? (
                <img src={user?.profilePicture} alt="avatar" />
              ) : (
                <span>{user?.firstName && findUpper(`${user?.firstName} ${user?.lastName}`)}</span>
              )}
            </div>
            <div className="user-info">
              <span className="lead-text">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="sub-text">{user?.email}</span>
            </div>
          </div>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <LinkItem link="/settings" icon="user-alt" onClick={toggle}>
              View Profile
            </LinkItem>
            <LinkItem link="/settings" icon="setting-alt" onClick={toggle}>
              Account Setting
            </LinkItem>
            <LinkItem link="/settings" icon="activity-alt" onClick={toggle}>
              Login Activity
            </LinkItem>
          </LinkList>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <button
              disabled={isLoading}
              onClick={handleSignout}
              style={{
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                border: "none",
                width: "100%",
                color: "#267e9b",
                fontWeight: 500,
                opacity: isLoading ? "0.5" : "1",
              }}
            >
              {isLoading ? (
                <>
                  <Spinner color="primary" style={{ width: "1rem", height: "1rem" }} />
                  <span>Signing Out</span>
                </>
              ) : (
                <>
                  <Icon name="signout"></Icon>
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </LinkList>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default User;
