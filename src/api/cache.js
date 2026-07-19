import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import toast from "react-hot-toast";
import BACKEND_URLS from "./urls";

export const useGetCacheStats = () => {
  return useQuery(
    ["CacheStats"],
    async () => {
      try {
        const response = await instance.get(BACKEND_URLS.cache + `/stats`);
        return response.data;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      retry: 1,
      refetchInterval: 30000, // Refresh every 30s
    }
  );
};

export const useFlushCache = () => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.cache + `/flush`), {
          success: (data) => data.message || "Cache Flushed Successfully",
          loading: "Flushing cache...",
          error: (error) => error?.response?.data?.message || "Failed to flush cache",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["CacheStats"]);
      },
    }
  );
};
