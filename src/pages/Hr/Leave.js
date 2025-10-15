import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getAllEmployeeLeaves,
  getAllUserLeaves,
  deleteLeave,
} from "../../services/apiLeavePortal";
import "../../css/payment.css";
import AddLeave from "./AddLeave";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
import Loader from "../Loader";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const Leave = ({ loginResponse }) => {
  const Group = require("../../assets/images/leave.png");
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [LeaveList, SetEmpLeaves] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [leaveCounts, setLeaveCounts] = useState({
    remainingAnnualLeave: 0,
    remainingCasuallLeave: 0,
    remainingSicklLeave: 0,
    remainingEmergencyLeave: 0,
  });

  useEffect(() => {
    fecthUserLeaves({ userId: loginResponse?.data?._id });
  }, [loginResponse]);

  // const fecthEmployeeLeaves = async (paylaod) => {
  //   console.log("payload", paylaod);
  //   const listLeaves = await getAllEmployeeLeaves(paylaod);
  //   SetEmpLeaves(listLeaves?.leaves || []);

  //   // Update leave counts
  //   setLeaveCounts({
  //     remainingAnnualLeave: listLeaves?.remainingAnnualLeave || 0,
  //     remainingCasuallLeave: listLeaves?.remainingCasuallLeave || 0,
  //     remainingSicklLeave: listLeaves?.remainingSicklLeave || 0,
  //     remainingEmergencyLeave: listLeaves?.remainingEmergencyLeave || 0,
  //   });
  // };
  const fecthUserLeaves = async (paylaod) => {
    console.log("payload", paylaod);
    const listLeaves = await getAllUserLeaves(paylaod);
    SetEmpLeaves(listLeaves?.leaves || []);
    setEmployeeId(listLeaves?.employeeId || "");

    // Update leave counts
    setLeaveCounts({
      remainingAnnualLeave: listLeaves?.remainingAnnualLeave || 0,
      remainingCasuallLeave: listLeaves?.remainingCasuallLeave || 0,
      remainingSicklLeave: listLeaves?.remainingSicklLeave || 0,
      remainingEmergencyLeave: listLeaves?.remainingEmergencyLeave || 0,
    });
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditMode(true);
    OpenDialog();
  };
  const handleListLeaves = (payload) => {
    setEditMode(false);
    // fecthUserLeaves(payload);
    setOpen(false);
  };
  const payloadParams = { employeeId: employeeId };
  const handleDelete = async (leaveId) => {
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
        if (leaveId) {
          try {
            let payload = {
              leaveId: leaveId,
            };
            const response = await deleteLeave(payload);
            setMessage(response.message);
            setOpenPopUp(true);
            fecthUserLeaves(payloadParams);
          } catch (error) {
            Swal.fire("Error deleting leaves");
            fecthUserLeaves(payloadParams);
          }
        }
      }
    });
  };
  const columns = [
    { field: "leaveType", headerName: "Leave Type", flex: 2 },
    {
      field: "leaveMode",
      headerName: "Leave Mode",
      flex: 2,
      renderCell: (params) => {
        return params.row.leaveMode?.leaveType || "N/A";
      },
    },
    { field: "leaveFrom", headerName: "Leave From", flex: 2 },
    { field: "leaveTo", headerName: "Leave To", flex: 2 },
    { field: "comment", headerName: "Comment", flex: 2 },
    { field: "approvedBy", headerName: "Approved By", flex: 2 },
    {
      field: "actions",
      headerName: "Action",
      flex: 2,
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
  const OpenDialog = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setErrors({});
    const payload = { employeeId: employeeId };
    fecthUserLeaves({ userId: loginResponse?.data?._id });
  };

  const handleExportToExcel = () => {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Prepare data for Excel export
      const excelData = LeaveList.map((item) => {
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
          approvedNames.push(item.approvalEmployee.employeeName);
        }

        if (item.approvalHeadStatus && item.approvalHead) {
          approvedNames.push(item.approvalHead.employeeName);
        }

        approvedBy =
          approvedNames.length > 0 ? approvedNames.join(", ") : "N/A";

        return {
          "Leave Type": item.leaveType || "N/A",
          "Leave Mode": item.leaveMode?.leaveType || "N/A",
          "Leave From": leaveFrom || "N/A",
          "Leave To": leaveTo || "N/A",
          Comment: item.comment || "N/A",
          "Approved By": approvedBy,
        };
      });

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      worksheet["!cols"] = [
        { wch: 15 }, // Leave Type
        { wch: 15 }, // Leave Mode
        { wch: 15 }, // Leave From
        { wch: 15 }, // Leave To
        { wch: 30 }, // Comment
        { wch: 20 }, // Approved By
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "User Leaves");

      // Generate filename
      const fileName = "User Leaves.xlsx";

      // Convert to buffer and save
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);

      console.log(`Excel file exported successfully: ${fileName}`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      Swal.fire(
        "Error",
        "Error exporting to Excel. Please try again.",
        "error"
      );
    }
  };
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
              className="btn btn-info infobtn addleave"
              onClick={handleExportToExcel}
            >
              Download Excel
            </button>
          </div>
          <div className="">
            <button
              onClick={() => {
                OpenDialog();
              }}
              className="btn btn-info infobtn addleave"
            >
              Add Leave
            </button>
          </div>
        </div>

        {/* Leave Count Cards */}
        <div className="leave-cards-container mt-4 mb-4">
          <div className="row g-3">
            <div className="col-md-3 col-sm-6">
              <div className="leave-card annual-leave">
                <div className="leave-card-header">
                  <h6 className="leave-card-title">Annual Leave</h6>
                </div>
                <div className="leave-card-body">
                  <h2 className="leave-count">
                    {leaveCounts.remainingAnnualLeave}
                  </h2>
                  <p className="leave-subtitle">Days Available</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="leave-card casual-leave">
                <div className="leave-card-header">
                  <h6 className="leave-card-title">Casual Leave</h6>
                </div>
                <div className="leave-card-body">
                  <h2 className="leave-count">
                    {leaveCounts.remainingCasuallLeave}
                  </h2>
                  <p className="leave-subtitle">Days Available</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="leave-card sick-leave">
                <div className="leave-card-header">
                  <h6 className="leave-card-title">Sick Leave</h6>
                </div>
                <div className="leave-card-body">
                  <h2 className="leave-count">
                    {leaveCounts.remainingSicklLeave}
                  </h2>
                  <p className="leave-subtitle">Days Available</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="leave-card emergency-leave">
                <div className="leave-card-header">
                  <h6 className="leave-card-title">Emergency Leave</h6>
                </div>
                <div className="leave-card-body">
                  <h2 className="leave-count">
                    {leaveCounts.remainingEmergencyLeave}
                  </h2>
                  <p className="leave-subtitle">Days Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <DataGrid
            rows={LeaveList.map((item) => {
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
                approvedNames.push(item.approvalEmployee.employeeName);
              }

              if (item.approvalHeadStatus && item.approvalHead) {
                approvedNames.push(item.approvalHead.employeeName);
              }

              approvedBy =
                approvedNames.length > 0 ? approvedNames.join(", ") : "N/A";

              return {
                ...item,
                id: item._id,
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
        {LeaveList?.length === 0 && (
          <div className="no-data">
            <p>No Data Found</p>
          </div>
        )}

        {!employeeId && (
          <>
            <p>This user is not added by admin yet</p>
          </>
        )}
        {employeeId && (
          <>
            <AddLeave
              open={open}
              onClose={handleClose}
              listLeaves={handleListLeaves}
              employeeId={employeeId}
              editMode={editMode}
              leavevalues={selectedRow}
              errors={errors}
              setErrors={setErrors}
            ></AddLeave>
          </>
        )}
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default Leave;
