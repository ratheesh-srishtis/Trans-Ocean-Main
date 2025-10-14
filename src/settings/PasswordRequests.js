import React, { useState, useEffect } from "react";
import "../css/settings.css";
import ResetPassword from "./ResetPassword";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import { getAllResetPasswordRequests } from "../services/apiSettings";
import Swal from "sweetalert2";
import Loader from "../pages/Loader";
import PopUp from "../pages/PopUp";
import { WidthFull } from "@mui/icons-material";
const PasswordRequests = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [PasswordRequests, setPasswordRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const listallrequests = await getAllResetPasswordRequests();
      console.log("users:", listallrequests);
      setPasswordRequests(listallrequests?.users || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openDialog = () => {
    handleClickOpen();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setErrors({});
  };

  const handlePasswordRequest = (newRequest) => {
    fetchRequests();
    setOpen(false);
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    openDialog();
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
    { field: "name", headerName: "Name", flex: 2 },
    { field: "username", headerName: "Username", flex: 2 },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "role", headerName: "Role", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      flex: 2,
      renderCell: (params) => (
        <>
          <button
            className="btn btna submitpaymentbutton btnfsize"
            onClick={() => handleEdit(params.row)}
          >
            Reset Password
          </button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-end mb-3 mt-3"></div>
      <ResetPassword
        open={open}
        onRequestPassword={handlePasswordRequest}
        onClose={handleClose}
        requestSet={selectedRow}
        errors={errors}
        setErrors={setErrors}
      />
      <div>
        <DataGrid
          rows={PasswordRequests.map((item) => {
            if (!item?._id) {
              console.error("Item missing _id:", item);
              return null;
            }
            return {
              id: item._id, // Ensure _id is used if available
              name: item.name || "N/A",
              username: item.username || "N/A",
              email: item.email || "N/A",
              role: item.userRole?.roleType || "N/A", // Use optional chaining
              ...item,
            };
          }).filter(Boolean)} // Filter out null items
          columns={columns}
          getRowId={(row) => row._id} // Ensure this uses the correct id
          disableSelectionOnClick
          disableColumnMenu
          components={{ NoRowsOverlay }}
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#eee !important",
              color: "#000000",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
            "& .MuiDataGrid-cell": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            "& .MuiTablePagination-toolbar": {
              alignItems: "baseline",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#eee", // Gray background for the footer
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
      {PasswordRequests.length === 0 && (
        <div className="no-data">
          <p>No Data Found</p>
        </div>
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default PasswordRequests;
