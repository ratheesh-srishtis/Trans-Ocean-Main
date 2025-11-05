import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/ops-dashboard.css";
import { getAllJobs, deleteQuotation } from "../../services/apiService";
import Loader from "../Loader";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
import { useAuth } from "../../context/AuthContext";
const OpsDashboard = () => {
  const { loginResponse } = useAuth();

  const Group = require("../../assets/images/hugeicons_new-job.png");
  const [jobsList, setJobsList] = useState([]); // Loader state
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("all");
  const [statusList, setStatusList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const fetchAllJObs = async (type, status, searchValue) => {
    setSelectedTab(type);
    try {
      setIsLoading(true);
      let userData = {
        filter: type, // Always include the filter
        statusFilter: status, // Include statusFilter if selectedStatus has a value
        searchKey: searchValue, // Include searchKey if searchTerm has a value
        assignedEmployee: (() => {
          // First check: if roleType is not "operations", return ""
          if (
            loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
            "operations"
          ) {
            return "";
          }

          // If roleType is "operations", check designationType
          const designationType =
            loginResponse?.data?.userRole?.role?.designationType?.toLowerCase();

          // If designationType is "operationsmanager" or "operationshead", return ""
          if (
            ["operationsmanager", "operationshead"].includes(designationType)
          ) {
            return "";
          }

          // If designationType is empty (""), return the user ID
          // Note: If you meant roleType instead of _id, you can change this line
          if (!designationType || designationType === "") {
            return loginResponse?.data?._id;
          }

          // Default fallback
          return "";
        })(),
      };
      const quotations = await getAllJobs(userData);
      console.log("Quotations:", quotations);
      setJobsList(quotations?.pda || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setStatusList([
      { label: "All", value: "all" },
      { label: "Customer Approved", value: 5 },
      { label: "Pending From Operations", value: 6 },
      { label: "Operations Completed", value: 7 },
    ]);
  }, []);
  useEffect(() => {
    fetchAllJObs("all", selectedStatus, searchTerm);
  }, []);

  useEffect(() => {
    console.log(jobsList, "jobsList");
  }, [jobsList]);

  const handleEditJob = (row) => {
    navigate("/edit-operation", { state: { row } });
  };

  const handleJobClick = (row) => {
    navigate("/view-operation", { state: { row } });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "status":
        setSelectedStatus(value);
        fetchAllJObs(selectedTab, value, searchTerm); // Call fetchAllJobs with the updated status
        break;
      default:
        break;
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    fetchAllJObs(selectedTab, selectedStatus, value);
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
        if (item?._id) {
          try {
            let payload = {
              pdaId: item?._id,
            };
            const response = await deleteQuotation(payload);
            console.log("Fetched Charges:", response);
            setMessage("Quotation has been successfully deleted");
            setOpenPopUp(true);
            fetchAllJObs("all");
          } catch (error) {
            console.error("Error fetching charges:", error);
            Swal.fire("Error deleting quotation");
            fetchAllJObs("all");
          }
        }
      }
    });
  };

  // Initializing state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Calculate total pages
  const totalItems = jobsList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate indices for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobsList.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <>
      <div className="d-flex justify-content-between mt-3">
        <div className="leftside d-flex">
          <ul className="nav nav-underline gap-3 ">
            <li className="nav-item nav-item-filter">
              <a
                className={`nav-link carduppercontent ${
                  selectedTab === "all" ? "active-nav-style" : ""
                }`}
                aria-current="page"
                onClick={() => fetchAllJObs("all", selectedStatus, searchTerm)}
              >
                All
              </a>
            </li>
            <li className="nav-item nav-item-filter">
              <a
                className={`nav-link carduppercontent ${
                  selectedTab === "day" ? "active-nav-style" : ""
                }`}
                onClick={() => fetchAllJObs("day", selectedStatus, searchTerm)}
              >
                Last 24 Hour
              </a>
            </li>
          </ul>
        </div>

        <div className="d-flex gap-2 rightside">
          <div className=" searchmain">
            <input
              type="text"
              className="form-control search"
              id="exampleFormControlInput1"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
            <i className="bi bi-search searchicon"></i>
          </div>
          <div className=" filtermainjobs ">
            <i className="bi bi-funnel-fill filtericon"></i>
            <select
              className="form-select form-select-sm filter opsstatus"
              aria-label="Small select example"
              name="status"
              onChange={handleSelectChange}
              value={selectedStatus}
            >
              <option value="">Select Status</option>
              {statusList.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="firsttile">
        <div className="row  gap-5 d-flex justify-content-center ">
          {currentJobs?.map((job, index) => (
            <div
              className="col-3 shadow p-3 mb-5 bg-body-tertiary rounded"
              key={index}
            >
              <div className="d-flex justify-content-between ">
                <div>
                  <img src={Group} alt="Group" />
                </div>
                <div
                  className={`dashstatus ${
                    job?.pdaStatus === 5
                      ? "customer-approved"
                      : job?.pdaStatus === 6
                      ? "pending"
                      : job?.pdaStatus === 7
                      ? "Operations"
                      : ""
                  }`}
                >
                  {job?.pdaStatus === 5
                    ? "Customer Approved"
                    : job?.pdaStatus === 6
                    ? "Pending from operations"
                    : job?.pdaStatus === 7
                    ? "Operations Completed"
                    : ""}
                </div>
              </div>
              {job?.jobId && (
                <>
                  <div>
                    <span className="dashhead">Job ID:</span>
                    <p className="toms">{job?.jobId}</p>
                  </div>
                </>
              )}

              <div>
                <span className="dashhead">Port Name:</span>
                <p className="toms">{job?.portId?.portName}</p>
              </div>
              <div>
                <span className="dashhead">Vessel Name:</span>
                <p className="toms">{job?.vesselId?.vesselName}</p>
              </div>
              <div className="d-flex justify-content-between">
                <div className="viewdetail" onClick={() => handleJobClick(job)}>
                  View Detail >>>
                </div>
                <div className="d-flex">
                  <i
                    className="bi bi-pencil-square dashedit"
                    onClick={() => handleEditJob(job)}
                  ></i>
                  {/* <i
                  className="bi bi-trash-fill dashdelete"
                  onClick={() => handleDelete(job)}
                ></i> */}
                </div>
              </div>
            </div>
          ))}

          {jobsList?.length == 0 && (
            <>
              <p>Currently, there are no available jobs</p>{" "}
            </>
          )}

          <div className="d-flex justify-content-end opsrowperpage">
            <div className="itemspagination">
              <label htmlFor="itemsPerPage">Items Per Page: </label>
              <select
                className="itemsspace"
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="pagination-section d-flex">
              <div className="previousops">
                <div
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="previousbtn"
                >
                  <i className="bi bi-chevron-left"></i>
                </div>
                {/* <div
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="previousbtn"
                >
                  Previous
                </div> */}
              </div>

              {/* {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={
                    currentPage === index + 1
                      ? "active activepagination"
                      : "otherpaginationbuttons"
                  }
                >
                  {index + 1}
                </button>
              ))} */}
              <div
                className=""
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="nextbtnpagination"
              >
                <i className="bi bi-chevron-right"></i>
              </div>
              {/* <div
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="nextbtnpagination"
              >
                Next
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default OpsDashboard;

{
  /* <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <div>
            <label htmlFor="itemsPerPage">Items per page: </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div> */
}
