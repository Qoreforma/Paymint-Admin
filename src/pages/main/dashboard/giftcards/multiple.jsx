import React, { useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Button,
  Card,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  DropdownItem,
  TabPane,
  Badge,
} from "reactstrap";
import {
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockDes,
  Icon,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  UserAvatar,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { useSearchParams, Link } from "react-router-dom";
import {
  tableNumbers,
  formatter,
  formatDateWithTime,
  findUpper,
  truncateText,
  formatDateWithHyphen,
} from "../../../../utils/Utils";
import { useGetRelatedGiftcard, useApproveGiftcard, useGetMultipleGiftcard } from "../../../../api/giftcard";
import LoadingSpinner from "../../../components/spinner";
import PartialApprovalModal from "./modals/partial";
import DeclineModal from "./modals/decline";
import ApproveModal from "./modals/approve";

const RelatedGiftCardListPage = () => {
  let { giftcardId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") ?? "giftcard";
  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;

  const [editedId, setEditedId] = React.useState(null);
  const [showPartial, setShowPartial] = React.useState(false);
  const [showDecline, setShowDecline] = React.useState(false);
  const [showApprove, setShowApprove] = React.useState(false);

  const [single, setSingle] = React.useState(true);

  const { isLoading, data: giftcard } = useGetMultipleGiftcard(giftcardId);
  const { mutate: approve } = useApproveGiftcard(editedId, giftcardId, single);

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "approved") {
      return "success";
    } else if (status === "s.approved") {
      return "info";
    } else if (status === "multiple") {
      return "secondary";
    } else {
      return "danger";
    }
  }, []);

  const Actions = ({ item }) => (
    <ul className="nk-tb-actions gx-1 my-n1">
      <li className="me-n1">
        <UncontrolledDropdown>
          <DropdownToggle
            tag="a"
            href="#more"
            onClick={(ev) => ev.preventDefault()}
            className="dropdown-toggle btn btn-icon btn-trigger"
          >
            <Icon name="more-h"></Icon>
          </DropdownToggle>
          <DropdownMenu end>
            <ul className="link-list-opt no-bdr">
              {item?.status === "multiple" ? (
                <li>
                  <DropdownItem
                    tag="a"
                    href="#edit"
                    onClick={(ev) => {
                      ev.preventDefault();
                      navigate(`/related-giftcards/${item?._id}`);
                    }}
                  >
                    <Icon name="eye"></Icon>
                    <span>View List</span>
                  </DropdownItem>
                </li>
              ) : (
                <li>
                  <DropdownItem
                    tag="a"
                    href="#edit"
                    onClick={(ev) => {
                      ev.preventDefault();
                      navigate(`/giftcards-details/${item?._id}`);
                    }}
                  >
                    <Icon name="eye"></Icon>
                    <span>View</span>
                  </DropdownItem>
                </li>
              )}
              {(item?.status === "pending" || item?.status === "archived") && (
                <>
                  <li>
                    <DropdownItem
                      tag="a"
                      href="#edit"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setEditedId(item?._id);
                        setShowApprove(true);
                      }}
                    >
                      <Icon name="check"></Icon>
                      <span>Approve</span>
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      tag="a"
                      href="#edit"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setEditedId(item?._id);
                        setShowPartial(true);
                      }}
                    >
                      <Icon name="check"></Icon>
                      <span>Second Approval</span>
                    </DropdownItem>
                  </li>

                  <li>
                    <DropdownItem
                      tag="a"
                      href="#edit"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setEditedId(item?._id);
                        setShowDecline(true);
                      }}
                    >
                      <Icon name="na"></Icon>
                      <span>Decline</span>
                    </DropdownItem>
                  </li>
                </>
              )}
            </ul>
          </DropdownMenu>
        </UncontrolledDropdown>
      </li>
    </ul>
  );

  return (
    <React.Fragment>
      <Head title="Assets"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockDes className="text-soft"></BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button color="light" outline className="bg-white d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                <Icon name="arrow-left"></Icon>
                <span>Back</span>
              </Button>
              <a
                href="#back"
                onClick={(ev) => {
                  ev.preventDefault();
                  navigate(-1);
                }}
                className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
              >
                <Icon name="arrow-left"></Icon>
              </a>
            </BlockHeadContent>
          </BlockBetween>
          {/* <p>Basic info, like your name and address, that you use on Nio Platform.</p> */}
        </BlockHead>
        <Card>
          <div className="card-aside-wrap" id="user-detail-block">
            <div className="card-content">
              <Nav tabs className="nav nav-tabs nav-tabs-card">
                <NavItem>
                  <NavLink
                    tag="a"
                    href="#tab"
                    className={activeTab === "giftcard" ? "active" : ""}
                    onClick={(ev) => {
                      ev.preventDefault();
                      setSearchParams({ tab: "giftcard" });
                    }}
                  >
                    Multiple Giftcard Transactions
                  </NavLink>
                </NavItem>

                <NavItem className="nav-item nav-item-trigger">
                  <Button
                    // outline={storeDetail?.store?.adminAction !== "approved"}
                    onClick={() => {
                      setEditedId(null);
                      setSingle(false);
                      approve();
                    }}
                    className="me-2"
                    color={"success"}
                  >
                    <span>Approve All</span>
                  </Button>

                  <Button
                    className="ccap me-2"
                    onClick={() => {
                      setEditedId(null);
                      setSingle(false);
                      setShowPartial(true);
                    }}
                    color={"primary"}
                  >
                    <span>Second Approve all</span>
                  </Button>
                  <Button
                    className="ccap"
                    onClick={() => {
                      setEditedId(null);
                      setSingle(false);
                      setShowDecline(true);
                    }}
                    color={"danger"}
                  >
                    <span>Decline all</span>
                  </Button>
                </NavItem>
              </Nav>
              <div className="card-inner">
                {/* {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div> */}
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <TabContent activeTab={"giftcard"}>
                    <TabPane tabId="giftcard">
                      <>
                        <DataTableBody className="is-compact">
                          <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                            <DataTableRow>
                              <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                            </DataTableRow>
                            <DataTableRow size="sm">
                              <span className="tb-tnx-head bg-white text-secondary">Fullname</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-tnx-head bg-white text-secondary">Reference No</span>
                            </DataTableRow>
                            <DataTableRow size="md">
                              <span className="tb-tnx-head bg-white text-secondary">Amount</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-tnx-head bg-white text-secondary">Date</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-tnx-head bg-white text-secondary">Type</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-tnx-head bg-white text-secondary">Category</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span className="tb-tnx-head bg-white text-secondary">Status</span>
                            </DataTableRow>

                            <DataTableRow className="nk-tb-col-tools">
                              <ul className="nk-tb-actions gx-1 my-n1">
                                <li className="me-n1">
                                  <UncontrolledDropdown>
                                    <DropdownToggle
                                      tag="a"
                                      href="#toggle"
                                      onClick={(ev) => ev.preventDefault()}
                                      className="dropdown-toggle btn btn-icon btn-trigger disabled"
                                    >
                                      <Icon name="more-h"></Icon>
                                    </DropdownToggle>
                                  </UncontrolledDropdown>
                                </li>
                              </ul>
                            </DataTableRow>
                          </DataTableHead>
                          {giftcard?.length > 0 &&
                            giftcard?.map((item, index) => {
                              return (
                                <DataTableItem key={item?._id} className="text-secondary">
                                  <DataTableRow>
                                    <span> {tableNumbers(currentPage, itemsPerPage) + index + 2}</span>
                                  </DataTableRow>
                                  <DataTableRow size="sm" className="text-primary fw-bold">
                                    <Link to={`/user-details/${item?.userId?._id}`}>
                                      <div className="user-card">
                                        <UserAvatar
                                          theme={item?.userId?.avatar}
                                          className="xs"
                                          text={findUpper(`${item?.userId?.firstname} ${item?.userId?.lastname}`)}
                                          image={item?.userId?.avatar}
                                        />
                                        <div className="user-name">
                                          <span className="tb-lead ccap">
                                            {truncateText(
                                              `${item?.userId?.firstname} ${item?.userId?.lastname}`,
                                              20,
                                            )}{" "}
                                          </span>
                                          <p className="text-primary fw-normal fs-12px">
                                            {truncateText(item?.userId?.email, 20)}
                                          </p>
                                        </div>
                                      </div>
                                    </Link>
                                  </DataTableRow>
                                  <DataTableRow>
                                    <span>{item.reference}</span>
                                  </DataTableRow>
                                  <DataTableRow>
                                    <span>{formatter("NGN").format(item.payableAmount)}</span>
                                  </DataTableRow>
                                  <DataTableRow>
                                    <span>{formatDateWithHyphen(item.createdAt)}</span>
                                  </DataTableRow>
                                  <DataTableRow>
                                    <span className="ccap"> {item.tradeType}</span>
                                  </DataTableRow>
                                  <DataTableRow>
                                    <span className="ccap"> {item?.giftCardId?.categoryId?.name}</span>
                                  </DataTableRow>
                                  <DataTableRow>
                                    <span className={`dot bg-${statusColor(item.status)} d-sm-none`}></span>
                                    <Badge
                                      className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
                                      color={statusColor(item.status)}
                                    >
                                      <span className="ccap">
                                        {item?.status === "second_approval" ? "S.Approval" : item?.status}
                                      </span>
                                    </Badge>
                                  </DataTableRow>
                                  <DataTableRow className="nk-tb-col-tools">
                                    <Actions item={item} />
                                  </DataTableRow>
                                </DataTableItem>
                              );
                            })}
                        </DataTableBody>
                      </>
                    </TabPane>
                    <ApproveModal modal={showApprove} closeModal={setShowApprove} editedId={editedId} />

                    <PartialApprovalModal
                      modal={showPartial}
                      closeModal={setShowPartial}
                      editedId={editedId}
                      giftcardId={giftcardId}
                      single={single}
                    />
                    <DeclineModal
                      modal={showDecline}
                      closeModal={setShowDecline}
                      editedId={editedId}
                      giftcardId={giftcardId}
                      single={single}
                    />
                  </TabContent>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default RelatedGiftCardListPage;
