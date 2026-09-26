import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { instance } from "./httpConfig";

export const useGetAudiences = () => {
  return useQuery(
    ["MarketingAudiences"],
    async () => {
      const res = await instance.get("/marketing/audiences");
      return res.data?.data || [];
    },
    { refetchOnWindowFocus: false }
  );
};

export const useSyncSources = () => {
  const queryClient = useQueryClient();
  return useMutation(
    () =>
      toast.promise(
        instance.post("/marketing/audiences/sync").then((res) => res.data),
        {
          loading: "Syncing sources from src/data/...",
          success: (d) => d?.message || "Synced successfully",
          error: (e) => e?.response?.data?.message || "Sync failed",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingAudiences"]);
      },
    }
  );
};

export const usePreviewAllocation = () => {
  return useMutation((allocations) =>
    instance
      .post("/marketing/campaigns/preview", { allocations })
      .then((res) => res.data?.data)
  );
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance.post("/marketing/campaigns", data).then((res) => res.data),
        {
          loading: "Queueing campaign & deduplicating recipients...",
          success: (d) => d?.message || "Campaign created successfully",
          error: (e) => e?.response?.data?.message || "Failed to create campaign",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingCampaigns"]);
        queryClient.invalidateQueries(["MarketingDailyStats"]);
      },
    }
  );
};

export const useGetCampaigns = () => {
  return useQuery(
    ["MarketingCampaigns"],
    async () => {
      const res = await instance.get("/marketing/campaigns");
      return res.data?.data || [];
    },
    { refetchInterval: 10000, refetchOnWindowFocus: false }
  );
};

export const useGetDailyStats = () => {
  return useQuery(
    ["MarketingDailyStats"],
    async () => {
      const res = await instance.get("/marketing/campaigns/stats/daily");
      return res.data?.data;
    },
    { refetchInterval: 15000, refetchOnWindowFocus: false }
  );
};

export const useControlCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, action }) =>
      toast.promise(
        instance
          .post(`/marketing/campaigns/${id}/${action}`, {})
          .then((res) => res.data),
        {
          loading: `Updating campaign (${action})...`,
          success: (d) => d?.message || `Campaign ${action} successful`,
          error: (e) => e?.response?.data?.message || `Action failed`,
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingCampaigns"]);
        queryClient.invalidateQueries(["MarketingDailyStats"]);
      },
    }
  );
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) =>
      toast.promise(
        instance.delete(`/marketing/campaigns/${id}`).then((res) => res.data),
        {
          loading: "Deleting campaign...",
          success: (d) => d?.message || "Campaign deleted successfully",
          error: (e) => e?.response?.data?.message || "Failed to delete campaign",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingCampaigns"]);
        queryClient.invalidateQueries(["MarketingDailyStats"]);
      },
    }
  );
};

export const useResetAudience = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) =>
      toast.promise(
        instance.post(`/marketing/audiences/${id}/reset`).then((res) => res.data),
        {
          loading: "Resetting contact history...",
          success: (d) => d?.message || "Contacts reset successfully",
          error: (e) => e?.response?.data?.message || "Reset failed",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingAudiences"]);
      },
    }
  );
};

export const useDeleteAudience = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) =>
      toast.promise(
        instance.delete(`/marketing/audiences/${id}`).then((res) => res.data),
        {
          loading: "Removing audience...",
          success: (d) => d?.message || "Audience deleted",
          error: (e) => e?.response?.data?.message || "Deletion failed",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingAudiences"]);
      },
    }
  );
};

export const usePruneRecipients = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (campaignId = "completed") =>
      toast.promise(
        instance
          .delete(`/marketing/campaigns/${campaignId}/recipients`)
          .then((res) => res.data),
        {
          loading: "Pruning recipient delivery logs...",
          success: (d) => d?.message || "Recipient logs purged successfully",
          error: (e) => e?.response?.data?.message || "Pruning failed",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingCampaigns"]);
      },
    }
  );
};

export const useGetEmailBanners = () => {
  return useQuery(
    ["MarketingEmailBanners"],
    async () => {
      const res = await instance.get("/marketing/campaigns/banners");
      return res.data?.data || { logoUrl: null, headerBannerUrl: null, footerBannerUrl: null };
    },
    { refetchOnWindowFocus: false }
  );
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }) =>
      toast.promise(
        instance.put(`/marketing/campaigns/${id}`, data).then((res) => res.data),
        {
          loading: "Updating campaign content...",
          success: (d) => d?.message || "Campaign updated successfully",
          error: (e) => e?.response?.data?.message || "Update failed",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingCampaigns"]);
      },
    }
  );
};

export const useTriggerNightlySweep = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (quota) =>
      toast.promise(
        instance
          .post("/marketing/campaigns/nightly-sweep/trigger", { quota })
          .then((res) => res.data),
        {
          loading: "Calculating platform Brevo sends & sweeping unused quota...",
          success: (d) => d?.message || "Nightly sweep executed successfully",
          error: (e) => e?.response?.data?.message || "Nightly sweep failed",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["MarketingCampaigns"]);
        queryClient.invalidateQueries(["MarketingDailyStats"]);
      },
    }
  );
};



