import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Quotations from "../pages/Quotations";
import Payments from "../pages/Payments/Payments";
import CustomerPayments from "../pages/Payments/CustomerPayments";
import VendorPayments from "../pages/Payments/VendorPayments";
import VendorVouchers from "../pages/Payments/VendorVouchers";
import EmployeePetty from "../pages/Payments/EmployeePetty";
import Soa from "../pages/SOA/Soa";
import CreatePDA from "../pages/CreatePDA";
import { useAuth } from "../context/AuthContext";
import { getAllPdaValuesApi } from "../services/apiService";
import { getAedConversionRate } from "../services/apiSettings";
import UpdateJobs from "../pages/UpdateJobs";
import ViewQuotation from "../pages/ViewQuotation";
import ViewOperations from "../pages/Operations/ViewOperations";
import EditOperation from "../pages/Operations/EditOperation";
import RolesSettings from "../settings/RolesSettings";
import UserSettings from "../settings/UserSettings";
import PortSettings from "../settings/PortSettings";
import VesselsSettings from "../settings/VesselsSettings";
import VesselTypeSettings from "../settings/VesselTypeSettings";
import CustomerSettings from "../settings/CustomerSettings";
import ServiceSettings from "../settings/ServiceSettings";
import ChargesSettings from "../settings/ChargesSettings";
import SubChargesSettings from "../settings/SubChargesSettings";
import CargoSettings from "../settings/CargoSettings";
import AnchorageLocationSettings from "../settings/AnchorageLocationSettings";
import AnchorageStayCharges from "../settings/AnchorageStayCharges";
import VendorSettings from "../settings/VendorSettings";
import QQFormSettings from "../settings/QQFormSettings";
import BankSettings from "../settings/BankSettings";
import PasswordRequests from "../settings/PasswordRequests";
import OpsList from "../pages/Operations/OpsList";
import FinalReport from "../pages/Operations/FinalReport";
import QQForm from "../pages/Operations/QQForm";
import JobReport from "../pages/Operations/JobReport";
import Employee from "../pages/Employees/Employees";
import LeaveReports from "../pages/Hr/LeaveReports";
import AddEmployee from "../pages/Employees/AddEmployee";
import WorkCalendar from "../pages/Hr/WorkCalendar";
import Desiginations from "../pages/Hr/Desiginations";
import EmployeeLeaves from "../pages/Hr/EmployeeLeaves";
import HrSettings from "../pages/Hr/Settings";
import Reports from "../pages/Reports";
import CostCenterBreakup from "../pages/Reports/CostCenterBreakup";
import CostCenterSummary from "../pages/Reports/CostCenterSummary";
import PayableSummary from "../pages/Reports/PayableSummary";
import PettyCashReport from "../pages/Reports/PettyCashReport";
import ReceivableSummary from "../pages/Reports/ReceivableSummary";
import BankSummaryReport from "../pages/Reports/BankSummaryReport";
import Chats from "./Chats";
import NotFound from "./NotFound";
import GeneralDocuments from "../pages/Hr/GeneralDocuments";
import StayCharge from "../settings/StayCharge";
import DraggableTable from "../pages/DraggableTable";
import CurrencyRate from "../settings/AEDConversionRate";
import AEDConversionRate from "../settings/AEDConversionRate";
import TestReport from "../pages/Reports/TestReport";
import NewJobReport from "../pages/Operations/NewJobReport";
import MediaSettings from "../settings/MediaSettings";
import CompanyBankDetails from "../settings/CompanyBankDetails";
import UserLeave from "../settings/UserLeave";
import Profile from "../settings/Profile";
import EmployeeModification from "../pages/Hr/EmployeeModification";
import ViewEmployeeDetails from "../pages/Hr/ViewEmployeeDetails";
import LeaveRequests from "../pages/Hr/LeaveRequests";
import Leave from "../pages/Hr/Leave";
const Content = ({ onNotFound }) => {
  const { loginResponse } = useAuth();

  const [vessels, setVessels] = useState([]);
  const [ports, setPorts] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [vesselTypes, setVesselTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [aedConversionRate, setAedConversionRate] = useState(null);
  const location = useLocation();

  // Fetch PDA values on component mount
  useEffect(() => {
    const fetchPdaValues = async () => {
      try {
        const response = await getAllPdaValuesApi();
        console.log(response, "response");
        if (response.status) {
          localStorage.setItem(
            "vessels_list",
            JSON.stringify(response.vessels)
          );
          localStorage.setItem("ports_list", JSON.stringify(response.ports));
          localStorage.setItem("cargos_list", JSON.stringify(response.cargos));
          localStorage.setItem(
            "customers_list",
            JSON.stringify(response.customers)
          );
          localStorage.setItem(
            "vessel_types_list",
            JSON.stringify(response.vesselTypes)
          );
          localStorage.setItem(
            "employees_list",
            JSON.stringify(response.employees)
          );
          localStorage.setItem(
            "vendors_list",
            JSON.stringify(response.vendors)
          );
          setVessels(response.vessels);
          setPorts(response.ports);
          setCargos(response.cargos);
          setVesselTypes(response.vesselTypes);
          setServices(response.services);
          setCustomers(response.customers);
          setEmployees(response.employees);
          setVendors(response.vendors);
          setTemplates(response.templates);
        }
      } catch (error) {
        console.error("Error fetching PDA values:", error);
      }
    };
    fetchPdaValues();
  }, []);

  // Fetch AED conversion rate function (separate section)
  const fetchAedRate = async () => {
    try {
      const res = await getAedConversionRate();
      setAedConversionRate(res?.aedCurrencyRate || null);
    } catch (error) {
      console.error("Error fetching AED conversion rate:", error);
    }
  };

  // Fetch AED conversion rate on every route change (separate section)
  useEffect(() => {
    console.log(location.pathname, "location.pathname");
    // fetchAedRate();
  }, [location.pathname]);

  useEffect(() => {
    console.log(customers, "customers");
    console.log(aedConversionRate, "aedConversionRate_content");
  }, [customers, aedConversionRate]);

  const validRoutes = [
    "/",
    "/dashboard",
    "/quotations",
    "/payments",
    "/customerpayment",
    "/vendorpayment",
    "/vendorvouchers",
    "/employeePetty",
    "/soa",
    "/employee",
    "/add-employee",
    "/workcalendar",
    "/desiginations",
    "/employee-leaves",
    "/hr-settings",
    "/leavereports",
    "/update-jobs",
    "/view-operation",
    "/edit-operation",
    "/jobs",
    "/final-report",
    "/qq-form",
    "/view-quotation",
    "/create-pda",
    "/job-report",
    "/roles-settings",
    "/user-settings",
    "/ports-settings",
    "/vessels-settings",
    "/vessel-type-settings",
    "/customer-settings",
    "/service-settings",
    "/charges-settings",
    "/sub-charges-settings",
    "/cargo-settings",
    "/anchorage-locations",
    "/vendor-settings",
    "/QQform-settings",
    "/Bank-settings",
    "/password-requests",
    "/reports",
    "/cost-centre-breakup",
    "/cost-centre-summary",
    "/payable-summary",
    "/petty-cash-report",
    "/recievable-summary",
    "/bank-summary",
    "/chats",
    "/general-documents",
    "/anchorage-stay-charges",
    "/stay-charge",
    "/dragable-table",
    "/aed-conversion-rate",
    "/test-page",
    "/media-settings",
    "/company-bank-info",
    "/profile",
    "/user-leave",
    "/update-employee-info",
    "/view-employee-details",
    "/leave-requests",
    "/leave",
  ];

  useEffect(() => {
    if (!validRoutes.includes(location.pathname)) {
      onNotFound(true); // Inform App.js that route is not found
    } else {
      onNotFound(false);
    }
  }, [location.pathname, onNotFound]);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/quotations"
        element={
          <Quotations
            loginResponse={loginResponse}
            vessels={vessels}
            ports={ports}
            cargos={cargos}
            vesselTypes={vesselTypes}
            services={services}
            customers={customers}
            employees={employees}
            templates={templates}
            vendors={vendors}
          />
        }
      />
      <Route path="/payments" element={<Payments />} />
      <Route path="/customerpayment" element={<CustomerPayments />} />
      <Route path="/vendorpayment" element={<VendorPayments />} />
      <Route path="/vendorvouchers" element={<VendorVouchers />} />
      <Route path="/employeePetty" element={<EmployeePetty />} />
      <Route
        path="/soa"
        element={<Soa aedConversionRate={aedConversionRate} />}
      />
      <Route path="/employee" element={<Employee />} />
      <Route path="/add-employee" element={<AddEmployee />} />
      <Route path="/workcalendar" element={<WorkCalendar />} />
      <Route path="/desiginations" element={<Desiginations />} />
      <Route path="/employee-leaves" element={<EmployeeLeaves />} />
      <Route path="/leave" element={<Leave loginResponse={loginResponse} />} />
      <Route path="/update-employee-info" element={<EmployeeModification />} />
      <Route path="/hr-settings" element={<HrSettings />} />
      <Route path="/leavereports" element={<LeaveReports />} />
      <Route
        path="/update-jobs"
        element={<UpdateJobs templates={templates} />}
      />
      <Route
        path="/view-operation"
        element={
          <ViewOperations
            services={services}
            customers={customers}
            cargos={cargos}
            vessels={vessels}
            ports={ports}
            vesselTypes={vesselTypes}
            vendors={vendors}
          />
        }
      />
      <Route
        path="/edit-operation"
        element={
          <EditOperation
            vessels={vessels}
            ports={ports}
            cargos={cargos}
            vesselTypes={vesselTypes}
            services={services}
            customers={customers}
            employees={employees}
            templates={templates}
            vendors={vendors}
          />
        }
      />
      <Route path="/jobs" element={<OpsList loginResponse={loginResponse} />} />
      <Route
        path="/final-report"
        element={<FinalReport ports={ports} vessels={vessels} />}
      />
      <Route path="/qq-form" element={<QQForm />} />
      <Route
        path="/view-quotation"
        element={
          <ViewQuotation
            vessels={vessels}
            ports={ports}
            cargos={cargos}
            vesselTypes={vesselTypes}
            services={services}
            customers={customers}
            loginResponse={loginResponse}
            vendors={vendors}
          />
        }
      />
      <Route
        path="/create-pda"
        element={
          <CreatePDA
            vessels={vessels}
            ports={ports}
            cargos={cargos}
            vesselTypes={vesselTypes}
            services={services}
            customers={customers}
            loginResponse={loginResponse}
            vendors={vendors}
            aedConversionRate={aedConversionRate}
          />
        }
      />
      {/* <Route path="/job-report" element={<JobReport ports={ports} />} /> */}
      <Route
        path="/job-report"
        element={<NewJobReport ports={ports} loginResponse={loginResponse} />}
      />

      <Route path="/roles-settings" element={<RolesSettings />} />
      <Route path="/user-settings" element={<UserSettings />} />
      <Route path="/ports-settings" element={<PortSettings />} />
      <Route path="/vessels-settings" element={<VesselsSettings />} />
      <Route path="/vessel-type-settings" element={<VesselTypeSettings />} />
      <Route path="/customer-settings" element={<CustomerSettings />} />
      <Route path="/service-settings" element={<ServiceSettings />} />
      <Route path="/charges-settings" element={<ChargesSettings />} />
      <Route path="/sub-charges-settings" element={<SubChargesSettings />} />
      <Route path="/cargo-settings" element={<CargoSettings />} />
      <Route
        path="/anchorage-locations"
        element={<AnchorageLocationSettings />}
      />
      <Route
        path="/anchorage-stay-charges"
        element={<AnchorageStayCharges />}
      />
      <Route path="/media-settings" element={<MediaSettings />} />
      <Route path="/company-bank-info" element={<CompanyBankDetails />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/user-leave" element={<UserLeave />} />
      <Route path="/stay-charge" element={<StayCharge />} />

      <Route path="/vendor-settings" element={<VendorSettings />} />
      <Route path="/QQform-settings" element={<QQFormSettings />} />
      <Route path="/Bank-settings" element={<BankSettings />} />
      <Route path="/password-requests" element={<PasswordRequests />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/cost-centre-breakup" element={<CostCenterBreakup />} />
      <Route
        path="/cost-centre-summary"
        element={<CostCenterSummary ports={ports} customers={customers} />}
      />
      <Route path="/payable-summary" element={<PayableSummary />} />
      <Route
        path="/petty-cash-report"
        element={<PettyCashReport employees={employees} />}
      />
      <Route path="/recievable-summary" element={<ReceivableSummary />} />
      <Route path="/bank-summary" element={<BankSummaryReport />} />
      <Route path="/chats" element={<Chats />} />
      <Route path="/general-documents" element={<GeneralDocuments />} />
      <Route path="/dragable-table" element={<DraggableTable />} />
      <Route
        path="/aed-conversion-rate"
        element={
          <AEDConversionRate
            loginResponse={loginResponse}
            aedConversionRate={aedConversionRate}
          />
        }
      />
      <Route path="/test-page" element={<TestReport />} />
      <Route path="/view-employee-details" element={<ViewEmployeeDetails />} />
      <Route
        path="/leave-requests"
        element={<LeaveRequests loginResponse={loginResponse} />}
      />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};

export default Content;
