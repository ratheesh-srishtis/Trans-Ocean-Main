// ResponsiveDialog.js
import React, { useState, useEffect } from "react";

import Loader from "./Loader";
import "../css/invoicepage.css";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import {
  saveInvoiceDocument,
  uploadDocuments,
  deletePdaInvoiceDocument,
  getInvoiceDocumentsAPI,
  getPdaDetails,
} from "../services/apiService";
import PopUp from "./PopUp";
import Swal from "sweetalert2";

const InvoiceDocuments = ({ open, onClose, pdaResponse, onSubmit }) => {
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  const fetchInvoiceDocuments = async () => {
    let payload = {
      pdaId: pdaResponse?._id,
    };
    let response = await getInvoiceDocumentsAPI(payload);
    console.log(response, "response_fetchInvoiceDocuments");
    // setUploadedFiles(response?.invoiceDocuments || []);
  };

  const fetchPdaDetails = async () => {
    let data = {
      pdaId: pdaResponse?._id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      setUploadedFiles(pdaDetails?.pda?.invoiceDocuments || []);
      console.log(pdaDetails, "pdaDetails_invcoicedocs");
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    // fetchInvoiceDocuments();
  }, [open]);

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

  useEffect(() => {
    console.log(pdaResponse, "pdaResponse_uploadInvoice");
    if (pdaResponse?._id) {
      setUploadedFiles(pdaResponse?.invoiceDocuments);
    }
  }, [pdaResponse]);

  const saveDocuments = async (remark) => {
    console.log(remark, "handleRemarksSubmit");
    let payload = {
      pdaId: pdaResponse?._id,
      invoiceDocuments: uploadedFiles,
    };
    console.log(payload, "payload");
    try {
      const response = await saveInvoiceDocument(payload);
      console.log(response, "login_response");
      if (response?.status == true) {
        setMessage("The invoice documents have been successfully uploaded");
        setOpenPopUp(true);
        onSubmit(pdaResponse?._id);
        onClose();
      } else {
        setMessage("Invoice failed. Please try again");
        setOpenPopUp(true);
      }
    } catch (error) {
      setMessage("Invoice failed. Please try again");
      setOpenPopUp(true);
    } finally {
    }
  };

  const deleteInvoiceDocument = (document, index) => {
    console.log(document, "document_deleteInvoiceDocument");
    console.log(index, "index_deleteInvoiceDocument");

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (document?._id) {
          let pdaPayload = {
            pdaId: pdaResponse?._id,
            documentId: document?._id,
          };
          setIsLoading(true);
          try {
            const response = await deletePdaInvoiceDocument(pdaPayload);
            console.log(response, "login_response");
            if (response?.status == true) {
              setIsLoading(false);
              setMessage("File deleted successfully");
              setOpenPopUp(true);
              fetchPdaDetails();
            } else {
              setIsLoading(false);
              setMessage("Failed please try again");
              setOpenPopUp(true);
              fetchPdaDetails();
            }
          } catch (error) {
            setIsLoading(false);
            setMessage("Failed please try again");
            setOpenPopUp(true);
            fetchPdaDetails();
          } finally {
            setIsLoading(false);
          }
        } else if (!document?._id) {
          const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
          console.log(updatedFiles, "updatedFiles");
          setUploadedFiles(updatedFiles);
          setMessage("File has been deleted successfully");
          setOpenPopUp(true);
        }
      }
    });
  };

  return (
    <>
      <Dialog
        sx={{
          width: 1300,
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
        <div className="d-flex justify-content-between" onClick={onClose}>
          <DialogTitle></DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent>
          <div className=" statement">
            <h3>Upload Invoice Documents</h3>
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
                                    className="icondown"
                                    onClick={() =>
                                      deleteInvoiceDocument(file, index)
                                    }
                                  >
                                    <i className="bi bi-trash editicon deleteicon"></i>
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

          <div className="d-flex justify-content-center mt-4">
            <button
              className="btn btna submit-button"
              onClick={() => {
                saveDocuments();
              }}
            >
              Save
            </button>
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

export default InvoiceDocuments;
