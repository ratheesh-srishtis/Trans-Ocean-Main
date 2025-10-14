// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveVesselType, editVesselType } from "../services/apiSettings";
import PopUp from "../pages/PopUp";
import "../css/settings.css";
const AddVesselType = ({
  open,
  onAddVesselType,
  onClose,
  editMode,
  vesselTypeSet,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    vesselType: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && vesselTypeSet) {
      setFormData({
        vesselType: vesselTypeSet.vesselType,
        vesselTypeId: vesselTypeSet._id,
      });
    } else {
      setFormData({
        vesselType: "",
      });
    }
  }, [editMode, vesselTypeSet]);
  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        vesselType: "",
      });
    }
  }, [open, setErrors]);
  const fetchvesselTypeList = async () => {
    setOpenPopUp(false);
    onAddVesselType();
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
    if (!formData.vesselType) newErrors.vesselType = "Vessel Type is required";
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
        response = await editVesselType(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveVesselType(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ vesselType: "" });
      onAddVesselType(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating vessel type", error);
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
          <DialogTitle>
            {editMode ? "Edit Vessel Type" : "Add Vessel Type"}
          </DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
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
                    Vessel Type<span className="required"> * </span>:
                  </label>
                  <input
                    name="vesselType"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.vesselType}
                  ></input>
                  {errors.vesselType && (
                    <span className="invalid">{errors.vesselType}</span>
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
      {openPopUp && (
        <PopUp message={message} closePopup={fetchvesselTypeList} />
      )}
    </>
  );
};

export default AddVesselType;
