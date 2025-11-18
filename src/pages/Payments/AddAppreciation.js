import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const assetOptions = [
  "Machinery",
  "Vehicle",
  "Building",
  "Furniture",
  "Computer",
];

const AddAppreciation = ({ open, onClose, editMode, initialData }) => {
  const [formData, setFormData] = useState({
    particulars: "",
    amount: "",
    date: "",
    appreciation: "",
    depreciation: "",
  });

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        particulars: initialData.particulars || "",
        amount: initialData.amount || "",
        date: initialData.date || "",
        appreciation: initialData.appreciation || "",
        depreciation: initialData.depreciation || "",
      });
    } else {
      setFormData({
        particulars: "",
        amount: "",
        date: "",
        appreciation: "",
        depreciation: "",
      });
    }
  }, [editMode, initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payload:", formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <div className="d-flex justify-content-between">
        <DialogTitle>
          {editMode
            ? "Edit Appreciation/Depreciation"
            : "Add Appreciation/Depreciation"}
        </DialogTitle>
        <div className="closeicon">
          <i className="bi bi-x-lg" onClick={onClose}></i>
        </div>
      </div>
      <DialogContent style={{ marginBottom: "40px" }}>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col mb-3">
              <label className="form-label">
                Particulars <span className="required">*</span>:
              </label>
              <select
                name="particulars"
                className="form-select  custom-input-styles"
                value={formData.particulars}
                onChange={handleChange}
                required
              >
                <option value="">Select Asset</option>
                {assetOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
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
          <div className="row">
            <div className="col mb-3">
              <label className="form-label">
                Appreciation <span className="required">*</span>:
              </label>
              <input
                name="appreciation"
                type="number"
                className="form-control  custom-input-styles"
                value={formData.appreciation}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col mb-3">
              <label className="form-label">
                Depreciation <span className="required">*</span>:
              </label>
              <input
                name="depreciation "
                type="number"
                className="form-control  custom-input-styles"
                value={formData.depreciation}
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
  );
};

export default AddAppreciation;
