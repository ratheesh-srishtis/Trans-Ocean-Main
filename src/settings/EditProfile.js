import React, { useState, useEffect, useRef } from "react";
import { json, useLocation, useNavigate } from "react-router-dom";
import {
  saveEmployee,
  uploadDocuments,
  editEmployee,
  getAllDesignations,
  getAllEmployees,
  deleteCertificationDocument,
  deleteMedicalRecordDocument,
  deleteLicenseDocument,
  deleteVisaDocument,
  deleteContractDocument,
  deletePassportDocument,
} from "../services/apiEmployee";
import { editEmployeeProfile } from "../services/apiSettings";
import "../css/payment.css";
import Swal from "sweetalert2";
import PopUp from "../pages/PopUp";
import Loader from "../pages/Loader";
const EditProfile = ({ employeeObject }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = true;
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [EmployeeList, setEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [passportName, setpassportName] = useState(null);
  const [passportUrl, setpassportUrl] = useState(null);
  const [contractName, setcontractName] = useState(null);
  const [contractUrl, setcontractUrl] = useState(null);
  const [visaName, setvisaName] = useState(null);
  const [visaUrl, setvisaUrl] = useState(null);
  const [licenseName, setlicenseName] = useState(null);
  const [licenseUrl, setlicenseUrl] = useState(null);
  //const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadedMedicalFiles, setUploadedMedicalFiles] = useState({});
  const [uploadedCertificateFiles, setUploadedCertificateFiles] = useState({});
  const [openPopUp, setOpenPopUp] = useState(false);
  const fileInputRefPassport = useRef(null);
  const fileInputRefContract = useRef(null);
  const fileInputRefVisa = useRef(null);
  const fileInputRefCertificate = useRef(null);
  const fileInputRefLicence = useRef(null);
  const fileInputRefs = useRef({});
  const documentUrl = process.env.REACT_APP_ASSET_URL + "/";
  console.log(employeeObject, "employeeObject_editprofile");
  const [uploadedFiles, setUploadedFiles] = useState({
    passportupload:
      employeeObject?.passportDetails &&
      employeeObject.passportDetails.length > 0
        ? employeeObject.passportDetails[0].document
        : null,
    contractupload:
      employeeObject?.contractDetails &&
      employeeObject.contractDetails.length > 0
        ? employeeObject.contractDetails[0].document
        : null,
    visaupload:
      employeeObject?.visaDetails && employeeObject.visaDetails.length > 0
        ? employeeObject.visaDetails[0].document
        : null,

    licenseupload:
      employeeObject?.licenseDetails && employeeObject.licenseDetails.length > 0
        ? employeeObject.licenseDetails[0].document
        : null,
  });
  const initialFields =
    employeeObject?.isEditing && employeeObject?.medicalRecordDetails?.length
      ? employeeObject.medicalRecordDetails
      : [{ id: 1, description: "", relationship: "", medicalrord: "" }];
  // console.log('EW::',initialFields);
  const [fields, setFields] = useState(initialFields);
  const handleAddFields = () => {
    const newField = {
      id: fields.length + 1,
      description: "",
      relationship: "",
      medicalrord: "",
    };
    setFields([...fields, newField]);
  };

  const certificateInitialFields =
    employeeObject?.isEditing && employeeObject?.certificationDetails?.length
      ? employeeObject.certificationDetails
      : [{ id: 1, description: "", relationship: "", certificatesRecord: "" }];
  // console.log('EW::',initialFields);
  const [certificateFields, setCertificateFields] = useState(
    certificateInitialFields
  );
  const handleAddCertificateFields = () => {
    const newField = {
      id: fields.length + 1,
      certification: "",
      certificateDescription: "",
      certificatesRecord: "",
    };
    setCertificateFields([...certificateFields, newField]);
  };

  const existpassort = employeeObject?.passportDetails[0]?.document || "";
  const existcontract = employeeObject?.contractDetails[0]?.document || "";
  const existvisa = employeeObject?.visaDetails[0]?.document || "";

  const existlicense = employeeObject?.licenseDetails[0]?.document || "";
  const [desiginationlist, setDesiginations] = useState([]);
  const fetchAllDesignations = async () => {
    let listdesiginations = await getAllDesignations();
    setDesiginations(listdesiginations?.designations || []);
  };
  useEffect(() => {
    fetchAllDesignations();
  }, []);
  useEffect(() => {
    // Populate uploaded files based on initial medicalRecordDetails and other fileds
    if (isEditing) {
      const initialFiles = {};
      fields.forEach((field) => {
        if (field.document) {
          initialFiles[field._id] = {
            originalName: field.document.originalName,
            url: field.document.url,
          };
        }
      });
      const initialCertificateFiles = {};
      certificateFields.forEach((field) => {
        if (field.document) {
          initialCertificateFiles[field._id] = {
            originalName: field.document.originalName,
            url: field.document.url,
          };
        }
      });
      setUploadedMedicalFiles(initialFiles);
      setUploadedCertificateFiles(initialCertificateFiles);
      setpassportUrl(existpassort.url);
      setpassportName(existpassort.originalName);
      setcontractUrl(existcontract.url);
      setcontractName(existcontract.originalName);
      setvisaUrl(existvisa.url);
      setvisaName(existvisa.originalName);
      setlicenseUrl(existlicense.url);
      setlicenseName(existlicense.originalName);
    }
  }, [
    fields,
    isEditing,
    existpassort,
    existcontract,
    existvisa,
    existlicense,
    certificateFields,
  ]);
  const [formData, setFormData] = useState({
    employeeName: employeeObject?.employeeName || "",
    username: employeeObject?.username || "",
    password: employeeObject?.password || "",
    employeeLastName: employeeObject?.employeeLastName || "",
    dob: employeeObject?.dob || "",
    address: employeeObject?.address || "",
    nationality: employeeObject?.nationality || "",
    city: employeeObject?.city || "",
    state: employeeObject?.state || "",
    postcode: employeeObject?.postcode || "",
    contactNumber: employeeObject?.contactNumber || "",
    email: employeeObject?.email || "",
    passportNumber: employeeObject?.passportNumber || "",
    iqamaNumber: employeeObject?.iqamaNumber || "",
    dateOfJoining: employeeObject?.dateOfJoining || "",
    designation: employeeObject?.designation || "",
    //department:location.state?.department || '',
    officialEmail: employeeObject?.officialEmail || "",
    profession: employeeObject?.profession || "",
    passportDetails: employeeObject?.passportDetails || [],
    passportdetail_number:
      employeeObject?.passportDetails[0]?.passportNumber || "",
    passportdetail_expiry:
      employeeObject?.passportDetails[0]?.dateOfExpiry || "",
    passportupload: uploadedFiles.passportupload
      ? uploadedFiles.passportupload.originalName
      : "",
    contractDetails: employeeObject?.contractDetails || [],
    contractdetail_name: employeeObject?.contractDetails[0]?.contractName || "",
    contractdetail_expiry:
      employeeObject?.contractDetails[0]?.dateOfExpiry || "",
    contractupload: uploadedFiles.contractupload
      ? uploadedFiles.contractupload.originalName
      : "",
    visaDetails: employeeObject?.visaDetails || [],
    visa_number: employeeObject?.visaDetails[0]?.visaNumber || "",
    visa_expiry: employeeObject?.visaDetails[0]?.dateOfExpiry || "",
    visaupload: uploadedFiles.visaupload
      ? uploadedFiles.visaupload.originalName
      : "",

    licenseDetails: employeeObject?.licenseDetails || [],
    license_number: employeeObject?.licenseDetails[0]?.licenseNumber || "",
    license_date: employeeObject?.licenseDetails[0]?.dateOfExpiry || "",
    licenseupload: uploadedFiles.licenseupload
      ? uploadedFiles.licenseupload.originalName
      : "",
    medicalRecordDetails: employeeObject?.medicalRecordDetails || [],
    medical_description: "",
    relationship: "",

    certificationDetails: employeeObject?.certificationDetails || [],
    certification: "",
    certificateDescription: "",
    reportingTo: employeeObject?.reportingTo || "",
    reportingHead: employeeObject?.reportingHead || "",
  });
  const reloadpage = () => {
    // navigate("/profile");
    window.location.reload();
  };

  useEffect(() => {
    console.log(location.state, "location.state");
    console.log(employeeObject, "employeeObject");
  }, [location.state, employeeObject]);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeName)
      newErrors.employeeName = "First Name is required";
    if (!formData.employeeLastName)
      newErrors.employeeLastName = "Last Name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    // if (!formData.address) newErrors.address = "Address is required";
    // if (!formData.nationality)
    //   newErrors.nationality = "Nationality is required";
    // if (!formData.city) newErrors.city = "City is required";
    // if (!formData.state) newErrors.state = "State is required";
    // if (!formData.postcode) newErrors.postcode = "Post code is required";
    // if (!formData.contactNumber)
    //   newErrors.contactNumber = "Contact Number is required";
    // if (!formData.email) newErrors.email = "Email is required";
    // if (!formData.passportNumber)
    //   newErrors.passportNumber = "Passport Number is required";
    // if (!formData.iqamaNumber) newErrors.iqamaNumber = "Civil ID is required";
    if (!formData.dateOfJoining)
      newErrors.dateOfJoining = "Date of joining is required";
    if (!formData.designation)
      newErrors.designation = "Desigination is required";
    if (!formData.username) newErrors.username = "User Name is required";
    // Password validation
    if (!isEditing && !formData.password) {
      newErrors.password = "Password is required";
    }
    // if (!formData.department) newErrors.department = "Department is required";
    // if (!formData.officialEmail)
    //   newErrors.officialEmail = "Official Email is required";
    // passport Detail Validation
    const { passportdetail_number, passportdetail_expiry, passportupload } =
      formData;
    const isAnyFieldFilled =
      passportdetail_number || passportdetail_expiry || passportupload;
    if (
      isAnyFieldFilled &&
      !(passportdetail_number && passportdetail_expiry && passportupload)
    ) {
      newErrors.passportDetailsErr =
        "If any passport field is filled, all fields must be completed.";
    } else {
      delete newErrors.passportDetailsErr;
    }

    // Contract Details Validation
    const { contractdetail_name, contractdetail_expiry, contractupload } =
      formData;
    const isAnyContractFieldFilled =
      contractdetail_name || contractdetail_expiry || contractupload;
    if (
      isAnyContractFieldFilled &&
      !(contractdetail_name && contractdetail_expiry && contractupload)
    ) {
      newErrors.contractDetailsErr =
        "If any contract field is filled, all fields must be filled.";
    }
    // Visa Details Validation
    const { visa_number, visa_expiry, visaupload } = formData;
    const isAnyVisaFieldFilled = visa_number || visa_expiry || visaupload;
    if (isAnyVisaFieldFilled && !(visa_number && visa_expiry && visaupload)) {
      newErrors.visaDetailsErr =
        "If any visa field is filled, all fields must be filled.";
    }

    // Licence Details Validation
    const { license_number, license_date, licenseupload } = formData;
    const isAnyLicenceFieldFilled =
      license_number || license_date || licenseupload;
    if (
      isAnyLicenceFieldFilled &&
      !(license_number && license_date && licenseupload)
    ) {
      newErrors.licenceDetailsErr =
        "If any licence field is filled, all fields must be filled.";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleDeleteFile = (fieldName, passed_id) => {
    console.log(fieldName, "fieldName");
    console.log(passed_id, "passed_id_handleDeleteFile");
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
        // Update uploaded files
        setUploadedFiles((prevFiles) => {
          const updatedFiles = { ...prevFiles };
          //console.log('Before delete:', updatedFiles);
          delete updatedFiles[fieldName];
          //console.log('After delete:', updatedFiles);
          return updatedFiles;
        });

        // Update form data
        setFormData((prevData) => ({
          ...prevData,
          [fieldName]: "",
        }));

        // Check for specific cases
        switch (fieldName) {
          case "passportupload":
            // Delete from database if in edit mode and employeeId exists
            if (isEditing && location.state?.employeeId) {
              try {
                const deletePayload = {
                  employeeId: location.state.employeeId,
                  documentId: location.state.passportDetails[0]._id,
                };
                await deletePassportDocument(deletePayload);
                console.log(
                  "Passport document deleted from database successfully"
                );
              } catch (error) {
                console.error(
                  "Error deleting passport document from database:",
                  error
                );
                Swal.fire(
                  "Error",
                  "Failed to delete passport document from database",
                  "error"
                );
                return; // Exit if database deletion fails
              }
            }

            setpassportName("");
            setpassportUrl("");
            if (fileInputRefPassport.current) {
              fileInputRefPassport.current.value = null;
            }
            break;
          case "contractupload":
            // Delete from database if in edit mode and employeeId exists
            if (isEditing && location.state?.employeeId) {
              try {
                const deletePayload = {
                  employeeId: location.state.employeeId,
                  documentId: location.state.contractDetails[0]._id,
                };
                await deleteContractDocument(deletePayload);
                console.log(
                  "Contract document deleted from database successfully"
                );
              } catch (error) {
                console.error(
                  "Error deleting contract document from database:",
                  error
                );
                Swal.fire(
                  "Error",
                  "Failed to delete contract document from database",
                  "error"
                );
                return; // Exit if database deletion fails
              }
            }

            setcontractName("");
            setcontractUrl("");
            if (fileInputRefContract.current) {
              fileInputRefContract.current.value = null;
            }
            break;
          case "visaupload":
            // Delete from database if in edit mode and employeeId exists
            if (isEditing && location.state?.employeeId) {
              try {
                const deletePayload = {
                  employeeId: location.state.employeeId,
                  documentId: location.state.visaDetails[0]._id,
                };
                await deleteVisaDocument(deletePayload);
                console.log("Visa document deleted from database successfully");
              } catch (error) {
                console.error(
                  "Error deleting visa document from database:",
                  error
                );
                Swal.fire(
                  "Error",
                  "Failed to delete visa document from database",
                  "error"
                );
                return; // Exit if database deletion fails
              }
            }

            setvisaName("");
            setvisaUrl("");
            if (fileInputRefVisa.current) {
              fileInputRefVisa.current.value = null;
            }
            break;
          case "licenseupload":
            // Delete from database if in edit mode and employeeId exists
            if (isEditing && location.state?.employeeId) {
              try {
                const deletePayload = {
                  employeeId: location.state.employeeId,
                  documentId: location.state.licenseDetails[0]._id,
                };
                await deleteLicenseDocument(deletePayload);
                console.log(
                  "License document deleted from database successfully"
                );
              } catch (error) {
                console.error(
                  "Error deleting license document from database:",
                  error
                );
                Swal.fire(
                  "Error",
                  "Failed to delete license document from database",
                  "error"
                );
                return; // Exit if database deletion fails
              }
            }

            setlicenseName("");
            setlicenseUrl("");
            if (fileInputRefLicence.current) {
              fileInputRefLicence.current.value = null;
            }
            break;

          case "certificatesRecord":
            // Delete from database if in edit mode and has _id
            if (isEditing && passed_id && location.state?.employeeId) {
              try {
                const deletePayload = {
                  employeeId: location.state.employeeId,
                  documentId: passed_id,
                };
                await deleteCertificationDocument(deletePayload);
                console.log("Certificate deleted from database successfully");
              } catch (error) {
                console.error(
                  "Error deleting certificate from database:",

                  error
                );
                Swal.fire(
                  "Error",
                  "Failed to delete certificate from database",
                  "error"
                );
                return; // Exit if database deletion fails
              }
            }

            // Update uploaded medical files
            setUploadedCertificateFiles((prevFiles) => {
              //console.log('Before delete:', prevFiles);
              const { [passed_id]: deleted, ...updatedFiles } = prevFiles; // destructuring to remove the field
              //console.log('After delete:', updatedFiles);
              let updatedData = [];
              if (isEditing)
                updatedData = certificateFields.filter(
                  (item) => (item._id || item.id) !== passed_id
                );
              else
                updatedData = certificateFields.filter(
                  (item) => item.id !== passed_id
                );
              //console.log("HERR::",updatedData);
              setCertificateFields(updatedData);
              return { ...updatedFiles };
            });

            // Clear file input
            setFormData((prevData) => ({
              ...prevData,
              [passed_id]: {
                certification: "",
                certificateDescription: "",
                certificatesRecord: null,
              },
            }));
            if (fileInputRefs.current[passed_id]) {
              fileInputRefs.current[passed_id].value = null;
            }

            break;

          default:
            // Delete from database if in edit mode and has _id
            if (isEditing && passed_id && location.state?.employeeId) {
              try {
                const deletePayload = {
                  employeeId: location.state.employeeId,
                  documentId: passed_id,
                };
                await deleteMedicalRecordDocument(deletePayload);
                console.log(
                  "Medical record deleted from database successfully"
                );
              } catch (error) {
                console.error(
                  "Error deleting medical record from database:",
                  error
                );
                Swal.fire(
                  "Error",
                  "Failed to delete medical record from database",
                  "error"
                );
                return; // Exit if database deletion fails
              }
            }

            // Update uploaded medical files
            setUploadedMedicalFiles((prevFiles) => {
              //console.log('Before delete:', prevFiles);
              const { [passed_id]: deleted, ...updatedFiles } = prevFiles; // destructuring to remove the field
              //console.log('After delete:', updatedFiles);
              let updatedData = [];
              if (isEditing)
                updatedData = fields.filter(
                  (item) => (item._id || item.id) !== passed_id
                );
              else updatedData = fields.filter((item) => item.id !== passed_id);
              //console.log("HERR::",updatedData);
              setFields(updatedData);
              return { ...updatedFiles };
            });

            // Clear file input
            setFormData((prevData) => ({
              ...prevData,
              [passed_id]: {
                description: "",
                relationship: "",
                medicalrord: null,
              },
            }));
            if (fileInputRefs.current[passed_id]) {
              fileInputRefs.current[passed_id].value = null;
            }
            break;
        }
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      const newPassportDetail = {
        passportNumber: formData.passportdetail_number,
        dateOfExpiry: formData.passportdetail_expiry,
        document: {
          url: passportUrl,
          originalName: passportName,
        },
      };

      const newContractDetail = {
        contractName: formData.contractdetail_name,
        dateOfExpiry: formData.contractdetail_expiry,
        document: {
          url: contractUrl,
          originalName: contractName,
        },
      };

      const newVisaDetail = {
        visaNumber: formData.visa_number,
        dateOfExpiry: formData.visa_expiry,
        document: {
          url: visaUrl,
          originalName: visaName,
        },
      };

      const newLicenceDetail = {
        licenseNumber: formData.license_number,
        dateOfExpiry: formData.license_date,
        document: {
          url: licenseUrl,
          originalName: licenseName,
        },
      };

      let medicalRecordDetails = [];
      let editmedicalRecordDetails = [];
      if (isEditing) {
        editmedicalRecordDetails = fields
          .filter(
            (field) => field.description || field.relationship || field.document
          )
          .map((field) => ({
            description: field.description,
            relationship: field.relationship,
            document: field.document,
          }));
      } else {
        //console.log(fields);
        medicalRecordDetails = fields
          .filter(
            (field) =>
              field.description ||
              field.relationship ||
              (field.medicalrord && field.medicalrord.url)
          )
          .map((field) => ({
            description: field.description,
            relationship: field.relationship,
            document: {
              url: field.medicalrord ? field.medicalrord.url : "",
              originalName: field.medicalrord
                ? field.medicalrord.originalName
                : "",
            },
          }));
      }

      let certificationDetails = [];
      let editCertificationDetails = [];
      if (isEditing) {
        editCertificationDetails = certificateFields
          .filter(
            (field) =>
              field.certification ||
              field.certificateDescription ||
              field.document
          )
          .map((field) => ({
            certification: field.certification,
            certificateDescription: field.certificateDescription,
            document: field.document,
          }));
      } else {
        //console.log(fields);
        certificationDetails = certificateFields
          .filter(
            (field) =>
              field.certification ||
              field.certificateDescription ||
              (field.certificatesRecord && field.certificatesRecord.url)
          )
          .map((field) => ({
            certification: field.certification,
            certificateDescription: field.certificateDescription,
            document: {
              url: field.certificatesRecord ? field.certificatesRecord.url : "",
              originalName: field.certificatesRecord
                ? field.certificatesRecord.originalName
                : "",
            },
          }));
      }

      //if(passportUrl)
      formData.passportDetails = newPassportDetail;
      //if(contractUrl)
      formData.contractDetails = newContractDetail;
      //(visaUrl)
      formData.visaDetails = newVisaDetail;

      //if(licenseUrl)
      formData.licenseDetails = newLicenceDetail;
      if (isEditing) formData.medicalRecordDetails = editmedicalRecordDetails;
      else formData.medicalRecordDetails = medicalRecordDetails;

      if (isEditing) formData.certificationDetails = editCertificationDetails;
      else formData.certificationDetails = certificationDetails;
      let response;
      if (isEditing) {
        formData.employeeId = employeeObject?.employeeId;
        // If password field is empty, send empty string
        formData.password = formData.password ? formData.password : "";
        response = await editEmployeeProfile(formData);
      } else {
        response = await saveEmployee(formData);
      }

      if (response.status === true) {
        setOpenPopUp(true);
        setMessage(response.message);
        fileInputRefPassport.current.value = "";
        fileInputRefContract.current.value = "";
        fileInputRefVisa.current.value = "";
        // fileInputRefCertificate.current.value = "";
        fileInputRefLicence.current.value = "";
        setFormData({
          employeeName: "",
          username: "",
          password: "",
          employeeLastName: "",
          dob: "",
          address: "",
          nationality: "",
          city: "",
          state: "",
          postcode: "",
          contactNumber: "",
          email: "",
          passportNumber: "",
          iqamaNumber: "",
          dateOfJoining: "",
          profession: "",
          designation: "",
          // department:"",
          officialEmail: "",
          passportdetail_number: "",
          passportdetail_expiry: "",
          reportingTo: "",
          reportingHead: "",
        });
      }
    } catch (error) {
      setMessage(error);
    }
  };

  const handleFileChange = async (event) => {
    const imageData = event.target.files[0];
    if (!imageData) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("files", imageData);
      let response = await uploadDocuments(formData);
      const updatedFileData = {
        originalName: response.data[0].originalName,
        url: response.data[0].url,
      };

      setUploadedFiles((prevFiles) => ({
        ...prevFiles,
        [event.target.name]: updatedFileData,
      }));

      //console.log('Uploaded Files:', updatedFileData);

      setFormData((prevData) => ({
        ...prevData,
        [event.target.name]: response.data[0].originalName,
      }));
      //console.log('Form Data:', response.data[0].originalName);

      if (response.status === true) {
        switch (event.target.name) {
          case "passportupload":
            setpassportName(response.data[0].originalName);
            setpassportUrl(response.data[0].url);
            setFormData((prevData) => ({
              ...prevData,
              passportupload: response.data[0].originalName,
            }));

            break;
          case "contractupload":
            setcontractName(response.data[0].originalName);
            setcontractUrl(response.data[0].url);
            setFormData((prevData) => ({
              ...prevData,
              contractupload: response.data[0].originalName,
            }));
            break;
          case "visaupload":
            setvisaName(response.data[0].originalName);
            setvisaUrl(response.data[0].url);
            setFormData((prevData) => ({
              ...prevData,
              visaupload: response.data[0].originalName,
            }));
            break;

          case "licenseupload":
            setlicenseName(response.data[0].originalName);
            setlicenseUrl(response.data[0].url);
            setFormData((prevData) => ({
              ...prevData,
              licenseupload: response.data[0].originalName,
            }));
            break;
          case "certificatesRecord":
            const certificateFieldId = event.target.id.split("_")[1]; // Extracting ID from the input ID
            console.log(certificateFieldId, "certificateFieldId");
            let certificateUpdatedFields = [];
            let editUpdatedCertificateFields = [];
            if (isEditing) {
              //console.log("OKH::",fields);
              editUpdatedCertificateFields = certificateFields.map((field) => {
                //delete field.medical_description;
                delete field.certificatesRecord;
                if (field.id) {
                  field._id = field.id;
                  delete field.id;
                }
                //console.log("HH",field);
                if (
                  field._id === parseInt(certificateFieldId) ||
                  field._id === certificateFieldId
                ) {
                  return {
                    ...field,
                    document: {
                      url: response.data[0].url, // Assuming response data structure
                      originalName: response.data[0].originalName,
                    },
                  };
                }

                return field;
              });
            } else {
              certificateUpdatedFields = certificateFields.map((field) => {
                if (field.id === parseInt(certificateFieldId)) {
                  return {
                    ...field,
                    certificatesRecord: {
                      url: response.data[0].url, // Assuming response data structure
                      originalName: response.data[0].originalName,
                    },
                  };
                }
                return field;
              });
            }
            if (isEditing) {
              setCertificateFields(editUpdatedCertificateFields);
              console.log(
                "editUpdatedCertificateFields:",
                editUpdatedCertificateFields
              );
            } else {
              setCertificateFields(certificateUpdatedFields);
              //console.log('Updated Fields:', certificateUpdatedFields);
            }

            setUploadedCertificateFiles((prevFiles) => ({
              ...prevFiles,
              [certificateFieldId]: updatedFileData,
            }));
            // console.log('Updated Fields:', isEditing ? editUpdatedCertificateFields : certificateUpdatedFields);
            //console.log('Uploaded Medical Files:', updatedFileData);

            break;
          default:
            const fieldId = event.target.id.split("_")[1]; // Extracting ID from the input ID
            console.log(fieldId, "medical_fieldId");

            let updatedFields = [];
            let editupdatedFileds = [];
            if (isEditing) {
              //console.log("OKH::",fields);
              editupdatedFileds = fields.map((field) => {
                //delete field.medical_description;
                delete field.medicalrord;
                if (field.id) {
                  field._id = field.id;
                  delete field.id;
                }
                //console.log("HH",field);

                if (field._id === parseInt(fieldId) || field._id === fieldId) {
                  return {
                    ...field,
                    document: {
                      url: response.data[0].url, // Assuming response data structure
                      originalName: response.data[0].originalName,
                    },
                  };
                }
                return field;
              });
            } else {
              updatedFields = fields.map((field) => {
                if (field.id === parseInt(fieldId)) {
                  return {
                    ...field,
                    medicalrord: {
                      url: response.data[0].url, // Assuming response data structure
                      originalName: response.data[0].originalName,
                    },
                  };
                }
                return field;
              });
            }
            if (isEditing) {
              setFields(editupdatedFileds);
              //console.log('Updated Fields:', editupdatedFileds);
            } else {
              setFields(updatedFields);
              //console.log('Updated Fields:', updatedFields);
            }

            setUploadedMedicalFiles((prevFiles) => ({
              ...prevFiles,
              [fieldId]: updatedFileData,
            }));
            // console.log('Updated Fields:', isEditing ? editupdatedFileds : updatedFields);
            //console.log('Uploaded Medical Files:', updatedFileData);
            break;
        }
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setMessage("Failed to upload document. Please try again.");
      setOpenPopUp(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(uploadedMedicalFiles, "uploadedMedicalFiles");
    console.log(uploadedCertificateFiles, "uploadedCertificateFiles");
  }, [uploadedCertificateFiles, uploadedMedicalFiles]);

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const fetchemployeeList = async (payload) => {
    try {
      const listallemployees = await getAllEmployees(payload);
      setEmployeeList(listallemployees?.employees || []);
      //console.log(listallemployees,"---listallemployees");
    } catch (error) {
      console.error("Failed to fetch employeed", error);
    }
  };

  useEffect(() => {
    let payload = { searchKey: "" };
    fetchemployeeList(payload);
  }, []);

  useEffect(() => {
    console.log(EmployeeList, "EmployeeList");
  }, [EmployeeList]);

  return (
    <>
      <div className="p-3">
        <div className="newemployee">
          {!isEditing ? "New Employee Details" : null}
        </div>
        <div className="pleaseinfo mb-3">
          {!isEditing ? "Please fill out your informations below" : null}
        </div>
        <div className="Personal mb-3">Personal Information</div>
        <form onSubmit={handleSubmit}>
          <div className="row mb-2">
            <div className="col-4">
              <label htmlFor="employeeName" className="form-label">
                First Name:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="employeeName"
                placeholder=""
                name="employeeName"
                onChange={handleChange}
                value={formData.employeeName}
              />
              {errors.employeeName && (
                <span className="invalid">{errors.employeeName}</span>
              )}
            </div>
            <div className="col-4">
              <label htmlFor="employeeLastName" className="form-label">
                Last Name:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="employeeLastName"
                placeholder=""
                name="employeeLastName"
                onChange={handleChange}
                value={formData.employeeLastName}
              />
              {errors.employeeLastName && (
                <span className="invalid">{errors.employeeLastName}</span>
              )}
            </div>
            <div className="col-4">
              <label htmlFor="dob" className="form-label">
                Date of Birth :{/* <span className="required"> * </span> */}
              </label>
              <input
                type="date"
                className="form-control vessel-voyage"
                id="dob"
                placeholder=""
                name="dob"
                onChange={handleChange}
                value={formData.dob}
              />
              {errors.dob && <span className="invalid">{errors.dob}</span>}
            </div>
          </div>
          <div className="row mb-2 ">
            <div className="col">
              <div className="mb-3">
                <div className="col">
                  <label htmlFor="adddress" className="form-label">
                    Address:
                  </label>
                  <textarea
                    rows="3"
                    className="form-control addressnewemployee"
                    id="adddress"
                    placeholder=""
                    name="address"
                    onChange={handleChange}
                    value={formData.address}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-4">
              <label htmlFor="city" className="form-label">
                City:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="city"
                placeholder=""
                name="city"
                onChange={handleChange}
                value={formData.city}
              />
              {errors.city && <span className="invalid">{errors.city}</span>}
            </div>
            <div className="col-4">
              <label htmlFor="state" className="form-label">
                State:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="state"
                placeholder=""
                name="state"
                onChange={handleChange}
                value={formData.state}
              />
              {errors.state && <span className="invalid">{errors.state}</span>}
            </div>
            <div className="col-4">
              <label htmlFor="postcode" className="form-label">
                Post Code:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="postcode"
                placeholder=""
                name="postcode"
                onChange={handleChange}
                value={formData.postcode}
              />
              {errors.postcode && (
                <span className="invalid">{errors.postcode}</span>
              )}
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-4">
              <label htmlFor="nationality" className="form-label">
                Nationality:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="nationality"
                placeholder=""
                name="nationality"
                onChange={handleChange}
                value={formData.nationality}
              />
              {errors.nationality && (
                <span className="invalid">{errors.nationality}</span>
              )}
            </div>
            <div className="col-4">
              <label htmlFor="contactnumber" className="form-label">
                Contact Number:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="number"
                className="form-control vessel-voyage"
                id="contactnumber"
                placeholder=""
                name="contactNumber"
                onChange={handleChange}
                value={formData.contactNumber}
              />
              {errors.contactNumber && (
                <span className="invalid">{errors.contactNumber}</span>
              )}
            </div>
            <div className="col-4">
              <label htmlFor="email" className="form-label">
                Email ID:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="email"
                className="form-control vessel-voyage"
                id="email"
                placeholder=""
                name="email"
                onChange={handleChange}
                value={formData.email}
              />
              {errors.email && <span className="invalid">{errors.email}</span>}
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-4">
              <label htmlFor="passportnumber" className="form-label">
                Passport Number:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="passportnumber"
                placeholder=""
                name="passportNumber"
                onChange={handleChange}
                value={formData.passportNumber}
              />
              {errors.passportNumber && (
                <span className="invalid">{errors.passportNumber}</span>
              )}
            </div>
            <div className="col-4">
              <label htmlFor="iqamanumber" className="form-label">
                Civil ID:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="iqamanumber"
                placeholder=""
                name="iqamaNumber"
                onChange={handleChange}
                value={formData.iqamaNumber}
              />
              {errors.iqamaNumber && (
                <span className="invalid">{errors.iqamaNumber}</span>
              )}
            </div>
            <div className="col-4">
              <label htmlFor="username" className="form-label">
                User Name:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="username"
                placeholder=""
                name="username"
                onChange={handleChange}
                value={formData.username}
              />
              {errors.username && (
                <span className="invalid">{errors.username}</span>
              )}
            </div>
            <div className="col-4 position-relative">
              <label htmlFor="password" className="form-label">
                Password:
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control vessel-voyage ${
                  errors.password ? "is-invalid" : ""
                }`}
                id="password"
                name="password"
                placeholder=""
                onChange={handleChange}
                value={formData.password}
              />
              {/* Bootstrap eye icon */}
              <i
                className={`bi ${
                  showPassword ? "bi-eye-slash" : "bi-eye"
                } password-toggle`}
                onClick={togglePassword}
              ></i>
              {errors.password && (
                <span className="invalid">{errors.password}</span>
              )}
            </div>
          </div>
          <div className="Personal mt-3 mb-3">Official Information</div>
          <div className="row">
            <div className="col-2">
              <label htmlFor="dateofjoining" className="form-label">
                Date of Joining:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="date"
                className="form-control vessel-voyage"
                id="dateofjoining"
                placeholder=""
                name="dateOfJoining"
                onChange={handleChange}
                value={formData.dateOfJoining}
              />
              {errors.dateOfJoining && (
                <span className="invalid">{errors.dateOfJoining}</span>
              )}
            </div>
            <div className="col-3">
              <label htmlFor="desigination" className="form-label">
                Designation:
                {/* <span className="required"> * </span> */}
              </label>
              <select
                name="designation"
                className="form-select vesselbox"
                aria-label="Default select example"
                onChange={handleChange}
                value={formData.designation}
              >
                <option value="">Choose Desigination</option>
                {desiginationlist.map((desg) => (
                  <option key={desg._id} value={desg._id}>
                    {desg.designationName}
                  </option>
                ))}
              </select>

              {errors.designation && (
                <span className="invalid">{errors.designation}</span>
              )}
            </div>

            <div className="col-4">
              <label htmlFor="officialemail" className="form-label">
                Email ID:
                {/* <span className="required"> * </span> */}
              </label>
              <input
                type="email"
                className="form-control vessel-voyage"
                id="officialemail"
                placeholder=""
                name="officialEmail"
                onChange={handleChange}
                value={formData.officialEmail}
              />

              {errors.officialEmail && (
                <span className="invalid">{errors.officialEmail}</span>
              )}
            </div>
            <div className="col-3">
              <label htmlFor="officialemail" className="form-label">
                Profession Title:
              </label>
              <input
                type="text"
                className="form-control vessel-voyage"
                id="profession"
                placeholder=""
                name="profession"
                onChange={handleChange}
                value={formData.profession}
              />
            </div>
          </div>

          <div className="row py-4">
            <div className="col-6">
              <label htmlFor="reportingTo" className="form-label">
                Reporting Person:
              </label>
              <select
                name="reportingTo"
                className="form-select vesselbox"
                aria-label="Default select example"
                onChange={handleChange}
                value={formData.reportingTo}
              >
                <option value="">Choose Reporting Person</option>
                {EmployeeList.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.employeeName} {employee.employeeLastName} (
                    {employee.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label htmlFor="reportingHead" className="form-label">
                Reporting Head:
              </label>
              <select
                name="reportingHead"
                className="form-select vesselbox"
                aria-label="Default select example"
                onChange={handleChange}
                value={formData.reportingHead}
              >
                <option value="">Choose Reporting Head</option>
                {EmployeeList.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.employeeName} {employee.employeeLastName} (
                    {employee.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="Personal mt-3 mb-3">Documents</div>
          {/* passport */}
          <div className="documentnewstyle shadow p-3 mb-4 bg-body-tertiary rounded">
            <div className="passport">Passport Details</div>
            <div>
              <div className="row mb-2">
                <div className="col-4">
                  <label htmlFor="passportdetail_number" className="form-label">
                    Passport Number:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="text"
                    className="form-control vessel-voyage"
                    id="passportdetail_number"
                    placeholder=""
                    name="passportdetail_number"
                    onChange={handleChange}
                    value={formData.passportdetail_number}
                  />
                </div>
                <div className="col-3">
                  <label htmlFor="passportdetail_expiry" className="form-label">
                    Date of Expiry:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="date"
                    className="form-control vessel-voyage"
                    id="passportdetail_expiry"
                    placeholder=""
                    name="passportdetail_expiry"
                    onChange={handleChange}
                    value={formData.passportdetail_expiry}
                  />
                </div>
                <div className="col-5">
                  <label htmlFor="portofolio" className="form-label">
                    Document Upload:
                  </label>
                  <input
                    className="form-control documentemployee"
                    type="file"
                    id="portofolio"
                    onChange={handleFileChange}
                    name="passportupload"
                    ref={fileInputRefPassport}
                  ></input>
                </div>
                {errors.passportDetailsErr && (
                  <span className="invalid">{errors.passportDetailsErr}</span>
                )}
              </div>
              <div className="mb-2 col-12">
                <div className="templatelink">Uploaded Files:</div>
                <div className="templateouter">
                  {uploadedFiles.passportupload && (
                    <div className="d-flex justify-content-between">
                      <div className="tempgenerated">
                        {uploadedFiles.passportupload.originalName}
                      </div>
                      <div className="d-flex">
                        <div
                          className="icondown"
                          onClick={() =>
                            window.open(
                              documentUrl + uploadedFiles.passportupload.url
                            )
                          }
                        >
                          <i className="bi bi-eye"></i>
                        </div>
                        <div
                          className="iconpdf"
                          onClick={() => handleDeleteFile("passportupload")}
                        >
                          <i className="bi bi-trash"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* passportend */}

          {/* contract */}
          <div className="documentnewstyle shadow p-3 mb-4 bg-body-tertiary rounded">
            <div className="contract">Contract Details</div>
            <div>
              <div className="row mb-2">
                <div className="col-4">
                  <label htmlFor="contractdetail_name" className="form-label">
                    Contract Name:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="text"
                    className="form-control vessel-voyage"
                    id="contractdetail_name"
                    placeholder=""
                    name="contractdetail_name"
                    onChange={handleChange}
                    value={formData.contractdetail_name}
                  />
                </div>
                <div className="col-3">
                  <label htmlFor="contractdetail_expiry" className="form-label">
                    Date of Expiry:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="date"
                    className="form-control vessel-voyage"
                    id="contractdetail_expiry"
                    placeholder=""
                    name="contractdetail_expiry"
                    onChange={handleChange}
                    value={formData.contractdetail_expiry}
                  />
                </div>
                <div className="col-5">
                  <label htmlFor="portofolio1" className="form-label">
                    Document Upload:
                  </label>
                  <input
                    className="form-control documentemployee"
                    type="file"
                    id="portofolio1"
                    name="contractupload"
                    onChange={handleFileChange}
                    ref={fileInputRefContract}
                  ></input>
                </div>
                {errors.contractDetailsErr && (
                  <span className="invalid">{errors.contractDetailsErr}</span>
                )}
              </div>
              <div className="mb-2 col-12">
                <div className="templatelink">Uploaded Files:</div>
                <div className="templateouter">
                  {uploadedFiles.contractupload && (
                    <div className="d-flex justify-content-between">
                      <div className="tempgenerated">
                        {uploadedFiles.contractupload.originalName}
                      </div>
                      <div className="d-flex">
                        <div
                          className="icondown"
                          onClick={() =>
                            window.open(
                              documentUrl + uploadedFiles.contractupload.url
                            )
                          }
                        >
                          <i className="bi bi-eye"></i>
                        </div>
                        <div
                          className="iconpdf"
                          onClick={() => handleDeleteFile("contractupload")}
                        >
                          <i className="bi bi-trash"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* contract end */}

          {/* visa */}
          <div className="documentnewstyle shadow p-3 mb-4 bg-body-tertiary rounded">
            <div className="contract">Visa Details</div>
            <div>
              <div className="row mb-2">
                <div className="col-4">
                  <label htmlFor="visa_number" className="form-label">
                    Visa Number:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="text"
                    className="form-control vessel-voyage"
                    id="visa_number"
                    placeholder=""
                    name="visa_number"
                    onChange={handleChange}
                    value={formData.visa_number}
                  />
                </div>
                <div className="col-3">
                  <label htmlFor="visa_expiry" className="form-label">
                    Date of Expiry:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="date"
                    className="form-control vessel-voyage"
                    id="visa_expiry"
                    placeholder=""
                    name="visa_expiry"
                    onChange={handleChange}
                    value={formData.visa_expiry}
                  />
                </div>
                {errors.message && (
                  <div className="alert alert-danger">{errors.message}</div>
                )}
                <div className="col-5">
                  <label htmlFor="visaupload" className="form-label">
                    Document Upload:
                  </label>
                  <input
                    className="form-control documentemployee"
                    type="file"
                    id="visaupload"
                    name="visaupload"
                    onChange={handleFileChange}
                    ref={fileInputRefVisa}
                  ></input>
                </div>
                {errors.visaDetailsErr && (
                  <span className="invalid">{errors.visaDetailsErr}</span>
                )}
              </div>
              <div className="mb-2 col-12">
                <div className="templatelink">Uploaded Files:</div>
                <div className="templateouter">
                  {uploadedFiles.visaupload && (
                    <div className="d-flex justify-content-between">
                      <div className="tempgenerated">
                        {uploadedFiles.visaupload.originalName}
                      </div>
                      <div className="d-flex">
                        <div
                          className="icondown"
                          onClick={() =>
                            window.open(
                              documentUrl + uploadedFiles.visaupload.url
                            )
                          }
                        >
                          <i className="bi bi-eye"></i>
                        </div>
                        <div
                          className="iconpdf"
                          onClick={() => handleDeleteFile("visaupload")}
                        >
                          <i className="bi bi-trash"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Visa end */}

          {/* License */}
          <div className="documentnewstyle shadow p-3 mb-4 bg-body-tertiary rounded">
            <div className="contract">License Details</div>
            <div>
              <div className="row mb-2     ">
                <div className="col-4">
                  <label htmlFor="license_number" className="form-label">
                    License Number:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="text"
                    className="form-control vessel-voyage"
                    id="license_number"
                    placeholder=""
                    name="license_number"
                    onChange={handleChange}
                    value={formData.license_number}
                  />
                </div>
                <div className="col-3">
                  <label htmlFor="license_date" className="form-label">
                    Date of Expiry:
                    {/* <span className="required"> * </span> */}
                  </label>
                  <input
                    type="date"
                    className="form-control vessel-voyage"
                    id="license_date"
                    placeholder=""
                    name="license_date"
                    onChange={handleChange}
                    value={formData.license_date}
                  />
                </div>
                <div className="col-5">
                  <label htmlFor="licenseupload" className="form-label">
                    Document Upload:
                  </label>
                  <input
                    className="form-control documentemployee"
                    type="file"
                    id="licenseupload"
                    name="licenseupload"
                    onChange={handleFileChange}
                    ref={fileInputRefLicence}
                  ></input>
                </div>
                {errors.licenceDetailsErr && (
                  <span className="invalid">{errors.licenceDetailsErr}</span>
                )}
              </div>
              <div className="mb-2 col-12">
                <div className="templatelink">Uploaded Files:</div>
                <div className="templateouter">
                  {uploadedFiles.licenseupload && (
                    <div className="d-flex justify-content-between">
                      <div className="tempgenerated">
                        {uploadedFiles.licenseupload.originalName}
                      </div>
                      <div className="d-flex">
                        <div
                          className="icondown"
                          onClick={() =>
                            window.open(
                              documentUrl + uploadedFiles.licenseupload.url
                            )
                          }
                        >
                          <i className="bi bi-eye"></i>
                        </div>
                        <div
                          className="iconpdf"
                          onClick={() => handleDeleteFile("licenseupload")}
                        >
                          <i className="bi bi-trash"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* license end */}

          {/* certificate */}
          <div className="documentnewstyle shadow p-3 mb-4 bg-body-tertiary rounded">
            <div className="contract">Certificate Details</div>
            <div>
              {/* Add more certificate reord */}
              {certificateFields.map((field) => (
                <div
                  key={isEditing ? field._id : field.id}
                  className="row mb-2"
                >
                  <div className="col-4">
                    <label
                      htmlFor={`certificate_name_${field._id || field.id}`}
                      className="form-label"
                    >
                      Certificate Name:
                    </label>
                    <input
                      type="text"
                      className="form-control vessel-voyage"
                      id={`certificate_name_${field._id || field.id}`}
                      name="certification"
                      value={field.certification}
                      onChange={(e) => {
                        const updatedFields = certificateFields.map((f) => {
                          if (
                            isEditing
                              ? f._id === field._id && f.id === field.id
                              : f.id === field.id
                          ) {
                            return { ...f, certification: e.target.value };
                          }
                          return f;
                        });
                        setCertificateFields(updatedFields);
                      }}
                    />
                  </div>
                  <div className="col-4">
                    <label
                      htmlFor={`certificate_description_${
                        field._id || field.id
                      }`}
                      className="form-label"
                    >
                      Certificate Description:
                    </label>
                    <div className="vessel-select">
                      <input
                        type="text"
                        className="form-control vessel-voyage"
                        id={`certificate_description_${field._id || field.id}`}
                        name="certificateDescription"
                        value={field.certificateDescription}
                        onChange={(e) => {
                          const updatedFields = certificateFields.map((f) => {
                            if (
                              isEditing
                                ? f._id === field._id && f.id === field.id
                                : f.id === field.id
                            ) {
                              return {
                                ...f,
                                certificateDescription: e.target.value,
                              };
                            }
                            return f;
                          });
                          setCertificateFields(updatedFields);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <label
                      htmlFor={`certificatesRecord_${field._id || field.id}`}
                      className="form-label"
                    >
                      Document Upload:
                    </label>
                    <input
                      className="form-control documentemployee"
                      type="file"
                      id={`certificatesRecord_${field._id || field.id}`}
                      name="certificatesRecord"
                      ref={(el) =>
                        (fileInputRefs.current[field._id || field.id] = el)
                      }
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          isEditing ? field._id || field.id : field.id
                        )
                      }
                    />
                  </div>
                  <div className="mb-2 col-12">
                    <div className="templatelink">Uploaded Files:</div>
                    <div className="templateouter">
                      {uploadedCertificateFiles[
                        isEditing ? field._id || field.id : field.id
                      ] && (
                        <div className="d-flex justify-content-between">
                          <div className="tempgenerated">
                            {
                              uploadedCertificateFiles[
                                isEditing ? field._id || field.id : field.id
                              ].originalName
                            }
                          </div>
                          <div className="d-flex">
                            <div
                              className="icondown"
                              onClick={() =>
                                window.open(
                                  documentUrl +
                                    uploadedCertificateFiles[
                                      isEditing
                                        ? field._id || field.id
                                        : field.id
                                    ].url
                                )
                              }
                            >
                              <i className="bi bi-eye"></i>
                            </div>
                            <div
                              className="iconpdf"
                              onClick={() =>
                                handleDeleteFile(
                                  "certificatesRecord",
                                  isEditing ? field._id || field.id : field.id
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div
                className="col-1 plusbutton"
                onClick={handleAddCertificateFields}
              >
                <i className="bi bi-plus-circle-fill"></i>
              </div>
            </div>
          </div>
          {/* certificate records end */}

          {/* medical */}
          <div className="documentnewstyle shadow p-3 mb-4 bg-body-tertiary rounded">
            <div className="contract">Medical Details</div>
            <div>
              {/* Add more medical reord */}
              {fields.map((field) => (
                <div
                  key={isEditing ? field._id : field.id}
                  className="row mb-2"
                >
                  <div className="col-4">
                    <label
                      htmlFor={`medical_description_${field._id || field.id}`}
                      className="form-label"
                    >
                      Medical description:
                    </label>
                    <input
                      type="text"
                      className="form-control vessel-voyage"
                      id={`medical_description_${field._id || field.id}`}
                      name="description"
                      value={field.description}
                      onChange={(e) => {
                        const updatedFields = fields.map((f) => {
                          if (
                            isEditing
                              ? f._id === field._id && f.id === field.id
                              : f.id === field.id
                          ) {
                            return { ...f, description: e.target.value };
                          }
                          return f;
                        });
                        setFields(updatedFields);
                      }}
                    />
                  </div>
                  <div className="col-4">
                    <label
                      htmlFor={`relationship_${field._id || field.id}`}
                      className="form-label"
                    >
                      Relationship:
                    </label>
                    <div className="vessel-select">
                      <select
                        name="relationship"
                        className="form-select vesselbox vboxholder"
                        id={`relationship_${field._id || field.id}`}
                        value={field.relationship}
                        onChange={(e) => {
                          const updatedFields = fields.map((f) => {
                            if (
                              isEditing
                                ? f._id === field._id && f.id === field.id
                                : f.id === field.id
                            ) {
                              return { ...f, relationship: e.target.value }; // ✅ Only update `relationship`
                            }
                            return f; // ✅ Keep other fields unchanged
                          });
                          setFields(updatedFields);
                        }}
                      >
                        <option value="">Choose Relation</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Husband">Husband</option>
                        <option value="Wife">Wife</option>
                        <option value="Child">Child</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-4">
                    <label
                      htmlFor={`medicalrord_${field._id || field.id}`}
                      className="form-label"
                    >
                      Document Upload:
                    </label>
                    <input
                      className="form-control documentemployee"
                      type="file"
                      id={`medicalrord_${field._id || field.id}`}
                      name="medicalrord"
                      ref={(el) =>
                        (fileInputRefs.current[field._id || field.id] = el)
                      }
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          isEditing ? field._id || field.id : field.id
                        )
                      }
                    />
                  </div>
                  <div className="mb-2 col-12">
                    <div className="templatelink">Uploaded Files:</div>
                    <div className="templateouter">
                      {uploadedMedicalFiles[
                        isEditing ? field._id || field.id : field.id
                      ] && (
                        <div className="d-flex justify-content-between">
                          <div className="tempgenerated">
                            {
                              uploadedMedicalFiles[
                                isEditing ? field._id || field.id : field.id
                              ].originalName
                            }
                          </div>
                          <div className="d-flex">
                            <div
                              className="icondown"
                              onClick={() =>
                                window.open(
                                  documentUrl +
                                    uploadedMedicalFiles[
                                      isEditing
                                        ? field._id || field.id
                                        : field.id
                                    ].url
                                )
                              }
                            >
                              <i className="bi bi-eye"></i>
                            </div>
                            <div
                              className="iconpdf"
                              onClick={() =>
                                handleDeleteFile(
                                  "medicalRecord",
                                  isEditing ? field._id || field.id : field.id
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-1 plusbutton" onClick={handleAddFields}>
                <i className="bi bi-plus-circle-fill"></i>
              </div>
            </div>
          </div>
          {/* Mecical records end */}

          <div className="btnuser">
            <button className="btn btna submit-button btnfsize">
              {" "}
              Submit{" "}
            </button>
          </div>
        </form>
      </div>

      {openPopUp && <PopUp message={message} closePopup={reloadpage} />}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default EditProfile;
