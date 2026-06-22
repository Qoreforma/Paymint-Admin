import { atom } from "recoil";

//FOR PERSISTANCE WITH LOCAL STORAGE
const localStorageEffect =
  (key) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      console.log({ newValue });
      isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

export const userState = atom({
  key: "userState",
  default: {},
  effects: [localStorageEffect("qoreforma_admin")],
});
