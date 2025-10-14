import React, { useState, useEffect } from "react";
import "../css/profile.css";
import { Tabs, Tab, Box } from "@mui/material";
import {
  getProfileDetails,
  editEmployeeProfile,
} from "../services/apiSettings";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
import { useAuth } from "../context/AuthContext";
import { getAllDesignations } from "../services/apiEmployee";
const Profile = () => {
  const { loginResponse } = useAuth();
  console.log(loginResponse, "loginResponse_profile");

  // Delete handlers for certificate/medical
  const handleDeleteCertificate = (idx) => {
    const updated = formData.certificationDetails.filter((_, i) => i !== idx);
    setFormData({ ...formData, certificationDetails: updated });
  };
  const [isLoading, setIsLoading] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState("");
  const handleDeleteMedical = (idx) => {
    const updated = formData.medicalRecordDetails.filter((_, i) => i !== idx);
    setFormData({ ...formData, medicalRecordDetails: updated });
  };
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setEmployeeId(loginResponse?.data?._id);
  }, [loginResponse]);

  const fetchProfileDetails = async () => {
    let payload = {
      userId: "",
      employeeId: loginResponse?.data?._id,
    };
    try {
      setIsLoading(true);
      const response = await getProfileDetails(payload);
      console.log("fetchProfileDetails:", response);
      setEmployeeData(response?.employeeDetails[0]);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);
  // State for all editable fields
  const [formData, setFormData] = useState({
    passportDetails: [],
    contractDetails: [],
    visaDetails: [],
    licenseDetails: [],
    medicalRecordDetails: [],
    certificationDetails: [],
  });
  useEffect(() => {
    if (!employeeData) return;
    console.log(employeeData, "employeeData");
    const {
      passportDetails = [],
      contractDetails = [],
      visaDetails = [],
      licenseDetails = [],
      medicalRecordDetails = [],
      certificationDetails = [],
      ...rest
    } = employeeData;

    setFormData({
      ...rest,
      passportDetails,
      contractDetails,
      visaDetails,
      licenseDetails,
      medicalRecordDetails,
      certificationDetails,
    });
  }, [employeeData]);
  const [desiginationlist, setDesiginations] = useState([]);

  const fetchAllDesignations = async () => {
    let listdesiginations = await getAllDesignations();
    setDesiginations(listdesiginations?.designations || []);
  };
  useEffect(() => {
    fetchAllDesignations();
  }, []);

  useEffect(() => {
    console.log(formData, "formData");
  }, [formData]);

  // File upload states for each section
  const [passportFile, setPassportFile] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [visaFile, setVisaFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  // Add more for certificate/medical
  const handleAddCertificate = () => {
    setFormData({
      ...formData,
      certificationDetails: [
        ...formData.certificationDetails,
        {
          document: { url: "", originalName: "" },
          certification: "",
          certificateDescription: "",
        },
      ],
    });
  };
  const handleAddMedical = () => {
    setFormData({
      ...formData,
      medicalRecordDetails: [
        ...formData.medicalRecordDetails,
        {
          document: { url: "", originalName: "" },
          description: "",
          relationship: "",
        },
      ],
    });
  };

  // Generic input change handler
  const handleInputChange = (e, section, idx, field) => {
    const { name, value } = e.target;
    if (section) {
      const updatedSection = [...formData[section]];
      updatedSection[idx][field || name] = value;
      setFormData({ ...formData, [section]: updatedSection });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // File upload handler
  const handleFileChange = (e, section, idx) => {
    const file = e.target.files[0];
    if (section) {
      const updatedSection = [...formData[section]];
      updatedSection[idx].document = {
        url: URL.createObjectURL(file),
        originalName: file.name,
      };
      setFormData({ ...formData, [section]: updatedSection });
    } else {
      // For single file sections
      if (section === "passportDetails") setPassportFile(file);
      if (section === "contractDetails") setContractFile(file);
      if (section === "visaDetails") setVisaFile(file);
      if (section === "licenseDetails") setLicenseFile(file);
    }
  };

  // Update button handler
  const handleUpdate = async () => {
    console.log("Payload:", formData);
    let payload = { ...formData, employeeId: loginResponse?.data?._id };

    const response = await editEmployeeProfile(payload);
    console.log("Update Response:", response);
    if (response?.status == true) {
      setIsLoading(false);
      setMessage("Profile details updated successfully!");
      setOpenPopUp(true);
      fetchProfileDetails();
    } else {
      setIsLoading(false);
      setMessage("Failed to update Profile details. Please try again.");
      setOpenPopUp(true);
      fetchProfileDetails();
    }
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const handleToggle = () => setIsEditMode((prev) => !prev);
  const BASE_URL = `${process.env.REACT_APP_ASSET_URL}`;

  const handleView = (url) => {
    console.log("Viewing file at URL:", `${BASE_URL}${url}`);
    window.open(`${BASE_URL}${url}`, "_blank");
  };

  return (
    <>
      <div className="container home-container">
        <div className="row mb-4">
          <div className="col-12 text-center my-4">
            <h6>My Profile</h6>
          </div>
        </div>
        <div></div>

        {/* Toggle button and view/edit logic */}
        <React.Fragment>
          <div className="d-flex justify-content-end mb-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleToggle}
            >
              {isEditMode ? "View" : "Edit"}
            </button>
          </div>
          {!isEditMode ? (
            <>
              <form className="profile-form">
                {/* Personal Information */}
                <div className="row">
                  <div className="section-title">Personal Information</div>

                  <div className="">
                    <label>First Name : </label>
                    <span>{formData.employeeName}</span>
                  </div>
                  <div className="">
                    <label>Last Name : </label>
                    <span>{formData.employeeLastName}</span>
                  </div>
                  <div className="">
                    <label>Date of Birth : </label>
                    <span>{formData.dob}</span>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Address</label>
                    <span>{formData.address}</span>
                  </div>

                  <div>
                    <label>City :</label>
                    <span>{formData.city}</span>
                  </div>
                  <div>
                    <label>State :</label>
                    <span>{formData.state}</span>
                  </div>
                  <div>
                    <label>Post Code :</label>
                    <span>{formData.postcode}</span>
                  </div>
                  <div>
                    <label>Nationality :</label>
                    <span>{formData.nationality}</span>
                  </div>

                  <div>
                    <label>Contact Number :</label>
                    <span>{formData.contactNumber}</span>
                  </div>

                  <div>
                    <label>Email ID :</label>
                    <span>{formData.email}</span>
                  </div>

                  <div>
                    <label>Passport Number :</label>
                    <span>{formData.passportNumber}</span>
                  </div>

                  <div>
                    <label>Civil ID :</label>
                    <span>{formData.iqamaNumber}</span>
                  </div>
                </div>

                {/* Official Information */}
                <div className="row">
                  <div className="section-title mt-4">Official Information</div>

                  <div className="col-md-4 mb-3">
                    <label>Date of Joining :</label>
                    <span>{formData.dateOfJoining}</span>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Desigination :</label>
                    <span>
                      {desiginationlist.find(
                        (d) => d._id === formData.designation
                      )?.designationName || ""}
                    </span>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label>Email ID :</label>
                    <span>{formData.officialEmail}</span>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label>Profession Title :</label>
                    <span>{formData.profession}</span>
                  </div>
                </div>

                {/* Passport Details */}
                {formData.passportDetails.map((item, idx) => (
                  <div className="row align-items-end" key={idx}>
                    <div className="section-title mt-4">Passport Details</div>

                    <div className="col-md-4 mb-3">
                      <label>Passport Number :</label>
                      <span>{item.passportNumber}</span>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Date of Expiry :</label>
                      <span>{item.dateOfExpiry}</span>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Uploaded Files</label>
                      {item.document?.url && (
                        <div className="uploaded-file">
                          <span>{item.document.originalName}</span>
                          <i
                            className="bi bi-eye invoiceeyee"
                            onClick={() => handleView(item.document?.url)}
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Contract Details */}
                {formData.contractDetails.map((item, idx) => (
                  <div className="row align-items-end" key={idx}>
                    <div className="section-title mt-4">Contract Details</div>

                    <div className="col-md-4 mb-3">
                      <label>Contract Name :</label>
                      <span>{item.contractName}</span>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Date of Expiry :</label>
                      <span>{item.dateOfExpiry}</span>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Uploaded Files</label>
                      {item.document?.url && (
                        <div className="uploaded-file">
                          <span>{item.document.originalName}</span>
                          <i
                            className="bi bi-eye invoiceeyee"
                            onClick={() => handleView(item.document?.url)}
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Visa Details */}
                {formData.visaDetails.map((item, idx) => (
                  <div className="row align-items-end" key={idx}>
                    <div className="section-title mt-4">Visa Details</div>

                    <div className="col-md-4 mb-3">
                      <label>Visa Number :</label>
                      <span>{item.visaNumber}</span>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Date of Expiry :</label>
                      <span>{item.dateOfExpiry}</span>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Uploaded Files</label>
                      {item.document?.url && (
                        <div className="uploaded-file">
                          <span>{item.document.originalName}</span>
                          <i
                            className="bi bi-eye invoiceeyee"
                            onClick={() => handleView(item.document?.url)}
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* License Details */}
                {formData.licenseDetails.map((item, idx) => (
                  <div className="row align-items-end" key={idx}>
                    <div className="section-title mt-4">License Details</div>

                    <div className="col-md-4 mb-3">
                      <label>License Number :</label>
                      <span>{item.licenseNumber}</span>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Date of Expiry :</label>
                      <span>{item.dateOfExpiry}</span>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Uploaded Files</label>
                      {item.document?.url && (
                        <div className="uploaded-file">
                          <span>{item.document.originalName}</span>
                          <i
                            className="bi bi-eye invoiceeyee"
                            onClick={() => handleView(item.document?.url)}
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Certificate Details */}
                <div className="section-title mt-4">Certificate Details </div>
                {formData.certificationDetails.map((item, idx) => (
                  <div className="row align-items-end" key={idx}>
                    <div className="col-md-4 mb-3">
                      <label>Certificate Name :</label>
                      <span>{item.certification}</span>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Certificate Description :</label>
                      <span>{item.certificateDescription}</span>
                    </div>

                    <div className="col-md-4 mb-3 d-flex align-items-center">
                      <div>
                        <label>Uploaded Files</label>
                        {item.document?.url && (
                          <div className="uploaded-file">
                            <span>{item.document.originalName}</span>
                            <i
                              className="bi bi-eye invoiceeyee"
                              onClick={() => handleView(item.document?.url)}
                            ></i>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Medical Details */}
                <div className="section-title mt-4">Medical Details </div>
                {formData.medicalRecordDetails.map((item, idx) => (
                  <div className="row align-items-end" key={idx}>
                    <div className="col-md-4 mb-3">
                      <label>Description :</label>
                      <span>{item.description}</span>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Relationship :</label>
                      <span>{item.relationship}</span>
                    </div>

                    <div className="col-md-4 mb-3 d-flex align-items-center">
                      <div>
                        <label>Uploaded Files</label>
                        {item.document?.url && (
                          <div className="uploaded-file">
                            <span>{item.document.originalName}</span>
                            <i
                              className="bi bi-eye invoiceeyee"
                              onClick={() => handleView(item.document?.url)}
                            ></i>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </form>
            </>
          ) : (
            <form className="profile-form">
              {/* Personal Information */}
              <div className="section-title">Personal Information</div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="employeeName"
                    className="form-control"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="employeeLastName"
                    className="form-control"
                    value={formData.employeeLastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label>Post Code</label>
                  <input
                    type="text"
                    name="postcode"
                    className="form-control"
                    value={formData.postcode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label>Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    className="form-control"
                    value={formData.nationality}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    className="form-control"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Email ID</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Passport Number</label>
                  <input
                    type="text"
                    name="passportNumber"
                    className="form-control"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Civil ID</label>
                  <input
                    type="text"
                    name="iqamaNumber"
                    className="form-control"
                    value={formData.iqamaNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Official Information */}
              <div className="section-title mt-4">Official Information</div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label>Date of Joining</label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    className="form-control"
                    value={formData.dateOfJoining}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Designation</label>

                  <select
                    name="designationName"
                    className="form-select vesselbox"
                    aria-label="Default select example"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designation: {
                          ...formData.designation,
                          designationName: e.target.value,
                        },
                      })
                    }
                    value={formData.designation}
                  >
                    <option value="">Choose Desigination</option>
                    {desiginationlist.map((desg) => (
                      <option key={desg._id} value={desg._id}>
                        {desg.designationName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label>Email ID</label>
                  <input
                    type="email"
                    name="officialEmail"
                    className="form-control"
                    value={formData.officialEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Profession Title</label>
                  <input
                    type="text"
                    name="profession"
                    className="form-control"
                    value={formData.profession}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Passport Details */}
              <div className="section-title mt-4">Passport Details</div>
              {formData.passportDetails.map((item, idx) => (
                <div className="row align-items-end" key={idx}>
                  <div className="col-md-4 mb-3">
                    <label>Passport Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.passportNumber}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "passportDetails",
                          idx,
                          "passportNumber"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Date of Expiry</label>
                    <input
                      type="date"
                      className="form-control"
                      value={item.dateOfExpiry}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "passportDetails",
                          idx,
                          "dateOfExpiry"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Document Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleFileChange(e, "passportDetails", idx)
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Uploaded Files</label>
                    {item.document?.url && (
                      <div className="uploaded-file">
                        <span>{item.document.originalName}</span>
                        <i
                          className="bi bi-eye invoiceeyee"
                          onClick={() => handleView(item.document?.url)}
                        ></i>
                        {/* <i className="bi bi-trash deleteicon"></i> */}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Contract Details */}
              <div className="section-title mt-4">Contract Details</div>
              {formData.contractDetails.map((item, idx) => (
                <div className="row align-items-end" key={idx}>
                  <div className="col-md-4 mb-3">
                    <label>Contract Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.contractName}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "contractDetails",
                          idx,
                          "contractName"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Date of Expiry</label>
                    <input
                      type="date"
                      className="form-control"
                      value={item.dateOfExpiry}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "contractDetails",
                          idx,
                          "dateOfExpiry"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Document Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleFileChange(e, "contractDetails", idx)
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Uploaded Files</label>
                    {item.document?.url && (
                      <div className="uploaded-file">
                        <span>{item.document.originalName}</span>
                        <i
                          className="bi bi-eye invoiceeyee"
                          onClick={() => handleView(item.document?.url)}
                        ></i>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Visa Details */}
              <div className="section-title mt-4">Visa Details</div>
              {formData.visaDetails.map((item, idx) => (
                <div className="row align-items-end" key={idx}>
                  <div className="col-md-4 mb-3">
                    <label>Visa Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.visaNumber}
                      onChange={(e) =>
                        handleInputChange(e, "visaDetails", idx, "visaNumber")
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Date of Expiry</label>
                    <input
                      type="date"
                      className="form-control"
                      value={item.dateOfExpiry}
                      onChange={(e) =>
                        handleInputChange(e, "visaDetails", idx, "dateOfExpiry")
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Document Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e, "visaDetails", idx)}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Uploaded Files</label>
                    {item.document?.url && (
                      <div className="uploaded-file">
                        <span>{item.document.originalName}</span>
                        <i
                          className="bi bi-eye invoiceeyee"
                          onClick={() => handleView(item.document?.url)}
                        ></i>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* License Details */}
              <div className="section-title mt-4">License Details</div>
              {formData.licenseDetails.map((item, idx) => (
                <div className="row align-items-end" key={idx}>
                  <div className="col-md-4 mb-3">
                    <label>License Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.licenseNumber}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "licenseDetails",
                          idx,
                          "licenseNumber"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Date of Expiry</label>
                    <input
                      type="date"
                      className="form-control"
                      value={item.dateOfExpiry}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "licenseDetails",
                          idx,
                          "dateOfExpiry"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Document Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleFileChange(e, "licenseDetails", idx)
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Uploaded Files</label>
                    {item.document?.url && (
                      <div className="uploaded-file">
                        <span>{item.document.originalName}</span>
                        <i
                          className="bi bi-eye invoiceeyee"
                          onClick={() => handleView(item.document?.url)}
                        ></i>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Certificate Details */}
              <div className="section-title mt-4">
                Certificate Details{" "}
                <button
                  type="button"
                  className="btn btn-sm btn-primary ms-2"
                  onClick={handleAddCertificate}
                >
                  Add More
                </button>
              </div>
              {formData.certificationDetails.map((item, idx) => (
                <div className="row align-items-end" key={idx}>
                  <div className="col-md-4 mb-3">
                    <label>Certificate Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.certification}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "certificationDetails",
                          idx,
                          "certification"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Certificate Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.certificateDescription}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "certificationDetails",
                          idx,
                          "certificateDescription"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Document Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleFileChange(e, "certificationDetails", idx)
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3 d-flex align-items-center">
                    <div>
                      <label>Uploaded Files</label>
                      {item.document?.url && (
                        <div className="uploaded-file">
                          <span>{item.document.originalName}</span>
                          <i
                            className="bi bi-eye invoiceeyee"
                            onClick={() => handleView(item.document?.url)}
                          ></i>
                        </div>
                      )}
                    </div>
                    {formData.certificationDetails.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger ms-2"
                        title="Delete"
                        onClick={() => handleDeleteCertificate(idx)}
                      >
                        &#10006;
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Medical Details */}
              <div className="section-title mt-4">
                Medical Details{" "}
                <button
                  type="button"
                  className="btn btn-sm btn-primary ms-2"
                  onClick={handleAddMedical}
                >
                  Add More
                </button>
              </div>
              {formData.medicalRecordDetails.map((item, idx) => (
                <div className="row align-items-end" key={idx}>
                  <div className="col-md-4 mb-3">
                    <label>Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.description}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "medicalRecordDetails",
                          idx,
                          "description"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Relationship</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.relationship}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "medicalRecordDetails",
                          idx,
                          "relationship"
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Document Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleFileChange(e, "medicalRecordDetails", idx)
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3 d-flex align-items-center">
                    <div>
                      <label>Uploaded Files</label>
                      {item.document?.url && (
                        <div className="uploaded-file">
                          <span>{item.document.originalName}</span>
                          <i
                            className="bi bi-eye invoiceeyee"
                            onClick={() => handleView(item.document?.url)}
                          ></i>
                        </div>
                      )}
                    </div>
                    {formData.medicalRecordDetails.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger ms-2"
                        title="Delete"
                        onClick={() => handleDeleteMedical(idx)}
                      >
                        &#10006;
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="row mt-4">
                <div className="col-12 text-center">
                  <button
                    type="button"
                    className="btn btn-success px-5"
                    onClick={handleUpdate}
                  >
                    Update
                  </button>
                </div>
              </div>
            </form>
          )}
        </React.Fragment>
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default Profile;
