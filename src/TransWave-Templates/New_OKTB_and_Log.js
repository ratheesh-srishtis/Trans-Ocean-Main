import React, { useState, useEffect } from "react";
import "./Transwave-Templates-css/New_OKTB_and_Log.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
import { is } from "date-fns/locale";
const NewOKTBAndLog = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
  onSubmit,
  isEdit,
}) => {
  // State for passenger entries in O.K. TO BOARD section
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [dataFromAPI, setDataFromAPI] = useState(null);

  // Populate form fields from dataFromAPI on mount
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

    setFormData({
      to: dataFromAPI.to || "",
      attn: dataFromAPI.attn || "",
      date: parseDate(dataFromAPI.date),
      subject: dataFromAPI.subject || "",
    });

    setPassengers(
      (dataFromAPI.passengers || []).map((p) => {
        // Parse date and time from string like 'dd/MM/yyyy HH:mm'
        const parseDateTime = (str) => {
          if (!str) return { date: null, hours: "", minutes: "" };
          const [datePart, timePart] = str.split(" ");
          const dateObj = parseDate(datePart);
          let hours = "",
            minutes = "";
          if (timePart) {
            const [h, m] = timePart.split(":");
            hours = h || "";
            minutes = m || "";
          }
          return { date: dateObj, hours, minutes };
        };
        const dep = parseDateTime(p.departure);
        const arr = parseDateTime(p.arrival);
        return {
          ...p,
          departure: dep.date,
          departureHours: dep.hours,
          departureMinutes: dep.minutes,
          arrival: arr.date,
          arrivalHours: arr.hours,
          arrivalMinutes: arr.minutes,
        };
      })
    );

    // setCrewMembers(
    //   (dataFromAPI.crewMembers || []).map((c) => ({
    //     ...c,
    //     departure: parseDate(c.departure),
    //     arrival: parseDate(c.arrival),
    //   }))
    // );
  }, [dataFromAPI]);

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
    console.log(isEdit, "isEdit");
  }, [isEdit]);

  const [passengers, setPassengers] = useState([
    {
      passengerName: "",
      flightNo: "",
      route: "",
      departure: null,
      departureHours: "",
      departureMinutes: "",
      arrival: null,
      arrivalHours: "",
      arrivalMinutes: "",
      pnr: "",
      departureTimeError: "",
      arrivalTimeError: "",
    },
  ]);

  // State for crew entries in LETTER OF GUARANTEE section
  // const [crewMembers, setCrewMembers] = useState([
  //   {
  //     name: "",
  //     flightNo: "",
  //     departure: null,
  //     departureHours: "",
  //     departureMinutes: "",
  //     arrival: null,
  //     arrivalHours: "",
  //     arrivalMinutes: "",
  //     departureTimeError: "",
  //     arrivalTimeError: "",
  //   },
  // ]);

  // State for form header fields
  const [formData, setFormData] = useState({
    to: "",
    attn: "",
    date: null, // Changed to null for DatePicker
    subject: "",
    isRequestPermission: false,
    isConfirmationPermission: false,
  });

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

  // Functions for passenger management
  const addPassenger = () => {
    const newPassenger = {
      passengerName: "",
      flightNo: "",
      route: "",
      departure: null,
      departureHours: "",
      departureMinutes: "",
      arrival: null,
      arrivalHours: "",
      arrivalMinutes: "",
      pnr: "",
      departureTimeError: "",
      arrivalTimeError: "",
    };
    setPassengers([...passengers, newPassenger]);
  };

  const deletePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index, field, value) => {
    setPassengers(
      passengers.map((passenger, i) => {
        if (i !== index) return passenger;
        let updated = { ...passenger, [field]: value };
        if (field === "departureHours" || field === "departureMinutes") {
          updated.departureTimeError = validateTime(
            updated.departureHours,
            updated.departureMinutes
          );
        }
        if (field === "arrivalHours" || field === "arrivalMinutes") {
          updated.arrivalTimeError = validateTime(
            updated.arrivalHours,
            updated.arrivalMinutes
          );
        }
        return updated;
      })
    );
  };

  // Functions for crew member management
  const addCrewMember = () => {
    const newCrewMember = {
      name: "",
      flightNo: "",
      departure: null,
      departureHours: "",
      departureMinutes: "",
      arrival: null,
      arrivalHours: "",
      arrivalMinutes: "",
      departureTimeError: "",
      arrivalTimeError: "",
    };
    // setCrewMembers([...crewMembers, newCrewMember]);
  };

  // const deleteCrewMember = (index) => {
  //   if (crewMembers.length > 1) {
  //     setCrewMembers(crewMembers.filter((_, i) => i !== index));
  //   }
  // };

  // const updateCrewMember = (index, field, value) => {
  //   setCrewMembers(
  //     crewMembers.map((member, i) => {
  //       if (i !== index) return member;
  //       let updated = { ...member, [field]: value };
  //       if (field === "departureHours" || field === "departureMinutes") {
  //         updated.departureTimeError = validateTime(
  //           updated.departureHours,
  //           updated.departureMinutes
  //         );
  //       }
  //       if (field === "arrivalHours" || field === "arrivalMinutes") {
  //         updated.arrivalTimeError = validateTime(
  //           updated.arrivalHours,
  //           updated.arrivalMinutes
  //         );
  //       }
  //       return updated;
  //     })
  //   );
  // };

  function validateTime(hours, minutes) {
    if (!hours && !minutes) return "";
    if (!/^\d{1,2}$/.test(hours) || Number(hours) > 23)
      return "Invalid hours (0-23)";
    if (!/^\d{1,2}$/.test(minutes) || Number(minutes) > 59)
      return "Invalid minutes (0-59)";
    return "";
  }

  // Function to update form header fields
  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to get all form data
  const getAllFormData = () => {
    return {
      headerData: formData,
      passengers: passengers,
      // crewMembers: crewMembers,
    };
  };

  // Function to handle save action
  const handleSave = async () => {
    // Date is mandatory
    if (!formData.date) {
      setMessage("Please select a date.");
      setOpenPopUp(true);
      return;
    }
    setIsLoading(true);
    // Validate passenger dates
    for (const passenger of passengers) {
      if (
        passenger.arrival &&
        passenger.departure &&
        passenger.arrival < passenger.departure
      ) {
        setMessage(
          "Arrival date cannot be less than Departure date for passengers."
        );
        setOpenPopUp(true);
        return;
      }
      if (passenger.departureTimeError || passenger.arrivalTimeError) {
        setMessage("Please enter valid departure/arrival time for passengers.");
        setOpenPopUp(true);
        return;
      }
    }
    // Validate crew member dates
    // for (const member of crewMembers) {
    //   if (
    //     member.arrival &&
    //     member.departure &&
    //     member.arrival < member.departure
    //   ) {
    //     setMessage(
    //       "Arrival date cannot be less than Departure date for crew members."
    //     );
    //     setOpenPopUp(true);
    //     return;
    //   }
    //   if (member.departureTimeError || member.arrivalTimeError) {
    //     setMessage(
    //       "Please enter valid departure/arrival time for crew members."
    //     );
    //     setOpenPopUp(true);
    //     return;
    //   }
    // }

    // Format date as dd/MM/yyyy HH:mm
    const formatDateTime = (dateObj, hours, minutes) => {
      if (!dateObj) return null;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const hh = String(hours || "00").padStart(2, "0");
      const mm = String(minutes || "00").padStart(2, "0");
      return `${day}/${month}/${year} ${hh}:${mm}`;
    };

    const formatDate = (dateObj) => {
      if (!dateObj) return null;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    };

    const formPayload = {
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      to: formData.to,
      attn: formData.attn,
      date: formatDate(formData.date),
      subject: formData.subject,
      isRequestPermission: formData.isRequestPermission,
      isConfirmationPermission: formData.isConfirmationPermission,
      passengers: passengers.map((passenger) => {
        const {
          departureHours,
          departureMinutes,
          arrivalHours,
          arrivalMinutes,
          departureTimeError,
          arrivalTimeError,
          ...rest
        } = passenger;
        return {
          ...rest,
          departure: passenger.departure
            ? formatDateTime(
                passenger.departure,
                passenger.departureHours,
                passenger.departureMinutes
              )
            : null,
          arrival: passenger.arrival
            ? formatDateTime(
                passenger.arrival,
                passenger.arrivalHours,
                passenger.arrivalMinutes
              )
            : null,
        };
      }),
      // crewMembers: ...
    };

    console.log("Form Payload:", formPayload);
    try {
      const response = await generateTemplate(formPayload);
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
              <h5 className="twoktbsubhead"> TELEFAX MESSAGE</h5>
            </div>
            <div className="cont row d-flex justify-content-between ">
              <div className="col-6 queheading">
                <div> To:</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  value={formData.to}
                  onChange={(e) => updateFormData("to", e.target.value)}
                ></input>
                <div className="invalid"></div>
              </div>

              <div className="col-6 queheading">
                <div> Attn:</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  value={formData.attn}
                  onChange={(e) => updateFormData("attn", e.target.value)}
                ></input>
                <div className="invalid"></div>
              </div>
            </div>
            <div className="cont row d-flex justify-content-between ">
              <div className="col-6 queheading">
                <div> Date:</div>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={formData.date}
                  onChange={(selectedDate) =>
                    updateFormData("date", selectedDate)
                  }
                  className="form-control answidth crewfontt"
                  autoComplete="off"
                />
                <div className="invalid"></div>
              </div>
              <div className="col-6 queheading">
                <div> Subject:</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  value={formData.subject}
                  onChange={(e) => updateFormData("subject", e.target.value)}
                ></input>
                <div className="invalid"></div>
              </div>
            </div>

            {/* <div className="date  ">
                <div className="col-4 queheading ">
                  <div> Date:</div>
                  <DatePicker
                    dateFormat="dd/MM/yyyy" 
                    
                    className="form-control answidth date-input dateheight"
                    id="date-picker"
                    placeholderText=""
                    autoComplete="off"
                  />
                 <div className="invalid"></div>
                </div>
               
              </div> */}

            <div className=" d-flex justify-content-center mt-3 mb-3">
              <h5 className="twoktbsubhead">O.K. TO BOARD REQUEST</h5>
            </div>
            <div className="dear">
              {/* <div>
                The following passenger is scheduled to travel from{" "}
                <strong>LKO</strong> → <strong>DXB</strong> on your flight as
                per the details below:
              </div> */}
              <div className="twoktbpassangerdetails mt-2">
                {passengers.map((passenger, index) => (
                  <div key={index} className="passenger-entry">
                    <div className="date row mt-2">
                      <div className="col-4 queheading">
                        <div> Passenger Name:</div>
                        <textarea
                          type="text"
                          className="form-control passwidth crewfontt "
                          rows="1"
                          placeholder=""
                          value={passenger.passengerName}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              "passengerName",
                              e.target.value
                            )
                          }
                        ></textarea>
                      </div>
                      <div className="col-4 queheading">
                        <div> Flight No:</div>
                        <input
                          type="text"
                          className="form-control crewfontt"
                          placeholder=""
                          value={passenger.flightNo}
                          onChange={(e) =>
                            updatePassenger(index, "flightNo", e.target.value)
                          }
                        ></input>
                        <div className="invalid"></div>
                      </div>
                      <div className="col-4 queheading">
                        <div> Route:</div>
                        <input
                          type="text"
                          className="form-control crewfontt"
                          placeholder=""
                          value={passenger.route}
                          onChange={(e) =>
                            updatePassenger(index, "route", e.target.value)
                          }
                        ></input>
                        <div className="invalid"></div>
                      </div>
                    </div>
                    <div className="date row">
                      <div className="col-4 queheading">
                        <div> Departure:</div>
                        <DatePicker
                          dateFormat="dd/MM/yyyy"
                          selected={passenger.departure}
                          onChange={(selectedDate) =>
                            updatePassenger(index, "departure", selectedDate)
                          }
                          className="form-control crewfontt"
                          autoComplete="off"
                        />
                        <div className="d-flex mt-1">
                          <input
                            type="text"
                            className="form-control crewfontt timesttslip me-1"
                            placeholder="HH"
                            value={passenger.departureHours}
                            onChange={(e) =>
                              updatePassenger(
                                index,
                                "departureHours",
                                e.target.value
                              )
                            }
                            maxLength={2}
                          />
                          <input
                            type="text"
                            className="form-control crewfontt timesttslip"
                            placeholder="MM"
                            value={passenger.departureMinutes}
                            onChange={(e) =>
                              updatePassenger(
                                index,
                                "departureMinutes",
                                e.target.value
                              )
                            }
                            maxLength={2}
                          />
                        </div>
                        {passenger.departureTimeError && (
                          <div style={{ color: "red", fontSize: "10px" }}>
                            {passenger.departureTimeError}
                          </div>
                        )}
                        <div className="invalid"></div>
                      </div>
                      <div className="col-4 queheading">
                        <div> Arrival:</div>
                        <DatePicker
                          dateFormat="dd/MM/yyyy"
                          selected={passenger.arrival}
                          onChange={(selectedDate) =>
                            updatePassenger(index, "arrival", selectedDate)
                          }
                          className="form-control crewfontt"
                          autoComplete="off"
                          minDate={passenger.departure}
                        />
                        <div className="d-flex mt-1">
                          <input
                            type="text"
                            className="form-control crewfontt timesttslip me-1"
                            placeholder="HH"
                            value={passenger.arrivalHours}
                            onChange={(e) =>
                              updatePassenger(
                                index,
                                "arrivalHours",
                                e.target.value
                              )
                            }
                            maxLength={2}
                          />
                          <input
                            type="text"
                            className="form-control crewfontt timesttslip"
                            placeholder="MM"
                            value={passenger.arrivalMinutes}
                            onChange={(e) =>
                              updatePassenger(
                                index,
                                "arrivalMinutes",
                                e.target.value
                              )
                            }
                            maxLength={2}
                          />
                        </div>
                        {passenger.arrivalTimeError && (
                          <div style={{ color: "red", fontSize: "10px" }}>
                            {passenger.arrivalTimeError}
                          </div>
                        )}
                        <div className="invalid"></div>
                      </div>
                      <div className="col-4 queheading">
                        <div> PNR:</div>
                        <input
                          type="text"
                          className="form-control crewfontt"
                          placeholder=""
                          value={passenger.pnr}
                          onChange={(e) =>
                            updatePassenger(index, "pnr", e.target.value)
                          }
                        ></input>
                        <div className="invalid"></div>
                      </div>
                    </div>
                    {passengers.length > 1 && (
                      <div className="attention-section mt-2">
                        <div className="row date">
                          <div className="col-2 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => deletePassenger(index)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {index < passengers.length - 1 && (
                      <hr className="mt-3 mb-2" />
                    )}
                  </div>
                ))}
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-info addmorebtn"
                    onClick={addPassenger}
                  >
                    Add More
                  </button>
                </div>
              </div>
            </div>

            {/* <div className=" d-flex justify-content-center mt-2">
              <h5 className="twoktbsubhead">LETTER OF GUARANTEE</h5>
            </div>
            <div className="concern">TO WHOM IT MAY CONCERN</div>
            <div>
              We confirm that we are the protective agents for the above vessel,
              currently at ‘Fujairah Port , and the following personnel will be
              joining:
            </div>
            <div className="twoktbpassangerdetails mt-3 mb-3">
              {crewMembers.map((member, index) => (
                <div key={index} className="crew-entry">
                  <div className="date row mt-2">
                    <div className="col-6 queheading">
                      <div> Name:</div>
                      <textarea
                        type="text"
                        className="form-control passwidth crewfontt "
                        rows="1"
                        placeholder=""
                        value={member.name}
                        onChange={(e) =>
                          updateCrewMember(index, "name", e.target.value)
                        }
                      ></textarea>
                    </div>
                    <div className="col-6 queheading">
                      <div> Flight No:</div>
                      <input
                        type="text"
                        className="form-control crewfontt"
                        placeholder=""
                        value={member.flightNo}
                        onChange={(e) =>
                          updateCrewMember(index, "flightNo", e.target.value)
                        }
                      ></input>
                      <div className="invalid"></div>
                    </div>
                  </div>
                  <div className="date row mt-2">
                    <div className="col-6 queheading">
                      <div> Departure:</div>
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={member.departure}
                        onChange={(selectedDate) =>
                          updateCrewMember(index, "departure", selectedDate)
                        }
                        className="form-control crewfontt"
                        autoComplete="off"
                      />
                      <div className="invalid"></div>
                    </div>
                    <div className="col-6 queheading">
                      <div> Arrival:</div>
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={member.arrival}
                        onChange={(selectedDate) =>
                          updateCrewMember(index, "arrival", selectedDate)
                        }
                        className="form-control crewfontt"
                        autoComplete="off"
                        minDate={member.departure}
                      />
                      {member.arrival &&
                        member.departure &&
                        member.arrival < member.departure && (
                          <div style={{ color: "red", fontSize: "10px" }}>
                            Arrival date cannot be less than Departure date.
                          </div>
                        )}
                      <div className="invalid"></div>
                    </div>
                  </div>
                  {crewMembers.length > 1 && (
                    <div className="attention-section mt-2">
                      <div className="row date">
                        <div className="col-2 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => deleteCrewMember(index)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {index < crewMembers.length - 1 && (
                    <hr className="mt-3 mb-2" />
                  )}
                </div>
              ))}
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-info addmorebtn"
                  onClick={addCrewMember}
                >
                  Add More
                </button>
              </div>
            </div> */}
            {/* <div className="mt-3 mb-3">
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isRequestPermission"
                  checked={formData.isRequestPermission}
                  onChange={(e) =>
                    updateFormData("isRequestPermission", e.target.checked)
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="isRequestPermission"
                >
                  <strong>Request:</strong> Kindly flash the ‘OK TO BOARD’
                  message, confirming that we will meet the above-mentioned
                  passenger upon arrival at Dubai International Airport and
                  assist him in embarking on the vessel.
                </label>
              </div>
            </div>
            <div>
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isConfirmationPermission"
                  checked={formData.isConfirmationPermission}
                  onChange={(e) =>
                    updateFormData("isConfirmationPermission", e.target.checked)
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="isConfirmationPermission"
                >
                  <strong>Confirmation:</strong> We confirm the arrangements of
                  all immigration formalities upon arrival at Dubai Airport. As
                  attending agents, on behalf of the managers, we will bear all
                  expenses incurred during their stay, including medical
                  expenses and repatriation if necessary, and take full
                  responsibility for the above personnel.
                </label>
              </div>
            </div> */}
            {/* <div className="mt-3">
              Sincerely,<p className="mt-0 mb-0">Safna Thoombil</p>
              <p className="mt-0 mb-0">+971 52 134 7452</p>
              <p className="mt-0 mb-0 ">Crew Department</p>
              <p className="mt-0  mb-0">
                Transwave Marine Shipping Services LLC
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
        <DialogActions></DialogActions>
      </Dialog>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default NewOKTBAndLog;
