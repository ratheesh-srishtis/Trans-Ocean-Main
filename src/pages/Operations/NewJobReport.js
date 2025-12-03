// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import Multiselect from "multiselect-react-dropdown";
import { getJobReport } from "../../services/apiService";
import { IconButton, TextField } from "@mui/material";
import { Box, Typography } from "@mui/material";
import Swal from "sweetalert2";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { deleteQuotation } from "../../services/apiService";
import Loader from "../Loader";
import PopUp from "../PopUp";
import { getAllJobs } from "../../services/apiService";
import { jobReportPDF } from "../../services/apiService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const NewJobReport = ({ ports, loginResponse }) => {
  const [hydrated, setHydrated] = useState(false);
  const Group = require("../../assets/images/reporttttt.png");
  const navigate = useNavigate();
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  // Filter states
  const [filterType, setFilterType] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [quotationsList, setQuotationsList] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [reportTableList, setReportTableList] = useState(null);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reportList, setReportList] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [statusList, setStatusList] = useState([
    "Customer Approved",
    "Pending from operations",
    "Operations Completed",
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusText = (status) => {
    switch (status) {
      case 5:
        return "Customer Approved";
      case 6:
        return "Pending from operations";
      case 7:
        return "Operations Completed";
      default:
        return "Unknown Status";
    }
  };

  // Month and year options
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
  const years = Array.from({ length: 31 }, (_, i) => 2000 + i);

  // API call stub
  const fetchJobReport = async (payload) => {
    console.log(payload, "payload_getReport");
    setIsLoading(true);
    // TODO: Replace with actual API call
    const response = await getJobReport(payload);
    setIsLoading(false);
    setReportList(response);
    setSelectedJobs(response?.jobs);
    setReportTableList(response?.pda);
  };

  // Restore filters from sessionStorage if present (on mount)
  useEffect(() => {
    const stored = sessionStorage.getItem("jobReportFilters");
    if (stored) {
      const {
        filterType: sFilterType,
        selectedMonth: sSelectedMonth,
        selectedYear: sSelectedYear,
        selectedIds: sSelectedIds,
        selectedPort: sSelectedPort,
        selectedStatus: sSelectedStatus,
        searchTerm: sSearchTerm,
      } = JSON.parse(stored);
      // Log retained values
      console.log("Retained filter values:", {
        filterType: sFilterType,
        selectedMonth: sSelectedMonth,
        selectedYear: sSelectedYear,
        selectedIds: sSelectedIds,
        selectedPort: sSelectedPort,
        selectedStatus: sSelectedStatus,
        searchTerm: sSearchTerm,
      });
      setFilterType(sFilterType ?? "month");
      setSelectedMonth(
        sSelectedMonth ?? (new Date().getMonth() + 1).toString()
      );
      setSelectedYear(sSelectedYear ?? new Date().getFullYear());
      setSelectedIds(sSelectedIds ?? []);
      setSelectedPort(sSelectedPort ?? "");
      setSelectedStatus(sSelectedStatus ?? "");
      setSearchTerm(sSearchTerm ?? "");
      sessionStorage.removeItem("jobReportFilters");
    }
    setHydrated(true);
  }, []);

  // Fetch data when filters change (except on initial mount)
  useEffect(() => {
    if (!hydrated) return;
    const payload = {
      filter: filterType,
      month: selectedMonth,
      year: String(selectedYear),
      jobs: selectedIds,
      assignedEmployee: (() => {
        // First check: if roleType is not "operations", return ""
        if (
          loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
          "operations"
        ) {
          return "";
        }

        // If roleType is "operations", check designationType
        const designationType =
          loginResponse?.data?.userRole?.role?.designationType?.toLowerCase();

        // If designationType is "operationsmanager" or "operationshead", return ""
        if (["operationsmanager", "operationshead"].includes(designationType)) {
          return "";
        }

        // If designationType is empty (""), return the user ID
        // Note: If you meant roleType instead of _id, you can change this line
        if (!designationType || designationType === "") {
          return loginResponse?.data?._id;
        }

        // Default fallback
        return "";
      })(),
    };
    fetchJobReport(payload);
  }, [hydrated, filterType, selectedMonth, selectedYear, selectedIds]);

  const customStyles = {
    multiselectContainer: {},
    option: {
      fontSize: "0.7rem",
      padding: "5px 10px",
      cursor: "pointer",
    },
    optionContainer: {},
  };
  const hoverStyles = {
    backgroundColor: "#eee !important",
  };

  const handleSelect = (selectedList) => {
    const ids = selectedList.map((item) => item._id); // Extract the selected _id values
    setSelectedIds(ids);
    console.log("Selected IDs:", ids); // Log the selected IDs
  };

  const handleRemove = (selectedList) => {
    const ids = selectedList.map((item) => item._id); // Extract the selected _id values
    setSelectedIds(ids);
    console.log("Updated Selected IDs:", ids); // Log the updated IDs
  };

  // Filter button handler
  const filterbyJobs = () => {
    const payload = {
      filter: filterType,
      month: selectedMonth,
      year: String(selectedYear),
      jobs: selectedIds,
      assignedEmployee: (() => {
        // First check: if roleType is not "operations", return ""
        if (
          loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
          "operations"
        ) {
          return "";
        }

        // If roleType is "operations", check designationType
        const designationType =
          loginResponse?.data?.userRole?.role?.designationType?.toLowerCase();

        // If designationType is "operationsmanager" or "operationshead", return ""
        if (["operationsmanager", "operationshead"].includes(designationType)) {
          return "";
        }

        // If designationType is empty (""), return the user ID
        // Note: If you meant roleType instead of _id, you can change this line
        if (!designationType || designationType === "") {
          return loginResponse?.data?._id;
        }

        // Default fallback
        return "";
      })(),
    };
    fetchJobReport(payload);
  };

  const filteredQuotations = reportTableList?.filter((item) => {
    const matchesSearchTerm =
      !searchTerm ||
      item.pdaNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vesselId?.vesselName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.portId?.portName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cargoId?.cargoName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.preparedUserId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getStatusText(item.pdaStatus)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      !selectedStatus ||
      getStatusText(item.pdaStatus).toLowerCase() ===
        selectedStatus.toLowerCase();

    const matchesPort =
      !selectedPort || item.portId[0]?.portName === selectedPort;

    return matchesSearchTerm && matchesStatus && matchesPort;
  });

  const columns = [
    {
      field: "JobId",
      headerName: "Job ID",
      flex: 1,
      renderCell: (params) => (
        <div
          style={{
            color: "#1EBBEE",
            cursor: "pointer",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {params.value}
        </div>
      ),
    },
    { field: "vessel", headerName: "Vessel Name", flex: 1 },
    { field: "job", headerName: "Job", flex: 1, width: "400px" },
    { field: "port", headerName: "Port Name", flex: 1 },
    { field: "AssignedTo", headerName: "Ops By", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <>
          <button
            type="button"
            className="btn btn-sm btn-info text-white"
            onClick={() => handleJobClick(params.row)}
          >
            View
          </button>
          {/* <button
            style={{ marginLeft: "10px" }}
            className="btn btn-sm btn-info text-white"
            onClick={() => downloadRowExcel(params.row)}
            title="Download Excel"
          >
            <i className="bi bi-download"></i>
          </button> */}
        </>
      ),
    },
  ];

  const downloadRowExcel = async (rowData) => {
    // Prepare single row data
    const excelData = [
      {
        "Job ID": rowData.JobId,
        "Vessel Name": rowData.vessel,
        Job: rowData.job,
        "Port Name": rowData.port,
        "Ops By": rowData.AssignedTo,
        Status: rowData.status,
      },
    ];

    const headers = Object.keys(excelData[0]);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Job Report", {
      properties: { defaultRowHeight: 30 },
      pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    // Header
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 25;
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

    // Data row
    const dataRow = worksheet.addRow(headers.map((h) => excelData[0][h]));

    // Calculate height for Job column content
    const jobContent = excelData[0]["Job"] || "";
    const jobContentLength = jobContent.toString().length;

    // Estimate lines needed for Job column (50 characters per line for width 50)
    const estimatedLines = Math.max(1, Math.ceil(jobContentLength / 50));

    // Set row height based on content (minimum 25, add 18 points per additional line)
    const calculatedHeight = Math.max(25, 18 + (estimatedLines - 1) * 18);
    dataRow.height = Math.min(calculatedHeight, 200); // Cap at 200 points for very long content

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

    // Set column widths with special handling for Job column
    headers.forEach((h, i) => {
      if (h === "Job") {
        // Set a fixed width for Job column to ensure wrapping works properly
        worksheet.getColumn(i + 1).width = 50; // Fixed width of 50 characters
      } else {
        // Auto-size other columns
        let maxLen = (h || "").toString().length;
        const val = excelData[0][h];
        const len = val == null ? 0 : val.toString().length;
        if (len > maxLen) maxLen = len;

        const minWidth = 15;
        const maxWidth = 30;
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
    saveAs(blob, `Job_Report_${rowData.JobId.replace(/\s+/g, "_")}.xlsx`);
  };

  const handleJobClick = (row) => {
    // Save all filter states before navigation
    const filterState = {
      filterType,
      selectedMonth,
      selectedYear,
      selectedIds,
      selectedPort,
      selectedStatus,
      searchTerm,
    };
    sessionStorage.setItem("jobReportFilters", JSON.stringify(filterState));
    navigate("/view-operation", {
      state: { row },
    });
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
      <Typography>No Quotations available for given terms</Typography>
    </Box>
  );
  const handleCellClick = (params, event) => {
    console.log(params, "params");
    if (params.field === "JobId") {
      let row = params.row;
      // Save all filter states before navigation
      const filterState = {
        filterType,
        selectedMonth,
        selectedYear,
        selectedIds,
        selectedPort,
        selectedStatus,
        searchTerm,
      };
      sessionStorage.setItem("jobReportFilters", JSON.stringify(filterState));
      navigate("/view-operation", {
        state: { row },
      });
    }
  };

  const getPDF = async () => {
    const payload = {
      filter: filterType,
      month: selectedMonth,
      year: String(selectedYear),
      jobs: selectedIds,
      assignedEmployee: (() => {
        // First check: if roleType is not "operations", return ""
        if (
          loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
          "operations"
        ) {
          return "";
        }

        // If roleType is "operations", check designationType
        const designationType =
          loginResponse?.data?.userRole?.role?.designationType?.toLowerCase();

        // If designationType is "operationsmanager" or "operationshead", return ""
        if (["operationsmanager", "operationshead"].includes(designationType)) {
          return "";
        }

        // If designationType is empty (""), return the user ID
        // Note: If you meant roleType instead of _id, you can change this line
        if (!designationType || designationType === "") {
          return loginResponse?.data?._id;
        }

        // Default fallback
        return "";
      })(),
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await jobReportPDF(payload);
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
        link.setAttribute("download", "Job Report.pdf"); // Set the file name
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

  // const createExcel = () => {
  //   if (!filteredQuotations || filteredQuotations.length === 0) return;
  //   const excelData = filteredQuotations.map((item) => ({
  //     "Job ID": item.jobId || "N/A",
  //     "Vessel Name": item.vesselId?.[0]?.vesselName || "N/A",
  //     Job:
  //       item.jobs
  //         ?.map((job) => job.service?.[0]?.serviceName || "N/A")
  //         ?.join(", ") || "N/A",
  //     "Port Name": item.portId?.[0]?.portName || "N/A",
  //     "Ops By": item.assignedEmployee?.[0]?.name || "N/A",
  //     Status:
  //       item.pdaStatus === 5
  //         ? "Customer Approved"
  //         : item.pdaStatus === 6
  //         ? "Pending from operations"
  //         : item.pdaStatus === 7
  //         ? "Operations Completed"
  //         : "Unknown Status",
  //   }));
  //   const XLSX = require("xlsx");
  //   const worksheet = XLSX.utils.json_to_sheet(excelData);
  //   worksheet["!cols"] = [
  //     { wch: 15 }, // Job ID
  //     { wch: 20 }, // Vessel Name
  //     { wch: 30 }, // Job
  //     { wch: 20 }, // Port Name
  //     { wch: 20 }, // Ops By
  //     { wch: 20 }, // Status
  //   ];
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "JobReport");
  //   XLSX.writeFile(workbook, "Job Report.xlsx");
  // };

  // const createExcel = async () => {
  //   if (!filteredQuotations || filteredQuotations.length === 0) return;

  //   const rowsData = filteredQuotations.map((item) => ({
  //     "Job ID": item.jobId || "N/A",
  //     "Vessel Name": item.vesselId?.[0]?.vesselName || "N/A",
  //     Job:
  //       item.jobs
  //         ?.map((job) => job.service?.[0]?.serviceName || "N/A")
  //         ?.join(", ") || "N/A",
  //     "Port Name": item.portId?.[0]?.portName || "N/A",
  //     "Ops By": item.assignedEmployee?.[0]?.name || "N/A",
  //     Status:
  //       item.pdaStatus === 5
  //         ? "Customer Approved"
  //         : item.pdaStatus === 6
  //         ? "Pending from operations"
  //         : item.pdaStatus === 7
  //         ? "Operations Completed"
  //         : "Unknown Status",
  //   }));

  //   const headers = Object.keys(rowsData[0] || {});
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Job Report", {
  //     properties: { defaultRowHeight: 18 },
  //     pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  //   });

  //   // Header row
  //   const headerRow = worksheet.addRow(headers);
  //   headerRow.eachCell((cell) => {
  //     cell.font = { bold: true };
  //     cell.alignment = {
  //       horizontal: "center",
  //       vertical: "middle",
  //       wrapText: true,
  //     };
  //     cell.border = {
  //       top: { style: "thin" },
  //       left: { style: "thin" },
  //       bottom: { style: "thin" },
  //       right: { style: "thin" },
  //     };
  //     cell.fill = {
  //       type: "pattern",
  //       pattern: "solid",
  //       fgColor: { argb: "FFEFEFEF" },
  //     };
  //   });

  //   // Data rows
  //   rowsData.forEach((row) => {
  //     const r = worksheet.addRow(headers.map((h) => row[h]));
  //     r.eachCell((cell) => {
  //       cell.alignment = {
  //         horizontal: "center",
  //         vertical: "middle",
  //         wrapText: true,
  //       };
  //       cell.border = {
  //         top: { style: "thin" },
  //         left: { style: "thin" },
  //         bottom: { style: "thin" },
  //         right: { style: "thin" },
  //       };
  //     });
  //   });

  //   // Auto-size columns based on content length (clamped)
  //   const minWidth = 15;
  //   const maxWidth = 120;
  //   headers.forEach((h, i) => {
  //     let maxLen = (h || "").toString().length;
  //     rowsData.forEach((row) => {
  //       const val = row[h];
  //       const len = val == null ? 0 : val.toString().length;
  //       if (len > maxLen) maxLen = len;
  //     });

  //     // Special handling for Job column - ensure minimum width
  //     let width;
  //     if (h === "Job") {
  //       width = Math.max(40, Math.min(maxWidth, maxLen + 2)); // Minimum 40 for Job column
  //     } else {
  //       width = Math.max(minWidth, Math.min(maxWidth, maxLen + 2));
  //     }

  //     worksheet.getColumn(i + 1).width = width;
  //   });
  //   // Let Excel auto-adjust row heights for wrapped text
  //   worksheet.eachRow((row) => {
  //     row.height = undefined;
  //   });

  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   saveAs(blob, "Job Report.xlsx");
  // };

  // ...existing code...

  // ...existing code...
  const createExcel = async () => {
    if (!filteredQuotations || filteredQuotations.length === 0) return;

    const rowsData = filteredQuotations.map((item) => ({
      "Job ID": item.jobId || "N/A",
      "Vessel Name": item.vesselId?.[0]?.vesselName || "N/A",
      Job:
        item.jobs
          ?.map((job) => job.service?.[0]?.serviceName || "N/A")
          ?.join(", ") || "N/A",
      "Port Name": item.portId?.[0]?.portName || "N/A",
      "Ops By": item.assignedEmployee?.[0]?.name || "N/A",
      Status:
        item.pdaStatus === 5
          ? "Customer Approved"
          : item.pdaStatus === 6
          ? "Pending from operations"
          : item.pdaStatus === 7
          ? "Operations Completed"
          : "Unknown Status",
    }));

    const headers = Object.keys(rowsData[0] || {});
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Job Report", {
      properties: { defaultRowHeight: 30 }, // Increased default row height
      pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    // Header row
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 25; // Set explicit height for header
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
    rowsData.forEach((row, rowIndex) => {
      const r = worksheet.addRow(headers.map((h) => row[h]));

      // Calculate the required height for this row based on Job column content
      const jobContent = row["Job"] || "";
      const jobContentLength = jobContent.toString().length;

      // Estimate lines needed for Job column (50 characters per line for width 50)
      const estimatedLines = Math.max(1, Math.ceil(jobContentLength / 50));

      // Set row height based on content (minimum 25, add 18 points per additional line)
      const calculatedHeight = Math.max(25, 18 + (estimatedLines - 1) * 18);
      r.height = Math.min(calculatedHeight, 120); // Cap at 120 points

      r.eachCell((cell, colNumber) => {
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

    // Set column widths with special handling for Job column
    headers.forEach((h, i) => {
      if (h === "Job" || h == "Job ID") {
        // Set a fixed width for Job column to ensure wrapping works properly
        worksheet.getColumn(i + 1).width = 50; // Fixed width of 50 characters
      } else {
        // Auto-size other columns
        let maxLen = (h || "").toString().length;
        rowsData.forEach((row) => {
          const val = row[h];
          const len = val == null ? 0 : val.toString().length;
          if (len > maxLen) maxLen = len;
        });

        const minWidth = 15;
        const maxWidth = 30;
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
    saveAs(blob, "Job Report.xlsx");
  };
  // ...existing code...

  // ...existing code...

  useEffect(() => {
    console.log(selectedJobs, "selectedJobs");
  }, [selectedJobs]);

  return (
    <>
      <div className="p-3">
        <div className="jobreport-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="summary me-2">SUMMARY</div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-info filbtnjob"
              onClick={() => {
                getPDF();
              }}
            >
              Download PDF
            </button>
            <button className="btn btn-info filbtnjob" onClick={createExcel}>
              Download Excel
            </button>
          </div>
        </div>
        <div className="bb"> </div>
        <div className=" mt-3 d-flex">
          <div className=" totalno">
            <label htmlFor="inputPassword" className=" form-label">
              Total No.of Vessels :
            </label>
            <input
              type="text"
              // totalnoinputb
              className="form-control "
              id="inputPassword"
              value={reportList?.totalVessels}
              readOnly
            ></input>
          </div>

          <div className="totalno">
            <label htmlFor="inputPassword" className=" form-label">
              Total No.of Services :
            </label>
            <input
              type="text"
              // totalnoinputa
              className="form-control "
              id="inputPassword"
              value={reportList?.totalServices}
              readOnly
            ></input>
          </div>

          <div className="totalno">
            <label htmlFor="inputPassword" className=" form-label">
              {" "}
              No.of Tanker Vessels :
            </label>
            <input
              type="text"
              // totalnoinput
              className="form-control "
              id="inputPassword"
              value={reportList?.totalTankerVessels}
              readOnly
            ></input>
          </div>

          <div className=" totalno">
            <label htmlFor="inputPassword" className=" form-label">
              {" "}
              No.of Bulk Vessels :
            </label>
            <input
              type="text"
              // totalnoinput
              className="form-control "
              id="inputPassword"
              value={reportList?.totalBulkVessels}
              readOnly
            ></input>
          </div>
          <div className="totalno">
            <label htmlFor="inputPassword" className=" form-label">
              Other Client Vessels :
            </label>
            <input
              type="text"
              // totalnoinput
              className="form-control "
              id="inputPassword"
              value={
                reportList?.totalVessels -
                (reportList?.totalTankerVessels + reportList?.totalBulkVessels)
              }
              readOnly
            ></input>
          </div>
        </div>
        <div className="row mt-3"></div>
        <div className="bbn"> </div>
        <div className="row mt-3">
          <div className="col-10 jobtotal ">
            <label
              htmlFor="inputPassword"
              className=" form-label jobused ms-3 ms-sm-1"
            >
              {" "}
              Jobs used in each port :
            </label>
            <Multiselect
              options={selectedJobs}
              selectedValues={selectedJobs.filter((job) =>
                selectedIds.includes(job._id)
              )}
              displayValue="serviceName" // Display the serviceName in the dropdown
              showCheckbox
              onSelect={handleSelect} // Triggered when an item is selected
              onRemove={handleRemove} // Triggered when an item is removed
              className="custom-multiselect" // Apply custom class
              style={{
                ...customStyles,
                option: {
                  ...customStyles.option,
                  ":hover": hoverStyles, // Add hover styling
                },
              }}
            />
          </div>

          <div className="col-1">
            <button
              type="button"
              className="btn btn-info filbtn"
              onClick={() => filterbyJobs()}
            >
              Filter
            </button>
          </div>
        </div>
        <div className="charge mt-2">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>

        <div className="d-flex  headerb mb-3 mt-3 ">
          <div className=" d-flex">
            <div className=" jjffilterf mqfiltermainleftjob ">
              <i className="bi bi-funnel-fill filtericon"></i>
              <select
                className="form-select form-select-sm filter"
                aria-label="Filter select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
                      className="form-select jobporrt mandyearbyjob monthselectheight"
                      aria-label="Select Month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
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
              <div className="">
                <div className="jobfilter">
                  <div></div>
                  <div className="yearjobreport">
                    <select
                      className="form-select jobporrt mmonth mandyearbyjob"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
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
            )}
          </div>
          <div className=" filtermain ">
            <i className="bi bi-funnel-fill filtericon"></i>
            <select
              className="form-select form-select-sm filter"
              aria-label="Small select example"
              name="port"
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
            >
              <option value="">Filter by port</option>
              {ports?.map((port) => (
                <option key={port?.portId} value={port?.portName}>
                  {port?.portName}
                </option>
              ))}
            </select>
          </div>
          <div className=" filtermainjobleft ">
            <i className="bi bi-funnel-fill filtericon"></i>
            <select
              className="form-select form-select-sm filter"
              aria-label="Small select example"
              name="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Filter by status</option>
              {statusList?.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --------------------------------------- */}
        <div className=" tablequo">
          <div className="quotation-outer-div">
            <div
              style={{
                width: "100%",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                minHeight: 350,
              }}
            >
              <DataGrid
                rows={
                  filteredQuotations?.length > 0
                    ? filteredQuotations?.map((item) => ({
                        id: item._id,
                        JobId: item.jobId || "N/A",
                        vessel: item.vesselId[0]?.vesselName || "N/A",
                        job:
                          item.jobs
                            ?.map(
                              (job) => job.service?.[0]?.serviceName || "N/A"
                            )
                            ?.join(", ") || "N/A", // Updated line to include service names
                        port: item.portId[0]?.portName || "N/A",
                        AssignedTo: item.assignedEmployeeName[0]?.name || "N/A",
                        status: getStatusText(item.pdaStatus),
                        ...item,
                      }))
                    : []
                }
                jobId
                columns={columns.map((col) =>
                  window.innerWidth <= 600
                    ? { ...col, flex: undefined, minWidth: 180, width: 180 }
                    : col
                )}
                getRowId={(row) => row.id} // Use id field for unique row identification
                disableSelectionOnClick // Disables checkbox selection to prevent empty column
                disableColumnMenu // Removes column menu
                components={{
                  NoRowsOverlay,
                }}
                onCellClick={handleCellClick}
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
          </div>

          {filteredQuotations?.length == 0 && (
            <>
              <div className="no-data">
                <p>Currently, there are no available jobs</p>
              </div>
            </>
          )}
        </div>
      </div>
      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default NewJobReport;
