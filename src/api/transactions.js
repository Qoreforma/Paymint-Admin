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

export const useGetWalletTransactionsOverview = (period, startDate, endDate) => {
  const periodTerm = period ? `?period=${period}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";

  return useQuery(
    ["getWalletTransactionsOverview", period, startDate, endDate],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.wallet + `/overview${periodTerm}${startDateTerm}${endDateTerm}`)
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
export const useGetAllTransactions = (page, limit, status, search, channel, startDate, endDate, userId, txnType) => {
  const statusTerm = status ? `&status=${status}` : "";
  const searchTerm = search ? `&search=${search}` : "";
  const channelTerm = channel ? `&channel=${channel}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";
  const userIdTerm = userId ? `&userId=${userId}` : "";
  const txnTypeTerm = txnType ? `/${txnType}` : "";

  return useQuery(
    ["getAllTransaction", page, limit, status, search, channel, startDate, endDate, userId],
    async () => {
      const request = await instance
        .get(
          BACKEND_URLS.transaction +
            `${txnTypeTerm}?page=${page}&limit=${limit}${statusTerm}${searchTerm}${channelTerm}${startDateTerm}${endDateTerm}${userIdTerm}`,
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

export const useGetAssetTransactionsOverview = (period, startDate, endDate, tradeType) => {
  const periodTerm = period ? `?period=${period}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";
  const tradeTypeTerm = tradeType ? `&tradeType=${tradeType}` : "";

  return useQuery(
    ["getAssetTransactionsOverview", period, startDate, endDate, tradeType],
    async () => {
      const request = await instance
        .get(`/crypto-transactions/stats${periodTerm}${startDateTerm}${endDateTerm}${tradeTypeTerm}`)
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

export const useGetGiftcardTransactionsOverview = (period, startDate, endDate, tradeType) => {
  const periodTerm = period ? `?period=${period}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";
  const tradeTypeTerm = tradeType ? `&tradeType=${tradeType}` : "";

  return useQuery(
    ["getGiftcardTransactionsOverview", period, startDate, endDate, tradeType],
    async () => {
      const request = await instance
        .get(`/giftcard-transactions/stats${periodTerm}${startDateTerm}${endDateTerm}${tradeTypeTerm}`)
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

export const useGetServiceTransactionsOverview = (period, startDate, endDate) => {
  const periodTerm = period ? `?period=${period}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";

  return useQuery(
    ["getServiceTransactionsOverview", period, startDate, endDate],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.transaction + `/overview${periodTerm}${startDateTerm}${endDateTerm}`)
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

export const useGetTransactionChartData = (period = "all", startDate = "", endDate = "") => {
  const params = new URLSearchParams();
  if (period && period !== "all") params.append("period", period);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString();
  const url = `${BACKEND_URLS.transaction}/chart${queryString ? `?${queryString}` : ""}`;

  return useQuery(
    ["getTransactionChartData", period, startDate, endDate],
    async () => {
      const request = await instance
        .get(url)
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
