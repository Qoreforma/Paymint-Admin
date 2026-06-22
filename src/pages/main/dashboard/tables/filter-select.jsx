import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Button, Col, Icon, RSelect, Row } from "../../../../components/Component";
import { objectToQueryString, formatDateNumeric } from "../../../../utils/Utils";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useCallback, useState } from "react";
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

        newParams.set("page", "1");
      });

      return newParams;
    });

    setIsFilterOpen(false);
  }, [filters, setSearchParams]);

  const resetFilter = () => {
    setSearchParams({});
    setfilters({});
    toggle();
  };

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <UncontrolledDropdown isOpen={isOpen} toggle={toggle}>
      <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
        <div className="dot dot-primary"></div>
        <Icon name="filter-alt"></Icon>
      </DropdownToggle>
      <DropdownMenu end className="filter-wg dropdown-menu-xl" direction={"top"} style={{ overflow: "visible" }}>
        <div className="dropdown-head">
          <span className="sub-title dropdown-title">Advanced Filter</span>
        </div>
        <div className="dropdown-body dropdown-body-rg">
          <Row className="gx-6 gy-4">
            {options.map((item, index) => {
              return (
                <Col key={index} size={options.length <= 1 ? "12" : "6"}>
                  <div className="form-group">
                    <label className="overline-title overline-title-alt">{item?.name}</label>
                    <RSelect
                      options={item.options}
                      placeholder={`Any ${item.name}`}
                      value={filters[item.name] && item?.options.find((option) => option.value === filters[item.name])}
                      onChange={(e) => setfilters({ ...filters, [item.name]: e.value })}
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
