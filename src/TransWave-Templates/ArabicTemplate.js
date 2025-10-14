import React, { useState, useEffect } from "react";
import PopUp from "../pages/PopUp";
import "./Transwave-Templates-css/AN_SHUN_Inward_Letterhead.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { uploadDocuments, uploadTemplate } from "../services/apiService";
import Loader from "../pages/Loader";
const ArabicTemplate = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
  onUploadComplete,
}) => {
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

  const documentsUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsLoading(true); // Show loader
      const file = event.target.files[0];
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const allowedExtensions = [".pdf", ".doc", ".docx"];
      const fileName = file.name.toLowerCase();
      const isAllowed =
        allowedTypes.includes(file.type) ||
        allowedExtensions.some((ext) => fileName.endsWith(ext));
      if (!isAllowed) {
        setMessage("Only PDF, DOC, and DOCX files are allowed.");
        setOpenPopUp(true);
        setIsLoading(false); // Hide loader
        return;
      }
      setUploadStatus("Uploading...");
      // Immediately upload the file
      const formData = new FormData();
      formData.append("file", file);
      uploadTemplate(formData)
        .then((response) => {
          let pdfPath = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          if (response.status && pdfPath) {
            setUploadedFile(pdfPath);
            setUploadStatus("Upload successful!");
          } else {
            setUploadStatus("Upload failed. Please try again.");
            // setMessage("Upload failed. Please try again.");
            // setOpenPopUp(true);
          }
          setIsLoading(false); // Hide loader
        })
        .catch((error) => {
          setUploadStatus("An error occurred during upload.");
          setMessage("An error occurred during upload.");
          setOpenPopUp(true);
          setIsLoading(false); // Hide loader
        });
    }
  };

  const handleFileDelete = () => {
    setUploadedFile(null);
    // Reset the file input value so it doesn't show the previous file
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
      input.value = "";
    });
  };

  const handleFileView = (file) => {
    if (!file) return;
    let filepath = "";
    if (typeof file === "string") {
      filepath = file;
    } else if (file.url) {
      filepath = file.url;
    } else if (file.name) {
      filepath = file.name;
    }
    if (!filepath) return;
    window.open(`${process.env.REACT_APP_FILE_URL}${filepath}`, "_blank");
  };

  const handleSave = async () => {
    if (!uploadedFile) {
      setMessage("Please select a file.");
      setOpenPopUp(true);
      return;
    }
    // On save, just call handleUploadComplete with the uploaded file path
    handleUploadComplete(uploadedFile);
    setMessage("Upload successful!");
    setOpenPopUp(true);
    // onClose();
  };

  // Callback to parent for upload completion
  const handleUploadComplete = (pdfPath) => {
    if (typeof onUploadComplete === "function") {
      onUploadComplete({
        pdfPath,
        templateName: selectedTemplateName,
        templateId: selectedTemplate,
        status: true,
      });
    }
  };

  useEffect(() => {
    console.log("Uploaded file changed:", uploadedFile);
  }, [uploadedFile]);

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <div className="d-flex justify-content-between ">
          <DialogTitle>{selectedTemplateName}</DialogTitle>
          <div className="closeicon" onClick={onClose}>
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent>
          <div className="an-shun-inward-letterhead">
            {/* Content for AN SHUN Inward Letterhead goes here */}
            <div>
              <div className="mb-2">
                <input
                  className="form-control documentsfsize hide-file-names"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={documentsUpload}
                  style={{ marginBottom: "10px" }}
                />
              </div>
              <div className="ml-2">
                {uploadedFile && (
                  <div className="templateouter">
                    <div className="d-flex justify-content-between ">
                      <div className="tempgenerated ">
                        {/* Show file name from path if no name property */}
                        {uploadedFile.originalName ||
                          uploadedFile.name ||
                          (typeof uploadedFile === "string"
                            ? uploadedFile.split("-").slice(1).join("-")
                            : "")}
                      </div>
                      <div className="d-flex">
                        <div
                          className="icondown"
                          onClick={() => handleFileView(uploadedFile)}
                          style={{ cursor: "pointer" }}
                        >
                          <i className="bi bi-eye"></i>
                        </div>
                        <div
                          className="iconpdf"
                          onClick={handleFileDelete}
                          style={{ cursor: "pointer", marginLeft: "8px" }}
                        >
                          <i className="bi bi-trash"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
          </div>
        </DialogContent>
      </Dialog>
      {openPopUp && (
        <PopUp
          message={message}
          closePopup={() => {
            setOpenPopUp(false);
            if (
              message !== "Please select a file." &&
              typeof onClose === "function"
            ) {
              onClose();
            }
          }}
        />
      )}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default ArabicTemplate;
