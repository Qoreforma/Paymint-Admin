import React from "react";
import { Col, Row } from "../../components/Component";

const AuthFooter = () => {
  return (
    <div className="nk-footer nk-auth-footer-full">
      <div className="container wide-lg">
        <Row className="g-3">
          <Col>
            <div className="nk-block-content text-center text-lg-end">
              <p className="text-soft">Powered by Qoreforma Solution Limited.</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default AuthFooter;
