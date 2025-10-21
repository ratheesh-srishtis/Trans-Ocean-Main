import React, { useState, useEffect } from "react";
import "../../css/payment.css";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getAllWorkCalendars,
  deleteWorkCalendar,
} from "../../services/apiHrSettings";
import AddWorkCalendar from "./AddWorkCalendar";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
const WorkCalendar = () => {
  const Group = require("../../assets/images/workcalendar.png");
  const [workCalendarlist, setworkCalendar] = useState([]);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  useEffect(() => {
    fetchWorkCalendar();
  }, []);
  const fetchWorkCalendar = async () => {
    const listWorkCalendar = await getAllWorkCalendars();
    setworkCalendar(listWorkCalendar?.workcalendar || []);
  };
  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditMode(true);
    OpenDialog();
  };
  const handleListWorkCalendar = () => {
    setEditMode(false);
    fetchWorkCalendar();
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
  const handleDelete = async (workCalendarId) => {
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
        if (workCalendarId) {
          try {
            let payload = {
              workCalendarId: workCalendarId,
            };
            const response = await deleteWorkCalendar(payload);
            setMessage(response.message);
            setOpenPopUp(true);
            fetchWorkCalendar();
          } catch (error) {
            Swal.fire("Error deleting Work Calendar");
            fetchWorkCalendar();
          }
        }
      }
    });
  };

  const columns = [
    { field: "totalWorkingDays", headerName: "Total Working Days", flex: 2 },
    { field: "totalHolidays", headerName: "Total Holidays", flex: 2 },
    { field: "month", headerName: "Month", flex: 2 },
    { field: "year", headerName: "Year", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row._id)}
          >
            <DeleteIcon sx={{ fontSize: "19px" }} />
          </IconButton>
        </div>
      ),
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
              Add Working Days
            </button>
          </div>
        </div>
        <div>
          <DataGrid 
            rows={workCalendarlist.map((item) => {
              return {
                id: item._id,
                totalWorkingDays: item.totalWorkingDays || "N/A",
                totalHolidays: item.totalHolidays || "N/A",
                month: item.month || "N/A",
                year: item.year || "N/A",
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
        {workCalendarlist?.length === 0 && (
          <div className="no-data">
            <p>No Data Found</p>
          </div>
        )}
        <AddWorkCalendar
          open={open}
          onClose={handleClose}
          listworkingCalendar={handleListWorkCalendar}
          editMode={editMode}
          workcalendar={selectedRow}
          errors={errors}
          setErrors={setErrors}
        ></AddWorkCalendar>
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default WorkCalendar;
