// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/reports/receivablesummary.css";
import {
  getAllJobIds,
  getPayableSummaryReport,
  saveVendorReportRemark,
  payableSummaryReportPDF,
} from "../../services/apiService";
import Remarks from "../Remarks";
import PopUp from "../PopUp";
import Loader from "../Loader";
import { DataGrid } from "@mui/x-data-grid";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { Box, Typography } from "@mui/material";
const PayableSummary = () => {
  const Group = require("../../assets/images/reporttttt.png");

  const [reportList, setReportList] = useState([]);
  const [jobIdList, setJobIdList] = useState([]);
  const [selectedJobNo, setSelectedJobNo] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
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

  const getReport = async () => {
    let payload = {
      pdaId: selectedJobNo,
    };
    setIsLoading(true);

    try {
      setIsLoading(false);

      const response = await getPayableSummaryReport(payload);
      setReportList(response?.report);
      console.log("getReport", response);
    } catch (error) {
      setIsLoading(false);

      console.error("Failed to fetch quotations:", error);
    }
  };
  useEffect(() => {
    console.log(selectedJobNo, "selectedJobNo");
    if (selectedJobNo) {
      getReport();
    }
  }, [selectedJobNo]);
  useEffect(() => {
    getReport();
  }, []);

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
    console.log(reportList, "reportList");
  }, [reportList]);

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
          if (selectedReport?.vendorId) {
            let pdaPayload = {
              vendorId: remark?.vendorId,
              remark: "",
            };
            setIsLoading(true);
            try {
              // alert(remark?.vendorId);
              console.log(pdaPayload, "pdaPayload_payableremark_delete");
              const response = await saveVendorReportRemark(pdaPayload);
              console.log(response, "login_response");
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

  const handleRemarksSubmit = async (remark) => {
    console.log(remark, "handleRemarksSubmit");
    console.log(
      selectedRemarkAction,
      "selectedRemarkAction_handleRemarksSubmit"
    );

    if (selectedReport?.vendorId) {
      let pdaPayload = {
        vendorId: selectedReport?.vendorId,
        remark: remark,
      };
      setIsLoading(true);
      try {
        const response = await saveVendorReportRemark(pdaPayload);
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
    console.log(selectedRemarkAction, "selectedRemarkAction");
  }, [selectedRemarkAction]);

  const totalPayable = reportList
    ?.reduce((sum, r) => sum + (r.totalInvoiceAmount - r.paidAmount), 0)
    .toFixed(3);
  const rows = [
    ...reportList?.map((report, index) => {
      const vendorName = report?.vendorName ? report?.vendorName : "";
      const amountOMR = (report.totalInvoiceAmount - report.paidAmount).toFixed(
        3
      );
      const remark = report ? report.remark : "";

      const remarkDate =
        remark && report?.remarkDate
          ? new Date(report?.remarkDate).toLocaleDateString("en-GB")
          : "N/A";

      return {
        id: index,
        vendorName: vendorName ? vendorName : "-",
        amountOMR: `OMR ${amountOMR}`,
        remark: remark,
        remarkDate: remarkDate,
        report: report,
        action: report,
      };
    }),
  ];

  const columns = [
    {
      field: "vendorName",
      headerName: "Vendor Name",
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
        const remarkDate = params?.row?.remarkDate;
        return <div>{remarkDate ? remarkDate : "N/A"}</div>;
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
        );
      },
    },
  ];

  const getPDF = async () => {
    let payload = {
      pdaId: selectedJobNo,
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await payableSummaryReportPDF(payload);
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
        link.setAttribute("download", "Payable Summary Report.pdf"); // Set the file name
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

  // Create Excel for Payable Summary
  const createExcel = () => {
    if (!reportList || reportList?.length === 0) return;
    const excelData = reportList?.map((report) => {
      const vendorName = report?.vendorName ? report?.vendorName : "-";
      const amountOMR = (report.totalInvoiceAmount - report.paidAmount).toFixed(
        3
      );
      const remark = report ? report.remark : "";
      const remarkDate =
        remark && report?.remarkDate
          ? new Date(report?.remarkDate).toLocaleDateString("en-GB")
          : "N/A";
      return {
        "Vendor Name": vendorName,
        "Amount in OMR": `Amount In OMR ${amountOMR}`,
        "Status/ Remarks": remark || "N/A",
        "Remark Date": remark ? remarkDate : "N/A",
      };
    });
    // Add totals row in the last row, column 3 and 4
    excelData.push({
      "Vendor Name": "",
      "Amount in OMR": "",
      "Status/ Remarks": "Total Payable:",
      "Remark Date": totalPayable,
    });
    // Re-create worksheet and workbook with the totals row
    const XLSX = require("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 30 }, { wch: 18 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PayableSummary");
    XLSX.writeFile(workbook, "Payable Summary Report.xlsx");
  };

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
        <div className=" mt-3">
          <div className="row d-flex justify-content-end">
            <div className=" col-md-3 col-12 d-flex justify-content-end  gap-2 ">
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
            {/* Footer Row */}
          </div>
        </div>
        {rows?.length == 0 && (
          <>
            <div className="no-data">
              <p>No reports are available for the specified terms</p>
            </div>
          </>
        )}
        <div className="total-receivable-card mb-4">
          <div className="total-receivable-content">
            <span className="label">Total Payables:</span>
            <span className="amount">OMR {totalPayable}</span>
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

export default PayableSummary;
