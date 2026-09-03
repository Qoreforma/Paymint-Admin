import React, { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Icon, Col, Row } from "../../../../components/Component";
import DatePicker from "react-datepicker";
import { formatDateNumeric } from "../../../../utils/Utils";
import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";

const DateRangeFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [rangeDate, setRangeDate] = useState({
    start: searchParams.get("startDate") ? new Date(searchParams.get("startDate")) : null,
    end: searchParams.get("endDate") ? new Date(searchParams.get("endDate")) : null,
  });

  const onRangeChange = (dates) => {
    const [start, end] = dates;
    setRangeDate({ start: start, end: end });
  };

  const applyDateFilter = useCallback(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      if (rangeDate.start && rangeDate.end) {
        newParams.set("startDate", formatDateNumeric(rangeDate.start));
        newParams.set("endDate", formatDateNumeric(rangeDate.end));
        newParams.set("period", "custom");
      } else {
        newParams.delete("startDate");
        newParams.delete("endDate");
        newParams.delete("period");
      }

      newParams.set("page", "1");
      return newParams;
    });

    setIsOpen(false);
  }, [rangeDate, setSearchParams]);

  const resetDateFilter = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("startDate");
      newParams.delete("endDate");
      newParams.delete("period");
      newParams.set("page", "1");
      return newParams;
    });
    setRangeDate({ start: null, end: null });
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const hasDateFilter = searchParams.get("startDate") && searchParams.get("endDate");

  return (
    <UncontrolledDropdown isOpen={isOpen} toggle={toggle}>
      <DropdownToggle
        tag="a"
        className="fw-medium text-dark text-decoration-none"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 14px",
          height: "38px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        <Icon name="calendar-alt" style={{ fontSize: "15px", color: "#64748b" }} />
        <span>Filter by Date</span>
      </DropdownToggle>
      <DropdownMenu end className="filter-wg dropdown-menu-xl" style={{ overflow: "visible", padding: "20px" }}>
        <div className="dropdown-head">
          <span className="sub-title dropdown-title">Select Date Range</span>
        </div>
        <div className="dropdown-body dropdown-body-rg">
          <Row className="gx-6 gy-4">
            <Col size="12">
              <div className="form-group">
                <label className="overline-title overline-title-alt">Date Range</label>
                <DatePicker
                  selected={rangeDate.start}
                  startDate={rangeDate.start}
                  onChange={onRangeChange}
                  endDate={rangeDate.end}
                  selectsRange={true}
                  className="form-control date-picker"
                  maxDate={new Date()}
                  placeholderText="Select date range"
                  isClearable={true}
                />
              </div>
            </Col>
            <Col size="6">
              <Button
                type="button"
                onClick={applyDateFilter}
                className="btn btn-secondary w-100"
                disabled={!rangeDate.start || !rangeDate.end}
              >
                Apply Filter
              </Button>
            </Col>
            <Col size="6">
              <Button type="button" onClick={resetDateFilter} disabled={!hasDateFilter}>
                Reset
              </Button>
            </Col>
          </Row>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default DateRangeFilter;
