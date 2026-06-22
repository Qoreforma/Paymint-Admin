import BACKEND_URLS from "./urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import { toast } from "react-hot-toast";

//getallbrands
export const useGetAllOrders = (page, limit) => {
  // console.log(storeId);
  return useQuery(
    ["getAllOrders", page, limit],
    async () => {
      const request = await instance
        .get(`/orders?page=${page}&limit=${limit}`)
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
export const useGetStoreOrders = (storeId = "", page, limit) => {
  return useQuery(
    ["getAllOrders", storeId, page, limit],
    async () => {
      const request = instance
        .get(BACKEND_URLS.orders + `?storeId=${storeId}&page=${page}&limit=${limit}`)
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

//create brands
// export const useCreateBrands = () => {
//   const queryClient = useQueryClient();

//   return useMutation(
//     (data) =>
//       toast.promise(
//         instance
//           .post(BACKEND_URLS.catalog.brands, data)
//           .then((res) => res.data)
//           .catch((err) => {
//             throw err;
//           }),
//         {
//           success: "Brand Created",
//           loading: "Adding brand...",
//           error: "Something happened",
//         },
//         {
//           style: {
//             minWidth: "180px",
//           },
//         }
//       ),
//     {
//       onSuccess: (data) => {
//         const id = data._id;
//         queryClient.invalidateQueries(["getAllBrands"]);
//         // queryClient.invalidateQueries(["getProduct", id]);
//       },
//     }
//   );
// };

// Get order Info
export const useGetOrderInfo = (id, execute) => {
  return useQuery(
    ["getOrders", id],
    async () => {
      const request = instance
        .get(BACKEND_URLS.orders + `?orderId=${id}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      enabled: execute,
    }
  );
};

//update brands
export const useUpdateOrders = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.orders, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Order updated",
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
        queryClient.invalidateQueries(["getAllOrders"]);
      },
    }
  );
};

//GENERAL ORDERS

export const useGetAllGeneralOrder = (page, limit) => {
  return useQuery(
    ["getAllGeneralOrders", page, limit],
    async () => {
      const request = instance
        .get(BACKEND_URLS.generalOrders + `?page=${page}&limit=${limit}`)
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

// Get order Info
export const useGetGeneralOrderInfo = (id, execute) => {
  return useQuery(
    ["getGeneralOrders", id],
    async () => {
      const request = instance
        .get(BACKEND_URLS.generalOrders + `?orderSummaryId=${id}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      enabled: execute,
    }
  );
};

//delete brands
// export const useDeleteBrands = (brandId) => {
//   const queryClient = useQueryClient();

//   return useMutation(
//     () =>
//       toast.promise(
//         instance
//           .delete(`${BACKEND_URLS.catalog.brands}?brandId=${brandId}`)
//           .then((res) => res.data)
//           .catch((err) => {
//             throw err;
//           }),
//         {
//           success: `Brand Deleted`,
//           loading: "Please wait...",
//           error: "Something happened",
//         },
//         {
//           style: {
//             minWidth: "180px",
//           },
//         }
//       ),
//     {
//       onSuccess: (data) => {
//         queryClient.invalidateQueries(["getAllBrands"]);
//       },
//     }
//   );
// };
