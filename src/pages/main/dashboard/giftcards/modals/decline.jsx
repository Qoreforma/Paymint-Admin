import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { set, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useDeclineGiftcard } from "../../../../../api/giftcard";
import { Button, Col, Icon, RSelect } from "../../../../../components/Component";
import { giftcardErrorPrompts } from "../data";
import { useUploadImages, generateSignature } from "../../../../../api/uploadimage";
import ImageKitDropZone from "../../../../components/dropzone";
import toast from "react-hot-toast";

const DeclineModal = ({ modal, closeModal, editedId, giftcardId, single = true }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { mutate: decline } = useDeclineGiftcard(editedId, giftcardId, single);
  const [confirm, setConfirm] = useState(false);
  const options = giftcardErrorPrompts?.map((item) => ({ label: item.title, value: item.title }));
  const [description, setDescription] = useState("");

  function onChangeFunction(id) {
    const des = giftcardErrorPrompts?.find((item) => item.title === id);
    if (des) {
      setDescription(des.description);
    }
  }

  const {
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitForm = async () => {
    if (description !== "") {
      decline({ declineNote: description, declineProof: uploadedImages[0] });
      close();
    } else {
      toast.error("Please select a prompt or write a note");
      setConfirm(false);
      return;
    }
  };

  const close = () => {
    closeModal();

    setConfirm(false);
    setDescription("");
    setUploadedImages([]);
    reset({});
  };

  return (
    <>
      <Modal isOpen={modal} toggle={close} className="modal-dialog-centered" size="md">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              close();
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Decline Transaction </h5>

            <div className="mt-4">
              <Form className="row gy-4" id="hook-form" noValidate onSubmit={handleSubmit(submitForm)}>
                <Col size="12">
                  <div className="form-group">
                    <label className="overline-title overline-title-alt">Giftcard Product</label>

                    <RSelect
                      options={options}
                      placeholder="Select Prompts"
                      onChange={(e) => onChangeFunction(e.label)}
                    />
                  </div>
                </Col>

                <Col>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cf-default-textarea">
                      Comment
                    </label>
                    <div className="form-control-wrap">
                      <textarea
                        className="form-control form-control-sm"
                        id="cf-default-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target?.value)}
                        placeholder="Write a note"
                      />
                    </div>
                  </div>
                </Col>
                <Col>
                  <label className="form-label">Decline proof</label>
                  <ImageKitDropZone
                    setLoading={setUploadingImages}
                    setValues={setUploadedImages}
                    value={uploadedImages}
                    multiple={false}
                  />
                </Col>
                <Col size="12">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md" type="button" onClick={() => setConfirm(true)}>
                        Submit
                      </Button>
                    </li>
                    <li>
                      <a
                        href="#cancel"
                        onClick={(ev) => {
                          ev.preventDefault();
                          close();
                        }}
                        className="link link-light"
                      >
                        Cancel
                      </a>
                    </li>
                  </ul>
                </Col>
              </Form>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={confirm} toggle={close} className="modal-dialog-centered" size="md">
        <ModalBody>
          <a
            href="#cancel"
            onClick={(ev) => {
              ev.preventDefault();
              close();
            }}
            className="close"
          >
            <Icon name="cross-sm"></Icon>
          </a>
          <div className="p-2">
            <h5 className="title">Confirm</h5>

            <p>Are you sure you want to decline this transaction?</p>
            <div className="mt-4">
              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" form="hook-form" disabled={uploadingImages}>
                      Proceed
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setConfirm(false);
                      }}
                      className="link link-light"
                    >
                      Cancel
                    </a>
                  </li>
                </ul>
              </Col>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default DeclineModal;
