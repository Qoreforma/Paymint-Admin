import axios from "axios";
import Cookies from "js-cookie";

// import BackendUrls from "@api/urls";
// import config from "@utils/config";
import config from "../utils/config";
import { useRefreshToken } from "./authentication";
import BACKEND_URLS from "./urls";
import toast from "react-hot-toast";

// Request Config

export const configOptions = () => {
  if (typeof window === "undefined") return {};

  if (!Cookies.get(config.key.token)) return {};

  const accessToken = Cookies.get("access_token");

  if (!!accessToken) {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
  return {};
};

//BaseURL

export const instance = axios.create({
  baseURL: BACKEND_URLS.baseURL,
});

//Request interceptors for APIs calls
instance.interceptors.request.use(
  async (config) => {
    const access_token = Cookies.get("access_token");
    // console.log(access_token);
    if (config?.auth?.includes("auth")) {
      return config;
    }
    config.headers = {
      Authorization: `Bearer ${access_token}`,
      ...(config.data instanceof FormData ? {} : { "Content-Type": "application/json" }),
    };
    // console.log(config);
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

//RESPONSE INTERCEPTOR FOR API CALLS
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints
    const authExcludedRoutes = [BACKEND_URLS.auth.login, BACKEND_URLS.auth.refreshToken];

    if (authExcludedRoutes.some((route) => originalRequest?.url?.includes(route))) {
      return Promise.reject(error);
    }

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useRefreshToken();
        return instance(originalRequest);
      } catch (refreshError) {
        Cookies.remove("refresh_token");
        Cookies.remove("access_token");
        window.location.replace("/auth-login");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
