import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { getAllBanks } from "../../../services/apiSettings";
import {
  saveOtherIncome,
  editOtherIncome,
} from "../../../services/apiSubPayments";
import PopUp from "../../PopUp";
import Loader from "../../Loader";
import moment from "moment";

const AddIncome = ({
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
    particulers: "",
    amount: 0,
    modeofPayment: "",
    bank: "",
    paymentDate: "",
    remark: "",
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
    console.log(userSet, "userSet");
    if (editMode && userSet && BankList.length) {
      const selectedBank = BankList.find((b) => b.bankName === userSet.bank);
      setFormData({
        particulers: userSet.particulers || "",
        amount: userSet.amount ?? "",
        modeofPayment: userSet.modeofPayment || "",
        bank: selectedBank ? selectedBank._id : "",
        paymentDate: userSet.paymentDate
          ? moment(userSet.paymentDate, ["DD-MM-YYYY", moment.ISO_8601]).format(
              "YYYY-MM-DD"
            )
          : "",
        remark: userSet.remark || "",
      });
    } else {
      setFormData({
        particulers: "",
        amount: 0,
        modeofPayment: "",
        bank: "",
        paymentDate: "",
        remark: "",
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
    if (!formData.particulers)
      newErrors.particulers = "Particulars is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.modeofPayment)
      newErrors.modeofPayment = "Mode Of Payment is required";
    if (!formData.paymentDate)
      newErrors.paymentDate = "Payment Date is required";
    if (formData.modeofPayment == "bank") {
      if (!formData.bank) newErrors.bank = "Bank is required";
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

    try {
      let response;
      if (editMode) {
        console.log("Edit mode formData:", formData);
        formData.otherIncomeId = userSet?._id;
        response = await editOtherIncome(formData);
        setIsLoading(false);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveOtherIncome(formData);
        setIsLoading(false);
      }
      if (response.status === true) {
        if (editMode) {
          setMessage("Other Income Updated Successfully");
        } else {
          setMessage("Other Income Saved Successfully");
        }

        setOpenPopUp(true);
        setFormData({
          name: "",
          username: "",
          email: "",
          role: "",
          password: "",
          phonenumber: "",
          emailsignature: {},
          employeeId: "",
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
            {editMode ? "Edit Other Income" : "Add Other Income"}
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
                <input
                  name="particulers"
                  type="text"
                  className="form-control custom-input-styles"
                  value={formData.particulers}
                  onChange={handleChange}
                />
                {errors.particulers && (
                  <span className="invalid">{errors.particulers}</span>
                )}
              </div>
              <div className="col mb-3">
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
            </div>
            <div className="row">
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Mode Of Payment <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <select
                      name="modeofPayment"
                      className="form-select vesselbox"
                      aria-label="Default select example"
                      onChange={handleChange}
                      value={formData.modeofPayment}
                    >
                      <option value="">Mode Of payment </option>
                      <option value="Cash">Cash </option>
                      <option value="Bank">Bank</option>
                    </select>
                    {errors.modeofPayment && (
                      <span className="invalid">{errors.modeofPayment}</span>
                    )}
                  </div>
                </div>
              </div>
              {formData?.modeofPayment == "Bank" && (
                <>
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
                </>
              )}
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

              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Remarks:
                  </label>
                  <div className="vessel-select">
                    <textarea
                      name="remark"
                      className="form-control vessel-voyage"
                      id="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      style={{ width: "100%", resize: "none" }}
                    ></textarea>
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

export default AddIncome;
