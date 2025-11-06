import React, { useEffect, useState, useRef } from "react";
import "../css/createpda.css";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ResponsiveDialog from "./ResponsiveDialog";
import ChargesTable from "./ChargesTable";
import {
  savePda,
  changeQuotationStatus,
  editPDA,
  getPdaDetails,
  getPdaFile,
  getAnchorageLocations,
  resubmitPdaForApproval,
  showServiceRequest,
} from "../services/apiService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopUp from "./PopUp";
import QuotationDialog from "./QuotationDialog";
import PdaDialog from "./PdaDialog";
import Remarks from "./Remarks";
import moment from "moment";
import { useLocation } from "react-router-dom";
import SendInvoice from "./SendInvoice";
import InvoicePage from "./InvoicePage";
import InvoiceDocuments from "./InvoiceDocuments";
import Swal from "sweetalert2";
import Servicerequests from "./Servicerequests";
import CreditNoteMail from "./CreditNoteMail";

const CreatePDA = ({
  vessels,
  ports,
  cargos,
  vesselTypes,
  services,
  customers,
  loginResponse,
  vendors,
}) => {
  const createPdaImage = require("../assets/images/Group 1000002975.png");
  const updatePdaImage = require("../assets/images/updatedpda.png");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const [selectedVesselError, setSelectedVesselError] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [selectedPortError, setSelectedPortError] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [selectedCargoCapacity, setSelectedCargoCapacity] = useState(null);
  const [selectedCargoCapacityError, setSelectedCargoCapacityError] =
    useState(null);
  const [selectedAnchorageLocation, setSelectedAnchorageLocation] =
    useState(null);
  const [selectedVesselType, setSelectedVesselType] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerError, setSelectedCustomerError] = useState(null);
  const [etaDateError, setEtaDateError] = useState(null);
  const [etdDateError, setEtdDateError] = useState(null);
  const [eta, setEta] = useState("");
  const [etd, setEtd] = useState("");
  const [status, setStatus] = useState(1);
  const [finalChargesArray, setFinalChargesArray] = useState([]);
  const [isEditcharge, setIsEditcharge] = useState(false);
  const [isInitialEdit, setIsInitialEdit] = useState(false);
  const [isMainEdit, setIsMainEdit] = useState(false);
  const [editCharge, setEditCharge] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [fullPdaResponse, setFullPdaResponse] = useState(null);
  const [pdaResponse, setPdaResponse] = useState(null);
  const [pdaServicesResponse, setPdaServicesResponse] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [anchorageLocations, setAnchorageLocations] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [requestedServices, setRequestedServices] = useState([]);
  const [anchorageLocationID, setAnchorageLocationID] = useState("");
  const [etaHours, setEtaHours] = useState("");
  const [etaMinutes, setEtaMinutes] = useState("");
  const [etdHours, setEtdHours] = useState("");
  const [etdMinutes, setEtdMinutes] = useState("");
  const [etaTime, setEtaTime] = useState("");
  const [etdTime, setEtdTime] = useState("");
  const [error, setError] = useState("");
  const [etdError, setEtdError] = useState("");

  const [formData, setFormData] = useState({
    vesselVoyageNumber: "",
    IMONumber: "",
    LOA: "",
    GRT: "",
    NRT: "",
  });

  const [errors, setErrors] = useState({
    vesselVoyageNumber: false,
    IMONumber: false,
    LOA: false,
    GRT: false,
    NRT: false,
  });

  // Boolean states for each option
  const [isVessels, setIsVessels] = useState(false);
  const [isServices, setIsServices] = useState(false);
  const [typeOfVesselError, setTypeOfVesselError] = useState(false);
  const [isCustomerApproved, setIsCustomerApproved] = useState(false);
  // Handler functions to toggle each state
  const handleVesselsChange = () => {
    setIsVessels(!isVessels);
    if (!isVessels) {
      setTypeOfVesselError(false);
    }
  };

  const handleCustomerApproved = () => {
    setIsCustomerApproved(!isCustomerApproved);
  };

  const handleServicesChange = () => {
    setIsServices(!isServices);
    if (!isServices) {
      setTypeOfVesselError(false);
    }
  };

  console.log(vessels, "vessels");
  console.log(ports, "ports");
  console.log(cargos, "cargos");
  console.log(vesselTypes, "vesselTypes");
  console.log(customers, "customers");
  console.log(loginResponse, "loginResponse");

  // Handle select change
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    console.log(name, "name_handleSelectChange");

    switch (name) {
      case "vessel":
        setSelectedVessel(vessels.find((vessel) => vessel._id === value));
        setSelectedVesselError(false);
        console.log(value, "value_VESSEL");
        if (name == "vessel") {
          setErrors((prev) => ({
            ...prev,
            IMONumber: false,
            LOA: false,
            GRT: false,
            NRT: false,
          }));
          setFormData((prevFormData) => ({
            ...prevFormData,
            IMONumber: "",
            LOA: "",
            GRT: "",
            NRT: "",
          }));
        }
        break;
      case "port":
        setSelectedPort(ports.find((port) => port._id === value));
        setSelectedPortError(false);
        fetchAnchorageValues(ports.find((port) => port._id === value));
        break;
      case "cargo":
        setSelectedCargo(cargos.find((cargo) => cargo._id === value));
        break;
      case "vesselType":
        setSelectedVesselType(vesselTypes.find((type) => type._id === value));
        break;
        break;
      case "customer":
        setSelectedCustomer(
          customers.find((customer) => customer._id === value)
        );
        setSelectedCustomerError(false);
        break;
      case "anchorageLocation":
        setSelectedAnchorageLocation(
          anchorageLocations.find((location) => location._id === value)
        );
        break;
      default:
        break;
    }
  };

  // Single handler function to update state based on input name
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(value, "value_handleInputChange");

    if (name === "cargoCapacity") {
      setSelectedCargoCapacity(value);
      setSelectedCargoCapacityError(false);
    }

    // Clear individual field error if user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: false,
    }));

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handlers to update dates

  // const handleEtaChange = (date) => {
  //   if (date) {
  //     setEta(date);
  //   }
  // };

  const handleEtaChange = (date) => {
    if (date) {
      setEta(date);
      setEtaDateError(false);

      // Get hours & minutes safely (default to 00 if empty)
      const hours = etaHours === "" ? "00" : etaHours;
      const minutes = etaMinutes === "" ? "00" : etaMinutes;

      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);

      // Validation
      if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
        setEtaTime("");
        return;
      }

      // ✅ Set formatted ETA time string
      const formattedTime = `${moment(date).format("YYYY-MM-DD")} ${String(
        h
      ).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      setEtaTime(formattedTime);
    }
  };

  // const handleEtdChange = (date) => {
  //   if (date) {
  //     setEtd(date);
  //   }
  // };

  const handleEtdChange = (date) => {
    if (date) {
      setEtd(date);
      setEtdDateError(false);
      // Get hours & minutes safely (default to 00 if empty)
      const hours = etdHours === "" ? "00" : etdHours;
      const minutes = etdMinutes === "" ? "00" : etdMinutes;

      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);

      // Validation
      if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
        setEtdTime("");
        return;
      }

      // ✅ Set formatted ETA time string
      const formattedTime = `${moment(date).format("YYYY-MM-DD")} ${String(
        h
      ).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      setEtdTime(formattedTime);
    }
  };

  useEffect(() => {
    console.log(selectedPort, "selectedPort");
    console.log(selectedCargo, "selectedCargo");
    console.log(selectedVessel, "selectedVessel");
    console.log(selectedVesselType, "selectedVesselType");
    console.log(selectedCustomer, "selectedCustomer");
    console.log(isVessels, "isVessels");
    console.log(isServices, "isServices");
    console.log(eta, "eta");
    console.log(etd, "etd");
    console.log(anchorageLocations, "anchorageLocations");
    console.log(selectedAnchorageLocation, "selectedAnchorageLocation");
    console.log(uploadedFiles, "uploadedFiles");
    console.log("Effect triggered");
  }, [
    selectedPort,
    selectedCargo,
    selectedVesselType,
    selectedVessel,
    selectedCustomer,
    isVessels,
    isServices,
    eta,
    etd,
    anchorageLocations,
    selectedAnchorageLocation,
    uploadedFiles,
  ]);

  // useEffect(() => {
  //   console.log(selectedVessel, "selectedVessel");
  //   if (
  //     selectedVessel?.vesselName !== "TBA" &&
  //     pdaResponse == null &&
  //     editData == null
  //   ) {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       IMONumber: selectedVessel?.IMONumber,
  //       LOA: selectedVessel?.LOA,
  //       GRT: selectedVessel?.GRT,
  //       NRT: selectedVessel?.NRT,
  //     }));
  //   } else if (
  //     selectedVessel?.vesselName == "TBA" &&
  //     editData == null &&
  //     pdaResponse == null
  //   ) {
  //     alert("tba block");
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       IMONumber: "",
  //       LOA: "",
  //       GRT: "",
  //       NRT: "",
  //     }));
  //   } else if (selectedVessel?.vesselName == "TBA" && editData) {
  //     alert("tba block");
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       IMONumber: selectedVessel?.IMONumber,
  //       LOA: selectedVessel?.LOA,
  //       GRT: selectedVessel?.GRT,
  //       NRT: selectedVessel?.NRT,
  //     }));
  //   } else if (selectedVessel?.vesselName == "TBA" && pdaResponse) {
  //     alert("tba pdaResponse block");
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       IMONumber: pdaResponse?.IMONumber,
  //       LOA: pdaResponse?.LOA,
  //       GRT: pdaResponse?.GRT,
  //       NRT: pdaResponse?.NRT,
  //     }));
  //   }
  // }, [selectedVessel]); // Only re-run when selectedVessel changes

  // useEffect(() => {
  //   console.log(selectedVessel, "selectedVessel");
  //   if (selectedVessel?.vesselName !== "TBA") {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       IMONumber: selectedVessel?.IMONumber,
  //       LOA: selectedVessel?.LOA,
  //       GRT: selectedVessel?.GRT,
  //       NRT: selectedVessel?.NRT,
  //     }));
  //   }
  // }, [selectedVessel]); // Only re-run when selectedVessel changes

  // Effect to update formData based on selectedVessel
  useEffect(() => {
    if (selectedVessel && selectedVessel.vesselName !== "TBA") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        IMONumber: selectedVessel.IMONumber,
        LOA: selectedVessel.LOA,
        GRT: selectedVessel.GRT,
        NRT: selectedVessel.NRT,
      }));
    }
  }, [selectedVessel]); // Runs when selectedVessel changes

  // Effect to update formData when pdaResponse is available
  useEffect(() => {
    if (pdaResponse) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        IMONumber: pdaResponse.IMONumber,
        LOA: pdaResponse.LOA,
        GRT: pdaResponse.GRT,
        NRT: pdaResponse.NRT,
      }));
    }
  }, [pdaResponse]); // Runs when pdaResponse changes

  useEffect(() => {
    console.log(formData, "formData");
  }, [formData]);
  const [open, setOpen] = useState(false);
  const [serviceRequestOpen, setServiceRequestOpen] = useState(false);
  const [quotationOpen, setQuotationOpen] = useState(false);
  const [generatePDAOpen, setGeneratePDAOpen] = useState(false);
  const [remarksOpen, setRemarksOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handlerequestOpen = () => {
    setServiceRequestOpen(true);
  };

  const handlerequestClose = () => {
    setServiceRequestOpen(false);
  };

  const handleQuotationOpen = () => {
    setQuotationOpen(true);
  };

  const handleQuotationClose = () => {
    setQuotationOpen(false);
  };

  const handlePdaOpen = () => {
    setGeneratePDAOpen(true);
  };

  const handlePdaClose = () => {
    setGeneratePDAOpen(false);
  };

  const handleRemarksOpen = () => {
    setRemarksOpen(true);
  };

  const handleRemarksClose = () => {
    setRemarksOpen(false);
  };

  const handleRemarksSubmit = async (remark) => {
    console.log(remark, "handleRemarksSubmit");
    let pdaPayload = {
      pdaId: pdaResponse?._id,
      status: "4",
      rejectedRemark: remark,
    };
    try {
      const response = await changeQuotationStatus(pdaPayload);
      console.log(response, "login_response");
      if (response?.status == true) {
        setPdaResponse(response?.pda);
        if (response?.pda?.pdaStatus == 4) {
          setIsApproved(true);
          setMessage("PDA has been Rejected by FM");
          setOpenPopUp(true);
          setRemarksOpen(false);
        }
      } else {
        setMessage("PDA failed. Please try again");
        setOpenPopUp(true);
        setRemarksOpen(false);
      }
    } catch (error) {
      setMessage("PDA failed. Please try again");
      setOpenPopUp(true);
      setRemarksOpen(false);
    } finally {
    }
  };

  const handleSubmit = (chargesArray, from) => {
    console.log("chargesArray_Submitted: ", chargesArray);
    console.log("handleSubmit_from:", from);
    setFinalChargesArray(chargesArray);
    handleClose();
  };

  const handleEdit = (charges, index) => {
    console.log("edit_charges: ", charges);
    if (charges) {
      if (charges?._id) {
        setIsInitialEdit(false);
      } else {
        setIsInitialEdit(true);
      }

      setIsEditcharge(true);
      setEditCharge(charges);
      setEditIndex(index);
      handleClickOpen();
    }
  };

  useEffect(() => {
    console.log(isInitialEdit, "isInitialEdit");
  }, [isInitialEdit]);

  const openDialog = () => {
    if (!selectedVessel) setSelectedVesselError(true);
    if (!selectedPort) setSelectedPortError(true);
    if (!selectedCustomer?._id) setSelectedCustomerError(true);
    if (!isVessels && !isServices) setTypeOfVesselError(true);
    if (!selectedCargoCapacity) setSelectedCargoCapacityError(true);
    if (!eta) setEtaDateError(true);
    if (!etd) setEtdDateError(true);
    if (!etaHours && !etaMinutes && eta) {
      setError("Please enter valid ETA time");
    }
    if (!etdHours && !etdMinutes && etd) {
      setEtdError("Please enter valid ETD time");
    }

    const newErrors = {
      IMONumber: !formData.IMONumber,
      LOA: !formData.LOA,
      GRT: !formData.GRT,
      NRT: !formData.NRT,
    };

    setErrors(newErrors);

    const hasAnyError = Object.values(newErrors).some((val) => val);
    const isEtaTimeValid = etaHours.trim() !== "" || etaMinutes.trim() !== "";
    const isEtdTimeValid = etdHours.trim() !== "" || etdMinutes.trim() !== "";

    const isValidTimeEntered = isEtaTimeValid && isEtdTimeValid;
    console.log(isEtaTimeValid, "isEtaTimeValid time_check");
    console.log(isEtdTimeValid, "isEtdTimeValid time_check");
    console.log(isValidTimeEntered, "isValidTimeEntered time_check");
    if (
      !hasAnyError &&
      (isVessels || isServices) &&
      selectedVessel &&
      selectedPort &&
      selectedCustomer?._id &&
      selectedCargoCapacity &&
      eta &&
      etd &&
      formData.IMONumber &&
      formData.LOA &&
      formData.GRT &&
      formData.NRT &&
      isValidTimeEntered
    ) {
      setIsEditcharge(false);
      handleClickOpen();
    } else {
      setMessage("Please fill all the required fields");
      setOpenPopUp(true); // <- this now always runs if any condition fails
    }
  };

  useEffect(() => {
    console.log(etaHours, "etaHours time");
    console.log(etaMinutes, "etaMinutes time");
  }, [etaHours, etaMinutes]);

  const handleServiceRequestOpen = () => {
    handlerequestOpen();
  };

  const sendQuotation = () => {
    handleQuotationOpen();
  };

  const submitPda = async (status) => {
    // Step 1: Save previous PDA status before making the API call
    const previousStatus = pdaResponse?.pdaStatus;
    if (!selectedVessel) {
      setSelectedVesselError(true);
    }
    if (!selectedPort) {
      setSelectedPortError(true);
    }
    if (!selectedCustomer?._id) {
      setSelectedCustomerError(true);
    }
    if (!isVessels && !isServices) {
      setTypeOfVesselError(true);
    }
    if (!selectedCargoCapacity) {
      setSelectedCargoCapacityError(true);
    }
    if (!eta) {
      setEtaDateError(true);
    }
    if (!etd) {
      setEtaDateError(true);
    }

    const newErrors = {
      IMONumber: !formData.IMONumber,
      LOA: !formData.LOA,
      GRT: !formData.GRT,
      NRT: !formData.NRT,
    };

    setErrors(newErrors);

    const hasAnyError = Object.values(newErrors).some((val) => val);
    if (hasAnyError) {
      return; // Don't proceed to API call
    }

    if (
      (isVessels || isServices) &&
      selectedVessel &&
      selectedPort &&
      selectedCustomer?._id &&
      selectedCargoCapacity &&
      eta &&
      etd &&
      formData.IMONumber &&
      formData.LOA &&
      formData.GRT &&
      formData.NRT
    ) {
      setStatus(Number(status));
      let pdaPayload = {
        pdaId: pdaResponse?._id ? pdaResponse?._id : null,
        isVessels: isVessels,
        isServices: isServices,
        vesselId: selectedVessel?._id ? selectedVessel?._id : selectedVessel,
        portId: selectedPort?._id ? selectedPort?._id : selectedPort,
        cargoId: selectedCargo?._id ? selectedCargo?._id : selectedCargo,
        vesselTypeId: selectedVesselType?._id
          ? selectedVesselType?._id
          : selectedVesselType,
        customerId: selectedCustomer?._id
          ? selectedCustomer?._id
          : selectedCustomer,
        preparedUserId: loginResponse?.data?._id,
        vesselVoyageNumber: formData?.vesselVoyageNumber,
        IMONumber: Number(formData?.IMONumber),
        LOA: Number(formData?.LOA),
        GRT: Number(formData?.GRT),
        NRT: Number(formData?.NRT),
        ETA: etaTime,
        ETD: etdTime,
        // ETA: eta ? moment(eta).format("YYYY-MM-DD") : "",
        // ETD: etd ? moment(etd).format("YYYY-MM-DD") : "",
        pdaStatus: isCustomerApproved ? 5 : status,
        charges: finalChargesArray,
        anchorageLocation: selectedAnchorageLocation?._id,
        cargoCapacity: selectedCargoCapacity,
      };
      console.log(pdaPayload, "pdaPayload");
      if (!pdaResponse?._id) {
        // alert("pdaResponse is null");
        try {
          const response = await savePda(pdaPayload);
          setFullPdaResponse(response);
          console.log(response, "pda_full_response");
          console.log(response?.pda?.pdaStatus, "pda_status without id");
          if (response?.status == true) {
            setPdaResponse(response?.pda);
            setPdaServicesResponse(response?.pdaServices);
            // updateValues(response);
            fetchPdaDetails(response?.pda?._id);
            if (response?.pda?.pdaStatus == 1) {
              setMessage("PDA has been saved successfully");
              setOpenPopUp(true);
            } else if (response?.pda?.pdaStatus == 2) {
              setMessage("PDA forwarded to the FM for Approval");
              setOpenPopUp(true);
            } else {
              setMessage("PDA has been submitted successfully");
              setOpenPopUp(true);
            }
          } else {
            setMessage("PDA failed. Please try again");
            setOpenPopUp(true);
          }
        } catch (error) {
          setMessage("PDA failed. Please try again");
          setOpenPopUp(true);
        } finally {
        }
      } else if (pdaResponse?._id) {
        // alert("pdaResponse is not null");
        try {
          const response = await editPDA(pdaPayload);
          console.log(response, "editPDA_response");
          console.log(response?.pda?.pdaStatus, "pda_status with id");
          if (response?.status == true) {
            setPdaResponse(response?.pda);
            setPdaServicesResponse(response?.pdaServices);
            // updateValues(response);
            fetchPdaDetails(response?.pda?._id);
            // ✅ Handle success message based on transition
            const newStatus = response?.pda?.pdaStatus;

            if (newStatus === 1) {
              setMessage("PDA has been saved successfully");
            } else if (newStatus === 2) {
              if (previousStatus === 1) {
                setMessage("PDA forwarded to the FM for Approval");
              } else {
                setMessage("PDA has been updated successfully");
              }
            } else if (newStatus === 5) {
              setMessage("Customer approved successfully");
            } else {
              setMessage("PDA has been submitted successfully");
            }

            setOpenPopUp(true);
          } else {
            setMessage("PDA failed. please try again");
            setOpenPopUp(true);
          }
        } catch (error) {
          setMessage("PDA failed. please try again");
          setOpenPopUp(true);
        } finally {
        }
      }
    } else {
      setMessage("Please fill all the required fields");
      setOpenPopUp(true);
    }
  };

  useEffect(() => {
    console.log(moment(eta).format("YYYY-MM-DD"), "eta_value");
  }, [eta]);

  const resubmitPDA = async () => {
    let pdaPayload = {
      pdaId: pdaResponse?._id ? pdaResponse?._id : null,
    };
    console.log(pdaPayload, "pdaPayload_resubmitPDA");
    const response = await resubmitPdaForApproval(pdaPayload);
    if (response?.status) {
      setMessage(
        `The data for the PDA regarding the ${selectedVessel?.vesselName} at ${selectedPort?.portName} has been updated and resubmitted.`
      );
      setOpenPopUp(true);
      setPdaResponse(response?.pda);
      setPdaServicesResponse(response?.pdaServices);
      fetchPdaDetails(response?.pda?._id);
    } else {
      setMessage(`Please try again`);
      setOpenPopUp(true);
    }
  };

  const updateQuotation = async (status) => {
    if (status == "3") {
      let pdaPayload = {
        pdaId: pdaResponse?._id,
        status: status,
      };
      try {
        const response = await changeQuotationStatus(pdaPayload);
        console.log(response, "login_response");
        if (response?.status == true) {
          setPdaResponse(response?.pda);
          if (response?.pda?.pdaStatus == 3) {
            setIsApproved(true);
            setMessage("PDA has been internally approved");
            setOpenPopUp(true);
          } else if (response?.pda?.pdaStatus == 4) {
            handleRemarksOpen();
          }
        } else {
          setMessage("PDA failed. Please try again");
          setOpenPopUp(true);
        }
      } catch (error) {
        setMessage("PDA failed. Please try again");
        setOpenPopUp(true);
      } finally {
      }
    } else if (status == "4") {
      handleRemarksOpen();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      localStorage.setItem("reloadIntent", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const reloadIntent = localStorage.getItem("reloadIntent");
    if (reloadIntent === "true") {
      // alert("fetchPdaDetails");
      fetchPdaDetails(localStorage.getItem("PDA_ID"));
      localStorage.removeItem("reloadIntent");
    }
  }, []);

  useEffect(() => {
    console.log(pdaResponse, "pdaResponse_createPDA");
  }, [pdaResponse]);

  useEffect(() => {
    console.log(pdaServicesResponse, "pdaServicesResponse");
  }, [pdaServicesResponse]);
  useEffect(() => {
    console.log(isCustomerApproved, "isCustomerApproved");
  }, [isCustomerApproved]);

  useEffect(() => {
    console.log(pdaServicesResponse, "pdaServicesResponse");
  }, [pdaServicesResponse]);
  useEffect(() => {
    console.log(status, "status_CERATE");
  }, [status]);

  useEffect(() => {
    console.log(editCharge, "editCharge");
  }, [editCharge]);

  useEffect(() => {
    console.log(finalChargesArray, "finalChargesArray_CREATEPDA");
  }, [finalChargesArray]);

  useEffect(() => {
    console.log(isApproved, "isApproved");
  }, [isApproved]);

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [opsByValue, setOpsByValue] = useState("");
  const [invoiceByValue, setInvoiceByValue] = useState("");

  const fetchPdaDetails = async (id) => {
    localStorage?.setItem("PDA_ID", id);
    let data = {
      pdaId: id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      setOpsByValue(pdaDetails?.opsBy);
      setInvoiceByValue(pdaDetails?.invoiceBy);
      console.log("PDADETAILS", pdaDetails);
      updateValues(pdaDetails);
      setPdaResponse(pdaDetails?.pda);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  const fetchServiceRequest = async (id) => {
    console.log(id, "id_fetchServiceRequest");
    localStorage?.setItem("PDA_ID", id);
    if (id) {
      let data = {
        pdaId: id,
      };
      try {
        const serviceRequests = await showServiceRequest(data);
        setRequestedServices(serviceRequests?.serviceRequests);
        console.log("serviceRequests", serviceRequests?.serviceRequests);
      } catch (error) {
        console.error("Failed to fetch quotations:", error);
      }
    }
  };

  function handleWheel(event) {
    event.target.blur(); // Removes focus from the input to prevent scroll change
  }

  const location = useLocation();

  const row = location.state?.row; // Access the passed row object
  const [editData, setEditData] = useState(null);
  const [fetchInitiated, setFetchInitiated] = useState(false); // State to track fetch initiation

  const [key, setKey] = useState(0);

  const reloadComponent = () => {
    setKey((prevKey) => prevKey + 1); // Increment key to force re-render
  };

  // Initialize `editData` when `row` is available
  useEffect(() => {
    console.log("Row_data:", row);
    setIsCustomerApproved(false);

    if (row) {
      setEditData(row);
    }
  }, [row]);

  useEffect(() => {
    console.log(opsByValue, "opsByValue");
  }, [opsByValue]);

  // Fetch data only once when `editData` changes
  // useEffect(() => {
  //   console.log(editData, "editData");
  //   if (editData && !fetchInitiated) {
  //     setFetchInitiated(true); // Mark fetch as initiated
  //     fetchPdaDetails(editData?._id);
  //   }
  // }, [editData]);
  useEffect(() => {
    console.log(editData, "editData");
    if (editData) {
      // alert("editData");
      fetchPdaDetails(editData?._id);
      fetchServiceRequest(editData?._id);
    }
  }, [editData]);

  const updateValues = (response) => {
    console.log(response, "updateValues");
    console.log(response?.pda?.documents, "response?.pda?.documents");
    setAnchorageLocationID(response?.pda?.anchorageLocation);
    setIsVessels(response?.pda?.isVessels);
    setIsServices(response?.pda?.isServices);

    setSelectedCargoCapacity(response?.pda?.cargoCapacity);
    setUploadedFiles(response?.pda?.documents); // Append new files to existing ones

    if (response?.pda?.pdaStatus == 3 || response?.pda?.pdaStatus == 5) {
      setIsApproved(true);
    }
    console.log(vessels, "vessels_out");

    let selectedVessel;
    if (response?.pda?.vesselId) {
      let vessels_list = localStorage.getItem("vessels_list");
      selectedVessel = JSON.parse(vessels_list).find((vessel) => {
        return vessel._id == response?.pda?.vesselId;
      });
    }
    if (selectedVessel) {
      setSelectedVessel(selectedVessel);
    }

    let selectedPort;
    if (response?.pda?.portId) {
      let ports_list = localStorage.getItem("ports_list");
      selectedPort = JSON.parse(ports_list).find(
        (port) => port._id == response?.pda?.portId
      );
    }
    if (selectedPort) {
      setSelectedPort(selectedPort);
      fetchAnchorageValues(selectedPort);
    }

    let selectedCargo;
    if (response?.pda?.cargoId) {
      let cargos_list = localStorage.getItem("cargos_list");
      selectedCargo = JSON.parse(cargos_list).find(
        (cargo) => cargo._id === response?.pda?.cargoId
      );
    }

    if (selectedCargo) {
      setSelectedCargo(selectedCargo);
    }

    let selectedCustomer;
    if (response?.pda?.customerId) {
      let customers_list = localStorage.getItem("customers_list");
      selectedCustomer = JSON.parse(customers_list).find(
        (customer) => customer._id === response?.pda?.customerId
      );
    }

    if (selectedCustomer) {
      setSelectedCustomer(selectedCustomer);
    }

    let selectedVeselTypeID;
    if (response?.pda?.vesselTypeId) {
      let vessel_types_list = localStorage.getItem("vessel_types_list");
      selectedVeselTypeID = JSON.parse(vessel_types_list).find(
        (vesselType) => vesselType._id === response?.pda?.vesselTypeId
      );
    }

    if (selectedVeselTypeID) {
      setSelectedVesselType(selectedVeselTypeID);
    }

    const moment = require("moment");

    // if (response?.pda?.ETA) {
    //   const date = moment.utc(response.pda.ETA);
    //   setEta(date.isValid() ? date.format("YYYY-MM-DD HH:mm") : "");
    // } else {
    //   setEta(""); // Set to empty string if ETA is null
    // }

    // // Parse ETD
    // if (response?.pda?.ETD) {
    //   const etdDate = moment.utc(response.pda.ETD);
    //   setEtd(etdDate.isValid() ? etdDate.format("YYYY-MM-DD HH:mm") : "");
    // } else {
    //   setEtd(""); // Set to empty string if ETD is null
    // }

    // Assuming this is inside your API response handling block
    if (response?.pda?.ETA) {
      const etaMoment = moment.utc(response.pda.ETA);
      const date = moment.utc(response.pda.ETA);
      setEta(date.isValid() ? date.format("YYYY-MM-DD") : "");
      if (etaMoment.isValid()) {
        const formattedEta = etaMoment.format("YYYY-MM-DD HH:mm");
        const hours = etaMoment.format("HH");
        const minutes = etaMoment.format("mm");

        setEtaTime(formattedEta);
        setEtaHours(hours);
        setEtaMinutes(minutes);
      } else {
        setEtaTime("");
        setEtaHours("");
        setEtaMinutes("");
      }
    } else {
      setEtaTime("");
      setEtaHours("");
      setEtaMinutes("");
    }

    if (response?.pda?.ETD) {
      const etdMoment = moment.utc(response.pda.ETD);
      const etdDate = moment.utc(response.pda.ETD);
      setEtd(etdDate.isValid() ? etdDate.format("YYYY-MM-DD") : "");
      if (etdMoment.isValid()) {
        const formattedEtd = etdMoment.format("YYYY-MM-DD HH:mm");
        const hours = etdMoment.format("HH");
        const minutes = etdMoment.format("mm");

        setEtdTime(formattedEtd);
        setEtdHours(hours);
        setEtdMinutes(minutes);
      } else {
        setEtdTime("");
        setEtdHours("");
        setEtdMinutes("");
      }
    } else {
      setEtdTime("");
      setEtdHours("");
      setEtdMinutes("");
    }

    // const moment = require("moment");
    // const date = moment.utc(response?.pda?.ETA);
    // console.log(response?.pda?.ETA, "response?.pda?.ETA");
    // console.log(date.format("YYYY-MM-DD HH:mm"), "Checkdate");
    // setEta(date.format("YYYY-MM-DD HH:mm"));

    // const etd_date = moment.utc(response?.pda?.ETD);
    // console.log(etd_date.format("YYYY-MM-DD HH:mm"), "Checkdate");
    // setEtd(etd_date.format("YYYY-MM-DD HH:mm"));

    setStatus(response?.pda?.pdaStatus);
    setFinalChargesArray(response?.pdaServices);
    setFormData({
      vesselVoyageNumber: response?.pda?.vesselVoyageNumber,
      IMONumber: response?.pda?.IMONumber,
      LOA: response?.pda?.LOA,
      GRT: response?.pda?.GRT,
      NRT: response?.pda?.NRT,
    });
  };

  const fetchAnchorageValues = async (data) => {
    console.log(data, "id_fetchAnchorageValues");
    try {
      const formdata = {
        portId: data?._id,
      };
      const response = await getAnchorageLocations(formdata);
      console.log(response, "response_fetchAnchorageValues");
      if (response.status) {
        setAnchorageLocations(response?.area);
        localStorage.setItem(
          "anchorage_locations_list",
          JSON.stringify(response.area)
        );
      }
    } catch (error) {
      console.error("Error fetching anchorage values:", error);
    }
  };

  useEffect(() => {
    console.log(anchorageLocationID, "anchorageLocationID");

    if (anchorageLocationID && anchorageLocations) {
      setAnchorageValue(anchorageLocationID);
    }
  }, [anchorageLocationID, anchorageLocations]); // Runs when anchorageLocationID changes

  const setAnchorageValue = (id) => {
    console.log(id, "setAnchorageValue_id");
    if (!id) return; // Ensure id is valid before proceeding

    if (anchorageLocations) {
      let selected_anchorage_location = anchorageLocations.find(
        (location) => location._id === id
      );
      console.log(
        selected_anchorage_location,
        "selected_anchorage_location setAnchorageValue"
      );

      if (selected_anchorage_location) {
        setSelectedAnchorageLocation(selected_anchorage_location);
      }
    }
  };

  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const SendInvoiceOpen = () => {
    setInvoiceOpen(true);
  };
  const handleInvoiceClose = () => {
    setInvoiceOpen(false);
  };

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceDocumentsDialogOpen, setInvoiceDocumentsDialogOpen] =
    useState(false);

  const openInvoicePage = () => {
    setInvoiceDialogOpen(true);
  };
  const closeInvoicePage = () => {
    setInvoiceDialogOpen(false);
  };
  const invoiceSubmit = (data) => {
    console.log(data, "datainvoiceSubmit");
    setInvoiceDialogOpen(false);
    fetchPdaDetails(localStorage.getItem("PDA_ID"));
  };

  const openInvoiceDocumentsPage = () => {
    setInvoiceDocumentsDialogOpen(true);
  };
  const closeInvoiceDocumentsPage = () => {
    setInvoiceDocumentsDialogOpen(false);
    fetchPdaDetails(localStorage.getItem("PDA_ID"));
  };
  const invoiceDocumentsSubmit = (data) => {
    console.log(data, "datainvoiceSubmit");
    setInvoiceDocumentsDialogOpen(false);
    fetchPdaDetails(localStorage.getItem("PDA_ID"));
  };

  const validateAndSetTime = (rawHours, rawMinutes, type) => {
    const hours = rawHours === "" ? "00" : rawHours;
    const minutes = rawMinutes === "" ? "00" : rawMinutes;

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    // Validation logic
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      setError("Please enter a valid time");
      setEtaTime("");
      return;
    }

    // ❌ Check for 00:00 (invalid as per client)
    if (h === 0 && m === 0) {
      setError("Please enter a valid time.");
      setEtaTime("");
      return;
    }

    setError("");

    const formattedTime = `${moment(eta).format("YYYY-MM-DD")} ${String(
      h
    ).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setEtaTime(formattedTime);
  };

  const handleEtaHoursChange = (e) => {
    const value = e.target.value;
    console.log(value, "value_handleEtaHoursChange");
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setEtaHours(value);
      validateAndSetTime(value, etaMinutes);
    }
  };

  useEffect(() => {
    console.log(etaHours, "etaHours");
  }, [etaHours]);

  const handleEtaMinutesChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setEtaMinutes(value);
      validateAndSetTime(etaHours, value);
    }
  };

  useEffect(() => {
    console.log(etaTime, "etaTime:"); // final formatted time
  }, [etaTime]);

  const validateETDAndSetTime = (rawHours, rawMinutes, type) => {
    const hours = rawHours === "" ? "00" : rawHours;
    const minutes = rawMinutes === "" ? "00" : rawMinutes;

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    // Validation logic
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      setEtdError("Please enter a valid time");
      setEtdTime("");
      return;
    }

    setEtdError("");

    const formattedTime = `${moment(etd).format("YYYY-MM-DD")} ${String(
      h
    ).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setEtdTime(formattedTime);
  };

  const handleEtdHoursChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setEtdHours(value);
      validateETDAndSetTime(value, etdMinutes, "hours");
    }
  };

  const handleEtdMinutesChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setEtdMinutes(value);
      validateETDAndSetTime(etdHours, value, "minutes");
    }
  };

  useEffect(() => {
    console.log(etdTime, "etdTime:"); // final formatted time
  }, [etdTime]);

  const [mailPopupOpen, setMailPopupOpen] = useState(false);

  const sendCreditNoteMail = () => {
    handleMailOpen();
  };

  const handleMailOpen = () => {
    setMailPopupOpen(true);
  };

  const handleMailClose = () => {
    setMailPopupOpen(false);
  };

  const handleMailSubmit = (chargesArray, from) => {
    handleQuotationClose();
  };

  return (
    <>
      <div className="pdacontent">
        <div className=" pda-no ">
          {pdaResponse && (
            <>
              <div className=" pdarow ">
                <div className="pdanumber ">
                  <span> PDA No:</span>
                  <span className="fw-bolder pdafontweight">
                    {pdaResponse?.pdaNumber}
                  </span>
                </div>
                <div className="d-flex justify-content-start back">
                  <div className="pdadate">
                    <label
                      htmlFor="inputPassword"
                      className="col-sm-4  col-form-label text-nowrap"
                    >
                      PDA Date:
                    </label>
                    <div className="col-sm-4">
                      <div className="fw-bolder pdafontweight pda-date">
                        {pdaResponse?.createdAt
                          ? formatDate(pdaResponse.createdAt)
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="draft-pda ">
                  {pdaResponse?.pdaStatus == 1 && (
                    <>
                      <span className="badge statusbadge ">
                        <i className="bi bi-book-fill book"></i>
                      </span>{" "}
                    </>
                  )}
                  {pdaResponse?.pdaStatus != 1 && (
                    <>
                      <span className="badge statusbadge ">
                        <i className="bi bi-check2-circle circle"></i>{" "}
                      </span>{" "}
                    </>
                  )}

                  <div className="pdabadge">
                    {pdaResponse?.pdaStatus == 1
                      ? "Draft PDA"
                      : pdaResponse?.pdaStatus == 2
                      ? "Waiting For Approval From FM"
                      : pdaResponse?.pdaStatus == 3
                      ? "Internally Approved"
                      : pdaResponse?.pdaStatus == 4
                      ? "Rejected By FM"
                      : pdaResponse?.pdaStatus == 5
                      ? "Customer Approved"
                      : pdaResponse?.pdaStatus == 6
                      ? "Pending From Operations"
                      : pdaResponse?.pdaStatus == 7
                      ? "Operations Completed"
                      : pdaResponse?.pdaStatus == 8
                      ? "Closed"
                      : ""}
                  </div>
                </div>

                {pdaResponse?.pdaStatus == 3 && (
                  <>
                    <div className="capproved ">
                      <input
                        type="checkbox"
                        name="payment"
                        id="customerapproved"
                        checked={isCustomerApproved}
                        onChange={handleCustomerApproved}
                        className=""
                      />
                      <label htmlFor="customerapproved" className="customerbox">
                        Customer Approved
                      </label>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <div className="charge">
            <div className="rectangle"></div>
            <div>
              <img
                src={
                  location.pathname.includes("/create-pda") &&
                  location.state &&
                  location.state.row
                    ? updatePdaImage
                    : createPdaImage
                }
                alt="PDA Image"
              />
            </div>
          </div>
          <div className="typesofcall-row ">
            <div className="row align-items-start">
              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Types of Call <span className="required"> * </span>
                  </label>
                  <div className="radio gap-3">
                    <div>
                      <input
                        type="checkbox"
                        name="payment"
                        id="vessels"
                        checked={isVessels}
                        onChange={handleVesselsChange}
                        className="vesselradio form-check-input"
                      />
                      <label htmlFor="vessels" className="vessel">
                        Vessels
                      </label>

                      <input
                        type="checkbox"
                        name="payment"
                        id="services"
                        checked={isServices}
                        onChange={handleServicesChange}
                        className="vesselradio form-check-input"
                      />
                      <label htmlFor="services" className="service">
                        Services
                      </label>
                    </div>
                  </div>
                  {typeOfVesselError && (
                    <>
                      <div className="invalid">Please select type of call</div>
                    </>
                  )}
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-12">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Vessel Name<span className="required"> * </span> :
                </label>
                <div className="vessel-select">
                  <select
                    name="vessel"
                    className="form-select vesselbox vboxholder .custom-select"
                    onChange={handleSelectChange}
                    aria-label="Default select example"
                    value={selectedVessel?._id}
                  >
                    <option disabled selected value="">
                      Choose Vessel name
                    </option>
                    {vessels.map((vessel) => (
                      <option key={vessel._id} value={vessel._id}>
                        {vessel.vesselName}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedVesselError && (
                  <>
                    <div className="invalid">Please select vessel</div>
                  </>
                )}
              </div>
              <div className="col-lg-4 col-md-6 col-sm-12">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Port Name<span className="required"> * </span> :
                </label>
                <div className="vessel-select">
                  <select
                    name="port"
                    className="form-select vesselbox vboxholder"
                    onChange={handleSelectChange}
                    aria-label="Default select example"
                    value={selectedPort?._id}
                  >
                    <option value="">Choose Port name</option>
                    {ports.map((port) => (
                      <option key={port._id} value={port._id}>
                        {port.portName}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedPortError && (
                  <>
                    <div className="invalid">Please select port</div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="choosecargo-row ">
            <div className="row align-items-start">
              <div className="col-lg-3 col-md-6 col-sm-12">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Cargo
                  </label>
                  <div className="vessel-select">
                    <select
                      name="cargo"
                      className="form-select vesselbox vboxholder"
                      onChange={handleSelectChange}
                      aria-label="Default select example"
                      value={selectedCargo?._id}
                    >
                      <option value="">Choose Cargo name</option>
                      {cargos.map((cargo) => (
                        <option key={cargo._id} value={cargo._id}>
                          {cargo.cargoName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Type of Vessel:
                </label>
                <div className="vessel-select">
                  <select
                    name="vesselType"
                    className="form-select vesselbox vboxholder"
                    onChange={handleSelectChange}
                    aria-label="Default select example"
                    value={selectedVesselType?._id}
                  >
                    <option value="">Choose Type of Vessel</option>
                    {vesselTypes.map((vessel) => (
                      <option key={vessel._id} value={vessel._id}>
                        {vessel.vesselType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Vessel Voyage No:
                </label>
                <input
                  name="vesselVoyageNumber"
                  type="text"
                  className="form-control vessel-voyage"
                  id="exampleFormControlInput1"
                  placeholder=" "
                  value={formData.vesselVoyageNumber}
                  onChange={handleInputChange}
                  onWheel={handleWheel}
                />
              </div>
              <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Anchorage Location:
                </label>
                <div className="vessel-select">
                  <select
                    name="anchorageLocation"
                    className="form-select vesselbox vboxholder"
                    onChange={handleSelectChange}
                    aria-label="Default select example"
                    value={selectedAnchorageLocation?._id}
                  >
                    <option value="">Choose Anchorage Location</option>
                    {anchorageLocations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="thirdrow mb-3 row">
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="row">
                <div className="col-6">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    IMO No:<span className="required"> * </span>
                  </label>
                  <input
                    type="number"
                    name="IMONumber"
                    value={formData.IMONumber}
                    onChange={handleInputChange}
                    className="form-control vessel-voyage voyageblock"
                    id="exampleFormControlInput1"
                    placeholder=" "
                    // readOnly={selectedVessel?.vesselName !== "TBA"} // Use readOnly instead of disabled
                    onWheel={handleWheel}
                  />

                  {errors.IMONumber && (
                    <>
                      <div className="invalid">IMO Number is required</div>
                    </>
                  )}
                </div>
                <div className="col-6 voyage ">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    LOA:<span className="required"> * </span>
                  </label>
                  <input
                    type="number"
                    name="LOA"
                    value={formData.LOA}
                    onChange={handleInputChange}
                    className="form-control vessel-voyage voyageblock"
                    id="exampleFormControlInput1"
                    placeholder=" "
                    // readOnly={selectedVessel?.vesselName !== "TBA"} // Use readOnly instead of disabled
                    onWheel={handleWheel}
                  />
                  {errors.LOA && (
                    <>
                      <div className="invalid">LOA is required</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="row mb-3">
                <div className="col-6 grt">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    GRT:<span className="required"> * </span>
                  </label>
                  <input
                    type="number"
                    name="GRT"
                    value={formData.GRT}
                    onChange={handleInputChange}
                    className="form-control vessel-voyage voyageblock"
                    id="exampleFormControlInput1"
                    placeholder=" "
                    // readOnly={selectedVessel?.vesselName !== "TBA"} // Use readOnly instead of disabled
                    onWheel={handleWheel}
                  />
                  {errors.GRT && (
                    <>
                      <div className="invalid">GRT is required</div>
                    </>
                  )}
                </div>
                <div className="col-6 nrt ">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    NRT:<span className="required"> * </span>
                  </label>
                  <input
                    type="number"
                    name="NRT"
                    value={formData.NRT}
                    onChange={handleInputChange}
                    className="form-control vessel-voyage voyageblock"
                    id="exampleFormControlInput1"
                    placeholder=""
                    // readOnly={selectedVessel?.vesselName !== "TBA"} // Use readOnly instead of disabled
                    onWheel={handleWheel}
                  />
                  {errors.NRT && (
                    <>
                      <div className="invalid">NRT is required</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Customer Name:<span className="required"> * </span>
              </label>
              <div className="vessel-select">
                <select
                  name="customer"
                  className="form-select vesselbox vboxholder"
                  onChange={handleSelectChange}
                  aria-label="Default select example"
                  value={selectedCustomer?._id}
                >
                  <option value="">Choose Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.customerName}
                    </option>
                  ))}
                </select>
                {selectedCustomerError && (
                  <>
                    <div className="invalid">Please select customer</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="imo">
            <div className="row align-items-start">
              <div className="col-lg-2 col-md-6 col-sm-12 mb-3">
                <div className="d-flex">
                  <div>
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      ETA:<span className="required"> * </span>
                    </label>
                    <div>
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={eta ? new Date(eta) : null} // Inline date conversion for prefilled value
                        onChange={handleEtaChange}
                        className="form-control date-input-small"
                        id="eta-picker"
                        placeholderText="Select ETA"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      Time:<span className="required"> * </span>
                    </label>
                    <div className="d-flex">
                      <input
                        type="text"
                        name="etaHours"
                        className="form-control vessel-voyage voyageblock timespace"
                        id="etaHours"
                        placeholder="00"
                        value={etaHours}
                        onChange={handleEtaHoursChange}
                      />
                      <input
                        type="text"
                        name="etaMinutes"
                        className="form-control vessel-voyage voyageblock timespace"
                        id="etaMinutes"
                        placeholder="00"
                        value={etaMinutes}
                        onChange={handleEtaMinutesChange}
                      />
                    </div>
                  </div>
                </div>
                {error && (
                  <div
                    style={{ color: "red", marginTop: "5px", fontSize: "10px" }}
                  >
                    {error}
                  </div>
                )}

                {etaDateError && (
                  <>
                    <div className="invalid">Please select ETA</div>
                  </>
                )}
              </div>

              <div className="col-lg-2 col-md-6 col-sm-12 mb-3 ">
                <div className="d-flex">
                  <div>
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      ETD:<span className="required"> * </span>
                    </label>
                    <div>
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        // selected={etd && new Date(etd)} // Inline date conversion for prefilled value
                        selected={etd ? new Date(etd) : null} // Inline date conversion for prefilled value
                        onChange={handleEtdChange}
                        className="form-control  date-input-small"
                        id="etd-picker"
                        placeholderText="Select ETD"
                        autoComplete="off"
                        minDate={eta ? new Date(eta) : null} // ETD must be after ETA
                        disabled={!eta} // Disable until ETA is selected
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      Time:<span className="required"> * </span>
                    </label>
                    <div className="d-flex">
                      <input
                        type="text"
                        name="etdHours"
                        className="form-control vessel-voyage voyageblock timespace"
                        id="etdHours"
                        placeholder="00"
                        value={etdHours}
                        onChange={handleEtdHoursChange}
                      />
                      <input
                        type="text"
                        name="etdMinutes"
                        className="form-control vessel-voyage voyageblock timespace"
                        id="etdMinutes"
                        placeholder="00"
                        value={etdMinutes}
                        onChange={handleEtdMinutesChange}
                      />
                    </div>
                  </div>
                </div>

                {etdError && (
                  <div
                    style={{ color: "red", marginTop: "5px", fontSize: "10px" }}
                  >
                    {etdError}
                  </div>
                )}

                {etdDateError && (
                  <>
                    <div className="invalid">Please select ETD</div>
                  </>
                )}
              </div>

              <div className="col-lg-2 col-md-6 col-sm-12 nrt mb-3">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Cargo Capacity:<span className="required"> * </span>
                </label>
                <input
                  type="text"
                  name="cargoCapacity"
                  className="form-control vessel-voyage voyageblock"
                  id="exampleFormControlInput1"
                  placeholder=""
                  value={selectedCargoCapacity}
                  onChange={handleInputChange}
                />
                {selectedCargoCapacityError && (
                  <>
                    <div className="invalid">Please select cargo capacity</div>
                  </>
                )}
              </div>

              {opsByValue && (
                <>
                  <div className="col-lg-2 col-md-6 col-sm-12 nrt ">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      OPS By:
                    </label>
                    <input
                      type="text"
                      name=""
                      className="form-control vessel-voyage voyageblock "
                      id="exampleFormControlInput1"
                      placeholder=""
                      value={opsByValue}
                      readOnly
                    />
                  </div>
                </>
              )}
              {invoiceByValue && (
                <>
                  <div className="col-lg-2 col-md-6 col-sm-12 nrt ">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      Invoice By:
                    </label>
                    <input
                      type="text"
                      name=""
                      className="form-control vessel-voyage voyageblock invoice"
                      id="exampleFormControlInput1"
                      placeholder=""
                      value={invoiceByValue}
                      readOnly
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="row align-items-start d-flex justify-content-end">
            <>
              {requestedServices.length > 0 && (
                <>
                  <div className="col-2">
                    <button
                      type="button"
                      className="btn addcharge-button text-center"
                      onClick={() => {
                        handleServiceRequestOpen();
                      }}
                    >
                      Service Request
                    </button>
                  </div>
                </>
              )}
            </>

            <div className="col-lg-2 col-md-6 col-sm-12">
              <button
                type="button"
                className="btn addcharge-button text-center"
                onClick={() => {
                  openDialog();
                }}
              >
                Add charge
              </button>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-12">
              {uploadedFiles && uploadedFiles?.length > 0 && (
                <>
                  <div className="templatelink">Documents:</div>
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
          </div>

          <div className="charges-table">
            <div className="row mt-2">
              <div className="col-lg-12">
                <ChargesTable
                  chargesArray={finalChargesArray}
                  services={services}
                  customers={customers}
                  onSubmit={handleSubmit}
                  ports={ports}
                  onEdit={handleEdit}
                  pdaResponse={pdaResponse}
                  isAction={true}
                  from={"create-pda"}
                  fullPdaResponse={fullPdaResponse}
                  vendors={vendors}
                />
              </div>
            </div>
          </div>

          {finalChargesArray?.length > 0 && (
            <>
              <React.Fragment>
                <div className="buttons-wrapper">
                  <div className="left">
                    {pdaResponse?.pdaStatus >= 2 && (
                      <>
                        <button
                          className="btn btna generate-button"
                          onClick={() => {
                            handlePdaOpen();
                          }}
                        >
                          Generate PDA
                        </button>
                      </>
                    )}

                    {(pdaResponse === null ||
                      pdaResponse === undefined ||
                      pdaResponse?.pdaStatus <= 1) && (
                      <button
                        className="btn btna generate-button"
                        onClick={() => {
                          submitPda(1);
                        }}
                      >
                        {pdaResponse === null || pdaResponse === undefined
                          ? " Save As Draft"
                          : "Edit Draft"}
                      </button>
                    )}
                  </div>

                  <div className="right d-flex">
                    {pdaResponse?.invoiceStatus === 3 &&
                      pdaResponse?.pdaStatus == 7 && (
                        <>
                          <button
                            className="btn btna submit-button"
                            onClick={() => {
                              openInvoiceDocumentsPage();
                            }}
                          >
                            Upload Invoice Documents
                          </button>
                        </>
                      )}
                    {pdaResponse?.pdaStatus == 7 && (
                      <>
                        <button
                          type="button"
                          className="btn btna submit-button "
                          onClick={() => {
                            sendCreditNoteMail();
                          }}
                        >
                          Send Credit Note
                        </button>
                        <button
                          className="btn btna submit-button"
                          onClick={() => {
                            openInvoicePage();
                          }}
                        >
                          Accept Job Report
                        </button>
                        <button
                          className="btn btna submit-button"
                          onClick={() => {
                            SendInvoiceOpen();
                          }}
                          disabled={pdaResponse?.invoiceStatus != 3}
                        >
                          Send Invoice
                        </button>
                      </>
                    )}

                    {pdaResponse?.pdaStatus != 7 && (
                      <>
                        {pdaResponse?.pdaStatus >= 3 && isApproved == true && (
                          <>
                            <button
                              className="btn btna submit-button"
                              onClick={() => {
                                sendQuotation();
                              }}
                            >
                              Send Quotation
                            </button>
                          </>
                        )}

                        <button
                          className="btn btna submit-button"
                          onClick={() => {
                            const newStatus =
                              !pdaResponse || pdaResponse?.pdaStatus === 1
                                ? 2
                                : 0;
                            submitPda(newStatus);
                          }}
                        >
                          {!pdaResponse || pdaResponse?.pdaStatus === 1
                            ? "Submit"
                            : "Save"}
                        </button>

                        {loginResponse?.data?.userRole?.role?.designationType?.toLowerCase() !==
                          "financemanager" && (
                          <>
                            {pdaResponse?.pdaStatus === 4 && (
                              <>
                                <button
                                  className="btn btna submit-button"
                                  onClick={() => {
                                    resubmitPDA();
                                  }}
                                >
                                  Resubmit for FM Approval
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {(loginResponse?.data?.userRole?.role?.designationType?.toLowerCase() ===
                          "financemanager" ||
                          loginResponse?.data?.userRole?.role?.designationType?.toLowerCase() ===
                            "operationsmanager" ||
                          loginResponse?.data?.userRole?.role?.designationType?.toLowerCase() ===
                            "financehead") && (
                          <>
                            {(pdaResponse?.pdaStatus == 2 ||
                              pdaResponse?.pdaStatus == 4) && (
                              <>
                                <button
                                  className="btn btna generate-button"
                                  onClick={() => {
                                    updateQuotation("3");
                                  }}
                                >
                                  Approve
                                </button>
                              </>
                            )}
                            {pdaResponse?.pdaStatus == 2 && (
                              <>
                                <button
                                  className="btn btna generate-button"
                                  onClick={() => {
                                    updateQuotation("4");
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </React.Fragment>
            </>
          )}
        </div>
      </div>

      <ResponsiveDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        selectedVessel={selectedVessel}
        selectedPort={selectedPort}
        selectedCargo={selectedCargo}
        selectedVesselType={selectedVesselType}
        selectedCustomer={selectedCustomer}
        eta={eta}
        etd={etd}
        status={status}
        formData={formData}
        services={services}
        customers={customers}
        ports={ports}
        isEditcharge={isEditcharge}
        editCharge={editCharge}
        editIndex={editIndex}
        pdaResponse={pdaResponse}
        finalChargesArray={finalChargesArray}
        fullPdaResponse={fullPdaResponse}
        vendors={vendors}
        isInitialEdit={isInitialEdit}
      />

      <QuotationDialog
        open={quotationOpen}
        onClose={handleQuotationClose}
        onSubmit={handleSubmit}
        selectedVessel={selectedVessel}
        selectedPort={selectedPort}
        selectedCargo={selectedCargo}
        selectedVesselType={selectedVesselType}
        selectedCustomer={selectedCustomer}
        eta={eta}
        etd={etd}
        status={status}
        formData={formData}
        services={services}
        customers={customers}
        ports={ports}
        isEditcharge={isEditcharge}
        editCharge={editCharge}
        editIndex={editIndex}
        pdaResponse={pdaResponse}
      />

      <Remarks
        open={remarksOpen}
        onClose={handleRemarksClose}
        onRemarksSubmit={handleRemarksSubmit}
        isReadOnly={false}
      />
      <PdaDialog
        open={generatePDAOpen}
        onClose={handlePdaClose}
        onSubmit={handleSubmit}
        selectedVessel={selectedVessel}
        selectedPort={selectedPort}
        selectedCargo={selectedCargo}
        selectedVesselType={selectedVesselType}
        selectedCustomer={selectedCustomer}
        eta={eta}
        etd={etd}
        status={status}
        formData={formData}
        services={services}
        customers={customers}
        cargos={cargos}
        ports={ports}
        vendors={vendors}
        vessels={vessels}
        isEditcharge={isEditcharge}
        editCharge={editCharge}
        editIndex={editIndex}
        pdaResponse={pdaResponse}
      />

      <SendInvoice
        open={invoiceOpen}
        onClose={handleInvoiceClose}
        selectedPdaData={pdaResponse}
      />
      <InvoicePage
        open={invoiceDialogOpen}
        onClose={closeInvoicePage}
        onSubmit={invoiceSubmit}
        selectedPdaData={pdaResponse}
        pdaResponse={pdaResponse}
      />

      <InvoiceDocuments
        open={invoiceDocumentsDialogOpen}
        onClose={closeInvoiceDocumentsPage}
        onSubmit={invoiceDocumentsSubmit}
        selectedPdaData={pdaResponse}
        pdaResponse={pdaResponse}
      />

      <Servicerequests
        open={serviceRequestOpen}
        onClose={handlerequestClose}
        pdaResponse={pdaResponse}
        services={services}
      />

      <CreditNoteMail
        open={mailPopupOpen}
        onClose={handleMailClose}
        onSubmit={handleMailSubmit}
        selectedVessel={selectedVessel}
        selectedPort={selectedPort}
        selectedCargo={selectedCargo}
        selectedVesselType={selectedVesselType}
        selectedCustomer={selectedCustomer}
        eta={eta}
        etd={etd}
        status={status}
        formData={formData}
        services={services}
        customers={customers}
        ports={ports}
        isEditcharge={isEditcharge}
        editCharge={editCharge}
        editIndex={editIndex}
        pdaResponse={pdaResponse}
        selectedPdaData={pdaResponse}
      />

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default CreatePDA;
