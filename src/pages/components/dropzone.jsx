import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
// import "react-quill/dist/quill.snow.css";
import { generateSignature, useUploadImages } from "../../api/uploadimage";
import { Button, Icon, Row, Col } from "../../components/Component";

export default function ImageKitDropZone({ value, setValues, setLoading, multiple = true, maxFiles = 4 }) {
  const [files, setFiles] = useState([]);

  const handleDropChange = (acceptedFiles) => {
    let selectedFile = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    if (multiple) {
      // respect max file count
      if (files.length >= maxFiles) return;
      setFiles([...files, ...selectedFile].slice(0, maxFiles));
    } else {
      // only single file
      setFiles([selectedFile[0]]);
    }
  };

  const removeImage = (e, name) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((item) => item.name !== name));
  };

  const onImageUpload = (data) => {
    const image = data?.url;
    setValues((prev) => [...prev, image]);
    // if (multiple) {
    // } else {
    //   setValues(image); // 👈 single value
    // }
    setFiles([]);
  };

  const bulkImageUpload = async (image) => {
    const { token, expire, signature } = await generateSignature();

    const formData = new FormData();
    formData.append("publicKey", import.meta.env.VITE_APP_IMAGEKIT_PUBLIC_KEY);
    formData.append("file", image);
    formData.append("fileName", image?.name);
    formData.append("expire", expire);
    formData.append("token", token);
    formData.append("signature", signature);

    upload(formData);
  };

  const uploadImageToImageKit = async () => {
    if (multiple) {
      files.forEach((image) => bulkImageUpload(image));
    } else if (files[0]) {
      bulkImageUpload(files[0]);
    }
  };

  const { isLoading: uploading, mutate: upload, isSuccess: uploaded } = useUploadImages(onImageUpload);

  useEffect(() => {
    setLoading(uploading);
  }, [uploading]);

  return (
    <div>
      <Dropzone disabled={!multiple && value.length > 0} multiple={multiple} onDrop={handleDropChange}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable bg-white">
              <input {...getInputProps()} />
              {files.length === 0 && <p>Drag 'n' drop some files here, or click to select files</p>}
              {files.map((file) => (
                <div
                  key={file.name}
                  style={{
                    position: "relative",
                  }}
                  className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                >
                  <div className="dz-image">
                    <img src={file.preview} alt="preview" style={{ objectFit: "cover" }} />
                  </div>

                  <div
                    role="button"
                    onClick={(e) => removeImage(e, file.name)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      zIndex: 50,
                      paddingInline: "0.25rem",
                      paddingBlock: "0.05rem",
                      backgroundColor: "whitesmoke",
                      borderRadius: "9999px",
                      cursor: "pointer",
                    }}
                  >
                    <Icon name="cross" style={{ cursor: "pointer" }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </Dropzone>

      <Button
        disabled={uploading || !files.length}
        color="primary"
        size="md"
        type="button"
        onClick={uploadImageToImageKit}
      >
        {uploading ? "Uploading..." : "Upload"}
      </Button>

      <div className="d-flex mt-3" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
        {value?.map((file, index) => (
          <div key={index} style={{ position: "relative" }}>
            <img src={file} alt="uploaded" style={{ height: 100, width: 100, borderRadius: 5 }} />
            <div
              role="button"
              onClick={() => setValues((prev) => prev.filter((item) => item !== file))}
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                background: "white",
                borderRadius: "50%",
                cursor: "pointer",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                objectFit: "cover",
              }}
            >
              <Icon name="cross" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
