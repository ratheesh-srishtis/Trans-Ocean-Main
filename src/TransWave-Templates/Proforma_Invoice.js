import React, { useState, useEffect } from "react";
import "./Transwave-Templates-css/Proforma_Invoice.css";
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
const ProformaInvoice = ({
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
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [date, setDate] = React.useState(null);
  const [clientCompany, setClientCompany] = React.useState("");
  const [invoiceNo, setInvoiceNo] = React.useState("");
  const [currency, setCurrency] = React.useState("");
  const [hsCode, setHsCode] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [countryOfOrigin, setCountryOfOrigin] = React.useState("");
  const [forField, setForField] = React.useState("");
  const [vatPercentage, setVatPercentage] = React.useState("");
  const [vatPrice, setVatPrice] = React.useState("");
  const [items, setItems] = React.useState([
    { slNo: "", description: "", quantity: "", price: "", total: "" },
  ]);
  const [toDate, setToDate] = React.useState(null);
  const [attn, setAttn] = React.useState("");
  const [subject, setSubject] = React.useState("");

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

    setDate(parseDate(dataFromAPI.date));
    setCurrency(dataFromAPI.currency || "");
    setHsCode(dataFromAPI.hsCode || "");
    setWeight(dataFromAPI.weight || "");
    setCountryOfOrigin(dataFromAPI.countryOfOrigin || "");
    setForField(dataFromAPI.forField || "");
    setVatPercentage(dataFromAPI.vatPercentage || "");
    setVatPrice(dataFromAPI.vatPrice || "");
    setItems(
      Array.isArray(dataFromAPI.items) && dataFromAPI.items.length > 0
        ? dataFromAPI.items.map((item) => ({
            description: item.description || "",
            quantity: item.quantity || "",
            price: item.price || "",
          }))
        : [{ description: "", quantity: "", price: "" }]
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

  const addItem = () => {
    setItems([...items, { description: "", quantity: "", price: "" }]);
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
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    // Date is mandatory
    if (!date) {
      setMessage("Please select a date.");
      setOpenPopUp(true);
      return;
    }
    const payload = {
      pdaChargeId: charge?._id,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      date: formatDate(date),
      currency,
      hsCode,
      weight,
      countryOfOrigin,
      forField,
      vatPercentage,
      vatPrice:
        vatPrice === undefined || vatPrice === null || vatPrice === ""
          ? ""
          : vatPrice,
      items: items.map(({ description, quantity, price }) => ({
        description,
        quantity,
        price,
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
              <h5 className="twoktbsubhead"> PROFORMA INVOICE </h5>
            </div>
            <div className="cont row d-flex justify-content-between ">
              <div className="col-6 queheading">
                <div> Date:</div>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={date}
                  onChange={setDate}
                  className="form-control answidth crewfontt"
                  placeholderText="Select date"
                  autoComplete="off"
                />
                <div className="invalid"></div>
              </div>
            </div>
            <div className="cont row d-flex justify-content-between "></div>
            <div className="cont row d-flex justify-content-between ">
              <div className="col-6 queheading">
                <div>Currency :</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  id="exampleFormControlInput1"
                  placeholder=""
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="dear">
              <div className="twoktbpassangerdetails mt-2">
                {items.map((item, idx) => (
                  <div key={idx}>
                    <div className="date row mt-2">
                      <div className="col-6 queheading">
                        <div> Description:</div>
                        <input
                          type="text"
                          className="form-control crewfontt"
                          placeholder=""
                          value={item.description}
                          onChange={(e) =>
                            updateItem(idx, "description", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-6 queheading">
                        <div> Quantity:</div>
                        <input
                          type="number"
                          className="form-control crewfontt"
                          placeholder=""
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(idx, "quantity", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="date row mt-2">
                      <div className="col-6 queheading">
                        <div> Price:</div>
                        <input
                          type="number"
                          className="form-control crewfontt"
                          placeholder=""
                          value={item.price}
                          onChange={(e) =>
                            updateItem(idx, "price", e.target.value)
                          }
                        />
                      </div>
                      {items.length > 1 && (
                        <>
                          <div className="col-2 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => deleteItem(idx)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {idx < items.length - 1 && <hr className="mt-2 mb-2" />}
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
            <div className="cont row d-flex justify-content-between mt-3 ">
              <div className="col-4 queheading">
                <div> HS Code:</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  placeholder=""
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                ></input>
                <div className="invalid"></div>
              </div>
              <div className="col-4 queheading">
                <div> Weight:</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  id="exampleFormControlInput1"
                  placeholder=""
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                ></input>
                <div className="invalid"></div>
              </div>
              <div className="col-4 queheading">
                <div> Country of Origin :</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  id="exampleFormControlInput1"
                  placeholder=""
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                ></input>
                <div className="invalid"></div>
              </div>
              <div className="col-4 queheading">
                <div> For :</div>
                <input
                  type="text"
                  className="form-control answidth crewfontt"
                  id="exampleFormControlInput1"
                  placeholder=""
                  value={forField}
                  onChange={(e) => setForField(e.target.value)}
                ></input>
                <div className="invalid"></div>
              </div>
              <div className="col-4 queheading">
                <div>VAT Percentage :</div>
                <input
                  type="number"
                  className="form-control answidth crewfontt"
                  value={vatPercentage}
                  onChange={(e) => setVatPercentage(e.target.value)}
                />
                <div className="invalid"></div>
              </div>
              <div className="col-4 queheading">
                <div>VAT Price :</div>
                <input
                  type="number"
                  className="form-control answidth crewfontt"
                  value={vatPrice}
                  onChange={(e) => setVatPrice(e.target.value)}
                />
                <div className="invalid"></div>
              </div>
            </div>
            {/* <div className="mt-3">
              FOR, <p className="mt-2">TRANS WAVE MARINE SHIPPING SERVICES</p>
            </div> */}
            <div className="footer-button d-flex justify-content-center mt-3">
              <button
                type="button"
                className="btn btncancel"
                onClick={handleClose}
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

export default ProformaInvoice;
