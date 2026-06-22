import React from "react";
import { Link } from "react-router-dom";
import SiteLogo from "../../images/logo.png";

const Logo = () => {
  return (
    <Link to={`/`} className="logo-link">
      <img className="logo-light logo-img" src={SiteLogo} alt="logo" />
      <img className="logo-dark logo-img" src={SiteLogo} alt="logo" />
      <img className="logo-small logo-img logo-img-small" src={SiteLogo} alt="logo" />
    </Link>
  );
};

export default Logo;
