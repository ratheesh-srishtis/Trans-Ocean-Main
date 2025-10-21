// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveCargo, editCargo } from "../services/apiSettings";
import "../css/settings.css";
import PopUp from "../pages/PopUp";
const AddCharge = ({
  open,
  onAddCargo,
  onClose,
  editMode,
  cargoSet,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    cargoName: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && cargoSet) {
      setFormData({
        cargoName: cargoSet.cargoName,
        cargoId: cargoSet._id,
      });
    } else {
      setFormData({
        cargoName: "",
      });
    }
  }, [editMode, cargoSet]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        cargoName: "",
      });
    }
  }, [open, setErrors]);

  const fetchcargoList = async () => {
    setOpenPopUp(false);
    onAddCargo();
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
    if (!formData.cargoName) newErrors.cargoName = "Cargo Name is required";
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
        response = await editCargo(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveCargo(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ cargoName: "" });
      onAddCargo(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating cargo", error);
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
          <DialogTitle>{editMode ? "Edit Cargo" : "Add Cargo"}</DialogTitle>
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
                    Cargo Name<span className="required"> * </span>:
                  </label>
                  <input
                    name="cargoName"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.cargoName}
                  ></input>
                  {errors.cargoName && (
                    <span className="invalid">{errors.cargoName}</span>
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
      {openPopUp && <PopUp message={message} closePopup={fetchcargoList} />}
    </>
  );
};

export default AddCharge;
