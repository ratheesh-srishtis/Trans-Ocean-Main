import React, { useState, useEffect } from "react";
import "../css/reports.css";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();
  const Group = require("../assets/images/Reports.png");

  return (
    <>
      <div>
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        <div
          className="jobreporrt mb-3"
          onClick={() => {
            sessionStorage.clear();
            navigate("/job-report");
          }}
        >
          1. JOB REPORT
        </div>
        <div
          className="jobreporrt mb-3"
          onClick={() => navigate("/petty-cash-report")}
        >
          2. PETTY CASH REPORT
        </div>
        <div
          className="jobreporrt mb-3"
          onClick={() => navigate("/cost-centre-breakup")}
        >
          3. COST CENTRE BREAKUP
        </div>
        <div
          className="jobreporrt mb-3"
          onClick={() => navigate("/cost-centre-summary")}
        >
          4. COST CENTRE SUMMARY
        </div>
        <div
          className="jobreporrt mb-3"
          onClick={() => navigate("/recievable-summary")}
        >
          5. RECEIVABLE SUMMARY
        </div>
        <div
          className="jobreporrt mb-3"
          onClick={() => navigate("/payable-summary")}
        >
          6. PAYABLE SUMMARY
        </div>
        <div
          className="jobreporrt mb-3"
          onClick={() => navigate("/bank-summary")}
        >
          7. BANK SUMMARY
        </div>
      </div>
    </>
  );
};

export default Reports;
