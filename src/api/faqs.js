import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import toast from "react-hot-toast";

export const useGetFaqs = (currentPage = 1, size = 100, search, category) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  const searchFilter = search ? `&search=${search}` : "";
  const categoryFilter = category ? `&categoryId=${category}` : "";

  return useQuery(
    ["faqs", page, size, search, category],
    async () => {
      try {
        const response = await instance.get(`/faqs?${page}&${per_page}${searchFilter}${categoryFilter}`);
        return response.data;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      // initialData: [],
      retry: 1,
      retryDelay: 3000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 5000,
    }
  );
};

export const useGetFaqCategories = (currentPage = 1, size = 100) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  return useQuery(
    ["faq-categories", page, size],
    async () => {
      try {
        const response = await instance.get(`/faqs/categories?${page}&${per_page}`);
        return response.data;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      retry: 1,
      retryDelay: 3000,
      refetchOnWindowFocus: false,
    }
  );
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(`/faqs`, values), {
          success: "Faq created",
          loading: "Please wait...",
          error: "Failed: An error occured.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faqs"]);
      },
    }
  );
};

export const useCreateFaqCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post("/faqs/categories", values), {
          success: "Faq category created",
          loading: "Please wait...",
          error: "Failed: An error occured.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faq-categories"]);
      },
    }
  );
};

export const useUpdateFaq = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(`/faqs/${id}`, values), {
          success: (data) => data.message || "Update Successful",
          loading: "Please wait...",
          error: "Something happened.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faqs"]);
      },
    }
  );
};

export const useUpdateFaqCategory = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => {
      try {
        const response = toast.promise(instance.post(`/faqs/categories/${id}`, values), {
          success: "Update successful",
          loading: "Please wait...",
          error: "Something happened.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faq-categories"]);
      },
    }
  );
};

export const useDeleteFaq = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.delete(`/faqs/${id}`), {
          success: "Faq deleted.",
          loading: "Please wait...",
          error: "Failed: an error occured.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faqs"]);
      },
    }
  );
};

export const useDeleteFaqCategory = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      try {
        const response = toast.promise(instance.delete(`/faqs/categories/${id}`), {
          success: "Faq category deleted.",
          loading: "Please wait...",
          error: "Failed: an error occured.",
        });
        return response;
      } catch (error) {
        console.error(error);
        Promise.reject(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faq-categories"]);
      },
    }
  );
};

export const useToggleFaqCategory = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`/faqs/categories/${id}/status`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error?.message || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faq-categories"]);
      },
    }
  );
};
