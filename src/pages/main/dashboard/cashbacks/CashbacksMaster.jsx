import React, { useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Button, DataTable, DataTableBody, DataTableHead, DataTableItem, DataTableRow, Icon, PaginationComponent } from "../../../../components/Component";
import { useGetCashbacks, useToggleCashback, useDeleteCashback } from "../../../../api/service-providers";
import CashbackModal from "./modals/CashbackModal";
import Head from "../../../../layout/head/Head";
import Swal from "sweetalert2";
import { formatter } from "../../../../utils/Utils";

const CashbacksMasterPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [view, setView] = useState({ edit: false, add: false });
  const [formData, setFormData] = useState(null);

  const { data: cashbacks, isLoading } = useGetCashbacks({ currentPage, size: itemsPerPage });
  const { mutate: toggleCashback } = useToggleCashback();
  const { mutate: deleteCashback } = useDeleteCashback();

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const onEditClick = (data) => {
    setFormData(data);
    setView({ edit: true, add: false });
  };

  const onFormCancel = () => {
    setView({ edit: false, add: false });
    setFormData(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCashback(id);
      }
    });
  };

  return (
    <React.Fragment>
      <Head title="Cashbacks Management" />
      <BlockHead size="sm">
        <BlockBetween>
          <BlockHeadContent>
            <BlockTitle page>Cashbacks</BlockTitle>
          </BlockHeadContent>
          <BlockHeadContent>
            <div className="toggle-wrap nk-block-tools-toggle">
              <Button
                className={`btn-icon btn-trigger toggle-expand me-n1 ${view.add ? "active" : ""}`}
                onClick={() => setView({ ...view, add: !view.add })}
              >
                <Icon name="menu-alt-r"></Icon>
              </Button>
              <div className="toggle-expand-content" style={{ display: view.add ? "block" : "none" }}>
                <ul className="nk-block-tools g-3">
                  <li className="nk-block-tools-opt">
                    <Button color="primary" onClick={() => setView({ edit: false, add: true })}>
                      <Icon name="plus" />
                      <span>Add Cashback Rule</span>
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
          <DataTableBody>
            <DataTableHead>
              <DataTableRow>
                <span className="sub-text">Target</span>
              </DataTableRow>
              <DataTableRow size="md">
                <span className="sub-text">Type & Value</span>
              </DataTableRow>
              <DataTableRow>
                <span className="sub-text">Status</span>
              </DataTableRow>
              <DataTableRow className="nk-tb-col-tools text-end">
                <span className="sub-text">Actions</span>
              </DataTableRow>
            </DataTableHead>
            
            {cashbacks?.data?.length > 0 ? (
              cashbacks.data.map((item) => {
                let targetText = "Global (All)";
                if (item.serviceTypeId) targetText = `Service Type: ${item.serviceTypeId?.name || item.serviceTypeId}`;
                
                return (
                  <DataTableItem key={item._id}>
                    <DataTableRow>
                      <div className="user-card">
                        <div className="user-info">
                          <span className="tb-lead">{targetText}</span>
                        </div>
                      </div>
                    </DataTableRow>
                    <DataTableRow size="md">
                      <span className="tb-amount">
                        {item.type === "percentage" ? `${item.value}%` : formatter("NGN").format(item.value)}
                        <span className="currency"> {item.type}</span>
                      </span>
                    </DataTableRow>
                    <DataTableRow>
                      <div className="custom-control-sm custom-switch" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id={item._id}
                          checked={item.active}
                          onChange={() => {
                            toggleCashback({ id: item._id, data: { active: !item.active } });
                          }}
                        />
                        <label className="custom-control-label" htmlFor={item._id}>
                          <span className={`ccap fw-medium d-none d-md-inline ${item.active ? "text-success" : "text-muted"}`}>
                            {item.active ? "active" : "inactive"}
                          </span>
                        </label>
                      </div>
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
                                  <DropdownItem tag="a" href="#edit" onClick={(ev) => {
                                    ev.preventDefault();
                                    onEditClick(item);
                                  }}>
                                    <Icon name="edit"></Icon>
                                    <span>Edit</span>
                                  </DropdownItem>
                                </li>
                                <li>
                                  <DropdownItem tag="a" href="#delete" onClick={(ev) => {
                                    ev.preventDefault();
                                    handleDelete(item._id);
                                  }}>
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
              })
            ) : null}
          </DataTableBody>
          <div className="card-inner">
            {cashbacks?.data?.length === 0 && <div className="text-center"><span className="text-silent">No Cashback Rules found</span></div>}
            {cashbacks?.pagination?.total > 0 && (
              <PaginationComponent
                itemPerPage={itemsPerPage}
                totalItems={cashbacks?.pagination?.total}
                paginate={paginate}
                currentPage={Number(currentPage)}
              />
            )}
          </div>
        </DataTable>
      </Block>

      <CashbackModal 
        modal={view.add || view.edit} 
        isEdit={view.edit} 
        closeModal={onFormCancel} 
        formData={formData} 
      />
    </React.Fragment>
  );
};

export default CashbacksMasterPage;
