import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Badge,
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import {
  useDeleteCryptoAssets,
  useGetAutoCryptoProvs,
  useGetCryptoAssets,
  useTogglePurchaseActivation,
  useToggleSaleActivation,
} from "../../../../api/crypto";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
  Row,
  UserAvatar,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import {
  findUpper,
  formatDate,
  formatDateWithHyphen,
  formatDateWithTime,
  formatter,
  tableNumbers,
} from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import AssetsModal from "./modals/assets";
import SortToolTip from "../tables/SortTooltip";
import MultipleRateModal from "./modals/multiple-products";
import { set } from "react-hook-form";
import ConfirmUpdateModal from "./modals/confirm-multiple-updates";

const AssetTypeFilterOptions = [
  {
    name: "Type",
    options: [
      { value: "manual", label: "Manual" },
      { value: "now-payment", label: "Now Payment" },
    ],
  },
];

const CryptoAssetsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState([]);
  const [multiple, setMultiple] = useState(false);
  const [showMultiple, setShowMultiple] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [rateUpdateType, setRateUpdateType] = useState("");
  const [statusType, setStatusType] = useState("");
  const [statusUpdateType, setStatusUpdateType] = useState("");
  const [editedId, setEditedId] = useState();
  const navigate = useNavigate();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const assetType = searchParams.get("assetType") ?? "";
  const type = "sell";
  // const { isLoading, data, error } = useGetAllProducts(currentPage, itemsPerPage, search, type);
  const { isLoading, data, error } = useGetCryptoAssets(currentPage, itemsPerPage, search, assetType);
  const { mutate: deleteAsset } = useDeleteCryptoAssets(editedId);
  const { mutate: toggleSale } = useToggleSaleActivation(editedId);
  const { mutate: togglePurchase } = useTogglePurchaseActivation(editedId);

  const { data: autoProvData } = useGetAutoCryptoProvs();

  const [onSearch, setonSearch] = useState(false);

  const [filters, setfilters] = useState({});
  const [sm, updateSm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // const [showDetails, setShowDetails] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    code: "",
    icon: "",
    buy_rate: "",
    sell_rate: "",
    saleTerm: "",
    purchaseTerm: "",
    id: "",
    networks: [],
    network_id: [],
    buy_min_amount: "",
    buy_max_amount: "",
    sell_min_amount: "",
    sell_max_amount: "",
  });

  const onEditClick = async (id, type) => {
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        const selectedNetworks = item?.networks?.map((item) => ({
          label: item?.name,
          value: item?.name,
          id: item?._id,
          address: item?.platformDepositAddress,
        }));

        setEditFormData({
          name: item?.name,
          code: item?.code,
          icon: item?.icon,
          buy_rate: item?.buyRate,
          sell_rate: item?.sellRate,
          saleTerm: item?.saleTerm,
          purchaseTerm: item?.purchaseTerm,
          id: item?._id,
          networks: selectedNetworks,
          buy_min_amount: item?.buyMinAmount,
          buy_max_amount: item?.buyMaxAmount,
          sell_min_amount: item?.sellMinAmount,
          sell_max_amount: item?.sellMaxAmount,
        });
        if (type === "edit") {
          setShowModal(true);
        } else {
          setShowView(true);
        }
      }
    });
  };

  // function to change the selected property of an item
  const onSelectChange = (e, id) => {
    if (e.currentTarget.checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((a) => a !== id));
    }
  };

  const handleSelectMultiple = () => {
    if (!multiple) {
      setMultiple(true);
    } else {
      setSelected([]);
      setMultiple(false);
    }
  };

  // console.log(editFormData);

  // function to filter data
  // const filterData = useCallback(() => {
  //   return;
  // }, []);

  // Change Page
  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  const statusColor = useCallback((status) => {
    if (status === "pending") {
      return "warning";
    } else if (status === "approved") {
      return "success";
    } else if (status === "multiple") {
      return "info";
    } else {
      return "danger";
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setShowView(false);
    setEditFormData({
      name: "",
      admins: [],
      countries: [],
      icon: "",
      saleTerm: "",
      id: "",
    });
    setShowMultiple(false);
    setSelected([]);
    setMultiple(false);
    setShowStatusModal(false);
    setRateUpdateType("");
    setStatusType("");
    setStatusUpdateType("");
  };

  //scroll off when sidebar shows
  // useEffect(() => {
  //   view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  // }, [view.add]);

  return (
    <React.Fragment>
      <Head title="Crypto Assets"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Crypto Assets</BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                  onClick={() => updateSm(!sm)}
                >
                  <Icon name="menu-alt-r"></Icon>
                </Button>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    <li className="nk-block-tools-opt">
                      <Button color="primary" onClick={() => setShowModal(true)}>
                        <Icon name="plus"></Icon>
                        <span>Add New Assets</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* PRODUCT TABLE HERE */}
        <Block>
          <Block className={"mb-2"}>
            <Button
              onClick={handleSelectMultiple}
              color={!multiple ? "primary" : "light"}
              size={"sm"}
              outline={multiple}
              className={`${!multiple ? "" : "bg-white"} btn-round`}
            >
              {multiple ? "Cancel" : "Select Multiple"}
            </Button>

            {selected?.length > 0 && (
              <>
                <Button
                  className={"btn-round ms-2"}
                  onClick={() => {
                    setShowMultiple(true);
                    setRateUpdateType("sell");
                  }}
                  color={"primary"}
                  size={"sm"}
                >
                  Update Sell Rate
                </Button>
                <Button
                  className={"btn-round ms-2"}
                  onClick={() => {
                    setShowMultiple(true);
                    setRateUpdateType("buy");
                  }}
                  color={"primary"}
                  size={"sm"}
                >
                  Update Buy Rate
                </Button>
                <Button
                  className={"btn-round ms-2"}
                  onClick={() => {
                    setShowStatusModal(true);
                    setStatusType("sales");
                    setStatusUpdateType("activate");
                  }}
                  color={"primary"}
                  size={"sm"}
                >
                  Activate Sales
                </Button>
                <Button
                  className={"btn-round bg-white ms-2"}
                  onClick={() => {
                    setShowStatusModal(true);
                    setStatusType("sales");
                    setStatusUpdateType("deactivate");
                  }}
                  outline={true}
                  color={"light"}
                  size={"sm"}
                >
                  Deactivate Sales
                </Button>
                <Button
                  className={"btn-round ms-2"}
                  onClick={() => {
                    setShowStatusModal(true);
                    setStatusType("purchase");
                    setStatusUpdateType("activate");
                  }}
                  color={"primary"}
                  size={"sm"}
                >
                  Activate Purchase
                </Button>
                <Button
                  className={"btn-round bg-white ms-2"}
                  onClick={() => {
                    setShowStatusModal(true);
                    setStatusType("purchase");
                    setStatusUpdateType("deactivate");
                  }}
                  outline={true}
                  color={"light"}
                  size={"sm"}
                >
                  Deactivate Purchase
                </Button>
              </>
            )}
          </Block>
          <Card>
            <Nav tabs className="nav nav-tabs nav-tabs-card">
              <NavItem>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={assetType === "" ? "active" : ""}
                  onClick={(ev) => {
                    closeModal();
                    ev.preventDefault();
                    setSearchParams({ assetType: "", page: 1, limit: itemsPerPage });
                  }}
                >
                  Manual
                </NavLink>
              </NavItem>
              {autoProvData?.data?.map((item, index) => (
                <NavItem key={index}>
                  <NavLink
                    tag="a"
                    href="#tab"
                    className={assetType === item?._id ? "active" : ""}
                    onClick={(ev) => {
                      ev.preventDefault();
                      closeModal();
                      setSearchParams({ assetType: item?._id, page: 1, limit: itemsPerPage });
                    }}
                  >
                    {item.name}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">Crypto Assets</h5>
                </div>
                <div className="card-tools me-n1">
                  <ul className="btn-toolbar gx-1">
                    <li>
                      <Button
                        href="#search"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setonSearch(true);
                        }}
                        className="btn-icon search-toggle toggle-search"
                      >
                        <Icon name="search"></Icon>
                      </Button>
                    </li>
                    <li className="btn-toolbar-sep"></li>
                    {/* <li>
                      <FilterOptions options={giftcardFilterOptions} />
                    </li> */}
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                          <Icon name="setting"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end className="dropdown-menu-xs">
                          <SortToolTip />
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>
                  </ul>
                </div>
                {/* Search component */}
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="asset name" />
              </div>
            </div>
            <div className="card-inner-group">
              <div className="card-inner p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : data?.pagination?.total > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow>
                          {multiple ? (
                            <div className="custom-control custom-control-sm custom-checkbox notext">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                checked={selected?.length === data?.data?.length}
                                id={"select-all"}
                                key={Math.random()}
                                onChange={(e) => {
                                  const allIds = data?.data?.map((item) => item?._id);
                                  console.log({ allIds });
                                  setSelected(allIds.length === selected.length ? [] : allIds);
                                }}
                              />
                              <label className="custom-control-label" htmlFor={"select-all"}></label>
                            </div>
                          ) : (
                            <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                          )}
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Asset Name</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Code</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Sell Rate</span>
                        </DataTableRow>{" "}
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Buy Rate</span>
                        </DataTableRow>{" "}
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Sales Status</span>
                        </DataTableRow>{" "}
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Purchase Status</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Date</span>
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
                      {data?.data?.map((item, index) => {
                        return (
                          <DataTableItem key={item.id} className="text-secondary">
                            <DataTableRow>
                              {multiple ? (
                                <div className="custom-control custom-control-sm custom-checkbox notext">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    checked={selected.includes(item?._id)}
                                    id={item?._id + "uid1"}
                                    key={Math.random()}
                                    onChange={(e) => onSelectChange(e, item?._id)}
                                  />
                                  <label className="custom-control-label" htmlFor={item?._id + "uid1"}></label>
                                </div>
                              ) : (
                                <span> {tableNumbers(currentPage, itemsPerPage) + index + 1}</span>
                              )}
                            </DataTableRow>
                            <DataTableRow>
                              <div className="user-card">
                                <UserAvatar
                                  theme={item?.icon}
                                  className="sm"
                                  text={findUpper(`${item?.name}`)}
                                  image={item?.icon}
                                />
                                <div className="user-name">
                                  <span className="tb-lead ccap">{item?.name}</span>
                                </div>
                              </div>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item?.code}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{formatter("NGN").format(item?.sellRate)}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{formatter("NGN").format(item?.buyRate)}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <div className="custom-control-sm custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  name={item.name}
                                  checked={item?.saleActivated}
                                  onClick={() => {
                                    setEditedId(item?._id);
                                    toggleSale({ saleActivated: !item?.saleActivated });
                                  }}
                                  id={item?._id}
                                />
                                <label className="custom-control-label" htmlFor={item?._id}>
                                  <span className={`ccap fw-medium ${item?.saleActivated ? "text-success" : ""}`}>
                                    {item?.saleActivated ? "Activated" : "Not Active"}
                                  </span>
                                </label>
                              </div>
                            </DataTableRow>
                            <DataTableRow>
                              <div className="custom-control-sm custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  name={item.name}
                                  checked={item?.purchaseActivated}
                                  onClick={() => {
                                    setEditedId(item?._id);
                                    togglePurchase({ purchaseActivated: !item?.purchaseActivated });
                                  }}
                                  id={item?.name}
                                />
                                <label className="custom-control-label" htmlFor={item?.name}>
                                  <span className={`ccap fw-medium ${item?.purchaseActivated ? "text-success" : ""}`}>
                                    {item?.purchaseActivated ? "Activated" : "Not Active"}
                                  </span>
                                </label>
                              </div>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{formatDateWithHyphen(item?.createdAt)}</span>
                            </DataTableRow>

                            <DataTableRow className="nk-tb-col-tools">
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
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              onEditClick(item?._id);
                                            }}
                                          >
                                            <Icon name="eye"></Icon>
                                            <span>View</span>
                                          </DropdownItem>
                                        </li>
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditedId(item?._id);
                                              onEditClick(item?._id, "edit");
                                              // onEditClick(item.id);
                                            }}
                                          >
                                            <Icon name="edit"></Icon>
                                            <span>Edit</span>
                                          </DropdownItem>
                                        </li>
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            className="text-danger"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditedId(item?._id);
                                              deleteAsset();
                                              // onEditClick(item.id, "edit");

                                              // onEditClick(item.id);
                                            }}
                                          >
                                            <Icon name="trash"></Icon>
                                            <span>Delete</span>
                                          </DropdownItem>
                                        </li>
                                      </ul>
                                    </DropdownMenu>
                                  </UncontrolledDropdown>
                                </li>
                              </ul>
                            </DataTableRow>
                          </DataTableItem>
                        );
                      })}
                    </DataTableBody>
                    <div className="card-inner">
                      {data?.pagination?.total > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={data?.pagination?.total}
                          paginate={paginate}
                          currentPage={Number(currentPage)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "1rem" }}>
                    <span className="text-silent">No transaction record found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        {/* View Modal*/}
        <Modal isOpen={showView} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a href="#cancel" className="close">
              {" "}
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  closeModal();
                }}
              ></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">View Asset Details</h5>
              <div className="mt-4">
                <Row className="gy-3">
                  <Col>
                    <span className="sub-text">Asset Icon</span>
                    <span className="caption-text text-primary ccap">
                      <UserAvatar
                        theme={editFormData.icon}
                        className="md"
                        text={editFormData?.name && findUpper(`${editFormData?.name}`)}
                        image={editFormData.icon}
                      ></UserAvatar>
                    </span>
                  </Col>
                  <Col>
                    <span className="sub-text">Asset name</span>
                    <span className="caption-text text-primary ccap">{editFormData.name}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Asset Code</span>
                    <span className="caption-text">{editFormData?.code}</span>
                  </Col>

                  <Col lg={6}>
                    <span className="sub-text">Buy Rate</span>
                    <span className="caption-text">{editFormData?.buy_rate}</span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Sell Rate</span>
                    <span className="caption-text ccap">{editFormData?.sell_rate}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Sale Term</span>
                    <span className="caption-text ccap">{editFormData?.saleTerm || "N/A"}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Purchase Term</span>
                    <span className="caption-text ccap">{editFormData?.purchaseTerm || "N/A"}</span>
                  </Col>

                  <h6>Network</h6>

                  {editFormData?.networks?.map((item, index) => (
                    <Row className="gy-1" key={index}>
                      <Col lg={6}>
                        <span className="sub-text">Network Name</span>
                        <span className="caption-text ccap">{item?.label}</span>
                      </Col>
                      <Col lg={6}>
                        <span className="sub-text">Wallet Address</span>
                        <span className=" ccap">{item?.address}</span>
                      </Col>
                    </Row>
                  ))}
                </Row>
              </div>
            </div>
          </ModalBody>
        </Modal>

        <AssetsModal
          modal={showModal}
          closeModal={closeModal}
          formData={editFormData}
          setFormData={setEditFormData}
          editedId={editedId}
        />

        <MultipleRateModal
          modal={showMultiple}
          closeModal={closeModal}
          setShowRateModal={setShowMultiple}
          selected={selected}
          rateType={rateUpdateType}
        />
        <ConfirmUpdateModal
          modal={showStatusModal}
          closeModal={closeModal}
          setShowStatusModal={setShowStatusModal}
          selected={selected}
          statusType={statusType}
          updateType={statusUpdateType}
        />
      </Content>
    </React.Fragment>
  );
};

export default CryptoAssetsPage;
