import { useRecoilValue } from "recoil";
import { userState } from "../atoms/userState";
import { useCallback } from "react";

export const usePermission = () => {
  const user = useRecoilValue(userState);

  const hasPermission = useCallback(
    (permission) => {
      return user?.permissions?.includes(permission) || user?.permissions?.includes("*");
    },
    [user],
  );

  return { hasPermission };
};
