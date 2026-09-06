import React from "react";
import { Row, Col } from "reactstrap";

const Footer = () => {
  return (
    <div className="nk-footer" style={{
      display: 'block',
      position: "absolute",
      bottom: 0,
      right: 0,
      zIndex: 1000,
      marginTop: 20,
      width: "80%",
    }}>
      <div className="container wide-lg" style={{

      }}>
        <Row className="g-3">
          <Col lg={6}>
            <div className="nk-block-content">
              <p className="text-soft">
                {" "}
                All rights Reserved (copyright) {new Date().getFullYear()} - paymint Services Limited
              </p>
            </div>
          </Col>
          <Col lg={6}>
            <div className="nk-block-content">
              <p className="text-soft text-end">Powered by Qoreforma Solution Limited</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default Footer;
