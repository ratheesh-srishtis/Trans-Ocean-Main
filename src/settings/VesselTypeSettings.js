import React, { useState, useEffect } from "react";
import "../css/settings.css";
import AddVesselType from "./AddVesselType";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllVesselTypes, deleteVesselType } from "../services/apiSettings";
import Swal from "sweetalert2";
import Loader from "../pages/Loader";
import PopUp from "../pages/PopUp";

const VesselTypeSettings = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [VesselTypeList, setVesselTypeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const fetchVesselTypeList = async () => {
    try {
      setIsLoading(true);
      const listallvesseltype = await getAllVesselTypes();
      setVesselTypeList(listallvesseltype?.vesselType || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch vesselType", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("DDD");
    fetchVesselTypeList();
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

  const handleAddvesselType = (newPort) => {
    fetchVesselTypeList();
    setOpen(false); // Close the popup after adding the role
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditMode(true);
    openDialog();
  };
  const handleDelete = async (item) => {
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
              vesselTypeId: item?._id,
            };
            const response = await deleteVesselType(payload);
            setMessage(response.message);
            setOpenPopUp(true);
            fetchVesselTypeList();
          } catch (error) {
            Swal.fire("Error deleting Vessel Type");
            fetchVesselTypeList();
          }
        }
      }
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
  const columns = [
    { field: "vesselType", headerName: "Vessel Types", flex: 1 },

    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row)}
          >
            <DeleteIcon sx={{ fontSize: "19px" }} />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-end mb-3 mt-3">
        <button
          onClick={() => {
            openDialog();
          }}
          className="btn btna submit-button btnfsize"
        >
          Add Vessel Type
        </button>
      </div>

      <AddVesselType
        open={open}
        onAddVesselType={handleAddvesselType}
        onClose={handleClose}
        editMode={editMode}
        vesselTypeSet={selectedRow}
        errors={errors}
        setErrors={setErrors}
      />
      <div>
        <DataGrid
          rows={VesselTypeList.map((item) => ({
            id: item._id,
            vesselType: item.vesselType || "N/A",
            ...item,
          }))}
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
            "& .MuiDataGrid-cell": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            "& .MuiTablePagination-toolbar": {
              alignItems: "baseline", // Apply align-items baseline
            },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
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
      {VesselTypeList?.length === 0 && (
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

export default VesselTypeSettings;
