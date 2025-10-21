// ResponsiveDialog.js
import React, { useState, useEffect } from "react";

import Loader from "./Loader";
import "../css/sendinvoice.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from "@mui/material";
import { AttachFile, Delete, Visibility } from "@mui/icons-material";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import {
  sendInvoiceApi,
  getInvoiceDocumentsAPI,
  uploadDocuments,
  deletePdaInvoiceDocument,
  sendCreditNote,
} from "../services/apiService";
import PopUp from "./PopUp";
const CreditNoteMail = ({ open, onClose, services, selectedPdaData }) => {
  console.log(services, "services");
  console.log(selectedPdaData, "selectedPdaData");

  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [fecthedDocuments, setFecthedDocuments] = useState([]); // Loader state
  const [isFinalreport, setIsFinalReport] = useState(false);
  const [documentPathArray, setDocumentPathArray] = useState([]); // New state for storing pdfPath

  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [invoiceFiles, setInvoiceFiles] = useState([]);
  const { logout, loginResponse } = useAuth();
  const [hasAED, setHasAED] = useState(false);

  const handleAEDChange = (e) => {
    setHasAED(e.target.checked);
  };

  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    cc: "",
    bcc: "",
    emailbody: "",
    pdaId: "",
    attachments: [],
  });

  useEffect(() => {
    if (open == true) {
      setFormData({
        to: "",
        subject: "",
        cc: "",
        bcc: "",
        emailbody: "",
        pdaId: "",
        attachments: [],
      });
    }
  }, [open]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [toError, setToError] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const [emailBodyError, setEmailBodyError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async () => {
    const { to, subject, emailbody } = formData;
    if (!to.trim()) {
      setToError(true);
    }
    if (!subject.trim()) {
      setSubjectError(true);
    }
    if (!emailbody.trim()) {
      setEmailBodyError(true);
    }

    // Check if email address is valid
    if (!emailRegex.test(to)) {
      setEmailError(true);
      return;
    }

    if (!to.trim() || !subject.trim() || !emailbody.trim()) {
      setMessage("Please fill all the required fields");
      setOpenPopUp(true);
      return;
    }

    let payload = {
      to: formData.to,
      subject: formData.subject,
      cc: formData.cc,
      bcc: formData.bcc,
      emailbody: formData.emailbody.replace(/\n/g, "<br>"),
      pdaId: selectedPdaData?._id,
      attachments: uploadedFiles,
      userId: loginResponse?.data?._id,
      hasAED: hasAED,
    };

    console.log(payload, "sendInvoiceApi_payload");
    setIsLoading(true);
    try {
      const response = await sendCreditNote(payload);
      console.log(response, "sendInvoiceApi_response");
      if (response?.status === true) {
        setIsLoading(false);
        setMessage("Credit Note sent successfully");
        setUploadedFiles([]);
        setFormData({
          to: "",
          subject: "",
          cc: "",
          bcc: "",
          emailbody: "",
          pdaId: "",
          attachments: [],
        });
        setHasAED(false);
        setOpenPopUp(true);
      } else {
        setIsLoading(false);

        setMessage("Credit Note failed. please try again");
        setOpenPopUp(true);
      }
    } catch (error) {
      setIsLoading(false);

      setMessage("Credit Note failed. please try again");
      setOpenPopUp(true);
    } finally {
      setIsLoading(false);

      onClose();
    }
  };

  const documentsUpload = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const formData = new FormData();

      // Append all selected files to FormData
      Array.from(event.target.files).forEach((file) => {
        console.log(file, "file");
        formData.append("files", file); // "files" is the expected key for your API
      });

      try {
        setUploadStatus("Uploading...");
        const response = await uploadDocuments(formData);

        if (response.status) {
          setUploadStatus("Upload successful!");
          setUploadedFiles((prevFiles) => [...prevFiles, ...response.data]); // Append new files to existing ones
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
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    console.log(updatedFiles, "updatedFiles");
    setUploadedFiles(updatedFiles);
    setMessage("File has been deleted successfully");
    setOpenPopUp(true);
    // if (fileUrl?._id) {
    //   let payload = {
    //     pdaId: editData?._id,
    //     documentId: fileUrl?._id,
    //   };
    //   try {
    //     const response = await deletePdaDocument(payload);
    //     if (response.status) {
    //       const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    //       console.log(updatedFiles, "updatedFiles");
    //       setUploadedFiles(updatedFiles);
    //       setMessage("File has been deleted successfully");
    //       setOpenPopUp(true);
    //       fetchPdaDetails(editData?._id);
    //     } else {
    //       setMessage("Failed please try again!");
    //       setOpenPopUp(true);
    //     }
    //   } catch (error) {
    //     setMessage("Failed please try again!");
    //     setOpenPopUp(true);
    //   }
    // } else if (!fileUrl?._id) {
    //   const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    //   console.log(updatedFiles, "updatedFiles");
    //   setUploadedFiles(updatedFiles);
    //   setMessage("File has been deleted successfully");
    //   setOpenPopUp(true);
    // }
  };

  return (
    <>
      <Dialog
        sx={{
          width: 1250,
          margin: "auto",
          borderRadius: 2,
          zIndex: 999,
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
        PaperProps={{
          style: { width: "1700px" }, // Custom width
        }}
      >
        <div className="d-flex justify-content-between">
          <DialogTitle> Send Credit Note</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent>
          <div className="Anchoragecall">
            <div className="toaddress ">
              <div className="row align-items-start">
                <div className="col">
                  <div className="mb-3">
                    <div className="col">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        To Address:
                      </label>
                      <input
                        type="email"
                        className={`form-control vessel-voyage ${
                          emailError ? "is-invalid" : ""
                        }`}
                        id="exampleFormControlInput1"
                        placeholder="Enter recipient's email"
                        value={formData.to}
                        onChange={(e) => {
                          setFormData({ ...formData, to: e.target.value });
                          setToError(false); // Clear "to" error on change
                          setEmailError(false); // Clear email error on change
                        }}
                      />
                      {(toError || emailError) && (
                        <>
                          <div className="invalid">
                            Please enter a valid email address.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ccbcc ">
              <div className="row align-items-start">
                <div className="col">
                  <div className="mb-3">
                    <div className="col">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Cc:
                      </label>
                      <input
                        type="email"
                        className="form-control vessel-voyage"
                        id="exampleFormControlInput1"
                        placeholder=""
                        value={formData.cc}
                        onChange={(e) =>
                          setFormData({ ...formData, cc: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div className="mb-3">
                    <div className="col">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Bcc:
                      </label>
                      <input
                        type="email"
                        className="form-control vessel-voyage"
                        id="exampleFormControlInput1"
                        placeholder=""
                        value={formData.bcc}
                        onChange={(e) =>
                          setFormData({ ...formData, bcc: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ccbcc ">
              <div className="row align-items-start">
                <div className="col">
                  <div className="mb-3">
                    <div className="col">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                      >
                        Subject:
                      </label>
                      <input
                        type="email"
                        className="form-control vessel-voyage"
                        id="exampleFormControlInput1"
                        placeholder=""
                        value={formData.subject}
                        onChange={(e) => {
                          setFormData({ ...formData, subject: e.target.value });
                          setSubjectError(false);
                        }}
                      />
                      {subjectError && (
                        <>
                          <div className="invalid">Please enter subject</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row ">
              <div className="col">
                <div className="mb-3">
                  <div className="col">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      Email Body:
                    </label>
                    <textarea
                      rows="3"
                      className="form-control formlabelcolor emailmessage"
                      id="exampleFormControlInput1"
                      value={formData.emailbody}
                      onChange={(e) => {
                        setFormData({ ...formData, emailbody: e.target.value });
                        setEmailBodyError(false);
                      }}
                      placeholder=""
                    ></textarea>
                    {emailBodyError && (
                      <>
                        <div className="invalid">Please enter emailbody</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="typesofcall-row ">
              <div className="row align-items-start">
                <div className="mb-2 col-4 docuplo">
                  <label htmlFor="formFile" className="form-label">
                    Documents Upload:
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
                <div className="mb-2 col-8">
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

            <div className="row align-items-center mb-3 hasaedinvoice">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasAedCheckbox"
                  checked={hasAED}
                  onChange={handleAEDChange}
                />
                <label
                  className="form-check-label ms-2"
                  htmlFor="hasAedCheckbox"
                >
                  Has AED
                </label>
              </div>
            </div>

            <div className="firstfooter d-flex justify-content-end">
              <button
                type="button"
                className="btn add-button"
                onClick={handleSubmit}
              >
                OK
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
    </>
  );
};

export default CreditNoteMail;
