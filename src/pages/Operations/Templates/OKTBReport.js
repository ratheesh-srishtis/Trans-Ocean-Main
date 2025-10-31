// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../../css/templates/oktb.css";
import { uploadConnectionFlightImage } from "../../../services/apiService";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import DatePicker from "react-datepicker";
import {
  generateTemplatePDF,
  getPdaTemplateDataAPI,
} from "../../../services/apiService";
import PopUp from "../../PopUp";
import { format } from "date-fns";
import moment from "moment";
import Loader from "../../Loader";
const OKTBReport = ({
  open,
  onClose,
  templates,
  charge,
  selectedTemplateName,
  onSubmit,
  selectedTemplate,
  pdaResponse,
  isEdit,
  opsPhoneNumber,
}) => {
  console.log(templates, "templates");
  console.log(charge, "charge_OKTBReport");
  console.log(opsPhoneNumber, "opsPhoneNumber_OKTBReport");
  console.log(selectedTemplateName, "selectedTemplateName");
  console.log(pdaResponse, "pdaResponse");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [to, setTo] = useState(null);
  const [footerMessage, setFooterMessage] = useState("");
  const [isCustomMessage, setIsCustomMessage] = useState(false); // <-- Track manual override
  const [faxNumber, setFaxNumber] = useState(null);
  const [attn, setAttn] = useState(null);
  const [pages, setPages] = useState(null);
  const [from, setfrom] = useState(null);
  const [telephoneNumber, setTelephoneNumber] = useState(null);
  const [date, setDate] = useState(null);
  const [refNumber, setRefNumber] = useState(null);
  const [bookingRef, setBookingRef] = useState(null);
  const [airportArrivalDetails, setSirportArrivalDetails] = useState("");

  // Error states
  const [toError, setToError] = useState(null);
  const [faxNumberError, setFaxNumberError] = useState(null);
  const [pagesError, setPagesError] = useState(null);
  const [fromError, setFromError] = useState(null);
  const [telephoneNumberError, setTelephoneNumberError] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [refNumberError, setRefNumberError] = useState(null);
  const [bookingRefError, setBookingRefError] = useState(null);

  const [passengers, setPassengers] = useState([
    {
      passengersName: "",
      passportNo: "",
    },
  ]);

  const [passengersErrors, setPassengersErrors] = useState([
    {
      passengersName: "",
      passportNo: "",
    },
  ]);

  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "to") {
      setTo(value);
      setToError(false);
    } else if (name === "fax_number") {
      setFaxNumber(value);
      setFaxNumberError(false);
    } else if (name === "attn") {
      setAttn(value);
    } else if (name === "pages") {
      setPages(value);
      setPagesError(false);
    } else if (name === "from") {
      setfrom(value);
      setFromError(false);
    } else if (name === "telephone_number") {
      setTelephoneNumber(value);
      setTelephoneNumberError(false);
    } else if (name === "ref_number") {
      setRefNumber(value);
      setRefNumberError(false);
    } else if (name === "booking_ref") {
      setBookingRef(value);
      setBookingRefError(false);
    } else if (name === "airport_arrival_details") {
      setSirportArrivalDetails(value);
    }
  };

  const saveTemplate = async (status) => {
    // Reset all error states
    setToError(null);
    setFaxNumberError(null);
    setPagesError(null);
    setFromError(null);
    setTelephoneNumberError(null);
    setDateError(null);
    setRefNumberError(null);
    setBookingRefError(null);
    const newPassengersErrors = [...passengersErrors];

    // Validation logic
    let isValid = true;

    if (!to) {
      setToError("Please enter the 'To' field.");
      isValid = false;
    }
    if (!faxNumber) {
      setFaxNumberError("Please enter the fax number.");
      isValid = false;
    }

    if (!pages) {
      setPagesError("Please enter the number of pages.");
      isValid = false;
    }
    if (!from) {
      setFromError("Please enter the 'From' field.");
      isValid = false;
    }
    if (!telephoneNumber) {
      setTelephoneNumberError("Please enter the telephone number.");
      isValid = false;
    }
    if (!date) {
      setDateError("Please select a date.");
      isValid = false;
    }
    // if (!refNumber) {
    //   setRefNumberError("Please enter the reference number.");
    //   isValid = false;
    // }
    if (!bookingRef) {
      setBookingRefError("Please enter the booking reference number.");
      isValid = false;
    }

    // check atleast one passenger should be mandatory
    if (!passengers[0]?.passengersName?.trim()) {
      newPassengersErrors[0].passengersName = "Passenger name is required";
      isValid = false;
    }
    if (!passengers[0].passportNo.trim()) {
      newPassengersErrors[0].passportNo = "Passport number is required";
      isValid = false;
    }

    setPassengersErrors(newPassengersErrors);

    // filter valid passengers objects

    const validPassengers = passengers?.filter(
      (passenger) =>
        passenger?.passengersName.trim() !== "" ||
        passenger?.passportNo?.trim() !== ""
    );

    // If any field is invalid, do not proceed with the API call
    if (!isValid) {
      setMessage("Please fill all the required fields correctly.");
      setOpenPopUp(true);
      return;
    }

    // Construct the template body

    let templateBody = {
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      to: to,
      faxNo: faxNumber,
      attn: attn,
      pages: pages,
      from: from,
      telNo: telephoneNumber,
      date: moment(date).format("YYYY-MM-DD"),
      // refNo: refNumber,
      bookingRefNo: bookingRef,
      arrivalFlightDetails: airportArrivalDetails,
      description: footerMessage,
      passengers: validPassengers,
      connectionFlightImage: uploadedFiles,
    };

    // Proceed with the API call
    setIsLoading(true);

    try {
      const response = await generateTemplatePDF(templateBody);
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

  const getPdaTemplateData = async () => {
    try {
      let userData = {
        pdaChargeId: charge?._id,
        templateId: selectedTemplate,
      };
      const response = await getPdaTemplateDataAPI(userData);

      if (response?.templateData) {
        const templateData = response.templateData;
        console.log(templateData, "templateData");

        setTo(templateData?.to);
        setFaxNumber(templateData?.faxNo);
        setAttn(templateData?.attn);
        setPages(templateData?.pages);
        setfrom(templateData?.from);
        setTelephoneNumber(templateData?.telNo);
        setDate(
          templateData?.date
            ? moment.utc(templateData?.date).format("YYYY-MM-DD")
            : ""
        );

        // setRefNumber(templateData?.refNo);
        setBookingRef(templateData?.bookingRefNo);
        setUploadedFiles(templateData?.connectionFlightImage);
        setSirportArrivalDetails(templateData?.arrivalFlightDetails);
        setFooterMessage(templateData?.description);
        setIsCustomMessage(true); // Prevent auto-overwrites

        const cleanedData = templateData?.passengers?.map((passenger) => ({
          passengersName: passenger?.passengersName,
          passportNo: passenger?.passportNo,
        }));
        setPassengers(cleanedData);

        setPassengersErrors(
          cleanedData.map(() => ({
            passengersName: "",
            passportNo: "",
          }))
        );
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
    console.log(to, "to_value");
  }, [to]);

  // Regenerate message only if not custom
  useEffect(() => {
    if (!isCustomMessage) {
      setFooterMessage(`We TRANS OCEAN MARITIME SERVICE LLC are sponsoring the above persons at ${
        to ? to : ""
      } Airport on under our company visa and would be grateful if you would please arrange to send To Board message to your respective above country offices and include this message in your reservation, such that they are allowed to board the flight.

If you need any clarifications, please contact us on: ${opsPhoneNumber}
Thanking you.

For TRANS OCEAN MARITIME SERVICES LLC
As agents only`);
    }
  }, [to, opsPhoneNumber, isCustomMessage]);

  const handlePassengersChange = (index, field, value) => {
    console.log(index, "index_handlePassengersChange");
    console.log(field, "field_handlePassengersChange");
    console.log(value, "value_handlePassengersChange");
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);

    const newPassengersError = [...passengersErrors];
    newPassengersError[index][field] = "";
    setPassengersErrors(newPassengersError);
  };

  const addMore = () => {
    setPassengers([
      ...passengers,
      {
        passengersName: "",
        passportNo: "",
      },
    ]);
    setPassengersErrors([
      ...passengersErrors,
      {
        passengersName: "",
        passportNo: "",
      },
    ]);
  };

  const deletePassenger = (index) => {
    const newPassengers = passengers?.filter((_, i) => i !== index);
    setPassengers(newPassengers);

    const newPassengersErrors = passengersErrors?.filter((_, i) => i !== index);
    setPassengersErrors(newPassengersErrors);
  };

  useEffect(() => {
    console.log(passengers, "passengers");
  }, [passengers]);

  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const documentsUpload = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const formData = new FormData();

      // Append all selected files to FormData
      Array.from(event.target.files).forEach((file) => {
        console.log(file, "file");
        formData.append("file", file); // "files" is the expected key for your API
      });

      try {
        setUploadStatus("Uploading...");
        const response = await uploadConnectionFlightImage(formData);

        if (response.status) {
          setUploadStatus("Upload successful!");
          // setUploadedFiles((prevFiles) => [...prevFiles, ...response.data]); // Append new files to existing ones
          setUploadedFiles((prevFiles) => [...prevFiles, response.data]); // ✅ fixed
        } else {
          setUploadStatus("Upload failed. Please try again.");
        }
      } catch (error) {
        console.error("File upload error:", error);
        setUploadStatus("An error occurred during upload.");
      }
    }
  };

  useEffect(() => {
    console.log("Uploaded files updated:", uploadedFiles);
  }, [uploadedFiles]); // 👈 runs every time uploadedFiles changes

  const handleFileDelete = (fileToDelete, index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <>
      <div>
        <Dialog
          sx={{
            width: 800,
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
            <DialogTitle></DialogTitle>
            <div className="closeicon">
              <i className="bi bi-x-lg " onClick={onClose}></i>
            </div>
          </div>
          <DialogContent style={{ marginBottom: "40px" }}>
            <div className="mainoktb ">
              <div className=" d-flex justify-content-center">
                <h5>OKTB MESSAGE/LETTER OF GUARANTEE</h5>
              </div>
              <div className="cont d-flex justify-content-between ">
                <div className="col-4 queheading">
                  <div> To:</div>
                  {/* <div className="anshead"> Muscat Airport</div> */}
                  <input
                    type="email"
                    className="form-control answidth crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="to"
                    value={to}
                    onChange={handleInputChange}
                  ></input>
                  {toError && <div className="invalid">{toError}</div>}
                </div>

                <div className="col-4 queheading">
                  <div> Fax No:</div>
                  <input
                    type="number"
                    className="form-control answidth crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="fax_number"
                    value={faxNumber}
                    onChange={handleInputChange}
                  ></input>
                  {faxNumberError && (
                    <div className="invalid">{faxNumberError}</div>
                  )}
                </div>
                <div className="col-4 queheada">
                  <div>Attn:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="attn"
                    value={attn}
                    onChange={handleInputChange}
                  ></input>
                </div>
              </div>
              <div className="cont d-flex justify-content-between ">
                <div className="col-4 queheading">
                  <div> Pages:</div>
                  {/* <div className="anshead"> Muscat Airport</div> */}
                  <input
                    type="number"
                    className="form-control answidth crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="pages"
                    value={pages}
                    onChange={handleInputChange}
                  ></input>
                  {pagesError && <div className="invalid">{pagesError}</div>}
                </div>
                <div className="col-4 queheading">
                  <div> From:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="from"
                    value={from}
                    onChange={handleInputChange}
                  ></input>
                  {fromError && <div className="invalid">{fromError}</div>}
                </div>
                <div className="col-4 queheada">
                  <div> Tel No:</div>
                  <input
                    type="number"
                    className="form-control answidth crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="telephone_number"
                    value={telephoneNumber}
                    onChange={handleInputChange}
                  ></input>
                  {telephoneNumberError && (
                    <div className="invalid">{telephoneNumberError}</div>
                  )}
                </div>
              </div>

              <div className="date  ">
                <div className="col-4 queheading ">
                  <div> Date:</div>
                  <DatePicker
                    dateFormat="dd/MM/yyyy" // Date format without time
                    selected={date ? new Date(date) : null}
                    onChange={(selectedDate) => {
                      setDate(selectedDate); // Set the formatted date
                      setDateError(false); // Clear error if a date is selected
                    }}
                    className="form-control answidth date-input dateheight"
                    id="date-picker"
                    placeholderText=""
                    autoComplete="off"
                  />
                  {dateError && <div className="invalid">{dateError}</div>}
                </div>
                {/* <div className="col-4 queheada">
                  <div> Ref#:</div>
                  <input
                    type="text"
                    className="form-control answidth crewfontt"
                    id="exampleFormControlInput1"
                    placeholder=""
                    name="ref_number"
                    value={refNumber}
                    onChange={handleInputChange}
                  ></input>
                  {refNumberError && (
                    <div className="invalid">{refNumberError}</div>
                  )}
                </div> */}
              </div>
              <div className="urgent">For urgent attention</div>
              <div className="dear">
                <div>
                  Dear Sir,
                  <br></br> This is to advise that the following persons are
                  arriving at {to ? to : "Muscat"} Airport as follows:
                  <br />
                </div>
                <div className="date row">
                  <div className="col-4 queheading">
                    <div> Booking Ref:</div>
                    <input
                      type="text"
                      className="form-control crewfontt"
                      id="exampleFormControlInput1"
                      placeholder=""
                      name="booking_ref"
                      value={bookingRef}
                      onChange={handleInputChange}
                    ></input>
                    {bookingRefError && (
                      <div className="invalid">{bookingRefError}</div>
                    )}
                  </div>
                  <div className="col-8 queheading">
                    <div> Airport Arrival Details:</div>
                    <textarea
                      type="text"
                      className="form-control passwidth crewfontt "
                      id="exampleFormControlInput1"
                      rows="1"
                      placeholder=""
                      name="airport_arrival_details"
                      value={airportArrivalDetails}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>

                <div className="typesofcall-row ">
                  <div className="row align-items-start mt-3">
                    <div className="mb-2 col-12 docuplo">
                      <label htmlFor="formFile" className="form-label">
                        Connection Flight Images Upload:
                      </label>
                      <input
                        className="form-control documentsfsize linheight"
                        type="file"
                        id="portofolio"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          documentsUpload(e); // Call your upload handler
                          e.target.value = ""; // Reset the file input value to hide uploaded file names
                        }}
                      ></input>
                    </div>
                    <div className="mb-2 col-12">
                      {uploadedFiles && uploadedFiles?.length > 0 && (
                        <>
                          <div className="templatelink">Uploaded Files:</div>
                          <div className="templateouter">
                            {uploadedFiles?.length > 0 &&
                              uploadedFiles?.map((file, index) => {
                                return (
                                  <>
                                    <div className="d-flex justify-content-between ">
                                      <div className="tempgenerated ">
                                        {file?.originalName}
                                      </div>
                                      <div className="d-flex">
                                        <div
                                          className="icondown"
                                          onClick={() =>
                                            window.open(
                                              `${process.env.REACT_APP_ASSET_URL}${file?.url}`,
                                              "_blank"
                                            )
                                          }
                                        >
                                          <i className="bi bi-eye"></i>
                                        </div>
                                        <div
                                          className="iconpdf"
                                          onClick={() =>
                                            handleFileDelete(file, index)
                                          }
                                        >
                                          <i className="bi bi-trash"></i>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                );
                              })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="attention-section mt-2">
                  {passengers?.map((passenger, index) => (
                    <>
                      <div key={index} className="row date">
                        <div className="col-4 queheading">
                          <div>Passport No:</div>
                          <input
                            type="text"
                            className="form-control passpheight"
                            id="exampleFormControlInput1"
                            placeholder=""
                            name="passportNo"
                            value={passenger?.passportNo}
                            onChange={(e) => {
                              handlePassengersChange(
                                index,
                                "passportNo",
                                e.target.value
                              );
                            }}
                          ></input>
                          {passengersErrors[index]?.passportNo && (
                            <div className="invalid">
                              {passengersErrors[index]?.passportNo}
                            </div>
                          )}
                        </div>
                        <div className="col-6 queheading">
                          <div> Passenger Name:</div>
                          <textarea
                            type="text"
                            className="form-control passwidth crewfontt"
                            id="exampleFormControlInput1"
                            rows="1"
                            placeholder=""
                            name="passengersName"
                            value={passenger?.passengersName}
                            onChange={(e) => {
                              handlePassengersChange(
                                index,
                                "passengersName",
                                e.target.value
                              );
                            }}
                          ></textarea>
                          {passengersErrors[index]?.passengersName && (
                            <div className="invalid">
                              {passengersErrors[index]?.passengersName}
                            </div>
                          )}
                        </div>
                        <div className="col-2 d-flex align-items-end">
                          {index !== 0 && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => deletePassenger(index)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  ))}

                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn btn-info addmorebtn"
                      onClick={addMore}
                    >
                      Add More
                    </button>
                  </div>
                </div>

                {/* <div className="wetrans">
                  We TRANS OCEAN MARITIME SERVICE LLC are sponsoring the above
                  persons at {to ? to : "Muscat"} Airport on under our company
                  visa and would be grateful if you would please arrange to send
                  To Board message to your respective above country offices and
                  include this message in your reservation, such that they are
                  allowed to board the flight.
                </div>
                <div className="clarification">
                  If you need any clarifications, please contact us on:{" "}
                  {opsPhoneNumber}
                  <br />
                  Thanking you.
                </div>
                <div className="agents">
                  For TRANS OCEAN MARITIME SERVICES LLC As agents only
                  <br />
                </div> */}

                <div className="wetrans">
                  <textarea
                    value={footerMessage}
                    onChange={(e) => setFooterMessage(e.target.value)}
                    rows={10}
                    className="form-control"
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                </div>
              </div>
              <div className="footer-button d-flex justify-content-center mt-3">
                <button
                  type="button"
                  className="btn btncancel"
                  onClick={onClose}
                >
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default OKTBReport;
