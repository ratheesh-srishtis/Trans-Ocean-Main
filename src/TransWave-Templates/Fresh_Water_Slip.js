import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Transwave-Templates-css/Fresh_Water_Slip.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  getPdaTemplateDataAPI,
  generateTemplate,
} from "../services/apiService";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
const FreshWaterSlip = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
  onSubmit,
  isEdit,
}) => {
  // State for all required fields

  const [dataFromAPI, setDataFromAPI] = useState(null);

  const [date, setDate] = useState(null);
  const [tallyNo, setTallyNo] = useState("");
  const [position, setPosition] = useState("");
  const [n, setN] = useState("");
  const [e, setE] = useState("");
  const [nm, setNM] = useState("");
  const [flag, setFlag] = useState("");
  const [agent, setAgent] = useState("");
  const [owner, setOwner] = useState("");
  const [quantityDelivered, setQuantityDelivered] = useState("");
  const [remarks, setRemarks] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  // Add new states for requested fields
  const [quantityDeliveredTons, setQuantityDeliveredTons] = useState("");
  const [tenderAlongside, setTenderAlongside] = useState("");
  const [tenderStarted, setTenderStarted] = useState("");
  const [tenderCompleted, setTenderCompleted] = useState("");
  const [receivingMaster, setReceivingMaster] = useState("");
  const [tender, setTender] = useState("");
  const [masterName, setMasterName] = useState("");

  const getPdaTemplateData = async () => {
    try {
      let userData = {
        pdaChargeId: charge?._id,
        templateId: selectedTemplate,
      };
      const response = await getPdaTemplateDataAPI(userData);
      setDataFromAPI(response?.templateData);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  useEffect(() => {
    if (isEdit == true) {
      getPdaTemplateData();
    }
  }, [isEdit]);

  React.useEffect(() => {
    // Helper to convert dd/MM/yyyy string to Date object
    // Parse date string in dd/MM/yyyy format to JS Date
    const parseDate = (str) => {
      if (!str) return null;
      const [day, month, year] = str.split("/");
      // JS Date expects yyyy-MM-dd for reliable parsing
      if (!day || !month || !year) return null;
      return new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );
    };
    const safeData = dataFromAPI || {};
    setDate(safeData.date ? parseDate(safeData.date) : null);
    setTallyNo(typeof safeData.tallyNo === "string" ? safeData.tallyNo : "");
    setPosition(typeof safeData.position === "string" ? safeData.position : "");
    setN(typeof safeData.n === "string" ? safeData.n : "");
    setE(typeof safeData.e === "string" ? safeData.e : "");
    setNM(typeof safeData.nm === "string" ? safeData.nm : "");
    setFlag(typeof safeData.flag === "string" ? safeData.flag : "");
    setAgent(typeof safeData.agent === "string" ? safeData.agent : "");
    setOwner(typeof safeData.owner === "string" ? safeData.owner : "");
    setQuantityDelivered(
      typeof safeData.quantityDelivered === "string"
        ? safeData.quantityDelivered
        : ""
    );
    setRemarks(typeof safeData.remarks === "string" ? safeData.remarks : "");
    setQuantityDeliveredTons(
      typeof safeData.quantityDeliveredTons === "string"
        ? safeData.quantityDeliveredTons
        : ""
    );
    setTenderAlongside(
      typeof safeData.tenderAlongside === "string"
        ? safeData.tenderAlongside
        : ""
    );
    setTenderStarted(
      typeof safeData.tenderStarted === "string" ? safeData.tenderStarted : ""
    );
    setTenderCompleted(
      typeof safeData.tenderCompleted === "string"
        ? safeData.tenderCompleted
        : ""
    );
    setReceivingMaster(
      typeof safeData.receivingMaster === "string"
        ? safeData.receivingMaster
        : ""
    );
    setTender(typeof safeData.tender === "string" ? safeData.tender : "");
    setMasterName(
      typeof safeData.masterName === "string" ? safeData.masterName : ""
    );
  }, [dataFromAPI]);

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

  // Collect all values for API payload
  const handleSave = async () => {
    if (!date) {
      setMessage("Please select a date.");
      setOpenPopUp(true);
      return;
    }
    const payload = {
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      date: date ? date.toLocaleDateString("en-GB") : null,
      tallyNo,
      position,
      n,
      e,
      nm,
      flag,
      agent,
      owner,
      quantityDelivered,
      remarks,
      quantityDeliveredTons,
      tenderAlongside,
      tenderStarted,
      tenderCompleted,
      receivingMaster,
      tender,
      masterName,
    };
    console.log("API Payload:", payload);
    // TODO: Pass payload to API
    try {
      const response = await generateTemplate(payload);
      if (response?.status === true) {
        setIsLoading(false);
        setMessage("Template saved successfully!");
        setOpenPopUp(true);
        if (typeof onSubmit === "function") {
          onSubmit(response);
        }
        if (typeof onClose === "function") {
          onClose();
        }
      } else {
        setIsLoading(false);
        setMessage("Template failed. Please try again");
        setOpenPopUp(true);
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Template failed. Please try again");
      setOpenPopUp(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <div
          className="d-flex justify-content-between "
          onClick={() => onClose()}
        >
          {" "}
          <DialogTitle></DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>

        <DialogContent>
          <div className="mainoktb ">
            <div className=" d-flex justify-content-center">
              <h5 className="twoktbsubhead"> FRESH WATER RECEIPT</h5>
            </div>
            <div className="deartw mt-3 mb-3">
              <div className="cont row d-flex justify-content-between ">
                <div className="col-6 queheading">
                  <div> Date:</div>

                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={date}
                    onChange={setDate}
                    className="form-control answidth crewfontt"
                    placeholderText="Select date"
                    autoComplete="off"
                  />
                  <div className="invalid"></div>
                </div>

                <div className="col-6 queheading">
                  <div> Tally No:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={tallyNo}
                    onChange={(e) => setTallyNo(e.target.value)}
                    placeholder=""
                  />

                  <div className="invalid"></div>
                </div>
              </div>
              <div className="cont row d-flex justify-content-between ">
                <div className="col-3 queheading">
                  <div> Position:</div>

                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder=""
                  />
                  <div className="invalid"></div>
                </div>
                <div className="col-3 queheading">
                  <div> N:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={n}
                    onChange={(e) => setN(e.target.value)}
                    placeholder=""
                  />
                  <div className="invalid"></div>
                </div>
                <div className="col-3 queheading">
                  <div> E:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={e}
                    onChange={(ev) => setE(ev.target.value)}
                    placeholder=""
                  />
                  <div className="invalid"></div>
                </div>
                <div className="col-3 queheading">
                  <div> NM:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={nm}
                    onChange={(ev) => setNM(ev.target.value)}
                    placeholder=""
                  />
                  <div className="invalid"></div>
                </div>
              </div>
              <div className="cont row d-flex justify-content-between ">
                <div className="col-4 queheading">
                  <div> Flag:</div>

                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder=""
                  />
                  <div className="invalid"></div>
                </div>
                <div className="col-4 queheading">
                  <div> Agent:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={agent}
                    onChange={(e) => setAgent(e.target.value)}
                    placeholder=""
                  />
                  <div className="invalid"></div>
                </div>
                <div className="col-4 queheading">
                  <div> Owner:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder=""
                  />
                  <div className="invalid"></div>
                </div>
              </div>
            </div>
            <div className="dear">
              <div className="twoktbpassangerdetails mt-2">
                <div className="date row mt-2">
                  <div className="col-6 queheading">
                    <div> Qunatity Delivered:</div>
                    <input
                      type="number"
                      className="form-control crewfontt"
                      placeholder=""
                      value={quantityDelivered}
                      onChange={(e) => setQuantityDelivered(e.target.value)}
                    />
                    <div className="invalid"></div>
                  </div>
                  <div className="col-6 queheading">
                    <div>Quantity Delivered In Tons:</div>
                    <input
                      type="number"
                      className="form-control answidth crewfontt"
                      value={quantityDeliveredTons}
                      onChange={(e) => setQuantityDeliveredTons(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div>
                </div>
                <div className="cont row d-flex justify-content-between ">
                  <div className="col-6 queheading">
                    <div>Tender AlongSide:</div>
                    <input
                      type="text"
                      className="form-control answidth crewfontt"
                      value={tenderAlongside}
                      onChange={(e) => setTenderAlongside(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div>
                  <div className="col-6 queheading">
                    <div>Tender Started:</div>
                    <input
                      type="text"
                      className="form-control answidth crewfontt"
                      value={tenderStarted}
                      onChange={(e) => setTenderStarted(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div>
                </div>
                <div className="cont row d-flex justify-content-between ">
                  <div className="col-6 queheading">
                    <div>Tender Completed:</div>
                    <input
                      type="text"
                      className="form-control answidth crewfontt"
                      value={tenderCompleted}
                      onChange={(e) => setTenderCompleted(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div>
                  <div className="col-6 queheading">
                    <div>Recieving Master:</div>
                    <input
                      type="text"
                      className="form-control answidth crewfontt"
                      value={receivingMaster}
                      onChange={(e) => setReceivingMaster(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div>
                </div>
                <div className="cont row d-flex justify-content-between ">
                  <div className="col-6 queheading">
                    <div>Tender:</div>
                    <input
                      type="text"
                      className="form-control answidth crewfontt"
                      value={tender}
                      onChange={(e) => setTender(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div>
                  <div className="col-6 queheading">
                    <div>Master Name:</div>
                    <input
                      type="text"
                      className="form-control answidth crewfontt"
                      value={masterName}
                      onChange={(e) => setMasterName(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div>
                </div>
                <div className="date row">
                  <div className="col-12 queheading">
                    <div> Remarks:</div>
                    <textarea
                      className="form-control passwidth crewfontt "
                      rows={3}
                      value={remarks}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                </div>
                <div className="attention-section mt-2">
                  <div className="row date"></div>
                </div>
              </div>
            </div>

            <div className="footer-button d-flex justify-content-center mt-3">
              <button
                type="button"
                className="btn btncancel"
                onClick={() => onClose()}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn generate-buttona"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default FreshWaterSlip;
