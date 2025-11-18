import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const AddAssets = ({
  open,
  onClose,
  editMode,
  initialData, // pass existing data for edit
}) => {
  // State for form fields
  const [formData, setFormData] = useState({
    particular: "",
    amount: "",
    date: "",
  });

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        particular: initialData.particular || "",
        amount: initialData.amount || "",
        date: initialData.date || "",
      });
    } else {
      setFormData({
        particular: "",
        amount: "",
        date: "",
      });
    }
  }, [editMode, initialData, open]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payload:", formData);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <div className="d-flex justify-content-between">
          <DialogTitle>{editMode ? "Edit Asset" : "Add Asset"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg" onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">
                  Particular <span className="required">*</span>:
                </label>
                <input
                  name="particular"
                  type="text"
                  className="form-control  custom-input-styles"
                  value={formData.particular}
                  onChange={handleChange}
                  required
                />
              </div>
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
                  Date <span className="required">*</span>:
                </label>
                <input
                  name="date"
                  type="date"
                  className="form-control custom-picker-styles"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
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

export default AddAssets;
