// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  getAllQuotationIds,
  getAllVendorQuotationIds,
  getCustomerQuotationIds,
  savePayment,
  editPayment,
  getVendorBalanceDue,
  getCustomerBalanceDue,
  getAllBanks,
  saveRefund,
  getPdaPaidAmount,
  getAllFinanceEmployees,
} from "../../services/apiPayment";
import Loader from "../Loader";
import PopUp from ".././PopUp";
import "../../css/payment.css";
const AddCustomerPayment = ({
  open,
  onClose,
  customerId,
  vendorId,
  ListCustomer,
  Balance,
  editMode,
  paymentvalues,
  errors,
  setErrors,
  buttonType,
  voucherNumber,
}) => {
  console.log(buttonType, "buttonType");
  console.log(paymentvalues, "paymentvalues ");
  console.log(vendorId, "vendorId checkIDS");
  console.log(customerId, "customerId checkIDS");
  const [QuotationList, setQuotationList] = useState([]);
  const [BankList, setBankList] = useState([]);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    pdaIds: "",
    voucherNumber: voucherNumber,
    balance: 0,
    currency: "",
    amount: "",
    modeofPayment: "",
    bank: "",
    paymentDate: "",
    exchangeLoss: 0,
    employeeId: "",
    isDirectPayment: false,
    remark: "",
    discountAmount: 0,
  });
  const [EmployeeList, setEmployeeList] = useState([]);

  useEffect(() => {
    const fetchPrevBalance = async () => {
      if (editMode && paymentvalues) {
        let prevpayload = {};
        let prevBalance = 0;
        if (customerId) {
          prevpayload = { pdaId: paymentvalues.pdaIds._id };
          if (buttonType == "addreceipt") {
            const prevbalanceCustomer = await getCustomerBalanceDue(
              prevpayload
            );
            prevBalance = prevbalanceCustomer.balanceDue;
          } else {
            const totalPaidAmt = await getPdaPaidAmount(prevpayload);
            prevBalance = totalPaidAmt.paidAmount;
          }
        } else if (vendorId) {
          prevpayload = { vendorId: vendorId, pdaId: paymentvalues.pdaIds._id };
          const prevbalanceVendor = await getVendorBalanceDue(prevpayload);
          prevBalance = prevbalanceVendor.balanceDue;
        }
        const [day, month, year] = paymentvalues.dateofpay.split("-");
        const formattedDate = `${year}-${month}-${day}`;
        const currencyval = paymentvalues.currency.toLowerCase();
        const modePay = paymentvalues.modeofPayment.toLowerCase();
        console.log(paymentvalues, "paymentvalues");
        setFormData({
          pdaIds: paymentvalues.pdaIds._id,
          voucherNumber: paymentvalues.voucherNumber
            ? paymentvalues.voucherNumber
            : "",
          balance: prevBalance,
          currency: currencyval,
          amount: paymentvalues.recvamount
            ? paymentvalues.recvamount
            : paymentvalues.amount,
          modeofPayment: modePay,
          bank:
            paymentvalues.bank && paymentvalues.bank._id
              ? paymentvalues.bank._id
              : "",
          exchangeLoss:
            paymentvalues?.exchangeLoss !== undefined &&
            paymentvalues?.exchangeLoss !== null &&
            paymentvalues?.exchangeLoss !== ""
              ? Number(paymentvalues.exchangeLoss)
              : 0,
          paymentDate: formattedDate,
          paymentId: paymentvalues._id,
          employeeId: paymentvalues?.employeeId?._id,
          isDirectPayment: paymentvalues?.isDirectPayment || false,
          remark: paymentvalues?.remark || "",
          discountAmount: paymentvalues?.discountAmount ?? 0,
        });
      } else {
        setFormData({
          pdaIds: "",
          voucherNumber: voucherNumber,
          balance: 0,
          currency: "",
          amount: "",
          modeofPayment: "",
          bank: "",
          paymentDate: "",
          exchangeLoss: 0,
          employeeId: "",
          isDirectPayment: false,
          remark: "",
          discountAmount: 0,
        });
      }
    };

    fetchPrevBalance();
    //fetchVoucherNumber();
    if (!editMode) {
      setFormData((prev) => ({
        ...prev,
        voucherNumber: voucherNumber,
      }));
    }
  }, [editMode, paymentvalues, customerId, vendorId, voucherNumber]);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "isDirectPayment" && !checked) {
      setFormData((prevData) => ({
        ...prevData,
        isDirectPayment: false,
        remark: "",
      }));
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      return;
    }

    // If modeofPayment is changed to 'cash', clear the bank field
    if (name === "modeofPayment" && value === "cash") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        bank: "",
      }));
    } else if (name === "exchangeLoss") {
      setFormData((prevData) => ({
        ...prevData,
        exchangeLoss: value === "" ? 0 : Number(value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (name === "discountAmount") {
      setFormData((prevData) => ({
        ...prevData,
        discountAmount: value === "" ? 0 : value,
      }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    if (name === "pdaIds") {
      let payload = {};
      if (customerId) {
        payload = { pdaId: value };
        if (buttonType === "addreceipt") {
          const balanceCustomer = await getCustomerBalanceDue(payload);
          if (balanceCustomer.status === true) {
            setFormData((prevData) => ({
              ...prevData,
              balance: balanceCustomer.balanceDue,
            }));
          } else {
            setFormData((prevData) => ({
              ...prevData,
              balance: 0,
            }));
          }
        } else {
          // Add payment TotalPaid amount
          const totalPaidAmt = await getPdaPaidAmount(payload);
          if (totalPaidAmt.status === true) {
            setFormData((prevData) => ({
              ...prevData,
              balance: totalPaidAmt.paidAmount,
            }));
          } else {
            setFormData((prevData) => ({
              ...prevData,
              balance: 0,
            }));
          }
        }
      } else if (vendorId) {
        payload = { vendorId: vendorId, pdaId: value };
        const balanceVendor = await getVendorBalanceDue(payload);
        if (balanceVendor.status === true) {
          setFormData((prevData) => ({
            ...prevData,
            balance: balanceVendor.balanceDue,
          }));
        } else {
          setFormData((prevData) => ({
            ...prevData,
            balance: 0,
          }));
        }
      }
    }
  };

  const fecthQuotations = async () => {
    try {
      let listquotations = null;
      if (customerId) {
        // listquotations = await getAllQuotationIds();
        listquotations = await getCustomerQuotationIds({
          customerId: customerId,
        });
      } else if (vendorId) {
        listquotations = await getAllVendorQuotationIds({ vendorId: vendorId });
      } else {
        setQuotationList([]);
        return;
      }
      setQuotationList(listquotations?.quotations || []);
    } catch (error) {
      setQuotationList([]);
      console.log("Invoice list Error", error);
    }
  };

  useEffect(() => {
    console.log(QuotationList, "QuotationList in useEffect");
  }, [QuotationList]);
  const fetchBanks = async () => {
    try {
      const listbanks = await getAllBanks();
      setBankList(listbanks?.bank || []);
    } catch (error) {
      console.log("Bank list Error", error);
    }
  };

  useEffect(() => {
    fecthQuotations();
    fetchBanks();
  }, [customerId, vendorId]);

  useEffect(() => {
    console.log(buttonType, "buttonType in useEffect");
  }, [buttonType]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.pdaIds) newErrors.pdaIds = "Quotation number is required";
    //if(formData.balance && (!/^\d*\.?\d+$/.test(formData.balance))) newErrors.balance = "Balance is required";
    if (!formData.currency) newErrors.currency = "Currency is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (
      !/^\d*\.?\d+$/.test(formData.amount) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Amount must be numbers";
    }
    if (
      (buttonType === "addreceipt" || buttonType === "addvenderpayment") &&
      (formData.discountAmount === undefined ||
        formData.discountAmount === null ||
        formData.discountAmount === "")
    ) {
      formData.discountAmount = 0;
    }
    if (!formData.modeofPayment)
      newErrors.modeofPayment = "Mode of payment is required";
    if (formData.modeofPayment === "bank" && !formData.bank) {
      newErrors.bank = "Bank name is required";
    }
    // Employee is mandatory if modeofPayment is cash and buttonType is addvenderpayment
    if (
      formData.modeofPayment === "cash" &&
      buttonType === "addvenderpayment" &&
      (!formData.employeeId || formData.employeeId === "")
    ) {
      newErrors.employeeId = "Employee is required";
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment Date  is required";
    }
    if (!formData.voucherNumber) {
      newErrors.voucherNumber = "Voucher number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!open) {
      setErrors({}); // Clear errors when the popup is closed
      setFormData({
        pdaIds: "",
        balance: 0,
        currency: "",
        amount: "",
        modeofPayment: "",
        bank: "",
        paymentDate: "",
        voucherNumber: voucherNumber,
        exchangeLoss: "",
        employeeId: "",
        isDirectPayment: false,
        remark: "",
        discountAmount: 0,
      });
    }
  }, [open, setErrors]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (vendorId) {
        formData.vendorId = vendorId;
        formData.customerId = "";
      } else if (customerId) {
        formData.vendorId = "";
        formData.customerId = customerId;
      }

      let response;
      if (editMode)
        response = await editPayment({
          ...formData,
          discountAmount:
            buttonType === "addreceipt" || buttonType === "addvenderpayment"
              ? formData.discountAmount === undefined ||
                formData.discountAmount === null ||
                formData.discountAmount === ""
                ? 0
                : formData.discountAmount
              : undefined,
          ...(buttonType === "addvenderpayment"
            ? { employeeId: formData.employeeId }
            : {}),
        });
      else {
        if (buttonType === "addreceipt" || buttonType === "addvenderpayment") {
          // Only pass isDirectPayment, remark, and discountAmount for savePayment
          const paymentData = {
            ...formData,
            remark: formData.isDirectPayment ? formData.remark : "",
            discountAmount:
              formData.discountAmount === undefined ||
              formData.discountAmount === null ||
              formData.discountAmount === ""
                ? 0
                : formData.discountAmount,
            ...(buttonType === "addvenderpayment"
              ? { employeeId: formData.employeeId }
              : {}),
          };
          response = await savePayment(paymentData);
        } else if (buttonType === "addpayment") {
          // Do not pass isDirectPayment, remark, or discountAmount for saveRefund
          const refundData = {
            ...formData,
            remark: formData.isDirectPayment ? formData.remark : "",
          };
          response = await saveRefund(refundData);
        }
      }
      console.log("Response from API:", response);
      if (response.status === true) {
        setIsLoading(false);
        setOpenPopUp(true);
        setMessage(response.message);
        setFormData({
          pdaIds: "",
          balance: 0,
          currency: "",
          amount: "",
          modeofPayment: "",
          bank: "",
          paymentDate: "",
          exchangeLoss: "",
          employeeId: "",
          isDirectPayment: false,
          remark: "",
          discountAmount: 0,
        });
        let payload = "";
        if (customerId) payload = { customerId: customerId };
        else if (vendorId) payload = { vendorId: vendorId };
        ListCustomer(payload);
        onClose();
      } else {
        setIsLoading(false);
        setMessage(response.message);
        setOpenPopUp(true);
      }
    } catch (error) {
      setIsLoading(false);
      setMessage(error);
      setOpenPopUp(true);
    }
  };
  /*const getCustomerBalance = async(payload)=>{
  const balanceCustomer = await getCustomerBalanceDue(payload);
  if(balanceCustomer.status === true){
    setFormData({ ...formData, pdaIds: payload.pdaId});
    setFormData({ ...formData, balance: balanceCustomer.balanceDue});
  }
  
  else
  setFormData({ ...formData, balance: 0});


}*/
  const fetchPayments = async () => {
    setOpenPopUp(false);
    let payloads = "";
    if (customerId) payloads = { customerId: customerId };
    else if (vendorId) payloads = { vendorId: vendorId };
    ListCustomer(payloads);
    onClose();
  };

  const fetchFinaceEmployees = async () => {
    try {
      const listemployees = await getAllFinanceEmployees();
      setEmployeeList(listemployees?.employees || []);
    } catch (error) {
      console.log("Employee list Error", error);
    }
  };
  useEffect(() => {
    fecthQuotations();
    fetchBanks();
    fetchFinaceEmployees();
  }, []);
  return (
    <>
      <Dialog
        sx={{
          width: 850,
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
          {buttonType === "addreceipt" ? (
            <DialogTitle>{editMode ? "Edit" : "Add Receipt"}</DialogTitle>
          ) : (
            <DialogTitle>{editMode ? "Edit" : "Add Payment"}</DialogTitle>
          )}
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
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
                    Voucher Number:
                  </label>
                  <input
                    name="voucherNumber"
                    type="number"
                    className="form-control vessel-voyage"
                    id="voucherNumber"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.voucherNumber}
                  ></input>
                  {errors.voucherNumber && (
                    <span className="invalid">{errors.voucherNumber}</span>
                  )}
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                <div className="payment-page">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Quotation Number:
                  </label>
                  <div className="payment-page ">
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
                          {`${invoice.pdaNumber}${
                            invoice.invoiceId ? ` - ${invoice.invoiceId}` : ""
                          }`}
                        </option>
                      ))}
                    </select>
                    {errors.pdaIds && (
                      <span className="invalid">{errors.pdaIds}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col mb-3 align-items-start">
                <div className="">
                  {buttonType === "addpayment" ? (
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      {" "}
                      Total Paid Amount(OMR):
                    </label>
                  ) : (
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      {" "}
                      Balance Dues(OMR):
                    </label>
                  )}
                  <input
                    name="balance"
                    type="text"
                    className="form-control vessel-voyage balancedue"
                    id="balance"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.balance}
                    readOnly
                  ></input>
                  {/*{errors.balance &&( <span className="invalid">{errors.balance}</span>)}*/}
                </div>
              </div>
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Amount
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
              <div className="col mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Currency:
                  </label>
                  <select
                    name="currency"
                    className="form-select vesselbox"
                    aria-label="Default select example"
                    onChange={handleChange}
                    value={formData.currency}
                  >
                    <option value="">Choose Currency </option>
                    <option value={"omr"}>OMR </option>
                    <option value="usd">USD </option>
                    <option value="aed">AED </option>
                  </select>
                  {errors.currency && (
                    <span className="invalid">{errors.currency}</span>
                  )}
                </div>
              </div>
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
                      className="form-control custom-picker-styles"
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
            </div>
            <div className="row">
              {buttonType !== "addpayment" && customerId && (
                <>
                  <div className="col-6 mb-3 align-items-start">
                    <div className="">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        {" "}
                        Exchange Loss
                      </label>
                      <input
                        name="exchangeLoss"
                        type="text"
                        className="form-control vessel-voyage"
                        id="exchangeLoss"
                        placeholder=""
                        onChange={handleChange}
                        value={formData.exchangeLoss}
                      ></input>
                      {errors.exchangeLoss && (
                        <span className="invalid">{errors.exchangeLoss}</span>
                      )}
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
              {formData?.modeofPayment == "cash" &&
                buttonType === "addvenderpayment" && (
                  <>
                    <div className="col-6 mb-3 align-items-start">
                      <div className="">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Employee <span className="required"> * </span> :
                        </label>
                        <div className="vessel-select">
                          <select
                            name="employeeId"
                            className="form-select vesselbox"
                            aria-label="Default select example"
                            onChange={handleChange}
                            value={formData.employeeId}
                          >
                            <option value="">Choose Employee</option>
                            {EmployeeList.map((emp) => (
                              <option key={emp._id} value={emp._id}>
                                {`${emp.name}_Petty`}
                              </option>
                            ))}
                          </select>
                          {errors.employeeId && (
                            <span className="invalid">{errors.employeeId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </div>
            <div className="row">
              {(buttonType === "addreceipt" ||
                buttonType === "addvenderpayment") && (
                <div className="col-6 mb-3 align-items-start">
                  <div className="">
                    <label htmlFor="discountAmount" className="form-label">
                      Discount (OMR)
                    </label>
                    <input
                      name="discountAmount"
                      type="number"
                      className="form-control vessel-voyage"
                      id="discountAmount"
                      placeholder=""
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prevData) => ({
                          ...prevData,
                          discountAmount: val === "" ? "" : Number(val),
                        }));
                      }}
                      value={
                        formData.discountAmount === 0
                          ? formData.discountAmount === ""
                            ? ""
                            : 0
                          : formData.discountAmount
                      }
                      min="0"
                    ></input>
                  </div>
                </div>
              )}
            </div>
            {/* {(buttonType === "addreceipt" ||
              buttonType === "addvenderpayment") && (
              <>
                </>
            )} */}
            {/* Direct Payment checkbox always visible */}
            <div className="row">
              <div className="col-6 mb-3 align-items-start">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isDirectPayment"
                    name="isDirectPayment"
                    checked={formData.isDirectPayment}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isDirectPayment">
                    Direct Payment
                  </label>
                </div>
              </div>
            </div>
            {/* Remark always in last row if direct payment is checked */}
            {formData.isDirectPayment && (
              <div className="row">
                <div className="col-12 mb-3 align-items-start">
                  <label htmlFor="remark" className="form-label">
                    Remark:
                  </label>
                  <textarea
                    className="form-control remmfont"
                    id="remark"
                    name="remark"
                    rows="2"
                    value={formData.remark}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            )}

            <div className="btnuser">
              <button className="btn btna submit-button btnfsize">
                {" "}
                Submit{" "}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {openPopUp && <PopUp message={message} closePopup={fetchPayments} />}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default AddCustomerPayment;
