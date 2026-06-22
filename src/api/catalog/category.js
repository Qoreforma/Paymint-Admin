import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

//getallcategories

export const useGetCategories = () => {
  return useQuery(
    ["getAllCategories"],
    async () => {
      const request = instance
        .get(BACKEND_URLS.catalog.categories)
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

export const useGetAllCategories = (page, limit, search) => {
  const searchTerm = search ? `&search=${search}` : "";
  return useQuery(
    ["getAllCategories", page, limit, searchTerm],
    async () => {
      const request = instance
        .get(BACKEND_URLS.catalog.categories + `?page=${page}&limit=${limit}${searchTerm}`)
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
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.catalog.categories, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Category Created",
          loading: "Adding category...",
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
        queryClient.invalidateQueries(["getAllCategories"]);
      },
    }
  );
};

//update brands
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.catalog.categories, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Category updated",
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
        queryClient.invalidateQueries(["getAllCategories"]);
        // queryClient.invalidateQueries(["getProduct", id]);
      },
    }
  );
};

//delete brands
export const useDeleteCategory = (categoryId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.catalog.categories}?categoryId=${categoryId}`)
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
        queryClient.invalidateQueries(["getAllCategories"]);
      },
    }
  );
};
