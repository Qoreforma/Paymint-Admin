import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BACKEND_URLS from "./urls";
import { instance as requests } from "./httpConfig";

export const useGetTreasuryLedger = (filters = {}, page = 1, limit = 20) => {
  return useQuery(
    ["treasury-ledger", filters, page, limit],
    async () => {
      let queryParams = `page=${page}&limit=${limit}&`;
      if (filters.type) queryParams += `type=${filters.type}&`;
      if (filters.category) queryParams += `category=${filters.category}&`;
      if (filters.startDate) queryParams += `startDate=${filters.startDate}&`;
      if (filters.endDate) queryParams += `endDate=${filters.endDate}&`;

      if (queryParams.endsWith("&")) queryParams = queryParams.slice(0, -1);
      
      const endpoint = `${BACKEND_URLS.admin_baseUrl}${BACKEND_URLS.treasury}/ledger?${queryParams}`;
      
      const res = await requests.get(endpoint);
      return res;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
};

export const useGetPlatformFinances = () => {
  return useQuery(
    ["platform-finances"],
    async () => {
      const endpoint = `${BACKEND_URLS.admin_baseUrl}${BACKEND_URLS.treasury}/finances`;
      const res = await requests.get(endpoint);
      return res;
    },
    {
      refetchOnWindowFocus: false,
    }
  );
};

export const useAddTreasuryEntry = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data) => {
      const endpoint = `${BACKEND_URLS.admin_baseUrl}${BACKEND_URLS.treasury}/entry`;
      const res = await requests.post(endpoint, data);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["treasury-ledger"]);
        queryClient.invalidateQueries(["platform-finances"]);
      },
    }
  );
};
