import { Modal, ModalBody } from "reactstrap";
import { Button, Col, Icon, Row } from "../../../../components/Component";
import { useForm } from "react-hook-form";

export default function OTPModal({ view, onFormCancel, onFormSubmit }) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ defaultValues: { otp: "" } });

  return (
    <Modal isOpen={view.otp} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
      <ModalBody className="bg-white rounded">
        <a href="#cancel" className="close">
          {" "}
          <Icon
            name="cross-sm"
            onClick={(ev) => {
              ev.preventDefault();
              onFormCancel();
            }}
          ></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Enter OTP</h5>
          <div className="mt-4">
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <Row className="g-3">
                <Col md="12">
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer">
                      Enter OTP
                    </label>
                    <div className="form-control-wrap">
                      <input
                        type="text"
                        className="form-control"
                        {...register("otp", {
                          required: "This field is required",
                        })}
                      />
                      {errors.otp && <span className="invalid">{errors.otp.message}</span>}
                    </div>
                  </div>
                </Col>

                <Col size="12">
                  <Button color="primary" type="submit">
                    <Icon className="plus"></Icon>
                    <span>Authorize</span>
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
