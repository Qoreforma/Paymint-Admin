import { Spinner } from "reactstrap";

export const LoadingSpinner = () => {
  return (
    <div className="m-auto" style={{ display: "flex", justifyContent: "center", paddingBlock: "3rem" }}>
      <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
    </div>
  );
};

export default LoadingSpinner;
