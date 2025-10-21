// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveBank, editBank } from "../services/apiSettings";
import "../css/settings.css";
import PopUp from "../pages/PopUp";
const AddBank = ({
  open,
  onAddBank,
  onClose,
  editMode,
  Bankset,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    question: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && Bankset) {
      setFormData({
        bankName: Bankset.bankName,
        bankAddress: Bankset.bankAddress,
        bankAmount: Bankset.bankAmount,
        bankId: Bankset._id,
      });
    } else {
      setFormData({
        bankName: "",
        bankAddress: "",
        bankAmount: "",
      });
    }
  }, [editMode, Bankset]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        bankName: "",
        bankAddress: "",
        bankAmount: "",
      });
    }
  }, [open, setErrors]);

  const fetchBankList = async () => {
    setOpenPopUp(false);
    onAddBank();
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
  const validateForm = () => {
    const newErrors = {};
    if (!formData.bankName) newErrors.bankName = "Bank Name is required";
    setErrors(newErrors);
    if (!formData.bankAddress)
      newErrors.bankAddress = "Bank Address is required";
    setErrors(newErrors);
    if (!formData.bankAmount) newErrors.bankAmount = "Bank Amount is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (editMode) {
        console.log("Edit mode formData:", formData);
        response = await editBank(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveBank(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({
        bankName: "",
        bankAddress: "",
      });
      onAddBank(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating Bank", error);
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
        <div className="d-flex justify-content-between">
          <DialogTitle>{editMode ? "Edit Bank" : "Add Bank"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "60px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Bank Name <span className="required"> * </span>:
                  </label>
                  <input
                    name="bankName"
                    type=""
                    className="form-control vessel-bankName bankaddresssize"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.bankName}
                  ></input>

                  {errors.bankName && (
                    <span className="invalid">{errors.bankName}</span>
                  )}
                </div>
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Bank Address <span className="required">*</span>:
                  </label>
                  <textarea
                    name="bankAddress"
                    type=""
                    className="form-control bankaddresssize"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.bankAddress}
                    rows="3"
                    cols="35"
                  ></textarea>
                  {errors.bankAddress && (
                    <span className="invalid">{errors.bankAddress}</span>
                  )}
                </div>
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Bank Amount <span className="required"> * </span>:
                  </label>
                  <input
                    name="bankAmount"
                    type="text"
                    className="form-control vessel-bankName bankaddresssize"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.bankAmount}
                  ></input>
                  {errors.bankAmount && (
                    <span className="invalid">{errors.bankAmount}</span>
                  )}
                </div>
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
      {openPopUp && <PopUp message={message} closePopup={fetchBankList} />}
    </>
  );
};

export default AddBank;
