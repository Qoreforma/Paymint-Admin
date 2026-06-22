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
// import { colors } from "./catelogData";
import { useSearchParams } from "react-router-dom";
import { useCreateColor, useDeleteColor, useGetAllColors, useUpdateColor } from "../../../../api/catalog/colors";
import CatelogTable from "./CatelogTable";

const ColorsPage = () => {
  const [editId, setEditedId] = useState();

  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = searchParams.get("limit") ?? 7;
  const currentPage = searchParams.get("page") ?? 1;
  const search = searchParams.get("search") ?? "";

  const { data: colors, isLoading } = useGetAllColors(currentPage, itemsPerPage, search);
  const { mutate: createColor } = useCreateColor();
  const { mutate: updateColor } = useUpdateColor();
  const { mutate: deleteColor } = useDeleteColor(editId);

  const [data, setData] = useState(colors);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    status: "Inactive",
  });
  const [view, setView] = useState({
    add: false,
    edit: false,
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // toggle function to view order details

  const toggle = (type) => {
    setView({
      add: type === "add" ? true : false,
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
    createColor({ name: form.name });
    setView({ add: false, details: false, edit: false });
    resetForm();
    searchParams.delete("page");
    setSearchParams(searchParams);
  };

  const onEditSubmit = () => {
    let submittedData;
    // let newItems = data;
    // let index = newItems.findIndex((item) => item.id === editId);

    colors?.data?.forEach((item) => {
      if (item._id === editId) {
        // console.log(item);
        submittedData = {
          colorId: item._id,
          name: formData.name.trim(),
          status: item.status,
        };
      }
    });
    // console.log(submittedData);
    updateColor(submittedData);
    resetForm();
    setView({ edit: false, add: false });
  };

  // function that loads the want to editted data
  const onEditClick = (id) => {
    colors?.data?.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name: item.name,
          status: item.status,
        });
      }
    });
    setEditedId(id);
    // setFiles([]);
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
    colors?.data?.forEach((item) => {
      if (item._id === id) {
        if (item.status === "active") {
          newStatus = "inactive";
        } else {
          newStatus = "active";
        }
        updateColor({ colorId: item._id, name: item.name.trim(), status: newStatus });
      }
    });
  };

  const deleteItem = (id) => {
    setEditedId(id);
    colors?.data?.forEach((item) => {
      if (item._id === id) {
        deleteColor({ name: item.name });
      }
    });
  };

  return (
    <React.Fragment>
      <Head title="Colors"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>
                Catelog / <strong className="text-primary small">Colors</strong>
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
                  <span>Add color</span>
                </Button>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <CatelogTable
            catelogTitle="colors"
            defaultData={colors}
            data={data}
            setData={setData}
            headers={["Color name", "status"]}
            dataKeys={["name", "status"]}
            edit={(id) => onEditClick(id)}
            modelOpen={setView}
            updateStatus={(id) => updateStatus(id)}
            deleteItem={(id) => deleteItem(id)}
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
              <h5 className="title">Add Color</h5>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Row className="g-3">
                    <Col md="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">
                          Color name
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
                        <span>Add Color</span>
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* EDIT COLOR */}
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
              <h5 className="title">Update Color</h5>
              <div className="mt-4">
                <form noValidate onSubmit={handleSubmit(onEditSubmit)}>
                  <Row className="g-3">
                    <Col size="12">
                      <div className="form-group">
                        <label className="form-label" htmlFor="color name">
                          Color Name
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
                        <span>Update Color</span>
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

export default ColorsPage;
