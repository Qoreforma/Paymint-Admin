import axios from "axios";

// import BackendUrls from "@api/urls";
// import config from "@utils/config";
import config from "../utils/config";
import tokenStorage from "../utils/tokenStorage";
import { useRefreshToken } from "./authentication";
import BACKEND_URLS from "./urls";
import toast from "react-hot-toast";

// Request Config

export const configOptions = () => {
  if (typeof window === "undefined") return {};

  const accessToken = tokenStorage.getAccessToken();

  if (!!accessToken) {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        withCredentials: true,
      },
    };
  }
  return {};
};

//BaseURL

export const instance = axios.create({
  baseURL: BACKEND_URLS.baseURL,
  withCredentials: true,
});

//Request interceptors for APIs calls
instance.interceptors.request.use(
  async (config) => {
    const access_token = tokenStorage.getAccessToken();

    // Skip Authorization header for auth endpoints
    if (config?.url?.includes("/auth/login") || config?.url?.includes("/auth/refresh")) {
      return config;
    }
    config.headers = config.headers || {};
    if (access_token) {
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Concurrency mutex and queued request handler for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

//RESPONSE INTERCEPTOR FOR API CALLS
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip refresh logic for auth endpoints
    const authExcludedRoutes = [
      BACKEND_URLS.auth.login,
      BACKEND_URLS.auth.refreshToken,
      BACKEND_URLS.auth.logout,
    ];

    if (authExcludedRoutes.some((route) => originalRequest?.url?.includes(route))) {
      return Promise.reject(error);
    }

    if (error?.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest._retry = true;
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await useRefreshToken();
        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        window.location.replace("/auth-login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
