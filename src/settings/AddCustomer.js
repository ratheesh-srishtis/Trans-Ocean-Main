// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveCustomer, editCustomer } from "../services/apiSettings";
import PopUp from "../pages/PopUp";
import "../css/settings.css";
const AddCustomer = ({
  open,
  onAddCustomer,
  onClose,
  editMode,
  customerSet,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerAddress: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && customerSet) {
      setFormData({
        customerName: customerSet.customerName,
        customerAddress: customerSet.customerAddress,
        customerId: customerSet._id,
      });
    } else {
      setFormData({
        customerName: "",
        customerAddress: "",
      });
    }
  }, [editMode, customerSet]);
  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        customerName: "",
        customerAddress: "",
      });
    }
  }, [open, setErrors]);
  const fetchcustomerList = async () => {
    setOpenPopUp(false);
    onAddCustomer();
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
    if (!formData.customerName)
      newErrors.customerName = "Customer Name is required";
    if (!formData.customerAddress)
      newErrors.customerAddress = "Customer Address is required";
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
        response = await editCustomer(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveCustomer(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ customerName: "", customerAddress: "" });
      onAddCustomer(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating customer", error);
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
          <DialogTitle>
            {editMode ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "60px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Customer Name<span className="required"> * </span>:
                  </label>
                  <input
                    name="customerName"
                    type=""
                    className="form-control vessel-voyage cusnameheight"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.customerName}
                  ></input>
                  {errors.customerName && (
                    <span className="invalid">{errors.customerName}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="col mb-3 align-items-start">
              <div className="">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  {" "}
                  Customer Address<span className="required"> * </span>:
                </label>

                <textarea
                  name="customerAddress"
                  rows="3"
                  className="form-control addcusheight"
                  id="exampleFormControlInput1"
                  placeholder="Address"
                  onChange={handleChange}
                  value={formData.customerAddress}
                ></textarea>

                {errors.customerAddress && (
                  <span className="invalid">{errors.customerAddress}</span>
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
      {openPopUp && <PopUp message={message} closePopup={fetchcustomerList} />}
    </>
  );
};

export default AddCustomer;
