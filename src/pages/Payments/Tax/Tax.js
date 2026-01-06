import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import Loader from "../../Loader";
import PopUp from "../../PopUp";
import { getTaxDetails, deleteTax } from "../../../services/apiSubPayments";
import moment from "moment";
import AddTax from "./AddTax";

const Tax = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [otherIncomeList, setOtherIncomeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const fetchTaxDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getTaxDetails();
      console.log("getTaxDetails:", response?.tax);
      setOtherIncomeList(response?.tax);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxDetails();
  }, []);

  const openDialog = () => {
    handleClickOpen();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedRow(null);
    setErrors({});
    fetchTaxDetails();
  };
  const handleAddUser = (newUsers) => {
    fetchTaxDetails();
    setOpen(false);
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
              taxId: item?._id,
            };
            const response = await deleteTax(payload);
            setMessage("Tax deleted successfully");
            setOpenPopUp(true);
            fetchTaxDetails();
          } catch (error) {
            Swal.fire("Error deleting Role");
            fetchTaxDetails();
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
    { field: "year", headerName: "Year", flex: 2 },
    { field: "bank", headerName: "Bank", flex: 2 },
    { field: "modeofPayment", headerName: "Mode Of Payment", flex: 2 },
    { field: "amount", headerName: "Amount", flex: 2 },
    { field: "paymentDate", headerName: "Payment Date", flex: 2 },
    { field: "isPaid", headerName: "Is Paid", flex: 2 },
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
          Add Tax
        </button>
      </div>
      <AddTax
        open={open}
        onAddUser={handleAddUser}
        onClose={handleClose}
        editMode={editMode}
        userSet={selectedRow}
        errors={errors}
        setErrors={setErrors}
      />
      <div>
        <DataGrid
          rows={otherIncomeList.map((item) => ({
            ...item,
            id: item._id,
            year: item.year || "N/A",
            bank: item.bank?.bankName ?? "N/A",
            modeofPayment: item.modeofPayment || "N/A",
            amount: item.amount ?? "N/A",

            paymentDate: item.paymentDate
              ? moment(item.paymentDate).format("DD-MM-YYYY")
              : "N/A",
            isPaid:
              item.isPaid === true
                ? "Yes"
                : item.isPaid === false
                ? "No"
                : "N/A",
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
      {otherIncomeList?.length === 0 && (
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

export default Tax;
