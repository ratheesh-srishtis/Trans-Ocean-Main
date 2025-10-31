import React, { useState, useEffect } from "react";
import "../css/profile.css";
import "../css/profile-enhanced.css";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import {
  getProfileDetails,
  editEmployeeProfile,
} from "../services/apiSettings";
import { useNavigate } from "react-router-dom";
import { getAllEmployees } from "../services/apiEmployee";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
import { useAuth } from "../context/AuthContext";
import {
  getAllDesignations,
  deleteCertificationDocument,
} from "../services/apiEmployee";
import ViewProfile from "./ViewProfile";
import EditProfile from "./EditProfile";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AddEmployee from "../pages/Employees/AddEmployee";
const Profile = () => {
  const { loginResponse } = useAuth();
  console.log(loginResponse, "loginResponse_profile");

  const [employeeObject, setEmployeeObject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Delete handlers for certificate/medical
  const handleDeleteCertificate = async (idx) => {
    try {
      // Get the certificate to delete
      const certificateToDelete = formData.certificationDetails[idx];

      if (certificateToDelete && certificateToDelete._id) {
        const deletePayload = {
          employeeId: loginResponse?.data?._id,
          documentId: certificateToDelete._id,
        };
        await deleteCertificationDocument(deletePayload);
      }

      // Update local state after successful backend deletion
      const updated = formData.certificationDetails.filter((_, i) => i !== idx);
      setFormData({ ...formData, certificationDetails: updated });

      // Optionally refresh the profile data
      await fetchProfileDetails();
    } catch (error) {
      console.error("Error deleting certificate:", error);
      // You can add a popup or notification here
      setMessage("Failed to delete certificate. Please try again.");
      setOpenPopUp(true);
    }
  };

  const fetchemployeeList = async (payload) => {
    try {
      const listallemployees = await getAllEmployees(payload);
      setAllEmployees(listallemployees?.employees || []);
      //console.log(listallemployees,"---listallemployees");
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  useEffect(() => {
    let payload = { searchKey: "" };
    fetchemployeeList(payload);
  }, []);

  const handleDeleteMedical = (idx) => {
    // Note: Medical record deletion is currently local-only
    // TODO: Implement backend API call when deleteMedicalDocument API is available
    const updated = formData.medicalRecordDetails.filter((_, i) => i !== idx);
    setFormData({ ...formData, medicalRecordDetails: updated });
  };

  const fetchProfileDetails = async (id) => {
    let payload = {
      userId: id,
      employeeId: "",
    };

    try {
      setIsLoading(true);
      const response = await getProfileDetails(payload);
      console.log("fetchProfileDetails:", response);
      setEmployeeData(response?.employeeDetails[0]);
      setEmployeeId(response?.employeeDetails[0]?._id);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails(loginResponse?.data?._id);
  }, [loginResponse?.data?._id]);
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
  const navigate = useNavigate();

  const handleToggle = () => {
    let empdata = employeeData;
    setIsEditMode((prev) => !prev);
    let empObj = {
      employeeId: employeeId,
      employeeName: empdata?.employeeName,
      username: empdata.username,
      password: empdata.password,
      employeeLastName: empdata.employeeLastName,
      dob: empdata.dob,
      address: empdata.address,
      nationality: empdata.nationality,
      city: empdata.city,
      state: empdata.state,
      postcode: empdata.postcode,
      contactNumber: empdata.contactNumber,
      email: empdata.email,
      passportNumber: empdata.passportNumber,
      iqamaNumber: empdata.iqamaNumber,
      dateOfJoining: empdata.dateOfJoining,
      profession: empdata.profession,
      designation: empdata.designation,
      department: empdata.department,
      officialEmail: empdata.officialEmail,
      passportDetails: empdata.passportDetails,
      contractDetails: empdata.contractDetails,
      visaDetails: empdata.visaDetails,
      licenseDetails: empdata.licenseDetails,
      certificationDetails: empdata.certificationDetails,
      medicalRecordDetails: empdata.medicalRecordDetails,
      reportingTo: empdata.reportingTo,
      reportingHead: empdata.reportingHead,
      isEditing: true,
    };
    setEmployeeObject(empObj);
  };

  const BASE_URL = `${process.env.REACT_APP_ASSET_URL}`;

  const handleView = (url) => {
    console.log("Viewing file at URL:", `${BASE_URL}${url}`);
    window.open(`${BASE_URL}${url}`, "_blank");
  };

  // Excel export function - moved from ViewProfile component

  // Helper to get employee name by ID from desiginationlist
  const getEmployeeNameById = (employeeId) => {
    if (!employeeId || !allEmployees || allEmployees.length === 0) return "";

    const employee = allEmployees.find((emp) => emp._id === employeeId);
    if (employee) {
      return `${employee.employeeName} ${employee.employeeLastName}`;
    }
    return "";
  };

  const handleExportToExcel = () => {
    const formatDate = (dateString) => {
      if (!dateString) return "";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    };

    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Personal Information Sheet
      const personalData = [
        ["PERSONAL INFORMATION", ""],
        ["First Name", formData.employeeName || ""],
        ["Last Name", formData.employeeLastName || ""],
        ["Date of Birth", formatDate(formData.dob) || ""],
        ["Address", formData.address || ""],
        ["City", formData.city || ""],
        ["State", formData.state || ""],
        ["Post Code", formData.postcode || ""],
        ["Nationality", formData.nationality || ""],
        ["Contact Number", formData.contactNumber || ""],
        ["Email ID", formData.email || ""],
        ["Passport Number", formData.passportNumber || ""],
        ["Civil ID", formData.iqamaNumber || ""],
        ["", ""],
        ["Official Information", ""],
        ["Date of Joining", formatDate(formData.dateOfJoining) || ""],
        [
          "Designation",
          desiginationlist.find((d) => d._id === formData.designation)
            ?.designationName || "",
        ],
        ["Official Email ID", formData.officialEmail || ""],
        ["Profession Title", formData.profession || ""],
        ["Reporting To", getEmployeeNameById(formData.reportingTo) || ""],
        ["Reporting Head", getEmployeeNameById(formData.reportingHead) || ""],
      ];

      // Add passport details
      if (formData.passportDetails?.length > 0) {
        personalData.push(["", ""]);
        personalData.push(["Passport Details", ""]);
        formData.passportDetails.forEach((item, idx) => {
          personalData.push([
            `Passport ${idx + 1} - Number`,
            item.passportNumber || "",
          ]);
          personalData.push([
            `Passport ${idx + 1} - Expiry Date`,
            formatDate(item.dateOfExpiry) || "",
          ]);
          personalData.push([
            `Passport ${idx + 1} - Document`,
            item.document?.originalName || "No document",
          ]);
        });
      }

      // Add contract details
      if (formData.contractDetails?.length > 0) {
        personalData.push(["", ""]);
        personalData.push(["Contract Details", ""]);
        formData.contractDetails.forEach((item, idx) => {
          personalData.push([
            `Contract ${idx + 1} - Name`,
            item.contractName || "",
          ]);
          personalData.push([
            `Contract ${idx + 1} - Expiry Date`,
            formatDate(item.dateOfExpiry) || "",
          ]);
          personalData.push([
            `Contract ${idx + 1} - Document`,
            item.document?.originalName || "No document",
          ]);
        });
      }

      // Add visa details
      if (formData.visaDetails?.length > 0) {
        personalData.push(["", ""]);
        personalData.push(["Visa Details", ""]);
        formData.visaDetails.forEach((item, idx) => {
          personalData.push([
            `Visa ${idx + 1} - Number`,
            item.visaNumber || "",
          ]);
          personalData.push([
            `Visa ${idx + 1} - Expiry Date`,
            formatDate(item.dateOfExpiry) || "",
          ]);
          personalData.push([
            `Visa ${idx + 1} - Document`,
            item.document?.originalName || "No document",
          ]);
        });
      }

      // Add license details
      if (formData.licenseDetails?.length > 0) {
        personalData.push(["", ""]);
        personalData.push(["License Details", ""]);
        formData.licenseDetails.forEach((item, idx) => {
          personalData.push([
            `License ${idx + 1} - Number`,
            item.licenseNumber || "",
          ]);
          personalData.push([
            `License ${idx + 1} - Expiry Date`,
            formatDate(item.dateOfExpiry) || "",
          ]);
          personalData.push([
            `License ${idx + 1} - Document`,
            item.document?.originalName || "No document",
          ]);
        });
      }

      // Add certification details
      if (formData.certificationDetails?.length > 0) {
        personalData.push(["", ""]);
        personalData.push(["Certification Details", ""]);
        formData.certificationDetails.forEach((item, idx) => {
          personalData.push([
            `Certification ${idx + 1} - Name`,
            item.certification || "",
          ]);
          personalData.push([
            `Certification ${idx + 1} - Description`,
            item.certificateDescription || "",
          ]);
          personalData.push([
            `Certification ${idx + 1} - Document`,
            item.document?.originalName || "No document",
          ]);
        });
      }

      // Add medical record details
      if (formData.medicalRecordDetails?.length > 0) {
        personalData.push(["", ""]);
        personalData.push(["Medical Record Details", ""]);
        formData.medicalRecordDetails.forEach((item, idx) => {
          personalData.push([
            `Medical Record ${idx + 1} - Description`,
            item.description || "",
          ]);
          personalData.push([
            `Medical Record ${idx + 1} - Relationship`,
            item.relationship || "",
          ]);
          personalData.push([
            `Medical Record ${idx + 1} - Document`,
            item.document?.originalName || "No document",
          ]);
        });
      }

      const worksheet = XLSX.utils.aoa_to_sheet(personalData);

      // Set column widths
      worksheet["!cols"] = [
        { wch: 30 }, // Field name column
        { wch: 40 }, // Value column
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Profile");

      // Generate filename
      const employeeName = formData.employeeName || "Employee";
      const fileName = `${employeeName}_Profile.xlsx`;

      // Convert to buffer and save
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);

      console.log(`Excel file exported successfully: ${fileName}`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting to Excel. Please try again.");
    }
  };

  // Common button styles
  const buttonStyles = {
    backgroundColor: "#1ebbee",
    height: "36px",
    color: "white",
    fontSize: "13px",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#169bb8",
    },
    minWidth: "auto",
    px: 2,
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 0 }}>
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExportToExcel}
                  sx={buttonStyles}
                >
                  Download Excel
                </Button>
                <Button
                  variant={isEditMode ? "outlined" : "contained"}
                  onClick={handleToggle}
                  sx={{
                    ...buttonStyles,
                    ...(isEditMode && {
                      backgroundColor: "transparent",
                      color: "#1ebbee",
                      border: "1px solid #1ebbee",
                      "&:hover": {
                        backgroundColor: "#1ebbee",
                        color: "white",
                      },
                    }),
                  }}
                >
                  {isEditMode ? "Cancel Edit" : "Edit Profile"}
                </Button>
              </Box>

              {/* Content */}
              {!isEditMode ? (
                <ViewProfile
                  formData={formData}
                  desiginationlist={desiginationlist}
                  handleView={handleView}
                  BASE_URL={BASE_URL}
                />
              ) : (
                <>
                  <EditProfile employeeObject={employeeObject} />
                </>
              )}
            </CardContent>
          </Card>
        </Paper>
      </Box>

      {/* PopUp and Loader */}
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </Container>
  );
};

export default Profile;
