import React, { useState, useEffect } from "react";
import { getAllEmployeeChanges } from "../../services/apiLeavePortal";
import PopUp from "../PopUp";
import "../../css/empmodification.css";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";

const EmployeeModification = () => {
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [employeesList, setEmployeesList] = useState(null);

  const fecthEmployeeLeaves = async (paylaod) => {
    const response = await getAllEmployeeChanges(paylaod);
    setEmployeesList(response?.employeeDetails || []);
  };

  useEffect(() => {
    fecthEmployeeLeaves();
  }, []);
  useEffect(() => {
    console.log(employeesList, "employeesList");
  }, [employeesList]);

  // helper to format date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB"); // gives dd/mm/yyyy
  };

  const navigate = useNavigate();

  const handleView = (emp) => {
    navigate("/view-employee-details", { state: emp });
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
    { field: "employeeName", headerName: "Employee Name", flex: 2 },
    { field: "createdDate", headerName: "Date Created", flex: 1.5 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="primary"
            onClick={() => handleView(params.row)}
            style={{
              color: "#1ebbee",
            }}
          >
            <VisibilityIcon sx={{ fontSize: "19px" }} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <div className="row">
          <div className="col-12">
            <DataGrid
              localeText={{
                noRowsLabel: "", // Hides the text
              }}
              rows={
                employeesList?.map((emp) => ({
                  id: emp._id || emp.employeeName + Date.now(), // Use unique ID
                  employeeName: emp.employeeName || "N/A",
                  createdDate: formatDate(emp.createdAt) || "N/A",
                  ...emp, // Include all original data for the view function
                })) || []
              }
              columns={columns}
              getRowId={(row) => row.id} // Use id field for unique row identification
              disableSelectionOnClick // Disables checkbox selection
              disableColumnMenu // Removes column menu
              sx={{
                overflowX: "hidden",
                margin: "16px",
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#eee !important", // Set gray background color
                  color: "#000000", // Set text color for contrast
                  fontWeight: "bold", // Make the text bold
                },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
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
              slots={{
                noRowsOverlay: NoRowsOverlay,
              }}
            />
          </div>
        </div>
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default EmployeeModification;
