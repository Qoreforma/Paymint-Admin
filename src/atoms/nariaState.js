import axios from "axios";
import { atom, selector } from "recoil";

export const nairaState = atom({
  key: "nairaState",
  default: selector({
    key: "nairaState/default",
    get: async () => {
      const response = await axios.get("https://cdn.moneyconvert.net/api/latest.json");
      return response.data.rates["NGN"];
    },
  }),
  // effects: [localStorageEffect()],
});

export const currencyState = selector({
  key: "currencyState",
  get: async () => {
    const response = await axios.get("https://cdn.moneyconvert.net/api/latest.json");
    return response.data.rates["NGN"];
  },
});
