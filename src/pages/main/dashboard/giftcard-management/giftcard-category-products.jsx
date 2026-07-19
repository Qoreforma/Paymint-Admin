import React, { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import {
  useGetGiftcardProductsByCategory,
  useToggleActivate,
  useToggleDeleteProduct,
  useToggleHottest,
} from "../../../../api/giftcard-category";
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
import { formatter, tableNumbers, truncateText } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { FilterOptions } from "../tables/filter-select";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import GiftcardProductModal from "./modals/products-modal";
import { productFilterOptions } from "./data";
import MultipleRateModal from "./modals/multiple-products";
import MultipleCommissionModal from "./modals/multiple-commision-update";
import { usePermission } from "../../../../utils/usePermission";
import ConfirmHottestUpdateModal from "./modals/confirm-hottest-update";

const GiftCardCategoryProductsPage = ({ categoryId, categoryName }) => {
  const { hasPermission } = usePermission();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState([]);
  const [multiple, setMultiple] = useState(false);
  const [showMultiple, setShowMultiple] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [editedId, setEditedId] = useState();
  const [showHottestModal, setShowHottestModal] = useState({
    enable: false,
    disable: false,
  });

  const itemsPerPage = searchParams.get("limit") ?? 20;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const { isLoading, data, error } = useGetGiftcardProductsByCategory(
    categoryId,
    currentPage,
    itemsPerPage,
    search,
    status,
  );
  const { mutate: toggleActivate } = useToggleActivate(editedId, categoryId);
  const { mutate: toggleHottest } = useToggleHottest(editedId, categoryId);
  const { mutate: deleteProduct } = useToggleDeleteProduct(editedId, categoryId);

  // console.log(data);
  // console.log(data?.pagination);

  const [onSearch, setonSearch] = useState(false);
  const [filters, setfilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [sm, updateSm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    sellMin: "",
    sellMax: "",
    sellRate: "",
    country: null,
    category: null,
    commission: "",
    commission_type: "",
  });

  const onEditClick = async (id) => {
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        // console.log(item);
        setEditFormData({
          id: item?._id,
          name: item?.name,
          sellMin: item?.sellMinAmount,
          sellMax: item?.sellMaxAmount,
          sellRate: item?.sellRate,
          country: { id: item?.countryId?._id, label: item?.countryId?.name, value: item?.countryId?.name },
          category: {
            id: item?.categoryId?._id,
            label: item?.categoryId?.name,
            value: item?.categoryId?.name,
          },
          commission: item?.commisionValue,
          commission_type: { label: item?.commissionType, value: item?.commissionType },
        });

        setShowModal(true);
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

  //scroll off when sidebar shows
  // useEffect(() => {
  //   view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  // }, [view.add]);
  const closeModal = () => {
    setShowModal(false);
    setEditFormData({
      id: "",
      name: "",
      sellMin: "",
      sellMax: "",
      sellRate: "",
      country: null,
      category: null,
      commission: "",
      commission_type: "",
    });
    setShowMultiple(false);
    setSelected([]);
    setMultiple(false);
    setShowCommissionModal(false);
    setShowHottestModal({
      enable: false,
      disable: false,
    });
  };

  return (
    <div style={{ margin: "50px 0" }}>
      <Block>
        {hasPermission("giftcards_sell.manage") && (
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
                  onClick={() => setShowMultiple(true)}
                  color={"primary"}
                  size={"sm"}
                >
                  Update Rate
                </Button>
                <Button
                  className={"btn-round ms-2"}
                  onClick={() => setShowCommissionModal(true)}
                  color={"secondary"}
                  size={"sm"}
                >
                  Update Commision
                </Button>
                <Button
                  className={"btn-round ms-2"}
                  onClick={() => setShowHottestModal({ disable: false, enable: true })}
                  color={"primary"}
                  size={"sm"}
                >
                  Enable Hottest
                </Button>
                <Button
                  className={"btn-round bg-white ms-2"}
                  onClick={() => setShowHottestModal({ enable: false, disable: true })}
                  color={"light"}
                  size={"sm"}
                  outline={true}
                >
                  Disable Hottest
                </Button>
              </>
            )}
          </Block>
        )}
        <Card>
          <div className="card-inner border-bottom">
            <div className="card-title-group">
              <div className="card-title">
                <h5 className="title">{categoryName} Giftcard Products</h5>
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
                      <Icon name="search" />
                    </Button>
                  </li>
                  <li className="btn-toolbar-sep"></li>
                  <li>
                    <FilterOptions options={productFilterOptions} />
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
                  </li>
                </ul>
              </div>
              {/* Search component */}
              <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="name" />
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
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Name</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Category</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Country</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Sell Rate</span>
                      </DataTableRow>{" "}
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Sell min amount</span>
                      </DataTableRow>{" "}
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Sell max amount</span>
                      </DataTableRow>
                      <DataTableRow size="md">
                        <span className="tb-tnx-head bg-white text-secondary">Commission</span>
                      </DataTableRow>
                      <DataTableRow>
                        <span className="tb-tnx-head bg-white text-secondary">Hottest</span>
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
                    {data?.data?.map((item, index) => {
                      return (
                        <DataTableItem key={item?._id} className="text-secondary">
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
                            <div className="user-name">
                              <span className="tb-lead ccap">{truncateText(item?.name, 40)}</span>
                            </div>
                          </DataTableRow>
                          <DataTableRow size="md">
                            <div className="user-name">
                              <span className="tb-lead ccap">{truncateText(item?.categoryId?.name ?? 0, 30)}</span>
                            </div>
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span>{item?.countryId?.name}</span>
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span>{item?.sellRate}</span>
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span>{formatter("NGN").format(item?.sellMinAmount)}</span>
                          </DataTableRow>
                          <DataTableRow size="md">
                            <span>{formatter("NGN").format(item?.sellMaxAmount)}</span>
                          </DataTableRow>
                          <DataTableRow size="md">
                            {item?.commissionType ? (
                              <span>
                                {item?.commissionType === "flat"
                                  ? formatter("NGN").format(item?.commisionValue)
                                  : `${item?.commisionValue}%`}
                              </span>
                            ) : (
                              <span>0</span>
                            )}
                          </DataTableRow>
                          <DataTableRow>
                            <div className="custom-control-sm custom-switch">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                name={"hottest" + item.name}
                                checked={item?.isHottest === true}
                                onClick={() => {
                                  setEditedId(item?._id);
                                  toggleHottest({ isHottest: !item?.isHottest });
                                }}
                                id={"hottest" + item?._id}
                              />
                              <label className="custom-control-label" htmlFor={"hottest" + item?._id}>
                                <span
                                  className={`ccap fw-medium d-none d-md-inline ${item?.isHottest ? "text-success" : ""}`}
                                >
                                  {item.isHottest ? "Yes" : "No"}
                                </span>
                              </label>
                            </div>
                          </DataTableRow>
                          <DataTableRow>
                            <div className="custom-control-sm custom-switch">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                name={"status" + item?._id}
                                checked={item?.isActive}
                                onClick={() => {
                                  setEditedId(item?._id);
                                  toggleActivate({ isActive: !item?.isActive });
                                }}
                                id={"status" + item?._id}
                              />
                              <label className="custom-control-label" htmlFor={"status" + item?._id}>
                                <span
                                  className={`ccap fw-medium d-none d-md-inline ${item?.isActive ? "text-success" : ""}`}
                                >
                                  {item.isActive ? "Active" : "Not Active"}
                                </span>
                              </label>
                            </div>
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
                                      {hasPermission("giftcards.update") && (
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditedId(item?._id);
                                              onEditClick(item?._id);
                                            }}
                                          >
                                            <Icon name="edit"></Icon>
                                            <span>Edit Product</span>
                                          </DropdownItem>
                                        </li>
                                      )}

                                      {hasPermission("giftcards.delete") && (
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            className="text-danger"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              setEditedId(item?._id);
                                              deleteProduct();
                                              // toggleActivate();
                                              // onEditClick(item?._id);
                                            }}
                                          >
                                            <Icon name="trash"></Icon>
                                            <span>Delete Product</span>
                                          </DropdownItem>
                                        </li>
                                      )}
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
                  <span className="text-silent">No product record found</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Block>

      <GiftcardProductModal
        categoryId={categoryId}
        modal={showModal}
        formData={editFormData}
        setFormData={setEditFormData}
        closeModal={closeModal}
      />

      <MultipleRateModal
        categoryId={categoryId}
        modal={showMultiple}
        closeModal={closeModal}
        editedId={selected}
        selected={selected}
      />

      <MultipleCommissionModal
        categoryId={categoryId}
        modal={showCommissionModal}
        closeModal={closeModal}
        editedId={selected}
        selected={selected}
      />

      <ConfirmHottestUpdateModal
        categoryId={categoryId}
        modal={showHottestModal}
        closeModal={closeModal}
        setShowHottestModal={setShowHottestModal}
        selected={selected}
      />
    </div>
  );
};

export default GiftCardCategoryProductsPage;
