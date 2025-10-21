// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../../css/templates/bertreport.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import {
  generateTemplatePDF,
  getPdaTemplateDataAPI,
} from "../../../services/apiService";
import moment from "moment";
import PopUp from "../../PopUp";
import Loader from "../../Loader";
const BerthReport = ({
  open,
  onClose,
  templates,
  onSubmit,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
  isEdit,
}) => {
  console.log(templates, "templates");
  const [isLoading, setIsLoading] = useState(false);

  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    esop: "",
    anchored: "",
    norTender: "",
    anchorAweigh: "",
    pob: "",
    firstline: "",
    allfast: "",
    pilotOff: "",
    gangwayLowered: "",
    customClearence: "",
    freePratique: "",
  });

  const [rows, setRows] = useState([
    { id: "esop", label: "ESOP" },
    { id: "anchored", label: "ANCHORED" },
    { id: "norTender", label: "NOR TENDER" },
    { id: "anchorAweigh", label: "ANCHOR AWEIGH" },
    { id: "pob", label: "POB" },
    { id: "firstline", label: "FIRST LINE" },
    { id: "allfast", label: "ALL FAST - ALONG SIDE BERTH 31" },
    { id: "pilotOff", label: "PILOT OFF" },
    { id: "gangwayLowered", label: "GANGWAY LOWERED" },
    { id: "customClearence", label: "CUSTOMS CLEARENCE" },
    { id: "freePratique", label: "FREE PRATIQUE" },
  ]);

  const [reportRows, setReportRows] = useState(
    rows.map((row) => ({
      description: row?.label,
      reportDate: "",
    }))
  );

  const addMoreRow = () => {
    const newId = `row-${Date.now()}`;
    setRows([
      ...rows,
      {
        id: newId,
        label: "",
      },
    ]);

    setReportRows([
      ...reportRows,
      {
        description: "",
        reportDate: "",
      },
    ]);
  };

  const handleDescriptionChange = (index, value) => {
    const updatedRows = [...reportRows];
    updatedRows[index].description = value;
    setReportRows(updatedRows);
  };

  useEffect(() => {
    console.log(reportRows, "reportRows");
  }, [reportRows]);

  const [generalRemarks, setGeneralRemarks] = useState("");
  const [shipperRemarks, setShipperRemarks] = useState("");
  const [masterRemarks, setMasterRemarks] = useState("");

  const [etaHours, setEtaHours] = useState("");
  const [etaMinutes, setEtaMinutes] = useState("");
  const [etaTimeError, setEtaTimeError] = useState("");

  const [formState, setFormState] = useState({
    draftOnArrivalFWD: "",
    draftOnArrivalAFT: "",
    bunkersOnArrivalFO: "",
    bunkersOnArrivalDO: "",
    bunkersOnArrivalAFT: "",
    draftOnDepartureFWD: "",
    draftOnDepartureAFT: "",
    bunkersOnDepartureFO: "",
    bunkersOnDepartureDO: "",
    bunkersOnDepartureAFT: "",
    bunkersOnDepartureNextPort: "",
    bunkersOnDepartureETA: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "generalRemarks") {
      setGeneralRemarks(value);
    } else if (name === "shipperRemarks") {
      setShipperRemarks(value);
    } else if (name === "masterRemarks") {
      setMasterRemarks(value);
    }
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const [rowTimes, setRowTimes] = useState({}); // Stores hours, minutes for each row
  const [timeErrors, setTimeErrors] = useState({});

  const handleDateChange = (key, date, index) => {
    if (!date) {
      // User cleared the date input — remove the value
      setFormData((prev) => ({
        ...prev,
        [key]: "",
      }));
      setRowTimes((prev) => {
        const updated = { ...prev };
        delete updated[key]; // remove the key completely (or you could reset to { hours: "", minutes: "" })
        return updated;
      });
      return;
    }

    const { hours = "00", minutes = "00" } = rowTimes[key] || {};
    validateAndSetRowTime(key, hours, minutes, date, index);
  };

  const validateAndSetRowTime = (
    rowId,
    rawHours,
    rawMinutes,
    selectedDate,
    index = null
  ) => {
    const hours = rawHours === "" ? "00" : rawHours;
    const minutes = rawMinutes === "" ? "00" : rawMinutes;

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      setTimeErrors((prev) => ({
        ...prev,
        [rowId]: "Please enter a valid time",
      }));
      return;
    }

    setTimeErrors((prev) => ({
      ...prev,
      [rowId]: "",
    }));

    // Only proceed if date is selected
    if (!selectedDate) return;

    const formattedTime = `${moment(selectedDate).format(
      "YYYY-MM-DD"
    )} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    console.log(formattedTime, "formattedTime");

    if (index !== null) {
      setReportRows((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          reportDate: formattedTime,
        };
        return updated;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [rowId]: formattedTime,
    }));
  };

  const handleRowHoursChange = (rowId, value, index) => {
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setRowTimes((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], hours: value },
      }));

      const selectedDate = formData[rowId] ? new Date(formData[rowId]) : null; // ✅ no fallback to today's date

      const minutes = rowTimes[rowId]?.minutes || "00";
      validateAndSetRowTime(rowId, value, minutes, selectedDate, index);
    }
  };

  const handleRowMinutesChange = (rowId, value, index) => {
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setRowTimes((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], minutes: value },
      }));

      const selectedDate = formData[rowId] ? new Date(formData[rowId]) : null; // ✅ no fallback to today's date

      const hours = rowTimes[rowId]?.hours || "00";
      validateAndSetRowTime(rowId, hours, value, selectedDate, index);
    }
  };

  const [eta, setEta] = useState("");

  const handleEtaChange = (date) => {
    setEta(date);
    validateAndUpdateETA(date, etaHours, etaMinutes);
  };

  const handleEtaHourChange = (e) => {
    const value = e.target.value;
    setEtaHours(value);
    validateAndUpdateETA(value, etaMinutes);
  };

  const handleEtaMinuteChange = (e) => {
    const value = e.target.value;
    setEtaMinutes(value);
    validateAndUpdateETA(etaHours, value);
  };

  const validateAndUpdateETA = (rawHours, rawMinutes) => {
    const hours = rawHours === "" ? "00" : rawHours;
    const minutes = rawMinutes === "" ? "00" : rawMinutes;

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    // Validation logic
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      setEtaTimeError("Please enter a valid time");
      return;
    }

    setEtaTimeError("");

    if (eta) {
      const updatedDateTime = `${moment(eta).format("YYYY-MM-DD")} ${String(
        h
      ).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      setFormState((prevState) => ({
        ...prevState,
        bunkersOnDepartureETA: updatedDateTime,
      }));
    }
  };

  const isFormValid = () => {
    // Check if any field in formState has a value

    const isFormStateValid = Object.values(formState).some(
      (value) => value && String(value).trim() !== ""
    );

    console.log(formState, "formState isFormValid");
    console.log(isFormStateValid, "isFormStateValid isFormValid");

    // Check if any field in formData has a value
    const isFormDataValid = Object.values(formData).some(
      (value) => value && String(value).trim() !== ""
    );

    console.log(formData, "formData isFormValid");
    console.log(isFormDataValid, "isFormDataValid isFormValid");

    // Check if any remarks are non-empty
    const areRemarksValid =
      String(generalRemarks).trim() !== "" ||
      String(shipperRemarks).trim() !== "" ||
      String(masterRemarks).trim() !== "";

    console.log(areRemarksValid, "areRemarksValid isFormValid");

    // Return true if at least one of these is valid
    return isFormStateValid || isFormDataValid || areRemarksValid;
  };

  const saveTemplate = async (status) => {
    // Convert all date fields in formData to the desired format

    if (!isFormValid()) {
      setMessage("At least one field must be filled.");
      setOpenPopUp(true);
      return;
    }

    const formattedFormData = Object.keys(formData).reduce((acc, key) => {
      acc[key] = formData[key]
        ? moment(formData[key]).format("YYYY-MM-DD HH:mm")
        : ""; // Format the date or assign an empty string if null/undefined
      return acc;
    }, {});

    const validRows = reportRows.filter((row) => {
      return row.description.trim() && row.reportDate;
    });

    const reportDetails = validRows.map((row) => ({
      description: row.description.trim(),
      reportDate: row.reportDate.trim(),
    }));

    let templateBpdy = {
      pdaChargeId: charge?._id,
      templateName: selectedTemplateName,
      templateId: selectedTemplate,
      reportDetails: reportDetails,
      // ...formattedFormData, // Use the formatted date values
      draftOnArrivalFWD: formState.draftOnArrivalFWD,
      draftOnArrivalAFT: formState.draftOnArrivalAFT,
      bunkersOnArrivalFO: formState.bunkersOnArrivalFO,
      bunkersOnArrivalDO: formState.bunkersOnArrivalDO,
      bunkersOnArrivalAFT: formState.bunkersOnArrivalAFT,
      draftOnDepartureFWD: formState.draftOnDepartureFWD,
      draftOnDepartureAFT: formState.draftOnDepartureAFT,
      bunkersOnDepartureFO: formState.bunkersOnDepartureFO,
      bunkersOnDepartureDO: formState.bunkersOnDepartureDO,
      bunkersOnDepartureAFT: formState.bunkersOnDepartureAFT,
      bunkersOnDepartureNextPort: formState.bunkersOnDepartureNextPort,
      bunkersOnDepartureETA: formState.bunkersOnDepartureETA,
      generalRemarks: generalRemarks,
      shipperRemarks: shipperRemarks,
      masterRemarks: masterRemarks,
    };
    // Proceed with the API call
    setIsLoading(true);
    try {
      const response = await generateTemplatePDF(templateBpdy);
      console.log(response, "login_response");
      if (response?.status === true) {
        setIsLoading(false);
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

  useEffect(() => {
    console.log(formState, "formState");
    console.log(formData, "formData");
  }, [formState, formData]);

  const getPdaTemplateData = async () => {
    // setIsLoading(true);
    try {
      let userData = {
        pdaChargeId: charge?._id,
        templateId: selectedTemplate,
      };
      const response = await getPdaTemplateDataAPI(userData);
      if (response?.templateData) {
        setIsLoading(false);

        const templateData = response.templateData;
        console.log(templateData, "templateData_berthreport");

        if (templateData?.bunkersOnDepartureETA) {
          const etaMoment = moment.utc(templateData.bunkersOnDepartureETA);
          setEta(etaMoment.toDate());
          setEtaHours(etaMoment.format("HH"));
          setEtaMinutes(etaMoment.format("mm"));
        }

        // Update formData with respective fields

        setRows(templateData?.reportDetails);
        setReportRows(templateData?.reportDetails);

        setFormData((prevFormData) => {
          const updatedFormData = {
            esop: templateData?.esop
              ? moment.utc(templateData?.esop).format("YYYY-MM-DD HH:mm")
              : "",
            anchored: templateData?.anchored
              ? moment.utc(templateData?.anchored).format("YYYY-MM-DD HH:mm")
              : "",
            norTender: templateData?.norTender
              ? moment.utc(templateData?.norTender).format("YYYY-MM-DD HH:mm")
              : "",
            anchorAweigh: templateData?.anchorAweigh
              ? moment
                  .utc(templateData?.anchorAweigh)
                  .format("YYYY-MM-DD HH:mm")
              : "",
            pob: templateData?.pob
              ? moment.utc(templateData?.pob).format("YYYY-MM-DD HH:mm")
              : "",
            firstline: templateData?.firstline
              ? moment.utc(templateData?.firstline).format("YYYY-MM-DD HH:mm")
              : "",
            allfast: templateData?.allfast
              ? moment.utc(templateData?.allfast).format("YYYY-MM-DD HH:mm")
              : "",
            pilotOff: templateData?.pilotOff
              ? moment.utc(templateData?.pilotOff).format("YYYY-MM-DD HH:mm")
              : "",
            gangwayLowered: templateData?.gangwayLowered
              ? moment
                  .utc(templateData?.gangwayLowered)
                  .format("YYYY-MM-DD HH:mm")
              : "",
            customClearence: templateData?.customClearence
              ? moment
                  .utc(templateData?.customClearence)
                  .format("YYYY-MM-DD HH:mm")
              : "",
            freePratique: templateData?.freePratique
              ? moment
                  .utc(templateData?.freePratique)
                  .format("YYYY-MM-DD HH:mm")
              : "",
          };
          // Now update hours and minutes separately
          const updatedTimes = {};
          Object.keys(updatedFormData).forEach((key) => {
            if (templateData[key]) {
              const timePart = moment.utc(templateData[key]).format("HH:mm");
              const [hours, minutes] = timePart.split(":");
              updatedTimes[key] = { hours, minutes };
            }
          });

          // Combine date and time into rowTimes state (for hours and minutes)
          setRowTimes((prevRowTimes) => ({
            ...prevRowTimes,
            ...updatedTimes,
          }));

          return updatedFormData;
        });

        // Update formState with the respective fields
        setFormState((prevFormState) => ({
          ...prevFormState,
          draftOnArrivalFWD: templateData?.draftOnArrivalFWD || "",
          draftOnArrivalAFT: templateData?.draftOnArrivalAFT || "",
          bunkersOnArrivalFO: templateData?.bunkersOnArrivalFO || "",
          bunkersOnArrivalDO: templateData?.bunkersOnArrivalDO || "",
          bunkersOnArrivalAFT: templateData?.bunkersOnArrivalAFT || "",
          draftOnDepartureFWD: templateData?.draftOnDepartureFWD || "",
          draftOnDepartureAFT: templateData?.draftOnDepartureAFT || "",
          bunkersOnDepartureFO: templateData?.bunkersOnDepartureFO || "",
          bunkersOnDepartureDO: templateData?.bunkersOnDepartureDO || "",
          bunkersOnDepartureAFT: templateData?.bunkersOnDepartureAFT || "",
          bunkersOnDepartureNextPort:
            templateData?.bunkersOnDepartureNextPort || "",
          bunkersOnDepartureETA: templateData?.bunkersOnDepartureETA
            ? moment
                .utc(templateData?.bunkersOnDepartureETA)
                .format("YYYY-MM-DD HH:mm")
            : "",
        }));
        setGeneralRemarks(templateData?.generalRemarks);
        setShipperRemarks(templateData?.shipperRemarks);
        setMasterRemarks(templateData?.masterRemarks);
      }

      console.log("getPdaTemplateData:", response);
      // setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit == true) {
      getPdaTemplateData();
    }
  }, [isEdit]);
  useEffect(() => {
    console.log(rows, "main_rows");
  }, [rows]);

  return (
    <>
      <div>
        <Dialog
          sx={{
            width: 1000,
            margin: "auto",
            borderRadius: 2,
          }}
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
          <div className="d-flex justify-content-between ">
            <DialogTitle> </DialogTitle>
            <div className="closeicon">
              <i className="bi bi-x-lg " onClick={onClose}></i>
            </div>
          </div>
          <DialogContent style={{ marginBottom: "40px" }}>
            <div className=" statement">
              <h3>Statement of Facts</h3>
            </div>

            <table className="tabmain">
              <thead>
                <tr>
                  <th className="tabhead">Sl No:</th>
                  <th className="tabhead">Description</th>
                  <th className="tabhead">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="tdstylwidt">{index + 1}</td>
                    <td className="tdstyl">
                      <input
                        type="text"
                        className="form-control"
                        value={reportRows[index].description}
                        onChange={(e) =>
                          handleDescriptionChange(index, e.target.value)
                        }
                      />
                    </td>
                    <td className="tdstyl d-flex">
                      <div>
                        <DatePicker
                          dateFormat="dd/MM/yyyy" // Use 24-hour format for consistency with your other working component
                          selected={
                            formData[row.id] ? new Date(formData[row.id]) : ""
                          } // Inline date conversion for prefilled value
                          onChange={(date) =>
                            handleDateChange(row.id, date, index)
                          }
                          className="form-control date-input"
                          placeholderText="Select Date"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        {/* <label for="exampleFormControlInput1" className="form-label">
                          Time:
                        </label> */}
                        <div className="d-flex">
                          <input
                            type="text"
                            name="berth"
                            className="form-control vessel-voyage voyageblock timeslotnewloading"
                            id="exampleFormControlInput1"
                            placeholder="00"
                            value={rowTimes[row.id]?.hours || ""}
                            onChange={(e) =>
                              handleRowHoursChange(
                                row.id,
                                e.target.value,
                                index
                              )
                            }
                          />
                          <input
                            type="text"
                            name="berth"
                            className="form-control vessel-voyage voyageblock timeslotnewloading"
                            id="exampleFormControlInput1"
                            placeholder="00"
                            value={rowTimes[row.id]?.minutes || ""}
                            onChange={(e) =>
                              handleRowMinutesChange(
                                row.id,
                                e.target.value,
                                index
                              )
                            }
                          />
                        </div>
                        {timeErrors[row.id] && (
                          <div style={{ color: "red", marginTop: "5px" }}>
                            {timeErrors[row.id]}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-success mt-2" onClick={addMoreRow}>
              Add More
            </button>

            <div className="partition">
              <div className="drafthead">Draft on Arrival</div>
              <div className="d-flex">
                <div className="col-3 arrival">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    FWD:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="draftOnArrivalFWD"
                    value={formState.draftOnArrivalFWD}
                    onChange={handleInputChange}
                  ></input>
                </div>
                <div className="col-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    AFT:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="draftOnArrivalAFT"
                    value={formState.draftOnArrivalAFT}
                    onChange={handleInputChange}
                  ></input>
                </div>
              </div>
              <div className="bunker">Bunkers on Arrival</div>
              <div className="d-flex">
                <div className="col-3 arrival">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    FO:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="bunkersOnArrivalFO"
                    value={formState.bunkersOnArrivalFO}
                    onChange={handleInputChange}
                  ></input>
                </div>
                <div className="col-3 arrival">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    DO:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="bunkersOnArrivalDO"
                    value={formState.bunkersOnArrivalDO}
                    onChange={handleInputChange}
                  ></input>
                </div>
                <div className="col-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    AFT:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="bunkersOnArrivalAFT"
                    value={formState.bunkersOnArrivalAFT}
                    onChange={handleInputChange}
                  ></input>
                </div>
              </div>
              <div className="drafthead">Draft on Departure</div>
              <div className="d-flex">
                <div className="col-3 arrival">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    FWD:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="draftOnDepartureFWD"
                    value={formState.draftOnDepartureFWD}
                    onChange={handleInputChange}
                  ></input>
                </div>
                <div className="col-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    AFT:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="draftOnDepartureAFT"
                    value={formState.draftOnDepartureAFT}
                    onChange={handleInputChange}
                  ></input>
                </div>
              </div>
              <div className="bunker">Bunkers on Departure</div>
              <div className="d-flex">
                <div className="col-3 arrival">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    FO:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="bunkersOnDepartureFO"
                    value={formState.bunkersOnDepartureFO}
                    onChange={handleInputChange}
                  ></input>
                </div>
                <div className="col-3 arrival">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    DO:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="bunkersOnDepartureDO"
                    value={formState.bunkersOnDepartureDO}
                    onChange={handleInputChange}
                  ></input>
                </div>
                <div className="col-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    AFT:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="bunkersOnDepartureAFT"
                    value={formState.bunkersOnDepartureAFT}
                    onChange={handleInputChange}
                  ></input>
                </div>
              </div>
              <div className="d-flex">
                <div className="col-3 arrival">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Next Port:
                  </label>
                  <input
                    type="text"
                    className="form-control crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="bunkersOnDepartureNextPort"
                    value={formState.bunkersOnDepartureNextPort}
                    onChange={handleInputChange}
                  ></input>
                </div>
                <div className="col-3 arrival">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    ETA:
                  </label>

                  <div className="d-flex">
                    <div>
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={eta ? new Date(eta) : null} // Inline date conversion for prefilled value
                        onChange={handleEtaChange}
                        className="form-control date-input dateheight"
                        id="eta-picker"
                        placeholderText=""
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <div className="d-flex">
                        <input
                          type="text"
                          className="form-control vessel-voyage voyageblock timeslotnewloadingeta"
                          id="exampleFormControlInput1"
                          placeholder="00"
                          value={etaHours}
                          onChange={handleEtaHourChange}
                        />
                        <input
                          type="text"
                          className="form-control vessel-voyage voyageblock timeslotnew"
                          id="exampleFormControlInput1"
                          value={etaMinutes}
                          onChange={handleEtaMinuteChange}
                          placeholder="00"
                        />
                      </div>
                    </div>
                  </div>
                  {etaTimeError && (
                    <small className="text-danger mt-1">{etaTimeError}</small>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label
                htmlFor="exampleFormControlTextarea1"
                className="form-label "
              >
                General Remarks
              </label>
              <textarea
                className="form-control crewfontt"
                id="exampleFormControlTextarea1"
                rows="2"
                name="generalRemarks"
                value={generalRemarks}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="mt-3">
              <label
                htmlFor="exampleFormControlTextarea1"
                className="form-label"
              >
                Shipper Remarks
              </label>
              <textarea
                className="form-control crewfontt"
                id="exampleFormControlTextarea2"
                rows="2"
                name="shipperRemarks"
                value={shipperRemarks}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="mt-3">
              <label
                htmlFor="exampleFormControlTextarea1"
                className="form-label"
              >
                Master Remarks
              </label>
              <textarea
                className="form-control crewfontt"
                id="exampleFormControlTextarea3"
                rows="2"
                name="masterRemarks"
                value={masterRemarks}
                onChange={handleInputChange}
              ></textarea>
            </div>
            {/* <div className="d-flex justify-content-between mt-3">
<div className="master">
              Master Sign/ Ship Stamp
            </div>
            <div className=" mt-2 master">Agent</div>
            <div className="footer-button d-flex justify-content-center mt-3">
              <button type="button" className="btn btncancel">
                Cancel
              </button>
              <button
                type="button"
                className="btn generate-buttona"
                onClick={saveTemplate}
              >
                Save
              </button>
            </div>

</div>
<div  className=" mt-2 master">
  Agent
</div> */}
            <div className="footer-button d-flex justify-content-center mt-3">
              <button type="button" className="btn btncancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn generate-buttona"
                onClick={() => {
                  saveTemplate();
                }}
              >
                Save
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default BerthReport;
