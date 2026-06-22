import React, { useState } from "react";
import Cookies from "js-cookie";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle, Button, PreviewCard } from "../../components/Component";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useVerify2FA } from "../../api/authentication";
import Logo from "../../images/logo.png";

const VerifiyOTP = () => {
  const [passState, setPassState] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp") || "";
  const { mutate: verify } = useVerify2FA();

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
    };
    // resetPassword(submittedData);
    // console.log(submittedData);
    verify(submittedData);
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
      <Head title="Verifiy 2FA" />
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
              <BlockTitle tag="h5">Verify OTP</BlockTitle>
              <BlockDes>
                <p>Enter OTP sent to your email</p>
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
              <Button color="primary" size="lg" className="btn-block">
                Proceed
              </Button>
            </div>
          </form>
          <div className="form-note-s2 text-center pt-4">
            <Link to={`/auth-login`}>
              <strong>Return to login</strong>
            </Link>
          </div>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};
export default VerifiyOTP;
