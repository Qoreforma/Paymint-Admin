import React from "react";
import { Col, Row } from "../../../../components/Component";

import StoreOrdersCharts from "../charts/TotalOrders";
import StoreStats from "../charts/StoreStats";
const StoreStatisticsPage = ({ data }) => {
  return (
    <>
      <Row>
        <Col md="6">
          <StoreStats data={data} />
        </Col>
        <Col md="6">
          <StoreOrdersCharts orderData={data} />
        </Col>
      </Row>
    </>
  );
};

export default StoreStatisticsPage;
