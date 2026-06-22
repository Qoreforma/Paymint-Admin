import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, Modal, ModalBody } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
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
import UserProfileAside from "./UserProfileAside";
import LoadingSpinner from "../../../components/spinner";
import {
  useGetSystemAccount,
  useVerifyAccount,
  useDeletesystemAccount,
  useCreateSystemAccount,
} from "../../../../api/system-bank-account";
import { useGetBanks } from "../../../../api/generics";
import { LoaderIcon } from "react-hot-toast";
const SystemAccountPage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [editedId, setEditId] = useState();

  const { isLoading, data } = useGetSystemAccount(1, 7);
  const { mutate: addAccount, isPending: creating } = useCreateSystemAccount();
  const { mutate: deleteAccount } = useDeletesystemAccount(editedId);
  const { data: banks } = useGetBanks();

  const bankOptions = useMemo(() => {
    if (banks) {
      return banks?.data?.map((item) => ({ code: item?.bankCode, label: item?.name, value: item?.name }));
    } else return [];
  }, [banks]);

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const [formData, setFormData] = useState({
    bank_name: "",
    bank_code: "",
    account_name: "",
    account_number: "",
    status: "",
    created_at: "",
  });

  const selectedBank = useMemo(() => {
    return bankOptions.find((option) => option.code === formData.bank_code) || null;
  }, [bankOptions, formData.bank_code]);

  const { mutate: verify, isPending: verifying, error: verAccError } = useVerifyAccount(formData, setFormData);

  const onEditClick = (id) => {
    data?.data?.forEach((item) => {
      if (item._id === id) {
        setFormData({
          bank_name: item.bankName,
          bank_code: item.bankCode,
          account_name: item.accountName,
          account_number: item.accountNumber,
          status: item.isActive,
          created_at: item.createdAt,
        });

        setModal(true);
      }
    });
    setEditId(id);
  };

  const [modal, setModal] = useState(false);

  const onFormSubmit = (form) => {
    let submittedData = {
      bankCode: form.bank_code,
      accountName: form.account_name,
      accountNumber: form.account_number,
    };

    addAccount(submittedData);
    closeModal();
  };

  const bankCode = watch("bank_code");
  const accountNumber = watch("account_number");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (accountNumber && accountNumber.length >= 8 && bankCode) {
        verify({
          bankCode,
          accountNumber,
        });
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [accountNumber, bankCode]);

  const closeModal = () => {
    reset({ bank_code: "", account_name: "", account_number: "" });
    setFormData({
      bank_name: "",
      bank_code: "",
      account_name: "",
      account_number: "",
      status: "",
      created_at: "",
    });
    setModal(false);
  };

  // function to change the design view under 990 px
  const viewChange = () => {
    if (window.innerWidth < 990) {
      setMobileView(true);
    } else {
      setMobileView(false);
      updateSm(false);
    }
  };

  // console.log(android?.is_required);

  useEffect(() => {
    viewChange();
    window.addEventListener("load", viewChange);
    window.addEventListener("resize", viewChange);
    document.getElementsByClassName("nk-header")[0].addEventListener("click", function () {
      updateSm(false);
    });
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

  useEffect(() => {
    if (formData) {
      reset(formData);
    }
  }, [formData]);

  return (
    <React.Fragment>
      <Head title="Settings"></Head>
      <Content>
        <Card>
          <div className="card-aside-wrap">
            <div
              className={`card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg ${
                sm ? "content-active" : ""
              }`}
            >
              <UserProfileAside updateSm={updateSm} sm={sm} />
            </div>
            <div className="card-inner card-inner-lg">
              {sm && mobileView && <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>}
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">System Bank Account</BlockTitle>
                    <BlockDes>
                      <p>Account Details associated with Qoreforma.</p>
                    </BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent className="align-self-start d-lg-none">
                    <Button
                      className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="menu-alt-r"></Icon>
                    </Button>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <BlockBetween>
                      <h6 className="overline-title mb-0">Account Details</h6>
                      {data?.data?.length > 0 ? (
                        <div>
                          <a
                            href="#edit"
                            onClick={() => {
                              setEditId(data?.data[0]?._id);
                              deleteAccount();
                            }}
                            className="text-primary"
                          >
                            Delete
                          </a>
                        </div>
                      ) : (
                        <div onClick={() => setModal(true)}>
                          <a href="#edit" onClick={(e) => e.preventDefault()} className="text-primary">
                            Add
                          </a>
                        </div>
                      )}
                    </BlockBetween>
                  </div>

                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      {data?.data?.map((item) => (
                        <div key={item?._id}>
                          <div
                            className="data-item"
                            // onClick={() => {
                            //   setEditId(item?._id);
                            //   onEditClick(item?._id);
                            // }}
                          >
                            <div className="data-col">
                              <span className="data-label">Bank Name</span>
                              <span className="data-value">{item?.bank?.bankName}</span>
                            </div>
                          </div>
                          {/* <div className="data-item">
                            <div className="data-col">
                              <span className="data-label">Bank Code</span>
                              <span className="data-value">{item?.bankCode}</span>
                            </div>
                          </div> */}
                          <div className="data-item">
                            <div className="data-col">
                              <span className="data-label">Account Number</span>
                              <span className="data-value">{item?.accountNumber}</span>
                            </div>
                          </div>
                          <div className="data-item">
                            <div className="data-col">
                              <span className="data-label">Account Name</span>
                              <span className="data-value">{item?.accountName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Block>

              <Modal isOpen={modal} className="modal-dialog-centered" size="lg" toggle={() => closeModal()}>
                <a
                  href="#dropdownitem"
                  onClick={(ev) => {
                    ev.preventDefault();
                    closeModal();
                  }}
                  className="close"
                >
                  <Icon name="cross-sm"></Icon>
                </a>
                <ModalBody>
                  <div className="p-2">
                    <h5 className="title">Update {formData.title}</h5>
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                      <Row className="g-3">
                        <Col md="12">
                          <div className="form-group">
                            <label className="form-label" htmlFor="bank_code">
                              Banks
                            </label>
                            <div className="form-control-wrap">
                              <RSelect
                                options={bankOptions}
                                value={selectedBank}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    bank_code: e.code,
                                    bank_name: e.label,
                                  })
                                }
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
                                onChange={(e) =>
                                  setFormData({ ...formData, account_number: e.target.value, account_name: "" })
                                }
                                value={formData.account_number}
                              />
                              {errors.account_number && (
                                <span className="invalid">{errors.account_number.message}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                        {verifying && (
                          <div className="d-flex align-items-center gap-2">
                            {/* <LoaderIcon className="size-4 mt-2" /> */}
                            <span
                              style={{
                                fontSize: "14px",
                                fontStyle: "italic",
                              }}
                            >
                              Verifying account number...
                            </span>
                          </div>
                        )}
                        {verAccError && (
                          <p className="invalid">
                            {verAccError
                              ? verAccError?.response?.data?.message
                              : "Something went wrong, please try again"}
                          </p>
                        )}

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
                          <Button
                            color="primary"
                            type="submit"
                            disabled={creating || verifying || formData.account_name === ""}
                          >
                            <Icon className="plus"></Icon>
                            <span>{formData.account_name ? "Add" : "Verify"} Account</span>
                          </Button>
                        </Col>
                      </Row>
                    </form>
                  </div>
                </ModalBody>
              </Modal>
            </div>
          </div>
        </Card>
      </Content>
    </React.Fragment>
  );
};

export default SystemAccountPage;
