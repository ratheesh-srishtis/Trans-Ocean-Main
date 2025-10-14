// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  saveEmployeePetty,
  editEmployeePetty,
  getAllBanks,
} from "../../services/apiPayment";
import PopUp from ".././PopUp";
const AddEmpPetty = ({
  open,
  onClose,
  employeeId,
  ListEmpPetty,
  pettyNumber,
  editMode,
  prevEmpPetty,
  errors,
  setErrors,
}) => {
  console.log("petyaa", pettyNumber);
  const [formData, setFormData] = useState({
    amount: "",
    pettyNumber: "",
    paymentDate: "",
    modeofPayment: "",
    bank: "",
    remark: "",
  });
  const [BankList, setBankList] = useState([]);
  const fetchBanks = async () => {
    try {
      const listbanks = await getAllBanks();
      setBankList(listbanks?.bank || []);
    } catch (error) {
      console.log("Bank list Error", error);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);
  useEffect(() => {
    if (editMode && prevEmpPetty) {
      let formattedDate = "";
      if (prevEmpPetty.dateofpay !== "N/A") {
        const [day, month, year] = prevEmpPetty.dateofPay.split("-");
        formattedDate = `${year}-${month}-${day}`;
      } else {
        formattedDate = "";
      }
      let modePay = "";
      if (
        prevEmpPetty.modeofPayment !== undefined &&
        prevEmpPetty.modeofPayment !== "N/A"
      )
        modePay = prevEmpPetty.modeofPayment.toLowerCase();

      setFormData({
        amount: prevEmpPetty.amount,
        pettyNumber: prevEmpPetty.pettyNumber,
        paymentDate: formattedDate,
        pettyId: prevEmpPetty._id,
        modeofPayment: modePay,
        bank:
          prevEmpPetty.bank && prevEmpPetty.bank._id
            ? prevEmpPetty.bank._id
            : "",
        remark: prevEmpPetty?.remark,
      });
    } else {
      setFormData((prevState) => ({
        ...prevState,
        pettyNumber: pettyNumber, // Set pettyNumber from props here
      }));
    }
  }, [editMode, prevEmpPetty, pettyNumber]);
  //const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (
      !/^\d*\.?\d+$/.test(formData.amount) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Amount must be numbers";
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment Date  is required";
    }
    if (!formData.modeofPayment)
      newErrors.modeofPayment = "Mode of payment is required";
    if (formData.modeofPayment === "bank" && !formData.bank) {
      newErrors.bank = "Bank name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!open) {
      setErrors({}); // Clear errors when the popup is closed
      setFormData({
        amount: "",
        pettyNumber: "",
        paymentDate: "",
        modeofPayment: "",
        bank: "",
        remark: "",
      });
    }
  }, [open, setErrors]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      formData.employeeId = employeeId;
      if (formData.pettyNumber == "") formData.pettyNumber = pettyNumber;
      let response;
      if (editMode) response = await editEmployeePetty(formData);
      else response = await saveEmployeePetty(formData);
      if (response.status === true) {
        setOpenPopUp(true);
        setMessage(response.message);
        setFormData({
          amount: "",
          voucherNumber: "",
          paymentDate: "",
          //pdaIds: "",
          modeofPayment: "",
          bank: "",
          remark: "",
        });
        let payload = { employeeId: employeeId };
        ListEmpPetty(payload);

        onClose();
      } else {
        setMessage(response.message);
        setOpenPopUp(true);
      }
    } catch (error) {
      setMessage(error);
      setOpenPopUp(true);
    }
  };
  const fetchEmpPetty = async () => {
    setOpenPopUp(false);
    let payload = { employeeId: employeeId };
    ListEmpPetty(payload);

    onClose();
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  return (
    <>
      <Dialog
        sx={{
          width: 800,
          margin: "auto",
          borderRadius: 2,
        }}
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            // Prevent dialog from closing when clicking outside
            return;
          }
          onClose(); // Allow dialog to close for other reasons
        }}
        fullWidth
        maxWidth="lg"
      >
        <div className="d-flex justify-content-between " onClick={onClose}>
          <DialogTitle>
            {editMode ? "Edit Employee Petty" : "Add Employee Petty"}
          </DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Petty Number:
                  </label>
                  <input
                    readOnly
                    name="pettyNumber"
                    type="text"
                    className="form-control vessel-voyage"
                    id="pettyNumber"
                    placeholder=""
                    onChange={handleChange}
                    value={editMode ? formData.pettyNumber : pettyNumber}
                  ></input>
                </div>
              </div>
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Amount <span className="required"> * </span> :
                  </label>
                  <input
                    name="amount"
                    type="text"
                    className="form-control vessel-voyage"
                    id="amount"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.amount}
                  ></input>
                  {errors.amount && (
                    <span className="invalid">{errors.amount}</span>
                  )}
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
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Bank <span className="required"> </span> :
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
                    Payment Date <span className="required"> </span> :
                  </label>
                  <div className="vessel-select">
                    <input
                      name="paymentDate"
                      type="date"
                      className="form-control vessel-voyage"
                      id="bank"
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
                    Remarks :
                  </label>
                  <div className="vessel-select">
                    <textarea
                      name="remark"
                      rows="1"
                      className="form-control formlabelcolor emailmessage"
                      id="remark"
                      onChange={handleChange}
                      value={formData.remark}
                      placeholder=""
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="btnuser">
              <button className="btn btna submit-button btnfsize">
                {" "}
                Submit{" "}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {openPopUp && <PopUp message={message} closePopup={fetchEmpPetty} />}
    </>
  );
};

export default AddEmpPetty;
