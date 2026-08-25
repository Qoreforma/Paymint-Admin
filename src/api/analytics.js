import { useQuery } from "@tanstack/react-query";
import BACKEND_URLS from "./urls";
import { instance as requests } from "./httpConfig";

export const useGetServiceComparison = (filters = {}) => {
  return useQuery(
    ["service-comparison", filters],
    async () => {
      let queryParams = "";
      if (filters.period) queryParams += `period=${filters.period}&`;
      if (filters.startDate) queryParams += `startDate=${filters.startDate}&`;
      if (filters.endDate) queryParams += `endDate=${filters.endDate}&`;

      if (queryParams.endsWith("&")) queryParams = queryParams.slice(0, -1);
      
      const endpoint = `${BACKEND_URLS.admin_baseUrl}${BACKEND_URLS.analytics}/service-comparison${queryParams ? `?${queryParams}` : ""}`;
      
      const res = await requests.get(endpoint);
      return res;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
};
