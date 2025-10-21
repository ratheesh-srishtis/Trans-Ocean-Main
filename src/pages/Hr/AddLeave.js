import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  saveLeave,
  editLeave,
  getAllLeaveTypes,
} from "../../services/apiLeavePortal";
import PopUp from ".././PopUp";
import "../../css/payment.css";
import Loader from "../Loader";
import { se } from "date-fns/locale";
const AddLeave = ({
  open,
  onClose,
  listLeaves,
  employeeId,
  editMode,
  leavevalues,
  errors,
  setErrors,
}) => {
  console.log("Received leavevalues:", leavevalues);
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [message, setMessage] = useState("");
  const [empLeaveTypes, SetEmpLeaveTypes] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "",
    leaveMode: "",
    leaveFrom: "",
    leaveTo: "",
    comment: "",
  });

  useEffect(() => {
    if (editMode && leavevalues) {
      let fromLeave = "";
      if (leavevalues.leaveFrom !== "N/A") {
        const [day, month, year] = leavevalues.leaveFrom.split("-");
        fromLeave = `${year}-${month}-${day}`;
      } else {
        fromLeave = "";
      }
      let toLeave = "";
      if (leavevalues.leaveTo !== "N/A") {
        const [day, month, year] = leavevalues.leaveTo.split("-");
        toLeave = `${year}-${month}-${day}`;
      } else {
        toLeave = "";
      }
      setFormData({
        leaveType: leavevalues.leaveType || "",
        leaveMode: leavevalues.leaveMode?._id || "",
        leaveFrom: fromLeave || "",
        leaveTo: toLeave || "",
        comment: leavevalues.comment || "",
      });
    } else {
      setFormData({
        leaveType: "",
        leaveMode: "",
        leaveFrom: "",
        leaveTo: "",
        comment: "",
      });
    }
    console.log(leavevalues, "leavevalues");
  }, [editMode, leavevalues]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        leaveType: "",
        leaveMode: "",
        leaveFrom: "",
        leaveTo: "",
        comment: "",
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
    if (!formData.leaveFrom)
      newErrors.leaveFrom = "From leave date is required";
    if (!formData.leaveTo) newErrors.leaveTo = "To leave date is required";
    if (!formData.leaveType) newErrors.leaveType = "Leave type is required";
    if (!formData.leaveMode) newErrors.leaveMode = "Leave mode is required";
    if (!formData.comment) newErrors.comment = "Comment is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchLeaves = () => {
    setOpenPopUp(false);
    const payload = { employeeId: employeeId };
    listLeaves(payload);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true); // Show loader
      let response = "";
      if (editMode) {
        formData.leaveId = leavevalues._id;
        response = await editLeave(formData);
      } else {
        formData.employeeId = employeeId;
        response = await saveLeave(formData);
      }

      if (response.status === true) {
        setIsLoading(false); // Hide loader
        setOpenPopUp(true);
        setMessage(response.message);
        setFormData({
          leaveFrom: "",
          leaveTo: "",
          leaveType: "",
          leaveMode: "",
          comment: "",
        });
        onClose();
      } else {
        setIsLoading(false); // Hide loader

        setMessage(response.message);
        setOpenPopUp(true);
      }
    } catch (error) {
      // Handle error
    }
  };

  const fecthEmployeeLeaveTypes = async () => {
    const listLeaveTypes = await getAllLeaveTypes();
    SetEmpLeaveTypes(listLeaveTypes?.leaveTypes || []);
  };

  useEffect(() => {
    fecthEmployeeLeaveTypes();
  }, []);

  useEffect(() => {
    console.log("empLeaveTypes:", empLeaveTypes);
  }, [empLeaveTypes]);

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
          <DialogTitle>{editMode ? "Edit Leave" : "Add Leave"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-4 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="leaveType" className="form-label">
                    Leave Type <span className="required"> * </span>:
                  </label>
                  <select
                    name="leaveType"
                    id="leaveType"
                    className="form-select vesselbox"
                    aria-label="Default select example"
                    onChange={handleChange}
                    value={formData.leaveType}
                  >
                    <option value="">Choose Leave Type</option>
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                  {errors.leaveType && (
                    <span className="invalid">{errors.leaveType}</span>
                  )}
                </div>
              </div>
              <div className="col-4 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="leaveMode" className="form-label">
                    Leave Mode <span className="required"> * </span>:
                  </label>
                  <select
                    name="leaveMode"
                    id="leaveMode"
                    className="form-select vesselbox"
                    aria-label="Default select example"
                    onChange={handleChange}
                    value={formData.leaveMode}
                  >
                    <option value="">Choose Leave Mode</option>
                    {empLeaveTypes &&
                      empLeaveTypes.map((leaveType) => (
                        <option key={leaveType._id} value={leaveType._id}>
                          {leaveType.leaveType}
                        </option>
                      ))}
                  </select>
                  {errors.leaveMode && (
                    <span className="invalid">{errors.leaveMode}</span>
                  )}
                </div>
              </div>
              <div className="col-4 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="leaveFrom" className="form-label">
                    Leave From <span className="required"> * </span>:
                  </label>
                  <input
                    name="leaveFrom"
                    type="date"
                    className="form-control custom-picker-styles"
                    id="leaveFrom"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.leaveFrom}
                    max={formData.leaveTo}
                  ></input>
                  {errors.leaveFrom && (
                    <span className="invalid">{errors.leaveFrom}</span>
                  )}
                </div>
              </div>
              <div className="col-4 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="leaveTo" className="form-label">
                    Leave To <span className="required"> * </span>:
                  </label>
                  <input
                    name="leaveTo"
                    type="date"
                    className="form-control custom-picker-styles"
                    id="leaveTo"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.leaveTo}
                    min={formData.leaveFrom}
                  ></input>
                  {errors.leaveTo && (
                    <span className="invalid">{errors.leaveTo}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 mb-3 align-items-start">
                <div className="">
                  <label htmlFor="comment" className="form-label">
                    Comment <span className="required"> * </span>:
                  </label>
                  <div className="vessel-select  ">
                    <textarea
                      name="comment"
                      className="form-control vessel-voyage"
                      id="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      style={{ width: "100%", resize: "none" }}
                    ></textarea>
                    {errors.comment && (
                      <span className="invalid">{errors.comment}</span>
                    )}
                  </div>
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
      {openPopUp && <PopUp message={message} closePopup={fetchLeaves} />}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default AddLeave;
