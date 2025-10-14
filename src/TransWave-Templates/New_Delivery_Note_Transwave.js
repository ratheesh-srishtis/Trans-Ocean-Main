import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Transwave-Templates-css/New_Delivery_Note_Transwave.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  generateTemplate,
  getPdaTemplateDataAPI,
} from "../services/apiService";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
const NewDeliveryNoteTranswave = ({
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

  // State for all required fields
  const [date, setDate] = useState(null);
  const [referenceNo, setReferenceNo] = useState("");
  // Removed vesselName and portName
  const [client, setClient] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state

  // Array for Description, Quantity, Remarks
  const [items, setItems] = useState([
    { description: "", qty: "", remark: "" },
  ]);

  // Helper to convert yyyy-MM-dd string to Date object for DatePicker
  // Helper to convert dd/MM/yyyy string to Date object for DatePicker
  const parseDateForPicker = (str) => {
    if (!str) return null;
    // Expecting format dd/MM/yyyy
    const parts = str.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  };
  // Helper to convert Date object to dd/MM/yyyy string for DatePicker display
  const formatDateForPicker = (dateObj) => {
    if (!dateObj) return "";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };
  // Helper to convert Date object to dd/MM/yyyy for saving
  const formatDateForSave = (dateObj) => {
    if (!dateObj) return null;
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const addItem = () => {
    setItems([...items, { description: "", qty: "", remark: "" }]);
  };

  const deleteItem = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (idx, field, value) => {
    setItems(
      items.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

  // Collect all values for API payload
  const handleSave = async () => {
    if (!date) {
      setMessage("Please select a date");
      setOpenPopUp(true);
      return;
    }
    const payload = {
      date: formatDateForSave(date), // Now dd/MM/yyyy
      customCode,
      items: items.map((item) => ({ ...item })),
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
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

  useEffect(() => {
    console.log(dataFromAPI, "dataFromAPI");
  }, [dataFromAPI]);

  React.useEffect(() => {
    // Defensive checks for API data
    const safeData = dataFromAPI || {};
    setDate(safeData.date ? parseDateForPicker(safeData.date) : null);
    // setReferenceNo(
    //   typeof safeData.referenceNo === "string" ? safeData.referenceNo : ""
    // );
    // setClient(typeof safeData.client === "string" ? safeData.client : "");
    setCustomCode(
      typeof safeData.customCode === "string" ? safeData.customCode : ""
    );
    setItems(
      Array.isArray(safeData.items) && safeData.items.length > 0
        ? safeData.items.map((item) => ({
            description:
              typeof item.description === "string" ? item.description : "",
            qty: typeof item.qty === "string" ? item.qty : "",
            remark: typeof item.remark === "string" ? item.remark : "",
          }))
        : [{ description: "", qty: "", remark: "" }]
    );
  }, [dataFromAPI]);

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
              <h5 className="twoktbsubhead"> DELIVERY NOTE</h5>
            </div>
            <div className="deartw mt-3 mb-3">
              <div className="cont row d-flex justify-content-between ">
                <div className="col-6 queheading">
                  <div> Date:</div>

                  <DatePicker
                    dateFormat="dd-MM-yyyy"
                    selected={date}
                    onChange={setDate}
                    className="form-control answidth crewfontt"
                    placeholderText="Select date"
                    autoComplete="off"
                  />
                  <div className="invalid"></div>
                </div>

                {/* <div className="col-6 queheading">
                  <div> Reference No:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder=""
                  />

                  <div className="invalid"></div>
                </div> */}
              </div>
            </div>
            <div className=" d-flex justify-content-center">
              <h5 className="twoktbsubhead"> Collection Note</h5>
            </div>

            <div className="dear">
              <div className="twoktbpassangerdetails mt-2">
                {/* Vessel Name and Port Name fields removed */}
                <div className="date row mt-2">
                  {/* <div className="col-5 queheading">
                    <div> Client:</div>
                    <input
                      type="text"
                      className="form-control crewfontt"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div> */}
                  <div className="col-6 queheading">
                    <div> Custom Code :</div>
                    <input
                      type="text"
                      className="form-control crewfontt"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder=""
                    />
                    <div className="invalid"></div>
                  </div>
                </div>

                <div className="attention-section mt-2">
                  <div className="row date"></div>
                </div>
              </div>
            </div>
            <div className="twoktbpassangerdetails mt-3">
              {items.map((item, idx) => (
                <div key={idx}>
                  <div className="date row">
                    <div className="col-6 queheading">
                      <div> Description:</div>
                      <textarea
                        type="text"
                        className="form-control passwidth crewfontt "
                        rows="1"
                        placeholder=""
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-6 queheading">
                      <div> Quantity :</div>
                      <input
                        type="number"
                        className="form-control crewfontt"
                        placeholder=""
                        value={item.qty}
                        onChange={(e) => updateItem(idx, "qty", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="date row">
                    <div className="col-12 queheading">
                      <div> Remarks:</div>
                      <textarea
                        className="form-control passwidth crewfontt "
                        rows={2}
                        value={item.remark}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) =>
                          updateItem(idx, "remark", e.target.value)
                        }
                      />
                    </div>
                    {items.length > 1 && (
                      <div className="col-2 d-flex align-items-end ">
                        <button
                          type="button"
                          className="btn btn-danger btndelte"
                          onClick={() => deleteItem(idx)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {idx < items.length - 1 && <hr className="mt-3 mb-2" />}
                </div>
              ))}
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-info addmorebtn"
                  onClick={addItem}
                >
                  Add More
                </button>
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

export default NewDeliveryNoteTranswave;
