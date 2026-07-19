import { Modal, ModalBody } from "reactstrap";
import { Button, Col, Icon, Row } from "../../../../components/Component";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useState } from "react";
import Dropzone from "react-dropzone";

export default function EditModal({ formData, view, onFormCancel, onFormSubmit }) {
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues: { amount: "", review_proof: "" } });

  const [rejectedFiles, setRejectedFile] = useState([]);
  const [previewImage, setPreviewImage] = useState([]);

  const close = () => {
    setRejectedFile([]);
    setPreviewImage([]);
    onFormCancel();
  };

  const submit = (data) => {
    onFormSubmit(data);
    close();
  };

  // handles ondrop function of dropzone
  const handleDropChange = (acceptedFiles, set) => {
    acceptedFiles.forEach((file) => {
      set([file]);
      // console.log(file);
    });
    if (rejectedFiles) {
      setRejectedFile([]);
    }
  };

  useEffect(() => {
    reset({ amount: formData.amount, review_proof: "" });
  }, [reset, formData]);

  return (
    <Modal isOpen={view.edit} toggle={close} className="modal-dialog-centered" size="md">
      <ModalBody className="bg-white rounded">
        <a href="#cancel" className="close">
          {" "}
          <Icon
            name="cross-sm"
            onClick={(ev) => {
              ev.preventDefault();
              close();
            }}
          ></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Edit Deposit request</h5>
          <div className="mt-4">
            <form onSubmit={handleSubmit(submit)}>
              <Row className="g-3">
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer">
                      Amount
                    </label>
                    <div className="form-control-wrap">
                      <input
                        type="text"
                        className="form-control"
                        {...register("amount", {
                          required: "This field is required",
                        })}
                      />
                      {errors.amount && <span className="invalid">{errors.amount.message}</span>}
                    </div>
                  </div>
                </Col>

                <Col>
                  <label className="form-label">Upload Review (optional)</label>

                  <Controller
                    control={control}
                    name="review_proof"
                    render={({ field: { onChange } }) => (
                      <Dropzone
                        onDrop={(acceptedFiles) => {
                          onChange(acceptedFiles[0]);
                          handleDropChange(acceptedFiles, setPreviewImage);
                        }}
                        accept={[".jpg", ".png", ".jpeg"]}
                        maxFiles={1}
                        onDropRejected={(file) => handleOnReject(file, setRejectedFile)}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                              <input {...getInputProps()} />
                              {previewImage.length === 0 && (
                                <div className="dz-message">
                                  <span className="dz-message-text">Drag 'n' drop some files here</span>
                                  <span className="dz-message-or">or</span>
                                  <Button type="button" color="primary">
                                    SELECT
                                  </Button>
                                  <p>(Only *.jpg, *.png and *.jpeg will be accepted) </p>
                                </div>
                              )}
                              {previewImage.map((file) => (
                                <div
                                  key={file.name}
                                  className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                >
                                  <div className="dz-image">
                                    <img src={`${URL.createObjectURL(file)}`} alt="preview" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </Dropzone>
                    )}
                  />

                  {rejectedFiles.map(({ file, errors }) => (
                    <div key={file.path}>
                      {errors.map((error) => (
                        <p key={error.code} className="text-danger">
                          {error.message}
                        </p>
                      ))}
                    </div>
                  ))}
                </Col>

                <Col size="12">
                  <Button color="primary" type="submit">
                    <Icon className="plus"></Icon>
                    <span>Proceed</span>
                  </Button>
                </Col>
              </Row>
            </form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
