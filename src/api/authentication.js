import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { redirect, useLocation, useNavigate } from "react-router-dom";
import { useResetRecoilState, useSetRecoilState } from "recoil";
import { userState } from "../atoms/userState";
import { instance } from "./httpConfig";
import BACKEND_URLS from "./urls";

const inThreeHours = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);

export const useLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectPath = location.state?.path || "/";
  const setUser = useSetRecoilState(userState);
  const inOneHour = new Date(new Date().getTime() + 60 * 60 * 1000);
  // const inTenSeconds = new Date(new Date().getTime() + 10000);

  return useMutation(
    async (values) => {
      const request = await instance
        .post(BACKEND_URLS.auth.login, values)
        .then((res) => res.data)
        .catch((err) => {
          throw err?.response?.data;
        });
      return request;
    },
    {
      onSuccess: (data, variables) => {
        if (data?.data === null) {
          toast.success("Please, check your email to proceed");
          navigate(`/auth-2fa?email=${variables.email}`);
        } else {
          toast.success("Login successful");
          console.log({ data });
          const { admin, tokens } = data.data;
          const { accessToken, refreshToken } = tokens;
          console.log({ admin });
          console.log("Admin going to recoil:", JSON.stringify(admin));
          setUser(admin);
          Cookies.set("access_token", accessToken, { expires: inThreeHours });
          Cookies.set("refresh_token", refreshToken, { expires: 1 });
          navigate(redirectPath);
        }
      },
      onError: (error) => {
        if (error) {
          console.error(error);
          throw error;
        }
      },
    },
  );
};

export const useForgotPassword = (email) => {
  const navigate = useNavigate();

  return useMutation(
    async (values) => {
      const request = await instance
        .post(BACKEND_URLS.auth.forgotPassword, values)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      onSuccess: (data) => {
        console.log({ successData: data });
        toast.success("Password reset OTP sent successfully");
        navigate(`/auth-change-password?email=${email}`);
      },
      onError: (error) => {
        if (error) {
          const errorMessage = error?.response?.data?.message
            ? error?.response?.data?.message
            : error?.status === 429
              ? error?.response?.data
              : "Something went wrong, please try again";
          toast.error(errorMessage);
          console.log(error);
        }
      },
    },
  );
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation(
    async (values) => {
      const request = await instance
        .post(BACKEND_URLS.auth.resetPassword, values)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      onSuccess: () => {
        toast.success("Password reset successfully");
        navigate("/auth-login");
      },
      onError: (error) => {
        if (error) {
          const errorMessage =
            error?.status === 422
              ? error?.response?.data?.details?.[0]?.message
              : error?.response?.data?.message
                ? error?.response?.data?.message
                : "Something went wrong, please try again";
          toast.error(errorMessage);
          console.error(error);
        }
      },
    },
  );
};

export const useGetUser = () => {
  const setUser = useSetRecoilState(userState);

  return useQuery(
    ["getUser"],
    async () => {
      try {
        const res = await instance.get(BACKEND_URLS.auth.me);
        return res?.data;
      } catch (err) {
        throw err;
      }
    },
    {
      onSuccess: (data) => {
        if (data) setUser(data?.data);
      },
      retry: 1,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
};

export const useRefreshToken = async () => {
  console.log("Refreshing token called");
  const inThreeHours = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);

  // const navigate = useNavigate();
  const refreshToken = Cookies.get("refresh_token");
  try {
    const response = await instance.post(`${BACKEND_URLS.auth.refreshToken}`, {
      refreshToken: refreshToken ? refreshToken : "",
    });
    Cookies.set("access_token", response?.data?.data?.accessToken, { expires: inThreeHours });
    Cookies.set("refresh_token", response?.data?.data?.refreshToken, { expires: 1 });
  } catch (error) {
    console.log(error.response.status);
    if (error.response.status === 401) {
      console.error(error);
      Cookies.remove("refresh_token");
      Cookies.remove("access_token");
      window.location.replace("/auth-login");
    }
    console.error(error);
    throw error;
  }
};

export const useLogout = () => {
  const navigate = useNavigate();
  const resetUser = useResetRecoilState(userState);
  return useMutation(
    async () => {
      const refreshToken = Cookies.get("refresh_token");
      return instance
        .post(`${BACKEND_URLS.auth.logout}`)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        });
    },
    {
      onSuccess: () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        resetUser();
        navigate("/auth-login", { replace: true });
      },
      onError: (err) => {
        console.error(err);
      },
    },
  );
};

export const useVerify2FA = () => {
  const setUser = useSetRecoilState(userState);
  const redirectPath = location.state?.path || "/";
  const navigate = useNavigate();

  return useMutation(
    (data) => {
      try {
        const response = toast.promise(instance.post(`/auth/verify-2fa`, data), {
          success: () => "Login Successful",
          loading: "Please wait...",
          error: (err) => (err?.response?.data?.message ? err?.response?.data?.message : "Failed: an error occured."),
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: (data) => {
        console.log(data?.data);
        const { admin, tokens } = data?.data?.data;
        const { accessToken, refreshToken } = tokens;
        setUser(admin);
        Cookies.set("access_token", accessToken, { expires: inThreeHours });
        Cookies.set("refresh_token", refreshToken, { expires: 1 });
        navigate(redirectPath);
      },
    },
  );
};
