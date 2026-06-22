import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (values) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.coupons, values)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: `Coupon created`,
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
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllCoupons"]);
      },
    }
  );
};

export const useGetAllCoupons = (page, limit, search) => {
  const searchTerm = search ? `&search=${search}` : "";
  return useQuery(
    ["getAllCoupons", page, limit, searchTerm],
    async () => {
      const request = instance
        .get(BACKEND_URLS.coupons + `?page=${page}&limit=${limit}${searchTerm}`)
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

export const useUpdateCoupons = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.coupons, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "coupon updated",
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
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllCoupons"]);
        // queryClient.invalidateQueries(["getProduct", id]);
      },
    }
  );
};

export const useDeleteCoupon = (couponId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.coupons}?couponId=${couponId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Coupon Deleted`,
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
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllCoupons"]);
      },
    }
  );
};
