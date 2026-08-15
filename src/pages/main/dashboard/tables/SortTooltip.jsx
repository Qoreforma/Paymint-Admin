import React from "react";
import { useSearchParams } from "react-router-dom";
import { DropdownItem } from "reactstrap";

const SortToolTip = ({ sortOptions = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = parseInt(searchParams.get("limit") ?? 100);
  const currentSortBy = searchParams.get("sortBy") || "";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const changeLimit = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("limit", value);
      next.set("page", "1");
      return next;
    });
  };

  const changeSort = (field, order) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (field) {
        next.set("sortBy", field);
        next.set("sortOrder", order);
      } else {
        next.delete("sortBy");
        next.delete("sortOrder");
      }
      next.set("page", "1");
      return next;
    });
  };

  return (
    <>
      {sortOptions && sortOptions.length > 0 && (
        <ul className="link-check mb-2 pb-2 border-bottom">
          <li>
            <span>Sort By</span>
          </li>
          {sortOptions.map((opt, idx) => {
            const isActive =
              (currentSortBy === opt.field && currentSortOrder === opt.order) ||
              (!currentSortBy && opt.isDefault);
            return (
              <li key={idx} className={isActive ? "active" : ""}>
                <DropdownItem
                  tag="a"
                  href="#dropdownitem"
                  onClick={(ev) => {
                    ev.preventDefault();
                    changeSort(opt.field, opt.order);
                  }}
                >
                  {opt.label}
                </DropdownItem>
              </li>
            );
          })}
        </ul>
      )}
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
    </>
  );
};

export default SortToolTip;

