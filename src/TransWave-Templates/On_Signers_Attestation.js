import React, { useState } from "react";
import "./Transwave-Templates-css/Hamriyah_Inward_Document_Entry.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { uploadDocuments } from "../services/apiService";
import PopUp from "../pages/PopUp";
const On_Signers_Attestation = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
}) => {
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

  const documentsUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setUploadedFile(file);
      setUploadStatus("");
    }
  };

  const handleFileDelete = () => {
    setUploadedFile(null);
  };

  const handleFileView = (file) => {
    window.open(file.url, "_blank");
  };

  const handleSave = async () => {
    if (!uploadedFile) return;
    const formData = new FormData();
    formData.append("files", uploadedFile);
    try {
      setUploadStatus("Uploading...");
      const response = await uploadDocuments(formData);
      if (response.status && response.data && response.data.length > 0) {
        setUploadStatus("Upload successful!");
        setUploadedFile(response.data[0]);
        setMessage("Upload successful!");
        setOpenPopUp(true);
      } else {
        setUploadStatus("Upload failed. Please try again.");
        setMessage("Upload failed. Please try again.");
        setOpenPopUp(true);
      }
    } catch (error) {
      console.error("File upload error:", error);
      setUploadStatus("An error occurred during upload.");
      setMessage("An error occurred during upload.");
      setOpenPopUp(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>On Signers Attestation</DialogTitle>
        <DialogContent>
          <div className="an-shun-inward-letterhead">
            {/* Content for AN SHUN Inward Letterhead goes here */}
            <div>
              <div className="mb-2">
                <input
                  className="form-control documentsfsize hide-file-names"
                  type="file"
                  accept=".pdf,.csv,.xlsx"
                  onChange={documentsUpload}
                  style={{ marginBottom: "10px" }}
                />
              </div>
              <div className="ml-2">
                {uploadedFile && (
                  <div className="templateouter">
                    <div className="d-flex justify-content-between ">
                      <div className="tempgenerated ">
                        {uploadedFile.originalName || uploadedFile.name}
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
            onClose();
          }}
        />
      )}
    </>
  );
};

export default On_Signers_Attestation;
