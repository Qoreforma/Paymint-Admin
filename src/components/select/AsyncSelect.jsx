import React from "react";
import AsyncSelect from "react-select/async";

const RASelect = ({ ...props }) => {
  return (
    <div className="form-control-select">
      <AsyncSelect
        // value={props.value}
        className={`react-select-container ${props.className ? props.className : ""}`}
        classNamePrefix="react-select"
        {...props}
      />
    </div>
  );
};

export default RASelect;
