// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/reports/receivablesummary.css";
import {
  getReceivableSummaryReport,
  getAllJobIds,
  saveCustomerReportRemark,
  receivableSummaryReportPDF,
  receivableSummaryReportCustomer,
  receivableSummaryReportCustomerPDF,
} from "../../services/apiService";
import Remarks from "../Remarks";
import PopUp from "../PopUp";
import Loader from "../Loader";
import { DataGrid } from "@mui/x-data-grid";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { Box, Typography } from "@mui/material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const ReceivableSummary = () => {
  const [reportList, setReportList] = useState([]);
  const [jobIdList, setJobIdList] = useState([]);
  const [selectedJobNo, setSelectedJobNo] = useState("");
  const Group = require("../../assets/images/reporttttt.png");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state

  // const getAllJobIDS = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await getAllJobIds({ report: true });
  //     setJobIdList(response?.jobs);
  //     console.log("getPettyCashReport", response);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Failed to fetch quotations:", error);
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   getAllJobIDS();
  // }, []);

  // const getReport = async () => {
  //   let payload = {
  //     pdaId: selectedJobNo,
  //   };
  //   setIsLoading(true);
  //   try {
  //     const response = await getReceivableSummaryReport(payload);
  //     setReportList(response?.summary);
  //     console.log("getPettyCashReport", response);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Failed to fetch quotations:", error);
  //     setIsLoading(false);
  //   }
  // };
  const getReport = async () => {
    let payload = {
      pdaId: "",
    };
    setIsLoading(true);
    try {
      const response = await getReceivableSummaryReport(payload);
      setReportList(response?.summary);
      console.log("getPettyCashReport", response);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    } finally {
    }
  };

  useEffect(() => {
    getReport();
  }, []);

  // useEffect(() => {
  //   console.log(selectedJobNo, "selectedJobNo");
  //   if (selectedJobNo) {
  //     getReport();
  //   }
  // }, [selectedJobNo]);

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

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedRemarkAction, setSelectedRemarkAction] = useState(null);

  const handleAdd = (remark, type) => {
    setSelectedRemarkAction(type);
    setSelectedReport(remark);
    if (type == "delete") {
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
          if (remark?.customer[0]?._id) {
            let pdaPayload = {
              customerId: remark?.customer[0]?._id,
              remark: "",
            };
            setIsLoading(true);
            try {
              // alert(remark?.customer[0]?._id);
              const response = await saveCustomerReportRemark(pdaPayload);
              console.log(response, "elete_response");
              if (response?.status == true) {
                setIsLoading(false);
                setMessage("Remarks have been deleted");
                setOpenPopUp(true);
                setRemarksOpen(false);
                getReport();
              } else {
                setIsLoading(false);
                setMessage("Failed please try again");
                setOpenPopUp(true);
                setRemarksOpen(false);
                getReport();
              }
            } catch (error) {
              setIsLoading(false);
              setMessage("Failed please try again");
              setOpenPopUp(true);
              setRemarksOpen(false);
              getReport();
            } finally {
              setIsLoading(false);
            }
          }
        }
      });
    } else {
      handleRemarksOpen();
    }
  };

  const [remarksOpen, setRemarksOpen] = useState(false);

  const handleRemarksOpen = () => {
    setRemarksOpen(true);
  };

  const handleRemarksClose = () => {
    setRemarksOpen(false);
  };

  useEffect(() => {
    console.log(selectedRemarkAction, "selectedRemarkAction");
  }, [selectedRemarkAction]);

  const handleRemarksSubmit = async (remark) => {
    console.log(remark, "handleRemarksSubmit");

    if (selectedReport?.customer[0]?._id) {
      let pdaPayload = {
        customerId: selectedReport?.customer[0]?._id,
        remark: remark,
      };
      setIsLoading(true);
      try {
        const response = await saveCustomerReportRemark(pdaPayload);
        console.log(response, "login_response");
        if (response?.status == true) {
          setIsLoading(false);
          if (selectedRemarkAction == "add") {
            setMessage("Remarks have been added");
          } else if (selectedRemarkAction == "edit") {
            setMessage("Remarks have been updated");
          } else if (selectedRemarkAction == "delete") {
            setMessage("Remarks have been deleted");
          }

          setOpenPopUp(true);
          setRemarksOpen(false);
          getReport();
        } else {
          setIsLoading(false);
          setMessage("Failed please try again");
          setOpenPopUp(true);
          setRemarksOpen(false);
          getReport();
        }
      } catch (error) {
        setIsLoading(false);
        setMessage("Failed please try again");
        setOpenPopUp(true);
        setRemarksOpen(false);
        getReport();
      } finally {
        setIsLoading(false);
      }
    } else {
      setMessage("Only valid customers can add remarks");
      setOpenPopUp(true);
    }
  };
  useEffect(() => {
    console.log(reportList, "reportList");
    console.log(selectedReport, "selectedReport");
  }, [reportList, selectedReport]);

  const rows = reportList.map((report, index) => {
    const customer = report.customer.length > 0 ? report.customer[0] : null;
    let totalAmount = Number(report.totalAmountOMR) || 0;
    let paidAmount = Number(report.paidOMR) || 0;
    const amountOMR = (totalAmount - paidAmount).toFixed(3);
    const remark = customer ? customer.reportRemark : "";
    const remarkDate =
      remark && customer?.remarkDate
        ? new Date(customer.remarkDate).toLocaleDateString("en-GB")
        : "N/A";

    return {
      id: index,
      customerName: customer ? customer.customerName : "-",
      amountOMR: `OMR ${amountOMR}`,
      remark: remark,
      remarkDate: remarkDate,
      report: report,
      action: report,
    };
  });

  const columns = [
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 2, // Takes up remaining space
    },
    {
      field: "amountOMR",
      headerName: `Amount in OMR`,
      flex: 2, // Takes up remaining space
    },
    {
      field: "remark",
      headerName: "Status/ Remarks",
      flex: 2, // Takes up more space
      renderCell: (params) => {
        const remark = params.value;
        return <div>{remark ? remark : "N/A"}</div>;
      },
    },
    {
      field: "remarkDate",
      headerName: "Remark Date",
      flex: 2, // Takes up more space
      renderCell: (params) => {
        console.log(params, "params_remarkDate");
        const remark = params.value;
        console.log(remark, "remark_ss");
        const remarkDate = params?.row?.remarkDate;
        return <div>{remark ? remarkDate || "N/A" : "N/A"}</div>;
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 2, // Takes up more space
      renderCell: (params) => {
        console.log(params, "params100");
        const remark = params.row.remark;
        const report = params.row.report;
        return (
          <>
            <div>
              {remark ? (
                <>
                  <span className="actionpay">
                    <i
                      className="bi bi-pencil-square editicon"
                      onClick={() => handleAdd(report, "edit")}
                    ></i>
                    <i
                      className="bi bi-trash editicon deleteicon"
                      onClick={() => handleAdd(report, "delete")}
                    ></i>
                  </span>
                </>
              ) : (
                <button
                  type="submit"
                  className="btn btn-info paybtn w-20"
                  onClick={() => handleAdd(report, "add")}
                >
                  Add Remarks
                </button>
              )}
            </div>
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
        );
      },
    },
  ];

  const getRowPDF = async (rowData) => {
    console.log(rowData, "rowData_getRowPDF");
    let payload = {
      customerId: rowData?.action?.customer[0]?._id,
      customerName: rowData?.action?.customer[0]?.customerName,
    };
    console.log(payload, "payload_getReport");
    setIsLoading(true);
    try {
      const response = await receivableSummaryReportCustomerPDF(payload);
      console.log("receivableSummaryReportCustomerPDF", response);
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
        link.setAttribute("download", "Receivable Summary Details.pdf"); // Set the file name
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
      customerId: rowData?.action?.customer[0]?._id,
      customerName: rowData?.action?.customer[0]?.customerName,
    };
    console.log(payload, "payload_getReport");
    setIsLoading(true);

    try {
      const response = await receivableSummaryReportCustomer(payload);
      console.log("receivableSummaryReportCustomer", response?.report);

      // Check if response has data
      if (!response?.report || response.report.length === 0) {
        setIsLoading(false);
        return;
      }

      // Prepare Excel data
      const excelData = response.report.map((item) => ({
        "Quotation Number": item.pdaNumber || "N/A",
        "Job No": item.jobId || "N/A",
        "Invoice No": item.invoiceId || "N/A",
        "Vessel Name": item.vesselName || "N/A",
        "Port Name": item.portName || "N/A",
        Arrived: item.eta
          ? new Date(item.eta).toLocaleDateString("en-GB")
          : "N/A",
        Departed: item.etd
          ? new Date(item.etd).toLocaleDateString("en-GB")
          : "N/A",
        "Total OMR": Number(item.totalInvoiceAmount || 0).toFixed(3),
        "Paid OMR": Number(item.paidAmount || 0).toFixed(3),
        Discount: Number(item.discoutAmount || 0).toFixed(3),
        "Balance Overdue OMR": Number(item.balanceDue || 0).toFixed(3),
      }));

      // Calculate totals
      const totals = response.report.reduce(
        (acc, item) => {
          acc.totalInvoice += Number(item.totalInvoiceAmount || 0);
          acc.totalPaid += Number(item.paidAmount || 0);
          acc.totalDiscount += Number(item.discoutAmount || 0);
          acc.totalBalance += Number(item.balanceDue || 0);
          return acc;
        },
        { totalInvoice: 0, totalPaid: 0, totalDiscount: 0, totalBalance: 0 }
      );

      // Add totals row
      excelData.push({
        "Quotation Number": "",
        "Job No": "",
        "Invoice No": "",
        "Vessel Name": "",
        "Port Name": "",
        Arrived: "",
        Departed: "Total:",
        "Total OMR": totals.totalInvoice.toFixed(3),
        "Paid OMR": totals.totalPaid.toFixed(3),
        Discount: totals.totalDiscount.toFixed(3),
        "Balance Overdue OMR": Number(response?.totalBalanceDue || 0).toFixed(
          3
        ),
      });

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Receivable Summary Details", {
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

      // Add data rows
      excelData.forEach((row, index) => {
        const r = worksheet.addRow(headers.map((h) => row[h]));
        r.eachCell((cell) => {
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Make totals row bold
        if (index === excelData.length - 1) {
          r.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFEFEFEF" },
            };
          });
        }
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
        worksheet.getColumn(i + 1).width = Math.max(
          15,
          Math.min(maxLen + 5, 50)
        );
      });

      // Download Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `Receivable Summary Details`;
      saveAs(blob, fileName);

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to download customer report:", error);
      setIsLoading(false);
    }
  };
  const totalReceivable = reportList.reduce((sum, r) => {
    const totalAmount = Number(r.totalAmountOMR) || 0;
    const paidAmount = Number(r.paidOMR) || 0;
    return sum + (totalAmount - paidAmount);
  }, 0);
  const totalReceivableFormatted = Number(totalReceivable).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );

  const getPDF = async () => {
    let payload = {
      pdaId: selectedJobNo,
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await receivableSummaryReportPDF(payload);
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
        link.setAttribute("download", "Receivable Summary Report.pdf"); // Set the file name
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

  // Create Excel for Receivable Summary
  // const createExcel = () => {
  //   if (!reportList || reportList.length === 0) return;
  //   const excelData = reportList.map((report) => {
  //     const customer = report.customer.length > 0 ? report.customer[0] : null;
  //     const amountOMR = (report.totalAmountOMR - report.paidOMR).toFixed(3);
  //     const remark = customer ? customer.reportRemark : "";
  //     const remarkDate =
  //       remark && customer?.remarkDate
  //         ? new Date(customer.remarkDate).toLocaleDateString("en-GB")
  //         : "N/A";
  //     return {
  //       "Customer Name": customer ? customer.customerName : "-",
  //       "Amount in OMR": `OMR ${amountOMR}`,
  //       "Status/ Remarks": remark || "N/A",
  //       "Remark Date": remark ? remarkDate : "N/A",
  //     };
  //   });
  //   // Add totals row in the last row, column 3 and 4
  //   const totalReceivableFormatted = Number(totalReceivable).toLocaleString(
  //     undefined,
  //     { minimumFractionDigits: 3, maximumFractionDigits: 3 }
  //   );
  //   excelData.push({
  //     "Customer Name": "",
  //     "Amount in OMR": "",
  //     "Status/ Remarks": "Total Receivable:",
  //     "Remark Date": totalReceivableFormatted,
  //   });
  //   // Re-create worksheet and workbook with the totals row
  //   const XLSX = require("xlsx");
  //   const worksheet = XLSX.utils.json_to_sheet(excelData);
  //   worksheet["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 30 }, { wch: 18 }];
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "ReceivableSummary");
  //   XLSX.writeFile(workbook, "Receivable Summary Report.xlsx");
  // };

  const createExcel = async () => {
    if (!reportList || reportList.length === 0) return;

    // Build rows
    const rowsData = reportList.map((report) => {
      const customer = report.customer.length > 0 ? report.customer[0] : null;
      const amountOMR =
        typeof report.totalAmountOMR === "number" &&
        typeof report.paidOMR === "number"
          ? (report.totalAmountOMR - report.paidOMR).toFixed(3)
          : "0.000";
      const remark = customer ? customer.reportRemark : "";
      const remarkDate =
        remark && customer?.remarkDate
          ? new Date(customer.remarkDate).toLocaleDateString("en-GB")
          : "N/A";
      return {
        "Customer Name": customer ? customer.customerName : "-",
        "Amount in OMR": `OMR ${amountOMR}`,
        "Status/ Remarks": remark || "N/A",
        "Remark Date": remark ? remarkDate : "N/A",
      };
    });

    // Totals row
    const totalReceivableFormatted = Number(totalReceivable).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }
    );
    rowsData.push({
      "Customer Name": "",
      "Amount in OMR": "",
      "Status/ Remarks": "Total Receivable:",
      "Remark Date": totalReceivableFormatted,
    });

    const headers = Object.keys(rowsData[0] || {});
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Receivable Summary", {
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

      // Increase row height if remarks are multiline
      const remarkLines = (row["Status/ Remarks"] || "")
        .toString()
        .split("\n").length;
      if (remarkLines > 1) {
        r.height = Math.max(18, remarkLines * 15);
      }
    });

    // Auto-size columns (clamped)
    const minWidth = 15;
    const maxWidth = 120;
    // Replace lines 507-520 with this completely dynamic approach:
    headers.forEach((h, i) => {
      let maxLen = (h || "").toString().length;

      // Find the longest content in this column
      rowsData.forEach((row) => {
        const val = row[h];
        if (val != null) {
          const content = val.toString();
          // Consider line breaks and calculate effective display length
          const lines = content.split("\n");
          const longestLine = Math.max(...lines.map((line) => line.length));
          if (longestLine > maxLen) maxLen = longestLine;
        }
      });

      // Dynamic width calculation with no arbitrary limits
      let width = Math.max(15, maxLen + 5); // Minimum 15, plus 5 for padding

      // Apply reasonable maximum to prevent extremely wide columns
      if (width > 200) {
        width = 200; // Cap at 200 for very long content
      }

      worksheet.getColumn(i + 1).width = width;
    });

    // Replace lines 521-524 with this improved row height logic:
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Header row
        row.height = 30;
      } else {
        // Calculate row height based on content length and wrapping
        let maxHeight = 20; // Minimum row height

        row.eachCell((cell) => {
          if (cell.value) {
            const content = cell.value.toString();
            const columnWidth = worksheet.getColumn(cell.col).width || 20;

            // Estimate lines needed based on content length and column width
            const estimatedLines = Math.ceil(
              content.length / (columnWidth * 0.8)
            );
            const cellHeight = Math.max(20, estimatedLines * 15);

            if (cellHeight > maxHeight) {
              maxHeight = cellHeight;
            }
          }
        });

        row.height = Math.min(maxHeight, 150); // Cap at 150 to prevent extremely tall rows
      }
    });
    // Ensure key columns are comfortably wide
    worksheet.getColumn(1).width = Math.max(
      worksheet.getColumn(1).width || 0,
      25
    ); // Customer Name
    worksheet.getColumn(3).width = Math.max(
      worksheet.getColumn(3).width || 0,
      30
    ); // Status/ Remarks

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Receivable Summary Report.xlsx");
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
      <Typography>No reports are available for the specified terms</Typography>
    </Box>
  );

  return (
    <>
      <div className="p-2">
        {/* <div className="d-flex mt-3">
          <div className="d-flex align-items-center">
            <div className="col-">
              <label htmlFor="input" className="col-form-label costcenterinput">
                Job No:
              </label>
            </div>
            <div className="col-8">
              <select
                className="form-select vesselbox statusscustomer"
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
          </div>
        </div> */}
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        {/* <div>
          <div className="col-md-3 col-12">
            <button className="btn btn-info filbtnjobmd">Download PDF</button>
          </div>
          <div className="col-md-3 col-12">
            <button className="btn btn-info filbtnjobmd">Download Excel</button>
          </div>
        </div> */}
        <div className=" mt-3 container-fluid">
          <div className="row d-flex justify-content-end">
            <div className="col-md-3 col-12 d-flex gap-2 co ">
              <button
                className="btn btn-info filbtnjobreceivable"
                onClick={() => {
                  getPDF();
                }}
              >
                Download PDF
              </button>
              <button
                className="btn btn-info filbtnjobreceivable"
                onClick={createExcel}
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>

        <div className=" p-3">
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              minHeight: 350,
            }}
          >
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
              getRowId={(row) => row.id}
              components={{
                NoRowsOverlay,
              }}
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#eee !important",
                  color: "#000000",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-cell": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                "& .MuiTablePagination-toolbar": {
                  alignItems: "baseline",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#eee",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                  textOverflow: "ellipsis",
                },
              }}
              pagination
              pageSizeOptions={[5, 10, 20, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                    page: 0,
                  },
                },
              }}
            />
          </div>
        </div>
        {rows?.length == 0 && (
          <>
            <div className="no-data">
              <p>No reports are available for the specified terms</p>
            </div>
          </>
        )}
        <div className="total-receivable-card">
          <div className="total-receivable-content">
            <span className="label">Total Receivables:</span>
            <span className="amount">OMR {totalReceivableFormatted}</span>
          </div>
        </div>
      </div>
      <Remarks
        open={remarksOpen}
        onClose={handleRemarksClose}
        onRemarksSubmit={handleRemarksSubmit}
        isReadOnly={false}
        selectedReport={selectedReport}
      />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default ReceivableSummary;
