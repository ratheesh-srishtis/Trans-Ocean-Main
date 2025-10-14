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

//List employees
export const getAllEmployees = async (empData) => {
  try {
    const response = await axiosInstance.post("/getAllEmployees", empData);
    return response.data;
  } catch (error) {
    console.log("Error in getAllEmployees api", error);
    throw error;
  }
};
// save employee

export const saveEmployee = async (empData) => {
  try {
    const response = await axiosInstance.post("/saveEmployee", empData);
    return response.data;
  } catch (error) {
    console.log("Error in save employee", error);
  }
};

// Delete employee

export const deleteEmployee = async (empData) => {
  try {
    const response = await axiosInstance.post("/deleteEmployee", empData);
    return response.data;
  } catch (error) {
    console.log("Error in delte employee", error);
  }
};
// Delete employee

export const deleteCertificationDocument = async (empData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteCertificationDocument",
      empData
    );
    return response.data;
  } catch (error) {
    console.log("Error in delte deleteCertificationDocument", error);
  }
};
export const deleteMedicalRecordDocument = async (empData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteMedicalRecordDocument",
      empData
    );
    return response.data;
  } catch (error) {
    console.log("Error in delte deleteMedicalRecordDocument", error);
  }
};
export const deleteLicenseDocument = async (empData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteLicenseDocument",
      empData
    );
    return response.data;
  } catch (error) {
    console.log("Error in delte deleteLicenseDocument", error);
  }
};
export const deleteVisaDocument = async (empData) => {
  try {
    const response = await axiosInstance.post("/deleteVisaDocument", empData);
    return response.data;
  } catch (error) {
    console.log("Error in delte deleteVisaDocument", error);
  }
};
export const deleteContractDocument = async (empData) => {
  try {
    const response = await axiosInstance.post(
      "/deleteContractDocument",
      empData
    );
    return response.data;
  } catch (error) {
    console.log("Error in delte deleteContractDocument", error);
  }
};
export const deletePassportDocument = async (empData) => {
  try {
    const response = await axiosInstance.post(
      "/deletePassportDocument",
      empData
    );
    return response.data;
  } catch (error) {
    console.log("Error in delte deletePassportDocument", error);
  }
};

// edit employee

export const editEmployee = async (empData) => {
  try {
    const response = await axiosInstance.post("/editEmployee", empData);
    return response.data;
  } catch (error) {
    console.log("Error in employee edit", error);
  }
};

//file upload
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
// get Desiginations
export const getAllDesignations = async (formData) => {
  try {
    const response = await axiosInstance.post("/getAllDesignations", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Required for file uploads
      },
    });
    return response.data;
  } catch (error) {
    console.error("getAllDesignations API Error:", error);
    throw error;
  }
};
