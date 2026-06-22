import { useState } from "react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Alert, Form, Spinner } from "reactstrap";
import { useLogin } from "../../api/authentication";
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  Icon,
  PreviewCard,
} from "../../components/Component";
import Logo from "../../images/logo.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import { userState } from "../../atoms/userState";
import { useRecoilValue } from "recoil";

const Login = () => {
  const { mutate, isLoading, error } = useLogin();
  const [passState, setPassState] = useState(false);

  const onFormSubmit = (formData) => {
    let data = {
      email: formData.name,
      password: formData.passcode,
    };
    mutate(data);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const refreshToken = Cookies.get("refresh_token");
  const location = useLocation();

  if (refreshToken) {
    return <Navigate to={"/"} state={{ path: location.pathname }} replace />;
  }

  return (
    <>
      <Head title="Login" />
      <Block className="nk-block-middle nk-auth-body  wide-xs">
        <div className="brand-logo pb-4 text-center">
          <div className="logo-link">
            <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
            <img className="logo-dark logo-img logo-img-lg" src={Logo} alt="logo-dark" />
          </div>
        </div>

        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h4">Sign-In</BlockTitle>
              <BlockDes>
                <p>Access Qoreforma Admin using your email and passcode.</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          {error && (
            <div className="mb-3">
              <Alert color="danger" className="alert-icon">
                <Icon name="alert-circle" />{" "}
                {error?.message ? error?.message : error ? error : "An error occurred. Please try again."}
              </Alert>
            </div>
          )}
          <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="default-01">
                  Email or Username
                </label>
              </div>
              <div className="form-control-wrap">
                <input
                  type="text"
                  id="default-01"
                  {...register("name", { required: "This field is required" })}
                  placeholder="Enter your email address or username"
                  className="form-control-lg form-control"
                />
                {errors.name && <span className="invalid">{errors.name.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Passcode
                </label>
                <Link className="link link-primary link-sm" to={`/auth-reset`}>
                  Forgot Code?
                </Link>
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
                  id="password"
                  {...register("passcode", { required: "This field is required" })}
                  placeholder="Enter your passcode"
                  className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                />
                {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <Button size="lg" className="btn-block" type="submit" color="primary">
                {isLoading ? <Spinner size="sm" color="light" /> : "Sign in"}
              </Button>
            </div>
          </Form>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};
export default Login;
