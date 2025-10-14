import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getPayments,
  getAllQuotationIds,
  deletePayment,
  getVoucherNumber,
} from "../../services/apiPayment";
import { getAllCustomers } from "../../services/apiSettings";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Addpayment from "./AddPayment";
import Swal from "sweetalert2";
import "../../css/payment.css";
import PopUp from "../PopUp";
import ViewCustomerVoucher from "./ViewCustomerVoucher";
const CustomerPayments = () => {
  const Group = require("../../assets/images/payments.png");
  const paymentIcon = require("../../assets/images/payment-icon.png");
  const [QuotationList, setQuotationList] = useState([]);
  const [ButtonId, SetButtonId] = useState();
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomerid, setSelectedCustomerid] = useState("");
  const [totalInvoiceAmount, setInvoiceAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [open, setOpen] = useState(false);
  const [customerpayment, setCustomerpayment] = useState([]);
  const location = useLocation();
  const { customerId } = location.state || {};
  const [period, setPeriod] = useState("");
  const [inputFilterDate, setFilterDate] = useState("");
  const [inputpdaId, setPdaId] = useState("");
  const [FilterName, setFilterName] = useState("");
  const [FilterValue, setFilterValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [errors, setErrors] = useState({});
  const [voucherNumber, setVoucherNumber] = useState(false);
  const [viewopen, setviewOpen] = useState(false);
  const [isDirectCustomerPayment, setIsDirectPayment] = useState(false);

  // Helper to get correct isDirectPayment value
  const getIsDirectPaymentValue = () => (isDirectCustomerPayment ? true : "");

  const fetchCustomerList = async () => {
    try {
      const listcustomers = await getAllCustomers();
      setCustomerList(listcustomers?.customers || []);
    } catch (error) {
      console.log("Cannot fecth customer", error);
    }
  };
  const fecthQuotations = async () => {
    try {
      const listquotations = await getAllQuotationIds();
      setQuotationList(listquotations?.quotations || []);
    } catch (error) {
      console.log("Invoice list Error", error);
    }
  };

  const fetchVoucherNumber = async () => {
    const listvoucherNumber = await getVoucherNumber();
    const fetchedvoucherNumber = listvoucherNumber?.voucherNumber || [];
    setVoucherNumber(fetchedvoucherNumber);
  };

  const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
  const currentroleType = loginResponse.data?.userRole?.roleType;

  useEffect(() => {
    fetchVoucherNumber();
    fetchCustomerList();
    fecthQuotations();
    if (customerId) setSelectedCustomerid(customerId);
    let payload = {
      customerId: customerId,
      isDirectPayment: getIsDirectPaymentValue(),
    };
    fetchCustomerpayments(payload);
  }, [customerId]);

  const fetchCustomerpayments = async (payload) => {
    try {
      const Listpayments = await getPayments(payload);
      console.log(Listpayments, "Listpayments");
      setCustomerpayment(Listpayments?.payments || []);
      setInvoiceAmount((Listpayments?.totalInvoiceAmount || 0).toFixed(3));
      setPaidAmount((Listpayments?.paidAmount || 0).toFixed(3));
      setDiscountAmount((Listpayments?.discountAmountOMR || 0).toFixed(3));
      const totalAmount = Listpayments?.totalInvoiceAmount || 0;
      const amountpaid = Listpayments?.paidAmount || 0;
      const discount = Listpayments?.discountAmountOMR || 0;
      const balance = totalAmount - amountpaid - discount;
      setBalanceAmount(parseFloat(balance.toFixed(3)));
    } catch (error) {
      console.log("Error in Api", error);
    }
  };

  const handleListCustomer = (payload) => {
    setEditMode(false);
    fetchCustomerpayments({
      ...payload,
      isDirectPayment: getIsDirectPaymentValue(),
    });
    setOpen(false);
  };

  const handleChange = (e) => {
    setSelectedCustomerid("");
    setSelectedCustomerid(e.target.value);
    let paylaod = {
      customerId: e.target.value,
      paymentDate: inputFilterDate,
      pdaId: inputpdaId,
      filter: FilterName,
      [FilterName]: FilterValue,
      isDirectPayment: getIsDirectPaymentValue(),
    };
    fetchCustomerpayments(paylaod);
  };
  const OpenDialog = (buttonId) => {
    SetButtonId(buttonId);
    handClickOpen();
  };
  const handClickOpen = () => {
    setOpen(true);
  };
  const resetErrors = () => {
    setErrors({});
  };
  const handleClose = () => {
    fetchVoucherNumber();
    setOpen(false);
    setEditMode(false);
    setSelectedRow(null);
    resetErrors();
  };

  useEffect(() => {
    console.log(ButtonId, "ButtonId in useEffect");
  }, [ButtonId]);

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const handleTimeperiod = async (e) => {
    let payload = "";
    const SelectBxname = e.target.name;
    if (SelectBxname === "paymentDate") {
      setPeriod("");
      setFilterDate(e.target.value);
      payload = {
        customerId: selectedCustomerid,
        paymentDate: e.target.value,
        pdaId: inputpdaId,
        isDirectPayment: getIsDirectPaymentValue(),
      };
    } else if (SelectBxname === "pdaId") {
      setPdaId(e.target.value);
      payload = {
        customerId: selectedCustomerid,
        paymentDate: inputFilterDate,
        pdaId: e.target.value,
        filter: FilterName,
        [FilterName]: FilterValue,
        isDirectPayment: getIsDirectPaymentValue(),
      };
    } else {
      setFilterDate("");
      setFilterName(SelectBxname);
      setFilterValue(e.target.value);
      payload = {
        customerId: selectedCustomerid,
        paymentDate: "",
        pdaId: inputpdaId,
        filter: SelectBxname,
        [SelectBxname]: e.target.value,
        isDirectPayment: getIsDirectPaymentValue(),
      };
    }
    fetchCustomerpayments(payload);
  };
  const payloadParams = {
    customerId: selectedCustomerid,
    paymentDate: inputFilterDate,
    pdaId: inputpdaId,
    filter: FilterName,
    [FilterName]: FilterValue,
    isDirectPayment: getIsDirectPaymentValue(),
  };
  const handleDelete = async (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (item?._id) {
          try {
            let payload = {
              paymentId: item?._id,
            };
            const response = await deletePayment(payload);

            setMessage(response.message);
            setOpenPopUp(true);
            fetchCustomerpayments(payloadParams);
          } catch (error) {
            Swal.fire("Error deleting payments");
            fetchCustomerpayments(payloadParams);
          }
        }
      }
    });
  };
  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditMode(true);
    let button_type = "";
    console.log(row, "row in handleEdit");
    if (row.paymentType == "received") button_type = "addreceipt";
    else button_type = "addpayment";
    OpenDialog(button_type);
  };
  const NoRowsOverlay = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        color: "gray",
      }}
    >
      <Typography>No Record Found</Typography>
    </Box>
  );

  const columns = [
    { field: "jobId", headerName: "Job ID", flex: 2 },
    {
      field: "quotation",
      headerName: "Quotation Number",
      flex: 2,
      minWidth: 150,
    },
    { field: "invoice", headerName: "Invoice", flex: 2 },
    {
      field: "recvamount",
      headerName: "Received Amount",
      flex: 2,
      minWidth: 100,
    },
    { field: "amount", headerName: "Paid Amount", flex: 2, minWidth: 100 },
    { field: "currency", headerName: "Currency", flex: 2, minWidth: 100 },
    {
      field: "exchangeLoss",
      headerName: "Exchange Loss",
      flex: 2,
      minWidth: 100,
    },
    {
      field: "discountAmount",
      headerName: `Discount (OMR)`,
      flex: 2,
      minWidth: 100,
    },
    {
      field: "modeofPayment",
      headerName: "Mode of Payment",
      flex: 2,
      minWidth: 150,
    },
    { field: "dateofpay", headerName: "Payment Date", flex: 2, minWidth: 120 },
    { field: "banks", headerName: "Bank", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      flex: 3,
      renderCell: (params) => (
        <>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              className="btn btna submitpaymentbutton btnfsize"
              onClick={() => handleView(params.row)}
              style={{ marginRight: "8px" }}
            >
              View
            </button>
            <IconButton color="primary" onClick={() => handleEdit(params.row)}>
              <EditIcon sx={{ fontSize: "19px" }} />
            </IconButton>
            {/* Show paymentIcon only if isDirectPayment is true */}
            {params.row.isDirectPayment === true && (
              <img
                src={paymentIcon}
                alt="Direct Payment"
                style={{ width: 22, height: 22, marginLeft: 8, marginRight: 8 }}
              />
            )}
            {currentroleType === "admin" && (
              <>
                <IconButton
                  color="secondary"
                  onClick={() => handleDelete(params.row)}
                >
                  <DeleteIcon sx={{ fontSize: "19px" }} />
                </IconButton>
              </>
            )}{" "}
          </div>
        </>
      ),
    },
  ];

  const handleView = (row) => {
    setSelectedRow(row);
    openViewDialog();
  };
  const openViewDialog = () => {
    handleClickOpenView();
  };
  const handleClickOpenView = () => {
    setviewOpen(true);
  };

  const handleCloseView = () => {
    setviewOpen(false);
    setSelectedRow(null);
  };

  return (
    <>
      <div>
        <div className=" mt-3 mb-3 d-flex">
          <div className=" d-flex paymentbycus">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-labele filterbypayment "
            >
              {" "}
              Customer Name:
            </label>
            <div className="vessel-select">
              <select
                className="form-select vesselbox statusscustomerbypayment"
                name="customers"
                value={selectedCustomerid || ""}
                onChange={handleChange}
              >
                {customerList.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customerName} {""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="cusbydate">
            <label
              htmlFor="inputPassword"
              className=" form-labele col-form-label text-nowrap"
            >
              Payment Date:
            </label>
            <div className="">
              <div className="fw-bolder paymentpdafontweight"></div>
            </div>
          </div>
          <div className="">
            {/*<i className="bi bi-funnel-fill filtericon"></i>*/}
            <input
              type="date"
              name="paymentDate"
              className="datebycustomerpayment form-control vesselbox statusspayment"
              placeholder="Select Date"
              onChange={handleTimeperiod}
              value={inputFilterDate}
            ></input>
          </div>
          <div className="voucherbypayment">
            <i className="bi bi-funnel-fill filtericon"></i>
            <select
              name="pdaId"
              className="form-select form-select-sm filteremployee"
              aria-label="Small select example"
              onChange={handleTimeperiod}
            >
              <option value="">Choose Quotation </option>
              {QuotationList.map((invoice) => (
                <option key={invoice._id} value={invoice._id}>
                  {invoice.pdaNumber}
                  {invoice.invoiceId ? ` - ${invoice.invoiceId}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className=" d-flex filterpayment">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-labele filterbycustpayment "
            >
              {" "}
              Filter By:
            </label>
            <div className="vessel-select">
              <select
                name="status"
                className="form-select vesselbox statussbycustomer"
                onChange={(e) => setPeriod(e.target.value)}
                value={period}
              >
                <option value="">Select Period</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>

          <div className="nonvalue">
            {period === "month" && (
              <select
                name="month"
                className="form-select jobporrte mmonthcus monthcustomerpay"
                aria-label="Select Month"
                onChange={handleTimeperiod}
              >
                <option value="">Select Month</option>
                {months.map((month, index) => (
                  <option key={index} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            )}

            {period === "year" && (
              <select
                name="year"
                className="form-select jobporrt mmonthcus monthcustomerpay"
                aria-label="Select Year"
                onChange={handleTimeperiod}
              >
                <option value="">Select Year</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="d-flex align-items-center paymentcustomermargin">
            <input
              type="checkbox"
              id="isDirectCustomerPayment"
              checked={isDirectCustomerPayment}
              onChange={(e) => {
                setIsDirectPayment(e.target.checked);
                // Refetch payments with updated isDirectCustomerPayment
                let payload = {
                  customerId: selectedCustomerid,
                  paymentDate: inputFilterDate,
                  pdaId: inputpdaId,
                  filter: FilterName,
                  [FilterName]: FilterValue,
                  isDirectPayment: e.target.checked ? true : "",
                };
                fetchCustomerpayments(payload);
              }}
              style={{ marginRight: "6px" }}
            />
            <label
              htmlFor="isDirectCustomerPayment"
              className="form-labele mb-0"
            >
              Direct Payment
            </label>
          </div>
        </div>

        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>

        <Addpayment
          open={open}
          onClose={handleClose}
          customerId={selectedCustomerid}
          vendorId=""
          ListCustomer={handleListCustomer}
          Balance={balanceAmount}
          editMode={editMode}
          paymentvalues={selectedRow}
          errors={errors}
          setErrors={setErrors}
          buttonType={ButtonId}
          voucherNumber={voucherNumber}
        />

        <div className="paymeamount">
          <div className=" d-flex">
            <div className="totalinvociecustomer">
              {" "}
              Total Invoice Amount(OMR):
            </div>{" "}
            <div className="amountpayment"> {totalInvoiceAmount} </div>
          </div>
          <div className=" d-flex">
            <div className="totalinvociecustomer"> Paid Amount(OMR):</div>{" "}
            <div className="amountpayment"> {paidAmount} </div>
          </div>
          <div className=" d-flex">
            <div className="totalinvociecustomer"> Discount Amount:</div>{" "}
            <div className="amountpayment"> {discountAmount} </div>
          </div>
          <div className=" d-flex">
            <div className="totalinvociecustomer"> Balance Amount(OMR):</div>{" "}
            <div className="amountpayment"> {balanceAmount} </div>
          </div>

          <div className="paymentbtn">
            <button
              onClick={() => {
                OpenDialog("addreceipt");
              }}
              className="btn btn-info infobtn addrecep"
              id="addreceipt"
            >
              Add Receipt
            </button>
            <button
              onClick={() => {
                OpenDialog("addpayment");
              }}
              className="btn btn-info infobtn"
              id="addpayment"
            >
              Add Payment
            </button>
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <DataGrid
            rows={customerpayment.map((item) => {
              // Check if item.pdaIds is an array and contains objects
              /*const pdaIds = Array.isArray(item.pdaIds) ? item.pdaIds.filter(pda => pda.invoiceId).map(pda => pda.invoiceId).join(', '): '';
        const pdaNumbers = Array.isArray(item.pdaIds) ? item.pdaIds.filter(pda => pda.pdaNumber).map(pda => pda.pdaNumber).join(', ') : ''; 
        const jobIds = Array.isArray(item.pdaIds) ? item.pdaIds.filter(pda => pda.jobId).map(pda => pda.jobId).join(', ') : '';*/
              const dateOnly = item.paymentDate.split("T")[0];
              const [year, month, day] = dateOnly.split("-");
              const formattedDate = `${day}-${month}-${year}`;
              const currencyVal = item.currency.toUpperCase();
              const modeofpay =
                item.modeofPayment.charAt(0).toUpperCase() +
                item.modeofPayment.slice(1);
              let receivedamt = "";
              let paidamount = "";
              if (item.paymentType === "received") receivedamt = item.amount;
              else if (item.paymentType === "refundexcess")
                paidamount = item.amount;
              return {
                ...item,
                id: item._id,
                jobId: item.pdaIds.jobId || "N/A",
                quotation: item.pdaIds.pdaNumber || "N/A",
                invoice: item.pdaIds.invoiceId || "N/A",
                recvamount: receivedamt,
                amount: paidamount,
                currency: currencyVal || "N/A",
                modeofPayment: modeofpay || "N/A",
                dateofpay: formattedDate || "N/A",
                banks:
                  item.bank && item.bank.bankName ? item.bank.bankName : "N/A",
              };
            })}
            columns={columns}
            getRowId={(row) => row._id} // Use id field for unique row identification
            disableSelectionOnClick // Disables checkbox selection to prevent empty column
            disableColumnMenu // Removes column menu
            components={{
              NoRowsOverlay,
            }}
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
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#eee", // Gray background for the footer
              },
            }}
            pagination // Enables pagination
            pageSizeOptions={[5, 10, 20, 50, 100]} // Sets available page size options
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10, // Default page size
                  page: 0, // Default page index
                },
              },
            }}
          />
        </div>

        {customerpayment?.length === 0 && (
          <div className="no-data">
            <p>No Data Found</p>
          </div>
        )}
      </div>

      <ViewCustomerVoucher
        open={viewopen}
        onClose={handleCloseView}
        getvoucher={selectedRow}
      />

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default CustomerPayments;
