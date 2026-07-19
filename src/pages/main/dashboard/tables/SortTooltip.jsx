import React from "react";
import { useSearchParams } from "react-router-dom";
import { DropdownItem } from "reactstrap";

const SortToolTip = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const changeLimit = (value) => {
    setSearchParams((searchParams) => {
      searchParams.set("limit", value);
      return searchParams;
    });
  };
  return (
    <>
      <ul className="link-check">
        <li>
          <span>Show</span>
        </li>
        <li className={itemsPerPage === 100 ? "active" : ""}>
          <DropdownItem
            tag="a"
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              changeLimit(100);
            }}
          >
            100
          </DropdownItem>
        </li>
        <li className={itemsPerPage === 200 ? "active" : ""}>
          <DropdownItem
            tag="a"
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              changeLimit(200);
            }}
          >
            200
          </DropdownItem>
        </li>
        <li className={itemsPerPage === 500 ? "active" : ""}>
          <DropdownItem
            tag="a"
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              changeLimit(500);
            }}
          >
            500
          </DropdownItem>
        </li>
      </ul>
      {/* <ul className="link-check">
        <li>
          <span>Order</span>
        </li>
        <li className={sort === "dsc" ? "active" : ""}>
          <DropdownItem
            tag="a"
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              setSortState("dsc");
              sortFunc("dsc");
            }}
          >
            DESC
          </DropdownItem>
        </li>
        <li className={sort === "asc" ? "active" : ""}>
          <DropdownItem
            tag="a"
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              setSortState("asc");
            //   sortFunc("asc");
            }}
          >
            ASC
          </DropdownItem>
        </li>
      </ul> */}
    </>
  );
};

export default SortToolTip;
