import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { getAllBanks } from "../../../services/apiSettings";
import { saveTax, editTax } from "../../../services/apiSubPayments";
import PopUp from "../../PopUp";
import Loader from "../../Loader";
import moment from "moment";

const AddTax = ({
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [openPopUp, setOpenPopUp] = useState(false);
  const years = Array.from({ length: 31 }, (_, i) => 2000 + i);

  const [formData, setFormData] = useState({
    year: "",
    amount: 0,
    modeofPayment: "",
    bank: "",
    paymentDate: "",
    isPaid: false,
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
        year: userSet.year ?? "",
        amount: userSet.amount ?? "",
        modeofPayment: userSet.modeofPayment || "",
        bank: selectedBank ? selectedBank._id : "",
        paymentDate: userSet.paymentDate
          ? moment(userSet.paymentDate, ["DD-MM-YYYY", moment.ISO_8601]).format(
              "YYYY-MM-DD"
            )
          : "",
        isPaid: userSet.isPaid === "Yes",
      });
    } else {
      setFormData({
        year: "",
        amount: 0,
        modeofPayment: "",
        bank: "",
        paymentDate: "",
        isPaid: false,
      });
    }
  }, [editMode, userSet, BankList]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear ONLY the changed field's error
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    // if (!formData.isPaid) newErrors.isPaid = "Is Paid is required";
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
        formData.taxId = userSet?._id;
        response = await editTax(formData);
        setIsLoading(false);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveTax(formData);
        setIsLoading(false);
      }
      if (response.status === true) {
        if (editMode) {
          setMessage("Tax updated successfully");
        } else {
          setMessage("Tax saved successfully");
        }

        setOpenPopUp(true);
        setFormData({
          year: "",
          amount: 0,
          modeofPayment: "",
          bank: "",
          paymentDate: "",
          isPaid: false,
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
          <DialogTitle>{editMode ? "Edit Tax" : "Add Tax"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg" onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">
                  Year <span className="required">*</span>:
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
                    Mode of Payment <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <select
                      name="modeofPayment"
                      className="form-select vesselbox"
                      aria-label="Default select example"
                      onChange={handleChange}
                      value={formData.modeofPayment}
                    >
                      <option value="">Mode of payment </option>
                      <option value="cash">Cash </option>
                      <option value="bank">Bank</option>
                    </select>
                    {errors.modeofPayment && (
                      <span className="invalid">{errors.modeofPayment}</span>
                    )}
                  </div>
                </div>
              </div>
              {formData?.modeofPayment == "bank" && (
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
                    Is Paid:
                  </label>
                  <div className="vessel-select">
                    <input
                      type="checkbox"
                      id="isPaid"
                      name="isPaid" // ✅ REQUIRED
                      checked={formData.isPaid} // ✅ controlled
                      onChange={handleChange}
                      style={{ marginRight: 6 }}
                    />
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

export default AddTax;
