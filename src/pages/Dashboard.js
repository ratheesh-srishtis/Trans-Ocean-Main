import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashbordDetails } from "../services/apiService";
import { Oval } from "react-loader-spinner"; // Import a loader type from react-loader-spinner
import { useAuth } from "../context/AuthContext";
import OpsDashboard from "./Operations/OpsDashboard";
import PopUp from "./PopUp";
import Loader from "./Loader";
const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const handleNavigation = () => {
    localStorage.removeItem("PDA_ID");
    navigate("/create-pda");
  };
  const { logout, loginResponse } = useAuth();
  console.log(loginResponse, "loginResponse_dashboard");
  const [selectedTab, setSelectedTab] = useState("all");
  const [openPopUp, setOpenPopUp] = useState(false);

  const [message, setMessage] = useState("");

  const img_1 = require("../assets/images/1.png");
  const img_2 = require("../assets/images/2.png");
  const img_3 = require("../assets/images/3.png");
  const img_4 = require("../assets/images/4.png");
  const img_5 = require("../assets/images/job completed.png");
  const img_6 = require("../assets/images/finalinvoicenew.png");
  const [counts, setCounts] = useState(null);
  const [userType, setUserType] = useState(null);
  console.log(counts, "counts");
  const fetchDashboardDetails = async (type) => {
    setSelectedTab(type);
    setIsLoading(true);
    let data = {
      filter: type,
    };
    try {
      const dashboardDetails = await getDashbordDetails(data);
      console.log("dashboardDetails:", dashboardDetails);
      setCounts(dashboardDetails);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    } finally {
    }
  };

  useEffect(() => {
    fetchDashboardDetails("all");
  }, []);

  useEffect(() => {
    setUserType(loginResponse?.data?.userRole?.roleType);
    console.log(loginResponse, "loginResponse_superadmin");
  }, [loginResponse]);

  useEffect(() => {
    console.log(userType, "userType");
  }, [userType]);

  return (
    <>
      {(userType === "finance" ||
        userType === "admin" ||
        userType === "superadmin") && (
        <div>
          <div className="card-main">
            <div className="d-flex flex-column-reverse flex-md-row justify-content-between align-items-md-center mb-3">
              <ul className="nav nav-underline gap-3 order-1 order-md-1 ms-2">
                <li className="nav-item">
                  <a
                    className={`nav-link carduppercontent active-nav-style ${
                      selectedTab === "all" ? "active-nav-style" : ""
                    }`}
                    aria-current="page"
                    onClick={() => fetchDashboardDetails("all")}
                  >
                    All
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link carduppercontent ${
                      selectedTab === "day" ? "active-nav-style" : ""
                    }`}
                    onClick={() => fetchDashboardDetails("day")}
                  >
                    Last 24 Hour
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link carduppercontent ${
                      selectedTab === "week" ? "active-nav-style" : ""
                    }`}
                    onClick={() => fetchDashboardDetails("week")}
                  >
                    Last Week
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link carduppercontent ${
                      selectedTab === "month" ? "active-nav-style" : ""
                    }`}
                    onClick={() => fetchDashboardDetails("month")}
                  >
                    Last Month
                  </a>
                </li>
              </ul>
              <div className="order-2 order-md-2 align-self-end mt-3 mt-md-0">
                <button
                  type="button"
                  className="btn infobtn"
                  onClick={() => handleNavigation()}
                >
                  Create New PDA
                </button>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards received-quot"
                  onClick={() => navigate("/quotations")}
                >
                  <img className="img-size" src={img_2} />
                  <h3 className="card_count">{counts?.receivedQuotation}</h3>
                  <h5 className="card_title">Quotation Prepared</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards pending-quot"
                  onClick={() => navigate("/quotations")}
                >
                  <img className="img-size" src={img_3} />
                  <h3 className="card_count">{counts?.submittedQuotation}</h3>
                  <h5 className="card_title">Submitted Quotations</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards approved-quot"
                  onClick={() => navigate("/jobs")}
                >
                  <img className="img-size" src={img_4} />
                  <h3 className="card_count">{counts?.approvedQuotation}</h3>
                  <h5 className="card_title">Approval of Jobs to OPS</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards ops"
                  onClick={() => navigate("/jobs")}
                >
                  <img className="img-size" src={img_1} />
                  <h3 className="card_count">{counts?.processedQuotation}</h3>
                  <h5 className="card_title">Job in Process</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards jobscomp"
                  onClick={() => navigate("/jobs")}
                >
                  <img className="img-size" src={img_5} />
                  <h3 className="card_count">{counts?.completedQuotation}</h3>
                  <h5 className="card_title">Job Completed</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div className="dashboard_cards finalinvoicestatus">
                  <img className="img-size" src={img_6} />
                  <h3 className="card_count">{counts?.invoiceSubmitted}</h3>
                  <h5 className="card_title">Final Invoice Status</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {userType === "operations" && <OpsDashboard />}

      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default Dashboard;
