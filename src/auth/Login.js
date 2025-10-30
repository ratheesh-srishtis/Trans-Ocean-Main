import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { forgotUserPassword } from "../services/apiService";
import PopUp from "../pages/PopUp";
const Login = () => {
  const { login } = useAuth();
  const logo = require("../assets/images/LOGO.png");
  const logoUrl = localStorage.getItem("logoPreview") || logo;
  const navigate = useNavigate();
  console.log("test");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim spaces from username and password
    const trimmedEmailOrUsername = emailOrUsername.trim();
    const trimmedPassword = password.trim();

    // Add console logs to check values before submission
    console.log("Email or Username: ", trimmedEmailOrUsername);
    console.log("Password: ", trimmedPassword);
    console.log("Remember Me: ", rememberMe);
    // navigate("/")
    login(trimmedEmailOrUsername, trimmedPassword, rememberMe);
    // try {
    //   const data = await login(emailOrUsername, password, rememberMe);
    //   console.log("Login successful!", data);
    //   // Handle successful login (e.g., store token, navigate, etc.)
    // } catch (error) {
    //   console.error("Login error: ", error);
    //   alert("Login failed. Please check your credentials.");
    // }
  };

  const sendotp = () => {
    navigate("/send-otp");
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
              <div className="col-lg-6 same-level marsmallscreen">
                <div className="d-flex flex-column mb-3">
                  <img className="logo" src={logoUrl}></img>
                  <img
                    className="mainpng d-none d-md-flex"
                    src={mian}
                    alt=""
                  ></img>
                </div>
              </div>

              <div className="col-lg-6 same-level">
                <div className="logincard">
                  <div className="maincard">
                    <div>
                      <h3 className="text-center login_text">LOGIN</h3>
                    </div>
                    {/* 
                    <div className="buttons">
                      <ul
                        className="nav nav-pills mb-3 button-row"
                        id="pills-tab"
                        role="tablist"
                      >
                        <li className="nav-item font" role="presentation">
                          <button
                            className="nav-link "
                            id="pills-home-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#pills-home"
                            type="button"
                            role="tab"
                            aria-controls="pills-home"
                            aria-selected="true"
                            onClick={() => handleTabClick("Admin")}
                          >
                            Admin
                          </button>
                        </li>
                        <li className="nav-item font" role="presentation">
                          <button
                            className="nav-link active"
                            id="pills-profile-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#pills-profile"
                            type="button"
                            role="tab"
                            aria-controls="pills-profile"
                            aria-selected="false"
                            onClick={() => handleTabClick("Finance")}
                          >
                            Finance
                          </button>
                        </li>
                        <li className="nav-item font " role="presentation">
                          <button
                            className="nav-link"
                            id="pills-contact-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#pills-contact"
                            type="button"
                            role="tab"
                            aria-controls="pills-contact"
                            aria-selected="false"
                            onClick={() => handleTabClick("Operations")}
                          >
                            Operations
                          </button>
                        </li>
                        <li className="nav-item font" role="presentation">
                          <button
                            className="nav-link"
                            id="pills-contact-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#pills-contact"
                            type="button"
                            role="tab"
                            aria-controls="pills-contact"
                            aria-selected="false"
                            onClick={() => handleTabClick("Hr")}
                          >
                            HR
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div className="tab-content" id="pills-tabContent">
                      <div
                        className="tab-pane fade show active"
                        id="pills-home"
                        role="tabpanel"
                        aria-labelledby="pills-home-tab"
                        tabindex="0"
                      ></div>
                      <div
                        className="tab-pane fade"
                        id="pills-profile"
                        role="tabpanel"
                        aria-labelledby="pills-profile-tab"
                        tabindex="0"
                      ></div>
                      <div
                        className="tab-pane fade"
                        id="pills-contact"
                        role="tabpanel"
                        aria-labelledby="pills-contact-tab"
                        tabindex="0"
                      ></div>
                    </div> */}

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          Username
                        </label>
                        <input
                          type="text"
                          className="form-control vessel-voyage"
                          id="exampleInputEmail1"
                          placeholder=""
                          aria-describedby="emailHelp"
                          value={emailOrUsername}
                          onChange={(e) => setEmailOrUsername(e.target.value)} // Update email/username state
                          required
                        />
                      </div>

                      <div className="mb-3 password_container">
                        <label
                          htmlFor="exampleInputPassword1"
                          className="form-label"
                        >
                          Password
                        </label>
                        <input
                          type={passwordVisible ? "text" : "password"}
                          className="form-control vessel-voyage"
                          id="exampleInputPassword1"
                          placeholder=""
                          value={password}
                          onChange={(e) => setPassword(e.target.value)} // Update password state
                          required
                        />
                        <span className="password_icon">
                          {" "}
                          <i
                            onClick={togglePasswordVisibility}
                            className={
                              passwordVisible ? "bi bi-eye-slash" : "bi bi-eye"
                            }
                          >
                            {" "}
                          </i>{" "}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between">
                        <div className="mb-3 form-check">
                          <input
                            type="checkbox"
                            className="form-check-input rememberme"
                            id="exampleCheck1"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)} // Update rememberMe state
                          />
                          <label
                            className="form-check-label rememberme"
                            htmlFor="exampleCheck1"
                          >
                            Remember me
                          </label>
                        </div>
                        <div>
                          <h6 className="forgotpassword">
                            <a
                              onClick={() => {
                                sendotp();
                              }}
                              className=""
                            >
                              Forgot Password?
                            </a>
                          </h6>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary w-100">
                        Login
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex bottom-head">
          <p className="copyright">Copyright &copy; TransOcean.</p>
          <p className="footerlinks pl-2">
            <a href="#">Policy</a> | <a href="#"> Terms & Conditions </a>{" "}
          </p>
        </div>
        <div className="d-flex justify-content-center loginpageversion">
          Version: 0.120
        </div>
      </div>

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default Login;
