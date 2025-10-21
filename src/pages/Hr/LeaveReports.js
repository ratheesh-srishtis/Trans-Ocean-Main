import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { leaveReport } from "../../services/apiLeavePortal";
import { getAllEmployees } from "../../services/apiEmployee";
import "../../css/payment.css";

const LeaveReports = () => {
  const Group = require("../../assets/images/leavereport.png");
  const [summary, setSummary] = useState([]);
  const [EmployeeList, setEmployeeList] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [empMonth, setMonth] = useState("");
  const [empYear, setYear] = useState("");

  const LeaveSummary = async (payload) => {
    const listSummary = await leaveReport(payload);
    //console.log(listSummary,"-listSummary");
    setSummary(listSummary.result ? listSummary.result : []);
  };

  const fetchemployeeList = async () => {
    try {
      const listallemployees = await getAllEmployees();
      setEmployeeList(listallemployees?.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  useEffect(() => {
    const today = new Date();
    const current_month = String(today.getMonth() + 1).padStart(2, "0"); // Current month
    const current_year = String(today.getFullYear()); // Current year

    setCurrentMonth(current_month);
    setCurrentYear(current_year);
    setMonth(current_month);
    setYear(current_year);
    let payload = { month: current_month, year: current_year };
    LeaveSummary(payload);
    fetchemployeeList();
  }, []);

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const columns = [
    { field: "empId", headerName: "Employee ID", flex: 2 },
    { field: "empName", headerName: "Employee Name", flex: 2 },
    { field: "designation", headerName: "Designation", flex: 2 },
    {
      field: "leaves",
      headerName: "Leave Taken",
      flex: 3,
      renderCell: (params) => (
        <Typography
          style={{
            whiteSpace: "pre-wrap",
            textAlign: "left",
            width: "100%",
            fontSize: "0.9rem",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    { field: "leaveCount", headerName: "No. of Leaves", flex: 2 },
    { field: "workingDays", headerName: "No. of Working Days", flex: 2 },
  ];
  const getRowHeight = (params) => {
    const lineHeight = 30; // Adjust as necessary
    const leaves = params.model.leaves || ""; // Default to an empty string if leaves is undefined
    const numberOfLines = leaves.split("\n").length;
    return lineHeight * numberOfLines;
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

  const handleTimeperiod = async (e) => {
    const SelectBxname = e.target.name;
    let payload = "";
    if (SelectBxname === "month") {
      setMonth(e.target.value);
      payload = {
        employeeId: employeeId,
        month: e.target.value,
        year: empYear || currentYear,
      };
    }
    if (SelectBxname === "year") {
      setYear(e.target.value);
      payload = {
        employeeId: employeeId,
        month: empMonth || currentMonth,
        year: e.target.value,
      };
    }

    LeaveSummary(payload);
  };

  const handleChange = (e) => {
    let payload = {
      employeeId: e.target.value,
      month: empMonth || currentMonth,
      year: empYear || currentYear,
    };
    setEmployeeId(e.target.value);
    LeaveSummary(payload);
  };

  return (
    <div>
      <div className=" mt-3 d-flex">
        <div className=" d-flex paymentbycus">
          <label
            htmlFor="exampleFormControlInput1"
            className="form-label filterbypayment costcenterinput"
          >
            Employee Name:
          </label>
          <div className="vessel-select">
            <select
              className="form-select mmonthpayment"
              name="vendors"
              onChange={handleChange}
            >
              <option value="">Choose Employee</option>
              {EmployeeList.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.employeeName} {emp.employeeLastName}{" "}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className=" d-flex filterpayment">
          <label
            htmlFor="exampleFormControlInput1"
            className="form-label filterbypayment costcenterinput "
          >
            Choose Month & Year:
          </label>
          <select
            name="month"
            className="form-select jobporrt mmonthpayment monthcustomerpay"
            onChange={handleTimeperiod}
            value={empMonth || currentMonth}
          >
            <option value="">Select Month</option>
            {months.map((month, index) => (
              <option key={index} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            name="year"
            className="form-select  yearlist mmonthpayment monthcustomerpay"
            onChange={handleTimeperiod}
            value={empYear || currentYear}
          >
            <option value="">Select Year</option>
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="charge">
        <div className="rectangle"></div>
        <div>
          <img src={Group} alt="Group" />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <DataGrid
            localeText={{
              noRowsLabel: "", // Hides the text
            }}
            rows={summary.map((item, index) => {
              //const leaves = item.leaveTaken.map(leave => leave.leave).join("\n") || 'N/A';
              const leaves =
                item.leaveTaken
                  ?.map((leave) => `${leave.leave} (${leave.type})`)
                  .join("\n") || "N/A";

              return {
                empId: item.employeeId || "N/A",
                empName: item.employee + " " + item.employeeLastName || "N/A",
                designation: item.designation || "N/A",
                leaves: leaves,
                leaveCount: item.leaveTakenCount || "N/A",
                workingDays: item.workingDays || "N/A",
                id: index, // Use index as a unique ID if _id is not available
              };
            })}
            columns={columns}
            components={{
              NoRowsOverlay,
            }}
            sx={{
              margin: "16px",
              overflowX: "hidden",
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#eee !important",
                color: "#000000",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                whiteSpace: "pre-wrap",
                textAlign: "left", // Center align the cell content
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
              "& .MuiTablePagination-toolbar": {
                alignItems: "baseline",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#eee",
              },
            }}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                  page: 0,
                },
              },
            }}
            getRowHeight={getRowHeight}
          />
        </div>
      </div>
      {summary.length === 0 && (
        <div className="no-data">
          <p>No Data Found</p>
        </div>
      )}
    </div>
  );
};

export default LeaveReports;
