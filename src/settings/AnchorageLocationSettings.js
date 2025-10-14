import React, { useState, useEffect } from "react";
import "../css/settings.css";
import AddAnchorageLocation from "./AddAnchorageLocation";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getAllAnchorageLoations,
  deleteAnchorageLoation,
  getAllPorts,
} from "../services/apiSettings";
import Swal from "sweetalert2";
import Loader from "../pages/Loader";
import PopUp from "../pages/PopUp";

const AnchorageLocationSettings = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [PortList, setPortList] = useState([]);
  const [AnchorageLocations, setAnchorageLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ portId: "" });
  const fetchAllPorts = async () => {
    try {
      setIsLoading(true);
      const listallports = await getAllPorts();
      setPortList(listallports?.ports || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch ports", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPorts();
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

  async function handleSelectChange(e) {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    try {
      const response = await getAllAnchorageLoations({
        ...formData,
        [name]: value,
      });
      setAnchorageLocations(response.anchorageLocations);
    } catch (error) {
      setMessage("Error Fetching AnchorageLocations");
    }
  }

  const handleAddAnchoragelist = async (newAnchorage) => {
    setOpen(false); // Close the popup after adding the role
    const portId = formData.portId;

    if (portId) {
      const response = await getAllAnchorageLoations({ portId });
      setAnchorageLocations(response.anchorageLocations);
    }
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
              anchorageLocationId: item?._id,
            };
            const response = await deleteAnchorageLoation(payload);
            setMessage(response.message);
            setOpenPopUp(true);
            const portId = formData.portId;
            if (portId) {
              const response = await getAllAnchorageLoations({ portId });
              setAnchorageLocations(response.anchorageLocations);
            }
          } catch (error) {
            Swal.fire("Error deleting AnchorageLocations");
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
    { field: "anchorageLocation", headerName: "Anchorage Location", flex: 1 },

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
          Add Anchorage Location
        </button>
      </div>

      <AddAnchorageLocation
        open={open}
        onAddAnchorageLocation={handleAddAnchoragelist}
        onClose={handleClose}
        editMode={editMode}
        anchorageSet={selectedRow}
        portId={formData.portId}
        errors={errors}
        setErrors={setErrors}
      />

      <div className="row">
        <div className="col-3 mb-3 align-items-start">
          <div className=" portseet">
            <label htmlFor="exampleFormControlInput1" className="form-label">
              <b>Ports</b> <span className="required"> * </span> :
            </label>
            <div className="vessel-select">
              <select
                name="portId"
                className="form-select vesselbox"
                aria-label="Default select example"
                onChange={handleSelectChange}
              >
                <option value="">Choose Ports </option>
                {PortList.map((ports) => (
                  <option key={ports._id} value={ports._id}>
                    {ports.portName}{" "}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div>
        <DataGrid
          rows={AnchorageLocations.map((item) => ({
            id: item._id,
            anchorageLocation: item.area || "N/A",
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
      {AnchorageLocations?.length === 0 && (
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

export default AnchorageLocationSettings;
