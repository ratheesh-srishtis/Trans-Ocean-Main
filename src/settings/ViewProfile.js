import React from "react";
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

const ViewProfile = ({ formData, desiginationlist, handleView, BASE_URL }) => {
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
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          sx={{
            backgroundColor: "rgb(216, 216, 216)",
            p: 1,
            borderRadius: 1,
            mx: -2,
            mt: -2,
            mb: 2,
          }}
        >
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

  return (
    <Box sx={{ p: 2 }}>
      {/* Personal Information */}
      <InfoCard title="Personal Information" icon={getSectionIcon("personal")}>
        <Grid container spacing={2}>
          <InfoRow label="First Name" value={formData.employeeName} />
          <InfoRow label="Last Name" value={formData.employeeLastName} />
          <InfoRow label="Date of Birth" value={formatDate(formData.dob)} />
          <InfoRow label="Address" value={formData.address} />
          <InfoRow label="City" value={formData.city} />
          <InfoRow label="State" value={formData.state} />
          <InfoRow label="Post Code" value={formData.postcode} />
          <InfoRow label="Nationality" value={formData.nationality} />
          <InfoRow label="Contact Number" value={formData.contactNumber} />
          <InfoRow label="Email ID" value={formData.email} />
          <InfoRow label="Passport Number" value={formData.passportNumber} />
          <InfoRow label="Civil ID" value={formData.iqamaNumber} />
        </Grid>
      </InfoCard>

      {/* Official Information */}
      <InfoCard title="Official Information" icon={getSectionIcon("official")}>
        <Grid container spacing={2}>
          <InfoRow
            label="Date of Joining"
            value={formatDate(formData.dateOfJoining)}
          />
          <InfoRow
            label="Designation"
            value={
              desiginationlist.find((d) => d._id === formData.designation)
                ?.designationName || ""
            }
          />
          <InfoRow label="Official Email ID" value={formData.officialEmail} />
          <InfoRow label="Profession Title" value={formData.profession} />
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
              <InfoRow label="Passport Number" value={item.passportNumber} />
              <InfoRow label="Date of Expiry" value={item.dateOfExpiry} />
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
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
              <InfoRow label="Contract Name" value={item.contractName} />
              <InfoRow label="Date of Expiry" value={item.dateOfExpiry} />
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
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
              <InfoRow label="Date of Expiry" value={item.dateOfExpiry} />
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
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
              <InfoRow label="License Number" value={item.licenseNumber} />
              <InfoRow label="Date of Expiry" value={item.dateOfExpiry} />
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
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
                mb: idx < formData.certificationDetails.length - 1 ? 3 : 0,
              }}
            >
              {idx > 0 && <Divider sx={{ mb: 2 }} />}
              <Grid container spacing={2}>
                <InfoRow label="Certificate Name" value={item.certification} />
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
        <InfoCard title="Medical Details" icon={getSectionIcon("medical")}>
          {formData.medicalRecordDetails.map((item, idx) => (
            <Box
              key={`medical-${idx}`}
              sx={{
                mb: idx < formData.medicalRecordDetails.length - 1 ? 3 : 0,
              }}
            >
              {idx > 0 && <Divider sx={{ mb: 2 }} />}
              <Grid container spacing={2}>
                <InfoRow label="Description" value={item.description} />
                <InfoRow label="Relationship" value={item.relationship} />
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
  );
};

export default ViewProfile;
