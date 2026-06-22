import BACKEND_URLS from "./urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import { toast } from "react-hot-toast";

export const useGetGiftcardCategories = (page, limit) => {
  return useQuery(
    ["getGiftcardCategories", page, limit],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.giftcard_categories + `?page=${page}&limit=${limit}`)
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

export const useGetSingleGiftcardCategory = (categoryId) => {
  return useQuery(
    ["getSingleCategories", categoryId],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.giftcard_categories + `/${categoryId}`)
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
      enabled: categoryId ? true : false,
    },
  );
};

export const useCreateGiftcardCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.giftcard_categories, data)
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
        queryClient.invalidateQueries(["getGiftcardCategories"]);
      },
    },
  );
};

export const useEditGiftcardCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.giftcard_categories + `/${id}`, data)
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
        queryClient.invalidateQueries(["getGiftcardCategories"]);
      },
    },
  );
};

export const useToggleSaleCategory = (editedId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.giftcard_categories + `/${editedId}/status/sale-activation`, data)
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
        queryClient.invalidateQueries(["getGiftcardCategories"]);
      },
    },
  );
};

export const useTogglePurchaseCategory = (editedId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.giftcard_categories + `/${editedId}/status/purchase-activation`, data)
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
        queryClient.invalidateQueries(["getGiftcardCategories"]);
      },
    },
  );
};

export const useToggleDeleteCategory = (editedId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .delete(BACKEND_URLS.giftcard_categories + `/${editedId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => "Category Deleted",
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
        queryClient.invalidateQueries(["getGiftcardCategories"]);
      },
    },
  );
};

export const useGetGiftcardProducts = (page, limit, search, status) => {
  const searchTerm = search ? `&search=${search}` : "";
  const statusTerm = status ? `&status=${search}` : "";

  return useQuery(
    ["getGiftcardProducts", page, limit, search, status],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.giftcard_product + `?page=${page}&limit=${limit}${searchTerm}${statusTerm}`)
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

export const useGetGiftcardProductsByCategory = (giftcardId, page, limit, search, status) => {
  const searchTerm = search ? `&search=${search}` : "";
  const statusTerm = status ? `&status=${status}` : "";

  return useQuery(
    ["getGiftcardProductsByCategory", giftcardId, page, limit, search, status],
    async () => {
      const request = await instance
        .get(
          BACKEND_URLS.giftcard_categories +
            `/${giftcardId}/products?page=${page}&limit=${limit}${searchTerm}${statusTerm}`,
        )
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

export const useCreateGiftcardProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.giftcard_product, data)
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
        queryClient.invalidateQueries(["getGiftcardProducts"]);
      },
    },
  );
};
export const useEditGiftcardProduct = (categoryId) => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ editedId, data }) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.giftcard_product + `/${editedId}`, data)
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
        queryClient.invalidateQueries(["getGiftcardProducts"]);
        queryClient.invalidateQueries(["getGiftcardProductsByCategory", categoryId]);
      },
    },
  );
};

export const useToggleActivate = (editedId, categoryId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.giftcard_product + `/${editedId}/status`, data)
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
        queryClient.invalidateQueries(["getGiftcardProducts"]);
        queryClient.invalidateQueries(["getGiftcardProductsByCategory", categoryId]);
      },
    },
  );
};

export const useToggleDeleteProduct = (editedId, categoryId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(BACKEND_URLS.giftcard_product + `/${editedId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: () => "Giftcart Product Deleted",
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
        queryClient.invalidateQueries(["getGiftcardProducts"]);
        queryClient.invalidateQueries(["getGiftcardProductsByCategory", categoryId]);
      },
    },
  );
};

export const useBulkUpdateGiftcardProduct = (categoryId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.giftcard_product + `/bulk/sale-rate`, data)
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
        queryClient.invalidateQueries(["getGiftcardProducts"]);
        queryClient.invalidateQueries(["getGiftcardProductsByCategory", categoryId]);
      },
    },
  );
};

export const getCategoriesDetails = async (categoryId) => {
  const request = await instance
    .get(BACKEND_URLS.giftcard_categories + `/${categoryId}?include=countries,admins`)
    .then((res) => res?.data?.data)
    .catch((err) => {
      throw err;
    });
  return request;
};

export const useGetCategoryDetails = (categoryId) => {
  return useQuery(
    ["getCategoryDetails", categoryId],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.giftcard_categories + `/${categoryId}`)
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
      enabled: categoryId ? true : false,
    },
  );
};

export const useGetCategoryAdmin = (categoryId) => {
  return useQuery(
    ["getCategoryAdmin", categoryId],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.giftcard_categories + `/${categoryId}/admins`)
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
      enabled: categoryId ? true : false,
    },
  );
};

export const useToggleAdminPermission = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ data, categoryId, adminId }) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.giftcard_categories + `/${categoryId}/admins/${adminId}`, data)
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
        const { categoryId } = variables;

        queryClient.invalidateQueries(["getCategoryAdmin", categoryId]);
      },
    },
  );
};

export const useBulkToggleSellPermission = (categoryId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.giftcard_categories + `/${categoryId}/admins/bulk`, data)
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
        queryClient.invalidateQueries(["getCategoryAdmin", categoryId]);
      },
    },
  );
};
