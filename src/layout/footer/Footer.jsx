import React from "react";
import { Row, Col } from "reactstrap";

const Footer = () => {
  return (
    <div className="nk-footer">
      <div className="container wide-lg">
        <Row className="g-3">
          <Col lg={6}>
            <div className="nk-block-content">
              <p className="text-soft">
                {" "}
                All rights Reserved (copyright) {new Date().getFullYear()} - Qoreforma Services Limited
              </p>
            </div>
          </Col>
          <Col lg={6}>
            <div className="nk-block-content">
              <p className="text-soft text-end">Powered by Soft-Web Digital</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default Footer;
