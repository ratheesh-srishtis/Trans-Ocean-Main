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

const ReportTable = () => {
  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );

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
    alert("processReportData");
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

      months.forEach((month) => {
        row[month] = formatValue(apiData[key]?.[month]);
      });

      rowData.push(row);
    });

    // Create columns
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
    ];

    console.log(rowData, "rowData");

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
  }, []);

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

  return (
    <Box sx={{ width: "100%", height: 650 }}>
      <Box
        mb={3}
        p={2}
        sx={{
          backgroundColor: "#f8f9fa",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="primary">
          Financial Summary Report
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select value={selectedYear} label="Year" onChange={handleYearChange}>
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DataGrid
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
          fontSize: "0.875rem",
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
              paddingLeft: "16px",
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
