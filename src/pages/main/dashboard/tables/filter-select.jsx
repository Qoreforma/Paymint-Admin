import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Button, Col, Icon, RSelect, Row } from "../../../../components/Component";
import { objectToQueryString, formatDateNumeric } from "../../../../utils/Utils";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";

export const filterProductStatus = [
  { value: "active", label: "active" },
  { value: "pending", label: "pending" },
  { value: "inactive", label: "inactive" },
  { value: "deleted", label: "deleted" },
];

export const FilterOptions = ({ options = [], showDate = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [filters, setfilters] = useState({});
  const [rangeDate, setRangeDate] = useState({
    start: null,
    end: null,
  });

  // Sync state with searchParams on load/URL change
  useEffect(() => {
    const currentFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page" && key !== "limit" && key !== "search") {
        currentFilters[key] = value;
      }
    }
    setfilters(currentFilters);
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");
    if (startParam || endParam) {
      setRangeDate({
        start: startParam ? new Date(startParam) : null,
        end: endParam ? new Date(endParam) : null,
      });
    } else {
      setRangeDate({ start: null, end: null });
    }
  }, [searchParams]);

  const onRangeChange = (dates) => {
    const [start, end] = dates;
    setRangeDate({ start: start, end: end });
    setfilters({ ...filters, startDate: formatDateNumeric(start), endDate: end ? formatDateNumeric(end) : "" });
  };

  const filterData = useCallback(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      newParams.set("page", "1");
      return newParams;
    });

    setIsOpen(false);
  }, [filters, setSearchParams]);

  const resetFilter = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams();
      if (prev.get("search")) newParams.set("search", prev.get("search"));
      if (prev.get("limit")) newParams.set("limit", prev.get("limit"));
      newParams.set("page", "1");
      return newParams;
    });
    setfilters({});
    setRangeDate({ start: null, end: null });
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([k, v]) => k !== "page" && k !== "limit" && Boolean(v),
  );

  return (
    <UncontrolledDropdown isOpen={isOpen} toggle={toggle}>
      <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
        {hasActiveFilters && <div className="dot dot-primary"></div>}
        <Icon name="filter-alt"></Icon>
      </DropdownToggle>
      <DropdownMenu end className="filter-wg dropdown-menu-xl" direction={"top"} style={{ overflow: "visible" }}>
        <div className="dropdown-head">
          <span className="sub-title dropdown-title">Advanced Filter</span>
        </div>
        <div className="dropdown-body dropdown-body-rg">
          <Row className="gx-6 gy-4">
            {options.map((item, index) => {
              const label = item?.label || item?.name;
              const currentValue = filters[item.name];
              const selectedOption = currentValue
                ? item?.options?.find(
                    (opt) =>
                      opt.value === currentValue ||
                      (opt.value && String(opt.value).toLowerCase() === String(currentValue).toLowerCase()),
                  )
                : null;

              return (
                <Col key={index} size={options.length <= 1 ? "12" : "6"}>
                  <div className="form-group">
                    <label className="overline-title overline-title-alt">{label}</label>
                    <RSelect
                      options={item.options}
                      placeholder={item?.placeholder || `Any ${label}`}
                      value={selectedOption}
                      onChange={(e) => setfilters({ ...filters, [item.name]: e ? e.value : "" })}
                    />
                  </div>
                </Col>
              );
            })}
            {showDate && (
              <Col size={"12"}>
                <div className="form-group">
                  <label className="overline-title overline-title-alt">Date range</label>
                  <DatePicker
                    selected={rangeDate.start}
                    startDate={rangeDate.start}
                    onChange={onRangeChange}
                    endDate={rangeDate.end}
                    selectsRange={"range"}
                    className="form-control date-picker"
                    maxDate={new Date()}
                  />
                </div>
              </Col>
            )}
            <Col size="12">
              <div className="form-group">
                <Button type="button" onClick={filterData} className="btn btn-secondary ">
                  Filter
                </Button>
              </div>
            </Col>
          </Row>
        </div>
        <div className="dropdown-foot between">
          <a
            href="#reset"
            onClick={(ev) => {
              ev.preventDefault();
              resetFilter();
            }}
            className="clickable"
          >
            Reset Filter
          </a>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};
