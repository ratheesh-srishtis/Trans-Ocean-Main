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
import "../css/addcharges.css";
import "../css/editcharges.css";
import {
  getSubcharges,
  getCharges,
  markServiceRequestAsAdded,
  showServiceRequest,
  getPdaDetails,
} from "../services/apiService";
import PopUp from "./PopUp";
import { saveAs } from "file-saver";

const Servicerequests = ({ open, onClose, pdaResponse, services }) => {
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [requestedServices, setRequestedServices] = useState([]);
  const [charges, setCharges] = useState([]);
  const [subCharges, setSubCharges] = useState([]);
  const [pdaDetails, setPdaDetails] = useState(null);
  const [pdaServices, setpdaServices] = useState(null);
  const fetchPdaDetails = async () => {
    let data = {
      pdaId: pdaResponse?._id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      console.log(pdaDetails, "pdaDetails");
      setPdaDetails(pdaDetails?.pda);
      setpdaServices(pdaDetails?.pdaServices);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(open, "open");
    if (open == true) {
      fetchPdaDetails();
    }
  }, [open]);

  // const [fetchedCharges, setFetchedCharges] = useState(new Set());
  // const [fetchedSubCharges, setFetchedSubCharges] = useState(new Set());

  // // Fetch charges
  // useEffect(() => {
  //   const uniqueChargeIds = new Set(
  //     requestedServices?.map((service) => service.serviceId).filter(Boolean)
  //   );

  //   uniqueChargeIds.forEach((id) => {
  //     if (!fetchedCharges.has(id)) {
  //       fetchCharges(id);
  //     }
  //   });
  // }, [requestedServices, fetchedCharges]);

  // // Fetch subcharges
  // useEffect(() => {
  //   const uniqueSubChargeIds = new Set(
  //     requestedServices?.map((service) => service.chargeId).filter(Boolean)
  //   );

  //   uniqueSubChargeIds.forEach((id) => {
  //     if (!fetchedSubCharges.has(id)) {
  //       fetchSubCharges(id);
  //     }
  //   });
  // }, [requestedServices, fetchedSubCharges]);

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

  // useEffect(() => {
  //   console.log(fetchedSubCharges, "fetchedSubCharges");
  //   console.log(subCharges, "subCharges");
  // }, [fetchedSubCharges, subCharges]);

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

  const markAsRead = async (data) => {
    console.log(data, "markAsRead");
    let payload = {
      requestId: data?._id,
    };
    try {
      const response = await markServiceRequestAsAdded(payload);
      if (response?.status == true) {
        setMessage("Service deleted successfully!");
        setOpenPopUp(true);
        fetchServiceRequest(pdaResponse?._id);
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
    }
  };

  const fetchServiceRequest = async (id) => {
    // alert(id);
    if (id) {
      let data = {
        pdaId: id,
      };
      try {
        const serviceRequests = await showServiceRequest(data);
        setRequestedServices(serviceRequests?.serviceRequests);
        console.log("serviceRequestsMain", serviceRequests?.serviceRequests);
      } catch (error) {
        console.error("Failed to fetch quotations:", error);
      }
    }
  };

  useEffect(() => {
    fetchServiceRequest(pdaResponse?._id);
  }, [pdaResponse?._id]);

  useEffect(() => {
    console.log(requestedServices, "requestedServices_serviceRequest");
    console.log(subCharges, "subCharges_serviceRequest");
  }, [requestedServices, subCharges]);

  const getItemName = (id, name) => {
    console.log(id, "id_getItemName");
    if (name == "service" && id) {
      const service = services.find((s) => s._id === id);
      return service ? service.serviceName : "Unknown Service";
    } else if (name == "chargeType" && id) {
      const charge = charges.find((s) => s._id === id);
      return charge ? charge.chargeName : "Unknown charge";
    } else if (name == "subChargeType" && id) {
      console.log(id, "id_getItemName_subChargeType");
      console.log(subCharges, "subCharges_getItemName");

      const subCharge = subCharges.find((s) => s._id === id);
      return subCharge ? subCharge?.subchargeName : "Unknown subCharge";
    }
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
        <div className="d-flex justify-content-between" onClick={onClose}>
          <DialogTitle>Service Request</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "60px" }}>
          <>
            <div className="Anchoragecall">
              {requestedServices?.length > 0 && (
                <>
                  {requestedServices.map((charge, index) => {
                    return (
                      <>
                        <div className="marinetable mt-4 mb-4">
                          <div className="tablehead">
                            {charge?.serviceId?.serviceName}
                          </div>
                          <div className="row mb-3">
                            <div className="col-8">
                              <span className="marinehead">Charge type:</span>
                              <span className="subvalue">
                                {charge?.chargeId?.chargeName}
                              </span>
                            </div>
                            <div className="col-3">
                              <span className="marinehead">Quantity:</span>
                              <span className="subvalue">
                                {charge?.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-8">
                              <div className="mt-2">
                                <span className="marinehead">
                                  Sub charge Type:
                                </span>
                                <span className="subvalue">
                                  {charge?.subchargeId?.subchargeName}
                                </span>
                              </div>
                            </div>
                            <div className="col-4 marinehead">
                              <button
                                type="button"
                                className="btn mark-button text-center"
                                onClick={() => {
                                  markAsRead(charge);
                                }}
                              >
                                Mark As Read
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </>
              )}

              {requestedServices?.length == 0 && (
                <p>No Requested Services are available</p>
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

export default Servicerequests;
