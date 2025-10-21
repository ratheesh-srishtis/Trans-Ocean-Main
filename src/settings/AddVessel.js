// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveVessel, editVessel } from "../services/apiSettings";
import "../css/settings.css";
import PopUp from "../pages/PopUp";

const AddVessel = ({
  open,
  onAddVessel,
  onClose,
  editMode,
  roleVessel,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    vesselName: "",
    IMONumber: "",
    loa: "",
    grt: "",
    nrt: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && roleVessel) {
      setFormData({
        vesselName: roleVessel.vesselName,
        IMONumber: roleVessel.IMONumber,
        loa: roleVessel.LOA || [],
        grt: roleVessel.GRT,
        nrt: roleVessel.NRT,
        vesselId: roleVessel._id,
      });
    } else {
      setFormData({
        vesselName: "",
        IMONumber: "",
        loa: "",
        grt: "",
        nrt: "",
      });
    }
  }, [editMode, roleVessel]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        vesselName: "",
        IMONumber: "",
        loa: "",
        grt: "",
        nrt: "",
      });
    }
  }, [open, setErrors]);
  const fetchvesselList = async () => {
    setOpenPopUp(false);
    onAddVessel();
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
    if (!formData.vesselName) newErrors.vesselName = "Vessel Name is required";
    /* if (!formData.IMONumber) newErrors.IMONumber = "IMO Number is required";
    if (!formData.loa) newErrors.loa = "LOA is required";
    else if (isNaN(formData.loa) || formData.loa <= 0) { newErrors.loa = "LOA must be a positive number";}
    if (!formData.grt) newErrors.grt = "GRT is required";
    if (!formData.nrt) newErrors.nrt = "NRT is required";*/
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
        response = await editVessel(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveVessel(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ vesselName: "", IMONumber: "", loa: "", grt: "", nrt: "" });
      onAddVessel(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating vessels", error);
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
          <DialogTitle>{editMode ? "Edit Vessel" : "Add Vessel"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Vessel Name<span className="required"> * </span>:
                  </label>
                  <input
                    name="vesselName"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.vesselName}
                  ></input>
                  {errors.vesselName && (
                    <span className="invalid">{errors.vesselName}</span>
                  )}
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                {/*<div className="">
                <label htmlFor="exampleFormControlInput1" className="form-label"> Type of Vessel :</label>
                <input name="vesselVoyageNumber" type="" className="form-control vessel-voyage" id="exampleFormControlInput1" placeholder="" value=""></input>
              </div>*/}
              </div>
            </div>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    IMO No :
                  </label>
                  <input
                    name="IMONumber"
                    type="number"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.IMONumber}
                  ></input>
                  {errors.IMONumber && (
                    <span className="invalid">{errors.IMONumber}</span>
                  )}
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    LOA No :
                  </label>
                  <input
                    name="loa"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.loa}
                  ></input>
                  {errors.loa && <span className="invalid">{errors.loa}</span>}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    GRT :
                  </label>
                  <input
                    name="grt"
                    type="number"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.grt}
                  ></input>
                  {errors.grt && <span className="invalid">{errors.grt}</span>}
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    NRT :
                  </label>
                  <input
                    name="nrt"
                    type="number"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.nrt}
                  ></input>
                  {errors.nrt && <span className="invalid">{errors.nrt}</span>}
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
      {openPopUp && <PopUp message={message} closePopup={fetchvesselList} />}
    </>
  );
};

export default AddVessel;
