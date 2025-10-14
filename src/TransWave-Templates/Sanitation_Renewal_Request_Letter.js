import React, { useState, useEffect } from "react";
import "./Transwave-Templates-css/Sanitation_Renewal_Request_Letter.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
import {
  getPdaTemplateDataAPI,
  generateTemplate,
} from "../services/apiService";
const SanitationRenewalRequestLetter = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
  onSubmit,
  isEdit,
}) => {
  const [dataFromAPI, setDataFromAPI] = useState(null);

  const [date, setDate] = React.useState(null);
  const [attn, setAttn] = React.useState("");
  const [flag, setFlag] = React.useState("");
  const [arrivalCondition, setArrivalCondition] = React.useState("");
  const [masterName, setMasterName] = React.useState("");
  const [idNo, setIdNo] = React.useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  React.useEffect(() => {
    if (!dataFromAPI) return; // Prevent running if data is not loaded

    // Helper to convert dd/MM/yyyy string to Date object
    const parseDate = (str) => {
      if (!str) return null;
      const [day, month, year] = str.split("/");
      // JS Date expects yyyy-MM-dd for reliable parsing
      if (!day || !month || !year) return null;
      return new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );
    };

    setDate(parseDate(dataFromAPI.date));
    setAttn(dataFromAPI.attn || "");
    setFlag(dataFromAPI.flag || "");
    setArrivalCondition(dataFromAPI.arrivalCondition || "");
    setMasterName(dataFromAPI.masterName || "");
    setIdNo(dataFromAPI.idNo || "");
  }, [dataFromAPI]);

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

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

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    // Date is mandatory
    if (!date) {
      setMessage("Please select a date.");
      setOpenPopUp(true);
      return;
    }
    const payload = {
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      date: formatDate(date),
      attn,
      portRegistry: "MALAKAL HARBOR", // If you want this to be dynamic, add a state and input for it
      flag,
      arrivalCondition,
      masterName,
      idNo,
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
              <h5 className="twoktbsubhead">
                {" "}
                Sanitation Certificate Renewal Request
              </h5>
            </div>
            <div className="cont row d-flex  ">
              <div className="col-3 queheading">
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
              <div className="col-5 queheading">
                <div> Attn :</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  value={attn}
                  onChange={(e) => setAttn(e.target.value)}
                />
              </div>
            </div>

            {/* <div className="mt-3 mb-3">
              Kindly arrange to issue Ship Sanitation Control Exemption
              Certificate for the subject Vessel.
            </div>
            <div>Attached please find herewith the ship particulars.</div> */}

            <div className="dear">
              <div className="twoktbpassangerdetails mt-2">
                {/* <div className="date row mt-2">
                <div className="col-4 queheading">
                  <div> Vessel’s Name:</div>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                  ></input>
                </div>
                <div className="col-4 queheading">
                  <div> Type of vessel :</div>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                  ></input>
                </div>
                <div className="col-4 queheading">
                  <div> Port of registry:</div>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                  ></input>
                </div>
              </div> */}
                <div className="date row mt-2">
                  <div className="col-5 queheading">
                    <div> FLAG:</div>
                    <input
                      type="text"
                      className="form-control crewfontt"
                      id="exampleFormControlInput1"
                      placeholder=""
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                    />
                  </div>
                </div>
                <div className="date row mt-2">
                  <div className="col-4 queheading">
                    <div> Arrival Condition:</div>
                    <input
                      type="text"
                      className="form-control crewfontt"
                      id="exampleFormControlInput1"
                      placeholder=""
                      value={arrivalCondition}
                      onChange={(e) => setArrivalCondition(e.target.value)}
                    />
                  </div>
                  <div className="col-4 queheading">
                    <div> Master Name :</div>
                    <input
                      type="text"
                      className="form-control crewfontt"
                      id="exampleFormControlInput1"
                      placeholder=""
                      value={masterName}
                      onChange={(e) => setMasterName(e.target.value)}
                    />
                  </div>
                  <div className="col-4 queheading">
                    <div> ID No:</div>
                    <input
                      type="text"
                      className="form-control crewfontt"
                      id="exampleFormControlInput1"
                      placeholder=""
                      value={idNo}
                      onChange={(e) => setIdNo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="mt-3 mb-3">
              Vessel is already arrived at <strong>Khorfakkan anchorage</strong>{" "}
              on <strong>09/06/2023</strong> at<strong>0030HRS.</strong>
            </div>
            <div className="mt-3 mb-3">
              Original old Ship Sanitation Control Exemption certificate and
              disinfection and deratisation carried out onboard also enclosed.
            </div>
            <div>Charges applicable to be debited to our account.</div>
            <div className="mt-3">
              FOR,{" "}
              <p className="mt-2">
                TRANS WAVE MARINE SHIPPING SERVICES LLC SHJ-BR
              </p>
            </div> */}

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
      </Dialog>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default SanitationRenewalRequestLetter;
