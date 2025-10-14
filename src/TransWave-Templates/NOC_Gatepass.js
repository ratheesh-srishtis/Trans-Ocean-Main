import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Transwave-Templates-css/NOC_Gatepass.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

const NOCGatepass = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
}) => {
  const dataFromAPI = {
    date: "15/08/2025",
    address: "Address :\n",
    attn: "Attn:",
    cc: "CC:",
    subject: "Subject:",
    purpose: "sdf",
    sharjahPortRegCardNo: "sdfsdf",
    companyName: "sdfsdf",
    persons: [
      {
        name: "sdf",
        nationality: "sdf",
        eidNo: "sdsdfsdf",
      },
      {
        name: "sdfsd",
        nationality: "fsdfsdf",
        eidNo: "sdfdsf",
      },
    ],
  };
  // State for all required fields
  const [date, setDate] = useState(null);
  const [address, setAddress] = useState("");
  const [attn, setAttn] = useState("");
  const [cc, setCC] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [sharjahPortRegCardNo, setSharjahPortRegCardNo] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Array for Name, Nationality, EID No
  const [persons, setPersons] = useState([
    { name: "", nationality: "", eidNo: "" },
  ]);

  React.useEffect(() => {
    // Helper to convert dd/MM/yyyy string to Date object
    const parseDate = (str) => {
      if (!str) return null;
      const [day, month, year] = str.split("/");
      return new Date(`${year}-${month}-${day}`);
    };

    setDate(parseDate(dataFromAPI.date));
    setAddress(dataFromAPI.address || "");
    setAttn(dataFromAPI.attn || "");
    setCC(dataFromAPI.cc || "");
    setSubject(dataFromAPI.subject || "");
    setPurpose(dataFromAPI.purpose || "");
    setSharjahPortRegCardNo(dataFromAPI.sharjahPortRegCardNo || "");
    setCompanyName(dataFromAPI.companyName || "");
    setPersons(
      Array.isArray(dataFromAPI.persons) && dataFromAPI.persons.length > 0
        ? dataFromAPI.persons.map((person) => ({
            name: person.name || "",
            nationality: person.nationality || "",
            eidNo: person.eidNo || "",
          }))
        : [{ name: "", nationality: "", eidNo: "" }]
    );
  }, []);

  const addPerson = () => {
    setPersons([...persons, { name: "", nationality: "", eidNo: "" }]);
  };

  const deletePerson = (idx) => {
    if (persons.length > 1) {
      setPersons(persons.filter((_, i) => i !== idx));
    }
  };

  const updatePerson = (idx, field, value) => {
    setPersons(
      persons.map((person, i) =>
        i === idx ? { ...person, [field]: value } : person
      )
    );
  };

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

  // Collect all values for API payload
  const handleSave = () => {
    const payload = {
      date: date ? date.toLocaleDateString("en-GB") : null,
      address,
      attn,
      cc,
      subject,
      purpose,
      sharjahPortRegCardNo,
      companyName,
      persons: persons.map((person) => ({ ...person })),
    };
    console.log("API Payload:", payload);
    // TODO: Pass payload to API
  };

  return (
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
            <h5 className="twoktbsubhead"> NOC GATEPASS </h5>
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
            <div className="col-6 queheading">
              <div> Address :</div>
              <textarea
                type="text"
                className="form-control passwidth crewfontt "
                rows="1"
                placeholder=""
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="cont row d-flex justify-content-between ">
            <div className="col-6 queheading">
              <div> Attn:</div>
              <input
                type="text"
                className="form-control answidth crewfontt"
                value={attn}
                onChange={(e) => setAttn(e.target.value)}
                placeholder=""
              />
              <div className="invalid"></div>
            </div>
            <div className="col-6 queheading">
              <div> CC:</div>
              <input
                type="text"
                className="form-control answidth crewfontt"
                value={cc}
                onChange={(e) => setCC(e.target.value)}
                placeholder=""
              />
              <div className="invalid"></div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 queheading">
              <div>Subject:</div>
              <input
                type="text"
                className="form-control answidth crewfontt"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder=""
              />
            </div>
          </div>
          <div className="dear">
            <div className="mt-3">
              Dear Sir,
              <p className="mt-2">
                With reference to the above, you are kindly requested to allow
                the below persons entry/exit to the vessel{" "}
                <strong>“MT NARSIMHAA”</strong> in Port{" "}
                <strong>Khalid CREEK</strong> from <strong> 05.09.2024 </strong>{" "}
                to <strong> 11.09.2024 </strong>
              </p>
            </div>
            <div className="twoktbpassangerdetails mt-2">
              {persons.map((person, idx) => (
                <div key={idx}>
                  <div className="date row mt-2">
                    <div className="col-4 queheading">
                      <div> Name:</div>
                      <textarea
                        type="text"
                        className="form-control passwidth crewfontt "
                        rows="1"
                        placeholder=""
                        value={person.name}
                        onChange={(e) =>
                          updatePerson(idx, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-4 queheading">
                      <div> Nationality:</div>
                      <input
                        type="text"
                        className="form-control crewfontt"
                        placeholder=""
                        value={person.nationality}
                        onChange={(e) =>
                          updatePerson(idx, "nationality", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-4 queheading">
                      <div> EID No:</div>
                      <input
                        type="text"
                        className="form-control crewfontt"
                        placeholder=""
                        value={person.eidNo}
                        onChange={(e) =>
                          updatePerson(idx, "eidNo", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="attention-section mt-2">
                    <div className="row date">
                      <div className="col-2 d-flex align-items-end">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => deletePerson(idx)}
                          disabled={persons.length === 1}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {idx < persons.length - 1 && <hr className="mt-3 mb-2" />}
                </div>
              ))}
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-info addmorebtn"
                  onClick={addPerson}
                >
                  Add More
                </button>
              </div>
            </div>
          </div>
          <div className="cont row d-flex justify-content-between mt-3 ">
            <div className="col-3 queheading">
              <div> Purpose:</div>
              <input
                type="text"
                className="form-control answidth crewfontt"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder=""
              />
              <div className="invalid"></div>
            </div>
            <div className="col-5 queheading">
              <div> Sharjah Port Registration Card No.:</div>
              <input
                type="text"
                className="form-control answidth crewfontt"
                value={sharjahPortRegCardNo}
                onChange={(e) => setSharjahPortRegCardNo(e.target.value)}
                placeholder=""
              />
              <div className="invalid"></div>
            </div>
            <div className="col-4 queheading">
              <div> Company Name:</div>
              <input
                type="text"
                className="form-control answidth crewfontt"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder=""
              />
              <div className="invalid"></div>
            </div>
          </div>

          <div className="mt-3 mb-3">
            <strong>
              Thank you and looking forward for your best co-operation.
            </strong>
            <p className="mb-0">Sincerely yours,</p>
            <p className="mb-0 mt-0">
              For TRANS WAVE MARINE SHIPPING SERVICES LLC SHJ BR AS AGENT
            </p>
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
      <DialogActions></DialogActions>
    </Dialog>
  );
};

export default NOCGatepass;
