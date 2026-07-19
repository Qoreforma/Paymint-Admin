import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  Badge,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "reactstrap";
import { useDeleteBanners, useGetBanners, useReorderBanners, useToggleBanners } from "../../../../api/banners";
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
} from "../../../../components/Component";
import ImageContainer from "../../../../components/partials/gallery/GalleryImage";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDateWithHyphen, formatDateWithTime } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";
import SortToolTip from "../tables/SortTooltip";
import AddBanner from "./add-banner";
import { usePermission } from "../../../../utils/usePermission";
import ReorderBanners from "./reorder-banners";

const BannersPage = () => {
  const { hasPermission } = usePermission();

  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? undefined;

  const [editedId, setEditedId] = useState(null);

  const { isLoading, data } = useGetBanners(currentPage, itemsPerPage);
  const { mutate: deleteBanner } = useDeleteBanners(editedId);
  const { mutate: toggleBanner } = useToggleBanners(editedId);
  const { mutate: reorderBanners } = useReorderBanners();

  const [selectedBanner, setSelectedBanner] = useState(null);
  const [banners, setBanners] = useState([]);
  const [reorderModal, setReorderModal] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setBanners(data.data);
    }
  }, [data]);

  const saveOrder = (items) => {
    reorderBanners(
      {
        bannerIds: items.map((i) => i._id),
      },
      {
        onSuccess: () => {
          // Update the banners state with the new order
          setBanners(items);
          setReorderModal(false);
        },
        onError: (error) => {
          // Handle error
          console.error("Failed to reorder banners:", error);
          // Optionally show an error toast/notification
        },
      },
    );
  };

  const [deleteModal, setDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const openDeleteModal = (banner) => {
    setBannerToDelete(banner);
    setEditedId(banner._id);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setBannerToDelete(null);
    setDeleteModal(false);
  };

  const confirmDelete = () => {
    deleteBanner();
    closeDeleteModal();
  };

  // console.log(data);
  const [sm, updateSm] = useState(false);

  const [view, setView] = useState({
    edit: false,
    add: false,
    details: false,
  });
  const [onSearch, setonSearch] = useState(false);
  const [filters, setfilters] = useState({});

  // function to close the form modal
  const onFormCancel = () => {
    setView({ edit: false, add: false, details: false });
  };

  // function to filter data
  const filterData = useCallback(() => {
    return;
  }, []);

  // toggle function to view product details
  const toggle = (type) => {
    setView({
      edit: type === "edit" ? true : false,
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
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

  //scroll off when sidebar shows
  useEffect(() => {
    view.add ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
  }, [view.add]);

  return (
    <React.Fragment>
      <Head title="Banners"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Banners
              </BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              {hasPermission("banners.create") && (
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
                        <Button color="secondary" onClick={() => setReorderModal(true)}>
                          <Icon name="move" />
                          <span>Reorder Banners</span>
                        </Button>
                      </li>
                      <li className="nk-block-tools-opt">
                        <Button color="primary" onClick={() => toggle("add")}>
                          <Icon name="plus"></Icon>
                          <span>Create Banner</span>
                        </Button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>
        {/* PRODUCT TABLE HERE */}
        <Block>
          <Card>
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <div className="card-title">
                  <h5 className="title">All Banners</h5>
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
                <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="hotel name" />
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
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Creator</span>
                        </DataTableRow>

                        <DataTableRow>
                          <span className="tb-tnx-head bg-white text-secondary">Featured Image</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span className="tb-tnx-head bg-white text-secondary">Link</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span className="tb-tnx-head bg-white text-secondary">Date Created</span>
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
                      {banners?.map((item) => {
                        return (
                          <DataTableItem key={item?._id} className="text-secondary">
                            <DataTableRow size="sm">
                              <span className="title">
                                {item?.creator?.firstName} {item?.creator?.lastName}
                              </span>
                            </DataTableRow>

                            <DataTableRow>
                              <ImageContainer img={item?.featuredImageUrl} sm />
                            </DataTableRow>
                            <DataTableRow size="md">
                              <a href={item?.link} target="_blank" rel="noopener noreferrer">
                                {item?.link}
                              </a>
                            </DataTableRow>

                            <DataTableRow size="sm">
                              <span className="text-capitalize"> {formatDateWithHyphen(item?.createdAt)}</span>
                            </DataTableRow>

                            <DataTableRow>
                              <div className="custom-control-sm custom-switch">
                                <input
                                  disabled={!hasPermission("banners.update")}
                                  type="checkbox"
                                  className="custom-control-input"
                                  name={item?._id}
                                  checked={item?.isActive}
                                  onClick={() => {
                                    setEditedId(item?._id);
                                    toggleBanner({ isActive: !item.isActive });
                                  }}
                                  id={item?._id}
                                />
                                <label className="custom-control-label" htmlFor={item?._id}>
                                  <span className={`ccap fw-medium ${item?.isActive ? "text-success" : "text-muted"}`}>
                                    {item.isActive ? "active" : "inactive"}
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
                                            href="#edit"
                                            onClick={(e) => {
                                              e.preventDefault();

                                              setSelectedBanner(item);

                                              setView({
                                                add: false,
                                                edit: true,
                                                details: false,
                                              });
                                            }}
                                          >
                                            <Icon name="edit"></Icon>
                                            <span>Edit</span>
                                          </DropdownItem>
                                        </li>
                                        {hasPermission("banners.delete") && (
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#delete"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                openDeleteModal(item);
                                              }}
                                            >
                                              <Icon name="trash" className="text-danger" />
                                              <span className="text-danger">Delete</span>
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
                      {data?.data?.length > 0 && (
                        <PaginationComponent
                          itemPerPage={itemsPerPage}
                          totalItems={data?.data?.length}
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

        <AddBanner modal={view.edit} closeModal={onFormCancel} banner={selectedBanner} isEdit />

        <AddBanner modal={view.add} closeModal={onFormCancel} />

        <ReorderBanners
          modal={reorderModal}
          closeModal={() => setReorderModal(false)}
          banners={banners}
          saveOrder={saveOrder}
        />

        <Modal isOpen={deleteModal} toggle={closeDeleteModal} centered>
          <ModalHeader toggle={closeDeleteModal}>Delete Banner</ModalHeader>

          <ModalBody>
            <div className="text-center mb-3">
              <img
                src={bannerToDelete?.featuredImageUrl}
                alt="Banner"
                style={{
                  maxWidth: "100%",
                  maxHeight: 100,
                  borderRadius: 8,
                }}
              />
            </div>

            <p className="text-center fs-16px">Are you sure you want to delete this banner?</p>

            {bannerToDelete?.link && <small className="text-muted d-block mt-2">{bannerToDelete.link}</small>}
          </ModalBody>

          <ModalFooter>
            <Button color="light" onClick={closeDeleteModal}>
              Cancel
            </Button>

            <Button color="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default BannersPage;
