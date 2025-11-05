import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAnchorageLocations } from "../services/apiService";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import "../css/reports.css";
import AddAnchorageStay from "./AddAnchorageStay";
import {
  getAnchorageStayCharge,
  deleteAnchorageStayCharge,
} from "../services/apiSettings";
import Swal from "sweetalert2";
import PopUp from "../pages/PopUp";
import { Tooltip } from "@mui/material";
import Loader from "../pages/Loader";
const StayCharge = ({ portName, onClick }) => {
  const Group = require("../assets/images/Reports.png");
  const location = useLocation();
  const { port } = location.state || {};
  const [anchorageStayCharges, setAnchorageStayCharges] = useState([]);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    console.log(port, "port_StayCharge");
  }, [port]);

  const fetchAnchorageStayCharge = async (id) => {
    try {
      setIsLoading(true);
      const payload = {
        portId: id,
      };
      const response = await getAnchorageStayCharge(payload);
      setAnchorageStayCharges(response?.stayCharge);
      console.log(response, "getAnchorageStayCharge");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnchorageStayCharge(port?._id);
  }, [port]);

  useEffect(() => {
    console.log(anchorageStayCharges, "anchorageStayCharges");
  }, [anchorageStayCharges]);

  const columns = [
    { field: "order", headerName: "Order", flex: 1.2 },
    { field: "days", headerName: "Days", flex: 1.2 },
    {
      field: `chargeOMR`,
      headerName: `Charge OMR`,
      flex: 1.2,
    },
    { field: "chargeUSD", headerName: "Charge USD", flex: 1.2 },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => (
        <Tooltip title={params.value} arrow placement="top">
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "100%",
              cursor: "pointer",
            }}
          >
            {params.value}
          </div>
        </Tooltip>
      ),
    },

    {
      field: "actions",
      headerName: "Action",
      flex: 1,
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
  const handleEdit = (row) => {
    console.log("Edit row", row);
    setSelectedRow(row);
    setEditMode(true);
    handleOpen();
  };
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
        if (item?.id) {
          try {
            setIsLoading(true);

            let payload = {
              stayChargeId: item?.id,
            };
            const response = await deleteAnchorageStayCharge(payload);
            console.log("Fetched Charges:", response);
            setMessage("Anchorage Stay Charge details deleted successfully");
            setOpenPopUp(true);
            setIsLoading(false);

            fetchAnchorageStayCharge(port?._id);
          } catch (error) {
            console.error("Error fetching charges:", error);
            Swal.fire("Error deleting quotation");
            fetchAnchorageStayCharge(port?._id);
            setIsLoading(false);
          }
        }
      }
    });
  };

  const rows = anchorageStayCharges.map((item) => ({
    id: item._id,
    days: item.days,
    order: item.order,
    chargeOMR: item.chargeOMR,
    chargeUSD: item.chargeUSD,
    description: item.description,
  }));

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
      <Typography>No Areas available for given terms</Typography>
    </Box>
  );
  const handleCellClick = (params, event) => {
    console.log(params, "params");
  };

  const [openAdd, setopenAdd] = useState(false);

  const handleOpen = () => {
    setopenAdd(true);
  };

  const handleClose = () => {
    setopenAdd(false);
  };
  const handleSubmit = () => {
    setopenAdd(false);
    fetchAnchorageStayCharge(port?._id);
  };
  const handleAddRole = () => {};
  return (
    <>
      <div className="p-3">
        <div className="jobreport-header">
          <div className="summary"></div>
          <div className="col-2 staychrg ">
            <button
              type="button"
              onClick={() => handleOpen()}
              className="btn btn-info infobtn "
            >
              Add Charge Details
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className=" tablequo">
          <div className="quotation-outer-div">
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
      </div>

      <AddAnchorageStay
        open={openAdd}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onAddRole={handleAddRole}
        editMode={editMode}
        roleSet={selectedRow}
        errors={errors}
        setErrors={setErrors}
        portId={port?._id}
      />

      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default StayCharge;
