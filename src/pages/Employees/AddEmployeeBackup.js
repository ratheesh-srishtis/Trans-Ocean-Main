import React, { useState, useEffect, useRef } from "react";
import { json, useLocation, useNavigate } from "react-router-dom";
import {
  saveEmployee,
  uploadDocuments,
  editEmployee,
  getAllDesignations,
} from "../../services/apiEmployee";
import "../../css/payment.css";
import Swal from "sweetalert2";
import PopUp from "../PopUp";
const AddEmployee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = location.state?.isEditing || false;
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [passportName, setpassportName] = useState(null);
  const [passportUrl, setpassportUrl] = useState(null);
  const [contractName, setcontractName] = useState(null);
  const [contractUrl, setcontractUrl] = useState(null);
  const [visaName, setvisaName] = useState(null);
  const [visaUrl, setvisaUrl] = useState(null);
  const [certifcateName, setcertificateName] = useState(null);
  const [certificateUrl, setcertificateUrl] = useState(null);
  const [licenseName, setlicenseName] = useState(null);
  const [licenseUrl, setlicenseUrl] = useState(null);
  //const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadedMedicalFiles, setUploadedMedicalFiles] = useState({});
  const [openPopUp, setOpenPopUp] = useState(false);
  const fileInputRefPassport = useRef(null);
  const fileInputRefContract = useRef(null);
  const fileInputRefVisa = useRef(null);
  const fileInputRefCertificate = useRef(null);
  const fileInputRefLicence = useRef(null);
  const fileInputRefs = useRef({});
  const documentUrl = process.env.REACT_APP_ASSET_URL + "/";
  const [uploadedFiles, setUploadedFiles] = useState({
    passportupload:
      location.state?.passportDetails &&
      location.state.passportDetails.length > 0
        ? location.state.passportDetails[0].document
        : null,
    contractupload:
      location.state?.contractDetails &&
      location.state.contractDetails.length > 0
        ? location.state.contractDetails[0].document
        : null,
    visaupload:
      location.state?.visaDetails && location.state.visaDetails.length > 0
        ? location.state.visaDetails[0].document
        : null,
    certificateupload:
      location.state?.certificationDetails &&
      location.state.certificationDetails.length > 0
        ? location.state.certificationDetails[0].document
        : null,
    licenseupload:
      location.state?.licenseDetails && location.state.licenseDetails.length > 0
        ? location.state.licenseDetails[0].document
        : null,
  });
  const initialFields =
    location.state?.isEditing && location.state?.medicalRecordDetails?.length
      ? location.state.medicalRecordDetails
      : [{ id: 1, description: "", medicalrord: "" }];
  // console.log('EW::',initialFields);
  const [fields, setFields] = useState(initialFields);
  const handleAddFields = () => {
    const newField = {
      id: fields.length + 1,
      description: "",
      medicalrord: "",
    };
    setFields([...fields, newField]);
  };

  const existpassort = location.state?.passportDetails[0]?.document || "";
  const existcontract = location.state?.contractDetails[0]?.document || "";
  const existvisa = location.state?.visaDetails[0]?.document || "";
  const existcertificate =
    location.state?.certificationDetails[0]?.document || "";
  const existlicense = location.state?.licenseDetails[0]?.document || "";
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
      setUploadedMedicalFiles(initialFiles);
      setcertificateUrl(existcertificate.url);
      setcertificateName(existcertificate.originalName);
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
    existcertificate,
    existlicense,
  ]);
  const [formData, setFormData] = useState({
    employeeName: location.state?.employeeName || "",
    employeeLastName: location.state?.employeeLastName || "",
    dob: location.state?.dob || "",
    address: location.state?.address || "",
    nationality: location.state?.nationality || "",
    city: location.state?.city || "",
    state: location.state?.state || "",
    postcode: location.state?.postcode || "",
    contactNumber: location.state?.contactNumber || "",
    email: location.state?.email || "",
    passportNumber: location.state?.passportNumber || "",
    iqamaNumber: location.state?.iqamaNumber || "",
    dateOfJoining: location.state?.dateOfJoining || "",
    designation: location.state?.designation._id || "",
    //department:location.state?.department || '',
    officialEmail: location.state?.officialEmail || "",
    passportDetails: location.state?.passportDetails || [],
    passportdetail_number:
      location.state?.passportDetails[0]?.passportNumber || "",
    passportdetail_expiry:
      location.state?.passportDetails[0]?.dateOfExpiry || "",
    passportupload: uploadedFiles.passportupload
      ? uploadedFiles.passportupload.originalName
      : "",
    contractDetails: location.state?.contractDetails || [],
    contractdetail_name: location.state?.contractDetails[0]?.contractName || "",
    contractdetail_expiry:
      location.state?.contractDetails[0]?.dateOfExpiry || "",
    contractupload: uploadedFiles.contractupload
      ? uploadedFiles.contractupload.originalName
      : "",
    visaDetails: location.state?.visaDetails || [],
    visa_number: location.state?.visaDetails[0]?.visaNumber || "",
    visa_expiry: location.state?.visaDetails[0]?.dateOfExpiry || "",
    visaupload: uploadedFiles.visaupload
      ? uploadedFiles.visaupload.originalName
      : "",
    certificationDetails: location.state?.certificationDetails || [],
    cerificate_name:
      location.state?.certificationDetails[0]?.certification || "",
    certificateupload: uploadedFiles.certificateupload
      ? uploadedFiles.certificateupload.originalName
      : "",
    licenseDetails: location.state?.licenseDetails || [],
    license_number: location.state?.licenseDetails[0]?.licenseNumber || "",
    license_date: location.state?.licenseDetails[0]?.dateOfExpiry || "",
    licenseupload: uploadedFiles.licenseupload
      ? uploadedFiles.licenseupload.originalName
      : "",
    medicalRecordDetails: location.state?.medicalRecordDetails || [],
    medical_description: "",
  });
  const reloadpage = () => {
    navigate("/employee");
    //window.location.reload();
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeName)
      newErrors.employeeName = "First Name is required";
    if (!formData.employeeLastName)
      newErrors.employeeLastName = "Last Name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.nationality)
      newErrors.nationality = "Nationality is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.postcode) newErrors.postcode = "Post code is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact Number is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.passportNumber)
      newErrors.passportNumber = "Passport Number is required";
    if (!formData.iqamaNumber) newErrors.iqamaNumber = "Civil ID is required";
    if (!formData.dateOfJoining)
      newErrors.dateOfJoining = "Date of joining is required";
    if (!formData.designation)
      newErrors.designation = "Desigination is required";
    // if (!formData.department) newErrors.department = "Department is required";
    if (!formData.officialEmail)
      newErrors.officialEmail = "Official Email is required";
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
        "Ifs any passport field is filled, all fields must be filled.";
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
    // Certificate Details Validation

    const { cerificate_name, certificateupload } = formData;

    const isAnycertificateFieldFilled = cerificate_name || certificateupload;
    if (
      isAnycertificateFieldFilled &&
      !(cerificate_name && certificateupload)
    ) {
      newErrors.certificateDetailsErr =
        "If any certificate field is filled, all fields must be filled.";
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
  const handleDeleteFile = (fieldName) => {
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
            setpassportName("");
            setpassportUrl("");
            if (fileInputRefPassport.current) {
              fileInputRefPassport.current.value = null;
            }
            break;
          case "contractupload":
            setcontractName("");
            setcontractUrl("");
            if (fileInputRefContract.current) {
              fileInputRefContract.current.value = null;
            }
            break;
          case "visaupload":
            setvisaName("");
            setvisaUrl("");
            if (fileInputRefVisa.current) {
              fileInputRefVisa.current.value = null;
            }
            break;
          case "licenseupload":
            setlicenseName("");
            setlicenseUrl("");
            if (fileInputRefLicence.current) {
              fileInputRefLicence.current.value = null;
            }
            break;
          case "certificateupload":
            setcertificateName("");
            setcertificateUrl("");
            if (fileInputRefCertificate.current) {
              fileInputRefCertificate.current.value = null;
            }
            break;
          default:
            // Update uploaded medical files
            setUploadedMedicalFiles((prevFiles) => {
              //console.log('Before delete:', prevFiles);
              const { [fieldName]: deleted, ...updatedFiles } = prevFiles; // destructuring to remove the field
              //console.log('After delete:', updatedFiles);
              let updatedData = [];
              if (isEditing)
                updatedData = fields.filter(
                  (item) => (item._id || item.id) !== fieldName
                );
              else updatedData = fields.filter((item) => item.id !== fieldName);
              //console.log("HERR::",updatedData);
              setFields(updatedData);
              return { ...updatedFiles };
            });

            // Clear file input
            setFormData((prevData) => ({
              ...prevData,
              [fieldName]: { description: "", medicalrord: null },
            }));
            if (fileInputRefs.current[fieldName]) {
              fileInputRefs.current[fieldName].value = null;
            }
            break;
        }
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // if (!validateForm()) return;
    let newCertificateDetail = {};
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

      newCertificateDetail = {
        certification: formData.cerificate_name,
        document: {
          url: certificateUrl,
          originalName: certifcateName,
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
          .filter((field) => field.description || field.document)
          .map((field) => ({
            description: field.description,
            document: field.document,
          }));
      } else {
        //console.log(fields);
        medicalRecordDetails = fields
          .filter(
            (field) =>
              field.description || (field.medicalrord && field.medicalrord.url)
          )
          .map((field) => ({
            description: field.description,
            document: {
              url: field.medicalrord ? field.medicalrord.url : "",
              originalName: field.medicalrord
                ? field.medicalrord.originalName
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
      //if(certificateUrl)
      formData.certificationDetails = newCertificateDetail;
      //if(licenseUrl)
      formData.licenseDetails = newLicenceDetail;
      if (isEditing) formData.medicalRecordDetails = editmedicalRecordDetails;
      else formData.medicalRecordDetails = medicalRecordDetails;
      let response;
      if (isEditing) {
        formData.employeeId = location.state?.employeeId;
        response = await editEmployee(formData);
      } else {
        response = await saveEmployee(formData);
      }

      if (response.status === true) {
        setOpenPopUp(true);
        setMessage(response.message);
        fileInputRefPassport.current.value = "";
        fileInputRefContract.current.value = "";
        fileInputRefVisa.current.value = "";
        fileInputRefCertificate.current.value = "";
        fileInputRefLicence.current.value = "";
        setFormData({
          employeeName: "",
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
          designation: "",
          // department:"",
          officialEmail: "",
          passportdetail_number: "",
          passportdetail_expiry: "",
        });
      }
    } catch (error) {
      setMessage(error);
    }
  };
  const handleFileChange = async (event) => {
    const imageData = event.target.files[0];
    if (!imageData) return;
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
        case "certificateupload":
          setcertificateName(response.data[0].originalName);
          setcertificateUrl(response.data[0].url);
          setFormData((prevData) => ({
            ...prevData,
            certificateupload: response.data[0].originalName,
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
        default:
          const fieldId = event.target.id.split("_")[1]; // Extracting ID from the input ID

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
              if (field._id === parseInt(fieldId)) {
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
  };

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
          </div>
          <div className="Personal mt-3 mb-3">Official Information</div>
          <div className="row">
            <div className="col-3">
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

            <div className="col-3">
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
          </div>

          <div className="Personal mt-3 mb-3">Documents</div>
          {/* passport */}
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
          {/* passportend */}
          <div className="borderbtwagreements"></div>
          {/* contract */}
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
          {/* contract end */}
          <div className="borderbtwagreements"></div>
          {/* visa */}
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
          {/* Visa end */}
          {/* Certification */}
          <div className="contract">Certificate Details</div>
          <div>
            <div className="row mb-2">
              <div className="col-4">
                <label id="cerificate_name" className="form-label">
                  Certificate Name:
                  {/* <span className="required"> * </span> */}
                </label>
                <input
                  type="text"
                  className="form-control vessel-voyage"
                  id="cerificate_name"
                  placeholder=""
                  name="cerificate_name"
                  onChange={handleChange}
                  value={formData.cerificate_name}
                />
              </div>

              <div className="col-5">
                <label htmlFor="certificateupload" className="form-label">
                  Document Upload:
                </label>
                <input
                  className="form-control documentemployee"
                  type="file"
                  id="certificateupload"
                  name="certificateupload"
                  onChange={handleFileChange}
                  ref={fileInputRefCertificate}
                ></input>
              </div>
              {errors.certificateDetailsErr && (
                <span className="invalid">{errors.certificateDetailsErr}</span>
              )}
            </div>
            <div className="mb-2 col-12">
              <div className="templatelink">Uploaded Files:</div>
              <div className="templateouter">
                {uploadedFiles.certificateupload && (
                  <div className="d-flex justify-content-between">
                    <div className="tempgenerated">
                      {uploadedFiles.certificateupload.originalName}
                    </div>
                    <div className="d-flex">
                      <div
                        className="icondown"
                        onClick={() =>
                          window.open(
                            documentUrl + uploadedFiles.certificateupload.url
                          )
                        }
                      >
                        <i className="bi bi-eye"></i>
                      </div>
                      <div
                        className="iconpdf"
                        onClick={() => handleDeleteFile("certificateupload")}
                      >
                        <i className="bi bi-trash"></i>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Certiification end */}
          {/* License */}
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
          {/* license end */}
          {/* medical */}
          <div className="contract">Medical Details</div>
          <div>
            {/* Add more medical reord */}
            {fields.map((field) => (
              <div key={isEditing ? field._id : field.id} className="row mb-2">
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
                                    isEditing ? field._id || field.id : field.id
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
    </>
  );
};

export default AddEmployee;
