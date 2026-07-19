import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLogout } from "../../api/authentication";

const AutoLogout = ({ children }) => {
  const { mutate: logout } = useLogout();
  const events = useMemo(() => {
    return ["load", "mousemove", "mousedown", "click", "scroll", "keypress"];
  }, []);

  let timer = useRef();
  // this resets the timer if it exists.
  const resetTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, [timer]);

  // this function sets the timer that logs out the user after 30 minutes
  const handleLogoutTimer = useCallback(() => {
    timer.current = setTimeout(() => {
      // clears any pending timer.
      resetTimer();
      // Listener clean up. Removes the existing event listener from the window
      Object.values(events).forEach((item) => {
        window.removeEventListener(item, resetTimer);
      });
      // logs out user
      logout();
    }, 1000 * 60 * 30); // 30 minutes.
  }, [timer, events, logout, resetTimer]);

  // when component mounts, it adds an event listeners to the window
  // each time any of the event is triggered, i.e on mouse move, click, scroll, keypress etc, the timer to logout user after 30 minutes of inactivity resets.
  // However, if none of the event is triggered within 10 secs, that is app is inactive, the app automatically logs out.
  useEffect(() => {
    Object.values(events).forEach((item) => {
      window.addEventListener(item, () => {
        resetTimer();
        handleLogoutTimer();
      });
    });
  }, [events, handleLogoutTimer, resetTimer]);

  return children;
};

export default AutoLogout;
