import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import toast from "react-hot-toast";
import BACKEND_URLS from "./urls";

export const useGetServices = (currentPage = 1, size = 100) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  return useQuery(
    ["Services", page, size],
    async () => {
      try {
        const response = await instance.get(BACKEND_URLS.service + `?${page}&${per_page}`);
        return response.data;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      // initialData: [],
      retry: 1,
      retryDelay: 3000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 5000,
    }
  );
};

export const useCreateServices = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.providers, values), {
          success: "Account created",
          loading: "Please wait...",
          error: (error) => error?.response?.data?.message || "Failed. Something happened.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["Services"]);
      },
    }
  );
};

export const useUpdateServiceLogo = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.put(BACKEND_URLS.service + `/${id}`, values), {
          success: (data) => data.message || "Update Successful",
          loading: "Please wait...",
          error: (error) => error?.response?.data?.message || "Failed. Something happened.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["Services"]);
      },
    }
  );
};

export const useUpdateServices = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.service + `/${id}`, values), {
          success: (data) => data.message || "Update Successful",
          loading: "Please wait...",
          error: (error) => error?.response?.data?.message || "Failed. Something happened.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["Providers"]);
      },
    }
  );
};
export const useVerifyAccount = (formData, setFormData) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.providers + `/verify`, values), {
          success: (data) => data?.data?.message || "Update Successful",
          loading: "Please wait...",
          error: (error) => error?.response?.data?.message || "Failed. Something happened.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: (data) => {
        setFormData({ ...formData, account_name: data?.data?.data?.account_name });
      },
    }
  );
};

export const useDeleteServices = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.delete(BACKEND_URLS.service + `/${id}`), {
          success: "Account deleted.",
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
        queryClient.invalidateQueries(["Services"]);
      },
    }
  );
};

export const useToggleServices = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.service + `/${id}/status`, data)
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
        queryClient.invalidateQueries(["Services"]);
      },
    }
  );
};
