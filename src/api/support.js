import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BACKEND_URLS from "./urls";
import { instance as requests } from "./httpConfig";
import toast from "react-hot-toast";

// ── Support Queue & Stats ──────────────────────────────────────────────────

export const useGetSupportQueue = (filters = {}, page = 1, limit = 20) => {
  return useQuery(
    ["support-queue", filters, page, limit],
    async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
      if (filters.search) params.append("search", filters.search);

      const endpoint = `${BACKEND_URLS.support.queue}?${params.toString()}`;
      const res = await requests.get(endpoint);
      return res?.data;
    },
    {
      keepPreviousData: true,
      refetchInterval: 6000, // Poll every 6s for live queue updates
      refetchOnWindowFocus: true,
    }
  );
};

export const useGetSupportStats = () => {
  return useQuery(
    ["support-stats"],
    async () => {
      const res = await requests.get(BACKEND_URLS.support.stats);
      return res?.data;
    },
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    }
  );
};

// ── Single Ticket & Messages ───────────────────────────────────────────────

export const useGetSupportTicket = (ticketId) => {
  return useQuery(
    ["support-ticket", ticketId],
    async () => {
      if (!ticketId) return null;
      const res = await requests.get(BACKEND_URLS.support.ticket(ticketId));
      return res?.data;
    },
    {
      enabled: !!ticketId,
      refetchOnWindowFocus: false,
    }
  );
};

export const useGetTicketMessages = (ticketId, limit = 50) => {
  return useQuery(
    ["support-ticket-messages", ticketId, limit],
    async () => {
      if (!ticketId) return null;
      const res = await requests.get(`${BACKEND_URLS.support.messages(ticketId)}?limit=${limit}`);
      return res?.data;
    },
    {
      enabled: !!ticketId,
      refetchInterval: 3000, // Real-time chat polling
      refetchOnWindowFocus: true,
    }
  );
};

// ── Ticket Actions ─────────────────────────────────────────────────────────

export const useSendTicketMessage = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ ticketId, text, type = "text", mediaUrl }) => {
      const endpoint = BACKEND_URLS.support.messages(ticketId);
      const res = await requests.post(endpoint, { text, type, mediaUrl });
      return res?.data;
    },
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(["support-ticket-messages", variables.ticketId]);
        queryClient.invalidateQueries(["support-queue"]);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to send message";
        toast.error(msg);
      },
    }
  );
};

export const useClaimTicket = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (ticketId) => {
      const res = await requests.post(BACKEND_URLS.support.claim(ticketId));
      return res?.data;
    },
    {
      onSuccess: (_data, ticketId) => {
        toast.success("Ticket claimed successfully");
        queryClient.invalidateQueries(["support-queue"]);
        queryClient.invalidateQueries(["support-stats"]);
        queryClient.invalidateQueries(["support-ticket", ticketId]);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to claim ticket";
        toast.error(msg);
      },
    }
  );
};

export const useReassignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ ticketId, newAdminId, newAdminName }) => {
      const res = await requests.post(BACKEND_URLS.support.reassign(ticketId), {
        newAdminId,
        newAdminName,
      });
      return res?.data;
    },
    {
      onSuccess: (_data, variables) => {
        toast.success("Ticket reassigned successfully");
        queryClient.invalidateQueries(["support-queue"]);
        queryClient.invalidateQueries(["support-ticket", variables.ticketId]);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to reassign ticket";
        toast.error(msg);
      },
    }
  );
};

export const useResolveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ ticketId, note }) => {
      const res = await requests.post(BACKEND_URLS.support.resolve(ticketId), { note });
      return res?.data;
    },
    {
      onSuccess: (_data, variables) => {
        toast.success("Ticket marked as resolved");
        queryClient.invalidateQueries(["support-queue"]);
        queryClient.invalidateQueries(["support-stats"]);
        queryClient.invalidateQueries(["support-ticket", variables.ticketId]);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to resolve ticket";
        toast.error(msg);
      },
    }
  );
};

export const useCloseTicket = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ ticketId, reason }) => {
      const res = await requests.post(BACKEND_URLS.support.close(ticketId), { reason });
      return res?.data;
    },
    {
      onSuccess: (_data, variables) => {
        toast.success("Ticket closed");
        queryClient.invalidateQueries(["support-queue"]);
        queryClient.invalidateQueries(["support-stats"]);
        queryClient.invalidateQueries(["support-ticket", variables.ticketId]);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to close ticket";
        toast.error(msg);
      },
    }
  );
};

// ── Outage Notices ─────────────────────────────────────────────────────────

export const useGetOutage = (provider) => {
  return useQuery(
    ["support-outage", provider],
    async () => {
      if (!provider) return null;
      const res = await requests.get(BACKEND_URLS.support.outage(provider));
      return res?.data;
    },
    {
      enabled: !!provider,
      refetchOnWindowFocus: false,
    }
  );
};

export const useSetOutage = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ provider, message, ttlSeconds }) => {
      const res = await requests.post(BACKEND_URLS.support.outages, {
        provider,
        message,
        ttlSeconds,
      });
      return res?.data;
    },
    {
      onSuccess: (_data, variables) => {
        toast.success(`Outage notice set for ${variables.provider}`);
        queryClient.invalidateQueries(["support-outage", variables.provider]);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to set outage notice";
        toast.error(msg);
      },
    }
  );
};

export const useDeleteOutage = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (provider) => {
      const res = await requests.delete(BACKEND_URLS.support.outage(provider));
      return res?.data;
    },
    {
      onSuccess: (_data, provider) => {
        toast.success(`Outage notice cleared for ${provider}`);
        queryClient.invalidateQueries(["support-outage", provider]);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to clear outage notice";
        toast.error(msg);
      },
    }
  );
};

// ── Admin List Helper for Reassign ─────────────────────────────────────────

export const useGetAdmins = () => {
  return useQuery(
    ["all-admins-support"],
    async () => {
      const res = await requests.get(`${BACKEND_URLS.admin.getAdmins}?limit=100`);
      return res?.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    }
  );
};
