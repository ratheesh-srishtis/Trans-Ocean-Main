// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/reports/costcentersummary.css";
import {
  getCostCentreSummaryReport,
  costCentreSummaryReportPDF,
} from "../../services/apiService";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
const CostCenterSummary = ({ ports, customers }) => {
  const [reportList, setReportList] = useState([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const Group = require("../../assets/images/reporttttt.png");

  useEffect(() => {
    getReport();
  }, []);

  // const filteredReports = reportList?.filter((item) => {
  //   const matchedPort = !selectedPort || item.employee[0]?._id === selectedPort;
  //   return matchedPort;
  // });

  const columns = [
    { field: "jobId", headerName: "Job No", flex: 1 },
    { field: "sales", headerName: "Sales", flex: 1 },
    { field: "purchase", headerName: "Purchase", flex: 1 },
    { field: "profitOrLoss", headerName: "Profit (or Loss)", flex: 1 },
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
    // If switching to yearly, fetch report immediately
    if (newFilterType === "year") {
      setSelectedMonth(""); // Optionally clear month
      getReport();
    }
    // If switching to monthly, fetch report immediately
    if (newFilterType === "month") {
      setSelectedYear(new Date().getFullYear()); // Optionally reset year
      getReport();
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
    try {
      const response = await getCostCentreSummaryReport(payload);
      if (response?.status == true) {
        setReportList(response?.report);
      } else if (response?.status == false) {
        setReportList([]);
      }
      console.log("getPettyCashReport", response);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    getReport();
  }, [selectedCustomer, selectedMonth, selectedYear, selectedPort]);

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
  const createExcel = () => {
    if (!reportList || reportList.length === 0) return;
    const excelData = reportList.map((item) => ({
      "Job No": item?.jobId || "N/A",
      Sales: item?.sales?.toFixed(3) ?? "N/A",
      Purchase: item?.purchase?.toFixed(3) ?? "N/A",
      "Profit (or Loss)":
        item?.sales && item?.purchase
          ? (item.sales - item.purchase).toFixed(3)
          : "N/A",
    }));
    // Add totals row
    /*
    const totalSales = reportList
      .reduce((sum, item) => sum + (item.sales || 0), 0)
      .toFixed(3);
    const totalPurchase = reportList
      .reduce((sum, item) => sum + (item.purchase || 0), 0)
      .toFixed(3);
    const totalProfit = reportList
      .reduce(
        (sum, item) => sum + ((item.sales || 0) - (item.purchase || 0)),
        0
      )
      .toFixed(3);
    excelData.push({
      "Job No": "Total",
      Sales: totalSales,
      Purchase: totalPurchase,
      "Profit (or Loss)": totalProfit,
    });
    */
    // Create worksheet and workbook
    const XLSX = require("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CostCenterSummary");
    XLSX.writeFile(workbook, "Cost Center Summary Report.xlsx");
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
            <div className="col-3 filtermainpetty ">
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
                          id: index,
                          jobId: item?.jobId,
                          sales: item?.sales.toFixed(3) || "N/A", // Ensure employee is a string
                          purchase: item.purchase.toFixed(3) ?? "N/A",
                          profitOrLoss:
                            item?.sales && item?.purchase
                              ? (item.sales - item.purchase).toFixed(3)
                              : "N/A",
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
    </>
  );
};

export default CostCenterSummary;
