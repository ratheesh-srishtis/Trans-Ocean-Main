// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveCharge, editCharge } from "../services/apiSettings";
import PopUp from "../pages/PopUp";
import "../css/settings.css";
const AddCharge = ({
  open,
  onAddCharge,
  onClose,
  editMode,
  chargeSet,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    chargeName: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && chargeSet) {
      setFormData({
        chargeName: chargeSet.chargeName,
        chargeId: chargeSet._id,
      });
    } else {
      setFormData({
        chargeName: "",
      });
    }
  }, [editMode, chargeSet]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        chargeName: "",
      });
    }
  }, [open, setErrors]);

  const fetchchargeList = async () => {
    setOpenPopUp(false);
    onAddCharge();
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
    if (!formData.chargeName) newErrors.chargeName = "Charge Name is required";
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
        response = await editCharge(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveCharge(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ chargeName: "" });
      onAddCharge(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating charge", error);
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
          <DialogTitle>{editMode ? "Edit Charge" : "Add Charge"}</DialogTitle>
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
                    Charge Name<span className="required"> * </span>:
                  </label>
                  <input
                    name="chargeName"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.chargeName}
                  ></input>
                  {errors.chargeName && (
                    <span className="invalid">{errors.chargeName}</span>
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
      {openPopUp && <PopUp message={message} closePopup={fetchchargeList} />}
    </>
  );
};

export default AddCharge;
