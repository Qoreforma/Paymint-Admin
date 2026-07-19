import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, CardText, CardTitle, Form, Label, Modal, ModalBody } from "reactstrap";
import { useDeleteReview, useGetProductReviews, useReplyReview } from "../../../../api/product/products";
import {
  Block,
  BlockBetween,
  BlockDes,
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
import Ratings from "../../../components/ratings/Ratings";
import LoadingSpinner from "../../../components/spinner";

const ProductReviewPage = () => {
  const navigate = useNavigate();
  let { productId } = useParams();

  //API CALLS HERE
  const { isLoading, data: productReviews } = useGetProductReviews(productId);
  const { isLoading: sending, mutate } = useReplyReview();

  const [reviewId, setReviewId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [replyModal, setReplyModal] = useState(false);

  const { mutate: deleteReview } = useDeleteReview(reviewId, productId);
  //form state
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    message: "",
  });
  const replyComment = (id, username) => {
    setReviewId(id);
    setUserName(username);
    setReplyModal(true);
  };
  // close modal
  const onFormCancel = () => {
    reset({ message: "" });
    setReplyModal(false);
    setReviewId(null);
    setUserName(null);
  };

  // REPLY COMMENT
  const onSubmit = (formData) => {
    let data = {
      reviewId,
      reply: formData.message,
    };

    mutate(data);
    onFormCancel();
  };

  //DELETE COMMENT
  const deleteAction = (id) => {
    setReviewId(id);
    deleteReview();
  };

  return (
    <>
      <Head title="Product Reviews"></Head>

      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Product Reviews
              </BlockTitle>
              <BlockDes className="text-soft">
                <ul className="list-inline">
                  <li>
                    Product ID: <span className="text-base">{productId}</span>
                  </li>
                </ul>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button
                color="light"
                outline
                className="bg-white d-none d-sm-inline-flex"
                onClick={() => navigate("/products")}
              >
                <Icon name="arrow-left"></Icon>
                <span>Back to Products</span>
              </Button>
              <a
                href="#back"
                onClick={(ev) => {
                  ev.preventDefault();
                  navigate("/products");
                }}
                className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
              >
                <Icon name="arrow-left"></Icon>
              </a>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <Card>
            <div className="card-aside-wrap" id="user-detail-block">
              <div className="card-content">
                <ul className="nav nav-tabs  nav-tabs-card">
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#details"
                      onClick={(ev) => {
                        ev.preventDefault();
                        navigate(`${import.meta.env.PUBLIC_URL}/products/product-details/${productId}`);
                      }}
                    >
                      <Icon name="file-text"></Icon>
                      <span>Details</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      href="#reviews"
                      onClick={(ev) => {
                        ev.preventDefault();
                        // navigate(`${import.meta.env.PUBLIC_URL}/product-reviews/${productId}`);
                      }}
                    >
                      <Icon name="star"></Icon>
                      <span>Reviews</span>
                    </a>
                  </li>
                </ul>

                <div className="card-inner">
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : productReviews?.totalDocuments === 0 ? (
                    <p>No reviews for this product</p>
                  ) : (
                    <Row className="gy-2">
                      {productReviews?.data?.map((item) => (
                        <Col lg={6} key={item._id}>
                          <Card className="card-bordered">
                            <CardHeader>
                              <div className="d-sm-flex align-items-sm-center justify-content-sm-between">
                                <h5 className="fs-16px mb-0">{item.username}</h5>
                                <Ratings value={item.productRating} />
                              </div>
                            </CardHeader>
                            <CardBody className="card-inner">
                              <div className="product-rating"></div>
                              <CardTitle tag="h5">{item.title}</CardTitle>
                              <CardText>{item.comment}</CardText>
                              <ul className="d-flex g-1 gx-2">
                                <li>
                                  <Button
                                    color="primary"
                                    type="button"
                                    onClick={() => replyComment(item._id, item.username)}
                                  >
                                    <Icon name="reply-fill" />
                                    <span> Reply</span>
                                  </Button>
                                </li>
                                <li>
                                  <Button className="border" type="button" onClick={() => deleteAction(item._id)}>
                                    <Icon name="trash" />
                                    <span> Delete</span>
                                  </Button>
                                </li>
                              </ul>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Block>
      </Content>

      <Modal isOpen={replyModal} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
        <ModalBody>
          <a href="#cancel" className="close">
            {" "}
            <Icon
              name="cross-sm"
              onClick={(ev) => {
                ev.preventDefault();
                onFormCancel();
              }}
            ></Icon>
          </a>
          <div className="nk-modal-head">
            <h4 className="nk-modal-title title">Replying to {userName ? userName : "Customer"}</h4>
          </div>
          <div className="nk-tnx-details mt-sm-3">
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col md="12">
                  <div className="form-group">
                    <Label className="form-label" htmlFor="fv-message">
                      Message
                    </Label>
                    <div className="form-control-wrap">
                      <textarea
                        type="textarea"
                        className="form-control form-control-sm"
                        id="fv-message"
                        {...register("message", {
                          required: true,
                        })}
                        placeholder="Write your message"
                        disabled={sending}
                      />
                      {errors.message && <span className="invalid">This field is required</span>}
                    </div>
                  </div>
                </Col>
                <Col md="12">
                  <div className="form-group mt-2">
                    <Button color="primary" size="md" disabled={sending}>
                      <span>{sending ? "sending" : "Send"}</span>
                      <Icon name="send-alt"></Icon>
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ProductReviewPage;
