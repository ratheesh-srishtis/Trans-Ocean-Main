// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import "../../css/viewvoucher.css";
import { getBankPaymentDetails } from "../../services/apiService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
const ViewPaymentDetails = ({ open, onClose, selectedRow }) => {
  // Reset filters when dialog is closed
  useEffect(() => {
    if (!open) {
      setSelectedBankId("");
      setSelectedCustomer("");
      setSelectedvendor("");
      setSelectedEmployee("");
      setDateRange([null, null]);
    }
  }, [open]);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [bankList, setBankList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [EmployeeList, setEmployeeList] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedvendor, setSelectedvendor] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Fetch dropdown data on mount
  useEffect(() => {
    // Dummy fetchers, replace with your actual API calls if needed
    import("../../services/apiPayment").then(
      ({ getAllBanks, getAllFinanceEmployees }) => {
        getAllBanks().then((res) => setBankList(res?.bank || []));
        getAllFinanceEmployees().then((res) =>
          setEmployeeList(res?.employees || [])
        );
      }
    );
    import("../../services/apiSettings").then(
      ({ getAllCustomers, getAllVendors }) => {
        getAllCustomers({ sortByName: true }).then((res) =>
          setCustomerList(res?.customers || [])
        );
        getAllVendors({ sortByName: true }).then((res) =>
          setVendorList(res?.vendors || [])
        );
      }
    );
  }, []);

  // Handle filter changes
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    if (name === "bank") setSelectedBankId(value);
    else if (name === "customer") setSelectedCustomer(value);
    else if (name === "vendor") setSelectedvendor(value);
    else if (name === "employee") setSelectedEmployee(value);
  };

  // Date selection: if user selects from date, to date is mandatory
  const handleDateRangeChange = (update) => {
    console.log(update, "update");
    // update is [from, to]
    if (update[0] && !update[1]) {
      // Only from date selected, do not set until to date is picked
      setDateRange([update[0], null]);
    } else if (update[0] && update[1]) {
      // Both dates selected
      setDateRange(update);
      // Call API immediately when both dates are picked
      const payload = {
        bankId: selectedBankId || selectedRow?.bankId || "",
        customerId: selectedCustomer,
        vendorId: selectedvendor,
        pettyEmployeeId: selectedEmployee,
        paymentDateFrom: update[0]
          ? moment(update[0]).format("YYYY-MM-DD")
          : "",
        paymentDateTo: update[1] ? moment(update[1]).format("YYYY-MM-DD") : "",
        pdaId: "",
        filter: "",
      };
      getBankPaymentDetails(payload)
        .then(setPaymentDetails)
        .catch((error) => {
          setPaymentDetails({ error: error.message });
        });
    } else {
      // Cleared
      setDateRange([null, null]);
      // Optionally, you can call API with no date filter here if needed
    }
  };

  // Fetch report when filters change
  useEffect(() => {
    // Only call API if both startDate and endDate are set, or both are null (no date filter)
    const bothDatesSelected =
      (startDate && endDate) || (!startDate && !endDate);
    if (
      open &&
      selectedRow &&
      selectedRow.bankId !== undefined &&
      bothDatesSelected
    ) {
      const payload = {
        bankId: selectedBankId || selectedRow.bankId || "",
        customerId: selectedCustomer,
        vendorId: selectedvendor,
        employee: selectedEmployee,
        pdaId: "",
        paymentDateFrom: startDate
          ? moment(startDate).format("YYYY-MM-DD")
          : "",
        paymentDateTo: endDate ? moment(endDate).format("YYYY-MM-DD") : "",
        filter: "",
      };
      getBankPaymentDetails(payload)
        .then(setPaymentDetails)
        .catch((error) => {
          setPaymentDetails({ error: error.message });
        });
    }
  }, [
    open,
    selectedRow,
    selectedBankId,
    selectedCustomer,
    selectedvendor,
    selectedEmployee,
    startDate,
    endDate,
  ]);

  return (
    <>
      <Dialog
        sx={{
          margin: "auto",
          borderRadius: 2,
        }}
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            // Prevent dialog from closing when clicking outside
            return;
          }
          // Reset all filters when dialog closes
          setSelectedBankId("");
          setSelectedCustomer("");
          setSelectedvendor("");
          setSelectedEmployee("");
          setDateRange([null, null]);
          onClose(); // Allow dialog to close for other reasons
        }}
        fullWidth
        maxWidth="xl"
      >
        <div className="d-flex justify-content-between ">
          <DialogTitle>Payment Details</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <div>
            <div className="mt-3 d-flex mb-3">
              <div className="jobfilter banksummarypayment  ">
                <label
                  htmlFor="inputPassword"
                  className=" form-labele col-form-label text-nowrap"
                >
                  Date Filter:
                </label>
                <div className="custom-date-input-container">
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update, e) => {
                      handleDateRangeChange(update);
                    }}
                    isClearable={true}
                    placeholderText="Select from and to date"
                    className="custom-date-input datefilterpaym form-control dateffont "
                    calendarClassName="custom-calendar"
                    dateFormat="dd-MM-yyyy"
                  />
                </div>
              </div>

              <div className=" d-flex banksummarybank">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-labele filterbypayment "
                >
                  Filter By:
                </label>
                <div className="vessel-select">
                  <select
                    className="form-select vesselbox statusscustomernew"
                    aria-label="Small select example"
                    name="customer"
                    onChange={handleSelectChange}
                    value={selectedCustomer}
                  >
                    <option value="">Select Customer</option>
                    {customerList?.map((customer) => (
                      <option key={customer?._id} value={customer?._id}>
                        {customer?.customerName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className=" d-flex banksummarybank">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-labele filterbypayment "
                >
                  Filter By:
                </label>
                <div className="vessel-select">
                  <select
                    className="form-select vesselbox statusscustomername"
                    aria-label="Small select example"
                    name="vendor"
                    onChange={handleSelectChange}
                    value={selectedvendor}
                  >
                    <option value="">Select Vendor</option>
                    {vendorList?.map((vendor) => (
                      <option key={vendor?._id} value={vendor?._id}>
                        {vendor?.vendorName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* <div className=" d-flex banksummarybank">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-labele filterbypayment "
                >
                  Filter By:
                </label>
                <div className="vessel-select">
                  <select
                    className="form-select vesselbox statusscustomername "
                    aria-label="Small select example"
                    name="employee"
                    onChange={handleSelectChange}
                    value={selectedEmployee}
                  >
                    <option value="">Choose Employee</option>
                    {EmployeeList.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {`${emp.name}_Petty`}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}
            </div>
          </div>

          {paymentDetails &&
          paymentDetails.status &&
          Array.isArray(paymentDetails.payments) &&
          paymentDetails.payments.length > 0 ? (
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={paymentDetails.payments.map((p, idx) => ({
                  id: p._id || idx,
                  voucherNumber: p.voucherNumber || "-",
                  amount: p.amount,
                  currency: p.currency ? p.currency.toUpperCase() : "-",
                  exchangeLoss: p.exchangeLoss
                    ? p.exchangeLoss.toFixed(3)
                    : "0.000",
                  modeofPayment: p.modeofPayment,
                  paymentDate: p.paymentDate
                    ? new Date(p.paymentDate).toLocaleDateString()
                    : "-",
                  customer: p.customerId?.customerName || "-",
                  vendor: p.vendorId?.vendorName || "-",
                  employee: p.pettyEmployeeId?.name || "-",
                  paymentType: p.paymentType,
                  pdaNumber: p.pdaIds?.pdaNumber || "-",
                  invoiceId: p.pdaIds?.invoiceId || "-",
                  jobId: p.pdaIds?.jobId || "-",
                }))}
                columns={[
                  {
                    field: "payee",
                    headerName: "Customer/Vendor/Employee",
                    flex: 1,
                    renderCell: (params) => {
                      const names = [
                        params.row.customer !== "-"
                          ? params.row.customer
                          : null,
                        params.row.vendor !== "-" ? params.row.vendor : null,
                        params.row.employee !== "-"
                          ? params.row.employee
                          : null,
                      ].filter(Boolean);
                      return (
                        <div>{names.length > 0 ? names.join(" / ") : "-"}</div>
                      );
                    },
                  },
                  { field: "voucherNumber", headerName: "Voucher No", flex: 1 },
                  { field: "amount", headerName: "Amount", flex: 1 },
                  { field: "currency", headerName: "Currency", flex: 1 },
                  {
                    field: "exchangeLoss",
                    headerName: "Exchange Loss",
                    flex: 1,
                  },
                  {
                    field: "modeofPayment",
                    headerName: "Mode of Payment",
                    flex: 1,
                  },
                  { field: "paymentDate", headerName: "Payment Date", flex: 1 },
                  { field: "paymentType", headerName: "Payment Type", flex: 1 },
                  { field: "pdaNumber", headerName: "PDA Number", flex: 1 },
                  { field: "invoiceId", headerName: "Invoice ID", flex: 1 },
                  { field: "jobId", headerName: "Job ID", flex: 1.5 },
                ]}
                sx={{
                  "& .MuiDataGrid-root": {
                    border: "none",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: "#eee !important", // Set gray background color
                    color: "#000000", // Set white text color for contrast
                    fontWeight: "bold", // Optional: Make the text bold
                  },
                  "& .MuiDataGrid-cell": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  "& .MuiTablePagination-toolbar": {
                    alignItems: "baseline", // Apply align-items baseline
                  },
                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: "#eee", // Gray background for the footer
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold", // Bold font for header text
                  },
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none", // Remove the blue focus outline
                  },
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center", // Center vertically
                    justifyContent: "left", // Center horizontally
                    textOverflow: "ellipsis",
                  },
                }}
                pageSizeOptions={[5, 10, 20, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                      page: 0,
                    },
                  },
                }}
                disableSelectionOnClick
                autoHeight
              />
            </div>
          ) : paymentDetails &&
            paymentDetails.status &&
            paymentDetails.payments.length === 0 ? (
            <div className="nopayment">No payment details found.</div>
          ) : paymentDetails && paymentDetails.error ? (
            <div>Error: {paymentDetails.error}</div>
          ) : (
            <div>Loading...</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewPaymentDetails;
