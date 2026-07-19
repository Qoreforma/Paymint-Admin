import React from "react";
import { Link } from "react-router-dom";
import paymintLogo from "../../images/logo.png";

const Logo = () => {
  return (
    <Link to={`/`} className="logo-link">
      <img className="logo-light logo-img" src={paymintLogo} alt="logo" />
      <img className="logo-dark logo-img" src={paymintLogo} alt="logo" />
      <img className="logo-small logo-img logo-img-small" src={paymintLogo} alt="logo" />
    </Link>
  );
};

export default Logo;
