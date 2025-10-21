// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  saveVoucher,
  editVoucher,
  getAllQuotationIds,
  // getAllBanks,
  getAllFinanceEmployees,
} from "../../services/apiPayment";
import PopUp from ".././PopUp";
import "../../css/payment.css";
import { getAllVendors } from "../../services/apiSettings";
const AddVoucher = ({
  open,
  onClose,
  vendorId,
  ListVouchers,
  editMode,
  prevVouchers,
  errors,
  setErrors,
}) => {
  const [QuotationList, setQuotationList] = useState([]);
  // const [BankList, setBankList] = useState([]);
  const [EmployeeList, setEmployeeList] = useState([]);
  const [pettyNumber, setPettyNumber] = useState("");
  const [vendorList, setVendorList] = useState([]);
  const [selectedVendorid, setSelectedVendorid] = useState("");

  const [formData, setFormData] = useState({
    amount: "",
    voucherNumber: "",
    through: "",
    voucherParticulers: "",
    voucherAccount: "",
    paymentDate: "",
    // pdaIds: "",
    // modeofPayment: "",
    // bank: "",
    vendorId: "",
    remark: "",
  });

  const fecthQuotations = async () => {
    try {
      const listquotations = await getAllQuotationIds();
      setQuotationList(listquotations?.quotations || []);
    } catch (error) {
      console.log("Invoice list Error", error);
    }
  };
  // const fetchBanks = async () => {
  //   try {
  //     const listbanks = await getAllBanks();
  //     setBankList(listbanks?.bank || []);
  //   } catch (error) {
  //     console.log("Bank list Error", error);
  //   }
  // };
  const fetchFinaceEmployees = async () => {
    try {
      const listemployees = await getAllFinanceEmployees();
      setEmployeeList(listemployees?.employees || []);
      setPettyNumber(listemployees.pettyNumber);
    } catch (error) {
      console.log("Employee list Error", error);
    }
  };

  const fetchVendorList = async () => {
    try {
      const listvendors = await getAllVendors();
      setVendorList(listvendors?.vendors || []);
    } catch (error) {
      console.log("Cannot fecth vendor", error);
    }
  };
  useEffect(() => {
    fecthQuotations();
    // fetchBanks();
    fetchFinaceEmployees();
    fetchVendorList();
  }, []);

  useEffect(() => {
    const resetFormData = () => {
      setFormData({
        amount: "",
        voucherNumber: pettyNumber,
        through: "",
        voucherParticulers: "",
        voucherAccount: "",
        paymentDate: "",
        // modeofPayment: "",
        // bank: "",
        vendorId: "",
        remark: "",
      });
    };
    console.log("Edit mode:", editMode);
    console.log("Previous vouchers:", prevVouchers);
    if (editMode && prevVouchers) {
      let formattedDate = "";
      if (prevVouchers.dateofpay !== "N/A") {
        const [day, month, year] = prevVouchers.dateofPay.split("-");
        formattedDate = `${year}-${month}-${day}`;
      } else {
        formattedDate = "";
      }
      // let modePay = "";
      // if (
      //   prevVouchers.modeofPayment !== undefined &&
      //   prevVouchers.modeofPayment !== "N/A"
      // )
      //   modePay = prevVouchers.modeofPayment.toLowerCase();
      //setPettyNumber(prevVouchers.voucherNumber);
      setFormData({
        amount: prevVouchers.amount,
        voucherNumber: prevVouchers.voucherNumber,
        through:
          prevVouchers.through && prevVouchers.through._id
            ? prevVouchers.through._id
            : "",
        voucherParticulers: prevVouchers.voucherParticulers,
        voucherAccount: prevVouchers.voucherAccount,
        paymentDate: formattedDate,
        pettyId: prevVouchers._id,
        //pdaIds:prevVouchers.pdaIds ? prevVouchers.pdaIds._id : "",
        // modeofPayment: modePay,
        // bank:
        //   prevVouchers.bank && prevVouchers.bank._id
        //     ? prevVouchers.bank._id
        //     : "",
        vendorId: prevVouchers.vendorId,
        remark: prevVouchers.remark,
      });
    } else {
      resetFormData();
    }
  }, [editMode, prevVouchers, pettyNumber]);

  //const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const validateForm = () => {
    const newErrors = {};

    //if(!formData.voucherNumber) newErrors.voucherNumber = "Petty Number is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (
      !/^\d*\.?\d+$/.test(formData.amount) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Amount must be numbers";
    }
    if (!formData.through) newErrors.through = "Through is required";
    if (!formData.voucherParticulers)
      newErrors.voucherParticulers = "Petty particular is required";
    if (!formData.voucherAccount)
      newErrors.voucherAccount = "Petty Account is required";
    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment Date  is required";
    }
    // if (!formData.modeofPayment)
    //   newErrors.modeofPayment = "Mode of payment is required";
    // if (formData.modeofPayment === "bank" && !formData.bank) {
    //   newErrors.bank = "Bank name is required";
    // }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!open) {
      setErrors({}); // Clear errors when the popup is closed
      setFormData({
        amount: "",
        voucherNumber: pettyNumber,
        through: "",
        voucherParticulers: "",
        voucherAccount: "",
        paymentDate: "",
        // pdaIds: "",
        // modeofPayment: "",
        // bank: "",
        vendorId: "",
        remark: "",
      });
    }
  }, [open, setErrors]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      //formData.voucherNumber=pettyNumber;
      let response;
      if (editMode) response = await editVoucher(formData);
      else response = await saveVoucher(formData);
      if (response.status === true) {
        setOpenPopUp(true);
        setMessage(response.message);
        setFormData({
          amount: "",
          voucherNumber: "",
          through: "",
          voucherParticulers: "",
          voucherAccount: "",
          paymentDate: "",
          //pdaIds: "",
          modeofPayment: "",
          bank: "",
          vendorId: "",
          remark: "",
        });
        let payload = { vendorId: formData?.vendorId };
        ListVouchers(payload);
        fetchFinaceEmployees();
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
  const fetchVouchers = async () => {
    setOpenPopUp(false);
    let payload = { vendorId: formData?.vendorId };
    ListVouchers(payload);

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

  useEffect(() => {
    console.log("Form data changed:", formData);
  }, [formData]);

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
        <div className="d-flex justify-content-between ">
          <DialogTitle>{editMode ? "Edit Petty" : "Add Petty"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/*<div className="col mb-3 align-items-start">
                                    <div className="">
                                      <label htmlFor="exampleFormControlInput1" className="form-label">
                                      Quotation Number:
                                      </label>
                                      <div className="vessel-select">
                                      <select
                                    name="pdaIds"
                                    className="form-select vesselbox"
                                    aria-label="Default select example"
                                    onChange={handleChange}
                                    value={formData.pdaIds}
                                  >
                                    <option value="">Choose Quotation Number</option>
                                    {QuotationList.map((invoice) => (
                                      <option key={invoice._id} value={invoice._id}>
                                        {`${invoice.pdaNumber}${invoice.invoiceId ? ` - ${invoice.invoiceId}` : ""}`}
                                      </option>
                                    ))}
                                  </select>
                                       
                                      </div>
                                    </div>
                                  </div>*/}
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
                    name="voucherNumber"
                    type="text"
                    className="form-control vessel-voyage"
                    id="voucherNumber"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.voucherNumber}
                  ></input>
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Through <span className="required"> * </span>:
                  </label>
                  <select
                    name="through"
                    className="form-select vesselbox"
                    aria-label="Default select example"
                    onChange={handleChange}
                    value={formData.through}
                  >
                    <option value="">Choose Employee</option>
                    {EmployeeList.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {`${emp.name}_Petty`}
                      </option>
                    ))}
                  </select>

                  {errors.through && (
                    <span className="invalid">{errors.through}</span>
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
                    {" "}
                    Particulars <span className="required"> * </span> :
                  </label>
                  <input
                    name="voucherParticulers"
                    type="text"
                    className="form-control vessel-voyage"
                    id="voucherParticulers"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.voucherParticulers}
                  ></input>
                  {errors.voucherParticulers && (
                    <span className="invalid">{errors.voucherParticulers}</span>
                  )}
                </div>
              </div>
              <div className="col-6 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    On Account of <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <input
                      name="voucherAccount"
                      type="text"
                      className="form-control vessel-voyage"
                      id="voucherAccount"
                      placeholder=""
                      onChange={handleChange}
                      value={formData.voucherAccount}
                    ></input>
                    {errors.voucherAccount && (
                      <span className="invalid">{errors.voucherAccount}</span>
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
              {/* <div className="col-6 mb-3 align-items-start">
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
              </div> */}
              {/* <div className="col-6 mb-3 align-items-start">
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
              </div> */}
            </div>

            <div className="row">
              {/* <div className=" col-6 mb-3 align-items-start">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label filterbypayment "
                >
                  {" "}
                  Vendor:
                </label>
                <div className="vessel-select">
                  <select
                    className="form-select vesselbox"
                    name="vendorId"
                    value={formData?.vendorId}
                    onChange={handleChange}
                  >
                    <option value="">Choose Vendor</option>
                    {vendorList.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.vendorName} {""}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}
              <div className=" col-6 mb-3 align-items-start">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label filterbypayment "
                >
                  {" "}
                  Remark:
                </label>
                <div className="vessel-select">
                  <textarea
                    className="form-control remarkeditpeety "
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    rows="1"
                  ></textarea>
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
      {openPopUp && <PopUp message={message} closePopup={fetchVouchers} />}
    </>
  );
};

export default AddVoucher;
