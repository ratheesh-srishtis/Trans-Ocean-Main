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
import Loader from "../../Loader";
import moment from "moment";
import { parse, format } from "date-fns";
import PopUp from "../../PopUp";
const LoadingReport = ({
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
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    grade: "",
    date: "",
    totalQuantity: "",
    loadedQuantity: "",
    balance: "",
    rate: "",
    etc: "",
    remark: "",
  });

  const rows = [
    { id: "grade", label: "Grade" },
    { id: "date", label: "Date" },
    { id: "totalQuantity", label: "Total Quantity" },
    { id: "loadedQuantity", label: "Loaded Quantity" },
    { id: "balance", label: "Balance" },
    { id: "rate", label: "Rate" },
    { id: "etc", label: "ETC" },
    { id: "remark", label: "Remarks" },
  ];

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

  const [rowHours, setRowHours] = useState("");
  const [rowMinutes, setRowMinutes] = useState("");
  const [rowTime, setRowTime] = useState("");
  const [rowTimes, setRowTimes] = useState({}); // Stores hours, minutes for each row
  const [timeErrors, setTimeErrors] = useState({});

  // Handler to update date values
  // const handleDateChange = (key, date) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [key]: date, // Format date before saving
  //   }));
  // };

  const handleDateChange = (key, date) => {
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
    validateAndSetRowTime(key, hours, minutes, date);
  };

  const validateAndSetRowTime = (rowId, rawHours, rawMinutes, selectedDate) => {
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

    setFormData((prev) => ({
      ...prev,
      [rowId]: formattedTime,
    }));
  };

  const handleRowHoursChange = (rowId, value) => {
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setRowTimes((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], hours: value },
      }));

      const selectedDate = formData[rowId] ? new Date(formData[rowId]) : null; // ✅ no fallback to today's date
      const minutes = rowTimes[rowId]?.minutes || "00";
      validateAndSetRowTime(rowId, value, minutes, selectedDate);
    }
  };

  const handleRowMinutesChange = (rowId, value) => {
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setRowTimes((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], minutes: value },
      }));

      const selectedDate = formData[rowId] ? new Date(formData[rowId]) : null; // ✅ no fallback to today's date

      const hours = rowTimes[rowId]?.hours || "00";
      validateAndSetRowTime(rowId, hours, value, selectedDate);
    }
  };

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

    // Check if any field in formData has a value
    const isFormDataValid = Object.values(formData).some(
      (value) => value && String(value).trim() !== ""
    );

    // Check if any remarks are non-empty
    const areRemarksValid =
      String(generalRemarks).trim() !== "" ||
      String(shipperRemarks).trim() !== "" ||
      String(masterRemarks).trim() !== "";

    // Return true if at least one of these is valid
    return isFormStateValid || isFormDataValid || areRemarksValid;
  };

  const saveTemplate = async (status) => {
    if (!isFormValid()) {
      setMessage("At least one field must be filled.");
      setOpenPopUp(true);
      return;
    }

    const dateFields = ["date", "etc"]; // only these should be formatted

    const formattedFormData = Object.keys(formData).reduce((acc, key) => {
      if (dateFields.includes(key)) {
        acc[key] = formData[key]
          ? moment(formData[key]).format("YYYY-MM-DD HH:mm")
          : "";
      } else {
        acc[key] = formData[key]; // assign directly
      }
      return acc;
    }, {});

    let templateBpdy = {
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      ...formattedFormData, // Use the formatted date values
      // draftOnArrivalFWD: formState.draftOnArrivalFWD,
      // draftOnArrivalAFT: formState.draftOnArrivalAFT,
      // bunkersOnArrivalFO: formState.bunkersOnArrivalFO,
      // bunkersOnArrivalDO: formState.bunkersOnArrivalDO,
      // bunkersOnArrivalAFT: formState.bunkersOnArrivalAFT,
      // draftOnDepartureFWD: formState.draftOnDepartureFWD,
      // draftOnDepartureAFT: formState.draftOnDepartureAFT,
      // bunkersOnDepartureFO: formState.bunkersOnDepartureFO,
      // bunkersOnDepartureDO: formState.bunkersOnDepartureDO,
      // bunkersOnDepartureAFT: formState.bunkersOnDepartureAFT,
      // bunkersOnDepartureNextPort: formState.bunkersOnDepartureNextPort,
      // bunkersOnDepartureETA: formState.bunkersOnDepartureETA,
      // generalRemarks: generalRemarks,
      // shipperRemarks: shipperRemarks,
      // masterRemarks: masterRemarks,
    };
    // Proceed with the API call
    setIsLoading(true);

    try {
      const response = await generateTemplatePDF(templateBpdy);
      console.log(response, "login_response");
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

  useEffect(() => {
    console.log(formState, "formState");
  }, [formState]);

  const getPdaTemplateData = async () => {
    try {
      let userData = {
        pdaChargeId: charge?._id,
        templateId: selectedTemplate,
      };
      const response = await getPdaTemplateDataAPI(userData);
      if (response?.templateData) {
        const templateData = response.templateData;
        // setEta(
        //   templateData?.bunkersOnDepartureETA
        //     ? moment
        //         .utc(templateData?.bunkersOnDepartureETA)
        //         .format("YYYY-MM-DD HH:mm")
        //     : ""
        // );

        if (templateData?.bunkersOnDepartureETA) {
          const etaMoment = moment.utc(templateData.bunkersOnDepartureETA);
          setEta(etaMoment.toDate());
          setEtaHours(etaMoment.format("HH"));
          setEtaMinutes(etaMoment.format("mm"));
        }

        setGeneralRemarks(templateData?.generalRemarks);
        setShipperRemarks(templateData?.shipperRemarks);
        setMasterRemarks(templateData?.masterRemarks);

        setFormData((prevFormData) => {
          const updatedFormData = {
            grade: templateData?.grade,
            date: templateData?.date
              ? moment.utc(templateData?.date).format("YYYY-MM-DD")
              : "",
            totalQuantity: templateData?.totalQuantity,
            loadedQuantity: templateData?.loadedQuantity,
            balance: templateData?.balance,
            rate: templateData?.rate,
            etc: templateData?.etc
              ? moment.utc(templateData?.etc).format("YYYY-MM-DD")
              : "",
            remark: templateData?.remark,
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
      }

      console.log("getPdaTemplateData:", response);
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
    console.log(formData, "formData_loadingreport");
  }, [formData]);

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
              <h3>LOADING REPORT</h3>
            </div>

            <table className="tabmain">
              <thead>
                <tr>
                  <th className="tabhead">Sl No:</th>
                  <th className="tabhead">Description</th>
                  <th className="tabhead"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="tdstylwidt">{index + 1}</td>
                    <td className="tdstyl">{row.label}</td>
                    <td className="tdstyl d-flex">
                      {row?.id === "date" || row.id === "etc" ? (
                        <>
                          <div>
                            <DatePicker
                              dateFormat="dd/MM/yyyy" // Use 24-hour format for consistency with your other working component
                              selected={
                                formData[row.id]
                                  ? new Date(formData[row.id])
                                  : null
                              } // Inline date conversion for prefilled value
                              onChange={(date) =>
                                handleDateChange(row.id, date)
                              }
                              className="form-control date-input"
                              placeholderText="Select Date "
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
                                  handleRowHoursChange(row.id, e.target.value)
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
                                  handleRowMinutesChange(row.id, e.target.value)
                                }
                              />
                            </div>
                            {timeErrors[row.id] && (
                              <div style={{ color: "red", marginTop: "5px" }}>
                                {timeErrors[row.id]}
                              </div>
                            )}
                          </div>
                        </>
                      ) : row?.id === "remark" ? (
                        <>
                          <textarea
                            rows="3"
                            className="form-control formlabelcolor emailmessage"
                            id="exampleFormControlInput1"
                            value={formData[row.id] || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [row.id]: e.target.value,
                              }))
                            }
                            placeholder=""
                          ></textarea>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            className="form-control"
                            value={formData[row.id] || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [row.id]: e.target.value,
                              }))
                            }
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* <div className="partition">
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
                <div className="col-3 arrival ">
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
                className="form-label"
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
            </div> */}
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

export default LoadingReport;
