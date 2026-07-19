import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useGetCryptoCurrencies } from "../../../../api/crypto";
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
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { tableNumbers } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import CurrencyModal from "./modals/currency";

const CryptoCurrenciesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const type = "sell";
  // const { isLoading, data, error } = useGetAllProducts(currentPage, itemsPerPage, search, type);
  const { isLoading, data, error } = useGetCryptoCurrencies(currentPage, itemsPerPage, search, status, type);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", exchangeRate: "", buyRate: "", sellRate: "" });

  // console.log(data);
  // console.log(data?.meta);

  const [onSearch, setonSearch] = useState(false);

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

  const onEditClick = (id) => {
    data?.currencies?.forEach((item) => {
      if (item?.id === id) {
        // console.log(item);
        setFormData({
          id,
          name: item?.name,
          exchangeRate: item.exchange_rate_to_ngn,
          buyRate: item?.buy_rate,
          sellRate: item?.sell_rate,
        });
        setShowModal(true);
      }
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
    setFormData({
      id: "",
      name: "",
      exchangeRate: "",
      buyRate: "",
      sellRate: "",
    });
  };

  //scroll off when sidebar shows
  // useEffect(() => {
  //   view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  // }, [view.add]);

  return (
    <React.Fragment>
      <Head title="Currencies"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Currencies</BlockTitle>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* PRODUCT TABLE HERE */}
        <Block>
          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">Currencies</h5>
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
                    {/* <li className="btn-toolbar-sep"></li>
                    <li>
                      <FilterOptions options={giftcardFilterOptions} />
                    </li>
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                          <Icon name="setting"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end className="dropdown-menu-xs">
                          <SortToolTip />
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li> */}
                  </ul>
                </div>
                {/* Search component */}
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="currency" />
              </div>
            </div>
            <div className="card-inner-group">
              <div className="card-inner p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : data?.currencies?.length > 0 ? (
                  <>
                    <DataTableBody className="is-compact">
                      <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Name</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Code</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Exchange rate to Naria</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Buy Rate</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Sell Rate</span>
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
                      {data?.currencies?.map((item, index) => {
                        return (
                          <DataTableItem key={item.id} className="text-secondary">
                            <DataTableRow>
                              <span> {tableNumbers(currentPage, itemsPerPage) + index + 1}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item.name}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item.code}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item.exchange_rate_to_ngn}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item.buy_rate}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{item.sell_rate}</span>
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
                                              setShowModal(true);
                                              onEditClick(item?.id);
                                            }}
                                          >
                                            <Icon name="eye"></Icon>
                                            <span>Update Currency</span>
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
                    {/* <div className="card-inner">
                      {data?.currencies?.length > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={data?.currencies?.length}
                          paginate={paginate}
                          currentPage={Number(currentPage)}
                        />
                      )}
                    </div> */}
                  </>
                ) : (
                  <div className="text-center" style={{ paddingBlock: "1rem" }}>
                    <span className="text-silent">No tranaction record found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        <CurrencyModal closeModal={closeModal} modal={showModal} formData={formData} setFormData={setFormData} />
      </Content>
    </React.Fragment>
  );
};

export default CryptoCurrenciesPage;
