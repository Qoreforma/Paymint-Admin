import BACKEND_URLS from "./urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import { toast } from "react-hot-toast";

// Get Giftcard Transactions
export const useGetGiftcardTransactions = (page, limit, status, search, startDate, endDate, user, tradeType) => {
  const statusTerm = status ? `&status=${status}` : "";
  const searchTerm = search ? `&search=${search}` : "";
  const userTerm = user ? `&userId=${user}` : "";
  const tradeTypeTerm = tradeType ? `&tradeType=${tradeType}` : "";
  const startDateTerm = startDate ? `&startDate=${startDate}` : "";
  const endDateTerm = endDate ? `&endDate=${endDate}` : "";

  return useQuery(
    ["getGiftcard", page, limit, status, search, startDate, endDate, user, tradeType],
    async () => {
      const request = await instance
        .get(
          BACKEND_URLS.giftcard +
            `?page=${page}&limit=${limit}${statusTerm}${searchTerm}${userTerm}${tradeTypeTerm}${startDateTerm}${endDateTerm}`,
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

// Get Giftcard Info
export const useGetGiftcardInfo = (id) => {
  return useQuery(["getGiftcard", id], async () => {
    const request = instance
      .get(BACKEND_URLS.giftcard + `/${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};

// Get Related Giftcard Info
export const useGetMultipleGiftcard = (id) => {
  return useQuery(["getMultipleGiftcard", id], async () => {
    const request = instance
      .get(BACKEND_URLS.giftcard + `/${id}/multiple`)
      .then((res) => res?.data?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};

// Approve Giftcard
export const useApproveGiftcard = (giftcardId, parentId, single = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(
            BACKEND_URLS.giftcard +
              `/${giftcardId ? giftcardId : parentId}${single ? "/approve" : "/multiple/approve"}`,
            data,
          )
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
        queryClient.invalidateQueries(["getGiftcard"]);
        queryClient.invalidateQueries(["getMultipleGiftcard", parentId]);
      },
    },
  );
};

// Second Approve Giftcard
export const useSecondApproveGiftcard = (giftcardId, parentId, single = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(
            BACKEND_URLS.giftcard +
              `/${giftcardId ? giftcardId : parentId}${single ? "/second-approve" : "/multiple/second-approve"}`,
            data,
          )
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
        queryClient.invalidateQueries(["getGiftcard"]);
        queryClient.invalidateQueries(["getMultipleGiftcard", parentId]);
      },
    },
  );
};

// Decline Giftcard
export const useDeclineGiftcard = (giftcardId, parentId, single = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(
            BACKEND_URLS.giftcard +
              `/${giftcardId ? giftcardId : parentId}${single ? "/decline " : "/multiple/decline"}`,
            data,
          )
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message ?? "Successful",
          loading: "Please wait...",
          error: (error) => error.message ?? "Failed to decline",
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getGiftcard"]);
        queryClient.invalidateQueries(["getMultipleGiftcard", parentId]);
      },
    },
  );
};

// Get Related Giftcard
export const useGetRelatedGiftcard = (id) => {
  return useQuery(["getrelatedGiftcard", id], async () => {
    const request = instance
      .get(BACKEND_URLS.giftcard + `/${id}?include=user,bank,giftcardProduct,reviewer`)
      .then((res) => res?.data?.data)
      .catch((err) => {
        throw err;
      });
    return request;
  });
};
