import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";
import { useSetRecoilState } from "recoil";
import { storeDetailState } from "../../atoms/storeDetailState";

export const useGetAllStores = (page, limit, search) => {
  const searchTerm = search ? `&search=${search}` : "";
  return useQuery(["getAllStores", page, limit, searchTerm], async () => {
    const request = instance
      .get(`/store?page=${page}&limit=${limit}${searchTerm}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};

export const useGetSingleStore = (id) => {
  return useQuery(["getSingleStore", id], async () => {
    const request = instance
      .get(`/store?store=${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};

// export const useBlockStore = () => {
//   const queryClient = useQueryClient();

//   return useMutation(
//     (data) =>
//       toast.promise(
//         instance
//           .patch(BACKEND_URLS.stores, data)
//           .then((res) => res.data)
//           .catch((err) => {
//             throw err;
//           }),
//         {
//           success: (data) => console.log(data),
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
//         console.log(data);
//         // queryClient.setQueryData(["getAllProducts"], data);
//         // toast.success("Product approved");
//         queryClient.invalidateQueries(["getAllStores"]);
//         queryClient.invalidateQueries(["getSingleStore", id]);
//       },
//     }
//   );
// };

export const useVerifyStore = (id) => {
  const queryClient = useQueryClient();
  const setStoreDetails = useSetRecoilState(storeDetailState);

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.stores, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: (data) =>
            data.adminAction === "approved"
              ? "Store Approved"
              : data.adminAction === "disapproved"
              ? "Store Disapproved"
              : "Store Block",
          // success: `Store status updated.`,
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
        setStoreDetails(data);
        // console.log(data);
        // queryClient.setQueryData(["getAllProducts"], data);
        // toast.success("Product approved");
        queryClient.invalidateQueries(["getAllStores"]);
        queryClient.invalidateQueries(["getSingleStore", id]);
      },
    }
  );
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(BACKEND_URLS.stores)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Store deleted",
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
        queryClient.invalidateQueries(["getAllStores"]);
      },
    }
  );
};
