import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import toast from "react-hot-toast";
import BACKEND_URLS from "./urls";

export const useGetReferralTerms = (currentPage = 1, size = 100) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  return useQuery(
    ["referralTerms", page, size],
    async () => {
      try {
        const response = await instance.get(BACKEND_URLS.referralTerms + `?${page}&${per_page}`);
        return response.data;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
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

export const useCreateReferralTerm = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.referralTerms, values), {
          success: "Referral Term created",
          loading: "Please wait...",
          error: "Failed: An error occured.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["referralTerms"]);
      },
    }
  );
};

export const useUpdateReferralTerm = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.put(BACKEND_URLS.referralTerms + `/${id}`, values), {
          success: (data) => data.message || "Update Successful",
          loading: "Please wait...",
          error: "Something happened.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["referralTerms"]);
      },
    }
  );
};

export const useDeleteReferralTerm = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.delete(BACKEND_URLS.referralTerms + `/${id}`), {
          success: "Term deleted.",
          loading: "Please wait...",
          error: "Failed: an error occured.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["referralTerms"]);
      },
    }
  );
};
