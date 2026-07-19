import React, { useEffect, useState } from "react";
import { Badge, Card } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Button,
  Icon,
} from "../../../../components/Component";
import Content from "../../../../layout/content/Content";
import Head from "../../../../layout/head/Head";
import UserProfileAside from "./UserProfileAside";
import PasswordModal from "./modals/PasswordModal";
import TwoFactorModal from "./modals/TwoFactorModal";
import { useSendOtp, useSetOtp, useToggle2FA, useTurnoff2FA, useUpdateAdminPassword } from "../../../../api/settings";
import { useRecoilValue } from "recoil";
import { userState } from "../../../../atoms/userState";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const UserSecurityPage = () => {
  const navigate = useNavigate();
  const admin = useRecoilValue(userState);
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [updatePassModal, setUpdatePassModal] = useState(false);
  const [open2fa, setOpen2fa] = useState(false);
  // const [is2fa, setIs2fa] = useState(false);
  const [formData, setFormData] = useState({
    // oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  //send email
  const { mutate: sendOtp } = useSendOtp(setOpen2fa);

  const { mutate: updatePassword } = useUpdateAdminPassword();
  const { mutate: toggle2FA } = useToggle2FA();

  const [form2fa, setForm2fa] = useState({
    pin: "",
  });

  // function to change the design view under 990 px
  const viewChange = () => {
    if (window.innerWidth < 990) {
      setMobileView(true);
    } else {
      setMobileView(false);
      updateSm(false);
    }
  };

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

  const closeModal = () => {
    setUpdatePassModal(false);
    setOpen2fa(false);
  };

  const resetForm = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setForm2fa({
      pin: "",
    });
  };

  const onSubmit = (data) => {
    const { oldPassword, newPassword, confirmNewPassword } = data;
    if (newPassword !== confirmNewPassword) {
      return toast.error("New password and confirm password do not match");
    }
    updatePassword({ newPassword, currentPassword: oldPassword });
    closeModal();
    resetForm();
  };

  const onSubmitPin = (data) => {
    //API to turn on 2fa
    const submittedData = {
      email: admin?.email,
      otp: data.pin,
    };
    sendOtp(submittedData);
    resetForm();
  };

  const enable2fa = async () => {
    const value = admin?.twoFactorEnabled ? false : true;
    toggle2FA({ enabled: value });
    // navigate(0);

    // if (!admin?.twoFactorAuthentication) {

    //   sendEmail();
    // } else {
    //   turnOff2FA();
    // }
  };

  return (
    <React.Fragment>
      <Head title="Security settings"></Head>
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
                    <BlockTitle tag="h4">Security Settings</BlockTitle>
                    <BlockDes>
                      <p>These settings will help you to keep your account secure.</p>
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
                <Card>
                  <div className="card-inner-group">
                    <div className="card-inner">
                      <div className="between-center flex-wrap g-3">
                        <div className="nk-block-text">
                          <h6>Change Password</h6>
                          <p>Set a unique password to protect your account.</p>
                        </div>
                        <div className="nk-block-actions flex-shrink-sm-0">
                          <ul className="align-center flex-wrap flex-sm-nowrap gx-3 gy-2">
                            <li className="order-md-last">
                              <Button color="primary" type="button" onClick={() => setUpdatePassModal(true)}>
                                Change Password
                              </Button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="between-center flex-wrap flex-md-nowrap g-3">
                        <div className="nk-block-text">
                          <h6>
                            2 Factor Auth &nbsp;{" "}
                            <Badge color={admin?.twoFactorEnabled ? "success" : "warning"} className="ml-0">
                              {admin?.twoFactorEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </h6>
                          <p>
                            Secure your account with 2FA security. When it is activated you will need to enter not only
                            your password, but also a special code using app. You will receive this code via mobile
                            application.{" "}
                          </p>
                        </div>
                        <div className="nk-block-actions">
                          <Button color="primary" onClick={enable2fa}>
                            {admin?.twoFactorEnabled ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Block>
            </div>
          </div>
        </Card>

        {/* CHANGE PASSWORD MODAL */}
        <PasswordModal
          modal={updatePassModal}
          formData={formData}
          setFormData={setFormData}
          closeModal={closeModal}
          onSubmit={onSubmit}
        />

        {/* SUMBIT PIN */}
        <TwoFactorModal
          modal={open2fa}
          formData={form2fa}
          setFormData={setForm2fa}
          closeModal={closeModal}
          onSubmit={onSubmitPin}
        />
      </Content>
    </React.Fragment>
  );
};

export default UserSecurityPage;
