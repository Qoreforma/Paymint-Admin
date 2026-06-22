import React, { useCallback, useEffect, useState } from "react";
import { Badge } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  Icon,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useGetGeneralOrderInfo, useGetOrderInfo } from "../../../../api/orders";
import { nairaState } from "../../../../atoms/nariaState";
import NoImage from "../../../../images/no-image-icon.png";
import { formatDate, formatter } from "../../../../utils/Utils";

const OrderDetails = () => {
  const navigate = useNavigate();
  let { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const orderDetailType = searchParams.get("type");

  const nairaValue = useRecoilValue(nairaState);

  const { data: orderInfo, isLoading } = useGetOrderInfo(orderId, orderDetailType === "single-order");
  const { data: generalOrderInfo, isLoading: fetching } = useGetGeneralOrderInfo(
    orderId,
    orderDetailType === "order-summary"
  );
  const [data, setData] = useState(null);

  // Status Colors
  const statusColor = useCallback((status) => {
    if (status === "pending" || status === "unpaid" || status === "refunded") {
      return "warning";
    } else if (status === "confirmed" || status === "shipped" || status === "transit") {
      return "info";
    } else if (status === "delivered" || status === "paid") {
      return "success";
    } else {
      return "danger";
    }
  }, []);

  useEffect(() => {
    if (orderInfo) {
      setData(orderInfo);
    } else if (generalOrderInfo) {
      setData(generalOrderInfo);
    } else {
      setData(null);
    }
  }, [orderId, isLoading, fetching, orderInfo, generalOrderInfo]);

  if (isLoading || fetching) {
    <h1>Loading...</h1>;
  }

  return (
    <React.Fragment>
      <Head title="Order Detail"></Head>
      {data && (
        <Content>
          <BlockHead>
            <BlockBetween className="g-3">
              <BlockHeadContent>
                <BlockTitle>
                  Order <strong className="text-primary small">#029209</strong>
                </BlockTitle>
              </BlockHeadContent>
              <BlockHeadContent>
                <Link
                  to={`${import.meta.env.PUBLIC_URL}/orders`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(-1);
                  }}
                >
                  <Button color="light" outline className="bg-white d-none d-sm-inline-flex">
                    <Icon name="arrow-left"></Icon>
                    <span>Back to orders</span>
                  </Button>
                </Link>
                <Link to={`${import.meta.env.PUBLIC_URL}/invoice-list`}>
                  <Button color="light" outline className="btn-icon bg-white d-inline-flex d-sm-none">
                    <Icon name="arrow-left"></Icon>
                  </Button>
                </Link>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>

          <Block>
            <div className="invoice">
              <div className="invoice-wrap">
                <div className="invoice-head">
                  <div className="invoice-contact">
                    <span className="overline-title">Shipping Info</span>
                    <div className="invoice-contact-info">
                      <h4 className="title">{data?.buyer?.buyerName}</h4>
                      <ul className="list-plain">
                        <li>
                          <Icon name="map-pin-fill"></Icon>
                          <span>
                            {data?.buyer?.shippingAddress?.address}
                            <br />
                            {data?.buyer?.shippingAddress?.postalCode}
                            <br />
                            {data?.buyer?.shippingAddress?.state}, {data?.buyer?.shippingAddress?.country}
                          </span>
                        </li>
                        <li>
                          <Icon name="emails-fill"></Icon>
                          <span>{data?.buyer?.email}</span>
                        </li>
                        <li>
                          <Icon name="call-fill"></Icon>
                          <span>{data?.buyer?.hotline}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="invoice-desc">
                    <h3 className="title">Order</h3>
                    <ul className="list-plain">
                      <li className="invoice-id">
                        <span>Order ID</span>:<span>020293</span>
                      </li>
                      <li className="invoice-date">
                        <span>Order Date</span>:<span>{formatDate(data?.createdAt)}</span>
                      </li>
                      <li className="invoice-date">
                        <span>Status</span>:{" "}
                        <Badge
                          className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                          color={statusColor(data?.status)}
                        >
                          {data?.status}
                        </Badge>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="invoice-bills">
                  <div className="table-responsive">
                    {data?.orders && (
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th className="w-150px">Item ID</th>
                            <th className="w-60">Description</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.orders?.map((item, idx) => {
                            const { itemId, productName, purchaseQuantity, purchaseAmount, pricePerUnit, currency } =
                              item.product;
                            return (
                              <tr key={idx}>
                                <td>{itemId}</td>
                                <td>{productName}</td>
                                {currency === "NGN" ? (
                                  <td>{formatter(currency).format(pricePerUnit)}</td>
                                ) : (
                                  <td>{formatter("NGN").format(pricePerUnit * nairaValue)}</td>
                                )}
                                <td>{purchaseQuantity}</td>
                                {currency === "NGN" ? (
                                  <td>{formatter(currency).format(purchaseAmount)}</td>
                                ) : (
                                  <td>{formatter("NGN").format(purchaseAmount * nairaValue)}</td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="2"></td>
                            <td colSpan="2">Subtotal</td>
                            <td>{formatter("NGN").format(data?.orderBreakdown.subTotal)}</td>
                          </tr>
                          <tr>
                            <td colSpan="2"></td>
                            <td colSpan="2">VAT</td>
                            <td>{formatter("NGN").format(data?.orderBreakdown.VAT)}</td>
                          </tr>
                          <tr>
                            <td colSpan="2"></td>
                            <td colSpan="2">Service Charge</td>
                            <td>{formatter("NGN").format(data?.orderBreakdown.serviceCharge)}</td>
                          </tr>
                          <tr>
                            <td colSpan="2"></td>
                            <td colSpan="2">Shipping Fee</td>
                            <td>{formatter("NGN").format(data?.orderBreakdown.shippingFee)}</td>
                          </tr>
                          <tr>
                            <td colSpan="2"></td>
                            <td colSpan="2">Grand Total</td>
                            <td>{formatter("NGN").format(data?.orderBreakdown.grandTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                    {/* <div className="nk-notes ff-italic fs-12px text-soft">
                      Invoice was created on a computer and is valid without the signature and seal.
                    </div> */}
                  </div>
                </div>

                {!Array.isArray(data?.product) && orderDetailType === "single-order" && (
                  <div className="nk-tnx-details mt-sm-3">
                    <div className="nk-modal-head mb-3">
                      <h5 className="title">Product Details</h5>
                    </div>
                    <Row className="gy-3">
                      <Col size={12}>
                        <span className="sub-text">Product Image</span>
                        <span className="tb-product">
                          <img
                            src={
                              data?.product?.productImages?.length > 0 && data?.product?.productImages[0] !== undefined
                                ? data?.product?.productImages[0]
                                : NoImage
                            }
                            alt="product"
                            width={50}
                            className="thumb"
                          />
                        </span>
                      </Col>

                      <Col lg={6}>
                        <span className="sub-text">Product name</span>
                        <span className="caption-text">{data?.product?.productName}</span>
                      </Col>
                      <Col lg={6}>
                        <span className="sub-text">Store name</span>
                        <span
                          className="caption-text text-primary name"
                          onClick={() =>
                            navigate(`${import.meta.env.PUBLIC_URL}/store-details/${data?.product?.storeId}`)
                          }
                        >
                          {data?.product?.storeName}
                        </span>
                      </Col>
                      <Col lg={6}>
                        <span className="sub-text">Price per Unit</span>
                        {data?.product?.currency === "NGN" ? (
                          <span className="caption-text">
                            {formatter(data?.product?.currency).format(data?.product?.pricePerUnit)}
                          </span>
                        ) : (
                          <span className="caption-text">
                            {formatter(data?.product?.currency).format(data?.product?.pricePerUnit)}{" "}
                            <span style={{ fontSize: "14px" }}>
                              &#40;{formatter("NGN", 2).format(data?.product?.pricePerUnit * nairaValue)}&#41;
                            </span>
                          </span>
                        )}
                      </Col>
                      <Col lg={6}>
                        <span className="sub-text">Purchased Quantity</span>
                        <span className="caption-text">{data?.product?.purchaseQuantity}</span>
                      </Col>
                      <Col lg={6}>
                        <span className="sub-text">Total Price</span>
                        {data?.product?.currency === "NGN" ? (
                          <span className="caption-text">
                            {formatter(data?.product?.currency).format(data?.product?.purchaseAmount)}
                          </span>
                        ) : (
                          <span className="caption-text">
                            {formatter(data?.product?.currency).format(data?.product?.purchaseAmount)}{" "}
                            <span style={{ fontSize: "14px" }}>
                              &#40;{formatter("NGN", 2).format(data?.product?.purchaseAmount * nairaValue)}&#41;
                            </span>
                          </span>
                        )}
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            </div>
          </Block>
        </Content>
      )}
    </React.Fragment>
  );
};
export default OrderDetails;
