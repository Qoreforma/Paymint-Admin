import { atom } from "recoil";

// FOR PERSISTENCE WITH SESSION STORAGE (cleared on tab/window close)
const sessionStorageEffect =
  (key) =>
  ({ setSelf, onSet }) => {
    if (typeof window === "undefined") return;

    // Clear legacy localStorage data if any exists
    localStorage.removeItem(key);

    const savedValue = sessionStorage.getItem(key);
    if (savedValue != null) {
      try {
        const parsed = JSON.parse(savedValue);
        if (parsed && typeof parsed === "object") {
          if (!Array.isArray(parsed.permissions)) {
            parsed.permissions = [];
          }
          setSelf(parsed);
        }
      } catch (e) {
        sessionStorage.removeItem(key);
      }
    }

    onSet((newValue, _, isReset) => {
      if (isReset || !newValue) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(newValue));
      }
    });
  };

export const userState = atom({
  key: "userState",
  default: {
    permissions: [],
  },
  effects: [sessionStorageEffect("payminttwo_admin")],
});
