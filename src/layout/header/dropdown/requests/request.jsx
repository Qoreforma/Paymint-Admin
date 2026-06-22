import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useGetDepositRequest, useGetWithdrawalRequest } from "../../../../api/requests";
import { Icon } from "../../../../components/Component";

const RequestDropdown = () => {
  const { data } = useGetWithdrawalRequest();
  const { data: deposit } = useGetDepositRequest();

  const pending_withdrawal = data?.data?.filter((request) => request?.status === "pending")?.length || 0;
  const pending_deposit = deposit?.data?.filter((request) => request?.status === "pending")?.length || 0;

  const total = useMemo(() => {
    return pending_withdrawal + pending_deposit;
  }, [pending_withdrawal, pending_deposit]);

  return (
    <UncontrolledDropdown>
      <DropdownToggle tag="a" href="#dropdown" onClick={(ev) => ev.preventDefault()} className="nk-quick-nav-icon">
        <div className={`icon-status ${total > 0 ? "icon-status-danger" : "icon-status-na"}`}>
          <Icon name="todo"></Icon>
        </div>
      </DropdownToggle>
      <DropdownMenu end className="dropdown-menu-md">
        <div className="dropdown-head">
          <span className="sub-title nk-dropdown-title">Pending Request</span>
        </div>
        <div className="dropdown-body">
          <ul className="chat-list">
            <li className="ms-1">
              <Link to={"/requests/deposit"} className="chat-link">
                <div className="chat-info">
                  <div className="">
                    <span>Deposit Requests</span>
                    <Badge color="danger" pill className="ms-2">
                      {pending_deposit}
                    </Badge>
                  </div>
                </div>
              </Link>
            </li>
            <li className="ms-1">
              <Link to={"/requests/withdrawal"} className="chat-link">
                <div className="chat-info">
                  <div className="">
                    <span>Withdrawal Requests</span>
                    <Badge color="danger" pill className="ms-2">
                      {pending_withdrawal}
                    </Badge>
                  </div>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default RequestDropdown;
