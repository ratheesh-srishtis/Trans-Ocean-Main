import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/quotation.css";
import {
  getAllQuotations,
  deleteQuotation,
  getAllJobs,
} from "../../services/apiService";
import { IconButton, TextField } from "@mui/material";
import { Box, Typography } from "@mui/material";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
import Loader from "../Loader";
import Remarks from "../Remarks";
import { useAuth } from "../../context/AuthContext";
const OpsList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState("all");
  const { loginResponse } = useAuth();
  console.log(loginResponse, "loginResponse_OpsList");
  // Add this state variable around line 40 with other state declarations
  const [fromDashboard, setFromDashboard] = useState(false);
  const [cardNumber, setCardNumber] = useState(null);
  const acceptedIcon = require("../../assets/images/accepted.png");
  const rejectedIcon = require("../../assets/images/rejected.png");
  const messageIcon = require("../../assets/images/chat_icon.png");
  const [remarksOpen, setRemarksOpen] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);
  const [quotationsList, setQuotationsList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const fetchQuotations = async (type) => {
    setSelectedTab(type);
    try {
      setIsLoading(true);
      let userData = {
        filter: type,
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
          if (
            ["operationsmanager", "operationshead"].includes(designationType)
          ) {
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
      const quotations = await getAllJobs(userData);
      console.log("Quotations:", quotations);
      setQuotationsList(quotations?.pda || []);
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
    console.log(fromDashboardData, "fromDashboardData");
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
        return "Pending from operations";
      case 7:
        return "Operations Completed";
      default:
        return "Unknown Status";
    }
  };

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
    { field: "date", headerName: "Date", flex: 1 },
    { field: "vessel", headerName: "Vessel Name", flex: 1 },
    { field: "port", headerName: "Port Name", flex: 1 },
    { field: "cargo", headerName: "Cargo", flex: 1 },
    { field: "AssignedTo", headerName: "Ops By", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1.5,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{params.value}</span>

          {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
            "operations" && (
            <>
              {params.row.invoiceStatus == 2 && (
                <img
                  src={rejectedIcon}
                  alt="Rejected Icon"
                  style={{ cursor: "default", width: "18px" }}
                  onClick={() => handleIconClick(params.row)} // Pass the row data
                />
              )}
            </>
          )}

          {params.row.rejectedRemark && (
            <img
              src={messageIcon}
              alt="Rejected Icon"
              style={{ cursor: "pointer", width: "18px" }}
              onClick={() => handleRemarkClick(params.row)} // Pass the row data
            />
          )}

          {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
            "operations" && (
            <>
              {params.row.invoiceStatus === 3 && (
                <img
                  src={acceptedIcon} // Replace with the path or variable for this icon
                  alt="Invoice Icon"
                  style={{ cursor: "default", width: "18px" }}
                  onClick={() => handleIconClick(params.row)} // Pass the row data
                />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon sx={{ fontSize: "19px" }} />
          </IconButton>

          {loginResponse?.data?.userRole?.roleType == "admin" ||
            (loginResponse?.data?.userRole?.roleType == "superadmin" && (
              <>
                <IconButton
                  color="secondary"
                  onClick={() => handleDelete(params.row)}
                >
                  <DeleteIcon sx={{ fontSize: "19px" }} />
                </IconButton>
              </>
            ))}
        </>
      ),
    },
  ];

  const handleIconClick = (rowData) => {
    console.log("Icon clicked for row:", rowData);
  };

  const handleEdit = (row) => {
    console.log("Edit row", row);
    if (
      loginResponse?.data?.userRole?.roleType == "finance" ||
      loginResponse?.data?.userRole?.roleType == "admin" ||
      loginResponse?.data?.userRole?.roleType == "superadmin"
    ) {
      navigate("/create-pda", { state: { row } });
    } else if (loginResponse?.data?.userRole?.roleType == "operations") {
      navigate("/edit-operation", { state: { row } });
    }
  };

  const [remarksMessage, setRemarksMessage] = useState("");
  const handleRemarkClick = (rowData) => {
    console.log("Icon clicked for row:", rowData);
    // Add your logic here
    handleRemarksOpen();
    setRemarksMessage(rowData?.rejectedRemark);
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

  const handleNavigation = () => {
    sessionStorage.clear();
    navigate("/job-report");
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
      !selectedStatus ||
      getStatusText(item.pdaStatus)?.toLowerCase() ===
        selectedStatus?.toLowerCase();

    return matchesSearchTerm && matchesStatus;
  });

  useEffect(() => {
    setStatusList([
      "Customer Approved",
      "Pending From Operations",
      "Operations Completed",
    ]);
  }, []);

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
            setMessage("Charge deleted successfully");
            setOpenPopUp(true);
            fetchQuotations("all");
          } catch (error) {
            console.error("Error fetching charges:", error);
            Swal.fire("Error deleting charges");
            fetchQuotations("all");
          }
        }
      }
    });
  };

  const handleCellClick = (params, event) => {
    console.log(params, "params");
    if (params.field === "JobId") {
      let row = params.row;
      navigate("/view-operation", { state: { row } });
    }
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
                className={`nav-link carduppercontent ${
                  selectedTab === "month" ? "active-nav-style" : ""
                }`}
                onClick={() => fetchQuotations("month")}
              >
                Last Month
              </a>
            </li>
          </ul>
        </div>

        <div className="d-flex gap-3 rightside">
          <div className=" searchmain">
            <input
              type="email"
              className="form-control search"
              id="exampleFormControlInput1"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
            <i className="bi bi-search searchicon"></i>
          </div>

          {(!fromDashboard || (fromDashboard && cardNumber === "1")) && (
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
          )}

          <div className=" createbtn" style={{ width: "100%" }}>
            <button
              type="button"
              onClick={() => handleNavigation()}
              className="btn btn-info infobtn"
            >
              Job Report
            </button>
          </div>
        </div>
      </div>

      <div className=" tablequo mb-5">
        <div className="quotation-outer-div">
          <div>
            <DataGrid
              rows={
                filteredQuotations.length > 0
                  ? filteredQuotations.map((item) => ({
                      id: item._id,
                      JobId: item.jobId || "N/A",
                      vessel: item.vesselId?.vesselName || "N/A",
                      port: item.portId?.portName || "N/A",
                      cargo: item.cargoId?.cargoName || "N/A",
                      date: formatDate(item.createdAt),
                      AssignedTo: item.assignedEmployee?.name || "N/A",
                      status: getStatusText(item.pdaStatus),
                      ...item,
                    }))
                  : []
              }
              jobId
              columns={columns}
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
                "& .MuiDataGrid-scrollbarFiller": {
                  backgroundColor: "#eee !important",
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

      {/* <div className="buttons-wrapper">
        <div className="left">
          <button
            className="btn btna submit-button btnfsize"
            onClick={() => {
              handlePdaOpen();
            }}
          >
            Generate PDF
          </button>
        </div>
        <div className="right d-flex">
          <button
            className="btn btna submit-button btnfsize"
            onClick={() => {
              navigate("/final-report", { state: { editData } });
            }}
          >
            Final Report
          </button>
        </div>
      </div> */}

      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Remarks
        open={remarksOpen}
        onClose={handleRemarksClose}
        onRemarksSubmit={handleRemarksSubmit}
        isReadOnly={true}
        remarksMessage={remarksMessage}
      />
    </>
  );
};

export default OpsList;
