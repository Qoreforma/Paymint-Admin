import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Col, Row } from "../../../../../components/Component";

export const AndroidForm = ({ platform, create, edit, closeModal }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      version: platform?.version,
      build_number: platform?.buildNumber,
      store_link: platform?.storeLink,
      platform: "android",
      is_required: platform?.isForceUpdate || false,
    },
  });

  const submitForm = (data) => {
    let submittedData = {
      version: data.version,
      buildNumber: data.build_number,
      isForceUpdate: data.is_required,
      storeLink: data.store_link,
    };
    if (platform) {
      edit({ data: submittedData, id: platform?._id });
    } else {
      create({ ...submittedData, platform: "Android" });
    }
    closeModal();
  };

  const is_required = watch("is_required");

  useEffect(() => {
    if (platform) {
      reset(platform);
    }
  }, [platform]);
  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <Row className="gy-3">
        <Col md="6">
          <div className="form-group">
            <label className="form-label" htmlFor="version">
              App Version
            </label>
            <input type="text" className="form-control" {...register("version")} placeholder="Enter App Version" />
          </div>
        </Col>
        <Col md="6">
          <div className="form-group">
            <label className="form-label" htmlFor="build_number">
              Build Number
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Build Number"
              {...register("build_number", { required: "Build Number is required" })}
            />
          </div>
        </Col>

        <Col md="6">
          <div className="form-group">
            <label className="form-label" htmlFor="addressee_first_name">
              Store Link
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Store Link"
              {...register("store_link", {
                required: "Store Link is required",
              })}
            />
          </div>
        </Col>

        <Col md="6">
          <div className="form-group">
            <label className="form-label" htmlFor="android_required">
              Force Update
            </label>
            <div className="form-control-wrap">
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="android_required"
                  //   defaultChecked
                  {...register("is_required")}
                  //   defaultChecked={forceUpdate}
                  //   onChange={() => setForceUpdate((prev) => !prev)}
                />
                <label className="custom-control-label" htmlFor="android_required">
                  {is_required ? "On" : "Off"}
                </label>
              </div>
            </div>
          </div>
        </Col>

        <Col size="12">
          <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
            <li>
              <Button color="primary" type="submit">
                Update Android Version
              </Button>
            </li>
            <li>
              <a
                href="#dropdownitem"
                onClick={(ev) => {
                  ev.preventDefault();
                  setModal(false);
                }}
                className="link link-light"
              >
                Cancel
              </a>
            </li>
          </ul>
        </Col>
      </Row>
    </form>
  );
};
