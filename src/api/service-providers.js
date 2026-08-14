import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import toast from "react-hot-toast";
import BACKEND_URLS from "./urls";

export const useGetProviders = (currentPage = 1, size = 100) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  return useQuery(
    ["Providers", page, size],
    async () => {
      try {
        const response = await instance.get(BACKEND_URLS.providers + `?${page}&${per_page}`);
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

// Get product Info
export const useGetProviderInfo = (id) => {
  return useQuery(["Providers", id], async () => {
    const request = instance
      .get(BACKEND_URLS.providers + `/${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};

// Get product Info
export const useGetProviderServices = (id) => {
  return useQuery(
    ["provider-services", id],
    async () => {
      const request = instance
        .get(BACKEND_URLS.providers + `/${id}/product-aggregations`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      enabled: id !== "",
    },
  );
};

export const useUpdateProviderService = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ code, type, body }) => {
      try {
        const url = `${BACKEND_URLS.providers}/${id}/products/${code}/${type}/toggle`;
        const response = toast.promise(instance.put(url, body), {
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
        queryClient.invalidateQueries(["provider-services", id]);
      },
    },
  );
};

// Get product Info
export const useGetServiceProducts = (id, code, type) => {
  return useQuery(["provider-products", id, code, type], async () => {
    const request = instance
      .get(BACKEND_URLS.providers + `/${id}/products/${code}/${type}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};

export const useCreateProviders = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.providers, values), {
          success: (data) => data.message || "Provider added",
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
    },
  );
};

export const useSyncProviderProducts = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.providers + `/${id}/sync`, values), {
          success: (data) => data.message || "Products synced successful",
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
    },
  );
};

export const useUpdateProviders = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.providers + `/${id}`, values), {
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
    },
  );
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.product, values), {
          success: (data) => data.message || "Product added",
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
    },
  );
};

export const useUpdateProviderProduct = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.product + `/${id}`, values), {
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
        queryClient.invalidateQueries(["provider-services"]);
        queryClient.invalidateQueries(["provider-products"]);
      },
    },
  );
};

export const useDeleteProviderProduct = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.delete(BACKEND_URLS.product + `/${id}`), {
          success: "Product deleted.",
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
        queryClient.invalidateQueries(["provider-services"]);
        queryClient.invalidateQueries(["provider-products"]);
      },
    },
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
    },
  );
};

export const useToggleProvidersProducts = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put("/products" + `/${id}/status`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
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
        queryClient.invalidateQueries(["Providers"]);
        queryClient.invalidateQueries(["provider-services"]);
        queryClient.invalidateQueries(["provider-products"]);
      },
    },
  );
};

export const useDeleteProviders = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.delete(BACKEND_URLS.providers + `/${id}`), {
          success: "Provider deleted.",
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
    },
  );
};

export const useToggleProviderServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ providerId, serviceTypeId, data }) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.providers + `/${providerId}/service-types/${serviceTypeId}/toggle`, data)
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
        queryClient.invalidateQueries(["Providers"]);
      },
    },
  );
};

export const useToggleProviders = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.providers + `/${id}/status`, data)
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
        queryClient.invalidateQueries(["Providers"]);
      },
    },
  );
};

export const useGetRouteStatuses = (currentPage = 1, size = 100) => {
  const page = `page=${currentPage}`;
  const per_page = `per_page=${size}`;
  return useQuery(
    ["Routes-status", page, size],
    async () => {
      try {
        const response = await instance.get(BACKEND_URLS.route + "/statuses");
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
export const useGetServiceTypes = (currentPage = 1, size = 100) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  return useQuery(
    ["ServiceTypes", page, size],
    async () => {
      try {
        const response = await instance.get(BACKEND_URLS.service_types + `?${page}&${per_page}`);
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

export const useToggleServiceTypeStatus = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.service_types + `/${id}/status`, data)
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
        queryClient.invalidateQueries(["ServiceTypes"]);
      },
    },
  );
};

// + `?${page}&${per_page}`

// *****************************CASHBACK*************************//

export const useGetCashbacks = ({ currentPage, size, providerId, serviceId }) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  const providerIdTerm = providerId ? `&providerId=${providerId}` : "";
  const serviceIdTerm = serviceId ? `&serviceId=${serviceId}` : "";

  return useQuery(
    ["Cashbacks", currentPage, size, providerId, serviceId],
    async () => {
      try {
        const response = await instance.get(
          BACKEND_URLS.cashbacks + `?${page}&${per_page}${providerIdTerm}${serviceIdTerm}`,
        );
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
    },
  );
};

export const useCreateCashback = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.cashbacks, values), {
          success: (data) => data.message || "Rule Created Successfully",
          loading: "Please wait...",
          error: (error) => error?.response?.data?.message || "Failed to create rule.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["Cashbacks"]);
      },
    },
  );
};

export const useToggleCashback = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.cashbacks + `/${id}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
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
        queryClient.invalidateQueries(["Cashbacks"]);
      },
    },
  );
};

export const useUpdateCashback = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }) => {
      try {
        const response = toast.promise(instance.put(BACKEND_URLS.cashbacks + `/${id}`, values), {
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
        queryClient.invalidateQueries(["Cashbacks"]);
      },
    },
  );
};

export const useDeleteCashback = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => {
      try {
        const response = toast.promise(instance.delete(BACKEND_URLS.cashbacks + `/${id}`), {
          success: (data) => data.message || "Delete Successful",
          loading: "Please wait...",
          error: (error) => error?.response?.data?.message || "Failed to delete.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["Cashbacks"]);
      },
    },
  );
};

export const useBulkUpdateCashback = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.put(BACKEND_URLS.cashbacks + `/bulk-update`, values), {
          success: (data) => data.message || "Bulk update successful",
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
        queryClient.invalidateQueries(["Cashbacks"]);
      },
    },
  );
};

// *****************************API Discounts*************************//

export const useGetApiDiscounts = ({ currentPage, size, providerId, serviceId }) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  const providerIdTerm = providerId ? `&providerId=${providerId}` : "";
  const serviceIdTerm = serviceId ? `&serviceId=${serviceId}` : "";

  return useQuery(
    ["APIDiscounts", currentPage, size, providerId, serviceId],
    async () => {
      try {
        const response = await instance.get(
          BACKEND_URLS.apiDiscounts + `?${page}&${per_page}${providerIdTerm}${serviceIdTerm}`,
        );
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

export const useToggleApiDiscount = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .patch(BACKEND_URLS.apiDiscounts + `/${id}/toggle`, data)
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
        queryClient.invalidateQueries(["APIDiscounts"]);
      },
    },
  );
};

export const useUpdateApiDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(BACKEND_URLS.apiDiscounts, values), {
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
        queryClient.invalidateQueries(["APIDiscounts"]);
      },
    },
  );
};

export const useBulkUpdateApiDiscount = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.put(BACKEND_URLS.apiDiscounts + `/bulk-update`, values), {
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
        queryClient.invalidateQueries(["APIDiscounts"]);
      },
    },
  );
};
