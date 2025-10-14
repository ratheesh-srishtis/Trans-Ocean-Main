import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import "../../css/quotation.css";
import {
  getAllQuotations,
  deleteQuotation,
  getAllJobs,
  getJobReport,
  jobReportPDF,
} from "../../services/apiService";
import { IconButton, TextField } from "@mui/material";
import { Box, Typography } from "@mui/material";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
import Loader from "../Loader";
import { useLocation } from "react-router-dom";

const JobReportTable = ({
  loginResponse,
  ports,
  isClicked,
  onReset,
  selectedIds,
  filterType,
  selectedMonth,
  selectedYear,
  onDataChange,
  reportTableList,
  onFilteredQuotationsChange, // Add this prop
}) => {
  console.log(ports, "ports_JobReportTable");
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("all");
  const [quotationsList, setQuotationsList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const fetchQuotations = async (type) => {
    setSelectedTab(type);

    try {
      setIsLoading(true);
      let userData = {
        filter: type,
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

  useEffect(() => {
    fetchQuotations("all");
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB"); // Format: dd/mm/yyyy
  };

  useEffect(() => {
    if (isClicked) {
      console.log("Parent button was clicked!");
      setSelectedPort("");
      setSelectedStatus("");
      // Perform any action here when the parent button is clicked
      onReset(); // Optionally reset the state in the parent
    }
  }, [isClicked, onReset]);

  const getStatusText = (status) => {
    switch (status) {
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
    { field: "vessel", headerName: "Vessel Name", flex: 1 },
    { field: "job", headerName: "Job", flex: 1, width: "400px" },
    { field: "port", headerName: "Port Name", flex: 1 },
    { field: "AssignedTo", headerName: "Ops By", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      renderCell: (params) => (
        <>
          <button
            type="button"
            className="btn btn-info jobviewbtnn mt-3"
            onClick={() => handleJobClick(params.row)}
          >
            View
          </button>
          {loginResponse?.data?.userRole?.roleType == "admin" && (
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

  const handleJobClick = (row) => {
    const filterState = {
      filterType,
      selectedMonth,
      selectedYear,
      selectedIds,
      selectedPort,
      selectedStatus,
    };

    console.log(filterState, "filterState");

    // Save filters to sessionStorage
    sessionStorage.setItem("jobReportFilters", JSON.stringify(filterState));

    navigate("/view-operation", {
      state: { row },
    });

    // navigate("/view-operation", { state: { row } });
  };

  const handleEdit = (row) => {
    console.log("Edit row", row);
    navigate("/edit-operation", { state: { row } });
  };

  const handleNavigation = () => {
    sessionStorage.clear();

    navigate("/job-report");
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
  };

  useEffect(() => {
    setStatusList([
      "Customer Approved",
      "Pending from Operations",
      "Operations Completed",
    ]);
  }, []);

  useEffect(() => {
    console.log(selectedStatus, "selectedStatus");
    console.log(selectedPort, "selectedPort");
  }, [selectedStatus, selectedPort]);

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "status":
        setSelectedStatus(value);
        break;
      case "port":
        setSelectedPort(value);
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
    onDataChange(filterType, newMonth, selectedYear);
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value, 10);
    console.log(newYear, "newYear_handleYearChange");
    onDataChange(filterType, selectedMonth, newYear);
  };

  const handleFilterTypeChange = (event) => {
    const newFilterType = event.target.value;
    onDataChange(newFilterType, selectedMonth, selectedYear);
  };

  const handleCellClick = (params, event) => {
    console.log(params, "params");
    if (params.field === "JobId") {
      let row = params.row;

      const filterState = {
        filterType,
        selectedMonth,
        selectedYear,
        selectedIds,
        selectedPort,
        selectedStatus,
      };

      console.log(filterState, "filterState");

      // Save filters to sessionStorage
      sessionStorage.setItem("jobReportFilters", JSON.stringify(filterState));

      navigate("/view-operation", {
        state: { row },
      });
    }
    // if (params.field === "JobId") {

    //   let row = params.row;
    //   const filterState = {
    //     filterType,
    //     selectedMonth,
    //     selectedYear,
    //     selectedIds,
    //     selectedPort,
    //     selectedStatus,
    //   };

    //   console.log(filterState, "filterState");

    //   // Save filters to sessionStorage
    //   sessionStorage.setItem("jobReportFilters", JSON.stringify(filterState));

    //   navigate("/view-operation", {
    //     state: { row },
    //   });
    // }
  };
  const location = useLocation();

  useEffect(() => {
    const wasRefreshed = sessionStorage.getItem("wasRefreshed") === "true";

    if (wasRefreshed) {
      // Clear sessionStorage
      sessionStorage.removeItem("wasRefreshed");
      sessionStorage.removeItem("jobReportFilters");

      // Reset states to initial values
      setSelectedPort("");
      setSelectedStatus("");
      return;
    }

    // Try location.state first (in case user comes via redirect)
    let restoredFilters = location.state?.filterState;

    // If not available, check sessionStorage
    if (!restoredFilters) {
      const stored = sessionStorage.getItem("jobReportFilters");
      if (stored) {
        restoredFilters = JSON.parse(stored);
      }
    }

    if (restoredFilters) {
      console.log(restoredFilters, "restoredFilters");
      const {
        filterType,
        selectedMonth,
        selectedYear,
        selectedIds,
        selectedPort,
        selectedStatus,
      } = restoredFilters;

      setSelectedPort(selectedPort);
      setSelectedStatus(selectedStatus);

      // Optional: Clear from sessionStorage if you want single-use
      // sessionStorage.removeItem("jobReportFilters");
    }
  }, []);

  useEffect(() => {
    console.log(selectedPort, "selectedPort_jobreporttable");
    console.log(selectedStatus, "selectedStatus_selectedPort_jobreporttable");
  }, [selectedPort, selectedStatus]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("wasRefreshed", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const filteredQuotations = reportTableList?.filter((item) => {
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
      getStatusText(item.pdaStatus).toLowerCase() ===
        selectedStatus.toLowerCase();

    const matchesPort =
      !selectedPort || item.portId[0]?.portName === selectedPort;

    return matchesSearchTerm && matchesStatus && matchesPort;
  });

  useEffect(() => {
    console.log(filteredQuotations, "filteredQuotations");
  }, [filteredQuotations]);

  // Notify parent component about filtered quotations
  useEffect(() => {
    if (typeof onFilteredQuotationsChange === "function") {
      onFilteredQuotationsChange(filteredQuotations);
    }
  }, [filteredQuotations, onFilteredQuotationsChange]);

  return (
    <>
      <div className="d-flex  headerb mb-3 mt-3 ">
        <div className=" d-flex">
          <div className=" filtermainleft mqfiltermainleftjob ">
            <i className="bi bi-funnel-fill filtericon"></i>
            <select
              className="form-select form-select-sm filter"
              aria-label="Filter select"
              value={filterType} // Bind selected value
              onChange={handleFilterTypeChange} // Update state on change
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          {filterType === "month" && (
            <div className="">
              <div className="jobfilter">
                <div></div>
                <div>
                  <select
                    className="form-select jobporrt mandyearbyjob monthselectheight"
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
              <div className="">
                <div className="jobfilter">
                  <div></div>
                  <div className="yearjobreport">
                    <select
                      className="form-select jobporrt mmonth mandyearbyjob"
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
        </div>
        <div className=" filtermain ">
          <i className="bi bi-funnel-fill filtericon"></i>
          <select
            className="form-select form-select-sm filter"
            aria-label="Small select example"
            name="port"
            onChange={handleSelectChange}
            value={selectedPort}
          >
            <option value="">Filter by port</option>
            {ports?.map((port) => (
              <option key={port?.portId} value={port?.portId}>
                {port?.portName}
              </option>
            ))}
          </select>
        </div>
        <div className=" filtermainjobleft ">
          <i className="bi bi-funnel-fill filtericon"></i>
          <select
            className="form-select form-select-sm filter"
            aria-label="Small select example"
            name="status"
            onChange={handleSelectChange}
            value={selectedStatus}
          >
            <option value="">Filter by status</option>
            {statusList?.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* --------------------------------------- */}
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
                filteredQuotations?.length > 0
                  ? filteredQuotations?.map((item) => ({
                      id: item._id,
                      JobId: item.jobId || "N/A",
                      vessel: item.vesselId[0]?.vesselName || "N/A",
                      job:
                        item.jobs
                          ?.map((job) => job.service?.[0]?.serviceName || "N/A")
                          ?.join(", ") || "N/A", // Updated line to include service names
                      port: item.portId[0]?.portName || "N/A",
                      AssignedTo: item.assignedEmployee[0]?.name || "N/A",
                      status: getStatusText(item.pdaStatus),
                      ...item,
                    }))
                  : []
              }
              jobId
              columns={columns.map((col) =>
                window.innerWidth <= 600
                  ? { ...col, flex: undefined, minWidth: 180, width: 180 }
                  : col
              )}
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

      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default JobReportTable;
