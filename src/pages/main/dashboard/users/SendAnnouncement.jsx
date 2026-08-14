import "antd/dist/reset.css";
import "../../../../assets/scss/antdesign-datepicker.scss";

import { useEffect, useState } from "react";

import { DatePicker } from "antd";
import dayjs from "dayjs";

import { Controller, useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { Button, Col, Icon, RSelect } from "../../../../components/Component";
import { formatDateToISO } from "../../../../utils/Utils";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { TRANSACTION_TYPE_OPTIONS } from "../../../../utils/constants";

const channelOption = [
  { label: "Push", value: "push" },
  { label: "Email", value: "email" },
  { label: "In App", value: "in_app" },
  { label: "SMS", value: "sms" },
];

const SendAnnouncementModal = ({ selectedUsers, modal, closeModal, createFunction }) => {
  const {
    reset,
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    shouldUnregister: false,
    defaultValues: {
      title: "",
      body: "",
      channels: [],
      type: null,
      schedule: true,
      dispatchDate: null,
    },
  });

  const [selectedChannels, setSelectedChannels] = useState([]);
  const [isPersonalised, setIsPersonalised] = useState(false);

  const onSubmit = (data) => {
    if (data.schedule && !data.dispatchDate) {
      toast.error("Select Date and Time");
      return;
    }

    let submittedData;
    const channels = data.channels.map((item) => item.value);
    const hasPushSelected = channels.includes("push");
    const pushType = hasPushSelected && data.type ? (data.type.value ? data.type.value : data.type) : undefined;

    submittedData = {
      title: data.title,
      body: data.body,
      target: "specific",
      channels,
      ...(pushType && { type: pushType }),
      ...(data.schedule && {
        dispatchTime: data.dispatchDate instanceof Date ? formatDateToISO(data.dispatchDate) : data.dispatchDate,
      }),
      ...(!data.schedule && { isImmediate: true }),
      users: selectedUsers,
      ...(isPersonalised && { isPersonalised: true }),
    };

    createFunction(submittedData);
    setSelectedChannels([]);
    setIsPersonalised(false);
    reset();
    closeModal();
  };

  const isScheduled = watch("schedule", true);
  const channels = watch("channels") || [];
  const body = watch("body") || "";

  // Check if SMS is selected
  const hasSMS = channels.some((channel) => channel.value === "sms");
  const hasEmail = channels.some((channel) => channel.value === "email");
  const hasPush = channels.some((channel) => channel.value === "push");

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
          <h5 className="title">Send Announcement</h5>
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
                                maxLength={hasSMS ? maxSMSLength : undefined}
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
              <Col md={hasPush ? "6" : "12"}>
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
              {hasPush && (
                <Col md="6">
                  <div className="form-group">
                    <label className="form-label">Notification Type (Push)</label>
                    <div className="form-control-wrap">
                      <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value }, fieldState }) => (
                          <>
                            <RSelect
                              options={TRANSACTION_TYPE_OPTIONS}
                              value={value}
                              onChange={onChange}
                              placeholder="Select transaction type..."
                              isClearable
                            />
                            {fieldState.error && <span className="invalid">{fieldState.error.message}</span>}
                          </>
                        )}
                      />
                    </div>
                    <small className="text-muted">Transaction type included in push data payload</small>
                  </div>
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
                      Send
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
export default SendAnnouncementModal;
