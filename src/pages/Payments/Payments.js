import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCustomers, getAllVendors } from "../../services/apiSettings";
import { getAllFinanceEmployees } from "../../services/apiPayment";
import "../../css/payment.css";
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
  const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
  const currentroleType = loginResponse.data?.userRole?.roleType;
  const permissions = loginResponse.functionalityPermission;
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
    if (name === "customers") {
      const selectedCustomer = CustomerList.find(
        (customer) => customer._id === e.target.value
      );
      navigate("/customerpayment", {
        state: {
          customerId: value,
          totalInvoiceAmount: selectedCustomer.totalInvoiceAmount,
          paidAmount: selectedCustomer.paidAmount,
        },
      });
    } else if (name === "vendors") {
      const selectedVendor = VendorList.find(
        (vendor) => vendor._id === e.target.value
      );
      navigate("/vendorpayment", {
        state: {
          vendorId: value,
          totalInvoiceAmount: selectedVendor.totalInvoiceAmount,
          paidAmount: selectedVendor.paidAmount,
        },
      });
    } else if (name === "voucher") {
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
    } else if (name === "finaceEmp") {
      navigate("/employeePetty", { state: { financeempId: value } });
    }
  };

  const viewPettyCashPayment = () => {
    navigate("/vendorvouchers", {
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
          <div className="col-6">
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
                    <select
                      name="customers"
                      id="customers"
                      onChange={handleChange}
                      value={formData.customers}
                      className="form-select vesselbox vboxholder paymentcustomer"
                    >
                      <option value="">Choose Customer Name</option>
                      {CustomerList.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.customerName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="col-6">
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
                    <select
                      name="vendors"
                      onChange={handleChange}
                      value={formData.vendors}
                      className="form-select vesselbox vboxholder paymentcustomer"
                    >
                      <option value="">Choose Vendor Name</option>
                      {VendorList.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.vendorName}{" "}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="choosecargo-row p-3 ">
        <div className="row ">
          <div className="col-6">
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

          <div className="col-6">
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
                    <select
                      name="finaceEmp"
                      onChange={handleChange}
                      value={formData.finaceEmp}
                      className="form-select vesselbox vboxholder paymentcustomer"
                    >
                      <option value="">Choose Employee</option>
                      {FinanceEmployees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
