import React, { useState, useEffect } from "react";
import "../../css/payment.css";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getAllDesignations,
  deleteDesignation,
} from "../../services/apiHrSettings";
import AddDesigination from "./AddDesigination";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
const Desiginations = () => {
  const Group = require("../../assets/images/designations.png");
  const [desiginationlist, setDesiginations] = useState([]);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  useEffect(() => {
    fetchDesiginations();
  }, []);
  const fetchDesiginations = async () => {
    const listDesiginations = await getAllDesignations();
    setDesiginations(listDesiginations?.designations || []);
  };
  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditMode(true);
    OpenDialog();
  };
  const handleListDesiginations = (payload) => {
    setEditMode(false);
    fetchDesiginations();
    setOpen(false);
  };
  const OpenDialog = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setErrors({});
  };
  const handleDelete = async (desiginationId) => {
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
        if (desiginationId) {
          try {
            let payload = {
              designationId: desiginationId,
            };
            const response = await deleteDesignation(payload);
            setMessage(response.message);
            setOpenPopUp(true);
            fetchDesiginations();
          } catch (error) {
            Swal.fire("Error deleting Designations");
            fetchDesiginations();
          }
        }
      }
    });
  };

  const columns = [
    { field: "designationName", headerName: "Designations", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      renderCell: (params) => {
        //console.log(`Row ID: ${params.row._id}, canDelete: ${params.row.canDelete}`);
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton color="primary" onClick={() => handleEdit(params.row)}>
              <EditIcon sx={{ fontSize: "19px" }} />
            </IconButton>
            {params.row.canDelete === true && (
              <IconButton
                color="secondary"
                onClick={() => handleDelete(params.row._id)}
              >
                <DeleteIcon sx={{ fontSize: "19px" }} />
              </IconButton>
            )}
          </div>
        );
      },
    },
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
      <Typography>No Record Found</Typography>
    </Box>
  );
  return (
    <>
      <div>
        <div className="charge mt-3">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        <div className=" mt-3 mb-3 employeeadd">
          <div className="">
            <button
              onClick={() => {
                OpenDialog();
              }}
              className="btn btn-info infobtn addleave"
            >
              Add Designation
            </button>
          </div>
        </div>
        <div>
          <DataGrid
            rows={desiginationlist.map((item) => {
              return {
                id: item._id,
                designationName: item.designationName || "N/A",
                ...item,
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
              width: "97%",
              overflowX: "hidden",
              margin: "16px",
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
        {desiginationlist?.length === 0 && (
          <div className="no-data">
            <p>No Data Found</p>
          </div>
        )}
        <AddDesigination
          open={open}
          onClose={handleClose}
          listDesiginations={handleListDesiginations}
          editMode={editMode}
          desiginations={selectedRow}
          errors={errors}
          setErrors={setErrors}
        ></AddDesigination>
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default Desiginations;
