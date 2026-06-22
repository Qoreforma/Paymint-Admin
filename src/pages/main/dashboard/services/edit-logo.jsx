import { useEffect, useState } from "react";
import { Form, Modal, ModalBody } from "reactstrap";
import { Button, Col, Icon } from "../../../../components/Component";
import ImageKitDropZone from "../../../components/dropzone";

const EditServiceLogo = ({ modal, closeModal, formData, editFunction }) => {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  //   console.log(formData);
  const onSubmit = (e) => {
    e.preventDefault();
    editFunction({ logo: uploadedImages[0] });
    close();
  };

  const close = () => {
    setUploadingImages(false);
    setUploadedImages([]);
    closeModal();
  };

  useEffect(() => {
    setUploadedImages([formData.logo]);
  }, [formData]);

  return (
    <Modal isOpen={modal} toggle={close} className="modal-dialog-centered" size="lg">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Edit Service Logo</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={onSubmit}>
              <Col>
                <label className="form-label">Add Logo</label>
                <div>
                  <ImageKitDropZone
                    value={uploadedImages}
                    setValues={setUploadedImages}
                    setLoading={setUploadingImages}
                    multiple={false}
                  />
                </div>
              </Col>

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button disabled={uploadingImages} color="primary" size="md" type="submit">
                      Proceed
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
  );
};
export default EditServiceLogo;
