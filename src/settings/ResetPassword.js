// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { ChangePassword } from "../services/apiSettings";
import PopUp from "../pages/PopUp";
import "../css/settings.css";
const ResetPassword = ({
  open,
  onRequestPassword,
  onClose,
  requestSet,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({ password: "" });
  const [message, setMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisibleConfirm, setPasswordVisibleConfirm] = useState(false);

  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (requestSet) {
      setFormData({
        password: "",
        userId: requestSet._id,
      });
    }
  }, [requestSet]);
  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        role: "",
        designation: "",
        permissions: [],
      });
    }
  }, [open, setErrors]);
  const fetchrequests = async () => {
    setOpenPopUp(false);
    onRequestPassword();
    onClose();
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const togglePasswordVisibilityConfirm = () => {
    setPasswordVisibleConfirm(!passwordVisibleConfirm);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = "New Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Password do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      let response;

      response = await ChangePassword(formData);
      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }
      setFormData({ password: "", confirmPassword: "" });
      onRequestPassword(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error updating password", error);
    }
  };

  return (
    <>
      <Dialog
        sx={{
          width: 800,
          margin: "auto",
          borderRadius: 2,
        }}
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            // Prevent dialog from closing when clicking outside
            return;
          }
          onClose(); // Allow dialog to close for other reasons
        }}
        fullWidth
        maxWidth="lg"
      >
        <div className="d-flex justify-content-between" onClick={onClose}>
          <DialogTitle>Reset Password</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="password_container">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    New Password<span className="required"> * </span>:
                  </label>
                  <input
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.password}
                  ></input>
                  <span className="password_icon">
                    <i
                      onClick={togglePasswordVisibility}
                      className={
                        passwordVisible ? "bi bi-eye-slash" : "bi bi-eye"
                      }
                    ></i>
                  </span>
                </div>
                {errors.password && (
                  <span className="invalid">{errors.password}</span>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className=" password_container">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Confirm Password <span className="required"> * </span>:
                  </label>
                  <input
                    name="confirmPassword"
                    type={passwordVisibleConfirm ? "text" : "password"}
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.confirmPassword}
                  ></input>
                  <span className="password_icon">
                    <i
                      onClick={togglePasswordVisibilityConfirm}
                      className={
                        passwordVisibleConfirm ? "bi bi-eye-slash" : "bi bi-eye"
                      }
                    ></i>
                  </span>
                </div>
                {errors.confirmPassword && (
                  <span className="invalid">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="btnuser">
              <button className="btn btna submit-button btnfsize">
                {" "}
                Submit{" "}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {openPopUp && <PopUp message={message} closePopup={fetchrequests} />}
    </>
  );
};

export default ResetPassword;
