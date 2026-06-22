import React, { useState } from "react";
import { Modal } from "reactstrap";

const ImageContainer = ({ img, sm }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen(!open);
  };
  return (
    <a
      className="gallery-image popup-image"
      onClick={(ev) => {
        ev.preventDefault();
        toggle();
      }}
      href="#gallery"
    >
      <img
        className="rounded-top"
        src={img}
        alt=""
        style={{ height: sm ? "50px" : "150px", width: sm ? "70px" : "100px", objectFit: "cover" }}
      />
      <Modal isOpen={open} toggle={toggle} size="large">
        <button type="button" className="mfp-close" onClick={toggle}>
          ×
        </button>
        <div>
          <img className="w-100" style={{ height: "400px", objectFit: "contain" }} src={img} alt="" />
        </div>
      </Modal>
    </a>
  );
};

export default ImageContainer;
