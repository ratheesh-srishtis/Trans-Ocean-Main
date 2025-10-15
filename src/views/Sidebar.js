import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMedia } from "../context/MediaContext";
const Sidebar = () => {
  const { loginResponse } = useAuth();
  const location = useLocation(); // Get the current location object
  const { logoPreview } = useMedia();
  const logoUrl = logoPreview || localStorage.getItem("logoPreview");
  const { logout } = useAuth();

  console.log(loginResponse, "loginResponse_sidebar");

  const [lastPath, setLastPath] = useState("");
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    console.log(path, "current_path");
    const lastSegment = path.substring(path.lastIndexOf("/") + 1);
    setLastPath(lastSegment);
  }, []);

  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("");
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [menuList, setMenuList] = useState([]);
  const userPermissions = loginResponse?.permission || [];
  const userSettingsPermissions = loginResponse?.submenuPermission || [];
  const menuArr = [
    "profile",
    "Profile", // Added uppercase version
    "leave",
    "Leave", // Added uppercase version
    "dashboard",
    "quotations",
    "jobs",
    "payments",
    "soa",
    "employee",
    "leave reports",
    "report",
    "General Documents",
    "Update Employee Info",
    "Leave Requests",
  ];
  const handleNavigation = (menuItem) => {
    console.log(menuItem, "menuItem");
    if (menuArr.includes(menuItem)) {
      setShowSubmenu(false);
      setActiveSubMenu("");
    } else {
      setShowSubmenu((prev) => !prev);
      if (menuItem != "settings") setActiveSubMenu(menuItem);
    }
    if (lastPath == menuItem) {
      setActiveMenu(lastPath);
    } else if (lastPath != menuItem) {
      setActiveMenu(menuItem);
    }
    setActiveMenu(menuItem); // Update the active menu item
    console.log(menuItem, "handleNavigation");

    switch (menuItem) {
      case "dashboard":
        navigate("/dashboard"); // Replace with your actual route
        break;
      case "profile":
      case "Profile": // Handle uppercase version
        navigate("/profile"); // Replace with your actual route
        break;
      case "leave":
      case "Leave": // Handle uppercase version
        navigate("/leave"); // Replace with your actual route
        break;
      case "quotations":
        navigate("/quotations"); // Replace with your actual route
        break;
      case "reports":
        navigate("/reports"); // Replace with your actual route
        break;
      case "jobs":
        navigate("/jobs"); // Replace with your actual route
        break;
      case "payments":
        navigate("/payments");
        break;
      case "soa":
        navigate("/soa");
        break;
      case "employee":
        navigate("/employee");
        break;
      case "leave reports":
        navigate("/leavereports");
        break;
      case "roles-settings":
        navigate("/roles-settings");
        break;
      case "user-settings":
        navigate("/user-settings");
        break;
      case "vessels-settings":
        navigate("/vessels-settings");
        break;
      case "vessel-type-settings":
        navigate("/vessel-type-settings");
        break;
      case "ports-settings":
        navigate("/ports-settings");
        break;
      case "customer-settings":
        navigate("/customer-settings");
        break;
      case "service-settings":
        navigate("/service-settings");
        break;
      case "charges-settings":
        navigate("/charges-settings");
        break;
      case "sub-charges-settings":
        navigate("/sub-charges-settings");
        break;
      case "cargo-settings":
        navigate("/cargo-settings");
        break;
      case "anchorage-locations":
        navigate("/anchorage-locations");
        break;
      case "vendor-settings":
        navigate("/vendor-settings");
        break;
      case "QQform-settings":
        navigate("/QQform-settings");
        break;
      case "Bank-settings":
        navigate("/Bank-settings");
        break;
      case "password-requests":
        navigate("/password-requests");
        break;
      case "report":
        navigate("/reports");
        break;
      case "General Documents":
        navigate("/general-documents");
        break;
      case "Update Employee Info":
        navigate("/update-employee-info");
        break;
      case "anchorage-stay-charges":
        navigate("/anchorage-stay-charges");
        break;
      case "aed-conversion-rate":
        navigate("/aed-conversion-rate");
        break;
      case "company-bank-details":
        navigate("/company-bank-details");
        break;
      case "media-settings":
        navigate("/media-settings");
        break;
      case "Leave Requests":
        navigate("/leave-requests");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setMenuList(loginResponse?.data?.userRole?.permissions);
  }, [loginResponse]);

  useEffect(() => {
    const path = location.pathname; // Get the current path
    const pathSegments = path.split("/"); // Split the path into segments
    const finalPart = pathSegments[pathSegments.length - 1]; // Get the last segment
    const formattedPath = `/${finalPart}`; // Add a leading slash
    setCurrentPath(formattedPath);
    console.log(formattedPath, "formatted_path"); // Output: /jobs

    if (formattedPath == "/chats") {
      setActiveMenu("");
    }
  }, [location.pathname]); // Run effect whenever path changes

  useEffect(() => {
    if (lastPath) {
      setActiveMenu(lastPath);
    }
  }, [lastPath]);

  useEffect(() => {
    console.log(menuList, "menuList");
    console.log(activeMenu, "activeMenu");
  }, [activeMenu]);

  // Define menu items with icons and paths
  const menuItems = {
    dashboard: { label: "Dashboard", icon: "bi bi-pie-chart" },
    profile: { label: "Profile", icon: "bi bi-people" },
    Profile: { label: "Profile", icon: "bi bi-people" }, // Added uppercase version
    leave: { label: "Leave", icon: "bi bi-bar-chart" },
    Leave: { label: "Leave", icon: "bi bi-bar-chart" }, // Added uppercase version
    quotations: { label: "Quotations", icon: "bi bi-receipt-cutoff" },
    jobs: { label: "Jobs", icon: "bi bi-briefcase" },
    payments: { label: "Payments", icon: "bi bi-cash-stack" },
    soa: { label: "SOA", icon: "bi bi-wallet" },
    settings: { label: "Settings", icon: "bi bi-gear" },
    employee: { label: "Employee", icon: "bi bi-people" },
    "leave reports": { label: "Leave Reports", icon: "bi bi-person-slash" },
    report: { label: "Reports", icon: "bi bi-bar-chart" },
    "General Documents": {
      label: "General Documents",
      icon: "bi bi-bar-chart",
    },
    "Update Employee Info": {
      label: "Update Employee Info",
      icon: "bi bi-people",
    },
    "Leave Requests": {
      label: "Leave Requests",
      icon: "bi bi-people",
    },
  };

  useEffect(() => {
    console.log(userPermissions, "userPermissions");
    if (userPermissions.length > 0) {
      setActiveMenu(userPermissions[0]); // Set the first permissible menu item as active
    }
  }, [userPermissions]);
  useEffect(() => {
    console.log(userSettingsPermissions, "userSettingsPermissions");
    console.log(menuItems, "menuItems");
  }, [userSettingsPermissions, menuItems]);

  return (
    <>
      <div className="mainbody">
        <div className="sidebar" id="sidebarMenu">
          <div className="space">
            <ul className="menu">
              <img className="side-logo" src={logoUrl} alt="Logo" />
              {/* Render each item only if it's in the user permissions */}

              {userPermissions.map(
                (perm) =>
                  menuItems[perm] && (
                    <li
                      key={perm}
                      onClick={() => handleNavigation(perm)}
                      className={
                        activeMenu === perm
                          ? "active menulist menugap"
                          : "menugap"
                      }
                    >
                      <a>
                        <i
                          className={`${menuItems[perm].icon} ${
                            activeMenu === perm ? "active-span menulist" : ""
                          }`}
                        ></i>

                        <span
                          className={
                            activeMenu === perm
                              ? "active-span menulist "
                              : "menulist"
                          }
                        >
                          {" "}
                          {menuItems[perm].label}
                        </span>
                      </a>
                      {perm === "settings" && showSubmenu && (
                        <>
                          <div className="submenu">
                            <ul className="settingsmenu">
                              {userSettingsPermissions.map((item) => {
                                const submenuMap = {
                                  User: "user-settings",
                                  Vessels: "vessels-settings",
                                  "Vessel Types": "vessel-type-settings",
                                  Ports: "ports-settings",
                                  Roles: "roles-settings",
                                  Customers: "customer-settings",
                                  Services: "service-settings",
                                  Charges: "charges-settings",
                                  "Sub Charges": "sub-charges-settings",
                                  Cargoes: "cargo-settings",
                                  "Anchorage Locations": "anchorage-locations",
                                  Vendors: "vendor-settings",
                                  "QQ Form": "QQform-settings",
                                  Banks: "Bank-settings",
                                  "Password Reset Request": "password-requests",
                                  "Anchorage Stay Charges":
                                    "anchorage-stay-charges",
                                  "AED Conversion Rate": "aed-conversion-rate",
                                  "Company Bank Details":
                                    "company-bank-details",
                                  "Company Media": "media-settings",
                                };
                                const submenuKey = submenuMap[item.submenu];
                                // Skip if it's not a known submenu
                                if (!submenuKey) return null;

                                return (
                                  <li
                                    key={item.submenuId}
                                    className={
                                      activeSubMenu === submenuKey
                                        ? "menusubactive"
                                        : "menusub"
                                    }
                                    onClick={() => handleNavigation(submenuKey)}
                                  >
                                    {item.submenu}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </>
                      )}
                    </li>
                  )
              )}

              {/* Signout */}
              {/* <li className="Signout" onClick={logout}>
                <a>
                  <i className="bi bi-box-arrow-left"></i>
                  <span> Signout</span>
                </a>
              </li> */}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
