// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveVendor, editVendor } from "../services/apiSettings";
import PopUp from "../pages/PopUp";
import "../css/settings.css";
const AddVendor = ({
  open,
  onAddVendor,
  onClose,
  editMode,
  vendorSet,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    vendorName: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && vendorSet) {
      setFormData({
        vendorName: vendorSet.vendorName,
        vendorId: vendorSet._id,
      });
    } else {
      setFormData({
        vendorName: "",
      });
    }
  }, [editMode, vendorSet]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        vendorName: "",
      });
    }
  }, [open, setErrors]);
  const fetchvendorList = async () => {
    setOpenPopUp(false);
    onAddVendor();
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
    if (!formData.vendorName) newErrors.vendorName = "Vendor Name is required";
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
        response = await editVendor(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveVendor(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ vendorName: "" });
      onAddVendor(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating vendor", error);
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
          <DialogTitle>{editMode ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "60px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-5 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Vendor Name<span className="required"> * </span>:
                  </label>
                  <input
                    name="vendorName"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.vendorName}
                  ></input>
                  {errors.vendorName && (
                    <span className="invalid">{errors.vendorName}</span>
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
      {openPopUp && <PopUp message={message} closePopup={fetchvendorList} />}
    </>
  );
};

export default AddVendor;
