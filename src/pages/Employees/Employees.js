import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllEmployees, deleteEmployee } from "../../services/apiEmployee";
import Swal from "sweetalert2";
import Loader from "../../pages/Loader";
import PopUp from "../PopUp";
import "../../css/payment.css";
const Employees = () => {
  const Group = require("../../assets/images/employee.png");
  const [EmployeeList, setEmployeeList] = useState([]);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate("/add-employee");
  };
  const redirectToLeaves = (empid) => {
    localStorage.setItem("employeeId", empid);
    navigate("/employee-leaves");
  };
  const handleEdit = (empdata) => {
    console.log(empdata, "empdata");
    navigate("/add-employee", {
      state: {
        employeeId: empdata._id,
        employeeName: empdata.employeeName,
        username: empdata.username,
        password: empdata.password,
        employeeLastName: empdata.employeeLastName,
        dob: empdata.dob,
        address: empdata.address,
        nationality: empdata.nationality,
        city: empdata.city,
        state: empdata.state,
        postcode: empdata.postcode,
        contactNumber: empdata.contactNumber,
        email: empdata.email,
        passportNumber: empdata.passportNumber,
        iqamaNumber: empdata.iqamaNumber,
        dateOfJoining: empdata.dateOfJoining,
        profession: empdata.profession,
        designation: empdata.designation,
        department: empdata.department,
        officialEmail: empdata.officialEmail,
        passportDetails: empdata.passportDetails,
        contractDetails: empdata.contractDetails,
        visaDetails: empdata.visaDetails,
        licenseDetails: empdata.licenseDetails,
        certificationDetails: empdata.certificationDetails,
        medicalRecordDetails: empdata.medicalRecordDetails,
        reportingTo: empdata.reportingTo,
        reportingHead: empdata.reportingHead,
        isEditing: true,
      },
    });
  };
  const fetchemployeeList = async (payload) => {
    setIsLoading(true);
    try {
      const listallemployees = await getAllEmployees(payload);
      setEmployeeList(listallemployees?.employees || []);
      //console.log(listallemployees,"---listallemployees");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      console.error("Failed to fetch employeed", error);
    }
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
              employeeId: item?._id,
            };
            const response = await deleteEmployee(payload);
            setMessage(response.message);
            setOpenPopUp(true);
            fetchemployeeList();
          } catch (error) {
            Swal.fire("Error deleting Employee");
            fetchemployeeList();
          }
        }
      }
    });
  };

  useEffect(() => {
    let payload = { searchKey: "" };
    fetchemployeeList(payload);
  }, []);
  const handleSearch = (event) => {
    let searchpayload = { searchKey: event.target.value };
    fetchemployeeList(searchpayload);
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
    { field: "employeeId", headerName: "Employee ID", flex: 1.25 },
    { field: "empName", headerName: "Employee Name", flex: 1.25 },
    { field: "dateOfjoining", headerName: "Date of Joining", flex: 1 },
    { field: "iquma", headerName: "Civil ID", flex: 1 }, // Set a fixed width for Iquama ID
    { field: "passport", headerName: "Passport No", flex: 1 },
    { field: "address", headerName: "Address", flex: 1.5 },
    {
      field: "desigination",
      headerName: "Designation",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,

      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row)}
          >
            <DeleteIcon sx={{ fontSize: "19px" }} />
          </IconButton>
          <i
            className="bi bi-calendar-minus minusemployee"
            onClick={() => redirectToLeaves(params.row._id)}
          ></i>
        </div>
      ),
    },
  ];

  useEffect(() => {
    console.log(EmployeeList, "EmployeeList");
  }, [EmployeeList]);
  return (
    <>
      <div>
        <div>
          <div className=" mt-3 mb-3 employeeadd">
            <div className="searchmainemployee">
              <input
                type="text"
                className="form-control searchemployee"
                id="exampleFormControlInput1"
                placeholder="Employee Name"
                style={{ width: "auto" }}
                onChange={handleSearch}
              />
              <i className="bi bi-search searchicon"></i>
            </div>

            <div className="">
              {" "}
              <button
                className="btn btna submit-button btnfsize"
                onClick={handleRedirect}
              >
                Add Employee
              </button>
            </div>
          </div>
          <div className="charge mb-3">
            <div className="rectangle"></div>
            <div>
              <img src={Group}></img>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <DataGrid
            localeText={{
              noRowsLabel: "", // Hides the text
            }}
            rows={EmployeeList.map((item) => {
              const dateOnly = item.dateOfJoining.split("T")[0];
              const [year, month, day] = dateOnly.split("-");
              const formattedDate = `${day}-${month}-${year}`;
              return {
                id: item._id,
                employeeId: "N/A",
                empName:
                  item.employeeName + " " + item.employeeLastName || "N/A",
                dateOfjoining: formattedDate || "N/A",
                iquma: item.iqamaNumber || "N/A",
                passport: item.passportNumber || "N/A",
                address: item.address || "N/A",
                desigination: item.designation.designationName || "N/A",
                ...item,
              };
            })}
            columns={columns}
            getRowId={(row) => row._id} // Use id field for unique row identification
            disableSelectionOnClick // Disables checkbox selection to prevent empty column
            disableColumnMenu // Removes column menu
            sx={{
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
      </div>
      {EmployeeList?.length === 0 && (
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

export default Employees;
