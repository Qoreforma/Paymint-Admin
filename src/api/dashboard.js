import { useQuery } from "@tanstack/react-query";
import { instance } from "./httpConfig";

export const useGetTopProductStats = (startDate, endDate) => {
  return useQuery(
    ["topproductstats", startDate, endDate],
    async () => {
      const response = await instance.get(`/dashboard/top-products?start=${startDate}&end=${endDate}`);
      return response.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

export const useGetRecentOrdersStats = (startDate, endDate) => {
  return useQuery(
    ["recentOrderstats", startDate, endDate],
    async () => {
      const response = await instance.get(`/dashboard/recent-orders?start=${startDate}&end=${endDate}`);
      // console.log(response.data);
      return response.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

export const useGetStoreStats = () => {
  return useQuery(
    ["dashboardstoreStats"],
    async () => {
      const response = await instance.get(`/dashboard/store-statistics`);
      // console.log(response.data);
      return response.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

export const useGetCustomerStats = (startDate, endDate) => {
  return useQuery(
    ["customerStats", startDate, endDate],
    async () => {
      const response = await instance.get(`/dashboard/customers?start=${startDate}&end=${endDate}`);
      // console.log(response.data);
      return response.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

export const useGetOrderStats = (startDate, endDate) => {
  return useQuery(
    ["orderStats", startDate, endDate],
    async () => {
      const response = await instance.get(`/dashboard/orders?start=${startDate}&end=${endDate}`);
      // console.log(response.data);
      return response.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

export const useGetAverageOrderStats = (startDate, endDate) => {
  return useQuery(
    ["average-orders", startDate, endDate],
    async () => {
      const response = await instance.get(`/dashboard/average-orders?start=${startDate}&end=${endDate}`);
      // console.log(response.data);
      return response.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

export const useGetTotalSaleStats = (startDate, endDate) => {
  return useQuery(
    ["total-sales", startDate, endDate],
    async () => {
      const response = await instance.get(`/dashboard/total-sales?start=${startDate}&end=${endDate}`);
      return response.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};

export const useGetDashboardStats = () => {
  return useQuery(
    ["dashboard-stats"],
    async () => {
      const response = await instance.get(`/dashboard/stats`);
      return response.data?.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    }
  );
};
