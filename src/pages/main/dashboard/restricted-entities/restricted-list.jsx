import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, UncontrolledDropdown } from "reactstrap";
import {
  useCreateRestrictedEntity,
  useUpdateRestrictedEntity,
  useGetRestrictedEntities,
  useDeleteRestrictedEntity,
} from "../../../../api/restricted-entity";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  Icon,
  RSelect,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import RestrictedEntityTable from "../faq/faqTable";
import { formatDateWithTime } from "../../../../utils/Utils";

const entityTypes = [
  { label: "Email", value: "email" },
  { label: "Phone Number", value: "phone" },
  { label: "Account Number", value: "account_number" },
  //   { label: "Wallet Address", value: "wallet_address" },
  //   { label: "IP Address", value: "ip_address" },
  //   { label: "Device ID", value: "device_id" },
  //   { label: "Transaction ID", value: "transaction_id" },
  //   { label: "User ID", value: "user_id" },
  //   { label: "Referral Code", value: "referral_code" },
  //   { label: "Username", value: "username" },
  //   { label: "Bank Name", value: "bank_name" },
];

const RestrictedEntityList = () => {
  const [editId, setEditedId] = useState();
  const { isLoading, data: restrictedEntities } = useGetRestrictedEntities();
  const { mutate: createRestrictedEntity } = useCreateRestrictedEntity();
  const { mutate: updateRestrictedEntity } = useUpdateRestrictedEntity(editId);
  const { mutate: deleteRestrictedEntity } = useDeleteRestrictedEntity(editId);

  console.log(restrictedEntities);

  const [formData, setFormData] = useState({
    id: null,
    type: "",
    value: "",
    createdAt: "",
  });
  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
  });

  const toggle = (type) => {
    setView({
      add: type === "add",
      details: type === "details",
      edit: type === "edit",
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      type: "",
      value: "",
      createdAt: "",
    });
  };

  const onFormSubmit = (form) => {
    const submittedData = {
      type: form.type,
      value: form.value,
    };
    if (view.add) {
      createRestrictedEntity(submittedData);
    } else {
      updateRestrictedEntity(submittedData);
    }

    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  const onEditClick = (id) => {
    restrictedEntities?.data?.forEach((item) => {
      if (item.id === id) {
        setFormData({
          type: item.type,
          value: item.value,
          createdAt: item.created_at,
        });
      }
    });
    setEditedId(id);
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  const onFormCancel = () => {
    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const ActionOptions = ({ id }) => (
    <ul className="nk-tb-actions gx-1 my-n1">
      <li>
        <UncontrolledDropdown>
          <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
            <Icon name="more-h"></Icon>
          </DropdownToggle>
          <DropdownMenu end>
            <ul className="link-list-opt no-bdr">
              <li>
                <DropdownItem
                  tag="a"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    onEditClick(id);
                    setView({ add: false, edit: false, details: true });
                  }}
                >
                  <Icon name="eye"></Icon>
                  <span>View</span>
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag="a"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    onEditClick(id);
                    setView({ add: false, edit: true, details: false });
                  }}
                >
                  <Icon name="edit"></Icon>
                  <span>Edit</span>
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag="a"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setEditedId(id);
                    deleteRestrictedEntity();
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
  );

  return (
    <React.Fragment>
      <Head title="Restricted Entities"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Restricted Entities</BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className="toggle btn-icon d-md-none"
                  color="primary"
                  onClick={() => {
                    toggle("add");
                  }}
                >
                  <Icon name="plus"></Icon>
                </Button>
                <Button
                  className="toggle d-none d-md-inline-flex"
                  color="primary"
                  onClick={() => {
                    toggle("add");
                  }}
                >
                  <Icon name="plus"></Icon>
                  <span>Add Restricted Entity</span>
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <RestrictedEntityTable
            faqTitle="Restricted Entities"
            defaultData={restrictedEntities?.data}
            data={restrictedEntities?.data}
            headers={["Entity Type", "Entity", "Date Created"]}
            dataKeys={["type", "value", "created_at"]}
            modelOpen={setView}
            action={ActionOptions}
            isLoading={isLoading}
          />
        </Block>

        <Modal isOpen={view.add || view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
          <ModalBody className="bg-white rounded">
            <a href="#cancel" className="close">
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  onFormCancel();
                }}
              ></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">{view.add ? "Add" : "Edit"} Restricted Entity</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label">Entity Type</label>
                        <div className="form-control-wrap">
                          <RSelect
                            options={entityTypes}
                            value={entityTypes.find((option) => option.value === formData.type)}
                            onChange={(e) => setFormData({ ...formData, type: e.value })}
                            placeholder="Select"
                          />
                          {errors.type && <span className="invalid">{errors.type.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label">Entity Value</label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register("value", {
                              required: "This field is required",
                            })}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            value={formData.value}
                          />
                          {errors.value && <span className="invalid">{errors.value.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>{view.add ? "Add" : "Edit"} Restricted Entity</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>

        <Modal isOpen={view.details} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a href="#cancel" className="close">
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  onFormCancel();
                }}
              ></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">View Restricted Entity</h5>
              <div className="mt-4">
                <Row className="gy-3">
                  <Col>
                    <span className="sub-text">Type</span>
                    <span className="caption-text text-primary">{formData.type}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Value</span>
                    <span className="caption-text">{formData.value}</span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Date Created</span>
                    <span className="caption-text">{formatDateWithTime(formData.createdAt)}</span>
                  </Col>
                </Row>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default RestrictedEntityList;
