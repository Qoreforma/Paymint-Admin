import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import toast from "react-hot-toast";
import BACKEND_URLS from "./urls";

// GET email banners
export const useGetEmailBanners = () => {
  return useQuery(
    ["emailBanners"],
    async () => {
      try {
        const response = await instance.get(BACKEND_URLS.emailBanners);
        return response.data;
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    {
      retry: 1,
      retryDelay: 3000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 5000,
    },
  );
};

// UPDATE email banners
export const useUpdateEmailBanners = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.put(BACKEND_URLS.emailBanners, values), {
          success: (data) => data?.message || "Email banners updated successfully",
          loading: "Updating email banners...",
          error: (error) => error?.response?.data?.message || "Failed to update email banners",
        });
        return response;
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["emailBanners"]);
      },
    },
  );
};
