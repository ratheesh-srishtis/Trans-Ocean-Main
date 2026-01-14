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

// list customer payments

export const getOtherIncomes = async () => {
  try {
    const response = await axiosInstance.post("/getOtherIncomes");
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};
export const getBankCharges = async () => {
  try {
    const response = await axiosInstance.post("/getBankCharges");
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};
export const getTaxDetails = async () => {
  try {
    const response = await axiosInstance.post("/getTaxDetails");
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};
export const getAssets = async () => {
  try {
    const response = await axiosInstance.post("/getAssets");
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};
export const getAssetValues = async () => {
  try {
    const response = await axiosInstance.post("/getAssetValues");
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};
export const getSales = async () => {
  try {
    const response = await axiosInstance.post("/getSales");
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};

export const saveOtherIncome = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/saveOtherIncome", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const saveBankCharge = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/saveBankCharge", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const saveTax = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/saveTax", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const saveAsset = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/saveAsset", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const saveAssetValue = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/saveAssetValue", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const saveSale = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/saveSale", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const editOtherIncome = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/editOtherIncome", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const editBankCharge = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/editBankCharge", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const editTax = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/editTax", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const editSale = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/editSale", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const editAsset = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/editAsset", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
export const editAssetValue = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/editAssetValue", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};

export const deleteOtherIncome = async (payments) => {
  try {
    const response = await axiosInstance.post("/deleteOtherIncome", payments);
    return response.data;
  } catch (error) {
    console.log("Error in deleteOtherIncome", error);
  }
};

export const deleteBankCharge = async (payments) => {
  try {
    const response = await axiosInstance.post("/deleteBankCharge", payments);
    return response.data;
  } catch (error) {
    console.log("Error in deleteOtherIncome", error);
  }
};
export const deleteTax = async (payments) => {
  try {
    const response = await axiosInstance.post("/deleteTax", payments);
    return response.data;
  } catch (error) {
    console.log("Error in deleteOtherIncome", error);
  }
};
export const deleteAsset = async (payments) => {
  try {
    const response = await axiosInstance.post("/deleteAsset", payments);
    return response.data;
  } catch (error) {
    console.log("Error in deleteOtherIncome", error);
  }
};
export const deleteAssetValue = async (payments) => {
  try {
    const response = await axiosInstance.post("/deleteAssetValue", payments);
    return response.data;
  } catch (error) {
    console.log("Error in deleteOtherIncome", error);
  }
};
export const deleteSale = async (payments) => {
  try {
    const response = await axiosInstance.post("/deleteSale", payments);
    return response.data;
  } catch (error) {
    console.log("Error in deleteOtherIncome", error);
  }
};
