import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveWorkCalendar, editWorkCalendar } from '../../services/apiHrSettings';
import PopUp from ".././PopUp";
import "../../css/payment.css";

const AddWorkCalendar = ({ open, onClose, listworkingCalendar, editMode, workcalendar, errors, setErrors }) => {
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [formData, setFormData] = useState({
    designationName: "",
  
  });

  useEffect(() => {
    if (editMode && workcalendar) {
    
      setFormData({
        totalWorkingDays: workcalendar.totalWorkingDays || '',
        totalHolidays: workcalendar.totalHolidays || '',
        month: workcalendar.month || '',
        year: workcalendar.year || '',
      });
    } else {
      setFormData({
        totalWorkingDays: '',
        totalHolidays: '',
        month: '',
        year: '',
     
      });
    }
  }, [editMode, workcalendar]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        totalWorkingDays: "",
        totalHolidays: "",
        month: "",
        year: "",
    
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
    if (!formData.totalWorkingDays) newErrors.totalWorkingDays = "Number of working days is required";
    if (!formData.totalHolidays) newErrors.totalHolidays = "Number of holidays is required";
    if (!formData.month) newErrors.month = "Month is required";
    if (!formData.year) newErrors.year = "Year is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchWorkingDays = () => {
    setOpenPopUp(false);
    listworkingCalendar();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      
      let response = "";
      if (editMode){
        formData.workCalendarId = workcalendar._id;
        response = await editWorkCalendar(formData);
      }
       else{
         response = await saveWorkCalendar(formData);
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
          <DialogTitle>{editMode ? "Edit Working Days" : "Add Working Days"}</DialogTitle>
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
                  Number of working days<span className="required"> * </span>:
                  </label>
                  <input
                    name="totalWorkingDays"
                    type="number"
                    className="form-control vessel-voyage"
                    id="totalWorkingDays"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.totalWorkingDays}
                  ></input>
                  {errors.totalWorkingDays && (<span className="invalid">{errors.totalWorkingDays}</span>)}
                </div>
              </div>
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="leaveFrom" className="form-label">
                  Number of holidays <span className="required"> * </span>:
                  </label>
                  <input
                    name="totalHolidays"
                    type="number"
                    className="form-control vessel-voyage"
                    id="totalHolidays"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.totalHolidays}
                  ></input>
                  {errors.totalHolidays && (<span className="invalid">{errors.totalHolidays}</span>)}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="leaveFrom" className="form-label">
                  Month<span className="required"> * </span>:
                  </label>
                  <select
                    name="month"
                    className="form-select vesselbox"
                    aria-label="Default select example"
                    onChange={handleChange}
                    value={formData.month}
                  >
                  <option value="">Choose Month</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                  </select>
                 
                  {errors.month && (<span className="invalid">{errors.month}</span>)}
                </div>
              </div>
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="leaveFrom" className="form-label">
                 Year <span className="required"> * </span>:
                  </label>
                  <select
                    name="year"
                    className="form-select vesselbox"
                    aria-label="Default select example"
                    onChange={handleChange}
                    value={formData.year}
                  >
                  <option value="">Choose Year</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                  <option value="2031">2031</option>
                  <option value="2032">2032</option>
                  <option value="2033">2033</option>
                 
                  </select>
                  {errors.year && (<span className="invalid">{errors.year}</span>)}
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
      {openPopUp && <PopUp message={message} closePopup={fetchWorkingDays} />}
    </>
  );
};

export default AddWorkCalendar;
