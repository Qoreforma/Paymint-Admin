import React from "react";
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import Icon from "../../../../components/icon/Icon";
import { formatCurrency, formatDateWithTime } from "../../../../utils/Utils";
// import Button from "../button/Button";

export const TransactionTable = ({ action, isCompact, data }) => {
  const DropdownTrans = () => {
    return (
      <UncontrolledDropdown>
        <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon btn-trigger">
          <Icon name="more-h"></Icon>
        </DropdownToggle>
        <DropdownMenu end>
          <ul className="link-list-plain">
            <li>
              <DropdownItem
                tag="a"
                href="#dropdownitem"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                View
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
                Invoice
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
                Print
              </DropdownItem>
            </li>
          </ul>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  };

  if (data && data.length === 0) {
    return (
      <div className="text-center mt-3 mb-3">
        <span className="text-silent">No transactions found</span>
      </div>
    );
  }
  return (
    <table className={`table table-tranx ${isCompact ? "is-compact" : ""}`}>
      <thead>
        <tr className="tb-tnx-head">
          <th className="tb-tnx-id">
            <span className="">#</span>
          </th>
          <th className="tb-tnx-info">
            <span className="tb-tnx-desc d-none d-sm-inline-block">
              <span>Type</span>
            </span>
            <span className="tb-tnx-desc d-md-inline-block d-none">
              <span>Date & Time</span>
            </span>
          </th>
          <th className="tb-tnx-amount is-alt">
            <span className="tb-tnx-total">Total</span>
            <span className="tb-tnx-status d-none d-md-inline-block">Status</span>
          </th>
          {action && (
            <th className="tb-tnx-action">
              <span>&nbsp;</span>
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {data?.map((item, idx) => {
          return (
            <tr key={item._id} className="tb-tnx-item">
              <td className="tb-tnx-id">
                <a
                  href="#id"
                  onClick={(ev) => {
                    ev.preventDefault();
                  }}
                >
                  <span>{idx + 1}</span>
                </a>
              </td>
              <td className="tb-tnx-info">
                <div className="tb-tnx-desc">
                  <span className="title">{item.type}</span>
                </div>
                <div className="tb-tnx-desc">
                  {/* <span className="date">{item.issue}</span> */}
                  <span className="date">{formatDateWithTime(item.createdAt)}</span>
                </div>
              </td>
              <td className="tb-tnx-amount is-alt">
                <div className="tb-tnx-total">
                  <span className="amount">{formatCurrency(item.amount)}</span>
                </div>
                <div className="tb-tnx-status">
                  <Badge className="badge-dot" color={item.state === "approved" ? "success" : "warning"}>
                    {item.state}
                  </Badge>
                </div>
              </td>

              {action && (
                <td className="tb-tnx-action">
                  <DropdownTrans />
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
