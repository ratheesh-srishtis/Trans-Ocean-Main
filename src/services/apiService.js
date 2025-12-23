// apiService.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;
const fileUrl = process.env.REACT_APP_FILE_URL;

// Create an instance of axios with default settings
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to include the token in the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("transocean_token");
    if (token) {
      config.headers["x-access-token"] = token; // Set the token in the header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login API function
export const loginApi = async (loginData) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, loginData);
    if (response.data.status) {
      // Store the token in localStorage if the login is successful
      localStorage.setItem("transocean_token", response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

// Get All PDA Values API function
export const getAllPdaValuesApi = async () => {
  try {
    const response = await axiosInstance.post("/getAllPdaValues");
    return response.data;
  } catch (error) {
    console.error("Get All PDA Values API Error:", error);
    throw error;
  }
};

// Get All PDA Values API function
export const getAnchorageLocations = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/getAnchorageLocations",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Get All PDA Values API Error:", error);
    throw error;
  }
};

// forgotUserPassword api
export const forgotUserPassword = async (userData) => {
  try {
    const response = await axiosInstance.post("/forgotUserPassword", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// validateOTP api
export const validateOTP = async (userData) => {
  try {
    const response = await axiosInstance.post("/validateOTP", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// validateOTP api
export const resetUserPassword = async (userData) => {
  try {
    const response = await axiosInstance.post("/resetUserPassword", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// Add more API functions here as needed

export const getCharges = async (userData) => {
  try {
    const response = await axiosInstance.post("/getCharges", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getSubcharges = async (userData) => {
  try {
    const response = await axiosInstance.post("/getSubcharges", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const savePda = async (userData) => {
  try {
    const response = await axiosInstance.post("/savePda", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const changeQuotationStatus = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/changeQuotationStatus",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const changeInvoiceStatus = async (userData) => {
  try {
    const response = await axiosInstance.post("/changeInvoiceStatus", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const editChargeQuotation = async (userData) => {
  try {
    const response = await axiosInstance.post("/editQuotationCharge", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const editPDA = async (userData) => {
  try {
    const response = await axiosInstance.post("/editQuotation", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const addPDACharges = async (userData) => {
  try {
    const response = await axiosInstance.post("/addQuotationCharges", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deleteQuotationCharge = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteQuotationCharge",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deleteQuotation = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteQuotation", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const sendQuotationAPI = async (userData) => {
  try {
    const response = await axiosInstance.post("/sendQuotation", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const sendCreditNote = async (userData) => {
  try {
    const response = await axiosInstance.post("/sendCreditNote", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const sendInvoiceApi = async (userData) => {
  try {
    const response = await axiosInstance.post("/sendInvoice", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const sendServiceReport = async (userData) => {
  try {
    const response = await axiosInstance.post("/sendServiceReport", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// Get All Quotations API function
export const getAllQuotations = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllQuotations", data);
    return response.data;
  } catch (error) {
    console.error("Get All Quotations API Error:", error);
    throw error;
  }
};

export const getPdaDetails = async (data) => {
  try {
    const response = await axiosInstance.post("/getPda", data);
    return response.data;
  } catch (error) {
    console.error("Get All Quotations API Error:", error);
    throw error;
  }
};

export const getPdaFile = async (data) => {
  try {
    const response = await axiosInstance.post("/generateQuotationPDF", data);
    return response.data;
  } catch (error) {
    console.error("financeDashboard API Error:", error);
    throw error;
  }
};

export const getAllJobs = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllJobs", data);
    return response.data;
  } catch (error) {
    console.error("financeDashboard API Error:", error);
    throw error;
  }
};

export const deletePdaDocument = async (userData) => {
  try {
    const response = await axiosInstance.post("/deletePdaDocument", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteTemplate = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteTemplate", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteServiceReportDocument = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteServiceReportDocument",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteServiceReport = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteServiceReport", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const uploadDocuments = async (formData) => {
  try {
    const response = await axiosInstance.post("/uploadDocuments", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Required for file uploads
      },
    });
    return response.data;
  } catch (error) {
    console.error("uploadDocuments API Error:", error);
    throw error;
  }
};
export const uploadConnectionFlightImage = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "/uploadConnetionFlightImage",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("uploadConnectionFlightImage API Error:", error);
    throw error;
  }
};

export const uploadSingleImage = async (formData) => {
  try {
    const response = await axiosInstance.post("/uploadSingleImage", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Required for file uploads
      },
    });
    return response.data;
  } catch (error) {
    console.error("uploadDocuments API Error:", error);
    throw error;
  }
};

export const generateTemplatePDF = async (userData) => {
  try {
    const response = await axiosInstance.post("/generateTemplatePDF", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const generateTemplate = async (userData) => {
  try {
    const response = await axiosInstance.post("/generateTemplate", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const uploadTemplate = async (userData) => {
  try {
    const response = await axiosInstance.post("/uploadTemplate", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const uploadDeliveryNoteTemplate = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/uploadDeliveryNoteTemplate",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const saveServiceReport = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveServiceReport", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getServiceReport = async (userData) => {
  try {
    const response = await axiosInstance.post("/getServiceReport", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const getInvoiceDocumentsAPI = async (userData) => {
  try {
    const response = await axiosInstance.post("/getInvoiceDocuments", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const getPdaTemplateDataAPI = async (userData) => {
  try {
    const response = await axiosInstance.post("/getPdaTemplateData", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getJobReport = async (userData) => {
  try {
    const response = await axiosInstance.post("/getJobReport", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getQuestionnaireForm = async () => {
  try {
    const response = await axiosInstance.post("/getQuestionnaireForm");
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getUserNotifications = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/getUserNotifications",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const getHrNotifications = async (userData) => {
  try {
    const response = await axiosInstance.post("/getHrNotifications", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const getEmployeeNotifications = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/getEmployeeNotifications",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getUnreadNotificationCount = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/getUnreadNotificationCount",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteNotification = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteNotification", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getPettyCashReport = async (userData) => {
  try {
    const response = await axiosInstance.post("/pettyCashReport", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getCostCentreBreakupReport = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/costCentreBreakupReport",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getReceivableSummaryReport = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/receivableSummaryReport",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getCostCentreSummaryReport = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/costCentreSummaryReport",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getPayableSummaryReport = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/payableSummaryReport",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const getBankSummaryReport = async (userData) => {
  try {
    const response = await axiosInstance.post("/bankSummaryReport", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const getBankPaymentDetails = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/getBankPaymentDetails",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const getBankPaymentDetailsPDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/getBankPaymentDetailsPDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const pettyCashReportEmployee = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/pettyCashReportEmployee",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const pettyCashReportEmployeePDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/pettyCashReportEmployeePDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const saveCustomerReportRemark = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/saveCustomerReportRemark",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const saveVendorReportRemark = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/saveVendorReportRemark",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getAllJobIds = async (userData) => {
  try {
    const response = await axiosInstance.post("/getAllJobIds", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const resubmitPdaForApproval = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/resubmitPdaForApproval",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const resubmitJobForApproval = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/resubmitJobForApproval",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const saveInvoiceDocument = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveInvoiceDocument", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deletePdaInvoiceDocument = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/deletePdaInvoiceDocument",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const pettyCashReportPDF = async (userData) => {
  try {
    const response = await axiosInstance.post("/pettyCashReportPDF", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const costCentreBreakupReportPDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/costCentreBreakupReportPDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const costCentreSummaryReportPDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/costCentreSummaryReportPDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const payableSummaryReportVendorPDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/payableSummaryReportVendorPDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const payableSummaryReportVendor = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/payableSummaryReportVendor",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const receivableSummaryReportCustomer = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/receivableSummaryReportCustomer",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const receivableSummaryReportPDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/receivableSummaryReportPDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const receivableSummaryReportCustomerPDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/receivableSummaryReportCustomerPDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const jobReportPDF = async (userData) => {
  try {
    const response = await axiosInstance.post("/jobReportPDF", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const payableSummaryReportPDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/payableSummaryReportPDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const bankSummaryReportPDF = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/bankSummaryReportPDF",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const requestForNewService = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/requestForNewService",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const showServiceRequest = async (userData) => {
  try {
    const response = await axiosInstance.post("/showServiceRequest", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const markServiceRequestAsAdded = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/markServiceRequestAsAdded",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const duplicatePda = async (userData) => {
  try {
    const response = await axiosInstance.post("/duplicatePda", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const includePdaToReport = async (userData) => {
  try {
    const response = await axiosInstance.post("/includePdaToReport", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const excludePdaFromReport = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/excludePdaFromReport",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getPdaInformations = async (data) => {
  try {
    const response = await axiosInstance.post("/getPdaDetails", data);
    return response.data;
  } catch (error) {
    console.error("Get All Quotations API Error:", error);
    throw error;
  }
};

export const changeServiceOrder = async (data) => {
  try {
    const response = await axiosInstance.post("/changeServiceOrder", data);
    return response.data;
  } catch (error) {
    console.error("Get All Quotations API Error:", error);
    throw error;
  }
};
export const editAedRate = async (data) => {
  try {
    const response = await axiosInstance.post("/editAedRate", data);
    return response.data;
  } catch (error) {
    console.error("Get All Quotations API Error:", error);
    throw error;
  }
};
export const generateServiceReportPDF = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/generateServiceReportPDF",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Get generateServiceReportPDF API Error:", error);
    throw error;
  }
};

export const getCompanyMedias = async () => {
  try {
    const response = await axiosInstance.post("/getCompanyMedias");
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const uploadCompanyMedia = async (formData) => {
  try {
    const response = await axiosInstance.post("/uploadCompanyMedia", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Required for file uploads
      },
    });
    return response.data;
  } catch (error) {
    console.error("uploadDocuments API Error:", error);
    throw error;
  }
};

export const financeDashboardDetails = async (data) => {
  try {
    const response = await axiosInstance.post("/financeDashboardDetails", data);
    return response.data;
  } catch (error) {
    console.error("Get financeDashboardDetails API Error:", error);
    throw error;
  }
};
export const getInvoiceTotal = async (data) => {
  try {
    const response = await axiosInstance.post("/getInvoiceTotal", data);
    return response.data;
  } catch (error) {
    console.error("Get financeDashboardDetails API Error:", error);
    throw error;
  }
};

export const getDashbordDetails = async (data) => {
  try {
    const response = await axiosInstance.post("/financeDashboard", data);
    return response.data;
  } catch (error) {
    console.error("financeDashboard API Error:", error);
    throw error;
  }
};
