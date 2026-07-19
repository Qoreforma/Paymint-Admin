import "antd/dist/reset.css";
import "../../../../assets/scss/antdesign-datepicker.scss";

import { useEffect, useMemo, useState } from "react";

import { DatePicker } from "antd";
import dayjs from "dayjs";

import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { Button, Col, Icon, RSelect, RASelect } from "../../../../components/Component";
import { formatDateTimeNumeric, formatDateToISO } from "../../../../utils/Utils";
import toast from "react-hot-toast";
import BACKEND_URLS from "../../../../api/urls";
import Cookies from "js-cookie";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const channelOption = [
  { label: "Push", value: "push" },
  { label: "Email", value: "email" },
  { label: "In App", value: "in_app" },
  { label: "SMS", value: "sms" },
];

const targetOption = [
  { label: "All", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Specific", value: "specific" },
  { label: "Phone Verified", value: "phone-verified" },
  { label: "Email Verified", value: "email-verified" },
  { label: "Profile Completed", value: "profile-completed" },
  { label: "Low Balance (< 50 NGN)", value: "lowbalance" },
  { label: "Inactive (15+ Days)", value: "inactive-15" },
  { label: "Inactive (30+ Days)", value: "inactive-30" },
  { label: "Inactive (45+ Days)", value: "inactive-45" },
  { label: "Inactive (60+ Days)", value: "inactive-60" },
];

const AddModal = ({ modal, closeModal, formData, isEdit, createFunction, editFunction }) => {
  const {
    reset,
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    shouldUnregister: false,
    defaultValues: {
      title: formData.title || "",
      body: formData.body || "",
      channels: [],
      target: null,
      schedule: true,
      dispatchDate: null,
    },
  });

  const access_token = Cookies.get("access_token");

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [isPersonalised, setIsPersonalised] = useState(false);

  const userOptions = async (value) => {
    const searchTerm = value ? `&search=${value}` : "";

    const data = await fetch(`${BACKEND_URLS.baseURL}${BACKEND_URLS.users}?page=1&per_page=10${searchTerm}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((response) => response.json())
      .then((response) => response?.data);

    const final = data?.map((data) => ({
      id: data?._id,
      value: `${data.firstname} ${data?.lastname} - ${data?.email}`,
      label: `${data.firstname} ${data?.lastname} - ${data?.email}`,
    }));
    return final;
  };

  const onSubmit = (data) => {
    if (data.schedule && !data.dispatchDate) {
      toast.error("Select Date and Time");
      return;
    }

    let submittedData;
    const channels = data.channels.map((item) => item.value);

    let target_users = selectedUsers.map((item) => item.id);
    let target = data.target.value ? data.target.value : data.target;

    if (target === "specific") {
      submittedData = {
        title: data.title,
        body: data.body,
        target: data.target.value ? data.target.value : data.target,
        channels,
        ...(data.schedule && {
          dispatchTime: data.dispatchDate instanceof Date ? formatDateToISO(data.dispatchDate) : data.dispatchDate,
        }),
        ...(!data.schedule && { isImmediate: true }),
        users: target_users,
        ...(isPersonalised && { isPersonalised: true }),
      };
    } else {
      submittedData = {
        title: data.title,
        body: data.body,
        target: data.target.value ? data.target.value : data.target,
        channels,
        ...(data.schedule && {
          dispatchTime: data.dispatchDate instanceof Date ? formatDateToISO(data.dispatchDate) : data.dispatchDate,
        }),
        ...(!data.schedule && { isImmediate: true }),
        ...(isPersonalised && { isPersonalised: true }),
      };
    }
    if (isEdit) {
      editFunction({ ...submittedData, ...(data.schedule && { status: "pending" }) });
    } else {
      createFunction(submittedData);
    }
    setSelectedUsers([]);
    setSelectedChannels([]);
    setIsPersonalised(false);
    closeModal();
  };

  const defaultChannel = useMemo(() => {
    if (!formData.channels) return [];

    return formData.channels.map((channel) => ({
      label: channel === "push" ? "Push" : channel === "email" ? "Email" : channel === "sms" ? "SMS" : "In App",
      value: channel,
    }));
  }, [formData]);

  const targetType = watch("target");
  const isScheduled = watch("schedule", true);
  const channels = watch("channels") || [];
  const body = watch("body") || "";

  // Check if SMS is selected
  const hasSMS = channels.some((channel) => channel.value === "sms");
  const hasEmail = channels.some((channel) => channel.value === "email");

  // Handle channel change to enforce Email alone rule
  const handleChannelChange = (selectedOptions) => {
    const hasEmailSelected = selectedOptions.some((option) => option.value === "email");

    if (hasEmailSelected) {
      // If Email is selected, only keep Email
      const emailOnly = selectedOptions.filter((option) => option.value === "email");
      setSelectedChannels(emailOnly);
      setValue("channels", emailOnly);
    } else {
      setSelectedChannels(selectedOptions);
      setValue("channels", selectedOptions);
    }
  };

  useEffect(() => {
    const defaultChannels = formData.channels
      ? formData.channels.map((channel) => ({
          label: channel === "push" ? "Push" : channel === "email" ? "Email" : channel === "sms" ? "SMS" : "In App",
          value: channel,
        }))
      : [];

    const defaultUsers = formData.users?.map((user) => ({
      id: user?._id,
      value: `${user.firstname} ${user?.lastname} - ${user?.email}`,
      label: `${user.firstname} ${user?.lastname} - ${user?.email}`,
    }));

    reset({
      title: formData.title || "",
      body: formData.body || "",
      channels: defaultChannels,
      target: formData.target ? { label: formData.target, value: formData.target } : null,
      schedule: formData.isImmediate,
      dispatchDate: formData.dispatchDate ? dayjs(formData.dispatchDate).toDate() : null,
    });
    setSelectedChannels(defaultChannels);
    setSelectedUsers(defaultUsers);
    setIsPersonalised(formData.isPersonalised || false);
  }, [formData, reset]);

  // Character count for SMS
  const characterCount = body.length;
  const maxSMSLength = 160;

  return (
    <Modal isOpen={modal} toggle={() => closeModal()} className="modal-dialog-centered" size="lg">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            closeModal();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">{isEdit ? "Edit" : "Add"} Announcement</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Col>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    type="text"
                    {...register("title", { required: "This field is required" })}
                    placeholder="Enter Title"
                  />
                  {errors.title && <span className="invalid">{errors.title.message}</span>}
                </div>
              </Col>
              <Col>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-default-textarea">
                    Message
                  </label>
                  <div className="form-control-wrap">
                    {hasEmail ? (
                      // ReactQuill for Email
                      <Controller
                        control={control}
                        name="body"
                        rules={{
                          validate: (value) => {
                            const text = value
                              ?.replace(/<(.|\n)*?>/g, "")
                              ?.replace(/&nbsp;/g, "")
                              ?.trim();

                            return text ? true : "This is required";
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <>
                            <ReactQuill
                              theme="snow"
                              value={field.value || ""}
                              onChange={(value) => field.onChange(value)}
                              onBlur={() => field.onBlur()}
                              placeholder="Write your email message"
                              modules={{
                                toolbar: [
                                  [{ header: [1, 2, 3, false] }],
                                  ["bold", "italic", "underline", "strike"],
                                  ["blockquote", "code-block"],
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  ["link", "image"],
                                  ["clean"],
                                ],
                              }}
                              style={{ height: "200px", marginBottom: "50px" }}
                            />
                            {fieldState.error && <span className="invalid">{fieldState.error.message}</span>}
                          </>
                        )}
                      />
                    ) : (
                      // Regular textarea for other channels
                      <>
                        <Controller
                          name="body"
                          control={control}
                          rules={{
                            validate: (value) => {
                              if (hasEmail) {
                                const text = value
                                  ?.replace(/<(.|\n)*?>/g, "")
                                  ?.replace(/&nbsp;/g, "")
                                  ?.trim();

                                return text ? true : "This is required";
                              }

                              return value?.trim() ? true : "This is required";
                            },
                          }}
                          render={({ field, fieldState }) => (
                            <>
                              <textarea
                                {...field}
                                className="form-control form-control-sm"
                                placeholder="Write your message"
                              />
                              {fieldState.error && <span className="invalid">{fieldState.error.message}</span>}
                            </>
                          )}
                        />
                        {hasSMS && (
                          <div
                            className={`mt-1 text-end ${characterCount > maxSMSLength ? "text-danger" : "text-muted"}`}
                          >
                            {characterCount}/{maxSMSLength} characters
                            {characterCount > maxSMSLength && " - Exceeds SMS limit!"}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Select Channel</label>
                  <div className="form-control-wrap">
                    <Controller
                      control={control}
                      name="channels"
                      rules={{ required: "Please select at least one channel" }}
                      render={({ fieldState }) => (
                        <>
                          <RSelect
                            isMulti
                            options={channelOption}
                            value={selectedChannels}
                            onChange={handleChannelChange}
                            placeholder="Select channels..."
                          />
                          {fieldState.error && <span className="invalid">{fieldState.error.message}</span>}
                        </>
                      )}
                    />
                  </div>
                  <small className="text-muted">Note: Email can only be selected alone</small>
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Select Target Users</label>
                  <div className="form-control-wrap">
                    <Controller
                      control={control}
                      name="target"
                      rules={{ required: "Please select a target" }}
                      render={({ field: { onChange, value }, fieldState }) => (
                        <>
                          <RSelect
                            options={targetOption}
                            value={value}
                            onChange={onChange}
                            placeholder="Select target..."
                          />
                          {fieldState.error && <span className="invalid">{fieldState.error.message}</span>}
                        </>
                      )}
                    />
                  </div>
                </div>
              </Col>
              {targetType?.value === "specific" && (
                <Col>
                  <label className="form-label">Select Users</label>
                  <RASelect
                    isMulti
                    cacheOptions
                    defaultOptions
                    loadOptions={userOptions}
                    value={selectedUsers}
                    defaultValue={selectedUsers}
                    placeholder={"Select Users"}
                    onChange={(e) => setSelectedUsers(e)}
                  />
                </Col>
              )}

              <Col md="6">
                <div className="form-group">
                  <label className="form-label d-block">Delivery</label>
                  <Controller
                    control={control}
                    name="schedule"
                    defaultValue={true}
                    render={({ field }) => (
                      <div className="custom-control-sm custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="scheduleAnnouncement"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <label className="custom-control-label" htmlFor="scheduleAnnouncement">
                          <span className={`fw-medium ${field.value ? "text-primary" : "text-success"}`}>
                            {field.value ? "Schedule for Later" : "Send Immediately"}
                          </span>
                        </label>
                      </div>
                    )}
                  />
                </div>
              </Col>

              {isScheduled && (
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Schedule Date & Time</label>
                    <Controller
                      control={control}
                      name="dispatchDate"
                      rules={{
                        validate: (value) => !isScheduled || value || "Please select a Schedule date and time",
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <DatePicker
                            className="custom-datepicker"
                            showTime={{
                              format: "h:mm A",
                              disabledTime: (selectedDate) => {
                                if (!selectedDate || !selectedDate.isSame(dayjs(), "day")) {
                                  return {};
                                }
                                const now = dayjs();
                                return {
                                  disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
                                  disabledMinutes: (selectedHour) =>
                                    selectedHour === now.hour()
                                      ? Array.from({ length: now.minute() }, (_, i) => i)
                                      : [],
                                };
                              },
                            }}
                            format="MMM D, YYYY h:mm A"
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => field.onChange(date ? date.toDate() : null)}
                            disabledDate={(current) => current && current < dayjs().startOf("day")}
                            placeholder="Select date and time"
                          />
                          {fieldState.error && <span className="invalid">{fieldState.error.message}</span>}
                        </>
                      )}
                    />
                  </div>
                </Col>
              )}

              <Col md="6">
                <div className="form-group">
                  <label className="form-label d-block">Personalised</label>
                  <div className="custom-control-sm custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="personalisedAnnouncement"
                      checked={isPersonalised}
                      onChange={(e) => setIsPersonalised(e.target.checked)}
                    />
                    <label className="custom-control-label" htmlFor="personalisedAnnouncement">
                      <span className={`fw-medium ${isPersonalised ? "text-primary" : "text-muted"}`}>
                        {isPersonalised ? "Personalised" : "Not Personalised"}
                      </span>
                    </label>
                  </div>
                </div>
              </Col>

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      {isEdit ? "Edit" : "Create"}
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        closeModal();
                      }}
                      className="link link-light"
                    >
                      Cancel
                    </a>
                  </li>
                </ul>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default AddModal;
