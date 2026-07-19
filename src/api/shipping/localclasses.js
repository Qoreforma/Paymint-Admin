import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

export const useCreateLocalClass = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.shipping.localClass, data)
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
        queryClient.invalidateQueries(["getLocalClasses"]);
      },
    }
  );
};

export const useGetAllLocalClass = (page, limit) => {
  // const searchText = search ? `&search=${search}` : "";
  // const productTypeFilter = type ? `&type=${type}` : "";
  return useQuery(
    ["getLocalClasses", page, limit],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.localClass + `?page=${page}&limit=${limit}`)
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

export const useGetLocalZoneOptions = () => {
  return useQuery(
    ["getLocalZoneOptions"],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.localZones)
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

export const useEditLocalClass = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.shipping.localClass, data)
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
        queryClient.invalidateQueries(["getLocalClasses"]);
      },
    }
  );
};

//delete weights
export const useDeleteLocalClass = (classId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.shipping.localClass}?classId=${classId}`)
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
        queryClient.invalidateQueries(["getLocalClasses"]);
      },
    }
  );
};
