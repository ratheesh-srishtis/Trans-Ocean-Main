// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/reports/pettycashreport.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getPettyCashReport,
  pettyCashReportPDF,
  pettyCashReportEmployee,
  pettyCashReportEmployeePDF,
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
import PopUp from "../PopUp";
const PettyCashReport = () => {
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const Group = require("../../assets/images/reporttttt.png");
  const [paymentDate, setPaymentDate] = useState("");
  const [reportList, setReportList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [filterType, setFilterType] = useState("month"); // Default to "monthly"
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  ); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  const filteredReports = reportList?.filter((item) => {
    const matchedEmployee =
      !selectedEmployee || item.employee?._id === selectedEmployee;
    return matchedEmployee;
  });
  console.log(filteredReports, "filteredReports_main");

  const columns = [
    { field: "employee", headerName: "Employee Name", flex: 1 },
    { field: "totalPetty", headerName: "Total Petty", flex: 1 },
    { field: "usedPetties", headerName: "Used Petties", flex: 1 },
    { field: "balancePetties", headerName: "Balance Petties", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <>
          <button
            className="btn btn-sm btn-info text-white row-download-icons excel-individual-button"
            onClick={() => downloadRowExcel(params.row)}
            title="Download Excel"
          >
            <i class="bi bi-file-earmark-spreadsheet-fill excel-individual-icon "></i>
          </button>
          <button
            className="btn btn-sm btn-info text-white row-download-icons pdf-individual-button"
            onClick={() => getRowPDF(params.row)}
            title="Download PDF"
          >
            <i class="bi bi-file-earmark-pdf pdf-individual-icon"></i>
          </button>
        </>
      ),
    },
  ];

  const getRowPDF = async (rowData) => {
    console.log(rowData, "rowData_getRowPDF");

    let payload = {
      employeeId: rowData?.employeeId,
      employeeName: rowData?.employee,
      filter: filterType,
      paymentDateFrom: formattedStart,
      paymentDateTo: formattedEnd,
      ...(filterType === "year" && { year: selectedYear }),
      ...(filterType === "month" && { month: selectedMonth }),
    };

    console.log(payload, "payload_getReport");
    setIsLoading(true);
    try {
      const response = await pettyCashReportEmployeePDF(payload);
      console.log("pettyCashReportEmployeePDF", response);
      setIsLoading(false);
      if (response?.pdfPath) {
        const pdfUrl = `${process.env.REACT_APP_ASSET_URL}${response.pdfPath}`;
        // Fetch the PDF as a Blob
        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        // Create a hidden anchor tag to trigger the download
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.setAttribute("download", "Petty Cash Detailed Report.pdf"); // Set the file name
        document.body.appendChild(link);
        link.click();
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfBlobUrl);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to fetch quotations:", error);
    }
  };

  const downloadRowExcel = async (rowData) => {
    console.log(rowData, "rowData_downloadRowExcel");

    let payload = {
      employeeId: rowData?.employeeId,
      filter: filterType,
      paymentDate: paymentDate,
      ...(filterType === "year" && { year: selectedYear }),
      ...(filterType === "month" && { month: selectedMonth }),
    };
    console.log(payload, "payload_downloadRowExcel");
    setIsLoading(true);

    try {
      const response = await pettyCashReportEmployee(payload);
      console.log("pettyCashReportEmployee", response?.pettyData);

      // Check if response has data
      if (!response?.pettyData || response.pettyData.length === 0) {
        setMessage("No data available to download excel");
        setOpenPopUp(true);
        setIsLoading(false);
        return;
      }

      // Prepare Excel data
      const excelData = response.pettyData.map((item) => ({
        "Employee Name": item.through?.name || "-",
        Particulars: item.voucherParticulers || "-",
        "On Account Of": item.voucherAccount || "-",
        "Vendor Name": item.vendorId?.vendorName || "-",
        Amount: Number(item.amount || 0).toFixed(3),
        "Payment Date": item.paymentDate
          ? `${new Date(item.paymentDate).toLocaleDateString(
              "en-GB"
            )} ${new Date(item.paymentDate).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "-",
      }));

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Petty Cash Report", {
        properties: { defaultRowHeight: 18 },
        pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      });

      const headers = Object.keys(excelData[0] || {});

      // Add header row
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

      // Add data rows with auto row height
      excelData.forEach((row) => {
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

        // Calculate row height based on content
        let maxLines = 1;
        headers.forEach((h, colIndex) => {
          const cellValue = row[h];
          if (cellValue != null) {
            const columnWidth = worksheet.getColumn(colIndex + 1).width || 15;
            const textLength = cellValue.toString().length;
            const estimatedLines = Math.ceil(textLength / columnWidth);
            if (estimatedLines > maxLines) {
              maxLines = estimatedLines;
            }
          }
        });

        // Set row height (18 is default, multiply by number of lines needed)
        r.height = Math.max(18, maxLines * 15);
      });

      // Auto-size columns
      headers.forEach((h, i) => {
        let maxLen = h.length;
        excelData.forEach((row) => {
          const val = row[h];
          if (val != null) {
            const len = val.toString().length;
            if (len > maxLen) maxLen = len;
          }
        });
        // Set larger minimum width for "On Account Of" and "Particulars" columns
        const minWidth = h === "On Account Of" || h === "Particulars" ? 30 : 15;
        worksheet.getColumn(i + 1).width = Math.max(
          minWidth,
          Math.min(maxLen + 5, 60)
        );
      });

      // Download Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = "Petty Cash Detailed Report.xlsx";
      saveAs(blob, fileName);

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to download petty cash report:", error);
      setIsLoading(false);
    }
  };

  // ...existing code...

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
    setPaymentDate("");
    setFormattedStart("");
    setFormattedEnd("");
    setDateRange([null, null]);
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value, 10);
    console.log(newYear, "newYear_handleYearChange");
    setSelectedYear(newYear);
    setPaymentDate("");
    setFormattedStart("");
    setFormattedEnd("");
    setDateRange([null, null]);
  };

  const handleFilterTypeChange = (event) => {
    const newFilterType = event.target.value;
    if (newFilterType == "year") {
      setSelectedYear(new Date().getFullYear());
    } else if (newFilterType == "month") {
      setSelectedMonth((new Date().getMonth() + 1).toString());
    }
    setFilterType(newFilterType);
    setPaymentDate("");
    setFormattedStart("");
    setDateRange([null, null]);
  };

  const getReport = async () => {
    let payload = {
      employeeId: selectedEmployee,
      filter: filterType,
      month: selectedMonth,
      year: selectedYear,
      paymentDateFrom: formattedStart,
      paymentDateTo: formattedEnd,
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

  useEffect(() => {
    console.log(reportList, "reportList");
  }, [reportList]);

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

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [formattedStart, setFormattedStart] = useState("");
  const [formattedEnd, setFormattedEnd] = useState("");

  // Format to YYYY-MM-DD (in local time)
  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    setFormattedStart(formatDate(startDate));
    setFormattedEnd(formatDate(endDate));

    console.log("Formatted Start:", formatDate(startDate));
    console.log("Formatted End:", formatDate(endDate));
  }, [startDate, endDate]);

  useEffect(() => {
    console.log(formattedStart, "formattedStart filter_dates");
    console.log(formattedEnd, "formattedEnd filter_dates");
  }, [formattedStart, formattedEnd]);
  return (
    <>
      <div>
        <div className="container-fluid">
          <div className=" d-flex  flex-md-row flex-wrap align-items-start gap-3 mb-3 mt-3">
            <div className="">
              <div className="jobfilter  mb-2 ">
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
                    onChange={(update) => {
                      // update is [from, to]
                      if (update[0] && !update[1]) {
                        setDateRange([update[0], null]);
                      } else if (update[0] && update[1]) {
                        setDateRange(update);
                        // Call API immediately when both dates are picked
                        const payload = {
                          employeeId: selectedEmployee,
                          filter: "",
                          month: "",
                          paymentDateFrom: update[0]
                            ? formatDate(update[0])
                            : "",
                          paymentDateTo: update[1] ? formatDate(update[1]) : "",
                        };
                        console.log(payload, "payload_dateRange_onChange");
                        getPettyCashReport(payload)
                          .then((response) => setReportList(response?.result))
                          .catch((error) => {
                            setReportList([]);
                            console.error("Failed to fetch quotations:", error);
                          });
                      } else {
                        setDateRange([null, null]);
                        // When cleared, call API with empty date filters
                        const payload = {
                          employeeId: selectedEmployee,
                          filter: filterType,
                          month: selectedMonth,
                          year: selectedYear,
                          paymentDateFrom: "",
                          paymentDateTo: "",
                        };
                        getPettyCashReport(payload)
                          .then((response) => setReportList(response?.report))
                          .catch((error) => {
                            setReportList([]);
                            console.error("Failed to fetch quotations:", error);
                          });
                      }
                    }}
                    isClearable={true}
                    placeholderText="Select from and to date"
                    className="custom-date-input datefilterpaym form-control dateffont"
                    calendarClassName="custom-calendar"
                    dateFormat="dd-MM-yyyy"
                    shouldCloseOnSelect={false}
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
                  employeeId: item?.employee?._id || "",
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
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
    </>
  );
};

export default PettyCashReport;
