import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { forgotUserPassword } from "../services/apiService";
import PopUp from "../pages/PopUp";
const SendOTP = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  console.log("test");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const [isResendOtp, setIsResendOtp] = useState(false);

  const Logo = require("../assets/images/LOGO.png");
  const Group = require("../assets/images/Group 1000002969.png");
  const mian = require("../assets/images/mian.png");
  const [loading, setLoading] = useState(false);

  // State to track the selected tab
  const [selectedTab, setSelectedTab] = useState("Finance");

  // Function to handle tab selection
  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  // State to hold the input values
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailValidationError, setEmailValidationError] = useState("");

  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const SendEmailOtp = async () => {
    if (emailOrUsername == "") {
      setEmailError(true);
      return;
    }
    // Check if email address is valid
    if (!emailRegex.test(emailOrUsername)) {
      setEmailValidationError(true);
      return;
    }
    if (emailOrUsername) {
      setLoading(true);
      try {
        try {
          let userData = {
            email: emailOrUsername,
          };
          const response = await forgotUserPassword(userData);
          console.log(response, "login_response");
          if (response?.status == true) {
            // navigate("/otp-verification", { state: { emailOrUsername } });
            setIsResendOtp(false);

            setMessage(`${response?.message}`);
            setOpenPopUp(true);
          } else {
            setIsResendOtp(true);

            setMessage(`${response?.message}`);
            setOpenPopUp(true);
          }
        } catch (error) {}
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePopupClose = () => {
    if (isResendOtp == false) {
      setOpenPopUp(false);
      navigate("/login");
    } else {
      setOpenPopUp(false);
    }
  };

  return (
    <>
      <div>
        <div className="transocean_login">
          <div className="group">
            <img className="logoside" src={Group}></img>
          </div>
          <div className="container">
            <div className="row alignbox">
              <div className="col-lg-6 same-level">
                <div className="d-flex flex-column mb-3">
                  <img className="logo" src={Logo}></img>
                  <img className="mainpng" src={mian} alt=""></img>
                </div>
              </div>

              <div className="col-lg-6 same-level">
                <div className="logincard">
                  <div className="maincard">
                    <div>
                      <h3 className="text-center login_text">
                        Forgot Password
                      </h3>
                    </div>

                    <div className="mb-3 ">
                      <label
                        htmlFor="exampleInputEmail1"
                        className="form-label"
                      >
                        Enter Your email ID
                      </label>

                      <input
                        type="email"
                        className={`form-control vessel-voyage ${
                          emailError ? "is-invalid" : ""
                        }`}
                        id="exampleFormControlInput1"
                        placeholder="Enter email"
                        value={emailOrUsername}
                        onChange={(e) => {
                          setEmailOrUsername(e.target.value);
                          setEmailError(false); // Clear "to" error on change
                          setEmailValidationError(false); // Clear email error on change
                        }}
                        required
                      />

                      {emailError && (
                        <>
                          <div className="invalid">Please enter email</div>
                        </>
                      )}
                      {emailValidationError && (
                        <>
                          <div className="invalid">
                            Please enter a valid email address.
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      onClick={() => {
                        SendEmailOtp();
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex bottom-head">
          <p className="copyright">Copyright@ transocean</p>
          <p className="footerlinks">
            <a href="#">Policy</a> | <a href="#"> Terms & Conditions </a>{" "}
          </p>
        </div>
      </div>
      {openPopUp && <PopUp message={message} closePopup={handlePopupClose} />}
    </>
  );
};

export default SendOTP;
