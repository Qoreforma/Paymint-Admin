import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

//getallbrands
export const useGetAllBrands = (page, limit, search) => {
  const searchTerm = search ? `&search=${search}` : "";

  return useQuery(
    ["getAllBrands", page, limit, searchTerm],
    async () => {
      const request = instance
        .get(BACKEND_URLS.catalog.brands + `?page=${page}&limit=${limit}${searchTerm}`)
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
export const useCreateBrands = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.catalog.brands, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Brand Created",
          loading: "Adding brand...",
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
        queryClient.invalidateQueries(["getAllBrands"]);
      },
    }
  );
};

//update brands
export const useUpdateBrands = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.catalog.brands, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Brand updated",
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
        queryClient.invalidateQueries(["getAllBrands"]);
      },
    }
  );
};

//delete brands
export const useDeleteBrands = (brandId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.catalog.brands}?brandId=${brandId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Brand Deleted`,
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
        queryClient.invalidateQueries(["getAllBrands"]);
      },
    }
  );
};
