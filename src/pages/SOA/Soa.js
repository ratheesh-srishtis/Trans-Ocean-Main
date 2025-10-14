import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
//import jsPDF from 'jspdf';
//import 'jspdf-autotable';
import { saveAs } from "file-saver";
import { getSOA, generateSoaPDF } from "../../services/apiSoa";
import { getAllCustomers } from "../../services/apiSettings";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import "../../css/soa.css";
const Soa = ({}) => {
  // Importing the Group image
  const Group = require("../../assets/images/soa.png");
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomerid, setSelectedCustomerid] = useState("");
  const [soaList, setsoaList] = useState([]);
  const [period, setPeriod] = useState("");
  const [FilterName, setFilterName] = useState("");
  const [FilterValue, setFilterValue] = useState("");
  const [listpayload, setPayload] = useState("");
  const [showAED, setShowAED] = useState(false);
  const fetchSoa = async (payload) => {
    try {
      const soaDetails = await getSOA(payload);
      setsoaList(soaDetails?.pda || []);
    } catch (error) {
      console.log("Cannot fecth customer", error);
    }
  };

  const fetchCustomerList = async () => {
    try {
      const listcustomers = await getAllCustomers();
      setCustomerList(listcustomers?.customers || []);
    } catch (error) {
      console.log("Cannot fecth customer", error);
    }
  };

  const exportToPdf = async () => {
    try {
      const pdfPayload = { ...listpayload, hasAED: showAED };
      const pdfreport = await generateSoaPDF(pdfPayload);
      const fileUrl = process.env.REACT_APP_ASSET_URL + "/" + pdfreport.pdfPath;

      const fileName = "SOA.pdf";
      // Fetch the file and save it
      fetch(fileUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          if (blob.type !== "application/pdf") {
            throw new Error("File is not a PDF");
          }
          saveAs(blob, fileName);
        })
        .catch((error) => console.error("Download error:", error));
    } catch (error) {
      console.log("Cannot generate pdf", error);
    }
  };

  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the soaList data to a worksheet format
    const worksheetData = soaList.map((item) => {
      const dateOnly = item.invoiceSentAt
        ? item.invoiceSentAt.split("T")[0]
        : "N/A";
      let formatted_Date = "";
      if (dateOnly !== "N/A") {
        const [year, month, day] = dateOnly.split("-");
        formatted_Date = `${day}-${month}-${year}`;
      }

      let daysDue;
      if (item.invoiceSentAt) {
        const givenDate = new Date(item.invoiceSentAt);
        const currentDate = new Date();
        const differenceInMs = currentDate - givenDate;
        daysDue = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
      } else {
        daysDue = 0;
      }

      let balance =
        item.totalAmountOMR -
        (item.paidAmount || 0) -
        (item.discountAmount || 0);

      let balanceusd;
      balanceusd = (balance * 2.62).toFixed(2);

      let balanceAed;
      balanceAed = (balanceusd * 3.6725).toFixed(2);
      const baseRow = {
        "Quotation Number": item.pdaNumber || "N/A",
        "Invoice NO": item.invoiceId || "N/A",
        "FDA Date": formatted_Date || "N/A",
        "Customer Name": item.customerId ? item.customerId.customerName : "N/A",
        "Vessel Name": item.vesselId ? item.vesselId.vesselName : "N/A",
        "Port Name": item.portId ? item.portId.portName : "N/A",
        "Total OMR": item.totalAmountOMR
          ? item.totalAmountOMR.toFixed(3)
          : "N/A",
        "Paid OMR": item.paidAmount ? item.paidAmount.toFixed(3) : "N/A",

        Discount:
          item.discountAmount !== undefined ? item.discountAmount : "N/A",
        ["Balance Overview In OMR"]: balance.toFixed(3) || "N/A",
        "Total USD": (item.totalAmountOMR * 2.62)?.toFixed(3) || "N/A",
        "Balance Overview In USD": balanceusd || "N/A",
        "Days Overdue": daysDue.toString() || "N/A",
      };
      if (showAED) baseRow["Balance Overview In AED"] = balanceAed || "N/A";
      return baseRow;
    });

    // Calculate totals for the required columns
    const totalOMR = soaList
      .reduce((sum, item) => sum + (item.totalAmountOMR || 0), 0)
      .toFixed(3);
    const paidOMR = soaList
      .reduce((sum, item) => sum + (item.paidAmount || 0), 0)
      .toFixed(3);
    const discountTotal = soaList
      .reduce((sum, item) => sum + (item.discountAmount || 0), 0)
      .toFixed(3);
    const balanceOMR = soaList
      .reduce(
        (sum, item) =>
          sum +
          ((item.totalAmountOMR || 0) -
            (item.paidAmount || 0) -
            (item.discountAmount || 0)),
        0
      )
      .toFixed(3);

    const balanceUSD = soaList
      .reduce(
        (sum, item) =>
          sum +
          ((item.totalAmountOMR || 0) -
            (item.paidAmount || 0) -
            (item.discountAmount || 0)) *
            2.62,
        0
      )
      .toFixed(2);
    const balanceAED = soaList
      .reduce(
        (sum, item) =>
          sum +
          ((item.totalAmountOMR || 0) -
            (item.paidAmount || 0) -
            (item.discountAmount || 0)) *
            2.62 *
            3.6725,
        0
      )
      .toFixed(3);
    const totalUSD = soaList
      .reduce((sum, item) => sum + (item.totalAmountOMR || 0) * 2.62, 0)
      .toFixed(2);

    // Add totals row
    const totalsRow = {
      "Quotation Number": "Total",
      "Invoice NO": "",
      "FDA Date": "",
      "Customer Name": "",
      "Vessel Name": "",
      "Port Name": "",
      "Total OMR": totalOMR,
      "Paid OMR": paidOMR,
      Discount: discountTotal,

      ["Balance Overview In OMR"]: balanceOMR,
      "Total USD": totalUSD,
      "Balance Overview In USD": balanceUSD,
      "Days Overdue": "",
    };
    if (showAED) totalsRow["Balance Overview In AED"] = balanceAED;
    worksheetData.push(totalsRow);

    // Set the columns order and widths with proper sizing for all columns
    const columns = [
      { key: "Quotation Number", wch: 20 },
      { key: "Invoice NO", wch: 18 },
      { key: "FDA Date", wch: 12 },
      { key: "Customer Name", wch: 25 },
      { key: "Vessel Name", wch: 25 },
      { key: "Port Name", wch: 25 },
      { key: "Total OMR", wch: 15 },
      { key: "Paid OMR", wch: 15 },
      { key: "Discount", wch: 12 },
      {
        key: "Balance Overview In OMR",
        wch: 30,
      },
      { key: "Total USD", wch: 15 },
      { key: "Balance Overview In USD", wch: 30 },
    ];

    if (showAED) {
      columns.push({ key: "Balance Overview In AED", wch: 30 });
    }
    // Always add Days Overdue at the end
    columns.push({ key: "Days Overdue", wch: 18 });

    // Convert the data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
      header: columns.map((col) => col.key),
    });

    // Set column widths
    worksheet["!cols"] = columns.map((col) => ({ wch: col.wch }));

    // Add styling to headers - make them bold and add background color
    const headerRow = 1; // First row is headers
    columns.forEach((col, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EEEEEE" } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };
      }
    });

    // Style the totals row (last row)
    const totalRowIndex = worksheetData.length - 1;
    columns.forEach((col, index) => {
      const cellAddress = XLSX.utils.encode_cell({
        r: totalRowIndex,
        c: index,
      });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "F5F5F5" } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };
      }
    });

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataGrid");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "SOA_Report.xlsx");
  };

  const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
  //const currentroleType = loginResponse.data?.userRole?.roleType;

  useEffect(() => {
    fetchCustomerList();
    let payload = { customerId: "", filter: "", month: "", year: "" };
    setPayload(payload);
    fetchSoa(payload);
  }, []);

  const handleChange = (e) => {
    let payload = "";
    setSelectedCustomerid("");
    setSelectedCustomerid(e.target.value);
    if (FilterName != "")
      payload = {
        customerId: e.target.value,
        filter: FilterName,
        [FilterName]: FilterValue,
      };
    else payload = { customerId: e.target.value };
    setPayload(payload);
    fetchSoa(payload);
  };

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const handleTimeperiod = async (e) => {
    let payload = "";
    const SelectBxname = e.target.name;
    setFilterName(SelectBxname);
    setFilterValue(e.target.value);
    payload = {
      customerId: selectedCustomerid,
      filter: SelectBxname,
      [SelectBxname]: e.target.value,
    };
    setPayload(payload);
    fetchSoa(payload);
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
      <Typography>No Record Found</Typography>
    </Box>
  );

  const columns = [
    {
      field: "quotation",
      headerName: "Quotation Number",
      flex: 2,
      minWidth: 100,
      renderHeader: () => (
        <span className="header-class">
          Quotation
          <br />
          Number
        </span>
      ),
    },
    {
      field: "invoice",
      headerName: "Invoice NO",
      flex: 2,
      minWiOdth: 100,
      renderHeader: () => (
        <span className="header-class">
          Invoice
          <br />
          No
        </span>
      ),
    },
    { field: "date", headerName: "FDA Date", flex: 2, minWidth: 100 },
    {
      field: "customer",
      headerName: "Customer Name",
      flex: 2,
      renderHeader: () => (
        <span className="header-class">
          Customer
          <br />
          Name
        </span>
      ),
    },
    {
      field: "vessel",
      headerName: "Vessel Name",
      flex: 2,
      renderHeader: () => (
        <span className="header-class">
          Vessel
          <br />
          Name
        </span>
      ),
    },
    {
      field: "port",
      headerName: "Port Name",
      flex: 2,
      renderHeader: () => (
        <span className="header-class">
          Port
          <br />
          Name
        </span>
      ),
    },
    {
      field: "totalomr",
      headerName: `Total OMR`,
      flex: 2,
      minWidth: 50,
      renderHeader: () => (
        <span className="header-class">
          Total
          <br />
          OMR
        </span>
      ),
    },
    {
      field: "paidomr",
      headerName: `Paid OMR`,
      flex: 2,
      renderHeader: () => (
        <span className="header-class">
          Paid
          <br />
          OMR
        </span>
      ),
    },
    {
      field: "discount",
      headerName: "Discount",
      flex: 2,
      renderHeader: () => <span className="header-class">Discount</span>,
    },
    {
      field: "balanceOMR",
      headerName: `Balanceoverdue OMR`,
      flex: 2,
      renderHeader: () => (
        <span className="header-class">
          Balance
          <br />
          overdue <br />
          OMR
        </span>
      ),
    },
    {
      field: "totalUSD",
      headerName: `Total USD`,
      flex: 2,
      renderHeader: () => <span className="header-class">Total USD</span>,
    },
    {
      field: "balanceUSD",
      headerName: "Balanceoverdue USD",
      flex: 2,
      renderHeader: () => (
        <span className="header-class">
          Balance
          <br />
          overdue <br />
          USD
        </span>
      ),
    },
    // Only show Balanceoverdue AED if currency is NOT AED
    ...[
      {
        field: "balanceAED",
        headerName: "Balanceoverdue AED",
        flex: 2,
        renderHeader: () => (
          <span className="header-class">
            Balance
            <br />
            overdue <br />
            AED
          </span>
        ),
      },
    ],
    {
      field: "days",
      headerName: "Days overdue",
      flex: 2,
      renderHeader: () => (
        <span className="header-class">
          Days
          <br />
          overdue
        </span>
      ),
      renderCell: (params) => (
        <span
          style={{
            color: params.value > 30 ? "red" : "inherit",
            fontWeight: params.value > 30 ? "bold" : "normal",
          }}
        >
          {params.value}
        </span>
      ),
    },
  ];

  useEffect(() => {
    console.log(soaList, "soaList");
  }, [soaList]);
  return (
    <>
      <div>
        <div className=" mt-3 mb-3 d-flex justify-content-between">
          <div className=" d-flex">
            <div className=" d-flex paymentbycus">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label filterbypayment "
              >
                {" "}
                Customer Name:
              </label>
              <div className="vessel-select">
                <select
                  className="form-select vesselbox statusscostcustomer"
                  name="customers"
                  value={selectedCustomerid || ""}
                  onChange={handleChange}
                >
                  <option value="">Choose Customer</option>
                  {customerList.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.customerName} {""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className=" d-flex filterpayment">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label filterbycustpayment "
              >
                {" "}
                Filter By:
              </label>
              <div className="vessel-select">
                <select
                  name="status"
                  className="form-select vesselbox statussbycustomer"
                  onChange={(e) => setPeriod(e.target.value)}
                  value={period}
                >
                  <option value="">Select Period</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              {period === "month" && (
                <select
                  name="month"
                  className="form-select jobporrt mmonthpayment monthcustomerpay"
                  aria-label="Select Month"
                  onChange={handleTimeperiod}
                >
                  <option value="">Select Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              )}

              {period === "year" && (
                <select
                  name="year"
                  className="form-select jobporrt mmonthpayment monthcustomerpay"
                  aria-label="Select Year"
                  onChange={handleTimeperiod}
                >
                  <option value="">Select Year</option>
                  {years.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className=" d-flex">
            <div className="d-flex align-items-center me-3">
              <input
                type="checkbox"
                id="showAED"
                checked={showAED}
                onChange={(e) => setShowAED(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              <label htmlFor="showAED" style={{ marginBottom: 0 }}>
                Show AED in Excel
              </label>
            </div>
            <div className="downloadreport">
              {" "}
              <button
                className="btn btna submit-button btnfsize"
                onClick={exportToExcel}
              >
                Download Excel Report
              </button>
            </div>
            <div className="downloadreport">
              {" "}
              <button
                className="btn btna submit-button btnfsize"
                onClick={exportToPdf}
              >
                Download PDF Report
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

        <DataGrid
          rows={soaList
            .map((item) => {
              // Check if item.pdaIds is an array and contains objects
              const dateOnly = item.invoiceSentAt
                ? item.invoiceSentAt.split("T")[0]
                : null;
              let formattedDate = "";
              if (dateOnly !== null) {
                const [year, month, day] = dateOnly.split("-");
                formattedDate = `${day}-${month}-${year}`;
              }

              let daysDue;
              if (item.invoiceSentAt) {
                const givenDate = new Date(item.invoiceSentAt);
                const currentDate = new Date();
                const differenceInMs = currentDate - givenDate;
                daysDue = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
              } else daysDue = 0;
              let balance;
              if (item.totalAmountOMR) {
                // Subtract discount from balance calculation
                balance = (
                  item.totalAmountOMR -
                  (item.paidAmount || 0) -
                  (item.discountAmount || 0)
                ).toFixed(3);
              } else {
                balance = 0;
              }
              //divided by login currency rate
              //transwave motham 2 digits decimal
              //charge ilum login va
              // const balanceAed = (balanceusd * 3.6725).toFixed(4);

              let balanceUsdNew;
              balanceUsdNew = (balance * 2.62).toFixed(2);
              const balanceAed = (balanceUsdNew * 3.6725).toFixed(2);

              return {
                id: item._id,
                quotation: item.pdaNumber ? item.pdaNumber : "N/A",
                invoice: item.invoiceId ? item.invoiceId : "N/A",
                date: formattedDate || "N/A",
                customer: item.customerId
                  ? item.customerId.customerName
                  : "N/A",
                vessel: item.vesselId ? item.vesselId.vesselName : "N/A",
                port: item.portId ? item.portId.portName : "N/A",
                totalomr: item.totalAmountOMR
                  ? item.totalAmountOMR.toFixed(3)
                  : "N/A",
                paidomr: item.paidAmount ? item.paidAmount.toFixed(3) : "N/A",
                discount:
                  item.discountAmount !== undefined
                    ? item.discountAmount
                    : "N/A",
                balanceOMR: balance || "N/A",
                balanceUSD: balanceUsdNew || "N/A",
                totalUSD: (item.totalAmountOMR * 2.62)?.toFixed(2) || "N/A",
                ...{
                  balanceAED: balanceAed || "N/A",
                },
                days: daysDue,
                ...item,
              };
            })
            // Add a final row for totals
            .concat([
              {
                id: "total-row",
                quotation: "Total",
                invoice: "",
                date: "",
                customer: "",
                vessel: "",
                port: "",
                totalomr: soaList
                  .reduce((sum, item) => sum + (item.totalAmountOMR || 0), 0)
                  .toFixed(3),
                paidomr: soaList
                  .reduce((sum, item) => sum + (item.paidAmount || 0), 0)
                  .toFixed(3),
                discount: soaList
                  .reduce((sum, item) => sum + (item.discountAmount || 0), 0)
                  .toFixed(3),
                balanceOMR: soaList
                  .reduce(
                    (sum, item) =>
                      sum +
                      ((item.totalAmountOMR || 0) -
                        (item.paidAmount || 0) -
                        (item.discountAmount || 0)),
                    0
                  )
                  .toFixed(3),
                totalUSD: soaList
                  .reduce((sum, item) => sum + item.totalAmountOMR * 2.62, 0)
                  .toFixed(2),
                balanceUSD: soaList
                  .reduce(
                    (sum, item) =>
                      sum +
                      ((item.totalAmountOMR || 0) -
                        (item.paidAmount || 0) -
                        (item.discountAmount || 0)) *
                        2.62,
                    0
                  )
                  .toFixed(2),

                balanceAED: soaList
                  .reduce(
                    (sum, item) =>
                      sum +
                      ((item.totalAmountOMR || 0) -
                        (item.paidAmount || 0) -
                        (item.discountAmount || 0)) *
                        2.62 *
                        3.6725,
                    0
                  )
                  .toFixed(2),
                days: "",
              },
            ])}
          columns={columns}
          getRowId={(row) => row.id}
          disableSelectionOnClick // Disables checkbox selection to prevent empty column
          disableColumnMenu // Removes column menu
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
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#eee",
            },
            // Remove bold from all last rows
            // Instead, apply bold only to the total row by id
            "& .MuiDataGrid-row[data-id='total-row']": {
              fontWeight: "bold",
              backgroundColor: "#f5f5f5",
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
        {soaList?.length === 0 && (
          <div className="no-data">
            <p>No Data Found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Soa;
