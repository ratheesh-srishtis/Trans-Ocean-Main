import React, { useEffect, useState } from "react";
import "./Transwave-Templates-css/Transportation_Slip.css";
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
  getPdaTemplateDataAPI,
  generateTemplate,
} from "../services/apiService";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
const TransportationSlip = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
  isEdit,
  onSubmit,
}) => {
  const [dataFromAPI, setDataFromAPI] = useState(null);

  const [fromDate, setFromDate] = React.useState(null);
  const [fromTime, setFromTime] = React.useState("");
  const [toDate, setToDate] = React.useState(null);
  const [toTime, setToTime] = React.useState("");
  const [vehiclePlateNo, setVehiclePlateNo] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [nameSignPassenger, setNameSignPassenger] = React.useState("");
  const [waitingItems, setWaitingItems] = React.useState([
    { from: null, to: null, hrs: "", waiting: "" },
  ]);
  const [mainDate, setMainDate] = React.useState(null);
  const [fromHours, setFromHours] = React.useState("");
  const [fromMinutes, setFromMinutes] = React.useState("");
  const [toHours, setToHours] = React.useState("");
  const [toMinutes, setToMinutes] = React.useState("");
  const [fromTimeError, setFromTimeError] = React.useState("");
  const [toTimeError, setToTimeError] = React.useState("");
  const [driverName, setDriverName] = React.useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
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
    return `${year}-${month}-${day}`;
  };

  const handleFromHoursChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value) && Number(value) <= 23) {
      setFromHours(value);
      setFromTimeError("");
    } else {
      setFromTimeError("Invalid hours (0-23)");
    }
  };

  const handleFromMinutesChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value) && Number(value) <= 59) {
      setFromMinutes(value);
      setFromTimeError("");
    } else {
      setFromTimeError("Invalid minutes (0-59)");
    }
  };

  const handleToHoursChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value) && Number(value) <= 23) {
      setToHours(value);
      setToTimeError("");
    } else {
      setToTimeError("Invalid hours (0-23)");
    }
  };

  const handleToMinutesChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value) && Number(value) <= 59) {
      setToMinutes(value);
      setToTimeError("");
    } else {
      setToTimeError("Invalid minutes (0-59)");
    }
  };

  const addWaitingItem = () => {
    setWaitingItems([
      ...waitingItems,
      { from: null, to: null, hrs: "", waiting: "" },
    ]);
  };

  const deleteWaitingItem = (idx) => {
    if (waitingItems.length > 1) {
      setWaitingItems(waitingItems.filter((_, i) => i !== idx));
    }
  };

  const handleSave = async () => {
    if (!mainDate) {
      setMessage("Please select a date.");
      setOpenPopUp(true);
      return;
    }
    const formatDateForPayload = (dateObj) => {
      return dateObj ? dateObj.toLocaleDateString("en-GB") : "";
    };
    const payload = {
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      date: formatDateForPayload(mainDate),
      vehiclePlateNo,
      from: formatDateForPayload(fromDate),
      fromTime: `${fromHours.padStart(2, "0")}:${fromMinutes.padStart(2, "0")}`,
      to: formatDateForPayload(toDate),
      toTime: `${toHours.padStart(2, "0")}:${toMinutes.padStart(2, "0")}`,
      details,
      remarks,
      nameSignPassenger: nameSignPassenger ? [nameSignPassenger] : [],
      waitingItems: waitingItems.map((item) => ({
        from: formatDateForPayload(item.from),
        to: formatDateForPayload(item.to),
        hrs: item.hrs,
        waiting: item.waiting,
      })),
      driverName,
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

  React.useEffect(() => {
    if (!dataFromAPI) return; // Prevent running if data is not loaded
    console.log(dataFromAPI, "dataFromAPI");
    // Helper to convert dd/MM/yyyy string to Date object
    const parseDate = (str) => {
      if (!str) return null;
      const [day, month, year] = str.split("/");
      return new Date(`${year}-${month}-${day}`);
    };
    // Helper to split HH:MM
    const parseTime = (str) => {
      if (!str) return ["", ""];
      const [h, m] = str.split(":");
      return [h || "", m || ""];
    };

    setMainDate(parseDate(dataFromAPI.date));
    setVehiclePlateNo(dataFromAPI.vehiclePlateNo || "");
    setFromDate(parseDate(dataFromAPI.from));
    const [fh, fm] = parseTime(dataFromAPI.fromTime);
    setFromHours(fh);
    setFromMinutes(fm);
    setToDate(parseDate(dataFromAPI.to));
    const [th, tm] = parseTime(dataFromAPI.toTime);
    setToHours(th);
    setToMinutes(tm);
    setDetails(dataFromAPI.details || "");
    setRemarks(dataFromAPI.remarks || "");
    setNameSignPassenger(dataFromAPI.nameSignPassenger || "");
    setDriverName(dataFromAPI.driverName || "");
    setWaitingItems(
      Array.isArray(dataFromAPI.waitingItems) &&
        dataFromAPI.waitingItems.length > 0
        ? dataFromAPI.waitingItems.map((item) => ({
            from: parseDate(item.from),
            to: parseDate(item.to),
            hrs: item.hrs || "",
            waiting: item.waiting || "",
          }))
        : [{ waiting: "", from: null, to: null, hrs: "" }]
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
              <h5 className="twoktbsubhead mb-3"> TRANSPORTATION SLIP</h5>
            </div>
            <div className="cont row d-flex  ">
              <div className="col-6 queheading">
                <div> Date :</div>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={mainDate}
                  onChange={setMainDate}
                  className="form-control answidth crewfontt"
                  placeholderText="Select date"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="cont row d-flex justify-content-between mt-2">
              <div className="col-6 queheading">
                <div> Vehicle Plate No :</div>
                <input
                  type="email"
                  className="form-control answidth crewfontt"
                  value={vehiclePlateNo}
                  onChange={(e) => setVehiclePlateNo(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="cont row d-flex justify-content-between mt-2 ">
              <div className="col-3 queheading">
                <div> From :</div>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={fromDate}
                  onChange={setFromDate}
                  className="form-control answidth crewfontt"
                  placeholderText="Select date"
                  autoComplete="off"
                />
              </div>
              <div className="col-3 queheading">
                <div> Time</div>
                <div className="d-flex">
                  <input
                    type="text"
                    className="form-control answidth crewfontt timesttslip"
                    placeholder="HH"
                    value={fromHours}
                    onChange={handleFromHoursChange}
                    maxLength={2}
                  />
                  <input
                    type="text"
                    className="form-control answidth crewfontt timesttslip"
                    placeholder="MM"
                    value={fromMinutes}
                    onChange={handleFromMinutesChange}
                    maxLength={2}
                  />
                </div>
                {fromTimeError && (
                  <div style={{ color: "red", fontSize: "10px" }}>
                    {fromTimeError}
                  </div>
                )}
              </div>
              <div className="col-3 queheading">
                <div> To :</div>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={toDate}
                  onChange={setToDate}
                  className="form-control answidth crewfontt"
                  placeholderText="Select date"
                  autoComplete="off"
                  minDate={fromDate}
                />
                {toDate && fromDate && toDate < fromDate && (
                  <div style={{ color: "red", fontSize: "10px" }}>
                    To date cannot be earlier than From date.
                  </div>
                )}
              </div>
              <div className="col-3 queheading">
                <div> Time</div>
                <div className="d-flex">
                  <input
                    type="text"
                    className="form-control answidth crewfontt timesttslip"
                    placeholder="HH"
                    value={toHours}
                    onChange={handleToHoursChange}
                    maxLength={2}
                  />
                  <input
                    type="text"
                    className="form-control answidth crewfontt timesttslip"
                    placeholder="MM"
                    value={toMinutes}
                    onChange={handleToMinutesChange}
                    maxLength={2}
                  />
                </div>
                {toTimeError && (
                  <div style={{ color: "red", fontSize: "10px" }}>
                    {toTimeError}
                  </div>
                )}
              </div>
            </div>

            <div className="cont row d-flex justify-content-between mt-2">
              <div className="col-12 queheading">
                <div> Details of Passengers/ Cargo :</div>
                <textarea
                  type="text"
                  className="form-control passwidth crewfontt "
                  id="exampleFormControlInput1"
                  rows="1"
                  placeholder=""
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="cont row d-flex justify-content-between mt-2">
              <div className="col-12 queheading">
                <div> Remarks :</div>
                <textarea
                  className="form-control passwidth crewfontt "
                  id="exampleFormControlInput1"
                  rows={3}
                  value={remarks}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="cont row d-flex justify-content-between mt-2 ">
              <div className="col-6 queheading">
                <div> Name & Sign of Passenger :</div>
                <input
                  type="email"
                  className="form-control answidth crewfontt"
                  value={nameSignPassenger}
                  onChange={(e) => setNameSignPassenger(e.target.value)}
                ></input>
              </div>
              <div className="col-6 queheading">
                <div> Driver Name :</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3">Additional </div>

            <div className="dear">
              <div className="twoktbpassangerdetails mt-2">
                {waitingItems.map((item, idx) => (
                  <div className="date row mt-2" key={idx}>
                    <div className="col-2 queheading ">
                      <div> Waiting :</div>
                      <input
                        type="text"
                        className="form-control crewfontt"
                        id="waitingInput"
                        value={item.waiting}
                        onChange={(e) => {
                          const updated = [...waitingItems];
                          updated[idx].waiting = e.target.value;
                          setWaitingItems(updated);
                        }}
                      />
                    </div>
                    <div className="col-3 queheading">
                      <div> From :</div>
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={item.from}
                        onChange={(date) => {
                          const updated = [...waitingItems];
                          updated[idx].from = date;
                          setWaitingItems(updated);
                        }}
                        className="form-control crewfontt"
                        placeholderText="Select date"
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-3 queheading ">
                      <div> To:</div>
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={item.to}
                        onChange={(date) => {
                          const updated = [...waitingItems];
                          updated[idx].to = date;
                          setWaitingItems(updated);
                        }}
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
                    <div className="col-2 queheading ">
                      <div> Hrs :</div>
                      <input
                        type="text"
                        className="form-control crewfontt"
                        id="exampleFormControlInput1"
                        placeholder=""
                        value={item.hrs}
                        onChange={(e) => {
                          const updated = [...waitingItems];
                          updated[idx].hrs = e.target.value;
                          setWaitingItems(updated);
                        }}
                      />
                    </div>

                    {waitingItems.length > 1 && (
                      <>
                        <div className="col-3 d-flex align-items-end mt-2">
                          <button
                            type="button"
                            className="btn btn-danger btndelte"
                            onClick={() => deleteWaitingItem(idx)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}

                    {idx < waitingItems.length - 1 && (
                      <hr className="mt-3 mb-2" />
                    )}
                  </div>
                ))}
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-info addmorebtn"
                    onClick={addWaitingItem}
                  >
                    Add More
                  </button>
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
      </Dialog>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default TransportationSlip;
