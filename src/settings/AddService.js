// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveService, editService } from "../services/apiSettings";
import "../css/settings.css";
import PopUp from "../pages/PopUp";
const AddService = ({
  open,
  onAddService,
  onClose,
  editMode,
  serviceSet,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    serviceName: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && serviceSet) {
      setFormData({
        serviceName: serviceSet.serviceName,
        serviceId: serviceSet._id,
      });
    } else {
      setFormData({
        serviceName: "",
      });
    }
  }, [editMode, serviceSet]);
  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        serviceName: "",
      });
    }
  }, [open, setErrors]);
  const fetchserviceList = async () => {
    setOpenPopUp(false);
    onAddService();
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
    if (!formData.serviceName)
      newErrors.serviceName = "Service Name is required";
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
        response = await editService(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveService(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ serviceName: "" });
      onAddService(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating service", error);
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
          <DialogTitle>{editMode ? "Edit Service" : "Add Service"}</DialogTitle>
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
                    Service Name <span className="required"> * </span>:
                  </label>
                  <input
                    name="serviceName"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.serviceName}
                  ></input>
                  {errors.serviceName && (
                    <span className="invalid">{errors.serviceName}</span>
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
      {openPopUp && <PopUp message={message} closePopup={fetchserviceList} />}
    </>
  );
};

export default AddService;
