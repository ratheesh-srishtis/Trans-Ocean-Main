import React, { useState, useEffect } from "react";
import "../css/RolesSettings.css";
import AddRole from "./AddRole";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getAllUserRoles, deleteUserRole } from "../services/apiSettings";
import Swal from "sweetalert2";
import Loader from "../pages/Loader";
import PopUp from "../pages/PopUp";

const RolesSettings = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [RolesList, setRolesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const fetchrolesList = async () => {
    try {
      setIsLoading(true);
      const listallroles = await getAllUserRoles();
      // console.log("Roles:", listallroles);
      setRolesList(listallroles?.roles || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch roles", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchrolesList();
  }, []);

  const openDialog = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedRow(null);
    setErrors({});
  };

  const handleAddRole = (newRole) => {
    fetchrolesList();
    setOpen(false); // Close the popup after adding the role
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditMode(true);
    openDialog();
  };

  const handleDelete = async (item) => {
    let isDeleteUser = "";
    Swal.fire({
      title: "Do you want to delete users who have this role?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      //allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        isDeleteUser = true;
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        isDeleteUser = false;
      }
      if (item?._id && isDeleteUser !== "") {
        try {
          let payload = {
            roleId: item?._id,
            isDeleteUser: isDeleteUser,
          };
          const response = await deleteUserRole(payload);
          setMessage(response.message);
          setOpenPopUp(true);
          fetchrolesList();
        } catch (error) {
          Swal.fire("Error deleting Role");
          fetchrolesList();
        }
      }
      //}
    });
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

  //const rolesToHideDelete = ["Operations Manager", "Finance Manager", "HR Manager", "Admin"];
  const columns = [
    { field: "desigination", headerName: "Roles", flex: 2 },
    { field: "roleType", headerName: "Role Type", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          {/* {!rolesToHideDelete.includes(params.row.role) && ( */}
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row)}
          >
            <DeleteIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          {/* )} */}
        </>
      ),
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-end mb-3 mt-3">
        <button
          onClick={openDialog}
          className="btn btna submit-button btnfsize"
        >
          Add Role
        </button>
      </div>

      <AddRole
        open={open}
        onAddRole={handleAddRole}
        onClose={handleClose}
        editMode={editMode}
        roleSet={selectedRow}
        errors={errors}
        setErrors={setErrors}
      />

      <div>
        <DataGrid
          rows={RolesList.map((item) => {
            let roleTypes = item.roleType
              ? item.roleType.charAt(0).toUpperCase() +
                item.roleType.slice(1).toLowerCase()
              : "N/A";

            if (roleTypes === "Hr" || roleTypes === "hr") {
              roleTypes = roleTypes.toUpperCase();
            }

            return {
              ...item,
              id: item._id,
              desigination: item.role.designationName || "N/A",
              roleType: roleTypes,
            };
          })}
          columns={columns}
          getRowId={(row) => row._id} // Use id field for unique row identification
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
              backgroundColor: "#eee !important", // Set gray background color
              color: "#000000", // Set white text color for contrast
              fontWeight: "bold", // Optional: Make the text bold
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
        />
      </div>

      {RolesList?.length === 0 && (
        <div className="no-data">
          <p>No Data Found</p>
        </div>
      )}

      <Loader isLoading={isLoading} />

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default RolesSettings;
