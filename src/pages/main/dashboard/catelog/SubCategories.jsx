import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, ModalBody } from "reactstrap";
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
import CatelogTable from "./CatelogTable";
// import { categoryOptions } from "../product/ProductData";

import { useSearchParams } from "react-router-dom";
import { useGetCategories } from "../../../../api/catalog/category";
import {
  useCreateSubcategory,
  useDeleteSubcategory,
  useGetAllSubcategories,
  useUpdateSubcategory,
} from "../../../../api/catalog/subcategory";

const SubCategoriesPage = () => {
  const [editId, setEditedId] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const { data: categories } = useGetCategories();
  const { data: subcategories, isLoading } = useGetAllSubcategories(currentPage, itemsPerPage, search);
  const { mutate: updateSubcategory } = useUpdateSubcategory();
  const { mutate: createSubcategory } = useCreateSubcategory();
  const { mutate: deleteSubcategory } = useDeleteSubcategory(editId);

  // console.log(subcategories);
  const [data, setData] = useState(subcategories);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    // image: null,
    category: null,
    status: "Inactive",
    productCount: "0 items",
    sizeCount: "0 items",
  });
  const [view, setView] = useState({
    add: false,
    details: false,
    edit: false,
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const categoryOptions = categories?.data?.map((item) => {
    return { label: item.name, value: item.name };
  });

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
      category: null,
    });
  };

  // Submits form data
  const onFormSubmit = (form) => {
    createSubcategory({ name: form.name, category: form.category.value });
    setView({ add: false, details: false, edit: false });
    resetForm();
    searchParams.delete("page");
    setSearchParams(searchParams);
  };

  const onEditSubmit = () => {
    let submittedData;

    subcategories?.data?.forEach((item) => {
      if (item._id === editId) {
        submittedData = {
          subCategoryId: item._id,
          name: formData.name,
          category: formData.category.value,
          // productCount: item.productCount,
          // sizeCount: item.sizeCount,
        };
      }
    });
    updateSubcategory(submittedData);
    resetForm();
    setView({ edit: false, add: false });
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    subcategories?.data?.forEach((item) => {
      if (item._id === id) {
        const categoryValue = { label: item.category, value: item.category };
        setFormData({
          name: item.name,
          category: categoryValue,
          status: item.status,
          productCount: item.productCount,
          sizeCount: item.sizeCount,
        });
      }
    });
    setEditedId(id);
    setView({ add: false, edit: true, details: false });
  };

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  // function to close the form modal
  const onFormCancel = () => {
    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  const updateStatus = (id) => {
    let newStatus;
    subcategories?.data?.forEach((item) => {
      if (item._id === id) {
        if (item.status === "active") {
          newStatus = "inactive";
        } else {
          newStatus = "active";
        }
        // console.log({ id: item._id, other: item.status });
        updateSubcategory({ subCategoryId: item._id, status: newStatus });
      }
    });
  };

  const deleteItem = (id) => {
    setEditedId(id);
    deleteSubcategory();
  };

  return (
    <React.Fragment>
      <Head title="Subcateogries"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>
                Catelog / <strong className="text-primary small">Subcategories</strong>
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
                  <span>Create subcategory</span>
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <CatelogTable
            catelogTitle="subcategories"
            defaultData={subcategories}
            data={data}
            setData={setData}
            headers={["name", "category", "product count", "status"]}
            dataKeys={["name", "category", "product", "status"]}
            edit={(id) => onEditClick(id)}
            modelOpen={setView}
            updateStatus={(id) => updateStatus(id)}
            deleteItem={(id) => deleteItem(id)}
            loading={isLoading}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
          />
        </Block>

        {/* ADD SUBCATEGORIES */}
        <Modal isOpen={view.add} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
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
              <h5 className="title">Add Subcategory</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">
                          subcategory Name
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
                    <Col md="6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="Category">
                          Status
                        </label>
                        <div className="form-control-wrap">
                          <RSelect
                            options={categoryOptions}
                            value={formData.category}
                            onChange={(value) => setFormData({ ...formData, category: value })}
                            //ref={register({ required: "This is required" })}
                          />
                          {errors.category && <span className="invalid">{errors.status.category}</span>}
                        </div>
                      </div>
                    </Col>
                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Add subcategory</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* EDIT CATEGORY */}
        <Modal isOpen={view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="md">
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
              <h5 className="title">Update Subcategory</h5>
              <div className="mt-4">
                <form noValidate onSubmit={handleSubmit(onEditSubmit)}>
                  <Row className="g-3">
                    <Col size="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">
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
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="category">
                          Status
                        </label>
                        <div className="form-control-wrap">
                          <RSelect
                            options={categoryOptions}
                            value={formData.category}
                            onChange={(value) => setFormData({ ...formData, category: value })}
                          />
                          {errors.category && <span className="invalid">{errors.status.category}</span>}
                        </div>
                      </div>
                    </Col>

                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Update Subcategory</span>
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

export default SubCategoriesPage;
