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
      
      const endpoint = `${BACKEND_URLS.analytics}/service-comparison${queryParams ? `?${queryParams}` : ""}`;
      
      const res = await requests.get(endpoint);
      return res;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
};

export const useGetCohortAnalytics = (filters = {}) => {
  return useQuery(
    ["cohort-analytics", filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.period) params.append("period", filters.period);
      if (filters.metric) params.append("metric", filters.metric);
      if (filters.weeks) params.append("weeks", filters.weeks);
      if (filters.months) params.append("months", filters.months);
      if (filters.userType) params.append("userType", filters.userType);
      if (filters.channel) params.append("channel", filters.channel);
      if (filters.refresh) params.append("refresh", "true");

      const queryString = params.toString();
      const endpoint = `${BACKEND_URLS.analytics}/cohorts${queryString ? `?${queryString}` : ""}`;

      const res = await requests.get(endpoint);
      return res;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
};

