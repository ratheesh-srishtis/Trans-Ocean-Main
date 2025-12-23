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

//Save payments
export const savePayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post("/savePayment", paymentData);
    return response.data;
  } catch (error) {
    console.log("Error in payment save api", error);
    throw error;
  }
};
// list customer payments

export const getPayments = async (getpayment) => {
  try {
    const response = await axiosInstance.post("/getPayments", getpayment);
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};

// list vendor payments

export const getVendorPayments = async (getpayment) => {
  try {
    const response = await axiosInstance.post("/getVendorPayments", getpayment);
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};

export const getVendorVoucherDetails = async (data) => {
  try {
    const response = await axiosInstance.post("/getVendorVoucherDetails", data);
    return response.data;
  } catch (error) {
    console.log("Error in payment", error);
  }
};

// list quotationIds

export const getAllQuotationIds = async () => {
  try {
    const response = await axiosInstance.post("/getAllQuotationIds");
    return response.data;
  } catch (error) {
    console.log("Error in quotations", error);
  }
};
export const getCustomerQuotationIds = async (data) => {
  try {
    const response = await axiosInstance.post("/getCustomerQuotationIds", data);
    return response.data;
  } catch (error) {
    console.log("Error in quotations", error);
  }
};
// list vendor quotationIds

export const getAllVendorQuotationIds = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/getAllVendorQuotationIds",
      data
    );
    return response.data;
  } catch (error) {
    console.log("Error in quotations", error);
  }
};
//list getVouchers
export const getVouchers = async (vouchers) => {
  try {
    const response = await axiosInstance.post("/getVouchers", vouchers);
    return response.data;
  } catch (error) {
    console.log("Error in vouchers", error);
  }
};

//save vouchers
export const saveVoucher = async (vouchers) => {
  try {
    const response = await axiosInstance.post("/saveVoucher", vouchers);
    return response.data;
  } catch (error) {
    console.log("Error in vouchers", error);
  }
};
//Delete payments

export const deletePayment = async (payments) => {
  try {
    const response = await axiosInstance.post("/deletePayment", payments);
    return response.data;
  } catch (error) {
    console.log("Error in deletePayment", error);
  }
};

// Edit payment

export const editPayment = async (payments) => {
  try {
    const response = await axiosInstance.post("/editPayment", payments);
    return response.data;
  } catch (error) {
    console.log("Error in editPayment", error);
  }
};

// Delete Voucher

export const deleteVoucher = async (payments) => {
  try {
    const response = await axiosInstance.post("/deleteVoucher", payments);
    return response.data;
  } catch (error) {
    console.log("Error in editPayment", error);
  }
};

// edit voucher
export const editVoucher = async (voucher) => {
  try {
    const response = await axiosInstance.post("/editVoucher", voucher);
    return response.data;
  } catch (error) {
    console.log("Error in edit vocuhers", error);
  }
};

// get CustomerBalance
export const getCustomerBalanceDue = async (balance) => {
  try {
    const response = await axiosInstance.post(
      "/getCustomerBalanceDue",
      balance
    );
    return response.data;
  } catch (error) {
    console.log("Error in getCustomerBalanceDue", error);
  }
};
// get CustomerBalance
export const getVendorBalanceDue = async (balance) => {
  try {
    const response = await axiosInstance.post("/getVendorBalanceDue", balance);
    return response.data;
  } catch (error) {
    console.log("Error in getVendorBalanceDue", error);
  }
};
// downlaod voucher pdf
export const generateVoucherPDF = async (voucher) => {
  try {
    const response = await axiosInstance.post("/generateVoucherPDF", voucher);
    return response.data;
  } catch (error) {
    console.log("Error in generateVoucherPDF", error);
  }
};
//download cutomer voucher pdf
export const generateCustomerVoucherPDF = async (voucher) => {
  try {
    const response = await axiosInstance.post(
      "/generateCustomerVoucherPDF",
      voucher
    );
    return response.data;
  } catch (error) {
    console.log("Error in generateCustomerVoucherPDF", error);
  }
};
//get customer voucher details
export const getCustomerVoucherDetails = async (voucher) => {
  try {
    const response = await axiosInstance.post(
      "/getCustomerVoucherDetails",
      voucher
    );
    return response.data;
  } catch (error) {
    console.log("Error in getCustomerVoucherDetails", error);
  }
};
//download vendor voucher pdf
export const generateVendorVoucherPDF = async (voucher) => {
  try {
    const response = await axiosInstance.post(
      "/generateVendorVoucherPDF",
      voucher
    );
    return response.data;
  } catch (error) {
    console.log("Error in generateVendorVoucherPDF", error);
  }
};

// list all banks

export const getAllBanks = async (voucher) => {
  try {
    const response = await axiosInstance.post("/getAllBanks", voucher);
    return response.data;
  } catch (error) {
    console.log("Error in getAllBanks", error);
  }
};

// list all employees

export const getAllFinanceEmployees = async (emp) => {
  try {
    const response = await axiosInstance.post("/getAllFinanceEmployees", emp);
    return response.data;
  } catch (error) {
    console.log("Error in getAllFinanceEmployees", error);
  }
};
export const generateVouchersPaymentListingPDF = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/generateVouchersPaymentListingPDF",
      data
    );
    return response.data;
  } catch (error) {
    console.log("Error in generateVouchersPaymentListingPDF", error);
  }
};
export const generateEmployeePettyPDF = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/generateEmployeePettyPDF",
      data
    );
    return response.data;
  } catch (error) {
    console.log("Error in generateEmployeePettyPDF", error);
  }
};
// Save Refund
export const saveRefund = async (refund) => {
  try {
    const response = await axiosInstance.post("/saveRefund", refund);
    return response.data;
  } catch (error) {
    console.log("Error in saveRefund", error);
  }
};
// get PettyEmployee List

export const getEmployeePetty = async (peetyemp) => {
  try {
    const response = await axiosInstance.post("/getEmployeePetty", peetyemp);
    return response.data;
  } catch (error) {
    console.log("Error in Employee Petty", error);
  }
};
// Save employee petty
export const saveEmployeePetty = async (peetyemp) => {
  try {
    const response = await axiosInstance.post("/saveEmployeePetty", peetyemp);
    return response.data;
  } catch (error) {
    console.log("Error in Save Employee Petty", error);
  }
};
//delete employee Petty
export const deleteEmployeePetty = async (peetyemp) => {
  try {
    const response = await axiosInstance.post("/deleteEmployeePetty", peetyemp);
    return response.data;
  } catch (error) {
    console.log("Error in Delete Employee Petty", error);
  }
};

// get Voucher Number

export const getVoucherNumber = async (voucher) => {
  try {
    const response = await axiosInstance.post("/getVoucherNumber", voucher);
    return response.data;
  } catch (error) {
    console.log("Error in get Voucher Number", error);
  }
};

// Edit employee petty
export const editEmployeePetty = async (peetyemp) => {
  try {
    const response = await axiosInstance.post("/editEmployeePetty", peetyemp);
    return response.data;
  } catch (error) {
    console.log("Error in Edit Employee Petty", error);
  }
};

// get total amount paid
export const getPdaPaidAmount = async (amt) => {
  try {
    const response = await axiosInstance.post("/getPdaPaidAmount", amt);
    return response.data;
  } catch (error) {
    console.log("Error in total amount ", error);
  }
};
