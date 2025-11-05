// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/jobreport.css";
import PopUp from "../PopUp";
import { getJobReport, jobReportPDF } from "../../services/apiService";
import Loader from "../Loader";
import JobReportTable from "./JobReportTable";
import Select from "react-select";
import Multiselect from "multiselect-react-dropdown";
import { useLocation } from "react-router-dom";

const JobReport = ({
  open,
  onClose,
  templates,
  charge,
  services,
  ports,
  customers,
  vendors,
}) => {
  const [openPopUp, setOpenPopUp] = useState(false);
  const Group = require("../../assets/images/reporttttt.png");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [reportList, setReportList] = useState(null);
  const [reportTableList, setReportTableList] = useState(null);

  const customStyles = {
    multiselectContainer: {
      // Optional: Style for the container if needed
    },
    option: {
      fontSize: "0.7rem", // Set font size for dropdown options
      padding: "5px 10px", // Optional: Add padding for better spacing
      cursor: "pointer", // Ensure options look clickable
    },
    optionContainer: {
      // Optional: Customize the option container (dropdown menu)
    },
  };

  const hoverStyles = {
    backgroundColor: "#eee !important", // Apply the background color on hover
  };

  const [selectedJobs, setSelectedJobs] = useState([]);
  const [jobsList, setJobsList] = useState([]); // Array of selected job _ids

  const [filterType, setFilterType] = useState("month"); // Default to "monthly"
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  ); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  const handleChildDataChange = (newFilterType, newMonth, newYear) => {
    setFilterType(newFilterType);
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    fetchJobReport({
      filter: newFilterType,
      month: newMonth,
      year: String(newYear),
      jobs: selectedIds,
      assignedEmployee: "",
    });
  };

  const fetchJobReport = async (customPayload = null) => {
    alert("fetchJobReport called");
    console.log(selectedYear, "selectedYear_fetchJobReport");
    setIsLoading(true);
    // Use the customPayload if provided, else use the current state values
    const payload = customPayload || {
      filter: filterType,
      month: selectedMonth,
      year: String(selectedYear),
      jobs: selectedIds,
      assignedEmployee: "",
    };
    console.log(customPayload, "customPayload_fetchJobReport");
    console.log(payload, "payload_fetchJobReport");
    try {
      const reportResponse = await getJobReport(payload);
      console.log(reportResponse, "reportResponse");
      // setSelectedJobs(reportResponse?.jobs);
      setReportList(reportResponse);
      setReportTableList(reportResponse?.pda);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  const fetchInitialJobReport = async () => {
    // alert("fetchInitialJobReport called");
    setIsLoading(true);
    const payload = {
      filter: filterType,
      month: selectedMonth,
      year: String(selectedYear),
      jobs: selectedIds,
      assignedEmployee: "",
    };
    try {

      const reportResponse = await getJobReport(payload);
      console.log(reportResponse, "reportResponse");
      setSelectedJobs(reportResponse?.jobs);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelect = (selectedList) => {
    const ids = selectedList.map((item) => item._id); // Extract the selected _id values
    setSelectedIds(ids);
    console.log("Selected IDs:", ids); // Log the selected IDs
  };

  const handleRemove = (selectedList) => {
    const ids = selectedList.map((item) => item._id); // Extract the selected _id values
    setSelectedIds(ids);
    console.log("Updated Selected IDs:", ids); // Log the updated IDs
  };

  const [isClicked, setIsClicked] = useState(false);

  const filterbyJobs = () => {
    setIsClicked(true); // Notify the child of the click
    fetchJobReport();
  };

  const resetClick = () => {
    setIsClicked(false); // Reset the state (optional)
    fetchJobReport();
  };

  const getPDF = async () => {
    const payload = {
      filter: filterType,
      month: selectedMonth,
      year: String(selectedYear),
      jobs: selectedIds,
      assignedEmployee: "",
    };
    console.log(payload, "payload_getReport");
    try {
      const response = await jobReportPDF(payload);
      console.log("getPettyCashReport", response);

      if (response?.pdfPath) {
        const pdfUrl = `${process.env.REACT_APP_ASSET_URL}${response.pdfPath}`;
        // Fetch the PDF as a Blob
        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        // Create a hidden anchor tag to trigger the download
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.setAttribute("download", "Job Report.pdf"); // Set the file name
        document.body.appendChild(link);
        link.click();
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfBlobUrl);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  // Create Excel for Job Report (matching DataGrid columns and data, using filteredQuotations from JobReportTable)
  const [filteredQuotations, setFilteredQuotations] = useState([]);

  // Handler to receive filtered data from JobReportTable
  const handleFilteredQuotations = (filtered) => {
    setFilteredQuotations(filtered);
  };

  const createExcel = () => {
    if (!filteredQuotations || filteredQuotations.length === 0) return;
    const excelData = filteredQuotations.map((item) => ({
      "Job ID": item.jobId || "N/A",
      "Vessel Name": item.vesselId?.[0]?.vesselName || "N/A",
      Job:
        item.jobs
          ?.map((job) => job.service?.[0]?.serviceName || "N/A")
          ?.join(", ") || "N/A",
      "Port Name": item.portId?.[0]?.portName || "N/A",
      "Ops By": item.assignedEmployee?.[0]?.name || "N/A",
      Status:
        item.pdaStatus === 5
          ? "Customer Approved"
          : item.pdaStatus === 6
            ? "Pending from operations"
            : item.pdaStatus === 7
              ? "Operations Completed"
              : "Unknown Status",
    }));
    const XLSX = require("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet["!cols"] = [
      { wch: 15 }, // Job ID
      { wch: 20 }, // Vessel Name
      { wch: 30 }, // Job
      { wch: 20 }, // Port Name
      { wch: 20 }, // Ops By
      { wch: 20 }, // Status
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "JobReport");
    XLSX.writeFile(workbook, "Job Report.xlsx");
  };

  const location = useLocation();

  useEffect(() => {
    const wasRefreshed = sessionStorage.getItem("wasRefreshed") === "true";

    if (wasRefreshed) {
      // Clear sessionStorage
      sessionStorage.removeItem("wasRefreshed");
      sessionStorage.removeItem("jobReportFilters");

      // Reset states to initial values
      setFilterType("");
      setSelectedMonth("");
      setSelectedYear("");
      setSelectedIds([]);
      return;
    }

    // Try location.state first (in case user comes via redirect)
    let restoredFilters = location.state?.filterState;

    // If not available, check sessionStorage
    if (!restoredFilters) {
      const stored = sessionStorage.getItem("jobReportFilters");
      if (stored) {
        restoredFilters = JSON.parse(stored);
      }
    }

    if (restoredFilters) {
      console.log(restoredFilters, "restoredFilters");
      const {
        filterType,
        selectedMonth,
        selectedYear,
        selectedIds,
        selectedPort,
        selectedStatus,
      } = restoredFilters;

      setFilterType(filterType);
      setSelectedMonth(selectedMonth);
      setSelectedYear(selectedYear);
      setSelectedIds(selectedIds);
      fetchJobReport();
      fetchInitialJobReport();

      // Optional: Clear from sessionStorage if you want single-use
      // sessionStorage.removeItem("jobReportFilters");
    }
  }, []);

  useEffect(() => {
    fetchJobReport();
  }, []);
  useEffect(() => {
    fetchInitialJobReport();
  }, []);

  useEffect(() => {
    console.log(selectedJobs, "selectedJobs");
    console.log(selectedIds, "selectedIds");
    console.log(selectedMonth, "selectedMonth");
    console.log(filterType, "filterType");
    // fetchJobReport();
    // fetchInitialJobReport();
  }, [selectedJobs, selectedIds, selectedMonth, filterType]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("wasRefreshed", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <div className="p-3">
        <div className="jobreport-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="summary me-2">SUMMARY</div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-info filbtnjob"
              onClick={() => {
                getPDF();
              }}
            >
              Download PDF
            </button>
            <button className="btn btn-info filbtnjob" onClick={createExcel}>
              Download Excel
            </button>
          </div>
        </div>
        <div className="bb"> </div>
        <div className=" mt-3 d-flex">
          <div className=" totalno">
            <label htmlFor="inputPassword" className=" form-label">
              Total No.of Vessels :
            </label>
            <input
              type="text"
              className="form-control totalnoinputb"
              id="inputPassword"
              value={reportList?.totalVessels}
              readOnly
            ></input>
          </div>

          <div className="totalno">
            <label htmlFor="inputPassword" className=" form-label">
              Total No.of Services :
            </label>
            <input
              type="text"
              className="form-control totalnoinputa"
              id="inputPassword"
              value={reportList?.totalServices}
              readOnly
            ></input>
          </div>

          <div className="totalno">
            <label htmlFor="inputPassword" className=" form-label">
              {" "}
              No.of Tanker Vessels :
            </label>
            <input
              type="text"
              className="form-control totalnoinput"
              id="inputPassword"
              value={reportList?.totalTankerVessels}
              readOnly
            ></input>
          </div>

          <div className=" totalno">
            <label htmlFor="inputPassword" className=" form-label">
              {" "}
              No.of Bulk Vessels :
            </label>
            <input
              type="text"
              className="form-control totalnoinput"
              id="inputPassword"
              value={reportList?.totalBulkVessels}
              readOnly
            ></input>
          </div>
          <div className="totalno">
            <label htmlFor="inputPassword" className=" form-label">
              Other Client Vessels :
            </label>
            <input
              type="text"
              className="form-control totalnoinput"
              id="inputPassword"
              value={
                reportList?.totalVessels -
                (reportList?.totalTankerVessels + reportList?.totalBulkVessels)
              }
              readOnly
            ></input>
          </div>
        </div>
        <div className="row mt-3"></div>
        <div className="bbn"> </div>
        <div className="row mt-3">
          <div className="col-10 jobtotal ">
            <label htmlFor="inputPassword" className=" form-label jobused ms-3 ms-sm-1">
              {" "}
              Jobs used in each port :
            </label>
            <Multiselect
              options={selectedJobs}
              displayValue="serviceName" // Display the serviceName in the dropdown
              showCheckbox
              onSelect={handleSelect} // Triggered when an item is selected
              onRemove={handleRemove} // Triggered when an item is removed
              className="custom-multiselect" // Apply custom class
              style={{
                ...customStyles,
                option: {
                  ...customStyles.option,
                  ":hover": hoverStyles, // Add hover styling
                },
              }}
            />
          </div>

          <div className="col-1">
            <button
              type="button"
              className="btn btn-info filbtn"
              onClick={() => filterbyJobs()}
            >
              Filter
            </button>
          </div>
        </div>
        <div className="charge mt-2">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>

        <div className="createtable mt-4">
          <JobReportTable
            ports={ports}
            isClicked={isClicked}
            onReset={resetClick}
            selectedIds={selectedIds}
            filterType={filterType}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDataChange={handleChildDataChange}
            reportTableList={reportTableList}
            onFilteredQuotationsChange={handleFilteredQuotations}
          />
        </div>
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default JobReport;
