import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const AddSales = ({
  open,
  onClose,
  editMode,
  initialData, // pass existing data for edit
}) => {
  // State for form fields
  const [formData, setFormData] = useState({
    amount: "",
    mode: "",
    status: "",
    paidDate: "",
  });

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        amount: initialData.amount || "",
        mode: initialData.mode || "",
        status: initialData.status || "",
        paidDate: initialData.paidDate || "",
      });
    } else {
      setFormData({
        amount: "",
        mode: "",
        status: "",
        paidDate: "",
      });
    }
  }, [editMode, initialData, open]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status" && value === "unpaid" ? { paidDate: "" } : {}),
    }));
  };

  // Save handler
  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add validation here if needed
    console.log("Payload:", formData);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <div className="d-flex justify-content-between">
          <DialogTitle>{editMode ? "Edit Sales" : "Add Sales"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg" onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">
                  Amount <span className="required">*</span>:
                </label>
                <input
                  name="amount"
                  type="number"
                  className="form-control  custom-input-styles"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col mb-3">
                <label className="form-label">
                  Mode of Payment <span className="required">*</span>:
                </label>
                <select
                  name="mode"
                  className="form-select"
                  value={formData.mode}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">
                  Status <span className="required">*</span>:
                </label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              {formData.status === "paid" && (
                <div className="col mb-3">
                  <label className="form-label">
                    Paid Date <span className="required">*</span>:
                  </label>
                  <input
                    name="paidDate"
                    type="date"
                    className="form-control custom-picker-styles"
                    value={formData.paidDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>
            <div className="btnuser">
              <button className="btn btna submit-button btnfsize" type="submit">
                Submit
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddSales;
