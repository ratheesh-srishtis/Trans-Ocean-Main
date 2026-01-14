// import React, { useState, useEffect } from "react";
// import "../css/reports.css";
// import { useNavigate } from "react-router-dom";

// const Reports = ({loginResponse}) => {
//   const navigate = useNavigate();
//   const Group = require("../assets/images/Reports.png");
//   useEffect(() => {
//     // You can use loginResponse here if needed
//     console.log("functionalityPermission:", loginResponse?.functionalityPermission
// );
//   }, [loginResponse]);
//   return (
//     <>
//       <div>
//         <div className="charge">
//           <div className="rectangle"></div>
//           <div>
//             <img src={Group}></img>
//           </div>
//         </div>
//         <div
//           className="jobreporrt mb-3"
//           onClick={() => {
//             sessionStorage.clear();
//             navigate("/job-report");
//           }}
//         >
//           1. JOB REPORT
//         </div>
//         <div
//           className="jobreporrt mb-3"
//           onClick={() => navigate("/petty-cash-report")}
//         >
//           2. PETTY CASH REPORT
//         </div>
//         <div
//           className="jobreporrt mb-3"
//           onClick={() => navigate("/cost-centre-breakup")}
//         >
//           3. COST CENTRE BREAKUP
//         </div>
//         <div
//           className="jobreporrt mb-3"
//           onClick={() => navigate("/cost-centre-summary")}
//         >
//           4. COST CENTRE SUMMARY
//         </div>
//         <div
//           className="jobreporrt mb-3"
//           onClick={() => navigate("/recievable-summary")}
//         >
//           5. RECEIVABLE SUMMARY
//         </div>
//         <div
//           className="jobreporrt mb-3"
//           onClick={() => navigate("/payable-summary")}
//         >
//           6. PAYABLE SUMMARY
//         </div>
//         <div
//           className="jobreporrt mb-3"
//           onClick={() => navigate("/bank-summary")}
//         >
//           7. BANK SUMMARY
//         </div>
//       </div>
//     </>
//   );
// };

// export default Reports;

import React, { useEffect } from "react";
import "../css/reports.css";
import { useNavigate } from "react-router-dom";

const Reports = ({ loginResponse }) => {
  const navigate = useNavigate();
  const Group = require("../assets/images/Reports.png");

  // Define all available reports (master list)
  const allReports = [
    { name: "Job Report", key: "job report", path: "/job-report" },
    {
      name: "Petty Cash Report",
      key: "petty cash report",
      path: "/petty-cash-report",
    },
    {
      name: "Cost Centre Breakup",
      key: "cost centre breakup",
      path: "/cost-centre-breakup",
    },
    {
      name: "Cost Centre Summary",
      key: "cost centre summary",
      path: "/cost-centre-summary",
    },
    {
      name: "Receivable Summary",
      key: "receivable summary",
      path: "/recievable-summary",
    },
    {
      name: "Payable Summary",
      key: "payable summary",
      path: "/payable-summary",
    },
    { name: "Bank Summary", key: "bank summary", path: "/bank-summary" },
    { name: "Summary Report", key: "summary report", path: "/summary-report" },
  ];

  // Extract permission array
  const permissions = loginResponse?.functionalityPermission || [];

  // Filter reports dynamically based on permissions
  const allowedReports = allReports.filter((report) =>
    permissions.some(
      (perm) => perm.toLowerCase().trim() === report.key.toLowerCase().trim()
    )
  );

  useEffect(() => {
    console.log("User Permissions:", permissions);
    console.log("Allowed Reports:", allowedReports);
  }, [permissions]);

  return (
    <div>
      <div className="charge">
        <div className="rectangle"></div>
        <div>
          <img src={Group} alt="Reports" />
        </div>
      </div>

      {allowedReports.length > 0 ? (
        allowedReports.map((report, index) => (
          <div
            key={index}
            className="jobreporrt mb-3"
            onClick={() => navigate(report.path)}
          >
            {index + 1}. {report.name.toUpperCase()}
          </div>
        ))
      ) : (
        <p className="text-center mt-4">
          No reports available for your access.
        </p>
      )}
    </div>
  );
};

export default Reports;
