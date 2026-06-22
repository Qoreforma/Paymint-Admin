import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, UncontrolledDropdown } from "reactstrap";
import {
  useCreateSystemAccount,
  useDeletesystemAccount,
  useGetSystemAccount,
  useToggleSystemAccount,
  useVerifyAccount,
} from "../../../../api/system-bank-account";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Col,
  Icon,
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import { formatDateWithTime } from "../../../../utils/Utils";
import FaqTable from "../faq/faqTable";

const ReferralTermsPage = () => {
  const [searchParams] = useSearchParams();

  const itemsPerPage = searchParams.get("limit") ?? 100;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const [editId, setEditedId] = useState();
  // const { isLoading, data: faqs } = useGetFaqs();
  const { isLoading, data: accounts } = useGetSystemAccount(currentPage, itemsPerPage);
  const { mutate: addAccount, isLoading: creating } = useCreateSystemAccount();
  const { mutate: deleteAccount } = useDeletesystemAccount(editId);
  const { mutate: updateStatus } = useToggleSystemAccount(editId);

  // console.log(accounts);

  const [formData, setFormData] = useState({
    bank_name: "",
    bank_code: "",
    account_name: "",
    account_number: "",
    type: "",
    status: "",
    created_at: "",
  });
  const { mutate: verify, isLoading: verifying } = useVerifyAccount(formData, setFormData);

  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
  });

  // toggle function to view order details

  const toggle = (type) => {
    setView({
      add: type === "add" ? true : false,
      details: type === "details" ? true : false,
      edit: type === "edit" ? true : false,
    });
  };

  // resets forms
  const resetForm = () => {
    setFormData({
      bank_name: "",
      bank_code: "",
      account_name: "",
      account_number: "",
      type: "",
      status: "",
      created_at: "",
    });
  };

  // Submits form data
  const onFormSubmit = (form) => {
    // console.log(form);
    let submittedData = {
      bank_id: form.bank_code,
      account_name: form.account_name,
      account_number: form.account_number,
    };
    if (formData.account_name) {
      addAccount(submittedData);
      setView({ add: false, details: false, edit: false });
      resetForm();
    } else {
      verify({
        bank_id: form.bank_code,
        account_number: form.account_number,
      });
    }
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    accounts?.data?.forEach((item) => {
      if (item.id === id) {
        setFormData({
          bank_name: item.bank_name,
          bank_code: item.bank_code,
          account_name: item.account_name,
          account_number: item.account_number,
          type: item.type,
          status: item.status,
          created_at: item.created_at,
        });
      }
    });
    setEditedId(id);
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  // function to close the form modal
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

  const ActionOptions = ({ id, status }) => (
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
                    updateStatus();
                  }}
                >
                  <Icon name={status === "active" ? "cross" : "check"}></Icon>
                  <span>{status === "active" ? "Deactivate" : "Activate"}</span>
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  tag="a"
                  href="#"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setEditedId(id);
                    deleteAccount();
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
      <Head title="System Bank Account"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>System Bank Account</BlockTitle>
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
                  <span>Add Account</span>
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <FaqTable
            faqTitle="Accounts"
            defaultData={accounts?.data}
            data={accounts?.data}
            headers={["Bank Code", "Account Name", "Account Number", "Bank", "Status"]}
            dataKeys={["bank_code", "account_name", "account_number", "bank_name", "status"]}
            modelOpen={setView}
            action={ActionOptions}
            isLoading={isLoading}
          />
        </Block>

        {/* ADD CATEGORIES */}
        <Modal isOpen={view.add || view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
          <ModalBody className="bg-white rounded">
            <a href="#cancel" className="close">
              {" "}
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  onFormCancel();
                }}
              ></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">{view.add ? "Add" : "Edit"} Account</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="bank_code">
                          Bank ID
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register("bank_code", {
                              required: "This field is required",
                            })}
                            onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
                            value={formData.bank_code}
                          />
                          {errors.bank_code && <span className="invalid">{errors.bank_code.message}</span>}
                        </div>
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account_number">
                          Account Number
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="number"
                            className="form-control"
                            {...register("account_number", {
                              required: "This field is required",
                            })}
                            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                            value={formData.account_number}
                          />
                          {errors.account_number && <span className="invalid">{errors.account_number.message}</span>}
                        </div>
                      </div>
                    </Col>

                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="account_name">
                          Account Name
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register("account_name")}
                            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                            value={formData.account_name}
                            disabled
                          />
                          {errors.account_name && <span className="invalid">{errors.account_name.message}</span>}
                        </div>
                      </div>
                    </Col>

                    <Col size="12">
                      <Button color="primary" type="submit" disabled={creating || verifying}>
                        <Icon className="plus"></Icon>
                        <span>{formData.account_name ? "Add" : "Verify"} Account</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* View */}
        <Modal isOpen={view.details} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a href="#cancel" className="close">
              {" "}
              <Icon
                name="cross-sm"
                onClick={(ev) => {
                  ev.preventDefault();
                  onFormCancel();
                }}
              ></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">View Account</h5>
              <div className="mt-4">
                <Row className="gy-3">
                  <Col>
                    <span className="sub-text">Bank Code</span>
                    <span className="caption-text text-primary">{formData.bank_code}</span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Account Name</span>
                    <span className="caption-text">{formData.account_name}</span>
                  </Col>
                  <Col lg={6}>
                    <span className="sub-text">Account Number</span>
                    <span className="caption-text">{formData.account_number}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Bank Name</span>
                    <span className="caption-text">{formData.bank_name}</span>
                  </Col>

                  <Col lg={6}>
                    <span className="sub-text">Date Created</span>
                    <span className="caption-text">{formatDateWithTime(formData.created_at)}</span>
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

export default ReferralTermsPage;
