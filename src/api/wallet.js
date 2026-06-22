import { useQuery } from "@tanstack/react-query";
import { instance } from "./httpConfig";

export const useGetStoreWalletStats = (id) => {
  // console.log(storeId);
  return useQuery(
    ["getStoreWalletStats", id],
    async () => {
      const request = instance
        .get(`/wallet-stats?store=${id}`)
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
      initialData: [],
    }
  );
};
