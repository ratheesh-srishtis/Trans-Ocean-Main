import React, { useState, useEffect } from "react";
import "./Transwave-Templates-css/Crane_Tally.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  generateTemplate,
  getPdaTemplateDataAPI,
} from "../services/apiService";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
const CraneTally = ({
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

  const [date, setDate] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [items, setItems] = useState([
    {
      equipment: "",
      capacity: "",
      hoursTrip: "",
      from: null, // Change to Date object
      to: null, // Change to Date object
      remarks: "",
    },
  ]);

  React.useEffect(() => {
    if (!dataFromAPI) return; // Prevent running if data is not loaded
    console.log(dataFromAPI, "dataFromAPI");
    // Helper to convert dd/MM/yyyy string to Date object
    const parseDate = (str) => {
      if (!str) return null;
      // If time format (HH:mm), parse as today with that time
      if (/^\d{2}:\d{2}$/.test(str)) {
        const [hours, minutes] = str.split(":");
        const d = new Date();
        d.setHours(Number(hours), Number(minutes), 0, 0);
        return d;
      }
      const [day, month, year] = str.split("/");
      return new Date(`${year}-${month}-${day}`);
    };

    setDate(parseDate(dataFromAPI.date));
    setItems(
      Array.isArray(dataFromAPI.items) && dataFromAPI.items.length > 0
        ? dataFromAPI.items.map((item) => ({
            equipment: item.equipment || "",
            capacity: item.capacity || "",
            hoursTrip: item.hoursTrip || "",
            from: parseDate(item.from),
            to: parseDate(item.to),
            remarks: item.remarks || "",
          }))
        : [
            {
              equipment: "",
              capacity: "",
              hoursTrip: "",
              from: null,
              to: null,
              remarks: "",
            },
          ]
    );
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

  useEffect(() => {
    console.log(dataFromAPI, "dataFromAPI");
  }, [dataFromAPI]);

  const addItem = () => {
    setItems([
      ...items,
      {
        equipment: "",
        capacity: "",
        hoursTrip: "",
        from: null,
        to: null,
        remarks: "",
      },
    ]);
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

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    if (!date) {
      setMessage("Please select a date before saving.");
      setOpenPopUp(true);
      return;
    }
    const payload = {
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      date: formatDate(date),
      items: items.map((item) => ({
        ...item,
        from: formatDate(item.from),
        to: formatDate(item.to),
      })),
    };
    console.log("API Payload:", payload);
    // TODO: Pass payload to API

    try {
      const response = await generateTemplate(payload);
      if (response?.status === true) {
        setIsLoading(false);
        setMessage("Template saved successfully!");
        setOpenPopUp(true);
        onSubmit(response);
      } else {
        setIsLoading(false);
        setMessage("Template failed. Please try again");
        setOpenPopUp(true);
        onSubmit(response);
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Template failed. Please try again");
      setOpenPopUp(true);
      onSubmit(error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        {/* <DialogTitle>Crane Tally</DialogTitle> */}
        <div className="d-flex justify-content-between ">
          <DialogTitle>
            {/* {selectedTemplateName
                      ? selectedTemplateName
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                      : ""} */}
          </DialogTitle>
          <div className="closeicon" onClick={onClose}>
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent>
          <div className="mainoktb ">
            <div className=" d-flex justify-content-center">
              <h5 className="twoktbsubhead"> TIME SHEET </h5>
            </div>
            <div className="cont row d-flex justify-content-between ">
              <div className="col-6 queheading">
                <div> Date :</div>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={date}
                  onChange={setDate}
                  className="form-control passwidth crewfontt"
                  placeholderText="Select date"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="dear">
              <div className="twoktbpassangerdetails mt-2">
                {items.map((item, idx) => (
                  <div key={idx}>
                    <div className="date row mt-2">
                      <div className="col-4 queheading">
                        <div> Equipment :</div>
                        <input
                          type="text"
                          className="form-control crewfontt"
                          value={item.equipment}
                          onChange={(e) =>
                            updateItem(idx, "equipment", e.target.value)
                          }
                          placeholder=""
                        />
                      </div>
                      <div className="col-2 queheading">
                        <div> Capacity:</div>
                        <input
                          type="text"
                          className="form-control crewfontt"
                          value={item.capacity}
                          onChange={(e) =>
                            updateItem(idx, "capacity", e.target.value)
                          }
                          placeholder=""
                        />
                      </div>
                      <div className="col-2 queheading">
                        <div> Hours Trip:</div>
                        <input
                          type="text"
                          className="form-control crewfontt"
                          value={item.hoursTrip}
                          onChange={(e) =>
                            updateItem(idx, "hoursTrip", e.target.value)
                          }
                          placeholder=""
                        />
                      </div>
                      <div className="col-4 queheading">
                        <div> From :</div>
                        <DatePicker
                          selected={item.from}
                          onChange={(date) => updateItem(idx, "from", date)}
                          dateFormat="dd/MM/yyyy"
                          className="form-control crewfontt"
                          placeholderText="Select date"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="date row mt-2">
                      <div className="col-4 queheading">
                        <div> To :</div>
                        <DatePicker
                          selected={item.to}
                          onChange={(date) => updateItem(idx, "to", date)}
                          dateFormat="dd/MM/yyyy"
                          className="form-control crewfontt"
                          placeholderText="Select date"
                          autoComplete="off"
                          minDate={item.from}
                        />
                        {item.to && item.from && item.to < item.from && (
                          <div style={{ color: "red", fontSize: "10px" }}>
                            To date cannot be earlier than From date.
                          </div>
                        )}
                      </div>
                      <div className="col-8 queheading">
                        <div> Remarks:</div>
                        <textarea
                          className="form-control crewfontt"
                          value={item.remarks}
                          onChange={(e) =>
                            updateItem(idx, "remarks", e.target.value)
                          }
                          placeholder=""
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                      {items.length > 1 && (
                        <>
                          <div className="col-2 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn btn-danger cranetally-delete"
                              onClick={() => deleteItem(idx)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {idx < items.length - 1 && <hr className="mt-3 mb-2" />}
                  </div>
                ))}
                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-info addmorebtn"
                    onClick={addItem}
                  >
                    Add More
                  </button>
                </div>
              </div>
            </div>

            <div className="footer-button d-flex justify-content-center mt-3">
              <button
                onClick={handleClose}
                type="button"
                className="btn btncancel"
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

export default CraneTally;
