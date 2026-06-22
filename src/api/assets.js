import BACKEND_URLS from "./urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import { toast } from "react-hot-toast";

//getallbrands
export const useGetAssetsTransactions = (
  page,
  limit,
  status,
  search,
  startDate,
  endDate,
  user,
  cryptoId,
  tradeType,
) => {
  const statusTerm = status ? `&status=${status}` : "";
  const searchTerm = search ? `&search=${search}` : "";
  const userTerm = user ? `&userId=${user}` : "";
  const cryptoIdTerm = cryptoId ? `&cryptoId=${cryptoId}` : "";
  const tradeTypeTerm = tradeType ? `&tradeType=${tradeType}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";

  return useQuery(
    ["getAssets", page, limit, status, search, startDate, endDate, user, cryptoId, tradeType],
    async () => {
      const request = await instance
        .get(
          BACKEND_URLS.crypto +
            `?page=${page}&limit=${limit}${statusTerm}${searchTerm}${userTerm}${tradeTypeTerm}${startDateTerm}${endDateTerm}${cryptoIdTerm}`,
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

// Get product Info
export const useGetAssetInfo = (id) => {
  return useQuery(["getAssets", id], async () => {
    const request = instance
      .get(BACKEND_URLS.crypto + `/${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};

export const useApproveAsset = (editedId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto + `/${editedId}/approve`)
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
        queryClient.invalidateQueries(["getAssets"]);
      },
    },
  );
};

export const useSecondApproveAsset = (editedId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto + `/${editedId}/second-approve`, data)
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
        queryClient.invalidateQueries(["getAssets"]);
      },
    },
  );
};

export const useDeclineAsset = (editedId) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.crypto + `/${editedId}/decline`, data)
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
        queryClient.invalidateQueries(["getAssets"]);
      },
    },
  );
};

export const useUpdateAssetStatus = (transactionID, status) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) =>
      toast.promise(
        instance
          .patch(`/asset-transactions/${transactionID}/${status}`, data)
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
        queryClient.invalidateQueries(["getAssets"]);
      },
    },
  );
};
