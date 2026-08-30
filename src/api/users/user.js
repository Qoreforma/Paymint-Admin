import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

export const useGetAllUsers = (
  currentPage = 1,
  size = 100,
  search = "",
  status = "",
  sortBy = "",
  sortOrder = "",
  startDate = "",
  endDate = "",
  period = "",
  userType = "",
  bvnVerified = "",
) => {
  const params = new URLSearchParams();
  if (currentPage) params.append("page", currentPage);
  if (size) params.append("limit", size);
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (period && period !== "all") params.append("period", period);
  if (userType) params.append("userType", userType);
  if (bvnVerified) params.append("bvnVerified", bvnVerified);

  const queryString = params.toString();

  return useQuery(
    [
      "getAllUsers",
      currentPage,
      size,
      search,
      status,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      period,
      userType,
      bvnVerified,
    ],
    async () => {
      const request = await instance
        .get(`${BACKEND_URLS.users}?${queryString}`)
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

export const useGetSingleUser = (id) => {
  return useQuery(
    ["getSingleUser"],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.users + `/${id}?include=relations`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      //   console.log(request);
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const useUpdateUserStatus = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.users + `/${id}/status`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "User status updated",
          loading: "Please wait...",
          error: "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: (data) => {
        // console.log(data);
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    },
  );
};

export const useRestrictUser = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.users + `/${id}/restrict`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "User restricted",
          loading: "Please wait...",
          error: (e) => e?.response?.data?.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    },
  );
};

export const useBlacklistUser = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.users + `/${id}/toggle-blacklist`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "User Status updated",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (e) => e?.response?.data?.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    },
  );
};

export const useMarkAsFraud = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.users + `/${id}/mark-as-fraudulent`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "User Status updated",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    },
  );
};

export const useFinanceUser = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.users + `/${id}/wallet/debit`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: (data) => data?.message || "Successful",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: (data) => {
        // console.log(data);
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    },
  );
};

export const useUpdateUserType = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.users + `/${id}/type`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: (data) => data?.message || "Successful",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: (data) => {
        // console.log(data);
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    },
  );
};

export const useGetUserType = () => {
  return useQuery(
    ["UserTypes"],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.users + "/types/all")
        .then((res) => res?.data)
        .catch((err) => {
          throw err;
        });
      //   console.log(request);
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
    },
  );
};

export const getUserOptions = async (currentPage, size, search) => {
  const searchTerm = search ? `&search=${search}` : "";
  const page = `page=${currentPage}`;
  const per_page = `per_page=${size}`;
  const request = await instance
    .get(BACKEND_URLS.users + `?${page}&${per_page}${searchTerm}${statusTerm}`)
    .then((res) => res?.data)
    .catch((err) => {
      throw err;
    });
  //   console.log(request);
  return request;
};

export const useViewUserBVN = (id, setValue) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.users + `/${id}/bvn`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: (data) => data?.message || "Successful",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (data) => data.response.data.message || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: (data) => {
        if (data?.data?.bvn === null) {
          toast.error("User BVN not provided");
        } else {
          setValue(data?.data?.bvn);
        }
      },
    },
  );
};

export const useGetUserStat = (period = "all", startDate = "", endDate = "") => {
  const params = new URLSearchParams();
  if (period && period !== "all") params.append("period", period);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString();
  const url = `${BACKEND_URLS.users}/stats${queryString ? `?${queryString}` : ""}`;

  return useQuery(
    ["getUserStat", period, startDate, endDate],
    async () => {
      const request = await instance
        .get(url)
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

export const useGetUserChartData = (period = "all", startDate = "", endDate = "") => {
  const params = new URLSearchParams();
  if (period && period !== "all") params.append("period", period);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString();
  const url = `${BACKEND_URLS.users}/chart${queryString ? `?${queryString}` : ""}`;

  return useQuery(
    ["getUserChartData", period, startDate, endDate],
    async () => {
      const request = await instance
        .get(url)
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
