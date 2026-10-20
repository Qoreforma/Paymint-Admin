import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "payminttwo_admin";

// Create BroadcastChannel for cross-tab communication (if supported)
let authChannel = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    authChannel = new BroadcastChannel("paymint_admin_auth_channel");
    authChannel.onmessage = (event) => {
      if (event.data?.type === "LOGOUT") {
        tokenStorage.clearLocal();
        window.location.replace("/auth-login");
      }
    };
  } catch (e) {
    console.warn("BroadcastChannel not supported or failed to initialize", e);
  }
}

export const tokenStorage = {
  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: ({ accessToken, refreshToken }) => {
    if (typeof window === "undefined") return;

    if (accessToken) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    // Proactively clean up any legacy persistent cookies or localStorage
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Clear local storage in current tab without broadcasting (used when handling incoming broadcast)
  clearLocal: () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    // Clean up persistent cookies & localStorage
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Full clear + broadcast to all tabs
  clear: () => {
    tokenStorage.clearLocal();

    if (authChannel) {
      try {
        authChannel.postMessage({ type: "LOGOUT" });
      } catch (e) {
        console.error("Failed to broadcast logout", e);
      }
    }
  },

  hasValidSession: () => {
    if (typeof window === "undefined") return false;
    const token = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    return Boolean(token && token !== "undefined" && token !== "null");
  },
};

export default tokenStorage;
