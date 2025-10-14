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
export const getAllUserRoles = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllRoles", data);
    return response.data;
  } catch (error) {
    console.error("List all roles API Error:", error);
    throw error;
  }
};

export const getAllPermissions = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllPermissions", data);
    return response.data;
  } catch (error) {
    console.error("List all permissions API Error:", error);
    throw error;
  }
};
export const getAedConversionRate = async () => {
  try {
    const response = await axiosInstance.post("/getAedConversionRate");
    return response.data;
  } catch (error) {
    console.error("List all permissions API Error:", error);
    throw error;
  }
};

export const saveUserRole = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveUserRole", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deleteUserRole = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteUserRole", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const editUserRole = async (userData) => {
  try {
    const response = await axiosInstance.post("/editUserRole", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* user settings */

export const getAllUsers = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllUsers", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveUser", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/editUser", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteUser", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* vessel settings */

export const getAllVessels = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllVessels", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveVessel = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveVessel", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editVessel = async (userData) => {
  try {
    const response = await axiosInstance.post("/editVessel", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteVessel = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteVessel", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* Port Settings */

export const getAllPorts = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllPorts", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const savePort = async (userData) => {
  try {
    const response = await axiosInstance.post("/savePort", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editPort = async (userData) => {
  try {
    const response = await axiosInstance.post("/editPort", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deletePort = async (userData) => {
  try {
    const response = await axiosInstance.post("/deletePort", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* vessel Type settings */

export const getAllVesselTypes = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllVesselTypes", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveVesselType = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveVesselType", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editVesselType = async (userData) => {
  try {
    const response = await axiosInstance.post("/editVesselType", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteVesselType = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteVesselType", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* customer settings */
export const getAllCustomers = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllCustomers", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveCustomer = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveCustomer", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editCustomer = async (userData) => {
  try {
    const response = await axiosInstance.post("/editCustomer", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteCustomer = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteCustomer", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* charge settings */
export const getAllCharges = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllCharges", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveCharge = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveCharge", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editCharge = async (userData) => {
  try {
    const response = await axiosInstance.post("/editCharge", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteCharge = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteCharge", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* sub charge settings */
export const getAllSubcharges = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllSubcharges", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveSubcharge = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveSubcharge", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editSubcharge = async (userData) => {
  try {
    const response = await axiosInstance.post("/editSubcharge", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteSubcharge = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteSubcharge", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* service settings */
export const getAllServices = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllServices", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveService = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveService", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editService = async (userData) => {
  try {
    const response = await axiosInstance.post("/editService", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteService = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteService", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* cargo settings */
export const getAllCargos = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllCargos", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveCargo = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveCargo", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editCargo = async (userData) => {
  try {
    const response = await axiosInstance.post("/editCargo", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteCargo = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteCargo", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* Vendor Settings */

export const getAllVendors = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllVendors", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveVendor = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveVendor", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editVendor = async (userData) => {
  try {
    const response = await axiosInstance.post("/editVendor", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteVendor = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteVendor", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* Anchorage Locations */

export const getAllAnchorageLoations = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllAnchorageLoations", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveAnchorageLoation = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/saveAnchorageLoation",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editAnchorageLoation = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/editAnchorageLoation",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteAnchorageLoation = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteAnchorageLoation",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* QQForm Settings */

export const getAllQQFormQuestions = async (data) => {
  try {
    const response = await axiosInstance.post("/getAllQQFormQuestions", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const saveQQFormQuestion = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveQQFormQuestion", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editQQFormQuestion = async (userData) => {
  try {
    const response = await axiosInstance.post("/editQQFormQuestion", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteQQFormQuestion = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteQQFormQuestion",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

/* Password Requests */

export const getAllResetPasswordRequests = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/getAllResetPasswordRequests",
      data
    );
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const ChangePassword = async (userData) => {
  try {
    const response = await axiosInstance.post("/resetUserPassword", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// list all banks

export const getAllBanks = async (emp) => {
  try {
    const response = await axiosInstance.post("/getAllBanks", emp);
    return response.data;
  } catch (error) {
    console.log("Error in getAllBanks", error);
  }
};

// delete  banks

export const deleteBank = async (emp) => {
  try {
    const response = await axiosInstance.post("/deleteBank", emp);
    return response.data;
  } catch (error) {
    console.log("Error in deleteBank", error);
  }
};

// Edit Bank
export const editBank = async (emp) => {
  try {
    const response = await axiosInstance.post("/editBank", emp);
    return response.data;
  } catch (error) {
    console.log("Error in editBank", error);
  }
};
// save Bank
export const saveBank = async (emp) => {
  try {
    const response = await axiosInstance.post("/saveBank", emp);
    return response.data;
  } catch (error) {
    console.log("Error in saveBank", error);
  }
};

export const saveAnchorageStayCharge = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/saveAnchorageStayCharge",
      userData
    );
    return response.data;
  } catch (error) {
    console.log("Error in saveAnchorageStayCharge", error);
  }
};
export const editAnchorageStayCharge = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/editAnchorageStayCharge",
      userData
    );
    return response.data;
  } catch (error) {
    console.log("Error in editAnchorageStayCharge", error);
  }
};
export const deleteAnchorageStayCharge = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteAnchorageStayCharge",
      userData
    );
    return response.data;
  } catch (error) {
    console.log("Error in deleteAnchorageStayCharge", error);
  }
};

export const getAnchorageStayChargePorts = async () => {
  try {
    const response = await axiosInstance.post("/getAnchorageStayChargePorts");
    return response.data;
  } catch (error) {
    console.log("Error in getAnchorageStayChargePorts", error);
  }
};
export const getAnchorageStayCharge = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/getAnchorageStayCharge",
      userData
    );
    return response.data;
  } catch (error) {
    console.log("Error in getAnchorageStayCharge", error);
  }
};

export const getCompanyBankDetails = async (data) => {
  try {
    const response = await axiosInstance.post("/getCompanyBankDetails", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};

export const updateCompanyBankDetails = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/updateCompanyBankDetails",
      userData
    );
    return response.data;
  } catch (error) {
    console.log("Error in updateCompanyBankDetails", error);
  }
};

export const getProfileDetails = async (data) => {
  try {
    const response = await axiosInstance.post("/getProfileDetails", data);
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};
export const getEmployeeChangedDetails = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/getEmployeeChangedDetails",
      data
    );
    return response.data;
  } catch (error) {
    console.error("List all users API Error:", error);
    throw error;
  }
};

export const editEmployeeProfile = async (userData) => {
  try {
    const response = await axiosInstance.post("/editEmployeeProfile", userData);
    return response.data;
  } catch (error) {
    console.log("Error in editEmployeeProfile", error);
  }
};
export const acceptEmployeeChanges = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/acceptEmployeeChanges",
      userData
    );
    return response.data;
  } catch (error) {
    console.log("Error in editEmployeeProfile", error);
  }
};
export const rejectEmployeeChanges = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/rejectEmployeeChanges",
      userData
    );
    return response.data;
  } catch (error) {
    console.log("Error in editEmployeeProfile", error);
  }
};
