import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import toast from "react-hot-toast";

export const useGetRestrictedEntities = (currentPage = 1, size = 100) => {
  const page = `page=${currentPage}`;
  const per_page = `per_page=${size}`;
  return useQuery(
    ["restricted-entities", page, size],
    async () => {
      try {
        const response = await instance.get(`/restricted-entities?${page}&${per_page}`);
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
    }
  );
};

export const useCreateRestrictedEntity = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(`/restricted-entities`, values), {
          success: "Restricted entity created",
          loading: "Please wait...",
          error: "Failed: An error occurred.",
        });
        return response;
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["restricted-entities"]);
      },
    }
  );
};

export const useUpdateRestrictedEntity = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.put(`/restricted-entities/${id}`, values), {
          success: (data) => data.message || "Update Successful",
          loading: "Please wait...",
          error: "Something happened.",
        });
        return response;
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["restricted-entities"]);
      },
    }
  );
};

export const useDeleteRestrictedEntity = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.delete(`/restricted-entities/${id}`), {
          success: "Restricted entity deleted.",
          loading: "Please wait...",
          error: "Failed: an error occurred.",
        });
        return response;
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["restricted-entities"]);
      },
    }
  );
};
