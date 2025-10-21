// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/editOperation.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import BerthReport from "./Templates/BerthReport";
import CrewChangeList from "./Templates/CrewChangeList";
import LoadingReport from "./Templates/LoadingReport";
import OKTBReport from "./Templates/OKTBReport";
import Multiselect from "multiselect-react-dropdown";

import {
  getCharges,
  getSubcharges,
  uploadDocuments,
  editChargeQuotation,
  deletePdaDocument,
  deleteTemplate,
  getPdaTemplateDataAPI,
} from "../../services/apiService";
import PopUp from "../PopUp";
import ProvisionDeliveryNotes from "./Templates/ProvisionDeliveryNotes";
import Transportationreciept from "./Templates/Transportationreciept";
import Loader from "../Loader";
import { saveAs } from "file-saver";
import DischargeReport from "./Templates/DischargeReport";
const AddJobs = ({
  open,
  onClose,
  charge,
  services,
  ports,
  customers,
  pdaResponse,
  vendors,
  onSubmit,
  opsPhoneNumber,
  templates,
}) => {
  console.log(pdaResponse, "pdaResponse");
  console.log(charge, "AddJobs_charge");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [allVendors, setAllVendors] = useState([]);
  const [editChargeData, setEditChargeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [isBerthReportOpen, setIsBerthReportOpen] = useState(false);
  const [isCrewChangeListOpen, setIsCrewChangeListOpen] = useState(false);
  const [isLoadingReportOpen, setIsLoadingReportOpen] = useState(false);
  const [isOKTBOpen, setIsOKTBOpen] = useState(false);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [isTransportationOpen, setIsTransportationOpen] = useState(false);
  const [isDischargeReportOpen, setIsDischargeReportOpen] = useState(false);

  const [templatesList, setTemplatesList] = useState([]);

  const [isBerthReportEdit, setIsBerthReportEdit] = useState(false);
  const [isCrewChangeListEdit, setIsCrewChangeListEdit] = useState(false);
  const [isLoadingReportEdit, setIsLoadingReportEdit] = useState(false);
  const [isOKTBEdit, setIsOKTBEdit] = useState(false);
  const [isProvisionEdit, setIsProvisionEdit] = useState(false);
  const [isTransportationEdit, setIsTransportationEdit] = useState(false);
  const [isDischargeReportEdit, setIsDischargeReportEdit] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedServiceError, setSelectedServiceError] = useState(false);
  const [selectedChargesTypeError, setSelectedChargesTypeError] =
    useState(false);
  const [selectedSubhargesTypeError, setSelectedSubhargesTypeError] =
    useState(false);
  const [selectedQuantityError, setSelectedQuantityError] = useState(false);
  const [selectedNewCustomerError, setSelectedNewCustomerError] =
    useState(false);
  const [firstFieldSelected, setFirstFieldSelected] = useState(false);
  const [secondFieldSelected, setSecondFieldSelected] = useState(false);
  const [thirdFieldSelected, setThirdFieldSelected] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedChargesType, setSelectedChargesType] = useState(null);
  const [selectedSubhargesType, setSelectedSubhargesType] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedNewCustomer, setSelectedNewCustomer] = useState(null);
  const [remarks, setRemarks] = useState(null);
  const [charges, setCharges] = useState([]);
  const [subCharges, setSubCharges] = useState([]);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedVendorError, setSelectedVendorError] = useState(false);

  // Template configuration mapping
  const templateConfig = {
    "Berthing Report": {
      openSetter: setIsBerthReportOpen,
      editSetter: setIsBerthReportEdit,
    },
    "Crew Change List": {
      openSetter: setIsCrewChangeListOpen,
      editSetter: setIsCrewChangeListEdit,
    },
    "Loading Report": {
      openSetter: setIsLoadingReportOpen,
      editSetter: setIsLoadingReportEdit,
    },
    OKTB: {
      openSetter: setIsOKTBOpen,
      editSetter: setIsOKTBEdit,
    },
    "Provision Delivery Notes": {
      openSetter: setIsProvisionOpen,
      editSetter: setIsProvisionEdit,
    },
    "Transportation Receipt": {
      openSetter: setIsTransportationOpen,
      editSetter: setIsTransportationEdit,
    },
    "Discharge Report": {
      openSetter: setIsDischargeReportOpen,
      editSetter: setIsDischargeReportEdit,
    },
  };

  const handleTemplateChange = (event) => {
    const selectedId = event.target.value; // Get the selected _id
    setSelectedTemplate(selectedId); // Set the selected _id in the state

    // Find the corresponding templateName
    const selectedTemplate = templates.find(
      (template) => template._id === selectedId
    );
    if (selectedTemplate) {
      const templateName =
        selectedTemplate.templateName === "Delivery Note"
          ? "Provision Delivery Notes"
          : selectedTemplate.templateName;

      setSelectedTemplateName(templateName);
    } else {
      setSelectedTemplateName("");
    }

    console.log(
      selectedId,
      selectedTemplate?.templateName,
      "handleTemplateChange"
    );
  };

  useEffect(() => {
    // Update allVendors whenever vendors prop changes
    if (Array.isArray(vendors)) {
      setAllVendors(vendors.map((v) => v._id));
    }
  }, [vendors]);

  useEffect(() => {
    console.log(allVendors, "allVendors");
  }, [allVendors]);

  const handleOpenTemplate = () => {
    // Find the selected template by ID
    const selectedTemplateObj = templates.find(
      (template) => template._id === selectedTemplate
    );

    if (selectedTemplateObj) {
      const templateName = selectedTemplateObj.templateName;
      const config = templateConfig[templateName];

      if (config) {
        config.openSetter(true);
        config.editSetter(false);
      }
    }
  };

  const handleCloseAllDialogs = () => {
    setIsBerthReportOpen(false);
    setIsCrewChangeListOpen(false);
    setIsLoadingReportOpen(false);
    setIsOKTBOpen(false);
    setIsProvisionOpen(false);
    setIsTransportationOpen(false);
    setIsDischargeReportOpen(false);
    setSelectedTemplate("");
  };

  const handleOKTBReportSubmit = (response) => {
    console.log("template_Submitted:", response);
    if (response?.status == true) {
      setSelectedTemplate("");
      if (isOKTBEdit == true) {
        setMessage("Template has been updated successfully");
      } else {
        setMessage("Template has been saved successfully");
      }
      setOpenPopUp(true);
      setIsOKTBOpen(false);

      setTemplatesList((previousTemplates) => {
        const existingIndex = previousTemplates.findIndex(
          (template) => template.templateId === response.templateId
        );
        if (existingIndex !== -1) {
          const updatedTemplates = [...previousTemplates];
          updatedTemplates[existingIndex] = response;
          return updatedTemplates;
        }
        return [...previousTemplates, response];
      });
    }
  };
  const handleBerthReportSubmit = (response) => {
    console.log("template_Submitted:", response);
    if (response?.status == true) {
      setSelectedTemplate("");
      if (isBerthReportEdit == true) {
        setMessage("Template has been updated successfully");
      } else {
        setMessage("Template has been saved successfully");
      }
      setOpenPopUp(true);
      setIsBerthReportOpen(false);
      setTemplatesList((previousTemplates) => {
        const existingIndex = previousTemplates.findIndex(
          (template) => template.templateId === response.templateId
        );
        if (existingIndex !== -1) {
          const updatedTemplates = [...previousTemplates];
          updatedTemplates[existingIndex] = response;
          return updatedTemplates;
        }
        return [...previousTemplates, response];
      });
    }
  };
  const handleCrewSubmit = (response) => {
    console.log("template_Submitted:", response);
    if (response?.status == true) {
      setSelectedTemplate("");
      if (isCrewChangeListEdit == true) {
        setMessage("Template has been updated successfully");
      } else {
        setMessage("Template has been saved successfully");
      }
      setOpenPopUp(true);
      setIsCrewChangeListOpen(false);
      setTemplatesList((previousTemplates) => {
        const existingIndex = previousTemplates.findIndex(
          (template) => template.templateId === response.templateId
        );
        if (existingIndex !== -1) {
          const updatedTemplates = [...previousTemplates];
          updatedTemplates[existingIndex] = response;
          return updatedTemplates;
        }
        return [...previousTemplates, response];
      });
    }
  };
  const handleLoadingReportSubmit = (response) => {
    console.log("template_Submitted:", response);
    if (response?.status == true) {
      setSelectedTemplate("");

      if (isLoadingReportEdit == true) {
        setMessage("Template has been updated successfully");
      } else {
        setMessage("Template has been saved successfully");
      }
      setOpenPopUp(true);
      setIsLoadingReportOpen(false);
      setTemplatesList((previousTemplates) => {
        const existingIndex = previousTemplates.findIndex(
          (template) => template.templateId === response.templateId
        );
        if (existingIndex !== -1) {
          const updatedTemplates = [...previousTemplates];
          updatedTemplates[existingIndex] = response;
          return updatedTemplates;
        }
        return [...previousTemplates, response];
      });
    }
  };

  const handleProvisionSubmit = (response) => {
    console.log("template_Submitted:", response);
    if (response?.status == true) {
      setSelectedTemplate("");

      if (isProvisionEdit == true) {
        setMessage("Template has been updated successfully");
      } else {
        setMessage("Template has been saved successfully");
      }
      setOpenPopUp(true);
      setIsProvisionOpen(false);
      setTemplatesList((previousTemplates) => {
        const existingIndex = previousTemplates.findIndex(
          (template) => template.templateId === response.templateId
        );
        if (existingIndex !== -1) {
          const updatedTemplates = [...previousTemplates];
          updatedTemplates[existingIndex] = response;
          return updatedTemplates;
        }
        return [...previousTemplates, response];
      });
    }
  };
  const handleTransportationSubmit = (response) => {
    if (response?.status == true) {
      setSelectedTemplate("");

      if (isTransportationEdit == true) {
        setMessage("Template has been updated successfully");
      } else {
        setMessage("Template has been saved successfully");
      }
      setOpenPopUp(true);
      console.log("template_Submitted:", response);
      setIsTransportationOpen(false);
      setTemplatesList((previousTemplates) => {
        const existingIndex = previousTemplates.findIndex(
          (template) => template.templateId === response.templateId
        );
        if (existingIndex !== -1) {
          const updatedTemplates = [...previousTemplates];
          updatedTemplates[existingIndex] = response;
          return updatedTemplates;
        }
        return [...previousTemplates, response];
      });
    }
  };
  const handleDischargeReportSubmit = (response) => {
    if (response?.status == true) {
      setSelectedTemplate("");

      if (isDischargeReportEdit == true) {
        setMessage("Template has been updated successfully");
      } else {
        setMessage("Template has been saved successfully");
      }
      setOpenPopUp(true);
      console.log("template_Submitted:", response);
      setIsDischargeReportOpen(false);
      setTemplatesList((previousTemplates) => {
        const existingIndex = previousTemplates.findIndex(
          (template) => template.templateId === response.templateId
        );
        if (existingIndex !== -1) {
          const updatedTemplates = [...previousTemplates];
          updatedTemplates[existingIndex] = response;
          return updatedTemplates;
        }
        return [...previousTemplates, response];
      });
    }
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "service":
        setSelectedService(services.find((service) => service?._id === value));
        setFirstFieldSelected(true);
        setSelectedServiceError(false);
        setCharges([]);
        setSubCharges([]);
        setSelectedChargesType(null);
        break;
      case "chargeType":
        setSelectedChargesType(charges.find((charge) => charge?._id === value));
        setSecondFieldSelected(true);
        setSelectedChargesTypeError(false);
        setSubCharges([]);
        break;
      case "subChargeType":
        setSelectedSubhargesType(
          subCharges.find((subCharge) => subCharge?._id === value)
        );
        setThirdFieldSelected(true);
        setSelectedSubhargesTypeError(false);
        break;
      case "customer":
        setSelectedNewCustomer(
          customers.find((customer) => customer?._id === value)
        );
        setSelectedNewCustomerError(false);
        break;
      case "vendor":
        setSelectedVendor(vendors.find((vendor) => vendor?._id === value));
        setSelectedVendorError(false);
        break;
      case "status":
        setSelectedStatus(value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const response = await getCharges({
          serviceId: selectedService?._id,
        });
        setCharges(response?.charges);
        console.log("Fetched Charges:", response);
      } catch (error) {
        console.error("Error fetching PDA values:", error);
      }
    };

    if (selectedService) {
      fetchCharges();
      console.log(selectedService, "selectedService");
    }
  }, [selectedService]);

  useEffect(() => {
    const fetchSubCharges = async () => {
      // Check that chargeId and _id are not undefined or empty strings
      console.log(selectedChargesType, "selectedChargesType_addJobs");

      try {
        let formdata = {
          chargeId: selectedChargesType?._id?._id,
        };
        const response = await getSubcharges(formdata);
        console.log(response, "response_getSubcharges_addjobs");
        setSubCharges(response?.subcharges);
        console.log(response);
      } catch (error) {
        console.error("Error fetching PDA values:", error);
      }
    };

    // Trigger fetchSubCharges only if chargeId or _id is valid
    if (selectedChargesType?.chargeId) {
      fetchSubCharges();
      console.log("selectedChargesType:", selectedChargesType);
    } else if (selectedChargesType?._id) {
      fetchSubCharges();
    } else {
      console.log("selectedChargesType does not have chargeId or _id.");
    }
  }, [selectedChargesType?.chargeId, selectedChargesType?._id]);

  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const documentsUpload = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const formData = new FormData();

      // Append all selected files to FormData
      Array.from(event.target.files).forEach((file) => {
        formData.append("files", file); // "files" is the expected key for your API
      });

      try {
        setUploadStatus("Uploading...");
        const response = await uploadDocuments(formData);
        if (response.status) {
          setUploadStatus("Upload successful!");
          setUploadedFiles((prevFiles) => [...prevFiles, ...response.data]); // Append new files to existing ones
        } else {
          setUploadStatus("Upload failed. Please try again.");
        }
      } catch (error) {
        console.error("File upload error:", error);
        setUploadStatus("An error occurred during upload.");
      }
    }
  };

  const handleFileDelete = async (fileUrl) => {
    // Update the state by filtering out the file with the specified URL
    console.log(fileUrl, "fileUrl");
    if (fileUrl?._id) {
      let payload = {
        pdaId: charge?._id,
        documentId: fileUrl?._id,
      };
      try {
        const response = await deletePdaDocument(payload);
        if (response.status) {
          const updatedFiles = uploadedFiles.filter(
            (file) => file.url !== fileUrl?.url
          );
          setUploadedFiles(updatedFiles);
          setMessage("File has been deleted successfully");
          setOpenPopUp(true);
        } else {
          setMessage("Failed please try again!");
          setOpenPopUp(true);
        }
      } catch (error) {
        setMessage("Failed please try again!");
        setOpenPopUp(true);
      }
    } else {
      setMessage("File has been deleted successfully");
      setOpenPopUp(true);
      const updatedFiles = uploadedFiles.filter(
        (file) => file.url !== fileUrl?.url
      );
      setUploadedFiles(updatedFiles);
    }
  };

  const editCharges = async () => {
    // Individual checks for each field
    if (selectedService == null || selectedService === "") {
      setSelectedServiceError(true);
    } else {
      setSelectedServiceError(false);
    }
    if (selectedChargesType == null || selectedChargesType === "") {
      setSelectedChargesTypeError(true);
    } else {
      setSelectedChargesTypeError(false);
    }
    if (selectedSubhargesType == null || selectedSubhargesType === "") {
      setSelectedSubhargesTypeError(true);
    } else {
      setSelectedSubhargesTypeError(false);
    }

    if (selectedService && selectedChargesType && selectedSubhargesType) {
      // Only include vendorId fields that match the current selectedIds
      const filteredVendorIds = {};
      selectedIds.forEach((id, idx) => {
        if (id) {
          filteredVendorIds[`vendor${idx === 0 ? "" : idx + 1}Id`] = id;
        }
      });
      console.log(selectedIds, "selectedIds_checkingMultiSelect");
      console.log(filteredVendorIds, "filteredVendorIds_checkingMultiSelect");
      let chargesPayload = {
        pdaChargeId: charge?._id,
        serviceId: selectedService?.serviceId || selectedService?._id,
        chargeId: selectedChargesType?.chargeId || selectedChargesType?._id,
        subchargeId:
          selectedSubhargesType?.subchargeId || selectedSubhargesType?._id,
        remark: remarks,
        status: Number(selectedStatus),
        documents: uploadedFiles,
        templates: templatesList,
        // Vendor fields from charge object
        vendorOMR: charge?.vendorOMR,
        vendorVAT: charge?.vendorVAT,
        vendorTotalUSD: charge?.vendorTotalUSD,
        isPrivateVendor: charge?.isPrivateVendor,
        vendor2OMR: charge?.vendor2OMR,
        vendor2VAT: charge?.vendor2VAT,
        vendor2TotalUSD: charge?.vendor2TotalUSD,
        isPrivateVendor2: charge?.isPrivateVendor2,
        vendor3OMR: charge?.vendor3OMR,
        vendor3VAT: charge?.vendor3VAT,
        vendor3TotalUSD: charge?.vendor3TotalUSD,
        isPrivateVendor3: charge?.isPrivateVendor3,
        vendor4OMR: charge?.vendor4OMR,
        vendor4VAT: charge?.vendor4VAT,
        vendor4TotalUSD: charge?.vendor4TotalUSD,
        isPrivateVendor4: charge?.isPrivateVendor4,
        vendorId: charge?.vendorId,
        vendor2Id: charge?.vendor2Id,
        vendor3Id: charge?.vendor3Id,
        vendor4Id: charge?.vendor4Id,
      };
      console.log(chargesPayload, "edit_charges_payload_checkingMultiSelect");
      setIsLoading(true);
      try {
        const response = await editChargeQuotation(chargesPayload);
        setIsLoading(false);
        setMessage("Charge updated successfully");
        setOpenPopUp(true);
        console.log("Fetched Charges:", response);
        setSelectedVendor("");
        onSubmit();
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching charges:", error);
        setMessage("Failed to update charges");
        setOpenPopUp(true);
      }
    } else {
      setIsLoading(false);

      setMessage("Please fill all the required fields");
      setOpenPopUp(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "remarks") {
      setRemarks(value);
    }
  };

  useEffect(() => {
    setRemarks(charge?.remark || ""); // Handle null/undefined charge
    setUploadedFiles(charge?.documents);
    console.log(charge, "selected_charge_addJob");
    setSelectedService({
      _id: charge?.serviceId,
    });
    setSelectedChargesType({
      _id: charge?.chargeId,
    });
    setSelectedSubhargesType({
      _id: charge?.subchargeId,
    });
    setSelectedVendor({
      _id: charge?.vendorId,
    });
    setSelectedStatus(charge?.status);

    setTemplatesList(charge?.templates);

    // Pre-fill Multiselect with vendor IDs from charge
    // Select vendor IDs only if their corresponding isPrivateVendor fields are false
    const vendorIdsFromCharge = [];
    if (charge?.vendorId && charge?.isPrivateVendor === false) {
      vendorIdsFromCharge.push(charge.vendorId);
    }
    if (charge?.vendor2Id && charge?.isPrivateVendor2 === false) {
      vendorIdsFromCharge.push(charge.vendor2Id);
    }
    if (charge?.vendor3Id && charge?.isPrivateVendor3 === false) {
      vendorIdsFromCharge.push(charge.vendor3Id);
    }
    if (charge?.vendor4Id && charge?.isPrivateVendor4 === false) {
      vendorIdsFromCharge.push(charge.vendor4Id);
    }
    setSelectedIds(vendorIdsFromCharge);
  }, [charge]);

  useEffect(() => {
    console.log(uploadedFiles, "uploadedFilesAddjobs");
    console.log(selectedVendor, "selectedVendorAddjobs");
  }, [uploadedFiles, selectedVendor]);

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const response = await getCharges({
          serviceId: selectedService?._id,
        });
        setCharges(response?.charges);
        console.log("Fetched Charges:", response);
      } catch (error) {
        console.error("Error fetching PDA values:", error);
      }
    };

    if (selectedService) {
      fetchCharges();
      console.log(selectedService, "selectedService");
    }
  }, [selectedService]);

  useEffect(() => {
    console.log(templatesList, "templatesList");
    console.log(subCharges, "subCharges_addJobs");
  }, [templatesList, subCharges]);
  const BASE_URL = `${process.env.REACT_APP_FILE_URL}`; // Replace with your actual base URL

  const handleDownload = (template) => {
    const fileUrl = process.env.REACT_APP_FILE_URL + template?.pdfPath;
    const fileName =
      template?.templateName === "Provision Delivery Notes"
        ? "Delivery Note"
        : template?.templateName === "Berthing Report"
        ? "Statement Of Facts"
        : template?.templateName;

    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        if (blob.type !== "application/pdf") {
          throw new Error("File is not a PDF");
        }
        saveAs(blob, fileName);
      })
      .catch((error) => console.error("Download error:", error));
  };

  const handleView = (template) => {
    console.log(template, "template");
    window.open(`${BASE_URL}${template?.pdfPath}`, "_blank");
  };

  const handleEdit = (template) => {
    console.log(template, "template_handleEdit");
    setSelectedTemplate(template?.templateId); // Set the selected _id in the state
    setSelectedTemplateName(template?.templateName);

    const config = templateConfig[template?.templateName];
    if (config) {
      config.openSetter(true);
      config.editSetter(true);
    }
  };

  const handleTemplateFileDelete = async (fileUrl, index) => {
    // Update the state by filtering out the file with the specified URL
    console.log(fileUrl, "fileUrl");
    console.log(index, "index");

    if (fileUrl?._id) {
      let payload = {
        templateId: fileUrl?.templateId,
        pdaChargeId: charge?._id,
        documentId: fileUrl?._id,
      };
      try {
        const response = await deleteTemplate(payload);
        if (response.status) {
          const updatedFiles = templatesList.filter((_, i) => i !== index);
          console.log(updatedFiles, "updatedFiles");
          setTemplatesList(updatedFiles);
          setMessage("Template has been deleted successfully");
          setOpenPopUp(true);
        } else {
          setMessage("Failed please try again!");
          setOpenPopUp(true);
        }
      } catch (error) {
        setMessage("Failed please try again!");
        setOpenPopUp(true);
      }
    } else {
      const updatedFiles = templatesList.filter((_, i) => i !== index);
      console.log(updatedFiles, "updatedFiles");
      setTemplatesList(updatedFiles);
      setMessage("Template has been deleted successfully");
      setOpenPopUp(true);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Store selected vendor IDs as vendorId, vendor2Id, vendor3Id, vendor4Id
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState({
    vendorId: "",
    vendor2Id: "",
    vendor3Id: "",
    vendor4Id: "",
  });

  // Update selectedVendorIds whenever selectedIds changes
  useEffect(() => {
    setSelectedVendorIds({
      vendorId: selectedIds[0] || "",
      vendor2Id: selectedIds[1] || "",
      vendor3Id: selectedIds[2] || "",
      vendor4Id: selectedIds[3] || "",
    });
    console.log(selectedIds, "selectedIds");
  }, [selectedIds]);

  useEffect(() => {
    console.log("Selected Vendor IDs:", selectedVendorIds);
  }, [selectedVendorIds]);

  const handleVendorSelect = (selectedList) => {
    const ids = selectedList.map((item) => item._id).slice(0, 4); // Only allow up to 4
    setSelectedIds(ids);
    console.log("Selected IDs:", ids);
  };

  const handleRemove = (selectedList) => {
    // selectedList contains the remaining selected vendor objects after removal
    const ids = selectedList.map((item) => item._id); // No need to slice, Multiselect already limits
    setSelectedIds(ids);
    console.log("Updated Selected IDs:", ids);
  };

  const customStyles = {
    multiselectContainer: {
      // Optional: Style for the container if needed
    },
    option: {
      fontSize: "0.7rem", // Set font size for dropdown options
      padding: "5px 10px", // Optional: Add padding for better spacing
      cursor: "pointer", // Ensure options look clickable
    },
    optionContainer: {
      // Optional: Customize the option container (dropdown menu)
    },
  };

  const hoverStyles = {
    backgroundColor: "#eee !important", // Apply the background color on hover
  };

  useEffect(() => {
    console.log(vendors, "vendors_addJobs");
  }, [vendors]);

  useEffect(() => {
    console.log(templates, "templates_addJobs");
  }, [templates]);

  return (
    <>
      <div>
        <Dialog
          sx={{
            width: 800,
            margin: "auto",
            borderRadius: 2,
          }}
          open={open}
          onClose={(event, reason) => {
            if (reason === "backdropClick") {
              // Prevent dialog from closing when clicking outside
              return;
            }
            handleClose(); // Allow dialog to close for other reasons
          }}
          fullWidth
          maxWidth="lg"
        >
          <div className="d-flex justify-content-between ">
            <DialogTitle>Update Charge</DialogTitle>
            <div className="closeicon">
              <i className="bi bi-x-lg " onClick={handleClose}></i>
            </div>
          </div>
          <DialogContent style={{ marginBottom: "40px" }}>
            <div className="typesofcall-row ">
              <div className="row mb-3 align-items-start">
                <div className="col-4">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Services <span className="required"> </span> :
                  </label>
                  <div className="vessel-select">
                    <select
                      name="service"
                      className="form-select vesselbox"
                      onChange={handleSelectChange}
                      aria-label="Default select example"
                      value={selectedService?._id?._id}
                    >
                      <option value="">Choose Services</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.serviceName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedServiceError && (
                    <>
                      <div className="invalid">Please select service</div>
                    </>
                  )}
                </div>

                <>
                  <div className="col-4">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      Charges Type <span className="required"> </span> :
                    </label>
                    <div className="vessel-select">
                      <select
                        name="chargeType"
                        className="form-select vesselbox vesselbox:placeholder"
                        onChange={handleSelectChange}
                        aria-label="Default select example"
                        value={selectedChargesType?._id?._id}
                      >
                        <option value="">Choose Charge Type</option>
                        {charges?.map((charge) => (
                          <option key={charge._id} value={charge._id}>
                            {charge.chargeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedChargesTypeError && (
                      <>
                        <div className="invalid">
                          Please select charges type
                        </div>
                      </>
                    )}
                  </div>
                </>

                <>
                  <div className="col-4">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      {" "}
                      Sub Charges Type <span className="required"> </span> :
                    </label>
                    <div className="vessel-select">
                      <select
                        name="subChargeType"
                        className="form-select vesselbox "
                        onChange={handleSelectChange}
                        aria-label="Default select example"
                        value={selectedSubhargesType?._id?._id}
                      >
                        <option value="">Choose Sub Charge Type</option>
                        {subCharges?.map((charge) => (
                          <option key={charge._id} value={charge._id}>
                            {charge.subchargeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedSubhargesTypeError && (
                      <>
                        <div className="invalid">
                          Please select sub charges type
                        </div>
                      </>
                    )}
                  </div>
                </>
              </div>
            </div>

            <>
              <div className="typesofcall-row ">
                <div className="row mb-2 align-items-start">
                  <div className="col-4">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label "
                    >
                      {" "}
                      Status <span className="required"> </span> :
                    </label>
                    <div className="vessel-select">
                      {pdaResponse?.pdaStatus != 7 && (
                        <>
                          <select
                            name="status"
                            className="form-select vesselbox statuss"
                            onChange={handleSelectChange}
                            aria-label="Default select example"
                            value={selectedStatus}
                          >
                            <option value={1}>Open </option>
                            <option value={2}>In Progress </option>
                            <option value={3}>Completed</option>
                          </select>
                        </>
                      )}

                      {pdaResponse?.pdaStatus == 7 && (
                        <>
                          <input
                            type="text"
                            className="form-control vesselbox"
                            value="Completed"
                            readOnly
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="col-8 ">
                    <div className="mb-1">
                      <div className="col">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label "
                        >
                          Remarks:
                        </label>
                        <textarea
                          rows="1"
                          className="form-control updatechargremakrs remarkfontsize"
                          id="exampleFormControlInput1"
                          placeholder=""
                          name="remarks"
                          onChange={handleInputChange}
                          value={remarks}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className=" typesofcall-row mb-2">
                <div className="row">
                  {selectedIds?.length > 0 && (
                    <div className="col-12">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Vendor Name <span className="required"> </span> :
                      </label>
                      <div className="vessel-select">
                        <div className="selected-vendors">
                          {selectedIds
                            .map((id) => vendors.find((v) => v._id === id))
                            .filter(Boolean)
                            .map((vendor) => (
                              <div key={vendor._id} className="vendor-item ">
                                {vendor.vendorName}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="row align-items-start">
                  <div className="col-4">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      {" "}
                      Templates <span className="required"> </span> :
                    </label>
                    <div className="vessel-select">
                      <select
                        name="template"
                        className="form-select vesselbox"
                        aria-label="Default select example"
                        value={selectedTemplate}
                        onChange={handleTemplateChange}
                      >
                        <option value="">Choose Template</option>
                        {templates.map((template) => (
                          <option key={template._id} value={template._id}>
                            {template?.templateName ===
                            "Provision Delivery Notes"
                              ? "Delivery Note"
                              : template?.templateName === "Berthing Report"
                              ? "Statement Of Facts"
                              : template?.templateName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="btnjobrole col-4">
                    <button
                      className="btn btna submit-button temp-btn btnfsize"
                      onClick={handleOpenTemplate}
                      disabled={!selectedTemplate}
                    >
                      Generate Template
                    </button>
                  </div>
                </div>
              </div>

              {templatesList && templatesList?.length > 0 && (
                <>
                  <div className="templatelink">Template Link:</div>
                  <div className="templateouter">
                    {templatesList?.length > 0 &&
                      templatesList?.map((template, index) => {
                        return (
                          <>
                            <div className="d-flex justify-content-between ">
                              <div className="tempgenerated ">
                                {template?.templateName ===
                                "Provision Delivery Notes"
                                  ? "Delivery Note"
                                  : template?.templateName === "Berthing Report"
                                  ? "Statement Of Facts"
                                  : template?.templateName}
                              </div>
                              <div className="d-flex">
                                <div
                                  className="icondown"
                                  onClick={() => handleDownload(template)}
                                >
                                  <i className="bi bi-download"></i>
                                </div>
                                <div
                                  className="iconpdf"
                                  onClick={() => handleView(template)}
                                >
                                  <i className="bi bi-file-earmark-pdf"></i>
                                </div>
                                {/* Show Edit icon only if not "Provision Delivery Notes" */}
                                {template?.templateName !==
                                  "Provision Delivery Notes" && (
                                  <>
                                    <div
                                      className="iconpdf"
                                      onClick={() => handleEdit(template)}
                                    >
                                      <i className="bi bi-pencil-square"></i>
                                    </div>
                                  </>
                                )}

                                <div
                                  className="iconpdf"
                                  onClick={() =>
                                    handleTemplateFileDelete(template, index)
                                  }
                                >
                                  <i className="bi bi-trash"></i>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })}
                  </div>
                </>
              )}

              <div className="typesofcall-row ">
                <div className="row align-items-start">
                  <div className="mb-2">
                    <label htmlFor="formFile" className="form-label">
                      Document Upload:
                    </label>
                    <input
                      className="form-control documentsfsize"
                      type="file"
                      id="portofolio"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        documentsUpload(e); // Call your upload handler
                        e.target.value = ""; // Reset the file input value to hide uploaded file names
                      }}
                    ></input>
                  </div>
                </div>
              </div>

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
                                <div
                                  className="iconpdf"
                                  onClick={() => handleFileDelete(file)}
                                >
                                  <i className="bi bi-trash"></i>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })}
                  </div>
                </>
              )}
            </>

            <div className="col-12 mt-5">
              <div className="footer-button d-flex justify-content-center ">
                <button
                  type="button"
                  className="btn btncancel"
                  onClick={() => {
                    handleClose();
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn  generate-buttona "
                  onClick={() => {
                    editCharges();
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Dialog Components */}
      {isBerthReportOpen && (
        <BerthReport
          open={isBerthReportOpen}
          onClose={handleCloseAllDialogs}
          charge={charge}
          selectedTemplateName={selectedTemplateName}
          selectedTemplate={selectedTemplate}
          pdaResponse={pdaResponse}
          onSubmit={handleBerthReportSubmit}
          isEdit={isBerthReportEdit}
        />
      )}
      {isCrewChangeListOpen && (
        <CrewChangeList
          open={isCrewChangeListOpen}
          onClose={handleCloseAllDialogs}
          charge={charge}
          selectedTemplateName={selectedTemplateName}
          selectedTemplate={selectedTemplate}
          onSubmit={handleCrewSubmit}
          pdaResponse={pdaResponse}
          isEdit={isCrewChangeListEdit}
        />
      )}
      {isLoadingReportOpen && (
        <LoadingReport
          open={isLoadingReportOpen}
          onClose={handleCloseAllDialogs}
          charge={charge}
          selectedTemplateName={selectedTemplateName}
          selectedTemplate={selectedTemplate}
          onSubmit={handleLoadingReportSubmit}
          pdaResponse={pdaResponse}
          isEdit={isLoadingReportEdit}
        />
      )}
      {isOKTBOpen && (
        <OKTBReport
          open={isOKTBOpen}
          onClose={handleCloseAllDialogs}
          charge={charge}
          selectedTemplateName={selectedTemplateName}
          selectedTemplate={selectedTemplate}
          onSubmit={handleOKTBReportSubmit}
          pdaResponse={pdaResponse}
          isEdit={isOKTBEdit}
          opsPhoneNumber={opsPhoneNumber}
        />
      )}
      {isProvisionOpen && (
        <ProvisionDeliveryNotes
          open={isProvisionOpen}
          onClose={handleCloseAllDialogs}
          charge={charge}
          onSubmit={handleProvisionSubmit}
          selectedTemplateName={selectedTemplateName}
          selectedTemplate={selectedTemplate}
          pdaResponse={pdaResponse}
          isEdit={isProvisionEdit}
        />
      )}
      {isTransportationOpen && (
        <Transportationreciept
          open={isTransportationOpen}
          onClose={handleCloseAllDialogs}
          selectedTemplateName={selectedTemplateName}
          selectedTemplate={selectedTemplate}
          charge={charge}
          onSubmit={handleTransportationSubmit}
          selectedChargesType={selectedChargesType}
          selectedService={selectedService}
          services={services}
          pdaResponse={pdaResponse}
          isEdit={isTransportationEdit}
        />
      )}
      {isDischargeReportOpen && (
        <DischargeReport
          open={isDischargeReportOpen}
          onClose={handleCloseAllDialogs}
          selectedTemplateName={selectedTemplateName}
          selectedTemplate={selectedTemplate}
          charge={charge}
          onSubmit={handleDischargeReportSubmit}
          selectedChargesType={selectedChargesType}
          selectedService={selectedService}
          services={services}
          pdaResponse={pdaResponse}
          isEdit={isDischargeReportEdit}
        />
      )}
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default AddJobs;
