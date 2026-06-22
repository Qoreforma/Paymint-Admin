import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { instance } from "./httpConfig";

export const useGetWithdrawals = (page, limit, search) => {
  const searchTerm = search ? `&search=${search}` : "";
  return useQuery(
    ["getWithdrawals", page, limit, searchTerm],
    async () => {
      const request = instance
        .get(`/withdrawals?page=${page}&limit=${limit}${searchTerm}`)
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

export const useUpdateWithdrawalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put("/withdrawals", data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: (data) => (data.state === "approved" ? "Transaction approved" : "Transaction declined"),
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
      onSuccess: () => {
        queryClient.invalidateQueries(["getWithdrawals"]);
      },
    }
  );
};
