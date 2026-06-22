import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";

export const useGetAllUsers = (currentPage, size, search, status) => {
  const page = `page=${currentPage}`;
  const per_page = `limit=${size}`;
  const searchTerm = search ? `&search=${search}` : "";
  const statusTerm = status ? `&status=${status}` : "";
  return useQuery(
    ["getAllUsers", page, size, searchTerm, statusTerm],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.users + `?${page}&${per_page}${searchTerm}${statusTerm}`)
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
    }
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
    }
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
        }
      ),
    {
      onSuccess: (data) => {
        // console.log(data);
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    }
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
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    }
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
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    }
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
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    }
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
        }
      ),
    {
      onSuccess: (data) => {
        // console.log(data);
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    }
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
        }
      ),
    {
      onSuccess: (data) => {
        // console.log(data);
        queryClient.invalidateQueries(["getAllUsers"]);
        queryClient.invalidateQueries(["getSingleUser"]);
      },
    }
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
    }
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
        }
      ),
    {
      onSuccess: (data) => {
        if (data?.data?.bvn === null) {
          toast.error("User BVN not provided");
        } else {
          setValue(data?.data?.bvn);
        }
      },
    }
  );
};
