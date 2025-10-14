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


//list SOA
export const getSOA = async (soa) => {
  try {
    const response = await axiosInstance.post("/soa", soa);
    return response.data;
  } catch (error) {
    console.log("Error in SOA Listing", error);
  }
};

//generate SOA
export const generateSoaPDF = async (soa) => {
  try {
    const response = await axiosInstance.post("/generateSoaPDF", soa);
    return response.data;
  } catch (error) {
    console.log("Error in SOA Pdf", error);
  }
};


