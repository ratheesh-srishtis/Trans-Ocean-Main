// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  getAllCharges,
  saveSubcharge,
  editSubcharge,
} from "../services/apiSettings";
import "../css/settings.css";
import PopUp from "../pages/PopUp";
import Swal from "sweetalert2";
const AddSubcharge = ({
  open,
  onAddSubcharge,
  onClose,
  editMode,
  subchargeSet,
  errors,
  setErrors,
}) => {
  const [ChargeList, setChargeList] = useState([]);
  const [formData, setFormData] = useState({
    subchargeName: "",
    chargeId: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [closePopUp, setclosePopup] = useState(false);
  useEffect(() => {
    fetchchargeList();
  }, []);
  useEffect(() => {
    if (editMode && subchargeSet) {
      setFormData({
        subchargeName: subchargeSet.subchargeName,
        chargeId: subchargeSet.chargeId._id,
        subchargeId: subchargeSet._id,
      });
    } else {
      setFormData({
        subchargeName: "",
        chargeId: "",
      });
    }
  }, [editMode, subchargeSet]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        subchargeName: "",
      });
    }
  }, [open, setErrors]);
  const fetchchargeList = async () => {
    try {
      const listallcharges = await getAllCharges();
      setChargeList(listallcharges?.charges || []);
    } catch (error) {
      console.error("Failed to fetch charges", error);
    }
  };
  const fetchsubchargeList = async () => {
    if (closePopUp == false) {
      onAddSubcharge();
      onClose();
    }
    setOpenPopUp(false);
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
    if (!formData.subchargeName)
      newErrors.subchargeName = "Sub Charge Name is required";
    if (!formData.chargeId) newErrors.chargeId = "Charge Name is required";
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
        response = await editSubcharge(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveSubcharge(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
        setFormData({ subchargeName: "", chargeId: "" });
        onAddSubcharge(formData);
        onClose();
      } else {
        setMessage(response.message);
        setOpenPopUp(true);
        setclosePopup(true);
      }
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating subcharge", error);
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
        <div className="d-flex justify-content-between ">
          <DialogTitle>
            {editMode ? "Edit Subcharge" : "Add Sub Charge"}
          </DialogTitle>
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
                    Name<span className="required"> * </span>:
                  </label>
                  <input
                    name="subchargeName"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.subchargeName}
                  ></input>
                  {errors.subchargeName && (
                    <span className="invalid">{errors.subchargeName}</span>
                  )}
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
                    Charges <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <select
                      name="chargeId"
                      className="form-select vesselbox"
                      aria-label="Default select example"
                      onChange={handleChange}
                      value={formData.chargeId}
                    >
                      <option value="">Choose Charge </option>
                      {ChargeList.map((charges) => (
                        <option key={charges._id} value={charges._id}>
                          {charges.chargeName}{" "}
                        </option>
                      ))}
                    </select>
                    {errors.chargeId && (
                      <span className="invalid">{errors.chargeId}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                {/*<div className="">
                <label htmlFor="exampleFormControlInput1" className="form-label">  Phone Number:</label>
                <input name="phone" type="" className="form-control vessel-voyage" id="exampleFormControlInput1" placeholder="" onChange={handleChange}
                  value={formData.phone}></input>
              </div>*/}
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
      {openPopUp && <PopUp message={message} closePopup={fetchsubchargeList} />}
    </>
  );
};

export default AddSubcharge;
