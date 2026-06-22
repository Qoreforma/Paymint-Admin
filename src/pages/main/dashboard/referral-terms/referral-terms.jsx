import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, UncontrolledDropdown } from "reactstrap";
import {
  useCreateReferralTerm,
  useDeleteReferralTerm,
  useGetReferralTerms,
  useUpdateReferralTerm,
} from "../../../../api/referral-terms";
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
  const [editId, setEditedId] = useState();
  const { isLoading, data: terms } = useGetReferralTerms();
  const { mutate: createTerm } = useCreateReferralTerm();
  const { mutate: updateTerm } = useUpdateReferralTerm(editId);
  const { mutate: deleteTerm } = useDeleteReferralTerm(editId);

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    body: "",
    createdAt: "",
  });
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
      id: null,
      title: "",
      body: "",
      createdAt: "",
    });
  };

  // Submits form data
  const onFormSubmit = (form) => {
    let submittedData = {
      title: form.title,
      body: form.body,
    };
    if (view.add) {
      createTerm(submittedData);
    } else {
      updateTerm(submittedData);
    }

    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    terms?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          id: item?._id,
          title: item?.title,
          body: item?.body,
          createdAt: item?.createdAt,
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
                    deleteTerm();
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
      <Head title="Referral Terms"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Referral Terms</BlockTitle>
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
                  <span>Create Term</span>
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <FaqTable
            faqTitle="Terms"
            defaultData={terms?.data}
            data={terms?.data}
            headers={["Title", "Body", "Date"]}
            dataKeys={["title", "body", "createdAt"]}
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
              <h5 className="title">{view.add ? "Add" : "Edit"} Term</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="title">
                          Title
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register("title", {
                              required: "This field is required",
                            })}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            value={formData.name}
                          />
                          {errors.title && <span className="invalid">{errors.title.message}</span>}
                        </div>
                      </div>
                    </Col>

                    <Col sm="12">
                      <div className="form-group">
                        <label htmlFor="body" className="form-label">
                          Body
                        </label>
                        <div className="form-control-wrap">
                          <textarea
                            className="form-control"
                            type="textarea"
                            id="content"
                            {...register("body", {
                              required: "This field is required",
                            })}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            placeholder="Type content..."
                          />
                        </div>
                      </div>
                    </Col>
                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>{view.add ? "Add" : "Edit"} Term</span>
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
              <h5 className="title">View Referral Term</h5>
              <div className="mt-4">
                <Row className="gy-3">
                  <Col>
                    <span className="sub-text">Title</span>
                    <span className="caption-text text-primary">{formData.title}</span>
                  </Col>
                  <Col>
                    <span className="sub-text">Body</span>
                    <span className="caption-text">{formData.body}</span>
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

export default ReferralTermsPage;
