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

  const [reportRows, setReportRows] = useState([
    { description: "ESOP", reportDate: "", hours: "", minutes: "" },
    { description: "ANCHORED", reportDate: "", hours: "", minutes: "" },
    { description: "NOR TENDER", reportDate: "", hours: "", minutes: "" },
    { description: "ANCHOR AWEIGH", reportDate: "", hours: "", minutes: "" },
    { description: "POB", reportDate: "", hours: "", minutes: "" },
    { description: "FIRST LINE", reportDate: "", hours: "", minutes: "" },
    {
      description: "ALL FAST - ALONG SIDE BERTH 31",
      reportDate: "",
      hours: "",
      minutes: "",
    },
    { description: "PILOT OFF", reportDate: "", hours: "", minutes: "" },
    { description: "GANGWAY LOWERED", reportDate: "", hours: "", minutes: "" },
    {
      description: "CUSTOMS CLEARENCE",
      reportDate: "",
      hours: "",
      minutes: "",
    },
    { description: "FREE PRATIQUE", reportDate: "", hours: "", minutes: "" },
  ]);

  const addMoreRow = () => {
    setReportRows([
      ...reportRows,
      {
        description: "",
        reportDate: "",
        hours: "",
        minutes: "",
      },
    ]);
  };

  const handleDescriptionChange = (index, value) => {
    const updatedRows = [...reportRows];
    updatedRows[index].description = value;
    setReportRows(updatedRows);
  };

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

  const [timeErrors, setTimeErrors] = useState({});

  const handleDateChange = (date, index) => {
    if (!date) {
      // User cleared the date input — remove the value
      setReportRows((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          reportDate: "",
        };
        return updated;
      });
      return;
    }
    validateAndSetRowTime("00", "00", date, index);
  };

  const validateAndSetRowTime = (
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
        [index]: "Please enter a valid time",
      }));
      return;
    }

    setTimeErrors((prev) => ({
      ...prev,
      [index]: "",
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
  };

  const handleRowHoursChange = (value, index) => {
    if (value === "" || /^\d{0,2}$/.test(value)) {
      // console.log(index, "index handleRowHoursChange");
      // console.log(value, "value handleRowHoursChange");
      setReportRows((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          hours: value,
        };
        return updated;
      });

      const selectedDate = reportRows[index]?.reportDate
        ? new Date(reportRows[index]["reportDate"])
        : null; // ✅ no fallback to today's date

      const minutes = reportRows[index]?.minutes || "00";
      validateAndSetRowTime(value, minutes, selectedDate, index);
    }
  };

  const handleRowMinutesChange = (value, index) => {
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setReportRows((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          minutes: value,
        };
        return updated;
      });

      const selectedDate = reportRows[index]?.reportDate
        ? new Date(reportRows[index]["reportDate"])
        : null; // ✅ no fallback to today's date

      const hours = reportRows[index]?.hours || "00";
      validateAndSetRowTime(hours, value, selectedDate, index);
    }
  };

  useEffect(() => {
    console.log(reportRows, "reportRows");
  }, [reportRows]);

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
    console.log("=== VALIDATION DEBUG START ===");

    // Check if any field in formState has a value
    console.log("formState:", formState);
    const formStateValues = Object.values(formState);
    console.log("formState values:", formStateValues);

    const isFormStateValid = formStateValues.some((value) => {
      const isValid = value != null && String(value).trim() !== "";
      console.log(`formState value: "${value}" -> valid: ${isValid}`);
      return isValid;
    });
    console.log("isFormStateValid final result:", isFormStateValid);

    // Check if any field in reportRows has a value (excluding description field)
    console.log("reportRows:", reportRows);
    const isFormDataValid = reportRows.some((row, rowIndex) => {
      console.log(`Checking row ${rowIndex}:`, row);

      // Only check reportDate, hours, and minutes (exclude description)
      const fieldsToCheck = {
        reportDate: row.reportDate,
        hours: row.hours,
        minutes: row.minutes,
      };
      console.log(`Row ${rowIndex} fields to check:`, fieldsToCheck);

      const hasValidValue = Object.entries(fieldsToCheck).some(
        ([fieldName, value]) => {
          const isValid = value != null && String(value).trim() !== "";
          console.log(
            `  Row ${rowIndex} ${fieldName}: "${value}" -> valid: ${isValid}`
          );
          return isValid;
        }
      );
      console.log(`Row ${rowIndex} has valid value:`, hasValidValue);
      return hasValidValue;
    });
    console.log("isFormDataValid final result:", isFormDataValid);

    // Check if any remarks are non-empty
    console.log("generalRemarks:", `"${generalRemarks}"`);
    console.log("shipperRemarks:", `"${shipperRemarks}"`);
    console.log("masterRemarks:", `"${masterRemarks}"`);

    const generalValid =
      generalRemarks != null && String(generalRemarks).trim() !== "";
    const shipperValid =
      shipperRemarks != null && String(shipperRemarks).trim() !== "";
    const masterValid =
      masterRemarks != null && String(masterRemarks).trim() !== "";

    console.log("generalRemarks valid:", generalValid);
    console.log("shipperRemarks valid:", shipperValid);
    console.log("masterRemarks valid:", masterValid);

    const areRemarksValid = generalValid || shipperValid || masterValid;
    console.log("areRemarksValid final result:", areRemarksValid);

    // Final validation result
    const finalResult = isFormStateValid || isFormDataValid || areRemarksValid;
    console.log("=== FINAL VALIDATION RESULT ===");
    console.log("isFormStateValid:", isFormStateValid);
    console.log("isFormDataValid:", isFormDataValid);
    console.log("areRemarksValid:", areRemarksValid);
    console.log("finalResult (form is valid):", finalResult);
    console.log("=== VALIDATION DEBUG END ===");

    return finalResult;
  };

  const saveTemplate = async (status) => {
    console.log("=== SAVE TEMPLATE CALLED ===");
    console.log("Status:", status);

    // Convert all date fields in formData to the desired format
    const validationResult = isFormValid();
    console.log("Validation result:", validationResult);
    console.log("Should show warning (validation failed):", !validationResult);

    if (!validationResult) {
      console.log("VALIDATION FAILED - Showing warning message");
      setMessage("At least one field must be filled.");
      setOpenPopUp(true);
      return;
    }

    console.log("VALIDATION PASSED - Proceeding with save");

    const formattedFormData = Object.keys(reportRows).reduce((acc, key) => {
      acc[key] = reportRows[key]
        ? moment(reportRows[key]).format("YYYY-MM-DD HH:mm")
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
    console.log(reportRows, "reportRows");
  }, [formState, reportRows]);

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
        // Process API data to extract hours and minutes
        const apiReportDetails =
          templateData?.reportDetails?.map((item) => {
            const [datePart, timePart] = item.reportDate.split(" "); // "2025-06-12", "12:15"
            const [hours, minutes] = timePart.split(":");

            return {
              description: item.description,
              reportDate: item.reportDate,
              hours,
              minutes,
            };
          }) || [];

        // Merge API data with default reportRows structure
        // Keep all default rows and update matching ones with API data
        setReportRows((prevRows) => {
          // Create a map of API data by description for quick lookup
          const apiDataMap = new Map();
          apiReportDetails.forEach((apiItem) => {
            apiDataMap.set(apiItem.description.trim(), apiItem);
          });

          // Update existing rows with matching API data, keep all default rows
          const mergedRows = prevRows.map((row) => {
            const matchingApiData = apiDataMap.get(row.description.trim());
            if (matchingApiData) {
              // Update this row with API data
              return {
                description: row.description, // Keep original description
                reportDate: matchingApiData.reportDate,
                hours: matchingApiData.hours,
                minutes: matchingApiData.minutes,
              };
            }
            // Keep original row if no API data matches
            return row;
          });

          // Add any API rows that don't match default descriptions (additional rows)
          apiReportDetails.forEach((apiItem) => {
            const existsInDefault = prevRows.some(
              (row) => row.description.trim() === apiItem.description.trim()
            );
            if (!existsInDefault) {
              mergedRows.push(apiItem);
            }
          });

          return mergedRows;
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
    console.log(pdaResponse, "pdaResponse");
  }, [pdaResponse]);

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
              <h3>STATEMENT OF FACTS</h3>
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
                {reportRows.map((row, index) => (
                  <tr key={index}>
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
                            reportRows[index]["reportDate"]
                              ? new Date(reportRows[index]["reportDate"])
                              : ""
                          } // Inline date conversion for prefilled value
                          onChange={(date) => handleDateChange(date, index)}
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
                            value={reportRows[index]?.hours || ""}
                            onChange={(e) =>
                              handleRowHoursChange(e.target.value, index)
                            }
                          />
                          <input
                            type="text"
                            name="berth"
                            className="form-control vessel-voyage voyageblock timeslotnewloading"
                            id="exampleFormControlInput1"
                            placeholder="00"
                            value={reportRows[index]?.minutes || ""}
                            onChange={(e) =>
                              handleRowMinutesChange(e.target.value, index)
                            }
                          />
                        </div>
                        {timeErrors[index] && (
                          <div style={{ color: "red", marginTop: "5px" }}>
                            {timeErrors[index]}
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
                        className="form-control date-input dateheight sof-eta-width"
                        id="eta-picker"
                        placeholderText=""
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <div className="d-flex">
                        <input
                          type="text"
                          style={{
                            width: "45px !important",
                            marginLeft: "5px",
                            height: "38px",
                          }}
                          className="form-control   "
                          id="exampleFormControlInput1"
                          placeholder="00"
                          value={etaHours}
                          onChange={handleEtaHourChange}
                        />
                        <input
                          type="text"
                          style={{
                            width: "45px !important",
                            marginLeft: "5px",
                            height: "38px",
                          }}
                          className="form-control   "
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
