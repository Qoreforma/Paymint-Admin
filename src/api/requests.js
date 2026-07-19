import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { instance } from "./httpConfig";
import BACKEND_URLS from "./urls";

export const useGetDepositRequest = (page = 1, limit = 100, status, search) => {
  const statusTerm = status ? `&status=${status}` : "";
  const searchTerm = search ? `&search=${search}` : "";

  return useQuery(
    ["getDepositRequest", page, limit, status, search],
    async () => {
      const request = await instance
        .get(`/manual-deposits?page=${page}&limit=${limit}${statusTerm}${searchTerm}`)
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
    },
  );
};

export const useUpdateDepositRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ transactionID, action }) =>
      toast.promise(
        instance
          .post(`/manual-deposits/${transactionID}/${action}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getDepositRequest"]);
      },
    },
  );
};

export const useUpdateDepositRequestStatus = (transactionID, status) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`/manual-deposits/${transactionID}/action/${status}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getDepositRequest"]);
      },
    },
  );
};

export const useUpdateDepositAmount = (transactionID) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`/manual-deposits/${transactionID}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getDepositRequest"]);
      },
    },
  );
};

export const useGetWithdrawalRequest = (page, limit, status, search) => {
  const statusTerm = status ? `&status=${status}` : "";
  const searchTerm = search ? `&search=${search}` : "";

  return useQuery(
    ["getDepositRequest", page, limit, search, status],
    async () => {
      const request = await instance
        .get(`/manual-withdrawals?page=${page}&limit=${limit}${statusTerm}${searchTerm}`)
        .then((res) => res?.data?.data)
        .catch((err) => {
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useUpdateWithdrawalRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ transactionID, action }) =>
      toast.promise(
        instance
          .post(`/manual-withdrawals/${transactionID}/${action}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getDepositRequest"]);
      },
    },
  );
};

export const useUpdateWithdrawalRequestStatus = (transactionID, status) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`/manual-withdrawals/${transactionID}/action/${status}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getDepositRequest"]);
      },
    },
  );
};
// Get Other Transactions
export const useGetAllTransactions = (page, limit, purpose = "", status, search, userId) => {
  // console.log(storeId);
  const purposeTerm = purpose ? `&filter[purpose]=${purpose}` : "";
  const statusTerm = status ? `&filter[status]=${status}` : "";
  const searchTerm = search ? `&filter[reference]=${search}` : "";
  const userTerm = userId ? `&filter[user_id]=${userId}` : "";

  return useQuery(
    ["getAllTransaction", page, limit, purpose, status, search, userId],
    async () => {
      const request = await instance
        .get(
          BACKEND_URLS.transaction +
            `?page=${page}&per_page=${limit}${purposeTerm}${statusTerm}${searchTerm}${userTerm}&include=wallet.user`,
        )
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
    },
  );
};

export const useInitiateWithdrawalRequest = (transactionID, provider) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`/manual-withdrawals/${transactionID}/transfer/${provider}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err?.response?.data;
          }),
        {
          success: (data) => data?.message,
          loading: "Please wait...",
          error: (error) => error?.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getDepositRequest"]);
      },
    },
  );
};

export const useAuthorizeWithdrawalRequest = (transactionID, provider) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`/manual-withdrawals/${transactionID}/transfer/monnify/authorize`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getDepositRequest"]);
      },
    },
  );
};
