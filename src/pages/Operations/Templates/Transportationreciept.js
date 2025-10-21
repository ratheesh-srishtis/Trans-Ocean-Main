// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../../css/templates/transportationreciept.css";
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
import { format, parse } from "date-fns";
import PopUp from "../../PopUp";
import moment from "moment";
import Loader from "../../Loader";
const Transportationreciept = ({
  open,
  onClose,
  templates,
  charge,
  onSubmit,
  selectedTemplateName,
  selectedTemplate,
  selectedChargesType,
  selectedService,
  services,
  pdaResponse,
  isEdit,
}) => {
  const [date, setDate] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [formData, setFormData] = useState({
    jobTitle: "",
    refNo: "",
    agent: "",
    transporter: "",
    items: [
      {
        seaName: "",
        date: "",
        from: "",
        to: "",
      },
    ],
  });

  const handleDateChange = (date, index) => {
    console.log(date, index, "handleDateChange_trans");
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const updatedItems = [...formData.items];
    updatedItems[index].date = formattedDate;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      // Update items array for specific index
      const updatedItems = [...formData.items];
      updatedItems[index][name] = value;
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    } else {
      // Update top-level fields
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index][name] = value;
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { seaName: "", date: "", from: "", to: "" }],
    }));
  };

  const deleteItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const validateItems = () => {
    const isValid = formData.items.every(
      (item) =>
        item.seaName !== "" ||
        item.date !== "" ||
        item.from !== "" ||
        item.to !== ""
    );

    if (!isValid) {
      setMessage(
        "At least one field in each item (description, qty, unit) must have a value"
      );
      setOpenPopUp(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    console.log(selectedService?._id, "selectedService?._id");
    if (selectedService?._id) {
      const serviceName = selectedService?._id?.serviceName;
      setFormData((prevData) => ({
        ...prevData,
        jobTitle: serviceName, // Update jobTitle
      }));
    }
  }, [selectedService?._id]);

  const getItemName = (id, name) => {
    console.log(id, "getItemName?._id");

    if (name == "service" && id) {
      const service = services?.find((s) => s._id === id);
      console.log(service, "getItemName");
      return service ? service.serviceName : "Unknown Service";
    }
  };

  const handleSubmit = async () => {
    if (!date) {
      setDateError("Please select a date.");
      setMessage("Please select a date");
      setOpenPopUp(true);
    }
    if (date) {
      if (validateItems()) {
        // Submit form logic here
        const payload = {
          pdaChargeId: charge?._id,
          templateId: selectedTemplate,
          templateName: selectedTemplateName,
          jobTitle: formData.jobTitle,
          date: moment(date).format("YYYY-MM-DD"),
          // refNo: formData.refNo,
          agent: formData.agent,
          transporter: formData.transporter,
          items: formData.items,
        };
        setIsLoading(true);

        try {
          const response = await generateTemplatePDF(payload);
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
          setMessage("Template failed. Please try again");
          setOpenPopUp(true);
          onSubmit(error);
        }

        console.log("provision_payload>", payload);
        // Submit the payload to the server here
        console.log("Form submitted successfully", formData);
      }
    }
  };

  const handleMainDateChange = (date) => {
    setDate(date);
    setDateError(false);
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
        setDate(templateData?.date);
        setFormData({
          jobTitle: templateData?.jobTitle,
          // refNo: templateData?.refNo,
          agent: templateData?.agent,
          transporter: templateData?.transporter,
          items: templateData.items.map((item) => ({
            seaName: item.seaName || "",
            date: item.date || "",
            from: item.from || "",
            to: item.to || "",
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
            width: 1050,
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
              <h3>TRANSPORTATION RECEIPT</h3>
            </div>
            <div className="d-flex justify-content-between mb-5 mt-3">
              {/* <div className="col-2  ">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Reference No:
                </label>
                <input
                  type="text"
                  className="form-control crewfontt"
                  id="refNo"
                  name="refNo"
                  value={formData.refNo}
                  onChange={handleInputChange}
                />
              </div> */}
              <div className="col-2  ">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Date:
                </label>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={date && new Date(date)} // Inline date conversion for prefilled value
                  onChange={handleMainDateChange}
                  className="form-control date-input dateheight"
                  id="etd-picker"
                  placeholderText=""
                  autoComplete="off"
                  popperPlacement="left-start"
                />

                {dateError && <div className="invalid">{dateError}</div>}
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <div className="col-6  ">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  Job Title:
                </label>
                <input
                  type="text"
                  className="form-control crewfontt"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {formData.items.map((item, index) => (
              <div className=" transportgap" key={index}>
                <div className="transmar">
                  <div className="row d-flex">
                    <div className="col-4 slwidth">
                      <label
                        htmlFor={`seaname-${index}`}
                        className="form-label"
                      >
                        Name:
                      </label>
                      <input
                        type="text"
                        className="form-control crewfontt"
                        id={`seaname-${index}`}
                        name="seaName"
                        value={item.seaName}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>
                    <div className="col-4 slwidth ">
                      <label
                        htmlFor={`date-${index}`}
                        className="form-label transdate"
                      >
                        Date:
                      </label>

                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={item.date && new Date(item.date)} // Inline date conversion for prefilled value
                        onChange={(selectedDate) =>
                          handleDateChange(selectedDate, index)
                        }
                        className="form-control date-input dateheight"
                        id={`date-${index}`}
                        placeholderText=""
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="row d-flex">
                    <div className="col-4 slwidth">
                      <label htmlFor={`from-${index}`} className="form-label">
                        From:
                      </label>
                      <input
                        type="text"
                        className="form-control crewfontt"
                        id={`from-${index}`}
                        name="from"
                        value={item.from}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>
                    <div className="col-4 slwidth">
                      <label htmlFor={`to-${index}`} className="form-label">
                        To:
                      </label>
                      <input
                        type="text"
                        className="form-control crewfontt"
                        id={`to-${index}`}
                        name="to"
                        value={item.to}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>
                    <div className="col-1 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-danger reddangerbttn"
                        onClick={() => deleteItem(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
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

            <div className="d-flex gap-3   mt-2">
              <div className="col-6 transpoter">
                <label htmlFor="formFile" className="form-label">
                  Agent Name :
                </label>
                <input
                  type="text"
                  className="form-control crewfontt"
                  id="agent"
                  name="agent"
                  value={formData.agent}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-6 transpoter">
                <label htmlFor="formFile" className="form-label">
                  {" "}
                  Transporter Name :
                </label>
                <input
                  className="form-control crewfontt"
                  type="text"
                  id="transporter"
                  name="transporter"
                  value={formData.transporter}
                  onChange={handleInputChange}
                ></input>
              </div>
            </div>
            <div className="footer-button d-flex justify-content-center mt-5">
              <button type="button" className="btn btncancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn generate-buttona"
                onClick={handleSubmit}
              >
                Save
              </button>
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

export default Transportationreciept;

// {formData.items.length > 1 && (
//   <button
//     type="button"
//     className="btn btn-danger"
//     onClick={() => deleteItem(index)}
//   >
//     Delete
//   </button>
// )}
