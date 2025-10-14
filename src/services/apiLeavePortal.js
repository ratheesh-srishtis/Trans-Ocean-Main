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

//list employeeLeaves
export const getAllEmployeeLeaves = async (leaves) => {
  try {
    const response = await axiosInstance.post("/getAllEmployeeLeaves", leaves);
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave Listing", error);
  }
};
export const getAllUserLeaves = async (leaves) => {
  try {
    const response = await axiosInstance.post("/getAllUserLeaves", leaves);
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave Listing", error);
  }
};
export const getAllEmployeeLeaveRequests = async (leaves) => {
  try {
    const response = await axiosInstance.post(
      "/getAllEmployeeLeaveRequests",
      leaves
    );
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave Listing", error);
  }
};
export const approveEmployeeLeaveRequests = async (leaves) => {
  try {
    const response = await axiosInstance.post(
      "/approveEmployeeLeaveRequests",
      leaves
    );
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave Listing", error);
  }
};
//list employees for changes
export const getAllEmployeeChanges = async (leaves) => {
  try {
    const response = await axiosInstance.post("/getAllEmployeeChanges", leaves);
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave Listing", error);
  }
};

//Save Leave
export const saveLeave = async (leaves) => {
  try {
    const response = await axiosInstance.post("/saveLeave", leaves);
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave saving", error);
  }
};

//Edit leave
export const editLeave = async (leaves) => {
  try {
    const response = await axiosInstance.post("/editLeave", leaves);
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave editing", error);
  }
};

//delete leave
export const deleteLeave = async (leaves) => {
  try {
    const response = await axiosInstance.post("/deleteLeave", leaves);
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave editing", error);
  }
};

// leave summary

export const leaveReport = async (leaves) => {
  try {
    const response = await axiosInstance.post("/leaveReport", leaves);
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave Report", error);
  }
};

export const getAllLeaveTypes = async () => {
  try {
    const response = await axiosInstance.post("/getAllLeaveTypes");
    return response.data;
  } catch (error) {
    console.log("Error in Employee Leave Listing", error);
  }
};
