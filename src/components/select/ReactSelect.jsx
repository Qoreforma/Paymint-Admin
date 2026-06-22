import React from "react";
import Select from "react-select";

const RSelect = ({ ...props }) => {
  return (
    <div className="form-control-select">
      <Select
        // value={props.value}
        className={`react-select-container ${props.className ? props.className : ""}`}
        classNamePrefix="react-select"
        {...props}
      />
    </div>
  );
};

export default RSelect;
