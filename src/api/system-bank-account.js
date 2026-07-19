import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import toast from "react-hot-toast";
import BACKEND_URLS from "./urls";

export const useGetSystemAccount = (currentPage = 1, size = 100) => {
  const page = `page=${currentPage}`;
  const per_page = `per_page=${size}`;
  return useQuery(
    ["systemAccount", page, size],
    async () => {
      try {
        const response = await instance.get(BACKEND_URLS.systemAccount + `?${page}&${per_page}`);
        // console.log(response.data.data);
        // toast.success(response.data.message);
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
    },
  );
};

export const useCreateSystemAccount = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.systemAccount, values), {
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
        queryClient.invalidateQueries(["systemAccount"]);
      },
    },
  );
};

export const useUpdateSystemAccount = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.systemAccount + `/${id}`, values), {
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
        queryClient.invalidateQueries(["systemAccount"]);
      },
    },
  );
};
export const useVerifyAccount = (formData, setFormData) => {
  return useMutation(
    (values) => {
      try {
        const response = instance.post(BACKEND_URLS.systemAccount + `/verify`, values);
        return response;
      } catch (error) {
        Promise.reject(error);
        throw error?.response?.data;
      }
    },
    {
      onSuccess: (data) => {
        setFormData({ ...formData, account_name: data?.data?.data?.accountName });
      },
    },
  );
};

export const useDeletesystemAccount = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.delete(BACKEND_URLS.systemAccount + `/${id}`), {
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
        queryClient.invalidateQueries(["systemAccount"]);
      },
    },
  );
};

export const useToggleSystemAccount = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.systemAccount + `/${id}`, data)
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
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["systemAccount"]);
      },
    },
  );
};
