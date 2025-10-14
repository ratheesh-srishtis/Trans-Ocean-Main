import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/userleave.css";

const UserLeave = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    leaveType: "",
    leaveFrom: null,
    leaveTo: null,
    comment: "",
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Replace with actual API endpoint
    // Example: await fetch('/api/leave', { method: 'POST', body: JSON.stringify(formData) })
    alert("Leave request submitted! See console for payload.");
    console.log("Leave Payload:", formData);
  };

  return (
    <div className="user-leave-container">
      <Box sx={{ width: "100%", mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Leave Report" />
          <Tab label="Apply Leave" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <div className="leave-report-content">
              {/* Leave Report content goes here */}
              <h5 className="section-title">Leave Report</h5>
              <div className="empty-report">
                No leave report data available.
              </div>
            </div>
          )}
          {tabValue === 1 && (
            <form className="apply-leave-form" onSubmit={handleSubmit}>
              <h5 className="section-title">Apply Leave</h5>
              <div className="form-group">
                <label htmlFor="leaveType">Leave Type</label>
                <input
                  type="text"
                  id="leaveType"
                  name="leaveType"
                  className="form-control"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="leaveFrom">Leave From</label>
                <DatePicker
                  selected={formData.leaveFrom}
                  onChange={(date) => handleDateChange(date, "leaveFrom")}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select start date"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="leaveTo">Leave To</label>
                <DatePicker
                  selected={formData.leaveTo}
                  onChange={(date) => handleDateChange(date, "leaveTo")}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select end date"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  className="form-control"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              <div className="form-group text-center mt-4">
                <button type="submit" className="btn btn-success px-5">
                  Submit
                </button>
              </div>
            </form>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default UserLeave;
