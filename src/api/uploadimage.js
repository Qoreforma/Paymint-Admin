import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import BACKEND_URLS from "./urls";
import { instance } from "./httpConfig";
import axios from "axios";

export const useUploadImages = (uploadCallback) => {
  return useMutation(
    (formData) =>
      instance
        .post(`${import.meta.env.VITE_APP_IMAGEKIT_URL}`, formData)
        .then((res) => res.data)
        .catch((err) => {
          throw err?.response?.data;
        }),
    {
      onMutate: () => {
        // toast.loading("Uploading Images. Please wait...");
      },
      onSuccess: (data) => {
        // console.log(data)
        uploadCallback(data);
        toast.success("Upload successful!");
      },

      onError: (err) => {
        console.error(err);
        if (typeof err === "string") {
          toast.error(err || "Failed to upload images");
        }
      },
    }
  );
};

export const generateSignature = async () => {
  const response = await instance
    .get("/media/signature")
    .then((response) => response?.data)
    .catch((err) => console.error(err));

  if (response) {
    return {
      token: response?.token,
      signature: response?.signature,
      expire: response?.expire,
    };
  }
};
