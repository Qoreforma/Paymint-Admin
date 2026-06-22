import { useState } from "react";
import { Card, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import {
  Block,
  Button,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
} from "../../../../components/Component";

import LoadingSpinner from "../../../components/spinner";
import Search from "../tables/Search";

import { useGetCategoryAdmin, useToggleAdminPermission } from "../../../../api/giftcard-category";
import ConfirmAdminUpdateModal from "./modals/confirm-admin-multiple-updates";

const GiftcardAdminsTable = ({ categoryId, categoryName }) => {
  const [selected, setSelected] = useState([]);
  const [multiple, setMultiple] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateType, setStatusUpdateType] = useState("");

  const { data, isLoading } = useGetCategoryAdmin(categoryId);
  const { mutate: togglePermission } = useToggleAdminPermission();

  const [onSearch, setonSearch] = useState(false);

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

  const closeModal = () => {
    setMultiple(false);

    setSelected([]);
    setShowStatusModal(false);

    setStatusUpdateType("");
  };

  return (
    <div
      style={{
        margin: "50px 0",
      }}
    >
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
                  setShowStatusModal(true);
                  setStatusUpdateType("activate");
                }}
                color={"primary"}
                size={"sm"}
              >
                Activate Sell
              </Button>
              <Button
                className={"btn-round bg-white ms-2"}
                onClick={() => {
                  setShowStatusModal(true);

                  setStatusUpdateType("deactivate");
                }}
                outline={true}
                color={"light"}
                size={"sm"}
              >
                Deactivate Sell
              </Button>
            </>
          )}
        </Block>
        <Card>
          <div className="card-inner border-bottom">
            <div className="card-title-group">
              <div className="card-title">
                <h5 className="title">{categoryName} Admin Permissions</h5>
              </div>

              {/* Search component */}
              <Search onSearch={onSearch} setonSearch={setonSearch} placeholder="asset name" />
            </div>
          </div>
          <div className="card-inner-group">
            <div className="card-inner p-0">
              {isLoading ? (
                <LoadingSpinner />
              ) : data?.length > 0 ? (
                <>
                  <DataTableBody className="is-compact">
                    <DataTableHead className="tb-tnx-head bg-white fw-bold text-secondary">
                      <DataTableRow>
                        {multiple ? (
                          <div className="custom-control custom-control-sm custom-checkbox notext">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              checked={selected?.length === data?.length}
                              id={"select-all"}
                              key={Math.random()}
                              onChange={(e) => {
                                const allIds = data?.map((item) => item?.admin?._id);

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
                        <span className="tb-tnx-head bg-white text-secondary">Name</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Email</span>
                      </DataTableRow>
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Phone</span>
                      </DataTableRow>{" "}
                      <DataTableRow size="sm">
                        <span className="tb-tnx-head bg-white text-secondary">Sell</span>
                      </DataTableRow>{" "}
                    </DataTableHead>
                    {data?.map((item, index) => {
                      return (
                        <DataTableItem key={item?.admin?._id} className="text-secondary">
                          <DataTableRow>
                            {multiple ? (
                              <div className="custom-control custom-control-sm custom-checkbox notext">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  checked={selected.includes(item?.admin?._id)}
                                  id={item?.admin?._id + "uid1"}
                                  key={Math.random()}
                                  onChange={(e) => onSelectChange(e, item?.admin?._id)}
                                />
                                <label className="custom-control-label" htmlFor={item?.admin?._id + "uid1"}></label>
                              </div>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </DataTableRow>
                          <DataTableRow>
                            <div className="user-name">
                              <span className="tb-lead ccap">
                                {item?.admin?.firstName} {item?.admin?.lastName}
                              </span>
                            </div>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{item?.admin?.email}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <span>{item?.admin?.phone ?? "NOT SET"}</span>
                          </DataTableRow>
                          <DataTableRow>
                            <div className="custom-control-sm custom-switch">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                name="Sell"
                                checked={item?.sellEnabled}
                                onClick={() => {
                                  togglePermission({
                                    data: {
                                      enabled: !item?.sellEnabled,
                                    },
                                    categoryId: categoryId,
                                    adminId: item?.admin?._id,
                                  });
                                }}
                                id={item?.admin?._id + "-sell"}
                              />
                              <label className="custom-control-label" htmlFor={item?.admin?._id + "-sell"}>
                                <span className={`ccap fw-medium ${item?.sellEnabled ? "text-success" : ""}`}>
                                  {item?.sellEnabled ? "Enabled" : "Not Enabled"}
                                </span>
                              </label>
                            </div>
                          </DataTableRow>
                        </DataTableItem>
                      );
                    })}
                  </DataTableBody>
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

      <ConfirmAdminUpdateModal
        categoryId={categoryId}
        modal={showStatusModal}
        closeModal={closeModal}
        setShowStatusModal={setShowStatusModal}
        selected={selected}
        updateType={statusUpdateType}
      />
    </div>
  );
};

export default GiftcardAdminsTable;
