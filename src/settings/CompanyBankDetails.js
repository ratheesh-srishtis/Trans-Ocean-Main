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
  };

  const handleSave = async () => {
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
      fetchBankDetails();
    } else {
      setIsLoading(false);
      setMessage("Failed to update bank details. Please try again.");
      setOpenPopUp(true);
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
              <label htmlFor="bankName">Bank Name</label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                className="form-control"
                value={formData.bankName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group col-6">
              <label htmlFor="bankAddress">Address</label>
              <input
                type="text"
                id="bankAddress"
                name="bankAddress"
                className="form-control"
                value={formData.bankAddress}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-6">
              <label htmlFor="accountNumberOMR">A/C Number (OMR)</label>
              <input
                type="text"
                id="accountNumberOMR"
                name="accountNumberOMR"
                className="form-control"
                value={formData.accountNumberOMR}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group col-6">
              <label htmlFor="ibanOMR">IBAN (OMR)</label>
              <input
                type="text"
                id="ibanOMR"
                name="ibanOMR"
                className="form-control"
                value={formData.ibanOMR}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-6">
              <label htmlFor="accountNumberUSD">A/C Number (USD)</label>
              <input
                type="text"
                id="accountNumberUSD"
                name="accountNumberUSD"
                className="form-control"
                value={formData.accountNumberUSD}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group col-6">
              <label htmlFor="ibanUSD">IBAN (USD)</label>
              <input
                type="text"
                id="ibanUSD"
                name="ibanUSD"
                className="form-control"
                value={formData.ibanUSD}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-6">
              <label htmlFor="swiftCode">SWIFT Code</label>
              <input
                type="text"
                id="swiftCode"
                name="swiftCode"
                className="form-control"
                value={formData.swiftCode}
                onChange={handleInputChange}
              />
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
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default CompanyBankDetails;
