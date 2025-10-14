import React, { useState, useEffect } from "react";
import { getAllEmployeeChanges } from "../../services/apiLeavePortal";
import PopUp from "../PopUp";
import "../../css/empmodification.css";
import { useNavigate } from "react-router-dom";

const EmployeeModification = () => {
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [employeesList, setEmployeesList] = useState(null);

  const fecthEmployeeLeaves = async (paylaod) => {
    const response = await getAllEmployeeChanges(paylaod);
    setEmployeesList(response?.employeeDetails || []);
  };

  useEffect(() => {
    fecthEmployeeLeaves();
  }, []);
  useEffect(() => {
    console.log(employeesList, "employeesList");
  }, [employeesList]);

  // helper to format date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB"); // gives dd/mm/yyyy
  };

  const navigate = useNavigate();

  const handleView = (emp) => {
    navigate("/view-employee-details", { state: emp });
  };

  return (
    <>
      <div>
        <div className="card-container">
          {employeesList?.map((emp, index) => (
            <div className="employee-card" key={index}>
              <h3 className="employee-name">{emp.employeeName}</h3>
              <p className="employee-date">{formatDate(emp.createdAt)}</p>
              <button
                onClick={() => handleView(emp)}
                className="view-btn"
                style={{
                  color: "#ffffff",
                  backgroundColor: "#1ebbee",
                  borderColor: "#1ebbee",
                  border: "1px solid #1ebbee",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
      {employeesList?.length == 0 && (
        <>
          <p>No Data Available</p>
        </>
      )}
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default EmployeeModification;
