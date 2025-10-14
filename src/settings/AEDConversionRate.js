// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { editAedRate } from "../services/apiService";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
const AEDConversionRate = ({
  open,
  onClose,
  loginResponse,
  aedConversionRate,
}) => {
  const aedImage = require("../assets/images/aed.png");

  const [conversionRate, setConversionRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (aedConversionRate !== undefined && aedConversionRate !== null) {
      setConversionRate(aedConversionRate.toString());
    }
  }, [aedConversionRate]);

  const handleRateChange = (e) => {
    setConversionRate(e.target.value);
  };

  const handleSubmit = async () => {
    if (!conversionRate || conversionRate.trim() === "") {
      setMessage("Please enter a conversion rate value.");
      setOpenPopUp(true);
      return;
    }
    setLoading(true);
    try {
      await editAedRate({ conversionRate });
      setMessage("Conversion rate updated successfully.");
      setOpenPopUp(true);
      if (onClose) onClose();
    } catch (err) {
      setMessage("Failed to update conversion rate.");
      setOpenPopUp(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Loader isLoading={loading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}

      <div className="charge mt-2">
        <div className="rectangle"></div>
        <div>
          <img src={aedImage} alt="AED Image" />
        </div>
      </div>

      <div className="row m-5">
        <div className="col-md-4">
          <label htmlFor="exampleFormControlInput1" className="form-label">
            Conversion Rate:
          </label>
          <input
            type="text"
            className="form-control vessel-voyage"
            id="exampleFormControlInput1"
            value={conversionRate}
            onChange={handleRateChange}
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn btna generate-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AEDConversionRate;
