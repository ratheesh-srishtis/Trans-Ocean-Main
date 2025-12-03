// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/reports/costcenterbreakup.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getCostCentreBreakupReport,
  getAllJobIds,
  costCentreBreakupReportPDF,
} from "../../services/apiService";
import { DataGrid } from "@mui/x-data-grid";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../Loader";

const CostCenterBreakup = () => {
  const Group = require("../../assets/images/reporttttt.png");
  const [reportList, setReportList] = useState([]);
  const [jobIdList, setJobIdList] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedJobNo, setSelectedJobNo] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [totalAmountOMR, setTotalAmountOMR] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [portName, setPortName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const XLSX = require("xlsx");

  const getReport = async () => {
    let payload = {
      pdaId: selectedJobNo,
    };
    setIsLoading(true);
    try {
      setIsLoading(false);

      const response = await getCostCentreBreakupReport(payload);
      setInvoiceId(response?.pda?.invoiceId);
      setServices(response?.pdaServices);
      setVesselName(response?.pda?.vesselId?.vesselName);
      setPortName(response?.pda?.portId?.portName);
      console.log("getCostCentreBreakupReport", response);
    } catch (error) {
      setIsLoading(false);

      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(invoiceId, "invoiceId");
    console.log(services, "services");
  }, [invoiceId, services]);

  const getAllJobIDS = async () => {
    setIsLoading(true);
    try {
      setIsLoading(false);
      const response = await getAllJobIds({ report: true });
      setJobIdList(response?.jobs);
      console.log("getPettyCashReport", response);
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to fetch quotations:", error);
    }
  };
  useEffect(() => {
    getAllJobIDS();
  }, []);

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "jobNo":
        setSelectedJobNo(value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log(selectedJobNo, "selectedJobNo");
    if (selectedJobNo) {
      getReport();
    }
  }, [selectedJobNo]);

  // useEffect(() => {
  //   console.log(jobIdList, "jobIdList");
  //   setSelectedJobNo(jobIdList[0]?._id);
  // }, [jobIdList]);

  const totalCustomerAmount = services.reduce(
    (sum, s) => sum + s.customerOMR + s.customerVAT,
    0
  );
  // const totalVendorAmount = services.reduce(
  //   (sum, s) => sum + s.vendorOMR + s.vendorVAT,
  //   0
  // );

  const totalVendorAmount = services.reduce((sum, s) => {
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
  console.log(totalCustomerAmount, "totalCustomerAmount_checkamount");
  console.log(totalVendorAmount, "totalVendorAmount_checkamount");

  const columns = [
    {
      field: "invoiceDisplay",
      headerName: "Sales",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        if (params.value === "Total Amount") {
          return <span className="bold-label">Total Amount</span>;
        }
        return params.value || "";
      },
    },
    {
      field: "customerAmount",
      headerName: "Amount",
      flex: 1,
      sortable: false,
      renderCell: (params) =>
        params.value && !isNaN(params.value)
          ? `OMR ${Number(params.value).toFixed(3)}`
          : "",
    },
    {
      field: "vendorName",
      headerName: "Purchase",
      flex: 1,
      sortable: false,
      renderCell: (params) =>
        params.value === "Total Amount" ? (
          <span className="bold-label">{params.value}</span>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              whiteSpace: "pre-line",
              gap: "2px", // Reduce gap between vendor names
            }}
          >
            {params.value.split("\n").map((line, idx) => (
              <span key={idx} style={{ lineHeight: "1.2", margin: 0 }}>
                {line}
              </span>
            ))}
          </div>
        ),
    },
    {
      field: "vendorAmount",
      headerName: "Amount",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        // If Total Amount row, format to 2 decimals
        if (
          params.row.vendorName === "Total Amount" &&
          typeof params.value === "number"
        ) {
          return (
            <span className="bold-label">
              {Number(params.value).toFixed(2)}
            </span>
          );
        }
        // Otherwise, render as before
        return params.value ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              whiteSpace: "pre-line",
              gap: "2px",
            }}
          >
            {String(params.value)
              .split("\n")
              .map((line, idx) => (
                <span key={idx} style={{ lineHeight: "1.2", margin: 0 }}>
                  {line}
                </span>
              ))}
          </div>
        ) : (
          ""
        );
      },
    },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   flex: 0.5,
    //   sortable: false,
    //   renderCell: (params) => (
    //     <>
    //     <button
    //       className="btn btn-sm btn-info text-white"
    //       onClick={() => downloadRowExcel(params.row)}
    //       title="Download Excel"
    //     >
    //       <i className="bi bi-download"></i>
    //     </button>
    //     </>
    //   ),
    // },
  ];

  const downloadRowExcel = async (rowData) => {
    // Skip download for footer rows (Total Amount, Profit/Loss)
    if (rowData.isFooter) {
      return;
    }

    // Find the service data from the original services array
    const serviceIndex = rows.findIndex((r) => r.id === rowData.id);
    if (serviceIndex === -1 || serviceIndex >= services.length) return;

    const service = services[serviceIndex];

    // Prepare vendor data
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
          return (omr + vat).toFixed(3);
        }
        return null;
      })
      .filter((v, idx) => vendorNames[idx]);

    // Single row data with Invoice No always shown
    const excelData = [
      {
        Sales: invoiceId ? `Invoice No : ${invoiceId}` : "Invoice No :",
        "Customer Amount": `OMR ${(
          service.customerOMR + service.customerVAT
        ).toFixed(3)}`,
        Purchase:
          vendorNames.length > 1
            ? vendorNames.map((name, idx) => `${idx + 1}. ${name}`).join("\n")
            : vendorNames[0] || "",
        "Vendor Amount":
          vendorAmounts.length > 1
            ? vendorAmounts
                .map((amt, idx) => `${idx + 1}. OMR ${amt}`)
                .join("\n")
            : vendorAmounts[0]
            ? `OMR ${vendorAmounts[0]}`
            : "",
      },
    ];

    const headers = Object.keys(excelData[0]);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Cost Center Breakup", {
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

    // Data row
    const dataRow = worksheet.addRow(headers.map((h) => excelData[0][h]));

    // Calculate height for Purchase and Vendor Amount columns
    const purchaseContent = excelData[0]["Purchase"] || "";
    const vendorAmountContent = excelData[0]["Vendor Amount"] || "";
    const purchaseLines = purchaseContent.toString().split("\n").length;
    const vendorAmountLines = vendorAmountContent.toString().split("\n").length;
    const maxLines = Math.max(purchaseLines, vendorAmountLines);

    // Set row height based on content
    const calculatedHeight = Math.max(18, maxLines * 15);
    dataRow.height = Math.min(calculatedHeight, 200);

    dataRow.eachCell((cell) => {
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

    // Set column widths
    const minWidth = 15;
    const maxWidth = 60;
    headers.forEach((h, i) => {
      if (h === "Purchase" || h === "Vendor Amount") {
        worksheet.getColumn(i + 1).width = 40;
      } else if (h === "Sales") {
        worksheet.getColumn(i + 1).width = 30; // Wider for "Invoice No :" text
      } else {
        let maxLen = (h || "").toString().length;
        const val = excelData[0][h];
        const len = val == null ? 0 : val.toString().length;
        if (len > maxLen) maxLen = len;

        const width = Math.max(minWidth, Math.min(maxWidth, maxLen + 2));
        worksheet.getColumn(i + 1).width = width;
      }
    });

    // Set view options
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

    const fileName = `Cost Center Breakup.xlsx`;
    saveAs(blob, fileName);
  };

  // Add footer rows dynamically
  const rows = services.map((service, index) => ({
    id: service._id || index,
    invoiceDisplay: index === 0 ? `Invoice No : ${invoiceId}` : "", // Only show invoiceId in first row
    customerAmount: service.customerOMR + service.customerVAT,
    vendorName: (() => {
      const vendorNames = [
        service?.vendorId?.vendorName,
        service?.vendor2Id?.vendorName,
        service?.vendor3Id?.vendorName,
        service?.vendor4Id?.vendorName,
      ].filter(Boolean);
      if (vendorNames.length > 1) {
        return vendorNames.map((name, idx) => `${idx + 1}. ${name}`).join("\n");
      } else if (vendorNames.length === 1) {
        return vendorNames[0];
      } else {
        return "";
      }
    })(),
    vendorAmount: (() => {
      // Array of vendor OMR and VAT keys
      const omrKeys = ["vendorOMR", "vendor2OMR", "vendor3OMR", "vendor4OMR"];
      const vatKeys = ["vendorVAT", "vendor2VAT", "vendor3VAT", "vendor4VAT"];
      // Get vendor names for count
      const vendorNames = [
        service?.vendorId?.vendorName,
        service?.vendor2Id?.vendorName,
        service?.vendor3Id?.vendorName,
        service?.vendor4Id?.vendorName,
      ].filter(Boolean);

      // Always show all amounts if there are multiple vendor names
      const amounts = omrKeys
        .map((omrKey, idx) => {
          const omr =
            typeof service[omrKey] === "number"
              ? service[omrKey]
              : parseFloat(service[omrKey]) || 0;
          const vat =
            typeof service[vatKeys[idx]] === "number"
              ? service[vatKeys[idx]]
              : parseFloat(service[vatKeys[idx]]) || 0;
          // Show value even if 0, if vendor name exists
          if (vendorNames[idx]) {
            return `OMR ${(omr + vat).toFixed(3)}`;
          }
          return null;
        })
        .filter((v, idx) => vendorNames[idx]); // Only for slots with vendor name

      if (amounts.length > 1) {
        return amounts.map((amt, idx) => `${idx + 1}. ${amt}`).join("\n");
      } else if (amounts.length === 1) {
        return amounts[0];
      } else {
        return "";
      }
    })(),
  }));

  rows.push(
    {
      id: "TotalCustomerVendorAmount",
      invoiceDisplay: "Total Amount",
      customerAmount: totalCustomerAmount,
      vendorName: "Total Amount",
      vendorAmount: totalVendorAmount,
      isFooter: true,
    },
    {
      id: "ProfitOrLoss",
      invoiceDisplay: "",
      customerAmount: "",
      vendorName: profitOrLoss >= 0 ? "Profit" : "Loss",
      vendorAmount: profitOrLoss,
      isFooter: true,
      isLoss: profitOrLoss < 0,
    }
  );

  useEffect(() => {
    console.log(rows, "rows");
    console.log(services, "services");
  }, [rows, services]);

  const getPDF = async () => {
    let payload = {
      pdaId: selectedJobNo,
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await costCentreBreakupReportPDF(payload);
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
        link.setAttribute("download", "Cost Centre Breakup Report.pdf"); // Set the file name
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

  // Create Excel using ExcelJS for Cost Center Breakup
  // const createNewExcel = async () => {
  //   if (!services || services.length === 0) return;

  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Cost Center Breakup");

  //   // Define columns based on DataGrid structure
  //   worksheet.columns = [
  //     { header: "Sales", key: "sales", width: 25 },
  //     { header: "Amount", key: "customerAmount", width: 15 },
  //     { header: "Purchase", key: "purchase", width: 40 },
  //     { header: "Amount", key: "vendorAmount", width: 15 },
  //   ];

  //   // Style the header row
  //   const headerRow = worksheet.getRow(1);
  //   // headerRow.font = { bold: true };
  //   // headerRow.fill = {
  //   //   type: "pattern",
  //   //   pattern: "solid",
  //   //   fgColor: { argb: "FFEEEEEE" },
  //   // };
  //   // headerRow.alignment = { vertical: "middle", horizontal: "center" };
  //   // Add data rows
  //   services.forEach((service, index) => {
  //     const vendorNames = [
  //       service?.vendorId?.vendorName,
  //       service?.vendor2Id?.vendorName,
  //       service?.vendor3Id?.vendorName,
  //       service?.vendor4Id?.vendorName,
  //     ].filter(Boolean);

  //     const omrKeys = ["vendorOMR", "vendor2OMR", "vendor3OMR", "vendor4OMR"];
  //     const vatKeys = ["vendorVAT", "vendor2VAT", "vendor3VAT", "vendor4VAT"];

  //     const vendorAmounts = omrKeys
  //       .map((omrKey, idx) => {
  //         const omr =
  //           typeof service[omrKey] === "number"
  //             ? service[omrKey]
  //             : parseFloat(service[omrKey]) || 0;
  //         const vat =
  //           typeof service[vatKeys[idx]] === "number"
  //             ? service[vatKeys[idx]]
  //             : parseFloat(service[vatKeys[idx]]) || 0;
  //         if (vendorNames[idx]) {
  //           return `OMR ${(omr + vat).toFixed(3)}`;
  //         }
  //         return null;
  //       })
  //       .filter((v, idx) => vendorNames[idx]);

  //     const vendorNamesDisplay =
  //       vendorNames.length > 1
  //         ? vendorNames.map((name, idx) => `${idx + 1}. ${name}`).join("\n")
  //         : vendorNames[0] || "";

  //     const vendorAmountsDisplay =
  //       vendorAmounts.length > 1
  //         ? vendorAmounts.map((amt, idx) => `${idx + 1}. ${amt}`).join("\n")
  //         : vendorAmounts[0] || "";

  //     const row = worksheet.addRow({
  //       sales: index === 0 ? `Invoice No : ${invoiceId}` : "",
  //       customerAmount: `OMR ${(
  //         service.customerOMR + service.customerVAT
  //       ).toFixed(3)}`,
  //       purchase: vendorNamesDisplay,
  //       vendorAmount: vendorAmountsDisplay,
  //     });

  //     // Enable text wrapping for multi-line content
  //     row.getCell("purchase").alignment = { vertical: "top", wrapText: true };
  //     row.getCell("vendorAmount").alignment = {
  //       vertical: "top",
  //       wrapText: true,
  //     };

  //     // Adjust row height for multi-line content
  //     if (vendorNames.length > 1) {
  //       row.height = vendorNames.length * 15;
  //     }
  //   });

  //   // Add Total Amount row
  //   const totalRow = worksheet.addRow({
  //     sales: "Total Amount",
  //     customerAmount: `OMR ${totalCustomerAmount.toFixed(3)}`,
  //     purchase: "Total Amount",
  //     vendorAmount: `OMR ${totalVendorAmount.toFixed(3)}`,
  //   });
  //   // totalRow.font = { bold: true };

  //   // Add Profit/Loss row
  //   const profitLossRow = worksheet.addRow({
  //     sales: "",
  //     customerAmount: "",
  //     purchase: profitOrLoss >= 0 ? "Profit" : "Loss",
  //     vendorAmount: `OMR ${Number(profitOrLoss).toFixed(3)}`,
  //   });
  //   // profitLossRow.font = { bold: true };
  //   // profitLossRow.getCell("purchase").font = {
  //   //   bold: true,
  //   //   color: { argb: profitOrLoss >= 0 ? "FF008000" : "FFFF0000" },
  //   // };
  //   // profitLossRow.getCell("vendorAmount").font = {
  //   //   bold: true,
  //   //   color: { argb: profitOrLoss >= 0 ? "FF008000" : "FFFF0000" },
  //   // };

  //   // Add borders to all cells
  //   // worksheet.eachRow((row, rowNumber) => {
  //   //   row.eachCell((cell) => {
  //   //     cell.border = {
  //   //       top: { style: "thin" },
  //   //       left: { style: "thin" },
  //   //       bottom: { style: "thin" },
  //   //       right: { style: "thin" },
  //   //     };
  //   //   });
  //   // });

  //   // Generate Excel file
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   saveAs(blob, "Cost Center Breakup Report (Styled).xlsx");
  // };

  // const createNewExcel = async () => {
  //   if (!services || services.length === 0) return;

  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Cost Center Breakup Report", {
  //     properties: { defaultRowHeight: 18 },
  //     pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  //   });

  //   // Define columns
  //   worksheet.columns = [
  //     { header: "Sales", key: "sales", width: 25 },
  //     { header: "Amount", key: "customerAmount", width: 15 },
  //     { header: "Purchase", key: "purchase", width: 40 },
  //     { header: "Amount", key: "vendorAmount", width: 15 },
  //   ];

  //   // Style header row
  //   const headerRow = worksheet.getRow(1);
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
  //   services.forEach((service, index) => {
  //     const vendorNames = [
  //       service?.vendorId?.vendorName,
  //       service?.vendor2Id?.vendorName,
  //       service?.vendor3Id?.vendorName,
  //       service?.vendor4Id?.vendorName,
  //     ].filter(Boolean);

  //     const omrKeys = ["vendorOMR", "vendor2OMR", "vendor3OMR", "vendor4OMR"];
  //     const vatKeys = ["vendorVAT", "vendor2VAT", "vendor3VAT", "vendor4VAT"];

  //     const vendorAmounts = omrKeys
  //       .map((omrKey, idx) => {
  //         const omr =
  //           typeof service[omrKey] === "number"
  //             ? service[omrKey]
  //             : parseFloat(service[omrKey]) || 0;
  //         const vat =
  //           typeof service[vatKeys[idx]] === "number"
  //             ? service[vatKeys[idx]]
  //             : parseFloat(service[vatKeys[idx]]) || 0;
  //         if (vendorNames[idx]) {
  //           return `OMR ${(omr + vat).toFixed(3)}`;
  //         }
  //         return null;
  //       })
  //       .filter((v, idx) => vendorNames[idx]);

  //     const vendorNamesDisplay =
  //       vendorNames.length > 1
  //         ? vendorNames.map((name, idx) => `${idx + 1}. ${name}`).join("\n")
  //         : vendorNames[0] || "";

  //     const vendorAmountsDisplay =
  //       vendorAmounts.length > 1
  //         ? vendorAmounts.map((amt, idx) => `${idx + 1}. ${amt}`).join("\n")
  //         : vendorAmounts[0] || "";

  //     const row = worksheet.addRow({
  //       sales: index === 0 ? `Invoice No : ${invoiceId}` : "",
  //       customerAmount: `OMR ${(
  //         service.customerOMR + service.customerVAT
  //       ).toFixed(3)}`,
  //       purchase: vendorNamesDisplay,
  //       vendorAmount: vendorAmountsDisplay,
  //     });

  //     // Center align + wrap for all cells
  //     row.eachCell((cell) => {
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

  //     // Adjust row height based on multi-line content in Purchase / Vendor Amount
  //     const purchaseLines = (vendorNamesDisplay || "")
  //       .toString()
  //       .split("\n").length;
  //     const vendorAmountLines = (vendorAmountsDisplay || "")
  //       .toString()
  //       .split("\n").length;
  //     const maxLines = Math.max(purchaseLines, vendorAmountLines);
  //     if (maxLines > 1) {
  //       row.height = Math.max(18, maxLines * 15);
  //     }
  //   });

  //   // Totals row
  //   const totalRow = worksheet.addRow({
  //     sales: "Total Amount",
  //     customerAmount: `OMR ${totalCustomerAmount.toFixed(3)}`,
  //     purchase: "Total Amount",
  //     vendorAmount: `OMR ${totalVendorAmount.toFixed(3)}`,
  //   });
  //   totalRow.eachCell((cell) => {
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
  //   });

  //   // Profit/Loss row
  //   const profitLossRow = worksheet.addRow({
  //     sales: "",
  //     customerAmount: "",
  //     purchase: profitOrLoss >= 0 ? "Profit" : "Loss",
  //     vendorAmount: `OMR ${Number(profitOrLoss).toFixed(3)}`,
  //   });
  //   profitLossRow.eachCell((cell, colNumber) => {
  //     const isValueCell = colNumber === 3 || colNumber === 4;
  //     cell.font = isValueCell ? { bold: true } : {};
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
  //   });

  //   // Auto-size columns based on content (clamped)
  //   const headers = worksheet.getRow(1).values.slice(1); // ExcelJS row.values is 1-based
  //   const minWidth = 15;
  //   const maxWidth = 60;

  //   headers.forEach((h, i) => {
  //     let maxLen = (h || "").toString().length;

  //     worksheet.eachRow((row, rowNumber) => {
  //       if (rowNumber === 1) return; // skip header counted
  //       const val = row.getCell(i + 1).value;
  //       const text =
  //         val == null
  //           ? ""
  //           : typeof val === "object" && val.richText
  //           ? val.richText.map((r) => r.text).join("")
  //           : String(val);
  //       if (text.length > maxLen) maxLen = text.length;
  //     });

  //     const width = Math.max(minWidth, Math.min(maxWidth, maxLen + 2));
  //     worksheet.getColumn(i + 1).width = width;
  //   });

  //   // Nudge Sales and Purchase wider for readability
  //   worksheet.getColumn(1).width = Math.max(
  //     worksheet.getColumn(1).width || 0,
  //     22
  //   );
  //   worksheet.getColumn(3).width = Math.max(
  //     worksheet.getColumn(3).width || 0,
  //     30
  //   );

  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   saveAs(blob, "Cost Center Breakup Report.xlsx");
  // };
  const createNewExcel = async () => {
    if (!services || services.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Cost Center Breakup Report", {
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
    saveAs(blob, "Cost Center Breakup Report.xlsx");
  };
  return (
    <>
      <div className="p-2 costcenter-breakup">
        <div className="row g-3 mt-3 mb-3">
          <div className=" col-md-3 col-12 d-flex align-items-center">
            <label
              htmlFor="input"
              className="col-form-label costcenterinput job-no-size"
            >
              Job No:
            </label>

            <select
              className="form-select jobvcostcentre"
              aria-label="Small select example"
              name="jobNo"
              onChange={handleSelectChange}
              value={selectedJobNo}
            >
              <option value="">Select Job No.</option>
              {jobIdList?.map((job) => (
                <option key={job?._id} value={job?._id}>
                  {job?.jobId}
                </option>
              ))}
            </select>
          </div>
          {vesselName && (
            <>
              <div className="col-md-3 col-12 d-flex align-items-center ">
                <label
                  htmlFor="input"
                  className=" col-3 col-form-label costcenterinput vessel-new-size"
                >
                  Vessel Name:
                </label>

                <input
                  type="text"
                  id="inputPassword6"
                  className="form-control costcenterfontsize"
                  placeholder=""
                  readOnly
                  value={vesselName}
                ></input>
              </div>
            </>
          )}
          {portName && (
            <>
              <>
                <div className=" col-md-3 col-12  d-flex align-items-center ">
                  <label
                    htmlFor="input"
                    className=" col-2 form-label costcenterport vessel-new-size"
                  >
                    Port Name:
                  </label>

                  <input
                    type="text"
                    id="inputPassword6"
                    className="form-control costcenterfontsize"
                    placeholder=""
                    readOnly
                    value={portName}
                  ></input>
                </div>
              </>
              <>
                <div className=" col-md-3 col-12 d-flex align-items-center gap-2 ">
                  <button
                    className="btn btn-info filbtnjobccbrkup"
                    onClick={() => {
                      getPDF();
                    }}
                  >
                    Download PDF
                  </button>
                  <button
                    className="btn btn-info filbtnjobccbrkup"
                    onClick={createNewExcel}
                  >
                    Download Excel
                  </button>
                </div>
              </>
            </>
          )}
        </div>
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        {/* {selectedJobNo && (
          <>
            <div className=" p-3">
              <table className="table tablepay">
                <thead className="">
                  <tr className="createtable">
                    <th className=" paytexthead marginpay">SALES </th>
                    <th className="paytexthead marginpay ">AMOUNT</th>
                    <th className="paytexthead marginpay">PURCHASE</th>
                    <th className="paytexthead marginpay ">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={service._id}>
                      <td className="paytexthead marginpay">
                        {index === 0 ? invoiceId : ""}
                      </td>
                      <td className="paytexthead marginpay">
                        OMR{" "}
                        {(service.customerOMR + service.customerVAT).toFixed(2)}
                      </td>
                      <td className="paytexthead marginpay">
                        {service.vendorId.vendorName}
                      </td>
                      <td className="paytexthead marginpay">
                        OMR {(service.vendorOMR + service.vendorVAT).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bold-row">
                    <td className="paytexthead marginpay resultpay">
                      Total Customer Amount
                    </td>
                    <td className="paytexthead marginpay resultpay">
                      OMR{" "}
                      {services
                        .reduce(
                          (sum, s) => sum + s.customerOMR + s.customerVAT,
                          0
                        )
                        .toFixed(2)}
                    </td>
                    <td className="paytexthead marginpay resultpay">
                      Total Vendor Amount
                    </td>
                    <td className="paytexthead marginpay resultpay">
                      OMR{" "}
                      {services
                        .reduce((sum, s) => sum + s.vendorOMR + s.vendorVAT, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bold-row">
                    <td className="text-center"></td>
                    <td className="text-center"></td>
                    <td
                      className={`paytexthead marginpay resultpay ${
                        profitOrLoss >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {profitOrLoss >= 0 ? "Profit" : "Loss"}
                    </td>
                    <td
                      className={`paytexthead marginpay resultpay ${
                        profitOrLoss >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      OMR {profitOrLoss.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )} */}
        {selectedJobNo && (
          <>
            <DataGrid
              rows={rows}
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
              hideFooter={false} // Ensure footer is visible
              // pagination
              // paginationMode="client" // Enable client-side pagination
              // autoPageSize={false} // Prevents automatic page size
              // pageSizeOptions={[5, 10, 20, 50, 100]} // Defines available page sizes
              // initialState={{
              //   pagination: {
              //     paginationModel: {
              //       pageSize: 10, // Default page size
              //       page: 0, // Default page index
              //     },
              //   },
              // }}
              getRowClassName={(params) => {
                // Assign all relevant classes for summary rows
                let classNames = [];
                if (params.row.isFooter) classNames.push("footer-row");
                if (params?.row?.vendorName === "Loss")
                  classNames.push("loss-row");
                if (params?.row?.vendorName === "Profit")
                  classNames.push("profit-row");
                return classNames.join(" ");
              }}
              // getRowHeight={() => 90} // <-- Add this line for fixed row height
              getRowHeight={() => "auto"}
              // ...existing code...
              // getRowHeight={(params) => {
              //   if (!params || !params.row) return 48; // Default height if row is undefined
              //   if (params.row.isFooter) return 48;
              //   const vendorLines = params.row.vendorName
              //     ? params.row.vendorName.split("\n").length
              //     : 1;
              //   return Math.max(48, vendorLines * 28);
              // }}
              // ...existing code...
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#eee !important", // Header background color
                  color: "#000 !important", // Header text color
                  fontWeight: "bold !important",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#eee !important", // Footer background matches header
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold !important",
                },
                "& .MuiDataGrid-cell": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                  fontSize: "14px !important",
                  paddingTop: "8px !important",
                  paddingBottom: "8px !important",
                },
                "& .MuiDataGrid-row": {
                  // height: "auto !important",
                  minHeight: "none !important",
                  maxHeight: "none !important",
                },

                // Footer Row Styling
                // "& .footer-row .MuiDataGrid-row": {
                //  maxHeight: "auto !important",
                //  minHeight: "auto !important",
                //  height: "auto !important",
                // },
                // Footer Row Styling
                "& .footer-row .MuiDataGrid-cell": {
                  fontWeight: "bold !important", // Make footer text bold
                  color: "#000 !important", // Ensure text is black
                },
                // Profit Row Styling (Green)
                "& .profit-row .MuiDataGrid-cell": {
                  color: "green !important",
                  fontWeight: "bold !important",
                },
                // Loss Row Styling (Red)
                "& .loss-row .MuiDataGrid-cell": {
                  color: "red !important",
                  fontWeight: "bold !important",
                },
                // Profit Row Styling (Green)
                "& .profit-row .MuiDataGrid-row": {
                  maxHeight: "110px !important",
                  minHeight: "110px !important",
                  height: "130px !important",
                },
                // Loss Row Styling (Red)
                "& .loss-row .MuiDataGrid-row": {
                  maxHeight: "110px !important",
                  minHeight: "110px !important",
                  height: "130px !important",
                },
                // ✅ Apply bold style **only** to "Total Customer Amount" & "Total Vendor Amount"
                "& .bold-label": {
                  color: "#000 !important",
                  fontWeight: "bold !important",
                  fontSize: "14px !important",
                },
                "& .MuiTablePagination-toolbar": {
                  alignItems: "baseline", // Apply align-items baseline
                },
              }}
            />
          </>
        )}

        {!selectedJobNo && (
          <>
            <p>Please select a job first</p>
          </>
        )}
      </div>
      <Loader isLoading={isLoading} />
    </>
  );
};

export default CostCenterBreakup;
