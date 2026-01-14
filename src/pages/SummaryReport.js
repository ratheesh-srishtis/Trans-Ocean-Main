import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { generateSummarReport } from "../services/apiService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const ReportTable = () => {
  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );

  // Replace the state declaration
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Update the handler function
  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
  };
  const fetchReportData = useCallback(async (year) => {
    setIsLoading(true);
    try {
      const response = await generateSummarReport({ year: year });
      console.log(response, "response");
      if (response.status == true) {
        processReportData(response, year);
      } else {
        console.error("API returned false status");
        setRows([]);
        setColumns([]);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setRows([]);
      setColumns([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processReportData = (apiData, year) => {
    const shortYear = (year % 100).toString().padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const rowData = [];
    let rowId = 0;

    // Helper function to format values
    const formatValue = (val) => {
      if (
        val === 0 ||
        val === "0" ||
        val === "0.000" ||
        val === null ||
        val === undefined
      ) {
        return 0;
      }
      // Handle string values like "1,000.000" or "-12.500"
      if (typeof val === "string") {
        const cleaned = parseFloat(val.replace(/,/g, ""));
        return isNaN(cleaned) ? 0 : cleaned;
      }
      return parseFloat(val) || 0;
    };

    const rowDefinitions = [
      { key: "revenue", label: "Revenue", bold: false },
      { key: "salesCost", label: "Direct Cost/ Cost Of Sales", bold: false },
      { key: "grossProfit", label: "Gross Profit", bold: true },
      {
        key: "administrativeExpenses",
        label: "Operations and Administrative Expenses",
        bold: false,
      },
      { key: "otherIncome", label: "Other Income", bold: false },
      { key: "assetSales", label: "Loss on disposal of assets", bold: false },
      { key: "ebitda", label: "EBITDA", bold: true },
      { key: "depreciation", label: "Depreciation", bold: false },
      { key: "appreciation", label: "Appreciation", bold: false },
      { key: "ebit", label: "EBIT", bold: true },
      { key: "bankCharges", label: "Bank Charges", bold: false },
      { key: "ebt", label: "EBT", bold: true },
      { key: "tax", label: "Tax", bold: false },
      { key: "eat", label: "EAT", bold: false },
    ];

    rowDefinitions.forEach(({ key, label, bold }) => {
      const row = {
        id: rowId++,
        particular: label,
        isBold: bold,
        dataKey: key,
      };

      let total = 0;

      months.forEach((month) => {
        const monthValue = formatValue(apiData[key]?.[month]);
        row[month] = monthValue;
        total += monthValue;
      });

      // Add FY total column
      row.FY = total;

      rowData.push(row);
    });

    // Create columns with FY column at the end
    const newColumns = [
      {
        field: "particular",
        headerName: "Particulars",
        width: 280,
        flex: 1,
        renderCell: (params) => (
          <span className={params.row.isBold ? "bold-text" : ""}>
            {params.value}
          </span>
        ),
        sortable: false,
      },
      ...months.map((month) => ({
        field: month,
        headerName: `${month}-${shortYear}`,
        width: 120,
        type: "number",
        align: "right",
        headerAlign: "center",
        sortable: false,
      })),
      {
        field: "FY",
        headerName: `FY${shortYear}`,
        width: 130,
        type: "number",
        align: "right",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => (
          <strong className="fy-total">{params.value.toLocaleString()}</strong>
        ),
      },
    ];

    setRows(rowData);
    setColumns(newColumns);
  };

  // Fetch data when year changes
  useEffect(() => {
    fetchReportData(selectedYear);
  }, [selectedYear, fetchReportData]);

  // Initial load
  useEffect(() => {
    fetchReportData(currentYear);
  }, [fetchReportData]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <CircularProgress />
        <Typography ml={2}>Loading report data...</Typography>
      </Box>
    );
  }

  // Add this handler function in your component
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Financial Report ${selectedYear}`);

    // Define columns with proper widths
    worksheet.columns = [
      { key: "particular", width: 35 },
      { key: "Jan", width: 12 },
      { key: "Feb", width: 12 },
      { key: "Mar", width: 12 },
      { key: "Apr", width: 12 },
      { key: "May", width: 12 },
      { key: "Jun", width: 12 },
      { key: "Jul", width: 12 },
      { key: "Aug", width: 12 },
      { key: "Sep", width: 12 },
      { key: "Oct", width: 12 },
      { key: "Nov", width: 12 },
      { key: "Dec", width: 12 },
      { key: "FY", width: 14 },
    ];

    // Header row
    const shortYear = (selectedYear % 100).toString().padStart(2, "0");
    const headerRow = [
      "Particulars",
      "Jan-".concat(shortYear),
      "Feb-".concat(shortYear),
      "Mar-".concat(shortYear),
      "Apr-".concat(shortYear),
      "May-".concat(shortYear),
      "Jun-".concat(shortYear),
      "Jul-".concat(shortYear),
      "Aug-".concat(shortYear),
      "Sep-".concat(shortYear),
      "Oct-".concat(shortYear),
      "Nov-".concat(shortYear),
      "Dec-".concat(shortYear),
      "FY".concat(shortYear),
    ];

    worksheet.addRow(headerRow);

    // Style header row
    const headerStyle = {
      font: { bold: true, size: 12, color: { argb: "FFFFFFFF" } },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "" },
    };
    worksheet.getRow(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getRow(1).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thick" },
      right: { style: "thin" },
    };

    // Add data rows
    rows.forEach((row) => {
      const rowValues = [
        row.particular,
        row.Jan,
        row.Feb,
        row.Mar,
        row.Apr,
        row.May,
        row.Jun,
        row.Jul,
        row.Aug,
        row.Sep,
        row.Oct,
        row.Nov,
        row.Dec,
        row.FY,
      ];

      const excelRow = worksheet.addRow(rowValues);

      // Bold styling for bold rows and FY column
      if (row.isBold || true) {
        // Bold for all particular rows as needed
        excelRow.font = { bold: row.isBold };
      }

      // FY column bold
      excelRow.getCell(14).font = { bold: true }; // FY is 14th column

      // Center alignment for all cells
      excelRow.alignment = { horizontal: "center", vertical: "middle" };

      // Borders
      excelRow.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Auto-fit row heights
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.height = 22;
    });

    // Title row
    worksheet.mergeCells("A1:N1");
    worksheet.getCell("A1").value = `Summary Report - ${selectedYear}`;
    worksheet.getCell("A1").font = {
      bold: true,
      size: 16,
      color: { argb: "FF1F4E79" },
    };
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getRow(1).height = 30;

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Summary Report_${selectedYear}.xlsx`);
  };

  return (
    <Box sx={{ width: "100%", height: 650 }}>
      <Box
        mb={3}
        p={2}
        sx={{
          backgroundColor: "#f8f9fa",
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between", // Push items to left & right
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Left side - Year selection */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="p" color="text.primary">
            Select Year
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <select
              name="year"
              className="form-select vesselbox"
              aria-label="Default select example"
              onChange={handleYearChange}
              value={selectedYear}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </FormControl>
        </Box>

        {/* Right side - Buttons */}
        {/* <div className="d-flex gap-2">
          <button
            className="btn btn-info filbtnjob"
            onClick={handleExportExcel}
          >
            Download Excel
          </button>
          <button className="btn btn-info filbtnjob">Download PDF</button>
        </div> */}
      </Box>
      <DataGrid
        className="mx-2"
        rows={rows}
        columns={columns}
        getRowClassName={(params) => `report-row row-${params.index % 2}`}
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnSelector
        disableColumnMenu
        hideFooter
        sx={{
          border: "1px solid #dee2e6",
          fontSize: "0.800rem",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8f9fa",
            borderBottom: "2px solid #dee2e6 !important",
            fontWeight: 600,
          },
          "& .MuiDataGrid-cell": {
            borderRight: "1px solid #e9ecef",
            justifyContent: "flex-end",
            "&:first-of-type": {
              justifyContent: "flex-start !important",
              paddingLeft: "12px",
            },
            '&[data-field="FY"]': {
              backgroundColor: "#f0f8ff",
              fontWeight: 600,
            },
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f8f9ff",
          },
        }}
      />

      {rows.length === 0 && !isLoading && (
        <Box p={4} textAlign="center" color="text.secondary">
          No data available for the selected year
        </Box>
      )}
    </Box>
  );
};

export default ReportTable;
