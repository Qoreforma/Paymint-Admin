import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

//getallbrands
export const useGetAllSubcategories = (page, limit, search) => {
  const searchTerm = search ? `&search=${search}` : "";

  return useQuery(
    ["getAllSubcategories", page, limit, searchTerm],
    async () => {
      const request = instance
        .get(BACKEND_URLS.catalog.subcategories + `?page=${page}&limit=${limit}${searchTerm}`)
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
export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.catalog.subcategories, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Subcategory Created",
          loading: "Adding Subcategory...",
          error: "Failed to create subcategory",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllSubcategories"]);
      },
    }
  );
};

//update brands
export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.catalog.subcategories, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Subcategory updated",
          loading: "Please wait...",
          error: "Failed to update subcategory",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllSubcategories"]);
        // queryClient.invalidateQueries(["getProduct", id]);
      },
    }
  );
};

//delete brands
export const useDeleteSubcategory = (subcategoryId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.catalog.subcategories}?subCategoryId=${subcategoryId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Subcategory Deleted`,
          loading: "Please wait...",
          error: "Failed to delete subcategory",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["getAllSubcategories"]);
      },
    }
  );
};
