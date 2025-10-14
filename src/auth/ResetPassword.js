import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetUserPassword } from "../services/apiService";
import PopUp from "../pages/PopUp";
const ResetPassword = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  console.log("test");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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

  const location = useLocation();

  const userId = location.state?.userId; // Access the passed row object

  console.log("userId:", userId);

  const [password, setPassword] = useState("");
  const [passwordEmptyError, setPasswordEmptyError] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordEmptyError, setConfirmPasswordEmptyError] =
    useState(false);

  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = async () => {
    if (password == null || password == "") {
      setPasswordEmptyError(true);
    }
    if (confirmPassword == null || confirmPassword == "") {
      setConfirmPasswordEmptyError(true);
    }
    if (password !== confirmPassword) {
      setPasswordError(true);
      return;
    }
    if (
      password != null &&
      password != "" &&
      confirmPassword != null &&
      confirmPassword != ""
    ) {
      try {
        try {
          const userData = {
            userId: userId, // Replace with dynamic userId if needed
            password,
          };
          console.log(userData, "userData");
          const response = await resetUserPassword(userData);
          console.log(response, "login_response");
          if (response?.status == true) {
            setResponseStatus(true); // Save status as true
            setMessage(`${response?.message}`);
            setOpenPopUp(true);
          } else {
            setResponseStatus(false); // Save status as true
            setMessage(`${response?.message}`);
            setOpenPopUp(true);
          }
        } catch (error) {}
      } catch (error) {
      } finally {
        setLoading(false);
      }
    } else {
      setMessage("Please fill all the required fields");
      setOpenPopUp(true);
    }
  };

  const [newPasswordVisible, setewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const toggleNewPasswordVisibility = () => {
    setewPasswordVisible(!newPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
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
                      <h3 className="text-center login_text">Reset Password</h3>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        Enter New Password
                      </label>
                      <div className="pass">
                        <input
                          type={newPasswordVisible ? "text" : "password"}
                          className="form-control fieldwidth"
                          id="newPassword"
                          placeholder=""
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                            setPasswordEmptyError(false);
                          }}
                        />
                        {newPasswordVisible ? (
                          <span
                            className="bi bi-eye reseteyeicon "
                            onClick={toggleNewPasswordVisibility}
                          ></span>
                        ) : (
                          <span
                            className="bi bi-eye-slash  reseteyeicon"
                            onClick={toggleNewPasswordVisibility}
                          ></span>
                        )}
                      </div>

                      {passwordEmptyError && (
                        <div className="invalid">Please enter new password</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password
                      </label>
                      <div className="pass">
                        <input
                          type={confirmPasswordVisible ? "text" : "password"}
                          className="form-control fieldwidth"
                          id="confirmPassword"
                          placeholder=""
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError(false);
                            setConfirmPasswordEmptyError(false);
                          }}
                        />
                        {confirmPasswordVisible ? (
                          <span
                            className="bi bi-eye reseteyeicon"
                            onClick={toggleConfirmPasswordVisibility}
                          ></span>
                        ) : (
                          <span
                            className="bi bi-eye-slash reseteyeicon"
                            onClick={toggleConfirmPasswordVisibility}
                          ></span>
                        )}
                      </div>
                      {passwordError && (
                        <div className="invalid">
                          Please enter the same password
                        </div>
                      )}
                      {/* {confirmPasswordEmptyError && (
                        <div className="invalid">
                          Please enter confirm password
                        </div>
                      )} */}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      onClick={() => {
                        handleSubmit();
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
      {openPopUp && (
        <PopUp
          message={message}
          closePopup={() => {
            setOpenPopUp(false);
            if (responseStatus === true) {
              navigate("/login"); // Navigate only if the status is true
            }
          }}
        />
      )}
    </>
  );
};

export default ResetPassword;
