// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/reports/pettycashreport.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getPettyCashReport,
  pettyCashReportPDF,
} from "../../services/apiService";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {
  saveVoucher,
  editVoucher,
  getAllQuotationIds,
  getAllBanks,
  getAllFinanceEmployees,
} from "../../services/apiPayment";
import { get } from "jquery";
import Loader from "../Loader";

const PettyCashReport = () => {
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const Group = require("../../assets/images/reporttttt.png");
  const [eta, setEta] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [reportList, setReportList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [filterType, setFilterType] = useState("month"); // Default to "monthly"
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  ); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  const handleEtaChange = (date) => {
    console.log(date, "datehandleEtaChange");
    if (date) {
      setEta(date);
      console.log(date, "datehandleEtaChange");
      let formatDate = date ? moment(date).format("YYYY-MM-DD ") : null;
      console.log(formatDate, "formatDate");
      setPaymentDate(formatDate);
      setSelectedEmployee("");
      setSelectedMonth("");
      setSelectedYear("");
      setFilterType("");
    }
  };

  const filteredReports = reportList?.filter((item) => {
    const matchedEmployee =
      !selectedEmployee || item.employee[0]?._id === selectedEmployee;

    return matchedEmployee;
  });

  const columns = [
    { field: "employee", headerName: "Employee Name", flex: 1 },
    { field: "totalPetty", headerName: "Total Petty", flex: 1 },
    { field: "usedPetties", headerName: "Used Petties", flex: 1 },
    { field: "balancePetties", headerName: "Balance Petties", flex: 1 },
  ];

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
      <Typography>No Report available for given terms</Typography>
    </Box>
  );

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "employee":
        console.log(value, "value_handleSelectChange");
        setSelectedEmployee(value);

        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log(filteredReports, "filteredReports");
  }, [filteredReports]);

  useEffect(() => {
    getReport();
    getEmployeesList();
  }, []);

  // Array of months
  const months = [
    { name: "January", value: "1" },
    { name: "February", value: "2" },
    { name: "March", value: "3" },
    { name: "April", value: "4" },
    { name: "May", value: "5" },
    { name: "June", value: "6" },
    { name: "July", value: "7" },
    { name: "August", value: "8" },
    { name: "September", value: "9" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];

  // Generate an array of years (e.g., 2000 to 2030)
  const startYear = 2000;
  const endYear = 2030;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value, 10);
    console.log(newYear, "newYear_handleYearChange");
    setSelectedYear(newYear);
  };

  const handleFilterTypeChange = (event) => {
    const newFilterType = event.target.value;
    setFilterType(newFilterType);
  };

  const getReport = async () => {
    let payload = {
      employeeId: selectedEmployee,
      filter: filterType,
      month: selectedMonth,
      year: selectedYear,
      paymentDate: paymentDate,
    };
    console.log(payload, "payload_getReport");
    setIsLoading(true); // Show loader

    try {
      const response = await getPettyCashReport(payload);
      setIsLoading(false); // Hide loader

      setReportList(response?.result);
      console.log("getPettyCashReport", response);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false); // Hide loader
    }
  };

  const getPDF = async () => {
    let payload = {
      employeeId: selectedEmployee,
      filter: filterType,
      month: selectedMonth,
      year: selectedYear,
      paymentDate: paymentDate,
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await pettyCashReportPDF(payload);
      console.log("getPettyCashReport", response);

      if (response?.pdfPath) {
        const pdfUrl = `${process.env.REACT_APP_ASSET_URL}${response.pdfPath}`;
        // Fetch the PDF as a Blob
        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        // Create a hidden anchor tag to trigger the download
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.setAttribute("download", "Petty Cash Report.pdf"); // Set the file name
        document.body.appendChild(link);
        link.click();
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfBlobUrl);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  // Create Excel for filteredReports
  // const createExcel = () => {
  //   if (!filteredReports || filteredReports.length === 0) return;
  //   // Prepare data for Excel
  //   const excelData = filteredReports.map((item) => {
  //     const usedPetties = item.employeepetties.reduce(
  //       (sum, petty) => sum + (petty.amount || 0),
  //       0
  //     );
  //     const balancePetties = usedPetties - item.totalPetty;
  //     return {
  //       "Employee Name": item?.employee?.[0]?.name || "N/A",
  //       "Total Petty": usedPetties ?? "N/A",
  //       "Used Petties": item.totalPetty,
  //       "Balance Petties": balancePetties,
  //     };
  //   });
  //   // Add totals row
  //   /*
  //   const totalPettySum = excelData.reduce(
  //     (sum, row) => sum + (parseFloat(row["Total Petty"]) || 0),
  //     0
  //   );
  //   const usedPettiesSum = excelData.reduce(
  //     (sum, row) => sum + (parseFloat(row["Used Petties"]) || 0),
  //     0
  //   );
  //   const balancePettiesSum = excelData.reduce(
  //     (sum, row) => sum + (parseFloat(row["Balance Petties"]) || 0),
  //     0
  //   );
  //   excelData.push({
  //     "Employee Name": "Total",
  //     "Total Petty": totalPettySum,
  //     "Used Petties": usedPettiesSum,
  //     "Balance Petties": balancePettiesSum,
  //   });
  //   */
  //   // Create worksheet and workbook
  //   const XLSX = require("xlsx");
  //   const worksheet = XLSX.utils.json_to_sheet(excelData);
  //   worksheet["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "PettyCashReport");
  //   XLSX.writeFile(workbook, "Petty Cash Report.xlsx");
  // };
  const createExcel = async () => {
    if (!filteredReports || filteredReports.length === 0) return;

    // Prepare rows
    const rowsData = filteredReports.map((item) => {
      return {
        "Employee Name": item?.employee?.name || "N/A",
        "Total Petty": Number(item.totalPetty).toFixed(3),
        "Used Petties": Number(item.usedPetty).toFixed(3),
        "Balance Petties": Number(item.balancePetty).toFixed(3),
      };
    });

    const headers = Object.keys(rowsData[0] || {});
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Petty Cash Report", {
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
    rowsData.forEach((row) => {
      const r = worksheet.addRow(headers.map((h) => row[h]));
      r.eachCell((cell) => {
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
      });
    });

    // Auto-size columns (clamped) and ensure first column has enough width
    const minWidth = 15;
    const maxWidth = 60;
    headers.forEach((h, i) => {
      let maxLen = (h || "").toString().length;
      rowsData.forEach((row) => {
        const val = row[h];
        const len = val == null ? 0 : val.toString().length;
        if (len > maxLen) maxLen = len;
      });
      const width = Math.max(minWidth, Math.min(maxWidth, maxLen + 2));
      worksheet.getColumn(i + 1).width = width;
    });
    // Nudge first column wider for names
    worksheet.getColumn(1).width = Math.max(
      worksheet.getColumn(1).width || 0,
      24
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Petty Cash Report.xlsx");
  };
  const getEmployeesList = async () => {
    try {
      const listemployees = await getAllFinanceEmployees();
      setEmployees(listemployees?.employees || []);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(paymentDate, "paymentDate");
    console.log(selectedEmployee, "selectedEmployee");
    console.log(selectedMonth, "selectedMonth");
    console.log(selectedYear, "selectedYear");
    getReport();
  }, [selectedEmployee, selectedMonth, selectedYear, paymentDate, filterType]);

  return (
    <>
      <div>
        <div className="container-fluid">
          <div className=" d-flex  flex-md-row flex-wrap align-items-start gap-3 mb-3 mt-3">
            <div className="">
              <div className=" d-flex">
                <label
                  htmlFor="inputPassword"
                  className=" form-label costcenterinput col-form-label text-nowrap"
                >
                  Payment Date:
                </label>
                <div className="datepickerpetty">
                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={eta ? new Date(eta) : null} // Inline date conversion for prefilled value
                    onChange={handleEtaChange}
                    className="form-control date-input  bansummary-datepicker"
                    id="eta-picker"
                    placeholderText="dd-mm-yyyy"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
            <div className="d-flex align-items-end gap-2">
              <div className="filtermainpetty d-flex align-items-center">
                <i className="bi bi-funnel-fill filtericon"></i>
                <select
                  className="form-select form-select-sm filtercostcenter"
                  aria-label="Filter select"
                  value={filterType} // Bind selected value
                  onChange={handleFilterTypeChange} // Update state on change
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              {filterType === "month" && (
                <div className="">
                  <div className="jobfilter">
                    <div></div>
                    <div>
                      <select
                        className="form-select monthfontpeety"
                        aria-label="Select Month"
                        value={selectedMonth}
                        onChange={handleMonthChange} // Update state on change
                      >
                        {months.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {filterType === "year" && (
                <>
                  <div className="">
                    <div className="">
                      <div></div>
                      <div className="">
                        <select
                          className="form-select monthfontpeety"
                          value={selectedYear} // Bind the selected value
                          onChange={handleYearChange} // Update state on change
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className=" d-flex">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label ffbyemployepetty"
              >
                Employee:
              </label>
              <div className="vessel-select">
                <select
                  className="form-select ffemployepetty"
                  aria-label="Small select example"
                  name="employee"
                  onChange={handleSelectChange}
                  value={selectedEmployee}
                >
                  <option value="">Filter by employee</option>
                  {employees?.map((employee) => (
                    <option key={employee?._id} value={employee?._id}>
                      {employee?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <button
                className="btn btn-info filbtnjob"
                onClick={() => {
                  getPDF();
                }}
              >
                Download PDF
              </button>
              <button
                className="btn btn-info filbtnjob"
                onClick={() => {
                  createExcel();
                }}
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
        <div className="charge mb-3">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
      </div>

      <DataGrid
        rows={
          filteredReports?.length > 0
            ? filteredReports.map((item, index) => {
                return {
                  id: index,
                  employee: item?.employee?.name || "N/A",
                  totalPetty: Number(item.totalPetty).toFixed(3),
                  usedPetties: Number(item.usedPetty).toFixed(3),
                  balancePetties: Number(item.balancePetty).toFixed(3),
                };
              })
            : []
        }
        columns={columns.map((col) =>
          window.innerWidth <= 600
            ? {
                ...col,
                flex: undefined,
                minWidth: 180,
                width: 180,
              }
            : col
        )}
        autoHeight
        getRowId={(row) => row.id} // Use id field for unique row identification
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

      {filteredReports?.length == 0 && (
        <>
          <div className="no-data">
            <p>No Reports available for given terms</p>
          </div>
        </>
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default PettyCashReport;
