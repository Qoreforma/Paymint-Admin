import { Spinner } from "reactstrap";

export const LoadingSpinner = ({ size, color = "primary", style, className }) => {
  if (size === "sm") {
    return (
      <div
        className={`m-auto d-inline-flex align-items-center justify-content-center ${className || ""}`}
        style={style}
      >
        <Spinner size="sm" color={color} />
      </div>
    );
  }

  return (
    <div
      className={`m-auto ${className || ""}`}
      style={{ display: "flex", justifyContent: "center", paddingBlock: "3rem", ...style }}
    >
      <Spinner color={color} style={{ width: "3rem", height: "3rem" }} />
    </div>
  );
};

export default LoadingSpinner;
