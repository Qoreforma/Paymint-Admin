import React, { useState } from "react";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDate, formatDateWithHyphen, formatDateWithTime } from "../../../../utils/Utils";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
  Icon,
  PaginationComponent,
} from "../../../../components/Component";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useDeleteRole, useGetAllRoles } from "../../../../api/users/admin";
import LoadingSpinner from "../../../components/spinner";
import SortToolTip from "../tables/SortTooltip";

const RolesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 50;
  const currentPage = searchParams.get("page") ?? 1;

  const { data: roles, isLoading } = useGetAllRoles(currentPage, itemsPerPage);
  console.log({ roles });
  const { mutate: deleteRole } = useDeleteRole();

  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to toggle the search option
  const toggle = () => setonSearch(!onSearch);

  // Change Page
  const paginate = (pageNumber) => {
    setSearchParams((searchParams) => {
      searchParams.set("page", pageNumber);
      return searchParams;
    });
  };

  return (
    <React.Fragment>
      <Head title="Roles management"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Roles
              </BlockTitle>
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
                      <Button color="primary" onClick={() => navigate("/create-roles")}>
                        <Icon name="plus"></Icon>
                        <span>Create Role</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <h5 className="title">All roles</h5>
                <div className="card-tools me-n1">
                  <ul className="btn-toolbar gx-1">
                    {/* <li>
                      <a
                        href="#search"
                        onClick={(ev) => {
                          ev.preventDefault();
                          toggle();
                        }}
                        className="btn btn-icon search-toggle toggle-search"
                      >
                        <Icon name="search"></Icon>
                      </a>
                    </li> */}
                    <li className="btn-toolbar-sep"></li>
                    <li>
                      <div className="toggle-wrap">
                        <Button
                          className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                          onClick={() => updateTableSm(true)}
                        >
                          <Icon name="menu-right"></Icon>
                        </Button>
                        <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                          <ul className="btn-toolbar gx-1">
                            <li className="toggle-close">
                              <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                <Icon name="arrow-left"></Icon>
                              </Button>
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
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              {/* <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button
                      className="search-back btn-icon toggle-search active"
                      onClick={() => {
                        setSearchText("");
                        toggle();
                      }}
                    >
                      <Icon name="arrow-left"></Icon>
                    </Button>
                    <input
                      type="text"
                      className="border-transparent form-focus-none form-control"
                      placeholder="Search by name"
                      value={onSearchText}
                      onChange={(e) => onFilterChange(e)}
                    />
                    <Button className="search-submit btn-icon">
                      <Icon name="search"></Icon>
                    </Button>
                  </div>
                </div>
              </div> */}
            </div>
            {isLoading ? (
              <LoadingSpinner />
            ) : roles?.data?.totalPages > 0 ? (
              <>
                <DataTableBody compact>
                  <DataTableHead>
                    <DataTableRow className="nk-tb-col-check">S/N</DataTableRow>
                    <DataTableRow>
                      <span className="text-secondary tb-tnx-head bg-white">Name</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="text-secondary tb-tnx-head bg-white">Description</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="text-secondary tb-tnx-head bg-white">No of Admins</span>
                    </DataTableRow>
                    <DataTableRow size="sm">
                      <span className="text-secondary tb-tnx-head bg-white">No of Permissions</span>
                    </DataTableRow>
                    <DataTableRow>
                      <span className="text-secondary tb-tnx-head bg-white">Date created</span>
                    </DataTableRow>
                    <DataTableRow className="nk-tb-col-tools text-end">
                      <UncontrolledDropdown style={{ pointerEvents: "none" }}>
                        <DropdownToggle tag="a" className="btn btn-xs btn-outline-light btn-icon dropdown-toggle">
                          <Icon name="plus"></Icon>
                        </DropdownToggle>
                      </UncontrolledDropdown>
                    </DataTableRow>
                  </DataTableHead>
                  {/*Head*/}
                  {roles?.data?.data?.map((item, idx) => {
                    return (
                      <DataTableItem key={item._id}>
                        <DataTableRow className="nk-tb-col-check">
                          <span>{idx + 1}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span className="text-capitalize text-secondary">{item?.name.replace("_", " ")}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item?.description}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item?.adminCount ?? "N/A"}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item?.permissions?.length}</span>
                        </DataTableRow>
                        <DataTableRow>
                          <span>{formatDateWithHyphen(item?.createdAt)}</span>
                        </DataTableRow>
                        <DataTableRow className="nk-tb-col-tools">
                          <ul className="nk-tb-actions gx-1">
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                  <Icon name="more-h"></Icon>
                                </DropdownToggle>
                                <DropdownMenu end>
                                  <ul className="link-list-opt no-bdr">
                                    <li>
                                      <DropdownItem
                                        tag="a"
                                        href="#view"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          navigate(`/edit-roles/${item?._id}`);
                                        }}
                                      >
                                        <Icon name="edit"></Icon>
                                        <span>Edit role</span>
                                      </DropdownItem>
                                    </li>
                                    <li>
                                      <DropdownItem tag="a" href="#" onClick={() => deleteRole(item?._id)}>
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
                  {roles?.data?.totalPages > 0 && (
                    <PaginationComponent
                      itemPerPage={itemsPerPage}
                      totalItems={roles?.data?.totalPages}
                      paginate={paginate}
                      currentPage={Number(currentPage)}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="text-center" style={{ paddingBlock: "1rem" }}>
                <span className="text-silent">No data found</span>
              </div>
            )}
          </DataTable>
        </Block>
      </Content>
    </React.Fragment>
  );
};
export default RolesList;
