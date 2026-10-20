import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useLogout } from "../../api/authentication";

// 15 minutes of inactivity before auto-logout
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const AutoLogout = ({ children }) => {
  const { mutate: logout } = useLogout();
  const timer = useRef(null);
  const throttleTimer = useRef(null);

  const handleLogout = useCallback(() => {
    toast.error("Session expired due to inactivity. Please log in again.", {
      id: "idle-logout-toast",
    });
    logout();
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(handleLogout, IDLE_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "click", "scroll", "keypress", "touchstart"];

    const handleUserActivity = () => {
      // Throttle timer reset so rapid mouse movements don't hammer the timer
      if (!throttleTimer.current) {
        throttleTimer.current = setTimeout(() => {
          throttleTimer.current = null;
          resetTimer();
        }, 1000);
      }
    };

    // Start timer on initial mount
    resetTimer();

    // Attach listeners
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Cleanup listeners and timers on unmount
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (throttleTimer.current) clearTimeout(throttleTimer.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [resetTimer]);

  return children;
};

export default AutoLogout;
