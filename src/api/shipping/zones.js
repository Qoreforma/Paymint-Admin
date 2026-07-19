import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

export const useCreateIntlZones = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.auth.me + `shipping-zone`, data)
          .then((res) => res?.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Zone Created",
          loading: "Adding zone...",
          error: "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getIntlZones"]);
      },
    }
  );
};

export const useGetAllIntlZones = (page, limit) => {
  // const searchText = search ? `&search=${search}` : "";
  // const productTypeFilter = type ? `&type=${type}` : "";
  return useQuery(
    ["getIntlZones", page, limit],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.intlZones + `?page=${page}&limit=${limit}`)
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
    }
  );
};

export const useGetZoneOptions = () => {
  return useQuery(
    ["getIntlZoneOptions"],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.intlZones)
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
    }
  );
};

export const useEditIntlZones = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.shipping.intlZones, data)
          .then((res) => res?.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Zone Updated",
          loading: "Updating zone...",
          error: "Zone update failed",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getIntlZones"]);
      },
    }
  );
};

//delete zones
export const useDeleteIntlZones = (zoneId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.shipping.intlZones}?zone=${zoneId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Zone Deleted`,
          loading: "Please wait...",
          error: "Failed to delete.",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getIntlZones"]);
      },
    }
  );
};

//INTERNATIONAL ZONE WEIGHT
export const useCreateIntlZoneWeight = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.shipping.intlZonesWeight, data)
          .then((res) => res?.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Zone Weight Added.",
          loading: "Adding zone...",
          error: "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getIntlZoneWeights"]);
      },
    }
  );
};

export const useGetAllIntlZonesWeights = (zoneId, page, limit) => {
  // const searchText = search ? `&search=${search}` : "";
  // const productTypeFilter = type ? `&type=${type}` : "";
  return useQuery(
    ["getIntlZoneWeights", zoneId, page, limit],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.intlZonesWeight + `?zone=${zoneId}&page=${page}&limit=${limit}`)
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
    }
  );
};

export const useEditIntlZoneWeights = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.shipping.intlZonesWeight, data)
          .then((res) => res?.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Weight Updated",
          loading: "Updating zone...",
          error: "Weight update failed",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getIntlZoneWeights"]);
      },
    }
  );
};

//delete weights
export const useDeleteIntlZoneWeight = (weightId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.shipping.intlZonesWeight}?weightId=${weightId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Weight Deleted`,
          loading: "Please wait...",
          error: "Failed to delete.",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getIntlZoneWeights"]);
      },
    }
  );
};
