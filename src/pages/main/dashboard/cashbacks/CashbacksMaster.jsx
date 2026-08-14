import React, { useState } from "react";
import {
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  Badge,
} from "reactstrap";
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
import {
  useGetCashbacks,
  useToggleCashback,
  useDeleteCashback,
  useBulkUpdateCashback,
} from "../../../../api/service-providers";
import CashbackModal from "./modals/CashbackModal";
import BulkCashbackModal from "./modals/BulkCashbackModal";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import Swal from "sweetalert2";
import { formatter } from "../../../../utils/Utils";
import LoadingSpinner from "../../../components/spinner";

const CashbacksMasterPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [view, setView] = useState({ edit: false, add: false, bulk: false });
  const [formData, setFormData] = useState(null);
  const [selected, setSelected] = useState([]);

  const { data: cashbacks, isLoading } = useGetCashbacks({ currentPage, size: itemsPerPage });
  const { mutate: toggleCashback } = useToggleCashback();
  const { mutate: deleteCashback } = useDeleteCashback();
  const { mutate: bulkUpdateCashback, isLoading: isBulkUpdating } = useBulkUpdateCashback();

  const paginate = (pageNumber) => {
    setSelected([]);
    setCurrentPage(pageNumber);
  };

  const onEditClick = (data) => {
    setFormData(data);
    setView({ edit: true, add: false, bulk: false });
  };

  const onFormCancel = () => {
    setView({ edit: false, add: false, bulk: false });
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
        deleteCashback(id, {
          onSuccess: () => {
            setSelected((prev) => prev.filter((item) => item !== id));
          },
        });
      }
    });
  };

  const onSelectChange = (e, id) => {
    if (e.target.checked) {
      setSelected((prev) => [...prev, id]);
    } else {
      setSelected((prev) => prev.filter((item) => item !== id));
    }
  };

  const onSelectAllChange = (e) => {
    if (e.target.checked && cashbacks?.data) {
      const allIds = cashbacks.data.map((item) => item._id);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  };

  const handleBulkActivate = () => {
    if (selected.length === 0) return;
    bulkUpdateCashback(
      { ids: selected, data: { active: true } },
      {
        onSuccess: () => {
          setSelected([]);
        },
      }
    );
  };

  const handleBulkDeactivate = () => {
    if (selected.length === 0) return;
    bulkUpdateCashback(
      { ids: selected, data: { active: false } },
      {
        onSuccess: () => {
          setSelected([]);
        },
      }
    );
  };

  const isAllSelected =
    cashbacks?.data?.length > 0 && selected.length === cashbacks.data.length;

  return (
    <React.Fragment>
      <Head title="Cashbacks Management" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Cashbacks Management</BlockTitle>
              <p className="text-muted small">Manage and bulk configure cashback rules across services.</p>
            </BlockHeadContent>
            <BlockHeadContent>
              <Button
                color="primary"
                onClick={() => {
                  setFormData(null);
                  setView({ edit: false, add: true, bulk: false });
                }}
              >
                <Icon name="plus" />
                <span>Add Cashback Rule</span>
              </Button>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* Selected Items Bulk Action Banner */}
        {selected.length > 0 && (
          <div
            className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 rounded-3 shadow-lg p-4"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 16,
              boxShadow: "0 12px 36px rgba(15, 23, 42, 0.45)",
              minHeight: 72,
            }}
          >
            {/* Left: Bold Counter Badge */}
            <div className="d-flex align-items-center gap-3">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "#ffffff",
                  fontWeight: 900,
                  fontSize: 18,
                  minWidth: 46,
                  height: 46,
                  borderRadius: "50%",
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.75)",
                }}
              >
                {selected.length}
              </span>
              <span style={{ color: "#f8fafc", fontWeight: 800, fontSize: 16, letterSpacing: "-0.2px" }}>
                {selected.length === 1 ? "Rule Selected" : "Rules Selected"}
              </span>
            </div>

            {/* Right: Grouped Action Buttons */}
            <div className="d-flex flex-wrap align-items-center" style={{ gap: 16 }}>
              {/* Bulk Update Button */}
              <button
                type="button"
                className="btn d-inline-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 600,
                  padding: "9px 20px",
                  borderRadius: 9,
                  fontSize: 13,
                  boxShadow: "0 2px 10px rgba(59, 130, 246, 0.45)",
                  lineHeight: 1.4,
                  cursor: "pointer",
                }}
                onClick={() => setView({ edit: false, add: false, bulk: true })}
              >
                <Icon name="edit-alt" style={{ fontSize: 14 }} />
                Bulk Update
              </button>

              {/* Vertical Divider */}
              <div
                style={{
                  width: 1.5,
                  height: 34,
                  background: "rgba(255, 255, 255, 0.25)",
                  margin: "0 4px",
                }}
              />

              {/* Activate Button */}
              <button
                type="button"
                className="btn d-inline-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 600,
                  padding: "9px 20px",
                  borderRadius: 9,
                  fontSize: 13,
                  boxShadow: "0 2px 10px rgba(16, 185, 129, 0.45)",
                  lineHeight: 1.4,
                  cursor: "pointer",
                }}
                onClick={handleBulkActivate}
                disabled={isBulkUpdating}
              >
                <Icon name="check" style={{ fontSize: 14 }} />
                Activate
              </button>

              {/* Deactivate Button */}
              <button
                type="button"
                className="btn d-inline-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 600,
                  padding: "9px 20px",
                  borderRadius: 9,
                  fontSize: 13,
                  boxShadow: "0 2px 10px rgba(245, 158, 11, 0.45)",
                  lineHeight: 1.4,
                  cursor: "pointer",
                }}
                onClick={handleBulkDeactivate}
                disabled={isBulkUpdating}
              >
                <Icon name="cross" style={{ fontSize: 14 }} />
                Deactivate
              </button>

              {/* Vertical Divider */}
              <div
                style={{
                  width: 1.5,
                  height: 34,
                  background: "rgba(255, 255, 255, 0.25)",
                  margin: "0 4px",
                }}
              />

              {/* Clear Selection Button */}
              <button
                type="button"
                className="btn d-inline-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  border: "1.5px solid rgba(255, 255, 255, 0.35)",
                  fontWeight: 600,
                  padding: "9px 24px",
                  borderRadius: 9,
                  fontSize: 13,
                  lineHeight: 1.4,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onClick={() => setSelected([])}
              >
                <span style={{ fontWeight: 800, fontSize: 14 }}>✕</span> Clear Selection
              </button>
            </div>
          </div>
        )}

        <Block>
          <Card className="card-bordered card-stretch">
            {isLoading ? (
              <div className="p-5 text-center">
                <LoadingSpinner />
              </div>
            ) : (
              <DataTable className="card-stretch">
                <DataTableBody>
                  <DataTableHead>
                    <DataTableRow className="nk-tb-col-check">
                      <div className="custom-control custom-control-sm custom-checkbox notext">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="selectAllCashbacks"
                          checked={isAllSelected}
                          onChange={onSelectAllChange}
                        />
                        <label className="custom-control-label" htmlFor="selectAllCashbacks"></label>
                      </div>
                    </DataTableRow>
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

                  {cashbacks?.data?.length > 0
                    ? cashbacks.data.map((item) => {
                      let targetText = "Global (All)";
                      if (item.serviceTypeId)
                        targetText = `Service Type: ${item.serviceTypeId?.name || item.serviceTypeId}`;

                      const isChecked = selected.includes(item._id);

                      return (
                        <DataTableItem key={item._id}>
                          <DataTableRow className="nk-tb-col-check">
                            <div className="custom-control custom-control-sm custom-checkbox notext">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={`cashback-${item._id}`}
                                checked={isChecked}
                                onChange={(e) => onSelectChange(e, item._id)}
                              />
                              <label
                                className="custom-control-label"
                                htmlFor={`cashback-${item._id}`}
                              ></label>
                            </div>
                          </DataTableRow>
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
                              <Badge color="outline-primary" className="ms-1 text-uppercase" style={{ fontSize: "11px" }}>
                                {item.type}
                              </Badge>
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
                                <span
                                  className={`ccap fw-medium d-none d-md-inline ${item.active ? "text-success" : "text-muted"
                                    }`}
                                >
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
                                        <DropdownItem
                                          tag="a"
                                          href="#edit"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            onEditClick(item);
                                          }}
                                        >
                                          <Icon name="edit"></Icon>
                                          <span>Edit</span>
                                        </DropdownItem>
                                      </li>
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#delete"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            handleDelete(item._id);
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
                    })
                    : null}
                </DataTableBody>
                <div className="card-inner">
                  {cashbacks?.data?.length === 0 && (
                    <div className="text-center py-4">
                      <span className="text-silent">No Cashback Rules found</span>
                    </div>
                  )}
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
            )}
          </Card>
        </Block>

        <CashbackModal
          modal={view.add || view.edit}
          isEdit={view.edit}
          closeModal={onFormCancel}
          formData={formData}
        />

        <BulkCashbackModal
          modal={view.bulk}
          closeModal={onFormCancel}
          selected={selected}
          onComplete={() => setSelected([])}
        />
      </Content>
    </React.Fragment>
  );
};

export default CashbacksMasterPage;
