import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { instance } from "./httpConfig";
import BACKEND_URLS from "./urls";

export const useCreateBanners = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.banners, data)
          .then((res) => res.data)
          .catch((err) => {
            console.log(err.message);
            throw err.message;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error,
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["AllBanners"]);
      },
    }
  );
};

export const useGetBanners = (page, limit) => {
  return useQuery(
    ["AllBanners", page, limit],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.banners + `?page=${page}&limit=${limit}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err.response.data;
        });
      //   console.log(request);
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

export const useDeleteBanners = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.banners}/${id}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data?.message || "Successful",
          loading: "Please wait...",
          error: (error) => error?.message || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["AllBanners"]);
      },
    }
  );
};

export const useToggleBanners = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.banners + `/${id}/status`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => error?.message || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["AllBanners"]);
      },
    }
  );
};
