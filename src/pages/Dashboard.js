import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashbordDetails,
  financeDashboardDetails,
  getInvoiceTotal,
} from "../services/apiService";
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
  const dashboardicon_1 = require("../assets/images/dashboardicon_1.png");
  const dashboardicon_2 = require("../assets/images/dashboardicon_2.png");
  const dashboardicon_3 = require("../assets/images/dashboardicon_3.png");
  const [counts, setCounts] = useState(null);
  const [invoiceTotal, setInvoiceTotal] = useState(null);
  const [userType, setUserType] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState("6");
  console.log(counts, "counts");
  const fetchDashboardDetails = async (type) => {
    setSelectedTab(type);
    setIsLoading(true);
    let data = {
      filter: type,
    };
    try {
      const dashboardDetails = await getDashbordDetails(data);
      const response = await getInvoiceTotal(data);
      console.log("invoiceTotal:", response?.total);
      setInvoiceTotal(response?.total);
      console.log("dashboardDetails:", dashboardDetails);
      setCounts(dashboardDetails);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    } finally {
    }
  };

  // Finance details call (only for finance role)
  const fetchFinanceDashboardDetails = async (filterValue, cardNumberValue) => {
    try {
      setIsLoading(true);
      const payload = {
        filter: filterValue,
        cardNumber: String(cardNumberValue),
      };
      const res = await financeDashboardDetails(payload);
      console.log(res, "dashboard_card_response");
      setIsLoading(false);

      if (res.status == true) {
        if (cardNumberValue == "1") {
          navigate("/quotations", {
            state: {
              quotationsFromDashboard: res?.receivedQuotation || [],
              cardNumber: cardNumberValue,
            },
          });
        } else if (cardNumberValue == "2") {
          navigate("/quotations", {
            state: {
              quotationsFromDashboard: res?.draftQuotation || [],
              cardNumber: cardNumberValue,
            },
          });
        } else if (cardNumberValue == "3") {
          navigate("/quotations", {
            state: {
              quotationsFromDashboard: res?.awaitingFMApproval || [],
              cardNumber: cardNumberValue,
            },
          });
        } else if (cardNumberValue == "4") {
          navigate("/quotations", {
            state: {
              quotationsFromDashboard: res?.awaitingCustomerApproval || [],
              cardNumber: cardNumberValue,
            },
          });
        } else if (cardNumberValue == "5") {
          navigate("/jobs", {
            state: {
              quotationsFromDashboard: res?.approvedQuotation || [],
              cardNumber: cardNumberValue,
            },
          });
        } else if (cardNumberValue == "6") {
          navigate("/jobs", {
            state: {
              quotationsFromDashboard: res?.processedQuotation || [],
              cardNumber: cardNumberValue,
            },
          });
        } else if (cardNumberValue == "7") {
          navigate("/jobs", {
            state: {
              quotationsFromDashboard: res?.completedQuotation || [],
              cardNumber: cardNumberValue,
            },
          });
        } else if (cardNumberValue == "8" || cardNumberValue == "9") {
          navigate("/quotations", {
            state: {
              quotationsFromDashboard: res?.invoiceSubmitted || [],
              cardNumber: cardNumberValue,
            },
          });
        }
      }
      console.log("financeDashboardDetails:", payload, res);
    } catch (err) {
      console.error("financeDashboardDetails error:", err);
      setIsLoading(false);
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
                    onClick={() => {
                      fetchDashboardDetails("all");
                    }}
                  >
                    All
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link carduppercontent ${
                      selectedTab === "day" ? "active-nav-style" : ""
                    }`}
                    onClick={() => {
                      fetchDashboardDetails("day");
                    }}
                  >
                    Last 24 Hour
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link carduppercontent ${
                      selectedTab === "week" ? "active-nav-style" : ""
                    }`}
                    onClick={() => {
                      fetchDashboardDetails("week");
                    }}
                  >
                    Last Week
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link carduppercontent ${
                      selectedTab === "month" ? "active-nav-style" : ""
                    }`}
                    onClick={() => {
                      fetchDashboardDetails("month");
                    }}
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
                  onClick={() => {
                    setSelectedCardNumber("1");
                    fetchFinanceDashboardDetails(selectedTab, "1");
                  }}
                >
                  <img className="img-size" src={img_2} />
                  <h3 className="card_count">{counts?.receivedQuotation}</h3>
                  <h5 className="card_title">PDA Created</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards pending-quot"
                  onClick={() => {
                    setSelectedCardNumber("2");
                    fetchFinanceDashboardDetails(selectedTab, "2");
                  }}
                >
                  <img className="img-size" src={img_3} />
                  <h3 className="card_count">{counts?.draftQuotation}</h3>
                  <h5 className="card_title">Draft PDA</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards approved-quot"
                  onClick={() => {
                    setSelectedCardNumber("3");
                    fetchFinanceDashboardDetails(selectedTab, "3");
                  }}
                >
                  <img className="img-size" src={img_4} />
                  <h3 className="card_count">{counts?.awaitingFMApproval}</h3>
                  <h5 className="card_title">
                    PDA Awaiting Finance Manager Approval
                  </h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards ops"
                  onClick={() => {
                    setSelectedCardNumber("4");
                    fetchFinanceDashboardDetails(selectedTab, "4");
                  }}
                >
                  <img className="img-size" src={img_1} />
                  <h3 className="card_count">
                    {counts?.awaitingCustomerApproval}
                  </h3>
                  <h5 className="card_title">PDA Awaiting Customer Approval</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards jobscomp"
                  onClick={() => {
                    setSelectedCardNumber("5");
                    fetchFinanceDashboardDetails(selectedTab, "5");
                  }}
                >
                  <img className="img-size" src={img_5} />
                  <h3 className="card_count">{counts?.approvedQuotation}</h3>
                  <h5 className="card_title">
                    Jobs Awaiting Operation Manager Approval
                  </h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards finalinvoicestatus"
                  onClick={() => {
                    setSelectedCardNumber("6");
                    fetchFinanceDashboardDetails(selectedTab, "6");
                  }}
                >
                  <img className="img-size" src={img_6} />
                  <h3 className="card_count">{counts?.processedQuotation}</h3>
                  <h5 className="card_title">Jobs in Progress</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards finalinvoicestatus"
                  onClick={() => {
                    setSelectedCardNumber("7");
                    fetchFinanceDashboardDetails(selectedTab, "7");
                  }}
                >
                  <img className="img-size" src={dashboardicon_1} />
                  <h3 className="card_count">{counts?.completedQuotation}</h3>
                  <h5 className="card_title">Jobs Completed</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards finalinvoicestatus"
                  onClick={() => {
                    setSelectedCardNumber("8");
                    fetchFinanceDashboardDetails(selectedTab, "8");
                  }}
                >
                  <img className="img-size" src={dashboardicon_2} />
                  <h3 className="card_count">{counts?.invoiceSubmitted}</h3>
                  <h5 className="card_title">Invoice Submitted</h5>
                </div>
              </div>
              <div className="col-md-4 mb-2 mb-md-4">
                <div
                  className="dashboard_cards finalinvoicestatus"
                  onClick={() => {
                    setSelectedCardNumber("8");
                    fetchFinanceDashboardDetails(selectedTab, "8");
                  }}
                >
                  <img className="img-size" src={dashboardicon_3} />
                  <h3 className="card_count">
                    {invoiceTotal ? invoiceTotal : "N/A"}
                  </h3>
                  <h5 className="card_title">Worth of Invoice Submitted</h5>
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
