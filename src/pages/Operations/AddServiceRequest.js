// ResponsiveDialog.js
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
import "../../css/addcharges.css";
import "../../css/editcharges.css";
import {
  getSubcharges,
  getCharges,
  requestForNewService,
} from "../../services/apiService";
import { saveAs } from "file-saver";
import PopUp from "../PopUp";

const AddServiceRequest = ({
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

  const [selectedServiceError, setSelectedServiceError] = useState(false);
  const [selectedChargesTypeError, setSelectedChargesTypeError] =
    useState(false);
  const [selectedSubhargesTypeError, setSelectedSubhargesTypeError] =
    useState(false);
  const [selectedQuantityError, setSelectedQuantityError] = useState(false);

  const [firstFieldSelected, setFirstFieldSelected] = useState(false);
  const [secondFieldSelected, setSecondFieldSelected] = useState(false);
  const [thirdFieldSelected, setThirdFieldSelected] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedChargesType, setSelectedChargesType] = useState(null);
  const [selectedSubhargesType, setSelectedSubhargesType] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);

  const [remarks, setRemarks] = useState(null);
  const [charges, setCharges] = useState([]);
  const [subCharges, setSubCharges] = useState([]);
  const [isPrivateVendor, setIsPrivateVendor] = useState(false);
  const [chargesArray, setChargesArray] = useState([]);
  const [displayChargesArray, setDisplayChargesArray] = useState([]);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
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
      return service ? service.serviceName : "Unknown Service";
    } else if (name == "customer" && id) {
      const customer = customers.find((s) => s._id === id);
      return customer ? customer.customerName : "Unknown Customer";
    } else if (name == "vendor" && id) {
      const vendor = vendors.find((s) => s._id === id);
      return vendor ? vendor.vendorName : "Unknown vendor";
    } else if (name == "chargeType" && id) {
      const charge = charges.find((s) => s._id === id);
      console.log(charge, "chargegetItemName");
      return charge ? charge.chargeName : "Unknown charge";
    } else if (name == "subChargeType" && id) {
      const subCharge = subCharges.find((s) => s._id === id);
      return subCharge ? subCharge.subchargeName : "Unknown subCharge";
    }
  };

  const addNewService = async (remark) => {
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
    if (
      selectedService &&
      selectedChargesType &&
      selectedSubhargesType &&
      selectedQuantity
    ) {
      let newServices = {
        serviceId: selectedService?._id,
        chargeId: selectedChargesType?._id,
        subchargeId: selectedSubhargesType?._id,
        quantity: selectedQuantity,
      };
      let chargesToDisplay = {
        serviceName: selectedService?.serviceName,
        chargeName: selectedChargesType?.chargeName,
        subChargeName: selectedSubhargesType?.subchargeName,
        quantity: selectedQuantity,
      };
      setChargesArray((prev) => [...prev, newServices]);
      setDisplayChargesArray((prev) => [...prev, chargesToDisplay]);
      resetCharges();
    }
  };

  useEffect(() => {
    console.log(displayChargesArray, "displayChargesArray");
    console.log(selectedSubhargesType, "selectedSubhargesType");
  }, [displayChargesArray, selectedSubhargesType]);
  const saveNewService = async (remark) => {
    if (pdaResponse?._id) {
      let payload = {
        pdaId: pdaResponse?._id,
        charges: chargesArray,
      };
      try {
        const response = await requestForNewService(payload);
        if (response?.status == true) {
          setMessage("Services added successfully!");
          setOpenPopUp(true);
          resetCharges();
          resetChargesArray();
          setDisplayChargesArray([]);
          onSubmit();
        }
      } catch (error) {
        console.error("Error fetching charges:", error);
      }
    }
  };

  const resetCharges = () => {
    setFirstFieldSelected(false);
    setSecondFieldSelected(false);
    setThirdFieldSelected(false);
    setSelectedService("");
    setSelectedChargesType("");
    setSelectedSubhargesType("");
    setSelectedQuantity("");
  };

  const resetChargesArray = () => {
    setChargesArray([]);
  };

  const handleClose = () => {
    resetCharges();
    onClose();
  };

  useEffect(() => {
    console.log(selectedChargesType, "selectedChargesType");
  }, [selectedChargesType]);

  return (
    <>
      <Dialog
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
        <div className="d-flex justify-content-between">
          <DialogTitle>Add Services</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg  " onClick={handleClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "60px" }}>
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
                        key={selectedService ? selectedService?._id : "default"}
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
                        value={
                          selectedChargesType?._id
                            ? selectedChargesType?._id
                            : ""
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
                        <div className="invalid">Please select charge type</div>
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
                        value={
                          selectedSubhargesType?._id
                            ? selectedSubhargesType?._id
                            : ""
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
                          Please select sub charge type
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="qq">
                <div className="col-4 qtywidth">
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

              <div className="col-12 mt-5">
                <div className="footer-button d-flex justify-content-center ">
                  {chargesArray.length == 0 && (
                    <>
                      <button
                        type="button"
                        className="btn btncancel"
                        onClick={handleClose}
                      >
                        Cancel{" "}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn  generate-buttona "
                    onClick={() => {
                      addNewService();
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
              {displayChargesArray?.length > 0 && (
                <>
                  {displayChargesArray.map((charge, index) => (
                    <>
                      <div className="marinetable mt-4 mb-4">
                        <div className="tablehead">{charge?.serviceName}</div>

                        <div className="row mb-3">
                          <div className="col-8">
                            <span className="marinehead">Charge type:</span>
                            <span className="subvalue">
                              {charge?.chargeName}
                            </span>
                          </div>
                          <div className="col-4">
                            <span className="marinehead">Quantity:</span>
                            <span className="subvalue">{charge?.quantity}</span>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-12">
                            <div className="mt-2">
                              <span className="marinehead">
                                Sub charge Type:
                              </span>
                              <span className="subvalue">
                                {charge?.subChargeName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}

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
                            saveNewService();
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        </DialogContent>
      </Dialog>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
    </>
  );
};

export default AddServiceRequest;
