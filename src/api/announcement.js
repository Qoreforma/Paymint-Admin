import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { instance } from "./httpConfig";
import BACKEND_URLS from "./urls";

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.annoucement, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          loading: "Please wait...",
          error: (error) => error.message,
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["AllAnnouncement"]);
      },
    }
  );
};

export const useDispatchAnnouncement = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.annoucement + `/${id}/dispatch`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data?.message || "Successful",
          loading: "Please wait...",
          error: (error) => error?.message || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["AllAnnouncement"]);
      },
    }
  );
};

export const useGetAnnouncement = (page, limit, status) => {
  const statusTerm = status ? `&status=${status}` : "";

  return useQuery(
    ["AllAnnouncement", page, limit, status],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.annoucement + `?page=${page}&limit=${limit}${statusTerm}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw err.response.data;
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

export const useEditAnnouncement = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.annoucement + `/${id}`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data?.message || "Successful",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => error?.message || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["AllAnnouncement"]);
      },
    }
  );
};

export const useDeleteAnnouncement = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.annoucement}/${id}`)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: `Annoucement  Deleted`,
          loading: "Please wait...",
          error: (error) => error?.message || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["AllAnnouncement"]);
      },
    }
  );
};

export const useRestoreAnnouncement = (id) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .put(BACKEND_URLS.annoucement + `/${id}/restore`, data)
          .then((res) => res.data)
          .catch((err) => {
            throw err.response.data;
          }),
        {
          success: (data) => data.message,
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => error?.message || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["AllAnnouncement"]);
      },
    }
  );
};
/******************NOTIFICATION GROUP ***********************************/

export const useGetAllNoticationGroups = (page, limit) => {
  return useQuery(
    ["allnotificationgroups", page, limit],
    async () => {
      const request = await instance
        .get(BACKEND_URLS.notificationGroup + `?page=${page}&limit=${limit}`)
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
    }
  );
};

export const useCreateNotificationGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .post(BACKEND_URLS.notificationGroup, data)
          .then((res) => res.data)
          .catch((err) => {
            return err;
          }),
        {
          success: "Group created",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => error?.response?.data || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["allnotificationgroups"]);
        navigate("/notifications-group");
      },
    }
  );
};

export const useUpdateNotificationGroup = () => {
  const queryClient = useQueryClient();
  // const navigate = useNavigate();

  return useMutation(
    (data) =>
      toast.promise(
        instance
          .patch(BACKEND_URLS.notificationGroup, data)
          .then((res) => res.data)
          .catch((err) => {
            return err;
          }),
        {
          success: "Group updated",
          // success: `Store status updated.`,
          loading: "Please wait...",
          error: (error) => error?.response?.data || "Something happened",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["allnotificationgroups"]);
      },
    }
  );
};

export const useDeleteNotificationGroup = (name) => {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      toast.promise(
        instance
          .delete(`${BACKEND_URLS.notificationGroup}?name=${name}`)
          .then((res) => res.data)
          .catch((err) => {
            return err;
          }),
        {
          success: `Notification Deleted`,
          loading: "Please wait...",
          error: "Failed to delete Group",
        },
        {
          style: {
            minWidth: "180px",
          },
        }
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["allnotificationgroups"]);
      },
    }
  );
};
