import React, { useState, useEffect } from "react";
import "../css/companybankdetails.css";
import {
  getCompanyBankDetails,
  updateCompanyBankDetails,
} from "../services/apiSettings";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
const CompanyBankDetails = () => {
  const [formData, setFormData] = useState({});
  // {
  //   bankName: "BANK MUSCAT",
  //   address: "FALAJ AL QABAIL SOHAR, SULTANATE OF OMAN",
  //   accountNumberOMR: "0423061688920014",
  //   ibanOMR: "OM700270423061688920014",
  //   accountNumberUSD: "0423061688920022",
  //   ibanUSD: "OM480270423061688920022",
  //   swiftCode: "BMUSOMRXXXX",
  // }
  const [isLoading, setIsLoading] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const fetchBankDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getCompanyBankDetails();
      console.log("Bank Details Response:", ...response?.bankDetails);
      setFormData(...response?.bankDetails);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "bankName", label: "Bank Name" },
      { field: "bankAddress", label: "Address" },
      { field: "accountNumberOMR", label: "A/C Number (OMR)" },
      { field: "ibanOMR", label: "IBAN (OMR)" },
      { field: "accountNumberUSD", label: "A/C Number (USD)" },
      { field: "ibanUSD", label: "IBAN (USD)" },
      { field: "swiftCode", label: "SWIFT Code" },
    ];

    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(({ field, label }) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = `${label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handlePopupClose = () => {
    setOpenPopUp(false);
    // Add any additional logic if needed when popup closes
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setOpenPopUp(true);
      setMessage("Please fill all required fields");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    const { _id, ...rest } = formData;
    const payload = { detailsId: _id, ...rest };
    console.log("Bank Details Payload:", payload);
    const response = await updateCompanyBankDetails(payload);
    console.log("Update Response:", response);
    if (response?.status == true) {
      setIsLoading(false);
      setMessage("Bank details updated successfully!");
      setOpenPopUp(true);
      setIsSuccess(true);
      fetchBankDetails();
    } else {
      setIsLoading(false);
      setMessage("Failed to update bank details. Please try again.");
      setOpenPopUp(true);
      setIsSuccess(false);
      fetchBankDetails();
    }
  };

  return (
    <>
      <div className="company-bank-details-container">
        <h4 className="form-title">Edit Company Bank Details</h4>
        <form className="bank-details-form">
          <div className="row">
            <div className="form-group col-6">
              <label htmlFor="bankName">
                Bank Name<span className="required"> * </span>
              </label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                className="form-control"
                value={formData.bankName}
                onChange={handleInputChange}
              />
              {errors.bankName && (
                <span className="invalid">{errors.bankName}</span>
              )}
            </div>
            <div className="form-group col-6">
              <label htmlFor="bankAddress">
                Address<span className="required"> * </span>
              </label>
              <input
                type="text"
                id="bankAddress"
                name="bankAddress"
                className="form-control"
                value={formData.bankAddress}
                onChange={handleInputChange}
              />
              {errors.bankAddress && (
                <span className="invalid">{errors.bankAddress}</span>
              )}
            </div>
          </div>

          <div className="row">
            <div className="form-group col-6">
              <label htmlFor="accountNumberOMR">
                A/C Number (OMR)<span className="required"> * </span>
              </label>
              <input
                type="text"
                id="accountNumberOMR"
                name="accountNumberOMR"
                className="form-control"
                value={formData.accountNumberOMR}
                onChange={handleInputChange}
              />
              {errors.accountNumberOMR && (
                <span className="invalid">{errors.accountNumberOMR}</span>
              )}
            </div>
            <div className="form-group col-6">
              <label htmlFor="ibanOMR">
                IBAN (OMR)<span className="required"> * </span>
              </label>
              <input
                type="text"
                id="ibanOMR"
                name="ibanOMR"
                className="form-control"
                value={formData.ibanOMR}
                onChange={handleInputChange}
              />
              {errors.ibanOMR && (
                <span className="invalid">{errors.ibanOMR}</span>
              )}
            </div>
          </div>

          <div className="row">
            <div className="form-group col-6">
              <label htmlFor="accountNumberUSD">
                A/C Number (USD)<span className="required"> * </span>
              </label>
              <input
                type="text"
                id="accountNumberUSD"
                name="accountNumberUSD"
                className="form-control"
                value={formData.accountNumberUSD}
                onChange={handleInputChange}
              />
              {errors.accountNumberUSD && (
                <span className="invalid">{errors.accountNumberUSD}</span>
              )}
            </div>
            <div className="form-group col-6">
              <label htmlFor="ibanUSD">
                IBAN (USD)<span className="required"> * </span>
              </label>
              <input
                type="text"
                id="ibanUSD"
                name="ibanUSD"
                className="form-control"
                value={formData.ibanUSD}
                onChange={handleInputChange}
              />
              {errors.ibanUSD && (
                <span className="invalid">{errors.ibanUSD}</span>
              )}
            </div>
          </div>

          <div className="row">
            <div className="form-group col-6">
              <label htmlFor="swiftCode">
                SWIFT Code<span className="required"> * </span>
              </label>
              <input
                type="text"
                id="swiftCode"
                name="swiftCode"
                className="form-control"
                value={formData.swiftCode}
                onChange={handleInputChange}
              />
              {errors.swiftCode && (
                <span className="invalid">{errors.swiftCode}</span>
              )}
            </div>
          </div>

          <div className="form-group text-center mt-4">
            <button
              type="button"
              className="btn btn-success btnbankdet px-5"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </form>
      </div>
      {openPopUp && <PopUp message={message} closePopup={handlePopupClose} />}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default CompanyBankDetails;
