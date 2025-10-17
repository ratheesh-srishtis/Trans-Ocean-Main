import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getVouchers,
  deleteVoucher,
  getAllFinanceEmployees,
} from "../../services/apiPayment";
import { getAllVendors } from "../../services/apiSettings";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Addvoucher from "./AddVoucher";
import ViewVoucher from "./ViewVoucher";
import "../../css/payment.css";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
const VendorVouchers = () => {
  const Group = require("../../assets/images/payments.png");
  const [selectedRow, setSelectedRow] = useState(null);
  const [vendorList, setVendorList] = useState([]);
  const [selectedVendorid, setSelectedVendorid] = useState("");
  const [open, setOpen] = useState(false);
  const [viewopen, setviewOpen] = useState(false);
  const [voucherlist, setVoucherList] = useState([]);
  const [period, setPeriod] = useState("");
  const [inputFilterDate, setFilterDate] = useState("");
  const [FilterName, setFilterName] = useState("");
  const [FilterValue, setFilterValue] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const { vendorId } = location.state || {};
  const [EmployeeList, setEmployeeList] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  const fetchVendorList = async () => {
    try {
      const listvendors = await getAllVendors();
      setVendorList(listvendors?.vendors || []);
    } catch (error) {
      console.log("Cannot fecth vendor", error);
    }
  };

  useEffect(() => {
    fetchVendorList();

    if (vendorId) setSelectedVendorid(vendorId);
    let payload = { vendorId: vendorId, employeeId: employeeId };
    fetchVouchers(payload);
  }, [vendorId, employeeId]);
  /*useEffect(() => { 
    if (selectedVendorid) { 
    let payload = {vendorId:selectedVendorid};
    fetchVouchers(payload); 
    } 
   }, [selectedVendorid]);*/

  const fetchVouchers = async (payload) => {
    try {
      const Listvouchers = await getVouchers(payload);
      setVoucherList(Listvouchers?.vouchers || []);
    } catch (error) {
      console.log("Error in Api", error);
    }
  };

  const handleListVouchers = (payload) => {
    setEditMode(false);
    fetchVouchers(payload);
    setOpen(false);
  };

  const handleChange = (e) => {
    setSelectedVendorid(e.target.value);
    let paylaod = {
      vendorId: e.target.value,
      paymentDate: inputFilterDate,
      filter: FilterName,
      [FilterName]: FilterValue,
      employeeId: employeeId,
    };
    fetchVouchers(paylaod);
  };
  const handleTimeperiod = async (e) => {
    let payload = "";
    const SelectBxname = e.target.name;
    if (SelectBxname === "search-voucher-date") {
      setPeriod("");
      setFilterDate(e.target.value);
      payload = { vendorId: selectedVendorid, paymentDate: e.target.value };
    } else {
      setFilterDate("");
      setFilterName(SelectBxname);
      setFilterValue(e.target.value);
      payload = {
        vendorId: selectedVendorid,
        paymentDate: "",
        filter: SelectBxname,
        [SelectBxname]: e.target.value,
        employeeId: employeeId,
      };
    }

    fetchVouchers(payload);
  };
  const handleEmployeeChange = (e) => {
    setEmployeeId(e.target.value);
    let payload = {
      vendorId: selectedVendorid,
      paymentDate: inputFilterDate,
      filter: FilterName,
      [FilterName]: FilterValue,
      employeeId: e.target.value,
    };
    fetchVouchers(payload);
  };
  const OpenDialog = () => {
    handClickOpen();
  };
  const handClickOpen = () => {
    setOpen(true);
  };
  const resetErrors = () => {
    setErrors({});
  };
  const handleClose = () => {
    setOpen(false);
    resetErrors();
    setSelectedRow(null);
    setEditMode(false);
  };
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
  let payloadParams = "";
  if (FilterName === "")
    payloadParams = {
      vendorId: selectedVendorid,
      paymentDate: inputFilterDate,
      filter: "",
      employeeId: employeeId,
    };
  else
    payloadParams = {
      vendorId: selectedVendorid,
      paymentDate: inputFilterDate,
      filter: FilterName,
      [FilterName]: FilterValue,
      employeeId: employeeId,
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
              pettyId: item?._id,
            };
            const response = await deleteVoucher(payload);
            setMessage(response.message);
            setOpenPopUp(true);
            fetchVouchers(payloadParams);
          } catch (error) {
            Swal.fire("Error deleting payments");
            fetchVouchers(payloadParams);
          }
        }
      }
    });
  };
  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditMode(true);
    OpenDialog();
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
    // { field: "quotation", headerName: "Quotation Number", flex: 3,minWidth:150 },
    { field: "voucher", headerName: "Petty Number", flex: 2, minWidth: 130 },
    { field: "throughs", headerName: "Through", flex: 3 },
    { field: "particulars", headerName: "Particulars", flex: 3 },
    { field: "accountof", headerName: "On Account of", flex: 3 },
    { field: "vendorName", headerName: "Vendor Name", flex: 3 },
    { field: "dateofPay", headerName: "Payment Date", flex: 2, minWidth: 130 },
    { field: "amount", headerName: "Amount", flex: 2 },
    { field: "remark", headerName: "Remark", flex: 2 },
    // {
    //   field: "modeofPayment",
    //   headerName: "Mode of Payment",
    //   flex: 3,
    //   minWidth: 100,
    // },
    // { field: "banks", headerName: "Bank", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      flex: 5,
      renderCell: (params) => {
        console.log("params", params);
        const hasValidVendorId =
          params.row.vendorId &&
          params.row.vendorId !== null &&
          params.row.vendorId !== undefined &&
          params.row.vendorId !== "";

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              className="btn btna submitpaymentbutton btnfsize"
              onClick={() => handleView(params.row)}
              style={{ marginRight: "8px" }} // Add some space between buttons
            >
              View
            </button>
            {!hasValidVendorId && (
              <>
                <IconButton
                  color="primary"
                  onClick={() => handleEdit(params.row)}
                >
                  <EditIcon sx={{ fontSize: "19px" }} />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => handleDelete(params.row)}
                >
                  <DeleteIcon sx={{ fontSize: "19px" }} />
                </IconButton>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const fetchFinaceEmployees = async () => {
    try {
      const listemployees = await getAllFinanceEmployees();
      setEmployeeList(listemployees?.employees || []);
    } catch (error) {
      console.log("Employee list Error", error);
    }
  };

  useEffect(() => {
    fetchFinaceEmployees();
  }, []);

  return (
    <>
      <div>
        <div className=" mt-3 d-flex">
          <div className=" d-flex paymentbycus">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-label filterbypayment "
            >
              {" "}
              Vendor:
            </label>
            <div className="vessel-select">
              <select
                className="form-select vesselbox statusscustomer"
                name="vendors"
                value={selectedVendorid || ""}
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
          </div>
          <div className=" d-flex paymentbycus">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-label filterbypayment "
            >
              {" "}
              Employee:
            </label>
            <div className="vessel-select">
              <select
                name="through"
                className="form-select vesselbox"
                aria-label="Default select example"
                onChange={handleEmployeeChange}
                value={employeeId}
              >
                <option value="">Choose Employee</option>
                {EmployeeList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {`${emp.name}_Petty`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="cusbydate">
            <label
              htmlFor="inputPassword"
              className=" col-form-label text-nowrap paymedatepaymentpage"
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
              name="search-voucher-date"
              className="datebycustomerpayment form-control vesselbox statusspayment"
              placeholder="Select Date"
              onChange={handleTimeperiod}
              value={inputFilterDate}
            ></input>
          </div>
          <div className=" d-flex filterpayment">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-label filterbypayment "
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

          <div className=" d-flex filterpayment">
            {period === "month" && (
              <select
                name="month"
                className="form-select jobporrt mmonthpayment monthcustomerpay"
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
                className="form-select vesselbox yearlist mmonth monthcustomerpay"
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
        </div>
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>

        <Addvoucher
          open={open}
          onClose={handleClose}
          vendorId={selectedVendorid}
          ListVouchers={handleListVouchers}
          editMode={editMode}
          prevVouchers={selectedRow}
          errors={errors}
          setErrors={setErrors}
        />
        <ViewVoucher
          open={viewopen}
          onClose={handleCloseView}
          getvoucher={selectedRow}
        />

        <div className="voucheramount marginvoucher">
          {/*<div className=" d-flex" >
       <div className="totalinvocie"> Total Invoice Amount:</div> <div className="amountpayment"> ${totalInvoiceAmount} </div>
      </div>
      <div className=" d-flex" >
       <div className="totalinvocie"> Paid Amount:</div> <div className="amountpayment"> ${paidAmount} </div>
      </div>
      <div className=" d-flex" >
       <div className="totalinvocie"> Balance Amount:</div> <div className="amountpayment"> ${balanceAmount} </div>
      </div>
      <div className=" ">
      <button
        type="button"
        className="btn btn-info infobtn"
      >
        Add Voucher
      </button>
    </div>
    <div className=" paymentbtn">
      <button
        type="button"
        className="btn btn-info infobtn"
      >
       View Voucher
      </button>
    </div>*/}
          <div className="">
            <button
              onClick={() => {
                OpenDialog();
              }}
              className="btn btn-info infobtn"
            >
              Add Petty
            </button>
          </div>
        </div>

        <DataGrid
          rows={voucherlist.map((item) => {
            // Check if item.pdaIds is an array and contains objects

            const dateOnly = item.paymentDate
              ? item.paymentDate.split("T")[0]
              : "N/A";
            const [year, month, day] = dateOnly.split("-");
            const formattedDate = `${day}-${month}-${year}`;
            let modeofpay = "";
            if (item.modeofPayment !== undefined)
              modeofpay =
                item.modeofPayment.charAt(0).toUpperCase() +
                item.modeofPayment.slice(1);

            return {
              ...item,
              id: item._id,
              //quotation:item.pdaIds ? item.pdaIds.pdaNumber : "N/A",
              voucher: item.voucherNumber || "N/A",
              throughs:
                item.through && item.through.name ? item.through.name : "N/A",
              particulars: item.voucherParticulers || "N/A",
              accountof: item.voucherAccount || "N/A",
              dateofPay: formattedDate || "N/A",
              amount: item.amount || "N/A",
              vendorId: item.vendorId?._id || "",
              // vendorName: item.vendorId?.vendorName || "N/A",
              remark: item.remark || "N/A",
              // modeofPayment: modeofpay || "N/A",
              // banks:
              //   item.bank && item.bank.bankName ? item.bank.bankName : "N/A",
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
        {voucherlist?.length === 0 && (
          <div className="no-data">
            <p>No Data Found</p>
          </div>
        )}
      </div>

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default VendorVouchers;
