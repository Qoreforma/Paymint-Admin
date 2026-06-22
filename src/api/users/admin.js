import BACKEND_URLS from "../urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../httpConfig";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.admin.createAdmin, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Admin created",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllAdmin"]);
      },
    },
  );
};

export const useGetAllAdmin = (page, limit, role, searchFilter) => {
  const roleTerm = role ? `&adminLevel=${role.toLowerCase()}` : "";
  const searchTerm = searchFilter ? `&search=${searchFilter.toLowerCase()}` : "";
  return useQuery(
    ["getAllAdmin", page, limit, roleTerm, searchTerm],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.admin.getAdmins + `?page=${page}&limit=${limit}${roleTerm}${searchTerm}`)
        .then((res) => res?.data)
        .catch((err) => {
          toast.error(
            err?.response?.data?.message ? err?.response?.data?.message : "Something went wrong while fetching admins",
          );
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

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ adminId, data }) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.admin.getAdmins + `/${adminId}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Admin updated",
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllAdmin"]);
      },
    },
  );
};

export const useDeleteAdmin = (adminId) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.admin.getAdmins}/${adminId}/deactivate`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Admin Deleted`,
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["getAllAdmin"]);
      },
    },
  );
};

export const useGetAllRoles = (page, limit) => {
  return useQuery(
    ["getAllRoles", page, limit],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.roles + `?page=${page}&limit=${limit}`)
        .then((res) => res?.data)
        .catch((err) => {
          toast.error(
            err?.response?.data?.message ? err?.response?.data?.message : "Something went wrong while fetching roles",
          );
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

export const useGetRoles = () => {
  return useQuery(
    ["getAllRoles"],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.roles)
        .then((res) => res?.data)
        .catch((err) => {
          return err;
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

export const useGetRoleById = (id = "") => {
  return useQuery(
    ["getAllRoles", id],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.roles + `/${id}`)
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
      initialData: [],
    },
  );
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (roleId) =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.roles}/${roleId}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: `Role Deleted`,
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllRoles"]);
      },
    },
  );
};

export const useGetAllPermissions = () => {
  return useQuery(
    ["useGetAllPermissions"],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.permissions + "/available")
        .then((res) => res?.data)
        .catch((err) => {
          toast.error(
            err?.response?.data?.message ? err?.response?.data?.message : "Something went wrong while fetching roles",
          );
          throw err;
        });
      return request;
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: 3000,
      initialData: [],
    },
  );
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.roles, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Role created",
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllRoles"]);
        navigate("/roles-management");
      },
    },
  );
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation(
    ({ roleId, data }) =>
      toast.promise(
        instance
          .patch(BACKEND_URLS.roles + `/${roleId}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Role updated",
          loading: "Please wait...",
          error: (error) => (error?.response?.data?.message ? error?.response?.data?.message : "Something happened"),
        },
        {
          style: {
            minWidth: "180px",
          },
        },
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllRoles"]);
        navigate("/roles-management");
      },
    },
  );
};

export const useGetServiceCharge = () => {
  return useQuery(
    ["useGetOtherSettings"],
    async () => {
      const request = await instance
        .get("/service-charges")
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

export const useUpdateServiceCharge = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(`/service-charges/${id}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Charge updated",
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
        queryClient.invalidateQueries(["useGetOtherSettings"]);
      },
    },
  );
};

export const useGetProviderRates = () => {
  return useQuery(
    ["ProviderRates"],
    async () => {
      const request = await instance
        .get("/configs/provider-rate")
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

export const useUpdateProviderRates = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .patch(`/configs/provider-rate/${id}/rates`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Rate updated",
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
        queryClient.invalidateQueries(["ProviderRates"]);
      },
    },
  );
};

export const useGetPhonePrefix = () => {
  return useQuery(
    ["PhonePrefix"],
    async () => {
      const request = await instance
        .get("/configs/phone-prefix")
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

export const useUpdatePhonePrefix = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ prefix, data }) =>
      toast.promise(
        instance
          .patch(`/configs/phone-prefix/${prefix}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Phone prefix updated",
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
        queryClient.invalidateQueries(["PhonePrefix"]);
      },
    },
  );
};

export const useAddPhonePrefix = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(`/configs/phone-prefix`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Phone prefix added.",
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
        queryClient.invalidateQueries(["PhonePrefix"]);
      },
    },
  );
};

export const useDeletePhonePrefix = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (prefix) =>
      toast.promise(
        instance
          .delete(`/configs/phone-prefix/${prefix}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err;
          }),
        {
          success: "Phone prefix deleted",
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
        queryClient.invalidateQueries(["PhonePrefix"]);
      },
    },
  );
};
