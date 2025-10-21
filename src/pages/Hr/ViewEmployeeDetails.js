import React, { useState, useEffect } from "react";
import "../../css/profile.css";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Person,
  Work,
  FlightTakeoff,
  Description,
  Assignment,
  CardMembership,
  LocalHospital,
  Visibility,
  ContactMail,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import {
  getEmployeeChangedDetails,
  acceptEmployeeChanges,
  rejectEmployeeChanges,
} from "../../services/apiSettings";
import { useLocation } from "react-router-dom";

import PopUp from "../../pages/PopUp";
import Loader from "../../pages/Loader";
import { useAuth } from "../../context/AuthContext";
import { getAllDesignations } from "../../services/apiEmployee";
const ViewEmployeeDetails = () => {
  const { loginResponse } = useAuth();
  console.log(loginResponse, "loginResponse_profile");
  const navigate = useNavigate();

  const location = useLocation();
  const emp = location.state;
  console.log("Employee data from navigation state:", emp);

  const [isLoading, setIsLoading] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [employeeData, setEmployeeData] = useState("");

  const fetchProfileDetails = async () => {
    let payload = {
      changeId: emp?._id,
    };
    try {
      setIsLoading(true);
      const response = await getEmployeeChangedDetails(payload);
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

  const BASE_URL = `${process.env.REACT_APP_ASSET_URL}`;

  const handleView = (url) => {
    console.log("Viewing file at URL:", `${BASE_URL}${url}`);
    window.open(`${BASE_URL}${url}`, "_blank");
  };

  // Update button handler
  const handleApprove = async () => {
    let payload = {
      changeId: emp?._id,
    };
    const response = await acceptEmployeeChanges(payload);
    console.log("Update Response:", response);
    if (response?.status == true) {
      setIsLoading(false);
      setMessage("HR has approved your request to update profile details.");
      setOpenPopUp(true);
      fetchProfileDetails();
    } else {
      setIsLoading(false);
      setMessage("Failed to approve the profile update request.");
      setOpenPopUp(true);
      fetchProfileDetails();
      navigate("/update-employee-info");
    }
  };
  const handleReject = async () => {
    let payload = {
      changeId: emp?._id,
    };
    const response = await rejectEmployeeChanges(payload);
    console.log("Update Response:", response);
    if (response?.status == true) {
      setIsLoading(false);
      setMessage("HR rejected your profile update request.");
      setOpenPopUp(true);
    } else {
      setIsLoading(false);
      setMessage("Failed to reject your profile update request.");
      setOpenPopUp(true);
    }
  };

  const handleClosePopup = () => {
    setOpenPopUp(false);
    navigate("/update-employee-info"); // ✅ navigate after close
  };

  const getSectionIcon = (type) => {
    const iconMap = {
      personal: <Person />,
      official: <Work />,
      passport: <FlightTakeoff />,
      contract: <Description />,
      visa: <Assignment />,
      license: <CardMembership />,
      certificate: <CardMembership />,
      medical: <LocalHospital />,
    };
    return iconMap[type] || <Description />;
  };

  const InfoCard = ({ title, icon, children }) => (
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  const InfoRow = ({ label, value, xs = 6 }) => (
    <Grid item xs={12} sm={xs}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || "Not provided"}
        </Typography>
      </Box>
    </Grid>
  );

  const DocumentDisplay = ({ document }) => {
    if (!document?.url)
      return <Typography variant="body2">No file uploaded</Typography>;

    return (
      <Paper
        sx={{
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "grey.50",
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {document.originalName}
        </Typography>
        <IconButton
          size="small"
          color="primary"
          onClick={() => handleView(document.url)}
          title="View Document"
        >
          <Visibility />
        </IconButton>
      </Paper>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    // Handle different date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };
  return (
    <>
      <div className="container home-container">
        {/* Toggle button and view/edit logic */}
        <React.Fragment>
          <>
            <Box sx={{ p: 2 }}>
              {/* Personal Information */}
              <InfoCard
                title="Personal Information"
                icon={getSectionIcon("personal")}
              >
                <Grid container spacing={2}>
                  <InfoRow label="First Name" value={formData.employeeName} />
                  <InfoRow
                    label="Last Name"
                    value={formData.employeeLastName}
                  />
                  <InfoRow
                    label="Date of Birth"
                    value={formatDate(formData.dob)}
                  />
                  <InfoRow label="Address" value={formData.address} />
                  <InfoRow label="City" value={formData.city} />
                  <InfoRow label="State" value={formData.state} />
                  <InfoRow label="Post Code" value={formData.postcode} />
                  <InfoRow label="Nationality" value={formData.nationality} />
                  <InfoRow
                    label="Contact Number"
                    value={formData.contactNumber}
                  />
                  <InfoRow label="Email ID" value={formData.email} />
                  <InfoRow
                    label="Passport Number"
                    value={formData.passportNumber}
                  />
                  <InfoRow label="Civil ID" value={formData.iqamaNumber} />
                </Grid>
              </InfoCard>

              {/* Official Information */}
              <InfoCard
                title="Official Information"
                icon={getSectionIcon("official")}
              >
                <Grid container spacing={2}>
                  <InfoRow
                    label="Date of Joining"
                    value={formatDate(formData.dateOfJoining)}
                  />
                  <InfoRow
                    label="Designation"
                    value={
                      desiginationlist.find(
                        (d) => d._id === formData.designation
                      )?.designationName || ""
                    }
                  />
                  <InfoRow
                    label="Official Email ID"
                    value={formData.officialEmail}
                  />
                  <InfoRow
                    label="Profession Title"
                    value={formData.profession}
                  />
                </Grid>
              </InfoCard>

              {/* Passport Details */}
              {formData.passportDetails?.length > 0 &&
                formData.passportDetails.map((item, idx) => (
                  <InfoCard
                    key={`passport-${idx}`}
                    title={`Passport Details ${
                      formData.passportDetails.length > 1 ? `#${idx + 1}` : ""
                    }`}
                    icon={getSectionIcon("passport")}
                  >
                    <Grid container spacing={2}>
                      <InfoRow
                        label="Passport Number"
                        value={item.passportNumber}
                      />
                      <InfoRow
                        label="Date of Expiry"
                        value={formatDate(item.dateOfExpiry)}
                      />
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Uploaded Document
                        </Typography>
                        <DocumentDisplay document={item.document} />
                      </Grid>
                    </Grid>
                  </InfoCard>
                ))}

              {/* Contract Details */}
              {formData.contractDetails?.length > 0 &&
                formData.contractDetails.map((item, idx) => (
                  <InfoCard
                    key={`contract-${idx}`}
                    title={`Contract Details ${
                      formData.contractDetails.length > 1 ? `#${idx + 1}` : ""
                    }`}
                    icon={getSectionIcon("contract")}
                  >
                    <Grid container spacing={2}>
                      <InfoRow
                        label="Contract Name"
                        value={item.contractName}
                      />
                      <InfoRow
                        label="Date of Expiry"
                        value={formatDate(item.dateOfExpiry)}
                      />
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Uploaded Document
                        </Typography>
                        <DocumentDisplay document={item.document} />
                      </Grid>
                    </Grid>
                  </InfoCard>
                ))}

              {/* Visa Details */}
              {formData.visaDetails?.length > 0 &&
                formData.visaDetails.map((item, idx) => (
                  <InfoCard
                    key={`visa-${idx}`}
                    title={`Visa Details ${
                      formData.visaDetails.length > 1 ? `#${idx + 1}` : ""
                    }`}
                    icon={getSectionIcon("visa")}
                  >
                    <Grid container spacing={2}>
                      <InfoRow label="Visa Number" value={item.visaNumber} />
                      <InfoRow
                        label="Date of Expiry"
                        value={formatDate(item.dateOfExpiry)}
                      />
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Uploaded Document
                        </Typography>
                        <DocumentDisplay document={item.document} />
                      </Grid>
                    </Grid>
                  </InfoCard>
                ))}

              {/* License Details */}
              {formData.licenseDetails?.length > 0 &&
                formData.licenseDetails.map((item, idx) => (
                  <InfoCard
                    key={`license-${idx}`}
                    title={`License Details ${
                      formData.licenseDetails.length > 1 ? `#${idx + 1}` : ""
                    }`}
                    icon={getSectionIcon("license")}
                  >
                    <Grid container spacing={2}>
                      <InfoRow
                        label="License Number"
                        value={item.licenseNumber}
                      />
                      <InfoRow
                        label="Date of Expiry"
                        value={formatDate(item.dateOfExpiry)}
                      />
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Uploaded Document
                        </Typography>
                        <DocumentDisplay document={item.document} />
                      </Grid>
                    </Grid>
                  </InfoCard>
                ))}

              {/* Certificate Details */}
              {formData.certificationDetails?.length > 0 && (
                <InfoCard
                  title="Certificate Details"
                  icon={getSectionIcon("certificate")}
                >
                  {formData.certificationDetails.map((item, idx) => (
                    <Box
                      key={`cert-${idx}`}
                      sx={{
                        mb:
                          idx < formData.certificationDetails.length - 1
                            ? 3
                            : 0,
                      }}
                    >
                      {idx > 0 && <Divider sx={{ mb: 2 }} />}
                      <Grid container spacing={2}>
                        <InfoRow
                          label="Certificate Name"
                          value={item.certification}
                        />
                        <InfoRow
                          label="Certificate Description"
                          value={item.certificateDescription}
                        />
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Uploaded Document
                          </Typography>
                          <DocumentDisplay document={item.document} />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </InfoCard>
              )}

              {/* Medical Details */}
              {formData.medicalRecordDetails?.length > 0 && (
                <InfoCard
                  title="Medical Details"
                  icon={getSectionIcon("medical")}
                >
                  {formData.medicalRecordDetails.map((item, idx) => (
                    <Box
                      key={`medical-${idx}`}
                      sx={{
                        mb:
                          idx < formData.medicalRecordDetails.length - 1
                            ? 3
                            : 0,
                      }}
                    >
                      {idx > 0 && <Divider sx={{ mb: 2 }} />}
                      <Grid container spacing={2}>
                        <InfoRow label="Description" value={item.description} />
                        <InfoRow
                          label="Relationship"
                          value={item.relationship}
                        />
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Uploaded Document
                          </Typography>
                          <DocumentDisplay document={item.document} />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </InfoCard>
              )}
            </Box>

            <div
              className="button-row"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "15px",
                marginTop: "20px",
                marginBottom: "60px",
              }}
            >
              <button
                className="approve-btn"
                onClick={handleApprove}
                style={{
                  color: "#ffffff",
                  backgroundColor: "#1ebbee",
                  borderColor: "#1ebbee",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  border: "1px solid #1ebbee",
                  cursor: "pointer",
                }}
              >
                Approve
              </button>
              <button
                className="reject-btn"
                onClick={handleReject}
                style={{
                  color: "#ffffff",
                  backgroundColor: "#1ebbee",
                  borderColor: "#1ebbee",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  border: "1px solid #1ebbee",
                  cursor: "pointer",
                }}
              >
                Reject
              </button>
            </div>
          </>
        </React.Fragment>
      </div>
      {openPopUp && <PopUp message={message} closePopup={handleClosePopup} />}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default ViewEmployeeDetails;
