// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../../css/templates/crewchangelist.css";
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
import PopUp from "../../PopUp";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../../Loader";
const CrewChangeList = ({
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
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [formValues, setFormValues] = useState({
    onSigners: [
      {
        crewName: "",
        flight: "",
        ATAMuscat: "",
        hotel: "",
        checkIn: "",
        checkOut: "",
        food: "",
        transportation: "",
        remarks: "",
      },
    ],
    offSigners: [
      {
        crewName: "",
        flight: "",
        ATDMuscat: "",
        hotel: "",
        checkIn: "",
        checkOut: "",
        food: "",
        transportation: "",
        remarks: "",
      },
    ],
  });

  useEffect(() => {
    console.log(formValues, "formValues");
  }, [formValues]);

  // Handle Input Change
  const handleInputChange = (e, index, type) => {
    const { name, value } = e.target;
    const updatedSigners = [...formValues[type]];
    updatedSigners[index][name] = value;
    setFormValues((prevState) => ({
      ...prevState,
      [type]: updatedSigners,
    }));
  };

  // Add New Signer
  const addNewSigner = (type) => {
    const newSigner = {
      crewName: "",
      flight: "",
      ATAMuscat: "",
      hotel: "",
      checkIn: "",
      checkOut: "",
      food: "",
      transportation: "",
      remarks: "",
    };
    setFormValues((prevState) => ({
      ...prevState,
      [type]: [...prevState[type], newSigner],
    }));
  };

  // Delete a Signer
  const deleteSigner = (type, index) => {
    const updatedSigners = [...formValues[type]];
    updatedSigners.splice(index, 1);
    setFormValues((prevState) => ({
      ...prevState,
      [type]: updatedSigners,
    }));
  };

  // Validation
  const isFormValid = () => {
    const validateSigners = (signers) =>
      signers.some((signer) =>
        Object.values(signer).some((value) => String(value).trim() !== "")
      );
    return (
      validateSigners(formValues.onSigners) ||
      validateSigners(formValues.offSigners)
    );
  };

  // Handle Save
  const handleSave = async () => {
    if (!isFormValid()) {
      setMessage(
        "At least one field must be filled in either On-Signers or Off-Signers."
      );
      setOpenPopUp(true);
      return;
    }

    const formattedOnSigners = formValues.onSigners.map((signer) => ({
      ...signer,
      ATAMuscat: signer.ATAMuscat
        ? moment(signer.ATAMuscat).format("YYYY-MM-DD HH:mm")
        : "",
      checkIn: signer.checkIn
        ? moment(signer.checkIn).format("YYYY-MM-DD")
        : "",
      checkOut: signer.checkOut
        ? moment(signer.checkOut).format("YYYY-MM-DD")
        : "",
    }));

    const formattedOffSigners = formValues.offSigners.map((signer) => ({
      ...signer,
      ATDMuscat: signer.ATDMuscat
        ? moment(signer.ATDMuscat).format("YYYY-MM-DD HH:mm")
        : "",
      checkIn: signer.checkIn
        ? moment(signer.checkIn).format("YYYY-MM-DD")
        : "",
      checkOut: signer.checkOut
        ? moment(signer.checkOut).format("YYYY-MM-DD")
        : "",
    }));

    console.log(formattedOnSigners, "formattedOnSigners saveCrewChange");
    console.log(formattedOffSigners, "formattedOffSigners saveCrewChange");

    const formattedOnSignersFiltered = formattedOnSigners.filter((signer) =>
      Object.values(signer).some(
        (value) => value && String(value).trim() !== ""
      )
    );
    const formattedOffSignersFiltered = formattedOffSigners.filter((signer) =>
      Object.values(signer).some(
        (value) => value && String(value).trim() !== ""
      )
    );

    const templateBpdy = {
      pdaChargeId: charge?._id,
      templateName: selectedTemplateName,
      onsigners: formattedOnSignersFiltered,
      offsigners: formattedOffSignersFiltered,
      templateId: selectedTemplate,
    };
    console.log(templateBpdy, "crew_change_payload");
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
    // Perform API call here using the payload
  };

  const fieldOrder = [
    "crewName",
    "flight",
    "ATAMuscat",
    "hotel",
    "checkIn",
    "checkOut",
    "food",
    "transportation",
    "remarks",
  ];
  const offSignersFieldOrder = [
    "crewName",
    "flight",
    "ATDMuscat",
    "hotel",
    "checkIn",
    "checkOut",
    "food",
    "transportation",
    "remarks",
  ];

  const handleDateChange = (date, index, group) => {
    const updatedGroup = [...formValues[group]];
    updatedGroup[index]["ATAMuscat"] = date;
    setFormValues((prevValues) => ({
      ...prevValues,
      [group]: updatedGroup,
    }));
  };
  const handlecheckInDateChange = (date, index, group) => {
    const updatedGroup = [...formValues[group]];
    updatedGroup[index]["checkIn"] = date;
    setFormValues((prevValues) => ({
      ...prevValues,
      [group]: updatedGroup,
    }));
  };
  const handlecheckOutDateChange = (date, index, group) => {
    const updatedGroup = [...formValues[group]];
    updatedGroup[index]["checkOut"] = date;
    setFormValues((prevValues) => ({
      ...prevValues,
      [group]: updatedGroup,
    }));
  };

  const handleOffsignersDateChange = (date, index, group) => {
    const updatedGroup = [...formValues[group]];
    updatedGroup[index]["ATDMuscat"] = date;
    setFormValues((prevValues) => ({
      ...prevValues,
      [group]: updatedGroup,
    }));
  };

  const handleOffsignerscheckInChange = (date, index, group) => {
    const updatedGroup = [...formValues[group]];
    updatedGroup[index]["checkIn"] = date;
    setFormValues((prevValues) => ({
      ...prevValues,
      [group]: updatedGroup,
    }));
  };
  const handleOffsignersCheckoutChange = (date, index, group) => {
    const updatedGroup = [...formValues[group]];
    updatedGroup[index]["checkOut"] = date;
    setFormValues((prevValues) => ({
      ...prevValues,
      [group]: updatedGroup,
    }));
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
        // Populate formValues with API data
        setFormValues({
          onSigners: templateData.onsigners.map((signer) => ({
            crewName: signer.crewName || "",
            flight: signer.flight || "",
            ATAMuscat: signer.ATAMuscat || "",
            hotel: signer.hotel || "",
            checkIn: signer.checkIn || "",
            checkOut: signer.checkOut || "",
            food: signer.food || "",
            transportation: signer.transportation || "",
            remarks: signer.remarks || "",
          })),
          offSigners: templateData.offsigners.map((signer) => ({
            crewName: signer.crewName || "",
            flight: signer.flight || "",
            ATDMuscat: signer.ATDMuscat || "",
            hotel: signer.hotel || "",
            checkIn: signer.checkIn || "",
            checkOut: signer.checkOut || "",
            food: signer.food || "",
            transportation: signer.transportation || "",
            remarks: signer.remarks || "",
          })),
        });
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

  return (
    <>
      <div>
        <Dialog
          sx={{
            width: 1100,
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
              <h3>CREW CHANGE LIST</h3>
            </div>
            <div className="onsign">ON SIGNERS</div>
            {formValues.onSigners.map((signer, index) => (
              <div key={index} className="d-flex flex-wrap signers-wrapper">
                {fieldOrder.map((field) =>
                  field === "ATAMuscat" ? (
                    <div className="col-3 crew" key={field}>
                      <label className="form-label crewfontt">
                        {
                          field
                            .replace(/([A-Z])/g, " $1") // Add space before capital letters
                            .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                            .toLowerCase() // Convert the rest to lowercase
                            .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                        }
                      </label>

                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={
                          signer[field] ? new Date(signer[field]) : null
                        }
                        onChange={(date) =>
                          handleDateChange(date, index, "onSigners")
                        }
                        className="form-control date-input dateheight"
                        placeholderText=""
                        autoComplete="off"
                      />
                    </div>
                  ) : field === "checkIn" ? (
                    <>
                      <div className="col-3 crew" key={field}>
                        <label className="form-label">
                          {
                            field
                              .replace(/([A-Z])/g, " $1") // Add space before capital letters
                              .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                              .toLowerCase() // Convert the rest to lowercase
                              .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                          }
                        </label>

                        <DatePicker
                          dateFormat="dd/MM/yyyy"
                          selected={
                            signer[field] ? new Date(signer[field]) : null
                          }
                          onChange={(date) =>
                            handlecheckInDateChange(date, index, "onSigners")
                          }
                          className="form-control date-input dateheight"
                          placeholderText=""
                          autoComplete="off"
                        />
                      </div>
                    </>
                  ) : field === "checkOut" ? (
                    <>
                      <div className="col-3 crew" key={field}>
                        <label className="form-label">
                          {
                            field
                              .replace(/([A-Z])/g, " $1") // Add space before capital letters
                              .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                              .toLowerCase() // Convert the rest to lowercase
                              .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                          }
                        </label>

                        <DatePicker
                          dateFormat="dd/MM/yyyy"
                          selected={
                            signer[field] ? new Date(signer[field]) : null
                          }
                          onChange={(date) =>
                            handlecheckOutDateChange(date, index, "onSigners")
                          }
                          className="form-control date-input dateheight"
                          placeholderText=""
                          autoComplete="off"
                        />
                      </div>
                    </>
                  ) : field === "remarks" ? (
                    <>
                      <div className="col-3 crew" key={field}>
                        <label className="form-label">
                          {
                            field
                              .replace(/([A-Z])/g, " $1") // Add space before capital letters
                              .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                              .toLowerCase() // Convert the rest to lowercase
                              .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                          }
                        </label>
                        <textarea
                          className="form-control crewfontt"
                          name={field}
                          value={signer[field]}
                          onChange={(e) =>
                            handleInputChange(e, index, "onSigners")
                          }
                          rows="1"
                        ></textarea>
                      </div>
                    </>
                  ) : (
                    <div className="col-3 crew" key={field}>
                      <label className="form-label">
                        {
                          field
                            .replace(/([A-Z])/g, " $1") // Add space before capital letters
                            .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                            .toLowerCase() // Convert the rest to lowercase
                            .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                        }
                      </label>

                      <input
                        type="text"
                        className="form-control crewfontt"
                        name={field}
                        value={signer[field]}
                        onChange={(e) =>
                          handleInputChange(e, index, "onSigners")
                        }
                      />
                    </div>
                  )
                )}
                {formValues.onSigners.length > 1 && (
                  <div className="">
                    <button
                      type="button"
                      className="btn generate-buttona crewbtn"
                      onClick={() => deleteSigner("onSigners", index)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn generate-buttona addoncrewbtn"
              onClick={() => addNewSigner("onSigners")}
            >
              Add On Signer
            </button>

            <div className="onsign mt-5">OFF SIGNERS</div>

            {formValues.offSigners.map((signer, index) => (
              <div key={index} className="d-flex flex-wrap signers-wrapper">
                {offSignersFieldOrder.map((field) =>
                  field === "ATDMuscat" ? (
                    <div className="col-3 crew" key={field}>
                      <label className="form-label">
                        {
                          field
                            .replace(/([A-Z])/g, " $1") // Add space before capital letters
                            .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                            .toLowerCase() // Convert the rest to lowercase
                            .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                        }
                      </label>

                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={
                          signer[field] ? new Date(signer[field]) : null
                        }
                        onChange={(date) =>
                          handleOffsignersDateChange(date, index, "offSigners")
                        }
                        className="form-control date-input dateheight"
                        placeholderText=""
                        autoComplete="off"
                      />
                    </div>
                  ) : field === "checkIn" ? (
                    <>
                      <div className="col-3 crew" key={field}>
                        <label className="form-label">
                          {
                            field
                              .replace(/([A-Z])/g, " $1") // Add space before capital letters
                              .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                              .toLowerCase() // Convert the rest to lowercase
                              .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                          }
                        </label>

                        <DatePicker
                          dateFormat="dd/MM/yyyy"
                          selected={
                            signer[field] ? new Date(signer[field]) : null
                          }
                          onChange={(date) =>
                            handleOffsignerscheckInChange(
                              date,
                              index,
                              "offSigners"
                            )
                          }
                          className="form-control date-input dateheight"
                          placeholderText=""
                          autoComplete="off"
                        />
                      </div>
                    </>
                  ) : field === "checkOut" ? (
                    <>
                      <div className="col-3 crew" key={field}>
                        <label className="form-label">
                          {
                            field
                              .replace(/([A-Z])/g, " $1") // Add space before capital letters
                              .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                              .toLowerCase() // Convert the rest to lowercase
                              .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                          }
                        </label>

                        <DatePicker
                          dateFormat="dd/MM/yyyy"
                          selected={
                            signer[field] ? new Date(signer[field]) : null
                          }
                          onChange={(date) =>
                            handleOffsignersCheckoutChange(
                              date,
                              index,
                              "offSigners"
                            )
                          }
                          className="form-control date-input dateheight"
                          placeholderText=""
                          autoComplete="off"
                        />
                      </div>
                    </>
                  ) : field === "remarks" ? (
                    <>
                      <div className="col-3 crew" key={field}>
                        <label className="form-label">
                          {
                            field
                              .replace(/([A-Z])/g, " $1") // Add space before capital letters
                              .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                              .toLowerCase() // Convert the rest to lowercase
                              .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                          }
                        </label>
                        <textarea
                          className="form-control crewfontt"
                          name={field}
                          value={signer[field]}
                          onChange={(e) =>
                            handleInputChange(e, index, "offSigners")
                          }
                          rows="1"
                        ></textarea>
                      </div>
                    </>
                  ) : (
                    <div className="col-3 crew" key={field}>
                      <label className="form-label">
                        {
                          field
                            .replace(/([A-Z])/g, " $1") // Add space before capital letters
                            .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the first word
                            .toLowerCase() // Convert the rest to lowercase
                            .replace(/\b\w/g, (str) => str.toUpperCase()) // Capitalize each word
                        }
                      </label>

                      <input
                        type="text"
                        className="form-control crewfontt"
                        name={field}
                        value={signer[field]}
                        onChange={(e) =>
                          handleInputChange(e, index, "offSigners")
                        }
                      />
                    </div>
                  )
                )}
                {formValues.offSigners.length > 1 && (
                  <div className="">
                    <button
                      type="button"
                      className="btn generate-buttona crewbtn"
                      onClick={() => deleteSigner("offSigners", index)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn generate-buttona addoncrewbtn"
              onClick={() => addNewSigner("offSigners")}
            >
              Add Off Signer
            </button>

            <div className="footer-button d-flex justify-content-center mt-5">
              <button type="button" className="btn btncancel" onClick={onClose}>
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

export default CrewChangeList;
