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
import { useAuth } from "../context/AuthContext";
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
  console.log(pdaResponse, "pdaResponse_dialog");
  console.log(selectedCustomer, "selectedCustomer pdaResponse_dialog");
  const { loginResponse } = useAuth();

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
  const [vendorAmountError, setVendorAmountError] = useState(false);
  const [vendorTotalUSDError, setVendorTotalUSDError] = useState(false);
  const [vendorVatAmountError, setVendorVatAmountError] = useState(false);
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
  const [vendorTotalUSD, setVendorTotalUSD] = useState(null);
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
    } else if (name === "vendorAmount") {
      // alert(value, name);
      setVendorAmount(value);
      setVendorAmountError(false);
      setIsVendorUserInput(false);
    } else if (name === "vendorOmrAmount") {
      setVendorOmrAmount(value);
    } else if (name === "vendorVatAmount") {
      setVendorVatAmount(value);
      setVendorVatAmountError(false);
      setIsVendorUserInput(false);
    } else if (name === "vendorTotalUSD") {
      setVendorTotalUSD(value);
      setVendorTotalUSDError(false);
    } else if (name === "customerTotalUSD") {
      setCustomerTotalUSD(value);
      setCustomerTotalUSDError(false);
      setIsUserInput(true); // Flag this as user input
    } else if (name === "vendorTotalUSD") {
      setVendorTotalUSD(value);
      setIsVendorUserInput(true);
    } else if (name === "remarks") {
      setRemarks(value);
    } else if (name === "creditNote") {
      setCreditNote(value);
      setIsUserInput(false);
      console.log(originalCustomerAmount, "originalCustomerAmount");
      setCustomerAmount((originalCustomerAmount - value)?.toFixed(3)); // adjust from original
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

    // if (!selectedVendor || selectedVendor === "" || !selectedVendor) {
    //   setSelectedVendorError(true);
    // } else {
    //   setSelectedVendorError(false);
    // }

    // if (!vendorAmount || vendorAmount === "" || !vendorAmount) {
    //   setVendorAmountError(true);
    // } else {
    //   setVendorAmountError(false);
    // }

    // if (!vendorTotalUSD || vendorTotalUSD === "" || !vendorTotalUSD) {
    //   setVendorTotalUSDError(true);
    // } else {
    //   setVendorTotalUSDError(false);
    // }

    // if (!vendorVatAmount || vendorVatAmount === "" || !vendorVatAmount) {
    //   setVendorVatAmountError(true);
    // } else {
    //   setVendorVatAmountError(false);
    // }

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
      customerTotalUSD
    ) {
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
        vendorId: selectedVendor?._id
          ? selectedVendor?._id
          : selectedVendor?.vendorId,
        customerOMR: Number(customerAmount),
        customerVAT: Number(customerVatAmount),
        customerTotalUSD: Number(customerTotalUSD),
        vendorOMR: Number(vendorAmount),
        vendorVAT: Number(vendorVatAmount),
        vendorTotalUSD: Number(vendorTotalUSD),
        isPrivateVendor: isPrivateVendor,
        remark: remarks,
        pdaChargeId: pdaResponse?._id ? pdaResponse?._id : null,
        serviceName: selectedService?.serviceName,
        chargeName: selectedChargesType?.chargeName,
        subchargeName: selectedSubhargesType?.subchargeName,
        // ✅ Add unique ID here
        uniqueId: generateUniqueId(),
      };
      const updatedChargesArray = [...chargesArray, chargesPayload];
      setChargesArray(updatedChargesArray);
      console.log(updatedChargesArray, "updatedChargesArray addNewCharge");
      let updatedSavedChargesArray;
      if (finalChargesArray.length === 0) {
        // If finalChargesArray is empty, add chargesArray objects and chargesPayload to savedChargesArray
        updatedSavedChargesArray = [...updatedChargesArray];
        console.log(
          updatedSavedChargesArray,
          "updatedSavedChargesArray if block"
        );
      } else {
        // If finalChargesArray already has objects, add only finalChargesArray objects and chargesPayload
        updatedSavedChargesArray = [
          ...finalChargesArray,
          ...updatedChargesArray,
        ];
        console.log(
          updatedSavedChargesArray,
          "updatedSavedChargesArray else block"
        );
      }
      console.log(updatedSavedChargesArray, "updatedSavedChargesArray");
      // Update savedChargesArray with the new array
      setSavedChargesArray(updatedSavedChargesArray);

      // Also update finalChargesArray with the new charge
      console.log(chargesArray, "chargesArray newCharge");
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

    // if (selectedVendor == null || selectedVendor === "") {
    //   setSelectedVendorError(true);
    // } else {
    //   setSelectedVendorError(false);
    // }

    // if (vendorAmount == null || vendorAmount === "") {
    //   setVendorAmountError(true);
    // } else {
    //   setVendorAmountError(false);
    // }

    // if (vendorTotalUSD == null || vendorTotalUSD === "") {
    //   setVendorTotalUSDError(true);
    // } else {
    //   setVendorTotalUSDError(false);
    // }

    // if (vendorVatAmount == null || vendorVatAmount === "") {
    //   setVendorVatAmountError(true);
    // } else {
    //   setVendorVatAmountError(false);
    // }

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
      let chargesPayload = {
        serviceId: selectedService?.serviceId || selectedService?._id,
        chargeId: selectedChargesType?.chargeId || selectedChargesType?._id,
        subchargeId:
          selectedSubhargesType?.subchargeId || selectedSubhargesType?._id,
        quantity: selectedQuantity,
        customerId: selectedNewCustomer?.customerId || selectedNewCustomer?._id,
        vendorId: selectedVendor?.vendorId || selectedVendor?._id,
        customerOMR: Number(customerAmount),
        customerVAT: Number(customerVatAmount),
        customerTotalUSD: Number(customerTotalUSD),
        vendorOMR: Number(vendorAmount),
        vendorVAT: Number(vendorVatAmount),
        vendorTotalUSD: Number(vendorTotalUSD),
        isPrivateVendor: isPrivateVendor,
        remark: remarks,
        pdaChargeId: editCharge?._id
          ? editCharge?._id
          : editCharge?.pdaChargeId,
        // serviceName: getItemName(selectedService?.serviceId, "service"),
        // chargeName: getItemName(selectedChargesType?.chargeId, "chargeType"),
        // subchargeName: getItemName(
        //   selectedSubhargesType?.subchargeId,
        //   "subChargeType"
        // ),
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
    console.log(vendorAmount, "vendorAmount");
    console.log(vendorOmrAmount, "vendorOmrAmount");
    console.log(vendorTotalUSD, "vendorTotalUSD");
    console.log(vendorVatAmount, "vendorVatAmount");
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
    vendorAmount,
    vendorOmrAmount,
    vendorTotalUSD,
    vendorVatAmount,
  ]);

  useEffect(() => {
    setCustomerTotalUSDError(false);
  }, [customerTotalUSD]);

  // Recalculate only if user input flag is false
  useEffect(() => {
    console.log(isUserInput, "isUserInput");
    if (!isUserInput) {
      let total = Number(customerAmount) + Number(customerVatAmount);
      // setCustomerTotalOmr(total.toFixed(3));
      console.log(total, "total customerAmount + customerVatAmount");
      // let customer_total_usd = Number(total * 2.62);
      let customer_total_usd;
      customer_total_usd = Number(total * 2.62);
      setCustomerTotalUSD(customer_total_usd.toFixed(3));
    }
    let total = Number(customerAmount) + Number(customerVatAmount);
    setCustomerTotalOmr(total.toFixed(3));
  }, [customerAmount, customerVatAmount, isUserInput]);

  // Reset the user input flag whenever the value is updated programmatically
  // useEffect(() => {
  //   console.log(customerTotalUSD, "customerTotalUSD");
  //   setIsUserInput(false);
  // }, [customerAmount, customerVatAmount]);

  useEffect(() => {
    console.log(isVendorUserInput, "isVendorUserInput");

    if (!isVendorUserInput) {
      let total = Number(vendorAmount) + Number(vendorVatAmount);
      // setVendorTotalOmr(total.toFixed(3));

      // let vendor_total_usd = Number(total * 2.62);
      let vendor_total_usd;

      vendor_total_usd = Number(total * 2.62);

      setVendorTotalUSD(vendor_total_usd.toFixed(3));
    }
    let total = Number(vendorAmount) + Number(vendorVatAmount);
    setVendorTotalOmr(total.toFixed(3));
  }, [vendorAmount, vendorVatAmount, isVendorUserInput]);

  // useEffect(() => {
  //   setIsVendorUserInput(false);
  // }, [vendorAmount, vendorVatAmount]);

  const submitEditCharges = () => {};

  useEffect(() => {
    console.log(chargesArray, "chargesArray");
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
    setVendorTotalUSD("");
    setRemarks("");
    setIsPrivateVendor(false);
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
      setCustomerTotalUSD(editCharge?.customerTotalUSD);
      setVendorTotalUSD(editCharge?.vendorTotalUSD);
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
    console.log(selectedNewCustomer, "selectedNewCustomer");
    console.log(customerTotalUSDError, "customerTotalUSDError");
  }, [selectedNewCustomer, customerTotalUSDError]);

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
          <div className="closeicon" onClick={onClose}>
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "60px" }}>
          {isEditcharge == false && (
            <>
              <div className="Anchoragecall">
                {/* <div className="Callhead">Service: Anchorage Call</div> */}
                <div className="row ">
                  <div className="row align-items-start">
                    <div className="col-md-4">
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

                    <div className="col-md-4">
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

                    <div className="col-md-4">
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

                <div className="qq">
                  <div className="col-4">
                    <div className="mb-3">
                      <div className="col mt-2">
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
                </div>

                <div className="customerhead">
                  <div className="headname">Customer Charges</div>
                  <div className="customerrectangle"></div>
                </div>
                <div className="row ">
                  <div className="row align-items-start">
                    <div className="col">
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
                    <div className="col">
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
                    <div className="col-4  ">
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
                    <div className="col-4">
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
                <div className="row ">
                  <div className="row align-items-start">
                    <div className="col">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Vendor:
                      </label>
                      <div className="vessel-select">
                        <select
                          name="vendor"
                          className="form-select vesselbox"
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={selectedVendor?._id ? selectedVendor?._id : ""}
                        >
                          <option value="">Choose Vendor</option>
                          {vendors?.map((vendor) => (
                            <option key={vendor._id} value={vendor._id}>
                              {vendor.vendorName}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* {selectedVendorError && (
                        <>
                          <div className="invalid">Please select vendor</div>
                        </>
                      )} */}
                    </div>
                    <div className="col">
                      <div className="mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            Amount(OMR):
                          </label>
                          <input
                            type="number"
                            className="form-control vessel-voyage"
                            id="exampleFormControlInput1"
                            placeholder=""
                            name="vendorAmount"
                            value={vendorAmount}
                            onChange={handleInputChange}
                          />
                        </div>
                        {/* {vendorAmountError && (
                          <>
                            <div className="invalid">Please enter amount</div>
                          </>
                        )} */}
                      </div>
                    </div>
                    <div className="col">
                      <div className="mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            VAT Amount:
                          </label>
                          <input
                            type="number"
                            className="form-control vessel-voyage"
                            id="exampleFormControlInput1"
                            placeholder=""
                            name="vendorVatAmount"
                            value={vendorVatAmount}
                            onChange={handleInputChange}
                            onWheel={handleWheel}
                          />
                        </div>
                        {/* {vendorVatAmountError && (
                          <>
                            <div className="invalid">
                              Please enter vat amount
                            </div>
                          </>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row ">
                  <div className="row align-items-start">
                    <div className="col-4  ">
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
                            name="vendorOmrAmount"
                            value={vendorTotalOmr}
                            disabled
                            onWheel={handleWheel}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
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
                            name="vendorTotalUSD"
                            value={vendorTotalUSD}
                            onChange={handleInputChange}
                            onWheel={handleWheel}
                          />
                        </div>
                        {/* {vendorTotalUSDError && (
                          <>
                            <div className="invalid">
                              Please enter total usd
                            </div>
                          </>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="row">
                  <div className="col-4">
                    <div className="form-check pvendor">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="flexCheckDefault"
                        checked={isPrivateVendor}
                        onChange={handleCheckboxChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flexCheckDefault"
                      >
                        Private Vendor
                      </label>
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
                            <div className="col-6">
                              <span className="marinehead">Charge type:</span>
                              <span className="subvalue">
                                {/* {getItemName(
                                  charge?.subchargeId,
                                  "subChargeType"
                                )} */}
                                {charge?.chargeName}
                              </span>
                            </div>
                            <div className="col-6">
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
                            <div className="col-6 table_seperation">
                              <span className="marinehead marineBold">
                                Customer:
                              </span>
                              <span className="subvalue marineBold">
                                {getItemName(charge?.customerId, "customer")}
                              </span>
                            </div>
                            <div className="col-6">
                              <span className="marinehead marineBold">
                                Vendor:
                              </span>
                              <span className="subvalue marineBold">
                                {" "}
                                {getItemName(charge?.vendorId, "vendor") ||
                                  "N/A"}
                              </span>
                            </div>

                            <div className="omr col-6 table_seperation">
                              <span className="marinehead">Amount (OMR):</span>
                              <span className="subvalue">
                                {charge.customerOMR.toFixed(3)}
                              </span>
                            </div>
                            <div className="omr col-6">
                              <span className="marinehead">Amount (OMR):</span>
                              <span className="subvalue">
                                {charge.vendorOMR.toFixed(3)}
                              </span>
                            </div>

                            <div className="vat col-6 table_seperation">
                              <span className="marinehead">VAT Amount:</span>
                              <span className="subvalue">
                                {charge.customerVAT.toFixed(3)}
                              </span>
                            </div>
                            <div className="vat col-6">
                              <span className="marinehead">VAT Amount:</span>
                              <span className="subvalue">
                                {charge.vendorVAT.toFixed(3)}
                              </span>
                            </div>

                            <div className="omr col-6 table_seperation">
                              <span className="marinehead">Total (OMR):</span>
                              <span className="subvalue">
                                {(
                                  Number(charge.customerOMR) +
                                  Number(charge.customerVAT)
                                ).toFixed(3)}
                              </span>
                            </div>
                            <div className="omr col-6">
                              <span className="marinehead">Total (OMR):</span>
                              <span className="subvalue">
                                {(
                                  Number(charge.vendorOMR) +
                                  Number(charge.vendorVAT)
                                ).toFixed(3)}
                              </span>
                            </div>

                            <div className="vat col-6 table_seperation">
                              <span className="marinehead">Total USD:</span>
                              <span className="subvalue">
                                {charge.customerTotalUSD.toFixed(3)}
                              </span>
                            </div>
                            <div className="vat col-6">
                              <span className="marinehead">Total USD:</span>
                              <span className="subvalue">
                                {charge.vendorTotalUSD.toFixed(3)}
                              </span>
                            </div>

                            {charge?.isPrivateVendor && (
                              <>
                                <div className="vat col-6 ">
                                  <div className="marinehead d-flex vendor-class">
                                    <input
                                      className="form-check-inpu "
                                      type="checkbox"
                                      id="flexCheckDefault"
                                      checked={charge?.isPrivateVendor}
                                      value={charge?.isPrivateVendor}
                                      readOnly
                                    />
                                    <span className="ml-2 left-spc">
                                      <label
                                        className="form-check-label "
                                        htmlFor="flexCheckDefault"
                                      >
                                        Private Vendor
                                      </label>
                                    </span>
                                  </div>
                                </div>
                              </>
                            )}
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

                          {/* <div key={index} className="tablesep">
                            <div className="col">
                              <div className="subh">
                                <span className="marinehead">Charge Type:</span>
                                <span className="subvalue">
                                  {" "}
                                  {getItemName(
                                    charge?.chargeId,
                                    "chargeType"
                                  )}{" "}
                                </span>
                              </div>
                              <div className="subh">
                                <span className="marinehead">
                                  Sub charge Type:
                                </span>
                                <span className="subvalue">
                                  {getItemName(
                                    charge?.subchargeId,
                                    "subChargeType"
                                  )}
                                </span>
                              </div>
                              <div className="subh">
                                <span className="marinehead">Customer:</span>
                                <span className="subvalue">
                                  {getItemName(charge?.customerId, "customer")}
                                </span>
                              </div>
                              <div className="subh d-flex">
                                <div className="omr">
                                  <span className="marinehead">
                                    Amount (OMR):
                                  </span>
                                  <span className="subvalue">
                                    {charge.customerOMR}
                                  </span>
                                </div>
                                <div className="vat ms-5">
                                  <span className="marinehead">
                                    VAT Amount:
                                  </span>
                                  <span className="subvalue">
                                    {charge.customerVAT}
                                  </span>
                                </div>
                              </div>
                              <div className="subh d-flex">
                                <div className="omr">
                                  <span className="marinehead">
                                    Total (OMR):
                                  </span>
                                  <span className="subvalue">
                                    {Number(charge.customerOMR) +
                                      Number(charge.customerVAT)}
                                  </span>
                                </div>
                                <div className="vat ms-5">
                                  <span className="marinehead">Total USD:</span>
                                  <span className="subvalue">
                                    {charge.customerTotalUSD}
                                  </span>
                                </div>
                              </div>
                              <div className="subh d-flex">
                                <div className="marinehead">
                                  <div className="form-check pvendor">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="flexCheckDefault"
                                      checked={charge?.isPrivateVendor}
                                      value={charge?.isPrivateVendor}
                                      readOnly
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="flexCheckDefault"
                                    >
                                      Private Vendor
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="subheadremarks">
                                <span className="marinehead">Remarks:</span>
                                <span className="subvalue">
                                  {charge.remark}
                                </span>
                              </div>
                            </div>
                            <div className="marineseperation"></div>
                            <div className="col">
                              <div className="subhvendor d-flex justify-content-start">
                                <span className="marinehead">Quantity:</span>
                                <span className="subvalue">
                                  {charge.quantity}
                                </span>
                              </div>
                              <div className="subhvendor d-flex justify-content-start">
                                <span className="marinehead">Vendor:</span>
                                <span className="subvalue">
                                  {" "}
                                  {getItemName(charge?.vendorId, "vendor")}{" "}
                                </span>
                              </div>
                              <div className="subhvendor d-flex justify-content-start">
                                <div className="omr">
                                  <span className="marinehead">
                                    Amount (OMR):
                                  </span>
                                  <span className="subvalue">
                                    {charge.vendorOMR}
                                  </span>
                                </div>
                                <div className="vat ms-5">
                                  <span className="marinehead">
                                    VAT Amount:
                                  </span>
                                  <span className="subvalue">
                                    {charge.vendorVAT}
                                  </span>
                                </div>
                              </div>
                              <div className="subhvendor d-flex justify-content-start">
                                <div className="omr">
                                  <span className="marinehead">
                                    Total (OMR):
                                  </span>
                                  <span className="subvalue">
                                    {Number(charge.vendorOMR) +
                                      Number(charge.vendorVAT)}
                                  </span>
                                </div>
                                <div className="vat ms-5">
                                  <span className="marinehead">Total USD:</span>
                                  <span className="subvalue">
                                    {charge.vendorTotalUSD}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div> */}
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

              <div className="row ">
                <div className="col-2 ms-auto">
                  <div className="form-check pvendor">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="flexCheckDefault"
                      checked={isPrivateVendor}
                      onChange={handleCheckboxChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexCheckDefault"
                    >
                      Private Vendor
                    </label>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-6 ">
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
                  </div>
                </div>
                <div className="col-6">
                  <div className="marinetableadd">
                    <div className="tablehead">Vendor Charges</div>
                    <div className="row cust">
                      <div className="col-5">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label labelhead"
                        >
                          Vendor:
                        </label>
                      </div>
                      <div className="col-7  justify-content-start ">
                        <select
                          name="vendor"
                          className="form-select vesselbox"
                          onChange={handleSelectChange}
                          aria-label="Default select example"
                          value={
                            selectedVendor?.vendorId || selectedVendor?._id
                          }
                        >
                          <option value="">Choose Vendor</option>
                          {vendors?.map((vendor) => (
                            <option key={vendor._id} value={vendor._id}>
                              {vendor.vendorName}
                            </option>
                          ))}
                        </select>
                        {/* {selectedVendorError && (
                          <>
                            <div className="invalid">Please select vendor</div>
                          </>
                        )} */}
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
                      <div className="col-7  justify-content-start ">
                        <input
                          type="number"
                          className="form-control labelbox"
                          id="exampleFormControlInput1"
                          placeholder=""
                          name="vendorAmount"
                          value={vendorAmount}
                          onChange={handleInputChange}
                        />
                        {/* {vendorAmountError && (
                          <>
                            <div className="invalid">Please enter amount</div>
                          </>
                        )} */}
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
                          name="vendorVatAmount"
                          value={vendorVatAmount}
                          onChange={handleInputChange}
                          onWheel={handleWheel}
                        />
                        {/* {vendorVatAmountError && (
                          <>
                            <div className="invalid">
                              Please enter vat amount
                            </div>
                          </>
                        )} */}
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
                          name="vendorOmrAmount"
                          value={vendorTotalOmr}
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
                          name="vendorTotalUSD"
                          value={vendorTotalUSD}
                          onChange={handleInputChange}
                          onWheel={handleWheel}
                        />
                        {/* {vendorTotalUSDError && (
                          <>
                            <div className="invalid">
                              Please enter total usd
                            </div>
                          </>
                        )} */}
                      </div>
                    </div>
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
              {/* {pdaResponse?.pdaStatus != 7 && (
                <>
                 
                </>
              )} */}
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

export default ResponsiveDialog;
