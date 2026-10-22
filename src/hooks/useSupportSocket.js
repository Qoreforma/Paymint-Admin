import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import tokenStorage from "../utils/tokenStorage";

/**
 * Connects admin to the /support/admin Socket.IO namespace.
 *
 * @param {boolean} enabled  - Set false to skip connecting (e.g. not on support page)
 * @returns {{ socket, connected }}
 */
const useSupportSocket = (enabled = true) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const getSocket = useCallback(() => socketRef.current, []);

  useEffect(() => {
    if (!enabled) return;

    const token = tokenStorage.getAccessToken();
    if (!token) return;

    const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL || "";

    const socket = io(`${baseUrl}/support/admin`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      // Join the global admin support queue room to receive new ticket events
      socket.emit("support:queue_stats");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("[SupportSocket] connect_error:", err.message);
      setConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled]);

  return { socket: socketRef.current, getSocket, connected };
};

export default useSupportSocket;
