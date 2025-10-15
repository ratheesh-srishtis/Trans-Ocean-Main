import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getAllEmployeeLeaveRequests,
  approveEmployeeLeaveRequests,
} from "../../services/apiLeavePortal";
import { getAllEmployees } from "../../services/apiEmployee";
import "../../css/payment.css";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
import Loader from "../Loader";
const LeaveRequests = ({ loginResponse }) => {
  const Group = require("../../assets/images/leave.png");
  const [LeaverequestLists, setLeaverequestLists] = useState([]);
  const [EmployeeList, setEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const fecthEmployeeLeaveRequests = async (paylaod) => {
    const response = await getAllEmployeeLeaveRequests(paylaod);
    setLeaverequestLists(response?.leaves || []);
    console.log("Leave Requests Data:", response);
  };

  const fetchemployeeList = async (payload) => {
    try {
      const listallemployees = await getAllEmployees(payload);
      setEmployeeList(listallemployees?.employees || []);
      //console.log(listallemployees,"---listallemployees");
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  useEffect(() => {
    let payload = { searchKey: "" };
    fetchemployeeList(payload);
  }, []);

  useEffect(() => {
    console.log(EmployeeList, "EmployeeList");
  }, [EmployeeList]);

  useEffect(() => {
    const payload = { userId: loginResponse?.data?._id };
    fecthEmployeeLeaveRequests(payload);
  }, [loginResponse?.data?._id]);

  useEffect(() => {
    console.log(LeaverequestLists, "LeaverequestLists");
  }, [LeaverequestLists]);
  const handleApprove = async (leaveId) => {
    try {
      const payload = {
        userId: loginResponse?.data?._id,
        leaveId: leaveId,
      };
      let response = await approveEmployeeLeaveRequests(payload);
      if (response.status === true) {
        setIsLoading(false); // Hide loader
        setOpenPopUp(true);
        setMessage(response.message);
        const payload = { userId: loginResponse?.data?._id };
        fecthEmployeeLeaveRequests(payload);
      } else {
        setIsLoading(false); // Hide loader
        setMessage(response.message);
        setOpenPopUp(true);
      }
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };

  const columns = [
    { field: "employeeName", headerName: "Employee Name", flex: 2 },
    { field: "leaveType", headerName: "Leave Type", flex: 2 },
    { field: "leaveFrom", headerName: "Leave From", flex: 2 },
    { field: "leaveTo", headerName: "Leave To", flex: 2 },
    { field: "comment", headerName: "Comment", flex: 2 },
    { field: "approvedBy", headerName: "Approved By", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      flex: 2,
      renderCell: (params) => {
        // Check if the logged-in user has already approved this leave
        let isApproved = false;

        if (
          params.row.approvalEmployee === loginResponse?.data?._id &&
          params.row.approvalEmployeeStatus
        ) {
          isApproved = true;
        } else if (
          params.row.approvalHead === loginResponse?.data?._id &&
          params.row.approvalHeadStatus
        ) {
          isApproved = true;
        }

        return (
          <div style={{ alignItems: "center" }}>
            <button
              className={isApproved ? "btn btn-secondary" : "btn btn-success"}
              style={{ fontSize: "12px", padding: "4px 8px" }}
              onClick={() => handleApprove(params.row._id)}
              disabled={isApproved}
            >
              {isApproved ? "Approved" : "Approve"}
            </button>
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

        <div className="mt-5">
          <DataGrid
            rows={LeaverequestLists.map((item) => {
              const datefrom = item.leaveFrom.split("T")[0];
              const [fromyear, frommonth, fromday] = datefrom.split("-");
              const leaveFrom = `${fromday}-${frommonth}-${fromyear}`;
              const dateto = item.leaveTo.split("T")[0];
              const [year, month, day] = dateto.split("-");
              const leaveTo = `${day}-${month}-${year}`;

              // Logic for Approved By field
              let approvedBy = "";
              const approvedNames = [];

              if (item.approvalEmployeeStatus && item.approvalEmployee) {
                const approvalEmployee = EmployeeList.find(
                  (emp) => emp._id === item.approvalEmployee
                );
                if (approvalEmployee) {
                  approvedNames.push(approvalEmployee.employeeName);
                }
              }

              if (item.approvalHeadStatus && item.approvalHead) {
                const approvalHead = EmployeeList.find(
                  (emp) => emp._id === item.approvalHead
                );
                if (approvalHead) {
                  approvedNames.push(approvalHead.employeeName);
                }
              }

              approvedBy =
                approvedNames.length > 0 ? approvedNames.join(", ") : "N/A";

              return {
                ...item,
                id: item._id,
                employeeName: item.employeeId
                  ? `${item.employeeId.employeeName} ${item.employeeId.employeeLastName}`
                  : "N/A",
                leaveType: item.leaveType || "N/A",
                leaveFrom: leaveFrom || "N/A",
                leaveTo: leaveTo || "N/A",
                comment: item.comment || "N/A",
                approvedBy: approvedBy,
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
        {LeaverequestLists?.length === 0 && (
          <div className="no-data">
            <p>No Data Found</p>
          </div>
        )}
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default LeaveRequests;
