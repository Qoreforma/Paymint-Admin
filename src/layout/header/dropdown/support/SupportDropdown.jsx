import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useGetSupportStats } from "../../../../api/support";
import { Icon } from "../../../../components/Component";

const SupportDropdown = () => {
  const { data: statsRes } = useGetSupportStats();

  const queued = statsRes?.data?.queued || 0;
  const active = statsRes?.data?.active || 0;
  const totalUnattended = useMemo(() => queued, [queued]);

  return (
    <UncontrolledDropdown>
      <DropdownToggle
        tag="a"
        href="#dropdown"
        onClick={(ev) => ev.preventDefault()}
        className="nk-quick-nav-icon position-relative"
        title={totalUnattended > 0 ? `${totalUnattended} unattended support ticket(s)` : "Customer Support Desk"}
      >
        <div className={`icon-status ${totalUnattended > 0 ? "icon-status-danger" : "icon-status-na"}`}>
          <Icon name="chat-fill"></Icon>
        </div>
      </DropdownToggle>
      <DropdownMenu end className="dropdown-menu-md">
        <div className="dropdown-head d-flex justify-content-between align-items-center">
          <span className="sub-title nk-dropdown-title">Customer Support</span>
          {totalUnattended > 0 && (
            <Badge color="danger" pill>
              {totalUnattended} Queued
            </Badge>
          )}
        </div>
        <div className="dropdown-body">
          <ul className="chat-list">
            <li className="ms-1">
              <Link to="/support-desk/queue" className="chat-link">
                <div className="chat-info d-flex justify-content-between align-items-center w-100">
                  <div className="d-flex align-items-center">
                    <Icon name="inbox-in" className="text-danger me-2" />
                    <span>Ticket Queue</span>
                  </div>
                  <Badge color={queued > 0 ? "danger" : "light"} pill className="ms-2">
                    {queued}
                  </Badge>
                </div>
              </Link>
            </li>
            <li className="ms-1">
              <Link to="/support-desk" className="chat-link">
                <div className="chat-info d-flex justify-content-between align-items-center w-100">
                  <div className="d-flex align-items-center">
                    <Icon name="chat" className="text-primary me-2" />
                    <span>Live Chat Desk</span>
                  </div>
                  <Badge color={active > 0 ? "primary" : "light"} pill className="ms-2">
                    {active}
                  </Badge>
                </div>
              </Link>
            </li>
          </ul>
        </div>
        <div className="dropdown-foot center border-top py-2">
          <Link to="/support-desk/queue" className="fs-12px text-primary fw-medium">
            Open Support Queue &rarr;
          </Link>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default SupportDropdown;
