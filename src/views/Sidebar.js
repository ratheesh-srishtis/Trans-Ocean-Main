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

  // useEffect(() => {
  //   const path = window.location.pathname;
  //   console.log(path, "current_path");
  //   const lastSegment = path.substring(path.lastIndexOf("/") + 1);
  //   setLastPath(lastSegment);
  // }, []);

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

    // If top-level menu that has its own submenu, toggle it and set activeMenu
    if (menuItem === "settings" || menuItem === "payments") {
      if (activeMenu === menuItem && showSubmenu) {
        // close if already open
        setShowSubmenu(false);
        setActiveMenu("");
        setActiveSubMenu("");
      } else {
        // open this submenu and mark it active
        setShowSubmenu(true);
        setActiveMenu(menuItem);
        setActiveSubMenu("");
      }
    } else if (menuArr.includes(menuItem)) {
      // regular top-level menu (no submenu) -> close any open submenu and set active menu
      setShowSubmenu(false);
      setActiveSubMenu("");
      setActiveMenu(menuItem);
    } else {
      // a submenu item was clicked -> ensure submenu is open and set active submenu
      setShowSubmenu(true);
      setActiveSubMenu(menuItem);
      // don't change activeMenu here (it should already be parent)
    }

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

      // payments sub-items
      case "payments-tax":
        setActiveMenu("payments");
        setActiveSubMenu("payments-tax");
        setShowSubmenu(true);
        navigate("/tax");
        break;
      case "payments-asset":
        setActiveMenu("payments");
        setActiveSubMenu("payments-asset");
        setShowSubmenu(true);
        navigate("/asset");
        break;
      case "payments-appreciation-asset":
        setActiveMenu("payments");
        setActiveSubMenu("payments-appreciation-asset");
        setShowSubmenu(true);
        navigate("/appreciation-depreciation");
        break;
      case "payments-sales":
        setActiveMenu("payments");
        setActiveSubMenu("payments-sales");
        setShowSubmenu(true);
        navigate("/sales");
        break;
      // <-- END ADDITIONS -->

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
      case "company-bank-info":
        navigate("/company-bank-info");
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

    // Map route paths to menu keys
    const routeToMenuMap = {
      "/dashboard": "dashboard",
      "/quotations": "quotations",
      "/jobs": "jobs",
      "/payments": "payments",
      "/soa": "soa",
      "/profile": "profile",
      "/leave": "leave",
      "/employee": "employee",
      "/leavereports": "leave reports",
      "/reports": "report",
      "/general-documents": "General Documents",
      "/update-employee-info": "Update Employee Info",
      "/leave-requests": "Leave Requests",
    };

    // Set active menu based on current route
    const currentRoute = formattedPath;
    const menuKey = routeToMenuMap[currentRoute];

    if (menuKey) {
      setActiveMenu(menuKey);
      // If it's a settings route, also handle submenu
      if (
        currentRoute.includes("-settings") ||
        currentRoute.includes("anchorage-locations") ||
        currentRoute.includes("password-requests") ||
        currentRoute.includes("anchorage-stay-charges") ||
        currentRoute.includes("aed-conversion-rate") ||
        currentRoute.includes("company-bank-info") ||
        currentRoute.includes("media-settings")
      ) {
        setActiveMenu("settings");
        setActiveSubMenu(finalPart);
        setShowSubmenu(true);
      }
    }

    // <-- NEW: detect payments subroutes using full path -->
    if (path.startsWith("/payments")) {
      // finalPart will be 'tax', 'asset', or 'appreciation-depreciation-asset' for subroutes
      let submenuKey = "";
      if (finalPart === "tax") submenuKey = "payments-tax";
      else if (finalPart === "asset") submenuKey = "payments-asset";
      else if (finalPart === "appreciation-depreciation-asset")
        submenuKey = "payments-appreciation-asset";
      else if (finalPart === "sales") submenuKey = "payments-sales";

      setActiveMenu("payments");
      setActiveSubMenu(submenuKey);
      setShowSubmenu(true);
    }
    // <-- END NEW -->

    if (formattedPath === "/chats") {
      setActiveMenu("");
    }
  }, [location.pathname]); // Run effect whenever path changes

  // useEffect(() => {
  //   if (lastPath) {
  //     setActiveMenu(lastPath);
  //   }
  // }, [lastPath]);

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

  // useEffect(() => {
  //   console.log(userPermissions, "userPermissions");
  //   if (userPermissions.length > 0) {
  //     setActiveMenu(userPermissions[0]); // Set the first permissible menu item as active
  //   }
  // }, [userPermissions]);
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
                      {perm === "settings" &&
                        showSubmenu &&
                        activeMenu === "settings" && (
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
                                    "Anchorage Locations":
                                      "anchorage-locations",
                                    Vendors: "vendor-settings",
                                    "QQ Form": "QQform-settings",
                                    Banks: "Bank-settings",
                                    "Password Reset Request":
                                      "password-requests",
                                    "Anchorage Stay Charges":
                                      "anchorage-stay-charges",
                                    "AED Conversion Rate":
                                      "aed-conversion-rate",
                                    "Company Bank Info": "company-bank-info",
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
                                      onClick={(e) => {
                                        e.stopPropagation(); // <-- ADDED: prevent parent click
                                        handleNavigation(submenuKey);
                                      }}
                                    >
                                      {item.submenu}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </>
                        )}

                      {/* <-- NEW: Payments submenu (static list) */}
                      {/* {perm === "payments" &&
                        showSubmenu &&
                        activeMenu === "payments" && (
                          <>
                            <div className="submenu">
                              <ul className="settingsmenu">
                                {[
                                  { label: "Tax", key: "payments-tax" },
                                  { label: "Asset", key: "payments-asset" },
                                  {
                                    label: (
                                      <>
                                        Appreciation/
                                        <br />
                                        Depreciation
                                      </>
                                    ),
                                    key: "payments-appreciation-asset",
                                  },
                                  {
                                    label: <>Sales</>,
                                    key: "payments-sales",
                                  },
                                ].map((p) => (
                                  <li
                                    key={p.key}
                                    className={
                                      activeSubMenu === p.key
                                        ? "menusubactive"
                                        : "menusub"
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation(); // <-- ADDED: prevent parent click
                                      handleNavigation(p.key);
                                    }}
                                  >
                                    {p.label}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )} */}
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
