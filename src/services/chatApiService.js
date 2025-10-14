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

export const getAllChatMessages = async (userData) => {
  try {
    const response = await axiosInstance.post("/getAllChatMessages", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const saveChatMessage = async (userData) => {
  try {
    const response = await axiosInstance.post("/saveChatMessage", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const getUnreadChatCount = async (userData) => {
  try {
    const response = await axiosInstance.post("/getUnreadChatCount", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const editChatMessage = async (userData) => {
  try {
    const response = await axiosInstance.post("/editChatMessage", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const deleteChatMessage = async (userData) => {
  try {
    const response = await axiosInstance.post("/deleteChatMessage", userData);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getTotalUnreadChatCount = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/getTotalUnreadChatCount",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
