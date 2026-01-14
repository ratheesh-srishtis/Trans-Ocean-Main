import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  saveAssetValue,
  editAssetValue,
} from "../../../services/apiSubPayments";
import { getAssets } from "../../../services/apiSubPayments";
import PopUp from "../../PopUp";
import Loader from "../../Loader";
import moment from "moment";

const AddAppreciationDepreciation = ({
  open,
  onClose,
  editMode,
  errors,
  setErrors,
  userSet,
  initialData, // pass existing data for edit
}) => {
  // State for form fields
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const [assetsList, setAssetsList] = useState([]);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const [formData, setFormData] = useState({
    assetId: "",
    appreciation: 0,
    depreciation: 0,
    year: currentYear,
  });

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await getAssets();
      console.log("getAssets:", response?.assets);
      setAssetsList(response?.assets);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);
  const toNumberOrZero = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : 0;
  };
  useEffect(() => {
    console.log(userSet, "userSet_appr");
    if (editMode && userSet) {
      setFormData({
        assetId: userSet.assetId?._id || "",
        appreciation: toNumberOrZero(userSet.appreciation),
        depreciation: toNumberOrZero(userSet.depreciation),
        year: Number(userSet.assessmentYear) || currentYear,
      });
    } else {
      setFormData({
        assetId: "",
        appreciation: 0,
        depreciation: 0,
        year: currentYear,
      });
    }
  }, [editMode, userSet]);
  useEffect(() => {
    console.log(formData, "formData_appr");
  }, [formData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "appreciation" && value > 0 && { depreciation: 0 }),
      ...(name === "depreciation" && value > 0 && { appreciation: 0 }),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.assetId?.trim()) {
      newErrors.assetId = "Asset is required";
    }

    const appreciation = Number(formData.appreciation) || 0;
    const depreciation = Number(formData.depreciation) || 0;

    // ❗ Rule 1: At least one must be entered
    if (appreciation <= 0 && depreciation <= 0) {
      setMessage("Please enter either Appreciation or Depreciation value");
      setOpenPopUp(true);
      return false;
    }

    // ❗ Rule 2: Both cannot be entered
    if (appreciation > 0 && depreciation > 0) {
      setMessage("Please enter either Appreciation or Depreciation, not both");
      setOpenPopUp(true);
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  // Save handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    // You can add validation here if needed
    if (!validateForm()) return;
    setIsLoading(true);
    const payload = {
      ...formData,
      appreciation: Number(formData.appreciation) || 0,
      depreciation: Number(formData.depreciation) || 0,
      year: Number(formData.year),
    };
    try {
      let response;
      if (editMode) {
        payload.assetValueId = userSet?._id;
        response = await editAssetValue(payload);
        setIsLoading(false);
      } else {
        // Add new role
        response = await saveAssetValue(payload);
        setIsLoading(false);
      }
      if (response.status === true) {
        if (editMode) {
          setMessage("Asset Updated Successfully");
        } else {
          setMessage("Asset Saved Successfully");
        }

        setOpenPopUp(true);
        setFormData({
          assetId: "",
          appreciation: 0,
          depreciation: 0,
          year: currentYear,
        });
        onClose();
        setIsLoading(false);
      } else {
        setMessage(response.message);
        setOpenPopUp(true);
        setIsLoading(false);
      }
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating user", error);
      setIsLoading(false);
    }

    console.log("Payload:", formData);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            // Prevent dialog from closing when clicking outside
            return;
          }
          onClose(); // Allow dialog to close for other reasons
        }}
        fullWidth
        maxWidth="sm"
      >
        <div className="d-flex justify-content-between">
          <DialogTitle>
            {editMode
              ? "Edit Appreciation/Depreciation"
              : "Add Appreciation/Deprrciation"}
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
                  Asset <span className="required">*</span>:
                </label>
                <select
                  name="assetId"
                  className="form-select vesselbox"
                  aria-label="Default select example"
                  onChange={handleChange}
                  value={formData.assetId}
                >
                  <option value="">Choose Asset</option>
                  {assetsList.map((asset) => (
                    <option key={asset?._id} value={asset?._id}>
                      {asset?.asset}
                    </option>
                  ))}
                </select>
                {errors.assetId && (
                  <span className="invalid">{errors.assetId}</span>
                )}
              </div>
              <div className="col mb-3">
                <label className="form-label">
                  Appreciation <span className="required">*</span>:
                </label>
                <input
                  name="appreciation"
                  type="number"
                  className="form-control custom-input-styles"
                  value={formData.appreciation}
                  onChange={handleChange}
                />
                {errors.appreciation && (
                  <span className="invalid">{errors.appreciation}</span>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">
                  Depreciation <span className="required">*</span>:
                </label>
                <input
                  name="depreciation"
                  type="number"
                  className="form-control custom-input-styles"
                  value={formData.depreciation}
                  onChange={handleChange}
                />
                {errors.depreciation && (
                  <span className="invalid">{errors.depreciation}</span>
                )}
              </div>
              <div className="col mb-3">
                <label className="form-label">
                  Assessment Year <span className="required">*</span>:
                </label>
                <select
                  name="year"
                  className="form-select vesselbox"
                  aria-label="Default select example"
                  onChange={handleChange}
                  value={formData.year}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                {errors.year && <span className="invalid">{errors.year}</span>}
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

      <Loader isLoading={isLoading} />

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default AddAppreciationDepreciation;
