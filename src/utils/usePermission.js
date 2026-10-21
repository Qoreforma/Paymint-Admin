import { useRecoilValue } from "recoil";
import { userState } from "../atoms/userState";
import { useCallback } from "react";

export const usePermission = () => {
  const user = useRecoilValue(userState);

  const hasPermission = useCallback(
    (permission) => {
      if (!Array.isArray(user?.permissions)) return false;
      return user.permissions.includes(permission) || user.permissions.includes("*");
    },
    [user],
  );

  return { hasPermission };
};
