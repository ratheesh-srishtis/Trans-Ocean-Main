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

//list Desiginations
export const getAllDesignations = async (desig) => {
  try {
    const response = await axiosInstance.post("/getAllDesignations", desig);
    return response.data;
  } catch (error) {
    console.log("Error in Desigination Listing", error);
  }
};

//Add Desiginations
export const saveDesignation = async (desig) => {
  try {
    const response = await axiosInstance.post("/saveDesignation", desig);
    return response.data;
  } catch (error) {
    console.log("Error in save Designation", error);
  }
};

//Edit Desiginations
export const editDesignation = async (desig) => {
  try {
    const response = await axiosInstance.post("/editDesignation", desig);
    return response.data;
  } catch (error) {
    console.log("Error in edit Designation", error);
  }
};

//Delte Desiginations
export const deleteDesignation = async (desig) => {
  try {
    const response = await axiosInstance.post("/deleteDesignation", desig);
    return response.data;
  } catch (error) {
    console.log("Error in delete Designation", error);
  }
};

// get Work Calendars

//list Work Calendars
export const getAllWorkCalendars = async (cale) => {
  try {
    const response = await axiosInstance.post("/getAllWorkCalendars", cale);
    return response.data;
  } catch (error) {
    console.log("Error in Work calendar Listing", error);
  }
};

//Add Work calendar
export const saveWorkCalendar = async (cale) => {
  try {
    const response = await axiosInstance.post("/saveWorkCalendar", cale);
    return response.data;
  } catch (error) {
    console.log("Error in Work Calendar", error);
  }
};

//Edit Work Calendar
export const editWorkCalendar = async (cale) => {
  try {
    const response = await axiosInstance.post("/editWorkCalendar", cale);
    return response.data;
  } catch (error) {
    console.log("Error in edit work calendar", error);
  }
};

//Delte workcalendar
export const deleteWorkCalendar = async (cale) => {
  try {
    const response = await axiosInstance.post("/deleteWorkCalendar", cale);
    return response.data;
  } catch (error) {
    console.log("Error in delete work calendar", error);
  }
};

//list general documents

export const getGeneralDocumentsList = async () => {
  try {
    const response = await axiosInstance.post("/listGeneralDocument");
    return response.data;
  } catch (error) {
    console.log("Error in Work calendar Listing", error);
  }
};

export const saveGeneralDocument = async (cale) => {
  try {
    const response = await axiosInstance.post("/saveGeneralDocument", cale);
    return response.data;
  } catch (error) {
    console.log("Error in Work Calendar", error);
  }
};
//deleteGeneralDocument
export const deleteGeneralDocument = async (cale) => {
  try {
    const response = await axiosInstance.post("/deleteGeneralDocument", cale);
    return response.data;
  } catch (error) {
    console.log("Error in Work Calendar", error);
  }
};
//updateGeneralDocument
export const updateGeneralDocument = async (cale) => {
  try {
    const response = await axiosInstance.post("/editGeneralDocument", cale);
    return response.data;
  } catch (error) {
    console.log("Error in Work Calendar", error);
  }
};
