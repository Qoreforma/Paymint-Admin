import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

//getallbrands
export const useGetAllColors = (page, limit, search) => {
  const searchTerm = search ? `&search=${search}` : "";

  return useQuery(
    ["getAllColors", page, limit, searchTerm],
    async () => {
      const request = instance
        .get(BACKEND_URLS.catalog.colors + `?page=${page}&limit=${limit}${searchTerm}`)
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
export const useCreateColor = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.catalog.colors, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Color Created",
          loading: "Adding color...",
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
        queryClient.invalidateQueries(["getAllColors"]);
      },
    }
  );
};

//update brands
export const useUpdateColor = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.catalog.colors, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Color updated",
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
        queryClient.invalidateQueries(["getAllColors"]);
      },
    }
  );
};

//delete brands
export const useDeleteColor = (colorId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.catalog.colors}?colorId=${colorId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Color Deleted`,
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
        queryClient.invalidateQueries(["getAllColors"]);
      },
    }
  );
};
