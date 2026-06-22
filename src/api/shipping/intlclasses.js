import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

export const useCreateIntlClass = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.shipping.intlClass, data)
          .then((res) => res?.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Shiping Class Created",
          loading: "Adding class...",
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
        queryClient.invalidateQueries(["getIntlClasses"]);
      },
    }
  );
};

export const useGetAllIntlClass = (page, limit) => {
  // const searchText = search ? `&search=${search}` : "";
  // const productTypeFilter = type ? `&type=${type}` : "";
  return useQuery(
    ["getIntlClasses", page, limit],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.intlClass + `?page=${page}&limit=${limit}`)
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

export const useEditIntlClass = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.shipping.intlClass, data)
          .then((res) => res?.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Class Updated",
          loading: "Updating zone...",
          error: "Class update failed",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getIntlClasses"]);
      },
    }
  );
};

//delete weights
export const useDeleteIntlClass = (classId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.shipping.intlClass}?classId=${classId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Class Deleted`,
          loading: "Please wait...",
          error: "Failed to delete.",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getIntlClasses"]);
      },
    }
  );
};
