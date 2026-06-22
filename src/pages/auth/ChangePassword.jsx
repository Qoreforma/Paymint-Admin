import React, { useState } from "react";
import Cookies from "js-cookie";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  PreviewCard,
  Icon,
} from "../../components/Component";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useResetPassword } from "../../api/authentication";
import Logo from "../../images/logo.png";
import { Spinner } from "reactstrap";

// const passcode_regex = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/);

const ChangePassword = () => {
  const [passState, setPassState] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp") || "";
  const { mutate: resetPassword, isLoading } = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({});

  const onFormSubmit = (formData) => {
    let submittedData = {
      email,
      otp: formData.otp,
      newPassword: formData.confirm_passcode,
    };
    resetPassword(submittedData);
    // console.log(submittedData);
    // console.log(formData);
  };
  const pwd = watch("passcode");

  const refreshToken = Cookies.get("refresh_token");
  const location = useLocation();

  if (refreshToken) {
    return <Navigate to={"/"} state={{ path: location.pathname }} replace />;
  }

  return (
    <>
      <Head title="Change-Password" />
      <Block className="nk-block-middle nk-auth-body  wide-xs">
        <div className="brand-logo pb-4 text-center">
          <Link to={"/"} className="logo-link">
            <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
            <img className="logo-dark logo-img logo-img-lg" src={Logo} alt="logo-dark" />
          </Link>
        </div>
        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h5">Change password</BlockTitle>
              <BlockDes>
                <p>Type in your new password</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Enter OTP
                </label>
              </div>
              <input
                type="number"
                id="otp"
                name="otp"
                {...register("otp", {
                  required: "This field is required",
                  minLength: { value: 4, message: "Invalid OTP format" },
                })}
                placeholder="Enter OTP"
                className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                defaultValue={otp}
              />
              {errors.otp && <span className="invalid">{errors.otp.message}</span>}
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Passcode
                </label>
              </div>
              <div className="form-control-wrap">
                <a
                  href="#password"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setPassState(!passState);
                  }}
                  className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                >
                  <Icon name="eye" className="passcode-icon icon-show"></Icon>

                  <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                </a>
                <input
                  type={passState ? "text" : "password"}
                  id="passcode"
                  name="passcode"
                  {...register("passcode", {
                    required: "This field is required",
                    // pattern: {
                    //   value: passcode_regex,
                    //   message:
                    //     "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character",
                    // },
                  })}
                  placeholder="Enter your passcode"
                  className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                />
                {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Confirm Passcode
                </label>
              </div>
              <div className="form-control-wrap">
                <a
                  href="#password"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setPassState(!passState);
                  }}
                  className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                >
                  <Icon name="eye" className="passcode-icon icon-show"></Icon>

                  <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                </a>
                <input
                  type={passState ? "text" : "password"}
                  id="confirm-passcode"
                  name="confirm_passcode"
                  {...register("confirm_passcode", {
                    required: "This is required",
                    validate: (value) => value === pwd || "Passcode do not match",
                  })}
                  placeholder="Enter passcode"
                  className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                />
                {errors.confirm_passcode && <span className="invalid">{errors.confirm_passcode.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <Button size="lg" className="btn-block" color="primary">
                {isLoading ? <Spinner size="sm" color="light" /> : "Proceed"}
              </Button>
            </div>
          </form>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};
export default ChangePassword;
