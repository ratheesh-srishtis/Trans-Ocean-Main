// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/reports/costcentersummary.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getCostCentreSummaryReport,
  costCentreSummaryReportPDF,
  costCentreBreakupReportPDF,
  getCostCentreBreakupReport,
} from "../../services/apiService";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import Loader from "../Loader";

const CostCenterSummary = ({ ports, customers }) => {
  const [reportList, setReportList] = useState([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const Group = require("../../assets/images/reporttttt.png");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [services, setServices] = useState([]);

  // const filteredReports = reportList?.filter((item) => {
  //   const matchedPort = !selectedPort || item.employee[0]?._id === selectedPort;
  //   return matchedPort;
  // });

  const columns = [
    { field: "jobId", headerName: "Job No", flex: 1 },
    { field: "sales", headerName: "Sales", flex: 1 },
    { field: "purchase", headerName: "Purchase", flex: 1 },
    { field: "profitOrLoss", headerName: "Profit (or Loss)", flex: 1 },
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
      pdaId: rowData?.pdaId,
    };
    setIsLoading(true);
    console.log(payload, "payload_getReport");
    try {
      const response = await costCentreBreakupReportPDF(payload);
      console.log("getPettyCashReport", response);
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
        link.setAttribute(
          "download",
          "Cost Centre Summary Detailed Report.pdf"
        ); // Set the file name
        document.body.appendChild(link);
        link.click();
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfBlobUrl);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  const downloadRowExcel = async (rowData) => {
    // Prepare single row data
    let payload = {
      pdaId: rowData?.pdaId,
    };
    console.log(payload, "payload_getReport");
    setIsLoading(true);
    try {
      const response = await getCostCentreBreakupReport(payload);
      console.log("costCentreBreakupReport", response);
      setIsLoading(false);
      setServices(response?.pdaServices);
      const totalCustomerAmount = response?.pdaServices.reduce(
        (sum, s) => sum + s.customerOMR + s.customerVAT,
        0
      );
      const totalVendorAmount = response?.pdaServices.reduce((sum, s) => {
        // Sum all vendorOMR and vendorVAT for each vendor slot
        const omrKeys = ["vendorOMR", "vendor2OMR", "vendor3OMR", "vendor4OMR"];
        const vatKeys = ["vendorVAT", "vendor2VAT", "vendor3VAT", "vendor4VAT"];
        let vendorTotal = 0;
        for (let i = 0; i < omrKeys.length; i++) {
          const omr =
            typeof s[omrKeys[i]] === "number"
              ? s[omrKeys[i]]
              : parseFloat(s[omrKeys[i]]) || 0;
          const vat =
            typeof s[vatKeys[i]] === "number"
              ? s[vatKeys[i]]
              : parseFloat(s[vatKeys[i]]) || 0;
          vendorTotal += omr + vat;
        }
        return sum + vendorTotal;
      }, 0);
      const profitOrLoss = (totalCustomerAmount - totalVendorAmount).toFixed(3);
      createNewExcel(
        response?.pdaServices,
        response?.pda?.invoiceId,
        totalCustomerAmount,
        totalVendorAmount,
        profitOrLoss
      );
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  const createNewExcel = async (
    services,
    invoiceId,
    totalCustomerAmount,
    totalVendorAmount,
    profitOrLoss
  ) => {
    if (!services || services.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Cost Center Summary Report", {
      properties: { defaultRowHeight: 18 },
      pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    // Define columns
    worksheet.columns = [
      { header: "Sales", key: "sales", width: 25 },
      { header: "Amount", key: "customerAmount", width: 15 },
      { header: "Purchase", key: "purchase", width: 40 },
      { header: "Amount", key: "vendorAmount", width: 15 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
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
    services.forEach((service, index) => {
      const vendorNames = [
        service?.vendorId?.vendorName,
        service?.vendor2Id?.vendorName,
        service?.vendor3Id?.vendorName,
        service?.vendor4Id?.vendorName,
      ].filter(Boolean);

      const omrKeys = ["vendorOMR", "vendor2OMR", "vendor3OMR", "vendor4OMR"];
      const vatKeys = ["vendorVAT", "vendor2VAT", "vendor3VAT", "vendor4VAT"];

      const vendorAmounts = omrKeys
        .map((omrKey, idx) => {
          const omr =
            typeof service[omrKey] === "number"
              ? service[omrKey]
              : parseFloat(service[omrKey]) || 0;
          const vat =
            typeof service[vatKeys[idx]] === "number"
              ? service[vatKeys[idx]]
              : parseFloat(service[vatKeys[idx]]) || 0;
          if (vendorNames[idx]) {
            return `OMR ${(omr + vat).toFixed(3)}`;
          }
          return null;
        })
        .filter((v, idx) => vendorNames[idx]);

      const vendorNamesDisplay =
        vendorNames.length > 1
          ? vendorNames.map((name, idx) => `${idx + 1}. ${name}`).join("\n")
          : vendorNames[0] || "";

      const vendorAmountsDisplay =
        vendorAmounts.length > 1
          ? vendorAmounts.map((amt, idx) => `${idx + 1}. ${amt}`).join("\n")
          : vendorAmounts[0] || "";

      const row = worksheet.addRow({
        sales: index === 0 ? `Invoice No : ${invoiceId}` : "",
        customerAmount: `OMR ${(
          service.customerOMR + service.customerVAT
        ).toFixed(3)}`,
        purchase: vendorNamesDisplay,
        vendorAmount: vendorAmountsDisplay,
      });

      // Center align + wrap for all cells
      row.eachCell((cell) => {
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

      // Adjust row height based on multi-line content in Purchase / Vendor Amount
      const purchaseLines = (vendorNamesDisplay || "")
        .toString()
        .split("\n").length;
      const vendorAmountLines = (vendorAmountsDisplay || "")
        .toString()
        .split("\n").length;
      const maxLines = Math.max(purchaseLines, vendorAmountLines);
      if (maxLines > 1) {
        row.height = Math.max(18, maxLines * 15);
      }
    });

    // Totals row
    const totalRow = worksheet.addRow({
      sales: "Total Amount",
      customerAmount: `OMR ${totalCustomerAmount.toFixed(3)}`,
      purchase: "Total Amount",
      vendorAmount: `OMR ${totalVendorAmount.toFixed(3)}`,
    });
    totalRow.eachCell((cell) => {
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
    });

    // Profit/Loss row
    const profitLossRow = worksheet.addRow({
      sales: "",
      customerAmount: "",
      purchase: profitOrLoss >= 0 ? "Profit" : "Loss",
      vendorAmount: `OMR ${Number(profitOrLoss).toFixed(3)}`,
    });
    profitLossRow.eachCell((cell, colNumber) => {
      const isValueCell = colNumber === 3 || colNumber === 4;
      cell.font = isValueCell ? { bold: true } : {};
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

    // Auto-size columns based on content (clamped)
    const headers = worksheet.getRow(1).values.slice(1); // ExcelJS row.values is 1-based
    const minWidth = 15;
    const maxWidth = 60;

    headers.forEach((h, i) => {
      let maxLen = (h || "").toString().length;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header counted
        const val = row.getCell(i + 1).value;
        const text =
          val == null
            ? ""
            : typeof val === "object" && val.richText
            ? val.richText.map((r) => r.text).join("")
            : String(val);
        if (text.length > maxLen) maxLen = text.length;
      });

      const width = Math.max(minWidth, Math.min(maxWidth, maxLen + 2));
      worksheet.getColumn(i + 1).width = width;
    });

    // Nudge Sales and Purchase wider for readability
    worksheet.getColumn(1).width = Math.max(
      worksheet.getColumn(1).width || 0,
      22
    );
    worksheet.getColumn(3).width = Math.max(
      worksheet.getColumn(3).width || 0,
      30
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Cost Centre Summary Detailed Report.xlsx");
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
      <Typography>No Report available for given terms</Typography>
    </Box>
  );

  useEffect(() => {
    console.log(reportList, "reportList_CostCenterSummary");
  }, [reportList]);

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    console.log(value, "value_handleSelectChange");
    switch (name) {
      case "port":
        setSelectedPort(value);
        break;
      case "customer":
        setSelectedCustomer(value);
        break;
      default:
        break;
    }
  };

  const [filterType, setFilterType] = useState("month"); // Default to "monthly"
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  ); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

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
    // No need to call getReport() here as the useEffect will handle it
    // when the filter type changes
    if (newFilterType === "year") {
      setSelectedMonth(""); // Optionally clear month
    }
    if (newFilterType === "month") {
      setSelectedYear(new Date().getFullYear()); // Optionally reset year
    }
  };

  const getReport = async () => {
    let payload = {
      customerId: selectedCustomer,
      portId: selectedPort,
      filter: filterType,
      month: selectedMonth,
      year: selectedYear,
    };
    setIsLoading(true); // Show loader
    try {
      const response = await getCostCentreSummaryReport(payload);
      if (response?.status == true) {
        console.log(response?.report, "response_report");
        setReportList(response?.report);
        setIsLoading(false);
      } else if (response?.status == false) {
        setReportList([]);
        setIsLoading(false);
      }
      console.log("getPettyCashReport", response);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      getReport();
    } else {
      getReport();
    }
  }, [selectedCustomer, selectedMonth, selectedYear, selectedPort, filterType]);

  const getPDF = async () => {
    let payload = {
      customerId: selectedCustomer,
      portId: selectedPort,
      filter: filterType,
      month: selectedMonth,
      year: selectedYear,
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await costCentreSummaryReportPDF(payload);
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
        link.setAttribute("download", "Cost Centre Summary Report.pdf"); // Set the file name
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

  // Create Excel for Cost Center Summary
  // const createExcel = () => {
  //   if (!reportList || reportList.length === 0) return;
  //   const excelData = reportList.map((item) => ({
  //     "Job No": item?.jobId || "N/A",
  //     Sales: item?.sales?.toFixed(3) ?? "N/A",
  //     Purchase: item?.purchase?.toFixed(3) ?? "N/A",
  //     "Profit (or Loss)":
  //       item?.sales && item?.purchase
  //         ? (item.sales - item.purchase).toFixed(3)
  //         : "N/A",
  //   }));
  //   // Add totals row
  //   /*
  //   const totalSales = reportList
  //     .reduce((sum, item) => sum + (item.sales || 0), 0)
  //     .toFixed(3);
  //   const totalPurchase = reportList
  //     .reduce((sum, item) => sum + (item.purchase || 0), 0)
  //     .toFixed(3);
  //   const totalProfit = reportList
  //     .reduce(
  //       (sum, item) => sum + ((item.sales || 0) - (item.purchase || 0)),
  //       0
  //     )
  //     .toFixed(3);
  //   excelData.push({
  //     "Job No": "Total",
  //     Sales: totalSales,
  //     Purchase: totalPurchase,
  //     "Profit (or Loss)": totalProfit,
  //   });
  //   */
  //   // Create worksheet and workbook
  //   const XLSX = require("xlsx");
  //   const worksheet = XLSX.utils.json_to_sheet(excelData);
  //   worksheet["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "CostCenterSummary");
  //   XLSX.writeFile(workbook, "Cost Center Summary Report.xlsx");
  // };
  const createExcel = async () => {
    if (!reportList || reportList.length === 0) return;

    // Prepare rows for Excel
    const rowsData = reportList.map((item) => ({
      "Job No": item?.jobId || "N/A",
      Sales: typeof item?.sales === "number" ? item.sales.toFixed(3) : "N/A",
      Purchase:
        typeof item?.purchase === "number" ? item.purchase.toFixed(3) : "N/A",
      "Profit (or Loss)":
        typeof item?.sales === "number" && typeof item?.purchase === "number"
          ? (item.sales - item.purchase).toFixed(3)
          : "N/A",
    }));

    const headers = Object.keys(rowsData[0] || {});
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Cost Center Summary", {
      properties: { defaultRowHeight: 18 },
      pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    // Header row
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

    // Auto-size columns (clamped), ensure first column wide enough
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
    // Nudge Job No column wider
    worksheet.getColumn(1).width = Math.max(
      worksheet.getColumn(1).width || 0,
      18
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Cost Center Summary Report.xlsx");
  };
  return (
    <>
      <div className="p-2">
        <div className="d-flex  headerb mb-3 mt-3 ">
          <div className=" d-flex paymentbycus">
            <label
              htmlFor="exampleFormControlInput1"
              className="form-labelecostcenter "
            >
              Port:
            </label>
            <div className="vessel-select">
              <select
                className="form-select vesselboxcostcenter statusscustomer"
                name="port"
                onChange={handleSelectChange}
                value={selectedPort}
              >
                <option value="">Filter by Port</option>
                {ports?.map((port) => (
                  <option key={port?._id} value={port?._id}>
                    {port?.portName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="d-flex">
            <div
              className="col-3 filtermainpetty "
              style={{ marginLeft: "10px" }}
            >
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
              <div className="col-2">
                <div className="jobfilter">
                  <div></div>
                  <div>
                    <select
                      className="form-select mmonthcost"
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
                <div className="col-2">
                  <div className="jobfilter">
                    <div></div>
                    <div className="yearjobreport">
                      <select
                        className="form-select mmonthcost"
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

            <div className=" d-flex paymentbycuscost">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-labelecostcenter  "
              >
                Customers:
              </label>
              <div className="vessel-select">
                <select
                  className="form-select vesselboxcostcenter statusscostcustomer"
                  name="customer"
                  onChange={handleSelectChange}
                  value={selectedCustomer}
                >
                  <option value="">Filter by Customer</option>
                  {customers?.map((customer) => (
                    <option key={customer?._id} value={customer?._id}>
                      {customer?.customerName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-1">
              <button
                className="btn btn-info filbtnjob"
                onClick={() => {
                  getPDF();
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
          <div className="col-1">
            <button className="btn btn-info filbtnjob" onClick={createExcel}>
              Download Excel
            </button>
          </div>
        </div>

        {/* <div className="d-flex mt-3">
          <div className="d-flex align-items-center">
            <div className="col-">
              <label htmlFor="input" className="col-form-label costcenterinput">
                Job No:
              </label>
            </div>
            <div className="col-8">
              <input
                type="password"
                id="inputPassword6"
                className="form-control costcenterfontsize"
                placeholder="TOMS/OM/24/235"
              ></input>
            </div>
          </div>

          <div className="d-flex align-items-center margincostcenter">
            <div className="col-">
              <label htmlFor="input" className="col-form-label costcenterinput">
                Port Name:
              </label>
            </div>
            <div className="col-8">
              <select
                className="form-select vesselbox statusscustomer"
                name="port"
                onChange={handleSelectChange}
                value={selectedPort}
              >
                <option value="">Filter by Port</option>
                {ports?.map((port) => (
                  <option key={port?._id} value={port?._id}>
                    {port?.portName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div> */}
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        <div className="createtable p-3">
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
                    reportList?.length > 0
                      ? reportList?.map((item, index) => ({
                          id: index, // Ensure each row has a unique id
                          jobId: item?.jobId,
                          sales: item?.sales.toFixed(3) || "N/A", // Ensure employee is a string
                          purchase: item.purchase.toFixed(3) ?? "N/A",
                          profitOrLoss:
                            item?.sales && item?.purchase
                              ? (item.sales - item.purchase).toFixed(3)
                              : "N/A",
                          pdaId: item?._id,
                        }))
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
              </div>
            </div>
            {reportList?.length == 0 && (
              <>
                <div className="no-data">
                  <p>No Reports available for given terms</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Loader isLoading={isLoading} />
    </>
  );
};

export default CostCenterSummary;

// individual excel data download code
// const excelData = [
//   {
//     "Job No": rowData.jobId,
//     Sales: rowData.sales,
//     Purchase: rowData.purchase,
//     "Profit (or Loss)": rowData.profitOrLoss,
//   },
// ];

// const headers = Object.keys(excelData[0]);
// const workbook = new ExcelJS.Workbook();
// const worksheet = workbook.addWorksheet("Cost Center Summary", {
//   properties: { defaultRowHeight: 18 },
//   pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
// });

// // Header
// const headerRow = worksheet.addRow(headers);
// headerRow.eachCell((cell) => {
//   cell.font = { bold: true };
//   cell.alignment = {
//     horizontal: "center",
//     vertical: "middle",
//     wrapText: true,
//   };
//   cell.border = {
//     top: { style: "thin" },
//     left: { style: "thin" },
//     bottom: { style: "thin" },
//     right: { style: "thin" },
//   };
//   cell.fill = {
//     type: "pattern",
//     pattern: "solid",
//     fgColor: { argb: "FFEFEFEF" },
//   };
// });

// // Data row
// const dataRow = worksheet.addRow(headers.map((h) => excelData[0][h]));
// dataRow.eachCell((cell) => {
//   cell.alignment = {
//     horizontal: "center",
//     vertical: "middle",
//     wrapText: true,
//   };
//   cell.border = {
//     top: { style: "thin" },
//     left: { style: "thin" },
//     bottom: { style: "thin" },
//     right: { style: "thin" },
//   };
// });

// // Auto-size columns
// const minWidth = 15;
// const maxWidth = 60;
// headers.forEach((h, i) => {
//   let maxLen = (h || "").toString().length;
//   const val = excelData[0][h];
//   const len = val == null ? 0 : val.toString().length;
//   if (len > maxLen) maxLen = len;
//   const width = Math.max(minWidth, Math.min(maxWidth, maxLen + 2));
//   worksheet.getColumn(i + 1).width = width;
// });
// worksheet.getColumn(1).width = Math.max(
//   worksheet.getColumn(1).width || 0,
//   24
// );

// const buffer = await workbook.xlsx.writeBuffer();
// const blob = new Blob([buffer], {
//   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
// });
// saveAs(
//   blob,
//   `Cost Center Summary ${rowData.jobId.replace(/\s+/g, "_")}.xlsx`
// );
