import React, { useState, useEffect } from "react";
import "../css/settings.css";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  getAllPermissions,
  saveUserRole,
  editUserRole,
  saveAnchorageStayCharge,
  editAnchorageStayCharge,
} from "../services/apiSettings";
import { getAllDesignations } from "../services/apiEmployee";
import PopUp from "../pages/PopUp";
const AddAnchorageStay = ({
  open,
  onAddRole,
  onClose,
  onSubmit,
  editMode,
  roleSet,
  errors,
  setErrors,
  portId,
}) => {
  const [formData, setFormData] = useState({
    days: "",
    description: "",
    chargeOMR: 0,
    chargeUSD: 0,
    order: 0,
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [closePopUp, setclosePopup] = useState(false);

  useEffect(() => {
    if (editMode && roleSet) {
      console.log(roleSet, "roleSet");
      setFormData({
        days: roleSet?.days,
        description: roleSet?.description,
        chargeOMR: roleSet?.chargeOMR,
        chargeUSD: roleSet?.chargeUSD,
        order: roleSet?.order,
        stayChargeId: roleSet?.id,
      });
    } else {
      setFormData({
        days: "",
        description: "",
        chargeOMR: 0,
        chargeUSD: 0,
        order: 0,
      });
    }
  }, [editMode, roleSet]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        days: "",
        description: "",
        chargeOMR: 0,
        chargeUSD: 0,
        order: 0,
      });
    }
  }, [open, setErrors]);

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
    if (!formData.days) newErrors.days = "Days is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.chargeOMR) newErrors.chargeOMR = `Charge OMR is required`;
    if (!formData.chargeUSD) newErrors.chargeUSD = "Charge USD is required";
    if (!formData.order) newErrors.order = "Order is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      let response;
      if (editMode) {
        const payload = {
          stayChargeId: formData.stayChargeId, // make sure this exists in formData
          days: formData.days,
          description: formData.description,
          chargeOMR: formData.chargeOMR,
          chargeUSD: formData.chargeUSD,
          order: formData.order,
        };
        //console.log("Edit mode formData:", formData);
        response = await editAnchorageStayCharge(payload);

        if (response.status === true) {
          setMessage("Anchorage Stay Charge details saved successfully");
          setOpenPopUp(true);
          setFormData({
            days: "",
            description: "",
            chargeOMR: 0,
            chargeUSD: 0,
            order: 0,
            stayChargeId: "",
          });
          onSubmit();
        }
      } else {
        // Add new role
        //console.log("Add mode formData:", formData);
        const payload = {
          portId: portId, // make sure this exists in formData
          days: formData.days,
          description: formData.description,
          chargeOMR: formData.chargeOMR,
          chargeUSD: formData.chargeUSD,
          order: formData.order,
        };
        response = await saveAnchorageStayCharge(payload);
      }

      if (response.status === true) {
        setMessage("Anchorage stay charge saved successfully");
        setOpenPopUp(true);
        setFormData({
          days: "",
          description: "",
          chargeOMR: 0,
          chargeUSD: 0,
          order: 0,
        });
        onSubmit();
      }
    } catch (error) {
      setMessage("Please try again");
      setOpenPopUp(true);
    }
  };

  useEffect(() => {
    console.log(formData, "formData");
  }, [formData]);

  const fetchusersList = async () => {
    if (closePopUp == false) {
      onClose();
    }
    setOpenPopUp(false);
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
          <DialogTitle>{editMode ? "Edit Charge" : "Add Charge"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="typesofcall-row ">
              <div className="row mb-3 align-items-start">
                <div className="col-4">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Days<span className="required"> * </span>:
                  </label>

                  <input
                    name="days"
                    type="text"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.days}
                  ></input>

                  <div className="vessel-select">
                    {errors.days && (
                      <span className="invalid">{errors.days}</span>
                    )}
                  </div>
                </div>
                <div className="col-4">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Charge OMR
                    <span className="required"> * </span>:
                  </label>

                  <input
                    name={`chargeOMR`}
                    type="number"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder={`charge OMR`}
                    onChange={handleChange}
                    value={formData.chargeOMR}
                  ></input>

                  <div className="vessel-select">
                    {errors.chargeOMR && (
                      <span className="invalid">{errors.chargeOMR}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="row mb-3 align-items-start">
                <div className="col-4">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Charge USD<span className="required"> * </span>:
                  </label>

                  <input
                    name="chargeUSD"
                    type="number"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder="Charge USD"
                    onChange={handleChange}
                    value={formData.chargeUSD}
                  ></input>

                  <div className="vessel-select">
                    {errors.chargeUSD && (
                      <span className="invalid">{errors.chargeUSD}</span>
                    )}
                  </div>
                </div>
                <div className="col-4">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Order<span className="required"> * </span>:
                  </label>

                  <input
                    name="order"
                    type="text"
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder="Charge USD"
                    onChange={handleChange}
                    value={formData.order}
                  ></input>

                  <div className="vessel-select">
                    {errors.order && (
                      <span className="invalid">{errors.order}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="row mb-3 align-items-start">
                <div className="col-4">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Description<span className="required"> * </span>:
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="form-control formlabelcolor emailmessage"
                    id="exampleFormControlInput1"
                    onChange={handleChange}
                    value={formData.description}
                    placeholder="Description"
                  ></textarea>

                  <div className="vessel-select">
                    {errors.description && (
                      <span className="invalid">{errors.description}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="btnrole"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <button type="submit" className="btn btna submit-button btnfsize">
                Add Charge Details
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {openPopUp && <PopUp message={message} closePopup={fetchusersList} />}
    </>
  );
};

export default AddAnchorageStay;
