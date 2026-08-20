import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { instance } from "./httpConfig";
import BACKEND_URLS from "./urls";

// ─── App Settings (Feature Flag) ─────────────────────────────────────────────

export const useGetAppSettings = () => {
  return useQuery(
    ["AppSettings"],
    async () => {
      const res = await instance.get(BACKEND_URLS.appSettings);
      return res?.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};

export const useToggleRewardSystem = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (isRewardSystem) =>
      toast.promise(
        instance
          .patch(`${BACKEND_URLS.appSettings}/toggle`, { isRewardSystem })
          .then((res) => res.data),
        {
          loading: "Updating reward system status...",
          success: (data) => data?.message || "Reward system status updated",
          error: (err) =>
            err?.response?.data?.message || "Failed to update reward system status",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["AppSettings"]);
      },
    }
  );
};

// ─── Qualification Rules ───────────────────────────────────────────────────

export const useGetQualificationRules = () => {
  return useQuery(
    ["QualificationRules"],
    async () => {
      const res = await instance.get(BACKEND_URLS.qualificationRules);
      return res?.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};

export const useCreateQualificationRule = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.qualificationRules, data)
          .then((res) => res.data),
        {
          loading: "Creating qualification rule...",
          success: "Qualification rule created successfully",
          error: (err) =>
            err?.response?.data?.message || "Failed to create rule",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["QualificationRules"]);
      },
    }
  );
};

export const useEditQualificationRule = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`${BACKEND_URLS.qualificationRules}/${id}`, data)
          .then((res) => res.data),
        {
          loading: "Updating qualification rule...",
          success: "Qualification rule updated successfully",
          error: (err) =>
            err?.response?.data?.message || "Failed to update rule",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["QualificationRules"]);
        queryClient.invalidateQueries(["RewardTiers"]);
      },
    }
  );
};

// ─── Reward Tiers ──────────────────────────────────────────────────────────

export const useGetRewardTiers = () => {
  return useQuery(
    ["RewardTiers"],
    async () => {
      const res = await instance.get(BACKEND_URLS.rewardTiers);
      return res?.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};

export const useGetRewardTier = (id) => {
  return useQuery(
    ["RewardTier", id],
    async () => {
      if (!id) return null;
      const res = await instance.get(`${BACKEND_URLS.rewardTiers}/${id}`);
      return res?.data;
    },
    {
      enabled: !!id,
      retry: 1,
    }
  );
};

export const useCreateRewardTier = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance.post(BACKEND_URLS.rewardTiers, data).then((res) => res.data),
        {
          loading: "Creating reward tier...",
          success: "Reward tier created successfully",
          error: (err) =>
            err?.response?.data?.message || "Failed to create reward tier",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["RewardTiers"]);
      },
    }
  );
};

export const useEditRewardTier = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`${BACKEND_URLS.rewardTiers}/${id}`, data)
          .then((res) => res.data),
        {
          loading: "Updating reward tier...",
          success: "Reward tier updated successfully",
          error: (err) =>
            err?.response?.data?.message || "Failed to update reward tier",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["RewardTiers"]);
        queryClient.invalidateQueries(["RewardTier", id]);
      },
    }
  );
};

export const useDeleteRewardTier = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.rewardTiers}/${id}`)
          .then((res) => res.data),
        {
          loading: "Deleting reward tier...",
          success: "Reward tier deleted successfully",
          error: (err) =>
            err?.response?.data?.message || "Failed to delete reward tier",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["RewardTiers"]);
      },
    }
  );
};

// ─── Spin Wheels ───────────────────────────────────────────────────────────

export const useGetWheelConfigs = () => {
  return useQuery(
    ["SpinWheelConfigs"],
    async () => {
      const res = await instance.get(BACKEND_URLS.spinWheels);
      return res?.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};

export const useGetWheelConfigByTier = (tierId) => {
  return useQuery(
    ["SpinWheelConfigByTier", tierId],
    async () => {
      if (!tierId) return null;
      const res = await instance.get(
        `${BACKEND_URLS.spinWheels}/tier/${tierId}`
      );
      return res?.data;
    },
    {
      enabled: !!tierId,
      retry: false,
    }
  );
};

export const useCreateWheelConfig = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance.post(BACKEND_URLS.spinWheels, data).then((res) => res.data),
        {
          loading: "Saving wheel configuration...",
          success: "Wheel configuration saved successfully",
          error: (err) =>
            err?.response?.data?.message || "Failed to save wheel configuration",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["SpinWheelConfigs"]);
        queryClient.invalidateQueries(["SpinWheelConfigByTier"]);
      },
    }
  );
};

export const useEditWheelConfig = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`${BACKEND_URLS.spinWheels}/${id}`, data)
          .then((res) => res.data),
        {
          loading: "Updating wheel configuration...",
          success: "Wheel configuration updated successfully",
          error: (err) =>
            err?.response?.data?.message ||
            "Failed to update wheel configuration",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["SpinWheelConfigs"]);
        queryClient.invalidateQueries(["SpinWheelConfigByTier"]);
      },
    }
  );
};

export const useCalculateCost = () => {
  return useMutation(async (data) => {
    const res = await instance.post(
      `${BACKEND_URLS.spinWheels}/calculate-cost`,
      data
    );
    return res?.data;
  });
};

// ─── Analytics ─────────────────────────────────────────────────────────────

export const useGetRewardAnalytics = () => {
  return useQuery(
    ["RewardAnalytics"],
    async () => {
      const res = await instance.get(BACKEND_URLS.rewardAnalytics);
      return res?.data?.data;
    },
    {
      refetchInterval: 30000,
      retry: 1,
    }
  );
};

// ─── Payout Queue & Retry ──────────────────────────────────────────────────

export const useGetRewardPayouts = (status = "", page = 1, limit = 20) => {
  return useQuery(
    ["RewardPayouts", status, page, limit],
    async () => {
      const url = `${BACKEND_URLS.rewardPayouts}?status=${status}&page=${page}&limit=${limit}`;
      const res = await instance.get(url);
      return res?.data?.data;
    },
    {
      retry: 1,
      keepPreviousData: true,
    }
  );
};

export const useRetryRewardPayout = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, overrideRecipientPhone }) =>
      toast.promise(
        instance
          .post(`${BACKEND_URLS.rewardPayouts}/${id}/retry`, {
            overrideRecipientPhone,
          })
          .then((res) => res.data),
        {
          loading: "Retrying reward fulfillment...",
          success: "Fulfillment retry initiated successfully",
          error: (err) =>
            err?.response?.data?.message || "Failed to retry fulfillment",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["RewardPayouts"]);
        queryClient.invalidateQueries(["RewardAnalytics"]);
      },
    }
  );
};
