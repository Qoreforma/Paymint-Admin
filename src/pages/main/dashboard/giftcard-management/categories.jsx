import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import {
  useGetGiftcardCategories,
  useToggleDeleteCategory,
  useTogglePurchaseCategory,
  useToggleSaleCategory,
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
  UserAvatar,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { findUpper, formatDateWithHyphen, formatDateWithTime, tableNumbers } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import { FilterOptions } from "../tables/filter-select";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import { categoriesFilterOptions } from "./data";
import GiftcardCategoryModal from "./modals/categories-modal";
import ViewGiftcardModal from "./modals/view-modal";

const GiftCardCategoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [editedId, setEditedId] = useState();

  const [onSearch, setonSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [sm, updateSm] = useState(false);

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;

  const { isLoading, data, error } = useGetGiftcardCategories(currentPage, itemsPerPage);
  const { mutate: toggleSale } = useToggleSaleCategory(editedId);
  const { mutate: togglePurchase } = useTogglePurchaseCategory(editedId);
  const { mutate: deleteCategory } = useToggleDeleteCategory(editedId);

  const [editFormData, setEditFormData] = useState({
    name: "",
    admins: [],
    countries: [],
    icon: "",
    saleTerm: "",
    id: "",
    saleActivated: "",
    purchaseActivated: "",
  });

  // console.log(data);

  const onEditClick = async (id, type) => {
    data?.data?.forEach((item) => {
      if (item?._id === id) {
        setEditFormData({
          id: item?._id,
          name: item.name,
          countries: item.countries?.map((item) => ({ id: item?._id, label: item.name, value: item.name })),
          icon: item.icon,
          saleTerms: item.saleTerm,
          purchaseTerms: item.purchaseTerm,
          saleActivated: item.saleActivated,
          purchaseActivated: item.purchaseActivated,
        });
        if (type === "edit") {
          setShowModal(true);
        } else {
          setShowView(true);
        }
      }
    });
  };

  // Change Page

  //paginate
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

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

  return (
    <React.Fragment>
      <Head title="Assets"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle>Giftcard Categories</BlockTitle>
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
                        <span>Add Category</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        <Block>
          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">Giftcard Categories</h5>
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
                      <FilterOptions options={categoriesFilterOptions} />
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
                          <span className="tb-tnx-head bg-white text-secondary">S/N</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Fullname</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Product count</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Created At</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Sales Status</span>
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
                              <span>{item?.productCount}</span>
                            </DataTableRow>
                            <DataTableRow>
                              <span>{formatDateWithHyphen(item?.createdAt)}</span>
                            </DataTableRow>

                            <DataTableRow size="sm">
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
                                    {item.saleActivated ? "Activated" : "Not Active"}
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
                                        <li>
                                          <DropdownItem
                                            tag="a"
                                            href="#edit"
                                            onClick={(ev) => {
                                              ev.preventDefault();
                                              navigate(`/giftcard-categories/${item?._id}`);
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
                                            }}
                                          >
                                            <Icon name="edit"></Icon>
                                            <span>Edit Category</span>
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
                                              deleteCategory();
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
                    <span className="text-silent">No category record found</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Block>

        <GiftcardCategoryModal
          modal={showModal}
          closeModal={closeModal}
          formData={editFormData}
          setFormData={setEditFormData}
        />

        <ViewGiftcardModal showModal={showView} formData={editFormData} closeModal={closeModal} />
      </Content>
    </React.Fragment>
  );
};

export default GiftCardCategoriesPage;
