import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

// ─── helpers ────────────────────────────────────────────────────────────────
const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "all") qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : "";
};

// ─── GET: All Products (admin management list with full filters) ──────────
export const useGetAllProducts = (page = 1, limit = 20, filters = {}) => {
  const query = buildQuery({ page, limit, ...filters });
  return useQuery(
    ["getAllProducts", page, limit, filters],
    async () => {
      const res = await instance.get(`${BACKEND_URLS.product}${query}`);
      return res?.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
      keepPreviousData: true,
    }
  );
};

// ─── GET: Single product detail ──────────────────────────────────────────
export const useGetProductInfo = (id) => {
  return useQuery(
    ["getProduct", id],
    async () => {
      const res = await instance.get(`${BACKEND_URLS.product}/${id}`);
      return res?.data;
    },
    {
      enabled: !!id,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};

// ─── POST: Create product ────────────────────────────────────────────────
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.product, data)
          .then((res) => res.data)
          .catch((err) => { throw err; }),
        {
          success: "Product created successfully",
          loading: "Creating product...",
          error: (err) => err?.response?.data?.message || "Error creating product",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllProducts"]);
      },
    }
  );
};

// ─── POST: Update product ────────────────────────────────────────────────
export const useUpdateProduct = (id) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`${BACKEND_URLS.product}/${id}`, data)
          .then((res) => res.data)
          .catch((err) => { throw err; }),
        {
          success: "Product updated successfully",
          loading: "Updating product...",
          error: (err) => err?.response?.data?.message || "Error updating product",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllProducts"]);
        queryClient.invalidateQueries(["getProduct", id]);
        queryClient.invalidateQueries(["provider-products"]);
      },
    }
  );
};

// ─── PUT: Toggle product active status ──────────────────────────────────
export const useToggleProductStatus = (id) => {
  const queryClient = useQueryClient();
  return useMutation(
    (isActive) =>
      instance
        .put(`${BACKEND_URLS.product}/${id}/status`, { isActive })
        .then((res) => res.data)
        .catch((err) => { throw err; }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllProducts"]);
        queryClient.invalidateQueries(["getProduct", id]);
        queryClient.invalidateQueries(["provider-products"]);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to update status");
      },
    }
  );
};

// ─── PUT: Toggle hot product status ─────────────────────────────────────
export const useToggleProductHot = (id) => {
  const queryClient = useQueryClient();
  return useMutation(
    (isHot) =>
      instance
        .put(`${BACKEND_URLS.product}/${id}/hot`, { isHot })
        .then((res) => res.data)
        .catch((err) => { throw err; }),
    {
      onSuccess: (data) => {
        const msg = data?.message || (data?.data?.isHot ? "Marked as hot 🔥" : "Removed from hot");
        toast.success(msg);
        queryClient.invalidateQueries(["getAllProducts"]);
        queryClient.invalidateQueries(["getProduct", id]);
        queryClient.invalidateQueries(["provider-products"]);
        queryClient.invalidateQueries(["Providers"]);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to update hot status");
      },
    }
  );
};

// ─── DELETE: Delete product ──────────────────────────────────────────────
export const useDeleteProduct = (id) => {
  const queryClient = useQueryClient();
  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.product}/${id}`)
          .then((res) => res.data)
          .catch((err) => { throw err; }),
        {
          success: "Product deleted",
          loading: "Deleting...",
          error: (err) => err?.response?.data?.message || "Error deleting product",
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllProducts"]);
        queryClient.invalidateQueries(["provider-products"]);
      },
    }
  );
};

// ─── Legacy / Compat aliases (kept so existing pages don't break) ────────
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .patch(BACKEND_URLS.product, data)
          .then((res) => res.data)
          .catch((err) => { throw err; }),
        {
          success: (data) => `Product ${data.adminAction}`,
          loading: "Please wait...",
          error: "Something happened",
        }
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["getAllProducts"]);
        queryClient.invalidateQueries(["getProduct", data._id]);
      },
    }
  );
};

export const useGetStoreProducts = (id) => {
  return useQuery(
    ["getStoreProduct", id],
    async () => {
      const res = await instance.get(`${BACKEND_URLS.product}?storeId=${id}`);
      return res?.data;
    },
    { initialData: [] }
  );
};

export const useGetProductReviews = (id) => {
  return useQuery(
    ["getProductsReviews", id],
    async () => {
      const res = await instance.get(`/review?productId=${id}`);
      return res?.data;
    },
    { retry: 1, refetchOnWindowFocus: false, retryDelay: 3000 }
  );
};

export const useReplyReview = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      instance
        .put("/review", data)
        .then((res) => res.data)
        .catch((err) => { throw err; }),
    {
      onSuccess: (data) => {
        toast.success("Message sent");
        queryClient.invalidateQueries(["getProductsReviews", data._id]);
      },
    }
  );
};

export const useDeleteReview = (reviewId, productId) => {
  const queryClient = useQueryClient();
  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`/review?reviewId=${reviewId}`)
          .then((res) => res.data)
          .catch((err) => { throw err; }),
        { success: "Review Deleted", loading: "Please wait...", error: "Something happened" }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getProductsReviews", productId]);
      },
    }
  );
};

export { useGetProductTypes, useGetProductDataTypes } from "../generics";

