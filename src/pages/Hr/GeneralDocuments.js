import React, { useState, useEffect, useRef } from "react";
import "../../css/payment.css";
import PopUp from "../PopUp";
import { DataGrid } from "@mui/x-data-grid";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { uploadDocuments } from "../../services/apiService";
import {
  saveGeneralDocument,
  deleteGeneralDocument,
  getGeneralDocumentsList,
  updateGeneralDocument,
} from "../../services/apiHrSettings";
import "../../css/generaldocuments.css";
const GeneralDocuments = () => {
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [documentTitle, setDocumentTitle] = useState("");
  const [issuedDate, setIssuedDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [listDocumnets, setListDocumnets] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchGeneralDocuments = async () => {
    let response = await getGeneralDocumentsList();
    setListDocumnets(response?.documents || []);
  };

  useEffect(() => {
    fetchGeneralDocuments();
  }, []);

  useEffect(() => {
    console.log(listDocumnets, "listDocumnets");
  }, [listDocumnets]);

  // Function to handle Edit and Delete
  const handleAction = (document, actionType) => {
    console.log(document, "document_edit");
    console.log(document.dateOfIssue, "document.dateOfIssue");
    console.log(
      new Date(document.dateOfIssue),
      "new Date(document.dateOfIssue)"
    );

    if (actionType === "edit") {
      setIsEditMode(true);
      setSelectedDocumentId(document._id);
      setDocumentTitle(document.documentName || "");
      // setIssuedDate(
      //   document.dateOfIssue ? new Date(document.dateOfIssue) : null
      // );
      // setExpiryDate(
      //   document.dateOfExpiry ? new Date(document.dateOfExpiry) : null
      // );

      // Format: "18-04-2025" → "DD-MM-YYYY"
      const parseDate = (dateString) => {
        return dateString ? moment(dateString, "DD-MM-YYYY").toDate() : null;
      };

      // Usage
      setIssuedDate(parseDate(document.dateOfIssue));
      setExpiryDate(parseDate(document.dateOfExpiry));

      setUploadedFiles(document.document ? document.document : null);
    } else {
      setIsEditMode(false);
      setDocumentTitle("");
      setIssuedDate(null);
      setExpiryDate(null);
      setUploadedFiles({});
    }

    setOpen(true);
  };

  const rows = listDocumnets.map((doc, index) => ({
    id: doc._id,
    documentName: doc.documentName,
    dateOfIssue: doc.dateOfIssue,
    dateOfExpiry: doc.dateOfExpiry,
    document: doc,
  }));

  const columns = [
    {
      field: "documentName",
      headerName: "Document Name",
      flex: 1,
    },
    {
      field: "dateOfIssue",
      headerName: "Issued Date",
      flex: 1,
    },
    {
      field: "dateOfExpiry",
      headerName: "Expiry Date",
      flex: 1,
    },
    {
      field: "files",
      headerName: "Files",
      flex: 2,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px", // Adds space between text and icon
            width: "100%",
          }}
        >
          {params.row.document?.document?.originalName && (
            <>
              <span style={{ whiteSpace: "nowrap" }}>
                {params.row.document?.document?.originalName}
              </span>
            </>
          )}
          {!params.row.document?.document?.originalName && (
            <>
              <span style={{ whiteSpace: "nowrap" }}>No Uploaded Files</span>
            </>
          )}

          {params?.row?.document?.document?.url && (
            <>
              <i
                className="bi bi-eye"
                style={{
                  cursor: "pointer",
                  fontSize: "1.2rem", // Makes the icon bigger
                  color: "#007bff",
                }}
                onClick={() =>
                  window.open(
                    `${process.env.REACT_APP_ASSET_URL}${params.row.document.document.url}`,
                    "_blank"
                  )
                }
              ></i>
            </>
          )}
        </div>
      ),
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div>
          <i
            className="bi bi-pencil-square editicon"
            style={{ cursor: "pointer", marginRight: 10 }}
            onClick={() => handleAction(params.row.document, "edit")}
          ></i>
          <i
            className="bi bi-trash editicon deleteicon"
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => handleDelete(params.row.document, "delete")}
          ></i>
        </div>
      ),
    },
  ];

  const documentsUpload = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const formData = new FormData();
      const file = event.target.files[0]; // Only take the first file

      console.log(file, "file");
      formData.append("files", file); // "files" is the expected key for your API

      try {
        setUploadStatus("Uploading...");
        const response = await uploadDocuments(formData);

        if (response.status && response.data.length > 0) {
          setUploadStatus("Upload successful!");
          setUploadedFiles(response.data[0]); // Store only the first uploaded file
        } else {
          setUploadStatus("Upload failed. Please try again.");
        }
      } catch (error) {
        console.error("File upload error:", error);
        setUploadStatus("An error occurred during upload.");
      }
    }
  };

  const handleSubmit = async () => {
    const formattedIssuedDate = issuedDate
      ? moment(issuedDate).format("DD-MM-YYYY")
      : "";
    const formattedExpiryDate = expiryDate
      ? moment(expiryDate).format("DD-MM-YYYY")
      : "";

    const payload = {
      ...(isEditMode && { documentId: selectedDocumentId }), // Include documentId only when editing
      generalDocument: {
        documentName: documentTitle,
        dateOfIssue: formattedIssuedDate,
        dateOfExpiry: formattedExpiryDate,
        document: uploadedFiles ? uploadedFiles : {}, // Send a single uploaded file object
      },
    };

    console.log("Submitting: ", payload);

    setIsLoading(true);
    try {
      const response = isEditMode
        ? await updateGeneralDocument(payload) // Call edit API if editing
        : await saveGeneralDocument(payload); // Call add API if adding
      console.log(response, "response_handleSubmit");
      if (response?.status === true) {
        setMessage(
          isEditMode
            ? "Document Updated Successfully"
            : "Document Added Successfully"
        );
        setOpenPopUp(true);
        fetchGeneralDocuments();
      } else {
        setMessage("Document failed. Please try again");
        setOpenPopUp(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Document failed. Please try again");
      setOpenPopUp(true);
    } finally {
      setIsLoading(false);
      setOpen(false);
      fetchGeneralDocuments();
    }
  };

  const handleFileDelete = async () => {
    setUploadedFiles({});
    setMessage("File has been deleted successfully");
    setOpenPopUp(true);
  };

  useEffect(() => {
    console.log(uploadedFiles, "uploadedFiles");
  }, [uploadedFiles]);

  const handleDelete = (document) => {
    console.log(document, "dpcument");
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
        let pdaPayload = {
          documentId: document?._id,
        };
        setIsLoading(true);
        try {
          const response = await deleteGeneralDocument(pdaPayload);
          console.log(response, "login_response");
          if (response?.status == true) {
            setIsLoading(false);
            setMessage("Document have been deleted");
            setOpenPopUp(true);
            fetchGeneralDocuments();
          } else {
            setIsLoading(false);
            setMessage("Failed please try again");
            setOpenPopUp(true);
            fetchGeneralDocuments();
          }
        } catch (error) {
          setIsLoading(false);
          setMessage("Failed please try again");
          setOpenPopUp(true);
          fetchGeneralDocuments();
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <>
      <div className="p-3">
        <div className="col-12 d-flex justify-content-end mb-3">
          <button
            className="btn btn-info filbtnjob"
            onClick={() => {
              setIsEditMode(false);
              setDocumentTitle("");
              setIssuedDate(null);
              setExpiryDate(null);
              setUploadedFiles({});
              setOpen(true);
            }}
          >
            {" "}
            Add
          </button>
        </div>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#eee !important",
              color: "#000000",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            "& .MuiTablePagination-toolbar": {
              alignItems: "baseline",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#eee",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              textOverflow: "ellipsis",
            },
          }}
          pagination
          pageSizeOptions={[5, 10, 20, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
                page: 0,
              },
            },
          }}
        />

        <Dialog
          open={open}
          fullWidth
          maxWidth="lg"
          sx={{
            width: 1250,
            margin: "auto",
            borderRadius: 2,
          }}
          onClose={(event, reason) => {
            if (reason === "backdropClick") {
              // Prevent dialog from closing when clicking outside
              return;
            }
            setOpen(false); // Allow dialog to close for other reasons
          }}
          PaperProps={{
            style: { width: "1700px", height: "800px" }, // Custom width
          }}
        >
          <div className="d-flex justify-content-between">
            <DialogTitle>
              {isEditMode ? "Edit General Document" : "Add General Document"}
            </DialogTitle>
            <div className="closeicon">
              <i
                className="bi bi-x-lg "
                onClick={() => {
                  setOpen(false);
                }}
              ></i>
            </div>
          </div>
          <DialogContent>
            <div className="typesofcall-row ">
              <div className="d-flex align-items-center row  align-items-start mb-3">
                <div className="col-4">
                  <label htmlFor="employeeName" className="form-label">
                    Document Title:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="text"
                    className="form-control vessel-voyage"
                    id="Document Title"
                    placeholder="Document Title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>

                <div className="col-4">
                  <label htmlFor="employeeName" className="form-label">
                    Issued Date:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={issuedDate}
                    onChange={setIssuedDate}
                    className="form-control"
                    id="eta-picker"
                    placeholderText="Issued Date"
                    autoComplete="off"
                  />
                  {/* <input
                    type="date"
                    className="form-control vessel-voyage"
                    id="issuedDate"
                    placeholder=""
                    name="issuedDate"
                    onChange={setIssuedDate}
                    value={issuedDate}
                  /> */}
                </div>

                <div className="col-4">
                  <label htmlFor="employeeName" className="form-label">
                    Expiry Date:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={expiryDate}
                    onChange={setExpiryDate}
                    className="form-control"
                    id="eta-picker"
                    placeholderText="Expiry Date"
                    autoComplete="off"
                  />
                  {/* <input
                    type="date"
                    className="form-control vessel-voyage"
                    id="issuedDate"
                    placeholder=""
                    name="issuedDate"
                    onChange={setExpiryDate}
                    value={expiryDate}
                  /> */}
                </div>
              </div>
            </div>

            <div className="typesofcall-row ">
              <div className="row d-flex align-items-baseline ">
                <div className="col-6 docuplo">
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

                <div className="col-6 uploadheightgd">
                  <label htmlFor="formFile" className="form-label">
                    Uploaded File:
                  </label>

                  {uploadedFiles && (
                    <div className="templateoutergeneral">
                      <div className="d-flex justify-content-between">
                        <div className="tempgenerated">
                          {uploadedFiles?.originalName}
                        </div>
                        {uploadedFiles?.originalName && uploadedFiles.url && (
                          <div className="d-flex">
                            <div
                              className="icondown"
                              onClick={() =>
                                window.open(
                                  `${process.env.REACT_APP_ASSET_URL}${uploadedFiles.url}`,
                                  "_blank"
                                )
                              }
                            >
                              <i className="bi bi-eye"></i>
                            </div>
                            <div className="iconpdf" onClick={handleFileDelete}>
                              <i className="bi bi-trash"></i>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 d-flex justify-content-end mt-3">
                <button
                  className="btn btn-info filbtnjob"
                  onClick={handleSubmit}
                >
                  {" "}
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {openPopUp && (
        <>
          <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
        </>
      )}
    </>
  );
};

export default GeneralDocuments;
