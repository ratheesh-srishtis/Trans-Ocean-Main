import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/editOperation.css";
import {
  getPdaDetails,
  uploadDocuments,
  editPDA,
  changeQuotationStatus,
  deletePdaDocument,
  getAnchorageLocations,
  resubmitJobForApproval,
} from "../../services/apiService";
import Loader from "../Loader";
import PopUp from "../PopUp";
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from "@mui/material";
import { Delete, Visibility } from "@mui/icons-material";
import OpsChargesTable from "./OpsChargesTable";
import PdaDialog from "../PdaDialog";
import { useAuth } from "../../context/AuthContext";
import InvoicePage from "../InvoicePage";
import SendInvoice from "../SendInvoice";
import AddServiceRequest from "./AddServiceRequest";
const EditOperation = ({
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
  const navigate = useNavigate();
  const { loginResponse } = useAuth();

  console.log(loginResponse, "loginResponse_EditOperation");
  const Group = require("../../assets/images/upjobs.png");
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [anchorageLocations, setAnchorageLocations] = useState([]);
  const [anchorageLocationID, setAnchorageLocationID] = useState("");
  const [opsPhoneNumber, setOpsPhoneNumber] = useState("");

  const row = location.state?.row; // Access the passed row object
  const [editData, setEditData] = useState(null);
  const [fetchInitiated, setFetchInitiated] = useState(false); // State to track fetch initiation
  const [finalChargesArray, setFinalChargesArray] = useState([]);

  const [selectedPdaId, setSelectedPdaId] = useState(null);
  const [selectedPdaStatus, setSelectedPdaStatus] = useState(null);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeError, setSelectedEmployeeError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedStatusError, setSelectedStatusError] = useState(null);
  const [assignedTo, setAssignedTo] = useState(null);
  const [remarks, setRemarks] = useState(null);
  const [pdaResponse, setPdaResponse] = useState(null);
  const [selectedVesselError, setSelectedVesselError] = useState(false);
  const [selectedPortError, setSelectedPortError] = useState(false);
  const [assignedToError, setAssignedToError] = useState(false);
  const [selectedCargoError, setSelectedCargoError] = useState(false);
  const [selectedAnchorageLocation, setSelectedAnchorageLocation] =
    useState(null);

  // Initialize `editData` when `row` is available
  // useEffect(() => {
  //   console.log("Row data:", row);
  //   if (row) {
  //     setEditData(row);
  //   }
  // }, [row]);

  useEffect(() => {
    console.log("Row data:", row);
    if (row) {
      setEditData(row);
      setSelectedEmployee(null);
      setFetchInitiated(false); // Reset fetch so new data loads

      // Optionally reset other states here if needed
    }
  }, [row, location.key]);

  // Fetch data only once when `editData` changes "6756c8e1b42b5b76e6934d29"
  useEffect(() => {
    console.log(editData, "editData");
    if (editData && !fetchInitiated && editData?._id) {
      setFetchInitiated(true); // Mark fetch as initiated
      fetchPdaDetails(editData?._id);
    }
  }, [editData, fetchInitiated]);

  const getItemName = (id, name) => {
    if (name === "customer") {
      const customer = customers?.find((s) => s._id === id);
      console.log(customer, "customer");
      return customer ? customer.customerName : "Unknown Customer";
    }
  };

  const fetchPdaDetails = async (id) => {
    // alert("fetchPdaDetails");
    if (id) {
      setIsLoading(true);
      let data = {
        pdaId: id,
      };
      try {
        const pdaDetails = await getPdaDetails(data);
        updateValues(pdaDetails);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch quotations:", error);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log(customers, "customers");
    console.log(selectedVessel, "selectedVessel");
  }, [customers, selectedVessel]);

  const updateValues = (response) => {
    console.log(response, "updateValues");
    setAnchorageLocationID(response?.pda?.anchorageLocation);
    setPdaResponse(response?.pda);
    setOpsPhoneNumber(response?.opsByPhonenumber);
    setFinalChargesArray(response?.pdaServices);
    setSelectedPdaId(response?.pda?._id);
    setSelectedPdaStatus(response?.pda?.pdaStatus);
    setRemarks(response?.pda?.remark);

    // setUploadedFiles((prevFiles) => [
    //   ...prevFiles,
    //   ...response?.pda?.documents,
    // ]); // Append new files to existing ones
    setUploadedFiles(response?.pda?.documents); // Append new files to existing ones

    let selectedVessel;
    if (response?.pda?.vesselId) {
      let vessels_list = localStorage.getItem("vessels_list");
      selectedVessel = JSON.parse(vessels_list)?.find((vessel) => {
        return vessel._id == response?.pda?.vesselId;
      });
      console.log(selectedVessel, "selectedVessel");
    }
    if (selectedVessel) {
      setSelectedVessel(selectedVessel);
    }

    console.log(response?.pda?.portId, "response?.pda?.portId");

    let selectedPort;
    if (response?.pda?.portId) {
      let ports_list = localStorage.getItem("ports_list");
      selectedPort = JSON.parse(ports_list).find(
        (port) => port._id == response?.pda?.portId
      );
      console.log(selectedPort, "selectedPort");
    }
    if (selectedPort) {
      setSelectedPort(selectedPort);
      fetchAnchorageValues(selectedPort);
    }

    let selectedCargo;
    if (response?.pda?.cargoId) {
      let cargos_list = localStorage.getItem("cargos_list");
      selectedCargo = JSON.parse(cargos_list)?.find(
        (cargo) => cargo._id === response?.pda?.cargoId
      );
      console.log(selectedCargo, "selectedCargo");
    }

    if (selectedCargo) {
      setSelectedCargo(selectedCargo);
    }

    let selectedEmployee;
    console.log(
      response?.pda?.assignedEmployee,
      "response?.pda?.assignedEmployee"
    );

    if (response?.pda?.assignedEmployee) {
      let employees_list = localStorage.getItem("employees_list");
      selectedEmployee = JSON.parse(employees_list)?.find(
        (employee) => employee._id === response?.pda?.assignedEmployee
      );
      console.log(selectedEmployee, "selectedEmployee_updatevalues");
    } else if (
      response?.pda?.assignedEmployee == null ||
      response?.pda?.assignedEmployee == undefined ||
      response?.pda?.assignedEmployee == ""
    ) {
      setSelectedEmployee(null);
    }

    if (selectedEmployee) {
      console.log(selectedEmployee, "selectedEmployee_set");
      setSelectedEmployee(selectedEmployee);
    }
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    console.log(value, "value");
    switch (name) {
      case "vessel":
        setSelectedVessel(vessels?.find((vessel) => vessel._id === value));
        setSelectedVesselError(false);
        break;
      case "port":
        setSelectedPort(ports?.find((port) => port._id === value));
        setSelectedPortError(false);
        fetchAnchorageValues(ports?.find((port) => port._id === value));

        break;
      case "cargo":
        setSelectedCargo(cargos?.find((cargo) => cargo._id === value));
        break;
      case "employee":
        setSelectedEmployee(
          employees?.find((employee) => employee._id === value)
        );
        setAssignedToError(false);
        setSelectedEmployeeError(false);

        break;
      case "status":
        setSelectedStatus(value);
        break;
      case "anchorageLocation":
        setSelectedAnchorageLocation(
          anchorageLocations?.find((location) => location._id === value)
        );
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "remarks") {
      setRemarks(value);
    }
  };

  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

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
    // const updatedFiles = uploadedFiles.filter((file) => file.url !== fileUrl);
    // setUploadedFiles(updatedFiles);
    console.log(fileUrl, "fileUrl");

    if (fileUrl?._id) {
      let payload = {
        pdaId: editData?._id,
        documentId: fileUrl?._id,
      };
      try {
        const response = await deletePdaDocument(payload);
        if (response.status) {
          const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
          console.log(updatedFiles, "updatedFiles");
          setUploadedFiles(updatedFiles);
          setMessage("File has been deleted successfully");
          setOpenPopUp(true);
          fetchPdaDetails(editData?._id);
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

  const submitJobs = async (status) => {
    if (!selectedVessel) {
      setSelectedVesselError(true);
    }
    if (!selectedPort) {
      setSelectedPortError(true);
    }
    if (!selectedEmployee && selectedStatus == 6) {
      setAssignedToError(true);
    }
    if (!selectedEmployee) {
      setSelectedEmployeeError(true);
    }

    if (
      selectedVessel &&
      selectedPort &&
      selectedEmployee
      // selectedStatus !== "6"
    ) {
      let pdaPayload = {
        pdaId: editData?._id,
        vesselId: selectedVessel?._id ? selectedVessel?._id : selectedVessel,
        portId: selectedPort?._id ? selectedPort?._id : selectedPort,
        cargoId: selectedCargo?._id ? selectedCargo?._id : selectedCargo,
        assignedEmployee: selectedEmployee?._id,
        documents: uploadedFiles,
        charges: finalChargesArray,
        pdaStatus: Number(selectedStatus),
        anchorageLocation: selectedAnchorageLocation?._id,
        remark: remarks,
      };
      console.log(pdaPayload, "pdaPayload");
      try {
        const response = await editPDA(pdaPayload);
        if (response?.status == true) {
          fetchPdaDetails(response?.pda?._id);
          setSelectedEmployee(null);
          setMessage("Job has been saved successfully");
          setOpenPopUp(true);
        } else {
          setMessage("Job updation failed. Please try again");
          setOpenPopUp(true);
        }
      } catch (error) {
        setMessage("Job updation failed. Please try again");
        setOpenPopUp(true);
      } finally {
      }
    } else {
      setMessage("Please fill all the required fields and save");
      setOpenPopUp(true);
    }
  };

  const resubmitApi = async () => {
    let pdaPayload = {
      pdaId: editData?._id,
    };
    console.log(pdaPayload, "pdaPayload_resubmitPDA");
    const response = await resubmitJobForApproval(pdaPayload);
    if (response?.status) {
      setMessage(
        `The data for ${pdaResponse?.jobId} regarding the ${selectedVessel?.vesselName} at the ${selectedPort?.portName} has been updated and resubmitted`
      );
      setOpenPopUp(true);
      fetchPdaDetails(editData?._id);
    } else {
      setMessage(`Please try again`);
      setOpenPopUp(true);
    }
  };

  const fetchAnchorageValues = async (data) => {
    // alert("fetchAnchorageValues");
    console.log(data, "id_fetchAnchorageValues");
    try {
      const formdata = {
        portId: data?._id,
      };
      const response = await getAnchorageLocations(formdata);
      console.log(response, "response_fetchAnchorageValues");
      if (response?.status == true) {
        setAnchorageLocations(response?.area);
        console.log(anchorageLocationID, "anchorageLocationID");

        localStorage.setItem(
          "anchorage_locations_list",
          JSON.stringify(response.area)
        );
      }
    } catch (error) {
      console.error("Error fetching anchorage values:", error);
    }
  };

  //   TOMS/OM/25/0078

  //   {
  //     "portId": "673dda413b3ccd84505ab42e"
  // }

  // {
  //   "status": true,
  //   "area": [
  //       {
  //           "_id": "6788bfb016439454df662d65",
  //           "area": "Z"
  //       }
  //   ]
  // }

  useEffect(() => {
    console.log(anchorageLocationID, "anchorageLocationID");

    if (anchorageLocationID && anchorageLocations) {
      setAnchorageValue(anchorageLocationID);
    }
  }, [anchorageLocationID, anchorageLocations]); // Runs when anchorageLocationID changes

  const setAnchorageValue = (id) => {
    console.log(id, "setAnchorageValue_id");
    if (!id) return; // Ensure id is valid before proceeding

    if (anchorageLocations) {
      let selected_anchorage_location = anchorageLocations.find(
        (location) => location._id === id
      );
      console.log(
        selected_anchorage_location,
        "selected_anchorage_location setAnchorageValue"
      );

      if (selected_anchorage_location) {
        setSelectedAnchorageLocation(selected_anchorage_location);
      }
    }
  };

  useEffect(() => {
    console.log(anchorageLocations, "anchorageLocations");
    console.log(selectedAnchorageLocation, "selectedAnchorageLocation");
  }, [anchorageLocations, selectedAnchorageLocation]);

  const handleSubmit = (chargesArray) => {
    console.log("chargesArray Submitted: ", chargesArray);
    setFinalChargesArray(chargesArray);
    fetchPdaDetails(editData?._id);
  };

  const handleAddServiceRequestSubmit = () => {
    fetchPdaDetails(editData?._id);
    handleClose();
  };

  const handleEdit = (charges, index) => {};

  useEffect(() => {
    console.log(selectedCargo, "selectedCargo");
    console.log(selectedStatus, "selectedStatus");
    console.log(uploadedFiles, "uploadedFiles");
    console.log(selectedEmployee, "selectedEmployee");
    console.log(selectedPdaId, "selectedPdaId");
    console.log(selectedPdaStatus, "selectedPdaStatus");
    console.log(pdaResponse, "pdaResponse");
    if (selectedPdaStatus == 6) {
      setSelectedStatus(selectedPdaStatus);
    }
  }, [
    selectedCargo,
    selectedStatus,
    uploadedFiles,
    selectedEmployee,
    selectedPdaId,
    selectedPdaStatus,
    pdaResponse,
  ]);

  const openFinalReport = async () => {
    // if (!selectedStatus) {
    //   setSelectedStatusError(true);
    // }
    if (!selectedEmployee) {
      setSelectedEmployeeError(true);
    }
    // selectedStatus == 6 &&
    if (selectedEmployee) {
      navigate("/final-report", { state: { editData } });
    }
  };

  const updateQuotation = async () => {
    // if (!selectedStatus) {
    //   setSelectedStatusError(true);
    // }
    if (!selectedEmployee) {
      setSelectedEmployeeError(true);
      return;
    }

    if (!pdaResponse?.assignedEmployee) {
      setMessage("Please fill all the required fields and save");
      setOpenPopUp(true);
      return;
    }

    let pdaPayload = {
      pdaId: editData?._id,
      status: 7,
    };
    try {
      const response = await changeQuotationStatus(pdaPayload);
      console.log(response, "login_response");
      if (response?.status == true) {
        setMessage("Job has been successfully completed");
        setOpenPopUp(true);
        fetchPdaDetails(editData?._id);
      } else {
        setMessage("Job updation failed. Please try again");
        setOpenPopUp(true);
      }
    } catch (error) {
      setMessage("Job updation failed. Please try again");
      setOpenPopUp(true);
    } finally {
    }
  };

  const [generatePDAOpen, setGeneratePDAOpen] = useState(false);

  const handlePdaOpen = () => {
    setGeneratePDAOpen(true);
  };

  const handlePdaClose = () => {
    setGeneratePDAOpen(false);
  };

  useEffect(() => {
    console.log(remarks, "remarks");
  }, [remarks]);

  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const SendInvoiceOpen = () => {
    setInvoiceOpen(true);
  };
  const handleInvoiceClose = () => {
    setInvoiceOpen(false);
  };

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const openInvoicePage = () => {
    setInvoiceDialogOpen(true);
  };
  const closeInvoicePage = () => {
    setInvoiceDialogOpen(false);
  };
  const invoiceSubmit = (data) => {
    console.log(data, "datainvoiceSubmit");
    setInvoiceDialogOpen(false);
    fetchPdaDetails(localStorage.getItem("PDA_ID"));
  };

  const addServices = () => {
    handleClickOpen();
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    console.log(selectedEmployee, "selectedEmployee_UE");
  }, [selectedEmployee]);

  return (
    <>
      <div className="job-no">
        {/* firstrow */}
        <div className=" jobrow ">
          <div className="opsnumber ">
            <span> Job ID:</span>
            <span className="fw-bolder opsfontweight">
              {pdaResponse?.jobId}
            </span>
          </div>
          <div className="d-flex justify-content-start back">
            <div className="opsdate">
              <label
                htmlFor="inputPassword"
                className="col-sm-4  col-form-label text-nowrap"
              >
                Job Date:
              </label>
              <div className="col-sm-4">
                <div className="fw-bolder opsfontweight ops-date">
                  {new Date(pdaResponse?.createdAt).toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>
          </div>
          {pdaResponse?.pdaStatus == 7 && (
            <>
              <div className="draft-pda ">
                {pdaResponse?.pdaStatus == 7 && (
                  <>
                    <span className="badge statusbadge ">
                      <i className="bi bi-check2-circle circle"></i>{" "}
                    </span>{" "}
                  </>
                )}
                <div className="pdabadge">
                  {pdaResponse?.pdaStatus == 7 ? "Completed" : ""}
                </div>
              </div>
            </>
          )}
        </div>
        {/* secondrow */}
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        {/* thirdrow */}
        <div className="typesofcall-row ">
          <div className="row mb-3 align-items-start">
            <div className="col">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Vessel Name<span className="required"> * </span> :
              </label>
              <div className="vessel-select">
                <select
                  name="vessel"
                  className="form-select vesselbox"
                  onChange={handleSelectChange}
                  aria-label="Default select example"
                  value={selectedVessel?._id}
                >
                  <option value="">Choose Vessel name</option>
                  {vessels.map((vessel) => (
                    <option key={vessel._id} value={vessel._id}>
                      {vessel.vesselName}
                    </option>
                  ))}
                </select>
              </div>
              {selectedVesselError && (
                <>
                  <div className="invalid">Please select vessel</div>
                </>
              )}
            </div>
            <div className="col">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Port Name<span className="required"> * </span> :
              </label>
              <div className="vessel-select">
                <select
                  name="port"
                  className="form-select vesselbox"
                  onChange={handleSelectChange}
                  aria-label="Default select example"
                  value={selectedPort?._id}
                >
                  <option value="">Choose Port name</option>
                  {ports.map((port) => (
                    <option key={port._id} value={port._id}>
                      {port.portName}
                    </option>
                  ))}
                </select>
              </div>
              {selectedPortError && (
                <>
                  <div className="invalid">Please select port</div>
                </>
              )}
            </div>
            <div className="col">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Anchorage Location:
              </label>
              <div className="vessel-select">
                <select
                  name="anchorageLocation"
                  className="form-select vesselbox vboxholder"
                  onChange={handleSelectChange}
                  aria-label="Default select example"
                  value={selectedAnchorageLocation?._id}
                >
                  <option value="">Choose Anchorage Location</option>
                  {anchorageLocations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.area}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* fourthrow */}
        <div className="typesofcall-row ">
          <div className="row  mb-3 align-items-start">
            <div className="col ">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                {" "}
                Cargo :
              </label>
              <div className="vessel-select">
                <select
                  name="cargo"
                  className="form-select vesselbox"
                  onChange={handleSelectChange}
                  aria-label="Default select example"
                  value={selectedCargo?._id}
                >
                  <option value="">Choose Cargo name</option>
                  {cargos.map((cargo) => (
                    <option key={cargo._id} value={cargo._id}>
                      {cargo.cargoName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Ops By :<span className="required"> * </span>
              </label>
              <select
                name="employee"
                className="form-select vesselbox"
                onChange={handleSelectChange}
                aria-label="Default select example"
                value={selectedEmployee?._id || ""}
              >
                <option value="">Choose employee name</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {selectedEmployeeError && (
                <>
                  <div className="invalid">Please select OPS By</div>
                </>
              )}
            </div>

            <div className="col">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Status <span className="required"> </span> :
              </label>
              <div className="vessel-select">
                {pdaResponse?.pdaStatus != 7 && (
                  <>
                    <select
                      name="status"
                      className="form-select vesselbox"
                      onChange={handleSelectChange}
                      aria-label="Default select example"
                      value={selectedStatus}
                    >
                      <option value={5} disabled={selectedPdaStatus == 6}>
                        Open{" "}
                      </option>
                      <option value={6}>In Progress </option>
                    </select>
                  </>
                )}

                {pdaResponse?.pdaStatus == 7 && (
                  <>
                    <input
                      type="text"
                      className="form-control vesselbox"
                      value="Completed"
                      readOnly
                    />
                  </>
                )}

                {/* {selectedStatusError && (
                  <>
                    <div className="invalid">Please select status</div>
                  </>
                )} */}
              </div>
            </div>
          </div>
        </div>
        {/* fifthrowdocumentsupload */}

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
                                  onClick={() => handleFileDelete(file, index)}
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
        {/* <div className="templateouter">
          <div className="d-flex justify-content-between ">
            <div className="tempgenerated ">Upload Image 1</div>
            <div className="d-flex">
              <div className="icondown">
                <i className="bi bi-eye"></i>
              </div>
              <div className="iconpdf">
                <i className="bi bi-trash"></i>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between ">
            <div className="tempgenerated ">Upload Image 2</div>
            <div className="d-flex">
              <div className="icondown">
                <i className="bi bi-eye"></i>
              </div>
              <div className="iconpdf">
                <i className="bi bi-trash"></i>
              </div>
            </div>
          </div>
        </div> */}

        {/* sixthrowremarks */}
        <div className="row align-items-start">
          <div className="col-10">
            <div className="mb-3">
              <div className="col">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label "
                >
                  Remarks:
                </label>
                <textarea
                  rows="3"
                  className="form-control remarkfontsize"
                  id="exampleFormControlInput1"
                  placeholder=""
                  name="remarks"
                  onChange={handleInputChange}
                  value={remarks}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="col-2 addserv">
            <div className="mb-3">
              <div className="col">
                <button
                  type="button"
                  className="btn addcharge-button text-center serviceaddbtn"
                  onClick={() => {
                    addServices();
                  }}
                >
                  Request Service
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="charges-table">
          <div className="row mt-4">
            <div className="col-lg-12">
              <OpsChargesTable
                chargesArray={finalChargesArray}
                services={services}
                customers={customers}
                onSubmit={handleSubmit}
                ports={ports}
                onEdit={handleEdit}
                templates={templates}
                vendors={vendors}
                isAction={true}
                pdaResponse={pdaResponse}
                from={"edit-operation"}
                opsPhoneNumber={opsPhoneNumber}
              />
            </div>
          </div>
        </div>

        {/* seventhrowbuttons */}

        <div className="buttons-wrapper">
          <div className="left">
            {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
              "operations" && (
              <>
                <button
                  className="btn btna submit-button btnfsize"
                  onClick={() => {
                    handlePdaOpen();
                  }}
                >
                  Generate PDA
                </button>
              </>
            )}
          </div>
          <div className="right d-flex">
            {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
              "operations" && (
              <>
                {pdaResponse?.pdaStatus == 7 && (
                  <>
                    <button
                      className="btn btna submit-button"
                      onClick={() => {
                        openInvoicePage();
                      }}
                    >
                      Accept Job Report
                    </button>
                    <button
                      className="btn btna submit-button"
                      onClick={() => {
                        SendInvoiceOpen();
                      }}
                      disabled={pdaResponse?.invoiceStatus != 3}
                    >
                      Send Invoice
                    </button>
                  </>
                )}
              </>
            )}

            {pdaResponse?.invoiceStatus == 2 &&
              pdaResponse?.isResubmitRequestExist == true &&
              pdaResponse?.pdaStatus == 7 && (
                <>
                  <button
                    className="btn btna submit-button btnfsize"
                    onClick={() => {
                      resubmitApi();
                    }}
                  >
                    Resubmit for Approval
                  </button>
                </>
              )}

            {pdaResponse?.pdaStatus != 7 && (
              <>
                <button
                  className="btn btna submit-button btnfsize"
                  onClick={() => {
                    submitJobs();
                  }}
                >
                  Save
                </button>
              </>
            )}

            <button
              className="btn btna submit-button btnfsize"
              onClick={() => {
                openFinalReport();
              }}
            >
              Final Report
            </button>
            {pdaResponse?.pdaStatus != 7 && (
              <>
                <button
                  className="btn btna submit-button btnfsize"
                  onClick={() => {
                    updateQuotation();
                  }}
                >
                  Completed
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Loader isLoading={isLoading} />
      <PdaDialog
        open={generatePDAOpen}
        onClose={handlePdaClose}
        services={services}
        customers={customers}
        ports={ports}
        pdaResponse={pdaResponse}
        vendors={vendors}
        vessels={vessels}
        cargos={cargos}
      />
      <SendInvoice
        open={invoiceOpen}
        onClose={handleInvoiceClose}
        selectedPdaData={pdaResponse}
      />
      <InvoicePage
        open={invoiceDialogOpen}
        onClose={closeInvoicePage}
        onSubmit={invoiceSubmit}
        selectedPdaData={pdaResponse}
        pdaResponse={pdaResponse}
      />
      <AddServiceRequest
        open={open}
        onClose={handleClose}
        onSubmit={handleAddServiceRequestSubmit}
        selectedVessel={selectedVessel}
        selectedPort={selectedPort}
        selectedCargo={selectedCargo}
        pdaResponse={pdaResponse}
        finalChargesArray={finalChargesArray}
        services={services}
      />
    </>
  );
};

export default EditOperation;
