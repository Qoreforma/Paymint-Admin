import BACKEND_URLS from "./urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import { toast } from "react-hot-toast";
import axios from "axios";

export const useGetCryptoNetworks = (page, limit, search, providerId) => {
  const searchTerm = search ? `&search=${search}` : "";
  const providerTerm = providerId ? `&providerId=${providerId}` : "";

  return useQuery(
    ["getCryptoNetworks", page, limit, search, providerId],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.crypto_network + `?page=${page}&limit=${limit}${searchTerm}${providerTerm}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useViewCryptoNetworks = (id, page, limit, search, status) => {
  const searchTerm = search ? `&search=${search}` : "";
  const statusTerm = status ? `&status=${status}` : "";

  return useQuery(
    ["getCryptoNetwork", id, page, limit, search, status],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.crypto_network + `/${id}/overview` + `?page=${page}&limit=${limit}${searchTerm}${statusTerm}`)
        .then((res) => res?.data?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useCreateCryptoNetwork = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.crypto_network, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoNetworks"]);
      },
    },
  );
};

export const useEditCryptoNetwork = (editedId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_network + `/${editedId}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoNetworks"]);
      },
    },
  );
};

export const useToggleAdminPermission = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ data, networkId, adminId }) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_network + `/${networkId}/admins/${adminId}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: (data, variables) => {
        const { networkId } = variables;
        console.log({ networkId });

        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
        queryClient.invalidateQueries(["getCryptoNetworks"]);
      },
    },
  );
};

export const useBulkToggleSellPermission = (networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/networks/${networkId}/admins/bulk/sell`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useBulkToggleBuyPermission = (networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/networks/${networkId}/admins/bulk/buy`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useDeleteCryptoNetwork = (editedId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .delete(BACKEND_URLS.crypto_network + `/${editedId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => "Crypto Network Deleted",
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoNetworks"]);
      },
    },
  );
};

export const useGetCryptoAssets = (page, limit, search, providerId) => {
  // console.log(storeId);
  const searchTerm = search ? `&search=${search}` : "";
  const providerTerm = providerId ? `&providerId=${providerId}` : "";

  return useQuery(
    ["getCryptoAssets", page, limit, search, providerId],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.crypto_assets + `?page=${page}&limit=${limit}${searchTerm}${providerTerm}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useCreateCryptoAssets = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.crypto_assets, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
      },
    },
  );
};

export const useEditCryptoAsset = (editedId, networkId) => {
  const queryClient = useQueryClient();
  // console.log(editedId);

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/${editedId}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useDeleteCryptoAssets = (editedId, networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .delete(BACKEND_URLS.crypto_assets + `/${editedId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response;
          }),
        {
          success: (data) => "Crypto Network Deleted",
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useToggleSaleActivation = (editedId, networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/${editedId}/sale-activated`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useTogglePurchaseActivation = (editedId, networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/${editedId}/purchase-activated`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useBulkUpdateSellRates = (networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/bulk/sell-rate`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useBulkUpdateBuyRates = (networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/bulk/buy-rate`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useBulkUpdateSaleActivation = (networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/bulk/sale-activation`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useBulkUpdatePurchaseActivation = (networkId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto_assets + `/bulk/purchase-activation`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoAssets"]);
        queryClient.invalidateQueries(["getCryptoNetwork", networkId]);
      },
    },
  );
};

export const useGetAutoCryptoProvs = () => {
  return useQuery(
    ["getAutoCryptoProvs"],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.crypto_assets + `/get-provider`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useGetCryptoCurrencies = (page, limit, search) => {
  const searchTerm = search ? `&filter[code]=${search}` : "";

  return useQuery(
    ["getCryptoCurrencies", page, limit, search],
    async () => {
      const request = await instance
        .get("https://test.ksbtech.com.ng/api/currencies" + `?do_not_paginate=1${searchTerm}`)
        .then((res) => res?.data?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useUpdateCryptoCurrencies = (editedId) => {
  const queryClient = useQueryClient();
  // console.log(editedId);

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`/currencies/${editedId}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCryptoCurrencies"]);
      },
    },
  );
};

export const useGetCountries = (page, limit, giftcard_activated, registration_activated, search) => {
  const giftcardTerm = giftcard_activated
    ? `&filter[giftcard_activated]=${giftcard_activated === "active" ? "1" : "0"}`
    : "";
  const registrationTerm = registration_activated
    ? `&filter[registration_activated]=${registration_activated === "active" ? "1" : "0"}`
    : "";
  const searchTerm = search ? `&filter[name]=${search}` : "";

  return useQuery(
    ["getCountries", page, limit, giftcard_activated, registration_activated, search],
    async () => {
      const request = await instance
        .get("/countries" + `?page=${page}&per_page=${limit}${giftcardTerm}${registrationTerm}${searchTerm}`)
        .then((res) => res?.data?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useToggleCountryRegistration = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .patch(`countries/${id}/registration`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data?.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCountries"]);
      },
    },
  );
};

export const useToggleCountryGiftcard = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .patch(`countries/${id}/giftcard`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data?.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getCountries"]);
      },
    },
  );
};

export const useGetCurrencies = () => {
  return useQuery(
    ["getCurrency"],
    async () => {
      const request = await axios
        .get("https://prod-api.ksbtech.com.ng/api/currencies?do_not_paginate=1")
        .then((res) => res?.data?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useGetSystemData = () => {
  return useQuery(
    ["getSystemData"],
    async () => {
      const request = await instance
        .get("/system-data")
        .then((res) => res?.data?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useUpdateSystemData = (editedId) => {
  const queryClient = useQueryClient();
  // console.log(editedId);

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`/system-data/${editedId}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getSystemData"]);
      },
    },
  );
};
