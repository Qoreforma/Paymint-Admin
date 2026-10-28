import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { instance } from "./httpConfig";
import BACKEND_URLS from "./urls";

/**
 * Fetch aggregated in-app notification groups with pagination, search, status, and summary KPIs.
 */
export const useGetInAppNotificationGroups = (page = 1, limit = 20, search = "", type = "", status = "") => {
  const queryParams = new URLSearchParams();
  if (page) queryParams.set("page", page);
  if (limit) queryParams.set("limit", limit);
  if (search) queryParams.set("search", search);
  if (type) queryParams.set("type", type);
  if (status) queryParams.set("status", status);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery(
    ["InAppNotificationGroups", page, limit, search, type, status],
    async () => {
      const response = await instance
        .get(`${BACKEND_URLS.inAppNotifications}/groups${queryString}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err?.response?.data || err;
        });
      return response;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
      keepPreviousData: true,
    }
  );
};

/**
 * Fetch individual group details, source alert, and recipient delivery list.
 */
export const useGetInAppNotificationGroupDetails = (groupKey, page = 1, limit = 20) => {
  return useQuery(
    ["InAppNotificationGroupDetails", groupKey, page, limit],
    async () => {
      if (!groupKey) return null;
      const response = await instance
        .get(`${BACKEND_URLS.inAppNotifications}/groups/${encodeURIComponent(groupKey)}?page=${page}&limit=${limit}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err?.response?.data || err;
        });
      return response;
    },
    {
      enabled: !!groupKey,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};

/**
 * Update notification title, message, or expiration date across ALL recipients in the group.
 */
export const useUpdateInAppNotificationGroup = (groupKey) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`${BACKEND_URLS.inAppNotifications}/groups/${encodeURIComponent(groupKey)}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err?.response?.data || err;
          }),
        {
          success: (res) => res?.message || "In-app notification updated for all users successfully",
          loading: "Updating notification across all users...",
          error: (err) => err?.message || "Failed to update notification",
        },
        {
          style: { minWidth: "220px" },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["InAppNotificationGroups"]);
        queryClient.invalidateQueries(["InAppNotificationGroupDetails"]);
      },
    }
  );
};

/**
 * Delete / recall notification group across ALL recipients (soft-delete or hard-delete).
 */
export const useDeleteInAppNotificationGroup = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ groupKey, hardDelete = false }) =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.inAppNotifications}/groups/${encodeURIComponent(groupKey)}?hardDelete=${hardDelete}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err?.response?.data || err;
          }),
        {
          success: (res) => res?.message || "Notification removed for all users successfully",
          loading: "Removing notification across all user inboxes...",
          error: (err) => err?.message || "Failed to remove notification",
        },
        {
          style: { minWidth: "220px" },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["InAppNotificationGroups"]);
        queryClient.invalidateQueries(["InAppNotificationGroupDetails"]);
      },
    }
  );
};

/**
 * Set or adjust expiration / TTL for a notification group (e.g. 2 days, 7 days, or custom date).
 */
export const useSetInAppNotificationGroupExpiry = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ groupKey, expiryDays, expiresAt }) =>
      toast.promise(
        instance
          .patch(`${BACKEND_URLS.inAppNotifications}/groups/${encodeURIComponent(groupKey)}/expiry`, {
            expiryDays,
            expiresAt,
          })
          .then((res) => res.data)
          .catch((err) => {
            throw err?.response?.data || err;
          }),
        {
          success: (res) => res?.message || "Expiration updated successfully",
          loading: "Updating expiration duration...",
          error: (err) => err?.message || "Failed to update expiration",
        },
        {
          style: { minWidth: "220px" },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["InAppNotificationGroups"]);
        queryClient.invalidateQueries(["InAppNotificationGroupDetails"]);
      },
    }
  );
};

/**
 * Clear all notifications of a specific type (e.g. announcements, security alerts, older than X days).
 */
export const useClearInAppNotificationsByType = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`${BACKEND_URLS.inAppNotifications}/clear-by-type`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err?.response?.data || err;
          }),
        {
          success: (res) => res?.message || "Notifications cleared successfully",
          loading: "Clearing matching notifications across all users...",
          error: (err) => err?.message || "Failed to clear notifications",
        },
        {
          style: { minWidth: "220px" },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["InAppNotificationGroups"]);
      },
    }
  );
};

/**
 * Dispatch direct in-app broadcast with built-in duration/expiry.
 */
export const useCreateInAppBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`${BACKEND_URLS.inAppNotifications}/broadcast`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err?.response?.data || err;
          }),
        {
          success: (res) => res?.message || "In-app broadcast created and dispatched successfully",
          loading: "Broadcasting notification to users...",
          error: (err) => err?.message || "Failed to broadcast notification",
        },
        {
          style: { minWidth: "220px" },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["InAppNotificationGroups"]);
      },
    }
  );
};
