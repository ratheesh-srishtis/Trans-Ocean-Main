import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation } from "react-router-dom";
import { financeDashboardDetails } from "../services/apiService";
import "../css/quotation.css";
import {
  getAllQuotations,
  deleteQuotation,
  getPdaDetails,
  duplicatePda,
  excludePdaFromReport,
  includePdaToReport,
} from "../services/apiService";
import { IconButton, TextField } from "@mui/material";
import { Box, Typography } from "@mui/material";
import Loader from "./Loader";
import Swal from "sweetalert2";
import PopUp from "./PopUp";
import SendInvoice from "./SendInvoice";
import InvoicePdf from "./InvoicePdf";
import InvoicePage from "./InvoicePage";
import Remarks from "./Remarks";
import PdaDialog from "./PdaDialog";
const Quotations = ({
  loginResponse,
  services,
  customers,
  cargos,
  ports,
  vendors,
  vessels,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log(loginResponse, "loginResponse_quoatations_page");
  const [selectedRows, setSelectedRows] = useState([]);
  const [quotationsList, setQuotationsList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [remarksOpen, setRemarksOpen] = useState(false);
// Add this state variable around line 40 with other state declarations
const [fromDashboard, setFromDashboard] = useState(false);
const [cardNumber, setCardNumber] = useState(null);
  const acceptedIcon = require("../assets/images/accepted.png");
  const rejectedIcon = require("../assets/images/rejected.png");
  const messageIcon = require("../assets/images/chat_icon.png");

  // const fetchQuotations = async (type) => {
  //   setSelectedTab(type);
  //   try {
  //     setIsLoading(true);
  //     let userData = {
  //       filter: type,
  //     };
  //     const quotations = await getAllQuotations(userData);
  //     console.log("Quotations:", quotations);

  //     const matchId = "6780a9a94d57992670a2a70a";
  //     const matchedQuotation = quotations?.pda.find((q) => q._id === matchId);

  //     console.log("Matched Quotation:", matchedQuotation);

  //     setQuotationsList(quotations?.pda || []);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Failed to fetch quotations:", error);
  //     setIsLoading(false);
  //   }
  // };

  // Replace the existing fetchQuotations function (around lines 55-73) with this:
const fetchQuotations = async (type) => {
  setSelectedTab(type);
  try {
    setIsLoading(true);
    
    if (fromDashboard && cardNumber) {
      // Use dashboard API when data came from dashboard
      const payload = {
        filter: type,
        cardNumber: String(cardNumber),
      };
      const res = await financeDashboardDetails(payload);
      
      
        if (res.status == true) {
          if (cardNumber == "1") {
           setQuotationsList(res?.receivedQuotation || []);
          } else if (cardNumber == "2") {
            setQuotationsList(res?.submittedQuotation || []);
          } else if (cardNumber == "3") {
            setQuotationsList(res?.approvedQuotation || []);
          } else if (cardNumber == "4") {
            setQuotationsList(res?.processedQuotation || []);
          } else if (cardNumber == "5") {
            setQuotationsList(res?.completedQuotation || []);
          } else if (cardNumber == "6") {
            setQuotationsList(res?.invoiceSubmitted || []);
            
          }
        }
    } else {
      // Use existing API when data didn't come from dashboard
      let userData = {
        filter: type,
      };
      const quotations = await getAllQuotations(userData);
      setQuotationsList(quotations?.pda || []);
    }
    
    setIsLoading(false);
  } catch (error) {
    console.error("Failed to fetch quotations:", error);
    setIsLoading(false);
  }
};

  // If navigated from Dashboard with state, use it; otherwise fetch
// Replace the existing useEffect (around lines 75-83) with this:
useEffect(() => {
  const fromDashboardData = location?.state?.quotationsFromDashboard;
  const cardNumberValue = location?.state?.cardNumber; // Assuming cardNumber comes from state
  
  if (Array.isArray(fromDashboardData) && fromDashboardData.length > 0) {
    setQuotationsList(fromDashboardData);
    setFromDashboard(true);
    setCardNumber(cardNumberValue);
  } else {
    setFromDashboard(false);
    fetchQuotations("all");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB"); // Format: dd/mm/yyyy
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Draft PDA";
      case 2:
        return "Waiting For Approval From FM";
      case 3:
        return "Internally Approved";
      case 4:
        return "Rejected By FM";
      case 5:
        return "Customer Approved";
      case 6:
        return "Pending From Operations";
      case 7:
        return "Operations Completed";
      case 8:
        return "Closed";
      default:
        return "Unknown Status";
    }
  };

  useEffect(() => {
    setStatusList([
      "Draft PDA",
      "Waiting For Approval From FM",
      "Internally Approved",
      "Rejected By FM",
      "Customer Approved",
      "Pending From Operations",
      "Operations Completed",
    ]);
  }, []);

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedPdaData, setSelectedPdaData] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);

  // const handleRowSelection = (params) => {
  //   console.log(params?.row, "params_handleRowSelection");
  //   setSelectedRowData(params);
  //   setSelectedRowId(params.id); // Store the selected row ID
  //   setSelectedPdaData(params.row);
  //   fetchPdaDetails(params.row?.id);
  // };

  const handleRowSelection = (params) => {
    if (params.id === selectedRowId) {
      // Unselect if the same row is clicked again
      setSelectedRowId(null);
      setSelectedRowData(null);
      setSelectedPdaData(null);
    } else {
      // Select new row
      setSelectedRowId(params.id);
      setSelectedRowData(params);
      setSelectedPdaData(params.row);
      fetchPdaDetails(params.row?.id);
    }
  };

  useEffect(() => {
    console.log(selectedPdaData, "selectedPdaData send_invoice_conditions");
    console.log(selectedRowId, "selectedRowId send_invoice_conditions");
  }, [selectedPdaData, selectedRowId]);

  const columns = [
    {
      field: "select",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div
          style={{
            width: "20px",
            height: "20px",
            border: `2px solid ${
              params.id === selectedRowId ? "#1ebbee" : "#ccc"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "4px", // Slightly rounded corners
          }}
          onClick={() => handleRowSelection(params)}
        >
          {params.id === selectedRowId && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#1ebbee"
              width="16px"
              height="16px"
            >
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
            </svg>
          )}
        </div>
      ),
    },
    {
      field: "pdaNumber",
      headerName: "Job ID",
      flex: 0.8,
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
    {
      field: "typeOfCall",
      headerName: "Type Of Call",
      flex: 1,
      renderCell: (params) => {
        const { isVessels, isServices } = params.row || {};
        let label = "N/A";
        if (isVessels && isServices) label = "Vessels, Services";
        else if (isVessels) label = "Vessels";
        else if (isServices) label = "Services";

        return <span>{label}</span>;
      },
    },
    { field: "vessel", headerName: "Vessel Name", flex: 1.2 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "port", headerName: "Port Name", flex: 1.5 },
    { field: "customer", headerName: "Customer Name", flex: 1.5 },
    { field: "preparedBy", headerName: "Prepared By", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 2.5,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{params.value}</span>
          {params.row.invoiceStatus == 2 && (
            <img
              src={rejectedIcon}
              alt="Rejected Icon"
              style={{ cursor: "default", width: "18px" }}
              onClick={() => handleIconClick(params.row)} // Pass the row data
            />
          )}
          {params.row.rejectedRemark && (
            <img
              src={messageIcon}
              alt="Rejected Icon"
              style={{ cursor: "pointer", width: "18px" }}
              onClick={() => handleRemarkClick(params.row)} // Pass the row data
            />
          )}
          {params.row.invoiceStatus === 3 && (
            <img
              src={acceptedIcon} // Replace with the path or variable for this icon
              alt="Invoice Icon"
              style={{ cursor: "default", width: "18px" }}
              onClick={() => handleIconClick(params.row)} // Pass the row data
            />
          )}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1.5,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleDuplicate(params.row)}
          >
            <ContentCopyIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          {loginResponse?.data?.userRole?.roleType == "superadmin" && (
            <>
              {params.row.isExcludeReport ? (
                <IconButton
                  color="primary"
                  onClick={() => handleIncludePdaToReport(params.row)}
                  title="Include PDA in Report"
                >
                  <VisibilityIcon sx={{ fontSize: "19px" }} />
                </IconButton>
              ) : (
                <IconButton
                  color="primary"
                  onClick={() => handleExcludePdaFromReport(params.row)}
                  title="Exclude PDA from Report"
                >
                  <VisibilityOffIcon sx={{ fontSize: "19px" }} />
                </IconButton>
              )}
            </>
          )}
          {(loginResponse?.data?.userRole?.roleType == "admin" ||
            loginResponse?.data?.userRole?.roleType == "superadmin") && (
            <>
              <IconButton
                color="secondary"
                onClick={() => handleDelete(params.row)}
              >
                <DeleteIcon sx={{ fontSize: "19px" }} />
              </IconButton>
            </>
          )}
        </>
      ),
    },
  ];
  const [remarksMessage, setRemarksMessage] = useState("");
  const handleRemarkClick = (rowData) => {
    console.log("Icon clicked for row:", rowData);
    // Add your logic here
    handleRemarksOpen();
    setRemarksMessage(rowData?.rejectedRemark);
  };
  const handleIconClick = (rowData) => {
    console.log("Icon clicked for row:", rowData);
  };

  const handleRemarksOpen = () => {
    setRemarksOpen(true);
  };

  const handleRemarksClose = () => {
    setRemarksOpen(false);
  };

  const handleRemarksSubmit = async (remark) => {
    console.log(remark, "handleRemarksSubmit");
    setRemarksOpen(false);
  };

  const handleEdit = (row) => {
    console.log("Edit row", row);
    navigate("/create-pda", { state: { row } });
  };

  const handleDuplicate = async (row) => {
    console.log("handleDuplicate", row);
    setIsLoading(true);
    try {
      setIsLoading(true);
      let userData = {
        pdaId: row?._id,
        preparedUserId: loginResponse?.data?._id,
      };
      const response = await duplicatePda(userData);
      console.log("handleDuplicate_response:", response);
      if (response?.status == true) {
        setMessage("Quotation has been duplicated successfully");
        setOpenPopUp(true);
        fetchQuotations("all");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  const handleExcludePdaFromReport = async (row) => {
    console.log("handleExcludePdaFromReport", row);
    setIsLoading(true);
    try {
      let userData = {
        pdaId: row?._id,
      };
      const response = await excludePdaFromReport(userData);
      console.log("handleExcludePdaFromReport_response:", response);
      if (response?.status == true) {
        setMessage("PDA has been excluded from report successfully");
        setOpenPopUp(true);
        fetchQuotations("all");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to exclude PDA from report:", error);
      setIsLoading(false);
    }
  };

  const handleIncludePdaToReport = async (row) => {
    console.log("handleIncludePdaToReport", row);
    setIsLoading(true);
    try {
      let userData = {
        pdaId: row?._id,
      };
      const response = await includePdaToReport(userData);
      console.log("handleIncludePdaToReport_response:", response);
      if (response?.status == true) {
        setMessage("PDA has been included in report successfully");
        setOpenPopUp(true);
        fetchQuotations("all");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to include PDA in report:", error);
      setIsLoading(false);
    }
  };

  const handleNavigation = () => {
    localStorage.removeItem("PDA_ID");
    navigate("/create-pda");
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
  };

  const filteredQuotations = quotationsList.filter((item) => {
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
      !selectedStatus || getStatusText(item.pdaStatus) === selectedStatus;

    return matchesSearchTerm && matchesStatus;
  });

  useEffect(() => {
    console.log(selectedStatus, "selectedStatus");
  }, [selectedStatus]);
  useEffect(() => {
    console.log(filteredQuotations, "filteredQuotations");
  }, [filteredQuotations]);

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "status":
        setSelectedStatus(value);

        break;
      default:
        break;
    }
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

  const handleDelete = async (item) => {
    console.log(item, "item handleDelete");
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
        if (item?._id) {
          try {
            let payload = {
              pdaId: item?._id,
            };
            const response = await deleteQuotation(payload);
            console.log("Fetched Charges:", response);
            setMessage("Quotation has been successfully deleted");
            setOpenPopUp(true);
            fetchQuotations("all");
          } catch (error) {
            console.error("Error fetching charges:", error);
            Swal.fire("Error deleting quotation");
            fetchQuotations("all");
          }
        }
      }
    });
  };

  const handleCellClick = (params, event) => {
    console.log(params, "params");
    if (params.field === "pdaNumber") {
      let row = params.row;
      navigate("/view-quotation", { state: { row } });
    }
  };

  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const SendInvoiceOpen = () => {
    setInvoiceOpen(true);
  };
  const handleInvoiceClose = () => {
    setInvoiceOpen(false);
  };

  const [generateInvoiceOpen, setGenerateInvoiceOpen] = useState(false);

  const generateInvoiceOpenClick = () => {
    setGenerateInvoiceOpen(true);
  };
  const generateInvoiceCloseClick = () => {
    setGenerateInvoiceOpen(false);
  };
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const openInvoicePage = () => {
    setInvoiceDialogOpen(true);
  };
  const closeInvoicePage = () => {
    setInvoiceDialogOpen(false);
  };
  const invoiceSubmit = (data) => {
    console.log(data, "datainvoiceSubmit");
    setInvoiceDialogOpen(false);
    fetchPdaDetails(data);
    fetchQuotations("all");
  };

  const rows = filteredQuotations.map((item) => ({
    id: item._id,
    vessel: item.vesselId?.vesselName || "N/A",
    port: item.portId?.portName || "N/A",
    customer: item.customerId?.customerName || "N/A",
    date: formatDate(item.createdAt),
    preparedBy: item.preparedUserId?.name || "N/A",
    status: getStatusText(item.pdaStatus),
    isVessels: item.isVessels,
    isServices: item.isServices,
    ...item,
  }));
  const [pdaResponse, setPdaResponse] = useState(null);

  const fetchPdaDetails = async (id) => {
    localStorage?.setItem("PDA_ID", id);
    let data = {
      pdaId: id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      console.log("PDADETAILS", pdaDetails);
      setPdaResponse(pdaDetails?.pda);
      setSelectedPdaData(pdaDetails?.pda);
      setSelectedRowId(pdaDetails?.pda?._id || null);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  const [generatePDAOpen, setGeneratePDAOpen] = useState(false);

  const handlePdaOpen = () => {
    setGeneratePDAOpen(true);
  };

  const handlePdaClose = () => {
    setGeneratePDAOpen(false);
  };

  return (
    <>
      <div className="d-flex justify-content-between headerb mb-3 mt-3 ">
        <div className="leftside">
          <ul className="nav nav-underline gap-4 ">
            <li className="nav-item nav-item-filter">
              <a
                className={`nav-link carduppercontent ${
                  selectedTab === "all" ? "active-nav-style" : ""
                }`}
                aria-current="page"
                onClick={() => fetchQuotations("all")}
              >
                All
              </a>
            </li>
            <li className="nav-item nav-item-filter">
              <a
                className={`nav-link carduppercontent ${
                  selectedTab === "day" ? "active-nav-style" : ""
                }`}
                onClick={() => fetchQuotations("day")}
              >
                Last 24 Hour
              </a>
            </li>
            <li className="nav-item nav-item-filter">
              <a
                className={`nav-link carduppercontent ${
                  selectedTab === "week" ? "active-nav-style" : ""
                }`}
                onClick={() => fetchQuotations("week")}
              >
                Last Week
              </a>
            </li>
            <li className="nav-item nav-item-filter">
              <a
                className={`nav-link carduppercontentlast ${
                  selectedTab === "month" ? "active-nav-style" : ""
                }`}
                onClick={() => fetchQuotations("month")}
              >
                Last Month
              </a>
            </li>
          </ul>
        </div>

        <div className="d-flex gap-3 rightside qurigh">
          <div className=" searchmain">
            <input
              type="text"
              className="form-control search srchquo"
              id="exampleFormControlInput1"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
            <i className="bi bi-search searchicon"></i>
          </div>
          {
            !fromDashboard && (
              <>
                <div className=" filtermain filquofil">
            <i className="bi bi-funnel-fill filtericon"></i>
            <select
              className="form-select form-select-sm filter"
              aria-label="Small select example"
              name="status"
              onChange={handleSelectChange}
              value={selectedStatus}
            >
              <option value="">All</option>
              {statusList?.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
              </>
            )
          }
        
          <div className=" createbtn crtq" style={{ width: "100%" }}>
            <button
              type="button"
              onClick={() => handleNavigation()}
              className="btn btn-info infobtn"
            >
              Create New PDA
            </button>
          </div>
        </div>
      </div>

      {/*  rows={
              //   filteredQuotations.length > 0
              //     ? filteredQuotations.map((item) => ({
              //         id: item._id,
              //         vessel: item.vesselId?.vesselName || "N/A",
              //         port: item.portId?.portName || "N/A",
              //         cargo: item.cargoId?.cargoName || "N/A",
              //         date: formatDate(item.createdAt),
              //         preparedBy: item.preparedUserId?.name || "N/A",
              //         status: getStatusText(item.pdaStatus),
              //         ...item,
              //       }))
              //     : []
              // } */}

      <div className=" tablequo">
        <div className="quotation-outer-div">
          <div>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id} // Use id field for unique row identification
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

        <div className="buttons-wrapper">
          <div className="left mt-4 mb-4 d-flex">
            <button
              className="btn btna submit-button"
              onClick={() => {
                handlePdaOpen();
              }}
              // onClick={() => {
              //   generateInvoiceOpenClick();
              // }}
              disabled={!selectedRowId}
            >
              Generate PDA
            </button>
            <button
              className="btn btna submit-button"
              onClick={() => {
                openInvoicePage();
              }}
              disabled={!selectedRowId || selectedPdaData?.pdaStatus != 7}
            >
              Accept Job Report
            </button>
            <button
              className="btn btna generate-button"
              onClick={() => {
                SendInvoiceOpen();
              }}
              disabled={!selectedRowId || selectedPdaData?.invoiceStatus != 3}
            >
              Send Invoice
            </button>
          </div>

          <div className="right d-flex"></div>
        </div>

        {filteredQuotations?.length == 0 && (
          <>
            <div className="no-data">
              <p>No Quotations available for given terms</p>
            </div>
          </>
        )}
      </div>

      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <SendInvoice
        open={invoiceOpen}
        onClose={handleInvoiceClose}
        selectedPdaData={selectedPdaData}
      />
      <InvoicePage
        open={invoiceDialogOpen}
        onClose={closeInvoicePage}
        onSubmit={invoiceSubmit}
        selectedPdaData={selectedPdaData}
        pdaResponse={pdaResponse}
      />
      <InvoicePdf
        open={generateInvoiceOpen}
        onClose={generateInvoiceCloseClick}
        selectedPdaData={selectedPdaData}
        pdaResponse={pdaResponse}
        services={services}
        customers={customers}
        cargos={cargos}
        ports={ports}
        vendors={vendors}
        vessels={vessels}
      />
      <Remarks
        open={remarksOpen}
        onClose={handleRemarksClose}
        onRemarksSubmit={handleRemarksSubmit}
        isReadOnly={true}
        remarksMessage={remarksMessage}
      />

      <PdaDialog
        open={generatePDAOpen}
        onClose={handlePdaClose}
        services={services}
        customers={customers}
        ports={ports}
        pdaResponse={pdaResponse}
        vendors={vendors}
        vessels={vessels}
        cargos={cargos}
      />
    </>
  );
};

export default Quotations;
