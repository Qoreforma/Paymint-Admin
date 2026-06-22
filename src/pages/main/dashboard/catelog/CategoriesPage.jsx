import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { Modal, ModalBody } from "reactstrap";
import {
  useCreateCategory,
  useDeleteCategory,
  useGetAllCategories,
  useUpdateCategory,
} from "../../../../api/catalog/category";
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
import CatelogTable from "./CatelogTable";

const CategoriesPage = () => {
  const [editId, setEditedId] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const { data: categories, isLoading } = useGetAllCategories(currentPage, itemsPerPage, search);
  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory(editId);

  // console.log(categories);
  const [data, setData] = useState(categories);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    image: null,
    subcategory: "0 items",
    status: "Inactive",
    productCount: "0 items",
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
      image: null,
    });
  };

  // Submits form data
  const onFormSubmit = async (form) => {
    let submittedData = {
      name: form.name.trim(),
    };

    createCategory(submittedData);
    setView({ add: false, details: false, edit: false });
    resetForm();
    searchParams.delete("page");
    setSearchParams(searchParams);
  };

  const onEditSubmit = async () => {
    let submittedData;

    categories.data.forEach((item) => {
      if (item._id === editId) {
        submittedData = {
          categoryId: item._id,
          name: formData.name.trim(),
        };
      }
    });
    //need api incase i need to update category  images and name
    updateCategory(submittedData);
    resetForm();
    setView({ edit: false, add: false, details: false });
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    categories.data.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name: item.name.trim(),
          image: item.images,
          subcategory: item.subCategories,
          status: item.status,
          productCount: item.products,
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
    categories.data.forEach((item) => {
      if (item._id === id) {
        if (item.status === "active") {
          newStatus = "inactive";
          // console.log(newStatus);
        } else {
          newStatus = "active";
        }
        updateCategory({ categoryId: item._id, status: newStatus });
      }
    });
  };

  const deleteItem = (id) => {
    setEditedId(id);
    deleteCategory();
  };

  return (
    <React.Fragment>
      <Head title="Cateogries"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>
                Catalog / <strong className="text-primary small">Categories</strong>
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
          <CatelogTable
            catelogTitle="Categories"
            defaultData={categories}
            data={data ? data : []}
            setData={setData}
            headers={["name", "subcategory", "product count", "status"]}
            dataKeys={["name", "subCategories", "products", "status"]}
            edit={(id) => onEditClick(id)}
            modelOpen={setView}
            updateStatus={(id) => updateStatus(id)}
            deleteItem={(id) => deleteItem(id)}
            loading={isLoading}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
          />
        </Block>

        {/* ADD CATEGORIES */}
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

export default CategoriesPage;
