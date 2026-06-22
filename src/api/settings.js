import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../atoms/userState";
import { instance } from "./httpConfig";
import BACKEND_URLS from "./urls";

export const useToggle2FA = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => {
      try {
        const response = toast.promise(instance.patch(BACKEND_URLS.profile.update2fa, data), {
          success: (e) => "2FA status updated",
          loading: "Please wait...",
          error: "Failed: an error occured.",
        });
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log(data);
        queryClient.invalidateQueries(["getUser"]);
      },
    },
  );
};

export const useUpdateProfile = () => {
  const setUser = useSetRecoilState(userState);

  return useMutation(
    async (data) => {
      return await toast.promise(
        instance.patch(`${BACKEND_URLS.profile.updateProfile}`, data).then((res) => res?.data),
        {
          loading: "Updating profile...",
          success: "Profile updated successfully",
          error: (err) => err?.response?.data?.message || "Something went wrong!",
        },
      );
    },
    {
      onSuccess: (data) => {
        setUser(data?.data);
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );
};

export const useUpdateAdminPassword = () => {
  return useMutation((values) =>
    toast.promise(
      instance
        .patch(BACKEND_URLS.profile.changePassword, values)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        }),
      {
        success: `Password changed successfully`,
        loading: "Please wait...",
        error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
      },
      {
        style: {
          minWidth: "180px",
        },
      },
    ),
  );
};

// *****************************************************

export const useSetOtp = (openModal) => {
  const user = useRecoilValue(userState);
  // console.log(user);
  return useMutation(
    async () => {
      const response = await instance
        .post("/log?email=" + user.email)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return response;
    },
    {
      onSuccess: () => {
        toast.success("Please, check your email to proceed");
        openModal(true);
        return {
          message: "Successful",
          status: 200,
        };
      },
      onError: (error) => {
        toast.error(error?.response?.data);
        openModal(false);
        return {
          message: error?.response?.data,
          status: error?.response?.status,
        };
      },
    },
  );
};

export const useSendOtp = (openModal) => {
  const setUser = useSetRecoilState(userState);

  return useMutation(
    async (data) => {
      const response = await instance
        .post("/login-2FA", data)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return response;
    },
    {
      onSuccess: (data) => {
        toast.success("Successful");
        setUser(data);
        openModal(false);

        return {
          message: "Successful",
          status: 200,
        };
      },
      onError: (error) => {
        toast.error(error?.response?.data);
        return {
          message: error?.response?.data,
          status: error?.response?.status,
        };
      },
    },
  );
};

export const useTurnoff2FA = () => {
  const setUser = useSetRecoilState(userState);

  return useMutation(
    async () => {
      const response = await instance
        .put("/profile-2FA", { twoFactorAuthentication: false })
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return response;
    },
    {
      onSuccess: (data) => {
        toast.success("Successful");
        setUser(data);

        return {
          message: "Successful",
          status: 200,
        };
      },
      onError: (error) => {
        toast.error(error?.response?.data);
        return {
          message: error?.response?.data,
          status: error?.response?.status,
        };
      },
    },
  );
};

export const useGetAppVersion = () => {
  return useQuery(
    ["useGetAppVersion"],
    async () => {
      const request = await instance
        .get("/app-versions")
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });

      //   console.log(request);
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useCreateAppVersion = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post("/app-versions", data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "App version created",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["useGetAppVersion"]);
      },
    },
  );
};

export const useEditAppVersion = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ data, id }) =>
      toast.promise(
        instance
          .put("/app-versions" + `/${id}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "App version updated",
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["useGetAppVersion"]);
      },
    },
  );
};

export const useGetAppleSignInStatus = () => {
  return useQuery(
    ["apple-sign-status"],
    async () => {
      const request = await instance
        .get("/app-configs/apple-sign-in")
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });

      //   console.log(request);
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useEditAppleSignInStatus = (id) => {
  const queryClient = useQueryClient();
  // console.log(id);

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post("/app-configs" + `/${id}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Apple Sign in Updated updated",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["apple-sign-status"]);
      },
    },
  );
};

// ************************SUPPORT*****************************
export const useGetSupport = () => {
  return useQuery(
    ["useGetSupport"],
    async () => {
      const request = await instance
        .get("/support-contact")
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });

      //   console.log(request);
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useEditSupport = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put("/support-contact", data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Support Info updated",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["useGetSupport"]);
      },
    },
  );
};

// ***********************REFERRAL BONUS*****************************

export const useGetReferralBonus = () => {
  return useQuery(
    ["ReferralBonus"],
    async () => {
      const request = await instance
        .get("/referral-bonuses")
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });

      //   console.log(request);
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useEditReferralBonus = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put("/referral-bonuses" + `/${id}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Referral Bonus updated",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ReferralBonus"]);
      },
    },
  );
};

export const useCreateReferralBonus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post("/referral-bonuses", data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Referral bonus created",
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ReferralBonus"]);
      },
    },
  );
};

// ***********************TRADE BONUS*****************************
export const useGetTradeBonus = () => {
  return useQuery(
    ["TradeBonus"],
    async () => {
      const request = await instance
        .get("/trade-bonuses")
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });

      //   console.log(request);
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useEditTradeBonus = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put("/trade-bonuses" + `/${id}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Referral Bonus updated",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["TradeBonus"]);
      },
    },
  );
};

export const useCreateTradeBonus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post("/trade-bonuses", data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Trade Bonus created",
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["TradeBonus"]);
      },
    },
  );
};

export const useDeleteTradeBonus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) =>
      toast.promise(
        instance
          .delete("/trade-bonuses" + `/${id}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Trade Bonus deleted",
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["TradeBonus"]);
      },
    },
  );
};
