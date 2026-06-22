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
  Row,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import CatelogTable from "./CatelogTable";

import { useSearchParams } from "react-router-dom";
import { useCreateBrands, useDeleteBrands, useGetAllBrands, useUpdateBrands } from "../../../../api/catalog/brand";
const BrandsPage = () => {
  const [editId, setEditedId] = useState();
  const [searchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const { data: brands, isLoading } = useGetAllBrands(currentPage, itemsPerPage, search);
  const { mutate: createBrand } = useCreateBrands();
  const { mutate: updateBrand } = useUpdateBrands();
  const { mutate: deleteBrand } = useDeleteBrands(editId);

  const [data, setData] = useState(brands);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
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

  // resets forms
  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
    });
  };

  // Submits form data
  const onFormSubmit = async (form) => {
    let submittedData = {
      name: form.name,
    };

    createBrand(submittedData);
    setView({ add: false, details: false, edit: false });
    resetForm();
  };

  const onEditSubmit = async () => {
    let submittedData;

    brands?.data?.forEach((item) => {
      if (item._id === editId) {
        submittedData = {
          brandId: item._id,
          name: formData.name,
        };
      }
    });

    updateBrand(submittedData);
    resetForm();
    setView({ edit: false, add: false });
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    brands?.data?.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name: item.name,
          status: item.status,
          productCount: item.product,
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
    brands?.data?.forEach((item) => {
      if (item._id === id) {
        if (item.status === "active") {
          newStatus = "inactive";
        } else {
          newStatus = "active";
        }
        updateBrand({ brandId: item._id, status: newStatus });
      }
    });
  };

  const deleteItem = (id) => {
    setEditedId(id);
    deleteBrand();
  };

  return (
    <React.Fragment>
      <Head title="Brands"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>
                Catelog / <strong className="text-primary small">Brands</strong>
              </BlockTitle>
            </BlockHeadContent>
            {/* <BlockHeadContent>
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
                  <span>Create brand</span>
                </Button>
              </div>
            </BlockHeadContent> */}
          </BlockBetween>
        </BlockHead>

        <Block>
          <CatelogTable
            catelogTitle="brands"
            defaultData={brands}
            data={data ? data : []}
            setData={setData}
            headers={["name", "product count", "status"]}
            dataKeys={["name", "products", "status"]}
            edit={(id) => onEditClick(id)}
            modelOpen={setView}
            deleteItem={(id) => deleteItem(id)}
            updateStatus={(id) => updateStatus(id)}
            loading={isLoading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
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
              <h5 className="title">Add Brand</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">
                          Brand Name
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
                    {/* <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="date">
                          Brand Image
                        </label>
                        <div className="form-control-wrap">
                          <Dropzone onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)} multiple={false}>
                            {({ getRootProps, getInputProps }) => (
                              <section>
                                <div {...getRootProps()} className="dropzone upload-zone small my-2 dz-clickable">
                                  <input {...getInputProps()} />
                                  {files.length === 0 && <p>Drag 'n' drop some files here, or click to select files</p>}
                                  {files.length === 1 && <p>Drag 'n' drop some files here, or click to update image</p>}
                                  {files.map((file) => (
                                    <div
                                      key={file.name}
                                      className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                    >
                                      <div className="dz-image">
                                        <img src={file.preview} alt="preview" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}
                          </Dropzone>
                          {errors.image && <span className="invalid">{errors.image.message}</span>}
                        </div>
                      </div>
                    </Col> */}
                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Add Brand</span>
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
              <h5 className="title">Update Brand</h5>
              <div className="mt-4">
                <form noValidate onSubmit={handleSubmit(onEditSubmit)}>
                  <Row className="g-3">
                    <Col size="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">
                          Brand Name
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
                    {/* <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="date">
                          Brand Logo
                        </label>
                        <div className="form-control-wrap">
                          <Dropzone
                            onDrop={(acceptedFiles) => {
                              setChangedImage(true);
                              handleDropChange(acceptedFiles);
                            }}
                            multiple={false}
                          >
                            {({ getRootProps, getInputProps }) => (
                              <section>
                                <div {...getRootProps()} className="dropzone upload-zone small my-2 dz-clickable">
                                  <input {...getInputProps()} />
                                  {files.length === 0 && <p>Drag 'n' drop some files here, or click to select files</p>}
                                  {files.length === 1 && <p>Drag 'n' drop some files here, or click to update image</p>}

                                  {files.map((file) => (
                                    <div
                                      key={file.name}
                                      className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                                    >
                                      <div className="dz-image">
                                        <img src={file.preview} alt="preview" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}
                          </Dropzone>
                          {errors.image && <span className="invalid">{errors.image.message}</span>}
                        </div>
                      </div>
                    </Col> */}

                    <Col size="12">
                      <Button color="primary" type="submit">
                        <Icon className="plus"></Icon>
                        <span>Update Brand</span>
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

export default BrandsPage;
