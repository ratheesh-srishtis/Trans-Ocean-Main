import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import "../css/addcharges.css";
import "../css/editcharges.css";
import {
  getSubcharges,
  getCharges,
  editChargeQuotation,
  addPDACharges,
  getPdaDetails,
} from "../services/apiService";
import PopUp from "./PopUp";
import { saveAs } from "file-saver";
import CreditNoteMail from "./CreditNoteMail";
const ResponsiveDialog = ({
  open,
  onClose,
  onSubmit,
  selectedVessel,
  selectedPort,
  selectedCargo,
  selectedVesselType,
  selectedCustomer,
  eta,
  etd,
  isInitialEdit,
  status,
  formData,
  services,
  customers,
  ports,
  isEditcharge,
  editCharge,
  editIndex,
  pdaResponse,
  finalChargesArray,
  fullPdaResponse,
  vendors,
}) => {
  console.log(services, "services");
  console.log(pdaResponse, "pdaResponse_responsiveDialog");
  console.log(selectedCustomer, "selectedCustomer pdaResponse_dialog");

  useEffect(() => {
    console.log(customers, "customers");
  }, [customers]);

  const [templatesList, setTemplatesList] = useState([]);
  const [isUserInput, setIsUserInput] = useState(false);
  const [isVendorUserInput, setIsVendorUserInput] = useState(false);
  const [selectedServiceError, setSelectedServiceError] = useState(false);
  const [selectedChargesTypeError, setSelectedChargesTypeError] =
    useState(false);
  const [selectedSubhargesTypeError, setSelectedSubhargesTypeError] =
    useState(false);
  const [selectedQuantityError, setSelectedQuantityError] = useState(false);
  const [selectedNewCustomerError, setSelectedNewCustomerError] =
    useState(false);
  const [customerAmountError, setCustomerAmountError] = useState(false);
  const [customerTotalUSDError, setCustomerTotalUSDError] = useState(false);
  const [customerVatAmountError, setCustomerVatAmountError] = useState(false);
  const [selectedVendorError, setSelectedVendorError] = useState(false);
  const [customerTotalOmrError, setCustomerTotalOmrError] = useState(null);
  const [originalCustomerAmount, setOriginalCustomerAmount] = useState(null); // initial amount
  const [firstFieldSelected, setFirstFieldSelected] = useState(false);
  const [secondFieldSelected, setSecondFieldSelected] = useState(false);
  const [thirdFieldSelected, setThirdFieldSelected] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedChargesType, setSelectedChargesType] = useState(null);
  const [selectedSubhargesType, setSelectedSubhargesType] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedNewCustomer, setSelectedNewCustomer] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);
  const [customerAmount, setCustomerAmount] = useState(null);
  const [customerVatAmount, setCustomerVatAmount] = useState(null);
  const [customerOmrAmount, setCustomerOmrAmount] = useState(null);
  const [customerTotalUSD, setCustomerTotalUSD] = useState(null);
  const [vendorAmount, setVendorAmount] = useState(null);
  const [vendorVatAmount, setVendorVatAmount] = useState(null);
  const [vendorOmrAmount, setVendorOmrAmount] = useState(null);
  const [customerTotalOmr, setCustomerTotalOmr] = useState(null);
  const [vendorTotalOmr, setVendorTotalOmr] = useState(null);
  const [remarks, setRemarks] = useState(null);
  const [creditNote, setCreditNote] = useState(null);
  const [charges, setCharges] = useState([]);
  const [subCharges, setSubCharges] = useState([]);
  const [isPrivateVendor, setIsPrivateVendor] = useState(false);
  const [chargesArray, setChargesArray] = useState([]);
  const [savedChargesArray, setSavedChargesArray] = useState([]);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [updatedServiceName, setUpdatedServiceName] = useState("");
  const [updatedChargename, setUpdatedChargename] = useState("");
  const [updatedSubChargeName, setUpdatedSubChargeName] = useState("");

  // Vendor OMR error state for each vendor section
  const [vendorOmrErrors, setVendorOmrErrors] = useState([]);

  const handleCheckboxChange = (e) => {
    setIsPrivateVendor(e.target.checked);
  };

  const handleFirstFieldChange = (e) => {
    setFirstFieldSelected(true);
  };

  const handleSecondFieldChange = (e) => {
    setSecondFieldSelected(true);
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    console.log(value, "value");
    switch (name) {
      case "service":
        setSelectedService(services.find((service) => service?._id === value));
        setFirstFieldSelected(true);
        setSelectedServiceError(false);
        setCharges([]);
        setSubCharges([]);
        setSelectedChargesType(null);
        const selected = services.find((service) => service?._id === value);
        setSelectedServiceName(selected?.serviceName);
        break;
      case "chargeType":
        setSelectedChargesType(charges.find((charge) => charge?._id === value));
        setSecondFieldSelected(true);
        setSelectedChargesTypeError(false);
        setSubCharges([]);
        const selectedCharge = charges.find((charge) => charge?._id === value);
        setSelectedChargesTypeName(selectedCharge?.chargeName);
        break;
      case "subChargeType":
        setSelectedSubhargesType(
          subCharges.find((subCharge) => subCharge?._id === value)
        );
        setThirdFieldSelected(true);
        setSelectedSubhargesTypeError(false);
        const selectedSubCharge = charges.find(
          (charge) => charge?._id === value
        );
        setSelectedSubhargesTypeName(selectedSubCharge?.subchargeName);

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
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const response = await getCharges({
          serviceId: selectedService?.serviceId || selectedService?._id,
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
      // alert(selectedService?._id);
      try {
        const response = await getSubcharges({
          chargeId: selectedChargesType?.chargeId || selectedChargesType?._id,
        });
        setSubCharges(response?.subcharges);
        console.log("fetchSubCharges:", response);
      } catch (error) {
        console.error("Error fetching PDA values:", error);
      }
    };
    if (selectedChargesType) {
      fetchSubCharges();
      console.log(selectedChargesType, "selectedChargesType");
    }
  }, [selectedChargesType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      setSelectedQuantity(value);
      setSelectedQuantityError(false);
    } else if (name === "customerAmount") {
      setCustomerAmount(value);
      setOriginalCustomerAmount(value);
      setCustomerAmountError(false);
      setIsUserInput(false);
    } else if (name === "customerVatAmount") {
      setCustomerVatAmount(value);
      setCustomerVatAmountError(false);
      setIsUserInput(false);
    } else if (name === "customerOmrAmount") {
      setCustomerOmrAmount(value);
    } else if (name === "customerTotalUSD") {
      setCustomerTotalUSD(value);
      setCustomerTotalUSDError(false);
      setIsUserInput(true); // Flag this as user input
    } else if (name === "remarks") {
      setRemarks(value);
    } else if (name === "creditNote") {
      setCreditNote(value);
      setIsUserInput(false);
      console.log(originalCustomerAmount, "originalCustomerAmount");
      // setCustomerAmount((originalCustomerAmount - value)?.toFixed(3)); // adjust from original
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      alert("If you reload, your changes may not be saved.");

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const getItemName = (id, name) => {
    if (name == "service" && id) {
      console.log(id, "id getItemName");
      const service = services.find((s) => s._id === id);
      console.log(service, "service getItemName");

      return service ? service.serviceName : "N/A";
    } else if (name == "customer" && id) {
      const customer = customers.find((s) => s._id === id);
      return customer ? customer.customerName : "N/A";
    } else if (name == "vendor" && id) {
      const vendor = vendors.find((s) => s._id === id);
      return vendor ? vendor.vendorName : "N/A";
    } else if (name == "chargeType" && id) {
      const charge = charges.find((s) => s._id === id);
      console.log(charge, "chargegetItemName");
      return charge ? charge.chargeName : "N/A";
    } else if (name == "subChargeType" && id) {
      const subCharge = subCharges.find((s) => s._id === id);
      return subCharge ? subCharge.subchargeName : "N/A";
    }
  };

  const generateUniqueId = () => {
    return (
      "uid_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    );
  };

  const addNewCharge = async () => {
    // --- Vendor OMR validation ---
    let omrErrors = vendorSections.map((v) => {
      if (v.vendor && v.vendor !== "") {
        return !v.vendorAmount || Number(v.vendorAmount) === 0;
      }
      return false;
    });
    setVendorOmrErrors(omrErrors);
    // If any error, prevent submission and show message
    if (omrErrors.some((err) => err)) {
      setMessage("Please enter a valid Amount for each selected Vendor.");
      setOpenPopUp(true);
      return;
    }

    if (!selectedService || selectedService === "" || !selectedService) {
      setSelectedServiceError(true);
    } else {
      setSelectedServiceError(false);
    }

    if (
      !selectedChargesType ||
      selectedChargesType === "" ||
      !selectedChargesType
    ) {
      setSelectedChargesTypeError(true);
    } else {
      setSelectedChargesTypeError(false);
    }

    if (
      !selectedSubhargesType ||
      selectedSubhargesType === "" ||
      !selectedSubhargesType
    ) {
      setSelectedSubhargesTypeError(true);
    } else {
      setSelectedSubhargesTypeError(false);
    }

    if (selectedQuantity === "" || !selectedQuantity) {
      setSelectedQuantityError(true);
    } else {
      setSelectedQuantityError(false);
    }

    // if (
    //   !selectedNewCustomer ||
    //   selectedNewCustomer === "" ||
    //   !selectedNewCustomer
    // ) {
    //   setSelectedNewCustomerError(true);
    // } else {
    //   setSelectedNewCustomerError(false);
    // }

    if (!customerAmount || customerAmount === "" || !customerAmount) {
      setCustomerAmountError(true);
    } else {
      setCustomerAmountError(false);
    }

    if (customerTotalUSD == "") {
      setCustomerTotalUSDError(true);
    } else {
      setCustomerTotalUSDError(false);
    }

    if (!customerVatAmount || customerVatAmount === "" || !customerVatAmount) {
      setCustomerVatAmountError(true);
    } else {
      setCustomerVatAmountError(false);
    }

    if (!customerTotalOmr || customerTotalOmr === "" || !customerTotalOmr) {
      setCustomerTotalOmrError(true);
    } else {
      setCustomerTotalOmrError(false);
    }

    const missingFields = [
      { key: "selectedService", value: selectedService },
      { key: "selectedChargesType", value: selectedChargesType },
      { key: "selectedSubhargesType", value: selectedSubhargesType },
      { key: "selectedQuantity", value: selectedQuantity },
      { key: "selectedNewCustomer", value: selectedNewCustomer },
      { key: "customerAmount", value: customerAmount },
      { key: "customerTotalUSD", value: customerTotalUSD },
    ].filter((item) => !item.value);

    if (missingFields.length > 0) {
      console.log(
        "Missing fields:",
        missingFields.map((item) => item.key).join(", ")
      );
    }

    if (
      selectedService &&
      selectedChargesType &&
      selectedSubhargesType &&
      selectedQuantity &&
      customerAmount &&
      customerTotalUSD &&
      customerVatAmount
    ) {
      // Map vendorSections to payload fields
      let vendorFields = {};
      vendorSections.forEach((v, idx) => {
        if (v.vendor && v.vendor !== "") {
          if (idx === 0) {
            vendorFields["vendorId"] = v.vendor;
            vendorFields["vendorOMR"] = Number(v.vendorAmount);
            vendorFields["vendorVAT"] = Number(v.vendorVatAmount);
            vendorFields["vendorTotalUSD"] = Number(v.vendorTotalUSD);
            vendorFields["isPrivateVendor"] = v.isPrivateVendor;
          } else {
            const n = idx + 1;
            vendorFields[`vendor${n}Id`] = v.vendor;
            vendorFields[`vendor${n}OMR`] = Number(v.vendorAmount);
            vendorFields[`vendor${n}VAT`] = Number(v.vendorVatAmount);
            vendorFields[`vendor${n}TotalUSD`] = Number(v.vendorTotalUSD);
            vendorFields[`isPrivateVendor${n}`] = v.isPrivateVendor;
          }
        }
      });

      let chargesPayload = {
        serviceId: selectedService?._id
          ? selectedService?._id
          : selectedService?.serviceId,
        chargeId: selectedChargesType?._id
          ? selectedChargesType?._id
          : selectedChargesType?.chargeId,
        subchargeId: selectedSubhargesType?._id
          ? selectedSubhargesType?._id
          : selectedSubhargesType?.subchargeId,
        quantity: selectedQuantity,
        customerId: selectedCustomer?.customerId || selectedCustomer?._id,
        customerOMR: Number(customerAmount),
        customerVAT: Number(customerVatAmount),
        customerTotalUSD: Number(customerTotalUSD),
        remark: remarks,
        pdaChargeId: pdaResponse?._id ? pdaResponse?._id : null,
        serviceName: selectedService?.serviceName,
        chargeName: selectedChargesType?.chargeName,
        subchargeName: selectedSubhargesType?.subchargeName,
        uniqueId: generateUniqueId(),
        ...vendorFields,
      };
      console.log(chargesPayload, "add_charges_payload");
      const updatedChargesArray = [...chargesArray, chargesPayload];
      setChargesArray(updatedChargesArray);
      let updatedSavedChargesArray;
      if (finalChargesArray.length === 0) {
        updatedSavedChargesArray = [...updatedChargesArray];
      } else {
        updatedSavedChargesArray = [
          ...finalChargesArray,
          ...updatedChargesArray,
        ];
      }
      setSavedChargesArray(updatedSavedChargesArray);
      setMessage("Charges added successfully!");
      setOpenPopUp(true);
      resetCharges("new");
    } else {
      setMessage("Please fill all the required fields");
      setOpenPopUp(true);
    }
  };

  useEffect(() => {
    console.log(savedChargesArray, "savedChargesArray");
  }, [savedChargesArray]);

  const editCharges = async (index) => {
    // --- Vendor OMR validation ---
    let omrErrors = vendorSections.map((v) => {
      if (v.vendor && v.vendor !== "") {
        return !v.vendorAmount || Number(v.vendorAmount) === 0;
      }
      return false;
    });
    setVendorOmrErrors(omrErrors);
    // If any error, prevent submission and show message
    if (omrErrors.some((err) => err)) {
      setMessage("Please enter a valid Amount for each selected Vendor.");
      setOpenPopUp(true);
      return;
    }

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

    if (selectedQuantity == null || selectedQuantity === "") {
      setSelectedQuantityError(true);
    } else {
      setSelectedQuantityError(false);
    }

    if (selectedNewCustomer == null || selectedNewCustomer === "") {
      setSelectedNewCustomerError(true);
    } else {
      setSelectedNewCustomerError(false);
    }

    if (customerAmount == null || customerAmount === "") {
      setCustomerAmountError(true);
    } else {
      setCustomerAmountError(false);
    }

    if (customerTotalUSD == "") {
      setCustomerTotalUSDError(true);
    } else {
      setCustomerTotalUSDError(false);
    }

    if (customerVatAmount == null || customerVatAmount === "") {
      setCustomerVatAmountError(true);
    } else {
      setCustomerVatAmountError(false);
    }

    if (customerTotalOmr == null || customerTotalOmr === "") {
      setCustomerTotalOmrError(true);
    } else {
      setCustomerTotalOmrError(false);
    }
    let isValidNumber = (value) => value !== null && value !== undefined;

    if (
      selectedService &&
      selectedChargesType &&
      selectedSubhargesType &&
      selectedNewCustomer &&
      isValidNumber(selectedQuantity) &&
      isValidNumber(customerAmount) &&
      isValidNumber(customerTotalUSD) &&
      isValidNumber(customerVatAmount)
    ) {
      // Map vendorSections to payload fields
      let vendorFields = {};
      vendorSections.forEach((v, idx) => {
        if (v.vendor && v.vendor !== "") {
          if (idx === 0) {
            vendorFields["vendorId"] = v.vendor;
            vendorFields["vendorOMR"] = Number(v.vendorAmount);
            vendorFields["vendorVAT"] = Number(v.vendorVatAmount);
            vendorFields["vendorTotalUSD"] = Number(v.vendorTotalUSD);
            vendorFields["isPrivateVendor"] = v.isPrivateVendor;
          } else {
            const n = idx + 1;
            vendorFields[`vendor${n}Id`] = v.vendor;
            vendorFields[`vendor${n}OMR`] = Number(v.vendorAmount);
            vendorFields[`vendor${n}VAT`] = Number(v.vendorVatAmount);
            vendorFields[`vendor${n}TotalUSD`] = Number(v.vendorTotalUSD);
            vendorFields[`isPrivateVendor${n}`] = v.isPrivateVendor;
          }
        }
      });

      let chargesPayload = {
        serviceId: selectedService?.serviceId || selectedService?._id,
        chargeId: selectedChargesType?.chargeId || selectedChargesType?._id,
        subchargeId:
          selectedSubhargesType?.subchargeId || selectedSubhargesType?._id,
        quantity: selectedQuantity,
        customerId: selectedNewCustomer?.customerId || selectedNewCustomer?._id,
        customerOMR: Number(customerAmount),
        customerVAT: Number(customerVatAmount),
        customerTotalUSD: Number(customerTotalUSD),
        remark: remarks,
        pdaChargeId: editCharge?._id
          ? editCharge?._id
          : editCharge?.pdaChargeId,
        serviceName: selectedServiceName
          ? selectedServiceName
          : selectedService?.serviceName,
        chargeName: selectedChargesTypeName
          ? selectedChargesTypeName
          : selectedChargesType?.chargeName,
        subchargeName: selectedSubhargesTypeName
          ? selectedSubhargesTypeName
          : selectedSubhargesType?.subchargeName,
        uniqueId: generateUniqueId(),
        creditNote: creditNote,
        ...vendorFields,
      };
      console.log(chargesPayload, "edit_charges_payload");
      if (index !== null) {
        const updatedChargesArray = finalChargesArray.map((charge, idx) =>
          idx === index ? chargesPayload : charge
        );
        setSavedChargesArray(updatedChargesArray); // update the state
        console.log(updatedChargesArray, "updatedChargesArray");
        // Now call submit with the updated charges array
        onSubmit(updatedChargesArray, "one"); // pass the updated array immediately
        setMessage("Charges updated successfully!");
        setOpenPopUp(true);
        if (pdaResponse?._id) {
          try {
            const response = await editChargeQuotation(chargesPayload);
            onSubmit(response?.pdaServices, "two");
            setMessage("Charges updated successfully!");
            setOpenPopUp(true);
            console.log("editChargeQuotation_response", response);
          } catch (error) {
            console.error("Error fetching charges:", error);
          }
        }
      }
    } else {
      setMessage("Please fill all the required fields");
      setOpenPopUp(true);
    }
  };

  const submitCharges = async () => {
    if (pdaResponse?._id) {
      try {
        let addChargesPaylod = {
          pdaId: pdaResponse?._id ? pdaResponse?._id : null,
          charges: chargesArray,
        };
        const response = await addPDACharges(addChargesPaylod);
        console.log("addPDACharges_response:", response);
        setMessage("Charges saved successfully!");
        setOpenPopUp(true);
        onSubmit(response?.pdaServices, "three");
      } catch (error) {
        console.error("Error fetching charges:", error);
      }
    } else if (!pdaResponse) {
      onSubmit(savedChargesArray, "four");
      setMessage("Charges saved successfully!");
      setOpenPopUp(true);
    }
  };

  useEffect(() => {
    console.log(selectedService, "selectedService");
    console.log(selectedChargesType, "selectedChargesType");
    console.log(selectedSubhargesType, "selectedSubhargesType");
    console.log(selectedQuantity, "selectedQuantity");
    console.log(selectedNewCustomer, "selectedNewCustomer");
    console.log(customerAmount, "customerAmount");
    console.log(customerOmrAmount, "customerOmrAmount");
    console.log(customerTotalUSD, "customerTotalUSD");
    console.log(typeof customerTotalUSD, "customerTotalUSD");
    console.log(customerVatAmount, "customerVatAmount");
    console.log(selectedVendor, "selectedVendor");
  }, [
    selectedService,
    selectedChargesType,
    selectedSubhargesType,
    selectedQuantity,
    selectedNewCustomer,
    customerAmount,
    customerOmrAmount,
    customerTotalUSD,
    customerVatAmount,
    selectedVendor,
  ]);

  useEffect(() => {
    setCustomerTotalUSDError(false);
  }, [customerTotalUSD]);

  // Recalculate only if user input flag is false
  useEffect(() => {
    console.log(isUserInput, "isUserInput");
    if (!isUserInput) {
      let total = Number(customerAmount) + Number(customerVatAmount);
      let customer_total_usd;
      customer_total_usd = Number(total * 2.62);
      setCustomerTotalUSD(customer_total_usd.toFixed(2));
    }
    let total = Number(customerAmount) + Number(customerVatAmount);
    setCustomerTotalOmr(total.toFixed(3));
  }, [customerAmount, customerVatAmount, isUserInput]);

  useEffect(() => {
    console.log(isVendorUserInput, "isVendorUserInput");

    if (!isVendorUserInput) {
      let total = Number(vendorAmount) + Number(vendorVatAmount);
      let vendor_total_usd;
      vendor_total_usd = Number(total * 2.62);
    }
    let total = Number(vendorAmount) + Number(vendorVatAmount);
    setVendorTotalOmr(total.toFixed(3));
  }, [vendorAmount, vendorVatAmount, isVendorUserInput]);

  // useEffect(() => {
  //   setIsVendorUserInput(false);
  // }, [vendorAmount, vendorVatAmount]);

  const submitEditCharges = () => {};

  useEffect(() => {
    console.log(chargesArray, "chargesArray_RESPONSIVEDIALOG");
  }, [chargesArray]);
  useEffect(() => {
    console.log(remarks, "remarks");
  }, [remarks]);

  const resetCharges = (event) => {
    setFirstFieldSelected(false);
    setSecondFieldSelected(false);
    setThirdFieldSelected(false);
    setSelectedService("");
    setSelectedChargesType(null);
    setSelectedSubhargesType(null);
    setCharges([]);
    setSubCharges([]);
    setSelectedVendor(null);
    if (!selectedNewCustomer?._id) {
      setSelectedNewCustomer("");
    }
    setSelectedQuantity("");
    setCustomerAmount("");
    setCustomerVatAmount("");
    setCustomerOmrAmount("");
    setCustomerTotalUSD("");
    setVendorAmount("");
    setVendorVatAmount("");
    setVendorOmrAmount("");
    setRemarks("");
    setIsPrivateVendor(false);
    setVendorSections([
      {
        vendor: "",
        vendorAmount: "",
        vendorVatAmount: "",
        vendorTotalOmr: "",
        vendorTotalUSD: "",
        isPrivateVendor: false,
      },
    ]);
    if (event != "new") {
      setChargesArray([]);
    }
  };

  useEffect(() => {
    console.log(open, "open");
    console.log(isEditcharge, "isEditcharge");
    if (isEditcharge == false && open == true) {
      resetCharges("load");
    }
  }, [isEditcharge, open]);
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [selectedChargesTypeName, setSelectedChargesTypeName] = useState("");
  const [selectedSubhargesTypeName, setSelectedSubhargesTypeName] =
    useState("");
  useEffect(() => {
    console.log(editCharge, "editCharge_deta");
    console.log(isEditcharge, "isEditcharge EDIT");
    console.log(open, "open EDIT");
    if (isEditcharge == true && open == true) {
      setIsUserInput(true);
      setIsVendorUserInput(true);
      fetchPdaDetails(pdaResponse?._id);
      if (isInitialEdit == false) {
        setSelectedService(editCharge?.serviceId);
        setSelectedChargesType(editCharge?.chargeId);
        setSelectedSubhargesType(editCharge?.subchargeId);
      } else if (isInitialEdit == true) {
        setSelectedService({
          _id: editCharge?.serviceId,
        });
        setSelectedChargesType({ _id: editCharge?.chargeId });
        setSelectedSubhargesType({ _id: editCharge?.subchargeId });
        setSelectedServiceName(editCharge?.serviceName);
        setSelectedChargesTypeName(editCharge?.chargeName);
        setSelectedSubhargesTypeName(editCharge?.subchargeName);
      }

      setSelectedQuantity(editCharge?.quantity);
      setCustomerAmount(editCharge?.customerOMR);
      setOriginalCustomerAmount(editCharge?.customerOMR);
      setCustomerVatAmount(editCharge?.customerVAT);
      setVendorAmount(editCharge?.vendorOMR);
      setVendorVatAmount(editCharge?.vendorVAT);
      setCustomerTotalUSD(editCharge?.customerTotalUSD?.toFixed(2));
      setRemarks(editCharge?.remark);
      setCreditNote(editCharge?.creditNote);
      setSelectedNewCustomer(editCharge);
      setSelectedVendor(editCharge);
      setUpdatedServiceName(editCharge?.serviceName);
      setUpdatedChargename(editCharge?.chargeName);
      setUpdatedSubChargeName(editCharge?.subchargeName);
      setTemplatesList(editCharge?.templates);
      setIsPrivateVendor(editCharge?.isPrivateVendor);
    }
  }, [isEditcharge, open, editCharge, isInitialEdit]);

  const handleDownload = (template) => {
    const fileUrl = process.env.REACT_APP_FILE_URL + template?.pdfPath;
    const fileName = template?.templateName;
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

  const BASE_URL = `${process.env.REACT_APP_FILE_URL}`;

  const handleView = (template) => {
    console.log(template, "template");
    window.open(`${BASE_URL}/${template?.pdfPath}`, "_blank");
  };

  const fetchPdaDetails = async (id) => {
    let data = {
      pdaId: id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      console.log("pdaDetails:", pdaDetails);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  function handleWheel(event) {
    event.target.blur(); // Removes focus from the input to prevent scroll change
  }

  useEffect(() => {
    console.log(customerTotalOmr, "customerTotalOmr");
  }, [customerTotalOmr]);

  useEffect(() => {
    setSelectedNewCustomer(selectedCustomer);
    console.log(selectedCustomer, "selectedCustomer_default");
  }, [selectedCustomer]);

  useEffect(() => {
    // Populate vendorSections for edit mode
    if (isEditcharge && editCharge) {
      const vendorSectionsEdit = [];
      for (let i = 1; i <= 4; i++) {
        const idKey = i === 1 ? "vendorId" : `vendor${i}Id`;
        const omrKey = i === 1 ? "vendorOMR" : `vendor${i}OMR`;
        const vatKey = i === 1 ? "vendorVAT" : `vendor${i}VAT`;
        const totalUSDKey = i === 1 ? "vendorTotalUSD" : `vendor${i}TotalUSD`;
        const privateKey = i === 1 ? "isPrivateVendor" : `isPrivateVendor${i}`;
        if (editCharge[idKey]) {
          vendorSectionsEdit.push({
            vendor: editCharge[idKey],
            vendorAmount: editCharge[omrKey] || "",
            vendorVatAmount: editCharge[vatKey] || "",
            vendorTotalOmr: (() => {
              const sum =
                Number(editCharge[omrKey]) + Number(editCharge[vatKey]);
              if (isNaN(sum)) return "";
              return sum.toFixed(3);
            })(),
            vendorTotalUSD: editCharge[totalUSDKey] || "",
            isPrivateVendor: !!editCharge[privateKey],
          });
        }
      }
      if (vendorSectionsEdit.length > 0) {
        setVendorSections(vendorSectionsEdit);
      } else {
        setVendorSections([
          {
            vendor: "",
            vendorAmount: "",
            vendorVatAmount: "",
            vendorTotalOmr: "",
            vendorTotalUSD: "",
            isPrivateVendor: false,
          },
        ]);
      }
    }
  }, [isEditcharge, editCharge]);

  const [mailPopupOpen, setMailPopupOpen] = useState(false);

  const sendCreditNoteMail = () => {
    handleMailOpen();
  };

  const handleMailOpen = () => {
    setMailPopupOpen(true);
  };

  const handleQuotationClose = () => {
    setMailPopupOpen(false);
  };

  const handleSubmit = (chargesArray, from) => {
    handleQuotationClose();
  };

  // --- Vendor Charges dynamic section state and handlers ---
  const [vendorSections, setVendorSections] = useState([
    {
      vendor: "",
      vendorAmount: "",
      vendorVatAmount: "",
      vendorTotalOmr: "",
      vendorTotalUSD: "",
      isPrivateVendor: false,
    },
  ]);

  const handleAddVendorSection = () => {
    if (vendorSections.length < 4) {
      setVendorSections([
        ...vendorSections,
        {
          vendor: "",
          vendorAmount: "",
          vendorVatAmount: "",
          vendorTotalOmr: "",
          vendorTotalUSD: "",
          isPrivateVendor: false,
        },
      ]);
    }
  };

  const handleDeleteVendorSection = (idx) => {
    setVendorSections(vendorSections.filter((_, i) => i !== idx));
  };

  const handleVendorSectionChange = (idx, field, value) => {
    setVendorSections((prev) =>
      prev.map((section, i) => {
        if (i === idx) {
          const updatedSection = { ...section, [field]: value };
          let amount = Number(
            field === "vendorAmount" ? value : updatedSection.vendorAmount
          );
          let vat = Number(
            field === "vendorVatAmount" ? value : updatedSection.vendorVatAmount
          );
          // If user is editing vendorAmount or vendorVatAmount, recalculate totals
          if (field === "vendorAmount" || field === "vendorVatAmount") {
            updatedSection.vendorTotalOmr = (amount + vat).toFixed(3);
            // Always update vendorTotalUSD with calculated value unless user is currently editing vendorTotalUSD
            if (!updatedSection._userSetVendorTotalUSD) {
              let vendor_total_usd = 0;
              vendor_total_usd = Number((amount + vat) * 2.62);
              updatedSection.vendorTotalUSD = vendor_total_usd.toFixed(2);
            }
          }
          // If user edits vendorTotalUSD, set flag so it doesn't get overwritten by calculation
          if (field === "vendorTotalUSD") {
            updatedSection._userSetVendorTotalUSD = true;
          } else if (field === "vendorAmount" || field === "vendorVatAmount") {
            // If user edits amount/vat, reset user input flag so calculation can update
            updatedSection._userSetVendorTotalUSD = false;
          }
          // Clear vendorOmrErrors for this vendor if vendorAmount is valid
          if (field === "vendorAmount") {
            setVendorOmrErrors((prevErrors) => {
              const updatedErrors = [...prevErrors];
              updatedErrors[idx] = !value || Number(value) === 0;
              return updatedErrors;
            });
          }
          return updatedSection;
        }
        return section;
      })
    );
  };
  // --- End Vendor Charges dynamic section ---

  useEffect(() => {
    console.log(vendorSections, "vendorSections");
  }, [vendorSections]);

  useEffect(() => {
    if (!open) {
      setCreditNote(null);
    }
  }, [open]);
  return (
    <>
      <Dialog
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
      >
        <div className="d-flex justify-content-between">
          <DialogTitle>{isEditcharge ? "Update" : "Add"} Charge</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "60px" }}>
          {isEditcharge == false && (
            <>
              <div className="Anchoragecall">
                {/* <div className="Callhead">Service: Anchorage Call</div> */}
                <div className=" ">
                  <div className="row align-items-start">
                    <div className="col-lg-4 col-md-6 col-sm-12 mb-3">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Services:<span className="required"> * </span>
                      </label>
                      <div className="vessel-select">
                        <select
                          key={
                            selectedService ? selectedService?._id : "default"
                          }
                          name="service"
                          className="form-select vesselbox vesselbox:placeholder "
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={selectedService ? selectedService?._id : null}
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

                    <div className="col-lg-4 col-md-6 col-sm-12 mb-3">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Charge Type:<span className="required"> * </span>
                      </label>
                      <div className="vessel-select">
                        <select
                          name="chargeType"
                          className="form-select vesselbox vesselbox:placeholder"
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={selectedChargesType?._id}
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
                            Please select charge type
                          </div>
                        </>
                      )}
                    </div>

                    <div className="col-lg-4 col-md-6 col-sm-12 ">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Sub Charge Type:
                        <span className="required"> * </span>
                      </label>
                      <div className="vessel-select">
                        <select
                          name="subChargeType"
                          className="form-select vesselbox "
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={selectedSubhargesType?._id}
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
                            Please select sub charge type
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-4 col-md-6 col-sm-12 mb-3">
                    <div className="">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Quantity:
                      </label>
                      <input
                        type="text"
                        className="form-control vessel-voyage"
                        id="exampleFormControlInput1"
                        placeholder=""
                        name="quantity"
                        value={selectedQuantity}
                        onChange={handleInputChange}
                      />
                    </div>
                    {selectedQuantityError && (
                      <>
                        <div className="invalid">Please enter quantity</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="customerhead">
                  <div className="headname">Customer Charges</div>
                  <div className="customerrectangle"></div>
                </div>
                <div className="row ">
                  <div className="row align-items-start">
                    <div className="col-lg-4 col-md-6 col-sm-12 mb-3">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Customer:
                      </label>
                      <div className="vessel-select">
                        <select
                          name="customer"
                          className="form-select vesselbox"
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={
                            selectedCustomer?.customerId ||
                            selectedCustomer?._id
                          }
                          disabled={
                            selectedCustomer?.customerId ||
                            selectedCustomer?._id
                          }
                        >
                          <option value="">Choose Customer</option>
                          {customers?.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.customerName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            Amount(OMR):
                            <span className="required"> * </span>
                          </label>
                          <input
                            type="number"
                            className="form-control vessel-voyage"
                            id="exampleFormControlInput1/"
                            placeholder=""
                            name="customerAmount"
                            value={customerAmount}
                            onChange={handleInputChange}
                            onWheel={handleWheel}
                          />
                        </div>
                        {customerAmountError && (
                          <>
                            <div className="invalid">
                              Please enter OMR amount
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col">
                      <div className="mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            VAT Amount:<span className="required"> * </span>
                          </label>
                          <input
                            type="number"
                            className="form-control vessel-voyage"
                            id="exampleFormControlInput1"
                            placeholder=""
                            name="customerVatAmount"
                            value={customerVatAmount}
                            onChange={handleInputChange}
                            onWheel={handleWheel}
                          />
                        </div>
                        {customerVatAmountError && (
                          <>
                            <div className="invalid">
                              Please enter VAT amount
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row ">
                  <div className="row align-items-start">
                    <div className="col-lg-4 col-md-6 col-sm-12 ">
                      <div className="mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            Total OMR:
                          </label>
                          <input
                            type="number"
                            className="form-control vessel-voyage"
                            id="exampleFormControlInput1"
                            placeholder=""
                            name="customerOmrAmount"
                            value={customerTotalOmr}
                            disabled
                            onWheel={handleWheel}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            Total USD:
                          </label>
                          <input
                            type="number"
                            className="form-control vessel-voyage"
                            id="exampleFormControlInput1"
                            placeholder=""
                            name="customerTotalUSD"
                            value={customerTotalUSD}
                            onChange={handleInputChange}
                            onWheel={handleWheel}
                          />
                        </div>
                        {customerTotalUSDError && (
                          <>
                            <div className="invalid">
                              Please enter total USD
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="customerhead">
                  <div className="headnamevendor">Vendor Charges</div>
                  <div className="customerrectangle"></div>
                </div>
                {/* Vendor Charges dynamic sections */}
                {vendorSections.map((section, idx) => (
                  <div
                    className="row"
                    key={idx}
                    style={{
                      borderBottom: "1px solid #eee",
                      marginBottom: 12,
                      paddingBottom: 12,
                      boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                    }}
                  >
                    <div className="row align-items-start">
                      <div className="col-lg-4 col-md-6 col-sm-12 mb-3">
                        <label className="form-label">Vendor:</label>
                        <div className="vessel-select">
                          <select
                            name="vendor"
                            className="form-select vesselbox"
                            aria-label="Default select example"
                            value={section.vendor}
                            onChange={(e) =>
                              handleVendorSectionChange(
                                idx,
                                "vendor",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Choose Vendor</option>
                            {vendors?.map((vendor) => (
                              <option key={vendor._id} value={vendor._id}>
                                {vendor.vendorName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-6 col-sm-12">
                        <div className="mb-3">
                          <div className="col">
                            <label className="form-label">Amount(OMR):</label>
                            <input
                              type="number"
                              className="form-control vessel-voyage"
                              name="vendorAmount"
                              value={section.vendorAmount}
                              onChange={(e) =>
                                handleVendorSectionChange(
                                  idx,
                                  "vendorAmount",
                                  e.target.value
                                )
                              }
                            />
                            {vendorOmrErrors[idx] && section.vendor && (
                              <div
                                className="invalid"
                                style={{ color: "red", fontSize: "0.9em" }}
                              >
                                Please enter a valid Amount for this Vendor
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-6 col-sm-12">
                        <div className="mb-3">
                          <div className="col">
                            <label className="form-label">VAT Amount:</label>
                            <input
                              type="number"
                              className="form-control vessel-voyage"
                              name="vendorVatAmount"
                              value={section.vendorVatAmount}
                              onChange={(e) =>
                                handleVendorSectionChange(
                                  idx,
                                  "vendorVatAmount",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row align-items-center">
                      <div className="col-lg-4 col-md-6 col-sm-12">
                        <div className="mb-3">
                          <div className="col">
                            <label className="form-label">Total OMR:</label>
                            <input
                              type="number"
                              className="form-control vessel-voyage"
                              name="vendorTotalOmr"
                              value={section.vendorTotalOmr}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-6 col-sm-12">
                        <div className="mb-3">
                          <div className="col">
                            <label className="form-label">Total USD:</label>
                            <input
                              type="number"
                              className="form-control vessel-voyage"
                              name="vendorTotalUSD"
                              value={section.vendorTotalUSD}
                              onChange={(e) =>
                                handleVendorSectionChange(
                                  idx,
                                  "vendorTotalUSD",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-6 col-sm-12">
                        <div
                          className="form-check pvendor"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`flexCheckDefault-vendor-${idx}`}
                            checked={section.isPrivateVendor}
                            onChange={(e) =>
                              handleVendorSectionChange(
                                idx,
                                "isPrivateVendor",
                                e.target.checked
                              )
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`flexCheckDefault-vendor-${idx}`}
                          >
                            Private Vendor
                          </label>
                          {vendorSections.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-link text-danger ms-2"
                              style={{ fontSize: 18, padding: 0 }}
                              onClick={() => handleDeleteVendorSection(idx)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Add More button */}
                {vendorSections.length < 4 && (
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleAddVendorSection}
                    >
                      <i className="bi bi-plus-circle"></i> Add More
                    </button>
                  </div>
                )}
                <div className="row ">
                  <div className="row align-items-start">
                    <div className="col">
                      <div className="mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label "
                          >
                            Remarks:
                          </label>
                          <textarea
                            rows="3"
                            className="form-control remarkfontsize"
                            id="exampleFormControlInput1"
                            placeholder=""
                            name="remarks"
                            value={remarks}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-5">
                  <div className="footer-button d-flex justify-content-center ">
                    {chargesArray.length == 0 && (
                      <>
                        <button
                          type="button"
                          className="btn btncancel"
                          onClick={onClose}
                        >
                          Cancel{" "}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="btn  generate-buttona "
                      onClick={() => {
                        addNewCharge();
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {chargesArray?.length > 0 && (
                  <>
                    {chargesArray.map((charge, index) => (
                      <>
                        <div className="marinetable mt-4 mb-4">
                          <div className="tablehead">
                            {/* {getItemName(charge?.serviceId, "service")} */}
                            {charge?.serviceName}
                          </div>

                          <div className="row mb-3">
                            <div className="col-lg-6 col-md-6 col-sm-12">
                              <span className="marinehead">Charge type:</span>
                              <span className="subvalue">
                                {/* {getItemName(
                                  charge?.subchargeId,
                                  "subChargeType"
                                )} */}
                                {charge?.chargeName}
                              </span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12">
                              <span className="marinehead">Quantity:</span>
                              <span className="subvalue">
                                {charge?.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-12">
                              <div className="mt-2">
                                <span className="marinehead">
                                  Sub charge Type:
                                </span>
                                <span className="subvalue">
                                  {/* {getItemName(
                                  charge?.subchargeId,
                                  "subChargeType"
                                )} */}
                                  {charge?.subchargeName}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-lg-12 col-md-6 col-sm-12">
                              <span className="marinehead marineBold">
                                Customer:
                              </span>
                              <span className="subvalue marineBold">
                                {getItemName(charge?.customerId, "customer")}
                              </span>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="omr col-lg-3 col-md-6 col-sm-12 ">
                              <span className="marinehead">Amount (OMR):</span>
                              <span className="subvalue">
                                {charge.customerOMR.toFixed(3)}
                              </span>
                            </div>

                            <div className="vat col-lg-3 col-md-6 col-sm-12 ">
                              <span className="marinehead">VAT Amount:</span>
                              <span className="subvalue">
                                {charge.customerVAT.toFixed(3)}
                              </span>
                            </div>

                            <div className="omr col-lg-3 col-md-6 col-sm-12 ">
                              <span className="marinehead">Total (OMR):</span>
                              <span className="subvalue">
                                {(
                                  Number(charge.customerOMR) +
                                  Number(charge.customerVAT)
                                ).toFixed(3)}
                              </span>
                            </div>

                            <div className="vat col-lg-3 col-md-6 col-sm-12 ">
                              <span className="marinehead">Total USD:</span>
                              <span className="subvalue">
                                {charge.customerTotalUSD.toFixed(3)}
                              </span>
                            </div>
                          </div>
                          <div className="row mb-3"></div>
                          <div className="row mb-3 vendor-charges">
                            {/* Display all vendor fields dynamically */}
                            {[1, 2, 3, 4].map((vendorIdx) => {
                              const idKey =
                                vendorIdx === 1
                                  ? "vendorId"
                                  : `vendor${vendorIdx}Id`;
                              const omrKey =
                                vendorIdx === 1
                                  ? "vendorOMR"
                                  : `vendor${vendorIdx}OMR`;
                              const vatKey =
                                vendorIdx === 1
                                  ? "vendorVAT"
                                  : `vendor${vendorIdx}VAT`;
                              const totalUSDKey =
                                vendorIdx === 1
                                  ? "vendorTotalUSD"
                                  : `vendor${vendorIdx}TotalUSD`;
                              const privateKey =
                                vendorIdx === 1
                                  ? "isPrivateVendor"
                                  : `isPrivateVendor${vendorIdx}`;
                              if (charge[idKey]) {
                                return (
                                  <div
                                    className="col-lg-3 col-md-6 col-sm-12"
                                    key={idKey}
                                    style={{
                                      border: "1px solid #eee",
                                      marginBottom: 8,
                                      padding: 8,
                                    }}
                                  >
                                    <div className="mb-2">
                                      <b>Vendor:</b>{" "}
                                      {getItemName(charge[idKey], "vendor") ||
                                        "N/A"}
                                    </div>
                                    <div className="mb-2">
                                      <b>Amount (OMR):</b>{" "}
                                      {charge[omrKey]?.toFixed
                                        ? charge[omrKey].toFixed(2)
                                        : Number(charge[omrKey]).toFixed(2)}
                                    </div>
                                    <div className="mb-2">
                                      <b>VAT Amount:</b> {charge[vatKey]}
                                    </div>
                                    <div className="mb-2">
                                      <b>Total (OMR):</b>{" "}
                                      {(
                                        Number(charge[omrKey]) +
                                        Number(charge[vatKey])
                                      ).toFixed(2)}
                                    </div>
                                    <div className="mb-2">
                                      <b>Total USD:</b> {charge[totalUSDKey]}
                                    </div>
                                    {!!charge[privateKey] && (
                                      <div
                                        className="mb-2"
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                        }}
                                      >
                                        <b>Private Vendor:</b>
                                        <input
                                          type="checkbox"
                                          readOnly
                                          checked={true}
                                          style={{ marginLeft: 6 }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                          {charge?.remark && (
                            <>
                              <div className="row mb-3">
                                <div className="col-1">
                                  <span className="marinehead">Remarks:</span>
                                </div>
                                <div className="col-11 remark_value">
                                  <span className="">{charge?.remark}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ))}
                  </>
                )}

                {chargesArray.length > 0 && (
                  <>
                    <div className="footer-button d-flex justify-content-center">
                      <button
                        type="button"
                        className="btn btncancel"
                        onClick={onClose}
                      >
                        Cancel{" "}
                      </button>
                      <button
                        type="button"
                        className="btn generate-buttona"
                        onClick={() => {
                          submitCharges();
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {isEditcharge == true && (
            <>
              <div className="Anchoragecall">
                <div className="row mb-2">
                  <div className="row align-items-start table left-spc">
                    <div className="col-lg-3 ">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Services:<span className="required"> * </span>
                      </label>
                      <div className="vessel-select">
                        <select
                          name="service"
                          className="form-select vesselbox"
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={
                            selectedService?.serviceId || selectedService?._id
                          }
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
                          <div className="invalid">Please select services</div>
                        </>
                      )}
                    </div>
                    <div className="col-lg-3">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Charge Type:<span className="required"> * </span>
                      </label>
                      <div className="vessel-select">
                        <select
                          name="chargeType"
                          className="form-select vesselbox"
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={
                            selectedChargesType?.chargeId ||
                            selectedChargesType?._id
                          }
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
                    <div className="col-lg-3">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Sub Charge Type:<span className="required"> * </span>
                      </label>
                      <div className="vessel-select">
                        <select
                          name="subChargeType"
                          className="form-select vesselbox"
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={
                            selectedSubhargesType?.subchargeId ||
                            selectedSubhargesType?._id
                          }
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
                    <div className="col-lg-3 quantitypadding">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Quantity:
                      </label>
                      <div className="vessel-select">
                        <input
                          type="text"
                          className="form-control labelbox vesselbox"
                          id="exampleFormControlInput1"
                          placeholder=""
                          name="quantity"
                          value={selectedQuantity}
                          onChange={handleInputChange}
                        />
                      </div>
                      {selectedQuantityError && (
                        <>
                          <div className="invalid">Please enter quantity</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row ">
                  <div className="row align-items-start table left-spc">
                    <div className="col-lg-12">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Remarks:
                      </label>
                      <div className="vessel-select">
                        <textarea
                          rows="3"
                          className="form-control remarkfontsizeupdate"
                          id="exampleFormControlInput1"
                          placeholder=""
                          name="remarks"
                          value={remarks}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-2"></div>

                <div className="row align-items-start mb-2">
                  {templatesList && templatesList?.length > 0 && (
                    <>
                      <div className="templatelink">Template Link:</div>
                      <div className="templateouterupdatechhharge">
                        {templatesList?.length > 0 &&
                          templatesList?.map((template, index) => {
                            return (
                              <>
                                <div className="d-flex justify-content-between ">
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

              <div className="row mt-4">
                <div className="col-12 ">
                  <div className="marinetableadd">
                    <div className="tablehead">Customer Charges</div>

                    <div className="row cust">
                      <div className="col-5">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label labelhead"
                        >
                          Customer:
                        </label>
                      </div>
                      <div className="col-7  justify-content-start ">
                        <select
                          name="customer"
                          className="form-select vesselbox"
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={
                            selectedNewCustomer?.customerId ||
                            selectedNewCustomer?._id
                          }
                        >
                          <option value="">Choose Customer</option>
                          {customers?.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.customerName}
                            </option>
                          ))}
                        </select>
                        {selectedNewCustomerError && (
                          <>
                            <div className="invalid">
                              Please select customer
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="row cust">
                      <div className="col-5">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label labelhead"
                        >
                          Amount(OMR):
                        </label>
                      </div>
                      <div className="col-7 justify-content-start ">
                        <input
                          type="number"
                          className="form-control labelbox"
                          id="exampleFormControlInput1"
                          placeholder=""
                          name="customerAmount"
                          value={customerAmount}
                          onChange={handleInputChange}
                          onWheel={handleWheel}
                        />
                        {customerAmountError && (
                          <>
                            <div className="invalid">Please enter amount</div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="row cust">
                      <div className="col-5">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label labelhead"
                        >
                          VAT Amount:
                        </label>
                      </div>
                      <div className="col-7  justify-content-start ">
                        <input
                          type="number"
                          className="form-control labelbox"
                          id="exampleFormControlInput1"
                          placeholder=""
                          name="customerVatAmount"
                          value={customerVatAmount}
                          onChange={handleInputChange}
                          onWheel={handleWheel}
                        />
                        {customerVatAmountError && (
                          <>
                            <div className="invalid">
                              Please enter vat amount
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="row cust">
                      <div className="col-5">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label labelhead"
                        >
                          Total OMR:
                        </label>
                      </div>
                      <div className="col-7 d-flex justify-content-start ">
                        <input
                          type="number"
                          className="form-control labelbox"
                          id="exampleFormControlInput1"
                          placeholder=""
                          name="customerOmrAmount"
                          value={customerTotalOmr}
                          disabled
                          onWheel={handleWheel}
                        />
                      </div>
                    </div>
                    <div className="row cust">
                      <div className="col-5">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label labelhead"
                        >
                          Total USD:
                        </label>
                      </div>
                      <div className="col-7  justify-content-start ">
                        <input
                          type="number"
                          className="form-control labelbox"
                          id="exampleFormControlInput1"
                          placeholder=""
                          name="customerTotalUSD"
                          value={customerTotalUSD}
                          onChange={handleInputChange}
                          onWheel={handleWheel}
                        />
                        {customerTotalUSDError && (
                          <>
                            <div className="invalid">
                              Please enter total usd
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {pdaResponse !== null && pdaResponse?.pdaStatus > 1 && (
                      <>
                        <div className="row cust">
                          <div className="col-5">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label labelhead"
                            >
                              Credit Note:
                            </label>
                          </div>
                          <div className="col-7  justify-content-start ">
                            <input
                              type="text"
                              className="form-control labelbox vesselbox"
                              id="exampleFormControlInput1"
                              placeholder=""
                              name="creditNote"
                              value={creditNote}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="row vendor-row mt-2 ">
                  {/* Vendor Charges Edit dynamic sections */}
                  <div className="col-12">
                    <div className="tablehead">Vendor Charges</div>
                    {vendorSections.map((section, idx) => (
                      <div
                        className="row"
                        key={idx}
                        style={{
                          borderBottom: "1px solid #eee",
                          marginBottom: 12,
                          paddingBottom: 12,
                          boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                        }}
                      >
                        <div className="row align-items-start">
                          <div className="col">
                            <label className="form-label">Vendor:</label>
                            <div className="vessel-select">
                              <select
                                name="vendor"
                                className="form-select vesselbox"
                                aria-label="Default select example"
                                value={section.vendor}
                                onChange={(e) =>
                                  handleVendorSectionChange(
                                    idx,
                                    "vendor",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Choose Vendor</option>
                                {vendors?.map((vendor) => (
                                  <option key={vendor._id} value={vendor._id}>
                                    {vendor.vendorName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="col">
                            <div className="mb-3">
                              <div className="col">
                                <label className="form-label">
                                  Amount(OMR):
                                </label>
                                <input
                                  type="number"
                                  className="form-control vessel-voyage"
                                  name="vendorAmount"
                                  value={section.vendorAmount}
                                  onChange={(e) =>
                                    handleVendorSectionChange(
                                      idx,
                                      "vendorAmount",
                                      e.target.value
                                    )
                                  }
                                />
                                {vendorOmrErrors[idx] && section.vendor && (
                                  <div
                                    className="invalid"
                                    style={{ color: "red", fontSize: "0.9em" }}
                                  >
                                    Please enter a valid Amount for this Vendor
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col">
                            <div className="mb-3">
                              <div className="col">
                                <label className="form-label">
                                  VAT Amount:
                                </label>
                                <input
                                  type="number"
                                  className="form-control vessel-voyage"
                                  name="vendorVatAmount"
                                  value={section.vendorVatAmount}
                                  onChange={(e) =>
                                    handleVendorSectionChange(
                                      idx,
                                      "vendorVatAmount",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row align-items-center">
                          <div className="col-4">
                            <div className="mb-3">
                              <div className="col">
                                <label className="form-label">Total OMR:</label>
                                <input
                                  type="number"
                                  className="form-control vessel-voyage"
                                  name="vendorTotalOmr"
                                  value={section.vendorTotalOmr}
                                  disabled
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="mb-3">
                              <div className="col">
                                <label className="form-label">Total USD:</label>
                                <input
                                  type="number"
                                  className="form-control vessel-voyage"
                                  name="vendorTotalUSD"
                                  value={section.vendorTotalUSD}
                                  onChange={(e) =>
                                    handleVendorSectionChange(
                                      idx,
                                      "vendorTotalUSD",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div
                              className="form-check pvendor"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`flexCheckDefault-vendor-${idx}`}
                                checked={section.isPrivateVendor}
                                onChange={(e) =>
                                  handleVendorSectionChange(
                                    idx,
                                    "isPrivateVendor",
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`flexCheckDefault-vendor-${idx}`}
                              >
                                Private Vendor
                              </label>
                              {vendorSections.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-link text-danger ms-2"
                                  style={{ fontSize: 18, padding: 0 }}
                                  onClick={() => handleDeleteVendorSection(idx)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {vendorSections.length < 4 && (
                      <div className="mb-3">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={handleAddVendorSection}
                        >
                          <i className="bi bi-plus-circle"></i> Add More
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="savechangesfooter text-center">
                <button
                  type="button"
                  className="btn add-button"
                  onClick={() => {
                    editCharges(editIndex);
                  }}
                >
                  Save changes
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <CreditNoteMail
        open={mailPopupOpen}
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
    </>
  );
};
// Multiple Vendor copy file
export default ResponsiveDialog;
