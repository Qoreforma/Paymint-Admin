import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

export const useCreateLocalZones = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.shipping.localZones, data)
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
        queryClient.invalidateQueries(["getLocalZones"]);
      },
    }
  );
};

export const useGetAllLocalZones = (page, limit) => {
  // const searchText = search ? `&search=${search}` : "";
  // const productTypeFilter = type ? `&type=${type}` : "";
  return useQuery(
    ["getLocalZones", page, limit],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.localZones + `?page=${page}&limit=${limit}`)
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
    ["getLocalZoneOptions"],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.localZones)
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

export const useEditLocalZones = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.shipping.localZones, data)
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
        queryClient.invalidateQueries(["getLocalZones"]);
      },
    }
  );
};

//delete zones
export const useDeleteLocalZones = (zoneId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.shipping.localZones}?zone=${zoneId}`)
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
        queryClient.invalidateQueries(["getLocalZones"]);
      },
    }
  );
};

//LOCAL ZONE WEIGHT
export const useCreateLocalZoneWeight = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.shipping.localZonesWeight, data)
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
        queryClient.invalidateQueries(["getLocalZoneWeights"]);
      },
    }
  );
};

export const useGetAllLocalZonesWeights = (zoneId, page, limit) => {
  // const searchText = search ? `&search=${search}` : "";
  // const productTypeFilter = type ? `&type=${type}` : "";
  return useQuery(
    ["getLocalZoneWeights", zoneId, page, limit],
    async () => {
      const request = instance
        .get(BACKEND_URLS.shipping.localZonesWeight + `?zone=${zoneId}&page=${page}&limit=${limit}`)
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

export const useEditLocalZoneWeights = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.shipping.localZonesWeight, data)
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
        queryClient.invalidateQueries(["getLocalZoneWeights"]);
      },
    }
  );
};

//delete weights
export const useDeleteLocalZoneWeight = (weightId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.shipping.localZonesWeight}?weightId=${weightId}`)
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
        queryClient.invalidateQueries(["getLocalZoneWeights"]);
      },
    }
  );
};
