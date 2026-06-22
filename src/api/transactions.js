import BACKEND_URLS from "./urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import { toast } from "react-hot-toast";

export const useGetWalletTransactions = (page, limit, status, search, startDate, endDate, userId, txnType) => {
  const statusTerm = status ? `&status=${status}` : "";
  const searchTerm = search ? `&search=${search}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";
  const userIdTerm = userId ? `&userId=${userId}` : "";
  const txnTypeTerm = txnType ? `/${txnType}` : "";

  return useQuery(
    ["getWalletTransactions", page, limit, status, search, startDate, endDate, userId],
    async () => {
      const request = await instance
        .get(
          BACKEND_URLS.wallet +
            `${txnTypeTerm}?page=${page}&limit=${limit}${statusTerm}${searchTerm}${startDateTerm}${endDateTerm}${userIdTerm}`,
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

export const useGetWalletTransactionsOverview = () => {
  return useQuery(
    ["getWalletTransactionsOverview"],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.wallet + `/overview`)
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

export const useGetWithdrawalTransactions = (page, limit, status, search, type, userId) => {
  // console.log(storeId);
  const statusTerm = status ? `&filter[status]=${status}` : "";
  const searchTerm = search ? `&filter[reference]=${search}` : "";
  const typeTerm = type ? `&filter[purpose]=${type}` : "";
  const userTerm = userId ? `&filter[user_id]=${userId}` : "";
  return useQuery(
    ["getWithdrawal", page, limit, status, search, type, userId],
    async () => {
      const request = await instance
        .get(
          BACKEND_URLS.wallet +
            `?page=${page}&per_page=${limit}${statusTerm}${searchTerm}${typeTerm}${userTerm}&include=wallet.user`,
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

// Get Service Transactions
export const useGetAllTransactions = (page, limit, status, search, startDate, endDate, userId, txnType) => {
  const statusTerm = status ? `&status=${status}` : "";
  const searchTerm = search ? `&search=${search}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";
  const userIdTerm = userId ? `&userId=${userId}` : "";
  const txnTypeTerm = txnType ? `/${txnType}` : "";

  return useQuery(
    ["getAllTransaction", page, limit, status, search, startDate, endDate, userId],
    async () => {
      const request = await instance
        .get(
          BACKEND_URLS.transaction +
            `${txnTypeTerm}?page=${page}&limit=${limit}${statusTerm}${searchTerm}${startDateTerm}${endDateTerm}${userIdTerm}`,
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

export const useGetAssetTransactionsOverview = () => {
  return useQuery(
    ["getAssetTransactionsOverview"],
    async () => {
      const request = await instance
        .get(`/crypto-transactions/stats`)
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

export const useGetGiftcardTransactionsOverview = () => {
  return useQuery(
    ["getGiftcardTransactionsOverview"],
    async () => {
      const request = await instance
        .get(`/giftcard-transactions/stats`)
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

export const useGetServiceTransactionsOverview = () => {
  return useQuery(
    ["getServiceTransactionsOverview"],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.transaction + `/overview`)
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

export const useReverseTransaction = (transactionID) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`/transactions/${transactionID}/reverse`, data)
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
        queryClient.invalidateQueries(["getAllTransaction"]);
        queryClient.invalidateQueries(["getWalletTransactions"]);
      },
    },
  );
};

export const useUpdateTransaction = (transactionID, status) => {
  const queryClient = useQueryClient();
  return useMutation(
    () =>
      toast.promise(
        instance
          .put(`/transactions/${transactionID}/status/${status}`)
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
        queryClient.invalidateQueries(["getAllTransaction"]);
        queryClient.invalidateQueries(["getWalletTransactions"]);
      },
    },
  );
};

export const useUpdateWalletDepositAmount = (transactionID) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`/wallet/transactions/${transactionID}`, data)
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
        queryClient.invalidateQueries(["getWithdrawal"]);
      },
    },
  );
};

export const useUpdateWithdrawalWalletStatus = (transactionID, status) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`/wallet/transactions/${transactionID}/action/${status}`, data)
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
        queryClient.invalidateQueries(["getWithdrawal"]);
      },
    },
  );
};
