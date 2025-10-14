import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveDesignation, editDesignation } from '../../services/apiHrSettings';
import PopUp from ".././PopUp";
import "../../css/payment.css";

const AddDesigination = ({ open, onClose, listDesiginations, editMode, desiginations, errors, setErrors }) => {
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [formData, setFormData] = useState({
    designationName: "",
  
  });

  useEffect(() => {
    if (editMode && desiginations) {
    
      setFormData({
        designationName: desiginations.designationName || '',
       
      });
    } else {
      setFormData({
        designationName: '',
     
      });
    }
  }, [editMode, desiginations]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        designationName: "",
    
      });
    }
  }, [open, setErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.designationName) newErrors.designationName = "Designation name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchDesigination = () => {
    setOpenPopUp(false);
    listDesiginations();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      
      let response = "";
      if (editMode){
        formData.designationId = desiginations._id;
        response = await editDesignation(formData);
      }
       else{
         response = await saveDesignation(formData);
      }
        

      if (response.status === true) {
        setOpenPopUp(true);
        setMessage(response.message);
        setFormData({
          designationName: "",
       
        });
        onClose();
      } else {
        setMessage(response.message);
        setOpenPopUp(true);
      }
    } catch (error) {
      // Handle error
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
        <div className="d-flex justify-content-between " onClick={onClose}>
          <DialogTitle>{editMode ? "Edit Designation" : "Add Designation"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="leaveFrom" className="form-label">
                  Designation Name <span className="required"> * </span>:
                  </label>
                  <input
                    name="designationName"
                    type="text"
                    className="form-control vessel-voyage"
                    id="designationName"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.designationName}
                  ></input>
                  {errors.designationName && (<span className="invalid">{errors.designationName}</span>)}
                </div>
              </div>
             
            </div>
          
            <div className="btnuser">
              <button className="btn btna submit-button btnfsize">
                Submit
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {openPopUp && <PopUp message={message} closePopup={fetchDesigination} />}
    </>
  );
};

export default AddDesigination;
