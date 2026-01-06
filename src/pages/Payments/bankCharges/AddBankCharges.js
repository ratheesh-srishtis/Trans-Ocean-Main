import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { getAllBanks } from "../../../services/apiSettings";
import {
  saveBankCharge,
  editBankCharge,
} from "../../../services/apiSubPayments";
import PopUp from "../../PopUp";
import Loader from "../../Loader";
import moment from "moment";

const AddBankCharges = ({
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
  const [formData, setFormData] = useState({
    bank: "",
    amount: 0,
    paymentDate: "",
  });
  const [BankList, setBankList] = useState([]);

  const fetchBanks = async () => {
    setIsLoading(true);

    try {
      const listbanks = await getAllBanks();
      setBankList(listbanks?.bank || []);
      setIsLoading(false);
    } catch (error) {
      console.log("Bank list Error", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (editMode && userSet && BankList.length) {
      const selectedBank = BankList.find((b) => b.bankName === userSet.bank);
      setFormData({
        amount: userSet.amount ?? "",
        bank: selectedBank ? selectedBank._id : "",
        paymentDate: userSet.paymentDate
          ? moment(userSet.paymentDate, ["DD-MM-YYYY", moment.ISO_8601]).format(
              "YYYY-MM-DD"
            )
          : "",
      });
    } else {
      setFormData({
        amount: 0,
        bank: "",
        paymentDate: "",
      });
    }
  }, [editMode, userSet, BankList]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors
    // ✅ Clear ONLY the changed field's error
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.paymentDate)
      newErrors.paymentDate = "Payment Date is required";
    if (!formData.bank) newErrors.bank = "Bank is required";

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

    try {
      let response;
      if (editMode) {
        console.log("Edit mode formData:", formData);
        formData.bankChargeId = userSet?._id;
        response = await editBankCharge(formData);
        setIsLoading(false);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveBankCharge(formData);
        setIsLoading(false);
      }
      if (response.status === true) {
        if (editMode) {
          setMessage("Bank Charge Updated Successfully");
        } else {
          setMessage("Bank Charge Saved Successfully");
        }
        setOpenPopUp(true);
        setFormData({
          bank: "",
          amount: 0,
          paymentDate: "",
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
            {editMode ? "Edit Bank Charge" : "Add Bank Charge"}
          </DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg" onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-6 mb-3 align-items-start">
                <label className="form-label">
                  Amount <span className="required">*</span>:
                </label>
                <input
                  name="amount"
                  type="number"
                  className="form-control custom-input-styles"
                  value={formData.amount}
                  onChange={handleChange}
                />
                {errors.amount && (
                  <span className="invalid">{errors.amount}</span>
                )}
              </div>
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Bank <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <select
                      name="bank"
                      className="form-select vesselbox"
                      aria-label="Default select example"
                      onChange={handleChange}
                      value={formData.bank}
                    >
                      <option value="">Choose Bank</option>
                      {BankList.map((banks) => (
                        <option key={banks._id} value={banks._id}>
                          {banks.bankName}
                        </option>
                      ))}
                    </select>
                    {errors.bank && (
                      <span className="invalid">{errors.bank}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Payment Date <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <input
                      name="paymentDate"
                      type="date"
                      className="form-control custom-picker-styles"
                      id="paymentDate"
                      placeholder=""
                      onChange={handleChange}
                      value={formData.paymentDate}
                    ></input>
                    {errors.paymentDate && (
                      <span className="invalid">{errors.paymentDate}</span>
                    )}
                  </div>
                </div>
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

export default AddBankCharges;
