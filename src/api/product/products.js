import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

export const useGetAllProducts = (page, limit, search, type) => {
  const searchText = search ? `&search=${search}` : "";
  const productTypeFilter = type ? `&type=${type}` : "";
  return useQuery(
    ["getAllProducts", page, limit, searchText, productTypeFilter],
    async () => {
      const request = instance
        .get(BACKEND_URLS.product.all + `?page=${page}&limit=${limit}${searchText}${productTypeFilter}`)
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
    }
  );
};
// Get product Info
export const useGetProductInfo = (id) => {
  return useQuery(["getProduct", id], async () => {
    const request = instance
      .get(BACKEND_URLS.product.all + `?productId=${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};

//DELETE PRODUCT
// Get product Info
export const useDeleteProduct = (productId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.baseURL}/products?productId=${productId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Product Deleted`,
          loading: "Please wait...",
          error: "Error: Please Try again.",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["getAllProducts"]);
      },
    }
  );
};

// Get Store Products
export const useGetStoreProducts = (id) => {
  return useQuery(
    ["getStoreProduct", id],
    async () => {
      const request = instance
        .get(BACKEND_URLS.product.all + `?storeId=${id}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      initialData: [],
    }
  );
};

// update productStatus

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .patch(BACKEND_URLS.product.all, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: (data) => `Product ${data.adminAction}`,
          loading: "Please wait...",
          error: "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: (data) => {
        const id = data._id;
        // console.log(data);
        // queryClient.setQueryData(["getAllProducts"], data);
        // toast.success("Product approved");
        queryClient.invalidateQueries(["getAllProducts"]);
        queryClient.invalidateQueries(["getProduct", id]);
      },
    }
  );
};

//get product reviews
export const useGetProductReviews = (id) => {
  return useQuery(
    ["getProductsReviews", id],
    async () => {
      const request = await instance
        .get(`${BACKEND_URLS.product.productReview}?productId=${id}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err?.response?.data;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

//admin reply comment
export const useReplyReview = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      instance
        .put(BACKEND_URLS.product.productReview, data)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        }),
    {
      onSuccess: (data) => {
        // console.log(data);
        const id = data._id;
        toast.success("message sent");
        queryClient.invalidateQueries(["getProductsReviews", id]);
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
          .delete(`${BACKEND_URLS.product.productReview}?reviewId=${reviewId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Review Deleted`,
          loading: "Please wait...",
          error: "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["getProductsReviews", productId]);
      },
    }
  );
};

//get product reviews
export const useGetProductTypes = () => {
  return useQuery(
    ["getProductTypes"],
    async () => {
      const request = await instance
        .get(`/products-count`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err?.response?.data;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};
