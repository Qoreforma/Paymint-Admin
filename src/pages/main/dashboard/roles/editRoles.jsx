  import React, { useEffect, useState } from "react";
  import { useForm } from "react-hook-form";
  import { useNavigate, useParams } from "react-router";
  import {
    Block,
    BlockBetween,
    BlockHead,
    BlockHeadContent,
    BlockTitle,
    Button,
    Col,
    Icon,
    PreviewCard,
    Row,
  } from "../../../../components/Component";
  import Content from "../../../../layout/content/Content";
  import Head from "../../../../layout/head/Head";

  import { useGetAllPermissions, useGetRoleById, useUpdateRole } from "../../../../api/users/admin";
  import LoadingSpinner from "../../../components/spinner";

  const EditRoles = () => {
    const navigate = useNavigate();
    const { roleId } = useParams();

    const { data: role, isLoading } = useGetRoleById(roleId);
    const { data: permissions, fetchingPerms } = useGetAllPermissions();
    const { mutate: updateRole } = useUpdateRole();

    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [formData, setFormData] = useState({
      name: "",
      permissions: "",
    });

    const {
      register,
      reset,
      handleSubmit,
      formState: { errors },
    } = useForm({
      defaultValues: {
        name: "",
        description: "",
        permissions: [],
      },
    });

    const handleChange = (e) => {
      const data = selectedPermissions;
      const { id, checked } = e.currentTarget;
      if (checked === true) {
        setSelectedPermissions([...selectedPermissions, id]);
      } else {
        let newData = data.filter((item) => item !== id);
        setSelectedPermissions(newData);
      }
    };

    //   USER NAME
    const onFormSubmit = (data) => {
      let submittedData = {
        name: data.name,
        description: data.description,
        permissions: selectedPermissions,
      };
      updateRole({ roleId, data: submittedData });
    };

    useEffect(() => {
      if (!isLoading && role) {
        reset({
          name: role?.data?.name,
          description: role?.data?.description,
        });
        setSelectedPermissions(role?.data?.permissions);
      }
    }, [isLoading, role, reset]);

    return (
      <React.Fragment>
        <Head title="Edit Roles" />
        <Content>
          <BlockHead size="sm">
            <BlockBetween>
              <BlockHeadContent>
                <BlockTitle tag="h3" page>
                  Edit Role
                </BlockTitle>
              </BlockHeadContent>
              <BlockHeadContent>
                <Button color="light" outline className="bg-white d-none d-sm-inline-flex" onClick={() => navigate(-1)}>
                  <Icon name="arrow-left"></Icon>
                  <span>Back</span>
                </Button>
                <a
                  href="#back"
                  onClick={(ev) => {
                    ev.preventDefault();
                    navigate(-1);
                  }}
                  className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                >
                  <Icon name="arrow-left"></Icon>
                </a>
              </BlockHeadContent>
            </BlockBetween>
          </BlockHead>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Block>
              {fetchingPerms ? (
                <LoadingSpinner />
              ) : (
                <PreviewCard bodyClass="card-inner-stretch">
                  <span>Edit role and permissions.</span>
                  <div className="mt-4">
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                      <Row className="g-4">
                        <Col lg="6">
                          <div className="form-group">
                            <label className="form-label" htmlFor="product-title">
                              Role Name
                            </label>
                            <div className="form-control-wrap">
                              <input
                                type="text"
                                className="form-control"
                                {...register("name", {
                                  required: "This field is required",
                                })}
                                // value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                              {errors.name && <span className="invalid">{errors.name.message}</span>}
                            </div>
                          </div>
                        </Col>
                        <Col lg="12">
                          <div className="form-group">
                            <label className="form-label" htmlFor="product-title">
                              Description
                            </label>
                            <div className="form-control-wrap">
                              <textarea
                                className="form-control"
                                {...register("description", {
                                  required: "This field is required",
                                })}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              />
                              {errors.description && <span className="invalid">{errors.description.message}</span>}
                            </div>
                          </div>
                        </Col>
                        <Col md="12" className="">
                          <span className="text-primary fw-bold fs-16px">Permissions</span>
                          {permissions?.data?.categories && (
                            <div className="mt-3">
                              <div className="col-12 mb-3">
                                <h6 className="text-secondary fw-normal">SELECT ALL</h6>
                                <Row className="g-2 align-center mt-1">
                                  <Col size="4">
                                    <div className="custom-control custom-control-sm custom-checkbox">
                                      <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="all"
                                        checked={
                                          selectedPermissions?.length ===
                                          permissions?.data?.allPermissions?.filter((perm) => perm !== "*")?.length
                                        }
                                        onChange={(e) => {
                                          const { checked } = e.currentTarget;
                                          if (checked === true) {
                                            const allIds = permissions?.data?.allPermissions?.filter(
                                              (perm) => perm !== "*",
                                            );

                                            setSelectedPermissions(allIds);
                                          } else {
                                            setSelectedPermissions([]);
                                          }
                                        }}
                                      />
                                      <label className="custom-control-label" htmlFor="all">
                                        <span className="text-secondary fs-12px text-capitalize">ALL</span>
                                      </label>
                                    </div>
                                  </Col>
                                </Row>
                              </div>
                              {Object.entries(permissions.data.categories).map(
                                ([categoryName, permissions]) =>
                                  categoryName !== "ALL" && (
                                    <div className="col-12 mb-3" key={categoryName}>
                                      <h6 className="text-secondary fw-normal">{categoryName?.replaceAll("_", " ")}</h6>
                                      <Row className="g-2 align-center mt-1">
                                        {Object.entries(permissions).map(([label, code], i) => (
                                          <Col key={code + `-${i}`} size="4">
                                            <div key={code} className="custom-control custom-control-sm custom-checkbox">
                                              <input
                                                type="checkbox"
                                                // defaultChecked={
                                                //   role?.data?.permissions && role.data.permissions.includes(code)
                                                // } //returns true if it's in the array
                                                checked={selectedPermissions?.includes(code)}
                                                className="custom-control-input"
                                                id={code}
                                                onChange={(e) => handleChange(e)}
                                              />
                                              <label className="custom-control-label" htmlFor={code}>
                                                <span className="text-secondary fs-12px text-capitalize">
                                                  {label.replaceAll("_", " ")}
                                                </span>
                                              </label>
                                            </div>
                                          </Col>
                                        ))}
                                      </Row>
                                    </div>
                                  ),
                              )}
                            </div>
                          )}
                        </Col>
                        <Col size="12">
                          <Button color="primary" type="submit">
                            <span>Edit role</span>
                          </Button>
                        </Col>
                      </Row>
                    </form>
                  </div>
                </PreviewCard>
              )}
            </Block>
          )}
        </Content>
      </React.Fragment>
    );
  };

  export default EditRoles;
