import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
} from "reactstrap";
import { useDeleteCryptoNetwork, useGetAutoCryptoProvs, useGetCryptoNetworks } from "../../../../api/crypto";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDate, formatDateWithHyphen, formatDateWithTime, tableNumbers } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import NetworkModal from "./modals/networks";
import SortToolTip from "../tables/SortTooltip";

const CryptoNetworkPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [editedId, setEditedId] = useState();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const assetType = searchParams.get("assetType") ?? "";
  const status = searchParams.get("status") ?? "";
  const type = "sell";

  const { data: autoProvData } = useGetAutoCryptoProvs();
  const { isLoading, data, error } = useGetCryptoNetworks(currentPage, itemsPerPage, search, assetType);
  const { mutate: deleteNetwork } = useDeleteCryptoNetwork(editedId);
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    code: "",
    walletAddress: "",
  });

  const [onSearch, setonSearch] = useState(false);
  const [filters, setfilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [sm, updateSm] = useState(false);

  // function to filter data
  // const filterData = useCallback(() => {
  //   return;
  // }, []);

  // Change Page
  //paginate

  const onEditClick = async (id, type) => {
    // console.log(singleData);
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        // console.log(item);
        setEditFormData({
          id: item._id,
          name: item.name,
          code: item.code,
          walletAddress: item.platformDepositAddress,
        });
        if (type === "edit") {
          setShowModal(true);
        } else {
          setShowView(true);
        }
      }
    });
  };

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
  };

  //scroll off when sidebar shows
  // useEffect(() => {
  //   view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  // }, [view.add]);

  return (
    <React.Fragment>
      <Head title="Networks"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Networks</BlockTitle>
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
                        <span>Add Network</span>
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
          <Card>
            <Nav tabs className="nav nav-tabs nav-tabs-card">
              <NavItem>
                <NavLink
                  tag="a"
                  href="#tab"
                  className={assetType === "" ? "active" : ""}
                  onClick={(ev) => {
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
                  <h5 className="title">All Networks</h5>
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
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="network name" />
              </div>
            </div>
            <div className="card-inner-group">
              <div className="card-inner p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : data?.data?.length > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Name</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Code</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Wallet Address</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Asset Count</span>
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
                          <DataTableItem key={item?._id} className="text-secondary">
                            <DataTableRow>
                              <span> {tableNumbers(currentPage, itemsPerPage) + index + 1}</span>
                            </DataTableRow>
                            <DataTableRow size="sm" className="text-primary fw-bold">
                              <span>{item?.name}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item?.code}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item?.platformDepositAddress}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item?.cryptoCount}</span>
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
                                              navigate(`/network-details/${item?._id}`);
                                              // onEditClick(item?._id);
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
                                              // onEditClick(item?._id);
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
                                              deleteNetwork();
                                              // onEditClick(item?._id, "edit");

                                              // onEditClick(item?._id);
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
                    <span className="text-silent">No record found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>
        <NetworkModal closeModal={closeModal} formData={editFormData} setFormData={setEditFormData} modal={showModal} />
      </Content>
    </React.Fragment>
  );
};

export default CryptoNetworkPage;
