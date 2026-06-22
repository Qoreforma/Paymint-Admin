import BACKEND_URLS from "./urls";
import { useQuery } from "@tanstack/react-query";
import { instance } from "./httpConfig";
import axios from "axios";

export const useGetShippingWeights = () => {
  return useQuery(
    ["ShippingWeights"],
    async () => {
      const request = instance
        .get(BACKEND_URLS.auth.me + "valid-weights")
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

// export const useGetAllCountries = () => {
//   return useQuery(["countries"], async () => {
//     try {
//       const response = await axios.get("https://restcountries.com/v3.1/all?fields=name");
//       return response.data;
//     } catch (error) {
//       console.error(error);
//     }
//   });
// };

export const useGetCountries = (page, limit) => {
  return useQuery(
    ["getCountries", page, limit],
    async () => {
      const request = await axios
        .get(`${import.meta.env.VITE_APP_IMAGEKIT_NORMAL_URL}/reference/countries` + `?page=${page}&limit=${limit}`)
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

export const useGetProductTypes = () => {
  return useQuery(["product-types"], async () => {
    try {
      const response = await instance.get("/products/types/all");
      return response.data;
    } catch (e) {
      throw new Error(e);
    }
  });
};
export const useGetProductDataTypes = () => {
  return useQuery(
    ["product-data-types"],
    async () => {
      try {
        const response = await instance.get("/products/types/data");
        return response.data;
      } catch (e) {
        throw new Error(e);
      }
    },
    {
      retry: 1,
      retryDelay: 3000,
      refetchOnWindowFocus: false,
    },
  );
};

export const useGetBanks = () => {
  return useQuery(["banks"], async () => {
    try {
      const response = await instance.get(`${import.meta.env.VITE_APP_IMAGEKIT_NORMAL_URL}/reference/banks`);
      return response.data;
    } catch (e) {
      throw new Error(e);
    }
  });
};
