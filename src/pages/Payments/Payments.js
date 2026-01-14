import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCustomers, getAllVendors } from "../../services/apiSettings";
import { getAllFinanceEmployees } from "../../services/apiPayment";
import "../../css/payment.css";
import Select from "react-select";

const Payments = () => {
  const Group = require("../../assets/images/payments.png");
  const [currentDate, setCurrentDate] = useState("");
  const [CustomerList, setCustomerList] = useState([]);
  const [VendorList, setVendorList] = useState([]);
  const [FinanceEmployees, setFinanceEmployeeList] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customers: "",
    vendors: "",
    voucher: "",
  });

  // Custom styles for react-select to match existing design
  // ...existing code...

  // Custom styles for react-select to match existing design
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      height: "30px !important",
      minWidth: "200px !important",
      borderRadius: "0.375rem",
      borderColor: "#dee2e6",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#dee2e6",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      marginTop: "2px", // Reduced spacing between select and dropdown
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? "#e9ecef"
        : "white",
      color: state.isSelected ? "white" : "black",
      cursor: "pointer",
      fontSize: "13px", // Option font size
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: "13px",
      color: "#000000", // Black color for placeholder
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: "13px",
      color: "#000000",
    }),
    input: (provided) => ({
      ...provided,
      fontSize: "13px",
      color: "#000000",
    }),
  };

  // ...existing code...

  const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
  const currentroleType = loginResponse.data?.userRole?.roleType;
  const permissions = loginResponse.functionalityPermission;
  console.log(permissions, "permissions");
  const fetchCustomerList = async () => {
    try {
      let payload = { sortByName: true };
      const listallUsers = await getAllCustomers(payload);
      setCustomerList(listallUsers?.customers || []);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };
  const fetchFinanceEmployeeList = async () => {
    try {
      //let payload = {sortByName:true};
      const listallFinanceEmp = await getAllFinanceEmployees();
      setFinanceEmployeeList(listallFinanceEmp?.employees || []);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };
  const fetchVendorList = async () => {
    try {
      let payload = { sortByName: true };
      const listallVendors = await getAllVendors(payload);
      setVendorList(listallVendors?.vendors || []);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // if (name === "customers") {
    //   const selectedCustomer = CustomerList.find(
    //     (customer) => customer._id === e.target.value
    //   );
    //   navigate("/customerpayment", {
    //     state: {
    //       customerId: value,
    //       totalInvoiceAmount: selectedCustomer.totalInvoiceAmount,
    //       paidAmount: selectedCustomer.paidAmount,
    //     },
    //   });
    // }

    // else if (name === "vendors") {
    //   const selectedVendor = VendorList.find(
    //     (vendor) => vendor._id === e.target.value
    //   );
    //   navigate("/vendorpayment", {
    //     state: {
    //       vendorId: value,
    //       totalInvoiceAmount: selectedVendor.totalInvoiceAmount,
    //       paidAmount: selectedVendor.paidAmount,
    //     },
    //   });
    // }

    if (name === "voucher") {
      const selectedVendorvoucher = VendorList.find(
        (vendor) => vendor._id === e.target.value
      );
      navigate("/vendorvouchers", {
        state: {
          vendorId: value,
          totalInvoiceAmount: selectedVendorvoucher.totalInvoiceAmount,
          paidAmount: selectedVendorvoucher.paidAmount,
        },
      });
    }
    // else if (name === "finaceEmp") {
    //   navigate("/employeePetty", { state: { financeempId: value } });
    // }
  };

  const handleCustomerSelectChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData((prevData) => ({
      ...prevData,
      customers: value,
    }));
    if (value) {
      const selectedCustomer = CustomerList.find(
        (customer) => customer._id === value
      );
      navigate("/customerpayment", {
        state: {
          customerId: value,
          totalInvoiceAmount: selectedCustomer.totalInvoiceAmount,
          paidAmount: selectedCustomer.paidAmount,
        },
      });
    }
  };

  const handleVendorSelectChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData((prevData) => ({
      ...prevData,
      vendors: value,
    }));
    if (value) {
      const selectedVendor = VendorList.find((vendor) => vendor._id === value);
      navigate("/vendorpayment", {
        state: {
          vendorId: value,
          totalInvoiceAmount: selectedVendor.totalInvoiceAmount,
          paidAmount: selectedVendor.paidAmount,
        },
      });
    }
  };

  const handleEmployeeSelectChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData((prevData) => ({
      ...prevData,
      finaceEmp: value,
    }));
    if (value) {
      navigate("/employeePetty", { state: { financeempId: value } });
    }
  };

  const viewPettyCashPayment = () => {
    navigate("/vendorvouchers", {
      state: {},
    });
  };
  const viewBankCharges = () => {
    navigate("/bank-charges", {
      state: {},
    });
  };

  useEffect(() => {
    const today = new Date();
    const formattedDate = `${("0" + (today.getMonth() + 1)).slice(-2)}/${(
      "0" + today.getDate()
    ).slice(-2)}/${today.getFullYear()}`;
    setCurrentDate(formattedDate);
    fetchCustomerList();
    fetchVendorList();
    fetchFinanceEmployeeList();
  }, []);

  // Prepare options for react-select
  const customerOptions = CustomerList.map((customer) => ({
    value: customer._id,
    label: customer.customerName,
  }));

  const vendorOptions = VendorList.map((vendor) => ({
    value: vendor._id,
    label: vendor.vendorName,
  }));

  const employeeOptions = FinanceEmployees.map((emp) => ({
    value: emp._id,
    label: emp.name,
  }));

  return (
    <div>
      <div className="charge">
        <div className="rectangle"></div>
        <div>
          <img src={Group}></img>
        </div>
      </div>
      <div className="choosecargo-row p-3 ">
        <div className="row ">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="mb-3">
              {permissions.includes("receivables") && (
                <>
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label customerpayment"
                  >
                    Customer Payments:
                  </label>
                  <div className="vessel-select">
                    <Select
                      options={customerOptions}
                      onChange={handleCustomerSelectChange}
                      value={customerOptions.find(
                        (opt) => opt.value === formData.customers
                      )}
                      placeholder="Search Customer Name"
                      isClearable
                      isSearchable
                      styles={customSelectStyles}
                      className="paymentcustomer"
                      classNamePrefix="react-select"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="mb-3">
              {permissions.includes("payables") && (
                <>
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label customerpayment"
                  >
                    Vendor Payments:
                  </label>
                  <div className="vessel-select">
                    <Select
                      options={vendorOptions}
                      onChange={handleVendorSelectChange}
                      value={vendorOptions.find(
                        (opt) => opt.value === formData.vendors
                      )}
                      placeholder="Search Vendor Name"
                      isClearable
                      isSearchable
                      styles={customSelectStyles}
                      className="paymentcustomer"
                      classNamePrefix="react-select"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="choosecargo-row p-3 ">
        <div className="row ">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="mb-3">
              {permissions.includes("petty") && (
                <>
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label customerpayment"
                  >
                    Petty Cash Payments:
                  </label>
                  <div className="vessel-select ">
                    {/* <select
                      name="voucher"
                      onChange={handleChange}
                      value={formData.voucher}
                      className="form-select vesselbox vboxholder paymentcustomer"
                    >
                      <option value="">Choose Vendor Name</option>
                      {VendorList.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.vendorName}{" "}
                        </option>
                      ))}
                    </select> */}
                    <button
                      className="btn btna submit-button mt-2"
                      onClick={() => {
                        viewPettyCashPayment();
                      }}
                    >
                      View Petty Cash Payments
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="mb-3">
              {permissions.includes("employee petty") && (
                <>
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label customerpayment"
                  >
                    Employee Petty Payments:
                  </label>
                  <div className="vessel-select">
                    <Select
                      options={employeeOptions}
                      onChange={handleEmployeeSelectChange}
                      value={employeeOptions.find(
                        (opt) => opt.value === formData.finaceEmp
                      )}
                      placeholder="Search Employee Name"
                      isClearable
                      isSearchable
                      styles={customSelectStyles}
                      className="paymentcustomer"
                      classNamePrefix="react-select"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="choosecargo-row p-3 ">
        <div className="row ">
          {permissions.includes("Other Income") && (
            <>
              <div className="col-lg-4 col-md-4 col-sm-12">
                <div className="mb-3">
                  <>
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label customerpayment"
                    >
                      Other Income:
                    </label>
                    <div className="vessel-select ">
                      <button
                        className="btn btna submit-button mt-2"
                        onClick={() => {
                          navigate("/other-income", {
                            state: {},
                          });
                        }}
                      >
                        View Other Income
                      </button>
                    </div>
                  </>
                </div>
              </div>
            </>
          )}
          {permissions.includes("tax") && (
            <>
              <div className="col-lg-4 col-md-4 col-sm-12">
                <div className="mb-3">
                  <>
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label customerpayment"
                    >
                      Tax:
                    </label>
                    <div className="vessel-select ">
                      <button
                        className="btn btna submit-button mt-2"
                        onClick={() => {
                          navigate("/tax", {
                            state: {},
                          });
                        }}
                      >
                        View Tax Details
                      </button>
                    </div>
                  </>
                </div>
              </div>
            </>
          )}
          {permissions.includes("Bank Charge") && (
            <>
              <div className="col-lg-4 col-md-4 col-sm-12">
                <div className="mb-3">
                  <>
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label customerpayment"
                    >
                      Bank Charges:
                    </label>
                    <div className="vessel-select ">
                      <button
                        className="btn btna submit-button mt-2"
                        onClick={() => {
                          viewBankCharges();
                        }}
                      >
                        View Bank Charges
                      </button>
                    </div>
                  </>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
