import React from "react";
import { formatter } from "../../../../utils/Utils";
// import Button from "../button/Button";

export const ProductTable = ({ action, isCompact, data }) => {
  // console.log(data);
  return (
    <table className={`table table-tranx ${isCompact ? "is-compact" : ""}`}>
      <thead>
        <tr className="tb-tnx-head">
          <th className="tb-tnx-id">
            <span className="">#</span>
          </th>
          <th>
            <span className="d-none d-sm-inline-block">
              <span>Category</span>
            </span>
          </th>
          <th>
            <span className="d-none d-sm-inline-block">
              <span>Product</span>
            </span>
          </th>
          <th>
            <span className="d-none d-sm-inline-block">
              <span>Type</span>
            </span>
          </th>
          <th>
            <span className="d-none d-sm-inline-block">
              <span>Country</span>
            </span>
          </th>
          <th>
            <span className="d-none d-sm-inline-block">
              <span>Rate</span>
            </span>
          </th>{" "}
          <th>
            <span className="d-none d-sm-inline-block">
              <span>Units</span>
            </span>
          </th>
          <th>
            <span className="d-none d-sm-inline-block">
              <span>Value</span>
            </span>
          </th>{" "}
          <th>
            <span className="d-none d-sm-inline-block">
              <span>Total</span>
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr className="tb-tnx-item">
          <td className="tb-tnx-id">
            <a
              href="#id"
              onClick={(ev) => {
                ev.preventDefault();
              }}
            >
              <span>{1}</span>
            </a>
          </td>
          <td className="">
            <span className="title" style={{ fontSize: "12px" }}>
              {data?.gift_card?.category?.name}
            </span>
          </td>
          <td>
            <span className="date" style={{ fontSize: "12px" }}>
              {data?.gift_card?.name}
            </span>
          </td>
          <td>
            <span className="date" style={{ fontSize: "12px" }}>
              {data?.trade_type}
            </span>
          </td>
          <td>
            <span className="title" style={{ fontSize: "12px" }}>
              {data?.gift_card?.country_data?.name}
            </span>
          </td>
          <td>
            <span className="title" style={{ fontSize: "12px" }}>
              {data?.trade_type === "buy"
                ? formatter("NGN").format(data?.gift_card?.buy_rate || 0)
                : formatter("NGN").format(data.gift_card.sell_rate || 0)}
            </span>
          </td>{" "}
          <td>
            <span className="title" style={{ fontSize: "12px" }}>
              0
            </span>
          </td>{" "}
          <td>
            <span className="title" style={{ fontSize: "12px" }}>
              {formatter().format(data?.amount)}
            </span>
          </td>{" "}
          <td>
            <span className="title" style={{ fontSize: "12px" }}>
              1
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
