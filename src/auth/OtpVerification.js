import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateOTP, forgotUserPassword } from "../services/apiService";
import PopUp from "../pages/PopUp";
import { useLocation } from "react-router-dom";
const OtpVerification = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  console.log("test");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const Group = require("../assets/images/Group 1000002969.png");
  const mian = require("../assets/images/mian.png");
  const [loading, setLoading] = useState(false);
  const [isResendOtp, setIsResendOtp] = useState(false);

  // State to track the selected tab
  const [selectedTab, setSelectedTab] = useState("Finance");

  // Function to handle tab selection
  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  // State to hold the input values
  const [emailError, setEmailError] = useState("");
  const [emailValidationError, setEmailValidationError] = useState("");

  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    setOtp(newOtp);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("Text").split("");
    if (pastedData.length === 8) {
      setOtp(pastedData);
      inputRefs.current[3].focus();
    }
  };

  const handleVerify = () => {
    const newOTP = otp.join("");
    resetPassword(newOTP);
    setOtp(["", "", "", ""]);
    inputRefs.current[0].focus();
  };

  const location = useLocation();

  const emailOrUsername = location.state?.emailOrUsername; // Access the passed row object

  console.log("emailOrUsername:", emailOrUsername);

  const resetPassword = async (newOTP) => {
    try {
      try {
        const userData = {
          email: emailOrUsername,
          resetToken: newOTP,
        };
        console.log(userData, "userData");
        const response = await validateOTP(userData);
        console.log(response, "login_response");
        if (response?.status == true) {
          setIsResendOtp(false);
          setUserId(response?.user);
          setMessage(`${response?.message}`);
          setOpenPopUp(true);
        } else if (response?.status == false) {
          setIsResendOtp(true);
          setMessage(`${response?.message}`);
          setOpenPopUp(true);
        }
      } catch (error) {}
    } catch (error) {
    } finally {
      setLoading(false);
    }

    setIsLoading(true);
  };

  const SendEmailOtp = async () => {
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
            setIsResendOtp(true);
            setMessage(`${"OTP has been successfully resent"}`);
            setOpenPopUp(true);
          } else if (response?.status == false) {
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
      navigate("/reset-password", { state: { userId } });
    } else {
      setOpenPopUp(false);
    }
  };

  useEffect(() => {
    console.log(userId, "userId");
  }, [userId]);
  return (
    <>
      <div>
        <div className="transocean_login">
          <div className="group">
            <img className="logoside" src={Group}></img>
          </div>
          <div className="container">
            <div className="row alignboxotp">
              <div className="col-lg-6 same-level">
                <div className="d-flex flex-column mb-3">
                  <img className="mainpng" src={mian} alt=""></img>
                </div>
              </div>
              <div className="col-lg-6 same-level">
                <div className="logincard">
                  <div className="maincard">
                    <div>
                      <h3 className="text-center login_text">
                        OTP Verification
                      </h3>
                    </div>
                    {/* <div className="mb-5  ">
                      <label htmlFor="exampleInputEmail1" className="form-label">
                        Enter OTP{" "}
                      </label>
                      <div className="otp gap-3">
                        <input
                          type="email"
                          className="form-control otpform"
                          id="exampleInputEmail1"
                          placeholder="8"
                          aria-describedby="emailHelp"
                        />
                        <input
                          type="email"
                          className="form-control otpform"
                          id="exampleInputEmail1"
                          placeholder="4"
                          aria-describedby="emailHelp"
                        />
                        <input
                          type="email"
                          className="form-control otpform"
                          id="exampleInputEmail1"
                          placeholder="3"
                          aria-describedby="emailHelp"
                        />
                        <input
                          type="email"
                          className="form-control otpform"
                          id="exampleInputEmail1"
                          placeholder="2"
                          aria-describedby="emailHelp"
                        />
                      </div>
                    </div> */}
                    <div>
                      <div onPaste={handlePaste} className="otp-boxes">
                        {otp.map((value, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            className="otp"
                            value={value}
                            onChange={(e) =>
                              handleChange(e.target.value, index)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            ref={(el) => (inputRefs.current[index] = el)}
                            style={{
                              width: "40px",
                              height: "40px",
                              fontSize: "24px",
                              textAlign: "center",
                              marginRight:
                                index === otp.length - 1 ? "0px" : "10px",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="resendotp mb-3 mt-3">
                      <a
                        className="otptext"
                        onClick={() => {
                          SendEmailOtp();
                        }}
                      >
                        Resend OTP?
                      </a>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      onClick={handleVerify}
                      disabled={otp.some((value) => value === "")} // Disable if any value in otp is empty
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

export default OtpVerification;
