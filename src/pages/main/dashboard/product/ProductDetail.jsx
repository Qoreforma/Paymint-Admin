import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Slider from "react-slick";
import TextTruncate from "react-text-truncate";
import { Badge, Card, Modal, ModalBody } from "reactstrap";
import { useRecoilValue } from "recoil";
import { useGetProductInfo } from "../../../../api/product/products";
import { nairaState } from "../../../../atoms/nariaState";
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
import NoImage from "../../../../images/no-image-icon.png";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatter } from "../../../../utils/Utils";
import Ratings from "../../../components/ratings/Ratings";
import LoadingSpinner from "../../../components/spinner";

const sliderSettingsDefault = {
  slidesToShow: 3,
  slidesToScroll: 1,
  centerMode: false,
  slide: null,
  arrows: false,
  swipeToSlide: true,
  focusOnSelect: true,
  className: "slider-init slider-nav",
};
const ProductDetailPage = () => {
  let { productId } = useParams();
  const navigate = useNavigate();
  const { isLoading, data: productDetail } = useGetProductInfo(productId);
  const {
    name,
    storeName,
    category,
    subCategory,
    description,
    type,
    brand,
    color,
    size,
    quantity,
    weight,
    price,
    currency,
    rating,
    adminAction,
  } = productDetail ?? "";

  const [sideBar, setSidebar] = useState(false);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const [sliderData, setSliderData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState({});
  const [viewModal, setViewModal] = useState(false);

  const nairaValue = useRecoilValue(nairaState);

  useEffect(() => {
    if (productDetail && productDetail.productImages) {
      let sliderImages = productDetail?.productImages?.map((item, idx) => ({ id: idx, img: item }));
      setSliderData(sliderImages);
      setCurrentSlide(sliderImages[0]);
    }
  }, [productDetail]);

  // changes slides
  const slideChange = (index) => {
    var product = sliderData.find((item) => item.id === index);
    setCurrentSlide(product);
  };

  const slider1 = useRef(null);
  const slider2 = useRef(null);

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  // function to toggle sidebar
  const toggle = () => {
    setSidebar(!sideBar);
  };

  const resize = (imageUrl, size, pos) => {
    if (typeof pos === "undefined") {
      pos = 0;
    }
    if (typeof size == "undefined") {
      size = "";
    }
    return imageUrl?.slice(0, pos) + size + imageUrl?.slice(pos);
  };

  useEffect(() => {
    sideBar ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  }, [sideBar]);

  const statusColor = useCallback((status) => {
    if (status === "approved") {
      return "success";
    } else {
      return "warning";
    }
  }, []);

  const slidesNumber = useCallback(() => {
    if (sliderData.length === 2) {
      return 2;
    } else return 3;
  }, [sliderData]);

  return (
    <>
      <Head title="Product Details"></Head>

      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Product Details
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
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="card-aside-wrap" id="user-detail-block">
                <div className="card-content">
                  <ul className="nav nav-tabs nav-tabs-mb-icon nav-tabs-card">
                    <li className="nav-item">
                      <a
                        className="nav-link active"
                        href="#details"
                        onClick={(ev) => {
                          ev.preventDefault();
                        }}
                      >
                        <Icon name="file-text"></Icon>
                        <span>Details</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        href="#reviews"
                        onClick={(ev) => {
                          ev.preventDefault();
                          navigate(`${import.meta.env.PUBLIC_URL}/products/product-reviews/${productId}`);
                        }}
                      >
                        <Icon name="star"></Icon>
                        <span>Reviews</span>
                      </a>
                    </li>
                  </ul>

                  <div className="card-inner">
                    {productDetail && sliderData && (
                      <Row>
                        <Col lg={6}>
                          <div className="product-gallery me-xl-1 me-xxl-5">
                            <Slider
                              asNavFor={nav2}
                              ref={slider1}
                              arrows={false}
                              slidesToShow={1}
                              slidesToScroll={1}
                              initialSlide={currentSlide?.id}
                              className="slider-init"
                              prevArrow
                            >
                              <div className="slider-item rounded" key={currentSlide?.id}>
                                <img
                                  src={
                                    currentSlide ? resize(currentSlide.img, "w_591,h_591,c_fill,g_auto/", 50) : NoImage
                                  }
                                  // src={currentSlide ? currentSlide?.img : NoImage}
                                  alt="product images"
                                />
                              </div>
                            </Slider>

                            {sliderData?.length > 1 && (
                              <Slider
                                asNavFor={nav1}
                                ref={slider2}
                                afterChange={(newIndex) => slideChange(newIndex)}
                                initialSlide={currentSlide.id}
                                responsive={[
                                  { breakpoint: 1539, settings: { slidesToShow: slidesNumber() } },
                                  { breakpoint: 768, settings: { slidesToShow: slidesNumber() } },
                                  { breakpoint: 420, settings: { slidesToShow: 1 } },
                                ]}
                                {...sliderSettingsDefault}
                              >
                                {sliderData?.map((item) => {
                                  return (
                                    <div
                                      className={`slider-item ${currentSlide.id === item.id ? "slick-current" : ""}`}
                                      key={item.id}
                                    >
                                      <div className="thumb">
                                        <img src={resize(item.img, "w_150,h_150,c_thumb/", 50)} alt="" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </Slider>
                            )}
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="product-info mt-5 me-xl-5">
                            <h4 className="product-price text-primary">
                              {formatter(currency).format(price)}{" "}
                              {currency === "USD" && (
                                <span style={{ fontSize: "18px" }}>
                                  &#40;{formatter("NGN", 2).format(price * nairaValue)}&#41;
                                </span>
                              )}
                            </h4>

                            <h2 className="product-title text-capitalize">{name}</h2>
                            <p className="fs-18px">
                              <span>Seller: </span>
                              {storeName}
                            </p>
                            <div className="product-rating">
                              <Ratings value={rating?.averageRating} />
                              <div className="amount">({rating?.totalReview} reviews)</div>
                            </div>
                            <div className="product-excrept text-soft">
                              <TextTruncate
                                line={5}
                                element="p"
                                truncateText="..."
                                text={description}
                                textTruncateChild={
                                  <span
                                    onClick={() => {
                                      setViewModal(true);
                                    }}
                                    className="fw-bold"
                                  >
                                    Read on
                                  </span>
                                }
                              />
                            </div>
                            <div className="product-meta">
                              <ul className="d-flex gx-5">
                                <li>
                                  <div className="fs-14px text-muted">Product Type</div>
                                  <div className="fs-16px fw-bold text-secondary text-capitalize">{type}</div>
                                </li>
                                <li>
                                  <div className="fs-14px text-muted">Brand</div>
                                  <div className="fs-16px fw-bold text-secondary">{brand}</div>
                                </li>
                                <li>
                                  <div className="fs-14px text-muted">Status</div>
                                  <div className="fs-16px fw-bold text-secondary info">
                                    <Badge
                                      className="badge-sm badge-dot has-bg  d-sm-inline-flex text-capitalize"
                                      color={statusColor(adminAction)}
                                    >
                                      {adminAction}
                                    </Badge>
                                  </div>
                                </li>
                              </ul>
                            </div>
                            <div className="product-meta">
                              <ul className="d-flex gx-5">
                                <li>
                                  <div className="fs-14px text-muted">Category</div>
                                  <div className="fs-14px fw-bold text-secondary">{category}</div>
                                </li>
                                <li>
                                  <div className="fs-14px text-muted">Sub Category</div>
                                  <div className="fs-14px fw-bold text-secondary">{subCategory}</div>
                                </li>
                              </ul>
                            </div>

                            <div className="product-meta">
                              <ul className="d-flex g-3 gx-5">
                                {type === "physical" || type === "affiliate" ? (
                                  <li>
                                    <div className="fs-14px text-muted">Quantity</div>
                                    <div className="fs-14px fw-bold text-secondary">{quantity}</div>
                                  </li>
                                ) : null}
                                {type === "physical" && (
                                  <li>
                                    <div className="fs-14px text-muted">Weight</div>
                                    <div className="fs-14px fw-bold text-secondary">{weight}</div>
                                  </li>
                                )}
                              </ul>
                            </div>
                            <div className="product-meta">
                              <Row className="d-flex">
                                {type === "physical" && (
                                  <Col>
                                    <div className="fs-14px text-muted">Size(s)</div>
                                    <ul className="d-flex gx-1">
                                      {size?.map((item, idx) => (
                                        <li key={idx} className="fs-14px fw-bold text-secondary">
                                          {item}
                                          {idx !== size.length - 1 ? <span>,</span> : null}
                                        </li>
                                      ))}
                                    </ul>
                                  </Col>
                                )}
                              </Row>
                            </div>
                            <div className="product-meta">
                              {type === "physical" && (
                                // <Col>
                                <>
                                  <div className="fs-14px text-muted">Color</div>
                                  <ul className="d-flex gx-1">
                                    {color?.map((item, idx) => (
                                      <li key={idx} className="fs-14px fw-bold text-secondary text-capitalize">
                                        {item}
                                        {idx !== color?.length - 1 ? <span>,</span> : null}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                                // </Col>
                              )}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    )}

                    <div className="nk-divider divider md"></div>
                  </div>
                </div>

                {sideBar && <div className="toggle-overlay" onClick={() => toggle()}></div>}
              </div>
            )}
          </Card>
        </Block>
      </Content>

      {/* VIEW PRODUCT DESCRIPTION */}
      <Modal isOpen={viewModal} toggle={() => setViewModal(false)} className="modal-dialog-centered" size="md">
        <ModalBody>
          <a href="#cancel" className="close">
            {" "}
            <Icon
              name="cross-sm"
              onClick={(ev) => {
                ev.preventDefault();
                setViewModal(false);
              }}
            ></Icon>
          </a>
          <div className="nk-modal-head">
            <h4 className="nk-modal-title title">Product description</h4>
            <p>{description}</p>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
export default ProductDetailPage;
