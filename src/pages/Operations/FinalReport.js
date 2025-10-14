import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/finalreport.css";
import SendReport from "./SendReport";
import PopUp from "../PopUp";
import FinalReportDialog from "./FinalReportDialog";
import QQDialog from "./QQDialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {
  saveServiceReport,
  getServiceReport,
  uploadDocuments,
  deleteServiceReportDocument,
  deleteServiceReport,
} from "../../services/apiService";
import Loader from "../Loader";
const FinalReport = ({
  vessels,
  ports,
  cargos,
  vesselTypes,
  services,
  customers,
  employees,
  templates,
  vendors,
}) => {
  const Group = require("../../assets/images/final.png");
  const navigate = useNavigate();
  const [openPopUp, setOpenPopUp] = useState(false);
  const [pdaId, setPdaId] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [serviceReports, setServiceReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [etaHours, setEtaHours] = useState("");
  const [etaMinutes, setEtaMinutes] = useState("");
  const [etaTimeError, setEtaTimeError] = useState("");
  const [rowTimes, setRowTimes] = useState({}); // Stores hours, minutes for each row
  const [timeErrors, setTimeErrors] = useState({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [finalDialogOpen, setFinalDialogOpen] = useState(false);

  const openFinalDialog = () => {
    handleFinalDialogClickOpen();
  };

  const handleFinalDialogClickOpen = () => {
    setFinalDialogOpen(true);
  };

  const handleFinalDialogueClose = () => {
    setFinalDialogOpen(false);
  };

  const [QQDialogOpen, setQQDialogOpen] = useState(false);

  const openQQDialog = () => {
    handleQQClickOpen();
  };

  const handleQQClickOpen = () => {
    setQQDialogOpen(true);
  };

  const handleQQDialogueClose = () => {
    setQQDialogOpen(false);
  };

  const [rows, setRows] = useState([
    {
      description: "",
      serviceDate: "",
      serviceActivity: "",
      quantity: "",
      remark: "",
    },
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        description: "",
        serviceDate: "",
        serviceActivity: "",
        quantity: "",
        remark: "",
      },
    ]);
  };

  const handleRemoveRow = async (index, event) => {
    console.log(event, "event");

    if (rows.length === 1) {
      alert("At least one row is required.");
      return;
    } else {
      if (event?._id) {
        let payload = {
          serviceReportId: event?._id,
        };
        try {
          const response = await deleteServiceReport(payload);
          if (response.status) {
            serviceReportGet(pdaId);
            setMessage("File has been deleted successfully");
            setOpenPopUp(true);
          } else {
            setMessage("Failed please try again!");
            setOpenPopUp(true);
          }
        } catch (error) {
          setMessage("Failed please try again!");
          setOpenPopUp(true);
        }
      } else {
        const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index);
        setRows(updatedRows);
      }
    }
  };

  // Handle input changes for specific fields
  const handleInputChange = (index, field, value) => {
    const updatedRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  // const isFormValid = () => {
  //   console.log(rows, "rows_isFormValid");
  //   // Check if any row object has at least one non-empty field
  //   return rows.some((row) =>
  //     Object.values(row).some((value) => String(value).trim() !== "")
  //   );
  // };

  const location = useLocation();

  const row = location.state?.editData; // Access the passed row object

  const [sof, setSof] = useState(null);

  const serviceReportGet = async (id) => {
    let data = {
      pdaId: id,
    };
    try {
      const serviceReportResponse = await getServiceReport(data);
      console.log("serviceReportGet", serviceReportResponse);
      setSof(serviceReportResponse?.sof);
      // Update state with the fetched data
      setServiceReports(serviceReportResponse?.report || []);
      setUploadedFiles(
        serviceReportResponse?.reportDocument?.serviceDocuments || []
      );

      // Return the fetched reports for immediate validation
      return serviceReportResponse?.report || [];
    } catch (error) {
      console.error("Failed to fetch service reports:", error);
      return []; // Return an empty array in case of error
    }
  };

  useEffect(() => {
    serviceReportGet(row?._id);
    console.log("Row data:", row);
    setPdaId(row?._id);
  }, [row]);

  useEffect(() => {
    console.log(sof, "sof");
  }, [sof]);

  // Function to load data from API response
  const loadReports = () => {
    const moment = require("moment");

    const updatedRows = serviceReports.map((report) => {
      const formatted = moment.utc(report.serviceDate, "DD-MM-YYYY HH:mm");
      return {
        description: report.description,
        serviceDate: formatted.format("YYYY-MM-DD HH:mm"),
        serviceActivity: report.serviceActivity,
        quantity: report.quantity,
        remark: report.remark,
        _id: report._id,
      };
    });

    const updatedRowTimes = serviceReports.reduce((acc, report, index) => {
      const time = moment.utc(report.serviceDate, "DD-MM-YYYY HH:mm");
      acc[index] = {
        hours: time.format("HH"),
        minutes: time.format("mm"),
      };
      return acc;
    }, {});

    setRows(updatedRows);
    setRowTimes(updatedRowTimes);
  };

  // moment.utc(report.serviceDate)

  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const documentsUpload = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const formData = new FormData();
      // Append all selected files to FormData
      Array.from(event.target.files).forEach((file) => {
        formData.append("files", file); // "files" is the expected key for your API
      });

      try {
        setUploadStatus("Uploading...");
        const response = await uploadDocuments(formData);
        if (response.status) {
          setUploadStatus("Upload successful!");
          if (uploadedFiles?.length > 0) {
            setUploadedFiles((prevFiles) => [...prevFiles, ...response.data]); // Append new files to existing ones
          } else {
            setUploadedFiles(response.data); // Append new files to existing ones
          }
        } else {
          setUploadStatus("Upload failed. Please try again.");
        }
      } catch (error) {
        console.error("File upload error:", error);
        setUploadStatus("An error occurred during upload.");
      }
    }
  };

  const handleFileDelete = async (fileUrl, index) => {
    // Update the state by filtering out the file with the specified URL
    // const updatedFiles = uploadedFiles.filter((file) => file.url !== fileUrl);
    // setUploadedFiles(updatedFiles);
    console.log(fileUrl, "fileUrl");

    if (fileUrl?._id) {
      let payload = {
        pdaId: pdaId,
        documentId: fileUrl?._id,
      };
      try {
        const response = await deleteServiceReportDocument(payload);
        if (response.status) {
          const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
          console.log(updatedFiles, "updatedFiles");
          setUploadedFiles(updatedFiles);
          setMessage("File has been deleted successfully");
          setOpenPopUp(true);
        } else {
          setMessage("Failed please try again!");
          setOpenPopUp(true);
        }
      } catch (error) {
        setMessage("Failed please try again!");
        setOpenPopUp(true);
      }
    } else if (!fileUrl?._id) {
      const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
      console.log(updatedFiles, "updatedFiles");
      setUploadedFiles(updatedFiles);
      setMessage("File has been deleted successfully");
      setOpenPopUp(true);
    }
  };

  useEffect(() => {
    console.log("serviceReports:", serviceReports);
    console.log("uploadedFiles:", uploadedFiles);
    if (serviceReports?.length > 0) {
      loadReports(); // Simulate fetching and loading data
    }
  }, [serviceReports, uploadedFiles]);

  useEffect(() => {
    console.log("rows:", rows);
  }, [rows]);

  const openDialog = async () => {
    try {
      // Fetch service reports and wait for it to complete
      const serviceReportResponse = await serviceReportGet(pdaId);

      // Check if there is at least one row with any valid (non-empty, non-null) value
      const isValid = serviceReportResponse.some((row) =>
        Object.values(row).some((value) => value !== null && value !== "")
      );

      if (!isValid) {
        setMessage("Please make sure to save the report before sending it.");
        setOpenPopUp(true);
        return; // Exit the function if validation fails
      }

      // Proceed with the submit logic if the validation passes
      handleClickOpen();
    } catch (error) {
      console.error("Error during validation:", error);
    }
  };

  const isFormValid = () => {
    const missingFields = [];

    rows.forEach((row, index) => {
      if (!row.serviceDate || String(row.serviceDate).trim() === "") {
        missingFields.push(`Service Date is required in row ${index + 1}`);
      }
      if (!row.serviceActivity || String(row.serviceActivity).trim() === "") {
        missingFields.push(`Service Activity is required in row ${index + 1}`);
      }
    });

    if (missingFields.length > 0) {
      // setMessage(missingFields.join("\n")); // Combine messages into a single string
      // setOpenPopUp(true);
      return false; // Form is invalid
    }

    return true; // Form is valid
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setMessage("Please fill all the required fields");
      setOpenPopUp(true);
      return;
    }
    setIsLoading(true);
    const payload = {
      pdaId: pdaId,
      reports: rows.map((row) => ({
        description: row.description,
        serviceDate: row.serviceDate
          ? moment(row.serviceDate).format("YYYY-MM-DD HH:mm")
          : "",
        serviceActivity: row.serviceActivity,
        quantity: row.quantity,
        remark: row.remark,
      })),
      serviceDocuments: uploadedFiles?.length > 0 ? uploadedFiles : [],
    };
    console.log("Payload to be sent:", payload);
    // Call the POST API
    try {
      const response = await saveServiceReport(payload);
      console.log(response, "login_response");
      if (response?.status === true) {
        setMessage("Report saved successfully!");
        setOpenPopUp(true);
        setIsLoading(false);
      } else {
        setMessage("Report failed. Please try again.");
        setOpenPopUp(true);
        setIsLoading(false);
      }
    } catch (error) {
      setMessage("Report failed. Please try again.");
      setOpenPopUp(true);
      setIsLoading(false);
    }
  };

  const validateAndSetRowTime = (
    rowIndex,
    rawHours,
    rawMinutes,
    selectedDate
  ) => {
    const hours = rawHours === "" ? "00" : rawHours;
    const minutes = rawMinutes === "" ? "00" : rawMinutes;

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      setTimeErrors((prev) => ({
        ...prev,
        [rowIndex]: "Please enter a valid time",
      }));
      return;
    }

    setTimeErrors((prev) => ({ ...prev, [rowIndex]: "" }));

    // if (!selectedDate) return;

    // const formattedTime = `${moment(selectedDate).format(
    //   "YYYY-MM-DD"
    // )} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    // setRows((prevRows) => {
    //   const updated = [...prevRows];
    //   updated[rowIndex].serviceDate = formattedTime;
    //   return updated;
    // });

    // ✅ Only format time if selectedDate is valid
    if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      const formattedTime = `${moment(selectedDate).format(
        "YYYY-MM-DD"
      )} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      setRows((prevRows) => {
        const updated = [...prevRows];
        updated[rowIndex].serviceDate = formattedTime;
        return updated;
      });
    }
  };

  const handleRowHoursChange = (rowIndex, value) => {
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setRowTimes((prev) => ({
        ...prev,
        [rowIndex]: { ...prev[rowIndex], hours: value },
      }));

      const minutes = rowTimes[rowIndex]?.minutes || "";
      const datePart = rows[rowIndex]?.serviceDate?.split(" ")[0];

      // ✅ Use null if datePart is missing
      const selectedDate = datePart ? new Date(datePart) : null;

      validateAndSetRowTime(rowIndex, value, minutes, selectedDate);
    }
  };

  const handleRowMinutesChange = (rowIndex, value) => {
    if (value === "" || /^\d{0,2}$/.test(value)) {
      setRowTimes((prev) => ({
        ...prev,
        [rowIndex]: { ...prev[rowIndex], minutes: value },
      }));

      const hours = rowTimes[rowIndex]?.hours || "";
      const datePart = rows[rowIndex]?.serviceDate?.split(" ")[0];

      // ✅ Use null if datePart is missing
      const selectedDate = datePart ? new Date(datePart) : null;

      validateAndSetRowTime(rowIndex, hours, value, selectedDate);
    }
  };

  return (
    <>
      <div className="">
        <div className="charge mt-4">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        <div className="p-3">
          <table className="tabmain">
            <thead>
              <tr>
                <th className="tabhead">SL NO.</th>
                <th className="tabhead">DESCRIPTION</th>
                <th className="tabhead">
                  DATE & TIME <span className="required"> * </span>
                </th>
                <th className="tabhead">
                  SERVICE ACTIVITIES <span className="required"> * </span>
                </th>
                <th className="tabhead">QUANTITY </th>
                <th className="tabhead">REMARKS </th>
                <th className="tabhead"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="tdstylwidt">{index + 1}</td>
                  <td className="tdstyl">
                    <input
                      type="text"
                      className="form-control"
                      value={row.description}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                    />
                  </td>
                  <td className="tdstyl ">
                    <div
                      className={`d-flex ${
                        timeErrors[index] ? "errormargin" : "noerrormargin"
                      }`}
                    >
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={
                          rows[index].serviceDate
                            ? new Date(rows[index].serviceDate.split(" ")[0])
                            : ""
                        }
                        onChange={(date) => {
                          const hours = rowTimes[index]?.hours || "00";
                          const minutes = rowTimes[index]?.minutes || "00";
                          validateAndSetRowTime(index, hours, minutes, date);
                        }}
                        className="form-control date-input datefinalreport "
                        id="eta-picker"
                        autoComplete="off"
                      />
                      <div className="d-flex">
                        <input
                          type="text"
                          name="berth"
                          className="form-control vessel-voyage voyageblock timeslotnewloading"
                          id="exampleFormControlInput1"
                          placeholder="00"
                          value={rowTimes[index]?.hours || ""}
                          onChange={(e) =>
                            handleRowHoursChange(index, e.target.value)
                          }
                        />
                        <input
                          type="text"
                          name="berth"
                          className="form-control vessel-voyage voyageblock timeslotnewloading"
                          id="exampleFormControlInput1"
                          placeholder="00"
                          value={rowTimes[index]?.minutes || ""}
                          onChange={(e) =>
                            handleRowMinutesChange(index, e.target.value)
                          }
                        />
                      </div>
                    </div>
                    {timeErrors[index] && (
                      <div
                        className=""
                        style={{
                          color: "red",

                          fontSize: "12px",
                        }}
                      >
                        {timeErrors[index]}
                      </div>
                    )}
                  </td>

                  <td className="tdstyl widthservce">
                    <input
                      type="text"
                      className="form-control"
                      value={row.serviceActivity}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "serviceActivity",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="tdstyl">
                    <input
                      type="text"
                      className="form-control"
                      value={row.quantity}
                      onChange={(e) =>
                        handleInputChange(index, "quantity", e.target.value)
                      }
                    />
                  </td>
                  <td className="tdstyl">
                    <textarea
                      className="form-control"
                      id="exampleFormControlTextarea1"
                      rows="1"
                      value={row.remark}
                      onChange={(e) =>
                        handleInputChange(index, "remark", e.target.value)
                      }
                    ></textarea>
                  </td>
                  <td className="tdstyl">
                    <i
                      className="bi bi-trash-fill jobdeleiconn"
                      onClick={() => handleRemoveRow(index, row)}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="attach">Attach Documents :</div>
          <div className="d-flex justify-content-between">
            {/* <div className="d-flex justify-content-between pdf">
              <div>Attach PDFs</div>
              <div>
                <i className="bi bi-file-earmark-pdf"></i>
              </div>
            </div> */}
            {/* fifthrowdocumentsupload */}
            <div className="typesofcall-row ">
              <div className="row align-items-start">
                <div className="mb-2">
                  <input
                    className="form-control documentsfsize hide-file-names"
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
                <div className="ml-2">
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

            <div>
              <button
                className="btn btna submit-button btnfsize addmorebutton"
                onClick={handleAddRow}
              >
                Add More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="buttons-wrapper">
        <div className="left">
          <button
            className="btn btna submit-button btnfsize"
            onClick={() => {
              openFinalDialog();
            }}
          >
            Generate Report
          </button>
        </div>
        <div className="right d-flex">
          <button
            className="btn btna submit-button btnfsize"
            onClick={handleSubmit}
          >
            Save Report
          </button>
          <button
            className="btn btna submit-button btnfsize"
            onClick={() => {
              openDialog();
            }}
          >
            Send Report
          </button>
          <button
            className="btn btna submit-button btnfsize"
            onClick={() => {
              openQQDialog();
            }}
          >
            QQ Form
          </button>
        </div>
      </div>

      <SendReport open={open} onClose={handleClose} sof={sof} pdaId={pdaId} />
      <FinalReportDialog
        open={finalDialogOpen}
        onClose={handleFinalDialogueClose}
        pdaId={pdaId}
        ports={ports}
      />
      <QQDialog
        open={QQDialogOpen}
        onClose={handleQQDialogueClose}
        pdaId={pdaId}
        ports={ports}
        vessels={vessels}
      />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default FinalReport;
