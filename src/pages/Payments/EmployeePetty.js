// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
import AddEmpPetty from "./AddEmpPetty";
import {
  getEmployeePetty,
  deleteEmployeePetty,
  getAllFinanceEmployees,
} from "../../services/apiPayment";
import "../../css/payment.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Select from "react-select";

const EmployeePetty = () => {
  const Group = require("../../assets/images/payments.png");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedEmppettyid, setEmppettyid] = useState("");
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("");
  const [inputFilterDate, setFilterDate] = useState("");
  const [FilterName, setFilterName] = useState("");
  const [FilterValue, setFilterValue] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [EmployeePetty, setPettyEmployeeList] = useState([]);
  const [pettyNumber, setPettyNumber] = useState("");
  const location = useLocation();
  const [financeempList, SetFinanceEmplist] = useState([]);
  const { financeempId } = location.state || {};
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      height: "30px !important",
      minWidth: "200px !important",
      borderRadius: "0.375rem",
      borderColor: "#dee2e6",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#dee2e6",
      },
      marginTop: "12px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      marginTop: "2px", // Reduced spacing between select and dropdown
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? "#e9ecef"
        : "white",
      color: state.isSelected ? "white" : "black",
      cursor: "pointer",
      fontSize: "13px", // Option font size
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: "13px",
      color: "#000000", // Black color for placeholder
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: "13px",
      color: "#000000",
    }),
    input: (provided) => ({
      ...provided,
      fontSize: "13px",
      color: "#000000",
    }),
  };
  const fetchEmployeePettyList = async () => {
    try {
      //let payload = {sortByName:true};
      const listallEmpPetty = await getAllFinanceEmployees();
      //console.log(listallEmpPetty);
      setPettyEmployeeList(listallEmpPetty?.employees || []);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };
  const fetchFinanceEmployeeList = async (payload) => {
    let financeList = await getEmployeePetty(payload);
    setPettyNumber(financeList?.pettyNumber);
    SetFinanceEmplist(financeList?.petty || []);
  };
  useEffect(() => {
    if (financeempId) {
      let paylaod = { employeeId: financeempId };
      fetchFinanceEmployeeList(paylaod);
      setEmppettyid(financeempId);
    }
    fetchEmployeePettyList();
  }, [financeempId]);
  let payloadParams = "";
  if (FilterName === "")
    payloadParams = {
      employeeId: financeempId,
      paymentDate: inputFilterDate,
      filter: "",
    };
  else
    payloadParams = {
      employeeId: financeempId,
      paymentDate: inputFilterDate,
      filter: FilterName,
      [FilterName]: FilterValue,
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
            const response = await deleteEmployeePetty(payload);
            setMessage(response.message);
            setOpenPopUp(true);
            fetchFinanceEmployeeList(payloadParams);
          } catch (error) {
            Swal.fire("Error deleting payments");
            fetchFinanceEmployeeList(payloadParams);
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
  const handleTimeperiod = async (e) => {
    let payload = "";
    const SelectBxname = e.target.name;
    if (SelectBxname === "search-voucher-date") {
      setPeriod("");
      setFilterDate(e.target.value);
      payload = { employeeId: selectedEmppettyid, paymentDate: e.target.value };
    } else {
      setFilterDate("");
      setFilterName(SelectBxname);
      setFilterValue(e.target.value);
      payload = {
        employeeId: selectedEmppettyid,
        paymentDate: "",
        filter: SelectBxname,
        [SelectBxname]: e.target.value,
      };
    }

    fetchFinanceEmployeeList(payload);
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

  const employeeOptions = EmployeePetty.map((emp) => ({
    value: emp._id,
    label: emp.name,
  }));

  const handleEmployeeSelectChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";

    setEmppettyid(value);

    let paylaod = {
      employeeId: value,
      paymentDate: inputFilterDate,
      filter: FilterName,
      [FilterName]: FilterValue,
    };
    fetchFinanceEmployeeList(paylaod);
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
    setEditMode(false);
    setSelectedRow(null);
  };
  const handleListEmpPetty = (payload) => {
    setEditMode(false);
    fetchFinanceEmployeeList(payload);
    setOpen(false);
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
    { field: "pettyNumber", headerName: "Petty Number", flex: 10 },
    { field: "dateofPay", headerName: "Payment Date", flex: 10 },
    { field: "amount", headerName: "Amount", flex: 10 },
    { field: "modeofPayment", headerName: "Mode of Payment", flex: 10 },
    { field: "banks", headerName: "Bank", flex: 10 },
    { field: "remark", headerName: "Remark", flex: 10 },
    {
      field: "actions",
      headerName: "Action",
      flex: 10,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row)}
          >
            <DeleteIcon sx={{ fontSize: "19px" }} />
          </IconButton>
        </div>
      ),
    },
  ];

  const getPDF = () => {};

  const createExcel = async () => {
    if (!financeempList || financeempList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "No employee petty records available to export",
      });
      return;
    }

    // Prepare data for Excel
    const excelData = financeempList.map((item) => {
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
        "Petty Number": item?.pettyNumber || "N/A",
        "Payment Date": formattedDate || "N/A",
        Amount: item.amount || "N/A",
        "Mode of Payment": modeofpay || "N/A",
        Bank: item.bank && item.bank.bankName ? item.bank.bankName : "N/A",
        Remark: item.remark || "N/A",
      };
    });

    const headers = Object.keys(excelData[0]);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employee Petty", {
      properties: { defaultRowHeight: 18 },
      pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    // Header
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEFEFEF" },
      };
    });

    // Data rows
    excelData.forEach((data) => {
      const dataRow = worksheet.addRow(headers.map((h) => data[h]));

      // Calculate height for Remark column content
      const remarkContent = data["Remark"] || "";
      const remarkLength = remarkContent.toString().length;

      // Estimate lines needed for Remark column (50 characters per line)
      const estimatedLines = Math.max(1, Math.ceil(remarkLength / 50));

      // Set row height based on content (minimum 18, add 18 points per additional line)
      const calculatedHeight = Math.max(18, 18 * estimatedLines);
      dataRow.height = Math.min(calculatedHeight, 200); // Cap at 200 points

      dataRow.eachCell((cell) => {
        cell.alignment = {
          horizontal: "center",
          vertical: "top",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Auto-size columns with special handling for Remark
    const minWidth = 15;
    const maxWidth = 60;
    headers.forEach((h, i) => {
      if (h === "Remark") {
        // Set fixed width for Remark column that needs wrapping
        worksheet.getColumn(i + 1).width = 50;
      } else {
        let maxLen = (h || "").toString().length;
        excelData.forEach((data) => {
          const val = data[h];
          const len = val == null ? 0 : val.toString().length;
          if (len > maxLen) maxLen = len;
        });
        const width = Math.max(minWidth, Math.min(maxWidth, maxLen + 2));
        worksheet.getColumn(i + 1).width = width;
      }
    });

    // Set view options to ensure proper display when opened
    worksheet.views = [
      {
        state: "normal",
        showGridLines: true,
        showRowColHeaders: true,
        rightToLeft: false,
      },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `Employee Petty Payments.xlsx`;

    saveAs(blob, fileName);
  };

  return (
    <>
      <div>
        {
          <div className=" mt-3 d-flex  align-items-center">
            <div className=" d-flex paymentbycus">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label filterbypayment "
              >
                {" "}
                Employee Petty :
              </label>
              <div className="vessel-select">
                {/* <select
                  className="form-select vesselbox statusscustomer  "
                  name="vendors"
                  value={selectedEmppettyid || ""}
                  onChange={handleChange}
                >
                  {EmployeePetty.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} {""}
                    </option>
                  ))}
                </select> */}

                <Select
                  options={employeeOptions}
                  onChange={handleEmployeeSelectChange}
                  value={employeeOptions.find(
                    (opt) => opt.value === selectedEmppettyid
                  )}
                  placeholder="Search Employee Name"
                  isClearable
                  isSearchable
                  styles={customSelectStyles}
                  className="paymentcustomer"
                  classNamePrefix="react-select"
                />
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
                  className="form-select vesselbox yearlist mmonthpayment monthcustomerpay"
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
        }
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>

        {
          <AddEmpPetty
            open={open}
            onClose={handleClose}
            employeeId={selectedEmppettyid}
            ListEmpPetty={handleListEmpPetty}
            pettyNumber={pettyNumber}
            editMode={editMode}
            prevEmpPetty={selectedRow}
            errors={errors}
            setErrors={setErrors}
          />
        }

        <div className="voucheramount marginvoucher">
          <div className="d-flex">
            <button
              onClick={() => {
                OpenDialog();
              }}
              className="btn btn-info infobtn"
            >
              Add Employee Petty
            </button>

            {/* <button
              className="btn btn-info filbtnjob"
              onClick={() => {
                getPDF();
              }}
            >
              Download PDF
            </button>
            <button
              className="btn btn-info filbtnjob ms-2"
              onClick={createExcel}
            >
              Download Excel
            </button> */}
          </div>
        </div>

        <DataGrid
          rows={financeempList.map((item) => {
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
              pettyNumber: item?.pettyNumber || "N/A",
              dateofPay: formattedDate || "N/A",
              amount: item.amount || "N/A",
              modeofPayment: modeofpay || "N/A",
              banks:
                item.bank && item.bank.bankName ? item.bank.bankName : "N/A",
              remark: item.remark || "N/A",
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
        {financeempList?.length === 0 && (
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

export default EmployeePetty;
