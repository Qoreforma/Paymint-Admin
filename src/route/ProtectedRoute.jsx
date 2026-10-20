import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGetUser } from "../api/authentication";
import AutoLogout from "../layout/autologout/AutoLogout";
import LoadingSpinner from "../pages/components/spinner";
import tokenStorage from "../utils/tokenStorage";

const ProtectedRoute = ({ redirectPath = "/auth-login" }) => {
  const refreshToken = tokenStorage.getRefreshToken();
  const location = useLocation();
  const { isLoading } = useGetUser();

  if (!refreshToken || refreshToken === "undefined") {
    return <Navigate to={redirectPath} state={{ path: location.pathname }} replace />;
  }

  return refreshToken && !isLoading ? (
    <AutoLogout>
      <Outlet />
    </AutoLogout>
  ) : (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoadingSpinner />
    </div>
  ); //if there's a refresh token return outlet
};

export default ProtectedRoute;
