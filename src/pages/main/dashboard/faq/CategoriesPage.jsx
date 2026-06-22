import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, UncontrolledDropdown } from "reactstrap";
import {
  useCreateFaqCategory,
  useDeleteFaqCategory,
  useGetFaqCategories,
  useToggleFaqCategory,
  useUpdateFaqCategory,
} from "../../../../api/faqs";
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
import { faqStatusType } from "./faqData";
import FaqTable from "./faqTable";

const FaqCategoriesPage = () => {
  const [editId, setEditedId] = useState();

  const { isLoading, data: faqCategories } = useGetFaqCategories();
  const { mutate: createCategory } = useCreateFaqCategory();
  const { mutate: updateCategory } = useUpdateFaqCategory(editId);
  const { mutate: deleteCategory } = useDeleteFaqCategory(editId);
  const { mutate: toggleCategory } = useToggleFaqCategory(editId);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    faqCount: "",
    createdAt: "",
    status: "",
  });
  // console.log(faqCategories);
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
      name: "",
      faqCount: "",
      createdAt: "",
      status: "",
    });
  };

  // Submits form data
  const onFormSubmit = (form) => {
    // console.log(form);
    const submittedData = {
      name: form.name,
      isActive: form.status === "Active" ? true : false,
    };
    createCategory(submittedData);

    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  const onEditSubmit = (data) => {
    // console.log(data);

    let submittedData = {
      name: data?.name,
      isActive: data.status === "Active" ? true : false,
    };

    updateCategory(submittedData);

    resetForm();
    setView({ edit: false, add: false, details: false });
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    faqCategories?.data?.forEach((item) => {
      if (item?._id === id) {
        setFormData({
          name: item?.name,
          faqCount: item?.faqCount,
          createdAt: item?.createdAt,
          status: item?.isActive ? "Active" : "Inactive",
        });
      }
    });
    setEditedId(id);
    setView({ add: false, edit: true, details: false });
  };

  useEffect(() => {
    reset(formData);
  }, [formData]);

  // function to close the form modal
  const onFormCancel = () => {
    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  const activiate = (status) => {
    let submittedData;
    faqCategories?.data?.forEach((item) => {
      if (item.id === editId) {
        submittedData = {
          name: item?.name,
          status: status === "active" ? false : true,
        };
      }
    });

    updateCategory(submittedData);
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
  );

  return (
    <React.Fragment>
      <Head title="FAQ cateogries"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>
                FAQ / <strong className="text-primary small">Categories</strong>
              </BlockTitle>
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
                  <span>Create category</span>
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <FaqTable
            faqTitle="Categories"
            defaultData={faqCategories?.data}
            data={faqCategories?.data}
            headers={["name", "faq count", "date", "status"]}
            dataKeys={["name", "faqCount", "createdAt", "isActive"]}
            modelOpen={setView}
            action={ActionOptions}
            statusField={({ id, status }) => (
              <div className="custom-control-sm custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  name={id}
                  checked={status}
                  onClick={() => {
                    console.log({ id, status });
                    setEditedId(id);
                    toggleCategory({ isActive: !status });
                  }}
                  id={id}
                />
                <label className="custom-control-label" htmlFor={id}>
                  <span className={`ccap fw-medium ${status ? "text-success" : "text-muted"}`}>
                    {status ? "active" : "inactive"}
                  </span>
                </label>
              </div>
            )}
            isLoading={isLoading}
          />
        </Block>

        {/* ADD CATEGORIES */}
        <Modal isOpen={view.add} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
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
              <h5 className="title">Add Category</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="customer">
                          Category Name
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register("name", {
                              required: "This field is required",
                            })}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            value={formData.name}
                          />
                          {errors.name && <span className="invalid">{errors.name.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <div className="form-control-wrap">
                          <RSelect
                            options={faqStatusType}
                            defaultValue={{
                              value: formData.status,
                              label: formData.status,
                            }}
                            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.value }))}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Add Category</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* EDIT CATEGORY */}
        <Modal isOpen={view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
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
              <h5 className="title">Update Category</h5>
              <div className="mt-4">
                <form noValidate onSubmit={handleSubmit(onEditSubmit)}>
                  <Row className="g-3">
                    <Col size="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="product-title">
                          Category Name
                        </label>
                        <div className="form-control-wrap">
                          <input
                            type="text"
                            className="form-control"
                            {...register("name", {
                              required: "This field is required",
                            })}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                          {errors.name && <span className="invalid">{errors.name.message}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <div className="form-control-wrap">
                          <RSelect
                            options={faqStatusType}
                            defaultValue={{
                              value: formData.status,
                              label: formData.status,
                            }}
                            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.value }))}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Update Category</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};

export default FaqCategoriesPage;
