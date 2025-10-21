// ResponsiveDialog.js
import React, { useState, useEffect } from "react";

import Loader from "./Loader";
import "../css/invoicepage.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from "@mui/material";
import { AttachFile, Delete, Visibility } from "@mui/icons-material";
import Remarks from "./Remarks";
import {
  changeInvoiceStatus,
  getServiceReport,
  getPdaDetails,
  getCharges,
  getSubcharges,
} from "../services/apiService";
import PopUp from "./PopUp";
import moment from "moment";
import { getAllFinanceEmployees } from "../services/apiPayment";
const transwave = require("../assets/images/EPDA-MV-TBN-SALALAH-CARGO-(3)-1.jpg");
const Group = require("../assets/images/TRANSocean-LOGO.png");

const InvoicePage = ({
  open,
  onClose,
  services,
  selectedPdaData,
  pdaResponse,
  ports,
  customers,
  vendors,
  onSubmit,
}) => {
  const [openPopUp, setOpenPopUp] = useState(false);
  const [employee, setEmployee] = useState("");
  const [message, setMessage] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [remarksOpen, setRemarksOpen] = useState(false);
  const [serviceReports, setServiceReports] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [EmployeePetty, setPettyEmployeeList] = useState([]);

  const serviceReportGet = async (id) => {
    let data = {
      pdaId: id,
    };
    try {
      const serviceReportResponse = await getServiceReport(data);
      console.log("serviceReportGet", serviceReportResponse);
      setServiceReports(serviceReportResponse?.report);
      setUploadedFiles(
        serviceReportResponse?.reportDocument?.serviceDocuments || []
      );
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(pdaResponse, "pdaResponse");
    if (pdaResponse?._id) {
      serviceReportGet(pdaResponse?._id);
    }
  }, [pdaResponse]);

  useEffect(() => {
    console.log(serviceReports, "serviceReports");
  }, [serviceReports]);

  const [remarksMessage, setRemarksMessage] = useState("");

  const handleRemarksOpen = () => {
    console.log(pdaResponse, "pdaResponse_handleRemarksOpen");
    setRemarksMessage(pdaResponse?.rejectedRemark);
    setRemarksOpen(true);
  };

  useEffect(() => {
    console.log(remarksMessage, "remarksMessage");
  }, [remarksMessage]);

  const handleRemarksClose = () => {
    setRemarksOpen(false);
  };

  const handleRemarksSubmit = async (remark) => {
    console.log(remark, "handleRemarksSubmit");
    let pdaPayload = {
      pdaId: pdaResponse?._id,
      status: 2,
      rejectedRemark: remark,
      assignedEmployee: employee ? employee : "",
    };
    try {
      const response = await changeInvoiceStatus(pdaPayload);
      console.log(response, "login_response");
      if (response?.status == true) {
        setMessage("Invoice has been Rejected by FM");
        setOpenPopUp(true);
        setRemarksOpen(false);
        onSubmit(pdaResponse?._id);
      } else {
        setMessage("Invoice failed. Please try again");
        setOpenPopUp(true);
        setRemarksOpen(false);
      }
    } catch (error) {
      setMessage("Invoice failed. Please try again");
      setOpenPopUp(true);
      setRemarksOpen(false);
    } finally {
    }
  };
  const acceptInvoice = async (remark) => {
    // Check if employee is selected
    if (!employee) {
      setEmployeeError("Select Invoice By");
      setMessage("Select 'Invoice By' to continue.");
      setOpenPopUp(true);
      return;
    }

    // Clear error if employee is selected
    setEmployeeError("");

    console.log(remark, "handleRemarksSubmit");
    let pdaPayload = {
      pdaId: pdaResponse?._id,
      status: 3,
      assignedEmployee: employee ? employee : "",
    };
    try {
      const response = await changeInvoiceStatus(pdaPayload);
      console.log(response, "login_response");
      if (response?.status == true) {
        setMessage("Invoice has been accepted successfully");
        setOpenPopUp(true);
        setRemarksOpen(false);
        onSubmit(pdaResponse?._id);
      } else {
        setMessage("Invoice failed. Please try again");
        setOpenPopUp(true);
        setRemarksOpen(false);
      }
    } catch (error) {
      setMessage("Invoice failed. Please try again");
      setOpenPopUp(true);
      setRemarksOpen(false);
    } finally {
    }
  };
  const [chargesArray, setChargesArray] = useState([]);

  const fetchPdaDetails = async (id) => {
    let data = {
      pdaId: id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      console.log("PDADETAILS", pdaDetails);
      setChargesArray(pdaDetails?.pdaServices);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    if (pdaResponse?._id) {
      fetchPdaDetails(pdaResponse?._id);
    }
  }, [pdaResponse?._id]);

  useEffect(() => {
    console.log(chargesArray, "chargesArray_invoicePage");
  }, [chargesArray]);

  // const [fetchedCharges, setFetchedCharges] = useState(new Set());
  // const [fetchedSubCharges, setFetchedSubCharges] = useState(new Set());
  // const [charges, setCharges] = useState([]);

  // // Fetch charges
  // useEffect(() => {
  //   const uniqueChargeIds = new Set(
  //     chargesArray?.map((service) => service.serviceId).filter(Boolean)
  //   );

  //   uniqueChargeIds.forEach((id) => {
  //     if (!fetchedCharges.has(id)) {
  //       fetchCharges(id);
  //     }
  //   });
  // }, [chargesArray, fetchedCharges]);

  // // Fetch subcharges
  // useEffect(() => {
  //   const uniqueSubChargeIds = new Set(
  //     chargesArray?.map((service) => service.chargeId).filter(Boolean)
  //   );

  //   uniqueSubChargeIds.forEach((id) => {
  //     if (!fetchedSubCharges.has(id)) {
  //       fetchSubCharges(id);
  //     }
  //   });
  // }, [chargesArray, fetchedSubCharges]);

  // const fetchCharges = async (id) => {
  //   if (!fetchedCharges.has(id)) {
  //     try {
  //       const response = await getCharges({ serviceId: id });
  //       console.log(response, "fetchCharges");

  //       setCharges((prev) => [...prev, ...response?.charges]);
  //       setFetchedCharges((prev) => new Set(prev).add(id));
  //     } catch (error) {
  //       console.error("Error fetching charges:", error);
  //     }
  //   }
  // };

  // const fetchSubCharges = async (id) => {
  //   if (!fetchedSubCharges.has(id)) {
  //     try {
  //       const response = await getSubcharges({ chargeId: id });
  //       console.log(response, "fetchSubCharges");
  //       setSubCharges((prev) => [...prev, ...response?.subcharges]);
  //       setFetchedSubCharges((prev) => new Set(prev).add(id));
  //     } catch (error) {
  //       console.error("Error fetching subcharges:", error);
  //     }
  //   }
  // };
  const [subCharges, setSubCharges] = useState([]);

  const getItemName = (id, name) => {
    if (name === "subChargeType") {
      const subCharge = subCharges.find((s) => s._id === id);
      return subCharge ? subCharge.subchargeName : "Unknown subCharge";
    }
  };

  // useEffect(() => {
  //   console.log(fetchedSubCharges, "fetchedSubCharges");
  //   console.log(subCharges, "subCharges");
  // }, [fetchedSubCharges, subCharges]);

  const BASE_URL = `${process.env.REACT_APP_FILE_URL}`;

  const handleView = (template) => {
    console.log(template, "template");
    window.open(`${BASE_URL}${template?.pdfPath}`, "_blank");
  };

  const fetchEmployeePettyList = async () => {
    try {
      //let payload = {sortByName:true};
      const listallEmpPetty = await getAllFinanceEmployees();
      //console.log(listallEmpPetty);
      setPettyEmployeeList(listallEmpPetty?.employees || []);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  useEffect(() => {
    fetchEmployeePettyList();
  }, []);

  const handleChange = (e) => {
    setEmployee(e.target.value);
    // Clear error when employee is selected
    if (e.target.value) {
      setEmployeeError("");
    }
  };

  useEffect(() => {
    console.log(EmployeePetty, "EmployeePetty");
    console.log(
      pdaResponse?.invoiceAssignedEmployee,
      "invoiceAssignedEmployee"
    );
    if (pdaResponse?.invoiceAssignedEmployee) {
      setEmployee(pdaResponse?.invoiceAssignedEmployee);
    }
  }, [EmployeePetty, pdaResponse]);

  return (
    <>
      <Dialog
        sx={{
          width: 1300,
          margin: "auto",
          borderRadius: 2,
        }}
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            // Prevent dialog from closing when clicking outside
            return;
          }
          onClose(); // Allow dialog to close for other reasons
        }}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          style: { width: "1700px" }, // Custom width
        }}
      >
        <div className="d-flex justify-content-between">
          <DialogTitle></DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent>
          <div className=" statement">
            <h3>Job Report</h3>
          </div>

          <div className="typesofcall-row ">
            <div className="row align-items-start">
              <div className="col">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Invoice By<span className="required"> * </span> :
                </label>
                <div className="vessel-select">
                  <select
                    className="form-select vesselbox statusscustomer"
                    name="vendors"
                    value={employee || ""}
                    onChange={handleChange}
                  >
                    <option disabled selected value="">
                      Choose Invoice By
                    </option>
                    {EmployeePetty.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} {""}
                      </option>
                    ))}
                  </select>
                </div>
                {employeeError && (
                  <div className="invalid">{employeeError}</div>
                )}
              </div>
            </div>
          </div>

          <table className="tabmain">
            <thead>
              <tr>
                <th className="tabheadinvoice">Sl No:</th>
                <th className="tabheadinvoice">Charges </th>
                <th className="tabheadinvoice">Quantity</th>
                <th className="tabheadinvoice">Amount (OMR)</th>
                <th className="tabheadinvoice">VAT Amount</th>
                <th className="tabheadinvoice">Total OMR</th>
                <th className="tabheadinvoice">Total USD</th>
                <th className="tabheadinvoice">Documents</th>
                <th className="tabheadinvoice">Attachments</th>
              </tr>
            </thead>
            <tbody>
              {chargesArray?.length > 0 &&
                chargesArray.map((charge, index) => (
                  <tr key={index}>
                    <td className="tdstylwidtinvoice">{index + 1}</td>
                    <td className="tdstylinvoicecharge">
                      {charge.subchargeId?.subchargeName}
                    </td>
                    <td className="tdstylinvoice">{charge?.quantity}</td>
                    <td className="tdstylinvoice">
                      {charge.customerOMR.toFixed(3)}
                    </td>
                    <td className="tdstylinvoice">
                      {charge.customerVAT.toFixed(3)}
                    </td>
                    <td className="tdstylinvoice">
                      {(
                        parseFloat(charge.customerOMR) +
                        parseFloat(charge.customerVAT)
                      ).toFixed(3)}
                    </td>
                    <td className="tdstylinvoice">
                      {charge.customerTotalUSD.toFixed(2)}
                    </td>

                    {charge?.documents?.length > 0 && (
                      <>
                        <td className="tdstylinvoice">
                          <div className="templateouterinvoice">
                            {charge?.documents?.length > 0 &&
                              charge?.documents.map((document, index) => (
                                <>
                                  <div className="d-flex justify-content-between align-items-center ">
                                    <div className="tempgenerated">
                                      {document?.originalName}
                                    </div>
                                    <div className="d-flex file_actions">
                                      <div className="icondowninvoice">
                                        <i
                                          className="bi bi-eye invoiceeyee"
                                          onClick={() =>
                                            window.open(
                                              `${process.env.REACT_APP_ASSET_URL}${document?.url}`,
                                              "_blank"
                                            )
                                          }
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ))}
                          </div>
                        </td>
                      </>
                    )}
                    {charge?.documents?.length == 0 && (
                      <>
                        <td className="tdstylinvoice">
                          <div className="templateouterinvoice">
                            No Documents
                          </div>
                        </td>
                      </>
                    )}

                    {charge?.templates?.length > 0 && (
                      <>
                        <td className="tdstylinvoice">
                          <div className="templateouterinvoice">
                            {charge?.templates?.length > 0 &&
                              charge?.templates.map((template, index) => (
                                <>
                                  <div className="d-flex justify-content-between align-items-center ">
                                    <div className="tempgenerated ">
                                      {template?.templateName ===
                                      "Provision Delivery Notes"
                                        ? "Delivery Note"
                                        : template?.templateName ===
                                          "Berthing Report"
                                        ? "Statement Of Facts"
                                        : template?.templateName}
                                    </div>
                                    <div className="d-flex">
                                      <div className="icondowninvoice">
                                        <i
                                          className="bi bi-eye invoiceeyee"
                                          onClick={() => handleView(template)}
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ))}
                          </div>
                        </td>
                      </>
                    )}
                    {charge?.templates?.length == 0 && (
                      <>
                        <td className="tdstylinvoice">
                          <div className="templateouterinvoice">
                            No templates
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          {serviceReports?.length > 0 && (
            <>
              <table className="portofcallstyl mt-3">
                <thead>
                  <tr>
                    <th className="PortofCallinvoiceslno">Sl No.</th>
                    <th className="PortofCallCountryinvoice">Description</th>
                    <th className="PortofCallCountryinvoicedatetime">
                      Date & Time{" "}
                    </th>
                    <th className="PortofCallCountryinvoice">
                      Service Activities
                    </th>
                    <th className="PortofCallCountryinvoice">Quantity</th>
                    <th className="PortofCallCountryinvoice">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceReports?.length > 0 &&
                    serviceReports.map((report, index) => (
                      <tr key={index}>
                        <td className="pocstylinvoice">{index + 1}</td>
                        <td className="pocstylinvoice">
                          {report?.description}
                        </td>
                        <td className="pocstylinvoice">
                          {moment
                            .utc(report?.serviceDate, "DD-MM-YYYY HH:mm")
                            .format("DD-MM-YYYY HH:mm A")}
                        </td>
                        <td className="pocstylinvoice">
                          {report?.serviceActivity}
                        </td>
                        <td className="pocstylinvoice">{report?.quantity}</td>
                        <td className="pocstylinvoice">{report?.remark}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}

          <div className="ml-2 mt-3">
            {uploadedFiles && uploadedFiles?.length > 0 && (
              <>
                <div className="templatelink">Uploaded Files:</div>
                <div className="templateouter">
                  {uploadedFiles?.length > 0 &&
                    uploadedFiles?.map((file, index) => {
                      return (
                        <>
                          <div className="d-flex justify-content-between ">
                            <div className="tempgenerated ">
                              {file?.originalName}
                            </div>
                            <div className="d-flex">
                              <div
                                className="icondown"
                                onClick={() =>
                                  window.open(
                                    `${process.env.REACT_APP_ASSET_URL}${file?.url}`,
                                    "_blank"
                                  )
                                }
                              >
                                <i className="bi bi-eye"></i>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })}
                </div>
              </>
            )}
          </div>

          {pdaResponse?.pdaStatus == 7 && pdaResponse?.invoiceStatus != 3 && (
            <>
              <div className="d-flex justify-content-center mt-4">
                <button
                  className="btn btna submit-button"
                  onClick={() => {
                    acceptInvoice();
                  }}
                >
                  Accept
                </button>

                <button
                  className="btn btna generate-button"
                  onClick={() => {
                    handleRemarksOpen();
                  }}
                >
                  Reject
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Remarks
        open={remarksOpen}
        onClose={handleRemarksClose}
        onRemarksSubmit={handleRemarksSubmit}
        isReadOnly={false}
        isEditMode={true}
        remarksMessage={remarksMessage}
      />
    </>
  );
};

export default InvoicePage;
